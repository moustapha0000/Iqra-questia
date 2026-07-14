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
  // PAYSTACK PAYMENT GATEWAY INTEGRATION (BY STRIPE)
  // ==========================================
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;

  const isPaystackConfigured =
    PAYSTACK_SECRET_KEY &&
    PAYSTACK_SECRET_KEY !== "sk_test_demosecretkey" &&
    PAYSTACK_SECRET_KEY.trim() !== "";

  // Endpoint to initialize payment
  app.post("/api/payments/initialize", async (req, res) => {
    const { planId, userId, price, isAnnual, email, name } = req.body;

    if (!planId || !userId || !price) {
      return res.status(400).json({ error: "Champs planId, userId et price requis" });
    }

    const appUrl = process.env.APP_URL || "http://localhost:3000";

    // 1. Simulation Mode Fallback (if real credentials aren't set yet)
    if (!isPaystackConfigured) {
      console.log("Paystack not configured, running in simulation mode.");
      const mockReference = `mock_token_${Math.random().toString(36).substring(2, 15)}`;
      const redirectUrl = `${appUrl}/api/payments/mock-checkout?token=${mockReference}&planId=${planId}&userId=${userId}&price=${price}&isAnnual=${isAnnual ? 'true' : 'false'}`;
      
      return res.json({
        success: true,
        mode: "simulation",
        url: redirectUrl,
        reference: mockReference
      });
    }

    // 2. Real Paystack Transaction Initialization
    try {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email || "customer@iqraquest.com",
          // Paystack XOF amount expects value in minor units (multiplied by 100)
          amount: price * 100,
          currency: "XOF",
          callback_url: `${appUrl}/#abonnement`,
          metadata: {
            userId: userId,
            planId: planId,
            isAnnual: isAnnual ? "true" : "false",
            custom_fields: [
              {
                display_name: "Plan d'abonnement",
                variable_name: "plan_id",
                value: planId
              },
              {
                display_name: "Nom d'utilisateur",
                variable_name: "user_name",
                value: name
              }
            ]
          }
        })
      });

      const data: any = await response.json();

      if (data.status) {
        return res.json({
          success: true,
          mode: "real",
          url: data.data.authorization_url,
          reference: data.data.reference
        });
      } else {
        console.error("Paystack initialization failed:", data);
        return res.status(500).json({ error: data.message || "Échec d'initialisation du paiement Paystack" });
      }
    } catch (e: any) {
      console.error("Paystack fetch error:", e);
      return res.status(500).json({ error: "Erreur de connexion avec Paystack" });
    }
  });

  // Mock Checkout HTML screen for local test (mimics Paystack checkout)
  app.get("/api/payments/mock-checkout", (req, res) => {
    const { token, planId, userId, price, isAnnual } = req.query;
    const appUrl = process.env.APP_URL || "http://localhost:3000";

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Simulation Paystack - Iqra Quest</title>
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
            <span class="inline-block text-xs px-3 py-1 bg-[#e5b85c]/20 border border-[#e5b85c]/30 text-[#e5b85c] rounded-full font-bold uppercase tracking-wider mb-3">Simulation Globale (Stripe)</span>
            <h1 class="text-2xl font-bold text-white">Portail de Paiement Paystack</h1>
            <p class="text-gray-400 text-sm mt-1">Accepter les paiements locaux et internationaux</p>
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

          <p class="text-xs text-gray-400 mb-6 text-center">Choisissez un moyen de paiement (Afrique, Europe, USA) :</p>

          <div class="space-y-3">
            <button onclick="pay('local')" class="w-full py-3.5 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all flex items-center justify-between group shadow-lg shadow-teal-500/10 cursor-pointer">
              <div class="flex items-center gap-3">
                <span class="text-xl">🌊</span>
                <span class="text-left">Mobile Money (Wave, Orange Money)</span>
              </div>
              <span class="text-xs opacity-75 group-hover:translate-x-1 transition-transform">Payer &rarr;</span>
            </button>

            <button onclick="pay('card_intl')" class="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all flex items-center justify-between group shadow-lg shadow-indigo-500/10 cursor-pointer">
              <div class="flex items-center gap-3">
                <span class="text-xl">💳</span>
                <span class="text-left">Carte Bancaire Internationale (Euro / USD)</span>
              </div>
              <span class="text-xs opacity-75 group-hover:translate-x-1 transition-transform">Payer &rarr;</span>
            </button>

            <button onclick="pay('apple')" class="w-full py-3.5 px-5 rounded-2xl bg-black hover:bg-zinc-900 text-white font-bold border border-white/10 transition-all flex items-center justify-between group shadow-lg cursor-pointer">
              <div class="flex items-center gap-3">
                <span class="text-xl">🍎</span>
                <span class="text-left">Apple Pay / Google Pay</span>
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
            alert('Simulation de paiement réussie avec ' + method.toUpperCase() + ' via Paystack !');
            window.location.href = '${appUrl}/#abonnement?reference=${token}&planId=${planId}&userId=${userId}&isAnnual=${isAnnual}';
          }
        </script>
      </body>
      </html>
    `;
    res.send(htmlContent);
  });

  // Verify reference endpoint
  app.get("/api/payments/verify-token", async (req, res) => {
    const { reference, planId, userId, isAnnual } = req.query;

    if (!reference) {
      return res.status(400).json({ error: "Référence Paystack requise" });
    }

    // 1. Simulation verification
    if (reference.toString().startsWith("mock_token_")) {
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
          console.log(`Firestore user ${userId} updated via mock Paystack verify`);
        } catch (err) {
          console.error("Firestore Admin update failed in simulated verification:", err);
        }
      }

      return res.json({
        success: true,
        planId: planId,
        userId: userId,
        reference: reference
      });
    }

    // 2. Real Paystack verification
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      });

      const data: any = await response.json();

      if (data.status && data.data.status === "success") {
        const uId = data.data.metadata.userId;
        const pId = data.data.metadata.planId;
        const isAnn = data.data.metadata.isAnnual === "true" || data.data.metadata.isAnnual === true;

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
            console.log(`Firestore user ${uId} updated successfully via Paystack verify.`);
          } catch (err) {
            console.error("Firestore Admin update failed in Paystack verify:", err);
          }
        }

        return res.json({
          success: true,
          planId: pId,
          userId: uId,
          reference: reference
        });
      } else {
        return res.json({ success: false, status: data.data?.status || "failed" });
      }
    } catch (e) {
      console.error("Error verifying reference with Paystack:", e);
      return res.status(500).json({ error: "Erreur de vérification du paiement" });
    }
  });

  // Webhook for Paystack notifications
  app.post("/api/payments/webhook", async (req, res) => {
    // Paystack sends webhook event
    const { event, data } = req.body;

    if (!event) {
      return res.status(400).send("No event provided");
    }

    console.log(`Paystack Webhook callback received for event: ${event}`);

    // Verify webhook signature (optional but recommended in production)
    // For simplicity and high security, we will double check transaction status by calling verification API
    if (event === "charge.success" && data && data.status === "success") {
      const reference = data.reference;

      const confirmUrl = `https://api.paystack.co/transaction/verify/${reference}`;

      try {
        const response = await fetch(confirmUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`
          }
        });

        const resData: any = await response.json();

        if (resData.status && resData.data.status === "success") {
          const uId = resData.data.metadata.userId;
          const pId = resData.data.metadata.planId;
          const isAnn = resData.data.metadata.isAnnual === "true" || resData.data.metadata.isAnnual === true;

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
            console.log(`Webhook updated user ${uId} to ${pId} via Paystack verify`);
          }
        }
        return res.status(200).send("OK");
      } catch (e) {
        console.error("Webhook processing failed:", e);
        return res.status(500).send("Webhook Verification Error");
      }
    }

    return res.status(200).send("Event ignored");
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
