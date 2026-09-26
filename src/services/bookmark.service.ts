import Bookmark from '../models/Bookmark.js';
import Course from '../models/Course.js';
import { ApiError } from '../utils/apiError.js';

export class BookmarkService {
  static async addBookmark({
    studentId,
    courseId,
    lessonId,
  }: {
    studentId: string;
    courseId: string;
    lessonId: string;
  }) {
    const existing = await Bookmark.findOne({ studentId, lessonId });
    if (existing) {
      return existing;
    }

    const bookmark = await Bookmark.create({
      studentId,
      courseId,
      lessonId,
    });

    return bookmark;
  }

  static async removeBookmark({ studentId, lessonId }: { studentId: string; lessonId: string }) {
    const deleted = await Bookmark.findOneAndDelete({ studentId, lessonId });
    if (!deleted) {
      throw new ApiError(404, 'Bookmark not found');
    }
    return { message: 'Bookmark removed successfully' };
  }

  static async getStudentBookmarks(studentId: string) {
    const bookmarks = await Bookmark.find({ studentId })
      .populate('courseId', 'courseTitle slug courseThumbnail category level')
      .sort({ createdAt: -1 });

    return bookmarks;
  }
}

export default BookmarkService;
