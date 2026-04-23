const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('./models/User');

async function listUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({});
  console.log('Users in DB:', users.length);
  users.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.role}]`));
  await mongoose.connection.close();
}

listUsers();
