import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSpaces } from '../features/spaces/spaceSlice';
import { createBookingBatch, getBookings, updateBookingPayment, reset } from '../features/bookings/bookingSlice';
import { toast } from 'react-hot-toast';
import { Search, CreditCard, User, ChevronRight, CheckCircle, Calendar, MapPin, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';

const SLOT_TIMES = [
    "06:00 AM - 07:00 AM", "07:00 AM - 08:00 AM", "08:00 AM - 09:00 AM", "09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM", "01:00 PM - 02:00 PM", "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM", "04:00 PM - 05:00 PM", "05:00 PM - 06:00 PM",
    "06:00 PM - 07:00 PM", "07:00 PM - 08:00 PM", "08:00 PM - 09:00 PM", "09:00 PM - 10:00 PM", "10:00 PM - 11:00 PM", "11:00 PM - 12:00 AM",
    "12:00 AM - 01:00 AM", "01:00 AM - 02:00 AM", "02:00 AM - 03:00 AM", "03:00 AM - 04:00 AM", "04:00 AM - 05:00 AM", "05:00 AM - 06:00 AM"
];

const Billing = () => {
    const dispatch = useDispatch();
    const { spaces } = useSelector(state => state.spaces);
    const { bookings, isSuccess, isError, message } = useSelector(state => state.bookings);

    const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'settle'

    // Direct Billing State
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedSpaceId, setSelectedSpaceId] = useState('');
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerMobile, setCustomerMobile] = useState('');
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [paidAmount, setPaidAmount] = useState('');
    const [discount, setDiscount] = useState(0);
    const [splitDetails, setSplitDetails] = useState({ Cash: 0, UPI: 0, Card: 0 });

    // Settle State
    const [searchTerm, setSearchTerm] = useState('');
    const [settleBookingId, setSettleBookingId] = useState(null);
    const [settleAmount, setSettleAmount] = useState('');
    const [settleMode, setSettleMode] = useState('Cash');

    useEffect(() => {
        dispatch(getSpaces());
    }, [dispatch]);

    useEffect(() => {
        if (activeTab === 'direct') {
            dispatch(getBookings(selectedDate));
        } else {
            dispatch(getBookings()); // Get all/recent for search
        }
    }, [dispatch, selectedDate, activeTab]);

    useEffect(() => {
        if (spaces.length > 0 && !selectedSpaceId) {
            setSelectedSpaceId(spaces[0]._id);
        }
    }, [spaces]);

    useEffect(() => {
        if (isSuccess) {
            dispatch(reset());
            // Clear forms
            if (activeTab === 'direct') {
                setSelectedSlots([]);
                setCustomerName('');
                setCustomerMobile('');
                setPaidAmount('');
                setDiscount(0);
            } else {
                setSettleBookingId(null);
                setSettleAmount('');
                setSearchTerm('');
            }
        }
        if (isError) {
            toast.error(message);
            dispatch(reset());
        }
    }, [isSuccess, isError, message, dispatch, activeTab]);


    // Direct Billing Handlers
    const safeBookings = Array.isArray(bookings) ? bookings.filter(b => b !== null) : [];
    const blockedSlots = safeBookings
        .filter(b => {
            if (!b || !b.space) return false;
            const spaceId = b.space._id || b.space;
            return spaceId === selectedSpaceId && b.status !== 'Cancelled';
        })
        .flatMap(b => b.slots || []);

    const toggleSlot = (slot) => {
        if (blockedSlots.includes(slot)) return;
        if (selectedSlots.includes(slot)) setSelectedSlots(selectedSlots.filter(s => s !== slot));
        else setSelectedSlots([...selectedSlots, slot]);
    };

    const calculateTotal = () => {
        const space = spaces.find(s => s && s._id === selectedSpaceId);
        if (!space) return 0;
        let total = 0;
        selectedSlots.forEach(slot => {
            total += (space.customRates && space.customRates[slot]) || space.pricePerHour;
        });
        return total;
    };

    const handleDirectSubmit = (e) => {
        e.preventDefault();
        if (selectedSlots.length === 0) return toast.error("Select slots");

        const space = spaces.find(s => s && s._id === selectedSpaceId);
        if (!space) return toast.error("Space not found");
        const total = calculateTotal();

        const item = {
            id: Date.now(),
            space: selectedSpaceId,
            spaceName: space.name,
            date: selectedDate,
            slots: selectedSlots,
            amount: total
        };

        dispatch(createBookingBatch({
            items: [item],
            customerName,
            customerMobile,
            totalAmount: total - discount,
            paymentMode,
            paymentDetails: paymentMode === 'Split' ? splitDetails : null,
            paidAmount: Number(paidAmount) || 0,
            discount
        })).unwrap().then(() => toast.success("Billed Successfully"));
    };

    // Settle Handlers
    const filteredBookings = safeBookings.filter(b => {
        if (!searchTerm) return false;
        const lowTerm = searchTerm.toLowerCase();
        return (
            (b.customerName && b.customerName.toLowerCase().includes(lowTerm)) ||
            (b.customerMobile && b.customerMobile.includes(lowTerm))
        );
    });

    const handleSettleSubmit = (e) => {
        e.preventDefault();
        if (!settleBookingId) return;
        dispatch(updateBookingPayment({
            id: settleBookingId,
            paymentData: { amount: Number(settleAmount), paymentMode: settleMode }
        })).unwrap().then(() => toast.success("Payment Updated"));
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Billing Counter</h1>
                    <p className="text-gray-500 mt-1">Manage walk-in bookings and settle outstanding balances.</p>
                </div>

                {/* Tabs */}
                <div className="flex p-1.5 bg-gray-100 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('direct')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'direct' ? 'bg-white text-indigo-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Direct Billing
                    </button>
                    <button
                        onClick={() => setActiveTab('settle')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'settle' ? 'bg-white text-indigo-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Settle Balance
                    </button>
                </div>
            </div>

            {activeTab === 'direct' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Selection Grid */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-8 items-end">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={14} className="text-indigo-500" /> Date
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    className="block px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                    <MapPin size={14} className="text-indigo-500" /> Space
                                </label>
                                <select
                                    value={selectedSpaceId}
                                    onChange={e => setSelectedSpaceId(e.target.value)}
                                    className="block px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer min-w-[180px]"
                                >
                                    {spaces.map(s => <option key={s._id} value={s._id} className="text-gray-900 font-bold">{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
                                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                    <Clock className="text-indigo-500" /> Select Slots
                                </h3>
                                <div className="flex gap-4 text-[10px] font-black uppercase tracking-tighter text-gray-400">
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border border-gray-200 bg-white"></span> Available</div>
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Selected</div>
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-50 border border-red-100"></span> Booked</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {SLOT_TIMES.map(slot => {
                                    const isBlocked = blockedSlots.includes(slot);
                                    const isSelected = selectedSlots.includes(slot);
                                    let cls = "py-4 rounded-xl text-[11px] font-black border transition-all duration-200 ";
                                    if (isBlocked) cls += "bg-red-50 border-red-100 text-red-300 cursor-not-allowed";
                                    else if (isSelected) cls += "bg-indigo-600 border-indigo-600 text-white shadow-xl transform scale-105 ring-4 ring-indigo-50";
                                    else cls += "bg-white border-gray-100 text-gray-700 hover:border-indigo-400 hover:shadow-md";

                                    return <button key={slot} onClick={() => toggleSlot(slot)} disabled={isBlocked} className={cls}>{slot}</button>
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Checkout Sidebar */}
                    <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-indigo-100 border border-indigo-50 h-fit sticky top-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900">Checkout</h2>
                            <TrendingUp size={24} className="text-indigo-500" />
                        </div>

                        <form onSubmit={handleDirectSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Customer Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-3 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl text-sm font-black text-gray-900 border-none outline-none focus:ring-4 focus:ring-indigo-50 placeholder-gray-400"
                                        placeholder="Walk-in Customer"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Mobile Number</label>
                                <input
                                    type="tel"
                                    value={customerMobile}
                                    onChange={e => setCustomerMobile(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-50 rounded-2xl text-sm font-black text-gray-900 border-none outline-none focus:ring-4 focus:ring-indigo-50 placeholder-gray-400"
                                    placeholder="9876543210"
                                    required
                                />
                            </div>

                            <div className="py-6 border-y border-gray-50 space-y-3">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-gray-400">Subtotal ({selectedSlots.length} slots)</span>
                                    <span className="text-gray-900">₹{calculateTotal()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-gray-400">Discount</span>
                                    <input
                                        type="number"
                                        value={discount}
                                        onChange={e => setDiscount(Number(e.target.value))}
                                        className="w-20 text-right bg-gray-50 rounded-lg p-1.5 text-xs font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>
                                <div className="flex justify-between text-2xl font-black text-indigo-900 pt-4 items-baseline">
                                    <span className="text-base text-gray-400 font-black">Total</span>
                                    <span>₹{calculateTotal() - discount}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Mode</label>
                                    <select
                                        value={paymentMode}
                                        onChange={e => {
                                            setPaymentMode(e.target.value);
                                            if (e.target.value === 'Split') {
                                                setPaidAmount(calculateTotal() - discount);
                                            } else {
                                                setSplitDetails({ Cash: 0, UPI: 0, Card: 0 });
                                            }
                                        }}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-black text-gray-900 border-none outline-none focus:ring-4 focus:ring-indigo-50 cursor-pointer"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Card">Card</option>
                                        <option value="Split">Split</option>
                                    </select>
                                </div>

                                {paymentMode !== 'Split' && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Paid Now</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3.5 text-[10px] text-gray-400">₹</span>
                                            <input
                                                type="number"
                                                value={paidAmount}
                                                onChange={e => setPaidAmount(e.target.value)}
                                                className="w-full pl-6 pr-4 py-3 bg-gray-50 rounded-2xl text-sm font-black text-gray-900 border-none outline-none focus:ring-4 focus:ring-indigo-50"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {paymentMode === 'Split' && (
                                <div className="bg-indigo-50/50 p-5 rounded-2xl space-y-4 border border-indigo-100 shadow-inner">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Split Breakdown</span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${Object.values(splitDetails).reduce((a, b) => a + Number(b), 0) === (calculateTotal() - discount) ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                            {Object.values(splitDetails).reduce((a, b) => a + Number(b), 0)} / {calculateTotal() - discount}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Cash', 'UPI', 'Card'].map(m => (
                                            <div key={m} className="space-y-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">{m}</label>
                                                <input
                                                    type="number"
                                                    value={splitDetails[m] || ''}
                                                    onChange={e => setSplitDetails({ ...splitDetails, [m]: Number(e.target.value) })}
                                                    className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-black text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="0"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transform active:scale-[0.98] transition-all text-lg tracking-tight">
                                Complete Billing
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Settle: Search & Results */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-5 top-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={24} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search by customer name or mobile number..."
                                className="w-full pl-16 pr-6 py-5 bg-white border border-gray-100 rounded-3xl shadow-sm text-lg font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all placeholder-gray-300"
                            />
                        </div>

                        <div className="space-y-4">
                            {!searchTerm && <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 text-gray-400 font-bold">Start typing to find bookings...</div>}
                            {searchTerm && filteredBookings.length === 0 && <div className="text-center py-20 bg-gray-50 rounded-3xl text-gray-400 font-bold">No results found for "{searchTerm}"</div>}
                            {filteredBookings.slice(0, 10).map(booking => {
                                const due = booking.totalAmount - booking.paidAmount;
                                const isSettled = due <= 0;
                                return (
                                    <div
                                        key={booking._id}
                                        onClick={() => !isSettled && setSettleBookingId(booking._id)}
                                        className={`bg-white p-6 rounded-3xl border-2 transition-all cursor-pointer flex justify-between items-center group
                                            ${settleBookingId === booking._id ? 'border-indigo-500 bg-indigo-50' : 'border-white hover:border-indigo-100 hover:shadow-lg'}
                                            ${isSettled ? 'opacity-60 cursor-default grayscale' : ''}
                                        `}
                                    >
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black">
                                                {booking.customerName?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div className="font-black text-gray-900 text-lg uppercase tracking-tight">{booking.customerName}</div>
                                                <div className="text-xs font-bold text-gray-400 flex items-center gap-2">
                                                    <MapPin size={12} /> {booking.space?.name} • <Calendar size={12} /> {booking.date}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Outstanding</div>
                                                {isSettled ? (
                                                    <div className="text-xl font-black text-emerald-600 flex items-center gap-1 justify-end">PAID <CheckCircle size={20} /></div>
                                                ) : (
                                                    <div className="text-2xl font-black text-red-500 tracking-tighter">₹{due}</div>
                                                )}
                                            </div>
                                            {!isSettled && <ChevronRight className={`text-gray-300 group-hover:translate-x-1 transition-all ${settleBookingId === booking._id ? 'text-indigo-500 translate-x-1' : ''}`} size={24} />}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Settle: Payment Form */}
                    <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-indigo-100 border border-indigo-50 h-fit sticky top-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900">Settle Dues</h2>
                            <DollarSign size={24} className="text-emerald-500" />
                        </div>
                        {settleBookingId ? (
                            <form onSubmit={handleSettleSubmit} className="space-y-6">
                                <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                                    <div className="text-[10px] text-indigo-500 uppercase font-black tracking-widest mb-1">Target Account</div>
                                    <div className="text-sm font-black text-indigo-900">REF: {settleBookingId.slice(-8).toUpperCase()}</div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Payment Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₹</span>
                                        <input
                                            type="number"
                                            value={settleAmount}
                                            onChange={e => setSettleAmount(e.target.value)}
                                            className="w-full pl-8 pr-4 py-4 bg-gray-50 rounded-2xl text-2xl font-black text-gray-900 border-none outline-none focus:ring-4 focus:ring-indigo-50 placeholder-gray-300"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Payment Method</label>
                                    <select
                                        value={settleMode}
                                        onChange={e => setSettleMode(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm font-black text-gray-900 border-none outline-none focus:ring-4 focus:ring-indigo-50 cursor-pointer"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Card">Debit/Credit Card</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transform active:scale-[0.98] transition-all text-lg flex justify-center items-center gap-2">
                                    <CreditCard size={20} /> Update Payment
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-20 px-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 text-gray-400 font-bold">
                                Select a booking from the search results to process its payment.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Billing;
