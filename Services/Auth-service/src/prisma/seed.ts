import dotenv from "dotenv";
dotenv.config();
import prisma from "./client.js"
import { hashPassword } from "@utils/password.js";

const seedAdmin = async () => {
    try {
        console.log("Seeding ADMIN...");

        const existingAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
        if (existingAdmin) return console.log("ADMIN already exists. Skiping seed.");

        const AdminEmail = process.env.ADMIN_EMAIL;
        const AdminPassword = process.env.ADMIN_PASSWORD;

        if (!AdminEmail || !AdminPassword) return console.log("Email or Password is missing!!!")

        const hashedPassword = await hashPassword(AdminPassword);

        await prisma.user.create({
            data: {
                name: "Neel Raiyani",
                email: AdminEmail,
                password: hashedPassword,
                role: "ADMIN",
                isPasswordChanged: false
            }
        });

        console.log("ADMIN");
        console.log("Login Credentials:");
        console.log("ID:", AdminEmail);
        console.log("Password:", AdminPassword);
    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();
