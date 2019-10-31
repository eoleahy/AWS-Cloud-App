"use strict";

const express = require("express");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");


AWS.config.loadFromPath('./config.json');
//AWS.config.update({
//    endpoint: "http://localhost:8000"
//});

let s3 = new AWS.S3({
    apiVersion: "2006-03-01"
});


const app = express();
const port = 3000;

let publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));

app.get('/create', getBucket);
app.get('/create2', createDatabase);
app.get('/delete', deleteDatabase);
app.get('/', (req, res) => res.sendFile(publicPath + "/client.html"));


app.listen(port, () => console.log(`To view webpage visit ${port}`));

function createDatabase(req, res) {

    var dynamodb = new AWS.DynamoDB();

    var params = {
        TableName: "Movies",
        KeySchema: [{
                AttributeName: "year",
                KeyType: "HASH"
            },
            {
                AttributeName: "title",
                KeyType: "RANGE"
            },
        ],
        AttributeDefinitions: [{
                AttributeName: "year",
                AttributeType: "N"
            },
            {
                AttributeName: "title",
                AttributeType: "S"
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 10
        }
    };

    dynamodb.createTable(params, (err, data) => {
        if (err) console.log("Unable to create table.");

        else
            console.log("Table created!");

        res.send(data);
    });

}

async function deleteDatabase(req, res) {

    let dynamodb = new AWS.DynamoDB();

    let params = {
        TableName: "Movies"
    };

    dynamodb.deleteTable(params, (err, data) => {
        if (err) console.log("unable to delete");

        else
            console.log("Table deleted");

        res.send(data); 
    });
}

async function getBucket() {

    console.log("Fetching");

    let bucketParams = {
        Bucket: 'csu44000assignment2',
        Key: 'moviedata.json'

    };

    s3.getObject(bucketParams, (err, data) => {
        if (err) console.error(err);
        console.log(data.Body.toString());
    });
    
}



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