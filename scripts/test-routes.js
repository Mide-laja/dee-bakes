const { spawn } = require('child_process');
const http = require('http');

async function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', (err) => {
      resolve(`Error: ${err.message}`);
    });
  });
}

async function main() {
  console.log('Starting Next.js production server on port 3000...');
  const server = spawn('npx.cmd', ['next', 'start', '-p', '3000'], {
    shell: true,
    stdio: 'ignore',
  });

  // Wait 4 seconds for server to bind
  await new Promise((r) => setTimeout(r, 4000));

  const routes = [
    'http://localhost:3000/',
    'http://localhost:3000/menu',
    'http://localhost:3000/custom-cakes',
    'http://localhost:3000/track',
    'http://localhost:3000/admin/login',
  ];

  for (const url of routes) {
    const status = await checkUrl(url);
    console.log(`Route [${url}] => Status: ${status}`);
  }

  console.log('Stopping test server...');
  server.kill();
  process.exit(0);
}

main();
