import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexuscraft';

async function seed() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  const usersCol = mongoose.connection.collection('users');

  // 1. Ensure Admin Account
  await usersCol.updateOne(
    { email: 'admin@nexuscraft.com' },
    {
      $set: {
        customId: 'usr-admin-1',
        name: 'NexusCraft Admin (Lead)',
        email: 'admin@nexuscraft.com',
        password: 'Admin@12345',
        role: 'admin',
        credits: 9999,
        status: 'active',
        approvalStatus: 'approved',
        title: 'Platform Governance Lead',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
      }
    },
    { upsert: true }
  );

  // 2. Ensure Elena Rostova (both emails)
  await usersCol.updateOne(
    { email: 'elena.rostova@design.io' },
    {
      $set: {
        customId: 'usr-freelancer-1',
        name: 'Elena Rostova',
        email: 'elena.rostova@design.io',
        phone: '+1 555-0188',
        password: 'Freelancer@12345',
        role: 'freelancer',
        credits: 1000,
        status: 'active',
        approvalStatus: 'approved',
        title: 'Principal 3D & WebGL Designer',
        skills: ['3D WebGL', 'Three.js', 'React', 'Figma'],
        hourlyRate: 85,
        availability: 'Available Now',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      }
    },
    { upsert: true }
  );

  await usersCol.updateOne(
    { email: 'elena@nexuscraft.com' },
    {
      $set: {
        customId: 'usr-freelancer-2',
        name: 'Elena Rostova',
        email: 'elena@nexuscraft.com',
        phone: '+1 555-0189',
        password: 'Freelancer@12345',
        role: 'freelancer',
        credits: 1000,
        status: 'active',
        approvalStatus: 'approved',
        title: 'Lead Specialist Engineer',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        hourlyRate: 85,
        availability: 'Available Now',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      }
    },
    { upsert: true }
  );

  // 3. Ensure user's personal freelancer account bayasanishashankreddy@gmail.com
  await usersCol.updateOne(
    { email: 'bayasanishashankreddy@gmail.com' },
    {
      $set: {
        name: 'Shashank Reddy (Freelancer)',
        role: 'freelancer',
        credits: 1000,
        status: 'active',
        approvalStatus: 'approved',
        password: 'Freelancer@12345',
        title: 'Principal Full Stack Engineer',
        skills: ['React', 'Node.js', 'MongoDB', 'Python']
      }
    }
  );

  // 4. Ensure Standard Demo Client (client@example.com)
  await usersCol.updateOne(
    { email: 'client@example.com' },
    {
      $set: {
        customId: 'usr-client-demo',
        name: 'Enterprise Client Lead',
        email: 'client@example.com',
        phone: '+1 555-0142',
        password: 'Client@12345',
        role: 'client',
        credits: 1500,
        status: 'active',
        approvalStatus: 'approved',
        company: 'Nexus Dynamics',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      }
    },
    { upsert: true }
  );

  // 5. Ensure Standard Demo Specialist (specialist@example.com)
  await usersCol.updateOne(
    { email: 'specialist@example.com' },
    {
      $set: {
        customId: 'usr-specialist-demo',
        name: 'Senior Full Stack Specialist',
        email: 'specialist@example.com',
        phone: '+1 555-0199',
        password: 'Freelancer@12345',
        role: 'freelancer',
        credits: 1000,
        status: 'active',
        approvalStatus: 'approved',
        title: 'Senior Distributed Systems Architect',
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Cloud Architecture'],
        hourlyRate: 95,
        availability: 'Available Now',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
      }
    },
    { upsert: true }
  );

  // 6. Ensure Alex Rivera
  await usersCol.updateOne(
    { email: 'alex.rivera@client.com' },
    {
      $set: {
        customId: 'usr-client-1',
        name: 'Alex Rivera (Client)',
        email: 'alex.rivera@client.com',
        phone: '+1 555-0142',
        password: 'Client@12345',
        role: 'client',
        credits: 500,
        status: 'active',
        approvalStatus: 'approved',
        company: 'Aura Dynamics',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      }
    },
    { upsert: true }
  );

  console.log('✅ Accounts successfully seeded/updated in MongoDB Atlas!');
  const all = await usersCol.find({}).toArray();
  all.forEach(u => console.log('✓', u.email, '| role:', u.role, '| credits:', u.credits, '| pass:', u.password));

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

