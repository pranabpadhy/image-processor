var express = require('express'),
	path = require('path'),
	fs = require('fs'),
	favicon = require('serve-favicon'),
	bodyParser = require('body-parser'),
	formidable = require('formidable'),
	exec = require('child_process').exec;

var app = express();

var utils = require('./utils/utils.js');

app.use(bodyParser.urlencoded({extended: true}));
app.use(favicon(path.join(__dirname, '/web/images', 'favicon.ico')));
app.use('/web', express.static(path.join(__dirname, '/web')));
app.use('/temp', express.static(path.join(__dirname, '/temp')));

app.get('/', function (req, res) {
	res.redirect('/index');
});

app.get('/index', function (req, res) {
	fs.readFile(__dirname+'/web/html/index.html', function(err, data){
		if(err) {
			console.log(err);
			res.writeHead(404);
			res.write("Page not found")
		} else {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(data);
		}
		res.end();
	});
});

app.post('/upload', function (req, res) {
	var formData = new formidable.IncomingForm();
	utils.makeDirectory(__dirname+'/web/images/uploads', function (dirErr, dirRes) {
		if(dirErr) return res.json({"error": dirErr});
		formData.parse(req, function (err, fields, files) {
			console.log("files to upload:", files, "\ntype:", typeof(files));
			var oldpath = files['image'].path;
			var newpath = __dirname + '/web/images/uploads/' + files['image'].name;
			exec('cp -rf "'+oldpath+'" "'+newpath+'"', function(err, stdout, stderr) {
				fs.unlinkSync(oldpath);
				if(err) return res.json({"error": err});
				res.json({"result": files['image'].name});
			});
		});
	});
});

app.get('/news', function (req, res) {
	var news = {};
	fs.readFile(__dirname+'/utils/news.json', function(err, data){
		if(err) {
			console.log(err);
			news['error'] = "No news found";
		} else {
			console.log('news loaded.');
			news['result'] = JSON.parse(data);
		}
		res.json(news);
	});
});

app.get('/download', function (req, res) {
	var data = req.body;
	var filePaths = [];
	var download = {};
	fs.readFile(__dirname+'/utils/imageURL.json', function (error, result) {
		if(error) {
			console.log("readErr:", error);
			download["error"] = "Couldn't download pictures.";
		} else {
			var urlJson = JSON.parse(result);
			utils.makeDirectory(__dirname+'/web/images/downloads', function (dirErr, dirRes) {
				console.log(dirErr, "typeof(dirRes):", typeof(dirRes), "\ndirRes:", dirRes);
				if(dirErr) {
					console.log("dirErr:", dirErr);
					download["error"] = dirErr;
				} else {
					var fileName;
					var filePath = __dirname+'/web/images/downloads/';
					if(typeof(dirRes.res) == "object") {
						utils.each(dirRes.res, function (file, readCallback) {
							fileName = filePath + file;
							filePaths.push(fileName.split(__dirname+"/")[1]);
							readCallback();
						}, function(err) {
							if(download.error) return res.json(download);
							else {
								fs.readdir(__dirname+'/web/images/uploads', function (err, files) {
									console.log(err, files);
									if(files) {
										console.log(files);
										files.forEach(function (file) {
											filePaths.push('/web/images/uploads/'+file);
										});
									}
									download["result"] = filePaths;
									console.log(filePaths);
									console.log(download);
									res.json(download);
								});
							}
						});
					} else {
						utils.each(urlJson.imageURLs, function (url, downloadCallback) {
							fileName = url.split("/")[url.split("/").length-1];
							utils.downloadFiles(url, filePath+fileName, function (dlErr, dlRes) {
								if(dlErr) {
									console.log("file download error:", dlErr, '\n');
									download["error"] = "Couldn't download pictures.";
									downloadCallback();
								} else {
									filePaths.push(dlRes.split(__dirname+"/")[1]);
									downloadCallback();
								}
							});
						}, function (err) {
							if(download.error) return res.json(download);
							else {
								fs.readdir(__dirname+'/web/images/uploads', function (err, files) {
									console.log(err, files);
									if(files) {
										console.log(files);
										files.forEach(function (file) {
											filePaths.push('/web/images/uploads/'+file);
										});
									}
									download["result"] = filePaths;
									console.log(filePaths);
									console.log(download);
									res.json(download);
								});
							}
						});
					}
				}
			});
		}
	});
});

app.listen(3000, function () {
	console.log("Server is running at port:", 3000);
});