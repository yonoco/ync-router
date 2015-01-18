var fs = require('fs');
var path = require('path');
var callsite = require('callsite');
var _ = require('lodash');
var pathToRegexp = require('path-to-regexp');

module.exports = function(routeFilePath) {

	var callerFolder = path.dirname(callsite()[1].getFileName());
	var routeFileContent = fs.readFileSync(callerFolder + '/' + routeFilePath, 'utf-8');

	var routeArr = parse(routeFileContent);

	function parse(routeFileContent) {

		var _routeArr = [];

		var lines = routeFileContent.split('\n');

		lines.forEach(function(line) {
			_routeArr.push(processLine(line));
		});

		function processLine(line) {

			var arr = line.split(/\s+/);

			if (arr.length !== 3) {
				throw new Error('Router config is wrong, need 3 entries per line; line=' + line);
			}

			var path = processPath(arr[1]);
			var ctrlFn = processCtrlFn(arr[2]);

			if (!_.isEqual(path.params.sort(), ctrlFn.fnParameters.sort())) {
				throw new Error('Path params and ctrl fn params are different; line=' + line);
			}

			return {
				method: arr[0],
				path: path.path,
				pathParams: path.params,
				pathRegexp: path.regexp,
				ctrl: ctrlFn.ctrl,
				fn: ctrlFn.fn,
				fnMethod: ctrlFn.fnMethod,
				fnParameters: ctrlFn.fnParameters
			};
		}

		function processPath(path) {

			var paramsArr = [],
				arr;

			if (path.indexOf('/') !== 0) {
				throw new Error('The path does not start with slash(/); path=' + path);
			}

			arr = path.split('/');
			arr.shift();

			if (path.lastIndexOf('/') === path.length - 1) {
				arr.pop();
			}

			arr.forEach(function(part) {
				if (part.length < 1) {
					throw new Error('The path is wrong, it has // or too short parts in; path=' + path);
				}

				if (part[0] === ':') {
					paramsArr.push(part.substr(1));
				}

			});

			var regexp = pathToRegexp(path);

			return {
				path: path,
				params: paramsArr,
				regexp: regexp
			}


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

		var path = !!this.path ? decodeURIComponent(this.path) : null;

		var route, m, args;

		for (var i = 0; i < routeArr.length; i++) {

			route = routeArr[i];

			if (!matchMethod(this.method, route.method)) {
				return null;
			}

			if (m = route.pathRegexp.exec(this.path)) {
				args = m.slice(1);

				args = sortByCtrlFnParamOrder(args, route.pathParams, route.fnParameters);
				// args.push(next);
				yield require(callerFolder + "/" + route.ctrl + ".js")[route.fnMethod].apply(this, args);
				return;
			}

		}

		yield next;

		function matchMethod(currentMethod, definedMethod) {
			if (currentMethod === definedMethod) return true;
			return definedMethod === 'GET' && currentMethod === 'HEAD';
		}

		function sortByCtrlFnParamOrder(args, pathParams, fnParameters) {
			var res = [];
			for (var i = 0; i < fnParameters.length; i++) {
				res.push(pathParams[pathParams.indexOf(fnParameters[i])]);
			}
			return res;
		}

	}

}