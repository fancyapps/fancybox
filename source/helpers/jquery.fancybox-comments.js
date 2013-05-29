/*!
 * Facebook comments helper for fancyBox
 * version: 1.0.0 (Tue, 29 May 2013)
 * @requires fancyBox v2.0 or later
 *
 * 
 * Usage:
 */
(function ($) {
	"use strict";

	//Shortcut for fancyBox object
	var F = $.fancybox,
        IE =  navigator.userAgent.match(/msie/),
        isString = function(str) {
            return str && $.type(str) === "string";
        };

    //Add helper object
    F.helpers.comments = {
        defaults : {
            type     : 'overlay', // 'inside', 'outside', 'outer', 'over', 'overlay'
            position : 'bottom', // 'top' or 'bottom'
            commentsString : '',
            commentsUrl : location.href,
            commentsWidth : '330',
            numberPosts : '10',
            colorScheme : 'light'
        },
        beforeShow: function (opts) {

            var current         = F.current,
                text            = opts.commentsString,
                commentsUrl     = opts.commentsUrl,
                commentsWidth   = opts.commentsWidth,
                numberPosts     = opts.numberPosts,
                colorScheme     = opts.colorScheme,
                type            = opts.type,
                comments,
                target;

            if(!window.FB)
                return;
            
            if ($.isFunction(text)) {
                text = text.call(current.element, current);
            }

            if ($.isFunction(commentsUrl)) {
                commentsUrl = commentsUrl.call(current.element, current);
            }

            if (!isString(commentsUrl) || $.trim(commentsUrl) === '') {
                commentsUrl = this.defaults.commentsUrl;
            }

            if (!isString(text) || $.trim(text) === '') {
                text = '<fb:comments href="'+commentsUrl+'" width="'+commentsWidth+'" num_posts="'+numberPosts+'" colorscheme="'+colorScheme+'"></fb:comments>';
            }

            comments = $('<div class="fancybox-comments-block fancybox-comments-' + type + '-wrap">' + text + '</div>');

            // Set the comments width
            comments.css({
                width: commentsWidth
            });

            switch (type) {
                case 'inside':
                    target = F.skin;
                break;

                case 'outside':
                    target = F.wrap;
                break;

                case 'outer':
                    target = F.outer;
                break;

                case 'over':
                    target = F.inner;
                break;

                case 'float':
                    target = F.skin;

                    comments.appendTo('body');

                    if (IE) {
                        comments.width( comments.width() );
                    }
                break;

                default: // 'overlay'
                    target = F.helpers.overlay.overlay;

                    // Increase right margin to fit the comments into the viewport
                    F.coming.margin[1] += commentsWidth;
                    
                break;
            }
            
            comments[ (opts.position === 'top' ? 'prependTo'  : 'appendTo') ](target);

            // Trigger the FB parse method
            FB.XFBML.parse();
        }
    };

}(jQuery));