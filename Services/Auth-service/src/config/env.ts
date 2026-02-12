import { config } from "dotenv";
config();

export const env = {
    port: process.env.PORT || 4019,
    jwtSecret: process.env.JWT_SECRET as string,
    mongo_URI: process.env.DATABASE_URL as string,
    log_dir: process.env.LOG_DIR,
    mail_host: process.env.SMTP_HOST,
    mail_port: parseInt(process.env.SMTP_PORT || '587'),
    mail_user: process.env.SMTP_USER,
    mail_pass: process.env.SMTP_PASS,
    mail_from: process.env.SMTP_FROM,
    frontend_url: process.env.FRONTEND_URL || 'http://localhost:5173'
}