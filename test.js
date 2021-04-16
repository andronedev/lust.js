const Lust = require('./app');

var app = new Lust("andronedev@gmail.com","JL4D6pn5c")

app.login().then(()=>{
    app.getHome().then(console.log)
})
