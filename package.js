const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Get slug from plugin.json
const pluginJson = JSON.parse(fs.readFileSync('./plugin.json', 'utf8'));
const slug = pluginJson.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Output filename
const outputName = `${slug}.smplug`;

console.log('Creating plugin package...');

// Use Python to create the zip file (Python has built-in zipfile)
const pythonScript = `
import zipfile
import os

output_name = '${outputName}'
with zipfile.ZipFile(output_name, 'w', zipfile.ZIP_DEFLATED) as zf:
    zf.write('plugin.json', 'plugin.json')
    zf.write('index.js', 'index.js')
    
print(f'Created {output_name}')
import os
print(f'Size: {os.path.getsize(output_name) / 1024:.2f} KB')
`;

const proc = spawn('python3', ['-c', pythonScript], { cwd: __dirname });
proc.stdout.on('data', d => console.log(d.toString()));
proc.stderr.on('data', d => console.error(d.toString()));