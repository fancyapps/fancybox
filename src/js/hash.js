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
        var index   = rez.length > 1 ? parseInt( rez.pop( -1 ), 10 ) || 1 : 1;
        var gallery = rez.join( '-' );

		// Index is starting from 1
		if ( index < 1 ) {
			index = 1;
		}

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
			$el = $( "[data-fancybox='" + url.gallery + "']" ).eq( url.index - 1 );

            if ( $el.length ) {
				$el.trigger( 'click' );

			} else {

				// .. if not, try finding element by ID
				$( "#" + url.gallery + "" ).trigger( 'click' );

			}

        }
	}

	// Get gallery name from current instance
	function getGallery( instance ) {
		var opts = instance.current ? instance.current.opts : instance.opts;

		return opts.$orig ? opts.$orig.data( 'fancybox' ) : ( opts.hash || '' );
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
		'onInit.fb' : function( e, instance ) {
			var url     = parseUrl();
			var gallery = getGallery( instance );

			if ( gallery == url.gallery ) {
				instance.currIndex = url.index - 1;
			}

		},
        'beforeMove.fb' : function( e, instance, current ) {
            var gallery = getGallery( instance );

            // Update window hash
            if ( gallery !== '' ) {

				if ( window.location.hash.indexOf( gallery ) < 0 ) {
	                instance.opts.origHash = window.location.hash;
	            }

				currentHash = gallery + ( instance.group.length > 1 ? '-' + ( current.index + 1 ) : '' );

				if ( "pushState" in history ) {
                    history.pushState( '', document.title, window.location.pathname + window.location.search + '#' +  currentHash );

				} else {
					window.location.hash = currentHash;
				}

            }

        }, 'beforeClose.fb' : function( e, instance, current ) {
			var gallery  = getGallery( instance );
			var origHash = instance.opts.origHash ? instance.opts.origHash : '';

            // Remove hash from location bar
            if ( gallery !== '' ) {
                if ( "pushState" in history ) {
                    history.pushState( '', document.title, window.location.pathname + window.location.search + origHash );

                } else {
                    window.location.hash = origHash;
                }
            }

			currentHash = null;

        }
    });

}(document, window, window.jQuery));
