
'use client';

import { useState } from 'react';
import { ArrowRight, Calculator as CalcIcon } from 'lucide-react';

export default function Calculator({ rate }: { rate: number }) {
    const [points, setPoints] = useState<string>('');

    const pointsNum = parseFloat(points) || 0;
    const amount = (pointsNum * rate).toFixed(2);

    return (
        <div id="calculator" className="w-full max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CalcIcon className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold">Cash Calculator</h2>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">
                        Bonga Points to Sell
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                            placeholder="e.g. 500"
                            className="w-full pl-4 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl text-lg font-medium focus:ring-2 focus:ring-green-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="relative flex items-center justify-center my-2">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                    </div>
                    <div className="relative bg-white dark:bg-zinc-900 px-2 text-zinc-400">
                        <ArrowRight className="h-4 w-4" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-600 dark:text-zinc-400">
                        You Receieve (KES)
                    </label>
                    <div className="w-full pl-4 pr-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-2xl font-bold text-green-600 dark:text-green-400">
                        KES {amount}
                    </div>
                    <p className="text-xs text-zinc-500 mt-2 text-right">
                        Rate: {rate} KES/Point
                    </p>
                </div>

                <button
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/20 active:scale-[0.98]"
                >
                    Sell Now
                </button>
            </div>
        </div>
    );
}
