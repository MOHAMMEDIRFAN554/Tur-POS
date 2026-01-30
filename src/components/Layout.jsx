import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
            </div>

            {/* Mobile Sidebar (Overlay) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"></div>
                    <div className="absolute left-0 top-0 h-full w-72 shadow-2xl animate-slide-in-left" onClick={(e) => e.stopPropagation()}>
                        <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="relative flex flex-col flex-1 h-full overflow-hidden">
                {/* Main Header (Desktop and Mobile with toggle) */}
                <Header setIsMobileMenuOpen={setIsMobileMenuOpen} isMobileMenuOpen={isMobileMenuOpen} />

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
