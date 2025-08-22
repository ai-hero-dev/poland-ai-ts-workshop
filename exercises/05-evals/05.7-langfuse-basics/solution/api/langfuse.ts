import { Langfuse } from 'langfuse';
import { LangfuseExporter } from 'langfuse-vercel';
import { NodeSDK } from '@opentelemetry/sdk-node';

export const otelSDK = new NodeSDK({
  traceExporter: new LangfuseExporter(),
});

otelSDK.start();

export const langfuse = new Langfuse({
  environment: process.env.NODE_ENV,
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL,
});
