import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Calendar, DollarSign, TrendingDown, TrendingUp, CreditCard, Wallet } from 'lucide-react';
import jsPDF from 'jspdf';
import { useSelector } from 'react-redux';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'react-hot-toast';

const Reports = () => {
    const { user } = useSelector(state => state.auth);
    const [stats, setStats] = useState(null);
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const token = user.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Use VITE_API_URL or default
            const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/stats';

            const response = await axios.get(`${API_URL}?startDate=${startDate}&endDate=${endDate}`, config);
            setStats(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch reports");
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        if (!stats) return;
        const doc = new jsPDF();

        // Header
        doc.setFillColor(245, 247, 250);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(40, 40, 40);
        doc.text(user?.turfName || "Financial Report", 14, 25);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${format(new Date(), 'dd-MM-yyyy hh:mm a')}`, 140, 20, { align: "left" });
        doc.text(`Period: ${startDate} to ${endDate}`, 140, 26, { align: "left" });

        let y = 55;

        // Stats Grid
        const addSection = (title, items) => {
            doc.setFillColor(240, 240, 240);
            doc.rect(14, y - 6, 182, 8, 'F');
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(60, 60, 60);
            doc.text(title, 18, y - 1);
            y += 8;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(40, 40, 40);

            items.forEach(({ label, value }) => {
                doc.text(label, 18, y);
                doc.text(String(value), 190, y, { align: 'right' });
                doc.setDrawColor(240, 240, 240);
                doc.line(18, y + 2, 190, y + 2);
                y += 8;
            });
            y += 5;
        };

        addSection('Booking Summary', [
            { label: 'Total Bookings Count', value: stats.bookings?.totalBookings || 0 },
            { label: 'Gross Booking Value', value: `Rs. ${stats.bookings?.grossBookingAmount || 0}` },
            { label: 'Discounts Given', value: `- Rs. ${stats.bookings?.totalDiscount || 0}` },
            { label: 'Net Booking Value (After Discount)', value: `Rs. ${(stats.bookings?.grossBookingAmount - stats.bookings?.totalDiscount) || 0}` }
        ]);

        addSection('Collections & Payments', [
            { label: 'Cash Collection', value: `Rs. ${stats.bookings?.cashCollection || 0}` },
            { label: 'UPI Collection', value: `Rs. ${stats.bookings?.upiCollection || 0}` },
            { label: 'Card/Other Collection', value: `Rs. ${(stats.bookings?.totalPaid - stats.bookings?.cashCollection - stats.bookings?.upiCollection) || 0}` },
            { label: 'Total Collections (Paid)', value: `Rs. ${stats.bookings?.totalPaid || 0}` },
            { label: 'Outstanding / Unpaid', value: `Rs. ${stats.financials?.outstanding || 0}` }
        ]);

        addSection('Expenditure', [
            { label: 'Total Expenses', value: `Rs. ${stats.expenses?.totalExpenses || 0}` }
        ]);

        // ... Summary Sections ... (Keep previous addSection calls or they are already there)

        // Detailed Transaction List - Bookings
        doc.addPage();
        doc.setFillColor(245, 247, 250);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(40, 40, 40);
        doc.text("Booking Transactions", 14, 13);

        let ty = 30;

        // Table Header
        doc.setFillColor(230, 230, 230);
        doc.rect(14, ty - 6, 182, 8, 'F');
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text("Date", 16, ty - 1);
        doc.text("Customer", 40, ty - 1);
        doc.text("Space/Slots", 90, ty - 1); // Combined column
        doc.text("Mode", 150, ty - 1);
        doc.text("Amount", 192, ty - 1, { align: "right" });

        ty += 8;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);

        const rawBookings = stats.rawData?.bookings || [];

        rawBookings.forEach((b, index) => {
            if (ty > 270) {
                doc.addPage();
                ty = 30;
                // Re-print header
                doc.setFillColor(230, 230, 230);
                doc.rect(14, ty - 6, 182, 8, 'F');
                doc.setFontSize(9);
                doc.setFont("helvetica", "bold");
                doc.text("Date (cont.)", 16, ty - 1);
                ty += 8;
                doc.setFont("helvetica", "normal");
            }

            const space = b.space?.name || 'Turf';
            const slots = b.slots.join(', ');

            doc.setFontSize(8);
            doc.text(b.date, 16, ty);
            doc.text(b.customerName.substring(0, 20), 40, ty);

            // Wrap Slots/Space
            const desc = `${space} (${slots})`;
            const splitDesc = doc.splitTextToSize(desc, 55);
            doc.text(splitDesc, 90, ty);

            doc.text(b.paymentMode, 150, ty);
            doc.text(String(b.totalAmount), 192, ty, { align: "right" });

            const rowHeight = Math.max(6, splitDesc.length * 4);
            doc.setDrawColor(245, 245, 245);
            doc.line(14, ty + rowHeight - 2, 196, ty + rowHeight - 2);
            ty += rowHeight;
        });

        doc.save(`report_${startDate}_${endDate}_FULL.pdf`);
    };

    useEffect(() => {
        fetchStats();
    }, [startDate, endDate]);

    if (!stats || loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    const { bookings, expenses, financials } = stats;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Reports</h1>
                    <p className="text-gray-500 mt-1">Track your earnings, expenses, and net profit.</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-sm font-medium border-none outline-none text-gray-700" />
                        <span className="text-gray-400">-</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent text-sm font-medium border-none outline-none text-gray-700" />
                    </div>
                    <button onClick={downloadPDF} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 font-semibold shadow-lg shadow-indigo-200 transition-all">
                        <Download size={18} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign size={64} className="text-indigo-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><DollarSign size={20} /></div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Gross Revenue</h3>
                    </div>
                    <p className="text-3xl font-black text-gray-900 tracking-tight">₹{bookings.grossBookingAmount || 0}</p>
                    <p className="text-xs text-indigo-600 font-medium mt-2 bg-indigo-50 inline-block px-2 py-1 rounded">{bookings.totalBookings} Bookings</p>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wallet size={64} className="text-emerald-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Wallet size={20} /></div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Collections</h3>
                    </div>
                    <p className="text-3xl font-black text-emerald-600 tracking-tight">₹{bookings.totalPaid || 0}</p>
                    <div className="flex gap-2 mt-2 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1"><CreditCard size={12} /> UPI: ₹{bookings.upiCollection}</span>
                        <span className="flex items-center gap-1"><Wallet size={12} /> Cash: ₹{bookings.cashCollection}</span>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingDown size={64} className="text-red-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-50 rounded-lg text-red-600"><TrendingDown size={20} /></div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Expenses</h3>
                    </div>
                    <p className="text-3xl font-black text-red-600 tracking-tight">₹{expenses.totalExpenses || 0}</p>
                    <p className="text-xs text-red-600 font-medium mt-2 bg-red-50 inline-block px-2 py-1 rounded">12% of Revenue</p>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={64} className="text-blue-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><TrendingUp size={20} /></div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Net Profit</h3>
                    </div>
                    <p className="text-3xl font-black text-blue-600 tracking-tight">₹{financials.netBalance || 0}</p>
                    <p className="text-xs text-blue-600 font-medium mt-2 bg-blue-50 inline-block px-2 py-1 rounded">Net Earnings</p>
                </div>

            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Detailed Statement</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <tbody>
                            <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-600 font-medium">Total Booking Value</td>
                                <td className="p-4 font-bold text-right text-gray-900">₹{bookings.grossBookingAmount}</td>
                            </tr>
                            <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-600 font-medium">Discounts Given</td>
                                <td className="p-4 font-bold text-right text-red-500">- ₹{bookings.totalDiscount}</td>
                            </tr>
                            <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-600 font-medium">Unpaid / Outstanding</td>
                                <td className="p-4 font-bold text-right text-orange-500">₹{financials.outstanding}</td>
                            </tr>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <td className="p-4 font-bold text-gray-900">Total Collected</td>
                                <td className="p-4 font-bold text-right text-emerald-600">₹{bookings.totalPaid}</td>
                            </tr>
                            <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-600 font-medium">Total Expenses</td>
                                <td className="p-4 font-bold text-right text-red-500">- ₹{expenses.totalExpenses}</td>
                            </tr>
                            <tr className="bg-indigo-50/50">
                                <td className="p-4 font-black text-indigo-900 text-lg">Net Profit</td>
                                <td className="p-4 font-black text-right text-indigo-900 text-lg">₹{financials.netBalance}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default Reports;
