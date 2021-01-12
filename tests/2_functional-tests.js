/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let id1 = '';
let idNotInDb = '5ffd81efeabad4034cb8dd98';

suite('Functional Tests', function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  // test('#example Test GET /api/books', function (done) {
  //   chai
  //     .request(server)
  //     .get('/api/books')
  //     .end(function (err, res) {
  //       assert.equal(res.status, 200);
  //       assert.isArray(res.body, 'response should be an array');
  //       assert.property(
  //         res.body[0],
  //         'commentcount',
  //         'Books in array should contain commentcount'
  //       );
  //       assert.property(
  //         res.body[0],
  //         'title',
  //         'Books in array should contain title'
  //       );
  //       assert.property(
  //         res.body[0],
  //         '_id',
  //         'Books in array should contain _id'
  //       );
  //       done();
  //     });
  // });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite('Routing tests', function () {
    suite(
      'POST /api/books with title => create book object/expect book object',
      function () {
        test('Test POST /api/books with title', function (done) {
          chai
            .request(server)
            .post('/api/books')
            .send({
              title: 'Book test title 1',
            })
            .end(function (err, res) {
              assert.equal(res.status, 200);

              // assert.property(
              //   res.body,
              //   'commentcount',
              //   'Book should contain commentcount'
              // );
              // assert.property(res.body, 'title', 'Book should contain title');
              // assert.property(res.body, '_id', 'Book should contain _id');

              assert.equal(
                res.body.title,
                'Book test title 1',
                'Books in array should contain a title'
              );
              id1 = res.body._id;
              done();
            });
        });

        test('Test POST /api/books with no title given', function (done) {
          chai
            .request(server)
            .post('/api/books')
            .send({
              title: '',
            })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(
                res.text,
                'missing required field title',
                'Books should contain a title'
              );
              done();
            });
        });
      }
    );

    suite('GET /api/books => array of books', function () {
      test('Test GET /api/books', function (done) {
        chai
          .request(server)
          .get('/api/books')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            done();
          });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', function () {
      test('Test GET /api/books/[id] with id not in db', function (done) {
        chai
          .request(server)
          .get('/api/books/invalidId')
          // .send({
          //   id: idNotInDb,
          // })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(
              res.text,
              'no book exists',
              'Books should be in the db'
            );
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        console.log(id1);
        chai
          .request(server)
          .get('/api/books/' + id1)
          // .send({
          //   id: id1,
          // })
          .end(function (err, res) {
            // res.body is an array
            assert.property(
              res.body,
              'comments',
              'Book should contain comments'
            );
            assert.property(res.body, 'title', 'Book should contain title');
            assert.property(res.body, '_id', 'Book should contain _id');

            assert.equal(
              res.body.title,
              'Book test title 1',
              'Book title should be "Book test title 1"'
            );
            assert.equal(res.body._id, id1, 'Book title should be: ' + id1);
            assert.isArray(
              res.body.comments,
              'response comments should be an array'
            );

            done();
          });
      });
    });

    suite(
      'POST /api/books/[id] => add comment/expect book object with id',
      function () {
        test('Test POST /api/books/[id] with comment', function (done) {
          chai
            .request(server)
            .post('/api/books/' + id1)
            .send({
              comment: 'Test comment 1',
            })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(
                res.body.title,
                'Book test title 1',
                'Book title should be "Book test title 1"'
              );
              assert.equal(res.body._id, id1, 'Book title should be: ' + id1);
              assert.isArray(
                res.body.comments,
                'response comments should be an array'
              );
              assert.equal(
                res.body.comments[0],
                'Test comment 1',
                'Comment should be: Test comment 1'
              );

              done();
            });
        });

        test('Test POST /api/books/[id] without comment field', function (done) {
          chai
            .request(server)
            .post('/api/books/' + id1)
            .send({
              comment: '',
            })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(
                res.text,
                'missing required field comment',
                'request should have a comment'
              );

              done();
            });
        });

        test('Test POST /api/books/[id] with comment, id not in db', function (done) {
          chai
            .request(server)
            .post('/api/books/' + idNotInDb)
            .send({
              comment: 'Test comment 1',
            })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(
                res.text,
                'no book exists',
                'Books should be in the db'
              );

              done();
            });
        });
      }
    );

    suite('DELETE /api/books/[id] => delete book object id', function () {
      test('Test DELETE /api/books/[id] with valid id in db', function (done) {
        chai
          .request(server)
          .delete('/api/books/' + id1)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful');
            done();
          });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function (done) {
        chai
          .request(server)
          .delete('/api/books')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'complete delete successful');
            done();
          });
      });
    });
  });
});
