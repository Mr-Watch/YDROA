// ==UserScript==
// @name         Category Parser
// @version      1.1
// @description  TEST
// @match        https://eshoparmy.gr/wp-admin/post-new.php?post_type=product*
// @match        https://eshoparmy.gr/wp-admin/post.php?post=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eshoparmy.gr
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @noframes

// ==/UserScript==

(function () {
  "use strict";
  let currentCategoriesString = setupVariableInLS(
    "currentCategoriesString",
    "Uncategorized"
  );
  let oldCategoriesString = "";
  let currentCategories = currentCategoriesString.split("\n");

  let copyClipboard = GM_registerMenuCommand(
    "Ανάγνωση περιεχομένου πρόχειρου",
    async function (MouseEvent) {
      performAction(true);
    },
    {
      autoClose: true,
    }
  );

  let showClipboardContents = GM_registerMenuCommand(
    "Παρουσίαση περιεχομένου πρόχειρου",
    async function (MouseEvent) {
      alert(currentCategoriesString);
    },
    {
      autoClose: true,
    }
  );

  function findLabelElement(labelString) {
    let xpath = `//label[text()=' ${labelString}']`;
    let matchingElement = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    return matchingElement;
  }

  async function getCategoriesStringFromClipboard() {
    let categoriesStringFromClipboard = await navigator.clipboard.readText();
    return categoriesStringFromClipboard;
  }

  async function performAction(selectorFlag = false) {
    try {
      let categories = [];
      if (selectorFlag) {
        oldCategoriesString = currentCategoriesString;
        currentCategoriesString = await getCategoriesStringFromClipboard();
        writeVariableInLS("currentCategoriesString", currentCategoriesString);
        currentCategoriesString = currentCategoriesString.replace(/\r/g, "");
        categories = currentCategoriesString.split("\n");
      } else {
        categories = currentCategories;
      }

      categories.forEach((category) => {
        let element = findLabelElement(category);
        element.click();
      });
      currentCategories = categories;
    } catch (error) {
      if (error instanceof DOMException) {
        alert(
          "Πρέπει πρώτα να αλληλεπιδράσεις με την σελίδα (πχ κάνοντας κλικ κάπου)"
        );
      } else if (error instanceof TypeError) {
        writeVariableInLS("currentCategoriesString", oldCategoriesString);
        currentCategoriesString = oldCategoriesString;
        alert("Πρέπει η αντιγραφή να αντιστοιχεί σε υπάρχουσες κατηγορίες");
      }
    }
  }

  function writeVariableInLS(variableName, originalVariable) {
    window.localStorage.setItem(variableName, JSON.stringify(originalVariable));
  }

  function setupVariableInLS(variableName, variableValue) {
    if (!window.localStorage.getItem(variableName)) {
      window.localStorage.setItem(variableName, JSON.stringify(variableValue));
      return variableValue;
    } else {
      return JSON.parse(window.localStorage.getItem(variableName));
    }
  }

  window.addEventListener("keydown", (e) => {
    if (e.keyCode === unsafeWindow.categoryParser.basicActionKeyCode) {
      performAction();
    } else if (
      e.keyCode ===
      unsafeWindow.categoryParser.copyCategoriesFromClipboardKeyCode
    ) {
      performAction(true);
    }
  });

  unsafeWindow.categoryParser = unsafeWindow.categoryParser || {};
  unsafeWindow.categoryParser.basicAction = performAction;
})();
