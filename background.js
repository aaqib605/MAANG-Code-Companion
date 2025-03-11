chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "aiHelpPort") {
    port.onMessage.addListener(async (request) => {
      if (request.action === "getAIResponse") {
        try {
          const aiResponse = await fetchAIResponse(request.message);
          port.postMessage({ response: aiResponse });
        } catch (error) {
          console.error("API call failed:", error);
          port.postMessage({
            response: "Failed to fetch AI response. Please try again.",
          });
        }
      }
    });
  }
});

async function fetchAIResponse(message) {
  const GEMINI_KEY = await new Promise((resolve, reject) => {
    chrome.storage.local.get(["gemini-api-key"], (result) => {
      if (result["gemini-api-key"]) {
        resolve(result["gemini-api-key"]);
      } else {
        reject("API key not found");
      }
    });
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();

  if (data) {
    return data.candidates[0].content.parts[0].text;
  } else {
    throw new Error("Unexpected response structure");
  }
}
