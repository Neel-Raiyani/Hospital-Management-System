export interface AuthUserPayload {
    userId: string;
    role: string;
    email: string;
    name: string;
    forcePasswordChange: boolean;
}