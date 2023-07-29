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
      let user = null;
      try {
        await client.connect();
        const database = client.db('CommunicationStylesInventory');
        const collection = database.collection('Users');
        user = Object.assign(body, {_id: uuidv4()})

        console.dir(await collection.insertOne(user));
      }catch(e){
        callback(null, {statusCode: 500, body: JSON.stringify(e)})
      }finally {
        // Ensures that the client will close when you finish/error
        await client.close();
        callback(null, {statusCode: 200, body: JSON.stringify(user)})
      }
    }
  }else if(event.httpMethod == "GET"){
    let id = event.queryStringParameters.id
    if (!id.match(/^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$/)){
      callback(null, {statusCode: 400, body: "Query string 'id' is required and must be a guid"})
    }
    
    run = async function run() {
      let user = null;
      try {
        await client.connect();
        const database = client.db('CommunicationStylesInventory');
        const Users = database.collection('Users');
        const Results = database.collection('Results');
        let res = await Promise.all([Users.findOne({_id: id}), await Results.find({user_id: id})])
        console.log(res)
        let results = []
        res[1].forEach((obj) => results.push(obj))
        user = Object.assign(res[0] , {results: results})
      } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
        callback(null, {statusCode: 200, body: JSON.stringify(user)})
      }
    }

  }

  run().catch(console.dir);

}