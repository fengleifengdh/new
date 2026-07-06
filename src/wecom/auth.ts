export function getWeComAuthCode(search = window.location.search): string | null {
  return new URLSearchParams(search).get('code');
}

export function buildWeComOAuthUrl(options: {
  corpId: string;
  agentId: string;
  redirectUri?: string;
  state?: string;
  scope?: 'snsapi_base' | 'snsapi_privateinfo';
}) {
  const redirectUri = options.redirectUri || window.location.href.split('#')[0];
  const state = options.state || 'wecom';
  const scope = options.scope || 'snsapi_base';

  return [
    'https://open.weixin.qq.com/connect/oauth2/authorize',
    `?appid=${encodeURIComponent(options.corpId)}`,
    `&redirect_uri=${encodeURIComponent(redirectUri)}`,
    '&response_type=code',
    `&scope=${scope}`,
    `&agentid=${encodeURIComponent(options.agentId)}`,
    `&state=${encodeURIComponent(state)}`,
    '#wechat_redirect',
  ].join('');
}

export function redirectToWeComOAuth(options: Parameters<typeof buildWeComOAuthUrl>[0]) {
  window.location.assign(buildWeComOAuthUrl(options));
}
