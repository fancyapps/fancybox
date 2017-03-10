// ==========================================================================
//
// Hash
// Enables linking to each modal
//
// ==========================================================================
;(function (document, window, $) {
	'use strict';

    var currentHash = null;

	// Get info about gallery name and current index from url
    function parseUrl() {
        var hash    = window.location.hash.substr( 1 );
        var rez     = hash.split( '-' );
        var index   = parseInt( rez.pop( -1 ), 10 ) - 1;
        var gallery = rez.join( '-' );

        return {
            hash    : hash,
            index   : index,
            gallery : gallery
        };
    }

	// Trigger click evnt on links to open new fancyBox instance
	function triggerFromUrl( url ) {
		var $el;

        if ( url.gallery !== '' ) {

			// If we can find element matching 'data-fancybox' atribute, then trigger click event for that ..
			$el = $( "[data-fancybox='" + url.gallery + "']" ).eq( url.index );

            if ( $el.length ) {
				$el.trigger( 'click' );

			} else {

				// .. if not, try finding element by ID
				$( "#" + url.gallery + "" ).trigger( 'click' );

			}

        }
	}

	// Check if need to close after url has changed
    $(window).on('hashchange.fb', function() {
        var url = parseUrl();

		if ( $.fancybox.getInstance() ) {

			if ( currentHash && currentHash !== url.gallery + '-' + url.index )  {
				currentHash = null;

				$.fancybox.close();
			}

		} else if ( url.gallery !== '' ) {
            triggerFromUrl( url );
        }

    });

    // Check hash when DOM becomes ready
    $(function() {
		// Small delay is used to allow other scripts to process "dom ready" event
		setTimeout(function() {

			triggerFromUrl( parseUrl() );

		}, 50);
    });

    $(document).on({
        'beforeMove.fb' : function( e, instance, current ) {

            var gallery = current.opts.$orig ? current.opts.$orig.data( 'fancybox' ) : ( current.opts.hash || '');

            currentHash = gallery + '-' + ( current.index + 1 );

            // Update window hash
            if ( gallery !== '' ) {

				if ( "pushState" in history ) {
                    history.pushState( "", document.title, window.location.pathname + window.location.search + '#' +  currentHash );

				} else {
					window.location.hash = currentHash;
				}

            }

        }, 'beforeClose.fb' : function( e, instance, current ) {
			var gallery = current.opts.$orig ? current.opts.$orig.data( 'fancybox' ) : ( current.opts.hash || '');

            // Remove hash from location bar
            if ( gallery !== '' ) {
                if ( "pushState" in history ) {
                    history.pushState( "", document.title, window.location.pathname + window.location.search );

                } else {
                    window.location.hash = "";
                }
            }

			currentHash = null;

        }
    });

}(document, window, window.jQuery));
