var exec = require('child_process').exec,
	fs = require('fs'),
	mkdirp = require('mkdirp');

exports.readFile = function (filePath, callback) {
	fs.readFile(filePath, 'utf-8', function (readErr, data) {
		if(readErr) return callback(readErr);
		callback(null, data);
	});
}

exports.readDirectory = function (dirPath, callback) {
	fs.readdir(dirPath, 'utf-8', function (readErr, files) {
		if(readErr) return callback(readErr);
		callback(null, files);
	});
}

exports.makeDirectory = function (dirPath, callback) {
	fs.readdir(dirPath, 'utf-8', function (readErr, files) {
		if(readErr) {
			mkdirp(dirPath, function (err) {
				if(err) return callback(err);
				callback(null, {"res": true})
			});
		}
		callback(null, {"res": files});
	});
}

exports.writeFile = function (filePath, data, callback) {
	fs.writeFile(filePath, data, 'utf-8', function (writeErr) {
		if(writeErr) return callback(writeErr);
		callback(null, {"res": true});
	});
}

exports.downloadFiles = function(downloadURL, filepath, callback) {
  var curlCommandLine = 'curl "' + downloadURL + '" > ' + filepath;
  console.log(curlCommandLine);
  exec(curlCommandLine, function(err, stdout, stderr) {
    if (err) {return callback(err);}
    return callback(null, filepath);
  });
}

exports.uploadFiles = function(fileName, fileType, filePath, uploadURL, callback) {
  var curlCommandLine = 'curl -F "key=' + fileName + '" -F "Content-Type=' + fileType + '" -F "file=@' + filePath + '" ' +  uploadURL;
  console.log(curlCommandLine);
  exec(curlCommandLine, function(err, stdout, stderr) {
    if (err) {return callback(err);}
    return callback(null, "File successfully uploaded");
  });
}
