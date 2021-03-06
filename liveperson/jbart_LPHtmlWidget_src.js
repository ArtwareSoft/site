(function(){
var ajaxart = { debugmode: false, xtmls_to_trace: [], trace_level: 2,           traces : [], components: [], componentsXtmlCache: [], usages: [], types: [], plugins: [], gcs: {},           log_str: '', loading_objects : 0, logs: {}, default_values: [], inPreviewMode: false, stack_trace: [], build_version: 'ART_NOW',           xml: {}, cookies: {}, ui: {}, yesno: {}, dialog: { openPopups: []}, xmlsToMonitor: [], lookup_cache: {}, occurrence_cache: {},           unique_number: 1, action: {}, runningTimers: {}, runDelayed: [], hasVarsRegex: /\%[^ ,;\(\)]/ , STRING_WITH_EXP: /%[^ ,;\(\)]/, NOT_EXP: /^[ ,;\(\)]/,};          window.jBartWidgets = window.jBartWidgets || { vars: {} };
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

function aa_itemlist_as_table(itemlist,settings) 
{
	  settings = settings || { showHeaders: true };
	  
	  itemlist.ItemTemplate = itemlist.jControl.find('.aa_item').remove()[0];
	  itemlist.ParentOfItems = itemlist.jControl.find('tbody')[0]; 
	  itemlist.RenderItem = function (item, elem) {
	    var fields = itemlist.VisibleFields;
	    var cellTemplate = jQuery(elem).find('.aa_cell').remove()[0];
	    for(var i=0;i<fields.length;i++) {
	      var cell = cellTemplate.cloneNode(true);
	      itemlist.CreateFieldControl(item,cell,fields[i]);
	      elem.appendChild(cell);
	    }
	  }
	  var headerTemplate = itemlist.jControl.find('.aa_header_field')[0];
	  var headerParent = headerTemplate.parentNode;
	  jQuery(headerTemplate).remove();
	  
	  if (settings.showHeaders) {
		  var fields = itemlist.VisibleFields;
		  for(var i=0;i<fields.length;i++) {
		      var headerCell = headerTemplate.cloneNode(true);
		      headerCell.jbField = fields[i]; // needed for sort and group by
		      jQuery(headerCell).find('.title').html( fields[i].Title );
		      headerParent.appendChild(headerCell);
		  }
	  }
	  
	  itemlist.OpenInplace = function(itemElement,inplaceControl) {
	    var inplaceTR = jQuery('<tr class="aa_details_inplace"><td/></tr>');
	    inplaceTR.find('td').attr('colspan',jQuery(itemElement).find('>td').length).append(inplaceControl);
	    inplaceTR.insertAfter(itemElement);
	    itemElement.jbDetailsElement = inplaceTR[0];      
	  }
	  itemlist.CloseInplace = function(itemElement,inplaceControl) {
	    if (itemElement.jbDetailsElement) {
	      jBart.remove(itemElement.jbDetailsElement);
	      itemElement.jbDetailsElement = null;
	    }
	  }
}



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



function aa_createElement(elem, tag)
{
	if (elem == null || !ajaxart.isxml(elem))
		return ajaxart.parsexml("<" + tag + "/>");
	if (ajaxart.isBackEnd)
		return elem.getOwnerDocument().createElement(tag);
	return elem.ownerDocument.createElement(tag);
}



function aa_totext(data)
{
	if (typeof(data) == "string") return data;
	if (data == null || data.length == 0) return "";
	return ajaxart.totext_item(data[0]);
}



function aa_frombool(bool) 
{
  if (bool) return ["true"];
  return [];
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



function aa_int(data,script,field,params,method)
{
	var result = ajaxart.run(data,script,field,params,method);
	return parseInt(ajaxart.totext_array(result));
}



function aa_tobool(data)
{
  if (data == null || data.length == 0) return false;
  if (ajaxart.totext_array(data)=="true") return true;
  return false;
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



function aa_first(data,script,field,params,method) {
	var result = ajaxart.run(data,script,field,params,method);
	if (result.length == 0) return null;
	return result[0];
}



function aa_merge_ctx(context,contextVars,moreVars)
{
  var result = { params: context.params , vars: contextVars.vars , componentContext: context.componentContext , _This: contextVars._This};
  if (moreVars)
	  result = aa_ctx(result,moreVars);
  return result;
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



function aa_ctx(context,vars)
{
  var out = ajaxart.clone_context(context);
  for (var i in vars) out.vars[i] = vars[i];
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



function aa_init_agent_widgets()
{
liveperson.agentwidgets = liveperson.agentwidgets || {}
liveperson.agentwidgets.YoutubeVideo = function(params)
{
	return {
	    getChannelType: function () { return 'youtubeVideo'; },
	    _setJBartContext: function(context) { this.context = context; },
		init: function(agentApi,widgetContext) {
		  var context = this.context;
		  var widget = this;
		  agentApi.bind('agentCollaborationEvent',function(evt) {
			  var cannedEvents = ajaxart.getVariable(context,'VideoList')[0];
			  var eventXml = aa_xpath(cannedEvents,"*[@key='"+evt.agentEvent.args.youtubeID+"']")[0];
			  if (eventXml && eventXml.getAttribute('sentToVisitor') != 'true') {
				  eventXml.setAttribute('sentToVisitor','true');
				  agentApi.trigger('agentCollabEventCannedUpdated', { agentEvent: evt.agentEvent, eventXml: eventXml });
			  }
		  });

		  var imagesDir = aa_totext(ajaxart.getVariable(context,'LPImages'));
			
		  widgetContext.setLocationContent(liveperson.location.widgetMenu,{
			  icon: imagesDir+'/agent-video-tab.png',
			  title: ajaxart_multilang_text('video_tab_title',context)
		  });

		  widgetContext.setLocationContent(liveperson.location.widgetArea,{
			  control: jBart.utils.lpacShowPageFunc('video',context)
		  });
		  
		  function activityLogStatus(collabEvent) 
		  {
				if (collabEvent.command == 'stateChange') {
					var state = collabEvent.args.state;
					var key = 'video_log_' + collabEvent.args.state;
					var result = ajaxart_multilang_text(key,context);
					return (result == key) ? '' : result;
				}
				return '';
		  }
		  
		  widgetContext.setLocationContent(liveperson.location.activityLog,{
			  icon: imagesDir+'/agent-video.png',
			  title: function(collabEvent) { return liveperson.utils.escapeHTML(collabEvent.args.title) }, 
			  status: activityLogStatus
		  });
		  
		  widgetContext._asyncTabLoad = function(callback) {
			if (widget._videoListLoaded) { return callback(); }
			widget._videoListLoaded = true;
			widget._loadVideoList(callback);
		  }
		  
		},
		_loadVideoList: function(callback) {
			var context = this.context;
			var path = params.cannedResponsesPath || 'LPConnect.Youtube';
			path = escape(path);
			if (jBart.lpacAgent._getCannedResponses && !jBart._lpacSimulator) {
				jBart.lpacAgent._getCannedResponses({ 
					path: path,
					success: function(contentElements) {
					    if (contentElements) {
					    	var videoListXml = jBart.parsexml('<videos/>');
					    	
					    	for(var i in contentElements) {
					    		var item = contentElements[i];
					    		var title = item['@name'];
					    		var key = item['$'];
					    		var elem = jBart.parsexml('<video/>',videoListXml);
					    		elem.setAttribute('title',title);
					    		elem.setAttribute('key',key);
					    		
					    		videoListXml.appendChild(elem);
					    	}
					    	ajaxart.xml.copyElementContents(ajaxart.getVariable(context,'VideoList')[0],videoListXml);
					    }
						callback();
					},
					error: callback
				});
			} else {
				callback();
			}
		}
	}
}
liveperson.agentwidgets.VoiceEscalation = function(profile,context)
{
	return {
		getChannelType: function () { return 'voiceEscalation'; },
	    _setJBartContext: function(context) { this.context = context; },
		init: function(agentApi,widgetContext) {
			var context = this.context;
			var imagesDir = aa_totext(ajaxart.getVariable(context,'LPImages'));
			
		    widgetContext.setLocationContent(liveperson.location.widgetMenu,{
			  icon: imagesDir+'/agent-voice-tab.png',
			  title: ajaxart_multilang_text('voice_tab_title',context)
			});
			
		    widgetContext.setLocationContent(liveperson.location.widgetArea,{
		    	control: jBart.utils.lpacShowPageFunc('voice',context)
		    });
		    
			widgetContext.setLocationContent(liveperson.location.activityLog,{
				icon: imagesDir+'/agent-voice.png',
				title: function(collabEvent) { return ajaxart_multilang_text('voice_log_title',context); }, 
				status: function(collabEvent) { 
					var key = 'voice_log_' + collabEvent.command;
				    return ajaxart_multilang_text(key,context);
				} 
			});		    
		}
	}
}
}



function aa_field_handler(field,event,handler,id,phase)
{
	aa_register_handler(field,event,handler,id,phase);
}



function aa_addOnAttach(elem,func)
{
	jQuery(elem).addClass('aa_onattach');
	elem.OnAttach = func;
	if (ajaxart.isattached(elem)) elem.OnAttach();
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



function aa_itemlistContainer(items) {
    var ItemListCntr = {
        Items: items
    };
    // .bind ,.trigger are here to make the using code look a bit nicer
    ItemListCntr.bind = function(evt,callback,id) { jBart.bind(ItemListCntr,evt,callback,id); }
    ItemListCntr.trigger = function(evt,obj) { jBart.trigger(ItemListCntr,evt,obj); }
    
    return ItemListCntr;
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



function aa_setCssText(elem,cssText)
{
  if (ajaxart.isFireFox) cssText = cssText.replace(/-webkit-/g,'-moz-');
  elem.style.cssText = cssText;
}



function aa_defineElemProperties(elem,properties)
{
	if (!elem.jBartDomProps) elem.jBartDomProps = properties.split(',');
	else ajaxart.concat(elem.jBartDomProps,properties.split(','));
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



function aa_multilang_text(data,script,field,context)
{
	return ajaxart_multilang_run(data,script,field,context)[0] || '';
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



function aa_ItemList(field,context) {
    var itemlist = {
    	Id: field.Id,
        Fields: []
    };
    itemlist.Context = aa_ctx(context,{ItemList: [itemlist]});
    itemlist.itemlistCntr = context.vars.ItemListCntr ? context.vars.ItemListCntr[0] : aa_itemlistContainer([]);

    itemlist.RenderItem = function (item, elem) { // the view should override this method
    	itemlist.CreateFieldControls(item,elem);
    }
    itemlist.ClearItems = function () {
        aa_empty(this.ParentOfItems, true);
    }
    itemlist.AppendItemElement = function (elem) {
        this.ParentOfItems.appendChild(elem);
    }
    itemlist.ElementOfItem = function(item) {
        var elem = this.ItemTemplate.cloneNode(true);
        jQuery(elem).addClass('aa_item');
        elem.Item = item;
        this.RenderItem(item, elem);
        this.trigger('itemElement',elem);
        return elem;
    }
    itemlist.ShowItems = function () {
        var items = this.itemlistCntr.Items;
        // Incremental build is done by an aspect - this code is simple rendering
        for (var i = 0; i < items.length; i++) {
            var item = [items[i]];
            var elem = itemlist.ElementOfItem(item);
            this.AppendItemElement(elem);
        }
    }
    itemlist.Refresh = function () {
        itemlist.ClearItems();
        itemlist.ShowItems();
        itemlist.trigger('refresh');
    }
    itemlist.SetHtmlTemplate = function (html) {
        this.jControl = jQuery(html).addClass('aa_itemlist');
        this.Ctrl = this.jControl[0];
        this.Ctrl.jbItemList = itemlist;
        this.ParentOfItems = this.jControl[0];
    }
    itemlist.CreateFieldControls = function (item, elem) {
        var item = elem.Item;
        for (var i = 0; i < this.VisibleFields.length; i++) {
            var field = this.VisibleFields[i];

            var wrapper = jQuery('<div/>')[0];
            itemlist.CreateFieldControl(item, wrapper,field);
            elem.appendChild(wrapper);
        }
    }
    itemlist.RefreshItemElement = function(elem) {
    	var newElem = this.ElementOfItem(elem.Item);
    	aa_replaceElement(elem,newElem,true);
    	itemlist.trigger('refreshItemElement',{ NewElement: newElem, PreviousElement: elem } );
    }
    itemlist.CreateFieldControl = function (item, wrapper,field) {
		var fieldData = field.FieldData ? field.FieldData(item, context) : item;
		aa_fieldControl({ Field: field, Item: item, Wrapper: wrapper, Context: context });
    }
    itemlist.GetElements = function() {
    	return this.ParentOfItems.childNodes;  // An aspect can change this logic
    }
    // itemlist.bind ,itemlist.trigger are here to make the using code look a bit nicer
    itemlist.bind = function(evt,callback,id) { jBart.bind(itemlist,evt,callback,id); }
    itemlist.trigger = function(evt,obj) { jBart.trigger(itemlist,evt,obj); }
    
    itemlist.SetHtmlTemplate('<div><div class="aa_item"/></div>'); // default
    itemlist.ItemTemplate = itemlist.jControl.find('.aa_item').remove()[0];
    
    itemlist.itemlistCntr.bind('itemsChanged',function() {
    	itemlist.Refresh();
    });
    return itemlist;
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



function aa_ifThenElse(profile,data,context)
{
	if (aa_bool(data,profile,'If',context))
		return ajaxart.run(data,profile,'Then',context);
	else
		return ajaxart.run(data,profile,'Else',context);
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
				else
					resources.push( aa_first([],resourceXtml,'',aa_ctx(context,{WidgetId: [widgetId]})) );
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



function ajaxart_field_is_readOnly(cntr,field,context)
{
	if (field.Writable) return false;
	if (field.ReadOnly == true) return true;
	if (ajaxart_object_run_boolean_method(field,'ReadOnly',[],context)) return true;
	if (!cntr) return false;
	if (cntr.Items == null) return true;
	if (cntr.Items.length == 0) ;
	if (cntr.Items[0].ReadOnly == true) return true;
	if (cntr.ReadOnly) return true;
	return ( cntr.Items[0].ReadOnly != null && ajaxart.tobool_array(cntr.Items[0].ReadOnly) );
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



function ajaxart_addScriptParam_js(structItem,structField,jsFunc,context)
{
	structItem[structField] = {	context: context , compiled: jsFunc };
}



ajaxart.subprofiles = function (profile,field) 
{
  return ajaxart.childElems(profile,field);
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
      	 ;
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
  	    	 ;
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
		   ;
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
//	     if (contextForXtml.counter == 50) { ; window.alert('endless loop'); throw "endless loop"; }
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



ajaxart.isArray = function (obj) 
{
	return Object.prototype.toString.call( obj ) === '[object Array]';
}



ajaxart.log = function (message,type) 
	{
		if (type == null) type = "";
		var log_message = type + " - " + message;
		ajaxart.log_str += log_message + "\n\r";

		if (type == "") type = "general";
		if (ajaxart.logs[type] == null)
			ajaxart.logs[type] = [];
//		if (type=="error") ;
		ajaxart.logs[type].push(message);
		if (type == "error" && ajaxart.debugmode)
			;
		
//		if (ajaxart.log_level == "error" && type == "warning") return;
		jQuery("#ajaxart_log").append(jQuery("<div class='aa_log " + type + "'>"+ajaxart.xmlescape(log_message)+"</div>"));
		
		try {
		  jBart.trigger(jBart,'log',{ message: message, type: type});
		} catch(e) {}
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
//    		;
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
                	if (isNaN(parseFloat(item_to_add)))
                		item_to_add = "'" + item_to_add.replace(/'/g, "\\'") + "'";
                }
	            if (xmlescape) item_to_add = ajaxart.xmlescape(item_to_add);
       			result.push(item_to_add);
        	} catch(e) {
//        		;
        	}
            in_expression = false;
        }
    }
    return [result.join('')];
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



ajaxart.totext_array = function (arr)
{
	if (arr == null || arr.length == 0) return '';
	return ajaxart.totext_item(arr[0]);
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



ajaxart.logException = function (e,prefix)
	{
		var msg = e.message || e;
		if (e.stack) {
			msg += '\n' + e.stack;
		}
		if (prefix) msg = prefix + ' ' + msg;
		ajaxart.log(msg,'error');
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



ajaxart.concat = function (source,toadd) {
	if (toadd == null) return;
	for(var i=0;i<toadd.length;i++)
		source.push(toadd[i]);
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



ajaxart.xml.xml_changed = function (xml)
{
	if (ajaxart.ishtml(xml)) return;

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
				if (attachment.compiled != null) attachment.compiled([xml],attachment.context);
			}
		}
		xml = ajaxart.xml.parentNode(xml);
	}
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



jBart.utils.getWidgetIDFromContext = function (context)
{
	if (context.vars.WidgetId) return aa_totext(context.vars.WidgetId);
	
	var elem = context.vars._BartContext[0].AppXtml;
	while (elem && elem.tagName != 'bart_sample' && elem.tagName != 'jbart_project')
		elem = elem.parentNode;
	if (elem) return elem.getAttribute('id') || '';
	return '';
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



function _xml(xml)	// for 
{
	return ajaxart.xml.prettyPrint(xml,"",false).split("\r");
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



jBart.remove = function (elem) { aa_remove(elem,true); }



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



ajaxart.totext = function (item) 
{
	if (ajaxart.isArray(item)) return ajaxart.totext_array(item);
	return ajaxart.totext_item(item);
}



ajaxart.isxml = function (xml)
{
	if (ajaxart.isArray(xml)) return ajaxart.isxml_array(xml);
	return ajaxart.isxml_item(xml);
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



ajaxart.newContext = function () {
	return { vars: {_Images: [aa_base_images()] ,_Lib: [aa_base_lib()]} , params: [] ,componentContext: null};
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



function aa_xpath(xml,xpath,createIfDoesNotExist) {
	return ajaxart.xml.xpath(xml,xpath,createIfDoesNotExist);
}



jBart.utils.lpacShowPageFunc = function (page,context)
{
	return function() {
		var pageObject = aa_first([],jBart.parsexml('<xtml t="sample.'+page+'" />'),'',context);
		if (pageObject) {
			return pageObject.Control([],context)[0];
		}
		return jQuery('<div/>').text('could not find jbart page ' + page)[0];
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



ajaxart.isattached = function (elem)
	{
		if (elem == null) return false;
		if (ajaxart.isIE) return jQuery(elem).parents("body").length > 0;
		return (elem.offsetParent || jQuery(elem).parents("body").length > 0);
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



function aa_hasAttribute(elem,attr)
{
	return elem.getAttribute(attr) != null;
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
		parent = jQuery(srcElement).parents('.aa_container').slice(-1);
	else if (field.RefreshScope == 'group')
		parent = jQuery(srcElement).parents('.aa_container').slice(0,1);
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



function ajaxart_stop_event_propogation(e)
{
	if (!e) return;
	if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
	e.cancelBubble = true;
	return false;
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
//				if (varname == "_ServerAdapter") ;
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



ajaxart.tobool_array = function (arr)
{
	if (arr == null) ;
	return ajaxart.totext_array(arr) == "true";
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



ajaxart.setVariable = function (context,varName,varValue)
{
	if (varName == null) return;
	try {
		context.vars[""+varName] = varValue;
	} catch(e) { ajaxart.log("cannot set variable" + varName,"error"); }
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



ajaxart.xmlescape = function (text) 
	{
		if (typeof text === 'string')
			return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/\n/g, "&#xa;").replace(/\r/g, "&#xd;");
		if (ajaxart.isArray(text) && text.length > 0) return ajaxart.xmlescape(text[0]);
		return '';
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



function aa_importNode(node, target)
{
	if (target == null) return node;
	if (target.ownerDocument != node.ownerDocument && target.ownerDocument.importNode != undefined)
	  return target.ownerDocument.importNode(node,true);
	return node;
}



ajaxart.ishtml_item = function (item)
{
	if (!item || !item.ownerDocument || !item.nodeType) return false;
	return item.body || item.ownerDocument.body;
}



ajaxart.isxml_item = function (xml)
{
	if (xml == null) return false;
	return (xml.nodeType != null);
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



function aa_tag(item)
{
	return item.tagName;
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



ajaxart.each = function (arr,func)
{
	for(var i=0;i<arr.length;i++)
		func(arr[i],i);
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
	if (xtml == null) { alert('could not load xtml ' + xtml_name); console.error('could not load xtml ' + xtml_name); ; }
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



ajaxart.isxml_array = function (arr)
{
	if (arr.length == 0) return false;
	return ajaxart.isxml_item(arr[0]);
}



function aa_hide(elem)
{
  elem.style.display = 'none'; elem.display = 'none';
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



function aa_clear_virtual_inner_element(elem) 
{
	if (!elem.virtual_inner_elements) return;
	for(var i=0;i<elem.virtual_inner_elements.length;i++) {
		aa_empty(elem.virtual_inner_elements[i]);
	}
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
//		if (!max_depth) ;
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
	if (scriptParam.context == null) ;

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



ajaxart.jrootElem = function (elemList)
	{
		var list = elemList.parents();
		if (list.length > 0 ) {
			var rootItem = list[list.length-1];
			return jQuery(rootItem);
		}
		return jQuery([]);
	}



ajaxart.isObject_array = function (array) {
	return array.length > 0 && ajaxart.isObject(array[0]); 
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
		if (depth == 20) { ; return '<TooMuchRecursion/>'; }
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
				var _type = typeof(inner);
				if (_type == 'string' || _type == 'number' || _type == 'boolean') {
				  result.setAttribute(att,inner);
				} else { // elements
					var child = result.ownerDocument.createElement(inner_tag || att);
					child = json2Xml(inner,child,depth+1);
					result.appendChild(child);
				}
			}
		} catch (e) {
					;
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
			;
			alert(e);
	}
	return result;
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



ajaxart.tryShortXmlWithTag = function (xml,attrName)
	{
		if (aa_hasAttribute(xml,attrName))
			return "<" + aa_tag(xml) + " " + attrName + '="' + xml.getAttribute(attrName) + '" .../>';  
	}



jBart.utils.removeFromArray = function (array,object)
{
	for(var i=0;i<array.length;i++)
		if (array[i] == object) {
			array.splice(i,1);
			return;
		}
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
Not:function (profile,data,context)
	  {
		  var result = aa_bool(data,profile,'Of',context);
		  if (result == false)
			  return ["true"];
		  else
			  return [];
	  },
IsEmpty:function (profile,data,context)
	  {
		  var val = ajaxart.run(data,profile,'Value',context);
		  var checkInner = aa_bool(data,profile,'CheckInnerText',context);
		  return ajaxart.yesno.is_empty(val,checkInner);
	  },
NotEmpty:function (profile,data,context)
	  {
		  var value = ajaxart.run(data,profile,'Value',context);
		  var check = aa_bool(data,profile,'CheckInnerText',context);
		  var result = ajaxart.yesno.is_empty(value,check);
		  if (result == true || result[0] == 'true') return [];
		  return ['true'];
	  }
});

/*********/



aa_gcs("xtml", { 
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



aa_gcs("validation", { 
ContainsText:function (profile,data,context) 
	{
	  var text = aa_totext(data);
	  if (text == "") return [];
	  var lookFor = aa_text(data,profile,'Text',context);
	  return aa_frombool( text.indexOf(lookFor) == -1 );
	}
});

/*********/



aa_gcs("uitext", { 

});

/*********/



aa_gcs("uiaction", { 
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
UrlFragmentAttribute:function (profile,data,context)
  {
	var url = aa_text(data,profile,'Url',context);
	var attr = aa_text(data,profile,'Attribute',context);
	return [ aa_url_attribute(url,attr) ];
  }
});

/*********/



aa_gcs("text", { 
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
UrlEncoding:function (profile,data,context)
  {
	  var urlpart = ajaxart.totext_array(data);
	  var type = aa_text(data,profile,'Type',context);
	  if (type == "encode")
		  return [ encodeURIComponent( urlpart ) ];
	  else
		  return [ decodeURIComponent( urlpart )];
  },
Length:function (profile,data,context)
  {
	  var str = ajaxart.totext_array(data);
	  var length = str.length;
	  return [length];
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



aa_gcs("operation", { 
Operations:function (profile,data,context)
	{
		return ajaxart.runsubprofiles(data,profile,'Operation',context);
	},
Validate:function (profile,data,context)
		{
			var groupID = aa_text(data,profile,'Group',context);
			var controls = [];
			
		    var top = aa_intest ? aa_intest_topControl : document;
			var controls = groupID ? jQuery(top).find('.fld_'+groupID).get() : [];
			
			for(var i=0;i<controls.length;i++) {
				if (!aa_passing_validations(controls[i])) return;
			}
			
			ajaxart.run(data,profile,'WhenValid',context);
		}
});

/*********/



aa_gcs("object", { 
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
SetBooleanProperty:function (profile,data,context)
  {
	  var obj = aa_first(data,profile,'Object',context);
	  var prop = aa_text(data,profile,'Property',context);
	  if (obj == null || prop == "") return [];
	  obj[prop] = aa_bool(data,profile,'Value',context);
	  
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
Init:function (profile,data,context) 
	{
	  var bctx = context.vars._BartContext[0];
	  bctx.AgentWidgets = bctx.AgentWidgets || {};
	  aa_init_agent_widgets();

	  jBart.bind(jBart,'log',function(error) {
		  if (error.type == 'error') liveperson.log(error.message,error.type);
	  },'lpacAgent');
	  
	  if (!jBart.lpacAgent && window.jBart && window.jBart.lpacAgent)
		  jBart.lpacAgent = window.jBart.lpacAgent; // jbart as an agent widget 

	  if (window.liveperson.languages) {
		for(lang in liveperson.languages) {
			var langtable = liveperson.languages[lang];
		    aa_mlTable = typeof(aa_mlTable) == 'undefined' ? {} : aa_mlTable;
		    aa_mlTable[lang] = aa_mlTable[lang] || {};
		    var list = aa_mlTable[lang];
		    for(var i in langtable)
		    	list[i] = langtable[i] || " ";
		}
		aa_mlDefaultLanguage = liveperson.defaultLanguage;
	  }
	  jBart._lpacSimulator = (window.lpacSettings) ? false : true;

	  if ( navigator.userAgent.indexOf('Macintosh') > -1 ) {
		  jQuery('body').addClass('mac');
	  } else {
		  jQuery('body').addClass('not_mac');
	  }

	  return [{
		  Load: function(data1,ctx) {
		  	  // here we have available data resources 
		  	  var agentApi = ajaxart.getVariable(context,'AgentAPIObject')[0];
		  	  if (agentApi) {
		  		  jBart.lpacAgent = agentApi;
		  	  } else if (jBart._lpacSimulator){
				  jBart.lpacAgent = new liveperson.AgentCollaborationAPI();
				  jBart.lpacAgent.init();
		  	  }
			  if (jBart._lpacSimulator) jBart.lpacAgent._isChatActive = true;
		  	  
		  	  if (!ctx.vars.Language) {
				var lang = context.vars._BartContext[0].Language([],context);
				ctx = aa_ctx(ctx,{Language: lang});
			  }
		  	  bctx.AgentWidgets = bctx.AgentWidgets || {};
			  var agentWidgets = ajaxart.getVariable(ctx,'Widgets'); 
			  for(var i=0;i<agentWidgets.length;i++) {
				  try {
					  var agentWidget = agentWidgets[i];
				      if (agentWidget._setJBartContext) agentWidget._setJBartContext(ctx);
				      var channelType = agentWidget.getChannelType(); 
				      var props = { 
				        channelType: channelType,
				        setLocationContent: function(location,props) {
				    	  if (location == liveperson.location.widgetMenu) {
				    		  this._title = props.title;
				    		  this._image = props.icon;
				    	  }
				    	  if (location == liveperson.location.widgetArea) {
				        	  if (typeof(props.control) == 'function')
						        this._controlFunc = props.control;
						      else
						        this._controlFunc = function() { return props.control; }
				    	  }
				    	  if (location == liveperson.location.tab) {
				    		  this._title = props.title;
				    		  this._image = props.icon;
				        	  if (typeof(props.control) == 'function')
						        this._controlFunc = props.control;
						      else
						        this._controlFunc = function() { return props.control; }
				    	  }
				    	  else if (location == liveperson.location.activityLog) {
				    		  this._imageInActivityLog = props.icon;
				    		  this._titleInActivityLog = props.title;
				    		  this._secondtitleInActivityLog = props.status;
				    	  }
				      	},
				        _titleInActivityLog: function() { return ''},
				        _secondtitleInActivityLog: function() { return ''},
				        _controlFunc: function() { return null; },
				        _asyncTabLoad: function(func) { func(); }  // undocumented. allows async. loading of data before the tab opens
				      };
				      try {
				        agentWidget.init(jBart.lpacAgent,props);
				      } catch(e) {
				    	  ajaxart.logException(e,'error in ' + channelType + ' widget init function');
				      }
				      
				      bctx.AgentWidgets[channelType] = props;
				  } catch(e) {
					  ajaxart.logException(e,'error creating agent widget ' + agentWidgets[i].getAttribute('t'));
				  }
			  }
	  	  }
	  }];
	},
ShowOnlyWhenChatActive:function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.RefreshChatActiveness = function(cell) {
			var content = cell.firstChild || cell;
			if (!content.jbOriginalDisplay) content.jbOriginalDisplay = content.style.display;
			jQuery(content).css('display',jBart.lpacAgent.isChatActive() ? content.jbOriginalDisplay : 'none');
		}
		aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx,item)	{
			aa_addOnAttach(cell,function() {
				field.RefreshChatActiveness(cell);	
			});
			jBart.lpacAgent.bind('chatEnded',function() { field.RefreshChatActiveness(cell); })
			jBart.lpacAgent.bind('chatActive',function() { field.RefreshChatActiveness(cell); })
		});		
	},
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
		var field = context.vars._Field[0];
		jBart.bind(field,'ModifyControl',function(args) {
			jBart.lpacAgent.bind('agentCollabEventCannedUpdated',function() {
				aa_refresh_cell(args.Wrapper,context);
			});			
		});
	}
});

/*********/



aa_gcs("itemlist_aspect", { 
CssForItem:function (profile, data, context)
    {
    	var cssClass = aa_attach_global_css( aa_text(data,profile,'Css',context) , null, 'item' );
    	jBart.bind(context.vars._Field[0],'initItemList',function(itemlist) {
    		itemlist.bind('itemElement',function(element) {
    			;
    			if (aa_bool(element.Item,profile,'ConditionOnItem',context))
    				jQuery(element).addClass(cssClass);
    		});
    	});    	
    }
});

/*********/



aa_gcs("itemlist2", { 

});

/*********/



aa_gcs("itemlist", { 

});

/*********/



aa_gcs("image", { 
ImageInSprite:function (profile,data,context)
	{
		var image = { inSprite: true };
		var size = aa_text(data,profile,'Size',context).split(',');
		image.width = size[0] + 'px';
		image.height = size[1] + 'px';
		var pos = aa_text(data,profile,'PositionInSprite',context).split(',');
		image.x = '-' + pos[0] + 'px';
		image.y = '-' + pos[1] + 'px';

		var hover_pos = aa_text(data,profile,'PositionForHover',context).split(',');
		if (hover_pos.length > 1) {
			image.hoverx = 0 - parseInt(hover_pos[0]) + 'px';
			image.hovery = 0 - parseInt(hover_pos[1]) + 'px';
		}
		var active_pos = aa_text(data,profile,'PositionForClick',context).split(',');
		if (active_pos.length > 1) {
			image.activex = '-' + active_pos[0] + 'px';
			image.activey = '-' + active_pos[1] + 'px';
		}
		
		aa_setMethod(image,'Url',profile,'Url',context);
		return [image]
	}
});

/*********/



aa_gcs("group", { 

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
ItemListContainer:function (profile, data, context) {
		var field = context.vars._Field[0];
		jBart.bind(field,'ModifyInstanceContext',function(args) {
			var items = ajaxart.run(args.FieldData, profile, 'Items', context);
            args.Context.vars.ItemListCntr = [aa_itemlistContainer(items)];
            
            jBart.trigger(field,'initItemlistCntr',args.Context.vars.ItemListCntr[0]);
		});
		field.hasItemlistContainer = true;
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
FieldData:function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
		ajaxart_addMethod(field,'FieldData',profile,'FieldData',context);
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
Validation:function (profile,data,context)
	{
		var field = context.vars._Field[0];
		if (! field.Validations ) field.Validations = [];
		var obj = { isObject: true }
		obj.CheckValidation = aa_text(data,profile,'CheckValidation',context);
		aa_setMethod(obj,'Validation',profile,'Validation',context);
		aa_setMethod(obj,'ErrorMessage',profile,'ErrorMessage',context);
		obj.AddTitleToErrorMessage = aa_bool(data,profile,'AddTitleToErrorMessage',context);
		obj.HideErrorMessage = ! aa_bool(data,profile,'ShowErrorMessageNextToField',context);
		field.Validations.push(obj);
	}
});

/*********/



aa_gcs("field", { 
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
				if ( aa_totext(out) == '' )
					ajaxart.writevalue(out,this.DefaultValue(data1,ctx),true);
				
				if (field.ForceCData && out[0].nodeType == 1) {
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
PropertySheet1:function (profile, data, context) 
	{
	    var field = {
        	Title: aa_multilang_text(data, profile, 'Title', context),
        	FieldData: function (data) { return data; }
        };
        field.Id = aa_text(data, profile, 'ID', context);
        field.ID = [field.Id];
	
        var ctx = aa_ctx(context, { _Field: [field] });
	    field.Style = aa_first(data, profile, 'Style', ctx);
	    field.HideTitle = aa_bool(data,profile,'HideTitle',context);
	    
	    field.Control = function (field_data, ctx) 
	    {
	        var fields = ajaxart.runsubprofiles(data,profile,'Field',aa_merge_ctx(context,ctx));

	        var out = aa_renderStyleObject(field.Style,{ 
				data: field_data,
	  	  		Fields: fields,
	  	  		addFields: addFields
	  	  	},ctx);
	  	  	
	  	  	function addFields(classOrElement,init_field_func) {
	  			var inner = this.getInnerElement(classOrElement);
	  			if (!inner || !init_field_func ) return;
	  			var innerParent = inner.parentNode;
	  			
	  			for(var i=0;i<this.Fields.length;i++) {
	  				var field = this.Fields[i];
	  				var elem = inner.cloneNode(true);
	  				innerParent.insertBefore(elem,inner);
	  				aa_element_attached(elem);
	  				var field_obj = aa_api_object(elem,{ 
	  					Field: field, data : this.data, 
	  					Title: field.Title, HideTitle: field.HideTitle, IsSection: field.AsSection,
	  					setControl: set_field_control
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
	  			
	  	    function set_field_control(classOrElement,notSectionTitle) {
				var inner = this.getInnerElement(classOrElement);
				inner.jbFieldElement = this;
				if (!inner) return;
    			aa_fieldControl({ Field: this.Field, Item: this.data, Wrapper: inner, Context: ctx });
	  	    };
	  	    
	  	    return [out];
	    }
	    
        ajaxart.runsubprofiles(data, profile, 'FieldAspect', ctx);
	    
	    return [field]
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
ItemList:function (profile, data, context) 
    {
        var field = {
        	Title: aa_multilang_text(data, profile, 'Title', context),
        	FieldData: function (data) { return data; }
        };
        field.Id = aa_text(data, profile, 'ID', context);
        field.ID = [field.Id];
        field.SectionStyle = aa_first(data,profile,'SectionStyle',context);
        
        var ctx = aa_ctx(context, {
            _Field: [field]
        });
        field.View = aa_first(data, profile, 'View', ctx);
        field.Control = function (data1, ctx) {
        	var ctx2 = aa_ctx(ctx,{});
        	jBart.trigger(field,'ModifyInstanceContext',{ Context: ctx2, FieldData: data1 });
        	
            var isTriplet = (field.View && field.View.IsTriplet);

            var itemlist = aa_ItemList(field,ctx2);
            itemlist.Fields = ajaxart.runsubprofiles(data, profile, 'Field', aa_merge_ctx(context, ctx2));
            itemlist.VisibleFields = [];
            for(var i=0;i<itemlist.Fields.length;i++) {
                if (itemlist.Fields[i].IsFieldHidden && itemlist.Fields[i].IsFieldHidden(data1,ctx) ) continue;
            	itemlist.VisibleFields.push( itemlist.Fields[i] );
            }
            if (isTriplet) {
                itemlist.SetHtmlTemplate(field.View.Html);
                aa_apply_style_js(itemlist, field.View);
                itemlist.jControl.addClass(aa_attach_global_css(field.View.Css));
            }

            jBart.trigger(field, 'initItemList', itemlist); // allows aspects to alter the itemlist (e.g. incremental build)

            itemlist.Refresh();

            if (field.SectionStyle) return [ aa_wrapWithSection(itemlist.jControl[0],field,field.SectionStyle) ];
            return itemlist.jControl.get();
        }
        ajaxart.runsubprofiles(data, profile, 'FieldAspect', ctx);

        return [field];
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
Same:function (profile,data,context)
	  {
	  	return data;
	  },
Url:function (profile,data,context)
  {
	  var str = "" + window.location.href;
	  return [str];
  },
IfThenElse:function (profile,data,context)
	  { 
		return aa_ifThenElse(profile,data,context);
	  }
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



aa_gcs("bart", { 

});

/*********/



aa_gcs("action", { 
IfThenElse:function (profile,data,params)
{
	  return aa_ifThenElse(profile,data,params);
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
ajaxart.load_xtml_content('',ajaxart.parsexml('<xtml package="true"><xtml ns="yesno"><Component id="And" type="data.Boolean" execution="native"><Param name="Item" type="data.Boolean[]" script="true" essential="true"/></Component><Component id="Expression" type="data.Boolean.promoted" autoexpand="true"><Param name="Expression" type="data.Boolean" script="true" description="E.g. \%\% &lt; 20"/><xtml t="xtml.UseParam" Param="Expression"/></Component><Component id="Not" type="data.Boolean" execution="native"><Param name="Of" type="data.Boolean" essential="true" script="true"/></Component><Component id="IsEmpty" type="data.Boolean" execution="native"><Param name="Value" Default="\%\%"/><Param name="CheckInnerText" type="data.Boolean"/></Component><Component id="NotEmpty" type="data.Boolean" execution="native"><Param name="Value" essential="true"><Default value="\%\%"/></Param><Param name="CheckInnerText" type="data.Boolean"/></Component></xtml><xtml ns="xtml"><Component id="UseParam" type="*" execution="native" dtsupport="false"><Param name="Param" essential="true"/><Param name="Input"><Default t="data.Same"/></Param></Component><Component id="UseParamArray" type="*" execution="native" dtsupport="false"><Param name="Param" essential="true"/></Component><Component id="CopyAllParams" type="data.Data" execution="native" dtsupport="false"/><Component id="Params" type="data.Data" execution="native" dtsupport="false"><Param name="Param" type="data.Data[]"/><Param name="ScriptParam" type="data.Data[]"/><Param name="Method" type="data.Data[]"/><Param name="ScriptParamArray" type="data.Data[]"/></Component></xtml><xtml ns="xml"><Component id="Xml" type="data.Data" execution="native"><Param name="*" type="xml"/><Param name="DynamicContent" type="data.Boolean" Default="false"/><Param name="EncodeDynamicContent" type="data.Boolean" Default="true" description="set to false when using cdata"/></Component></xtml><xtml ns="validation"><Component id="ValidationStyle" type="bart.ApplicationFeature"><Param name="Style" type="validation.Style"><Default t="validation.Default"/></Param><xtml t="object.SetProperty" Object="\%$_BartContext\%" Property="ValidationStyle" Value="\%$Style\%" IsSingleProperty="true"/></Component><Component id="CustomStyle" type="validation.Style" customPT="true"><Param name="Html" codemirror="true"/><Param name="Css" codemirror="true"/><Param name="Javascript" codemirror="true"/><Param name="CssForSummary" codemirror="true" codemirrortype="css"/><Param name="CssForInput" codemirror="true" codemirrortype="css"/><Param name="DesignTime_Save"><Field t="bart_dt.StyleSave"><ExtraAction t="xml.AddXmlChildren" Parent="\%$NewXtml\%"><Children t="data.Pipeline"><Item t="xml.Xml"><xtml><CssForSummary><![CDATA[\%$Xtml/CssForSummary\%]]></CssForSummary><CssForInput><![CDATA[\%$Xtml/CssForInput\%]]></CssForInput></xtml></Item><Item value="\%*\%"/></Children></ExtraAction></Field></Param><ParamGenerator t="action.RunActions"><Var name="Style" t="xtml.RunXtml" Xtml="\%$PrevXtml\%"/><Action t="bart_dt.StyleGenerator"/><Action t="action.WriteValue" To="\%!@CssForSummary\%" Value="\%$Style/CssForSummary\%"/><Action t="action.WriteValue" To="\%!@CssForInput\%" Value="\%$Style/CssForInput\%"/></ParamGenerator><xtml t="object.Object"><TextProperty name="Html" value="\%$Html\%"/><TextProperty name="Css" value="\%$Css\%"/><TextProperty name="Javascript" value="\%$Javascript\%"/><TextProperty name="CssForSummary" value="\%$CssForSummary\%"/><TextProperty name="CssForInput" value="\%$CssForInput\%"/></xtml></Component><Component id="CustomValidation" type="validation.Validiation"><Param name="SuccessCondition" type="data.Boolean" script="true"/><xtml t="yesno.Not"><Of t="xtml.UseParam" Param="SuccessCondition"/></xtml></Component><Component id="ContainsText" type="validation.Validiation" execution="native" autoexpand="true"><Param name="Text"/></Component><Component id="Default" type="validation.Style"><xtml t="validation.CustomStyle"><Html><![CDATA[<div />]]></Html><Css><![CDATA[#this { color:red; font-weight:bold; font-size:11px; font-family: Arial; }]]></Css><CssForInput><![CDATA[#this { background: pink !important; }]]></CssForInput><Javascript><![CDATA[function (validation) {\n  validation.innerHTML = validation.errorText;\n  validation.init({ \n    showError: function(control,errorElement,mandatory) {\n       jQuery(errorElement).insertAfter(jQuery(control).parent().children().slice(-1));\n       if (mandatory) jQuery(errorElement).hide(); \n    },\n    showErrorSummary: function(top,summary) {\n      summary.setAttribute(\'tabindex\',\'1000\');\n      top.appendChild(summary);\n      summary.focus();\n    }\n  });\n}]]></Javascript><CssForSummary><![CDATA[#this { display:block; color:red; font-weight:bold; margin-top:2px; font-family:Arial; font-size:11px; }]]></CssForSummary></xtml></Component><Component id="Default" type="validation.Style"><xtml t="validation.CustomStyle"><Html><![CDATA[<div />]]></Html><Css><![CDATA[#this { color:red; font-weight:bold; font-size:11px; font-family: Arial; }]]></Css><CssForInput><![CDATA[#this { background: pink !important; }]]></CssForInput><Javascript><![CDATA[function (validation) {\n  validation.innerHTML = validation.errorText;\n  validation.init({ \n    showError: function(control,errorElement,mandatory) {\n       jQuery(errorElement).insertAfter(jQuery(control).parent().children().slice(-1));\n       if (mandatory) jQuery(errorElement).hide(); \n    },\n    showErrorSummary: function(top,summary) {\n      summary.setAttribute(\'tabindex\',\'1000\');\n      top.appendChild(summary);\n      summary.focus();\n    }\n  });\n}]]></Javascript><CssForSummary><![CDATA[#this { display:block; color:red; font-weight:bold; margin-top:2px; font-family:Arial; font-size:11px; }]]></CssForSummary></xtml></Component></xtml><xtml ns="uitext"><Component id="PlainText" type="uitext.Style"><xtml t="uitext.CustomStyle" Html="&lt;div /&gt;" Css="#this { }"><Javascript><![CDATA[function(textObj) { \n  jQuery(textObj).html(textObj.text);\n}]]></Javascript><![CDATA[]]></xtml></Component><Component id="CustomStyle" type="uitext.Style" customPT="true"><Param name="Html" codemirror="true" light="false" Default="&lt;div/&gt;"/><Param name="Css" codemirror="true" light="false" Default="#this {}"/><Param name="Javascript" codemirror="true" light="false" Default="function(object) { object.control.innerHTML = object.text; }"/><ParamGenerator t="bart_dt.StyleGenerator"/><xtml t="ui.CustomStyle" Html="\%$Html\%" Css="\%$Css\%" Javascript="\%$Javascript\%"/></Component></xtml><xtml ns="uiaction"><Component id="GoToUrl" type="action.Action" execution="native" hidden="true"><Param name="Url" essential="true"/></Component><Component id="SetUrlFragment" type="action.Action"><Param name="Fragment"/><Param name="Attribute"/><Param name="Value"/><xtml t="action.IfThenElse"><If t="yesno.NotEmpty" Value="\%$Fragment\%"/><Then t="uiaction.GoToUrl"><Url t="data.Pipeline"><Item t="data.Url"/><Item t="text.Replace" Find="#.*" ReplaceWith="" UseRegex="true"/><Item t="text.Concat" Suffix="#\%$Fragment\%"/></Url></Then><Else t="uiaction.SetUrlFragment"><Fragment t="bart_url.NewUrlFragment" Proposed="?\%$Attribute\%=\%$Value\%"><Current t="ui.UrlFragment"/></Fragment></Else></xtml></Component></xtml><xtml ns="ui"><Component id="UrlFragmentAttribute" type="data.Data" execution="native"><Param name="Url"/><Param name="Attribute"/></Component><Component id="CustomStyle" type="data.Data"><Param name="Html" codemirror="true"/><Param name="Css" codemirror="true"/><Param name="Javascript" codemirror="true"/><xtml t="object.Object"><TextProperty name="Html" value="\%$Html\%"/><TextProperty name="Css" value="\%$Css\%"/><TextProperty name="Javascript" value="\%$Javascript\%"/><BooleanProperty name="IsTriplet" value="true"/></xtml></Component><Component id="UrlFragment" type="data.Data"><Param name="Attribute"/><xtml t="data.Pipeline"><Item t="data.Url"/><Item t="text.Split" Separator="#" Part="Second"/><Item t="data.IfThenElse" Then="\%\%"><If t="yesno.IsEmpty" Value="\%$Attribute\%"/><Else t="ui.UrlFragmentAttribute" Url="\%\%" Attribute="\%$Attribute\%"><Url t="data.Url"/></Else></Item><Item t="text.UrlEncoding" Type="decode"/></xtml></Component></xtml><xtml ns="text"><Component id="Split" type="data.Data" execution="native"><Param name="Separator"><Default value=","/></Param><Param name="Text" Default="\%\%"/><Param name="Part" type="enum"><Default value="All"/><value>All</value><value>First</value><value>ButFirst</value><value>Second</value><value>By index</value><value>Last</value><value>All but Last</value><value>All but First</value><value>All but First and Last</value></Param><Param name="Index" type="data.Data" description="Relevant only for \'By Index\' Part"/><Param name="NoEmptyValues" type="data.Boolean"/><Param name="Regex" type="data.Boolean" description="Use regular expression as a separator"/><Param name="Default" description="default result if empty value"/></Component><Component id="Replace" type="data.Data" execution="native"><Param name="Find" essential="true"/><Param name="ReplaceWith" essential="true"/><Param name="UseRegex" type="data.Boolean"><Default value="false"/></Param><Param name="ReplaceAll" type="data.Boolean"><Default value="true"/></Param><Param name="Text"><Default value="\%\%"/></Param></Component><Component id="Concat" type="data.Aggregator" execution="native"><Param name="Items" light="false"><Default t="data.Same"/></Param><Param name="Item" light="false" type="data.Data[]"/><Param name="Separator" short="true" essential="true"/><Param name="LastSeparator" advanced="true" short="true"/><Param name="ItemText" short="true"><Default t="data.Same"/></Param><Param name="Prefix" advanced="true"/><Param name="Suffix" advanced="true"/><Param name="MaxLength" advanced="true"/><Param name="SuffixForMax" advanced="true"><Default value="..."/></Param></Component><Component id="UrlEncoding" type="data.Data" execution="native"><Param name="Data" title="Text"/><Param name="Type" type="enum"><Default value="encode"/><value>encode</value><value>decode</value></Param></Component><Component id="Length" type="data.Data" execution="native"><Param name="Data" title="Text"/></Component></xtml><xtml ns="style_guide"><Component id="JBart" type="jbart.StyleGuide"><xtml t="style_guide.Custom" ID="jbart"><PrimaryButton t="button.JBart"/><SecondaryButton t="button.JBart"/><Hyperlink t="button.JBartHyperlink"/></xtml></Component><Component id="StyleFromStyleGuide" type="data.Data" execution="native"><Param name="Style"/></Component><Component id="Custom" type="jbart.StyleGuide" light="false"><Param name="ID"/><Param name="PrimaryButton" type="button.Style"/><Param name="SecondaryButton" type="button.Style"/><Param name="Hyperlink" type="button.Style"/><Param name="DialogStyle" type="dialog_style.Style"/><Param name="TextboxCss"/><Param name="ColorPallette"/><xtml t="xtml.CopyAllParams"/></Component></xtml><xtml ns="operation"><Component id="Operations" type="operation.Operations" execution="native" light="false" dtsupport="false"><Param name="Operation" type="operation.Operations[]" script="true" essential="true"/></Component><Component id="Validate" type="operation.OperationAction" description="Validates before execution" execution="native" decorator="WhenValid"><Param name="Group" description="Put group id here"/><Param name="WhenValid" type="operation.OperationAction" script="true"/></Component></xtml><xtml ns="object"><Component id="SetMethod" type="action.Action" execution="native"><Param name="Object"><Default value="\%\%"/></Param><Param name="Method" essential="true"/><Param name="Xtml" essential="true"/></Component><Component id="SetProperty" type="action.Action" execution="native"><Param name="Object" Default="\%\%"/><Param name="Property" essential="true"/><Param name="Value" essential="true"/><Param name="IsSingleProperty" type="data.Boolean"/></Component><Component id="SetBooleanProperty" type="action.Action" execution="native"><Param name="Object" Default="\%\%"/><Param name="Property" essential="true"/><Param name="Value" essential="true"/></Component><Component id="Object" type="object.Object" execution="native"><Param name="Property" type="data.Data[]" has_name="true"/><Param name="TextProperty" type="data.Data[]" has_name="true"/><Param name="Method" type="action.Action[]" has_name="true"/></Component></xtml><xtml ns="lps_dt"><Component id="LPAgentItems" type="itemlist2.View"><xtml t="itemlist2.CustomStyle"><Html><![CDATA[<div>\n    <table>\n      <thead>\n        <tr><th class="aa_header_field"><span class="title"/><span class="sortArrow"/></th></tr>\n      </thead>\n      <tbody>\n      <tr class="aa_item aa_lp_list_item">\n        <td class="aa_cell" />\n      </tr>\n      </tbody>\n    </table>\n    </div>\n    ]]></Html><Css><![CDATA[#this >table { \n    border-collapse1: collapse;\n    border-spacing: 0px;\n    }\n    #this>table>tbody>tr { \n      height:50px;\n    }\n    #this>table>tbody>tr>td { \n      border-bottom: 1px dotted #d3d3d3 !important;\n    }\n    \n    ]]></Css><Javascript><![CDATA[function(itemlist) {\n        aa_itemlist_as_table(itemlist, { \n          showHeaders: false \n        } );\n    }]]></Javascript></xtml></Component></xtml><xtml ns="lp"><Component id="LPSecondTitle" type="uitext.Style" styleGuide="lp.Liveperson"><xtml t="uitext.CustomStyle"><Html><![CDATA[<div />]]></Html><Css><![CDATA[#this { color:#778994;font-family:Arial, Helvetica, sans-serif;font-size: 12px; padding-bottom: 2px; \n    border-bottom: 2px solid #ADB7C0; line-height: 16px;\n}]]></Css><Javascript><![CDATA[function(text) { text.setInnerHTML(\'\',text.text); }]]></Javascript></xtml></Component><Component id="LPTitle" type="uitext.Style" styleGuide="lp.Liveperson"><xtml t="uitext.CustomStyle"><Html><![CDATA[<div />]]></Html><Css><![CDATA[#this { color:#6F6F6F;font-family:Arial, Helvetica, sans-serif;font-size: 18px; padding-bottom: 2px;}]]></Css><Javascript><![CDATA[function(text) { text.setInnerHTML(\'\',text.text); }]]></Javascript></xtml></Component><Component id="LpacButton" type="button.Style"><xtml t="button.CustomStyle"><Html><![CDATA[<div/>]]></Html><Css><![CDATA[#this {\n  width:55px;\n  font-family:Arial, Helvetica, sans-serif; \n  font-size: 11px; \n  text-align: center;  \n  line-height: 27px; \n  border-radius1: 6px; \n  padding: 0 10px;\n  height:27px;\n  color:white;\n  cursor: pointer;\n  background: url(\%$LPImages\%/agent-button.png) no-repeat;\n}\n#this:hover {\n  background-position:0 -26px;\n}\n#this:active { \n  background-position:0 -52px;\n}]]></Css><Javascript><![CDATA[function(button) {\n  button.setInnerHTML(\'\',button.text);  \n  button.setOnClick(\'\',button.Action);\n}\n]]></Javascript></xtml></Component></xtml><xtml ns="layout"><Component id="Default" type="layout.Style"><xtml t="group.CustomStyle"><Html><![CDATA[<div><div class="field"/></div>]]></Html><Css><![CDATA[]]></Css><Javascript><![CDATA[function(group) {\n    group.addFields(\'.field\',function(field) { field.setControl(\'.field\'); });}]]></Javascript></xtml></Component></xtml><xtml ns="jbart_resource"><Component id="Data" type="bart_resource.Resources" execution="native"><Param name="ResourceID"><Field t="field.Field" FieldData="\%!@ResourceID\%" Title="ID" ID="ResourceID"><FieldAspect t="field_aspect.Mandatory"/></Field></Param><Param name="ValueType" type="enum" Options="xml,json,javascript,xml multiple,json to xml,calculated" Default="xml"><FieldAspect t="field_aspect.RefreshDependentFields" FieldsIds="DataResource_Value" RefreshScope="screen"/></Param><Param name="Value"><Field t="bart_dt.DataResourceValue"/></Param><Param name="CacheIn" type="bart_resource.CacheIn" advanced="true" script="true"/><Param name="DataSource" type="bart_resource.DataSource" advanced="true"/><Param name="_FillDataSource" remark="dt only" advanced="true"><Field t="bart_dt.FillDataSourceForXmlResource"/></Param><Param name="AutoSaveSampleData" type="enum" Options="true,false" description="Relevant only for xml. The design time will auto save changes to this resource" advanced="true"/></Component></xtml><xtml ns="jbart_agent_lpac"><Component id="Init" type="bart.ApplicationFeature" execution="native">&#xa;  </Component><Component id="ShowOnlyWhenChatActive" type="field.FieldAspect" execution="native"/><Component id="SendCollaborationEvent" type="operation.OperationAction" execution="native"><Param name="ChannelType"/><Param name="Command"/><Param name="Argument" type="jbart_agent_lpac.Argument[]"/><Param name="Channel" description="Can be \'new\',\'single\' or a channel specific id (e.g. 3)" Default="single"/><Param name="DelayedSend" type="data.Boolean" advanced="true" description="If true, two events are sent with a small delay between them"/></Component><Component id="Argument" type="jbart_agent_lpac.Argument" execution="native"><Param name="Name"/><Param name="Value"/><Param name="Escape" type="data.Boolean" Default="true"/></Component><Component id="RefreshOnUpdatingVisitorEvent" type="field.FieldAspect" execution="native"/></xtml><xtml ns="itemlist_aspect"><Component id="CssForItem" type="field.FieldAspect" category="itemlist" execution="native" description="Set style for an item, potentialy on a condition"><Param name="Css" css="true"/><Param name="ConditionOnItem" type="data.Boolean.promoted"><Default t="data.Always"/></Param></Component></xtml><xtml ns="itemlist2"><Component id="CustomStyle" type="itemlist2.View" customPT="true"><Param name="Html" codemirror="true" light="false"/><Param name="Css" codemirror="true" light="false"/><Param name="Javascript" codemirror="true" light="false"/><ParamGenerator t="bart_dt.StyleGenerator"/><xtml t="ui.CustomStyle" Html="\%$Html\%" Css="\%$Css\%" Javascript="\%$Javascript\%"/></Component><Component id="Simple" type="itemlist2.View"><xtml t="itemlist.CustomStyle"><Html><![CDATA[<div><div class="aa_item"/></div>]]></Html><Javascript><![CDATA[function(itemlist) {\n       itemlist.ItemTemplate = itemlist.jControl.find(\'.aa_item\').remove()[0];\n}]]></Javascript></xtml></Component></xtml><xtml ns="itemlist"><Component id="CustomStyle" type="itemlist.Style" customPT="true"><Param name="Html" codemirror="true" light="false"/><Param name="Css" codemirror="true" light="false"/><Param name="Javascript" codemirror="true" jsMetaData="styles_dt.ItemListJsMetadata" light="false"/><ParamGenerator t="bart_dt.StyleGenerator"/><xtml t="ui.CustomStyle" Html="\%$Html\%" Css="\%$Css\%" Javascript="\%$Javascript\%"/></Component><Component id="Items" type="itemlist.Items" autoexpand="true"><Param name="Items"/><xtml value="\%$Items\%"/></Component></xtml><xtml ns="image"><Component id="CustomStyle" type="image.Style" customPT="true"><Param name="Html" codemirror="true" light="false"/><Param name="Css" codemirror="true" light="false"/><Param name="Javascript" codemirror="true" light="false"/><ParamGenerator t="bart_dt.StyleGenerator"/><xtml t="ui.CustomStyle" Html="\%$Html\%" Css="\%$Css\%" Javascript="\%$Javascript\%"/></Component><Component id="PlainImage" type="image.Style"><xtml t="image.CustomStyle"><Html><![CDATA[<div/>]]></Html><Javascript><![CDATA[function(image) {\n  image.setImage(null,image.image);        \n}]]></Javascript></xtml></Component><Component id="ImageInSprite" type="image.Image" execution="native"><Param name="Url" script="true" image="true"/><Param name="Size" Default="16,16"/><Param name="PositionInSprite" Default="0,0"/><Param name="PositionForHover" advanced="true"/><Param name="PositionForClick" advanced="true"/></Component></xtml><xtml ns="group"><Component id="Vertical" type="group.Style"><Param name="CssOnElement" Default="margin-bottom:5px;"/><xtml t="group.CustomStyle" Html="&lt;div&gt;&#xd;  &lt;div class=&quot;field&quot;/&gt;&#xd;&lt;/div&gt;" Css="#this &gt;.field {\%$CssOnElement\%; }" Javascript="function(group) { &#xa;  group.addFields(\'.field\',function(field) &#xa;     { &#xa;      field.setControl(\'.field\'); &#xa;      }&#xa;  );&#xa;;}"/></Component><Component id="PropertySheet" type="group.Style,propertysheet.Style"><Param name="PropertiesWidth" Default="80px" advanced="true"><FieldAspect t="field_dt.SliderParam"/></Param><Param name="VerticalSpacing" Default="8px" advanced="true"><FieldAspect t="field_dt.SliderParam"/></Param><Param name="IndentationOfPicklistOptions" Default="8px" advanced="true"><FieldAspect t="field_dt.SliderParam"/></Param><xtml t="group.CustomStyle"><Html><![CDATA[\n<table cellspacing="0" cellpadding="0">\n  <tr class="field">\n    <td class="field_title"/>\n    <td class="field_contents"/>\n  </tr>\n</table>\n]]></Html><Css><![CDATA[#this>tbody>tr>.field_title { width: \%$PropertiesWidth\%; padding-right: 5px; vertical-align:top; padding:4px 5px 0 0; color: gray; font-family:"lucida grande",tahoma,verdana,arial,sans-serif; font-size:11px;}\n#this>tbody>tr>.field_contents { vertical-align: top; padding-bottom: \%$VerticalSpacing\%; }\n#this>tbody>tr.aa_indent>td { padding-left:\%$IndentationOfPicklistOptions\%; }\n#this>tbody>tr:last-child >.field_contents { padding-bottom: 0px; }\n#this>tbody>tr>td>.field_description { color:rgb(140,140,140); font-style:italic; margin-top:2px; font-family:"lucida grande",tahoma,verdana,arial,sans-serif; font-size:11px; white-space: normal; }\n#this>tbody>tr.aa_mandatory>.field_title { font-weight: bold; }]]></Css><Javascript><![CDATA[function(group) { \n  group.addFields(\'.field\',function(field) {\n    field.setPlaceholderForMoreFields(function(fieldForOptions) {\n      jQuery(fieldForOptions).find(\'>.field_title\').remove();\n      var jContents = jQuery(fieldForOptions).find(\'>.field_contents\').attr(\'colspan\',2).append(\'<div class="field_options_page"/>\');\n      fieldForOptions.setOptionsPage(\'.field_options_page\');\n    });\n\n    if (field.HideTitle || field.IsSection) {\n      jQuery(field).find(\'>.field_title\').remove();\n      jQuery(field).find(\'>.field_contents\').attr(\'colspan\',2);\n    } else {\n      field.setInnerHTML(\'.field_title\',field.Title+\':\');  \n    }\n    var jFieldContents = jQuery(field).find(\'.field_contents\');\n    field.setControl(\'.field_contents\'); \n    if (field.Field.Description) {\n      jFieldContents.append(\'<div class="field_description"/>\');\n      field.setInnerHTML(\'.field_description\',field.Field.Description);  \n    }\n  });\n}\n]]></Javascript></xtml></Component><Component id="DataFlow" type="group.GroupData"><Param name="FlowData" script="true"/><xtml t="object.Object"><Method name="FieldData" t="xtml.UseParam" Param="FlowData"/><Method name="DataItems" t="data_items.Items" Items="\%\%"/></xtml></Component><Component id="CustomStyle" type="group.Style" customPT="true"><Param name="Html" codemirror="true" light="false"/><Param name="Css" codemirror="true" light="false"/><Param name="Javascript" codemirror="true" light="false"/><ParamGenerator t="bart_dt.StyleGenerator"/><xtml t="object.Object"><TextProperty name="Html" value="\%$Html\%"/><TextProperty name="Css" value="\%$Css\%"/><TextProperty name="Javascript" value="\%$Javascript\%"/></xtml></Component></xtml><xtml ns="field_feature"><Component id="Css" type="field.FieldAspect" execution="native" description="Styles (font, color, padding, borders)" promoted="true"><Param name="Css" css="true"><FieldAspect t="field_aspect.HideTitle"/><Default><![CDATA[#this {}\n#wrapper {}]]></Default></Param></Component></xtml><xtml ns="field_control"><Component id="Image" type="field.Fields" advanceddt="true" image="\%$_Images\%/studio/bmp1616.png" execution="native"><Param name="Image" type="image.Image"/><Param name="Style" type="image.Style"><Default t="image.PlainImage"/></Param></Component><Component id="CustomControl" type="field.Control" execution="native"><Param name="Html" codemirror="true" Default="&lt;div/&gt;"/><Param name="Css" codemirror="true" Default="{}"/><Param name="Javascript" codemirror="true"><Default value="function(html_elem,context) { } "/></Param><NativeHelper name="StyleObject" t="object.Object"><TextProperty name="Html" value="\%$Html\%"/><TextProperty name="Css" value="\%$Css\%"/><TextProperty name="Javascript" value="\%$Javascript\%"/></NativeHelper></Component></xtml><xtml ns="field_aspect"><Component id="Text" type="field_aspect.FieldType" light="false"><Param name="Mandatory" type="data.Boolean" boolfeature="true"/><Param name="HideTitle" type="data.Boolean" boolfeature="true"/><Param name="ReadOnly" type="data.Boolean" boolfeature="true"/><xtml t="field_aspect.Aspects"><FieldAspect t="field_aspect.Mandatory" Condition="\%$Mandatory\%"/><FieldAspect t="field_aspect.HideTitle" Condition="\%$HideTitle\%"/><FieldAspect t="field_aspect.ReadOnly" Condition="\%$ReadOnly\%"/><FieldAspect t="field_aspect.SimpleInput"/><FieldAspect t="field.TextFilter"/><FieldAspect t="field_aspect.Resizer"/></xtml></Component><Component id="ItemListContainer" type="field.FieldAspect" execution="native" fieldImage="\%$_Images\%/studio/library.png"><Param name="Items" type="itemlist.Items"><Default t="itemlist.Items"/></Param></Component><Component id="Aspects" type="field.FieldAspect" light="false"><Param name="FieldAspect" type="field.FieldAspect[]" script="true" essential="true"/><xtml t="xtml.UseParamArray" Param="FieldAspect"/></Component><Component id="DescriptionForEmptyText" type="field.FieldAspect" category="textbox" description="Description text inside the textbox (in italic) which clears away on editing" execution="native"><Param name="Description" essential="true"/><Param name="Css" css="true" advanced="true" Default="#this { font-style:italic; color: #8B8B8B; }"/></Component><Component id="GlobalCss" type="field.FieldAspect" execution="native" gallery="GlobalCss" description="Allows non inline css. Element id is given as well" promoted="false"><Param name="GlobalCss" css="true"><FieldAspect t="field_aspect.HideTitle"/></Param><Param name="OnCondition" script="true" type="data.Boolean" description="e.g. \%\% &gt; 20"/></Component><Component id="ReadOnly" type="field.FieldAspect" category="model" description="Define this field as read only"><xtml t="object.SetMethod" Object="\%$_Field\%" Method="ReadOnly" Xtml="true"/></Component><Component id="SizePaddingsAndMargins" hidden="true" type="field.FieldAspect" description="Set position, width, height, padding, and margin using css"><Param name="Inline" light="false" remark="the resulting css"/><Param name="DesignTimeWidget"><Field t="field.CustomControl"><Control t="field.ShowFieldControl"><Field t="css_dt.Size"/><Var name="Script" value="\%$Xtml\%"/><Var name="HtmlCssJs" value="\%$Script\%"/><Data t="css_dt.ParseCssDeclaration" Css="\%$Xtml/@Inline\%"/></Control></Field></Param><Param name="OnElement" type="enum" Options="cell,content,title" advanced="true" Default="content"/><xtml t="field_aspect.Css" Inline="\%$Inline\%" OnElement="\%$OnElement\%"/></Component><Component id="FontAndText" type="field.FieldAspect" hidden="true" description="Set font and text using css, e.g., color, background color, font-size, weight, align, transform, font-family, decoration, italic, underline, bold, and font shadow"><Param name="Inline" light="false" remark="the resulting css"/><Param name="DesignTimeWidget"><Field t="css_dt.FontAndText" Xtml="\%$Xtml\%"/></Param><Param name="OnElement" type="enum" Options="cell,content,title" advanced="true" Default="content"/><xtml t="field_aspect.Css" Inline="\%$Inline\%" OnElement="\%$OnElement\%"/></Component><Component id="Css" type="field.FieldAspect" promoted="false" light="false" execution="native" gallery="Css" description="Change the style. E.g., color, background, font, underline, bold, padding, border, gradient, margin, align, rtl direction"><Param name="Inline" script="true" essential="true" advanced="false"><FieldAspect t="field_dt.CodeMirrorFieldEditor" CompId="field_aspect.Css" ParamName="Inline"/><FieldAspect t="field_aspect.HideTitle"/></Param><Param name="OnCondition" script="true" type="data.Boolean" description="e.g. \%\% &gt; 20" advanced="true"/><Param name="OnElement" type="enum" Options="cell,content,title" advanced="true"><Default value="content"/></Param><Param name="Class" script="true" essential="true" advanced="true"/></Component><Component id="Resizer" type="field.FieldAspect" category1="textbox" execution="native" description="Adds or removes a textbox width resizer on its right side"><Param name="Disable" type="data.Boolean"/><Param name="RememberLastWidth" type="data.Boolean" Default="true"/></Component><Component id="FieldData" type="field.FieldAspect" execution="native" description="Determines the data binding of the field item"><Param name="FieldData" script="true" essential="true"/></Component><Component id="HideTitle" type="field.FieldAspect" category="ui" promoted="true"><xtml t="object.SetBooleanProperty" Object="\%$_Field\%" Property="HideTitle" Value="true"/></Component><Component id="SimpleInput" type="field.FieldAspect" execution="native" light="false"/><Component id="Mandatory" type="field.FieldAspect" execution="native" category="textbox" description="Defines this field as mandatory and allows to modify the error message"><Param name="ErrorMessage" script="true"/></Component><Component id="Validation" type="field.FieldAspect" execution="native" category="validation" jbart="true"><Param name="Validation" type="validation.Validiation" script="true" essential="true"/><Param name="CheckValidation" type="enum" Options="on change,on blur,on save"><Default value="on blur"/></Param><Param name="ErrorMessage"/><Param name="AddTitleToErrorMessage" type="data.Boolean" Default="true"/><Param name="ShowErrorMessageNextToField" type="data.Boolean" Default="true" advanced="true"/></Component></xtml><xtml ns="field"><Component id="Field" type="field.Fields" execution="native"><Aspect t="component_aspect.Image" Image="\%$_Images\%/studio/bullet1616.gif"/><Param name="Title" essential="true" autoaspects="false" titleField="true"/><Param name="FieldData" essential="true" advanced="true"><FieldAspect t="field_aspect.Title" Title="Data"/><FieldAspect t="field_aspect.ChangeFieldID" ID="dt_field_data"/></Param><Param name="ID" advanced="always" essential="true" idField="true"/><Param name="Type" essential="true" type="field_aspect.FieldType" script="true"><Default t="field_aspect.Text"/></Param><Param name="ReadOnlyText" type="data.Boolean" Title="Read Only"/><Param name="FieldAspect" essential="true" type="field.FieldAspect[]" light="false" script="true"/></Component><Component id="PropertySheet1" type="field.Fields" execution="native" image="\%$_Images\%/studio/pform.gif"><Param name="ID" essential="true" advanced="always"/><Param name="Title" essential="true" autoaspects="false" titleField="true"/><Param name="Style" type="propertysheet.Style" script="true"><Default t="group.PropertySheet"/></Param><Param name="Field" type="field.Fields[]" light="false" script="true" essential="true"/><Param name="Aspect" type="uiaspect.Aspect[]" script="true" light="false"/><Param name="FieldAspect" type="field.FieldAspect[]" script="true" light="false"/><Param name="HideTitle" type="data.Boolean" boolfeature="true"/></Component><Component id="Layout" type="field.Fields" execution="native" image="\%$_Images\%/studio/cube1616.gif"><Param name="ID" advanced="always" idField="true"/><Param name="Title" titleField="true"/><Param name="Field" type="field.Fields[]" light="false" script="true" essential="true"/><Param name="FieldAspect" type="field.FieldAspect[]" script="true" light="false"/><Param name="HideTitle" type="data.Boolean" boolfeature="true"/><Param name="Layout" type="layout.Style" script="true"><Default t="layout.Default"/></Param><Param name="SectionStyle" type="section.Style" description="Select a section style to make it a section"/></Component><Component id="Control" type="field.Fields" advanceddt="true" execution="native" image="\%$_Images\%/studio/control1616.gif"><Param name="ID" essential="true" advanced="always"/><Param name="Title" essential="true" autoaspects="false" titleField="true"/><Param name="HideTitle" type="data.Boolean" boolfeature="true"/><Param name="Control" type="field.Control" script="true" essential="true"/><Param name="FieldAspect" type="field.FieldAspect[]" light="false" script="true"/></Component><Component id="Text" type="field.Fields" execution="native" advanceddt="true"><Aspect t="component_aspect.Image" Image="\%$_Images\%/studio/text.png"/><Param name="ID" advanced="always" essential="true"/><Param name="Title" essential="true" titleField="true"/><Param name="Text" script="true"><ContextMenu t="xtml_dt.EditAsRichText"/></Param><Param name="Style" type="uitext.Style"><Default t="uitext.PlainText"/></Param><Param name="HideTitle" type="data.Boolean" boolfeature="true"><Default value="true"/></Param><Param name="FieldAspect" type="field.FieldAspect[]" light="false" script="true"/></Component><Component id="ItemList" type="field.Fields" execution="native" advanceddt="true" image="\%$_Images\%/studio/books.gif"><Param name="ID" advanced="always" essential="true" idField="true"/><Param name="Title" essential="true" autoaspects="false" titleField="true"/><Param name="View" type="itemlist2.View"><Default t="itemlist2.Simple"/></Param><Param name="SectionStyle" type="section.Style" description="Select a section style to make it a section"/><Param name="Field" type="field.Fields[]" script="true" light="false" essential="true"/><Param name="FieldAspect" type="field.FieldAspect[]" script="true" light="false"/><DTAction t="bart_dt.ItemListActions" dtsupport="false"/></Component><Component id="TextFilter" type="field.FieldAspect" execution="native" category="filter" light="false"><NativeHelper name="Control" t="field.TextFilterControl"/></Component><Component id="Button" type="field.Fields" advanceddt="true" execution="native" image="\%$_Images\%/studio/button.png"><Param name="ID" advanced="always" essential="true" idField="true"/><Param name="Title" titleField="true"/><Param name="Image" type="image.Image"/><Param name="Action" type="operation.OperationAction" script="true" essential="true"><RunningInput t="field_aspect.RunningInputFieldData"/></Param><Param name="Style" type="button.Style" script="true"><Default t="button.PrimaryButton"/></Param><Param name="Tooltip" advanced="true"/><Param name="HideTitle" type="data.Boolean" advanced="true" Default="true"/><Param name="FieldAspect" type="field.FieldAspect[]" light="false" script="true"/><Param name="ButtonText" script="true" advanced="true" description="Button text can be different than the title"/></Component><Component id="Image" type="field.Fields" advanceddt="true" image="\%$_Images\%/studio/bmp1616.png"><Param name="ID" advanced="always" essential="true"/><Param name="Title" essential="true" autoaspects="false"><FieldAspect t="field_aspect.FieldData" FieldData="\%!@Title\%"/><FieldAspect t="field_dt.TitleField"/></Param><Param name="Image" type="image.Image" script="true"/><Param name="Style" type="image.Style"><Default t="image.PlainImage"/></Param><Param name="HideTitle" boolfeature="true" type="data.Boolean"/><Param name="FieldAspect" type="field.FieldAspect[]" light="false" script="true"/><xtml t="field.Control" ID="\%$ID\%" Title="\%$Title\%" HideTitle="\%$HideTitle\%"><Control t="field_control.Image" Style="\%$Style\%"><Image t="xtml.UseParam" Param="Image"/></Control><FieldAspect t="xtml.UseParamArray" Param="FieldAspect"/></xtml></Component></xtml><xtml ns="data_items"><Component id="Items" type="data_items.Items" execution="native"><Param name="Items" essential="true"/><Param name="ItemTypeName"/><Param name="Aspect" type="data_items.Aspect[]" script="true"/></Component></xtml><xtml ns="data"><Component id="Always" type="data.Boolean.jBart,data.Boolean.promoted"><xtml value="true"/></Component><Component id="FirstSucceeding" type="data.Data" execution="native" dtsupport="false"><Param name="Item" type="data.Data[]" essential="true"/></Component><Component id="Pipeline" type="data.Data" execution="native" dtsupport="false"><Param name="Item" type="data.Data[]" essential="true"/><Param name="Aggregator" type="data.Aggregator[]"/></Component><Component id="Same" type="data.Data" execution="native" dtsupport="false"/><Component id="Url" type="data.Data" execution="native"/><Component id="IfThenElse" type="data.Data" execution="native" dtsupport="false"><Param name="If" type="data.Boolean" script="true" essential="true"/><Param name="Then" essential="true"/><Param name="Else" essential="true"/></Component></xtml><xtml ns="button"><Component id="PrimaryButton" type="button.Style"><xtml t="data.FirstSucceeding"><Item t="style_guide.StyleFromStyleGuide" Style="PrimaryButton"/><Item t="button.JBart"/></xtml></Component><Component id="CustomStyle" type="button.Style" customPT="true"><Param name="Html" codemirror="true" light="false"/><Param name="Css" codemirror="true" light="false"/><Param name="Javascript" codemirror="true" light="false"/><ParamGenerator t="bart_dt.StyleGenerator"/><xtml t="ui.CustomStyle" Html="\%$Html\%" Css="\%$Css\%" Javascript="\%$Javascript\%"/></Component><Component id="JBart" type="button.Style" styleGuide="jbart"><xtml t="button.CustomStyle" Html="&lt;span class=&quot;aa_button_clickable&quot; tabindex=&quot;1&quot;&gt;&#xd;  &lt;span class=&quot;aa_outer_btn&quot;&gt;&#xd;    &lt;span class=&quot;aa_button_text&quot;/&gt;&#xd;  &lt;/span&gt;&#xd;  &lt;br/&gt;&#xd;&lt;/span&gt;" Css="#this br { line-height:25px; }&#xa;&#xa;#this .aa_outer_btn { height:25px; cursor:pointer; color:black;color2:rgb(31,73,125); font-family: Arial; font-size:12px; float:left; background:url(\%$_Images\%/css/button.png) no-repeat left top; padding:0 0 0 6px; }&#xa;&#xa;#this .aa_button_text { height:18px; float:left; background:url(\%$_Images\%/css/button.png) no-repeat right top; padding:4px 15px 3px 6px; }&#xa;&#xa;#this.pressed .aa_outer_btn { background-position:0 -28px; }&#xa;#this.pressed .aa_button_text { background-position:100\\% -28px; padding:5px 15px 2px 6px; }&#xa;" Javascript="function(button) {&#xa;  button.setInnerHTML(\'.aa_button_text\',button.text);  &#xa;  &#xa;  button.setOnClick(\'.aa_button_clickable\',button.Action,true);&#xa;}"/></Component><Component id="JBartHyperlink" type="button.Style"><Param name="Spacing" Default="4px"/><Param name="Color" Default="blue"/><xtml t="button.CustomStyle" Html="&lt;span class=&quot;aa_button_clickable&quot;&gt;&#xd;  &lt;span class=&quot;aa_button_img&quot;/&gt;&#xd;  &lt;span class=&quot;aa_button_text&quot;/&gt;&#xd;&lt;/span&gt;" Css="#this { color: \%$Color\% ;cursor:pointer;text-decoration: none;font-family:&quot;lucida grande&quot;,tahoma,verdana,arial,sans-serif;&#xa;font-size:11px; padding-left1:7px; paddding-right: 7px; }&#xa;#this &gt;.aa_button_text:hover { text-decoration: underline }&#xa;#this .aa_button_img img { cursor:pointer; padding-bottom:2px; padding-right: \%$Spacing\%; vertical-align:middle; }" Javascript="function(button) {&#xa;  button.setInnerHTML(\'.aa_button_text\',button.text);  &#xa;  button.setImageSource(\'.aa_button_img\',button.image);  &#xa;  button.setOnClick(\'.aa_button_clickable\',button.Action);&#xa;}"/></Component></xtml><xtml ns="bart_url"><Component id="NewUrlFragment" type="data.Data" execution="native"><Param name="Current"/><Param name="Proposed"/></Component><Component id="BrowserUrl" type="bart_url.UrlProvider"><Param name="OnUpdate" type="action.Action" script="true"/><xtml t="xtml.Params"><ScriptParam name="GetValue" paramVars="Attribute" t="ui.UrlFragment" Attribute="\%$Attribute\%"/><ScriptParam name="Clean" t="uiaction.SetUrlFragment" Fragment=""/><ScriptParam name="Update" paramVars="ValuePairs" t="action.RunActions"><Action t="uiaction.SetUrlFragment"><Fragment t="bart_url.NewUrlFragment" Proposed="\%$ValuePairs\%"><Current t="ui.UrlFragment"/></Fragment></Action><Action t="xtml.UseParam" Param="OnUpdate"/></ScriptParam></xtml></Component></xtml><xtml ns="bart"><Component id="Css" type="bart.ApplicationFeature"><Param name="Css" codemirror="true"/><xtml t="object.SetProperty" Object="\%$_BartContext\%" Property="Css" Value="\%$Css\%"/></Component></xtml><xtml ns="action"><Component id="IfThenElse" type="action.Action" execution="native"><Param name="If" type="data.Boolean" essential="true" script="true"/><Param name="Then" type="action.Action" script="true" essential="true"/><Param name="Else" type="action.Action" script="true" essential="true"/></Component><Component id="RunActions" type="action.Action" execution="native"><Param name="Action" type="action.Action[]" essential="true"/></Component></xtml><xtml ns="jbart_api"><Component id="ShowWidget" type="ui.Control" execution="native" description="Shows/embeds a jbart widget with the relevant params"><Param name="WidgetXml"/><Param name="Page"/><Param name="RunAfter" type="action.Action" script="true"/><Param name="RunAfterControlWithTimer" type="data.Boolean" Default="true"/><Param name="_Language"/><Param name="OnError" type="action.Action" script="true"/></Component></xtml><xtml ns="jbart"><Component id="TextboxCss" type="data.Data"><xtml t="data.FirstSucceeding"><Item value="\%$_BartContext/StyleGuide/TextboxCss\%"/><Item><![CDATA[\n         #this { border:1px solid #BDC7D8; font-size:11px; padding:3px; height: 16px; width: 150px;background:url(\%$_Images\%/css/shadow2.png) repeat-x scroll 0 0 transparent;} \n         #this.readonly { border:none !important; }\n         #this.selected { background: #D9E8FB !important}\n        ]]></Item></xtml></Component></xtml><xtml ns="text"><Type id="HebrewText" HebChars="????????????????????????????????????????????????????"/></xtml></xtml>'));

var aa_xtml_total = 41385;
;
var jBartWidget_LPHtmlWidget = '<jbart_project _type="jbart_project" id="LPHtmlWidget" name="LPHtmlWidget" modifiedDate="31/01/2011 10:37" dateCreated="16/01/2011 15:28" vid="101" type="widget" image="" description="" _wusers="" cross_domain="true" feed="" plugins="jbart_agent_lpac"><bart_dev><db><bart_unit><bart_unit id="sample" _type="bart_unit" ns="sample"><Component id="App" type="bart.Application"><xtml t="bart.Application"><Resources t="bart_resource.Resources"><Resource t="jbart_resource.Data" ResourceID="List" ValueType="xml"/><Resource t="jbart_resource.Data" ResourceID="LPImages" ValueType="calculated" Value="\%$_Images\%/lp">&#xa;                </Resource></Resources><StyleGuide t="style_guide.JBart"/><ApplicationFeature t="bart.Css"><Css><![CDATA[#this { font: 12px Arial; }\n#this *:focus { outline:none; }\np { margin: 0} \n]]></Css></ApplicationFeature><ApplicationFeature t="jbart_agent_lpac.Init"/><Language t="bart.FixedLanguage" Language="en_US"/><ApplicationFeature t="validation.ValidationStyle"><Style t="validation.CustomStyle"><Html><![CDATA[<div />]]></Html><Css><![CDATA[#this {color:#d15e45; font-family:arial; font-size: 11px;\n  padding-bottom: 5px;\n  font-weight: bold;\n}\n]]></Css><Javascript><![CDATA[function (validation) {\n  validation.innerHTML = validation.errorText;\n  validation.init({ \n    showError: function(control,errorElement,mandatory) {\n       jQuery(errorElement).insertBefore(jQuery(control).parent().children().slice(-1));\n    }\n  });\n}]]></Javascript><CssForSummary><![CDATA[#this { display:block; color:red; font-weight:bold; margin-top:2px; font-family:Arial; font-size:11px; }]]></CssForSummary><CssForInput><![CDATA[#this { background: #ffe9e4 !important; border: 1px solid #d15e45 !important; }]]></CssForInput></Style></ApplicationFeature><MainPage1 t="sample.main"/></xtml></Component><Component id="main" type="jbart.MyWidgetPage"><xtml t="field.Layout" ID="main" ContentType="widget" Title="main"><Field t="field.Layout" HideTitle="true" ID="Group" Title="Predefined"><Layout t="group.Vertical" CssOnElement=""/><Field t="field.Text" ID="Text" Title="Send Video" Text="html_send_title"><Style t="lp.LPTitle"/></Field><Field t="field.Text" ID="Text1" Title="Desc" Text="html_choose_predefined"><Style t="lp.LPSecondTitle">&#xa;&#xa;                    </Style></Field><Field t="field.ItemList" Title="Items" ID="LPItems" ID__Manual=""><View t="lps_dt.LPAgentItems">&#xa;                  </View><FieldAspect t="field_aspect.ItemListContainer"><Items t="itemlist.Items" Items="\%$List/item\%"/></FieldAspect><Field t="field.Image" HideTitle="true" ID="Image" Title="Image"><Image t="image.ImageInSprite" Url="https://dl.dropbox.com/u/24056024/aspire/html-small-icon.png" Size="18,13"/><Style t="image.PlainImage"/><FieldAspect t="field_feature.Css"><Css><![CDATA[#this {}\n#wrapper { \n  vertical-align: middle !important;\n  padding-right: 15px; padding-left: 15px; }\n]]></Css></FieldAspect></Field><Field t="field.Text" ID="Text" Title="TITLE" Text="\%@title\%" HideTitle="false"><Style t="uitext.CustomStyle"><Html><![CDATA[<div />]]></Html><Css><![CDATA[#this {\nfont-family: Arial;\nfont-size: 12px;\ncolor: #778994; }\n]]></Css><Javascript><![CDATA[function(text) { text.setInnerHTML(\'\',text.text); }\n]]></Javascript></Style><FieldAspect t="field_feature.Css"><Css><![CDATA[#this { font-size: 12px; }\n#wrapper { padding-right: 10px; \n  vertical-align: middle !important; \n  width: 295px; }\n]]></Css></FieldAspect></Field><Field t="field.Button" ID="Send" Title="Send" HideTitle="true" ButtonText="html_send_button"><Style t="lp.LpacButton"/><Action t="jbart_agent_lpac.SendCollaborationEvent" ChannelType="htmlIframe" Command="start" DelayedSend="true" Channel="single"><Argument t="jbart_agent_lpac.Argument" Name="title" Value="\%@title\%" Escape="true"/><Argument t="jbart_agent_lpac.Argument" Name="url" Value="\%@url\%" Escape="true"/></Action><FieldAspect t="jbart_agent_lpac.ShowOnlyWhenChatActive"/><FieldAspect t="field_feature.Css"><Css><![CDATA[#this { display: none; }\n#wrapper { width: 85px; \n  vertical-align:middle !important; \n}\n\n.aa_lp_list_item:hover #this { display: block; }\n]]></Css></FieldAspect></Field><FieldAspect t="itemlist_aspect.CssForItem"><Css><![CDATA[#this { background: #EFF5F7;}]]></Css><ConditionOnItem t="yesno.Expression" Expression="\%@sentToVisitor\%"/></FieldAspect><FieldAspect t="jbart_agent_lpac.RefreshOnUpdatingVisitorEvent"/></Field></Field><Field t="field.Control" ID="Control" Title="Space"><Control t="field_control.CustomControl"><Html><![CDATA[<div/>]]></Html><Css><![CDATA[{ margin: 31px 0 0 0; }\n]]></Css><Javascript><![CDATA[function(html_elem,context) { } ]]></Javascript></Control></Field><Field t="field.Layout" HideTitle="true" ID="Group1" Title="Insert Your Own"><Layout t="group.Vertical" CssOnElement=""/><Field t="field.Text" ID="Text2" Title="Manual Title" Text="html_insert_your_own"><FieldAspect t="field_aspect.Css" Inline="border-bottom: 2px solid #ADB7C0;"/><FieldAspect t="field_aspect.FontAndText" Inline="font-size: 12px; color:#798A94;" OnElement="content"/><FieldAspect t="field_aspect.SizePaddingsAndMargins" Inline="padding: 0px 0 2px 0;"/><Style t="uitext.PlainText"/></Field><Field t="field.Layout" Title="Manual Video" ID="InsertYourOwnVideo" HideTitle="false"><Field t="field.PropertySheet1" ID="InsertYourOwnVideo_fields" Title="Fields" HideTitle="true"><Style t="group.PropertySheet"/><Operations t="operation.Operations"/><Field t="field.Field" FieldData="\%!@Name\%" ID="Name" Title="Title" ReadOnlyText=""><Type t="field_aspect.Text" Mandatory="true" HideTitle="false" ReadOnly="false"/><FieldAspect t="field_aspect.DescriptionForEmptyText" Description="html_enter_title"/><FieldAspect t="field_aspect.HideTitle"/><FieldAspect t="field_aspect.Css" Inline="width:200px;&#xa;background:white;&#xa;margin:0;" OnElement="content"/><FieldAspect t="field_aspect.Mandatory" ErrorMessage="html_please_enter_html_title"/><FieldAspect t="field_aspect.Validation" CheckValidation="on blur" ErrorMessage="html_title_cannot_excceed" ShowErrorMessageNextToField="true" AddTitleToErrorMessage="false"><Validation t="validation.CustomValidation"><SuccessCondition t="yesno.And" customxtml="true"><Item value="\%$Length\% &lt; 50"/><Var name="Length" t="text.Length"/></SuccessCondition></Validation></FieldAspect><FieldAspect t="field_aspect.Resizer" Disable="true"/></Field><Field t="field.Field" FieldData="\%!@url\%" ID="Video_Url" Title="Video Url" ReadOnlyText=""><Type t="field_aspect.Text" Mandatory="true" HideTitle="false" ReadOnly="false"/><FieldAspect t="field_aspect.DescriptionForEmptyText" Description="html_enter_url"/><FieldAspect t="field_aspect.HideTitle"/><FieldAspect t="field_aspect.Css" Inline="width:200px;&#xa;background:white;&#xa;margin:0;"/><FieldAspect t="field_aspect.Mandatory" ErrorMessage="html_please_enter_html_url"/><FieldAspect t="field_aspect.Validation" AddTitleToErrorMessage="false" CheckValidation="on save" ErrorMessage="html_please_enter_valid_url"><Validation t="validation.ContainsText" Text="//">&#xa;                        </Validation></FieldAspect><FieldAspect t="field_aspect.Resizer" Disable="true"/></Field></Field><Field t="field.Button" ID="ownVideoSend" Title="Send" HideTitle="true" ButtonText="html_send_button"><Style t="lp.LpacButton"/><Action t="operation.Validate" Group="InsertYourOwnVideo"><WhenValid t="jbart_agent_lpac.SendCollaborationEvent" ChannelType="htmlIframe" Command="start" DelayedSend="true" Channel="single"><Argument t="jbart_agent_lpac.Argument" Name="title" Value="\%@Name\%" Escape="true"/><Argument t="jbart_agent_lpac.Argument" Name="url" Value="\%@url\%" Escape="true"/></WhenValid></Action><FieldAspect t="field_aspect.Css" Inline="position: absolute; &#xa;top: 48px; &#xa;right: 20px;"/><FieldAspect t="field_aspect.GlobalCss" GlobalCss="#this&gt;div { display: none; }"/><FieldAspect t="jbart_agent_lpac.ShowOnlyWhenChatActive"/><Image t=""/></Field><GroupData t="group.DataFlow" FlowData="\%$VideoList/!manualVideo\%"/><FieldAspect t="field_aspect.Css" Inline="background: #F5F5F5;&#xa;position: relative;&#xa;min-width:350px;&#xa;height:100px;" OnElement="cell"/><FieldAspect t="field_aspect.SizePaddingsAndMargins" Inline="padding: 18px 0 0 75px;" OnElement="cell"/><Field t="field.Image" HideTitle="true" ID="Image" Title="video"><Image t="image.ImageInSprite" Url="https://dl.dropbox.com/u/24056024/aspire/html-small-icon.png" Size="18,13"/><Style t="image.PlainImage"/><FieldAspect t="field_aspect.Css" Inline="position: absolute;&#xa;top: 21px;?? &#xa;left: 20px;&#xa;margin-left:-60px;" OnElement="content" Class="video_img"/></Field><FieldAspect t="field_aspect.GlobalCss" GlobalCss="#this:hover .video_img { background-position: 0 -14px;}&#xa;#this .fld_ownVideoSend { display:block;}"/><Operations t="operation.Operations"/><Layout t="layout.Default"/><FieldAspect t="field_aspect.FieldData" FieldData="\%$List/!manualVideo\%"/></Field><FieldAspect t="field_aspect.GlobalCss"><GlobalCss><![CDATA[.empty_text_description { font-style: normal; color: #8B8B8B; opacity: 1; }\n\n.aatextbox {\npadding:3px;\nborder: 1px solid #BDC7D8;\nfont-size:12px;\nfont-family: Arial;\n}\n.aa_container_footer { clear:both; }\n\n]]></GlobalCss></FieldAspect></Field><Layout t="layout.Default"/><FieldAspect t="field_feature.Css"><Css><![CDATA[#this {}\n#wrapper { width: 440px;}]]></Css></FieldAspect></xtml></Component><UIPref><Document _Width="485px"/></UIPref></bart_unit></bart_unit></db></bart_dev><url url="?studio_style_tabs_tab=Css?pagedt_path=main/Predefined/Items/TITLE"/><externalJS><file file_name="AgentCollaborationAPI.js" load_condition="window.liveperson.AgentCollaborationAPI" cloud_base_url="//dl.dropbox.com/u/24056024/lpac/" local_base_url="apps/lp/"/><file file_name="jbart_agent_lpac.js" load_condition="ajaxart.gcs.jbart_agent_lpac" cloud_base_url="//dl.dropbox.com/u/24056024/lpac/" local_base_url="apps/lp/"/><file file_name="HtmlWidget_lang.js" load_condition="" cloud_base_url="" local_base_url="apps/lp/"/></externalJS><compress black_list="datefilter.DateFilterControl,field.TextFilterControl,debugui.OpenDebugUi" log_relations="" uncompressed="" js_white_list="" js_to_add=""/><embed with_data="" as="save file" dir="C:\Dropbox\Public\aspire\"/></jbart_project>'; window.jBart = window.jBart || jBart; jBartWidgets.LPHtmlWidget = jBart.activator(jBartWidget_LPHtmlWidget); 
}());