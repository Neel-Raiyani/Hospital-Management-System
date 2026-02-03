import type { Request, Response } from "express";
import { hashPassword, comparePassword } from "@utils/password.js";
import { generateToken } from "@utils/jwt.js";
import prisma from "../prisma/client.js";
import logger from "@utils/logger.js";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, role, doctorData, receptionistData, labStaffData } =
      req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(password);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });

      if (role === "DOCTOR") {
        const doctor = await tx.doctor.create({
          data: {
            userId: user.id,
            name,
            specialization: doctorData.specialization,
            qualification: doctorData.qualification,
            experienceYears: doctorData.experienceYears,
            opdStartTime: doctorData.opdStartTime,
            opdEndTime: doctorData.opdEndTime,
          },
        });

        await tx.oPD.create({
          data: {
            doctorId: doctor.id,
            startTime: doctor.opdStartTime,
            endTime: doctor.opdEndTime,
          },
        });
      }

      if (role === "RECEPTIONIST") {
        await tx.receptionist.create({
          data: {
            userId: user.id,
            name,
            phone: receptionistData.phone,
            shift: receptionistData.shift,
          },
        });
      }

      if (role === "LAB") {
        await tx.labStaff.create({
          data: {
            userId: user.id,
            name,
            phone: labStaffData.phone,
            shift: labStaffData.shift,
          },
        });
      }
    });

    logger.info(
      `User created successfully | userEmail=${email} | role=${role}`
    );
    res.status(201).json({
      message: `${role} created successfully.`,
      Credentials: { email, password: password },
      Doctor_Details: doctorData,
      Receptionist_Details: receptionistData,
      Lab_Staff_Details: labStaffData,
    });
  } catch (error) {
    logger.error(
      `Create user failed | email=${req.body?.email ?? "unknown"} | error=${(error as Error).message
      }`
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = generateToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      forcePasswordChange: !user.isPasswordChanged,
    });

    logger.info(`Login successful | userId=${user.id} | role=${user.role}`);
    res.status(200).json({ message: "User login successfull", token });
  } catch (error) {
    logger.error(
      `Login error | email=${req.body?.email ?? "unknown"} | error=${(error as Error).message
      }`
    );
    res.status(500).json({ message: "Login failed" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await hashPassword(newPassword);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        isPasswordChanged: true,
      },
    });

    const token = generateToken({
      userId: updatedUser.id,
      role: updatedUser.role,
      email: updatedUser.email,
      name: updatedUser.name,
      forcePasswordChange: false,
    });

    logger.info(`Password changed successfully | userId=${userId}`);
    res.status(201).json({ message: "Password changed successfully", token });

  } catch (error) {
    logger.error(`Password change error | userId=${req.user?.userId ?? "unknown"} | error=${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch role-specific data in parallel
    const [doctors, receptionists, labStaff] = await Promise.all([
      prisma.doctor.findMany({
        select: {
          userId: true,
          specialization: true,
          experienceYears: true,
          opdStartTime: true,
          opdEndTime: true,
        },
      }),
      prisma.receptionist.findMany({
        select: {
          userId: true,
          phone: true,
          shift: true,
        },
      }),
      prisma.labStaff.findMany({
        select: {
          userId: true,
          phone: true,
          shift: true,
        },
      }),
    ]);

    // Create lookup maps
    const doctorMap = new Map(doctors.map((d) => [d.userId, d]));
    const receptionistMap = new Map(receptionists.map((r) => [r.userId, r]));
    const labStaffMap = new Map(labStaff.map((l) => [l.userId, l]));

    // Transform the data to flatten role-specific fields
    const transformedUsers = users.map((user) => {
      const doctor = doctorMap.get(user.id);
      const receptionist = receptionistMap.get(user.id);
      const lab = labStaffMap.get(user.id);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.isActive ? 'ACTIVE' : 'INACTIVE',
        createdAt: user.createdAt,
        // Doctor fields
        specialization: doctor?.specialization ?? null,
        experienceYears: doctor?.experienceYears ?? null,
        opdStartTime: doctor?.opdStartTime ?? null,
        opdEndTime: doctor?.opdEndTime ?? null,
        // Receptionist/Lab fields
        phone: receptionist?.phone ?? lab?.phone ?? null,
        shift: receptionist?.shift ?? lab?.shift ?? null,
      };
    });

    logger.info(`Fetched ${transformedUsers.length} users`);
    res.status(200).json(transformedUsers);
  } catch (error) {
    logger.error(`Get users error | error=${(error as Error).message}`);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: "isActive must be a boolean" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    const action = isActive ? 'activated' : 'deactivated';
    logger.info(`User ${action} successfully | userId=${userId}`);
    res.status(200).json({ message: `User ${action} successfully` });
  } catch (error) {
    logger.error(`Update user status error | userId=${req.params?.userId ?? "unknown"} | error=${(error as Error).message}`);
    res.status(500).json({ message: "Failed to update user status" });
  }
};
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId || req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let roleData = null;
    if (user.role === "DOCTOR") {
      roleData = await prisma.doctor.findUnique({ where: { userId: user.id } });
    } else if (user.role === "RECEPTIONIST") {
      roleData = await prisma.receptionist.findUnique({ where: { userId: user.id } });
    } else if (user.role === "LAB") {
      roleData = await prisma.labStaff.findUnique({ where: { userId: user.id } });
    }

    res.status(200).json({
      ...user,
      status: user.isActive ? 'ACTIVE' : 'INACTIVE',
      ...(roleData || {}),
    });
  } catch (error) {
    logger.error(`Get user profile error | error=${(error as Error).message}`);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};
