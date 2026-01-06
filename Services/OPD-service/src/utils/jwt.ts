import env from '@config/env.js';
import jwt from 'jsonwebtoken';
import type { AuthUserPayload } from 'types/auth.js';

export const verifyToken = (token: string): AuthUserPayload => {
    return jwt.verify(token, env.jwt_secret) as AuthUserPayload;
};
