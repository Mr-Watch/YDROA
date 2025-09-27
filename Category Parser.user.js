// ==UserScript==
// @name         Category Parser
// @version      1.3
// @description  TEST
// @author       Mr-Watch
// @match        https://eshoparmy.gr/wp-admin/post-new.php?post_type=product*
// @match        https://eshoparmy.gr/wp-admin/post.php?post=*
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
    function (MouseEvent) {
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

  async function getClipboardContents() {
    let clipboardContents = await navigator.clipboard.readText();
    return clipboardContents;
  }

  async function performAction(attemptToReadClipboard = false) {
    try {
      let categoriesArray = [];

      if (attemptToReadClipboard) {
        oldCategoriesString = currentCategoriesString;
        currentCategoriesString = await getClipboardContents();
        currentCategoriesString = currentCategoriesString.replace(/\r/g, "");
        writeVariableInLS("currentCategoriesString", currentCategoriesString);
        categoriesArray = currentCategoriesString.split("\n");
      } else {
        categoriesArray = currentCategoriesArray;
      }
      categoriesArray.forEach((category) => {
        let element = findLabelElement(category);
        element.click();
      });
      currentCategoriesArray = categoriesArray;
    } catch (error) {
      if (error instanceof DOMException) {
        alert(
          "Πρέπει πρώτα να αλληλεπιδράσεις με την σελίδα (πχ κάνοντας κλικ κάπου)"
        );
      } else if (error instanceof TypeError) {
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
            text: "Τα περιεχόμενα του πρόχειρου δεν είναι σωστά\nΧρήση των τρέχουσα επιλεγμένων κατηγοριών",
            title: "Επιλογή κατηγοριών",
            timeout: 5000,
          });
          writeVariableInLS("currentCategoriesString", stringFromCheckboxes);
          currentCategoriesArray = stringFromCheckboxes.split("\n");
          currentCategoriesArray.pop();
        } else {
          writeVariableInLS("currentCategoriesString", oldCategoriesString);
          currentCategoriesString = oldCategoriesString;
          alert("Πρέπει η αντιγραφή να αντιστοιχεί σε υπάρχουσες κατηγορίες");
        }
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
