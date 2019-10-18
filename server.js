"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;
let publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));


app.get('/:location', sendWeather);
app.get('/', (req, res) => res.sendFile(publicPath + "/client.html"));
//app.get('/:location',  getWeather);


app.listen(port, () => console.log(`To view webpage visit localhost:${port}`));

function sendWeather(req, res) {
    let loc = req.params['location'];
    //console.log(loc);
    let reqStr = "";

    let p = fetch(reqStr)
    p.then(res => res.json())
        .then(data => {
            res.send({
                data
            });
        })
        .catch(err => {
            res.send("Error 400: Bad request");
        });
}