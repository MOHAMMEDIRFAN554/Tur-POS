import React from 'react';
import { useSelector } from 'react-redux';
import { Search, Bell, UserCircle, Menu } from 'lucide-react';

const Header = ({ setIsMobileMenuOpen }) => {
    const { user } = useSelector((state) => state.auth);

    return (
        <header className="flex justify-between items-center h-20 px-8 bg-white border-b border-gray-100 sticky top-0 z-30">
            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Menu size={24} />
                </button>
            </div>

            {/* Search Bar - Aesthetic Only for now */}
            <div className="hidden md:flex items-center w-96 relative">
                <Search className="absolute left-3 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search bookings, customers..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium placeholder-gray-400 hover:bg-gray-100 focus:bg-white"
                />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-6">
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-gray-100"></div>

                {/* User Profile */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-gray-900 leading-none mb-1">{user?.name}</div>
                        <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block">{user?.turfName || 'Admin'}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-md ring-2 ring-white cursor-pointer hover:shadow-lg transition-all">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-indigo-700 font-bold text-sm">
                            {user?.name ? user.name.charAt(0).toUpperCase() : <UserCircle size={20} />}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
export default Header;
