const express = require('express');
const bodyParser =  require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//faz um require no arquivo index da pasta controllers 
//que por sua vez lista todos os controllers de uma vez
require('../../App/controllers/')(app);


app.listen(5000, function () {
    console.log('Servidor escutando na porta 5000');
});
