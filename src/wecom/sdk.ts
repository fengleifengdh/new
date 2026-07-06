import type { WeComBridge, WeComConfigOptions, WeComSignature } from './types';

const WECOM_SDK_URL = 'https://res.wx.qq.com/wwopen/js/jsapi/jweixin-1.0.0.js';

let sdkPromise: Promise<WeComBridge> | null = null;

export function loadWeComSdk(): Promise<WeComBridge> {
  if (window.wx) {
    return Promise.resolve(window.wx);
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WECOM_SDK_URL}"]`);

    if (existing) {
      existing.addEventListener('load', () => resolveWindowWx(resolve, reject), { once: true });
      existing.addEventListener('error', () => reject(new Error('企业微信 JS-SDK 加载失败')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = WECOM_SDK_URL;
    script.async = true;
    script.onload = () => resolveWindowWx(resolve, reject);
    script.onerror = () => reject(new Error('企业微信 JS-SDK 加载失败'));
    document.head.appendChild(script);
  });

  return sdkPromise;
}

export async function configureWeCom(options: WeComConfigOptions): Promise<WeComBridge> {
  const wx = await loadWeComSdk();
  const signature = await fetchSignature(options.signatureEndpoint);

  await configBaseBridge(wx, options, signature);

  if (options.agentId && signature.agentSignature && wx.agentConfig) {
    await configAgentBridge(wx, options, signature);
  }

  return wx;
}

async function fetchSignature(endpoint: string): Promise<WeComSignature> {
  const url = new URL(endpoint, import.meta.env.VITE_API_BASE_URL || window.location.origin);
  url.searchParams.set('url', window.location.href.split('#')[0]);

  const response = await fetch(url.toString(), {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`签名接口请求失败：${response.status}`);
  }

  return response.json() as Promise<WeComSignature>;
}

function configBaseBridge(
  wx: WeComBridge,
  options: WeComConfigOptions,
  signature: WeComSignature,
): Promise<void> {
  return new Promise((resolve, reject) => {
    wx.config({
      beta: true,
      debug: import.meta.env.DEV,
      appId: signature.appId || signature.corpId || options.corpId,
      timestamp: signature.timestamp,
      nonceStr: signature.nonceStr,
      signature: signature.signature,
      jsApiList: options.jsApiList || ['getNetworkType', 'scanQRCode', 'closeWindow'],
    });

    wx.ready(resolve);
    wx.error(reject);
  });
}

function configAgentBridge(
  wx: WeComBridge,
  options: WeComConfigOptions,
  signature: WeComSignature,
): Promise<void> {
  return new Promise((resolve, reject) => {
    wx.agentConfig?.({
      corpid: options.corpId,
      agentid: options.agentId,
      timestamp: signature.timestamp,
      nonceStr: signature.nonceStr,
      signature: signature.agentSignature,
      jsApiList: options.agentJsApiList || [],
      success: resolve,
      fail: reject,
    });
  });
}

function resolveWindowWx(resolve: (wx: WeComBridge) => void, reject: (error: Error) => void) {
  if (window.wx) {
    resolve(window.wx);
    return;
  }

  reject(new Error('未检测到企业微信 JS-SDK 对象'));
}
