import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite Database
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

// Create table for playlists
db.exec(`
  CREATE TABLE IF NOT EXISTS playlists (
    key TEXT PRIMARY KEY,
    id TEXT,
    title TEXT,
    desc TEXT
  )
`);

// Seed recommendations if empty
const stmt = db.prepare('SELECT COUNT(*) as count FROM recommendations');
const { count } = stmt.get() as { count: number };

if (count === 0) {
  const insert = db.prepare('INSERT INTO recommendations (title, description, icon) VALUES (?, ?, ?)');
  insert.run('Base de données SQL (SQLite)', 'Stocker des données relationnelles complexes comme la progression détaillée des utilisateurs, les statistiques globales et les classements.', 'Database');
  insert.run('Sécurité API & Rate Limiting', 'Protéger les routes backend contre les abus (DDoS, brute force) avec des middlewares comme express-rate-limit.', 'Shield');
  insert.run('Authentification Hybride', 'Combiner Firebase Auth côté client avec une validation sécurisée des tokens (JWT) côté serveur pour protéger les API.', 'Lock');
  insert.run('Génération de PDF / Certificats', 'Générer dynamiquement des certificats de réussite en PDF côté serveur lorsque l\'utilisateur termine un module.', 'FileText');
}

// Seed playlists if empty
const playlistCountStmt = db.prepare('SELECT COUNT(*) as count FROM playlists');
const { count: playlistCount } = playlistCountStmt.get() as { count: number };

if (playlistCount === 0) {
  const insertPlaylist = db.prepare('INSERT INTO playlists (key, id, title, desc) VALUES (?, ?, ?, ?)');
  insertPlaylist.run('fondements', 'PLIGduk3xgf7vUmw3ast92nSWYXpKp0766', "Fondements ('Aqida)", "La croyance islamique : Tawhid, Anges, Livres, Prophètes, Jour du Jugement et Destin.");
  insertPlaylist.run('piliers', 'PLIGduk3xgf7s92i26Klb0Y9d-j8cbqtVE', "Piliers (Al-Ibadat)", "La pratique religieuse : Purification, Prière, Zakat, Jeûne et Pèlerinage (basé sur Al-Akhdari).");
  insertPlaylist.run('fiqh', 'PLIGduk3xgf7vJHjaplWM9LeRUDM1kBPh5', "Fiqh (Jurisprudence)", "Les règles de vie au quotidien : Halal/Haram, comportement, relations sociales et commerce.");
  insertPlaylist.run('hadiths', 'PLIGduk3xgf7t4G6itxwTzOT_cipUAXiTg', "Hadiths & Sagesse", "Les paroles du Prophète ﷺ et les leçons de vie (basé sur les 40 Hadiths de l'Imam An-Nawawi).");
  insertPlaylist.run('burdah', 'PLIGduk3xgf7vZ6STWEmt4bN0-xnLWVSue', "Spiritualité (Burdah)", "Adoucir les cœurs et renforcer le lien affectif avec le Prophète ﷺ et les pieux prédécesseurs.");
  insertPlaylist.run('prophetes', 'PL_FAKE_PROPHETES', "Histoire des Prophètes", "Les récits fascinants et les leçons de vie des Prophètes de l'Islam (Qisas al-Anbiya).");
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

  // API Route for Recommendations
  app.get("/api/recommendations", (req, res) => {
    try {
      const recommendations = db.prepare('SELECT * FROM recommendations').all();
      res.json(recommendations);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // API Routes for Playlists (Admin/Client)
  app.get("/api/playlists", (req, res) => {
    try {
      const playlists = db.prepare('SELECT * FROM playlists').all();
      res.json(playlists);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to fetch playlists" });
    }
  });

  app.post("/api/playlists", (req, res) => {
    const { key, id, title, desc } = req.body;
    if (!key || !id || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    try {
      const insert = db.prepare('INSERT OR REPLACE INTO playlists (key, id, title, desc) VALUES (?, ?, ?, ?)');
      insert.run(key, id, title, desc || '');
      res.json({ status: "success", message: "Playlist saved successfully" });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to save playlist" });
    }
  });

  app.delete("/api/playlists/:key", (req, res) => {
    const { key } = req.params;
    try {
      const del = db.prepare('DELETE FROM playlists WHERE key = ?');
      del.run(key);
      res.json({ status: "success", message: "Playlist deleted successfully" });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to delete playlist" });
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
