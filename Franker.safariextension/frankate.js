var frankerUserStyle;

// ==== Message Management ====

function handleMessage(msgEvent) {
	if (msgEvent.name == "frankateSelection") {
		frankateSelection();
	} else if (msgEvent.name == "frankateSelectionResponse") {
		//injectTranslationForSelection(msgEvent);
		injectTranslationForSentence(msgEvent);
	} else if (msgEvent.name == "frankatePage") {
		frankatePage();
	// } else if (msgEvent.name == "transformGoogleTranslationBlocks") {
	// 	transformGoogleTranslationBlocks();
	} else if (msgEvent.name == "shortcutFrankateSelectionValue") {
		setFrankateSelectionShortcut(msgEvent);
	} else if (msgEvent.name == "shortcutFrankatePageValue") {
		setFrankatePageShortcut(msgEvent);
	} else if (msgEvent.name == "styleDestinationValue") {
		frankerUserStyle = msgEvent.message;
	} else if (msgEvent.name == "statePageEnabledValue") {
		if (msgEvent.message == true && document.location.href.indexOf("translate.googleusercontent.com", 0) >= 0) {
			transformGoogleTranslationBlocks();
		}
	}
}

// ==== Shortcuts ====

function setFrankateSelectionShortcut(msgEvent) {
	//console.log(document.location.href);
	//console.log("Setting shortcut: " + msgEvent.message);
	var values = msgEvent.message.split(":");
	if (values.length > 1) {
		shortcut.remove(values[1]);
	}
	shortcut.remove(values[0]); // must remove first to ensure we do not duplicate the shortcut
	shortcut.add(values[0], function() {
		frankateSelection();
	},{
			'type':'keydown',
			'propagate':false,
			'disable_in_input':true,
			'target':document
	});
}

function setFrankatePageShortcut(msgEvent) {
	//console.log(document.location.href);
	//console.log("Setting shortcut: " + msgEvent.message);
	var values = msgEvent.message.split(":");
	if (values.length > 1) {
		shortcut.remove(values[1]);
	}
	shortcut.remove(values[0]); // must remove first to ensure we do not duplicate the shortcut
	shortcut.add(values[0], function() {
		frankatePage();
	},{
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
			dstSpan.setAttribute('class', 'google-dst-text');
			dstSpan.setAttribute("style", frankerUserStyle);
			
			dstSpan.removeAttribute('onmouseover');
			dstSpan.setAttribute('onclick', '_tipon(this)');

			//// uncomment if want tooltip not hide on mouseout
			//spans[i].removeAttribute('onmouseout');

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
		if (spans[i].className == "google-src-text") {
			spans[i].style.display = "inline !important";
		}
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
//var frankerDot;
//var frankerEndMarker;
var frankerInfinityGuard = 50;
var frankerUserSelection;
var frankerSelectionHasEndOfSentence = false;

function frankateSelection() {
	var selection = getSelectedStringTrimmed();
	if (selection != "") {
		frankerSelection = getSelectedText();
		frankerUserSelection = frankerSelection.getRangeAt(0).cloneRange();
		//frankerDot = document.createTextNode('. ');
		//frankerEndMarker = document.createTextNode('Hey, Frank!');
		
		// if (frankerSelection.focusOffset == 0) {
		// 	if (!selection.match(/[.!?]+$/g)) {
		// 		frankerSelection.anchorNode.parentNode.appendChild(frankerDot);
		// 	}
		// 	frankerSelection.anchorNode.parentNode.appendChild(frankerEndMarker);
				// } else if (frankerSelection.focusNode.nextSibling) {
				// 	frankerSelection.focusNode.parentNode.insertBefore(frankerDot, frankerSelection.focusNode.nextSibling);
				// 	frankerSelection.focusNode.parentNode.insertBefore(frankerEndMarker, frankerSelection.focusNode.nextSibling);
				// } else {
				// 	frankerSelection.focusNode.parentNode.appendChild(frankerDot);
				// 	frankerSelection.focusNode.parentNode.appendChild(frankerEndMarker);
		// } else {
		// 	var tmpRange = frankerSelection.getRangeAt(0).cloneRange();
		// 	tmpRange.collapse(false);
		// 	tmpRange.insertNode(frankerEndMarker);
		// 	if (!selection.match(/[.!?]+$/g)) {
		// 		tmpRange.insertNode(frankerDot);
		// 	}
		// 	tmpRange.detach();
		// }
		frankerSelectionHasEndOfSentence = selection.match(/[.!?]+/g);
		if (frankerSelectionHasEndOfSentence) {
			frankerSelection.collapseToStart();
		}
		
		translateNextSentence();
		
		// for (var i = 0; i < srcArr.length; i++) {
		// 	safari.self.tab.dispatchMessage("frankateSelectionRequest", text + "");
		// }
	}
}

function translateNextSentence() {
	frankerInfinityGuard--;
	
	if (frankerSelectionHasEndOfSentence) {
		frankerSelection.modify("extend","forward","sentence");
	}

	var boundaryCheck = frankerUserSelection.compareBoundaryPoints(Range.START_TO_END, frankerSelection.getRangeAt(0));
	if (frankerInfinityGuard < 0 || boundaryCheck <= 0) { //frankerSelection.containsNode(frankerEndMarker) || ) {
		if (frankerInfinityGuard < 0) {
			console.log("Franker Safari Extension: Too many sentences to frankate, maximum (50) reached and the process was stopped.");
		}
		frankerSelection.collapse();
		delete(frankerSelection);
		// if (frankerDot.parentNode) {
		// 	frankerDot.parentNode.removeChild(frankerDot);
		// }
		// delete(frankerDot);
		// frankerEndMarker.parentNode.removeChild(frankerEndMarker);
		// delete(frankerEndMarker);
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
	var translationText = document.createTextNode(" (" + msgEvent.message.replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&amp;/g, "&") + ") ");
	var translationNode = document.createElement("span");
	translationNode.setAttribute("class", "google-dst-text");
	translationNode.setAttribute("style", frankerUserStyle);
	translationNode.appendChild(translationText);
	
	if (frankerSelection.focusOffset == 0) {
		frankerSelection.anchorNode.parentNode.appendChild(translationNode);
		frankerSelection.collapseToEnd();
	} else {
		frankerSelection.collapseToEnd();
		frankerSelection.getRangeAt(0).insertNode(translationNode);
		frankerSelection.modify("move","forward","sentence");
	}
	
	translateNextSentence();
}

function injectTranslationForSelection(msgEvent) {
	//console.log(document.location.href);
	//console.log("translated:" + msgEvent.message);
	var text = getSelectedText();
	if (text + "" != "") {
		var src = (text + "").replace(/^\s*/, "").replace(/\s*$/, "");
		var srcArr = src.split(/[.!?]+/);
		var dst = msgEvent.message;
		var dstArr = dst.split(/[.!?]+/);
		
		//var range = text.range;
		text.collapseToStart();
		text.modify("extend","forward","sentence");
		var nodesToRemove = {};
		for (var i = 0; i < srcArr.length; i++) {
			if (srcArr[i] == "") {
				continue;
			}
			var tmpSel = getSelectedText();
			//console.log(i + ":" + tmpSel + "/" + text);
			//console.log(tmpSel.focusOffset + ":" + tmpSel.focusNode.nodeValue);
			var selected = (tmpSel + "").replace(/^\s*/, "").replace(/\s*$/, "");
			//alert(text.anchorOffset + "/" + text.focusOffset + ":" + tmpSel + ":" + text.anchorNode.nodeValue + ":" + text.focusNode.nodeValue);
			var translationText = document.createTextNode(" (" + dstArr[i].replace(/^\s*/, "").replace(/\s*$/, "") + selected.substring(selected.length - 1) + ") ");
			var translationNode = document.createElement("span");
			translationNode.setAttribute("class", "google-dst-text");
			translationNode.appendChild(translationText);
			
			if (text.focusOffset == 0) {
				//tmpSel.anchorNode.nodeValue += " (" + dstArr[i] + ") ";
			//	text.getRangeAt(0).setEndBefore(text.baseNode.parentNode.nextSibling);
			//}
			//console.log(tmpSel.focusNode + "/" + tmpSel.focusOffset);
				text.anchorNode.parentNode.appendChild(translationNode);
				//var baseTextBefore = document.createTextNode(text.baseNode.nodeValue.substring(0, text.focusOffset));
				//var focusTextAfter = document.createTextNode(text.focusNode.nodeValue.substring(text.focusOffset) + 1);
				//focusParent.insertBefore(focusTextAfter, text.focusNode);
				//focusParent.insertBefore(translationNode, focusTextAfter);
				//focusParent.insertBefore(focusTextBefore, translationNode);
				text.collapseToEnd();
			} else {
				// tmpSel.focusNode.nodeValue = tmpSel.focusNode.nodeValue.substring(0, tmpSel.focusOffset) + " (" + dstArr[i] + tmpSel.focusNode.nodeValue.substring(tmpSel.focusOffset - 2, tmpSel.focusOffset - 1) + ") " + tmpSel.focusNode.nodeValue.substring(tmpSel.focusOffset) + 1;
			// }
				// var focusParent = text.focusNode.parentNode;
				// var focusTextBefore = document.createTextNode(text.focusNode.nodeValue.substring(0, text.focusOffset));
				// var focusTextAfter = document.createTextNode(text.focusNode.nodeValue.substring(text.focusOffset) + 1);
				// focusParent.insertBefore(focusTextAfter, text.focusNode);
				// focusParent.insertBefore(translationNode, focusTextAfter);
				// focusParent.insertBefore(focusTextBefore, translationNode);
				// //focusParent.removeChild(text.focusNode);
				// nodesToRemove[nodesToRemove.length] = text.focusNode;
				text.collapseToEnd();
				text.getRangeAt(0).insertNode(translationNode);
				text.modify("move","forward","sentence");
			}
			
			// text.collapseToEnd();
			//text.modify("move","forward","sentence");
			text.modify("extend","forward","sentence");
			//focusParent.removeChild(toRemove);
		}
		// for (var i = 0; i < nodesToRemove.length; i++) {
		// 	nodesToRemove[i].parentNode.removeChild(nodesToRemove[i]);
		// }
		// text.focusNode.data = text.focusNode.data.substring(0, text.focusOffset) + "<span class=\"google-dst-text\">"+msgEvent.message+"</span>" + text.focusNode.data.substring(text.focusOffset + 1);
		
		// var translationText = document.createTextNode(" (" + dst + ") ");
		// var translationNode = document.createElement("span");
		// translationNode.setAttribute("class", "google-dst-text");
		// translationNode.appendChild(translationText);
		// 
		// var focusParent = text.focusNode.parentNode;
		// var focusTextBefore = document.createTextNode(text.focusNode.data.substring(0, text.focusOffset));
		// var focusTextAfter = document.createTextNode(text.focusNode.data.substring(text.focusOffset) + 1);
		// focusParent.insertBefore(focusTextAfter, text.focusNode);
		// focusParent.insertBefore(translationNode, focusTextAfter);
		// focusParent.insertBefore(focusTextBefore, translationNode);
		// focusParent.removeChild(text.focusNode);
		
		// if (text.focusNode.nextSibling) {
		// 	text.focusNode.parentNode.insertBefore(translationNode, text.focusNode.nextSibling);
		// } else {
		// 	text.focusNode.parentNode.appendChild(translationNode);
		// }
		
		// if (text.baseNode.nextSibling) {
		// 	text.baseNode.parentNode.insertBefore(translationNode, text.baseNode.nextSibling);
		// } else {
		// 	text.baseNode.parentNode.appendChild(translationNode);
		// }
	}
}


// ==== Initial ====

safari.self.addEventListener("message", handleMessage, false);

safari.self.tab.dispatchMessage("shortcutFrankateSelectionRequest", "");
safari.self.tab.dispatchMessage("shortcutFrankatePageRequest", "");
safari.self.tab.dispatchMessage("styleDestinationRequest", "");
safari.self.tab.dispatchMessage("statePageEnabledRequest", "");