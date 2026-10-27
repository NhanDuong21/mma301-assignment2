const { spawn } = require('node:child_process');
const path = require('node:path');
const os = require('node:os');
const { isIPv4 } = require('node:net');

// This LDPlayer installation can reach the PC's LAN IP; 10.0.2.2 times out.
// Prefer active Wi-Fi and allow an explicit IP when using another adapter.
const wifiAddresses = Object.entries(os.networkInterfaces())
  .filter(([name]) => /wi-?fi|wlan/i.test(name))
  .flatMap(([, addresses]) => addresses)
  .filter(
    (item) => item.family === 'IPv4' && !item.internal && !item.address.startsWith('169.254.'),
  );
const host =
  process.env.LDPLAYER_HOST || (wifiAddresses.length === 1 ? wifiAddresses[0].address : '');
if (!isIPv4(host)) {
  console.error(
    'Không xác định được IP Wi-Fi. PowerShell: $env:LDPLAYER_HOST="<IP-LAN>" rồi chạy lại.',
  );
  process.exit(1);
}
console.log(`LDPlayer Expo: exp://${host}:8081 | AI proxy: http://${host}:3001`);
if (process.argv.includes('--print-config')) process.exit(0);
const cli = path.join(path.dirname(require.resolve('expo/package.json')), 'bin', 'cli');
const child = spawn(process.execPath, [cli, 'start', '--clear', '--lan', '--port', '8081'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    REACT_NATIVE_PACKAGER_HOSTNAME: host,
    EXPO_PUBLIC_AI_PROXY_URL: `http://${host}:3001`,
  },
});

child.on('error', (error) => {
  console.error(`Không khởi động được Expo: ${error.message}`);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
