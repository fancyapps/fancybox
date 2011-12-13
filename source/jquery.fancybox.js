 /*!
 * fancyBox - jQuery Plugin
 * version: 2.0.4 (12/12/2011)
 * @requires jQuery v1.6 or later
 *
 * Examples at http://fancyapps.com/fancybox/
 * License: www.fancyapps.com/fancybox/#license
 *
 * Copyright 2011 Janis Skarnelis - janis@fancyapps.com
 *
 */
(function (window, document, $) {
	var W = $(window),
		D = $(document),
		F = $.fancybox = function () {
			F.open.apply( this, arguments );
		},
		didResize = false,
		resizeTimer = null;

	$.extend(F, {
		// The current version of fancyBox
		version: '2.0.4',

		defaults: {
			padding: 15,
			margin: 20,

			width: 800,
			height: 600,
			minWidth: 200,
			minHeight: 200,
			maxWidth: 9999,
			maxHeight: 9999,

			autoSize: true,
			fitToView: true,
			aspectRatio: false,
			topRatio: 0.5,

			fixed: !$.browser.msie || $.browser.version > 6 || !document.documentElement.hasOwnProperty('ontouchstart'),
			scrolling: 'auto', // 'auto', 'yes' or 'no'
			wrapCSS: 'fancybox-default',

			arrows: true,
			closeBtn: true,
			closeClick: false,
			nextClick : false,
			mouseWheel: true,
			autoPlay: false,
			playSpeed: 3000,

			modal: false,
			loop: true,
			ajax: {},
			keys: {
				next: [13, 32, 34, 39, 40], // enter, space, page down, right arrow, down arrow
				prev: [8, 33, 37, 38], // backspace, page up, left arrow, up arrow
				close: [27] // escape key
			},

			// Override some properties
			index: 0,
			type: null,
			href: null,
			content: null,
			title: null,

			// HTML templates
			tpl: {
				wrap: '<div class="fancybox-wrap"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div>',
				image: '<img class="fancybox-image" src="{href}" alt="" />',
				iframe: '<iframe class="fancybox-iframe" name="fancybox-frame{rnd}" frameborder="0" hspace="0" ' + ($.browser.msie ? 'allowtransparency="true""' : '') + ' scrolling="{scrolling}" src="{href}"></iframe>',
				swf: '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="wmode" value="transparent" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{href}" /><embed src="{href}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="100%" height="100%" wmode="transparent"></embed></object>',
				error: '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
				closeBtn: '<div title="Close" class="fancybox-item fancybox-close"></div>',
				next: '<a title="Next" class="fancybox-item fancybox-next"><span></span></a>',
				prev: '<a title="Previous" class="fancybox-item fancybox-prev"><span></span></a>'
			},

			// Properties for each animation type
			// Opening fancyBox
			openEffect: 'fade', // 'elastic', 'fade' or 'none'
			openSpeed: 250,
			openEasing: 'swing',
			openOpacity: true,
			openMethod: 'zoomIn',

			// Closing fancyBox
			closeEffect: 'fade', // 'elastic', 'fade' or 'none'
			closeSpeed: 250,
			closeEasing: 'swing',
			closeOpacity: true,
			closeMethod: 'zoomOut',

			// Changing next gallery item
			nextEffect: 'elastic', // 'elastic', 'fade' or 'none'
			nextSpeed: 300,
			nextEasing: 'swing',
			nextMethod: 'changeIn',

			// Changing previous gallery item
			prevEffect: 'elastic', // 'elastic', 'fade' or 'none'
			prevSpeed: 300,
			prevEasing: 'swing',
			prevMethod: 'changeOut',

			// Enabled helpers
			helpers: {
				overlay: {
					speedIn: 0,
					speedOut: 300,
					opacity: 0.8,
					css: {
						cursor: 'pointer'
					},
					closeClick: true
				},
				title: {
					type: 'float' // 'float', 'inside', 'outside' or 'over'
				}
			},

			// Callbacks
			onCancel: $.noop, // If canceling
			beforeLoad: $.noop, // Before loading
			afterLoad: $.noop, // After loading
			beforeShow: $.noop, // Before changing in current item
			afterShow: $.noop, // After opening
			beforeClose: $.noop, // Before closing
			afterClose: $.noop // After closing
		},

		//Current state
		group: {}, // Selected group
		opts: {}, // Group options
		coming: null, // Element being loaded
		current: null, // Currently loaded element
		isOpen: false, // Is currently open
		isOpened: false, // Have been fully opened at least once
		wrap: null,
		outer: null,
		inner: null,

		player: {
			timer: null,
			isActive: false
		},

		// Loaders
		ajaxLoad: null,
		imgPreload: null,

		// Some collections
		transitions: {},
		helpers: {},

		/*
		 *	Static methods
		 */

		open: function (group, opts) {
			// Normalize group
			if (!$.isArray(group)) {
				group = [group];
			}

			if (!group.length) {
				return;
			}

			//Kill existing instances
			F.close(true);

			//Extend the defaults
			F.opts = $.extend(true, {}, F.defaults, opts);
			F.group = group;

			F._start(F.opts.index || 0);
		},

		cancel: function () {
			if (F.coming && false === F.trigger('onCancel')) {
				return;
			}

			F.coming = null;

			F.hideLoading();

			if (F.ajaxLoad) {
				F.ajaxLoad.abort();
			}

			F.ajaxLoad = null;

			if (F.imgPreload) {
				F.imgPreload.onload = F.imgPreload.onabort = F.imgPreload.onerror = null;
			}
		},

		close: function (a) {
			F.cancel();

			if (!F.current || false === F.trigger('beforeClose')) {
				return;
			}

			F.unbindEvents();

			//If forced or is still opening then remove immediately
			if (!F.isOpen || (a && a[0] === true)) {
				$(".fancybox-wrap").stop().trigger('onReset').remove();

				F._afterZoomOut();

			} else {
				F.isOpen = F.isOpened = false;

				$(".fancybox-item").remove();

				F.wrap.stop(true).removeClass('fancybox-opened');
				F.inner.css('overflow', 'hidden');

				F.transitions[F.current.closeMethod]();
			}
		},

		// Start/stop slideshow
		play: function (a) {
			var clear = function () {
					clearTimeout(F.player.timer);
				},
				set = function () {
					clear();

					if (F.current && F.player.isActive) {
						F.player.timer = setTimeout(F.next, F.current.playSpeed);
					}
				},
				stop = function () {
					clear();

					$('body').unbind('.player');

					F.player.isActive = false;

					F.trigger('onPlayEnd');
				},
				start = function () {
					if (F.current && (F.current.loop || F.current.index < F.group.length - 1)) {
						F.player.isActive = true;

						$('body').bind({
							'afterShow.player onUpdate.player': set,
							'onCancel.player beforeClose.player': stop,
							'beforeLoad.player': clear
						});

						set();

						F.trigger('onPlayStart');
					}
				};

			if (F.player.isActive || (a && a[0] === false)) {
				stop();
			} else {
				start();
			}
		},

		next: function () {
			if (F.current) {
				F.jumpto(F.current.index + 1);
			}
		},

		prev: function () {
			if (F.current) {
				F.jumpto(F.current.index - 1);
			}
		},

		jumpto: function (index) {
			if (!F.current) {
				return;
			}

			index = parseInt(index, 10);

			if (F.group.length > 1 && F.current.loop) {
				if (index >= F.group.length) {
					index = 0;

				} else if (index < 0) {
					index = F.group.length - 1;
				}
			}

			if (typeof F.group[index] !== 'undefined') {
				F.cancel();

				F._start(index);
			}
		},

		reposition: function (a) {
			if (F.isOpen) {
				F.wrap.css(F._getPosition(a));
			}
		},

		update: function () {
			if (F.isOpen) {
				// It's a very bad idea to attach handlers to the window scroll event, run this code after a delay
				if (!didResize) {
					resizeTimer = setInterval(function () {
						if (didResize) {
							didResize = false;

							clearTimeout(resizeTimer);

							if (F.current) {
								if (F.current.autoSize) {
									F.inner.height('auto');
									F.current.height = F.inner.height();
								}

								F._setDimension();

								if (F.current.canGrow) {
									F.inner.height('auto');
								}

								F.reposition();

								F.trigger('onUpdate');
							}
						}
					}, 100);
				}

				didResize = true;
			}
		},

		toggle: function () {
			if (F.isOpen) {
				F.current.fitToView = !F.current.fitToView;

				F.update();
			}
		},

		hideLoading: function () {
			$("#fancybox-loading").remove();
		},

		showLoading: function () {
			F.hideLoading();

			$('<div id="fancybox-loading"></div>').click(F.cancel).appendTo('body');
		},

		getViewport: function () {
			return {
				x: W.scrollLeft(),
				y: W.scrollTop(),
				w: W.width(),
				h: W.height()
			};
		},

		// Unbind the keyboard / clicking actions
		unbindEvents: function () {
			if (F.wrap) {
				F.wrap.unbind('.fb');	
			}

			D.unbind('.fb');
			W.unbind('.fb');
		},

		bindEvents: function () {
			var current = F.current,
				keys = current.keys;

			if (!current) {
				return;
			}

			W.bind('resize.fb, orientationchange.fb', F.update);

			if (keys) {
				D.bind('keydown.fb', function (e) {
					var code;

					// Ignore key combinations and key events within form elements
					if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && $.inArray(e.target.tagName.toLowerCase(), ['input', 'textarea', 'select', 'button']) < 0) {
						code = e.keyCode;

						if ($.inArray(code, keys.close) > -1) {
							F.close();
							e.preventDefault();

						} else if ($.inArray(code, keys.next) > -1) {
							F.next();
							e.preventDefault();

						} else if ($.inArray(code, keys.prev) > -1) {
							F.prev();
							e.preventDefault();
						}
					}
				});
			}

			if ($.fn.mousewheel && current.mouseWheel && F.group.length > 1) {
				F.wrap.bind('mousewheel.fb', function (e, delta) {
					var target = $(e.target).get(0);

					if (target.clientHeight === 0 || target.scrollHeight === target.clientHeight) {
						e.preventDefault();

						F[delta > 0 ? 'prev' : 'next']();
					}
				});
			}
		},

		trigger: function (event) {
			var ret, obj = F[ $.inArray(event, ['onCancel', 'beforeLoad', 'afterLoad']) > -1 ? 'coming' : 'current' ];

			if (!obj) {
				return;
			}

			if ($.isFunction( obj[event] )) {
				ret = obj[event].apply(obj, Array.prototype.slice.call(arguments, 1));
			}

			if (ret === false) {
				return false;
			}

			if (obj.helpers) {
				$.each(obj.helpers, function (helper, opts) {
					if (opts && typeof F.helpers[helper] !== 'undefined' && $.isFunction(F.helpers[helper][event])) {
						F.helpers[helper][event](opts, obj);
					}
				});
			}

			$.event.trigger(event + '.fb');
		},

		isImage: function (str) {
			return str && str.match(/\.(jpg|gif|png|bmp|jpeg)(.*)?$/i);
		},

		isSWF: function (str) {
			return str && str.match(/\.(swf)(.*)?$/i);
		},

		_start: function (index) {
			var coming = {},
				element = F.group[index] || null,
				isDom,
				href,
				type,
				rez;

			if (typeof element === 'object' && (element.nodeType || element instanceof $)) {
				isDom = true;

				if ($.metadata) {
					coming = $(element).metadata();
				}
			}

			coming = $.extend(true, {}, F.opts, {index : index, element : element}, ($.isPlainObject(element) ? element : coming));

			// Re-check overridable options
			$.each(['href', 'title', 'content', 'type'], function(i,v) {
				coming[v] = F.opts[ v ] || (isDom && $(element).attr( v )) || coming[ v ] || null;
			});

			// Convert margin property to array - top, right, bottom, left
			if (typeof coming.margin === 'number') {
				coming.margin = [coming.margin, coming.margin, coming.margin, coming.margin];
			}

			// 'modal' propery is just a shortcut
			if (coming.modal) {
				$.extend(true, coming, {
					closeBtn : false,
					closeClick: false,
					nextClick : false,
					arrows : false,
					mouseWheel : false,
					keys : null,
					helpers: {
						overlay : {
							css: {
								cursor : 'auto'
							},
							closeClick : false
						}
					}
				});
			}

			//Give a chance for callback or helpers to update coming item (type, title, etc)
			F.coming = coming;

			if (false === F.trigger('beforeLoad')) {
				F.coming = null;
				return;
			}

			type = coming.type;
			href = coming.href;

			///Check if content type is set, if not, try to get
			if (!type) {
				if (isDom) {
					rez = $(element).data('fancybox-type');

					if (!rez && element.className) {
						rez = element.className.match(/fancybox\.(\w+)/);
						type = rez ? rez[1] : null;
					}
				}

				if (!type && href) {
					if (F.isImage(href)) {
						type = 'image';

					} else if (F.isSWF(href)) {
						type = 'swf';

					} else if (href.match(/^#/)) {
						type = 'inline';
					}
				}

				// ...if not - display element itself
				if (!type) {
					type = isDom ? 'inline' : 'html';
				}

				coming.type = type;
			}

			// Check before try to load; 'inline' and 'html' types need content, others - href
			if (type === 'inline' || type === 'html') {
				coming.content = coming.content || (type === 'inline' && href ? $(href) : element);

				if (!coming.content.length) {
					type = null;
				}

			} else {
				coming.href = href || element;

				if (!coming.href) {
					type = null;
				}
			}

			/*
				Add reference to the group, so it`s possible to access from callbacks, example:

				afterLoad : function() {
					this.title = 'Image ' + (this.index + 1) + ' of ' + this.group.length + (this.title ? ' - ' + this.title : '');
				}

			*/

			coming.group = F.group;

			if (type === 'image') {
				F._loadImage();

			} else if (type === 'ajax') {
				F._loadAjax();

			} else if (type) {
				F._afterLoad();

			} else {
				F._error( 'type' );
			}
		},

		_error: function ( type ) {
			$.extend(F.coming, {
				type : 'html',
				autoSize : true,
				minHeight : '0',
				hasError : type,
				content : F.coming.tpl.error
			});

			F._afterLoad();
		},

		_loadImage: function () {
			// Reset preload image so it is later possible to check "complete" property
			F.imgPreload = new Image();

			F.imgPreload.onload = function () {
				this.onload = this.onerror = null;

				F.coming.width = this.width;
				F.coming.height = this.height;

				F._afterLoad();
			};

			F.imgPreload.onerror = function () {
				this.onload = this.onerror = null;

				F._error( 'image' );
			};

			F.imgPreload.src = F.coming.href;

			if (!F.imgPreload.complete) {
				F.showLoading();
			}
		},

		_loadAjax: function () {
			F.showLoading();

			F.ajaxLoad = $.ajax($.extend({}, F.coming.ajax, {
				url: F.coming.href,
				error: function (jqXHR, textStatus) {
					if (textStatus !== 'abort') {
						F._error( 'ajax', jqXHR );

					} else {
						F.hideLoading();
					}
				},
				success: function (data, textStatus) {
					if (textStatus === 'success') {
						F.coming.content = data;

						F._afterLoad();
					}
				}
			}));
		},

		_preload : function() {
			var group = F.group,
				index = F.current.index,
				load = function(href) {
					if (href && F.isImage(href)) {
						new Image().src = href;
					}
				};

			if (group.length > 1) {
				load( $( group[ index + 1 ] || group[ 0 ] ).attr('href') );
				load( $( group[ index - 1 ] || group[ group.length - 1 ] ).attr('href') );
			}
		},

		_afterLoad: function () {
			F.hideLoading();

			if (!F.coming || false === F.trigger('afterLoad', F.current)) {
				F.coming = false;

				return;
			}

			if (F.isOpened) {
				$(".fancybox-item").remove();

				F.wrap.stop(true).removeClass('fancybox-opened');
				F.inner.css('overflow', 'hidden');

				F.transitions[F.current.prevMethod]();

			} else {
				$(".fancybox-wrap").stop().trigger('onReset').remove();

				F.trigger('afterClose');
			}

			F.unbindEvents();

			F.isOpen = false;
			F.current = F.coming;
			F.coming = false;

			//Build the neccessary markup
			F.wrap = $(F.current.tpl.wrap).addClass('fancybox-tmp ' + F.current.wrapCSS).appendTo('body');
			F.outer = $('.fancybox-outer', F.wrap).css('padding', F.current.padding + 'px');
			F.inner = $('.fancybox-inner', F.wrap);

			F._setContent();

			//Give a chance for helpers or callbacks to update elements
			F.trigger('beforeShow');

			//Set initial dimensions and hide
			F._setDimension();

			F.wrap.hide().removeClass('fancybox-tmp');

			F.bindEvents();
			F._preload();

			F.transitions[ F.isOpened ? F.current.nextMethod : F.current.openMethod ]();
		},

		_setContent: function () {
			var content, loadingBay, current = F.current,
				type = current.type;

			switch (type) {
				case 'inline':
				case 'ajax':
				case 'html':
					content = current.content;

					if (type === 'inline' && content instanceof $) {
						content = content.show().detach();

						if (content.parent().hasClass('fancybox-inner')) {
							content.parents('.fancybox-wrap').trigger('onReset').remove();
						}

						$(F.wrap).bind('onReset', function () {
							content.appendTo('body').hide();
						});
					}

					if (current.autoSize) {
						loadingBay = $('<div class="fancybox-tmp"></div>').appendTo($("body")).append(content);

						current.width = loadingBay.outerWidth();
						current.height = loadingBay.outerHeight(true);

						content = loadingBay.contents().detach();

						loadingBay.remove();
					}

				break;

				case 'image':
					content = current.tpl.image.replace('{href}', current.href);

					current.aspectRatio = true;
				break;

				case 'swf':
					content = current.tpl.swf.replace(/\{width\}/g, current.width).replace(/\{height\}/g, current.height).replace(/\{href\}/g, current.href);
				break;

				case 'iframe':
					content = current.tpl.iframe.replace('{href}', current.href).replace('{scrolling}', current.scrolling).replace('{rnd}', new Date().getTime());
				break;
			}

			if ($.inArray(type, ['image', 'swf', 'iframe']) > -1) {
				current.autoSize = false;
				current.scrolling = false;
			}

			F.inner.append(content);
		},

		_setDimension: function () {
			var wrap = F.wrap,
				outer = F.outer,
				inner = F.inner,
				current = F.current,
				viewport = F.getViewport(),
				margin = current.margin,
				padding2 = current.padding * 2,
				width = current.width + padding2,
				height = current.height + padding2,
				ratio = current.width / current.height,

				maxWidth = current.maxWidth,
				maxHeight = current.maxHeight,
				minWidth = current.minWidth,
				minHeight = current.minHeight,
				height_,
				space;

			viewport.w -= (margin[1] + margin[3]);
			viewport.h -= (margin[0] + margin[2]);

			if (width.toString().indexOf('%') > -1) {
				width = ((viewport.w * parseFloat(width)) / 100);
			}

			if (height.toString().indexOf('%') > -1) {
				height = ((viewport.h * parseFloat(height)) / 100);
			}

			if (current.fitToView) {
				maxWidth = Math.min(viewport.w, maxWidth);
				maxHeight = Math.min(viewport.h, maxHeight);
			}

			minWidth = Math.min(width, minWidth);
			minHeight = Math.min(width, minHeight);

			maxWidth = Math.max(minWidth, maxWidth);
			maxHeight = Math.max(minHeight, maxHeight);

			if (current.aspectRatio) {
				if (width > maxWidth) {
					width = maxWidth;
					height = ((width - padding2) / ratio) + padding2;
				}

				if (height > maxHeight) {
					height = maxHeight;
					width = ((height - padding2) * ratio) + padding2;
				}

				if (width < minWidth) {
					width = minWidth;
					height = ((width - padding2) / ratio) + padding2;
				}

				if (height < minHeight) {
					height = minHeight;
					width = ((height - padding2) * ratio) + padding2;
				}

			} else {
				width = Math.max(minWidth, Math.min(width, maxWidth));
				height = Math.max(minHeight, Math.min(height, maxHeight));
			}

			width = Math.round(width);
			height = Math.round(height);

			//Reset dimensions
			$(wrap.add(outer).add(inner)).width('auto').height('auto');

			inner.width(width - padding2).height(height - padding2);
			wrap.width(width);

			height_ = wrap.height(); // Real wrap height

			//Fit wrapper inside
			if (width > maxWidth || height_ > maxHeight) {
				while ((width > maxWidth || height_ > maxHeight) && width > minWidth && height_ > minHeight) {
					height = height - 10;

					if (current.aspectRatio) {
						width = Math.round(((height - padding2) * ratio) + padding2);

						if (width < minWidth) {
							width = minWidth;
							height = ((width - padding2) / ratio) + padding2;
						}

					} else {
						width = width - 10;
					}

					inner.width(width - padding2).height(height - padding2);
					wrap.width(width);

					height_ = wrap.height();
				}
			}

			current.dim = {
				width: width,
				height: height_
			};

			current.canGrow = current.autoSize && height > minHeight && height < maxHeight;
			current.canShrink = false;
			current.canExpand = false;

			if ((width - padding2) < current.width || (height - padding2) < current.height) {
				current.canExpand = true;

			} else if ((width > viewport.w || height_ > viewport.h) && width > minWidth && height > minHeight) {
				current.canShrink = true;
			}

			space = height_ - padding2;

			F.innerSpace = space - inner.height();
			F.outerSpace = space - outer.height();
		},

		_getPosition: function (a) {
			var current = F.current,
				viewport = F.getViewport(),
				margin = current.margin,
				width = F.wrap.width() + margin[1] + margin[3],
				height = F.wrap.height() + margin[0] + margin[2],
				rez = {
					position: 'absolute',
					top: margin[0] + viewport.y,
					left: margin[3] + viewport.x
				};

			if (current.fixed && (!a || a[0] === false) && height <= viewport.h && width <= viewport.w) {
				rez = {
					position: 'fixed',
					top: margin[0],
					left: margin[3]
				};
			}

			rez.top = Math.ceil(Math.max(rez.top, rez.top + ((viewport.h - height) * current.topRatio))) + 'px';
			rez.left = Math.ceil(Math.max(rez.left, rez.left + ((viewport.w - width) * 0.5))) + 'px';

			return rez;
		},

		_afterZoomIn: function () {
			var current = F.current;

			F.isOpen = F.isOpened = true;

			F.wrap.addClass('fancybox-opened').css('overflow', 'visible');

			F.update();

			F.inner.css('overflow', current.scrolling === 'auto' ? 'auto' : (current.scrolling === 'yes' ? 'scroll' : 'hidden'));

			//Assign a click event
			if (current.closeClick || current.nextClick) {
				F.inner.css('cursor', 'pointer').bind('click.fb', current.nextClick ? F.next : F.close);
			}

			//Create a close button
			if (current.closeBtn) {
				$(current.tpl.closeBtn).appendTo(F.wrap).bind('click.fb', F.close);
			}

			//Create navigation arrows
			if (current.arrows && F.group.length > 1) {
				if (current.loop || current.index > 0) {
					$(current.tpl.prev).appendTo(F.wrap).bind('click.fb', F.prev);
				}

				if (current.loop || current.index < F.group.length - 1) {
					$(current.tpl.next).appendTo(F.wrap).bind('click.fb', F.next);
				}
			}

			F.trigger('afterShow');

			if (F.opts.autoPlay && !F.player.isActive) {
				F.opts.autoPlay = false;

				F.play();
			}
		},

		_afterZoomOut: function () {
			F.trigger('afterClose');

			F.wrap.trigger('onReset').remove();

			$.extend(F, {
				group: {},
				opts: {},
				current: null,
				isOpened: false,
				isOpen: false,
				wrap: null,
				outer: null,
				inner: null
			});
		}
	});

	/*
	 *	Default transitions
	 */

	F.transitions = {
		getOrigPosition: function () {
			var element = F.current.element,
				pos = {},
				width = 50,
				height = 50,
				image, viewport;

			if (element && element.nodeName && $(element).is(':visible')) {
				image = $(element).find('img:first');

				if (image.length) {
					pos = image.offset();
					width = image.outerWidth();
					height = image.outerHeight();

				} else {
					pos = $(element).offset();
				}

			} else {
				viewport = F.getViewport();
				pos.top = viewport.y + (viewport.h - height) * 0.5;
				pos.left = viewport.x + (viewport.w - width) * 0.5;
			}

			pos = {
				top: Math.ceil(pos.top) + 'px',
				left: Math.ceil(pos.left) + 'px',
				width: Math.ceil(width) + 'px',
				height: Math.ceil(height) + 'px'
			};

			return pos;
		},

		step: function (now, fx) {
			var ratio, innerValue, outerValue;

			if (fx.prop === 'width' || fx.prop === 'height') {
				innerValue = outerValue = Math.ceil(now - (F.current.padding * 2));

				if (fx.prop === 'height') {
					ratio = (now - fx.start) / (fx.end - fx.start);

					if (fx.start > fx.end) {
						ratio = 1 - ratio;
					}

					innerValue -= F.innerSpace * ratio;
					outerValue -= F.outerSpace * ratio;
				}

				F.inner[fx.prop](innerValue);
				F.outer[fx.prop](outerValue);
			}
		},

		zoomIn: function () {
			var wrap = F.wrap,
				current = F.current,
				startPos,
				endPos,
				dim = current.dim;

			if (current.openEffect === 'elastic') {
				endPos = $.extend({}, dim, F._getPosition(true));

				//Remove "position" property
				delete endPos.position;

				startPos = this.getOrigPosition();

				if (current.openOpacity) {
					startPos.opacity = 0;
					endPos.opacity = 1;
				}

				wrap.css(startPos).show().animate(endPos, {
					duration: current.openSpeed,
					easing: current.openEasing,
					step: this.step,
					complete: F._afterZoomIn
				});

			} else {
				wrap.css($.extend({}, dim, F._getPosition()));

				if (current.openEffect === 'fade') {
					wrap.fadeIn(current.openSpeed, F._afterZoomIn);

				} else {
					wrap.show();
					F._afterZoomIn();
				}
			}
		},

		zoomOut: function () {
			var wrap = F.wrap,
				current = F.current,
				endPos;

			if (current.closeEffect === 'elastic') {
				if (wrap.css('position') === 'fixed') {
					wrap.css(F._getPosition(true));
				}

				endPos = this.getOrigPosition();

				if (current.closeOpacity) {
					endPos.opacity = 0;
				}

				wrap.animate(endPos, {
					duration: current.closeSpeed,
					easing: current.closeEasing,
					step: this.step,
					complete: F._afterZoomOut
				});

			} else {
				wrap.fadeOut(current.closeEffect === 'fade' ? current.closeSpeed : 0, F._afterZoomOut);
			}
		},

		changeIn: function () {
			var wrap = F.wrap,
				current = F.current,
				startPos;

			if (current.nextEffect === 'elastic') {
				startPos = F._getPosition(true);
				startPos.opacity = 0;
				startPos.top = (parseInt(startPos.top, 10) - 200) + 'px';

				wrap.css(startPos).show().animate({
					opacity: 1,
					top: '+=200px'
				}, {
					duration: current.nextSpeed,
					complete: F._afterZoomIn
				});

			} else {
				wrap.css(F._getPosition());

				if (current.nextEffect === 'fade') {
					wrap.hide().fadeIn(current.nextSpeed, F._afterZoomIn);

				} else {
					wrap.show();
					F._afterZoomIn();
				}
			}
		},

		changeOut: function () {
			var wrap = F.wrap,
				current = F.current,
				cleanUp = function () {
					$(this).trigger('onReset').remove();
				};

			wrap.removeClass('fancybox-opened');

			if (current.prevEffect === 'elastic') {
				wrap.animate({
					'opacity': 0,
					top: '+=200px'
				}, {
					duration: current.prevSpeed,
					complete: cleanUp
				});

			} else {
				wrap.fadeOut(current.prevEffect === 'fade' ? current.prevSpeed : 0, cleanUp);
			}
		}
	};

	/*
	 *	Overlay helper
	 */

	F.helpers.overlay = {
		overlay: null,

		update: function () {
			var width, scrollWidth, offsetWidth;

			//Reset width/height so it will not mess
			this.overlay.width(0).height(0);

			if ($.browser.msie) {
				scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
				offsetWidth = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);

				width = scrollWidth < offsetWidth ? W.width() : scrollWidth;

			} else {
				width = D.width();
			}

			this.overlay.width(width).height(D.height());
		},

		beforeShow: function (opts) {
			if (this.overlay) {
				return;
			}

			this.overlay = $('<div id="fancybox-overlay"></div>').css(opts.css || {
				background: 'black'
			}).appendTo('body');

			this.update();

			if (opts.closeClick) {
				this.overlay.bind('click.fb', F.close);
			}

			W.bind("resize.fb", $.proxy(this.update, this));

			this.overlay.fadeTo(opts.speedIn || "fast", opts.opacity || 1);
		},

		onUpdate: function () {
			//Update as content may change document dimensions
			this.update();
		},

		afterClose: function (opts) {
			if (this.overlay) {
				this.overlay.fadeOut(opts.speedOut || "fast", function () {
					$(this).remove();
				});
			}

			this.overlay = null;
		}
	};

	/*
	 *	Title helper
	 */

	F.helpers.title = {
		beforeShow: function (opts) {
			var title, text = F.current.title;

			if (text) {
				title = $('<div class="fancybox-title fancybox-title-' + opts.type + '-wrap">' + text + '</div>').appendTo('body');

				if (opts.type === 'float') {
					//This helps for some browsers
					title.width(title.width());

					title.wrapInner('<span class="child"></span>');

					//Increase bottom margin so this title will also fit into viewport
					F.current.margin[2] += Math.abs(parseInt(title.css('margin-bottom'), 10));
				}

				title.appendTo(opts.type === 'over' ? F.inner : (opts.type === 'outside' ? F.wrap : F.outer));
			}
		}
	};

	// jQuery plugin initialization
	$.fn.fancybox = function (options) {
		var opts = options || {},
			selector = this.selector || '';

		function run(e) {
			var group = [], relType, relVal, rel = this.rel;

			if (!(e.ctrlKey || e.altKey || e.shiftKey || e.metaKey)) {
				e.preventDefault();

				relVal = $(this).data('fancybox-group');

				// Check if element has 'data-fancybox-group' attribute, if not - use 'rel'
				if (typeof relVal !== 'undefined') {
					relType = relVal ? 'data-fancybox-group' : false;

				} else if (rel && rel !== '' && rel !== 'nofollow') {
					relVal = rel;
					relType = 'rel';
				}

				if (relType) {
					group = selector.length ? $(selector).filter('[' + relType + '="' + relVal + '"]') : $('[' + relType + '="' + relVal + '"]');
				}

				if (group.length) {
					opts.index = group.index(this);

					F.open(group.get(), opts);

				} else {
					F.open(this, opts);
				}
			}
		}

		if (selector) {
			D.undelegate(selector, 'click.fb-start').delegate(selector, 'click.fb-start', run);

		} else {
			$(this).unbind('click.fb-start').bind('click.fb-start', run);
		}

		return this;
	};

}(window, document, jQuery));