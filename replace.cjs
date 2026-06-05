const fs = require('fs');
const path = require('path');

const excludeDirs = ['.git', 'node_modules', '.next', 'dist', 'build', '.gemini'];
const includeExts = ['.ts', '.tsx', '.js', '.jsx', '.md', '.json', '.html', '.css', '.mjs', '.sol'];

function walkAndReplace(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        walkAndReplace(fullPath);
      }
    } else {
      const ext = path.extname(file);
      if (includeExts.includes(ext) || file === '.env.example' || file === '.env.local' || file.includes('config')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let changed = false;

        if (content.includes('Recibo') || content.includes('recibo') || content.includes('RECIBO')) {
          content = content.replace(/Recibo/g, 'Ruphex');
          content = content.replace(/recibo/g, 'ruphex');
          content = content.replace(/RECIBO/g, 'RUPHEX');
          changed = true;
        }

        if (changed) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Updated: ${fullPath}`);
        }
      }
    }
  }
}

walkAndReplace(__dirname);
