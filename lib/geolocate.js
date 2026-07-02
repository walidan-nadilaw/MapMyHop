import { isPrivateIp } from './tracert.js';

export async function geolocate(ips) {

  if (ips.length === 0)
    return new Map();

  const body = JSON.stringify(
    ips.map((query) => ({ query, fields: 'status,message,country,city,lat,lon,isp,query' }))
  );

  const res = await fetch('http://ip-api.com/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!res.ok) {
    throw new Error(`ip-api.com batch request failed: ${res.status} ${res.statusText}`);
  }

  const results = await res.json();

  const byIp = new Map();
  for (const r of results)
    if (r.status === 'success')
      byIp.set(r.query, r);

  return byIp;
}

export async function resolveHopsGeo(hops) {
  const publicIps = hops.filter((h) => !isPrivateIp(h.ip)).map((h) => h.ip);
  const uniquePublicIps = [...new Set(publicIps)];

  let geoByIp = new Map();
  if (uniquePublicIps.length > 0) {
    console.log(`Geolocating ${uniquePublicIps.length} public IP(s)...`);
    try {
      geoByIp = await geolocate(uniquePublicIps);
    } catch (err) {
      console.warn(`Geolocation failed: ${err.message}`);
    }
  }

  return hops.map((h) => ({
    ...h,
    private: isPrivateIp(h.ip),
    geo: geoByIp.get(h.ip) || null,
  }));
}
