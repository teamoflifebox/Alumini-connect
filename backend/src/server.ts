import { createApp } from './createApp';
import pool from './config/database';
import { env } from './config/env';
import { connectRedis } from './config/redis';
import { socketService } from './services/socket.service';

const PORT = env.PORT;

const startServer = async () => {
  try {
    await connectRedis();

    if (env.GOOGLE_CLIENT_ID) {
      console.log('Google OAuth: configured');
    } else {
      console.warn('Google OAuth: GOOGLE_CLIENT_ID is not set in .env');
    }

    const client = await pool.connect();
    console.log('Database connection established successfully.');
    client.release();

    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });

    // Initialize Socket.IO
    socketService.init(server);

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `Port ${PORT} is already in use. Stop the other process or change PORT in .env`
        );
      } else {
        console.error('Server failed to start:', err.message);
      }
      process.exit(1);
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Failed to start server:', message);

    if (message.includes('password authentication failed')) {
      console.error('Database login failed. Check DB_PASSWORD in .env');
    }

    process.exit(1);
  }
};

startServer();
