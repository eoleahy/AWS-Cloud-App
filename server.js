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

app.get('/check', checkDB);
app.get('/create', createDatabase);
app.get('/delete', deleteDatabase);
app.get('/query/:name/:year', queryDatabase);
app.get('/', (req, res) => res.sendFile(publicPath + "/client.html"));

app.listen(port, () => console.log(`To view webpage visit ${port}`));

function checkDB(req, res) {

    let exists = false;
    let dynamodb = new AWS.DynamoDB();
    var params = {
        TableName: "Movies" /* required */
    };
    dynamodb.describeTable(params, function (err, data) {
        if (err) {
            console.log("Doesn't exist"); // an error occurred
            res.json({exist:false});
        } else {
            console.log("Exists"); // successful response
            res.json({exist:true});
        }
    });
}

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

    dynamodb.createTable(params, (err, data) => {
        if (err) {
            console.log("Error creating table, it already exists");
            res.send({
                message: "Error 400 : Bad Request"
            });
        } else {

            console.log("Table created, Fetching data...");
            let bucketParams = {
                Bucket: 'csu44000assignment2',
                Key: 'moviedata.json'
            };

            s3.getObject(bucketParams, (err, data) => {
                if (err) {
                    console.error("Error fetching bucket");
                    res.send({
                        message: "Couldn't fetch bucket!"
                    });
                } else {

                    let items = JSON.parse(data.Body.toString());
                    console.log("Bucket fetched, uploading data...");

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

                                //console.log("Could not add item to database!");
                            } else {
                                //console.log("Added item:", JSON.stringify(data, null, 2));
                            }
                        });

                    }

                    console.log("Added everything to database...")
                    res.send({
                        message: "Ok"
                    });
                }
            });
        }
    });
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
            res.send({
                message: "Error 400: Bad Request"
            });
        } else {

            if (data["Count"] > 0) {
                console.log("Query succeeded.", data);
                res.send({
                    data
                });
            } else {
                console.log("Failed Query");

                res.send({
                    message: "Error 400: Bad Request"
                });
            }
        };

    });
}

function deleteDatabase(req, res) {

    let dynamodb = new AWS.DynamoDB();

    let params = {
        TableName: "Movies"
    };


    dynamodb.deleteTable(params, (err, data) => {
        if (err) {
            console.log("Failed to delete database");
            res.send({
                message: "Error 400: Bad Request"
            })
        } else {
            console.log("Table deleted");
            res.send({
                message: "Ok"
            });
        }

    });
}