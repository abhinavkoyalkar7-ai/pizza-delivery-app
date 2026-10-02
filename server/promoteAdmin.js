import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const promoteLatestUser = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is missing from your .env file');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB...');

    // Fetch the latest registered user account
    const user = await User.findOne().sort({ _id: -1 });

    if (!user) {
      console.log('No registered users found in the database.');
      return;
    }

    // Set both standard admin identifiers
    user.role = 'admin';
    user.isAdmin = true;
    await user.save();

    console.log(`Success: ${user.name || 'User'} (${user.email}) is now an ADMIN.`);
  } catch (err) {
    console.error('Promotion failed:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

promoteLatestUser();