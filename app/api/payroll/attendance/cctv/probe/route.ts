import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import net from 'net'

const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'])

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { host, port, brand } = body

        if (!host) {
            return NextResponse.json({ success: false, error: 'Host IP or domain is required.' }, { status: 400 })
        }

        const targetPort = parseInt(port, 10) || 554
        if (targetPort < 1 || targetPort > 65535) {
            return NextResponse.json({ success: false, error: 'Invalid port number.' }, { status: 400 })
        }

        const targetHost = host.trim().replace(/^https?:\/\//, '').replace(/^rtsp:\/\//, '').split('/')[0].split('@').pop()?.split(':')[0] || host.trim()
        if (BLOCKED_HOSTS.has(targetHost.toLowerCase()) || targetHost.startsWith('169.254.')) {
            return NextResponse.json({ success: false, error: 'Target host is not permitted.' }, { status: 400 })
        }

        // Perform real TCP socket connection test with a 3.5s timeout
        const isReachable = await new Promise<{ ok: boolean; message: string }>((resolve) => {
            const socket = new net.Socket()
            socket.setTimeout(3500)

            socket.on('connect', () => {
                socket.destroy()
                resolve({ 
                    ok: true, 
                    message: `Successfully connected to ${targetHost}:${targetPort} (${brand ? brand.toUpperCase() : 'CCTV'}). Stream port is OPEN and responding.` 
                })
            })

            socket.on('timeout', () => {
                socket.destroy()
                resolve({ 
                    ok: false, 
                    message: `Connection timed out reaching ${targetHost}:${targetPort}. Please verify camera is powered on and IP is accessible.` 
                })
            })

            socket.on('error', (err: any) => {
                socket.destroy()
                resolve({ 
                    ok: false, 
                    message: `Connection refused on ${targetHost}:${targetPort} (${err.code || err.message}). Check port forwarding or firewall.` 
                })
            })

            try {
                socket.connect(targetPort, targetHost)
            } catch (err: any) {
                resolve({ ok: false, message: `Could not initiate socket: ${err.message}` })
            }
        })

        return NextResponse.json({
            success: isReachable.ok,
            host: targetHost,
            port: targetPort,
            message: isReachable.message
        })
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
