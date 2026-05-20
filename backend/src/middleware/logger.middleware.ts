import morgan from 'morgan';
import { env } from '../config/env';

/** HTTP request logging — verbose in development, concise in production */
export const requestLogger =
  env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev');
