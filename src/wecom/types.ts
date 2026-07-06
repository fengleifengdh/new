export type WeComJsApi =
  | 'getLocation'
  | 'openLocation'
  | 'scanQRCode'
  | 'chooseImage'
  | 'previewImage'
  | 'uploadImage'
  | 'getNetworkType'
  | 'closeWindow';

export type WeComAgentJsApi =
  | 'selectExternalContact'
  | 'openUserProfile'
  | 'shareAppMessage'
  | 'thirdPartyOpenPage';

export interface WeComSignature {
  appId?: string;
  corpId?: string;
  agentId?: string | number;
  timestamp: number;
  nonceStr: string;
  signature: string;
  agentSignature?: string;
}

export interface WeComConfigOptions {
  corpId: string;
  agentId?: string;
  signatureEndpoint: string;
  jsApiList?: WeComJsApi[];
  agentJsApiList?: WeComAgentJsApi[];
}

export interface WeComBridge {
  config(options: Record<string, unknown>): void;
  ready(callback: () => void): void;
  error(callback: (error: unknown) => void): void;
  agentConfig?(options: Record<string, unknown>): void;
  invoke?(name: string, payload: Record<string, unknown>, callback: (response: unknown) => void): void;
}

declare global {
  interface Window {
    wx?: WeComBridge;
  }
}
