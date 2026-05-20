import { Pool } from 'pg';
import { env } from './env';

const buildConnectionString = (): string => {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  return `postgresql://${encodeURIComponent(env.DB_USER)}:${encodeURIComponent(env.DB_PASSWORD)}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;
};

const pool = new Pool({
  connectionString: buildConnectionString(),
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

export default pool;
