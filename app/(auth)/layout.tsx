import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
            <div className="w-full max-w-sm">
                {/* Logo Header */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
                    <Image 
                        src="/logo-icon.svg" 
                        alt="BillBooky Logo" 
                        width={48} 
                        height={48}
                        priority
                        className="transition-transform group-hover:scale-110"
                    />
                    <span className="text-2xl font-bold bg-linear-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                        BillBooky
                    </span>
                </Link>
                {children}
            </div>
        </div>
    )
}
