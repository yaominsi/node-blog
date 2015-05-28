var MongoClient = require('mongodb').MongoClient;
var app_config=require('./app_config.js').AppConfig;
var ObjectID = require('mongodb').ObjectID;
var assert = require('assert');

exports.Attaches={
  insert:function(param,callback){
    MongoClient.connect(app_config.mongodb_url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to server");
      db.collection('attaches').insert(param,function(){
        db.close();
        callback(err,param);
      });   
    });
  }
}