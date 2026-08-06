
export async function handler(event) {
  console.log("Function Started");

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: false,
        error: "Method Not Allowed"
      })
    };
  }

  try {
    const apiKey = process.env.HF_API_KEY;

    if (!apiKey) {
      throw new Error("HF_API_KEY is missing in Netlify Environment Variables.");
    }

    const data = JSON.parse(event.body);

    if (!data.image) {
      throw new Error("No image received.");
    }

    const base64 = data.image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64, "base64");

    console.log("Sending image to Hugging Face...");

    const response = await fetch(
      "https://api-inference.huggingface.co/models/briaai/RMBG-1.4",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/octet-stream"
        },
        body: imageBuffer
      }
    );

    console.log("HF Status:", response.status);
    console.log("HF Status Text:", response.statusText);
    console.log("HF Content-Type:", response.headers.get("content-type"));

    if (!response.ok) {
      const errorText = await response.text();

      console.error("HF ERROR:", errorText);

      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          success: false,
          status: response.status,
          error: errorText
        })
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const outputBase64 = Buffer.from(arrayBuffer).toString("base64");

    console.log("Output Size:", outputBase64.length);

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

  } catch (err) {
    console.error("SERVER ERROR:", err);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: false,
        error: err.message
      })
    };
  }
}