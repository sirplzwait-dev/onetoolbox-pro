export async function handler(event) {

  // Sirf POST request allow
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {

    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
      return {
        statusCode: 500,
        body: "HF_TOKEN not found."
      };
    }

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/briaai/RMBG-1.4",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": event.headers["content-type"] || "application/octet-stream"
        },
        body: Buffer.from(event.body, "base64")
      }
    );

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: await response.text()
      };
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png"
      },
      isBase64Encoded: true,
      body: imageBuffer.toString("base64")
    };

  } catch (err) {

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message
      })
    };

  }

}