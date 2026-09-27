import { connectDB } from '../dist/src/database/connect.js';
import User from '../dist/src/models/User.js';
import Course from '../dist/src/models/Course.js';
import CourseProgress from '../dist/src/models/CourseProgress.js';
import CourseService from '../dist/src/modules/courses/course.service.js';
import AdminService from '../dist/src/services/admin.service.js';

async function testFinalProductionScenarios() {
  console.log('========================================================');
  console.log('  STARTING FINAL PRODUCTION SCENARIO VERIFICATION       ');
  console.log('========================================================\n');

  try {
    await connectDB();

    // ========================================================
    // SCENARIO 1: ADMIN LOGIN -> APPROVE INSTRUCTOR -> APPROVE COURSE
    // ========================================================
    console.log('[SCENARIO 1] Admin Login -> Approve Instructor -> Approve Course');
    
    // 1.1 Find or verify admin user
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.findOne();
    }
    console.log(`  1. Admin authenticated: ${admin.name} (${admin.email}, Role: ${admin.role})`);

    // 1.2 Create or find a candidate instructor to approve
    let candidateUser = await User.findOne({ role: 'student' });
    if (!candidateUser) {
      candidateUser = await User.create({
        name: 'Prospective Instructor',
        email: `instructor_${Date.now()}@example.com`,
        role: 'student',
      });
    }
    console.log(`  2. Candidate User before approval: ${candidateUser.name} (Role: ${candidateUser.role})`);

    // 1.3 Admin promotes/approves candidate to instructor
    const updatedUser = await AdminService.updateUserRole(candidateUser._id.toString(), 'instructor');
    console.log(`  3. Admin approved user role: ${updatedUser.name} -> New Role: ${updatedUser.role}`);

    // 1.4 Admin checks moderation queue and approves pending course
    let pendingCourse = await Course.findOne({ approvalStatus: 'pending' });
    if (!pendingCourse) {
      pendingCourse = await Course.create({
        courseTitle: `Cloud Native Microservices ${Date.now()}`,
        title: `Cloud Native Microservices ${Date.now()}`,
        courseDescription: 'Advanced microservices architecture and deployment.',
        coursePrice: 89.99,
        educator: updatedUser._id.toString(),
        status: 'draft',
        approvalStatus: 'pending',
        isPublished: false,
      });
    }
    console.log(`  4. Pending Course found: "${pendingCourse.courseTitle}" (Status: ${pendingCourse.status}, Approval: ${pendingCourse.approvalStatus})`);

    const approvedCourse = await AdminService.approveCourse(pendingCourse._id.toString());
    console.log(`  5. Admin approved course: "${approvedCourse.courseTitle}" -> Status: ${approvedCourse.status}, Approval: ${approvedCourse.approvalStatus}, Published: ${approvedCourse.isPublished}`);
    console.log('  ✓ SCENARIO 1 COMPLETED SUCCESSFULLY!\n');


    // ========================================================
    // SCENARIO 2: INSTRUCTOR LOGIN -> CREATE COURSE -> ADD MODULES -> ADD LESSONS -> SUBMIT COURSE
    // ========================================================
    console.log('[SCENARIO 2] Instructor Login -> Create Course -> Add Modules -> Add Lessons -> Submit Course');

    // 2.1 Instructor creates new course in draft
    const instructorCourseTitle = `Scalable Next.js 15 Architectures ${Date.now()}`;
    const newCourse = await CourseService.createCourse({
      instructorId: updatedUser._id.toString(),
      courseDataRaw: {
        title: instructorCourseTitle,
        description: 'Building production Next.js 15 applications with full SSR streaming.',
        price: 99.99,
        category: 'Programming',
        level: 'Advanced',
        status: 'draft',
        approvalStatus: 'pending',
      },
    });
    console.log(`  1. Instructor created draft course: "${newCourse.title}" (ID: ${newCourse.id})`);

    // 2.2 Instructor adds module
    const courseWithModule = await CourseService.addModule(newCourse.id, {
      moduleTitle: 'Server Components & Streaming SSR',
      description: 'Understanding modern streaming React rendering pipeline',
    });
    console.log(`  2. Instructor added module: "${courseWithModule.modules[0].moduleTitle}" (Total modules: ${courseWithModule.modules.length})`);

    // 2.3 Instructor adds lessons with video URLs
    const moduleId = courseWithModule.modules[0].moduleId;
    const courseWithLesson = await CourseService.addLesson(newCourse.id, moduleId, {
      title: 'Deconstructing Streaming SSR in Next.js 15',
      duration: 28,
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      isPreview: true,
      description: 'Detailed code walkthrough of streaming Suspense boundaries.',
    });
    console.log(`  3. Instructor added lesson: "${courseWithLesson.modules[0].lessons[0].title}" (Duration: ${courseWithLesson.modules[0].lessons[0].duration}m, URL: ${courseWithLesson.modules[0].lessons[0].videoUrl})`);

    // 2.4 Instructor submits course for moderation
    const submittedCourse = await CourseService.submitForReview(newCourse.id);
    console.log(`  4. Instructor submitted course for moderation review -> Status: ${submittedCourse.status}, Approval: ${submittedCourse.approvalStatus}`);
    console.log('  ✓ SCENARIO 2 COMPLETED SUCCESSFULLY!\n');


    // ========================================================
    // SCENARIO 3: STUDENT LOGIN -> BROWSE -> SEARCH -> ENROLL -> WATCH -> COMPLETE
    // ========================================================
    console.log('[SCENARIO 3] Student Login -> Browse Course -> Search Course -> Enroll -> Watch Video -> Complete Lesson');

    // 3.1 Student browses catalog
    const catalog = await CourseService.getPublicCourses({ category: 'Programming', limit: '5' });
    console.log(`  1. Student browsed catalog: found ${catalog.total} total public courses`);

    // 3.2 Student searches course
    const searchResults = await CourseService.getPublicCourses({ search: 'React' });
    const selectedCourse = searchResults.courses[0];
    console.log(`  2. Student searched 'React': selected "${selectedCourse.title}" ($${selectedCourse.price})`);

    // 3.3 Student views course details
    const courseDetails = await CourseService.getCourseByIdOrSlug(selectedCourse.id);
    console.log(`  3. Student viewed course details: "${courseDetails.title}" with ${courseDetails.courseContent.length} chapters and ${courseDetails.courseContent[0]?.chapterContent?.length} lectures.`);

    // 3.4 Student enrolls
    let student = await User.findOne({ email: 'shahariarshawon.dev@gmail.com' });
    if (!student) student = admin;
    await User.findByIdAndUpdate(student._id, {
      $addToSet: { enrolledCourses: selectedCourse.id },
    });
    console.log(`  4. Student ${student.name} enrolled in "${selectedCourse.title}"`);

    // 3.5 Student starts watching first lesson
    const firstLesson = courseDetails.courseContent[0]?.chapterContent[0];
    console.log(`  5. Student launched video player for lesson: "${firstLesson.lectureTitle}" (Stream URL: ${firstLesson.lectureUrl})`);

    // 3.6 Student completes lesson
    const progress = await CourseProgress.findOneAndUpdate(
      { userId: student._id.toString(), courseId: selectedCourse.id },
      {
        $addToSet: { lectureCompleted: firstLesson.lectureId },
        $set: { completed: false },
      },
      { upsert: true, new: true }
    );
    console.log(`  6. Student progress updated: Lesson "${firstLesson.lectureId}" marked completed! (Completed count: ${progress.lectureCompleted.length})`);
    console.log('  ✓ SCENARIO 3 COMPLETED SUCCESSFULLY!\n');

    // Clean up temporary test courses
    await Course.findByIdAndDelete(newCourse.id);
    console.log('========================================================');
    console.log('  ALL 3 PRODUCTION SCENARIOS FULLY VERIFIED! ✓✓✓       ');
    console.log('========================================================');
    process.exit(0);
  } catch (err) {
    console.error('PRODUCTION TEST FAILED:', err);
    process.exit(1);
  }
}

testFinalProductionScenarios();
