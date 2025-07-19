const { validationResult } = require('express-validator');

// Middleware pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Middleware pour nettoyer les données d'entrée
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    // Nettoyer les chaînes de caractères
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};

// Middleware pour logger les requêtes
const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
};

// Middleware pour gérer les erreurs globales
const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err);
  
  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors
    });
  }
  
  // Erreur de duplication (email déjà existant)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} déjà existant`,
      errors: [{ field, message: 'Cette valeur existe déjà' }]
    });
  }
  
  // Erreur CastError (ID invalide)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID invalide'
    });
  }
  
  // Erreur par défaut
  res.status(500).json({
    success: false,
    message: 'Erreur serveur interne'
  });
};

module.exports = {
  handleValidationErrors,
  sanitizeInput,
  logRequest,
  errorHandler
};