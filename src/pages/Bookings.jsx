import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBookings, createBookingBatch } from '../features/bookings/bookingSlice';
import { getSpaces } from '../features/spaces/spaceSlice';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Phone, FileText, XCircle, ShoppingCart, Trash2, Calendar, Clock, CheckCircle, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { generateInvoice } from '../utils/invoiceGenerator';

const SLOT_TIMES = [
    "06:00 AM - 07:00 AM", "07:00 AM - 08:00 AM", "08:00 AM - 09:00 AM", "09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM", "01:00 PM - 02:00 PM", "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM", "04:00 PM - 05:00 PM", "05:00 PM - 06:00 PM",
    "06:00 PM - 07:00 PM", "07:00 PM - 08:00 PM", "08:00 PM - 09:00 PM", "09:00 PM - 10:00 PM", "10:00 PM - 11:00 PM", "11:00 PM - 12:00 AM",
    "12:00 AM - 01:00 AM", "01:00 AM - 02:00 AM", "02:00 AM - 03:00 AM", "03:00 AM - 04:00 AM", "04:00 AM - 05:00 AM", "05:00 AM - 06:00 AM"
];

const Bookings = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { spaces } = useSelector(state => state.spaces);
    const { bookings, isSuccess, isLoading } = useSelector(state => state.bookings);

    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedSpaceId, setSelectedSpaceId] = useState('');
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [cart, setCart] = useState([]);

    const [customerName, setCustomerName] = useState('');
    const [customerMobile, setCustomerMobile] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [paidAmount, setPaidAmount] = useState(0);
    const [discount, setDiscount] = useState(0);

    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

    useEffect(() => { dispatch(getSpaces()); }, [dispatch]);

    useEffect(() => {
        if (spaces && spaces.length > 0 && !selectedSpaceId) {
            setSelectedSpaceId(spaces[0]._id);
        }
    }, [spaces]);

    useEffect(() => {
        dispatch(getBookings(selectedDate));
    }, [selectedDate, dispatch, isSuccess]);

    const safeBookings = Array.isArray(bookings) ? bookings.filter(b => b !== null) : [];

    const dbBlockedSlots = safeBookings
        .filter(b => {
            if (!b || !b.space) return false;
            const spaceId = b.space._id || b.space;
            return spaceId === selectedSpaceId && b.status !== 'Cancelled';
        })
        .flatMap(b => b.slots || []);

    const cartBlockedSlots = cart
        .filter(item => item.space === selectedSpaceId)
        .flatMap(item => item.slots);

    const toggleSlot = (slot) => {
        if (dbBlockedSlots.includes(slot) || cartBlockedSlots.includes(slot)) return;
        if (selectedSlots.includes(slot)) {
            setSelectedSlots(selectedSlots.filter(s => s !== slot));
        } else {
            setSelectedSlots([...selectedSlots, slot]);
        }
    };

    const addToCart = () => {
        if (selectedSlots.length === 0) return toast.error("Select slots first");

        const space = spaces.find(s => s._id === selectedSpaceId);
        if (!space) return;

        let chunkAmount = 0;
        selectedSlots.forEach(slot => {
            if (space.customRates && space.customRates[slot]) {
                chunkAmount += space.customRates[slot];
            } else {
                chunkAmount += space.pricePerHour;
            }
        });

        const newItem = {
            id: Date.now(),
            space: selectedSpaceId,
            spaceName: space.name,
            date: selectedDate,
            slots: selectedSlots,
            amount: chunkAmount
        };

        setCart([...cart, newItem]);
        setSelectedSlots([]);
        toast.success("Added to Cart");
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const openCheckout = () => {
        if (cart.length === 0 && selectedSlots.length > 0) {
            addToCart();
            setTimeout(() => setShowModal(true), 100);
        } else if (cart.length > 0) {
            setShowModal(true);
        } else {
            toast.error("Cart is empty");
        }
    };

    const calculateCartTotal = () => cart.reduce((sum, item) => sum + item.amount, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const totalCartAmount = calculateCartTotal();
        const totalPayable = totalCartAmount - discount;

        try {
            await dispatch(createBookingBatch({
                items: cart,
                customerName,
                customerMobile,
                customerEmail,
                totalAmount: totalPayable,
                paymentMode,
                paidAmount,
                discount
            })).unwrap();

            setShowModal(false);
            setCart([]);
            setCustomerName('');
            setCustomerMobile('');
            setPaidAmount(0);
            setDiscount(0);
            setCustomerEmail('');
            toast.success("Booking Confirmed!");
        } catch (error) {
            toast.error(error || "Booking failed");
        }
    };

    const [invoiceModal, setInvoiceModal] = useState({ show: false, booking: null });

    const handleInvoiceClick = (booking) => {
        setInvoiceModal({ show: true, booking });
    };

    const handleDownloadInvoice = (type) => {
        const { booking } = invoiceModal;
        if (!booking) return;

        generateInvoice(booking, type, {
            turfName: user?.turfName,
            address: user?.address,
            phone: user?.phone
        });

        setInvoiceModal({ show: false, booking: null });
        toast.success(`Generated ${type.toUpperCase()} Invoice`);
    };

    const shareWhatsApp = (booking) => {
        const sName = booking.space?.name || "Turf";
        const msg = `*Booking Confirmed*\n\nTurf: ${user.turfName}\nCustomer: ${booking.customerName}\nSpace: ${sName}\nDate: ${booking.date}\nSlots: ${booking.slots.join(', ')}\nTotal: Rs.${booking.totalAmount}\nPaid: Rs.${booking.paidAmount}\n\nThank you!`;
        const url = `https://wa.me/91${booking.customerMobile}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    const handleCancel = async (id) => {
        if (window.confirm('Cancel this booking?')) {
            try {
                const token = user.token;
                await axios.put(`${API_URL}/bookings/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
                toast.success('Cancelled');
                dispatch(getBookings(selectedDate));
            } catch (err) {
                toast.error('Failed to cancel');
            }
        }
    };

    const cartTotal = calculateCartTotal();
    const grandTotal = cartTotal - discount;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-24">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bookings</h1>
                    <p className="text-gray-500 mt-1">Select date and space using the controls.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative group w-full sm:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Calendar size={18} />
                        </div>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-auto text-gray-900 font-bold transition-all hover:bg-white cursor-pointer"
                        />
                    </div>

                    <div className="relative w-full sm:w-auto">
                        <select
                            value={selectedSpaceId}
                            onChange={(e) => setSelectedSpaceId(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-auto text-gray-900 font-bold cursor-pointer hover:bg-white transition-all ml-4"
                        >
                            {spaces.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-3 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                            <Clock className="text-indigo-600" size={20} />
                            <h2 className="text-xl font-bold text-gray-800">Time Slots</h2>
                            <div className="flex gap-4 ml-auto text-xs font-medium">
                                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white border border-gray-300"></span> Available</div>
                                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Selected</div>
                                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-100 border border-red-200"></span> Booked</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-gray-900 font-bold">
                            {SLOT_TIMES.filter(slot => {
                                const space = spaces.find(s => s && s._id === selectedSpaceId);
                                if (!space) return true;
                                const hasCustomRate = space.customRates && space.customRates[slot] !== undefined;
                                return hasCustomRate || space.pricePerHour > 0;
                            }).map(slot => {
                                const isBooked = dbBlockedSlots.includes(slot);
                                const isCart = cartBlockedSlots.includes(slot);
                                const isSelected = selectedSlots.includes(slot);

                                const space = spaces.find(s => s && s._id === selectedSpaceId);
                                const price = space && space.customRates && space.customRates[slot] ? space.customRates[slot] : space?.pricePerHour;

                                let btnClass = "bg-white border-gray-200 hover:border-indigo-500 hover:shadow-md";
                                if (isBooked) btnClass = "bg-red-50 border-red-100 text-red-300 cursor-not-allowed";
                                else if (isCart) btnClass = "bg-purple-50 border-purple-200 text-purple-700 cursor-not-allowed opacity-60";
                                else if (isSelected) btnClass = "bg-indigo-600 border-indigo-600 text-white shadow-lg transform scale-105 ring-2 ring-indigo-200";

                                return (
                                    <button
                                        key={slot}
                                        disabled={isBooked || isCart}
                                        onClick={() => toggleSlot(slot)}
                                        className={`py-4 px-2 rounded-xl border text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1 ${btnClass}`}
                                    >
                                        <span className="tracking-wide">{slot}</span>
                                        <span className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>₹{price}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FileText size={18} className="text-gray-400" /> Bookings for {selectedDate}</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="p-4 pl-6">Customer</th>
                                        <th className="p-4">Space</th>
                                        <th className="p-4">Slots</th>
                                        <th className="p-4">Total</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 pr-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-100">
                                    {safeBookings.filter(b => b && (b.space?._id || b.space) === selectedSpaceId).length === 0 ? (
                                        <tr><td colSpan="6" className="p-12 text-center text-gray-400">No bookings found for this specific date and space.</td></tr>
                                    ) : (
                                        safeBookings.filter(b => b && (b.space?._id || b.space) === selectedSpaceId).map(b => (
                                            <tr key={b._id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="p-4 pl-6">
                                                    <div className="font-bold text-gray-900">{b.customerName}</div>
                                                    <div className="text-xs text-gray-500">{b.customerMobile}</div>
                                                </td>
                                                <td className="p-4 text-gray-600 font-medium">{b.space?.name || 'Unknown'}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                        {b.slots.map(s => <span key={s} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200 font-mono">{s}</span>)}
                                                    </div>
                                                </td>
                                                <td className="p-4 font-bold text-gray-700">₹{b.totalAmount}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${b.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                                        {b.status === 'Cancelled' && <XCircle size={10} className="mr-1" />}
                                                        {b.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 pr-6 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleInvoiceClick(b)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Invoice"><FileText size={16} /></button>
                                                    <button onClick={() => shareWhatsApp(b)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="WhatsApp"><Phone size={16} /></button>
                                                    {b.status !== 'Cancelled' && <button onClick={() => handleCancel(b._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Cancel"><Trash2 size={16} /></button>}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="hidden xl:block xl:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                            <ShoppingCart className="text-indigo-600" size={20} />
                            <h2 className="text-lg font-bold text-gray-800">Your Cart</h2>
                            <span className="ml-auto bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">{cart.length}</span>
                        </div>

                        {cart.length === 0 && selectedSlots.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">
                                <p>Select slots from grid <br />to start booking</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-3 pr-1">
                                    {cart.map(item => (
                                        <div key={item.id} className="bg-gray-50 border border-gray-200 p-3 rounded-xl relative group transition-all hover:bg-gray-100 hover:border-gray-300">
                                            <button onClick={() => removeFromCart(item.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                                                <XCircle size={16} />
                                            </button>
                                            <div className="font-bold text-indigo-900 text-sm mb-1">{item.spaceName}</div>
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {item.slots.map(s => <span key={s} className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-[10px] text-gray-600">{s}</span>)}
                                            </div>
                                            <div className="text-right font-bold text-gray-700 text-sm">₹{item.amount}</div>
                                        </div>
                                    ))}
                                </div>

                                {selectedSlots.length > 0 && (
                                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-100 rounded-full blur-2xl -mr-8 -mt-8"></div>
                                        <div className="relative z-10">
                                            <div className="text-indigo-900 text-sm font-bold flex justify-between items-center mb-2">
                                                <span>Current Selection</span>
                                                <span className="bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded text-[10px]">{selectedSlots.length}</span>
                                            </div>
                                            <button onClick={addToCart} className="w-full mt-1 bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm transition-all transform active:scale-95">
                                                Add to List
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {cart.length > 0 && (
                                    <div className="pt-4 border-t border-gray-100 mt-4">
                                        <div className="flex justify-between text-sm mb-4">
                                            <span className="text-gray-500 font-medium">Total Amount</span>
                                            <span className="font-bold text-2xl text-gray-800">₹{cartTotal}</span>
                                        </div>
                                        <button onClick={openCheckout} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 group">
                                            Checkout Now <CheckCircle size={18} className="text-indigo-200 group-hover:text-white transition-colors" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity" onClick={() => setShowModal(false)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 animate-scale-in max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                            <h2 className="text-xl font-bold text-gray-800">Finalize Booking</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-all"><XCircle size={24} /></button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="bg-indigo-50 p-4 rounded-xl text-sm flex items-start gap-3 border border-indigo-100 text-indigo-900 shadow-sm">
                                    <CheckCircle className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                                    <div>You are booking <strong>{cart.length} spaces</strong>.</div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Customer Name</label>
                                            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900 placeholder-gray-400" placeholder="John Doe" required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mobile Number</label>
                                            <input type="tel" value={customerMobile} onChange={e => setCustomerMobile(e.target.value)} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900 placeholder-gray-400" placeholder="9876543210" required />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email (Optional)</label>
                                        <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900" placeholder="john@example.com" />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Subtotal</span>
                                        <span className="font-bold text-gray-900">₹{cartTotal}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Discount</span>
                                        <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-24 bg-white border border-gray-200 rounded-lg p-1.5 text-right font-bold text-gray-900" />
                                    </div>
                                    <div className="flex justify-between font-black text-xl border-t border-gray-200 pt-4 text-gray-900">
                                        <span className="text-base text-gray-600 font-bold">Total Payable</span>
                                        <span>₹{grandTotal}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Payment Mode</label>
                                        <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl outline-none font-bold text-gray-900">
                                            <option value="Cash">Cash</option>
                                            <option value="UPI">UPI</option>
                                            <option value="Credit">Credit</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Paid Amount</label>
                                        <input type="number" value={paidAmount} onChange={e => setPaidAmount(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl outline-none font-bold text-gray-900" required />
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-lg">Confirm Booking</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {invoiceModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setInvoiceModal({ show: false, booking: null })}></div>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 p-6 animate-scale-in">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Select Invoice Format</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {['thermal', 'a4', 'a5'].map(f => (
                                <button key={f} onClick={() => handleDownloadInvoice(f)} className="w-full py-3 px-4 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2 capitalize">
                                    <FileText size={18} /> {f === 'thermal' ? 'Thermal (80mm)' : `Standard (${f.toUpperCase()})`}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setInvoiceModal({ show: false, booking: null })} className="w-full mt-4 py-2 text-gray-400 hover:text-gray-600 font-medium text-sm">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bookings;
