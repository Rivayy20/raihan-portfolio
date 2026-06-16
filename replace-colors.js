import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('d:/2/Kuliah/Coding/PortoV2/src/components', function(filePath) {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace black rgba with var(--color-black)
    content = content.replace(/rgba\(10,10,10,1\)/g, 'var(--color-black)');
    // Replace white rgba with var(--color-white)
    content = content.replace(/rgba\(255,255,255,1\)/g, 'var(--color-white)');
    // Replace arbitrary border-black with border-[var(--color-black)] just in case, wait, border-black automatically works in Tailwind v4!
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
