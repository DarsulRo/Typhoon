const MongoClient = require('mongodb').MongoClient
class Mongo {
   
    static async connectToMongo() {
        if (this.db) return this.db
        this.db = await MongoClient.connect(this.url, this.options)
        return this.db
    }
}

Mongo.db = null
Mongo.url = 'mongodb+srv://dorin:dorin@cluster.fgr8o.mongodb.net'
Mongo.options = {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
}

module.exports = { Mongo }