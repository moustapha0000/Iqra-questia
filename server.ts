import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite Database (Point 4)
const db = new Database('app.db');

// Create table for recommendations
db.exec(`
  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    icon TEXT
  )
`);

// Seed data if empty
const stmt = db.prepare('SELECT COUNT(*) as count FROM recommendations');
const { count } = stmt.get() as { count: number };

if (count === 0) {
  const insert = db.prepare('INSERT INTO recommendations (title, description, icon) VALUES (?, ?, ?)');
  insert.run('Base de données SQL (SQLite)', 'Stocker des données relationnelles complexes comme la progression détaillée des utilisateurs, les statistiques globales et les classements.', 'Database');
  insert.run('Sécurité API & Rate Limiting', 'Protéger les routes backend contre les abus (DDoS, brute force) avec des middlewares comme express-rate-limit.', 'Shield');
  insert.run('Authentification Hybride', 'Combiner Firebase Auth côté client avec une validation sécurisée des tokens (JWT) côté serveur pour protéger les API.', 'Lock');
  insert.run('Génération de PDF / Certificats', 'Générer dynamiquement des certificats de réussite en PDF côté serveur lorsque l\'utilisateur termine un module.', 'FileText');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Full-stack platform is running!" });
  });

  // Point 4: API Route for Recommendations
  app.get("/api/recommendations", (req, res) => {
    try {
      const recommendations = db.prepare('SELECT * FROM recommendations').all();
      res.json(recommendations);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Example API route
  app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from the Express backend!" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
