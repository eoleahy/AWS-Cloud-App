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

    let bucketParams = {
        Bucket: 'csu44000assignment2',
        Key: 'moviedata.json'
    };

    dynamodb.createTable(params, (err, data) => {
        if (err) console.error("Failed to create table", err);

        else {
            console.log("Table created!");

        }
    });

    console.log("Fetching");

    s3.getObject(bucketParams, (err, data) => {
        if (err) console.error(err);


        else {
            let items = JSON.parse(data.Body.toString());
            //console.log(items);
            console.log("Bucket fetched, uploading data");

            let docClient = new AWS.DynamoDB.DocumentClient();
            
            
            for (const item of items) {

                //console.log(item);

                let params = {
                    TableName: "Movies",
                    Item: item
                }

                //console.log(item["title"]);
                
                docClient.put(params, function (err, data) {
                    if (err) {
                        console.error("Unable to add item.");
                    } else {
                        console.log("Added item:", params["Item"]["title"]);
                    }
                });
                
            }
            
            console.log("Added everything")
            
        }
    });


    res.send({});
}

async function deleteDatabase(req, res) {

    let dynamodb = new AWS.DynamoDB();

    let params = {
        TableName: "Movies"
    };

    dynamodb.deleteTable(params, (err, data) => {
        if (err) console.error(err);

        else
            console.log("Table deleted");

        res.send({});
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