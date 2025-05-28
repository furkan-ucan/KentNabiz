/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_NODE_ENV: string;
  // Diğer environment değişkenleriniz varsa buraya ekleyebilirsiniz
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
