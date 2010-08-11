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
	
	selection.collapseToStart();
	selection.modify("extend", "forward", "sentence");
	var boundaryCheck = doc.frankerUserRange.compareBoundaryPoints(Range.END_TO_END, selection.getRangeAt(0));
	doc.frankerSimpleRange = (boundaryCheck <= 0);
	if (doc.frankerSimpleRange) { // part of sentence, must revert
		selection.removeAllRanges();
		selection.addRange(doc.frankerUserRange.cloneRange());
	} else {
		selection.collapseToStart();
	}
	return 0;
}

// selects next sentence
// does nothing and returns 'success' if the very small piece of text was selected.
// does nothing and returns 'failure' if user selection boundary reached or infinity guard zeroed (max 50 calls in a row supported)
// call immediately after frankerCoreInit() and after each frankerCoreInjectTranslation()
// returns 0 on success, -1 otherwise (means 'stop now')
function frankerCoreSelectNextSentence(doc) {
	if (doc.frankerSimpleRange) { // just do nothing if only part of sentence was selected
		return 0;
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

	// var sentence = frankerCoreGetSelectedText(doc, true);
	// if (sentence == "") {
	// 	return frankerCoreSelectNextSentence(doc);
	// }
	frankerUtilTrimSelection(selection);
    return 0;
}

// injects a block of text (translation) directly after current selection (original text)
// call after frankerCoreSelectNextSentence() + frankerCoreGetSelectedText()
// returns 0 always
function frankerCoreInjectTranslation(doc, translation, style) {
	var cleanText = translation.replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
	cleanText = cleanText.replace(/&gt;/g, ">").replace(/&lt;/g, "<");
	var translationText = doc.createTextNode(" (" + cleanText + ") ");
	var translationNode = doc.createElement("franker");
	translationNode.setAttribute("class", "franker-dst-text");
	if (style != '') {
		translationNode.setAttribute("style", style);
	}
	translationNode.appendChild(translationText);
	
	var selection = doc.getSelection();
	selection.collapseToEnd();
	selection.getRangeAt(0).insertNode(translationNode);
	selection.removeAllRanges();

	var newRange = document.createRange();
	newRange.selectNode(translationNode);
	selection.addRange(newRange);

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