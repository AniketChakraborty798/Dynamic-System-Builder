import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Load config
const configPath = path.resolve(__dirname, '../../app-config.json');
export const appConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Initialize DB pool
export const pool = new Pool(
  process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        user: process.env.PGUSER || 'postgres',
        host: process.env.PGHOST || 'localhost',
        database: process.env.PGDATABASE || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        port: parseInt(process.env.PGPORT || '5432'),
      }
);

// Map config types to postgres types
const getPgType = (type: string) => {
  switch (type) {
    case 'string': return 'VARCHAR(255)';
    case 'number': return 'NUMERIC';
    case 'enum': return 'VARCHAR(255)';
    case 'boolean': return 'BOOLEAN';
    default: return 'VARCHAR(255)';
  }
};

export const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to Database');

    // Generate Users table if auth is enabled
    if (appConfig.features?.auth) {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Ensured users table exists');
    }

    // Dynamically generate models
    for (const model of appConfig.models || []) {
      const tableName = model.name.toLowerCase() + 's';
      let columns = [
        'id SERIAL PRIMARY KEY',
        'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
      ];

      if (model.userScoped) {
        columns.push('user_id INTEGER REFERENCES users(id) ON DELETE CASCADE');
      }

      for (const field of model.fields || []) {
        let colDef = `${field.name} ${getPgType(field.type)}`;
        if (field.required) colDef += ' NOT NULL';
        if (field.unique) colDef += ' UNIQUE';
        columns.push(colDef);
      }

      const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(', ')});`;
      await client.query(query);
      console.log(`Ensured dynamic table ${tableName} exists`);
    }

    client.release();
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};
