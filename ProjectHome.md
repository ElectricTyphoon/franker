**ATTENTION** Franker browser extensions v1.3.1 may not work for some users. Keep calm and wait for new version. (Coming soon)<br />
Active development moved to [Bitbucket](https://bitbucket.org/ysoldak/franker-ext/)

---

**Franker** is a browser extension and iOS app which _mimics_ [Ilya Frank's Reading Method](http://english.franklang.ru/6/).<br /> (**Franker**--  это браузерное расширение и iOS приложение, которое _имитирует_ [метод чтения Ильи Франка](http://ru.wikipedia.org/wiki/Метод_чтения_Ильи_Франка).)

---

  * **Franker for Safari**: [Install](http://franker.googlecode.com/svn/release/Franker.safariextz)
  * **Franker for Chrome**: [Install](https://chrome.google.com/extensions/detail/gilglhgnmdmjdagiehbokboocbgiddnh?hl=en-US)
  * **Franker for iOS**: [App Store](http://itunes.apple.com/app/franker/id384356597)

---

Franker needs access to Google or Microsoft Traslator service, learn how to setup [APIKeys](APIKeys.md)

---


## Browser Extension Features ##
  * **Frankate** (translate sentence-by-sentence) selected text with hotkey, context menu or toolbar button
  * **Frankate Page** ([GoogleTranslate](http://translate.google.com) page and inline translation bubbles) with hotkey or toolbar button (Safari extension only)
  * **Clear Page** from injected translation blocks with hotkey
  * **Autodetects** language of original text (by default)
  * **All languages** supported by Google Translate are available to choose as source and destination for translation
  * Customizable **keyboard shortcuts**
  * Customizable **translated block's style** (like text color, size, background etc.; all [CSS](http://www.w3schools.com/css/) style rules supported!)
  * Possibility to disable Google Translate's bubble inlining, so "Frankate Page" just translates the page (Safari extension only)
  * Two translation providers: Google Translate and Microsoft Bing (select one of them)

## Screenshots ##
![http://a6.mzstatic.com/us/r30/Purple/41/a3/bb/mzl.vamrrkee.320x480-75.jpg](http://a6.mzstatic.com/us/r30/Purple/41/a3/bb/mzl.vamrrkee.320x480-75.jpg)
![http://a2.mzstatic.com/us/r30/Purple/94/be/92/mzl.vbiahpvu.320x480-75.jpg](http://a2.mzstatic.com/us/r30/Purple/94/be/92/mzl.vbiahpvu.320x480-75.jpg)
<br />
![http://franker.googlecode.com/files/Selection_081_Big.png](http://franker.googlecode.com/files/Selection_081_Big.png)

## Ilya Frank's Reading Method ##
Ilya Frank is a russian philologist, the inventor and popularizer of the method of parallel reading of his name. The method differs from common parallel texts method used in many books in a way it injects translation directly into the original text. Injections are small (usually several words or sentence, with notes if necessary). This way you read sentence on foreign language first, then check you understand everything correctly by translation and learn new words and phrases in context. The method is popular in Russia.

Example (copied verbatim from [Wikipedia article](http://ru.wikipedia.org/wiki/Метод_чтения_Ильи_Франка)), excerpt from "Gulliver's Travels" book (translation is in Russian):
> I must have slept for more than nine hours _(я, вероятно, проспал более девяти часов; to sleep)_ because when I woke
> up _(потому что, когда я проснулся; to wake up)_ it was daylight _(было совсем светло; daylight — дневной свет;
> день, светлое время суток)_.

The extension does its best to _mimic_ the method using Google Translate (or Bing); it does NOT produce the same result as _real_ method would. Obviously this simple script can't make useful notes and doesn't do deep analysis of a text, it just translates complete sentences.

For actual _Ilya Frank's Reading Method_ and respective literature, please, check their [official web site](http://english.franklang.ru).

## Thanks ##
  * Ilya Frank for [the reading method](http://english.franklang.ru/6/);
  * Google for [Translator](http://translate.google.com/) and [API](http://code.google.com/apis/ajaxlanguage/documentation/#Translation) for it;
  * Microsoft for [Bing Translator](http://www.microsofttranslator.com/) and [API](http://www.microsofttranslator.com/dev/) for it;
  * OpenJS for [keyboard shortcuts script](http://www.openjs.com/scripts/events/keyboard_shortcuts/);

## Feedback ##
**Contact us via e-mail/GTalk**: ysoldak.apps@gmail.com<br />
**[Follow us on Twitter](http://twitter.com/ysoldak_apps)** (latest news and current thoughts)<br />
**[Feedback on uservoice](http://franker.uservoice.com/forums/85825-general)** (we want to hear from you!)