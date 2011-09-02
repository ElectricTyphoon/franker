var frankerUserStyle = "";
var frankerInjectBefore = false;
var frankerInjectBrackets = true;

// ==== Message Management ====

function frankerInjectHandleMessage(msgEvent) {
	if (msgEvent.name == "frankateSelectionResponse") {
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
	if (frankerCoreInit(document) == 0) {
		frankerInjectCoverShow();
		frankerInjectInitPort();
		frankerInjectTranslateNextSentence();
	}
//	else if (window == window.top) {
//		alert("Frankate failed, select a block of text first!");
//	}
}

function frankerInjectTranslateNextSentence() {
	var srcText = "";
	while (srcText == "") {
		if (frankerCoreSelectNextSentence(document) != 0) {
			frankerPort.disconnect();
			frankerInjectCoverHide();
			return;
		}
		srcText = frankerCoreGetSelectedText(document, true);
	}
	frankerPort.postMessage({name:"frankateSelectionRequest", message:srcText});
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
	cover.parentNode.removeChild(cover);
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