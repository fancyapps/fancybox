// ==========================================================================
//
// SlideShow
// Enables slideshow functionality
//
// Example of usage:
// $.fancybox.getInstance().SlideShow.start()
//
// ==========================================================================
;(function (document, $) {
	'use strict';

	var SlideShow = function( instance ) {

		this.instance = instance;

		this.init();

	};

	$.extend( SlideShow.prototype, {
		timer    : null,
		isActive : false,
		$button  : null,
		speed    : 3000,

		init : function() {
			var self = this;

			self.$button = self.instance.$refs.toolbar.find('[data-fancybox-play]');

			if ( self.instance.group.length > 1 && self.instance.group[ self.instance.currIndex ].opts.slideShow ) {
				self.$button.on('click', function() {
					self.toggle();
				});

			} else {
				self.$button.hide();
			}

		},

		set : function() {
			var self = this;

			// Check if reached last element
			if ( self.instance && self.instance.current && (self.instance.current.opts.loop || self.instance.currIndex < self.instance.group.length - 1 )) {
				self.timer = setTimeout(function() {
					self.instance.next();

				}, self.instance.current.opts.slideShow.speed || self.speed);

			} else {
				self.stop();
			}

		},

		clear : function() {
			var self = this;

			clearTimeout( self.timer );

			self.timer = null;
		},

		start : function() {
			var self = this;
			var current = self.instance.current;

			if ( self.instance && current && ( current.opts.loop || current.index < self.instance.group.length - 1 )) {

				self.isActive = true;

				self.$button
					.attr( 'title', current.opts.i18n[ current.opts.lang ].PLAY_STOP )
					.addClass( 'fancybox-button--pause' );

				if ( current.isComplete ) {
					self.set();
				}
			}

		},

		stop : function() {
			var self = this;
			var current = self.instance.current;

			self.clear();

			self.$button
				.attr( 'title', current.opts.i18n[ current.opts.lang ].PLAY_START )
				.removeClass( 'fancybox-button--pause' );

			self.isActive = false;
		},

		toggle : function() {
			var self = this;

			if ( self.isActive ) {
				self.stop();

			} else {
				self.start();
			}
		}

	});

	$(document).on({

		'beforeShow.fb' : function(e, instance, current, firstRun) {
			var slideShow;

			if ( firstRun ) {
				slideShow = instance.SlideShow = new SlideShow( instance );

				if ( current.opts.slideShow.autoStart  ) {
					slideShow.start();
				}

			} else if (  ( slideShow = instance && instance.SlideShow ) && slideShow.isActive )  {
				slideShow.clear();
			}

		},

		'afterShow.fb' : function(e, instance, current) {
			var slideShow = instance && instance.SlideShow;

			if ( slideShow && slideShow.isActive ) {
				slideShow.set();
			}

		},

		'afterKeydown.fb' : function(e, instance, current, keypress, keycode) {

			// "P" or Spacebar
			if ( instance && instance.SlideShow && ( keycode === 80 || keycode === 32 ) && !$(document.activeElement).is('button,a,input') ) {
				instance.SlideShow.toggle();
			}

		},

		'beforeClose.fb onDeactivate.fb' : function(e, instance) {

			if ( instance && instance.SlideShow ) {
				instance.SlideShow.stop();
			}

		}

	});

	// Page Visibility API to pause slideshow when window is not active
	$(document).on("visibilitychange", function() {
		var instance  = $.fancybox.getInstance();
		var slideShow = instance && instance.SlideShow;

		if ( slideShow && slideShow.isActive ) {
			if ( document.hidden ) {
				slideShow.clear();

			} else {
				slideShow.set();
			}
		}
	});

}(document, window.jQuery));
