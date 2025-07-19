const express = require("express");
const router = express.Router();

router.post("/login-admin", (req, res) => {
  // Ajout pour debug
  if (!req.body || typeof req.body !== "object") {
    return res
      .status(400)
      .json({
        success: false,
        message: "Requête invalide : corps vide ou mal formé",
      });
  }

  const { username, password } = req.body;

  // Afficher dans la console pour confirmer que les valeurs sont bien reçues
  console.log("Requête reçue avec :", req.body);

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.status(200).json({ success: true });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Identifiants incorrects" });
  }
});

module.exports = router;
