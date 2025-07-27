# VcarePOS

VcarePOS is a point of sale system for managing retail operations.

## Running the Application

### Backend

The backend is a Node.js application that can be run in development mode or production mode using PM2.

#### Development Mode

```bash
cd backend
npm install
npm run dev
```

#### Production Mode with PM2

PM2 allows the backend to run continuously in the background:

```bash
cd backend
npm install
npm run pm2:start        # Basic start with PM2
```

Or using the ecosystem configuration:

```bash
npm run pm2:start:config  # Start using ecosystem.config.js
npm run pm2:start:prod    # Start in production environment
```

#### Managing the Backend with PM2

```bash
npm run pm2:stop         # Stop the backend
npm run pm2:restart      # Restart the backend
npm run pm2:status       # Check backend status
npm run pm2:logs         # View backend logs
npm run pm2:delete       # Remove from PM2
```

### Frontend

The frontend is a React application built with Vite that can be run in development mode or production mode.

#### Development Mode

```bash
npm install
npm run dev
```

#### Production Mode with PM2

```bash
npm install
npm run start:prod       # Build and serve with PM2
```

Or using the ecosystem configuration:

```bash
npm run build            # Build the frontend
npm run pm2:start:config # Serve using ecosystem.config.js
```

#### Managing the Frontend with PM2

```bash
npm run pm2:stop         # Stop the frontend
npm run pm2:restart      # Restart the frontend
npm run pm2:status       # Check frontend status
npm run pm2:logs         # View frontend logs
npm run pm2:delete       # Remove from PM2
```

## PM2 Configuration

Both the frontend and backend use PM2 for process management in production:

### Backend PM2 Features
- Auto-restart on crashes
- Memory limit of 1GB
- Environment-specific configuration

### Frontend PM2 Features
- Serves static files from the `dist` directory
- Runs on port 3001 by default
- Single-page application (SPA) mode enabled
- Auto-restart on crashes

## API Documentation

The API documentation is available at:
- Development: http://localhost:3000/api/docs
- Production: http://68.183.182.142/api/docs
