
'use client';

import { DollarSign, Shield, ExternalLink, Bell, Save, Mail, AlertTriangle, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Settings {
    userRate: number;
    safaricomRate: number;
    emailNotifications: boolean;
    lowFloatWarning: boolean;
    lowFloatThreshold: number;
    notificationEmail: string;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>({
        userRate: 0.20,
        safaricomRate: 0.30,
        emailNotifications: true,
        lowFloatWarning: true,
        lowFloatThreshold: 10000,
        notificationEmail: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [sendingTest, setSendingTest] = useState(false);
    const [testEmailSent, setTestEmailSent] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                setSettings({
                    userRate: Number(data.userRate),
                    safaricomRate: Number(data.safaricomRate),
                    emailNotifications: data.emailNotifications,
                    lowFloatWarning: data.lowFloatWarning,
                    lowFloatThreshold: Number(data.lowFloatThreshold),
                    notificationEmail: data.notificationEmail || ''
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSendTestEmail = async () => {
        if (!settings.notificationEmail) {
            alert('Please enter an email address first');
            return;
        }

        setSendingTest(true);
        try {
            const response = await fetch('/api/email/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: settings.notificationEmail })
            });

            if (response.ok) {
                setTestEmailSent(true);
                setTimeout(() => setTestEmailSent(false), 5000);
            } else {
                const data = await response.json();
                alert(`Failed to send test email: ${data.error}`);
            }
        } catch (error) {
            console.error('Error sending test email:', error);
            alert('Failed to send test email. Please check your configuration.');
        } finally {
            setSendingTest(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                    <p className="text-zinc-500">Loading your configuration...</p>
                </div>
            </div>
        );
    }

    const currentMargin = (settings.safaricomRate - settings.userRate).toFixed(2);

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-zinc-500">Global system configuration and business rules.</p>
            </div>

            {/* Business Configuration */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                <h3 className="font-bold text-lg">Business Rates</h3>
                            </div>
                            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full font-medium italic">Live Updates</span>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">User Payout Rate (KES per Point)</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-green-600 transition-colors">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={settings.userRate}
                                            onChange={(e) => setSettings({ ...settings, userRate: parseFloat(e.target.value) })}
                                            className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-green-600 outline-none transition-all font-bold text-lg"
                                        />
                                    </div>
                                    <p className="text-xs text-zinc-500 italic">This is the amount the customer sees on the calculator.</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Safaricom Rate (KES per Point)</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={settings.safaricomRate}
                                            onChange={(e) => setSettings({ ...settings, safaricomRate: parseFloat(e.target.value) })}
                                            className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-lg"
                                        />
                                    </div>
                                    <p className="text-xs text-zinc-500 italic">This is what Safaricom pays into your business account.</p>
                                </div>
                            </div>

                            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-3xl border border-green-100 dark:border-green-900/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-green-900 dark:text-green-100 text-lg">Projected Profit Margin</div>
                                        <div className="text-sm text-green-700 dark:text-green-300">Your net earnings per 1 Bonga Point</div>
                                    </div>
                                    <div className="text-4xl font-black text-green-600">
                                        KES {currentMargin}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-green-600" />
                                <h3 className="font-bold text-lg">Notification System</h3>
                            </div>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Admin Notification Email</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-green-600 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        value={settings.notificationEmail}
                                        onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                                        placeholder="admin@example.com"
                                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-green-600 outline-none transition-all"
                                    />
                                    <button
                                        onClick={handleSendTestEmail}
                                        disabled={sendingTest || !settings.notificationEmail}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-zinc-900 dark:bg-zinc-700 text-white text-xs font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50"
                                    >
                                        {sendingTest ? 'Sending...' : testEmailSent ? 'Success!' : 'Test'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <div>
                                        <div className="font-bold text-sm">Failed Payouts</div>
                                        <div className="text-xs text-zinc-500">Email on every failure</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer scale-90">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={settings.emailNotifications}
                                            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-green-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <div>
                                        <div className="font-bold text-sm">Low Float Alert</div>
                                        <div className="text-xs text-zinc-500">Monitor balance</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer scale-90">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={settings.lowFloatWarning}
                                            onChange={(e) => setSettings({ ...settings, lowFloatWarning: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-green-600"></div>
                                    </label>
                                </div>
                            </div>

                            {settings.lowFloatWarning && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Low Float Threshold (KES)</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-600 transition-colors">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="number"
                                            value={settings.lowFloatThreshold}
                                            onChange={(e) => setSettings({ ...settings, lowFloatThreshold: Number(e.target.value) })}
                                            className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-amber-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-zinc-900 rounded-3xl p-8 text-white shadow-xl shadow-zinc-200 dark:shadow-none">
                        <TrendingUp className="w-10 h-10 text-green-400 mb-6" />
                        <h4 className="text-xl font-bold mb-4">Business Intelligence</h4>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-zinc-400 text-sm">
                                <span>Current User Rate</span>
                                <span className="text-white font-mono font-bold">KES {settings.userRate}</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-400 text-sm">
                                <span>Profit per Point</span>
                                <span className="text-green-400 font-mono font-bold">KES {currentMargin}</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-400 text-sm">
                                <span>Points for KES 10,000 Profit</span>
                                <span className="text-white font-mono font-bold">{(10000 / parseFloat(currentMargin)).toFixed(0)} Points</span>
                            </div>
                            <div className="pt-6 border-t border-zinc-800">
                                <p className="text-xs text-zinc-500 leading-relaxed italic">
                                    Decreasing the user payout rate increases your profit margin but may reduce transaction volume.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                        <Shield className="w-6 h-6 text-blue-600 mb-4" />
                        <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">M-PESA Health</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">Environment: <strong>{process.env.NEXT_PUBLIC_MPESA_ENVIRONMENT || 'sandbox'}</strong></p>
                        <a
                            href="https://developer.safaricom.co.ke"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
                        >
                            Open Daraja Portal <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-xl shadow-green-600/30 transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95"
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Applying Changes...' : saved ? 'Settings Updated!' : 'Save System Configuration'}
                </button>
            </div>

            {saved && (
                <div className="fixed bottom-8 right-8 p-6 bg-black text-white rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 flex items-center gap-3 font-bold border border-zinc-800">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <Save className="w-4 h-4 text-white" />
                    </div>
                    System configuration updated successfully
                </div>
            )}
        </div>
    );
}
