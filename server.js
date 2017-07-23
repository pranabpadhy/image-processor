var express = require('express'),
	path = require('path'),
	fs = require('fs'),
	favicon = require('serve-favicon'),
	bodyParser = require('body-parser');

var app = express();

var utils = require('./utils/utils.js');

app.use(bodyParser.urlencoded({extended: true}));
app.use(favicon(path.join(__dirname, '/web/images', 'favicon.ico')));
app.use('/web', express.static(path.join(__dirname, '/web')));

app.get('/', function (req, res) {
	res.redirect('/index');
});

app.get('/index', function (req, res) {
	utils.readFile(__dirname+'/web/html/index.html', function(err, data){
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

app.post('/send', function (req, res) {
	var data = req.body;
	res.json({"result":data});
});

app.post('/loadPage', function (req, res) {
	var page = req.body.page;
	var pageData = {};
	utils.readFile(__dirname+'/web/html'+page+'.html', function(err, data){
		if(err) {
			console.log(err);
			pageData['error'] = "404 Page not found";
		} else {
			console.log(page+' loaded.');
			pageData['result'] = data;
		}
		pageRes.json(pageData);
	});
	res.json(pageData);
});

app.get('/news', function (req, res) {
	var news = {};
	utils.readFile(__dirname+'/utils/news.json', function(err, data){
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
	utils.readFile(__dirname+'/utils/imageURL.json', function (error, result) {
		if(error) {
			console.log("readErr:", error);
			download["error"] = "Couldn't download pictures.";
		} else {
			var urlJson = JSON.parse(result);
			utils.makeDirectory(__dirname+'/web/images/downloads', function (dirErr, dirRes) {
				console.log("typeof(dirRes):", typeof(dirRes), "\ndirRes:", dirRes);
				if(dirErr) {
					console.log("dirErr:", dirErr);
					download["error"] = dirErr;
				} else {
					var fileName, i = 0;
					var filePath = __dirname+'/web/images/downloads/';
					if(typeof(dirRes.res) == "object") {
						dirRes.res.forEach(function (file) {
							i++;
							fileName = filePath + file;
							filePaths.push(fileName.split(__dirname+"/")[1]);
						});
					} else {
						urlJson.imageURLs.forEach(function (url) {
							fileName = url.split("/")[url.split("/").length-1];
							utils.downloadFiles(url, filePath+fileName, function (dlErr, dlRes) {
								if(dlErr) {
									console.log("file download error:", dlErr, '\n');
									download["error"] = "Couldn't download pictures.";
								} else {
									i++;
									filePaths.push(dlRes.split(__dirname+"/")[1]);
								}
							});
						});
					}
					var wait = function () {
						console.log("length:", urlJson.imageURLs.length, "\ni:", i);
						if(i != urlJson.imageURLs.length) {
							setTimeout(function () { wait(); }, 1000);
						} else {
							if(filePaths.length == urlJson.imageURLs.length) download["result"] = filePaths;
							console.log(filePaths);
							console.log(download);
							res.json(download);
						}
					}
					if(!download.error) wait();
					else {
						console.log(filePaths);
						console.log(download);
						res.json(download);
					}
				}
			});
		}
	});
});

app.listen(3000, function () {
	console.log("Server is running at port:", 3000);
});