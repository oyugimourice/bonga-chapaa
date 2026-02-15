
import { prisma } from '@/lib/prisma';
import { User, Phone, Calendar, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
    try {
        const users = await prisma.user.findMany({
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                    <p className="text-zinc-500">Manage your customer base and transaction history.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-6 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="text-sm font-medium text-zinc-500">Total Customers</div>
                        <div className="text-2xl font-bold mt-2">{users.length}</div>
                    </div>
                    <div className="p-6 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="text-sm font-medium text-zinc-500">Active This Month</div>
                        <div className="text-2xl font-bold mt-2 text-green-600">
                            {users.filter(u => u.transactions.length > 0).length}
                        </div>
                    </div>
                    <div className="p-6 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="text-sm font-medium text-zinc-500">Total Points Converted</div>
                        <div className="text-2xl font-bold mt-2">
                            {users.reduce((sum, u) => sum + Number(u.totalPoints), 0).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Customers Table */}
                <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                        <h3 className="font-bold text-lg">All Customers</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Customer</th>
                                    <th className="px-6 py-3 font-medium">Phone</th>
                                    <th className="px-6 py-3 font-medium">Total Points</th>
                                    <th className="px-6 py-3 font-medium">Transactions</th>
                                    <th className="px-6 py-3 font-medium">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.name || 'Unknown'}</div>
                                                    <div className="text-xs text-zinc-500">{user.id.slice(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-zinc-400" />
                                                {user.phoneNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {Number(user.totalPoints).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                <TrendingUp className="w-3 h-3" />
                                                {user.transactions.length}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                            No customers found. Run <code className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">npm run db:seed</code> to add sample data.
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
            <div className="p-8 bg-red-50 dark:bg-red-900/10 rounded-xl border-2 border-red-200 dark:border-red-800">
                <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Error Loading Customers</h3>
                <p className="text-red-800 dark:text-red-200">
                    {error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
            </div>
        );
    }
}
