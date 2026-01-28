import {
    LayoutDashboard, Users, Calendar, User,
    TestTube, Activity
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MenuItem {
    title: string;
    path: string;
    icon: LucideIcon;
}

export type UserRole = 'ADMIN' | 'DOCTOR' | 'LAB' | 'RECEPTIONIST';

export const MENU_CONFIG: Record<UserRole | 'DEFAULT', MenuItem[]> = {
    DEFAULT: [
        { title: 'Dashboard', path: '/', icon: LayoutDashboard },
    ],
    ADMIN: [
        { title: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { title: 'Manage Users', path: '/admin/users', icon: Users },
        { title: 'Appointments', path: '/appointments', icon: Calendar },
        { title: 'Patients', path: '/patients', icon: User },
        { title: 'Lab Reports', path: '/lab/reports', icon: TestTube },
        { title: 'OPD Queue', path: '/queue', icon: Activity },
    ],
    DOCTOR: [
        { title: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
        { title: 'Appointments', path: '/appointments', icon: Calendar },
        { title: 'Patients', path: '/patients', icon: User },
    ],
    LAB: [
        { title: 'Dashboard', path: '/lab/dashboard', icon: LayoutDashboard },
        { title: 'Lab Reports', path: '/lab/reports', icon: TestTube },
    ],
    RECEPTIONIST: [
        { title: 'Dashboard', path: '/receptionist/dashboard', icon: LayoutDashboard },
        { title: 'OPD Queue', path: '/queue', icon: Activity },
    ],
};
