import autocannon from 'autocannon';

function parseArg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= process.argv.length) {
    return fallback;
  }
  return process.argv[idx + 1];
}

const url = parseArg('url', 'http://127.0.0.1:3001/api/auth/login');
const connections = Number(parseArg('connections', '20'));
const duration = Number(parseArg('duration', '15'));
const method = parseArg('method', 'POST').toUpperCase();

const body = JSON.stringify({
  email: 'benchmark@example.com',
  password: 'not-a-real-password',
});

const instance = autocannon({
  url,
  method,
  connections,
  duration,
  headers: {
    'content-type': 'application/json',
    'user-agent': 'fcgbds-benchmark-client/1.0',
    origin: 'https://PLACEHOLDER_WEB_ORIGIN',
    referer: 'https://PLACEHOLDER_WEB_ORIGIN/',
  },
  body: method === 'POST' ? body : undefined,
});

autocannon.track(instance, { renderProgressBar: true });

instance.on('done', (result) => {
  const summary = {
    url,
    method,
    connections,
    duration,
    requestsPerSec: result.requests?.average ?? 0,
    latencyMsP50: result.latency?.p50 ?? 0,
    latencyMsP95: result.latency?.p95 ?? 0,
    errorRate: result.errors && result.requests?.total
      ? Number((result.errors / result.requests.total).toFixed(6))
      : 0,
  };

  console.log('\nFCGBDS Benchmark Summary');
  console.log(JSON.stringify(summary, null, 2));
});
