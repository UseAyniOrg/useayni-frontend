interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  API_ORIGIN?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.hostname === 'useayni.com') {
      url.hostname = 'www.useayni.com';
      return Response.redirect(url.toString(), 301);
    }

    if (url.hostname === 'api.useayni.com') {
      if (!env.API_ORIGIN) return new Response('API origin is not configured', { status: 503 });
      let origin: URL;
      try {
        origin = new URL(env.API_ORIGIN);
      } catch {
        return new Response('API origin is invalid', { status: 503 });
      }
      if (origin.protocol !== 'https:' || !origin.hostname.endsWith('.run.app')) {
        return new Response('API origin is not an approved Cloud Run host', { status: 503 });
      }
      const upstream = new URL(`${url.pathname}${url.search}`, origin);
      return fetch(new Request(upstream, request));
    }

    return env.ASSETS.fetch(request);
  },
};