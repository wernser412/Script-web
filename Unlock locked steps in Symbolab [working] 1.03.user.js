// ==UserScript==
// @name         Unlock locked steps in Symbolab [working]
// @namespace    http://*.symbolab.com/*
// @version      1.03
// @description  unlocks locked symbolab step-by-step instructions by overwriting XMLHttpRequest
// @author       joseph
// @match        *://*.symbolab.com/*
// @grant        none
// ==/UserScript==

(function(open) {
    
    var patched = 0;
    var signedIn = true;

    function patchResponseLoop(obj) {
        for (var k in obj)
        {
            if (typeof obj[k] == "object" && obj[k] !== null) {
                patchResponseLoop(obj[k]);
            } else {
                if (k == "isLocked") {
                    obj[k] = false;
                    console.log("[patcher] patched a symbolab isLocked property");
                    patched++;
                }
            }
        }
    }

    var open_prototype = XMLHttpRequest.prototype.open,
        intercept_response = function(urlpattern, callback) {
            XMLHttpRequest.prototype.open = function() {
                arguments['1'].match(urlpattern) && this.addEventListener('readystatechange', function(event) {
                    if ( this.readyState === 4 ) {
                        var response = callback(event.target.responseText);
                        // allow intercepted responses to be written to
                        Object.defineProperty(this, 'response', {writable: true});
                        Object.defineProperty(this, 'responseText', {writable: true});

                        this.response = this.responseText = response;
                    }
                });
                return open_prototype.apply(this, arguments);
            };
        };

    if (signedIn) {
        intercept_response(/steps/i, function(response) {
            console.log("[patcher] intercept request, current RES ", JSON.parse(response));

            var parsedO = JSON.parse(response);

            patchResponseLoop(parsedO);

            console.log("[patcher] === PATCHSET COMPLETE, enjoy ===");
            document.getElementById("PlotLink").innerHTML = "<b>Unlocked " + patched + " step(s)!</b>";
    
            return JSON.stringify(parsedO);
        });
    } else {
        document.getElementById("PlotLink").innerHTML = "<b>Please sign in to Symbolab to unlock steps.</b>";
    }
    // tell the user that the script will not work unless they are
    // signed into a free account
    
    if (document.getElementsByClassName("signedin").length < 5) { // hacky way to determine whether logged in
        signedIn = false;
        alert("[Symbolab Unlock] ALERT! It looks like you are not logged into any Symbolab account. Note that Symbolab has recently changed their backend and steps are only sent if you are logged in. The script will not work until you create a free Symbolab account and sign in to it. If you are signed in, ignore this message.");
    }

})(XMLHttpRequest.prototype.open);