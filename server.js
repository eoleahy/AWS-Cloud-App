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

app.get('/create', createDatabase);
app.get('/delete', deleteDatabase);
app.get('/query/:name/:year', queryDatabase);
app.get('/', (req, res) => res.sendFile(publicPath + "/client.html"));


app.listen(port, () => console.log(`To view webpage visit ${port}`));

function createDatabase(req, res) {

    let dynamodb = new AWS.DynamoDB();

    let params = {
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
        BillingMode: "PAY_PER_REQUEST"
    };

    let p = new Promise((resolve, reject) => {

        dynamodb.createTable(params, (err, data) => {
            if (err)
                reject(console.error("Failed to create table", err));

            else {
                console.log("Table created!");
                resolve(data);
            }
        });
    });

    p.then(() => {
        console.log("Fetching...");
        let bucketParams = {
            Bucket: 'csu44000assignment2',
            Key: 'moviedata.json'
        };

        s3.getObject(bucketParams, (err, data) => {
            if (err) {
                console.error(err);
                //res.send("Error 400: Bad Request");
            } else {
                let items = JSON.parse(data.Body.toString());
                console.log("Bucket fetched, uploading data");

                let docClient = new AWS.DynamoDB.DocumentClient();


                for (const item of items) {


                    let params = {
                        TableName: "Movies",
                        Item: {
                            "year": item["year"],
                            "title": item["title"],
                            "info": item["info"]
                        }

                    };

                    docClient.put(params, function (err, data) {
                        if (err) {

                            //res.send("Error 400: Bad Request");
                        } else {
                            //console.log("Added item:", JSON.stringify(data, null, 2));
                        }
                    });

                }

                console.log("Added everything")

            }
        });

    }).catch(function () {
        //res.send("Error 400: Bad Request");
    })



    res.send({});
}

function queryDatabase(req, res) {

    console.log("Query called");

    let docClient = new AWS.DynamoDB.DocumentClient();

    let name = req.params['name'];
    let year = parseInt(req.params['year']);

    let params = {
        TableName: "Movies",
        KeyConditionExpression: "#yr = :yyyy and title = :t",
        ExpressionAttributeNames: {
            "#yr": "year"
        },
        ExpressionAttributeValues: {
            ":yyyy": year,
            ":t": name
        }
    };


    docClient.query(params, function (err, data) {
        if (err) {
            console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
            res.send("Error 400: Bad Request");
        } else {
            console.log("Query succeeded.", JSON.stringify(data, null, 2));
            res.send({
                data
            });
        }
    });
}

async function deleteDatabase(req, res) {

    let dynamodb = new AWS.DynamoDB();

    let params = {
        TableName: "Movies"
    };


    dynamodb.deleteTable(params, (err, data) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Table deleted");
        }

    });
    res.send({});
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