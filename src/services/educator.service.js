import { clerkClient } from '@clerk/express';
import { v2 as cloudinary } from 'cloudinary';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../constants/roles.js';

export class EducatorService {
  static async updateRoleToEducator(userId) {
    if (!userId) {
      throw new ApiError(400, 'User ID is required');
    }

    // Update in Clerk if available
    try {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: 'educator',
        },
      });
    } catch (err) {
      console.warn('[EducatorService] Clerk metadata update warning:', err.message);
    }

    // Update in MongoDB
    await User.findByIdAndUpdate(userId, { role: ROLES.INSTRUCTOR });

    return { message: 'You can publish a course now' };
  }

  static async addCourse({ educatorId, courseDataRaw, imageFile }) {
    if (!imageFile) {
      throw new ApiError(400, 'Thumbnail image not attached');
    }

    let parsedCourseData;
    if (typeof courseDataRaw === 'string') {
      try {
        parsedCourseData = JSON.parse(courseDataRaw);
      } catch (err) {
        throw new ApiError(400, 'Invalid JSON format in courseData');
      }
    } else {
      parsedCourseData = courseDataRaw;
    }

    parsedCourseData.educator = educatorId;

    // Upload thumbnail to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      folder: 'lws_courses',
    });

    parsedCourseData.courseThumbnail = imageUpload.secure_url;

    const newCourse = await Course.create(parsedCourseData);
    await newCourse.save();

    return newCourse;
  }

  static async getEducatorCourses(educatorId) {
    const courses = await Course.find({ educator: educatorId });
    return courses;
  }

  static async getDashboardData(educatorId) {
    const courses = await Course.find({ educator: educatorId });
    const totalCourses = courses.length;
    const courseIds = courses.map(course => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: 'completed',
    });

    const totalEarnings = Math.round(
      purchases.reduce((sum, purchase) => sum + purchase.amount, 0)
    ).toFixed(2);

    const enrolledStudentsData = [];
    for (const course of courses) {
      const students = await User.find(
        { _id: { $in: course.enrolledStudents } },
        'name imageUrl profileImage'
      );

      students.forEach(student => {
        enrolledStudentsData.push({
          courseTitle: course.courseTitle,
          student,
        });
      });
    }

    return {
      totalEarnings,
      enrolledStudentsData,
      totalCourses,
    };
  }

  static async getEnrolledStudentsData(educatorId) {
    const courses = await Course.find({ educator: educatorId });
    const courseIds = courses.map(course => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: 'completed',
    })
      .populate('userId', 'name imageUrl profileImage')
      .populate('courseId', 'courseTitle');

    const enrolledStudents = purchases.map(purchase => ({
      student: purchase.userId,
      courseTitle: purchase.courseId?.courseTitle || 'Untitled Course',
      purchaseDate: purchase.createdAt,
    }));

    return enrolledStudents;
  }
}

export default EducatorService;
