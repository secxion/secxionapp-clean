// scripts/refactorRoutes.js
import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve('./src');
const FILE_TYPES = ['.js', '.jsx', '.ts', '.tsx'];

const SAFE_LINK_IMPORT = `import { SafeLink } from "@/Components/SafeLink";`;
const OBSCURE_ROUTE_IMPORT = `import { obscureRoute } from "@/utils/obscure";`;
const BACKUP_DIR = path.resolve('./scripts/backups');

// Mode: "refactor" or "revert"
const MODE = process.argv[2] || 'refactor';

const ensureBackupDir = () => {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
};

const backupFile = (filePath) => {
  const rel = path.relative(ROOT_DIR, filePath);
  const dest = path.join(BACKUP_DIR, rel + '.bak');
  const destDir = path.dirname(dest);
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(filePath, dest);
};

const restoreBackups = () => {
  const restoreFiles = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        restoreFiles(fullPath);
      } else if (file.endsWith('.bak')) {
        const rel = path.relative(BACKUP_DIR, fullPath).replace(/\.bak$/, '');
        const dest = path.join(ROOT_DIR, rel);
        fs.copyFileSync(fullPath, dest);
        console.log(`♻️ Reverted: ${rel}`);
      }
    }
  };
  restoreFiles(BACKUP_DIR);
  console.log('🔄 All files reverted to original.');
};

const insertImportIfMissing = (code, importLine) => {
  if (code.includes(importLine)) return code;

  const lines = code.split('\n');
  const index = lines.findIndex((line) => line.startsWith('import ')) + 1;
  lines.splice(index, 0, importLine);
  return lines.join('\n');
};

const updateCode = (code) => {
  let updated = code;
  let modified = false;

  // Replace <Link> with <SafeLink>
  if (/<Link(\s+[^>]*)>/.test(updated)) {
    updated = updated.replace(/<Link(\s+[^>]*)>/g, '<SafeLink$1>');
    updated = updated.replace(/<\/Link>/g, '</SafeLink>');
    updated = insertImportIfMissing(updated, SAFE_LINK_IMPORT);
    modified = true;
  }

  // Replace navigate("/...") with navigate(obscureRoute("/..."))
  if (/navigate\(["']\/[^"']+["']\)/.test(updated)) {
    updated = updated.replace(
      /navigate\(["']\/([^"']+)["']\)/g,
      'navigate(obscureRoute("/$1"))',
    );
    updated = insertImportIfMissing(updated, OBSCURE_ROUTE_IMPORT);
    modified = true;
  }

  // Replace import { Link } from 'react-router-dom' → SafeLink
  if (
    /import\s+\{\s*Link\s*\}\s+from\s+['"]react-router-dom['"]/.test(updated)
  ) {
    updated = updated.replace(
      /import\s+\{\s*Link\s*\}\s+from\s+['"]react-router-dom['"]/,
      SAFE_LINK_IMPORT,
    );
    modified = true;
  }

  return { updated, modified };
};

const walkDir = (dirPath) => {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (FILE_TYPES.includes(path.extname(file))) {
      let code = fs.readFileSync(fullPath, 'utf-8');
      const { updated, modified } = updateCode(code);

      if (modified && code !== updated) {
        backupFile(fullPath);
        fs.writeFileSync(fullPath, updated, 'utf-8');
        console.log(`✅ Updated: ${fullPath}`);
      }
    }
  }
};

const main = () => {
  if (MODE === 'revert') {
    restoreBackups();
  } else {
    ensureBackupDir();
    walkDir(ROOT_DIR);
    console.log('🚀 Refactor complete!');
  }
};

main();
