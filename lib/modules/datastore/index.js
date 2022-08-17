import fs from 'fs';
import pg from 'pg';

const pool = new (pg.native ?? pg).Pool({
  user:     process.env.POSTGRES_USER,
  host:     process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  port:     process.env.POSTGRES_PORT || 5432,
  password: fs.readFileSync('/run/secrets/POSTGRES_PASSWORD_FILE').toString().trim(),
  schema:   process.env.POSTGRES_SCHEMA,
  ssl:      parseInt(process.env.POSTGRES_SSL) === 1 ? {
    rejectUnauthorized: true,
    ca:                 fs.readFileSync('/run/secrets/POSTGRES_CA').toString(),
  } : null
});

export const query    = (text, params) => pool.query(text, params);
export const client   = () => pool.connect();
export const arrayArg = (arr, startIndex = 1) => {
  return arr.map((a, index) => {
    startIndex += index;
    return `$${startIndex}`;
  }).join(',');
};

