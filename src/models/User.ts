import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../constants/roles.js';
import { IUserDocument } from '../types/user.types.js';

const userSchema = new Schema<IUserDocument>(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    name: {
      type: String,
      default: 'Unnamed User',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: [ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN, 'educator'],
      default: ROLES.STUDENT,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    enrolledCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('avatar').get(function (this: IUserDocument) {
  return this.profileImage || this.imageUrl || '';
});

userSchema.pre('save', async function (this: IUserDocument, next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.imageUrl && !this.profileImage) {
    this.profileImage = this.imageUrl;
  } else if (this.profileImage && !this.imageUrl) {
    this.imageUrl = this.profileImage;
  }
  next();
});

userSchema.methods.comparePassword = async function (
  this: IUserDocument,
  enteredPassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

export const User: Model<IUserDocument> =
  (mongoose.models.User as Model<IUserDocument>) ||
  mongoose.model<IUserDocument>('User', userSchema);

export default User;
