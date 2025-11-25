// Manually define ImportMetaEnv as the vite/client types are missing in this environment
interface ImportMetaEnv {
  readonly API_KEY: string;
  readonly [key: string]: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
