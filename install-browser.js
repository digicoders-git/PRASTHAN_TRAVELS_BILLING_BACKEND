const { execSync } = require('child_process');

try {
  console.log('Installing Chrome for Puppeteer on Render...');
  execSync('node node_modules/puppeteer/install.mjs', { stdio: 'inherit' });
} catch (error) {
  console.error('Browser installation error:', error.message);
  // Fallback if the path is different
  try {
    execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
  } catch (err) {
    console.error('Final fallback failed:', err.message);
  }
}
