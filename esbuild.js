const { build } = require('esbuild');
const path = require('path');

const entryPoint = process.argv[2] || 'src/index.ts';
const outfile = process.argv[3] || 'index.js';

build({
  entryPoints: [path.join(__dirname, entryPoint)],
  bundle: true,
  outfile: path.join(__dirname, outfile),
  format: 'iife',
  globalName: 'PluginModule',
  footer: {
    js: 'for(var key in PluginModule) { this[key] = PluginModule[key]; }',
  },
}).catch(() => process.exit(1));
