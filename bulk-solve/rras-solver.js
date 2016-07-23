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
        var solvedConsolidatedRRAS = {};
        if (this.resADArray == null || this.resADArray.length == 0) {
            this.resADArray = this.resAIArray;
        }
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
            var solvedGenRRAS = applyRRASAlgorithm(this.rrasUpVals, this.rrasDownVals, this.nldcRRASUpVals, this.nldcRRASDownVals, this.schVals, this.dcVals, this.tmVals, this.rUpVals, this.rDnVals, considerBlk, solveBlk);
            solvedConsolidatedRRAS[gen] = {};
            solvedConsolidatedRRAS[gen]['UP'] = solvedGenRRAS.solvedRRASUp;
            solvedConsolidatedRRAS[gen]['DOWN'] = solvedGenRRAS.solvedRRASDown;
            solvedConsolidatedRRAS[gen]['RRASUPFlags'] = solvedGenRRAS.RRASUPFlags;
            solvedConsolidatedRRAS[gen]['RRASDNFlags'] = solvedGenRRAS.RRASDNFlags;
            solvedConsolidatedRRAS[gen]['RRASTMFlags'] = solvedGenRRAS.RRASTMFlags;
            solvedConsolidatedRRAS[gen]['RRASDCFlags'] = solvedGenRRAS.RRASDCFlags;
        }
        console.log("The consolidated solved RRAS values are ");
        console.log(solvedConsolidatedRRAS);
        return solvedConsolidatedRRAS;
    }

    function getBlkNumber(blk) {
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
        considerBlk = getBlkNumber(considerBlk);
        solveBlk = getBlkNumber(solveBlk);
        //From schedule and RRAS get the current isgs schedule without RRAS [ISGS = Net Schedule - RRAS]
        var isgsVals = [];
        for (var i = 0; i < schVals.length; i++) {
            isgsVals[i] = Number(schVals[i]) - Number(rrasUpVals[i]) + Number(rrasDownVals[i]);
        }
        var newRRASUp = [];
        var newRRASDown = [];
        var solvedRRASUp = [];
        var solvedRRASDown = [];
        var RRASUPFlags = [];
        var RRASDNFlags = [];
        var RRASTMFlags = [];
        var RRASDCFlags = [];
        var newSchVals = [];
        //if consider block = 3, then the index of array will be 2. Example rrasUpVals[2] for block 3
        //Till considerBlk - 1, copy the old RRASUP, old RRASDN values directly into the new RRASUP, RRASDN columns
        for (var i = 0; i < considerBlk - 2; i++) {
            newRRASUp[i] = Number(rrasUpVals[i]);
            newRRASDown[i] = Number(rrasDownVals[i]);
        }
        //From considerBlk, copy the NLDC RRASUP, NLDC RRASDN values into the new RRASUP, RRASDN columns
        for (var i = considerBlk - 1; i < 96; i++) {
            newRRASUp[i] = Number(nldcRRASUpVals[i]);
            newRRASDown[i] = Number(nldcRRASDownVals[i]);
        }
        //initialize solved RRAS as new RRAS
        for (var i = 0; i < 96; i++) {
            solvedRRASUp[i] = newRRASUp[i];
            solvedRRASDown[i] = newRRASDown[i];
        }
        //Till solveBlk-1, copy the implemented or old net schedule values into the  newNetSchedule column directly
        for (var i = 0; i < solveBlk - 2; i++) {
            newSchVals[i] = schVals[i];
        }
        //From solveBlk start solving the constraints rampup, rampdown --- schedule<techmin, schedule>dc --- following RRAS trend, in the increasing order of priority from left to right. Tip - Solve the least priority constraint first and then the most priority constraint next
        for (var i = (solveBlk - 1 > 0) ? solveBlk - 1 : 1; i < 96; i++) {
            var solvedBlkRRAS = solveRRASBlkConstraints(isgsVals[i], isgsVals[i - 1], newRRASUp[i], solvedRRASUp[i - 1], newRRASDown[i], solvedRRASDown[i - 1], Number(rUpVals[i]), Number(rDnVals[i]), Number(dcVals[i]), Number(tmVals[i]));
            solvedRRASUp[i] = solvedBlkRRAS.solvedRRASUp;
            solvedRRASDown[i] = solvedBlkRRAS.solvedRRASDown;
            RRASUPFlags[i] = solvedBlkRRAS.RUPFlag;
            RRASDNFlags[i] = solvedBlkRRAS.RDNFlag;
            RRASTMFlags[i] = solvedBlkRRAS.TMFlag;
            RRASDCFlags[i] = solvedBlkRRAS.DCFlag;
        }
        //return the solved RRASUP and solved RRASDOWN in all blocks of the generator
        return {
            solvedRRASUp: solvedRRASUp,
            solvedRRASDown: solvedRRASDown,
            RRASUPFlags: RRASUPFlags,
            RRASDNFlags: RRASDNFlags,
            RRASTMFlags: RRASTMFlags,
            RRASDCFlags: RRASDCFlags
        };
    }

    function trendConstraintSolve(val, change, prevVal) {
        var result;
        result = val;
        if (change) {
            result = val + change;
        }
        if (prevVal != null) {
            //follow trend => val <= max(val, prevVal)
            result = (result > Math.max(val, prevVal)) ? Math.max(val, prevVal) : result;
        }
        result = (result < 0) ? 0 : result;
        return result;
    }

    /*
     //tests
     console.log(trendConstraintSolve(70, -80, 140) == 0);
     console.log(trendConstraintSolve(70, 30, 140) == 100);
     console.log(trendConstraintSolve(70, -30, 140) == 40);
     console.log(trendConstraintSolve(70, 80, 140) == 140);
     */

    function solveRRASBlkConstraints(isgsVal, isgsValPrev, newRRASUp, newRRASUpPrev, newRRASDown, newRRASDownPrev, rUpVal, rDnVal, dcVal, tmVal) {
        var RUPFlag = false;
        var RDNFlag = false;
        var TMFlag = false;
        var DCFlag = false;

        var solvedRRASUp = newRRASUp;
        var solvedRRASDown = newRRASDown;

        var unsolvedNetSchedule = isgsVal + newRRASUp - newRRASDown;
        var netSchedulePrev = isgsValPrev + newRRASUpPrev - newRRASDownPrev;
        var ramped = unsolvedNetSchedule - netSchedulePrev;
        //RampedUp > RampSpecified --- #Constraint1
        if (ramped > 0 && ramped > rUpVal) {
            //example --- ramped = 80;rUpVal = 70
            RUPFlag = true;
            //Decrease RRASUP by difference provided that value>=0 and follows trend
            solvedRRASUp = trendConstraintSolve(solvedRRASUp, -1 * (ramped - rUpVal), newRRASUpPrev);
            //update the values now
            ramped = isgsVal + solvedRRASUp - solvedRRASDown;
            //If the problem persists
            if (ramped > 0 && ramped > rUpVal) {
                //Increase RRASDN by difference provided that value>=0 and follows trend
                solvedRRASDown = trendConstraintSolve(solvedRRASDown, ramped - rUpVal, newRRASDownPrev);
                //update the values now
                ramped = isgsVal + solvedRRASUp - solvedRRASDown;
            }
        } else if (ramped < 0 && ramped < -rDnVal) { //RampedDown < RampSpecified --- #Constraint2
            //example --- ramped = -80;rDnVal = 70
            RDNFlag = true;
            //Decrease RRASDN by difference provided that value>=0 and follows trend
            solvedRRASDown = trendConstraintSolve(solvedRRASDown, ramped + rDnVal, newRRASDownPrev);
            //update the values now
            ramped = isgsVal + solvedRRASUp - solvedRRASDown;
            //If the problem persists
            if (ramped < 0 && ramped < -rDnVal) {
                //Increase RRASUP by difference provided that value>=0 and follows trend
                solvedRRASUp = trendConstraintSolve(solvedRRASUp, -ramped - rDnVal, newRRASUpPrev);
                //update the values now
                ramped = isgsVal + solvedRRASUp - solvedRRASDown;
            }
        }
        //NewNetSchedule < Tech Min --- #Constraint3
        if (isgsVal + solvedRRASUp - solvedRRASDown < tmVal) {
            TMFlag = true;
            //Decrease RRASDN by difference provided that value>=0 and follows trend
            solvedRRASDown = trendConstraintSolve(solvedRRASDown, isgsVal + solvedRRASUp - solvedRRASDown - tmVal, newRRASDownPrev);
            //Not needed to increase RRASUP for this constraint
        }
        //NewNetSchedule > DC --- #Constraint4
        if (isgsVal + solvedRRASUp - solvedRRASDown > dcVal) {
            DCFlag = true;
            //Decrease RRASUP by difference provided that value>=0 and follows trend
            solvedRRASUp = trendConstraintSolve(solvedRRASUp, dcVal - isgsVal - solvedRRASUp + solvedRRASDown, newRRASUpPrev);
            //Not needed to increase RRASDOWN for this constraint
        }
        //TODO detect if the rras changed after solving and use this data for presenting the solved RRAS values in color
        return {
            solvedRRASUp: solvedRRASUp,
            solvedRRASDown: solvedRRASDown,
            RUPFlag: RUPFlag,
            RDNFlag: RDNFlag,
            TMFlag: TMFlag,
            DCFlag: DCFlag
        };
    }
}