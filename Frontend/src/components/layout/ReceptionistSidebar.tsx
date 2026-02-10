import {
    LayoutDashboard,
    Users,
    Calendar,
    LogOut,
    Activity,
} from "lucide-react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { useAuth } from '../../context/AuthContext';
import { NavLink, Box, Text, Stack, rem, UnstyledButton } from "@mantine/core"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/Sidebar"

const navItems = [
    { path: "/receptionist/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/receptionist/appointments", label: "Appointments", icon: Calendar },
    { path: "/receptionist/patients", label: "Patients", icon: Users },
    { path: "/receptionist/book-appointment", label: "Book Appointment", icon: Calendar },
]

export function ReceptionistSidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const { logout } = useAuth()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <Sidebar collapsible="icon" className="border-r border-gray-100 bg-white">
            <SidebarHeader className="h-20 border-b border-gray-50 flex flex-row items-center gap-3 px-4 overflow-hidden group-data-[state=collapsed]:p-0 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:gap-0">
                <Box
                    className="flex aspect-square size-11 items-center justify-center rounded-xl bg-teal-600 text-white shrink-0 shadow-md shadow-teal-600/10"
                >
                    <Activity className="size-7" />
                </Box>
                <div className="flex flex-col gap-0 group-data-[state=collapsed]:hidden min-w-0 transition-opacity duration-200">
                    <Text fw={900} size="1.25rem" className="tracking-tight text-gray-950 leading-none truncate">Empyreal</Text>
                    <Text fw={800} size="10px" c="teal.6" className="uppercase tracking-[0.2em] mt-1.5 opacity-90 truncate">Health Panel</Text>
                </div>
            </SidebarHeader>

            <SidebarContent className="p-4 group-data-[state=collapsed]:px-0">
                <Stack gap="xs" className="group-data-[state=collapsed]:items-center">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <NavLink
                                key={item.path}
                                component={Link}
                                to={item.path}
                                label={<span className="group-data-[state=collapsed]:hidden font-semibold tracking-tight">{item.label}</span>}
                                leftSection={<item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />}
                                active={isActive}
                                variant="filled"
                                color="teal"
                                styles={{
                                    label: {
                                        fontSize: rem(15),
                                    },
                                    root: {
                                        borderRadius: rem(10),
                                        padding: `${rem(12)} ${rem(16)}`,
                                        height: rem(48),
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        '&[data-active]': {
                                            backgroundColor: 'var(--mantine-color-teal-6) !important',
                                            color: '#ffffff !important',
                                        },
                                        '&:hover': {
                                            backgroundColor: !isActive ? 'var(--mantine-color-teal-0)' : undefined,
                                            paddingLeft: !isActive ? rem(20) : undefined,
                                        },
                                        '.group-data-[state=collapsed] &': {
                                            padding: 0,
                                            justifyContent: 'center',
                                            width: rem(40),
                                            height: rem(40),
                                            borderRadius: rem(10),
                                        }
                                    },
                                    section: {
                                        marginRight: rem(14),
                                        '.group-data-[state=collapsed] &': {
                                            marginRight: 0,
                                        }
                                    }
                                }}
                            />
                        )
                    })}
                </Stack>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-gray-50 bg-gray-50/30 group-data-[state=collapsed]:p-3">
                <UnstyledButton
                    onClick={handleLogout}
                    className="w-full h-11 flex items-center gap-3 px-4 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0 hover:shadow-sm active:scale-[0.98]"
                >
                    <Box className="flex items-center justify-center shrink-0">
                        <LogOut size={18} strokeWidth={2.5} />
                    </Box>
                    <Text fw={800} size="sm" className="group-data-[state=collapsed]:hidden tracking-tight">Sign Out</Text>
                </UnstyledButton>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
