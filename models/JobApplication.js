const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  // Informations personnelles
  nom: {
    type: String,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  telephone: {
    type: String,
    trim: true
  },
  
  // Poste souhaité
  posteSouhaite: {
    type: String,
    required: true,
    trim: true
  },
  
  // Message de motivation
  messageMotivation: {
    type: String,
    required: true,
    trim: true
  },
  
  // CV (chemin du fichier uploadé)
  cvPath: {
    type: String,
    trim: true
  },
  
  // Métadonnées
  dateCandidature: {
    type: Date,
    default: Date.now
  },
  statut: {
    type: String,
    enum: ['soumise', 'en_cours', 'acceptee', 'refusee'],
    default: 'soumise'
  },
  
  // Suivi
  dateReponse: {
    type: Date
  },
  commentaireRH: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index pour les recherches
jobApplicationSchema.index({ email: 1 });
jobApplicationSchema.index({ nom: 1, prenom: 1 });
jobApplicationSchema.index({ posteSouhaite: 1 });
jobApplicationSchema.index({ statut: 1 });
jobApplicationSchema.index({ dateCandidature: -1 });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);