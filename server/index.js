import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { authRouter } from './routes/authRoutes.js';
import { ideaRouter } from './routes/ideaRoutes.js';
import { messageRouter } from './routes/messageRoutes.js';
import { jobRouter } from './routes/jobRoutes.js';
import { proposalRouter } from './routes/proposalRoutes.js';
import { User } from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexuscraft';

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/ideas', ideaRouter);
app.use('/api/messages', messageRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/proposals', proposalRouter);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting/disconnected',
    timestamp: new Date().toISOString()
  });
});

// Seed default users if collection is empty
const seedDefaultAccounts = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding default demo accounts to MongoDB...');
      await User.insertMany([
        {
          customId: 'usr-admin-1',
          name: 'NexusCraft Admin (Lead)',
          email: 'admin@nexuscraft.com',
          password: 'Admin@12345',
          role: 'admin',
          credits: 9999,
          approvalStatus: 'approved',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          title: 'Platform Governance Lead'
        },
        {
          customId: 'usr-client-1',
          name: 'Alex Rivera (Client)',
          email: 'alex.rivera@client.com',
          password: 'Client@12345',
          role: 'client',
          credits: 500,
          approvalStatus: 'approved',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          company: 'Aura Dynamics'
        },
        {
          customId: 'usr-freelancer-1',
          name: 'Elena Rostova',
          email: 'elena.rostova@design.io',
          password: 'Freelancer@12345',
          role: 'freelancer',
          credits: 0,
          approvalStatus: 'approved',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          title: 'Principal 3D & WebGL Designer',
          skills: ['3D WebGL', 'Three.js', 'React', 'Figma']
        }
      ]);
      console.log('✅ Default demo accounts seeded successfully in MongoDB.');
    }
  } catch (err) {
    console.error('Error seeding demo accounts:', err.message);
  }
};

// Connect to MongoDB & Start Server
const startServer = async () => {
  try {
    console.log(`📡 Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('🚀 MongoDB connected successfully!');
    await seedDefaultAccounts();
  } catch (err) {
    console.error('⚠️ MongoDB connection notice:', err.message);
    console.log('ℹ️ Server will continue running and retry connection automatically.');
  }

  app.listen(PORT, () => {
    console.log(`🌐 NexusCraft Express API Server running at http://localhost:${PORT}`);
  });
};

startServer();
