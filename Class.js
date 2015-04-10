/*
 * @author Crow
 * @return {class}
 * @method Class
 * */


//创建自己的类模拟库
var Class = function () {
    'use strict';
    var _class = function () {
        this.init.apply(this, arguments);
    };

    _class.prototype.init = function () {
    };

    return _class;
};


/*
 * Example
 * -------------------------------------------------------------------------
 * @Class Person
 * */

var Preson = new Class;

Preson.prototype.init = function () {
    //Person 实例做初始化
};

//用法
var Person = new Person;
