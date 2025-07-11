# VCare POS System - Setup and Run Instructions

This document provides detailed instructions for setting up and running the VCare POS System, which consists of a React frontend and a Node.js Express backend with PostgreSQL database.

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- PostgreSQL (v12 or higher)

## Database Setup

1. Install PostgreSQL if you haven't already:
   - [PostgreSQL Downloads](https://www.postgresql.org/download/)

2. Create a new PostgreSQL database:
   ```sql
   CREATE DATABASE vcare_pos;
   ```

3. Create a database user (or use an existing one):
   ```sql
   CREATE USER vcare_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE vcare_pos TO vcare_user;
   ```

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content (adjust values as needed):
   ```
   # Backend Environment Variables
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=vcare_pos
   DB_USER=vcare_user
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   PORT=3000
   ```

4. Initialize the database:
   ```bash
   node src/init-db.js
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Frontend Setup

1. Navigate to the project root directory.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   # Frontend Environment Variables
   VITE_API_URL=http://localhost:3000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Default Users

The system comes with three default users:

1. **Administrator**
   - Username: admin
   - Password: admin123
   - Full access to all modules

2. **Manager**
   - Username: manager1
   - Password: manager123
   - Access to most operational modules

3. **Cashier**
   - Username: cashier1
   - Password: cashier123
   - Limited access to POS and basic functions

## Building for Production

1. Build the frontend:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist` directory, which can be served by any static file server.

3. For the backend, you can use a process manager like PM2:
   ```bash
   npm install -g pm2
   cd backend
   pm2 start src/index.js --name vcare-backend
   ```

## Troubleshooting

- **Database Connection Issues**: Ensure PostgreSQL is running and the credentials in the `.env` file are correct.
- **API Connection Issues**: Check that the backend server is running and the `VITE_API_URL` in the frontend `.env` file points to the correct URL.
- **Authentication Issues**: If you can't log in, try using the default admin credentials. If that fails, check the backend logs for any JWT or authentication errors.

## Additional Information

- The backend API documentation is available in the `backend/README.md` file.
- For development purposes, authentication is disabled in the frontend. To enable it, uncomment the authentication check in `src/App.jsx`.