// Sample app
var restify = require('restify');
var restifyValidator = require('../../index');

function App(port, validation) {
  this.app = null;
  this.port = port;
  this.validation = validation;
}
module.exports = App;

App.prototype.start = function() {
  var self = this;
  self.app = restify.createServer();

  // mapParams is false by default from 5.x
  // See http://restify.com/docs/4to5/ in detail
  self.app.use(restify.plugins.queryParser({ mapParams: false }));
  self.app.use(restify.plugins.bodyParser({ mapParams: false }));

  self.app.use(restifyValidator);

  // RegExp usage was changed from 7.x
  // See http://restify.com/docs/6to7/ in detail
  self.app.get('/test:testnum(^\\d+)', self.validation);
  self.app.get('/', self.validation);
  self.app.post('/', self.validation);
  self.app.get('/:testparam', self.validation);
  self.app.post('/:testparam', self.validation);

  self.app.listen(this.port);
};

App.prototype.stop = function() {
  this.app.close();
};
