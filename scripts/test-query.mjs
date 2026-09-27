import { connectDB } from '../dist/src/database/connect.js';
import CourseService from '../dist/src/modules/courses/course.service.js';

async function testQuery() {
  try {
    await connectDB();
    console.log('[Test] Testing CourseService.getPublicCourses...');

    // 1. Basic listing
    const resAll = await CourseService.getPublicCourses({ limit: '5' });
    console.log(`- Retrieved ${resAll.courses.length} courses (total: ${resAll.total})`);
    const first = resAll.courses[0];
    console.log('Sample course fields:', {
      id: first.id,
      title: first.title,
      price: first.price,
      discountPrice: first.discountPrice,
      category: first.category,
      modulesCount: first.modules?.length,
      courseContentCount: first.courseContent?.length,
      firstLessonTitle: first.courseContent?.[0]?.chapterContent?.[0]?.lectureTitle,
      firstLessonVideo: first.courseContent?.[0]?.chapterContent?.[0]?.lectureUrl,
    });

    // 2. Search test
    const resSearch = await CourseService.getPublicCourses({ search: 'React' });
    console.log(`- Search 'React': found ${resSearch.courses.length} courses (${resSearch.courses.map(c => c.title).join(', ')})`);

    // 3. Category filter test
    const resCat = await CourseService.getPublicCourses({ category: 'Cloud Computing' });
    console.log(`- Category 'Cloud Computing': found ${resCat.courses.length} courses`);

    // 4. Level filter test
    const resLvl = await CourseService.getPublicCourses({ level: 'Advanced' });
    console.log(`- Level 'Advanced': found ${resLvl.courses.length} courses`);

    // 5. Price filter test
    const resPrice = await CourseService.getPublicCourses({ price: 'under-75' });
    console.log(`- Price 'under-75': found ${resPrice.courses.length} courses`);

    // 6. Course details test
    const resDetail = await CourseService.getCourseByIdOrSlug(first.id, true);
    console.log('- Course details by ID:', resDetail?.title, '| Modules:', resDetail?.modules?.length);

    console.log('[SUCCESS] All course queries verified!');
    process.exit(0);
  } catch (err) {
    console.error('[FAIL] Query error:', err);
    process.exit(1);
  }
}

testQuery();
