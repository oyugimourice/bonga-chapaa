
import { prisma } from '@/lib/prisma';
import { RefreshCcw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
    try {
        // Fetch stats concurrently
        const [
            totalTransactions,
            totalPayout,
            pendingCount,
            recentTransactions
        ] = await Promise.all([
            prisma.transaction.count(),
            prisma.transaction.aggregate({
                _sum: { payoutAmount: true }
            }),
            prisma.transaction.count({
                where: { payoutStatus: 'PENDING' }
            }),
            prisma.transaction.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { user: true }
            })
        ]);

        const payoutTotal = totalPayout._sum.payoutAmount?.toString() || '0';

        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
                    <p className="text-zinc-500">Real-time performance metrics and recent activities.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-6 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="text-sm font-medium text-zinc-500">Total Payouts</div>
                        <div className="text-2xl font-bold mt-2">KES {payoutTotal}</div>
                    </div>
                    <div className="p-6 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="text-sm font-medium text-zinc-500">Transactions</div>
                        <div className="text-2xl font-bold mt-2">{totalTransactions}</div>
                    </div>
                    <div className="p-6 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="text-sm font-medium text-zinc-500">Pending Actions</div>
                        <div className="text-2xl font-bold mt-2 text-amber-600 font-mono">{pendingCount}</div>
                    </div>
                    <div className="p-6 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="text-sm font-medium text-zinc-500">Node Status</div>
                        <div className="text-2xl font-bold mt-2 text-emerald-600 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Active
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Live Transactions</h3>
                        <button className="text-xs px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 transition-colors font-bold uppercase tracking-wider">Audit Log</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase text-[10px] font-black tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Receipt</th>
                                    <th className="px-6 py-4">Identity</th>
                                    <th className="px-6 py-4 text-right">Credit</th>
                                    <th className="px-6 py-4 text-right">Debit</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {recentTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-xs">{tx.mpesaReceiptNumber}</td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-medium">{tx.phoneNumber}</td>
                                        <td className="px-6 py-4 text-right text-emerald-600 font-bold">KES {tx.equivalentCash.toString()}</td>
                                        <td className="px-6 py-4 text-right font-black">KES {tx.payoutAmount.toString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${tx.payoutStatus === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                tx.payoutStatus === 'PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {tx.payoutStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-zinc-500 font-mono text-xs">
                                            {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                                {recentTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Clock className="w-8 h-8 text-zinc-300 animate-pulse" />
                                                <p className="text-zinc-500 font-medium">Waiting for incoming telemetry...</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        return (
            <div className="h-[60vh] flex items-center justify-center p-8 bg-red-950/20 rounded-[40px] border border-red-500/20 text-center">
                <div className="max-w-md space-y-6">
                    <div className="w-16 h-16 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-black text-white">Registry Connection Failure</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        The terminal was unable to establish a secure handshake with the database node. Verification of environment variables and network status required.
                    </p>
                    <div className="pt-4">
                        <code className="px-4 py-2 bg-black rounded-xl text-red-400 font-mono text-xs border border-red-500/10">
                            ERR_CODE: DB_OFFLINE_OR_UNREACHABLE
                        </code>
                    </div>
                </div>
            </div>
        );
    }
}
