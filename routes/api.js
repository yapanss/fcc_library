/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});
var collection

MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
  var db = db.db('fcc_mongodb')
  collection = db.collection('books')
});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      collection.find({}, {"_id": 1, "title": 1, "commentcount": 1}).toArray((err, books) => {
        res.json(books)
      })
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      collection.insertOne({title: title, comments: [], commentcount: 0}, (err, book) => {
        if(err) throw err
        res.json({"_id": book.ops[0]._id, "title": book.ops[0].title})
      })
    })
    .delete(function(req, res){
      collection.remove({}, (err, result) => {
        if(err) throw err
        res.send('complete delete successful')
      })
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = new ObjectId(req.params.id);
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      collection.findOne({_id: bookid}, {_id: 1, title: 1, comments: 1} , (err, book) => {
        if(err) throw err
        if(!book) {
          res.send('no book exists')
        } else res.json(book)
      })
    })
    
    .post(function(req, res){
      var bookid = new ObjectId(req.params.id);
      var comment = req.body.comment;
      //json res format same as .get
      collection.findOneAndUpdate({_id: bookid}, {$push: {comments: comment}, $inc:{commentcount: 1}}, (err, book) => {
        if(err) throw err
        // res.send(book)
        // res.json({_id: book._id, title: book.title, comments: book.comments})
        console.log(book)
        res.json({_id: book.value._id, title: book.value.title, comments: book.value.comments})
      })
    })
    
    .delete(function(req, res){
      var bookid = new ObjectId(req.params.id);
      collection.deleteOne({_id: bookid}, (err, book) => {
        if (err) throw err
        res.send('delete successful')
      })
      //if successful response will be 'delete successful'
    });
  
};
