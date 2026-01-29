import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getBookings } from '../features/bookings/bookingSlice';
import { getSpaces } from '../features/spaces/spaceSlice';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Layout, PlusCircle, TrendingUp, Users, ArrowUpRight } from 'lucide-react';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { bookings, isLoading } = useSelector((state) => state.bookings);
    const { spaces } = useSelector((state) => state.spaces);

    const today = format(new Date(), 'yyyy-MM-dd');

    useEffect(() => {
        dispatch(getBookings(today));
        dispatch(getSpaces());
    }, [dispatch, today]);

    const safeBookings = Array.isArray(bookings) ? bookings : [];
    const todayRevenue = safeBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const pendingRevenue = safeBookings.reduce((sum, b) => sum + ((b.totalAmount || 0) - (b.paidAmount || 0)), 0);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back, <span className="font-semibold text-indigo-600">{user?.name}</span>. Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/bookings" className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
                        <PlusCircle size={18} className="mr-2" /> New Booking
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 group-hover:bg-indigo-100 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                            <Calendar size={20} />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Today's Bookings</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{safeBookings.length}</p>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 group-hover:bg-emerald-100 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                            <DollarSign size={20} />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Today's Revenue</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">₹{todayRevenue}</p>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 group-hover:bg-orange-100 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pending Due</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">₹{pendingRevenue}</p>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 group-hover:bg-blue-100 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                            <Layout size={20} />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active Spaces</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{spaces.length}</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
                        <Link to="/bookings" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
                            View All <ArrowUpRight size={16} className="ml-1" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="p-3 rounded-l-lg">Customer</th>
                                    <th className="p-3">Space</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3 rounded-r-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-50">
                                {safeBookings.slice(0, 5).map(b => (
                                    <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-3 font-medium text-gray-900">{b.customerName}</td>
                                        <td className="p-3 text-gray-500">{b.space?.name || 'Unknown'}</td>
                                        <td className="p-3 font-bold text-gray-700">₹{b.totalAmount}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${b.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {safeBookings.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-gray-400">No bookings for today yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions / Tips */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2">Pro Tip</h3>
                            <p className="text-indigo-100 text-sm mb-4">
                                Use the "Batch Booking" feature in the Bookings page to add multiple spaces to a single cart for a customer.
                            </p>
                            <Link to="/bookings" className="inline-block bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                                Go to Bookings
                            </Link>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Space Status</h3>
                        <div className="space-y-3">
                            {spaces.slice(0, 4).map(s => (
                                <div key={s._id} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-gray-600">{s.name}</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">₹{s.pricePerHour}/hr</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Dashboard;
