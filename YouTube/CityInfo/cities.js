function parseLatitude(l){
	//separate degrees
	var deg = l.split("\u00B0");
	
	//separate minutes
	var mins = deg[1].split("\'");

	//separate seconds
	var secs = mins[1].split("\"");

	direction = secs[1];


	//calculating latitude 
	latitude = parseFloat(deg[0]) + parseFloat(mins[0])/60 + parseFloat(secs[0])/(60 * 60);


	if(direction == " N"){
		return latitude;
	} else {
		return latitude * -1;
	}

	
}

function parseLongitude(l){

	//separate degrees
	var deg = l.split("\u00B0");
	
	//separate minutes
	var mins = deg[1].split("\'");

		//separate seconds
	var secs = mins[1].split("\"");

	direction = secs[1];


	//calculating latitude 
	longitude = parseFloat(deg[0]) + parseFloat(mins[0])/60 + parseFloat(secs[0])/(60 * 60);

	if(direction == " E"){
		return longitude;
	} else {
		return longitude * -1;
	}
}





d3.csv("city_data2.csv",function(data){
	cities = {};
	data.forEach(function(d,i){
		city = (d.City).split(":")[0];
		latitude = parseLatitude(d.Latitude);
		longitude = parseLongitude(d.Longitude);
		cities[city] = {latitude : latitude, longitude : longitude};

	});

	blob = new Blob([JSON.stringify(cities)],{type : "text/plain;charset=utf-8"});
	console.log(blob);
	saveAs(blob,"cities2.json");


})