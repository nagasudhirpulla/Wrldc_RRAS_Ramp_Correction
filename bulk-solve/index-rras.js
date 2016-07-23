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
    // present the results in a table
    //convert str into array for presentationTable
    var strArray = CSVToArray(str, "\t");
    //insert block number column in the array
    var blkRow = [];
    blkRow.push("Block");
    blkRow.push("Number");
    for (var i = 0; i < 96; i++) {
        blkRow.push(i + 1);
    }
    strArray.unshift(blkRow);
    //transpose the str array for presentation
    strArray = strArray[0].map(function (col, i) {
        return strArray.map(function (row) {
            return row[i]
        })
    });

    var presentationTable = document.getElementById("presentation_table");
    presentationTable.innerHTML = '';
    createTableFromArray(strArray, presentationTable);
    //now color the table according to the flags
    for (var i = 0; i < gens.length; i++) {
        for (var blk = 0; blk < 96; blk++) {
            if (solvedRRASAll[gens[i]]["RRASUPFlags"][blk] == true) {
                //paint the table cell
                addElClass(presentationTable.rows[blk + 2].cells[1 + 2 * i], "ramp_up");
                addElClass(presentationTable.rows[blk + 2].cells[1 + 2 * i + 1], "ramp_up");
            }
            if (solvedRRASAll[gens[i]]["RRASDNFlags"][blk] == true) {
                //paint the table cell
                addElClass(presentationTable.rows[blk + 2].cells[1 + 2 * i], "ramp_down");
                addElClass(presentationTable.rows[blk + 2].cells[1 + 2 * i + 1], "ramp_down");
            }
            if (solvedRRASAll[gens[i]]["RRASTMFlags"][blk] == true) {
                //paint the table cell
                addElClass(presentationTable.rows[blk + 2].cells[1 + 2 * i], "tech_min");
                addElClass(presentationTable.rows[blk + 2].cells[1 + 2 * i + 1], "tech_min");
            }
            if (solvedRRASAll[gens[i]]["RRASDCFlags"][blk] == true) {
                //paint the table cell
                addElClass(presentationTable.rows[blk + 2].cells[1 + 2 * i], "dc");
                addElClass(presentationTable.rows[blk + 2].cells[1 + 2 * i + 1], "dc");
            }
        }
    }
}

function removeElClass(el, className) {
    if (el.classList)
        el.classList.remove(className);
    else
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

function addElClass(el, className) {
    if (el.classList)
        el.classList.add(className);
    else
        el.className += ' ' + className;
}

function elHasClass(el, className) {
    if (el.classList)
        return el.classList.contains(className);
    else
        return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
}

function createTableFromArray(tableData, tableEl) {
    if (!tableEl) {
        return;
    }
    tableData.forEach(function (rowData) {
        var row = document.createElement('tr');

        rowData.forEach(function (cellData) {
            var cell = document.createElement('td');
            cell.appendChild(document.createTextNode(cellData));
            row.appendChild(cell);
        });

        tableEl.appendChild(row);
    });
}
