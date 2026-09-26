import Certificate from '../models/Certificate.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

export class CertificateService {
  /**
   * Generates a completion certificate when 100% course progress requirement is satisfied
   */
  static async generateCertificate(studentId: string, courseId: string) {
    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      throw new ApiError(403, 'You are not enrolled in this course.');
    }

    // Verify 100% course completion
    if (enrollment.progress < 100 && enrollment.status !== 'completed') {
      throw new ApiError(
        400,
        `Course completion required. Your current progress is ${enrollment.progress}%.`
      );
    }

    // Check if certificate already exists
    let existingCert = await Certificate.findOne({ studentId, courseId })
      .populate('studentId', 'name email profileImage')
      .populate('courseId', 'courseTitle title educator')
      .lean();

    if (existingCert) {
      return existingCert;
    }

    const currentYear = new Date().getFullYear();
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const certificateId = `CERT-${currentYear}-${randomCode}`;
    const verificationCode = `VC-${Date.now().toString(36).toUpperCase()}-${randomCode}`;

    const newCert = await Certificate.create({
      studentId,
      courseId,
      certificateId,
      issueDate: new Date(),
      verificationCode,
    });

    return await Certificate.findById(newCert._id)
      .populate('studentId', 'name email profileImage')
      .populate('courseId', 'courseTitle title educator')
      .lean();
  }

  /**
   * Public API: Verifies certificate authenticity by ID, code, or MongoDB ID
   */
  static async verifyCertificate(identifier: string) {
    let cert: any = null;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      cert = await Certificate.findById(identifier);
    }

    if (!cert) {
      cert = await Certificate.findOne({
        $or: [
          { certificateId: identifier },
          { verificationCode: identifier },
        ],
      });
    }

    if (!cert) {
      return {
        isValid: false,
        message: 'Certificate not found or invalid verification code.',
      };
    }

    const student = await User.findById(cert.studentId).select('name email profileImage imageUrl').lean();
    const course = await Course.findById(cert.courseId).select('courseTitle title educator category').lean();

    return {
      isValid: true,
      certificateId: cert.certificateId,
      issueDate: cert.issueDate,
      verificationCode: cert.verificationCode,
      pdfUrl: cert.pdfUrl || '',
      student: {
        studentId: student?._id || cert.studentId,
        name: student?.name || 'Student',
        email: student?.email || '',
      },
      course: {
        courseId: course?._id || cert.courseId,
        title: course?.courseTitle || (course as any)?.title || 'Course',
        educator: course?.educator || '',
      },
    };
  }
}

export default CertificateService;
