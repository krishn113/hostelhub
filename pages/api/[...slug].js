import serverless from "serverless-http";

let handlerInstance = null;
let isConnected = false;

async function getHandler() {
  if (!handlerInstance) {
    const { default: expressApp } = await import("../../app.js");
    handlerInstance = serverless(expressApp);
  }
  return handlerInstance;
}

async function ensureDB() {
  if (!isConnected) {
    const { default: connectDB } = await import("../../lib/db.js");
    await connectDB();
    isConnected = true;
  }
}

export default async function handler(req, res) {
  try {
    await ensureDB();
    const handler = await getHandler();
    return handler(req, res);
  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}