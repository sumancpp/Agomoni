const { execSync } = require('child_process');
const path = require('path');

const apiDir = path.resolve(__dirname, '..');

console.log('[setup-python] Checking Python environment for local AI neural processing...');

try {
  const pyVer = execSync('python3 --version', { encoding: 'utf8' }).trim();
  console.log(`[setup-python] Detected runtime: ${pyVer}`);

  try {
    execSync('python3 -c "import numpy, cv2, insightface, onnxruntime"', { stdio: 'ignore' });
    console.log('[setup-python] All required packages (numpy, cv2, insightface, onnxruntime) are present.');
  } catch (checkErr) {
    console.log('[setup-python] Missing Python packages detected. Installing requirements for Render/production environment...');
    execSync('python3 -m pip install -r requirements.txt --no-cache-dir --quiet', {
      stdio: 'inherit',
      cwd: apiDir,
    });
    console.log('[setup-python] Python packages successfully installed.');
  }
} catch (err) {
  console.warn('[setup-python] Note: Python setup step bypassed:', err.message);
}
