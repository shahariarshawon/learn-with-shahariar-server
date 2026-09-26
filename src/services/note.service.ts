import Note from '../models/Note.js';
import { ApiError } from '../utils/apiError.js';

export class NoteService {
  static async createNote({
    studentId,
    courseId,
    lessonId,
    content,
    videoTimestamp = 0,
  }: {
    studentId: string;
    courseId: string;
    lessonId: string;
    content: string;
    videoTimestamp?: number;
  }) {
    if (!content || !content.trim()) {
      throw new ApiError(400, 'Note content cannot be empty');
    }

    const note = await Note.create({
      studentId,
      courseId,
      lessonId,
      content,
      videoTimestamp,
    });

    return note;
  }

  static async updateNote({
    noteId,
    studentId,
    content,
    videoTimestamp,
  }: {
    noteId: string;
    studentId: string;
    content?: string;
    videoTimestamp?: number;
  }) {
    const note = await Note.findOne({ _id: noteId, studentId });
    if (!note) {
      throw new ApiError(404, 'Note not found or unauthorized');
    }

    if (content !== undefined) note.content = content;
    if (videoTimestamp !== undefined) note.videoTimestamp = videoTimestamp;

    await note.save();
    return note;
  }

  static async deleteNote({ noteId, studentId }: { noteId: string; studentId: string }) {
    const note = await Note.findOneAndDelete({ _id: noteId, studentId });
    if (!note) {
      throw new ApiError(404, 'Note not found or unauthorized');
    }
    return { message: 'Note deleted successfully' };
  }

  static async getLessonNotes({ studentId, lessonId }: { studentId: string; lessonId: string }) {
    const notes = await Note.find({ studentId, lessonId }).sort({ createdAt: -1 });
    return notes;
  }

  static async getCourseNotes({ studentId, courseId }: { studentId: string; courseId: string }) {
    const notes = await Note.find({ studentId, courseId }).sort({ createdAt: -1 });
    return notes;
  }
}

export default NoteService;
