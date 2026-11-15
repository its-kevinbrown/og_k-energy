export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { name, email, phone, service, message } = req.body || {};

    if (
      !name || !email || !phone ||
      !service || !message ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof service !== "string" ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        error: "Please provide all required fields."
      });
    }

    if (
      name.length > 100 ||
      email.length > 254 ||
      phone.length > 25 ||
      service.length > 100 ||
      message.length > 3000 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({
        error: "Invalid enquiry details."
      });
    }

    const response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "OG_K ENERGY <onboarding@resend.dev>",
          to: ["ogk.imperium@outlook.com"],
          reply_to: email,
          subject: `New Website Enquiry: ${service}`,
          text: `
NEW OG_K ENERGY WEBSITE ENQUIRY

Customer Name: ${name}
Email Address: ${email}
Phone Number: ${phone}
Service Required: ${service}

Project Description:
${message}
          `
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend error:", result);

      return res.status(500).json({
        error: "Email notification could not be sent."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email notification sent."
    });

  } catch (error) {
    console.error("Email function error:", error);

    return res.status(500).json({
      error: "An unexpected error occurred."
    });
  }
}
