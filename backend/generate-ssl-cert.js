const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create ssl directory if it doesn't exist
const sslDir = path.join(__dirname, 'ssl');
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir);
}

const keyPath = path.join(sslDir, 'key.pem');
const certPath = path.join(sslDir, 'cert.pem');

// Check if certificates already exist
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('SSL certificates already exist');
  process.exit(0);
}

try {
  console.log('Generating self-signed SSL certificate...');
  
  // Generate private key and certificate in one command
  const command = `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=US/ST=State/L=City/O=VCare/OU=Development/CN=localhost"`;
  
  execSync(command, { stdio: 'inherit' });
  
  console.log('SSL certificate generated successfully!');
  console.log(`Private key: ${keyPath}`);
  console.log(`Certificate: ${certPath}`);
  
} catch (error) {
  console.error('Error generating SSL certificate:', error.message);
  console.log('\nAlternative: You can generate certificates manually using:');
  console.log('1. Install OpenSSL (https://slproweb.com/products/Win32OpenSSL.html for Windows)');
  console.log('2. Run the following commands in the backend directory:');
  console.log('   mkdir ssl');
  console.log(`   openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=VCare/OU=Development/CN=localhost"`);
  process.exit(1);
}