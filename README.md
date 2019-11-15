# AWS-Cloud-App
A client and a server which interacts with a Cloudbased database ( AWSDynamoDB)

Usage
======
-npm install - install dependencies

-npm start 


Notes from Creator
======
-Can create, query and delete the database

Frontend uses VueJs 

-Data is fetched from s3 bucket

-If you'd like to use it I've given an example config file so you can see the layout typical layout for API keys

-Would like to add an upload feature, wasn't in the spec and time was limited

-Intended to be run on EC2 instance

-The error handling isn't very good - but it works 

-Not a UI designer, but you can see how it looks

Known Issues
======
-Quality not guaranteed

-Failure to upload movies to table, might be due to race conditions, would have to play around with promises some more

Example Usage
======
![Example Usage](https://github.com/eoleahy/AWS-Cloud-App/blob/master/1.png)
