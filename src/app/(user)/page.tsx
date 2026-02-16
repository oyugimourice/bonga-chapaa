
import Header from '@/components/Header';
import Calculator from '@/components/Calculator';
import TransactionStatus from '@/components/TransactionStatus';
import { ArrowDown, CheckCircle2, Zap, ShieldCheck, Banknote } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export default async function Home() {
    const settings = await prisma.settings.findFirst();
    const rate = parseFloat(settings?.userRate?.toString() || process.env.USER_PAYOUT_RATE || '0.20');

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-green-100 selection:text-green-900">
            <Header />

            <main className="min-h-screen">
                {/* Hero Section */}
                <section className="w-full py-20 md:py-32 px-4 bg-gradient-to-b from-green-50 to-transparent dark:from-green-950/20 dark:to-transparent">
                    <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
                                <Zap className="w-4 h-4 fill-current" /> Instant M-PESA Payouts
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                                Turn Bonga Points into <span className="text-green-600">Real Cash</span>
                            </h1>
                            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto md:mx-0 leading-relaxed">
                                Why let your points expire? Convert them to M-PESA cash instantly.
                                Secure, automated, and the best rates in the market.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <a href="#calculator" className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/20">
                                    Start Converting
                                </a>
                                <a href="#how-it-works" className="px-8 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-foreground font-medium rounded-xl transition-all">
                                    How it works
                                </a>
                            </div>
                        </div>

                        <div className="relative">
                            {/* Decorative background blob */}
                            <div className="absolute inset-0 bg-green-200 dark:bg-green-900/20 rounded-full blur-3xl opacity-30 transform translate-x-10 translate-y-10"></div>
                            <Calculator rate={rate} />
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="w-full py-24 bg-white dark:bg-black border-y border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 text-green-600">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Instant Payouts</h3>
                            <p className="text-zinc-500">
                                Our automated system processes your payment immediately after verification. No waiting.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">100% Secure</h3>
                            <p className="text-zinc-500">
                                Processed via official Safaricom Daraja APIs. Your transaction is safe and traceable.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                                <Banknote className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Best Rates</h3>
                            <p className="text-zinc-500">
                                We offer the most competitive conversion rates in the market, updated daily.
                            </p>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" className="w-full py-24 px-4 container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">How to Convert</h2>
                        <p className="text-zinc-500">Follow these 3 simple steps to get paid.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {[
                            { title: "Dial *126#", desc: "Select Lipa Na Bonga Points" },
                            { title: "Enter Paybill", desc: `Use Paybill: ${process.env.NEXT_PUBLIC_PAYBILL || '123456'}` },
                            { title: "Account Number", desc: "Enter YOUR Phone Number" }
                        ].map((step, i) => (
                            <div key={i} className="relative flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center text-2xl font-bold mb-6 shadow-xl shadow-zinc-900/10 z-10">
                                    {i + 1}
                                </div>
                                {i !== 2 && <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-0"></div>}
                                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                <p className="text-zinc-500 text-center">{step.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 p-8 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl max-w-3xl mx-auto text-center">
                        <h4 className="font-bold text-lg mb-2 text-green-800 dark:text-green-300">Wait! One more thing...</h4>
                        <p className="text-green-700 dark:text-green-400">
                            After sending the points, <span className="font-bold">you will receive an M-PESA message</span> confirming the transfer.
                            Our system will automatically detect it and send you cash instantly to the phone number you used as the Account Number.
                        </p>
                    </div>
                </section>

                {/* Track */}
                <section className="w-full py-24 px-4 bg-zinc-50 dark:bg-black">
                    <div className="container mx-auto text-center">
                        <TransactionStatus />
                    </div>
                </section>
            </main>

            <footer className="py-8 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-500">
                <p>&copy; {new Date().getFullYear()} BongaChapaa. Not affiliated with Safaricom PLC.</p>
            </footer>
        </div>
    );
}
