/**
 * ONVIF WS-Discovery Probe
 * Sends UDP multicast probes to discover IP cameras on the local office subnet (239.255.255.250:3702).
 */

import dgram from 'dgram'

export interface DiscoveredCamera {
    ip: string
    port: number
    name: string
    manufacturer?: string
    onvifUrl?: string
}

export function probeSubnetCameras(timeoutMs = 2500): Promise<DiscoveredCamera[]> {
    return new Promise((resolve) => {
        const discovered: DiscoveredCamera[] = []
        const client = dgram.createSocket('udp4')

        // WS-Discovery Probe Message
        const probeMessage = Buffer.from(
            `<?xml version="1.0" encoding="utf-8"?>
            <Envelope xmlns:dn="http://www.onvif.org/ver10/network/wsdl" xmlns="http://www.w3.org/2003/05/soap-envelope">
              <Header>
                <wsa:MessageID xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing">uuid:${Date.now()}</wsa:MessageID>
                <wsa:To xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing">urn:schemas-xmlsoap-org:ws:2005:04:discovery</wsa:To>
                <wsa:Action xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing">http://schemas.xmlsoap.org/ws/2005/04/discovery/Probe</wsa:Action>
              </Header>
              <Body>
                <Probe xmlns="http://schemas.xmlsoap.org/ws/2005/04/discovery">
                  <Types>dn:NetworkVideoTransmitter</Types>
                </Probe>
              </Body>
            </Envelope>`
        )

        client.on('message', (msg, rinfo) => {
            const xml = msg.toString()
            const nameMatch = xml.match(/onvif:\/\/www\.onvif\.org\/name\/([^\s<]+)/i)
            discovered.push({
                ip: rinfo.address,
                port: rinfo.port,
                name: nameMatch ? decodeURIComponent(nameMatch[1]) : 'ONVIF Camera',
                manufacturer: xml.includes('dahua') ? 'Dahua / CP Plus' : xml.includes('hikvision') ? 'Hikvision' : 'Standard ONVIF'
            })
        })

        client.on('error', () => {
            // Ignore socket binding issues gracefully
            client.close()
            resolve(discovered)
        })

        // Standard ONVIF multicast target
        try {
            client.send(probeMessage, 0, probeMessage.length, 3702, '239.255.255.250')
        } catch {
            // Ignore multicast send errors on restricted adapters
        }

        setTimeout(() => {
            try { client.close() } catch {}
            resolve(discovered)
        }, timeoutMs)
    })
}
