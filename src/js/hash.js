// ==========================================================================
//
// Hash
// Enables linking to each modal
//
// ==========================================================================
;(function (document, window, $) {
	'use strict';

    var currentHash = null;

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

    $(window).on('hashchange.fb', function() {
        var url = parseUrl();

		if ( currentHash && currentHash !== url.gallery + '-' + url.index )  {
			currentHash = null;

			$.fancybox.close();
		}

    });

    // Check hash when DOM becomes ready
    $(function() {
        var url = parseUrl();

        // Open new instance
        if ( url.gallery !== '' ) {
            $( "[data-fancybox='" + url.gallery + "']" ).eq( url.index ).trigger( 'click' );
        }

    });

    $(document).on({
        'beforeMove.fb' : function( e, instance, current ) {
            var gallery = current.opts.$orig ? current.opts.$orig.data( 'fancybox' ) : "";

            currentHash = gallery + '-' + ( current.index + 1 );

            // Update window hash
            if ( gallery !== "" ) {
				if ( "pushState" in history ) {
                    history.pushState( "", document.title, window.location.pathname + window.location.search + '#' +  currentHash );

				} else {
					window.location.hash = currentHash;
				}
            }

        }, 'beforeClose.fb' : function( e, instance, current ) {

            // Remove hash from location bar
            if ( current.opts.$orig && current.opts.$orig.data( 'fancybox' ) !== "" ) {
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
