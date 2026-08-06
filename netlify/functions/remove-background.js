export async function handler(event, context) {
  console.log("Function Started");

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      success: true,
      message: "API is working perfectly!"
    }),
  };
}
```[cite: 5]