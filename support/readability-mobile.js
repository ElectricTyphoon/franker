function frankerReadabilityUnbindClick() {
	$('article.article').find('section.article-content, #menu-tip').unbind('click');
}

function frankerReadabilityHideTip() {
	readability.mobile.single.hideMenuTip(true)
}

function frankerReadabilityToggleStyles() {
	readability.mobile.single.toggleStyles(true);
}

frankerReadabilityUnbindClick();
frankerReadabilityHideTip();