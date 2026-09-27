import User from '../users/user.model.js';
import { ApiError } from '../../utils/apiError.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/token.js';
import { normalizeRole, ROLES } from '../../constants/roles.js';
import { RegisterInput, LoginInput } from './auth.validation.js';
import { UserRole } from '../users/user.types.js';

export class AuthService {
  static async register({ name, email, password, role, bio, skills }: RegisterInput) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    const assignedRole = normalizeRole(role || ROLES.STUDENT) as UserRole;

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      bio: bio || '',
      skills: skills || [],
      enrolledCourses: [],
    });

    const tokenPayload = { id: user._id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        imageUrl: user.imageUrl,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login({ email, password }: LoginInput) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const tokenPayload = { id: user._id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        imageUrl: user.imageUrl,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token is required');
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || !decoded.id) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const tokenPayload = { id: user._id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}

export default AuthService;
