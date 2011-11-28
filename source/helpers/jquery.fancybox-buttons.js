 /*!
 * Buttons helper for fancyBox
 * version: 1.0.1
 * @requires fancyBox v2.0 or later
 *
 * Usage: 
 *     $(".fancybox").fancybox({
 *         buttons: {}
 *     });
 * 
 * Options:
 *     tpl - HTML template
 * 
 */
(function ($) {
	//shortcut for fancyBox object
	var F = $.fancybox;

	//Add helper object
	F.helpers.buttons = {
		tpl: '<div id="fancybox-buttons"><ul><li><a class="btnPrev" title="Previous" href="javascript:$.fancybox.prev();">Previous</a></li><li><a class="btnPlay" title="Slideshow" href="javascript:$.fancybox.play();;">Play</a></li><li><a class="btnNext" title="Next" href="javascript:$.fancybox.next();">Next</a></li><li><a class="btnToggle" title="Toggle size" href="javascript:$.fancybox.toggle();">Toggle</a></li><li><a class="btnClose" title="Close" href="javascript:$.fancybox.close();">Close</a></li></ul></div>',
		list: null,
		buttons: {},

		update: function () {
			var toggle = this.buttons.toggle.removeClass('btnDisabled btnToggleOn');

			//Size toggle button
			if (F.current.canShrink) {
				toggle.addClass('btnToggleOn');

			} else if (!F.current.canExpand) {
				toggle.addClass('btnDisabled');
			}
		},

		beforeShow: function () {
			//Increase top margin to give space for buttons
			F.current.margin[0] += 30;
		},

		onPlayStart: function () {
			if (this.list) {
				this.buttons.play.text('Pause').addClass('btnPlayOn');
			}
		},

		onPlayEnd: function () {
			if (this.list) {
				this.buttons.play.text('Play').removeClass('btnPlayOn');
			}
		},

		afterShow: function (opts) {
			var buttons;
			
			if (!this.list) {
				this.list = $(opts.tpl || this.tpl).appendTo('body');

				this.buttons = {
					prev : this.list.find('.btnPrev'),
					next : this.list.find('.btnNext'),
					play : this.list.find('.btnPlay'),
					toggle : this.list.find('.btnToggle')
				}
			}
			
			buttons = this.buttons;

			//Prev
			if (F.current.index > 0 || F.current.loop) {
				buttons.prev.removeClass('btnDisabled');
			} else {
				buttons.prev.addClass('btnDisabled');
			}

			//Next / Play
			if (F.current.loop || F.current.index < F.group.length - 1) {
				buttons.next.removeClass('btnDisabled');
				buttons.play.removeClass('btnDisabled');

			} else {
				buttons.next.addClass('btnDisabled');
				buttons.play.addClass('btnDisabled');
			}

			this.update();
		},

		onUpdate: function () {
			this.update();
		},

		beforeClose: function () {
			if (this.list) {
				this.list.remove();
			}

			this.list = null;
			this.buttons = {};
		}
	};

}(jQuery));