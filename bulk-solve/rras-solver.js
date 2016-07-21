"use strict";

function RRASsolver() {
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

    function solve() {
        for (var i = 0; i < this.genNames.length; i++) {
            //get a generator dc, schedule, rras up down, techmin, rampup, rampdown
            var gen = genNames[i];

        }
    }
}