import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../constants/roles.js';

const userSchema = new mongoose.Schema(
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
      select: false, // Hidden by default from queries
    },
    role: {
      type: String,
      enum: [ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN, 'educator'],
      default: ROLES.STUDENT,
    },
    // Both profileImage and imageUrl are supported for backward compatibility
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
        type: mongoose.Schema.Types.ObjectId,
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

// Virtual property to sync profileImage and imageUrl
userSchema.virtual('avatar').get(function () {
  return this.profileImage || this.imageUrl || '';
});

// Pre-save hook: Hash password if modified
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  // Sync profileImage & imageUrl
  if (this.imageUrl && !this.profileImage) {
    this.profileImage = this.imageUrl;
  } else if (this.profileImage && !this.imageUrl) {
    this.imageUrl = this.profileImage;
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

// Check if model already compiled to prevent recompilation errors in serverless
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
