import { JwtPayload } from 'jsonwebtoken';

export interface IJwtTokenPayload extends JwtPayload {
  id: string;
  role?: string;
}

export interface IAuthRequestUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}
