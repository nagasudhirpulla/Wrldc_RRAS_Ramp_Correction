var rrasSolver = new RRASsolver();
var solvedRRASAll = {};
window.onload = function () {
    var fileInput = document.getElementById('fileInput');
    var fileDisplayArea = document.getElementById('fileDisplayArea');
    fileInput.addEventListener('change', function (e) {
        rrasSolver.resetAndCreateArrays();
        for (var b = 0; b < fileInput.files.length; b++) {
            rrasSolver.pushFiles(fileInput.files[b]);
        }
        fileInput.value = "";
        rrasSolver.afterEachRead();
    });
};

function doRRASSolve() {
    var considerBlk = document.getElementById("consider_blk_input").value;
    var solveBlk = document.getElementById("solve_blk_input").value;
    solvedRRASAll = rrasSolver.solve(considerBlk, solveBlk);
    //present the solved results in the the textArea fileDisplayArea
    var str = "";
    var gens = Object.keys(solvedRRASAll);
    for (var i = 0; i < gens.length; i++) {
        str += gens[i] + "\t" + "UP" + "\t";
        str += solvedRRASAll[gens[i]]["UP"].join("\t") + "\n";
        str += gens[i] + "\t" + "DOWN" + "\t";
        str += solvedRRASAll[gens[i]]["DOWN"].join("\t") + "\n";
    }
    document.getElementById("fileDisplayArea").value = str;
}
