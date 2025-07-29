#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fonction pour corriger les URLs d'API dans un fichier
function fixApiUrls(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remplacer les URLs relatives par des URLs directes
    const replacements = [
      // PFE Reports
      ['/api/pfe-reports/', 'http://localhost:8000/api/pfe-reports/'],
      ['/api/pfe-reports/create/', 'http://localhost:8000/api/pfe-reports/create/'],
      ['/api/pfe-reports/${reportId}/submit/', 'http://localhost:8000/api/pfe-reports/${reportId}/submit/'],
      
      // Stages
      ['/api/stages/', 'http://localhost:8000/api/stages/'],
      ['/api/stages/my-internship/', 'http://localhost:8000/api/stages/my-internship/'],
      
      // Documents
      ['/api/documents/', 'http://localhost:8000/api/documents/'],
      ['/api/documents/upload/', 'http://localhost:8000/api/documents/upload/'],
      
      // Evaluations
      ['/api/evaluations/', 'http://localhost:8000/api/evaluations/'],
      
      // Testimonials
      ['/api/testimonials/', 'http://localhost:8000/api/testimonials/'],
      ['/api/testimonials/create/', 'http://localhost:8000/api/testimonials/create/'],
      
      // Notifications
      ['/api/notifications/', 'http://localhost:8000/api/notifications/'],
      
      // Profile
      ['/api/auth/profile/', 'http://localhost:8000/api/auth/profile/'],
      
      // Dashboard Stats
      ['/api/stats/', 'http://localhost:8000/api/stats/'],
      ['/api/dashboard/stats/', 'http://localhost:8000/api/stats/'],
    ];

    for (const [oldUrl, newUrl] of replacements) {
      if (content.includes(oldUrl)) {
        content = content.replace(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUrl);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigé: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
  }
}

// Fonction pour parcourir récursivement les dossiers
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixApiUrls(filePath);
    }
  }
}

// Démarrer la correction
console.log('🔧 Correction des URLs d\'API dans le dashboard...');
walkDir('./app');
console.log('✅ Correction terminée !'); 