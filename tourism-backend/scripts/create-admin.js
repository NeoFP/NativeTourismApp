const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const User = require('../models/User');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Get admin details
    const username = await question('Enter admin username: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      throw new Error('Invalid email format');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const admin = new User({
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('\nAdmin user created successfully!');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Role: admin`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
    process.exit();
  }
}

createAdmin(); 