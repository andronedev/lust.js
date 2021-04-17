const Lust = require('.');

var app = new Lust("xxx@xxxx.xx","xxx")

app.login().then(()=>{
 app.getProfil("andronedev").then(console.log)
})
