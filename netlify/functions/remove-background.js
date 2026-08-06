import fetch from 'node-fetch';

export async function handler(event, context) {
  console.log("Function Started");

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const apiKey = process.env.HF_API_KEY; // Ensure your environment variable name matches this
    if (!apiKey) {
      throw new Error("Hugging Face API key is not configured in environment variables.");
    }

    // Get the image buffer from the incoming request body
    const imageBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');

    // Call Hugging Face Background Removal Model (e.g., RMBG-1.4 or similar)
    const response = await fetch(
      "https://api-inference.huggingface.co/models/briaai/RMBG-1.4",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/octet-stream"
        },
        body: imageBuffer
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${errorText}`);
    }

    const resultBuffer = await response.arrayBuffer();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png"
      },
      body: Buffer.from(resultBuffer).toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
}