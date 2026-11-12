const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'build', 'swc', 'index.js');
if (fs.existsSync(target)) {
  let content = fs.readFileSync(target, 'utf8');
  
  // Replace isWebContainer check to force wasm
  content = content.replace(
    'const isWebContainer = process.versions.webcontainer;',
    'const isWebContainer = true;'
  );

  // Fix pkgPath resolution for wasm
  content = content.replace(
    /let pkgPath = [^\n;]+;/,
    "let pkgPath = require.resolve(pkg + '/wasm.js');"
  );

  fs.writeFileSync(target, content, 'utf8');
  console.log('Successfully patched Next.js swc loader to use WASM.');
} else {
  console.error('Target swc index.js not found at', target);
}
