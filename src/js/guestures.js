// ==========================================================================
//
// Guestures v1.0.0
// Adds touch guestures
//
// ==========================================================================
;(function (window, document, $) {
	'use strict';

	var requestAFrame = (function() {
		return  window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				function( callback ) {
					window.setTimeout(callback, 1000 / 60); };
				})();

	var hasScrollbars = function( node ) {
		var overflowY = window.getComputedStyle(node)['overflow-y'];
		var overflowX = window.getComputedStyle(node)['overflow-x'];

		var vertical   = (overflowY === 'scroll' || overflowY === 'auto') && node.scrollHeight > node.clientHeight;
		var horizontal = (overflowX === 'scroll' || overflowX === 'auto') && node.scrollWidth > node.clientWidth;

		return vertical || horizontal;
	};

	var isScrollable = function ( el ) {
		var rez = false;

		while (true) {
			rez	= hasScrollbars( el );

			if ( rez ) {
				break;
			}

			el = $(el).parent().get(0);

			if ( !el || $( el ).hasClass('fancybox-slider') || $( el ).is('body') ) {
				break;
			}

		}

		return rez;

	};

	var Guestures = function ( instance ) {

		this.instance = instance;
		this.el       = instance.$refs.slider_wrap;

		this.moved   = false;
		this.panning = false;
		this.zooming = false;
		this.swiping = false;

		this.el.off('touchstart.fb mousedown.fb', $.proxy(this, "ontouchstart"));
		this.el.on('touchstart.fb mousedown.fb', $.proxy(this, "ontouchstart"));

	};

	Guestures.prototype.destroy = function() {

		this.el.off('touchstart.fb mousedown.fb');
		this.el.off('touchmove.fb mousemove.fb');
		this.el.off('touchend.fb touchcancel.fb mouseup.fb mouseleave.fb');

	};

	Guestures.prototype.ontouchstart = function(e) {
		var self = this;

		var touches = e.touches ? e.touches : e.originalEvent.touches || [ e ];
		var current = this.instance.current;

		var lastX = 0;
		var lastY = 0;
		var lastW = 0;
		var lastH = 0;

		var looper = function() {

			if ( self.swiping || self.panning || self.zooming ) {

				requestAFrame(function( timestamp ) {
					var x, y, w, h;

					if ( self.swiping == 'x' || self.swiping === 'y' ) {

						y = self.swiping == 'x' ? 0 : self.translateFromTranslatingY;
						x = self.swiping == 'y' ? self.sliderPos.left : Math.floor( self.sliderPos.left + ( self.translateFromTranslatingX ) );

						if ( x !== lastX || y !== lastY ) {

							$.fancybox.setTranslate( self.instance.$refs.slider, {
								top  : y,
								left : x
							});

							lastX = x;
							lastY = y;

						}

					}

					if ( self.zooming || self.panning ) {

						y = Math.round( self.newOffsetY );
						x = Math.round( self.newOffsetX );
						w = ( self.newWidth  / self.instance.current.width );
						h = ( self.newHeight / self.instance.current.height );

						if ( x !== lastX || y !== lastY || w !== lastW || h !== lastH  ) {

							$.fancybox.setTranslate( self.$image, {
								top    : y,
								left   : x,
								scaleX : w,
								scaleY : h
							});
						}

						lastX = x;
						lastY = y;
						lastW = w;
						lastH = h;

					}

					looper();

				});

			}

		};

		this.$target = $( e.target );

		// Ignore taping on links, buttons and scrollable items
		if ( this.$target.is('a') || this.$target.is('button') || this.$target.is('input') || this.$target.is('textarea') ||
		 	this.$target.parent().is('a') || e.target.nodeType == 3 || isScrollable( e.target ) ) {
			return;
		}

		e.stopPropagation();
		e.preventDefault();

		if ( !this.instance.current || this.instance.isAnimating || this.instance.isClosing ) {
			return;
		}

		// Prevent zooming if already swiping
		if ( this.swiping == 'y' || this.swiping == 'x' ) {
			return;
		}

		$.fancybox.stop( self.instance.$refs.slider );

		this.$image   = current.isLoaded ? current.$image : current.$ghost || current.$image;
		this.$content = current.isLoaded ? current.$content : null;

		this.canvasWidth  = parseInt( current.$slide.width() );
		this.canvasHeight = parseInt( current.$slide.height() );

		this.startTime = new Date().getTime();

		this.el.off('touchmove.fb mousemove.fb',  $.proxy(this, "ontouchmove"));
		this.el.off('touchend.fb touchcancel.fb mouseup.fb mouseleave.fb',  $.proxy(this, "ontouchend"));

		this.el.on('touchmove.fb mousemove.fb',  $.proxy(this, "ontouchmove"));
		this.el.on('touchend.fb touchcancel.fb mouseup.fb mouseleave.fb',  $.proxy(this, "ontouchend"));

		if ( this.$image ) {
			$.fancybox.stop( this.$image );

			this.currentWidth  = this.$image.width();
			this.currentHeight = this.$image.height();

		} else if ( this.$content ) {

			this.currentWidth  = this.$content.width();
			this.currentHeight = this.$content.height();

		}

		this.swiping = false;
		this.panning = false;
		this.zooming = false;

		self.zoomed  = false;
		self.moved   = false;

		this.translateFromTranslatingX = 0;
		this.translateFromTranslatingY = 0;

		this.sliderPos  = $.fancybox.getTranslate( self.instance.$refs.slider );
		this.contentPos = $.fancybox.getTranslate( this.$image || this.$content );

		this.newOffsetX = this.currentOffsetX = this.contentPos.left;
		this.newOffsetY = this.currentOffsetY = this.contentPos.top;

		this.newWidth  = this.currentWidth;
		this.newHeight = this.currentHeight;

		this.startX0 = touches[0].pageX;
		this.startY0 = touches[0].pageY;

		if ( touches.length == 1 ) {

			if ( !this.instance.current.isLoaded || ( this.currentWidth < this.canvasWidth + 1 && this.currentHeight < this.canvasHeight + 1 ) ) {
				this.swiping = true;

			} else {
				this.panning = true;
			}

			self.instance.$refs.container.addClass('fancybox-controls--isGrabbing');

		}

		if ( touches.length == 2 && this.instance.current.isLoaded && this.$image ) {
			this.zooming = true;

			this.startX1 = touches[1].pageX;
			this.startY1 = touches[1].pageY;

			this.centerPointStartX = ((this.startX0 + this.startX1) / 2.0) - $(window).scrollLeft();
			this.centerPointStartY = ((this.startY0 + this.startY1) / 2.0) - $(window).scrollTop();

			this.percentageOfImageAtPinchPointX = (this.centerPointStartX - this.currentOffsetX) / this.currentWidth;
			this.percentageOfImageAtPinchPointY = (this.centerPointStartY - this.currentOffsetY) / this.currentHeight;

			this.startDistanceBetweenFingers = Math.sqrt(Math.pow((this.startX1 - this.startX0), 2) + Math.pow((this.startY1 - this.startY0), 2));

		}

		looper();

	};

	Guestures.prototype.ontouchmove = function( e ) {
		var touches = e.touches ? e.touches : e.originalEvent.touches || [ e ];

		var self = this;

		var x, y, angle;

		var minTranslateX, minTranslateY, maxTranslateX, maxTranslateY;
		var endDistanceBetweenFingers, pinchRatio, newWidth, newHeight;

		e.preventDefault();

		this.instance.allowZoomIn = false;

		this.endX0 = touches[0].pageX;
		this.endY0 = touches[0].pageY;

		this.endX1 = touches[1] ? touches[1].pageX : null;
		this.endY1 = touches[1] ? touches[1].pageY : null;

		this.translateFromTranslatingX = this.endX0 - this.startX0;
		this.translateFromTranslatingY = this.endY0 - this.startY0;

		if ( touches.length == 1 ) {

			if ( this.swiping ) {

				if ( this.swiping !== 'x' && this.swiping !== 'y' && ( Math.abs(this.translateFromTranslatingX) > 2 || Math.abs(this.translateFromTranslatingY) > 2 ) ) {

					angle = Math.abs( Math.atan2(this.translateFromTranslatingY, this.translateFromTranslatingX) * 180 / Math.PI ) ;

					// Reset values to avoid jumping, because we dropped first swipes to calculate the angle

					this.startX0 = this.endX0;
					this.startY0 = this.endY0;

					this.translateFromTranslatingX = 0;
					this.translateFromTranslatingY = 0;

					// Choose swiping direction depending on the angle

					this.swiping = ( angle > 45 && angle < 135 ) || this.instance.group.length <= 1 ? 'y' : 'x';

					if (  this.instance.opts.touch.vertical === false || ( this.instance.opts.touch.vertical === 'auto' && $( window ).width() > 800 ) ) {
						this.swiping = 'x';
					}

					this.instance.current.isMoved = false;
				}

			}

			if ( self.panning ) {

				// Allow horizontal panning only if content is wider than area

				if ( this.currentWidth > this.canvasWidth ) {
					x = this.currentOffsetX + this.translateFromTranslatingX;

				} else {
					x = this.currentOffsetX;

				}

				y = this.currentOffsetY + this.translateFromTranslatingY;

				// Slow down proportionally to traveled distance

				if ( Math.sqrt( this.translateFromTranslatingX * this.translateFromTranslatingX + this.translateFromTranslatingY * this.translateFromTranslatingY ) > 1 ) {
					this.moved = true;

					minTranslateX = Math.max(0, this.canvasWidth  / 2 - this.currentWidth  / 2 );
					minTranslateY = Math.max(0, this.canvasHeight / 2 - this.currentHeight / 2 );

					maxTranslateX = Math.min( this.canvasWidth  - this.currentWidth,  this.canvasWidth / 2  - this.currentWidth  / 2 );
					maxTranslateY = Math.min( this.canvasHeight - this.currentHeight, this.canvasHeight / 2 - this.currentHeight / 2 );

					if ( this.canvasWidth < this.currentWidth ) {

						//   ->
						if ( this.translateFromTranslatingX > 0 && x > minTranslateX ) {
							x = minTranslateX - 1 + Math.pow(-minTranslateX + this.currentOffsetX + this.translateFromTranslatingX, 0.8);
						}

						//    <-
						if ( this.translateFromTranslatingX  < 0 && x < maxTranslateX ) {
							x = maxTranslateX + 1 - Math.pow(maxTranslateX - this.currentOffsetX - this.translateFromTranslatingX, 0.8);
						}

					}

					if ( this.canvasHeight < this.currentHeight  ) {

						//   \/
						if ( this.translateFromTranslatingY > 0 && y > minTranslateY ) {
							y = minTranslateY - 1 + Math.pow(-minTranslateY + this.currentOffsetY + this.translateFromTranslatingY, 0.8);
						}

						//   /\
						if ( this.translateFromTranslatingY  < 0 && y < maxTranslateY ) {
							y = maxTranslateY + 1 - Math.pow(maxTranslateY - this.currentOffsetY - this.translateFromTranslatingY, 0.8);
						}

					}
				}

				this.newOffsetX = x;
				this.newOffsetY = y;

			}
		}

		if ( this.zooming ) {
			this.zoomed = true;

			// Calculate current distance between points to get pinch ratio and new width and height

			endDistanceBetweenFingers = Math.sqrt(Math.pow((this.endX1 - this.endX0), 2) + Math.pow((this.endY1 - this.endY0), 2));

			pinchRatio = endDistanceBetweenFingers / this.startDistanceBetweenFingers;

			newWidth  = Math.floor( this.currentWidth  * pinchRatio );
			newHeight = Math.floor( this.currentHeight * pinchRatio );

			if ( newWidth > 100 && newHeight > 100 ) {
				this.newWidth  = newWidth;
				this.newHeight = newHeight;
			}

			this.setZoomOffset();

		}

		return this;

	};

	Guestures.prototype.setZoomOffset = function() {

		// This is the translation due to pinch-zooming
		var translateFromZoomingX = (this.currentWidth  - this.newWidth)  * this.percentageOfImageAtPinchPointX;
		var translateFromZoomingY = (this.currentHeight - this.newHeight) * this.percentageOfImageAtPinchPointY;

		//Point between the two touches

		var centerPointEndX = ((this.endX0 + this.endX1) / 2.0) - $(window).scrollLeft();
		var centerPointEndY = ((this.endY0 + this.endY1) / 2.0) - $(window).scrollTop();

		// And this is the translation due to translation of the centerpoint
		// between the two fingers

		this.translateFromTranslatingX = centerPointEndX - this.centerPointStartX;
		this.translateFromTranslatingY = centerPointEndY - this.centerPointStartY;

		// The new offset is the old/current one plus the total translation

		this.newOffsetX = this.currentOffsetX + ( translateFromZoomingX + this.translateFromTranslatingX );
		this.newOffsetY = this.currentOffsetY + ( translateFromZoomingY + this.translateFromTranslatingY );

	};


	Guestures.prototype.setCanvasLimit = function() {

		if ( this.canvasWidth < this.newWidth ) {
			this.newOffsetX = this.newOffsetX > 0 ? 0 : this.newOffsetX;
			this.newOffsetX = this.newOffsetX < this.canvasWidth - this.newWidth ? this.canvasWidth - this.newWidth : this.newOffsetX;

		} else {

			// Center horizontally
			this.newOffsetX = Math.max( 0, this.canvasWidth / 2 - this.newWidth / 2 );

		}

		if ( this.canvasHeight < this.newHeight ) {
			this.newOffsetY = this.newOffsetY > 0 ? 0 : this.newOffsetY;
			this.newOffsetY = this.newOffsetY < this.canvasHeight - this.newHeight ? this.canvasHeight - this.newHeight : this.newOffsetY;

		} else {

			// Center vertically
			this.newOffsetY = Math.max( 0, this.canvasHeight / 2 - this.newHeight / 2 );

		}

	};

	Guestures.prototype.ontouchend = function( e ) {

		var self = this;

		var touches = e.touches ? e.touches : e.originalEvent.touches || [];
		var current = self.instance.current;

		var swiping = self.swiping;
		var panning = self.panning;
		var zooming = self.zooming;

		var MIN_SCALE = 1;
		var MAX_SCALE = 1;

		var dX, dY, dMs, speedX, speedY, speed, pos;

		if ( touches.length >= 1 && (this.swiping === 'x' || this.swiping === 'y') ) {
			return;
		}

		this.endTime = new Date().getTime();

		self.instance.$refs.container.removeClass('fancybox-controls--isGrabbing');

		this.el.off('touchmove.fb mousemove.fb',  $.proxy(this, "ontouchmove"));
		this.el.off('touchend.fb touchcancel.fb mouseup.fb mouseleave.fb',  $.proxy(this, "ontouchend"));

		self.swiping  = false;
		self.panning  = false;
		self.zooming  = false;


		if ( current.isMoved && !this.moved && !this.zoomed && !(swiping === 'x' || swiping === 'y') )  {
			return this.ontap( e );
		}

		dX  = this.translateFromTranslatingX;
		dY  = this.translateFromTranslatingY;
		dMs = Math.max(this.endTime - this.startTime, 1);

		// Speeds
		speedX = Math.max(Math.min(dX / dMs, 1), -1);
		speedY = Math.max(Math.min(dY / dMs, 1), -1);
		speed  = Math.max(150, Math.max(Math.abs(speedX), Math.abs(speedY)) * 300);

		if ( swiping ) {

			// Close if swiped vertically / navigate if horizontally

			if ( swiping == 'y' && ( Math.abs( dY ) > 90 || (Math.abs( dY ) > 50 && dMs < 120) ) ) {

				// Continue vertical movement
				$.fancybox.animate( this.instance.$refs.slider, null, {
					top     : this.sliderPos.top + dY + ( speedY > 0 ? 1 : -1 ) * 200,
					left    : this.sliderPos.left,
					opacity : 0
				}, current.opts.speed );

				self.instance.close( true );

			} else if ( swiping == 'x' && dX > 30 ) {

				this.instance.previous();

			} else if ( swiping == 'x' && dX < -30 ) {

				this.instance.next();

			} else {

				// Move back to position
				this.instance.update( false, false, true );

			}

			return;
		}


		if ( panning ) {

			// Continue movement
			this.newOffsetX = this.newOffsetX + ( speedX * speed );
			this.newOffsetY = this.newOffsetY + ( speedY * speed );

			speed = 300;
		}

		if ( this.newWidth / this.instance.current.width >  MAX_SCALE ) {

			this.newWidth  = this.instance.current.width  * MAX_SCALE;
			this.newHeight = this.instance.current.height * MAX_SCALE;

		} else {

			pos = this.instance.getFitPos( current );

			if ( this.newWidth / pos.width <  MIN_SCALE ) {
				this.newWidth  = pos.width;
				this.newHeight = pos.height;
			}

		}

		if ( zooming ) {
			this.setZoomOffset();
		}

		this.setCanvasLimit();

		$.fancybox.animate( this.$content || this.$image, null, {
			top    : this.newOffsetY,
			left   : this.newOffsetX,
			scaleX : this.newWidth  / this.instance.current.width,
			scaleY : this.newHeight / this.instance.current.height
		}, speed, "easeOutSine");

	};

	Guestures.prototype.ontap = function(e) {
		var self = this;

		var touches = e.changedTouches ? e.changedTouches : e.originalEvent.touches || [];

		var x, y;

		if ( touches && touches.length ) {
			if ( touches.length > 1 ) {
				return this;
			}

			x = touches[0].pageX;
			y = touches[0].pageY;

		} else {
			x = "pageX" in e ? e.pageX : this.startX0;
			y = "pageY" in e ? e.pageY : this.startY0;

		}

        x = x - this.instance.$refs.slider_wrap.offset().left;
        y = y - this.instance.$refs.slider_wrap.offset().top;

		if ( !$.fancybox.isTouch ) {


			if ( self.instance.opts.closeClickOutside && self.$target.is('.fancybox-slide') ) {
				self.instance.close();

				return;
			}

			if ( self.instance.current.type == 'image' && self.instance.current.isMoved ) {

				if ( self.instance.canPan() ) {
					self.instance.scaleToFit();

				} else if ( self.instance.isScaledDown() ) {
					self.instance.scaleToActual( x, y );

				} else if ( self.instance.group.length < 2 ) {
					self.instance.close();

				}

			}

			return;
		}


		if ( this.tapped ) {

			// Double tap

			this.tapped = false;

			clearTimeout(this.id);

			if (Math.abs(x - this.x) > 50 || Math.abs(y - this.y) > 50 || !self.instance.current.isLoaded || !self.instance.current.isMoved ) {
				return this;
			}

			if ( self.instance.current.type == 'image' ) {

				if ( self.instance.canPan() ) {
					self.instance.scaleToFit();

				} else if ( self.instance.isScaledDown() ) {
					self.instance.scaleToActual( x, y );

				}

			}

		} else {

			// Single tap

			this.tapped = true;

			this.x = x;
			this.y = y;

			this.id = setTimeout(function() {
				self.tapped = false;

				self.instance.toggleControls( true );

			}, 300);
		}

		return this;
	};


	$(document).on('onActivate.fb', function (e, instance) {

		if ( instance.opts.touch && !instance.Guestures ) {
			instance.Guestures = new Guestures( instance );
		}

	});

	$(document).on('beforeClose.fb', function (e, instance) {

		if ( instance.Guestures ) {
			instance.Guestures.destroy();
		}

	});


}(window, document, window.jQuery));
