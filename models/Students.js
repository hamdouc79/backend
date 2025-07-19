const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Informations personnelles
  prenom: {
    type: String,
    required: true,
    trim: true
  },
  nom: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  telephone: {
    type: String,
    required: true,
    trim: true
  },
  dateNaissance: {
    type: Date,
    required: true
  },
  genre: {
    type: String,
    required: true,
    enum: ['masculin', 'feminin']
  },
  
  // Informations scolaires
  niveau: {
    type: String,
    required: true,
    enum: ['maternelle', 'primaire', 'college', 'lycee']
  },
  classe: {
    type: String,
    required: true,
    enum: ['cp', 'ce1', 'ce2', 'cm1', 'cm2', '6eme', '5eme', '4eme', '3eme', 'seconde', 'premiere', 'terminale']
  },
  
  // Adresse
  adresse: {
    type: String,
    required: true,
    trim: true
  },
  ville: {
    type: String,
    required: true,
    trim: true
  },
  codePostal: {
    type: String,
    required: true,
    trim: true
  },
  
  // Informations parent/tuteur
  nomParent: {
    type: String,
    required: true,
    trim: true
  },
  telephoneParent: {
    type: String,
    required: true,
    trim: true
  },
  emailParent: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  // Métadonnées
  dateInscription: {
    type: Date,
    default: Date.now
  },
  statut: {
    type: String,
    enum: ['en_attente', 'accepte', 'refuse'],
    default: 'en_attente'
  }
}, {
  timestamps: true
});

// Index pour les recherches
studentSchema.index({ email: 1 });
studentSchema.index({ nom: 1, prenom: 1 });
studentSchema.index({ niveau: 1, classe: 1 });

module.exports = mongoose.model('Students', studentSchema);