const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/transportconnect');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      console.log('Admin credentials:');
      console.log('Email:', existingAdmin.email);
      console.log('Password: (check your database or reset it)');
      return;
    }

    // Create admin user
    const adminData = {
      nom: 'Admin',
      prenom: 'Super',
      email: 'admin@transportconnect.com',
      telephone: '+212600000000',
      motDePasse: 'Admin123!',
      role: 'admin',
      statut: 'actif',
      emailVerifie: true
    };

    const admin = await User.create(adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log('Admin credentials:');
    console.log('Email:', admin.email);
    console.log('Password: Admin123!');
    console.log('Role:', admin.role);

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
createAdmin(); 