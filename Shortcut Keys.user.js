// ==UserScript==
// @name         Shortcut Keys
// @version      1.1
// @description  Handles the shortcuts between the two userscripts
// @author       Mr-Watch
// @match        https://eshoparmy.gr/wp-admin/post.php?post=*
// @match        https://eshoparmy.gr/wp-admin/post-new.php?post_type=product*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eshoparmy.gr
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// @noframes
// @downloadURL  https://github.com/Mr-Watch/YDROA/raw/refs/heads/main/Shortcut%20Keys.user.js
// @updateURL    https://github.com/Mr-Watch/YDROA/raw/refs/heads/main/Shortcut%20Keys.user.js

// ==/UserScript==

(function () {
  "use strict";
  let keyCode = 0;

  let menuCommand = GM_registerMenuCommand(
    "Ανάγνωση πλήκτρου",
    function () {
      alert("Θα έχετε 3 δευτερόλεπτα να πατήσετε ένα πλήκτρο");
      window.addEventListener("keydown", readKey);
      setTimeout(() => {
        alert(
          `Το πιθανό πλήκτρο είναι το: ${String.fromCharCode(
            keyCode
          )}\nΚωδικός πλήκτρου: ${keyCode}`
        );
        window.removeEventListener("keydown", readKey);
      }, 3000);
    },
    {
      autoClose: true,
    }
  );

  function readKey(e) {
    keyCode = e.keyCode;
  }

  unsafeWindow.automateProductEntry = unsafeWindow.automateProductEntry || {};
  unsafeWindow.categoryParser = unsafeWindow.categoryParser || {};

  unsafeWindow.automateProductEntry.basicActionKeyCode = 90; //z
  unsafeWindow.categoryParser.copyCategoriesFromClipboardKeyCode = 192; // `
  unsafeWindow.categoryParser.basicActionKeyCode = 17; // ctrl
})();
