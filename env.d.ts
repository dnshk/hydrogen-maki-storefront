/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    PUBLIC_CALCOM_USERNAME?: string;
    PUBLIC_CALCOM_DISCOVERY_EVENT?: string;
    PUBLIC_CALCOM_INITIAL_EVENT?: string;
  }
}
