const inputField = document.querySelector(".key-handler input");
const saveButton = document.querySelector(".key-handler button");
const messageContainer = document.querySelector(".success-message");

saveButton.addEventListener("click", () => {
  const apiKey = inputField.value.trim();

  messageContainer.style.display = "block";

  if (apiKey) {
    chrome.storage.local.set({ "gemini-api-key": apiKey }, () => {
      messageContainer.textContent =
        "API Key saved successfully. You can now start using the extension.";

      inputField.value = "";
    });
  } else {
    messageContainer.textContent = "Please enter an API Key to save it.";

    messageContainer.style.color = "#ff0000";
  }
});
