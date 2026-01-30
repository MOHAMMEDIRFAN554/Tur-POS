import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Layers, DollarSign, PieChart, Settings, LogOut, Hexagon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/login');
    };

    const links = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Bookings', path: '/bookings', icon: Calendar },
        { name: 'Billing', path: '/billing', icon: DollarSign },
        { name: 'Spaces', path: '/spaces', icon: Layers },
        { name: 'Expenses', path: '/expenses', icon: DollarSign },
        { name: 'Reports', path: '/reports', icon: PieChart },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <aside className={`${
            isMobileMenuOpen ? "translate-x-0 ease-out" : "-translate-x-full ease-in"
        } fixed inset-y-0 left-0 z-50 w-72 bg-[#0f172a] text-gray-300 h-screen border-r border-gray-800 md:relative md:translate-x-0 transition-all duration-300`}
        >
            {/* Branding */}
            <div className="flex items-center gap-3 px-6 h-20 border-b border-gray-800/50">
                <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-900/20">
                    <Hexagon size={24} className="text-white fill-current" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">Turf POS</h1>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Management System</div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 mb-2">Main Menu</div>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsMobileMenuOpen(false)} // Close sidebar on link click
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30 font-medium'
                                    : 'hover:bg-gray-800 hover:text-white text-gray-400'
                                }`}
                        >
                            <Icon size={20} className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'} transition-colors`} />
                            <span>{link.name}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-gray-800/50 bg-[#0b1120]">
                <button
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-red-200 bg-red-900/10 hover:bg-red-900/20 border border-red-900/20 rounded-xl transition-all hover:scale-[1.02]"
                >
                    <LogOut size={16} /> Logout Securely
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
