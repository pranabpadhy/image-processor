var exec = require('child_process').exec,
	fs = require('fs'),
	mkdirp = require('mkdirp'),
	_  = require('./underscore');

var each = function(collection, fn, finalCallback) {
	var keys = _.isArray(collection) ? _.range(collection.length) : _.keys(collection);
	var errs = [];

	var i = 0;
	var doOne = function() {
		if (keys.length > 0 && i < keys.length) {
			var item = collection[keys[i]];
			fn(item, function(err) {
				errs.push(err);
				if (err && err.step === 'break') {return doFinal();}
				i++;
				return doOne();
			}, keys[i], collection);
		} else return doFinal();
	}
  
	var doFinal = function() {
		var finalIndex = keys[i] || i;
		finalCallback(errs, finalIndex, i, keys);
	}

	return doOne();
}

var readDirectories = function (dirPaths, callback) {
	var files = [];
	each(dirPaths, function (dirPath, subCallback) {
		fs.readdir(dirPath, 'utf-8', function (readErr, file) {
			if(readErr) return subCallback(readErr);
			files.concat(file);
			subCallback();
		});
	}, function(err) {
		if(err || files.length == 0) return callback(err || "Couldn't read");
		callback(null, files);
	});
}

var makeDirectory = function (dirPath, callback) {
	fs.readdir(dirPath, 'utf-8', function (readErr, files) {
		if(readErr) {
			mkdirp(dirPath, function (err) {
				if(err) return callback(err);
				callback(null, {"res": true})
			});
		} else callback(null, {"res": files});
	});
}

var downloadFiles = function(downloadURL, filepath, callback) {
  var curlCommandLine = 'curl "' + downloadURL + '" > ' + filepath;
  console.log(curlCommandLine);
  exec(curlCommandLine, function(err, stdout, stderr) {
    if (err) {return callback(err);}
    return callback(null, filepath);
  });
}

var uploadFiles = function(fileName, fileType, filePath, uploadURL, callback) {
  var curlCommandLine = 'curl -F "key=' + fileName + '" -F "Content-Type=' + fileType + '" -F "file=@' + filePath + '" ' +  uploadURL;
  console.log(curlCommandLine);
  exec(curlCommandLine, function(err, stdout, stderr) {
    if (err) {return callback(err);}
    return callback(null, "File successfully uploaded");
  });
}

exports.each = each;
exports.readDirectories = readDirectories;
exports.makeDirectory = makeDirectory;
exports.downloadFiles = downloadFiles;
exports.uploadFiles = uploadFiles;