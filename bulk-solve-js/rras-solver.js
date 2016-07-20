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

    this.pushFiles = function (newFile) {
        this.filesArray.push(newFile);
    };

    this.resetAndCreateArrays = function () {
        this.fileIterator = 0;
        //reset all arrays
        this.resAIArray = [];
        this.resOBArray = [];
        this.resSCHArray = [];
        this.resRDNArray = [];
        this.resRUPArray = [];
        this.resTNArray = [];
        this.resADArray = [];
        this.afterEachRead().bind(this);
    };

    //file reader feature
    this.loadNext = function () {
        this.filesArray[this.fileIterator] = null;
        this.fileIterator = this.fileIterator + 1;
        if (this.fileIterator < this.filesArray.length) {
            this.afterEachRead().bind(this);
        }
    };

    //file reader feature
    this.afterEachRead = function () {
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
                this.loadNext().bind(this);
            };
            reader.readAsText(file);
        } else if (file.name.includes("WRIDCOB")) {
            //var reader = new FileReader();
            reader.onload = function (e) {
                this.resOBArray = CSVToArray(reader.result);
                //fileDisplayArea.innerText = reader.result;
                this.loadNext().bind(this);
            };
            reader.readAsText(file);
        } else if (file.name.includes("WRISCH")) {
            //var reader = new FileReader();
            reader.onload = function (e) {
                this.resSCHArray = CSVToArray(reader.result);
                //fileDisplayArea.innerText = reader.result;
                this.loadNext().bind(this);
            };
            reader.readAsText(file);
        } else if (file.name.includes("WRRDN")) {
            //var reader = new FileReader();
            reader.onload = function (e) {
                this.resRDNArray = CSVToArray(reader.result);
                //fileDisplayArea.innerText = reader.result;
                this.loadNext().bind(this);
            };
            reader.readAsText(file);
        } else if (file.name.includes("WRRUP")) {
            //var reader = new FileReader();
            reader.onload = function (e) {
                this.resRUPArray = CSVToArray(reader.result);
                //fileDisplayArea.innerText = reader.result;
                this.loadNext().bind(this);
            };
            reader.readAsText(file);
        } else if (file.name.includes("WRTN")) {
            //var reader = new FileReader();
            reader.onload = function (e) {
                this.resTNArray = CSVToArray(reader.result);
                //fileDisplayArea.innerText = reader.result;
                this.loadNext().bind(this);
            };
            reader.readAsText(file);
        } else if (file.name.includes("WRAD")) {
            //var reader = new FileReader();
            reader.onload = function (e) {
                this.resADArray = CSVToArray(reader.result);
                //fileDisplayArea.innerText = reader.result;
                this.loadNext().bind(this);
            };
            reader.readAsText(file);
        }
        this.loadNext().bind(this);
    }
}