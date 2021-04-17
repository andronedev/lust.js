require("./update");
var axios = require("axios");
var qs = require("qs");
var HTMLParser = require("node-html-parser");

const BASE_URL = "https://net-lust.com/";

/**
 * @module Lust
 */
class Lust {
  constructor(mail, pass) {
    this.mail = mail;
    this.pass = pass;
    Lust.cookies = [];
  }

  /**
   * Connexion au compte Lust
   * @param {string} email - Le mail du compte
   * @param {string} password - Le mot de passe du compte
   * @return {promise}
   * @example
   * var app = new Lust("xxx@xxxx.xx","xxx")
   * app.login().then(()=>{
   *  app.getHome().then(posts=>console.log(posts.postsFollow))
   * })
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
          reject(error.code);
        });
    });
  }
  /**
   * Récupérer des informations d'un profil
   * (pas besoin d'être connecté)
   * @summary obtenir le profil d'un utilisateur ou de l'utilisateur connecté
   * @param {string} [username="nom d'utilisateur si connecté"]
   * @return {json}
   * @example
   * app.getProfil("andronedev").then(console.log)
   * // return :
   *   {
   *     username: 'andronedev',
   *     imgProfil: 'https://net-lust.com/assets/users/profils/1115514632.gif',
   *     followersCount: '1',
   *     memberSince: '20 Feb 2021',
   *     posts: [
   *       {
   *         id: '341',
   *         username: 'andronedev',
   *         profilLink: 'https://net-lust.com/profil?pseudo=andronedev',
   *         date: 'il y a 11 jours',
   *         message: 'Salut',
   *         img: null
   *       },
   *      [...]
   *     ]
   *   }
   */
  getProfil(username = "") {
    return new Promise((resolve, reject) => {
      if (!username && !Lust.cookie)
        reject("Merci de vous connecter ou de specifier un utilisateur");

      var config = {
        method: "get",
        url: BASE_URL + "profil" + "?pseudo=" + username,
        headers: {
          Cookie: Lust.cookies,
        },
      };

      axios(config)
        .then(function (response) {
          if (
            response.data == "L'utilisateur que vous cherchez est introuvable."
          ) {
            reject("Utilisateur introuvable.");
          }
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
          reject(error.code);
        });
    });
  }
  /**
   * Récupérer des informations à partir de la page home.
   * @summary obtenir le flux d'accueil (posts)
   * @return {json} flux d'accueil (posts)
   * @example
   * app.getHome().then(posts=>console.log(posts))
   * // return :
   *  {
   *    postsFollow: [
   *      {
   *        id: '444',
   *        username: 'Zartov',
   *        profilLink: 'https://net-lust.com/profil?pseudo=Zartov',
   *        date: 'il y a 4 jours',
   *        message: 'pas mal #FlightSimulator 😅',
   *        img: 'https://i.imgur.com/tMT4Blv.jpg'
   *      },
   *     [...]
   *  {
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
          reject(error.code);
        });
    });
  }

  /**
   * Récupérer les commentaires d'un post
   * @param {string} id - l'id du poste
   * @return {json}
   * @example
   * app.getComments("444").then(console.log)
   * // return :
   * [
   *  {
   *    username: 'andronedev',
   *    profilLink: 'https://net-lust.com/profil?pseudo=Zartov',
   *    date: 'il y a 21 jours',
   *    message: 'Salut !'
   *  },
   * [...]
   * ]
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
          reject(error.code);
        });
    });
  }

  /**
   * Récupérer le resultat d'une recherche
   * @param {string} query - champ de recherche
   * @return {json}
   * @example
   * app.search("zar").then(console.log)
   * // return :
   *   [
   *     { type: 'hashtag', hashtag: '#ZartovElypse' },
   *     {
   *       type: 'account',
   *       username: 'Zartov',
   *       profilLink: 'profil?pseudo=Zartov',
   *       imgProfil: 'assets/users/profils/1115514560.jpg'
   *     },
   *    [...]
   *   ]
   */
  search(query) {
    return new Promise((resolve, reject) => {
      var data = "query="+query;

      var config = {
        method: "post",
        url: BASE_URL + "inserts/insert.search.php",
        headers: {
          Cookie: Lust.cookies,
        },
        data: data,
      };

      axios(config)
        .then(function (response) {
          var root = HTMLParser.parse(response.data);
          var listes = root.querySelectorAll("#list-search");
          resolve(
            listes.map(el => {
              let type = !el.querySelector(".result-content-search")
                ? "account"
                : "hashtag";
              if (type == "hashtag") {
                return {
                  type: type,
                  hashtag : el.querySelector(".result-content-search").text
                };
              }else{
                return {
                  type: type,
                  username: el.querySelector("a").text,
                  profilLink: el.querySelector("a").getAttribute("href"),
                  imgProfil: el.querySelector("img").getAttribute("src"),
                }
              }
            })
          );
        })
        .catch(function (error) {
          reject(error.code);
        });
    });
  }
}

module.exports = Lust;
