
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
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-stone-800">{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100 transition-colors">
                            <CloseIcon className="w-6 h-6 text-stone-400" />
                        </button>
                    </div>

                    <div className="flex border-b border-stone-100 mb-6">
                        <button
                            onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
                            className={`flex-1 py-3 text-center font-bold text-sm transition-all ${mode === 'login' ? 'border-b-2 border-emerald-700 text-emerald-700' : 'text-stone-400'}`}
                        >
                            Login
                        </button>
                        <button
                             onClick={() => { setMode('signup'); setError(''); setSuccessMessage(''); }}
                            className={`flex-1 py-3 text-center font-bold text-sm transition-all ${mode === 'signup' ? 'border-b-2 border-emerald-700 text-emerald-700' : 'text-stone-400'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1" htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1" htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
                            />
                        </div>

                        {error && <p className="text-xs font-bold text-red-600">{error}</p>}
                        {successMessage && <p className="text-xs font-bold text-emerald-600">{successMessage}</p>}

                        <button
                            type="submit"
                            className="w-full bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700 shadow-md shadow-emerald-100 transition-all"
                        >
                            {mode === 'login' ? 'Continue' : 'Create Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
