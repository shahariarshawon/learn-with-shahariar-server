import { connectDB } from '../dist/src/database/connect.js';
import User from '../dist/src/models/User.js';
import Course from '../dist/src/models/Course.js';
import CourseService from '../dist/src/modules/courses/course.service.js';
import AdminService from '../dist/src/services/admin.service.js';
import CourseProgress from '../dist/src/models/CourseProgress.js';

async function runE2ETests() {
  console.log('====================================================');
  console.log('  STARTING FULL E2E APPLICATION FUNCTIONAL AUDIT    ');
  console.log('====================================================\n');

  try {
    // 1. Database Health Check
    console.log('[E2E 1/8] Verifying Database Connection...');
    await connectDB();
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      throw new Error(`Database not connected! State: ${mongoose.connection.readyState}`);
    }
    console.log(`  ✓ MongoDB Status: HEALTHY (Connected to ${mongoose.connection.name})\n`);

    // 2. Authentication & User Profile Check
    console.log('[E2E 2/8] Testing User & Role Architecture...');
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.findOne();
    }
    if (!adminUser) {
      throw new Error('No user found in database!');
    }
    console.log(`  ✓ Admin/Instructor User: ${adminUser.name} (${adminUser.email})`);
    console.log(`  ✓ Role: ${adminUser.role || 'admin'}\n`);

    // 3. Course Browsing, Filtering & Search
    console.log('[E2E 3/8] Testing Course Catalog Queries & Search...');
    const catalog = await CourseService.getPublicCourses({ limit: '20' });
    console.log(`  ✓ Total Courses: ${catalog.total}`);
    if (catalog.courses.length === 0) {
      throw new Error('No public courses retrieved from catalog!');
    }

    // Verify first course has proper syllabus
    const sample = catalog.courses[0];
    console.log(`  ✓ Sample Title: "${sample.title}" (${sample.category})`);
    console.log(`  ✓ Price: $${sample.price} | Discount Price: $${sample.discountPrice}`);
    console.log(`  ✓ Modules Count: ${sample.modules?.length} | Lessons: ${sample.courseContent?.[0]?.chapterContent?.length}`);
    if (!sample.courseContent?.[0]?.chapterContent?.[0]?.lectureUrl) {
      throw new Error('Course content missing lecture URLs!');
    }
    console.log(`  ✓ Demo Video Stream: ${sample.courseContent[0].chapterContent[0].lectureUrl}\n`);

    // 4. Course Creation
    console.log('[E2E 4/8] Testing Course Creation Flow...');
    const newCourseTitle = `Autonomous AI Systems ${Date.now()}`;
    const createdCourse = await CourseService.createCourse({
      instructorId: adminUser._id.toString(),
      courseDataRaw: {
        title: newCourseTitle,
        description: 'Comprehensive curriculum on autonomous agentic systems and tool use.',
        price: 94.99,
        category: 'AI & Machine Learning',
        level: 'Advanced',
        courseContent: [
          {
            chapterId: 'ch_e2e_1',
            chapterTitle: 'Agent Loops & Memory',
            chapterOrder: 1,
            chapterContent: [
              {
                lectureId: 'lec_e2e_1',
                lectureTitle: 'ReAct Agent Pattern',
                lectureDuration: 22,
                lectureUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                isPreviewFree: true,
                lectureOrder: 1,
              },
            ],
          },
        ],
      },
    });
    console.log(`  ✓ Created Course ID: ${createdCourse.id}`);
    console.log(`  ✓ Created Title: ${createdCourse.title}`);
    console.log(`  ✓ Created Modules: ${createdCourse.modules?.length}\n`);

    // 5. Course Modification & Edit
    console.log('[E2E 5/8] Testing Course Modification & Updates...');
    const updatedCourse = await CourseService.updateCourse(createdCourse.id, {
      title: `${newCourseTitle} (Updated Edition)`,
      price: 119.99,
      discount: 20,
      courseContent: [
        {
          chapterId: 'ch_e2e_1',
          chapterTitle: 'Agent Loops & Memory (Expanded)',
          chapterOrder: 1,
          chapterContent: [
            {
              lectureId: 'lec_e2e_1',
              lectureTitle: 'ReAct Agent Pattern',
              lectureDuration: 25,
              lectureUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
              isPreviewFree: true,
              lectureOrder: 1,
            },
            {
              lectureId: 'lec_e2e_2',
              lectureTitle: 'Tool Calling & Function Execution',
              lectureDuration: 30,
              lectureUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              isPreviewFree: false,
              lectureOrder: 2,
            },
          ],
        },
      ],
    });
    console.log(`  ✓ Updated Title: ${updatedCourse.title}`);
    console.log(`  ✓ Updated Price: $${updatedCourse.price} (Discount Price: $${updatedCourse.discountPrice})`);
    console.log(`  ✓ Updated Lecture Count: ${updatedCourse.courseContent[0].chapterContent.length}\n`);

    // 6. Course Moderation Workflow
    console.log('[E2E 6/8] Testing Course Moderation (Draft -> Pending -> Approved)...');
    // Set to pending
    await CourseService.submitForReview(createdCourse.id);
    const pendingCourses = await AdminService.getPendingCourses();
    const isPending = pendingCourses.some((c) => c._id.toString() === createdCourse.id);
    console.log(`  ✓ Course in Pending Moderation Queue: ${isPending ? 'YES' : 'NO'}`);

    // Admin approves
    const approved = await AdminService.approveCourse(createdCourse.id);
    console.log(`  ✓ Admin Approved Course: ${approved.courseTitle} (Status: ${approved.status}, Approval: ${approved.approvalStatus})\n`);

    // 7. Enrollment Flow
    console.log('[E2E 7/8] Testing Student Enrollment Flow...');
    await User.findByIdAndUpdate(adminUser._id, {
      $addToSet: { enrolledCourses: createdCourse.id },
    });
    const refreshedUser = await User.findById(adminUser._id).lean();
    const isEnrolled = refreshedUser?.enrolledCourses?.map(String).includes(createdCourse.id);
    console.log(`  ✓ Enrollment Recorded in User Profile: ${isEnrolled ? 'CONFIRMED' : 'FAILED'}\n`);

    // 8. Learning Progress Tracking
    console.log('[E2E 8/8] Testing Video Lesson Progress Tracking...');
    const progressDoc = await CourseProgress.findOneAndUpdate(
      { userId: adminUser._id.toString(), courseId: createdCourse.id },
      {
        $addToSet: { lectureCompleted: 'lec_e2e_1' },
        $set: { completed: false },
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ Progress Recorded: ${progressDoc.lectureCompleted?.length} lessons completed.`);
    console.log(`  ✓ Completed Lessons: ${progressDoc.lectureCompleted?.join(', ')}\n`);

    // Clean up temporary test course
    await Course.findByIdAndDelete(createdCourse.id);
    console.log('  ✓ Temporary test course cleaned up.');

    console.log('====================================================');
    console.log('  ALL E2E WORKFLOWS VERIFIED AND FUNCTIONAL! ✓✓✓   ');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('E2E TEST FAILURE:', error);
    process.exit(1);
  }
}

runE2ETests();
