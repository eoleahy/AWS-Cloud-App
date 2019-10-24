"use strict";

const express = require("express");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");


AWS.config.update({region:"eu-west-1"});

let s3 = new AWS.S3({apiVersion:"2006-03-01"});

const app = express();
const port = 3000;

let publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));


app.get('/:location', sendWeather);
app.get('/', (req, res) => res.sendFile(publicPath + "/client.html"));
//app.get('/:location',  getWeather);


app.listen(port, () => console.log(`To view webpage visit ${port}`));

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