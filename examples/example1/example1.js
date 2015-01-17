var koa = require('koa');
var yncRouter = require('../../lib/ync-router');
var app = koa();


app.use(yncRouter("route.ync"));

app.listen(3434);
console.log('application started on port 3434');