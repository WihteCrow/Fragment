/*global window, _*/
(function (win) {
    'use strict';
    var modMap = [];
    var moduleMap = [];

    var slice = [].slice;

    var doc = document;
    var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
    var docCharset = doc.charset;
    var docUrl = location.href.split('?')[0];//去除问号之后部分
    var baseUrl = getCurSrc() || docUrl;

    var gid = 0;
    var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;
    var cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
    var interactiveScript = null;
    var currentlyAddingScript = null;
    var curExecModName = null;

    var idPrefix = 'load-js-';

    var o = {};

    function _getGid() {
        return gid++;
    }
    function _loadJs(src, success, error, option) {
        var d = _.extend({
            charset: docCharset
        }, option);
        var node = doc.createElement('script');
        node.src = src;
        node.id = idPrefix + _getGid();
        node.charset = d.charset;
        if ('onload' in node) {
            node.onload = success;
            node.onerror = error;
        } else {
            node.onreadystatechange = function() {
                if (/loaded|complete/.test(node.readyState)) {
                    success();
                } else {
                    error();
                }
            }
        }
        currentlyAddingScript = node;
        head.appendChild(node);
        currentlyAddingScript = null;
    }
    function getCurSrc() {
        if(doc.currentScript){
            return doc.currentScript.src;
        }
        if (currentlyAddingScript) {
            return currentlyAddingScript.src;
        }
        // For IE6-9 browsers, the script onload event may not fire right
        // after the script is evaluated. Kris Zyp found that it
        // could query the script nodes and the one that is in "interactive"
        // mode indicates the current script
        // ref: http://goo.gl/JHfFW
        if (interactiveScript && interactiveScript.readyState === "interactive") {
            return interactiveScript.src;
        }

        var scripts = head.getElementsByTagName("script");
        for (var i = scripts.length - 1; i >= 0; i--) {
            var script = scripts[i];
            if (script.readyState === "interactive") {
                interactiveScript = script;
                return interactiveScript.src;
            }
        }
        return null;
    }
    function isUrl(url) {
        return url.search(/^(http:\/\/|https:\/\/|\/\/)/) !== -1;
    }
    function fixUrl(url) {
        return url.replace(/([^:])\/+/g, '$1/');
    }
    function getUrl(path, url) {
        //绝对网址
        if (isUrl(path)) {
            return fixUrl(path);
        }

        var rootUrl;
        //修复url
        if (rootUrl = url.match(/[^\/]*\/\/[^\/]*\//)) {
            //http://yanhaijing.com/abc
            url = url.slice(0, url.lastIndexOf('/') + 1);
            rootUrl = rootUrl[0];
        } else {
            //http://yanhaijing.com
            rootUrl = url = url + '/';
        }

        // /开头
        if (path.search(/^\//) !== -1) {
            return fixUrl(rootUrl + path);
        }

        // ../开头
        if (path.search(/^\.\.\//) !== -1) {
            while(path.search(/^\.\.\//) !== -1) {
                if (url.lastIndexOf('/', url.length - 2) !== -1) {
                    path = path.slice(3);
                    url = url.slice(0, url.lastIndexOf('/', url.length - 2) + 1);
                } else {
                    throw new Error('url错误');
                }
            }

            return fixUrl(url + path);
        }
        // ./
        path = path.search(/^\.\//) !== -1 ? path.slice(2) : path;

        return fixUrl(url + path);
    }

    function fixSuffix(url, suffix) {
        var reg = new RegExp('\\.' + suffix + '$', 'i');
        return url.search(reg) !== -1 ? url : url + '.' + suffix;
    }
    function replacePath(id) {
        var ids = id.split('/');
        // id中不包含路径 或 查找路径失败
        if (ids.length < 2 || !(ids[0] in o.path)) {
            return id;
        }
        ids[0] = o.path[ids[0]];
        return ids.join('/');
    }
    function getDepUrl(id, url) {
        var pathId = replacePath(id);
        //找到path 基于baseUrl
        if (pathId !== id) {
            url = o.baseUrl;
        }
        return fixSuffix(getUrl(pathId, url || o.baseUrl), 'js');
    }
    function getIdUrl(id){
        //没有id的情况
        if (!id) {
            return getCurSrc();
        }
        //id不能为相对路径,amd规定此处也不能带后缀，此处放宽限制。
        if (id.search(/^\./) !== -1) {
            throw new Error('资源路径：' + id + '必须是绝对定位');
        }
        return fixSuffix(getUrl(id, o.baseUrl), 'js');
    }
    function require(id, url) {
        var url = getDepUrl(id, url || curExecModName);
        return moduleMap[url] && moduleMap[url].exports;
    }
    function fixPath(path) {
        //path是网址
        if (isUrl(path)) {
            return getUrl('./', path).slice(0, -1);
        }
        return path;
    }
    function config(option) {
        if (!_.isObject(option)) {
            return _.extend({}, o);
        }

        //处理baseUrl
        if (option.baseUrl) {
            option.baseUrl = getUrl(option.baseUrl, docUrl);
        }

        //处理path
        if (_.isObject(option.path)) {
            for(var key in option.path) {
                option.path[key] = fixPath(option.path[key]);
            }
        }
        o = _.extend(o, option);

        //fix keywords
        o.path.BASEURL = fixPath(option.baseUrl || o.baseUrl);
        o.path.DOCURL = fixPath(docUrl);
        return _.extend({}, o);
    }
    function execMod(modName, callback, params) {
        //判断定义的是函数还是非函数
        if (!params) {
            moduleMap[modName].exports = modMap[modName].callback;
        } else {
            curExecModName = modName;
            //commonjs
            var exp = modMap[modName].callback.apply(null, params);
            curExecModName = null;
            //amd和返回值的commonjs
            if (exp) {
                moduleMap[modName].exports = exp;
            }
        }
        //执行回调函数
        callback(moduleMap[modName].exports);

        //执行complete队列
        execComplete(modName);
    }
    function execComplete(modName) {
        //模块定义完毕 执行load函数,当加载失败时，会不存在module
        for (var i = 0; i < modMap[modName].oncomplete.length; i++) {
            modMap[modName].oncomplete[i](moduleMap[modName] && moduleMap[modName].exports);
        }
        //释放内存
        modMap[modName].oncomplete = [];
    }
    function loadMod(id, callback, option) {
        //commonjs
        if(id === 'require') {
            callback(require);
            return -1;
        }
        if (id === 'exports') {
            var exports = moduleMap[option.baseUrl].exports = {};
            callback(exports);
            return -2;
        }
        if (id === 'module') {
            callback(moduleMap[option.baseUrl]);
            return -3;
        }
        var modName = getDepUrl(id, option.baseUrl);
        //未加载
        if (!modMap[modName]) {
            modMap[modName] = {
                status: 'loading',
                oncomplete: []
            };
            _loadJs(modName, function () {
                //如果define的不是函数
                if (!_.isFunction(modMap[modName].callback)) {
                    execMod(modName, callback);
                    return 0;
                }

                //define的是函数
                use(modMap[modName].deps, function () {
                    execMod(modName, callback, slice.call(arguments, 0));
                }, {baseUrl: modName});
                return 1;
            }, function () {
                modMap[modName].status === 'error';
                callback();
                execComplete(modName);//加载失败执行队列
            });
            return 0;
        }

        //加载失败
        if (modMap[modName].status === 'error') {
            callback();
            return 1;
        }
        //正在加载
        if (modMap[modName].status === 'loading') {
            modMap[modName].oncomplete.push(callback);
            return 1;
        }

        //加载完成
        //尚未执行完成
        if (!moduleMap[modName].exports) {
            //如果define的不是函数
            if (!_.isFunction(modMap[modName].callback)) {
                execMod(modName, callback);
                return 2;
            }

            //define的是函数
            use(modMap[modName].deps, function () {
                execMod(modName, callback, slice.call(arguments, 0));
            }, {baseUrl: modName});
            return 3;
        }

        //已经执行过
        callback(moduleMap[modName].exports);
        return 4;
    }
    function use(deps, callback, option) {
        if (arguments.length < 2) {
            throw new Error('load.use arguments miss');
            return 0;
        }

        if (typeof deps === 'string') {
            deps = [deps];
        }

        if (!_.isArray(deps) || !_.isFunction(callback)) {
            throw new Error('load.use arguments type error');
            return 1;
        }
        //默认为当前脚本的路径或baseurl
        if (!_.isObject(option)) {
            option = {};
        }
        option.baseUrl = option.baseUrl || o.baseUrl;

        if (deps.length === 0) {
            callback();
            return 2;
        }
        var depsCount = deps.length;
        var params = [];
        for(var i = 0; i < deps.length; i++) {
            (function (j) {
                loadMod(deps[j], function (param) {
                    depsCount--;
                    params[j] = param;
                    if (depsCount === 0) {
                        callback.apply(null, params);
                    }
                }, option);
            }(i));
        }

        return 3;
    }
    function define(name, deps, callback) {
        //省略模块名
        if (typeof name !== 'string') {
            callback = deps;
            deps = name;
            name = null;
        }

        //无依赖
        if (!_.isArray(deps)) {
            callback = deps;
            deps = [];
        }

        //支持commonjs
        if (deps.length === 0 && _.isFunction(callback) && callback.length) {
            callback
                .toString()
                .replace(commentRegExp, '')
                .replace(cjsRequireRegExp, function (match, dep) {
                    deps.push(dep);
                });
            var arr = ['require'];
            if (callback.length > 1) {
                arr.push('exports');
            }
            if (callback.length > 2) {
                arr.push('module');
            }
            deps = arr.concat(deps);
        }

        var modName = getIdUrl(name).split('?')[0];//fix 后缀

        modMap[modName] = modMap[modName] || {};
        modMap[modName].deps = deps;
        modMap[modName].callback = callback;
        modMap[modName].status = 'loaded';
        modMap[modName].oncomplete = modMap[modName].oncomplete || [];
        moduleMap[modName] = {};

        return 0;
    }

    function debug() {
        console.log(modMap, moduleMap);
    }
    var load = {
        use: use,
        _loadJs: _loadJs,
        config: config,
        define: define,
        require: require,
        debug: debug
    };

    load.config({
        baseUrl: baseUrl,
        path: {}
    });
    win.define = define;
    win.load = load;
}(window));