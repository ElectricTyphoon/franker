var frankerUserStyle;
var frankerInjectBefore = false;
var frankerInjectBrackets = true;

var frankerWorks = false;

// ==== Message Management ====

function frankerInjectHandleMessage(msgEvent) {
	switch (msgEvent.name) {
		// main (frankate selection)
		case "frankateSelection":
			frankerInjectFrankate();
			break;
		case "frankateSelectionResponse":
			if (typeof msgEvent.message == "undefined" || msgEvent.message.length == 0) {
				alert('Franker error: No translation received.\n\nEither autodetect failed or translation service does not support this language pair or wrong API key specified.\n\nTry to set exact "Translate from" language and/or switch translation service ("Translate with" field) and/or correct API key.');
				frankerInjectStop();
				return;
			}
			if (frankerCoreGetSelectedText(document, true) == "") {
				break;
			}
			frankerCoreInjectTranslation(document, msgEvent.message, frankerUserStyle, frankerInjectBefore, frankerInjectBrackets);
			frankerInjectTranslateNextSentence();
			break;

		// settings (shortcuts and style)
		case "shortcutFrankateSelectionValue":
			frankerInjectSetShortcut(msgEvent, frankerInjectFrankate);
			break;
		case "shortcutFrankateClearValue":
			frankerInjectSetShortcut(msgEvent, frankerInjectClear);
			break;
		case "styleDestinationValue":
			frankerUserStyle = msgEvent.message;
			break;
		case "injectBeforeValue":
			frankerInjectBefore = msgEvent.message;
			break;
		case "injectBracketsValue":
			frankerInjectBrackets = msgEvent.message;
			break;

		// extra (frankate page)
		case "frankatePage":
			frankerInjectFrankatePage();
			break;
		case "shortcutFrankatePageValue":
			frankerInjectSetShortcut(msgEvent, frankerInjectFrankatePage);
			break;
		case "statePageEnabledValue":
			if (msgEvent.message == true && document.location.href.indexOf("translate.googleusercontent.com", 0) >= 0) {
				frankerInjectTransformGoogleTranslationBlocks();
			}
			break;
		
		// stop
		case "stop":
			frankerInjectStop();
			break;
	}
}


// ==== Shortcuts ====

function frankerInjectSetShortcut(msgEvent, func) {
	var values = msgEvent.message.split(":");
	if (values.length > 1) {
		shortcut.remove(values[1]);
	}
	shortcut.remove(values[0]); // must remove first to ensure we do not duplicate the shortcut
	shortcut.add(values[0], func, {
			'type':'keydown',
			'propagate':false,
			'disable_in_input':true,
			'target':document
	});
}

function frankerInjectFrankate() {
	frankerInjectPreprocess();
	if (frankerCoreInit(document) == 0) {
		frankerInjectCoverShow();
		frankerInjectTranslateNextSentence();
		window.onscroll = frankerInjectOnScroll;
	} else if (window == window.top) {
		alert('Franker error: No text selected.\nPlease, select text and try again.');
	}
}

// Enables Franker to automatically select article body (if possible) in some known cases (like Readability page)
// Does nothing if a portion of the page is selected or was frankated already (do not mess up with custom (user's) selection)
function frankerInjectPreprocess() {
	var frankerNodes = document.getElementsByClassName('franker-dst-text');
	if (frankerNodes.length != 0 || document.getSelection().toString() != "") {
		return;
	}
	var contentElem = null;
	if (document.location.href.indexOf("readability.com/articles/") > 0) {
		contentElem = document.getElementById("rdb-content");
	} else if (document.location.href.indexOf("instapaper.com/read/") > 0) {
		contentElem = document.getElementById("article-content");
	}
	if (contentElem != null) {
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
	frankerWorks = true;
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
	safari.self.tab.dispatchMessage("frankateSelectionRequest", srcText);
}

function frankerInjectStop() {
	frankerInjectCoverHide();
	frankerWorks = false;
}

function frankerInjectClear() {
	frankerCoreClean(document);
}


// ==== Extra ====

function frankerInjectFrankatePage() {
	safari.self.tab.dispatchMessage("frankatePageRequest", "");
}

function frankerInjectTransformGoogleTranslationBlocks() {
	var spans = document.getElementsByTagName('span');
	var i;
	for (i = 0; i < spans.length; i++) {
		if (spans[i].getAttribute('onmouseover')) {
			var dstSpan = spans[i];
			var srcSpan = spans[i+1];
			dstSpan.setAttribute('class', 'franker-dst-text');
			dstSpan.setAttribute("style", frankerUserStyle);
			dstSpan.removeAttribute('onmouseover');
			dstSpan.removeAttribute('onmouseout');
			// moving the source text's span out of the current span (not required now)
			dstSpan.parentNode.insertBefore(srcSpan, dstSpan);
			dstSpan.textContent = ' (' + dstSpan.textContent.replace(/^\s*/, "").replace(/\s*$/, "") + ') '; 
		}
		if (spans[i].className == "google-src-text") {
		 	spans[i].style.display = "inline !important";
		}
	}
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

function init() {
	// - listener -
	safari.self.addEventListener("message", frankerInjectHandleMessage, false);

	// - settings -
	safari.self.tab.dispatchMessage("shortcutFrankateSelectionRequest", "");
	safari.self.tab.dispatchMessage("shortcutFrankateClearRequest", "");
	safari.self.tab.dispatchMessage("styleDestinationRequest", "");
	safari.self.tab.dispatchMessage("injectBeforeRequest", "");
	safari.self.tab.dispatchMessage("injectBracketsRequest", "");

	safari.self.tab.dispatchMessage("shortcutFrankatePageRequest", "");
	safari.self.tab.dispatchMessage("statePageEnabledRequest", "");

}

// filtering out weird pages (like facebook blocks on dn.se)
if (document.body != null) {
	init();
}