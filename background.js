browser.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "explain-text") {

    // --- Bullet point formatter ---
    function formatBullets(text) {
      return text
        // convert stars to dash bullets
        .replace(/[\n\r]*\s*\*\s*/g, "\n- ")
        // convert numbered bullets like "1." or "1)" to "- "
        .replace(/[\n\r]*\s*\d+[\.\)]\s*/g, "\n- ")
        .trim();
    }

    try {
      const apiKey = "<YOUR KEY>";
      const model = "<YOUR MODEL>";
      const url = `<YOUR API URL>`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Explain the following text in simple terms. Format your response strictly as bullet points starting with '- '.\n\nText to explain: ${msg.text}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "API request failed");
      }

      // Format Gemini response
      const text = data.candidates[0].content.parts[0].text;
      const formatted = formatBullets(text);

      return Promise.resolve({
        ok: true,
        explanation: formatted
      });

    } catch (err) {
      return Promise.resolve({
        ok: false,
        error: err.toString()
      });
    }
  }
});
