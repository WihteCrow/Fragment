/**
 * @fileOverview
 * @author Crow
 * @version 0.0.1
 * @time 2015/11/2
 */

(function() {
    var doc = window.document;
    var head = doc.head || doc.getElementsByTagName("head")[0];
    var charset = doc.charset;
    var gid = 0;


    function getGid () {
        return gid++;
    }

    function load(src, success, error, option) {
        var node = doc.createElement('script');
        node.src = src;
        node.id = 'load-js-' + getGid();
        node.charset = charset;
        if ('onload' in node) {
            node.onload = success;
            node.error = error;
        } else {
            node.onreadystatechange = function() {
                if (/loaded|complete/.test(node.readyState)) {
                    success();
                } else {
                    error();
                }
            }
        }

        head.appendChild(node);
    }
}());
