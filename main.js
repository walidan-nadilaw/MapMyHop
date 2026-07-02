import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runTracert, parseHops } from './lib/tracert.js';
import { resolveHopsGeo } from './lib/geolocate.js';
import { buildHtml, openInBrowser } from './lib/html.js';
import { printHopsTable } from './lib/report.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const args = process.argv.slice(2);
  const host = args.find((a) => !a.startsWith('--'));
  const showMap = args.includes('--map');

  if (!host) {
    console.error(`Please provide a host`);
    process.exitCode = 1;
    return;
  }

  console.log(`Running tracert to ${host}...`);
  let output;
  try {
    output = await runTracert(host);
  } catch (err) {
    console.error(`tracert failed: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const hops = parseHops(output);
  console.log(`Found ${hops.length} hop(s) with IP addresses.`);

  const hopsWithGeo = await resolveHopsGeo(hops);
  printHopsTable(hopsWithGeo);

  if (showMap) {
    const html = buildHtml(hopsWithGeo, host);
    const outPath = path.resolve(__dirname, 'trace-map.html');
    fs.writeFileSync(outPath, html);
    console.log(`\nMap written to ${outPath}`);

    openInBrowser(outPath);
  }
}

main();
