"use strict";

const config = require("../config");
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

mongoose.connection.on("connected", () => {
  console.log("MongoDB is connected");
});

mongoose.connection.on("error", err => {
  console.log(`Could not connect to MongoDB because of ${err}`);
  process.exit(-1);
});

if (config.env === "development") {
  mongoose.set("debug", true);
}

exports.connect = () => {
  let mongoURI =
    config.env === "production" || "development" ? config.mongo.uri : config.mongo.testURI;
  console.log('MONGO >>> ', mongoURI);

  mongoose.connect(mongoURI, {
    keepAlive: 1
  });

  return mongoose.connection;
};
