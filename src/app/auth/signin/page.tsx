
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Eye, EyeOff, Loader2, ShieldCheck, ArrowRight, ShieldAlert } from 'lucide-react';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                // Wait a moment for cookie to be properly set
                await new Promise(resolve => setTimeout(resolve, 500));
                // Redirect to /admin (middleware will redirect 303 to /admin/overview)
                router.push('/admin');
            } else {
                const data = await response.json();
                setError(data.error || 'Identity verification failed');
            }
        } catch (err) {
            setError('System communication error. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden font-sans">
            {/* Ultra-Premium Background Design */}
            <div className="absolute inset-0 z-0">
                {/* Mesh Gradient */}
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-emerald-900/20 rounded-full blur-[160px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>

                {/* Tech Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                ></div>
            </div>

            <div className="w-full max-w-110 relative z-10 transition-all duration-500 ease-out">
                {/* Branding Section */}
                <div className="text-center mb-10 transition-all duration-700 animate-in fade-in slide-in-from-top-8">
                    <div className="relative inline-block group">
                        <div className="absolute inset-0 bg-emerald-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-3xl shadow-2xl mb-6 shadow-emerald-500/20 rotate-3 group-hover:rotate-0 transition-all duration-500">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white mb-2 leading-none">
                        Bonga<span className="text-emerald-500">Admin</span>
                    </h1>
                    <p className="text-zinc-500 font-medium text-sm tracking-wide uppercase flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                        Secure Terminal Access
                    </p>
                </div>

                {/* Login Card with Glassmorphism */}
                <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[40px] p-10 shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden group animate-in zoom-in-95 duration-700">
                    {/* Subtle Internal Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-emerald-500/50 to-transparent"></div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        {error && (
                            <div className="p-4 bg-red-950/30 border border-red-500/20 text-red-400 text-sm rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <ShieldAlert className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Registry Name</label>
                            <div className="relative group/input">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-emerald-500 transition-colors duration-300">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                    className="w-full pl-14 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-white/8 transition-all outline-none text-white font-medium placeholder:text-zinc-600 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Access Key</label>
                            <div className="relative group/input">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-emerald-500 transition-colors duration-300">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-14 pr-14 py-4 bg-white/5 border border-white/5 rounded-2xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-white/8 transition-all outline-none text-white font-medium placeholder:text-zinc-600 shadow-inner"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full group/btn relative py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 overflow-hidden shadow-2xl shadow-emerald-500/20 active:scale-95"
                        >
                            <div className="absolute inset-0 w-full h-full bg-linear-to-r from-emerald-400/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <span>Establish Session</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Bottom Info */}
                    <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500/60 uppercase tracking-tighter">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            Secure Tunnel Active
                        </div>
                        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                            SYS_NODE: BC_001
                        </div>
                    </div>
                </div>

                {/* Footer Warnings */}
                <div className="mt-10 space-y-4 px-4 transition-all duration-1000 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-px flex-1 bg-linear-to-r from-transparent to-zinc-800"></div>
                        <ShieldCheck className="w-4 h-4 text-zinc-700" />
                        <div className="h-px flex-1 bg-linear-to-l from-transparent to-zinc-800"></div>
                    </div>
                    <p className="text-center text-[10px] text-zinc-600 leading-normal uppercase tracking-widest font-bold">
                        Proprietary infrastructure of <span className="text-zinc-500">BongaChapaa</span>.<br />
                        Unauthorized interception will result in legal action.
                    </p>
                </div>
            </div>

            {/* Floating Tech Elements */}
            <div className="absolute top-20 right-20 w-32 h-32 border border-emerald-500/10 rounded-full animate-[spin_20s_linear_infinite] pointer-events-none hidden lg:block"></div>
            <div className="absolute bottom-20 left-20 w-48 h-48 border-t border-emerald-500/5 rounded-full animate-[spin_30s_linear_infinite_reverse] pointer-events-none hidden lg:block"></div>
        </div>
    );
}
