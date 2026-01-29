import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { register, reset } from '../features/auth/authSlice';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', turfName: '' });
    const { name, email, password, turfName } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isError, isSuccess, message } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (isSuccess || user) {
            navigate('/');
        }
        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(register(formData));
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-900">Register Turf</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                        <input type="text" name="name" value={name} onChange={onChange} className="w-full px-4 py-2 mt-1 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Turf Name</label>
                        <input type="text" name="turfName" value={turfName} onChange={onChange} className="w-full px-4 py-2 mt-1 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" value={email} onChange={onChange} className="w-full px-4 py-2 mt-1 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" value={password} onChange={onChange} className="w-full px-4 py-2 mt-1 border rounded-md" required />
                    </div>
                    <button type="submit" className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Register</button>
                    <p className="text-sm text-center text-gray-600">
                        Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};
export default Register;
