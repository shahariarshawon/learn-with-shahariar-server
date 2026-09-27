import { connectDB } from '../dist/src/database/connect.js';
import Course from '../dist/src/models/Course.js';

async function checkCourses() {
  try {
    await connectDB();
    const courses = await Course.find().lean();
    console.log(`Found ${courses.length} courses:`);
    courses.forEach(c => console.log(`- ${c._id} | ${c.courseTitle} | status: ${c.status} | approval: ${c.approvalStatus}`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCourses();
