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
    
    // Replace text-gray-xxx (if it doesn't already have dark:text-gray-300)
    content = content.replace(/(text-gray-[678]00)(?!\s*dark:text-gray-300)/g, '$1 dark:text-gray-300 transition-colors duration-300');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated gray text in', filePath);
    }
  }
});
