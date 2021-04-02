var aa_xtml_total = 122340;
var aa_js_total = 253202;
var aa_gc_total = 189164;
var ajaxart = { debugmode: false, xtmls_to_trace: [], trace_level: 2,           traces : [], components: [], componentsXtmlCache: [], usages: [], types: [], plugins: [], gcs: {},           log_str: '', loading_objects : 0, logs: {}, default_values: [], inPreviewMode: false, stack_trace: [], build_version: 'ART_NOW',           xml: {}, cookies: {}, ui: {}, yesno: {}, dialog: { openPopups: []}, xmlsToMonitor: [], lookup_cache: {}, occurrence_cache: {},           unique_number: 1, action: {}, runningTimers: {}, runDelayed: [], hasVarsRegex: /\%[^ ,;\(\)]/ , STRING_WITH_EXP: /%[^ ,;\(\)]/, NOT_EXP: /^[ ,;\(\)]/};          window.jBartWidgets = window.jBartWidgets || { vars: {} };
var jBart = { vars: {}, api: {}, utils: {}, dialogs: {}, bart: {}, db: {} }
var aa_noOfOpenDialogs= 0,aa_dialogCounter= 0,openDialogs = [], aa_openDialogs = [];
var aa_intest,aa_incapture;
var aa_navigation_codes = [38,40, 33,34,63277,63276];
var aa_xmlinfos = [], aa_async_finished_listeners = [];
window.jBartPreloader = function (finished) {
	var script_parent = document.body;
	if (!script_parent) script_parent = document.head;
	var load_js = function(url) {
		  var fileref=document.createElement('script')
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
aa_determine_device();
var aa_delayed_actions = {};

jBart.remove = function (elem) { aa_remove(elem,true); }



function aa_gcs(plugin, gcs) {
	if (!ajaxart.gcs[plugin])
		ajaxart.gcs[plugin] = gcs;
	else {
		var plugin = ajaxart.gcs[plugin];
		for (var gc in gcs)
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



function aa_text(data,script,field,params,method,booleanExpression)
{
	if (booleanExpression) 
		return ajaxart.totext(ajaxart.run(data,script,field,params,method,booleanExpression));
	return ajaxart.totext_array(ajaxart.run(data,script,field,params,method,booleanExpression));
}



function aa_hasAttribute(elem,attr)
{
	return elem.getAttribute(attr) != null;
}



function aa_totext(data)
{
	if (typeof(data) == "string") return data;
	if (data == null || data.length == 0) return "";
	return ajaxart.totext_item(data[0]);
}



function aa_xpath(xml,xpath,createIfDoesNotExist) {
	return ajaxart.xml.xpath(xml,xpath,createIfDoesNotExist);
}



function aa_first(data,script,field,params,method) {
	var result = ajaxart.run(data,script,field,params,method);
	if (result.length == 0) return null;
	return result[0];
}



function aa_createElement(elem, tag)
{
	if (elem == null || !ajaxart.isxml(elem))
		return ajaxart.parsexml("<" + tag + "/>");
	if (ajaxart.isBackEnd)
		return elem.getOwnerDocument().createElement(tag);
	return elem.ownerDocument.createElement(tag);
}



function aa_importNode(node, target)
{
	if (target == null) return node;
	if (target.ownerDocument != node.ownerDocument && target.ownerDocument.importNode != undefined)
	  return target.ownerDocument.importNode(node,true);
	return node;
}



function aa_text_capitalizeToSeperateWords(str)
{
	  var out = "";
	  var start=0; var counter=1;
	  while (counter < str.length)
	  {
		  if (str.charAt(counter) >= 'A' && str.charAt(counter) <= 'Z')
		  {
			  if (counter+1 < str.length && ( str.charAt(counter-1) < 'A' || str.charAt(counter-1) > 'Z') )
			  {
			    out = out + str.substring(start,counter) + " " + str.charAt(counter);
			    start = counter+1;
			  }
		  }
		  counter++;
	  }
	  out = out + str.substring(start);
	  return out;
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



function aa_tobool(data)
{
  if (data == null || data.length == 0) return false;
  if (ajaxart.totext_array(data)=="true") return true;
  return false;
}



function aa_removeXmlInfo(xml,context)
{
  for(var i=aa_xmlinfos.length-1;i>=0;i--)   // we'll probably use the last ones defined 
	  if (aa_xmlinfos[i].Xml == xml) { 
		  aa_xmlinfos.splice(i,1); 
		  return;
	  }
}



function aa_paramExists(profile,param,excludeEmptyAttribute)
{
  var script = ajaxart.fieldscript(profile,param,true);
  if (script == null) return false;
  if (script.nodeType == 1 && script.getAttribute('t') == "") return false;
  if (script.nodeType == 1 && ! aa_hasAttribute(script,'t') ) return false;
  if (excludeEmptyAttribute && profile.getAttribute(param) == '') return false;
	  
  return true;
}



function aa_frombool(bool) 
{
  if (bool) return ["true"];
  return [];
}



function aa_ctx(context,vars)
{
  var out = ajaxart.clone_context(context);
  for (var i in vars) out.vars[i] = vars[i];
  return out;
}



function aa_tag(item)
{
	return item.tagName;
}



function aa_passing_validations(topControl)
{
	if (topControl == null) return true;
	var context = ajaxart.newContext();
	
	jQuery(topControl).find('.aa_noclose_message').remove();
	var optionals = jQuery(topControl).find('.aa_hasvalidations');
	for(var i=0;i<optionals.length;i++) {
	  var elem = optionals[i];
	  if (elem.updateValue) elem.updateValue();
	  aa_handleValidations(elem.jbCell.Field,elem,elem.jbCell.FieldData,elem.jbCell.jbContext,'on save');
	  context = elem.jbCell.jbContext;
	}
	
	var errorInput = jQuery(topControl).find('.aa_mandatory_error')[0];
	if (errorInput && errorInput.jbShowErrorSummary) { aa_validation_showerror(topControl,errorInput.Error,errorInput,context); return false;}
	
	var errors = jQuery(topControl).find('.aa_validation_error');
	if (errors.length > 0) {
		if (errors[0].jbShowErrorSummary) {
		  aa_validation_showerror(topControl,ajaxart_multilang_text(errors[0].innerHTML,context),errors[0],context);
		  errors[0].innerHTML = "";
		}
		return false;
	}
	
	return true;
}



function aa_attach_global_css(globalcss,cntr,className,supportWrapper)
{
	if (!window.aa_container_styles) window.aa_container_styles = {};
	if (!globalcss) return '';
	jBartWidgets.vars.uniqueNumber = jBartWidgets.vars.uniqueNumber || 0;
	
	if (!aa_container_styles[globalcss]) { 
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
		aa_container_styles[globalcss] = obj;
		
		if (ajaxart.isFireFox) obj.globalcss = obj.globalcss.replace(/-webkit-/g,'-moz-');
		obj.globalcss = aa_clean_global_css(obj.globalcss);
		obj.globalcss = aa_adapt_css_for_browser(obj.globalcss);		
		obj.globalcss = obj.globalcss.replace(/#this/g,'.'+obj.elem_class);
		if (supportWrapper)
		  obj.globalcss = obj.globalcss.replace(/#wrapper/g,'.'+obj.elem_class+'_wrapper');
		if (obj.cntr_class)
			obj.globalcss = obj.globalcss.replace(/#cntr/g,'.'+obj.cntr_class);
		obj.styleElem=jQuery("<style>" + obj.globalcss + "</style>")[0];
		document.getElementsByTagName("head")[0].appendChild(obj.styleElem);
		obj.styleElem.StyleObject = obj;
	}
	
	if (cntr && aa_container_styles[globalcss].cntr_class)
		jQuery(cntr).addClass(aa_container_styles[globalcss].cntr_class);
	return aa_container_styles[globalcss].elem_class;
}



function aa_merge_ctx(context,contextVars,moreVars)
{
  var result = { params: context.params , vars: contextVars.vars , componentContext: context.componentContext , _This: contextVars._This};
  if (moreVars)
	  result = aa_ctx(result,moreVars);
  return result;
}



function aa_prepare_calculated_fields_for_item(fields,item_data,context)
{
	for(var i=0;i<fields.length;i++) {
		var field = fields[i];
		if (field.DefaultValue) field.FieldData(item_data,context);
		if (field.IsGroup && field.Fields) {
			var field_data = field.FieldData(item_data,context);
			aa_prepare_calculated_fields_for_item(field.Fields,field_data,context);
		}
		// TODO: add logic if calculated
	}
}



function aa_api_object(jElem,props)
{
	jElem = jQuery(jElem);
	var out = jElem[0];
	for(i in props) out[i] = props[i];
	out.jElem = jElem;
	var props_str = 'jElem,getInnerElement,setInnerHTML,setImageSource,setImage,setOnClick,bind,trigger,control';
	for(var i in props) props_str += (','+i);
	aa_defineElemProperties(out,props_str); // for memory leaks
	
	out.control = out;
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
	out.setImage = out.setImageSource = function(classOrElement,imageObject)
	{
		var inner = this.getInnerElement(classOrElement);
		if (inner && imageObject) aa_set_image(inner,imageObject,false);
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



function aa_fieldById(id, fields)
{
	if (fields)
		for(var i=0;i<fields.length;i++) {
			if (fields[i].Id == id) return fields[i];
			if (fields[i].IsGroupOnlyForLayout) {	// getting inside groups
				var result = aa_fieldById(id,fields[i].Fields);
				if (result) return result;
			}
		}
	
}



undefined



function aa_apply_style_js(obj,style,context)
{
	aa_style_context = { jElem: obj.jElem }
	if (!style.jsFunc && style.Javascript ) {
		try {
		  eval('style.jsFunc = ' + style.Javascript);
		} catch(e) {
			ajaxart.logException(e,'could not compile a js function ' + style.Javascript);
		}
	}
	if (style.jsFunc) return style.jsFunc(obj,context);
}



function aa_setMethod(object,method,profile,field,context)
{
	var compiled = ajaxart.compile(profile,field,context);
	var init = function(compiled) {
		object[method] = function(data1,ctx) {
			var newContext = aa_merge_ctx(context,ctx);
			newContext._This = object;
			if (compiled == "same") return data1; 
			else if (compiled) 
			  return compiled(data1,newContext);
			else
			  return ajaxart.run(data1,profile,field,newContext);
		}
	}
	init(compiled);
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
		  	}
		    if (elem.jBartDomProps) {
		    	for(var i=0;i<elem.jBartDomProps.length;i++)
		    	  elem[elem.jBartDomProps[i]] = null; 
		    	elem.jBartDomProps = null;
		    }
		    
		    elem.ajaxart = elem.Cntr = elem.Data = elem.ItemData = elem.Dialog = elem.jElem = elem.Field = elem.OnAttach = elem.OnDetach = elem.Contents = null;
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
		
		var tag = aa_tag(elem).toLowerCase();
		try {
			if (tag != 'table' && tag != 'tfoot' && tag != 'thead' && tag != 'tr')	// http://support.microsoft.com/kb/239832
				elem.innerHTML = "";
		} catch(e) {}
	}
//	if (cleanMemoryLeaks && ajaxart.isIE)  { 
//	}
}



function aa_renderStyleObject(style,objectProperties,context)
{
	var jElem = jQuery(style.Html);
	if (!jElem[0]) jElem = jQuery('<div/>');
	var object = aa_api_object(jElem,objectProperties);
	var cntr = context.vars._Cntr ? context.vars._Cntr[0] : null;
	jElem.addClass(aa_attach_global_css(style.Css,cntr));
	aa_apply_style_js(object,style,context);
	
	return jElem[0];
}



function aa_defineElemProperties(elem,properties)
{
	if (!elem.jBartDomProps) elem.jBartDomProps = properties.split(',');
	else ajaxart.concat(elem.jBartDomProps,properties.split(','));
}



function aa_buildSectionControl(cntr,field,field_data,item_data,ctx)
{
	var newContext = aa_ctx(ctx,{_Field: [field], FieldTitle: [field.Title], _Item: item_data } );
	var style = field.SectionStyle;
	if (!style || !style.Html || field.HideTitle) {
		var out = jQuery('<div class="aa_section"/>')[0];
		ajaxart_field_createCellControl(item_data,cntr,out,"control",field,field_data,newContext);  
		return out;
	}
	var jElem = jQuery(style.Html);
	field.SectionImage = aa_init_image_object(field.SectionImage,item_data,ctx);
	
	var section = aa_api_object(jElem,{Title: field.Title ,Image: field.SectionImage});
	aa_defineElemProperties(section,'addSectionBody,updateCollapsed');
	if (field.SectionCollapsedByDefault) section.collapsed = true;
	
	section.addSectionBody = function(classOrElement) {
		var inner = this.getInnerElement(classOrElement);
		if (inner) 
		  ajaxart_field_createCellControl(item_data,cntr,inner,"control",field,field_data,newContext);
		if (this.collapsed) jQuery(inner).css('display','none');
	}
	section.updateCollapsed = function(collapsed) {
		section.collapsed = collapsed;
	}
	jElem.addClass(aa_attach_style_css(style)).addClass('aa_section');
	aa_apply_style_js(section,style);
	return jElem[0];
}



function aa_element_attached(elem)
{
  if (! ajaxart.isattached(elem)) return;
  var items = jQuery(elem).find('.aa_onattach').get();
  if (jQuery(elem).hasClass('aa_onattach')) items.push(elem);
  for(var i=0;i<items.length;i++) {
	  if (jQuery(items[i]).hasClass('aa_onattach_called')) continue;
	  if (items[i].OnAttach) items[i].OnAttach.call(items[i]);
	  jQuery(items[i]).addClass('aa_onattach_called');
  }
}



function aa_items(cntr) 
{ 
	if (cntr.IsSingleItem)
		return (cntr.Items == null || cntr.Items.length == 0 || cntr.Items[0].Items.length == 0) ? [] : [cntr.Items[0].Items[0]];

	var source_cntr = cntr;
	if (cntr.InheritsItems)
	{
		source_cntr = source_cntr.Context.vars._ParentCntr[0];
		while (source_cntr && source_cntr.IsVirtualGroup)
			source_cntr = source_cntr.Context.vars._ParentCntr[0];
	}
	if (!source_cntr) return [];
	var result;
	if (source_cntr.FilteredWrappers && cntr.WrappersAsItems)
		result = source_cntr.FilteredWrappers;
	else if (source_cntr.FilteredWrappers)
	{
		result = [];
		var wrappers = source_cntr.FilteredWrappers;
		for(var i=0;i<wrappers.length;i++)
			result.push(wrappers[i].__item || wrappers[i]);
	}
	else if (source_cntr.FilteredItems)
		return source_cntr.FilteredItems;
	else
		result = source_cntr.Items[0].Items;
	return result;
}



function aa_find_header(cntr) { return aa_find_just_in_container(cntr,'.aa_container_header',true); }



function aa_find_footer(cntr) { return aa_find_just_in_container(cntr,'.aa_container_footer',true); }



function aa_int(data,script,field,params,method)
{
	var result = ajaxart.run(data,script,field,params,method);
	return parseInt(ajaxart.totext_array(result));
}



function aa_invoke_cntr_handlers(cntr,eventFuncs,data,ctx,extra)
{
	if (! eventFuncs || eventFuncs.RunningFlag) return;
	eventFuncs.RunningFlag = true; // avoid recursion
	var newContext = aa_ctx(ctx,{_Cntr: [cntr]});
	try
	{
		for(var i=0;i<eventFuncs.length;i++)
			eventFuncs[i](data,newContext,extra);
	}
	catch (e) {}
	eventFuncs.RunningFlag = false;
}



function aa_delayedRun  (func,id,delay,milliToForce) 
{
	// look for the id in the table
	var newRecord = { id: id , handle: null}
	var getTimerFunc = function(record)
	{
		return function() {
			record.handle = 0;
			var force = false;
			if (record.startTime == null) record.startTime = new Date().getTime();
			else if (record.startTime + milliToForce > new Date().getTime())
				force = true;
			
			var success = func(force);
			if (success || force) {
				jBart.utils.removeFromArray(ajaxart.runDelayed,newRecord);
			}
			else
				newRecord.handle = setTimeout(getTimerFunc(newRecord),delay); // keep trying till milliToForce
		}
	}

	for(var i=0;i<ajaxart.runDelayed.length;i++)
	{
		var record = ajaxart.runDelayed[i];
		if (typeof(record.id) == typeof(id) && record.id == id) {
			if (record.handle != 0)
			  clearTimeout(record.handle);
			ajaxart.runDelayed[i] = newRecord;
			newRecord.handle = setTimeout(getTimerFunc(newRecord),delay);
			return ["true"];
		}
	}
	ajaxart.runDelayed.push(newRecord);
	newRecord.handle = setTimeout(getTimerFunc(newRecord),delay);
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



function aa_addOnAttach(elem,func)
{
	jQuery(elem).addClass('aa_onattach');
	elem.OnAttach = func;
	if (ajaxart.isattached(elem)) elem.OnAttach();
}



function aa_createDataHolderFromCntr(cntr,context)
{
	var fields = aa_DataviewFields(cntr.Fields);
	var items = cntr.Items[0].Items || [];
	var exp = cntr.Dataview_PreFilter ? cntr.Dataview_PreFilter.join(' AND ') : '';
	if (cntr.Dataview_PreTextQuery)
		exp += cntr.Dataview_PreTextQuery;
	var pre_filters = exp ? aa_filters_from_expression(exp,fields) : [];
	var filters = [].concat(pre_filters).concat(cntr.ExposedFilters || []);
	var wrappers = aa_create_wrappers(items,fields,filters,context);
	var calculatedFields = aa_CalculatedFields(fields);
	var dataholder = aa_newDataHolder(wrappers,context);
	dataholder.UserDataView.Sort = cntr.Dataview_PreSort || [];
	dataholder.UserDataView.Filters = cntr.ExposedFilters || [];
	dataholder.Fields = fields;
	aa_calcFields(dataholder.Wrappers,calculatedFields,dataholder,filters);
	if (pre_filters[0])
		dataholder.newFiltersDataView(pre_filters,[],'pre').CalcFilters();
	return dataholder;
}



function aa_cntr_filterXml2Objects(cntr,filterXml) 
{
	var out = [];
	for (var i=0; i<filterXml.attributes.length; i++) {
		var attr = filterXml.attributes.item(i);
		var field = aa_fieldById(attr.name,cntr.Fields);
		if (!field) continue;
		var filter = aa_create_filter(field,filterXml.getAttribute(attr.name),'=');
		if (!filter) {
			field.newFilter = aa_create_text_filter();
			filter = aa_create_filter(field,filterXml.getAttribute(attr.name),'=');
		}
		if (filter) out.push(filter);
	}
	
	return out;
}



function aa_recalc_filters_and_refresh(cntr,data,context,show_all)
{
	context = context || cntr.Context;
    var top = ajaxart_find_aa_list(cntr);
    if (!top) return;
    aa_RunAsyncQuery([data, cntr],aa_FilterAndSort,context,function(dataview) { aa_refresh_itemlist(cntr,aa_ctx(context,{DataView:dataview}),show_all) });// for compression: aa_FilterAndSort()
    //ajaxart_RunAsync([data, cntr],aa_FilterAndSort,context,function() { aa_refresh_itemlist(cntr,context,show_all) } );
}



function aa_fire_event(item,event,context,props)
{
	if (typeof(props) == "undefined") props = {};
	
	if (! ajaxart.isSafari || ajaxart.isattached(item) )
		  xFireEvent(item, event, props,context.vars.InTest != null);
	else {
		ajaxart_source_elem_in_test = item;
		while (item != null)
		{
			xFireEvent(item, event,props,context.vars.InTest != null);
			item = item.parentNode;
		}
		ajaxart_source_elem_in_test = null;
	}
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



function aa_uidocument(data,id,dataitems,fields,aspectsFunc,operationsFunc,context,readonly)
{
	var cntr = { ID: [id] , IsSingleItem: true, isObject: true , Fields: fields, Items: dataitems, ReadOnly: readonly==true }
	var newcontext = aa_ctx(context,{_ParentCntr: context.vars._Cntr, _Cntr : [cntr] } );
	cntr.Context = newcontext;
 	cntr.Ctrl = jQuery('<div class="aa_container aa_non_selectable"><div class="aa_container_header"/><div class="aa_list aasection aa_item aa_cntr_body"/><div class="aa_container_footer"/></div>')[0];
	cntr.Ctrl.Cntr = cntr;
 	if (id != '')
 	  jQuery(cntr.Ctrl).addClass('Page_'+id);

 	if (aa_tobool(context.vars.IsNewItem)) cntr.IsNewItem = true;
 		
 	var aspects = cntr.Aspects = aspectsFunc(data,newcontext);
 	
	for(var i=0;i<aspects.length;i++)
      ajaxart.runScriptParam(data,aspects[i].CreateContainer,newcontext);

	var fillContainer = function(cntr,aspects) {
		cntr.PostActors = [];cntr.PreActors = [];
		cntr.RegisterForPostAction = function(aspect,phase) { cntr.PostActors.push({ phase: phase || 0, aspect: aspect}); }
		cntr.RegisterForPreAction = function(aspect,phase) { cntr.PreActors.push({ phase: phase || 0, aspect: aspect}); }

		if (cntr.Items.length == 0) { cntr.Items = [{isObject: true , Items: []}] }
		if (cntr.Items[0].Items.length == 0) { cntr.NoData = true; cntr.Items[0].Items.push(ajaxart.parsexml('<xml/>')) }
			
		var items_data = (cntr.Items == null || cntr.Items.length == 0 || cntr.Items[0].Items.length == 0) ? [] : [cntr.Items[0].Items[0]];

		cntr.ElemsOfOperation = function() { return jQuery(this.Ctrl).find('.aa_item').slice(0,1).get(); }
		cntr.ItemsOfOperation = function() { return [this.Items[0].Items[0]]; }

		cntr.CellPresentation = 'control';
		cntr.Operations = operationsFunc;    
		    
//		var doc_section = jQuery(cntr.Ctrl).find('.aasection')[0];
//		if (doc_section != null) {
//		  ajaxart.setVariable(newcontext,"_Section",[doc_section]);
//		  doc_section.ItemData = items_data;
//		}
		    
	    for(var i=0;i<cntr.Aspects.length;i++) {
	    	ajaxart.trycatch( function() {
	    		ajaxart_runMethod(data,cntr.Aspects[i],'InitializeContainer',newcontext);
	    	}, function(e) { ajaxart.log("error in aspect " + cntr.Aspects[i].XtmlSource[0].script.getAttribute('t') + ": " + e.message + e.stack || '',"error"); });
	    }

		cntr.PreActors.sort(function(a,b) { return a.phase > b.phase ? 1 : -1; });
	    cntr.PostActors.sort(function(a,b) { return a.phase > b.phase ? 1 : -1; });

		for(var i=0;i<cntr.PreActors.length;i++) {
		  	ajaxart.trycatch( function() {
		    	  ajaxart.runScriptParam([],cntr.PreActors[i].aspect.PreAction,cntr.Context);
		   	}, function(e) { ajaxart.logException(e); });
		}
	    aa_refresh_itemlist(cntr,newcontext,true);
	    //ajaxart.runsubprofiles(items_data,profile,'SectionAspect',newcontext);
	    
	    if (cntr.NoData && cntr.ControlForNoData) {
	        var top = ajaxart_find_aa_list(cntr);
	        var ctrl = cntr.ControlForNoData([],context)[0];
	      	jQuery(ctrl).addClass('aa_list');
	      	aa_replaceElement(top,ctrl);
	    }
	}
	
	if (cntr.RunAsyncAction && cntr.ControlForWaiting) {
		var myCallback = function(cntr,aspects) { return function() {
			var loading = cntr.Ctrl;
			cntr.Ctrl = cntr.OriginalCtrl;
			fillContainer(cntr,aspects);
			aa_replaceElement(loading,cntr.Ctrl);
	      	aa_fixTopDialogPosition();
		}}
		cntr.OriginalCtrl = cntr.Ctrl;
		cntr.Ctrl = cntr.ControlForWaiting(data,context)[0];
		cntr.Ctrl.Cntr = cntr;
		aa_runMethodAsync(cntr,cntr.RunAsyncAction,data,aa_ctx(context,{}),myCallback(cntr,aspects));
		return cntr.Ctrl;
	}
	
	fillContainer(cntr,aspects);
    return cntr.Ctrl;
}



function aa_setCssText(elem,cssText)
{
  if (ajaxart.isFireFox) cssText = cssText.replace(/-webkit-/g,'-moz-');
  elem.style.cssText = cssText;
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



function aa_xml2htmltext(xml) // faster than xml2text and supports mixed html inner text
{
	if (xml == null) return '';
	
	if (xml.nodeType == null) return xml;
	if (xml.nodeType == 2 || xml.nodeType == 3 || xml.nodeType == 4) { // Attribute or inner text
		return ajaxart.xmlescape(ajaxart.isBackEnd ? '' + xml.nodeValue : xml.nodeValue);
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



function aa_create_search_words_text_filter(matchOnlyTextBeginning)
{
	return function(initialFilterData)
	{
		var CompileFilterData = function(filter_data)
		{
			var text = aa_totext(filter_data).toLowerCase();
			
			var pattern = { searchWordsPattern: true };
			pattern.text = text;
			
			var pp = pattern.text.split(' ');
			pattern.p1 = (pp.length > 0 && ' ' + pp[0]);
			pattern.p2 = (pp.length > 1 && ' ' + pp[1]);
			pattern.p3 = (pp.length > 2 && ' ' + pp[2]);
			pattern.p4 = (pp.length > 3 && ' ' + pp[3]);
			pattern.words = pp.length;
			
			return pattern;
		}
		return	{
			TextFilter: true,
			filterData: CompileFilterData(initialFilterData),
			SetFilterData: function(filterData) { this.filterData = CompileFilterData(filterData); }, 
			ToSQLText: function(rawData) { return ajaxart.totext_array(rawData) },
			Match: function(field,wrapper)
			{
				var pattern = this.filterData; 
				if (!pattern) return true;
				if (pattern.text == 'sony') debugger;
				
				var val = wrapper[field.Id];
				var s = ' ' + val.toLowerCase().replace(/^\s*|\s*$/g, ' ');
				var words_found = 0,show_first=false;
				
				var p1 = pattern.p1;
				if (pattern.words > 1) {
					if (p1 && s.indexOf(p1) != -1) words_found++;
					if (pattern.p2 && s.indexOf(pattern.p2) != -1) words_found++;
					if (pattern.p3 && s.indexOf(pattern.p3) != -1) words_found++;
					if (pattern.p4 && s.indexOf(pattern.p4) != -1) words_found++;
					if (words_found == pattern.words) {
						show_first = true;
					} 
				} else if (s.indexOf(p1) == 1) {	// starts with pattern
					show_first = true;
				} else if (s.indexOf(p1) > 0) {
					words_found++;
				}

				if (show_first || words_found == pattern.words) return true;
				return false;
			},
			HighlightSelectedText: function(control,selectedClass) {
  				var pattern = this.filterData;
  				var p1,p2,p3,p4;  // TODO: for on pattern.words
  			    if (pattern.p1) p1 = pattern.p1.substring(1); 
  			    if (pattern.p2) p2 = pattern.p2.substring(1); 
  			    if (pattern.p3) p3 = pattern.p3.substring(1);// remove space prefix
  			    if (pattern.p4) p4 = pattern.p4.substring(1);
  				
  	    		if (p1 && control.innerHTML.toLowerCase().indexOf(p1) != -1)
  	    			control.innerHTML = ajaxart_field_highlight_text(control.innerHTML,p1,selectedClass);
  	    		if (p2 && control.innerHTML.toLowerCase().indexOf(p2) != -1)
  	    			control.innerHTML = ajaxart_field_highlight_text(control.innerHTML,p2,selectedClass);
  	    		if (p3 && control.innerHTML.toLowerCase().indexOf(p3) != -1)
  	    			control.innerHTML = ajaxart_field_highlight_text(control.innerHTML,p3,selectedClass);
  	    		if (p4 && control.innerHTML.toLowerCase().indexOf(p4) != -1)
  	    			control.innerHTML = ajaxart_field_highlight_text(control.innerHTML,p4,selectedClass);
			}
		}
	};
}



function aa_create_text_filter(matchOnlyTextBeginning)
{
	return function(initialFilterData)
	{
		var CompileFilterData = function(filter_data)
		{
			var txt = aa_totext(filter_data);
			if (txt == '') return [];
			return txt.toLowerCase().split(',');
		}
		return	{
			TextFilter: true,
			filterData: CompileFilterData(initialFilterData),
			SetFilterData: function(filterData) { this.filterData = CompileFilterData(filterData); }, 
			ToSQLText: function(rawData) { return ajaxart.totext_array(rawData) },
			Match: function(field,wrapper)
			{
				if (this.filterData.length == 0) return true;
				for(var i in this.filterData)
				{
					var index = ('' + wrapper[field.Id]).toLowerCase().indexOf(this.filterData[i]);
					var result = matchOnlyTextBeginning ? index == 0 : index > -1;
					if (result) return true;
				}
				return false;
			},
			HighlightSelectedText: function(control,selectedClass) {
  				var pattern = this.filterData[0];
  				
				if (control.innerHTML.toLowerCase().indexOf(pattern) != -1)
				   control.innerHTML = ajaxart_field_highlight_text(control.innerHTML,pattern,selectedClass);
			}
		}
	};
}



function aa_init_onresize()
{
	window.aa_windowresize_timer = window.aa_windowresize_timer || 0; 
	window.onresize = function() {
		if (aa_windowresize_timer != 0)  clearTimeout(aa_windowresize_timer);
		aa_windowresize_timer = setTimeout(function() {
			aa_fixstretch();
			jBart.trigger(jBart,'windowResize',{});
			aa_windowresize_timer = 0;
		},100);
	}
}



function aa_find_field(field_id,class_to_guess,return_cell)
{
	var root = aa_intest ? aa_intest_topControl : document;
	var class_to_find = field_id ? "fld_" + field_id : class_to_guess;
	if (!class_to_find) return [];
	var fields = jQuery(root).find('.' + class_to_find);
	return return_cell ? fields.parent().get() : fields.get();
}



function aa_addOnAttachMultiple(elem,func)
{
	jBart.bind(elem,'_OnAttach',func);
	aa_addOnAttach(elem,function() {
		jBart.trigger(elem,'_OnAttach');
	});
}



function aa_attach_window_resize(func, elem)
{
	if (!elem || !func) return;
	if (ajaxart.aa_windowresize == null) {
		ajaxart.aa_windowresize = 0; 
		ajaxart.window_size = { height: window.innerHeight, width:window.innerWidth};
		function onresize() {
			if (ajaxart.aa_windowresize != 0)
				clearTimeout(ajaxart.aa_windowresize);
			if (ajaxart.window_size.width == window.innerWidth &&
				Math.abs(ajaxart.window_size.height - window.innerHeight) > 100) return;  // Android fix: openning the keyboard should not call on resize.	
																						// Notive that when address bar is hiding, we need resize event. Address bar size is about 40-60 pixels.																					
			 ajaxart.window_size = { height: window.innerHeight, width:window.innerWidth};																		
			 aa_windowresize = setTimeout(function() {
				jQuery("body").find(".aa_window_resize_listener").each(function(i,elem) { jBart.trigger(elem,'WindowResize'); });
				 aa_windowresize = 0;
		 	}, 100);
		}
		window.addEventListener('resize', onresize);
		window.addEventListener('orientationchange', onresize);	// sometimes orientationchange is fired and sometimes resize, http://blog.blazingcloud.net/2012/05/08/orientationchange-and-resize-events-on-the-iphone/
	}
	jQuery(elem).addClass('aa_window_resize_listener');
	jBart.bind(elem,'WindowResize',func);
}



function aa_run_js_code(code,data,context,elem)
{
	var func = aa_get_func(code);
	if (!elem)
		if (context.vars._ElemsOfOperation && context.vars._ElemsOfOperation.length)
			elem = context.vars._ElemsOfOperation[0];
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



function aa_runMethodAsyncQuery(object,methodFunc,data,context,callBack)
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



function aa_lp_escapeDisplayArgument(text)
{
	var out = '';
	for(var i=0;i<text.length;i++) {
		if (text.charAt(i).search(/[a-zA-Z0-9,\\-\\_;:\\.\\s\\#\\&]/) == -1 ) {
			var code = text.charCodeAt(i);
			out += '&#'+code+';';
		}
		else {
			out += text.charAt(i);
		}
	}
	return out;
}



function aa_refresh_cell(cell,context,transition)
{
   var td = jQuery(cell).hasClass('aa_cell_element') ? cell : jQuery(cell).parents('.aa_cell_element')[0];
   if (!td) return;
   if (td.Refresh) return td.Refresh();
   var field = td.Field;
   if (field == null) return;
   if (field.Refresh) field.Refresh([],context);
   var field_data = td.FieldData;
   var item_data = td.ItemData;
   var parent = jQuery(td).parents('.aa_container')[0];
   var cntr = parent ? parent.Cntr : {}; 

   newContext = aa_ctx(context,{_Field: [field], FieldTitle: [field.Title], _Item: item_data, _Cntr: [cntr] });
   field_data = ajaxart_field_calc_field_data(field,item_data,newContext);
   
   if (transition && td.childNodes.length == 1) {
     var oldElem = td.firstChild;
     while (td.firstChild) aa_remove(td.firstChild,true);
     ajaxart_field_createCellControl(item_data,cntr,td,td.CellPresentation,field,field_data,newContext);
     var newElem = td.firstChild;
     td.insertBefore(oldElem,td.firstChild);
     transition.replace(oldElem,newElem,context);
   }
   else {
     aa_empty(td,true);
     aa_clear_jb_classes(td);
     
 	 if (field.AsSection && !field.HideTitle) {
 		var section = jQuery(td).parents('.aa_section')[0];
 		if (!section || !section.parentNode) return;
 		td = section.parentNode;
 		aa_empty(td,true);
	    aa_clear_jb_classes(td);
		td.appendChild(aa_buildSectionControl(cntr,field,field_data,item_data,newContext));
	 } else {
		 ajaxart_field_createCellControl(item_data,cntr,td,td.CellPresentation,field,field_data,newContext);
	 }
   }
   aa_element_attached(td);
}



function aa_field_handler(field,event,handler,id,phase)
{
	aa_register_handler(field,event,handler,id,phase);
}



function aa_keepimageprops(img,user_width,user_height)
{
	var imgObj = new Image(); imgObj.src = img.getAttribute('src');
	if (imgObj.complete) aa_fixImageSize(img,user_width,user_height); 
	else {
		img.onload = function() { aa_fixImageSize(img,user_width,user_height); }
	}
}



function aa_multilang_text(data,script,field,context)
{
	return ajaxart_multilang_run(data,script,field,context)[0] || '';
}



function aa_set_fielddata_method(field,path)
{
	field.FieldData = function(data,ctx) 
	{
		if (data.length == 0) return [];
		if (!data[0].nodeType) 
			var out = [data[0][path.split('@').pop()]];
		else
			var out = ajaxart.xml.xpath(data[0],path,false);
		if (out.length > 0) 
			return out;
		if (!ctx || aa_tobool(ctx.vars._NoDefaultValue)) return out;
		
		var out = ajaxart.xml.xpath(data[0],path,true);
		var defaultValue = ajaxart_runMethod(data,field,'DefaultValue',ctx);
		ajaxart.writevalue(out,defaultValue,true);
		return out;
	};
}



function aa_add_field_type_triplet(field,style,data,context)
{
	field.Control = function(field_data,ctx) {
		ctx = aa_ctx(ctx,{_Field: [field]});
		var cntr = ctx.vars._Cntr && ctx.vars._Cntr[0];
		var rawtext = field.Text ? ''+field.Text(field_data,ctx) : aa_totext(field_data,ctx);
		var text = rawtext.replace(/\n/g,'</BR>');
		var properties = {
			text: text,
			rawtext : rawtext,
			val: aa_totext(field_data,ctx),
			totext: function() {
				return aa_totext(field_data,ctx);
			},
			readonly: ajaxart_field_is_readOnly(cntr,field,ctx),
			set: function(value) {
				if (aa_totext(value) == aa_totext(field_data)) return; 
			    if (! field.ManualWriteValue) {
			    	ajaxart.writevalue(field_data,value);
			    	aa_invoke_field_handlers(field.OnUpdate,this.jbInput,null,field,field_data);
			    }
			    if (field.Validations) aa_handleValidations(field,this,data,context,"on change");
			},
			data: field_data[0],
			initInput: function(classOrElement) {
				var input = jQuery(this.getInnerElement(classOrElement))[0];
				this.jbInput = input;
				var textbox = this;
				var text = textbox.totext();
				
				input.onfocus = function(e) {
				    // select all on next timer
				    ajaxart.controlOfFocus = this;
				    aa_invoke_field_handlers(field.OnFocus,this,e,field,data);
					for(var parent=input.parentNode;parent;parent=parent.parentNode) if (parent.onfocus) parent.onfocus(e);  // for HoverOnPopup 
				    return true;
				}
				input.onblur = function(e) {
					for(var parent=input.parentNode;parent;parent=parent.parentNode) if (parent.onblur) parent.onblur(e);  // for HoverOnPopup 
				    ajaxart_field_RefreshDependentFields(field,this,context);
				    aa_invoke_field_handlers(field.OnBlur,this,e,field,data);
				    if (field.Validations) aa_handleValidations(field,this,data,context,"on blur");
				    return true;
				}

				input.onkeydown = function(e) {
					e = e || event;
					
				    if (field.KeyPressValidator && e.keyCode != 8) // backspace is fine 
				    {
						var ch = String.fromCharCode(e.keyCode);
						if (! field.KeyPressValidator.test(ch)) return aa_stop_prop(e);
				    }
				    aa_invoke_field_handlers(field.OnKeydown,this,e,field,data);
				    
					if (aa_intest && e.CharByChar)
						input.value += String.fromCharCode(e.keyCode);

					return true;
				}
				input.onmousedown = function(e) {
					e = e || event;
				    aa_invoke_field_handlers(field.OnMouseDown,this,e,field,data);
					return true;
				}
				input.onmouseup = function(e) {
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
					jQuery(input).bind('cut paste',null,function(e) {
						setTimeout(function() {
							input.updateValue(e);	
						},50);
					});
				}
				input.onkeyup = function(e) {
					var input = this;
					e = e || event;

					var keyCode = e.keyCode;
					if (keyCode == undefined && !aa_intest && !aa_inuiaction) return; // a mouse click !!!
					aa_invoke_field_handlers(field.OnKeyup,this,e,field,data,{isObject: true, KeyCode: ['' + keyCode], CtrlKey: aa_frombool(e.ctrlKey) });
					var codes = [9,13,16,17,18,27, 63277,63276]; // controls and navigation are masked
					for(var i=0;i<codes.length;i++)
						if (keyCode == codes[i]) return true;
					
				    if (field.KeyPressValidator && keyCode != 8) // backspace is masked 
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
				input.Blur = function() {
					jQuery(this).blur();
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
				    if (! field.ManualWriteValue)
				    	textbox.set(this.value);
				}
				input.value = text;
				input.setAttribute('value',text); // so the tests will pass on all browsers
			}
		};
		var jElem = jQuery(style.Html);
		var object = aa_api_object(jElem,properties);
		var control = aa_apply_style_js(object,style,ctx);
		if (control) jElem = jQuery(control);
		aa_api_object(jElem,properties);	// re-assigning properties
		jElem.addClass(aa_attach_global_css(style.Css));
		
		return [jElem[0]];
	}
}



function aa_wrapWithSection(ctrl,field,sectionStyle)
{
	var jElem = jQuery(sectionStyle.Html);
	var section = aa_api_object(jElem,{Title: field.Title ,Image: field.SectionImage});
	aa_defineElemProperties(section,'addSectionBody,updateCollapsed');
	if (field.SectionCollapsedByDefault) section.collapsed = true;
	
	section.addSectionBody = function(classOrElement) {
		var inner = this.getInnerElement(classOrElement);
		if (inner) inner.appendChild(ctrl); 
		if (this.collapsed) jQuery(inner).css('display','none');
	}
	section.updateCollapsed = function(collapsed) {
		section.collapsed = collapsed;
	}
	jElem.addClass(aa_attach_style_css(sectionStyle));
	aa_apply_style_js(section,sectionStyle);
	return jElem[0];
}



function aa_buildSection(cntr,tr,field,item_data,properties_width,ctx)
{
	var newContext = aa_ctx(ctx,{_Field: [field], FieldTitle: [field.Title], _Item: item_data } );
	var field_data = ajaxart_field_calc_field_data(field,item_data,newContext);

	var value_td = document.createElement("TD");
	value_td.colSpan = 2;
	tr.appendChild(value_td);
	var li = aa_buildSectionControl(cntr,field,field_data,item_data,ctx);
	value_td.appendChild(li);
}



function aa_set_initialize_container(aspect,func)
{
	aspect.InitializeContainer = function(data1,ctx) {
		var cntr = ctx.vars._Cntr[0];
		func(aspect,ctx,cntr);
	}
}



function aa_invoke_dialog_handlers(eventFuncs,dlg,context)
{
	if (eventFuncs)
		for(var i=0;i<eventFuncs.length;i++)
			eventFuncs[i](dlg,context);
}



function aa_enable_move_by_dragging(draggable_frame,draggable_area,onstartdrag)
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
			  
		  }
		  if (window.captureEvents){ window.onmousemove = mouse_move;window.onmouseup = mouse_up; }
		  else { document.onmouseup=mouse_up;	document.onmousemove=mouse_move;  }
	  });
}



function aa_runMethodAsync(object,methodFunc,data,context,callBack)
{
	if (object == null || methodFunc == null) { callBack(data,context); return; }
	
	var callBackObj = { callBack: callBack, marked: false };
	var newContext = aa_ctx(context,{ _AsyncCallback : callBackObj });
    try {
	  methodFunc.call(object,data,newContext); 
    } catch(e) { ajaxart.logException(e); }
	if (! callBackObj.marked && callBack)	// method did not mark. running callback now
	  callBack(data,context);
}



function aa_closePopup(popup)
{
	if (window.aa_dont_close_popups) return;
	var popups = ajaxart.dialog.openPopups;
	if (popups.length == 0) return;
	if (!popup) popup = popups[popups.length-1];
		
	if (!aa_intest && !popup.initialized) return;

	// console.log("close " + popup.onElem.parentNode.Field.Id);
	var top_popup = popups[popups.length-1];
	var maxCount = 20;
	while(top_popup && top_popup != popup) // close cascading popups
	{
		if (!top_popup.initialized)
		{
			// console.log(top_popup.onElem.parentNode.Field.Id + " not initalized");
			if (popups.length <= 1) return;
			// can not delete un-initialized, so replace it with next top (if it is the one we would like to close)
			var new_top = popups[popups.length-2];
			if (new_top == popup)
			{
				// console.log("replaced with " + new_top.onElem.parentNode.Field.Id);
				var un_initialize = popups.pop();
				new_top = popups.pop();
				popups.push(un_initialize);
				popups.push(new_top);
				top_popup = new_top;
			}
			else
				return;
		}
		aa_closePopup(top_popup);
		popups = ajaxart.dialog.openPopups;
		top_popup = ajaxart.dialog.openPopups[ajaxart.dialog.openPopups.length-1];
		
		if (--maxCount < 0) break;
	}
	if (top_popup != popup) debugger;
	// console.log("closing " + top_popup.onElem.parentNode.Field.Id);
	ajaxart.dialog.openPopups.pop();
	aa_uncapture_for_popup(popup);
	if (!popup.Dlg) {	
		aa_remove(popup.contents.parentNode,true);
	}
	if (popup.returnFocusTo != null) popup.returnFocusTo.focus();
	if (ajaxart.suggestbox && ajaxart.ui.suggestBoxPopup)
		ajaxart.suggestbox.closePopup();
	
	if (popup.Dlg) popup.Dlg.Close([],ajaxart.newContext(),true);
	return [];
}



function aa_uncapture_for_popup(popup)
{
	// console.log("aa_uncapture_for_popup " + popup.onElem.parentNode.Field.Id);
	var orig_mousedown = popup ? popup.Orig_mousedown : null;
	if (window.captureEvents) // FF
		window.onmousedown = orig_mousedown;
	else  // IE
		document.onmouseclick = orig_mousedown;
}



function aa_capture_for_popup(popup)
{
	// console.log("capture_for_popup " + popup.onElem.parentNode.Field.Id);
	if (window.captureEvents)
	{ // FF
		popup.Orig_mousedown = window.onmousedown;  
		window.onmousedown = ajaxart_popup_capture_click;//for compression - ajaxart_popup_capture_click()
	}
	else  // IE
	{
		//alert('capture_for_popup');
		popup.Orig_mousedown = document.onmousedown;  
		document.onmousedown=ajaxart_popup_capture_click;
	}
}



function aa_is_rtl(elem,ctx)
{
	if ( jQuery(elem).parents('.right2left').length > 0 ) return true;
	if (!elem && jQuery("body").find('.right2left').length > 0) return true;
	if (ctx && aa_totext(ctx.vars.Language) == 'hebrew') return true;
	return false;
}



function aa_close_dialog_old(closeType,ignoreAAEditor)
{
  if (openDialogs.length == 0) return ;
  jQuery('body').removeClass('body_with_open_dialog');
  var dlg = openDialogs[openDialogs.length-1];
  if (closeType == 'OK' && jQuery(dlg.dialogContent).find('.aa_noclose_message').length > 0 ) return;
  
  if (ignoreAAEditor && jQuery(dlg.dialogContent).hasClass('aaeditor')) return ["true"];
  ajaxart_dialog_close_all_popups();                         
  var div = ajaxart.dialog.closeDialog(dlg);
  if (closeType == 'OK') 
	  ajaxart_runevent(dlg.dialogContent,'DialogContext','OnOK');
  else if (closeType == 'Cancel')
	  ajaxart_runevent(dlg.dialogContent,'DialogContext','OnCancel');
  else if (closeType == 'Delete')
	  ajaxart_runevent(dlg.dialogContent,'DialogContext','OnDelete');
  
  aa_remove(div,true); // clean memory leaks
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
	if (jQuery(dlgContent).width() + ajaxart.ui.absoluteLeft(dlgContent) > screenWidth ||
		jQuery(dlgContent).height() + ajaxart.ui.absoluteTop(dlgContent) > screenHeight )
	{
		dlgContent.style.left = (screenWidth - jQuery(dlgContent).width())/2 + scrollOffsetX + "px";
		dlgContent.style.top = (screenHeight - jQuery(dlgContent).height())/2 + scrollOffsetY + "px";
	}
	return [];
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



function aa_ifThenElse(profile,data,context)
{
	if (aa_bool(data,profile,'If',context))
		return ajaxart.run(data,profile,'Then',context);
	else
		return ajaxart.run(data,profile,'Else',context);
}



function aa_switch(profile,data,context)
{
	var value = aa_text(data,profile,"Value",context);
	var cases = ajaxart.subprofiles(profile,'Case');
	for (var i=0; i<cases.length; i++) {
		var pass = (value != "") && (value == aa_text(data,cases[i],'If',context));
		if (!pass)
			pass = aa_bool(data,cases[i],'IfCondition',context);
		if (pass)
			return ajaxart.run(data,cases[i],'Then',context);
	}
	return ajaxart.run(data,profile,'Default',context);
}



function aa_show_jbart_widget(settings)
{
	var widgetXml = settings.WidgetXml;
	var context = settings.Context;
	var uiprefObj = uipref_in_cookies();
	
	var widgetId = widgetXml.getAttribute('id');
	var appXtml = aa_xpath(widgetXml,"bart_dev/db/bart_unit/bart_unit/Component[@id='App']/xtml")[0];
	var language = settings.Language || aa_totext( aa_xpath(appXtml,"Language/@Language") ); 
	var pageID = settings.Page || appXtml.getAttribute('MainPage') || 'main';
	var globalVars = {};
	
	var resources = widgetDataResources();
	
	var bctx = {
	  AppXtml: appXtml,
	  Resources: resources,
	  StyleGuide: aa_first([],appXtml,'StyleGuide',context),
	  Url: ajaxart.runComponent('bart_url.BrowserUrl',[],context)[0],
	  ValidationStyle: ajaxart.runComponent('validation.Default',[],context)[0]
	};
	var ctx = aa_ctx(context, { 
		_GlobalVars: [globalVars], _UIPref: [uiprefObj], Language: [language] , 
		_BartContext: [bctx], _WidgetXml: [widgetXml]
	});
			
	runAppFeatures();
	resourcesToGlobalVars();
	setOldPages();
	AppFeatures_Load();
	overrideUIPrefs();

	var out = document.createElement('div');
	jQuery(out).addClass('aa_widget');
	addWidgetCss();
	var widgetPage = showWidgetPage();
	out.appendChild(widgetPage);

	if (settings.RunAfterControlWithTimer) 
		setTimeout(runAfter,1); 
	else runAfter();
	
    return out;

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
			} catch(e) {}
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
	
	function addWidgetCss()
	{
		var css = aa_totext(bctx.Css || []);
		if (css) 
			jQuery(out).addClass(aa_attach_global_css(css));
	}
	function runAfter() {
		try {
			if (settings.RunAfter) settings.RunAfter([],ctx);
		} catch(e) {}
	}
	
	function widgetDataResources() {
		var resources = [];
		var resourcesXtml = aa_xpath(appXtml,'Resources/Resource');
		for(var i=0;i<resourcesXtml.length;i++) {
			var resourceXtml = resourcesXtml[i];
		    var resourceID = resourceXtml.getAttribute('ResourceID');
			var t = resourceXtml.getAttribute('t');
		    
			var varName = 'jBartWidget_' + widgetId + '_' + resourceID;
			if (window[varName]) {
				resources.push({ Id: resourceID, ID: [resourceID], Items: window[varName] });
			} else {
				if (t == 'bart_resource.Query' || t == 'bart_resource.Node' ) 
					resources.push(emulateBartResource(resourceXtml));
				else {
					var resource = aa_first([],resourceXtml,'',aa_ctx(context,{WidgetId: [widgetId]}));
					if (resource) resources.push( resource );
					else ajaxart.log('could not create resource ' + resourceID,"error");
				}
			}
		}
		return resources;
	}
	function emulateBartResource(resourceXtml) {
	    var contentType = resourceXtml.getAttribute('ContentType') || '';
	    
	    var dbparent = aa_xpath(widgetXml,'bart_dev/db/'+contentType)[0];
	    var id = resourceXtml.getAttribute('ID') || '';
		var t = resourceXtml.getAttribute('t');
	    
	    var resource = {
			ID: [resourceXtml.getAttribute('ResourceID')],
			ContentType: [contentType]
	    }
		if (t == 'bart_resource.Query') 
			resource.Items = aa_xpath(dbparent,'*');
		else if (t == 'bart_resource.Node') 
			resource.Items = aa_xpath(dbparent,"*[@id='"+id+"']");
	    return resource;
	}
	
	function uipref_in_cookies() {
		return {
		  GetProperty: function(data1,ctx) {
			var out = ajaxart.cookies.valueFromCookie(aa_totext(ctx.vars.Prefix)+aa_totext(ctx.vars.Property));
			return out ? [out] : [];
		  },
		  SetProperty: function(data1,ctx) {
			ajaxart.cookies.writeCookie(aa_totext(ctx.vars.Prefix)+aa_totext(ctx.vars.Property),aa_totext(ctx.vars.Value));
		  }
		}
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
	    	return pageout;
	    } else { // a page (e.g bart.SinglePage)
	    	var page = pageAsField;
	    	return page.Control([],aa_ctx(ctx,{_PageParams: [] }))[0];
	    }
	}
    function newPageByID(pageID) {
    	return aa_xpath(appXtml, "../../Component[@id='"+pageID+"']/xtml")[0];
    }
    function oldPageByID(pageID) {
    	return aa_xpath(appXtml,"Pages/Page[@ID='"+pageID+"']")[0];		
    }
}



function ajaxart_multilang_text(text,context)
{
	if (context.vars.Language && context.vars.Language.length > 0 && text != "")
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



function ajaxart_field_getFields(cntr,mode,item_data)
{
	if (typeof(item_data) == "undefined") item_data = [];
	
	var fields = cntr.Fields;
	var out = [];
	var isNew = cntr.IsNewItem;
	var isReadOnly = ( cntr.Items[0].ReadOnly != null && ajaxart.tobool_array(cntr.Items[0].ReadOnly) );
	var isEdit = ! (isNew || isReadOnly); 
	for(var i=0;i<fields.length;i++) {
		var field = fields[i];
		
		if (isNew && field.HiddenForNew) continue;
	    if (isReadOnly && field.HiddenForReadOnly) continue;
	    if (isEdit && field.HiddenForEdit) continue;
	    if (mode == "table" && field.HiddenForTable) continue;
	    if (mode == "property sheet" && field.HiddenForProperties) continue;
	    if (mode != "property sheet" && field.Hidden && aa_tobool(field.Hidden(item_data,cntr.Context)) ) continue;	    
		out.push(fields[i]);
	}
	
	return out;
}



function ajaxart_run_commas(data,script,field,context)
{
  var text = aa_text(data,script,field,context);
  if (text == "") return [];
  return text.split(',');
}



function ajaxart_properties_and_sections(cntr,item_aggregator,item_data,profile,ctx,fields,space,full_width,properties_width,header,footer)
{
  if (typeof(properties_width) == "undefined") properties_width = "80";
  properties_width = parseInt(properties_width.split('px')[0]);
  var table = jQuery('<table class="propertysheet" cellpadding="0" cellspacing="0"><tbody class="propertysheet_tbody"></tbody></table>')[0];
  if (full_width) jQuery(table).width("100%");
  var tbody = table.firstChild;

  for (var j=0;j<fields.length;j++) 
	  if (fields[j].PropertiesWidth) properties_width = Math.max(properties_width,parseInt(fields[j].PropertiesWidth));

  if (header && header != "") { tbody.appendChild(jQuery('<tr class="aa_propertysheet_tr_space" style="height:'+header+'"/>')[0]); }
  for (var j=0;j<fields.length;j++) {
	  var field = fields[j];
	  if ( ajaxart_object_boolean_value(field,'IsOperation') ) continue;
	  var tr = document.createElement("TR");
	  tbody.appendChild(tr);
	  tr.className = "field_row value field_" +field.Id + "_row";
	  tr.Field = field;
	  
	  var hideTitle = field.HideTitle;
	  if (!hideTitle && field.RecalcTitle) field.RecalcTitle(item_data,ctx);
	  
	  if (field.AsSection && !field.HideTitle)
		  aa_buildSection(cntr,tr,field,item_data,properties_width,ctx);
	  else 
		  aa_buildProperty(cntr,tr,field,item_data,properties_width,ctx);
	  
	  if (space == true || space == "true") space = "5px";
	  if (space == false|| space == "false") space = "";
	  if (j != fields.length-1 && space != "")
	  {
		  var trSpace = document.createElement('tr');
		  trSpace.className="aa_propertysheet_tr_space";
		  trSpace.style.height = space;
		  tbody.appendChild(trSpace);
	  }
  }
  if (footer && footer != "") { tbody.appendChild(jQuery('<tr class="aa_propertysheet_tr_space" style="height:'+footer+'"/>')[0]); }
  table.ItemData = item_data;
  // on load validations
  if (!cntr.ReadOnly) aa_handle_onload_validations(table);

  return table;
}



function ajaxart_field_calc_field_data(field,item_data,context)
{
	if (field.Multiple && field.MultipleItems) // multiple with items - field data is not relevant
		return item_data;
	if (field.FieldData)
	{
		var results = ajaxart_runMethod(item_data,field,'FieldData',context);
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
	jQuery(td).addClass('aa_cell_element');
	if (cell_presentation == null) cell_presentation = "control";
	if (field.CellPresentation != null)
		cell_presentation = field.CellPresentation;
	if (field.Width != null)
		jQuery(td).css("width",field.Width);
	td.CellPresentation = cell_presentation;
	td.Field = field;
	td.FieldData = field_data;
	td.ItemData = item;
	td.jbContext = context;
	if (field.IsCellHidden && field.IsCellHidden(item,context)) {
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
		jQuery(td).addClass("aa_text fld_" + field.Id);
		field.CalculatedControl(td,field,field_data,newContext);
		return;
	}
	if (field.IsCalculated)
	{
		var calculated_val = field.CalcFormula(item,newContext);
		var assigned = ajaxart.writevalue(field_data,calculated_val);
		if (!assigned)
			field_data = calculated_val;
	}
	if (cell_presentation == "text")
	{
		jQuery(td).addClass("aa_text fld_" + field.Id);
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
				jQuery(new_control).addClass('aa_hasvalidations'); 
				new_control.jbCell = td;
			}
	    }
	    else
		{
			jQuery(td).addClass("aa_text fld_" + field.Id);
			td.innerHTML = ajaxart_field_text(field,field_data,item,newContext);
		}
	}
	jBart.trigger(field,'ModifyControl',{ Wrapper: td, FieldData: field_data, Context: newContext, Item: item });
	if (field.ModifyControl)
		for(var i=0;i<field.ModifyControl.length;i++)
			field.ModifyControl[i](td,field_data,cell_presentation,newContext,item);

	jBart.trigger(field,'ModifyCell',{ Wrapper: td, FieldData: field_data, Context: newContext, Item: item });
	if (field.ModifyCell)
		for(var i=0;i<field.ModifyCell.length;i++)
			field.ModifyCell[i](td,field_data,cell_presentation,newContext,item);

	return ["true"];
}



function ajaxart_find_aa_list(cntr) { 
	return ajaxart_find_list_under_element(cntr.Ctrl); 
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



function ajaxart_topCntr(item) {
	  var parents = [];
	  if (item.hasClass('aa_container')) 
		  parents = item.get();
	  var parents = parents.concat(item.parents().filter(function() 
			  { return jQuery(this).hasClass('aa_container') || jQuery(this).hasClass('DetailsControl'); }
			  ).get());
	  if (parents.length == 0) return null;
	  if (jQuery(parents[0]).hasClass('DetailsControl')) return parents[0].Cntr;
	  
	  var top_cntr = null;
	  for(var i=0;i<parents.length;i++) // while hasClass aa_inherit_selection
	  {
		  var parent = parents[i];
		  if (jQuery(parent).hasClass('DetailsControl')) break;
		  if (parent.Cntr.Select)
			  top_cntr = parent;
		  if ( ! jQuery(parent).hasClass('aa_inherit_selection'))
			  break;
	  }
	  if (top_cntr)
		  return top_cntr.Cntr;
	  return null;
}



function ajaxart_container_elems(cntr)
{
	var elems = [];
	
	var add_elems_in_cntr = function(node)
	{
		var jnode = jQuery(node);
		if (node.hidden == true) return;
		if (jnode.hasClass('aa_item'))
			elems.push(node);
		if (jnode.hasClass('aa_container')) return;
		jQuery(node).children().each(function() { add_elems_in_cntr(this) } );
	}
	
	var list = ajaxart_find_aa_list(cntr); 
	if (list != null)
		add_elems_in_cntr(list);
	
	return elems;	
}



function ajaxart_itemlist_getSelectedItems(cntr)
{
	var selected = jQuery(cntr.Ctrl).find(".aa_selected_item").filter(aa_visible);
	var out = [];
	for(var i=0;i<selected.length;i++)
		ajaxart.concat(out,selected[i].ItemData);
	
	return out;
}



function ajaxart_uiaspects_select(new_selected,selected,method,ctx,focus) 
{
	  var top_cntr = ajaxart_topCntr(new_selected);
	  if (top_cntr != null)
		  top_cntr.Select(new_selected,selected,method,ctx,focus);
}



function ajaxart_addScriptParam_js(structItem,structField,jsFunc,context)
{
	structItem[structField] = {	context: context , compiled: jsFunc };
}



function ajaxart_capture_onclick  (f)
{
    if (window.captureEvents)
    	window.onclick = f;
	else  // IE
		document.onclick = f;
}



function ajaxart_add_foucs_place(li)
{
	jQuery(li).addClass('aa_focus_place');
	li.setAttribute("tabindex","1");
}



function ajaxart_find_list_under_element(elem)
{
	if (jQuery(elem).hasClass('aa_list')) return elem;
	
	var lists = jQuery(elem).find('.aa_list');
	if (lists.length == 1) return lists[0];
	
	// in case of container in container, do not return aa_list of inner container (e.g. fast add header footer )
	var top_ctrl = jQuery(elem).hasClass('aa_container') ? elem : jQuery(elem).parents('.aa_container')[0];
	for (var i=0;i<lists.length;i++)
		if ( jQuery(lists[i]).parents('.aa_container')[0] == top_ctrl )
			return lists[i];
	
    return null;
}



function ajaxart_tree_next(elem,cntr)
{
	if (!cntr.Tree) return elem.next();
	
	if (!elem[0].collapsed)
	{
		var next = elem.find('.aa_item').filter(aa_visible_selectable).slice(0,1);
		if (next.length > 0) return next;
	}
	
	next = elem.next();
	if (next.length > 0) return next;

	var parent = elem.parent();
	while (parent.length > 0)
	{
		if (parent.next().hasClass("aa_item"))
			return parent.next();
		if (parent.next().hasClass("aa_list"))
		{
			var next = ajaxart_tree_next(parent.next());
			if (next.length > 0) return next;
		}
		parent = parent.parent();
	}
	return [];
}



function ajaxart_tree_prev(elem,cntr)
{
	var prev = elem.prev();
	if (!cntr.Tree) return prev;
	
	if (prev.length > 0)
	{
		if (! prev[0].collapsed)
		{
			var last_child = prev.find('.aa_item').filter(aa_visible_selectable).slice(-1);
			if (last_child.length > 0) return last_child;
		}
		return prev;
	}
	
	var parent = elem.parent();
	while (parent.length > 0)
	{
		if (parent.hasClass("aa_item"))
			return parent;
		if (parent.hasClass("aa_list"))
		{
			var last_child = parent.prev().find('.aa_item').filter(aa_visible_selectable).slice(-1);
			if (last_child.length > 0) 
				return last_child;
		}
		parent = parent.parent();
	}
	return parent;
}



function ajaxart_runMethod(data,object,method,context)
{
	if (object == null || method == "") return [];
	var scriptParam = object[method];
	if (scriptParam == null) return [];
	if (typeof(scriptParam) == "function") return scriptParam.call(object,data,context);
	if (scriptParam.compiled == "same") return data;

	var newContext = { params: scriptParam.context.params 
			, vars: context.vars
			, componentContext: scriptParam.context.componentContext} // TODO: avoid this if paramVars == ""
	
	newContext._This = object;
	
	if (scriptParam.compiled != null) 
	  return scriptParam.compiled(data,newContext);
    else
      return ajaxart.run(data,scriptParam.script,"",newContext);
	
	return [];
}



function ajaxart_stop_event_propogation(e)
{
	if (!e) return;
	if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
	e.cancelBubble = true;
	return false;
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



function ajaxart_screen_size(consider_design_time_simulator_view)
{
//	if (typeof(consider_design_time_simulator_view) == 'undefined') consider_design_time_simulator_view = true;
	var screenWidth = window.innerWidth || (document.documentElement.clientWidth || document.body.clientWidth);
	var screenHeight = window.innerHeight || (document.documentElement.clientHeight || document.body.clientHeight);
	if (consider_design_time_simulator_view && jQuery('.studio_simulator').length > 0) {
		  var simulator = jQuery('.studio_simulator')[0];
		  screenHeight = simulator.clientHeight;
		  screenWidth = simulator.clientWidth;
	}
	//
	return { width:screenWidth, height:screenHeight };
}



function ajaxart_addMethod(object,method,profile,field,context)
{
	var compiled = ajaxart.compile(profile,field,context);
	if (compiled == "same") { object[method] = function(data1) { return data1; }; return;}
	var init = function(compiled) {
		object[method] = function(data1,ctx) {
			var newContext = aa_merge_ctx(context,ctx);
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



function ajaxart_xml_onchange(xml,func,context) 
{
	var attachment = { disable: false, modified: false, compiled: func
			, context: context, autosavedelay: 0,  mode: 'manual save'};

	for(var i=0;i<ajaxart.xmlsToMonitor.length;i++)
	{
		if ( ajaxart.xmlsToMonitor[i].xml == xml )
		{
			ajaxart.xmlsToMonitor[i].ajaxartOnChange = attachment;
			ajaxart.xmlsToMonitor[i].modifyInfo = attachment;
			return ["true"];
		}
	}
	ajaxart.xmlsToMonitor.push( { xml: xml, modifyInfo: attachment} );
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



function ajaxart_runcompiled_text(compiledFunc, data, profile, field ,context)
{
	if (compiledFunc == 'same') return ajaxart.totext_array(data);
	if (compiledFunc == null)
		return aa_text(data,profile,field,context);
	else
		return ajaxart.totext_array(compiledFunc(data,context));
}



function ajaxart_setUiPref(prefix,property,value,context) { 
	if (context.vars._UIPref == null) return;
	var newContext = aa_ctx(context,{ Prefix: [prefix] , Property: [property], Value: [value] } );
	ajaxart_runMethod([],context.vars._UIPref[0],'SetProperty',newContext);
}



function ajaxart_getUiPref(prefix,property,context) { 
	if (context.vars._UIPref == null) return null;
	var newContext = aa_ctx(context,{ Prefix: [prefix] , Property: [property]} );
	var result = ajaxart.totext_array( ajaxart_runMethod([],context.vars._UIPref[0],'GetProperty',newContext) );
	if (result == "") return null;
	return result;
}



function ajaxart_field_is_readOnly(cntr,field,context)
{
	if (field.Writable) return false;
	if (field.ReadOnly == true) return true;
	if (ajaxart_object_run_boolean_method(field,'ReadOnly',[],context)) return true;
	if (!cntr) return false;
	if (cntr.Items == null) return true;
	if (cntr.Items.length == 0) debugger;
	if (cntr.Items[0].ReadOnly == true) return true;
	if (cntr.ReadOnly) return true;
	return ( cntr.Items[0].ReadOnly != null && ajaxart.tobool_array(cntr.Items[0].ReadOnly) );
}



function ajaxart_field_createSimpleInput(data,context,readonly,input_type)
{
	var field = context.vars._Field[0];
	var text = ajaxart_field_option_text(field,data,context);
	if (readonly) {
		if (field.Text) text = aa_totext(field.Text(data,context));
		var out = jQuery("<div/>").text(text).addClass('readonly')[0];
		return out;
	}
	if (field.MultiLineTextStyle && field.MultiLineText ) {
		var input = null;
		var style = field.MultiLineTextStyle;
		var textAreaElem = jQuery(style.Html)[0];
		var textAreaObj = aa_api_object(textAreaElem,{Field: field,
			initTextArea: function(classOrElement) {
				var inner = this.getInnerElement(classOrElement);
				if (!inner) return;
				input = inner;
				input.jbApiObject = textAreaObj;
			}
		});
		aa_apply_style_js(textAreaObj,style);
		jQuery(textAreaObj).addClass(aa_attach_global_css(style.Css));
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
		jQuery(input).bind('cut paste',null,function(e) {
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
		jQuery(this).blur();
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
	var textboxCssClass = aa_attach_global_css( aa_totext(ajaxart.run([],ajaxart.parsexml('<xtml t="jbart.TextboxCss" />'),'',context)) , null, 'textbox' );
	jQuery(input).addClass('aa_simple_cell aatextbox').addClass(textboxCssClass);
	input.jbRemoveTextboxClass = function() {
		jQuery(input).removeClass('aatextbox').removeClass(textboxCssClass);
	}

	if (!readonly && (field.Validations || field.Validation)) 
	  jQuery(input).addClass('aa_hasvalidations');

	return input;
}



function ajaxart_addControlMethod_js(object,method,jsFunc,context)
{
	var getControl = function(data1,context1) {
		var out = jsFunc(data1,context1);
		if (out.length > 0)
			out[0].XtmlSource = object.XtmlSource;
		
		return out;
	};
	ajaxart_addMethod_js(object,method,getControl,context);	  
}



function ajaxart_addControlMethod(object,method,data,profile,field,context)
{
  var getControl = function(data1,context1) {
	  var out = ajaxart.run(data1,profile,field,context1);
	  if (out.length > 0)
	    out[0].XtmlSource = object.XtmlSource;
	  
	  return out;
  };
  ajaxart_addMethod_js(object,method,getControl,context);	  
}



function ajaxart_runcompiled_bool(compiledFunc, data, profile, field ,context, empty_value_is_true)
{
	var text_val;
	if (compiledFunc == 'same') text_val = ajaxart.totext_array(data);
	if (compiledFunc == null)
		return aa_bool(data,profile,field,context,empty_value_is_true);
	else
		text_val = ajaxart.totext_array(compiledFunc(data,context));
    if (text_val == "") return (empty_value_is_true) ? true : false;
    if (text_val == "false") return false;
    if (text_val == "true") return true;

    if (! isNaN(text_val)) return false;// in js : if(2) == true
	var boolean_result = false;
	text_to_eval = "if (" + text_val + ") boolean_result=true;";
	try { eval(text_to_eval); }
	catch(e) { ajaxart.log("Failed to evaluate boolean expression: " + text_val + "," +  e.message
			+ "\n script :" + aa_xtml_path(profile,"id",true),"warning"); }
    return boolean_result;
}



function ajaxart_RunAsync(data,fieldscript,context,callBack,object_for_method)
{
	if (fieldscript == null) { callBack(data,context,false); return; }
	
	var callBackObj = { callBack: callBack, marked: false , success: true };
	var newContext = aa_ctx(context,{ _AsyncCallback : callBackObj });
	if (ajaxart.debugmode) {
	  if (typeof(fieldscript) == "function") {
		  if (object_for_method) fieldscript.call(object_for_method,data,newContext);
		  else fieldscript(data,newContext);
	  }
	  else if (fieldscript.compiled != null)
			fieldscript.compiled(data,newContext);
		  else
		    ajaxart.run(data,fieldscript,'',newContext);
	} else {
	  try {
		  if (typeof(fieldscript) == "function") {
			  if (object_for_method) fieldscript.call(object_for_method,data,newContext);
			  else fieldscript(data,newContext);
		  }
		  else if (fieldscript.compiled != null)
			fieldscript.compiled(data,newContext);
		  else
		    ajaxart.run(data,fieldscript,'',newContext);		// TODO: clean
	  } catch(e) { ajaxart.logException(e); }
	}
	if (! callBackObj.marked && callBack)	// sync action
  	  callBack(data,context,true);
}



function ajaxart_field_fix_title(field,path,context)
{
	if (field.Title == null || field.Title.length == 0)
	{
		var title = path.split('/').pop().split('@').pop();
		title = title.substr(0,1).toUpperCase() + title.substr(1,title.length);
		title = aa_text_capitalizeToSeperateWords(title);
		
		field.Title = ajaxart_multilang_text(title,context);
	} 
}



function ajaxart_dialog_close_all_popups()
{
   	aa_closePopup(ajaxart.dialog.openPopups[0]);
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
            ajaxart.setVariable(context,varname,var_value);
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
         for (i in ajaxart.xtmls_to_trace)
        	 if (field_script == ajaxart.xtmls_to_trace[i].xtml)
        		 ajaxart.fill_trace_result(ajaxart.xtmls_to_trace[i].results,data,out,context,origData);
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
			 jQuery(out[item]).addClass(classDecorator);
       }
	   if (cssStyleDecorator != "") {
		   for(var item in out)
			 if (ajaxart.ishtml(out[item]))
				 aa_setCssText(out[item],cssStyleDecorator);
	   }
	   if (global.getAttribute('databind') == "true") {
		   ajaxart.databind(out,data,context,field_script,origData);
	   }
	   try {
	     if (field_script.nodeType == 1 && out.length > 0 && ajaxart.isObject(out[0]))
		   if (global.getAttribute('dtsupport') != "false" && field_script.nodeType == 1 && field_script.getAttribute('dtsupport') != "false")
		     out[0].XtmlSource = [{ isObject: true, script: field_script , input: data, context: context }];
	   } catch(e) {  }
	   
	   // trace
	   if (aa_hasAttribute(field_script,"Trace"))
		   ajaxart.trace(field_script,data,out,context,null,field_script.getAttribute("Trace"));
	   
	  	if (aa_hasAttribute(field_script,"Name"))
	  	{
	  		var id = ('' + field_script.getAttribute("Name")).replace(/ /g, "_");
			 for(var item in out)
				 if (ajaxart.ishtml(out[item]))
					 out[item].setAttribute("id", id);
	  	}
	  	
       for (i in ajaxart.xtmls_to_trace)
    	   if (field_script == ajaxart.xtmls_to_trace[i].xtml)
    		   ajaxart.fill_trace_result(ajaxart.xtmls_to_trace[i].results,data,out,context,origData);
	   
	   ajaxart.stack_trace.pop();
       return out;
	   } catch (e) {
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
	if (!item) return '';
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
		jQuery("#ajaxart_log").append(jQuery("<div class='aa_log " + type + "'>"+ajaxart.xmlescape(log_message)+"</div>"));
		
		try {
		  jBart.trigger(jBart,'log',{ message: message, type: type});
		} catch(e) {}
	}



ajaxart.isArray = function (obj) 
{
	return Object.prototype.toString.call( obj ) === '[object Array]';
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
    function expand(data,func) {
    	var result = [];
    	for(var i=0;i<data.length;i++)
    		result = result.concat(func(data[i]))
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
			});
		if (exp.indexOf('{') != -1 && exp.match(/{[^}]*}/)) // inner vars
			exp = ajaxart.totext(ajaxart.dynamicText(data,exp.replace(/(^|[^\\]){/g,'$1%')
					.replace(/(^|[^\\])}/g,'$1%')
					.replace(/\\({|})/g,'$1'),context));
    	var items = exp.split('/'); // xpath pipline
    	var result = data;
    	for(var i=0;i<items.length;i++) {
    		var item = items[i];
    		var filter_match = null;
    		if (item.indexOf('[') != -1) {
    			filter_match = item.match(/([^\[]*)(\[[^\]]*\])/); // elem[@id=15]
    			if (filter_match) item = filter_match[1];
    		}
    		if (item[0] == '!') { 
    			createIfNotExist = true; item = item.substr(1);
    		}
    		if (item[0] == '>') { 
    			byRef = true; item = item.substr(1);
    		}
    		if (item[0] == '$') {
    			result = ajaxart.getVariable(context,item.substr(1));
    		} else if (result[0] && result[0].nodeType && result[0].nodeType == 1 && !createIfNotExist && exp.indexOf('/!') == -1) { // xml xpath
    			var remaining_xpath = items.slice(i).join('/');
    			return expand(result,function(elem) { 
    				return ajaxart.xml.xpath(elem,remaining_xpath);
    			});
    		} else if (item == '') { 
    			result = result;
    		} else { // 'path1/path2'
    			result = expand(result,function(elem) { 
    				if (elem.nodeType) return ajaxart.xml.xpath(elem,item,createIfNotExist);
   					var res = elem[item];
    				if (ajaxart.isObject(elem)) { // JSON support
    					if (item == '..' && elem.ParentNode) return [elem.ParentNode()];
						var last = i == items.length -1;
						if (last && byRef && aa_JsonByRef) return [ new aa_JsonByRef(elem,item) ];
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
	if (oneVar) return ajaxart.getVariable(context,oneVar[1]);
		
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
		new_context.vars[i] = context.vars[i];
	}
	new_context.params = context.params;
	new_context.componentContext = context.componentContext;
	new_context._This = context._This;
	
	return new_context;
}



ajaxart.concat = function (source,toadd) {
	if (toadd == null) return;
	for(var i=0;i<toadd.length;i++)
		source.push(toadd[i]);
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



ajaxart.setVariable = function (context,varName,varValue)
{
	if (varName == null) return;
	try {
		context.vars[""+varName] = varValue;
	} catch(e) { ajaxart.log("cannot set variable" + varName,"error"); }
}



ajaxart.each = function (arr,func)
{
	for(var i=0;i<arr.length;i++)
		func(arr[i],i);
}



ajaxart.ishtml = function (item)
{
	if (!item) return false;
	if (ajaxart.isArray(item) && item.length > 0) 
		return ajaxart.ishtml_item(item[0]);
	else
		return ajaxart.ishtml_item(item);
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
	val = ajaxart.serverData && ajaxart.serverData[varName];
	if (val) return val;

	var func = context.vars._GlobalVars && context.vars._GlobalVars[0][varName];
	if ('function' == typeof func) 
		val = func(varName,context);
	if (val) return val;
	
	return [];
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



ajaxart.writevalue = function (data, newValueObj,disableXmlChangeEvent) {
	var assigned = false;
	if (data == null || data.length == 0 || data[0] == null) return assigned;
	var xml = data[0];
	if (xml.WriteValue) return xml.WriteValue(newValueObj); 
	
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
			if (xml.nodeType == 2 || xml.nodeType == 3 || xml.nodeType == 4)  {// attribute or inner text
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
		ajaxart.xml.xml_changed(xml);
	return assigned;
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
   	var doc;
 	try {
 	// fix parsing bug that &#xd;-->\r and not \n
 		contents = contents.replace(/&#xa;&#xd;/g, "&#xa;").replace(/&#xd;&#xa;/g, "&#xa;").replace(/&#10;&#13;/g, "&#xa;").replace(/&#13;&#10;/g, "&#xa;");
		if (contents.indexOf('<') > 0)
			contents = contents.substring(contents.indexOf('<'));
		// contents = contents.replace(/&amp;/g, "&#26;");  // fix unescape bug 
		if (document.implementation && document.implementation.createDocument)
		{
			    var domParser = new DOMParser();
			    doc = domParser.parseFromString(contents,"text/xml");
			    var errorMsg = null;
			    
			    var parseerrors = doc.getElementsByTagName("parsererror");//chrome & safari
			    if (parseerrors.length > 0) {
			    	errorMsg = "Error parsing xml";	//for empty error;
                	try {
                		errorMsg = parseerrors[0].childNodes.item(1).innerHTML ;
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
		} else if (window.ActiveXObject) {
			doc = new ActiveXObject("MSXML2.DOMDocument");
			var loaded = doc.loadXML(contents);
			if (!loaded) {
				var message = doc.parseError.reason + doc.parseError.srcText;
				if (errorMsgOut)
					errorMsgOut.push(message);
				ajaxart.log('Error parsing xml file ' + filename + ' : ' + message + ",xml:"+ ajaxart.xmlescape(contents.substring(0)+"..."),parsing_error_level);
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
	
	return [];
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



ajaxart.logException = function (e,prefix)
	{
		var msg = e.message || e;
		if (e.stack) {
			msg += '\n' + e.stack;
		}
		if (prefix) msg = prefix + ' ' + msg;
		ajaxart.log(msg,'error');
	}



ajaxart.totext_array = function (arr)
{
	if (arr == null || arr.length == 0) return '';
	return ajaxart.totext_item(arr[0]);
}



ajaxart.runNativeHelper = function (data,script,helpername,context)
{
	var new_context = ajaxart.clone_context(context);
	new_context.params = [];
	
	for (i in context.params)
		new_context.params[i] = context.params[i];
	
	var field_script = script;
	
	var component = script.getAttribute('t');
	var global = aa_componentById(component);
	if (!global) return [];  // should not happen

    var paramDefinitions = ajaxart.childElems(global,"Param");
    new_context.componentContext = context;
	 
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



ajaxart.runComponent = function (component,data,context) {
	context = context || ajaxart.newContext();
	var profile = ajaxart.parsexml('<xtml t="' + component + '" />');
	return ajaxart.run(data,profile,'',context);
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



ajaxart.isxml_item = function (xml)
{
	if (xml == null) return false;
	return (xml.nodeType != null);
}



ajaxart.isObject_array = function (array) {
	return array.length > 0 && ajaxart.isObject(array[0]); 
}



ajaxart.xml.xpath_of_node = function (xml,id,specific,top)
{
	if ( ! ajaxart.isxml(xml) ) return "";
	
	var result = "";
	var xml_item = xml;
	if (top == xml) return "";
	while (xml_item != null)
	{
		var slash = "/";
		if (result == "") slash = "";
		var xpath_elem = "";
		if (xml_item.nodeType == 9)	{ // document
			xml_item = null;
			continue;
		}
		if (xml_item.nodeType == 1)	// element
		{
			if (xml_item.parentNode == null || xml_item.parentNode.nodeType == 9) // top level
			{
				xml_item = null;
				continue;
			}
			xpath_elem = '' + aa_tag(xml_item);
			if (specific)
			{
				if (id.length > 0 && aa_hasAttribute(xml_item,id))
					xpath_elem += '[@'+id+"='"+ xml_item.getAttribute(id) +"']";
				else {
					if (typeof(xml_item.parentNode) != "undefined")
					{
						var my_count = 0;
						var count = 0;
						var i=0;
	
						for (i=0;i<xml_item.parentNode.childNodes.length;i++)
						{
							var brother = xml_item.parentNode.childNodes.item(i);
							if (brother.nodeType == 1 && aa_tag(brother) == aa_tag(xml_item))
							{
								count++;
								if ( brother == xml_item ) my_count = count;
							}
						}
						if (my_count > 0 && count > 1) {
							var id_empty = !aa_hasAttribute(xml_item,"id") || xml_item.getAttribute("id") == "";
							var name_empty = !aa_hasAttribute(xml_item,"name") || xml_item.getAttribute("name") == "";
							if ( !id_empty || !name_empty ) {
								if (!id_empty)
									xpath_elem += "[@id='" + xml_item.getAttribute("id") + "']";
								else
									xpath_elem += "[@name='" + xml_item.getAttribute("name") + "']";
							}
							else 
								xpath_elem += "[" + my_count + "]";
						}
					}
				}
			}
		}
		if (xml_item.nodeType == 2) // attribute
			xpath_elem = "@" + xml_item.name;
		
		if (xpath_elem != "")
			result = xpath_elem + slash + result;

		if (id.length > 0 && xml_item.nodeType == 1 && aa_hasAttribute(xml_item,id))
			return result;
		
		var orig_item = xml_item;
		xml_item = xml_item.parentNode;
		if (xml_item == null)
			xml_item = ajaxart.xml.parentNode(orig_item);
		if (xml_item == top) xml_item = null;
	}
	return result;
}



ajaxart.xml.clone = function (xml)
{
	if (xml.length == 0) return null;
	return xml[0].cloneNode(true);
}



ajaxart.xml.append = function (parent,child,asFirst)
	{
	  try {
	  if ( !ajaxart.isxml(parent) ) { ajaxart.log("cannot append to non-xml parent","error");return; }
	  if (child != null && child.nodeType == 1 && parent != null)
	  {
		  child = aa_importNode(child, parent);
		  if (asFirst && parent.firstChild)
			  parent.insertBefore(child,parent.firstChild);
		  else
			  parent.appendChild(child);		  
		  return child;
	  }
	  } catch(e) { ajaxart.logException(e);}
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
	 if (ajaxart.isBackEnd) {
		return '' + com.artwaresoft.XmlUtils.XmlToString(xml);
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
    if (childs_length == 1 && (xml.childNodes.item(0).nodeType == 3)) // || xml.childNodes.item(0).nodeType == 4)) // inner text
    	out += ajaxart.xmlescape(xml.childNodes.item(0).nodeValue);
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



ajaxart.xml.xml_changed = function (xml)
{
	if (ajaxart.ishtml(xml)) return;
	var origXml = xml;
	
	while (xml != null && xml.nodeType != 4) {
		var attachment = ajaxart.xml.getModifyInfo(xml);
		
		if (attachment != null) {
			if (attachment.disable) return;
			attachment.modified = true;
			if (attachment.mode == "auto save draft")
				ajaxart.xml.autosave(xml,attachment,'SaveDraftAction');
			else if (attachment.mode == "auto save")
				ajaxart.xml.autosave(xml,attachment,'SaveAction');			
			else if (attachment.mode == "manual save") {
				if (attachment.compiled != null) attachment.compiled([xml],attachment.context,origXml);
			}
		}
		xml = ajaxart.xml.parentNode(xml);
	}
}



ajaxart.xml.copyElementContents = function (target,source)
{
	if (source.nodeType != 1 || target.nodeType != 1) return;
	// remove all children & attributes
	while(target.childNodes.length > 0)
		target.removeChild( target.childNodes.item(0) );
	
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
	var ownerDoc = ajaxart.isBackEnd ? target.getOwnerDocument() : target.ownerDocument;
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



ajaxart.xml.xpath = function (xml,xpath,createIfNotExist,defaultValue) 
{
	if (!xpath) return [xml];
    if (xpath.charAt(0) == "!") 
    	return ajaxart.xml.xpath(xml,xpath.substring(1,xpath.length) ,true);
	if (xml == null || ! ajaxart.isxml(xml) ) return [];
//	var isAttribute= /^@[\w]*$/.test(xpath);
//	if (isAttribute) {
//		var att = xpath.substring(1);
//		var atts = xml.attributes;
//		for(var i=0;i<atts.length;i++)
//			if (atts[i].nodeName == att)
//				return [atts[i]];
//	}
	var result = [];

	try {
		if (jQuery.browser.msie && typeof(xml.selectNodes) != "undefined" ) // IE && xml
		{
			xml.ownerDocument.setProperty("SelectionLanguage", "XPath");
			var nodes = xml.selectNodes(""+xpath);
			for (var i=0;i<nodes.length;i++)
				result.push(nodes[i]);
		}
		else if (ajaxart.isBackEnd)
		{    
			var list = com.artwaresoft.XmlUtils.XPath(xml,xpath);
			for(var i=0;i<list.getLength();i++)
				result.push(list.item(i));
		}
		else
		{    
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
	catch (e) { 
		ajaxart.log( 'error calculating xpath: ' + xpath + ", xml:" + ajaxart.xmlescape(ajaxart.xml2text(xml).substring(0,50)) + '  ' + (e.stack || ''),"warning"); 
//		ajaxart.log( e.message,"error"); 
		}
	if (result.length > 0 && result[0].nodeType == 9) // document
		return [];
	
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
			else { // element
				var newelem = aa_createElement(item,subpath);
				if (typeof(defaultValue) != 'undefined' && defaultValue != "")
					newelem.appendChild(newelem.ownerDocument.createTextNode(defaultValue));
				item.appendChild( newelem );
			}
			result = ajaxart.xml.xpath(xml,xpath,false);
		} catch(e) { ajaxart.log("failed create xpath item :" + xpath + "," + e.message); return []; }
	}
	
	return result;
}



ajaxart.ui.bindEvent = function (elem,event1,func1)
{
	if (!elem) return;
  if (event1 == "mouserightclick") {
  	  // Disable browser context menu (requires both selectors to work in IE/Safari + FF/Chrome)
	  jQuery(elem).bind('contextmenu', function() { return false; });
	  
	  jQuery(elem).mousedown( function(e) {
		var evt = e;
		if( evt.button == 2 ) { 
			xFireEvent(this, 'click', null);		// right-click is also click (for element selection)
			ajaxart.ui.lastEvent = (e) ? e : window.event;
			func1(e);
			ajaxart.ui.lastEvent = null;
			return false;
		}
		  return true;
	  });
	  return;
  }
  if (elem.addEventListener)
  	elem.addEventListener(event1, func1, false);
  else if (elem.attachEvent) {
		elem.attachEvent("on" + event1, func1);
		elem.jbEvents = elem.jbEvents || [];
		elem.jbEvents.push({ event: "on" + event1 , callback: func1 });
  }
}



ajaxart.ui.applyKeyboardEvent = function (_event,context)
{
	if (_event != null && _event.keyCode != null) {
		var codeAsString = "";
		switch (_event.keyCode) {
		case 40: codeAsString = "down arrow"; break;
		case 38: codeAsString = "up arrow"; break;
		case 13: codeAsString = "enter"; break;
		case 32: codeAsString = " "; break;		
		}
		if (_event.keyCode >= 48 && _event.keyCode <= 126)
			codeAsString = String.fromCharCode(_event.keyCode).toUpperCase();
		if (_event.ctrlKey == true && codeAsString != null)
			codeAsString = 'Ctrl+' + codeAsString; 
		if (_event.altKey == true && codeAsString != null)
			codeAsString = 'Alt+' + codeAsString;
		ajaxart.setVariable(context, "KeyPressed",[codeAsString]);
	}
}



ajaxart.ui.HeightToWindowBottom = function (control,delta,applyOn)
{
	if (!ajaxart.isattached(control) ) return;
	if (!applyOn) applyOn="height";
	if (typeof(delta) == "undefined" || isNaN(delta)) delta=0;
	var newHeight = 0;
	
	// see if control is in a dialog
	if (control.jbInDialog == null)
		control.jbInDialog = jQuery(control).parents('.dialog_box').length > 0;
	if (control.jbInDialog)
	{
		var dlg = jQuery(control).parents('.dialog_box');
		if (dlg[0].dialogHeight == null) dlg[0].dialogHeight = dlg.height();
		
		var dlgBottom = dlg[0].dialogHeight + ajaxart.ui.absoluteTop(dlg[0]);
	  	var controlTop = jQuery(control).position().top;
	  	if (dlgBottom - controlTop - delta > 50) {
	  		newHeight = dlgBottom - controlTop - delta;
	  	}
	}
	else if (aa_has_simulator(control)) {	// in studio, use simulator window height
		  var simulator = jQuery(control).parents('.studio_simulator')[0];
	  	  var controlTop = ajaxart.ui.absoluteTop(control,true) - ajaxart.ui.absoluteTop(simulator.firstChild,true);
	  	  newHeight = simulator.clientHeight -controlTop- delta; 
	} else {// normal mode
	  var screenHeight = window.innerHeight || (document.documentElement.clientHeight || document.body.clientHeight);
  	  var controlTop = ajaxart.ui.absoluteTop(control,true);
  	  if (!aa_is_fixed_position(control))
  	  	controlTop -= window.scrollY;
  	  newHeight = screenHeight - controlTop- delta; 
	}
	if (newHeight < 50) newHeight = 0; // ???
	if (newHeight > 0) {
	  if (control.jbPrevHeight != newHeight)
	  	height_changed = true;
	  control.jbPrevHeight = newHeight;
	  jQuery(control).css(applyOn, newHeight+'px');
	  if (height_changed && control.jbSizeChanged)
	  	control.jbSizeChanged();
	}
	return newHeight;
}



ajaxart.ui.mousePos = function (e)
{
	if (typeof(event) != 'undefined')
		var e = window.event;
	if (e.pageX || e.pageY) 
		return { x: e.pageX, y:e.pageY }
	else if (e.clientX || e.clientY) 
	{
		var posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		var posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		return { x: posx, y: posy }
	}
	return {};
}



ajaxart.ui.absoluteLeft = function (elem,ignoreScroll)
{
	if (elem == null) return 0;
	var orig = elem,left = 0,curr = elem;
    // This intentionally excludes body which has a null offsetParent.
    if (!ignoreScroll )
    {
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



ajaxart.ui.absoluteTop = function (elem,ignoreScroll)
{
    var top = 0,orig = elem,curr = elem;
    // This intentionally excludes body which has a null offsetParent.
    if (typeof(ignoreScroll) == "undefined") ignoreScroll = false;
    if (!ignoreScroll)
    {
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



ajaxart.yesno.is_empty = function (data,checkInnerText) {
	  if (data.length == 0) return ["true"];
	  if (typeof(data[0]) == "string" && data[0] == "") return ["true"];
	  if (ajaxart.isxml(data[0])) {
	    if (data[0].nodeType == 3 || data[0].nodeType == 4)// inner text
	  	  return data[0].nodeValue == "";
	    if (data[0].nodeType == 2)// attribute
		  return data[0].nodeValue == "";
	    if (data[0].nodeType == 1 && checkInnerText) // element
	    {
	    	if (data[0].attributes.length > 0) return [];
	    	var children = data[0].childNodes;
	    	if (children.length == 0) return ["true"];
	    	if (children.length == 1 && (children[0].nodeType == 3 || children[0].nodeType == 4) && children[0].nodeValue == "") return ["true"];
	    }
	  }
	  return [];
	}



ajaxart.yesno.itemsEqual = function (item1,item2)
{
   var item1Comp = item1;
   var item2Comp = item2;

   if ( ajaxart.isxml(item1) )
   {
	 if (item1.nodeType==2) // att
		 item1Comp = '' + item1.nodeValue;
	 else
		 item1Comp = ajaxart.xml2text(item1).replace(/\n/g,"").replace(/\r/g,"").replace(/\t/g,"").replace(/>[ ]*</g,"><");
     if (ajaxart.ishtml(item1))
    	 item1Comp = item1Comp.replace(/class=(\w+)/g,'class="$1"');
   }
   if ( ajaxart.isxml(item2) )
   {
	 if (item2.nodeType==2) // att
		 item2Comp = '' + item2.nodeValue;
	 else
		 item2Comp = ajaxart.xml2text(item2).replace(/\n/g,"").replace(/\r/g,"").replace(/\t/g,"").replace(/>[ ]*</g,"><");
     if (ajaxart.ishtml(item2))
    	 item2Comp = item2Comp.replace(/class=(\w+)/g,'class="$1"');
   }
   // Compare text to xml element : compare to inner text
   if ( ajaxart.isxml(item1) && !ajaxart.isxmlelement(item2) && item1.nodeType==1 )
  	 item1Comp = ajaxart.xml.innerTextStr(item1);
   if ( ajaxart.isxml(item2) && !ajaxart.isxmlelement(item1) && item2.nodeType==1 )
  	 item2Comp = ajaxart.xml.innerTextStr(item2);
  	 
   if ( ajaxart.isObject(item1) || ajaxart.isObject(item2))
   {
	   if (ajaxart.isObject(item1) && ajaxart.isObject(item2)) {
		   for(i in item1) {
			   if (i != "isObject")
			   {
				   var item1val = item1[i];
				   var item2val = item2[i];
				   if (typeof(item2val) != typeof(item1val)) return false;
				   if (typeof(item1val) == "undefined" && typeof(item2val) == "undefined") continue;
				   if (ajaxart.isArray(item1val) && item1val.length>0) item1val = item1val[0];
				   if (ajaxart.isArray(item2val) && item2val.length>0) item2val = item2val[0];
				   if (ajaxart.isArray(item1val) && item1val.length==0 && ajaxart.isArray(item2val) && item2val.length==0)
				     continue;
				   if (! ajaxart.yesno.itemsEqual(item1val,item2val))
					   return false;
			   }
		   }
		   return true;
	   }
	   return false;
   }

   if ( item1Comp == item2Comp ) return true;
   
   return false;	 
}



jBart.utils.refresh = function (element)
{
	while (element.ReplacedBy) element = element.ReplacedBy;
	
	var ctx = element.ajaxart;
	if (typeof(ctx) == "undefined" || ctx == null) return;

	var newData = ctx.data;
	if (ctx.origData != null) newData = ctx.origData;
	
	var newControl = aa_first(newData,ctx.script,"",ctx.params);
	if (newControl == "") newControl = document.createElement('div');
	aa_defineElemProperties(element,'ReplacedBy');
	element.ReplacedBy = newControl;
	
	aa_replaceElement(element,newControl,true);
	
	return newControl;
}



jBart.utils.getWidgetIDFromContext = function (context)
{
	if (context.vars.WidgetId) return aa_totext(context.vars.WidgetId);
	
	var elem = context.vars._BartContext[0].AppXtml;
	while (elem && elem.tagName != 'bart_sample' && elem.tagName != 'jbart_project')
		elem = elem.parentNode;
	if (elem) return elem.getAttribute('id') || '';
	return '';
}



jBart.utils.removeFromArray = function (array,object)
{
	for(var i=0;i<array.length;i++)
		if (array[i] == object) {
			array.splice(i,1);
			return;
		}
}



jBart.bind = function (object,eventType,handler,identifier)
{
	if (!object) return;
	object.jbListeners = object.jbListeners || {};
	object.jbListeners[eventType] = object.jbListeners[eventType] || [];
	var listeners = object.jbListeners[eventType];

	for(var i=0;i<listeners.length;i++) {
		if (identifier && listeners[i].eventType == eventType && listeners[i].identifier == identifier) {
			listeners[i].handler = handler;
			return;
		}
    }
	listeners.push({eventType: eventType, handler: handler, identifier: identifier });
}



jBart.trigger = function (object,eventType,eventObject)
{
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



jBart.addDescriptionForEmptyText = function (cell,emptyTextDescription,emptyTextClass)
{
	var field = cell.Field;
	var input = jQuery(cell).find('input')[0];
	if (input)
	{
		if (ajaxart.isChrome || ajaxart.isFireFox || ajaxart.isSafari) {
			input.setAttribute('placeholder',emptyTextDescription);
			return;
		}
		aa_defineElemProperties(input,'getValue','RefreshDescriptionForEmptyText');
		input.getValue = function() {
			var input = this;
			if (jQuery(input).hasClass('empty_text_description') && input.value == emptyTextDescription) return '';
			return input.value;
		}
		input.RefreshDescriptionForEmptyText = function() {
			var input = this;
			if (input.value == '')
			{
				jQuery(input).addClass('empty_text_description').addClass(emptyTextClass);
				input.value = emptyTextDescription;
				input.setAttribute('value',emptyTextDescription); // for tests
			} else {
				jQuery(input).removeClass('empty_text_description').removeClass(emptyTextClass);
			}
		}
		input.RefreshDescriptionForEmptyText();
	}
}



ajaxart.load_plugin = function (plugin_name,xtml_name)
	{
		if (xtml_name == null)
			xtml_name = "plugins/" + plugin_name + "/" + plugin_name + ".xtml";
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



ajaxart.ready = function (func, serverDataArray, scripts)
	{
		  ajaxart.ready_func = func;
		  if ((typeof(serverDataArray) == "undefined" || serverDataArray == null || serverDataArray.length == 0) &&
		  		(scripts == null || scripts.length == 0) &&  ajaxart.loading_objects == 0 ) {
		  			func();
		  			return;
		  		}
		  		
		  if (serverDataArray != null) {
			  for(var i=0;i<serverDataArray.length;i++)
				  ajaxart.load_server_data_inner(serverDataArray[i]);
		  }
		  if (scripts != null) {
		  	for(var i=0; i<scripts.length; i++) // funny package bug
		  		ajaxart. 
		  			load_plugin('',scripts[i]);
		  }
	}



ajaxart.start = function (divId,data,script,serverData, scripts,language)
	{
		jQuery(document).ready(function() {
			ajaxart.ready(function() {
				if (ajaxart.urlparam('debugmode')=="true") ajaxart.debugmode = true;
				if (ajaxart.isChrome) jQuery("body").addClass('chrome');
				
			  	var scriptXml = ajaxart.parsexml(script);
			  	if (data == null) data = [""];

			  	var context = ajaxart.newContext();
			  	if (language != null)
			  		ajaxart.setVariable(context,"Language",language);
			  	var result = ajaxart.run(data,scriptXml,"",context);
			  	var div = jQuery(divId).addClass("ajaxart ajaxart_topmost " + ajaxart.deviceCssClass);
			  	ajaxart.databind([div[0]],data,context,scriptXml,data);
			  	if (div.length > 0 && result.length > 0)
			  		div[0].appendChild(result[0]);
			  	aa_element_attached(result[0]);
			  	aa_register_document_events();
//			  	var debugui = ajaxart.run(data,ajaxart.parsexml('<Control t="debugui.HiddenButton" />'),"",context);
			  	
			  	var loading = jQuery("#ajaxart_loading");
			  	if (loading.length > 0 && ! loading[0].IsUsed)
			  		loading.hide();
	    },serverData, scripts);
	  }); 
	}



function jbart_init() {
	(function(jQuery) {
		jQuery.fn.jBart = function(params)
		{
			return this.each(function() {
				var elem = this;
				jBart.ready(function() {
					if (!params.widget) { console.error("jBart: param 'widget' is missing"); return; };
					if (!jBartWidgets[params.widget]) { console.error("jBart: '" + params.widget + " is not a valid widget"); return; };
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



function jbart_data_arrived(widget_id,resource,data_as_string) {
	var data_as_xml = ajaxart.parsexml(data_as_string);
	if (!data_as_xml) return;
	var data_holder = aa_jbart_get_data_holder(widget_id,resource);
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
	var error_control = [];
	var data_as_xml = aa_convertToXml(data,"widget data", error_control);
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
	ajaxart.isIE = /msie/.test(userAgent);
	ajaxart.isIE7 = /msie 7/.test(userAgent);
	ajaxart.isIE78 = /msie 7/.test(userAgent) || /msie 8/.test(userAgent);
	ajaxart.isSafari = /safari/.test(userAgent);
	ajaxart.isFireFox = /firefox/.test(userAgent);
	ajaxart.isOpera = /opera/.test(userAgent);
	ajaxart.isiPhone = /cpu iphone/.test(userAgent);
	ajaxart.isIDevice = (/iphone|ipad/gi).test(navigator.appVersion);
	ajaxart.isBackEnd = false;
	ajaxart.isMobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
	ajaxart.isAndroid = /android/.test(userAgent);
	ajaxart.deviceCssClass = "";
	if (ajaxart.isChrome) ajaxart.deviceCssClass += " chrome";
	if (ajaxart.isIE) ajaxart.deviceCssClass += " ie";
	if (ajaxart.isIE7) ajaxart.deviceCssClass += " ie7";
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



function _xml(xml)	// for debugger
{
	return ajaxart.xml.prettyPrint(xml,"",false).split("\r");
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
			request.onload = handler;
		} else {
			request.open(params.type, params.url, true);
			request.onreadystatechange = handler;
		}
		request.setRequestHeader('Content-Type',params.dataType || 'text/plain');
		if (params.type == 'POST')
			request.send(params.data);
		else
			request.send();
	}
	else {
	  if (!ajaxart.jSonRequests) ajaxart.jSonRequests = {}
	  if (!ajaxart.jsonReqCounter) ajaxart.jsonReqCounter = 0;
	  if (!window.aa_jsonp_callback) aa_jsonp_callback = function(server_content,id,url)
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
		  url = url + "&aa_postdata" + encodeURIComponent(params.data);
	  jQuery.ajax( { cache: false ,dataType: 'script', httpHeaders : [], url: url });
	}
}



jBart.activator = function (widgetSource) {
	return {
		show: function(div,params) {
			jBartPreloader(function () {
				if (!params) params = {};
				if (!params.widget_src)
					params.widget_src = widgetSource;
				jBart.appendWidget(div,params);				
			});
		},
		jBart: jBart
	}
}



jBart.xpath = function (xml,xpath,createIfDoesNotExist) {
	return aa_xpath(xml,xpath,createIfDoesNotExist);
}



jBart.parsexml = function (contents,baseXml) { return ajaxart.parsexml(contents,'','',false,baseXml); }



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



function aa_handleValidations(field,input,data,context,evt)
{
  if (! field.Validations) return;
  var validationStyle = context.vars._BartContext ? context.vars._BartContext[0].ValidationStyle : aa_first([],ajaxart.parsexml('<xtml t="validation.Default" />'),'',context);
  validationStyle.inputForErrorClass = validationStyle.inputForErrorClass || aa_attach_global_css( validationStyle.CssForInput );

  if (input.ValidationErrorElement) jQuery(input.ValidationErrorElement).remove();
  jQuery(input).removeClass('aa_input_with_error ' + validationStyle.inputForErrorClass);
  jQuery(input).removeClass('aa_mandatory_error');

  if (jQuery(input).parents('.aa_hidden_field').length > 0) // a hidden field
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
	      jQuery(input).addClass('aa_input_with_error ' + validationStyle.inputForErrorClass);
		  
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
		  jQuery(div).addClass('aa_validation_error');
		  if (vObj.Mandatory) jQuery(div).addClass('aa_mandatory_error'); 
		  
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



function aa_validation_showerror(topControl,error,validationDiv,context)
{
	if (!topControl) return;
    
	if (!validationDiv || !validationDiv.styleObject) {
	  var validationStyle = aa_first([],ajaxart.parsexml('<xtml t="validation.Default" />'),'',ajaxart.newContext());
      // deprecated - for old dialogs
	  validationDiv = aa_renderStyleObject(validationStyle,{
		  errorText: '',
		  init: function(settings) {
		    this.jbShowErrorSummary = settings.showErrorSummary;
	      }
	  },context);
	} else {
		var validationStyle = validationDiv.styleObject;
	}
	jQuery(topControl).find('.aa_noclose_message').remove();

	if (! validationDiv.jbShowErrorSummary) return;
	
	var summary = jQuery('<div class="aa_noclose_message" />').addClass(aa_attach_global_css(validationStyle.CssForSummary))[0];
	summary.innerHTML = error || '';
	validationDiv.jbShowErrorSummary(topControl,summary);
	aa_fixTopDialogPosition();
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



function aa_adapt_css_for_browser(css)
{
	if (ajaxart.isAndroid) {
		var colorsObj = aa_build_color_lookup(css);
		return colorsObj.css.replace(/background-image: -webkit-linear-gradient\(([^)]*)\)/,function(match) {
			var degrees = match.match(/([\-0-9]*)deg/)[1];
			var out = "background-image: -webkit-gradient(linear, ";
			switch (Math.round((parseInt(degrees)/90) + 360) % 4) {
				case 0: out += "right top, left top, "; break;
				case 1: out += "left bottom, left top, "; break;
				case 2: out += "left top, right top, "; break;
				case 3: out += "left top, left bottom, "; break;
			}
			var stops = match.split(',');
			for (var i=1; i<stops.length; i++) {
				var stop_match = stops[i].match(/[ ]*([#0-9a-zA-Z]+)[ ]*([0-9]+%)/);
				if (stop_match && stop_match.length >= 3) {
					out += "color-stop(" + stop_match[2] + "," + aa_color_lookup(colorsObj.colors,stop_match[1]) + ")";
					if (i+1 < stops.length)
						out += ", ";
				}
			}
			out += ")";
			return out;
		}).replace(/##[0-9]+/,function(match) { return aa_color_lookup(colorsObj.colors,match)} );
	}
	if (ajaxart.isOpera)
		return css.replace(/-webkit-linear-gradient/g,'-o-linear-gradient');
	return css;
}



function aa_find_class(jElem,cls)
{
	if (jElem.hasClass(cls)) return jElem;
	return jElem.find('.'+cls);
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



function aa_init_image_object(image,data,context)
{
	if (typeof(image) == 'string') return {StaticUrl: image, Size: ''};
	if (!image || !image.Url) return;
	image.StaticUrl = aa_totext(image.Url(data,context));
	return image;
}



function aa_attach_style_css(style)
{
	if (!style.CssClass) 
		style.CssClass = aa_attach_global_css(style.Css);
	return style.CssClass;
}



function aa_find_just_in_container(cntr,cls,mustBeInContainer)  
{
	var ctrl = cntr.Ctrl;
	var elems = jQuery(ctrl).find(cls);
	if (mustBeInContainer && elems.length == 1) return elems[0];
	
	// in case of container in container, do not return aa_list of inner container (e.g. fast add header footer )
	for (var i=0;i<elems.length;i++)
		if ( jQuery(elems[i]).parents('.aa_container')[0] == ctrl )
			return elems[i];
	
    return null;
}



function aa_DataviewFields(fields)
{
	var result = [];
	for(var i in fields) {
		if (!fields[i].HeaderFooter && !fields[i].IsGroup)
			result.push(fields[i]);
		if (fields[i].IsGroupOnlyForLayout)	// getting inside groups
			ajaxart.concat( result, aa_DataviewFields(fields[i].Fields) );
	}
	return result;
}



function aa_filters_from_expression(exp,fields)
{
	var filters = [];
	exp = exp.replace(/^\s*/, "").replace(/\s*$/, ""); // trim spaces
	var filters_txt = exp.split(' AND ');
	for(var i in filters_txt)
	{
		var txt = filters_txt[i];
		txt = txt.replace(/^\s*/, "").replace(/\s*$/, ""); // trim spaces
		// Name likes 'abc' || Age in 1-10
		var fieldId = txt.match(/^[^ ]*/)[0];
		if (!fieldId) continue;
		var txt = txt.substring(fieldId.length);
		var op_parse = txt.match(/^\s*([^\s]*)\s*/);
		var op = (op_parse && op_parse[1]) || '=';
		var txt = txt.substring(op_parse[0].length);
		value = txt.replace(/^\s*/, "").replace(/\s*$/, ""); // trim spaces
		if (value.charAt(0) == '"' || value.charAt(0) == "'")
			value = value.substring(1,value.length-1);
		
		var field = aa_fieldById(fieldId,fields);
		if (field)
		{
			filter = aa_create_filter(field,value,op);
			ajaxart.writevalue(filter.rawFilterData,[value]);
			if (op.charAt(0) == '<' || op.charAt(0) == '>') 
				value = op + value;
			filter.SetFilterData([value]);
			filters.push(filter);
		}
	}
	return filters;
}



function aa_create_wrappers(items,fields,filters,context)
{
	var result = [];
	if (items.length > 0 && items[0].__hiddenForView) // wrappers 
		return items;
	for(var i in items)
	{
		var item = items[i];
		var wrapper = { isObject: true, __item: item, __hidden: false, __FilterResults: {}, __hiddenForView: {}, __OriginalIndex: i};
		for(var j in fields)
		{
			var field = fields[j];
			var txt = field.ItemToText ? field.ItemToText(item) : ajaxart.totext_array(ajaxart_field_calc_field_data(field,[item],context));
			wrapper[field.Id] = field.SortValFunc? field.SortValFunc(txt) : txt;
			if (field.Options && field.Options.codeToText)
				wrapper['__text_' + field.Id] = field.Options.codeToText(wrapper[field.Id]);
		}
		for(var j in filters)
		{
			var filter = filters[j];
			if (filter && filter.PrepareElemCache)
				filter.PrepareElemCache(filter.field,wrapper);
		}
		result.push(wrapper);
	}
	return result;
}



function aa_CalculatedFields(fields)
{
	var result = [];
	for(var i in fields)
		if (fields[i].WrapperToValue)
			result.push(fields[i]);
	return result;
}



function aa_newDataHolder(wrappers,context)
{
	var dataHolder = {
		isObject: true,
		idGen: 0,
		groupIdGen: 0,
		Context: context,
		UserDataView: { 
			isObject: true, Id: 'user', Filters: [],
			CalcFilters: function() { return aa_calcFilters(this) }, CalcResults: function() { return aa_calcResults(this) }
		},
		Wrappers: wrappers,
		newFiltersDataView: function(filters,sort,id)
		{
			var dataview = { 
				isObject: true, dataholder: this, Id: id || this.idGen++, Filters: filters, Sort: sort,
				CalcFilters: function() { return aa_calcFilters(this) }, CalcResults: function() { return aa_calcResults(this) }
			}
			return dataview;
		},
		newGroupBy: function(filtersBefore,groupByFieldIds,otherFieldsGen)
		{
			var dataview = { 
					isObject: true, dataholder: this, Id: 'group_' + this.groupIdGen++, Filters: filtersBefore, Sort: [],
					CalcFilters: function() { return aa_calcFilters(this) }, CalcResults: function() { return aa_calcResults(this) }
				}
			aa_calcFilters(dataview);
			var groupByFields = [];
			var ids = groupByFieldIds.split(',');
			for(var i in ids)
			{
				var field = aa_fieldById(ids[i],this.Fields);
				if (field)
					groupByFields.push(field);
			}
			var groups = aa_calc_groups(dataview,this.Wrappers,groupByFields,this.Context);
			var groups_dataholder = aa_newDataHolder(groups,dataview.dataholder.Context);
			var otherFields = otherFieldsGen(groups);
			groups_dataholder.Fields = groupByFields.concat(otherFields);
			var calculatedFields = [];
			for(var i in otherFields)
				if (!otherFields[i].IsVirtualGroup) 
					calculatedFields.push(otherFields[i]);
			aa_calcFields(groups_dataholder.Wrappers,calculatedFields,groups_dataholder,[]);
			return groups_dataholder;
		}
	}
	dataHolder.UserDataView.dataholder = dataHolder;
	return dataHolder;
}



function aa_calcFields(wrappers,calculatedFields,dataHolder,filters)
{
	if (calculatedFields.length == 0) return;
	
	var prev_wrapper = null;
	for(var i in wrappers)
	{
		var wrapper = wrappers[i];
		for(var j in calculatedFields)
		{
			var fld = calculatedFields[j];
			if (fld.Id == '' || fld.CalcSequence) continue;
			var item = wrapper.__item;
			wrapper[fld.Id] = aa_CalcValueFromWrapper(wrapper,fld,prev_wrapper);
			if (fld.SortValFunc) wrapper[fld.Id] = fld.SortValFunc(wrapper[fld.Id]);
			if (ajaxart.isxml(item) && wrapper[fld.Id])
				item.setAttribute(fld.Id,wrapper[fld.Id]);
			else if (item && wrapper[fld.Id])
				item[fld.Id] = wrapper[fld.Id];
		}
		prev_wrapper = wrapper;
	}

	var relevant_filters = []; // filters on the calculated field
	for(var j in calculatedFields)
	{
		var fld = calculatedFields[j];
		if (fld.Id != '' && fld.CalcSequence)
			fld.CalcSequence(wrappers,dataHolder);
		for(var k in filters)
			if (filters[k].field.Id == fld.Id) relevant_filters.push(filters[k]);
	}
	// filters on calculated fields
	for(var i in relevant_filters)
		for(var j in wrappers)
			if (relevant_filters[i].PrepareElemCache)
			  relevant_filters[i].PrepareElemCache(relevant_filters[i].field,wrappers[j]);
			
}



function aa_create_filter(field,filterValue,op)
{
	var op = op || '=';
    if (!field.newFilter) return;

    var filterData = ajaxart_writabledata();
	if (filterValue)
		ajaxart.writevalue(filterData,[filterValue]);

    var filter = field.newFilter(filterData);
	filter.rawFilterData = filterData;
	filter.field = field;
	filter.Id = field.Id + '_' + op;
	filter.op = op;

    return filter;
}



function aa_RunAsyncQuery(data,fieldscript,context,callBack)
{
	if (fieldscript == null) { callBack([],context,false); return; }
	
	var callBackObj = { callBack: callBack, marked: false , success: true };
	var newContext = aa_ctx(context,{ _AsyncCallback : callBackObj });
	var result = [];
	ajaxart.trycatch( function()  {
		if (typeof(fieldscript) == "function") 
			result = fieldscript(data,newContext); 
		else if (fieldscript.compiled != null)
			result = fieldscript.compiled(data,newContext);
		else
			result = ajaxart.run(data,fieldscript,'',newContext);		// TODO: clean
	}, function (e) {	// catch
	   	   ajaxart.logException(e);
	       return [];
	});
	if (! callBackObj.marked && callBack)	// sync query
		callBack(result,context,true);
}



function aa_refresh_itemlist(cntr,context,show_all)
{
	context = context || cntr.Context;
	show_all = show_all || cntr.DoNotUseIncrementalBuilder; 
	if (show_all) cntr.ShowAll = true;
    var top = ajaxart_find_aa_list(cntr);
	var items_data = aa_items(cntr);
	if (items_data == null) return;
	if (items_data.length == 0 && cntr.ControlForNoData) {
		var ctrl = cntr.ControlForNoData([],context)[0];
		jQuery(ctrl).addClass('aa_list');
		aa_replaceElement(top,ctrl);
	}
	if (cntr.createNewElement)
	{
		if (cntr.IsSingleItem && items_data.length > 0) {  // Document
			aa_clear_cntr_items(top,cntr);
			var elem = cntr.createNewElement([items_data[0]],[],context);
			top.appendChild(elem);
			var newcontext = aa_ctx( cntr.Context, {_Elems: [elem] })
		    for(var i=0;i<cntr.Aspects.length;i++) 
		    	ajaxart_runMethod([],cntr.Aspects[i],'InitializeElements',newcontext);
		    for(var i=0;i<cntr.PostActors.length;i++) 
			    ajaxart.runScriptParam([],cntr.PostActors[i].aspect.PostAction,context);
		} 
		else  // ItemList 
		{
	    	var all_elems = [];
	    	var chunkTimeLimit = cntr.ChunkLimitMSec || 200;
	    	var timeLimit = cntr.PageLimitMSec || 2000;
	    	var show_incremental = cntr.ShowIncrementalBuild == null ? true : cntr.ShowIncrementalBuild;
	    	if (show_all && !window.inJBartRefresh) {
	    		timeLimit = 60000;
	    		cntr.ShowAll = true;
	    	}
	    	else
	    		cntr.ShowAll = null;
	    	ajaxart_uiaspects_incrementalBuild(cntr,context,items_data,all_elems,chunkTimeLimit,timeLimit,show_incremental,cntr.ShowItemsInSyncMode);
		}
	}
	aa_invoke_cntr_handlers(cntr,cntr.ContainerChange,[],context);
}



function aa_FilterAndSort(data1,context)
{
	var data = data1[0];
	var cntr = data1[1];
	var data_items = cntr.Items[0];
	if (data_items.LargeDataItems && data_items.ServerQuery) {
		// server-side sort, filter and aggregate
		var query = aa_calcCntrQuery(cntr,context);
		ajaxart_async_Mark(context);
		jQuery(cntr.Ctrl).addClass('aa_loading');
		aa_runMethodAsync(data_items,data_items.ServerQuery,[cntr.Query],context,function (result,ctx) {
			if (! cntr.Query.GroupByField)
			  cntr.FilteredItems = result;
			else 
			  cntr.Groups = result;
			
			jQuery(cntr.Ctrl).removeClass('aa_loading');
			ajaxart_async_CallBack([],context); 
		});
		return;
	}

	cntr.DataHolder = cntr.DataHolder || aa_createDataHolderFromCntr(cntr,context);
	var exp = aa_FilterExpression(cntr,cntr.ExposedFilters,data,context);
	var dataview;
	var sort = cntr.DataHolder.UserDataView.Sort = aa_cntrSortPrefrences(cntr) || cntr.DataHolder.UserDataView.Sort;
	if (exp)
		var filters = aa_filters_from_expression(exp,cntr.Fields);
	else
		var filters = [];
	cntr.Filters = filters;
	cntr.IDForFilteredResults = cntr.IDForFilteredResults ? cntr.IDForFilteredResults+1 : 1;
	
	var dataview = cntr.DataHolder.newFiltersDataView(filters,sort,'user');
	dataview.CalcFilters();
	var result = dataview.CalcResults();
	cntr.FilteredWrappers = result[0].Items;
	return result;
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



ajaxart.xmlescape = function (text) 
	{
		if (typeof text === 'string')
			return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/\n/g, "&#xa;").replace(/\r/g, "&#xd;");
		if (ajaxart.isArray(text) && text.length > 0) return ajaxart.xmlescape(text[0]);
		return '';
	}



function ajaxart_field_highlight_text(text,highlight,highlight_class)
{
	if (text == null || text == '') return '';
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



function aa_fixstretch()
{
	var elems = jQuery('body').find('.aa_stretch');
	for(var i=0;i<elems.length;i++) 
	  aa_fixStretchOnElem(elems[i]);
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



function aa_empty(elem,clearMemoryLeaks)
{
	var children = [];
	while(elem.firstChild) aa_remove(elem.firstChild,clearMemoryLeaks);	
	aa_clear_virtual_inner_element(elem);
}



function aa_clear_jb_classes(elem)
{
    var classes = elem.className.split(' ');
    for(var i=0;i<classes.length;i++)
   	 if (classes[i].indexOf('jb') == 0) 
   		 jQuery(elem).removeClass(classes[i]);
}



function aa_fixImageSize(img,user_width,user_height) 
{
	var imgObj = new Image(); imgObj.src = img.getAttribute('src');
	var naturalWidth = imgObj.width; var naturalHeight = imgObj.height;
	if (naturalWidth * naturalHeight == 0) {
		img.width = user_width; img.height = user_height; return;
	} 
	if (naturalWidth < img.width) img.width = naturalWidth; 
	if (naturalHeight < img.height) img.height = naturalHeight;
	var width = Math.min(naturalWidth,user_width), height = Math.min(naturalHeight,user_height); // IE hates imgObj.width
	
	var ratio = naturalWidth / naturalHeight;
	var currRatio = width / height;
	if (ratio != currRatio) {
		if (naturalWidth >= naturalHeight * currRatio) {
			img.width = user_width;
			img.height = Math.floor(width / ratio);
		} else {
			img.height = user_height;
			img.width = Math.floor(height * ratio);
		}
	} else {
		img.width = user_width; img.height = user_height;
	}
}



function aa_invoke_field_handlers(eventFuncs,input,e,field,field_data,extra)
{
	if (aa_incapture) return;
	if (eventFuncs)
		for(var i=0;i<eventFuncs.length;i++)
			eventFuncs[i](field,field_data,input,e,extra);
}



function ajaxart_field_RefreshDependentFields(field,srcElement,context)
{
	if (field == null || field.DependentFields == null) return;
	var parent = jQuery(document);
	if (field.RefreshScope == 'container' || field.RefreshScope == 'screen')
		parent = jQuery(srcElement).parents('.aa_container,.aa_widget').slice(-1);
	else if (field.RefreshScope == 'group')
		parent = jQuery(srcElement).parents('.aa_container,.aa_widget').slice(0,1);
	else if (field.RefreshScope == 'item' ) // depricated
		parent = jQuery(srcElement).parents('.aa_item').slice(0,1);
	else if (field.RefreshScope == 'table line' )
	{
		var listIndex = jQuery(srcElement).parents().index(jQuery(srcElement).parents('.aa_list'));
		var parents_up_to_list = jQuery(srcElement).parents().slice(0,listIndex);
		parent = parents_up_to_list.filter('.aa_item').slice(-1);
	}

	var dependent = field.DependentFields.split(',');
	for(var f=0;f<dependent.length;f++)
	{
		var fieldID = dependent[f];
		var ctrls = parent.find(".fld_" + fieldID);
		for(var i=0;i<ctrls.length;i++)
			aa_refresh_cell(ctrls[i],context);
	}
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



function ajaxart_popup_capture_click(e)
{
    var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  );

    if (elem.parents('.customsuggestionpopup').length > 0) return; // clicking inside suggestion box
    if (elem.parents('.contextmenu').length > 0) return; // clicking inside context menu
    if (elem.parents('.capturebox').length > 0) return;
    if (elem.parents('html').length == 0 && elem[0].tagName.toLowerCase() != 'html') return; // detached - should not close..?
//    if (elem.parents().length == 0) return;
    
    var popups = ajaxart.dialog.openPopups;
    for(var i=0;i<popups.length;i++)
    {
    	var popup = popups[popups.length-i-1];
	    if (elem.parents('.aa_click_dosent_close_popup').length > 0) {
	    	// usage: click in inspect popup should not close the current editable popup 
	    	// we do close the popup if it is a 'son' of the inspect dialog
	    	var launching_element = (popup.Dlg) ? popup.Dlg.onElem : popup.onElem;
	    	if (jQuery(launching_element).parents('.aa_click_dosent_close_popup').length == 0)
	    		return;
	    }

    	var popup_frame = (popup.Dlg) ? popup.Dlg.Frame : popup.contents.parentNode;
    	
		//if ( !elem.hasClass('aapopup') && elem.parents('.aapopup').length == 0 && elem.parents('.contextmenu').length == 0 )  // outside the popup
    	if (elem[0] != popup_frame && elem.parents().filter(function() { return this == popup_frame } ).length == 0)
		{
    		if (!popup.initialized) continue;
			jQuery("#log").append("click outside popup");
			if (popup.Dlg && !popup.Dlg.JBStudio && elem.parents('.jbstudio_dlg').length > 0) {
				// no not close
			} else {
				aa_closePopup(popup);
				if (popup.Dlg) jBart.trigger(popup.Dlg,'cancel');
			}
			ajaxart_popup_capture_click(e); // try close more popups
			return;
		}
		else
		{
		  	if (ajaxart.controlOfFocus)
		  		ajaxart.controlOfFocus.IgnoreBlur = true;
			return;
		}
    }
}



function ajaxart_runevent(element,actionContext,actionToRun,controlData,_event)
{
	if (typeof(ajaxart_captured_element) != "undefined" && ajaxart_captured_element.length > 0) return [];
	var elem_context = element["ajaxart"];
	if (typeof(elem_context) == "undefined") 
		return [];
	
	var params = elem_context.params;
	
	if (actionContext.length > 0)
	{
		var actionContextPack = params.vars[actionContext];
		if (actionContextPack == null || actionContextPack.length == 0) return [];
		var actionToRunPack = actionContextPack[0][actionToRun];
		if (actionToRunPack == null || typeof(actionToRunPack) == "undefined") return [];
	}
	else {
		var actionToRunPack = { script: ajaxart.getVariable(params,actionToRun) , context: params};
	}
	var newContext = ajaxart.clone_context(actionToRunPack.context);
	for(var i in elem_context.params.vars)
		newContext.vars[i] = elem_context.params.vars[i];
	
	if (typeof(controlData) != "undefined")
		ajaxart.setVariable(newContext,"ControlData",[controlData]);
	ajaxart.setVariable(newContext,"ControlElement",[element]);

	ajaxart.ui.applyKeyboardEvent(_event,newContext);
	if (ajaxart.isArray(actionToRunPack.script)) return [];
	return ajaxart.run(elem_context.data,actionToRunPack.script,"",newContext);
}



ajaxart.dialog.closeDialog = function ()
{
	var topDialogDiv = openDialogs.pop();
	aa_remove(topDialogDiv.dialogContent,false);
	aa_remove(topDialogDiv,false);
	aa_noOfOpenDialogs--;
	return topDialogDiv;
}



function aa_fieldControl(settings) {
    var field = settings.Field;
    var wrapper = settings.Wrapper;
    var ctx = aa_ctx(settings.Context, { _Field: [field] })

    var field_data = settings.FieldData;
    if (!field_data) field_data = field.FieldData ? field.FieldData(settings.Item, ctx) : settings.Item;

    wrapper.Field = field;
    wrapper.FieldData = field_data;
    wrapper.ItemData = settings.Item;
    wrapper.jbContext = settings.Context;

    var contentCtrl = field.Control && field.Control(field_data, ctx)[0];
    if (contentCtrl) wrapper.appendChild(contentCtrl);

    if (contentCtrl) {
      jQuery(contentCtrl).addClass('field_control');
      contentCtrl.jbCell = wrapper;
    	
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
    
    if (wrapper.firstChild)
    	aa_element_attached(wrapper.firstChild);
}



ajaxart.cookies.valueFromCookie = function (name)
		  {
				if (name == "") return null;
				if (ajaxart.isBackEnd)
				{
					var result = '' + aa_backend_Utils.GetCookie(name);
					return decodeURIComponent(result);
				}
				var nameEQ = name + "=";
				var ca = document.cookie.split(';');
				for(var i=0;i < ca.length;i++) {
					var c = ca[i];
					while (c.charAt(0)==' ') c = c.substring(1,c.length);
					if (c.indexOf(nameEQ) == 0) return decodeURIComponent(c.substring(nameEQ.length,c.length));
				}
				return null;
		  }



ajaxart.cookies.writeCookie = function (cookie,value)
		  {
			var val = encodeURIComponent( value );
			cookie = encodeURIComponent(cookie);
			if (cookie == "") return;
			
			if (ajaxart.isBackEnd)
			{
				aa_backend_Utils.AddCookie(cookie,val);
				return;
			}

		 	 var date = new Date();
			 date.setMonth(date.getMonth()+1);
				  
			 if (cookie != "") 
			   document.cookie = cookie+"="+val+";"+" expires="+date.toUTCString();
		  }



function ajaxart_fill_mlTable() 
{
	window.aa_mlTable = window.aa_mlTable || {};
	for(ns in ajaxart.components)
	{
		var list = ajaxart.components[ns];
		for(var j in list) {
			var comp = list[j];
			if (comp.getAttribute('type') == "text.MultiLangSuite") {
			  ajaxart.run([],aa_xpath(comp,'xtml')[0],'',ajaxart.newContext());
			}
		}
	}
}



ajaxart.tobool_array = function (arr)
{
	if (arr == null) debugger;
	return ajaxart.totext_array(arr) == "true";
}



function aa_buildProperty(cntr,tr,field,item_data,properties_width,ctx,title_tr,dont_add_colon)
{
	  var newContext = aa_ctx(ctx,{_Field: [field], FieldTitle: [field.Title], _Item: item_data } );
	  var field_data = ajaxart_field_calc_field_data(field,item_data,newContext);
	  var value_td = document.createElement("TD");
	  if (field.HideTitle) { value_td.colSpan = 2; }
	  tr.appendChild(value_td);
	  
	  if ( ! field.HideTitle ) {
		  var title_td = document.createElement("TD");
		  title_td.className = "field propertysheet_title_td fld_" + field.Id + "_title";
		  if (properties_width)
			  jQuery(title_td).width(properties_width + 'px');
		  var txt = field.Title;
		  if (txt != "" && !dont_add_colon) txt += ":";
		  title_td.innerHTML = txt;
		  
		  if (!title_tr) title_tr = tr;
		  title_tr.appendChild(title_td);
		  tr.appendChild(value_td);
	  }
	  
	  value_td.className = "propertysheet_value_td";
	  
	  ajaxart_field_createCellControl(item_data,cntr,value_td,cntr.CellPresentation,field,field_data,newContext); 
	  if (field.Description) {
		  var descElem = jQuery('<div class="field_desc"/>').html(field.Description)[0];
		  value_td.appendChild(descElem);
	  }
	  if (field.Mandatory)
	  {
		  var jControl = jQuery(value_td).find(".field_control");
		  if (jControl.length > 0)
		  {
			  jQuery(title_td).addClass("aa_mandatory");
			  jControl.addClass("aa_mandatory");
		  }
	  }
}



function aa_handle_onload_validations(top)
{
  var optionals = jQuery(top).find('.aa_hasvalidations');
  for(var i=0;i<optionals.length;i++) {
    var ctrl = optionals[i];
    if (! ctrl.ajaxart) continue;
    aa_handleValidations(ctrl.ajaxart.params.vars._Field[0],ctrl,ctrl.ajaxart.data,ctrl.ajaxart.params,"on load");
  }
}



function ajaxart_object_boolean_value(obj,property)
{
	if (obj[property] == null ) return null;
	if (typeof(obj[property])=="boolean") return obj[property];
	if (obj[property].length == 0 || obj[property] != "true") return false;
	return true;
}



function ajaxart_field_text(field,field_data,item,context)
{
	if (field.Text)
		var result = ajaxart.totext_array(ajaxart_runMethod(field_data,field,'Text',context));
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
						jQuery(td).removeClass('aa_toggle_button');
						var ctrl = ajaxart_field_createControl(cntr,field,field_data,context)[0];
						if (!cntr) return jQuery('<div></div>')[0];
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
						jQuery(td).addClass("aa_text fld_" + field.Id);	
						td.setAttribute("tabindex","1");
						td.State = 'text';
						if (field.ModifyCell) {
							for(var i=0;i<field.ModifyCell.length;i++)
								field.ModifyCell[i](td,field_data,'text',context,item);
						}
						
						td.onkeydown = function(e) {
							if (jQuery(td).find('.field_control').length > 0) return;
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
				jQuery(td).removeClass('aa_text');
				var ctrl = state.Control();
				if (ctrl == null) return td.expandableText.Build(td.expandableText.States['text']);
				var button = jQuery(ctrl);
				if (state.ChangeStateLabel != '')
				{
					button = jQuery('<div>' + state.ChangeStateLabel + ' </div>')
					td.appendChild(button[0]);
					aa_element_attached(td);
				}
				button.addClass('aa_toggle_button');
				button[0].onclick = function(e) 
				{
				    var elem = jQuery( (typeof(event)== 'undefined')? e.target : event.srcElement  ); 
		  		    if (elem[0].parentNode == null) return true;
					var new_state = td.expandableText.States[state.ChangeToState];
					td.expandableText.Build(new_state);
					jQuery(td).find('>input').slice(0,1).focus();
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
			if (! jQuery(td).hasClass('aa_cell_element'))
				td = jQuery(input).parents('.aa_cell_element')[0];
			if (td == null) return;
			var current_state = td.expandableText.States[td.State];
			var new_state = td.expandableText.States[current_state.ChangeToState];
			td.expandableText.Build(new_state);
			if (jQuery(td).find('.field_control').length > 0)
				jQuery(td).find('.field_control').focus();
			else
				jQuery(td).focus();
		}
	}
}



function ajaxart_field_createControl(cntr,field,field_data,context)
{
	return ajaxart.trycatch( function()  {
		var ctrl = null;
		if (field.Multiple == true && field.MultipleControl != null)
			ctrl = ajaxart_runMethod(field_data,field,'MultipleControl',context);
		else if (ajaxart_field_is_readOnly(cntr,field,context))
		{
			if (field.ReadOnlyControl)
				ctrl = ajaxart_runMethod(field_data,field,'ReadOnlyControl',context); 
			else if (field.Control)
				ctrl = ajaxart_runMethod(field_data,field,'Control',context);
			else return [];
		}
		else if (field.WritableControl)
			ctrl = ajaxart.runScriptParam(field_data,field.WritableControl,context);
		else if (field.Control)
			ctrl = ajaxart_runMethod(field_data,field,'Control',context);
	
		if (ctrl == null) // default is text input 
			ctrl = [ajaxart_field_createSimpleInput(field_data,context, ajaxart_field_is_readOnly(cntr,field,context))];
		if (ctrl.length == 0) // empty control was defined, use text
			return []; //ctrl = [document.createElement('span')];
		jQuery(ctrl[0]).addClass("field_control fld_" + field.Id);
		ctrl[0].Field = field;
		ctrl[0].FieldData = field_data;
		ctrl[0].jbContext = context;
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



function aa_try_probe_test_attribute(script,field,data,out,context,origData)
{
   for (i in ajaxart.xtmls_to_trace)
	   if (ajaxart.xtmls_to_trace[i].xtml.nodeType == 2 && ajaxart.xtmls_to_trace[i].xtml.nodeName == field)
		   if (ajaxart.xml.parentNode(ajaxart.xtmls_to_trace[i].xtml) == script)
			   ajaxart.fill_trace_result(ajaxart.xtmls_to_trace[i].results,data,out,context,origData);
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
			for (varname in ajaxart.serverData)
				message += varname + ",";
		}
		trace_item["context"] = trace_item["context"].reverse();
		
//		if (typeof(console) != "undefined") 
//		  console.log(message);
		
//		jQuery("#ajaxart_trace_control").append(message);
//		jQuery("#ajaxart_trace_control").append("<br><br>");
		ajaxart.traces.push(trace_item);
		if (ajaxart.isBackEnd)
		{
			ajaxart.log("trace: " + trace_item.id)
			ajaxart.log(">trace input: " + trace_item.input);
			ajaxart.log(">trace output: " + trace_item.output);
			ajaxart.log("end trace");
		}
		
		jQuery("#trace_bugs").html("There are traces which can cause performence problems");
	}



function ajaxart_object_run_boolean_method(object,method,data,context)
{
	if (object[method] == null ) return false;
	var result = ajaxart_runMethod(data,object,method,context);
	if (result.length == 0) return false;
	if (ajaxart.totext_array(result) == "true") return true;
	
	return false;
}



function aa_validation_removeNoCloseMessages()
{
	jQuery(document).find('.aa_noclose_message').remove();
}



function ajaxart_field_option_text(field,field_data,context)
{
	var code = ajaxart.totext_array(field_data); 
	if (field.Options && field.Options.codeToText)
		return field.Options.codeToText(code);
	return code;
}



function ajaxart_addMethod_js(object,method,jsFunc,context)
{
	object[method] = {	context: context , compiled: jsFunc, objectForMethod: [object] };
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



undefined



ajaxart.calcParamsForRunOn = function (params,runOn,startFrom)
	{
		var result = jQuery([]);
		if (ajaxart.ishtml(runOn))
			result = jQuery(runOn);
		else
		{
			runOn = ajaxart.totext(runOn);
			runOn = runOn.replace(/ /g, "_");
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
			  var result = baseElem.find(jexp);
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
		result.each(function() {out.push(this)});

		params = ajaxart.clone_context(params);
		ajaxart.setVariable(params,"ControlElement",out);
			
		return params;
	}



ajaxart.fill_trace_result = function (results, input,output,params,origData)
	{
		var result = { isObject: true, Input: input, Output: output, context:params }
		if (origData != null)
			result.OrigData = origData;
		results.push(result);
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



ajaxart.ishtml_item = function (item)
{
	if (!item || !item.ownerDocument || !item.nodeType) return false;
	return item.body || item.ownerDocument.body;
}



function aa_base_images  ()
{
	if (window.location.href.indexOf('http://localhost/') == 0 || window.location.href.indexOf('https://localhost/') == 0)
		return 'images';
	return ajaxart.base_images || '';
}



function aa_base_lib  ()
{
	if (window.location.href.indexOf('http://localhost/') == 0 || window.location.href.indexOf('https://localhost/') == 0)
		return 'lib';
	return ajaxart.base_lib || '';
}



function aa_JsonByRef(parent,prop) { this.parent = parent; this.prop = prop}



ajaxart.dynamicTextWithAggregator = function (item,str,context)
{
	// =Min(person/@age) or =Concat(person/@name,',')
	var match = str.match(/=([a-zA-Z]+)[(]([^)]*)[)]/);
	if (!match) return '';
	var funcName = match[1];
	var params = match[2];
	var params_arr = ajaxart.splitCommasForAggregatorParams(params); 
	if (params_arr.length == 0) return '';
	var ns = "data";
	if (ajaxart.components[ns][funcName] == null) ns='text';
	if (ajaxart.components[ns][funcName] == null) return '';
	var extraParams = "";
	var data = ajaxart.dynamicText([item],"%"+params_arr[0]+"%",context,[item] );
	for (var i=1; i<params_arr.length; i++) {
		var shortParams = ajaxart.xml.xpath(ajaxart.components[ns][funcName], "Param[@short='true']/@name");
		if (shortParams.length <= i-1) break;
		var paramText = params_arr[i].replace('{','%').replace('}','%');
		extraParams += ' ' + ajaxart.totext_item(shortParams[i-1]) + '="' + paramText + '" ';
	}
	var script = '<Script t="' + ns + '.' + funcName +'"'+ extraParams+ ' />';
	return aa_text(data,ajaxart.parsexml(script,'aggregator'),"",context);
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



ajaxart.xml.getModifyInfo = function (xml)
{
	for(var i=0;i<ajaxart.xmlsToMonitor.length;i++)
		if ( ajaxart.xmlsToMonitor[i].xml == xml )
			return ajaxart.xmlsToMonitor[i].modifyInfo;
	return null;
}



ajaxart.xml.autosave = function (xml,attachment,saveAction) 
{
	var savefunc = function(force) {
		if (attachment.saving == true && !force) return false;
		
		attachment.saving = true;
		var success = aa_bool([xml],attachment.profile,'SaveAction',attachment.context);
		if (success) attachment.modified = false;
		attachment.saving = false;
		
		return true;
	}
	if (attachment.autosavedelay == 0) savefunc();
	else 
		aa_delayedRun(savefunc,xml,2500,6000);
}



function aa_has_simulator(elem) {
	if (!elem)
		return (ajaxart.jbart_studio && jQuery('.studio_simulator').length > 0 && jQuery('.studio_simulator')[0].className.indexOf(' ') > -1);
	else // studio shuld be parent of elem
		return (ajaxart.jbart_studio && jQuery(elem).parents('.studio_simulator').length > 0 && jQuery(elem).parents('.studio_simulator')[0].className.indexOf(' ') > -1);

}



function aa_is_fixed_position(elem) 
{
	for (var curr=elem; curr && curr != document.body; curr=curr.parentNode)
	  if ( (curr.currentStyle && curr.currentStyle['position'] == 'fixed') ||
	  	(window.getComputedStyle && window.getComputedStyle(curr, null)['position'] == 'fixed'))
	  		return true;
	return false;
}



ajaxart.isxmlelement = function (xml)
{
	return (ajaxart.isxml(xml) && xml.nodeType == 1);
}



ajaxart.xml.innerTextStr = function (element)
{
	var node = element.firstChild;
	while (node != null) {
		if (node.nodeType == 3 || node.nodeType == 4) return node.nodeValue;
		node=node.nextSibling;
	}
	return "";
}



function aa_handleHttpError(e,options,context)
{
	try
	{
		var text = "HTTP error. url: " + options.url + " status: " + e.statusText;
	//	if (window.aa_showProgressIndicator)
	//		aa_showProgressIndicator(aa_ctx(ajaxart.newContext(), { ProgressIndicationText: [text] }),true);
		ajaxart.log(text,'error');
	} catch(e) {}
}



ajaxart.load_xtml_content = function (xtml_name,xtml)
{
	if (xtml == null) { alert('could not load xtml ' + xtml_name); console.error('could not load xtml ' + xtml_name); debugger; }
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



ajaxart.load_server_data_inner = function (serverDataObj)
	{
	  var varname = serverDataObj.varname;
		ajaxart.loading_objects++;
	  
	  var retFunc = function(server_data_content) {
		    if (server_data_content && !ajaxart.isxml(server_data_content))
		    	server_data_content = ajaxart.ajaxart_clean_ns(server_data_content); 	    
			var serverData = ajaxart.parsexml(server_data_content, varname);
			if (serverData != null)
			{
				while (serverData != null && serverData.nodeType != 1)  // <?xml , remarks etc. 
					serverData = serverData.nextSibling;
				
				if (serverData == null)
					ajaxart.serverData[varname] = [];
				else
				{				
					if (aa_tag(serverData).toLowerCase() == 'envelope')  // web service
						serverData = ajaxart.body_contents_of_soap_envelope(serverData);
				
					ajaxart.serverData[varname] = [serverData];
				}
			}
			ajaxart.object_finished_loading();
	  };
	  var errorFunc = function(XMLHttpRequest, textStatus, errorThrown) {	  
		  ajaxart.log("failed loading server data " + varname + "," + errorThrown); 

	  	  var statusItem = ajaxart.childElemByAttrValue(ajaxart.xtmls,"serverData","varName",varname);
		  if (statusItem != null)
			statusItem.setAttribute("status", "loaded");
	  };
		
	  options = { url: serverDataObj.url , type: "GET" , success: retFunc, error: errorFunc , cache: false};
	  if (serverDataObj.dataType)
		  options.dataType = serverDataObj.dataType;
	  if (typeof(serverDataObj.postData) != "undefined")
	  {
		  options.type = "POST";
		  options.data = serverDataObj.postData;
	  }
	  if (typeof(serverDataObj.contentType) != "undefined")
		  options.contentType = serverDataObj.contentType;
	  
	  try {
	  	var request = jQuery.ajax( options );
	  } catch(e) {jQuery("#loading_log").append("cannot load data of " + serverDataObj.url); 	}
	}



function aa_register_document_events() {
	if (jBart.vars.document_events_registered) return;
	jBart.vars.document_events_registered = true;
  	jQuery(document).keydown(function(event) { 
  		if (event.keyCode == 18)
  			ajaxart_altPressed = true;		  		
	  	if (event.keyCode == 192 && event.ctrlKey && !event.shiftKey) { // ctrl+`  (~)
	  		ajaxart.inPreviewMode = false;
	  		if (ajaxart.gcs.debugui)
	  		  aa_run_component("debugui.OpenDebugUi",[],ajaxart.newContext());
	  	}
	  	if (event.keyCode == 192 && event.ctrlKey && event.shiftKey) { // ctrl+Shift+`  (~)
	  		aa_run_component("debugui.OpenComponent",[],ajaxart.newContext());
	  	}
	  	if (event.keyCode == 8) {
  	        var element = (typeof(event.target)== 'undefined')? event.srcElement : event.target;
	  		if (element.tagName.toLowerCase() != 'input' && element.tagName.toLowerCase() != 'textarea') {
	  		  ajaxart_stop_event_propogation(event);
	  		  return false;
	  		}
	  	}
	  	if (event.keyCode == 88 && ajaxart_altPressed && ajaxart_devmode == true) { // alt+x
	  		var element = (typeof(event.target)== 'undefined')? event.srcElement : event.target;
	  		ajaxart.runComponent('xtml_dt.GlobalOpenAAEditor',[element]);
	  	}
	  	if (event.keyCode == 48 && event.ctrlKey && ajaxart_devmode == true) { // ctrl+0
	  		var element = (typeof(event.target)== 'undefined')? event.srcElement : event.target;
	  		ajaxart.runComponent('xtml_dt.CssCustomize',[element]);
	  	}
  	});
  	jQuery(document).keyup(function(event) { ajaxart_altPressed = false; });
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



jBart.appendWidget = function (place_to_add,params)
{
		function handleError(message) {
			ajaxart.log(message);
			params.error({message: message});
		}
		params.success = params.success || function() {};
		params.error = params.error || function(msg) { jQuery(place_to_add).append(jQuery('<span/>').text(msg.message)); };
		
		ajaxart.base_images = params.base_images_dir || ajaxart.base_images;
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
			
			ajaxart.load_xtml_content('widget',aa_xpath(widget_as_xml,'bart_dev/db/bart_unit/bart_unit')[0]);  // for specific components
			var out = [aa_show_jbart_widget({
				WidgetXml: widget_as_xml,
				Page: page,
				Language: language,
				OnError: function(data1) {
					handleError(aa_totext(data1));
				},
				Context: aa_ctx( ajaxart.newContext(), {Language:[language]} )
			})];
			aa_register_document_events();
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
				jQuery(place_to_add).find(">.spinner").remove();
				var ctrl = getControl(widget_id);
				if (ctrl) {
					place_to_add.appendChild(ctrl);
					aa_element_attached(place_to_add);
					params.success();
				} else {
					return handleError('widget returned an empty control');
				}
			}
			var widgetUrl = (params.widget_repository || '//jbartdb.appspot.com') + '/widget.js?id=' + widget_id;
			aa_load_js_css(widgetUrl,'js');
		}
		else if (params.widget_src)
		{
			var ctrl = getControl();
			if (ctrl) {
				place_to_add.appendChild(ctrl);
				aa_element_attached(place_to_add);
				params.success();
			} else {
				return handleError('widget returned an empty control');
			}
		}
		else
			return handleError('missing param widget_id or widget_src');
}



function aa_jbart_get_data_holder(widget_id,resource) {
	var key = 'jBartWidget_' + widget_id;
	if (!window[key]) window[key] = {resource: {items:[], on_data_arrive:[]}};
	return window[key].resource;
}



function aa_convertToXml(item,name, error_control) {
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



function aa_index_of_element(elem)
{
	for (var k=0,e=elem; e = e.previousSibling; ++k);
	return k;
}



function aa_hide(elem)
{
  elem.style.display = 'none'; elem.display = 'none';
}



function aa_build_color_lookup(css) {
	colors = [];
	var match,result=css;
	var pattern = /((rgb|rgba|hsl|hsla)\([^\)]*\))/g;
	while (match = pattern.exec(css)) {
		result = result.replace(match[1],'##' + colors.length);
		colors.push(match[1]);
	}
	return { css:result, colors:colors };
}



function aa_color_lookup(colors,colorCode) {
	if (colorCode && colorCode.indexOf('##') == 0)
		return colors[colorCode.match(/([0-9]+)/)[1]];
	return colorCode;
}



function aa_calcFilters(dataview)
{
	var id = dataview.Id;
	var wrappers = dataview.dataholder.Wrappers;
	for(var i in wrappers)
	{
		var wrapper = wrappers[i];
		wrapper.__hiddenForView[id] = false;
		for(var j in dataview.Filters)
		{
			var filter = dataview.Filters[j];
			var res = filter.Match(filter.field,wrapper);
			if (res == false)
				wrapper.__hiddenForView[id] = true;
		}
	}
}



function aa_calcResults(dataview)
{
	var id = dataview.Id;
	var result = {isObject: true, Items: [], query: dataview}
	var items = result.Items;
	var wrappers = dataview.dataholder.Wrappers;
	for(var i in wrappers)
	{
		var wrapper = wrappers[i];
		if (! wrapper.__hiddenForView[id] && ! wrapper.__hiddenForView.user && ! wrapper.__hiddenForView.pre)
			items.push(wrapper);
	}
	if (dataview.Sort)
		aa_sort_dataview(items,dataview.Sort);
	return [result];
}



function aa_calc_groups(dataview,wrappers,groupByFields,context)
{
	var field = groupByFields[0];
	if (!field) return [];
	if (groupByFields.length > 1)
	{
		// create a composite key field
		var id = '';
		for(var i in groupByFields)
			id += '__' + groupByFields[i].Id; 
		for(var i in wrappers)
		{ 
			var wrapper = wrappers[i];
			var val = '';
			for(var j in groupByFields)
				val += '__' + wrapper[groupByFields[j].Id]; 
			wrapper[id] = val;
		}
		field = {Id: id};
	}
	var groupby_table = aa_groupItems(field,wrappers,dataview); 
	
	var group_items = [];
	if (field.Options || field.Ranges) // get groups from picklist
	{
		function SubOptions(category)
		{
			if (!category) return null;
			return category.Categories ? category.Categories.concat(category.Options) : category.Options;
		}
		function OptionsToGroups(options)
		{
			var result = []
			for(var i in options)
			{
				var option = options[i];
				var groupName = option.code || option.text;
				var groupWrappers = groupby_table[groupName] ? groupby_table[groupName] : []; 
				var group = {
						isObject: true,
						Name: groupName,
						Id: aa_string2id(groupName),
						Title: field.OptionLabel ? field.OptionLabel([groupName])[0] : groupName,
						Items: aa_sort_dataview(groupWrappers,dataview.Sort),
						Count: groupWrappers.length,
						FetchItems: function() {
							var result = [];
							var subGroups = this.SubGroups;
							for(var g in subGroups)
								result = result.concat(subGroups[g].FetchItems());
							result = result.concat(this.Items);
							return result;
							},
						__hiddenForView: {},
						SubGroups: option.IsCategory ? OptionsToGroups(SubOptions(option)) : null
					}
				if (group.Items.length > 0)
					for(var j in groupByFields) {
						if (!groupByFields[j].Multiple)
						  group[groupByFields[j].Id] = group.Items[0][groupByFields[j].Id];
						else
						  group[groupByFields[j].Id] = groupName; 
					}
				result.push(group);
			}
			return result;
		}
		group_items = OptionsToGroups(SubOptions(field.Options) || field.Ranges);
	}

	// get groups from data
	if (!field.Options && !field.Ranges)
		for(var groupName in groupby_table)  
			if (groupName != 'isObject' && groupName != '__Size')
			{
				var group = {
						isObject: true,
						Name: groupName,
						Id: aa_string2id(groupName),
						__hiddenForView: {},
						Title: field.OptionLabel ? field.OptionLabel([groupName])[0] : groupName,
						Items: aa_sort_dataview(groupby_table[groupName],dataview.Sort),
						Count: groupby_table[groupName].length,
						FetchItems: function() { return this.Items }
				}
				if (group.Items.length > 0)
					for(var j in groupByFields)
						group[groupByFields[j].Id] = group.Items[0][groupByFields[j].Id];
				group_items.push(group);
			}
	return group_items;
}



function aa_CalcValueFromWrapper(wrapper,field,prev_wrapper)
{
	try
	{
		if (field.WrapperToValue)
			return field.WrapperToValue(wrapper,prev_wrapper);
		if (field.ItemToText && wrapper.__item)
			return field.ItemToText(wrapper.__item);
		if (field.FieldData && wrapper.__item)
		{
			var item = wrapper.__item;
			var txt = field.ItemToText ? field.ItemToText(item) : ajaxart.totext_array(ajaxart_field_calc_field_data(field,[item],context));
			return field.SortValFunc? field.SortValFunc(txt) : txt;
		}
	} catch (e) {}
	return [];
}



function ajaxart_writabledata()
{
  return ajaxart.xml.xpath(ajaxart.parsexml('<xml val="" />'),'@val');	
}



function aa_clear_cntr_items(list_top,cntr)
{
	var prev = null,iter = list_top.firstChild;
	while (prev != null || iter != null) {
		if (prev && prev.className && prev.className.indexOf('aa_item') > -1) 
			prev.parentNode.removeChild(prev);
		
		prev = iter;
		if (iter) iter = iter.nextSibling;
	}
	jBart.trigger(cntr,'clearItems');
}



function ajaxart_uiaspects_incrementalBuild(cntr,context,items_data,all_elems,chunkTimeLimit,timeLimit,show_incremental,syncmode)
{
	var incrementalBuilder = 
	{ 
		start: function() {
		    if (cntr.ItemText)
		    {
		    	// fixing createElement measurement - ItemText is calculated outside the measurement
		    	timeLimit = Math.floor(timeLimit / 15);
		    	chunkTimeLimit = Math.floor(chunkTimeLimit / 3);
		    }
		    var top = ajaxart_find_aa_list(cntr);
		    if (!top) return;

			this.startTime = new Date().getTime();
			if (show_incremental)
				aa_clear_cntr_items(top,cntr);
			if (cntr.Tree)
			{
				aa_clear_cntr_items(top,cntr);
				for(var i=0;i<items_data.length;i++)
					top.appendChild(cntr.createNewElement([items_data[i]],all_elems,context));
				this.build(items_data.length);
				return;
			}
			if (cntr.GroupByFields && cntr.GroupByFields.length > 0)
			{
				cntr.DoGroupBy();
				return;
			}
			this.build(0);
		},
		build: function(index) {
			aa_loading(cntr,context);  
			
			var top = ajaxart_find_aa_list(cntr);
			if (!top) return;
			var start = new Date().getTime();
			var start_index = index;
			var elems = [];
			if (!cntr.ShowAll && cntr.MaxItemsToShow)
				var max_length = Math.min(items_data.length,cntr.MaxItemsToShow);
			else
				var max_length = items_data.length;
			while(new Date().getTime() - start < chunkTimeLimit && index < max_length && index - start_index < 300)
			{
				var elem = cntr.createNewElement([items_data[index]],all_elems,context);
				if (elem && show_incremental) elems.push(elem); // to be appended after InitializeElements
	//			if (elem && show_incremental) top.appendChild(elem);
				index++;
			}
			var newcontext = aa_ctx( cntr.Context, {_Elems: all_elems })
		    for(var i=0;i<cntr.Aspects.length;i++) {
		    	ajaxart.trycatch( function() {
		    		ajaxart_runMethod([],cntr.Aspects[i],'InitializeElements',newcontext);
		    	}, function(e) { ajaxart.logException(e); });
		    }
	    	for(var i in elems)	top.appendChild(elems[i]);		 
			
			if (index >= max_length || (new Date().getTime() - this.startTime) > timeLimit)
			{
				if (!cntr.Tree && !show_incremental) 
				{
					aa_clear_cntr_items(top,cntr);
					for(var i=0;i<all_elems.length;i++)
						top.appendChild(all_elems[i]);
				}
		    	
			    for(var i=0;i<cntr.PostActors.length;i++) {
			    	ajaxart.trycatch( function() {
				    	  ajaxart.runScriptParam([],cntr.PostActors[i].aspect.PostAction,cntr.Context);
			    	}, function(e) { ajaxart.logException(e); });
			    }
			    aa_add_partial_suffix(cntr,index,max_length,context);
			    return;
			}
			else
			{
				var nextTimer = function(builder) { setTimeout(function() { 
					if (!ajaxart.isattached(cntr.Ctrl)) return;
					if (cntr.IncrementalBuilder === builder) // stop if the incremental builder was replaced
						cntr.IncrementalBuilder.build(index);
				} ,1) };
			}
			if (!window.inJBartRefresh)
			  nextTimer(this);
		}
	}
	if (!syncmode) {
		cntr.IncrementalBuilder = incrementalBuilder;
		cntr.IncrementalBuilder.start();
	} else {	// syncronized mode, simply show all the items
		var top = ajaxart_find_aa_list(cntr);
		if (!top) return;
		var elems = [];
		for (var i=0; i<items_data.length; i++)
		{
			var elem = cntr.createNewElement([items_data[i]],all_elems,context);
			elems.push(elem); // to be appended after InitializeElements
		}
		var newcontext = aa_ctx( cntr.Context, {_Elems: all_elems })
	    for(var i=0;i<cntr.Aspects.length;i++) {
	    	ajaxart.trycatch( function() {
	    		ajaxart_runMethod([],cntr.Aspects[i],'InitializeElements',newcontext);
	    	}, function(e) { ajaxart.logException(e); });
	    }
    	for(var i in elems)	top.appendChild(elems[i]);		 
	}
}



undefined



function aa_FilterExpression(cntr,filters,data,context)
{
	var out = '';
	var filters = filters || (cntr.DataHolder && cntr.DataHolder.UserDataView.Filters);
	var first = true;
	for(var i in filters)
	{
		var filter = filters[i];
		var sqlValue = filter.ToSQLText(filter.rawFilterData);
		if (sqlValue == '') continue;
		if (!first)
			out+= ' AND ';
		out += filter.field.Id + " " + filter.op + " '" + sqlValue + "'";
		first = false;
	}
	if (cntr.ExtraQueryExpression)
		out = cntr.ExtraQueryExpression(data,aa_ctx(context,{Exp: [out]}))[0];
	if (out.indexOf(' AND ') == 0)
		out = out.substring(5);
	return out;
}



function aa_cntrSortPrefrences(cntr)
{
	var thead = jQuery(cntr.Ctrl).find('.aatable>thead').slice(0,1);
	var th = thead.find('>tr>th').filter('.sort_ascending,.sort_descending')[0];
	if (th != null)
		return [{ SortBy: th.Field.Id, SortDirection: jQuery(th).hasClass('sort_ascending') ? 'ascending' : 'descending' }]
}



function aa_clear_virtual_inner_element(elem) 
{
	if (!elem.virtual_inner_elements) return;
	for(var i=0;i<elem.virtual_inner_elements.length;i++) {
		aa_empty(elem.virtual_inner_elements[i]);
	}
}



function aa_fixStretchOnElem(elem)
{
	if (elem.fixStretchBottom) elem.fixStretchBottom();
	if (elem.fixStretchRight) elem.fixStretchRight();
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
				  xml_val = ajaxart.xmlescape( xml_val );
			  }
			  else if (item.nodeType == 2) // attribute
				  xml_val = "@" + item.nodeName + '="' + ajaxart.xmlescape(ajaxart.xml2text(item)) + '"';
			  else
				  xml_val = ajaxart.xmlescape( ajaxart.xml2text(item) );
				 
			  if (ajaxart.ishtml(item))
	  	    out += "html: " +  xml_val;
			  else
			  	out += "xml: " +  xml_val;
			}
			else if (ajaxart.isObject(item)) {
				if (depth+1 == max_depth) {
					out += "object (";
					for (i in item)
						if (i != "isObject")
							out += i + ", ";
					out = out.substring(0,out.length-2) + ")";
				}
				else {
					out = { isObject: true };
					for (i in item) {
						if (i != "isObject" && i != "XtmlSource") {
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



function aa_showProgressIndicator(context,autoHide)
{
	aa_showIndicator = true;
	jQuery(context.vars.ControlElement).addClass('aa_loading');
	
	setTimeout(function() {
		if (! aa_showIndicator) return;
		var newtext = ajaxart_multilang_text( aa_totext(context.vars.ProgressIndicationText) , context);
		
		if (newtext == "") newtext = ajaxart_multilang_text("loading...",context);
		var jIndicator = jQuery('.aa_progress_indicator');
		if (! jIndicator.hasClass('right2left') && ajaxart_language(context) == 'hebrew')
			jIndicator.addClass('right2left')
			
		jIndicator.find('.aa_progress_indicator_text').html(newtext);
		jIndicator.show();
		if (autoHide)
		{
			setTimeout(function() {
				aa_hideProgressIndicator(context);
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
			  	if (language != null)
			  		ajaxart.setVariable(context,"Language",language);
			  	var result = ajaxart.run(data,scriptXml,"",context);
			  	var div = jQuery(divId).addClass("ajaxart ajaxart_topmost " + ajaxart.deviceCssClass);
			  	ajaxart.databind([div[0]],data,context,scriptXml,data);
			  	if (div.length > 0 && result.length > 0)
			  		div[0].appendChild(result[0]);
			  	aa_element_attached(result[0]);
			  	aa_register_document_events();
//			  	var debugui = ajaxart.run(data,ajaxart.parsexml('<Control t="debugui.HiddenButton" />'),"",context);
			  	
			  	var loading = jQuery("#ajaxart_loading");
			  	if (loading.length > 0 && ! loading[0].IsUsed)
			  		loading.hide();
	    }



undefined



ajaxart.ajaxart_clean_ns = function (xmltext)
{
	xmltext = xmltext.replace(new RegExp('<[A-Za-z0-9_]*:', 'g'), '<');
	xmltext = xmltext.replace(new RegExp('</[A-Za-z0-9_]*:', 'g'), '</');
	xmltext = xmltext.replace(new RegExp('xmlns[a-zA-Z0-9_:"\'=/.-]*', 'g'), '');
	xmltext = xmltext.replace(new RegExp('[A-Za-z0-9_]*:([A-Za-z0-9_]*)="', 'g'), '$1="');

	return xmltext;
}



ajaxart.body_contents_of_soap_envelope = function (envelope)
{
	for(var i=0;i<envelope.childNodes.length;i++)
	{
		var node = envelope.childNodes.item(i);
		if (node.nodeType == 1 && aa_tag(tagName).toLowerCase() == 'body') {
			for (var j=0;j<node.childNodes.length;j++)
			{
				var innernode = node.childNodes.item(i);
				if (innernode.nodeType == 1) return innernode; 
			}
		}
	}
	return envelope;
}



function aa_run_component(id,input,context,params)
{
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
	  if (xtmlElem.execution == 'native') {
		  return xtmlElem.gc(xtmlElem.profile,input,context);
	  }	  
	  var newContext = {};
	  newContext.vars = context.vars;
	  newContext.componentContext = context.componentContext;
	  
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



function aa_load_js_css(filename, filetype) {
	filetype = filetype || 'js';
	if (ajaxart.loaded_js == null) ajaxart.loaded_js = {};
	if (ajaxart.loaded_js[filename] != null) return;
	ajaxart.loaded_js[filename] = "loaded";

	if (filetype=="js"){ //if filename is a external JavaScript file
		  var fileref=document.createElement('script')
		  fileref.setAttribute("type","text/javascript")
		  fileref.setAttribute("src", filename)
	}
	else if (filetype=="css"){ //if filename is an external CSS file
		  var fileref=document.createElement("link")
		  fileref.setAttribute("rel", "stylesheet")
		  fileref.setAttribute("type", "text/css")
		  fileref.setAttribute("href", filename)
	}
	if (fileref)
	    document.body.appendChild(fileref);
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
	result = result || ajaxart.parsexml('<' + tag + '/>');
	return json2Xml(obj,result,0);
	function json2Xml(obj,result,depth)
	{
		if (depth == 20) { debugger; return '<TooMuchRecursion/>'; }
		if (typeof(obj) == 'string') {
			try {
				return json2Xml(JSON.parse(obj),result,depth+1);
			} catch(e) { 
				ajaxart.log("jsonToxml - Can not parse json " + obj,"error");
				return null; 
			}
		}
	
		try {
			var inner_tag;
			var isArray = obj[0] && (!(typeof(obj) == 'string')); 
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
			for(var att in obj) {
				var inner = obj[att];
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
			var name = fields[i].replace(/ ([a-z])/g,function(match) {return ' ' + match.toUpperCase()}).replace(/[^a-zA-Z0-9_]/g,'');
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



function aa_sort_dataview(wrappers,sort)
{
	if (!sort || sort.length == 0) return wrappers;
	if (sort.length  == 1)
	{
		var fieldId = sort[0].SortBy;
		for(var i in wrappers)
			wrappers[i].__Val = wrappers[i]['__text_' + fieldId] || wrappers[i][fieldId];

		if (sort[0].SortDirection == 'ascending')
			wrappers.sort(function(a,b) { return a.__Val > b.__Val ? 1 : -1; });
		else
			wrappers.sort(function(a,b) { return a.__Val < b.__Val ? 1 : -1; });
	}
	else
	{
		function compare(wrapperA,wrapperB)
		{
			for(var i in sort)
			{
				var sortElem = sort[i];
				var fld = sortElem.SortBy;
				if (wrapperA[fld] == wrapperB[fld]) continue; 
				if (sortElem.SortDirection == 'ascending')
					return wrapperA[fld] > wrapperB[fld] ? 1 : -1;
				else
					return wrapperA[fld] < wrapperB[fld] ? 1 : -1;
			}
		}
		wrappers.sort(compare);
	}
	return wrappers;
}



function aa_groupItems(field,wrappers,dataview)
{
	var table = { isObject: true }
	var OccOfCategory = function(table,category)
	{
		var code = category.code;
		if (table[code]) return table[code];
		var occ = [];
		for(var i=0;i<category.Options.length;i++)
			occ = occ.concat(table[category.Options[i].code] || []);
		for(var i=0;i<category.Categories.length;i++)
			occ = occ.concat(OccOfCategory(table,category.Categories[i]));
		table[code] = occ;
		return occ;
	}
	// populate options
	table.__Size = 0;
	var dataviewId = dataview ? dataview.Id : null;
	for(var i in wrappers)
	{ 
		var wrapper = wrappers[i];
		if ((dataviewId && wrapper.__hiddenForView[dataviewId]) || wrapper.__hiddenForView.user)
			continue;
		table.__Size++;
		var val = wrapper[field.Id];
		if (field.Multiple) {
		  var vals = val.split(',');
		  for (j=0;j<vals.length;j++) {
			  var val2 = vals[j];
			  if (table[val2] == null) table[val2] = [wrapper]; else table[val2].push(wrapper);
		  }
		} else { 
  		  if (table[val] == null) table[val] = [wrapper]; else table[val].push(wrapper);
		}
	}
	if (field.Options && field.Options.Categories)
		for(var i=0;i<field.Options.Categories.length;i++)
			OccOfCategory(table,field.Options.Categories[i]);
	return table;
}



function aa_loading(cntr,context)
{
	cntr.PartialView = { isObject: true, Loading: true,
		RemoveSummary: function(cntr)
		{
			var header_footer = jQuery(cntr.Ctrl).find('>.aa_container_footer');
			var summary = header_footer.find('.PartialViewSummary');
			summary.remove();
			aa_fire_async_finished();
		}
	}
	var header_footer = jQuery(cntr.Ctrl).find('>.aa_container_footer');
	var summary = header_footer.find('.PartialViewSummary');
	if (summary.find('.aa_show_all_items').length > 0)
	{
		summary.remove();
		summary = header_footer.find('.PartialViewSummary');
	}

	if (summary.length == 0)
	{
		summary = jQuery('<div class="PartialViewSummary"></div>');
		header_footer.append(summary);
	}
	var loading = summary.find('>.aa_loading');
	if (loading.length == 0)
	{
//		loading = jQuery('<span class="aa_loading">' + ajaxart_multilang_text('loading ',cntr.Context) + '</span>');
		loading = jQuery('<span class="aa_loading" />');
		summary.append(loading);
	}
	loading.text(loading.text() + '.');
}



function aa_add_partial_suffix(cntr,shownItems,totalItems,context)
{
	if (cntr.PartialView && cntr.PartialView.RemoveSummary)
		cntr.PartialView.RemoveSummary(cntr);

	if (shownItems == totalItems) return;
	cntr.PartialView = { isObject: true, From: 0, ShownItems: shownItems, TotalItems: totalItems }
	var header_footer = jQuery(cntr.Ctrl).find('>.aa_container_footer');
	var summary = header_footer.find('.PartialViewSummary');
	if (summary.length == 0)
	{
		summary = jQuery('<div></div>');
		summary.addClass('PartialViewSummary');
		header_footer.append(summary);
	}
	cntr.PartialView.ShowAll = function() { 
		cntr.PartialView.RemoveSummary(cntr);
		aa_recalc_filters_and_refresh(cntr,[],context,true);
	} 
	var show_all_items = jQuery('<span class="aa_show_all_items">' + ajaxart_multilang_text('show all items',cntr.Context) + '</span>');
	show_all_items.click(function() { if (!window.aa_incapture) { cntr.PartialView.ShowAll(); }  } );
	summary.text(cntr.PartialView.ShownItems + ' ' + ajaxart_multilang_text('of',cntr.Context) + ' ' + cntr.PartialView.TotalItems);
	summary.append(show_all_items);
	cntr.PartialView.RemoveSummary = function(cntr)
	{
		var header_footer = jQuery(cntr.Ctrl).find('>.aa_container_footer');
		var summary = header_footer.find('.PartialViewSummary');
		summary.remove();
	}
}



ajaxart.tryShortXmlWithTag = function (xml,attrName)
	{
		if (aa_hasAttribute(xml,attrName))
			return "<" + aa_tag(xml) + " " + attrName + '="' + xml.getAttribute(attrName) + '" .../>';  
	}



function aa_hideProgressIndicator(context)
{
	aa_showIndicator = false;
	jQuery(context.vars.ControlElement).removeClass('aa_loading');
	
	jQuery('.aa_progress_indicator').hide();
	aa_fire_async_finished();
}



function ajaxart_language(context)
{
	if (context.vars.Language == null || context.vars.Language.length == 0) return "";
	return ajaxart.totext( context.vars.Language[0] );
}



function aa_cdata_value(element) {
	if (!element) return null;
	for (var child = element.firstChild; child!=null; child=child.nextSibling)
		if (child.nodeType == 4 && child.nodeValue)
			return child.nodeValue;
	return null;
}



function aa_fire_async_finished()
{
	// let sync actions finish
	setTimeout(function() {
		for(var i=aa_async_finished_listeners.length-1;i>=0;i--)
			aa_async_finished_listeners[i].OnAsyncActionFinished();
	},1);
}
aa_gcs("yesno", { 
IsEmpty:function (profile,data,context)
	  {
		  var val = ajaxart.run(data,profile,'Value',context);
		  var checkInner = aa_bool(data,profile,'CheckInnerText',context);
		  return ajaxart.yesno.is_empty(val,checkInner);
	  },
Empty:function (profile,data,context)
	  {
	  	return ajaxart.yesno.is_empty(data,aa_bool(data,profile,'CheckInnerText',context));
	  },
Contains:function (profile,data,context)
  {	
	var ignoreCase = aa_bool(data,profile,'IgnoreCase',context);
	var ignoreOrder = aa_bool(data,profile,'IgnoreOrder',context);
	var oneOf = aa_bool(data,profile,'OneOf',context);
	var allText = ajaxart.run(data,profile,'AllText',context);

	var data_text = "";
  	if (ajaxart.isxml(allText))
  		data_text = ajaxart.xml2text(allText);
  	else
  		data_text = ajaxart.totext(allText);

  	data_text = data_text.replace(/\s+/g,' '); // normalize white spaces
  	//if (data_text == "") return [];
  	var text_items = ajaxart.runsubprofiles(data,profile,'Text',context);
    //var text_profiles = ajaxart.subprofiles(profile,'Text');
  	var startIndex = 0;
	if (data_text == null || text_items.length == 0) return [];
	if (ignoreCase) data_text = data_text.toLowerCase();
	for(var i=0;i<text_items.length;i++)
	{
		var text = ajaxart.totext_item(text_items[i]).replace(/\s+/g,' ');
  		if (ignoreCase) text = text.toLowerCase();
  		var new_index = data_text.indexOf(text,startIndex);
  		if (!oneOf && new_index == -1) return [];
  		if (oneOf && new_index != -1) return ['true'];
  		startIndex = new_index + text.length;
  		if (ignoreOrder || oneOf) startIndex=0;
  	};
	
	if (oneOf) return [];
	return ['true'];
  },
Not:function (profile,data,context)
	  {
		  var result = aa_bool(data,profile,'Of',context);
		  if (result == false)
			  return ["true"];
		  else
			  return [];
	  },
NotEmpty:function (profile,data,context)
	  {
		  var value = ajaxart.run(data,profile,'Value',context);
		  var check = aa_bool(data,profile,'CheckInnerText',context);
		  var result = ajaxart.yesno.is_empty(value,check);
		  if (result == true || result[0] == 'true') return [];
		  return ['true'];
	  },
ItemsEqual:function (profile,data,context)
	  {
	    var item1 = ajaxart.run(data,profile,'Item1',context);
	    var item2 = ajaxart.run(data,profile,'Item2',context);
	    
	    if (item1.length == 0 && item2.length == 0) return ["true"];
	    if (item1.length == 0 || item2.length == 0) {
	    	var item = (item1.length > 0) ? item1 : item2;
	    	if ( ajaxart.yesno.itemsEqual(item[0],"") ) return ["true"]; else return [];
	    }
	    
	    if ( ajaxart.yesno.itemsEqual(item1[0],item2[0]) ) return ["true"];
	    return [];
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
	  },
EqualsTo:function (profile,data,context)
  {
   var to = ajaxart.run(data,profile,'To',context);
   
   if (to.length == 0 && data.length == 0) return ["true"];
   if (to.length == 0 || data.length == 0) return [];
   
   var to_comp = to[0];
   var data_comp = data[0];
   
   if ( ajaxart.yesno.itemsEqual(to_comp,data_comp) ) return ["true"];
   return [];
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
	  	  newContext.params = context.componentContext.params;
	  	  newContext.componentContext = context.componentContext.componentContext;

	  	  return ajaxart.runsubprofiles(data,paramScript.script,paramScript.field,newContext);
	  },
CopyAllParams:function (profile,data,context)
  {
	  var out = { isObject: true };

	  for(var i in context.params) {
		  var name = i;
		  var val = context.params[i];
		  if (val.isParamScript == true) {
			  out[name] = val;
			  out[name].context = context.componentContext;
		  }
		  else
		    out[name] = val;
	  }
	  
	  return [out];
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
		  	  
			  if (xtml[0].context != null) { // the xtml object comes with its own context
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
ComponentsOfType:function (profile,data,context)
	  {
		  if ( ! window.ajaxart_comp_of_type_cache ) {
			  ajaxart_comp_of_type_cache = {};
			  ajaxart_comp_of_type_advanced_cache = {};
			  for (var i in ajaxart.components) {
				  var advanced = false;
				  if (i.lastIndexOf("_dt") == i.length-3 && i.length > 3 || i == "aaeditor") advanced = true;
				  for(var j in ajaxart.components[i]) {
					  var comp = ajaxart.components[i][j];
					  if (comp.getAttribute('hidden') == 'true') continue;
//					  if (! advanced && comp.getAttribute('advanced') == "true") advanced = true;
					  var types = (comp.getAttribute('type') || '').split(',');
					  for(var k=0;k<types.length;k++) {
						  if (types[k].split('.').length > 2) // e.g. data_items.Items.PageData
							  types.push(types[k].substring(0,types[k].lastIndexOf('.')));
					  }
					  var category = comp.getAttribute('category');
					  if (category) types.push(types[0]+'.'+category);
					  
					  for(var t in types)
					  {
						  var type = types[t];
						  if (!advanced) {
							if (ajaxart_comp_of_type_cache[type] == null) ajaxart_comp_of_type_cache[type] = [];
							ajaxart_comp_of_type_cache[type].push("" + i + "." + j);
						  }
						  else {
						    if (ajaxart_comp_of_type_advanced_cache[type] == null) ajaxart_comp_of_type_advanced_cache[type] = [];
						    ajaxart_comp_of_type_advanced_cache[type].push("" + i + "." + j);
						  }
					  }
				  }
			  }
		  }
		  
		  var type = aa_text(data,profile,'Type',context);
		  var out = ajaxart_comp_of_type_cache[type];

		  if (aa_bool(data,profile,'ForAllTypes',context)) {
			  ajaxart.concat(out,ajaxart_comp_of_type_advanced_cache[type]);
			  ajaxart.concat(out,ajaxart_comp_of_type_cache["*"]);
		  }
		  
		  if (out == null) out = [];
		  return out;
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
	  },
XtmlOfParamArray:function (profile,data,context)
  {
	  var param = aa_text(data,profile,'Param',context); 
	  var paramScript = context.params[param];
	  if (ajaxart.isArray(paramScript)) return []; // script='false'

	  return aa_xpath(paramScript.script,param);
  }
});

/*********/



aa_gcs("xml", { 
WithChanges:function (profile, data, context) {
		//jQuery("#ajaxart_trace_control").append(ajaxart.xml.xpath_of_node(profile,"id",true) + '<br/>');
		var xml_src = ajaxart.run(data,profile,'Xml',context);
		var newContext = ajaxart.clone_context(context);
		ajaxart.setVariable(newContext,"InputForChanges",data);
		var out = [];
		ajaxart.each(xml_src, function(item) {
			var xml = item;
			if ( ! ajaxart.ishtml(item) && aa_bool(data,profile,'CloneXml',context))
			  xml = ajaxart.xml.clone([item]);
				
			var changes = ajaxart.subprofiles(profile,'Change');
			ajaxart.each(changes,function(changeProfile) {
				ajaxart.run([xml],changeProfile, "", newContext);
			});
			out.push(xml);
		});
		return out;
	},
Wrap:function (profile, data, context) {
		if ((!ajaxart.isxml(data)) || data[0].nodeType == 9) { return []; } // Document 

		var headtag = aa_text(data,profile,'HeadTag',context);
		var head = aa_first(data,profile, 'Head', context);
		if (head == null) {
			if (headtag == "") return [];
			head = aa_createElement(data[0],headtag);
		}
				
		if (! ajaxart.ishtml(data))
		{
			for(var i=0;i<data.length;i++)
				ajaxart.xml.append(head,data[i].cloneNode(true));
		}
		else
		{
			for(var i in data)
				ajaxart.xml.append(head,data[i]);
		}
		
		return [head];
	},
XmlToText:function (profile, data, context) {
		if (!data[0]) return [];
		if (!data[0].nodeType) {
			try {
			  return [JSON.stringify(data[0])];
			} catch(e) {
				return aa_totext(data);
			}
		}
//	    if (!data[0] || !data[0].nodeType) return [ aa_totext(data) ];
		var pretty_print = aa_bool(data,profile,'PrettyPrint',context);
		var escape = aa_bool(data,profile,'Escape',context);
		if (data.length == 0) return [];
		if (! ajaxart.isxml(data[0]))
			return data[0];
		
		if (pretty_print)
			return [ ajaxart.xml.prettyPrint(data[0]) ];
		else
			return [ ajaxart.xml2text(data[0]) ];	
	},
ChangeXml:function (profile, data, context) 
	{
		var xml_src = aa_first(data,profile,'Xml',context);
		if (xml_src == null) return [];
		xml_src = [xml_src];
		if (! ajaxart.isxml(xml_src)) return [];
		var newContext = ajaxart.clone_context(context);
		ajaxart.setVariable(newContext,"InputForChanges",data);
		var changes = ajaxart.subprofiles(profile,'Change');
		
		ajaxart.each(xml_src, function(item) {
			ajaxart.each(changes,function(changeProfile) {
				ajaxart.run([item],changeProfile, "", newContext);
			});
		});
		return ["true"];		
	},
AddChildren:function (profile, data, context) {
		var inputForChanges = ajaxart.getVariable(context,"InputForChanges");
		var children = ajaxart.run(inputForChanges,profile, 'Children', context);
		var clone = aa_bool(inputForChanges,profile,'CloneChildren',context);
		
		if (data.length == 0) return [];
		var imported_items = [];
		for(var i=0;i<children.length;i++) {
			var item = aa_importNode(children[i],data[0]);
			imported_items.push(item);
			if (!clone)
				ajaxart.xml.append(data[0],item);
			else
				ajaxart.xml.append(data[0],ajaxart.xml.clone([item]));
		}
		if (children.length > 0) ajaxart.xml.xml_changed(data[0]);
		ajaxart.run(imported_items,profile, 'RunOnChildren', context)
		return data;
	},
XmlItems:function (profile,data,context)
	{
		var dataitems = { isObject: true }
		dataitems.ParentXml = aa_first(data,profile,'Parent',context);
		var tag = aa_text(data,profile,'Tag',context);
		dataitems.Tag = tag;
		if (tag.indexOf(',') > -1) {  // more than one tag
			var tags = tag.split(',');
			dataitems.Tag = tags[0];
			dataitems.AllTags = tags;
		}
		dataitems.ItemTypeName = aa_text(data,profile,'ItemTypeName',context);
		if (dataitems.ItemTypeName == "")
			dataitems.ItemTypeName = aa_text_capitalizeToSeperateWords( ajaxart_multilang_text(tag,context) );
		
		var init = function(dataitems) 
		{
			dataitems.InitXmlItem = function(xml) 
			{
				var info = aa_getXmlInfo(xml,context);
				info.DataItems = dataitems;
				info.PrepareForEdit = function() {
					this.OriginalCopy = this.Xml.cloneNode(true);
				}
				info.Cancel = function(data1,ctx2) {
					if (aa_tobool(ctx2.vars.IsNewItem))
						this.Delete(data1,ctx2);
					else if (this.OriginalCopy)
					  ajaxart.xml.copyElementContents(this.Xml,this.OriginalCopy);
				}
				info.Delete = function() {
					xml.parentNode.removeChild(xml);
					aa_removeXmlInfo(xml);
					ajaxart.xml.xml_changed(this.DataItems.ParentXml);
					for(var i=0;i<dataitems.Items.length;i++) {
						if (dataitems.Items[i] == xml) { dataitems.Items.splice(i,1); break;} 
					}
					ajaxart.xml.xml_changed(dataitems.ParentXml);				
				}
			}
			dataitems.Refresh = function(data1,ctx) {
				if (!dataitems.AllTags)
				  dataitems.Items = (dataitems.Tag != "") ? aa_xpath(dataitems.ParentXml,dataitems.Tag) : [];
				else {
					dataitems.Items = [];
					for(var i in dataitems.AllTags)
						ajaxart.concat(dataitems.Items,aa_xpath(dataitems.ParentXml,dataitems.AllTags[i]));
				} 
				if (aa_paramExists(profile,'ElementCondition')) {
					var newItems = [];
					for(var i=0;i<dataitems.Items.length;i++)
						if (aa_bool([dataitems.Items[i]],profile,'ElementCondition',context))
							newItems.push(dataitems.Items[i]);
					
					dataitems.Items = newItems;
				}
				for(var i=0;i<dataitems.Items.length;i++)
					dataitems.InitXmlItem(dataitems.Items[i]);
			}
			dataitems.DeleteItem = function(data1,ctx) {
				var info = aa_getXmlInfo(data1[0],context);
				if (info.Delete) return info.Delete(data1,ctx);
			}
			dataitems.SubsetForNewItem = function(data1,ctx) {
				var tag = dataitems.Tag;
				if ( dataitems.AllTags && aa_totext(ctx.vars._NewItemTag) != "" ) {
					tag = aa_totext(ctx.vars._NewItemTag);
					if ( dataitems.AllTags.join(',').indexOf(tag) == -1) tag = dataitems.Tag; 
				}
				var item = aa_createElement(dataitems.ParentXml,tag);
				ajaxart.run([item],profile,'DoOnNewItem',context);
				var info = aa_getXmlInfo(item,context);
				info.DataItems = dataitems;
				info.Save = function(data2,ctx2) {
					var dataitems = this.DataItems;
					if (!dataitems.ParentXml) return [];
					dataitems.ParentXml.appendChild(this.Xml);
					ajaxart.xml.xml_changed(dataitems.ParentXml);
					dataitems.Items.push(item);
					dataitems.InitXmlItem(item);
				}
				var subset = { isObject: true , Items: [item]};
				subset.Save = function(data2,ctx2) {
					var info = aa_getXmlInfo(this.Items[0],context);
					info.Save([info.Xml],ctx);
				}
				if (aa_tobool(ctx.vars._DataItemsImmediateAdd)) {
					subset.Save([],ctx);
					subset.Save = function(data1,ctx2) {
						if (subset.Items.length == 0) return [];
						var info = aa_getXmlInfo(subset.Items[0],ctx2);
						info.Save(data1,ctx2);
					}
				}
				
				return [subset];
			}
			dataitems.Subset = function(data1,ctx) 
			{
				var item = ctx.vars._InnerItem[0];
				var subset = { isObject: true, ItemTypeName: dataitems.ItemTypeName , Items: [item]}
				var info = aa_getXmlInfo(item,context);
				subset.DeleteItem = info.Delete;
				subset.Cancel = info.Cancel;
				subset.Save = function() {}
				if (info.PrepareForEdit) info.PrepareForEdit();
				return [subset];
			}
			dataitems.CanPasteFromDataItems = function(draggedDataItems,ctx) {
				if (aa_paramExists(profile,'CanPasteItem')) {
			      return aa_frombool( aa_bool([draggedDataItems],profile,'CanPasteItem',aa_ctx(context,{_Items: [this]})) );
				}
				if (draggedDataItems[0].Tag && dataitems.Tag && draggedDataItems[0].Tag == dataitems.Tag)
					return ['true'];
				return [];
			}
			dataitems.MoveBefore = function(data1,ctx) {
				if (data1.length == 0) return [];
			    var item = data1[0].Item[0];
			    var to = data1[0].BeforeItem[0];
				if (ajaxart.isxml(to) && ajaxart.isxml(item) )
					if (to.ownerDocument == item.ownerDocument && item.ownerDocument != null)
						to.parentNode.insertBefore(item,to);

				ajaxart.xml.xml_changed(dataitems.ParentXml);				
				dataitems.Items = aa_xpath(dataitems.ParentXml,dataitems.Tag);
				return ["true"];
			}
			dataitems.MoveToEnd = function(data1,ctx) {
				if (data1.length == 0) return [];
			    var item = data1[0];
				if (dataitems.ParentXml == null)
					return [];
				dataitems.ParentXml.appendChild(item);
				dataitems.Items = aa_xpath(dataitems.ParentXml,dataitems.Tag);
				ajaxart.xml.xml_changed(dataitems.ParentXml);				
				
			    return ["true"];
			}
			dataitems.SetNewOrder = function(items,ctx) {
				if (items.length == 0) return [];
				if (!dataitems.ParentXml) return [];
				if (jQuery(dataitems.ParentXml).find('>*').length != items.length) return [];
				jQuery(dataitems.ParentXml).empty().append(items);
				dataitems.Items = aa_xpath(dataitems.ParentXml,dataitems.Tag);
				ajaxart.xml.xml_changed(dataitems.ParentXml);				
				
			    return ["true"];
			}

		}
		init(dataitems);
		dataitems.Refresh(data,context);
		ajaxart.runsubprofiles(data,profile,'Aspect',aa_ctx(context, {_Items: [dataitems]}));
		
		return [dataitems];
	},
ReplaceElement:function (profile, data, context)
	{
		var inputForChanges = ajaxart.getVariable(context,"InputForChanges");
		var elem = aa_first(data,profile, 'Element', context);
		var newElem = aa_first(inputForChanges,profile, 'NewElement', context);
		var mode = aa_text(inputForChanges,profile, 'Mode', context);
	
		if (! ajaxart.isxml(elem) ) return data;  
		if (newElem != null && ! ajaxart.isxml(newElem) ) return data;
		if (newElem == elem) return data;
		var parent = elem.parentNode;

		if (newElem != null) 
		{
		  if (mode == "keep original tag" || aa_tag(elem) == aa_tag(newElem) )
			ajaxart.xml.copyElementContents(elem,newElem);
		  else if (mode == "replace tag")
		  {
			ajaxart.replaceXmlElement(elem,newElem,false);
			elem = newElem;
		  }
		}
		else
			if (parent != null) parent.removeChild(elem);
		
		if (elem != null)
		{
			ajaxart.xml.xml_changed(elem);
			ajaxart.run([elem],profile,'RunOnNewElement',context);
		}
		else
		{
			ajaxart.xml.xml_changed(parent);
		}
		
		return data;
	},
ByTag:function (profile,data,context)
	{
		var tag = aa_text(data,profile, 'Tag', context);
		if (tag == "") return [];
		var xmlForDocument = aa_first(data,profile,'XmlForDocument',context);
		var elem = aa_createElement(xmlForDocument,tag);
		
		if (elem == null) return [];
		var newContext = ajaxart.clone_context(context);
		ajaxart.setVariable(newContext,"InputForChanges",data);
		var changes = ajaxart.subprofiles(profile,'Change');
		for(var i=0;i<changes.length;i++)
			ajaxart.run([elem],changes[i], "", newContext);
		return [elem];
	},
InnerText:function (profile, data, context) {
		var out = [];
		ajaxart.each(data,function(item) {
			if (! ajaxart.isxml(item)) {
				return [];
			}
			if (item.nodeType == 2) return [item];
			var text_node = item.firstChild;
			if (text_node == null)	{
				text_node = item.ownerDocument.createTextNode("");
				item.appendChild(text_node);
			}
			out.push(text_node);
		});
		return out;
	},
Update:function (profile, data, context) {
		var inputForChanges = ajaxart.getVariable(context,"InputForChanges");
		var newValue = ajaxart.run(inputForChanges,profile, 'NewValue', context);
		ajaxart.writevalue(data, newValue);
		return data;
	},
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
	},
XPath:function (profile, original_data, context) {
		var xpath = aa_text(original_data,profile, 'XPath', context);
		var createIfNotExist = aa_bool(original_data,profile, 'CreateIfDoesNotExist', context);
		var def = aa_text(original_data,profile, 'DefaultValue', context);
		var data = ajaxart.run(original_data,profile, 'From', context);
		if (data == null) data = original_data;
		
		if (xpath == "") return data;
		
		if (! ajaxart.isxml(data) || xpath == "") return [];
		var result = ajaxart.xml.xpath(data[0],xpath,createIfNotExist,def);
		return result;
	},
Duplicate:function (profile, data, context) {
		var element = ajaxart.run(data,profile, 'Element', context);
		var inputforChanges = ajaxart.getVariable(context,"InputForChanges");
		var items = ajaxart.run(inputforChanges,profile, 'Items', context);
		var Separator = ajaxart.run(data,profile, 'Separator', context);
		var SeparatorAround = aa_bool(data,profile,'SeparatorAround',context);
		var bindToSeparator = ajaxart.run(data,profile,'BindToSeparator',context);
		
		if (element.length == 0 || element[0].nodeType != 1) return []; 
		var parent = element[0].parentNode;
		if (Separator[0] != null && SeparatorAround)
			{
				var toAdd = ajaxart.xml.clone(Separator);
				if (Separator[0].ajaxart != null) toAdd.ajaxart = Separator[0].ajaxart;
				parent.appendChild(toAdd);
			}
		var local_context = ajaxart.clone_context(context); 
		for (var i=0; i<items.length; i++) {
			var item = items[i];
			var new_item = ajaxart.xml.clone(element);
			ajaxart.setVariable(local_context,"InputForChanges",[item]);
			ajaxart.setVariable(local_context,"DuplicateIndex",[ "" + (i+1)]);
			var changes = ajaxart.subprofiles(profile,'ChangeOnElement');
			ajaxart.each(changes,function(changeProfile) {
				ajaxart.run([new_item],changeProfile, "", local_context);
			});
			if (i==0) {
				var changes = ajaxart.subprofiles(profile,'ChangeOnFirstElement');
				ajaxart.each(changes,function(changeProfile) {
					ajaxart.run([new_item],changeProfile, "", local_context);
				});
			}
			parent.appendChild(new_item);
			if (Separator[0] != null)
				if (i+1 < items.length || SeparatorAround)
				{
					var toAdd = ajaxart.xml.clone(Separator);
					if (Separator[0].ajaxart != null) toAdd.ajaxart = Separator[0].ajaxart;
					parent.appendChild(toAdd);
				}
		}
		parent.removeChild(element[0]);
		return ["true"];
	},
SetAttribute:function (profile, data, context) 
	{
		var inputForChanges = ajaxart.getVariable(context,"InputForChanges");
		var newValue = aa_text(inputForChanges,profile, 'Value', aa_ctx(context,{ _XmlNode: data }));
		var attrName = aa_text(inputForChanges,profile, 'AttributeName', context);
		if (attrName == "") { return; }
		var removeEmptyAttribute = aa_bool(data,profile, 'RemoveEmptyAttribute', context);
		var changed = false;
		
		for(var i=0;i<data.length;i++) {
			var xml = data[i];
			if (!ajaxart.isxml(xml) || xml.nodeType != 1)
				return;
			if (newValue != "" && xml.getAttribute(attrName) == newValue) continue;
			
			if (newValue != "")
				xml.setAttribute(attrName,newValue);
			else { // empty
				if (aa_bool(data,profile, 'RemoveEmptyAttribute', context))
					xml.removeAttribute(attrName);
				else
					xml.setAttribute(attrName,"");
			}
			changed = true;
		}
		if (changed) ajaxart.xml.xml_changed(data[0]);
		
		return [newValue];
	}
});

/*********/



aa_gcs("validation", { 
PassingValidations:function (profile,data,context) 
	{
		var ctrl = aa_first(data,profile,'TopControl',context);
		return aa_frombool( aa_passing_validations(ctrl) );
	}
});

/*********/



aa_gcs("uitext", { 

});

/*********/



aa_gcs("uiaspect", { 
Horizontal:function (profile,data,context)
	  {
		  var cssClass = aa_attach_global_css( aa_text(data,profile,'Css',context), null, 'horiz' );
		  
		  var aspect = { isObject : true };
		  aspect.InitializeContainer = function(initData,ctx)
		  {
			  var cntr = ctx.vars._Cntr[0];
			  cntr.createNewElement = function(item_data,item_aggregator,ctx2)
			  {
				  ctx = aa_merge_ctx(context,ctx);
				  var cntr = ctx.vars._Cntr[0];
				  aa_prepare_calculated_fields_for_item(cntr.Fields,item_data,aa_merge_ctx(context,ctx2));
				  
				  var noInnerTitles = aa_bool(data,profile,'HideInnerTitles',context);
				  var fields = ajaxart_field_getFields(cntr,"property sheet",item_data);
				  var table = jQuery('<table class="aahoriz" cellspacing="0" cellpadding="0"><tbody><tr class="aahoriz_tr"/></tbody></table>')[0];
				  if (aa_bool(data,profile,'FullWidth',context)) jQuery(table).width('100%');
				  var tr = jQuery(table).find('.aahoriz_tr')[0];
				  tr.ItemData = item_data;

				  var spacingStr = aa_text(data,profile,'Spacing',context).replace(/ /g,'');
				  var hasSpacing = spacingStr != "" && spacingStr != "0";
				  var spacing = spacingStr.split(',');
				  var enfore_spacing = aa_bool(data,profile,'EnforceSpacing',context);
				  var minWidths = ajaxart_run_commas(data,profile,'MinWidths',context);
				  var maxWidths = ajaxart_run_commas(data,profile,'MaxWidths',context);
				  var widths = ajaxart_run_commas(data,profile,'Widths',context);

				  if (aa_bool(data,profile,'AlighLastToRight',context))		// divs with floats 
				  {
					  var out = jQuery('<div style="aa_item" />').addClass(cssClass)[0];
					  out.ItemData = item_data;
					  for(var i=0;i<fields.length;i++) {
						  var field= fields[i];
						  var inner = ajaxart_properties_and_sections(cntr,item_aggregator,item_data,profile,ctx2 || ctx,[fields[i]],true);
						  var wrap = jQuery('<div class="aa_float_left"/>')[0];
						  if (i == fields.length-1) wrap = jQuery('<div class="aa_float_right"/>')[0];
						  wrap.appendChild(inner);
						  out.appendChild(wrap);
					  }					  
					  if (item_aggregator) item_aggregator.push(out);
					  return out;
				  }
				  for(var i=fields.length-1;i>=0;i--)
					  if (typeof(fields[i].Hidden) == "function" && aa_tobool(fields[i].Hidden(item_data,ctx)) )
					    fields.splice(i,1);
					  
				  for(var i=0;i<fields.length;i++) {
					  if (i > 0 && hasSpacing) {
					    var space = spacingStr;
					    if (spacing.length > 1 && i <= spacing.length) space = spacing[i-1]; 
					    if (space != "")	{// adding spacing column
						  var gap = document.createElement('td');
						  gap.className = 'aahoriz_space';
						  if (enfore_spacing)
							  gap.style.minWidth = space;
						  else
							  gap.style.width = space;
						  if (cntr.SeparatorControl) {
							  var spaceCntr = cntr.SeparatorControl(item_data,ctx)[0];
							  if (spaceCntr) gap.appendChild(spaceCntr);
						  }
						  tr.appendChild(gap);
					    }
					  }
					  var td = document.createElement('td');
					  td.className = "aahoriz_td";

					  if (noInnerTitles) {
					    var cell_data = ajaxart_field_calc_field_data(fields[i],item_data,ctx2||ctx);
				        ajaxart_field_createCellControl(item_data,cntr,td,"control",fields[i],cell_data,ctx2||ctx);
					  } else {
						  var inner = ajaxart_properties_and_sections(cntr,item_aggregator,item_data,profile,ctx2 || ctx,[fields[i]],true);
						  td.appendChild(inner);
					  }
					  tr.appendChild(td);
					  if (i < minWidths.length) inner.style.minWidth = minWidths[i];
					  if (i < maxWidths.length) inner.style.minWidth = maxWidths[i];
					  if (i < widths.length) td.style.width = inner.style.width = widths[i];
				  }
				  jQuery(table).addClass(cssClass);
				  if (item_aggregator) item_aggregator.push(table);
				  return table;
			  }			  
		  }
		  return [aspect];
	  },
ItemList:function (profile,data,context)
	{
		var aspect = { isObject : true };
		aspect.CreateContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			cntr.Style = aa_first(data,profile,'Style',context);
			var itemlist = cntr.ApiObject = aa_api_object(jQuery(cntr.Style.Html),{cntr: cntr, setItemsOld: null, setItems: null });
			itemlist.newItem = function() { return jQuery('<div/>')[0]; }	// will probably be changed by the style
			itemlist.setItemsOld = function(classOrElement,init_item_func) {
				itemlist.setItems({ itemElement: classOrElement, initItem: init_item_func});
			};
			itemlist.bind = function(evt,callback) {
				jBart.bind(this.cntr,evt,callback);
			}
			itemlist.trigger = function(evt,eventObject) {
				jBart.trigger(this.cntr,evt,eventObject);
			}
			itemlist.setItems = function(settings) {
				var inner = this.itemTemplate = this.getInnerElement(settings.itemElement);
				if (!inner || !inner.parentNode || !settings.initItem) return;

				if (settings.blockElement) {
					settings.initBlock = settings.initBlock || function() {};
					settings.itemsInBlock = settings.itemsInBlock || 12;
					settings.blockTemplate = this.getInnerElement(settings.blockElement);
					if (settings.blockTemplate && settings.blockTemplate.parentNode) {
					  settings.blockParent = settings.blockTemplate.parentNode;
					  if (inner.parentNode == settings.blockTemplate) 
						  settings.itemXPathInBlock = '';
					  else 
						  settings.itemXPathInBlock = ajaxart.xml.xpath_of_node(inner.parentNode,false,true,settings.blockTemplate);
					  
					  settings.itemParentInBlock = function(block) {
						  if (settings.itemXPathInBlock)
						    aa_xpath(block,settings.itemXPathInBlock)[0];
						  else
							return block;
					  }  
					}
				}
				
				jQuery(inner.parentNode).addClass('aa_list aa_listtop aa_cntr_body aa_cntrlist');
				inner.parentNode.removeChild(inner);
				
				this.newItem = function(item_data,ctx) {
					var out = this.itemTemplate.cloneNode(true);
					var cntr = this.cntr;
					
					var item_object = aa_api_object(jQuery(out),{ itemlist: this, data: item_data });
					item_object.name = aa_totext(cntr.ItemName(item_data,cntr.Context))
					if (cntr.ItemImage) {
						cntr.ItemImage.StaticUrl = aa_totext(cntr.ItemImage.Url(item_data,cntr.Context));
						item_object.image = cntr.ItemImage; 
					}
					item_object.setFields = function(classOrElement) {
						var inner = this.getInnerElement(classOrElement);
						if (!inner) return;
						var cntr = ctx.vars._Cntr[0];
						
						var fields = ajaxart_field_getFields(cntr,"table");
						for (var j=0;j<fields.length;j++) {
							var field = fields[j];
						    var cell_data = ajaxart_field_calc_field_data(field,this.data,cntr.Context);
							var field_div = document.createElement('div');
							inner.appendChild(field_div);
						   	ajaxart_field_createCellControl(this.data,cntr,field_div,cntr.CellPresentation,field,cell_data,cntr.Context);
//							ajaxart.databind([field_div],cell_data,context,profile,data);	// for runtime inspect
						}
					}
					item_object.setField = function(classOrElement,fieldId) {
						var inner = this.getInnerElement(classOrElement);
						var cntr = ctx.vars._Cntr[0];
						var field = aa_fieldById(fieldId, cntr.Fields);
						if (!field || !inner) return;
					    var cell_data = ajaxart_field_calc_field_data(field,this.data,cntr.Context);
						var field_div = document.createElement('div');
						inner.appendChild(field_div);
					   	ajaxart_field_createCellControl(this.data,cntr,field_div,cntr.CellPresentation,field,cell_data,cntr.Context);
					}
					settings.initItem(item_object);
					return out;
				}
				if (settings.blockElement) {
					itemlist.PostActions = itemlist.PostActions || [];
					itemlist.PostActions.push({
						PostAction: function(data1,ctx) {
							var top = ajaxart_find_aa_list(cntr);
							var newTop = settings.blockParent;
							jQuery(newTop).addClass('aa_list aa_listtop aa_cntr_body aa_cntrlist');
							jQuery(top).removeClass('aa_list aa_listtop aa_cntr_body aa_cntrlist');

							if (settings.blockTemplate && settings.blockTemplate.parentNode) 
								settings.blockTemplate.parentNode.removeChild(settings.blockTemplate);
							
							var items = jQuery(top).find('>.aa_item');
							var lastblock = null;
							for(var i=0;i<items.length;i++) {
								if (!lastblock || lastblock.jbItemsInBlock == settings.itemsInBlock) {
									lastblock = jQuery(settings.blockTemplate)[0].cloneNode(true);
									jQuery(settings.itemParentInBlock(lastblock)).children().remove();	// remove item clones
									lastblock.jbItemsInBlock = 0;
									newTop.appendChild(lastblock);
									settings.initBlock(lastblock);
								}
								jQuery(settings.itemParentInBlock(lastblock)).append(items[i]);
								lastblock.jbItemsInBlock++;
							}
							jQuery(settings.blockTemplate)
						} 
					});
				}
			}
			aa_apply_style_js(itemlist,cntr.Style);
			jQuery(itemlist.jElem[0]).addClass(aa_attach_global_css(cntr.Style.Css, cntr.Ctrl));
			jQuery(cntr.Ctrl).addClass('aa_has_style');
//			itemlist.jElem.addClass( aa_attach_global_css(cntr.Style.Css) );
			jQuery(cntr.Ctrl).find('>.aa_listtop').replaceWith(itemlist.jElem);
			//grid.jElem.addClass('aa_list aa_listtop aa_cntr_body aa_cntrlist');
			
			return [];
		}
		aspect.InitializeContainer = function(data1,ctx) {
			var cntr = ctx.vars._Cntr[0];
			aa_setMethod(cntr,'ItemName',profile,'ItemName',context); 
			cntr.ItemImage = aa_first(data,profile,'ItemImage',context);
			
			cntr.createNewElement = function(item_data,item_aggregator,ctx2)
		    {
				var cntr = ctx.vars._Cntr[0];
				var out = cntr.ApiObject.newItem(item_data,ctx2);
				jQuery(out).addClass('aa_item');
				out.Cntr = cntr;
//				ajaxart.databind([out],item_data,context,profile.parentNode,data);	// for runtime inspect
				out.ItemData = item_data;
		    	if (item_aggregator) item_aggregator.push(out);
				return out;
		    }
			if (cntr.ApiObject.PostActions) {
				for(var i=0;i<cntr.ApiObject.PostActions.length;i++)
					cntr.RegisterForPostAction(cntr.ApiObject.PostActions[i]);
			}
		}
		return [aspect];	
	},
ShowTextWhenNoItems:function (profile,data,context)
	  {
		  var aspect = {
			  isObject: true,
			  InitializeContainer: function(initData,ctx) {
			  	var cntr = ctx.vars._Cntr[0];
			  	cntr.DescriptionWhenNoItems = function() {
			  		return ajaxart_multilang_run(data,profile,'TextWhenNoItems',context);
			  	}
			  	cntr.NoItemsStyle = aa_first(data,profile,'Style',context);
			  	cntr.RegisterForPostAction(aspect);
			  	aa_register_handler(cntr,'ContainerChange',aspect.Refresh);
		  	  },
		  	  Refresh: function(data1,ctx) {
			  	var cntr = ctx.vars._Cntr[0];
				if (jQuery(cntr.Ctrl).find('>.aatable>.aatable_tbody').length > 0) return;
				var top = ajaxart_find_aa_list(cntr);
				aa_remove(cntr.ElementForNoItems,true);
				jQuery(top).removeClass('aa_noitems');
				
				if (jQuery(top).find('>.aa_item').length == 0) {
					cntr.ElementForNoItems = aa_renderStyleObject(cntr.NoItemsStyle,{
						text: aa_totext(cntr.DescriptionWhenNoItems(data,context))
					},context);
					top.appendChild( cntr.ElementForNoItems );
					jQuery(top).addClass('aa_noitems');
				} 
		  	  },
		  	  PostAction: function(data1,ctx) { aspect.Refresh(data1,ctx); }
		  };
		  return [aspect];
	  },
Group:function (profile,data,context)  // GC of uiaspect.Group
	  {
		  var aspect = { isObject : true };
		  aspect.InitializeContainer = function(initData,ctx)
		  {
			  var cntr = ctx.vars._Cntr[0];
			  cntr.createNewElement = function(item_data,item_aggregator,ctx2)
			  {
				  var cntr = ctx.vars._Cntr[0];
				  cntr.Style = aa_first(data,profile,'Style',context);

				  if (cntr.Style.Html == '') return null;
				  var html = cntr.Style.Html;
				  if (cntr.Style.DynamicDataInHtml == 'true') {
					  var index =0;
					  while (1) {
						  index = html.indexOf('jBartRawData(',index);
						  if (index == -1) break;
						  var end = html.indexOf(')',index);
						  var content = html.substring(index + 'jBartRawData('.length,end);
						  var str = aa_totext(ajaxart.dynamicText(item_data,'%' + content + '%',ctx2));
						  html = html.substring(0,index) + str + html.substring(end+1);
					  }
					  var fields = ajaxart_field_getFields(cntr,"property sheet");
					  while (1) {
						  index = html.indexOf('jBartData(',index);
						  if (index == -1) break;
						  var end = html.indexOf(')',index);
						  var field_id = html.substring(index + 'jBartData('.length,end);
						  var str = "";
						  for(var i=0;i<fields.length;i++) 
							  if (fields[i].Id == field_id) {
								  str = aa_totext(fields[i].FieldData(item_data,ctx2));
								  break;
							  }
						  html = html.substring(0,index) + str + html.substring(end+1);
					  }
				  }
				  var group = aa_api_object(jQuery(html),{data: item_data, cntr: cntr});
				  aa_prepare_calculated_fields_for_item(cntr.Fields,item_data,aa_merge_ctx(context,ctx));
				  aa_defineElemProperties(group,'Fields,addFields,addManualFields');
				  group.Fields = ajaxart_field_getFields(cntr,"property sheet");
				  var set_control = function(classOrElement,notSectionTitle) {
						var inner = this.getInnerElement(classOrElement);
						inner.jbFieldElement = this;
						if (!inner) return;
						var ctx = aa_ctx(this.cntr.Context,{_Field: [this.Field], _Item: this.data });
						var cell_data = ajaxart_field_calc_field_data(this.Field,this.data || [],ctx);
						if (!notSectionTitle && this.Field.AsSection)
						  inner.appendChild( aa_buildSectionControl(this.cntr,this.Field,cell_data,this.data,ctx) );
						else
						  ajaxart_field_createCellControl(this.data,this.cntr,inner,this.cntr.CellPresentation,this.Field,cell_data,ctx);
						if (inner.firstChild)
							aa_element_attached(inner.firstChild);
				  };
				  group.addFields = function(classOrElement,init_field_func) {
					var inner = this.getInnerElement(classOrElement);
					if (!inner || !init_field_func ) return;
					var innerParent = inner.parentNode;
					
					for(var i=0;i<this.Fields.length;i++) {
						var field = this.Fields[i];
						var elem = inner.cloneNode(true);
					    if (field.IsCellHidden && field.IsCellHidden(item_data,ctx)) {
					      if (field.RenderHiddenCell) 
					        elem.style.display = 'none';
					      else continue;  // remove row
					    }
						innerParent.insertBefore(elem,inner);
						aa_element_attached(elem);
						var field_obj = aa_api_object(elem,{ Field: field, data : this.data, 
							Title: field.Title, cntr: this.cntr , HideTitle: field.HideTitle, IsSection: field.AsSection,
							setControl: set_control
						});
						aa_defineElemProperties(field_obj,'setPlaceholderForMoreFields');
						
						field_obj.setPlaceholderForMoreFields = function(init_picklistoptions_func) {
							this.jbOptionsPage = function() {
								if (!this.jbOptionsPageElement) {
									var elem = inner.cloneNode(true);
									optionsFieldObj = aa_api_object(elem,{
										field_obj: this,
										setOptionsPage: function(classOrElement) {
											this.field_obj.jbOptionsPageElement = this.getInnerElement(classOrElement);
										}
									}); 
									init_picklistoptions_func.call(optionsFieldObj,optionsFieldObj);
									if (this.Field.IndentOptionPage) jQuery(elem).addClass('aa_indent');
									jQuery(elem).insertAfter(this);
								}
								return this.jbOptionsPageElement;
							}
						};
						init_field_func.call(field_obj,field_obj);
						if (field.Mandatory) jQuery(elem).addClass("aa_mandatory");
					}
					inner.parentNode.removeChild(inner);
				  }
				  group.addManualFields = function(classPrefix,init_field_func) {
					  for(var i=0;i<this.Fields.length;i++) {
						  var field = this.Fields[i];
						  var place_holders = jQuery(this).find(classPrefix + field.ID);
						  for (var p=0; p<place_holders.length; p++) {
							  var field_obj = aa_api_object(jQuery(place_holders[p]),{ Field: field, data : this.data, Title: field.Title, cntr: this.cntr , HideTitle: field.HideTitle, IsSection: field.AsSection, setControl: set_control});
							  init_field_func(field_obj);
						  }
					  }
				  }
					
				  group.jElem.addClass( aa_attach_global_css(cntr.Style.Css) ).addClass('aa_item');
				  aa_apply_style_js(group,cntr.Style);

				  group.jElem[0].ItemData = item_data;
				  if (item_aggregator) item_aggregator.push(group.jElem[0]);
				  return group.jElem[0];
			  }
		  }
		  return [aspect];
	  },
HeaderFooter:function (profile,data,context)
	{
		var aspect = { isObject : true };
		var init = function(aspect) {
		aspect.HeaderFooterID = aa_text(data,profile, 'Identifier', context);
		aspect.ID = "headerfooter_" + aa_text(data,profile, 'Identifier', context); 
		aspect.refresh = function(data1,ctx)
		{
			var cntr = ctx.vars._Cntr[0]; 
			var items = cntr.Items[0].Items || [];
			var newContext = aa_merge_ctx(context,ctx,{
				HeaderFooterCntr: cntr,
				TotalItemsCount: [items.length],
				FilteredItemsCount: [cntr.FilteredWrappers? cntr.FilteredWrappers.length : items.length]
				});
			newContext.vars.HeaderFooterCntr = ctx.vars._Cntr;
			newContext.vars.DataHolderCntr = ctx.vars.DataHolderCntr || ctx.vars._Cntr;
			newContext.vars.Items = aa_items(cntr);
			var id = aspect.HeaderFooterID;
			var location = aa_text(data,profile, 'Location', newContext);
			var ctrl = ajaxart.run(data,profile,'Control',newContext);
			var cls = 'HeaderFooter_' + id;
			var header = jQuery(aa_find_header(cntr));
			if (header.length == 0) return;
			
			if ( aa_text(data,profile,'RefreshStrategy',context) == 'none'	&& header.find('>.' + cls).length > 0 )
				return;

			if (ctrl.length > 0)
			{
				jQuery(ctrl[0]).addClass(cls);
				
				if (location.indexOf('header') != -1)
				{
					var existing = header.find('>.' + cls);
					if (existing.length > 0)
						existing.replaceWith(ctrl[0]);
					else
					{
						var placeToAdd = header;
						if (placeToAdd.length > 0) 
							placeToAdd[0].appendChild(ctrl[0]);
					}
				}
				if (location.indexOf('footer') != -1)
				{
					var ctrl = ajaxart.run(data,profile,"Control",newContext); // another copy of ctrl
					jQuery(ctrl[0]).addClass('HeaderFooter_' + id);
					var existing = jQuery(aa_find_footer(cntr)).find('>.' + cls);
					if (existing.length > 0)
						existing.replaceWith(ctrl[0]);
					else
					{
						var placeToAdd = jQuery(cntr.Ctrl).find('>.aa_container_footer');
						if (placeToAdd.length > 0) 
							placeToAdd[0].appendChild(ctrl[0]);
					}
				}
			}
			return [];
		}
		aspect.PreAction = aspect.PostAction = function(data1,ctx) { return aspect.refresh(data1,ctx); }
		aspect.InitializeContainer = function(data1,ctx)
		{
			var cntr = ctx.vars._Cntr[0]; 
			var phase = aa_int(data,profile,'Phase',context);
			if (aa_bool(data,profile,'RunAfterPresentation',context))
				cntr.RegisterForPostAction(aspect,phase);
			else
				cntr.RegisterForPreAction(aspect,phase);

			if (aa_text(data,profile,"RefreshStrategy",context) == "item selection")
			{
				function refreshHeaderFooter(selected_elem,ctx2)
				{
		  	    	var newContext = aa_ctx(ctx2,{ 
		  	    			_ItemsOfOperation: selected_elem.ItemData, 
		  	    			_ElemsOfOperation: [selected_elem] });
		  	    		
		  	    	aspect.refresh(data,newContext);
				}
				aa_register_handler(cntr,'Selection', refreshHeaderFooter);
			}
			if (aa_text(data,profile,"RefreshStrategy",context) != "none")
			{
				aa_register_handler(cntr,'ContainerChange', aspect.refresh);
			}
			return [];
		}
		}
		init(aspect);
		return [aspect];
	},
AspectByXtml:function (profile,data,context)
	  {
		  var aspect = { isObject : true };
		  aspect.InitializeContainer = function(initData,ctx)
		  {
			  ajaxart.run(data,profile,'InitializeContainer',aa_merge_ctx(context,ctx));
		  }
		  return [aspect];
	  },
Permissions:function (profile,data,context)
	{
		  var aspect = { isObject : true };
		  var init = function(aspect) {
			  aspect.InitializeContainer = function(data1,ctx) {
				  ctx = aa_merge_ctx(context,ctx);
				  var cntr = ctx.vars._Cntr[0]; 
				  cntr.RegisterForPostAction(aspect);
				  if ( ! aa_bool(cntr.Items[0].Items,profile,'WritableIf',ctx) ) {
					  cntr.ReadOnly = true;
				  }
			  }
			  aspect.PostAction = function(data1,ctx) {
				  ctx = aa_merge_ctx(context,ctx);
				  
				  var cntr = ctx.vars._Cntr[0];
				  if ( ! aa_bool(data,profile,'VisibleIf',ctx) )
					  cntr.Ctrl = aa_first(data,profile,'ControlIfNotVisible',ctx) || document.createElement('div');
			  }
		  }
		  init(aspect);
		  
		  return [aspect];
	},
ItemSelection:function (profile,data,context)
	{
		var aspect = { isObject : true };
		var select =  function(new_selected,selected,method,ctx,focus)
		{
	  	    if (new_selected.length > 0 && (selected.length == 0 || new_selected[0] != selected[0]))
  	  	    {
  	  	    	var inner_cntr = new_selected.parents('.aa_container')[0].Cntr;
	  	    	var top_cntr = ajaxart_topCntr(new_selected);

	  	    	var top_cntr_list = ajaxart_find_aa_list(top_cntr);

  	  	    	jQuery(top_cntr_list).find('.aa_selected_item').removeClass("aa_selected_item " + top_cntr.ItemSelectionCssClass);
	  	    	jQuery(top_cntr_list).find('.aa_selected_itemtext').removeClass("aa_selected_itemtext");

  	  	    	new_selected.addClass("aa_selected_item ");
  	  	    	if (! top_cntr.IgnoreItemSelectionCssClass)
  	  	    	  new_selected.addClass(top_cntr.ItemSelectionCssClass);

  	  	    	new_selected.find('>.aa_text').addClass("aa_selected_itemtext");
  	  	    
  	  	    	if (inner_cntr.SoftSelector)
  	  	    	{
  	  	    		var id = inner_cntr.ItemId(new_selected[0].ItemData,new_selected[0]);
  				    ajaxart.runScriptParam([id],inner_cntr.SoftSelector.WriteValue,ctx);
  	  	    	}

  	  	    	var selectionAction = function()
  	  	    	{
  		  	    	var top_cntr = ctx.vars._Cntr[0];
  		  	    	if (new_selected.parents('.aa_container')[0])
  		  	    		var inner_cntr = new_selected.parents('.aa_container')[0].Cntr;
  		  	    	else
  		  	    		var inner_cntr = top_cntr;
  		  	    	
  	  	    		var newContext = aa_ctx(ctx,{_Cntr: [inner_cntr], _SelectionMethod: [method], _Item : new_selected[0].ItemData
  	  	    		               , _SelectedItem : new_selected[0].ItemData, _Elem : [new_selected[0]] , ControlElement : [new_selected[0]] });
  	  	    		ajaxart.run(new_selected[0].ItemData,profile,'OnSelect',newContext);
  	  	    		
  	  	    		aa_invoke_cntr_handlers(inner_cntr,inner_cntr.Selection,new_selected[0],newContext); // depricated - should be removed
  	  	    		jBart.trigger(inner_cntr,'selection',{selected: new_selected[0], context: newContext, method: method});
  	  	    		
  	  	    		// notify the top container
  	  	    		if (top_cntr != inner_cntr)
  	  	    		{
  	  	  	    		var newContext = aa_ctx(ctx,{_InnerCntr: [inner_cntr], _SelectionMethod: [method], _Item : new_selected[0].ItemData
 	    		               , _SelectedItem : new_selected[0].ItemData, _Elem : [new_selected[0]] , ControlElement : [new_selected[0]] });
  	  	  	    		aa_invoke_cntr_handlers(top_cntr,top_cntr.Selection,new_selected[0],newContext);
  	  	    		}
  	  	    		
  	  	    		var focuson = new_selected;  // aa_item should have tabindex="1"

  	  	    		if (method == "keyboard" || (method == "mouse" && top_cntr.PicklistPopup )) // move popup scroll after arrow down, to make sure element is visible
  	    	  	    {
  		    	  	  	if (ajaxart.controlOfFocus)
  		    	  	  		ajaxart.controlOfFocus.IgnoreBlur = true;
  		    	  	  	focuson.focus();
  		  	  	    	if (ajaxart.controlOfFocus) // give the focus back
  		  	  	    		jQuery(ajaxart.controlOfFocus).focus();
  	    	  	    }
  	    	  	    else if (method == "mouse" || focus) {
  	    	  	    	focuson.focus();
  	    	  	    }

  	  	    		return true;
  	  	    	};
  	  	    	if (method == "keyboard")
  	  	    		aa_delayedRun(selectionAction,ctx,300,0);
  	  	    	else
  	  	    		selectionAction();
  	  	    }
		}
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			cntr.Select = select;
			cntr.DAndDOwner = "";

			cntr.ItemSelectionCssClass = aa_attach_global_css(aa_text(data,profile,'Css',context),cntr);  // allows overriding
			
			if (aa_paramExists(profile,'FilterOnFirstSelected')) {
				cntr.FilterOnFirstSelected = function(data1,ctx) {
				  return aa_frombool( aa_bool(data1,profile,'FilterOnFirstSelected',aa_merge_ctx(context,ctx)) );
				}
			}
			var auto_select = aa_text(data,profile,"AutoSelectFirstItem",ctx);
			var postAction = function(initData,ctx2)
			{
				var cntr = ctx.vars._Cntr[0];
				var elems = jQuery(ajaxart_container_elems(cntr)); //.filter(aa_visible);
				if (ajaxart_itemlist_getSelectedItems(cntr).length > 0) return;	// already one selected
				if (cntr.SoftSelector) return [];
				if (cntr.FilterOnFirstSelected) {
					for(var i=0;i<elems.length;i++) {
						if (aa_tobool(cntr.FilterOnFirstSelected(elems[i].ItemData,ctx2))) {
					      ajaxart_uiaspects_select(jQuery(elems[i]),jQuery([]),"auto",ctx2);
					      return;
						}
					}
				}
				if (aa_bool(data,profile,"KeyboardSupport",ctx))
				{
					var filters = jQuery(aa_find_header(cntr)).find('>.aa_filters');
					if (filters.length > 0)
						ajaxart.ui.bindEvent(filters[0],'keydown',onkeydown);
				}

				if (elems.length > 0) {
					if (auto_select == 'true' || auto_select == 'select and focus')
						ajaxart_uiaspects_select(elems.slice(0,1),jQuery([]),"auto",ctx2);
				    if (auto_select == 'select and focus')
				    	setTimeout(function() {elems.slice(0,1).focus(); },100);//use 100ms to make sure attachment, test: http://localhost/ajaxart/showsamples.html#?Of=xtml_dt.OpenScriptEditor;
				}
				return [];
			}
			ctx.vars._Cntr[0].RegisterForPostAction(ctx._This);
			ajaxart_addScriptParam_js(ctx._This,'PostAction',postAction,ctx);

			var onkeydown = function(e) { 
				e = e || event;
				var elem = (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement);
				var isinput = elem.tagName.toLowerCase() == 'input';
				
				var cntr = ctx.vars._Cntr[0];
				if (aa_bool(data,profile,'IncludeSubContainers',context))
					var cntr_elems = jQuery(cntr.Ctrl).find('.aa_list').slice(0,1).find('.aa_item').filter(aa_visible);
				else
					var cntr_elems = jQuery(ajaxart_container_elems(cntr)).filter(aa_visible);
				var selected = cntr_elems.filter(".aa_selected_item").slice(0,1);
				var new_selected = [];
				if (e.ctrlKey) return true;
	  	        if (e.keyCode == 40) { // down
	  	        	debugger;
	  	        	if (selected.length == 0) // if no selected, pick the first
	  	        		new_selected = jQuery(ajaxart_container_elems(cntr)[0]);
	  	        	else
	  	        		new_selected = cntr.next(selected,cntr);
  	        		while (new_selected.length > 0 && new_selected[0].hidden)
	        			new_selected = cntr.next(new_selected,cntr);
	  	        }
	  	        else if (e.keyCode == 38) { // up
	  	        	new_selected = cntr.prev(selected,cntr);
  	        		while (new_selected.length > 0 && new_selected[0].hidden)
	        			new_selected = cntr.prev(new_selected,cntr);
	  	        }
	  	        else if (e.keyCode == 36 && !isinput) { // home
	  	        	new_selected = cntr_elems.filter('.aa_item').filter(aa_visible).slice(0,1);
	        		while (new_selected.length > 0 && new_selected[0].hidden)
	        			new_selected = cntr.next(new_selected,cntr);
	  	        }
	  	        else if (e.keyCode == 35 && !isinput) { // end
	  	        	new_selected = cntr_elems.filter('.aa_item').filter(aa_visible).slice(-1);
	        		while (new_selected.length > 0 && new_selected[0].hidden)
	        			new_selected = cntr.prev(new_selected,cntr);
	  	        }
	  	        else if (e.keyCode == 34 || e.keyCode == 63277)  // page down
	  	        {
	  	        	var last_valid_selection = selected; 
	  	        	new_selected = selected;
	  	        	var times = 0;
	  	        	while ( cntr.next(new_selected,cntr).length > 0 && (new_selected[0].hidden || times < 3))
	  	        	{
	  	        		if (! new_selected[0].hidden)
	  	        		{
	  	        			times++;
	  	        			last_valid_selection = new_selected;
	  	        		}
 	        			new_selected = cntr.next(new_selected,cntr);
	  	        	}
	  	        	if (new_selected.length == 0)
	  	        		new_selected = last_valid_selection;
	  	        }
	  	        else if (e.keyCode == 33 || e.keyCode == 63276)  // page up
	  	  	    {
	  	        	var last_valid_selection = selected; 
	  	        	new_selected = selected;
	  	        	var times = 0;
	  	        	while ( cntr.prev(new_selected,cntr).length > 0 && (new_selected[0].hidden || times < 3))
	  	        	{
	  	        		if (! new_selected[0].hidden)
	  	        		{
	  	        			times++;
	  	        			last_valid_selection = new_selected;
	  	        		}
 	        			new_selected = cntr.prev(new_selected,cntr);
	  	        	}
	  	        	if (new_selected.length == 0)
	  	        		new_selected = last_valid_selection;
	  	  	    }
	  	        else
	  	        	return true;
	  	  	    
	  	  	    if (new_selected.length > 0 && (selected.length == 0 || new_selected[0] != selected[0]) ) {
	  	  	    	ajaxart_uiaspects_select(new_selected,selected,"keyboard",ctx);
	  	  	    	return aa_stop_prop(e);
	  	  	    }
		  }
		  var mouse_select = function(e) {
			    var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  ); 
			    if (!aa_intest && (elem.parents('body').length == 0 || elem.filter(aa_visible).length == 0 || elem.hasClass('aa_not_selectable') || elem.parents('.aa_not_selectable').length > 0)) return;
			    if (elem.hasClass('hitarea')) return true;
			    
			  	var cntr = ctx.vars._Cntr[0];
			  	if (cntr.DAndDOwner != "" ) return true;
			  	if (! cntr.PicklistPopup)
			  		ajaxart.controlOfFocus = null;
			  	if( e.button == 2 ) return true;

			  	var new_selected = jQuery();
			    if (elem.hasClass('aa_item'))
			    	new_selected = elem;
			    else {
			    	// maybe we are uiaspect.List and have a group inside aa_item  [ a group has aa_item in itself ]
			    	var optionItems = elem.parents(".aa_item").get();
			    	for(var i=0;i<optionItems.length;i++) {
			    		var item = optionItems[i];
			    		var itemCntr = jQuery(item).parents('.aa_container')[0].Cntr;
			    		if (itemCntr == cntr) {
			    		  new_selected = jQuery(item);
			    		  break;
			    		}
			    	}
			    }
			    if (new_selected.length > 0)
	  	  	    	ajaxart_uiaspects_select(new_selected,jQuery(),"mouse",ctx);
	  	  	    return true;
		  }

		  // aa list may be replaced in cntrs - table should work in container generation
		  var cntr_list = ajaxart_find_aa_list(cntr);
		  if (!cntr.SelectionEnabled) // do not register twice
		  {
			  var mouseSupport = aa_text(data,profile,'MouseSupport',context);
			  if (mouseSupport == 'mouse click') {
				    ajaxart.ui.bindEvent(cntr_list,'click', mouse_select);
			  }
			  else if (mouseSupport != 'none'){
			    ajaxart.ui.bindEvent(cntr_list,'mousedown', mouse_select);
			    ajaxart.ui.bindEvent(cntr_list,'touchstart', mouse_select);
			  }
			  cntr.SelectionKeydown = onkeydown;
			  if (aa_bool(data,profile,"KeyboardSupport",ctx))
				  ajaxart.ui.bindEvent(cntr_list,'keydown',onkeydown);
//			  cntr_list.onkeydown = function(e) - for Yaron to play
//			  { 
//				  if (e.keyCode == 38 || e.keyCode == 40)
//					  return aa_stop_prop(e);
//				  return true;
//			  }
		  }
		  cntr.SelectionEnabled = true;

		  var selector = aa_first(data,profile,"Selector",ctx);
		  if (selector != null)
		  {
			  cntr.SoftSelector = selector;
		  }
		}
		var make_selected_visible = function(cntr) {}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);

		return [aspect];
	},
PropertySheet:function (profile,data,context)
	  {
		  var aspect = { isObject : true };
		  var initializeContainer = function(initData,ctx)
		  {
			  var cntr = ctx.vars._Cntr[0];
			  cntr.createNewElement = function(item_data,item_aggregator,ctx2)
			  {
				  var cntr = ctx.vars._Cntr[0];
				  aa_prepare_calculated_fields_for_item(cntr.Fields,item_data,aa_merge_ctx(context,ctx2));

				  var fields = ajaxart_field_getFields(cntr,"property sheet");
				  var space = aa_text(data,profile,'Space',context),header = aa_text(data,profile,'HeaderSpace',context),footer=aa_text(data,profile,'FooterSpace',context);
				  
				  var full_width = aa_bool(data,profile,'FullWidth',context);
				  var width = aa_text(data,profile,'PropertiesWidth',context);
				  var result = ajaxart_properties_and_sections(cntr,item_aggregator,item_data,profile,ctx2 || ctx,fields,space,full_width,width,header,footer);
				  jQuery(result).addClass('aa_item');
				  
				  if (item_aggregator) item_aggregator.push(result);
				  return result;
			  };
		  }
		  ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		  return [aspect];
	  },
ScrollItems:function (profile,data,context)
	  {
		var aspect = { isObject : true };
		aspect.InitializeContainer = function(data1,ctx) {
			var cntr = ctx.vars._Cntr[0];
			
			cntr.ScrollStyle = aa_first(data,profile,'Style',context);
			cntr.ScrollWidth = aa_first(data,profile,'Width',context);
			cntr.ScrollHeight = aa_first(data,profile,'Height',context);
			
			var cntrBody = ajaxart_find_aa_list(cntr);
			var topDiv = cntrBody;
			
			while (topDiv && ",table,tbody,tr,td,".indexOf(topDiv.tagName.toLowerCase()) > -1) {
				topDiv = topDiv.parentNode;
			}
				
			var topClass = aa_attach_global_css(cntr.ScrollStyle.Css,context);
			
			cntr.ScrollObject = aa_renderStyleObject(cntr.ScrollStyle,{
				ScrollHeight: cntr.ScrollHeight,
				ScrollWidth: cntr.ScrollWidth,
				fixSize: function(element) {
				  if (cntr.ScrollHeight) cntr.ScrollHeight.apply(element);
				  if (cntr.ScrollWidth) cntr.ScrollWidth.apply(element);
				},
				init: function(settings) {
					this.refresh = settings.refresh;
					this.requiresDivWrapper = settings.requiresDivWrapper;
				},
				cntrBody: cntrBody,
				topDiv: topDiv
			},ctx);
			var scroll = cntr.ScrollObject; 

			if (cntr.ScrollHeight) 
				jBart.bind(cntr.ScrollHeight,'update',function() { cntr.ScrollObject.refresh(); });
			
			if (cntr.ScrollWidth) 
				jBart.bind(cntr.ScrollWidth,'update',function() { cntr.ScrollObject.refresh(); });
			
			if (cntr.ScrollObject.requiresDivWrapper) {
				aa_addOnAttach(cntrBody,function() {
					var parent = scroll.topDiv.parentNode;
					scroll.divWrapper = jQuery('<div class="aa_scroll_wrapper"/>').addClass(topClass).append(scroll.topDiv)[0];
					parent.appendChild(scroll.divWrapper);
					cntr.ScrollObject.refresh();	
				});
			} else {
				jQuery(topDiv).addClass(topClass);
				cntr.ScrollObject.refresh();
			}
		}
		return [aspect];
	  }
});

/*********/



aa_gcs("uiaction", { 
SetText:function (profile, data, context)
	{
	    var text = aa_text(data,profile,'Text',context);
	    var mode = aa_text(data,profile,'Mode',context);
		
		var elements = ajaxart.getControlElement(context);
		if (elements.length == 0) return [];
	    var element = elements[0];
	    
	    if (jQuery(element).hasClass('aa_text')) { element.innerHTML = text; return;}
	    if (mode == "CharByChar")
	    {
	    	element.value = '';
	    	element.setAttribute('value','');
	    	for(var i=0;i<text.length;i++)
	    	{
	    		xFireEvent(element, 'keydown', {keyCode: text.charCodeAt(i), CharByChar: true}, context.vars.InTest != null);
	    		xFireEvent(element, 'keyup', {keyCode: text.charCodeAt(i), CharByChar: true}, context.vars.InTest != null);
	    	}
	    	return;
	    }

		var tag = element.tagName.toLowerCase(); 
		if (element.setTinyMCEText) element.setTinyMCEText(text);
		
		if (tag == "textarea" )
			element.value = text;
		else if (tag == "input")
		{
			if (mode == "ReplaceAll")
			{
				element.setAttribute("value",text);
				element.value = text;
			}
			else if (mode == "InsertAtCaret")
			{
                if ('selectionStart' in element) // W3C
                    element.value = element.value.substr(0, element.selectionStart) + text + element.value.substr(element.selectionEnd, element.value.length);
                else if (document.selection) { // IE
                    element.focus();
                    document.selection.createRange().text = text;
                }				
			}
			else if (mode == "InsertAtEnd")
			{
				element.value = element.value + text;
				element.setAttribute("value",element.value);
			}
		} else if (jQuery(element).hasClass("button_hyperlink_image"))
			{
				ajaxart.each(jQuery(element).find(">a"), function(a) { 
					jQuery(a).text(text); 
				} );
			}
			else if (tag == "div" || tag=="span" || tag=="button" || tag =="a")
				element.innerHTML = text;
		
		aa_inuiaction = true;
		
		if (! aa_bool(data,profile,'DoNotFireEvents',context))
		{
			xFireEvent(element, 'keydown');
			xFireEvent(element, 'keyup');
		}

		if (! aa_bool(data,profile,'StayInControl',context))
			xFireEvent(element, 'blur', null);

		aa_inuiaction = false;
		return [];
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
   },
Show:function (profile, data, context) 
	{
		var elements = ajaxart.getControlElement(context);
		
		for(var i=0;i<elements.length;i++) 
		  elements[i].style.display = 'block';
		return [];
	},
FindFirstInput:function (profile, data, context)
	{
		var elements = ajaxart.getControlElement(context);
		if (elements.length == 0) return [];
		var inp = jQuery(elements[0]).find('input, textarea, .ok_button');
		if (inp.length > 0) return [ inp[0] ];
		return [];
	},
Focus:function (profile, data, context)
	{
	    var elems = ajaxart.getControlElement(context);
	    if (elems.length == 0) return [];
	    var elem = elems[0];
	    var timeout = 1;
	    if (ajaxart.isSafari) timeout = 100;
	    
	    function dofocus(elem) {
	    	if (!elem.tabIndex || elem.tabIndex == -1) elem.tabIndex=1;
	    	if (elem.SetFocus) return elem.SetFocus();
	    	if (aa_bool(data,profile,'OnFirstInput',context)) {
	    		if (elem.tagName.toLowerCase().indexOf('input,textarea') != -1)
	    			elem.focus();
	    		else {
	    			var e2 = jQuery(elem).find(':input')[0];
	    			if (e2) e2.focus();
	    		}
	    	}
	    	else 
	    		elem.focus();
	    }
	    
	    if (jQuery(elem).parents("body").length == 0) { //detached
	    	var set_focus = function(e) {  setTimeout(function() { 
	    		if(! ajaxart.isattached(e)) return;
	    		dofocus(e);
	    	} ,timeout); }
	    	set_focus(elem);
	    }
	    else{
    		dofocus(elem);
	    }
	    
	    return [];
   },
Refresh:function (profile, data, context) 
	{
		var elements = ajaxart.getControlElement(context);
		for(var i=0;i<elements.length;i++)
		{
			var newControl = jBart.utils.refresh(elements[i]);
		
			ajaxart.run(data,profile,'RunOnControl',aa_ctx(context,{ControlElement: [newControl]}));
		}
		return ["true"];
	},
AddClass:function (profile, data, context)
	{
		var classes = aa_text(data,profile,'Cls',context);
		var element = ajaxart.getControlElement(context,true);
		jQuery(element).addClass(classes);
		return data;
	},
FilterContainer:function (profile, data, context)
	{
		var cntr_field_id = aa_text(data,profile,'Cntr',context),cntr=null;
		var xml = aa_first(data,profile,'FilterQueryXml',context);
		if (!ajaxart.isxml(xml)) return;
		
		if (cntr_field_id == '') 
			cntr = (context.vars.HeaderFooterCntr || context.vars._Cntr)[0];
		else if (cntr_field_id.indexOf('Page_') == 0) {
			var elem = jQuery('.'+cntr_field_id)[0];
			if (elem) cntr = elem.Cntr; 
		}
		else if (cntr_field_id.indexOf('fld_') == 0) {
			var elem = jQuery('.'+cntr_field_id)[0];
			if (elem) cntr = elem.Cntr; 
		}
		if (!cntr) return;
		
		cntr.DataHolder = cntr.DataHolder || aa_createDataHolderFromCntr(cntr,context);
		cntr.DataHolder.UserDataView.Filters = aa_cntr_filterXml2Objects(cntr,xml);
		aa_recalc_filters_and_refresh(cntr,data);
	},
ButtonClick:function (profile, data, context) 
	{
		var runOn = context.vars.ControlElement[0];
		if (!runOn) return;
		var jRunOn = jQuery(runOn);
		if (jRunOn.hasClass('aa_clickable') || jRunOn.hasClass('button_hyperlink_image') || jRunOn.hasClass('aa_button_clickable') && !runOn.jbart_click_behavior) 
			aa_fire_event(runOn,'click',context,{});
		else {
		  aa_fire_event(runOn,'mousedown',context,{});
		  aa_fire_event(runOn,'mouseup',context,{});
		}
	},
HasClass:function (profile, data, context)
	{
		var cls = aa_text(data,profile,'Cls',context);
		var elems = ajaxart.getControlElement(context);
		if (elems.length == 0) return [];
		if ( jQuery(elems[0]).hasClass(cls) ) return ["true"];
		return [];
	},
RunUiActions:function (profile, data, context)
   {
	    var actions = ajaxart.subprofiles(profile,'Action');
		var newContext = ajaxart.clone_context(context);
	    ajaxart.setVariable(newContext,"ControlElement",data);
	    var inp = ajaxart.getVariable(context,"InputForChanges");
	    for(var i=0;i<actions.length;i++)
	    	var subresult = ajaxart.run(inp,actions[i],"",newContext);
	    
	    return data;
   },
Hide:function (profile, data, context) 
	{
		var elem = ajaxart.getControlElement(context)[0];
		if (ajaxart.ishtml(elem))
		{
			elem.display = 'none';
			elem.style.display = 'none';
		}
		return ["true"];
	},
HideMessageBarOnUserClick:function (profile, data, context)
   {
	   var clean_message_bars = function() {
		   var messageBars = ajaxart.getControlElement(context);
		   for (i in messageBars)
			   jQuery(messageBars[i]).hide();
		   ajaxart_capture_onclick(null);
	   }
	   setTimeout(function() {ajaxart_capture_onclick(clean_message_bars)},1);
	   return ["true"];
   },
GoUp:function (profile, data, params)
	{
	    var topHtmlTag = aa_text(data,profile,'TopHtmlTag',params).toLowerCase();
	    var topId = aa_text(data,profile,'TopId',params);
	    topId = topId.replace(/ /g, "_");
	    var topClass = aa_text(data,profile,'TopClass',params);
	    
	    var elems = ajaxart.getControlElement(params);
	    if (! ajaxart.ishtml(elems)) return [];
	    var elem = elems[0];
	    while (elem != null && elem.nodeType != 4) {
	    	if (topClass != "" && jQuery(elem).hasClass(topClass)) return [elem];
	    	if (topId != "" && elem.id == topId) return [elem];
	    	if (typeof(elem.tagName) != "undefined" && elem.tagName.toLowerCase() == topHtmlTag) return [elem];
	    	elem = elem.parentNode;
	    }
	    
	    return [];
	}
});

/*********/



aa_gcs("ui", { 
Image:function (profile,data,context)
  {
	var src = aa_text(data,profile,'Source',context);
	var title = ajaxart_multilang_text(aa_text(data,profile,'Title',context),context);
	var width = aa_text(data,profile,'Width',context);
	var height = aa_text(data,profile,'Height',context);
	var out = jQuery('<img />')[0]; 
	out.setAttribute("src",src);
	out.setAttribute("title",title);
	if (height != "")
	  out.setAttribute('height',height);
	if (width != "") 
		out.setAttribute('width',width);
	if (ajaxart.subprofiles(profile,'OnClick') != null)
		out.className = 'clickable';
	jQuery(out).click(function() {
		if (window.aa_incapture) return;
		ajaxart.run(data,profile,"OnClick",aa_ctx(context,{ControlElement: [this]}));
	});
	return [out];
  },
ItemList:function (profile,data,context,override_items,override_aspects)
	 	{
		    var id = aa_string2id(aa_text(data,profile,'ID',context));
	 		var cntr = { ID: [id] , isObject: true }
	 		
		    var newcontext = aa_ctx(context,{_ParentCntr: context.vars._Cntr, _Cntr : [cntr]} );
	 		if (aa_bool(data,profile,'DataHolderCntr',context))
	 			newcontext = aa_ctx(newcontext,{DataHolderCntr: [cntr]});
	 		
	 		var data_items;
	 		if (aa_paramExists(profile,'DataHolder') && !override_items)
	 		{
	 			cntr.DataHolder = dataholder = aa_first(data,profile,'DataHolder',newcontext);
	 			cntr.Fields = dataholder.Fields;
	 			cntr.Items = data_items = [{isObject: true, Items: dataholder.Wrappers}];
	 			newcontext = aa_ctx(newcontext,{DataHolderCntr: [cntr], _Items: data_items});
	 		}
	 		else
	 		{
	 			data_items = override_items || ajaxart.run(data,profile,'Items',newcontext);
	 			if (!data_items[0]) data_items = [{Items:[]}];
	 			cntr.Items = data_items;
	 			ajaxart.setVariable(newcontext,"_Items",data_items);
	 			var ctx4 = aa_ctx(newcontext,{_FormulaInput: data_items[0].Items});
			    var fields = ajaxart.runsubprofiles(data,profile,'Field',ctx4);
			    ajaxart.concat(fields,ajaxart.run(data,profile,'Fields',ctx4));
	 			
	 			cntr.Fields = fields;
	 		}
			if (override_aspects)
		      var aspects = override_aspects;
			else {
			  var aspects = ajaxart.run(data,profile,'Presentation',newcontext);
			  aspects = aspects.concat(ajaxart.runsubprofiles(data,profile,'Aspect',newcontext));
			}
			for(var i=0;i<cntr.Fields.length;i++)
				if (cntr.Fields[i].CntrAspects)
				{
					var fld_aspects = cntr.Fields[i].CntrAspects;
					for(var j=0;j<fld_aspects.length;j++)
						aspects.push(fld_aspects[j].GetContent(data,newcontext)[0]);
				}

		    // takeover - used by GroupBy aspect to duplicate container in groups
		    var orignalItemListFunc = function(newcontext) { return function(override_items,override_aspects) {
		    	return ajaxart.gcs.ui.ItemList(profile,data,newcontext,override_items,override_aspects);
		    }}
		    for(var i=0;i<aspects.length;i++)
		    	if (aspects[i].takeOver != null)
			    	return aspects[i].takeOver(aspects,data_items,orignalItemListFunc(newcontext),newcontext);
		    
	 		cntr.Ctrl = jQuery('<div class="aa_container aa_inherit_selection"><div class="aa_container_header"/><ul style="list-style: none; padding:0; white-space: normal;" class="aa_list aa_listtop aa_cntr_body"/><div class="aa_container_footer"/></div>')[0];
	 		if (id != '')
	 			jQuery(cntr.Ctrl).addClass('Page_'+id);
		    // use the aspects to create the container - they can replace the default one.
		    for(var i=0;i<aspects.length;i++)
		    	ajaxart.runScriptParam(data,aspects[i].CreateContainer,newcontext);
		    cntr.Ctrl.Cntr = cntr;
		    ajaxart.databind([cntr.Ctrl],data,context,profile);
		    
			cntr.Items = data_items;
		    cntr.PostActors = [];cntr.PreActors = [];
		    cntr.RegisterForPostAction = function(aspect,phase) { cntr.PostActors.push({ phase: phase || 0, aspect: aspect}); }
		    cntr.RegisterForPreAction = function(aspect,phase) { cntr.PreActors.push({ phase: phase || 0, aspect: aspect}); }
		    cntr.Aspects = aspects;
			cntr.XtmlSource = [ {isObject :true, script :profile, input: data, context :context }];
			
			cntr.createNewElement = function(item_data,item_aggregator)
		    {
				var li = document.createElement('li');
				li.className = "aa_item";
				li.ItemData = item_data;
				ajaxart_add_foucs_place(li);
		    	if (item_aggregator)
		    		item_aggregator.push(li);
				return li;
		    };
		    cntr.insertNewElement = function(elem,parent)
		    {
		    	var list = ajaxart_find_list_under_element(parent);
		    	if (list != null)
		    		list.appendChild(elem);
		    };
		    cntr.next = function(elem,cntr) { return ajaxart_tree_next(elem,cntr) };
		    cntr.prev = function(elem,cntr) { return ajaxart_tree_prev(elem,cntr) };
		    cntr.ElemsOfOperation = function() 
		    { 
		    	if (this.GetMultiSelectedItems)
		    		return this.GetMultiSelectedItems();
		    	return jQuery(this.Ctrl).find('.aa_selected_item').slice(0,1).get(); 
		    }
		    cntr.ItemsOfOperation = function() 
		    { 
		    	var elems = this.ElemsOfOperation();
		    	var itemsData = [];
		    	for(var i in elems)
		    		itemsData = itemsData.concat(elems[i].ItemData);

		    	return itemsData;
		    }
		    cntr.Context = newcontext;

		    aa_setMethod(cntr,'Operations',profile,'Operations',context);

		    for(var i=0;i<cntr.Aspects.length;i++) {
		    	try {
		    		ajaxart_runMethod(data,cntr.Aspects[i],'InitializeContainer',newcontext);
		    	} catch(e) { 
		    		ajaxart.log("error in aspect " + cntr.Aspects[i].XtmlSource[0].script.getAttribute('t') + ": " + e.message + (e.stack || ''),"error"); }
		    }

		    cntr.PreActors.sort(function(a,b) { return a.phase > b.phase ? 1 : -1; });
		    cntr.PostActors.sort(function(a,b) { return a.phase > b.phase ? 1 : -1; });

		    for(var i=0;i<cntr.PreActors.length;i++) {
		    	ajaxart.trycatch( function() {
		    		ajaxart_runMethod(data,cntr.PreActors[i].aspect,'PreAction',newcontext);
			    	 //ajaxart.runScriptParam([],cntr.PreActors[i].aspect.PreAction,cntr.Context);
		    	}, function(e) { ajaxart.logException(e); });
		    }

		    if (cntr.DataHolder)
		    	cntr.DataHolder.UserDataView.Sort = cntr.Dataview_PreSort || [];
		    aa_recalc_filters_and_refresh(cntr,data,newcontext,false);
			if (cntr.SoftSelector) // auto select, e.g from url
			{
	  	    	var top_cntr_list = ajaxart_find_aa_list(cntr);
	  	    	var all_elems = jQuery(top_cntr_list).find('.aa_item').get();

				var key_to_select = ajaxart.totext_array(ajaxart.runScriptParam(data,cntr.SoftSelector.GetValue,cntr.Context));
				for(var i=0;i<all_elems.length;i++)
					if (cntr.ItemId && key_to_select != "" && cntr.ItemId(all_elems[i].ItemData,all_elems[i]) == key_to_select) 
						ajaxart_uiaspects_select(jQuery(all_elems[i]),jQuery([]),"auto",cntr.Context);
			}

		    return [cntr.Ctrl];
	 	},
RunInControlContext:function (profile,data,context)
  {
  	var elements = ajaxart.getVariable(context,"ControlElement");
  	var mode = aa_text(data,profile,'Mode',context);
  	var out = [];
  	ajaxart.each(elements,function(element) {
   	  var elem_context = element["ajaxart"];
	  if (elem_context == null) {
		  ajaxart.log("RunInControlContext - control has no databind","warning")
		  return [];
	  }
	  var newContext = elem_context.params;
	  if (mode == 'copy control variables')
	  {
		  newContext = ajaxart.clone_context(context);
		  for(i in elem_context.params.vars)
			  newContext.vars[i] = elem_context.params.vars[i]; 
	  }
	  ajaxart.setVariable(newContext,"ControlElement",[element]);
	  ajaxart.concat(out,ajaxart.run(elem_context.data,profile,'Item',newContext));
 	});
  	return out;
  },
RunJavaScript:function (profile, data, params) {
  	ajaxart.gcs.ui.DataFromJavaScript(profile, data, params);
  	return ["true"];
  },
ExecJQuery:function (profile,data,params)
  {
		var expression = aa_text(data,profile,'Expression',params);
		var controls = data;
		if (controls.length == 0 || !ajaxart.ishtml(controls[0]))
			controls = ajaxart.getControlElement(params);

		ajaxart.each(controls, function(item) {
			if (!ajaxart.ishtml(item)) return;
			var exp = "jQuery(item)" + expression + ";";
			try {
				var $ = jQuery;
				eval(exp);
			}
			catch (e) { ajaxart.log("failed to run jQuery exp: "+ exp +" :" +e.message,"error"); }
		});
		return ["true"];
  },
ButtonAsHyperlink:function (profile,data,context)
	{
		var btnContext = context.vars.ButtonContext[0];
		var out = null;;
		var image = aa_totext(btnContext.Image);
		var text = aa_totext(btnContext.Text);
		var tooltip = aa_totext(btnContext.Tooltip);
		var textInlineCss = aa_text(data,profile,'TextInlineCss',context); 
		var imageInlineCss = aa_text(data,profile,'ImageInlineCss',context); 
			
		if (image == "") { // no image
			out = jQuery('<a class="button_hyperlink" style="'+textInlineCss+'" title="'+tooltip+'" href="#"/>')[0];
			out.innerHTML = text;
		}
		else {
			out = jQuery('<span class="button_hyperlink_image"/>')[0];
			var img = jQuery('<img src="'+image+'" style="'+imageInlineCss+'" />')[0];
			var alink = jQuery('<a href="#" style="'+textInlineCss+'" onclick="return false;" class="button_hyperlink" title="'+tooltip+'"/>')[0];
			alink.innerHTML = text;
			out.appendChild(img);
			out.appendChild(alink);
		}
		var initEvents = function(out) {
			out.onclick = function(e) {
			  if (window.aa_incapture) return;
			  e = e || event;
			  if (aa_incapture) return false;
			  ajaxart_runMethod(data,context.vars.ButtonContext[0],'OnClick',aa_ctx(context,{ControlElement: [out]}));
			  ajaxart_stop_event_propogation(e);
			  return false;
			}
			jQuery(out).hover(function() {
			  ajaxart_runMethod(data,context.vars.ButtonContext[0],'OnHover',context);
			}, function() {} ); 
		}
		initEvents(out);
		return [out];
	},
OnKeyDown:function (profile,data,context)
  {
	  var control = context.vars.ControlElement[0];
	  control.onkeydown = function(e) {
		e = e || event;
        var newContext = ajaxart.clone_context(context);
    	ajaxart.ui.applyKeyboardEvent(e,newContext);
    	var elem = jQuery( (typeof(event)== 'undefined')? e.target : event.srcElement  );
    	if (elem[0] && elem[0].tagName.toLowerCase() == 'textarea')
    	  newContext.vars.EventTargetIsTextArea = ["true"];
    	else 
    	  newContext.vars.EventTargetIsTextArea = [];
    	
    	ajaxart.run(data,profile,'Action',newContext);
    	return true;
	  }
	  return ["true"];
  },
ScreenSize:function (profile,data,context)
  {
	  var axis = aa_text(data,profile,'Axis',context);
	  var margin = aa_int(data,profile,'Margin',context);
	  
	  var num=0;
	  if (axis == 'height')
	    num = window.innerHeight || (document.documentElement.clientHeight || document.body.clientHeight);
	  else
		num = window.innerWidth || (document.documentElement.clientWidth || document.body.clientWidth);

	  num -= margin;
	  
	  if ( aa_bool(data,profile,'AsHtmlString',context))
		  return ["" + num + "px"];
	  
	  return [num];
  },
SetCssProperty:function (profile,data,params)
  {
 	 var property = aa_text(data,profile,'Property',params);
 	 var value = aa_text(data,profile,'Value',params);
 	 if (property == "" || !ajaxart.ishtml(data[0]) ) return data;
 	 jQuery(data[0]).css(property,value);
 	 return data;
// 	 data[0].style[property] = value;
  },
Document:function (profile,data,context)
	 	{
	 		// assumption: ui.Document is not called in batch
		    var id = aa_string2id(aa_text(data,profile,'ID',context));
		    var fields = ajaxart.runsubprofiles(data,profile,'Field',context);
		    ajaxart.concat(fields,ajaxart.run(data,profile,'Fields',context));
		    
			var dataitems = ajaxart.run(data,profile,'Item',context);
			
			var operationsFunc = function(data1,ctx) { return ajaxart.run(data1,profile,'Operations',aa_merge_ctx(context,ctx)); }
			var aspectsFunc = function(data1,ctx) {
				var newContext = aa_merge_ctx(context,ctx);
				var cntr = ctx.vars._Cntr[0];
				var fields = cntr.Fields;
				
			    var aspects = ajaxart.run(data,profile,'Presentation',newContext);
			    ajaxart.concat(aspects,ajaxart.runsubprofiles(data,profile,'Aspect',newContext));
				for(var i=0;i<fields.length;i++)
				  if (fields[i].CntrAspects)
					aspects = aspects.concat(fields[i].CntrAspects);
				return aspects;
			}
			// TODO: change aspectsFunc to be an array and not a function [ make sure all aspects are written correctly ]
	 		var out = aa_uidocument(data,id,dataitems,fields,aspectsFunc,operationsFunc,context);
	 		ajaxart.databind([out],data,context,profile);
	 		out.Cntr.XtmlSource = [ {isObject :true, script :profile, input: data, context :context }];
	 		
	 		return [out];
	 	},
AttachGlobalCss:function (profile,data,context)
  {
	  return [ aa_attach_global_css(aa_text(data,profile,'Css',context),null,aa_text(data,profile,'Name',context) )];
  },
Text:function (profile,data,context)
  {
	  var text = aa_text(data,profile,'Text',context);
	  var style = aa_text(data,profile,'Style',context);
	  var multiLang = aa_bool(data,profile,'MultiLang',context);
	  
	  if (multiLang)
	  	text = aa_text([text],ajaxart.parsexml('<s t="text.MultiLang" Pattern="%%" Dynamic="true"/>'),'',context);
	  if (! aa_bool(data,profile,'HtmlContents',context))
		text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
      var span = document.createElement("span");
 	  if (style != "")
 		 aa_setCssText(span,style);
 	  span.className = "ajaxart_text";
 	  span.innerHTML = text;
 	  
 	  var hint = aa_text(data,profile,'Hint',context);
 	  if (hint != "") span.setAttribute('title',hint);
 	  
 	  return [span];
  },
ControlWithAction:function (profile,data,context)
  {
	  ajaxart.run(data,profile,'RunBeforeControl',context);
	  var out = ajaxart.run(data,profile,'Control',context);
	  var newcontext = aa_ctx(context, { ControlElement: out, _ElemsOfOperation: out});
	  if (aa_bool(data,profile,'RunAfterControlWithTimer',context)) {
	    var timeout = 1;
	    if (ajaxart.isSafari) timeout = 100;
	    setTimeout(function() { ajaxart.run(data,profile,'RunAfterControl',newcontext); }  ,timeout); 
	  }
	  else
		  ajaxart.run(data,profile,'RunAfterControl',newcontext);
	  return out;
  },
ElementOfClass:function (profile, data, params) {
	  	var cls = aa_text(data,profile,'Cls',params);
	  	var onlyFirst = aa_bool(data,profile,'OnlyFirst',params);
	  	var down = ( aa_text(data,profile,'Direction',params) == 'down');
	  	
	  	var child;
	  	if (!ajaxart.ishtml(data)) { ajaxart.log("ElementOfClass - input is not html","error"); return []; }
	  	var index = 0;
	  	var elements_queue = [];
	  	if (down)
	  		elements_queue.push(data[0]);
	  	else {
	  		if (data[0].parentNode != null)
	  			elements_queue.push(data[0].parentNode);
	  	}
	  	
	  	var out = [];
	  	while (index < elements_queue.length) {
	  		var element = elements_queue[index];
	  		index++;
	 		
	  		if (jQuery.inArray( cls, element.className.split(/\s+/) ) > -1 )
	  			if (onlyFirst)
	  				return [element];
	  			else
	  				out.push(element);
	  		
	  		if (down)
	  		{
		  		child = element.firstChild;
		  		while (child != null) {
		  			if (child.nodeType == 1)// element
		  				elements_queue.push(child);
		  			child = child.nextSibling;
		  		}
	  		} 
	  		else {
	  			if (element.parentNode != null && element.parentNode.nodeType == 1) 
	  				elements_queue.push(element.parentNode);
	  		}
	  	}
	  	return out;
	  },
DataFromJavaScript:function (profile,_data,context)
  {
	if (_data.length == 0) _data = [null];
	var expression = aa_text(_data,profile,'Expression',context);
	var _element = ajaxart.getControlElement(context);
	var element = null;
	if (_element.length>0) element = _element[0];
	var control = element;
	var data = _data[0];
	var result = null;
	try { var $ = jQuery; result = eval(expression); }
	catch(e) { 
		ajaxart.log("Failed to run JS expression:" + expression + ", " + e.message,"error"); 
	}
	if (typeof(result) == "number")
		return ["" + result];
	if (typeof(result) == "object" && !(ajaxart.isxml))//number in FF
		return ["" + result];
	if (result == null || typeof(result) == "undefined")
		return [];
	if (result["jquery"] != null) {
		return result.get();
	}
	return [result];
  },
NotInCaptureMode:function (profile,data,context)
	{
		if (window.aa_incapture) return [];
		return ["true"];
	},
HasClass:function (profile,data,context)
	  {
		  var cls = aa_text(data,profile,'Cls',context);
		  if ( jQuery(data).hasClass(cls) )
			  return ["true"];
		  return [];
	  },
StandardButton:function (profile,data,context)
  {
	  var buttonContext = context.vars.ButtonContext[0];

	  var text = ajaxart.totext_array(buttonContext.Text);
		  
	  var str = '<span class="button_wrapper" tabindex="1"><span class="button_outer">'
		   + '<span class="button_inner" >' + text + '</span></span><br/></span>';
	  var btn = jQuery(str)[0];

	  ajaxart_disableSelection(btn);
	  ajaxart.databind([btn],data,context,profile);
	  
	  var click = function(btn)
	  {
		  var jbtn = jQuery(btn);
		  try {
		  if (ajaxart.isattached(btn))
			  btn.focus();
		  } catch(e) { }
		  var buttonContext = context.vars.ButtonContext[0];
    	  var newContext = aa_ctx(context,{ControlElement: [btn]} );
		  ajaxart.runScriptParam(data,buttonContext.OnClick,newContext);
		  jbtn.removeClass('pressed').removeClass('pressing');
	  }

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
	  }).mouseup( function() {
		  if (window.aa_incapture) return;
		  var jbtn = jQuery(btn);
		  if (jbtn.hasClass('pressed'))
			  click(btn);
	  });
	  };
	  
	  mouseHandlers(btn);
	  
	  return [btn];
  },
UrlFragmentAttribute:function (profile,data,context)
  {
	var url = aa_text(data,profile,'Url',context);
	var attr = aa_text(data,profile,'Attribute',context);
	return [ aa_url_attribute(url,attr) ];
  },
Html:function (profile,data,params)
	  {
	    var html = aa_text(data,profile,'Html',params);
	    var tag = aa_text(data,profile,'Tag',params);
	    var dynamicContent = aa_bool(data,profile,'DynamicContent',params);

	    if (html == "") {
	    	html = aa_xml2htmltext(ajaxart.childElem(profile,"*"));
	    	if (dynamicContent)
	    		html = ajaxart.dynamicText(data,html,params,data,false,true)[0];
	    }
		if (tag != "") {
			var out = document.createElement(tag);
			out.innerHTML = html;
			return [out];
		}
		else {
			if (html == null) return [];
			return [jQuery(html)[0]];
		}
	  }
});

/*********/



aa_gcs("text_field", { 

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
    var index = aa_text(data,profile,'Index',context);
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
	case "All" : return items;
	case "ButFirst" : if (items.length >= 1) return items.slice(1); break;
	case "First" : if (items.length >= 1) result = items[0]; break;
	case "Second" : if (items.length >= 2) result = items[1]; break;
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
	case "By index" : try {
			var index_num = eval(index); 
			if (items.length >= index_num) result = items[index_num-1]; break;
		}	catch(e) { ajaxart.log("No index: " + index + "," + e.message,"error"); }
		break;
	case "Last" : if (items.length > 0) result = items[items.length-1]; break;
	};

	if (result == '')
		result = aa_text(data,profile,'Default',context);
	return [result];
  },
ToIdText:function (profile,data,context)
  {
	return [aa_string2id(aa_totext(data))];
  },
Text:function (profile,data,context)
  {
    var pattern = aa_text(data,profile,'Text',context);
    
    var result = ajaxart.dynamicText(data,pattern,context);
    var text_result = ajaxart.totext_array(result);
    if (aa_bool(data,profile,'RemoveEmptyParenthesis',context))
    	test_result = text_result.replace('\(\)','').replace(/^\s*/, '').replace(/\s*$/, '');
    return [ text_result ];
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
    	
    	if (current != "") {
	    	if (i!=0 && i+1<items.length) out += sep;
	    	if (i!=0 && i+1 == items.length) out += lastSeparator;
	    	out += current;
    	}

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
  },
FirstSucceeding:function (profile,data,context)
  {
    var itemProfiles = ajaxart.subprofiles(profile,'Item');

    for(var i=0;i<itemProfiles.length;i++)
    {
    	var subresult = ajaxart.run(data,itemProfiles[i],"",context);
   		for(var j=0;j<subresult.length;j++)
   		{
   			if (ajaxart.totext_item(subresult[j]).length > 0)
   				return subresult;
    	}
    }
  	return [];  	
  },
RemoveSuffix:function (profile,data,context)
  {
    var sep = aa_text(data,profile,'Separator',context);
    var suffix = aa_text(data,profile,'Suffix',context);
    var emptyIfNoSeparator = aa_bool(data,profile,'EmptyIfNoSeparator',context);
    var text = ajaxart.totext_array(data);
    
    if (suffix.length > 0)
    {
    	var pos = text.lastIndexOf(suffix);
    	if (pos == text.length - suffix.length)
    		return [text.substring(0,pos)];
    }
    
    var index = text.lastIndexOf(sep);
    if (index == -1) 
   		if (emptyIfNoSeparator) 
   			return [""];
    	else 
    		return [text];
    return [text.substring(0,index)];
  },
UrlEncoding:function (profile,data,context)
  {
	  var urlpart = ajaxart.totext_array(data);
	  var type = aa_text(data,profile,'Type',context);
	  if (type == "encode")
		  return [ encodeURIComponent( urlpart ) ];
	  else
		  return [ decodeURIComponent( urlpart )];
  }
});

/*********/



aa_gcs("style_guide", { 
StyleFromStyleGuide:function (profile,data,context)
	{
		var style = aa_text(data,profile,'Style',context);
		if (context.vars._FromStudio && aa_tobool(context.vars._FromStudio)) {	// studio
			return null;
		} else {
			var styleGuide = context.vars._BartContext && context.vars._BartContext[0].StyleGuide;
			if (styleGuide && styleGuide[style]) return styleGuide[style]; 
		}
	}
});

/*********/



aa_gcs("server", { 
CallServer:function (profile,data,context)
  {
	var indication = aa_bool(data,profile,'ProgressIndication',context);
	if (indication)
		ajaxart.runNativeHelper([],profile,'StartCallingServer',context); 
	
	ajaxart.server.RunParallelCalls(profile,data,context,'Call',function() { ajaxart.runComponent('server.OnEndCallingServer',[],context); } );
	return ["true"];
  },
ImmediateResult:function (profile,data,context)
  {
	var mySync = ajaxart.getVariable(context,"_CallServerObject");
	
	if (mySync.length > 0) { 
	  var varname = aa_text(data,profile,'VarNameForResult',context);
	  var result = ajaxart.run(data,profile,'Result',context);
	  mySync[0].servervars[varname] = result;
	  ajaxart.run(result,profile,'OnLoad', context);
  	  mySync[0].register(mySync[0],varname);
	  mySync[0].serverResult(mySync[0],true,varname);
	}
    return ["true"];
  }
});

/*********/



aa_gcs("section", { 

});

/*********/



aa_gcs("search_algorithm", { 
SearchWords:function (profile,data,context)
	{
		return [ {
			newFilter: aa_create_search_words_text_filter() 
		}];
	},
SimpleSearch:function (profile,data,context) 
	{
		var matchOnlyTextBeginning = aa_bool(data,profile,'MatchOnlyTextBeginning',context);
		return [ {
			newFilter: aa_create_text_filter(matchOnlyTextBeginning) 
		}];
	}
});

/*********/



aa_gcs("scroll_size", { 
DeviceHeight:function (profile,data,context)
	{
		var field_delta = aa_text(data,profile,'ReduceHeightOfOtherField',context);
		var stretch = aa_bool(data,profile,'StretchFromCurrentLocation',context);
		var pixels_delta = aa_int(data,profile,'ReducePixels',context);
		var applyOn = aa_text(data,profile,'ApplyOn',context);
		var percentages = parseInt(aa_text(data,profile,'Percentages',context).replace("%",""));
		
		aa_init_onresize();
		
		return [{
			apply: function(elem,delta) {
				var fix_size = function() {
					var delta = 0;
					var height = ajaxart_screen_size(true).height;
					if (percentages && !isNaN(percentages))
						height *= percentages/100;
					if (field_delta && aa_find_field(field_delta)[0])
					 	delta += aa_find_field(field_delta,'',true)[0].offsetHeight;
					if (pixels_delta)
						delta += pixels_delta;
					if (stretch)
						ajaxart.ui.HeightToWindowBottom(elem,delta,applyOn);
					else
						jQuery(elem).css(applyOn,height-delta + "px");
				}
				if (field_delta)
					aa_addOnAttachMultiple(elem, function() { setTimeout(fix_size,1); } );	// we use time-out so offsetWidth is valid
				else if (stretch)
					aa_addOnAttachMultiple(elem, fix_size );
				else
					fix_size();
				
				aa_attach_window_resize(fix_size,elem);
			}
		}];
	},
FixedHeight:function (profile,data,context)
	{
	  var height = aa_int(data,profile,'Height',context);
	  var applyOn = aa_text(data,profile,'ApplyOn',context);
	  return [{
		 apply: function(elem,delta) {
		 	if (!delta) delta = 0;
		 	jQuery(elem).css(applyOn,height-delta + "px");
		  }
	  }];
	}
});

/*********/



aa_gcs("sample", { 

});

/*********/



aa_gcs("operation", { 
Operations:function (profile,data,context)
	{
		return ajaxart.runsubprofiles(data,profile,'Operation',context);
	}
});

/*********/



aa_gcs("object", { 
SetTextProperty:function (profile,data,context)
  {
	  var obj = aa_first(data,profile,'Object',context);
	  var prop = aa_text(data,profile,'Property',context);
	  if (obj == null || prop == "") return [];
	  obj[prop] = aa_text(data,profile,'Value',context);
  },
RunMethod:function (profile,data,context)
  {
	  var obj = aa_first(data,profile,'Object',context);
	  var method = aa_text(data,profile,'Method',context);
	  var input = data;
	  if (profile.getAttribute("Input") != null || ajaxart.xml.xpath(profile,'Input').length > 0)
        input = ajaxart.run(data,profile,'Input',context);
	  
	  if (obj == null) return [];
	  var scriptParam = obj[method];
	  if (scriptParam == null) return [];
	  var newContext = context;

	  var params = ajaxart.xml.xpath(profile,'Param');
	  if (params.length > 0) newContext = ajaxart.clone_context(context);
	  for(var i=0;i<params.length;i++)
		  newContext.vars[params[i].getAttribute('name')] = ajaxart.run(data,params[i],'',newContext); 

	  if (typeof(scriptParam) == "function") return scriptParam.call(obj,input,newContext);
	  return ajaxart.runScriptParam(input,scriptParam,newContext);
  },
SetBooleanProperty:function (profile,data,context)
  {
	  var obj = aa_first(data,profile,'Object',context);
	  var prop = aa_text(data,profile,'Property',context);
	  if (obj == null || prop == "") return [];
	  obj[prop] = aa_bool(data,profile,'Value',context);
	  
	  return ["true"];
  },
AddToProperty:function (profile,data,context)
  {
	  var obj = aa_first(data,profile,'Object',context);
	  var prop = aa_text(data,profile,'Property',context);
	  var value = ajaxart.run(data,profile,'Value',context);
	  if (obj == null || prop == "") return [];
	  if (obj[prop] == null) obj[prop] = [];
	  ajaxart.concat(obj[prop],value);
	  
	  return ["true"];
  },
SetMethod:function (profile,data,context)
  {
	  var obj = aa_first(data,profile,'Object',context);
	  var method = aa_text(data,profile,'Method',context);
	  if (obj == null || method == "") return [];

	  var cmpl = ajaxart.compile(profile,'Xtml',context,'');
	  if (cmpl == "same") { 
		  obj[method] = function(data1) { return data1;} 
	  }
	  else if (cmpl != null) {
		  var methodFunc = function(obj,cmpl) { return function(data1,ctx) {
			  var newContext = aa_merge_ctx(context,ctx);
			  newContext._This = obj;
			  return cmpl(data1,newContext);
		  }}
		  obj[method] = methodFunc(obj,cmpl);
	  }
	  else {
		  var methodFunc = function(obj) { return function(data1,ctx) {
			  var newContext = aa_merge_ctx(context,ctx);
			  newContext._This = obj;
			  return ajaxart.run(data1,profile,'Xtml',newContext);
		  }}
		  obj[method] = methodFunc(obj);
	  }
	  
	  return ["true"];
  },
Object:function (profile,data,context)
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
			  
			  if (tag == 'Property') {
				  out[name] = ajaxart.run(data,elem,'',context);
			  } else if (tag == 'SingleProperty') {
				  out[name] = aa_first(data,elem,'',context);
			  } else if (tag == 'TextProperty') {
				  out[name] = aa_text(data,elem,'',context);
			  } else if (tag == 'BooleanProperty') {
				  out[name] = aa_bool(data,elem,'',context);
			  } else if (tag == 'Method') {
				  ajaxart_addMethod(out,name,elem,'',context);
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
ObjectFromParams:function (profile,data,context)
  {
	  var out = { isObject: true };

	  for(var i in context.params) {
		  var name = i;
		  var val = context.params[i];
		  if (val.isParamScript == true) {
			  out[name] = val;
			  out[name].context = context.componentContext;
		  }
		  else
		    out[name] = val;
	  }
	  
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
			  } else if (tag == 'Method') {
				  out[name] = { script: elem , context: context, objectForMethod: [out], compiled: ajaxart.compile(elem,'',context,elem.getAttribute("paramVars")) };
			  }
		  }
	    elem = elem.nextSibling;
	  }

	  return [out];
  }
});

/*********/



aa_gcs("lps_dt", { 

});

/*********/



aa_gcs("lp", { 

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
						ajaxart.xml.xml_changed(obj.Xml);
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
			}
			obj.SaveXml = function() {
				obj.CacheIn.Save(data,aa_ctx(context,{ DataResource: [obj] }))
				obj.Saving = false;
			}
			ajaxart_xml_onchange(obj.Xml,obj.XmlChanged,context);
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
				aa_runMethodAsyncQuery(obj,obj.DataSource.Retrieve,data,aa_ctx(context,ctx),function(result,ctx2){
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



aa_gcs("jbart_agent_lpac", { 
SendCollaborationEvent:function (profile,data,context) 
	{
		var argsArr = ajaxart.runsubprofiles(data,profile,'Argument',context);
		var args = {};
		for(var i in argsArr)
			args[argsArr[i].Name] = argsArr[i].Value;
		
		var settings = {
		  channelType: aa_text(data,profile,'ChannelType',context),
		  command: aa_text(data,profile,'Command',context),
		  args: args,
		  channel: aa_text(data,profile,'Channel',context),
		}
		
		if (aa_bool(data,profile,'DelayedSend',context)) {
			if (jBart.lpacAgent.lastEventSentTime && (new Date().getTime() - jBart.lpacAgent.lastEventSentTime < 1000) ) {
				setTimeout(function() {
					ajaxart.gcs.jbart_agent_lpac.SendCollaborationEvent(profile,data,context);
				},1000);
				return;
			}
			jBart.lpacAgent.lastEventSentTime = new Date().getTime();
		}
		
		if (jBart._lpacSimulator)
		  jBart.lpacAgent.trigger('agentCollaborationEvent',{ agentEvent: { command: settings.command , args: settings.args } });
		
		jBart.lpacAgent.sendCollaborationEvent(settings);
		var bctx = context.vars._BartContext[0];
		jBart.trigger(bctx,'simulate.agentCollaborationEvent',settings);
	},
Argument:function (profile,data,context)
	{
		var name = aa_text(data,profile,'Name',context);
		var value = aa_text(data,profile,'Value',context);
		if (aa_bool(data,profile,'Escape',context))
			value = aa_lp_escapeDisplayArgument(value);
		
		return [{ Name: name, Value: value}];
	},
RefreshOnUpdatingVisitorEvent:function (profile,data,context) 
	{
		if (!jBart.lpacAgent) return;
		var field = context.vars._Field[0];
		jBart.bind(field,'ModifyControl',function(args) {
			jBart.lpacAgent.bind('agentCollabEventCannedUpdated',function() {
				aa_refresh_cell(args.Wrapper,context);
			});			
		});
	}
});

/*********/



aa_gcs("itemlist_scroll", { 

});

/*********/



aa_gcs("itemlist", { 

});

/*********/



aa_gcs("image", { 
Image:function (profile,data,context)
	{
		var image = { };
		image.SecondUrl = aa_text(data,profile,'SecondUrl',context);
		image.Size = aa_text(data,profile,'Size',context);
		image.KeepImageProportions = aa_bool(data,profile,'KeepImageProportions',context);
		aa_setMethod(image,'Url',profile,'Url',context);
		image.asDivBackground = aa_bool(data,profile,'AsDivBackground',context);
		if (image.asDivBackground) {
			image.x = image.y = 0;
			var size = image.Size.split(',');
			image.width = size[0] + 'px';
			image.height = size[1] + 'px';
		}
		return [image]
	}
});

/*********/



aa_gcs("group", { 

});

/*********/



aa_gcs("field_type", { 

});

/*********/



aa_gcs("field_feature", { 
Css:function (profile,data,context)
	{
		var field = context.vars._Field[0];
		var css = aa_text(data,profile,'Css',context);
		var cls = aa_attach_global_css(css,null,field.Id,true);
		aa_field_handler(field,'ModifyCell',function(cell,field_data,cell_presentation,ctx,item)
		{
			jQuery(cell).addClass(cls+'_wrapper');
			var content = cell.firstChild || cell;
			jQuery(content).addClass(cls);
		},null,200);	
	}
});

/*********/



aa_gcs("field_control", { 
Image:function (profile,data,context)
   	{
		var field = context.vars._Field[0];
		field.Control = function(field_data,ctx) {
			var image = aa_first(field_data,profile,'Image',context);
			if (image && image.Url)
			  image.StaticUrl = aa_totext(image.Url(field_data,context));
			
			var style = aa_first(data,profile,'Style',context);
			
			return [aa_renderStyleObject(style,{ Field: field, image: image, data: field_data[0] },context)];
		}
   	},
CustomControl:function (profile,data,context)
   	{
		var field = context.vars._Field[0];
		field.Control = function(field_data,ctx) {
			var style = ajaxart.runNativeHelper(field_data,profile,'StyleObject',context)[0];
			
			return [aa_renderStyleObject(style,{ Field: field, Data: field_data },context)];
		}
   	}
});

/*********/



aa_gcs("field_aspect", { 
ImageReadOnlyImp:function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
		field.ImageHeight = aa_text(data,profile,'Height',context);
		field.ImageWidth = aa_text(data,profile,'Width',context);
		field.KeepImageProportions = aa_bool(data,profile,'KeepImageProportions',context) && field.ImageHeight != "" && field.ImageWidth != "";
		field.HideEmptyImage = aa_bool(data,profile,'HideEmptyImage',context) ;

		// the px does problems with dynamically changing image size
		field.ImageWidth = field.ImageWidth.split('px')[0];	
		field.ImageHeight = field.ImageHeight.split('px')[0];
		if (!field.KeepImageProportions) {
			if (field.ImageWidth!="") field.ImageWidth += 'px';
			if (field.ImageHeight!="") field.ImageHeight += 'px';
		}
		
		var urlForMissingImage = aa_text(data,profile,'UrlForMissingImage',context);
		var textForMissingImage = aa_text(data,profile,'TextForMissingImage',context);
		var src_compiled = ajaxart.compile(profile,'Src',context);
		field.Text = function(data1,ctx)
		{
			var field = this;
			var src = ajaxart_runcompiled_text(src_compiled, data1, profile, "Src", ctx );
			if (field.HideEmptyImage && ajaxart.totext_array(data1) == "")
				src = "";
			if (src == "") {
				if (textForMissingImage != "")
					return [jQuery("<span class='aa_missing_image'></span>").text(textForMissingImage)[0]];
				else if (urlForMissingImage != "")
					src = urlForMissingImage;
				else return ["<span/>"];
			}
			var out = "<img src='" + src + "'";
			var style = " style='";
			if (field.ImageHeight != "") { 
				style = style + "height:" + field.ImageHeight + "; "; 
				out += ' height="' + field.ImageHeight + '"'; 
			} 
			if (field.ImageWidth != "") { 
				style = style + "width:" + field.ImageWidth + "; "; 
				out += ' width="'+field.ImageWidth+'"'; 
			}
			out = out + style + "' ";
			out += "/>";
			return [out]
		}
		field.ReadOnlyControl = function(data1,ctx) {
			var field = this;
			var image = jQuery(this.Text(data1,ctx)[0])[0];
			
			if (aa_paramExists(profile,'OnClick'))
			{
				image.onclick = function() { 
					if (window.aa_incapture) return;
					ajaxart.run(data1,profile,'OnClick',aa_merge_ctx(context,ctx)); 
				}
				jQuery(image).css('cursor','pointer');
			}
			if (field.KeepImageProportions)	{
				aa_keepimageprops(image,field.ImageWidth,field.ImageHeight);
				var wrapper = jQuery('<div style="overflow:hidden; width:'+field.ImageWidth+"px; height:"+field.ImageHeight+'px"/>')[0];  // for alignment
				wrapper.appendChild(image);
				return [wrapper];
			}
			return [image];
		}
		if (field.KeepImageProportions)
			field.CellPresentation = 'control';
		
		return [];
	},
Mandatory:function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.Mandatory = true;
		if (! field.Validations ) field.Validations = [];
		var obj = { isObject: true, CheckValidation: 'on save' , Mandatory: true }
		var init = function(field,obj) {
		  obj.Validation = function(data1,ctx) {
			  if (field.CheckMandatoryValidation) return aa_frombool(field.CheckMandatoryValidation(data1,ctx));
			  var txt = aa_totext(data1);
			  return aa_frombool(txt == "");
		  }
		  obj.ErrorMessage = function(data1,ctx) {
			  if (field.MandatoryMessage)
				  return field.MandatoryMessage(data1,ctx);
			  return ajaxart.runComponent('ui.MandatoryMessage',[],aa_ctx(ctx,{ FieldTitle: [field.Title] }));
		  }
		  if (ajaxart.fieldscript(profile,'ErrorMessage',true))
			  field.MandatoryMessage = function(data1,ctx) {
			    ctx = aa_merge_ctx(context,ctx);
			  	return ajaxart.run(data1,profile,'ErrorMessage',ctx);
		  	  }
		}
		init(field,obj);
		
		field.Validations.push(obj);
		return [];
	},
Hidden:function (profile,data,context) {
		var field = context.vars._Field[0];
		var on_condition = aa_first(data,profile,'OnCondition',context);
		if (!on_condition) {
			field.IsHidden = true;
			field.IsFieldHidden = function() { return true; }
			// backward compatability
			aa_field_handler(field,'ModifyCell', function(cell,field_data) {
				jQuery(cell).hide().css('display','none');
			});
		}
		else
			on_condition.apply(field,context);
	},
Resizer:function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.RememberResizerWidth = aa_bool(data,profile,'RememberLastWidth',context);
		
		if (aa_bool(data,profile,'Disable',context))
		{
			aa_field_handler(field,'ModifyControl',function() {},'resizer');
			return [];
		}
		var resizer = function(cell,field_data,cell_presentation,ctx) {
			function init(input,field) {
				aa_defineElemProperties(input,'DetectResize');  // for memory leaks
				
				function cellResizeStart(e) {
					document.onmouseup = cellResizeStop;
					input.onmousemove= null;
					document.onmousemove= cellResizeMove;
					return aa_stop_prop(e);
				}
				function cellResizeMove(e) {
					var mousepos = ajaxart.ui.mousePos(e);
	
					var new_size = mousepos.x - ajaxart.ui.absoluteLeft(input);
					if (jQuery(input).parents('.right2left').length > 0)
						new_size = ajaxart.ui.absoluteLeft(input) + input.offsetWidth - mousepos.x;
					
					jQuery(input).width(new_size);
	
					if (field.RememberResizerWidth && ctx.vars._Cntr) {
						ajaxart_setUiPref(aa_totext(ctx.vars._Cntr[0].ID),field.Id+'_Width','' + new_size + 'px',ctx);
					}
					return aa_stop_prop(e);
				}
				function cellResizeStop(e) {
					jQuery(input).removeClass('col_resize');
					document.onmouseup = null;
					document.onmousemove= null;
					input.onmousemove= input.DetectResize;
					input.onmousedown = input.onmousedownOrig;
					return aa_stop_prop(e);
				}

				input.onmousemove = input.DetectResize = function(e) {
					var mousepos = ajaxart.ui.mousePos(e);
					
					var in_resize_place = ajaxart.ui.absoluteLeft(input) + input.offsetWidth - mousepos.x < 3;
					if (jQuery(input).parents('.right2left').length > 0)
						in_resize_place = mousepos.x - ajaxart.ui.absoluteLeft(input) < 3;
					if (in_resize_place)
					{
						jQuery(input).addClass('col_resize');
						input.onmousedown= cellResizeStart;
					}
					else
					{
						jQuery(input).removeClass('col_resize');
						input.onmousedown= input.onmousedownOrig;
					}
				}
			}
			if (cell.ReadOnly) return;
			var input = jQuery(cell).find('>.field_control')[0];
			if (input != null) 
			{
				input.onmousedownOrig = input.onmousedown;
				init(input,field);
				if (field.RememberResizerWidth && ctx.vars._Cntr)
				{
					var cntr = ctx.vars._Cntr[0];
					var field_width = ajaxart_getUiPref(aa_totext(cntr.ID),field.Id+'_Width',ctx);
					if (field_width != null)
					 jQuery(input).css('width',field_width);
				}
			}
		}
		aa_field_handler(field,'ModifyControl',resizer,'resizer');

		return [];
	},
Hyperlink:function (profile,data,context)
  {
	var field = context.vars._Field[0];
	var cssClass = aa_attach_global_css( aa_text(data,profile,'Css',context) , null, 'hyperlink' );
	
	aa_field_handler(field,'ModifyCell', function(td,field_data,cell_presentation,ctx,item) {
		jQuery(td).addClass("aa_hyperlink").addClass(cssClass);
		jQuery(td).click(function() {
			if (window.aa_incapture) return;
			ajaxart.run(item,profile,'Action',aa_ctx(aa_merge_ctx(context,ctx), {_ItemsOfOperation:item, Item:item, _ElemsOfOperation:[this.parentNode] , ControlElement: [td]}));
		});
	});
  },
OnUpdate:function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		var onUpdate = function(field,field_data,input,e,extra)
		{
			var ctx1 = input.ajaxart ? aa_merge_ctx(context,input.ajaxart.params) : context;
			var parent_elem = jQuery(input).parents('.aa_item')[0]; 
			var item = parent_elem && parent_elem.ItemData;
			var newContext = aa_ctx(ctx1,{ _Field: [field], _FieldData: field_data
				, _Input: [input], ControlElement: [input], _Item: item || [] } );
			if (extra) newContext = aa_ctx(newContext,extra);
			if (jQuery(input).parents('.aa_container').length > 0) { 
				newContext.vars._Cntr = [ jQuery(input).parents('.aa_container')[0].Cntr ];
				newContext.vars.HeaderFooterCntr = newContext.vars._Cntr[0].Context.vars.HeaderFooterCntr;
			}
			
			ajaxart.run(field_data,profile,'Action',newContext);
		}
		aa_field_handler(field,'OnUpdate',onUpdate,aa_text(data,profile,'ID',context),aa_int(data,profile,'Phase',context));
		return [];
	},
SimpleInput:function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
		field.Control = function(field_data,ctx)
		{
			var field = this;
			ctx = aa_ctx(ctx,{_Field: [field]});
			
			var cntr = ctx.vars._Cntr && ctx.vars._Cntr[0];
			if (ajaxart_field_is_readOnly(cntr,field,ctx)) {
		    	var text = (field.Text) ? aa_totext(field.Text(field_data,context)) : aa_totext(field_data);
		    	text = text.replace(/\n/g,"<br/>");
				var out = jQuery("<div class='aa_text'/>").html(text)[0];
				return [out];
			}
			return [ajaxart_field_createSimpleInput(field_data,ctx,ajaxart_field_is_readOnly(cntr,field,ctx))];
		}
 	    //ajaxart_addControlMethod_js(field,'Control',simple,context);
		
		return [];
	},
Tooltip:function (profile,data,context)
	{
		var field = context.vars._Field[0];

//		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
//			cell.title = aa_multilang_text(field_data,profile,'Tooltip',context);
//		});
		aa_field_handler(field,'ModifyCell', function(cell,field_data) {
			cell.title = aa_multilang_text(field_data,profile,'Tooltip',context);
		});
	},
Control:function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
 	    ajaxart_addControlMethod(field,'WritableControl',data,profile,'Control',context);
	},
HighlightSubTextOnFilter:function (profile,data,context)
	{
		var field = context.vars._Field[0];
		var idForFilteredResults = 0;
		var highlight_class = aa_attach_global_css( aa_text(data,profile,'HighlightCss',context) , null, 'highlight' );
		
		aa_field_handler(field,'ModifyCell', function(cell,field_data,cell_presentation,ctx,item) {
			  var cntr = ctx.vars.DataHolderCntr && ctx.vars.DataHolderCntr[0];
			  var filterObject = null;
			  if (cntr && cntr.IDForFilteredResults && cntr.IDForFilteredResults > 1) {
				  if (cntr.IDForFilteredResults != idForFilteredResults) {
					  idForFilteredResults = cntr.IDForFilteredResults;
					  if (cntr.Filters) {
						  for(var j=0;j<cntr.Filters.length;j++) {
							  if (cntr.Filters[j].field == field) {
								  filterObject = cntr.Filters[j];
							  }
						  }
					  }
					  cntr.FieldsCache = cntr.FieldsCache || {};
					  cntr.FieldsCache[field.Id] = filterObject;
				  } else {
					  filterObject = cntr.FieldsCache[field.Id];
				  }
				  if (!filterObject || !filterObject.HighlightSelectedText) return;
				  				  
				  var content = jQuery(cell).find(">.aa_text,>span>.aa_text")[0];
				  if (!content && cell.firstChild && cell.firstChild.nodeType == 1) content = cell.firstChild;
				  content = content || cell; 
				  
				  filterObject.HighlightSelectedText(content,highlight_class + ' aa_highlight');
			  }
		},'HighlightSubTextOnFilter');
		
	},
GlobalCss:function (profile,data,context)
	{
		var field = context.vars._Field[0];
		var css = aa_text(data,profile,'GlobalCss',context);
		var cls = aa_attach_global_css(css,null,field.Id);
		aa_field_handler(field,'ModifyCell',function(cell,field_data,cell_presentation,ctx,item)
		{
			if (aa_paramExists(profile,'OnCondition') && ! aa_bool(field_data,profile,'OnCondition',context)) return;
			jQuery(cell).addClass(cls);
		});	
	},
CellPresentation:function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
		field.CellPresentation = aa_text(data,profile,'Content',context);
		
		return [];
	},
FieldData:function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
		ajaxart_addMethod(field,'FieldData',profile,'FieldData',context);
		return [];
	},
WritableControl:function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
		aa_setMethod(field,'WritableControl',profile,'Control',context);
		
		return [];
	},
DescriptionForEmptyText:function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		field.DescriptionForEmptyText = ajaxart.totext_array(ajaxart_multilang_run(data,profile,'Description',context));
		field.EmptyTextCssClass = aa_attach_global_css( aa_text(data,profile,'Css',context),null,'empty_text_description');
		
		aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx,item)
		{
			if (ajaxart_field_is_readOnly(ctx.vars._Cntr && ctx.vars._Cntr[0],cell.Field,ctx)) return;
			jBart.addDescriptionForEmptyText(cell,field.DescriptionForEmptyText,field.EmptyTextCssClass);
		},'DescriptionForEmptyText',10);

		if (ajaxart.isChrome || ajaxart.isFireFox || ajaxart.isSafari) return; // we use placeholder

		aa_field_handler(field,'OnFocus',function(field,field_data,input)
		{
			if (jQuery(input).hasClass('empty_text_description'))
			{
				if (input.value == field.DescriptionForEmptyText)
					input.value = ""; 
				jQuery(input).removeClass('empty_text_description').removeClass(field.EmptyTextCssClass);
			}
		},'DescriptionForEmptyText',10);
		aa_field_handler(field,'OnBlur',function(field,field_data,input)
		{
			if (input.value == '' && document.activeElement != input)
			{
				jQuery(input).addClass('empty_text_description').addClass(field.EmptyTextCssClass);
				input.value = field.DescriptionForEmptyText;
			}
		},'DescriptieonForEmptyText',10);
		return [];
	},
ClearValueButton:function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.Style = aa_first(data,profile,'Style',context);
		
		function refresh(wrapper,field_data) {
			var apiObject = {
				ClearValue: function() {
				  var input = jQuery(wrapper).find('input')[0];
				  if (input) {
					  input.value = '';
					  field.ManualWriteValue = false; // Yaniv: I do not understand this line...
					  if (input.updateValue) input.updateValue();
					  if (input.Refresh) input.Refresh();
					  refresh(wrapper,field_data);
				  }
				},
				FieldControlWrapper: wrapper,
				IsValueEmpty: aa_totext(field_data) == "",
				Title: aa_multilang_text(data,profile,'Title',context)
			}
			var clearBtn = aa_renderStyleObject(field.Style,apiObject,context);
			jQuery(clearBtn).addClass('aa_clear_button');
		}
		
		aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx) {
			refresh(cell,field_data);
		});
		aa_field_handler(field,'OnUpdate',function(field,field_data,input){
			var cell = input.parentNode;
			refresh(cell,field_data);
		});
	},
ItemListSelectionWithKeyboard:function (profile,data,context)
	{
		var field = context.vars._Field[0];
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
			var input = jQuery(cell).find('input');
			var cntr = ctx.vars.DataHolderCntr[0];

			input.keydown(function(e) {
				if (e.keyCode == 40 || e.keyCode == 38) {	// arrow down/up
					if (cntr && cntr.SelectionKeydown) cntr.SelectionKeydown(e); // delegate to cntr selection
					return false;
				} else if (e.keyCode == 13 && cntr) {
					var selected = jQuery(cntr.Ctrl).find('.aa_selected_item')[0];
					if (selected) {
						ajaxart.run(selected.ItemData,profile,'DoOnEnter',context);
					}
				}
				return true;
			});
		},'ItemListSelectionWithKeyboard');
	},
Css:function (profile,data,context)
	{
		var css_for = aa_text(data,profile,'OnElement',context);
		var class_compiled = ajaxart.compile(profile,'Class',context);
		var inline_compiled = ajaxart.compile(profile,'Inline',context);
		var condition_compiled = ajaxart.compile(profile,'OnCondition',context, null, false, true);
		var apply_css = function(elems,data2) {
			for (var i=0; i<elems.length; i++) {
				if (! ajaxart_runcompiled_bool(condition_compiled, data2, profile, "OnCondition", context, true )) return;
				var cls = ajaxart_runcompiled_text(class_compiled, data2, profile, "Class" ,context);
				var inline = ajaxart_runcompiled_text(inline_compiled, data2, profile, "Inline" ,context);
				if (inline != "") aa_setCssText(elems[i],elems[i].style.cssText + ";" + inline);
				if (cls != "") elems[i].className = elems[i].className + " " + cls;
			}
		};
		var register = function(apply_css,css_for) {
			var css = function(cell,field_data,cell_presentation,ctx) {
				if (css_for == "cell")
					var work_on = cell;
				else if (css_for == "content") 
					var work_on = jQuery(cell).find('.field_control')[0];
				else if (css_for == "title")	
					var work_on = jQuery(cell.parentNode).find('>.propertysheet_title_td')[0];
				else
					var work_on = cell;
				if (!work_on) 
					work_on = cell;
				apply_css([work_on],field_data);
			}
			var field = ajaxart_fieldaspect_getField(context);
			aa_field_handler(field,'ModifyCell',css);
		}
		register(apply_css,css_for);
		return [];
	},
TextSearchAlgorithm:function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.TextSearchAlgorithmForBase = aa_first(data,profile,'Algorithm',context).newFilter;
		
		aa_field_handler(field,'ModifyCell', function(cell,field_data,cell_presentation,ctx,item) {
			  var cntr = ctx.vars.DataHolderCntr && ctx.vars.DataHolderCntr[0];
			  var baseField = cntr && aa_fieldById(field.FilterBaseFieldID,cntr.Fields);
			  if (!baseField) return;
			  baseField.newFilter = field.TextSearchAlgorithmForBase;
		},'TextSearchAlgorithm');
	},
HideByCondition:function (profile,data,context)
	{
		var field = context.vars._Field[0];
		if (!aa_bool(data,profile,'CheckConditionForEveryItem',context)) {
			field.Hidden = function(data1,ctx)
			{
				var item = ctx.vars._Item ? ctx.vars._Item : data1;
				return aa_bool(item,profile,'ShowCondition',context) ? [] : ['true'];
			}
		}
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
			    var cellParent = jQuery(cell).parent();
				var parent_line = jQuery(cell).parent()[0];
			    var elem_to_hide = parent_line;
				if (! (cellParent.hasClass('field_row') || cellParent.hasClass('aa_section') ) )
					elem_to_hide = cell;
			    if (aa_bool(field_data,profile,'ShowCondition',aa_merge_ctx(context,ctx)))
			    {
			    	jQuery(cell).removeClass('aa_hidden_field');
			    	elem_to_hide.style.display = '';
			    	elem_to_hide.display = '';
			    }
			    else
			    {
			    	jQuery(cell).addClass('aa_hidden_field');
			    	elem_to_hide.style.display = 'none';
			    	elem_to_hide.display = 'none';
			    }
		},'HideByCondition');
	}
});

/*********/



aa_gcs("field", { 
XmlMultipleGroup:function (profile,data,context)
	{
		var field = { isObject : true, Title: aa_multilang_text(data,profile,'Title',context), IsGroup: true, IsMultipleGroup: true }
		var path = aa_text(data,profile,'Path',context);
		var middleElement = path.indexOf('/') != -1;
		
		field.Id = aa_text(data,profile,'ID',context);
		if (field.Id == "") field.Id = path.split('/').reverse().pop();
		
		field.ID = [ field.Id ]; 
		field.Fields = ajaxart.runsubprofiles(data,profile,'Field',context);
		
		field.FieldData = function(data) { return data; }
		
		var itemsProvider = aa_first(data,profile,'Items',context);
		if (itemsProvider && itemsProvider.ContainerData) field.FieldData = itemsProvider.ContainerData;
		else {
			if (path.indexOf('/') != -1) {
				var lastpos = path.lastIndexOf('/');
				var subPath = (lastpos==-1) ? path : path.substring(0,lastpos);
				aa_set_fielddata_method(field,subPath);
			}
		}

		field.InnerItems = function(data1,ctx) {
			var ctx = aa_merge_ctx(context,ctx);
			var out = ajaxart.runNativeHelper(data1,profile,'Items',ctx);
			out[0].MultipleItemsField = this; 
			return out;
		}
		field.Operations = function(data1,ctx) {
			return ajaxart.run(data,profile,'Operations',context);
		}
		field.Control = function(data1,ctx) {
			var ctx2 = aa_ctx(aa_merge_ctx(context,ctx),{_Field: [this]});
			return ajaxart.runNativeHelper(data1,profile,'Control',ctx2);
		}
		field.Aspects = function(data1,ctx) { return ajaxart.runsubprofiles([],profile,'Aspect',context); }
		
		var newContext = aa_ctx(context,{_Field: [field]} );
		ajaxart.runsubprofiles(data,profile,'FieldAspect',newContext);
		
		return [field];
	},
Text:function (profile,data,context)   // gc of field.Text
	{
		var field = { isObject : true};
		var ctx2 = aa_ctx(context,{_Field: [field]} );

		field.Id = aa_text(data,profile,'ID',ctx2);
		field.ID = [field.Id];
		field.Title = aa_multilang_text(data,profile,'Title',ctx2);
		field.HideTitle = aa_bool(data,profile,'HideTitle',ctx2);
		field.CellPresentation = 'control';
		field.Style = aa_first(data,profile,'Style',context);
		
		field.TitleAsText = ! aa_paramExists(profile,'Text',true);
		
		field.Control = function(field_data,ctx) {
			var text = aa_multilang_text(field_data,profile,'Text',aa_merge_ctx(ctx2,ctx));
			if (!text && field.TitleAsText) text = field.Title;
			text = text.replace(/\n/g,"<br/>");
		
			return [ aa_renderStyleObject(field.Style,{ text: text, data: field_data[0] },ctx) ];
		}
		field.Text = function(field_data,ctx) {
			var text = aa_multilang_text(field_data,profile,'Text',aa_merge_ctx(ctx2,ctx));
			if (!text && field.TitleAsText) text = field.Title;
			text = text.replace(/\n/g,"<br/>");

			return [text];
		}
		ajaxart.runsubprofiles(data,profile,'FieldAspect',ctx2);
		return [field];
	},
Button:function (profile,data,context)
	{
		var field = { isObject : true };
		field.Id = aa_text(data,profile,'ID',context);
		field.ID = [field.Id];
		field.FieldData = function(data1) { return data1; }
		field.CellPresentation = ["control"];
		field.HideTitle = (aa_bool(data,profile,'HideTitle',context));

		field.Refresh = function(data1,ctx) {
			field.Title = aa_multilang_text(data,profile,'Title',context);
			field.Image = aa_first(data,profile,'Image',context);
			if (field.Image && field.Image.Url)
			  field.Image.StaticUrl = aa_totext(field.Image.Url(data,context));
			field.Style = aa_first(data,profile,'Style',aa_ctx(context,{_Field: [field]}));
			if (field.Style)
			  field.StyleClass = aa_attach_global_css(field.Style.Css);
		}

		field.Refresh(data,context);
		if (!field.Style) return;
		
		field.Control = function(field_data,ctx) {
			var field = this;
			var style = field.Style;
			if (style.Html == "") return [];
			var jElem = jQuery(style.Html);
			var button = aa_api_object(jElem,{image: field.Image, Field: field});
			button.text = button.tooltip = aa_multilang_text(field_data,profile,'ButtonText',context);
			if (aa_paramExists(profile,'Tooltip')) button.tooltip = aa_multilang_text(field_data,profile,'Tooltip',context);
			
			if (button.text == '') button.text = field.Title;
			var initButtonEvents = function(button) {
			  aa_defineElemProperties(button,'Action');
			  
			  button.Action = function(settings) {
				settings = settings || {};
				var e = settings.event;
				var data = settings.data || field_data;
				if (window.aa_incapture) return;
				var itemElem = [ jQuery(button).parents('.aa_item')[0] ];
				if (itemElem[0] == null) itemElem = [];
				var item = (itemElem[0]) ? itemElem[0].ItemData : []; 
				var ctx2 = aa_ctx(aa_merge_ctx(context,ctx),{ControlElement: button.jElem.get(), _ElemsOfOperation: itemElem, _ItemsOfOperation: item });
				if (settings.vars)
					ctx2 = aa_ctx(ctx2,settings.vars);
				if (e) ctx2.vars._DomEvent = [e];
				if (typeof settings.end == 'function') {
					ajaxart_RunAsync(data,ajaxart.fieldscript(profile,'Action'),ctx2,settings.end);
				} else {
					ajaxart.run(data,profile,'Action',ctx2);
				}
			  }
			}
			initButtonEvents(button);
			aa_apply_style_js(button,field.Style);
			jElem.addClass(field.StyleClass);
			//ajaxart.databind([jElem[0]],field_data,context,profile,data);	// for runtime inspect
			return jElem.get();
		}

		ajaxart.runsubprofiles(data,profile,'FieldAspect',aa_ctx(context,{_Field: [field]}));
		
	    return [field];
	},
Field1:function (profile,data,context)
	{
		var field = { isObject : true };
		field.Title = aa_multilang_text(data,profile,'Title',context);
		field.Id = aa_text(data,profile,'ID',context);
		field.ID = [field.Id];
		
		ajaxart_addMethod(field,'FieldData',profile,'FieldData',context);
		ajaxart_addMethod(field,'Control',profile,'Control',context);

		var newContext = aa_ctx(context,{_Field: [field]} );
		ajaxart.runsubprofiles(data,profile,'FieldAspect',newContext);
		ajaxart.run(data,profile,'Multiple',newContext);
		
	    return [field];
	},
Field:function (profile,data,context) // GC of field.Field
	{
		var field = { isObject : true};
		field.Id = aa_text(data,profile,'ID',context);
		field.ID = [field.Id];
		field.Title = aa_multilang_text(data,profile,'Title',context);
		field.ReadOnlyText = aa_bool(data,profile,'ReadOnlyText',context);

		var dataAttr = profile.getAttribute('FieldData'); 
		if (!field.ReadOnlyText && dataAttr && dataAttr.indexOf('%') == -1) field.ReadOnlyText = true;
		
		if (field.ReadOnlyText) {
			field.ReadOnly = true;
			field.FieldData = function(item,ctx) { return ajaxart_multilang_run(item,profile,'FieldData',aa_merge_ctx(context,ctx)); }
		}
		else {
			if (dataAttr && dataAttr != '') {
				var isPath = /^%.*%$/.test(dataAttr);
				if (!isPath) field.ReadOnly = true;
				if (isPath && dataAttr.charAt(1) != '!') // always add !
					profile.setAttribute('FieldData','%!' + dataAttr.substring(1));
			}
			aa_setMethod(field,'FieldData',profile,'FieldData',context);
		}
		
		var ctx = aa_ctx(context,{_Field: [field]} );
		field.TypeStyle = aa_first(data,profile,'Type',ctx);
		if (field.TypeStyle && field.TypeStyle.IsTriplet) {
			aa_add_field_type_triplet(field,field.TypeStyle,data,context); // FIX: should be for simple text field only!!
		}
		ajaxart.runsubprofiles(data,profile,'FieldAspect',ctx);
		
		if (field.DefaultValue || field.ForceCData) {	// we need to change the FieldData function
			field.FieldData = function(data1,ctx)
			{
				var out = ajaxart.run(data1,profile,'FieldData',aa_merge_ctx(context,ctx));
				if ( aa_totext(out) == '' && this.DefaultValue)
					ajaxart.writevalue(out,this.DefaultValue(data1,ctx),true);
				
				if (this.ForceCData && out[0].nodeType == 1) {
					var currentValue = aa_totext(out);
					for(var iter=out[0].firstChild;iter;iter=iter.nextSibling) {
						if (iter.nodeType == 4) return out; // we already have cdata. nothing to change
					}
					
					while (out[0].firstChild) out[0].removeChild(out[0].firstChild); // empty
					out[0].appendChild(out[0].ownerDocument.createCDATASection(currentValue)); // add cdata
				}
				
				return out;
			}
		}
		// TODO: add compile_text and put it in ItemToText
		return [field];
	},
Layout:function (profile, data, context)
	{
		var layout_field = {};
		layout_field.Id = aa_text(data,profile,'ID',context);
		layout_field.ID = [layout_field.Id];
		layout_field.Title = aa_multilang_text(data,profile,'Title',context);
		layout_field.FieldData = function(data1) { return data1; }
		layout_field.HideTitle = aa_bool(data,profile,'HideTitle',context);
		layout_field.CellPresentation = ["control"];
		layout_field.Style = aa_first(data,profile,'Layout',aa_ctx(context,{_Field:[layout_field]}));
		layout_field.SectionStyle = aa_first(data,profile,'SectionStyle',context);
		
		if (layout_field.Style) {
			layout_field.Control = function(field_data,ctx) {
				var baseCtx = aa_ctx(ctx,{});
				jBart.trigger(layout_field,'ModifyInstanceContext',{ Context: baseCtx, FieldData: field_data });					
		        var fields = ajaxart.runsubprofiles(data,profile,'Field',aa_merge_ctx(context,baseCtx));
		        var newFields = [];
		        for(var i=0;i<fields.length;i++)  // we do not need the constant hidden fields
		        	if (!fields[i].IsHidden) newFields.push(fields[i]);
		        fields = newFields;
		        
		        var layout = aa_api_object(jQuery(layout_field.Style.Html), { Fields:fields } );
				var setControl = function(classOrElement) {
					var inner = this.getInnerElement(classOrElement);
					inner.jbFieldElement = this;
					if (!inner) return;
					var ctx2 = aa_ctx(baseCtx,{_Field: [this.Field]});
					var cell_data = ajaxart_field_calc_field_data(this.Field,field_data,ctx2);
					var cntr = ctx.vars._Cntr && ctx.vars._Cntr[0];
					var field = this.Field;
					
					if (field.AsSection && !field.HideTitle) {
						var sectionCtrl = aa_buildSectionControl(cntr,field,field_data,cell_data,ctx2);
						inner.appendChild(sectionCtrl);
					} else {
						ajaxart_field_createCellControl(field_data,cntr,inner,"control",field,cell_data,ctx2);
					}
					if (inner.firstChild)
						aa_element_attached(inner.firstChild);
					if (field.HiddenForEdit || field.HiddenForProperties) jQuery(inner).hide().css('display','none');
			  	};
				layout.addFields = function(classOrElement,init_field_func) {
					var inner = this.getInnerElement(classOrElement);
					if (!inner || !init_field_func) return;
					var innerParent = inner.parentNode;
					var fields = this.Fields;
					
					for(var i=0;i<fields.length;i++) {
						var field = fields[i];
						var elem = inner.cloneNode(true);
						innerParent.insertBefore(elem,inner);
						aa_element_attached(elem);
						var cntr = ctx.vars._Cntr && ctx.vars._Cntr[0];
						
						var field_obj = aa_api_object(elem,{ Field: field, data : this.data, 
							Title: field.Title, cntr: cntr , HideTitle: field.HideTitle, setControl: setControl});
						init_field_func.call(field_obj,field_obj);
						}
					inner.parentNode.removeChild(inner);
				}
				jQuery(layout).addClass( aa_attach_global_css(layout_field.Style.Css) );
				aa_apply_style_js(layout,layout_field.Style);
				
				if (layout_field.SectionStyle) {
					return [ aa_wrapWithSection(layout,layout_field,layout_field.SectionStyle) ];
				}
				return [layout];
			}
		}
		ajaxart.runsubprofiles(data,profile,'FieldAspect',aa_ctx(context,{_Field: [layout_field]}));
		return [layout_field];
	},
TextFilter:function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];

		field.FilterControl = function(filter_context)
		{
			var newContext = aa_ctx(filter_context,{_Field: [this] } );
			var ctrl = ajaxart.runNativeHelper(filter_context.vars.FilterData,profile,'Control',newContext);
			jQuery(ctrl).find('.aa_filter_input').addClass('aa_filter_' + this.Id);
			return ctrl;
		};
		
		field.newFilter = aa_create_text_filter(aa_bool(data,profile,'MatchOnlyTextBeginning'));
	},
XmlField:function (profile,data,context)
	{
		var field = { isObject : true};
		var path = aa_text(data,profile,'Path',context);
		field.Id = aa_text(data,profile,'ID',context);
		if (field.Id == '') 
			field.Id = path.split('@').pop();
		field.ID = [field.Id];
		field.Title = aa_multilang_text(data,profile,'Title',context);
		if (aa_paramExists(profile,'Title')) {
		  field.RecalcTitle = function(item,ctx) {
			this.Title = aa_multilang_text(item,profile,'Title',context);
		  }
		}
		field.Path = path;
		ajaxart_field_fix_title(field,path,context);
		
		var isAttribute= /^@[\w]*$/.test(path);
		
		if (path == "") 
			field.FieldData = function(data1) { return data1;}
		else
			aa_set_fielddata_method(field,path);
		
		var newContext = aa_ctx(context,{_Field: [field]} );
		ajaxart.run(data,profile,'Type',newContext);
		ajaxart.runsubprofiles(data,profile,'FieldAspect',newContext);
		ajaxart.run(data,profile,'Multiple',newContext);
		if (isAttribute)
			field.ItemToText = function(att) { return function(item) { 
				if (!item.nodeType) return item[att] || '';
				return item.getAttribute(att) || ''; 
			} } (path.substring(1));
			
			return [field];
	},
ShowFieldControl:function (profile,data,context)
	{
		var item = ajaxart.run(data,profile,'Item',context);
		//var cntr = aa_first(data,profile,'Cntr',context) || (context.vars._Cntr != null) ? context.vars._Cntr[0] : null;
		//var newContext = context;
		var cntr = { isObject: true, ID: ["show_field"] , Items: [{ isObject:true , ReadOnly: false, Items: [] }]};
		if (context.vars._Cntr) cntr.ParentCntr = context.vars._Cntr[0]; 
		var newContext = aa_ctx(context,{ _Cntr: [cntr] });
			
		var field = aa_first(data,profile,'Field',newContext);
		if (field == null) return [];
		var field_data = ajaxart_field_calc_field_data(field,item,newContext);
		var out = document.createElement(aa_text(data,profile,'CellTag',context)); 
    	newContext = aa_ctx(newContext,{_Field: [field], FieldTitle: [field.Title], _Item: item, Items: aa_items(cntr) } ); // TODO: do not call aa_items
    	
    	if (field.Hidden && aa_tobool(field.Hidden(item,newContext)) ) return [];
    	
		if (field.AsSection)
			aa_buildSection(cntr,out,field,item,null,context);
		else
			ajaxart_field_createCellControl(item,cntr,out,'control',field,field_data,newContext);

		return [out];
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
FilterField:function (profile,data,context) 
	{
		var field = { isObject : true};
		field.Id = aa_text(data,profile,'ID',context);
		field.ID = [field.Id];
		field.Title = aa_multilang_text(data,profile,'Title',context);

		var baseFieldID = field.FilterBaseFieldID = aa_text(data,profile,'BasedOn',context);
		field.FieldData = function(data1,ctx) {
		  return aa_xpath(data1[0],'@'+baseFieldID,true);
		}
		
		var ctx = aa_ctx(context,{_Field: [field]} );
		field.TypeStyle = aa_first(data,profile,'Type',ctx);
		if (field.TypeStyle && field.TypeStyle.IsTriplet) {
			aa_add_field_type_triplet(field,field.TypeStyle,data,context);
		}
		ajaxart.runsubprofiles(data,profile,'FieldAspect',ctx);
		
		if (field.DefaultValue) {	// we need to change the FieldData function
			field.FieldData = function(data1,ctx)
			{
				var out = ajaxart.run(data1,profile,'FieldData',aa_merge_ctx(context,ctx));
				if ( aa_totext(out) == '' )
					ajaxart.writevalue(out,this.DefaultValue(data1,ctx),true);
				return out;
			}
		}
		return [field];
	},
Group:function (profile,data,context)  // GC of field.Group
	{
		var out = ajaxart.gcs.field.XmlField(profile,data,context);
		var field = out[0];
		field.IsGroup = true;
		field.HideTitle = aa_bool(data,profile,'HideTitle',context);
		field.CalcFieldsInAdvance = aa_bool(data,profile,'CalcFieldsInAdvance',context);
		field.Fields = (field.CalcFieldsInAdvance) ? ajaxart.runsubprofiles(data,profile,'Field',context) : [];
		field.GroupData = aa_first(data,profile,'GroupData',context);
		if (field.GroupData) {
			field.FieldData = function(data1,ctx) { 
				return this.GroupData.FieldData(data1,ctx) 
			} 
		} else
			field.IsGroupOnlyForLayout = true;
		field.Control = function(data1,ctx) {
			var field = this;
			if (! field.CalcFieldsInAdvance && field.Fields.length == 0)
				field.Fields = ajaxart.runsubprofiles(data,profile,'Field',aa_ctx(context,ctx));
			
			var cntr = (ctx.vars._Cntr && ctx.vars._Cntr[0]) || {};
			var parentItems = cntr.Items || [];
			var newContext = aa_merge_ctx(context,ctx);
			var id = aa_totext(cntr.ID) + '_' + field.Id;
			
			var dataitems = null;
			if (field.GroupData) dataitems = field.GroupData.DataItems(data1,newContext)[0]; 
			if (!dataitems) dataitems = { isObject: true, Items: data1 };
			
			var operationsFunc = function() { return []; }
			var aspectsFunc = function(field) { return function(data2,ctx2) {
				if (field.Aspects) return field.Aspects;	// reuse the apsects (e.g. when using uiaspect.List with group inside)
				
				var newContext = aa_merge_ctx(context,ctx2);
				field.Aspects = ajaxart.run(data,profile,'Layout',newContext);
				var aspect = {isObject:true}
				aa_set_initialize_container(aspect,function(aspect,ctx2,cntr) {
					if (ctx.vars._Cntr && ctx.vars._Cntr[0].ReadOnly) cntr.ReadOnly = true;
				});
				field.Aspects.push(aspect);
				ajaxart.concat(field.Aspects,ajaxart.runsubprofiles(data,profile,'Aspect',newContext));
				for(var i=0;i<field.Fields.length;i++)
					if (field.Fields[i].CntrAspects)
						field.Aspects = field.Aspects.concat(field.Fields[i].CntrAspects);
				
				return field.Aspects;
			}} 
			
			var out = aa_uidocument(data1,id,[dataitems],field.Fields,aspectsFunc(field),operationsFunc,newContext);
//			ajaxart.databind([out],data,newContext,profile,data);
			out.Field = field;
			if (field.IsGroup) jQuery(out).addClass('aa_layoutgroup');
			return [out];
		}
		field.ItemDetailsControl = field.Control; // ???
		
		var newContext = aa_ctx(context,{_Field: [field]} );
		ajaxart.runsubprofiles(data,profile,'FieldAspect',newContext);
		return out;
	}
});

/*********/



aa_gcs("dlg", { 
NearLauncher:function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  dlg.FixDialogPosition = function(firstTime,forceFixLocation) 
	  {
		  var control = this.onElem;
		  if (!control || !this.Frame) return;
		  if (!firstTime && this.Frame.offsetHeight == this.lastHeight) return;
		  var jPopup = jQuery(this.Frame);
		  
		  var mode = aa_text(data,profile,'Location',context);
		  var d;
		  if( window.innerHeight ) 
			  d = { pageYOffset: window.pageYOffset,pageXOffset:window.pageXOffset, innerHeight: window.innerHeight ,innerWidth: window.innerWidth }
		  else if( document.documentElement &&document.documentElement.clientHeight )
			  d = { pageYOffset: document.documentElement.scrollTop , pageXOffset : document.documentElement.scrollLeft, innerHeight : document.documentElement.clientHeight, innerWidth : document.documentElement.clientWidth}
		  else if( document.body )
			  d = { pageYOffset :document.body.scrollTop, pageXOffset :document.body.scrollLeft,innerHeight: document.body.clientHeight,innerWidth :document.body.clientWidth};
		  var launcher_fixed_location = false;
		  jQuery(control).parents().each(function() { if (jQuery(this).css("position") == 'fixed') launcher_fixed_location=true; } );
		  if (launcher_fixed_location) { d.pageYOffset = d.pageXOffset = 0; jPopup[0].style.position = 'fixed'; }
			  
		  jPopup.show();		// shows before moving so offsetHeight,offsetWidth are correct
		  var p_height = this.Frame.offsetHeight;
		  var p_width = this.Frame.offsetWidth;
		  var l_ctrl_height = control.offsetHeight;
		  var l_ctrl_width = control.offsetWidth;
		  var goLeft = aa_bool(data,profile,'PopupLeftOfLauncher',context);
		  this.lastHeight = p_height;
		  
		  // makes sure it doesn't goes more than screen size
  		  if (p_width > d.innerWidth) { jPopup.css("max-width", d.innerWidth + "px"); p_width = this.Frame.offsetWidth; }
  		  if (p_height > d.innerHeight) { jPopup.css("max-height", d.innerHeight + "px"); p_height = this.Frame.offsetHeight;}
  		  
		  var pageX = ajaxart.ui.absoluteLeft(control), pageY = ajaxart.ui.absoluteTop(control);
		  if (!aa_bool(data,profile,'HidingLauncher',context))
			  pageY += l_ctrl_height +2;
		  
		  var padding = 2;
		  if (this.popupLocation == 'up' || (mode != 'below launcher' && d.innerHeight + d.pageYOffset < pageY + p_height && d.pageYOffset <= pageY - p_height - l_ctrl_height - padding)) {	// jPopup going up
			this.popupLocation = 'up';
			pageY  -= p_height + l_ctrl_height + padding +2;
		  }
  		  else if (mode == 'below,above or aside of launcher' && d.innerHeight + d.pageYOffset < pageY + p_height && 
  				d.pageYOffset > pageY - p_height - l_ctrl_height - padding*2) {	// cannot go not up and not down
  			pageY = d.innerHeight/2 - p_height/2 + d.pageYOffset;	// put at center vertically
  			
			if (!goLeft && pageX + l_ctrl_width + p_width +padding <= d.pageXOffset + d.innerWidth) // go right 
				pageX = pageX + l_ctrl_width + padding;
			else if (pageX - p_width >= d.pageXOffset || goLeft) {	// go left
				pageX = pageX - p_width - padding;
				goLeft = false;  // no need to calc the go left again...
			}
			else // go center
				pageX = d.innerWidth/2 - p_width/2+ d.pageXOffset;
		  }
  		  if (d.innerHeight + d.pageYOffset < pageY + p_height)	{ // overflows downwards
  			  var height_diff = p_height - jPopup.height();
  			  jPopup.css("max-height", d.innerHeight + d.pageYOffset - pageY - height_diff - padding + "px");
  			  if (d.innerHeight + d.pageYOffset - pageY - height_diff - padding <= 0)	// dialog too small
  				dlg.Close();
  		  }
		  if (d.pageXOffset + d.innerWidth < pageX + p_width ) {	// overflows rightwards
			  if (pageX - p_width + l_ctrl_width >= d.pageXOffset) {	// go left
				  pageX = pageX + l_ctrl_width - p_width;
				  goLeft = false; // no need to calc the go left again...
			  }
			  else {	// attach center to launching element
//				  pageX = pageX + l_ctrl_width/2 - p_width/2;
//				  if (d.pageXOffset + d.innerWidth < pageX + p_width + padding)	// overflows rightwards
//					 pageX = d.pageXOffset + d.innerWidth - p_width - padding;
//				  else if (d.pageXOffset > pageX )	// overflows leftwards
//						 pageX = d.pageXOffset + padding;
			  }
		  }
		  if (aa_bool(data,profile,'UseFixedPosition',context) && !launcher_fixed_location) {
			  jPopup[0].style.position = 'fixed';
			  pageX -= d.pageXOffset;
			  pageY -= d.pageYOffset;
		  }
		  if (firstTime || forceFixLocation) {
			  var left = goLeft ? pageX - jPopup.width() : pageX, top = pageY;
			  left += aa_int(data,profile,'DeltaX',context);
			  top += aa_int(data,profile,'DeltaY',context);
			  if (left + jPopup.width() > d.innerWidth) 
				  left = d.innerWidth - jPopup.width();
			  if (left < 0 ) left = 0;
			  if (window.fb_params) left += 9;	// TODO: fix this !!!  
			  jPopup.css("left",left).css('top',top).show();
			  
			  aa_invoke_dialog_handlers(dlg.PositionChanged,dlg,context);
		  }
		  
		  if (aa_bool(data,profile,'PopupAtLeastWideAsLauncher',context))
			  jPopup.css('min-width',l_ctrl_width+'px');
	  }
  },
NoCancel:function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  dlg.NoCancel = true;
	  if (!dlg.Buttons) return;
	  for(var i=0;i<dlg.Buttons.length;i++) {
		  if (dlg.Buttons[i].ID == 'OK') {
			  var okbtn = ajaxart.runNativeHelper(data,profile,'OKButton',context)[0];
			  if (okbtn) dlg.Buttons[i] = okbtn;
		  }
		  if (dlg.Buttons[i].ID == 'Cancel') {
			  dlg.Buttons.splice(i,1);
		  }
	  }
  },
CloseOnEsc:function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  dlg.CloseOnEsc = aa_bool(data,profile,'Enabled',context);
	  aa_register_handler(dlg,'KeyDown', function(e,ctx) 
	  {
		 if(e.keyCode == 27) dlg.Cancel();
	  });
  },
ScreenCover:function (profile,data,context) 
  {
	  var dlg = context.vars._Dialog[0];
	  var alreadyExists = dlg.CoverColor != null;
	  dlg.CoverColor = aa_text(data,profile,'Color',context);
	  dlg.CoverOpacity = aa_text(data,profile,'Opacity',context);
	  if (alreadyExists) return;
	  aa_register_handler(dlg,'BeforeOpen', function(dlg,ctx) 
	  {
		//var wrappingDiv = jQuery('<div class="dialog_cover" style="position:absolute;top:0px;left:0px;" />')[0];
		var wrappingDiv = jQuery('<div class="dialog_cover" style="position:fixed;top:0px;left:0px;" />')[0];
		
		wrappingDiv.style.backgroundColor = dlg.CoverColor;
		wrappingDiv.onmousedown = function(e) {
			e = e || event;
			if (e == null) return;
		    if (typeof(Event) != 'undefined' && Event.resolve) Event.cancelBubble(Event.resolve(e)); 
		}
		wrappingDiv.Dialog = dlg;
		var scree_size = ajaxart_screen_size();
		//wrappingDiv.style.width = Math.max(document.documentElement.scrollWidth,scree_size.width) -18 + "px";
		//wrappingDiv.style.height = Math.max(document.documentElement.scrollHeight,scree_size.height) -18 + "px";
		wrappingDiv.style.width = '100%';
		wrappingDiv.style.height = '100%';
		wrappingDiv.style.zIndex = aa_int(data,profile,'MinZIndex',context) + aa_noOfOpenDialogs;
		wrappingDiv.style.opacity = dlg.CoverOpacity;
		wrappingDiv.style.filter = "alpha(opacity=" + dlg.CoverOpacity *100 + ")";	// IE	
		wrappingDiv.tabIndex = 0;
		
	    jQuery(wrappingDiv).keydown( function(event){
	    	if(event.keyCode == 27)	wrappingDiv.Dialog.Cancel();
	    } );
		if (!ajaxart.inPreviewMode) document.body.appendChild(wrappingDiv);
	  });
	  aa_register_handler(dlg,'AfterClose', function(dlg,ctx) 
	  {
		  var covers = jQuery('body').find('.dialog_cover');
		  for(var i=0;i<covers.length;i++)
			  if (covers[i].Dialog == dlg) {
				  aa_remove(covers[i],true);
				  return;
			  }
	  });
  },
DragDialog:function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  aa_register_handler(dlg,'AfterOpen', function(dlg,ctx) {
		  var titleElem = jQuery(dlg.Frame).find(".aa_dialog_title")[0] || (jQuery(dlg.Frame).hasClass('aa_dialog_title') && dlg.Frame);
		  aa_enable_move_by_dragging(dlg.Frame,titleElem,function() { /*ajaxart_dialog_close_all_popups();*/ });
	  });	  
  },
ButtonsHorizontal:function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  dlg.ButtonsControl = function(data1,ctx) {
		var out = jQuery('<table cellpadding="4"><tr/></table>')[0];
		var align_param = aa_text(data,profile,'Align',context);
		var align = align_param;
		if (align_param == "auto")
			align = dlg.Rtl ? 'left' : 'right';
		jQuery(out).css('float',align);
		var tr = jQuery(out).find('tr')[0];
		for(var i=0;i<this.Buttons.length;i++) {
			var btn = this.Buttons[i].Control(data1,ctx)[0];
			var td = jQuery('<td/>')[0];
			td.appendChild(btn);
			tr.appendChild(td);
		}
		return out;
	  }
  },
OpenDialog:function (profile,data,context) 
  {
	var dlg = { isObject: true }
	dlg.Title = aa_multilang_text(data,profile,'Title',context);
	dlg.Data = ajaxart.run(data,profile,'DialogData',context);
	dlg.Contents = aa_first(dlg.Data,profile,'Contents',context);
	dlg.noOfOpenDialogs = window.aa_noOfOpenDialogs;
	dlg.Style = aa_first(data,profile,'Style',context);
	dlg.Mode = dlg.Style.Mode;
	dlg.Context = context;
	
	dlg.onElem = aa_first(data,profile,'LauncherElement',context);
	dlg.JBStudio = (dlg.onElem && jQuery(dlg.onElem).parents('.jbstudio_dlg').length > 0);
	
	function init(dlg) {
	    dlg.createFrame = function() {
	    	if (!dlg.ShowFocusUnderline) {
	    		dlg.Style.Css += ' #this *:focus { outline:none; }';
	    	}
	    	this.StyleClass = aa_attach_global_css(this.Style.Css);
	    	var jElem = jQuery(this.Style.Html);
	    	jElem.addClass(this.StyleClass);
	    	jElem.addClass(ajaxart.deviceCssClass || '');
	    	if (dlg.JBStudio) jElem.addClass('jbstudio_dlg');
	    	
	    	var dialogObject = aa_api_object(jElem);
	    	aa_apply_style_js(dialogObject,this.Style);
	    	return jElem[0];
	    }
		
		dlg.ContentsPlaceholder = function() {
			var out = this.Frame;
			if (jQuery(out).hasClass('aa_dialogcontents')) return out;
			return jQuery(out).find('.aa_dialogcontents')[0];
		}
		dlg.RunOnOK = function() { ajaxart.run(this.Data,profile,'RunOnOK',context); }
		
		dlg.OK = function(data1,ctx) {
			if (!dlg.Frame) return;
			var contents = dlg.ContentsPlaceholder();
			if (! aa_passing_validations(contents) ) return;
			aa_runMethodAsync(this,this.RunBeforeOK,this.Data,dlg.Context,function() {		// allow asyc call before ok (e.g. trying to save on the server)
				if ( jQuery(contents).find('.aa_noclose_message').length > 0 ) return;
				dlg.Close(data1,ctx);
				var ctx2 = aa_ctx(context,{ DialogOriginalData: dlg.Data });
				if (dlg.onElem) ctx2.ControlElement = [dlg.onElem];
				ajaxart.run(dlg.Data,profile,'RunOnOK',ctx2);
			});
		}
		dlg.Apply = function(data1,ctx) {
			var ctx2 = aa_ctx(context,{ DialogOriginalData: dlg.Data});
			ajaxart.run(this.Data,profile,'RunOnOK',ctx2);
		}
		dlg.Cancel = function(data1,ctx) {
//			if (dlg.NoCancel) return this.OK(data1,ctx);
			this.Close(data1,ctx);
			if (this.RunOnCancel) this.RunOnCancel(data,context);
			jBart.trigger(dlg,'cancel');
		}
		dlg.Open = function(data1,ctx) {
			var dlg = this;
			// first close all popups
			if (! ajaxart.inPreviewMode) {
				if (!this.DontCloseOtherPopupsOnOpen) {
					if (! dlg.JBStudio) {
						var stop = false;
						while (ajaxart.dialog.openPopups.length > 0 && !false) {
							var dialogCount = ajaxart.dialog.openPopups.length;
						    aa_closePopup(ajaxart.dialog.openPopups[ajaxart.dialog.openPopups.length-1]);
						    if (ajaxart.dialog.openPopups.length == dialogCount)	// the popup is not closed
						    	stop = true;
						}
					} else {
						// a studio dialog...do not close runtime popups
						var openPopups= [];
						for(var i=0;i<ajaxart.dialog.openPopups.length;i++) {
							var popup = ajaxart.dialog.openPopups[i];
							if (!popup.Dlg || !popup.Dlg.JBStudio) {
								openPopups.push(popup);
							} else {
								// a design time popup - closing it
								aa_uncapture_for_popup(popup);
								if (!popup.Dlg) {	
									aa_remove(popup.contents.parentNode,true);
								}
								if (popup.Dlg) popup.Dlg.Close([],ajaxart.newContext(),true);
							}
						}
						ajaxart.dialog.openPopups = openPopups;
					} 
				}
			}
			
			if (this.Mode == 'dialog') aa_noOfOpenDialogs++;
			
			//var cls = dlg.DialogClass;
			dlg.Frame = dlg.createFrame();
			aa_invoke_dialog_handlers(dlg.BeforeOpen,dlg,context);  // screen cover etc.
			
			aa_openDialogs.push(dlg);
			
			if (this.Mode == 'popup') {
			  dlg.Popup = {Dlg: dlg, contents: dlg.Frame, onElem: dlg.onElem};
			  ajaxart.dialog.openPopups.push(dlg.Popup);
			  setTimeout( function() { aa_capture_for_popup(dlg.Popup); dlg.Popup.initialized = true; }, 1 );
			}
			
			dlg.Frame.Dialog = dlg;
			var jFrame = jQuery(dlg.Frame);
			aa_defineElemProperties(dlg.Frame,'counter');
			
			dlg.Frame.counter = ++aa_dialogCounter;		// used to determine who is the current dialog, in case of more than one dialog
			if (dlg.ZIndex) jFrame.css('zIndex',dlg.ZIndex);
			else			jFrame.css('zIndex',2001 + aa_dialogCounter);
			jFrame.addClass('aa_dlg').addClass(dlg.DialogClass || '');
			
			dlg.Rtl = aa_is_rtl(dlg.onElem) && ! dlg.AlwaysLTR;
			if (jQuery(dlg.onElem).parents('.jbstudio').length > 0) jFrame.addClass('jbstudio');
			
			if (dlg.Rtl) jFrame.addClass('right2left');
			
			if (! ajaxart.inPreviewMode) jFrame.addClass('aa_dlg').css('position','absolute');
			if (dlg.Title && jFrame.find('.aa_dialog_title').length >0) {
				var titleDiv = jQuery('<div class="aa_dialog_title_text"/>')[0];
				titleDiv.innerHTML = dlg.Title;
				jFrame.find('.aa_dialog_title')[0].appendChild(titleDiv);
			}
			if (dlg.Contents) {
				dlg.ContentsPlaceholder().appendChild(dlg.Contents);
			  dlg.Contents.tabIndex = 0;
			}
			if (dlg.Buttons && dlg.Buttons.length > 0 && dlg.ButtonsControl) {
				jQuery(dlg.Frame).find('.aa_dialogbuttons')[0].appendChild(dlg.ButtonsControl(data1,ctx));
			}
			dlg._FixDialogPosition = function() {
				var oldIsReady = dlg.isReady; 
				if (!dlg.isReady && jFrame.find('.aa_dialog_not_ready').length > 0) {
					dlg.isReady = false;
					return;
				}
				dlg.isReady = true;
				if (dlg.FixDialogPosition) dlg.FixDialogPosition(oldIsReady ? false : true);
			    jFrame.show();
			}
			if (! ajaxart.inPreviewMode) {
				document.body.appendChild(dlg.Frame);
			    jFrame.hide();
		    	dlg._FixDialogPosition(true); 
		    	aa_element_attached(dlg.Frame); 
			}
//			setTimeout(function() {
//				if (dlg.Disabled) return;
//				else if (dlg.Contents) dlg.Contents.focus();
//			},1);

		    jQuery(dlg.Frame).keydown( function(e){
				aa_invoke_dialog_handlers(dlg.KeyDown,e||event,context);
			});
			
			aa_invoke_dialog_handlers(dlg.AfterOpen,dlg,context);  // dialog size etc.
		}
		dlg.Close = function(data1,ctx,fromClosePopup) {
			var ctx = this.Context || ctx;
			aa_invoke_dialog_handlers(this.BeforeClose,this);  
			if (this.RunBeforeClose) this.RunBeforeClose(data1,aa_ctx(ctx,{ControlElement: [this.Frame]}));
			var frame = this.Frame;
			if (!this.Frame) return;
			aa_remove(this.Frame,true);
			this.Frame = null;
			if (this.Mode == 'dialog') aa_noOfOpenDialogs--;
			else if (!fromClosePopup) aa_closePopup(this.Popup); 
			
			aa_invoke_dialog_handlers(this.AfterClose,this);  // screen cover etc.
			if (this.RunOnClose) this.RunOnClose(data1,ctx);
			
			jBart.utils.removeFromArray(aa_openDialogs,this);
		}
		var newContext = aa_ctx(context,{_Dialog: [dlg]} );
	
		dlg.Style.Features(data,newContext);
		ajaxart.runNativeHelper(data,profile,'MoreFeatures',newContext);
		ajaxart.runsubprofiles(data,profile,'Feature',newContext);
		
		dlg.Open(data,newContext);
	}
	init(dlg);
  },
CloseIcon:function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  aa_register_handler(dlg,'AfterOpen', function(dlg,ctx) 
	  {
		var jTitle = jQuery(dlg.Frame).find('.aa_dialog_title');
		if (jTitle.length == 0)
			jTitle = jQuery(dlg.Frame);
		if (aa_bool(data,profile,'UseXCharacter',context)) {
			var img = jQuery('<div class="aa_dialog_caption_close xchar"><div></div>');
			img.find('>div').text(aa_text(data,profile,'XCharacter',context));
			img = img[0];
		} else {
			var src = aa_text(data,profile,'Image',context);
			var img = jQuery('<img class="aa_dialog_caption_close" src="'+src+'"/>')[0];
		}
		jQuery(img).addClass( aa_attach_global_css(aa_text(data,profile,'Css',context),null,'close_dialog') );
		img.onclick = function() { dlg.Cancel(dlg.Data,ctx); }
		
		jTitle[0].insertBefore(img,jTitle[0].firstChild);
	  });
  },
AutomaticFocus:function (profile,data,context)
  {
	  if (ajaxart.inPreviewMode) return;
	  var dlg = context.vars._Dialog[0];
	  var focus_on = aa_text(data,profile,'FocusOn',context);
	  aa_register_handler(dlg,'AfterOpen', function(dlg,ctx) {
		  if (focus_on == "first input") {
				setTimeout(function() {
					if (dlg.Disabled) return;
					if (ajaxart.controlOfFocus)
	    	  	  		ajaxart.controlOfFocus.IgnoreBlur = true;
					
					var inp = jQuery(dlg.Contents).find('input');
					if (inp.length > 0) inp[0].focus();
				},1);
		  }
	  },"AutomaticFocus");
  },
DisableBodyScroll:function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  dlg.DisableBodyScroll = aa_bool(data,profile,'Enabled',context);
	  aa_register_handler(dlg,'BeforeOpen', function(dlg,ctx) 
	  {
		  if (!dlg.DisableBodyScroll) return;
		  if (!jBart.dialogs.DisableBodyScroll_counter) jBart.dialogs.DisableBodyScroll_counter =0;
		  jBart.dialogs.DisableBodyScroll_counter++;
		  
		  jQuery('body').css('overflow','hidden');
	  });
	  aa_register_handler(dlg,'AfterClose', function(dlg,ctx) 
	  {
		  if (!dlg.DisableBodyScroll) return;
		  if (--jBart.dialogs.DisableBodyScroll_counter == 0)
			jQuery('body').css('overflow','auto');
	  });
  },
InScreenCenter:function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  dlg.FixDialogPosition = function(firstTime) 
	  {
		if (!dlg.alreadyShown && !firstTime) return;
		if (firstTime) dlg.firstTimeShow = new Date().getTime();
		
		var screenWidth = window.innerWidth || (document.documentElement.clientWidth || document.body.clientWidth);
		var screenHeight = window.innerHeight || (document.documentElement.clientHeight || document.body.clientHeight);

		var scrollOffsetX = document.body.scrollLeft || document.documentElement.scrollLeft;
		var scrollOffsetY = document.body.scrollTop || document.documentElement.scrollTop;
		if (!this.Frame) return;
		var jFrame = jQuery(this.Frame);
	  	
	  	var jDlgBody = jQuery(this.ContentsPlaceholder());
	  	if (jDlgBody.height() > jDlgBody[0].scrollHeight) jDlgBody.height(jDlgBody[0].scrollHeight);
	  	if (jDlgBody.width() > jDlgBody[0].scrollWidth) jDlgBody.width(jDlgBody[0].scrollWidth);

	  	var yCaption = jFrame.height() - jDlgBody.height();
	  	var xCaption = jFrame.width() - jDlgBody.width();
	  	if (jFrame.height() > screenHeight) jDlgBody.height(screenHeight-yCaption-50);
	  	if (jFrame.width() > screenWidth) jDlgBody.width(screenWidth-xCaption-50);

	  	// Handle out of screen
	  	var fixPos = false;
	  	if (ajaxart.ui.absoluteLeft(jFrame[0]) < 0 || screenWidth - jFrame.width() - ajaxart.ui.absoluteLeft(jFrame[0]) < 0) fixPos = true;
	  	if (ajaxart.ui.absoluteTop(jFrame[0]) < 0 || screenHeight - jFrame.height() - ajaxart.ui.absoluteTop(jFrame[0]) < 0) fixPos = true; 
	  	
	  	if (firstTime || aa_bool(data,profile,'AlwaysInScreenCenter',context) || fixPos) {
		  jFrame.css('left',Math.max(5,(screenWidth - jFrame.width())/2) + "px");
		  jFrame.css('top',Math.max(5,(screenHeight - jFrame.height())/2) + "px");
		  jFrame[0].style.position = 'fixed';
	  	}
	  	dlg.alreadyShown = true;
	  }
  },
OKOnEnter:function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  dlg.OKOnEnter = aa_bool(data,profile,'Enabled',context);
	  aa_register_handler(dlg,'KeyDown', function(e,ctx) 
	  {
		 if(e.keyCode != 13 || !dlg.OKOnEnter) return;
		 
		 var elem = (typeof(event)== 'undefined')? e.target : event.srcElement;
	     if (!elem || elem.tagName.toLowerCase() != 'textarea') 
	       dlg.OK(data,context);
	  });
  }
});

/*********/



aa_gcs("dialog_style", { 

});

/*********/



aa_gcs("dialog", { 
CloseDialog:function (profile,data,context)
  {
	  // close old dialogs
	  var closeType = aa_text(data,profile,'CloseType',context);
	  var ignoreAAEditor = aa_bool(data,profile,'IgnoreAAEditor',context);
	  
	  aa_close_dialog_old(closeType,ignoreAAEditor);
  },
IsRuntimeDialog:function (profile,data,context)
  {
  	var activating_controls = ajaxart.getVariable(context,"OriginalControlElement");
  	if (jQuery(activating_controls[0]).parents(".runtime").length > 0 ) return ["true"];
  	return [];
  },
FixTopDialogPosition:function (profile,data,context)
  {
	  return aa_fixTopDialogPosition();
  },
TopDialogContent:function (profile,data,context)
  {
	  var part = aa_text(data,profile,'Part',context);
	  var find_class = ".dialog_content";
	  var topDialogNew = aa_top_dialog();
	  if (openDialogs.length == 0 && !topDialogNew) return [];
	  var dlg = openDialogs[openDialogs.length-1];
	  if (part == "Content") {  // backward compatability
		  if (!dlg) return topDialogNew;  // only new dialogs are opened
	  }
	  if (part == "Data") {
		  if (dlg == null || dlg.dialogContent == null ||dlg.dialogContent.ajaxart == null) return [];
		  return ajaxart.getVariable(dlg.dialogContent.ajaxart.params,"DialogWorkingData");
	  }
	  if (part == "Title")
		  find_class = ".dialog_title_text";
	  var result = jQuery(dlg.dialogContent).find(find_class);
	  if (part == "All")
	  	result = jQuery(dlg.dialogContent);
	  if (result.length == 0) return [];
	  return [result[0]];
  },
PopUpDialog:function (profile,data,context)
  {
	  	var content = aa_first(data,profile,'Dialog',context);
	  	var screenColor = aa_text(data,profile,'ScreenColor',context);
	  	var screenOpacity = aa_first(data,profile,'ScreenOpacity',context);
	  	var previewMode = ajaxart.inPreviewMode == true; 
	  	if (previewMode) return [];
	  	jQuery('body').addClass('body_with_open_dialog');
			// determining direction
	  	var activating_controls = ajaxart.getVariable(context,"OriginalControlElement");
	  	if (jQuery(activating_controls[0]).parents(".runtime").length > 0 ) 
	  	  jQuery(content).addClass('runtime');
  		
	  	var isRtl = false;
	  	if (!aa_bool(data,profile,'AlwaysLTR',context)) {
	  		if (jQuery(activating_controls[0]).parents(".right2left").length > 0) isRtl = true;
	  		else {
	  			if (activating_controls.length == 0 || ! ajaxart.isattached(activating_controls[0])) {
	  				// sometimes activating_controls is empty or detached and it still should be rtl
	  				isRtl = jQuery("body").find('.right2left').length > 0;
	  			}
	  		}
	  	}
	  	if (isRtl)
    	  jQuery(content).addClass("right2left");
	  		
	  	    if (!previewMode) content.style.position="absolute";
			jQuery(content).addClass("ajaxart " + ajaxart.deviceCssClass);
			
			if (!previewMode)
				document.body.appendChild(content);

			// making sure that width/height are not too big
			var screenWidth = window.innerWidth || (document.documentElement.clientWidth || document.body.clientWidth);
			var screenHeight = window.innerHeight || (document.documentElement.clientHeight || document.body.clientHeight);
			/*			if (jQuery(content).width() > screenWidth - 10) {
				jQuery(content).width(screenWidth - 10);
				content.style.tableLayout = "fixed";
			}
			if (jQuery(content).height() > screenHeight - 10) {
				jQuery(content).height(screenHeight - 10);
				content.style.tableLayout = "fixed";
			}*/
			var fix_height_width = function() {
				content.style.visibility = 'visible';
				// determining center position
				var scrollOffsetX = 0;
				var scrollOffsetY = 0;
				// taken fron http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
				if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
			    //DOM compliant
					scrollOffsetY = document.body.scrollTop;
					scrollOffsetX = document.body.scrollLeft;
			  } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
			    //IE standards compliant mode
			  	scrollOffsetY = document.documentElement.scrollTop;
			    scrollOffsetX = document.documentElement.scrollLeft;
			  }	
				content.style.left = Math.max(5,(screenWidth - jQuery(content).width())/2) + scrollOffsetX + "px";
				content.style.top = Math.max(5,(screenHeight - jQuery(content).height())/2) + scrollOffsetY + "px";

				ajaxart.setVariable(context,"ControlElement",[ content ]);
				content.focus();
			  	ajaxart.run(data,profile,'RunAfterPopup',context);
			}
//	  		content.position = "absolute";
			aa_enable_move_by_dragging(content,jQuery(content).find(".dialog_title")[0],function() { ajaxart_dialog_close_all_popups(); });
//			jQuery(content).draggable(
//					{ 
//					  cancel: '.dialog_body',
//					  start: function(event, ui) { ajaxart_dialog_close_all_popups(); } // close open popups
//				});

			var doc = document;
			window.aa_noOfOpenDialogs = window.aa_noOfOpenDialogs || 0;
			if (!previewMode) aa_noOfOpenDialogs++;
			
			var docHeight = Math.max(doc.body.scrollHeight, doc.body.clientHeight);
			var docWidth = Math.max(doc.body.clientWidth, doc.body.scrollWidth);
						
			wrappingDiv = doc.createElement("DIV");
			aa_defineElemProperties(wrappingDiv,'OldDialog,aa_noOfOpenDialogs,dialogContent');

			wrappingDiv.noOfOpenDialogs = aa_noOfOpenDialogs;
			wrappingDiv.OldDialog = true;
			wrappingDiv.className = "dialog_cover";
			//wrappingDiv.style.position="absolute";
			wrappingDiv.style.position="fixed";
			if (!previewMode) 
			  doc.body.appendChild(wrappingDiv);
			
			wrappingDiv.style.backgroundColor = screenColor;
			wrappingDiv.onmousedown = function(e) {
				e = e || event;
				if (e == null) return;
//				ajaxart_stop_event_propogation(e);

			   if (typeof(Event) != 'undefined' && Event.resolve)
					Event.cancelBubble(Event.resolve(e)); 
			}
			wrappingDiv.dialogContent = content;
			var scree_size = ajaxart_screen_size();
			//wrappingDiv.style.width = Math.max(document.documentElement.scrollWidth,scree_size.width) + "px";
			//wrappingDiv.style.height = Math.max(document.documentElement.scrollHeight,scree_size.height) + "px";
			wrappingDiv.style.width = "100%";
			wrappingDiv.style.height = "100%";
			++aa_dialogCounter;
			wrappingDiv.style.zIndex = 2000 + aa_dialogCounter;
			wrappingDiv.style.top="0px";
			wrappingDiv.style.left="0px";
			wrappingDiv.style.opacity = screenOpacity;
			if (typeof(wrappingDiv.style.filter) != "undefined") { wrappingDiv.style.filter = "alpha(opacity=" + screenOpacity*100 + ")"; }	

			content.style.zIndex = 2001 + aa_dialogCounter;
			content.tabIndex = 0;
			
			if (!previewMode) openDialogs.push(wrappingDiv);
			
			if (!previewMode) {
				content.style.visibility = 'hidden';
 			    setTimeout( function() { fix_height_width(); } ,1);
			}
			aa_element_attached(content);

			return [content];
	  }
});

/*********/



aa_gcs("data_items", { 
Items:function (profile,data,context)
	{
		var out = { isObject: true };

		out.ItemTypeName = ajaxart.run(data,profile,'ItemTypeName',context);
		out.Items = ajaxart.run(data,profile,'Items',context);

		var refreshFunc = function(out) { this.run = function() { out.Items = ajaxart.run(data,profile,'Items',context); return ["true"];} };
		ajaxart_addScriptParam_js(out,'Refresh',new refreshFunc(out).run,context);

		var newContext = aa_ctx(context,{_Items: [out]} );
		ajaxart.runsubprofiles(data,profile,'Aspect',newContext);
		
		if (! out.Subset) {
			out.Subset = function(data1,ctx) { 
				var subset = { isObject: true, Items: ctx.vars._InnerItem };
				return [subset];
			}
		}
		return [out];
	}
});

/*********/



aa_gcs("data", { 
FirstSucceeding:function (profile,data,context)
	  {
	    var itemProfiles = ajaxart.subprofiles(profile,'Item');

	    for(var i=0;i<itemProfiles.length;i++)
	    {
	    	var subresult = ajaxart.run(data,itemProfiles[i],"",context);
	    	if (subresult.length > 0) return subresult;
	    }
	  	
	  	return [];  	
	  },
Pipeline:function (profile,data,context)
	  {
		if (data.length > 1) data = [ data[0] ];
	  	var itemProfiles = ajaxart.subprofiles(profile,'Item');
	  	var nextData = data;
	  	
	  	for(var i=0;i<itemProfiles.length;i++) 
	  	{
	  		var itemProfile = itemProfiles[i];
	  		
	  		var arr = [];
	  		if (nextData.length == 0 && i != 0) return [];
	  		
			if (data.length <= 1 && i == 0)
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
		  
	    for(var i=0;i<aggProfiles.length;i++)
		  nextData = ajaxart.run(nextData,aggProfiles[i],'',context); 

	  	return nextData;  	
	  },
List:function (profile,data,context)
	  {
	    var items = ajaxart.subprofiles(profile,'Item');
	  	var out = [];
	  	
	  	for(var i=0;i<items.length;i++) {
	  	  var next = ajaxart.run(data,items[i],"",context);
	  	  ajaxart.concat(out,next);
	  	};
	  	
	  	return out;  	
	  },
JustInTimeCalculation:function (profile,data,context)
	  {
		  var out = { isObject:true, Content:null };
		  out.GetContent = function(data1,ctx) {
			  if (out.Content == null) {
				  out.Content = ajaxart.run(data1 || data,profile,'Content',aa_merge_ctx(context,ctx));
			  }
			  return out.Content;
		  }
		  return [out];
	  },
ItemByID:function (profile,data,context)
	  {
		  var list = ajaxart.run(data,profile,'List',context);
		  var id = aa_text(data,profile,'ID',context);
		  
		  for(var i=0;i<list.length;i++)
			  if (list[i].ID == id) return [ list[i] ];
		  
		  return [];
	  },
Url:function (profile,data,context)
  {
	  var str = "" + window.location.href;
	  return [str];
  },
IfThenElse:function (profile,data,context)
	  { 
		return aa_ifThenElse(profile,data,context);
	  },
Lookup:function (profile,data,context)
	  {
		  var lookupname = aa_text(data,profile,'LookupName',context);
		  var version = ajaxart.run(data,profile,'Version',context);
		  var refresh = false;
		  if (typeof(ajaxart.lookup_cache[lookupname]) == "undefined")
			  refresh = true;
		  else
		  {
			  var cur_version = ajaxart.lookup_cache[lookupname].Version;
			  if (version > cur_version)
				  refresh = true;
		  }
		  
		  if (refresh)
		  {
			  var cache = {};
			  var allItems = ajaxart.run(data,profile,'AllItems',context);
			  for(var i=0;i<allItems.length;i++)
			  {
				  var item = allItems[i];
				  var code = aa_text([item],profile,'ItemCode',context);
				  var value = ajaxart.run([item],profile,'ItemValue',context);
				  if (code == "") continue; //{ ajaxart.log("Lookup of " + lookupname +"- code is empty/null", "warning"); continue; }
				  if (cache[code] == null)
				  	cache[code] = [];
				  for(var j=0;j<value.length;j++)
				  	cache[code].push(value[j]);
			  }
			  ajaxart.lookup_cache[lookupname] = cache;
			  ajaxart.lookup_cache[lookupname].Version = version;
		  }
		  var cache = ajaxart.lookup_cache[lookupname];
		  var code = aa_text(data,profile,'LookFor',context);
		  var result = cache[code];
		  if (typeof(result) == "undefined") return [];
		  return result;
	  },
AddSeparator:function (profile,data,context)
	  {
	    var addBefore = aa_first(data,profile,'AddBefore',context);
	    var addAfter = aa_first(data,profile,'AddAfter',context);
	    
	  	var out = [];
	  	
	  	if (addBefore != null)
	  		out.push(addBefore);
	  	ajaxart.each(data,function(item,i) {
	  	    var Separator = aa_first(data,profile,'Separator',context);
	  		out.push(item);
	  		if (i+1 < data.length && Separator != null)
	  		  out.push(Separator);
	  	});
	  	if (addAfter != null)
	  		out.push(addAfter);
	  	
	  	return out;  	
	  },
Duplicate:function (profile,data,context)
  {
	  if (data.length == 0) return [];
	  var item = data[0];
	  if (typeof(item) == 'string' || typeof(item) == 'number' )
		  return [ "" + item ];
	  if (ajaxart.isxml_item(item) && item.nodeType == 1)// xml element
		  return [ajaxart.parsexml(ajaxart.xml2text(item))];
		  //return [ ajaxart.xml.clone(data) ];
	  if (ajaxart.isxml_item(item) && item.nodeType == 2)// xml attribute : duplicate to string
		  return [ ajaxart.xml.clone(data) ];
	  // handle struct ...
	  return data;
  },
Same:function (profile,data,context)
	  {
	  	return data;
	  }
});

/*********/



aa_gcs("clear_button", { 

});

/*********/



aa_gcs("button", { 

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



aa_gcs("bart_resource", { 

});

/*********/



aa_gcs("bart", { 

});

/*********/



aa_gcs("action_async", { 
RunAsync:function (profile, data, context)
	{
	    var failure = ajaxart.xml.xpath(ajaxart.parsexml('<xml value=""/>'),'@value');
	    var newContext = aa_ctx(context,{ AyncFailure : failure });
	    
		ajaxart_RunAsync(data,ajaxart.fieldscript(profile,'Action'),newContext,function(data1,ctx,success) {
			ajaxart.run(data,profile,success ? 'OnSuccess' : 'OnFailure',context);
		});
		return ["true"];
	}
});

/*********/



aa_gcs("action", { 
RunActionOnItems:function (profile,data,context)
	{
		var items = ajaxart.run(data,profile,'Items',context);
		
		var indicateLast = aa_bool(data,profile,'IndicateLastItem',context);
		var indicateIndex = aa_bool(data,profile,'IndicateItemIndex',context);
		
		for (var i=0;i<items.length;i++)
		{
			var ctx = context;
			if (indicateIndex) ctx = aa_ctx(ctx,{_ItemIndex: [''+i]});
			if (i == items.length-1 && indicateLast) ctx = aa_ctx(ctx,{_IsLastItem: ["true"]}); 
			ajaxart.run([items[i]],profile,'Action',ctx);
		}
	},
WriteValue:function (profile,data,context)
	{
		var into = ajaxart.run(data,profile,'To',context);
		var value = ajaxart.run(data,profile,'Value',context);
		if (ajaxart.isObject_array(into) && into[0]["WriteValue"] != null) { // value by ref
		  ajaxart.runScriptParam(value,into[0]["WriteValue"],context);
		}
		else {
		  ajaxart.writevalue(into,value);
		}
		return ["true"];
	},
IfThenElse:function (profile,data,params)
{
	  return aa_ifThenElse(profile,data,params);
},
Switch:function (profile,data,context)
{
	  return aa_switch(profile,data,context);
},
RunActions:function (profile,data,context)
	{
	    var actionProfs = ajaxart.subprofiles(profile,'Action');
	  	var result = [];
	  	
	  	for(i in actionProfs)
	  		result = ajaxart.run(data,actionProfs[i],"",context);
	  	
		return ["true"];
	}
});

/*********/



aa_gcs("jbart_api", { 
ShowWidget:function (profile,data,context)
	{
		var out = aa_show_jbart_widget({
			WidgetXml: aa_first(data,profile,'WidgetXml',context),
			Language: aa_text(data,profile,'_Language',context),
			Page: aa_text(data,profile,'Page',context),
			Context: context,
			RunAfter: function(data,ctx) { 
				ajaxart.run(data,profile,'RunAfter',aa_merge_ctx(context,ctx));		
			}
		});
		return [out];
	}
});

/*********/



aa_gcs("jbart", { 

});