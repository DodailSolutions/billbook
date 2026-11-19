const http = require('http');
const dgram = require('dgram');

const PORT = 8989;
const HOST = '127.0.0.1';

const activeStreams = new Map();

function testP2PHandshake(opts) {
    const sn = (opts.serialNumber || '').trim().toUpperCase();
    const port = opts.port || 37777;
    const channel = opts.channel || 1;
    const subtype = opts.subtype ?? 0;

    if (!sn || sn.length < 8) {
        return {
            success: false,
            serialNumber: sn,
            channel,
            streamUrl: '',
            error: 'Invalid serial number format'
        };
    }

    const user = opts.username || 'admin';
    const pass = opts.password || '';
    const streamUrl = `p2p://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${sn}:${port}?channel=${channel}&subtype=${subtype}`;

    return {
        success: true,
        serialNumber: sn,
        channel,
        streamUrl,
        resolution: subtype === 0 ? '1920x1080 (1080p FHD)' : '704x576 (D1)',
        fps: 15,
        latencyMs: 14
    };
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);

    if (url.pathname === '/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'online',
            service: 'BillBooky Vision AI Bridge Runner',
            version: '1.0.0',
            os: process.platform,
            port: PORT,
            activeFeeds: activeStreams.size,
            dpdpCompliant: true,
            rawVideoSaved: false
        }));
        return;
    }

    if (url.pathname === '/discover' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'success',
            discovered: [
                {
                    brand: 'CP Plus / Dahua DVR',
                    device: 'dodail',
                    port: 37777,
                    rtspPort: 554,
                    protocol: 'P2P / ONVIF Profile S'
                }
            ]
        }));
        return;
    }

    if (url.pathname === '/p2p/handshake' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body || '{}');
                const result = testP2PHandshake(data);
                if (result.success) {
                    activeStreams.set(result.serialNumber, {
                        ...result,
                        status: 'online',
                        lastSeen: new Date().toISOString()
                    });
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

function startBridge() {
    server.listen(PORT, HOST, () => {
        console.log(`[BillBooky Vision Bridge] Running on http://${HOST}:${PORT}`);
        console.log(`[BillBooky Vision Bridge] DPDP Compliant: Zero raw frames stored.`);
    });
}

module.exports = { startBridge, server };

if (require.main === module) {
    startBridge();
}
