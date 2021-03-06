var mRldcIdsArray = [];
var grid; //The cell grid object.
document.onreadystatechange = function () {
    if (document.readyState == "interactive") {

    } else if (document.readyState == "complete") {
        onDomComplete();
    }
};
function onDomComplete() {
    getDisplayCodes();
}


function getDisplayCodes() {
	//create data for grid
	var data = [];
	for(var i= 0 ;i<96;i++){
		data.push({"blk":i+1, "netschedule":0, "ramp":70, "rrasup":0,"rrasdown":0, "newnetschedule":0, "rrasupRes":0,"rrasdownRes":0});
	}
	grid = setUpGrid(data);
}

function rrasSolve(){
	var data = grid.getData();
	data[0]["newnetschedule"] = Number(data[0]["netschedule"]);
	data[0]["rrasdownRes"] = Number(data[0]["rrasdown"]);
	data[0]["rrasupRes"] = Number(data[0]["rrasup"]);
	for(var i= 1;i<96;i++){
		//block = i+1;
		var netschprev = Number(data[i-1]["newnetschedule"]);
		var netsch = Number(data[i]["netschedule"]);
		var rrasup = Number(data[i]["rrasup"]);
		var rrasdown = Number(data[i]["rrasdown"]);
		var ramp = Number(data[i]["ramp"]);
		var ramped = netsch - netschprev;
		var ismodified;
		//copy input values
		data[i]["newnetschedule"] = Number(data[i]["netschedule"]);
		data[i]["rrasdownRes"] = Number(data[i]["rrasdown"]);
		data[i]["rrasupRes"] = Number(data[i]["rrasup"]);
		if(Math.abs(ramped) > ramp){			
			//violated rows
			if(ramped>0){
				//possitive ramping issue or rras up issue
				//reduce rras up by ramped-ramp
				ismodified = false;
				
				if(rrasup - ramped + ramp > 0 && !(rrasup==0 && Number(data[i-1]["rrasupRes"])==0)){
					ismodified = true;
					data[i]["rrasupRes"] = rrasup - ramped + ramp; //example ramp = 70; ramped = 80
				} else if(!(rrasdown==0 && Number(data[i-1]["rrasdown"])==0)){
					ismodified = true;
					data[i]["rrasdownRes"] = Number(data[i-1]["rrasdownRes"]) - ramp;
				}
				if(ismodified){
					data[i]["newnetschedule"] = Number(data[i]["netschedule"]) - ramped + ramp;
				}
			}else{
				//negative ramping issue or rras down issue
				//increase rras down by ramped-ramp
				ismodified = false;
				
				if(rrasdown + ramped + ramp > 0 && !(rrasdown==0 && Number(data[i-1]["rrasdownRes"])==0)){
					data[i]["rrasdownRes"] = rrasdown + ramped + ramp; //example ramp = 70; ramped = -100
					ismodified = true;
				}else if(!(rrasup==0 && Number(data[i-1]["rrasup"])==0)){
					data[i]["rrasupRes"] = data[i-1]["rrasup"] - ramp; //example ramp = 70; ramped = -100
					ismodified = true;
				}
				if(ismodified){
					data[i]["newnetschedule"] = Number(data[i]["netschedule"]) - ramped - ramp;
				}
			}
		}
	}
	grid.setData(data);
	//grid.invalidateRows();
	grid.render();
}