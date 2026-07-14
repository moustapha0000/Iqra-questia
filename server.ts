import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import fs from "fs";
import "dotenv/config";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite Database (Point 4)
const db = new Database('app.db');

// Initialize Firebase Admin SDK if config exists
let adminDb: admin.firestore.Firestore | null = null;
try {
  const firebaseConfigPath = path.resolve(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(firebaseConfigPath)) {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));
    admin.initializeApp({
      projectId: config.projectId,
    });
    adminDb = admin.firestore();
    console.log("Firebase Admin SDK initialized successfully.");
  }
} catch (e) {
  console.warn("Could not initialize Firebase Admin SDK (Local environment fallback):", e);
}


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

  // ==========================================
  // PAYDUNYA SENEGAL PAYMENT GATEWAY INTEGRATION
  // ==========================================
  const PAYDUNYA_MASTER_KEY = process.env.PAYDUNYA_MASTER_KEY;
  const PAYDUNYA_PUBLIC_KEY = process.env.PAYDUNYA_PUBLIC_KEY;
  const PAYDUNYA_PRIVATE_KEY = process.env.PAYDUNYA_PRIVATE_KEY;
  const PAYDUNYA_TOKEN = process.env.PAYDUNYA_TOKEN;
  const PAYDUNYA_MODE = process.env.PAYDUNYA_MODE || "test";

  const isPayDunyaConfigured =
    PAYDUNYA_MASTER_KEY && PAYDUNYA_MASTER_KEY !== "demomasterkey" &&
    PAYDUNYA_PRIVATE_KEY && PAYDUNYA_PRIVATE_KEY !== "demoprivatekey" &&
    PAYDUNYA_MASTER_KEY.trim() !== "" &&
    PAYDUNYA_PRIVATE_KEY.trim() !== "";

  // Endpoint to initialize payment
  app.post("/api/payments/initialize", async (req, res) => {
    const { planId, userId, price, isAnnual, email, name } = req.body;

    if (!planId || !userId || !price) {
      return res.status(400).json({ error: "Champs planId, userId et price requis" });
    }

    const description = `Abonnement Iqra Quest - Plan ${planId.toUpperCase()} (${isAnnual ? 'Annuel' : 'Mensuel'})`;
    const appUrl = process.env.APP_URL || "http://localhost:3000";

    // 1. Simulation Mode Fallback (if real credentials aren't set yet)
    if (!isPayDunyaConfigured) {
      console.log("PayDunya not configured, running in simulation mode.");
      const mockToken = `mock_token_${Math.random().toString(36).substring(2, 15)}`;
      const redirectUrl = `${appUrl}/api/payments/mock-checkout?token=${mockToken}&planId=${planId}&userId=${userId}&price=${price}&isAnnual=${isAnnual ? 'true' : 'false'}`;
      
      return res.json({
        success: true,
        mode: "simulation",
        url: redirectUrl,
        token: mockToken
      });
    }

    // 2. Real PayDunya Sandbox / Live integration
    const paydunyaUrl = PAYDUNYA_MODE === "live"
      ? "https://paydunya.com/api/v1/checkout-invoice/create"
      : "https://paydunya.com/sandbox-api/v1/checkout-invoice/create";

    try {
      const response = await fetch(paydunyaUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "PAYDUNYA-MASTER-KEY": PAYDUNYA_MASTER_KEY!,
          "PAYDUNYA-PUBLIC-KEY": PAYDUNYA_PUBLIC_KEY!,
          "PAYDUNYA-PRIVATE-KEY": PAYDUNYA_PRIVATE_KEY!,
          "PAYDUNYA-TOKEN": PAYDUNYA_TOKEN!
        },
        body: JSON.stringify({
          invoice: {
            total_amount: price,
            description: description,
            items: {
              item_0: {
                name: `Plan ${planId.toUpperCase()}`,
                quantity: 1,
                unit_price: price,
                total_price: price
              }
            }
          },
          store: {
            name: "Iqra Quest"
          },
          actions: {
            cancel_url: `${appUrl}/#abonnement`,
            callback_url: `${appUrl}/api/payments/webhook`,
            return_url: `${appUrl}/#abonnement`
          },
          custom_data: {
            userId: userId,
            planId: planId,
            isAnnual: isAnnual ? "true" : "false"
          }
        })
      });

      const data: any = await response.json();

      if (data.response_code === "00") {
        return res.json({
          success: true,
          mode: "real",
          url: data.response_url,
          token: data.token
        });
      } else {
        console.error("PayDunya invoice creation failed:", data);
        return res.status(500).json({ error: data.response_text || "Échec de création de la facture PayDunya" });
      }
    } catch (e: any) {
      console.error("PayDunya fetch error:", e);
      return res.status(500).json({ error: "Erreur de connexion avec PayDunya" });
    }
  });

  // Mock Checkout HTML screen for local test
  app.get("/api/payments/mock-checkout", (req, res) => {
    const { token, planId, userId, price, isAnnual } = req.query;
    const appUrl = process.env.APP_URL || "http://localhost:3000";

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Simulation PayDunya - Iqra Quest</title>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { font-family: 'Montserrat', sans-serif; background-color: #05100a; color: #ffffff; }
        </style>
      </head>
      <body class="min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-[#0a1a11] rounded-3xl p-8 border border-[#e5b85c]/20 shadow-2xl relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-[#e5b85c]/10 rounded-full blur-[40px] -translate-y-12 translate-x-12"></div>
          
          <div class="text-center mb-6">
            <span class="inline-block text-xs px-3 py-1 bg-[#e5b85c]/20 border border-[#e5b85c]/30 text-[#e5b85c] rounded-full font-bold uppercase tracking-wider mb-3">Simulation Sénégal</span>
            <h1 class="text-2xl font-bold text-white">Portail de Paiement PayDunya</h1>
            <p class="text-gray-400 text-sm mt-1">Simuler un paiement Mobile Money au Sénégal</p>
          </div>

          <div class="bg-[#05100a] rounded-2xl p-5 border border-white/5 mb-6">
            <div class="flex justify-between mb-2">
              <span class="text-gray-400 text-sm">Produit</span>
              <span class="font-bold text-[#e5b85c]">Abonnement ${planId?.toString().toUpperCase()}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="text-gray-400 text-sm">Fréquence</span>
              <span class="font-semibold text-white">${isAnnual === 'true' ? 'Annuel' : 'Mensuel'}</span>
            </div>
            <div class="h-px bg-white/5 my-3"></div>
            <div class="flex justify-between">
              <span class="text-gray-400 text-sm">Montant à payer</span>
              <span class="text-xl font-bold text-white">${Number(price).toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

          <p class="text-xs text-gray-400 mb-6 text-center">Choisissez un moyen de paiement de simulation pour valider :</p>

          <div class="space-y-3">
            <button onclick="pay('wave')" class="w-full py-4 px-5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold transition-all flex items-center justify-between group shadow-lg shadow-sky-500/10 cursor-pointer">
              <div class="flex items-center gap-3">
                <span class="text-xl">🌊</span>
                <span>Wave Sénégal</span>
              </div>
              <span class="text-xs opacity-75 group-hover:translate-x-1 transition-transform">Payer &rarr;</span>
            </button>

            <button onclick="pay('orange')" class="w-full py-4 px-5 rounded-2xl bg-[#ff6600] hover:bg-[#e05a00] text-white font-bold transition-all flex items-center justify-between group shadow-lg shadow-orange-500/10 cursor-pointer">
              <div class="flex items-center gap-3">
                <span class="text-xl">🍊</span>
                <span>Orange Money</span>
              </div>
              <span class="text-xs opacity-75 group-hover:translate-x-1 transition-transform">Payer &rarr;</span>
            </button>

            <button onclick="pay('free')" class="w-full py-4 px-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all flex items-center justify-between group shadow-lg shadow-red-500/10 cursor-pointer">
              <div class="flex items-center gap-3">
                <span class="text-xl">🔴</span>
                <span>Free Money</span>
              </div>
              <span class="text-xs opacity-75 group-hover:translate-x-1 transition-transform">Payer &rarr;</span>
            </button>
          </div>

          <div class="mt-6 text-center">
            <a href="${appUrl}/#abonnement" class="text-gray-400 hover:text-white text-xs underline transition-colors">Annuler la transaction</a>
          </div>
        </div>

        <script>
          function pay(method) {
            alert('Simulation de paiement réussie avec ' + method.toUpperCase() + ' !');
            window.location.href = '${appUrl}/#abonnement?token=${token}&planId=${planId}&userId=${userId}&isAnnual=${isAnnual}';
          }
        </script>
      </body>
      </html>
    `;
    res.send(htmlContent);
  });

  // Verify token endpoint
  app.get("/api/payments/verify-token", async (req, res) => {
    const { token, planId, userId, isAnnual } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Token requis" });
    }

    // 1. Simulation mode verify
    if (token.toString().startsWith("mock_token_")) {
      if (adminDb && userId && planId) {
        try {
          const userRef = adminDb.collection("users").doc(userId.toString());
          const now = new Date();
          const endDate = new Date(now);
          endDate.setMonth(endDate.getMonth() + (isAnnual === "true" ? 12 : 1));

          await userRef.update({
            subscription: planId.toString(),
            subscriptionStartDate: now.toISOString(),
            subscriptionEndDate: endDate.toISOString(),
          });
          console.log(`Firestore user ${userId} updated via mock verification.`);
        } catch (err) {
          console.error("Firestore Admin update failed in simulation:", err);
        }
      }

      return res.json({
        success: true,
        planId: planId,
        userId: userId,
        token: token
      });
    }

    // 2. Real PayDunya verify
    const confirmUrl = PAYDUNYA_MODE === "live"
      ? `https://paydunya.com/api/v1/checkout-invoice/confirm/${token}`
      : `https://paydunya.com/sandbox-api/v1/checkout-invoice/confirm/${token}`;

    try {
      const response = await fetch(confirmUrl, {
        method: "GET",
        headers: {
          "PAYDUNYA-MASTER-KEY": PAYDUNYA_MASTER_KEY!,
          "PAYDUNYA-PUBLIC-KEY": PAYDUNYA_PUBLIC_KEY!,
          "PAYDUNYA-PRIVATE-KEY": PAYDUNYA_PRIVATE_KEY!,
          "PAYDUNYA-TOKEN": PAYDUNYA_TOKEN!
        }
      });

      const data: any = await response.json();

      if (data.status === "completed") {
        const uId = data.custom_data.userId;
        const pId = data.custom_data.planId;
        const isAnn = data.custom_data.isAnnual === "true";

        if (adminDb && uId && pId) {
          try {
            const userRef = adminDb.collection("users").doc(uId);
            const now = new Date();
            const endDate = new Date(now);
            endDate.setMonth(endDate.getMonth() + (isAnn ? 12 : 1));

            await userRef.update({
              subscription: pId,
              subscriptionStartDate: now.toISOString(),
              subscriptionEndDate: endDate.toISOString(),
            });
            console.log(`Firestore user ${uId} updated successfully via verify-token.`);
          } catch (err) {
            console.error("Firestore Admin update failed in token verify:", err);
          }
        }

        return res.json({
          success: true,
          planId: pId,
          userId: uId,
          token: token
        });
      } else {
        return res.json({ success: false, status: data.status });
      }
    } catch (e) {
      console.error("Error verifying real PayDunya token:", e);
      return res.status(500).json({ error: "Erreur de vérification" });
    }
  });

  // Webhook callback
  app.post("/api/payments/webhook", async (req, res) => {
    const token = req.body.token || req.query.token;

    if (!token) {
      return res.status(400).send("No token provided");
    }

    console.log(`PayDunya Webhook callback received for token: ${token}`);

    const confirmUrl = PAYDUNYA_MODE === "live"
      ? `https://paydunya.com/api/v1/checkout-invoice/confirm/${token}`
      : `https://paydunya.com/sandbox-api/v1/checkout-invoice/confirm/${token}`;

    try {
      const response = await fetch(confirmUrl, {
        method: "GET",
        headers: {
          "PAYDUNYA-MASTER-KEY": PAYDUNYA_MASTER_KEY!,
          "PAYDUNYA-PUBLIC-KEY": PAYDUNYA_PUBLIC_KEY!,
          "PAYDUNYA-PRIVATE-KEY": PAYDUNYA_PRIVATE_KEY!,
          "PAYDUNYA-TOKEN": PAYDUNYA_TOKEN!
        }
      });

      const data: any = await response.json();

      if (data.status === "completed") {
        const uId = data.custom_data.userId;
        const pId = data.custom_data.planId;
        const isAnn = data.custom_data.isAnnual === "true";

        if (adminDb && uId && pId) {
          const userRef = adminDb.collection("users").doc(uId);
          const now = new Date();
          const endDate = new Date(now);
          endDate.setMonth(endDate.getMonth() + (isAnn ? 12 : 1));

          await userRef.update({
            subscription: pId,
            subscriptionStartDate: now.toISOString(),
            subscriptionEndDate: endDate.toISOString(),
          });
          console.log(`Webhook updated user ${uId} to ${pId}`);
        }
        return res.status(200).send("OK");
      } else {
        return res.status(200).send(`Non-completed status: ${data.status}`);
      }
    } catch (e) {
      console.error("Webhook verification processing failed:", e);
      return res.status(500).send("Webhook Error");
    }
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
