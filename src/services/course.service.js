import Course from '../models/Course.js';
import { ApiError } from '../utils/apiError.js';

export class CourseService {
  static async getAllCourses() {
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });

    const courses = await Course.find({ isPublished: true })
      .select(['-courseContent', '-enrolledStudents'])
      .populate({ path: 'educator' });

    return {
      totalCourses,
      publishedCourses,
      courses,
    };
  }

  static async getCourseById(id) {
    const courseData = await Course.findById(id).populate({ path: 'educator' });
    if (!courseData) {
      throw new ApiError(404, 'Course not found');
    }

    // Mask non-free preview lecture URLs for guests/un-enrolled visitors
    if (courseData.courseContent && Array.isArray(courseData.courseContent)) {
      courseData.courseContent.forEach(chapter => {
        if (chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
          chapter.chapterContent.forEach(lecture => {
            if (!lecture.isPreviewFree) {
              lecture.lectureUrl = '';
            }
          });
        }
      });
    }

    return courseData;
  }

  static async updateCourse(courseId, updateData) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    Object.keys(updateData).forEach(key => {
      course[key] = updateData[key];
    });

    await course.save();
    return course;
  }

  static async getEducatorCourses(educatorId) {
    const courses = await Course.find({ educator: educatorId });
    return courses;
  }

  static async addChapter(courseId, chapter) {
    if (!courseId || !chapter) {
      throw new ApiError(400, 'Missing courseId or chapter data');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    course.courseContent.push({
      ...chapter,
      chapterContent: [],
    });

    await course.save();
    return course;
  }

  static async addLecture(courseId, chapterId, lecture) {
    if (!courseId || !chapterId || !lecture) {
      throw new ApiError(400, 'Missing required lecture data');
    }

    if (!lecture.lectureUrl) {
      throw new ApiError(400, 'Lecture URL is required');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const chapter = course.courseContent.find(ch => ch.chapterId === chapterId);
    if (!chapter) {
      throw new ApiError(404, 'Chapter not found in course');
    }

    chapter.chapterContent.push({
      ...lecture,
      lectureDuration: Number(lecture.lectureDuration) || 0,
      lectureOrder: Number(lecture.lectureOrder) || 0,
    });

    await course.save();
    return course;
  }
}

export default CourseService;
