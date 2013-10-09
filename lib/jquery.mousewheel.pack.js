/*! Copyright (c) 2013 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.1.3
 *
 * Requires: 1.2.2+
 */
;(function(c){"function"===typeof define&&define.amd?define(["jquery"],c):"object"===typeof exports?module.exports=c:c(jQuery)})(function(c){function l(b){var a=b||window.event,h=[].slice.call(arguments,1),d=0,e=0,f=0,g=0,g=0;b=c.event.fix(a);b.type="mousewheel";a.wheelDelta&&(d=a.wheelDelta);a.detail&&(d=-1*a.detail);a.deltaY&&(d=f=-1*a.deltaY);a.deltaX&&(e=a.deltaX,d=-1*e);void 0!==a.wheelDeltaY&&(f=a.wheelDeltaY);void 0!==a.wheelDeltaX&&(e=-1*a.wheelDeltaX);g=Math.abs(d);if(!m||g<m)m=g;g=Math.max(Math.abs(f),
Math.abs(e));if(!k||g<k)k=g;a=0<d?"floor":"ceil";d=Math[a](d/m);e=Math[a](e/k);f=Math[a](f/k);try{b.originalEvent.hasOwnProperty("wheelDelta")}catch(l){f=d}h.unshift(b,d,e,f);return(c.event.dispatch||c.event.handle).apply(this,h)}var n=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||9<=document.documentMode?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],m,k;if(c.event.fixHooks)for(var p=n.length;p;)c.event.fixHooks[n[--p]]=c.event.mouseHooks;
c.event.special.mousewheel={setup:function(){if(this.addEventListener)for(var b=h.length;b;)this.addEventListener(h[--b],l,!1);else this.onmousewheel=l},teardown:function(){if(this.removeEventListener)for(var b=h.length;b;)this.removeEventListener(h[--b],l,!1);else this.onmousewheel=null}};c.fn.extend({mousewheel:function(b){return b?this.bind("mousewheel",b):this.trigger("mousewheel")},unmousewheel:function(b){return this.unbind("mousewheel",b)}})});