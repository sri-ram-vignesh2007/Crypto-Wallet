// index.ts
// POLYFILLS MUST BE IMPORTED FIRST BEFORE ALL OTHER MODULES
import './src/polyfills';

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);
