import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50/60 text-slate-950 flex flex-col justify-between p-4 sm:p-6 md:p-8" suppressHydrationWarning>
            {/* Top Navigation */}
            <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-2">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="relative w-9 h-9">
                        <Image 
                            src="/logo-icon.svg" 
                            alt="BillBooky Logo" 
                            width={36} 
                            height={36}
                            priority
                            className="transition-transform group-hover:scale-110"
                        />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-slate-950">
                        BillBooky<span className="text-emerald-600">.</span>
                    </span>
                </Link>

                <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                    <span>Need assistance?</span>
                    <Link href="/contact" className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
                        Support →
                    </Link>
                </div>
            </header>

            {/* Main Auth Container */}
            <main className="w-full max-w-md mx-auto my-auto py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="hidden md:block max-w-7xl w-full mx-auto text-center py-4 text-xs text-slate-500 font-medium">
                BillBooky © 2026 BillBooky Inc. All rights reserved.
            </footer>
        </div>
    )
}
