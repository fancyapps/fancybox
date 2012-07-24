 /*!
 * Zoom helper for fancyBox
 * version: 1.0.0
 * @requires fancyBox v2.0 or later
 * @requires jquery-ui-draggable
 *
 * Usage:
 *     $(".fancybox").fancybox({
 *         helpers : { 
 *             zoom: {
 *                 maxZoom: 4
 *             }
 *         }
 *     });
 *
 * Options:
 *     tpl - HTML template
 *     maxZoom - Maximum zoom factor
 *
 */
(function ($) {

	// Add zoom helper object
	$.fancybox.helpers.zoom = {
		tpl  : '<div class="fancybox-item fancybox-zoom fancybox-zoomin" title="Zoom In"></div><div class="fancybox-item fancybox-zoom fancybox-zoomout disabled" title="Zoom Out"></div>',
		maxZoom: 3,
		
        afterShow: function(opts, obj){
            
            // variables
            $.fancybox.image = $.fancybox.inner.find('.fancybox-image');
            this.zoom = 0;
            this.offset = {
                top: $.fancybox.image.offset().top - $(window).scrollTop(),
                left: $.fancybox.image.offset().left - $(window).scrollLeft()
            };
            
            this.maxZoomLevel = (opts.maxZoom || this.maxZoom) - 1; // zoom level = zoom factor - 1
            
            // create the buttons
		    $(opts.tpl || this.tpl).appendTo($.fancybox.skin);
		    this.buttons = {
		        zoomin   : $.fancybox.skin.find('.fancybox-zoomin').click(this.zoomIn),
		        zoomout   : $.fancybox.skin.find('.fancybox-zoomout').click(this.zoomOut)
		    }
		    
		    $.fancybox.inner.css('overflow', 'hidden');
		    $.fancybox.image.css({
		        'max-height': '1000%', 
		        'max-width': '1000%', 
		        position: 'absolute'
		    }).draggable({
                drag: this.onDrag
            });
        },
        
        zoomIn: function(){
            var obj = $.fancybox.helpers.zoom;
            
            if(obj.zoom == obj.maxZoomLevel) return;
            obj.zoom++;
            
            var p = $.fancybox.image.position();
            $.fancybox.image.animate({
                height: (obj.zoom+1)*100+'%',
                width: (obj.zoom+1)*100+'%',
                left:(obj.offset.left-$(window).width()/2 + (obj.zoom+1)*p.left)/obj.zoom+'px',
                top:(obj.offset.top-$(window).height()/2 + (obj.zoom+1)*p.top)/obj.zoom+'px'
            });
            if(obj.zoom == obj.maxZoomLevel) obj.buttons.zoomin.addClass('disabled');
            obj.buttons.zoomout.removeClass('disabled');
            
            $.fancybox.image.css({ cursor: obj.zoom > 0 ? 'move' : 'auto' });
        },
        
        zoomOut: function(){
            var obj = $.fancybox.helpers.zoom;
            
            if(obj.zoom == 0) return;
            obj.zoom--;
            
            var p = $.fancybox.image.position();
            var newpos = {
                left:($(window).width()/2-obj.offset.left + (obj.zoom+1)*p.left)/(obj.zoom+2),
                top:($(window).height()/2-obj.offset.top + (obj.zoom+1)*p.top)/(obj.zoom+2)
            };
            var limit = {
                left: $.fancybox.inner.width() - $.fancybox.image.width()*(obj.zoom+1)/(obj.zoom+2),
                top: $.fancybox.inner.height() - $.fancybox.image.height()*(obj.zoom+1)/(obj.zoom+2)
            };
            
            if(newpos.left > 0) newpos.left = 0;
            if(newpos.top > 0) newpos.top = 0;
            if(newpos.top < limit.top) newpos.top = limit.top;
            if(newpos.left < limit.left) newpos.left = limit.left;
            
            $.fancybox.image.animate({
                height: (obj.zoom+1)*100+'%',
                width: (obj.zoom+1)*100+'%',
                left:newpos.left+'px',
                top:newpos.top+'px'
            });
            if(obj.zoom == 0) obj.buttons.zoomout.addClass('disabled');
            obj.buttons.zoomin.removeClass('disabled');
            
            $.fancybox.image.css({cursor: obj.zoom > 0 ? 'move' : 'auto'});
        },
        
        onDrag: function(event, ui) { 
            var limit = {
                top:  $(ui.helper).parent().height() - $(ui.helper).height(),
                left: $(ui.helper).parent().width() - $(ui.helper).width()
            }
            // avoid to push the image outside its limits
            if(ui.position.top > 0 || ui.position.left > 0 || ui.position.top < limit.top || ui.position.left < limit.left)
                return false;
        }
	};

}(jQuery));
