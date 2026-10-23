// This is a conservative request guard, not an OS/network security sandbox.
const configured = new WeakSet();
const local = (value) => {
  try {
    const u = new URL(value);
    return ['http:', 'https:'].includes(u.protocol) && !u.username && !u.password &&
      ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname);
  } catch { return false; }
};
export default async ({ page }) => {
  const context = page.context();
  if (configured.has(context)) return;
  configured.add(context);
  await context.route('**/*', async (route) => {
    const request = route.request();
    if (!local(request.url()) || !['GET', 'HEAD'].includes(request.method())) return route.abort('blockedbyclient');
    try {
      // Do not follow redirects: they can otherwise escape origin checks.
      const response = await route.fetch({ maxRedirects: 0, timeout: 15000 });
      if (response.status() >= 300 && response.status() < 400) return route.abort('blockedbyclient');
      await route.fulfill({ response });
    } catch { await route.abort('failed').catch(() => {}); }
  });
  await context.routeWebSocket('**/*', ws => ws.close());
};
