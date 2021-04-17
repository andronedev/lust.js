var axios = require("axios");
var qs = require("qs");
var HTMLParser = require("node-html-parser");
const BASE_URL = "https://net-lust.com/";

/** 
 * @module Lust 
*/
class Lust {
  cookies = [];

  constructor(mail, pass) {
    this.mail = mail;
    this.pass = pass;
  }
  /**
   * Login to lust account
   * @param {string} email - The mail of the account
   * @param {string} password - The password of the account
   * @return {promise}
   */
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
  /**
   * Retrieve information from a profile
   * @summary get the profil of a user or the logged user
   * @param {string} username - default : current logged user
   * @return {json}
   */
  getProfil(username = "") {
    return new Promise((resolve, reject) => {
      var config = {
        method: "get",
        url: BASE_URL + "profil" + "?pseudo=" + username,
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
            posts: root.querySelectorAll("#post_container").map((p) => {
              return {
                id: p
                  .querySelector(".post-container-together")
                  .getAttribute("id")
                  .replace("-numberPost", ""),
                username: p.querySelector(".post-user-span > a").text,
                profilLink:
                  BASE_URL +
                  p.querySelector(".post-user-span > a").getAttribute("href"),
                date: p.querySelector(".post-user-span-date").text,
                message: p.querySelector(".post-user-message-span").text,

                img: p.querySelector(".post-img-container > img")
                  ? p
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
  /**
   * Retrieve information from the home feed
   * @summary get the home feed (posts)
   * @return {json} Home feed
   */
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
                id: el
                  .querySelector(".post-container-together")
                  .getAttribute("id")
                  .replace("-numberPost", ""),
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

  /**
   * Retrieve comments from a post
   * @param {string} id - the post id
   * @return {json}
   */
  getComments(id) {
    return new Promise((resolve, reject) => {
      var config = {
        method: "get",
        url: BASE_URL + "comment.php?id=" + id,
        headers: {
          Cookie: Lust.cookies,
        },
      };

      axios(config)
        .then(function (response) {
          var root = HTMLParser.parse(response.data);

          resolve(
            root.querySelectorAll("#post_container").map((el) => {
              return {
                username: el.querySelector(".post-user-span > a").text,
                profilLink:
                  BASE_URL +
                  el.querySelector(".post-user-span > a").getAttribute("href"),
                date: el.querySelector(".post-user-span-date").text,
                message: el.querySelector(".post-user-message-span").text,
              };
            })
          );
        })
        .catch(function (error) {
          console.log(error);
          reject(error);
        });
    });
  }
};

module.exports = Lust;