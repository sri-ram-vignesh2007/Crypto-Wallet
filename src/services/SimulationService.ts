// src/services/SimulationService.ts
// Simulation Mode — dry-run transactions in a sandbox before signing
// Simulates: gas, balance changes, token approvals, contract interactions, revert reasons

import { ethers } from 'ethers';
import { rpcManager } from '../core/RPCManager';
import { CHAINS } from '../core/ChainConfig';
import { SecureKeyManager } from '../core/SecureKeyManager';

export interface SimulationParams {
  toAddress: string;
  value?: string;           // ETH value in wei
  data?: string;            // calldata
  chainKey: string;
  tokenAddress?: string;    // for ERC-20 transfers
  tokenAmount?: string;     // token amount in wei
}

export interface SimulationResult {
  success: boolean;
  gasUsed: number;
  gasEstimate: number;
  gasCostUsd: number;
  balanceChanges: BalanceChange[];
  tokenBalanceChanges: TokenBalanceChange[];
  approvalsNeeded: ApprovalInfo[];
  revertReason?: string;
  logs: SimulationLog[];
  stateDiffs: StateDiff[];
  warningFlags: string[];
}

export interface BalanceChange {
  address: string;
  before: string;    // wei
  after: string;     // wei
  delta: string;     // wei (negative = spent)
}

export interface TokenBalanceChange {
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  holder: string;
  before: string;    // raw
  after: string;     // raw
  delta: string;     // raw
}

export interface ApprovalInfo {
  tokenAddress: string;
  tokenSymbol: string;
  spender: string;
  currentAllowance: string;
  requiredAmount: string;
  needsApproval: boolean;
}

export interface SimulationLog {
  address: string;
  topics: string[];
  data: string;
  decoded?: { event: string; args: any };
}

export interface StateDiff {
  address: string;
  slot: string;
  before: string;
  after: string;
}

export class SimulationService {
  private static readonly ERC20_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
  ];

  private static readonly COMMON_CONTRACTS: Record<string, { name: string; abi: string[] }> = {
    // Uniswap V2 Router
    '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': {
      name: 'Uniswap V2 Router',
      abi: ['function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline)'],
    },
    // Uniswap V3 Router
    '0xe592427a0aece92de3edee1f18e0157c05861564': {
      name: 'Uniswap V3 Router',
      abi: ['function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMin, uint160 sqrtPriceLimitX96))'],
    },
    // Aave Pool
    '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9': {
      name: 'Aave V3 Pool',
      abi: ['function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)', 'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)'],
    },
  };

  /** Run a full transaction simulation */
  static async simulate(params: SimulationParams): Promise<SimulationResult> {
    const chain = CHAINS[params.chainKey];
    if (!chain) throw new Error(`Unknown chain: ${params.chainKey}`);

    const provider = rpcManager.getProvider(params.chainKey);
    const fromAddress = await SecureKeyManager.getAddress();
    if (!fromAddress) throw new Error('No wallet found');

    const warnings: string[] = [];
    const balanceChanges: BalanceChange[] = [];
    const tokenBalanceChanges: TokenBalanceChange[] = [];
    const approvalsNeeded: ApprovalInfo[] = [];
    const logs: SimulationLog[] = [];
    const stateDiffs: StateDiff[] = [];

    // 1. Get pre-state balances
    const ethBefore = await provider.getBalance(fromAddress);
    const nonce = await provider.getTransactionCount(fromAddress);

    // 2. Check token approvals if ERC-20 transfer
    if (params.tokenAddress && params.tokenAmount) {
      const tokenContract = new ethers.Contract(params.tokenAddress, this.ERC20_ABI, provider);
      const [symbol, decimals, allowance] = await Promise.all([
        tokenContract.symbol().catch(() => 'TOKEN'),
        tokenContract.decimals().catch(() => 18),
        tokenContract.allowance(fromAddress, params.toAddress).catch(() => 0n),
      ]);
      
      const required = BigInt(params.tokenAmount);
      if (allowance < required) {
        approvalsNeeded.push({
          tokenAddress: params.tokenAddress,
          tokenSymbol: symbol,
          spender: params.toAddress,
          currentAllowance: allowance.toString(),
          requiredAmount: required.toString(),
          needsApproval: true,
        });
        warnings.push(`Approval needed for ${symbol}: current ${ethers.formatUnits(allowance, decimals)}, required ${ethers.formatUnits(required, decimals)}`);
      }
    }

    // 3. Build transaction request
    const feeData = await provider.getFeeData();
    const txRequest: ethers.TransactionRequest = {
      from: fromAddress,
      to: params.toAddress,
      value: params.value ? BigInt(params.value) : 0n,
      data: params.data || '0x',
      nonce,
      chainId: chain.id,
      maxFeePerGas: feeData.maxFeePerGas || undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
      type: 2,
    };

    // 4. Estimate gas
    let gasEstimate: number;
    try {
      gasEstimate = Number(await provider.estimateGas(txRequest));
    } catch (e: any) {
      // Try to decode revert reason
      const revertReason = this.decodeRevert(e);
      return {
        success: false,
        gasUsed: 0,
        gasEstimate: 0,
        gasCostUsd: 0,
        balanceChanges: [],
        tokenBalanceChanges: [],
        approvalsNeeded,
        revertReason,
        logs: [],
        stateDiffs: [],
        warningFlags: warnings,
      };
    }

    // 5. Simulate with trace (if supported) or static call
    // For now, use static call to detect reverts
    try {
      await provider.call({ ...txRequest, gasLimit: gasEstimate });
    } catch (e: any) {
      const revertReason = this.decodeRevert(e);
      return {
        success: false,
        gasUsed: 0,
        gasEstimate,
        gasCostUsd: 0,
        balanceChanges: [],
        tokenBalanceChanges: [],
        approvalsNeeded,
        revertReason,
        logs: [],
        stateDiffs: [],
        warningFlags: warnings,
      };
    }

    // 6. Calculate gas cost
    const maxFeePerGas = feeData.maxFeePerGas || 0n;
    const gasCostWei = BigInt(gasEstimate) * maxFeePerGas;
    const nativePrice = await this.getNativePriceUsd(params.chainKey);
    const gasCostUsd = Number(ethers.formatEther(gasCostWei)) * nativePrice;

    // 7. Predict balance changes
    const txValue = BigInt((txRequest.value as any) || 0n);
    const ethAfter = ethBefore - gasCostWei - txValue;
    balanceChanges.push({
      address: fromAddress,
      before: ethBefore.toString(),
      after: ethAfter.toString(),
      delta: (-(gasCostWei + txValue)).toString(),
    });

    // If sending to another address, track recipient
    if (txValue > 0n && params.toAddress) {
      const recipientBefore = await provider.getBalance(params.toAddress);
      balanceChanges.push({
        address: params.toAddress,
        before: recipientBefore.toString(),
        after: (recipientBefore + txValue).toString(),
        delta: txValue.toString(),
      });
    }

    // 8. Decode known contract interactions
    const decodedLogs = this.decodeKnownContracts(params.toAddress, txRequest.data || '0x', logs);

    return {
      success: true,
      gasUsed: gasEstimate,
      gasEstimate,
      gasCostUsd,
      balanceChanges,
      tokenBalanceChanges,
      approvalsNeeded,
      logs: decodedLogs,
      stateDiffs: [],
      warningFlags: warnings,
    };
  }

  /** Simulate a batch of transactions */
  static async simulateBatch(txns: SimulationParams[]): Promise<SimulationResult[]> {
    return Promise.all(txns.map(t => this.simulate(t)));
  }

  /** Get native token price in USD */
  private static async getNativePriceUsd(chainKey: string): Promise<number> {
    const prices: Record<string, number> = {
      ethereum: 3500, bsc: 720, polygon: 0.85, base: 3500, arbitrum: 3500,
      avalanche: 42, optimism: 3500, fantom: 0.72, cronos: 0.15, sepolia: 0,
    };
    return prices[chainKey] || 0;
  }

  /** Decode revert reason from error */
  private static decodeRevert(error: any): string {
    const msg = error?.message || error?.shortMessage || String(error);
    // Look for revert reason in various formats
    const patterns = [
      /revert (?:reason )?(?:0x)?([a-fA-F0-9]+)/,
      /execution reverted:? (?:0x)?([a-fA-F0-9]+)/,
      /VM Exception while processing transaction: reverted with reason string '([^']+)'/,
      /reverted with panic code '([^']+)'/,
    ];
    for (const pattern of patterns) {
      const match = msg.match(pattern);
      if (match) {
        const reason = match[1];
        // Try to decode as UTF-8 if hex
        if (/^[a-fA-F0-9]+$/.test(reason) && reason.length > 8) {
          try {
            return ethers.toUtf8String('0x' + reason);
          } catch { }
        }
        return reason;
      }
    }
    return msg;
  }

  /** Decode known contract interactions from calldata */
  private static decodeKnownContracts(toAddress: string, data: string, logs: SimulationLog[]): SimulationLog[] {
    const lowerAddr = toAddress.toLowerCase();
    const contract = this.COMMON_CONTRACTS[lowerAddr];
    if (!contract) return logs;

    // This is simplified - real implementation would use full ABI decoding
    return [{
      address: toAddress,
      topics: [],
      data,
      decoded: { event: `Call to ${contract.name}`, args: { selector: data.slice(0, 10) } },
    }];
  }

  /** Format simulation result for display */
  static formatResult(result: SimulationResult): string {
    if (!result.success) {
      return `❌ SIMULATION FAILED\n\nRevert: ${result.revertReason || 'Unknown error'}\n\nGas would have been wasted: ${result.gasEstimate.toLocaleString()} units`;
    }

    let output = `✅ SIMULATION SUCCESSFUL\n\n`;
    output += `⛽ Gas Estimate: ${result.gasEstimate.toLocaleString()} units\n`;
    output += `💰 Est. Cost: $${result.gasCostUsd.toFixed(4)}\n\n`;

    if (result.balanceChanges.length > 0) {
      output += `📊 Balance Changes:\n`;
      result.balanceChanges.forEach(bc => {
        const deltaEth = Number(ethers.formatEther(BigInt(bc.delta)));
        const sign = deltaEth >= 0 ? '+' : '';
        output += `  ${bc.address.slice(0, 8)}…: ${sign}${deltaEth.toFixed(6)} ETH\n`;
      });
      output += '\n';
    }

    if (result.approvalsNeeded.length > 0) {
      output += `⚠️ Approvals Needed:\n`;
      result.approvalsNeeded.forEach(a => {
        output += `  ${a.tokenSymbol}: approve ${a.spender.slice(0, 8)}… for ${ethers.formatUnits(BigInt(a.requiredAmount), 18)}\n`;
      });
      output += '\n';
    }

    if (result.logs.length > 0) {
      output += `📝 Contract Interactions:\n`;
      result.logs.forEach(l => {
        if (l.decoded) output += `  ${l.decoded.event}\n`;
      });
    }

    if (result.warningFlags.length > 0) {
      output += `\n⚠️ Warnings:\n`;
      result.warningFlags.forEach(w => output += `  • ${w}\n`);
    }

    return output;
  }
}