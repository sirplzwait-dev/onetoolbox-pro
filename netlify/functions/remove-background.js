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
    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) {
      throw new Error("Hugging Face API key is not configured.");
    }

    const data = JSON.parse(event.body);
    const base64Image = data.image;

    if (!base64Image) {
      throw new Error("No image data provided.");
    }

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');

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

    // Binary image ko Text (Base64) me convert kar rahe hain taaki corrupt na ho
    const resultBuffer = await response.arrayBuffer();
    const outputBase64 = Buffer.from(resultBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: true,
        image: `data:image/png;base64,${outputBase64}`
      })
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