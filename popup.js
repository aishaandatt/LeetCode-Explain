document.getElementById("explainBtn").addEventListener("click", async () => {
    const loading = document.getElementById("loading");
    const responseBox = document.getElementById("response");
    responseBox.textContent = "";
    loading.classList.remove("hidden");
  
    // Get tab content
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const el = document.getElementsByClassName("text-title-large")[0];
        return el ? el.innerText : null;
      }
    }, async (injectionResults) => {
      const text = injectionResults[0].result;
  
      if (!text) {
        loading.classList.add("hidden");
        responseBox.textContent = "Text not found on this page.";
        return;
      }
  
      const prompt = `Explain: ${text} in simple words and keep it short.`;
      const apiKey = CONFIG.KEY;
  
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "rekaai/reka-flash-3:free",
          messages: [{ role: "user", content: prompt }]
        })
      });
  
      const data = await res.json();
      loading.classList.add("hidden");
  
      if (data.choices && data.choices.length > 0) {
        responseBox.textContent = data.choices[0].message.content;
      } else {
        responseBox.textContent = "Failed to get explanation.";
      }
    });
  });
  