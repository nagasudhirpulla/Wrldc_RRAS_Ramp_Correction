"use strict";

function RRASsolver() {
    this.genNames = [];

    this.resAIArray = [];
    this.resOBArray = [];
    this.resSCHArray = [];
    this.resRDNArray = [];
    this.resRUPArray = [];
    this.resTNArray = [];
    this.resADArray = [];

    this.rrasUpVals = [];
    this.rrasDownVals = [];
    this.schVals = [];
    this.dcVals = [];
    this.tmVals = [];
    this.rUpVals = [];
    this.rDnVals = [];
    this.nldcRRASUpVals = [];
    this.nldcRRASDownVals = [];

    this.fileIterator = 0;
    this.filesArray = [];

    this.resetAndCreateArrays = resetAndCreateArrays.bind(this);
    this.pushFiles = pushFiles.bind(this);
    this.afterEachRead = afterEachRead.bind(this);
    this.loadNext = loadNext.bind(this);


    this.solve = solve.bind(this);

    function pushFiles(newFile) {
        this.filesArray.push(newFile);
    }

    function resetAndCreateArrays() {
        this.fileIterator = 0;
        this.filesArray = [];
        //reset all arrays
        this.resAIArray = [];
        this.resOBArray = [];
        this.resSCHArray = [];
        this.resRDNArray = [];
        this.resRUPArray = [];
        this.resTNArray = [];
        //A special case scenario since this file may not be present at the location of all scheduling files
        //this.resADArray = [];
    }


    //file reader feature
    function loadNext() {
        this.filesArray[this.fileIterator] = null;
        this.fileIterator = this.fileIterator + 1;
        if (this.fileIterator < this.filesArray.length) {
            this.afterEachRead();
        }
    }

    //file reader feature
    function afterEachRead() {
        var reader = new FileReader();
        var file = this.filesArray[this.fileIterator];
        if (file.name.includes("WRAI")) {
            //var reader = new FileReader();
            reader.onload = function (e) {
                this.resAIArray = CSVToArray(reader.result);
                //fileDisplayArea.innerText = reader.result;
                //do something with the text here
                console.log("The parsed ancillary file is ");
                console.log(this.resAIArray);
                //get the options for drop down
                this.genNames = [];
                for (var i = 1; i < this.resAIArray.length; i++) {
                    this.genNames.push(this.resAIArray[i][0]);
                }
                var unique = this.genNames.filter(function (elem, index, self) {
                    return index == self.indexOf(elem) && elem.trim() != "";
                });
                this.genNames = unique;
                console.log("The generator names are");
                console.log(this.genNames);
                //populateSelect(this.genNames, document.getElementById('gen_select'));
                this.loadNext();
            }.bind(this);
            reader.readAsText(file);
        } else if (file.name.includes("WRIDCOB")) {
            //var reader = new FileReader();
            reader.onload = function (e) {
                this.resOBArray = CSVToArray(reader.result);
                //fileDisplayArea.innerText = reader.result;
                this.loadNext();
            }.bind(this);
            reader.readAsText(file);
        } else if (file.name.includes("WRISCH")) {
            //var reader = new FileReader();
            reader.onload = function (e) {
                this.resSCHArray = CSVToArray(reader.result);
                //fileDisplayArea.innerText = reader.result;
                this.loadNext();
            }.bind(this);
            reader.readAsText(file);
        } else if (file.name.includes("WRRDN")) {
            //var reader = new FileReader();
            reader.onload = function (e) {
                this.resRDNArray = CSVToArray(reader.result);
                //fileDisplayArea.innerText = reader.result;
                this.loadNext();
            }.bind(this);
            reader.readAsText(file);
        } else if (file.name.includes("WRRUP")) {
            //var reader = new FileReader();
            reader.onload = function (e) {
                this.resRUPArray = CSVToArray(reader.result);
                //fileDisplayArea.innerText = reader.result;
                this.loadNext();
            }.bind(this);
            reader.readAsText(file);
        } else if (file.name.includes("WRTN")) {
            //var reader = new FileReader();
            reader.onload = function (e) {
                this.resTNArray = CSVToArray(reader.result);
                //fileDisplayArea.innerText = reader.result;
                this.loadNext();
            }.bind(this);
            reader.readAsText(file);
        } else if (file.name.includes("WRAD")) {
            //var reader = new FileReader();
            reader.onload = function (e) {
                this.resADArray = CSVToArray(reader.result);
                //fileDisplayArea.innerText = reader.result;
                this.loadNext();
            }.bind(this);
            reader.readAsText(file);
        }
        this.loadNext();
    }

    //for algorithm
    function getAllLeftColIndexes(twoDArray, val) {
        var arr = [];
        for (var i = 0; i < twoDArray.length; i++) {
            arr.push(twoDArray[i][0]);
        }
        var indexes = [], i = -1;
        while ((i = arr.indexOf(val, i + 1)) != -1) {
            indexes.push(i);
        }
        return indexes;
    }

    function solve(considerBlk, solveBlk) {
        for (var t = 0; t < this.genNames.length; t++) {
            //get a generator dc, schedule, rras up down, techmin, rampup, rampdown
            var gen = this.genNames[t];
            //get the generator RRAS up and down values from resAIArray
            var rrasUpDnRows = getAllLeftColIndexes(this.resAIArray, gen);
            for (var i = 0; i < rrasUpDnRows.length; i++) {
                if (this.resAIArray[rrasUpDnRows[i]][1] == "DOWN") {
                    for (var k = 0; k < 96 && this.resAIArray[rrasUpDnRows[i]]; k++) {
                        this.rrasDownVals[k] = this.resAIArray[rrasUpDnRows[i]][k + 2];
                    }
                } else if (this.resAIArray[rrasUpDnRows[i]][1] == "UP") {
                    for (var k = 0; k < 96 && this.resAIArray[rrasUpDnRows[i]]; k++) {
                        this.rrasUpVals[k] = this.resAIArray[rrasUpDnRows[i]][k + 2];
                    }
                }
            }
            //get the generator schedules
            var schRows = getAllLeftColIndexes(this.resSCHArray, gen);
            for (var k = 0; k < 96 && this.resSCHArray[schRows[0]]; k++) {
                this.schVals[k] = this.resSCHArray[schRows[0]][k + 1];
            }
            //get the generator dc values
            var dcRows = getAllLeftColIndexes(this.resOBArray, gen);
            for (var k = 0; k < 96 && this.resOBArray[dcRows[0]]; k++) {
                this.dcVals[k] = this.resOBArray[dcRows[0]][k + 1];
            }
            //get the generator tech minimum values
            var tmRows = getAllLeftColIndexes(this.resTNArray, gen);
            for (var k = 0; k < 96 && this.resTNArray[tmRows[0]]; k++) {
                this.tmVals[k] = this.resTNArray[tmRows[0]][k + 1];
            }
            //get the generator ramp up values
            var rUpRows = getAllLeftColIndexes(this.resRUPArray, gen);
            for (var k = 0; k < 96 && this.resRUPArray[rUpRows[0]]; k++) {
                this.rUpVals[k] = this.resRUPArray[rUpRows[0]][k + 1];
            }
            //get the generator ramp down values
            var rDnRows = getAllLeftColIndexes(this.resRDNArray, gen);
            for (var k = 0; k < 96 && this.resRDNArray[rDnRows[0]]; k++) {
                this.rDnVals[k] = this.resRDNArray[rDnRows[0]][k + 1];
            }
            //get the generator RRAS up and down values from nldc rras array
            var nldcRRASUpDnRows = getAllLeftColIndexes(this.resADArray, gen);
            for (var i = 0; i < nldcRRASUpDnRows.length; i++) {
                if (this.resADArray[nldcRRASUpDnRows[i]][1] == "DOWN") {
                    for (var k = 0; k < 96 && this.resADArray[nldcRRASUpDnRows[i]]; k++) {
                        this.nldcRRASDownVals[k] = this.resADArray[nldcRRASUpDnRows[i]][k + 2];
                    }
                } else if (this.resADArray[nldcRRASUpDnRows[i]][1] == "UP") {
                    for (var k = 0; k < 96 && this.resADArray[nldcRRASUpDnRows[i]]; k++) {
                        this.nldcRRASUpVals[k] = this.resADArray[nldcRRASUpDnRows[i]][k + 2];
                    }
                }
            }
            console.log("Generator " + t + " => " + gen + " --- rrasUpVals");
            console.log(this.rrasUpVals);
            console.log("Generator " + t + " => " + gen + " --- rrasDownVals");
            console.log(this.rrasDownVals);
            console.log("Generator " + t + " => " + gen + " --- nldcRRASUpVals");
            console.log(this.nldcRRASUpVals);
            console.log("Generator " + t + " => " + gen + " --- nldcRRASDownVals");
            console.log(this.nldcRRASDownVals);
            console.log("Generator " + t + " => " + gen + " --- schVals");
            console.log(this.schVals);
            console.log("Generator " + t + " => " + gen + " --- dcVals");
            console.log(this.dcVals);
            console.log("Generator " + t + " => " + gen + " --- tmVals");
            console.log(this.tmVals);
            console.log("Generator " + t + " => " + gen + " --- rUpVals");
            console.log(this.rUpVals);
            console.log("Generator " + t + " => " + gen + " --- rDnVals");
            console.log(this.rDnVals);
            //Now for this generator all the values are available. So we can apply the algorithm on the generator
            applyRRASAlgorithm(this.rrasUpVals, this.rrasDownVals, this.nldcRRASUpVals, this.nldcRRASDownVals, this.schVals, this.dcVals, this.tmVals, this.rUpVals, this.rDnVals, considerBlk, solveBlk);
        }
    }

    function getBlkValue(blk) {
        if (isNaN(blk)) {
            blk = 1;
        } else if (Number(blk) < 1 && Number(blk) > 96) {
            blk = 1;
        } else {
            blk = Number(blk);
        }
        return blk;
    }

    function applyRRASAlgorithm(rrasUpVals, rrasDownVals, nldcRRASUpVals, nldcRRASDownVals, schVals, dcVals, tmVals, rUpVals, rDnVals, considerBlk, solveBlk) {
        considerBlk = getBlkValue(considerBlk);
        solveBlk = getBlkValue(solveBlk);
        //From schedule and RRAS get the current isgs schedule without RRAS [ISGS = Net Schedule - RRAS]
        var isgsVals = [];
        for (var i = 0; i < schVals; i++) {
            isgsVals[i] = schVals[i] - rrasUpVals[i] + rrasDownVals[i];
        }
        var newRRASUp = [];
        var newRRASDown = [];
        var solvedRRASUp = [];
        var solvedRRASDown = [];
        var newSchVals = [];
        //if consider block = 3, then the index of array will be 2. Example rrasUpVals[2] for block 3
        //Till considerBlk - 1, copy the old RRASUP, old RRASDN values directly into the new RRASUP, RRASDN columns
        for (var i = 0; i < considerBlk - 2; i++) {
            newRRASUp[i] = rrasUpVals[i];
            newRRASDown[i] = rrasDownVals[i];
        }
        //From considerBlk, copy the NLDC RRASUP, NLDC RRASDN values into the new RRASUP, RRASDN columns
        for (var i = considerBlk - 1; i < 96; i++) {
            newRRASUp[i] = nldcRRASUpVals[i];
            newRRASDown[i] = nldcRRASDownVals[i];
        }
        //Till solveBlk-1, copy the implemented or old net schedule values into the  newNetSchedule column directly
        for (var i = 0; i < solveBlk - 2; i++) {
            newSchVals[i] = schVals[i];
        }
        //From solveBlk start solving the constraints rampup, rampdown --- schedule<techmin, schedule>dc --- following RRAS trend, in the increasing order of priority from left to right. Tip - Solve the least priority constraint first and then the most priority constraint next
        for (var i = (solveBlk - 1 > 0) ? solveBlk - 1 : 1; i < 96; i++) {
            solveRRASBlkConstraints(isgsVals[i], isgsVals[i - 1], newRRASUp[i], newRRASUp[i - 1], newRRASDown[i], newRRASDown[i - 1], rUpVals[i], rUpVals[i - 1], rDnVals[i], rDnVals[i - 1], dcVals[i], dcVals[i - 1], tmVals[i], tmVals[i - 1]);
        }
    }

    function solveRRASBlkConstraints(isgsVal, isgsValPrev, newRRASUp, newRRASUpPrev, newRRASDown, newRRASDownPrev, rUpVals, rUpValsPrev, rDnVals, rDnValsPrev, dcVals, dcValsPrev, tmVal, tmValPrev) {

    }
}