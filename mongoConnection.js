const MongoClient = require('mongodb').MongoClient
class Mongo {
   
    static async connectToMongo() {
        if (this.db) return this.db
        this.db = await MongoClient.connect(this.url, this.options)
        return this.db
    }
}

Mongo.db = null
Mongo.url = 'mongodb://localhost:27017'
Mongo.options = {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
}

module.exports = { Mongo }