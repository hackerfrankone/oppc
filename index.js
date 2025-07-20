export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Only POST allowed", { status: 405 });
    }

    const contentType = request.headers.get("content-type") || "";
    let bodyText;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      bodyText = await request.text();
    } else {
      return new Response("Unsupported content type", { status: 400 });
    }

    // Convert form data to object
    const params = new URLSearchParams(bodyText);
    const payload = Object.fromEntries(params.entries());

    // Forward to your webhook (optional)
    try {
      await fetch("http://paypal-webhook.familyfishingfun2025.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Webhook forward error:", err);
    }

    // Send to Discord
    const discordMessage = {
      content: `🤑 **New PayPal Purchase!**
**Name:** ${payload.first_name || 'N/A'} ${payload.last_name || ''}
**Email:** ${payload.payer_email || 'N/A'}
**Amount:** ${payload.mc_gross || '0.00'} ${payload.mc_currency || ''}
**Item:** ${payload.item_name || 'Unknown'}`,
    };

    try {
      await fetch(env.DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordMessage),
      });
    } catch (err) {
      console.error("Discord Webhook error:", err);
      return new Response("Failed to send to Discord", { status: 500 });
    }

    return new Response("Success", { status: 200 });
  },
};
