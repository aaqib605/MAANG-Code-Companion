const aiHelpImgURL = chrome.runtime.getURL("assets/ai-help-white.png");

const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");
(document.head || document.documentElement).appendChild(script);
script.onload = function () {
  script.remove();
};

window.addEventListener("message", function (event) {
  if (event.source !== window) return;

  if (event.data.type && event.data.type === "EXTRACTED_DATA") {
    const extractedData = event.data.data;

    console.log(extractedData);
  }
});

addAIHelpButton();

const observer = new MutationObserver(() => {
  addAIHelpButton();
});

observer.observe(document.body, { childList: true, subtree: true });

function addAIHelpButton() {
  if (!onProblemsPage() || document.getElementById("ai-help-button")) return;

  const aiHelpButton = document.createElement("img");
  aiHelpButton.id = "ai-help-button";
  aiHelpButton.src = aiHelpImgURL;
  aiHelpButton.style.height = "40px";
  aiHelpButton.style.width = "40px";
  aiHelpButton.style.cursor = "pointer";

  const askDoubtButton = document.getElementsByClassName(
    "coding_ask_doubt_button__FjwXJ"
  )[0];
  askDoubtButton.parentNode.insertAdjacentElement("afterend", aiHelpButton);

  aiHelpButton.addEventListener("click", openAIChatBox);
}

function onProblemsPage() {
  return window.location.pathname.startsWith("/problems/");
}

function openAIChatBox() {
  if (document.getElementById("ai-chat-box")) return;

  const chatBox = document.createElement("div");
  chatBox.id = "ai-chat-box";
  chatBox.style.position = "fixed";
  chatBox.style.bottom = "20px";
  chatBox.style.right = "20px";
  chatBox.style.width = "400px";
  chatBox.style.height = "400px";
  chatBox.style.backgroundColor = "#1e2736";
  chatBox.style.border = "1px solid #ccc";
  chatBox.style.borderRadius = "10px";
  chatBox.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";
  chatBox.style.zIndex = "1000";
  chatBox.style.display = "flex";
  chatBox.style.flexDirection = "column";

  let chatHeaderColor = "#2b384e";
  let sendButtonColor = "#2b384e";
  let textColor = "white";
  let userMessageColor = "#d8d8d8";
  let aiMessageColor = "#fff";
  let inputBoxColor = "#2b384e";
  let chatBoxBackgroundColor = "#1e2736";

  chatBox.innerHTML = `
        <style>
            /* Custom scrollbar styles */
            #chat-body::-webkit-scrollbar {
                width: 8px;
            }
            #chat-body::-webkit-scrollbar-thumb {
                background-color: ${textColor};
                border-radius: 10px;
            }
            #chat-body::-webkit-scrollbar-track {
                background: ${chatBoxBackgroundColor};
            } 
        </style>

        <div class="chat-header" style="background-color:${chatHeaderColor}; color: ${textColor}; padding: 10px; border-top-left-radius: 10px; border-top-right-radius: 10px;">
            AI Help
            <button id="close-chat-box" style="float: right; background: none; border: none; color: ${textColor}; font-size: 20px; cursor: pointer;">&times;</button>
        </div>
        <div class="chat-body" id="chat-body" style="padding: 10px; flex-grow: 1; overflow-y: auto;"></div>
        <div class="chat-input-container" style="display: flex; padding: 10px; gap: 10px; box-shadow: 0 -1px 5px rgba(0,0,0,0.1);">
            <input type="text" id="chat-input" placeholder="Type your question..." style="flex-grow: 1; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background-color:${inputBoxColor}; color:${textColor};">
            <button id="send-button" style="padding: 10px; background-color:${sendButtonColor}; color: ${textColor}; border: none; border-radius: 5px; cursor: pointer;">Send</button>
        </div>
    `;

  document.body.appendChild(chatBox);

  document
    .getElementById("send-button")
    .addEventListener("click", () =>
      sendMessage(aiMessageColor, userMessageColor)
    );

  document
    .getElementById("close-chat-box")
    .addEventListener("click", closeAIChatBox);

  makeElementDraggable(chatBox);
}

async function sendMessage(aiMessageColor, userMessageColor) {
  const input = document.getElementById("chat-input").value;
  const chatBody = document.getElementById("chat-body");

  if (input.trim() === "") return;

  chatBody.innerHTML += `<div class="user-message" style="text-align: right; color: ${userMessageColor}; margin: 5px;">${input}</div>`;

  document.getElementById("chat-input").value = "";

  const combinedPrompt = `
            Respond briefly to the following:
            ${input}
        `;

  const response = await getAIResponse(combinedPrompt);

  const aiMessageDiv = document.createElement("div");
  aiMessageDiv.className = "ai-message";
  aiMessageDiv.style.textAlign = "left";
  aiMessageDiv.style.color = aiMessageColor;
  aiMessageDiv.style.margin = "5px";

  aiMessageDiv.innerHTML = response;

  chatBody.appendChild(aiMessageDiv);
}

function closeAIChatBox() {
  const chatBox = document.getElementById("ai-chat-box");
  if (chatBox) {
    chatBox.remove();
  }
}

function makeElementDraggable(element) {
  const header = element.querySelector(".chat-header");

  let offsetX = 0,
    offsetY = 0,
    initialX = 0,
    initialY = 0;

  header.style.cursor = "move";

  header.addEventListener("mousedown", startDrag);

  function startDrag(e) {
    e.preventDefault();

    initialX = e.clientX;
    initialY = e.clientY;

    document.addEventListener("mousemove", dragElement);
    document.addEventListener("mouseup", stopDrag);
  }

  function dragElement(e) {
    e.preventDefault();

    offsetX = e.clientX - initialX;
    offsetY = e.clientY - initialY;

    initialX = e.clientX;
    initialY = e.clientY;

    // Adjust the element's position
    element.style.top = element.offsetTop + offsetY + "px";
    element.style.left = element.offsetLeft + offsetX + "px";
  }

  function stopDrag() {
    document.removeEventListener("mousemove", dragElement);
    document.removeEventListener("mouseup", stopDrag);
  }

  element.style.resize = "both";
  element.style.overflow = "auto";
}

async function getAIResponse(input) {
  return new Promise((resolve, reject) => {
    const port = chrome.runtime.connect({ name: "aiHelpPort" });
    port.postMessage({ action: "getAIResponse", message: input });

    port.onMessage.addListener((response) => {
      if (response && response.response) {
        resolve(response.response);
      } else {
        reject("No valid response received from background script.");
      }

      port.disconnect();
    });

    port.onDisconnect.addListener(() => {
      if (chrome.runtime.lastError) {
        console.error("Runtime error:", chrome.runtime.lastError.message);
        reject("Failed to communicate with background script.");
      }
    });
  });
}
