(async function () {
  function getInput(selector, multi) {
    const findWith = ["data-q", "name", "id", "class"]
      .map((key) => `input[${key} *= "${selector}"]`)
      .join(",");
    let input = document.querySelectorAll(findWith);

    if (!input.length) {
      let labels = document.querySelectorAll("label");
      input = Array.from(labels)
        .filter((x) =>
          x.innerText.toLowerCase().includes(selector.toLowerCase())
        )
        .flatMap((x) => [
          ...(x
            .closest(".form-field-container")
            ?.querySelectorAll("input, canvas") || []),
        ]);
    }

    return multi ? [...input] : input[0];
  }

  function appendImage(src, parent) {
    if (src) {
      let imgElement = document.createElement("img");
      imgElement.src = src;
      imgElement.style.width = "100%";
      imgElement.style.height = "150px";
      parent?.appendChild(imgElement);
    }
  }

  async function fetchDataAndAutofillForm(contactId) {
    const url = `https://script.google.com/macros/s/AKfycbzEt3L-ts-RG8FSXEhOZtXcchHih90HUGbGmfYuDYeYueqRa9EbzKvTJeIRwYGU1cUE/exec?contact_id=${contactId}`;
    try {
      const response = await fetch(url);
      if (!response?.ok) {
        throw new Error(`HTTP error! Status: ${response?.status}`);
      }
      let { data } = await response.json();
      try {
        data = JSON.parse(data[2]);
      } catch (error) {
        data = JSON.parse(data[1]);
      } finally {
        return data;
      }
    } catch (err) {
      console.error(err);
    }
  }

  function autofillForm(response = {}) {
    for (const fieldName in response) {
      if (response.hasOwnProperty(fieldName)) {
        const fieldValue = response[fieldName];
        const formField = getInput(fieldName);

        if (formField && formField.type) {
          formField.value = fieldValue;
          formField.dispatchEvent(new Event("input"));
        } else if (
          formField &&
          formField.classList.contains("signature-button")
        ) {
          appendImage(
            response[fieldName].url || "",
            formField.closest(".form-field-container")
          );
        }
      }
    }
  }

  const contactId = "fGkO5vzTTJEmsvf1fF6m";

  console.log("Fetching data and autofilling form for contact ID:", contactId);

  try {
    let response = await fetchDataAndAutofillForm(contactId);
    console.log({ response });
    autofillForm(response);
  } catch (error) {
    console.error("Inavlid Response From Sheet", err);
  }
})();
