export async function handler(event) {
  console.log("Function Started");

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      success: true,
      message: "Function OK"
    })
  };
}