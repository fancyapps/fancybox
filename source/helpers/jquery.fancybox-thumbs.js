;(function ($) {
	var	F = $.fancybox;

	F.helpers.thumbs = {
		wrap	: null,
		list	: null,
		width	: 0,

		init	: function( opts ) {
			var that = this, list;

			//Create list
			list = '';

			for (var n = 0; n < F.group.length; n++) {
				list += '<li><a style="width:' + opts.width + 'px;height:' + opts.height + 'px;" href="javascript:$.fancybox.jumpto(' + n + ');"></a></li>';
			}

			this.wrap	= $('<div id="fancybox-thumbs"></div>').appendTo('body');
			this.list	= $('<ul>' + list + '</ul>').appendTo( this.wrap );

			//Load thumbs
			$.each(F.group, function(i) {
				$("<img />").load(function() {
					var width	= this.width,
						height	= this.height,
						widthRatio,
						heightRatio,
						parent;

					if (!that.list || !width || !height) {
						return;	
					}

					widthRatio	= width / opts.width;
					heightRatio	= height / opts.height;
					parent		= that.list.children().eq(i).find('a');

					if (widthRatio >= 1 && heightRatio >= 1) {
	                    if ( widthRatio > heightRatio ) {
							width	= Math.floor( width / heightRatio );
		                    height	= opts.height;

			            } else {
			                width	= opts.width;
			                height	= Math.floor( height / widthRatio );
			            }
					}

		            $(this).css({
		                width	: width,
		                height	: height,
		                top		: Math.floor(opts.height / 2 - height / 2),
		                left	: Math.floor(opts.width / 2 - width / 2)
					});

	                parent.width( opts.width ).height( opts.height );

	                $(this).hide().appendTo( parent ).fadeIn(300);

				}).attr('src', opts.source(this));
			});

			//Set initial width
			this.width = this.list.children().eq( 0 ).outerWidth();

			this.list.width( this.width * (F.group.length + 1)).css('left', Math.floor($(window).width() * 0.5 - (F.current.index * this.width + this.width * 0.5)));
		},

		update : function( opts ) {
			if (this.list) {
				this.list.stop(true).animate({'left' : Math.floor($(window).width() * 0.5 - (F.current.index * this.width + this.width * 0.5))}, 150);
			}
		},

		beforeLoad : function( opts ) {
			if (F.group.length < 2) {
				F.coming.helpers.thumbs = false;

				return;
			}

			F.coming.margin[2]	= opts.height + 30; //Increase bottom margin

			F.coming.helpers.thumbs.source = function( el ) {
				var img = $(el).find('img');

				return img.length ? img.attr('src') : el.href;
			};
		},

		afterShow : function( opts ) {
			if (this.list) {
				this.update( opts );

			} else {
				this.init( opts );
			}

			this.list
				.children()
				.removeClass('active')
				.eq( F.current.index )
				.addClass('active');
		},

		onUpdate : function() {
			this.update();
		},

		beforeClose : function() {
			if (this.wrap) {
				this.wrap.remove();
			}

			this.wrap	= null;
			this.list	= null;
			this.width	= 0;
		}
	}

}(jQuery));