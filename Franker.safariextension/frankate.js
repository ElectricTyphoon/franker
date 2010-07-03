var frankerUserStyle;

// ==== Message Management ====

function handleMessage(msgEvent) {
	if (msgEvent.name == "frankateSelection") {
		frankateSelection();
	} else if (msgEvent.name == "frankateSelectionResponse") {
		injectTranslationForSentence(msgEvent);
	} else if (msgEvent.name == "frankatePage") {
		frankatePage();
	} else if (msgEvent.name == "shortcutFrankateSelectionValue") {
		setShortcut(msgEvent, frankateSelection);
	} else if (msgEvent.name == "shortcutFrankatePageValue") {
		setShortcut(msgEvent, frankatePage);
	} else if (msgEvent.name == "shortcutFrankateClearValue") {
		setShortcut(msgEvent, frankateClear);
	} else if (msgEvent.name == "styleDestinationValue") {
		frankerUserStyle = msgEvent.message;
	} else if (msgEvent.name == "statePageEnabledValue") {
		if (msgEvent.message == true) {
			if (document.location.href.indexOf("translate.googleusercontent.com", 0) >= 0) {
				transformGoogleTranslationBlocks();
			// } else if (document.location.href.indexOf("translate.google.com") >= 0) {
			// 	for (var i = 0; i < window.frames.length; i++) {
			// 		var src = window.frames[i].document.location;
			// 		if (src.indexOf('translate_p') >= 0 && src.indexOf('usg=') >= 0) {
			// 			document.location = "http://translate.googleusercontent.com" + unescape(src);
			// 		}
			// 	}
			}
		}
	}
}


// ==== Shortcuts ====

function setShortcut(msgEvent, func) {
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


// ==== Whole Page ====

function frankatePage() {
	safari.self.tab.dispatchMessage("frankatePageRequest", "");
}

function transformGoogleTranslationBlocks() {
	var spans = document.getElementsByTagName('span');
	var i;
	for (i = 0; i < spans.length; i++) {
		if (spans[i].getAttribute('onmouseover')) {
			var dstSpan = spans[i];
			var srcSpan = spans[i+1];
			dstSpan.removeAttribute('style');
			dstSpan.setAttribute('class', 'franker-dst-text');
			dstSpan.setAttribute("style", frankerUserStyle);
			
			dstSpan.removeAttribute('onmouseover');
			spans[i].removeAttribute('onmouseout');
			//dstSpan.setAttribute('onclick', '_tipon(this)');


			//// moving the source text's span out of the current span (not required now)
			dstSpan.parentNode.insertBefore(srcSpan, dstSpan);
			//spans[i].removeChild(spans[i+1]);
			
			// wrapping current sentence in para (separate sentences)
			//var separator = document.createElement('p');
			//spans[i].parentNode.insertBefore(separator,spans[i]);
			//separator.appendChild(spans[i]);
			
			//// alternative separation strategies
			//var separator0 = document.createElement('br');
			//spans[i].parentNode.insertBefore(separator0,spans[i]);
			//var separator1 = document.createElement('br');
			//spans[i].parentNode.insertBefore(separator1,spans[i]);
			
			//// uncomment you if want original and translated text to be separated by linefeed
			//var separator2 = document.createElement('br');
			//spans[i].insertBefore(separator2,spans[i+1].nextSibling);
			
			var left = document.createTextNode('(');
			var right = document.createTextNode(')');
			//dstSpan.insertBefore(left, dstSpan.firstChild.nextSibling);
			dstSpan.insertBefore(left, dstSpan.firstChild);
			dstSpan.appendChild(right);
			
		}
		// if (spans[i].className == "google-src-text") {
		// 	spans[i].style.display = "inline !important";
		// }
	}
}

// ==== Selection ====

function getSelectedText() {
	var txt = '';
	if (window.getSelection) {
		txt = window.getSelection();
	} else if (document.getSelection) {
		txt = document.getSelection();
	} else if (document.selection) {
		txt = document.selection.createRange().text;
	}
	return txt;
}

function getSelectedStringTrimmed() {
	return (getSelectedText() + "").replace(/^\s*/, "").replace(/\s*$/, "");
}

var frankerSelection;
var frankerInfinityGuard = 50;
var frankerUserSelection;
var frankerSelectionHasEndOfSentence = false;

function frankateSelection() {
	var selection = getSelectedStringTrimmed();
	if (selection != "") {
		frankerSelection = getSelectedText();
		frankerUserSelection = frankerSelection.getRangeAt(0).cloneRange();
		frankerSelectionHasEndOfSentence = selection.match(/[.!?]+/g);
		if (frankerSelectionHasEndOfSentence) {
			frankerSelection.collapseToStart();
		}
		
		translateNextSentence();
	}
}

function translateNextSentence() {
	frankerInfinityGuard--;
	
	if (frankerSelectionHasEndOfSentence) {
		frankerSelection.modify("extend","forward","sentence");
	}

	var boundaryCheck = frankerUserSelection.compareBoundaryPoints(Range.START_TO_END, frankerSelection.getRangeAt(0));
	if (frankerInfinityGuard < 0 || boundaryCheck <= 0) {
		if (frankerInfinityGuard < 0) {
			console.log("Franker Safari Extension: Too many sentences to frankate, maximum (50) reached and the process was stopped.");
		}
		frankerSelection.collapse();
		delete(frankerSelection);
		frankerInfinityGuard = 50;
		return;
	}
	
	var sentence = getSelectedStringTrimmed();
	if (sentence == "") {
		translateNextSentence();
	} else {
		safari.self.tab.dispatchMessage("frankateSelectionRequest", sentence);
	}
}

function injectTranslationForSentence(msgEvent) {
	if (!frankerSelection) {
		return;
	}
	var cleanText = msgEvent.message.replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
	var translationText = document.createTextNode(" (" + cleanText + ") ");
	var translationNode = document.createElement("franker");
	translationNode.setAttribute("class", "franker-dst-text");
	translationNode.setAttribute("style", frankerUserStyle);
	translationNode.appendChild(translationText);
	
	// need this small hack to ensure we inject translation directly after the original text,
	// since 'modify("extend","forward","sentence")' selects also a whitechar after the sentence (usually space);
	// also focus node becomes next paragraph if the sentence was the last one in current paragraph
	frankerSelection.modify("extend","backward","character");
	
	frankerSelection.collapseToEnd();
	frankerSelection.getRangeAt(0).insertNode(translationNode);
	frankerSelection.modify("move","forward","sentence");
	
	translateNextSentence();
}


// ==== Initial ====

function frankateClear() {
	// if (document.location.href.indexOf('translate.googleusercontent.com') >= 0) {
	// 	var urlEscaped = document.location.href.replace(/.*u=(.*)&rurl=.*/g, "$1");
	// 	document.location = unescape(urlEscaped);
	// }
	var nodes = document.getElementsByClassName('franker-dst-text');
	while (nodes.length > 0) {
		nodes[0].parentNode.removeChild(nodes[0]);
	}
}


// ==== Initial ====

safari.self.addEventListener("message", handleMessage, false);

safari.self.tab.dispatchMessage("shortcutFrankateSelectionRequest", "");
safari.self.tab.dispatchMessage("shortcutFrankatePageRequest", "");
safari.self.tab.dispatchMessage("shortcutFrankateClearRequest", "");
safari.self.tab.dispatchMessage("styleDestinationRequest", "");
safari.self.tab.dispatchMessage("statePageEnabledRequest", "");