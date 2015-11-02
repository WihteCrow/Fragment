/**
 * @fileOverview
 * @author Crow
 * @version 0.0.1
 * @time 2015/11/2
 */

(function (win) {

    var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;
    var requireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
    var moduleMap = {};

    function isUrl(url) {
        return url.search(/^(http:\/\/|https:\/\/|\/\/)/) !== -1;
    }

    function fixUrl(url) {
        return url.replace(/([^:])\/+/g, '$1/');
    }

    function getUrl(path, url) {
        //������ַ
        if (isUrl(path)) {
            return fixUrl(path);
        }

        var rootUrl;
        //�޸�url
        if (rootUrl = url.match(/[^\/]*\/\/[^\/]*\//)) {
            //http://yanhaijing.com/abc
            url = url.slice(0, url.lastIndexOf('/') + 1);
            rootUrl = rootUrl[0];
        } else {
            //http://yanhaijing.com
            rootUrl = url = url + '/';
        }

        // /��ͷ
        if (path.search(/^\//) !== -1) {
            return fixUrl(rootUrl + path);
        }

        // ../��ͷ
        if (path.search(/^\.\.\//) !== -1) {
            while(path.search(/^\.\.\//) !== -1) {
                if (url.lastIndexOf('/', url.length - 2) !== -1) {
                    path = path.slice(3);
                    url = url.slice(0, url.lastIndexOf('/', url.length - 2) + 1);
                } else {
                    throw new Error('lodjs geturl error, cannot find path in url');
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

    function getIdUrl(id){
        //û��id�����
        if (!id) {
            return getCurSrc();
        }
        //id����Ϊ���·��,amd�涨�˴�Ҳ���ܴ���׺���˴��ſ����ơ�
        if (id.search(/^\./) !== -1) {
            throw new Error('lodjs define id' + id + 'must absolute');
        }
        return fixSuffix(getUrl(id, o.baseUrl), 'js');
    }

    function define(name, dependencies, callback) {
        //ʡ��ģ����
        if (typeof name !== 'string') {
            callback = deps;
            deps = name;
            name = null;
        }

        //������
        if (!isArr(deps)) {
            callback = deps;
            deps = [];
        }

        var modName = getIdUrl(name).split('?')[0];

        moduleMap[modName] = {
            name : name,
            dependencies: dependencies,
            callback: callback
        };

        return 0;
    }


    function use (name) {
        var module = moduleMap[name];

        if (!module.status) {
            var args = [],
                i = 0;
            module.forEach(function(ele) {
                if (moduleMap[ele].status) {
                    args.push(moduleMap[ele].status);
                } else {
                    args.push(this.use(ele));
                }
            });

            module.status = module.callback.apply(args);
        }

        return module.status;
    }

    win.define = define;
}(window));