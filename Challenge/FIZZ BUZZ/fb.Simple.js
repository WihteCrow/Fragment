/**
 * @fileOverview
 * @author Crow
 * @version 0.0.1
 * @time 2015/6/12
 */

function fbSimple(x, y, z) {
    var n = 1,
        i = false,
        j = false,
        result = new Array(z);
    for (n; n <= z; n++) {
        i = (n % x === 0);
        j = (n % y === 0);

        if (i && j) result[n - 1] = 'FB';
        else if (i) result[n - 1] = 'F';
        else if (j) result[n - 1] = 'B';
        else result[n - 1] = n;
    }

    console.log(result.join(' '));
}

function gcd(a, b) {
    return b ? a : gcd(b, a % b);
}

function lcm(a, b) {
    return a / gcd(a, b) * b;
}

function fbSimple_02(x, y, z) {
    var n = 1,
        result = new Array(z),
        xy = lcm(x, y);
    for (n = x; n <= z; n * x) {
        result[n] = 'F';
    }

    for (n = y; n <= z; n * y) {
        result[y] = 'B';
    }

    for (n = xy; n <= z; n * xy) {
        result[xy] = 'FB';
    }
}

fbSimple(10, 2, 42);