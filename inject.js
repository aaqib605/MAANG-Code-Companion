(function () {
  function extractVariables(data) {
    const extractedData = {
      id: data.data.id,
      hints: data.data.hints,
      editorialCode: data.data.editorial_code.map((codeObj) => codeObj.code),
    };

    return extractedData;
  }

  // Listen for API calls using fetch
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    if (args[0].includes("https://api2.maang.in/problems/user/")) {
      const data = await response.clone().json();
      const extractedData = extractVariables(data);

      window.postMessage({ type: "EXTRACTED_DATA", data: extractedData }, "*");
    }

    return response;
  };

  // Listen for API calls using XMLHttpRequest (XHR)
  const originalXhrOpen = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.addEventListener("load", function () {
      if (url.includes("https://api2.maang.in/problems/user/")) {
        const data = JSON.parse(this.responseText);
        const extractedData = extractVariables(data);

        window.postMessage(
          { type: "EXTRACTED_DATA", data: extractedData },
          "*"
        );
      }
    });

    originalXhrOpen.apply(this, [method, url, ...rest]);
  };
})();
