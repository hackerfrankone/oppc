export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Only POST allowed", { status: 405 });
    }

    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("application/x-www-form-urlencoded")) {
      return new Response("Unsupported content type", { status: 400 });
    }

    // Parse the form data
    let bodyText = await request.text();
    const params = new URLSearchParams(bodyText);
    const payload = Object.fromEntries(params.entries());

    console.log("Received PayPal payload:", payload);

    // Format Discord embed message
    const discordMessage = {
      embeds: [
        {
          title: "🤑 New PayPal Purchase",
          color: 0x00ff99,
          fields: [
            {
              name: "👤 Name",
              value: `${payload.first_name || "N/A"} ${payload.last_name || ""}`,
              inline: true,
            },
            {
              name: "📧 Email",
              value: payload.payer_email || "N/A",
              inline: true,
            },
            {
              name: "💵 Amount",
              value: `${payload.mc_gross || "0.00"} ${payload.mc_currency || ""}`,
              inline: true,
            },
            {
              name: "📦 Item",
              value: payload.item_name || "N/A",
              inline: false,
            },
            {
              name: "🕓 Time",
              value: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
              inline: false,
            },
          ],
          footer: {
            text: "🛒 PayPal Notification Bot",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    // Send to Discord webhook URL stored in environment variable
    try {
      const discordResponse = await fetch(env.DISCORD_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
