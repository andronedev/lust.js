const Lust = require('./index');

var app = new Lust("andronedev@gmail.com","JL4D6pn5c")

app.login().then(()=>{
 app.getProfil("andronedev").then(console.log)
})
