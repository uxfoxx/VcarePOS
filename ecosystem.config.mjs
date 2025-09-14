export default {
  apps: [{
    name: 'vcare-pos-frontend',
    script: 'node',
    args: 'node_modules/serve/build/main.js -s dist -p 3001',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
