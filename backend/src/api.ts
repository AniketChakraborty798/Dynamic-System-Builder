import { Router, Request, Response } from 'express';
import { pool, appConfig } from './db';
import { requireAuth } from './auth';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Helper to build queries dynamically
const buildInsertQuery = (tableName: string, data: any) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  
  return {
    text: `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
    values
  };
};

const buildUpdateQuery = (tableName: string, id: number, data: any) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setString = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
  
  return {
    text: `UPDATE ${tableName} SET ${setString} WHERE id = $1 RETURNING *`,
    values: [id, ...values]
  };
};

// Generate CRUD endpoints for each model
(appConfig.models || []).forEach((model: any) => {
  const tableName = model.name.toLowerCase() + 's';
  const path = `/${tableName}`;
  
  // Create middleware array
  const middlewares = model.userScoped ? [requireAuth] : [];

  // GET All
  router.get(path, middlewares, async (req: Request, res: Response) => {
    try {
      let query = `SELECT * FROM ${tableName}`;
      let values: any[] = [];
      
      if (model.userScoped && (req as any).user) {
        query += ` WHERE user_id = $1`;
        values.push((req as any).user.id);
      }
      query += ` ORDER BY created_at DESC`;
      
      const result = await pool.query(query, values);
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET One
  router.get(`${path}/:id`, middlewares, async (req: Request, res: Response) => {
    try {
      let query = `SELECT * FROM ${tableName} WHERE id = $1`;
      let values: any[] = [req.params.id];
      
      if (model.userScoped && (req as any).user) {
        query += ` AND user_id = $2`;
        values.push((req as any).user.id);
      }
      
      const result = await pool.query(query, values);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST Create
  router.post(path, middlewares, async (req: Request, res: Response) => {
    try {
      const data = { ...req.body };
      if (model.userScoped && (req as any).user) {
        data.user_id = (req as any).user.id;
      }
      
      // Basic validation
      for (const field of model.fields || []) {
        if (field.required && !data[field.name]) {
          return res.status(400).json({ error: `${field.name} is required` });
        }
      }
      
      const query = buildInsertQuery(tableName, data);
      const result = await pool.query(query.text, query.values);
      res.status(201).json(result.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT Update
  router.put(`${path}/:id`, middlewares, async (req: Request, res: Response) => {
    try {
      // First check if exists and belongs to user
      let checkQuery = `SELECT id FROM ${tableName} WHERE id = $1`;
      let checkValues: any[] = [req.params.id];
      if (model.userScoped && (req as any).user) {
         checkQuery += ` AND user_id = $2`;
         checkValues.push((req as any).user.id);
      }
      const checkRes = await pool.query(checkQuery, checkValues);
      if (checkRes.rows.length === 0) return res.status(404).json({ error: 'Not found or unauthorized' });

      const query = buildUpdateQuery(tableName, parseInt(req.params.id as string), req.body);
      const result = await pool.query(query.text, query.values);
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE
  router.delete(`${path}/:id`, middlewares, async (req: Request, res: Response) => {
    try {
      let query = `DELETE FROM ${tableName} WHERE id = $1`;
      let values: any[] = [req.params.id];
      
      if (model.userScoped && (req as any).user) {
        query += ` AND user_id = $2`;
        values.push((req as any).user.id);
      }
      
      const result = await pool.query(query, values);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // CSV Import (Feature 2)
  if (appConfig.features?.csvImport) {
    router.post(`${path}/import`, [upload.single('file'), ...middlewares], async (req: Request, res: Response) => {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      
      const results: any[] = [];
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
           if (model.userScoped && (req as any).user) {
             data.user_id = (req as any).user.id;
           }
           results.push(data);
        })
        .on('end', async () => {
          try {
            // Bulk insert (simplistic loop for demo)
            let insertedCount = 0;
            for (const row of results) {
               try {
                 const query = buildInsertQuery(tableName, row);
                 await pool.query(query.text, query.values);
                 insertedCount++;
               } catch (e) {
                 console.error('Failed to insert row:', e);
               }
            }
            fs.unlinkSync(req.file!.path);
            res.json({ success: true, imported: insertedCount, total: results.length });
          } catch (err: any) {
            res.status(500).json({ error: err.message });
          }
        });
    });
  }
});

export default router;
