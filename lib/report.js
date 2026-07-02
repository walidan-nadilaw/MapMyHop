function describeHop(h) {
  if (h.private) return { location: '(private)', isp: '' };
  if (!h.geo) return { location: '(unresolved)', isp: '' };
  return { location: `${h.geo.city}, ${h.geo.country}`, isp: h.geo.isp };
}

export function printHopsTable(hopsWithGeo) {
  console.log('\nHop  IP               Latency    Location              ISP');
  console.log('---  ---------------  ---------  --------------------  ---');
  for (const h of hopsWithGeo) {
    const { location, isp } = describeHop(h);
    const latency = h.latencyMs !== null ? `${h.latencyMs} ms` : '(timeout)';
    console.log(`${String(h.hop).padEnd(4)} ${h.ip.padEnd(16)} ${latency.padEnd(10)} ${location.padEnd(22)}${isp}`);
  }
}
