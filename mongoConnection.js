const MongoClient = require('mongodb').MongoClient
class MongoConnection {
   
    static async connectToMongo() {
        if (this.db) return this.db
        this.db = await MongoClient.connect(this.url, this.options)
        return this.db
    }
}

MongoConnection.db = null
MongoConnection.url = 'mongodb://localhost:27017'
MongoConnection.options = {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
}

module.exports = { MongoConnection }