// ==UserScript==
// @name        Wattpad visual overhaul 3
// @namespace   http://tampermonkey.net/
// @description Enhancing the wattpad reading experience and enables ebook downloads
// @include     https://www.wattpad.com/*
// @version     3.23
// @require     https://greasyfork.org/scripts/7927-mousetrap/code/Mousetrap.js?version=35548
// @grant       GM_xmlhttpRequest
// ==/UserScript==
///////////////////////////////////////////////////////////////////////
// IMPORTANT SETTINGS, DO NOT FORGET!
// Keys to be pressed to show parent comments, seperated by space means press after each other seperaated by + means press at the same time
parentCommentKeys = 'q';
config = {
    ebookServer: "http://ebook.danielv.no:5001",
};
// End of settings
///////////////////////////////////////////////////////////////////////

console.log('Wattpad visual overhaul 3');
main();
window.addEventListener('scroll', main, false);
window.addEventListener('mousedown', function (evnt) {
    console.log('mousedown');
    main();
});
Mousetrap.bind(parentCommentKeys, function() {parentComments();}, 'keyup'); // Fetch reply parents when keys are pressed

window.addEventListener('onkeydown', function (evnt) {
    console.log('keydown');
    main();
});
// if we are on the notifications page load parentcomments instantly
if(document.location.pathname == "/notifications"){
    parentComments();
}
setInterval(function(){
    // parent comment thingys
    // does not lag as parrentcomment function uses almost no time if all the comments are already parented
    if(document.location.pathname == "/notifications"){
        parentComments();
    }
},500);
function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}
function styles() {
    let headerGradient = 'linear-gradient(rgb(86, 150, 71) 0px, rgb(114, 128, 152) 101%)';
    // console.log('function styles started');
    // More global styles at top, more specific at bottom
    let header = document.getElementById('header');
    header.style.position = 'static';
    header.style.backgroundImage = headerGradient;
    addGlobalStyle(".btn-orange {background-image: linear-gradient(rgb(86, 150, 71) 0px, rgb(114, 128, 152) 101%)}");
    let headerSearch = document.getElementById('header-item-search');
    headerSearch.style.opacity = '0.7';
    let funbar = document.getElementById('funbar');
    if (funbar) {
        document.getElementById('funbar-container').style.position = 'absolute';
        document.getElementById('funbar-container').style.width = '100%';
        document.getElementById('funbar-container').style.top = '54px';
    }
    if (document.getElementById('story-reading')) {
        document.getElementById('story-reading').style.marginTop = '0px';
        chapterImage = document.getElementById('media-container');
    }
    // Toggle the next line by adding/removing 2 slashes in front
    // chapterImage.style.display = 'none';
    // Usefull debug setting
    // console.log('styling completed');

}
Mousetrap.bind('right', function () {
    console.log('Key pressed');
    nextChapter();
});
Mousetrap.bind('left', function () {
    console.log('Key pressed');
    previousChapter();
});
function main() {
    console.log('main');
    // add ebook button
    if(document.querySelector("#funbar") && !document.querySelector("#funbar-ebook")){console.log("ello");document.querySelector("#funbar-controls").innerHTML += "<div class='button-group relative inline-block' id='funbar-ebook'><button class='btn' onclick='getEbook()'>Ebook</button></div>";}
    if (document.getElementById('story-reading')) { // Check if we are on one of the reading pages
        let funbar = document.getElementById('funbar');
        funbar.style.zIndex = "12"; // make it appear behind the profile dropdown (z = 1000)
        if (scrollY >= 54) {
            funbar.style.position = 'fixed';
            funbar.style.top = '0px';
        }
        // If we are at the top of the page, funbar distance from top = scrollpixels -54 as positive numbers
        if (scrollY <= 54) {
            funbar.style.position = 'fixed';
            // nice pickup animation instead of jumpy thingy
            funbar.style.top = Math.abs(scrollY-54) + 'px';
        }
        $('div.container > div.row.part-header > div > header')[0].style.marginTop = '33px';
        document.getElementById('funbar-reading-progress').style.visibility = 'hidden';
        document.getElementById('progressbar').innerHTML = '<div id=\'fixedTimeLeft\' style=\'position:fixed;bottom:10px;right:10px;display:block;visibility:visible;\'>placeholder</div>';
        document.getElementById('fixedTimeLeft').innerHTML = document.getElementById('progresstooltip').getAttribute('data-original-title');
    }
    // Show time left in the bottom right corner instead of anyoing popup thing
    styles();
}

// End of function main
// Load parent comments
function parentComments() {
    console.log("Getting parent comments");
    notifications = document.getElementsByClassName('notification comment panel');
    for (i = 0; i < notifications.length; i++) {
        if(!document.getElementsByClassName('fa fa-comment fa-wp-grey')[i].innerHTML){
            // var temp = notifications[i].getElementsByTagName('a')[1].href.slice(-10);
            let temp = notifications[i].getElementsByTagName('a')[2].href.split("/");
            // https://www.wattpad.com/294838606-gravity-duology-chapter-24-the-for-bitten-planet/comment/1901264007/replies/1081722442

            // get last part of link (comment ID)
            temp = temp[temp.length-1];
            // temp = temp.match(/\d+/);
            //console.log('https://www.wattpad.com/v4/parts/' + temp + '/comments?offset=0&limit=10');
            // Request the child comment (full JSON)
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
                //console.log(this.responseText);
                object = JSON.parse(this.responseText);
                //console.log(object.parentId);
                var commentToGet = object.parentId;
                // request the parent
                var oReq2 = new XMLHttpRequest();
                oReq2.addEventListener("load", function() {
                    //console.log(this.responseText);
                    object = JSON.parse(this.responseText);
                    document.getElementsByClassName('fa fa-comment fa-wp-grey')[i].innerHTML = "<span style='font-family:Helvetica;'>"+"<b>"+object.author.name+"</b>" + ': ' + object.body+"</span>";
                });
                oReq2.open("GET", 'https://www.wattpad.com/v4/comments/' + commentToGet + '', false);
                oReq2.send();
            });
            oReq.open("GET", 'https://www.wattpad.com/v4/comments/' + temp + '/replies', false);
            oReq.send();
        }
    }
}
function getStoryID() {
    return $("#funbar-story > div > div > h6 > a")[0].href.split(/[-:]+/)[1].split(/[/:]+/)[3];
}
function nextChapter() {
    if(typeof document.getElementById('footer').parentElement.href == "string"){
        var url = document.getElementById('footer').parentElement.href;
        window.location.assign(url);
    } else {
        // backup if we havent scrolled to the bottom yet, slightly slower, but it works well
        var $div = $('<div>');
        $div.load("https://www.wattpad.com/story/"+getStoryID()+"/parts", function(){
            for(i=0;i<$(this)[0].querySelectorAll(".table-of-contents>li>a").length;i++){
                if($("#parts-container-new>article")[0].dataset.partUrl == $(this)[0].querySelectorAll(".table-of-contents>li>a")[i].href){
                    var o = i + 1;
                    console.log($(this)[0].querySelectorAll(".table-of-contents>li>a")[o].href);
                    if(typeof $(this)[0].querySelectorAll(".table-of-contents>li>a")[o].href == "string"){
                        window.location.assign($(this)[0].querySelectorAll(".table-of-contents>li>a")[o].href);
                    }
                }
            }
        });
    }
}
function previousChapter() {
    var $div = $('<div>');
    var last = "";
    $div.load("https://www.wattpad.com/story/"+getStoryID()+"/parts", function(){
        for(i=0;i<$(this)[0].querySelectorAll(".table-of-contents>li>a").length;i++){
            if($("#parts-container-new>article")[0].dataset.partUrl == $(this)[0].querySelectorAll(".table-of-contents>li>a")[i].href){
                // console.log($(this)[0].querySelectorAll(".table-of-contents>li>a")[i].href);
                console.log(last);
                if(typeof last == "string"){
                    window.location.assign(last);
                }
            }
            last = $(this)[0].querySelectorAll(".table-of-contents>li>a")[i].href;
        }
    });
}
// Take bookID and return array of chapterIDs starting at 0
function getChapterIDs(bookID, callback){
    var $div = $('<div>');
    $div.load("https://www.wattpad.com/story/"+bookID+"/parts", function(){
        var sadg = [];
        for(i=0;i<$(this)[0].querySelectorAll(".table-of-contents>li>a").length;i++){
            sadg[i] = $(this)[0].querySelectorAll(".table-of-contents>li>a")[i].href.split("/")[3].split("-")[0];
        }
        callback(sadg);
    });
}
/*
https://www.wattpad.com/apiv2/storytext?id=CHAPTERID
Gives full chapter text as HTML, time for ebooks :D
*/
unsafeWindow.getEbook = function() {
    $.ajaxSetup({
        async: false
    });
    var data = {
        ebookMethod: "links",
        // crazy .replace()ing to get rid of crazy whitespaces
        title: document.querySelector("#funbar-part-details > span > span.info > h1").innerHTML.trim(), // book title from chapter dropdown top left
        author: [document.querySelector("#funbar-part-details > span > span.info > span").innerHTML.trim().replace("by ","")], // get author name from the chapter dropdown top left
        contents: [],
        bookID: "wattpad"+getStoryID()
    };
    setTimeout(function() {
        getChapterIDs(getStoryID(), function(chapterID){
            for (let i = 0; i < $(".table-of-contents>li").length; i++) {
                data.contents[data.contents.length] = {
                    title: document.querySelectorAll(".table-of-contents > li > a > .part-title")[0].innerHTML.trim(),
                    url: 'https://www.wattpad.com/apiv2/storytext?id='+chapterID[i],
                    // dataSelector: "", // blank because the ebook server will just accept raw text when its blank
                };
            }
            //document.querySelector("#topSuprSecret").innerHTML = "<h1>Converting to epub...</h1>";
            console.log(data);
            GM_xmlhttpRequest({
                method: "POST",
                url: config.ebookServer + "/epubify",
                data: JSON.stringify(data),
                headers:    {
                    "Content-Type": "application/json"
                },
                onload:function(response) {
                    console.log(response.responseText + " book is done");
                    if(response.responseText == "success") {
                        location.href = config.ebookServer + "/wattpad" + getStoryID() + ".epub";
                    } else {
                        alert("Could not contact ebook server. Please alert author.");
                    }
                    //document.getElementById('topSuprSecret').outerHTML = '';
                }
            });
        });
    }, 100); // end of timeout
};
setTimeout(function(){
    //getEbook();
},7000);

function findStringInObject(string, object, path) {
	if (!path) path = "object";
	if (object && object.constructor == Array) {
		//console.log("Array")
		object.forEach(function(x, index){
			updatedpath = path + "["+index+"]";
			findStringInObject(string, x, updatedpath);
		});
	} else if (object && object.constructor == Object) {
		//console.log("Object")
		for (let key in object) {
			updatedpath = path + "." + key;
			findStringInObject(string, object[key], updatedpath);
		}
	} else if (object && typeof object == "string") {
		//console.log("String")
		console.log(string + " and " + object);
		if(object.includes(string)) {
			console.log("found ================================================================================");
			console.log(path);
			return updatedpath;
		}
	}
}
var script = document.createElement('div');
script.innerHTML = `<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-124032859-3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-124032859-3');
</script>
`;
document.body.appendChild(script);