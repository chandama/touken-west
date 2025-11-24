const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  const usersPath = path.join(__dirname, '../data/users.json');

  // Read existing users or create empty array
  let users = [];
  try {
    const content = await fs.readFile(usersPath, 'utf8');
    users = JSON.parse(content);
  } catch (err) {
    // File doesn't exist, start with empty array
    users = [];
  }

  // Check if admin already exists
  const adminExists = users.find(u => u.email === 'admin@touken-west.com');
  if (adminExists) {
    console.log('Admin user already exists!');
    console.log('Email: admin@touken-west.com');
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = {
    id: Date.now().toString(),
    email: 'admin@touken-west.com',
    username: 'Admin',
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date().toISOString()
  };

  users.push(adminUser);

  // Ensure data directory exists
  await fs.mkdir(path.join(__dirname, '../data'), { recursive: true });

  // Write users file
  await fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf8');

  console.log('✅ Admin user created successfully!');
  console.log('');
  console.log('Login credentials:');
  console.log('  Email: admin@touken-west.com');
  console.log('  Password: admin123');
  console.log('');
  console.log('⚠️  Please change this password after first login!');
}

createAdminUser().catch(console.error);
