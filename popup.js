document.getElementById("explainBtn").addEventListener("click", async () => {
  const loading = document.getElementById("loading");
  const responseBox = document.getElementById("response");
  responseBox.textContent = "";
  loading.classList.remove("hidden");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => {
        const el = document.getElementsByClassName("text-title-large")[0];
        return el ? el.innerText : null;
      },
    },
    async (injectionResults) => {
      const text = injectionResults[0]?.result;
      if(localStorage.getItem(text)){
        loading.classList.add("hidden");
        responseBox.textContent = localStorage.getItem(text);
        return;
      }
      if (!text) {
        loading.classList.add("hidden");
        responseBox.textContent = "Text not found on this page.";
        return;
      }

      const prompt = `Explain: Leetcode ${text} in simple words and keep it short.`;
      const apiKey = CONFIG.KEY;

      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "rekaai/reka-flash-3:free",
            messages: [{ role: "user", content: prompt }],
          }),
        });

        const data = await res.json();
        loading.classList.add("hidden");

        if (data.choices && data.choices.length > 0) {
          const explanation = data.choices[0].message.content;
          responseBox.textContent = explanation;

          // ✅ Do this in popup context (this part runs in popup script)
          if(localStorage.length === 5)
          {
            localStorage.removeItem(localStorage.key(localStorage.length - 1))
          }
          localStorage.setItem(text, explanation);
          console.log("Stored in localStorage:", explanation);
        } else {
          responseBox.textContent = "Failed to get explanation.";
        }
      } catch (err) {
        loading.classList.add("hidden");
        responseBox.textContent = "Error fetching explanation.";
        console.error(err);
      }
    }
  );
});
