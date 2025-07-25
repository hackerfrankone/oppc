export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Only POST allowed", { status: 405 });
    }

    const contentType = request.headers.get("content-type") || "";

    // Validate content-type
    if (!contentType.includes("application/x-www-form-urlencoded")) {
      return new Response("Unsupported content type", { status: 400 });
    }

    // Parse form data
    let bodyText = await request.text();
    const params = new URLSearchParams(bodyText);
    const payload = Object.fromEntries(params.entries());

    // Optional: Log to console
    console.log("Received PayPal payload:", payload);

    // 🔁 Forward to secondary worker (optional)
    try {
      await fetch("https://paypal-webhook.familyfishingfun2025.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("❌ Failed to forward to PayPal Worker:", err);
    }

    // Format Discord message
    const discordMessage = {
      content: `🤑 **New PayPal Purchase!**
**Name:** ${payload.first_name || 'N/A'} ${payload.last_name || ''}
**Email:** ${payload.payer_email || 'N/A'}
**Amount:** ${payload.mc_gross || '0.00'} ${payload.mc_currency || ''}
**Item:** ${payload.item_name || 'Content'}`,
    };

    // Send to Discord
    try {
      const discordResponse = await fetch(env.DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordMessage),
      });

      if (!discordResponse.ok) {
        console.error("❌ Discord webhook failed:", await discordResponse.text());
        return new Response("Discord error", { status: 500 });
      }
    } catch (err) {
      console.error("❌ Error sending to Discord:", err);
      return new Response("Failed to send to Discord", { status: 500 });
    }

    return new Response("✅ Notification sent", { status: 200 });
  },
};
