// Next.js automatically loads .env.local into process.env for server-side code.
// We do NOT call dotenv.config() here — that would look for .env (not .env.local)
// and would overwrite the variables Next.js already injected.

let appHandler = null;
let isConnected = false;

async function getApp() {
  if (!appHandler) {
    // Lazy import so Next.js has already populated process.env before Express reads it
    const { default: expressApp } = await import("../../app.js");
    appHandler = expressApp;
  }
  return appHandler;
}

async function ensureDB() {
  if (!isConnected) {
    const { default: connectDB } = await import("../../lib/db.js");
    await connectDB();
    isConnected = true;
  }
}

export default async function handler(req, res) {
  await ensureDB();
  const app = await getApp();

  // Hand off to Express — req.url is the full path e.g. /api/auth/login
  // Express routes via app.use("/api/auth", authRoutes) etc.
  return new Promise((resolve, reject) => {
    app(req, res);
    res.on("finish", resolve);
    res.on("error", reject);
  });
}

export const config = {
  api: {
    // Let Express handle body parsing (express.json / express.urlencoded)
    bodyParser: false,
    // Prevents Next.js from warning about the promise resolving outside its scope
    externalResolver: true,
    // Allow large payloads (file uploads etc.)
    responseLimit: false,
  },
};

