import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const IPV4_REGEX = /\b\d{1,3}(?:\.\d{1,3}){3}\b/;

export function isPrivateIp(ip) {
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 127 ||
    (a === 169 && b === 254)
  );
}

export async function runTracert(host) {
  const { stdout } = await execAsync(`tracert -d ${host}`, { maxBuffer: 10 * 1024 * 1024 });
  return stdout;
}

export function parseHops(output) {
  const hops = [];
  for (const line of output.split(/\r?\n/)) {
    const match = line.match(/^\s*(\d+)/);
    if (!match) continue;
    const ipMatch = line.match(IPV4_REGEX);
    if (!ipMatch) continue;

    const msValues = [...line.matchAll(/(\d+)\s*ms/g)].map((m) => Number(m[1]));
    const latencyMs = msValues.length > 0
      ? Math.round(msValues.reduce((sum, ms) => sum + ms, 0) / msValues.length)
      : null;

    hops.push({ hop: Number(match[1]), ip: ipMatch[0], latencyMs });
  }
  return hops;
}
