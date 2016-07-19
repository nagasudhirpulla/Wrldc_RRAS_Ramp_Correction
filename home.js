var mRldcIdsArray = [];
var mGrid; //The cell grid object.
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
		data.push({"blk":i+1, "netschedule":"0", "ramp":"70", "dc":"0", "techmin":"0", "isgs":"0", "rrasup":"0","rrasdown":"0", "newnetschedule":"0", "rrasupRes":"0","rrasdownRes":"0"});
	}
	mGrid = setUpGrid(data);
}

function rrasSolve(){
	var changes = {};
	var data = mGrid.getData();
	//first strip commas and convert negative values to possitive for net schedule,rras up and down
	for(var i= 0;i<96;i++){
		data[i]["netschedule"] = data[i]["netschedule"].replace(/\,/g,'');
		data[i]["rrasup"] = data[i]["rrasup"].replace(/\,/g,'');
		data[i]["rrasdown"] = data[i]["rrasdown"].replace(/\,/g,'');
		if(Number(data[i]["netschedule"]) < 0){
			data[i]["netschedule"] = -Number(data[i]["netschedule"]);
		}
		if(Number(data[i]["rrasup"]) < 0){
			data[i]["rrasup"] = -Number(data[i]["rrasup"]);
		}
		if(Number(data[i]["rrasdown"]) < 0){
			data[i]["rrasdown"] = -Number(data[i]["rrasdown"]);
		}
	}
	data[0]["newnetschedule"] = Number(data[0]["netschedule"]);
	data[0]["rrasdownRes"] = Number(data[0]["rrasdown"]);
	data[0]["rrasupRes"] = Number(data[0]["rrasup"]);
	for(var i= 0;i<96;i++){
		data[i]["isgs"] = Number(data[i]["netschedule"]) - Number(data[i]["rrasup"]) + Number(data[i]["rrasdown"]);
	}
	for(var i= 1;i<96;i++){
		//block = i+1;
		var rrasup = Number(data[i]["rrasup"]);
		var rrasdown = Number(data[i]["rrasdown"]);
		var netschprev = Number(data[i-1]["newnetschedule"]);
		var netsch = Number(data[i]["isgs"]) + rrasup - rrasdown;
		var ramped = netsch - netschprev;
		var isgsprev = Number(data[i - 1]["isgs"]);
		var isgs = Number(data[i]["isgs"]);
		var ramp = Number(data[i]["ramp"]);
		var ismodified;
		//copy input values
		data[i]["newnetschedule"] = netsch;
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
					//reduce the rras up
				} else if(!(rrasdown==0 && Number(data[i-1]["rrasdown"])==0)){
					ismodified = true;
					data[i]["rrasdownRes"] = Number(data[i]["rrasdownRes"]) + ramped - ramp;
					//increase the rras down
				}
				if(ismodified){
					data[i]["newnetschedule"] = netsch - ramped + ramp;
				}
			}else{
				//negative ramping issue or rras down issue
				//increase rras down by ramped-ramp
				ismodified = false;
				
				if(rrasdown + ramped + ramp > 0 && !(rrasdown==0 && Number(data[i-1]["rrasdownRes"])==0)){
					data[i]["rrasdownRes"] = rrasdown + ramped + ramp; //example ramp = 70; ramped = -100
					ismodified = true;
				}else if(!(rrasup==0 && Number(data[i-1]["rrasup"])==0)){
					data[i]["rrasupRes"] = data[i]["rrasup"] - ramped - ramp; //example ramp = 70; ramped = -100
					ismodified = true;
					//increase the rras up
				}
				if(ismodified){
					data[i]["newnetschedule"] = netsch - ramped - ramp;
				}
			}
		}
		//Now do the schedule>dc check
		//if sch>dc reduce rras up
		if(data[i]["dc"]!=0){//should not neglect
			if(+data[i]["newnetschedule"] > +data[i]["dc"]){
				//we have sch > dc problem
				var diff = +data[i]["newnetschedule"] - data[i]["dc"];
				data[i]["rrasupRes"] = data[i]["rrasupRes"] - diff;
			}
		}
		//if sch<techmin reduce rras down
		if(data[i]["techmin"]!=0){//should not neglect
			if(+data[i]["newnetschedule"] < +data[i]["techmin"]){
				//we have sch < techmin problem
				var diff = +data[i]["techmin"] - data[i]["newnetschedule"];
				data[i]["rrasdownRes"] = data[i]["rrasdownRes"] - diff;
			}
		}
		//In the end if rras up or down are < zero make them zero
		if(data[i]["rrasdownRes"] < 0){
			data[i]["rrasdownRes"] = 0;
		}
		if(data[i]["rrasupRes"] < 0){
			data[i]["rrasupRes"] = 0;
		}
		//correct the newnetschedule after changes
		data[i]["newnetschedule"] = data[i]["isgs"] + data[i]["rrasupRes"] - data[i]["rrasdownRes"];

		//highlight if rras up changed
		if(data[i]["rrasupRes"] != data[i]["rrasup"]){
			if (!changes[i]) {
				changes[i] = {};
			}
			changes[i]["rrasupRes"] = "changed";
		}

		//highlight if rras down changed
		if(data[i]["rrasdownRes"] != data[i]["rrasdown"]){
			if (!changes[i]) {
				changes[i] = {};
			}
			changes[i]["rrasdownRes"] = "changed";
		}
	}
	mGrid.setData(data);
	mGrid.setCellCssStyles("highlight", changes);
	mGrid.render();
	createRRASText();
}

function createRRASText(){
	var rrasUpCpys = [];
	var rrasDnCpys = [];
	var data = mGrid.getData();
	for(var i=0;i<96;i++){
		rrasUpCpys[i] = data[i]["rrasupRes"];
		rrasDnCpys[i] = data[i]["rrasdownRes"];
	}
	var copyStr = "";
	copyStr += rrasUpCpys.join("\t");
	copyStr += "\n";
	copyStr += rrasDnCpys.join("\t");
	console.log("rras copy string is " + copyStr);
	document.getElementById("fileDisplayArea").innerHTML = copyStr;
}
