var Lust = require("./index")

var app = new Lust("andronedev@gmail.com","JL4D6pn5c")

app.login().then(()=>{
 app.onMessage(msg=>{
     console.log(msg.message+" par "+msg.username)
     app.addComment(msg.id,"Salut "+msg.username+" !")
 })
 app.getProfil().then((profil)=> console.log("Connecté en tant que "+profil.username))

}).catch(console.log)
