(function(){
var ajaxart = { xtmls_to_trace: [], trace_level: 2,           traces : [], components: [], componentsXtmlCache: [], usages: [], types: [], plugins: [], gcs: {},           log_str: '', loading_objects : 0, logs: {}, default_values: [], inPreviewMode: false, stack_trace: [], build_version: 'ART_NOW',           base_lib: '//jbartlib.appspot.com/lib', base_images: '//jbartlib.appspot.com/images',          classes: {}, xml: {}, cookies: {}, ui: {}, yesno: {}, dialog: { openPopups: []}, xmlsToMonitor: [], lookup_cache: {}, occurrence_cache: {},           unique_number: 1, action: {}, runningTimers: {}, runDelayed: [], hasVarsRegex: /\%[^ ,;\(\)]/ , STRING_WITH_EXP: /%[^ ,;\(\)]/, NOT_EXP: /^[ ,;\(\)]/, debugData: []};          window.jBartWidgets = window.jBartWidgets || { vars: {} };
aa_determine_device();
aa_xpath_jb_llamalab();
var jBart = { vars: {}, api: {}, utils: {}, dialogs: {}, bart: {}, db: {} }
var aa_noOfOpenDialogs= 0,aa_dialogCounter= 0,openDialogs = [], aa_openDialogs = [];
var aa_intest,aa_incapture;
var aa_navigation_codes = [38,40, 33,34,63277,63276];
var aa_xmlinfos = [], aa_async_finished_listeners = [];
window.jBartPreloader = function (finished) {
	if (window.jBartNodeJS) return;
	var script_parent = document.body;
	if (!script_parent) script_parent = document.head;
	var load_js = function(url) {
		  var fileref=document.createElement('script');
		  fileref.setAttribute("type","text/javascript");
		  fileref.setAttribute("src", url);
		  script_parent.appendChild(fileref);
	};
	if (!navigator.userAgent.toLowerCase().match(/android [12]/))
		finished();
	else {			
		window.jBartFinished = finished;
		load_js("http://llamalab.com/js/minified/Array.js","js");
	   jQuery.ajax({ url: "http://llamalab.com/js/minified/XPath.js", dataType: 'script',
		   success: function(){
			var scriptElem2 = document.createElement('script');
			scriptElem2.innerHTML = 'jBartFinished();';
			script_parent.appendChild(scriptElem2);
		 	}
	   });
	}
}
jbart_init();
aa_extendJQuery();
ajaxart.customsuggestbox = {};
ajaxart.suggestbox = {};
jBart.studiobar = jBart.studiobar || {}
bartdt_captured_element = null;
var aa_save_manager = { modified :{} };

function aa_visualContainerStyle(section,settings) {
	settings = aa_defaults(settings,{
		sectionBody: section.$el.firstOfClass('section_body')
	});
	var visualCntr = section.context.vars.VisualContainer[0];
	visualCntr.init($(settings.sectionBody)[0]);
	section.addSectionBody($(settings.sectionBody)[0]);	
}



function aa_text_as_item(showMoreObject) {
    showMoreObject.$el.html( showMoreObject.text );
    showMoreObject.$el.click(function() { 
        showMoreObject.showMore() 
    });
    // Table fix
    var parent = showMoreObject.itemlist.ParentOfItems;
    if (!parent) return;
    var isTable = parent.tagName.toLowerCase() == 'tbody';
    if (isTable) {
        var cols = showMoreObject.itemlist.VisibleFields.length;
        var wrapper = jQuery('<tr class="aa_noitems"><td colspan="' + cols + '" class="td_nocontent"/></tr>')[0];
        $(wrapper).find('>td').append( showMoreObject.$el );
        showMoreObject.$el.addClass("in_table");
        showMoreObject.control = showMoreObject.el = $(wrapper).find('>td')[0];
        showMoreObject.$el = $(showMoreObject.el);
    }
}



function aa_popup(popup,settings) {
	settings = aa_popupDefaultSettings(popup,settings || {});
	if (popup.intest) popup.$el.css('display','block');
	popup.frameElement = $(settings.frameElement)[0] || popup.el;
	$(popup.frameElement).addClass('aa_popup');

	if (settings.features) 
		popup.features = [].concat(popup.base_features,settings.features);
	else
		popup.features = popup.base_features;

	popup.contentsEl = $(settings.contentsElement)[0];

	for(var i=0;i<popup.features.length;i++) {
		try {
			popup.features[i].init(popup);
		} catch(e) {
			if (window.ajaxart) ajaxart.logException('error initialing popup feature',e);
		}
	}

	if (popup.PreventOpen && popup.PreventOpen()) return;

	// add it to body
	var popupsTop = $('body').children('.jbart_popups');
	if (!popupsTop.length)
		popupsTop = $('<div class="jbart_popups" />').appendTo( $('body') );

	// notify previous popups (some of them might close themselves)
	var openPopups = popupsTop.children();
	for(i=0;i<openPopups.length;i++) {
		var prevPopup = openPopups[i];
		if (prevPopup.jbPopup != popup)
			aa_trigger(prevPopup.jbPopup,'anotherPopupOpened',{ popup: popup });
	}

	popup.el.jbPopup = popup.frameElement.jbPopup = popup;

	$(settings.titleElement).text(popup.title);
	if (popup.contentsEl)
		popup.appendContents(popup.contentsEl);

	popup.close = function(closeType) {
		popup.preventClose = false;
		var closeArgs = { closeType: closeType};
		aa_trigger(popup,'beforeClose',closeArgs);		
		if (closeArgs.preventClose) return false; // allow beforeClose to prevent the closing of the popup
		
		aa_remove(this.el,!settings.reusablePopup);

		if (popup.launchingElement) {
			popup.launchingElement.jbPopup = null;
			$(popup.launchingElement).removeClass('aa_opened_popup');
		}
		aa_trigger(popup,'close',{ closeType: closeType });

		this.closeInnerPopups();
		return true;
	};
	popup.dispose = function() {		
		aa_remove(this.el,true);
	};

	popup.closeInnerPopups = function() {
		if (this.innerPopups) {
			for(var i=0;i<this.innerPopups.length;i++) {
				this.innerPopups[i].closedByParent = true;
				this.innerPopups[i].close();
				this.innerPopups[i].closedByParent = false;
			}
	  }
	};
	popup.isOpen = function() {
		return ajaxart.isattached(this.el);
	}

	var $close = $(settings.closeElement);
	$close.click(function() {
		popup.close(false);
	});

	doOpen();
	if (popup.reusablePopup) {
		aa_addOnDetach(popup.launchingElement,function() {
			popup.dispose();
		});
	}

	function doOpen() {
		popupsTop[0].appendChild(popup.el);

		if (settings.closeWhenClickingOutside) closeWhenClickingOutside();	
		aa_popup_setMaxZIndex(popup);

		positionPopup();
		markLaunchingElement();
		addValidationChecks();
		aa_element_attached(popup.el);
	}

	function addValidationChecks() {
		aa_bind(popup,'beforeClose',function(args) {
			if (args.closeType == 'OK') {
				var passed = aa_checkValidations(popup.frameElement);
				if (!passed) args.preventClose = true;
			}
		});
	}
	function markLaunchingElement() {
		if (popup.launchingElement) {
			popup.launchingElement.jbPopup = popup;
			$(popup.launchingElement).addClass('aa_opened_popup');
		}		
	}
	function positionPopup() {
		try {
			popup.location = popup.location || settings.defaultLocation || aa_popupCenterLocation();
			popup.location.setPopupLocation(popup);
			aa_trigger(popup,'show');
		} catch(e) {
			ajaxart.logException('error positioning popup',e);
		}	
	}

	function closeWhenClickingOutside() {
		popup.origMousedown = (window.captureEvents) ? window.onmousedown : document.onmousedown;
		var ignoreLaunchingElement = (settings.closeWhenClickingOutside == 'except launching element') && (popup.launchingElement);
		
		function isDescendant(child,parent) {
			if (!child) return false;
			if (child == parent) return true;
			return isDescendant(child.parentNode,parent);  
		}
		function captureClick(e) {
		    var $elem = $( (typeof(event)== 'undefined')? e.target : event.srcElement );

		    if ($elem.parents('html').length === 0 && $elem[0].tagName.toLowerCase() != 'html') return; // detached
		    if (isDescendant($elem[0],popup.el)) return;  // inside the popup
		    ignoreLaunchingElement = ignoreLaunchingElement || popup.ignoreCloseOnLaunchingElementClick;
		    if (ignoreLaunchingElement && isDescendant($elem[0],popup.launchingElement)) return; // from the launching element
		  
				if (popup.innerPopups) {
					for(var i=0;i<popup.innerPopups.length;i++) {
						if ( isDescendant($elem[0],popup.innerPopups[0].frameElement) )
							return;
					}
			  }

		    popup.close('cancel');
	    }		
		
		aa_bindBodyMouseDown(captureClick);
		
		aa_bind(popup,'close',function() {
			aa_unbindBodyMouseDown(captureClick);
		},'clicking outside');
	}
}



function aa_popup_feature_closeOnEsc(settings) {
	return aa_new_popup_feature(settings,'PopupFeatureCloseOnEsc',{
		init: function(popup) {
			$(popup.frameElement).attr('tabindex','0').keydown(function(e) {
				if(e.keyCode == 27) popup.close();
			});
		}
	});
}



function aa_popup_title_dragAndDrop() {
	return aa_new_popup_feature({},'PopupFeatureTitleDragNDrop',{
		init: function(popup) {
			var draggable_area = popup.$el.find('.aa_popup_title')[0];
			var draggable_frame = popup.frameElement;
			aa_enable_move_by_dragging(draggable_frame,draggable_area,this.onstartdrag,function() {
				aa_trigger(popup,'endDrag');
			});
		},
		onstartdrag: function() {},
		onenddrag: function() {}
	});
}



function aa_popup_feature_autoFocus() {
	return aa_new_popup_feature({},'PopupFeatureAutoFocus',{
		init: function(popup) {
			aa_bind(popup,'show',function() {
				setTimeout(function() {					
					var inp = $(popup.frameElement).find('input');
					if (!inp[0]) inp = $(popup.frameElement).find('textarea');
					if (inp[0]) inp[0].focus();
				},1);
			});
		}
	});
}



function aa_horizontalBoxLayout(layout,settings) {
	settings = aa_defaults(settings,{
		spacing: '0',
		fullWidth: false,
		verticalForMobileWidth: false
	});
	settings.spacing = settings.spacing.split('px')[0];

	var isIE_above10 = ajaxart.isIE && parseInt($.browser.version, 10) > 10;
	var css3 = $.browser.webkit || ajaxart.isFirefox || isIE_above10;

	if (css3 || (settings.verticalForMobileWidth && window.innerWidth < 600) ) {
		var cssForTop = '',cssForField = '';

		if ($.browser.webkit || ajaxart.isFirefox)
			cssForTop = '#this { display: -webkit-box; -webkit-box-orient: horizontal; } ';	// we replace webkit with moz in attach_global_css
		if (ajaxart.isIE)
			cssForTop = '#this { display: -ms-flexbox; -ms-box-orient: horizontal; } ';	

		if (settings.fullWidth) {
			cssForField = '#this { -webkit-box-flex: 1; -ms-flex:1; } ';
			cssForTop += '#this { width:100%;} ';
		}
		if (settings.spacing) {
			cssForField += "#this:not(:last-child) { margin-right: " + settings.spacing + "px; } ";
		}
		if (settings.verticalForMobileWidth) {
			cssForTop += '.width_mobile_phone #this { display: block;} ';
		}

		layout.$el.addClass(aa_attach_global_css(cssForTop));
		var cssClassForField = aa_attach_global_css(cssForField);
		layout.$el.firstOfClass('field')[0].jbRefresh = function() {
			$(this).addClass(cssClassForField);
		};
		layout.$el.firstOfClass('field')[0].jbRefresh();
	} else {
		// add table/tr/td
		var table = $('<table cellpadding="0" cellspacing="0" ><tr><td class="field" style="vertical-align:top" /></tr></table>');
		aa_empty(layout.el);
		layout.el.appendChild(table[0]);

		layout.$el.firstOfClass('field').addClass(aa_attach_global_css("#this:not(:last-child) { padding-right: " + settings.spacing + "px; } "));
		if (settings.fullWidth)
			table.addClass(aa_attach_global_css("#this { width:100%; }"));
	}

  aa_layout(layout,settings);	
}



function aa_layout(layout,settings) {
	settings = settings || {};
	settings.controlElement = settings.controlElement || layout.$el.find('.field');

	var controlEl = $(settings.controlElement)[0];

	if (layout.addFields && layout.Fields) {
     layout.addFields(controlEl,function(field) { 
        field.setControl(); // backward compatability
     });		
	} else {
		var count = layout.getControlsCount();
		for(var i=0;i<count;i++) {
			var j = settings.flipControlOrder ? count-1-i : i;
			var $wrapper = $(controlEl).clone();
			$wrapper[0].jbRefresh = $(controlEl)[0].jbRefresh;
			controlEl.parentNode.insertBefore($wrapper[0], controlEl);
			layout.getControl(j,$wrapper[0]);
		}
		$(controlEl).remove();
	}
}



function aa_itemlist(itemlist,settings) {
    settings = aa_defaults(settings,{
        templateElem: itemlist.$el.find('.aa_item')
    });
    itemlist.$el.addClass('aa_itemlist');
    itemlist.SetHtmlTemplate('<div><div class="aa_item"/></div>'); // default
    itemlist.ItemTemplate = $(settings.templateElem)[0];
    itemlist.ParentOfItems = itemlist.ItemTemplate.parentNode;
    $(itemlist.ItemTemplate).remove();
}



function aa_ImageWithNextPrevButtons(imagegallery,settings) {
  if (!imagegallery.images.length) imagegallery.$el.css('opacity', 0);

  $find(".visible").width(settings.width + "px");
  if (imagegallery.images.length == 0) return;
  var current = 0;
  var max_circles = 10;
  for (i = 0; i < imagegallery.images.length; i++) {
    var imageObject = imagegallery.images[i];

    var td = $('<td><div/></td>').appendTo($find('tr'));
    var div = td.find('div');
    if (imagegallery.images[i].originalHeight) {
      var width = settings.height * imageObject.originalWidth / imageObject.originalHeight;
      aa_setImage(div[0], {
        url: imageObject.url,
        height: settings.height,
        width: width,
        keepImageProportions: false
      });
      var marginLeft = Math.max(parseInt((settings.width - width) / 2),0);
      div.find('img').css('margin-left',marginLeft + 'px');
      $(div).width(settings.width).css('overflow','hidden');
    } else {
      aa_setImage(div[0], {
        url: imageObject.url,
        height: settings.height,
        width: settings.width,
        keepImageProportions: true,
        fillImage: true,
        centerImage: true
      });
    }
    if (i < max_circles) {
      var circle = jQuery("<div class='circle'></div>").appendTo($find('.circles'));
      circle.click(function() {
        current = $(this).index();
        show();
      });
    }
  }
  if (imagegallery.images.length < 2) $find('.circles').hide();
  $find('.button').css('top', settings.height / 2);
  show();

  function show() {
    $find('.images').css('margin-left', "-" + $find('.visible').width() * current + "px");
    $find('.prev').removeClass('disable').addClass(current == 0 ? 'disable' : '');
    $find('.next').removeClass('disable').addClass(current >= imagegallery.images.length - 1 ? 'disable' : '');
    $find('.circles').children().removeClass("current");
    $find('.circles').children(":nth-child(" + (current + 1) + ")").addClass("current");
  }
  $find('.next').click(function() {
    if (current < imagegallery.images.length - 1) {
      current++;
      show();
    }
  });
  $find('.prev').click(function() {
    if (current > 0) {
      current--;
      show();
    }
  });

  function $find(selector) {
    return imagegallery.$el.find(selector);
  }

}



function aa_setImage(elem,imageObject,settings)
{
	if (imageObject && imageObject.css3Image) return aa_image(imageObject,aa_defaults(settings,{ el: elem }));
	/* aa_setImage is used to add an image to the DOM. 
	   It is a general purpose functions and can be used by any type. 
	   For image sprites the imageObject should have the property inSprite as true and also the following properties: width, height, x, y
	*/
	elem = $(elem)[0]; /* to accept $ objects as well*/
	if (!elem) return;
	settings = settings || {};
	if (!settings.hasOwnProperty('removeIfNoImage')) settings.removeIfNoImage=true;

	if ((!imageObject || !imageObject.url) && settings.removeIfNoImage) {
		$(elem).remove();
		return;
	}
	if (!imageObject) return;
	var $img,$div;

	if (imageObject.url && imageObject.url.indexOf('_jbartImages_') > -1)
		imageObject.url = imageObject.url.replace(/_jbartImages_/g,aa_base_images());
	
	if (imageObject.inSprite) {
		$div = $('<div/>').appendTo(elem);
		$div.width(imageObject.width).height(imageObject.height);
		$div.css('display','inline-block');
		$div.css('background-image','url('+imageObject.url+')');
		$div.css('background-position','' + imageObject.x + ' ' + imageObject.y);
	} else if (imageObject.zoomAndOffet) {
		$div = $('<div/>').appendTo(elem);
		$div.width(imageObject.width || '100px').height(imageObject.height || '100px');
		$div.css('display','inline-block');
		$div.css('background-image','url('+imageObject.url+')');
		$div.css('background-position','' + imageObject.offsetX + ' ' + imageObject.offsetY);
		$div.css('background-repeat','no-repeat');
		$div.css('background-size',imageObject.zoom);
	} else if (imageObject.width && imageObject.height && imageObject.keepImageProportions) {
		keepImageProportions();
	} else {
		while (elem.firstChild) aa_remove(elem.firstChild,true);
		if (imageObject.boxWidth) $(elem).width(imageObject.boxWidth).css('overflow-x','hidden');
		if (imageObject.boxHeight) $(elem).height(imageObject.boxHeight).css('overflow-y','hidden');

		$img = $('<img/>').attr('src',imageObject.url).appendTo(elem);
		if (imageObject.marginLeft) $img.css('margin-left',imageObject.marginLeft+'px');
		if (imageObject.marginTop) $img.css('margin-top',imageObject.marginTop+'px');

		// removeAttr is needed for IE
		if (imageObject.width) $img.attr('width',imageObject.width); else $img.removeAttr('width');
		if (imageObject.height) $img.attr('height',imageObject.height); else $img.removeAttr('height');
	}

	if (imageObject.baseImageObject && imageObject.baseImageObject.onImageCreated) imageObject.baseImageObject.onImageCreated(elem,imageObject,settings);

	function keepImageProportions() {
		while (elem.firstChild) aa_remove(elem.firstChild,true);
		$div = $('<div/>').appendTo(elem).css('overflow','hidden').width(imageObject.width).height(imageObject.height);
		$img = $('<img/>').appendTo($div);
		if (imageObject.fillImage || imageObject.centerImage) {
			$img[0].onload = onLoadImage;
			$img.attr('src',imageObject.url);
			if ($img[0].width) {
			  onLoadImage(); // already loaded
			} else {
				$img.css('width',imageObject.width+'px');
			}
		} else {
			$img.css('max-width','100%').css('max-height','100%');
			$img.attr('src',imageObject.url);
		}
	}

	function onLoadImage() {
		$img.css('width','');
		var imageRatio = $img[0].width / $img[0].height;
		var desiredRatio = imageObject.width / imageObject.height;
		if (imageObject.fillImage) {
			if (imageRatio == desiredRatio) {
				$img.css('max-width','100%').css('max-height','100%;');
			} else if (imageRatio < desiredRatio) {
				$img.css('max-width','100%');
				if (imageObject.centerImage) {
					var actual_width = Math.min($img[0].width,imageObject.width);	// image does not expand beyond its size
					var virtual_height = actual_width / imageRatio;				// image height before cutting it
					var marginTop = (imageObject.height-virtual_height) * 0.5;

					// var marginTop = ((imageRatio-desiredRatio)*imageObject.height) * 0.5;
					$img.css('margin-top',marginTop+'px');
				}
			} else {
				$img.css('max-height','100%');
				if (imageObject.centerImage) {
					var actual_height = Math.min($img[0].height,imageObject.height); // image does not expand beyond its size
					var virtual_width = imageRatio * actual_height;					 // image width before cutting it
					var marginLeft = (imageObject.width-virtual_width) * 0.5;
					// var marginLeft = ((desiredRatio-imageRatio)*imageObject.width) * 0.5;
					$img.css('margin-left',marginLeft+'px');
				}
			}
		}
		else if (imageObject.centerImage) {
			$img.css('max-width','100%').css('max-height','100%');
			if (imageRatio < desiredRatio) {
				var actual_height = Math.min($img[0].height,imageObject.height); // image does not expand beyond its size
				var virtual_width = imageRatio * actual_height;					 // image width as shown
				$img.css('margin-left', imageObject.width/2 - virtual_width/2 + 'px');
			}
			else {
				var actual_width = Math.min($img[0].width,imageObject.width);	// image does not expand beyond its size
				var virtual_height = actual_width / imageRatio;				// image height as shown
				$img.css('margin-top', imageObject.height/2 - virtual_height/2 + 'px');

			}
		}
	}
}



function aa_button(button,settings) {
	settings = aa_defaults(settings,{
		buttonElement: button.el,
    textElement: button.$el.firstOfClass('hypelink_text')[0] || button.el,
    imageElement: button.$el.firstOfClass('hypelink_img')[0],
    keepImageElement: false
	});

	if (settings.onStartWaiting) aa_bind(button,'waiting',settings.onStartWaiting);
	if (settings.onEndWaiting) aa_bind(button,'endWaiting',settings.onEndWaiting);

	var jButton = $(settings.buttonElement);

	if (settings.allowHtmlInButtonText)
		$(settings.textElement).html(button.text);
	else 
  	$(settings.textElement).text(button.text);
  
  jButton.attr('title',button.tooltip);
  
  if ($(settings.imageElement)[0])
		aa_setImage($(settings.imageElement),button.image,{ removeIfNoImage: !settings.keepImageElement });

  if (jButton.disabled) jButton.addClass('disabled');

  jButton.click(function(e) { 
  	aa_buttonRunAction(button,e);
  });	

}



function aa_buttonRunAction(button,e) {
  	if (button.disabled) return;
  	var jButton = button.$el;
  	
  	aa_trigger(button,'beforeAction');
  	var result = button.action(e); 

  	if (result && result[0] && result[0].state && result[0].state() == 'pending' ) {
			jButton.addClass('disabled waiting');
			aa_trigger(button,'waiting',{});
			$.when(result[0]).then(function() {
				jButton.removeClass('disabled waiting');
				aa_trigger(button,'endWaiting',{});
				aa_trigger(button,'afterAction');
			},function() {
				jButton.removeClass('disabled waiting');
				aa_trigger(button,'endWaiting',{});
				aa_trigger(button,'afterAction');
			});
		} else {
				aa_trigger(button,'afterAction');			
		}
}



function aa_gcs(plugin, gcs) {
	if (!ajaxart.gcs[plugin])
		ajaxart.gcs[plugin] = gcs;
	else {
		var plugin = ajaxart.gcs[plugin];
		for (var gc in gcs)
		   	if (gcs.hasOwnProperty(gc))
				plugin[gc] = gcs[gc];
	}
}



function aa_bool(data,script,field,params,method,empty_value_is_true)
{
	var result = aa_text(data,script,field,params,method,true);

    if (result == "") return (empty_value_is_true) ? true : false;
    if (result == "false") return false;
    if (result == "true") return true;

    if (! isNaN(result)) return false;// in js : if(2) == true
	var boolean_result = false;
	text_to_eval = "if (" + result + ") boolean_result=true;";
	try { eval(text_to_eval); }
	catch(e) { ajaxart.log("Failed to evaluate boolean expression: " + result + "," +  e.message
			+ "\n script :" + aa_xtml_path(script,"id",true),"warning"); }
    return boolean_result;
}



function aa_isEmpty(data, checkInnerText) {
	if (data.length == 0) return ["true"];
	for (var i=0; i<data.length; i++)
		if (!isEmpty(data[i]))
			return [];
	return ["true"];
	
	function isEmpty(item) {
		if (typeof(item) == "string" && item == "") return true;
		if (ajaxart.isxml(item)) {
			if (item.nodeType == 3 || item.nodeType == 4) // inner text
			return item.nodeValue == "";
			if (item.nodeType == 2) // attribute
			return item.nodeValue == "";
			if (item.nodeType == 1 && checkInnerText) // element
			{
				if (item.attributes.length > 0) return false;
				var children = item.childNodes;
				if (children.length == 0) return true;
				if (children.length == 1 && (children[0].nodeType == 3 || children[0].nodeType == 4) && children[0].nodeValue == "") return ["true"];
			}
		}
	}
}



function aa_text(data,script,field,params,method,booleanExpression)
{
	if (booleanExpression) 
		return ajaxart.totext(ajaxart.run(data,script,field,params,method,booleanExpression));
	return ajaxart.totext_array(ajaxart.run(data,script,field,params,method,booleanExpression));
}



function aa_hasAttribute(elem,attr)
{
	if (window.jBartNodeJS) return jBartNodeJS.hasAttribute(elem,attr);
	return elem.getAttribute(attr) != null;
}



function aa_totext(data)
{
	if (typeof(data) == "string") return data;
	if (data == null || data.length == 0) return "";
	return ajaxart.totext_item(data[0]);
}



function aa_createElement(elem, tag)
{
	if (elem == null || !ajaxart.isxml(elem))
		return ajaxart.parsexml("<" + tag + "/>");
	return elem.ownerDocument.createElement(tag);
}



function aa_url_attribute(url,attr)
{
	if (url.indexOf('#') > -1) url = url.substring(url.indexOf('#'));
	var pos = url.indexOf('?'+attr+'='); 
	if (pos == -1) return "";
	var out = url.substring(pos+1);
	out = out.substring(out.indexOf('=')+1);
	if (out.indexOf('?') > -1) out = out.substring(0,out.indexOf('?'));
	if (out != "" && out.charAt(out.length-1) ==';' ) out = out.substring(0,out.length-1);
	return out;
}



function aa_first(data,script,field,params,method) {
	var result = ajaxart.run(data,script,field,params,method);
	if (result.length == 0) return null;
	return result[0];
}



function aa_int(data,script,field,params,method)
{
	var result = ajaxart.totext_array(ajaxart.run(data,script,field,params,method));
	if (!result) return null;
	return parseInt(result);
}



function aa_string2id(txt)
{
	if (!ajaxart.hebchars) ajaxart.hebchars = ajaxart.types.text_HebrewText.getAttribute('HebChars'); // cannot put hebrew in the js 
	var heb = ajaxart.hebchars;
	var eng = 'abgdaozhtiklmnsapzkrstnfhz';
	
	var newid = "";
	for(var i=0;i<txt.length;i++) {
		var pos = heb.indexOf(txt.charAt(i));
		if (pos == -1) newid += txt.charAt(i);
		else newid += eng.charAt(pos);
	}
	txt = newid;
	
	txt = txt.replace(/[^0-9a-zA-Z]/g,'_').replace(/(^[0-9]+)/g,'_$1');
	return txt;
}



function aa_var_first(context,varname) {
	var val = ajaxart.getVariable(context,varname);
	return val ? val[0] : null;
}



function aa_close_containing_popup(elem,doOnExitCallback,exitMode) {
	exitMode = exitMode || null;
	doOnExitCallback = doOnExitCallback || function() {};

	var top = elem && $(elem).closest('.aa_popup')[0];
	if (top && top.jbPopup) {
		var closeReturn = top.jbPopup.close(exitMode);
		if (closeReturn) { // closed properly without failing validations
			doOnExitCallback();			
		}
	}
}



function aa_init_class_Popup() {	
	if (ajaxart.classes.Popup) return;

	ajaxart.classes.Popup = function(settings) {	
		aa_extend(this,settings);
		this.intest = window.aa_intest;
		this.timeOpened = new Date();
		this.base_features = this.base_features || [];
	};
	
	ajaxart.classes.Popup.prototype.appendContents = function(contentsTop) {
		if (!contentsTop) return;
		this.field = aa_first(this.data,this.profile,'Contents',this.context);
		if (this.field)
			aa_fieldControl({ Field: this.field, Item: this.data, Wrapper: contentsTop, Context: this.context });
	};

	ajaxart.classes.Popup.prototype.RefreshPreview = function(contentsTop) {
		this.close();
		ajaxart.gcs.popup.OpenPopup(this.profile,this.data,this.context);
	};
}



function aa_renderStyleObject(style,objectProperties,context,objectIsNotTheElement,settings)
{
	try {
		if (style.Field) {  // style by field
			var object = aa_api_object(jQuery('<div/>')[0],objectProperties,objectIsNotTheElement);
			var item = objectProperties.data ? [objectProperties.data] : [];
			var wrapper = document.createElement('div');
			var ctx = aa_ctx(context,{ ApiObject: [object] });
			var styleField = style.Field(item,ctx); 
			aa_fieldControl({ Field: styleField, Item: item, Wrapper: wrapper, Context: ctx });
			var content = jQuery('<div style="display:inline-block;" class="aa_style_by_field_wrapper" />').append(wrapper);
			object.control = content[0];
			object.wrapperForStyleByField = wrapper;
			content[0].jbApiObject = object;
			return content[0];
		}
		style.Html = style.Html.replace(/>\s+</g,'><');		// allow indentation in html without injecting whitespaces. e.g: <div class="text"/> <div class="separator" /> 
		var jElem = jQuery(style.Html);
		if (!jElem[0]) jElem = jQuery('<div/>');
		objectProperties.context = context;
		if (style.params)
			objectProperties.params = style.params;
		var object = aa_api_object(jElem,objectProperties,objectIsNotTheElement);
		var cntr = context.vars._Cntr ? context.vars._Cntr[0] : null;
		object.elem_class = aa_attach_global_css(style.Css,cntr,null,false,false,context,settings); 
		jElem.addClass(object.elem_class); 
		aa_apply_style_js(object,style,context);
		
		return jElem[0];
	} catch(e) {
		ajaxart.logException('error rendering style object',e);
		return jQuery('<div/>').get();
	}
}



function aa_addMethod(object,method,profile,field,context,moreVars)
{
	var compiled = ajaxart.compile(profile,field,context);
	if (compiled == "same") { object[method] = function(data1) { return data1; }; return;}
	var init = function(compiled) {
		object[method] = function(data1,ctx) {
			var newContext = aa_merge_ctx(context,ctx,moreVars);
			newContext._This = object;
			if (compiled) 
			  return compiled(data1,newContext);
			else
			  return ajaxart.run(data1,profile,field,newContext);
		}
	}
	init(compiled);
//	var fieldscript = (field == "") ? profile : ajaxart.fieldscript(profile,field,true);
//	
//    object[method] = { 
//      script: fieldscript , context: context, objectForMethod: [object],
//      compiled: ajaxart.compile(fieldscript,'',context,paramVars) 
//    };
}



function aa_triggerXmlChange(xml,args) {
	if (!xml || !ajaxart.xmlListeners) return;
	var iter = xml.nodeType == 1 ? xml : aa_xpath(xml,'..')[0];

	// find if anyone is listening to a parent
	for(;iter && iter.nodeType == 1;iter=iter.parentNode) {
		var listeners = ajaxart.xmlListeners[iter.tagName];
		if (!listeners) continue;

		for(var i=0;i<listeners.length;i++) {
			if (listeners[i] && listeners[i].xml == iter)
				listeners[i].callback(xml,args);
		}

	}
}



function aa_run_js_code(code,data,context,elem)
{
	var func = aa_get_func(code);
	if (!elem)
		if (context.vars._ElemsOfOperation && context.vars._ElemsOfOperation.length)
			elem = context.vars._ElemsOfOperation[0];
	elem = elem || aa_var_first(context,'ControlElement');
	
	var data_item = data;
	if (data.length == 1)
		data_item = data[0];
	try {
		if (func)
			return func(data_item,elem,context);
	} catch(e) {
		ajaxart.logException(e,'aa_run_js_code failed, code: ' + code); 
	}
	return null;
}



function aa_run(data,profile,field,context) {
	return ajaxart.run(data,profile,field,context);
}



function aa_ctx(context,vars)
{
  var out = ajaxart.clone_context(context);
  for (var i in vars) out.vars[i] = vars[i];
  return out;
}



function aa_bindXmlChange(xml,callback,settings) {
  ajaxart.xmlListeners = ajaxart.xmlListeners || [];
  ajaxart.xmlListenersCounter = ajaxart.xmlListenersCounter ? ajaxart.xmlListenersCounter+1 : 1;

  if (!xml || !xml.tagName) return;
  ajaxart.xmlListeners[xml.tagName] = ajaxart.xmlListeners[xml.tagName] || [];

	ajaxart.xmlListeners[xml.tagName].push({
		xml: xml,
		callback: callback,
		settings: settings,
		id: ajaxart.xmlListenersCounter
	});

  return ajaxart.xmlListenersCounter;
}



function aa_getXmlInfo(xml,context,donotcreate)
{
  if (xml && !xml.nodeType ) return xml;
  if (!xml || xml.nodeType != 1) return null;
  for(var i=aa_xmlinfos.length-1;i>=0;i--)   // we'll probably use the last ones defined 
	  if (aa_xmlinfos[i].Xml == xml) return aa_xmlinfos[i];
  
  if (donotcreate) return null;
  
  var out = { isObject: true, Xml: xml };
  aa_xmlinfos.push(out);
  return out;
}



function aa_merge_ctx(context,contextVars,moreVars)
{
  var result = { params: context.params , vars: contextVars.vars , componentContext: context.componentContext , _This: contextVars._This};
  if (moreVars)
	  result = aa_ctx(result,moreVars);
  return result;
}



function aa_multilang_text(data,script,field,context)
{
	return ajaxart_multilang_run(data,script,field,context)[0] || '';
}



function aa_init_class(className, prototypeFunctions) {
  if (!ajaxart.classes[className]) {
    ajaxart.classes[className] = function(settings) {
      aa_extend(this, settings);
      if (this._ctor) this._ctor();
    };
    aa_extend(ajaxart.classes[className].prototype, prototypeFunctions);
  }
}



function aa_init_class_image() {
	if (ajaxart.classes && ajaxart.classes.Image) return;

	aa_init_class('Image',{
		_ctor: function() {
			this.css3Image = true;
		},
		render: function(settings) {
			var image = this;
			var el = settings.el;
			$(el).addClass('aa_image_outer');

			aa_empty(el,true);

			if (!this.originalWidth || !this.originalHeight) {
				aa_calc_image_size(image.url,function(width,height) {
					if (!width) return; // an invalid url
					image.originalWidth = width;
					image.originalHeight = height;
					image.render(settings);
				});
				return;
			}

			var innerDiv = $('<div class="aa_image"/>').appendTo(el);
			var comma = this.url.indexOf("'") > -1 ? '"' : "'";
			innerDiv.css({
				'background-image': 'url(' + comma + this.url + comma + ')',
				'background-repeat': 'no-repeat'
			});

			if (!this.width && !this.height) {
				this.width = this.originalWidth;
				this.height = this.originalHeight;
			}
			if (this.width && !this.height) {
				this.height = parseInt( this.originalHeight * this.width / this.originalWidth );
			}
			if (this.height && !this.width) {
				this.width = parseInt( this.originalWidth * this.height / this.originalHeight );
			}

			$(el).css({ overflow: 'hidden' , 'margin-left': 0, 'margin-top': 0 }).width(this.width).height(this.height);

			if (this.width / this.height == this.originalWidth / this.originalHeight) {
				innerDiv.css('background-size',this.width + 'px ' + this.height + 'px').width(this.width).height(this.height);
			} else {
				// different proportions
				this.adjustSize.fix(image,el,innerDiv[0],settings);
			}

			if (this.url.indexOf('//static.wix.com/media/') > -1) {
				// images hosted at wix
				var backgroundSize = innerDiv.css('background-size');
				var newWidth = backgroundSize.split('px')[0].trim();
				var newHeight = backgroundSize.split('px')[1].trim();

				var newUrl = aa_wix_image_url(this.url,{ width: newWidth, height: newHeight });

				innerDiv.css({
					'background-image': 'url(' + newUrl + ')',
					'background-repeat': 'no-repeat'
				});								
			}
		}
	});
}



function aa_bind(object,eventType,handler,identifier,elementForAutoUnbind) {
	if (!object) return;
	object.jbListeners = object.jbListeners || {};
	object.jbListeners.counter = object.jbListeners.counter || 0;
	var listenerID = ++object.jbListeners.counter;

	object.jbListeners[eventType] = object.jbListeners[eventType] || [];
	var listeners = object.jbListeners[eventType];

	for(var i=0;i<listeners.length;i++) {
		if (identifier && listeners[i].eventType == eventType && listeners[i].identifier == identifier) {
			listeners[i].handler = handler;
			return;
		}
  }
	listeners.push({eventType: eventType, handler: handler, identifier: identifier, listenerID: listenerID });	

	if (elementForAutoUnbind) {
		aa_addOnDetach(elementForAutoUnbind,function() { 
			aa_unbind(object,listenerID);
		});
	}

	return listenerID;
}



function aa_field_handler(field,event,handler,id,phase)
{
	aa_register_handler(field,event,handler,id,phase);
}



function aa_attach_global_css(globalcss,cntr,className,supportWrapper,lowPriority,context,settings)
{
	settings = settings || {};

	if (!window.aa_container_styles) window.aa_container_styles = {};
	if (!globalcss) return '';
	jBartWidgets.vars.uniqueNumber = jBartWidgets.vars.uniqueNumber || 0;
	
	var entry = globalcss;
	var classForItem = context && aa_totext(context.vars._ClassForItem);
	if (classForItem && globalcss.indexOf('#item') > -1) {
		entry = globalcss + '_' + classForItem;
	}

	if (!aa_container_styles[entry] || settings.noCssCache) { 
		var finalClassName = '';
		if (className) {
			finalClassName = 'jb_'+className;
			jBartWidgets.vars.usedJBClasses = jBartWidgets.vars.usedJBClasses || {};
			if (jBartWidgets.vars.usedJBClasses[finalClassName]) {
				finalClassName += (++jBartWidgets.vars.uniqueNumber);
			}
			jBartWidgets.vars.usedJBClasses[finalClassName] = true;
		} else {
			finalClassName = 'jb' + (++jBartWidgets.vars.uniqueNumber);
		}
		var obj = { elem_class : finalClassName , globalcss: globalcss};
		if (globalcss.indexOf('#cntr') >= 0)
			obj.cntr_class = 'jb' + (++jBartWidgets.vars.uniqueNumber);			
		aa_container_styles[entry] = obj;
		
		obj.globalcss = aa_clean_global_css(obj.globalcss);
		obj.globalcss = aa_adapt_css_for_browser(obj.globalcss);
		if (!aa_is_css_well_formed(obj.globalcss)) {
			var error = [];
			aa_is_css_well_formed(obj.globalcss,error);
			ajaxart.log("Css is invalid: " + error[0] + ". Css: " + obj.globalcss,"error");
			return "";
		}
		if (classForItem) {
			obj.globalcss = obj.globalcss.replace(/#item/g,'.'+classForItem);
		}
		obj.globalcss = obj.globalcss.replace(/#popup/g,'.jbart_popups >.'+obj.elem_class+'_popup');
		obj.globalcss = obj.globalcss.replace(/#this/g,'.'+obj.elem_class);
		obj.globalcss = obj.globalcss.replace(/#id/g,obj.elem_class);	// for animation ids: http://www.w3schools.com/css/css3_animations.asp
		if (supportWrapper)
		  obj.globalcss = obj.globalcss.replace(/#wrapper/g,'.'+obj.elem_class+'_wrapper');
		if (obj.cntr_class)
			obj.globalcss = obj.globalcss.replace(/#cntr/g,'.'+obj.cntr_class);
		
//		obj.globalcss = aa_expandCuscoVariablesMustacheStyle(obj.globalcss,context);
		obj.globalcss = obj.globalcss.replace(/_jbartImages_/g,aa_base_images());
		 
		if (settings && settings.fixGlobalCss) obj.globalcss = settings.fixGlobalCss(obj.globalcss);

		if (ajaxart.isIE) {	// IE limitation: does not support many style elems
			if (ajaxart.isIE78) {	// IE8 does not support changing innerHTML of attached style element
				var styleElem = jQuery("<style>" + obj.globalcss + "</style>")[0];
				var head = document.getElementsByTagName("head")[0];
				head.appendChild(styleElem);
			} else {
				if (!jBart.styleElem) {
					jBart.styleElem = jQuery("<style></style>")[0];
					var head = document.getElementsByTagName("head")[0];
					head.appendChild(jBart.styleElem);
				}
				if (lowPriority)
					jBart.styleElem.innerHTML = obj.globalcss + '\n' + jBart.styleElem.innerHTML;
				else
					jBart.styleElem.innerHTML = jBart.styleElem.innerHTML + '\n' + obj.globalcss;
			}
		} else {
			if (!obj.styleElem) {
				obj.styleElem = jQuery("<style></style>")[0];
				var head = document.getElementsByTagName("head")[0];
				head.appendChild(obj.styleElem);
			}
			obj.styleElem.innerHTML = obj.globalcss;
		}
		// obj.styleElem.StyleObject = obj;
	}
	
	if (cntr && aa_container_styles[entry].cntr_class)
		jQuery(cntr).addClass(aa_container_styles[entry].cntr_class);
	return aa_container_styles[entry].elem_class;
}



function aa_create_static_image_object(imageObject)
{
	if (!imageObject) return null;
	if (typeof(imageObject) == 'string') return { url: imageObject};
	if (imageObject && imageObject.css3Image) return imageObject;
	
	var width = imageObject.width, height = imageObject.height;
	if (imageObject.Size) {
		var sizeArr = aa_split(imageObject.Size,',',false);
		width = sizeArr[0] ? parseInt(sizeArr[0]) : null;
		height = sizeArr[1] ? parseInt(sizeArr[1]) : null;
	}

	return {
		url: imageObject.StaticUrl,
		width: width,
		height: height,
		inSprite: imageObject.inSprite,
		x: imageObject.x,
		y: imageObject.y,
		keepImageProportions: imageObject.KeepImageProportions,
		fillImage: imageObject.FillImage,
		zoomAndOffet: imageObject.ZoomAndOffet,
		offsetY: imageObject.OffsetY,
		offsetX: imageObject.OffsetX,
		zoom: imageObject.Zoom,
		centerImage: imageObject.CenterImage,
		baseImageObject: imageObject,
		marginTop: imageObject.MarginTop,
		marginLeft: imageObject.MarginLeft,
		boxWidth: imageObject.boxWidth,
		boxHeight: imageObject.boxHeight
	};
}



function aa_itemlistContainer(items,id,field) {
    var cntr = {
        Id: id,
        Items: items,
        ItemLists: []
    };
    items.cntr = cntr;
    // .bind ,.trigger are here to make the using code look a bit nicer
    cntr.bind = function(evt,callback,id) { aa_bind(cntr,evt,callback,id); }
    cntr.trigger = function(evt,obj) { aa_trigger(cntr,evt,obj); }

    if (ajaxart.xtmls_to_trace && ajaxart.xtmls_to_trace.length && field) {     // Tracing container 
        for (i in ajaxart.xtmls_to_trace) {  
            if (field.XtmlSource[0].script == ajaxart.xtmls_to_trace[i].xtml) 
                ajaxart.xtmls_to_trace[i].itemlistCntr = cntr;
        }
    }

    return cntr;
}



function aa_hide(elem) {
	if (!jBart.classForHiddenAdded) {
		var css = '.aa_hidden_element { display: none !important; }';
		var styleElem = jQuery("<style></style>").text(css)[0];
		var head = document.getElementsByTagName("head")[0];
		head.appendChild(styleElem);
		jBart.classForHiddenAdded = true;
	}
	if (elem && elem.nodeType == 1)
	  jQuery(elem).addClass('aa_hidden_element');
}



function aa_handleScroll(visualCntr,top,delayedAction) {
	aa_run_delayed_action('scroll',function() { 
		var elems = $(top).find('.aa_scroll_listener');
		if ($(top).hasClass('aa_scroll_listener')) elems.push($top[0]);

		for(var i=0;i<elems.length;i++) {
			try {
				var cntr2 = aa_findVisualContainer(elems[i]);
				if (visualCntr == cntr2 || !cntr2.originalHeight)
					elems[i].jbWindowScrollCallbacks();
			} catch(e) {
				ajaxart.logException('error in window scroll callback',e);
			}
		}
	},3);
}



function aa_trigger(object,eventType,eventObject) {
	if (!object || !object.jbListeners || !object.jbListeners[eventType]) return;
	eventObject = eventObject || {};
	eventObject.eventType = eventType;
	
	var listeners = object.jbListeners[eventType];
	for(var i=0;i<listeners.length;i++) {
		try {
			listeners[i].handler.apply(object,[eventObject]);
		} catch(e) {
			ajaxart.logException(e,'error trigerring event ' + eventType);
		}
	}	
}



function aa_windowVisualContainer() {
	if (!ajaxart.jbWindowVisualContainer) {

		var screenWidth = window.innerWidth || (document.documentElement.clientWidth || document.body.clientWidth);
		var screenHeight = window.innerHeight || (document.documentElement.clientHeight || document.body.clientHeight);

		ajaxart.jbWindowVisualContainer = {
			type: 'window',
			el: document.body,
			init: function(top) {			
				$(window).scroll(function() {
					aa_handleScroll(ajaxart.jbWindowVisualContainer,document.body);					
				});
			},
			recalc: function() {
				this.width = window.innerWidth || (document.documentElement.clientWidth || document.body.clientWidth);
				this.height = window.innerHeight || (document.documentElement.clientHeight || document.body.clientHeight);
			},
			scrollY: function() {
				return window.pageYOffset;
			},
			scrollTop: function(y) {
				$(window).scrollTop(y);
			},
			absTop: function() { 
				return 0;
			},
			supportsFixedPosition: true
		}
		ajaxart.jbWindowVisualContainer.init(document.body);
	}
	ajaxart.jbWindowVisualContainer.recalc();
	return ajaxart.jbWindowVisualContainer;
}



function aa_absTop(elem, ignoreScroll) {
  var top = 0,
    orig = elem,
    curr = elem;
  // This intentionally excludes body which has a null offsetParent.
  if (typeof(ignoreScroll) == "undefined") ignoreScroll = false;
  if (!ignoreScroll) {
    while (curr && curr.tagName && curr.tagName.toLowerCase() != 'body') {
      top -= curr.scrollTop;
      curr = curr.parentNode;
    }
  }
  while (elem) {
    top += elem.offsetTop;
    elem = elem.offsetParent;
  }
  return top;
}



function aa_create_itemList(field,context,inputData) {
    var itemlist = {
        Id: field.Id, id: field.Id,
        Fields: [],
        InputData: inputData
    };
    itemlist.context= itemlist.Context = aa_ctx(context,{ItemList: [itemlist], _Field: [field] });
    itemlist.cntr = itemlist.itemlistCntr = context.vars.ItemListCntr ? context.vars.ItemListCntr[0] : aa_itemlistContainer([],'cntr',field);
    itemlist.cntr.ItemLists.push(itemlist);
    itemlist.classForItem = 'aa_item_' + itemlist.Id;

    itemlist.RenderItem = function (item, elem) { // the view should override this method
        itemlist.CreateFieldControls(item,elem);
    }
    itemlist.ClearItems = function () {
        aa_empty(this.ParentOfItems, true);
    }
    itemlist.AppendItemElement = function (elem,addSettings) {
        addSettings = addSettings || { location: 'last' };
        if (addSettings.location == 'last') {
            this.ParentOfItems.appendChild(elem);
            return;
        }
        if (addSettings.location == 'first') {
            if (this.ParentOfItems.firstChild) 
                return this.ParentOfItems.insertBefore(elem,this.ParentOfItems.firstChild);
        }
        if (addSettings.location == 'afterItem') {
            for(var iter=this.ParentOfItems.firstChild;iter;iter=iter.nextSibling) {
                if (iter.jbItem[0] == addSettings.item) {
                    this.ParentOfItems.insertBefore(elem, iter.nextSibling);
                    return;
                }
            }
            // not implemented yet
        }

        // default begavior
        this.ParentOfItems.appendChild(elem);
    }
    itemlist.ElementOfItem = function(item) {
        var elem = this.ItemTemplate.cloneNode(true);
        jQuery(elem).addClass('aa_item').addClass(this.classForItem);
        elem.jbItem = item;
        this.RenderItem(item, elem);
        this.trigger('itemElement',elem);
        this.cntr.trigger('renderItem',elem);
        return elem;
    }
    itemlist.ShowItems = function () {
        itemlist.trigger('beforeItemsShown');
        var items = this.itemlistCntr.Items;
        // Incremental build is done by an aspect - this code is simple rendering
        for (var i = 0; i < items.length; i++) {
            var item = [items[i]];
            var elem = itemlist.ElementOfItem(item);
            this.AppendItemElement(elem);
        }
        aa_element_attached(this.el);
        itemlist.trigger('afterItemsShown');
    }
    itemlist.Refresh = function () {
        itemlist.trigger('beforeRefresh');
        itemlist.ClearItems();
        itemlist.ShowItems();
        itemlist.trigger('refresh');
    }
    itemlist.SetHtmlTemplate = function (html) {
        this.Ctrl = this.el;
        this.el.jbItemList = itemlist;
        this.ParentOfItems = this.el;
    }
    itemlist.CreateFieldControls = function (item, elem) {
        var item = elem.jbItem;
        for (var i = 0; i < this.VisibleFields.length; i++) {
            var field = this.VisibleFields[i];

            var wrapper = jQuery('<div/>')[0];
            itemlist.CreateFieldControl(item, wrapper,field);
            elem.appendChild(wrapper);
        }
    }
    itemlist.RefreshItemElement = function(elem) {
        var newElem = this.ElementOfItem(elem.jbItem);
        aa_replaceElement(elem,newElem,true);
        itemlist.trigger('refreshItemElement',{ NewElement: newElem, PreviousElement: elem } );
        return newElem;
    }
    itemlist.CreateFieldControl = function (item, wrapper,field) {
        var ctx = aa_ctx(this.Context,{ _Field: [field], _Item: item , _ClassForItem: itemlist.classForItem });
        var fieldData = field.FieldData ? field.FieldData(item, ctx) : item;
        if (field.IsCellHidden && field.IsCellHidden(item,ctx,fieldData)) return;
        aa_fieldControl({ Field: field, Item: item, Wrapper: wrapper, Context: ctx });
    }
    itemlist.GetElements = function() {
        var out=[]; // An aspect can change this logic
        for(var elem=this.ParentOfItems.firstChild;elem;elem=elem.nextSibling)
            if (elem.jbItem) out.push(elem);
        return out;
    }
    // itemlist.bind ,itemlist.trigger are here to make the using code look a bit nicer
    itemlist.bind = function(evt,callback,id) { jBart.bind(itemlist,evt,callback,id); }
    itemlist.trigger = function(evt,obj) { jBart.trigger(itemlist,evt,obj); }
    
    itemlist.itemlistCntr.bind('itemsChanged',function() {
        itemlist.Refresh();
    });


    if (ajaxart.xtmls_to_trace && ajaxart.xtmls_to_trace.length && field) {     // Tracing container 
        for (i in ajaxart.xtmls_to_trace) {  
            if (field.XtmlSource[0].script == ajaxart.xtmls_to_trace[i].xtml) 
                ajaxart.xtmls_to_trace[i].itemlistCntr = itemlist.cntr;
        }
    }

    return itemlist;
}



function aa_renderStyleObject2(style,apiObject,field_data,field,context,settings) {
	try {
		apiObject.field = field;
		apiObject.field_data = field_data;
		apiObject.context = context;

		apiObject.params = style.params;

		if (style.Field) {  // style by field
			var wrapper = document.createElement('div');
			var ctx = aa_ctx(context,{ ApiObject: [apiObject] });
			var styleField = style.Field(field_data,ctx); 
			aa_fieldControl({ Field: styleField, Item: field_data, Wrapper: wrapper, Context: ctx });
			var content = $('<div style="display:inline-block;" class="aa_style_by_field_wrapper" />').append(wrapper);
			apiObject.control = apiObject.el = content[0];
			apiObject.$el = $(apiObject.el);
			apiObject.wrapperForStyleByField = wrapper;
			content[0].jbApiObject = apiObject;
			return content[0];
		}

		if (style.render) { 
			var out = style.render(apiObject,settings); 
			out.jbApiObject = apiObject;
			return out;
		}
		style.Html = style.Html.replace(/>\s+</g,'><');		// allow indentation in html without injecting whitespaces. e.g: <div class="text"/> <div class="separator" /> 
		var out = $(style.Html)[0] || $('<div/>')[0];
		apiObject.elem_class = aa_attach_global_css(style.Css,null,null,false,false,context,settings); 
		apiObject.el = out;
		apiObject.$el = $(out);

		$(out).addClass(apiObject.elem_class); 
		aa_apply_style_js(apiObject,style,context);
		
		return out;
	} catch(e) {
		ajaxart.logException('error rendering style object',e);
		return $('<div/>').get();		
	}	
}



function aa_wrapWithSection(ctrl,field,sectionStyle,item_data,ctx,field_data)
{
	var jElem = $(sectionStyle.Html);
	var title = aa_fieldTitle(field ,item_data, ctx,true);
	var section = {
		Title: title,
		Image: field.SectionImage,
		field: field,
		field_data: field_data || [],
		context: ctx,
		collapsed: !!field.SectionCollapsedByDefault,
		setImageSource: function(classOrElement,imageObject,deleteIfNoImage)	{
			var inner = this.getInnerElement(classOrElement);
			if (inner) aa_set_image(inner,imageObject,deleteIfNoImage);
		},
		setInnerHTML: function(classOrElement,text)	{
			var inner = this.getInnerElement(classOrElement);
			if (inner) inner.innerHTML = text;
		},
		getInnerElement: function(classOrElement)
		{
			if (typeof(classOrElement) == 'string') {  // it is a class
				if (classOrElement == '') return this.el;
				if (classOrElement.indexOf('.') == 0)
				  return aa_find_class(this.$el,classOrElement.substring(1))[0];
				return null;
			}
			return classOrElement || this.el;
		},		
		addSectionBody: function(classOrElement) {
			var inner = this.getInnerElement(classOrElement);
			if (inner) inner.appendChild(ctrl); 
			if (this.collapsed) $(inner).css('display','none');
		},
		updateCollapsed: function(collapsed) {
			this.collapsed = collapsed;
		},
		$el: jElem,
		el: jElem[0],
		jElem: jElem,
		control: jElem[0]
	};
	section.setImage = section.setImageSource;

	aa_trigger(field,'beforeWrapWithSection',{ context: ctx, sectionObject: section });
	
	section.$el.addClass(aa_attach_style_css(sectionStyle));
	aa_apply_style_js(section,sectionStyle);
	return section.el;
}



function aa_refresh_field(field_ids,scope,fire_on_update,transition,context)
{
	if (scope == 'sibling') { 
		var srcElement = context.vars.ControlElement[0];
		for(var j in field_ids) {
			aa_refresh_sibling_field(srcElement,field_ids[j],context);
		}
		return;
	};

	if (scope == 'parent')
	{
		// look in parents
	}
	var top = window.aa_intest ? aa_intest_topControl : document;
	if (scope == "screen")
	  top = window.aa_intest ? aa_intest_topControl : document;
	else if (scope == "document")
	  { top = context.vars._Cntr[0].Ctrl; }
	else if (scope == "table row")
	  { top = $(context.vars.ControlElement[0]).parents('tr')[0]; }
	for(var j =0;j<field_ids.length;j++)
	{
		var cls = "fld_" + field_ids[j];
		var ctrls = $(top).find('.'+cls).get();
		if ($(top).hasClass(cls)) ctrls.push(top);
		
		for(var i=0;i<ctrls.length;i++)
		{
			aa_refresh_cell(ctrls[i],context,transition,null,true);
//			if (fire_on_update)
//				aa_invoke_field_handlers(td.Field.OnUpdate,td,null,td.Field,td.FieldData);
		}
		if (!ctrls.length) { ajaxart.log("RefreshField: cannot find field " + field_ids[j],"location"); }
	}
	aa_fixTopDialogPosition();
}



function aa_ifThenElse(profile,data,context)
{
	if (aa_bool(data,profile,'If',context))
		return ajaxart.run(data,profile,'Then',context);
	else
		return ajaxart.run(data,profile,'Else',context);
}



function aa_create_base_field(data, profile, context) {
	var field = {
		Id: aa_text(data, profile, 'ID', context),
		Title: aa_multilang_text(data, profile, 'Title', context),
		Image: aa_first(data, profile, 'Image', context),
		Style: aa_first(data, profile, 'Style', context)
	};
	field.ID = [field.Id];
	ajaxart.runsubprofiles(data, profile, 'FieldAspect', aa_ctx(context, {
		_Field: [field]
	}));
	return field;
}



function aa_xpath(xml,xpath,createIfDoesNotExist) {
	return ajaxart.xml.xpath(xml,xpath,createIfDoesNotExist);
}



function aa_fieldControl(settings,runAfterAsyncAction) {
    try {
    var field = settings.Field;
    var wrapper = settings.Wrapper;
    wrapper.jbFrom_aa_fieldControl = true;

    var ctx = aa_ctx(settings.Context, { _Field: [field], Item: settings.Item })

    if (field.AsyncActionRunner && !runAfterAsyncAction) {
    	return field.AsyncActionRunner(settings);
    }
    
    var field_data = settings.FieldData;
    if (!field_data) field_data = field.FieldData ? field.FieldData(settings.Item, ctx) : settings.Item;

    for (i in ajaxart.xtmls_to_trace) {  // Tracing field data
        if (ajaxart.xtmls_to_trace.hasOwnProperty(i) && field.XtmlSource[0].script == ajaxart.xtmls_to_trace[i].xtml) {
            ajaxart.xtmls_to_trace[i].fieldData = ajaxart.xtmls_to_trace[i].fieldData || [];
            ajaxart.xtmls_to_trace[i].fieldData = ajaxart.xtmls_to_trace[i].fieldData.concat(field_data);
        }
    }
    
    aa_trigger(field,'ModifyInstanceContext',{ Context: ctx, FieldData: field_data });

    aa_extend(wrapper, {
    	Field: field, FieldData: field_data, 
    	ItemData: settings.Item, jbContext: settings.Context
    })
    jQuery(wrapper).addClass('aa_cell_element');
    var contentCtrl;
    try {
        contentCtrl = field.Control && field.Control(field_data, ctx)[0];
    } catch(e) {
        ajaxart.logException(e);
        contentCtrl = document.createElement("DIV");
    }
    if (contentCtrl) { 
      wrapper.appendChild(contentCtrl);
   	  wrapper.jbControl = contentCtrl;
   	  
      jQuery(contentCtrl).addClass('field_control fld_'+field.Id);
      contentCtrl.jbCell = wrapper;
      contentCtrl.Field = field;
    	
	  jBart.trigger(field,'ModifyControl',{ Wrapper: wrapper, FieldData: field_data, Context: ctx, Item: settings.Item });
      if (field.ModifyControl) { 
	    	for (var i = 0; i < field.ModifyControl.length; i++)
	    		field.ModifyControl[i](wrapper, field_data, 'control', ctx, settings.Item);
	  }
    }

    jBart.trigger(field,'ModifyCell',{ Wrapper: wrapper, FieldData: field_data, Context: ctx, Item: settings.Item });
    if (field.ModifyCell) { 
    	for (var i = 0; i < field.ModifyCell.length; i++)
    		field.ModifyCell[i](wrapper, field_data, 'control', ctx, settings.Item);
    }
    
    if (contentCtrl) aa_element_attached(contentCtrl);

    if (settings.DoAfterShow) settings.DoAfterShow(settings);
    } catch(e) {
        ajaxart.logException('error rendering field ' + (settings.Field && settings.Field.Id),e);
    }   
}



function aa_field_setAsyncActionBeforeLoad(topSettings) {
	topSettings.field.AsyncActionRunner = function(settings) {
		var result = settings.Wrapper || settings.wrapper;
		var loadingObject = {
			text: topSettings.loadingText
		};
		aa_renderStyleObject2(topSettings.loadingStyle,loadingObject,[],topSettings.field,settings.Context);
		result.appendChild(loadingObject.el);
		if (topSettings.showLoadingTextOnly) return;

		var promise = topSettings.asyncAction()[0];
		$.when(promise).then(function() {
			settings.Wrapper = result;
			aa_remove(loadingObject.el, true);

			aa_fieldControl(settings, true);
			aa_element_attached(result.firstChild);
		}, function() {
			loadingObject.$el.text(topSettings.errorText);
		});
	}
}



function aa_body() {
	return document.body;
}



function aa_toint(data)
{
	if (data.length == 0) return 0;
	var txt = aa_totext(data);
	if (txt == '') return 0;
	return parseInt(txt);
}



function aa_paramExists(profile,param,excludeEmptyAttribute)
{
  var script = ajaxart.fieldscript(profile,param,true);
  if (script == null) return false;
  if (script.nodeType == 1 && !script.getAttribute('t') && !script.getAttribute('value')) return false;
  if (excludeEmptyAttribute && profile.getAttribute(param) == '') return false;
	  
  return true;
}



function aa_create_jbart_context(settings) {
	var widgetXml = settings.WidgetXml;
	var context = settings.Context || ajaxart.newContext();
	var uiprefObj = uipref_in_cookies();
	
	var widgetId = widgetXml.getAttribute('id') || 'gdrive';
	var appXtml = aa_xpath(widgetXml,"bart_dev/db/bart_unit/bart_unit/Component[@id='App']/xtml")[0];
	if (!appXtml) appXtml = aa_xpath(widgetXml,"xtml/Component[@id='Widget']/xtml")[0];

	var language = settings.Language || aa_totext( aa_xpath(appXtml,"Language/@Language") ); 
	var globalVars = {};
	
	var resources = widgetDataResources();
	
	var bctx = {
	  AppXtml: appXtml,
	  Resources: resources,
	  Url: ajaxart.runComponent('bart_url.BrowserUrl',[],context)[0],
	  ValidationStyle: ajaxart.runComponent('validation.DefaultOld',[],context)[0]
	};

	if (settings.jbartObject) settings.jbartObject._AppContext = bctx;	

	var ctx = aa_ctx(context, { 
		_GlobalVars: [globalVars], _UIPref: [uiprefObj], Language: [language] , 
		_AppContext: [bctx], _WidgetXml: [widgetXml]
	});
	bctx.context = ctx;

	loadSampleComponents();		
	runAppFeatures();
	resourcesToGlobalVars();
	setOldPages();
	AppFeatures_Load();
	overrideUIPrefs();

	return ctx;

  function loadSampleComponents() {
  		ajaxart.componentsXtmlCache.sample = null;
    	
    	var namespaces = aa_xpath(widgetXml,"xtml");
    	var unit = aa_xpath(widgetXml,"bart_dev/db/bart_unit/bart_unit")[0];
    	if (unit) namespaces.push(unit);

    	for(var j=0;j<namespaces.length;j++) {
    		var ns = namespaces[j].getAttribute('ns') || 'sample';
	    	ajaxart.components[ns] = ajaxart.components[ns] || {};

    		var comps = aa_xpath(namespaces[j],'Component');
	    	for(var i=0;i<comps.length;i++) {
	    		  var id = comps[i].getAttribute("id");
	  	      ajaxart.components[ns][id] = comps[i];
	  	      ajaxart.componentsXtmlCache[ns+'.'+id] = null;
	  	      if (comps[i].getAttribute('execution') == 'native') {
	  	      	var code = aa_cdata_value(aa_xpath(comps[i],'Code')[0]);
	  	      	if (code) {
	  	      		ajaxart.gcs[ns] = ajaxart.gcs[ns] || {};
	  	      		eval('ajaxart.gcs[ns][id] = ' + code);
	  	      	}
	  	      }
	    	}
	    	
    		var types = aa_xpath(namespaces[j],'Type');
	    	for(var i=0;i<types.length;i++) {
    			ajaxart.types[ns + "_" + types[i].getAttribute('id')] = types[i];
    		}

    	}

  }
	function runAppFeatures() {
		bctx.Features = [];
		var featuresXtml = aa_xpath(appXtml,'ApplicationFeature');
		for(var i=0;i<featuresXtml.length;i++) {
			try {
			  ajaxart.concat(bctx.Features, ajaxart.run([],featuresXtml[i],'',ctx));
			} catch(e) {}
		}
	}
		
	function resourcesToGlobalVars()
	{
		var resources = bctx.Resources;
		for(var i=0;i<resources.length;i++) {
			var init = function(resource) {
				var id = aa_totext(resource.ID);
				globalVars[id] = function() { return resource.Items; }
			}
			init(resources[i]);
		}
	}
	
	function setOldPages() {
		bctx.Pages = [];
		var pagesXtml = aa_xpath(appXtml,'Pages/Page');
		for(var i=0;i<pagesXtml.length;i++) 
			ajaxart.concat(bctx.Pages, ajaxart.run([],pagesXtml[i],'',ctx));
	}

	function AppFeatures_Load() {
		for(var i=0;i<bctx.Features.length;i++) {
			var feature = bctx.Features[i];
			try {
			  if (feature.Load) feature.Load([],ctx);
			} catch(e) {
				ajaxart.logException(e,'Loaing App Features Failure');
			}
		}
	}
	
	function overrideUIPrefs() {
		var uiPrefs = aa_xpath(widgetXml,'bart_dev/db/bart_unit/bart_unit/UIPref/*');
		for(var i=0;i<uiPrefs.length;i++) {
			var elem = uiPrefs[i];
			var prefix = elem.tagName;
			var attributes = elem.attributes;
			for(var j=0;j<attributes.length;j++) {
				var name = attributes.item(j).name;
				var value = elem.getAttribute(name);
				uiprefObj.SetProperty([],aa_ctx({ Prefix: [prefix], Property: [name], Value: [value] }));
			}
		}
	}
	function widgetDataResources() {
		var resources = [];
		var resourcesXtml = aa_xpath(appXtml,'Resources/Resource');
		if (!resourcesXtml.length) resourcesXtml = aa_xpath(appXtml,'DataResource');

		for(var i=0;i<resourcesXtml.length;i++) {
			var resourceXtml = resourcesXtml[i];
		    var resourceID = resourceXtml.getAttribute('ResourceID');
			var t = resourceXtml.getAttribute('t');
			var shortWidgetId = aa_array_lastItem(widgetId.split('/'));		    
			var varName = 'jBartWidget_' + shortWidgetId + '_' + resourceID;
			if (window[varName]) {
				resources.push({ Id: resourceID, ID: [resourceID], Items: window[varName] });
			} else {
				var resource = aa_first([],resourceXtml,'',aa_ctx(context,{WidgetId: [widgetId]}));
				if (resource) resources.push( resource );
				else ajaxart.log('could not create resource ' + resourceID,"error");
			}
		}
		return resources;
	}
	
	function uipref_in_cookies() {
		return {
		  GetProperty: function(data1,ctx) {
			var out = aa_valueFromCookie(aa_totext(ctx.vars.Prefix)+aa_totext(ctx.vars.Property));
			return out ? [out] : [];
		  },
		  SetProperty: function(data1,ctx) {
			aa_writeCookie(aa_totext(ctx.vars.Prefix)+aa_totext(ctx.vars.Property),aa_totext(ctx.vars.Value));
		  }
		}
	}
	
}



function aa_show_jbart_widget_page(settings)
{
	var ctx = settings.Context;
	var bctx = aa_var_first(ctx,'_AppContext');
	var pageID = settings.page;
	var appXtml = bctx.AppXtml;

	var out = document.createElement('div');
	jQuery(out).addClass('aa_widget jBartWidget');
	addWidgetCss();
	var widgetPage = showWidgetPage();
	out.appendChild(widgetPage);

	if (settings.RunAfterControlWithTimer) 
		setTimeout(runAfter,1); 
	else runAfter();
	
	if (settings.ControlToShowInBartContext) // for auto tests
		return settings.ControlToShowInBartContext([],ctx);
	
	aa_register_document_events(ctx);
  return out;

	function addWidgetCss()
	{
		var css = aa_totext(bctx.Css || []);
		if (css) 
			$(out).addClass(aa_attach_global_css(css));
	}
	function runAfter() {
		try {
			if (settings.success) settings.success([],ctx);
		} catch(e) {}
	}
	
	function showWidgetPage()
	{
	    var pageProfile = null;
	    if (pageID) {
	    	pageProfile = newPageByID(pageID);
	    	pageProfile = pageProfile || oldPageByID(pageID);
	    }
	    pageProfile = pageProfile || aa_xpath(appXtml,"MainPage1")[0];
	    if (!pageProfile && appXtml.getAttribute('MainPage')) {
	    	pageProfile = oldPageByID(appXtml.getAttribute('MainPage'));
	    }
	    pageProfile = pageProfile || newPageByID('main') || oldPageByID('main'); 
	    
	    var pageAsField = aa_first([],pageProfile,'',ctx);
	    if (pageAsField && pageAsField.Id) {
	    	var pageout = jQuery('<div/>')[0];
	    	aa_fieldControl({ Field: pageAsField, Wrapper: pageout, Item: [], Context: ctx });
	    	aa_trigger(bctx,'showPage',{ el: pageout });
	    	return pageout;
	    } else { // a page (e.g bart.SinglePage)
	    	var page = pageAsField;
	    	var pageout = page.Control([],aa_ctx(ctx,{_PageParams: [] }))[0];
	    	aa_trigger(bctx,'showPage',{ el: pageout });
	    	return pageout;
	    }
	}
  function newPageByID(pageID) {
    	return aa_xpath(appXtml, "../../Component[@id='"+pageID+"']/xtml")[0];
  }
  function oldPageByID(pageID) {
    	return aa_xpath(appXtml,"Pages/Page[@ID='"+pageID+"']")[0];		
  }
}



function aad_runMethodAsyncQuery(object,methodFunc,data,context,callBack)
{
	if (object == null || methodFunc == null) { callBack([],context); return; }
	
	var callBackObj = { callBack: callBack, marked: false };
	var result = [];
	var newContext = aa_ctx(context,{ _AsyncCallback : callBackObj });
	try {
		result = methodFunc.call(object,data,newContext); 
	} catch(e) { ajaxart.logException(e); }
	if (! callBackObj.marked && callBack)	// method did not mark. running callback now
		callBack(result,context);
}



function ajaxart_async_Mark(context,isQuery)
{
	if ( context.vars._AsyncCallback != null ) context.vars._AsyncCallback.marked = true;
	if (isQuery) context.vars._AsyncIsQuery = true;
}



function ajaxart_async_CallBack(data,context)
{
	if ( context.vars._AsyncCallback != null && context.vars._AsyncCallback.callBack != null) {
		var success = context.vars._AsyncCallback.success;
		if (success == null) success = true;
		context.vars._AsyncCallback.callBack(data,context,success);
	}
}



function ajaxart_fieldaspect_getField(context) {
  var field = context.vars['_Field'];
  if (field == null || field.length == 0) return null;
  return field[0];
}



ajaxart.run = function (data,script,field,context,method,booleanExpression) 
{
   try {
	 var origData = data;
     if (ajaxart.debugmode && ! ajaxart.isArray(data))
     {
    	 ajaxart.log("run called with input not an array","error");
    	 return [];
     }
     if (script == null) return [];
     if (script.nodeType && script.nodeType == 2) { // attribute
    	 field = script.nodeName;
    	 script = ajaxart.xml.parentNode(script);
    	 if (!script) return [];
     }
     if (field != "" && aa_hasAttribute(script,field) ) {
       if (script.getAttribute("Break") == field)
      	 debugger;
       var out = ajaxart.dynamicText(data,script.getAttribute(field),context,null,booleanExpression);
       
       if (script.getAttribute("Trace") == field) ajaxart.trace(script,data,out,context,field);
       aa_try_probe_test_attribute(script,field,data,out,context,origData);
       return out;
     }
     var field_script = ajaxart.fieldscript(script, field,false);
     if (field_script == null) return [];
     if (field_script.nodeType == 2) return ajaxart.run(data,field_script,'',context,method,booleanExpression); // For Default param values in attributes
      
	 var childElems = [];
	 var node = field_script.firstChild;
	 while (node != null)
	 {
		if (node.nodeType == 1) childElems.push(node);
		node=node.nextSibling;
	 }
     ajaxart.stack_trace.push(field_script);
     // decorators
	 var classDecorator="";
	 var cssStyleDecorator="";
	 var atts = field_script.attributes;
	 for(var i=0;i<atts.length;i++)
	 {
		var aname = atts.item(i).nodeName;
		
		if (aname == "t") {}
		else if (aname == "Condition" && ! aa_bool(data,atts.item(i),"",context))
		{
			ajaxart.stack_trace.pop();
			return [];
		}
		else if (aname == "Data")
		{
			data = [aa_first(data,atts.item(i),'',context)];
			if (data[0] == null) data = [];
		}
		else if( aname == "RunOn")
  	 	  context = ajaxart.calcParamsForRunOn(context,ajaxart.run(data,atts.item(i),"",context));
		else if( aname == "Class") 
			classDecorator = aa_text(data,atts.item(i),"",context);
		else if( aname == "CssStyle") 
			cssStyleDecorator = aa_text(data,atts.item(i),"",context);
		else if( aname == "NameForTrace")
			ajaxart.log(atts.item(i), "actions trace");
	 }
	 
	 var firstVar=true;
	 for(var childElem in childElems)
	 {
	 	if (!childElems.hasOwnProperty(childElem)) continue;
		var item = childElems[childElem]; 
		var tag = item.tagName;  //Todo: if backend use getTagName
		if (tag == "Condition" && ! aa_bool(data,item,"",context))
		{
			ajaxart.stack_trace.pop();
			return [];
		}
		else if (tag == "Data")
		{
			data = [aa_first(data,item,"",context)];
			if (data[0] == null) data = [];
		}
		else if (tag == "RunOn")
  	 	  context = ajaxart.calcParamsForRunOn(context,ajaxart.run(data,item,"",context));
		else if (tag == "Class")
			classDecorator = aa_text(data,item,"",context);
		else if (tag == "CssStyle")
			cssStyleDecorator = aa_text(data,item,"",context);
		else if (tag == "Var")
		{
			if (firstVar) { context = ajaxart.clone_context(context); firstVar = false;}
			var scope = item.getAttribute('varScope') || 'stack';

      var varname = item.getAttribute("name");
      if (varname == "ControlElement") {	// special case. todo: try to fix this
				var elementPointer = {};
        ajaxart.setVariable(context,varname,elementPointer);         
      }
      var var_value = null;
      if (! aa_hasAttribute(item,"t") && ! aa_hasAttribute(item,"value") )
        var_value = data;
      else
        var_value = ajaxart.run(data,item,"",context);

      if (varname == "ControlElement") {	// special case. todo: try to fix this
        elementPointer.controlElement = var_value;
      }
      if (scope == 'Component') {
        context.params[varname] = var_value;
      } else { // scope == stack
        ajaxart.setVariable(context,varname,var_value);
      }
		}
	 }

	 var component = field_script.getAttribute("t") || "";
	 if (component == "") 
	 {
       if (aa_hasAttribute(field_script,"value") ) {
  		 if (field_script.getAttribute("Break") == "true")
  	    	 debugger;
      	 var out = ajaxart.dynamicText(data,field_script.getAttribute("value"),context,null,booleanExpression);
         if (aa_hasAttribute(field_script,"Trace"))
        	 ajaxart.trace(script,data,out,context,field,field_script.getAttribute("Trace"));
		 if (ajaxart.inPreviewMode)
		 	aa_trace_run_for_preview(field_script,data,out,context,origData);

  		 ajaxart.stack_trace.pop();
         return out;
       }
       else {  // maybe CDATA
   		for (var child = field_script.firstChild; child; child=child.nextSibling)
			if (child.nodeType == 4 && child.nodeValue)
				return ajaxart.dynamicText(data,child.nodeValue,context,null,booleanExpression);
       }
       ajaxart.stack_trace.pop();
	   return [];
	 }	   	   	   
	 // component definition
	 var global = aa_componentById(component);
	 if (!global) {
		ajaxart.stack_trace.pop();
		return [];
	 }
	 //aa_mark_component_usage(component,global);	// used for compression- do not delete
	 if (global.getAttribute("execution") == "native")
	 {
	   var gc_component = (method && method.length > 0) ? component + "_" + method : component;
	   var func = aa_componentById(gc_component,'gcs');
	   if (!func) {
		   ajaxart.stack_trace.pop();
		   return [];
	   }
	   if (field_script.getAttribute("Break") == "true")
		   debugger;
       if (ajaxart.profiling_of_globals == null)
    	   out = func(field_script,data,context);
       else {
	 		 var before = new Date().getTime();
        	 out = func(field_script,data,context);
        	 ajaxart.write_profiling_at_end(before,component);
        }
	 }
	 else   // xtml-defined component
	 {
		 var global_xtml = ajaxart.componentsXtmlCache[component]; 
		 if (global_xtml == null) {
	       global_xtml = ajaxart.childElem(global,'xtml');
	       ajaxart.componentsXtmlCache[component] = global_xtml;
		 }
		 if (global_xtml == null)
			 ajaxart.log("missing implementation for component " + component,"error");
		 var paramDefinitions = ajaxart.childElems(global,"Param");
		 var contextForXtml = ajaxart.newContext();
		 contextForXtml.vars = context.vars;
	     contextForXtml.componentContext = context;
	     contextForXtml.counter = (context.counter!=null) ? context.counter+1 : 1;
//	     if (contextForXtml.counter == 50) { debugger; window.alert('endless loop'); throw "endless loop"; }
	     if (contextForXtml.counter > 100) { ajaxart.log("endless loop"); return []; }
		 
		 for(var i=0;i<paramDefinitions.length;i++)
		 {
			 var paramDef = paramDefinitions[i];
			 var param_name = paramDef.getAttribute("name");
			 var param_value;
			 if (aa_hasAttribute(paramDef,"type") && (''+paramDef.getAttribute("type")).indexOf("[]") > 0)  //array
			 {
			   var param_value = [];
			   var subprofiles = ajaxart.childElems(field_script,param_name);
  		       if (paramDef.getAttribute("script") != "true" ) { 
			     for(var j=0;j<subprofiles.length;j++)
  			       ajaxart.concat(param_value, ajaxart.run(data,subprofiles[j],"",context) );
  		       } else { 
  		    	 param_value = { isArrayParamScript: true , script: field_script, field:param_name, context: context };
  		       }
			 }
		     else if (paramDef.getAttribute("script") != "true" ) 
			   param_value = ajaxart.run(data,field_script,param_name,context);
	         else { // script=true
	           param_value = { isParamScript: true }; 
			   param_value.script = ajaxart.fieldscript(field_script, param_name,true,contextForXtml);
	           param_value.compiled = ajaxart.compile(param_value.script,'',context,paramDef.getAttribute("paramVars"));
	         }

			 ajaxart.setParameterVariable(contextForXtml,param_name,param_value);
	     }
	     if (global.getAttribute("useCallerScript") == "true")
			   ajaxart.setVariable(contextForXtml,"_CallerScript", [field_script]);
	     
	     if (ajaxart.profiling_of_globals == null)
	    	 out = ajaxart.run(data,global_xtml,"",contextForXtml,method);
	     else {
	 		 var before = new Date().getTime();
	    	 out = ajaxart.run(data,global_xtml,"",contextForXtml,method);
        	 ajaxart.write_profiling_at_end(before,component);
	     }
	   } 
	   
       // decorators - post function
	   if (out == null) out = [];
	   
	   if (classDecorator != "") {
		 if (ajaxart.ishtml(out))
		   for(var item in out)
		   	if (out.hasOwnProperty(item))
				 jQuery(out[item]).addClass(classDecorator);
       }
	   if (cssStyleDecorator != "") {
		   for(var item in out)
		   	if (out.hasOwnProperty(item) && ajaxart.ishtml(out[item]))
				aa_setCssText(out[item],cssStyleDecorator);
	   }
	   if (global.getAttribute('databind') == "true") {
		   ajaxart.databind(out,data,context,field_script,origData);
	   }
	   try {
	     if (field_script.nodeType == 1 && out.length > 0 && ajaxart.isObject(out[0]))
		   if (global.getAttribute('dtsupport') != "false" && field_script.nodeType == 1 && field_script.getAttribute('dtsupport') != "false")
		     out[0].XtmlSource = [{ script: field_script , input: data, context: context }];
	   } catch(e) {  }
	   
	   // trace
	   if (aa_hasAttribute(field_script,"Trace"))
		   ajaxart.trace(field_script,data,out,context,null,field_script.getAttribute("Trace"));
	   
	   if (aa_hasAttribute(field_script,"Alert")) {
	   	  if (field_script.getAttribute("Alert") == "true")
		   aa_alert(ajaxart.totext_array(out));
		  else
		  	aa_alert(ajaxart.dynamicText(out,field_script.getAttribute("Alert"),context));
		}

	  	if (aa_hasAttribute(field_script,"Name"))
	  	{
	  		var id = ('' + field_script.getAttribute("Name")).replace(/ /g, "_");
			 for(var item in out)
		   		if (out.hasOwnProperty(item) && ajaxart.ishtml(out[item]))
					 out[item].setAttribute("id", id);
	  	}
		if (ajaxart.inPreviewMode)
		 	aa_trace_run_for_preview(field_script,data,out,context,origData);
	   ajaxart.stack_trace.pop();
       return out;
	   } catch (e) {
	   	   if (e && e.BreakPreviewCircuit) 
	   	   		throw e;
	   	   	
		   var prefix = '';
		   if (script) {
			   var field_script = ajaxart.fieldscript(script, field,false) || script;
			   if (script.getAttribute('t')) prefix = 't=' + script.getAttribute('t') + ' - ';
		   }
	   	   ajaxart.logException(e,prefix);
	       return [];
	   };
}



ajaxart.isxml = function (xml)
{
	if (ajaxart.isArray(xml)) return ajaxart.isxml_array(xml);
	return ajaxart.isxml_item(xml);
}



ajaxart.xml2text = function (xml) 
{
	if (xml == null) return '';

	if (! ajaxart.ishtml(xml))
		return ajaxart.xml.prettyPrint(xml,"",true);
	
	if (ajaxart.isArray(xml))
	{
		if (xml.length > 0 ) return ajaxart.xml2text(xml[0]);
		return '';
	}
	return aa_xml2htmltext(xml);
}



ajaxart.totext = function (item) 
{
	if (ajaxart.isArray(item)) return ajaxart.totext_array(item);
	return ajaxart.totext_item(item);
}



ajaxart.runsubprofiles = function (data,profile,field,context,trycatch_oneachitem)
{
	var subProfs = ajaxart.childElems(profile,field);
	var out = [];
	for(var i=0;i<subProfs.length;i++) {
		if (ajaxart.debugmode)
			ajaxart.concat(out,ajaxart.run(data,subProfs[i],'',context) );
		else {
 		  try {
		    ajaxart.concat(out,ajaxart.run(data,subProfs[i],'',context) );
		  }
		  catch(e) {
			if (trycatch_oneachitem != true) throw(e);
			ajaxart.logException(e);
		  }
		}
	}
	return out;
}



ajaxart.subprofiles = function (profile,field) 
{
  return ajaxart.childElems(profile,field);
}



ajaxart.totext_item = function (item)
{
	if (item == null || item == undefined) return '';
	if (typeof item == 'string') return item;
	if (item.nodeType && item.nodeType == 2) return item.nodeValue;
	
	if (ajaxart.ishtml_item(item))
		return ajaxart.xml2text(item);

	if (ajaxart.isxml_item(item))
	{
		if (item.nodeValue != null) return item.nodeValue;
		// if has no sub elements : return inner text
   		for (var child = item.firstChild; child; child=child.nextSibling)
			if (child.nodeType == 4 && child.nodeValue) // promote cdata
				return child.nodeValue;
			else if (child.nodeType == 1) 
				return ''; // mixed 
		if (item.text != null) return item.text;
		return item.textContent;
	}
	if (item.GetValue)
		return '' + item.GetValue();

	return '' + item;
}



ajaxart.log = function (message,type)
	{
		if (type == null) type = "";
		var log_message = type + " - " + message;
		ajaxart.log_str += log_message + "\n\r";

		if (type == "") type = "general";
		if (ajaxart.logs[type] == null)
			ajaxart.logs[type] = [];
//		if (type=="error") debugger;
		ajaxart.logs[type].push(message);
		if (type == "error" && ajaxart.debugmode)
			debugger;
		
//		if (ajaxart.log_level == "error" && type == "warning") return;
		if (!window.jBartNodeJS)
			$("#ajaxart_log").append($("<div class='aa_log " + type + "'>"+ajaxart.xmlescape(log_message)+"</div>"));
		
		try {
		  jBart.trigger(jBart,'log',{ message: message, type: type});
		} catch(e) {}

		if (type=='error' && window.console) console.log('error - ' + log_message);
		if (type == 'error' && ajaxart.jbart_studio) {	// adding error sign
			setTimeout( function() {
				jQuery(".fld_toolbar_errors_sign").removeClass("hidden"),1
			});
		}
	}



ajaxart.isArray = function (obj) 
{
	return Object.prototype.toString.call( obj ) === '[object Array]';
}



ajaxart.make_array = function (input_array,func,workWithEmptyInput)
	{
		var result = [];
		ajaxart.each(input_array,function(item) {
			var myitem = func([item]);
			if (ajaxart.isArray(myitem))
				ajaxart.concat(result,myitem);
			else if (myitem != null)
		      result.push(myitem);
		});
		if (input_array.length == 0 && (typeof workWithEmptyInput == "undefined" || workWithEmptyInput == true))
		{
			var myitem = func([]);
			if (myitem != null)
				result.push(myitem);
		}
		return result;
	}



ajaxart.childElem = function (parent,elemName)
{
	if ( parent == null || parent.childNodes == null ) return null;
	var node = parent.firstChild;
	while (node)
	{
		if (node.nodeType == 1) {
			if (elemName == "*") return node;
			if (node.tagName == elemName) return node; 
		}
		node=node.nextSibling;
	}
	return null;
}



ajaxart.newContext = function () {
	return { vars: {_Images: [aa_base_images()] ,_Lib: [aa_base_lib()]} , params: [] ,componentContext: null};
}



ajaxart.dynamicText = function (data,str,context,origData,booleanExpression,xmlescape) 
{
    function expand(data,func,isFirst) {
    	var result = [];
    	for(var i=0;i<data.length;i++)
    		result = result.concat(func(data[i]))
    	if (!data.length && isFirst)
    		result = [func()];

    	return result;
    }
    function xpathFilterForObjects(item,filterExp) {
    	function opValue(op) {
    		var str_match = op.match(/'[^']*'/) || op.match(/"[^"]*"/);
    		if (str_match) return op.slice(1,-1);
    		return ''+item[op];
    	}
    	var equal_exp = filterExp.match(/([^!=]*)(=|!=|==)(.*)/);
    	if (!equal_exp) return false;
    	var oper = equal_exp[2];
    	var op1 = opValue(equal_exp[1]);
    	var op2 = opValue(equal_exp[3]);
   		return 	(oper == '=' && op1 == op2) || 
				(oper == '==' && op1 == op2) ||
				(oper == '!=' && op1 != op2);
    	return false;
    }
    function calcExp(exp) {
		var createIfNotExist = false,byRef=false;
		if (exp[0] == '=') // e.g =Min(person/@age)
			return expand(data,function(elem) { 
				return ajaxart.dynamicTextWithAggregator(elem,exp,context);
			},true);
		if (exp.indexOf('{') != -1 && exp.match(/{[^}]*}/)) // inner vars
			exp = ajaxart.totext(ajaxart.dynamicText(data,exp.replace(/(^|[^\\]){/g,'$1%')
					.replace(/(^|[^\\])}/g,'$1%')
					.replace(/\\({|})/g,'$1'),context));
    	var items = exp.split('/'); // xpath pipline
    	var result = data;
    	for(var i=0;i<items.length;i++) {
    		var item = items[i];
   			var is_hash_filter = item.indexOf('[#') > -1;
    		var filter_match = null;
    		if (item.indexOf('[') != -1) {
    			filter_match = item.match(/([^\[]*)(\[[^\]]*\])/); // elem[@id=15]
    			if (filter_match) item = is_hash_filter ? filter_match[0] : filter_match[1];
    		}
    		if (item.charAt(0) == '!') { 
    			createIfNotExist = true; item = item.substr(1);
    		}
    		if (item.charAt(0) == '>') { 
    			byRef = true; item = item.substr(1);
    		}
    		if (item.charAt(0) == '$') {
    			result = ajaxart.getVariable(context,item.substr(1));
    		} else if (result[0] && result[0].nodeType && result[0].nodeType == 1 && !createIfNotExist && exp.indexOf('/!') == -1 && ! ajaxart.ishtml_item(result[0]) ) { // xml xpath
    			var remaining_xpath = items.slice(i).join('/');
    			return expand(result,function(elem) { 
    				return ajaxart.xml.xpath(elem,remaining_xpath);
    			});
    		} else if (item == '') { 
    			result = result;
    		} else { // 'path1/path2'
    			result = expand(result,function(elem) { 
    				if (elem.nodeType && !ajaxart.ishtml(elem)) return ajaxart.xml.xpath(elem,item,createIfNotExist);
   					var res = elem[item];
    				if (ajaxart.isObject(elem)) { // JSON support
    					if (item == '..' && elem.ParentNode) return [elem.ParentNode()];
						var last = i == items.length -1;
						if (last && byRef) 
							return [ aa_new_JsonByRef(elem,item) ];
						if (res == null && createIfNotExist) res = elem[item] = {};
					}
   					if (res == null) return [];
   					return ajaxart.isArray(res) ? res: [res]; 
    			});
    		}
    		if (filter_match) {
    			var index = parseInt(filter_match[2].slice(1,-1));
    			if (isNaN(index))
    				result = expand(result,function(elem) { 
    					if (is_hash_filter) return [elem];
    					if (elem.nodeType)
    						return ajaxart.xml.xpath(elem,'self::*'+filter_match[2],createIfNotExist);
    					return xpathFilterForObjects(elem,filter_match[2].slice(1,-1)) ? [elem] : [];
    				});
    			else
    				result = result.slice(index-1,index);
    		}
    	}
    	return result;
    }
	if (!str.match(ajaxart.STRING_WITH_EXP)) return [str.replace(/\\%/g,'%')];
	if (str == "%%") return data;
	var oneVar = str.match(/^%\$([a-zA-Z_0-9]+)%$/); // 12% performance boost
	if (oneVar) {
		var result = ajaxart.getVariable(context,oneVar[1]);
		//if (booleanExpression) 
		//	return result[0] ? ['true'] : ['false'];
		return result;
	}
		
    var arr = str.split("%");
    var escaped=[], i=0;
    while (i < arr.length) { // unifying segments - handle escaped \%
        var segment = arr[i];
        while (segment.substr(-1) === '\\' && i < arr.length-1)
            segment = segment.slice(0,-1) + '%' + arr[++i];
        escaped.push(segment);
        i++;
    }
    if (escaped.length == 2) return [str]; // non closing %
    if (escaped.length == 3 && escaped[0] == '' && escaped[2] == '') { // one variable - return array result
    	try {
    		return calcExp(escaped[1]);
    	} catch(e) {
//    		debugger;
    	}
    }
    var result=[], in_expression = false;
    for(var i=0;i<escaped.length;i++) {
        var segment = escaped[i];
        if (!in_expression) {
            result.push(segment);
            in_expression = true;
        } else if (segment.match(ajaxart.NOT_EXP)) { // auto escaped %. non-closing % followed by space/comma/etc  
            result.push('%' + segment)
            in_expression = true;
        } else {
        	try {
        		var item_to_add = ajaxart.totext_array(calcExp(segment));
                if (booleanExpression) {
                	// wrap with '' if not a number
                	// example: %@type% == 'company' ==> 'company' = 'company'
                	// example: %@%count% > 4        ==> 5 > 4
                	if (! item_to_add.match(/^([0-9]+|[0-9]*\.[0-9]+)$/) )
                		item_to_add = "'" + item_to_add.replace(/'/g, "\\'") + "'";
                }
	            if (xmlescape) item_to_add = ajaxart.xmlescape(item_to_add);
       			result.push(item_to_add);
        	} catch(e) {
//        		debugger;
        	}
            in_expression = false;
        }
    }
    return [result.join('')];
}



ajaxart.clone_context = function (context)
{
	var new_context = ajaxart.newContext();
	for (i in context.vars) {
	   	if (context.vars.hasOwnProperty(i))
			new_context.vars[i] = context.vars[i];
	}
	new_context.params = context.params;
	new_context.componentContext = context.componentContext;
	new_context._This = context._This;
	
	return new_context;
}



ajaxart.compile = function (script, field ,context,paramVars,isReadOnly, bool) {
	if (ajaxart.xtmls_to_trace.length > 0 || script == null) return null;
	if (!script) return;
	
	var fieldscript = ajaxart.fieldscript(script,field,true);
	if (fieldscript == null) return function(context) { return [];};
	
	var value = null;
	if (fieldscript.nodeType == 1) {
	  var extraAttrs=0;
	  if (aa_hasAttribute(fieldscript,'name')) extraAttrs=1;
	  if (aa_hasAttribute(fieldscript,'paramVars') ) extraAttrs=1;
	  
	  if (fieldscript.attributes.length == 2+extraAttrs && fieldscript.getAttribute("t") == "xtml.UseParam" && fieldscript.firstChild == null) {
		  var param = fieldscript.getAttribute("Param");
		  if (aa_hasAttribute(fieldscript,'Param')) {
			var paramScript = context.params[param];
  		    if (!paramScript || !paramScript.script || ajaxart.isArray(paramScript) ) return null;
  		    if (paramScript.compiled == "same") return "same";
  	        return function(data,context1) {
  	  	  	    var newContext = {};
  		  	    newContext.vars = context1.vars;
  		  	    newContext.params = context.componentContext.params;
  		  	    newContext.componentContext = context.componentContext.componentContext;
  		  	
  		  	    if (paramScript.compiled == null)  
  		  	    	return ajaxart.run(data,paramScript.script,"",newContext);
  	            else
  	            	return paramScript.compiled(data,newContext);
  	        };
		  };
  	      return null;
	  }
	  if (fieldscript.attributes.length <= 3+extraAttrs && fieldscript.getAttribute("t") == "xtml.RunXtml" && fieldscript.firstChild == null) {
		  return aa_compile(fieldscript);
	  }
  	  if (fieldscript.getAttribute("t") == "uiaspect.JavaScriptControl" ) {
      	var func_name = aa_text([],fieldscript,'FunctionName',context);
      	if (func_name != "" && window[func_name] == null) { ajaxart.log("function " + func_name + " does not exist","error"); return []; }
    		return function(data,context) { 
    			var control = jQuery(aa_text(data,fieldscript,'Html',context));
    			if (window[func_name] == null) return control;
    			else return [window[func_name](data,context,control)] };
  	  }
	  if (fieldscript.attributes.length > 1+extraAttrs || fieldscript.firstChild != null) return null;  // no compilation possible
  	  if (fieldscript.getAttribute("t") == "data.Same" ) return "same";
	  value = aa_hasAttribute(fieldscript,'value') ? fieldscript.getAttribute('value') : null;
	}
	else if (fieldscript.nodeType == 2) value = fieldscript.nodeValue;
	
	if (value == null) return null;
	
	if (value == "%%") return "same";
	if (!value.match(ajaxart.STRING_WITH_EXP))
		return function(data,context) { return [value]; };
	var items = value.split("%");
	if (items.length == 3) {
		if (items[1].charAt(items[1].length-1) == "\\" || items[2].charAt(items[2].length-1) == "\\") return null;// width:50\%, height:30\%
		if (value.charAt(0) == '%' && value.charAt(value.length-1) == '%' ) { // xpath
			if (value.charAt(1) == '@') { // attribute
				if (value.indexOf('{') != -1) return;
				var attr = value.substring(2,value.length-1);
				if (isReadOnly) {
					var myFunc = function(attr) { return function(data,context) {
						var out = [];
						for(var i=0;i<data.length;i++) {
							var item = data[0];
							if (typeof(item.nodeType) == "undefined" || item.nodeType != 1) continue;
							if (aa_hasAttribute(item,attr)) out.push(value);
						}
						return out;
					} };
					return myFunc(attr);
				}
				var myFunc = function(attr) { return function(data,context) {
					var out = [];
					for(var i=0;i<data.length;i++) {
						var item = data[0];
						if (typeof(item.nodeType) == "undefined" || item.nodeType != 1) continue;
						var atts = item.attributes;
						for (var j = 0; j < atts.length; j++)
						  if (atts.item(j).nodeName == attr)
							out.push(atts.item(j));
					}
					return out;
				} };
				return myFunc(attr);
			}
			return null;
		}
		if (!bool ) { // text with prefix && suffix. Not for boolean,e.g: %%=='Europe' ==> Europe=='Europe' and not 'Europe'=='Europe'
			var prefix = items[0];
			var suffix = items[2];
			var xpath = items[1];
			if (xpath.length == 0) { // text
				var myFunc = function(prefix,suffix) { return function(data,context) { return [prefix+ajaxart.totext_array(data)+suffix]; } }
				return myFunc(prefix,suffix);
			}
		}
	}
	return null;
}



ajaxart.parsexml = function (contents, filename, errorMsgOut, onlyWarning,baseXml)
{
	if ( ajaxart.isxml(contents) ) {
		if (contents.nodeType == 9) // document
			return contents.firstChild;
		return contents;
	}
	filename = filename || '';
    if ( typeof contents != "string" ) return contents;
    var parsing_error_level = onlyWarning ? 'warning' : 'error';
		if (!contents) return null;
   	var doc;
 	try {
 	// fix parsing bug that &#xd;-->\r and not \n
 		contents = contents.replace(/&#xa;&#xd;/g, "&#xa;").replace(/&#xd;&#xa;/g, "&#xa;").replace(/&#10;&#13;/g, "&#xa;").replace(/&#13;&#10;/g, "&#xa;");
		if (contents.indexOf('<') > 0)
			contents = contents.substring(contents.indexOf('<'));
		// contents = contents.replace(/&amp;/g, "&#26;");  // fix unescape bug 

		if (window.jBartNodeJS) return jBartNodeJS.parsexml(contents,baseXml);

		if (window.ActiveXObject && ajaxart.isIE)
		{
			doc = new ActiveXObject("MSXML2.DOMDocument");
			var loaded = doc.loadXML(contents);
			if (!loaded) {
				var message = doc.parseError.reason + doc.parseError.srcText;
				if (errorMsgOut)
					errorMsgOut.push(message);
				ajaxart.log('Error parsing xml file ' + filename + ' : ' + message + ",xml:"+ajaxart.xmlescape(contents.substring(0)+"..."),parsing_error_level);
	    	return null;
		  }	
		} 
		else if (document.implementation && document.implementation.createDocument)
		{
			    var domParser = new DOMParser();
			    doc = domParser.parseFromString(contents,"text/xml");
			    var errorMsg = null;
			    
			    var parseerrors = doc.getElementsByTagName("parsererror");//chrome & safari
			    if (parseerrors.length > 0) {
			    	errorMsg = "Error parsing xml";	//for empty error;
                	try {
                		errorMsg = parseerrors[0].childNodes.item(1).innerHTML;
                	} catch(e) { errorMsg = "Error parsing xml"; }
                }
			    if (doc.documentElement.nodeName == 'parsererror' ) {	// firefox
			    	errorMsg = doc.documentElement.childNodes.item(0).nodeValue;
			    	if (errorMsg.indexOf("Location") > 0)
			    		errorMsg = errorMsg.substring(0,errorMsg.indexOf("Location")) + errorMsg.substring(errorMsg.lastIndexOf("\n"));
			    }
                if (errorMsg != null) {
					ajaxart.log('Error parsing xml file ' + filename + ' : ' + errorMsg + ",xml:"+ajaxart.xmlescape(contents.substring(0)+"..."),parsing_error_level);
					if (errorMsgOut != null)
						errorMsgOut.push(errorMsg);
			    	return null;
			    }
		}
	}
    catch(e) {
       	ajaxart.log('Error parsing xml file: ' + e + ajaxart.xmlescape(contents.substring(0,50)+"..."),parsing_error_level);
       	return null;
    }
    var out = doc.firstChild;
    while(out.nodeType != 1 && out.nextSibling) out = out.nextSibling;

    out = aa_importNode(out, baseXml);
    
    return out;
}



ajaxart.getControlElement = function (params, single)
	{
	  var elem = ajaxart.getVariable(params,"ControlElement");
	  if (typeof(elem.controlElement) != "undefined")
		  elem = elem.controlElement;
	  
	  if (single != null && single == true) {
		  if (elem == null || elem.length == 0)
			  return null;
		  return elem[0];
	  }
	  if (elem == null) return [];
	  return elem; 
	}



ajaxart.isattached = function (elem)
	{
		if (elem == null) return false;
		if (ajaxart.isIE) return jQuery(elem).parents("body").length > 0;
		return (elem.offsetParent || jQuery(elem).parents("body").length > 0);
	}



ajaxart.totext_array = function (arr)
{
	if (arr == null || arr.length == 0) return '';
	return ajaxart.totext_item(arr[0]);
}



ajaxart.logException = function (e,prefix)
	{
		var msg = e.message || e;
		if (e.stack) {
			msg += '\n' + e.stack;
		}
		if (prefix) msg = prefix + ' - ' + msg;
		ajaxart.log(msg,'error');
	}



ajaxart.concat = function (source,toadd) {
	if (toadd == null) return;
	for(var i=0;i<toadd.length;i++)
		source.push(toadd[i]);
}



ajaxart.runNativeHelper = function (data,script,helpername,context)
{
	var new_context = ajaxart.clone_context(context);
	new_context.params = [];
	
	for (i in context.params)
	   	if (context.params.hasOwnProperty(i))
			new_context.params[i] = context.params[i];
	
	var field_script = script;
	
	var component = script.getAttribute('t');
	var global = aa_componentById(component);
	if (!global) return [];  // should not happen

  var paramDefinitions = ajaxart.childElems(global,"Param");
  new_context.componentContext = context.componentContext || context; 
	 
	for(var i=0;i<paramDefinitions.length;i++)
	{
		 var paramDef = paramDefinitions[i];
		 var param_name = aa_hasAttribute(paramDef,'name') ? paramDef.getAttribute("name") : null;
		 var param_value;

		 if (aa_hasAttribute(paramDef,"type") && (''+paramDef.getAttribute("type")).indexOf("[]") > 0)  //array
		 {
		   var param_value = [];
		   var subprofiles = ajaxart.childElems(field_script,param_name);
		       if (paramDef.getAttribute("script") != "true" ) { 
		     for(var j=0;j<subprofiles.length;j++)
			       ajaxart.concat(param_value, ajaxart.run(data,subprofiles[j],"",new_context) );
		       } else { 
		    	 param_value = { isArrayParamScript: true , script: script, field:param_name, context: new_context };
		       }
		 }
	     else if (paramDef.getAttribute("script") != "true" ) 
		   param_value = ajaxart.run(data,field_script,param_name,new_context);
         else { // script=true
           param_value = { isParamScript: true }; 
		  	 param_value.script = ajaxart.fieldscript(field_script, param_name,true,new_context);
           param_value.compiled = ajaxart.compile(param_value.script,'',new_context,paramDef.getAttribute("paramVars"));
         }

		 ajaxart.setParameterVariable(new_context,param_name,param_value);
    }
	
	var helperXml = ajaxart.xml.xpath(global,'NativeHelper[@name="'+helpername+'"]');
	if (helperXml.length > 0)
		return ajaxart.run(data,helperXml[0],"",new_context);

	ajaxart.log("calling runNativeHelper for none existing helper - " + helpername);
	return [];
}



ajaxart.xml.clone = function (xml)
{
	if (xml.length == 0) return null;
	return xml[0].cloneNode(true);
}



ajaxart.xml.copyElementContents = function (target,source)
{
	if (source.nodeType != 1 || target.nodeType != 1) return;
	// remove all children & attributes
	while(target.firstChild)
		target.removeChild( target.firstChild );
	
	while (target.attributes.length > 0)
		target.removeAttribute(target.attributes.item(0).name);
	
	// copy all attributes
	var atts = source.attributes;
	if (atts != null)
		for (var i = 0; i < atts.length; i++)
			target.setAttribute(atts.item(i).name, atts.item(i).value);

	source = aa_importNode(source,target);
	
	// copy all sub
	var childNode = source.firstChild;
	var ownerDoc = target.ownerDocument;
	while (childNode != null)
	{
		var item = childNode;
		if (typeof(childNode.cloneNode) != "undefined")
			target.appendChild(childNode.cloneNode(true));
		else if (childNode.nodeType == 3 || childNode.nodeType == 4) // text node
			target.appendChild(ownerDoc.createTextNode(childNode.nodeValue));
		
		childNode = childNode.nextSibling;
	}
}



jBart.utils.getWidgetIDFromContext = function (context)
{
	if (context.vars.WidgetId) return aa_totext(context.vars.WidgetId);
	
	var elem = context.vars._AppContext[0].AppXtml;
	while (elem && elem.tagName != 'bart_sample' && elem.tagName != 'jbart_project')
		elem = elem.parentNode;
	if (elem) return elem.getAttribute('id') || '';
	return '';
}



jBart.bind = function aa_bind(object,eventType,handler,identifier,elementForAutoUnbind) {
	if (!object) return;
	object.jbListeners = object.jbListeners || {};
	object.jbListeners.counter = object.jbListeners.counter || 0;
	var listenerID = ++object.jbListeners.counter;

	object.jbListeners[eventType] = object.jbListeners[eventType] || [];
	var listeners = object.jbListeners[eventType];

	for(var i=0;i<listeners.length;i++) {
		if (identifier && listeners[i].eventType == eventType && listeners[i].identifier == identifier) {
			listeners[i].handler = handler;
			return;
		}
  }
	listeners.push({eventType: eventType, handler: handler, identifier: identifier, listenerID: listenerID });	

	if (elementForAutoUnbind) {
		aa_addOnDetach(elementForAutoUnbind,function() { 
			aa_unbind(object,listenerID);
		});
	}

	return listenerID;
}



jBart.trigger = function aa_trigger(object,eventType,eventObject) {
	if (!object || !object.jbListeners || !object.jbListeners[eventType]) return;
	eventObject = eventObject || {};
	eventObject.eventType = eventType;
	
	var listeners = object.jbListeners[eventType];
	for(var i=0;i<listeners.length;i++) {
		try {
			listeners[i].handler.apply(object,[eventObject]);
		} catch(e) {
			ajaxart.logException(e,'error trigerring event ' + eventType);
		}
	}	
}















ajaxart.load_plugin = function (plugin_name,xtml_name)
	{
		if (xtml_name == null)
			xtml_name = "plugins/" + plugin_name + "/" + plugin_name + ".xtml?cacheKiller="+new Date().getTime();
		ajaxart.loading_objects++;
		  jQuery.ajax({
			   type: "GET",
			   url: xtml_name,
			   success: function (xtml_content) {
			  		var xtml = ajaxart.parsexml(xtml_content, xtml_name);
			  		ajaxart.load_xtml_content(xtml_name,xtml);
			  		ajaxart.object_finished_loading();
		  		},
		  		error: function (e){ 
		  			aa_handleHttpError(e,this);
					ajaxart.log("failed loading plugin " + xtml_name + "," + e.message,"error"); 
					ajaxart.object_finished_loading();
				}
		  }); 
	}



ajaxart.ready = function (func)
	{
		  ajaxart.ready_func = func;
		  if (ajaxart.loading_objects == 0 ) func();
	}



ajaxart.start = function (divId,data,script)
	{
		jQuery(document).ready(function() {
			ajaxart.ready(function() {
				if (ajaxart.urlparam('debugmode')=="true") ajaxart.debugmode = true;
				if (ajaxart.isChrome) jQuery("body").addClass('chrome');
				
			  	var scriptXml = ajaxart.parsexml(script);
			  	if (data == null) data = [""];

			  	var context = ajaxart.newContext();
			  	var result = ajaxart.run(data,scriptXml,"",context);
			  	var div = jQuery(divId).addClass("ajaxart ajaxart_topmost " + ajaxart.deviceCssClass);
			  	ajaxart.databind([div[0]],data,context,scriptXml,data);
		  		if (div.length > 0 && ajaxart.ishtml(result)) {
			  		div[0].appendChild(result[0]);
			  		aa_element_attached(result[0]);
				  	aa_register_document_events(context);
			  	} else {
			  		ajaxart.log("scriptxml did not return html","warning");
			  	}
//			  	var debugui = ajaxart.run(data,ajaxart.parsexml('<Control t="debugui.HiddenButton" />'),"",context);
			  	
			  	var loading = jQuery("#ajaxart_loading");
			  	if (loading.length > 0 && ! loading[0].IsUsed)
			  		loading.hide();
	    });
	  }); 
	}



function jbart_init() {
	(function(jQuery) {
		jQuery.fn.jBart = function(params)
		{
			return this.each(function() {
				var elem = this;
				jBart.ready(function() {
					if (!params.widget) { if (window.console) { console.error("jBart: param 'widget' is missing"); } return; };
					if (!jBartWidgets[params.widget]) { if (window.console) { console.error("jBart: '" + params.widget + " is not a valid widget"); } return; };
					jBartWidgets[params.widget].show(elem, params);
					// jBart.appendWidget(elem,params);
				});
			});
		};
	})(jQuery);
	
	var activate = function() {
		// auto inject jBart widget to jBartWidget elems
		jQuery().ready( function() {
			if (!ajaxart.ready) return; // TODO: Fix to support dynamic loading of jbart after jQuery is already loaded 
			ajaxart.ready(function() {
				jBart.ajaxart = ajaxart;
				jBart.isReady = true;
				jBart.trigger(jBart,'ready');
				jQuery().find('.jBartWidget').each(function() {
					var params = {}
					if (this.className == 'jBartWidget') return;
//					if (!(this.className + ' ').split('jBartWidget ')[1].split('jBartWidget_')[1]) return;
					var widgetId= (this.className + ' ').split('jBartWidget ')[1].split('jBartWidget_')[1].split(' ')[0];
					var WidgetVarName = 'jBartWidget_' + widgetId;
				    params.widget = window[WidgetVarName];
					if (this.className.indexOf('jBartWidgetPage_') >-1)
					  params.page= (this.className + ' ').split('jBartWidgetPage_')[1].split(' ')[0];
					
				    if (params.widget)
						jQuery(this).jBart(params);
				    else
				    	ajaxart.log('can not find widget ' + widgetId);
				  	jQuery("#ajaxart_loading").hide();
				});
			},[]);
		})
	}
	if (window.jBartPreloader)	// todo: support multiple preloaders
		window.jBartPreloader(activate);
	else
		activate();
	window.jbart_data = jbart_data;	// for use in external js
}



function aa_init_ipad(options)
{
  if (!options) options = { orientationClasses: true };
  var setOrientationClass = function() {
	  var orientation = (window.orientation == 0 || window.orientation == 180) ? "portrait" : "landscape";
	  document.body.parentNode.setAttribute('class', orientation);  
	  
	  if (ajaxart.jbart_studio) {  // design time mode
		  orientation = aa_url_attribute(window.location.href,"ipad_orient");
		  if (orientation != "portrait") orientation = "landscape";
		  jQuery('body').removeClass('portrait').removeClass('landscape').addClass(orientation);
	  } 
	  if (window.aav_onorientationchange) {
		  for(var i in window.aav_onorientationchange) window.aav_onorientationchange[i](orientation);
	  }
  }
  if (options.orientationClasses) {
	  window.onorientationchange = setOrientationClass;
	  setOrientationClass();
  }
}



function aa_visible() { return this.hidden != true }



function aa_visible_selectable() { return this.hidden != true }



function aad_jbart_data_arrived(widget_id,resource,data_as_string) {
	var data_as_xml = ajaxart.parsexml(data_as_string);
	if (!data_as_xml) return;
	var data_holder = aad_jbart_get_data_holder(widget_id,resource);
	var new_items = [];
	for (var node = data_as_xml.firstChild; node != null; node=node.nextSibling) {
		if (node.nodeType == 1) {
			new_items.push(node);
			data_holder.items.push(node);
		}
	}
	// calling on_data_arrive
	for (i in data_holder.on_data_arrive) {
		var f = data_holder.on_data_arrive[i];
		f(new_items,data_holder.items);
	}
}



jBart.ready = function (func) {
	if (jBart.isReady)
		ajaxart.ready(func,[],[]);
	else
		jBart.bind(jBart,'ready',func);
}



function jbart_data(data,multiplicity)  // multiplicity can be 'multiple' (default) or 'single'
{
	if (data == window) return [];
	var error_control = [];
	var data_as_xml = aa_convertToXml(data,"widget data", error_control);
	if (!data_as_xml && typeof(data) == 'string') return [data];
	if (!data_as_xml) return null;
	// clean atom and rss headers
	var tagName = data_as_xml.tagName.split(':').pop();
	if (tagName == 'feed' || tagName == 'rss')
	{
		// clean NS and change root tag
		var items_path = (tagName == 'feed') ? 'atom:entry' : 'channel/item';
		var items = aa_xpath(data_as_xml, items_path);
		if (items.length > 0) {
			var result = '<top>';
			for(var i in items)
				result += ajaxart.xml.prettyPrint(items[i],'',true);
			result += '</top>';
			data_as_xml = aa_convertToXml(result,"cleaned data", error_control);
		}
	}
	if (!multiplicity || multiplicity == 'multiple')
		return aa_xpath(data_as_xml,'*');
	return [data_as_xml];
}



function aa_determine_device(userAgent) {
	if (!navigator)	navigator = { userAgent : ""};
	userAgent = userAgent || navigator.userAgent.toLowerCase();
	ajaxart.isChrome = /chrome/.test(userAgent);
	ajaxart.isIE = /msie/.test(userAgent) || /trident/.test(userAgent);
	ajaxart.isIE7 = /msie 7/.test(userAgent);
	ajaxart.isIE8 = /msie 8/.test(userAgent);
	ajaxart.isIE78 = /msie 7/.test(userAgent) || /msie 8/.test(userAgent);
	ajaxart.isSafari = /safari/.test(userAgent);
	ajaxart.isFireFox = /firefox/.test(userAgent);
	ajaxart.isOpera = /opera/.test(userAgent);
	ajaxart.isiPhone = /cpu iphone/.test(userAgent);
	ajaxart.isIDevice = (/iphone|ipad/gi).test(navigator.appVersion);
	ajaxart.isMobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
	ajaxart.isAndroid = /android/.test(userAgent);
	ajaxart.deviceCssClass = "";
	if (ajaxart.isChrome) ajaxart.deviceCssClass += " chrome";
	if (ajaxart.isIE) ajaxart.deviceCssClass += " ie";
	if (ajaxart.isIE7) ajaxart.deviceCssClass += " ie7";
	if (ajaxart.isIE8) ajaxart.deviceCssClass += " ie8";
	if (ajaxart.isSafari) ajaxart.deviceCssClass += " safari";
	if (ajaxart.isFireFox) ajaxart.deviceCssClass += " firefox";
	if (ajaxart.isiPhone) ajaxart.deviceCssClass += " iphone";
	if (ajaxart.isIDevice) ajaxart.deviceCssClass += " idevice";
    try {
       document.createEvent("TouchEvent");
       ajaxart.isTouch = true;
    } catch (e) {
    	ajaxart.isTouch = false;
    }
}







function aa_screen_size(consider_design_time_simulator_view)
{
	if (consider_design_time_simulator_view) {
		var elem = aa_body();
		if (elem != document.body)
			return { width: $(elem).width(), height: $(elem).height()	};
	}
	var screenWidth = window.innerWidth || (document.documentElement.clientWidth || document.body.clientWidth);
	var screenHeight = window.innerHeight || (document.documentElement.clientHeight || document.body.clientHeight);
	return { width:screenWidth, height:screenHeight };
}



jBart.aa_crossdomain_call = function aa_crossdomain_call(params, use_jsonp)
{
	if (!use_jsonp) {
		params.type = params.type || 'GET';
		var request = jQuery.browser.msie ? new window.XDomainRequest() : new XMLHttpRequest();
        function handler(evtXHR) {
		    var request = this;
			if (request.readyState == 4 && params.success) 
				params.success(request.responseText,request.status);
		}
		if (jQuery.browser.msie) {
			request.open(params.type, params.url);
			request.onload = function(evtXHR) {
				if (this.responseText && params.success)
					params.success(this.responseText);
				if (!this.responseText && params.error)
					params.error();
			}
		} else {
			request.open(params.type, params.url, true);
			request.onreadystatechange = handler;
		}
		if (request.setRequestHeader)	// IE9 doesn't support this method
			request.setRequestHeader('Content-Type',params.dataType || 'text/plain; charset=utf-8');
		if (params.type == 'POST')
			request.send(params.data);
		else
			request.send();
	  ajaxart.log("calling crossdomain, type:" + params.type + ", \nurl:" + params.url + ",\ndata:" + params.data, "http");
	}
	else {
	  if (!ajaxart.jSonRequests) ajaxart.jSonRequests = {}
	  if (!ajaxart.jsonReqCounter) ajaxart.jsonReqCounter = 0;
	  window.aa_jsonp_callback = function(server_content,id,url)
	  {
	  	 if (ajaxart && ajaxart.jSonRequests[id]) {
	  		  ajaxart.jSonRequests[id].success(server_content);
	  		ajaxart.jSonRequests[id] = null;
	  	 }
	  }
	  ajaxart.jsonReqCounter = (ajaxart.jsonReqCounter + 1) % 1000;
	  ajaxart.jSonRequests[ajaxart.jsonReqCounter] = params; 
	  var url = params.url + '&aa_req_id=' + ajaxart.jsonReqCounter;
	  if (params.type == "POST" && params.data)
		  url = url + "&aa_postdata=" + encodeURIComponent(params.data);
	  jQuery.ajax( { cache: false ,dataType: 'script', httpHeaders : [], url: url, 
	  	error: function(jqXHR, textStatus, errorThrown) {
	  		params.error(textStatus + " " + errorThrown);
	  	} });
	}
}



function aa_crossdomain_call(params, use_jsonp)
{
	if (!use_jsonp) {
		params.type = params.type || 'GET';
		var request = jQuery.browser.msie ? new window.XDomainRequest() : new XMLHttpRequest();
        function handler(evtXHR) {
		    var request = this;
			if (request.readyState == 4 && params.success) 
				params.success(request.responseText,request.status);
		}
		if (jQuery.browser.msie) {
			request.open(params.type, params.url);
			request.onload = function(evtXHR) {
				if (this.responseText && params.success)
					params.success(this.responseText);
				if (!this.responseText && params.error)
					params.error();
			}
		} else {
			request.open(params.type, params.url, true);
			request.onreadystatechange = handler;
		}
		if (request.setRequestHeader)	// IE9 doesn't support this method
			request.setRequestHeader('Content-Type',params.dataType || 'text/plain; charset=utf-8');
		if (params.type == 'POST')
			request.send(params.data);
		else
			request.send();
	  ajaxart.log("calling crossdomain, type:" + params.type + ", \nurl:" + params.url + ",\ndata:" + params.data, "http");
	}
	else {
	  if (!ajaxart.jSonRequests) ajaxart.jSonRequests = {}
	  if (!ajaxart.jsonReqCounter) ajaxart.jsonReqCounter = 0;
	  window.aa_jsonp_callback = function(server_content,id,url)
	  {
	  	 if (ajaxart && ajaxart.jSonRequests[id]) {
	  		  ajaxart.jSonRequests[id].success(server_content);
	  		ajaxart.jSonRequests[id] = null;
	  	 }
	  }
	  ajaxart.jsonReqCounter = (ajaxart.jsonReqCounter + 1) % 1000;
	  ajaxart.jSonRequests[ajaxart.jsonReqCounter] = params; 
	  var url = params.url + '&aa_req_id=' + ajaxart.jsonReqCounter;
	  if (params.type == "POST" && params.data)
		  url = url + "&aa_postdata=" + encodeURIComponent(params.data);
	  jQuery.ajax( { cache: false ,dataType: 'script', httpHeaders : [], url: url, 
	  	error: function(jqXHR, textStatus, errorThrown) {
	  		params.error(textStatus + " " + errorThrown);
	  	} });
	}
}



jBart.activator = function (widgetSource) {
	// https://docs.google.com/a/artwaresoft.com/document/d/1SBPGSmYhLuwhxH9H7LtdOKsQ5VN4SdcqBMl1V3G6Kmc/edit#heading=h.k74m6lqj4kpw
	return {
		show: function(div,params) {
			div = jQuery(div)[0];
			var jbartObject = this;
			jBartPreloader(function () {
				if (!params) params = {};
				if (!params.widget_src)
					params.widget_src = widgetSource;
				jBart.appendWidget(div,params,jbartObject);				
				jbartObject._initialized = true;
			});
		},
		init: function(settings) {
			var jbartObject = this;
			settings = settings || {};
			jBartPreloader(function () {
				aa_jbart_init_activator(jbartObject,settings);
			});
		},
		showPage: function(div,settings) {
			// must be called after init
			div = jQuery(div)[0];
			if (!this.isInitialized()) return;
			aa_jbart_activator_showPage(this,div,settings);			
		},
		isInitialized: function() { 
			return !!this.Context;
		},
		jBart: jBart,
		_widgetSource: widgetSource
	}
}



jBart.xpath = function (xml,xpath,createIfDoesNotExist) {
	return aa_xpath(xml,xpath,createIfDoesNotExist);
}



jBart.parsexml = function (contents,baseXml) { return ajaxart.parsexml(contents,'','',false,baseXml); }



function aa_extendJQuery() {
	jQuery.fn.firstOfClass = function(className) {
		var classNameWithSpaces = ' ' + className + ' ';
		var out = this[0] && recursiveIteration(this[0]);
		return out ? jQuery(out) : jQuery([]);

		function recursiveIteration(elem) {
			if (elem.nodeType != 1) return null;
			var elemClasses = elem.className;
			if (elemClasses === className) return elem;
			if (elemClasses.indexOf(className) >-1 && (' '+elemClasses+' ').indexOf(classNameWithSpaces) > -1) return elem;

			for(var child=elem.firstChild;child;child=child.nextSibling) {
				var result = recursiveIteration(child);
				if (result) return result;
			}
			return null;
		}
	}
}



function aa_runFromNodeJS(widgetXml,profileStr,data) {

	window.aa_hasAttribute = function(xml,attr) {
		console.log('mik mak');
		return xml.getAttribute(attr) != 'null';
	}

	var context = aa_create_jbart_context({
		WidgetXml: ajaxart.parsexml(widgetXml),
		Language: '',
		jbartObject: {}
	});
	var input = data ? [data] : [];
	return aa_text(input,ajaxart.parsexml(profileStr),'',context);
}



function aa_xpath_jb_llamalab()
{
	var userAgent = navigator.userAgent.toLowerCase();
	var isIE = /msie/.test(userAgent) || /trident/.test(userAgent)
	if (!userAgent.match(/android [12]/) && !isIE) return;	// only for IE and old Android

// (C) 2009 henrik.lindqvist@llamalab.com

(function(ap){if(!ap.every){ap.every=function(fn,thisp){for(var l=this.length,i=0;--l>=0;i++)
if(i in this&&!fn.call(thisp,this[i],i,this))return false;return true;};}
if(!ap.filter){ap.filter=function(fn,thisp){var r=[];for(var l=this.length,i=0,v;--l>=0;i++)
if(i in this&&fn.call(thisp,v=this[i],i,this))r.push(v);return r;};}
if(!ap.forEach){ap.forEach=function(fn,thisp){for(var l=this.length,i=0;--l>=0;i++)
if(i in this)fn.call(thisp,this[i],i,this);};}
if(!ap.indexOf){ap.indexOf=function(e,i){var l=this.length;i=(i<0)?Math.ceil(i):(i>0)?Math.floor(i):0;if(i<0)i+=l;for(;i<l;i++)
if(i in this&&this[i]===e)return i;return-1;};}
if(!ap.lastIndexOf){ap.lastIndexOf=ap.lastIndexOf=function(e,i){var l=this.length;if(isNaN(i))i=l-1;else{i=(i<0)?Math.ceil(i):Math.floor(i);if(i<0)i+=l;else if(i>=l)i=l-1;}
for(;i>=0;i--)
if(i in this&&this[i]===e)return i;return-1;};}
if(!ap.map){ap.map=function(fn,thisp){var l=this.length,r=new Array(l);for(var i=0;--l>=0;i++)
if(i in this)r[i]=fn.call(thisp,this[i],i,this);return r;};}
if(!ap.some){ap.some=function(fn,thisp){for(var l=this.length,i=0;--l>=0;i++)
if(i in this&&fn.call(thisp,this[i],i,this))
return true;return false;};}
['join','concat','pop','push','reverse','shift','slice','sort','splice','unshift','indexOf','lastIndexOf','filter','forEach','every','map','some'].forEach(function(n){if(!Array[n])
Array[n]=new Function('return Function.prototype.call.apply(Array.prototype.'+n+', arguments)');});})(Array.prototype);


// (C) 2009 henrik.lindqvist@llamalab.com

(function(w,f){function XPath(e){this.e=e;this.i=0;this.js=['with(XPath){return ','}'];this.expression(1,1)||this.error();return new Function('n','nsr',this.js.join(''));}
XPath.ie=/MSIE/.test(navigator.userAgent);XPath.prototype={match:function(rx,x){var m,r;if(!(m=rx.exec(this.e.substr(this.i)))||(typeof x=='number'&&!(r=m[x]))||(typeof x=='object'&&!(r=x[m[1]])))return false;this.m=m;this.i+=m[0].length;return r||m;},error:function(m){m=(m||'Syntax error')+' at index '+this.i+': '+this.e.substr(this.i);var e;try{e=new XPathException(51,m)}
catch(x){e=new Error(m)}
throw e;},step:function(l,r,s,n){var i=3;if(this.match(/^(\/\/?|\.\.?|@)\s*/,1)){switch(this.m[1]){case'/':if(s)this.error();if(!n)return this.step(l,r,1);this.js.splice(l,0,' axis(axes["','document-root','"],');i+=this.nodeTypes.node.call(this,l+i);s=1;break;case'//':if(s)this.error();this.js.splice(l,0,' axis(axes["','descendant-or-self','"],');i+=this.nodeTypes.node.call(this,l+i);s=1;break;case'.':if(!s&&!n)this.error();this.js.splice(l,0,' axis(axes["','self','"],');i+=this.nodeTypes.node.call(this,l+i);s=0;break;case'..':if(!s&&!n)this.error();this.js.splice(l,0,' axis(axes["','parent','"],');i+=this.nodeTypes.node.call(this,l+i);s=0;break;case'@':if(!s&&!n)this.error();this.js.splice(l,0,' axis(axes["','attribute','"],');i+=this.nodeTest(l+i,'node')||this.error('Missing nodeTest after @');s=0;}}
else if(!s&&!n)return s?this.error():0;else if(this.match(/^([a-z]+(?:-[a-z]+)*)\s*::\s*/,XPath.axes)){this.js.splice(l,0,' axis(axes["',this.m[1],'"],');i+=this.nodeTest(l+i,(this.m[1]=='attribute')?'node':'element')||this.error('Missing nodeTest after ::');s=0;}
else if(i=this.nodeTest(l,'element')){this.js.splice(l,0,' axis(axes["','child','"],');i+=3;s=0;}
else return 0;for(var j;j=this.predicate(l+i);i+=j);if(n)this.js.splice(r+i++,0,n);i+=this.step(l,r+i,s);this.js.splice(r+i++,0,')');return i;},expression:function(l,r,p){var o,i=this.operand(l);while(o=this.match(/^(or|and|!?=|[<>]=?|[|*+-]|div|mod)\s*/,this.operators)){if(p&&p[0]>=o[0]){this.i-=this.m[0].length;break;}
this.js.splice(l,0,o[1]);i++;this.js.splice(l+i++,0,o[2]);i+=this.expression(l+i,r,o)||this.error('Missing operand');this.js.splice(l+i++,0,o[3]);}
return i;},operand:function(l){if(this.match(/^(-?(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)|"[^"]*"|'[^']*')\s*/,1)){this.js.splice(l,0,this.m[1]);return 1;}
var fn;if(fn=this.match(/^([a-z]+(?:-[a-z]+)*)\s*\(\s*/,this.functions)){var i=1,j;this.js.splice(l,0,fn[1]);do{if(j)this.js.splice(l+i++,0,',');i+=(j=this.expression(l+i,l+i));}while(j&&this.match(/^,\s*/));this.match(/^\)\s*/)||this.error('Missing (');if(fn[0]){if(j)this.js.splice(l+i++,0,',');this.js.splice(l+i++,0,fn[0]);}
if(fn[2])this.js.splice(l+i++,0,fn[2]);else if(j>1)this.error('Function has arguments');i+=this.step(l,l+i);return i;}
if(this.match(/^\(\s*/)){var i=1;this.js.splice(l,0,'(');i+=this.expression(l+i,l+i);this.match(/^\)\s*/)||this.error('Missing )');this.js.splice(l+i++,')');return i;}
return this.step(l,l,0,'[n]');},operators:{'|':[1,'union(',',',')'],'or':[1,'bool(',')||bool(',')'],'and':[2,'bool(',')&&bool(',')'],'=':[3,'compare(eq,',',',')'],'!=':[3,'compare(ne,',',',')'],'<':[4,'compare(lt,',',',')'],'>':[4,'compare(gt,',',',')'],'<=':[4,'compare(le,',',',')'],'>=':[4,'compare(ge,',',',')'],'+':[5,'number(',')+number(',')'],'-':[5,'number(',')-number(',')'],'*':[6,'number(',')*number(',')'],'div':[6,'number(',')/number(',')'],'mod':[6,'number(',')%number(',')']},functions:{'last':[0,'nl.length'],'position':[0,'(i+1)'],'count':['nl','(','.length||0)'],'id':['n','id(',')'],'local-name':['nl','localName(',')'],'namespace-uri':['nl','namespaceURI(',')'],'name':['nl','qName(',')'],'string':['n','string(',')'],'concat':[0,'concat(',')'],'starts-with':[0,'startsWith(',')'],'contains':[0,'contains(',')'],'substring-before':[0,'substringBefore(',')'],'substring-after':[0,'substringAfter(',')'],'substring':[0,'substring(',')'],'string-length':['n','string(',').length'],'normalize-space':['n','normalizeSpace(',')'],'translate':[0,'translate(',')'],'boolean':[0,'bool(',')'],'not':[0,'!bool(',')'],'true':[0,'true '],'false':[0,'false '],'number':['n','number(',')'],'floor':[0,'Math.floor(number(','))'],'ceiling':[0,'Math.ceil(number(','))'],'round':[0,'Math.round(number(','))'],'sum':[0,'sum(',')']},predicate:function(l){var i=0;if(this.match(/^\[\s*/)){if(i=this.expression(l,l)){this.js.splice(l,0,'function(n,i,nl){with(XPath){var r=');i++;this.js.splice(l+i++,0,';return typeof r=="number"?Math.round(r)==i+1:bool(r)}},');}
this.match(/^\]\s*/)||this.error('Missing ]');}
return i;},nodeTest:function(l,t){var fn;if(fn=this.match(/^([a-z]+(?:-[a-z]+)*)\(([^)]*)\)\s*/,this.nodeTypes))
return fn.call(this,l,this.m[2]);if(this.match(/^\*\s*/))
return this.nodeTypes[t].call(this,l);return this.nodeName(l)},nodeType:function(l,t){this.js.splice(l,0,'function(n){return n.nodeType==',t,'},');return 3;},nodeTypes:{'node':function(l){this.js.splice(l,0,'null,');return 1;},'element':function(l){return this.nodeType(l,1);},'attribute':function(l){return this.nodeType(l,2);},'text':function(l){return this.nodeType(l,3);},'processing-instruction':function(l,t){if(!t)return this.nodeType(l,7);this.js.splice(l,0,'function(n){return n.nodeType==7&&n.target==',t,'},');return 3;},'comment':function(l){return this.nodeType(l,8);}},nodeName:function(l){if(!this.match(/^([a-zA-Z_]+(?:-?[a-zA-Z0-9]+)*)(?::([a-zA-Z_]+(?:-?[a-zA-Z0-9]+)*))?\s*/,1))
return 0;if(this.m[2]){this.js.splice(l,0,'function(n){if(!nsr)throw new XPathException(14);return "',this.m[2],'"==',XPath.ie?'n.baseName':'n.localName','&&nsr.lookupNamespaceURI("',this.m[1],'")==n.namespaceURI},');return 7;}
else{this.js.splice(l,0,'function(n){return/^',this.m[1],'$/i.test(n.nodeName)},');return 3;}}};XPath.order=function(l,r){var x=l.compareDocumentPosition?l.compareDocumentPosition(r):XPath.compareDocumentPosition.call(l,r);if(x&32){l=Array.prototype.indexOf.call(l.attributes,l);r=Array.prototype.indexOf.call(r.attributes,r);return(l<r)?-1:(l>r)?1:0;}
if(!x){if(l==r)
return 0;if((l=l.ownerElement)&&(r=r.ownerElement))
return XPath.order(l,r);return XPath.ie?1:0;}
return 3-((x&6)||3);};XPath.compare=function(fn,l,r){if(l instanceof Array&&r instanceof Array){var ls=l.map(this.string),rs=r.map(this.string);for(l=ls.length;--l>=0;)
for(r=rs.length;--r>=0;)
if(!fn(ls[l],rs[r]))return false;return true;}
if(l instanceof Array){for(var i=l.length;--i>=0;)
if(!fn(this[typeof r](l[i]),r))return false;return l.length>0;}
if(r instanceof Array){for(var i=r.length;--i>=0;)
if(!fn(l,this[typeof l](r[i])))return false;return r.length>0;}
if(typeof l=='boolean'||typeof r=='boolean')
return fn(this.bool(l),this.bool(r));if(typeof l=='number'||typeof r=='number')
return fn(this.number(l),this.number(r));return fn(this.string(l),this.string(r));};XPath.eq=function(l,r){return l==r};XPath.ne=function(l,r){return l!=r};XPath.lt=function(l,r){return l<r};XPath.gt=function(l,r){return l>r};XPath.le=function(l,r){return l<=r};XPath.ge=function(l,r){return l>=r};XPath.id=function(s,n){if(arguments.length==1)n=s;var nl=[];for(var id=this.string(s).split(/\s+/),i=id.length;--i>=0;)
if(s=(n.ownerDocument||n).getElementById(id[i]))
nl.push(s);return nl.sort(this.order);};XPath.localName=new Function('nl','return (nl.length&&nl[0].'+(XPath.ie?'baseName':'localName')+')||""');XPath.namespaceURI=function(nl){return(nl.length&&nl[0].namespaceURI)||'';};XPath.qName=function(nl){return(nl.length&&nl[0].nodeName)||'';};XPath.union=function(a,b){if(!a.length)return b;if(!b.length)return a;var nl=[],i=a.length-1,j=b.length-1;for(;;){switch(this.order(a[i],b[j])){case-1:nl.unshift(b[j--]);break;case 0:j--;case 1:nl.unshift(a[i--]);break;default:throw new Error('Invalid order');}
if(i<0){if(++j>0)nl.unshift.apply(nl,nl.slice.call(b,0,j));break;}
if(j<0){if(++i>0)nl.unshift.apply(nl,nl.slice.call(a,0,i));break;}}
return nl;};XPath.string=XPath.object=function(v){if(v instanceof Array&&typeof(v=v[0])=='undefined')return'';if(typeof v=='string')return v;switch(v.nodeType){case 1:case 9:case 11:return Array.prototype.map.call(v.childNodes,this.string,this).join('');default:return v.nodeValue||'';}
return String(v);};XPath.concat=function(){return Array.prototype.map.call(arguments,this.string,this).join('');};XPath.startsWith=function(a,b){return this.string(a).substr(0,(b=this.string(b)).length)==b;};XPath.contains=function(a,b){return this.string(a).indexOf(this.string(b))!=-1;};XPath.substringBefore=function(a,b){a=this.string(a);b=a.indexOf(this.string(b));return b!=-1?a.substr(0,b):'';};XPath.substringAfter=function(a,b){a=this.string(a);b=this.string(b);var i=a.indexOf(b);return i!=-1?a.substr(i+b.length):'';};XPath.substring=function(s,i,l){s=this.string(s);i=Math.round(this.number(i))-1;return(arguments.length==2)?s.substr(i<0?0:i):s.substr(i<0?0:i,Math.round(this.number(l))-Math.max(0,-i));};XPath.normalizeSpace=function(s){return this.string(s).replace(/^\s+/,'').replace(/\s+$/,'').replace(/\s+/g,' ');};XPath.translate=function(a,b,c){a=this.string(a);b=this.string(b);c=this.string(c);var o=[],l=a.length,i=0,j,x;while(--l>=0)
if((j=b.indexOf(x=a.charAt(i++)))==-1||(x=c.charAt(j)))o.push(x);return o.join('');};XPath.bool=XPath['boolean']=function(v){if(typeof v=='boolean')return v;if(v instanceof Array||typeof v=='string')return v.length>0;return Boolean(v);};XPath.number=function(v){if(v instanceof Array&&typeof(v=v[0])=='undefined')return 0;if(typeof v=='number')return v;if(typeof v=='boolean')return v?1:0;return Number(this.string(v));};XPath.sum=function(nl){var r=0,i=nl.length;while(--i>=0)r+=this.number(nl[i]);return r;};XPath.walk=function(n,nl){var x,c=n.firstChild;while(c){nl.push(c);if(x=c.firstChild)c=x;else for(x=c;!(c=x.nextSibling)&&(x=x.parentNode)&&(x!=n););}
return nl;};XPath.axes={'ancestor':function(n){var nl=[];while(n=n.parentNode)nl.unshift(n);return nl;},'ancestor-or-self':function(n){var nl=[];do{nl.unshift(n)}while(n=n.parentNode);return nl;},'attribute':new Function('n','var nl = [], a = n.attributes;if(a){attr:for(var x,i=a.length;--i>=0;){if(!(x=a[i]).specified){'+
(XPath.ie?'switch(x.nodeName){case"selected":case"value":if(x.nodeValue)break;default:continue attr;}':'continue;')+'}nl.unshift(x);}}return nl;'),'child':function(n){return n.childNodes||[];},'descendant':function(n){return this.walk(n,[]);},'descendant-or-self':function(n){return this.walk(n,[n]);},'following':function(n){var nl=[],x;while(n){if(x=n.nextSibling){nl.push(n=x);if(x=n.firstChild)nl.push(n=x);}
else n=n.parentNode;}
return nl;},'following-sibling':function(n){var nl=[];while(n=n.nextSibling)nl.push(n);return nl;},'parent':function(n){return n.parentNode?[n.parentNode]:[];},'preceding':function(n){var nl=[],x,p=n.parentNode;while(n){if(x=n.previousSibling){for(n=x;x=n.lastChild;n=x);nl.unshift(n);}
else if(n=n.parentNode){if(n==p)p=p.parentNode;else nl.unshift(n);}}
return nl;},'preceding-sibling':function(n){var nl=[];while(n=n.previousSibling)nl.unshift(n);return nl;},'self':function(n){return[n];},'document-root':function(n){return[n.ownerDocument||n];}};XPath.axis=function(fn,nt){var r,x,al=arguments.length-1,nl=arguments[al],ap=Array.prototype;for(var i=0,j,l=nl.length;--l>=0;){x=fn.call(this,nl[i++]);if(nt&&x.length)x=ap.filter.call(x,nt,this);for(j=2;j<al&&x.length;x=ap.filter.call(x,arguments[j++],this));r=r?this.union(r,x):x;}
return r||[];};XPath.cache={};function compareDocumentPosition(n){if(this==n)return 0;if(this.nodeType==2&&n.nodeType==2)
return(this.ownerElement&&this.ownerElement==n.ownerElement)?32:0;var l=this.ownerElement||this,r=n.ownerElement||n;if(l.sourceIndex>=0&&r.sourceIndex>=0&&l.contains&&r.contains){return(((l.contains(r)&&16)||(r.contains(l)&&8))|((l.sourceIndex<r.sourceIndex&&4)||(r.sourceIndex<l.sourceIndex&&2)))||1;}
var la=l,ra=r,ld=0,rd=0;while(la=la.parentNode)ld++;while(ra=ra.parentNode)rd++;if(ld>rd){while(ld--!=rd)l=l.parentNode;if(l==r)return 2|8;}
else if(rd>ld){while(rd--!=ld)r=r.parentNode;if(r==l)return 4|16;}
while((la=l.parentNode)!=(ra=r.parentNode))
if(!(l=la)||!(r=ra))return 1;while(l=l.nextSibling)
if(l==r)return 4;return 2;};if(w.Node){var np=w.Node.prototype;if(f||!np.compareDocumentPosition)
np.compareDocumentPosition=compareDocumentPosition;if(f||!np.contains){np.contains=function(n){return Boolean(this.compareDocumentPosition(n)&16);};}}
else
XPath.compareDocumentPosition=compareDocumentPosition;if(f||!w.XPathException){function XPathException(c,m){this.name='XPathException';this.code=c;this.message=m;}
var e=XPathException,p=new Error;p.toString=function(){return this.name+':'+this.message;};e.prototype=p;e.NAMESPACE_ERR=14;e.INVALID_EXPRESSION_ERR=51;e.TYPE_ERR=52;w.XPathException=e;}
if(f||!w.XPathNSResolver){function XPathNSResolver(n){this.ns={};for(var m,a,i=n.attributes.length;--i>=0;)
if(m=/xmlns:(.+)/.exec((a=n.attributes[i]).nodeName))
this.ns[m[1]]=a.nodeValue;this.ns['']=n.getAttribute('targetNamespace');}
XPathNSResolver.prototype={lookupNamespaceURI:function(p){return this.ns[p||''];}};w.XPathNSResolver=XPathNSResolver;}
if(f||!w.XPathExpression){function XPathExpression(e,nsr){this.fn=XPath.cache[e]||(XPath.cache[e]=new XPath(e));this.nsr=nsr;}
XPathExpression.prototype={evaluate:function(n,rt){return new XPathResult(this.fn(n,this.nsr),rt);}};w.XPathExpression=XPathExpression;}
if(f||!w.XPathResult){function XPathResult(r,rt){if(rt==0){switch(typeof r){default:rt++;case'boolean':rt++;case'string':rt++;case'number':rt++;}}
this.resultType=rt;switch(rt){case 1:this.numberValue=XPath.number(r);return;case 2:this.stringValue=XPath.string(r);return;case 3:this.booleanValue=XPath.bool(r);return;case 4:case 5:if(r instanceof Array){this.value=r;this.index=0;this.invalidIteratorState=false;return;}
break;case 6:case 7:if(r instanceof Array){this.value=r;this.snapshotLength=r.length;return;}
break;case 8:case 9:if(r instanceof Array){this.singleNodeValue=r[0];return;}}
throw new XPathException(52);}
var r=XPathResult;r.ANY_TYPE=0;r.NUMBER_TYPE=1;r.STRING_TYPE=2;r.BOOLEAN_TYPE=3;r.UNORDERED_NODE_ITERATOR_TYPE=4;r.ORDERED_NODE_ITERATOR_TYPE=5;r.UNORDERED_NODE_SNAPSHOT_TYPE=6;r.ORDERED_NODE_SNAPSHOT_TYPE=7;r.ANY_UNORDERED_NODE_TYPE=8;r.FIRST_ORDERED_NODE_TYPE=9;r.prototype={iterateNext:function(){switch(this.resultType){case 4:case 5:return this.value[this.index++];}
throw new XPathException(52);},snapshotItem:function(i){switch(this.resultType){case 6:case 7:return this.value[i];}
throw new XPathException(52);}};w.XPathResult=r;}
if(f||!w.XPathEvaluator){function XPathEvaluator(){}
var e=XPathEvaluator;e.prototype={createExpression:function(e,nsr){return new XPathExpression(e,nsr);},createNSResolver:function(n){return new XPathNSResolver(n);},evaluate:function(e,n,nsr,rt){return new XPathExpression(e,nsr).evaluate(n,rt);}};e.install=function(o,f){for(var k in XPathEvaluator.prototype)
if(f||!o[k])o[k]=XPathEvaluator.prototype[k];};w.XPathEvaluator=e;if(w.Document)
e.install(w.Document.prototype,f);else
e.install(w.document,f);w.XPath=XPath;}})(window,/WebKit/.test(navigator.userAgent));
}



function aa_defaults(obj,extra) {
  obj = obj || {};
  for (var elem in extra) {
    if (typeof(obj[elem]) == 'undefined' && extra.hasOwnProperty(elem))
      obj[elem] = extra[elem];
  }
  return obj;
}



function aa_popupDefaultSettings(popup,more) {
	return aa_extend({
		frameElement: popup.$el.find('.aa_popup_frame'),
		titleElement: popup.$el.find('.aa_popup_title'),
		contentsElement: popup.$el.find('.aa_popup_contents'),
		closeElement: popup.$el.find('.aa_popup_close'),
		defaultLocation: aa_popupCenterLocation()
	},more);	
}



function aa_remove(elem,cleanMemoryLeaks)
{
	if (!elem) return;
	if (elem.parentNode) elem.parentNode.removeChild(elem);
	aa_element_detached(elem);

	if (cleanMemoryLeaks)
	  jQuery(elem).remove(); // jQuery events leak in chrome as well

	if (cleanMemoryLeaks && ajaxart.isIE)  // http://msdn.microsoft.com/en-us/library/Bb250448 
	{
		function doCleanMemoryLeaks(elem) {
			if (elem.nodeType != 1) return;
		    if (elem.jbEvents && elem.detachEvent) {
		    	for(var i=0;i<elem.jbEvents.length;i++) {
		    		elem.detachEvent(elem.jbEvents[i].event,elem.jbEvents[i].callback);
		    	}
		    }
		    for (var i in elem) {
		  	  if (i.indexOf('on') == 0 || i.indexOf('jb') == 0) elem[i] = null;
	    	  if (elem['on'+i]) elem['on'+i] = null;
		  	}
		    if (elem.jBartDomProps) {
		    	for(var i=0;i<elem.jBartDomProps.length;i++) {
		    	  if (elem.jBartDomProps[i] != 'jBartDomProps')
		    	    elem[elem.jBartDomProps[i]] = null; 
		    	}
		    	elem.jBartDomProps = null;
		    }
		    
		    elem.ajaxart = elem.Cntr = elem.Data = elem.ItemData = elem.Dialog = elem.jElem = elem.Field = elem.OnDetach = elem.Contents = null;
		    elem.FieldData = elem.contentChanged = elem.CellPresentation = elem.Context = elem.jBart = null;
		    
		    var cleanAllProps = false;
	  	    if (cleanAllProps) {
	  	    	for(var i in elem) {
		  		  try {
		  			if (elem[i]) {
		  				elem[i] = null;
		  			    ajaxart.log('memomry leak - ' + i,'error');
		  			}
		  		  } catch(e) {}
	  	    	}
		  	}
	  	    try {
		      // for (var i in elem) if (elem[i]) ajaxart.log('dom element property - ' + i,"error"); 
	  	    } catch(e) {}
	  	    
		    var child = elem.firstChild;
		    while(child) {
		    	doCleanMemoryLeaks(child);
		    	child = child.nextSibling;
		    }
		}
		doCleanMemoryLeaks(elem);
		
		var tag = aa_tag(elem) && aa_tag(elem).toLowerCase();
		try {
			if (tag != 'table' && tag != 'tfoot' && tag != 'thead' && tag != 'tr')	// http://support.microsoft.com/kb/239832
				elem.innerHTML = "";
		} catch(e) {}
	}
//	if (cleanMemoryLeaks && ajaxart.isIE)  { 
//	}
}



function aa_addOnDetach(elem,func)
{
	jQuery(elem).addClass('aa_ondetach');
	elem.OnDetach = func;
}



function aa_popup_setMaxZIndex(popup) {
	var max = 20;

	if (!popup.zindex) {
		if (popup.launchingElement && $(popup.launchingElement).closest('.jbstudio_dlg').length > 0 || popup.jbStudio) {
			max = 2000;
			// we should also be jbstudio_dlg
			var otherStudioPopups = $('.jbstudio_dlg');
			for(var i=0;i<otherStudioPopups.length;i++) {
				if (otherStudioPopups[i].jbPopup == popup) continue;
				var zindex = parseInt($(otherStudioPopups[i])[0].style.zIndex || '0') || 0;
				if (!isInnerOldPopup(otherStudioPopups[i]))
					max = Math.max(max,zindex+2);
			}
			$(popup.el).addClass('jbstudio_dlg');
		} else {
			var openPopups = aa_open_popups();
			for(var i=0;i<openPopups.length;i++) {
				if (openPopups[i] != popup)
					max = Math.max(max,openPopups[i].zindex+2);
			}
		}

		popup.zindex = max+1;
	} else {
		max = popup.zindex-1;
	}
	popup.$el.css('z-index',max);
	popup.$el.children().css('z-index',max);
	$(popup.frameElement).css('z-index',max+1);	

	function isInnerOldPopup(otherElem) {
		if (otherElem.Dialog && otherElem.Dialog.Mode == 'popup' && otherElem.Dialog.onElem && aa_isParent(otherElem.Dialog.onElem,popup.frameElement))

			return true;

		return false;
	}
}



function aa_element_attached(elem)
{
  if (! ajaxart.isattached(elem)) return;
  var items = jQuery(elem).find('.aa_onattach').get();
  if (jQuery(elem).hasClass('aa_onattach')) items.push(elem);
  for(var i=0;i<items.length;i++) {
	  if (jQuery(items[i]).hasClass('aa_onattach_called')) continue;
	  if (items[i].jbOnAttach) items[i].jbOnAttach.call(items[i]);
	  jQuery(items[i]).addClass('aa_onattach_called');
  }
}



function aa_checkValidations(topElement)
{
	// https://docs.google.com/a/artwaresoft.com/document/d/1o6Uv_k3rlnm-Wp_Z7-oRVaAbfAYHcbecHzr39_0gNbU/edit#heading=h.bgjp8atg2ug5

	var validationStyle = aa_findValidationStyle(topElement);
	validationStyle.clearErrors(validationStyle,topElement);

	var scrollToMargins = validationStyle.scrollMargins || { top: 30, bottom: 30 };

	var firstTime = true;
	var elems = $(topElement).find('.aa_has_validations');
	
	var passed = true;
	var errors = [];

	for(var i=0;i<elems.length;i++) {
		var elem = elems[i];
		var errorObject = {
			passed: true,
			element: elem
		};
		aa_trigger(elem,'validation',errorObject);
		if (!errorObject.passed) {
			if (firstTime) {				
				aa_scrollToShowElement(elem,'',scrollToMargins);
				firstTime = false;
			}
			validationStyle.showValidationError(validationStyle,topElement,errorObject);
			passed = false;
			errors.push(errorObject);
		}
	}
	if (!passed) {
		validationStyle.showErrorSummary(validationStyle,topElement,errors);
	}
	return passed;
}



function aa_popupCenterLocation(settings) {
	jBart.footerHeight = jBart.footerHeight || 0;
	return aa_new_popup_feature(settings,'PopupCenterLocation',{
		setPopupLocation: function(popup) {
			var hasHeaderHeight = jBart.headerHeight && !popup.$el.hasClass('jbstudio_dlg');
			var screenWidth = window.innerWidth || (document.documentElement.clientWidth || document.body.clientWidth);
			var screenHeight = window.innerHeight || (document.documentElement.clientHeight || document.body.clientHeight);
			if (hasHeaderHeight) screenHeight -= (jBart.headerHeight+jBart.footerHeight);

			$(popup.frameElement).css('display','inline-block'); // so that width() will work
			
			var popupWidth = $(popup.frameElement).outerWidth();
			var popupHeight = $(popup.frameElement).outerHeight();

			$(popup.frameElement).css('max-width',parseInt(screenWidth * 0.9)+'px');

			if (popupWidth > screenWidth) {
				// can be relevant in mobile scenarios
				popupWidth = parseInt(screenWidth * 0.85);
				$(popup.frameElement).css('max-width',popupWidth+'px');
			}
			var $popupContents = $(popup.frameElement).find('.aa_popup_contents');
			// var maxHeight = $popupContents.css('max-height');
			// if (!maxHeight || maxHeight == 'none')
			// 	$popupContents.css('max-height',parseInt(screenHeight * 0.8)+'px');

			var left = parseInt( (screenWidth - popupWidth)/2 );
			var top = parseInt( (screenHeight - popupHeight)/2 );
			if (top<0) top = 0;
			if (left<0) left = 0;
			if (hasHeaderHeight) top += jBart.headerHeight;

			$(popup.frameElement).css('position','fixed').css('left',left+'px').css('top',top+'px');
		}
	});
}



function aa_bindBodyMouseDown(callback) {
	var obj = window.captureEvents ? window : document;
	if (obj.addEventListener) 
		obj.addEventListener('mousedown',callback,true);
	else 
		obj.attachEvent('onmousedown',callback,true);
}



function aa_unbindBodyMouseDown(callback) {
	var obj = window.captureEvents ? window : document;
	if (obj.removeEventListener) 
		obj.removeEventListener('mousedown',callback,true);
	else 
		obj.detachEvent('onmousedown',callback);
}



function aa_new_popup_feature(settings,className,prototypeFunctions) {
	aa_init_class(className,prototypeFunctions);
	return new ajaxart.classes[className](settings || {});
}



function aa_enable_move_by_dragging(draggable_frame,draggable_area,onstartdrag,onenddrag)
{
	if (!draggable_area) return;
	jQuery(draggable_area).mousedown(function(e) {
		  e = e || event;
		  if (! draggable_frame.Moving) {
			  	var right_pos = (draggable_frame.style.right.split("px").length > 1) ? draggable_frame.style.right.split("px")[0] : null;
			  	draggable_frame.Moving = { mouse_x: (e.clientX || e.pageX), mouse_y: (e.clientY || e.pageY), 
				  	frame_x: draggable_frame.offsetLeft, frame_y: draggable_frame.offsetTop, frame_right: right_pos };
			  	onstartdrag();
			  	ajaxart_disableSelection(document.body);
			  	ajaxart_disableSelection(jQuery(draggable_area).parents(".aa_dlg")[0]);
		  }
		  var mouse_move = function(e) {
			  e = e || event;
			  var top = Math.max( (e.clientY || e.pageY) - draggable_frame.Moving.mouse_y + draggable_frame.Moving.frame_y, 0);
			  draggable_frame.style.top = top + "px";
			  draggable_frame.style.bottom = 'inherit';
			  if (draggable_frame.Moving.frame_right) {	//	anchoring to the right side
				  draggable_frame.style.right = draggable_frame.Moving.frame_right - ((e.clientX || e.pageX) - draggable_frame.Moving.mouse_x) + "px";
			  } else {
				  draggable_frame.style.left = (e.clientX || e.pageX) - draggable_frame.Moving.mouse_x + draggable_frame.Moving.frame_x + "px";
				  draggable_frame.style.right = 'inherit';
			  }
		  }
		  var mouse_up = function(e) {
			  e = e || event;
			  draggable_frame.Moving = null;
			  window.onmousemove = null; window.onmouseup =null;  document.onmouseup=null; document.onmousemove=null; 
			  ajaxart_restoreSelection(document.body);
			  ajaxart_restoreSelection(jQuery(draggable_area).parents(".aa_dlg")[0]);
			  if (onenddrag) onenddrag();
		  }
		  if (window.captureEvents){ window.onmousemove = mouse_move;window.onmouseup = mouse_up; }
		  else { document.onmouseup=mouse_up;	document.onmousemove=mouse_move;  }
	  });
}



function aa_empty(elem, clearMemoryLeaks) {
  var children = [];
  while (elem.firstChild) aa_remove(elem.firstChild, clearMemoryLeaks);
  aa_clear_virtual_inner_element(elem);
}



function aa_image(image, settings) {
	if (!settings && !settings.el) return;
	if (!image && settings.hideForEmpty) aa_hide(settings.el);
	if (!image) return;
	if (image.url) image.url = image.url.replace(/_jbartImages_/g,aa_base_images());
	if (image && image.render) image.render(settings);

	if (image.needsRefreshOnResize) {
		aa_addActionOnWindowResize(settings.el,function() {
			image.refresh();
			aa_image(image,settings);
		},'refresh image');
	}
}



function aa_base_images  ()
{
	if (window.location.href.indexOf('http://localhost/ajaxart') == 0 || window.location.href.indexOf('https://localhost/ajaxart') == 0  || window.location.href.indexOf('http://localhost:8087/ajaxart') == 0)
		return 'images';
	return ajaxart.base_images || '';
}



function aa_xtml_path(elem)
{
	var path = [];
	while(elem && elem.nodeType != 9 && elem.tagName != 'Component')
	{
		if (elem.nodeType == 1) // Elem 
		{
			var id = elem.getAttribute('id') || elem.getAttribute('ns') || elem.getAttribute('Name') || elem.getAttribute('Of') || ('' + aa_index_of_element(elem));
			path.push(aa_tag(elem) + '[' + id + ']');
		}
		else if (elem.nodeType == 2) // Attribute
			path.push("@" + elem.name);
		elem = elem.parentNode;
	}
	if (elem && elem.nodeType == 1)
		path.push(elem.getAttribute('id') || elem.getAttribute('ns') + ':/');
	return path.reverse().join('/');
}



ajaxart.getVariable = function (context,varName)
{
	if (!varName) return [];
	varName = '' + varName;
	var val = context.params && context.params[varName];
	if (val) {
		if (val.isParamScript) {
			if (val.script) 
				return [val.script];
			else
				return [];
		}
		return val;
	}
	if (varName == "_This" && context._This) return [context._This];
	
	val = context.vars && context.vars[varName];
	if (val) return val;

	var func = context.vars._AppContext && context.vars._AppContext[0].Vars && context.vars._AppContext[0].Vars[varName];
	func = func || context.vars._GlobalVars && context.vars._GlobalVars[0][varName];
	if ('function' == typeof func) 
		val = func(varName,context);
	if (val) return val;
	
	return [];
}



function aa_extend(obj,extra) {
	if (!obj || !extra) return obj;
	for (var elem in extra)
		if (extra.hasOwnProperty(elem))
			obj[elem] = extra[elem];
	return obj;
}



function aa_api_object(jElem,props,objectIsNotTheElement)
{
	jElem = jQuery(jElem);
	if (objectIsNotTheElement) 
		var out = props;
	else {
		out = jElem[0];
		for(i in props) out[i] = props[i];
	}
	out.jElem = out.$el = jElem;
	out.control = out.el = jElem[0];
	jElem[0].jbApiObject = out;
	if (props)
	  if (props.context || props.Context) jElem[0].jbContext = props.context || props.Context;
	
	var props_str = 'jElem,getInnerElement,setInnerHTML,setImageSource,setImage,setOnClick,bind,trigger,control';
	for(var i in props) props_str += (','+i);
	if (!objectIsNotTheElement) aa_defineElemProperties(out,props_str); // for memory leaks
	
	out.bind = function(eventType,func) {
		this.jbListeners = this.jbListeners || [];
		this.jbListeners.push( { eventType: eventType, callback: func });
	}
	out.trigger = function(eventType,argsObject) {
		if (!this.jbListeners) return;
		for(var i=0;i<this.jbListeners.length;i++) {
			if (this.jbListeners[i].eventType == eventType)
				this.jbListeners[i].callback(argsObject);
		}
	}
	out.getInnerElement = function(classOrElement)
	{
		if (typeof(classOrElement) == 'string') {  // it is a class
			if (classOrElement == '') return this.jElem[0];
			if (classOrElement.indexOf('.') == 0)
			  return aa_find_class(this.jElem,classOrElement.substring(1))[0];
			return null;
		}
		return classOrElement || this;
	}
	out.setInnerHTML = function(classOrElement,text)
	{
		var inner = this.getInnerElement(classOrElement);
		if (inner) inner.innerHTML = text;
	}
	out.setImage = out.setImageSource = function(classOrElement,imageObject,deleteIfNoImage)
	{
		var inner = this.getInnerElement(classOrElement);
		if (inner) aa_set_image(inner,imageObject,deleteIfNoImage);
	}
	out.setOnClick = function(classOrElement,callback_func,jbart_click_behavior)
	{
		var inner = this.getInnerElement(classOrElement);
		if (!inner || !callback_func) return;
		inner.jbart_click_behavior = jbart_click_behavior;
		if (!jbart_click_behavior ) {
		  inner.onclick = function(e) {
			  if (window.aa_incapture) return false;
			  if (inner.jbLastTimeClicked) {
				  if (new Date().getTime() - inner.jbLastTimeClicked < 300) return false; // double click
			  } 
			  inner.jbLastTimeClicked = new Date().getTime();
			  callback_func.call(out,{event: e}); return false; 
		  }
		}
		else {
			// jbart click behavior
			var mouseHandlers = function(btn) { 
				  jQuery(btn).mousedown( function() {
					  var jbtn = jQuery(btn);
					  if (jbtn.attr('pressed_src') != "")
					  {
						  jbtn.attr('src',jbtn.attr('pressed_src'));
					  	  jbtn.addClass('pressed').addClass('pressing');
					  }
				  }).mouseout( function() {
					  var jbtn = jQuery(btn);
					  jbtn.removeClass('pressed');
					  jbtn.attr('src',jbtn.attr('original_src'));
				  }).mouseover( function() {
					  var jbtn = jQuery(btn);
					  if (jbtn.hasClass('pressing')) {
					    jbtn.addClass('pressed').removeClass('pressing');
						jbtn.attr('src',jbtn.attr('pressed_src'));
					  }
				  }).keydown( function(e) {
						e = e || event;
						if (e.keyCode == 13) // enter
						{
							ajaxart_stop_event_propogation(e);
							click(btn);
							return false;
						}
				  }).mouseup( function(e) {
					  var jbtn = jQuery(btn);
					  if (jbtn.hasClass('pressed') && !window.aa_incapture) callback_func();
				  });
			};
			mouseHandlers(inner);
		}
	}
	return out;
}



function aa_apply_style_js(obj,style,context,funcName)
{
	funcName = funcName || 'render';
	aa_style_context = { jElem: obj.jElem }
	if (!style.jsFunc && style.Javascript ) {
		jBart.compiledJS = jBart.compiledJS || {};
		var compiledJs = jBart.compiledJS[style.Javascript];
		if (!compiledJs) {
			compiledJs = {};
			try {
				if (style.Javascript.indexOf('function ' + funcName + '(') > -1) {
					eval('compiledJs.jsFunc = function(obj,context,funcToRun) { ' + style.Javascript + '\n return ' + funcName + '(obj,context); };');
				} else { // backward compatability
			  		eval('compiledJs.jsFunc = ' + style.Javascript);
			  	}
			} catch(e) {
				ajaxart.logException(e,'could not compile a js function ' + style.Javascript);
				if (jBart.onJsError)
					jBart.onJsError(e, style.Javascript);
			}
			jBart.compiledJS[style.Javascript] = compiledJs;
		}
		style.jsFunc = compiledJs.jsFunc;
	}
	try {
		if (style.jsFunc) return style.jsFunc(obj,context);
	} catch(e) {
		ajaxart.logException(e,'error running js code :' + style.Javascript);
		if (jBart.onJsError)
			jBart.onJsError(e, style.Javascript);
	}
}



ajaxart.fieldscript = function (script, field,lookInAttributes) 
{
	if (!field) return script;
	if (lookInAttributes && aa_hasAttribute(script,field))
		return ajaxart.xml.attributeObject(script,field);
	
	var field_script = ajaxart.childElem(script,field);
	if (!field_script) 
		field_script = aa_get_default_value(script.getAttribute("t"),field);
	return field_script;
}



function aa_get_func(code,notReturningValue) { // caching functions to save expensive calls to eval
	if (!ajaxart.functions_cache)
		ajaxart.functions_cache = {};
	if (code == "") return function(){}
	if (code.indexOf('function') != 0) {
		if (notReturningValue) code = 'function() { ' + code + '}';
		else code = 'function() { return ' + code + '}';
	}
	if (!ajaxart.functions_cache[code])
		try {
			ajaxart.functions_cache[code] = eval('f =' + code);
		} catch (e) { 
			ajaxart.log("RunJavaScript: " + e.message + '   code = ' + code, "error"); 
		}
	return ajaxart.functions_cache[code];
}



function ajaxart_multilang_run(data,script,field,context)
{
	var fieldscript = ajaxart.fieldscript(script,field,true);
	if (fieldscript == null) return [""];
	var result = null;
	if (fieldscript.nodeType == 2) {
		if (fieldscript.nodeValue.indexOf('%') != -1) {
		  result = ajaxart.dynamicText(data,ajaxart_multilang_text(fieldscript.nodeValue,context),context);

		  if (ajaxart.xtmls_to_trace.length > 0) {
		    if (field == "") { field = script.nodeName; script = aa_xpath(script,'..')[0]; }
	        if (script.getAttribute("Trace") == field) ajaxart.trace(script,data,result,context,field);
		    aa_try_probe_test_attribute(script,field,data,result,context,data);
		  }
		}
	}
	if (result == null)
	  result = ajaxart.run(data,script,field,context);
	
	if (result.length > 0) result = [ajaxart_multilang_text(ajaxart.totext_array(result),context)];
	return result;
}



function aa_calc_image_size(url,callback) {
	if (!url) return callback();

	var img = $('<img/>')[0];
	var doneCalled = false;

	img.onload = function() {
		if (!doneCalled)
			callback(img.width,img.height); 
	};

	img.onerror = function() {
		doneCalled=true;
		callback(); 
	};

	img.setAttribute('src',url);			
	if (img.width) { doneCalled = true; callback(img.width,img.height); } // already loaded
}



function aa_wix_image_url(image,settings)
{
	settings = settings || {};
	if (!image) return "";

	if (!window.Wix) {
		if (image.indexOf('//') == -1)
			image = 'http://static.wix.com/media/'+image;

		if (image.indexOf('http://static.wix.com') > -1 && settings.width) {
			//http://static.wix.com/media/9c137b_f344c7274f8bb1ea6cb75655106dc657.png_srz_198_152_75_22_0.5_1.2_75_png_srz
			var arr = image.split('.');
			var extension = arr[arr.length-1];
			image += '_srz_' + settings.width + '_' + settings.height + '_75_22_0.5_1.2_75' + extension + '_srz';
		}	

		return image;
	}

	if (image.indexOf('//') != -1)
		if (!settings.width || image.indexOf('_srz_') > -1) 
			return image;

	if (window.Wix) {
		image = image.replace(new RegExp('http://static.wix.com/media/','g'),'');

		if (image.indexOf('http://') == 0 || image.indexOf('https://') == 0) return image;

		if (settings.height || settings.width)
			return Wix.Utils.Media.getResizedImageUrl(image,settings.width,settings.height);
		else
			return Wix.Utils.Media.getImageUrl(image);
	}
	return image;
}



function aa_unbind(object,listenerID) {
	if (!object || !object.jbListeners) return;

	for(var i in object.jbListeners) {
		var listeners = object.jbListeners[i];
		if (!listeners.length) continue;

		for(var j=0;j<listeners.length;j++) {
			if (listeners[j].listenerID == listenerID) {
				listeners.splice(j,1);
				return;
			}
		}	
	}
}



function aa_register_handler(obj,event,handler,id,phase)
{
	if (obj[event] == null) obj[event] = [];
	handler.phase = phase || 0;
	var replaced = false;
	if (id)
	{
		// replace the handler if exists
		handler.Id = id;
		for(var i=0;i<obj[event].length;i++)
			if (obj[event][i].Id == id)
			{
				obj[event][i] = handler;
				replaced = true;
			}
	}
	if (! replaced)
		obj[event].push(handler);
	obj[event].sort(function(a,b) { return a.phase > b.phase ? 1 : -1; });
}



function aa_clean_global_css(css)	// makes sure '#this' is included in all expressions
{
	var index=0;
	while (1) {
		var bracket_index = css.indexOf('{',index);
		if (bracket_index == -1) break;
		var prefix = css.substring(index,bracket_index);
		if (prefix.indexOf("#") == -1) {	// must contain #
			if (prefix.lastIndexOf("*/") > -1)	// handle remarks
				prefix = prefix.substring(prefix.lastIndexOf("*/")+2);
//			prefix = prefix.replace(new RegExp("^[ \t\n\r]*"),"");	// trimming left white spaces
			if (prefix.indexOf("@") != -1) { index = bracket_index+1; continue; }	// don't touch meta classes, like @media print { input { color:green; } }
			if (aa_trim(prefix) == "from" || prefix.trim() == "to") { index = css.indexOf('}',bracket_index)+1; continue; }	// don't touch form and to: http://www.w3schools.com/css/css3_animations.asp
			var new_prefix = "#this " + prefix.split(",").join(",#this ");	// handle multiple selectors, like: input,textarea { color:red; }
			css = css.substring(0,bracket_index-prefix.length) + new_prefix + css.substring(bracket_index);
		}
		index = css.indexOf('}',bracket_index) +1;
		if (index == 0) break;
	}
	if (css.indexOf("{") == -1 && css.indexOf("}") == -1)
		css = "#this {" + css + "}";
	return css;
}



function aa_adapt_css_for_browser(css, forAllBrowsers)
{	
	if (ajaxart.isFireFox) {
		css = css.replace(/-webkit-/g,'-moz-');
	}
	if (ajaxart.isIE) {
		css = css.replace(/-webkit-box/g,'-ms-flexbox');
		css = css.replace(/-webkit-/g,'-ms-');
	}
	if (ajaxart.isOpera)
		return css.replace(/-webkit-linear-gradient/g,'-o-linear-gradient');

	if (css.indexOf("input:placeholder") != -1) {
		if (forAllBrowsers) {
			css = css.replace(/input:placeholder([^{]+\{[^}]+})/, 
				"input::-webkit-input-placeholder$1" + "\n" + 
				"input:::-moz-placeholder$1" + "\n" + 
				"input.placeholder$1 /* IE */" + "\n" + 
				"input:::-ms-input-placeholder$1 /* IE10 */");
		} else {
			if (ajaxart.isChrome) 		css = css.replace(/input:placeholder([^{]+\{[^}]+})/, "input::-webkit-input-placeholder$1");
			else if (ajaxart.isFirefox) css = css.replace(/input:placeholder([^{]+\{[^}]+})/, "input:::-moz-placeholder$1");
			else if (ajaxart.isIE10)	css = css.replace(/input:placeholder([^{]+\{[^}]+})/, "input:::-ms-input-placeholder$1");
		}
	}
	if (ajaxart.isFireFox)
		return css.replace(/([^-])box-sizing/g,'$1-moz-box-sizing');
	return css;
}



function aa_is_css_well_formed(css, error)
{
	// TODO: support css remarks
	// counting nesting brackets, ensuring there are no more closing brackets then opening brackets at any point 			
	var selector_count = 0;
	var level = 0;
	for (var j=0; j<css.length; j++) {
		if (css.charAt(j) == '{') { level++; selector_count++; }
		else if (css.charAt(j) == '}') {
			level--;
			if (level<0) {
				return false;
				if (error) error.push('Too many closing brackets in item:' + selector_count);
			}
		}
	}	
	if (level != 0) {
		if (error) error.push('Missing closing bracket');
		return false;
	}
	// Make sure there are only white spaces after the last '}'
	var suffix = css.substring(css.lastIndexOf('}')+1);
	if (suffix && !suffix.match(/\s*/) || suffix.match(/\s*/)[0] != suffix) {
		if (error) error.push('There are characters after the last closing bracket');
		return false;
	}
	return true;
}



function aa_expandCuscoVariablesMustacheStyle(text,context)
{
	if (text.indexOf('{{') == -1 || !context) return text;
	text = text.replace(/{{/g,'%').replace(/}}/g,'%');
	text = ajaxart.dynamicText([],text,context,[],false,false)[0];
	return text;
}



function aa_split(text,separator,ignoreEmptyValues) {
	var arr = text.split(separator);
	var out = [];
	for(var i=0;i<arr.length;i++)
		if (arr[i] || !ignoreEmptyValues) out.push(arr[i]);
	return out;
}



function aa_run_delayed_action(action_id,callback,delay)
{
	window.jbDelayed_actions = window.jbDelayed_actions || {};
	if (jbDelayed_actions[action_id])
		clearTimeout(jbDelayed_actions[action_id].timeoutid);

	jbDelayed_actions[action_id] = {
		timeoutid: setTimeout(function() {
			jbDelayed_actions[action_id] = null;
			callback();
		},delay || 1),
		callback: callback
	};
}



function aa_findVisualContainer(elem,context) {
	var out;
	if (context && context.vars.VisualContainer) out = context.vars.VisualContainer[0];
	else if (elem) {
		var top = $(elem).closest('.aa_visual_container')[0];
		if (top && top.jbVisualContainer) out = top.jbVisualContainer;
	}
	out = out || aa_windowVisualContainer();

	out.recalc();
	return out;
}



function aa_replaceElement(element,newControl,cleanMemoryLeaks,transition)
{
	if (element.ParentObject != null) { 
		aa_defineElemProperties(newControl,'ParentObject');
		newControl.ParentObject = element.ParentObject; 
		newControl.ParentObject[0].ControlHolder = [newControl];
	}
	if (newControl) {
		if (transition) {
			element.parentNode.appendChild(newControl);
			transition.replace(element,newControl);
		}
		else
			ajaxart.replaceXmlElement(element,newControl,true,cleanMemoryLeaks);
		aa_clear_virtual_inner_element(element);
		aa_element_attached(newControl);
		aa_element_detached(element);
	}
	return newControl;
}



function aa_fieldTitle(field ,item_data, context,ignoreHideTitle)
{
	if (field.HideTitle && !ignoreHideTitle) return ''; 
	if (field.DynamicTitle) return field.DynamicTitle(item_data,context);
	return field.Title;
}



function aa_set_image(elem,image,deleteWhenEmpty,size)
{
	if (!image) {
		if (deleteWhenEmpty) aa_remove(elem,true); 
		return; 
	}
	if (image && image.InCssClass) {
		jQuery(elem).css('display','block').addClass(image.CssClass);
		return;
	}
	if (image && (image.inSprite || image.asDivBackground) ) {
		var css = '#this { background:'+'url('+image.StaticUrl+') '+image.x+' ' + image.y + ' no-repeat; ';
		css += 'width: ' + image.width + '; height: ' + image.height + '; display:block; } ';
		
		if (image.hoverx) css += '#this:hover { background-position: ' + image.hoverx + ' ' + image.hovery + ' } ';
		if (image.activex) css += '#this:active { background-position: ' + image.activex + ' ' + image.activey + ' } ';
		jQuery(elem).addClass(aa_attach_global_css(css));
		return;
	}
	if (elem && elem.firstChild && elem.firstChild.tagName && elem.firstChild.tagName.toLowerCase() == 'img')
		return aa_set_image(elem.firstChild,image,true,size);
	if (elem && elem.tagName.toLowerCase() != 'img') {
		var imgElem = document.createElement('img');
		elem.appendChild(imgElem);
		var size2 = size || image.Size;
		if (size2) {
			size2 = size2.replace(/px/g,'');	// removing px for 
			var imageSize = size2.split(',');
			if (imageSize.length == 1) imageSize.push('0');
			for(var i in imageSize) if (imageSize[i] == '') imageSize[i] = '0';
			if (imageSize[0] != '0') elem.style.width = imageSize[0]+'px';
			if (imageSize[1] != '0') elem.style.height = imageSize[1]+'px';
		}
		return aa_set_image(imgElem,image,true,size);
	}
	if (typeof(image) == 'string') image = {StaticUrl: image, Size: ''};
	
	var src = image.StaticUrl || '';
	if (src == "") src = image.SecondUrl;
	if (src == "") {
		if (deleteWhenEmpty) aa_remove(elem,true);
		return;
	}
	elem.setAttribute('src',src);
	
	var size2 = size || image.Size;
	if (size2 == "") return;
	
	var imageSize = size2.split(',');
	if (imageSize.length == 1) imageSize.push('0');
	for(var i in imageSize) if (imageSize[i] == '') imageSize[i] = '0';
	
	aa_defineElemProperties(elem,'ImageWidth,ImageHeight');
	
	elem.ImageWidth = parseInt(imageSize[0].split('px')[0]); 
	elem.ImageHeight = parseInt(imageSize[1].split('px')[0]);
	if (elem.ImageWidth > 0) elem.width = elem.ImageWidth;
	if (elem.ImageHeight > 0) elem.height = elem.ImageHeight;
	if (elem.ImageWidth * elem.ImageHeight == 0) return;
	
	function FixImageSize(imgObj) 
	{
		var naturalWidth = imgObj.width,naturalHeight = imgObj.height;
		if (naturalWidth < elem.ImageWidth) elem.width = naturalWidth; 
		if (naturalHeight < elem.ImageHeight) elem.height = naturalHeight;
		var width = Math.min(naturalWidth,elem.ImageWidth), height = Math.min(naturalHeight,elem.ImageHeight); // IE hates img.width
		
		if (image.KeepImageProportions) {
			var ratio = naturalWidth / naturalHeight;
			var currRatio = width / height;
			if (ratio != currRatio) {
				if (naturalWidth >= naturalHeight * currRatio) {
					elem.width = elem.ImageWidth;
					elem.height = Math.floor(width / ratio);
				} else {
					elem.height = elem.ImageHeight;
					elem.width = Math.floor(height * ratio);
				}
			}
		}
	}
	  
	var imgObj = new Image(); imgObj.src = src;
	if (imgObj.complete) 
		FixImageSize(imgObj);
	else 
		elem.onload = function() { FixImageSize(imgObj);}
}



function aa_find_class(jElem,cls)
{
	if (jElem.hasClass(cls)) return jElem;
	return jElem.find('.'+cls);
}



function aa_attach_style_css(style)
{
	if (!style.CssClass) 
		style.CssClass = aa_attach_global_css(style.Css);
	return style.CssClass;
}



function aa_refresh_sibling_field(srcElement,fieldID,context)
{
	var parent = srcElement.parentNode;
	if (!parent || parent.tagName == 'body') return;
	var ctrls = $(parent).find('.fld_'+fieldID);
	if (ctrls.length > 0) {
		for(var i=0;i<ctrls.length;i++)
			aa_refresh_cell(ctrls[i],context);
	} else {
		aa_refresh_sibling_field(parent,fieldID,context);
	}
}



function aa_refresh_cell(cell,context,transition,moreVars,recreateField)
{
   var td = $(cell).hasClass('aa_cell_element') ? cell : jQuery(cell).parents('.aa_cell_element')[0];
   if (!td) return;

   aa_show(td);
   
   var newContext = td.jbContext || (td.jbApiObject && td.jbApiObject.context);
   if (moreVars) newContext = aa_ctx(newContext,moreVars);

   if (td.Refresh) return td.Refresh();
   var field = td.Field;
   if (!field) return;
   if (recreateField) {
		var xtmlSource = field.XtmlSource[0];
		var ctx2 = xtmlSource.context;
		if (moreVars) ctx2 = aa_ctx(ctx2,moreVars);
		field = aa_first(xtmlSource.input,xtmlSource.script,'',newContext);
   } else if (field.Refresh) field.Refresh([],newContext);

   var field_data = td.FieldData;
   var item_data = td.ItemData;
   var parent = jQuery(td).parents('.aa_container')[0];
   var cntr = parent ? parent.Cntr : {}; 

//   newContext = aa_ctx(context,{_Field: [field], FieldTitle: [field.Title], _Item: item_data, _Cntr: [cntr] });
   field_data = ajaxart_field_calc_field_data(field,item_data,newContext);
   
   if (transition && td.childNodes.length == 1) {
     var oldElem = td.firstChild;
     while (td.firstChild) aa_remove(td.firstChild,true);
     jBart.trigger(td,'cleanWrapper',{});
     if (td.jbRefresh) td.jbRefresh();
     ajaxart_field_createCellControl(item_data,cntr,td,td.CellPresentation,field,field_data,newContext);
     var newElem = td.firstChild;
     td.insertBefore(oldElem,td.firstChild);
     transition.replace(oldElem,newElem,context);
   }
   else {
     aa_empty(td,true);
     aa_clear_jb_classes(td);
     aa_clear_events(td);
     jBart.trigger(td,'cleanWrapper',{});
     if (td.jbRefresh) td.jbRefresh();
     
 	 if (field.AsSection && !field.HideTitle) {
 		var section = jQuery(td).parents('.aa_section')[0];
 		if (!section || !section.parentNode) return;
 		td = section.parentNode;
 		aa_empty(td,true);
	    aa_clear_jb_classes(td);
		td.appendChild(aa_buildSectionControl(cntr,field,field_data,item_data,newContext));
	 } else {
	 	 if (td.jbFrom_aa_fieldControl) {
	 	 	aa_fieldControl({Field: field, Wrapper: td, Item: item_data, FieldData:field_data, Context: newContext });
	 	 } else {
		 	ajaxart_field_createCellControl(item_data,cntr,td,td.CellPresentation,field,field_data,newContext);
		 }
	 }
   }
   aa_element_attached(td);
}



function aa_invoke_field_handlers(eventFuncs,input,e,field,field_data,extra)
{
	if (aa_incapture) return;
	if (eventFuncs)
		for(var i=0;i<eventFuncs.length;i++)
			eventFuncs[i](field,field_data,input,e,extra);
}



function aa_fixTopDialogPosition()
{
	var topDialog = aa_top_dialog();
	if (topDialog && topDialog.Dialog && topDialog.Dialog._FixDialogPosition) { topDialog.Dialog._FixDialogPosition(); return; }
	
	if (openDialogs.length == 0) return [];
	var dlgContent = openDialogs[openDialogs.length-1].dialogContent;
		var screenWidth = window.innerWidth || (document.documentElement.clientWidth || document.body.clientWidth);
		var screenHeight = window.innerHeight || (document.documentElement.clientHeight || document.body.clientHeight);
		var scrollOffsetX = 0;
		var scrollOffsetY = 0;
		// taken fron http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
		if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {  //DOM compliant
			scrollOffsetY = document.body.scrollTop;
			scrollOffsetX = document.body.scrollLeft;
	} else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
	  //IE standards compliant mode
		scrollOffsetY = document.documentElement.scrollTop;
	    scrollOffsetX = document.documentElement.scrollLeft;
	}
	if (jQuery(dlgContent).width() + aa_absLeft(dlgContent) > screenWidth ||
		jQuery(dlgContent).height() + aa_absTop(dlgContent) > screenHeight )
	{
		dlgContent.style.left = (screenWidth - jQuery(dlgContent).width())/2 + scrollOffsetX + "px";
		dlgContent.style.top = (screenHeight - jQuery(dlgContent).height())/2 + scrollOffsetY + "px";
	}
	return [];
}



ajaxart.xml.xpath = function (xml,xpath,createIfNotExist,defaultValue) 
{
	if (!xpath) return [xml];
    if (xpath.charAt(0) == "!") 
    	return ajaxart.xml.xpath(xml,xpath.substring(1,xpath.length),true);

	if (xml == null || ! ajaxart.isxml(xml) ) return [];
	var result = [];

	var isJBartXPath = xpath.indexOf('[#') > -1;

	if (isJBartXPath && !createIfNotExist) 
		return aa_xpath_with_hash(xml,xpath);

	if (!isJBartXPath) {
		try {		
			if (window.jBartNodeJS) 
				result = window.jBartNodeJS.xpath(xml,''+xpath);
			else {
				if (ajaxart.isIE && typeof(xml.selectNodes) != "undefined" ) // IE && xml
				{
					xml.ownerDocument.setProperty("SelectionLanguage", "XPath");
					var nodes = xml.selectNodes(""+xpath);
					for (var i=0;i<nodes.length;i++)
						result.push(nodes[i]);
				}	else {    
					// Firefox or html in IE
					var iter = xml.ownerDocument.evaluate(xpath, xml, null, XPathResult.ANY_TYPE, null);
					if (iter) 
					{
						var node = iter.iterateNext();
						while (node) {
							result.push(node);
							node = iter.iterateNext();
						}
					}
				}
			}
		}
		catch (e) { 
			ajaxart.log( 'error calculating xpath: ' + xpath + ", xml:" + ajaxart.xmlescape(ajaxart.xml2text(xml).substring(0,50)) + '  ' + (e.stack || ''),"warning"); 
	//		ajaxart.log( e.message,"error"); 
			}
		if (result.length > 0 && result[0].nodeType == 9) // document
			return [];
	}
	
	if (result.length == 0 && createIfNotExist)
	{
		try {
			var subpath = xpath;
			var item = xml;
			while (subpath.indexOf('/') > -1 )
			{
				var pos = subpath.indexOf('/');
				var tag = subpath.substring(0,pos);
				
				var item = ajaxart.xml.xpath(item,tag,true)[0];
				subpath = subpath.substring(pos+1);
			}
			if (subpath.charAt(0) == "@") {
				var attrName = subpath.substring(1);
				if (typeof(defaultValue) == "undefined") defaultValue=""; 
				if (attrName.indexOf('/') == -1)
					item.setAttribute(attrName,defaultValue);
			}
			else if (aa_xpath(item,subpath).length == 0) { // element
				if (subpath.indexOf('[#') > -1) {
					var pos = subpath.indexOf('[#');
					var pos2 = subpath.indexOf(']',pos);
					var tag = subpath.substring(0,pos).replace('self::','');
					var id = subpath.substring(pos+2,pos2);

					var newelem = item.ownerDocument.createElement(tag);
					newelem.setAttribute('id',id);
					item.appendChild(newelem);
				} else {
					var newelem = aa_createElement(item,subpath);
					if (typeof(defaultValue) != 'undefined' && defaultValue != "")
						newelem.appendChild(newelem.ownerDocument.createTextNode(defaultValue));
					item.appendChild( newelem );
				}
			}
			result = ajaxart.xml.xpath(xml,xpath,false);
		} catch(e) { ajaxart.log("failed create xpath item :" + xpath + "," + e.message); return []; }
	}
	
	return result;
}



function aa_cdata_value(element) {
	if (!element) return null;
	for (var child = element.firstChild; child!=null; child=child.nextSibling)
		if (child.nodeType == 4 && child.nodeValue)
			return child.nodeValue;
	return null;
}



function aa_array_lastItem(arr) {
	if (arr.length) return arr[arr.length-1];
}



function aa_valueFromCookie(name) {
	if (name == "") return null;
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return decodeURIComponent(c.substring(nameEQ.length,c.length));
	}
	return null;	
}



function aa_writeCookie(cookie,value) {
		var val = encodeURIComponent( value );
		cookie = encodeURIComponent(cookie);
		if (cookie == "") return;
		
	 	 var date = new Date();
		 date.setMonth(date.getMonth()+1);
			  
		 if (cookie != "") 
		   document.cookie = cookie+"="+val+";"+" expires="+date.toUTCString();	
}



ajaxart.runComponent = function (component,data,context) {
	context = context || ajaxart.newContext();
	data = data || [];
	var profile = ajaxart.parsexml('<xtml t="' + component + '" />');
	return ajaxart.run(data,profile,'',context);
}



function aa_register_document_events(context) {
	if (jBart.vars.document_events_registered) return;
	jBart.vars.document_events_registered = true;
  	jQuery(document).keydown(function(event) { 
  		if (event.keyCode == 18)
  			ajaxart_altPressed = true;		  		
	  	if (event.keyCode == 192 && event.ctrlKey && !event.shiftKey) { // ctrl+`  (~)
	  		ajaxart.inPreviewMode = false;
	  		if (ajaxart.gcs.debugui)
	  		  aa_run_component("debugui.ShowDebugUi",[],context);
	  	}
	  	if (event.keyCode == 192 && event.ctrlKey && event.shiftKey) { // ctrl+Shift+`  (~)
	  		aa_run_component("debugui.OpenComponent",[],context);
	  	}
	  	if (event.keyCode == 8) {
  	        var element = (typeof(event.target)== 'undefined')? event.srcElement : event.target;
	  		if (element.tagName.toLowerCase() != 'input' && element.tagName.toLowerCase() != 'textarea' && !$(event.target).hasClass('nicEdit-main')) {
	  		  ajaxart_stop_event_propogation(event);
	  		  return false;
	  		}
	  	}
	  	if (event.keyCode == 88 && ajaxart_altPressed && ajaxart.jbart_studio) { // alt+x
	  		var element = (typeof(event.target)== 'undefined')? event.srcElement : event.target;
	  		ajaxart.runComponent('xtml_dt.GlobalOpenAAEditor',[element]);
	  	}
  	});
  	jQuery(document).keyup(function(event) { ajaxart_altPressed = false; });
}



function aa_try_probe_test_attribute(script,field,data,out,context,origData)
{
   for (i=0; i<ajaxart.xtmls_to_trace.length; i++)
	   if (ajaxart.xtmls_to_trace[i].xtml.nodeType == 2 && ajaxart.xtmls_to_trace[i].xtml.nodeName == field)
		   if (ajaxart.xml.parentNode(ajaxart.xtmls_to_trace[i].xtml) == script)
			   ajaxart.fill_trace_result(ajaxart.xtmls_to_trace[i].results,data,out,context,origData);
}



function aa_trace_run_for_preview(field_script,data,out,context,origData) {
		for (i=0; i<ajaxart.xtmls_to_trace.length; i++)
		 if (field_script == ajaxart.xtmls_to_trace[i].xtml)
			 ajaxart.fill_trace_result(ajaxart.xtmls_to_trace[i].results,data,out,context,origData);

	if (jBart.previewCircuit) {
		if (ajaxart.xtmls_to_trace && ajaxart.xtmls_to_trace[0].xtml == field_script)	{ // probing current item
			jBart.previewCircuit.itemsFound++;
			if (jBart.previewCircuit.itemsFound >= jBart.previewCircuit.maxItemsToFind) {
				throw { BreakPreviewCircuit:true, message:"Calculation was cut-off after " + jBart.previewCircuit.itemsFound + " items" };
			}
		}
		if (Date.now() - jBart.previewCircuit.startTime > jBart.previewCircuit.maxTime) {
			throw { BreakPreviewCircuit:true, message:"Calculation was cut-off after " + jBart.previewCircuit.maxTime + " ms"};
		}
   }
}



function aa_componentById(id,type)
{
	if (!id) return null;
	type = type || 'components';
	var middlePos = id.indexOf('.');
	var ns = id.substring(0,middlePos);
	var compName = id.substr(middlePos+1);
	var result = ajaxart[type][ns] && ajaxart[type][ns][compName];
	if (!result) 
		ajaxart.log('Can not find : ' + id + ' in ' + type,'error');
	return result;
}







function aa_setCssText(elem,cssText)
{
  if (ajaxart.isFireFox) cssText = cssText.replace(/-webkit-/g,'-moz-');
  elem.style.cssText = cssText;
}



function aa_alert(message) {
	if (window.jBartNodeJS) return jBartNodeJS.alert(message);
	
	if ($("#aa_immediate_log").length == 0) {
		var log = $('<div id="aa_immediate_log" style="position:absolute; top:0px; background:white; z-index:3000"></div>');
		log[0].Counter = 0;
		$("body").append(log);	
		$('<span class="close">close</span>').click(function() { $("#aa_immediate_log").remove() }).appendTo(log);
	}
	if ($("#aa_immediate_log")[0]) {
		var counter = $("#aa_immediate_log")[0].Counter++;
		$("#aa_immediate_log").prepend("#" + counter + ": " + message + "<br/>");
	}
}



ajaxart.trace = function (script,input,output,context,trace_param,level) 
	{
		if (ajaxart.xtmls_to_trace.length > 0) return;	// not having trace inside aaeditor tester
		var level_int = 2;	// default
		if (level != null && !isNaN(parseInt(level)))
			level_int = parseInt(level);
		var trace_item = { isObject: true };
		message = "<b>id:</b> " + aa_xtml_path(script,"id",true);
		if (typeof(trace_param) != "undefined")
			message += "/" + trace_param;
//		message += "<br> <b>stack:</b> " + aa_st();
//		message += "<br> <b>input:</b> " + ajaxart.text4trace(input,-1,level_int) + "<br> <b>output:</b> " + ajaxart.text4trace(output,-1,level_int);
		trace_item.id = aa_xtml_path(script,"id",true);
		if (trace_param != null)
			trace_item.id += "/" + trace_param;
		trace_item.stack = aa_st();
		trace_item.input = ajaxart.text4trace(input,-1,level_int);
		trace_item.output = ajaxart.text4trace(output,-1,level_int);
		trace_item.params = [];
		trace_item.context = [];
		if (level_int > 0)
		{
			message += "<b>params:</b> <ul>";
			for (varname in context.params) {
				message += "<li>" + varname + ": " + ajaxart.text4trace(ajaxart.getVariable(context,varname),0,0) + "</li>";
				trace_item["params"].push({ isObject: true,	name:	varname, value: ajaxart.text4trace(ajaxart.getVariable(context,varname),0,level_int)});
			}
			message += "</ul>";
			message += "<br> <b>stack:</b> <ul>";
			for (varname in context.vars) {
				var txt = ajaxart.text4trace(ajaxart.getVariable(context,varname),0,level_int);
				message += "<li>" + varname + ": " + txt + "</li>";
//				if (varname == "_ServerAdapter") debugger;
				trace_item["context"].push({ isObject: true, name: varname, value: [txt] });
			}
			message += "</ul>";
			message += "<b>server data: </b>";
		}
		trace_item["context"] = trace_item["context"].reverse();
		
//		if (typeof(console) != "undefined") 
//		  console.log(message);
		
//		jQuery("#ajaxart_trace_control").append(message);
//		jQuery("#ajaxart_trace_control").append("<br><br>");
		ajaxart.traces.push(trace_item);
		
		if (!window.jBartNodeJS)
			$("#trace_bugs").html("There are traces which can cause performence problems");
	}



ajaxart.calcParamsForRunOn = function (params,runOn,startFrom)
	{
		var result = jQuery([]);
		if (ajaxart.ishtml(runOn))
			result = jQuery(runOn);
		else
		{
			runOn = ajaxart.totext(runOn);
//			runOn = runOn.replace(/ /g, "_");
			if (runOn == "") { 
				ajaxart.setVariable(params,"ControlElement",[]);
				return params;
			}
			var old_elem = [];
			if ( typeof(startFrom) != "undefined" ) 
			  old_elem = startFrom;
	    	else 
			  old_elem = ajaxart.getControlElement(params);
	    	
			if (old_elem.length > 0)
			  var baseElem = jQuery(old_elem);
			else
			  var baseElem = jQuery("body");
			
			if (runOn.indexOf('(') == -1) {
			  var jexp = "#"+runOn;
			  if (runOn.charAt(0) == ".") jexp = runOn;
			  try {
			  	var result = baseElem.find(jexp);
			  } catch(e) {
			  	ajaxart.log('RunOn bad expression ' + jexp);
			  	ajaxart.logException('RunOn bad expression',e);
			  	var result = jQuery([]);
			  }
			} else {
				var result = jQuery([]);
			}
			if (runOn.substr(0,3) == "up(") {
				jexp = runOn.substring(3,runOn.length-1);
				if (baseElem.filter(jexp).length != 0) // try ourselves first
					result = baseElem;
				else
					result = baseElem.parents(jexp).slice(0,1);
			}
			if (runOn.substr(0,2) == "$.") {
				var str = "result = baseElem" + runOn.substr(1);
				try { eval(str); } catch(e) {}
			}
			if (runOn.substr(0,7) == "updown(") {
				items = runOn.substring(7,runOn.length-1).split(",");
				if (items.length == 2) {
					var parent = baseElem.filter(items[0]); // try ourselves first
					if (parent.length == 0) 
						parent = baseElem.parents(items[0]);
					result = parent.find(items[1]);
				}
			}
			if (runOn.substr(0,5) == "down(") {
				jexp = runOn.substring(5,runOn.length-1);
				result = baseElem.find(jexp);
			}
			if (result.length == 0 && old_elem.length > 0)
			{
				baseElem.each(function() {
					if (this.getAttribute("id") == runOn)
						result = $([this]);
				});
			}
			try {
			  if (result.length == 0 && jexp) result = ajaxart.jrootElem(baseElem).find(jexp);
			  if (result.length == 0 && jexp) result = jQuery('body').find(jexp);
			} catch(e) {}
			if (result.length == 0)
				ajaxart.log("cannot locate " + jexp,"location");
		}

		var out = [];
		for(var i=0;i<result.length;i++) out.push(result[i]);

		params = ajaxart.clone_context(params);
		ajaxart.setVariable(params,"ControlElement",out);
			
		return params;
	}



ajaxart.setVariable = function (context,varName,varValue)
{
	if (varName == null) return;
	try {
		context.vars[""+varName] = varValue;
	} catch(e) { ajaxart.log("cannot set variable" + varName,"error"); }
}



ajaxart.write_profiling_at_end = function (start_time,component_id) {
		 var time_passes = new Date().getTime() - start_time;
		 if (ajaxart.profiling_of_globals[component_id] == null)
			 ajaxart.profiling_of_globals[component_id] = { calls:0, total:0 };
		 ajaxart.profiling_of_globals[component_id].calls++;
		 ajaxart.profiling_of_globals[component_id].total += time_passes;
	}



ajaxart.childElems = function (parent,elemName)
{
	var out = [];
	if ( parent == null || parent.childNodes == null ) return out;
	var node = parent.firstChild;
	while (node)
	{
		if (node.nodeType == 1) {
			if (elemName == "*") out.push(node);
			if (node.tagName == elemName) out.push(node);   
		}
		node=node.nextSibling;
	}
	return out;
}



ajaxart.setParameterVariable = function (context,varName,varValue)
{
	if (varName == null) return;
	try {
		context.params[''+varName] = varValue;
	} catch(e) { ajaxart.log("cannot set param " + varName,"error"); }
}



ajaxart.ishtml = function (item)
{
	if (!item) return false;
	if (ajaxart.isArray(item) && item.length > 0) 
		return ajaxart.ishtml_item(item[0]);
	else
		return ajaxart.ishtml_item(item);
}



ajaxart.databind = function (bindto,data,params,script,origData)
	{
		ajaxart.each(bindto,function(item) {
			if ( ! ajaxart.ishtml(item) ) return;
			var context = {};
		  	context.data = data;
		  	context.params = params;
		  	context.script = script;
		  	context.origData = origData;
		  	/*
		  	if (ajaxart.isChrome) {	// Fix grabage collection of chrome - that cleans the databinding
		  		if (typeof(ajaxart.databoundeditems) == "undefined")
		  			ajaxart.databoundeditems = [];
		  		ajaxart.databoundeditems.push(item);
		  	}
	*/
		  	if (typeof(item["ajaxart"]) == "undefined")
		  		item["ajaxart"] = context;
		  	else
		  	{
		  		if (script != null)
		  		  item["ajaxart"].script = script;
		  		if (origData != null)
		  		  item["ajaxart"].origData = origData;
		  	}
		});
	}



ajaxart.isObject = function (item) {
    if (!item || item.nodeType) return false; 
	var type =  Object.prototype.toString.call(item);
	if (type === '[object Array]' && item.length > 0) 
		return ajaxart.isObject(item[0]);
	return type === '[object Object]';
}



ajaxart.xml.parentNode = function (node)
{
	if (node.nodeType == 9) 
		return null;
	if (node.parentNode && node.parentNode.nodeType == 1)
		return node.parentNode;
	if (node.parentNode && node.parentNode.nodeType == 9)
		return null;
	if (node.ownerElement != null)
		return node.ownerElement;
	var xpath_result = ajaxart.xml.xpath(node,"..");
	if (xpath_result.length == 1) return xpath_result[0];
	return null;
}



ajaxart.isxml_array = function (arr)
{
	if (arr.length == 0) return false;
	return ajaxart.isxml_item(arr[0]);
}



ajaxart.isxml_item = function (xml)
{
	if (xml == null) return false;
	return (xml.nodeType != null);
}



function aa_xml2htmltext(xml) // faster than xml2text and supports mixed html inner text
{
	if (xml == null) return '';
	
	if (xml.nodeType == null) return xml;
	if (xml.nodeType == 2 || xml.nodeType == 3 || xml.nodeType == 4) { // Attribute or inner text
		return ajaxart.xmlescape(xml.nodeValue);
	}
	 var out = xml.xml; //IE xml
	 if (xml.nodeType != null) // outer XML/html
	 {
	  if (!out) out = xml.outerHTML; // IE html
	  if (!out) { // mozilla
			var serializer = new XMLSerializer(); // XMLSerializer() omits newlines & tabs
			out = serializer.serializeToString(xml);
	  }
	 }
	 return out;
}



ajaxart.xml.prettyPrint = function (xml,indent,compact)
{
    if (compact) indent = "";
    var newline = compact ? "" : "\r";
	if (xml == null) return "";
	if (ajaxart.isArray(xml))
	{
		if (xml.length > 0 ) return ajaxart.xml.prettyPrint(xml[0],indent,compact);
		return "";
	}

    if (typeof(indent) == "undefined") indent = "";
    if (! ajaxart.isxml(xml)) return xml;
    if (xml.nodeType == 2 || xml.nodeType == 3) 
    	return ajaxart.xmlescape(xml.nodeValue);
    if (xml.nodeType == 4) // cdata
    	return '<![CDATA[' + xml.nodeValue + String.fromCharCode(93) + ']>';	// last 2 parts are separated so this js code could be embedded in xml
    if (xml.nodeType == 8) return ''; // comment
    // head
    var out = indent + "<" + aa_tag(xml);

	var atts = xml.attributes;
	if (atts != null) {
		for (var i = 0; i < atts.length; i++)
		{
			var val = ajaxart.xmlescape(atts.item(i).value).replace(/&apos;/g, "'");
			var name = atts.item(i).localName || atts.item(i).name;
			if (name=='xmlns') continue;
			out += " " + name + '="'+ val +'"';
		}
	}
    if (xml.childNodes.length == 0) out += "/>"
    else out += ">";

    // child elements
    var childs_length = xml.childNodes.length;
    if (childs_length == 1 && (xml.childNodes[0].nodeType == 3)) // || xml.childNodes.item(0).nodeType == 4)) // inner text
    	out += ajaxart.xmlescape(xml.childNodes[0].nodeValue);
    else
    {
    	var only_cdata = false;
    	for (var i = 0; i < childs_length; i++)
    	{
    		var child = xml.childNodes[i];
    		if (child.nodeType == 4) {  // cdata (no need for newline and indents)
    			out += ajaxart.xml.prettyPrint(child);
    			if (childs_length == 1) only_cdata=true;
    		} 
    		else if (child.nodeType != 3) 
    			out += newline + ajaxart.xml.prettyPrint(child,indent + "  ",compact);
    	}
    	if (childs_length > 0 && !compact && !only_cdata) out += newline + indent;
    }
    if (xml.childNodes.length > 0) out += "</" + aa_tag(xml) + ">";
    return out;
}



ajaxart.ishtml_item = function (item)
{
	if (!item || !item.ownerDocument || !item.nodeType) return false;
	return (item.body || item.ownerDocument.body) ? true : false;
}



ajaxart.xmlescape = function (text) 
	{
		if (typeof text === 'string')
			return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/\n/g, "&#xa;").replace(/\r/g, "&#xd;");
		if (ajaxart.isArray(text) && text.length > 0) return ajaxart.xmlescape(text[0]);
		return '';
	}



ajaxart.each = function (arr,func)
{
	for(var i=0;i<arr.length;i++)
		func(arr[i],i);
}



function aa_base_lib  ()
{
	if (window.location.href.indexOf('http://localhost/ajaxart') == 0 || window.location.href.indexOf('https://localhost/ajaxart') == 0 || window.location.href.indexOf('http://localhost:8087/ajaxart') == 0)
		return '/ajaxart/lib';
	return ajaxart.base_lib || '';
}



function aa_new_JsonByRef(parent,prop) {
	if (!window.aa_JsonByRef) aa_init_JsonByRef();
	return new aa_JsonByRef(parent,prop);
}



ajaxart.dynamicTextWithAggregator = function (item,str,context)
{
	// =Min(person/@age) or =Concat(person/@name,',') or =gstudio.Selected()
	var match = str.match(/=([a-zA-Z.]+)[(]([^)]*)[)]/);
	if (!match) return '';
	var funcName = match[1];
	var ns = "data";
	if (funcName.indexOf('.') > -1) {
		ns = funcName.split('.')[0];
		funcName = funcName.split('.')[1];
	} else {
		if (!ajaxart.components[ns][funcName]) ns='text';
	}

	var params = match[2];
	var params_arr = ajaxart.splitCommasForAggregatorParams(params); 
	if (ajaxart.components[ns][funcName] == null) return '';
	var extraParams = "";
	var itemArr = item ? [item] : [];
	var data = params_arr[0] ? ajaxart.dynamicText(itemArr,"%"+params_arr[0]+"%",context,itemArr) : itemArr;
	for (var i=1; i<params_arr.length; i++) {
		var shortParams = ajaxart.xml.xpath(ajaxart.components[ns][funcName], "Param[@short='true']/@name");
		if (shortParams.length <= i-1) break;
		var paramText = params_arr[i].replace('{','%').replace('}','%');
		extraParams += ' ' + ajaxart.totext_item(shortParams[i-1]) + '="' + paramText + '" ';
	}
	var script = '<Script t="' + ns + '.' + funcName +'"'+ extraParams+ ' />';
	return aa_first(data,ajaxart.parsexml(script,'aggregator'),"",context);
}



function aa_compile(script)
{
	  var xtml = script.getAttribute('Xtml');
	  if (script.getAttribute('Field') != null) return null;
	  
	  if (xtml == null || xtml.length < 4) return null;
	  if (xtml.charAt(0) == '%' && xtml.charAt(1) == '$') {
		  var slashPos = xtml.indexOf('/');
		  if (slashPos == -1) return null;
		  if (xtml.split('/').length != 2) return null;
		  
		  var varName = xtml.substring(2,slashPos);
		  var funcName = xtml.substring(slashPos+1,xtml.length-1);
		  
		  var myFunc = function(varName,funcName) { return function(data,context) { 
			  if (script.getAttribute('Input') != null)
				  data = ajaxart.dynamicText(data,script.getAttribute('Input'),context);
			  
			  var struct = ajaxart.getVariable(context,varName);
			  if (struct == null || ! ajaxart.isObject_array(struct)) { return ajaxart.run(data,script,'',context); }
			  var xtml = struct[0][funcName];
			  if (xtml == null) return [];
			  
			  if (xtml.compiled == "same") return data;
			  
		  	  var newContext = ajaxart.newContext();
		  	  
			  if (xtml.context != null) { // the xtml object comes with its own context
			  	  newContext.params = xtml.context.params;
			  	  newContext.componentContext = xtml.context.componentContext;
			  } 
		      newContext.vars = context.vars;
			  if (xtml.objectForMethod)
				  newContext._This = xtml.objectForMethod[0];
			  
			  if (xtml.compiled == null)
			    return ajaxart.run(data,xtml.script,'',newContext);
			  else
				return xtml.compiled(data,newContext);
			  
		  } }
		  return myFunc(varName,funcName);
	  }
	  return null;
}



function aa_importNode(node, target)
{
	if (target == null) return node;
	if (target.ownerDocument != node.ownerDocument && target.ownerDocument.importNode != undefined)
	  return target.ownerDocument.importNode(node,true);
	return node;
}



function aa_handleHttpError(e,options,context)
{
	try
	{
		var text = "HTTP error. url: " + options.url + " status: " + e.statusText;
	//	if (window.aad_showProgressIndicator)
	//		aad_showProgressIndicator(aa_ctx(ajaxart.newContext(), { ProgressIndicationText: [text] }),true);
		ajaxart.log(text,'error');
	} catch(e) {}
}



ajaxart.load_xtml_content = function (xtml_name,xtml)
{
	if (xtml == null) { 
		alert('could not load xtml ' + xtml_name); 
		if (window.console) console.error('could not load xtml ' + xtml_name); 
	}
	if (xtml.getAttribute("package") == "true") {
		var plugins = ajaxart.childElems(xtml,"*");
		ajaxart.each(plugins,function(plugin_xml) {
			ajaxart.load_xtml_content(xtml_name,plugin_xml);
		});
		return;
	}
	plugin_name = xtml.getAttribute("ns");
	if (! plugin_name || plugin_name == '')
		plugin_name = xtml.getAttribute("id");
	if (! plugin_name || plugin_name == '') {
		ajaxart.log("xtml file does not have ns or id attribute in the main xtml element. Tag: " + aa_tag(xtml), "error");
		ajaxart.log();
		return;
	}
	xtml.setAttribute("file",xtml_name);
		
	var globalsInFile = ajaxart.childElems(xtml,"*");
	ajaxart.each(globalsInFile,function(item) {
		switch (item.tagName) {
		case "Component":
			var id = item.getAttribute("id");
			if (ajaxart.components[plugin_name] == null)
				ajaxart.components[plugin_name] = [];
			ajaxart.components[plugin_name][id] = item;
			aa_load_inplace_gc(item,plugin_name);
			break;
		case "C":
			var id = item.getAttribute("id");
			if (ajaxart.components[plugin_name] == null)
				ajaxart.components[plugin_name] = [];
			ajaxart.components[plugin_name][id] = item;
			break;
		case "Usage":
			if (ajaxart.usages[plugin_name] == null)
				ajaxart.usages[plugin_name] = [];
			
			ajaxart.usages[plugin_name].push(item);
			break;
		case "Plugin":
			if (ajaxart.plugins[plugin_name] == null)
				ajaxart.plugins[plugin_name] = [];
			
			ajaxart.plugins[plugin_name] = item;
			break;
		case "Type":
			var id = item.getAttribute("id");
			ajaxart.types[plugin_name + "_" + id] = item;
			break;
		}
	});
}



ajaxart.object_finished_loading = function ()
	{
		var loading_div = jQuery("#ajaxart_loading");
		if (loading_div.length > 0)
			loading_div.html(loading_div.html()+".");
		ajaxart.loading_objects--;
		if (ajaxart.loading_objects == 0 && ajaxart.ready_func != null) 
			  ajaxart.ready_func();
	}



ajaxart.urlparam = function (strParamName)
{
    var strHref = window.location.href;
    if (strHref.indexOf('#') > -1) strHref = strHref.substr(0,strHref.indexOf("#"));
    if ( strHref.indexOf("?") > -1 ) {
        var strQueryString = strHref.substr(strHref.indexOf("?")+1);
        var aQueryString = strQueryString.split("&");
        for ( var iParam = 0; iParam < aQueryString.length; iParam++ ){
          var aParam = aQueryString[iParam].match(/([^=]*)=(.*)/); 
          if (aParam && aParam[1] == strParamName)
            return aParam[2] && unescape(aParam[2]).replace(/_AMP_/g,'&');
        }
      }
    return "";
}



jBart.appendWidget = function (place_to_add,params,jbartObject)
{
		function handleError(message) {
			ajaxart.log(message);
			params.error({message: message});
		}
		jBart.settings = params;
		params.success = params.success || function() {};
		params.error = params.error || function(msg) { jQuery(place_to_add).append(jQuery('<span/>').text(msg.message)); };
		var widgetID = params.widget_id;
		var loadingTime;

		ajaxart.base_images = params.base_images_dir || ajaxart.base_images;
		ajaxart.base_lib = params.base_lib_dir || ajaxart.base_lib;
		if (!place_to_add) return handleError('can not add to a null element');
		
		jQuery(place_to_add).addClass('jBartWidget');
		if (!params) return handleError('missing params');
		

		function getControl(widget_id) {
			var errors = [];
			if (! params.widget_src) return handleError('widget source for ' + (widget_id || 'unknown') + ' is not available'); 
			var widget_as_xml = aa_convertToXml(params.widget_src,"widget xml", errors);
			if (widget_as_xml.tagName == 'Error') return handleError(widget_as_xml.getAttribute('message'));
			if (errors.length > 0) return handleError(errors[0]);
			
			widget_id = widget_id || widget_as_xml.getAttribute('id');
			if (widget_id.indexOf('/') > -1) widget_id = widget_id.split('/')[1];
			widgetID = widget_id;

			var language = params.language ? params.language : "";
			var page = params.page ? [params.page] : [];
			params.data = params.data || {};
			params.rawData = params.rawData || {};
			
			for(var res in params.data) {
				var varname = 'jBartWidget_' + widget_id + '_' + res; 
				window[varname] = jbart_data(params.data[res],'single');
			}
			for(var res in params.rawData) {
				var val = ajaxart.isArray(params.rawData[res]) ? params.rawData[res] : [params.rawData[res]];
				window['jBartWidget_' + widget_id + '_' + res] = val;
			}

			var xtmlContent = aa_xpath(widget_as_xml,'bart_dev/db/bart_unit/bart_unit')[0];
			xtmlContent = xtmlContent || aa_xpath(widget_as_xml,'xtml')[0];
			ajaxart.load_xtml_content('widget',xtmlContent);  // for specific components
			var out = [aa_show_jbart_widget({
				WidgetXml: widget_as_xml,
				Page: page,
				Language: language,
				OnError: function(data1) {
					handleError(aa_totext(data1));
				},
				Context: aa_ctx( ajaxart.newContext(), {Language:[language]} ),
				jbartObject: jbartObject
			})];			
			if (out.length == 0) return null;
			jQuery(out[0]).addClass('ajaxart' + ajaxart.deviceCssClass);
			if (language == "hebrew")
				jQuery(out[0]).addClass('right2left');
			return out[0];
		}
		if (params.widget_id) { // we need to load the widget first
			var widget_id = params.widget_id;
			params.spinner = params.spinner || '//www.google.com/ig/images/spinner.gif';
			if (! params.nospinner) {
			  place_to_add.appendChild(jQuery('<img class="spinner" src="'+ params.spinner +'" ></img>')[0]);
			}
			window['jBartWidget_' + widget_id + '_loaded'] = function() {
				params.widget_src = window['jBartWidget_' + widget_id];
				jQuery(place_to_add).children(".spinner").remove();
				var ctrl = getControl(widget_id);
				controlCreated(ctrl);
			}
			var widgetUrl = (params.widget_repository || '//jbartdb.appspot.com') + '/widget.js?id=' + widget_id;
			aa_load_js_css(widgetUrl,'js');
		}
		else if (params.widget_src)
		{
			controlCreated(getControl());
		}
		else
			return handleError('missing param widget_id or widget_src');

		function controlCreated(ctrl) {
			if (ctrl) {
				$('#jbart_loading').empty();
				place_to_add.appendChild(ctrl);
				aa_element_attached(place_to_add);
				params.success();

				if (window.jBartLoadingStartTime) {
					loadingTime = new Date().getTime() - window.jBartLoadingStartTime;
				}
				addToGoogleAnalytics();

			} else {
				return handleError('widget returned an empty control');
			}
		}
		function addToGoogleAnalytics() {
			jBart.addedToGoogleAnalytics = jBart.addedToGoogleAnalytics || {};
			if (jBart.addedToGoogleAnalytics[widgetID]) return;
			jBart.addedToGoogleAnalytics[widgetID] = true;

			if (window.location.href.indexOf('localhost') > -1) return;
			if (params.hasOwnProperty('googleAnalytics') && !params.googleAnalytics) return;

			// Yaniv TODO: add it in an iframe
			if (window._gaq) {
			   _gaq.push(['_setAccount', 'UA-37216601-1']);
			   _gaq.push(['_setDomainName', 'none']);//'artwaresoft.appspot.com']);
			   _gaq.push(['_setAllowLinker', true]);
			   _gaq.push(['_trackPageview']);

				_gaq.push(['_trackEvent', 
					'jbart widget',
					widgetID,
					'show'
				]);

				loadingTime = parseInt(loadingTime / 500)*500;
				var loadingStr = loadingTime +  ' - ' + (loadingTime+500);

				if (loadingTime) {
					_gaq.push(['_trackEvent', 
						'jbart widget',
						widgetID,
						'loading_time_ms: ' + loadingStr
					]);
				}
			} else {
			     var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
			     ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			     var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			     setTimeout(function() { addToGoogleAnalytics(); },3000);
			}
		}
}







function aad_jbart_get_data_holder(widget_id,resource) {
	var key = 'jBartWidget_' + widget_id;
	if (!window[key]) window[key] = {resource: {items:[], on_data_arrive:[]}};
	return window[key].resource;
}











function aa_convertToXml(item,name, error_control) {
	if (!item) return ajaxart.parsexml('<xml/>');
	if (item.nodeType == 9) return item.documentElement; // xml document
	if (ajaxart.isxml_item(item)) return item;
	if (item.getNumberOfColumns)
		return aa_GoogleDataTableToXml(item);
	if (typeof(item) == 'object') // json
		return aa_JSON2Xml(item,'Top');
	if (typeof(item) == 'string') {
		var json = item.match(/^\s*[{[]+/); // json - starting with { or [
		var xml = item.match(/^\s*[<]+/); // xml - starting with <
		if (json)
			return aa_JSON2Xml(item,'Top');
		else if (xml)
			return ajaxart.parsexml(item, "", error_control);
		else if (item.indexOf(',') != -1) // CSV?
			return aa_CSV2Xml(item);
	}
}



function aa_jbart_init_activator(jBartActivator,settings) {
		var language = '';
		settings.success = settings.success || function() {};
		settings.error = settings.error || function(msg) { if (console) console.log(msg); };

		ajaxart.base_images = settings.base_images_dir || ajaxart.base_images;
		ajaxart.base_lib = settings.base_lib_dir || ajaxart.base_lib;

		var widget_src = jBartActivator._widgetSource;
		var errors = [];
		jBartActivator._widgetXml = aa_convertToXml(jBartActivator._widgetSource,"widget xml", errors);

		settings.data = settings.data || {};
		settings.rawData = settings.rawData || {};
		var widget_id = jBartActivator._widgetXml.getAttribute('id');

		for(var res in settings.data) {
			var varname = 'jBartWidget_' + widget_id + '_' + res; 
			window[varname] = jbart_data(settings.data[res],'single');
		}
		for(res in settings.rawData) {
			var val = ajaxart.isArray(settings.rawData[res]) ? settings.rawData[res] : [settings.rawData[res]];
			window['jBartWidget_' + widget_id + '_' + res] = val;
		}

		jBartActivator.Context = aa_create_jbart_context({
				WidgetXml: jBartActivator._widgetXml,
				Language: language,
				OnError: function(data1) {
					handleError(aa_totext(data1));
				},
				jbartObject: jBartActivator
		});

		function handleError(message) {
			ajaxart.log(message);
			params.error({message: message});
		}		
}



function aa_jbart_activator_showPage(jBartActivator,div,settings) {
  var out = aa_show_jbart_widget_page({
		Context: jBartActivator.Context,
		page: settings.page,
		success: settings.success
	});
	if (out && div) jQuery(div)[0].appendChild(out);
	aa_element_attached(out);
}











function aa_element_detached(elem)
{
	if (!elem || ajaxart.isattached(elem)) return;
	
	var items = jQuery(elem).find('.aa_ondetach').get();
	if (jQuery(elem).hasClass('aa_ondetach')) items.push(elem);
	
	for(var i=0;i<items.length;i++) {
		try {
		if (items[i].OnDetach) items[i].OnDetach();
		  jQuery(items[i]).removeClass('aa_onattach_called');
		} catch(e) {ajaxart.logException(e); }
	}
}



function aa_tag(item)
{
	return item.tagName;
}



function aa_open_popups() {
	var out = [];
	var openPopups = $('body').children('.jbart_popups').children();
	for(var i=0;i<openPopups.length;i++) {
		out.push(openPopups[i].jbPopup);
	}
	return out;
}



function aa_isParent(child, parent) {
  for (var iter = child; iter && iter.nodeType == 1; iter = iter.parentNode) {
    if (iter == parent) return true;
  }
  return false;
}



function aa_findValidationStyle(elem) {
	if ($(elem).hasClass('aa_validation_style')) return elem.jbValidationStyle;
	var parent = $(elem).closest('.aa_validation_style')[0];
	if (parent) return parent.jbValidationStyle;

	var bctx = aa_find_bart_context(elem);
	if (bctx.ValidationStyle2) return bctx.ValidationStyle2;

	if (!ajaxart.defaultValidationStyle) {
		var el = $('<div/>')[0];
		ajaxart.defaultValidationStyle = {
			el: el,
			$el: $(el)
		};
		aa_initValidationStyle(ajaxart.defaultValidationStyle,{});	
	}
	
	return ajaxart.defaultValidationStyle;
}



function aa_scrollToShowElement(elem, direction, margins) {
  // TODO: handle scrolling down + use the direction parameter

  direction = direction || ''; // direction can be: 'up','down' or ''

  var iter = elem;
  var parent = iter && iter.parentNode;
  margins = margins || {
    top: 0,
    bottom: 0
  };

  while (parent && parent.nodeType == 1 && parent.tagName.toLowerCase() != 'html') {
    var overflowy = $(parent).css('overflow-y');
    if (overflowy == 'scroll' || overflowy == 'auto' || parent == document.body) {

      var top = aa_relTop(iter, parent) - margins.top;
      if (parent == document.body && jBart.headerHeight) {
        top -= jBart.headerHeight;
      }

      if (top < $(parent).scrollTop()) {
        $(parent).scrollTop(top);
        iter = parent;
      }
    }
    parent = parent.parentNode;
  }
}



function ajaxart_disableSelection(target){
	function makeUnselectable(node) {
	    if (node.nodeType == 1)
	        jQuery(node).addClass('unselectable');
	    var child = node.firstChild;
	    while (child) {
	        makeUnselectable(child);
	        child = child.nextSibling;
	    }
	}
	if (target) makeUnselectable(target);
}



function ajaxart_restoreSelection(target)
{
	function unmakeUnselectable(node) {
	    if (node.nodeType == 1)
	        jQuery(node).removeClass('unselectable');
	    var child = node.firstChild;
	    while (child) {
	        unmakeUnselectable(child);
	        child = child.nextSibling;
	    }
	}
	if (target) unmakeUnselectable(target);
}



function aa_clear_virtual_inner_element(elem) {
  if (!elem.virtual_inner_elements) return;
  for (var i = 0; i < elem.virtual_inner_elements.length; i++) {
    aa_empty(elem.virtual_inner_elements[i]);
  }
}



function aa_addActionOnWindowResize(el,callback,identifier) {
	if (!el) return;
	$(el).addClass('aa_resize_listener');
	el.jbOnWindowResize = function() {
		for(var i=0;i<el.jbWindowResizeCallbacks.length;i++)
			el.jbWindowResizeCallbacks[i].callback();
	}
	el.jbWindowResizeCallbacks = el.jbWindowResizeCallbacks || [];
	if (identifier) {
		for(var i=0;i<el.jbWindowResizeCallbacks.length;i++)
			if (el.jbWindowResizeCallbacks[i].identifier == identifier) {
				el.jbWindowResizeCallbacks[i].callback = callback;
				return;
			}
	}
	el.jbWindowResizeCallbacks.push({ identifier: identifier, callback: callback});

	if (!window.jbWindowResizeListener) {
		jBart.windowResizeListenerTimeout = 0;
		window.jbWindowResizeListener = function() {
			if (jBart.windowResizeListenerTimeout) clearTimeout(jBart.windowResizeListenerTimeout);
			jBart.windowResizeListenerTimeout = setTimeout(doOnResize,200);
		};
		$(window).resize(jbWindowResizeListener);
	}

	function doOnResize() {
		jBart.windowResizeListenerTimeout = 0;
		var elems = $('.aa_resize_listener');
		for(var i=0;i<elems.length;i++) {
			try {
				elems[i].jbOnWindowResize();
			} catch(e) {
				ajaxart.logException('error in window resize callback',e);
			}
		}		
	}
}



function aa_index_of_element(elem)
{
	for (var k=0,e=elem; e = e.previousSibling; ++k);
	return k;
}



function aa_defineElemProperties(elem,properties)
{
	if (!elem.jBartDomProps) elem.jBartDomProps = properties.split(',');
	else ajaxart.concat(elem.jBartDomProps,properties.split(','));
}



function ajaxart_stop_event_propogation(e)
{
	if (!e) return;
	if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
	e.cancelBubble = true;
	return false;
}



jBart.onJsError = undefined



function aa_get_default_value(parent_comp,field)
{
	if (!parent_comp) return null;
	var default_value = ajaxart.default_values[parent_comp + "__" + field];
	if (!default_value) {
		var global = aa_componentById(parent_comp);
		var param = ajaxart.childElemByAttrValue(global,"Param","name",field);
		if (param && aa_hasAttribute(param,'Default'))
			default_value = ajaxart.xml.attributeObject(param,"Default");
		else
			default_value = ajaxart.childElem(param,"Default");
		
		field_script = ajaxart.default_values[parent_comp + "__" + field] = default_value || 'none';
	}
	if (default_value === 'none') return null; // === for IE8
	return default_value;
}



ajaxart.xml.attributeObject = function (parent,attrName)
	{
		if ( parent == null || parent.childNodes == null ) return null;
		for(var i=0;i<parent.attributes.length;i++)
		{
			if (parent.attributes.item(i).nodeName == attrName)
				return parent.attributes.item(i);
		}
		return null;
	}



function ajaxart_multilang_text(text,context)
{
	if (context.vars.Language && context.vars.Language.length > 0 && text)
	{
		if (!window.aa_mlTable) ajaxart_fill_mlTable();
		var lang = aa_totext(context.vars.Language);
		if ( aa_mlTable[lang] && aa_mlTable[lang][text]) 
			return aa_mlTable[lang][text];
		if (typeof(aa_mlDefaultLanguage) != 'undefined' && aa_mlTable[aa_mlDefaultLanguage] && aa_mlTable[aa_mlDefaultLanguage][text])
			return aa_mlTable[aa_mlDefaultLanguage][text];
		var text_lc = text.toLowerCase();
		if ( aa_mlTable[lang] && aa_mlTable[lang][text_lc]) 
			return aa_mlTable[lang][text_lc];
	}
	return text; //text.split('__')[0];
}



function aa_trim(text) {
  if(typeof String.prototype.trim !== 'function') {
  	String.prototype.trim = function() {
    	return this.replace(/^\s+|\s+$/g, ''); 
  	}
  }
  return text.trim();
}



ajaxart.replaceXmlElement = function (old_elem,new_elem,ishtml,cleanMemoryLeaks)
{
	if (old_elem == null || new_elem == null) return;
	if (old_elem.nodeType != 1) return;
	if (old_elem.parentNode == null) return;

	if (ishtml == true || ajaxart.isChrome)
	{
		if (new_elem.ownerDocument != old_elem.ownerDocument)
			new_elem = old_elem.ownerDocument.importNode(new_elem,true);
	}
	if (ishtml && old_elem.ParentObject != null) { 
		old_elem.ParentObject[0].ControlHolder = [new_elem];
		aa_defineElemProperties(old_elem,'ParentObject');
		aa_defineElemProperties(new_elem,'ParentObject');
		new_elem.ParentObject = old_elem.ParentObject; 
	}
	
	old_elem.parentNode.replaceChild(new_elem,old_elem);
	
	if (ishtml) {
		aa_element_attached(new_elem);
		if (cleanMemoryLeaks)
		  aa_remove(old_elem,cleanMemoryLeaks);
		else
		  aa_element_detached(old_elem);
	}
}



function aa_show(elem) {
	if (elem && elem.nodeType == 1)
	  jQuery(elem).removeClass('aa_hidden_element');
}



function aa_clear_jb_classes(elem)
{
    var classes = elem.className.split(' ');
    for(var i=0;i<classes.length;i++)
   	 if (classes[i].indexOf('jb') == 0) 
   		 jQuery(elem).removeClass(classes[i]);
}



function aa_clear_events(elem)
{
	jQuery(elem).unbind();
	
    if (elem.jbEvents && elem.detachEvent) {
    	for(var i=0;i<elem.jbEvents.length;i++) {
    		elem.detachEvent(elem.jbEvents[i].event,elem.jbEvents[i].callback);
    	}
    }
    for (var i in elem) {
    	if (i.indexOf('on') == 0) elem[i] = null;
    	if (elem['on'+i]) elem['on'+i] = null;
  	}
    
}



function aa_buildSectionControl(cntr,field,field_data,item_data,ctx)
{
	var newContext = aa_ctx(ctx,{_Field: [field], FieldTitle: [field.Title], _Item: item_data } );
	var style = field.SectionStyle;
	if (!style || !style.Html || field.HideTitle) {
		var out = $('<div class="aa_section"/>')[0];
		ajaxart_field_createCellControl(item_data,cntr,out,"control",field,field_data,newContext);  
		return out;
	}
	var jElem = $(style.Html);
	field.SectionImage = aa_init_image_object(field.SectionImage,item_data,ctx);
	
	var section = aa_api_object(jElem,{Title: field.Title ,Image: field.SectionImage});
	aa_defineElemProperties(section,'addSectionBody,updateCollapsed');
	if (field.SectionCollapsedByDefault) section.collapsed = true;
	
	section.addSectionBody = function(classOrElement) {
		var inner = this.getInnerElement(classOrElement);
		if (inner) 
		  ajaxart_field_createCellControl(item_data,cntr,inner,"control",field,field_data,newContext);
		if (this.collapsed) $(inner).css('display','none');
	}
	section.updateCollapsed = function(collapsed) {
		section.collapsed = collapsed;
	}
	jElem.addClass(aa_attach_style_css(style)).addClass('aa_section');
	aa_apply_style_js(section,style);
	return jElem[0];
}



function ajaxart_field_calc_field_data(field,item_data,context)
{
	if (field.Multiple && field.MultipleItems) // multiple with items - field data is not relevant
		return item_data;
	if (field.FieldData)
	{
		var results = aa_runMethod(item_data,field,'FieldData',context);
		// fielddata must not return more than one element
		if (results.length < 2) 
			return results;
		else
			return [results[0]];
	}
	else 
		return item_data;
}



function ajaxart_field_createCellControl(item,cntr,td,cell_presentation,field,field_data,context)
{
	var newContext = aa_ctx(context,{Item: item, FieldData: field_data});
	$(td).addClass('aa_cell_element');
	if (cell_presentation == null) cell_presentation = "control";
	if (field.CellPresentation != null)
		cell_presentation = field.CellPresentation;
	if (field.Width != null)
		$(td).css("width",field.Width);
	td.CellPresentation = cell_presentation;
	td.Field = field;
	td.FieldData = field_data;
	td.ItemData = item;
	td.jbContext = context;

    for (i in ajaxart.xtmls_to_trace) {  // Tracing field data to go over gaps
        if (field.XtmlSource && field.XtmlSource[0].script == ajaxart.xtmls_to_trace[i].xtml) {
            ajaxart.xtmls_to_trace[i].fieldData = ajaxart.xtmls_to_trace[i].fieldData || [];
            ajaxart.xtmls_to_trace[i].fieldData = ajaxart.xtmls_to_trace[i].fieldData.concat(field_data);
        }
    }

	if (field.IsCellHidden && field.IsCellHidden(item,context,field_data)) {
		if (field.RenderHiddenCell) 
			td.style.display = 'none';
		else
			return;
	}
	if (field.isOperation)
	{
    	var newContext = aa_ctx(newContext,{ _ItemsOfOperation: item });

		var opCell = ajaxart.runComponent('operation.OperationCell',[field],newContext); 
		if (opCell.length > 0)
			td.appendChild(opCell[0]);
		return;
	}
	if (field.CalculatedControl)
	{
		$(td).addClass("aa_text fld_" + field.Id);
		field.CalculatedControl(td,field,field_data,newContext);
		return;
	}
	if (field.IsCalculated)
	{
		var calculated_val = field.CalcFormula(item,newContext);
		var assigned = ajaxart.writevalue(field_data,calculated_val,true);
		if (!assigned)
			field_data = calculated_val;
	}
	if (cell_presentation == "text")
	{
		$(td).addClass("aa_text fld_" + field.Id);
		td.innerHTML = ajaxart_field_text(field,field_data,item,newContext);
	}
	else if (cell_presentation == "expandable text")
		ajaxart_field_expandableText(td,cntr,field,field_data,item,newContext);
	else // "control"
	{
		td.ReadOnly = ajaxart_field_is_readOnly(cntr,field,context);
	    var new_control = ajaxart_field_createControl(cntr,field,field_data,newContext)[0];
	    if (new_control != null)
	    {
	    	td.appendChild(new_control);
			if (field.Validations) { 
				$(new_control).addClass('aa_hasvalidations'); 
				new_control.jbCell = td;
			}
	    }
	    else
		{
			$(td).addClass("aa_text fld_" + field.Id);
			td.innerHTML = ajaxart_field_text(field,field_data,item,newContext);
		}
	}
	aa_trigger(field,'ModifyControl',{ Wrapper: td, FieldData: field_data, Context: newContext, Item: item });
	if (field.ModifyControl)
		for(var i=0;i<field.ModifyControl.length;i++)
			field.ModifyControl[i](td,field_data,cell_presentation,newContext,item);

	aa_trigger(field,'ModifyCell',{ Wrapper: td, FieldData: field_data, Context: newContext, Item: item });
	if (field.ModifyCell)
		for(var i=0;i<field.ModifyCell.length;i++)
			field.ModifyCell[i](td,field_data,cell_presentation,newContext,item);

	return ["true"];
}



function aa_top_dialog()
{
  var dialogs = jQuery('body').find('.aa_dlg');
  var maxCounter = 0,topDialog=null;
  for(var i=0;i<dialogs.length;i++) {
	  if (dialogs[i].counter > maxCounter) { topDialog = dialogs[i]; maxCounter = topDialog.counter; }
  }
  if (openDialogs.length == 0) return topDialog;
  
  var topOldDialog = openDialogs[openDialogs.length-1];
  if (!topDialog || topDialog.noOfOpenDialogs < topOldDialog.noOfOpenDialogs) return topOldDialog;
  
  return topDialog;
}



function aa_absLeft(elem, ignoreScroll) {
  if (elem == null) return 0;
  var orig = elem,
    left = 0,
    curr = elem;
  // This intentionally excludes body which has a null offsetParent.
  if (!ignoreScroll) {
    while (curr && curr.tagName && curr.tagName.toLowerCase() != 'body') {
      left -= curr.scrollLeft;
      curr = curr.parentNode; // scroll can not be calculated using offsetParent!
    }
  }
  while (elem) {
    left += elem.offsetLeft;
    elem = elem.offsetParent;
  }
  return left;
}



function aa_xpath_with_hash(xml,xpath) {
	// e.g. %$Data/person[#homer]/@age -> which matches for %$Data/person[@id='homer']/@age%
	var id = xpath.match(/\[\#([^\]]*)\]/)[1];
	var fixed_xpath = xpath.replace('[#'+id+']',"[@id='"+id+"']");
	return aa_xpath(xml,fixed_xpath);
}



function aa_run_component(id,input,context,params)
{
		input = input || [];
		context = context || ajaxart.newContext();
	  var xtmlElem = ajaxart.componentsXtmlCache[id];

	  if (xtmlElem == null)
	  {
  	    try 
	    {
	  	  var middlePos = id.indexOf('.');
		  var ns = id.substring(0,middlePos);
		  var compName = id.substr(middlePos+1);
	
		  if (ajaxart.components[ns] == null) { ajaxart.log("cannot find component " + id,"error");return []; }
		  var global = ajaxart.components[ns][compName];
		  if (!global)
			  { ajaxart.log("cannot find component " + id,"error"); return []; }

		  if (global.getAttribute('execution') == 'native') {
			  xtmlElem = ajaxart.componentsXtmlCache[id] = { execution: 'native' }
			  xtmlElem.profile = ajaxart.parsexml('<xtml t=""/>');
			  xtmlElem.gc = ajaxart.gcs[ns][compName]; 
		  }
		  else 
			  xtmlElem = ajaxart.componentsXtmlCache[id] = ajaxart.childElem(global,"xtml");
	    }
   	    catch(e) { return []; }
	  }
	  if (xtmlElem == null) return [];
	  var newContext = {};
	  newContext.vars = context.vars;
	  newContext.componentContext = context.componentContext;

	  if (xtmlElem.execution == 'native') {
	  	var profile = ajaxart.parsexml('<xtml t=""/>');
	  	profile.setAttribute('t',id);
		  for (var j in params) {
		  	newContext.vars['_PARAM_' + j] = params[j];
		  	profile.setAttribute(j,"%$_PARAM_" + j + "%");
		  }
		  return xtmlElem.gc(profile,input,newContext);
	  }	
	  
	  newContext.params = [];
	  // look for default values to get params
	  var defaultProfs = ajaxart.xml.xpath(xtmlElem.parentNode,'Param/Default');
	  for(var i=0;i<defaultProfs.length;i++) {
		  var val = ajaxart.run(input,defaultProfs[i],'',context);
		  var name = defaultProfs[i].parentNode.getAttribute('name');
		  if (name != null && name != "")
			  newContext.params[name] = val;
	  }
	  for (var j in params) newContext.params[j] = params[j];
	  return ajaxart.run(input,xtmlElem,'',newContext);
}



ajaxart.fill_trace_result = function (results, input,output,params,origData)
	{
		var result = { isObject: true, Input: input, Output: output, context:params }
		if (origData != null)
			result.OrigData = origData;
		results.push(result);
	}



function aa_st() 
{
	var result = "";
	var last_component = "";
	for(var i=0;i<ajaxart.stack_trace.length;i++)
	{
		var comp_node = aa_xtml_path(ajaxart.stack_trace[i],"id",true).split("@id='");
		if (comp_node.length > 1) 
			comp = comp_node[1].split("'")[0];
		else
			comp = comp_node[0];
		if (last_component == comp) continue;
		result += comp + ",";
		last_component = comp;
	}
	return result;
}



ajaxart.text4trace = function (obj, depth, max_depth)
	{
		if (depth == null) depth=0;
//		if (!max_depth) debugger;
		if (depth >= max_depth) return "...";
		if (typeof(obj) == "undefined") return "";
		
		if (!ajaxart.isArray(obj)) obj=[obj];
		if (typeof(obj) == undefined || obj==null) return "";
		var out = "";
		if (obj.length > 1) out = obj.length + " items : \r\n";
		ajaxart.each(obj, function(item) {
			if (item == null) { return; }
			if (typeof(item) == "function") return;
			if (ajaxart.isxml(item))
			{
			  var xml_val = "";
			  if ( depth+1 == max_depth && item.nodeType == 1)
			  {
				  xml_val = ajaxart.tryShortXmlWithTag(item,"name");
				  if (xml_val == null) xml_val = ajaxart.tryShortXmlWithTag(item,"id")
				  if (xml_val == null) xml_val = ajaxart.tryShortXmlWithTag(item,"Name")
				  if (xml_val == null) xml_val = "<" + aa_tag(item) + " .../>";
			  }
			  else if (item.nodeType == 2) // attribute
				  xml_val = "@" + item.nodeName + '="' + ajaxart.xmlescape(ajaxart.xml2text(item)) + '"';
			  else
				  // xml_val = ajaxart.xmlescape( ajaxart.xml2text(item) );
				  xml_val = ajaxart.xml2text(item);
				 
			  if (ajaxart.ishtml(item))
	  	    out += "html: " +  xml_val;
			  else
			  	out += "xml: " +  xml_val;
			}
			else if (ajaxart.isObject(item)) {
				if (depth+1 == max_depth) {
					out += "object (";
					for (i in item)
						if (item.hasOwnProperty(i) && i != "isObject")
							out += i + ", ";
					out = out.substring(0,out.length-2) + ")";
				}
				else {
					out = { isObject: true };
					for (i in item) {
						if (item.hasOwnProperty(i) && i != "isObject" && i != "XtmlSource") {
							var item_trace = ajaxart.text4trace(item[i],depth+1,max_depth);
							if (item_trace.length > max_depth && item_trace.substring(0,3)=="xml")
								item_trace = { isObject: true, xml:item_trace };
							out[i] = item_trace;
		//				  out += "" + i + ": " + ;
						}
					}
					return out;
				}
			}
			else if (typeof(item.script) != "undefined") {
				out += "script:" + ajaxart.text4trace(item.script,depth+1,max_depth);
			}
			else {
//					var text = ajaxart.xmlescape( ajaxart.totext(item) );
//					out += "text:" + text.replace(new RegExp("\n", "g"), "<br/>");
				out += "text:" + ajaxart.totext(item);
			}
			out += "\r\n";
		});
		return out;
	}



ajaxart.jrootElem = function (elemList)
	{
		var list = elemList.parents();
		if (list.length > 0 ) {
			var rootItem = list[list.length-1];
			return jQuery(rootItem);
		}
		return jQuery([]);
	}



function aa_init_JsonByRef() {
	aa_JsonByRef = function(parent,prop) { this.parent = parent; this.prop = prop}
	aa_JsonByRef.prototype.GetValue = function() { return this.parent[this.prop] }
	aa_JsonByRef.prototype.WriteValue = function(val) { return this.parent[this.prop] = val }
	aa_JsonByRef.prototype.ParentNode = function() { return this.parent }
}







ajaxart.splitCommasForAggregatorParams = function (params_str)
{	// a,'b,d,t',c --> [ 'a', 'b,d,t', 'c' ]
	if (!params_str) return [];
	var out = [];
	var single_quot= false, double_quot= false, last_index= 0;
	for (var i=0; i<params_str.length; i++) {
		if (params_str[i] == '"')
			double_quot = !double_quot;
		else if (params_str[i] == "'")
			single_quot = !single_quot;
		else if (params_str[i] == "," && !single_quot && !double_quot) {
			var param = params_str.substring(last_index,i);
			out.push(param);
			last_index = i+1;
		}
	}
	out.push(params_str.substring(last_index));
	for (var j=0; j<out.length; j++) {
		var match = out[j].match(/^'([^']*)'$/);
		if (match) out[j] = match[1];
		match = out[j].match(/^"([^"]*)"$/);
		if (match) out[j] = match[1];
	}
	return out;
}



ajaxart.isObject_array = function (array) {
	return array.length > 0 && ajaxart.isObject(array[0]); 
}



function aad_showProgressIndicator(context,autoHide)
{
	aa_showIndicator = true;
	$(context.vars.ControlElement).addClass('aa_loading');
	
	setTimeout(function() {
		if (! aa_showIndicator) return;
		var newtext = ajaxart_multilang_text( aa_totext(context.vars.ProgressIndicationText) , context);
		
		if (newtext == "") newtext = ajaxart_multilang_text("loading...",context);
		var jIndicator = $('.aa_progress_indicator');
		if (! jIndicator.hasClass('right2left') && ajaxart_language(context) == 'hebrew')
			jIndicator.addClass('right2left')
			
		jIndicator.find('.aa_progress_indicator_text').html(newtext);
		jIndicator.show();
		if (autoHide)
		{
			setTimeout(function() {
				aad_hideProgressIndicator(context);
			},3000);
		}
	},300);
}



function aa_load_inplace_gc(comp,ns) {
	if (typeof(aa_xpath) == 'undefined') return;
	
    if (comp.getAttribute('execution') != 'native') return;
    
	var script = aa_cdata_value( aa_xpath(comp,'Code')[0] );
	if (!script) return;

	var func = null;
	try {
		  eval('func = ' + script);
	} catch(e) {
		ajaxart.logException(e,'could not compile js function for gc ' + comp.getAttribute('id') + ': ' + script);
	}
	if (func) {
		var gc = {};
		gc[comp.getAttribute('id')] = func;
		aa_gcs(ns, gc);
	}
}



ajaxart.ready_func = function () {
				if (ajaxart.urlparam('debugmode')=="true") ajaxart.debugmode = true;
				if (ajaxart.isChrome) jQuery("body").addClass('chrome');
				
			  	var scriptXml = ajaxart.parsexml(script);
			  	if (data == null) data = [""];

			  	var context = ajaxart.newContext();
			  	var result = ajaxart.run(data,scriptXml,"",context);
			  	var div = jQuery(divId).addClass("ajaxart ajaxart_topmost " + ajaxart.deviceCssClass);
			  	ajaxart.databind([div[0]],data,context,scriptXml,data);
		  		if (div.length > 0 && ajaxart.ishtml(result)) {
			  		div[0].appendChild(result[0]);
			  		aa_element_attached(result[0]);
				  	aa_register_document_events(context);
			  	} else {
			  		ajaxart.log("scriptxml did not return html","warning");
			  	}
//			  	var debugui = ajaxart.run(data,ajaxart.parsexml('<Control t="debugui.HiddenButton" />'),"",context);
			  	
			  	var loading = jQuery("#ajaxart_loading");
			  	if (loading.length > 0 && ! loading[0].IsUsed)
			  		loading.hide();
	    }



function aa_show_jbart_widget(settings)
{
	var ctx = aa_create_jbart_context(settings);
	if (settings.jbartObject) settings.jbartObject.Context = ctx;
	
	return aa_show_jbart_widget_page({
		Context: ctx,
		page: settings.Page,
		success: settings.success,
		ControlToShowInBartContext: settings.ControlToShowInBartContext,
		RunAfterControlWithTimer: settings.RunAfterControlWithTimer
	});
}



function aa_load_js_css(filename, filetype) {
  filetype = filetype || 'js';

  if (filetype == "js") { //if filename is a external JavaScript file
    var fileref = document.createElement('script');
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("src", filename);
  } else if (filetype == "css") { //if filename is an external CSS file
    var fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", filename);
  }
  if (fileref) document.head.appendChild(fileref);
}







function aa_GoogleDataTableToXml(data)
{
  	var fieldNames = [];
	var uniqueNamesHash = {};
	for (var col = 0; col < data.getNumberOfColumns(); col++)
	{
		// normalize field names as valid attribute names
		var name = data.getColumnLabel(col).replace(/ ([a-z])/g,function(match) {return ' ' + match.toUpperCase()}).replace(/[^a-zA-Z0-9_]/g,'');
		if (! name.match(/^[a-zA-Z].*/)) name = 'x' + name; // should start with
															// alpha
		while (uniqueNamesHash[name]) // make name unique
			name += '_';
		fieldNames.push(name);
		uniqueNamesHash[name] = true;
	}
	var xml = ajaxart.parsexml('<items/>');
	for (var row = 0; row < data.getNumberOfRows(); row++) {
		var item = ajaxart.parsexml('<item/>');
		xml.appendChild(item);
	    for (var col = 0; col < data.getNumberOfColumns(); col++) {
	      var formattedValue = data.getFormattedValue(row, col);
		  var col_id = fieldNames[col];
		  item.setAttribute(col_id,formattedValue);
	    }
	} 
	return xml;
}



function aa_JSON2Xml(obj,tag,result)
{
	return json2Xml(obj || {},result || ajaxart.parsexml('<' + tag + '/>'),0);
	function json2Xml(obj,result,depth)
	{
		if (typeof obj.cloneNode == 'function') 
			return obj.cloneNode(); // xml inside js object
		if (depth == 20) { debugger; return result.ownerDocument.createElement('TooMuchRecursion'); }
		if (typeof obj == 'string') {
			try {
				return json2Xml(JSON.parse(obj),result,depth+1);
			} catch(e) { 
				ajaxart.log("jsonToxml - Can not parse json " + obj,"error");
				return null; 
			}
		}
	
		try {
			var inner_tag;
			var isArray = obj[0] && (!(typeof obj == 'string')); 
			if (isArray)
			{
				inner_tag = tag.substring(0,tag.length-1);
				if( tag.match(/ies$/) )
					inner_tag = tag.substring(0,tag.length-3) + 'y';
				var array_of_strings = true;
				for(var att in obj)
				  if (!(typeof(obj[att]) == 'string' || typeof(obj[att]) == 'number' || typeof(obj[att]) == 'boolean'))
					  array_of_strings = false;
				if (array_of_strings)
				{
					var item = result.ownerDocument.createElement(inner_tag);
					item.nodeValue = obj.join(',');
					result.appendChild(item);
					return result;
				}
			}
			// atts
			for(var att in obj) 
			 if (obj.hasOwnProperty(att)) {
				var inner = obj[att];
				if (inner == null) continue;
				var att_fixed = att.match(/[a-zA-Z_0-9]+/)[0];
				var _type = typeof(inner);
				if (_type == 'string' || _type == 'number' || _type == 'boolean') {
				  result.setAttribute(att_fixed,inner);
				} else { // elements
					var child = result.ownerDocument.createElement(inner_tag || att_fixed);
					child = json2Xml(inner,child,depth+1);
					result.appendChild(child);
				}
			}
		} catch (e) {
					debugger;
					alert(e);
		}
		return result;
	}
}



function aa_CSV2Xml(txt)
{
	var result = ajaxart.parsexml('<items/>');
	try {
		// first we pre-process to extract quotes 
		// handle cases like: 1997,"Super, luxurious truck" or 1997,"Super, ""luxurious"" truck" (http://en.wikipedia.org/wiki/Comma-separated_values#Specification)
		var new_text = "";
		var index = 0;
		var in_quote = false;
		var current_item = "";
		var quoted_items = [];
		while (1) {
			var next_index = txt.indexOf('"',index);
			if (next_index == -1) {
				new_text += txt.substring(index);
				break;
			}
			if (in_quote) {	// in quote
				if (txt.length>next_index+1 && txt.charAt(next_index+1) == '"') {	// double quote ""
					current_item += txt.substring(index,next_index) + '"';
					index = next_index + 2;
				}
				else { 	// finish current item
					current_item += txt.substring(index,next_index);
					quoted_items.push(current_item);
					index = next_index+1;
					in_quote = false;
					new_text += "___QUOTED___";
				}
			} else {	// start quote
				new_text += txt.substring(index,next_index);
				index = next_index+1;
				current_item = "";
				in_quote = true;
			}
		}
		txt = new_text;
		var lines = txt.replace('\r\n','\n').split('\n');
		var fields = lines[0].split(',');
		var fieldNames = [];
		var uniqueNamesHash = {};
		for(var i=0;i<fields.length;i++) 
		{
			// normalize field names as valid attribute names
			var name = fields[i].replace(/ ([a-z])/g,function(match) {return ' ' + match.toUpperCase()}).replace(/[^a-zA-Z0-9_]/g,'_');
			if (! name.match(/^[a-zA-Z].*/)) name = 'x' + name; // should start with alpha
			while (uniqueNamesHash[name]) // make name unique
				name += '_';
			fieldNames.push(name);
			uniqueNamesHash[name] = true;
		}
		for (var i=1;i<lines.length;i++) {
			var item = result.ownerDocument.createElement('item');
			var values = lines[i].split(',');
			for (var j=0;j<values.length;j++) {
				var val = values[j];
				if (val == "___QUOTED___")
					val = quoted_items.shift();
				item.setAttribute(fieldNames[j],val);
			}
			result.appendChild(item);
	}
	} catch(e) { 
			debugger;
			alert(e);
	}
	return result;
}



function aa_find_bart_context(elem) {
  for (; elem && elem.nodeType == 1; elem = elem.parentNode) {
    if (elem.jbContext) {
      var bartcontext = aa_var_first(elem.jbContext, '_AppContext');
      if (bartcontext) return bartcontext;
    }
  }
  return null;
}



function aa_initValidationStyle(validationStyle,settings) {
	settings = aa_defaults(settings,{
		clearErrors: function(validationStyle,topElement) {
			$(topElement).find('.aa_error').removeClass('aa_error');
			$(topElement).find('.aa_error_message').remove();			
		},
		showValidationError: function(validationStyle,topElement,errorObject) {
			var elem = errorObject.element;
			var messageDiv = $(validationStyle.el.cloneNode(true)).addClass('aa_error_message').text(errorObject.errorMessage);
			elem.parentNode.appendChild(messageDiv[0]);

			elem.jbValidationMessage = messageDiv;
			$(elem).addClass('aa_error');

			if (!elem.jbValidationFocusEventBound) {
				elem.jbValidationFocusEventBound = true;
				if (elem.tabIndex == -1) elem.tabIndex = 1;

				$(elem).add($(elem).find("input")).add($(elem).find("textarea")).add($(elem).find(".aa_picklist_div")).focus(function() {
					$(elem).removeClass('aa_error');
					if (elem.jbValidationMessage)
						aa_remove(elem.jbValidationMessage,true);
					validationStyle.clearErrorSummary(validationStyle,topElement);
				});
			}
		},
		clearErrorSummary: function(validationStyle,topElement) {
		},
		showErrorSummary: function(validationStyle,topElement,errors) {			
		}
	});

	validationStyle.clearErrors = settings.clearErrors;
	validationStyle.showValidationError = settings.showValidationError;
	validationStyle.showErrorSummary = settings.showErrorSummary;
	validationStyle.clearErrorSummary = settings.clearErrorSummary;
	validationStyle.scrollMargins = settings.scrollMargins;	
}



function aa_relTop(elem, parent) {
  var top = 0,
    orig = elem,
    curr = elem;
  // This intentionally excludes body which has a null offsetParent.
  if (typeof(ignoreScroll) == "undefined") ignoreScroll = false;
  if (!ignoreScroll) {
    while (curr && curr.tagName && curr != parent) {
      top -= curr.scrollTop;
      curr = curr.parentNode;
    }
  }
  while (elem && elem != parent) {
    top += elem.offsetTop;
    elem = elem.offsetParent;
  }
  return top;
}



ajaxart.childElemByAttrValue = function (parent,elemName,attrName,attrValue)
{
	if ( parent == null || parent.childNodes == null ) return null;
	for(var i=0;i<parent.childNodes.length;i++)
	{
		var node = parent.childNodes.item(i);
		if (node.nodeType != 1) continue;
		if (elemName == "*" || node.tagName == elemName) // TODO: if BackEnd run this loop with node.getTagName
			if (node.getAttribute(attrName) == attrValue)
				return node;
	}
	return null;
}



function ajaxart_fill_mlTable() 
{
	window.aa_mlTable = window.aa_mlTable || {};
	for(ns in ajaxart.components)
	{
		if (!ajaxart.components.hasOwnProperty(ns)) continue;
		var list = ajaxart.components[ns];
		for(var j in list) {
			if (!list.hasOwnProperty(j)) continue;
			var comp = list[j];
			if (comp.getAttribute('type') == "text.MultiLangSuite") {
			  ajaxart.run([],aa_xpath(comp,'xtml')[0],'',ajaxart.newContext());
			}
		}
	}
}



function aa_init_image_object(image,data,context)
{
	if (typeof(image) == 'string') return {StaticUrl: image, Size: ''};
	if (!image || !image.Url) return;
	image.StaticUrl = aa_totext(image.Url(data,context));
	return image;
}



function aa_runMethod(data,object,method,context)
{
	if (!object || !method ) return [];
	var scriptParam = object[method];
	if (scriptParam == null) return [];
	if (typeof(scriptParam) == "function") return scriptParam.call(object,data,context);
	if (scriptParam.compiled == "same") return data;

	var newContext = { params: scriptParam.context.params 
			, vars: context.vars
			, componentContext: scriptParam.context.componentContext} // TODO: avoid this if paramVars == ""
	
	newContext._This = object;
	
	if (scriptParam.compiled) 
	  return scriptParam.compiled(data,newContext);
  else
    return ajaxart.run(data,scriptParam.script,"",newContext);
	
	return [];
}



function ajaxart_field_text(field,field_data,item,context)
{
	if (field.Text)
		var result = ajaxart.totext_array(aa_runMethod(field_data,field,'Text',context));
	else if (item[0].__item) // is wrapper
		var result = item[0][field.Id];
	else
		var result = ajaxart.totext_array(field_data);
	if (field.Highlight)
		result = ajaxart_field_highlight_text(result,field.Highlight);
	return result;
}



function ajaxart_field_expandableText(td,cntr,field,field_data,item,context)
{
	td.expandableText =  {
			States : {
				"control" : {
					Control : function() 
					{ 
						td.State = 'control';
						$(td).removeClass('aa_toggle_button');
						var ctrl = ajaxart_field_createControl(cntr,field,field_data,context)[0];
						if (!cntr) return $('<div></div>')[0];
						td.appendChild(ctrl);
						jBart.trigger(field,'ModifyControl',{ Wrapper: td, FieldData: field_data, Context: context, Item: item });
						if (field.ModifyControl)
							for(var i=0;i<field.ModifyControl.length;i++)
								field.ModifyControl[i](td,field_data,'control',context,item);
						return ctrl;
					},
					ChangeStateLabel : "close",
					ChangeToState : "text"
				},
				"text" : {
					Control : function() 
					{
						var txt = ajaxart_field_text(field,field_data,item,context);
						if (txt == "" && field.DescriptionForEmptyText)
							txt = field.DescriptionForEmptyText;
						if (td.firstChild) aa_remove(td.firstChild,true);
						td.innerHTML = txt;
						$(td).addClass("aa_text fld_" + field.Id);	
						td.setAttribute("tabindex","1");
						td.State = 'text';
						if (field.ModifyCell) {
							for(var i=0;i<field.ModifyCell.length;i++)
								field.ModifyCell[i](td,field_data,'text',context,item);
						}
						
						td.onkeydown = function(e) {
							if ($(td).find('.field_control').length > 0) return;
							field.ToggleExpandable(field,field_data,td,e);
							if (e.keyCode == 13) 
								return aa_stop_prop(e);
						    
							return true;
						}

						return td;
					},
					ChangeStateLabel : "",
					ChangeToState : "control"
				}
			},
			Build: function(state)
			{
				aa_empty(td);
				td.onclick = null;
				$(td).removeClass('aa_text');
				var ctrl = state.Control();
				if (ctrl == null) return td.expandableText.Build(td.expandableText.States['text']);
				var button = $(ctrl);
				if (state.ChangeStateLabel != '')
				{
					button = $('<div>' + state.ChangeStateLabel + ' </div>')
					td.appendChild(button[0]);
					aa_element_attached(td);
				}
				button.addClass('aa_toggle_button');
				button[0].onclick = function(e) 
				{
				    var elem = $( (typeof(event)== 'undefined')? e.target : event.srcElement  ); 
		  		    if (elem[0].parentNode == null) return true;
					var new_state = td.expandableText.States[state.ChangeToState];
					td.expandableText.Build(new_state);
					$(td).find('>input').slice(0,1).focus();
					if (state.ChangeToState == "control")
						aa_fixTopDialogPosition();
				}
			}
		};
	td.expandableText.Build(td.expandableText.States['text']);
	field.ToggleExpandable = function(field,field_data,input,e)
	{
		if (e.keyCode == 27)
		{
			var td = input;
			if (! $(td).hasClass('aa_cell_element'))
				td = $(input).parents('.aa_cell_element')[0];
			if (td == null) return;
			var current_state = td.expandableText.States[td.State];
			var new_state = td.expandableText.States[current_state.ChangeToState];
			td.expandableText.Build(new_state);
			if ($(td).find('.field_control').length > 0)
				$(td).find('.field_control').focus();
			else
				$(td).focus();
		}
	}
}



function ajaxart_field_is_readOnly(cntr,field,context)
{
	if (field.Writable) return false;
	if (field.ReadOnly == true) return true;
	if (aad_object_run_boolean_method(field,'ReadOnly',[],context)) return true;
	if (!cntr) return false;
	if (cntr.Items == null) return true;
	if (cntr.Items[0].ReadOnly == true) return true;
	if (cntr.ReadOnly) return true;
	return ( cntr.Items[0].ReadOnly != null && ajaxart.tobool_array(cntr.Items[0].ReadOnly) );
}



function ajaxart_field_createControl(cntr,field,field_data,context)
{
	return ajaxart.trycatch( function()  {
		var ctrl = null;
		if (field.Multiple == true && field.MultipleControl != null)
			ctrl = aa_runMethod(field_data,field,'MultipleControl',context);
		else if (ajaxart_field_is_readOnly(cntr,field,context))
		{
			if (field.ReadOnlyControl)
				ctrl = aa_runMethod(field_data,field,'ReadOnlyControl',context); 
			else if (field.Control)
				ctrl = aa_runMethod(field_data,field,'Control',context);
			else return [];
		}
		else if (field.WritableControl)
			ctrl = ajaxart.runScriptParam(field_data,field.WritableControl,context);
		else if (field.Control)
			ctrl = aa_runMethod(field_data,field,'Control',context);
	
		if (ctrl == null) // default is text input 
			ctrl = [ajaxart_field_createSimpleInput(field_data,context, ajaxart_field_is_readOnly(cntr,field,context))];
		if (ctrl.length == 0) // empty control was defined, use text
			return []; //ctrl = [document.createElement('span')];
		$(ctrl[0]).addClass("field_control fld_" + field.Id);
		ctrl[0].Field = field;
		ctrl[0].FieldData = field_data;
		ctrl[0].jbContext = ctrl[0].jbContext || context;
		if (field.Css) {
	    	var newContext = aa_ctx(context,{ _FieldCtrl: ctrl });
			ajaxart.runScriptParam(field_data,field.Css,newContext);
		}
		return ctrl;
	}, function (e) {	// catch
	   	   ajaxart.logException(e);   
	   	   return [];
	});
}



ajaxart.writevalue = function (data, newValueObj,disableXmlChangeEvent) {
	var assigned = false;
	if (data == null || data.length == 0 || data[0] == null) return assigned;
	var xml = data[0];
	if (xml.WriteValue) return xml.WriteValue(ajaxart.isArray(newValueObj) ? newValueObj[0] : newValueObj); 
	
	if (ajaxart.isxml(newValueObj))
	{
		var newNode = newValueObj; 
		if (ajaxart.isArray(newValueObj))
			newNode = newValueObj[0];

		if (newNode.nodeType == 1 && xml.nodeType == 1)
		{
		  if (newNode == xml) return;
		  if (aa_tag(newNode) == aa_tag(xml))
			  ajaxart.xml.copyElementContents(xml,newNode);
		  else
			  ajaxart.replaceXmlElement(xml,newNode);
		  assigned=true;
		}
	}
	if (!assigned)
	{
		var newValue = ajaxart.totext(newValueObj);
		if (ajaxart.isxml(xml)) {
			if (xml.nodeType == 2 && window.jBartNodeJS) {
				window.jBartNodeJS.setAttributeValue(xml,newValue);
			} else if (xml.nodeType == 2 || xml.nodeType == 3 || xml.nodeType == 4)  {// attribute or inner text
				if (newValue == xml.nodeValue) return true; // no need to do anything like auto save
				xml.nodeValue = newValue;
			}
			else {// inner xml for element
				var text_node = xml.firstChild;
		   		for (var child = xml.firstChild; child; child=child.nextSibling) // promote cdata
					if (child.nodeType == 4) // cdata
						text_node = child;
				if (text_node && text_node.nodeType == 3 ) // text node
					text_node.nodeValue = newValue;
				else if (text_node && text_node.nodeType == 4) // cdata
					text_node.nodeValue = newValue.replace(/\]\]>/g,']\\]>'); // BUG - escaping cdata end token - http://stackoverflow.com/questions/223652/is-there-a-way-to-escape-a-cdata-end-token-in-xml 
				else
					xml.appendChild(xml.ownerDocument.createTextNode(newValue));
			}
			assigned=true;
		} else if (typeof(xml) == "string")	{
			data[0] = ajaxart.totext(newValueObj);
			assigned=true;
		}
	}
	if (! disableXmlChangeEvent && ajaxart.isxml(xml))
		aa_triggerXmlChange(xml);
	return assigned;
}



ajaxart.tryShortXmlWithTag = function (xml,attrName)
	{
		if (aa_hasAttribute(xml,attrName))
			return "<" + aa_tag(xml) + " " + attrName + '="' + xml.getAttribute(attrName) + '" .../>';  
	}



function aad_hideProgressIndicator(context)
{
	aa_showIndicator = false;
	$(context.vars.ControlElement).removeClass('aa_loading');
	
	$('.aa_progress_indicator').hide();
	aa_fire_async_finished();
}



function ajaxart_language(context)
{
	if (context.vars.Language == null || context.vars.Language.length == 0) return "";
	return ajaxart.totext( context.vars.Language[0] );
}



function ajaxart_field_highlight_text(text,highlight,highlight_class)
{
	if (!text) return '';
	if (!highlight) return text;

	var result = text;
  	var lCaseTxt = text.toLowerCase();
  	var found_at = lCaseTxt.indexOf(highlight);
  	var endTag = lCaseTxt.indexOf('>');
  	if (found_at != -1 && found_at > endTag)
  	{
  		var to_replace = text.substring(found_at,found_at + highlight.length);
  		result = text.replace(to_replace,'####' + to_replace + '~~~~');
  	}
  	result = result.replace(/####/g,'<span class="aa_highlight ' + highlight_class + '">');
  	result = result.replace(/~~~~/g,'</span>');
  	return result;
}



function aa_stop_prop(e) 
{
	if (!e) return;
	
	if (e.stopPropagation)
		e.stopPropagation();
    if(e.preventDefault)
        e.preventDefault();

	e.cancelBubble = true;
	return false;
}



function aad_object_run_boolean_method(object,method,data,context)
{
	if (object[method] == null ) return false;
	var result = aa_runMethod(data,object,method,context);
	if (result.length == 0) return false;
	if (ajaxart.totext_array(result) == "true") return true;
	
	return false;
}



ajaxart.tobool_array = function (arr)
{
	return ajaxart.totext_array(arr) == "true";
}



function ajaxart_field_createSimpleInput(data,context,readonly,input_type)
{
	var field = context.vars._Field[0];
	var text = ajaxart_field_option_text(field,data,context);
	if (readonly) {
		if (field.Text) text = aa_totext(field.Text(data,context));
		var out = $("<div/>").text(text).addClass('readonly')[0];
		return out;
	}
	if (field.MultiLineTextStyle && field.MultiLineText ) {
		var input = null;
		var style = field.MultiLineTextStyle;
		var textAreaElem = $(style.Html)[0];
		var textAreaObj = aa_api_object(textAreaElem,{Field: field,
			initTextArea: function(classOrElement) {
				var inner = this.getInnerElement(classOrElement);
				if (!inner) return;
				input = inner;
				input.jbApiObject = textAreaObj;
			}
		});
		aa_apply_style_js(textAreaObj,style);
		$(textAreaObj).addClass(aa_attach_global_css(style.Css));
	} else {
		var input = document.createElement(field.MultiLineText ? 'textarea' : 'input');
	}
	
	aa_defineElemProperties(input,'Blur,Refresh,getValue,updateValue');
	
	if (!input_type) input_type = 'text';
	input.setAttribute('type',input_type);
	if (field.XtmlSource && field.XtmlSource[0].script)
		ajaxart.databind([input],data,context,field.XtmlSource[0].script); // for validation - should be cleaned

	input.jbData = data;
	input.onfocus = function(e) {
		aa_validation_removeNoCloseMessages();		
		
	    // select all on next timer
		var field = context.vars._Field[0];
		if (! field.DoNotSelectAllOnFocus)
		{
		    var selectAllText = function(input) { setTimeout(function() {
				if (input.setSelectionRange) { // Mozilla
					try {input.setSelectionRange(0, input.value.length); } catch(e) {}
				}
				else if (input.createTextRange) // IE
					{
					try { 
						var range = input.createTextRange();
						range.moveStart('character', 0);
						range.moveEnd('character', input.value.length);
						range.select();
					} catch (e) {}
					}
		    })};
		    if (ajaxart.controlOfFocus != this)
		    	selectAllText(this);
		}
	    ajaxart.controlOfFocus = this;
	    var field = context.vars._Field[0];
	    aa_invoke_field_handlers(field.OnFocus,this,e,field,data);
	    
		for(var parent=input.parentNode;parent;parent=parent.parentNode) if (parent.onfocus) parent.onfocus(e);  // for HoverOnPopup 
	    return true;
	}
	input.onblur = function(e) {
		for(var parent=input.parentNode;parent;parent=parent.parentNode) if (parent.onblur) parent.onblur(e);  // for HoverOnPopup 
	    
		if (this.IgnoreBlur) 
		{ 
			this.IgnoreBlur = false; 
			return false; 
		}

	    var field = context.vars._Field[0];
	    ajaxart_field_RefreshDependentFields(field,this,context);
	    aa_invoke_field_handlers(field.OnBlur,this,e,field,data);
	    if (field.Validations) aa_handleValidations(field,this,data,context,"on blur");
	    
	    return true;
	}

	input.onkeydown = function(e) {
		var field = context.vars._Field[0];
		e = e || event;
		
	    if (field.KeyPressValidator && e.keyCode != 8) // backspace is fine 
	    {
			var ch = String.fromCharCode(e.keyCode);
			if (! field.KeyPressValidator.test(ch)) return aa_stop_prop(e);
	    }
		
		var had_popups = ajaxart.dialog.openPopups.length > 0;
	    aa_invoke_field_handlers(field.OnKeydown,this,e,field,data);
//		if (e.keyCode == 13 && had_popups) 
//			return aa_stop_prop(e);
	    
		if (aa_intest && e.CharByChar)
			input.value += String.fromCharCode(e.keyCode);

		return true;
	}
	input.onmousedown = function(e) {
	    var field = context.vars._Field[0];
		e = e || event;
	    aa_invoke_field_handlers(field.OnMouseDown,this,e,field,data);
	    
		return true;
	}
	input.onmouseup = function(e) {
	    var field = context.vars._Field[0];
		e = e || event;
	    aa_invoke_field_handlers(field.OnMouseUp,this,e,field,data);
	    
		return true;
	}
	
	// oninput is for mouse context menu of cut,paste
	input.oninput = function(e) {
		input.updateValue(e);
	}
	// support paste,cut for IE8,IE7
	if (ajaxart.isIE78) {
		$(input).bind('cut paste',null,function(e) {
			setTimeout(function() {
				input.updateValue(e);	
			},50);
		});
	}
	input.onkeyup = function(e) {
		var input = this;
	    var field = context.vars._Field[0];
		e = e || event;

		var keyCode = e.keyCode;
		if (keyCode == undefined && !aa_intest && !aa_inuiaction) return; // a mouse click !!!
		aa_invoke_field_handlers(field.OnKeyup,this,e,field,data,{isObject: true, KeyCode: ['' + keyCode], CtrlKey: aa_frombool(e.ctrlKey) });
		var codes = [9,13,16,17,18,27, 63277,63276]; // controls and navigation 
		for(var i=0;i<codes.length;i++)
			if (keyCode == codes[i]) return true;
//		if (keyCode>=33 && keyCode<=45) return true; // symbols !@# (may be moved to an aspect)
		
	    if (field.KeyPressValidator && keyCode != 8) // backspace is fine 
	    {
			var ch = String.fromCharCode(keyCode);
			if (! field.KeyPressValidator.test(ch)) return aa_stop_prop(e);
	    }
	    if (e.keyCode)
	    	input.KeyUp = true;
    	input.updateValue(e);
	    input.KeyUp = null;
		return true;
	}
	input.Blur = function()
	 {
		$(this).blur();
	 }

	input.Refresh = function()
	 { 
		var input = this;
		if (input.RefreshDescriptionForEmptyText)
			input.RefreshDescriptionForEmptyText();
		
		if (input.jbApiObject) input.jbApiObject.trigger('refresh');
	 }

	input.getValue = function() { return this.value; }
	input.updateValue = function(e) 
	{
	    var field = context.vars._Field[0];
	    if (! field.ManualWriteValue)
	    {
	    	var value = this.getValue();
	    	//value = value.replace(RegExp(String.fromCharCode(160),'g'), ' ');  // fixed strange bug. charcode 160 is nbsp
	    	if (aa_totext(data) == value) return;  // nothing has changed
	    	ajaxart.writevalue(data,value);
		    if (field.RefreshOn != 'exit field')
		    	aa_invoke_field_handlers(field.OnUpdate,this,e,field,data);
	    }
	    if (field.Validations) aa_handleValidations(field,this,data,context,"on change");
	}
	//if (!aa_intest && input.tagName.toLowerCase() == 'textarea')
	  //text = text.replace(RegExp(' ','g'), String.fromCharCode(160));  // fixed strange bug. charcode 160 is nbsp
	input.value = text;
	input.setAttribute('value',text); // so the tests will pass on all browsers
	var textboxCssClass = aa_attach_global_css( aa_totext(ajaxart.run([],ajaxart.parsexml('<xtml t="jbart.TextboxCss" />'),'',context)) , null, 'textbox',null,true );
	$(input).addClass('aa_simple_cell aatextbox').addClass(textboxCssClass);
	input.jbRemoveTextboxClass = function() {
		$(input).removeClass('aatextbox').removeClass(textboxCssClass);
	}

	if (!readonly && (field.Validations || field.Validation)) 
	  $(input).addClass('aa_hasvalidations');

	return input;
}



ajaxart.trycatch = function (func, whenerror) {
	if (ajaxart.debugmode)
		return func();
	
	try {
		return func();
	} catch(e) {
		if (e == "endless loop") throw e;
		return whenerror(e);
	};
}



ajaxart.runScriptParam = function (data,scriptParam,context)
{
	if (scriptParam == null) return [];
	if (typeof(scriptParam) == "function") return scriptParam(data,context); 
	if (scriptParam.compiled == "same") return data;
	if (scriptParam.context == null) debugger;

	var newContext = { params: scriptParam.context.params 
			, vars: context.vars
			, componentContext: scriptParam.context.componentContext} // TODO: avoid this if paramVars == ""
	
    if (scriptParam.objectForMethod)
  	  newContext._This = scriptParam.objectForMethod[0];
	
	if (scriptParam.compiled != null) 
	  return scriptParam.compiled(data,newContext);
    else
      return ajaxart.run(data,scriptParam.script,"",newContext);
}



function aa_fire_async_finished()
{
	// let sync actions finish
	setTimeout(function() {
		for(var i=aa_async_finished_listeners.length-1;i>=0;i--)
			aa_async_finished_listeners[i].OnAsyncActionFinished();
	},1);
}



function aa_validation_removeNoCloseMessages()
{
	$(document).find('.aa_noclose_message').remove();
}



function aa_handleValidations(field,input,data,context,evt)
{
  if (! field.Validations) return;
  var validationStyle = context.vars._AppContext ? context.vars._AppContext[0].ValidationStyle : aa_first([],ajaxart.parsexml('<xtml t="validation.DefaultOld" />'),'',context);
  if (!validationStyle) return true;
  validationStyle.inputForErrorClass = validationStyle.inputForErrorClass || aa_attach_global_css( validationStyle.CssForInput );

  if (input.ValidationErrorElement) $(input.ValidationErrorElement).remove();
  $(input).removeClass('aa_input_with_error ' + validationStyle.inputForErrorClass);
  $(input).removeClass('aa_mandatory_error');

  if ($(input).parents('.aa_hidden_field').length > 0) // a hidden field
	  return;
	  
  for (var i=0;i<field.Validations.length;i++) {
	  var vObj = field.Validations[i];
	  if (evt != "on save") {
	    if (evt != vObj.CheckValidation && evt != "on load") continue;
	    if (evt == "on load" && vObj.CheckValidation == "on save") continue;
	  }
	  var pass = ! aa_tobool(vObj.Validation(data,context));
	  if (!pass) {
	      input.Error = ajaxart_multilang_text(aa_totext(vObj.ErrorMessage(data,context)),context);
	      $(input).addClass('aa_input_with_error ' + validationStyle.inputForErrorClass);
		  
		  var errorText = ajaxart_multilang_text(aa_totext(vObj.ErrorMessage(data,context)),context);
		  if (vObj.AddTitleToErrorMessage) errorText = ajaxart_multilang_text(field.Title + ' ' + errorText,context);
		  
 		  var div = aa_renderStyleObject(validationStyle,{
			  errorText: errorText,
			  Error: errorText,
			  init: function(settings) {
 			    this.showError = settings.showError;
 			    this.jbShowErrorSummary = settings.showErrorSummary;
 		      },
 		      styleObject: validationStyle,
 		      showError: function() {}
		  },context);
		  $(div).addClass('aa_validation_error');
		  if (vObj.Mandatory) $(div).addClass('aa_mandatory_error'); 
		  
		  if (vObj.HideErrorMessage) aa_hide(div);
		  input.ValidationErrorElement = div;
		  var insertFunc = function() {
			  div.showError(input,div,vObj.Mandatory);
		  }
		  if (input.parentNode != null) 
			insertFunc();
		  else 
			aa_addOnAttach(input,insertFunc);
		  
		  return;
	  }
  }
}



function aa_frombool(bool) 
{
  return bool ? ["true"] : [];
}



function ajaxart_field_option_text(field,field_data,context)
{
	var code = ajaxart.totext_array(field_data); 
	if (field.Options && field.Options.codeToText)
		return field.Options.codeToText(code);
	return code;
}



function ajaxart_field_RefreshDependentFields(field,srcElement,context)
{
	if (!field|| !field.DependentFields) return;
	
	var parent = $(document);
	if (field.RefreshScope == 'container' || field.RefreshScope == 'screen')
		parent = $(srcElement).parents('.aa_container,.aa_widget').slice(-1);
	else if (field.RefreshScope == 'group')
		parent = $(srcElement).parents('.aa_container,.aa_widget').slice(0,1);
	else if (field.RefreshScope == 'item' ) // depricated
		parent = $(srcElement).parents('.aa_item').slice(0,1);
	else if (field.RefreshScope == 'table line' )
	{
		var listIndex = $(srcElement).parents().index($(srcElement).parents('.aa_list'));
		var parents_up_to_list = $(srcElement).parents().slice(0,listIndex);
		parent = parents_up_to_list.filter('.aa_item').slice(-1);
	}
	if (field.RefreshScope == 'screen' && !parent[0]) parent = $(document);

	var dependent = field.DependentFields.split(',');
	for(var f=0;f<dependent.length;f++)
	{
		var fieldID = dependent[f];
		if (field.RefreshScope == 'sibling') { 
			aa_refresh_sibling_field(srcElement,fieldID,context);
		} else {
			var ctrls = parent.find(".fld_" + fieldID);
			for(var i=0;i<ctrls.length;i++)
				aa_refresh_cell(ctrls[i],context);
		}
	}
}



function aa_tobool(data)
{
  if (data == null || data.length == 0) return false;
  if (ajaxart.totext_array(data)=="true") return true;
  return false;
}



function aa_addOnAttach(elem,func)
{
	$(elem).addClass('aa_onattach');
	elem.jbOnAttach = func;
	if (ajaxart.isattached(elem)) elem.jbOnAttach();
}
aa_gcs("yesno", { 
Contains:function (profile, data, context) {
		var ignoreCase = aa_bool(data, profile, 'IgnoreCase', context);
		var ignoreOrder = aa_bool(data, profile, 'IgnoreOrder', context);
		var oneOf = aa_bool(data, profile, 'OneOf', context);
		var allText = ajaxart.run(data, profile, 'AllText', context);

		var data_text = "";
		if (ajaxart.isxml(allText)) data_text = ajaxart.xml2text(allText);
		else data_text = ajaxart.totext(allText);

		data_text = data_text.replace(/\s+/g, ' '); // normalize white spaces
		//if (data_text == "") return [];
		var text_items = ajaxart.runsubprofiles(data, profile, 'Text', context);
		//var text_profiles = ajaxart.subprofiles(profile,'Text');
		var startIndex = 0;
		if (data_text == null || text_items.length == 0) return [];
		if (ignoreCase) data_text = data_text.toLowerCase();
		for (var i = 0; i < text_items.length; i++) {
			var text = ajaxart.totext_item(text_items[i]).replace(/\s+/g, ' ');
			if (ignoreCase) text = text.toLowerCase();
			var new_index = data_text.indexOf(text, startIndex);
			if (!oneOf && new_index == -1) return [];
			if (oneOf && new_index != -1) return ['true'];
			startIndex = new_index + text.length;
			if (ignoreOrder || oneOf) startIndex = 0;
		};

		if (oneOf) return [];
		return ['true'];
	},
IsEmpty:function (profile,data,context)
	  {
		  var val = ajaxart.run(data,profile,'Value',context);
		  var checkInner = aa_bool(data,profile,'CheckInnerText',context);
		  return aa_isEmpty(val,checkInner);
	  },
NotEmpty:function (profile,data,context)
	  {
		  var value = ajaxart.run(data,profile,'Value',context);
		  var check = aa_bool(data,profile,'CheckInnerText',context);
		  var result = aa_isEmpty(value,check);
		  if (result == true || result[0] == 'true') return [];
		  return ['true'];
	  },
And:function (profile,data,context)
	  {
	    var subprofiles = ajaxart.subprofiles(profile,'Item');
	    
		for(var i=0;i<subprofiles.length;i++)
		{
	  		if ( ! aa_bool(data,subprofiles[i],"",context) )
	  			return [];
	  	};
	  	return ["true"];
	  }
});

/*********/



aa_gcs("xtml", { 
UseParamArray:function (profile,data,context)
	  {
		  var param = aa_text(data,profile,'Param',context); 
		  var paramScript = context.params[param];
		  if (!paramScript) {
		  	ajaxart.log('UseParamArray: Can not find param ' + param);
		  	return [];
		  }
		  if (ajaxart.isArray(paramScript)) // script='false'
			  return paramScript;

	  	  var newContext = {};
	  	  newContext.vars = context.vars;
	  	  if (context.componentContext) {
		  	  newContext.params = context.componentContext.params;
		  	  newContext.componentContext = context.componentContext.componentContext;
		  	}

	  	  return ajaxart.runsubprofiles(data,paramScript.script,paramScript.field,newContext);
	  },
UseParam:function (profile,data,context)
	  {
		  var param = aa_text(data,profile,'Param',context); 
		  var input = ajaxart.run(data,profile,'Input',context);

		  var paramScript = context.params[param];
		  if (ajaxart.isArray(paramScript)) // script='false'
			  return paramScript;

		  if (typeof(paramScript) == 'function') return paramScript(input,context);
		  
		  if (paramScript == null || paramScript.script == null) 
			  return [];
		  if (paramScript.compiled == "same") return input;
		  
		  // if we're here we are in script=true
		  
	  	  var newContext = { params: []};
	  	  newContext.vars = context.vars;
	  	  if (context.componentContext) {
	  	    newContext.params = context.componentContext.params;
	  	    newContext.componentContext = context.componentContext.componentContext;
	  	  }
			
		  if (paramScript.compiled == null)
			  return ajaxart.run(input,paramScript.script,"",newContext);
		  else  
			  return paramScript.compiled(input,newContext);
	  },
ComponentDefinition:function (profile,data,context)
	  {
		return ajaxart.make_array(data,function(item) {
		   var id = aa_text(item,profile,'ID',context);
		   if (id == "")
			   return null;
		   var toXtml = aa_bool(item,profile,'ToXtml',context);
		   try {
			 var middlePos = id.indexOf('.');
			 var ns = id.substring(0,middlePos);
			 var compName = id.substr(middlePos+1);

			 if (ajaxart.components[ns] == null) return [];
			 var global = ajaxart.components[ns][compName];
		   } catch(e) { ajaxart.log("ComponentDefinition: cannot find component " + id); return [];}
		   
		   if (toXtml)
			   return ajaxart.childElem(global,"xtml");
		   else
			   return global;
		   
		},true);
	  },
RunXtml:function (profile,data,context)
  {
	  var xtml = ajaxart.run(data,profile,'Xtml',context);
	  if (xtml.length == 0) return [];

	  var method = "";
	  if (aa_hasAttribute(profile,'Method') || ajaxart.childElem(profile,'Method') != null)
		  method = aa_text(data,profile,'Method',context); 

	  var field = "";
	  if (aa_hasAttribute(profile,'Field')) // || ajaxart.childElem(profile,'Field') != null)
		  field = aa_text(data,profile,'Field',context);

	  var input = data;
	  if (aa_hasAttribute(profile,'Input') || ajaxart.childElem(profile,'Input') != null)
		  input = ajaxart.run(data,profile,'Input',context);

	  if (typeof(xtml[0].script) != "undefined" || xtml[0].compiled != null)	// xtml containing script and context
	  {
		  if (typeof(xtml[0].input) != "undefined")
			  if (! aa_bool(data,profile,'ForceInputParam',context) )
				  input = xtml[0].input;

	  	  if (xtml[0].compiled == "same") return input;

	  	  var newContext = ajaxart.newContext();
	  	  
		  if (xtml[0].context) { // the xtml object comes with its own context
		  	  newContext.params = xtml[0].context.params;
		  	  newContext.componentContext = xtml[0].context.componentContext;
		  } 
 	      newContext.vars = context.vars;
		  if (typeof(xtml[0].objectForMethod) != 'undefined')
			  newContext._This = xtml[0].objectForMethod[0];
		  
		  if (xtml[0].compiled == null) {
  		    if (xtml[0].script == null) return null;
		    return ajaxart.run(input,xtml[0].script,field,newContext,method);
		  }
		  else
			return xtml[0].compiled(input,newContext);
	  }
	  
	  if (! ajaxart.isxml(xtml[0]) ) {
		  // dynamic text maybe
		  var result = ajaxart.dynamicText(input,aa_totext(xtml),context,null,false);
		  return [result];
	  }

	  /* var newContext = ajaxart.clone_context(context);	// SLOW. is done because of $InputForChanges - find a way to fix that  
	    */
	  var newContext = {};
	  newContext.vars = context.vars;
	  newContext.componentContext = context.componentContext;
	  newContext.params = [];
	  
	  return ajaxart.run(input,xtml[0],field,newContext,method);
  },
Params:function (profile,data,context)
	  {
		  var out = { isObject: true };
		  var elem = profile.firstChild;
		  while (elem != null)
		  {
			  if (elem.nodeType == 1) 
			  {
				  var tag = elem.tagName;
				  var name = elem.getAttribute('name');
				  if (name == null || name == "") { elem = elem.nextSibling;  continue; }
				  
				  if (tag == 'Param') {
					  out[name] = ajaxart.run(data,elem,'',context);
				  } else if (tag == 'ScriptParam') {
					  out[name] = { script: elem , context: context, compiled: ajaxart.compile(elem,'',context,elem.getAttribute("paramVars")) };
				  } else if (tag == 'Method') {
					  out[name] = { script: elem , context: context, objectForMethod: [out], compiled: ajaxart.compile(elem,'',context,elem.getAttribute("paramVars")) };
				  } else if (tag == 'ScriptParamArray') {
					  var scriptArr = ajaxart.run(data,elem,'',context);
				      var value = [];
					  for(var j=0;j<scriptArr.length;j++)
						value.push( { script: scriptArr[j] , context: context.componentContext } );
					  
					  out[name] = value;
				  }
			  }
		    elem = elem.nextSibling;
		  }
				
		  return [out];
	  }
});

/*********/



aa_gcs("xml", { 
Xml:function (profile, data, context) {
		var dynamicContent = profile.getAttribute('DynamicContent') == 'true';
		var xmlescape = profile.getAttribute('EncodeDynamicContent') != 'false';
		
	    var child = ajaxart.childElem(profile,"*");
	    if (child == null) 
	    	return [ aa_createElement(data[0],'xml') ];

	    if (!dynamicContent)
		{
			return [ ajaxart.xml.clone([child]) ];
		}
	    else {  // dynamic content
	    	var text = ajaxart.xml2text(child);
	    	var newxml_text = ajaxart.dynamicText(data,text,context,data,false,xmlescape)[0];
	    	var out = ajaxart.parsexml(newxml_text);
	    	if (out != null) return [out];
	    	return [];
	    }
	}
});

/*********/



aa_gcs("visual_container", { 

});

/*********/



aa_gcs("uitext", { 

});

/*********/



aa_gcs("uiaction", { 
GoToPage:function (profile, data, context)
   {
  	 var url = aa_text(data,profile,'Url',context);
  	 if (url == "") return;
  	 var type = aa_text(data,profile,'Type',context);
  	 var target = (type == 'navigate current page') ? "_top" : "_new";
     if (ajaxart.inPreviewMode == true) return [];
     
  	 if (target == "_new") {
//		var controls = ajaxart.getControlElement(context);
//		if (controls.length > 0 && !ajaxart.isattached(controls[0])) return data;
		target = "_blank";
  	 }
  	 window.open(url,target);
  	 return data;
   },
GoToUrl:function (profile, data, context)
   {
	  var url = aa_text(data,profile,'Url',context);
	  if (window._gaq) // google analytics 
		  _gaq.push(['_trackPageview', '/' + url.split('/').pop()]);
      if (ajaxart.inPreviewMode == true) return [];
      var prev_loc = window.location + "_";	//make it string and not reference
	  if (url.length > 0 && window.location != url) window.location = url;
	  if (ajaxart.hash_change_by_js_count != null && prev_loc != window.location + "_")
		  ajaxart.hash_change_by_js_count++;	// for Back of browser handling
	  return ["true"];
   }
});

/*********/



aa_gcs("ui", { 
CustomStyle:function (profile,data,context)
	{
		var style = {
			Html: aa_text(data,profile,'Html',context),
			Css: aa_text(data,profile,'Css',context),
			Javascript: aa_text(data,profile,'Javascript',context),
			IsTriplet: true,
			params: {}
		};
		var atts = profile.attributes;			// adding attributes as params
		for (var i=0; i < atts.length; i++) {
			var att_name = atts.item(i).nodeName;
			if (att_name != "t" && att_name != "value" && att_name != 'Data' && att_name != "name" && att_name != "Trace")
				style.params[att_name] = ajaxart.totext_array(ajaxart.dynamicText(data,atts.item(i).nodeValue,context));
		}
		return [style];
	},
UrlFragmentAttribute:function (profile,data,context)
  {
		var url = aa_text(data,profile,'Url',context);
		var attr = aa_text(data,profile,'Attribute',context);
		return [ aa_url_attribute(url,attr) ];
  },
CustomCss:function (profile,data,context) {
		var style = aa_first(data,profile,'Style',context);
		style.Css = aa_text(data,profile,'Css',context);
		return [style];
	}
});

/*********/



aa_gcs("text_as_item", { 

});

/*********/



aa_gcs("text", { 
Replace:function (profile,data,params)
  {
    var find = aa_text(data,profile,'Find',params);
    var replaceWith = aa_text(data,profile,'ReplaceWith',params);
    var useRegex = aa_bool(data,profile,'UseRegex',params);
    var replaceAll = aa_bool(data,profile,'ReplaceAll',params);
    var str = aa_text(data,profile,'Text',params);
    
	var result = "";
//	  		if (useRegex) {
		if (replaceAll)
			var reg = new RegExp(find, "g");
		else
			var reg = new RegExp(find);
		result = str.replace(reg, replaceWith);
//	  		}
	return [ result ];
  },
Split:function (profile,data,context)
  {
    var sep = aa_text(data,profile,'Separator',context);
    var part = aa_text(data,profile,'Part',context);
    var index_num = aa_int(data,profile,'Index',context);
    var str = aa_text(data,profile,'Text',context);
    
    if (aa_bool(data,profile,'Regex',context))
    	sep = new RegExp(sep);
    var result = '';
	if (str == '') return [];

	var items = str.split(sep);
	if (aa_bool(data,profile,'NoEmptyValues',context)) {
		for(var i=items.length-1;i>=0;i--)
			if (items[i] == "") items.splice(i,1);
	}
	switch(part)
	{
	case "ButFirst" : if (items.length >= 1) return items.slice(1); break;
	case "First" : if (items.length >= 1) result = items[0]; break;
	case "Second" : if (items.length >= 2) result = items[1]; break;
	case "Third" : if (items.length >= 3) result = items[2]; break;
	case "All but Last" :
		var out = [];
		for (var i=0; i<items.length-1; i++)
			out.push(items[i]);
		return out;
	case "All but First" :
		var out = [];
		for (var i=1; i<items.length; i++)
			out.push(items[i]);
		return out;
	case "All but First and Last" :
		var out = [];
		for (var i=1; i<items.length-1; i++)
			out.push(items[i]);
		return out;
	case "Second" : if (items.length >= 2) result = items[1]; break;
	case "All" :
		if (index_num && items.length >= index_num) 
			result = items[index_num-1];
		else
			return items;
		break;	
	case "By index" : 
		if (index_num && items.length >= index_num) 
			result = items[index_num-1];
		else
			return items;
		break;
	case "Last" : if (items.length > 0) result = items[items.length-1]; break;
	};

	if (result == '')
		result = aa_text(data,profile,'Default',context);
	return [result];
  },
UrlEncoding:function (profile,data,context)
  {
	  var urlpart = ajaxart.totext_array(data);
	  var type = aa_text(data,profile,'Type',context);
	  if (type == "encode")
		  return [ encodeURIComponent( urlpart ) ];
	  else
		  return [ decodeURIComponent( urlpart )];
  },
ToIdText:function (profile,data,context)
  {
	return [aa_string2id(aa_totext(data))];
  },
Concat:function (profile,data,context)
  {
    var prefix = aa_text(data,profile,'Prefix',context);
    var suffix = aa_text(data,profile,'Suffix',context);
    var sep = aa_text(data,profile,'Separator',context);
    var items = ajaxart.run(data,profile,'Items',context);
    var lastSeparator = aa_text(data,profile,'LastSeparator',context);
    var maxLength = aa_int(data,profile,'MaxLength',context);
    
    if (lastSeparator == "")
    	lastSeparator = sep;
    var out = prefix;

	var compiledItemText = ajaxart.compile(profile,'ItemText',context);
    
    for(var i=0;i<items.length;i++) {
    	var item = items[i];
    	var current = "";
    	
    	if (compiledItemText == "same") current = ajaxart.totext_item(item);
    	else if (compiledItemText == null) current = aa_text([item],profile,'ItemText',context);
    	else current = ajaxart.totext_array(compiledItemText([item],context));
    	
//    	if (current != "") {
	    	if (i!=0 && i+1<items.length) out += sep;
	    	if (i!=0 && i+1 == items.length) out += lastSeparator;
	    	out += current;
//    	}

  		if (out.length > maxLength && maxLength > 0) {
  			var overmaxtext = aa_text(data,profile,'SuffixForMax',context);
  			out = out.substring(0,maxLength) + overmaxtext;
  			return [out + suffix];
  		}
    }
  	var items_array = ajaxart.subprofiles(profile,'Item');
  	for(var i=0;i<items_array.length;i++) {
  		var current = aa_text(data,items_array[i],"",context);
  		if (current != "") {
	    	if (i!=0 && i+1<items_array.length) out += sep;
	    	if (i!=0 && i+1 == items_array.length) out += lastSeparator;
	    	out += current;
  		}
  	}

    out += suffix;
    return [out];
  }
});

/*********/



aa_gcs("sample", { 

});

/*********/



aa_gcs("preview_device", { 

});

/*********/



aa_gcs("popup", { 
CloseContainingPopup:function (profile, data, context) {
		var exitMode = aa_text(data,profile,'ExitMode',context);
		var control = aa_var_first(context,'ControlElement');
		aa_close_containing_popup(control,function() {
			ajaxart.run(data,profile,'DoOnExit',context);
		},exitMode);
	},
OpenPopup:function (profile, data, context) {
		var style = aa_first(data,profile,'Style',context);

		aa_init_class_Popup();

		var popup = new ajaxart.classes.Popup({
			title: aa_text(data,profile,'PopupTitle',context),
			data: data, context: context, profile: profile,
			launchingElement: aa_var_first(context,'ControlElement'),
			base_features: ajaxart.runsubprofiles(data,profile,'Feature',context)
		});

		aa_renderStyleObject(style,popup,context,true,{
			jsFunctionName: 'show'
		});
		return [popup];
	}
});

/*********/



aa_gcs("object", { 
Object:function (profile,data,context)
  {
	  var out = { };
	  var elem = profile.firstChild;
	  while (elem != null)
	  {
		  if (elem.nodeType == 1) 
		  {
			  var tag = elem.tagName;
			  var name = elem.getAttribute('name');
			  if (name == null || name == "") { elem = elem.nextSibling;  continue; }
			  
			  if (tag == 'Property') {
				  out[name] = ajaxart.run(data,elem,'',context);
			  } else if (tag == 'SingleProperty') {
				  out[name] = aa_first(data,elem,'',context);
			  } else if (tag == 'TextProperty') {
				  out[name] = aa_text(data,elem,'',context);
			  } else if (tag == 'IntegerProperty') {
				  out[name] = aa_int(data,elem,'',context);
			  } else if (tag == 'BooleanProperty') {
				  out[name] = aa_bool(data,elem,'',context);
			  } else if (tag == 'Method') {
				  aa_addMethod(out,name,elem,'',context);
			  }
		  }
	    elem = elem.nextSibling;
	  }
		var atts = profile.attributes;			// adding attributes as properties
		for (var i=0; i < atts.length; i++) {
			var att_name = atts.item(i).nodeName;
			if (att_name != "t" && att_name != "value" && att_name != 'Data' && att_name != "name" && att_name != "Trace")
				out[att_name] = ajaxart.totext_array(ajaxart.dynamicText(data,atts.item(i).nodeValue,context));
		}
			
	  return [out];
  },
SetProperty:function (profile,data,context)
  {
	  var obj = aa_first(data,profile,'Object',context);
	  var prop = aa_text(data,profile,'Property',context);
	  if (obj == null || prop == "") return [];
	  if (aa_bool(data,profile,'IsSingleProperty',context))
		obj[prop] = aa_first(data,profile,'Value',context);
	  else
	    obj[prop] = ajaxart.run(data,profile,'Value',context);
	  
	  return ["true"];
  },
Object:function (profile,data,context)
  {
	  var out = { };
	  var elem = profile.firstChild;
	  while (elem != null)
	  {
		  if (elem.nodeType == 1) 
		  {
			  var tag = elem.tagName;
			  var name = elem.getAttribute('name');
			  if (name == null || name == "") { elem = elem.nextSibling;  continue; }
			  
			  if (tag == 'Property') {
				  out[name] = ajaxart.run(data,elem,'',context);
			  } else if (tag == 'SingleProperty') {
				  out[name] = aa_first(data,elem,'',context);
			  } else if (tag == 'TextProperty') {
				  out[name] = aa_text(data,elem,'',context);
			  } else if (tag == 'IntegerProperty') {
				  out[name] = aa_int(data,elem,'',context);
			  } else if (tag == 'BooleanProperty') {
				  out[name] = aa_bool(data,elem,'',context);
			  } else if (tag == 'Method') {
				  aa_addMethod(out,name,elem,'',context);
			  }
		  }
	    elem = elem.nextSibling;
	  }
		var atts = profile.attributes;			// adding attributes as properties
		for (var i=0; i < atts.length; i++) {
			var att_name = atts.item(i).nodeName;
			if (att_name != "t" && att_name != "value" && att_name != 'Data' && att_name != "name" && att_name != "Trace")
				out[att_name] = ajaxart.totext_array(ajaxart.dynamicText(data,atts.item(i).nodeValue,context));
		}
			
	  return [out];
  }
});

/*********/



aa_gcs("loading_style", { 

});

/*********/



aa_gcs("layout", { 

});

/*********/



aa_gcs("jbart_resource", { 
Data:function (profile,data,context)   // gc of jbart_reource.Data
	{
		var obj = { isObject:true , Type: "query" }
		obj.Id = aa_text(data,profile,'ResourceID',context);
		obj.ID = [obj.Id];
		obj.CacheIn = aa_first(data,profile,'CacheIn',context);
		obj.FullID = jBart.utils.getWidgetIDFromContext(context) + '_' + obj.Id;
		obj.AutoSaveSampleData = aa_bool(data,profile,'AutoSaveSampleData',context); // for the usage of the dt
		var type = obj.Type = aa_text(data,profile,'ValueType',context);
		
		// setting obj.Items
		obj.Items = [];
		
		obj.LoadFromValue = function(value) {
			if (type == 'calculated') return;
			if (type == 'xml') {
				if (obj.Xml) {
					// already exists (when loading from data source)
					var val = jbart_data(value,'single');
					if (val) {
						ajaxart.xml.copyElementContents(obj.Xml,val);
						aa_triggerXmlChange(obj.Xml);
					}
				} else {	// first time
					obj.Items = jbart_data(value,'single');
					obj.Xml = obj.Items[0];
				}
			}
			if (type == 'xml multiple') obj.Items = jbart_data(value,'multiple');
			
			if (typeof(value) != 'string') value = aa_totext([value]);
			
			if (type == 'json to xml') obj.Items = jbart_data(value,'single');
			if (type == 'json') {
				var val = {};
				try {
					val = JSON.parse(value);
				}
				catch(e) { val.error = 'JSON: ' + (e.getMessage ? e.getMessage() : '') + ', parsing value ' } 
				obj.Items = (ajaxart.isArray(val)) ? val : [val];
			}
			if (obj.Type == 'javascript') {
				var val = aa_run_js_code(value,data,context);
				if (val)
				  obj.Items = (ajaxart.isArray(val)) ? val : [val];
			}
		}
		
		if (type == 'calculated') {
			obj.Items = aa_run(data,profile,'Value',context);
		} else {
			if (obj.CacheIn) 
				var value = aa_totext(obj.CacheIn.GetValue(data,aa_ctx(context,{ DataResource: [obj] })));
			else
				var value = aa_first(data,profile,'Value',context);  
			obj.LoadFromValue(value);
		}
		
		if (type == 'xml' && obj.CacheIn) {
			obj.XmlChanged = function() {
				if (obj.Saving) return;
				obj.Saving = true;
				setTimeout(obj.SaveXml,200);
			};
			obj.SaveXml = function() {
				obj.CacheIn.Save(data,aa_ctx(context,{ DataResource: [obj]}))
				obj.Saving = false;
			};
			aa_bindXmlChange(obj.Xml,obj.XmlChanged);
		}
		
		obj.DataSource = aa_first(data,profile,'DataSource',context);
		if (obj.DataSource && obj.Xml) {
			var info = aa_getXmlInfo(obj.Xml,context,false);
			info.Save = function(data2,ctx) {
			  obj.DataSource.Save(obj.Items,aa_ctx(context,ctx));
			}
			obj.Load = function(data1,ctx) {
				if (this.DataLoaded) return;
				ajaxart_async_Mark(ctx);
				aad_runMethodAsyncQuery(obj,obj.DataSource.Retrieve,data,aa_merge_ctx(context,ctx),function(result,ctx2){
					obj.DataLoaded = true;
					obj.LoadFromValue(result[0]);
					ajaxart_async_CallBack(data1,ctx);
				});
			}
		}

		return [obj];
	}
});

/*********/



aa_gcs("jbart", { 

});

/*********/



aa_gcs("itemlist_style", { 

});

/*********/



aa_gcs("itemlist_aspect", { 
ShowTextWhenNoItems:function (profile,data,context)
    {
        var field = context.vars._Field[0];
        var style = aa_first(data,profile,'Style',context);
        
        jBart.bind(field,'initItemList',function(itemlist) {
            var itemListCntr = itemlist.itemlistCntr;
            var parent = itemlist.ParentOfItems;
            if (!parent) return;
            
            var no_items_text = aa_multilang_text(data,profile,'Text',context);
            var noItemsElement = aa_renderStyleObject(style,{ text: no_items_text, data: no_items_text, itemlist: itemlist },context).el;
            
            itemlist.bind('refresh',refresh,'ShowTextWhenNoItems');
            jBart.bind(itemListCntr,'afterItemDeleted',refresh,'ShowTextWhenNoItems'+field.Id);
            jBart.bind(itemListCntr,'afterItemAdded',refresh,'ShowTextWhenNoItems'+field.Id);
            
            function refresh() {
                if (itemListCntr.Items.length == 0 && noItemsElement.parentNode != parent) {
                    parent.appendChild(noItemsElement);
                }
                if (itemListCntr.Items.length > 0 && noItemsElement.parentNode == parent) {
                    parent.removeChild(noItemsElement);
                }
            }
        });
    }
});

/*********/



aa_gcs("itemlist", { 

});

/*********/



aa_gcs("img", { 
Center:function (profile,data,context) {
		aa_init_class('CenterImage',{
			fix: function(image,div,innerDiv,settings) {
				var backgroundWidth = image.width,backgroundHeight = image.height;
				if (image.width / image.height > image.originalWidth / image.originalHeight) {
					backgroundWidth = parseInt(backgroundHeight * image.originalWidth / image.originalHeight);
					$(innerDiv).css('margin-left',Math.abs(parseInt((image.width - backgroundWidth)/2)) + 'px');
				} else {
					backgroundHeight = parseInt(backgroundWidth * image.originalHeight / image.originalWidth);
					$(innerDiv).css('margin-top',Math.abs(parseInt((image.height - backgroundHeight)/2)) + 'px');
				}
				$(innerDiv).css('background-size',backgroundWidth + 'px ' + backgroundHeight + 'px').width(backgroundWidth).height(backgroundHeight);
			}
		});
		return [new ajaxart.classes.CenterImage()];
	},
Image:function (profile,data,context) {
		aa_init_class_image();

		var origWidthRef = ajaxart.run(data,profile,'OriginalWidth',context);
		var origHeightRef = ajaxart.run(data,profile,'OriginalHeight',context);

		var frameWidth = aa_first(data,profile,'FrameWidth',context);
		var frameHeight = aa_first(data,profile,'FrameHeight',context);

		var image = new ajaxart.classes.Image({
			url: aa_text(data,profile,'Url',context),
			originalWidth: parseInt(aa_totext(origWidthRef)),
			originalHeight: parseInt(aa_totext(origHeightRef)),
			originalWidthRef: origWidthRef,
			originalHeightRef: origHeightRef,
			width: frameWidth ? frameWidth.val : 0,
			height: frameHeight ? frameHeight.val : 0,
			adjustSize: aa_first(data,profile,'AdjustSize',context),
			needsRefreshOnResize: (frameWidth && frameWidth.refreshOnResize) || (frameHeight && frameHeight.refreshOnResize),
			refresh: function() {
				var frameWidth = aa_first(data,profile,'FrameWidth',context);
				var frameHeight = aa_first(data,profile,'FrameHeight',context);

				this.width = frameWidth ? frameWidth.val : 0;
				this.height = frameHeight ? frameHeight.val : 0;
			}
		});

		return [image];
	},
FixedWidth:function (profile,data,context) {
		return [{ val: aa_int(data,profile,'Width',context)}];
	},
Fill:function (profile,data,context) {
		aa_init_class('FillImage',{
			fix: function(image,div,innerDiv,settings) {
				var backgroundWidth = image.width,backgroundHeight = image.height;
				if (image.width / image.height > image.originalWidth / image.originalHeight) {
					backgroundHeight = parseInt(backgroundWidth * image.originalHeight / image.originalWidth);
					$(innerDiv).css('margin-top','-'+Math.abs(parseInt((image.height - backgroundHeight)/2)) + 'px');
				} else {
					backgroundWidth = parseInt(backgroundHeight * image.originalWidth / image.originalHeight);
					$(innerDiv).css('margin-left','-'+Math.abs(parseInt((image.width - backgroundWidth)/2)) + 'px');
				}
				$(innerDiv).css('background-size',backgroundWidth + 'px ' + backgroundHeight + 'px').width(backgroundWidth).height(backgroundHeight);
			}
		});
		return [new ajaxart.classes.FillImage()];
	},
FixedHeight:function (profile,data,context) {
		return [{ val: aa_int(data,profile,'Height',context)}];
	},
Stretch:function (profile,data,context) {
		aa_init_class('StretchImage',{
			fix: function(image,div,innerDiv,settings) {
				var backgroundWidth = image.width,backgroundHeight = image.height;
				$(innerDiv).css('background-size',backgroundWidth + 'px ' + backgroundHeight + 'px').width(backgroundWidth).height(backgroundHeight);
			}
		});
		return [new ajaxart.classes.StretchImage()];
	}
});

/*********/



aa_gcs("imagegallery", { 

});

/*********/



aa_gcs("image", { 

});

/*********/



aa_gcs("gstudio", { 

});

/*********/



aa_gcs("field_feature", { 
CssClass:function (profile,data,context)
	{
		var field = context.vars._Field[0];
		var cssClass = aa_text(data,profile,'ClassName',context);
		var to = aa_text(data,profile,'AddClassTo',context);
		aa_bind(field,'ModifyCell',function(args) {
			var passCondition = aa_bool(args.FieldData,profile,'ConditionForClass',context);
			if (passCondition) {
				var elem = args.Wrapper;
				if (to == 'content') elem = args.Wrapper.firstChild || args.Wrapper;

				$(elem).addClass(cssClass);
			}
		});
	},
Css:function (profile,data,context)
	{
		var field = context.vars._Field[0];
		var css = aa_text(data,profile,'Css',context);
		aa_field_handler(field,'ModifyCell',function(cell,field_data,cell_presentation,ctx,item)
		{
			var cls = aa_attach_global_css(css,null,field.Id,true,false,ctx);
			jQuery(cell).addClass(cls+'_wrapper');
			var content = cell.firstChild || cell;
			jQuery(content).addClass(cls);
		},null,200);	
	}
});

/*********/



aa_gcs("field_control", { 
Image:function (profile,data,context) // GC of field_control.Image
  {
		var field = context.vars._Field[0];
		var defaultImage = aa_text(data,profile,'DefaultImage',context);

		field.Control = function(field_data,ctx) {
			var image = aa_first(field_data,profile,'Image',context);
			if (image && image.Url)
			  image.StaticUrl = aa_totext(image.Url(field_data,context)) || defaultImage;

			var image2 = aa_create_static_image_object(image);			
			var style = aa_first(data,profile,'Style',context);
			
			return [aa_renderStyleObject(style,{ Field: field, image: image2, data: field_data[0] },context,true)];
		};
  }
});

/*********/



aa_gcs("field_aspect", { 
ItemListContainer:function (profile, data, context) {
        var field = context.vars._Field[0];
        jBart.bind(field,'ModifyInstanceContext',function(args) {
            var items = ajaxart.run(args.FieldData, profile, 'Items', context);
            args.Context.vars.ItemListCntr = [aa_itemlistContainer(items,field.Id,field)];
            
            jBart.trigger(field,'initItemlistCntr',args.Context.vars.ItemListCntr[0]);
        });
        field.hasItemlistContainer = true;
    },
FieldData:function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
		var moreVars = null;
		if (context.vars._FieldItem) // dynamic fields
			moreVars = {_FieldItem : context.vars._FieldItem};
		aa_addMethod(field,'FieldData',profile,'FieldData',context,moreVars);
		return [];
	},
Variable:function (profile,data,context) {
		var field = context.vars._Field[0];
		var varName = aa_text(data,profile,'VarName',context);

		jBart.bind(field,'ModifyInstanceContext',function(args) {
			var ctx2 = aa_merge_ctx(context,args.Context);
			args.Context.vars[varName] = ajaxart.run(args.FieldData,profile,'Value',ctx2);
		});
	},
CheckConditionForEveryItem:function (profile,data,context) {
		return [{
			apply: function(field,context) {
				var use_field_data = aa_text(data,profile,'DataForCondition',context) == 'Field data';
				field.IsCellHidden = function(item_data,ctx,field_data) {	// field_data param is optional. If not passes, we calculate it
					var input_data = item_data;
					if (use_field_data && field_data)
						input_data = field_data;
					else if (use_field_data && field.FieldData)
						input_data = field.FieldData(item_data,aa_merge_ctx(context,ctx));

					return !aa_bool(input_data,profile,'ShowCondition',aa_merge_ctx(context,ctx));	// todo: compile
				};
				field.RenderHiddenCell = aa_text(data,profile,'WhenHidden',context) != 'Do not render';

				aa_bind(field,'ModifyControl',function(args) {
					if (field.IsCellHidden(args.Item,args.Context,args.FieldData))
						aa_hide(args.Wrapper);
				});

			}
		}];
	},
Hidden:function (profile,data,context) {
		var field = context.vars._Field[0];
		var on_condition = aa_first(data,profile,'OnCondition',context);
		if (!on_condition) {
			field.IsHidden = true;
			field.IsFieldHidden = function() { return true; }

			// backward compatability
			aa_bind(field,'ModifyControl',function(args) {
				aa_hide(args.Wrapper);
			});
		}
		else
			if (on_condition.apply) on_condition.apply(field,context);
	},
VisualContainer:function (profile,data,context) {	
		var field = context.vars._Field[0];
		field.SectionStyle = aa_first(data,profile,'Style',context);
		var heightByCss = aa_bool(data,profile,'HeightByCss',context);

		aa_bind(field,'ModifyInstanceContext',function(args) {
			var visualCntr = {
				ID: aa_text(data,profile,'ID',context),
				type: 'div',
				heightByCss: heightByCss,
				init: function(top) {
					this.el = top;
					top.jbVisualContainer = this;
					$(top).addClass('aa_visual_container');
					$(top).css('position','relative');
					if (this.width) {
						$(top).width(this.width).css('overflow-x','hidden');
					}

					if (this.originalHeight) {
						$(top).height(this.height).css('overflow-y','auto');				
					} else if (this.width && !heightByCss) {
						$(top).css('overflow-y','hidden');
					}
					if (this.originalHeight || heightByCss) {
						$(top).scroll(function() {
							aa_handleScroll(visualCntr,top);
						});						
					}
			
					aa_trigger(field,'initVisualContainer',{ visualContainer: this });
				},
				ForceWidth: function(width) { 
					this.width = this.forceWidth = width; 
					$(this.el).width(width);
					this.fireResize();
				},
				ForceHeight: function(height) { 
					this.height = this.forceHeight = height; 
					$(this.el).height(height);
					this.fireResize();
				},
				fireResize: function() {
					if (!this.el) return;
					var elems = $(this.el).find('.aa_resize_listener');
					for(var i=0;i<elems.length;i++) {
						try {
							elems[i].jbOnWindowResize();
						} catch(e) {
							ajaxart.logException('error in visual container resize callback',e);
						}
					}		
				},
				recalc: function() {
					var widthObj = aa_first(data,profile,'Width',context);
					var heightObj = aa_first(data,profile,'Height',context);
					this.width = widthObj ? widthObj.val : 0;
					this.originalHeight = heightObj ? heightObj.val : 0;
					this.height = this.originalHeight || aa_windowVisualContainer().height;
					if (heightByCss && !this.originalHeight) this.height = 0;

					if (this.forceWidth) this.width = this.forceWidth;
					if (this.forceHeight) this.height = this.forceHeight;
				},
				scrollY: function() {
					return (this.originalHeight  || heightByCss) ? this.el.scrollTop : window.pageYOffset;
				},
				scrollTop: function(y) {
					if (this.originalHeight || heightByCss)
						$(this.el).scrollTop(y);
					else
						$(window).scrollTop(y);
				},
				absTop: function() {
					return aa_absTop(this.el,true);
				}
			}
			visualCntr.recalc();

	    args.Context.vars.VisualContainer = [visualCntr];
	  });

		aa_bind(field,'beforeWrapWithSection',function(args) {
			args.sectionObject.VisualContainer = args.context.vars.VisualContainer[0];
		});

	}
});

/*********/



aa_gcs("field", { 
ItemList:function (profile, data, context) 
    {
        var field = {
            Title: aa_multilang_text(data, profile, 'Title', context),
            FieldData: function (data) { return data; },
            IsItemList: true
        };
        field.Id = aa_text(data, profile, 'ID', context);
        field.ID = [field.Id];
        field.SectionStyle = aa_first(data,profile,'SectionStyle',context);
        
        var ctx = aa_ctx(context, { _Field: [field] });
        field.View = aa_first(data, profile, 'View', ctx);
        field.Control = function (data1, ctx) {
            var ctx2 = aa_ctx(ctx,{});
            jBart.trigger(field,'ModifyInstanceContext',{ Context: ctx2, FieldData: data1 });
            
            var itemlist = aa_create_itemList(field,ctx2,data1);
            itemlist.Fields = ajaxart.runsubprofiles(data, profile, 'Field', aa_merge_ctx(context, ctx2));
            itemlist.VisibleFields = [];
            for(var i=0;i<itemlist.Fields.length;i++) {
                if (itemlist.Fields[i].CalculatedOnly) itemlist.Fields[i].Calculate(data1,ctx2);
                if (itemlist.Fields[i].IsHidden ) continue;
                if (itemlist.Fields[i].IsFieldHidden && itemlist.Fields[i].IsFieldHidden(data1,ctx) ) continue;
                itemlist.VisibleFields.push(itemlist.Fields[i]);
            }
            jBart.trigger(field,'InnerFields',{ Context: ctx2, FieldData: data1, Fields: itemlist.VisibleFields });

            aa_renderStyleObject2(field.View,itemlist,data1,field,ctx2);
            itemlist.el.jbApiObject = itemlist.el.jbItemList = itemlist;
            jBart.trigger(field, 'initItemList', itemlist); // allows aspects to alter the itemlist (e.g. incremental build)

            itemlist.Refresh();
            itemlist.el.jbContext = ctx2;
            
            if (field.SectionStyle) return [ aa_wrapWithSection(itemlist.el,field,field.SectionStyle,data1,ctx2) ];
            return [itemlist.el];
        }
        ajaxart.runsubprofiles(data, profile, 'FieldAspect', ctx);

        return [field];
    },
Control:function (profile,data,context)
	{
		var field = { isObject : true };
		field.Title = aa_multilang_text(data,profile,'Title',context);
		field.Id = aa_text(data,profile,'ID',context);
		field.ID = [field.Id];
		field.FieldData = function(data1) { return data1; }
		field.CellPresentation = ["control"];
		field.ReadOnly = true;
		field.HideTitle = aa_bool(data,profile,'HideTitle',context);
		
		var newContext = aa_ctx(context,{_Field: [field]} );
		ajaxart.run(data,profile,'Control',newContext);
		ajaxart.runsubprofiles(data,profile,'FieldAspect',newContext);
		
	    return [field];
	},
RefreshField:function (profile,data,context)
	{
		var fieldID = aa_text(data,profile,'FieldID',context);
		if (!fieldID) return;
		var field_ids = fieldID.split(',');
		var scope = aa_text(data,profile,'Scope',context);
		aa_refresh_field(field_ids,scope,aa_bool(data,profile,'FireOnUpdate',context),aa_first(data,profile,'Transition',context),context);
	}
});

/*********/



aa_gcs("data", { 
IfThenElse:function (profile,data,context)
	  { 
		return aa_ifThenElse(profile,data,context);
	  },
Pipeline:function (profile,data,context)
	  {
			if (data.length > 1) data = [ data[0] ];
			var itemProfiles = ajaxart.subprofiles(profile,'Item');
			var nextData = data;

			for(var i=0;i<itemProfiles.length;i++) {
				var itemProfile = itemProfiles[i];
				var arr = [];
				if (nextData.length === 0 && i != 0) return [];

				if (data.length <= 1 && i === 0)
					arr = ajaxart.run(nextData,itemProfile,"",context);
				else 
				{
					var compiledFunc = ajaxart.compile(itemProfile,'',context);

					if (compiledFunc == "same") continue;
					
					if (compiledFunc == null)
						for(var j=0;j<nextData.length;j++) 
							ajaxart.concat(arr,ajaxart.run([ nextData[j] ],itemProfile,"",context) );
					else
						for(var j=0;j<nextData.length;j++) 
							ajaxart.concat(arr,compiledFunc([nextData[j]],context) );
				}
				
				nextData = arr;
			}

			// now aggregators
		  var aggProfiles = ajaxart.subprofiles(profile,'Aggregator');
			  
		  for(var i=0;i<aggProfiles.length;i++) {
				nextData = ajaxart.run(nextData,aggProfiles[i],'',context); 
			}

			return nextData;
		},
JavaScript:function (profile,data,context)
	  {
			var ret = aa_run_js_code(aa_text(data,profile,'Code',context),data,context);
			if (!ret) return [];
			if (typeof(ret) == 'string') return [ret];
			if (typeof(ret) == 'number') return [""+ret];
			if (typeof(ret) == 'boolean') {
				if (ret) 
					return ["true"];
				else
					return [];
			}
			if (ajaxart.isArray(ret)) return ret;
			return [ret];
	  },
Same:function (profile,data,context)
	  {
	  	return data;
	  },
Url:function (profile,data,context)
  {
	  var str = "" + window.location.href;
	  return [str];
  }
});

/*********/



aa_gcs("control", { 
Button:function (profile, data, context) {
		aa_init_class('Button',{
			action: function(e,extra_vars) {
				if (window.aa_incapture || this.disabled) return;

				var ctx = aa_ctx(this.context, {
					ControlElement: [this.el],
					_DomEvent: [e]
				});
				if (extra_vars)
					ctx = aa_ctx(ctx,extra_vars);
				var out = ajaxart.run(this.data, this.profile, 'Action', ctx);
				if (e && e.stopPropagation) e.stopPropagation();
				if (e) e.cancelBubble = true;
				return out;
			},
			onActionEnd: function(callback) {
				this._isAsync = true;
				jBart.bind(this, 'actionEnd', callback);
			}
		});	

		var field = {
			Id: aa_text(data, profile, 'ID', context),
			Title: aa_multilang_text(data, profile, 'Title', context),
			Image: aa_first(data, profile, 'Image', context),
			Style: aa_first(data, profile, 'Style', context)
		};
		field.ID = [field.Id];

		field.Control = function(field_data, ctx) {
			var ctx2 = aa_merge_ctx(context, ctx);
			var text = aa_multilang_text(field_data, profile, 'ButtonText', ctx2) || field.Title;
			if (field.Image && field.Image.Url) field.Image.StaticUrl = aa_totext(field.Image.Url(field_data, ctx2));

			var image = aa_create_static_image_object(field.Image);
			var disabled = aa_bool(field_data, profile, 'Disabled', ctx2);

			var buttonApiObject = new ajaxart.classes.Button({
				text: text,
				tooltip: aa_multilang_text(field_data, profile, 'Tooltip', ctx2),
				image: image,
				disabled: disabled,
				data: field_data,
				profile: profile,
				field: field,
				field_data: field_data,
				context: ctx2
			});

			var out = aa_renderStyleObject(field.Style, buttonApiObject, ctx2, true);
			if (disabled) jQuery(out).addClass('disabled');
			return [out];
		};
		ajaxart.runsubprofiles(data, profile, 'FieldAspect', aa_ctx(context, {
			_Field: [field]
		}));
		return [field];
	},
ImageGallery:function (profile, data, context) {
		var field = aa_create_base_field(data, profile, context);
		field.Control = function(field_data, ctx) {
			var images = ajaxart.run(field_data, profile, 'Images', context);
			var ctx2 = aa_merge_ctx(context, ctx);
			return [aa_renderStyleObject(field.Style, {
				images: images
			}, ctx2, true)];
		};
		return [field];
	},
CustomControl:function (profile, data, context) {
		var field = aa_create_base_field(data, profile, context);

		field.Control = function(field_data, ctx) {
			var style = aa_first(field_data, profile, 'Control', context);;
			return [aa_renderStyleObject(style, {
				Field: field,
				Data: field_data,
				Context: context,
				context: context
			}, context)];
		};
		return [field];
	},
Label:function (profile, data, context) // gc of control.Label
	{
		var field = {
			Id: aa_text(data, profile, 'ID', context),
			Title: aa_multilang_text(data, profile, 'Title', context),
			Style: aa_first(data, profile, 'Style', context),
			TitleAsText: !profile.getAttribute('Text') && !aa_xpath(profile, 'Text')[0]
		};
		field.ID = [field.Id];

		var ctx2 = aa_ctx(context, { _Field: [field] });

		field.Label = function(field_data,ctx) {
			var text = field.TitleAsText ? field.Title : aa_multilang_text(field_data, profile, 'Text', aa_merge_ctx(ctx2, ctx));
			text = text.replace(/\n/g, "<br/>");
			return [text];
		};
		field.Control = function(field_data, ctx) {
			var text = this.Label(field_data,ctx)[0];

			return [aa_renderStyleObject(field.Style, {
				text: text,
				data: field_data[0]
			}, ctx)];
		};
		ajaxart.runsubprofiles(data, profile, 'FieldAspect', ctx2);
		return [field];
	},
Layout:function (profile, data, context) {
		aa_init_class('Layout',{
			getControlsCount: function(controlTemplate) {
				return this.fields.length;
			},
			getControl: function(index,wrapper) {
				aa_fieldControl({
					Field: this.fields[index],
					Wrapper: wrapper,
					Item: this.field_data,
					Context: this.context
				});		
			}
		});

		var layout_field = {
			Id: aa_text(data, profile, 'ID', context),
			Title: aa_multilang_text(data, profile, 'Title', context),
			Style: aa_first(data, profile, 'Layout', context),
			SectionStyle: aa_first(data, profile, 'SectionStyle', context)
		};

		layout_field.Control = function(field_data, ctx) {
			var baseCtx = aa_ctx(ctx, {});
			var ctx2 = aa_merge_ctx(context, baseCtx);
			var fields = ajaxart.runsubprofiles(field_data, profile, 'Field', ctx2);
			var newFields = [];
			for (var i = 0; i < fields.length; i++) { // we do not need the constant hidden fields
				if (!fields[i].RenderHiddenCell) {
					if (fields[i].CalculatedOnly) fields[i].Calculate(field_data, ctx2);
					if (fields[i].IsHidden) continue;
					if (fields[i].IsCellHidden && fields[i].IsCellHidden(field_data, ctx2)) continue;
				}

				newFields.push(fields[i]);
			}
			fields = newFields;
			jBart.trigger(layout_field, 'InnerFields', {
				Context: ctx2,
				FieldData: field_data,
				Fields: fields
			});

			var layout = new ajaxart.classes.Layout({
				fields: fields,context: ctx2,field_data: field_data, field: layout_field
			});
			var out = aa_renderStyleObject(layout_field.Style,layout,ctx2,true);
			if (layout_field.SectionStyle) {
				return [aa_wrapWithSection(out, layout_field, layout_field.SectionStyle, field_data, ctx2)];
			}
			return [out];
		};

		ajaxart.runsubprofiles(data, profile, 'FieldAspect', aa_ctx(context, {
			_Field: [layout_field]
		}));
		return [layout_field];
	}
});

/*********/



aa_gcs("btn", { 

});

/*********/



aa_gcs("bart_url", { 
NewUrlFragment:function (profile,data,context)
	{
		var current = aa_text(data,profile,'Current',context);
		var proposed = aa_text(data,profile,'Proposed',context);

		var curr = current.split('?');
		var prop = proposed.split('?');
		
		var prop_index = "";
		for(var i=1;i<prop.length;i++) {
			if ( prop[i].length > 0 && prop[i].charAt(prop[i].length-1) == ';') prop[i] = prop[i].substring(0,prop[i].length-1);
			
			var item = prop[i].substring(0,prop[i].indexOf('='));
			if (item == '') continue;
			if (i==1) prop_index += ",";
			prop_index = prop_index + item + ",";
		}
		
		var out = "";
		for(var i=1;i<prop.length;i++) {
			var pos = prop[i].indexOf('=');
			if (pos == -1 || pos == prop[i].length-1) continue;
			out += "?" + prop[i];
		}
	
		for(var i=1;i<curr.length;i++) {
			var attr = curr[i].substring(0,curr[i].indexOf('='));
			if (attr.length == 0) continue;
			if (prop_index.indexOf(',' + attr + ',') > -1 ) continue;
//			var _pos = attr.indexOf('_');
//			if (_pos == 0) continue;
//			if (_pos > -1) {
//				var tempPrefix = attr.substring(0,_pos);
//				if (prop_index.indexOf(',' + tempPrefix + ',') > -1 ) continue;
//			}
			out += "?" + curr[i];
		}
		return [out];
	}
});

/*********/



aa_gcs("async", { 
AsyncActionBeforeLoad:function (profile, data, context) {
		aa_field_setAsyncActionBeforeLoad({
			field: context.vars._Field[0],
			asyncAction: function() {
				return ajaxart.run(data, profile, 'Action', context);
			},
			loadingStyle: aa_first(data, profile, 'LoadingStyle', context),
			loadingText: aa_text(data, profile, 'LoadingText', context),
			errorText: aa_text(data, profile, 'TextForError', context),
			showLoadingTextOnly: aa_bool(data,profile,'ShowLoadingTextInStudio',context) && ajaxart.jbart_studio
		});
	}
});

/*********/



aa_gcs("appfeature", { 
Responsive:function (profile, data, context) { 
		var cssClasses = '';
		var ctx2 = context;

		return [{
			Load: function(data1,ctx) {
				ctx2 = aa_merge_ctx(context,ctx);
				calculateCssClasses();

				if (ajaxart.jbart_studio) {
					aa_bind(context.vars._AppContext[0],'showPageInStudio',function(args) {
						studioRefresh(args);
					});
				} else 
					$(aa_body()).addClass(cssClasses);
			}
		}];

		function calculateCssClasses() {
			cssClasses = '';
			if (ajaxart.jbart_studio) {
				var width = aa_toint( ajaxart.runNativeHelper(data,profile,'WidthForStudio',ctx2) );
			} else
				var width = $(aa_body()).width();

			if (width >= 800 && width <= 1024) cssClasses += ' width_1024';
			if (width <= 600) cssClasses += ' width_mobile_phone';
		}

		function studioRefresh(args) {
			calculateCssClasses();

			var classes = (args.Wrapper.classNames || '').split(' ');
			for(var i=0;i<classes.length;i++)
				if (classes[i].indexOf('width_') == 0)
					$(args.Wrapper).removeClass(cssClasses);		

			$(args.Wrapper).addClass(cssClasses);
		}
	}
});

/*********/



aa_gcs("action", { 
IfThenElse:function (profile,data,params)
{
	  return aa_ifThenElse(profile,data,params);
},
RunActions:function (profile,data,context)
	{
		ajaxart.runsubprofiles(data,profile,'Action',context);
	}
});

/*********/



aa_gcs("jbart_api", { 
ShowWidget:function (profile,data,context)
	{
		var controlToShowFunc = null; // for auto-tests
		if (aa_paramExists(profile,'ControlToShowInBartContext')) {
			controlToShowFunc = function(data1,ctx) {
				return aa_first(data1,profile,'ControlToShowInBartContext',aa_merge_ctx(context,ctx));
			}
		}

		var ctx = aa_create_jbart_context({
			WidgetXml: aa_first(data,profile,'WidgetXml',context),
			Language: aa_text(data,profile,'_Language',context),
			Context: context			
		});

		var out = aa_show_jbart_widget_page({
			Context: ctx,
			page: aa_text(data,profile,'Page',context),
			success: function(data,ctx) { 
				ajaxart.run(data,profile,'RunAfter',aa_merge_ctx(context,ctx));		
			},
			ControlToShowInBartContext: controlToShowFunc
		});

		return [out];
	}
});

/*********/



aa_gcs("validation", { 

});
ajaxart.load_xtml_content('',ajaxart.parsexml('<xtml package="true"><xtml ns="yesno"><Component id="Contains" type="data.Boolean" execution="native"><Param name="AllText"><Default t="data.Same"/></Param><Param name="Text" type="data.Data[]" essential="true"/><Param name="IgnoreCase" type="data.Boolean"><Default value="false"/></Param><Param name="IgnoreOrder" type="data.Boolean"><Default value="false"/></Param><Param name="OneOf" type="data.Boolean"/></Component><Component id="IsEmpty" type="data.Boolean" execution="native"><Param name="Value" Default="%%"/><Param name="CheckInnerText" type="data.Boolean"/></Component><Component id="NotEmpty" type="data.Boolean" execution="native"><Param name="Value" Default="%%" essential="true"/><Param name="CheckInnerText" type="data.Boolean"/></Component><Component id="And" type="data.Boolean" execution="native"><Param name="Item" type="data.Boolean[]" script="true" essential="true"/></Component></xtml><xtml ns="xtml"><Component id="UseParamArray" type="*" execution="native" dtsupport="false"><Param name="Param" essential="true"/></Component><Component id="UseParam" type="*" execution="native" dtsupport="false"><Param name="Param" essential="true"/><Param name="Input" Default="%%"/></Component><Component id="ComponentDefinition" type="data.Data" execution="native"><Param name="ID" essential="true"/><Param name="ToXtml" type="data.Boolean"/></Component><Component id="RunXtml" type="*" execution="native" dtsupport="false"><Param name="Xtml" essential="true" remark="no default (in js)"/><Param name="Input" remark="default %% in js"/><Param name="ForceInputParam" type="data.Boolean"/><Param name="Field"/><Param name="Method"/></Component><Component id="Params" type="data.Data" execution="native" dtsupport="false"><Param name="Param" type="data.Data[]"/><Param name="ScriptParam" type="data.Data[]"/><Param name="Method" type="data.Data[]"/><Param name="ScriptParamArray" type="data.Data[]"/></Component></xtml><xtml ns="xml"><Component id="Xml" type="data.Data" execution="native"><Param name="*" type="xml"/><Param name="DynamicContent" type="data.Boolean" Default="false"/><Param name="EncodeDynamicContent" type="data.Boolean" Default="true" description="set to false when using cdata"/></Component></xtml><xtml ns="visual_container"><Component id="MobileSkin" type="visual_container.Style"><xtml t="ui.CustomStyle"><Css><![CDATA[#this {\r\n  display: inline-block;\r\n  position: relative;\r\n  border1: 1px solid #AF9D9D;\r\n  border-radius: 5px;\r\n  background-clip: padding-box;\r\n  background-color1: #232323;\r\n  background-color: #fdfdfd;\r\n  box-shadow: 0 0 15px rgba(0,0,0,.28), inset 0 1px 1px rgba(255,255,255,.45), inset 0 0 2px rgba(255,255,255,.2);\r\n  padding: 13px;\r\n}\r\n#this>.section_body {\r\n  background:white;\r\n}\r\n#this>.section_body::-webkit-scrollbar\r\n {\r\n  width: 5px;\r\n}\r\n#this>.section_body::-webkit-scrollbar-thumb\r\n{\r\n  border-radius: 5px;\r\n  background: #BBB;\r\n}\r\n#this>.section_body::-webkit-scrollbar-track {\r\n  background: #111;\r\n}\r\n]]></Css><Html><![CDATA[<div>\r\n  <div class="section_body"/>\r\n</div>]]></Html><Javascript><![CDATA[function(section) {\r\n  aa_visualContainerStyle(section);\r\n}]]></Javascript></xtml></Component></xtml><xtml ns="uitext"><Component id="PlainText" type="uitext.Style"><xtml t="ui.CustomStyle" Html="&lt;div /&gt;" Css="#this { }"><Javascript><![CDATA[function(textObj) { \r\n  textObj.$el.html(textObj.text);\r\n}]]></Javascript><![CDATA[]]></xtml></Component></xtml><xtml ns="uiaction"><Component id="GoToPage" type="action.Action" execution="native"><Param name="Url" essential="true"/><Param name="Type" type="enum"><Default value="open in a new tab"/><value>navigate current page</value><value>open in a new tab</value></Param></Component><Component id="GoToUrl" type="action.Action" execution="native" hidden="true" light="false"><Param name="Url" essential="true"/></Component><Component id="SetUrlFragment" type="action.Action" light="false"><Param name="Fragment"/><Param name="Attribute" essential="true"/><Param name="Value" essential="true"/><xtml t="action.IfThenElse"><If t="yesno.NotEmpty" Value="%$Fragment%"/><Then t="uiaction.GoToUrl"><Url t="data.Pipeline"><Item t="data.Url"/><Item t="text.Replace" Find="#.*" ReplaceWith="" UseRegex="true"/><Item t="text.Concat" Suffix="#%$Fragment%"/></Url></Then><Else t="uiaction.SetUrlFragment"><Fragment t="bart_url.NewUrlFragment" Proposed="?%$Attribute%=%$Value%"><Current t="ui.UrlFragment"/></Fragment></Else></xtml></Component></xtml><xtml ns="ui"><Component id="CustomStyle" type="data.Data" customPT="true" execution="native"><Param name="Html" codemirror="true" light="false"/><Param name="Css" codemirror="true" light="false"/><Param name="Javascript" codemirror="true" light="false"/></Component><Component id="UrlFragmentAttribute" type="data.Data" execution="native"><Param name="Url"/><Param name="Attribute"/></Component><Component id="CustomCss" type="data.Data" execution="native" customPT="true"><Param name="Style" light="false"/><Param name="Css" codemirror="true" light="false"/></Component><Component id="UrlFragment" type="data.Data"><Param name="Attribute" essential="true"/><xtml t="data.Pipeline"><Item t="data.Url"/><Item t="text.Split" Separator="#" Part="Second"/><Item t="data.IfThenElse" Then="%%"><If t="yesno.IsEmpty" Value="%$Attribute%"/><Else t="ui.UrlFragmentAttribute" Url="%%" Attribute="%$Attribute%"><Url t="data.Url"/></Else></Item><Item t="text.UrlEncoding" Type="decode"/></xtml></Component></xtml><xtml ns="text_as_item"><Component id="Default" type="text_as_item.Style"><xtml t="ui.CustomStyle"><Html><![CDATA[<div/>]]></Html><Css><![CDATA[#this { cursor: pointer; color:#333; }\r\n        #this:not(.in_table) { padding-top: 10px; clear: both; }\r\n        #this.in_table { padding:3px; } ]]></Css><Javascript><![CDATA[function (showMoreObject) {\r\n        aa_text_as_item(showMoreObject);\r\n}]]></Javascript></xtml></Component></xtml><xtml ns="text"><Component id="Replace" type="data.Data" execution="native"><Param name="Find" essential="true"/><Param name="ReplaceWith" essential="true"/><Param name="UseRegex" type="data.Boolean"><Default value="false"/></Param><Param name="ReplaceAll" type="data.Boolean"><Default value="true"/></Param><Param name="Text" Default="%%"/></Component><Component id="Split" type="data.Data" execution="native"><Param name="Separator" Default=","/><Param name="Text" Default="%%"/><Param name="Part" type="enum" Default="All" Options="All,First,ButFirst,Second,By index,Last,All but Last,All but First,All but First and Last"/><Param name="Index" type="data.Data" description="Relevant only for \'By Index\' Part"/><Param name="NoEmptyValues" type="data.Boolean"/><Param name="Regex" type="data.Boolean" description="Use regular expression as a separator"/><Param name="Default" description="default result if empty value"/></Component><Component id="UrlEncoding" type="data.Data" execution="native"><Param name="Data" title="Text"/><Param name="Type" type="enum"><Default value="encode"/><value>encode</value><value>decode</value></Param></Component><Component id="ToIdText" type="data.Data" execution="native"/><Component id="Concat" type="data.Aggregator" execution="native"><Param name="Items" light="false"><Default t="data.Same"/></Param><Param name="Item" light="false" type="data.Data[]"/><Param name="Separator" short="true" essential="true"/><Param name="LastSeparator" advanced="true" short="true"/><Param name="ItemText" short="true"><Default t="data.Same"/></Param><Param name="Prefix" advanced="true"/><Param name="Suffix" advanced="true"/><Param name="MaxLength" advanced="true"/><Param name="SuffixForMax" advanced="true"><Default value="..."/></Param></Component></xtml><xtml ns="sample"><Component id="main" type="jbart.MyWidgetPage"><xtml t="control.Layout" ID="main" Title="main"><FieldAspect t="field_aspect.FieldData" FieldData="%$Data%"/><Layout t="ui.CustomCss" base="layout.Default"><Style t="layout.Default"/><Css><![CDATA[#this {} .body_top {\n  background-image:-webkit-linear-gradient(123deg, #6578da 0\\%, #435091 50\\%, #222849 100\\%);\n  background-color:#435091;\n}\n.body_top_title {\n  color:#ffffff;\n  font-size:38px;\n  padding-top:40px;\n  text-align:center;\n}\n.body_second_title {\n  color:#ffffff;\n  font-size:22px;\n  padding-top:30px;\n  text-align:center;\n}\n.body_group {\n  background:#F7F7F7;\n}\n.body_item_title {\n  font-weight:500;\n  font-size:26px;\n  color:#45494d;\n  padding-top:37px;\n}\n.body_item_second_title {\n  font-style:normal;\n  font-size:16px;\n  color:#45494d;\n  padding-top:24px;\n  padding-left:38px;\n}\n.paragraph_inner {\n  width:1110px;\n  margin:auto;\n}\n.paragraph_left {\n  width:500px;\n}\n.paragraph_image {\n  padding-top:40px;\n}\n.inner_text {  \n  width:400px;\n  font-size:17px;\n  margin-top:40px;\n}]]></Css></Layout><Field t="control.Layout" ID="_Vertical_Layout" Title="Top Bar"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this { height: 84px; background-color: #f4f7f9; \n  z-index: 100; }\n]]></Css></Layout><Field t="control.Layout" ID="_Vertical_Layout2" Title="Logo"><Layout t="layout.HorizontalCss3" Spacing=""/><Field t="field.Image" ID="_Image" Title="Image"><Image t="img.Image" Url="http://letmesee2.storage.googleapis.com/artlogo.png"><AdjustSize t="img.Center"/></Image><Style t="image.PlainImage"/></Field><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { top: 14px; padding-left: 17px; padding-top: 15px; }\n#wrapper { }\n]]></Css></FieldAspect></Field><Field t="control.Layout" ID="_Vertical_Layout3" Title="Pages"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this { position: absolute; top: 21px; left: 280px; \n  margin-left: 43px; }\n.width_mobile_phone #this { display: none; }\n]]></Css></Layout><Field t="field.ItemList" Title="items" ID="itemslist"><FieldAspect t="field_aspect.ItemListContainer"><Items t="itemlist.Items" Items="%$Pages/page%"/></FieldAspect><FieldAspect t="itemlist_aspect.ShowTextWhenNoItems"/><View t="ui.CustomCss" base="itemlist_style.Tiles"><Style t="itemlist_style.Tiles"/><Css><![CDATA[#this>*>.aa_item {\n  float:left;\n  margin:0 45px 5px 0;\n}\n#this>.clean {\n  clear:both;\n}]]></Css></View><Field t="control.Button" ID="_Button" Title="General" HideTitle="true" ButtonText="%@name%"><Style t="ui.CustomCss" base="btn.Hyperlink"><Style t="btn.Hyperlink"/><Css><![CDATA[#this { font-weight: 600; font-style: normal; \n  line-height: 36px; height: 36px; font-size: 14px; \n  color: #7b8386; cursor: pointer; \n  padding-bottom: 5px; }\n#this.selected { border-bottom: 2px solid #4DACF9; \n  color: #322f31; }\n#this:hover { transition-property: all; \n  transition-duration: 1.3s; \n  color: #50b1ff; }\n]]></Css></Style><Action t="action.RunActions"><Action t="uiaction.SetUrlFragment" Attribute="page" Value="%@id%"/><Action t="field.RefreshField" FireOnUpdate="" FieldID="main" Scope="screen"/></Action><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="selected"><ConditionForClass t="yesno.And"><Item value="%$PageInUrl% == %@id%"/><Var name="PageInUrl" t="ui.UrlFragment" Attribute="page"/></ConditionForClass></FieldAspect></Field></Field></Field><Field t="control.Button" ID="_Button3" Title="Mobile pages popup"><Style t="btn.MobilePagesButton"/><FieldAspect t="field_feature.Css"><Css><![CDATA[#this {\r  top:18px;\r  right:20px;\r  position:absolute;\r  display:none;\r}\r.width_mobile_phone #this {\r  display:block;\r}]]></Css></FieldAspect><Action t="popup.OpenPopup"><Style t="ui.CustomStyle" base="popup.Default"><Html><![CDATA[<div>\r <div class="aa_popup_cover" />\r <div class="aa_popup_frame">\r  <div class="aa_popup_contents" />\r </div>\r</div>]]></Html><Css><![CDATA[#this>.aa_popup_cover {\r  background:#fff;\r  opacity:0.99;\r  position:fixed;\r  left:0;\r  right:0;\r  top:0px;\r  bottom:0;\r}\r#this>.aa_popup_frame {\r  background:transparent;\r  position:absolute;\r  left:20px;\r  right:20px;\r  top:70px;\r}]]></Css><Javascript><![CDATA[function show(popup) {\r    aa_popup(popup,{\r      screenCover: true,\r      features: [\r        aa_popup_feature_closeOnEsc()\r      ]\r    });\r}]]></Javascript></Style><Contents t="field.InnerPage" Title="pages"><Layout t="layout.Default"/><Field t="field.ItemList" Title="items" ID="itemslist1"><FieldAspect t="field_aspect.ItemListContainer"><Items t="itemlist.Items" Items="%$Pages/page%"/></FieldAspect><FieldAspect t="itemlist_aspect.ShowTextWhenNoItems"/><View t="itemlist_style.Simple"/><Field t="control.Button" ID="_Button4" Title="Page" HideTitle="true" ButtonText="%@name%"><Style t="ui.CustomCss" base="btn.GreenButton"><Style t="btn.GreenButton"/><Css><![CDATA[#this {\r  width: 100\\%;\r  cursor:pointer;\r  background: #EEF3F6;\r  font: bold 13px arial;\r  text-align:center;\r  border:none;\r  margin-bottom:10px;\r  \rline-height: 36px;\rheight: 36px;\rpadding: 0 10px;\rtext-transform: uppercase;\rcolor: #7b8386;  \r}\r#this:hover {\r  color: #50b1ff;\r}\r#this:active {\r}\r#this:focus {\r  outline: none;\r}\r]]></Css></Style><Action t="popup.CloseContainingPopup" ExitMode=""><DoOnExit t="action.RunActions"><Action t="uiaction.SetUrlFragment" Attribute="page" Value="%@id%"/><Action t="field.RefreshField" FireOnUpdate="" FieldID="main" Scope="screen"/></DoOnExit></Action></Field></Field></Contents></Action></Field></Field><Field t="control.Layout" ID="_body" Title="Body"><Layout t="layout.Vertical" Spacing="0"/><Field t="control.Layout" ID="_Vertical_Layout5" Title="home"><Layout t="layout.Vertical" Spacing="0"/><FieldAspect t="field_aspect.Hidden"><OnCondition t="field_aspect.CheckConditionForEveryItem" DataForCondition="Item data" WhenHidden="Do not render" ShowCondition="%$PageID% == \'home\'"/></FieldAspect><Field t="control.Layout" ID="_jbart" Title="State Of The Art"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n  background-color:#F7F7F7;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:57px;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top"/><Field t="control.Label" ID="_Label3" Title="State Of The Art Technology" Text=""><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this { color: #FFFFFF; font-size: 38px; width: 100%; \n  text-align: center; padding-top: 53px; }\n]]></Css></Style></Field><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="ui.CustomCss" base="layout.Horizontal"><Style t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Css><![CDATA[#this {\n}\n#this >.field:first-child {\n  padding-right:83px;\n}]]></Css></Layout><Field t="control.Layout" ID="_Group4" Title="Group"><Layout t="layout.Vertical" Spacing="0"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Artware is a technology company developing state of the art tools for web user experience and real time engagement.&#xa;&#xa;Our technology is commercially deployed worldwide, serving a customer base which includes financial institutes, software, government, and telco.&#xa;&#xa;Our leading product is jBart. jBart Studio is a visual online tool to build web widgets. The resulting widgets are embeddable in any website, web application, or mobile web app"><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this {\n  width:400px;\n  font-size:17px;\n  margin-top:40px;\n  margin-left:70px;\n  color:white;\n}]]></Css></Style></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/caligraphy1.png"><AdjustSize t="img.Center"/><FrameHeight t="img.FixedHeight" Height="296"/></Image><Style t="image.PlainImage"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="Seeking Quality"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:400px;\n  background-color:#F7F7F7;\n}\n]]></Css></Layout><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="ui.CustomCss" base="layout.Horizontal"><Style t="layout.Horizontal" VerticalLayoutForMobileWidth="false" Spacing="92"/><Css><![CDATA[]]></Css></Layout><Field t="control.Layout" ID="_Group4" Title="Group"><Field t="control.Label" ID="_Label3" Title="Seeking Quality in Software Development" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="For us, software development is a continuous process of synthesizing the declarative part of the software. The declarative part, organized in the right way, forms a domain specific language (DSL) which is mastered by the business professionals."><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/brush5.png"><AdjustSize t="img.Fill"/><FrameHeight t="img.FixedHeight" Height="340"/><FrameWidth t="img.FixedWidth" Width="540"/></Image><Style t="image.PlainImage"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_image"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="History Of Success"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:400px;\n  background-color:#ffffff;\n}\n]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout2" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Group"><Field t="control.Label" ID="_Label3" Title="History Of Success" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="The Tgp Methodology was invented by Shai Ben-Yehuda 20 years ago. &#xa;Since then it was successfully implemented in dozens of large projects in various fields generating revenue of hundreds of millions of dollars."><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_left"/></Field><Field t="field.Image" ID="_Image3" Title="Image"><Image t="img.Image" Url="//letmesee2.storage.googleapis.com/building8.png"><AdjustSize t="img.Stretch"/><FrameHeight t="img.FixedHeight" Height="320"/><FrameWidth t="img.FixedWidth" Width="540"/></Image><Style t="image.PlainImage"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_image"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field></Field><Field t="control.Layout" ID="_Vertical_Layout5" Title="Technology"><Layout t="layout.Vertical" Spacing="0"/><FieldAspect t="field_aspect.Hidden"><OnCondition t="field_aspect.CheckConditionForEveryItem" DataForCondition="Item data" WhenHidden="Do not render" ShowCondition="%$PageID% == \'tech\'"/></FieldAspect><Field t="control.Layout" ID="_Vertical_Layout6" Title="Tgp"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n  background-color:#F7F7F7;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:57px;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top"/><Field t="control.Label" ID="_Label3" Title="The Tgp Methodology" Text=""><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this { color: #FFFFFF; font-size: 38px; width: 100%; \n  text-align: center; padding-top: 53px; }\n]]></Css></Style></Field><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="ui.CustomCss" base="layout.Horizontal"><Style t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Css><![CDATA[#this {\n}\n#this >.field:first-child {\n  padding-right:50px;\n}]]></Css></Layout><Field t="control.Layout" ID="_Group4" Title="Group"><Layout t="layout.Vertical" Spacing="0"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Business Professionals master their business. Using the TGP methodology we allow them to master their information systems as well."><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this {\n  width:400px;\n  font-size:17px;\n  margin-top:40px;\n  margin-left:70px;\n  color:white;\n}]]></Css></Style></Field><Field t="control.Label" ID="_Label3" Title="title11" Text="Tgp allows business professionals to continuously form their domain specific language (DSL). Software developers assist this process but not master it. The DSL provides the professionals the agility and power to control their own information systems."><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this {\n  width:400px;\n  font-size:17px;\n  margin-top:40px;\n  margin-left:70px;\n  color:#ffffff;\n}]]></Css></Style></Field><FieldAspect t="field_feature.Css"><Css><![CDATA[#this { width: 400px; }\n#wrapper { }\n]]></Css></FieldAspect></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="https://letmesee1.storage.googleapis.com/site/brush6.png"><AdjustSize t="img.Center"/><FrameWidth t="img.FixedWidth" Width="779"/><FrameHeight t="img.FixedHeight" Height="300"/></Image><Style t="image.PlainImage"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="When Tgp Meets js"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n  background-color:#F7F7F7;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:33px;\n  margin-top:5px;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Group"><Field t="control.Label" ID="_Label3" Title="When TGP Meets Web Technologies" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Javascript is the most portable language in the industry running on any client device and operating system. &#xa;However, javascript is not built for large scale system development.&#xa;TGP and javascript go hand by hand. TGP provides the means to construct declarative languages while javascript is flexible and portable to provide the DSL engine and scripting language.&#xa;&#xa;Tgp and javasctipt is jBart&#xa;"><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/art4.png"><AdjustSize t="img.Stretch"/><FrameHeight t="img.FixedHeight" Height="340"/><FrameWidth t="img.FixedWidth" Width="540"/></Image><Style t="image.PlainImage"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_image"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="Testing"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n  background-color:#ffffff;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:33px;\n  margin-top:5px;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Group"><Field t="control.Label" ID="_Label3" Title="Organic Testing" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Automatic testing is a real challenge and a crucial factor in software agility. Our development methodologies are build around formal definition of the requirements and test automation."><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/brush2.png"><AdjustSize t="img.Stretch"/><FrameHeight t="img.FixedHeight" Height="340"/><FrameWidth t="img.FixedWidth" Width="540"/></Image><Style t="image.PlainImage"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_image"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field></Field><Field t="control.Layout" ID="_Vertical_Layout5" Title="jBart"><Layout t="layout.Vertical" Spacing="0"/><FieldAspect t="field_aspect.Hidden"><OnCondition t="field_aspect.CheckConditionForEveryItem" DataForCondition="Item data" WhenHidden="Do not render" ShowCondition="%$PageID% == \'jbart\'"/></FieldAspect><Field t="control.Layout" ID="_Vertical_Layout6" Title="Web Widgets"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n  background-color:#F7F7F7;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:57px;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top"/><Field t="control.Label" ID="_Label3" Title="Web Widgets &amp; jBart Studio" Text=""><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this { color: #FFFFFF; font-size: 38px; width: 100%; \n  text-align: center; padding-top: 53px; }\n]]></Css></Style></Field><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="ui.CustomCss" base="layout.Horizontal"><Style t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Css><![CDATA[#this {\n  width:1000px;\n}\n#this >.field:first-child {\n  padding-right:50px;\n}]]></Css></Layout><Field t="control.Layout" ID="_Group4" Title="Group"><Layout t="layout.Vertical" Spacing="0"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Web Widgets are web parts that can be embedded in any web page or mobile web app. E.g., google maps, youtube, twitter, eBay, facebook, and many more."><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this {\n  width:400px;\n  font-size:17px;\n  margin-top:40px;\n  margin-left:70px;\n  color:white;\n}]]></Css></Style></Field><Field t="control.Label" ID="_Label3" Title="title11" Text="jBart studio is a robust online tool to develop such web widget on top any API.jBart widgets are used in a wide range of industries for eCommerce, enterprise, mobile web apps, real time engagement, business intelligence, information extraction, and more."><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this {\n  width:400px;\n  font-size:17px;\n  margin-top:40px;\n  margin-left:70px;\n  color:#ffffff;\n}]]></Css></Style></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//www.artwaresoft.com/jbart/site/studio.jpg"><AdjustSize t="img.Center"/><FrameHeight t="img.FixedHeight" Height="260"/></Image><Style t="image.PlainImage"/></Field></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="Responsive Mobile Web Apps"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n  background-color:#F7F7F7;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:33px;\n  margin-top:5px;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Group"><Field t="control.Label" ID="_Label3" Title="Responsive Mobile Web Apps" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="jBart is ideal for developing rich and responsive web apps. Working by example, it keeps its a strong visual development environment within the richness data, screen sizes and devices.  &#xa;&#xa;With jBart you start with your data models and API and build the UI on top of it.&#xa;&#xa;jBart suggests a powerful data binding mechanism with rich set of controls, UX abstractions, and visual customization with html/css/javascript."><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/phone2.png"><AdjustSize t="img.Fill"/><FrameHeight t="img.FixedHeight" Height="340"/><FrameWidth t="img.FixedWidth" Width="540"/></Image><Style t="image.PlainImage"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_image"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="Real Time Engagement"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n  background-color:#ffffff;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:33px;\n  margin-top:5px;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Group"><Field t="control.Label" ID="_Label3" Title="Real Time Engagement" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="jBart widgets support real time engagement. For example, a form defined by jBart allows two users to fill it together. &#xa;&#xa;With these capabilities, jBart is the ideal platform for &quot;Let Me See&quot;, the new way of customer engagement."><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/lmc11.png"><AdjustSize t="img.Fill"/><FrameHeight t="img.FixedHeight" Height="340"/><FrameWidth t="img.FixedWidth" Width="540"/></Image><Style t="image.PlainImage"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_image"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field></Field><Field t="control.Layout" ID="_Vertical_Layout5" Title="LetMeSee"><Layout t="layout.Vertical" Spacing="0"/><Field t="control.Layout" ID="_Vertical_Layout4" Title="LetMeSee"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:0;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top"/><Field t="control.Label" ID="_Label1" Title="Let Me See"><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top_title"/></Field><Field t="control.Label" ID="_Label1" Title="The New Way for Customer Engagement" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_second_title"/></Field><Field t="control.Layout" ID="_Group" Title="Group"><Field t="field.Image" ID="_Image2" Title="Image"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/lmc4.png"><AdjustSize t="img.Stretch"/><FrameWidth t="img.FixedWidth" Width="129"/></Image><Style t="image.PlainImage"/></Field><Field t="field.Image" ID="_Image2" Title="Image1"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/lmc5.png"><AdjustSize t="img.Stretch"/><FrameWidth t="img.FixedWidth" Width="300"/></Image><Style t="image.PlainImage"/></Field><Field t="field.Image" ID="_Image2" Title="Image11"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/lmc6.png"><AdjustSize t="img.Stretch"/><FrameWidth t="img.FixedWidth" Width="194"/></Image><Style t="image.PlainImage"/></Field><Field t="field.Image" ID="_Image2" Title="Image111"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/lmc9.png"><AdjustSize t="img.Stretch"/><FrameWidth t="img.FixedWidth" Width="299"/></Image><Style t="image.PlainImage"/></Field><Layout t="layout.Horizontal" VerticalLayoutForMobileWidth="false" Spacing="34"/><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { width: 960px; margin: auto; padding-top: 24px; }\n#wrapper { }\n]]></Css></FieldAspect></Field></Field><FieldAspect t="field_aspect.Hidden"><OnCondition t="field_aspect.CheckConditionForEveryItem" DataForCondition="Item data" WhenHidden="Do not render" ShowCondition="%$PageID% == \'lmc\'"/></FieldAspect><Field t="control.Layout" ID="_Vertical_Layout6" Title="A Picture Is Worth a Thousand Words"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this { height: 500px; }\n#this >.field:not(:last-child) { margin-bottom: 33px; \n  margin-top: 5px; }\n]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="190" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Group"><Field t="control.Label" ID="_Label3" Title="A Picture Is Worth a Thousand Words" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Often, sales reps find the voice channel too limiting. Enriching voice with images, charts, tables, and calculators makes the difference.&#xa;&#xa;While on a phone call, the agent sends SMS with the customer room url. The customer joins the room and co-browse with the agent.&#xa;&#xa;Following an inbound call, the agent simply prepare a customer room with relevant customer products, benefits, and price offer and send it to customer via mail and SMS.&#xa;The agent can monitor the room activity and follow up the communication using the customer room.&#xa;&#xa;&#xa;"><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/lmc7.png"><AdjustSize t="img.Fill"/><FrameHeight t="img.FixedHeight" Height="340"/><FrameWidth t="img.FixedWidth" Width="540"/></Image><Style t="image.PlainImage"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_image"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="Be On The Same Page With Your Client"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this { height: 500px; background-color: #f7f7f7; }\n#this >.field:not(:last-child) { margin-bottom: 33px; \n  margin-top: 5px; }\n]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="115" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Group"><Field t="control.Label" ID="_Label3" Title="Converting Inbound Calls To Sales" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Vertical" Spacing="0"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Customer enjoys personal treatment via their customer rooms.&#xa;In their personal customer room, customers find the products that meet their needs, with the most relevant business value highlighted for them.&#xa;&#xa;Agents simply communicate and engage with customers via customer rooms.Agents place and sort relevant products for the customer, emphasize the relevant benefits, and co-browse with the customer in real time.&#xa;&#xa;"><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//letmesee2.storage.googleapis.com/lmc_sales_chart.png"><AdjustSize t="img.Fill"/><FrameHeight t="img.FixedHeight" Height="340"/><FrameWidth t="img.FixedWidth" Width="540"/></Image><Style t="image.PlainImage"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_image"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field></Field><Field t="control.Layout" ID="_Vertical_Layout5" Title="Wix"><Layout t="layout.Vertical" Spacing="0"/><Field t="control.Layout" ID="_Vertical_Layout4" Title="Wix Apps"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:0;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top"/><Field t="control.Label" ID="_Label1" Title="Wix Applications"><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top_title"/></Field><Field t="control.Label" ID="_Label1" Title="Powered By jBart" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_second_title"/></Field><Field t="control.Layout" ID="_Group" Title="Group"><Field t="field.Image" ID="_Image2" Title="Image"><Image t="img.Image" Url="http://static.wix.com/media/140569_6ad3dd67b9fe91aa64a48a1817368354.png"><AdjustSize t="img.Stretch"/><FrameHeight t="img.FixedHeight" Height="200"/></Image><Style t="image.PlainImage"/></Field><Field t="field.Image" ID="_Image2" Title="Image1"><Image t="img.Image" Url="//letmesee2.storage.googleapis.com/BuyNow8.png"><AdjustSize t="img.Stretch"/><FrameHeight t="img.FixedHeight" Height="200"/></Image><Style t="image.PlainImage"/></Field><Field t="field.Image" ID="_Image2" Title="Image11"><Image t="img.Image" Url="//letmesee2.storage.googleapis.com/Portfolio7.png"><AdjustSize t="img.Stretch"/><FrameWidth t="img.FixedWidth" Width="300"/></Image><Style t="image.PlainImage"/></Field><Layout t="layout.Horizontal" VerticalLayoutForMobileWidth="false" Spacing="34"/><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { width: 960px; margin: auto; padding-top: 24px; }\n#wrapper { }\n]]></Css></FieldAspect></Field></Field><FieldAspect t="field_aspect.Hidden"><OnCondition t="field_aspect.CheckConditionForEveryItem" DataForCondition="Item data" WhenHidden="Do not render" ShowCondition="%$PageID% == \'wix\'"/></FieldAspect><Field t="control.Layout" ID="_Vertical_Layout6" Title="Quick Form"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this { height: 400px; }\n#this >.field:not(:last-child) { margin-bottom: 33px; \n  margin-top: 5px; }\n]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Text"><Field t="control.Label" ID="_Label3" Title="Quick Form" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Let your users easily contact you, register for an event, ask for price quotes and more in a few simple clicks."><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="control.Layout" ID="_Group5" Title="Gallery"><Field t="control.ImageGallery" ID="_ImageGallery1" Title="ImageGallery"><Style t="ui.CustomCss" base="imagegallery.ImageWithNextPrevButtons"><Style t="imagegallery.ImageWithNextPrevButtons" Height="250" Width="500"/><Css><![CDATA[#this .visible {\n  overflow:hidden;\n  margin-top:14px;\n  margin-right:14px;\n  margin-bottom:14px;\n  margin-left:14px;\n}\n#this .images {\n  -webkit-transition:margin-left 1s;\n}\n#this .button {\n  cursor:pointer;\n  position:absolute;\n  top:150px;\n  width:21px;\n  height:21px;\n  opacity:0.8;\n}\n#this .button.disable {\n  display:none;\n  cursor:default;\n  color:#ddd;\n}\n#this .prev {\n  left:5px;\n  background:url(\'images/wix/Portfolio/images_prev_button.png\');\n}\n#this .next {\n  background:url(\'images/wix/Portfolio/images_next_button.png\');\n  right:5px;\n}\n#this .frame {\n  position:relative;\n}\n#this .circles {\n  text-align:center;\n  margin-top:20px;\n}\n#this .circle {\n  display:inline-block;\n  width:15px;\n  height:15px;\n  border-radius:7px;\n  background:#A7A9AC;\n  margin:0 5px;\n  cursor:pointer;\n}\n#this .circle.current {\n  cursor:default;\n  background:#EC008C;\n}]]></Css></Style><Images t="imagegallery.ImagesOld" ImagesList="%$ShowCase/sample[@category=\'Quick Form\']%" ImageUrl="%@image%" ImageTitle="%@name%" ImageOriginalWidth="%@imageWidth%" ImageOriginalHeight="%@imageHeight%"/><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { padding-top: 5px; margin-left: 2px; \n  box-shadow: 2px 2px 3px 1px grey; \n  padding-bottom: 15px; }\n#wrapper { }\n]]></Css></FieldAspect></Field><Layout t="layout.Default"/><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { padding-top: 27px; }\n#wrapper { }\n]]></Css></FieldAspect></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="Potfolio"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this { height: 400px; background-color: #f7f7f7; }\n#this >.field:not(:last-child) { margin-bottom: 33px; \n  margin-top: 5px; }\n]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Text"><Field t="control.Label" ID="_Label3" Title="Porfolio" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Present your design work, business services, shopping, tourism, photography, courses, workshops, or any other gallery in your web site. Manage your portfolio as a set of items, each has multiple images. Use our predefined styles to give your portfolio the appropriate style and user experience."><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="control.Layout" ID="_Group5" Title="Gallery"><Field t="control.ImageGallery" ID="_ImageGallery1" Title="ImageGallery"><Style t="ui.CustomCss" base="imagegallery.ImageWithNextPrevButtons"><Style t="imagegallery.ImageWithNextPrevButtons" Height="250" Width="500"/><Css><![CDATA[#this .visible {\n  overflow:hidden;\n  margin-top:14px;\n  margin-right:14px;\n  margin-bottom:14px;\n  margin-left:14px;\n}\n#this .images {\n  -webkit-transition:margin-left 1s;\n}\n#this .button {\n  cursor:pointer;\n  position:absolute;\n  top:150px;\n  width:21px;\n  height:21px;\n  opacity:0.8;\n}\n#this .button.disable {\n  display:none;\n  cursor:default;\n  color:#ddd;\n}\n#this .prev {\n  left:5px;\n  background:url(\'images/wix/Portfolio/images_prev_button.png\');\n}\n#this .next {\n  background:url(\'images/wix/Portfolio/images_next_button.png\');\n  right:5px;\n}\n#this .frame {\n  position:relative;\n}\n#this .circles {\n  text-align:center;\n  margin-top:20px;\n}\n#this .circle {\n  display:inline-block;\n  width:15px;\n  height:15px;\n  border-radius:7px;\n  background:#A7A9AC;\n  margin:0 5px;\n  cursor:pointer;\n}\n#this .circle.current {\n  cursor:default;\n  background:#EC008C;\n}]]></Css></Style><Images t="imagegallery.ImagesOld" ImageUrl="%@image%" ImageTitle="%@name%" ImageOriginalWidth="%@imageWidth%" ImageOriginalHeight="%@imageHeight%" ImagesList="%$ShowCase/sample[@category=\'Portfolio\']%"><ImagesList t="data.JavaScript" Code="function(data,html_elem,context) { &#xa;return &quot;%$ShowCase/sample[@category=\'Quick Form\']%&quot;;&#xa; }"/></Images><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { padding-top: 5px; margin-left: 2px; \n  box-shadow: 2px 2px 3px 1px grey; \n  padding-bottom: 15px; }\n#wrapper { }\n]]></Css></FieldAspect></Field><Layout t="layout.Default"/><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { padding-top: 27px; }\n#wrapper { }\n]]></Css></FieldAspect></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="Buy It Now"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this { height: 400px; background-color: #f7f7f7; }\n#this >.field:not(:last-child) { margin-bottom: 33px; \n  margin-top: 5px; }\n]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Text"><Field t="control.Label" ID="_Label3" Title="Buy Now" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Easily sell your products or services through your web site. Add a &quot;Now On Sale&quot; or &quot;Buy It Now&quot; widget with PayPal button."><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="control.Layout" ID="_Group5" Title="Gallery"><Field t="control.ImageGallery" ID="_ImageGallery1" Title="ImageGallery"><Style t="ui.CustomCss" base="imagegallery.ImageWithNextPrevButtons"><Style t="imagegallery.ImageWithNextPrevButtons" Height="250" Width="500"/><Css><![CDATA[#this .visible {\n  overflow:hidden;\n  margin-top:14px;\n  margin-right:14px;\n  margin-bottom:14px;\n  margin-left:14px;\n}\n#this .images {\n  -webkit-transition:margin-left 1s;\n}\n#this .button {\n  cursor:pointer;\n  position:absolute;\n  top:150px;\n  width:21px;\n  height:21px;\n  opacity:0.8;\n}\n#this .button.disable {\n  display:none;\n  cursor:default;\n  color:#ddd;\n}\n#this .prev {\n  left:5px;\n  background:url(\'images/wix/Portfolio/images_prev_button.png\');\n}\n#this .next {\n  background:url(\'images/wix/Portfolio/images_next_button.png\');\n  right:5px;\n}\n#this .frame {\n  position:relative;\n}\n#this .circles {\n  text-align:center;\n  margin-top:20px;\n}\n#this .circle {\n  display:inline-block;\n  width:15px;\n  height:15px;\n  border-radius:7px;\n  background:#A7A9AC;\n  margin:0 5px;\n  cursor:pointer;\n}\n#this .circle.current {\n  cursor:default;\n  background:#EC008C;\n}]]></Css></Style><Images t="imagegallery.ImagesOld" ImageUrl="%@image%" ImageTitle="%@name%" ImageOriginalWidth="%@imageWidth%" ImageOriginalHeight="%@imageHeight%" ImagesList="%$ShowCase/sample[@category=\'Buy It Now\']%"><ImagesList t="data.JavaScript" Code="function(data,html_elem,context) { &#xa;return &quot;%$ShowCase/sample[@category=\'Quick Form\']%&quot;;&#xa; }"/></Images><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { padding-top: 5px; margin-left: 2px; \n  box-shadow: 2px 2px 3px 1px grey; \n  padding-bottom: 15px; }\n#wrapper { }\n]]></Css></FieldAspect></Field><Layout t="layout.Default"/><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { padding-top: 27px; }\n#wrapper { }\n]]></Css></FieldAspect></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field></Field><Field t="control.Layout" ID="_Vertical_Layout5" Title="About Us"><Layout t="layout.Vertical" Spacing="0"/><Field t="control.Layout" ID="_Vertical_Layout4" Title="Body Top"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="18px"/><Css><![CDATA[#this { height: 1000px; }\n#this >.field:not(:last-child) { margin-bottom: 18px; }\n]]></Css></Layout><Field t="control.Label" ID="_Label5" Title="Label" Text="Artware LTD"><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top_title"/></Field><Field t="control.Layout" ID="_Group1" Title="Group"><Field t="control.Label" ID="_Label4" Title="Label" Text="Artware was founded in 2006. Since then it was active in developing and licensing state of the art web user experience technologies to partners and clients based on its leading product, jBart.&#xa;&#xa;jBart Studio is a visual online tool for building web widgets. The resulting widgets are embeddable in any website, web application, or mobile web app. jBart is commercially deployed worldwide, serving a customer base which includes financial institutes,  software, government, and telco.&#xa;&#xa;Recently, Artware released LetMeSee, a revolutionary product in the domain of mobile customer engagement.&#xa;&#xa;Artware\'s founder, Shai Ben-Yehuda, is a well known entrepreneur and technology expert. He is the author of the TGP methodology. In his past he was the founder of ItemField Inc which was acquired by Informatica."><Style t="ui.CustomStyle" base="uitext.PlainText"><Html><![CDATA[<div />]]></Html><Css><![CDATA[#this {\n  color:#FFF;\n  font-size:16px;\n  margin-top:30px;\n  margin-left:34px;\n  max-width:640px;\n  margin:0 auto;\n  text-align:justify;\n  padding-top:10px;\n}]]></Css><Javascript><![CDATA[function(textObj) { \r  textObj.$el.html(textObj.text);\r}]]></Javascript></Style></Field><Layout t="layout.Vertical" Spacing="36px"/><Field t="control.Layout" ID="_Group2" Title="Group"><Field t="field.Image" ID="_Image4" Title="Image"><Image t="img.Image" Url="//www.artwaresoft.com/jbart/site/about.jpg"><AdjustSize t="img.Center"/><FrameWidth t="img.FixedWidth" Width="400"/></Image><Style t="ui.CustomCss" base="image.PlainImage"><Style t="image.PlainImage"/><Css><![CDATA[#this {\nmargin: auto\n}]]></Css></Style></Field><Layout t="ui.CustomCss" base="layout.Default"><Style t="layout.Default"/><Css><![CDATA[#this { margin: auto; width: 400px; }\n]]></Css></Layout></Field></Field><Field t="control.Layout" ID="_Group6" Title="Group"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0px"/><Css><![CDATA[#this { margin-top: 200px; }\n]]></Css></Layout><Field t="field.ItemList" Title="items1" ID="itemslist2"><View t="ui.CustomCss" base="itemlist_style.Simple"><Style t="itemlist_style.Simple"/><Css><![CDATA[#this>.aa_item {\n  float:left;\n  margin-right:29px;\n}\n#this {\n  width:230px;\n  margin:auto;\n}]]></Css></View><FieldAspect t="field_aspect.ItemListContainer"><Items t="itemlist.Items"><Items t="data.Pipeline"><Item t="text.Split" Text="misrad,idf2,idf"/></Items></Items></FieldAspect><FieldAspect t="itemlist_aspect.ShowTextWhenNoItems"/><Field t="field.Image" ID="_Image" Title="Image"><Image t="img.Image" Url="//www.artwaresoft.com/liveperson/%%_logo.png"><AdjustSize t="img.Center"/></Image><Style t="ui.CustomCss" base="image.PlainImage"><Style t="image.PlainImage"/><Css><![CDATA[#this {\n  background-color:#4E5DA8;\n}]]></Css></Style><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this {  padding-top: 12px;  padding-left: 11px;}]]></Css></FieldAspect></Field></Field><Field t="control.CustomControl" ID="_Custom_control" Title="Custom control"><Control t="ui.CustomStyle"><Html><![CDATA[<div/>]]></Html><Css><![CDATA[#this {\n  clear:both;\n}]]></Css><Javascript><![CDATA[function render(object) {\n/* Use object.el or object.$el to change the element */\n  }]]></Javascript></Control></Field><Field t="field.ItemList" Title="items" ID="itemslist2"><View t="ui.CustomCss" base="itemlist_style.Simple"><Style t="itemlist_style.Simple"/><Css><![CDATA[#this>.aa_item {\n  float:left;\n  margin-bottom:30px;\n}\n#this>.aa_item:nth-child(even) {} #this {\n}\n#this {\n  width:700px;\n  margin:auto;\n}]]></Css></View><FieldAspect t="field_aspect.ItemListContainer"><Items t="itemlist.Items"><Items t="data.Pipeline"><Item t="text.Split" Text="informatica,liveperson,pontis,clalit"/></Items></Items></FieldAspect><FieldAspect t="itemlist_aspect.ShowTextWhenNoItems"/><Field t="field.Image" ID="_Image" Title="Image"><Image t="img.Image" Url="//www.artwaresoft.com/liveperson/%%_logo.png"><AdjustSize t="img.Center"/></Image><Style t="ui.CustomCss" base="image.PlainImage"><Style t="image.PlainImage"/></Style><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this {  padding-top: 12px;  padding-left: 11px;}]]></Css></FieldAspect></Field></Field></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top"/></Field><FieldAspect t="field_aspect.Hidden"><OnCondition t="field_aspect.CheckConditionForEveryItem" DataForCondition="Item data" WhenHidden="Do not render" ShowCondition="%$PageID% == \'About\'"/></FieldAspect></Field><FieldAspect t="field_aspect.Variable" VarName="PageID"><Value t="ui.UrlFragment" Attribute="page"/></FieldAspect></Field><Field t="control.Page" ID="_Link_to_page" Title="Footer"><Page t="sample.Footer"/></Field><FieldAspect t="field_aspect.PagePreviewSize"><Style t="visual_container.MobileSkin"/><Size t="preview_device.Desktop"/></FieldAspect><FieldAspect t="async.AsyncActionBeforeLoad" ShowLoadingTextInStudio=""><LoadingStyle t="loading_style.Default" Height="100px"/><Action t="uiaction.SetUrlFragment" Attribute="page" Value="home"><Condition t="yesno.IsEmpty"><Value t="ui.UrlFragment" Attribute="page"/></Condition></Action></FieldAspect></xtml></Component><Component id="Footer" type="jbart.MyWidgetPage"><xtml t="control.Layout" ID="_footer" Title="Footer"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\r  background-color: #322F31;\r  height: 59px;\r  position: relative;\r}]]></Css></Layout><Field t="control.Label" ID="_Label6" Title="Label" Text="Copyright 2014 - ArtwareSoft.com"><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this {\r  text-align:center;\r  color:#e3d5dd;\r  display:inline-block;\r  margin:0 auto;\r  width:100\\%;\r  position:absolute;\r  top:20px;\r}]]></Css></Style></Field><Field t="control.Button" ID="_Button1" Title="Terms of service"><Style t="ui.CustomCss" base="btn.Hyperlink"><Style t="btn.Hyperlink"/><Css><![CDATA[#this {\r  cursor:pointer;\r  font-family:"lucida grande", tahoma;\r  color:#d1d1d1;\r  font-size:11px;\r  text-decoration:none;\r  position:absolute;\r  top:20px;\r  right:27px;\r}\r#this:hover {\r  text-decoration:underline;\r}]]></Css></Style><Action t="action.RunActions"><Action t="uiaction.GoToPage" Type="open in a new tab" Url="https://docs.google.com/document/d/159d993wZqgWtLloh4xVITTFixfxusD5_L0VJQNRVraw/pub"/></Action></Field></xtml></Component></xtml><xtml ns="preview_device"><Component id="Desktop" type="preview_device.Size"><xtml t="preview_device.CustomSize" Width="1300" Height=""/></Component><Component id="CustomSize" type="preview_device.Size" autoexpand="true"><Param name="Width" slider="true"><FieldAspect t="field_feature.HandleEvent"><Event t="field_feature.Update"/><Action t="gstudio.Refresh"/></FieldAspect></Param><Param name="Height" slider="true"><FieldAspect t="field_feature.HandleEvent"><Event t="field_feature.Update"/><Action t="gstudio.Refresh"/></FieldAspect></Param><xtml t="object.Object"><TextProperty name="Width" value="%$Width%"/><TextProperty name="Height" value="%$Height%"/></xtml></Component></xtml><xtml ns="popup"><Component id="CloseContainingPopup" type="action.Action" execution="native"><Param name="ExitMode" type="enum" Options="OK,Cancel"/><Param name="DoOnExit" type="action.Action" description="Run after validations have passed"/></Component><Component id="Default" type="popup.Style"><xtml t="ui.CustomStyle"><Html><![CDATA[<div>\r\n <div class="aa_popup_cover" />\r\n <div class="aa_popup_frame">\r\n  <div class="aa_popup_title" />      \r\n  <div class="aa_popup_close" />\r\n  <div class="aa_popup_contents" />\r\n </div>\r\n</div>]]></Html><Css><![CDATA[\r\n#this>.aa_popup_frame {\r\n  background-color:#FFFFFF;\r\n  box-shadow: 0px 1px 4px 2px rgba(0,0,0,0.4);\r\n  min-width:100px;\r\n  min-height:150px;\r\n  border-radius:2px;\r\n}\r\n.aa_popup_title {\r\n  cursor: move;\r\n  text-align:center;\r\n  background-color:#4A617A;\r\n  font: 14px Arial;\r\n  padding-top: 7px;\r\n  padding-bottom: 7px;\r\n  border-bottom: 1px solid #A4B0BC;\r\n  color: white;\r\n  min-height: 12px;\r\n}\r\n.aa_popup_close {\r\n  cursor: pointer;\r\n  position:absolute;\r\n  background: url(\'_jbartImages_/jbart_icons.png\') no-repeat -40px 0;\r\n  width: 20px;\r\n  height: 20px;\r\n  right:4px;\r\n  top: 4px;\r\n}\r\n.aa_popup_close:hover {\r\n  background-position:-40px -20px;\r\n}\r\n#this>.aa_popup_frame>.aa_popup_contents {\r\n  padding:10px;\r\n}\r\n#this>.aa_popup_cover {\r\n  background: #929497;\r\n  opacity:0.8;\r\n  position:fixed;\r\n  left:0;\r\n  right:0;\r\n  top:0;\r\n  bottom:0;\r\n}\r\n#this>.aa_popup_frame:focus { outline: none; }\r\n]]></Css><Javascript><![CDATA[function show(popup) {\r\n    aa_popup(popup,{\r\n      screenCover: true,\r\n      features: [\r\n        aa_popup_title_dragAndDrop(),\r\n        aa_popup_feature_closeOnEsc(),\r\n        aa_popup_feature_autoFocus()        \r\n      ]\r\n    });\r\n}]]></Javascript></xtml></Component><Component id="OpenPopup" type="action.Action" execution="native"><Param name="Contents" type="ui.Page"/><Param name="PopupTitle"/><Param name="Style" type="popup.Style"><Default t="popup.Default"/></Param><Param name="Feature" type="popup.Feature[]"/></Component></xtml><xtml ns="object"><Component id="Object" type="data.Data" execution="native"><Param name="Property" type="data.Data[]" has_name="true"/><Param name="TextProperty" type="data.Data[]" has_name="true"/><Param name="BooleanProperty" type="data.Data[]" has_name="true"/><Param name="IntegerProperty" type="data.Data[]" has_name="true"/><Param name="Method" type="action.Action[]" has_name="true"/></Component><Component id="SetProperty" type="action.Action" execution="native"><Param name="Object" Default="%%"/><Param name="Property" essential="true"/><Param name="Value" essential="true"/><Param name="IsSingleProperty" type="data.Boolean"/></Component><Component id="Object" type="data.Data" execution="native"><Param name="Property" type="data.Data[]" has_name="true"/><Param name="TextProperty" type="data.Data[]" has_name="true"/><Param name="BooleanProperty" type="data.Data[]" has_name="true"/><Param name="IntegerProperty" type="data.Data[]" has_name="true"/><Param name="Method" type="action.Action[]" has_name="true"/></Component></xtml><xtml ns="loading_style"><Component id="Default" type="loading_style.Style"><Param name="Height" Default="100px" slider="true" sliderUnit="px"/><xtml t="ui.CustomStyle"><Html><![CDATA[<div/>]]></Html><Css><![CDATA[#this { font-style: italic; height: %$Height%; }]]></Css><Javascript><![CDATA[function(elem) { elem.$el.html(elem.text); }]]></Javascript></xtml></Component></xtml><xtml ns="layout"><Component id="HorizontalCss3" type="layout.Style" light="false"><Param name="Spacing" Default="0" slider="true"/><xtml t="ui.CustomStyle" Spacing="%$Spacing%"><Css><![CDATA[#this {  }\r\n      #this >.field {  }]]></Css><Html><![CDATA[<div><div class="field"/></div>]]></Html><Javascript><![CDATA[function(layout) {\r\n  aa_horizontalBoxLayout(layout,{ spacing: layout.params && layout.params.Spacing });\r\n}]]></Javascript></xtml></Component><Component id="Vertical" type="layout.Style"><Param name="Spacing" Default="0"><FieldAspect t="field_dt.SliderParam"/></Param><xtml t="ui.CustomStyle"><Html><![CDATA[<div>\r\n      <div class="field"/>\r\n    </div>]]></Html><Css><![CDATA[#this {} #this >.field:not(:last-child) { margin-bottom: %$Spacing%; }\r\n    ]]></Css><Javascript><![CDATA[function(layout) {\r\n  aa_layout(layout);\r\n}]]></Javascript></xtml></Component><Component id="Default" type="layout.Style"><xtml t="ui.CustomStyle"><Css><![CDATA[#this {}]]></Css><Html><![CDATA[<div><div class="field"/></div>]]></Html><Javascript><![CDATA[function(layout) {\r\n  aa_layout(layout);\r\n}]]></Javascript></xtml></Component><Component id="Horizontal" type="layout.Style"><Param name="Spacing" Default="0" slider="true"/><Param name="VerticalLayoutForMobileWidth" type="data.Boolean" Default="false"/><xtml t="ui.CustomStyle" Spacing="%$Spacing%" VerticalLayoutForMobileWidth="%$VerticalLayoutForMobileWidth%"><Css><![CDATA[#this { }\r\n      #this >.field { }]]></Css><Html><![CDATA[<div><div class="field"/></div>]]></Html><Javascript><![CDATA[function(layout) {\r\n  var spacing = layout.params.Spacing;\r\n  aa_horizontalBoxLayout(layout,{ spacing: spacing, verticalForMobileWidth: layout.params.VerticalLayoutForMobileWidth == \'true\' });\r\n}]]></Javascript></xtml></Component></xtml><xtml ns="jbart_resource"><Component id="Data" type="bart_resource.Resources" execution="native" summaryLabel="%@ResourceID%"><Param name="ResourceID"><Field t="field.Field" FieldData="%!@ResourceID%" Title="ID" ID="ResourceID"><FieldAspect t="field_aspect.Mandatory"/></Field></Param><Param name="ValueType" type="enum" Options="xml,json,javascript,xml multiple,json to xml,calculated" Default="xml"><FieldAspect t="field_aspect.RefreshDependentFields" FieldsIds="DataResource_Value" RefreshScope="screen"/></Param><Param name="Value"><Field t="bart_dt.DataResourceValue"/></Param><Param name="CacheIn" type="bart_resource.CacheIn" script="true"/><Param name="DataSource" type="bart_resource.DataSource"/><Param name="_FillDataSource" remark="dt only"><Field t="bart_dt.FillDataSourceForXmlResource"/></Param><Param name="AutoSaveSampleData" type="enum" Options="true,false" description="Relevant only for xml. The design time will auto save changes to this resource"/></Component></xtml><xtml ns="jbart"><Component id="Widget" type="jbart.Widget" description="The component that defines the widget"><Param name="MainPage" type="jbart.MyWidgetPage"/><Param name="DataResource" type="jbart.DataResource[]" light="false"/><Param name="ApplicationFeature" type="jbart.ApplicationFeature[]"/><xtml t="action.RunActions" Comment="Do nothing"/></Component><Component id="TextboxCss" type="data.Data"><xtml t="data.FirstSucceeding"><Item><![CDATA[\r\n         #this { border:1px solid #BDC7D8; font-size:11px; padding:3px; height: 16px; width: 150px;background:url(%$_Images%/css/shadow2.png) repeat-x scroll 0 0 transparent;} \r\n         #this.readonly { border:none !important; }\r\n         #this.selected { background: #D9E8FB !important}\r\n        ]]></Item></xtml></Component></xtml><xtml ns="itemlist_style"><Component id="Simple" type="itemlist_style.View"><xtml t="ui.CustomStyle"><Html><![CDATA[<div><div class="aa_item"/></div>]]></Html><Javascript><![CDATA[function(itemlist) {\r\n       aa_itemlist(itemlist);\r\n}]]></Javascript><Css><![CDATA[#this>.aa_item {} #this{}]]></Css></xtml></Component><Component id="Tiles" type="itemlist_style.View"><xtml t="ui.CustomStyle" base="itemlist_style.Simple"><Html><![CDATA[<div>\r\n  <div class="parent">\r\n    <div class="aa_item"/>\r\n  </div>\r\n  <div class="clean" />\r\n</div>]]></Html><Css><![CDATA[#this>*>.aa_item {\r\n  float:left;\r\n  margin:0 5px 5px 0;\r\n}\r\n#this>.clean {\r\n  clear:both;\r\n}\r\n]]></Css><Javascript><![CDATA[function(itemlist) {\r\n  aa_itemlist(itemlist);\r\n}]]></Javascript></xtml></Component></xtml><xtml ns="itemlist_aspect"><Component id="ShowTextWhenNoItems" type="field.FieldAspect" description="Shows a text in the table when there are no items" execution="native" context="FieldComponent=field.ItemList"><Param name="Text" Default="No items available"/><Param name="Style" type="text_as_item.Style"><Default t="text_as_item.Default"/></Param></Component></xtml><xtml ns="itemlist"><Component id="Items" type="itemlist.Items" autoexpand="true"><Param name="Items"/><xtml value="%$Items%"/></Component></xtml><xtml ns="img"><Component id="Center" type="img.AdjustSize" execution="native"/><Component id="Image" type="img.Image" execution="native"><Param name="Url"/><Param name="OriginalWidth"/><Param name="OriginalHeight"/><Param name="FrameWidth" type="img.Width"/><Param name="FrameHeight" type="img.Height"/><Param name="AdjustSize" type="img.AdjustSize"><Default t="img.Center"/></Param></Component><Component id="FixedWidth" type="img.Width" execution="native"><Param name="Width" slider="true" sliderUnit=""/><xtml value="%$Width%"/></Component><Component id="Fill" type="img.AdjustSize" execution="native"/><Component id="FixedHeight" type="img.Height" execution="native"><Param name="Height" slider="true"/></Component><Component id="Stretch" type="img.AdjustSize" execution="native"/></xtml><xtml ns="imagegallery"><Component id="ImageWithNextPrevButtons" type="imagegallery.Style"><Param name="Height" Default="250"><FieldAspect t="field_dt.SliderParam"><Units t="slider.Unit" Symbol="" Min="0"/></FieldAspect></Param><Param name="Width" Default="500"><FieldAspect t="field_dt.SliderParam"><Units t="slider.Unit" Symbol="" Min="0"/></FieldAspect></Param><xtml t="ui.CustomStyle" Height="%$Height%" Width="%$Width%"><Css><![CDATA[#this .visible {\r\n  overflow:hidden;\r\n  margin-top: 14px;\r\n  margin-right: 14px;\r\n  margin-bottom: 14px;\r\n  margin-left: 14px;\r\n}\r\n#this .images {\r\n  -webkit-transition: margin-left 1s;\r\n}\r\n#this .button {\r\n  cursor: pointer;\r\n  position:absolute;\r\n  top:150px;\r\n  width:21px;\r\n  height:21px;\r\n  opacity: 0.8;\r\n}\r\n#this .button.disable {\r\n  display:none;\r\n  cursor: default;\r\n  color:#ddd;\r\n}\r\n#this .prev {\r\n  left:5px;\r\n  background: url(\'%$_Images%/wix/Portfolio/images_prev_button.png\');\r\n}\r\n#this .next {\r\n  background: url(\'%$_Images%/wix/Portfolio/images_next_button.png\');\r\n  right:5px;\r\n}\r\n#this .frame {\r\n  position:relative;\r\n  border: 1px solid #C9C9C9;\r\n  box-shadow:  0 0 2px 0px  grey;\r\n}\r\n#this .circles {\r\n  text-align:center;\r\n  margin-top:20px;\r\n}\r\n#this .circle {\r\n  display:inline-block;\r\n  width:15px;\r\n  height:15px;\r\n  border-radius:7px;\r\n  background:#A7A9AC;\r\n  margin:0 5px;\r\n  cursor:pointer;\r\n}\r\n#this .circle.current {\r\n  cursor:default;\r\n  background: #EC008C;\r\n}\r\n]]></Css><Html><![CDATA[<div>\r\n  <div class="frame">\r\n    <div class="visible">\r\n      <table class="images" cellspacing="0" cellpadding="0">\r\n        <tr>\r\n        </tr>\r\n      </table>\r\n    </div>\r\n    <div class="prev button" />\r\n    <div class="next button" />\r\n  </div>\r\n  <div class="circles">\r\n  </div>\r\n</div>]]></Html><Javascript><![CDATA[function(imagegallery) { \r\n  aa_ImageWithNextPrevButtons(imagegallery,{\r\n    width: imagegallery.params.Width,\r\n    height: imagegallery.params.Height\r\n  });\r\n}]]></Javascript></xtml></Component><Component id="ImagesOld" type="imagegallery.Images" deprecated="true"><Param name="ImagesList"/><Param name="ImageUrl" script="true"/><Param name="ImageWidth" script="true"/><Param name="ImageHeight" script="true"/><Param name="ImageTitle" script="true"/><Param name="ImageLink" script="true"/><xtml t="data.Pipeline"><Item value="%$ImagesList%"/><Item t="object.Object"><TextProperty name="url" t="xtml.UseParam" Param="ImageUrl"/><TextProperty name="width" t="xtml.UseParam" Param="ImageWidth"/><TextProperty name="height" t="xtml.UseParam" Param="ImageHeight"/><TextProperty name="title" t="xtml.UseParam" Param="ImageTitle"/><TextProperty name="link" t="xtml.UseParam" Param="ImageLink"/></Item></xtml></Component><Component id="Simple" type="imagegallery.Style"><xtml t="ui.CustomStyle"><Html><![CDATA[<div><img /></div>]]></Html><Css><![CDATA[#this {\r\n}]]></Css><Javascript><![CDATA[function(imagegallery) { \r\n  if (imagegallery.images.length == 0) return;\r\n  var currentImage = 0;\r\n  function replaceImage() {\r\n    var imageObj = imagegallery.images[++currentImage % imagegallery.images.length];\r\n    imagegallery.$el.find("img").attr("src",imageObj.url).attr("title",imageObj.title);\r\n    setTimeout( replaceImage, 3000 );\r\n  }\r\n  replaceImage();\r\n}]]></Javascript></xtml></Component></xtml><xtml ns="image"><Component id="PlainImage" type="image.Style"><xtml t="ui.CustomStyle"><Html><![CDATA[<div/>]]></Html><Css><![CDATA[#this {}]]></Css><Javascript><![CDATA[function(image) {\r\n  aa_setImage(image.el,image.image);\r\n}]]></Javascript></xtml></Component></xtml><xtml ns="gstudio"><Component id="CurrentPageXtml" type="data.Data"><xtml t="data.Pipeline"><Item value="%$_JBartStudio/CurrentPage%"/><Item t="xtml.ComponentDefinition" ToXtml="true"><ID t="data.IfThenElse" Then="%%" Else="sample.%%"><If t="yesno.Contains"><Text value="."/></If></ID></Item></xtml></Component></xtml><xtml ns="field_feature"><Component id="CssClass" type="field.FieldAspect" execution="native"><Param name="ClassName"/><Param name="ConditionForClass" type="data.Boolean" script="true" Default="true"/><Param name="AddClassTo" Default="content" type="enum" Options="content,wrapper"/></Component><Component id="Css" type="field.FieldAspect" execution="native" description="Styles (font, color, padding, borders)" promoted="true"><Param name="Css" css="true" styleTitle="Css"><FieldAspect t="field_aspect.HideTitle"/><Default><![CDATA[#this {} #wrapper {}]]></Default></Param></Component><Component id="Layout" type="field.FieldAspect" description="padding and margin"><Param name="Css" css="true" styleTitle="Layout"><FieldAspect t="field_aspect.HideTitle"/><Default><![CDATA[#this {} #wrapper {}]]></Default></Param><xtml t="field_feature.Css" Css="%$Css%"/></Component></xtml><xtml ns="field_control"><Component id="Image" type="field.Control" image="%$_Images%/studio/bmp1616.png" execution="native" hidden="true"><Param name="Image" type="image.Image"/><Param name="Style" type="image.Style"><Default t="image.PlainImage"/></Param><Param name="DefaultImage" type="data.Data"/></Component></xtml><xtml ns="field_aspect"><Component id="ItemListContainer" type="field.FieldAspect" execution="native" context="FieldComponent=field.ItemList,FieldComponent=control.Layout" fieldImage="%$_Images%/studio/library.png"><Param name="Items" type="itemlist.Items"><Default t="itemlist.Items"/></Param></Component><Component id="FieldData" type="field.FieldAspect" execution="native" description="Determines the data binding of the field item"><Param name="FieldData" script="true" essential="true"/></Component><Component id="Variable" execution="native" type="field.FieldAspect" description="Defines a local variable" summaryLabel="%@VarName%"><Param name="VarName" Default="MyVar" essential="true"/><Param name="Value"/></Component><Component id="CheckConditionForEveryItem" type="field_aspect.HiddenContition" execution="native"><Param name="ShowCondition" type="data.Boolean" script="true"/><Param name="DataForCondition" type="enum" Options="Item data,Field data" Default="Item data"/><Param name="WhenHidden" type="enum" Options="Do not render,Render as hidden html" Default="Do not render" Description="Render as hidden html enables future visibility"/></Component><Component id="Hidden" type="field.FieldAspect" execution="native" description="Hide or Show field on condition"><Param name="OnCondition" type="field_aspect.HiddenContition"/></Component><Component id="VisualContainer" type="field.FieldAspect" execution="native"><Param name="Width" type="img.Width"/><Param name="Height" type="img.Height"/><Param name="Style" type="visual_container.Style"><Default t="visual_container.MobileSkin"/></Param><Param name="HeightByCss" type="data.Boolean"/><Param name="ID"/></Component><Component id="PagePreviewSize" type="field.FieldAspect" context="pageForStudio=true"><Param name="Size" type="preview_device.Size"><FieldAspect t="field_feature.HandleEvent"><Event t="field_feature.Update"/><Action t="gstudio.Refresh"/></FieldAspect></Param><Param name="Style" type="visual_container.Style"><Default t="visual_container.MobileSkin"/><FieldAspect t="field_feature.HandleEvent"><Event t="field_feature.Update"/><Action t="gstudio.Refresh"/></FieldAspect></Param><xtml t="object.Object"><Method name="Run" t="field_aspect.VisualContainer" ID="studio_preview"><Style t="xtml.UseParam" Param="Style"/><Width t="img.FixedWidth" Width="%$Size/Width%"/><Height t="img.FixedHeight" Height="%$Size/Height%"/></Method></xtml></Component></xtml><xtml ns="field"><Component id="ItemList" type="field.Fields" execution="native" image="%$_Images%/studio/books.gif"><Param name="ID" advanced="always" essential="true" idField="true"/><Param name="Title" essential="true" autoaspects="false" titleField="true"/><Param name="View" type="itemlist_style.View"><Default t="itemlist_style.Simple"/></Param><Param name="SectionStyle" type="section.Style" description="Select a section style to make it a section"/><Param name="Field" type="field.Fields[]" script="true" light="false" essential="true"/><Param name="FieldAspect" type="field.FieldAspect[]" script="true" light="false"/></Component><Component id="Image" type="field.Fields" image="%$_Images%/studio/bmp1616.png"><Param name="Title" essential="true" autoaspects="false"><FieldAspect t="field_aspect.FieldData" FieldData="%!@Title%"/><FieldAspect t="field_dt.TitleField"/></Param><Param name="Image" type="image.Image" script="true"><Default t="img.Image"/></Param><Param name="Style" type="image.Style"><Default t="image.PlainImage"/></Param><Param name="DefaultImage" type="data.Data"/><Param name="HideTitle" boolfeature="true" type="data.Boolean"/><Param name="FieldAspect" type="field.FieldAspect[]" light="false" script="true"/><Param name="ID" essential="true"/><xtml t="field.Control" ID="%$ID%" Title="%$Title%" HideTitle="%$HideTitle%"><Control t="field_control.Image" Style="%$Style%" DefaultImage="%$DefaultImage%"><Image t="xtml.UseParam" Param="Image"/></Control><FieldAspect t="xtml.UseParamArray" Param="FieldAspect"/></xtml></Component><Component id="Control" type="field.Fields" execution="native" image="%$_Images%/studio/control1616.gif" deprecated="true"><Param name="ID" essential="true" advanced="always"/><Param name="Title" essential="true" autoaspects="false" titleField="true"/><Param name="HideTitle" type="data.Boolean" boolfeature="true"/><Param name="Control" type="field.Control" script="true" essential="true"/><Param name="FieldAspect" type="field.FieldAspect[]" light="false" script="true"/></Component><Component id="RefreshField" type="action.Action" execution="native"><Param name="FieldID" essential="true" type="dynamic_enum_multi"><Options t="data.Pipeline"><Item t="bart_dt.AllFieldIDs"/><Item value="%Options%"/><Item value="%code%"/></Options></Param><Param name="Scope" type="enum" Options="screen,sibling,table row" Default="screen"/><Param name="Transition" type="transition.Transition"/><Param name="FireOnUpdate" type="data.Boolean"/></Component><Component id="InnerPage" type="ui.Page" image="%$_Images%/studio/star1616.gif" dtsupport="false"><Param name="Title"/><Param name="Field" type="field.Fields[]" script="true" advanced="true" light="false"/><Param name="Layout" type="layout.Style" script="true"><Default t="layout.Default"/></Param><Param name="DesignTimeOnly"><Field t="bart_dt_custom.InnerPageButtons"/></Param><xtml t="control.Layout"><ID t="text.ToIdText" Data="%$Title%"/><Field t="xtml.UseParamArray" Param="Field"/><Layout t="xtml.UseParam" Param="Layout"/></xtml></Component></xtml><xtml ns="data"><Component id="IfThenElse" type="data.Data" execution="native" dtsupport="false"><Param name="If" type="data.Boolean" script="true" essential="true"/><Param name="Then" essential="true"/><Param name="Else" essential="true"/></Component><Component id="Pipeline" type="data.Data" execution="native" dtsupport="false"><Param name="Item" type="data.Data[]" essential="true"/><Param name="Aggregator" type="data.Aggregator[]"/></Component><Component id="JavaScript" type="data.Data,action.Action" execution="native" light="false"><Param name="Code" essential="true" js="true"><Default value="function(data,html_elem,context) {&#xa;  &#xa;}"/><FieldAspect1 t="field_dt.CodeMirrorPopupFieldEditor" MarginLeft="" Type="js"/></Param></Component><Component id="Same" type="data.Data" execution="native" dtsupport="false"/><Component id="Url" type="data.Data" execution="native"/></xtml><xtml ns="control"><Component id="Page" type="field.Fields,ui.Page" image="%$_Images%/studio/star1616.gif"><Param name="Title"/><Param name="Page" type="jbart.MyWidgetPage" script="true"/><xtml t="xtml.UseParam" Param="Page"/></Component><Component id="Button" type="field.Fields" execution="native" image="%$_Images%/studio/button.png"><Param name="ID" advanced="always" essential="true" idField="true"/><Param name="Title" titleField="true"/><Param name="ButtonText" script="true" advanced="true" description="Button text can be different than the title"/><Param name="Tooltip" advanced="true"/><Param name="Image" type="img.Image"/><Param name="Action" type="action.Action" script="true" essential="true"/><Param name="Style" type="btn.Style" script="true"><Default t="btn.JBart"/></Param><Param name="Disabled" type="data.Boolean.promoted"/><Param name="HideTitle" type="data.Boolean" advanced="true" Default="true"/><Param name="FieldAspect" type="field.FieldAspect[]" light="false" script="true"/></Component><Component id="ImageGallery" type="field.Fields" execution="native"><Param name="Title" essential="true" autoaspects="false" titleField="true"/><Param name="Images" type="imagegallery.Images"/><Param name="Style" type="imagegallery.Style"><Default t="imagegallery.Simple"/></Param><Param name="FieldAspect" type="field.FieldAspect[]" script="true" light="false"/><Param name="ID" essential="true" idField="true"/></Component><Component id="CustomControl" type="field.Fields" execution="native"><Param name="ID" essential="true" advanced="always"/><Param name="Title" essential="true" autoaspects="false" titleField="true"/><Param name="FieldAspect" type="field.FieldAspect[]" light="false" script="true"/><Param name="Control" type="control.ControlTriplet"><Default t="ui.CustomStyle"><Html><![CDATA[<div/>]]></Html><Css><![CDATA[#this {}]]></Css><Javascript><![CDATA[function render(object) {\r\n/* Use object.el or object.$el to change the element */\r\n  }]]></Javascript></Default></Param></Component><Component id="Label" type="field.Fields" execution="native" image="%$_Images%/studio/text.png"><Param name="Title" titleField="true"/><Param name="Text" script="true"/><Param name="Style" type="uitext.Style"><Default t="uitext.PlainText"/></Param><Param name="FieldAspect" type="field.FieldAspect[]" light="false" script="true"/><Param name="ID" idField="true"/></Component><Component id="Layout" type="field.Fields" execution="native" image="%$_Images%/studio/cube1616.gif"><Param name="Title" titleField="true"/><Param name="Field" type="field.Fields[]" light="false" script="true" essential="true"/><Param name="FieldAspect" type="field.FieldAspect[]" script="true" light="false"/><Param name="Layout" type="layout.Style" script="true"><Default t="layout.Default"/></Param><Param name="SectionStyle" type="section.Style" description="Select a section style to make it a section"/><Param name="ID" idField="true"/></Component></xtml><xtml ns="btn"><Component id="JBart" type="btn.Style"><Param name="MinWidth" Default="60px" slider="true" sliderUnit="px"/><xtml t="ui.CustomStyle"><Html><![CDATA[<button />]]></Html><Css><![CDATA[\r\n#this { cursor: pointer; text-transform:capitalize; text-align: center; color:White; \r\n  background:#0F52BA; text-transform:capitalize; font-size: 13px; \r\n  margin:0;\r\n  border-radius: 2px; padding-top: 0px; padding-right: 25px; padding-bottom: 1px; \r\n  padding-left: 25px; border: 1px solid #586E9E; \r\n  text-shadow:  0.05em -0.15em 0em #002FA7; \r\n  box-shadow:  .03em .03em .05em 0px rgba(0,0,0,0.4); \r\n  background-image: -webkit-linear-gradient(-90deg, #5987A8 0% , #0F52BA 100% ); \r\n  min-width: %$MinWidth%; vertical-align: middle; line-height: 28px; \r\n  }\r\n#this:hover { \r\n  background-image: -webkit-linear-gradient(-90deg, #75B2DD 0% , #0F52BA 100% ); \r\n  }\r\n#this:active { background:#5987A8; \r\n  background-image: -webkit-linear-gradient(90deg, #C04000 0% , #FF5A36 39% , white 100% ); \r\n  outline: 0; background-image: none; }\r\n#this.disabled { \r\nbackground-image:none;\r\nbackground: #5987A8;\r\ncursor: default;\r\n}  \r\n]]></Css><Javascript><![CDATA[function render(button) {\r\n  aa_button(button);\r\n}]]></Javascript></xtml></Component><Component id="Hyperlink" type="btn.Style"><xtml t="ui.CustomStyle"><Html><![CDATA[<span />]]></Html><Css><![CDATA[#this {\n  cursor:pointer;\n  font-family:"lucida grande", tahoma;\n  color:blue;\n  font-size:11px;\n  text-decoration:none;\n  display: inline-block;\n}\n#this:hover {\n  text-decoration:underline;\n}\n#this.disabled {\n  text-decoration:none;\n  cursor:default;\n}]]></Css><Javascript><![CDATA[function render(button) {\r\n  aa_button(button);\r\n}]]></Javascript></xtml></Component><Component id="MobilePagesButton" type="btn.Style"><xtml t="ui.CustomStyle" base="btn.JBart"><Html><![CDATA[<div>\r\n  <div class="bline bline1" />\r\n  <div class="bline bline2" />\r\n  <div class="bline bline3" />\r\n</div>]]></Html><Css><![CDATA[#this {\r\n  background:transparent;\r\n  line-height:38px;\r\n  font-size:28px;\r\n  border-radius:3px;\r\n  border:1px solid #ccc9c3;\r\n  padding:0 10px;\r\n  display:block;\r\n  cursor:pointer;\r\n  width:50px;\r\n  height:40px;\r\n  box-sizing:border-box;\r\n}\r\n.bline {\r\n  border-left:1px solid #BDC3C7;\r\n  border-right:1px solid #BDC3C7;\r\n  height:5px;\r\n  background:#768186;\r\n  margin-bottom:2px;\r\n  width:25px;\r\n}\r\n.bline1 {\r\n  margin-top:10px;\r\n}\r\n]]></Css><Javascript><![CDATA[function render(button) {\r\n  button.$el.click(function(e) { \r\n  \taa_buttonRunAction(button,e);\r\n  });\r\n}\r\n]]></Javascript></xtml></Component><Component id="GreenButton" type="btn.Style"><xtml t="ui.CustomStyle"><Html><![CDATA[<button />]]></Html><Css><![CDATA[#this { \r\n  cursor: pointer; font-family: arial; text-align: center; color:White; \r\n  background:#86B300; font-weight:bold; font-size: 13px; border-radius: 6px; \r\n  padding-top: 0px; padding-right: 25px; padding-bottom: 1px; padding-left: 25px; \r\n  border: 1px solid #6A8C01; text-shadow:  0 1px 0 #668910; \r\n  box-shadow:  .03em .03em .05em 0px rgba(0,0,0,0.4); \r\n  background-image: -webkit-linear-gradient(-90deg, #86B300 0\\% , #6A8D00 100\\% ); \r\n  min-width: 56px; -webkit-border-radius: 6px; -moz-border-radius: 6px; \r\n  -khtml-border-radius: 6px; vertical-align: middle; line-height: 28px; \r\n  -moz-box-shadow: .03em .03em .05em rgba(0,0,0,0.4); \r\n  -webkit-box-shadow: .03em .03em .05em rgba(0,0,0,0.4); \r\n}\r\n#this:hover { transition: background-position 0.1s linear; }\r\n#this:active { background:#6A8C01; outline: 0; }\r\n#this.disabled { background: #666; }\r\n]]></Css><Javascript><![CDATA[function render(button) {\r\n  aa_button(button);\r\n}]]></Javascript></xtml></Component></xtml><xtml ns="bart_url"><Component id="NewUrlFragment" type="data.Data" execution="native"><Param name="Current"/><Param name="Proposed"/></Component><Component id="BrowserUrl" type="bart_url.UrlProvider"><Param name="OnUpdate" type="action.Action" script="true"/><xtml t="xtml.Params"><ScriptParam name="GetValue" paramVars="Attribute" t="ui.UrlFragment" Attribute="%$Attribute%"/><ScriptParam name="Clean" t="uiaction.SetUrlFragment" Fragment=""/><ScriptParam name="Update" paramVars="ValuePairs" t="action.RunActions"><Action t="uiaction.SetUrlFragment"><Fragment t="bart_url.NewUrlFragment" Proposed="%$ValuePairs%"><Current t="ui.UrlFragment"/></Fragment></Action><Action t="xtml.UseParam" Param="OnUpdate"/></ScriptParam></xtml></Component></xtml><xtml ns="async"><Component id="AsyncActionBeforeLoad" type="field.FieldAspect" execution="native"><Param name="Action" type="action.Action"/><Param name="LoadingText" Default="Loading..."/><Param name="LoadingStyle" type="loading_style.Style"><Default t="loading_style.Default"/></Param><Param name="TextForError" Default="An error has occurred..."/><Param name="ShowLoadingTextInStudio" type="data.Boolean"/></Component></xtml><xtml ns="appfeature"><Component id="Responsive" type="jbart.ApplicationFeature" execution="native"><NativeHelper name="WidthForStudio" t="data.Pipeline"><Item t="gstudio.CurrentPageXtml"/><Item value="%FieldAspect[@t = \'field_aspect.PagePreviewSize\']%"/><Item t="xtml.RunXtml" Xtml="%%" Field="Size"/><Item value="%Width%"/></NativeHelper></Component><Component id="Css" type="bart.ApplicationFeature,jbart.ApplicationFeature"><Param name="Css" codemirror="true"/><xtml t="object.SetProperty" Object="%$_AppContext%" Property="Css" Value="%$Css%"/></Component></xtml><xtml ns="action"><Component id="IfThenElse" type="action.Action" execution="native"><Param name="If" type="data.Boolean" essential="true" script="true"/><Param name="Then" type="action.Action" script="true" essential="true"/><Param name="Else" type="action.Action" script="true" essential="true"/></Component><Component id="RunActions" type="action.Action" execution="native" decorator="Action"><Param name="Action" type="action.Action[]" essential="true"/></Component></xtml><xtml ns="jbart_api"><Component id="ShowWidget" type="ui.Control" execution="native" description="Shows/embeds a jbart widget with the relevant params"><Param name="WidgetXml"/><Param name="Page"/><Param name="RunAfter" type="action.Action" script="true"/><Param name="RunAfterControlWithTimer" type="data.Boolean" Default="true"/><Param name="_Language"/><Param name="OnError" type="action.Action" script="true"/><Param name="ControlToShowInBartContext" type="ui.Control" script="true" description="used by automatic tests"/></Component></xtml><xtml ns="validation"><Component id="DefaultOld" deprecated="true"><xtml t="validation.CustomStyleOld"><Html><![CDATA[<div />]]></Html><Css><![CDATA[#this { color:red; font-weight:bold; font-size:11px; font-family: Arial; }]]></Css><CssForInput><![CDATA[#this { background: pink !important; }]]></CssForInput><Javascript><![CDATA[function (validation) {\r\n  validation.innerHTML = validation.errorText;\r\n  validation.init({ \r\n    showError: function(control,errorElement,mandatory) {\r\n       jQuery(errorElement).insertAfter(jQuery(control).parent().children().slice(-1));\r\n       if (mandatory) jQuery(errorElement).hide(); \r\n    },\r\n    showErrorSummary: function(top,summary) {\r\n      summary.setAttribute(\'tabindex\',\'1000\');\r\n      top.appendChild(summary);\r\n      summary.focus();\r\n    }\r\n  });\r\n}]]></Javascript><CssForSummary><![CDATA[#this { display:block; color:red; font-weight:bold; margin-top:2px; font-family:Arial; font-size:11px; }]]></CssForSummary></xtml></Component><Component id="CustomStyleOld"><Param name="Html" codemirror="true"/><Param name="Css" codemirror="true"/><Param name="Javascript" codemirror="true"/><Param name="CssForSummary" codemirror="true" codemirrortype="css"/><Param name="CssForInput" codemirror="true" codemirrortype="css"/><Param name="DesignTime_Save"><Field t="bart_dt.StyleSave"><ExtraAction t="xml.AddXmlChildren" Parent="%$NewXtml%"><Children t="data.Pipeline"><Item t="xml.Xml"><xtml><CssForSummary><![CDATA[%$Xtml/CssForSummary%]]></CssForSummary><CssForInput><![CDATA[%$Xtml/CssForInput%]]></CssForInput></xtml></Item><Item value="%*%"/></Children></ExtraAction></Field></Param><ParamGenerator t="action.RunActions"><Var name="Style" t="xtml.RunXtml" Xtml="%$PrevXtml%"/><Action t="bart_dt.StyleGenerator"/><Action t="action.WriteValue" To="%!@CssForSummary%" Value="%$Style/CssForSummary%"/><Action t="action.WriteValue" To="%!@CssForInput%" Value="%$Style/CssForInput%"/></ParamGenerator><xtml t="object.Object"><TextProperty name="Html" value="%$Html%"/><TextProperty name="Css" value="%$Css%"/><TextProperty name="Javascript" value="%$Javascript%"/><TextProperty name="CssForSummary" value="%$CssForSummary%"/><TextProperty name="CssForInput" value="%$CssForInput%"/></xtml></Component></xtml><xtml ns="text"><Type id="HebrewText" HebChars="אבגדהוזחטיכלמנסעפצקרשתןףךץ"/></xtml></xtml>'));

var jBartWidget_Artware_Site = '<file _type="jbart_project" name="Artware Site" id="Artware_Site" vid="1" cross_domain="true" feed=""><xtml ns="sample"><Component id="Widget" type="jbart.Widget"><xtml t="jbart.Widget"><MainPage t="sample.main"/><DataResource t="jbart_resource.Data" ResourceID="Data" ValueType="xml"><Value><![CDATA[<xml/>]]></Value></DataResource><ApplicationFeature t="appfeature.Css"><Css><![CDATA[#this { font: 12px Arial; }\r      #this *:focus { outline:none; }\r      p { margin: 0} \r      ]]></Css></ApplicationFeature><DataResource t="jbart_resource.Data" ResourceID="Pages" ValueType="xml" AutoSaveSampleData=""><Value t="xml.Xml"><xml><page name="Home" id="home"/><page name="Technology" id="tech"/><page name="jBart" id="jbart"/><page name="Let Me See" id="lmc"/><page name="Wix Applications" id="wix"/><page name="About Us" id="About"/></xml></Value></DataResource><ApplicationFeature t="appfeature.Responsive"/><DataResource t="jbart_resource.Data" ResourceID="ShowCase" ValueType="xml" AutoSaveSampleData=""><Value t="xml.Xml"><xml><sample name="Gift Cards" website="http://www.benuccis.com/#!gift-cards/sitepage_4" image="" imageWidth="" imageHeight="" category="Buy It Now" country="United States"/><sample name="Healing through Hypnossis" website="http://www.holistichideaway.com/#!hypnotherapy-special/cpvx" image="http://static.wix.com/media/140569_5344a1b61f3741d2ad093ade98331ac7.png" imageWidth="911" imageHeight="519" category="Buy It Now" country="United States"/><sample name="Funding " website="http://www.getmefundingnow.com/" image="http://static.wix.com/media/140569_c345710d41624776bb6151cb37938ed3.png_400" imageWidth="566" imageHeight="400" category="Buy It Now" country="United States"/><sample name="Reserve your meat" website="http://www.raenenterprises.com/#!meats/c14p6" image="http://static.wix.com/media/140569_1555f1effb9a4e15a155c97c95234040.png" imageWidth="459" imageHeight="462" category="Buy It Now" country="United States"/><sample name="WORKWEAR" website="http://mi4484.wix.com/tradesafeassured#!workwear/cjg9" image="http://static.wix.com/media/140569_4674b7e7c7ed4b9da63113ab5ba3742c.png" imageWidth="630" imageHeight="521" category="Buy It Now" country="Australia"/><sample name="CHARLIE &amp; ALE Wedding" website="http://agdb14.wix.com/weddingcharlieyale#!contactus/c11m6" image="http://static.wix.com/media/140569_6ad3dd67b9fe91aa64a48a1817368354.png" imageWidth="594" imageHeight="451" category="Quick Form" country="Mexico"/><sample name="Earth Craft" website="http://mikheil107.wix.com/earthcraftmc#!shop/c1yz" image="http://static.wix.com/media/140569_7d3744a9b68a4f3fb2751f15468884c0.png" imageWidth="674" imageHeight="563" category="Buy It Now" country="United States"/><sample country="France" name="Photography" website="http://fco850.wix.com/instempsphoto-cindyc#!galerie/c1o12" image="http://static.wix.com/media/140569_3b258e632b167a4ec1ce4ca0b3ffc581.png" imageWidth="501" imageHeight="378" category="Portfolio" ID="" premium=""/><sample country="Australia" name="Chinese Resteraunt" website="http://www.grandlotus.com.au/#!gallery/c1fp0" image="http://static.wix.com/media/140569_e4a00c15b5aebd3bd32cae58cfeee0ff.png" imageWidth="1002" imageHeight="623" category="Portfolio" ID="" premium=""/><sample country="Russia" name="Fashion" website="http://www.oksanakvasnikova.com/" image="http://static.wix.com/media/140569_f4b934cbdd4cb66d38b6c155e9cdb65c.png" imageWidth="943" imageHeight="594" category="Portfolio" ID="" premium=""/><sample country="United States" name="Photography" website="http://lovealwaysphotograph.wix.com/photography#!personalgalleries/c1o17" image="http://static.wix.com/media/140569_480693855d59aed931977497feb98894.png" imageWidth="488" imageHeight="336" category="Portfolio" ID="" premium=""/><sample country="United States" name="Adoptable Pets" website="http://www.abbyslittlefriends.com/#!adoptable-pets/c10wz" image="http://static.wix.com/media/140569_b4f1a026814cd95eb8e75d01bf2c115d.png" imageWidth="960" imageHeight="645" category="Portfolio" ID="" premium=""/><sample country="Saint Vincent" name="Tourism" website="http://www.kapiciconcierge.com/#!accomodations/c8p6" image="http://static.wix.com/media/140569_d9d191a9a959b15b9fdf99e8a355ba3c.png" imageWidth="900" imageHeight="603" category="Portfolio" ID="" premium=""/><sample name="Alex Cyr Art" website="http://www.alyxcyr.info/" image="http://static.wix.com/media/140569_79e35c5b5b2b0c591882ae0ba5bbc4d6.png" imageWidth="601" imageHeight="394" category="Portfolio" country="United States"/><sample country="Turkey" name="Hotels" website="http://www.ahsappen.com.tr/#!galeri/cjjk" image="http://static.wix.com/media/140569_8b0a1b4ad8592c35aa0136cc7a2a503e.png" imageWidth="1123" imageHeight="633" category="Portfolio" ID="" premium=""/><sample country="Denmark" name="Films" website="http://www.filmbloggeren.dk/#!anmeldelser/c1yem" image="http://static.wix.com/media/140569_154f69c4cd3bdd84e1b52aec12746393.png" imageWidth="742" imageHeight="520" category="Portfolio" ID="" premium=""/><sample ID="Wix_QuickForm_132553c8_df21_6dc7_79bd_0906f1fbcf36_TPWdgt3t0c" country="Russia" premium="" deleted="" name="Apply for vacancy" website="http://valeriyalexeev.wix.com/opora-delo#!---/c1tj" image="http://lh4.googleusercontent.com/-0BABrhPUMEk/Uj7Ly4r9UEI/AAAAAAAAAIU/FTackDAXKdQ/w357-h209-no/quick-form-2.png" imageWidth="357" imageHeight="209" category="Quick Form"/><sample ID="Wix_QuickForm_13256524_84a2_4e5e_64f7_48c927ad7752_TPWdgt3lyn" country="Brazil" premium="" deleted="" name="Questionare" website="http://jpsgamer.wix.com/tsonasani#!perguntas/c1t44" image="http://lh5.googleusercontent.com/-pdBV2kjIEJw/Uj7LLzOFFiI/AAAAAAAAAH0/dCgar1Xqyy0/w317-h334-no/quick-form-2.png" imageWidth="317" imageHeight="334" category="Quick Form"/><sample ID="Wix_QuickForm_13258612_1408_f3b4_79bd_0906f1fbcf36_TPWdgt1zgz" country="Australia" premium="" deleted="" name="Minecraft" website="http://aussiebrits1999.wix.com/minecraftforceopme" image="http://lh6.googleusercontent.com/--rlFH03aKkM/Uj7Mb8s8ZsI/AAAAAAAAAI4/kqk_H6pxM54/w261-h189-no/quick-form-2.png" imageWidth="261" imageHeight="189" category="Quick Form"/><sample name="Judges Corner" website="http://lexiarmani4.wix.com/laemployee#!judge/cfvg" image="http://static.wix.com/media/140569_55cb38644b4c1c93d1a761ce8cdf7189.png" imageWidth="297" imageHeight="240" category="Quick Form" country="United States"/><sample ID="Wix_QuickForm_13255c28_765d_c203_8c51_b6bf2ba97dd8_TPWdgt03j2" country="Russia" premium="" deleted="false" name="Book a Hut" website="http://www.vipberloga.com/#!zakazdoma/c1xw4" image="http://lh5.googleusercontent.com/-iULqtB27s4w/Uj7MNwP92wI/AAAAAAAAAIo/F3V_v6yhWG4/w294-h165-no/quick-form-2.png" imageWidth="294" imageHeight="165" category="Quick Form"/><sample name="Hair Dresser" website="http://www.hairpeacemaker.com/#!appointments/c1f2i" image="http://static.wix.com/media/140569_5d5255f287e8ffbeebdcfcf423530268.png" imageWidth="872" imageHeight="674" category="Quick Form" country="United States"/><sample name="Insurance" website="http://www.cardozaservices.com/#!services/c5ro" image="http://static.wix.com/media/140569_0bc64c1b579cd062b0648d1738288cf3.png" imageWidth="853" imageHeight="581" category="Quick Form" country="United States"/><sample country="Philippines" premium="" deleted="" name="Order Diet Juice" website="http://heavenlygift777.wix.com/redjuice#!order/c13pp" image="http://static.wix.com/media/140569_d2dffe0e95310a9604cd992cf9785277.png" imageWidth="979" imageHeight="629" category="Quick Form" ID=""/><sample name="Horse Training" website="http://www.ecurie-secchiutti.com/#!4-ans-/cvim" image="http://static.wix.com/media/140569_4eb8c6ffcc35f9d8e30ce0a898373641.png" imageWidth="546" imageHeight="420" category="Portfolio" country="France"/><sample name="Tournament Registration" website="http://www.maddenlegend.com/#!leagues-tournments/c60z" image="http://static.wix.com/media/140569_48f866e3ae7abce40a6801bbc3f47b2f.png" imageWidth="504" imageHeight="316" category="Quick Form" country="United States"/><sample name="Payment" website="http://www.programetes.radio.br/#!afiliar-se/c1pp9" image="http://static.wix.com/media/140569_97e8d8a25fd936cb823b6989d1976a90.png" imageWidth="422" imageHeight="289" category="Quick Form" country="Brazil "/><sample name="Kiev confectionery" website="http://kasamarchic.wix.com/kiev-konditer#!zakaz/cibb" image="http://static.wix.com/media/140569_3581b8049601646b55c2f88820b368c6.png" imageWidth="687" imageHeight="418" category="Quick Form" country="Russia"/><sample ID="Wix_QuickForm_13260d73_c643_e40f_162d_c17a5a33f06b_TPWdgt2tx2" country="Russia" premium="" deleted="" name="Art Home" website="http://etfsgtu.wix.com/arthome63#!contact/czpl" image="http://lh3.googleusercontent.com/-y5MSr-lPcws/Uj7JZ_GemwI/AAAAAAAAAGc/meIbPREW7w0/w178-h138-no/quick-form-1.png" imageWidth="178" imageHeight="138" category="Quick Form"/><sample name="Application for service" website="http://leoninesystems.wix.com/durhamvets#!application-for-services/c17e8" image="http://static.wix.com/media/140569_fb72e291aff53ac399d1444cb60d9461.png" imageWidth="720" imageHeight="535" category="Quick Form" country="Bahrain"/><sample name="Eclipse on board" ID="Wix_QuickForm_1325129e_b7a6_23ee_64f7_48c927ad7752_TPWdgt3147k" website="http://www.eclipseonbroad.com/#!contact/con8" image="http://lh5.googleusercontent.com/-87V8AOxNjFg/Uj7KTrZ2ISI/AAAAAAAAAHE/4VOmDHKwrrs/w243-h190-no/quick-form-2.png" imageWidth="243" imageHeight="190" category="Quick Form" country="United States" premium=""/><sample name="Register" ID="Wix_QuickForm_132566a6_a9a5_2cd8_64f7_48c927ad7752_TPWdgt0w6l" website="http://www.training4-11-2014.com/#!form/c3h9" image="http://lh4.googleusercontent.com/-RYQB55cuPpw/Uj7Ks6zba_I/AAAAAAAAAHU/-ncZfi7Q16Y/w295-h196-no/quick-form-2.png" imageWidth="295" imageHeight="196" category="Quick Form" country="United States" premium="true"/><sample ID="Wix_QuickForm_1325986f_945f_a852_79bd_0906f1fbcf36_TPWdgt0szo" country="Netherlands" premium="" deleted="" name="Art" website="http://vijfcent.wix.com/behind-the-door#!contact/c16fm" image="http://lh6.googleusercontent.com/-dHOTqkchf0U/Uj7K9k4FAVI/AAAAAAAAAHk/H_kYZMK4ig4/w316-h207-no/quick-form-2.png" imageWidth="316" imageHeight="207" category="Quick Form"/></xml></Value></DataResource></xtml></Component><Component id="main" type="jbart.MyWidgetPage"><xtml t="control.Layout" ID="main" Title="main"><FieldAspect t="field_aspect.FieldData" FieldData="%$Data%"/><Layout t="ui.CustomCss" base="layout.Default"><Style t="layout.Default"/><Css><![CDATA[#this {} .body_top {\n  background-image:-webkit-linear-gradient(123deg, #6578da 0\\%, #435091 50\\%, #222849 100\\%);\n  background-color:#435091;\n}\n.body_top_title {\n  color:#ffffff;\n  font-size:38px;\n  padding-top:40px;\n  text-align:center;\n}\n.body_second_title {\n  color:#ffffff;\n  font-size:22px;\n  padding-top:30px;\n  text-align:center;\n}\n.body_group {\n  background:#F7F7F7;\n}\n.body_item_title {\n  font-weight:500;\n  font-size:26px;\n  color:#45494d;\n  padding-top:37px;\n}\n.body_item_second_title {\n  font-style:normal;\n  font-size:16px;\n  color:#45494d;\n  padding-top:24px;\n  padding-left:38px;\n}\n.paragraph_inner {\n  width:1110px;\n  margin:auto;\n}\n.paragraph_left {\n  width:500px;\n}\n.paragraph_image {\n  padding-top:40px;\n}\n.inner_text {  \n  width:400px;\n  font-size:17px;\n  margin-top:40px;\n}]]></Css></Layout><Field t="control.Layout" ID="_Vertical_Layout" Title="Top Bar"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this { height: 84px; background-color: #f4f7f9; \n  z-index: 100; }\n]]></Css></Layout><Field t="control.Layout" ID="_Vertical_Layout2" Title="Logo"><Layout t="layout.HorizontalCss3" Spacing=""/><Field t="field.Image" ID="_Image" Title="Image"><Image t="img.Image" Url="http://letmesee2.storage.googleapis.com/artlogo.png"><AdjustSize t="img.Center"/></Image><Style t="image.PlainImage"/></Field><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { top: 14px; padding-left: 17px; padding-top: 15px; }\n#wrapper { }\n]]></Css></FieldAspect></Field><Field t="control.Layout" ID="_Vertical_Layout3" Title="Pages"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this { position: absolute; top: 21px; left: 280px; \n  margin-left: 43px; }\n.width_mobile_phone #this { display: none; }\n]]></Css></Layout><Field t="field.ItemList" Title="items" ID="itemslist"><FieldAspect t="field_aspect.ItemListContainer"><Items t="itemlist.Items" Items="%$Pages/page%"/></FieldAspect><FieldAspect t="itemlist_aspect.ShowTextWhenNoItems"/><View t="ui.CustomCss" base="itemlist_style.Tiles"><Style t="itemlist_style.Tiles"/><Css><![CDATA[#this>*>.aa_item {\n  float:left;\n  margin:0 45px 5px 0;\n}\n#this>.clean {\n  clear:both;\n}]]></Css></View><Field t="control.Button" ID="_Button" Title="General" HideTitle="true" ButtonText="%@name%"><Style t="ui.CustomCss" base="btn.Hyperlink"><Style t="btn.Hyperlink"/><Css><![CDATA[#this { font-weight: 600; font-style: normal; \n  line-height: 36px; height: 36px; font-size: 14px; \n  color: #7b8386; cursor: pointer; \n  padding-bottom: 5px; }\n#this.selected { border-bottom: 2px solid #4DACF9; \n  color: #322f31; }\n#this:hover { transition-property: all; \n  transition-duration: 1.3s; \n  color: #50b1ff; }\n]]></Css></Style><Action t="action.RunActions"><Action t="uiaction.SetUrlFragment" Attribute="page" Value="%@id%"/><Action t="field.RefreshField" FireOnUpdate="" FieldID="main" Scope="screen"/></Action><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="selected"><ConditionForClass t="yesno.And"><Item value="%$PageInUrl% == %@id%"/><Var name="PageInUrl" t="ui.UrlFragment" Attribute="page"/></ConditionForClass></FieldAspect></Field></Field></Field><Field t="control.Button" ID="_Button3" Title="Mobile pages popup"><Style t="btn.MobilePagesButton"/><FieldAspect t="field_feature.Css"><Css><![CDATA[#this {\r  top:18px;\r  right:20px;\r  position:absolute;\r  display:none;\r}\r.width_mobile_phone #this {\r  display:block;\r}]]></Css></FieldAspect><Action t="popup.OpenPopup"><Style t="ui.CustomStyle" base="popup.Default"><Html><![CDATA[<div>\r <div class="aa_popup_cover" />\r <div class="aa_popup_frame">\r  <div class="aa_popup_contents" />\r </div>\r</div>]]></Html><Css><![CDATA[#this>.aa_popup_cover {\r  background:#fff;\r  opacity:0.99;\r  position:fixed;\r  left:0;\r  right:0;\r  top:0px;\r  bottom:0;\r}\r#this>.aa_popup_frame {\r  background:transparent;\r  position:absolute;\r  left:20px;\r  right:20px;\r  top:70px;\r}]]></Css><Javascript><![CDATA[function show(popup) {\r    aa_popup(popup,{\r      screenCover: true,\r      features: [\r        aa_popup_feature_closeOnEsc()\r      ]\r    });\r}]]></Javascript></Style><Contents t="field.InnerPage" Title="pages"><Layout t="layout.Default"/><Field t="field.ItemList" Title="items" ID="itemslist1"><FieldAspect t="field_aspect.ItemListContainer"><Items t="itemlist.Items" Items="%$Pages/page%"/></FieldAspect><FieldAspect t="itemlist_aspect.ShowTextWhenNoItems"/><View t="itemlist_style.Simple"/><Field t="control.Button" ID="_Button4" Title="Page" HideTitle="true" ButtonText="%@name%"><Style t="ui.CustomCss" base="btn.GreenButton"><Style t="btn.GreenButton"/><Css><![CDATA[#this {\r  width: 100\\%;\r  cursor:pointer;\r  background: #EEF3F6;\r  font: bold 13px arial;\r  text-align:center;\r  border:none;\r  margin-bottom:10px;\r  \rline-height: 36px;\rheight: 36px;\rpadding: 0 10px;\rtext-transform: uppercase;\rcolor: #7b8386;  \r}\r#this:hover {\r  color: #50b1ff;\r}\r#this:active {\r}\r#this:focus {\r  outline: none;\r}\r]]></Css></Style><Action t="popup.CloseContainingPopup" ExitMode=""><DoOnExit t="action.RunActions"><Action t="uiaction.SetUrlFragment" Attribute="page" Value="%@id%"/><Action t="field.RefreshField" FireOnUpdate="" FieldID="main" Scope="screen"/></DoOnExit></Action></Field></Field></Contents></Action></Field></Field><Field t="control.Layout" ID="_body" Title="Body"><Layout t="layout.Vertical" Spacing="0"/><Field t="control.Layout" ID="_Vertical_Layout5" Title="home"><Layout t="layout.Vertical" Spacing="0"/><FieldAspect t="field_aspect.Hidden"><OnCondition t="field_aspect.CheckConditionForEveryItem" DataForCondition="Item data" WhenHidden="Do not render" ShowCondition="%$PageID% == \'home\'"/></FieldAspect><Field t="control.Layout" ID="_jbart" Title="State Of The Art"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n  background-color:#F7F7F7;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:57px;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top"/><Field t="control.Label" ID="_Label3" Title="State Of The Art Technology" Text=""><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this { color: #FFFFFF; font-size: 38px; width: 100%; \n  text-align: center; padding-top: 53px; }\n]]></Css></Style></Field><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="ui.CustomCss" base="layout.Horizontal"><Style t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Css><![CDATA[#this {\n}\n#this >.field:first-child {\n  padding-right:83px;\n}]]></Css></Layout><Field t="control.Layout" ID="_Group4" Title="Group"><Layout t="layout.Vertical" Spacing="0"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Artware is a technology company developing state of the art tools for web user experience and real time engagement.&#xa;&#xa;Our technology is commercially deployed worldwide, serving a customer base which includes financial institutes, software, government, and telco.&#xa;&#xa;Our leading product is jBart. jBart Studio is a visual online tool to build web widgets. The resulting widgets are embeddable in any website, web application, or mobile web app"><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this {\n  width:400px;\n  font-size:17px;\n  margin-top:40px;\n  margin-left:70px;\n  color:white;\n}]]></Css></Style></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/caligraphy1.png"><AdjustSize t="img.Center"/><FrameHeight t="img.FixedHeight" Height="296"/></Image><Style t="image.PlainImage"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="Seeking Quality"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:400px;\n  background-color:#F7F7F7;\n}\n]]></Css></Layout><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="ui.CustomCss" base="layout.Horizontal"><Style t="layout.Horizontal" VerticalLayoutForMobileWidth="false" Spacing="92"/><Css><![CDATA[]]></Css></Layout><Field t="control.Layout" ID="_Group4" Title="Group"><Field t="control.Label" ID="_Label3" Title="Seeking Quality in Software Development" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="For us, software development is a continuous process of synthesizing the declarative part of the software. The declarative part, organized in the right way, forms a domain specific language (DSL) which is mastered by the business professionals."><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/brush5.png"><AdjustSize t="img.Fill"/><FrameHeight t="img.FixedHeight" Height="340"/><FrameWidth t="img.FixedWidth" Width="540"/></Image><Style t="image.PlainImage"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_image"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="History Of Success"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:400px;\n  background-color:#ffffff;\n}\n]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout2" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Group"><Field t="control.Label" ID="_Label3" Title="History Of Success" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="The Tgp Methodology was invented by Shai Ben-Yehuda 20 years ago. &#xa;Since then it was successfully implemented in dozens of large projects in various fields generating revenue of hundreds of millions of dollars."><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_left"/></Field><Field t="field.Image" ID="_Image3" Title="Image"><Image t="img.Image" Url="//letmesee2.storage.googleapis.com/building8.png"><AdjustSize t="img.Stretch"/><FrameHeight t="img.FixedHeight" Height="320"/><FrameWidth t="img.FixedWidth" Width="540"/></Image><Style t="image.PlainImage"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_image"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field></Field><Field t="control.Layout" ID="_Vertical_Layout5" Title="Technology"><Layout t="layout.Vertical" Spacing="0"/><FieldAspect t="field_aspect.Hidden"><OnCondition t="field_aspect.CheckConditionForEveryItem" DataForCondition="Item data" WhenHidden="Do not render" ShowCondition="%$PageID% == \'tech\'"/></FieldAspect><Field t="control.Layout" ID="_Vertical_Layout6" Title="Tgp"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n  background-color:#F7F7F7;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:57px;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top"/><Field t="control.Label" ID="_Label3" Title="The Tgp Methodology" Text=""><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this { color: #FFFFFF; font-size: 38px; width: 100%; \n  text-align: center; padding-top: 53px; }\n]]></Css></Style></Field><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="ui.CustomCss" base="layout.Horizontal"><Style t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Css><![CDATA[#this {\n}\n#this >.field:first-child {\n  padding-right:50px;\n}]]></Css></Layout><Field t="control.Layout" ID="_Group4" Title="Group"><Layout t="layout.Vertical" Spacing="0"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Business Professionals master their business. Using the TGP methodology we allow them to master their information systems as well."><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this {\n  width:400px;\n  font-size:17px;\n  margin-top:40px;\n  margin-left:70px;\n  color:white;\n}]]></Css></Style></Field><Field t="control.Label" ID="_Label3" Title="title11" Text="Tgp allows business professionals to continuously form their domain specific language (DSL). Software developers assist this process but not master it. The DSL provides the professionals the agility and power to control their own information systems."><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this {\n  width:400px;\n  font-size:17px;\n  margin-top:40px;\n  margin-left:70px;\n  color:#ffffff;\n}]]></Css></Style></Field><FieldAspect t="field_feature.Css"><Css><![CDATA[#this { width: 400px; }\n#wrapper { }\n]]></Css></FieldAspect></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="https://letmesee1.storage.googleapis.com/site/brush6.png"><AdjustSize t="img.Center"/><FrameWidth t="img.FixedWidth" Width="779"/><FrameHeight t="img.FixedHeight" Height="300"/></Image><Style t="image.PlainImage"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="When Tgp Meets js"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n  background-color:#F7F7F7;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:33px;\n  margin-top:5px;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Group"><Field t="control.Label" ID="_Label3" Title="When TGP Meets Web Technologies" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Javascript is the most portable language in the industry running on any client device and operating system. &#xa;However, javascript is not built for large scale system development.&#xa;TGP and javascript go hand by hand. TGP provides the means to construct declarative languages while javascript is flexible and portable to provide the DSL engine and scripting language.&#xa;&#xa;Tgp and javasctipt is jBart&#xa;"><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/art4.png"><AdjustSize t="img.Stretch"/><FrameHeight t="img.FixedHeight" Height="340"/><FrameWidth t="img.FixedWidth" Width="540"/></Image><Style t="image.PlainImage"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_image"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="Testing"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n  background-color:#ffffff;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:33px;\n  margin-top:5px;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Group"><Field t="control.Label" ID="_Label3" Title="Organic Testing" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Automatic testing is a real challenge and a crucial factor in software agility. Our development methodologies are build around formal definition of the requirements and test automation."><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/brush2.png"><AdjustSize t="img.Stretch"/><FrameHeight t="img.FixedHeight" Height="340"/><FrameWidth t="img.FixedWidth" Width="540"/></Image><Style t="image.PlainImage"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_image"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field></Field><Field t="control.Layout" ID="_Vertical_Layout5" Title="jBart"><Layout t="layout.Vertical" Spacing="0"/><FieldAspect t="field_aspect.Hidden"><OnCondition t="field_aspect.CheckConditionForEveryItem" DataForCondition="Item data" WhenHidden="Do not render" ShowCondition="%$PageID% == \'jbart\'"/></FieldAspect><Field t="control.Layout" ID="_Vertical_Layout6" Title="Web Widgets"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n  background-color:#F7F7F7;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:57px;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top"/><Field t="control.Label" ID="_Label3" Title="Web Widgets &amp; jBart Studio" Text=""><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this { color: #FFFFFF; font-size: 38px; width: 100%; \n  text-align: center; padding-top: 53px; }\n]]></Css></Style></Field><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="ui.CustomCss" base="layout.Horizontal"><Style t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Css><![CDATA[#this {\n  width:1000px;\n}\n#this >.field:first-child {\n  padding-right:50px;\n}]]></Css></Layout><Field t="control.Layout" ID="_Group4" Title="Group"><Layout t="layout.Vertical" Spacing="0"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Web Widgets are web parts that can be embedded in any web page or mobile web app. E.g., google maps, youtube, twitter, eBay, facebook, and many more."><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this {\n  width:400px;\n  font-size:17px;\n  margin-top:40px;\n  margin-left:70px;\n  color:white;\n}]]></Css></Style></Field><Field t="control.Label" ID="_Label3" Title="title11" Text="jBart studio is a robust online tool to develop such web widget on top any API.jBart widgets are used in a wide range of industries for eCommerce, enterprise, mobile web apps, real time engagement, business intelligence, information extraction, and more."><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this {\n  width:400px;\n  font-size:17px;\n  margin-top:40px;\n  margin-left:70px;\n  color:#ffffff;\n}]]></Css></Style></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//www.artwaresoft.com/jbart/site/studio.jpg"><AdjustSize t="img.Center"/><FrameHeight t="img.FixedHeight" Height="260"/></Image><Style t="image.PlainImage"/></Field></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="Responsive Mobile Web Apps"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n  background-color:#F7F7F7;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:33px;\n  margin-top:5px;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Group"><Field t="control.Label" ID="_Label3" Title="Responsive Mobile Web Apps" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="jBart is ideal for developing rich and responsive web apps. Working by example, it keeps its a strong visual development environment within the richness data, screen sizes and devices.  &#xa;&#xa;With jBart you start with your data models and API and build the UI on top of it.&#xa;&#xa;jBart suggests a powerful data binding mechanism with rich set of controls, UX abstractions, and visual customization with html/css/javascript."><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/phone2.png"><AdjustSize t="img.Fill"/><FrameHeight t="img.FixedHeight" Height="340"/><FrameWidth t="img.FixedWidth" Width="540"/></Image><Style t="image.PlainImage"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_image"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="Real Time Engagement"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n  background-color:#ffffff;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:33px;\n  margin-top:5px;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Group"><Field t="control.Label" ID="_Label3" Title="Real Time Engagement" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="jBart widgets support real time engagement. For example, a form defined by jBart allows two users to fill it together. &#xa;&#xa;With these capabilities, jBart is the ideal platform for &quot;Let Me See&quot;, the new way of customer engagement."><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/lmc11.png"><AdjustSize t="img.Fill"/><FrameHeight t="img.FixedHeight" Height="340"/><FrameWidth t="img.FixedWidth" Width="540"/></Image><Style t="image.PlainImage"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_image"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field></Field><Field t="control.Layout" ID="_Vertical_Layout5" Title="LetMeSee"><Layout t="layout.Vertical" Spacing="0"/><Field t="control.Layout" ID="_Vertical_Layout4" Title="LetMeSee"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:0;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top"/><Field t="control.Label" ID="_Label1" Title="Let Me See"><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top_title"/></Field><Field t="control.Label" ID="_Label1" Title="The New Way for Customer Engagement" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_second_title"/></Field><Field t="control.Layout" ID="_Group" Title="Group"><Field t="field.Image" ID="_Image2" Title="Image"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/lmc4.png"><AdjustSize t="img.Stretch"/><FrameWidth t="img.FixedWidth" Width="129"/></Image><Style t="image.PlainImage"/></Field><Field t="field.Image" ID="_Image2" Title="Image1"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/lmc5.png"><AdjustSize t="img.Stretch"/><FrameWidth t="img.FixedWidth" Width="300"/></Image><Style t="image.PlainImage"/></Field><Field t="field.Image" ID="_Image2" Title="Image11"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/lmc6.png"><AdjustSize t="img.Stretch"/><FrameWidth t="img.FixedWidth" Width="194"/></Image><Style t="image.PlainImage"/></Field><Field t="field.Image" ID="_Image2" Title="Image111"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/lmc9.png"><AdjustSize t="img.Stretch"/><FrameWidth t="img.FixedWidth" Width="299"/></Image><Style t="image.PlainImage"/></Field><Layout t="layout.Horizontal" VerticalLayoutForMobileWidth="false" Spacing="34"/><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { width: 960px; margin: auto; padding-top: 24px; }\n#wrapper { }\n]]></Css></FieldAspect></Field></Field><FieldAspect t="field_aspect.Hidden"><OnCondition t="field_aspect.CheckConditionForEveryItem" DataForCondition="Item data" WhenHidden="Do not render" ShowCondition="%$PageID% == \'lmc\'"/></FieldAspect><Field t="control.Layout" ID="_Vertical_Layout6" Title="A Picture Is Worth a Thousand Words"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this { height: 500px; }\n#this >.field:not(:last-child) { margin-bottom: 33px; \n  margin-top: 5px; }\n]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="190" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Group"><Field t="control.Label" ID="_Label3" Title="A Picture Is Worth a Thousand Words" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Often, sales reps find the voice channel too limiting. Enriching voice with images, charts, tables, and calculators makes the difference.&#xa;&#xa;While on a phone call, the agent sends SMS with the customer room url. The customer joins the room and co-browse with the agent.&#xa;&#xa;Following an inbound call, the agent simply prepare a customer room with relevant customer products, benefits, and price offer and send it to customer via mail and SMS.&#xa;The agent can monitor the room activity and follow up the communication using the customer room.&#xa;&#xa;&#xa;"><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//letmesee1.storage.googleapis.com/site/lmc7.png"><AdjustSize t="img.Fill"/><FrameHeight t="img.FixedHeight" Height="340"/><FrameWidth t="img.FixedWidth" Width="540"/></Image><Style t="image.PlainImage"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_image"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="Be On The Same Page With Your Client"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this { height: 500px; background-color: #f7f7f7; }\n#this >.field:not(:last-child) { margin-bottom: 33px; \n  margin-top: 5px; }\n]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="115" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Group"><Field t="control.Label" ID="_Label3" Title="Converting Inbound Calls To Sales" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Vertical" Spacing="0"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Customer enjoys personal treatment via their customer rooms.&#xa;In their personal customer room, customers find the products that meet their needs, with the most relevant business value highlighted for them.&#xa;&#xa;Agents simply communicate and engage with customers via customer rooms.Agents place and sort relevant products for the customer, emphasize the relevant benefits, and co-browse with the customer in real time.&#xa;&#xa;"><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="field.Image" ID="_Image1" Title="Image"><Image t="img.Image" Url="//letmesee2.storage.googleapis.com/lmc_sales_chart.png"><AdjustSize t="img.Fill"/><FrameHeight t="img.FixedHeight" Height="340"/><FrameWidth t="img.FixedWidth" Width="540"/></Image><Style t="image.PlainImage"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_image"/></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field></Field><Field t="control.Layout" ID="_Vertical_Layout5" Title="Wix"><Layout t="layout.Vertical" Spacing="0"/><Field t="control.Layout" ID="_Vertical_Layout4" Title="Wix Apps"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\n  height:500px;\n}\n#this >.field:not(:last-child) {\n  margin-bottom:0;\n}]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top"/><Field t="control.Label" ID="_Label1" Title="Wix Applications"><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top_title"/></Field><Field t="control.Label" ID="_Label1" Title="Powered By jBart" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_second_title"/></Field><Field t="control.Layout" ID="_Group" Title="Group"><Field t="field.Image" ID="_Image2" Title="Image"><Image t="img.Image" Url="http://static.wix.com/media/140569_6ad3dd67b9fe91aa64a48a1817368354.png"><AdjustSize t="img.Stretch"/><FrameHeight t="img.FixedHeight" Height="200"/></Image><Style t="image.PlainImage"/></Field><Field t="field.Image" ID="_Image2" Title="Image1"><Image t="img.Image" Url="//letmesee2.storage.googleapis.com/BuyNow8.png"><AdjustSize t="img.Stretch"/><FrameHeight t="img.FixedHeight" Height="200"/></Image><Style t="image.PlainImage"/></Field><Field t="field.Image" ID="_Image2" Title="Image11"><Image t="img.Image" Url="//letmesee2.storage.googleapis.com/Portfolio7.png"><AdjustSize t="img.Stretch"/><FrameWidth t="img.FixedWidth" Width="300"/></Image><Style t="image.PlainImage"/></Field><Layout t="layout.Horizontal" VerticalLayoutForMobileWidth="false" Spacing="34"/><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { width: 960px; margin: auto; padding-top: 24px; }\n#wrapper { }\n]]></Css></FieldAspect></Field></Field><FieldAspect t="field_aspect.Hidden"><OnCondition t="field_aspect.CheckConditionForEveryItem" DataForCondition="Item data" WhenHidden="Do not render" ShowCondition="%$PageID% == \'wix\'"/></FieldAspect><Field t="control.Layout" ID="_Vertical_Layout6" Title="Quick Form"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this { height: 400px; }\n#this >.field:not(:last-child) { margin-bottom: 33px; \n  margin-top: 5px; }\n]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Text"><Field t="control.Label" ID="_Label3" Title="Quick Form" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Let your users easily contact you, register for an event, ask for price quotes and more in a few simple clicks."><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="control.Layout" ID="_Group5" Title="Gallery"><Field t="control.ImageGallery" ID="_ImageGallery1" Title="ImageGallery"><Style t="ui.CustomCss" base="imagegallery.ImageWithNextPrevButtons"><Style t="imagegallery.ImageWithNextPrevButtons" Height="250" Width="500"/><Css><![CDATA[#this .visible {\n  overflow:hidden;\n  margin-top:14px;\n  margin-right:14px;\n  margin-bottom:14px;\n  margin-left:14px;\n}\n#this .images {\n  -webkit-transition:margin-left 1s;\n}\n#this .button {\n  cursor:pointer;\n  position:absolute;\n  top:150px;\n  width:21px;\n  height:21px;\n  opacity:0.8;\n}\n#this .button.disable {\n  display:none;\n  cursor:default;\n  color:#ddd;\n}\n#this .prev {\n  left:5px;\n  background:url(\'images/wix/Portfolio/images_prev_button.png\');\n}\n#this .next {\n  background:url(\'images/wix/Portfolio/images_next_button.png\');\n  right:5px;\n}\n#this .frame {\n  position:relative;\n}\n#this .circles {\n  text-align:center;\n  margin-top:20px;\n}\n#this .circle {\n  display:inline-block;\n  width:15px;\n  height:15px;\n  border-radius:7px;\n  background:#A7A9AC;\n  margin:0 5px;\n  cursor:pointer;\n}\n#this .circle.current {\n  cursor:default;\n  background:#EC008C;\n}]]></Css></Style><Images t="imagegallery.ImagesOld" ImagesList="%$ShowCase/sample[@category=\'Quick Form\']%" ImageUrl="%@image%" ImageTitle="%@name%" ImageOriginalWidth="%@imageWidth%" ImageOriginalHeight="%@imageHeight%"/><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { padding-top: 5px; margin-left: 2px; \n  box-shadow: 2px 2px 3px 1px grey; \n  padding-bottom: 15px; }\n#wrapper { }\n]]></Css></FieldAspect></Field><Layout t="layout.Default"/><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { padding-top: 27px; }\n#wrapper { }\n]]></Css></FieldAspect></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="Potfolio"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this { height: 400px; background-color: #f7f7f7; }\n#this >.field:not(:last-child) { margin-bottom: 33px; \n  margin-top: 5px; }\n]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Text"><Field t="control.Label" ID="_Label3" Title="Porfolio" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Present your design work, business services, shopping, tourism, photography, courses, workshops, or any other gallery in your web site. Manage your portfolio as a set of items, each has multiple images. Use our predefined styles to give your portfolio the appropriate style and user experience."><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="control.Layout" ID="_Group5" Title="Gallery"><Field t="control.ImageGallery" ID="_ImageGallery1" Title="ImageGallery"><Style t="ui.CustomCss" base="imagegallery.ImageWithNextPrevButtons"><Style t="imagegallery.ImageWithNextPrevButtons" Height="250" Width="500"/><Css><![CDATA[#this .visible {\n  overflow:hidden;\n  margin-top:14px;\n  margin-right:14px;\n  margin-bottom:14px;\n  margin-left:14px;\n}\n#this .images {\n  -webkit-transition:margin-left 1s;\n}\n#this .button {\n  cursor:pointer;\n  position:absolute;\n  top:150px;\n  width:21px;\n  height:21px;\n  opacity:0.8;\n}\n#this .button.disable {\n  display:none;\n  cursor:default;\n  color:#ddd;\n}\n#this .prev {\n  left:5px;\n  background:url(\'images/wix/Portfolio/images_prev_button.png\');\n}\n#this .next {\n  background:url(\'images/wix/Portfolio/images_next_button.png\');\n  right:5px;\n}\n#this .frame {\n  position:relative;\n}\n#this .circles {\n  text-align:center;\n  margin-top:20px;\n}\n#this .circle {\n  display:inline-block;\n  width:15px;\n  height:15px;\n  border-radius:7px;\n  background:#A7A9AC;\n  margin:0 5px;\n  cursor:pointer;\n}\n#this .circle.current {\n  cursor:default;\n  background:#EC008C;\n}]]></Css></Style><Images t="imagegallery.ImagesOld" ImageUrl="%@image%" ImageTitle="%@name%" ImageOriginalWidth="%@imageWidth%" ImageOriginalHeight="%@imageHeight%" ImagesList="%$ShowCase/sample[@category=\'Portfolio\']%"><ImagesList t="data.JavaScript" Code="function(data,html_elem,context) { &#xa;return &quot;%$ShowCase/sample[@category=\'Quick Form\']%&quot;;&#xa; }"/></Images><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { padding-top: 5px; margin-left: 2px; \n  box-shadow: 2px 2px 3px 1px grey; \n  padding-bottom: 15px; }\n#wrapper { }\n]]></Css></FieldAspect></Field><Layout t="layout.Default"/><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { padding-top: 27px; }\n#wrapper { }\n]]></Css></FieldAspect></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field><Field t="control.Layout" ID="_Vertical_Layout6" Title="Buy It Now"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this { height: 400px; background-color: #f7f7f7; }\n#this >.field:not(:last-child) { margin-bottom: 33px; \n  margin-top: 5px; }\n]]></Css></Layout><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_group2"/><Field t="control.Layout" ID="_Horizontal_Layout" Title="Horizontal Layout"><Layout t="layout.Horizontal" Spacing="61" VerticalLayoutForMobileWidth="true"/><Field t="control.Layout" ID="_Group4" Title="Text"><Field t="control.Label" ID="_Label3" Title="Buy Now" Text=""><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_item_title"/></Field><Layout t="layout.Default"/><Field t="control.Label" ID="_Label3" Title="title1" Text="Easily sell your products or services through your web site. Add a &quot;Now On Sale&quot; or &quot;Buy It Now&quot; widget with PayPal button."><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="inner_text"/></Field></Field><Field t="control.Layout" ID="_Group5" Title="Gallery"><Field t="control.ImageGallery" ID="_ImageGallery1" Title="ImageGallery"><Style t="ui.CustomCss" base="imagegallery.ImageWithNextPrevButtons"><Style t="imagegallery.ImageWithNextPrevButtons" Height="250" Width="500"/><Css><![CDATA[#this .visible {\n  overflow:hidden;\n  margin-top:14px;\n  margin-right:14px;\n  margin-bottom:14px;\n  margin-left:14px;\n}\n#this .images {\n  -webkit-transition:margin-left 1s;\n}\n#this .button {\n  cursor:pointer;\n  position:absolute;\n  top:150px;\n  width:21px;\n  height:21px;\n  opacity:0.8;\n}\n#this .button.disable {\n  display:none;\n  cursor:default;\n  color:#ddd;\n}\n#this .prev {\n  left:5px;\n  background:url(\'images/wix/Portfolio/images_prev_button.png\');\n}\n#this .next {\n  background:url(\'images/wix/Portfolio/images_next_button.png\');\n  right:5px;\n}\n#this .frame {\n  position:relative;\n}\n#this .circles {\n  text-align:center;\n  margin-top:20px;\n}\n#this .circle {\n  display:inline-block;\n  width:15px;\n  height:15px;\n  border-radius:7px;\n  background:#A7A9AC;\n  margin:0 5px;\n  cursor:pointer;\n}\n#this .circle.current {\n  cursor:default;\n  background:#EC008C;\n}]]></Css></Style><Images t="imagegallery.ImagesOld" ImageUrl="%@image%" ImageTitle="%@name%" ImageOriginalWidth="%@imageWidth%" ImageOriginalHeight="%@imageHeight%" ImagesList="%$ShowCase/sample[@category=\'Buy It Now\']%"><ImagesList t="data.JavaScript" Code="function(data,html_elem,context) { &#xa;return &quot;%$ShowCase/sample[@category=\'Quick Form\']%&quot;;&#xa; }"/></Images><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { padding-top: 5px; margin-left: 2px; \n  box-shadow: 2px 2px 3px 1px grey; \n  padding-bottom: 15px; }\n#wrapper { }\n]]></Css></FieldAspect></Field><Layout t="layout.Default"/><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this { padding-top: 27px; }\n#wrapper { }\n]]></Css></FieldAspect></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="paragraph_inner"/></Field></Field></Field><Field t="control.Layout" ID="_Vertical_Layout5" Title="About Us"><Layout t="layout.Vertical" Spacing="0"/><Field t="control.Layout" ID="_Vertical_Layout4" Title="Body Top"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="18px"/><Css><![CDATA[#this { height: 1000px; }\n#this >.field:not(:last-child) { margin-bottom: 18px; }\n]]></Css></Layout><Field t="control.Label" ID="_Label5" Title="Label" Text="Artware LTD"><Style t="uitext.PlainText"/><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top_title"/></Field><Field t="control.Layout" ID="_Group1" Title="Group"><Field t="control.Label" ID="_Label4" Title="Label" Text="Artware was founded in 2006. Since then it was active in developing and licensing state of the art web user experience technologies to partners and clients based on its leading product, jBart.&#xa;&#xa;jBart Studio is a visual online tool for building web widgets. The resulting widgets are embeddable in any website, web application, or mobile web app. jBart is commercially deployed worldwide, serving a customer base which includes financial institutes,  software, government, and telco.&#xa;&#xa;Recently, Artware released LetMeSee, a revolutionary product in the domain of mobile customer engagement.&#xa;&#xa;Artware\'s founder, Shai Ben-Yehuda, is a well known entrepreneur and technology expert. He is the author of the TGP methodology. In his past he was the founder of ItemField Inc which was acquired by Informatica."><Style t="ui.CustomStyle" base="uitext.PlainText"><Html><![CDATA[<div />]]></Html><Css><![CDATA[#this {\n  color:#FFF;\n  font-size:16px;\n  margin-top:30px;\n  margin-left:34px;\n  max-width:640px;\n  margin:0 auto;\n  text-align:justify;\n  padding-top:10px;\n}]]></Css><Javascript><![CDATA[function(textObj) { \r  textObj.$el.html(textObj.text);\r}]]></Javascript></Style></Field><Layout t="layout.Vertical" Spacing="36px"/><Field t="control.Layout" ID="_Group2" Title="Group"><Field t="field.Image" ID="_Image4" Title="Image"><Image t="img.Image" Url="//www.artwaresoft.com/jbart/site/about.jpg"><AdjustSize t="img.Center"/><FrameWidth t="img.FixedWidth" Width="400"/></Image><Style t="ui.CustomCss" base="image.PlainImage"><Style t="image.PlainImage"/><Css><![CDATA[#this {\nmargin: auto\n}]]></Css></Style></Field><Layout t="ui.CustomCss" base="layout.Default"><Style t="layout.Default"/><Css><![CDATA[#this { margin: auto; width: 400px; }\n]]></Css></Layout></Field></Field><Field t="control.Layout" ID="_Group6" Title="Group"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0px"/><Css><![CDATA[#this { margin-top: 200px; }\n]]></Css></Layout><Field t="field.ItemList" Title="items1" ID="itemslist2"><View t="ui.CustomCss" base="itemlist_style.Simple"><Style t="itemlist_style.Simple"/><Css><![CDATA[#this>.aa_item {\n  float:left;\n  margin-right:29px;\n}\n#this {\n  width:230px;\n  margin:auto;\n}]]></Css></View><FieldAspect t="field_aspect.ItemListContainer"><Items t="itemlist.Items"><Items t="data.Pipeline"><Item t="text.Split" Text="misrad,idf2,idf"/></Items></Items></FieldAspect><FieldAspect t="itemlist_aspect.ShowTextWhenNoItems"/><Field t="field.Image" ID="_Image" Title="Image"><Image t="img.Image" Url="//www.artwaresoft.com/liveperson/%%_logo.png"><AdjustSize t="img.Center"/></Image><Style t="ui.CustomCss" base="image.PlainImage"><Style t="image.PlainImage"/><Css><![CDATA[#this {\n  background-color:#4E5DA8;\n}]]></Css></Style><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this {  padding-top: 12px;  padding-left: 11px;}]]></Css></FieldAspect></Field></Field><Field t="control.CustomControl" ID="_Custom_control" Title="Custom control"><Control t="ui.CustomStyle"><Html><![CDATA[<div/>]]></Html><Css><![CDATA[#this {\n  clear:both;\n}]]></Css><Javascript><![CDATA[function render(object) {\n/* Use object.el or object.$el to change the element */\n  }]]></Javascript></Control></Field><Field t="field.ItemList" Title="items" ID="itemslist2"><View t="ui.CustomCss" base="itemlist_style.Simple"><Style t="itemlist_style.Simple"/><Css><![CDATA[#this>.aa_item {\n  float:left;\n  margin-bottom:30px;\n}\n#this>.aa_item:nth-child(even) {} #this {\n}\n#this {\n  width:700px;\n  margin:auto;\n}]]></Css></View><FieldAspect t="field_aspect.ItemListContainer"><Items t="itemlist.Items"><Items t="data.Pipeline"><Item t="text.Split" Text="informatica,liveperson,pontis,clalit"/></Items></Items></FieldAspect><FieldAspect t="itemlist_aspect.ShowTextWhenNoItems"/><Field t="field.Image" ID="_Image" Title="Image"><Image t="img.Image" Url="//www.artwaresoft.com/liveperson/%%_logo.png"><AdjustSize t="img.Center"/></Image><Style t="ui.CustomCss" base="image.PlainImage"><Style t="image.PlainImage"/></Style><FieldAspect t="field_feature.Layout"><Css><![CDATA[#this {  padding-top: 12px;  padding-left: 11px;}]]></Css></FieldAspect></Field></Field></Field><FieldAspect t="field_feature.CssClass" AddClassTo="content" ClassName="body_top"/></Field><FieldAspect t="field_aspect.Hidden"><OnCondition t="field_aspect.CheckConditionForEveryItem" DataForCondition="Item data" WhenHidden="Do not render" ShowCondition="%$PageID% == \'About\'"/></FieldAspect></Field><FieldAspect t="field_aspect.Variable" VarName="PageID"><Value t="ui.UrlFragment" Attribute="page"/></FieldAspect></Field><Field t="control.Page" ID="_Link_to_page" Title="Footer"><Page t="sample.Footer"/></Field><FieldAspect t="field_aspect.PagePreviewSize"><Style t="visual_container.MobileSkin"/><Size t="preview_device.Desktop"/></FieldAspect><FieldAspect t="async.AsyncActionBeforeLoad" ShowLoadingTextInStudio=""><LoadingStyle t="loading_style.Default" Height="100px"/><Action t="uiaction.SetUrlFragment" Attribute="page" Value="home"><Condition t="yesno.IsEmpty"><Value t="ui.UrlFragment" Attribute="page"/></Condition></Action></FieldAspect></xtml></Component><Component id="Footer" type="jbart.MyWidgetPage"><xtml t="control.Layout" ID="_footer" Title="Footer"><Layout t="ui.CustomCss" base="layout.Vertical"><Style t="layout.Vertical" Spacing="0"/><Css><![CDATA[#this {\r  background-color: #322F31;\r  height: 59px;\r  position: relative;\r}]]></Css></Layout><Field t="control.Label" ID="_Label6" Title="Label" Text="Copyright 2014 - ArtwareSoft.com"><Style t="ui.CustomCss" base="uitext.PlainText"><Style t="uitext.PlainText"/><Css><![CDATA[#this {\r  text-align:center;\r  color:#e3d5dd;\r  display:inline-block;\r  margin:0 auto;\r  width:100\\%;\r  position:absolute;\r  top:20px;\r}]]></Css></Style></Field><Field t="control.Button" ID="_Button1" Title="Terms of service"><Style t="ui.CustomCss" base="btn.Hyperlink"><Style t="btn.Hyperlink"/><Css><![CDATA[#this {\r  cursor:pointer;\r  font-family:"lucida grande", tahoma;\r  color:#d1d1d1;\r  font-size:11px;\r  text-decoration:none;\r  position:absolute;\r  top:20px;\r  right:27px;\r}\r#this:hover {\r  text-decoration:underline;\r}]]></Css></Style><Action t="action.RunActions"><Action t="uiaction.GoToPage" Type="open in a new tab" Url="https://docs.google.com/document/d/159d993wZqgWtLloh4xVITTFixfxusD5_L0VJQNRVraw/pub"/></Action></Field></xtml></Component></xtml><compress black_list="datefilter.DateFilterControl,field.TextFilterControl"/><embed with_data="true" dir="C:\\jbartdev\\gae\\artwaresite\\war\\"/></file>'; 
window.jBart = window.jBart || jBart; jBartWidgets.Artware_Site = jBart.activator(jBartWidget_Artware_Site);
}());