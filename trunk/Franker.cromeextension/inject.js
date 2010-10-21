var frankerUserStyle = "";

// ==== Message Management ====

function frankerInjectHandleMessage(msgEvent) {
	// if (msgEvent.name == "frankateSelection") {
	// 	frankerInjectFrankate();
	// } else 
	if (msgEvent.name == "frankateSelectionResponse") {
		frankerCoreInjectTranslation(document, msgEvent.message, frankerUserStyle);
		frankerInjectTranslateNextSentence();
	// } else if (msgEvent.name == "shortcutFrankateSelectionValue") {
	// 	frankerInjectSetShortcut(msgEvent, frankerInjectFrankate);
	// } else if (msgEvent.name == "shortcutFrankateCleanValue") {
	// 	frankerInjectSetShortcut(msgEvent, frankerInjectClean);
	// } else if (msgEvent.name == "styleDestinationValue") {
	// 	frankerUserStyle = msgEvent.message;
	}
}


// ==== Shortcuts ====

function frankerInjectSetShortcut(str, func) {
	// var values = msgEvent.message.split(":");
	// if (values.length > 1) {
	// 	shortcut.remove(values[1]);
	// }
	shortcut.remove(str); // must remove first to ensure we do not duplicate the shortcut
	shortcut.add(str, func, {
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
	var srcText = "";
	while (srcText == "") {
		if (frankerCoreSelectNextSentence(document) != 0) {
			return;
		}
		srcText = frankerCoreGetSelectedText(document, true);
	}
	//safari.self.tab.dispatchMessage("frankateSelectionRequest", srcText);
	frankerPort.postMessage({name:"frankateSelectionRequest", message:srcText});
}

function frankerInjectClean() {
	frankerCoreClean(document);
}

// ==== Initial ====

frankerInjectSetShortcut("Ctrl+F", frankerInjectFrankate);

var frankerPort = chrome.extension.connect({name: "Franker"});
//port.postMessage({joke: "Knock knock"});
frankerPort.onMessage.addListener(frankerInjectHandleMessage);

//safari.self.addEventListener("message", frankerInjectHandleMessage, false);

//safari.self.tab.dispatchMessage("shortcutFrankateSelectionRequest", "");
//safari.self.tab.dispatchMessage("shortcutFrankateCleanRequest", "");
//safari.self.tab.dispatchMessage("styleDestinationRequest", "");