#!/usr/bin/env node

/**
 * BillBooky Vision AI Bridge Daemon CLI Entry Point
 * Starts the local loopback server on 127.0.0.1:8989
 */

const { startBridge } = require('../src/index')

console.log('------------------------------------------------------------')
console.log('   BillBooky Vision AI Bridge Companion Daemon')
console.log('   Connecting office CCTV cameras (CP Plus, Dahua, Hikvision)')
console.log('   100% DPDP Act Compliant: Zero Raw Video Frames Saved')
console.log('------------------------------------------------------------')

startBridge()
