var fs = require('fs');
var path = require('path');
var callsite = require('callsite');
var _ = require('lodash');

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
				throw new Error('Router config is wrong, need 3 entries per line; line=' + line);
			}

			var urlParams = processUrl(arr[1]);
			var ctrlFn = processCtrlFn(arr[2]);

			if (!_.isEqual(urlParams.sort(), ctrlFn.fnParameters.sort())) {
				throw new Error('Url params and ctrl fn params are different; line=' + line);
			}

			return {
				method: arr[0],
				url: arr[1],
				urlParams: urlParams,
				ctrl: ctrlFn.ctrl,
				fn: ctrlFn.fn,
				fnMethod: ctrlFn.fnMethod,
				fnParameters: ctrlFn.fnParameters
			};
		}

		function processUrl(url) {

			var paramsArr = [],
				arr;

			if (url.indexOf('/') !== 0) {
				throw new Error('The url does not start with slash(/); url=' + url);
			}

			arr = url.split('/');
			arr.shift();

			if (url.lastIndexOf('/') === url.length - 1) {
				arr.pop();
			}

			arr.forEach(function(part) {
				if (part.length < 1) {
					throw new Error('The url is wrong, it has // or too short parts in; url=' + url);
				}

				if (part[0] === ':') {
					paramsArr.push(part.substr(1));
				}

			});

			return paramsArr;

		}

		function processCtrlFn(fnCtrlStr) {

			var arr = fnCtrlStr.split(".");

			if (arr.length !== 2) {
				throw new Error('The ctrl and the fn definition is wrong; entry=' + fnStr);
			}

			var fn = processFn(arr[1]);

			return {
				ctrl: arr[0],
				fn: arr[1],
				fnMethod: fn.method,
				fnParameters: fn.parameters
			};

		}

		function processFn(fnStr) {
			var methodAndRestArr = fnStr.split(/\s*\(/);

			if (methodAndRestArr.length !== 2) {
				throw new Error('The function has not a proper signature; fnStr=' + fnStr);
			}

			var parameters = processParams(methodAndRestArr[1].trim());

			return {
				method: methodAndRestArr[0],
				parameters: parameters
			};
		}

		function processParams(paramsStr) {
			var arr = [];
			if (paramsStr.lastIndexOf(")") !== paramsStr.length - 1) {
				throw new Error("The function has no closing parenthese ')';paramsStr=" + paramsStr);
			}
			paramsStr = paramsStr.substr(0, paramsStr.length - 1);
			arr = paramsStr.split(/\s*,\s*/);

			return arr;


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