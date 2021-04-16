var axios = require("axios");
var qs = require("qs");
var HTMLParser = require("node-html-parser");

const BASE_URL = "https://net-lust.com/";
const Lust = class {
  cookies = [];

  constructor(mail, pass) {
    this.mail = mail;
    this.pass = pass;
  }
  login() {
    return new Promise((resolve, reject) => {
      var data = qs.stringify({
        mailconnect: this.mail,
        mdpconnect: this.pass,
        formconnexion: "Se connecter",
      });
      var config = {
        method: "post",
        url: BASE_URL + "login",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };

      axios(config)
        .then(function (response) {
          Lust.cookies = response.headers["set-cookie"];
          resolve();
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }
  getProfil() {
    return new Promise((resolve, reject) => {
      var config = {
        method: "get",
        url: BASE_URL + "profil",
        headers: {
          Cookie: Lust.cookies,
        },
      };

      axios(config)
        .then(function (response) {
          var root = HTMLParser.parse(response.data);

          resolve({
            username: root.querySelector("div.bio > div > div > span.pseudo")
              .text,
            imgProfil:
              BASE_URL +
              root.querySelector("div.bio > div > img").getAttribute("src"),
            followersCount: root
              .querySelector("#follower")
              .text.replace(" Abonnés", ""),
            memberSince: root
              .querySelector("div.bio > div > div > span.sign-up-date > span")
              .text.replace("│\r\n                                    ", ""),
          });
        })
        .catch(function (error) {
          console.log(error);
          reject(error);
        });
    });
  }
  getHome() {
    return new Promise((resolve, reject) => {
      var config = {
        method: "get",
        url: BASE_URL + "home",
        headers: {
          Cookie: Lust.cookies,
        },
      };

      axios(config)
        .then(function (response) {
          var root = HTMLParser.parse(response.data);

          resolve({
            postsFollow: root.querySelectorAll("#post_container").map((el) => {
              return {
                username: el.querySelector(".post-user-span > a").text,
                profilLink:
                  BASE_URL +
                  el.querySelector(".post-user-span > a").getAttribute("href"),
                date: el.querySelector(".post-user-span-date").text,
                message: el.querySelector(".post-user-message-span").text,

                img: el.querySelector(".post-img-container > img")
                  ? el
                      .querySelector(".post-img-container > img")
                      .getAttribute("src")
                  : null,
              };
            }),
          });
        })
        .catch(function (error) {
          console.log(error);
          reject(error);
        });
    });
  }
};

module.exports = Lust;
