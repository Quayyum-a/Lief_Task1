const { spawn } = require('child_process');
const path = require('path');

// Start the backend server
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  env: { ...process.env, PORT: 5000 }
});

backend.on('error', (error) => {
  console.error('Backend server error:', error);
});

backend.on('exit', (code) => {
  console.log(`Backend server exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down backend server...');
  backend.kill('SIGINT');
  process.exit(0);
});

console.log('Backend server starting on port 5000...');
