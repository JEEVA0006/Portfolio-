require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');
const Project  = require('../models/Project');

const sampleProjects = [
  {
    title:        'Simple Python Calculator',
    description:  'A console-based calculator built in Python that performs basic arithmetic operations.',
    technologies: ['Python'],
    featured:     true,
    category:     'backend',
    order:        1,
  },
  {
    title:        'Website Portfolio (HTML/CSS)',
    description:  'A personal portfolio webpage built with HTML and CSS, showcasing resume and academic projects.',
    technologies: ['HTML5', 'CSS3'],
    featured:     true,
    category:     'frontend',
    order:        2,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Admin user
    const existing = await User.findOne({ email: 'admin@portfolio.dev' });
    if (!existing) {
      await User.create({ name: 'Admin', email: 'admin@portfolio.dev', password: 'Admin@123456' });
      console.log('✅ Admin created  →  admin@portfolio.dev / Admin@123456');
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // Projects
    const count = await Project.countDocuments();
    if (count === 0) {
      await Project.insertMany(sampleProjects);
      console.log(`✅ ${sampleProjects.length} projects inserted`);
    } else {
      console.log(`ℹ️  ${count} projects already exist`);
    }

    console.log('\n🎉 Done! Login at http://localhost:5173/admin/login');
    console.log('   Email: admin@portfolio.dev | Password: Admin@123456\n');
  } catch (err) {
    console.error('❌ Failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
