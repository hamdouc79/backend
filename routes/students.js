const express = require("express");
const { body, validationResult } = require("express-validator");
const Student = require("../models/Students");

const router = express.Router();

// Validation pour l'inscription d'étudiant
const validateStudent = [
  body("prenom").notEmpty().withMessage("Le prénom est requis"),
  body("nom").notEmpty().withMessage("Le nom est requis"),
  body("email").isEmail().withMessage("Email invalide"),
  body("telephone").notEmpty().withMessage("Le téléphone est requis"),
  body("dateNaissance").isDate().withMessage("Date de naissance invalide"),
  body("genre").isIn(["masculin", "feminin"]).withMessage("Genre invalide"),
  body("niveau")
    .isIn(["maternelle", "primaire", "college", "lycee"])
    .withMessage("Niveau invalide"),
  body("classe").notEmpty().withMessage("La classe est requise"),
  body("adresse").notEmpty().withMessage("L'adresse est requise"),
  body("ville").notEmpty().withMessage("La ville est requise"),
  body("codePostal").notEmpty().withMessage("Le code postal est requis"),
  body("nomParent").notEmpty().withMessage("Le nom du parent est requis"),
  body("telephoneParent")
    .notEmpty()
    .withMessage("Le téléphone du parent est requis"),
];

// Route de test pour vérifier si le fichier est bien chargé
router.get("/test", (req, res) => {
  res.json({ message: "Route students fonctionnelle" });
});

router.post("/test", (req, res) => {
  res.json({ message: "POST students fonctionne", body: req.body });
});

// POST /api/students - Créer une nouvelle inscription
router.post("/", validateStudent, async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Vérifier si l'email existe déjà
    const existingStudent = await Student.findOne({ email: req.body.email });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Un étudiant avec cet email existe déjà",
      });
    }

    // Créer nouvel étudiant
    const student = new Student(req.body);
    await student.save();

    res.status(201).json({
      success: true,
      message: "Inscription réussie !",
      data: {
        id: student._id,
        nom: student.nom,
        prenom: student.prenom,
        email: student.email,
        statut: student.statut,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'inscription",
    });
  }
});

// GET /api/students - Récupérer tous les étudiants
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, niveau, classe, statut } = req.query;

    // Construire le filtre
    const filter = {};
    if (niveau) filter.niveau = niveau;
    if (classe) filter.classe = classe;
    if (statut) filter.statut = statut;

    const students = await Student.find(filter)
      .select("-__v")
      .sort({ dateInscription: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(filter);

    res.json({
      success: true,
      data: students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des étudiants:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

// GET /api/students/:id - Récupérer un étudiant par ID
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("-__v");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Étudiant non trouvé",
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'étudiant:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

// PUT /api/students/:id/status - Mettre à jour le statut d'un étudiant
router.put("/:id/status", async (req, res) => {
  try {
    const { statut } = req.body;

    if (!["en_attente", "accepte", "refuse"].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide",
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    ).select("-__v");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Étudiant non trouvé",
      });
    }

    res.json({
      success: true,
      message: "Statut mis à jour avec succès",
      data: student,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

// DELETE /api/students/:id - Supprimer un étudiant
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Étudiant non trouvé",
      });
    }

    res.json({
      success: true,
      message: "Étudiant supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
}); // ✅ Fermeture correcte de la fonction DELETE

module.exports = router;
