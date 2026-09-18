const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const apiDir = path.resolve(__dirname, '..');
const venvDir = path.resolve(apiDir, '.venv');
const venvPy = path.resolve(venvDir, 'bin/python');
const venvPip = path.resolve(venvDir, 'bin/pip');

console.log('[setup-python] Checking Python environment for local AI neural processing...');

function isReady(pythonBin) {
  try {
    execSync(`"${pythonBin}" -c "import numpy, cv2, insightface, onnxruntime"`, { stdio: 'ignore' });
    return true;
  } catch (_) {
    return false;
  }
}

try {
  // 1. If venv already exists and has all packages, we are done
  if (fs.existsSync(venvPy) && isReady(venvPy)) {
    console.log('[setup-python] Virtualenv is verified with numpy, cv2, insightface, onnxruntime.');
    process.exit(0);
  }

  // 2. If system python already has all packages, we are done
  if (isReady('python3')) {
    console.log('[setup-python] System Python already has all required packages.');
    process.exit(0);
  }

  // 3. Try to create virtual environment if not present
  if (!fs.existsSync(venvPy)) {
    console.log(`[setup-python] Attempting to create Python virtualenv at ${venvDir}...`);
    try {
      execSync('python3 -m venv .venv', { cwd: apiDir, stdio: 'inherit' });
    } catch (venvErr) {
      console.warn('[setup-python] venv creation failed:', venvErr.message);
    }
  }

  // 4. If venv pip exists, install into virtualenv
  if (fs.existsSync(venvPip)) {
    console.log('[setup-python] Installing requirements into .venv for Render/production...');
    try {
      execSync(`"${venvPip}" install --upgrade pip --quiet`, { cwd: apiDir, stdio: 'inherit' });
    } catch (_) {}
    execSync(`"${venvPip}" install -r requirements.txt --no-cache-dir`, { cwd: apiDir, stdio: 'inherit' });
    if (isReady(venvPy)) {
      console.log('[setup-python] All Python dependencies successfully installed and verified in .venv!');
      process.exit(0);
    }
  }

  // 5. Fallback: try direct pip install with --break-system-packages (for Debian/Ubuntu without venv)
  console.log('[setup-python] Trying direct pip install with --break-system-packages...');
  try {
    execSync('python3 -m pip install --break-system-packages -r requirements.txt --no-cache-dir', {
      cwd: apiDir,
      stdio: 'inherit',
    });
    if (isReady('python3')) {
      console.log('[setup-python] All Python dependencies successfully installed in system python!');
      process.exit(0);
    }
  } catch (directErr) {
    console.warn('[setup-python] Direct pip install failed:', directErr.message);
  }
} catch (err) {
  console.warn('[setup-python] Python setup note:', err.message);
}
