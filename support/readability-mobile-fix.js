function frankerReadabilityUnbindClick() {
	$('article.article').find('section.article-content, #menu-tip').unbind('click');
}

function frankerReadabilityToggleStyles() {
	readability.mobile.single.toggleStyles(true);
}

frankerReadabilityUnbindClick();