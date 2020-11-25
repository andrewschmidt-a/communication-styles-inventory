const client = require("@sendgrid/mail")
const { MongoClient } = require("mongodb");
const uuidv4 = require('uuid').v4;

exports.handler = function(event, context, callback) {
  const {
    MONGODB_CONNECTION_STRING
  } = process.env
  const client = new MongoClient(MONGODB_CONNECTION_STRING);
  let run = async function(){

  }
  if(event.httpMethod == "POST"){
    const body = JSON.parse(event.body)
    run = async function run() {
      let result = null;
      try {
        await client.connect();
        const database = client.db('CommunicationStylesInventory');
        const collection = database.collection('Results');
        result = Object.assign(body, {_id: uuidv4(), date: new Date()})

        console.dir(await collection.insertOne(result));
      } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
        callback(null, {statusCode: 200, body: JSON.stringify(result)})
      }
    }
  }else{
    callback(null, {statusCode: 405})
  }

  run().catch(console.dir);

}