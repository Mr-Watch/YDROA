// ==UserScript==
// @name         Category Parser
// @version      1.4
// @description  Automatically selects categories from a user defined list
// @author       Mr-Watch
// @match        https://eshoparmy.gr/wp-admin/post.php?post=*
// @match        https://eshoparmy.gr/wp-admin/post-new.php?post_type=product*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eshoparmy.gr
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @grant        GM_notification
// @noframes
// @downloadURL  https://github.com/Mr-Watch/YDROA/raw/refs/heads/main/Category%20Parser.user.js
// @updateURL    https://github.com/Mr-Watch/YDROA/raw/refs/heads/main/Category%20Parser.user.js

// ==/UserScript==

(function () {
  "use strict";

  let currentCategoriesString = setupVariableInLS(
    "currentCategoriesString",
    "Uncategorized"
  );
  let oldCategoriesString = "";
  let currentCategoriesArray = currentCategoriesString.split("\n");

  let getCategoriesFromSelections = GM_registerMenuCommand(
    "Ανάγνωση επιλεγμένων κατηγοριών",
    async function (MouseEvent) {
      getCategoriesFromSelected();
    },
    {
      autoClose: true,
    }
  );

  let showClipboardContents = GM_registerMenuCommand(
    "Παρουσίαση περιεχομένου πρόχειρου",
    function (MouseEvent) {
      alert(currentCategoriesString);
    },
    {
      autoClose: true,
    }
  );

  async function performAction(attemptToReadClipboard = false) {
    try {
      let categoriesArray = [];
      oldCategoriesString = currentCategoriesString;
      if (attemptToReadClipboard) {
        currentCategoriesString = await getClipboardContents();
        currentCategoriesString = currentCategoriesString.replace(/\r/g, "");
        writeVariableInLS("currentCategoriesString", currentCategoriesString);
        categoriesArray = currentCategoriesString.split("\n");
      } else {
        categoriesArray = currentCategoriesArray;
      }
      clearAllSelectedCategories();
      exploreCategoriesTree(categoriesArray, 0, document, true);
      exploreCategoriesTree(categoriesArray, 0, document, false);
      currentCategoriesArray = categoriesArray;
    } catch (error) {
      writeVariableInLS("currentCategoriesString", oldCategoriesString);
      currentCategoriesString = oldCategoriesString;
      currentCategoriesArray = oldCategoriesString.split("\n");
      alert(
        "Προέκυψε σφάλμα με την ανάγνωση των κατηγοριών\nΒεβαιωθείτε ότι η αντιγραφή των κατηγοριών είναι σωστή\nΧρήση των προηγούμενων αποθηκευμένων κατηγοριών"
      );
    }
  }

  function clearAllSelectedCategories() {
    document
      .querySelector("#product_catchecklist")
      .querySelectorAll("label")
      .forEach((label) => {
        if (label.firstChild.checked) {
          label.firstChild.checked = false;
        }
      });
  }

  function getCategoriesFromSelected() {
    let stringFromCheckboxes = "";
    document
      .querySelector("#product_catchecklist")
      .querySelectorAll("label")
      .forEach((label) => {
        if (label.firstChild.checked) {
          stringFromCheckboxes += label.innerText.trimStart() + "\n";
        }
      });
    if (stringFromCheckboxes !== "") {
      GM_notification({
        text: "Χρήση των τρέχουσα επιλεγμένων κατηγοριών",
        title: "Επιλογή κατηγοριών",
        timeout: 5000,
      });
      writeVariableInLS("currentCategoriesString", stringFromCheckboxes);
      currentCategoriesArray = stringFromCheckboxes.split("\n");
      currentCategoriesArray.pop();
    } else {
      GM_notification({
        text: "Δεν υπάρχουν επιλεγμένες κατηγορίες",
        title: "Επιλογή κατηγοριών",
        timeout: 5000,
      });
    }
  }

  function exploreCategoriesTree(
    categoriesArray,
    index,
    searchElement,
    look = false
  ) {
    let element = null;
    if (index === 0) {
      element = findLabelElement(categoriesArray[index], document);
    } else {
      element = findLabelElement(categoriesArray[index], searchElement);
    }
    if (!look) {
      element.click();
    }
    index++;
    if (element.nextElementSibling === null && index === categoriesArray.length)
      return;
    exploreCategoriesTree(
      categoriesArray,
      index,
      element.nextElementSibling,
      look
    );
  }

  async function getClipboardContents() {
    let clipboardContents = await navigator.clipboard.readText();
    return clipboardContents;
  }

  function findLabelElement(labelString, evaluationNode) {
    let xpath = `.//label[text()=' ${labelString}']`;
    let matchingElement = document.evaluate(
      xpath,
      evaluationNode,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    return matchingElement;
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
