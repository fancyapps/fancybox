/*!
 * fancyBox - jQuery Plugin
 * version: 2.0.6 (Wed, 02 May 2012)
 * @requires jQuery v1.6 or later
 *
 * Examples at http://fancyapps.com/fancybox/
 * License: www.fancyapps.com/fancybox/#license
 *
 * Copyright 2012 Janis Skarnelis - janis@fancyapps.com
 *
 */

(function (window, document, $, undefined) {
	"use strict";

	var W = $(window),
		D = $(document),
		F = $.fancybox = function () {
			F.open.apply( this, arguments );
		},
		didUpdate	= false,
		isTouch		= document.createTouch !== undefined,
		isQuery		= function(obj) {
			return obj && obj.hasOwnProperty && obj instanceof $;
		},
		isString	= function(str) {
			return $.type(str) === "string";
		},
		isPercentage = function(str) {
			return isString(str) && str.indexOf('%') > 0;
		},
		getScalar = function(value, dim) {
			if (dim && isPercentage(value)) {
				value = F.getViewport()[ dim ] / 100 * parseInt(value, 10);
			}

			return Math.ceil(value);
		},
		getValue = function(value, dim) {
			return getScalar(value, dim) + 'px';
		};

	$.extend(F, {
		// The current version of fancyBox
		version: '2.0.6',

		defaults: {
			padding : 15,
			margin  : 20,

			width     : 800,
			height    : 600,
			minWidth  : 100,
			minHeight : 100,
			maxWidth  : 9999,
			maxHeight : 9999,

			autoSize   : true,
			autoHeight : false,
			autoWidth  : false,

			autoResize  : !isTouch,
			autoCenter  : !isTouch,
			fitToView   : true,
			aspectRatio : false,
			topRatio    : 0.5,

			fixed     : false,
			scrolling : 'auto', // 'auto', 'yes' or 'no'
			wrapCSS   : '',

			arrows     : true,
			closeBtn   : true,
			closeClick : false,
			nextClick  : false,
			mouseWheel : true,
			autoPlay   : false,
			playSpeed  : 3000,
			preload    : 3,

			modal : false,
			loop  : true,
			ajax  : {
				dataType : 'html',
				headers  : { 'X-fancyBox': true }
			},
			keys  : {
				next : {
					13 : 'right', // enter
					34 : 'down',  // page down
					39 : 'right', // right arrow
					40 : 'down'   // down arrow
				},
				prev : {
					8  : 'left', // backspace
					33 : 'up',   // page up
					37 : 'left', // left arrow
					38 : 'up'    // up arrow
				},
				close  : [27], // escape key
				play   : [32], // space
				toggle : [70]  // letter "f"
			},

			// Override some properties
			index   : 0,
			type    : null,
			href    : null,
			content : null,
			title   : null,

			// HTML templates
			tpl: {
				wrap     : '<div class="fancybox-wrap"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',
				image    : '<img class="fancybox-image" src="{href}" alt="" />',
				iframe   : '<iframe class="fancybox-iframe" name="fancybox-frame{rnd}" frameborder="0" hspace="0"' + ($.browser.msie ? ' allowtransparency="true"' : '') + '></iframe>',
				swf      : '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="wmode" value="transparent" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{href}" /><embed src="{href}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="100%" height="100%" wmode="transparent"></embed></object>',
				error    : '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
				closeBtn : '<div title="Close" class="fancybox-item fancybox-close"></div>',
				next     : '<a title="Next" class="fancybox-nav fancybox-next"><span></span></a>',
				prev     : '<a title="Previous" class="fancybox-nav fancybox-prev"><span></span></a>'
			},

			// Properties for each animation type
			// Opening fancyBox
			openEffect  : 'fade', // 'elastic', 'fade' or 'none'
			openSpeed   : 300,
			openEasing  : 'swing',
			openOpacity : true,
			openMethod  : 'zoomIn',

			// Closing fancyBox
			closeEffect  : 'fade', // 'elastic', 'fade' or 'none'
			closeSpeed   : 300,
			closeEasing  : 'swing',
			closeOpacity : true,
			closeMethod  : 'zoomOut',

			// Changing next gallery item
			nextEffect : 'elastic', // 'elastic', 'fade' or 'none'
			nextSpeed  : 300,
			nextEasing : 'swing',
			nextMethod : 'changeIn',

			// Changing previous gallery item
			prevEffect : 'elastic', // 'elastic', 'fade' or 'none'
			prevSpeed  : 300,
			prevEasing : 'swing',
			prevMethod : 'changeOut',

			// Enabled helpers
			helpers : {
				overlay : {
					speedIn  : 0,
					speedOut : 300,
					opacity  : 0.8,
					css      : {
						cursor : 'pointer'
					},
					closeClick: true
				},
				title : {
					type : 'float' // 'float', 'inside', 'outside' or 'over'
				}
			},

			// Callbacks
			onCancel    : $.noop, // If canceling
			beforeLoad  : $.noop, // Before loading
			afterLoad   : $.noop, // After loading
			beforeShow  : $.noop, // Before changing in current item
			afterShow   : $.noop, // After opening
			beforeClose : $.noop, // Before closing
			afterClose  : $.noop  // After closing
		},

		//Current state
		group    : {}, // Selected group
		opts     : {}, // Group options
		coming   : null, // Element being loaded
		current  : null, // Currently loaded element
		isActive : false, // Is activated
		isOpen   : false, // Is currently open
		isOpened : false, // Have been fully opened at least once

		wrap  : null,
		skin  : null,
		outer : null,
		inner : null,

		player : {
			timer    : null,
			isActive : false
		},

		// Loaders
		ajaxLoad   : null,
		imgPreload : null,

		// Some collections
		transitions : {},
		helpers     : {},

		/*
		 *	Static methods
		 */

		open: function (group, opts) {
			if (!group) {
				return;
			}

			//Kill existing instances
			F.close(true);

			F.isActive = true;

			//Normalize group
			if (!$.isArray(group)) {
				group = isQuery(group) ? $(group).get() : [group];
			}

			//Recheck each element - change to object, set type
			$.each(group, function(i, element) {
				var obj = {},
					href,
					hrefParts,
					type,
					content,
					rez,
					selector;

				if (isString(element)) {
					href = element;

				} else if (element && typeof element === "object") {
					//Check if is DOM element
					if (element.nodeType || isQuery(element)) {
						obj = {
							href    : $(element).attr('href'),
							title   : $(element).attr('title'),
							isDom   : true,
							element : element
						};

						if ($.metadata) {
							$.extend(true, obj, $(element).metadata());
						}

					} else {
						obj = element;
					}

					href = obj.href;
					type = obj.type;
				}

				if (!type && obj.isDom) {
					type = $(obj.element).data('fancybox-type');

					if (!type) {
						rez  = obj.element.className.match(/fancybox\.(\w+)/);
						type = rez ? rez[1] : null;
					}
				}

				if (!type) {
					if (obj.content) {
						type = 'html';

					} else if (!href && obj.isDom) {
						type    = 'inline';
						content = $(obj.element);
					}
				}

				if (!type && isString(href)) {
					if (F.isImage(href)) {
						type = 'image';

					} else if (F.isSWF(href)) {
						type = 'swf';

					} else if (href.match(/^#/)) {
						type = 'inline';

					} else if (isString(element)) {
						type    = 'html';
						content = element;
					}
				}

				if (type === 'ajax' && isString(href)) {
					hrefParts = href.split(/\s+/, 2);
					href      = hrefParts.shift();
					selector  = hrefParts.shift();
				}

				$.extend(obj, {
					href     : href,
					type     : type,
					content  : content,
					selector : selector
				});

				group[ i ] = obj;
			});

			//Extend the defaults
			F.opts = $.extend(true, {}, F.defaults, opts);

			//All options are merged recursive except keys
			if ($.isPlainObject(opts) && opts.keys !== undefined) {
				F.opts.keys = opts.keys ? $.extend({}, F.defaults.keys, opts.keys) : false;
			}

			F.group = group;

			return F._start(F.opts.index || 0);
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
				$('.fancybox-wrap').stop().trigger('onReset').remove();

				F._afterZoomOut();

			} else {
				F.isOpen = F.isOpened = false;

				$('.fancybox-item, .fancybox-nav').remove();

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

		next: function ( direction ) {
			if (!isString(direction)) {
				direction = 'right';
			}

			if (F.current) {
				F.jumpto(F.current.index + 1, direction, 'next');
			}
		},

		prev: function ( direction ) {
			if (!isString(direction)) {
				direction = 'left';
			}

			if (F.current) {
				F.jumpto(F.current.index - 1, direction, 'prev');
			}
		},

		jumpto: function ( index, direction, canSkip ) {
			var current = F.current;

			if (!current) {
				return;
			}

			index = parseInt(index, 10);

			F.direction = direction || (index > current.index ? 'right' : 'left');
			F.canSkip   = canSkip || false;

			if (current.loop) {
				if (index < 0) {
					index = current.group.length + (index % current.group.length);
				}

				index = index % current.group.length;
			}

			if (current.group[index] !== undefined) {
				F.cancel();

				F._start(index);
			}
		},

		reposition: function (e, onlyAbsolute) {
			var pos;

			if (F.isOpen) {
				pos = F._getPosition(onlyAbsolute);

				if (e && e.type === 'scroll') {
					delete pos.position;

					F.wrap.stop(true, true).animate(pos, 200);

				} else {
					F.wrap.css(pos);
				}
			}
		},

		update: function (e) {
			var anyway = !e || (e && e.type === 'orientationchange');

			if (anyway) {
				clearTimeout(didUpdate);

			} else if (!F.isOpen || didUpdate) {
				return;
			}

			// Touch devices need some help to restore document dimensions
			if (anyway && isTouch) {
				F.wrap.removeAttr('style').addClass('fancybox-tmp');

				F.trigger('onUpdate');
			}

			didUpdate = setTimeout(function() {
				var current = F.current;

				didUpdate = null;

				if (!current) {
					return;
				}

				F.wrap.removeClass('fancybox-tmp');

				if ((current.autoResize && !(e && e.type === 'scroll')) || anyway) {
					F._setDimension();

					F.trigger('onUpdate');
				}

				if ((current.autoCenter && !(e && e.type === 'scroll' && current.canShrink)) || anyway) {
					F.reposition(e);
				}

				F.trigger('onUpdate');

			}, (anyway ? 20 : 200));
		},

		toggle: function () {
			if (F.isOpen) {
				F.current.fitToView = !F.current.fitToView;

				F.update();
			}
		},

		hideLoading: function () {
			D.unbind('keypress.fb');

			$('#fancybox-loading').remove();
		},

		showLoading: function () {
			var el, viewport;

			F.hideLoading();

			//If user will press the escape-button, the request will be canceled
			D.bind('keypress.fb', function(e) {
				if (e.which === 27) {
					e.preventDefault();
					F.cancel();
				}
			});

			el = $('<div id="fancybox-loading"><div></div></div>').click(F.cancel).appendTo('body');

			if (F.coming && !F.coming.fixed) {
				viewport = F.getViewport();

				el.css({
					position : 'absolute',
					top  : (viewport.h * 0.5) + viewport.y,
					left : (viewport.w * 0.5) + viewport.x
				});
			}
		},

		getViewport: function () {
			// See http://bugs.jquery.com/ticket/6724
			return {
				x: W.scrollLeft(),
				y: W.scrollTop(),
				w: isTouch && window.innerWidth ? window.innerWidth : W.width(),
				h: isTouch && window.innerHeight ? window.innerHeight : W.height()
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
				keys;

			if (!current) {
				return;
			}

			W.bind('resize.fb orientationchange.fb' + (current.autoCenter && !current.fixed ? ' scroll.fb' : ''), F.update);

			keys = current.keys;

			if (keys) {
				D.bind('keydown.fb', function (e) {
					var code, target = e.target || e.srcElement;

					// Ignore key combinations and key events within form elements
					if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && !(target && (target.type || $(target).is('[contenteditable]')))) {
						code = e.which;

						for (var i in keys) {
							if (current.group.length > 1 && code in keys[ i ]) {
								F[ i ]( keys[ i ][ code ] );

								e.preventDefault();
								return;

							} else if ($.inArray(code, keys[ i ]) > -1) {
								F[ i ] ();

								e.preventDefault();
								return;
							}
						}
					}
				});
			}

			if ($.fn.mousewheel && current.mouseWheel && F.group.length > 1) {
				F.wrap.bind('mousewheel.fb', function (e, delta) {
					var target = e.target || null;

					if (delta !== 0 && !current.canShrink && (!target || target.clientHeight === 0 || (target.scrollHeight === target.clientHeight && target.scrollWidth === target.clientWidth))) {
						if (delta > 0) {
							F.prev( 'up' );
						} else {
							F.next( 'down' );
						}

						e.preventDefault();
					}
				});
			}
		},

		trigger: function (event, o) {
			var ret, obj = o || F[ $.inArray(event, ['onCancel', 'beforeLoad', 'afterLoad']) > -1 ? 'coming' : 'current' ];

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
					if (opts && $.isPlainObject(F.helpers[helper]) && $.isFunction(F.helpers[helper][event])) {
						F.helpers[helper][event](opts, obj);
					}
				});
			}

			$.event.trigger(event + '.fb');
		},

		isImage: function (str) {
			return isString(str) && str.match(/\.(jpe?g|jpe|gif|png|bmp)((\?|#).*)?$/i);
		},

		isSWF: function (str) {
			return isString(str) && str.match(/\.(swf)((\?|#).*)?$/i);
		},

		_start: function (index) {
			var coming = {},
				obj    = F.group[ index ] || null,
				href,
				type;

			if (!obj) {
				return false;
			}

			coming = $.extend(true, {}, F.opts, obj);

			// Re-check overridable options
			$.each(['href', 'title', 'content', 'type'], function(i,v) {
				coming[ v ] = F.opts[ v ] || coming[ v ] || null;
			});

			// Convert margin property to array - top, right, bottom, left
			if (typeof coming.margin === 'number') {
				coming.margin = [coming.margin, coming.margin, coming.margin, coming.margin];
			}

			// 'modal' propery is just a shortcut
			if (coming.modal) {
				$.extend(true, coming, {
					closeBtn   : false,
					closeClick : false,
					nextClick  : false,
					arrows     : false,
					mouseWheel : false,
					keys       : null,
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

			// 'autoSize' property is a shortcut, too
			if (coming.autoSize) {
				coming.autoWidth = coming.autoHeight = true;
			}

			if (coming.width === 'auto') {
				coming.autoWidth = true;
			}

			if (coming.height === 'auto') {
				coming.autoHeight = true;
			}

			/*
			 * Add reference to the group, so it`s possible to access from callbacks, example:
			 * afterLoad : function() {
			 *     this.title = 'Image ' + (this.index + 1) + ' of ' + this.group.length + (this.title ? ' - ' + this.title : '');
			 * }
			 */

			coming.group  = F.group;
			coming.index  = index;

			//Give a chance for callback or helpers to update coming item (type, title, etc)
			F.coming = coming;

			if (false === F.trigger('beforeLoad')) {
				F.coming = null;
				return;
			}

			type = coming.type;
			href = coming.href;

			// Check before try to load; 'inline' and 'html' types need content, others - href
			if (type === 'inline' || type === 'html') {
				if (!coming.content) {
					if (type === 'inline') {
						coming.content = $( isString(href) ? href.replace(/.*(?=#[^\s]+$)/, '') : href ); //strip for ie7

					} else {
						coming.content = obj;
					}
				}

				if (!coming.content || !coming.content.length) {
					return F._error( 'content' );
				}

			} else if (!href) {
				return F._error( 'href' );
			}

			if (type === 'image') {
				F._loadImage();

			} else if (type === 'ajax') {
				F._loadAjax();

			} else if (type) {
				F._afterLoad();

			} else {
				F.coming = null;

				//If we can not determine content type then drop silently or display next/prev item if looping through gallery
				if (F.current && F.canSkip) {
					F.current.index = index;

					F[ F.canSkip ]( F.direction );

				} else {
					return false;
				}
			}
		},

		_error: function ( type ) {
			F.hideLoading();

			if (!F.coming) {
				return;
			}

			$.extend(F.coming, {
				type      : 'html',
				width     : 'auto',
				height    : 'auto',
				minWidth  : 0,
				minHeight : 0,
				padding   : 15,
				hasError  : type,
				content   : F.coming.tpl.error
			});

			F._afterLoad();
		},

		_loadImage: function () {
			// Reset preload image so it is later possible to check "complete" property
			var img = F.imgPreload = new Image();

			img.onload = function () {
				this.onload = this.onerror = null;

				F.coming.width  = this.width;
				F.coming.height = this.height;

				F._afterLoad();
			};

			img.onerror = function () {
				this.onload = this.onerror = null;

				F._error( 'image' );
			};

			img.src = F.coming.href;

			if (img.complete === undefined || !img.complete) {
				F.showLoading();
			}
		},

		_loadAjax: function () {
			F.showLoading();

			F.ajaxLoad = $.ajax($.extend({}, F.coming.ajax, {
				url: F.coming.href,
				error: function (jqXHR, textStatus) {
					if (F.coming && textStatus !== 'abort') {
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

		_preloadImages: function() {
			var group   = F.group,
				current = F.current,
				len     = group.length,
				cnt     = current.preload ? Math.min(current.preload, len - 1) : 0,
				item,
				i;

			for (i = 1; i <= cnt; i += 1) {
				item = group[ (current.index + i ) % len ];

				if (item.type === 'image' && item.href) {
					new Image().src = item.href;
				}
			}
		},

		_afterLoad: function () {
			F.hideLoading();

			if (!F.coming || false === F.trigger('afterLoad', null, F.current)) {
				F.coming = false;

				return;
			}

			if (F.isOpened) {
				$('.fancybox-item, .fancybox-nav').remove();

				F.wrap.stop(true).removeClass('fancybox-opened');
				F.inner.css('overflow', 'hidden');

				F.transitions[F.current.prevMethod]();

			} else {
				$('.fancybox-wrap').stop().trigger('onReset').remove();

				F.trigger('afterClose');
			}

			F.unbindEvents();

			F.current = F.coming;

			// Build the neccessary markup
			F.wrap = $(F.current.tpl.wrap).addClass('fancybox-' + (isTouch ? 'mobile' : 'desktop') + ' fancybox-type-' + F.current.type + ' fancybox-tmp ' + F.current.wrapCSS).appendTo('body');

			$.extend(F, {
				skin    : $('.fancybox-skin', F.wrap).css('padding', getValue(F.current.padding)),
				outer   : $('.fancybox-outer', F.wrap),
				inner   : $('.fancybox-inner', F.wrap),
				isOpen  : false
			});

			$.extend(F.current, {
				wrap  : F.wrap,
				skin  : F.skin,
				outer : F.outer,
				inner : F.inner
			});

			F._setContent();
		},

		_setContent: function () {
			var current = F.current,
				content = current.content,
				type    = current.type;

			switch (type) {
				case 'inline':
				case 'ajax':
				case 'html':
					if (current.selector) {
						content = $('<div>').html(content).find(current.selector);

					} else if (isQuery(content)) {
						if (content.parent().hasClass('fancybox-inner')) {
							content.parents('.fancybox-wrap').unbind('onReset');
						}

						content = content.show().detach();

						$(F.wrap).bind('onReset', function () {
							content.appendTo('body').hide();
						});
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
					content = $(current.tpl.iframe.replace('{rnd}', new Date().getTime()) )
						.attr('scrolling', isTouch ? 'auto' : current.scrolling)
						.attr('src', current.href);

					current.aspectRatio	= false;
					current.autoWidth   = false;

					$(F.wrap).bind('onReset', function () {
						content.hide().empty();
					});
				break;

				default:
					return F._error('type');
			}

			if (type === 'image' || type === 'swf') {
				current.autoHeight = current.autoWidth = false;
				current.scrolling  = 'visible';
			}

			if (type === 'iframe' && current.autoHeight) {
				F.showLoading();

				//This helps iOS
				if (isTouch) {
					F.inner.css('overflow', 'scroll');
				}

				content.bind({
					onCancel : function() {
						$(this).unbind();

						if (F.isOpened) {
							$('.fancybox-wrap').stop().trigger('onReset').remove();

						} else {
							F._afterZoomOut();
						}
					},
					load : function() {
						F.hideLoading();

						F.current.autoHeight = true;

						F[ F.isOpen ? '_afterZoomIn' : '_beforeShow']();
					}
				}).appendTo(F.inner);

			} else {
				F.inner.append(content);

				F._beforeShow();
			}
		},

		_beforeShow : function() {
			F.coming = null;

			//Give a chance for helpers or callbacks to update elements
			F.trigger('beforeShow');

			//Set initial dimensions and hide
			F._setDimension();

			F.wrap.hide().removeClass('fancybox-tmp');

			F.bindEvents();

			F._preloadImages();

			F.transitions[ F.isOpened ? F.current.nextMethod : F.current.openMethod ]();
		},

		_setDimension: function () {
			var viewport  = F.getViewport(),
				wrap      = F.wrap,
				inner     = F.inner,
				current   = F.current,
				width     = current.width,
				height    = current.height,
				minWidth  = current.minWidth,
				minHeight = current.minHeight,
				maxWidth  = current.maxWidth,
				maxHeight = current.maxHeight,
				scrolling = current.scrolling,
				scrollOut = current.scrollOutside,
				margin    = current.margin,
				wMargin   = margin[1] + margin[3],
				hMargin   = margin[0] + margin[2],
				wPadding,
				hPadding,
				wSpace,
				hSpace,
				origWidth,
				origHeight,
				origMaxWidth,
				origMaxHeight,
				ratio,
				width_,
				height_,
				maxWidth_,
				maxHeight_,
				iframe,
				body;

			//Reset dimensions
			$(inner.add(wrap)).width('auto').height('auto');

			//This helps IE8 (but breaks iOS)
			if (!isTouch && current.type !== 'iframe') {
				inner.css('overflow', 'hidden');
			}

			//Space between wrap and content
			wPadding = wrap.width() - inner.width();
			hPadding = wrap.height() - inner.height();

			//Any space between content and viewport - margin, padding, border, title
			wSpace = wMargin + wPadding;
			hSpace = hMargin + hPadding;

			//Calculations for the content
			width  = getScalar(isPercentage(width)  ? ((viewport.w - wSpace) * parseFloat(width))  / 100 : width);
			height = getScalar(isPercentage(height) ? ((viewport.h - wSpace) * parseFloat(height)) / 100 : height);

			minWidth = getScalar(isPercentage(minWidth) ? getScalar(minWidth, 'w') - wSpace : minWidth);
			maxWidth = getScalar(isPercentage(maxWidth) ? getScalar(maxWidth, 'w') - wSpace : maxWidth);

			minHeight = getScalar(isPercentage(minHeight) ? getScalar(minHeight, 'h') - hSpace : minHeight);
			maxHeight = getScalar(isPercentage(maxHeight) ? getScalar(maxHeight, 'h') - hSpace : maxHeight);

			//These will be used to determine if wrap can fit in the viewport
			maxWidth_  = viewport.w - wMargin;
			maxHeight_ = viewport.h - hMargin;

			origMaxWidth  = maxWidth;
			origMaxHeight = maxHeight;

			if (current.fitToView) {
				maxWidth  = Math.min(viewport.w - wSpace, maxWidth);
				maxHeight = Math.min(viewport.h - hSpace, maxHeight);
			}

			if (current.type === 'iframe') {
				iframe = inner.find('.fancybox-iframe');

				if (current.autoHeight) {
					try {
						if (iframe[0].contentWindow.document.location) {
							inner.width(width).height(maxHeight);

							body = iframe.contents().find('body');

							if (scrollOut) {
								body.css('overflow-x', 'hidden');
							}

							height = body.height();
						}
					} catch (e) {
						current.autoHeight = false;
					}
				}

			} else {
				width  = current.autoWidth  ? getScalar(inner.width())  : width;
				height = current.autoHeight ? getScalar(inner.height()) : height;
			}

			origWidth  = width;
			origHeight = height;

			ratio = origWidth / origHeight;

			if (current.aspectRatio) {
				if (width > maxWidth) {
					width  = maxWidth;
					height = width / ratio;
				}

				if (height > maxHeight) {
					height = maxHeight;
					width  = height * ratio;
				}

				if (width < minWidth) {
					width  = minWidth;
					height = width / ratio;
				}

				if (height < minHeight) {
					height = minHeight;
					width  = height * ratio;
				}

			} else {
				width  = Math.max(minWidth, Math.min(width, maxWidth));
				height = Math.max(minHeight, Math.min(height, maxHeight));
			}

			inner.width(width);

			//Try to get rid of horizontal scrolling before they appear
			if (scrollOut && scrolling !== 'no' && (body ? (getScalar(body.height()) > height) : getScalar(inner.height()) > height)) {
				width += scrollOut;
				origWidth += scrollOut;

				inner.width(width);
			}

			inner.height(height);

			wrap.width(width + wPadding);

			// Real wrap dimensions
			width_  = wrap.width();
			height_ = wrap.height();

			//Try to fit inside viewport (title can wrap to multiple lines)
			if (current.fitToView && (width_ > maxWidth_ || height_ > maxHeight_) && width > minWidth && height > minHeight) {
				while ((width_ > maxWidth_ || height_ > maxHeight_) && width > minWidth && height > minHeight) {
					height = Math.max(minHeight, height - 10);

					if (current.aspectRatio) {
						width = Math.round(height * ratio);

						if (width < minWidth) {
							width  = minWidth;
							height = width  / ratio;
						}

					} else {
						width = width - 10;
					}

					inner.width(width).height(height);

					wrap.width(width + wPadding);

					width_  = wrap.width();
					height_ = wrap.height();
				}
			}

			current.dim = {
				width	: getValue(width_),
				height	: getValue(height_)
			};

			if (isPercentage(current.width) && isPercentage(current.height)) {
				current.canShrink = false;
				current.canExpand = false;

			} else {
				current.canShrink = (width_ > maxWidth_ || height_ > maxHeight_) && width > minWidth && height > minHeight;
				current.canExpand = current.aspectRatio ? (width < origMaxWidth && height < origMaxHeight && width < origWidth && height < origHeight) : ((width < origMaxWidth || height < origMaxHeight) && (width < origWidth || height < origHeight));
			}

			F.wSpace = width_  - width;
			F.hSpace = height_ - height;

			if (!iframe && current.autoHeight && height > minHeight && height < maxHeight) {
				inner.height('auto');
			}

			inner.css('overflow', current.type === 'iframe' && isTouch ? 'scroll' : (scrolling === 'yes' ? 'scroll' : (scrolling === 'no' ? 'hidden' : scrolling)));
		},

		_getPosition: function (onlyAbsolute) {
			var current		= F.current,
				viewport    = F.getViewport(),
				margin      = current.margin,
				width       = F.wrap.width() + margin[1] + margin[3],
				height      = F.wrap.height() + margin[0] + margin[2],
				rez         = {
					position: 'absolute',
					top  : margin[0] + viewport.y,
					left : margin[3] + viewport.x
				};

			if (current.autoCenter && current.fixed && !onlyAbsolute && height <= viewport.h && width <= viewport.w) {
				rez = {
					position: 'fixed',
					top  : margin[0],
					left : margin[3]
				};
			}

			rez.top     = getValue(Math.max(rez.top, rez.top + ((viewport.h - height) * current.topRatio)));
			rez.left    = getValue(Math.max(rez.left, rez.left + ((viewport.w - width) * 0.5)));

			return rez;
		},

		_afterZoomIn: function () {
			var current = F.current;

			if (!current) {
				return;
			}

			F.isOpen = F.isOpened = true;

			F.wrap.addClass('fancybox-opened');

			F.trigger('afterShow');

			F.update(true);

			//Assign a click event
			if (current.closeClick || current.nextClick) {
				F.inner.css('cursor', 'pointer').bind('click.fb', function(e) {
					if (!$(e.target).is('a') && !$(e.target).parent().is('a')) {
						F[ current.closeClick ? 'close' : 'next' ]();
					}
				});
			}

			//Create a close button
			if (current.closeBtn) {
				$(current.tpl.closeBtn).appendTo(F.skin).bind('click.fb', F.close);
			}

			//Create navigation arrows
			if (current.arrows && F.group.length > 1) {
				if (current.loop || current.index > 0) {
					$(current.tpl.prev).appendTo(F.outer).bind('click.fb', F.prev);
				}

				if (current.loop || current.index < F.group.length - 1) {
					$(current.tpl.next).appendTo(F.outer).bind('click.fb', F.next);
				}
			}

			if (F.opts.autoPlay && !F.player.isActive) {
				F.opts.autoPlay = false;

				F.play();
			}
		},

		_afterZoomOut: function () {
			var current = F.current;

			F.wrap.trigger('onReset').remove();

			$.extend(F, {
				group    : {},
				opts     : {},
				current  : null,
				isActive : false,
				isOpened : false,
				isOpen   : false,
				canSkip  : false,
				wrap  : null,
				skin  : null,
				outer : null,
				inner : null
			});

			F.trigger('afterClose', current);
		}
	});

	/*
	 *	Default transitions
	 */

	F.transitions = {
		getOrigPosition: function () {
			var current = F.current,
				element = current.element,
				padding = current.padding,
				orig    = $(current.orig),
				pos     = {},
				width   = 50,
				height  = 50,
				viewport;

			if (!orig.length && current.isDom && $(element).is(':visible')) {
				orig = $(element).find('img:first');

				if (!orig.length) {
					orig = $(element);
				}
			}

			if (orig.length) {
				pos = orig.offset();

				if (orig.is('img')) {
					width  = orig.outerWidth();
					height = orig.outerHeight();
				}

			} else {
				viewport = F.getViewport();

				pos.top  = viewport.y + (viewport.h - height) * 0.5;
				pos.left = viewport.x + (viewport.w - width) * 0.5;
			}

			pos = {
				top     : getValue(pos.top - padding),
				left    : getValue(pos.left - padding),
				width   : getValue(width + padding * 2),
				height  : getValue(height + padding * 2)
			};

			return pos;
		},

		step: function (now, fx) {
			var prop = fx.prop, ratio, padding2 = F.current.padding * 2;

			if (prop === 'width' || prop === 'height') {
				ratio = (now - fx.start) / (fx.end - fx.start);

				if (fx.start > fx.end) {
					ratio = 1 - ratio;
				}

				F.inner[prop]( Math.ceil(now - padding2 ) - ((F[ prop === 'height' ? 'hSpace' : 'wSpace' ] - padding2) * ratio) );
			}
		},

		zoomIn: function () {
			var wrap     = F.wrap,
				current  = F.current,
				effect   = current.openEffect,
				elastic  = effect === 'elastic',
				dim      = current.dim,
				startPos = $.extend({}, dim, F._getPosition( elastic )),
				endPos   = $.extend({opacity : 1}, startPos);

			//Remove "position" property that breaks older IE
			delete endPos.position;

			if (elastic) {
				startPos = this.getOrigPosition();

				if (current.openOpacity) {
					startPos.opacity = 0;
				}

				F.inner.width('auto').height('auto').css('overflow', 'hidden');

			} else if (effect === 'fade') {
				startPos.opacity = 0;
			}

			wrap.css(startPos)
				.show()
				.animate(endPos, {
					duration : effect === 'none' ? 0 : current.openSpeed,
					easing   : current.openEasing,
					step     : elastic ? this.step : null,
					complete : F._afterZoomIn
				});
		},

		zoomOut: function () {
			var wrap     = F.wrap,
				current  = F.current,
				effect   = current.openEffect,
				elastic  = effect === 'elastic',
				endPos   = {opacity : 0};

			if (elastic) {
				if (wrap.css('position') === 'fixed') {
					wrap.css(F._getPosition(true));
				}

				endPos = this.getOrigPosition();

				if (current.closeOpacity) {
					endPos.opacity = 0;
				}
			}

			wrap.animate(endPos, {
				duration : effect === 'none' ? 0 : current.closeSpeed,
				easing   : current.closeEasing,
				step     : elastic ? this.step : null,
				complete : F._afterZoomOut
			});
		},

		changeIn: function () {
			var wrap      = F.wrap,
				current   = F.current,
				effect    = current.nextEffect,
				elastic   = effect === 'elastic',
				startPos  = F._getPosition( elastic ),
				endPos    = { opacity : 1 },
				direction = F.direction,
				distance  = 200,
				field;

			startPos.opacity = 0;

			if (elastic) {
				field = direction === 'down' || direction === 'up' ? 'top' : 'left';

				if (direction === 'down' || direction === 'right') {
					startPos[ field ] = getValue(parseInt(startPos[ field ], 10) - distance);
					endPos[ field ]   = '+=' + distance + 'px';

				} else {
					startPos[ field ] = getValue(parseInt(startPos[ field ], 10) + distance);
					endPos[ field ]   = '-=' + distance + 'px';
				}
			}

			wrap.css(startPos)
				.show()
				.animate(endPos, {
					duration : effect === 'none' ? 0 : current.nextSpeed,
					easing   : current.nextEasing,
					complete : function() {
						setTimeout(F._afterZoomIn, 10);
					}
				});
		},

		changeOut: function () {
			var wrap      = F.wrap,
				current   = F.current,
				effect    = current.prevEffect,
				endPos    = { opacity : 0 },
				direction = F.direction,
				distance  = 200,
				cleanUp   = function () {
					$(this).trigger('onReset').remove();
				};

			wrap.removeClass('fancybox-opened');

			if (effect === 'elastic') {
				endPos[ direction === 'down' || direction === 'up' ? 'top' : 'left' ] = ( direction === 'up' || direction === 'left' ? '-' : '+' ) + '=' + distance + 'px';
			}

			wrap.animate(endPos, {
				duration : effect === 'none' ? 0 : current.prevSpeed,
				easing   : current.prevEasing,
				complete : cleanUp
			});
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
			this.overlay.width('100%').height('100%');

			if ($.browser.msie || isTouch) {
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

			opts = $.extend(true, {}, F.defaults.helpers.overlay, opts);

			this.overlay = $('<div id="fancybox-overlay"></div>').css(opts.css).appendTo('body');

			if (opts.closeClick) {
				this.overlay.bind('click.fb', F.close);
			}

			if (F.current.fixed && !isTouch) {
				this.overlay.addClass('overlay-fixed');

			} else {
				this.update();

				this.onUpdate = function () {
					this.update();
				};
			}

			this.overlay
				.bind('mousewheel', function(e) {
					if (F.wrap && F.wrap.height() < W.height()) {
						e.preventDefault();
					}
				})
				.fadeTo(opts.speedIn, opts.opacity);
		},

		afterClose: function (opts) {
			if (this.overlay) {
				this.overlay.fadeOut(opts.speedOut || 0, function () {
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

				title.appendTo(opts.type === 'over' ? F.inner : (opts.type === 'outside' ? F.wrap : F.skin));
			}
		}
	};

	// jQuery plugin initialization
	$.fn.fancybox = function (options) {
		var that     = $(this),
			selector = this.selector || '',
			index,
			run      = function(e) {
				var what = this, idx = index, relType, relVal;

				if (!(e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) && !$(what).is('.fancybox-wrap')) {


					relType = options.groupAttr || 'data-fancybox-group';
					relVal  = $(what).attr(relType);

					if (!relVal) {
						relType = 'rel';
						relVal  = what[ relType ];
					}

					if (relVal && relVal !== '' && relVal !== 'nofollow') {
						what = selector.length ? $(selector) : that;
						what = what.filter('[' + relType + '="' + relVal + '"]');
						idx  = what.index(this);
					}

					options.index = idx;

					//Stop an event from bubbling if everything is fine
					if (F.open(what, options) !== false) {
						e.preventDefault();
					}
				}
			};

		options = options || {};
		index   = options.index || 0;

		if (!selector || options.live === false) {
			that.unbind('click.fb-start').bind('click.fb-start', run);
		} else {
			D.undelegate(selector, 'click.fb-start').delegate(selector, 'click.fb-start', run);
		}

		return this;
	};

	if (!$.scrollbarWidth) {
		// http://benalman.com/projects/jquery-misc-plugins/#scrollbarwidth
		$.scrollbarWidth = function() {
			var parent, child, width;
			parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body');
			child  = parent.children();
			width  = child.innerWidth() - child.height( 99 ).innerWidth();
			parent.remove();

			return width;
		};
	}

	// Tests that need a body at doc ready
	$(document).ready(function() {
		F.defaults.scrollOutside = $.scrollbarWidth();

		F.defaults.fixed = $.support.fixedPosition || !(($.browser.msie && $.browser.version <= 6) || isTouch);
	});

}(window, document, jQuery));