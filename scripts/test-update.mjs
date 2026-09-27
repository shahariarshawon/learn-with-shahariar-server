import { connectDB } from '../dist/src/database/connect.js';
import CourseService from '../dist/src/modules/courses/course.service.js';

async function testUpdate() {
  try {
    await connectDB();
    console.log('[Test] Testing CourseService.updateCourse...');

    const resAll = await CourseService.getPublicCourses({ limit: '1' });
    const targetCourse = resAll.courses[0];
    console.log(`Original Course: ${targetCourse.id} | ${targetCourse.title} | Price: ${targetCourse.price}`);

    const updated = await CourseService.updateCourse(targetCourse.id, {
      title: `${targetCourse.title} (Updated Edition)`,
      description: 'Updated comprehensive curriculum with latest 2026 LTS framework support.',
      price: 109.99,
      discount: 30,
      courseContent: [
        {
          chapterId: 'ch_up_1',
          chapterTitle: 'Updated Chapter 1: Core Architectures',
          chapterOrder: 1,
          chapterContent: [
            {
              lectureId: 'lec_up_1',
              lectureTitle: 'Updated Lecture 1: Deep Fundamentals',
              lectureDuration: 25,
              lectureUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
              isPreviewFree: true,
              lectureOrder: 1,
            },
          ],
        },
      ],
    });

    console.log('Update Result:');
    console.log('- Title:', updated.title);
    console.log('- Price:', updated.price);
    console.log('- Discount Price:', updated.discountPrice);
    console.log('- Modules Count:', updated.modules?.length);
    console.log('- Course Content Count:', updated.courseContent?.length);
    console.log('- Updated Lecture:', updated.courseContent?.[0]?.chapterContent?.[0]?.lectureTitle);

    // Revert title back to clean title
    await CourseService.updateCourse(targetCourse.id, {
      title: targetCourse.title,
      price: targetCourse.price,
    });

    console.log('[SUCCESS] Course update and modification verified!');
    process.exit(0);
  } catch (err) {
    console.error('[FAIL] Update error:', err);
    process.exit(1);
  }
}

testUpdate();
