var fs = require('fs');
var path = require('path');
var callsite = require('callsite');

module.exports = function(routeFilePath) {

	var callerFolder = path.dirname(callsite()[1].getFileName());
	var routeFileContent = fs.readFileSync(callerFolder + '/' + routeFilePath, 'utf-8');

	parse(routeFileContent);



	function parse(routeFileContent) {

		var routerArr = [];

		var lines = routeFileContent.split('\n');

		lines.forEach(function(line) {
			console.log("Route file line:" + line);
			processLine(line.split(/\s+/));
		});

		console.log(routerArr);

		function processLine(arr) {
			if (arr.length !== 3) {
				throw 'Router config is wrong, need 3 entries per line: ' + arr;
			}
			routerArr.push({
				method: arr[0],
				path: arr[1],
				fn: arr[2]
			});
		}
	}


	return function* yncRouter(next) {

		console.log("ync-router; this.method=" + this.method);
		console.log("ync-router; this.url=" + this.url);
		yield next;
	}

}