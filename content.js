const aiHelpImgURL = chrome.runtime.getURL("assets/ai-help-white.png");

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

  aiHelpButton.addEventListener("click", function () {
    console.log("Button clicked");
  });
}

function onProblemsPage() {
  return window.location.pathname.startsWith("/problems/");
}
