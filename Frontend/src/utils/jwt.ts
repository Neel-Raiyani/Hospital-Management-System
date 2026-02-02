import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
    userId: string;
    role: 'ADMIN' | 'DOCTOR' | 'LAB' | 'RECEPTIONIST';
    email: string;
    name: string;
    forcePasswordChange: boolean;
    iat: number;
    exp: number;
}

export const decodeToken = (token: string): JWTPayload | null => {
    try {
        return jwtDecode<JWTPayload>(token);
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
};

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = decodeToken(token);
        if (!decoded) return true;

        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
};

export const getTokenRole = (token: string): string | null => {
    const decoded = decodeToken(token);
    return decoded ? decoded.role : null;
};

export const getUserFromToken = (token: string) => {
    const decoded = decodeToken(token);
    if (!decoded) return null;

    const email = decoded.email || '';
    const name = decoded.name || (email ? email.split('@')[0] : 'Admin');

    return {
        id: decoded.userId,
        name: name,
        email: email,
        role: decoded.role,
        forcePasswordChange: decoded.forcePasswordChange,
    };
};
