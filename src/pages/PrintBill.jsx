import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { Printer, ChevronLeft, Layout, FileText, Smartphone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

const PrintBill = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [printFormat, setPrintFormat] = useState('thermal'); // thermal, a5, a4
    const printRef = useRef();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const token = user.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${API_URL}/bookings/${id}`, config);
                setBooking(res.data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load booking details");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchBooking();
    }, [id, API_URL, user.token]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!booking) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 uppercase tracking-widest font-black text-gray-400">
            <p>Booking Not Found</p>
            <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 flex items-center gap-2">
                <ChevronLeft size={20} /> Go Back
            </button>
        </div>
    );

    const invoiceDate = format(new Date(booking.createdAt || new Date()), 'dd/MM/yyyy');
    const invoiceTime = format(new Date(booking.createdAt || new Date()), 'hh:mm:ss a');
    const totalPayable = booking.totalAmount - (booking.discount || 0);

    return (
        <div className="min-h-screen bg-gray-600 pb-10">
            {/* Control Header - Hidden during print */}
            <div className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-bold text-gray-700 transition-all text-sm"
                    >
                        <ChevronLeft size={18} /> Back to POS
                    </button>

                    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                        <button
                            onClick={() => setPrintFormat('thermal')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black transition-all ${printFormat === 'thermal' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <Smartphone size={16} /> Thermal
                        </button>
                        <button
                            onClick={() => setPrintFormat('a5')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black transition-all ${printFormat === 'a5' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <Layout size={16} /> A5
                        </button>
                        <button
                            onClick={() => setPrintFormat('a4')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black transition-all ${printFormat === 'a4' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <FileText size={16} /> A4
                        </button>
                    </div>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-black shadow-lg shadow-emerald-100 transition-all text-sm"
                    >
                        <Printer size={18} /> Print Now
                    </button>
                </div>
            </div>

            {/* Print Container */}
            <div className="mt-8 flex justify-center p-4">
                <div
                    ref={printRef}
                    className={`bg-white shadow-2xl overflow-hidden print:shadow-none transition-all duration-500 ${printFormat === 'thermal' ? 'w-[80mm]' :
                            printFormat === 'a5' ? 'w-[148mm] min-h-[210mm]' :
                                'w-[210mm] min-h-[297mm]'
                        }`}
                >
                    {/* Invoice View */}
                    <div className={`text-gray-900 font-sans ${printFormat === 'thermal' ? 'p-4 text-[12px]' : 'p-12 text-sm'}`}>

                        {/* Header Section */}
                        <div className="text-center mb-6">
                            <h1 className={`${printFormat === 'thermal' ? 'text-xl' : 'text-3xl'} font-black uppercase tracking-tight`}>
                                {user?.turfName || "Biller Pro"}
                            </h1>
                            <p className="font-bold opacity-80">{user?.address}</p>
                            <p className="font-bold opacity-80">Phone: {user?.phone}</p>
                        </div>

                        <div className="border-t-2 border-dashed border-gray-200 my-4"></div>

                        {/* Invoice Info */}
                        <div className={`flex justify-between items-start mb-6`}>
                            <div className="space-y-1">
                                <p className="font-black text-gray-400 text-[10px] uppercase">Bill Details</p>
                                <p className="font-bold">Bill No: #{id.slice(-6).toUpperCase()}</p>
                                <p className="font-medium text-gray-600">Date: {invoiceDate}</p>
                                <p className="font-medium text-gray-600">Time: {invoiceTime}</p>
                                <p className="text-xs font-black text-indigo-600 uppercase">Type: {booking.paymentMode || 'BOOKING'}</p>
                            </div>
                            {printFormat !== 'thermal' && (
                                <div className="text-right">
                                    <h2 className="text-4xl font-black text-gray-100 uppercase tracking-tighter">Invoice</h2>
                                </div>
                            )}
                        </div>

                        {/* Customer Info */}
                        <div className="mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="font-black text-gray-400 text-[10px] uppercase">Bill To</p>
                            <p className="font-black text-lg uppercase">{booking.customerName}</p>
                            <p className="font-bold text-gray-600">{booking.customerMobile}</p>
                        </div>

                        {/* Items Table */}
                        <div className="mb-8">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2 font-black text-[10px] uppercase text-gray-500">Item Description</th>
                                        <th className="p-2 font-black text-[10px] uppercase text-gray-500 text-center">Slots</th>
                                        <th className="p-2 font-black text-[10px] uppercase text-gray-500 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="p-2 py-4">
                                            <p className="font-black text-gray-800">{booking.space?.name || 'Turf Space'}</p>
                                            <p className="text-[10px] text-gray-500">{booking.date}</p>
                                        </td>
                                        <td className="p-2 text-center">
                                            <p className="font-bold">{booking.slots?.length || 0}</p>
                                            <p className="text-[9px] text-gray-400 max-w-[120px] mx-auto">{booking.slots?.join(', ')}</p>
                                        </td>
                                        <td className="p-2 text-right font-black text-gray-900 border-l border-gray-50">₹{booking.totalAmount}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Section */}
                        <div className="flex flex-col items-end space-y-2">
                            <div className="flex justify-between w-48 text-gray-600 font-bold border-b border-gray-50 pb-1">
                                <span>Subtotal:</span>
                                <span>₹{booking.totalAmount}</span>
                            </div>
                            {booking.discount > 0 && (
                                <div className="flex justify-between w-48 text-red-500 font-bold border-b border-gray-50 pb-1">
                                    <span>Discount:</span>
                                    <span>- ₹{booking.discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between w-48 text-xl font-black text-gray-900 pt-2 tracking-tighter">
                                <span>TOTAL:</span>
                                <span>₹{totalPayable}</span>
                            </div>
                            <div className="flex justify-between w-48 text-emerald-600 font-black pt-1">
                                <span>PAID:</span>
                                <span>₹{booking.paidAmount || 0}</span>
                            </div>
                            {(totalPayable - (booking.paidAmount || 0)) > 0 && (
                                <div className="flex justify-between w-48 text-red-600 font-black bg-red-50 p-2 rounded mt-2">
                                    <span>BALANCE DUE:</span>
                                    <span>₹{totalPayable - (booking.paidAmount || 0)}</span>
                                </div>
                            )}
                        </div>

                        <div className="border-t-2 border-dashed border-gray-200 my-8"></div>

                        {/* Footer & QR */}
                        <div className="text-center">
                            <p className="font-black text-gray-800 uppercase tracking-tighter">Thank You For Choosing Us!</p>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 italic uppercase tracking-widest">Powered by Biller Pro</p>

                            <div className="mt-8 flex flex-col items-center">
                                <div className="p-2 bg-white border-2 border-gray-800 rounded-xl shadow-lg">
                                    <QRCodeSVG
                                        value={`https://turf-pos.onrender.com/print/${id}`}
                                        size={printFormat === 'thermal' ? 80 : 100}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 mt-3 uppercase tracking-widest opacity-50">Scan to Verify Invoice</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Print Injected Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    header, footer, nav, .print\\:hidden { display: none !important; }
                    body { background: white !important; margin: 0 !important; padding: 0 !important; }
                    .print-container { width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; }
                    @page {
                        margin: 0;
                        size: ${printFormat === 'thermal' ? '80mm 200mm' : printFormat === 'a5' ? '148mm 210mm' : '210mm 297mm'};
                    }
                }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            ` }} />
        </div>
    );
};

export default PrintBill;
