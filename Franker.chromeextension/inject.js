var frankerUserStyle = "";
var frankerInjectBefore = false;
var frankerInjectBrackets = true;

var frankerWorks = false;

// ==== Message Management ====

function frankerInjectHandleMessage(msgEvent) {
	if (msgEvent.name == "frankateSelectionResponse") {
		if (typeof msgEvent.message == "undefined" || msgEvent.message.length == 0) {
			alert('Franker error: No translation received.\n\nEither autodetect failed or translation service does not support this language pair or wrong API key specified.\n\nTry to set exact "Translate from" language and/or switch translation service ("Translate with" field) and/or correct API key.');
			frankerInjectStop();
			return;
		}
		frankerCoreInjectTranslation(document, msgEvent.message, frankerUserStyle, frankerInjectBefore, frankerInjectBrackets);
		frankerInjectTranslateNextSentence();
	} else if (msgEvent.name == "shortcutFrankateSelectionValue") {
		frankerInjectSetShortcut(msgEvent.message, frankerInjectFrankate);
	} else if (msgEvent.name == "shortcutFrankateCleanValue") {
		frankerInjectSetShortcut(msgEvent.message, frankerInjectClean);
	} else if (msgEvent.name == "styleDestinationValue") {
		frankerUserStyle = msgEvent.message;
	} else if (msgEvent.name == "injectBeforeValue") {
		frankerInjectBefore = (msgEvent.message == "true");
	} else if (msgEvent.name == "injectBracketsValue") {
		frankerInjectBrackets = (msgEvent.message == "true");
	} else if (msgEvent.name == "stop") {
		frankerInjectStop();
		return;
	}
}


// ==== Shortcuts ====

function frankerInjectSetShortcut(str, func) {
	shortcut.remove(str); // must remove first to ensure we do not duplicate the shortcut
	shortcut.add(str, func, {
			'type':'keydown',
			'propagate':false,
			'disable_in_input':true,
			'target':document
	});
}

// ==== Frankation ====

function frankerInjectFrankate() {
	frankerInjectPreprocess();
	if (frankerCoreInit(document) == 0) {
		frankerInjectCoverShow();
		frankerInjectInitPort();
		frankerInjectTranslateNextSentence();
		window.onscroll = frankerInjectOnScroll;
	}
}

// Enables Franker to automatically select article body (if possible) in some known cases (like Readability page)
// Does nothing if a portion of the page is selected or was frankated already (do not mess up with custom (user's) selection)
function frankerInjectPreprocess() {
	var frankerNodes = document.getElementsByClassName('franker-dst-text');
	if (frankerNodes.length != 0 || document.getSelection().toString() != "") {
		return;
	}
	if (document.location.href.indexOf("readability.com/articles/") > 0) {
		var contentElem = document.getElementById("rdb-article-content");
		var range = document.createRange();
		range.selectNode(contentElem);
		var sel = document.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	}
}

function frankerInjectOnScroll() {
	if (frankerWorks) {
		return; // guard against triggering frankation on scroll if it works already (triggered by previous scroll event)
	}
	frankerInjectInitPort();
	document.frankerInfinityGuard = 50;
	frankerInjectTranslateNextSentence();
}

function frankerInjectIsBelowStopLine(node) {
	var tmpNode = node;
	var offsetTop = 0;
	do {
		offsetTop += tmpNode.offsetTop;
	} while (tmpNode = tmpNode.offsetParent)
	return offsetTop > window.pageYOffset + window.innerHeight + 200;
}

function frankerInjectTranslateNextSentence() {
	frankerWorks = true;
	var lastNode = document.frankerLastInsertedNode;
	if (lastNode && frankerInjectIsBelowStopLine(lastNode)) {
		frankerInjectStop();
		return;
	}
	var srcText = "";
	while (srcText == "") {
		if (frankerCoreSelectNextSentence(document) != 0) {
			window.onscroll = "";
			frankerInjectStop();
			return;
		}
		srcText = frankerCoreGetSelectedText(document, true);
	}
	frankerPort.postMessage({name:"frankateSelectionRequest", message:srcText});
}

function frankerInjectStop() {
	if (typeof frankerPort != "undefined") {
		frankerPort.disconnect();
	}
	frankerInjectCoverHide();
	frankerWorks = false;
}

function frankerInjectClean() {
	frankerCoreClean(document);
}


// ==== Cover ====

function frankerInjectPutInCenter(element) { 
	var d = document; 
	var rootElm = d.body;
	var vpw = self.innerWidth ? self.innerWidth : rootElm.clientWidth; // viewport width 
	var vph = self.innerHeight ? self.innerHeight : rootElm.clientHeight; // viewport height 
	var myDiv = element;
	myDiv.style.position = 'absolute'; 
	myDiv.style.left = ((vpw - 100) / 2) + 'px';  
	myDiv.style.top = (rootElm.scrollTop + (vph - 100)/2 ) + 'px'; 
}

function frankerInjectCoverShow() {
	// - cover -
	var cover = document.createElement('div');
	cover.id = "franker_removable_cover";
	cover.style.height = document.documentElement.scrollHeight+"px";
	cover.setAttribute("onmousedown","var event = arguments[0] || window.event; event.preventDefault();");
	
	var coverText = document.createElement('div');
	coverText.id = "frankercovertext";
	coverText.appendChild(document.createTextNode("Frankating..."));
	
	cover.appendChild(coverText);
	document.body.appendChild(cover);
	
	frankerInjectPutInCenter(coverText);
}

function frankerInjectCoverHide() {
	var cover = document.getElementById('franker_removable_cover');
	if (typeof cover != "undefined" && cover != null) {
		cover.parentNode.removeChild(cover);
	}
}


// ==== Initial ====
var frankerPort;
function frankerInjectInitPort() {
	if (typeof frankerPort != "undefined") {
		frankerPort.disconnect();
	}
	frankerPort = chrome.extension.connect({name: "Franker"});
	frankerPort.onMessage.addListener(frankerInjectHandleMessage);
}

function init() {
	frankerInjectInitPort();
	frankerPort.postMessage({name: "shortcutFrankateSelectionRequest"});
	frankerPort.postMessage({name: "shortcutFrankateCleanRequest"});
	frankerPort.postMessage({name: "styleDestinationRequest"});
	frankerPort.postMessage({name: "injectBeforeRequest"});
	frankerPort.postMessage({name: "injectBracketsRequest"});
}

// filtering out weird pages (like facebook blocks on dn.se)
if (document.body != null) {
	init();
}