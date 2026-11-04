// src/utils/QRCode.ts
// Minimal pure-JS QR Code (ISO/IEC 18004) encoder.
// Byte-mode, ECC level L, auto-selects smallest version that fits the payload.
// No external dependencies — pairs with react-native-svg to render as SVG.

type BitBuffer = number[];

// ---- Galois field arithmetic (GF(256), primitive 0x11D) ----
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(function buildGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11D;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

function gfPolyMul(a: number[], b: number[]): number[] {
  const result = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] ^= gfMul(a[i], b[j]);
    }
  }
  return result;
}

// ---- Error correction code generators ----
// Generator polynomials for ECC level L, versions 1..40 (exponent count = 2*ecWords)
function generatorPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    poly = gfPolyMul(poly, [1, EXP[i]]);
  }
  return poly;
}

function rsEncode(data: number[], ecLen: number): number[] {
  const gen = generatorPoly(ecLen);
  const padded = data.concat(new Array(ecLen).fill(0));
  // Polynomial division remainder
  for (let i = 0; i < data.length; i++) {
    const coef = padded[i];
    if (coef === 0) continue;
    for (let j = 0; j < gen.length; j++) {
      padded[i + j] ^= gfMul(gen[j], coef);
    }
  }
  return padded.slice(data.length, data.length + ecLen);
}

// ---- QR layout tables (byte mode, ECC L) ----
// [dataCodewords, ecCodewords] per version for a single block (byte mode, EC L)
const VERSION_TABLE: Record<number, { totalDataBits: number; dataCodewords: number; ecPerBlock: number; blocks: number }> = {
  1: { totalDataBits: 152, dataCodewords: 19, ecPerBlock: 7, blocks: 1 },
  2: { totalDataBits: 272, dataCodewords: 34, ecPerBlock: 10, blocks: 1 },
  3: { totalDataBits: 440, dataCodewords: 55, ecPerBlock: 15, blocks: 1 },
  4: { totalDataBits: 640, dataCodewords: 80, ecPerBlock: 20, blocks: 1 },
  5: { totalDataBits: 864, dataCodewords: 108, ecPerBlock: 26, blocks: 1 },
  6: { totalDataBits: 1088, dataCodewords: 136, ecPerBlock: 18, blocks: 2 },
  7: { totalDataBits: 1232, dataCodewords: 154, ecPerBlock: 20, blocks: 2 },
  8: { totalDataBits: 1456, dataCodewords: 182, ecPerBlock: 24, blocks: 2 },
  9: { totalDataBits: 1728, dataCodewords: 216, ecPerBlock: 30, blocks: 2 },
  10: { totalDataBits: 2032, dataCodewords: 254, ecPerBlock: 18, blocks: 4 },
};

// ---- Encoding ----
function bitsToBytes(bits: BitBuffer): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | (bits[i + j] || 0);
    }
    bytes.push(b);
  }
  return bytes;
}

function encodeByteMode(text: string): { version: number; bytes: number[]; ecBytes: number[] } {
  // Convert string → bytes (UTF-8)
  const utf8 = Array.from(Buffer.from(text, 'utf8'));
  // Pick smallest version that fits
  let version = 1;
  for (; version <= 10; version++) {
    const v = VERSION_TABLE[version];
    // Mode (4 bits) + char count (8 for v1..9, 16 for v10..40 in byte mode)
    const ccBits = version < 10 ? 8 : 16;
    const dataBits = 4 + ccBits + (utf8.length * 8);
    if (dataBits <= v.totalDataBits) break;
  }
  if (version > 10) {
    throw new Error('QR payload too large (supports up to ~270 chars). Use a smaller payload.');
  }
  const v = VERSION_TABLE[version];
  const ccBits = version < 10 ? 8 : 16;

  // Build bitstream
  const bits: BitBuffer = [];
  // Mode indicator: 0100 = byte mode
  for (let i = 3; i >= 0; i--) bits.push((0b0100 >> i) & 1);
  // Char count
  for (let i = ccBits - 1; i >= 0; i--) bits.push((utf8.length >> i) & 1);
  // Data
  for (const byte of utf8) {
    for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
  }
  // Terminator (up to 4 zero bits, but not exceeding capacity)
  const remaining = v.totalDataBits - bits.length;
  for (let i = 0; i < Math.min(4, remaining); i++) bits.push(0);
  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);
  // Pad bytes (alternating 0xEC, 0x11)
  let bytes = bitsToBytes(bits);
  const padBytes = [0xEC, 0x11];
  let pi = 0;
  while (bytes.length < v.dataCodewords) {
    bytes.push(padBytes[pi % 2]);
    pi++;
  }
  // Generate ECC
  const ecBytes = rsEncode(bytes, v.ecPerBlock);
  return { version, bytes, ecBytes };
}

// ---- Module placement ----
function getModuleSize(version: number): number {
  return 17 + version * 2; // v1 = 21, v2 = 25, ...
}

function buildMatrix(version: number, finalBytes: number[]): boolean[][] {
  const size = getModuleSize(version);
  const matrix: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const reserved: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

  // Finder patterns
  const placeFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = row + r;
        const cc = col + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        reserved[rr][cc] = true;
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCorner = (r === 0 || r === 6) && (c === 0 || c === 6);
        const isOuter = r === -1 || r === 7 || c === -1 || c === 7;
        if (isOuter) matrix[rr][cc] = false;
        else matrix[rr][cc] = isBorder || (r >= 2 && r <= 4 && c >= 2 && c <= 4) || isCorner;
        if (isOuter) matrix[rr][cc] = false;
      }
    }
  };
  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
    reserved[6][i] = true;
    reserved[i][6] = true;
  }

  // Dark module (always at (size-8, 8))
  matrix[size - 8][8] = true;
  reserved[size - 8][8] = true;

  // Format info placeholders (filled later) — reserve their positions
  for (let i = 0; i < 9; i++) {
    if (i !== 6) reserved[8][i] = reserved[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][size - 1 - i] = reserved[size - 1 - i][8] = true;
  }

  // Place data modules in zig-zag, bottom-up, right two columns at a time
  const upward = true;
  let col = size - 1;
  let goingUp = true;
  let bitIdx = 0;
  const totalBits = finalBytes.length * 8;

  const isReservedArea = (r: number, c: number) => {
    if (r < 0 || c < 0 || r >= size || c >= size) return true;
    return reserved[r][c];
  };

  while (col > 0) {
    if (col === 6) col--; // skip vertical timing
    for (let i = 0; i < size; i++) {
      const row = goingUp ? size - 1 - i : i;
      for (let j = 0; j < 2; j++) {
        const c = col - j;
        if (isReservedArea(row, c)) continue;
        let bit = false;
        if (bitIdx < totalBits) {
          const byte = finalBytes[Math.floor(bitIdx / 8)];
          bit = ((byte >> (7 - (bitIdx % 8))) & 1) === 1;
        }
        matrix[row][c] = bit;
        bitIdx++;
      }
    }
    goingUp = !goingUp;
    col -= 2;
  }
  void upward;

  // Apply mask pattern 0 (i+j) % 2 === 0
  const mask = (r: number, c: number) => (r + c) % 2 === 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c] && mask(r, c)) {
        matrix[r][c] = !matrix[r][c];
      }
    }
  }

  // Format info bits for ECC L, mask 0
  // Format string (15 bits) computed via BCH(15,5)
  const ecLevelBits = 0b01; // L
  const maskPatternBits = 0b000;
  const data = (ecLevelBits << 3) | maskPatternBits;
  let rem = data;
  for (let i = 0; i < 10; i++) {
    rem = (rem << 1) ^ (((rem >> (14 - i)) & 1) * 0x537);
  }
  const formatBits = ((data << 10) | (rem & 0x3FF)) ^ 0b101010000010010;
  const fb: BitBuffer = [];
  for (let i = 14; i >= 0; i--) fb.push((formatBits >> i) & 1);

  // Place format bits — horizontal line (row 8)
  const setFmt = (r: number, c: number, bit: number) => { matrix[r][c] = bit === 1; };
  for (let i = 0; i <= 5; i++) setFmt(8, i, fb[i]);
  setFmt(8, 7, fb[6]);
  setFmt(8, 8, fb[7]);
  setFmt(8, 8, fb[7]);
  for (let i = 0; i < 7; i++) setFmt(8, size - 1 - i, fb[i + 8]);
  for (let i = 0; i <= 5; i++) setFmt(i, 8, fb[14 - i]);
  setFmt(7, 8, fb[8]);
  setFmt(8, 8, fb[7]);
  setFmt(size - 7, 8, fb[6]);
  for (let i = 0; i < 6; i++) setFmt(size - 6 + i, 8, fb[5 - i]);

  return matrix;
}

export interface QRCodeResult {
  version: number;
  size: number;       // modules per side
  matrix: boolean[][]; // matrix[row][col] true = dark module
}

export function encodeQR(text: string): QRCodeResult {
  const { version, bytes, ecBytes } = encodeByteMode(text);
  const finalBytes = bytes.concat(ecBytes);
  const matrix = buildMatrix(version, finalBytes);
  return { version, size: getModuleSize(version), matrix };
}
