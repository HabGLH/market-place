import { createHmac, timingSafeEqual } from "node:crypto";
import PaymentProvider from "./PaymentProvider.js";

export default class ChapaProvider extends PaymentProvider {
  constructor({
    secretKey = process.env.CHAPA_SECRET_KEY,
    webhookSecret = process.env.CHAPA_WEBHOOK_SECRET,
    baseUrl = "https://api.chapa.co/v1",
    fetchImpl = (...args) => globalThis.fetch(...args),
  } = {}) {
    super();
    this.secretKey = secretKey;
    this.webhookSecret = webhookSecret;
    this.baseUrl = baseUrl;
    this.fetchImpl = fetchImpl;
  }

  async request(path, options = {}) {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || "Chapa request failed");
    }
    return payload;
  }

  initialize(payload) {
    return this.request("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  verify(txRef) {
    return this.request(`/transaction/verify/${encodeURIComponent(txRef)}`);
  }

  verifyWebhook(rawBody, headers) {
    const signature = headers["x-chapa-signature"];
    const chapaSignature = headers["chapa-signature"];
    const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody);
    const payloadDigests = [body];
    try {
      payloadDigests.push(
        Buffer.from(JSON.stringify(JSON.parse(body.toString("utf8")))),
      );
    } catch {
      return false;
    }
    const secretDigest = createHmac("sha256", this.webhookSecret)
      .update(this.webhookSecret)
      .digest("hex");

    return (
      payloadDigests.some((payload) =>
        this.signatureMatches(
          signature,
          createHmac("sha256", this.webhookSecret)
            .update(payload)
            .digest("hex"),
        ),
      ) || this.signatureMatches(chapaSignature, secretDigest)
    );
  }

  signatureMatches(signature, expected) {
    if (typeof signature !== "string") return false;
    const received = Buffer.from(signature, "hex");
    const digest = Buffer.from(expected, "hex");
    return (
      received.length === digest.length && timingSafeEqual(received, digest)
    );
  }
}
