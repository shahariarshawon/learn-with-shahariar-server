import Lesson from './lesson.model.js';
import { ApiError } from '../../utils/apiError.js';
import { ILesson } from './lesson.types.js';

export class LessonService {
  static async getLessonsByCourse(courseId: string) {
    return Lesson.find({ courseId }).sort({ order: 1 });
  }

  static async getLessonById(lessonId: string) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new ApiError(404, 'Lesson not found');
    }
    return lesson;
  }

  static async createLesson(lessonData: Partial<ILesson>) {
    return Lesson.create(lessonData);
  }

  static async updateLesson(lessonId: string, updateData: Partial<ILesson>) {
    const lesson = await Lesson.findByIdAndUpdate(lessonId, updateData, { new: true });
    if (!lesson) {
      throw new ApiError(404, 'Lesson not found');
    }
    return lesson;
  }

  static async deleteLesson(lessonId: string) {
    const lesson = await Lesson.findByIdAndDelete(lessonId);
    if (!lesson) {
      throw new ApiError(404, 'Lesson not found');
    }
    return { message: 'Lesson deleted successfully' };
  }
}

export default LessonService;
