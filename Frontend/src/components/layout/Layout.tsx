import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';
import { UnifiedSidebar } from './UnifiedSidebar';
import { SiteHeader } from './SiteHeader';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Layout: React.FC = () => {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Toaster position="top-right" />
            <UnifiedSidebar role={user?.role} onCollapsedChange={setCollapsed} />
            <motion.div
                initial={false}
                animate={{ marginLeft: collapsed ? 72 : 224 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="flex flex-col min-h-screen"
            >
                <SiteHeader showSearch={false} />
                <main className="flex-1 overflow-auto flex flex-col">
                    <div className="container mx-auto px-4 pb-4 md:px-8 md:pb-8 pt-2 flex-1 flex flex-col">
                        <Outlet />
                    </div>
                </main>
            </motion.div>
        </div>
    );
};

export default Layout;
