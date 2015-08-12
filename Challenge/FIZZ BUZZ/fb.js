/**
 * @fileOverview FB game
 * @author Crow
 * @version 0.0.1
 * @time 2015/6/12
 */

/**
 * Verification interval
 * @param value
 * @param min
 * @param max
 * @returns {boolean}
 */
function verInterval(value, min, max) {
    return !!(value >= min && value <= max);
}

/**
 * set rule
 * @param x
 * @param y
 * @param n
 * @extends FB
 * @returns {setRule}
 */
function setRule(x, y, n) {
    if (verInterval(x, 1, 20)) {
        this.X = x;
    } else {
        console.log('x is not in [1,10]');
    }

    if (verInterval(y, 1, 20)) {
        this.Y = y;
    } else {
        console.log('y is not in [1,10]');
    }

    if (verInterval(n, 21, 100)) {
        this.N = n;
    } else {
        console.log('n is not in [21,100]');
    }
    return this;
}

/**
 * @extends FB
 * @returns {start}
 */
function start() {
    var n = 1,
        i = false,
        j = false;

    this.result = new Array(this.N);
    for (n; n <= this.N; n++) {
        i = (n % this.X === 0);
        j = (n % this.Y === 0);

        if (i && j) {
            this.FBplayer.push(n);
            this.result[n - 1] = this.FB;
        } else if (i) {
            this.Fplayer.push(n);
            this.result[n - 1] = this.F;
        } else if (j) {
            this.Bplayer.push(n);
            this.result[n - 1] = this.B;
        } else {
            this.result[n - 1] = n;
        }
    }
    console.log(this.result.join(' '));
    return this;
}

/**
 * FIZZ BUZZ
 * @constructor
 */
var FB = function () {
    'use strict';
    this.X = 0;
    this.Y = 0;
    this.N = 0;
    this.F = 'F';
    this.B = 'B';
    this.FB = 'FB';
    this.result = [];
    this.Fplayer = [];
    this.Bplayer = [];
    this.FBplayer = [];
    this.Oplayer = [];
};

FB.prototype.setRule = setRule;
FB.prototype.start = start;


var ex = new FB();
ex.setRule(12, 1, 52).start();



