
'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

export default function TransactionStatus() {
    const [receipt, setReceipt] = useState('');
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const checkStatus = async () => {
        if (!receipt) return;
        setLoading(true);
        setError('');
        setStatus(null);

        try {
            const res = await fetch(`/api/transactions/status?receipt=${receipt}`);
            const data = await res.json();

            if (res.ok) {
                setStatus(data);
            } else {
                setError(data.error || 'Failed to check status');
            }
        } catch (e) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="track" className="py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800">
            <div className="max-w-xl mx-auto text-center">
                <h3 className="text-2xl font-bold mb-4">Track Your Payment</h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                    Enter your M-PESA receipt number (e.g., QWA123...) to check if your cash has been sent.
                </p>

                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={receipt}
                        onChange={(e) => setReceipt(e.target.value.toUpperCase())}
                        placeholder="M-PESA Receipt Number"
                        className="flex-1 px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black focus:ring-2 focus:ring-green-500 outline-none uppercase"
                    />
                    <button
                        onClick={checkStatus}
                        disabled={loading}
                        className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        Check
                    </button>
                </div>

                {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {status && (
                    <div className="p-6 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 text-left animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-sm text-zinc-500">Receipt</div>
                                <div className="font-mono font-bold">{status.receipt}</div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${status.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                    status.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                        status.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                            'bg-zinc-100 text-zinc-700'
                                }`}>
                                {status.status}
                            </div>
                        </div>
                        <div className="flex justify-between items-end border-t border-zinc-100 dark:border-zinc-800 pt-4">
                            <div>
                                <div className="text-sm text-zinc-500">Payout Amount</div>
                                <div className="text-xl font-bold text-green-600">KES {status.amount}</div>
                            </div>
                            <div className="text-xs text-zinc-400">
                                {new Date(status.date).toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
