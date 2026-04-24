'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Download, Upload } from 'lucide-react'

export function InventoryCsvControls() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [isImporting, setIsImporting] = useState(false)
    const [isPending, startTransition] = useTransition()

    const openFilePicker = () => fileInputRef.current?.click()

    const handleExport = () => {
        window.location.href = '/api/inventory/export'
    }

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.set('file', file)
        setIsImporting(true)

        try {
            const response = await fetch('/api/inventory/import', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.error || 'Failed to import CSV')
            }

            alert(`Imported ${result.importedCount} inventory items successfully.`)
            startTransition(() => router.refresh())
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to import CSV')
        } finally {
            setIsImporting(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleImport}
            />
            <Button type="button" variant="outline" className="gap-2" onClick={handleExport} disabled={isPending || isImporting}>
                <Download className="h-4 w-4" />
                Export CSV
            </Button>
            <Button type="button" variant="outline" className="gap-2" onClick={openFilePicker} disabled={isPending || isImporting}>
                <Upload className="h-4 w-4" />
                {isImporting ? 'Importing...' : 'Import CSV'}
            </Button>
        </div>
    )
}
