function frankerReadabilityUnbindClick() {
	$('article.article').unbind('click');
	$('article.article').unbind('touchmove');
	$('article.article').find('section.article-content, #menu-tip').unbind('click');
	$('article.article').find('section.article-content, #menu-tip').unbind('touchmove');
}

function frankerReadabilityHideTip() {
	readability.mobile.single.hideMenuTip(true)
}

function frankerReadabilityToggleStyles() {
	readability.mobile.single.toggleStyles(true);
	//readability.mobile.single.toggleNav(true);
}

frankerReadabilityUnbindClick();
frankerReadabilityHideTip();