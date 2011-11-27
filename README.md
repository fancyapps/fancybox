fancyBox
========

fancyBox is a tool that offers a nice and elegant way to add zooming functionality for images, html content and multi-media on your webpages.
More information at www.fancyapps.com/fancybox/

Examples at http://fancyapps.com/fancybox/
License: www.fancyapps.com/fancybox/#license

Copyright 2011 Janis Skarnelis - janis@fancyapps.com


How to use
----------

To get started, download the plugin, unzip it and copy files to your website/application directory. 
Load the the files in the <head> section of your HTML document, make sure you also add the jQuery library.

    <head>
        <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7/jquery.min.js"></script>
        <link rel="stylesheet" href="/fancybox/jquery.fancybox.css" type="text/css" media="screen" />
        <script type="text/javascript" src="/fancybox/jquery.fancybox.pack.js"></script>
    </head>

Create your links with a title if you want a title to be shown, and add a class:

    <a href="/large_image.jpg" class="fancybox" title="Sample title"><img src="/small_image.jpg" /></a>

If you have a set of related items that you would like to group, 
additionally include a group name in the `rel` attribute (or `data-fancybox-group` for HTML5)

    <a href="/large_image_1.jpg" class="fancybox" data-fancybox-group="gallery" title="Sample title 1"><img src="/small_image_1.jpg" /></a>
    <a href="/large_image_2.jpg" class="fancybox" data-fancybox-group="gallery" title="Sample title 1"><img src="/small_image_2.jpg" /></a>

Initialise the script like this:

    <script>
        $(document).ready(function() {
            $('.fancybox').fancybox();
        });
    </script>

Script uses the `href` attribute of the matched elements to obtain the location of the content and to figure out content type you want to display. You can specify type directly by adding classname (fancybox.image, fancybox.iframe, etc).

    Ajax (note, requests are subject to the [same origin policy](http://en.wikipedia.org/wiki/Same_origin_policy)):
    <a href="/example.html" class="fancybox fancybox.ajax">Example</a>

    Iframe:
    <a href="example.html" class="fancybox fancybox.iframe">Example</a>

    Inline:
    <a href="#example" class="fancybox">Example</a>

    SWF:
    <a href="example.swf" class="fancybox">Example</a>

    Image:
    <a href="example.jpg" class="fancybox">Example</a>

Advanced
--------
It`s possible to open fancyBox programmatically in various ways:

    HTML content:
    $.fancybox( '<div><h1>Lorem Lipsum</h1><p>Lorem lipsum</p></div>', {
        title : 'Custom Title'
    });

    DOM element:
    $.fancybox( $("#inline"), {
        title : 'Custom Title'
    });

    Custom object:
    $.fancybox({
        href: 'example.jpg',
        title : 'Custom Title'
    });

    Array of objects:
    $.fancybox([
        {
            href: 'example1.jpg',
            title : 'Custom Title 1'
        },
        {
            href: 'example2.jpg',
            title : 'Custom Title 2'
        }
    ], {
        padding: 0    
    });


Bug tracker
-----------

Have a bug? Please create an issue on GitHub at https://github.com/fancyapps/fancyBox/issues