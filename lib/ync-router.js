var fs = require('fs');
var path = require('path');
var callsite = require('callsite');

module.exports = function(routeFilePath) {

	var callerFolder = path.dirname(callsite()[1].getFileName());
	var routeFile = fs.readFileSync(callerFolder + '/' + routeFilePath, 'utf-8');

	var lines = routeFile.split('\n');
	lines.forEach(function(line) {
		console.log("Route file line:" + line);

	});

	function parse(routerStr) {

	}


	return function* yncRouter(next) {

		console.log("ync-router; this.method=" + this.method);
		console.log("ync-router; this.url=" + this.url);
		yield next;
	}

}