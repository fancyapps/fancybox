;(function (window, document, $, undefined) {
    'use strict';

    // If there's no jQuery, fancyBox can't work
    // =========================================

    if ( !$ ) {
        return undefined;
    }

    // Private default settings
    // ========================

    var defaults = {

        // Animation speed
        speed : 300,

        // Enable infinite gallery navigation
        loop : true,

        // Should zoom animation change opacity, too
        // If opacity is 'auto', then fade-out if image and thumbnail have different aspect ratios
        opacity : 'auto',

        // Space around image, ignored if zoomed-in or viewport smaller than 800px
        margin : [44, 0],

        // Horizontal space between slides
        gutter : 30,

        // Should display toolbars
        infobar : true,
        buttons : true,

        // What buttons should appear in the toolbar
        slideShow  : true,
        fullScreen : true,
        thumbs     : true,
        closeBtn   : true,

        // Should apply small close button at top right corner of the content
        // If 'auto' - will be set for content having type 'html', 'inline' or 'ajax'
        smallBtn : 'auto',

        image : {

            // Wait for images to load before displaying
            // Requires predefined image dimensions
            // If 'auto' - will zoom in thumbnail if 'width' and 'height' attributes are found
            preload : "auto",

            // Protect an image from downloading by right-click
            protect : false

        },

        ajax : {

            // Object containing settings for ajax request
            settings : {

                // This helps to indicate that request comes from the modal
                // Feel free to change naming
                data : {
                    fancybox : true
                }
            }

        },

        iframe : {

            // Iframe template
            tpl : '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen allowtransparency="true" src=""></iframe>',

            // Preload iframe before displaying it
            // This allows to calculate iframe content width and height
            // (note: Due to "Same Origin Policy", you can't get cross domain data).
            preload : true,

            // Scrolling attribute for iframe tag
            scrolling : 'no',

            // Custom CSS styling for iframe wrapping element
            css : {}

        },

        // Custom CSS class for layout
        baseClass : '',

        // Custom CSS class for slide element
        slideClass : '',

        // Base template for layout
        baseTpl	: '<div class="fancybox-container" role="dialog" tabindex="-1">' +
                '<div class="fancybox-bg"></div>' +
                '<div class="fancybox-controls">' +
                    '<div class="fancybox-infobar">' +
                        '<button data-fancybox-previous class="fancybox-button fancybox-button--left" title="Previous"></button>' +
                        '<div class="fancybox-infobar__body">' +
                            '<span class="js-fancybox-index"></span>&nbsp;/&nbsp;<span class="js-fancybox-count"></span>' +
                        '</div>' +
                        '<button data-fancybox-next class="fancybox-button fancybox-button--right" title="Next"></button>' +
                    '</div>' +
                    '<div class="fancybox-buttons">' +
                        '<button data-fancybox-close class="fancybox-button fancybox-button--close" title="Close (Esc)"></button>' +
                    '</div>' +
                '</div>' +
                '<div class="fancybox-slider-wrap">' +
                    '<div class="fancybox-slider"></div>' +
                '</div>' +
                '<div class="fancybox-caption-wrap"><div class="fancybox-caption"></div></div>' +
            '</div>',

        // Loading indicator template
        spinnerTpl : '<div class="fancybox-loading"></div>',

        // Error message template
        errorTpl : '<div class="fancybox-error"><p>The requested content cannot be loaded. <br /> Please try again later.<p></div>',

        closeTpl : '<button data-fancybox-close class="fancybox-close-small">×</button>',

        // Container is injected into this element
        parentEl : 'body',

        // Enable gestures (tap, zoom, pan and pinch)
        touch : true,

        // Enable keyboard navigation
        keyboard : true,

        // Try to focus on first focusable element after opening
        focus : true,

        // Close when clicked outside of the content
        closeClickOutside : true,

        // Callbacks
        beforeLoad	 : $.noop,
        afterLoad    : $.noop,
        beforeMove 	 : $.noop,
        afterMove    : $.noop,
        onComplete	 : $.noop,

        onInit       : $.noop,
        beforeClose	 : $.noop,
        afterClose	 : $.noop,
        onActivate   : $.noop,
        onDeactivate : $.noop

    };

    var $W = $(window);
    var $D = $(document);

    var called = 0;

    // Check if an object is a jQuery object and not a native JavaScript object
    // ========================================================================

    var isQuery = function (obj) {
        return obj && obj.hasOwnProperty && obj instanceof $;
    };

    // Handle multiple browsers for requestAnimationFrame()
    // ====================================================

    var requestAFrame = (function() {
        return  window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function( callback ) {
                    window.setTimeout(callback, 1000 / 60); };
                })();


    // Check if element is inside the viewport by at least 1 pixel
    // ===========================================================

    var isElementInViewport = function( el ) {
        var rect;

        if ( typeof $ === "function" && el instanceof $ ) {
            el = el[0];
        }

        rect = el.getBoundingClientRect();

        return rect.bottom > 0 &&
                rect.right > 0 &&
                rect.left < (window.innerWidth || document.documentElement.clientWidth)  &&
                rect.top < (window.innerHeight || document.documentElement.clientHeight);
    };


        // Class definition
        // ================

        var FancyBox = function( content, opts, index ) {
            var self = this;

            self.opts  = $.extend( true, {}, defaults, opts || {} );

            self.currIndex = parseInt( index, 10 ) || 0;
            self.prevIndex = null;

            self.id    = self.opts.id || ++called;
            self.group = [];

            // Create group elements from original item collection
            self.createGroup( content );

            if ( !self.group.length ) {
                return;
            }

            // Save last active element and current scroll position
            self.$lastFocus = $(document.activeElement);

            self.scrollTop	= $W.scrollTop();
            self.scrollLeft	= $W.scrollLeft();

            // Collection of interface DOM elements
            self.elems = {};

            // Collection of gallery objects
            self.slides = {};

            // Build layout and display current slide
            self.init( content );

        };

        $.extend(FancyBox.prototype, {

            // Create DOM structure
            // ====================

            init : function() {

                var self = this;
                var	$container;
                var w1, w2;

                if ( !$( 'body' ).hasClass( 'fancybox-enabled' ) ) {

                    w1 = $( 'body' ).width();

                    $( 'body' ).addClass( 'fancybox-enabled' );

                    w2 = $( 'body' ).width();

                    // Body width has increased - compensate missing scrollbars
                    if ( w2 - w1 > 1 ) {
                        $( '<style id="fancybox-noscroll" type="text/css">' ).html( '.compensate-for-scrollbar, .fancybox-enabled { margin-right: ' + ( w2 - w1 ) + 'px; }' ).appendTo( 'head' );
                    }

                }

                $container = $( self.opts.baseTpl )
                    .data( 'FancyBox', self )
                    .attr('id', 'fancybox-container-' + self.id)
                    .addClass( self.opts.baseClass )
                    .prependTo( self.opts.parentEl );

                // Create object holding references to jQuery wrapped nodes
                self.$refs = {
                    container   : $container,
                    bg          : $container.find('.fancybox-bg'),
                    controls    : $container.find('.fancybox-controls'),
                    buttons     : $container.find('.fancybox-buttons'),
                    slider_wrap : $container.find('.fancybox-slider-wrap'),
                    slider      : $container.find('.fancybox-slider'),
                    caption     : $container.find('.fancybox-caption')
                };

                self.prevPos = null;
                self.currPos = 0;

                self.allowZoomIn = true;

                self.trigger( 'onInit' );

                // Bring to front and enable events
                self.activate();

                // Try to avoid running multiple times
                if ( self.current ) {
                    return;
                }

                self.jumpTo( self.currIndex );

            },


            // Create array of gally item objects
            // Check if each object has valid type and content
            // ===============================================

            createGroup : function ( content ) {
                var self  = this;
                var items = $.makeArray( content );

                $.each(items, function( i, item ) {
                    var obj  = {},
                        opts = {},
                        $item,
                        data,
                        type,
                        src,
                        srcParts;

                    // Step 1 - Make sure we have an object

                    if ( $.isPlainObject( item ) ) {

                        obj  = item;
                        opts = item.opts || {};

                    } else if ( $.type( item ) === "string" && item.length ) {

                        obj = {
                            type    : 'html',
                            content : item
                        };

                    } else if ( $.type( item ) === 'object' && $( item ).length ) {

                        $item = $( item );
                        data  = $item.data();

                        opts = 'options' in data ? data.options : {};

                        opts = $.type( opts ) === 'object' ? opts : {};

                        obj.type = 'type' in data ? data.type : opts.type;
                        obj.src  = 'src'  in data ? data.src  : ( opts.src || $item.attr( 'href' ) );

                        opts.width   = 'width'   in data ? data.width   : opts.width;
                        opts.height  = 'height'  in data ? data.height  : opts.height;
                        opts.thumb   = 'thumb'   in data ? data.thumb   : opts.thumb;
                        opts.caption = 'caption' in data ? data.caption : ( opts.caption || $item.attr( 'title' ) );

                        opts.selector = 'selector'  in data ? data.selector  : opts.selector;

                        opts.$orig = $item;

                    } else {
                        return;

                    }

                    obj.opts = $.extend( true, {}, self.opts, opts );


                    // Step 2 - Make sure we have supported content type

                    type = obj.type;
                    src  = obj.src || '';

                    if ( !type ) {

                        if ( obj.content ) {
                            type = 'html';

                        } else if ( src.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i) ) {
                            type = 'image';

                        } else if ( src.match(/\.(pdf)((\?|#).*)?$/i) ) {
                            type = 'pdf';

                        } else if ( src.charAt(0) === '#' ) {
                            type = 'inline';

                        }

                        obj.type = type;

                    }

                    // Step 3 - Some adjustments

                    obj.index = self.group.length;

                    if ( obj.opts.$orig && !obj.opts.$orig.length ) {
                        delete obj.opts.$orig;
                    }

                    if ( !obj.opts.$thumb && obj.opts.$orig ) {
                        obj.opts.$thumb = obj.opts.$orig.find( 'img:first' );
                    }

                    if ( obj.opts.$thumb && !obj.opts.$thumb.length ) {
                        delete obj.opts.$thumb;
                    }

                    if ( $.type( self.opts.caption ) === 'function' ) {
                        obj.opts.caption = self.opts.caption.apply( item, [ self, obj ] );
                    }

                    if ( type === 'ajax' ) {
                        srcParts = src.split(/\s+/, 2);

                        if ( srcParts.length > 1 ) {
                            obj.src = srcParts.shift();

                            obj.opts.selector = srcParts.shift();
                        }
                    }

                    if ( obj.opts.smallBtn == 'auto' ) {

                        if ( $.inArray( type, ['html', 'inline', 'ajax'] ) > -1 ) {
                            obj.opts.buttons  = false;
                            obj.opts.smallBtn = true;

                        } else {
                            obj.opts.smallBtn = false;
                        }

                    }

                    if ( type === 'pdf' ) {

                        obj.type = 'iframe';

                        obj.opts.closeBtn = true;
                        obj.opts.smallBtn = false;

                        obj.opts.iframe.preload = false;

                    }

                    if ( obj.opts.modal ) {

                        $.extend(true, obj.opts, {
                            infobar		: 0,
                            buttons		: 0,
                            keyboard	: 0,
                            slideShow	: 0,
                            fullScreen	: 0,
                            closeClickOutside	: 0
                        });

                    }

                    self.group.push( obj );

                });

            },


            // Attach an event handler functions for:
            //   - navigation elements
            //   - browser scrolling, resizing;
            //   - focusing
            //   - keyboard
            // =================

            addEvents : function() {
                var self = this;

                var runUpdate = function () {

                    $W.scrollTop( self.scrollTop ).scrollLeft( self.scrollLeft );

                    self.$refs.slider_wrap.show();

                    self.update( true, true, true );
                };

                self.removeEvents();

                // Make navigation elements clickable

                self.$refs.container.on('touchstart.fb-close click.fb-close', '[data-fancybox-close]', function(e) {
                    e.stopPropagation();
                    e.preventDefault();

                    self.close( e );

                }).on('touchstart.fb-previous click.fb-previous', '[data-fancybox-previous]', function(e) {
                    e.stopPropagation();
                    e.preventDefault();

                    self.previous();

                }).on('touchstart.fb-next click.fb-next', '[data-fancybox-next]', function(e) {
                    e.stopPropagation();
                    e.preventDefault();

                    self.next();
                });


                // Handle browser scrolling, resizing

                $( window ).on('orientationchange.fb resize.fb', function(e) {

                    requestAFrame(function() {

                        if ( e.type == "orientationchange" ) {
                            self.$refs.slider_wrap.hide();

                            requestAFrame( runUpdate );

                        } else {

                            runUpdate();
                        }

                    });

                });

                // Trap focus

                $D.on('focusin.fb', function(e) {
                    var instance;

                    if ( $.fancybox ) {
                        instance = $.fancybox.getInstance();

                        if ( instance && !$( e.target ).hasClass( 'fancybox-container' ) && !$.contains( instance.$refs.container[0], e.target ) ) {
                            e.stopPropagation();

                            instance.focus();

                        }
                    }

                });

                // Enable keyboard navigation

                $( document ).on('keydown.fb', function (e) {
                    var current = self.current,
                        keycode = e.keyCode || e.which;

                    if ( !current || !current.opts.keyboard ) {
                        return;
                    }

                    if ( $(e.target).is('input') || $(e.target).is('textarea') ) {
                        return;
                    }

                    if ( keycode === 27 ) {

                        e.preventDefault();

                        self.close();

                        return;
                    }

                    switch ( keycode ) {

                        case 37: // Left arrow
                        case 38: // Up arrow

                            e.preventDefault();

                            self.previous();

                        break;

                        case 39: // Right arrow
                        case 40: // Down arrow

                            e.preventDefault();

                            self.next();

                        break;

                        case 80: // "P"
    					case 32: // Spacebar

    						e.preventDefault();

    						if ( self.SlideShow ) {
    							e.preventDefault();

    							self.SlideShow.toggle();
    						}

    					break;

                        case 70: // "F"

    						if ( self.FullScreen ) {
    							e.preventDefault();

    							self.FullScreen.toggle();
    						}

    					break;

                        case 71: // "G"

    						if ( self.Thumbs ) {
    							e.preventDefault();

    							self.Thumbs.toggle();
    						}

    					break;
                    }
                });


            },


            // Remove events added by the core
            // ===============================

            removeEvents : function () {

                $W.off( 'scroll.fb resize.fb orientationchange.fb' );
                $D.off( 'keydown.fb focusin.fb touchstart.fb-close click.fb-close' );

            },


            // Slide to left
            // ==================

            previous : function() {

                if ( this.current.opts.loop || this.currIndex > 0 ) {
                    this.jumpTo( this.currIndex - 1 );

                } else {
                    this.update();
                }

            },


            // Slide to right
            // ===================

            next : function() {

                if ( this.current.opts.loop || this.currIndex < this.group.length - 1 ) {
                    this.jumpTo( this.currIndex + 1 );

                } else {
                    this.update();
                }

            },


            // Display current gallery item, move slider to current position
            // =============================================================

            jumpTo : function ( to ) {
                var self = this,
                    isStarted = self.prevIndex !== null,
                    index,
                    pos,
                    start,
                    end;

                to = parseInt( to, 10 );

                index = to;
                pos   = to;
                start = to - 1;
                end   = to + 1;

                index = index % self.group.length;
                index = index < 0 ? self.group.length + index : index;

                if ( self.isAnimating || ( index == self.currIndex && isStarted ) ) {
                    return;
                }

                $.fancybox.stop( self.$refs.slider );

                if ( isStarted && self.group.length > 1 ) {

                    // Reset current slide (in case it is zoomed-in)

                    self.updateSlide( self.current, true );

                    // Calculate closest position from current one

                    if ( self.group.length == 2 ) {
                        pos = to - self.currIndex + self.currPos;

                    } else {
                        pos = index - self.currIndex + self.currPos;

                        if ( Math.abs( self.currPos - ( pos + self.group.length ) ) < Math.abs( self.currPos - pos ) ) {
                            pos = pos + self.group.length;

                        } else if ( Math.abs( self.currPos - ( pos - self.group.length ) ) < Math.abs( self.currPos - pos ) ) {
                            pos = pos - self.group.length;

                        }
                    }

                    start = Math.min(self.currPos, pos - 1);
                    end   = Math.max(self.currPos, pos + 1);

                }

                self.prevIndex = self.currIndex;
                self.prevPos   = self.currPos;

                self.currIndex = index;
                self.currPos   = pos;

                // Create missing slides including previous and next slides
                if ( self.group.length > 1 ) {

                    for ( var i = start; i <= end; i++ ) {

                        if ( self.opts.loop || ( i >= 0 && i < self.group.length ) ) {
                            self.createSlide( i );
                        }
                    }

                } else {

                    self.createSlide( 0 );

                }

                self.current = self.slides[ pos ];

                self.current.isMoved    = false;
                self.current.isComplete = false;

                self.$refs.container.addClass( 'fancybox-container--ready' );

                self.$refs.slider.children()
                    .removeClass('fancybox-slide--current')
                    .removeClass('fancybox-slide--complete');

                self.current.$slide.addClass('fancybox-slide--current');

                self.loadSlide( self.current );

                if ( self.slides[ pos + 1 ] ) {
                    self.loadSlide( self.slides[ pos + 1 ] );
                }

                if ( self.slides[ pos - 1 ] ) {
                    self.loadSlide( self.slides[ pos - 1 ] );
                }

                // Now, move slider to the next position
                // Note that the content might still be loading

                self.trigger( 'beforeMove' );

                // Set position immediately if not yet been open
                self.update( isStarted ? false : true, true, true );

            },


            // Create new "slide" element
            // These are gallery items  that are actually added to DOM
            // =======================================================

            createSlide : function( pos ) {

                var self = this;
                var $slide;
                var index;

                index = pos % self.group.length;
                index = index < 0 ? self.group.length + index : index;

                if ( !self.slides[ pos ] && self.group[ index ] ) {

                    $slide = $('<div class="fancybox-slide"></div>').appendTo( self.$refs.slider );

                    self.slides[ pos ] = $.extend( true, {}, self.group[ index ], {
                        pos      : pos,
                        $slide   : $slide,
                        isLoaded : false
                    });

                    // Make room for the content
                    self.updateSlide( self.slides[ pos ] );
                }

            },


            // Start "zoom-in" animation if possible
            // =====================================

            zoomIn : function() {

                var self = this;
                var current = self.current;
                var $what = current.$ghost ? current.$ghost.add( current.$image ) : current.$image;
                var $thumb;
                var pos;
                var to;
                var start;
                var end;
                var opacity;

                self.allowZoomIn = false;

                if ( !$what ) {
                    return false;
                }

                $thumb = current.opts.$thumb;
                pos    = $thumb ? $thumb.offset() : 0;

                if ( !pos || !isElementInViewport( $thumb ) ) {
                    return false;
                }

                self.isAnimating = true;

                start = {
                    top     : pos.top  - $(window).scrollTop()  + parseFloat( $thumb.css( "border-top-width" ) || 0 ),
                    left    : pos.left - $(window).scrollLeft() + parseFloat( $thumb.css( "border-left-width" ) || 0 ),
                    scaleX  : $thumb.width()  / current.width,
                    scaleY  : $thumb.height() / current.height
                };

                to = self.getFitPos( current );

                end = {
                    top     : to.top,
                    left    : to.left,
                    scaleX  : to.width  / current.width,
                    scaleY  : to.height / current.height
                };

                opacity = current.opts.opacity;

                if ( opacity == 'auto' ) {
                    opacity = Math.abs( start.scaleX / start.scaleY - end.scaleX / end.scaleY ) > 0.01;
                }

                if ( opacity ) {
                    start.opacity = 0.2;
                    end.opacity   = 1;
                }

                $what.show();

                $.fancybox.setTranslate( $what, start );

                self.updateCursor( end.scaleX, end.scaleY );

                $.fancybox.animate( $what, start, end, current.opts.speed, function() {

                    self.isAnimating = false;

                    self.updateCursor();

                    if ( current.$ghost ) {
                        self.setBigImage( current );
                    }

                });

                return true;
            },


            // Start "zoom-out" animation if possible
            // ======================================

            zoomOut : function( callback ) {

                var self    = this;
                var current = self.current;
                var $what   = current.$ghost ? current.$ghost.add( current.$image ) : current.$image;
                var $thumb;
                var thumbOffset;
                var slideOffset;
                var start;
                var end;
                var changeOpacity;

                $.fancybox.stop( self.$refs.slider );

                if ( !$what ) {
                    return false;
                }

                $thumb = current.opts.$thumb;

                thumbOffset = $thumb ? $thumb.offset() : 0;
                slideOffset = current.$slide.offset();

                if ( !thumbOffset || !isElementInViewport( $thumb ) ) {
                    return false;
                }

                end  = {
                    top     : thumbOffset.top  - slideOffset.top  + parseFloat( $thumb.css( "border-top-width" ) || 0 ),
                    left    : thumbOffset.left - slideOffset.left + parseFloat( $thumb.css( "border-left-width" ) || 0 ),
                    scaleX  : $thumb.width() / current.width,
                    scaleY  : $thumb.height() / current.height
                };

                changeOpacity = current.opts.opacity;

                // If opacity is 'auto', then fade-out if image and thumbnail have different aspect ratios
                if ( changeOpacity == 'auto' ) {
                    start   = $.fancybox.getTranslate( $what );
                    changeOpacity = Math.abs( start.scaleX / start.scaleY - end.scaleX / end.scaleY ) > 0.01;
                }

                if ( changeOpacity ) {
                    end.opacity = 0.2;
                }

                $.fancybox.animate( $what, null, end, current.opts.speed, callback );

                this.$refs.container.removeClass( 'fancybox-container--ready' );

                return true;
            },


            // Check if image dimensions exceed parent element
            // ===============================================

            canPan : function() {

                var self = this;

                var current = self.current;
                var $what   = current.$ghost ? current.$ghost.add( current.$image ) : current.$image;

                var rez = false;

                if ( $what ) {
                    rez = self.getFitPos( current );
                    rez = Math.abs( $what.width() - rez.width ) > 1  || Math.abs( $what.height() - rez.height ) > 1;

                }

                return rez;

            },


            // Check if current image dimensions are smaller than actual
            // =========================================================

            isScaledDown : function() {

                var self = this;

                var current = self.current;
                var $what   = current.$ghost ? current.$ghost.add( current.$image ) : current.$image;

                var rez = false;

                if ( $what ) {
                    rez = $.fancybox.getTranslate( $what );
                    rez = ( rez.scaleX < 1 || rez.scaleY < 1 );
                }

                return rez;

            },


            // Scale image to the actual size of the image
            // ===========================================

            scaleToActual : function( x, y ) {

                var self = this;

                var current = self.current;
                var slide   = self.current;
                var $what   = current.$ghost ? current.$ghost.add( current.$image ) : current.$image;

                var imgPos, imgW, imgH;

                var distW, distH, posX, posY;

                var canvasWidth  = parseInt( slide.$slide.width(), 10 );
                var canvasHeight = parseInt( slide.$slide.height(), 10 );

                var newImgWidth  = slide.width;
                var newImgHeight = slide.height;

                if ( !$what ) {
                    return;
                }

                self.isAnimating = true;

                imgPos = $.fancybox.getTranslate( $what );

                imgW = $what.width();
                imgH = $what.height();

                x = x === undefined ? canvasWidth  * 0.5  : x;
                y = y === undefined ? canvasHeight * 0.5  : y;

                // Distance from click position to image center

                distW = x - ( imgPos.left + imgW * 0.5 );
                distH = y - ( imgPos.top  + imgH * 0.5 );

                // Get center position for original image

                posX = ( canvasWidth * 0.5  - newImgWidth * 0.5 );
                posY = ( canvasHeight * 0.5 - newImgHeight * 0.5 );

                // Make sure image does not move away from edges

                if ( newImgWidth > canvasWidth) {

                    posX = posX - ( ( distW * (  newImgWidth / imgW  ) ) - distW );

                    if ( posX > 0 ) {
                        posX = 0;
                    }

                    if ( posX <  canvasWidth - newImgWidth ) {
                        posX = canvasWidth - newImgWidth;
                    }
                }

                if ( newImgHeight > canvasHeight) {

                    posY = posY - ( ( distH * (  newImgHeight / imgH  ) ) - distH );

                    if ( posY > 0 ) {
                        posY = 0;
                    }

                    if ( posY <  canvasHeight - newImgHeight ) {
                        posY = canvasHeight - newImgHeight;
                    }

                }

                self.updateCursor( newImgWidth  / current.width, newImgHeight / current.height );

                $.fancybox.animate( $what, null, {
                    top     : posY,
                    left    : posX,
                    scaleX  : newImgWidth  / current.width,
                    scaleY  : newImgHeight / current.height,
                }, 250, function() {

                    self.isAnimating = false;

                });

            },


            // Scale image to fit inside parent element
            // ========================================

            scaleToFit : function() {

                var self = this;

                var current = self.current;
                var $what   = current.$ghost ? current.$ghost.add( current.$image ) : current.$image;
                var to;

                if ( !$what ) {
                    return;
                }

                self.isAnimating = true;

                to = self.getFitPos( current );

                self.updateCursor( to.width / current.width, to.height / current.height );

                $.fancybox.animate( $what, null, {
                    top     : to.top,
                    left    : to.left,
                    scaleX  : to.width  / current.width,
                    scaleY  : to.height / current.height,
                }, 250, function() {

                    self.isAnimating = false;

                });

            },

            // Calculate image size to fit inside viewport
            // ===========================================

            getFitPos : function( slide ) {
                var $what = slide.$ghost || slide.$image;

                var imgWidth  = slide.width;
                var imgHeight = slide.height;

                var margin = slide.opts.margin;

                var canvasWidth, canvasHeight, minRatio, top, left, width, height;

                if ( !$what || !$what.length || ( !imgWidth && !imgHeight) ) {
                    return false;
                }

                if ( $.type( margin ) === "number" ) {
                    margin = [ margin, margin ];
                }

                if ( margin.length == 2 ) {
                    margin = [ margin[0], margin[1], margin[0], margin[1] ];
                }

                if ( $W.width() < 800 ) {
                    margin = [0, 0, 0, 0];
                }

                canvasWidth  = parseInt( slide.$slide.width(), 10 )  - ( margin[ 1 ] + margin[ 3 ] );
                canvasHeight = parseInt( slide.$slide.height(), 10 ) - ( margin[ 0 ] + margin[ 2 ] );

                minRatio = Math.min(1, canvasWidth / imgWidth, canvasHeight / imgHeight );

                // Use floor rounding to make sure it really fits

                width  = Math.floor( minRatio * imgWidth );
                height = Math.floor( minRatio * imgHeight );

                top  = Math.floor( ( canvasHeight - height ) * 0.5 ) + margin[ 0 ];
                left = Math.floor( ( canvasWidth  - width )  * 0.5 ) + margin[ 3 ];

                return {
                    top    : top,
                    left   : left,
                    width  : width,
                    height : height
                };

            },


            // Move slider to current position
            // Update all slides (and their content)
            // =====================================

            update : function( immediately, andSlides, andContent ) {

                var self = this;

                var duration  = parseInt( self.opts.speed, 10 );
                var leftValue = ( self.currPos * Math.floor( self.current.$slide.width() ) * -1  ) - ( self.current.pos * self.current.opts.gutter ) ;

                if ( immediately || !duration ) {
                    $.fancybox.setTranslate( self.$refs.slider, { left : leftValue } );

                    self.afterMove();

                } else {

                    $.fancybox.animate( self.$refs.slider, null, {
                        top  : 0,
                        left : leftValue
                    }, duration, "easeOutCubic", function() {

                        self.current.isMoved = true;

                        self.afterMove();

                    });

                }

                if ( andSlides ) {

                    $.each( self.slides, function( key, slide ) {

                        self.updateSlide( slide, andContent );

                    });

                } else if ( andContent ) {

                    self.updateSlide( self.current, andContent );

                }

                self.updateControls();

                self.updateCursor();

                self.trigger( 'onUpdate' );
            },


            // Update slide position and scale content to fit
            // ==============================================

            updateSlide : function( slide, andContent ) {

                var self  = this;
                var $what;
                var to;

                slide = slide || self.current;

                if ( !slide || self.isClosing ) {
                    return;
                }

                $what = slide.$ghost ? slide.$ghost.add( slide.$image ) : slide.$image;

                $.fancybox.setTranslate( slide.$slide, { left : ( slide.pos * Math.floor( slide.$slide.width() )  ) + ( slide.pos * slide.opts.gutter) } );

                if ( andContent && $what ) {
                    to = self.getFitPos( slide );

                    if ( to ) {
                        $.fancybox.setTranslate( $what, {
                            top     : to.top,
                            left    : to.left,
                            scaleX  : to.width  / slide.width,
                            scaleY  : to.height / slide.height
                        });
                    }

                }

                slide.$slide.trigger( 'refresh' );

            },

            // Update cursor style depending if content can be zoomed
            // ======================================================

            updateCursor : function( nextW, nextH ) {

                var self = this;

                var $container = self.$refs.container;

                var canScale;

                $container.removeClass('fancybox-controls--canzoomIn');
                $container.removeClass('fancybox-controls--canzoomOut');
                $container.removeClass('fancybox-controls--canGrab');

                if ( self.isClosing || !self.opts.touch ) {
                    return;
                }

                if ( nextW !== undefined && nextH !== undefined ) {
                    canScale = nextW < 1 && nextH < 1;

                } else {
                    canScale = self.isScaledDown();
                }

                if ( canScale ) {
                    $container.addClass('fancybox-controls--canzoomIn');


                } else if ( self.group.length < 2 ) {
                    $container.addClass('fancybox-controls--canzoomOut');


                } else {
                    $container.addClass('fancybox-controls--canGrab');
                }

            },

            // Load content into the slide
            // ===========================

            loadSlide : function( slide ) {
                var self = this, type, $slide;
                var ajaxLoad;

                if ( !slide ) {
                    return false;
                }

                if ( slide.isLoaded && !slide.hasError ) {
                    return;
                }

                if ( slide.timouts ) {
                    clearTimeout( slide.timouts );

                    slide.timouts = null;
                }

                self.trigger( 'beforeLoad', slide );

                type	= slide.type;
                $slide	= slide.$slide;

                $slide
                    .unbind( 'refresh' )
                    .trigger( 'onReset' )
                    .addClass( 'fancybox-slide--' + ( type || 'unknown' ) )
                    .addClass( slide.opts.slideClass );


                // Create content depending on the type

                switch ( type ) {

                    case 'image':

                        self.setImage( slide );

                    break;

                    case 'iframe':

                        self.setIframe( slide );

                    break;

                    case 'html':

                        self.setContent( slide, $('<div />').append( slide.content ).contents() );

                    break;

                    case 'inline':

                        if ( $( slide.src ).length ) {

                            self.setContent( slide, $( slide.src ) );

                        } else {

                            self.setError( slide );

                        }

                    break;

                    case 'ajax':

                        self.showLoading( slide );

                        ajaxLoad = $.ajax( $.extend( {}, slide.opts.ajax.settings, {

                            url: slide.src,

                            success: function ( data, textStatus ) {

                                if ( textStatus === 'success' ) {

                                    self.setContent( slide, data );

                                }

                            },

                            error: function ( jqXHR, textStatus ) {

                                if ( jqXHR && textStatus !== 'abort' ) {

                                    self.setError( slide );

                                }

                            }

                        }));

                        $slide.one( 'onReset', function () {

                            ajaxLoad.abort();

                        });

                    break;

                    default:

                        self.setError( slide );

                    break;

                }

                return true;

            },


            // Create image and add events
            // ================================

            setImage : function( slide ) {

                var self = this;
                var img;

                if ( slide.isLoaded && !slide.hasError ) {
                    self.afterLoad( slide );

                    return;
                }

                // If possible, use thumbnail image to create ghost element
                // so users would not stare at loading icon but see zoom-in animation instead.

                if ( slide.opts.preload !== false && slide.opts.width && slide.opts.height && ( slide.opts.thumb || slide.opts.$thumb ) ) {

                    slide.hasGhost = true;

                    slide.width  = slide.opts.width;
                    slide.height = slide.opts.height;

                    img = new Image( slide.width, slide.height );

                    img.onerror = function() {

                        this.onload = this.onerror = null;

                        self.setError( slide );

                    };

                    img.onload = function() {

                        this.onload = this.onerror = null;

                        if ( self.isClosing ) {
                            return;
                        }

                        // Start loading actual image

                        $('<img/>')[0].src = slide.src;

                        if ( !self.allowZoomIn || !self.zoomIn() ) {

                            $( this ).show();

                            self.updateSlide( slide );

                            self.setBigImage( slide );

                        }

                    };

                    $( img )
                        .addClass( 'fancybox-image' )
                        .prependTo( slide.$slide )
                        .hide();

                    slide.$ghost = $( img );

                    img.src = slide.opts.thumb || slide.opts.$thumb.attr( 'src' );

                } else {

                    self.setBigImage( slide );

                }

            },

            setBigImage : function( slide ) {

                var self = this;
                var img  = new Image();

                img.onerror = function() {

                    this.onload = this.onerror = null;

                    if ( slide.timouts ) {
                        clearTimeout( slide.timouts );
                    }

                    self.setError( slide );

                };

                img.onload = function() {

                    this.onload = this.onerror = null;

                    if ( self.isClosing ) {
                        return;
                    }

                    slide.width  = this.naturalWidth;
                    slide.height = this.naturalHeight;

                    if ( slide.opts.image.protect ) {

                        slide.$image.css({
                            width  : slide.width,
                            height : slide.height,
                        });

                    }

                    if ( slide.$ghost ) {

                        $.fancybox.setTranslate( slide.$image, $.fancybox.getTranslate( slide.$ghost ) );

                        if ( slide.timouts ) {
                            clearTimeout( slide.timouts );
                        }

                        slide.timouts = setTimeout(function() {

                            if ( slide.$ghost && !self.isClosing ) {

                                slide.$ghost.remove();

                                slide.$ghost = null;
                            }

                        }, 300);

                    }

                    slide.$image.show();

                    self.afterLoad( slide );

                };

                if ( slide.opts.image.protect ) {
                    slide.$image = $( '<div class="fancybox-image"><div style="background-image:url(' + slide.src + ');"></div><div class="fancybox-spaceball"></div></div>' ).appendTo( slide.$slide );

                } else {
                    slide.$image = $( img ).addClass('fancybox-image').appendTo( slide.$slide );

                }

                slide.$image.hide();

                img.src = slide.src;

                slide.timouts = setTimeout(function() {

                    if ( !self.isAnimating && !( img.complete && img.naturalWidth > 0 ) ) {
                        self.showLoading( slide );
                    }

                    slide.timouts = null;

                }, 150);

            },

            // Create iframe wrapper, iframe and bindings
            // ==========================================

            setIframe : function( slide ) {
                var self	= this,
                    opts    = slide.opts.iframe,
                    $slide	= slide.$slide,
                    $iframe;

                slide.$content = $('<div class="fancybox-content"></div>')
                    .css( opts.css )
                    .appendTo( $slide );

                $iframe = $( opts.tpl.replace(/\{rnd\}/g, new Date().getTime()) )
                    .attr('scrolling', $.fancybox.isTouch ? 'auto' : opts.scrolling)
                    .appendTo( slide.$content );

                if ( opts.preload ) {

                    slide.$content.addClass( 'fancybox-tmp' );

                    self.showLoading( slide );

                    // Unfortunately, it is not always possible to determine if iframe is successfully loaded
                    // (due to browser security policy)

                    $iframe.on('load.fb error.fb', function(e) {
                        this.isReady = 1;

                        slide.$slide.trigger( 'refresh' );

                        self.afterLoad( slide );

                    });

                    // Recalculate iframe content size

                    $slide.on('refresh.fb', function() {
                        var $wrap = slide.$content,
                            $contents,
                            $body,
                            scrollWidth,
                            frameWidth,
                            frameHeight;

                        if ( $iframe[0].isReady !== 1 ) {
                            return;
                        }

                        // Check if content is accessible,
                        // it will fail if frame is not with the same origin

                        try {
                            $contents	= $iframe.contents();
                            $body		= $contents.find('body');

                        } catch (ignore) {}

                        // Calculate dimensions for the wrapper

                        if ( $body && $body.length && !( opts.css.width !== undefined && opts.css.height !== undefined ) ) {

                            scrollWidth = $iframe[0].contentWindow.document.documentElement.scrollWidth;

                            frameWidth	= Math.ceil( $body.outerWidth(true) + ( $wrap.width() - scrollWidth ) );
                            frameHeight	= Math.ceil( $body.outerHeight(true) );

                            // Resize wrapper to fit iframe content

                            $wrap.css({
                                'width'  : opts.css.width  === undefined ? frameWidth  + ( $wrap.outerWidth()  - $wrap.innerWidth() )  : opts.css.width,
                                'height' : opts.css.height === undefined ? frameHeight + ( $wrap.outerHeight() - $wrap.innerHeight() ) : opts.css.height
                            });

                        }

                        $wrap.removeClass( 'fancybox-tmp' );

                    });

                } else {

                    this.afterLoad( slide );

                }

                $iframe.attr( 'src', slide.src );

                if ( slide.opts.smallBtn ) {
                    slide.$content.prepend( slide.opts.closeTpl );
                }

                // Remove iframe if closing or changing gallery item

                $slide.one('onReset', function () {

                    // This helps IE not to throw errors when closing

                    try {

                        $(this).find('iframe').hide().attr('src', '//about:blank');

                    } catch (ignore) {}

                    $(this).empty();

                });

            },


            // Wrap and append content to the slide
            // ======================================

            setContent : function ( slide, content ) {

                var self = this;

                self.hideLoading( slide );

                slide.$slide.empty();

                // If we have "selector" property, then display only matching element

                if ( slide.opts.selector ) {

                    content = $('<div>').html( content ).find( slide.opts.selector );

                }

                if ( isQuery( content ) && content.parent().length ) {

                    // If it is a jQuery object, then it will be moved to the box.
                    // The placeholder is created so we will know where to put it back.
                    // If user is navigating gallery fast, then the content might be already moved to the box

                    if ( content.data( 'placeholder' ) ) {

                        content.parents('.fancybox-slide').trigger( 'onReset' );

                    }

                    content.data({
                            'placeholder' : $('<div class="fancybox-placeholder"></div>' ).insertAfter( content ).hide()
                        })
                        .css('display', 'inline-block');

                }

                slide.$slide.one('onReset', function () {

                    var placeholder = isQuery( content ) ? content.data('placeholder') : 0;

                    if ( placeholder ) {

                        content.hide().replaceAll( placeholder );

                        content.data( 'placeholder', null );
                    }

                    $(this).empty();

                    slide.isLoaded = false;

                });

                slide.$content = $( content );

                slide.$content.appendTo( slide.$slide );

                if ( slide.opts.smallBtn === true ) {
                    slide.$content.remove( '.fancybox-close-small' ).eq(0).append( slide.opts.closeTpl );
                }

                this.afterLoad( slide );

            },

            // Display error message
            // =====================

            setError : function ( slide ) {

                slide.hasError = true;

                this.hideLoading( slide );

                this.setContent( slide, slide.opts.errorTpl );

            },


            showLoading : function( slide ) {
                var self = this;

                slide = slide || self.current;

                if ( slide && !slide.$spinner ) {

                    slide.$spinner = $( self.opts.spinnerTpl ).appendTo( slide.$slide );
                }

            },

            hideLoading : function( slide ) {

                var self = this;

                slide = slide || self.current;

                if ( slide && slide.$spinner && slide.$spinner.length ) {
                    slide.$spinner.remove();

                    slide.$spinner = null;
                }

            },

            afterMove : function() {

                var self    = this;
                var current = self.current;

                if ( !current ) {
                    return;
                }

                current.isMoved = true;

                current.$slide.siblings().trigger( 'onReset' );

                // Remove unnecessary slides
                $.each( self.slides, function( key, slide ) {

                    // Leave current and neighbouring slides
                    if ( slide.pos < self.currPos - 1 || slide.pos > self.currPos + 1 ) {

                        slide.$slide.remove();

                        delete self.slides[ key ];

                    }

                });

                self.trigger( 'afterMove' );

                if ( current.isLoaded ) {
                    self.complete();
                }

            },

            // Adjustments after slide has been loaded
            // =======================================

            afterLoad : function( slide ) {

                var self = this;

                if ( self.isClosing ) {
                    return;
                }

                slide.isLoaded = true;

                self.trigger( 'afterLoad', slide );

                self.hideLoading( slide );

                if ( !slide.$ghost ) {

                    self.updateSlide( slide, true );

                }

                if ( slide.pos == self.currPos ) {

                    if ( slide.isMoved ) {

                        self.complete();

                    } else {

                        self.updateCursor();
                    }

                }

            },

            // Final adjustments after current gallery item is moved to position
            // and it`s content is loaded
            // ==================================================================

            complete : function() {

                var self = this;

                self.current.isComplete = true;

                if ( !self.allowZoomIn || !self.zoomIn() ) {
                    self.updateCursor();
                }

                self.current.$slide.addClass('fancybox-slide--complete');

                if ( self.opts.focus ) {

                    self.focus();

                }

                self.trigger( 'onComplete' );

            },


            // Try to find and focus on the first focusable element
            // ====================================================

            focus : function() {
                var $el = this.current && this.current.isComplete ? this.current.$slide.find('button,:input,[tabindex],a:not(".disabled")').filter(':visible:first') : null;

                if ( !$el || !$el.length ) {
                    $el = this.$refs.container

                }

                $el.focus();

                // Scroll position of wrapper element sometimes changes after focusing (IE)
                this.$refs.slider_wrap.scrollLeft(0);
            },


            // Activates current instance - brings container to the front and enables keyboard,
            // notifies other instances about deactivating
            // =================================================================================

            activate : function () {
                var self = this;

                // Deactivate all instances

                $( '.fancybox-container' ).each(function () {

                    var instance = $(this).data( 'FancyBox' );

                    // Skip self and closing instances

                    if (instance && instance.uid !== self.uid && !instance.isClosing) {
                        instance.trigger( 'onDeactivate' );
                    }

                });

                if ( self.current ) {

                    if ( self.$refs.container.index() > 0 ) {
                        self.$refs.container.prependTo( document.body );
                    }

                    self.updateControls();
                }

                self.trigger( 'onActivate' );

                self.addEvents();

            },


            // Start closing procedure
            // This will start "zoom-out" animation if needed and clean everything up afterwards
            // =================================================================================

            close : function( e ) {
                var self    = this;
                var current = self.current;

                var done = $.proxy(function() {

                    self.cleanUp( e );  // Now "this" is again our instance

                }, this);

                if ( self.isClosing ) {
                    return false;
                }

                self.isClosing = true;

                if ( current.timouts ) {
                    clearTimeout( current.timouts );
                }

                self.$refs.container
                    .removeClass('fancybox-container--active')
                    .addClass('fancybox-container--closing');

                current.$slide
                    .removeClass('fancybox-slide--complete')
                    .siblings()
                    .remove();

                // Remove all events
                // If there are multiple instances, they will be set again by "activate" method

                self.removeEvents();

                // Clean up

                this.hideLoading( current );

                this.hideControls();

                this.updateCursor();

                self.trigger( 'beforeClose', current, e );

                $W.scrollTop( self.scrollTop ).scrollLeft( self.scrollLeft );

                if ( e === true) {

                    setTimeout( done, current.opts.speed );

                    this.$refs.container.removeClass( 'fancybox-container--ready' );

                } else if ( !self.zoomOut( done ) ) {

                    $.fancybox.animate( self.$refs.container, null, { opacity : 0 }, current.opts.speed, "easeInCubic", done );

                }

            },


            // Final adjustments after removing the instance
            // =============================================

            cleanUp : function( e ) {
                var self = this,
                    instance;

                self.$refs.slider.children().trigger( 'onReset' );

                self.$refs.container.empty().remove();

                self.current = null;

                self.trigger( 'afterClose', e);

                // Check if there are other instances

                instance = $.fancybox.getInstance();

                if ( instance ) {

                    instance.activate();

                } else {

                    $( 'body' ).removeClass( 'fancybox-enabled' );

                    $( '#fancybox-noscroll' ).remove();

                }

                // Place back focus

                if ( self.$lastFocus ) {
                    self.$lastFocus.focus();
                }

            },


            // Call callback and trigger an event
            // ==================================

            trigger : function( name, slide ) {
                var args  = Array.prototype.slice.call(arguments, 1),
                    self  = this,
                    obj   = slide && slide.opts ? slide : self.current;

                if ( obj ) {
                    args.unshift( obj );

                } else {
                    obj = self;
                }

                args.unshift( self );

                if ( $.isFunction( obj.opts[ name ] ) ) {
                    obj.opts[ name ].apply( obj, args );
                }

                self.$refs.container.trigger( name + '.fb', args);

            },


            // Toggle toolbar and caption
            // ==========================

            toggleControls : function( force ) {

                if ( this.isHiddenControls ) {

                    this.updateControls( force );

                } else {
                    this.hideControls();
                }


            },


            // Hide toolbar and caption
            // ========================

            hideControls : function () {

                this.isHiddenControls = true;

                this.$refs.container.removeClass('fancybox-show-controls');

                this.$refs.container.removeClass('fancybox-show-caption');

            },


            // Update infobar values, navigation button states and reveal caption
            // ==================================================================

            updateControls : function ( force ) {

                var self = this;

                var $container = self.$refs.container;
                var $caption   = self.$refs.caption;

                // Toggle infobar and buttons

                var current  = self.current;
                var index    = current.index;
                var opts     = current.opts;
                var caption  = opts.caption;

                if ( this.isHiddenControls && force !== true ) {
                    return;
                }

                this.isHiddenControls = false;

                self.$refs.container.addClass('fancybox-show-controls');

                $container
                    .toggleClass('fancybox-show-infobar', !!opts.infobar && self.group.length > 1)
                    .toggleClass('fancybox-show-buttons', !!opts.buttons )
                    .toggleClass('fancybox-is-modal',     !!opts.modal );

                $('.fancybox-button--left',  $container).toggleClass( 'fancybox-button--disabled', (!opts.loop && index <= 0 ) );
                $('.fancybox-button--right', $container).toggleClass( 'fancybox-button--disabled', (!opts.loop && index >= self.group.length - 1) );

                $('.fancybox-button--play',  $container).toggle( !!( opts.slideShow && self.group.length > 1) );
                $('.fancybox-button--close', $container).toggle( !!opts.closeBtn );

                // Update infobar values

                $('.js-fancybox-count', $container).html( self.group.length );
                $('.js-fancybox-index', $container).html( index + 1 );

                // Recalculate content dimensions
                current.$slide.trigger( 'refresh' );

                // Reveal or create new caption
                if ( $caption ) {
                    $caption.empty();
                }

                if ( caption && caption.length ) {

                    $caption.html( caption );

                    this.$refs.container.addClass( 'fancybox-show-caption ');

                    self.$caption = $caption;

                } else {

                    this.$refs.container.removeClass( 'fancybox-show-caption' );

                }

            }

        });


        $.fancybox = {

            version  : "3.0.5",
            defaults : defaults,


            // Get current instance and execute a command.
            //
            // Examples of usage:
            //
            //   $instance = $.fancybox.getInstance();
            //   $.fancybox.getInstance().jumpTo( 1 );
            //   $.fancybox.getInstance( 'jumpTo', 1 );
            //   $.fancybox.getInstance( function() {
            //       console.info( this.currIndex );
            //   });
            // ======================================================

            getInstance : function ( command ) {
                var instance = $('.fancybox-container:not(".fancybox-container--closing"):first').data( 'FancyBox' );
                var args     = Array.prototype.slice.call(arguments, 1);

                if ( instance instanceof FancyBox ) {

                    if ( $.type( command ) === 'string' ) {
                        instance[ command ].apply( instance, args );

                    } else if ( $.type( command ) === 'function' ) {
                        command.apply( instance, args );

                    }

                    return instance;
                }

                return false;

            },


            // Create new instance
            // ===================

            open : function ( items, opts, index ) {

                return new FancyBox( items, opts, index );

            },


            // Close current or all instances
            // ==============================

            close : function ( all ) {

                var instance = this.getInstance();

                if ( instance ) {

                    instance.close();

                    // Try to find and close next instance

                    if ( all === true ) {

                        this.close();

                    }
                }

            },


            // Test for the existence of touch events in the browser
            // =====================================================

            isTouch : document.createTouch !== undefined,


            // Helper function to get current visual state of an element
            // returns array[ top, left, horizontal-scale, vertical-scale, opacity ]
            // =====================================================================

            getTranslate : function( el ) {

                var matrix = $( el ).eq(0).css('transform');

                if ( matrix && matrix.indexOf( 'matrix' ) !== -1 ) {
                    matrix = matrix.split('(')[1];
                    matrix = matrix.split(')')[0];
                    matrix = matrix.split(',');
                } else {
                    matrix = [];
                }

                if ( matrix.length ) {

                    // If IE
                    if ( matrix.length > 10 ) {
                        matrix = [ matrix[13], matrix[12], matrix[0], matrix[5] ];

                    } else {
                        matrix = [ matrix[5], matrix[4], matrix[0], matrix[3]];
                    }

                    matrix = matrix.map(parseFloat);

                } else {
                    matrix = [ 0, 0, 1, 1 ];
                }

                return {
                    top     : matrix[ 0 ],
                    left    : matrix[ 1 ],
                    scaleX  : matrix[ 2 ],
                    scaleY  : matrix[ 3 ],
                    opacity : parseFloat( $( el ).css('opacity') ) || 1
                };

            },


            // Shortcut for setting "translate3d" properties for element
            // Can set be used to set opacity, too
            // ========================================================

            setTranslate : function( el, props ) {
                var curr = this.getTranslate( el );
                var str  = '';

                if ( props.left !== undefined || props.top !== undefined ) {

                    str = ( props.left === undefined ? curr.left : props.left )  + 'px, ' + ( props.top === undefined ? curr.top : props.top ) + 'px';

                    if ( $( el ).get(0) && window.getComputedStyle( $( el ).get(0) ).getPropertyValue('transform') && !(document.documentMode && document.documentMode <= 9) ) {
                        str = 'translate3d(' + str + ', 0px)';

                    } else {
                        str = 'translate(' + str + ')';
                    }

                }

                if ( props.scaleX >= 0 && props.scaleY >= 0 ) {
                    str += ' scale(' + props.scaleX + ', ' + props.scaleY + ')';
                }

                if ( str.length ) {
                    $( el ).css( 'transform', str.trim() );
                }

                if ( props.opacity ) {
                    $( el ).css( 'opacity', props.opacity );
                }

            },


            // Easing functions for fancybox animation
            // t: current time, b: begInnIng value, c: change In value, d: duration
            // ====================================================================

            easing : {
                easeOutCubic : function (t, b, c, d) {
                    return c*((t=t/d-1)*t*t + 1) + b;
                },
                easeInCubic : function (t, b, c, d) {
                    return c*(t/=d)*t*t + b;
                },
                easeOutSine : function (t, b, c, d) {
                    return c * Math.sin(t/d * (Math.PI/2)) + b;
                },
                swing : function(t, b, c, d) {
                    return c*(t/d) + b;
                }
            },


            // Stop fancyBox animation
            // =======================

            stop : function( el ) {

                $( el ).removeData( 'faid' );

            },

            // Animate element using "translate3d"
            // Usage:
            // animate( element, start properties, end properties, duration, easing, callback )
            // or
            // animate( element, start properties, end properties, duration, callback )
            // =================================================================================

            animate : function( el, from, to, duration, easing, done ) {

                var lastTime;

                var animTime  = 0;
                var iteration = 0;

                var self = this;
                var $el  = $( el );
                var id   = $el.data( 'faid' ) || 0;

                function frame( timestamp ) {
                    var diff;
                    var curr = [];

                    // Check if animation should end

                    $el = $el.filter(function( index ) {
                        return $( this ).length === 1 && $( this ).is(':visible');
                    });

                    // There is nothing to animate - call callback and stop
                    if ( !$el.length ) {
                        done();

                        return;
                    }

                    // If "stop" method has been called on this element, then just stop
                    if ( $el.data( 'faid' ) !== id ) {
                        return;
                    }

                    timestamp = timestamp || Date.now();

                    if ( !lastTime ) {
                        lastTime = timestamp;
                    }

                    diff = timestamp - lastTime;

                    // Lag smoothing
                    if ( diff > 250 ) {
                        diff = 16;
                    }

                    lastTime = timestamp;
                    animTime += diff;

                    // Are we done?
                    if ( animTime >= duration ) {

                        self.setTranslate( $el, to );

                        done();

                    } else {

                        for ( var prop in to ) {

                            if ( to.hasOwnProperty( prop ) && from[ prop ] !== undefined ) {

                                if ( from[ prop ] == to[ prop ] ) {
                                    curr[ prop ] = to[ prop ];

                                } else {
                                    curr[ prop ] = self.easing[ easing ]( iteration, from[ prop ], to[ prop ] - from[ prop ], duration );
                                }

                            }
                        }

                        iteration += diff;

                        self.setTranslate( $el, curr );

                        requestAFrame( frame );

                    }
                }

                id++;

                $el.data( 'faid', id );

                if ( done === undefined && $.type(easing) == 'function' ) {
                    done   = easing;
                    easing = undefined;
                }

                if ( !easing ) {
                    easing = "easeOutCubic";
                }

                done = done || $.noop;

                if ( !duration ) {

                    this.setTranslate( $el, to );

                    done();

                    return;
                }

                if ( !from ) {

                    // we need current values to calculate change in time
                    from = this.getTranslate( $el );

                }

                requestAFrame( frame );
            }

        };


        // Event handler for click event to "fancyboxed" links
        // ===================================================

        function _run( e ) {
            var target	= e.currentTarget,
            opts	= e.data ? e.data.options : {},
            items	= e.data ? e.data.items : [],
            value	= '',
            index	= 0;

            e.preventDefault();
            e.stopPropagation();

            // Get all related items and find index for clicked one

            if ( $(target).attr( 'data-fancybox' ) ) {
                value = $(target).data( 'fancybox' );
            }

            if ( value ) {
                items = items.length ? items.filter( '[data-fancybox="' + value + '"]' ) : $( '[data-fancybox=' + value + ']' );
                index = items.index( target );

            } else {
                items = [ target ];
            }

            $.fancybox.open( items, opts, index );
        }


        // Create a jQuery plugin
        // ======================

        $.fn.fancybox = function (options) {

            this.off('click.fb-start').on('click.fb-start', {
                items   : this,
                options : options || {}
            }, _run);

            return this;

        };


        // Self initializing plugin
        // ========================

        $(document).on('click.fb-start', '[data-fancybox]', _run);

    }(window, document, window.jQuery));
