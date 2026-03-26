const path = require('path');
const fs = require('fs');

const findExecutable = () => {
    const cachePath = path.join(process.cwd(), '.cache/puppeteer');
    if (!fs.existsSync(cachePath)) {
        console.log('Cache path not found:', cachePath);
        return undefined;
    }

    const findFile = (dir, target) => {
        try {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    const found = findFile(fullPath, target);
                    if (found) return found;
                } else if (file === target) {
                    return fullPath;
                }
            }
        } catch (e) {
            console.error('Error reading dir:', dir, e.message);
        }
        return null;
    };

    return findFile(cachePath, 'chrome.exe') || findFile(cachePath, 'chrome');
};

const result = findExecutable();
console.log('Result:', result);
if (result) {
    console.log('Exists:', fs.existsSync(result));
}
