;(function ($) {
	var	F = $.fancybox;

	F.helpers.buttons = {
		tpl		: '<div id="fancybox-buttons"><ul><li><a class="btnPrev" title="Previous" href="javascript:$.fancybox.prev();">Previous</a></li><li><a class="btnPlay" title="Slideshow" href="javascript:$.fancybox.play();;">Play</a></li><li><a class="btnNext" title="Next" href="javascript:$.fancybox.next();">Next</a></li><li><a class="btnToggle" title="Toggle size" href="javascript:$.fancybox.toggle();">Toggle</a></li><li><a class="btnClose" title="Close" href="javascript:$.fancybox.close();">Close</a></li></ul></div>',
		list	: null,
		buttons	: {},

		update : function() {
			//Size toggle button
			if (F.current.canShrink) {
				this.buttons.toggle.removeClass('btnDisabled').addClass('btnToggleOn');

			} else if (F.current.canExpand) {
				this.buttons.toggle.removeClass('btnDisabled btnToggleOn');

			} else {
				this.buttons.toggle.removeClass('btnToggleOn').addClass('btnDisabled');
			}
		},

		beforeShow : function() {
			F.current.margin[0] += 30;
		},

		onPlayStart : function() {
			if (this.list) {
				this.buttons.play.text('Pause').addClass('btnPlayOn');
			}
		},

		onPlayEnd : function() {
			if (this.list) {
				this.buttons.play.text('Play').removeClass('btnPlayOn');
			}
		},

		afterShow : function() {
			if (!this.list) {
				this.list = $(this.tpl).appendTo('body');

				this.buttons.prev	= this.list.find('.btnPrev');
				this.buttons.next	= this.list.find('.btnNext');
				this.buttons.play	= this.list.find('.btnPlay');
				this.buttons.toggle	= this.list.find('.btnToggle');
			}

			//Prev
			if (F.current.index > 0 || F.current.loop) {
				this.buttons.prev.removeClass('btnDisabled');
			} else {
				this.buttons.prev.addClass('btnDisabled');
			}

			//Next / Play
			if (F.current.loop || F.current.index < F.group.length - 1) {
				this.buttons.next.removeClass('btnDisabled');
				this.buttons.play.removeClass('btnDisabled');

			} else {
				this.buttons.next.addClass('btnDisabled');
				this.buttons.play.addClass('btnDisabled');
			}

			this.update();
		},

		onUpdate : function() {
			this.update();
		},

		beforeClose : function( opts ) {
			if (this.list) {
				this.list.remove();
			}

			this.list		= null;
			this.buttons	= {};
		}
	};

}(jQuery));