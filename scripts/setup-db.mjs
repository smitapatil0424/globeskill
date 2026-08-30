import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Helpers for terminal styling
const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

// 1. Load .env.local
function loadEnv() {
  const envPath = resolve(rootDir, '.env.local');
  const env = { ...process.env };

  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        env[key] = val;
      }
    }
  }
  return env;
}

async function runDatabaseSetup() {
  console.log(`\n${c.bright}${c.cyan}====================================================${c.reset}`);
  console.log(`${c.bright}${c.blue}  GlobeSkill Automatic Database Migration Engine${c.reset}`);
  console.log(`${c.bright}${c.cyan}====================================================${c.reset}\n`);

  const env = loadEnv();
  const dbUrl = env.DATABASE_URL;

  if (!dbUrl || dbUrl.includes('[password]') || dbUrl.includes('your-password')) {
    console.error(`${c.red}✖ ERROR: DATABASE_URL is not configured in .env.local!${c.reset}\n`);
    console.log(`To enable automatic table creation, please add your PostgreSQL connection string to .env.local:`);
    console.log(`\n  ${c.bright}DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres"${c.reset}\n`);
    console.log(`How to find this in Supabase:`);
    console.log(`  1. Open: https://supabase.com/dashboard/project/atjiaoqwgbhrodufcjhy/settings/database`);
    console.log(`  2. Scroll to "Connection string" -> Select "URI"`);
    console.log(`  3. Copy the string, replace [YOUR-PASSWORD] with your actual database password, and paste it into .env.local`);
    console.log(`\nThen re-run: ${c.bright}npm run db:setup${c.reset}\n`);
    process.exit(1);
  }

  const sqlFilePath = resolve(rootDir, 'supabase', 'setup_complete_database.sql');
  if (!existsSync(sqlFilePath)) {
    console.error(`${c.red}✖ Error: Setup SQL file not found at: ${sqlFilePath}${c.reset}`);
    process.exit(1);
  }

  console.log(`  ⏳ Reading schema definition: supabase/setup_complete_database.sql...`);
  const sqlContent = readFileSync(sqlFilePath, 'utf8');

  console.log(`  🔌 Connecting directly to PostgreSQL server...`);
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log(`  ${c.green}✔ Successfully connected to Supabase PostgreSQL server!${c.reset}\n`);

    console.log(`  🚀 Executing all-in-one schema, triggers, RLS policies, and seed data...`);
    console.log(`  ⏳ (This takes about 5 to 10 seconds)...`);

    await client.query(sqlContent);
    console.log(`\n  ${c.bright}${c.green}✔ Database migration executed successfully!${c.reset}\n`);

    // Verify created tables
    const checkQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    const res = await client.query(checkQuery);
    const tables = res.rows.map(r => r.table_name);

    console.log(`${c.bright}${c.blue}=== Verified Tables Created in Database ===${c.reset}`);
    tables.forEach(t => console.log(`  ${c.green}✔ Table:${c.reset} ${t}`));
    console.log(`\n${c.bright}${c.green}🎉 All tables and sample courses are live in your database!${c.reset}\n`);
  } catch (err) {
    console.error(`\n${c.red}✖ Migration failed with error:${c.reset}`, err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runDatabaseSetup();
