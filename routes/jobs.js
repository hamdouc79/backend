const express = require("express");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
//const JobApplication = require('../models/jobApplication');
const JobApplication = require("../models/JobApplication");
console.log("✅ Fichier jobs.js chargé");

const router = express.Router();

// Configuration multer pour upload CV
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/cv/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error("Format de fichier non autorisé. Utilisez PDF, DOC ou DOCX")
      );
    }
  },
});

// Validation pour les candidatures
const validateJobApplication = [
  body("nom").notEmpty().withMessage("Le nom est requis"),
  body("prenom").notEmpty().withMessage("Le prénom est requis"),
  body("email").isEmail().withMessage("Email invalide"),
  body("posteSouhaite").notEmpty().withMessage("Le poste souhaité est requis"),
  body("messageMotivation")
    .notEmpty()
    .withMessage("Le message de motivation est requis"),
];

// POST /api/jobs - Créer une nouvelle candidature
router.post(
  "/",
  upload.single("cv"),
  validateJobApplication,
  async (req, res) => {
    try {
      // Vérifier les erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }
      console.log("=== Debug Fichier reçu ===");
      console.log("req.file:", req.file);
      console.log("req.body:", req.body);

      // Créer nouvelle candidature
      const jobApplicationData = {
        ...req.body,
        cvPath: req.file ? req.file.path : null,
      };

      const jobApplication = new JobApplication(jobApplicationData);
      await jobApplication.save();

      res.status(201).json({
        success: true,
        message: "Candidature soumise avec succès !",
        data: {
          id: jobApplication._id,
          nom: jobApplication.nom,
          prenom: jobApplication.prenom,
          email: jobApplication.email,
          posteSouhaite: jobApplication.posteSouhaite,
          statut: jobApplication.statut,
          dateCandidature: jobApplication.dateCandidature,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la soumission de candidature:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la soumission",
      });
    }
  }
);

// GET /api/jobs - Récupérer toutes les candidatures
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, statut, posteSouhaite } = req.query;

    // Construire le filtre
    const filter = {};
    if (statut) filter.statut = statut;
    if (posteSouhaite) filter.posteSouhaite = new RegExp(posteSouhaite, "i");

    const applications = await JobApplication.find(filter)
      .select("-__v")
      .sort({ dateCandidature: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await JobApplication.countDocuments(filter);

    res.json({
      success: true,
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des candidatures:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

// GET /api/jobs/:id - Récupérer une candidature par ID
router.get("/:id", async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id).select(
      "-__v"
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Candidature non trouvée",
      });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la candidature:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

// PUT /api/jobs/:id/status - Mettre à jour le statut d'une candidature
router.put("/:id/status", async (req, res) => {
  try {
    const { statut, commentaireRH } = req.body;

    if (!["soumise", "en_cours", "acceptee", "refusee"].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide",
      });
    }

    const updateData = { statut };
    if (commentaireRH) updateData.commentaireRH = commentaireRH;
    if (statut === "acceptee" || statut === "refusee") {
      updateData.dateReponse = new Date();
    }

    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-__v");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Candidature non trouvée",
      });
    }

    res.json({
      success: true,
      message: "Statut mis à jour avec succès",
      data: application,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

// DELETE /api/jobs/:id - Supprimer une candidature
router.delete("/:id", async (req, res) => {
  try {
    const application = await JobApplication.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Candidature non trouvée",
      });
    }

    // Supprimer le fichier CV si il existe
    if (application.cvPath) {
      const fs = require("fs");
      fs.unlink(application.cvPath, (err) => {
        if (err)
          console.error("Erreur lors de la suppression du fichier CV:", err);
      });
    }

    res.json({
      success: true,
      message: "Candidature supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

// GET /api/jobs/stats - Statistiques des candidatures
router.get("/stats/overview", async (req, res) => {
  try {
    const stats = await JobApplication.aggregate([
      {
        $group: {
          _id: "$statut",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await JobApplication.countDocuments();
    const thisMonth = await JobApplication.countDocuments({
      dateCandidature: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    res.json({
      success: true,
      data: {
        total,
        thisMonth,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

module.exports = router;
