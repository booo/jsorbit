var fs = require('fs');
var express = require('express');
//read the two line elements from data. data should be a buffer
var parseNoradFile = function(data) {
	var lines = data.toString('utf-8').split("\n");
	var norad = {};
    var i, line;
	for(i=0;i<lines.length;i++) {
		line = lines[i];
		if(i === 0)	{
			norad.name = line;
		}
		else if(i == 1){
			norad.lineNumber        = line.substr(0,1);
			norad.satelliteNumber   = line.substring(2,7);
			norad.classification    = line.substring(7,8);
			norad.lastTowDigitsYear = line.substring(9,11);
			norad.LaunchNumber      = line.substring(11,14);
			norad.pieceOfLaunch     = line.substring(14,17);
			norad.epochYear         = parseFloat(line.substring(18,20));
			norad.epochDay          = parseFloat(line.substring(20,32));
			norad.firstMeanMotion   = line.substring(33,43);
			norad.secondMeanMotion  = line.substring(44,52);
			norad.bstar             = line.substring(53,61);
			norad.numberZero        = line.substring(62,63);
			norad.elementNumber     = line.substring(64,68);
			norad.checksum          = line.substring(68,69);
		}
		else if(i == 2) {
			norad.satelliteNumber = line.substring(2,7);
			norad.inclination     = parseFloat(line.substring(8,16));
			norad.rightAscension  = parseFloat(line.substring(17,25));
			norad.eccentricity    = parseFloat('0.'+line.substring(26,33));
			norad.perigee         = parseFloat(line.substring(34,42));
			norad.meanAnomaly     = parseFloat(line.substring(43,51));
			norad.meanMotion      = parseFloat(line.substring(52,63));
			norad.revolution      = parseFloat(line.substring(63,68));
			norad.checksum2       = line.substring(68,69);
		}
	}
	return norad;
};

var app = express.createServer(
			require('connect-form')({keepExtensions: true})
		);

app.set('view engine', 'jade');
//app.use(express.bodyParser());
app.configure('development', function() {
	app.use(express.static(__dirname + '/static')); //is jslint realy stupid?
});
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
				//res.send(parseNoradFile(data));
				try {
					res.render('satellite',{
						locals : {
							norad : parseNoradFile(data)
						},
						layout : false
					});
				}
				catch(error) {
					next(error);
				}
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
