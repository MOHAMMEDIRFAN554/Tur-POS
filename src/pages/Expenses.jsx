import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getExpenses, createExpense } from '../features/expenses/expenseSlice';
import { format } from 'date-fns';
import { Trash2, Plus, Receipt, Calendar, Tag, Wallet, TrendingDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Expenses = () => {
    const dispatch = useDispatch();
    const { expenses, isLoading } = useSelector(state => state.expenses);
    const [form, setForm] = useState({
        title: '',
        amount: '',
        category: 'Maintenance',
        date: format(new Date(), 'yyyy-MM-dd'),
        paymentMode: 'Cash',
        note: ''
    });

    useEffect(() => { dispatch(getExpenses()); }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(createExpense({
                ...form,
                amount: Number(form.amount)
            })).unwrap();
            setForm({ ...form, title: '', amount: '', note: '' });
            toast.success("Expense added successfully");
        } catch (error) {
            toast.error(error || "Failed to add expense");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <TrendingDown className="text-red-500" /> Expenses
                    </h1>
                    <p className="text-gray-500 mt-1">Record and track your business outgoings.</p>
                </div>
            </div>

            {/* Quick Add Form */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-6">Add New Expense</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                    <div className="lg:col-span-1 space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Receipt size={14} /> Description
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                            placeholder="e.g. Repairs"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Wallet size={14} /> Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-2.5 text-gray-400 font-bold text-sm">₹</span>
                            <input
                                type="number"
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 pl-8 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-bold text-gray-900"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Tag size={14} /> Category
                        </label>
                        <select
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-medium text-gray-900 cursor-pointer"
                        >
                            <option value="Maintenance">Maintenance</option>
                            <option value="Staff">Staff</option>
                            <option value="Electricity">Electricity</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Calendar size={14} /> Date
                        </label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={e => setForm({ ...form, date: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-medium text-gray-900"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 h-[46px]"
                    >
                        <Plus size={18} /> Add Record
                    </button>
                </form>
            </div>

            {/* Expenses DataTable */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-800">Recent Transactions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase tracking-widest font-black">
                            <tr>
                                <th className="p-4 pl-8">Date</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Mode</th>
                                <th className="p-4 pr-8 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-50">
                            {expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-400 font-medium">No expenses recorded yet.</td>
                                </tr>
                            ) : (
                                [...expenses].reverse().map(ex => (
                                    <tr key={ex._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-4 pl-8 text-gray-500 font-medium">{ex.date}</td>
                                        <td className="p-4 font-bold text-gray-800">{ex.title}</td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-tight">
                                                {ex.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <Wallet size={12} className="text-gray-400" /> {ex.paymentMode}
                                            </div>
                                        </td>
                                        <td className="p-4 pr-8 text-right font-black text-red-600">
                                            - ₹{ex.amount}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Expenses;
