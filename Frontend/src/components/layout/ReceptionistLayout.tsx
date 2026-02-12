import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Outlet, useLocation } from 'react-router-dom';
import { UnifiedSidebar } from './UnifiedSidebar';
import { ReceptionistHeader } from './ReceptionistHeader';
import { PageTransition } from '@/components/ui/PageTransition';
import { MantineProvider, createTheme } from '@mantine/core';
import { motion } from 'framer-motion';

const theme = createTheme({
    primaryColor: 'teal',
    primaryShade: 7,
    fontFamily: 'Inter, sans-serif',
    headings: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: '700',
    },
});

export function ReceptionistLayout() {
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <MantineProvider theme={theme}>
            <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
            <UnifiedSidebar
                role="RECEPTIONIST"
                onCollapsedChange={setSidebarCollapsed}
            />
            <motion.div
                initial={false}
                animate={{ marginLeft: sidebarCollapsed ? 72 : 224 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="min-h-screen flex flex-col"
            >
                <ReceptionistHeader showSearch={true} />
                <main className="flex-1 overflow-auto bg-slate-50 flex flex-col">
                    <div className="container mx-auto px-4 pb-4 md:px-8 md:pb-8 pt-2 flex-1 flex flex-col">
                        <PageTransition key={location.pathname}>
                            <Outlet />
                        </PageTransition>
                    </div>
                </main>
            </motion.div>
        </MantineProvider>
    );
}
