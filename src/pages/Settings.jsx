import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';

const Settings = () => {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        turfName: user?.turfName || '',
        address: user?.address || '',
        phone: user?.phone || '',
        password: '',
        emailUser: user?.emailConfig?.user || '',
        emailPass: '', // Keep empty unless changing
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            name: form.name,
            email: form.email,
            turfName: form.turfName,
            address: form.address,
            phone: form.phone,
            emailConfig: {
                user: form.emailUser
            }
        };

        if (form.emailPass) {
            payload.emailConfig.pass = form.emailPass;
        }

        if (form.password) payload.password = form.password;

        const result = await dispatch(updateProfile(payload));
        if (!result.error) {
            toast.success("Profile Updated");
            setForm(prev => ({ ...prev, password: '', emailPass: '' }));
        } else {
            toast.error(result.payload || "Update failed");
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Settings</h1>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-xl font-semibold border-b pb-2">Profile & Turf Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Turf Name</label>
                            <input type="text" name="turfName" value={form.turfName} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email (Login)</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full border p-2 rounded mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Business Address</label>
                            <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="123 Street, City, Country" className="w-full border p-2 rounded mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">New Password (Optional)</label>
                            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current" className="w-full border p-2 rounded mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold border-b pb-2 pt-4">Email Service Configuration</h2>
                    <p className="text-sm text-gray-500">Enable sending booking confirmations via Email.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Gmail Address</label>
                            <input type="email" name="emailUser" value={form.emailUser} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">App Password</label>
                            <input type="password" name="emailPass" value={form.emailPass} onChange={handleChange} placeholder="ex: abcd efgh ijkl mnop" className="w-full border p-2 rounded mt-1" />
                            <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline mt-1 block">Create App Password</a>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default Settings;
