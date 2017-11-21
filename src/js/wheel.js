;(function (document, $) {
	'use strict';

	var prevTime = new Date().getTime();

    $(document).on({
        'onInit.fb' : function( e, instance, current ) {
			instance.$refs.stage.on('mousewheel DOMMouseScroll wheel MozMousePixelScroll', function(e) {
				var current = instance.current,
					currTime,
					value,
					delta,
					isHorizontal,
					isVertical;

				if ( current.opts.wheel === false || ( current.opts.wheel === 'auto' && current.type !== 'image' ) ) {
					return;
				}

				if ( current.$slide.hasClass( 'fancybox-animated' ) ) {
				    return;
				}

				if ( instance.group.length < 1 ) {
					return;
				}

				e.preventDefault();
				e.stopPropagation();

				e = e.originalEvent || e;

				if ( currTime - prevTime < 250 ) {
					return;
				}

				prevTime = currTime;

				value = e.wheelDelta || -e.deltaY || -e.detail;
				delta = Math.max(-1, Math.min(1, value));

				isHorizontal = typeof e.wheelDeltaX !== 'undefined' || typeof e.deltaX !== 'undefined';
				isVertical   = !isHorizontal || ( (Math.abs(e.wheelDeltaX) < Math.abs(e.wheelDelta)) || (Math.abs(e.deltaX) < Math.abs(e.deltaY)) );

				if ( delta < 0 ) {
					instance[ isVertical ? 'previous' : 'next' ]();

				} else {
					instance[ isVertical ? 'next' : 'previous' ]();
				}

			});
		}
    });

}( document, window.jQuery || jQuery ));
