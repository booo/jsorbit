var drawCircle = function(x,y,r,ctx,fill,color) {
    ctx.beginPath();
    ctx.arc(x,y,r,0,2*Math.PI,false);
    if(fill) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
    ctx.strokeStyle = color || 'black';
    ctx.closePath();
};

var draw = function(sat, start, end, deltaT) {
    var canvas = document.getElementById('space');
    if(canvas.getContext) {
        var scale = (canvas.width/2 -50)/ sat.a;
        var ctx = canvas.getContext('2d');
        var xCenter = canvas.width/2;
        var yCenter = canvas.height/2;
        //draw size of a
        ctx.fillText('Große Halbachse in Metern: '+sat.a,20,20);

        //draw major and minor axis
        ctx.moveTo(xCenter,yCenter);
        ctx.lineTo(xCenter-sat.a*scale,yCenter);
        ctx.stroke();
        ctx.moveTo(xCenter,yCenter);
        ctx.lineTo(xCenter+sat.a*scale,yCenter);
        ctx.stroke();
        ctx.moveTo(xCenter,yCenter);
        ctx.lineTo(xCenter,yCenter+sat.b*scale);
        ctx.stroke();
        ctx.moveTo(xCenter,yCenter);
        ctx.lineTo(xCenter,yCenter-sat.b*scale);
        ctx.stroke();
        //done drawing major and minor axis
        //true circle
        drawCircle(xCenter,yCenter,sat.a*scale,ctx,false);
        var xEarth = xCenter + sat.a*scale*sat.tle.eccentricity;
        var yEarth = yCenter;
        //draw earth
        drawCircle(xEarth,yEarth,sat.earthModel.r*scale,ctx,false);
        //ellipse
        //drawEllipse(xCenter,yCenter,a/scale,b/scale,ctx);
        //
        //main loop for drawing
        var date = start;
        while (date.getTime() <= end.getTime()) {
            //console.log("TLE time: " + sat.createDateFromTLE());
            //console.log("time: " + start);
            //conpute E with observation time and given time
            var data = document.getElementById('data');
            var E = sat.E(sat.createDateFromTLE(),date);
            //console.log("E: " + E);
            //compute true anomaly
            var wA = sat.wA(E);
            //var wA = E;
            console.log("wA: " + (wA*180/sat.earthModel.pi)%360);
            ctx.beginPath();
            ctx.moveTo(xEarth, yEarth);
            var r = sat.r(E);
            console.log("Radius Vektor: " + r);
            data.innerHTML = data.innerHTML + date.getUTCHours() + ':'  + date.getUTCMinutes() + ':' + date.getUTCSeconds() + ' ' + Math.round(wA *180/sat.earthModel.pi * 1000000) / 1000000 + ' ' + Math.round(r*1000)/1000000 + '<br>';
            //var r = sat.a;
            //console.log("scaled r: " + r*scale);
            //console.log("Math.cos(wA): " + Math.cos(wA));
            //compute x of satellite and scale x to fit on screen
            var xSat = Math.cos(wA)*r*scale;
            //console.log("xSat: " + xSat);
            var scaledR = r*scale;
            //compute y coordinat of satellite and scale y to fit on screen
            var ySat = Math.sin(wA) * scaledR;
            //console.log("ySat: " + ySat);
            //alert(ySat);
            //model.ex*a/scale + Math.cos(wA)*scaledR;
            //draw satellite on given position
            if(date === start || date.getTime == end.getTime()) {
                drawCircle(xEarth+xSat,yEarth+ySat,5,ctx,false,'red');
            } else {
                drawCircle(xEarth+xSat,yEarth+ySat,5,ctx,false);
            }
            ctx.stroke();
            //move given time by 5 minutes
            date = new Date(date.getTime()+1000*60*deltaT);
        }

    } else {
        alert('Sorry your browser does not support canvas...');
    }
};
//Model of the earth with some parameters defined
var EarthModel = function() {
    this.m = 398600*1000*1000*1000; //mueh erde in m^3/s^2
    this.r = 6378.14*1000; //earth radius in meter
    this.pi = 3.14159265358979;
    this.j2 = 0.00108263;
};

//function invoked when submiting the form
//check for valid input and start the computation and the drawing
var validateInput = function(form) {
   var startDate, endDate, deltaT;
    try {
        startDate = new Date(form.startTime.value);
        endDate = new Date(form.endTime.value);
        deltaT = form.delta.value;
    }
    catch (e) {
        alert('Please check your input!');
    }
    var sat = new Satellite(norad, new EarthModel());
    draw(sat, startDate, endDate, deltaT);
};


EarthModel.prototype.toString = function() {
    return "";
};

var Satellite = function(tle, earthModel) {
    this.tle = tle;
    this.earthModel = earthModel;
    this.T = 86400/this.tle.meanMotion;
    console.log("Orbital period: " + this.T);
    this.tle.inclination = this.tle.inclination*this.earthModel.pi/180;
    console.log(this.tle.inclination);
    this.tle.meanAnomaly = this.tle.meanAnomaly*this.earthModel.pi/180;
    this.a = this.newtonA(); //major axis in meter
    this.b = Math.sqrt(Math.pow(this.a,2) - Math.pow(this.tle.eccentricity*this.a,2)); //minor axis in meter
};

Satellite.prototype.toString = function() {
    return "My Earth: " + this.mErde + " m^3/s^2\n"
    + "Earth radius: " + this.rErde + "m\n"
    + "J2: " + this.j2 + "\n"
    + "PI: " + this.pi + "\n"
    + "Inclination: " + this.i + "°\n"
    + "Mean motion: " + this.N + " Revs./d\n"
    + "Orbital period: " + this.T + "s\n"
    + "Numeric eccentricity: " + this.ex + "\n"
    + "Starting a0: " + this.a0 + " m\n";
};
Satellite.prototype.n = function(a) {
    //console.log(3/2 * this.j2);
    //console.log(3/2 * this.j2 * Math.pow(this.rErde/a,2));
	var rest = (1 + (3/2) * this.earthModel.j2 * Math.pow(this.earthModel.r/a,2) * Math.pow(1-Math.pow(this.tle.eccentricity,2),-3/2) * (1 - (3/2) * Math.pow(Math.sin(this.tle.inclination),2)));
    return Math.sqrt(this.earthModel.m/Math.pow(a,3)) * rest;
};

Satellite.prototype.ableitung = function(a) {
    var sqrMy = Math.sqrt(this.earthModel.m);
    console.log("sqrMy: " + sqrMy);
    var x = sqrMy * (-1.5) * Math.pow(a,(-2.5)); //small
    var y = sqrMy * (-3.5) * Math.pow(a,(-4.5)); //smaller
    var z = 1.5 * this.earthModel.j2 * Math.pow(this.earthModel.r,2); //great number
    var z2 = 1 - Math.pow(this.tle.eccentricity,2); //near 1
    console.log("z2: " + z2);
    z2 = Math.pow(z2,-1.5); //near 1.0000000555423xfasdf
    z3 = 1 - (3/2) * Math.sin(Math.pow(this.tle.inclination,2));
    console.log("e: " + this.tle.eccentricity);
    console.log("sqrMy: " + sqrMy);
    console.log("x: " + x);
    console.log("y: " + y);
    console.log("z: " + z);
    console.log("z2: " + z2);
    console.log("z3: " + z3);
    var result = x + y * (z * z2 * z3);
    return result;
	/*return Math.sqrt(this.earthModel.m) * (-1.5) * Math.pow(a,-2.5)
		+ Math.sqrt(this.earthModel.m) * (-3,5) * Math.pow(a,-4.5)
		* (1.5 * this.earthModel.j2 * Math.pow(this.earthModel.r,2) * Math.pow(1-Math.pow(this.tle.eccentricity,2),-1.5) * (1 - (3/2) * Math.sin(this.tle.inclination)* Math.sin(this.tle.inclination)));*/
};

Satellite.prototype.newtonA = function(){

	var ai1 = Math.pow(this.earthModel.m*Math.pow(this.T/(2*this.earthModel.pi),2),1/3); //calculate a0 here!
    console.log("a0: " + ai1);
	do {
		var ai = ai1;
        console.log("ai: " + ai);
        console.log("n(ai): " +  this.n(ai));
       // console.log("n(ai) - N-Norad: " + (this.n(ai) - this.N));
        var nNorad = this.tle.meanMotion*Math.PI*2/86400; //important!!!
        console.log("N-Norad: " + nNorad);
        console.log("N(ai) - nNorad: " + (this.n(ai) - nNorad));
        console.log("ableitung(ai): " + this.ableitung(ai));
        console.log("dnai/dai: " + (this.n(ai)-nNorad)/this.ableitung(ai));
		ai1 = ai - ((this.n(ai)-nNorad) / this.ableitung(ai));
        //console.log("ai1: " + ai1);
        console.log("Math.abs(ai1 - ai): " + Math.abs(ai1 - ai));
	} while(Math.abs(ai1 - ai) > Math.pow(10,-6) )
    return ai1;
};

Satellite.prototype.E = function(observationTime, now) {
       // var MStart = this.M + this.N/86400 * 2011 Day 101 0.94525849
       //console.log('mean anomaly:  + this.tle.meanAnomaly);
       //console.log("mean motion: " + this.tle.meanMotion)
       //console.log('now.getTime() - observationTime.getTime(): ' + (now.getTime() - observationTime.getTime())/1000 )
       //console.log("blub: " + this.tle.meanMotion*((now.getTime() - observationTime())/1000));
    console.log("now: " + now);
    console.log("observationTIme: " + observationTime);
    //console.log('mean anomaly from tle: ' + this.tle.meanAnomaly*180/this.earthModel.pi % 360);
    var deltaT = (now - observationTime)/1000;
    console.log("deltaT: " + deltaT);


    var meanMotion = (this.tle.meanMotion/86400) * Math.PI*2;
    var deltaMeanAnomaly = meanMotion * deltaT;

    console.log("deltaMeanAnomaly: " + deltaMeanAnomaly);

    var MStart = this.tle.meanAnomaly + deltaMeanAnomaly;

       //console.log("mean anomaly at now: " + (this.earthModel.pi*2)/this.T * (now.getTime()-observationTime.getTime())/1000)*180/this.earthModel.pi;
       var ei1 = MStart;
       var ei;
       do {

           ei = ei1;
           ei1 = ei - (ei - MStart - this.tle.eccentricity* Math.sin(ei))/(1-this.tle.eccentricity*Math.cos(ei));
       } while (Math.abs(ei1 - ei) > Math.pow(10,-6));
       return ei1;

};

Satellite.prototype.createDateFromTLE = function() {
    var date = new Date("APRIL 11, 2011 22:41:10 UTC");
    console.log(date);
    date = new Date("JANUAR 01, 2011 00:00:00 UTC");
    //TODO check this for correctness DONE ?
    date = new Date(date.getTime() + 1000*(this.tle.epochDay-1)*86400);
    console.log(date);
    return date;
};

Satellite.prototype.wA = function(E) {
    return Math.atan(Math.sqrt(1+this.tle.eccentricity)/Math.sqrt(1-this.tle.eccentricity) * Math.tan(E/2)) * 2;
}

Satellite.prototype.r = function(E) {
    //console.log("blub: " + a*(1-Math.pow(this.ex,2))/(1+this.ex * Math.cos(this.wA(E))));
    var r = this.a*(1-Math.pow(this.tle.eccentricity,2))/(1+this.tle.eccentricity*Math.cos(this.wA(E)));
    return r;
};
