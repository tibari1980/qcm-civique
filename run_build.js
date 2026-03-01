const { execSync } = require('child_process');
const fs = require('fs');
try {
    console.log('Starting build...');
    const output = execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
    fs.writeFileSync('build_result.txt', output);
    console.log('Build completed successfully.');
} catch (e) {
    const errorMsg = 'Error Output:\n' + e.stdout + '\n' + e.stderr;
    fs.writeFileSync('build_result.txt', errorMsg);
    console.log('Build failed.');
}
