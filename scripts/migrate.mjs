import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS user_data (
    user_id text NOT NULL,
    year text NOT NULL,
    picks jsonb NOT NULL DEFAULT '[]',
    schedule jsonb NOT NULL DEFAULT '[]',
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, year)
  )
`;

console.log('user_data table ready');
