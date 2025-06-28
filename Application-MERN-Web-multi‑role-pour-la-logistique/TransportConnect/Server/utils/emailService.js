// backend/utils/emailService.js
const nodemailer = require('nodemailer');

// Configuration du transporteur email
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true pour 465, false pour les autres ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Templates d'emails
const emailTemplates = {
  verification: (data) => ({
    subject: 'Vérification de votre compte TransportConnect',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">TransportConnect</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Bienvenue ${data.nom} !</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Merci de vous être inscrit sur TransportConnect. Pour activer votre compte et commencer à utiliser notre plateforme, 
            veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Vérifier mon compte
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
            <a href="${data.verificationUrl}" style="color: #667eea;">${data.verificationUrl}</a>
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Ce lien expire dans 24 heures pour des raisons de sécurité.
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p>© 2025 TransportConnect. Tous droits réservés.</p>
          <p>Plateforme de transport collaborative au Maroc</p>
        </div>
      </div>
    `
  }),

  resetPassword: (data) => ({
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">TransportConnect</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Réinitialisation de mot de passe</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Bonjour ${data.nom},
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" 
               style="background: #e74c3c; 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Ce lien expire dans 10 minutes pour des raisons de sécurité.
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p>© 2025 TransportConnect. Tous droits réservés.</p>
        </div>
      </div>
    `
  }),

  demandeEnvoyee: (data) => ({
    subject: 'Nouvelle demande de transport reçue',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">TransportConnect</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Nouvelle demande de transport</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Bonjour ${data.conducteurNom},
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Vous avez reçu une nouvelle demande de transport pour votre annonce <strong>"${data.titreAnnonce}"</strong>.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Détails de la demande</h3>
            <p><strong>Expéditeur :</strong> ${data.expediteurNom}</p>
            <p><strong>Trajet :</strong> ${data.villeDepart} → ${data.villeDestination}</p>
            <p><strong>Colis :</strong> ${data.descriptionColis}</p>
            <p><strong>Montant proposé :</strong> ${data.montant} MAD</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.lienDemande}" 
               style="background: #27ae60; 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Voir la demande
            </a>
          </div>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p>© 2025 TransportConnect. Tous droits réservés.</p>
        </div>
      </div>
    `
  }),

  demandeAcceptee: (data) => ({
    subject: 'Votre demande de transport a été acceptée !',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">TransportConnect</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #27ae60;">🎉 Demande acceptée !</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Excellente nouvelle ${data.expediteurNom} !
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Votre demande de transport a été acceptée par <strong>${data.conducteurNom}</strong>.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Informations de transport</h3>
            <p><strong>Conducteur :</strong> ${data.conducteurNom}</p>
            <p><strong>Téléphone :</strong> ${data.conducteurTelephone}</p>
            <p><strong>Numéro de suivi :</strong> ${data.numeroSuivi}</p>
            <p><strong>Date prévue :</strong> ${data.datePrevu}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.lienSuivi}" 
               style="background: #3498db; 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Suivre mon colis
            </a>
          </div>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p>© 2025 TransportConnect. Tous droits réservés.</p>
        </div>
      </div>
    `
  }),

  colisLivre: (data) => ({
    subject: 'Votre colis a été livré !',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">TransportConnect</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #27ae60;">📦 Livraison effectuée !</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Bonjour ${data.expediteurNom},
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Votre colis (${data.numeroSuivi}) a été livré avec succès le ${data.dateLivraison}.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.lienEvaluation}" 
               style="background: #f39c12; 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Évaluer le conducteur
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Votre avis nous aide à améliorer la qualité de notre service et aide les autres utilisateurs.
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p>© 2025 TransportConnect. Tous droits réservés.</p>
        </div>
      </div>
    `
  }),

  adminWelcome: (data) => ({
    subject: 'Bienvenue dans l\'équipe TransportConnect',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">TransportConnect</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Bienvenue ${data.nom} !</h2>
          <p style="color: #666; line-height: 1.6;">
            Vous avez été ajouté en tant qu'administrateur de la plateforme TransportConnect.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Vos identifiants de connexion :
          </p>
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email :</strong> ${data.email}</p>
            <p><strong>Mot de passe temporaire :</strong> ${data.motDePasseTemporaire}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/admin/login" 
               style="background: #e74c3c; 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Accéder au panneau admin
            </a>
          </div>
          <p style="color: #e74c3c; font-size: 14px;">
            ⚠️ Veuillez changer votre mot de passe lors de votre première connexion.
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p>© 2025 TransportConnect. Tous droits réservés.</p>
        </div>
      </div>
    `
  })
};

// Fonction principale pour envoyer un email
const sendEmail = async ({ to, subject, template, data, html }) => {
  try {
    const transporter = createTransporter();
    
    // Vérifier la connexion
    await transporter.verify();
    
    let emailContent;
    
    if (template && emailTemplates[template]) {
      emailContent = emailTemplates[template](data);
    } else if (html) {
      emailContent = { subject, html };
    } else {
      throw new Error('Template ou contenu HTML requis');
    }
    
    const mailOptions = {
      from: {
        name: 'TransportConnect',
        address: process.env.EMAIL_USER
      },
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email envoyé avec succès:', {
      to: to,
      messageId: result.messageId,
      template: template
    });
    
    return {
      success: true,
      messageId: result.messageId
    };
    
  } catch (error) {
    console.error('Erreur envoi email:', error);
    throw new Error(`Erreur envoi email: ${error.message}`);
  }
};

// Fonction pour envoyer des emails en lot
const sendBulkEmails = async (emails) => {
  const results = [];
  
  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      results.push({
        to: email.to,
        success: true,
        messageId: result.messageId
      });
    } catch (error) {
      results.push({
        to: email.to,
        success: false,
        error: error.message
      });
    }
    
    // Délai entre les emails pour éviter le spam
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};

// Fonction pour envoyer une notification par email
const sendNotification = async (userId, type, data) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user || !user.preferences.notifications.email) {
      return { success: false, reason: 'Notifications email désactivées' };
    }
    
    const notificationTemplates = {
      'demande_recue': {
        template: 'demandeEnvoyee',
        data: {
          conducteurNom: user.nomComplet,
          ...data
        }
      },
      'demande_acceptee': {
        template: 'demandeAcceptee',
        data: {
          expediteurNom: user.nomComplet,
          ...data
        }
      },
      'colis_livre': {
        template: 'colisLivre',
        data: {
          expediteurNom: user.nomComplet,
          ...data
        }
      }
    };
    
    const notification = notificationTemplates[type];
    
    if (!notification) {
      throw new Error(`Type de notification non supporté: ${type}`);
    }
    
    return await sendEmail({
      to: user.email,
      template: notification.template,
      data: notification.data
    });
    
  } catch (error) {
    console.error('Erreur notification email:', error);
    throw error;
  }
};

// Fonction pour envoyer un email de bienvenue administrateur
const sendWelcomeAdmin = async (adminData) => {
  return await sendEmail({
    to: adminData.email,
    template: 'adminWelcome',
    data: adminData
  });
};

// Fonction pour valider une adresse email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


// Test de la configuration email
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Configuration email valide');
    return true;
  } catch (error) {
    console.error('❌ Configuration email invalide:', error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  sendNotification,
  sendWelcomeAdmin,
  validateEmail,
  testEmailConfig,
  emailTemplates
};