// ==========================================================================
//
// SlideShow
// Enables slideshow functionality
//
// Example of usage:
// $.fancybox.getInstance().slideShow.start()
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

			self.$button = $('<button data-fancybox-play class="fancybox-button fancybox-button--play" title="Slideshow (P)"></button>')
				.appendTo( self.instance.$refs.buttons );

			self.instance.$refs.container.on('click', '[data-fancybox-play]', function() {
				self.toggle();
			});

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

			self.stop();

			if ( self.instance && self.instance.current && ( self.instance.current.opts.loop || self.instance.currIndex < self.instance.group.length - 1 )) {

				self.instance.$refs.container.on({
					'beforeLoad.fb.player'	: $.proxy(self, "clear"),
					'onComplete.fb.player'	: $.proxy(self, "set"),
				});

				self.isActive = true;

				if ( self.instance.current.isComplete ) {
					self.set();
				}

				self.instance.$refs.container.trigger('onPlayStart');

				self.$button.addClass('fancybox-button--pause');
			}

		},

		stop: function() {
			var self = this;

			self.clear();

			self.instance.$refs.container
				.trigger('onPlayEnd')
				.off('.player');

			self.$button.removeClass('fancybox-button--pause');

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

	$(document).on('onInit.fb', function(e, instance) {

		if ( !!instance.opts.slideShow && !instance.SlideShow && instance.group.length > 1 ) {
			instance.SlideShow = new SlideShow( instance );
		}

	});

	$(document).on('beforeClose.fb onDeactivate.fb', function(e, instance) {

		if ( instance.SlideShow ) {
			instance.SlideShow.stop();
		}

	});

}(document, window.jQuery));
