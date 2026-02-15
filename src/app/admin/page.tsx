
import { prisma } from '@/lib/prisma';
import { RefreshCcw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
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
                include: { user: true } // Assuming relation exists
            })
        ]);

        const payoutTotal = totalPayout._sum.payoutAmount?.toString() || '0';

        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-zinc-500">Overview of your Bonga Chapaa business.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-6 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="text-sm font-medium text-zinc-500">Total Revenue (Payouts)</div>
                        <div className="text-2xl font-bold mt-2">KES {payoutTotal}</div>
                    </div>
                    <div className="p-6 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="text-sm font-medium text-zinc-500">Total Transactions</div>
                        <div className="text-2xl font-bold mt-2">{totalTransactions}</div>
                    </div>
                    <div className="p-6 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="text-sm font-medium text-zinc-500">Pending Actions</div>
                        <div className="text-2xl font-bold mt-2 text-yellow-600">{pendingCount}</div>
                    </div>
                    <div className="p-6 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="text-sm font-medium text-zinc-500">System Status</div>
                        <div className="text-2xl font-bold mt-2 text-green-600 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Operational
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Recent Transactions</h3>
                        <button className="text-sm text-green-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Receipt</th>
                                    <th className="px-6 py-3 font-medium">Phone</th>
                                    <th className="px-6 py-3 font-medium">Amount (In)</th>
                                    <th className="px-6 py-3 font-medium">Payout (Out)</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {recentTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-6 py-4 font-mono">{tx.mpesaReceiptNumber}</td>
                                        <td className="px-6 py-4">{tx.phoneNumber}</td>
                                        <td className="px-6 py-4 text-green-600 font-medium">KES {tx.equivalentCash.toString()}</td>
                                        <td className="px-6 py-4 font-bold">KES {tx.payoutAmount.toString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.payoutStatus === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                tx.payoutStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {tx.payoutStatus === 'COMPLETED' && <CheckCircle className="w-3 h-3" />}
                                                {tx.payoutStatus === 'PENDING' && <Clock className="w-3 h-3" />}
                                                {tx.payoutStatus === 'FAILED' && <XCircle className="w-3 h-3" />}
                                                {tx.payoutStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500">
                                            {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                                {recentTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">No transactions found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        // Database connection error - show helpful error page
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const isDatabaseError = errorMessage.includes("Can't reach database server");

        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-zinc-500">Overview of your Bonga Chapaa business.</p>
                </div>

                {/* Error Card */}
                <div className="p-8 bg-red-50 dark:bg-red-900/10 rounded-xl border-2 border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-4">
                        <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                                {isDatabaseError ? 'Database Connection Error' : 'Error Loading Dashboard'}
                            </h3>
                            <p className="text-red-800 dark:text-red-200 mb-4">
                                {isDatabaseError
                                    ? "Unable to connect to the database. This usually happens when the database is paused or unreachable."
                                    : errorMessage
                                }
                            </p>

                            {isDatabaseError && (
                                <div className="bg-white dark:bg-black p-4 rounded-lg border border-red-200 dark:border-red-800">
                                    <h4 className="font-semibold text-sm mb-3 text-zinc-900 dark:text-zinc-100">
                                        💡 Troubleshooting Steps:
                                    </h4>
                                    <ol className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                                        <li className="flex gap-2">
                                            <span className="font-semibold">1.</span>
                                            <span>
                                                <strong>Wake up your Neon database:</strong> Visit{' '}
                                                <a
                                                    href="https://console.neon.tech"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:underline"
                                                >
                                                    console.neon.tech
                                                </a>
                                                {' '}and check if your database is active
                                            </span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-semibold">2.</span>
                                            <span>
                                                <strong>Verify connection string:</strong> Check that <code className="px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">DATABASE_URL</code> in <code className="px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">.env</code> is correct
                                            </span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-semibold">3.</span>
                                            <span>
                                                <strong>Test connection:</strong> Run <code className="px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded font-mono text-xs">npm run db:test</code> in your terminal
                                            </span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-semibold">4.</span>
                                            <span>
                                                <strong>Check internet connection:</strong> Ensure you have a stable internet connection
                                            </span>
                                        </li>
                                    </ol>
                                </div>
                            )}

                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2"
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                    Retry Connection
                                </button>
                                <a
                                    href="https://console.neon.tech"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors font-medium text-sm"
                                >
                                    Open Neon Console
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technical Details (collapsed by default) */}
                <details className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    <summary className="cursor-pointer font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                        Technical Details
                    </summary>
                    <pre className="mt-3 p-3 bg-white dark:bg-black rounded text-xs overflow-auto text-red-600">
                        {errorMessage}
                    </pre>
                </details>
            </div>
        );
    }
}
