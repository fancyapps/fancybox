fancyBox - Changelog
=========

### Version 2.0.6 - April 16, 2012

* Fixed #188 - keystrokes in contenteditable
* Fixed #171 - non-images should not be preloaded
* Fixed #158 - 'closeClick: true' breaks gallery navigation
* New "media" helper - detects and displays various media types
* New option "groupAttr" - name of group selector attribute, default is "data-fancybox-group"
* New feature - selector expressions in URLs, see #170
* Improved 'overlay' helper to use "position: fixed"
* Improved autoSize, fixed wrong height in some cases
* Improved centering and iframe scrolling for iOS
* Updated markup, new element '.fancybox-skin' is now used for styling

### Version 2.0.5 - February 21, 2012

* Fixed #155 - easing for prev/next animations
* Fixed #153 - overriding "keys" options
* Fixed #147 - IE7 problem with #hash links
* Fixed #130 - changing dynamically data-fancybox-group
* Fixed #126 - obey minWidth/minHeight
* Fixed #118 - placement of loading icon and navigation arrows
* Fixed #101 - "index" option not working
* Fixed #94 - "orig" option not working
* Fixed #80 - does not work on IE6
* Fixed #72 - can't set overlay opacity to 0
* Fixed #63 - properly set gallery index
* New option "autoCenter" - toggles centering on window resize or scroll, disabled for mobile devices by default
* New option "autoResize" - toggles responsivity, disabled for mobile devices by default
* New option "preload" - number of images to preload
* New feature to target mobile/desktop browsers using CSS, see #108
* Changed ajax option defaults to "{ dataType: 'html', headers: { 'X-fancyBox': true } }", see #150 and #128
* Updated loading icon for IE7, IE8
* Calculates height of the iframe if 'autoSize' is set to 'true' and the iframe is on the same domain as the main page

### Version 2.0.4 - December 12, 2011

* Fixed #47 - fix overriding properties
* New option "position" to thumbnail and button helpers


### Version 2.0.3 - November 29, 2011

* Fixed #29 - broken elastic transitions


### Version 2.0.2 - November 28, 2011

* Fixed slidshow
* Fixed scrollbar issue when displayed a very tall image
* New option "nextClick" - navigate to next gallery item when user clicks the content
* New option "modal" - to disable navigation and closing
* Add 'metadata' plugin support
* Add ability to create groups using 'data-fancybox-group' attribute
* Updated manual usage to match earlier releases


### Version 2.0.1 - November 23, 2011

* Fixed keyboard events inside form elements
* Fixed manual usage


### Version 2.0.0 - November 21, 2011

First release - completely rewritten, many new features and updated graphics.