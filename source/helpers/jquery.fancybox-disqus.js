 /*!
 * Thumbnail helper for fancyBox
 * version: 1.0.7 (Mon, 01 Oct 2012)
 * @requires fancyBox v2.0 or later
 *
 * Usage:
 *     $(".fancybox").fancybox({
 *         helpers : {
 *             disqus: {}
 *         }
 *     });
 *
 */
(function ($) {
	//Shortcut for fancyBox object
	var F = $.fancybox;

	//Add helper object
	F.helpers.disqus = {
		defaults : {
			disqus_width    : 350,
			disqus_url 	 : '',
			disqus_shortname: '',
			disqus_developer: 0,
			source   	: function ( item ) {
				var href;
    			if (item.element) {
    					href = item.href;
    			}
    			return href;
    		}
		},
		wrap  : null,
		width : 0,

		init: function (opts, obj) {
			var that = this;
	        obj.width +=opts.disqus_width;
         },

		beforeLoad: function (opts, obj) {
		},

		beforeShow: function (opts, obj) {
		},

		afterShow: function (opts, obj) {
			this.init(opts, obj);
		},

		onUpdate: function (opts, obj) {
			var imgSource = opts.source(obj.group[obj.index]);

			$('.fancybox-image').css('width','auto');
			$('.fancybox-image').css('float','left');
			$('.fancybox-inner').animate({width: "+="+opts.disqus_width+"px"});
			
			this.wrap = $('<div id="disqus-comments"></div>').addClass(opts.position).appendTo('.fancybox-inner');
            $('#disqus-comments').append('<div id=\'comments\'><div id="comment_scrollable"><div id="disqus_thread"></div><script type="text/javascript">var disqus_shortname = "'+opts.disqus_shortname+'";var disqus_developer = '+opts.disqus_developer+';var disqus_url = "'+opts.disqus_url+imgSource+'";var dsq = document.createElement(\'script\'); dsq.type = \'text/javascript\'; dsq.async = true;dsq.src = \'http://\' + disqus_shortname + \'.disqus.com/embed.js\';(document.getElementsByTagName(\'head\')[0] || document.getElementsByTagName(\'body\')[0]).appendChild(dsq);</script><noscript>Please enable JavaScript to view the <a href="http://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript><a href="http://disqus.com" class="dsq-brlink">comments powered by <span class="logo-disqus">Disqus</span></a></div></div>');
		},

		beforeClose: function () {
		}
	}

}(jQuery));