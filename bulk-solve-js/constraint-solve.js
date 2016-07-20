function trendConstraintSolve(val, change, prevVal) {
    var result;
    result = val;
    if (change) {
        result = val + change;
    }
    if (prevVal) {
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