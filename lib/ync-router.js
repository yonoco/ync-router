var fs = require('fs');
var path = require('path');
var callsite = require('callsite');

module.exports = function(routeFilePath) {

	var callerFolder = path.dirname(callsite()[1].getFileName());
	var routeFileContent = fs.readFileSync(callerFolder + '/' + routeFilePath, 'utf-8');

	var routeArr = parse(routeFileContent);

	console.log(routeArr);

	function parse(routeFileContent) {

		var _routeArr = [];

		var lines = routeFileContent.split('\n');

		lines.forEach(function(line) {
			console.log("Route file line:" + line);
			_routeArr.push(processLine(line));
		});

		function processLine(line) {

			var arr = line.split(/\s+/);

			if (arr.length !== 3) {
				throw 'Router config is wrong, need 3 entries per line; line=' + line;
			}

			var ctrlFn = processCtrlFn(arr[2]);

			return {
				method: arr[0],
				url: arr[1],
				ctrl: ctrlFn.ctrl,
				fn: ctrlFn.fn
			};
		}

		function processCtrlFn(fnStr) {

			var arr = fnStr.split(".")

			if (arr.length !== 2) {
				throw 'The ctrl and the fn definition is wrong; entry=' + fnStr;
			}

			return {
				ctrl: arr[0],
				fn: arr[1]
			};

		}

		return _routeArr;
	}


	return function* yncRouter(next) {

		console.log("ync-router; this.method=" + this.method);
		console.log("ync-router; this.url=" + this.url);

		var route = matchRoute(this.method, this.url);

		if (route) {

			console.log("found");

			yield require(callerFolder + "/" + route.ctrl + ".js")[route.fn].call(this);

		} else {

			yield next;

		}

		function matchRoute(method, url) {

			for (var i = 0; i < routeArr.length; i++) {

				var route = routeArr[i];

				if (method === route.method && url === route.url) {
					return route;
				}

			}

			return null;

		}
	}

}