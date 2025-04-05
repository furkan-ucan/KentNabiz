/* eslint-disable */
// ya da sadece belirli kuralları devre dışı bırakabilirsin
/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/explicit-function-return-type */

const fs = require('fs');
const path = require('path');

const TARGET_DIRS = ['apps/api/src/modules', 'packages/shared/src'];
const TARGET_SUBFOLDERS = ['entities', 'dto', 'dtos', 'models', 'interfaces'];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) walkDir(dirPath, callback);
    else callback(path.join(dir, f));
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  const propertyRegex = /^(\s+(public |private |protected )?(readonly )?[\w\d]+)(\??): ([^;]+);/gm;

  content = content.replace(propertyRegex, (match, prefix, _, __, optional, type) => {
    // Opsiyonel (?) veya default (=) olanlar atlanır
    if (optional === '?' || /=/.test(match)) return match;

    updated = true;
    return `${prefix}!: ${type};`;
  });

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  }
}

TARGET_DIRS.forEach(baseDir => {
  TARGET_SUBFOLDERS.forEach(sub => {
    const targetPath = path.join(baseDir, sub);
    if (fs.existsSync(targetPath)) {
      walkDir(targetPath, processFile);
    }
  });
});
