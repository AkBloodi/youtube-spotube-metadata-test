const { build } = require('esbuild');
const path = require('path');
const fs = require('fs');
const { createWriteStream } = require('fs');
const { pipeline } = require('stream');
const { promisify } = require('util');

const pump = promisify(pipeline);

async function main() {
  // Bundle the TypeScript source
  console.log('Building plugin...');
  
  await build({
    entryPoints: [path.join(__dirname, 'src', 'index.ts')],
    bundle: true,
    outfile: path.join(__dirname, 'index.js'),
    format: 'iife',
    globalName: 'PluginModule',
    footer: {
      js: 'for(var key in PluginModule) { this[key] = PluginModule[key]; }',
    },
    external: [],
    platform: 'browser',
    target: ['chrome80', 'firefox80', 'safari13'],
  });
  
  console.log('Plugin bundled successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});