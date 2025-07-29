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

    console.log("📦 Parsed PayPal payload:", JSON.stringify(payload, null, 2));

    // Extract values
    const firstName = (payload.first_name || "").trim();
    const lastName = (payload.last_name || "").trim();
    const email = (payload.payer_email || "").trim();
    const amount = (payload.mc_gross || "0.00").trim();
    const currency = (payload.mc_currency || "USD").trim();
    const time = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    });

    // Additional Debugging
    console.log(`First Name: ${firstName}`);
    console.log(`Last Name: ${lastName}`);
    console.log(`Email: ${email}`);
    console.log(`Amount: $${amount} ${currency}`);
    console.log(`Time: ${time}`);

    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || "N/A";

    // Discord Payload
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

    if (!env.DISCORD_WEBHOOK) {
      console.error("DISCORD_WEBHOOK is not defined in environment variables");
      return new Response("Server misconfiguration", { status: 500 });
    }

    console.log("🔁 Sending this payload to Discord:", JSON.stringify(discordMessage, null, 2));

    const discordResponse = await fetch(env.DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordMessage),
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error("❌ Discord Webhook Error:", discordResponse.status, errorText);
      return new Response("Failed to send to Discord", { status: 500 });
    }

    return new Response("✅ Discord notification sent successfully", { status: 200 });
  },
};
