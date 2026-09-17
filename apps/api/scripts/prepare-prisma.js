const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Determine database URL from process.env or .env file
let databaseUrl = process.env.DATABASE_URL;

const envPath = path.resolve(__dirname, '../.env');
if (!databaseUrl && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/^\s*DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
  if (match) {
    databaseUrl = match[1].trim();
  }
}

// Determine target provider: 'postgresql' if URL starts with postgres, else 'sqlite'
const isPostgres = databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'));
const targetProvider = isPostgres ? 'postgresql' : 'sqlite';

const schemaPath = path.resolve(__dirname, '../src/prisma/schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.error(`[prepare-prisma] schema.prisma not found at ${schemaPath}`);
  process.exit(1);
}

let schemaContent = fs.readFileSync(schemaPath, 'utf-8');
const providerMatch = schemaContent.match(/datasource\s+db\s+\{[\s\S]*?provider\s*=\s*"([^"]+)"[\s\S]*?\}/);
const currentProvider = providerMatch ? providerMatch[1] : null;

let needsRegen = false;

if (currentProvider !== targetProvider) {
  console.log(`[prepare-prisma] Switching schema provider from "${currentProvider}" to "${targetProvider}" (DATABASE_URL: ${databaseUrl ? databaseUrl.split('@')[0].split(':')[0] : 'default'})`);
  schemaContent = schemaContent.replace(
    /(datasource\s+db\s+\{[\s\S]*?provider\s*=\s*)"[^"]+"/,
    `$1"${targetProvider}"`
  );
  fs.writeFileSync(schemaPath, schemaContent, 'utf-8');
  needsRegen = true;
}

// Also verify that @prisma/client is generated
const rootClientPath = path.resolve(__dirname, '../../node_modules/.prisma/client');
const localClientPath = path.resolve(__dirname, '../node_modules/.prisma/client');
const clientExists = fs.existsSync(rootClientPath) || fs.existsSync(localClientPath);

if (!clientExists || needsRegen) {
  console.log(`[prepare-prisma] Generating Prisma client for provider "${targetProvider}"...`);
  try {
    execSync('npx prisma generate --schema=src/prisma/schema.prisma', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl || (isPostgres ? databaseUrl : 'file:./dev.db') },
    });
  } catch (err) {
    console.error('[prepare-prisma] Failed to generate prisma client:', err.message);
    process.exit(1);
  }
} else {
  console.log(`[prepare-prisma] Prisma schema provider "${targetProvider}" is ready.`);
}
