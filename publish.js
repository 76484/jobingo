#!/usr/bin/env node

const fs = require("fs");

const AWS = require("aws-sdk");
const yargs = require("yargs");

const argv = yargs.option("profile", {
  demand: true,
  describe:
    "AWS profile for which to load credentials. Credentials will be loaded from ~/.aws/credentials",
}).argv;

const profile = argv.profile;
const credentials = new AWS.SharedIniFileCredentials({ profile });
const s3 = new AWS.S3();

const params = {
  Bucket: "jobingo",
  ContentType: "text/html",
  Key: "index.html",
  Body: fs.readFileSync("./index.html"),
};

AWS.config.update({
  credentials,
  region: "us-east-1",
});

s3.upload(params, (err, data) => {
  console.log(err, data);
});
