import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { config } from 'dotenv';
config();

export const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export { db };