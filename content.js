// Define a unique ID for the main wrapper to prevent duplicate injection
const WRAPPER_ID = "explain-ui-wrapper"; 

// -------------------------------
// Inject HTML UI
// -------------------------------

// ONLY inject if the wrapper does not already exist
if (!document.getElementById(WRAPPER_ID)) {
    const injectedHTML = `
      <div id="explain-btn">?</div>

      <div id="explain-popup">
        <div id="explain-popup-content"></div>
        <div id="scroll-up" class="scroll-btn">▲ Scroll Up</div>
        <div id="scroll-down" class="scroll-btn">▼ Scroll Down</div>
      </div>
    `;

    const wrapper = document.createElement("div");
    wrapper.id = WRAPPER_ID; // Assign the unique ID
    wrapper.innerHTML = injectedHTML;
    document.body.appendChild(wrapper);
}

// -------------------------------
// DOM references (Ensure these run after the injection block)
// -------------------------------

const btn = document.getElementById("explain-btn");
const popup = document.getElementById("explain-popup");
const popupContent = document.getElementById("explain-popup-content");

const scrollUp = document.getElementById("scroll-up");
const scrollDown = document.getElementById("scroll-down");

let currentSelection = "";

// -------------------------------
// Send text to background.js (Gemini API)
// -------------------------------

async function explainWithLLM(text) {
  // Use browser.runtime.sendMessage to communicate with background script
  const result = await browser.runtime.sendMessage({
    type: "explain-text",
    text: text
  });

  if (!result.ok) return "Error: " + result.error;

  return result.explanation;
}

// -------------------------------
// Detect highlighted text
// -------------------------------

document.addEventListener("mouseup", () => {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (!text) {
    btn.style.display = "none";
    // Do not hide the popup here if user is scrolling/clicking inside it
    if (!popup.contains(event.target)) {
        popup.style.display = "none";
    }
    return;
  }

  currentSelection = text;

  // Position the button near the selected text
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  btn.style.position = "absolute";
  btn.style.top = `${rect.bottom + window.scrollY + 5}px`;
  btn.style.left = `${rect.left + window.scrollX - 10}px`;
  btn.style.display = "flex";
});

// -------------------------------
// When clicking the button → fetch explanation
// -------------------------------

btn.addEventListener("click", async () => {
  btn.style.display = "none";

  // Display popup using 'flex' as defined in CSS
  popup.style.display = "flex"; 
  popupContent.innerText = "Thinking...";
  // Ensure the popup is fixed at the bottom right immediately
  // (though CSS handles the final position)
  
  const explanation = await explainWithLLM(currentSelection);
  popupContent.innerText = explanation;
  
  // Scroll to the top when new content is loaded
  popupContent.scrollTop = 0; 
});

// -------------------------------
// Manual scroll buttons
// -------------------------------

scrollUp.addEventListener("click", () => {
  // Scrolls up by 60 pixels smoothly
  popupContent.scrollBy({ top: -60, behavior: "smooth" }); 
});

scrollDown.addEventListener("click", () => {
  // Scrolls down by 60 pixels smoothly
  popupContent.scrollBy({ top: 60, behavior: "smooth" });
});

// -------------------------------
// Hide popup when clicking anywhere except button/popup
// -------------------------------

document.addEventListener("click", (e) => {
  // Check if click target is outside the popup AND outside the button
  if (!popup.contains(e.target) && e.target !== btn) {
    popup.style.display = "none";
  }
});
