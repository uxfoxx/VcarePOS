export default {
  apps: [{
    name: 'vcare-pos-frontend',
    script: 'npx',
    args: 'serve -s dist -p 3001',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      PM2_SERVE_PATH: 'dist',
      PM2_SERVE_PORT: 3001,
      PM2_SERVE_SPA: 'true',
      NODE_ENV: 'production'
    }
  }]
};
