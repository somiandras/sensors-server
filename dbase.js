const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const name = 'weather-station';
let client;

class db {
  insert(data) {
    data.date = new Date(data.date);
    return MongoClient.connect(url)
    .then(function(c) {
      client = c;
      const db = client.db(name);
      return db.collection('sensors').insertOne(data);
    })
    .then(function(response) {
      assert.equal(1, response.insertedCount);
      client.close();
      return Promise.resolve(true);
    });
  }

  getData(frequency) {
    return MongoClient.connect(url)
    .then(function(c) {
      client = c;
      const db = client.db(name);
      return db.collection('sensors')
      .aggregate([
        {'$project': {
          temp: 1,
          humi: 1,
          lux: 1,
          date: 1,
          min_mod: {'$mod': [{'$minute': '$date'}, frequency]}
        }},
        {'$match': {min_mod: 0}},
        {'$project': {
          temp: 1,
          humi: 1,
          lux: 1,
          date: 1
        }},
        {'$sort': {date: -1}},
        {'$limit': 30}
      ])
      .toArray();
    })
    .then(function(data) {
      assert.equal(30, data.length);
      client.close();
      data.sort((a, b) => {
        return new Date(a.date) - new Date(b.date)
      })
      return Promise.resolve(data);
    });
  }
}

module.exports = db;
