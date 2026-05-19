import app from './app';
import pool from './core/config/db';

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Check DB connection before starting server
    const client = await pool.connect();
    console.log('Database connection established successfully.');
    client.release();

    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
