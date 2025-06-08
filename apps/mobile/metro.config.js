// apps/mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname; // apps/mobile
const workspaceRoot = path.resolve(projectRoot, '../..'); // KentNabiz kök dizini

const config = getDefaultConfig(projectRoot);

// 1. Workspace'i ve projenin kendi node_modules'ünü izleme listesine ekle
config.watchFolders = [workspaceRoot, path.resolve(projectRoot, 'node_modules')];

// 2. Metro'nun modülleri arayacağı yolları belirt
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'), // apps/mobile/node_modules
  path.resolve(workspaceRoot, 'node_modules'), // KentNabiz/node_modules (hoisted paketler için)
];

// 3. Babel runtime'ı doğrudan proje node_modules'ünden kullan
config.resolver.alias = {
  '@KentNabiz/design-tokens': path.resolve(workspaceRoot, 'packages/design-tokens/src'),
  '@kentnabiz/shared': path.resolve(workspaceRoot, 'packages/shared/src'),
  '@KentNabiz/ui': path.resolve(workspaceRoot, 'packages/ui/src'),
  '@babel/runtime': path.resolve(projectRoot, 'node_modules/@babel/runtime'),
};

// 4. Sembolik linkleri devre dışı bırak
config.resolver.unstable_enableSymlinks = false;

// 5. Babel runtime'ı modül aramasına dahil et
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// 6. Pnpm'in .pnpm dizinlerini blockla
config.resolver.blockList = [/.*\/\.pnpm\/.*/, /.*\\\.pnpm\\.*/];

// 7. ExtraNodeModules ile @babel/runtime'ı doğrudan tanımla
config.resolver.extraNodeModules = {
  '@babel/runtime': path.resolve(projectRoot, 'node_modules/@babel/runtime'),
  ...config.resolver.extraNodeModules,
};

// Debug: Metro'nun babel/runtime'ı nerede aradığını görmek için
console.log('Metro Config Debug:');
console.log('Project Root:', projectRoot);
console.log('Workspace Root:', workspaceRoot);
console.log('Babel Runtime Path:', path.resolve(projectRoot, 'node_modules/@babel/runtime'));
console.log(
  'Babel Runtime exists:',
  require('fs').existsSync(path.resolve(projectRoot, 'node_modules/@babel/runtime'))
);

module.exports = config;
