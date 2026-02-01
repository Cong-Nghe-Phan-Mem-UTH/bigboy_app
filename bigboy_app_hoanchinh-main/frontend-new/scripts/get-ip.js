#!/usr/bin/env node

// Script to get current machine IP address
const { execSync } = require('child_process');

function getLocalIP() {
  try {
    // Try en0 first (usually WiFi on Mac)
    const ip = execSync('ipconfig getifaddr en0', { encoding: 'utf8' }).trim();
    if (ip) return ip;
  } catch (e) {
    // Try en1 if en0 fails
    try {
      const ip = execSync('ipconfig getifaddr en1', { encoding: 'utf8' }).trim();
      if (ip) return ip;
    } catch (e2) {
      // Fallback: try to parse ifconfig output
      try {
        const output = execSync('ifconfig | grep "inet " | grep -v 127.0.0.1', { encoding: 'utf8' });
        const match = output.match(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/);
        if (match) return match[1];
      } catch (e3) {
        console.error('Could not determine IP address');
        return null;
      }
    }
  }
  return null;
}

const ip = getLocalIP();
if (ip) {
  console.log(ip);
} else {
  console.error('Could not determine IP address');
  process.exit(1);
}


