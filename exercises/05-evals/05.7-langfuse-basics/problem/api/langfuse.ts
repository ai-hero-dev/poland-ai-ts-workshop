// TODO: declare the otelSDK variable using the NodeSDK class
// from the @opentelemetry/sdk-node package,
// and pass it the LangfuseExporter instance
// from the langfuse-vercel package as the traceExporter
export const otelSDK = TODO;

otelSDK.start();

// TODO: declare the langfuse variable using the Langfuse class
// from the langfuse package, and pass it the following arguments:
// - environment: process.env.NODE_ENV
// - publicKey: process.env.LANGFUSE_PUBLIC_KEY
// - secretKey: process.env.LANGFUSE_SECRET_KEY
// - baseUrl: process.env.LANGFUSE_BASE_URL
export const langfuse = TODO;
