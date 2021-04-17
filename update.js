const axios = require("axios")

// Update Checker
axios.get("https://registry.npmjs.org/lust.js").then((rep) => {
  var currentVersion = require("./package.json").version;
  var latestVersion = rep.data["dist-tags"].latest;
  if (latestVersion != currentVersion) {
    console.warn(
      "\x1b[31m",
      `Une nouvelle version de lust.js est disponible !\n - Version actuelle : ${currentVersion}\n - Dernière version :${latestVersion}\n - => npm i lust.js`,
      "\x1b[0m"
    );
  }
});