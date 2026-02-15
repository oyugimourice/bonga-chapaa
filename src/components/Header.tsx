
import Link from 'next/link';
import { WalletCards } from 'lucide-react';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center px-4 md:px-6">
                <Link className="flex items-center gap-2 font-bold text-xl" href="/">
                    <WalletCards className="h-6 w-6 text-green-600" />
                    <span>Bonga<span className="text-green-600">Chapaa</span></span>
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-sm font-medium hover:underline underline-offset-4" href="#calculator">
                        Calculator
                    </Link>
                    <Link className="text-sm font-medium hover:underline underline-offset-4" href="#how-it-works">
                        How it Works
                    </Link>
                    <Link className="text-sm font-medium hover:underline underline-offset-4" href="#track">
                        Track Transaction
                    </Link>
                </nav>
            </div>
        </header>
    );
}
