import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSpaces, createSpace, deleteSpace, updateSpace, reset } from '../features/spaces/spaceSlice';
import { Trash2, Plus, X, Edit2, Clock, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SLOT_TIMES = [
    "06:00 AM - 07:00 AM", "07:00 AM - 08:00 AM", "08:00 AM - 09:00 AM", "09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM", "01:00 PM - 02:00 PM", "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM", "04:00 PM - 05:00 PM", "05:00 PM - 06:00 PM",
    "06:00 PM - 07:00 PM", "07:00 PM - 08:00 PM", "08:00 PM - 09:00 PM", "09:00 PM - 10:00 PM", "10:00 PM - 11:00 PM", "11:00 PM - 12:00 AM",
    "12:00 AM - 01:00 AM", "01:00 AM - 02:00 AM", "02:00 AM - 03:00 AM", "03:00 AM - 04:00 AM", "04:00 AM - 05:00 AM", "05:00 AM - 06:00 AM"
];

const Spaces = () => {
    const dispatch = useDispatch();
    const { spaces, isError, message, isLoading } = useSelector((state) => state.spaces);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [newSpace, setNewSpace] = useState({ name: '', pricePerHour: '', customRates: {} });
    const [selectedSlotForRate, setSelectedSlotForRate] = useState('');
    const [customRateAmount, setCustomRateAmount] = useState('');

    useEffect(() => {
        if (isError) {
            toast.error(message);
            dispatch(reset());
        }
        dispatch(getSpaces());
    }, [isError, message, dispatch]);

    const handleCreate = async (e) => {
        e.preventDefault();

        if (!newSpace.name.trim()) return toast.error("Space Name is required");
        if (newSpace.pricePerHour < 0) return toast.error("Price cannot be negative");

        try {
            if (editMode && editId) {
                await dispatch(updateSpace({ id: editId, spaceData: newSpace })).unwrap();
                toast.success("Space updated successfully");
            } else {
                await dispatch(createSpace(newSpace)).unwrap();
                toast.success("Space created successfully");
            }
            closeModal();
        } catch (error) {
            // Error handled by useEffect
        }
    };

    const openEdit = (space) => {
        setNewSpace({
            name: space.name,
            pricePerHour: space.pricePerHour,
            customRates: space.customRates ? { ...space.customRates } : {}
        });
        setEditId(space._id);
        setEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this space? This cannot be undone.')) {
            dispatch(deleteSpace(id))
                .unwrap()
                .then(() => toast.success("Space deleted successfully"))
                .catch(() => toast.error("Failed to delete space"));
        }
    };

    const addCustomRate = () => {
        if (!selectedSlotForRate) return toast.error("Please select a time slot");
        if (!customRateAmount || customRateAmount < 0) return toast.error("Please enter a valid price");

        setNewSpace(prev => ({
            ...prev,
            customRates: { ...prev.customRates, [selectedSlotForRate]: Number(customRateAmount) }
        }));
        setSelectedSlotForRate('');
        setCustomRateAmount('');
        toast.success(`Rate added for ${selectedSlotForRate}`);
    };

    const removeCustomRate = (slot) => {
        const rates = { ...newSpace.customRates };
        delete rates[slot];
        setNewSpace({ ...newSpace, customRates: rates });
        toast.success(`Rate removed for ${slot}`);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditMode(false);
        setNewSpace({ name: '', pricePerHour: '', customRates: {} });
        setSelectedSlotForRate('');
        setCustomRateAmount('');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Spaces</h1>
                    <p className="text-gray-500 mt-1">Configure your courts, pricing, and availability.</p>
                </div>
                <button
                    onClick={() => { setEditMode(false); setIsModalOpen(true); }}
                    className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 font-semibold"
                >
                    <Plus size={20} className="mr-2" /> Add New Space
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spaces?.filter(s => s !== null).map((space) => (
                    <div key={space._id} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{space.name}</h3>
                                    <div className="flex items-center text-gray-500 mt-1">
                                        <DollarSign size={16} className="mr-1" />
                                        <span className="font-medium">₹{space.pricePerHour}</span>
                                        <span className="text-xs ml-1">/ hour</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEdit(space)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                        title="Edit Space"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(space._id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        title="Delete Space"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {space.customRates && Object.keys(space.customRates).length > 0 ? (
                                <div className="mt-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        <Clock size={12} className="mr-1" /> Special Interactions
                                    </div>
                                    <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto custom-scrollbar">
                                        {Object.entries(space.customRates).map(([slot, price]) => (
                                            <span key={slot} className="inline-flex items-center px-2.5 py-1 bg-white text-indigo-700 text-xs font-medium rounded-md border border-indigo-100 shadow-sm">
                                                {slot}: ₹{price}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 p-3 text-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    No special rates configured
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 relative z-10 animate-scale-in overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-2xl font-bold text-gray-800">{editMode ? 'Edit Space' : 'Add New Space'}</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Space Name</label>
                                    <input
                                        type="text"
                                        value={newSpace.name}
                                        onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-text text-gray-900 bg-white placeholder-gray-400"
                                        placeholder="e.g. Court 1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Base Price (Per Hour)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3.5 text-gray-400">₹</span>
                                        <input
                                            type="number"
                                            value={newSpace.pricePerHour}
                                            onChange={(e) => setNewSpace({ ...newSpace, pricePerHour: e.target.value })}
                                            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-text text-gray-900 bg-white"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Default price for all time slots unless overridden.</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                    <Clock size={16} className="mr-2 text-indigo-500" /> Slot-wise Pricing Override
                                </label>
                                <div className="flex gap-2 mb-4">
                                    <select
                                        value={selectedSlotForRate}
                                        onChange={e => setSelectedSlotForRate(e.target.value)}
                                        className="flex-1 p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 font-medium"
                                    >
                                        <option value="" className="text-gray-900 bg-white">Select Time Slot</option>
                                        {SLOT_TIMES.map(s => <option key={s} value={s} className="text-gray-900 bg-white">{s}</option>)}
                                    </select>
                                    <div className="relative w-24">
                                        <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs">₹</span>
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            value={customRateAmount}
                                            onChange={e => setCustomRateAmount(e.target.value)}
                                            className="w-full pl-6 p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addCustomRate}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                                    {Object.entries(newSpace.customRates).length === 0 ? (
                                        <p className="text-center text-xs text-gray-400 py-2">No custom rates added</p>
                                    ) : (
                                        Object.entries(newSpace.customRates).map(([slot, price]) => (
                                            <div key={slot} className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm shadow-sm group">
                                                <span className="font-medium text-gray-600">{slot}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-indigo-600">₹{price}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCustomRate(slot)}
                                                        className="text-gray-300 group-hover:text-red-500 transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 font-semibold"
                                >
                                    {editMode ? 'Update Space' : 'Create Space'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Spaces;
