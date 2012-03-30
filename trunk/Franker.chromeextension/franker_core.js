// Franker core library
// 
// Version: 1.1.2
// Author: Yurii Soldak (http://franker.googlecode.com)

// initializes franker variables, remembers user selection bounds.
// call once at the very begining.
// returns 0 on success, -1 otherwise (means 'nothing selected')
function frankerCoreInit(doc) {
	var selection = doc.getSelection();
	var text = frankerUtilTrimString(selection.toString());
	if (text == "") {
		return -1;
	}
	doc.frankerUserRange = selection.getRangeAt(0).cloneRange();
	doc.frankerInfinityGuard = 50;
	doc.frankerLastInsertedNode = null;
	
	selection.collapseToStart();
	selection.modify("extend", "forward", "sentence");
	var boundaryCheck = doc.frankerUserRange.compareBoundaryPoints(Range.END_TO_END, selection.getRangeAt(0));
	doc.frankerSimpleRange = (boundaryCheck <= 0);
	
	frankerCoreSelect(doc, doc.frankerUserRange, !doc.frankerSimpleRange);
	
	return 0;
}

// extracted solely for Franker for iPhone/iPad
// used there to re-select the text after user interaction is disabled
function frankerCoreSelect(doc, range, collapse) {
	var selection = doc.getSelection();
	selection.removeAllRanges();
	selection.addRange(range.cloneRange());
	if (collapse) {
		selection.collapseToStart();
	}
}

// selects next sentence
// does nothing and returns 'success' if the very small piece of text was selected.
// does nothing and returns 'failure' if user selection boundary reached or infinity guard zeroed (max 50 calls in a row supported)
// call immediately after frankerCoreInit() and after each frankerCoreInjectTranslation()
// may select "empty" sentence, in this case just call the method again
// returns 0 on success, -1 otherwise (means 'stop now')
function frankerCoreSelectNextSentence(doc) {
	if (doc.frankerSimpleRange) { // just do nothing if only part of sentence was selected
		// if nothing is actually selected then stop (also means we translated simple range already)
		return (frankerCoreGetSelectedText(doc, true) != 0) ? 0 : -1;
	}
	
	doc.frankerInfinityGuard--;
	
	var selection = doc.getSelection();
	selection.modify("extend", "forward", "sentence");
    
	var boundaryCheck = doc.frankerUserRange.compareBoundaryPoints(Range.START_TO_END, selection.getRangeAt(0));
	if (doc.frankerInfinityGuard < 0 || boundaryCheck <= 0) {
        selection.removeAllRanges();
        delete(doc.frankerUserRange);
		doc.frankerInfinityGuard = 50;
		return -1;
	}

	frankerUtilTrimSelection(selection);
    return 0;
}

// injects a block of text (translation) directly after current selection (original text)
// alternatively (before == true) translation is injected before original text
// translation can be optionally surrounded by brackets
// call after frankerCoreSelectNextSentence() + frankerCoreGetSelectedText()
// returns 0 always
function frankerCoreInjectTranslation(doc, translation, style, before, brackets) {
	var cleanText = translation.replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
	cleanText = cleanText.replace(/&gt;/g, ">").replace(/&lt;/g, "<");
	
	var translationText;
	if (brackets) {
		translationText = doc.createTextNode(" (" + cleanText + ") ");
	} else if (before) {
		translationText = doc.createTextNode(cleanText + " ");
	} else {
		translationText = doc.createTextNode(" " + cleanText);
	}
	var translationNode = doc.createElement("franker");
	translationNode.setAttribute("class", "franker-dst-text");
	if (style != '') {
		translationNode.setAttribute("style", style);
	}
	translationNode.appendChild(translationText);
	
	var selection = doc.getSelection();
	frankerUtilTrimSelection(selection);
	if (before) {
		var origRange = selection.getRangeAt(0);
		selection.getRangeAt(0).insertNode(translationNode);
		selection.removeAllRanges();
		selection.addRange(origRange);
	} else {
		selection.collapseToEnd();
		selection.getRangeAt(0).insertNode(translationNode);
		selection.removeAllRanges();
		var newRange = document.createRange();
		newRange.selectNode(translationNode);
		selection.addRange(newRange);
	}
	
	doc.frankerLastInsertedNode = translationNode;
	
	frankerUtilExpandSelection(selection); // includes trailing whitespaces into the selection
	selection.collapseToEnd();
	
	return 0;
}

// removes all injected translation blocks (elements with class="franker-dst-text")
// returns 0 always
function frankerCoreClean(doc) {
	var nodes = doc.getElementsByClassName('franker-dst-text');
	while (nodes.length > 0) {
		nodes[0].parentNode.removeChild(nodes[0]);
	}
	return 0;
}

// retrieves current selection, converts it to string and trims it
// returns trimmed selected string
function frankerCoreGetSelectedText(doc, trim) {
	var selection = doc.getSelection();
	return (trim) ? frankerUtilTrimString(selection + "") : selection + "";
}

// ==== Utils ====
function frankerUtilTrimString(str) {
	return str.replace(/^\s*/, "").replace(/\s*$/, "");
}

function frankerUtilTrimSelection(selection) {
	if (frankerUtilTrimString(selection + "") == "") {
		selection.collapseToEnd();
		return;
	}
	
	var originalRange = selection.getRangeAt(0).cloneRange();
	selection.collapseToStart();
	selection.modify('extend', 'forward', 'character');
	while (!selection.toString().match(/\S/)) {
		selection.modify('extend', 'forward', 'character');
	}
	selection.collapseToEnd();
	selection.modify('move', 'backward', 'character');
	var startRange = selection.getRangeAt(0).cloneRange();
	
	selection.removeAllRanges();
	selection.addRange(originalRange);
	
	selection.collapseToEnd();
	selection.modify('extend', 'backward', 'character');
	while (!selection.toString().match(/\S/)) {
		selection.modify('extend', 'backward', 'character');
	}
	selection.collapseToStart();
	selection.modify('move', 'forward', 'character');
	var endRange = selection.getRangeAt(0).cloneRange();
	
	originalRange.setStart(startRange.startContainer, startRange.startOffset);
	originalRange.setEnd(endRange.endContainer, endRange.endOffset);
	
	selection.removeAllRanges();
	selection.addRange(originalRange);
}

function frankerUtilExpandSelection(selection) {
	var originalRange = selection.getRangeAt(0).cloneRange();
	
	selection.collapseToEnd();
	selection.modify('extend', 'forward', 'character');
	var guard = 50;
	// following loop can run endlessly if the sentence selected is the very last at the page, so we need a guard here
	while (!selection.toString().match(/\S/) && guard > 0) {
		selection.modify('extend', 'forward', 'character');
		guard--;
	}
	selection.collapseToEnd();
	if (guard > 0) {
		selection.modify('move', 'backward', 'character');
	}
	
	var workRange = selection.getRangeAt(0).cloneRange();
	originalRange.setEnd(workRange.endContainer, workRange.endOffset);
	selection.removeAllRanges();
	selection.addRange(originalRange);
}