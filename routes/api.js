/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
  console.log('we are conncected to the db!');
});

// To delete all documents in the database everytime restart the server!
db.dropDatabase();

/////////////////// Schemas
///////////////////////////

const bookSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  comments: [
    {
      type: String,
    },
  ],
  commentcount: {
    type: Number,
    default: 0,
  },
});

/////////////////// Models
///////////////////////////
const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {
  app
    .route('/api/books')
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      try {
        const query = Book.find().select('-comments');
        query.exec((err, data) => {
          if (!err && data) {
            const formatData = data.map((book) => {
              return {
                _id: book._id,
                title: book.title,
                comments: book.comments,
                commentcount: book.commentcount,
              };
            });
            res.json(formatData);
          }
        });
      } catch (err) {
        console.error(err);
      }
    })

    .post(function (req, res) {
      try {
        if (!req.body.title) return res.send('missing required field title');

        let newBook = new Book({
          title: req.body.title,
          comments: [],
        });

        newBook.save((err, savedBook) => {
          if (!err && savedBook) {
            return res.json({
              _id: savedBook._id,
              title: savedBook.title,
            });
          }
        });
      } catch (err) {
        console.error(err);
      }

      //response will contain new book object including atleast _id and title
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'

      try {
        Book.remove({}, (err, deletedBooks) => {
          if (!err && deletedBooks) {
            res.send('complete delete successful');
          } else {
            console.log(err);
          }
        });
      } catch (err) {
        console.error(err);
      }
    });

  // BOOK ID
  app
    .route('/api/books/:id')
    .get(function (req, res) {
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try {
        let bookid = req.params.id;

        Book.findById(bookid, (err, bookFound) => {
          if (!err && bookFound) {
            return res.json(bookFound);
          } else {
            // console.log(err);
            return res.send('no book exists');
          }
        });
      } catch (err) {
        console.error(err);
      }
    })

    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get

      try {
        if (!comment) return res.send('missing required field comment');
        console.log(comment);

        const updateComments = {
          $push: { comments: comment },
          $inc: { commentcount: 1 },
        };

        Book.findByIdAndUpdate(
          bookid,
          updateComments,
          {
            new: true,
          },
          (err, updatedBook) => {
            if (!err && updatedBook) {
              return res.json(updatedBook);
            } else {
              console.log(err);
              return res.send('no book exists');
            }
          }
        );
      } catch (err) {
        console.error(err);
      }
    })

    .delete(function (req, res) {
      //if successful response will be 'delete successful'

      try {
        let bookid = req.params.id;

        Book.findByIdAndRemove(bookid, (err, deletedBook) => {
          if (!err && deletedBook) {
            res.send('delete successful');
          } else if (!deletedBook) {
            res.send('no book exists');
          }
        });
      } catch (err) {
        console.error(err);
      }
    });
};
