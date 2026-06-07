const mysql = require('mysql2/promise');
require('dotenv').config({ override: true });

const host = process.env.DB_HOST || 'localhost';
const useSsl =
  process.env.DB_SSL === 'true' ||
  (host.includes('rlwy.net') || host.includes('railway'));

const pool = mysql.createPool({
  host,
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'github_analyzer',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

module.exports = pool;
