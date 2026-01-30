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
                <Sidebar />
            </div>

            {/* Mobile Sidebar (Overlay) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="absolute left-0 top-0 h-full w-72 bg-[#0f172a] shadow-2xl animate-slide-in-left">
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="relative flex flex-col flex-1 h-full overflow-hidden">
                {/* Mobile Header Toggle */}
                <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-gray-900">Turf POS</span>
                    <div className="w-8"></div> {/* Spacer */}
                </div>

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
