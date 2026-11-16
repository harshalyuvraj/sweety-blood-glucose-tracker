import pool from '../config/database.js';

export const query = (text, params) => {
  return pool.query(text, params);
};

export const getClient = () => {
  return pool.connect();
};

export const closePool = () => {
  return pool.end();
};
