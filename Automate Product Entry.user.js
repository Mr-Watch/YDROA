// ==UserScript==
// @name         Automate Product Entry
// @version      1.1
// @description  TEST
// @author       Mr-Watch
// @match        https://eshoparmy.gr/wp-admin/post-new.php?post_type=product*
// @match        https://eshoparmy.gr/wp-admin/post.php?post=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eshoparmy.gr
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @noframes
// @downloadURL  https://github.com/Mr-Watch/YDROA/raw/refs/heads/main/Automate%20Product%20Entry.user.js
// @updateURL    https://github.com/Mr-Watch/YDROA/raw/refs/heads/main/Automate%20Product%20Entry.user.js
// ==/UserScript==

(function () {
  "use strict";
  let variableValues = {
    shippingCost: setupVariableInLS("shippingCost", "5"),
    discountPercentage: setupVariableInLS("discountPercentage", "0.50"),
    computeVATOnly: setupVariableInLS("computeVATOnly", "ΟΧΙ"),
    imageTitle: setupVariableInLS("imageTitle", ""),
    supplier: setupVariableInLS("supplier", ""),
    stockQuantity: setupVariableInLS("stockQuantity", "99"),
  };

  let menuCommands = {
    changeShippingCost: {
      title: "Αλλαγή πρόσθετου κόστους μεταφορικών: ",
      promptMessage: "Καινούρια τιμή πρόσθετου κόστους μεταφορικών",
      value: "shippingCost",
      newValue: null,
      menu: null,
    },
    changeDiscountPercentage: {
      title: "Αλλαγή ποσοστού έκπτωσης προμηθευτή: ",
      promptMessage: "Καινούρια τιμή ποσοστού έκπτωσης προμηθευτή",
      value: "discountPercentage",
      newValue: null,
      menu: null,
    },
    changeToVATOnly: {
      title: "Υπολογισμός μόνο του ΦΠΑ: ",
      value: "computeVATOnly",
      menu: null,
    },
    changeImage: {
      title: "Αλλαγή τίτλου εικόνας: ",
      promptMessage: "Καινούρια τιμή τίτλου εικόνας",
      value: "imageTitle",
      newValue: null,
      menu: null,
    },
    changeSupplier: {
      title: "Αλλαγή προμηθευτή: ",
      promptMessage: "Καινούρια τιμή προμηθευτή",
      value: "supplier",
      newValue: null,
      menu: null,
    },
    changeStockQuantity: {
      title: "Αλλαγή ποσότητας αποθήκης: ",
      promptMessage: "Καινούρια τιμή ποσότητας αποθήκης",
      value: "stockQuantity",
      newValue: null,
      menu: null,
    },
  };

  function registerMenuCommands() {
    Object.values(menuCommands).forEach((menuCommandEntry) => {
      if (
        menuCommandEntry.value === "computeVATOnly" ||
        (menuCommandEntry.value === "discountPercentage" &&
          variableValues.computeVATOnly === "ΝΑΙ")
      ) {
        return;
      }
      menuCommandEntry.menu = GM_registerMenuCommand(
        menuCommandEntry.title + variableValues[menuCommandEntry.value],
        function () {
          menuCommandEntry.newValue = prompt(
            menuCommandEntry.promptMessage,
            variableValues[menuCommandEntry.value]
          );
          variableValues[menuCommandEntry.value] = menuCommandEntry.newValue;
          writeVariableInLS(
            menuCommandEntry.value,
            variableValues[menuCommandEntry.value]
          );
          updateMenuCommands();
        },
        {
          autoClose: true,
        }
      );
    });

    menuCommands.changeToVATOnly.menu = GM_registerMenuCommand(
      menuCommands.changeToVATOnly.title + variableValues.computeVATOnly,
      function () {
        if (variableValues.computeVATOnly === "ΝΑΙ") {
          variableValues.computeVATOnly = "ΟΧΙ";
        } else {
          variableValues.computeVATOnly = "ΝΑΙ";
        }
        writeVariableInLS(
          menuCommands.changeToVATOnly.value,
          variableValues.computeVATOnly
        );
        updateMenuCommands();
      },
      {
        autoClose: true,
      }
    );
  }

  function updateMenuCommands() {
    Object.values(menuCommands).forEach((menuCommandEntry) => {
      GM_unregisterMenuCommand(menuCommandEntry.menu);
    });
    registerMenuCommands();
  }

  function performAction() {
    document.querySelector("#pros8eto_kostos_metaforikwn").value =
      variableValues.shippingCost;

    let manufacturer = document.querySelector("#new-tag-manufacturer");
    manufacturer.value = variableValues.supplier;
    manufacturer.nextElementSibling.click();
    manufacturer.value = null;
    manufacturer.blur();

    document.querySelector(".inventory_options").click();
    document.querySelector("#_manage_stock").click();
    document.querySelector("#_stock").value = variableValues.stockQuantity;

    if (variableValues.imageTitle != "" || variableValues.imageTitle != null) {
      document.querySelector("#set-post-thumbnail").click();
      waitForElm(".save-ready").then(() => {
        try {
          document
            .querySelector(`[aria-label="${variableValues.imageTitle}"]`)
            .click();
          setTimeout(() => {
            document.querySelector(".media-button").click();
          }, 500);
        } catch (error) {
          alert(
            "Η εικόνα δεν βρέθηκε\nΒεβαιωθείτε ότι η εικόνα υπάρχει και ο τίτλος είναι σωστός"
          );
        }
      });
    }

    document
      .querySelector("#show-settings-link")
      .scrollIntoView({ behavior: "smooth" });
    document
      .querySelector("#_regular_price")
      .addEventListener("input", updatePurchasePrice);
  }

  function updatePurchasePrice(e) {
    let newPurchasePrice = 0;
    if (variableValues.computeVATOnly === "ΝΑΙ") {
      newPurchasePrice = Math.round((e.target.value / 1.24) * 100) / 100;
    } else {
      newPurchasePrice =
        Math.round(
          (e.target.value -
            e.target.value * Number(variableValues.discountPercentage)) *
            100
        ) / 100;
    }
    document.querySelector("#timh_agoras").value = newPurchasePrice;
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

  function waitForElm(selector) {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          observer.disconnect();
          resolve(document.querySelector(selector));
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  registerMenuCommands();
  window.addEventListener("keydown", (e) => {
    if (e.keyCode === unsafeWindow.automateProductEntry.basicActionKeyCode) {
      performAction();
      unsafeWindow.categoryParser.basicAction();
    }
  });
})();
