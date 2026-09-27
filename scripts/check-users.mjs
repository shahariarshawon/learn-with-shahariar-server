import { connectDB } from '../dist/src/database/connect.js';
import User from '../dist/src/models/User.js';

async function checkUsers() {
  try {
    await connectDB();
    const users = await User.find().lean();
    console.log(`Found ${users.length} users:`);
    users.forEach(u => console.log(`- ${u._id} | ${u.name} | ${u.email} | ${u.role}`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
