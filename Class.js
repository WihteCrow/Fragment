/*
 * @author Crow
 * @return {class}
 * @method Class
 * */


//�����Լ�����ģ���
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
    //Person ʵ������ʼ��
};

//�÷�
var Person = new Person;
