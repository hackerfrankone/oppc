export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/x-www-form-urlencoded")) {
      return new Response("Unsupported content type", { status: 400 });
    }

    const bodyText = await request.text();
    const params = new URLSearchParams(bodyText);
    const payload = Object.fromEntries(params.entries());

    console.log("Parsed PayPal payload:", JSON.stringify(payload, null, 2));

    // Parse and sanitize fields
    const firstName = (payload.first_name || "").trim();
    const lastName = (payload.last_name || "").trim();
    const email = (payload.payer_email || "").trim();
    const amount = (payload.mc_gross || "0.00").trim();
    const currency = (payload.mc_currency || "USD").trim();
    const item = (payload.item_name || "Unspecified Item").trim();
    const time = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    });

    // Combine name properly
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || "N/A";

    // Build the Discord message
    const discordMessage = {
      content: "📥 New PayPal purchase received!",
      embeds: [
        {
          title: "🛒 PayPal Purchase",
          color: 0x00ff99,
          fields: [
            {
              name: "👤 Name",
              value: fullName,
              inline: true,
            },
            {
              name: "📧 Email",
              value: email || "N/A",
              inline: true,
            },
            {
              name: "💵 Amount",
              value: `$${amount} ${currency}`,
              inline: true,
            },
            {
              name: "📦 Item",
              value: item,
              inline: false,
            },
            {
              name: "🕓 Time",
              value: time,
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

    // Send to Discord webhook
    const webhookURL = env.DISCORD_WEBHOOK;

    const discordResponse = await fetch(webhookURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordMessage),
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error("Failed to send to Discord:", errorText);
      return new Response("Failed to send to Discord", { status: 500 });
    }

    return new Response("✅ Discord notification sent successfully", { status: 200 });
  },
};
