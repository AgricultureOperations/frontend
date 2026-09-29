/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BITACORA_BASE_URL: string;
  readonly VITE_ORDERSERVICE_BASE_URL: string;
  readonly VITE_PRODUCTSERVICE_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
