import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { users } from './schema'

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export { db };