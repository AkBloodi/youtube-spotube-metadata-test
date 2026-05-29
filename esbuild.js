const { build } = require('esbuild');
const path = require('path');
const { entryPoint } = require('./plugin.json');

build({
  entryPoints: [path.join(__dirname, 'src', 'index.ts')],
  bundle: true,
  outfile: path.join(__dirname, 'index.js'),
  format: 'iife',
  globalName: 'PluginModule',
  footer: {
    js: 'for(var key in PluginModule) { this[key] = PluginModule[key]; }',
  },
}).catch(() => process.exit(1));
