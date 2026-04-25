const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                results = results.concat(walk(fullPath));
            }
        } else {
            if (fullPath.match(/\.(tsx|ts|css|html)$/)) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const frontendDir = 'd:/ManagerClinic/frontend';
process.chdir(frontendDir);

const files = walk('src');
// Include index.html in the root as well
files.push('index.html');

console.log(`Searching through ${files.length} files...`);

let updateCount = 0;
files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        let updated = false;

        if (content.includes('mi-') || content.includes('dark-')) {
            // Replace mi- subclasses while preserving prefix if possible, 
            // but simple string replace is usually fine for Tailwind classes.
            content = content.replace(/mi-/g, 'slate-').replace(/dark-/g, 'slate-');
            updated = true;
        }

        if (updated) {
            fs.writeFileSync(file, content);
            updateCount++;
            console.log(`Updated: ${file}`);
        }
    } catch (err) {
        console.error(`Error processing ${file}: ${err.message}`);
    }
});

console.log(`Done! Updated ${updateCount} files.`);
