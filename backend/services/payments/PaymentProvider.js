export default class PaymentProvider {
  async initialize() {
    throw new Error("Payment provider must implement initialize()");
  }

  async verify() {
    throw new Error("Payment provider must implement verify()");
  }

  verifyWebhook() {
    throw new Error("Payment provider must implement verifyWebhook()");
  }
}
