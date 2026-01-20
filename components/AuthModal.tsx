
import React, { useState } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
import * as authService from '../services/authService';
import { CloseIcon } from './icons';

interface AuthModalProps {
    onClose: () => void;
    onAuthSuccess: (userEmail: string) => void;
}

type AuthMode = 'login' | 'signup';

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onAuthSuccess }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const modalRef = React.useRef<HTMLDivElement>(null);
    useClickOutside(modalRef, onClose);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (mode === 'login') {
            const result = authService.logIn(email, password);
            if (result.success) {
                onAuthSuccess(email);
            } else {
                setError(result.message);
            }
        } else {
            const result = authService.signUp(email, password);
            if (result.success) {
                setSuccessMessage(result.message);
                setMode('login'); // Switch to login tab after successful signup
            } else {
                setError(result.message);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-slate-800">{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                            <CloseIcon className="w-6 h-6 text-slate-500" />
                        </button>
                    </div>

                    <div className="flex border-b mb-4">
                        <button
                            onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
                            className={`flex-1 py-2 text-center font-medium ${mode === 'login' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
                        >
                            Login
                        </button>
                        <button
                             onClick={() => { setMode('signup'); setError(''); setSuccessMessage(''); }}
                            className={`flex-1 py-2 text-center font-medium ${mode === 'signup' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700" htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}
                        {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {mode === 'login' ? 'Login' : 'Create Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
