import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { pool, appConfig } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';

export const register = async (req: Request, res: Response): Promise<void> => {
  if (!appConfig.features?.auth) {
    res.status(400).json({ error: 'Auth is disabled' });
    return;
  }
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  if (!appConfig.features?.auth) {
    res.status(400).json({ error: 'Auth is disabled' });
    return;
  }
  const { email, password } = req.body;
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!appConfig.features?.auth) {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as any).user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
