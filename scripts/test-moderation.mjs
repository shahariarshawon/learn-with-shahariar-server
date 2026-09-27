import { connectDB } from '../dist/src/database/connect.js';
import AdminService from '../dist/src/services/admin.service.js';
import CourseService from '../dist/src/modules/courses/course.service.js';
import Course from '../dist/src/models/Course.js';

async function testModeration() {
  try {
    await connectDB();
    console.log('[Test] Testing Admin Moderation Workflow...');

    // 1. Get pending courses
    const pendingList = await AdminService.getPendingCourses();
    console.log(`- Pending courses awaiting moderation: ${pendingList.length}`);
    if (pendingList.length === 0) {
      console.log('No pending courses found, creating a test pending course...');
      await Course.create({
        courseTitle: 'Raft Distributed Consensus Deep Dive',
        title: 'Raft Distributed Consensus Deep Dive',
        slug: 'raft-distributed-consensus-deep-dive',
        courseDescription: 'Mastering distributed consensus protocols in production systems.',
        coursePrice: 89.99,
        educator: 'user_3CJ6z3IhyWNAALg7ly2HqoHWmJu',
        status: 'draft',
        approvalStatus: 'pending',
        isPublished: false,
      });
    }

    const targetPending = (await AdminService.getPendingCourses())[0];
    console.log(`Target Pending Course: ${targetPending._id} | ${targetPending.courseTitle} | Status: ${targetPending.status} | Approval: ${targetPending.approvalStatus}`);

    // 2. Approve course
    const approvedCourse = await AdminService.approveCourse(targetPending._id.toString());
    console.log('Approved Course:', {
      id: approvedCourse._id.toString(),
      title: approvedCourse.courseTitle,
      status: approvedCourse.status,
      approvalStatus: approvedCourse.approvalStatus,
      isPublished: approvedCourse.isPublished,
    });

    if (approvedCourse.approvalStatus !== 'approved' || approvedCourse.status !== 'published' || !approvedCourse.isPublished) {
      throw new Error('Approval assertion failed!');
    }

    // 3. Reject course test
    const rejectedCourse = await AdminService.rejectCourse(targetPending._id.toString(), 'Requires additional unit testing modules');
    console.log('Rejected Course:', {
      id: rejectedCourse._id.toString(),
      status: rejectedCourse.status,
      approvalStatus: rejectedCourse.approvalStatus,
      rejectionReason: rejectedCourse.rejectionReason,
    });

    // Reset back to pending for live UI demo
    await Course.findByIdAndUpdate(targetPending._id, {
      status: 'draft',
      approvalStatus: 'pending',
      isPublished: false,
    });

    console.log('[SUCCESS] Admin Moderation Workflow fully verified!');
    process.exit(0);
  } catch (err) {
    console.error('[FAIL] Moderation test error:', err);
    process.exit(1);
  }
}

testModeration();
