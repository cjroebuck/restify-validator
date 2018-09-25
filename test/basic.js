var assert = require('assert');
var async = require('async');

var App = require('./helpers/app');
var req = require('./helpers/req');

var port = process.env.NODE_HTTP_PORT || 8888;
var url = 'http://localhost:' + port;
var util = require('util');

// There are three ways to pass parameters to restify:
// - as part of the URL
// - as GET parameter in the querystring
// - as POST parameter in the body
// URL params take precedence over GET params which take precedence over
// POST params.

var errorMessage = 'Parameter is not an integer';
var validation = function(req, res, next) {
  // console.log('params: ' +util.inspect(req.params));
  // console.log('query: ' +util.inspect(req.query));
  // console.log('body: ' +util.inspect(req.body));
  req.assert('testparam', errorMessage).notEmpty().isInt();

  var errors = req.validationErrors();
  if (errors) {
    res.send(errors);
    return next();
  }

  if (req.query && req.query['testparam']) {
    res.send({testparam: req.query['testparam']});
  } else if (req.body && req.body['testparam']) {
    res.send({testparam: req.body['testparam']});
  } else {
    res.send({testparam: req.params['testparam']});
  }
  return next();
};
var app = new App(port, validation);
app.start();

function fail(body) {
  // console.log('in fail: '+util.inspect(body));
  assert.equal(body.length, 1);
  assert.deepEqual(body[0].msg, errorMessage);
}
function pass(body) {
  // console.log('in pass: '+util.inspect(body));
  assert.deepEqual(body, {testparam: 123});
}

var tests = [
  // Test URL param
  async.apply(req, 'get', url + '/test123', fail),
  async.apply(req, 'get', url + '/123', pass ),
  async.apply(req, 'post', url + '/test123', fail),
  async.apply(req, 'post', url + '/123', pass),

  // // // Test GET param and URL over GET param precedence
  async.apply(req, 'get', url + '/test123?testparam=gettest', fail),
  // async.apply(req, 'get', url + '/123?testparam=gettest', pass),
  // async.apply(req, 'get', url + '/123?testparam=gettest', pass),
  async.apply(req, 'get', url + '/?testparam=test', fail),
  // async.apply(req, 'get', url + '/?testparam=123', pass),

  // // // Test POST param and URL over GET over POST param precedence
  async.apply(req, 'post', url + '/test?testparam=gettest', {json: {testparam: 123}}, fail),
  // async.apply(req, 'post', url + '/123?testparam=123', {json: {testparam: 'posttest'}}, pass),
  // async.apply(req, 'post', url + '/123?testparam=123', {json: {testparam: 'posttest'}}, pass),
  async.apply(req, 'post', url + '/?testparam=test', {json: {testparam: 123}}, fail),
  // async.apply(req, 'post', url + '/?testparam=123', {json: {testparam: 'posttest'}}, pass),
  async.apply(req, 'post', url + '/', {json: {testparam: 'test'}}, fail),
  // async.apply(req, 'post', url + '/', {json: {testparam: 123}}, pass)
];

async.parallel(tests, function(err) {
  assert.ifError(err);
  app.stop();
  console.log('All %d tests passed.', tests.length);
});
