var fs = require('fs');
var express = require('express');
var app = express.createServer(
			require('connect-form')({keepExtensions: true})
		);

app.set('view engine', 'jade');
//app.use(express.bodyParser());

app.get('/', function(req, res){
	res.render('index');
});
//handle post request
app.post('/', function(req, res, next){
//	console.log(req.body.file);
	req.form.complete(function(error, fields, files){
		if(error){
			next(error);
		}
		else {
			//check file format
			//res.send(files.file);
			var inputStream = fs.createReadStream(files.file.path);
			inputStream.on('data', function(data){
				//validate data
				//res.send(data);
				res.render('satellite');
			});
			inputStream.on('error', function(error){
				next(error); //does this work?
			});
		}
	});
	req.form.on('', function(bytesReceived, bytesExpected){
		//blub
	});
});
app.listen(3000);
console.log('Port: ' + app.address().port);
