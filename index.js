var genNames = [];

var resAIArray = [];
var resOBArray = [];
var resSCHArray = [];
var resRDNArray = [];
var resRUPArray = [];
var resTNArray = [];

var rrasUpVals = [];
var rrasDownVals = [];
var schVals = [];
var dcVals = [];
var tmVals = [];
var rUpVals = [];
var rDnVals = [];

var fileIterator = 0;
var filesArray = [];

//file reader feature
window.onload = function () {
    var fileInput = document.getElementById('fileInput');
    var fileDisplayArea = document.getElementById('fileDisplayArea');
    fileInput.addEventListener('change', function (e) {
        filesArray = [];
        for (var b = 0; b < fileInput.files.length; b++) {
            filesArray.push(fileInput.files[b]);
        }
        fileInput.value = "";
        fileIterator = 0;
        //reset all arrays
        resAIArray = [];
        resOBArray = [];
        resSCHArray = [];
        resRDNArray = [];
        resRUPArray = [];
        resTNArray = [];
        afterEachRead();
    });
    //readTextFile("file:///C:/Users/Nagasudhir/Documents/WBESWareHousing/schedules/cgpl-isgs.js");
};

//file reader feature
function loadNext() {
    filesArray[fileIterator] = null;
    fileIterator = fileIterator + 1;
    if (fileIterator < filesArray.length) {
        afterEachRead();
    }
}

//file reader feature
function afterEachRead() {
    var reader = new FileReader();
    var file = filesArray[fileIterator];
    if (file.name.includes("WRAI")) {
        //var reader = new FileReader();
        reader.onload = function (e) {
            resAIArray = CSVToArray(reader.result);
            //fileDisplayArea.innerText = reader.result;
            //do something with the text here
            console.log("The parsed file is ");
            console.log(resAIArray);
            //get the options for drop down
            genNames = [];
            for (var i = 1; i < resAIArray.length; i++) {
                genNames.push(resAIArray[i][0]);
            }
            var unique = genNames.filter(function (elem, index, self) {
                return index == self.indexOf(elem) && elem.trim() != "";
            });
            genNames = unique;
            console.log(genNames);
            populateSelect(genNames, document.getElementById('gen_select'));
            loadNext();
        };
        reader.readAsText(file);
    } else if (file.name.includes("WRIDCOB")) {
        //var reader = new FileReader();
        reader.onload = function (e) {
            resOBArray = CSVToArray(reader.result);
            //fileDisplayArea.innerText = reader.result;
            loadNext();
        };
        reader.readAsText(file);
    } else if (file.name.includes("WRISCH")) {
        //var reader = new FileReader();
        reader.onload = function (e) {
            resSCHArray = CSVToArray(reader.result);
            //fileDisplayArea.innerText = reader.result;
            loadNext();
        };
        reader.readAsText(file);
    } else if (file.name.includes("WRRDN")) {
        //var reader = new FileReader();
        reader.onload = function (e) {
            resRDNArray = CSVToArray(reader.result);
            //fileDisplayArea.innerText = reader.result;
            loadNext();
        };
        reader.readAsText(file);
    } else if (file.name.includes("WRRUP")) {
        //var reader = new FileReader();
        reader.onload = function (e) {
            resRUPArray = CSVToArray(reader.result);
            //fileDisplayArea.innerText = reader.result;
            loadNext();
        };
        reader.readAsText(file);
    } else if (file.name.includes("WRTN")) {
        //var reader = new FileReader();
        reader.onload = function (e) {
            resTNArray = CSVToArray(reader.result);
            //fileDisplayArea.innerText = reader.result;
            loadNext();
        };
        reader.readAsText(file);
    }
    loadNext();
}

//not needed and does not work in computer
function readTextFile(file) {
    var fileDisplayArea = document.getElementById('fileDisplayArea');
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                fileDisplayArea.innerText = allText
            }
        }
    };
    rawFile.send(null);
}

//for UI
function populateSelect(genNms, genSelEl) {
    genSelEl.innerHTML = '';
    for (var i = 0; i < genNms.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = genNms[i];
        opt.value = genNms[i];
        genSelEl.appendChild(opt);
    }
}

//for algorithm
function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i + 1)) != -1) {
        indexes.push(i);
    }
    return indexes;
}

//for algorithm
function getGenVals() {
    rrasDownVals = [];
    rrasUpVals = [];
    var gen = document.getElementById('gen_select').options[document.getElementById('gen_select').selectedIndex].value;
    //search for generator in array of rrras
    var leftCol = [];
    for (var i = 0; i < resAIArray.length; i++) {
        leftCol.push(resAIArray[i][0]);
    }
    var rrasUpDnRows = getAllIndexes(leftCol, gen);
    for (var i = 0; i < rrasUpDnRows.length; i++) {
        if (resAIArray[rrasUpDnRows[i]][1] == "DOWN") {
            for (var k = 0; k < 96 && resAIArray[rrasUpDnRows[i]]; k++) {
                rrasDownVals.push(resAIArray[rrasUpDnRows[i]][k + 2]);
            }
        } else if (resAIArray[rrasUpDnRows[i]][1] == "UP") {
            for (var k = 0; k < 96 && resAIArray[rrasUpDnRows[i]]; k++) {
                rrasUpVals.push(resAIArray[rrasUpDnRows[i]][k + 2]);
            }
        }
    }
    //search for generator in array of schedule
    leftCol = [];
    for (var i = 0; i < resSCHArray.length; i++) {
        leftCol.push(resSCHArray[i][0]);
    }
    var schRows = getAllIndexes(leftCol, gen);
    schVals = [];
    for (var k = 0; k < 96 && resSCHArray[schRows[0]]; k++) {
        schVals.push(resSCHArray[schRows[0]][k + 1]);
    }
    //search for generator in array of onBarDC
    leftCol = [];
    for (var i = 0; i < resOBArray.length; i++) {
        leftCol.push(resOBArray[i][0]);
    }
    var dcRows = getAllIndexes(leftCol, gen);
    dcVals = [];
    for (var k = 0; k < 96 && resOBArray[dcRows[0]]; k++) {
        dcVals.push(resOBArray[dcRows[0]][k + 1]);
    }
    //search for generator in array of Technical Minimum
    leftCol = [];
    for (var i = 0; i < resTNArray.length; i++) {
        leftCol.push(resTNArray[i][0]);
    }
    var tmRows = getAllIndexes(leftCol, gen);
    tmVals = [];
    for (var k = 0; k < 96 && resTNArray[tmRows[0]]; k++) {
        tmVals.push(resTNArray[tmRows[0]][k + 1]);
    }
    //search for generator in array of Ramp Up
    leftCol = [];
    for (var i = 0; i < resRUPArray.length; i++) {
        leftCol.push(resRUPArray[i][0]);
    }
    var rUpRows = getAllIndexes(leftCol, gen);
    rUpVals = [];
    for (var k = 0; k < 96 && resRUPArray[rUpRows[0]]; k++) {
        rUpVals.push(resRUPArray[rUpRows[0]][k + 1]);
    }
    //search for generator in array of Ramp Down
    leftCol = [];
    for (var i = 0; i < resRDNArray.length; i++) {
        leftCol.push(resRDNArray[i][0]);
    }
    var rDnRows = getAllIndexes(leftCol, gen);
    rDnVals = [];
    for (var k = 0; k < 96 && resRDNArray[rDnRows[0]]; k++) {
        rDnVals.push(resRDNArray[rDnRows[0]][k + 1]);
    }
    console.log("rrasUpVals");
    console.log(rrasUpVals);
    console.log("rrasDownVals");
    console.log(rrasDownVals);
    console.log("schVals");
    console.log(schVals);
    console.log("dcVals");
    console.log(dcVals);
    console.log("tmVals");
    console.log(tmVals);
    console.log("rUpVals");
    console.log(rUpVals);
    console.log("rDnVals");
    console.log(rDnVals);
}

function fillGenVals() {
    var data = mGrid.getData();
    data = arrToGridColTransform(data, dcVals, "dc");
    data = arrToGridColTransform(data, schVals, "netschedule");
    data = arrToGridColTransform(data, rrasUpVals, "rrasup");
    data = arrToGridColTransform(data, rrasDownVals, "rrasdown");
    data = arrToGridColTransform(data, rUpVals, "ramp");
    data = arrToGridColTransform(data, tmVals, "techmin");
    mGrid.setData(data);
    mGrid.render();
}

function arrToGridColTransform(gridData, arrVals, gridColName) {
    //fill the arrVals if present
    for (var i = 0; i < arrVals.length; i++) {
        gridData[i][gridColName] = arrVals[i];
    }
    return gridData;
}
