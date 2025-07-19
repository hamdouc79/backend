const express = require("express");
const path = require("path");
console.log("✅ server.js lancé sur Railway...");

require("dotenv").config();
const cors = require("cors");

const connectDB = require("./config/database");
const {
  logRequest,
  sanitizeInput,
  errorHandler,
} = require("./middleware/validation");

const app = express();

// ✅ Middleware AVANT routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Connexion à MongoDB
connectDB();

// ✅ Middleware globaux
app.use(logRequest);
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  })
);
app.use(sanitizeInput);

// ✅ Fichiers statiques
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api", require("./routes/auth")); // 👈 login-admin
app.use("/api/students", require("./routes/students"));
app.use("/api/jobs", require("./routes/jobs"));

// ✅ Route de test
app.get("/api/test", (req, res) => {
  res.json({ message: "API Backend fonctionnel !" });
});

// ✅ Gestion des erreurs (après toutes les routes)
app.use(errorHandler);

// ✅ Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
