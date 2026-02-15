
'use client';

import { DollarSign, Shield, ExternalLink, Bell, Save, Mail, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Settings {
    emailNotifications: boolean;
    lowFloatWarning: boolean;
    lowFloatThreshold: number;
    notificationEmail: string;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>({
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
                    <p className="text-zinc-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-zinc-500">Configure your BongaChapaa business settings.</p>
            </div>

            {/* Business Configuration */}
            <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <h3 className="font-bold text-lg">Business Rates</h3>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                            <div className="text-sm text-zinc-500 mb-1">User Payout Rate</div>
                            <div className="text-2xl font-bold text-green-600">
                                KES {process.env.NEXT_PUBLIC_USER_PAYOUT_RATE || "0.20"}
                            </div>
                            <div className="text-xs text-zinc-500 mt-1">per Bonga Point</div>
                        </div>
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                            <div className="text-sm text-zinc-500 mb-1">Safaricom Rate</div>
                            <div className="text-2xl font-bold text-blue-600">
                                KES {process.env.NEXT_PUBLIC_SAFARICOM_PAYOUT_RATE || "0.30"}
                            </div>
                            <div className="text-xs text-zinc-500 mt-1">per Bonga Point</div>
                        </div>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold text-green-900 dark:text-green-100">Profit Margin</div>
                                <div className="text-sm text-green-700 dark:text-green-300">Your profit per point converted</div>
                            </div>
                            <div className="text-3xl font-bold text-green-600">
                                KES {((parseFloat(process.env.NEXT_PUBLIC_SAFARICOM_PAYOUT_RATE || "0.30") - parseFloat(process.env.NEXT_PUBLIC_USER_PAYOUT_RATE || "0.20"))).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            ℹ️ To change these rates, update the <code className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900 rounded font-mono text-xs">.env</code> file and restart the server.
                        </p>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-green-600" />
                        <h3 className="font-bold text-lg">Notifications</h3>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    {/* Email Address */}
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Notification Email
                        </label>
                        <input
                            type="email"
                            value={settings.notificationEmail}
                            onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                            placeholder="admin@example.com"
                            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-zinc-500">Email address to receive notifications</p>
                            <button
                                onClick={handleSendTestEmail}
                                disabled={sendingTest || !settings.notificationEmail}
                                className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                                <Mail className="w-3 h-3" />
                                {sendingTest ? 'Sending...' : testEmailSent ? 'Sent!' : 'Send Test Email'}
                            </button>
                        </div>
                    </div>

                    {/* Email Notifications Toggle */}
                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                        <div>
                            <div className="font-medium">Email Alerts</div>
                            <div className="text-sm text-zinc-500">Receive email notifications for failed transactions</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.emailNotifications}
                                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-green-600"></div>
                        </label>
                    </div>

                    {/* Low Float Warning Toggle */}
                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                        <div>
                            <div className="font-medium">Low Float Warning</div>
                            <div className="text-sm text-zinc-500">Alert when M-PESA float is running low</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.lowFloatWarning}
                                onChange={(e) => setSettings({ ...settings, lowFloatWarning: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-green-600"></div>
                        </label>
                    </div>

                    {/* Low Float Threshold */}
                    {settings.lowFloatWarning && (
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Low Float Threshold (KES)
                            </label>
                            <input
                                type="number"
                                step="1000"
                                value={settings.lowFloatThreshold}
                                onChange={(e) => setSettings({ ...settings, lowFloatThreshold: Number(e.target.value) })}
                                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <p className="text-xs text-zinc-500 mt-1">Alert when float balance drops below this amount</p>
                        </div>
                    )}
                </div>
            </div>

            {/* M-PESA Configuration */}
            <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-600" />
                        <h3 className="font-bold text-lg">M-PESA Integration</h3>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                            <div className="text-sm text-zinc-500 mb-1">Environment</div>
                            <div className="font-semibold capitalize">
                                {process.env.NEXT_PUBLIC_MPESA_ENVIRONMENT || "sandbox"}
                            </div>
                        </div>
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                            <div className="text-sm text-zinc-500 mb-1">Paybill Number</div>
                            <div className="font-semibold font-mono">
                                {process.env.NEXT_PUBLIC_PAYBILL || "123456"}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            🔐 M-PESA credentials are securely stored in environment variables. Visit the{' '}
                            <a
                                href="https://developer.safaricom.co.ke"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-blue-600 inline-flex items-center gap-1"
                            >
                                Daraja Portal
                                <ExternalLink className="w-3 h-3" />
                            </a>
                            {' '}to manage your API keys.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-bold text-lg">Quick Links</h3>
                </div>
                <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-3">
                        <a
                            href="https://console.neon.tech"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group"
                        >
                            <div>
                                <div className="font-medium">Neon Console</div>
                                <div className="text-sm text-zinc-500">Manage your database</div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                        </a>
                        <a
                            href="https://developer.safaricom.co.ke"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group"
                        >
                            <div>
                                <div className="font-medium">Daraja Portal</div>
                                <div className="text-sm text-zinc-500">M-PESA API dashboard</div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : saved ? 'Settings Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Success Toast */}
            {saved && (
                <div className="fixed bottom-4 right-4 p-4 bg-green-600 text-white rounded-lg shadow-lg animate-in slide-in-from-bottom">
                    ✅ Settings saved successfully!
                </div>
            )}
        </div>
    );
}
