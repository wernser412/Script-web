// ==UserScript==
// @name         A Universal Script to Re-Enable the Selection and Copying
// @version      1.3.3
// @description  Enables select, right-click, copy and drag on pages that disable them.
// @include      /^https?\:\/\//
// @grant        none
// @run-at       document-start
// @namespace https://greasyfork.org/users/371179
// ==/UserScript==
"use strict";
(function() {
    var wasRun = false;

    var cssStyle = '*, body *, div, span, body *::before, body *::after, *:hover, *:link, *:visited, *:active , *[style], *[class]{' +
        '-webkit-touch-callout: default !important; -webkit-user-select: auto !important; ' +
        '-khtml-user-select: auto !important; -moz-user-select: auto !important; ' +
        '-ms-user-select: auto !important; user-select: auto !important;}' +
        'html body *:hover>img[src]{' +
        'pointer-events:auto;' +
        '}';

    function enableSelectClickCopy() {

        var mKey = 'dqzadwpujtct';
        var enabledSCC = '___enabledSCC_' + mKey + '___';
        var nonFalseFunc = '___nff_' + mKey + '___';
        var rvSCC = '___returnValue_' + mKey + '___';

        if (window[enabledSCC]) return;
        window[enabledSCC] = true;

        Event.prototype.preventDefault = (function(f) {
            var eys = ['copy', 'contextmenu', 'select', 'selectstart', 'dragstart', 'beforecopy'];
            return function() {
                if (eys.indexOf(this.type) >= 0) return;
                return f.apply(this);
            }
        })(Event.prototype.preventDefault);
        Event.prototype.preventDefault.toString = () => "function preventDefault() { [native code] }"

        var exs = ['copy', 'contextmenu', 'select', 'selectstart', 'dragstart', 'beforecopy'];
        Object.defineProperty(Event.prototype, "returnValue", {

            get() {
                return rvSCC in this ? this[rvSCC] : true;
            },
            set(newValue) {
                if (exs.indexOf(this.type) < 0 && newValue === false) this.preventDefault();
                this[rvSCC] = newValue;
            },
            enumerable: true,
            configurable: true
        });

        var ezs = ['copy', 'contextmenu', 'select', 'selectstart', 'dragstart', 'beforecopy'];
        var eventsCount = ezs.length;

        function universaler(originalFunc, pName) {
            var uid = (+new Date) + "_" + pName
            var resFX = function(ev) {
                var func;
                var p = false;
                try {
                    func = this[pName];
                    if (typeof func == 'function' && func.uid === uid) {
                        p = true;
                    }
                } catch (e) {

                }
                var res = originalFunc.apply(this, arguments);
                if (p) {
                    if (res !== false) {
                        originalFunc[nonFalseFunc] = true;
                        this[pName] = originalFunc;
                        return res;
                    }
                } else {
                    return res;
                }


            }
            resFX.toString = () => originalFunc.toString()
            resFX.uid = uid
            return resFX;
        }

        function disableAll(event) {
            var elmNode = event.target
            while (elmNode && elmNode.nodeType > 0) {
                var pName = 'on' + event.type
                var f = elmNode[pName];
                if (f && f[nonFalseFunc] !== true) {
                    var nf = universaler(f, pName);
                    nf[nonFalseFunc] = true;
                    elmNode[pName] = nf;
                }
                elmNode = elmNode.parentNode;
            }
        }


        for (var i = 0; i < eventsCount; i++) {
            var event = ezs[i];
            document.addEventListener(event, disableAll, true);
        }


        var _alert = window.alert
        var _mAlert = null;
        if (_alert && typeof _alert == 'function') {
            _mAlert = function alert(msg) {
                setTimeout(() => {
                    alert._click.isDisabled() ? console.log("alert msg disabled: ", msg) : alert.alert.apply(this, arguments)
                }, 9);
            };

            _mAlert._click = {
                isDisabled: function() {
                    return this.status == 1 && this.last + 50 > +new Date;
                }
            }
            _mAlert.alert = _alert

            _mAlert.toString = () => "function alert() { [native code] }"

            window.alert = _mAlert


            var cid_mouseup = 0;


            ["mousedown", "click", "dblclick", "contextmenu"].forEach(function(event) {

                document.addEventListener(event, function(evt) {
                    if (evt.type != "contextmenu" && evt.which != 3) return;
                    if (cid_mouseup > 0) {
                        clearTimeout(cid_mouseup)
                        cid_mouseup = 0;
                    }
                    _mAlert._click.last = +new Date;
                    _mAlert._click.status = 1;
                }, true);

            })

            document.addEventListener("mouseup", function(evt) {
                if (evt.which != 3) return;
                cid_mouseup = setTimeout(function() {
                    _mAlert._click.last = +new Date;
                    _mAlert._click.status = 0;
                }, 17);
            }, true);

        }
    }



    function loadedHandler() {
        if (wasRun) return;
        wasRun = true;
        console.log("Select-click-copy Enabler");
        try {
            document.removeEventListener('beforescriptexecute', loadedHandler, true);
            document.removeEventListener('beforeload', loadedHandler, true);
            document.removeEventListener('DOMContentLoaded', loadedHandler, true);
        } catch (e) {}
        appendScript(document);

    }

    function isDocumentObj(x) {
        return x && x.nodeType == 9
    }


    function isHTMLElementObj(x) {
        return x && x.nodeType == 1
    }

    function makeScriptElm(documentObject) {
        if (!isDocumentObj(documentObject)) return null;
        var s = documentObject.createElement('script');
        s.type = 'text/javascript';
        s.innerHTML = '(' + enableSelectClickCopy.toString() + ')()';
        return s
    }

    function appendScript(documentObject) {
        try {
            if (!isDocumentObj(documentObject)) return;
            var container = documentObject.head || documentObject.body;
            if (container) container.appendChild(makeScriptElm(documentObject));
        } catch (e) {}
    }


    function appendCssEnabler(container) {
        if (!isHTMLElementObj(container)) return;
        try {
            var css = document.createElement('style');
            css.type = 'text/css';
            css.innerHTML = cssStyle;
            container.appendChild(css);
        } catch (e) {}
    }

    wasRun = false;

    if (document != null) {

        try {
            enableSelectClickCopy(); //try direct call
        } catch (e) {}

        try {
            if ('onbeforescriptexecute' in document) {
                //for firefox
                document.addEventListener('beforescriptexecute', loadedHandler, true);
            } else {
                //for chrome and opera
                document.addEventListener('beforeload', loadedHandler, true);
            }

        } catch (e) {}

        function onReady() {

            //in case all previous efforts fail
            try {
                loadedHandler();
            } catch (e) {}

            appendCssEnabler(document.documentElement || document.body);
        }

        if (document.readyState !== 'loading') {
            onReady();
        } else {
            document.addEventListener('DOMContentLoaded', onReady);
        }


    }
})();