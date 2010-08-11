var frankerUserStyle;

// ==== Message Management ====

function frankerInjectHandleMessage(msgEvent) {
	if (msgEvent.name == "frankateSelection") {
		frankerInjectFrankate();
	} else if (msgEvent.name == "frankateSelectionResponse") {
		frankerCoreInjectTranslation(document, msgEvent.message, frankerUserStyle);
		frankerInjectTranslateNextSentence();
	} else if (msgEvent.name == "shortcutFrankateSelectionValue") {
		frankerInjectSetShortcut(msgEvent, frankerInjectFrankate);
	} else if (msgEvent.name == "shortcutFrankateCleanValue") {
		frankerInjectSetShortcut(msgEvent, frankerInjectClean);
	} else if (msgEvent.name == "styleDestinationValue") {
		frankerUserStyle = msgEvent.message;
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
	if (frankerCoreInit(document) == 0) {
		frankerInjectTranslateNextSentence();
	} else {
		alert('Frankate failed, select a block of text first!');
	}
}

function frankerInjectTranslateNextSentence() {
	if (frankerCoreSelectNextSentence(document) != 0) {
		return;
	}
	var srcText = frankerCoreGetSelectedText(document, true);
	if (srcText == "") {
		return;
	}
	safari.self.tab.dispatchMessage("frankateSelectionRequest", srcText);
}

function frankerInjectClean() {
	frankerCoreClean(document);
}

// ==== Initial ====

safari.self.addEventListener("message", frankerInjectHandleMessage, false);

safari.self.tab.dispatchMessage("shortcutFrankateSelectionRequest", "");
safari.self.tab.dispatchMessage("shortcutFrankateCleanRequest", "");
safari.self.tab.dispatchMessage("styleDestinationRequest", "");