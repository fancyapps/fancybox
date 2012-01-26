/*!
 * fancyBox - jQuery Plugin
 * version: 2.0.4 (26/01/2012)
 * @requires jQuery v1.6 or later
 *
 * Examples at http://fancyapps.com/fancybox/
 * License: www.fancyapps.com/fancybox/#license
 *
 * Copyright 2011 Janis Skarnelis - janis@fancyapps.com
 *
 */
(function(d,f,c){var b=c(d),a=c(f),h=c.fancybox=function(){h.open.apply(this,arguments)},i=false,e=null,g=null;c.extend(h,{version:"2.0.4",defaults:{padding:15,margin:20,width:800,height:600,minWidth:200,minHeight:200,maxWidth:9999,maxHeight:9999,autoSize:true,fitToView:true,aspectRatio:false,topRatio:0.5,autoSizeCheck:true,autoSizeInterval:500,fixed:!(c.browser.msie&&c.browser.version<=6)&&typeof f.createTouch=="undefined",scrolling:"auto",wrapCSS:"fancybox-default",arrows:true,closeBtn:true,closeClick:false,nextClick:false,mouseWheel:true,autoPlay:false,playSpeed:3000,modal:false,loop:true,ajax:{},keys:{next:[13,32,34,39,40],prev:[8,33,37,38],close:[27]},index:0,type:null,href:null,content:null,title:null,tpl:{wrap:'<div class="fancybox-wrap"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div>',image:'<img class="fancybox-image" src="{href}" alt="" />',iframe:'<iframe class="fancybox-iframe" name="fancybox-frame{rnd}" frameborder="0" hspace="0" '+(c.browser.msie?'allowtransparency="true""':"")+' scrolling="{scrolling}" src="{href}"></iframe>',swf:'<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="wmode" value="transparent" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{href}" /><embed src="{href}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="100%" height="100%" wmode="transparent"></embed></object>',error:'<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',closeBtn:'<div title="Close" class="fancybox-item fancybox-close"></div>',next:'<a title="Next" class="fancybox-item fancybox-next"><span></span></a>',prev:'<a title="Previous" class="fancybox-item fancybox-prev"><span></span></a>'},openEffect:"fade",openSpeed:250,openEasing:"swing",openOpacity:true,openMethod:"zoomIn",closeEffect:"fade",closeSpeed:250,closeEasing:"swing",closeOpacity:true,closeMethod:"zoomOut",nextEffect:"elastic",nextSpeed:300,nextEasing:"swing",nextMethod:"changeIn",prevEffect:"elastic",prevSpeed:300,prevEasing:"swing",prevMethod:"changeOut",helpers:{overlay:{speedIn:0,speedOut:300,opacity:0.8,css:{cursor:"pointer"},closeClick:true},title:{type:"float"}},onCancel:c.noop,beforeLoad:c.noop,afterLoad:c.noop,beforeShow:c.noop,afterShow:c.noop,beforeClose:c.noop,afterClose:c.noop},group:{},opts:{},coming:null,current:null,isOpen:false,isOpened:false,wrap:null,outer:null,inner:null,player:{timer:null,isActive:false},ajaxLoad:null,imgPreload:null,transitions:{},helpers:{},open:function(k,j){if(!c.isArray(k)){k=k.jquery?c(k).get():[k]
}if(!k.length){return}h.close(true);h.isActive=true;h.opts=c.extend(true,{},h.defaults,j);h.group=k;h._start(h.opts.index||0)},cancel:function(){if(h.coming&&false===h.trigger("onCancel")){return}h.coming=null;h.hideLoading();if(h.ajaxLoad){h.ajaxLoad.abort()}h.ajaxLoad=null;if(h.imgPreload){h.imgPreload.onload=h.imgPreload.onabort=h.imgPreload.onerror=null}},close:function(j){h.cancel();if(!h.current||false===h.trigger("beforeClose")){return}h.unbindEvents();if(!h.isOpen||(j&&j[0]===true)){c(".fancybox-wrap").stop().trigger("onReset").remove();
h._afterZoomOut()}else{h.isOpen=h.isOpened=false;c(".fancybox-item").remove();h.wrap.stop(true).removeClass("fancybox-opened");h.inner.css("overflow","hidden");h.transitions[h.current.closeMethod]()}},play:function(k){var j=function(){clearTimeout(h.player.timer)},n=function(){j();if(h.current&&h.player.isActive){h.player.timer=setTimeout(h.next,h.current.playSpeed)}},l=function(){j();c("body").unbind(".player");h.player.isActive=false;h.trigger("onPlayEnd")},m=function(){if(h.current&&(h.current.loop||h.current.index<h.group.length-1)){h.player.isActive=true;
c("body").bind({"afterShow.player onUpdate.player":n,"onCancel.player beforeClose.player":l,"beforeLoad.player":j});n();h.trigger("onPlayStart")}};if(h.player.isActive||(k&&k[0]===false)){l()}else{m()}},next:function(){if(h.current){h.jumpto(h.current.index+1)}},prev:function(){if(h.current){h.jumpto(h.current.index-1)}},jumpto:function(j){if(!h.current){return}j=parseInt(j,10);if(h.group.length>1&&h.current.loop){if(j>=h.group.length){j=0}else{if(j<0){j=h.group.length-1}}}if(typeof h.group[j]!=="undefined"){h.cancel();
h._start(j)}},reposition:function(j){if(h.isOpen){h.wrap.css(h._getPosition(j))}},update:function(){if(h.isOpen){if(!i){e=setTimeout(function(){if(i){i=false;if(h.current){if(h.current.autoSize){if(h.current.type=="iframe"){var j=h.inner.find("iframe").contents().find("html").height();if(j>0){h.inner.height(j+10);h.current.height=h.inner.height()}}else{h.inner.height("auto");h.current.height=h.inner.height()}}h._setDimension();if(h.current.canGrow&&(h.current.autoSize&&h.current.type!="iframe"||!h.current.autoSize)){h.inner.height("auto")
}h.reposition();h.trigger("onUpdate")}}},100)}i=true}},toggle:function(){if(h.isOpen){h.current.fitToView=!h.current.fitToView;h.update()}},hideLoading:function(){c("#fancybox-loading").remove()},showLoading:function(){h.hideLoading();c('<div id="fancybox-loading"><div></div></div>').click(h.cancel).appendTo("body")},getViewport:function(){return{x:b.scrollLeft(),y:b.scrollTop(),w:b.width(),h:b.height()}},unbindEvents:function(){if(h.wrap){h.wrap.unbind(".fb")}a.unbind(".fb");b.unbind(".fb")},bindEvents:function(){var l=h.current,j=l.keys;
if(!l){return}b.bind("resize.fb, orientationchange.fb",h.update);if(l.type=="iframe"){h.inner.find("iframe").load(h.update);if(l.autoSizeCheck){if(h.inner.find("iframe").length===0){clearInterval(g)}else{var k=h.inner.find("iframe").contents().find("body").height();g=setInterval(function(){var m=h.inner.find("iframe").contents().find("body").height();if(m!=k){k=m;h.update()}},l.autoSizeInterval)}}}if(j){a.bind("keydown.fb",function(n){var m;if(!n.ctrlKey&&!n.altKey&&!n.shiftKey&&!n.metaKey&&c.inArray(n.target.tagName.toLowerCase(),["input","textarea","select","button"])<0){m=n.keyCode;
if(c.inArray(m,j.close)>-1){h.close();n.preventDefault()}else{if(c.inArray(m,j.next)>-1){h.next();n.preventDefault()}else{if(c.inArray(m,j.prev)>-1){h.prev();n.preventDefault()}}}}})}if(c.fn.mousewheel&&l.mouseWheel&&h.group.length>1){h.wrap.bind("mousewheel.fb",function(n,o){var m=c(n.target).get(0);if(m.clientHeight===0||(m.scrollHeight===m.clientHeight&&m.scrollWidth===m.clientWidth)){n.preventDefault();h[o>0?"prev":"next"]()}})}},trigger:function(k){var j,l=h[c.inArray(k,["onCancel","beforeLoad","afterLoad"])>-1?"coming":"current"];
if(!l){return}if(c.isFunction(l[k])){j=l[k].apply(l,Array.prototype.slice.call(arguments,1))}if(j===false){return false}if(l.helpers){c.each(l.helpers,function(n,m){if(m&&typeof h.helpers[n]!=="undefined"&&c.isFunction(h.helpers[n][k])){h.helpers[n][k](m,l)}})}c.event.trigger(k+".fb")},isImage:function(j){return j&&j.match(/\.(jpg|gif|png|bmp|jpeg)(.*)?$/i)},isSWF:function(j){return j&&j.match(/\.(swf)(.*)?$/i)},_start:function(k){var n={},m=h.group[k]||null,l,j,o,p;if(m&&typeof m==="object"&&(m.nodeType||m instanceof c)){l=true;
if(c.metadata){n=c(m).metadata()}}n=c.extend(true,{},h.opts,{index:k,element:m},(c.isPlainObject(m)?m:n));c.each(["href","title","content","type"],function(r,q){n[q]=h.opts[q]||(l&&c(m).attr(q))||n[q]||null});if(typeof n.margin==="number"){n.margin=[n.margin,n.margin,n.margin,n.margin]}if(n.modal){c.extend(true,n,{closeBtn:false,closeClick:false,nextClick:false,arrows:false,mouseWheel:false,keys:null,helpers:{overlay:{css:{cursor:"auto"},closeClick:false}}})}h.coming=n;if(false===h.trigger("beforeLoad")){h.coming=null;
return}o=n.type;j=n.href;if(!o){if(l){p=c(m).data("fancybox-type");if(!p&&m.className){p=m.className.match(/fancybox\.(\w+)/);o=p?p[1]:null}}if(!o&&j){if(h.isImage(j)){o="image"}else{if(h.isSWF(j)){o="swf"}else{if(j.match(/^#/)){o="inline"}}}}if(!o){o=l?"inline":"html"}n.type=o}if(o==="inline"||o==="html"){n.content=n.content||(o==="inline"&&j?c(j):c(m));if(!n.content.length){o=null}}else{n.href=j||m;if(!n.href){o=null}}n.group=h.group;n.isDom=l;if(o==="image"){h._loadImage()}else{if(o==="ajax"){h._loadAjax()
}else{if(o){h._afterLoad()}else{h._error("type")}}}},_error:function(j){h.hideLoading();c.extend(h.coming,{type:"html",autoSize:true,minHeight:0,hasError:j,content:h.coming.tpl.error});h._afterLoad()},_loadImage:function(){h.imgPreload=new Image();h.imgPreload.onload=function(){this.onload=this.onerror=null;h.coming.width=this.width;h.coming.height=this.height;h._afterLoad()};h.imgPreload.onerror=function(){this.onload=this.onerror=null;h._error("image")};h.imgPreload.src=h.coming.href;if(!h.imgPreload.width){h.showLoading()
}},_loadAjax:function(){h.showLoading();h.ajaxLoad=c.ajax(c.extend({},h.coming.ajax,{url:h.coming.href,error:function(j,k){if(k!=="abort"){h._error("ajax",j)}else{h.hideLoading()}},success:function(j,k){if(k==="success"){h.coming.content=j;h._afterLoad()}}}))},_preload:function(){var k=h.group,j=h.current.index;if(k.length>1){new Image().src=c(k[j+1]||k[0]).attr("href");new Image().src=c(k[j-1]||k[k.length-1]).attr("href")}},_afterLoad:function(){h.hideLoading();if(!h.coming||false===h.trigger("afterLoad",h.current)){h.coming=false;
return}if(h.isOpened){c(".fancybox-item").remove();h.wrap.stop(true).removeClass("fancybox-opened");h.inner.css("overflow","hidden");h.transitions[h.current.prevMethod]()}else{c(".fancybox-wrap").stop().trigger("onReset").remove();h.trigger("afterClose")}h.unbindEvents();h.isOpen=false;h.current=h.coming;h.coming=false;h.wrap=c(h.current.tpl.wrap).addClass("fancybox-tmp "+h.current.wrapCSS).appendTo("body");h.outer=c(".fancybox-outer",h.wrap).css("padding",h.current.padding+"px");h.inner=c(".fancybox-inner",h.wrap);
h._setContent()},_setContent:function(){var l,m,k,n=h.current,j=n.type;switch(j){case"inline":case"ajax":case"html":l=n.content;if(j==="inline"&&l instanceof c){l=l.show().detach();if(l.parent().hasClass("fancybox-inner")){l.parents(".fancybox-wrap").trigger("onReset").remove()}c(h.wrap).bind("onReset",function(){l.appendTo("body").hide()})}if(n.autoSize){m=c('<div class="fancybox-tmp"></div>').appendTo("body").append(l);n.width=m.width();n.height=m.height();m.width(h.current.width);if(m.height()>n.height){m.width(n.width+1);
n.width=m.width();n.height=m.height()}l=m.contents().detach();m.remove()}break;case"image":l=n.tpl.image.replace("{href}",n.href);n.aspectRatio=true;break;case"swf":l=n.tpl.swf.replace(/\{width\}/g,n.width).replace(/\{height\}/g,n.height).replace(/\{href\}/g,n.href);break;case"iframe":l=n.tpl.iframe.replace("{href}",n.href).replace("{scrolling}",n.scrolling).replace("{rnd}",new Date().getTime());break}if(c.inArray(j,["image","swf","iframe"])>-1){if(j!="iframe"){n.autoSize=false}n.scrolling=false}h.inner.append(l);
h._beforeShow()},_beforeShow:function(){h.trigger("beforeShow");h._setDimension();h.wrap.hide().removeClass("fancybox-tmp");h.bindEvents();h._preload();h.transitions[h.isOpened?h.current.nextMethod:h.current.openMethod]()},_setDimension:function(){var m=h.wrap,x=h.outer,y=h.inner,q=h.current,r=h.getViewport(),o=q.margin,k=q.padding*2,n=q.width,w=q.height,u=q.maxWidth,t=q.maxHeight,l=q.minWidth,v=q.minHeight,s,p,j;r.w-=(o[1]+o[3]);r.h-=(o[0]+o[2]);if(n.toString().indexOf("%")>-1){n=(((r.w-k)*parseFloat(n))/100)
}if(w.toString().indexOf("%")>-1){w=(((r.h-k)*parseFloat(w))/100)}s=n/w;n+=k;w+=k;if(q.fitToView){u=Math.min(r.w,u);t=Math.min(r.h,t)}l=Math.min(n,l);v=Math.min(w,v);u=Math.max(l,u);t=Math.max(v,t);if(q.aspectRatio){if(n>u){n=u;w=((n-k)/s)+k}if(w>t){w=t;n=((w-k)*s)+k}if(n<l){n=l;w=((n-k)/s)+k}if(w<v){w=v;n=((w-k)*s)+k}}else{n=Math.max(l,Math.min(n,u));w=Math.max(v,Math.min(w,t))}n=Math.round(n);w=Math.round(w);c(m.add(x).add(y)).width("auto").height("auto");y.width(n-k).height(w-k);m.width(n);p=m.height();
if(n>u||p>t){while((n>u||p>t)&&n>l&&p>v){w=w-10;if(q.aspectRatio){n=Math.round(((w-k)*s)+k);if(n<l){n=l;w=((n-k)/s)+k}}else{n=n-10}y.width(n-k).height(w-k);m.width(n);p=m.height()}}q.dim={width:n,height:p};q.canGrow=q.autoSize&&w>v&&w<t;q.canShrink=false;q.canExpand=false;if((n-k)<q.width||(w-k)<q.height){q.canExpand=true}else{if((n>r.w||p>r.h)&&n>l&&w>v){q.canShrink=true}}j=p-k;h.innerSpace=j-y.height();h.outerSpace=j-x.height()},_getPosition:function(l){var p=h.current,k=h.getViewport(),n=p.margin,m=h.wrap.width()+n[1]+n[3],j=h.wrap.height()+n[0]+n[2],o={position:"absolute",top:n[0]+k.y,left:n[3]+k.x};
if(p.fixed&&(!l||l[0]===false)&&j<=k.h&&m<=k.w){o={position:"fixed",top:n[0],left:n[3]}}o.top=Math.ceil(Math.max(o.top,o.top+((k.h-j)*p.topRatio)))+"px";o.left=Math.ceil(Math.max(o.left,o.left+((k.w-m)*0.5)))+"px";return o},_afterZoomIn:function(){var k=h.current,j=k.scrolling;h.isOpen=h.isOpened=true;h.wrap.addClass("fancybox-opened").css("overflow","visible");h.update();h.inner.css("overflow",j==="yes"?"scroll":(j==="no"?"hidden":j));if(k.closeClick||k.nextClick){h.inner.css("cursor","pointer").bind("click.fb",k.nextClick?h.next:h.close)
}if(k.closeBtn){c(k.tpl.closeBtn).appendTo(h.wrap).bind("click.fb",h.close)}if(k.arrows&&h.group.length>1){if(k.loop||k.index>0){c(k.tpl.prev).appendTo(h.wrap).bind("click.fb",h.prev)}if(k.loop||k.index<h.group.length-1){c(k.tpl.next).appendTo(h.wrap).bind("click.fb",h.next)}}h.trigger("afterShow");if(h.opts.autoPlay&&!h.player.isActive){h.opts.autoPlay=false;h.play()}},_afterZoomOut:function(){h.trigger("afterClose");h.wrap.trigger("onReset").remove();c.extend(h,{group:{},opts:{},current:null,isActive:false,isOpened:false,isOpen:false,wrap:null,outer:null,inner:null})
}});h.transitions={getOrigPosition:function(){var o=h.current,l=o.element,n=o.padding,q=c(o.orig),p={},m=50,k=50,j;if(!q.length&&o.isDom&&c(l).is(":visible")){q=c(l).find("img:first");if(!q.length){q=c(l)}}if(q.length){p=q.offset();if(q.is("img")){m=q.outerWidth();k=q.outerHeight()}}else{j=h.getViewport();p.top=j.y+(j.h-k)*0.5;p.left=j.x+(j.w-m)*0.5}p={top:Math.ceil(p.top-n)+"px",left:Math.ceil(p.left-n)+"px",width:Math.ceil(m+n*2)+"px",height:Math.ceil(k+n*2)+"px"};return p},step:function(k,m){var l,j,n;
if(m.prop==="width"||m.prop==="height"){j=n=Math.ceil(k-(h.current.padding*2));if(m.prop==="height"){l=(k-m.start)/(m.end-m.start);if(m.start>m.end){l=1-l}j-=h.innerSpace*l;n-=h.outerSpace*l}h.inner[m.prop](j);h.outer[m.prop](n)}},zoomIn:function(){var l=h.wrap,n=h.current,k,j,m=n.dim;if(n.openEffect==="elastic"){j=c.extend({},m,h._getPosition(true));delete j.position;k=this.getOrigPosition();if(n.openOpacity){k.opacity=0;j.opacity=1}h.outer.add(h.inner).width("auto").height("auto");l.css(k).show().animate(j,{duration:n.openSpeed,easing:n.openEasing,step:this.step,complete:h._afterZoomIn})
}else{l.css(c.extend({},m,h._getPosition()));if(n.openEffect==="fade"){l.fadeIn(n.openSpeed,h._afterZoomIn)}else{l.show();h._afterZoomIn()}}},zoomOut:function(){var k=h.wrap,l=h.current,j;if(l.closeEffect==="elastic"){if(k.css("position")==="fixed"){k.css(h._getPosition(true))}j=this.getOrigPosition();if(l.closeOpacity){j.opacity=0}k.animate(j,{duration:l.closeSpeed,easing:l.closeEasing,step:this.step,complete:h._afterZoomOut})}else{k.fadeOut(l.closeEffect==="fade"?l.closeSpeed:0,h._afterZoomOut)
}},changeIn:function(){var k=h.wrap,l=h.current,j;if(l.nextEffect==="elastic"){j=h._getPosition(true);j.opacity=0;j.top=(parseInt(j.top,10)-200)+"px";k.css(j).show().animate({opacity:1,top:"+=200px"},{duration:l.nextSpeed,complete:h._afterZoomIn})}else{k.css(h._getPosition());if(l.nextEffect==="fade"){k.hide().fadeIn(l.nextSpeed,h._afterZoomIn)}else{k.show();h._afterZoomIn()}}},changeOut:function(){var j=h.wrap,l=h.current,k=function(){c(this).trigger("onReset").remove()};j.removeClass("fancybox-opened");
if(l.prevEffect==="elastic"){j.animate({opacity:0,top:"+=200px"},{duration:l.prevSpeed,complete:k})}else{j.fadeOut(l.prevEffect==="fade"?l.prevSpeed:0,k)}}};h.helpers.overlay={overlay:null,update:function(){var l,j,k;this.overlay.width(0).height(0);if(c.browser.msie){j=Math.max(f.documentElement.scrollWidth,f.body.scrollWidth);k=Math.max(f.documentElement.offsetWidth,f.body.offsetWidth);l=j<k?b.width():j}else{l=a.width()}this.overlay.width(l).height(a.height())},beforeShow:function(j){if(this.overlay){return
}j=c.extend(true,{speedIn:"fast",closeClick:true,opacity:1,css:{background:"black"}},j);this.overlay=c('<div id="fancybox-overlay"></div>').css(j.css).appendTo("body");this.update();if(j.closeClick){this.overlay.bind("click.fb",h.close)}b.bind("resize.fb",c.proxy(this.update,this));this.overlay.fadeTo(j.speedIn,j.opacity)},onUpdate:function(){this.update()},afterClose:function(j){if(this.overlay){this.overlay.fadeOut(j.speedOut||"fast",function(){c(this).remove()})}this.overlay=null}};h.helpers.title={beforeShow:function(j){var l,k=h.current.title;
if(k){l=c('<div class="fancybox-title fancybox-title-'+j.type+'-wrap">'+k+"</div>").appendTo("body");if(j.type==="float"){l.width(l.width());l.wrapInner('<span class="child"></span>');h.current.margin[2]+=Math.abs(parseInt(l.css("margin-bottom"),10))}l.appendTo(j.type==="over"?h.inner:(j.type==="outside"?h.wrap:h.outer))}}};c.fn.fancybox=function(l){var m=c(this),j=this.selector||"",k,n=function(q){var p=this,o="rel",r=p[o];if(!(q.ctrlKey||q.altKey||q.shiftKey||q.metaKey)){q.preventDefault();if(!r){o="data-fancybox-group";
r=c(this).data("fancybox-group")}if(r&&r!==""&&r!=="nofollow"){p=j.length?c(j):m;p=p.filter("["+o+'="'+r+'"]');if(!k){l.index=p.index(this)}}h.open(p,l)}};l=l||{};k=l.index||false;if(j){a.undelegate(j,"click.fb-start").delegate(j,"click.fb-start",n)}else{m.unbind("click.fb-start").bind("click.fb-start",n)}return this}}(window,document,jQuery));