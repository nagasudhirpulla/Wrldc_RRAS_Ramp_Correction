var rrasSolver = new RRASsolver();

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
    //readTextFile("file:///C:/Users/Nagasudhir/Documents/WBESWareHousing/schedules/cgpl-isgs.js");
};
