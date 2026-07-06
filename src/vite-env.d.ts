/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_WECOM_CORP_ID?: string;
  readonly VITE_WECOM_AGENT_ID?: string;
  readonly VITE_WECOM_SIGN_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
