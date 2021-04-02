/*
 * jBart - Packaged at 01-04-2013-06-31
 * Copyright (c) 2011 ArtwareSoft Ltd
 * The software is distributed under the GPL license
 * For commercial use we advice to use our commercial license
 
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.

*/


























var ajaxart_capture_top = "";
var ajaxart_capture_mode = "";
var ajaxart_capture_onselect = null;
var ajaxart_captured_element = jQuery([]);
var ajaxart_capture_box = null;
var ajaxart_capture_box_add = null;
var ajaxart_capture_box_drop = null;
var ajaxart_drag = false;
var ajaxart_dragged = null;

//AA BeginModule
ajaxart.gcs.aaeditor = 
{
	IsMultipleObject: function (profile,data,context)
	{
			if (ajaxart.run(data,profile,'Value',context).length > 1)
				return [true];
			return [];
	},
  ClearCaptureBox: function (profile,data,params)
  {
	    if (ajaxart_capture_box != null)
 	    	ajaxart_capture_box.hide();
  	    if (ajaxart_capture_box_add != null)
  	    	ajaxart_capture_box_add.hide();
  	    if (ajaxart_capture_box_drop != null)
  	    	ajaxart_capture_box_drop.hide();
		  jQuery('.' + ajaxart_capture_top + " .placeholder_toadd_control").css("height","0px").css("background","none").css("border","0px solid #CCCCCC");
		  return ["true"];
  },
  ClearCaches: function (profile,data,context)
  {
	  window.aa_search_comp_of_type_cache = null;
	  window.ajaxart_comp_of_type_cache = null;
	  jBart.vars.compsOfTypeCache = {};
  },
  CaptureSelect: function (profile,data,context)
  {
	  ajaxart_capture_mode = aa_text(data,profile,'Mode',context);
	  ajaxart_capture_top = aa_text(data,profile,'Top',context);
	  
	  if (ajaxart_capture_mode == "add")
	  {
		  jQuery('.' + ajaxart_capture_top).addClass('aaeditor_addcontrol');
		  jQuery('.' + ajaxart_capture_top + " .placeholder_toadd_control").css("height","7px");
	  }
	  
	  ajaxart_captured_element = jQuery([]);
	  
	  if (window.captureEvents){ // FF
		window.onclick = ajaxart_capture_click;
		window.onmousemove = ajaxart_capture_mousemove;
		window.onkeydown = ajaxart_capture_keydown;
	  }
	  else  // IE
	  {
		document.onclick=ajaxart_capture_click;
		document.onmousemove=ajaxart_capture_mousemove;
		document.onkeydown=ajaxart_capture_keydown;
	  }
	
	  ajaxart_capture_onselect = function(element)
	  {
		jQuery('.' + ajaxart_capture_top).removeClass('aaeditor_addcontrol');
		if (element == null) { // cancel
	  		ajaxart.gcs.aaeditor.ClearCaptureBox();
	  		return;
		}
  	    var out = { isObject: true };
  	    if (ajaxart_drag)
	  	{
	  		ajaxart_drag = false;
  	    	var parentElement = element;
  	    	while ( ! ('ajaxart' in parentElement) && parentElement != null)
  	    		parentElement = parentElement.parentNode;
  	    	
  	    	out["TargetParent"] = [parentElement];
  	    	out["TargetPosition"] = [""+(ajaxart.aaeditor.getPlaceholderPosition(element)+0)];
  	    	out["Dragged"] = ajaxart_dragged;
	  		
	  		ajaxart.gcs.aaeditor.ClearCaptureBox();
	  		ajaxart.run([out],profile,'OnDrop',context);
	  		return;
	  	}

  	    if (ajaxart_capture_mode == "add")
  	    {
  	    	// find the parent element
  	    	var parentElement = element;
  	    	while ( ! ('ajaxart' in parentElement) && parentElement != null)
  	    		parentElement = parentElement.parentNode;
  	    	
  	    	out["ParentElement"] = [parentElement];
  	    	out["Position"] = [""+ajaxart.aaeditor.getPlaceholderPosition(element)];
  	    }
  	    else
  	    	out = element;

  	    ajaxart.run([out],profile,'OnSelect',context);
	  }
	  return [];
  },
  InPreview: function (profile,data,context)
  {
	  ajaxart.inPreviewMode = true;
	  var control = ajaxart.run(data,profile,'Control',context);
	  ajaxart.inPreviewMode = false;
	  
	  return control;
  },
  ProbeXtmlNew: function (profile,data,context)
  {
	var xtml = aa_first(data,profile,'Xtml',context);
	var param = aa_text(data,profile,'Param',context);
	if(!xtml|| !param) return [];
	var preview_context = aadt_calcPrimitivePreviewContext(xtml,param,context);
	return preview_context || [];
  },
  ProbeFieldData: function (profile,data,context)
  {
  	var xtml = aa_first(data,profile,'FieldXtml',context);
  	return aadt_calcPrimitivePreviewContext(xtml,'',context,{ probeFieldData: true }) || [];
  },
  CalculateTopCircuit: function (profile,data,context)
  {
	var xtml = aa_first(data,profile,'Xtml',context);
	if(!xtml) return [];
	var circuit = bart_find_top_circuit(xtml,context);
	if (circuit) return [circuit];
	circuit = aaeditor_find_top_circuit(xtml,context);
	if (circuit) return [circuit];
	
	return [];
  },
  CalcLocalPreviewData: function (profile,data,params)
  {
	if (ajaxart.xtmls_to_trace.length > 0) { ajaxart.log("trying to run tester during tester","warning"); return []; }
	var circuits = ajaxart.run(data,profile,'State',params);
	if (ajaxart.isObject(circuits))
	{ 
		var circuit = circuits[0];
		var return_all = aa_bool(data,profile,'ReturnAll',params);

		var SelectedInTree = circuit.SelectedInTree[0];
		if (! ajaxart.isObject(SelectedInTree)) return [];
		var XtmlForPreview = SelectedInTree.Xtml;
		if (!XtmlForPreview || ((! ajaxart.isxml(XtmlForPreview)) && XtmlForPreview.length > 0)) return [];

		var puttingDummy = false; var returnOutputAsInput = false;
		if (XtmlForPreview.length == 0)	// handling empty value
		{
			var field = ajaxart.totext(SelectedInTree.Field);
			var parent = SelectedInTree.ParentXtml;
			if ( field.indexOf('[+]') > -1)
			{
				XtmlForPreview = parent;  // new array item. heuristic: return only the input of parent
				if (parent.length > 0 && parent[0].getAttribute('t') == 'data.Pipeline') // special case
					returnOutputAsInput = true;
			}
			else
			{
			  if (field == "" || field.indexOf('[') > -1 || (! ajaxart.isxml(parent))) return [];
			  if (field == "name") return [];	// may cause infinitive loop setting name of Param to ""
			
			  parent = parent[0];
			  puttingDummy = true;
			  if (parent.getAttribute(field) == null)
				parent.setAttribute(field,"");
			  XtmlForPreview = ajaxart.xml.xpath(parent,"@"+field);
			}
		}
		aadt_putXtmlTraces(XtmlForPreview[0]);
		// tracing the XtmlForPreview and its parents
		if (ajaxart.xtmls_to_trace.length == 0) return [];	// fix this

		ajaxart.trycatch( function() {
			ajaxart.inPreviewMode = true;
			var output = null;
			if (ajaxart.subprofiles(profile,'MainCircuitRunner').length > 0)
				output = ajaxart.run(data,profile,"MainCircuitRunner",params);
			else {
				var TopXtml = circuit.TreeXtml;
				if (TopXtml.length == 0) return [];
				TopXtml = TopXtml[0];
				var input = [];
				if ('input' in TopXtml) input = TopXtml.input;
				var newContext = TopXtml.context;
				if (newContext == null) newContext = ajaxart.newContext();
				output = ajaxart.run(input,TopXtml.script,"",newContext);	// TODO: this should take no more than 0.5 sec
				if (ajaxart.component_exists(TopXtml.script.getAttribute("t") + "_Preview")) {
					ajaxart.setVariable(newContext, "Preview", [ { isObject:true, Output: output } ] );
					aa_run_component(TopXtml.script.getAttribute("t") + "_Preview",[],newContext);
				}
			}
		});
		
  	    var result = [];
		ajaxart.trycatch( function() {
			if (ajaxart.xtmls_to_trace[0].results.length >0)
			{
				result = ajaxart.xtmls_to_trace[0].results;
			}
			else  // no execution for required element, trying to find a way
				result = aaeditor.find_preview_context_over_gap();
		}, function(e) { } );
		ajaxart.xtmls_to_trace = [];
		ajaxart.inPreviewMode = false;
  	    if (puttingDummy && parent.getAttribute(field) == "") parent.removeAttribute(field);
  	    if (returnOutputAsInput && result.length > 0) // special case for pipline.Item[+]
  	    	result[0].Input = result[0].Output;
  	    
  	    if (result[0] && result[0].Output && result[0].Output.length == 0 && result[0].context.vars._AsyncIsQuery)
  	    {
  	    	var output = { isObject:true, _isAsyncObject: true , _callback: function() {} }
  	    	var init_async = function(output) {
  	    		if (!result[0].context.vars._AsyncCallback) result[0].context.vars._AsyncCallback = {};
  	    		result[0].context.vars._AsyncCallback.callBack = function(data1,ctx2) {
  	    			output._callback(data1,ctx2);
  	    		}
  	    	}
  	    	init_async(output);
  	    	result[0].Output = [output];
  	    }
		return result;
	}
	return [];
  },
  SimulateRunningContextForPreview : function(profile,data,context)
  {
	  ajaxart.aaeditor.current_running_context_for_preview = { isObject:true };
	  ajaxart.aaeditor.current_running_context_for_preview.Input = data;
	  ajaxart.aaeditor.current_running_context_for_preview.context = context;
	  return data;
  },
  AsyncObjectControl: function(profile,data,context)
  {
	var out = jQuery('<div>Please wait for async result..</div>')[0];

	data[0]._callback = function(data1,ctx2) {
		out.innerHTML = '';
		out.appendChild( ajaxart.runNativeHelper(data1,profile,'ShowSync',context)[0] );
	}
	return [out];
  },
  HowLong : function(profile,data,context)
  {
	var usage = aa_first(data,profile,'Usage',context);
	if (usage == null) return [];
	var before = new Date().getTime();
	ajaxart.run([],usage,"",context);
	var time_passes = new Date().getTime() - before;
	var out = ajaxart.getControlElement(context,true);
	jQuery(out).append('time: ' + time_passes + "ms<br/>");
	return [];
  },
  ProfileGlobals : function(profile,data,context)
  {
	var usage = aa_first(data,profile,'Usage',context);
	if (usage == null) return [];
	
	var before = new Date().getTime();
	ajaxart.profiling_of_globals = [];
	ajaxart.run([],usage,"",context);
	var time_passes = new Date().getTime() - before;
	var str = '<profile total="'+ time_passes + '">';
	
	for (var comp in ajaxart.profiling_of_globals)
		str += '<comp id="' + comp + '" calls="' + ajaxart.profiling_of_globals[comp].calls +
			'" total="' + ajaxart.profiling_of_globals[comp].total + '" />';
	str += "</profile>";
	var out = ajaxart.run([str],ajaxart.parsexml('<Control t="debugui.GlobalProfilingResult" />'),"",ajaxart.newContext());
	jQuery("#ajaxart_top").append(out[0]);
	
	var out = ajaxart.getControlElement(context,true);
	jQuery(out).append(out[0]);
	return [];
  },
  ComponentTitle: function(profile,data,context)
  {
	  return [ aa_component_title(data) ];
  },
  XmlElementInTree: function(profile,data,context)
  {
	  if (data.length == 0) return [];
	  var xml = data[0];
	  var out = document.createElement("SPAN");
	  
	  if (xml.nodeType == 2) { //attribute
		  jQuery(out).text(xml.nodeValue + " (" + xml.nodeName + ")");
		  return [out];
	  }
	  var header = document.createElement("SPAN");
	  jQuery(header).text(xml.tagName);
	  header.className = "xml_element"
	  out.appendChild(header);
		for (var i=0; i<xml.attributes.length; i++) {
			var val = xml.attributes[i].nodeValue;
			if (val != "") {
				var att = document.createElement("SPAN");
				jQuery(att).text(xml.attributes.item(i).name + "=");
				att.className = "xml_att";
				out.appendChild(att);

				var att_val = document.createElement("SPAN");
				jQuery(att_val).text(val);
				att_val.className = "xml_att_value";
				out.appendChild(att_val);
			}
		}
	  return [out];
  },
  DynamicTextOpenPart: function(profile,data,context)
  {
	  var text = ajaxart.totext(data);
	  if (text == null) return [];
	  if (aa_text(data,profile,'Type',context) == '%') {
		  var count = 0;
		  var lastIndex = -1;
		  for (i=0; i<text.length; i++)
			  if (text.charAt(i) == '%')
				  if (i == 0 || text.charAt(i-1) != '\\') {
					  count++;
					  lastIndex = i;
				  }
		  if (count % 2 == 0) return [];
		  var out = text.substring( lastIndex+1 );
		  if (out == "") return [ "__EMPTY" ];
		  return [out]; 
	  } else {
		  var index = text.lastIndexOf("{");
		  if (index == -1) return [];
		  var lastPart = text.substring(index+1);
		  if (lastPart.indexOf('}') != -1) return [];
		  if (lastPart == "") return [ "__EMPTY" ];
		  return [ lastPart ];
	  }
  },
  CalculatePrimitiveInnerParts: function(profile,data,context)
  {
	  var text = aa_text(data,profile,'Text',context);
	  var relevant_context = aa_first(data,profile,'Context',context);
	  var relevant_data = ajaxart.run(data,profile,'Input',context);
	  
	  if (relevant_context == null) return [];
	  var in_dynamic_part = false;
	  var i = 0;
	  while (true) {
		  if (i >= text.length) break;
		  if (text.charAt(i) == '%' && (i == 0 || text.charAt(i-1) != '\\'))
			  in_dynamic_part = !in_dynamic_part;
		  if (text.charAt(i) == '{' && in_dynamic_part) {
			  var ending_index = text.indexOf('}', i);
			  if (ending_index != -1) {
				  var to_compute = text.substring(i+1,ending_index);
				  var str = ajaxart.totext( ajaxart.dynamicText(relevant_data,"%"+to_compute+"%",relevant_context) );
				  text = text.substring(0, i) + str + text.substring(ending_index+1);
				  i = ending_index;
			  }
		  }
		  i++;
	  }
	  return [ text ];
  },
  EditPrimitiveHalfWrittenPart: function(profile,data,context)
  {
	  var text = ajaxart.totext(data);
	  var lastIndex = 0;
	  if (text.lastIndexOf("/") > lastIndex)
		  lastIndex = text.lastIndexOf("/");
	  if (text.lastIndexOf("{") > lastIndex)
		  lastIndex = text.lastIndexOf("{");
	  if (text.lastIndexOf("%") > lastIndex)
		  lastIndex = text.lastIndexOf("%");
	  if (text.lastIndexOf("$") > lastIndex)
		  lastIndex = text.lastIndexOf("$");
	  if (text.lastIndexOf("[") > lastIndex)
		  lastIndex = text.lastIndexOf("[");
	  if (lastIndex < text.length)
		  return [ text.substring(lastIndex+1) ];
	  else
		  return [];
  },
  RegisterForToolbarKeyboard: function(profile,data,context)
  {
	  if (document.aaeditorRegistered) return;
	  document["aaeditorRegistered"] = true;
	  jQuery(document).keyup(function(e) {
		  if (e.keyCode == 83 && e.shiftKey && e.ctrlKey) {	//Ctrl+Shift+S
			  if (jQuery(".aaeditor_customize") == null) return;
			  var btn = jQuery(".aaeditor_customize")[0];
			  aa_run_component("aaeditor.SaveToServerAction",[],btn.ajaxart.params);
		  }
	  });
	  return [];
  },
  ComponentsOfTypeNew: function (profile,data,context)
  {
	// should be the only one (Yaniv)
	var plugins = (context.vars._WidgetXml) ? aa_totext( aa_xpath(context.vars._WidgetXml[0],'@plugins') ) : '';
	var type = aa_text(data,profile,'Type',context);
	var lightOnly = aa_bool(data,profile,'LightOnly',context); 

	var cacheName = 'cache_'+plugins;
	if (lightOnly) cacheName += '_light';
	
	if (!jBart.vars.compsOfTypeCache) jBart.vars.compsOfTypeCache = {};
	
	if (! jBart.vars.compsOfTypeCache[cacheName] ) {
		jBart.vars.compsOfTypeCache[cacheName] = {};
		var cache = jBart.vars.compsOfTypeCache[cacheName];
		var promotedCache = {};
		
		var styleGuide = 'jbart';
		try {
		  if (context.vars._BartContext) styleGuide = aa_totext( context.vars._BartContext[0].StyleGuide.ID );
		} catch(e) {}
		
		var pluginsStr = ',' + plugins + ',';	// for fast detection, using indexOf
  	 for (var i in ajaxart.components) {
		  for(var j in ajaxart.components[i]) {
			  var comp = ajaxart.components[i][j];
			  var isPromoted = comp.getAttribute('styleGuide') == styleGuide;
			  if (comp.getAttribute('hidden') == 'true') continue;
			  if (lightOnly && comp.getAttribute('light') == 'false') continue;
			  if (lightOnly && comp.parentNode && comp.parentNode.getAttribute('light') == 'false') continue;
			  var plugin = comp.parentNode.getAttribute('plugin');
			  if (plugin && pluginsStr.indexOf(','+plugin+',') == -1) continue; // not included
			  	
			  var types = (comp.getAttribute('type') || '').split(',');
			  for(var t=0;t<types.length;t++) {
				  if (types[t].split('.').length > 2) // e.g. data.Boolean.jBart
					  types.push(types[t].substring(0,types[t].lastIndexOf('.')));
			  }
			  for(var t in types)
			  {
				  var compType = types[t];
				  if (compType == '') continue;
				  if (!cache[compType]) cache[compType] = [];
				  if (!promotedCache[compType]) promotedCache[compType] = [];
				  var item = { ID: i + '.' + j , Definition: comp };
				  if (isPromoted)
						promotedCache[compType].push( item );
				  else
				    cache[compType].push( item );
			  }
		  }
  	    }
  	    // add the promoted to the cache
  	    for(var compType in promotedCache) {
  	    	var promotedPTs = promotedCache[compType];
  	    	if (promotedPTs.lenth==0) continue;
  	    	cache[compType] = promotedPTs.concat(cache[compType]);
  	    }
	}
	if (aa_bool(data,profile,'ForAllTypes',context)) {
		if (! jBart.vars.compsOfTypeCache[cacheName][type+'_*']) {
			var out = [];
			ajaxart.concat( out , jBart.vars.compsOfTypeCache[cacheName][type]);
			ajaxart.concat( out , jBart.vars.compsOfTypeCache[cacheName]['*'] );
			jBart.vars.compsOfTypeCache[cacheName][type+'_*'] = out;
		}
		return jBart.vars.compsOfTypeCache[cacheName][type+'_*'];
	}
	
	return jBart.vars.compsOfTypeCache[cacheName][type];
  },
  ComponentsOfType: function (profile,data,context)
  {
	  if (! window.aa_search_comp_of_type_cache) {
		  aa_search_comp_of_type_cache = {};
		  ajaxart_comp_of_type_advanced_cache = {};
		  var is_jbart = aa_isjbart() && !context.vars._ShowNonJBartComponents;
		  for (var i in ajaxart.components) {
			  var advanced = false;
			  if (i.lastIndexOf("_dt") == i.length-3 && i.length > 3 || i == "aaeditor") advanced = true;
			  for(var j in ajaxart.components[i]) {
				  var comp = ajaxart.components[i][j];
				  if (comp.getAttribute('hidden') == 'true') continue;
				  if (is_jbart && comp.parentNode.getAttribute('jbart') != 'true') continue;
				  if (is_jbart && comp.getAttribute('jbart') == 'false') continue;
//				  if (! advanced && comp.getAttribute('advanced') == "true") advanced = true;
				  var types = (comp.getAttribute('type') || '').split(',');
				  for(var k=0;k<types.length;k++) {
					  if (types[k].split('.').length > 2) // e.g. data_items.Items.PageData
						  types.push(types[k].substring(0,types[k].lastIndexOf('.')));
				  }
				  var category = comp.getAttribute('category');
				  if (category) types.push(types[0]+'.'+category);

				  for(var t in types)
				  {
					  type = types[t];
					  if (!type) continue;
					  if (!advanced) {
					    if (aa_search_comp_of_type_cache[type] == null) aa_search_comp_of_type_cache[type] = [];
					    var comp = "" + i + "." + j;
					    aa_search_comp_of_type_cache[type].push({comp:comp, lower:comp.toLowerCase()});
					  }
					  else {
						    if (aa_search_comp_of_type_cache[type] == null) aa_search_comp_of_type_cache[type] = [];
						    var comp = "" + i + "." + j;
						    aa_search_comp_of_type_cache[type].push({comp:comp, lower:comp.toLowerCase()});
					  }
				  }
			    if (aa_search_comp_of_type_cache["*"] == null) aa_search_comp_of_type_cache["*"] = [];
			    aa_search_comp_of_type_cache["*"].push("" + i + "." + j);
			  }
		  }
	  }
	  var type = aa_text(data,profile,'Type',context);
	  if (type.lastIndexOf("[]") > -1 && type.lastIndexOf("[]") == type.length - 2)	// remove []
        type = type.substring(0,type.length-2);
	  if (type == "enum" || type=="dynamic_enum" || type=="dynamic_enum_multi")
		  type = "data.Data";
	  var out = aa_search_comp_of_type_cache[type];
	  if (aa_bool(data,profile,'IncludeAdvancedComponents',context))
		  ajaxart.concat(out,ajaxart_comp_of_type_advanced_cache[type]);

	  if (aa_bool(data,profile,'ForAllTypes',context)) {
		  ajaxart.concat(out,ajaxart_comp_of_type_advanced_cache[type]);
		  ajaxart.concat(out,aa_search_comp_of_type_cache["*"]);
	  }
	  if (out == null) out = [];
	  
	  var textFilter = aa_text(data,profile,'TextFilter',context).toLowerCase().replace(" ","");
	  if (textFilter != "") {
		  var items = [];
		  var first_items = [];
		  for (i in out) {
			  if (out[i].lower && out[i].lower.indexOf(textFilter) >= 0) {
				  var index = out[i].lower.lastIndexOf(textFilter);
				  if (index > 0 && out[i].lower[index-1] == ".")	// "Pi" for "data.Pipeline"
					  first_items.push(out[i].comp);
				  else
					  items.push(out[i].comp);
			  }
		  }
		  first_items.sort(function(a, b) { return a.length - b.length; });
		  out = first_items.concat(items);
	  } else {
		  var items = [];
		  for (i in out)
			  items.push(out[i].comp);
		  out = items;
	  }
	  
	  return out;
  }
}

aa_gcs("xmltree",{
	ItemTextHtmlForXmlElement: function(profile,data,context) 
	{
	  var tagCssClass = aa_attach_global_css( aa_text(data,profile,'TagCss',context),null,'xmltag' );
	  var attributeNameCssClass = aa_attach_global_css( aa_text(data,profile,'AttributeNameCss',context),null,'xmlattr' );
	  var valueCssClass = aa_attach_global_css( aa_text(data,profile,'ValueCss',context),null,'xmlattrvalue' );
	  
	  var xml = data[0];
	  var out = jQuery('<span/>');
	  
	  function onclick() {
		  ajaxart.run(this.jbData || data,profile,'OnClick',aa_ctx(context,{ControlElement: [this], _CurrentFocus: [this]}));
	  }
	  var innerText = '';
	  for(var iter = xml.firstChild;iter != null;iter=iter.nextSibling) {
		if (iter.nodeType == 3) innerText += iter.nodeValue;
	  }
	  innerText = innerText.replace(/\s/g, "");
	  
	  var tag = jQuery('<span/>').text(xml.tagName).addClass(tagCssClass);
	  tag[0].onclick = onclick;
	  
	  out.append(tag);
	  
	  if (innerText) {
		  tag.text(xml.tagName+'=');
		  var value = jQuery('<span/>').text(innerText).addClass(valueCssClass);
		  value[0].onclick = onclick;
		  out.append(value);
	  }
	  
  	  var attrs = xml.attributes;
	  for(var i=0;i<attrs.length;i++) {
		var name = attrs.item(i).nodeName;
		var attrName = jQuery('<span/>').text(name+'=').addClass(attributeNameCssClass);
		out.append(attrName);
		var value = jQuery('<span/>').text(xml.getAttribute(name)).addClass(valueCssClass);
		out.append(value);

		attrName[0].jbData = [attrs.item(i)];
		value[0].jbData = [attrs.item(i)];
		value[0].onclick = onclick; attrName[0].onclick = onclick;
	  }
	  return out.get();
	}
});
//AA EndModule
ajaxart.aaeditor = {};
aaeditor = {};
aaeditor.record_inputs_end = function(e,profile,context)
{
	if (e.keyCode == 121 && e.ctrlKey == true) {// Ctrl+F10
	    if (window.captureEvents)
			  window.onkeydown = null;
		else  // IE
			  document.onkeydown = null;
	    
	    if (ajaxart.xtmls_to_trace.length != 1) {
	    	ajaxart.log("aaeditor.record_inputs - someone else had used xtmls_to_trace during recording");
	    	return [];
	    }
	    var results = ajaxart.xtmls_to_trace[0].results;
	    ajaxart.xtmls_to_trace = [];
		ajaxart.run(results ,profile,'OnFinishRecord',context);
	}
}
aaeditor.find_preview_context_over_gap = function()
{
	var deepest_executed = 0;
	while (deepest_executed < ajaxart.xtmls_to_trace.length) {
		if (ajaxart.xtmls_to_trace[deepest_executed].results.length > 0)
			break;
		deepest_executed ++;
	}
	if (deepest_executed == ajaxart.xtmls_to_trace.length) return [];
	var current_context = ajaxart.xtmls_to_trace[deepest_executed].results[0];
//	ajaxart.setVariable(current_context.context,"OpenDialog",[]); //don't open dialogs 
	for (var current = deepest_executed;  current>=0; current--) {
		if (!ajaxart.xtmls_to_trace[current].xtml) continue;
		var type = aaeditor.type_of_xtml(ajaxart.xtmls_to_trace[current].xtml);
		if (current == 0) { // reaching desired point
			if (type != "action.Action" && type != "action.Action" && type != "action_async.Action" && type != "xml.Change" && ajaxart.xtmls_to_trace[current].xtml) // executing to determine output
				current_context.Output = ajaxart.run(current_context.Input, ajaxart.xtmls_to_trace[current].xtml, "", current_context.context);
			return [ current_context ];
		}
		// first try: use InputContext (declarative)
		var current_xtml = ajaxart.xtmls_to_trace[current].xtml;
		var next_xtml = ajaxart.xtmls_to_trace[current-1].xtml;
		var param_name = (next_xtml.nodeType == 1) ? aa_tag(next_xtml) : next_xtml.nodeName;
		var param_xml = aa_component_param_def(current_xtml.getAttribute("t"),param_name);
		if (ajaxart.xtmls_to_trace[current].fieldData) {	// using field data
			current_context.Input = ajaxart.xtmls_to_trace[current].fieldData;
			continue;
		}
		if (param_xml != null && (param_xml.getAttribute("RunningInput") != null || ajaxart.childElem(param_xml,"RunningInput") != null)) {
			current_context.Input = ajaxart.run(current_context.Input,param_xml,'RunningInput',aa_ctx(current_context.context, { _Xtml:[current_xtml] } ));
			continue;
		}
		if ( current != deepest_executed && type != "action.Action" && type != "action.Action" && type != "action_async.Action" && type != "xml.Change" && type != 'ui.WritableAddItem' )
		{ // second try : trying to run current item and using the normal trace mechanism
			var old_xtmls_to_trace = ajaxart.xtmls_to_trace;
			ajaxart.xtmls_to_trace = [ { xtml: ajaxart.xtmls_to_trace[0].xtml , results: [] } ];
			ajaxart.run(current_context.Input, current_xtml, "", current_context.context);
			if (ajaxart.xtmls_to_trace[0].results.length > 0)
				return ajaxart.xtmls_to_trace[0].results;
			ajaxart.xtmls_to_trace = old_xtmls_to_trace;
		}
		  // last try: cannot execute or no point of execution : passing previous input
		ajaxart.aaeditor.current_running_context_for_preview = null;
		var dummy_xtml_for_context = ajaxart.xml.clone([ ajaxart.xtmls_to_trace[current].xtml ]);
		dummy_xtml_for_context.setAttribute("t","aaeditor.SimulateRunningContextForPreview");
		current_context.Input = ajaxart.run(current_context.Input, dummy_xtml_for_context, "", current_context.context);
		if (ajaxart.aaeditor.current_running_context_for_preview == null) // condition didn't pass
			return [];
		current_context = ajaxart.aaeditor.current_running_context_for_preview;
	}
	return [];
}
aaeditor.type_of_xtml = function(xtml)
{
	var param_name;
	if (xtml.nodeType == 2) 
		param_name = xtml.nodeName;
	if (xtml.nodeType == 1 || param_name == "value") 
		param_name = xtml.tagName;
	var parent_xtml = ajaxart.xml.parentNode(xtml);
	if (parent_xtml == null) // detached xtml code
	{
		if (xtml.nodeType == 2) return "data.Data";
		var component = xtml.getAttribute("t");
		if (component == null) return "data.Data";
  	    var middlePos = component.indexOf('.');
		var ns = component.substring(0,middlePos);
		var compName = component.substr(middlePos+1);
  	    if (typeof(ajaxart.components[ns]) == "undefined")
		 {
  	    	if (ns != "" && component != "")
			  ajaxart.log("plugin " + ns + " is not defined. trying to use component " + component,"error");
			return "data.Data";
		 }
		 var global = ajaxart.components[ns][compName];
		 return global.getAttribute("type");
	}
	if (xtml.tagName == 'xtml' && parent_xtml.tagName == "Component")
		return parent_xtml.getAttribute("type");
	if (parent_xtml.getAttribute("t") == null && ajaxart.xml.parentNode(parent_xtml) != null) 
		parent_xtml = ajaxart.xml.parentNode(parent_xtml);
	if (parent_xtml.getAttribute("t") == null)
		ajaxart.log("type_of_xtml_element - problem");

	if (parent_xtml.getAttribute("t") == null) return "data.Data";
	var parts = parent_xtml.getAttribute("t").split(".");
	var comp = ajaxart.components[parts[0]][parts[1]];
	var param_type_result = ajaxart.xml.xpath(comp,"Param[@name='" + param_name + "']/@type");
	if (param_type_result.length == 0) return "data.Data";
	var param_type = param_type_result[0].nodeValue;
	if (param_type.indexOf("[]") != -1)
		return param_type.substring(0, param_type.indexOf("[]"));
	return param_type;
}

function ajaxart_capture_mousemove(e)
{
    var el=(typeof event!=='undefined')? event.srcElement : e.target;
    var underTop = jQuery(el).parents('.' + ajaxart_capture_top).length > 0;
    if (! underTop) return;
    if (ajaxart_drag)
    {
    	ajaxart_dragmove(el);
    	return;
    }
    
    if (ajaxart_capture_mode == "add")
    {
    	if (! jQuery(el).hasClass("placeholder_toadd_control")) return;
    	ajaxart_captured_element = jQuery(el);
    	if (ajaxart_capture_box_add == null)
    	{
    		ajaxart_capture_box_add = jQuery('<div class="capturebox_add right2left" style="z-index:500"></div>');
    		ajaxart_capture_box_add.appendTo("body");
    	}
    	
    	var type= el.getAttribute("ajaxart_type").split('.')[1];
    	ajaxart_capture_box_add.html("add " + type);
    	ajaxart_capture_box_add.css('left',aa_absLeft(el) -2);
    	ajaxart_capture_box_add.css('top',aa_absTop(el)-2);
    	ajaxart_capture_box_add.width(jQuery(el).outerWidth());

    	ajaxart_capture_box_add.show();
    	
    	return;
    }
    
	// find el with context
    var cmsart = ajaxart.incmsart;
    var stop = false;
    while (el != null && !stop)
    {
    	if ('ajaxart' in el &&  el.ajaxart.script != null)
    	{
    		if (cmsart)
    		{
    			var root = ajaxart.xml.root(el.ajaxart.script);
    			if (root.tagName == 'xtml') stop = false;
    			else stop = true;
    		}
    		else
        		stop=true;
    	}
    	
    	if (!stop)
    	  el = el.parentNode;
    }
	
	if ( el==null || ajaxart_captured_element.length > 0 && ajaxart_captured_element[0] == el) return;
	ajaxart_captured_element = jQuery(el);
	
	if (ajaxart_capture_box == null)
	{
		ajaxart_capture_box = jQuery('<div class="capturebox" ><div class="top"> <div class="captureboxtext"></div> </div><div class="right"/><div class="bottom"/><div class="left"/></div>');
		ajaxart_capture_box.appendTo("body");
	}
	jQuery(ajaxart_capture_box).find(".captureboxtext").html(el.ajaxart.script.getAttribute("t").split('.')[1]);
	
	var elem_pos = { x: aa_absLeft(el), y: aa_absTop(el)};
	var width = jQuery(el).outerWidth();
	var height = jQuery(el).outerHeight();
	jQuery(ajaxart_capture_box).find(".top").css("left",elem_pos.x-2).css("top",elem_pos.y-2).width(width+4);
	jQuery(ajaxart_capture_box).find(".bottom").css("left",elem_pos.x-2).css("top",elem_pos.y-2 + height).width(width+4);
	jQuery(ajaxart_capture_box).find(".left").css("left",elem_pos.x-2).css("top",elem_pos.y-2).height(height+2);
	jQuery(ajaxart_capture_box).find(".right").css("left",elem_pos.x-2 + width).css("top",elem_pos.y-2).height(height+2);
	ajaxart_capture_box.height(jQuery(el).outerHeight());
	ajaxart_capture_box.width(jQuery(el).outerWidth());

	ajaxart_capture_box.show();
}

function ajaxart_capture_keydown(e)
{
	if (e.keyCode == 27) {
		ajaxart_stop_capture();
		ajaxart_captured_element = jQuery([]);
	    ajaxart_capture_onselect(null);
	}
}
function ajaxart_capture_move(e)
{
	if (ajaxart_drag)
		ajaxart_capture_mousemove(e);
}

function ajaxart_dragmove(el)
{
	if (! jQuery(el).hasClass("placeholder_toadd_control")) return;
	ajaxart_captured_element = jQuery(el);
	if (ajaxart_capture_box_drop == null)
	{
		ajaxart_capture_box_drop = jQuery('<div class="capturebox_add"></div>');
		ajaxart_capture_box_drop.appendTo("body");
	}
	
	ajaxart_capture_box_drop.css('left',elem_pos.x-2);
	ajaxart_capture_box_drop.css('top',elem_pos.y-2);
	ajaxart_capture_box_drop.width(jQuery(el).outerWidth());

	ajaxart_capture_box_drop.show();
}

function ajaxart_stop_capture()
{
	if (window.captureEvents){ // FF
		  window.captureEvents(Event.Click);
		  window.onclick=null;
		  window.onmousemove=null;
		  window.onkeydown=null;
	    }
		else  // IE
		{
		  document.onclick=null;
		  document.onmousemove=null;
		  document.onkeydown=null;
		}
}
function ajaxart_capture_click(e)
{
	if (ajaxart_captured_element.length == 0) return;
	ajaxart_stop_capture();
	var param = ajaxart_captured_element[0];
	ajaxart_captured_element = jQuery([]);

    ajaxart_capture_onselect(param);
}

ajaxart.aaeditor.current_running_context_for_preview = null;
ajaxart.aaeditor.getPlaceholderPosition = function(element)
{
  var pos=0;
  var parent = element.parentNode;
  
  var node = parent.firstChild;
  while (node != null)
  {
		if (node.nodeType == 1 && jQuery(node).hasClass("placeholder_toadd_control") ) {
			if (node == element) return pos;
			pos++;
		}
		node=node.nextSibling;
  }
  return pos;
}

function aaeditor_find_top_circuit(xtml,context)
{
  var circuit = {isObject:true };
	circuit.RunCircuit = function() {
		var type = aaeditor.type_of_xtml(xtml);
	    var not_action = (type != "action.Action" && type != "action.Action" && type != "action_async.Action" && type != "xml.Change" && type != "ui.WritableAddItem");
	    var out = [];
	    if (not_action)
	    	out = ajaxart.run([],xtml,"",context);
	    else {	// mark manually the top xtml as run, to use later in gaps
	        for (i in ajaxart.xtmls_to_trace)
	       	 if (xtml == ajaxart.xtmls_to_trace[i].xtml)
	       		 ajaxart.fill_trace_result(ajaxart.xtmls_to_trace[i].results,[],out,context,[]);
	    }
        return out;
	}
	circuit.GlobalPreview = function() {
		var out = this.RunCircuit();
		if (ajaxart.ishtml(out)) 
			return out;
		else 	// text to html
			return [jQuery("<span/>").text(ajaxart.totext_array(out))[0]];
	};
  return circuit;
}
function aa_component_title(data)
{
	  var component = ajaxart.totext(data);
	  if (component == "") return [""];
	  var items = component.split(".");
	  if (items.length < 2) { return [] };
	  if (items[0] == "data" || items[0] == "ui" || items[0] == "yesno" || items[0] == "action")
		  return aa_text_capitalizeToSeperateWords(items[1]);
	  return aa_text_capitalizeToSeperateWords(items[1]) + " (" + items[0] + ")";
}









aa_gcs("css_dt", {
	ParseCssDeclaration: function (profile,data,context) {
		ajaxart.css_dt = ajaxart.css_dt || {
			numericProps: ',font-size,width,height,border-radius,padding-top,padding-right,padding-bottom,padding-left,margin-top,margin-right,margin-bottom,margin-left,',
			tokenProps: ',cursor,font-family,overflow,text-transform,text-align,text-overflow,position,float,opacity,'
		}
	
		var result = ajaxart.parsexml('<Css/>');
		var css = aa_text(data,profile,'Css',context) + ';';
		var color_result = aa_build_color_lookup(css); // replacing color expressions with ##colorIndex
		var css = color_result.css;
		var colors = color_result.colors;

		function setAtt(output,att,val) {
			var important = val.indexOf('!important');
			if (important != -1) {
				output.setAttribute('important',(output.getAttribute('important') || '') + ',' + att + ',');
				val = val.substr(0,important);
			}
			output.setAttribute(att,val);
		}
		function injectColors(css) {
			return css.replace(/\#\#([0-9]+)/, function(colorCode) { return aa_color_lookup(colors,colorCode)});
		}
		function parseColor(att,css,result) {
			var color_match = (' ' +css).match(/((\s+[a-zA-Z]+)|(\#[\#0-9A-Fa-f]+))/);
			if (color_match)
				setAtt(result,att,color_match[2] || aa_color_lookup(colors,color_match[3]));
			return color_match[2] || color_match[3];
		}
		function parseBackground(css,result) {
			setAtt(result,'background',css);
		}
		function parseBorder(css,result) {
			function setAtts(pattern,side) {
				var match = css.match(pattern);
				if (!match) return;
				var output = ajaxart.parsexml('<border/>');
				setAtt(output,'size',match[1]);
				setAtt(output,'style',match[2]);
				setAtt(output,'color',injectColors(match[3]));
				setAtt(output,'side',side);
		        result.appendChild(output);
			}
			setAtts(/^border:\s*([^\s]+)\s+([^\s]+)\s+([^\s]+)/,'');
			setAtts(/^border-left:\s*([^\s]+)\s+([^\s]+)\s+([^\s]+)/,'left');
			setAtts(/^border-right:\s*([^\s]+)\s+([^\s]+)\s+([^\s]+)/,'right');
			setAtts(/^border-top:\s*([^\s]+)\s+([^\s]+)\s+([^\s]+)/,'top');
			setAtts(/^border-bottom:\s*([^\s]+)\s+([^\s]+)\s+([^\s]+)/,'bottom');
		}

		function parseShadow(css,result) {
			var shadows = css.split(',');
			for(var i=0;i<shadows.length;i++) {
				var shadow = shadows[i];
				var output = ajaxart.parsexml('<shadow/>');
				var inset_match = shadow.match(/(.*)inset(.*)/);
				if (inset_match) {
					setAtt(output,'shadow_inset','true');
					shadow = inset_match[1] + inset_match[2];
				}
				var color = parseColor('shadow_color',shadow,output);
				if (color) shadow = shadow.replace(color,''); // remove the color from the css
				var match = shadow.match(/\s*([^\s]+)\s+([^\s]+)(\s+([^\s]+))?(\s+([^\s]+))?/);
				if (match) {
					setAtt(output,'shadow_x',match[1]);setAtt(output,'shadow_y',match[2]);setAtt(output,'shadow_blur',match[3] || '0');
					setAtt(output,'shadow_spread',match[5] || '0');
				}
		        result.appendChild(output);
			}
		}
		function parseTextShadow(css,result) {
			var shadows = css.split(',');
			for(var i=0;i<shadows.length;i++) {
				var shadow = shadows[i];
				var output = ajaxart.parsexml('<textshadow/>');
				var match = shadow.match(/^\s*([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/); // Todo: blur and colors are optional
				if (!match) return;
				setAtt(output,'x',match[1]);
				setAtt(output,'y',match[2]);
				setAtt(output,'blur',match[3]);
				setAtt(output,'color',match[4]);
		        result.appendChild(output);
			}
		}
		function parseGradient(type,css,result) {
			setAtt(result,'gradientType',type);
			var stops = css.split(',');
			var dir = stops[0].match(/deg$/) ? stops[0].slice(0,-3) : stops[0];
			setAtt(result,'gradientDir',dir);
			for(var i=1;i<stops.length;i++) {
				var grad = stops[i];
				var output = ajaxart.parsexml('<grad/>');
				var match = grad.match(/^\s*([^\s]+)\s+([0-9]+)/);
				if (!match) return;
				setAtt(output,'color',match[1]);
				setAtt(output,'pos',match[2]);
		        result.appendChild(output);
			}
		}
		var specialProps = [ 
		          [/^font-weight:\s*bold/,function(output) { setAtt(output,'bold','true') }], 
		          [/^white-space:\s*nowrap/,function(output) { setAtt(output,'nowrap','true') }], 
		          [/^font-style:\s*italic/,function(output) { setAtt(output,'italic','true') }], 
		          [/^text-decoration:\s*underline/,function(output) { setAtt(output,'underline','true') }],
		          		          
			      [/^padding:\s*([^\s]+)$/,function(output,match) { 
			    	  setAtt(output,'padding_left',match[1]);setAtt(output,'padding_right',match[1]);setAtt(output,'padding_top',match[1]);setAtt(output,'padding_bottom',match[1]); }],
			      [/^padding:\s*([^\s]+)\s+([^\s]+)$/,function(output,match) { 
			    	  setAtt(output,'padding_left',match[2]);setAtt(output,'padding_right',match[2]);setAtt(output,'padding_top',match[1]);setAtt(output,'padding_bottom',match[1]); }],
			      [/^padding:\s*([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/,function(output,match) 
			          { setAtt(output,'padding_top',match[1]);setAtt(output,'padding_right',match[2]);setAtt(output,'padding_bottom',match[3]);setAtt(output,'padding_left',match[4]);}],
			      [/^margin:\s*([^\s]+)$/,function(output,match) { 
			    	  setAtt(output,'margin_left',match[1]);setAtt(output,'margin_right',match[1]);setAtt(output,'margin_top',match[1]);setAtt(output,'margin_bottom',match[1]); }],
			      [/^margin:\s*([^\s]+)\s+([^\s]+)$/,function(output,match) { 
			    	  setAtt(output,'margin_left',match[2]);setAtt(output,'margin_right',match[2]);setAtt(output,'margin_top',match[1]);setAtt(output,'margin_bottom',match[1]); }],
			      [/^margin:\s*([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/,function(output,match) 
			          { setAtt(output,'margin_top',match[1]);setAtt(output,'margin_right',match[2]);setAtt(output,'margin_bottom',match[3]);setAtt(output,'margin_left',match[4]); }],
			      [/^text-shadow:(.+)/,function(output,match) { parseTextShadow(match[1],output) }],
			      [/^border:.+/,function(output,match) { parseBorder(match[0],output) }],
			      [/^border-left:.+/,function(output,match) { parseBorder(match[0],output) }],
			      [/^border-right:.+/,function(output,match) { parseBorder(match[0],output) }],
			      [/^border-top:.+/,function(output,match) { parseBorder(match[0],output) }],
			      [/^border-bottom:.+/,function(output,match) { parseBorder(match[0],output) }],
			      [/^box-shadow:\s*(.+)/,function(output,match) { parseShadow(match[1],output) }],
			      [/^color:\s*(.+)/,function(output,match) { setAtt(output,'color',injectColors(match[1])) }],
			      [/^background-color:\s*(.+)/,function(output,match) { setAtt(output,'background_color',injectColors(match[1])) }],
			      [/^background:\s*(.+)/,function(output,match) { parseBackground(injectColors(match[1]),output) }],
			      [/^background-image:\s*(-webkit-)?([^-]+)-gradient\(([^)]+)/,function(output,match) { parseGradient(match[2],injectColors(match[3]),output) }],
		 ];
		var props = css.split(';');
		var unknown = '';
		for (var p=0;p<props.length;p++) {
			var prop = props[p].replace(/^\s*/, '').replace(/\s*$/, ''); // trim
			if (!prop) continue;
			var prop_parts = prop.split(':');
			var propName = ',' + prop_parts[0] + ',';
			var attName = prop_parts[0].replace(/-/,'_');
			if (ajaxart.css_dt.numericProps.indexOf(propName) != -1 || ajaxart.css_dt.tokenProps.indexOf(propName) != -1)
				setAtt(result,attName,prop_parts[1]);
			else {
				var found = false;
				for(var i=0;i<specialProps.length;i++)
				{
					try {
					var match = prop.match(specialProps[i][0]);
					if (match) { specialProps[i][1].call({},result,match); found = true; }
					} catch(e) {
					}
				}
				if (!found) 
					unknown += (unknown == '' ? '' : ';') + injectColors(prop);
			}
		}
		if (unknown) result.setAttribute('unknown',unknown);
		//result = result.replace(/^\s*/, '').replace(/\s*$/, '');
		return [result];
	},
	ParseCssBlock: function(profile,data,context)
	{
		// e.g. >div>div { width: 30px; height2:40px; } >div>div>div { width2: 40px } 
		// TBD: @-moz-document url-prefix() { >div>div { width: 30px; height2:40px; } >div>div>div { width2: 40px } }
		var block = aa_text(data,profile,'Block',context);
		var pattern = /([^\{]*)?\{([^}]*)\}/g;
		var result = ajaxart.parsexml('<Block/>');
		while (match = pattern.exec(block)) {
			var selector = match[1] ? match[1].replace(/^\s*/, '').replace(/\s*$/, '') : '##'; // ## as key for empty selector
			var rule = ajaxart.runNativeHelper([match[2]],profile,'ParseDeclaration',context)[0];
			var exiting_rule = aa_xpath(result,"Css[@selector='"+ selector +"']")[0];
			if (exiting_rule) { // adding and overriding existing rule
				for (var i=0; i<rule.attributes.length; i++) {
					var attr = rule.attributes.item(i).name;
					var curVal = exiting_rule.getAttribute(attr);
					if (attr == 'unknown' && curVal)
						exiting_rule.setAttribute(attr,rule.getAttribute(attr) + '; ' + curVal);
					else
						exiting_rule.setAttribute(attr,rule.getAttribute(attr));
				}
		   		for (var child = rule.firstChild; child != null; child=child.nextSibling)
		   			exiting_rule.appendChild(child.cloneNode(true));
			} else {
				rule.setAttribute('selector',selector);
				result.appendChild(rule);
			}
		}
		return [result];
	},
	WorkingElementToCss: function(profile,data,context)
	{
		var elem = aa_first(data,profile,'WorkingElement',context);
		if (!elem) return [''];

		if (elem.tagName == 'Block') {
			var result = '';
			var rules = aa_xpath(elem,'Css');
			for(var i=0;i<rules.length;i++) {
				var rule = rules[i];
				var selector = rule.getAttribute('selector') + ' ';
				if (selector == '## ') selector = '';
				result += selector + '{ ' + splitLines(processCssElem(rule),80-selector.length) + '}\n';
			}
			return [result];
		} else 
			return [processCssElem(elem)];

		function splitLines(css,maxLineSize) {
			var arr = css.split(';'), lineSize = 0, result = '';
			for(var i=0;i<arr.length;i++) {
				if (lineSize + arr[i].length > maxLineSize) {
					result += '\n  ';
					lineSize = 0;
				}
				lineSize += arr[i].length;
				if (arr[i]) result += arr[i] + '; ';
			}
			return result;
		}

		function processCssElem(elem) {
			function attVal(att) {
				return attElemVal(elem,att);
			} 
			function attElemVal(elem,att) {
				var val = elem.getAttribute(att); 
				if (!val || val == '0') return ' 0';
				val = val.replace(/^\s+/,'').replace(/\s+$/,''); // trim
				var units = ''; // in value
				if (val.match(/^[0-9]+$/)) units = 'px';
				var important = ((elem.getAttribute('important') || '').indexOf(',' + att+ ',') == -1) ? '' : ' !important'; 
					
				return ' ' + val + units + important;  
			} 
			function hasValue(elem,att) {
				return elem.getAttribute(att) && elem.getAttribute(att) != '0';
			}
			function isTrue(elem,att) {
				return elem.getAttribute(att) && elem.getAttribute(att) == 'true';
			}
			// Prepare atts
			elem.setAttribute('font_weight',elem.getAttribute('bold') == 'true' ? 'bold' : '');
			elem.setAttribute('font_style',elem.getAttribute('italic') == 'true' ? 'italic' : '');
			elem.setAttribute('text_decoration',elem.getAttribute('underline') == 'true' ? 'underline' : '');
			elem.setAttribute('white_space',elem.getAttribute('nowrap') == 'true' ? 'absolute' : '');
			//elem.setAttribute('overflow',elem.getAttribute('text_overflow') == 'ellipsis' ? 'hidden' : '');
			
			var result = '';

			var fields = (ajaxart.css_dt.tokenProps + 'white-space,color,background,background-color,font-weight,font-style,text-decoration,text-shadow,text-overflow,text-transform').split(',');
			for(var i=0;i<fields.length;i++) {
			  var fld = fields[i];
			  var key = fld.replace(/-/,'_');
			  if (elem.getAttribute(key) != null && elem.getAttribute(key) != '')
			    result += fld + ':' + elem.getAttribute(key)+ ';';
			}
			var numeric_fields = ajaxart.css_dt.numericProps.split(',');
			for(var i=0;i<numeric_fields.length;i++) {
			  var fld = numeric_fields[i];
			  var key = fld.replace(/-/,'_');
			  if (elem.getAttribute(key) != null && elem.getAttribute(key) != '')
			    result += fld + ':' + attVal(key)+ ';';
			}
			
			var all_border = aa_xpath(elem,"border[@side='']")[0];
			if (all_border)
				result += 'border:' + attElemVal(all_border,'size') + ' ' + all_border.getAttribute('style') + ' ' + all_border.getAttribute('color') + ';';
			var borders = aa_xpath(elem,"border[@side!='']");
			for(var i=0;i<borders.length;i++) {
			  var border = borders[i];
			  result += 'border-' + border.getAttribute('side') + ':' + attElemVal(border,'size') + ' ' + border.getAttribute('style') + ' ' + border.getAttribute('color') + ';';
			}
			var tshadows = aa_xpath(elem,"textshadow");
			var tresult = [];
			for(var i=0;i<tshadows.length;i++) {
			  var shadow = tshadows[i];
			  tresult.push( attElemVal(shadow,'x') + attElemVal(shadow,'y') + attElemVal(shadow,'blur') + ' ' + shadow.getAttribute('color'));
			}
			if (tresult.length > 0) result += 'text-shadow: ' + tresult.join(', ') + ';';
			
			var shadows = aa_xpath(elem,'shadow');
			var sresult = [];
			for(var i=0;i<shadows.length;i++) {
			  var shadow_elem = shadows[i];
			  sresult.push( (isTrue(shadow_elem,'shadow_inset') ? ' inset' : '') + attElemVal(shadow_elem,'shadow_x')  + attElemVal(shadow_elem,'shadow_y') + 
				  attElemVal(shadow_elem,'shadow_blur') + attElemVal(shadow_elem,'shadow_spread') + ' ' + shadow_elem.getAttribute('shadow_color'));
			}
			if (sresult.length > 0) result += 'box-shadow: ' + sresult.join(', ') + ';';

			var grads = aa_xpath(elem,'grad');
			var gresult = [];
			for(var i=0;i<grads.length;i++) {
			  var grad = grads[i];
			  gresult.push( grad.getAttribute('color') + ' ' + grad.getAttribute('pos').match(/^([0-9]*)/)[1] + '% ');
			}
			var dir = elem.getAttribute('gradientDir');
			if (elem.getAttribute('gradientType') == 'radial')
				dir = 'ellipse cover'; 
			else if (!isNaN(parseFloat(dir))) 
				dir += 'deg';
			if (gresult.length > 0) result += 'background-image: -webkit-'+ elem.getAttribute('gradientType') + '-gradient(' + 
				dir + ', ' + gresult.join(', ') + ');';

			if (hasValue(elem,'unknown')) result += elem.getAttribute('unknown') + ';';
			return result.replace(/^\s*/, '').replace(/\s*$/, '');
		}
	},
	RefreshPaddingAndMarginFields: function(profile,data,context)
	{
		var field = context.vars._Field[0];
		aa_field_handler(field,'OnUpdate', function(field,field_data) {
			var id = field.Id;
			var type = id.split('_')[0]; // margin_xx -> margin
			var side = id.split('_')[1]; // padding_left -> left

			var parentData = aa_xpath(field_data[0],'..')[0];
			var val = ajaxart.totext_array(field_data);

			var mode = parentData.getAttribute(type+'_mode');
			var sides = [];
			if (mode == 'same')
				sides = ['top','right','bottom','left'];
			if (mode == 'xy') {
				if (side == 'top' || side == 'bottom') sides = ['top','bottom'];
				if (side == 'left' || side == 'right') sides = ['left','right'];
			}
			for(var i=0;i<sides.length;i++) {
				if (sides[i] == side) continue;
				var field_id = type+'_'+sides[i];
				parentData.setAttribute(field_id,val);
				aa_refresh_field([field_id],'screen',false,null,context);
			}
			aa_refresh_field(['Result'],'screen',false,null,context);
		});
	},
	RelatedColors: function(profile,data,context)
	{
		var c = aa_text(data,profile,'Color',context);
		c = c.replace(/^\#/,'');
		var name = aa_text(data,profile,'ColorName',context);
		var hsv = rgbToHsv(parseInt(c.substring(0,2),16),parseInt(c.substring(2,4),16),parseInt(c.substring(4,6),16));
		var cur = Math.floor(hsv[2]*100);

		var result = [];
		for (var i=100;i>=0;) {
			var color = {
				isObject: true,
				color: '#' + hsvToRgbHex(hsv[0],hsv[1],i/100)
			}
			if (cur == i) color = { 
				isObject: true, 
				current: 'true',
				color: '#' + c,
				name: name
			}
			result.push(color);
			var delta = Math.max(1,Math.floor(Math.abs(cur-i)/6));
			i-=delta;
		}
		return result;
	}
});

function rgbToHsv(r, g, b){
    r = r/255, g = g/255, b = b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}
function hsvToRgbHex(h, s, v){
	function toHex(i) {
		if (i<16)
			return '0'+ i.toString(16).toUpperCase();
		return i.toString(16).toUpperCase();
	}
	var rgb = hsvToRgb(h, s, v);
	return '' + toHex(Math.floor(rgb[0])) + toHex(Math.floor(rgb[1])) + toHex(Math.floor(rgb[2])); 
}
function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}


aa_gcs("css_dt", {
Sequence: function (profile,data,context) {
	var props = ajaxart.runsubprofiles(data,profile,'Property',context);
	var rule = {
			parseBegin: function(css_elem,prop_prefix,text) {
				var remaining = text;
				for(var i=0;i<props.length;i++) {
					remaining = props[i].parseBegin(css_elem,prop_prefix,remaining.replace(/^\s*/, ''));
					if (!remaining) break;
				}
				return remaining;
			},
			serialize: function(css_elem,prop_prefix) {
				var css_result = '';
				for(var i=0;i<props.length;i++) 
					css_result += (css_result == '' ? '' : ' ') + props[i].serialize(css_elem,prop_prefix);
				return css_result;
			}
		}
		return [rule];
},
Compound: function (profile,data,context) {
	var rule = {
			registerHandlers: function(parsers,serializers) {
				var prop = aa_text(data,profile,'Prop',context);
				var group = aa_first(data,profile,'Group',context);
				var tag = aa_text(data,profile,'Tag',context);
				var key = aa_text(data,profile,'Key',context);
				var value = aa_text(data,profile,'Value',context);

				parsers[prop] = function(css_elem,name,value) {
					var elem = ajaxart.parsexml('<' + tag + '/>');
					if (key) elem.setAttribute(key,value);
					remaining = group.parseBegin(elem,prop,value);
					if (!remaining || remaining.match(/^\s*$/)) { 
						css_elem.appendChild(elem);
						return true;
					}
				}
				serializers[prop] = function(css_elem,prop) {
					var css_result = '';
					var elems = aa_xpath(css_elem,tag + '[@'+key+'='+value+']'); // may be multiple
					for(var i=0;i<elems.length;i++)
						css_result += (css_result == '' ? '' : '; ') + group.serialize(elems[i],prop);
					return css_result;
				}
			}
		}
		return [rule];
},
FunctionValue: function (profile,data,context) {
	var rule = {
			registerHandlers: function(parsers,serializers) {
				var prop = aa_text(data,profile,'Prop',context);
				var group = aa_first(data,profile,'Group',context);
				var tag = aa_text(data,profile,'Tag',context);
				var key = aa_text(data,profile,'Key',context);
				var value = aa_text(data,profile,'Value',context);

				parsers[prop] = function(css_elem,name,value) {
					var elem = ajaxart.parsexml('<' + tag + '/>');
					if (key) elem.setAttribute(key,value);
					remaining = group.parseBegin(elem,prop,value);
					if (!remaining || remaining.match(/^\s*$/)) { 
						css_elem.appendChild(elem);
						return true;
					}
				}
				serializers[prop] = function(css_elem,prop) {
					var css_result = '';
					var elems = aa_xpath(css_elem,tag + '[@'+key+'='+value+']'); // may be multiple
					for(var i=0;i<elems.length;i++)
						css_result += (css_result == '' ? '' : '; ') + group.serialize(elems[i],prop);
					return css_result;
				}
			}
		}
		return [rule];
},
RepeatingValue: function (profile,data,context) {
	var prop = aa_text(data,profile,'Prop',context);
	var tag = aa_text(data,profile,'Tag',context);
	var group = aa_first(data,profile,'Group',context);
	var rule = {
			registerHandlers: function(parsers,serializers) {

				parsers[prop] = function(css_elem,name,value) {
					var remaining = value;
					while (remaining) {
						var elem = ajaxart.parsexml('<' + tag + '/>');
						var res = group.parseBegin(elem,prop,remaining.replace(/^\s*/, ''));
						if (res.length == remaining.length) { 
							console.log('css parser: can not parse ' + remaining); return false;
						}
						css_elem.appendChild(elem);
						remaining = res;
						if (!remaining) 
							return true; // success - no more parts
						if (!remaining.match(/^,/)) return false; // no separator
						remaining = remaining.replace(/^,\s*/, ''); // remove separator, and continue
					}
					return true;
				}
				serializers[prop] = function(css_elem,prop) {
					var css_result = '';
					var elems = aa_xpath(css_elem,tag);
					for(var i=0;i<elems.length;i++)
							css_result += (css_result == '' ? '' : ', ') + group.serialize(elems[i],prop);
					return css_result;
				}
			}
		}
		return [rule];
},
InnerProp: function (profile,data,context) {
	var name = aa_text(data,profile,'Name',context);
	var type = aa_first(data,profile,'Type',context);
	var optional = aa_bool(data,profile,'Optional',context);
	var rule = {
			parseBegin: function(text) {
				var result = type.parseBegin(css_elem,prop_prefix + '-' + name,text);
				if (result == null && optional) 
					return text;
				return result;
			},
			serialize: function(css_elem,prop_prefix) {
				var prop = prop_prefix + '-' + name;
				if (type.serialize)
					return type.serialize(css_elem,prop);
				else {
					var val = css_elem.getAttribute(prop.replace(/-/g,'_')); 
					var important = ((css_elem.getAttribute('important') || '').indexOf(',' + prop+ ',') == -1) ? '' : ' !important'; 
					return prop.replace(/_/g,'-') + ':' + ' ' + val + important;
				}
			}
		}
		return [rule];
},

// basic types
Length: function (profile,data,context) {
	var regex = new RegExp('^\s*'+aa_text(data,profile,'Regex',context));
	var enums = ',' + aa_text(data,profile,'Enum',context) + ',';
	var prefix = aa_text(data,profile,'Prefix',context);
	return[ {
			parseBegin: function(text) {
				if (prefix) {
					if (text.indexOf(prefix) != 0) return;
					text = text.substring(prefix.length);
				}

				var token_match = text.match(/^[a-z\-]+/);
				if (token_match && token_match[0])
					if (enums.indexOf(',' + token_match[0] + ',') == 0) 
						return token_match[0];

				var match = text.match(regex); // /^(\s*[-]?[0-9]+[a-z]*)/);
				if (match && match[1])
					return text.substring(0,prefix.length + match[1].length);
			},
			serialize: function(sElem,prop) {
				var val = sElem.getAttribute(prop.replace(/-/g,'_')); 
				if (!val || val == '0') 
					return prop + ':' + ' 0';
				val = val.replace(/^\s+/,'').replace(/\s+$/,''); // trim
				var units = ''; // in value
				if (val.match(/^[0-9]+$/)) units = 'px';
				var css_elem = elem.parentNode;
				var important = ((css_elem.getAttribute('important') || '').indexOf(',' + prop+ ',') == -1) ? '' : ' !important'; 
				return prop + ':' + ' ' + val + units + important;
			}
		}]
},
Or: function (profile,data,context) {
	var options = ajaxart.runsubprofiles(data,profile,'Type',context);
	return[ {
			parseBegin: function(text) {
				for(var i=0;i<options.length;i++) {
					var result = options[i].parseBegin(text);
					if (result) 
						return result;
				}
			}
	}]
},
Enum: function (profile,data,context) {
	var options = ',' + aa_text(data,profile,'Options',context) + ',';
	return[ {
		parseBegin: function(text) {
				var match = text.match(/^\s*([a-zA-Z0-9_]+)/);
				if (match && options.indexOf(',' + match[1] + ',') != -1)
					return match[0];
		}
	}]
},
ByRegex: function (profile,data,context) {
	var regex = new RegExp('^\s*'+aa_text(data,profile,'Regex',context));
	return [{
		parseBegin: function(text) {
			var match = text.match(regex);
			if (match && match[0])
				return match[0];
		}
	}];
},
SimplifyToBoolean: function (profile,data,context) {
	var rule = {
		registerHandlers: function(parsers,serializers) {
			var prop = aa_text(data,profile,'Prop',context);
			var value = aa_text(data,profile,'Value',context);
			var feature = aa_text(data,profile,'Feature',context);
			parsers.push(function(css_elem,simplifiers) {
				var sElem = ajaxart.parsexml('<' + feature + '/>');
				var val = aa_xpath(css_elem,"P[@name='" + prop + "']/@value")[0];
				val = val && val.nodeValue;
				if (val && val != value)
					sElem.setAttribute('error','Can not simplify to boolean value: ' + val);
				else
					sElem.setAttribute('value',(val == value) ? 'true' : 'false');
				simplifiers.appendChild(sElem);
			});
			serializers.push(function(css_elem,simplifiers) {
				var sElem = aa_xpath(simplifiers,feature)[0];
				if (sElem.getAttribute('error')) return;
				var existing = aa_xpath(css_elem,"P[@name='" + prop + "']")[0];
				var css_value = sElem.getAttribute('value') == 'true' ? value : '';
				if (css_value && existing)
					existing.setAttribute('value',css_value);
				else if (css_value && !existing) {
					var pElem = ajaxart.parsexml('<P name="' + prop + '"/>');
					pElem.setAttribute('value',css_value);
					css_elem.appendChild(pElem);
				} else if (!css_value && existing)
					css_elem.removeChild(existing);
			});
		}
	}
	return [rule];
},
Props: function (profile,data,context) {
	var type = aa_first(data,profile,'Type',context);
	var props = aa_text(data,profile,'Props',context).split(',');
	var rule = {
		registerHandlers: function(parsers,serializers) {
			parsers.push(function(css_elem,simplifiers) {
				for (var i = 0; i < props.length; i++) {
					var prop = props[i];
					var feature = prop.replace(/-/g,'_');
					var sElem = ajaxart.parsexml('<' + feature + '/>');
					if (!aa_xpath(simplifiers,feature)[0])
						simplifiers.appendChild(sElem);
					if (!aa_xpath(css_elem,"P[@name='" + prop + "']")[0]) return;
					var text = aa_xpath(css_elem,"P[@name='" + prop + "']/@value")[0];
					text = text && text.nodeValue;

					var value = type.parseBegin(text);
					if (!value || text != value)
						sElem.setAttribute('error',"Unrecognized value '" + value + "' in " + prop);
					else
						sElem.setAttribute('value',value);
				}
			});
			serializers.push(function(css_elem,simplifiers) {
				for (var i = 0; i < props.length; i++) {
					var prop = props[i];
					var feature = prop.replace(/-/g,'_');
					var sElem = aa_xpath(simplifiers,feature)[0];
					if (!sElem || sElem.getAttribute('error')) return;
					var existing = aa_xpath(css_elem,"P[@name='" + prop + "']")[0];
					var css_value = sElem.getAttribute('value');
					if (css_value && existing)
						existing.setAttribute('value',css_value);
					else if (css_value && !existing) {
						var pElem = ajaxart.parsexml('<P name="' + prop + '"/>');
						pElem.setAttribute('value',css_value);
						css_elem.appendChild(pElem);
					} else if (!css_value && existing)
						css_elem.removeChild(existing);
				}
			});
		}
	}
	return [rule];
},
Prop: function (profile,data,context) {
	var rule = {
		registerHandlers: function(parsers,serializers) {
			var prop = aa_text(data,profile,'Prop',context);
			var type = aa_first(data,profile,'Type',context);
			var feature = aa_text(data,profile,'Feature',context);
			parsers.push(function(css_elem,simplifiers) {
				var sElem = ajaxart.parsexml('<' + feature + '/>');
				if (!aa_xpath(simplifiers,feature)[0])
					simplifiers.appendChild(sElem);
				if (!aa_xpath(css_elem,"P[@name='" + prop + "']")[0]) return;
				var text = aa_xpath(css_elem,"P[@name='" + prop + "']/@value")[0];
				text = text && text.nodeValue;
				var value = type.parseBegin(text);
				if (!value || text != value) 
					sElem.setAttribute('error',"Unrecognized value '" + value + "' in " + prop);
				else
					sElem.setAttribute('value',value);
			});
			serializers.push(function(css_elem,simplifiers) {
				var sElem = aa_xpath(simplifiers,feature)[0];
				if (!sElem || sElem.getAttribute('error')) return;
				var existing = aa_xpath(css_elem,"P[@name='" + prop + "']")[0];
				var css_value = sElem.getAttribute('value');
				if (css_value && existing)
					existing.setAttribute('value',css_value);
				else if (css_value && !existing) {
					var pElem = ajaxart.parsexml('<P name="' + prop + '"/>');
					pElem.setAttribute('value',css_value);
					css_elem.appendChild(pElem);
				} else if (!css_value && existing)
					css_elem.removeChild(existing);
			});
		}
	}
	return [rule];
},
ExtractSequence: function (profile,data,context) {
	var prop = aa_text(data,profile,'Prop',context);
	var feature = prop.replace(/-/g,'_');
	var elems = ajaxart.runsubprofiles(data,profile,'Elem',context);
	var rule = {
		registerHandlers: function(parsers,serializers) {
			var sElems = [];
			parsers.push(function(css_elem, simplifiers) {
				var propElem = aa_xpath(css_elem,"P[@name='" + prop + "']/@value")[0];
				var remaining = propElem ? propElem.nodeValue : '';
				for (var i = 0; i < elems.length; i++) {
					remaining = remaining.match(/[ ]*(.*)/)[1];
					var result = elems[i].calcSimplifiers(remaining,simplifiers);
					remaining = remaining.substring(result.value ? result.value.length : 0);
					if (result.sElem) sElems.push(result.sElem);
				};
				remaining = remaining.match(/[ ]*(.*)/)[1];
				if (!remaining) { // if sequence was undserstood accept all simplifiers
					for (var i = 0; i < sElems.length; i++)
						simplifiers.appendChild(sElems[i]);
				} else { // else add error
					var sElem = ajaxart.parsexml('<' + feature + '/>');
					sElem.setAttribute('error','Can not parse Sequence ' + propElem.nodeValue + ' of ' + prop);
					simplifiers.appendChild(sElem);
				}
			});
			serializers.push(function(css_elem,simplifiers) {
				var error = aa_xpath(simplifiers,feature + '/@error')[0];
				if (!error) { // replace the parsed sequence with the original css property
					for (var i = 0; i < elems.length; i++) 
						elems[i].serialize(css_elem,simplifiers);
					var existing = aa_xpath(css_elem,"P[@name='" + prop + "']")[0];
					if (existing) css_elem.removeChild(existing);
				};
			});
		}
	}
	return [rule];
},
SequenceElem: function (profile,data,context) {
	var type = aa_first(data,profile,'Type',context);
	var feature = aa_text(data,profile,'Feature',context);
	var prop = aa_text(data,profile,'Prop',context);
	var optional = aa_bool(data,profile,'Optional',context);
	return [ {
		calcSimplifiers: function(text, simplifiers) {
			var existing = aa_xpath(simplifiers,feature)[0];
			var sElem = existing || ajaxart.parsexml('<' + feature + '/>');
			var value = type.parseBegin(text);
			if (value) {
				if (sElem.getAttribute('value'))
					sElem.setAttribute('error','Duplicate value: ' + value + ' in ' + prop);
				else if (!optional && !value)
					sElem.setAttribute('error','Unrecognized value ' + text + ' in ' + prop);
				else
					sElem.setAttribute('value',value || '');
			}
			return { value: value, sElem: existing ? null : sElem }
		},
		serialize: function(css_elem,simplifiers) {
				var sElem = aa_xpath(simplifiers,feature)[0];
				if (!sElem || sElem.getAttribute('error')) return;
				var existing = aa_xpath(css_elem,"P[@name='" + prop + "']")[0];
				var css_value = sElem.getAttribute('value');
				if (css_value && existing)
					existing.setAttribute('value',css_value);
				else if (css_value && !existing) {
					var pElem = ajaxart.parsexml('<P name="' + prop + '"/>');
					pElem.setAttribute('value',css_value);
					css_elem.appendChild(pElem);
				} else if (!css_value && existing)
					css_elem.removeChild(existing);
		}
	}]
},
ExpandDirections: function (profile,data,context) {
	var type = aa_first(data,profile,'Type',context);
	var edges = ['top','right','bottom','left'];
	var corners = ['top-left','top-right','bottom-left','bottom-right'];
	var prop = aa_text(data,profile,'Prop',context);
	var expand_key = aa_text(data,profile,'Expand',context);
	var expand = [];
	if (expand_key.indexOf('Edges') != -1) expand = expand.concat(edges);
	if (expand_key.indexOf('Coreners') != -1) expand = expand.concat(corners);
	var rule = {
		registerHandlers: function(parsers,serializers) {
			parsers.push(function(css_elem,simplifiers) {
				if (expand_key.indexOf('Edges') == -1) return; // TODO: support Corners
				var sElem = ajaxart.parsexml('<' + prop + '/>');
				simplifiers.appendChild(sElem);

				function setAtts(atts,text,propName) {
					for(var i=0;i<atts.length;i++) {
						var attName = atts[i];
						if (sElem.getAttribute(attName))
							sElem.setAttribute('error','Ambiguous ' + prop + '-' + attName + ': ' + sElem.getAttribute(attName) + ' versus ' + text);	

						var value = type.parseBegin(text);
						if (!value || text != value)
							sElem.setAttribute('error','Unrecognized value ' + text + ' in ' + propName || attName);
						else
							sElem.setAttribute(attName,value);
					}
				}

				var props = aa_xpath(css_elem,'P');
				for(var i=0;i<props.length;i++) {
					var name = props[i].getAttribute('name');
					if (name.indexOf(prop) != 0) continue;
					var value = props[i].getAttribute('value');

					// separated
					if (name.indexOf('-') != -1) {
						var dir = name.split('-').pop();
						setAtts([dir],value,name);
						continue;
					}
					// unified
					var match = value.match(/^([^\s]+)$/);
					if (match) {
						setAtts(edges,match[1],name);
						continue;
					}
					match = value.match(/^([^\s]+)\s+([^\s]+)$/);
					if (match) {
						setAtts(['top','bottom'],match[1],name);setAtts(['left','right'],match[2],name);
						continue;
					}
					match = value.match(/^([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)$/);
					if (match) {
						setAtts(['top'],match[1],name);setAtts(['right'],match[2],name);setAtts(['bottom'],match[3],name);setAtts(['left'],match[4],name);
						continue;
					}
				}
			});
			serializers.push(function(css_elem,simplifiers) {
				var sElem = aa_xpath(simplifiers,prop)[0];
				if (sElem.getAttribute('error')) return;
				var all_values_filled = true;
				for (var i = 0; i < expand.length; i++)
					if (!sElem.getAttribute(expand[i])) all_values_filled = false;
				
				// unify same 4
				var val = sElem.getAttribute(expand[0]);
				var unified = false;
				if (val && val == sElem.getAttribute(expand[1]) && val == sElem.getAttribute(expand[2]) && val == sElem.getAttribute(expand[3]))
					unified = true;
				// unify same 2-2
				else if (val && sElem.getAttribute(expand[1]) && val == sElem.getAttribute(expand[2]) && sElem.getAttribute(expand[1]) == sElem.getAttribute(expand[3])) {
					unified = true;
					val = sElem.getAttribute(expand[0]) + ' ' + sElem.getAttribute(expand[1]);
				}

				if (unified) {
					var existing = aa_xpath(css_elem,"P[@name='" + prop + "']")[0];
					if (existing) 
						existing.setAttribute('value',val);
					else
						css_elem.appendChild(ajaxart.parsexml('<P name="' + prop + '" value="' + val + '"/>'));
					// delete specific nodes
					for (var i = 0; i < expand.length; i++) {
						var to_delete = aa_xpath(css_elem,"P[@name='" + prop + '-' + expand[i] + "']");
						for (var j = 0; j < to_delete.length; j++)
							css_elem.removeChild(to_delete[j]);
					}
				} else {
					for (var i = 0; i < expand.length; i++) {
						var p = prop + '-' + expand[i], att = expand[i].replace(/-/g,'_');
						if (!sElem.getAttribute(att)) continue;
						var existing = aa_xpath(css_elem,"P[@name='" + p + "']")[0];
						if (existing) 
							existing.setAttribute('value',sElem.getAttribute(att))
						else
							css_elem.appendChild(ajaxart.parsexml('<P name="' + p + '" value="' + sElem.getAttribute(att) + '"/>'));
					}
				}
				return '';
			});
		}
	}
	return [rule];
},
CssXmlMapper: function (profile,data,context) {
	return [{
		parsers: [],
		serializers: [],
		init: function() {
			var rules = ajaxart.runsubprofiles(data,profile,'Rule',context);
			for(var i=0;i<rules.length;i++)
				rules[i].registerHandlers(this.parsers,this.serializers);
		},
		parse: function(css,css_elem) {
			var simplifiers = aa_xpath(css_elem,'!Simplifiers')[0];
			var props = css.split(';');
			var unknown = '';
			for (var p=0;p<props.length;p++) {
				var prop = props[p].replace(/^\s*/, '').replace(/\s*$/, ''); // trim
				if (!prop) continue;
				var prop_parts = prop.split(':');
				var name = prop_parts[0];
				var val = prop_parts[1];
				var prop_elem = ajaxart.parsexml('<P/>');
				css_elem.appendChild(prop_elem);
				var important = val.indexOf('!important');
				if (important != -1) {
					prop_elem.setAttribute('important','true');
					val = val.substr(0,important);
				}
				val = val.replace(/^\s*/, '').replace(/\s*$/, '');
				prop_elem.setAttribute('name',name);
				prop_elem.setAttribute('value',val);
			}
			for (var i = 0; i < this.parsers.length; i++)
				this.parsers[i](css_elem,simplifiers);
		},
		serialize: function(css_elem) {
			var simplifiers = aa_xpath(css_elem,'Simplifiers')[0];
			var css_result = '';
			for (var i = 0; i < this.serializers.length; i++)
				this.serializers[i](css_elem,simplifiers);

			var props = aa_xpath(css_elem,'P');
			for (var i=0; i<props.length; i++)
				css_result += (css_result == '' ? '' : ';') + props[i].getAttribute('name') + ': ' + props[i].getAttribute('value');
	   		return css_result;
		}
	}];
},
	Css2Xml: function(profile,data,context)
	{
		// e.g. >div>div { width: 30px; height2:40px; } >div>div>div { width2: 40px } 
		// TBD: @-moz-document url-prefix() { >div>div { width: 30px; height2:40px; } >div>div>div { width2: 40px } }
		var mapper =  aa_first(data,profile,'Mapper',context);
		mapper.init();
		var block = aa_text(data,profile,'Css',context);
		var result = ajaxart.parsexml('<Block/>');
		var pattern = /([^\{]*)?\{([^}]*)\}/g;
		while (match = pattern.exec(block)) {
			var selector = match[1] ? match[1].replace(/^\s*/, '').replace(/\s*$/, '') : '#this';
			var rule = aa_xpath(result,"Css[@selector='"+ selector +"']")[0];
			if (!rule) {
				rule = ajaxart.parsexml('<Css/>');
				rule.setAttribute('selector',selector);
				result.appendChild(rule);
			}
			mapper.parse(match[2],rule);
		}
		return [result];
	},
	Xml2Css: function(profile,data,context)
	{
		var elem = aa_first(data,profile,'Xml',context);
		if (!elem) return [''];
		elem = elem.cloneNode(true);
		var LineSize = aa_int(data,profile,'LineSize',context);
		var mapper =  aa_first(data,profile,'Mapper',context);
		mapper.init();
		var result = '';

		var rules = aa_xpath(elem,'Css');
		for(var i=0;i<rules.length;i++) {
				var rule = rules[i];
				var selector = rule.getAttribute('selector') + ' ';
				if (selector == '## ') selector = '';
				result += selector + '{ ' + splitLines(mapper.serialize(rule),LineSize-selector.length) + '}\n';
		}
		return [result];

		function splitLines(css,maxLineSize) {
			var arr = css.split(';'), lineSize = 0, fixed = '';
			for(var i=0;i<arr.length;i++) {
				if (lineSize + arr[i].length > maxLineSize) {
					fixed += '\n  ';
					lineSize = 0;
				}
				lineSize += arr[i].length;
				if (arr[i]) fixed += arr[i] + '; ';
			}
			return fixed;
		}
	}
});
var aa_studio_edit_mode = {
	active:false,
	init: function() {
		this.currentMoving = null;
		this.prevMouseDown = window.onmousedown;
		this.prevMouseUp = window.onmouseup;
		this.prevMouseMove = window.onmousemove;
		this.prevKeyDown = window.onkeydown;
		this.prevMouseWheel = window.onmousewheel;
		this.active = true;
		jBart.studiobar.showObjectElements(null);	// clear selected markings of preview-mode

		var cover = jQuery('<div id="jbstudio_edit_cover"></div>"');
		cover.appendTo(".jb_WidgetInStudio_wrapper");

		window.onmousedown = function(e) {
			var mouseX = e.clientX, mouseY = e.clientY;
			cover.hide();
			var element = document.elementFromPoint(mouseX, mouseY);
			cover.show();
			if ($(element).hasClass('jbstudio_selected_mark')) { // Start moving
				var elem = element.jbBasedOn;
				aa_studio_edit_mode.currentMoving = { obj: jBart.studiobar.object, selectedElem: elem, mouseXOnStart: mouseX, mouseYOnStart: mouseY,
					marginLeftOnStart: parseInt(window.getComputedStyle(elem).getPropertyValue("margin-left").split("px")[0]) || 0,
					marginTopOnStart: parseInt(window.getComputedStyle(elem).getPropertyValue("margin-top").split("px")[0]) || 0,
					offsetLeftOnStart: elem.offsetLeft, offsetTopOnStart: elem.offsetTop, startTime: new Date().getTime() };
				aa_studio_edit_mode.showCross(elem);
				aa_studio_edit_mode.focusOnMarks();
				aa_studio_edit_mode.prepareReplacingWithUpperFields(elem);
				return aa_stop_prop(e);
			}
			// current_moving = null;
			var in_widget_popup = jQuery(element).parents(".aa_popup,.aa_dlg").length>0 && !jQuery(element).parents(".aa_popup,.aa_dlg").hasClass('jbstudio_dlg');
			if (jQuery(element).parents(".jb_WidgetInStudio_wrapper").length == 0 && !in_widget_popup) return;	// Not in widget zone
			bartdt_capture_level = 'application';
			jBart.studiobar.object = jBart.studiobar.objectFromElement(element);
			if (jBart.studiobar.object)
				aa_studio_edit_mode.showSelectedMarks(true,true);
			else
				aa_studio_edit_mode.clearSelectedMarks();
			return aa_stop_prop(e);
		};
		window.onmouseup = function(e) {
			aa_studio_edit_mode.selecting = false;
			if ($('#jbstudio_field_to_replace_with').length)
				return aa_studio_edit_mode.replaceFields();
			if (aa_studio_edit_mode.currentMoving) {
				var xDiff = e.clientX - aa_studio_edit_mode.currentMoving.mouseXOnStart + aa_studio_edit_mode.currentMoving.marginLeftOnStart;
				var yDiff = e.clientY - aa_studio_edit_mode.currentMoving.mouseYOnStart + aa_studio_edit_mode.currentMoving.marginTopOnStart;
				if (xDiff != aa_studio_edit_mode.currentMoving.marginLeftOnStart || yDiff != aa_studio_edit_mode.currentMoving.marginTopOnStart) {
					aa_run_component("field_dt.ApplyDragChangesOnField",[],jBart.studiobar.context,{ FieldXtml: [ aa_studio_edit_mode.currentMoving.obj.Xtml ], 
						MarginLeft: [ xDiff + "px" ], MarginTop: [ yDiff + "px" ], ApplyMarginsOnThis: [ aa_studio_edit_mode.ApplyMarginsOnThis ] });
					if (jBart.studiobar.object.Refresh) {
						jBart.studiobar.object.Refresh([],jBart.studiobar.context);
						aa_studio_edit_mode.showSelectedMarks(false);
						aa_studio_edit_mode.focusOnMarks();
					}					
				}
				aa_studio_edit_mode.currentMoving = null;
				aa_studio_edit_mode.hideCross();
			}
		};
		window.onmousemove = function(e) {
			if (aa_studio_edit_mode.currentMoving) {
				if (new Date().getTime() - aa_studio_edit_mode.currentMoving < 400) return;	// too short time, maybe just a simple click
				var xDiff = e.clientX - aa_studio_edit_mode.currentMoving.mouseXOnStart;
				var yDiff = e.clientY - aa_studio_edit_mode.currentMoving.mouseYOnStart;
				aa_studio_edit_mode.elemsToMove.css("margin-left",xDiff + aa_studio_edit_mode.currentMoving.marginLeftOnStart + "px");
				aa_studio_edit_mode.elemsToMove.css("margin-top",yDiff + aa_studio_edit_mode.currentMoving.marginTopOnStart + "px");
				// jQuery(".jbstudio_constant_selected_box").children()
					// .css("margin-left", this.currentMoving.elem.offsetLeft - this.currentMoving.offsetLeftOnStart + "px")
					// .css("margin-top", this.currentMoving.elem.offsetTop - this.currentMoving.offsetTopOnStart + "px");
				// this.currentMoving.elem.style.webkitTransform = 'translate3d(' + xDiff + 'px,' + yDiff + 'px,0)';
				// update marks position
				$(".jbstudio_selected_mark").each(function(i,mark) {
					var elem = mark.jbBasedOn;
					$(mark).width($(elem).outerWidth()).height($(elem).outerHeight()).css("left",aa_absLeft(elem)+"px").css("top",aa_absTop(elem) + "px");
				});
				aa_studio_edit_mode.testGoingOverUpperField(e);
			}
		};
		window.onkeydown = function(e) {
			if (e.keyCode == 27) {	// ESC - cancel current selected
				$(".jbstudio_selected_mark").remove();
				aa_studio_edit_mode.currentMoving = null;
				if (aa_studio_edit_mode.currentMoving) {
					aa_studio_edit_mode.elemsToMove.css("margin-left",aa_studio_edit_mode.currentMoving.marginLeftOnStart + "px");
					aa_studio_edit_mode.elemsToMove.css("margin-top",aa_studio_edit_mode.currentMoving.marginTopOnStart + "px");
				}
			}
			if (e.keyCode >= 37 && e.keyCode <= 40 && $(document.activeElement).hasClass('jbstudio_selected_mark') && jBart.studiobar.object) {
				var first_elem = $(".jbstudio_selected_mark")[0].jbBasedOn;
				var margin_left = parseInt(window.getComputedStyle(first_elem).getPropertyValue("margin-left").split("px")[0]) || 0;
				var margin_top = parseInt(window.getComputedStyle(first_elem).getPropertyValue("margin-top").split("px")[0]) || 0;
				if (e.keyCode == 37) margin_left--;	// LEFT
				if (e.keyCode == 38) margin_top--;	// UP
				if (e.keyCode == 39) margin_left++;	// RIGHT
				if (e.keyCode == 40) margin_top++;	// DOWN
				aa_studio_edit_mode.elemsToMove.css("margin-left",margin_left + "px");
				aa_studio_edit_mode.elemsToMove.css("margin-top",margin_top + "px");
				$(".jbstudio_selected_mark").each(function(i,mark) {
					var elem = mark.jbBasedOn;
					$(mark).width($(elem).outerWidth()).height($(elem).outerHeight()).css("left",aa_absLeft(elem)+"px").css("top",aa_absTop(elem) + "px");
				});
				aa_run_component("field_dt.ApplyDragChangesOnField",[],jBart.studiobar.context,{ FieldXtml: [ jBart.studiobar.object.Xtml ], 
					MarginLeft: [ margin_left + "px" ], MarginTop: [ margin_top + "px" ], ApplyMarginsOnThis: [ aa_studio_edit_mode.ApplyMarginsOnThis ] });
				return aa_stop_prop(e);
			}
			if (e.ctrlKey && $('#jbstudio_field_to_replace_with').length) {	// when ctrl key is down, we don't suggest replacing fields
				$('#jbstudio_field_to_replace_with').remove();
				$('#jbstudio_text_of_field_to_replace').remove();				
			}
		}
		window.onmousewheel = function(e) {
			var mouseX = e.clientX, mouseY = e.clientY;
		    var delta = 0;
		    if (!event) event = window.event; /* For IE. */
		    if (event.wheelDelta)  delta = event.wheelDelta/120; /* IE/Opera. */
		    else if (event.detail) delta = -event.detail/3;
		    if (delta > 0) {
				var element = document.elementFromPoint(mouseX, mouseY);
				if ($(element).hasClass('jbstudio_selected_mark')) {
					var parent = element.jbBasedOn.parentNode;
					if (aa_studio_edit_mode.movingElemsAndNotWrappers) parent = parent.parentNode;	// using parent of wrapper, and not wrapper
					var obj = jBart.studiobar.objectFromElement(parent);
					if (obj) {
						jBart.studiobar.object = obj;
						aa_studio_edit_mode.showSelectedMarks(true,true);
					}
					return aa_stop_prop(e);
				}
		    }
		}
		// window.onclick = function(e) {
		// 	var element = document.elementFromPoint(e.clientX, e.clientY);
		// 	if (jQuery(element).parents(".runtime").length == 0) return;	// Not in widget zone
		// 	return aa_stop_prop(e);
		// }
	},
	exit: function() {
		window.onmouseup = this.prevMouseUp;
		window.onmousedown = this.prevMouseDown;
		window.onmousemove = this.prevMouseMove;
		window.onkeydown = this.prevKeyDown;
		window.onmousewheel = this.prevMouseWheel;
		$('#jbstudio_edit_cover').remove();
		$(".jbstudio_selected_mark").remove();
		this.elemsToMove = this.elems = this.wrappers = $([]);
		// jQuery(".jbstudio_constant_selected_box").hide();
		jQuery(".jbstudio_selected_obj").removeClass("jbstudio_selected_obj");
		this.active = false;
	},
	showSelectedMarks: function(update_properties_and_tree,focus) {
		if (!jBart.studiobar.object || !jBart.studiobar.object.Xtml) return;
		$(".jbstudio_selected_mark").remove();
		var elems_from_xtml = jBart.studiobar.ElementsFromXtml(jBart.studiobar.object.Xtml);
		jBart.studiobar.object.Elements = elems_from_xtml.length ? elems_from_xtml : jBart.studiobar.object.Elements;	// sometimes ElementsFromXtml dosent work (e.g when having no id)
		var wrappers = [];
		$(jBart.studiobar.object.Elements).each( function(i,elem) {	wrappers.push(aa_wrapper(elem)); } );
		if (wrappers[0].tagName.toUpperCase() != 'TD') {	// normal mode: adding margins to wrappers
			aa_studio_edit_mode.elemsToMove = aa_studio_edit_mode.wrappers = $(wrappers);
			aa_studio_edit_mode.ApplyMarginsOnThis = [];
			aa_studio_edit_mode.movingElemsAndNotWrappers = false;			
		} else {
			aa_studio_edit_mode.elemsToMove = $(jBart.studiobar.object.Elements);	// cannot change margin of TD
			aa_studio_edit_mode.ApplyMarginsOnThis = ["true"];
			aa_studio_edit_mode.movingElemsAndNotWrappers = true;
		}
		$(aa_studio_edit_mode.elemsToMove).each( function(i,elemToMove) {
			var selectedMark = $('<div class="jbstudio_selected_mark" tabindex="1"></div>');
			selectedMark.width(jQuery(elemToMove).outerWidth()).height(jQuery(elemToMove).outerHeight()).css("left",aa_absLeft(elemToMove)+"px").css("top",aa_absTop(elemToMove) + "px").appendTo("body");
			selectedMark[0].jbBasedOn = elemToMove;
		} );
		if (update_properties_and_tree) {
			setTimeout( function() { 
				// var ctx = aa_ctx(jBart.studiobar.context,{_DomEvent: [e]}); 
				ajaxart.runComponent('bart_dt.OpenPropertiesWindow',[],jBart.studiobar.context);
				ajaxart.runComponent('bart_dt.SynchTreePopup',[],jBart.studiobar.context);

				if (focus)
					setTimeout( function() { 
						aa_studio_edit_mode.focusOnMarks();
					},100);	// use timeout to come after the timeout of the properties window focus
			},1);
		}
	},
	clearSelectedMarks: function() {
		$(".jbstudio_selected_mark").remove();
	},
	focusOnMarks: function() {
		$(".jbstudio_selected_mark").first().focus();	// focus is made to know whether to catch keyboard arrows
	},
	showCross: function(elem) {
		var margin_left = parseInt(window.getComputedStyle(elem).getPropertyValue("margin-left").split("px")[0]) || 0;
		var margin_top = parseInt(window.getComputedStyle(elem).getPropertyValue("margin-top").split("px")[0]) || 0;
		$( [ $("<div class='jbstudio_selected_cross x'/>")[0], $("<div class='jbstudio_selected_cross y'/>")[0] ] )
			.css("left",aa_absLeft(elem)-margin_left+"px").css("top",aa_absTop(elem)-margin_top + "px").appendTo("body");
	},
	hideCross: function() {
		$('.jbstudio_selected_cross').remove();
	},
	prepareReplacingWithUpperFields: function(elem) {
		if (!jBart.studiobar.object.Xtml || !jBart.studiobar.object.Xtml.parentNode || !jBart.studiobar.object.Xtml.parentNode.getAttribute("ID")) return;
		var siblings = aa_xpath(jBart.studiobar.object.Xtml.parentNode, "Field");
		this.upperFields = [];
		var elemOfParent = $(elem).parents(".fld_" + jBart.studiobar.object.Xtml.parentNode.getAttribute("ID"));
		for (var i=0; i<siblings.length; i++) {
			var sibling = siblings[i];
			if (sibling == jBart.studiobar.object.Xtml) break;	// taking siblings before current xtml
			var elemOfSibling = elemOfParent.find(".fld_" + sibling.getAttribute("ID"))[0];
			if (elemOfSibling)
				this.upperFields.push( {
					left: aa_absLeft(elemOfSibling), top: aa_absTop(elemOfSibling), 
					width: $(elemOfSibling).outerWidth(), height: $(elemOfSibling).outerHeight(),
					xtml: sibling
				});
		}
	},
	testGoingOverUpperField: function(e) {
		$('#jbstudio_field_to_replace_with').remove();
		$('#jbstudio_text_of_field_to_replace').remove();
		if (e.ctrlKey) return; // when ctrl key is down, we don't suggest replacing fields
		for (i=0; i<this.upperFields.length; i++) {
			var upperField = this.upperFields[i];
			if (e.clientX >= upperField.left && e.clientX <= upperField.left + upperField.width -5 &&
				e.clientY >= upperField.top && e.clientY <= upperField.top + upperField.height -5) {
				// We go over a field above us while moving
				// 1. Mark the field
				$("<div id='jbstudio_field_to_replace_with'/>").css("left",upperField.left + "px").css("top",upperField.top + "px").
					width(upperField.width + "px").height(upperField.height + "px").appendTo("body");
				$('#jbstudio_field_to_replace_with')[0].jbField = upperField;
				// 2. todo: Suggest using Enter to replace
				$("<div id='jbstudio_text_of_field_to_replace'/>").text("Release mouse button to reorder").
					css("left",upperField.left + "px").css("top",upperField.top + "px").appendTo("body");
			}
		}
	},
	replaceFields: function() {
		if (!$('#jbstudio_field_to_replace_with')) return;
		// replacing xtml
		jBart.studiobar.object.Xtml.parentNode.insertBefore( jBart.studiobar.object.Xtml,  $('#jbstudio_field_to_replace_with')[0].jbField.xtml );

		// refreshing
		jBart.studiobar.objectFromXtml(jBart.studiobar.object.Xtml.parentNode).Refresh([],jBart.studiobar.context);

		// rebuilding state
		this.currentMoving = null;
		aa_studio_edit_mode.hideCross();
		aa_studio_edit_mode.clearSelectedMarks();

		$('#jbstudio_field_to_replace_with').remove();
		$('#jbstudio_text_of_field_to_replace').remove();
	}
}
function aa_show_selected_object_marks()
{
	if (aa_studio_edit_mode.active)
		aa_studio_edit_mode.showSelectedMarks();
	else
		jBart.studiobar.showObjectElements(jBart.studiobar.object);
}
function aa_wrapper(elem) {
	return elem.jbCell || elem.parentNode;
}

aa_gcs("field_dt", {
	ApplyDragChangesOnField: function(profile,data,context)
	{
		var margin_left = aa_text(data,profile,'MarginLeft',context);
		var margin_top = aa_text(data,profile,'MarginTop',context);
		var field_xtml = aa_first(data,profile,'FieldXtml',context);
		var css_aspects = aa_xpath(field_xtml,"FieldAspect[@t='field_feature.Css']");
		var layout_aspects = aa_xpath(field_xtml,"FieldAspect[@t='field_feature.Layout']");
		var apply_margins_on_this = aa_bool(data,profile,'ApplyMarginsOnThis',context);

		var css_to_add = '';
		if (margin_left) css_to_add += 'margin-left:' + margin_left + '; ';
		if (margin_top) css_to_add += 'margin-top:' + margin_top + '; ';
		var selector = apply_margins_on_this ? '#this' : '#wrapper';

		// remove old margins
		var css_and_layout_aspects = css_aspects.concat(layout_aspects);
		for (var i in css_and_layout_aspects) {
			var aspect = css_and_layout_aspects[i];
			var css_elem = aa_xpath(aspect,'Css')[0];
			var css_text = aa_cdata_value(css_elem);
			if (css_text) {
				var new_css;
				if (apply_margins_on_this) {
					new_css = css_text.replace(/#this[ ]*{[^}]*/, function(match) {
						return match.replace(/margin-left:[^;]*;[ ]*/,"").replace(/margin-top:[^;]*;[ ]*/,"");
					});
				} else {
					new_css = css_text.replace(/#wrapper[ ]*{[^}]*/, function(match) {
						return match.replace(/margin-left:[^;]*;[ ]*/,"").replace(/margin-top:[^;]*;[ ]*/,"");
					});
				}
				if (new_css != css_text)
					aa_run_component("xml.WriteCData",[],context,{ Element: [css_elem], CDataText: [new_css]});
			}
		}

		if (layout_aspects.length == 0) {	// create new aspect
			var new_aspect = '<FieldAspect t="field_feature.Layout"><Css><![CDATA[' + selector + '{ ' + css_to_add + '}]]></Css></FieldAspect>';
			field_xtml.appendChild(aa_importNode(ajaxart.parsexml(new_aspect),field_xtml));
		} else {
			// update last aspect
			var last_layout_aspect = layout_aspects.slice(-1)[0];
			var css_elem = aa_xpath(last_layout_aspect,'Css')[0];
			var new_css = css_text = aa_cdata_value(css_elem);
			if (apply_margins_on_this) {
				if (new_css.indexOf('#this') != -1)
					new_css = new_css.replace(/(#this[ ]*{[^}]*)/, '$1' + css_to_add);
				else
					new_css += '#this { ' + css_to_add + '}';
			} else {
				if (new_css.indexOf('#wrapper') != -1)
					new_css = new_css.replace(/(#wrapper[ ]*{[^}]*)/, '$1' + css_to_add);
				else
					new_css += '#wrapper { ' + css_to_add + '}';
			}
			if (new_css != css_text)
				aa_run_component("xml.WriteCData",[],context,{ Element: [css_elem], CDataText: [new_css]});
		}	
	}
} );








jBart.studiobar = jBart.studiobar || {}

aa_gcs("field_dt", {
	GroupingXml: function (profile,data,context)
	{
	  var parentField = aa_first(data,profile,'ParentField',context);
	  if (parentField == null || parentField.Fields == null) return [];
	  var out = [];
	  
	  for(var i=0;i<parentField.Fields.length;i++) {
		  var field = parentField.Fields[i];
		  if (field.Fields == null) // primitive
			  out.push( ajaxart.parsexml('<field id="' + field.Id + '"/>') );
		  else { // maybe group
			  if ( field.IsVirtualGroup ) { 
				  for(var j=0;j<field.Fields.length;j++) {
					  var subfield = field.Fields[j];
					  if (subfield.Fields == null) // primitive
 					    out.push( ajaxart.parsexml('<field id="' + subfield.Id + '" group="' +field.Id + '"/>' ) );
				  }
			  }
		  }
	  }
	  return out;
	},
	TreeItemImage: function (profile,data,context)
	{
		if (!data[0] || data[0].nodeType != 1) return;
		if (data[0].getAttribute('image'))
			return [ajaxart.dynamicText([],data[0].getAttribute('image'),context)  ];
		
		var aspects = aa_xpath(data[0],'FieldAspect');
		for(var i=0;i<aspects.length;i++) {
			var ptDef = aa_component_definition(aspects[i].getAttribute('t'));
			if (ptDef && ptDef.getAttribute('fieldImage')) 
				return [ajaxart.dynamicText([],ptDef.getAttribute('fieldImage'),context)  ];
		}
		var ptDef = aa_component_definition(data[0].getAttribute('t'));
		if (ptDef && ptDef.getAttribute('image')) 
			return [ajaxart.dynamicText([],ptDef.getAttribute('image'),context)  ];
		
		return [aa_base_images() + '/studio/bullet1616.gif'];
	},
	Regroup: function (profile,data,context)
	{
	  var parentField = aa_first(data,profile,'ParentField',context);
	  if (parentField == null || parentField.Fields == null) return [];
	  var xmlitems = ajaxart.run(data,profile,'GroupingXml',context);
	  for(var i=0;i<xmlitems.length;i++) {
		  var fieldId = xmlitems[i].getAttribute('id');
		  var groupId = xmlitems[i].getAttribute('group');
		  
		  var field = ajaxart_object_byid(ajaxart_firstlevel_fields(parentField),fieldId);
		  var group = parentField;
		  if (groupId != "") {
			  for(var j=0;j<parentField.Fields.length;j++)
				  if (parentField.Fields[j].Id == groupId) { group = parentField.Fields[j]; break; } 
		  }
		  if ( ajaxart_object_byid(group.Fields,fieldId) == null )
		    group.XtmlSource[0].script.appendChild( field.XtmlSource[0].script );
	  }
	  
	  return ["true"];
	},
	SiblingFieldIDs: function (profile,data,context)
	{
		var field = aa_first(data,profile,'FieldXtml',context);
		var out = [], in_array = {};
		// get all fields under component, the closest fields before the far ones 
		var parents = jQuery(field).parents();
		for (var i=0;i< parents.length && parents[i].tagName != 'Component';i++) {
			var fields = aa_xpath(parents[i],'.//Field/@ID');
			for (var j=0;j<fields.length;j++) {
				var fn = fields[j].nodeValue;
				if (in_array[fn] || fn == field.getAttribute("ID")) continue;
				in_array[fn] = true;
				out.push(fn);
			}
		}
		return out;
	},
	SingleFieldNameToXtml: function (profile,data,context)
	{
		var editable = aa_bool(data,profile,'Editable',context);
		var name = aa_totext(data);
		var id = name.replace(/ /g,'_');
		name = aa_capitalize_each_word(name);
		
		var out = jBart.parsexml('<Field t="fld.Field" />',profile);
		out.setAttribute('FieldData',editable ? '%!@'+id+'%' : '%'+id+'%');
		jQuery(out).attr('ID',id).attr('Title',name);
		
		var fieldtype_str = '',fieldtype_t = editable ? 'fld_type.EditableText' : 'fld_type.Text';
		
		if ( name.indexOf('image') > -1 || name.indexOf('photo') > -1) {
			fieldtype_t = editable ? 'fld_type.EditableImage' : 'fld_type.Image';
		}
		
		fieldtype_str = fieldtype_str || '<FieldType t="' + fieldtype_t + '" />';
		out.appendChild( jBart.parsexml(fieldtype_str,out) );
		
		return [out];
	},
	FieldSampleData: function (profile,data,context)
	{
		var page = aa_first(data,profile,'Page',context);
		var field = aa_first(data,profile,'Field',context);
		var pageData = ajaxart.run(data,profile,'PageData',context);
		if (page == field) return pageData;
		
		var item = pageData[0];
		var dataitems = null;
		var fields = [];
		var iter = field;
		while (iter && iter != page) {
			if (iter.tagName == 'Field') fields.push(iter);
			iter = iter.parentNode;
		}
		fields = fields.reverse();
		
		for(var i in fields) {
			if (!item) return [];
			var field = ajaxart.run([],fields[i],'',context)[0];
			if (!field) continue;
			if (field.IsMultipleGroup) {
				var topData = field.FieldData([item],context);
				var items = field.InnerItems(topData,context)[0];
				item = items.Items[0];
			} 
			if (field.hasItemlistContainer) {
				var ctx2 = ajaxart.clone_context(context);
				jBart.trigger(field,'ModifyInstanceContext',{ FieldData: [item], Context: ctx2 });
				var cntr = ctx2.vars.ItemListCntr[0];
				dataitems = cntr.Items;
			}
			if (field.IsItemList && dataitems) item = dataitems[0];
			if (field.IsFilterGroup && dataitems) item = dataitems[0];
			else if (field.FieldData) item = field.FieldData([item],context)[0];
		}
		if (!item) return [];
		return [item];
	},
	FieldsFromOtherPages: function (profile,data,context)
	{
		var out = [];
		var field = aa_first(data,profile,'FieldXtml',context);
		if (!field) return;
		var mypage = field;
		while (mypage.tagName != 'xtml' && mypage) mypage = mypage.parentNode;
		if (!mypage || !mypage.parentNode || mypage.parentNode.getAttribute('type') != 'jbart.MyWidgetPage') return;
		
		var ct = mypage.getAttribute('ContentType');
		var pages = aa_xpath(mypage.parentNode.parentNode,"Component[@type='jbart.MyWidgetPage']/xtml");
		for (var i=0;i<pages.length;i++) {
			var page = pages[i];
			if (page == mypage || page.getAttribute('ContentType') != ct) continue;
			var origin = 'page: ' + page.parentNode.getAttribute('id');
			var fields = aa_xpath(page,'Field');
			for(var j=0;j<fields.length;j++) {
				var newField = fields[j].cloneNode(true);
				newField.setAttribute('origin',origin);
				var id = newField.getAttribute('ID');
				if (id && aa_xpath(mypage,"Field[@ID='"+id+"']").length > 0)
				  newField.setAttribute('fieldExists',true);
				out.push(newField);
			}
		}
		return out;
	},
	ExistingFieldsToAdd: function (profile,data,context)
	{
	  var parentField = aa_first(data,profile,'ParentField',context);
	  var ct = aa_text(data,profile,'ContentType',context);
	  var parentPath = aa_text(data,profile,'ParentFieldPath',context);
	  
	  var out = [];
	  var currentFields = ajaxart_firstlevel_fields(parentField);
	  
	  var oldPages = context.vars._BartContext[0].Pages;
	  var pages = [];
	  
	  // refresh pages only of our content type (if new fields have been added in the GC)
	  for(var i=0;i<oldPages.length;i++) 
 	    if (ajaxart.totext_array(oldPages[i].ContentType)==ct)
 	    	pages.push( aa_first(data,oldPages[i].XtmlSource[0].script,'',context) );

	  var optionalFields = [];
	  
	  for(var i=0;i<pages.length;i++) {
		  var parent = ajaxart_subfield_bypath(pages[i],parentPath);
		  if (parent != null)
		    ajaxart.concat(optionalFields,ajaxart_firstlevel_fields(parent));
	  }

	  if (context.vars._BartContext)
	    ajaxart.concat(optionalFields,context.vars._BartContext[0].GlobalFields);
	  
	  for(var i=0;i<optionalFields.length;i++)
		  if (ajaxart_object_byid(currentFields,optionalFields[i].Id) == null)
			  if (ajaxart_object_byid(out,optionalFields[i].Id) == null)
			    out.push( optionalFields[i] );
	  
	  return out;
	},
	ComponentsOfTypeOptions: function (profile,data,context)
	{
		var out = { isObject: true, Options: [] };
		var components = ajaxart.runNativeHelper(data,profile,'Components',context);
		var current_pt = aa_text(data,profile,'CurrentPT',context), current_pt_added = false;
		
		for(var i=0;i<components.length;i++) {
			var comp = components[i];
			var option = { isObject: true, code: comp.ID, image: aa_jbart_image('/default1616.gif',context)};
			option.OptionPage = aa_first(data,profile,'OptionPage',context);
			option.text = aa_text_capitalizeToSeperateWords(comp.ID.split('.')[1]);
			
			if (comp.ID == current_pt) current_pt_added = true;
			out.Options.push(option);
		}
  	    // add current pt
	    if (current_pt != "" && ! current_pt_added) {
			  var option = { isObject: true, code: current_pt , image: aa_jbart_image('/default1616.gif',context), OptionPage: aa_first(data,profile,'OptionPage',context)};
			  option.text = aa_text_capitalizeToSeperateWords(current_pt.split('.')[1]);
			  out.Options.push(option);
	    }
		return [out];
	},
	ComponentsWithCategories: function (profile,data,context)  // TODO: it should be deprecated and deleted
	{
		var out = { isObject: true, IsTree: true, Options: [] };
		
		var generalCategory = { isObject: true, code: 'General', UnSelectable: true, IsCategory: true, Options: [] , image: aa_jbart_image('/folder-open.png',context)} 
		out.Categories = [ generalCategory ];
		var cache = {};
		var is_jbart = aa_isjbart();
		cache.General = generalCategory;
		if ( ! window.aaxtmldt_options_cache) {
			aaxtmldt_options_cache = {};
			  for (var i in ajaxart.components) {
				  if (i.lastIndexOf("_dt") == i.length-3 && i.length > 3 || i == "aaeditor") continue;
				  for(var j in ajaxart.components[i]) {
					  var comp = ajaxart.components[i][j];
					  if (comp.getAttribute('hidden') == 'true' || comp.getAttribute('type') == null) continue;
					  if (is_jbart && comp.parentNode.getAttribute('jbart') != 'true') continue;
					  if (is_jbart && comp.getAttribute('jbart') == 'false') continue;
					  var hide = comp.getAttribute('light') == 'false';
					  var types = comp.getAttribute('type').split(',');
					  for(var k=0;k<types.length;k++) {
						  if (types[k].split('.').length > 2) // e.g. data_items.Items.
							  types.push(types[k].substring(0,types[k].lastIndexOf('.')));
					  }
					  var category = comp.getAttribute('category');
					  if (category) types.push(types[0]+'.'+category);
					  
					  for(var k=0;k<types.length;k++) {
						var option = { isObject: true, code: ""+i+"."+j, Hidden: hide , image : aa_jbart_image('/default1616.gif',context)};
						option.text = aa_text_capitalizeToSeperateWords(j);
						option.Category = comp.getAttribute('category'); 
					    if (aaxtmldt_options_cache[types[k]] == null) aaxtmldt_options_cache[types[k]] = [];
					    aaxtmldt_options_cache[types[k]].push(option);
					  }
				  }
			 }
		}
		  
		// TBD: may be cached as well
		  var type = aa_text(data,profile,'Type',context);
		  if (type == '') return [];
		  var typeXml = ajaxart.types[type.replace('.','_')];
		  if (typeXml != null && typeXml.getAttribute('lightPTs') != null) {
			var pts = typeXml.getAttribute('lightPTs').split(',');
			out.Options = [];
			for (var i=0;i<pts.length;i++) {
			  var option = pts[i];
			  var text = aa_text_capitalizeToSeperateWords(option.substring(option.indexOf('.')+1));
			  out.Options.push({isObject:true, code: option, OptionPage: aa_first(data,profile,'OptionPage',context), text: text });
			}
			out.Categories = null;
			out.IsTree = false;
			return [out];
		  }
		  
		  var cachedOptions = aaxtmldt_options_cache[type];
		  if (cachedOptions == null) cachedOptions = [];
		  
		  var currentpt = aa_text(data,profile,'CurrentPT',context), current_pt_added = false;
		  
		  for(var i=0;i<cachedOptions.length;i++)
		  {
			  var option = {};
			  if (cachedOptions[i].Hidden) continue;
			  if (cachedOptions[i].code == currentpt) current_pt_added=true;
			  
			  for(var j in cachedOptions[i]) option[j] = cachedOptions[i][j];
			  if (option.code == currentpt) hasCurrentPT = true;
			  option.OptionPage = aa_first(data,profile,'OptionPage',context);
			  if (cachedOptions[i].Category == null) {
				  generalCategory.Options.push(option);
			  }
			  else
			  {
				  var catIds = cachedOptions[i].Category.split(',');
				  for(var j=0;j<catIds.length;j++)
				  {
					  var catId = catIds[j];
					  if (cache[catId] == null)
					  {
						  cache[catId] = { isObject: true, code: [catId], UnSelectable: true, IsCategory: true, Options: [] , image: aa_jbart_image('/folder-open.png',context)}
						  out.Categories.push(cache[catId]);
					  }
					  cache[catId].Options.push(option);
				  }
			  }
		  }
		  // add current pt
		  if (currentpt != "" && ! current_pt_added) {
			  var option = { isObject: true, code: currentpt , OptionPage: aa_first(data,profile,'OptionPage',context)};
			  option.text = aa_text_capitalizeToSeperateWords(currentpt.split('.')[1]);
			  generalCategory.Options.push(option);
		  }
		if (out.Categories.length == 1) { // only general - get rid of categories
			out.Options = out.Categories[0].Options;
			out.Categories = null;
			out.IsTree = false;
		}
		return [out];
	},
	DualFeatureOptions: function (profile,data,context)
	{
		if (!aa_field_dt_dual_options) {
			var out = { isObject: true, IsTree: true, Options: [] };
			var is_jbart = aa_isjbart();
			var generalCategory = { isObject: true, code: 'General', UnSelectable: true, IsCategory: true, Options: [] }
			out.Categories = [ generalCategory ];
			var cache = { General: generalCategory };

			for (var i in ajaxart.components) {
			   if (i.lastIndexOf("_dt") == i.length-3 && i.length > 3 || i == "aaeditor") continue;
			   for(var j in ajaxart.components[i]) {
				  var comp = ajaxart.components[i][j];
				  var type = comp.getAttribute('type'); 
				  if (comp.getAttribute('hidden') == 'true' || comp.getAttribute('light') == 'false') continue;
				  if (type != 'field.FieldAspect' && type != 'uiaspect.Aspect') continue;
				  if (is_jbart && comp.parentNode.getAttribute('jbart') != 'true') continue;
				  
				  var type_des = (type == 'field.FieldAspect') ? 'field' : 'list';
				  var option = { isObject: true, code: ""+i+"."+j };
				  option.text = aa_text_capitalizeToSeperateWords(j) + ' (' + type_des + ')';
				  var cats = comp.getAttribute('category') || 'General'; 
				  var catIds = cats.split(',');
				  for(var j=0;j<catIds.length;j++)
				  {
					  var catId = catIds[j];
					  if (cache[catId] == null)
					  {
						  cache[catId] = { isObject: true, code: [catId], UnSelectable: true, IsCategory: true, Options: [] }
						  out.Categories.push(cache[catId]);
					  }
					  cache[catId].Options.push(option);
				  }
			   }
			}
			
			aa_field_dt_dual_options = [out];
		} 
		return aa_field_dt_dual_options;
	},
	SyncFieldsData: function (profile,data,context)
	{
		var page = aa_first(data,profile,'PageXtml',context);
		var ct = page.getAttribute('ContentType');
		var out = [];
		var path = "";
		var appXtml = context.vars._BartContext[0].AppXtml[0];
		var pages = ajaxart.xml.xpath(appXtml,"Pages/Page[@ContentType='"+ct+"']");

		var fields = bartdt_subfields(page);
		
		for(var i=0;i<fields.length;i++) {
			var field = fields[i].Field;
			for(var j=0;j<pages.length;j++) {
				if (pages[j] == page) continue;
				var otherfield = bartdt_field_bypath(pages[j],fields[i].Path);
				if (!otherfield || ajaxart.xml2text(field) == ajaxart.xml2text(otherfield)) continue;
				var item = {isObject:true, Field: field, OtherField: otherfield, Page: page , OtherPage: pages[j] }
				out.push(item);
			}
		}
		return out;
	},
	GotoFieldOfFocus: function (profile,data,context)
	{
		var field_ctrl = jQuery(ajaxart.controlOfFocus).parents().filter(function() { return this.Field != null;} )[0];
		if (field_ctrl == null) return [];
		var field_id = field_ctrl.Field.Id;
		var field_elem = jQuery(document).find('.bartdt_edit_fields').find('.aa_item_fld_' + field_id);
		field_elem.parents().each(function() { jQuery(this).show(); } );
		aa_xFireEvent(field_elem[0],"mousedown");
		aa_xFireEvent(field_elem[0],"mouseup");
		return [];
	},
	ToEnglishMultiple: function (profile,data,context)
	{
		var single = aa_totext(data);
		if (single == '') return [];
		var lastChar = single.charAt(single.length-1);
		if (lastChar == 's') return [single+'es']; 
		if (lastChar == 'y') return [single.substring(0,single.length-1)+'ies']; 
		return [single+'s'];
	},
	SelectedFieldInfo: function (profile,data,context)
	{
		var out = { isObject: true }
		var elem = context.vars._ElemsOfOperation[0];
		
		var path = "";
		while (elem.parentNode != null) {
			if (jQuery(elem).hasClass('aa_item')) {
				var field = elem.ItemData[0];
				if (field && field.getAttribute('ContentType') != null) {
					out.ContentType = field.getAttribute('ContentType');
					out.Path = [path];
					return [out];
				}
				if (field && field.getAttribute('Path') != null) {
					if (path != "")
					  path = field.getAttribute('Path') + "/" + path;
					else
					  path = field.getAttribute('Path');
				}
			}
			elem = elem.parentNode;
		}
		
		return [out];
	},
	GuessType: function (profile,data,context)
	{
		var samples = ajaxart.run(data,profile,'SampleData',context);
		var nums = 0;
		for (i in samples) {
			var val = ajaxart.totext_item(samples[i]);
			if (!isNaN(parseInt(val)) && isFinite(val))
				nums++;
		}
		if (samples.length > 0 && nums/samples.length > 0.8)
			return [ajaxart.parsexml("<Type t='field_aspect.Number' />")];
		
		return [ajaxart.parsexml("<Type t='field_type.Text' />")];
	},
	FieldTreeItemsDecorator: function (profile,data,context)
	{
		var dataItems = aa_first(data,profile,'DataItems',context);
		var parent = data[0];
		if (parent && parent.nodeType == 1) { 
			// look for t="ui.InnerPage"
			function findInnerPage(node) {
				for(var iter=node.firstChild;iter!=null;iter=iter.nextSibling) {
					if (iter.nodeType != 1 || iter.tagName == 'Field' || iter.tagName == 'xtml') continue;
					var t = iter.getAttribute('t'); 
					if (t == 'ui.InnerPage' || t == 'field.InnerPage' || t == 'ui.CustomStyleByField') return iter;
					var found = findInnerPage(iter);
					if (found) return found;
				}
				return null;
			}
			var innerPage = findInnerPage(parent);
			if (innerPage) {
				dataItems = dataItems || { Items: [] };
				dataItems.Items.push(innerPage);
			}
		}
		
		return dataItems ? [dataItems] : [];
	},
	AddFeatureFieldOptions: function (profile,data,context)
	{
		var type = aa_text(data,profile,'Type',context);
		var xtml = aa_first(data,profile,'Xtml',context);
		var filter = {};
		if (xtml) {
			var t = xtml.getAttribute('t'); 
			if (t != 'field.Field' && t!= 'field.XmlField') filter.notTextbox = true;
		}

		var plugins = (context.vars._WidgetXml) ? aa_totext( aa_xpath(context.vars._WidgetXml[0],'@plugins') ) : '';
		var cacheName = 'cache_'+plugins+'_light';
		
		if (!jBart.vars.compsOfTypeCache || ! jBart.vars.compsOfTypeCache[cacheName])
			ajaxart.runNativeHelper(data,profile,'BuildCache',context);
		
		var typeArr = type.split(',');
		var components = jBart.vars.compsOfTypeCache[cacheName][typeArr[0]];
		if (typeArr.length > 0) {
			components = [];
			for(var t=0;t<typeArr.length;t++) {
				ajaxart.concat(components,jBart.vars.compsOfTypeCache[cacheName][typeArr[t]]);
			}
		}
		if (!components) return [];
		
		var out = [];
		for(var i=0;i<components.length;i++) {
			var category = components[i].Definition.getAttribute('category');
			if (category == 'textbox' && filter.notTextbox) continue;
			out.push(components[i].Definition);
		}
		return out;
	},
	ComponentInTable: function (profile,data,context)
	{
		var cssClass = aa_attach_global_css( aa_text(data,profile,'Css',context) );
		var xtml = aa_first(data,profile,'Xtml',context);
		var out = jQuery("<div><span class='component_title'><span style='cursor:inherit' class='aa_field_toolbar_image xtmldt_toggle_left'/><span class='component_title_in_table' /></span><div class='place_holder' /></div>");
		out.addClass(cssClass);
		out.find(".component_title_in_table").text(aa_text([xtml],profile,'ComponentTitle',context));
		var has_params = ajaxart.tobool_array(ajaxart.runNativeHelper([xtml],profile,'HasParams',context));
		if (!has_params) return [out[0]];
		out.find(".xtmldt_toggle_left").attr("title",aa_text(data,profile,'TitleForExpand',context));
		out.find(".xtmldt_toggle_left").css("background",'url('+aa_text(data,profile,'ImageForExpand',context)+') no-repeat');
		out.find(".component_title").css("cursor","pointer");
		out.find(".component_title").click(function(e) {
	    	var elem = jQuery( (typeof(event)== 'undefined')? e.target : event.srcElement  );
	    	if (jQuery(elem).hasClass("doc_icon"))
	    		return true;
			if (this.Expanded) {
				this.Expanded = false;
				out.find(".place_holder").animate({height:'hide'},300);
				out.find(".xtmldt_toggle_left").attr("title",aa_text(data,profile,'TitleForExpand',context));
				out.find(".xtmldt_toggle_left").css("background",'url('+aa_text(data,profile,'ImageForExpand',context)+') no-repeat');
				out.find(".component_title_in_table").removeClass("expanded");
				out.find(".documentation").remove();
			} else {
				this.Expanded = true;
				out.find(".xtmldt_toggle_left").attr("title",aa_text(data,profile,'TitleForCollapse',context));
				out.find(".xtmldt_toggle_left").css("background",'url('+aa_text(data,profile,'ImageForCollapse',context)+') no-repeat');
				out.find(".place_holder").hide();
				out.find(".place_holder").children().remove();
				out.find(".component_title_in_table").addClass("expanded");
				out.find(".component_title").append(ajaxart.runNativeHelper([xtml],profile,'Documentation',context));
				var control = ajaxart.runNativeHelper([xtml],profile,'ParamsControl',context);
				jQuery(control).addClass('dt_intable_props');
				if (control.length)
					out.find(".place_holder").append(control[0]);
				out.find(".place_holder").animate({height:'show'},300,'swing', function() {
					aa_ensure_visible(control[0]);
				} );
				aa_element_attached(out.find(".place_holder")[0]);
			}
		});
		return [out[0]];
	},
	UpToPageDef: function(profile,data,context)
	{
		var xtml = aa_first(data,profile,'Xtml',context);
		if (xtml && xtml.nodeType != 1) xtml=ajaxart.xml.parentNode(xtml);
		var path = [];
		var prev = null;
		for(;xtml && xtml.nodeType == 1 ; xtml = xtml.parentNode) {
//			if ('Field,Fields,Operation,Operations,xtml,Contents'.indexOf(xtml.tagName) > -1)
			  path.push(xtml.getAttribute('Title') || xtml.getAttribute('ID') || xtml.getAttribute('t'));
			
//			if (xtml.parentNode && xtml.parentNode.getAttribute) {
//				if (xtml.parentNode.getAttribute('t') == 'bart.Pages' || xtml.parentNode.getAttribute('type') == 'jbart.MyWidgetPage')
//					break;
//			}
			if ('Field,Fields,Operation,Operations'.indexOf(xtml.tagName) == -1) break;
		}
		var result = aa_text(data,profile,'Result',context);
		var out = { isObject: true, Xtml: xtml, Path: path.reverse().join('/') }; 
		if (result == 'xtml') return [xtml];
		if (result == 'path') return [out.Path];
		return [out];
	},
	ContainerFields: function(profile,data,context) 
	{
		var container = aa_first(data,profile,'Container',context);
		if (!container) return [];
		var list = aa_DataviewFields(container.Fields);
		if (!aa_bool(data,profile,'ReturnIDsList',context))
			return list;
		else {
			var result = [];
			for (i in list)
				result.push(list[i].Id);
			return result;
		}
	},
	FixPercentagesInCss: function(profile,data,context) 
	{
		var text = aa_text(data,profile,'Text',context);
		var parts = text.split("%");
		for (var i in parts) {
			if (i < parts.length-1 && !isNaN(parseInt(parts[i].charAt(parts[i].length-1))) ) // if previous char is a digit, e.g 70% -> 70\%
					parts[i] += "\\";
		}
		return [parts.join("%")];
	},
	IsReadOnly: function(profile,data,context)
	{
		var field_xtml = aa_first(data,profile,'FieldXtml',context);
		for (var xtml = field_xtml; xtml != null; xtml=xtml.parentNode) {
			if (aa_xpath(xtml,"FieldAspect[@t='field_aspect.ReadOnly']")[0]) return ["true"];
			if (aa_xpath(xtml,"Aspect[@t='uiaspect.ReadOnly']")[0]) return ["true"];
		}
		return [];
	},
	RenameField: function(profile,data,context)
	{
		var elem = context.vars._ElemsOfOperation[0];
		var field = context.vars._ItemsOfOperation[0];
		var title = "" + field.getAttribute("Title");
		var new_title = prompt("Please enter a new title:",title);
		function title2id(title) {
			return ajaxart.totext(ajaxart.runNativeHelper([title],profile,'ID',context));
		}
		if (new_title && new_title != title) {
			if (field.getAttribute("ID") == title2id(title))
				field.setAttribute("ID",title2id(new_title));
			field.setAttribute("Title",new_title);
			jQuery(elem).find(">.item_text").text(new_title);
			ajaxart.runNativeHelper(data,profile,'Refresh',context);
		}
		return [];
	}
});
//AA EndModule
//AA BeginModule
ajaxart.gcs.bart_dt = 
{
	XmlToOneJSLine: function (profile,data,context) {
		var result = ajaxart.xml.prettyPrint(data,'',true);
		result = result.replace(/\\/g,'\\\\');
		result = result.replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\t/g,'\\t');
		result = result.replace(/\'/g,'\\\''); // to js string
		return [result];	
	},
	AllFieldIDs: function (profile,data,context)
	{
		var topXml = ajaxart.runNativeHelper(data,profile,'TopXml',context)[0];
		var out = [];
		var existing = {}
		var fieldPT = aa_text(data,profile,'FieldPT',context);
		
		function find(elem) {
			if (elem.nodeType !=1) return;
			if (elem.tagName == 'Field' && elem.getAttribute('ID')) {
				var val = elem.getAttribute('ID');
				var text = elem.getAttribute('Title') || val;
				if (!existing[val]) {
				  if (!fieldPT || fieldPT == elem.getAttribute('t'))
				    out.push({ code: val, text: text });
				}
				existing[val] = true;
			}
			for(var iter=elem.firstChild;iter;iter=iter.nextSibling)
				find(iter);
		}
		find(topXml);
		
		return [{ Options: out }];
	},
	ResourcesAsContext: function (profile,data,context)
	{
		out = { isObject: true, context: ajaxart.newContext() };	
		var resources = context.vars._BartContext[0].Resources;
//		for(var i=0;i<resources.length;i++)
//			out.context.vars[ ajaxart.totext_array(resources[i].ID) ] = resources[i].Items;
		  
		return [out];
	},
	PagePreview: function (profile,data,context)
	{
		var out = ajaxart.runNativeHelper(data,profile,'Control',context);
		var with_popups = jQuery(out).find('.aa_withpopup');
		for(var i=0;i<with_popups.length;i++) {
			var input = with_popups[i]; 
			var field = input.parentNode.Field;
			if (!field || !field.PopupContents) continue;
			var ctx = aa_ctx(input.ajaxart ? input.ajaxart.params : ajaxart.newContext() ,{_Input: [input]});
			var popupContents = field.PopupContents([],ctx)[0];
			var parent = jQuery(out).find('.aa_container')[0];
			if (popupContents && parent) { 
				parent.appendChild(jQuery('<div class="pagedt_pagebreak"/>')[0]);
				parent.appendChild(popupContents);
				jQuery(popupContents).css('height','300px').css('overflow','auto');
			}
		}
		return out;
	},
	SamplePageXtmlFromGallery: function (profile,data,context)
	{
		if (!window.aav_GalleryItems) return;
		var item = aa_text(data,profile,'GalleryItem',context);
		var itemXml = aav_GalleryItems[item];
		return ajaxart.runNativeHelper(itemXml,profile,'Xtml',context);
	},
	PreLoadGalleryItem: function (profile,data,context)
	{
		// add mark
		if (!window.aav_GalleryItems) window.aav_GalleryItems = {};
		var item = aa_text(data,profile,'GalleryItem',context);
		if (aav_GalleryItems[item]) return ajaxart.run(data,profile,'AfterLoad',context);
		var options = { cache: false , type: "GET", httpHeaders : [], url: 'bartdev.php?op=loadnode&contenttype=bart_sample&id='+item };
		options.success = function(server_content) {
	      var newdata = ajaxart_server_content2result(server_content);
	      var item = aa_text(data,profile,'GalleryItem',context);
	      aav_GalleryItems[item] = newdata;
	      ajaxart.run(data,profile,'AfterLoad',aa_ctx(context, {_GalleryItem: newdata}));
	      // add asynch callback
		}
		options.error = function() { ajaxart.run(data,profile,'AfterLoad',context); }
		jQuery.ajax(options);
	},
	FieldWithContainingFieldData: function (profile,data,context)
	{
		var fieldXtml = aa_first(data,profile,'FieldXtml',context);
		if (!fieldXtml) return;
		var fieldData = aa_run(data,profile,'FieldData',context);
		if (!fieldData[0]) return;
		var field = aa_first(fieldData,fieldXtml,'',context);
		if (!field) return;
		field.OrigFieldData = field.FieldData;
		field.FieldData = function(data1,ctx) {
			return field.OrigFieldData(fieldData,ctx);
		}
		return [field];
	},
	ShowPageFromGallery: function (profile,data,context)
	{
		if (!window.aav_GalleryItems) window.aav_GalleryItems = {};
		var obj = {}
		obj.LoadItem = function(data1,ctx) {
			var item = aa_text(data,profile,'GalleryItem',context);
			if (aav_GalleryItems[item]) return aav_GalleryItems[item];
			var options = { cache: false , type: "GET", httpHeaders : [], url: 'bartdev.php?op=loadnode&contenttype=bart_sample&id='+item };
			options.success = function(server_content) {
		      var newdata = ajaxart_server_content2result(server_content);
		      var item = aa_text(data,profile,'GalleryItem',context);
		      aav_GalleryItems[item] = newdata;
		      ajaxart_async_CallBack(newdata,ctx);
			}
			options.error = function() { ajaxart_async_CallBack([],ctx); }
			
			ajaxart_async_Mark(ctx);
			jQuery.ajax(options);
		}
		return ajaxart.runNativeHelper(data,profile,'Control',aa_ctx(context,{_GalleryLoader: [obj]}));
	},
	CleanInspectSelectedObject: function (profile,data,context)
	{
		jBart.studiobar.object = null;
		if (aa_studio_edit_mode.active)
			aa_studio_edit_mode.cleanSelectedMarks();
		else
			jBart.studiobar.showObjectElements(null);
	},
	ShowSelectedObjectElements: function (profile,data,context)
	{
		if (jBart.studiobar.object)
			aa_show_selected_object_marks();
	},
	HideSelectedObjectIndication: function (profile,data,context)
	{
		jQuery('.jbstudio_constant_selected_box').css('display','none');
	},
	RefreshSelectedObject: function (profile,data,context)
	{
		if (jBart.studiobar.object) {
			window.inJBartRefresh = true;
			try {
				if (jBart.studiobar.object.Refresh) jBart.studiobar.object.Refresh(data,context);
				aa_show_selected_object_marks();
			} catch(e) {
				ajaxart.logException(e);
			}
			window.inJBartRefresh = false;
		}
	},
	InspectSelectedObject: function (profile,data,context)
	{
		if (jBart.studiobar.object && jBart.studiobar.object.Xtml && jBart.studiobar.object.Xtml.tagName == 'dtnode') 
			return [jBart.studiobar.object]; // virual dt nodes under project properties
		
		if (jBart.studiobar.object) {
			var top_parent = jQuery(jBart.studiobar.object.Xtml).parents().slice(-1)[0];
			if (top_parent && aa_tag(top_parent) != 'bart_sample' && aa_tag(top_parent) != 'jbart_project' && aa_tag(top_parent) != 'xtml')
				jBart.studiobar.object = null;
		}
		if (!jBart.studiobar.object) {
			if (!context.vars._BartContext) return [];
			jBart.studiobar.object = { isObject: true };
	        var app_xtml = context.vars._BartContext[0].AppXtml[0];
	        var regexResult = window.location.href.match(/wpage=([a-zA-Z0-9]+)/);
	        var widget_page = regexResult ? regexResult[1] : null;
	        var page = null;
	        if (widget_page)
	        	page = aa_xpath(app_xtml,"../../Component[@id='" + widget_page +"']/xtml")[0];
	        if (!page) {
		        var main_page = aa_totext(aa_xpath(app_xtml,"MainPage1/@t")).split(".")[1];
		        page = aa_xpath(app_xtml,"../../Component[@id='" + main_page +"']/xtml")[0];
		    }
	        if (!page)
	        	page = aa_xpath(app_xtml,"../../Component[@type='jbart.MyWidgetPage']/xtml")[0];
	        page = page || aa_xpath(app_xtml,"Pages/Page")[0];
			jBart.studiobar.object.Xtml = page;
			jBart.studiobar.object.Element = context.vars._BartContext[0].ControlHolder && context.vars._BartContext[0].ControlHolder[0];
			aa_show_selected_object_marks();
		}
		return [jBart.studiobar.object];
	},
	OpenPropertiesWindow: function (profile,data,context)
	{
		var dialogClosed = false;
		
		var popups = jQuery('body').find('.aa_dlg');
		for(var i=0;i<popups.length;i++) {
		  if (popups[i].Dialog.Identifier == 'jBart Inspect Properties') { 
			  popups[i].Dialog.Close();
		  }
		}
		if (aa_use_left_pane() && (!window.bartdt_capture_level || window.bartdt_capture_level != "infra"))
			aa_left_pane().ShowSelectedObject();
		else
			ajaxart.runNativeHelper(data,profile,'Open',context)[0];
		// Keep path in cookie for automatic restore
		var path = aa_xtml_to_path(jBart.studiobar.object.Xtml);
		if (context.vars._WidgetXml) { // alt-c
		  var cookieId = context.vars._WidgetXml[0].getAttribute("id") + "_prop_path";
		  ajaxart.cookies.writeCookie(cookieId,path);
		}
	},
	PropertiesWindowClosed: function (profile,data,context)
	{
		if (context.vars._WidgetXml) {
		  var cookieId = context.vars._WidgetXml[0].getAttribute("id") + "_prop_path";
		  ajaxart.cookies.writeCookie(cookieId,"");
		}
	},
	RestorePopupsState: function (profile,data,context)
	{
		var cookieId = context.vars._WidgetXml[0].getAttribute("id") + "_prop_path";
		var path = ajaxart.cookies.valueFromCookie(cookieId);
		if (path) {
			var xtml = aa_path_to_xtml(path,context);
			if (xtml)
				ajaxart.runNativeHelper([xtml],profile,'OpenPropertiesWindow',context);
		}
	},
	ListenToAltC: function (profile,data,context)
	{
		var altOn = false;
		if (!jBart.studiobar.altCListener) { // first time - listen to body
			jQuery(document).keydown(function(e) {
		  		if (event.keyCode == 18) 
		  			altOn = true;
				
			  	if (e.keyCode == 67 && altOn) { // alt+c
			  		jBart.studiobar.altCListener();
			  	}
			  	if (e.keyCode == 78 && altOn) { // alt+n
			  		jBart.studiobar.altNListener();
			  	}
			});
		  	jQuery(document).keyup(function(event) { altOn = false; });
		}
		jBart.studiobar.context = context;
		jBart.studiobar.altCListener = function() {
			ajaxart.runComponent('bart_dt.Inspect',[],context);
		}
		jBart.studiobar.altNListener = function() {
			ajaxart.runComponent('bart_dt.InspectInfra',[],context);
		}
	},
	SetSelectedStudiobarObject: function (profile,data,context)
	{
		jBart.studiobar.object = jBart.studiobar.objectFromXtml(aa_first(data,profile,'Xtml',context));
		aa_show_selected_object_marks();
	},
	Inspect: function (profile,data,context)
	{
	  jBart.studiobar.context = context;
	  bartdt_captured_element = jQuery([]);
	  window.bartdt_capture_level = aa_text(data,profile,'Level',context);
//	  if (bartdt_capture_level=='sample' && window.location.href.indexOf('bartdev.html') > -1)
//		  bartdt_capture_level='application';
	  
	  aa_incapture = true;
	  
	  if (window.captureEvents){ // FF
		window.onclick = bartdt_capture_click;
		window.onmousemove = bartdt_capture_mousemove;
		window.onmousup = bartdt_capture_mouseup;
		window.onmousdown = bartdt_capture_mousedown;
		window.onkeydown = bartdt_capture_keydown;
	    if (window.addEventListener)
		    window.addEventListener('DOMMouseScroll', bartdt_capture_mousewheel, false);
	    window.onmousewheel = bartdt_capture_mousewheel;
	  }
	  else  // IE
	  {
		document.onclick=bartdt_capture_click;
		document.onmousemove=bartdt_capture_mousemove;
		document.onkeydown=bartdt_capture_keydown;
		document.onmousup = bartdt_capture_mouseup;
		document.onmousdown = bartdt_capture_mousedown;
		document.onmousewheel = bartdt_capture_mousewheel;
	  }
	
	  return [];
	},
	InputOfCustomXtml: function (profile,data,context)
	{
		if (! ajaxart.isxml(data) ) return [];
		
		var xml = data[0];
		var path = "";
		var iter = xml;
		var page = null;
		
		iter = iter.parentNode;
		while (iter != null) {
			if (iter.tagName == 'Field') {
				var subpath = iter.getAttribute('Path');
				if (subpath && subpath != "") path = subpath + "/" + path;
			}
			if (iter.tagName == 'Page') {
				page = aa_first([],iter,'',context);
				break;
			}
			iter = iter.parentNode;
		}
		var input = ajaxart.runNativeHelper([page],profile,'PageInput',context);
		if (path != "" && path.charAt(path.length-1) == "/") path = path.substring(0,path.length-1);
		if (path != "" && input.length > 0) {
			input = aa_xpath(input[0],path);
		}
		return input;
	},
	ResourcesContext: function (profile,data,context)
	{
	  var out = ajaxart.newContext();
  	  var bartContext = ajaxart_bart_getContext(context);
	  try {
	    var resources = bartContext.Resources;
	    for(var i=0;i<resources.length;i++)
	      out.vars[ ajaxart.totext_array(resources[i].ID) ] = resources[i].Items;
	  } catch(e) {}
	  return [out];
	},
	PagesPopupLocation: function (profile,data,context)
	{
		var dlg = context.vars._Dialog[0];
		dlg.FixDialogPosition = function(firstTime) 
		{
			jQuery(this.Frame).show();
			var more_button = jQuery(".fld_toolbar_more_button")[0];
			this.Frame.style.left = aa_absLeft(more_button) - Math.floor(this.Frame.offsetWidth/2) + "px";
			this.Frame.style.top = aa_absTop(more_button) +
				more_button.offsetHeight + "px";
			this.Frame.style.position = 'fixed';
		}
	},
	StudioPopupLocation: function (profile,data,context)
	{
		var dlg = context.vars._Dialog[0];
		dlg.FixDialogPosition = function(firstTime) 
		{
			jQuery(this.Frame).show();		// shows before moving so offsetHeight,offsetWidth are correct
			if (firstTime) {	//align to right
				this.Frame.style.right = "3px";//screen.width - jFrame.width() - 19 - 5 + "px";
				this.Frame.style.top = "52px";
				this.Frame.style.position = 'fixed';
			}
			var other_popup_class = aa_text(data,profile,'Popup',context) == 'properties' ? 'aa_studio_tree' : 'aa_studio_properties';
			var other_popup = jQuery("." + other_popup_class);
			if (other_popup.length)	{ // fix collisions
				var our_right = parseInt(this.Frame.style.right.split('px')[0]);
				var our_left = our_right + this.Frame.offsetWidth;
				var other_right = parseInt(other_popup[0].style.right.split('px')[0]);
				var other_left = other_right + other_popup[0].offsetWidth; 
				if (other_left >= our_right && other_right <= our_left)	{// collision, we move
					if (other_right > this.Frame.offsetWidth)
						this.Frame.style.right = "3px";	// there is room, so we go right
					else
						this.Frame.style.right = other_left + 5 + "px";	// no room, go left to other popup
				}
			}
		}
	},
	PopupTreeLocation: function (profile,data,context)
	{
		  var dlg = context.vars._Dialog[0];
		  dlg.FixDialogPosition = function(firstTime) 
		  {
			  var top = 40;
			  var left = 50;
			  var jPopup = jQuery(this.Frame);
			  
			  if (jQuery(".aa_inspect_popup").length > 0) {
				  var padding = aa_int(data,profile,'Padding',context);
				  var inspect_popup = jQuery(".aa_inspect_popup")[0];
				  jPopup.show();		// shows before moving so offsetHeight,offsetWidth are correct
				  var screen = ajaxart_screen_size();
				  var inspect_left = aa_absLeft(inspect_popup);
				  
				  if (inspect_left + inspect_popup.offsetWidth + this.Frame.offsetWidth + padding < screen.width)
					  left = inspect_left + inspect_popup.offsetWidth + padding + "px";
				  else
					  left = inspect_left - this.Frame.offsetWidth - padding + "px";
				  top = inspect_popup.style.top; 
			  }
			  this.Frame.style.top = top; 
			  this.Frame.style.left = left; 
			  this.Frame.style.position = 'fixed';
			  jPopup.show();		// shows before moving so offsetHeight,offsetWidth are correct
		  }
	},
	XtmlToJSon: function (profile,data,context)
	{
		var xtml = aa_first(data,profile,'Xtml',context);
		return [aa_xtml_to_json(xtml, "")];
	},
	PathToXtml: function (profile,data,context)
	{
		var path = aa_text(data,profile,'FieldPath',context);
		var xtml = aa_path_to_xtml(path,context);
		return xtml ? [xtml] : [];
	},
	XtmlToPath: function (profile,data,context)
	{
		var xtml = aa_first(data,profile,'Xtml',context);
		return [aa_xtml_to_path(xtml)];
	}
}
function aa_path_to_xtml(path,context) {
	var items = path.split("/");
	var page_id = items[0];
	if (!page_id) return null;
    var app_xtml = context.vars._BartContext[0].AppXtml[0] || context.vars._BartContext[0].AppXtml;
    page = aa_xpath(app_xtml,"../../Component[@id='" + page_id +"']/xtml")[0];
    if (!page) page = aa_xpath(app_xtml,"Pages/Page[@ID='" + page_id + "']")[0];
    if (!page) return null;
    var xpath = "";
    for (var i=1; i<items.length; i++) {
    	if (i>1)
    		xpath += "/";
    	xpath += "Field[@ID='" + items[i] + "']";
    }
    return xpath != "" ? aa_xpath(page,xpath)[0] : page;
}
function aa_xtml_to_path(xtml) {
	var path = "";
	for (current=xtml; current!=null; current=current.parentNode) {
		if (!current.getAttribute("ID")) return "";
		if (path != "")
			path = "/" + path;
		path = current.getAttribute("ID") + path;
		if (aa_tag(current) == 'xtml' || aa_tag(current) == 'Page') break;
	}
	return path;
}
function aa_xtml_to_json(element, indent, omit_tag)
{
	var by_tags = {};
	for (var child=element.firstChild; child!=null; child=child.nextSibling) {
		if (child.nodeType != 1) continue;
		var tag = aa_tag(child);
		if (by_tags[tag]) 	by_tags[tag].Count++;
		else				by_tags[tag] = {Count:1, Written:0};
	}
	var out = indent;
	if (!omit_tag) out += aa_tag(element) + ": ";
	out += "{ ";
	var first = true;
	for (var i=0; i<element.attributes.length; i++) {
		if (first) 	first = false;
		else		out += ", ";
		out += element.attributes[i].nodeName + ":" + '"' + element.attributes[i].nodeValue + '"';
	}
	if (element.getAttribute("t") == "xml.Xml" || element.getAttribute("t") == "ui.Html") {
		out += "\r" + indent + " ";
		return out + ', Xml: "' + ajaxart.xml.prettyPrint(ajaxart.childElem(element,"*"),"",true).replace('"','\"') + '" }';
	}
	for (var child=element.firstChild; child!=null; child=child.nextSibling) {
		if (child.nodeType == 1) {	// element
			if (first) 	first = false;
			else		out += ", ";
			out += "\r" + indent;
			var by_tag_obj = by_tags[aa_tag(child)];
			if (by_tag_obj.Count > 1 && by_tag_obj.Written == 0) out += aa_tag(child) + ": [ " + "\r";
			out += aa_xtml_to_json(child,indent + " ", by_tag_obj.Count > 1);
			by_tag_obj.Written++;
			if (by_tag_obj.Count > 1 && by_tag_obj.Written == by_tag_obj.Count) out += " ]";
		}
		if (child.nodeType == 4)	// cdata
			return out.substring(0,out.length-2) + '"' + child.nodeValue + '"';
	}
	out += " }";
	return out;
}
function aa_find_top_widget()
{
	var top_widget = jQuery(".gallery_runtime_screen");
	if (top_widget.length == 0) top_widget =  jQuery(".aa_preview");
	if (top_widget.length == 0) top_widget =  jQuery(".aa_widget");
	return top_widget;
}
//AA EndModule
//AA BeginModule
aa_gcs("jbart_wizards_dt", {
	HandleDataSourceChange: function(profile,data,context) 
	{
		var dataSourceUrl = aa_text(data,profile,'DataSourceUrl',context);
		if (dataSourceUrl == "") return [];
		jQuery('.feedback_image').attr("src","images/loading.gif").css("height","16px");
		var ondataarrived = function(result) {
			var results = jbart_data(result,'single');
			if (results && results.length>0 && !ajaxart.ishtml(results)) {
				jQuery('.feedback_image').attr("src","images/studio/yes.gif");
				ajaxart.run(results,profile,'OnSuccess',context);
			}
			else {
				jQuery('.feedback_image').attr("src","images/studio/failure.png").attr("title",result);
			}
		}
		jQuery.ajax({ type: 'POST', url: "get.php", cache: false, data: { contents: dataSourceUrl }, 
			success: ondataarrived, error: function() { jQuery('.fld_DataFeedback').text("loading failed") }
		});
	},
	GuessPathsFromXml: function (profile,data,context)
	{
	  var item = aa_first(data,profile,'Item',context);
	  var wizardData = aa_first(data,profile,'WizardData',context);
	  
	  if (!item || item.nodeType != 1 || wizardData.nodeType != 1) return;
	  var attrs = item.attributes;
	  for(var i=0;i<attrs.length;i++) {
		  var name = item.attributes.item(i).name.toLowerCase();
		  if (name == 'title' || name == "name") wizardData.setAttribute('title','%@'+item.attributes.item(i).name+'%');  
		  if (name == 'link' || name == 'path' ) wizardData.setAttribute('link','%@'+item.attributes.item(i).name+'%');  
		  if (name.indexOf('image') > -1 || name.indexOf('photo') > -1) wizardData.setAttribute('image','%@'+item.attributes.item(i).name+'%');  
		  if (name.indexOf('text') > -1 || name.indexOf('description') > -1) wizardData.setAttribute('extra_text','%@'+item.attributes.item(i).name+'%');  
	  }
	  var subelems = aa_xpath(item,'*');
	  for(var i=0;i<subelems.length;i++) {
		  var tag = subelems[i].tagName;
		  var name = tag.toLowerCase();
		  if (name == 'title' || name == "name") wizardData.setAttribute('title','%'+tag+'%');  
		  if (name == 'link' || name == 'path' ) wizardData.setAttribute('link','%'+tag+'%');  
		  if (name.indexOf('image') > -1 || name.indexOf('photo') > -1) wizardData.setAttribute('image','%'+tag+'%');  
		  if (name.indexOf('text') > -1 || name.indexOf('description') > -1) wizardData.setAttribute('extra_text','%'+tag+'%');  
	  }
	},
	eBayClean: function (profile,data,context)
	{
		var xml = aa_first(data,profile,'Xml',context);
		if (!xml) return [];
		xml = ajaxart.xml.clone([xml]);
		var items = aa_xpath(xml,'item');
		for(var i=0;i<items.length;i++) {
			var item = items[i];
			var desc = aa_totext(aa_xpath(item,'description'));
			var part1 = desc.split('src="')[1] || "";
			var image = part1.split('"')[0];
			if (image) {
				image = image.replace(/80.jpg/,'140.jpg');
				var text_node = item.ownerDocument.createTextNode(image);
				var image_node = item.ownerDocument.createElement('Image');
				image_node.appendChild(text_node);
				item.appendChild(image_node);
			}
			var price = aa_totext(aa_xpath(item,'CurrentPrice'));
			var dollars = price.substring(0,price.length-2);
			if (dollars=="") dollars="0";
			price = '$' + dollars +'.'+price.substring(price.length-2);
			
			var text_node = item.ownerDocument.createTextNode(price);
			var price_node = item.ownerDocument.createElement('Price');
			price_node.appendChild(text_node);
			item.appendChild(price_node);
		}
		
		return [xml];
	}
});
//AA EndModule

function ajaxart_firstlevel_fields(field) {
	var out = [];
	for(var i=0;i<field.Fields.length;i++) {
		var subfield = field.Fields[i];
		if (subfield.IsVirtualGroup)
			ajaxart.concat(out,ajaxart_firstlevel_fields(subfield));
		else
			out.push(subfield);
	}
	return out;
}
function bartdt_subfields(page,path)
{
  var out = [];
  if (! path ) path="";
  var fields = ajaxart.xml.xpath(page,'Field');
  for(var i=0;i<fields.length;i++) {
	  var field = fields[i];
	  var item = { Field: field };
	  var newpath = field.getAttribute('Path') || "";
	  if (path == "") item.Path = newpath;
	  else if (newpath == "") item.Path = path; 
	  else item.Path = path + "/" + newpath;
	  
	  ajaxart.concat(out,bartdt_subfields(field,item.Path));
	  
	  if (item.Field.getAttribute('t') == 'field.XmlField' ) 
	    out.push(item);
  }
  return out;
}
function bartdt_field_bypath(page,path)
{
  var fields = ajaxart.xml.xpath(page,'Field');
  for(var i=0;i<fields.length;i++) {
	  var field = fields[i];
	  if (field.getAttribute('Path')==path) return field;
	  if (field.getAttribute('t')=='field.XmlField') {
		  if (field.getAttribute('Path') == "") {
			  var tryfield = bartdt_field_bypath(field,path);
			  if (tryfield) return tryfield;
		  }
		  if (path.indexOf(field.getAttribute('Path')+"/") == 0 )
			  return bartdt_field_bypath(field,path.substring(path.indexOf('/'+1)));
	  }
  }
  return null;
}
bartdt_capture_box = null;
bartdt_captured_element = null;
function bartdt_inspect_element_ispage(el)
{
	if (! el.Cntr || !el.ajaxart || !el.ajaxart.params.vars._BartContext) return false;
	var page = bartdt_element_pageid(el);
	if (page == "" || page == "ItemList" || page == "runtime") return false;

	// old pages
	var pages = el.ajaxart.params.vars._BartContext[0].Pages;
	for(var i=0;i<pages.length;i++) {
	  if (pages[i].ID[0] == page) return true;	
	}
	// new pages
	var topXtml = el.ajaxart.params.vars._BartContext[0].AppXtml[0].parentNode.parentNode;
	if (aa_xpath(topXtml,"Component[@id='"+page+"']").length > 0 ) return true;
	
	return false;
}
function bartdt_element_pageid(el)
{
	var page = aa_totext(el.Cntr.ID);
	if (page.indexOf('__') == page.length-2) page = page.substring(0,page.length-2);  // remove ending __ (yaniv: do not know why I did that)  
	if (bartdt_capture_level == "sample" && page == "runtime") 
		return "";
	return page; 
	
//	var classes = el.className.split(' ');
//	for(var i=0;i<classes.length;i++)
//		if (classes[i].indexOf('Page_') == 0) {
//			var out = classes[i].substring(5); 
//			if (out.indexOf('_Details') == out.length-8) out = out.substring(0,out.length-8);
//			return out;
//		}
//	return "";
}
function bartdt_element_fieldid(el)
{
	if (!el) return "";
	var classes = el.className.split(' ');
	for(var i=0;i<classes.length;i++)
		if (classes[i].indexOf('fld_') == 0)
			return classes[i].substring(4);
	return "";
}
function bartdt_capture_mousemove(e)
{
    var el=(typeof event!=='undefined')? event.srcElement : e.target;    
    if (el.className == 'captureboxtext') {
    	bartdt_capture_box.remove();
    	bartdt_capture_box = null;
    	return true;
    }
    if (el.id == 'capturebox')
    	el = ajaxart_find_control_at_position(jQuery("body"), e)[0];
	// find el with context
//	if (bartdt_capture_level == "sample" && jQuery(el).parents('.Page_runtime').length == 0 && jQuery(el).parents('.aa_dialogcontents').length == 0 && jQuery(el).parents('.aa_preview').length == 0) return;
	jBart.studiobar.originalObjectWhenInspecting = // avoiding a tiny mouse move to cancel by mistake the 'going up' mode
		bartdt_capture_mousemove_find_parent(el, jBart.studiobar.originalObjectWhenInspecting);
 }
function bartdt_capture_mouseup(e) { return aa_stop_prop(e); return false; }
function bartdt_capture_mousedown(e) { return aa_stop_prop(e); return false; }
function bartdt_capture_mousewheel(event){	// taken from http://www.adomas.org/javascript-mouse-wheel/
    var delta = 0;
    if (!event) /* For IE. */
            event = window.event;
    if (event.wheelDelta) { /* IE/Opera. */
            delta = event.wheelDelta/120;
    } else if (event.detail) {
            delta = -event.detail/3;
    }
    if (delta > 0) {
		if (jBart.studiobar.objectWhenInspecting) 
			jBart.studiobar.parentObjectWhenInspecting(jBart.studiobar.objectWhenInspecting);
    }
//    if (event.preventDefault)
            event.preventDefault();
    event.returnValue = false;
}
function bartdt_capture_keydown(e)
{
	if (e.keyCode == 27) {
		bartdt_stop_capture();
		jQuery(bartdt_capture_box).hide();
		bartdt_captured_element = jQuery([]);
	}
	if (e.keyCode == 38) {	// arrow up
		if (jBart.studiobar.objectWhenInspecting)
			jBart.studiobar.parentObjectWhenInspecting(jBart.studiobar.objectWhenInspecting);
	}
	if (e.keyCode == 13) {	
		bartdt_capture_click();
	}
}
function bartdt_capture_click(e)
{
	if (!jBart.studiobar.objectWhenInspecting) return;
	bartdt_stop_capture();
	if (bartdt_capture_box) bartdt_capture_box.hide();
	
	jBart.studiobar.object = jBart.studiobar.objectWhenInspecting;
	var ctx = aa_ctx(jBart.studiobar.context,{_DomEvent: [e]}); 
	ajaxart.runComponent('bart_dt.OpenPropertiesWindow',[],ctx);
	ajaxart.runComponent('bart_dt.SynchTreePopup',[],ctx);
	
	jBart.studiobar.context = jBart.studiobar.objectWhenInspecting = null; // cleanup for memory leak
	
	jBart.studiobar.showObjectElements(jBart.studiobar.object);
	return aa_stop_prop(e);
}
function bartdt_stop_capture()
{
	jBart.studiobar.originalObjectWhenInspecting = null;
	aa_incapture = false;
	if (window.captureEvents){ // FF
		  window.captureEvents(Event.Click);
		  window.onclick=null;
		  window.onmousemove=null;
		  window.onkeydown=null;
		  window.onmouseup=null;
		  window.onmousedown=null;
		  window.onmousewheel=null
		  if (window.removeEventListener)
			   window.removeEventListener('DOMMouseScroll', bartdt_capture_mousewheel, false);
	    }
		else  // IE
		{
		  document.onclick=null;
		  document.onmousemove=null;
		  document.onkeydown=null;
		  document.onmousedown=null;
		  document.onmousewheel=null
		}
}
// jQuery(window).keydown(function(event) { 
// 	// ajaxart.log(event.keyCode + ' '  + event.altKey);
// 	if (event.keyCode == 83 && event.altKey) {	// Alt+S
// 		ajaxart.log("Alt+S","",true);
// 		if (!aa_studio_edit_mode.active)
// 			aa_studio_edit_mode.init();
// 		else
// 			aa_studio_edit_mode.exit();
// 	}
// });

function aa_isjbart()
{
  if (typeof(aa_jbart) == "undefined" || ! aa_jbart) return false;
  return true;
}
aa_field_dt_dual_options = null;

aa_gcs("jbart_studio", {
	EnterEditMode: function (profile,data,context)
	{
		aa_studio_edit_mode.init();
		context.vars._JBartStudio[0].EditMode = 'true';
	},
	ExitEditMode: function (profile,data,context)
	{
		aa_studio_edit_mode.exit();
		context.vars._JBartStudio[0].EditMode = '';
	},
	ToggleDesignTimeClass: function (profile,data,context)
	{
		var designTime = aa_bool(data,profile,'DesignTime',context);
		if (designTime) 
			jQuery('body').addClass('designtime');
		else 
			jQuery('body').removeClass('designtime');
	},
	AddStudioBackground: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx,item)
		{
			$(cell).addClass('aa__widget');
			aa_addOnAttach(cell, function() { $("body").addClass("studio_with_widget")} );
			aa_addOnDetach(cell, function() { 
				if ($('.aa__widget').length == 0)	// checking that widget is not attahced (sometimes detach call comes after attach)
					$("body").removeClass("studio_with_widget")} 
			);
		});
		return [];		
	},
	LeftPane: function (profile,data,context)
	{
		window.jbLeftPane = {
			Hidden: false,
			LeftPaneMode: aa_use_left_pane(),
			Init: function() {
				var cookieId = context.vars._WidgetXml[0].getAttribute("id") + "_selected_path";	// restoring last selected
				var path = ajaxart.cookies.valueFromCookie(cookieId);
				if (path && aa_use_left_pane()) {
					var xtml = aa_path_to_xtml(path,context);
					if (xtml)
						jBart.studiobar.object = jBart.studiobar.objectFromXtml(xtml);
				}
				aa_run_component("bart_dt.InspectSelectedObject",[],context);	// makr sure there is a selected obj
			},
			Control: function() {
				return ajaxart.runNativeHelper([this],profile,'Control',context);
			},
			ToggleLeftPaneUsage: function() {
				if (aa_use_left_pane()) {
					this.Hide();
					ajaxart.cookies.writeCookie('UseLeftPane','');
					this.LeftPaneMode = false;
				} else	{
					ajaxart.cookies.writeCookie('UseLeftPane','true');
					this.LeftPaneMode = true;
					this.Show();
				}
//				aa_refresh_field(['LeftPane'],'screen',false,null,context); 
			},
			Hide: function() {
				var jPane = $('.fld_LeftPane');
				var width = jPane.width();
				jPane.animate({ "margin-left": "-" + width + "px" }, 500, "swing");
				this.Hidden = true;
				aa_studio_edit_mode.clearSelectedMarks();	// the marks positions are no longer relevant
			},
			Show: function() {
				var jPane = $('.fld_LeftPane');
				jPane.parent().show();
				var jPane = $('.fld_LeftPane');
				jPane.css("margin-left","-" + jPane.width() + "px");
				jPane.animate({ "margin-left": "0px"}, 500, "swing");
				this.Hidden = false;
				aa_studio_edit_mode.clearSelectedMarks();	// the marks positions are no longer relevant
			},
			ShowSelectedObject: function() {
				aa_refresh_field(['LeftPane'],'screen',false,null,context);
				if (this.Hidden)
					this.Show();
				// Keep path in cookie for automatic restore
				var path = aa_xtml_to_path(jBart.studiobar.object.Xtml);
				if (context.vars._WidgetXml) { // alt-c
				  var cookieId = context.vars._WidgetXml[0].getAttribute("id") + "_selected_path";
				  ajaxart.cookies.writeCookie(cookieId,path);
				}
			}
		}
		return [ window.jbLeftPane ];
	}
});
function aa_left_pane() {
	return window.jbLeftPane;
}
function aa_use_left_pane() {
	return ajaxart.cookies.valueFromCookie('UseLeftPane') == 'true';
}
aa_gcs("bart_dt_compress", {
	DependentFunctions: function (profile,data,context)
	{
	  var code = aa_text(data,profile,'Code',context);
	  
	  var prefixes = [ 'aa_','ajaxart_','ajaxart.','ajaxart.xml.','ajaxart.cookies.', 'ajaxart.ui.','ajaxart.dialog.','ajaxart.yesno.','jBart.utils.',
	                    'jBart.db.', 'jBart.' ];
	  var out = [];
	  for (var t in prefixes) {
		  var prefix = prefixes[t];
		  var index=0, next, end, candidate;
		  while(true) {
			  next = code.indexOf(prefix,index);
			  if (next == -1) break;
			  end = code.indexOf("(",next);
			  if (end == -1) break;
			  var funcName = code.substring(next+prefix.length,end);
			  if (funcName.match(/^[a-zA-Z0-9_]+$/))
				  out.push(prefix + funcName);
			  index = next + prefix.length;
		  }
	  }
	  return out;
	},
	JSMinCompress: function (profile,data,context)
	{
		var script = aa_text(data,profile,'Script',context);
		var level = aa_text(data,profile,'Level',context);
		var comments = aa_text(data,profile,'Comments',context);
		
		var level_int = 2;
		if (level == "minimal") level_int=1;
		else if (level == "conservative") level_int=2;
		else if (level == "agressive") level_int=3;
		
		try {
			var out = jsmin(comments,script,level_int);
			if (out) return [out];
			else return [];
		} catch(e) {
			ajaxart.log('error in js compression '+e.message || e,'error');
			return [script];
		}
	},
	FindAllPts: function (profile,data,context)
	{
		var xml = aa_first(data,profile,'Xtml',context);
		var black_list = "," + aa_text(data,profile,'BlackList',context) + ",";
		var jsInXtml = context.vars.JsInComponents && context.vars.JsInComponents[0];
		
		var out = [];
		if (xml == null || xml.nodeType != 1) return [];
		function fill(xml) {
			if (jsInXtml && xml.nodeType == 1) { // fill in js in xtml
				var js = xml.getAttribute('Javascript') || xml.getAttribute('Code') || aa_cdata_value(aa_xpath(xml,"Javascript")[0]) || aa_cdata_value(aa_xpath(xml,"Code")[0]);
				if (js && js.indexOf('%') != 0) {
					jsInXtml.JSSnippets = jsInXtml.JSSnippets || {};
					jsInXtml.JSSnippets[js] = true;
				}
			}
			var pt = xml.getAttribute('t')
			if (pt && black_list.indexOf("," + pt + ",") == -1) out.push(pt);
			for(var child = xml.firstChild;child;child = child.nextSibling)
				if (child.nodeType == 1) 
					fill(child);
		}
		fill(xml);
		return out;
	},
	CodeSnippets: function (profile,data,context)
	{
		var out = [];
		var jsInXtml = aa_first(data,profile,'JsInComponents',context);
		if (!jsInXtml || !jsInXtml.JSSnippets) return out;
		for(var prop in jsInXtml.JSSnippets) {
			if (jsInXtml.JSSnippets[prop] == true) out.push(prop);
		}
		return out;
	},
	CompressComponent: function (profile,data,context)
	{
		var comp = aa_first(data,profile,'Component',context);
		var out = aa_createElement(comp, 'C');
		out.setAttribute("id", comp.getAttribute("id"));
		if (comp.getAttribute("execution"))
			out.setAttribute("execution", comp.getAttribute("execution"));
		
		for (var elem = comp.firstChild; elem != null; elem=elem.nextSibling ) {
    		if (elem.nodeType == 1) {
    			if (aa_tag(elem) != 'Param')
    				out.appendChild(aa_importNode(elem,out));
    			else {	// Param
    				var param = aa_createElement(out, 'Param');
    				param.setAttribute("name", elem.getAttribute("name"));
    				if (elem.getAttribute("script"))
        				param.setAttribute("script", elem.getAttribute("script"));
    				var defaultVal = ajaxart.childElem(elem,"Default");
    				if (defaultVal != null)
        				param.appendChild(aa_importNode(defaultVal,param));
    				out.appendChild(param);
    			}
    		}
		}
		return [out];
	},
	FunctionDefinition: function (profile,data,context) {
		var name = aa_text(data,profile,'Name',context);
		var func = '';
		try {
			func = '' + eval(name);
		}
		catch (e) {}
		return [func];
	},
	ContentOfGC: function(profile,data,context) {
		var id = ajaxart.totext_array(data);
		var middlePos = id.indexOf('.');
		var ns = id.substring(0,middlePos);
		var compName = id.substr(middlePos+1)
		var content;
		if (ajaxart.gcs[ns] && ajaxart.gcs[ns][compName])
			return [compName + ":" + ajaxart.gcs[ns][compName]];
		else
			return [''];
	},
	JsFunctionCode: function(profile,data,context) {
		var funcName = ajaxart.totext_array(data);
		if (funcName.indexOf('.') == -1) {
			var func_str = '' + window[funcName];
			if (func_str.indexOf('function (') == 0)
				return ['function ' + funcName + ' ' + func_str.substring(8)];
		    else
		        return [func_str];
		}
		else
		    return [funcName + ' = ' + eval(funcName)];
	}
});

aa_gcs("addfield_dt",{
	ParentXtml: function(data,profile,context)
	{
		jbartstudio_ensure_object(context);
		var xtml = jBart.studiobar.object && jBart.studiobar.object.Xtml;
		if (!xtml) return [];
		if (!jbartstudio_is_group(xtml)) xtml = xtml.parentNode;
		return [xtml];
	}
});

aa_gcs("fieldgenerator_dt",{
	SuggestFieldsFromSampleData: function(profile,data,context)
	{
		var out = [];
		var sampleData = aa_first(data,profile,'SampleData',context);
		if (!sampleData) return;
		var itemListTagsAdded = {};
		
		if (sampleData.nodeType == 1) { // xml
			for (var i=0; i<sampleData.attributes.length; i++) {
				var attr = sampleData.attributes.item(i).name;
				addSuggestion({ id: attr, path: '@'+attr, sample: sampleData.getAttribute(attr) });
			}
			for(var child=sampleData.firstChild;child;child=child.nextSibling) {
				if (child.nodeType != 1) continue;
				if (isPrimitiveElement(child))
					addSuggestion({ id: child.tagName, path: child.tagName , sample: jQuery(child).text() });
				else if (isItemList(child)) {
					if (!itemListTagsAdded[child.tagName])
					  addSuggestion({ id: child.tagName, path: child.tagName, isItemlist: true });
					itemListTagsAdded[child.tagName] = true;
				} else
					addSuggestion({ id: child.tagName, path: child.tagName, isSection: true });
			}
		}
		return out;
		
		function isItemList(element) {
			var siblingsWithSameTag = aa_xpath(sampleData,element.tagName);
			return siblingsWithSameTag.length > 1;
		}
		function isPrimitiveElement(element) {
			return jQuery(element).text().trim() != '';
		}
		function addSuggestion(settings) {
			settings.title = settings.title || aa_capitalize_each_word(settings.id.replace(/_/g,' '));
			settings.isSection = settings.isSection ? 'true' : 'false';
			settings.sample = settings.sample || '';
			if (!settings.type) {
				var id1 = settings.id.toLowerCase();
				if (hasInnerText(id1,['image','photo','simg'])) settings.type = 'image';
				if (hasInnerText(settings.sample,['.jpg','.png','.gif'])) settings.type = 'image';
				
				settings.type = settings.type || 'text';
			}
						
			out.push(settings);
		}
		function hasInnerText(str,arr) {
			for(var i=0;i<arr.length;i++)
				if (str.indexOf(arr[i]) > -1) return true;
			return false;
		}
	}
});
function bartdt_capture_mousemove_find_parent(el, object_not_to_select)
{
	var object = jBart.studiobar.objectFromElement(el);
	
	if (object && object_not_to_select && object.Elements[0] == object_not_to_select.Elements[0]) return object_not_to_select;// avoiding a tiny mouse move to cancel by mistake the 'going up' mode
	jBart.studiobar.objectWhenInspecting = object;
	if (!object) {
		if (bartdt_capture_box)
			bartdt_capture_box.hide();
		return;
	}

	if (bartdt_capture_box == null)
	{
		bartdt_capture_box = jQuery('<div class="capturebox" ><div class="top"> <div class="captureboxtext"></div> </div><div class="right"/><div class="bottom"/><div class="left"/></div>');
		bartdt_capture_box.appendTo("body");
	}

	jQuery(bartdt_capture_box).find(".captureboxtext").html(object.Title);
	
	var capturedElement = object.Elements[0];
	
	// var elem_pos = {x:aa_absLeft(capturedElement), y:aa_absTop(capturedElement)};
	var offset = jQuery(capturedElement).offset();
	var elem_pos = {x: offset.left, y: offset.top };
	var width = jQuery(capturedElement).outerWidth();
	var height = jQuery(capturedElement).outerHeight();
	jQuery(bartdt_capture_box).find(".top").css("left",elem_pos.x-2).css("top",elem_pos.y-3).width(width+5);
	jQuery(bartdt_capture_box).find(".bottom").css("left",elem_pos.x-2).css("top",elem_pos.y + height).width(width+5);
	jQuery(bartdt_capture_box).find(".left").css("left",elem_pos.x-3).css("top",elem_pos.y-2).height(height+5);
	jQuery(bartdt_capture_box).find(".right").css("left",elem_pos.x + width).css("top",elem_pos.y-2).height(height+5);

	bartdt_capture_box.show();
	return object;
}
jBart.studiobar.pageId2pageXtml = function(pageID)
{
	if (pageID == "" || pageID == "ItemList" || pageID == "runtime") return null;
	if (!jBart.studiobar.context.vars._WidgetXml) return '';
	
	// old pages
	var widget_xml = jBart.studiobar.context.vars._WidgetXml[0];
	var bartdev = aa_xpath(widget_xml,"bart_dev")[0] || widget_xml;
	var result = aa_xpath(bartdev,"db/bart_unit/bart_unit/Component[@id='"+pageID+"']/xtml");	// new pages
	if (result.length > 0) return result[0];
	result = aa_xpath(bartdev,"db/bart_unit/bart_unit/Page[@id='"+pageID+"']");	// old pages
	if (result.length > 0) return result[0];
	return null;
}
jBart.studiobar.isXtmlInWidget = function(xtml)
{
	if (!xtml) return false;
	var iter = (xtml.nodeType == 2) ? aa_xpath(xtml,'..')[0] : xtml;
	for(;iter && iter.nodeType == 1;iter = iter.parentNode) {
		if (iter.tagName && iter.tagName == 'bart_sample' && iter.getAttribute('_type') == 'bart_sample') return true;
		if (iter.tagName && iter.tagName == 'jbart_project' && iter.getAttribute('_type') == 'jbart_project') return true;
		if (iter.tagName && iter.tagName == 'bart_dev' && iter.getAttribute('id') != 'bartgallery') return true;
	}
	return false;
}
jBart.studiobar.objectFromXtml = function(xtml)
{
	var object = { Xtml: xtml}
	if (xtml && xtml.nodeType == 1 && xtml.tagName == 'Field') {
		object.Elements = jBart.studiobar.ElementsFromXtml(xtml);

		if (object.Elements[0]) {
			object.Field = object.Elements[0].Field;
			object.Title = object.Field && object.Field.Title;
			object.Data = object.Elements[0].Data || object.Elements[0].FieldData;
		}
	}
	jBart.studiobar._addRefreshMethod(object);
	return object;
}
jBart.studiobar.ElementsFromXtml = function(xtml)
{
	var id = xtml.getAttribute('ID');
	if (!id) return [];
	var elems = jQuery('.fld_'+id);
	var elements = [];
	for(var i=0;i<elems.length;i++) {
		try {
		  if (elems[i] && elems[i].Field && elems[i].Field.XtmlSource && elems[i].Field.XtmlSource[0].script == xtml)
			  elements.push(elems[i]);
		  else if (elems[i] && elems[i].ajaxart && elems[i].ajaxart.script == xtml)
			  elements.push(elems[i]);
		} catch(e) {}
	}
	if (!elements.length && (xtml.parentNode && xtml.parentNode.getAttribute("type") == "jbart.MyWidgetPage")
			|| aa_tag(xtml) == 'Page') {
		elems = jQuery('.Page_'+ id);
		for(var i=0;i<elems.length;i++)
			elements.push(elems[i]);
	}
		
	return elements;
}
jBart.studiobar._addRefreshMethod = function(object)
{
	object.Refresh = function(data,ctx) {
		var xtml = this.Xtml;
		if (ctx.vars.RefreshParent && ctx.vars.RefreshParent[0] == "true")
			xtml = xtml.parentNode;
//		if (!this.Elements) return;
		var timeLimit = 30;
		var action_id = 'StudioRefresh ' + xtml.getAttribute("id");
		aa_cancel_delayed_action(action_id);
		var elems = jBart.studiobar.ElementsFromXtml(xtml);
		if (elems.length==0) {	// go up in xtml until finding element
			for (var cur_xtml = xtml; !elems.length && cur_xtml && aa_tag(cur_xtml) != 'Component'; cur_xtml=cur_xtml.parentNode)
				elems = jBart.studiobar.ElementsFromXtml(cur_xtml);
		}
		if (elems.length==0 && xtml.getAttribute("ID"))
			elems = jQuery(".fld_" + xtml.getAttribute("ID"));	// huristic: take the first occurrence, when no elem
		if (elems.length==0 && jBart.studiobar.context) {
			jBart.studiobar.context.vars._BartDevDtContext[0].Refresh([],jBart.studiobar.context);
			return;
		}
		if (elems[0] && elems[0].Field) {
			function refresh_elems(start_from,elems) {
				var startTime = new Date().getTime();
				for (var i=start_from; i<elems.length; i++) {
					if ((new Date().getTime() - startTime) > timeLimit) { // continue async
						aa_run_delayed_action(action_id,function() { refresh_elems(i,elems); });
						return;
					}
					elem = elems[i];
					if (elem.Field) {
						if (elem.Field.XtmlSource) {
							var xtmlSource = elem.Field.XtmlSource[0];
							var newField = aa_first(xtmlSource.input,xtmlSource.script,'',xtmlSource.context);
							newField.counter = ++ajaxart.unique_number;
							if (newField) {
								var td = jQuery(elem).hasClass('aa_cell_element') ? elem : jQuery(elem).parents('.aa_cell_element')[0];
								if (td && td.Field == elem.Field) td.Field = newField;
								elem.Field = newField;
							}
						}
						var elemContext = elem.jbContext;
						if (!elemContext && elem.parentNode) elemContext = elem.parentNode.jbContext;
						
						if (elemContext) aa_refresh_cell(elem,elemContext);
					}
				}				
			}
			refresh_elems(0,elems);
		}
		else if (elems[0] && elems[0].Cntr && elems[0].ajaxart)	// Xtml is a container and not a field
			object.Elements = [jBart.utils.refresh(elems[0])];
//		else if (elems.length>0) {	// Heuristic: take the first elem and find its parent container
//			var elem = elems[0];
//			var parents = jQuery(elem).parents('.aa_container').get();
//			parents = [elem].concat(parents);	// including ourself
//			for(var i=0;i<parents.length;i++) {
//				var cntrElem = parents[i];
//				if (cntrElem && cntrElem.ajaxart) {
//					jBart.utils.refresh(cntrElem);
//					return;
//				}
//			}
//		}
	}
}
// objectFromElement should work for the following elements:
// page ,group, multiple group, table cell, table title, property sheet title, property sheet value, operation, field control 
jBart.studiobar.objectFromElement = function(element)
{
	for(var el=element;el && el.nodeType == 1;el = el.parentNode)
	{
		var object = { isObject: true, Elements: [el], Field: el.Field };
		jBart.studiobar._addRefreshMethod(object);
		
		if (el.Field && el.Field.XtmlSource) {
			object.Field = el.Field; 
			object.Xtml = el.Field.XtmlSource[0].script;
			var xtmlInWidget = jBart.studiobar.isXtmlInWidget(object.Xtml);
			if ((bartdt_capture_level != "infra" && !xtmlInWidget) || (bartdt_capture_level == "infra" && xtmlInWidget)) continue;
			if (object.Xtml.nodeType == 1 && object.Xtml.getAttribute('t') == 'field.AddFieldsHere') continue;
			
			object.Data = el.Data || el.FieldData;
			object.Title = el.Field.Title;
			
			return object;
		}
		if (el.Cntr) {
			var pageID = aa_totext(el.Cntr.ID);
			if (pageID.indexOf('__') == pageID.length-2) pageID= pageID.substring(0,pageID.length-2);  

			object.Xtml = jBart.studiobar.pageId2pageXtml(pageID);
			if (!object.Xtml) continue;

			var xtmlInWidget = jBart.studiobar.isXtmlInWidget(object.Xtml);
			if ((bartdt_capture_level != "infra" && !xtmlInWidget) || (bartdt_capture_level == "infra" && xtmlInWidget)) continue;
			
			object.Data = el.Cntr.Items.Items;
			object.Title = 'Page ' + pageID;
			return object;
		}
		if (jQuery(el).hasClass('aa_operation')) {
			object.Xtml = el.ajaxart.data[0].XtmlSource[0].script
			var xtmlInWidget = jBart.studiobar.isXtmlInWidget(object.Xtml);
			if ((bartdt_capture_level != "infra" && !xtmlInWidget) || (bartdt_capture_level == "infra" && xtmlInWidget)) continue;
			
			object.Data = [];
			object.Title = el.ajaxart.data[0].Id;
			return object;
		}
	}
	return null;
}

jBart.studiobar.showObjectElements = function(object)
{
	jQuery('.jbstudio_constant_selected_box').css('display','none');
	
	var noConstantIndication = ajaxart.cookies.valueFromCookie('jbstudio_indication') == 'hide';
	var constantIndication = !noConstantIndication;
	
	if (constantIndication) {
		var box = jQuery.find('.jbstudio_constant_selected_box')[0];
		if (!box) {
			box = jQuery('<div class="jbstudio_constant_selected_box"><div class="line top"/><div class="line left"/><div class="line bottom"/><div class="line right"/><div class="corner topleft"/><div class="corner topright"/><div class="corner bottomleft"/><div class="corner bottomright"/></div>')[0];
			jQuery(box).find('>div').css('position','absolute');
			document.body.appendChild(box);
		}
		var jBox = jQuery(box);
		jBox.css('display','none');
		var elem = object && object.Elements && object.Elements[0];
		if (!elem) return;
		var x = aa_absLeft(elem), y = aa_absTop(elem), height = jQuery(elem).outerHeight(), width = jQuery(elem).outerWidth();
		var padding = 1; 
		x -= padding+1;y-= padding+1; width += padding*2+1; height += padding*2+1;
		
		jBox.css('left',x).css('top',y).height(height).width(width);

		jBox.find('.left').css('left',x).css('top',y).height(height);
		jBox.find('.right').css('left',x+width).css('top',y).height(height);
		jBox.find('.top').css('left',x).css('top',y).width(width);
		jBox.find('.bottom').css('left',x).css('top',y+height).width(width);

		var corderdiff = 2;

		jBox.find('.topleft').css('left',x-corderdiff).css('top',y-corderdiff);
		jBox.find('.topright').css('left',x+width-corderdiff).css('top',y-corderdiff);
		jBox.find('.bottomleft').css('left',x-corderdiff).css('top',y+height-corderdiff);
		jBox.find('.bottomright').css('left',x+width-corderdiff).css('top',y+height-corderdiff);
		
		jBox.css('display','block');
		
		return;
	}

	var boxes = jQuery('<div class="jbstudio_show_objects" />');
	if (!object || !object.Elements) return;
	
	for(var i=0;i<object.Elements.length;i++) {
		var box = jQuery('<div class="jbstudio_show_object"/>');
		var elem = object.Elements[i];
		
		var elem_pos = { x: aa_absLeft(elem), y: aa_absTop(elem)};
		box.css('position','absolute').css('left',elem_pos.x).css('top',elem_pos.y).width(jQuery(elem).outerWidth()).height(jQuery(elem).outerHeight());
		
		boxes.append(box);
	}

	boxes.fadeTo('1000',0.5,function() {
		boxes.fadeTo('1000',0,function() {
			boxes.remove();
		});
	});
	
	jQuery('body').append(boxes);
}

jBart.studiobar.parentObjectWhenInspecting = function(currentObject)
{
	var elem = currentObject.Elements[0];
	while (elem) {
		var object = jBart.studiobar.objectFromElement(elem);
		if (!object) return;
		if (object.Xtml != currentObject.Xtml) {
			bartdt_capture_mousemove_find_parent(elem);
			return;
		}
		elem = elem.parentNode;
	}
}

function jbartstudio_ensure_object(context)
{
	if (jBart.studiobar.object) return;
	var appXtml = context.vars._BartContext[0].AppXtml;
	var mainPage = aa_xpath(appXtml,"../../Component[@id='main']/xtml")[0];
	if (mainPage) {
		jBart.studiobar.object = { Xtml: mainPage };
	}
}

function jbartstudio_is_group(xtml)
{
  var t = xtml.getAttribute('t');
  var pt = aa_component_definition(t);
  if (pt && aa_xpath(pt,"Param[@name='Field']")[0]) return true;
  if (pt && aa_xpath(pt,"Param[@name='Fields']")[0]) return true;
 
  return false;
}
aa_gcs("jbart_studio", {
	JBartStudioObject: function (profile,data,context)
	{
	  var studioObject = ajaxart.runNativeHelper(data,profile,'Object',context)[0];
	  var UseJBartDB = studioObject.UseJBartDB = (window.CloudJBartStudio) ? 'true' : ajaxart.urlparam('jbartdb') == 'true';
	  var ContentType = studioObject.ContentType = ajaxart.urlparam('contenttype') || 'jbart_project'; // 'bart_sample'
	  studioObject.BaseUrl = studioObject.UseJBartDB ? '//jbartdb.appspot.com/bart.php' : 'bartdev.php'; 

	  studioObject.LoadUserID = function(data1,ctx)
	  {
		  if (window.location.href.indexOf('artwaresoft.com') > -1) {
			  ajaxart_async_Mark(ctx);
			  jQuery.ajax({ 
				  url: 'User' ,
				  success: function(result) {
				  	if (result.nodeType == 9) result = result.firstChild;
				  	studioObject.User = jQuery(result).text();
				  	ajaxart_async_CallBack([],ctx);
			  	  },
				  error: function() {
					  ajaxart_async_CallBack([],ctx);					  
				  }
			  });
		  } else {
			  studioObject.User = ajaxart.cookies.valueFromCookie('jbart_studio_user');
		  }
	  }
	  studioObject.SignOut = function(data1,ctx) {
		  ajaxart.cookies.writeCookie('jbart_studio_user','');		  
		  if (window.location.href.indexOf('artwaresoft.com') > -1) {
			  var currUrl = window.location.href;
			  window.location.href = 'http://buss-art.appspot.com/_ah/openid_logout?continue=' + currUrl;
		  } else {
			  document.location.reload(true);
		  }
	  }
	  studioObject.CloneCurrentProject = function(data1,ctx)
	  {
		  studioObject.NodeToClone = studioObject.Project;
		  studioObject.CloneCounter = 0;
		  studioObject.BaseNameForClone = studioObject.BaseDisplayNameForClone = '';
		  
		  studioObject._AllocateCloneID();
	  }
	  studioObject._JSLoadProject = function(gsettings) {
		  var settings = {};
		  settings.success = function(result) {
			  if (result.nodeType == 9) result = result.firstChild;
			  if (result.getAttribute('_type') != ContentType) {
				  gsettings.error();
				  return;
			  }
			  gsettings.success(result);
		  }
		  settings.error = function() {
			  gsettings.error();
		  }
		  if (UseJBartDB) { 
			  settings.contentType = ContentType;
			  settings.id = gsettings.id;
			  jBart.db.get(settings);
		  } else {
  			  settings.cache = false;
			  settings.type = "GET";
			  settings.url = "bartdev.php?op=loadnode&contenttype=" + ContentType +"&id=" + gsettings.id;
			  jQuery.ajax(settings);
		  }
		  
	  }
	  studioObject.ClonePrototype = function(data1,ctx)
	  {
		  studioObject.NodeToClone = null;
		  studioObject.CloneCounter = 0;
		  
		  studioObject.BaseNameForClone = '';
//		  if (! studioObject.UseJBartDB) {
			  studioObject.BaseDisplayNameForClone = prompt("Select a name for your new project (localhost only)", "");
			  studioObject.BaseNameForClone = aa_string2id(studioObject.BaseDisplayNameForClone); 
//		  }
		  studioObject.ShowProgressIndicator([{ Text: 'Creating a new widget - loading prototype' , Status: 'info' }],context);
		  
		  studioObject._JSLoadProject({
			  id: jQuery(data1).attr('id'),
			  success: function(result) {
				  studioObject.NodeToClone = result;
				  studioObject.ShowProgressIndicator([{ Text: 'Creating a new widget - allocating widget id' , Status: 'info' }],context);
				  studioObject._AllocateCloneID();
		  	  },
		  	  error: function() {
		  	  	  studioObject.NodeToClone = jBart.parsexml('<jbart_project _type="jbart_project" id="sample" name="sample" modifiedDate="31/01/2011 10:37" dateCreated="16/01/2011 15:28" vid="6" type="widget" image="" description="" _wusers=""><bart_dev><db><bart_unit><bart_unit id="sample" _type="bart_unit" ns="sample"><Component id="App" type="bart.Application"><xtml t="bart.Application"><MainPage1 t="sample.main"/><Resources t="bart_resource.Resources"><Resource t="jbart_resource.Data" ResourceID="Data" ValueType="xml"><Value><![CDATA[<xml/>]]></Value></Resource></Resources><StyleGuide t="style_guide.JBart"/></xtml></Component><Component id="main" type="jbart.MyWidgetPage"><xtml t="control.Layout" ID="x" Title="x"><Layout t="layout.Default"/><Field t="control.Button" ID="My_First_Button" Title="My First Button"><Style t="btn.JBart"/></Field></xtml></Component><UIPref/></bart_unit></bart_unit></db></bart_dev><url url="?pagedt_path=x?studio_style_tabs_tab=Css"/></jbart_project>');
				  studioObject.ShowProgressIndicator([{ Text: 'Creating a new widget - allocating widget id' , Status: 'info' }],context);
				  studioObject._AllocateCloneID();
				  //alert('could not create a new project');
		  	  }
		  });
	  }
	  studioObject._AllocateCloneID = function() {
		  if (!studioObject.BaseNameForClone) {
			  if (studioObject.User) 
				  studioObject.BaseNameForClone = studioObject.User + '_';
			  else
				  studioObject.BaseNameForClone = '';
			  
			  studioObject.BaseNameForClone += jQuery(studioObject.NodeToClone).attr('id') + Math.floor(Math.random()*100);
		  }

		  if (studioObject.CloneCounter == 10) {
			  alert('could not create a new project');
			  return;
		  }
		  studioObject.CloneCounter++;
		  var id = studioObject.BaseNameForClone;
		  if (studioObject.CloneCounter > 1) id += studioObject.CloneCounter;

		  var settings = {};
		  settings.success = function(result) {
			  if (result.nodeType == 9) result = result.firstChild;
			  if (result.getAttribute('reason') == 'node does not exist') {
				  availableIDFound();
			  } else {
				  studioObject._AllocateCloneID();
			  }
		  }
		  settings.error = function(err) {
			  if (err.code == 'node does not exist') {
				  availableIDFound();
			  } else
				  alert('could not create a new project');
		  }
		  if (UseJBartDB) { 
			  settings.contentType = ContentType;
			  settings.id = id;
			  jBart.db.get(settings);
		  } else {
  			  settings.cache = false;
			  settings.type = "GET";
			  settings.url = "bartdev.php?op=loadnode&contenttype=" + ContentType +"&id=" + id;
			  jQuery.ajax(settings);
		  }
		  
		  function availableIDFound() 
		  {
			  studioObject.ProjectID = id;
			  studioObject.Project = studioObject.NodeToClone;
			  var jProject = jQuery(studioObject.Project); 
			  jProject.attr('vid','1').attr('id',id).attr('type','widget').attr('_wusers','');
			  if (UseJBartDB)
			    jProject.attr('name','my ' + jProject.attr('name'));
			  else 
			    jProject.attr('name',studioObject.BaseDisplayNameForClone || studioObject.BaseNameForClone);
			  
			  studioObject.ShowProgressIndicator([{ Text: 'Creating a new widget - saving new widget' , Status: 'info' }],context);
			  
			  studioObject._SaveClone();
		  }
	  }
	  studioObject._SaveClone = function() {
		  var settings = {};
		  settings.success = function(result) {
			  studioObject.ShowProgressIndicator([],context);
			  studioObject._AddProjectToMyProjects(data,context);
			  studioObject.EditProject([studioObject.ProjectID],context);
		  }
		  settings.error = function(result) {
			  studioObject.ShowProgressIndicator([],context);
			  var reason = (result && result.getAttribute('reason')) || '';
			  alert(reason + (reason ? '. ' : '') + 'Could not save the new project');
		  }
		  if (UseJBartDB) { 
			  	settings.data = studioObject.Project;
				jBart.db.save(settings);
		  } else {	// file system
			settings.cache = false;
			settings.type = "POST";
			settings.contentType = "application/x-www-form-urlencoded; charset=UTF-8";
			settings.url = "bartdev.php?op=savenode";
			settings.data = ajaxart.xml2text(studioObject.Project);
			settings.httpHeaders = [];
		    jQuery.ajax(settings);
		  }
	  }
	  studioObject.ShowProjectPreview = function(data1,ctx) {
		  var id = aa_totext(data1);
		  var out = jQuery('<div>Loading Widget...</div>')[0];
		  if (this.Projects && this.Projects.length >0) {
			  for(var i=0;i<this.Projects.length;i++)
				  if (this.Projects.getAttribute('id') == id)
					  showPreview(this.Projects[i]);
		  } else {
			  studioObject._JSLoadProject({ id: id, success: showPreview, error: showPreview }); 
			  
			  return [out];
		  }
		  function showPreview(projectXml) {
			  var control = projectXml && studioObject._ShowProjectForPreview([projectXml],ctx)[0];
			  if (control) {
				  out.removeChild(out.firstChild);
				  out.appendChild(control);
				  aa_element_attached(control);
			  } else {
				  out.innerHTML = 'Could not show widget preview'; 
			  }
		  }
		  return [out];
	  } 
	  studioObject.OpenProjectInNewTab = function(data1,ctx) {
		  var projectID = aa_totext(data1);
		  var newurl = window.location.href.split('#')[0] + '#?project=' + projectID;
		  window.open(newurl,'_blank');
	  }
	  studioObject.UploadProject = function(data1,ctx)
	  {
		  var id = aa_totext(data1);
		  if (!id) return;
		  ajaxart_async_Mark(ctx);
		  studioObject._JSLoadProject({
			  id: id,
			  success: function(result) {
			      var ctx2 = aa_ctx(ctx,{ _Project: [result]});
			      var profile = jBart.parsexml('<Xtml t="jbart_studio.ProjectWithJBartSources" Project="%$_Project%" />')
			      var resultWithJS = aa_first([],profile,'',ctx2);
			      resultWithJS.setAttribute('_vid','force');
			      jBart.db.save({
			    	  data: resultWithJS,
			    	  success: function() {
			    	  	ajaxart_async_CallBack([],ctx);
			      	  },
			    	  error: function() {
			      		ajaxart.log('could not upload ' + id,'error');
			      		ajaxart_async_CallBack([],ctx);
			      	  }
			      });
		  	  },
		  	  error: function() {
		      		ajaxart.log('could not upload ' + id,'error');
		    	  	ajaxart_async_CallBack([],ctx);
		  	  }
		  });
	  }
		  
	  return [studioObject];
	},
	RefreshBrowserTitle: function (profile,data,context)
	{
		var studioObject = context.vars._JBartStudio[0];
	    var projectXml = studioObject.Project;
	    var title = 'JBart Studio';
	    if (projectXml && projectXml.getAttribute('name') ) 
	    	title += ' - ' + projectXml.getAttribute('name');
	  
	    document.title = title;
	},
	PromotedProjects: function (profile,data,context)
	{
		var type = aa_text(data,profile,'Type',context);
		if (type == 'features') return jBart.promotedFeatureHeaders;
		if (type == 'widgets') return jBart.promotedProjectHeaders;
		if (type == 'prototypes') return jBart.projectPrototypeHeaders;
		
		if (type == 'all') {
			var out = [];
			ajaxart.concat( out , jBart.projectPrototypeHeaders );
			ajaxart.concat( out , jBart.promotedProjectHeaders );
			ajaxart.concat( out , jBart.promotedFeatureHeaders );
			return out;
		}
		
		return jBart.promotedProjectHeaders;		
	},
	IsInArtwaresoft: function (profile,data,context)
	{
//		return ['true'];
		if (window.location.href.indexOf('artwaresoft.com') > -1) return ['true'];
	},
	DoSignup: function (profile,data,context)
	{
	  var userData = aa_first(data,profile,'UserData',context);
	  var studioObject = context.vars._JBartStudio[0];
	  
	  var settings = { cache: false, type: "POST", contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	    data: { userdata: ajaxart.xml2text(userData) },
	    httpHeaders: [],
	    url: studioObject.BaseUrl + '?op=signup'
	  }
	  settings.success = function(result) {
		  if (result.nodeType == 9) result = result.firstChild;
		  if (result.getAttribute('type')=='failure') {
			  context.vars._AsyncCallback.success = false;
			  ajaxart.run([result.getAttribute('reason')],profile,'OnFailure',context);
		  } else {
			  ajaxart.run(userData,profile,'OnSuccess',context);
		  }		  
		  ajaxart_async_CallBack([],context);
	  }
	  settings.error = function() {
		  context.vars._AsyncCallback.success = false;
		  ajaxart.run(['no connection'],profile,'OnFailure',context);
		  ajaxart_async_CallBack([],context);
	  }
	  ajaxart_async_Mark(context);
	  jQuery.ajax(settings);
	},
	MyWidgets: function (profile,data,context)
	{
	  var studioObject = context.vars._JBartStudio[0];
	  if (studioObject.User) {
		  return ajaxart.runNativeHelper(data,profile,'InUser',context);
	  } else {
		  // cookie
		  var result = ajaxart.cookies.valueFromCookie('bartstudio_mywidgets');
		  var out = ajaxart.parsexml('<MyWidgets />');
		  try {
			  if (result) {
				  eval('var mywidgets = ' + result);
				  for(var i=0;i<mywidgets.length;i++) {
					  var projXml = jQuery('<project />').attr('id',mywidgets[i].id).attr('name',mywidgets[i].name).attr('relation',mywidgets[i].relation)[0];
					  ajaxart.xml.append(out,projXml);
				  }
			  }
		  } catch(e) {}
		  return [out];
	  }
	},
	RecentProjects: function (profile,data,context)
	{
		var out = jBart.parsexml('<recent/>');
		var cookieVal = ajaxart.cookies.valueFromCookie('bartstudio_recent_projects','[]');
		try {
		  eval('var result = ' + cookieVal + ';');
		} catch(e) {
			alert(cookieVal);
			ajaxart.cookies.writeCookie('bartstudio_recent_projects','[]');
			return [];
		}
		for(var i=result.length-1;i>=0;i--) {
			var item = result[i];
			if (!item || !item.id) continue;
			var xml = jBart.parsexml('<project/>');
			jQuery(xml).attr('id',item.id).attr('name',item.name).attr('_type',item._type);
			out.appendChild(xml);
		}		
		return [out];
	},
	AddToRecentProjects: function (profile,data,context)
	{
		var project = aa_first(data,profile,'Project',context);
		if (!project) return;
		var id = project.getAttribute('id');
		
		var cookieVal = ajaxart.cookies.valueFromCookie('bartstudio_recent_projects') || '[]';
		try {
			eval('var result = ' + cookieVal);
		} catch(e) { var result = []; }
		
		if (result.length > 7) result.splice(result.length-1,1);
		for(var i=0;i<result.length;i++) {
			if (result[i] && result[i].id == id) return;
		}
		result.push({ id: project.getAttribute('id'), name: project.getAttribute('name'), _type: project.getAttribute('_type') });
		
		var newcookie = '[';
		for(var i=0;i<result.length;i++) {
			if (!result[i]) continue;
			newcookie += (i==0) ? '{' : ',{';
			var first=true;
			for(var j in result[i]) {
				if (!first) newcookie += ',';
				newcookie += j + ':"' + result[i][j].replace('"','\"') + '"';
				first=false;
			}
			newcookie += '}';
		}
		newcookie += ']';
		  
		ajaxart.cookies.writeCookie('bartstudio_recent_projects',newcookie);
	},
	WriteToMyWidgets: function (profile,data,context)
	{
		  var studioObject = context.vars._JBartStudio[0];
		  if (studioObject.User) {
			  return ajaxart.runNativeHelper(data,profile,'WriteToUser',context);
		  } else {
			  // cookie
			  var myWidgets = aa_xpath(aa_first(data,profile,'MyWidgets',context),'project');
			  var cookieValue = '[';
			  for(var i=0;i<myWidgets.length;i++) {
				  var project = jQuery(myWidgets[i]);
				  cookieValue += '{ id: "' + project.attr('id') + '",name:" ' + project.attr('name').replace('"','\"') + '"}';
			  }
			  cookieValue += ']';
			  
			  ajaxart.cookies.valueFromCookie('bartstudio_mywidgets',cookieValue);
		  }
	},
	HasSavePermissions: function (profile,data,context)
	{
		var studioObject = context.vars._JBartStudio[0];
		var project = studioObject.Project;
		if (!project.getAttribute('_wusers')) return ['true'];
		var users = ',' + project.getAttribute('_wusers') + ',';
		var user = ',' + studioObject.User + ',';
		if (users.indexOf(user) > -1) return ['true'];
	},
	LoadExternalJS: function (profile,data,context)
	{
		var files = ajaxart.run(data,profile,'ExternalJsFiles',context);
	    ajaxart_async_Mark(context);
		
	    var isCloud = context.vars._JBartStudio[0].UseJBartDB;
	    var index = 0;
	    
	    function loadNextJsFile() {
	      if (index >= files.length) {
	    	  return ajaxart_async_CallBack([],context);
	      }
	      var file = jQuery(files[index]);
	      var url = file.attr('file_name');
	      url = isCloud ? file.attr('cloud_base_url') + url : file.attr('local_base_url') + url;
	      url += (url.indexOf('?') == -1) ? '?' : '&';
	      url += '_=' + (new Date()).getTime();
	      
	      var isReadyJS = file.attr('load_condition');
	      if (!isReadyJS) {
	    	  jQuery.getScript(url,function() {
	    		  index++;
	    		  loadNextJsFile();
	    	  });
	    	  return;
	      }
	      if (isReadyJS.indexOf('function') == -1) {
	    	  if (isReadyJS.indexOf('return') == -1) // a variable
	    		isReadyJS = 'function() { return ' + isReadyJS + ' != null; }';
	    	  else 
	    		isReadyJS = 'function() { ' + isReadyJS + '}';
	      }
	      
	      try {
	        eval('var isReadyFunc = ' + isReadyJS);
	      } catch(e) { 
	    	  ajaxart.logException('error in load condition ' + isReadyJS,e);
	    	  isReadyFunc = function() { return true; }
	      }
	      
	      function checkReady(firstTime) {
	    	  try {
	    		  if (isReadyFunc()) {
	    			  index++;
	    			  loadNextJsFile();
	    			  return;
	    		  }
	    	  } catch(e) {}
	    	  if (firstTime) 
	    		  aa_load_js_css(url, 'js');
	    	  setTimeout(checkReady,100);
	      }
	      checkReady(true);
	    }
	    
	    loadNextJsFile();
	}
});

aa_gcs("jbstudio",{
	GetOrCreateUserInfoApiCall: function (profile,data,context)
	{
		var userXml = ajaxart.getVariable(context,'JBartUserInfo')[0];
		if (!userXml || !userXml.getAttribute('id')) return;

		var id = userXml.getAttribute('id');
		userXml.setAttribute('_type','jbart_user');

		ajaxart_async_Mark(context);

		jBart.db.get({
			contentType: 'jbart_user',
			id: id,
			error: function() {
				ajaxart_async_CallBack([],context);		
			},
			success: function(content) {
				if (content.nodeType == 1 && content.getAttribute('id') == id) {
					ajaxart.xml.copyElementContents(userXml,content);    	  	
				} 
				ajaxart_async_CallBack([],context);		
			}
		});
	}
});
// This file is responsible for providing previews for the following:
// 1. In field properties, especially for primitives
// 2. In aaeditor after a value is entered
// 3. In aaeditor before entering value (in which case the xtml to preview does not exist yet)
// 4. When adding fields in the toolbar
// 5. To calc Preview Data in studiobar
//
// It should also handle gaps (when the tester does nto happen. E.g. button action etc. )


// aa_calcPrimitivePreviewContext is used in the studio bars to handle preview context for primitives
function aadt_calcPrimitivePreviewContext(parentXtml,fieldName,context,settings)
{
	// The basic idea is to do ajaxart.run and put a trace on the tested xtml
	var topPageXtml = aadt_findTopPageXtml(parentXtml);
	var topXtml = topPageXtml; // our assumption is that the top page is enough for the circuit
	var topData = []; // we'll assume no data here...
	
	var topContext = ajaxart.newContext(); // take _BartContext from context, which is actually 
	topContext.vars._BartContext = context.vars._BartContext;
	topContext.vars._GlobalVars = context.vars._GlobalVars;
	
	var xtmlToTraceObj = aadt_previewXtmlToTrace(parentXtml,fieldName);
	var xtmlToTrace = xtmlToTraceObj.Xtml; 
	aadt_putXtmlTraces(xtmlToTrace);

	ajaxart.inPreviewMode = true;
	try {
		var page = ajaxart.run(topData,topXtml,'',topContext)[0];
		if (page) {
			var baseData = (page.FieldData) ? page.FieldData([],context) : [];
			page.Control(baseData,topContext);
		}
	} catch(e) {}
	
	ajaxart.inPreviewMode = false;
	if (xtmlToTraceObj.Cleanup) xtmlToTraceObj.Cleanup();  // we might need a cleanup if a dummy attribute was created 
	
	var results = [];
	if (settings && settings.probeFieldData) {
		if (ajaxart.xtmls_to_trace[0].fieldData.length >0)
			results = ajaxart.xtmls_to_trace[0].fieldData;
		else
			results = aaeditor.find_preview_context_over_gap().fieldData;
	}
	else {
		if (ajaxart.xtmls_to_trace[0].results.length >0)
			results = ajaxart.xtmls_to_trace[0].results;
		else
			results = aaeditor.find_preview_context_over_gap();
	}
	
	ajaxart.xtmls_to_trace = [];
	// TODO: add async query handling 
	
	return results; 
}

function aadt_previewXtmlToTrace(parentXtml,fieldName) {
	var xtml = aa_xpath(parentXtml,'@'+fieldName)[0] || aa_xpath(parentXtml,fieldName)[0];
	if (xtml) { return { Xtml: xtml } }
	// if not we'll create a dummy attribute and delete it afterwards
	parentXtml.setAttribute(fieldName,'');
	return {
		Xtml: aa_xpath(parentXtml,'@'+fieldName)[0],
		Cleanup: function() { 
			parentXtml.removeAttribute(fieldName);
		}
	}
}

function aadt_putXtmlTraces(xtmlToTrace)
{
	// tracing the XtmlForPreview and its parents
	ajaxart.xtmls_to_trace = [];
	var current_parent = xtmlToTrace;
	while (current_parent != null && current_parent.tagName != "Component" && current_parent.tagName != "Usage") {
		ajaxart.xtmls_to_trace.push( { xtml: current_parent , results: [] });
		current_parent = ajaxart.xml.parentNode(current_parent);
	}
}

function aadt_findTopPageXtml(parentXtml) {
  if (parentXtml.nodeType == 2) parentXtml = aa_xpath(parentXtml,'..')[0];
  
  for(var iter=parentXtml;iter && iter.nodeType==1;iter=iter.parentNode) {
	  if (iter.tagName == 'Component' && iter.getAttribute('type') == 'jbart.MyWidgetPage') 
		  return aa_xpath(iter,'xtml')[0];
  }
  return null;
}


aa_gcs("studiostate",{
	StudioUndo: function(profile,data,context) {
		ajaxart.run(data,profile,'Value',context);
		ajaxart.runsubprofiles(data,profile,'State',context);
		return [];
	},
	SetValue: function(profile,data,context) {
		var fieldPath = aa_text(data,profile,'FieldPath',context);
		var xtmlPath = aa_text(data,profile,'XtmlPath',context);
		var newValue = aa_text(data,profile,'NewValue',context);

		var fieldXtml = aa_path_to_xtml(fieldPath,context);
		var xpath = "";
		var param = xtmlPath.substring( xtmlPath.lastIndexOf('/')+1 );
		if (xtmlPath.lastIndexOf('/') != -1)
			xpath = xtmlPath.substring(0, xtmlPath.lastIndexOf('/'));
		var xtml = aa_xpath(fieldXtml,xpath)[0];
		if (!xtml || !fieldXtml) {
			ajaxart.log("studiostate.SetValue - cannot find xtml for " + fieldPath + "/" + xtmlPath);
			return [];
		}
		if (aa_bool(data,profile,'WriteToCData',context)) {	// CDATA
			var param_elem = ajaxart.childElem(xtml, param);
			if (!param_elem) {
				param_elem = aa_createElement(xtml, param);
				xtml.appendChild(param_elem);
			} else {
				while (param_elem.firstChild) param_elem.removeChild(param_elem.firstChild);  // delete all children first				
			}
			var cdata = element.ownerDocument.createCDATASection(newValue);
			param_elem.appendChild(cdata);
		}
		else {												// Simple Primitive
			if (ajaxart.childElem(xtml, param))	//	remove elem child for param
				xtml.removeChild(ajaxart.childElem(xtml, param));
			xtml.setAttribute(param,newValue);			
		}
		if (aa_bool(data,profile,'Refresh',context) && !aa_intest /* temporarly until we fix the refresh to work on tests */ ) {
			jBart.studiobar.objectFromXtml(fieldXtml).Refresh(data,context);
		}
		return [];
	},
	FieldProperties: function(profile,data,context) {
		var fieldPath = aa_text(data,profile,'FieldPath',context);
		var focusOn = aa_text(data,profile,'FocusOn',context);

		var propertiesElem;
		var fieldXtml = aa_path_to_xtml(fieldPath,context);
		if (aa_intest && context.vars.TopControlForTest) {
			propertiesElem = jQuery(context.vars.TopControlForTest).find(".field_details")[0];
			// refreshing field properties
			var newControl = aa_run_component("field_dt.FieldDetails",[fieldXtml],context);
			aa_replaceElement(propertiesElem,newControl[0],true);
			propertiesElem = newControl;
		} else {	// open properties window
			if (fieldXtml)
				ajaxart.runNativeHelper([fieldXtml],profile,'OpenPropertiesWindow',context);
			propertiesElem = jQuery(".field_details")[0];
		}

		// propertiesElem = jBart.utils.refresh(propertiesElem);
		var jElem = jQuery(propertiesElem);
		var items = focusOn.split("/");
		for (i in items) {
			var item = items[i];
			if (item.indexOf("[") != -1) {	// Array item
				var index = item.match(/FieldAspect\[([0-9]*)/)[1];
				var array_item = item.split("[")[0];
				var findPattern = ".fld_" + array_item + ">*>tr" + item.replace(array_item,"");
				if (array_item == 'FieldAspect')
					findPattern = jElem.find("#features>table>tbody>tr:nth-child(" + index + ")");
				jElem = jElem.find(findPattern);

				// expanding if needed
				var componentTitle = jElem.find("td>div>span>span>.component_title_in_table");
				if (!componentTitle.hasClass("expanded"))	
					jElem.find("td>div>span.component_title").trigger("click");
			} 
			else if (i < items.length-1) {	// Component
				jElem = jElem.find(".field_for_more_options_" + item);
				// todo: expand
			}
			else {	// Primitive
				var focus_class = (aa_intest) ? 'in_focus' : '';
				jElem.find(".fld_" + item).find("input").focus().addClass(focus_class);
			}
		}
	}
});

// var StudioUndo = {
// 	undoOperations = [];
// 	redoOperations = [];
// 	primitiveValueChanged(xtml,oldValue,newValue) {
// 		var xtmlPath;
// 		for (xml = xtml; aa_tag(xml) != 'Field'; xml = xml.parentNode) {
// 			xtmlPath = aa_tag(xml) 			
// 		}
// 		var fieldPath;
// 		var operation = 
// 		'<RunOnControl t="studiostate.StudioUndo">
// 		    <Value t="studiostate.SetValue" WriteToCData="" FieldPath="' + fieldPath + '" XtmlPath="' + xtmlPath + '" NewValue="true" Refresh="true"/>
// 		    <State t="studiostate.FieldProperties" FieldPath="' + fieldPath + '" FocusOn="' + xtmlPath + '"/>
//     	</RunOnControl>';
// 	}
// };

//AA BeginModule
ajaxart.gcs.tree = 
{
  RefreshNode: function (profile,data,context)
  {
	  var depth = aa_text(data,profile, 'Depth', context);
	  var li = data[0];
	  var item_data = ajaxart_treeitem_data(li);
	  var children = ajaxart_runevent(item_data,'TreeContext','NextLevel');
	  var ul = jQuery(li).find('ul');
	  ul.html(''); // clean children.
	  ajaxart_tree_addChildren(ul[0],children,profile,data,context,depth);
  },
  AddChildren: function (profile,data,params)
  {
	var inputForChanges = ajaxart.getVariable(params,"InputForChanges");
	var treeview_cls = ajaxart.run(data,profile, 'TreeViewCls', params);
	var children = ajaxart.run(inputForChanges,profile, 'Children', params);

	var jqdata = jQuery(data);
	
	if ( jqdata.hasClass(treeview_cls) )
		var treeview = jqdata;
	else
		var treeview = jqdata.parents("." + treeview_cls);

	jqdata.css('display','block'); // fixing strange bug in safari
	
	var branches = jQuery(children).appendTo(jqdata);
	treeview.treeview({add: branches});

	return data;	
  },  
  InternalAfterAddingItem: function (profile,data,context)
  {
	  var item = aa_first(data,profile,'Item',context);
	  if (item == null) return [];

	  var treeview_cls = 'treeview';
	  var jqdata = jQuery(item);
	  if (jqdata.find('.hitarea').length > 0) return [];//already tree view
	  
	  if ( jqdata.hasClass(treeview_cls) )
			var treeview = jqdata;
		else
			var treeview = jqdata.parents("." + treeview_cls);

	  jqdata.css('display','block'); // fixing strange bug in safari
	  
	  treeview.treeview({add: jQuery(item)});
	  
	  return ["true"];
  },
  SelectFirst:function (profile,data,context)
  {
  	var first_tree_items = jQuery(data[0]).find('.treeitem_text');
    var dataElem = ajaxart_tree_find_databound_elem(first_tree_items[0]);
    if (dataElem != null)
    {
    		ajaxart_css_selection(dataElem,'treeview');
    		ajaxart_selectionchanged(dataElem);
    }
    return ["true"];
  },
  InternalRefreshAddingItem: function (profile,data,context)
  {
	  var aboveUl = aa_first(data,profile,'AboveUL',context);
	  var newItems = ajaxart.run(data,profile,'NewItems',context);

	  if (aboveUl == null) return [];
	  var addingTopUl = false;
	  
	  if (jQuery(aboveUl).find('>ul').length > 0) 
		  var topUl = jQuery(aboveUl).find('>ul')[0];
	  else
	  {
		  addingTopUl = true;
		  var topUl = document.createElement('ul');
		  topUl.clasName = 'treeul';
		  ajaxart.xml.append(aboveUl,topUl);
	  }

	  if (topUl == null) return [];
	  var lis = jQuery(topUl).find('>li');
	  var items_to_add = newItems.length - lis.length;
	  
	  for(var i=0;i<newItems.length;i++)
	  {
		if (items_to_add == 0) break;
		var addBefore = null;
		
		if (i<lis.length && lis[i].ajaxart.data.length > 0) {
  		  var newItem = newItems[i];
		  var currentItem = lis[i].ajaxart.data[0];
		  
		  if (currentItem != newItem) {
			  addBefore = lis[i];
		  }
		}
		
		if (lis.length <=i || addBefore != null)
		{
			var treeContext = null;
			if ('ajaxart' in topUl)
				treeContext = topUl.ajaxart.params;
			else
				treeContext = topUl.parentNode.ajaxart.params;
			
			var newLI = aa_first([newItems[i]],profile,'NewNodeItem',treeContext);
			if (newLI != null)
			{
				if (addBefore == null)
					ajaxart.xml.append(topUl,newLI);
				else 
					topUl.insertBefore(newLI,addBefore);
				
				ajaxart.run([newLI],profile,'OnNewItem',context);
				var treeview = jQuery(topUl);
				if ( ! treeview.hasClass("treeview") )
				  treeview = treeview.parents(".treeview");		
				
				treeview.treeview({add: jQuery(newLI)});
			}
			items_to_add--;
		}
		
	  }
	  if (addingTopUl)
	  {
		  var branches = jQuery(aboveUl);
		  jQuery(aboveUl).parents('.treeview').treeview({add: branches});
	  }
	  return ["true"];
  },
  SelectItem: function (profile,data,context)
  {
	  var item = aa_first(data,profile,'Item',context);
	  if (item == null) return [];
      var dataElem = ajaxart_tree_find_databound_elem(item);

	  ajaxart_css_selection(dataElem,'treeview');
	  ajaxart_selectionchanged(dataElem);
	  ajaxart_runevent(dataElem,'TreeContext','OnSelect');
	  
	  return ["true"];
  },
  OpenAllNodes: function (profile,data,context)
  {
	  var depth = aa_int(data,profile,'MaxDepth',context);
	  if (isNaN(depth) || typeof(depth) != 'number') 
		  depth = 10;
		var elements = data;
		if (elements.length == 0 || !ajaxart.ishtml(elements[0]))
			elements = ajaxart.getControlElement(context);

	  if (elements.length == 0) return [];
	  var tree = elements[0];

	  for (var i=0;i<depth;i++)
	  {
		  var expandable_elems = jQuery(tree).find('.expandable .hitarea');
		  if (expandable_elems.length == 0) break;
		  for(var t=0;t<expandable_elems.length;t++)
			  jQuery(expandable_elems[t]).click();
	  }
	  return ["true"];
  },
  DeleteSelected: function (profile,data,context)
  {
	  // the 'selected' class should be on the LI, not the SPAN. that would allow us to use uiaction.RefreshAfterSelectedDeleted
  	 var controls = ajaxart.getControlElement(context);
  	 var selected = jQuery(controls).find('.selected').parent();
  	 if (selected.length ==1)
  	 {
  		 var elem = selected[0];
  		 var newSel = elem.nextSibling;
  		 if (newSel == null) newSel = elem.previousSibling; 
  		 if (newSel == null) {
  			 var parents = jQuery(elem).parents('.treeitem');
  			 if (parents.length > 0) newSel = parents[0];
  		 }
  		 elem.parentNode.removeChild(elem);
  		 if (newSel != null) {
  			 jQuery(newSel).find('>span').addClass('selected');
  			 aa_xFireEvent(newSel, 'click', null);
  		 }
  	 }
  	 return ["true"];
  },
  SelectTreeNodeByPath: function (profile,data,context)
  {
	  var pathItems = ajaxart.run(data,profile,'PathItems',context);
	  var node = jQuery(ajaxart.getControlElement(context)).find('.tree_wrapper');
	  for(var i=0;i<pathItems.length;i++) {
		  if (node.hasClass("expandable"))
			  node.find('>.hitarea').trigger('click');	// expand
		  var candidates = jQuery(node).children("ul").children("li");
		  var found=false;
		  for(var j=0;j<candidates.length;j++) {
			  if ( jQuery(candidates[j]).children('.treeitem_text').find('.treeitem_text_content').text() == ajaxart.totext(pathItems[i]) )
			  {
				  node = jQuery(candidates[j]);
				  found = true;
				  break;
			  }
		  }
		  if (!found)
			  return [];	// not found
	  }
	  var dataElem = jQuery(node).children(".treeitem_text")[0];
	  ajaxart_css_selection(dataElem,'treeview');
	  ajaxart_selectionchanged(dataElem);
	  
	  return [];
  },
  TreeNodeByPath: function (profile,data,context)
  {
	  var path = aa_text(data,profile,'TreePath',context);
	  var elements = jQuery(ajaxart.getControlElement(context)).find('.tree_wrapper');
	  if (elements.length == 0) return [];
	  var tree = elements[0];
	  var elems = path.split('/');
	  var result = tree;
	  for(var i=0;i<elems.length;i++) {
		  var found = false;
		  
		  var candidates = jQuery(result).find('>ul>li');
		  for(var j=0;j<candidates.length;j++)
			  if ( jQuery(candidates[j]).find('>span').find('.treeitem_text_content').text() == elems[i] )
			  {
				  found = true;
				  result = candidates[j];
			  }
		  if (! found) return [];
	  }
	  return [result];
  },
  PathOfSelectedItem: function (profile,data,context)
  {
	var elements = ajaxart.getControlElement(context);
	if (elements.length == 0) return [];
	var tree = elements[0];
	var selected = jQuery(tree).find('.selected');
	var path = "";
	var spans = selected.parents('.treeitem').find('>span');
	for(var i=0;i<spans.length;i++)
	{
		var text = jQuery(spans[i]).find('.treeitem_text_content').text();
		if (path != "")
			path = text + "/" + path;
		else
			path = text;
	}
	return [path];
  },
  PickTreeRoots: function (profile,data,context)
  {
	  if (data.length == 0) return [];
	  var values = ajaxart.xml.xpath(data[0],"Value");
	  var make_unique = {};
	  var result = [];
	  for(var i=0;i<values.length;i++)
	  {
		  var value= values[i];
		  var category = value.getAttribute("category");
		  if (category == null)
			  result.push(value.getAttribute("val"));
		  else
		  {
			  var root = category.split('.')[0];
			  if (make_unique[root] == undefined)
			  {
				  result.push(root);
				  make_unique[root] = true;
			  }
		  }
	  }
	  return result;
  }
};
//AA EndModule
ajaxart_tree_keydown = function(event)
{
	if (event.keyCode == 40 || event.keyCode == 38)
		  ajaxart_stop_event_propogation(event);	//canceling scroll when clicking key up or down
}
ajaxart_tree_event = function(event)
{
    var element = (typeof(event.target)== 'undefined')? event.srcElement : event.target;
    if (jQuery(element).hasClass("hitarea")) return;
    if (event.type == 'keyup') {
    	var selectedItems = jQuery(element).parents(".tree_top").find('.selected');
    	if (selectedItems.length > 0)
    		element = selectedItems[0];
    }
    	
    var dataElem = ajaxart_tree_find_databound_elem(element);
    var refocus=false;
    if (dataElem != null)
    {
    	if (event.type == 'click') {
    		ajaxart_css_selection(dataElem,'treeview');
    		ajaxart_selectionchanged(dataElem);
    		ajaxart_runevent(dataElem,'TreeContext','OnSelect');
    		refocus=true;
    		// bug workaround: manually activate capture event
    		if (window.captureEvents && window.onmousedown != null)
    			window.onmousedown(event);
    		if (!window.captureEvents && document.onmouseclick != null)	// IE
    			document.onmouseclick(event);
    	}
    	else if (event.type == 'dblclick')
    		ajaxart_runevent(dataElem,'TreeContext','OnDoubleClick');
    	else if (event.type == 'keyup')
    	{
    		if (event.keyCode == 13 && ! event.ctrlKey) // enter
        	  ajaxart_runevent(dataElem,'TreeContext','OnDoubleClick');
    		if (event.keyCode == 46) // DEL
          	  ajaxart_runevent(dataElem,'TreeContext','OnDelete');
  	        if (event.keyCode == 40) {  // down
  			  ajaxart_stop_event_propogation(event);
			  ajaxart_tree_move_cursor(dataElem,1,event.altKey);
  	        }
	  	    if (event.keyCode == 38)  // up  
  			  ajaxart_tree_move_cursor(dataElem,-1,event.altKey);
	  	    if (event.keyCode == 39 || event.keyCode == 37)  // right - expand
	  	    {
	  	    	var expand = (event.keyCode == 39);
	  	    	if (jQuery(dataElem).parents('.right2left').length>0)
	  	    		expand = !expand;
	  	    	
	  	    	if (!expand) {
	  	    		if (jQuery(dataElem.parentNode).hasClass('collapsable'))
	  	    			ajaxart_tree_expandCollapse(dataElem,expand);
	  	    		else
	  	    			ajaxart_tree_move_cursor(dataElem,-2,event.altKey);	// go up
	  	    	}
	  	    	else
	  	    		ajaxart_tree_expandCollapse(dataElem,expand);
	  	    }
	  	    //if (event.keyCode >= 37 && event.keyCode <= 40) {refocus=true;}
	  	    ajaxart_tree_make_selected_visible(jQuery(dataElem).parents(".tree_top").find('.tree_wrapper'));
	  	    ajaxart.setVariable(dataElem.ajaxart.params,"_CurrentFocus",[ jQuery(dataElem).find('.treeitem_dummy4focus')[0] ]);
	  	    ajaxart_runevent(dataElem,'TreeContext','OnKeyPressed','',event);
    	}
    }
    
    if (dataElem != null && refocus)
    {
    	if (dataElem.tabIndex == 1)
    		jQuery(dataElem).focus();
    	else
    		jQuery(dataElem).find('.treeitem_dummy4focus').focus();
    }
}

ajaxart_tree_find_databound_elem = function(element)
{
	while (element != null && element.nodeType == 1)
	{
		if (element.tagName.toLowerCase() == "li")
			return ajaxart_tree_item_from_li(element);
		element = element.parentNode;
	}
	return null;
}

ajaxart_tree_item_from_li = function(li)
{
	// find our span and return it
	var node = li.firstChild;
	while (node != null)
	{
		if (node.nodeType == 1 && node.tagName.toLowerCase() == 'span') 
			return node;

		node=node.nextSibling;
	}
}

ajaxart_tree_expandCollapse = function(dataElem,expand)
{
	var li = dataElem.parentNode;
	
	if (expand && jQuery(li).hasClass('expandable'))
		jQuery(li).find('>.hitarea').trigger('click');
	if (!expand && jQuery(li).hasClass('collapsable'))
		jQuery(li).find('>.hitarea').trigger('click');
}
ajaxart_tree_move_cursor = function(dataElem,advance,do_not_select)
{
	var newElem = null;
	
	var li = dataElem.parentNode;

	if (advance == 1) 
	{		
		if (jQuery(li).hasClass("collapsable")) // go inside
		{
			var ul = jQuery(li).find(".treeul")[0];
			if (ul.firstChild.tagName.toLowerCase() == 'li')
				newElem = (ul.firstChild);
		}
		while(newElem == null && li != null)
		{
			if (li.nextSibling != null)
				newElem = li.nextSibling;

			if ( jQuery(li.parentNode).hasClass("treeul") )
				li = li.parentNode.parentNode;
			else 
				li = null;
		}
	}
	if (advance == -1) 
	{
		var prevTop = li.previousSibling;
		if (prevTop == null)
		{
			if ( jQuery(li.parentNode).hasClass("treeul") )
				newElem = li.parentNode.parentNode;
		}
		// find the innermost under prevTop
		while(newElem == null && prevTop != null)
		{
			if (! jQuery(prevTop).hasClass("collapsable") ) newElem = prevTop;
			var treeItems = jQuery(prevTop).find(".treeitem");
			if (treeItems.length == 0) newElem = prevTop;
			else
				prevTop = treeItems[treeItems.length-1];
		}
	}
	if (advance == -2) {
		newElem = li.parentNode.parentNode;
	}
	if (newElem != null)
	{
		var dataElem = ajaxart_tree_item_from_li(newElem)
		ajaxart_css_selection(dataElem ,'treeview');
		ajaxart_selectionchanged(dataElem);
		if (do_not_select == null || do_not_select != true)
			ajaxart_runevent(dataElem,'TreeContext','OnSelect');

		if (dataElem != null)
	    	if (dataElem.tabIndex == 1)
	    		jQuery(dataElem).focus();
	    	else
	    		jQuery(dataElem).find('.treeitem_dummy4focus').focus();
	}
}

ajaxart_tree_toggle = function(element,actionContext,actionToRun)
{
	var elem = jQuery(element);
	if (elem.hasClass("collapsable")) // opening
	{
		if( elem.find(">ul>li").length == 0) {	// lazy
			var ul = elem.find(">ul")[0];
			var treeitem = ajaxart_tree_item_from_li(element);

			var elem_context = treeitem["ajaxart"];
			if (typeof(elem_context)=="undefined") return;
			var params = elem_context.params;

			var actionContextPack = params.vars[actionContext];
			if (actionContextPack == null || actionContextPack.length == 0) return;
			var actionToRunPack = actionContextPack[0][actionToRun];
			if (actionToRunPack == null || typeof(actionToRunPack) == "undefined") return;
			
			var newContext = ajaxart.clone_context(actionToRunPack.context);
			newContext.vars = elem_context.params.vars;
			ajaxart.setVariable(newContext,"InputForChanges",elem_context.data);

			ajaxart.run([ul],actionToRunPack.script,"",newContext);
		}
	}
}

ajaxart_tree_make_selected_visible = function(treewrapper)
{
  var selected = treewrapper.find('.selected');
  if (selected.length == 0) return;
  var item = selected[0];

  var avgHeight = 20;
  var scrollBarHeight = 20;
  
  var realOffset = 0;
  while (item != null && item != treewrapper)
  {
      realOffset += item.offsetTop;
      item = item.offsetParent;
  }
  var treeTop = aa_absTop(treewrapper[0],true);
  var isSeen = false;
  var scrollTop = treewrapper[0].scrollTop;
  var innerLoc = realOffset - treeTop;
  if ( innerLoc >= scrollTop && innerLoc+avgHeight < treewrapper.height() + scrollTop - scrollBarHeight) isSeen = true;
  if (isSeen) return;
  
  if (innerLoc - scrollTop < treewrapper.height() /2 ) //going up
	  var newScrollTop = Math.max(innerLoc - avgHeight,0);
  else
	  var newScrollTop = innerLoc - treewrapper.height() + avgHeight*2;
  
  treewrapper[0].scrollTop = newScrollTop;
}

ajaxart_treeitem_data = function (element)
{
	if (element.tagName.toLowerCase() == 'span') return element.ajaxart.data;
	if (element.tagName.toLowerCase() == 'li') 
		return ajaxart_tree_item_from_li(element).ajaxart.data;
	return null;
}

ajaxart_tree_addChildren = function (parent,children,profile,data,context,depth)
{
	var checkbox = "";
	var selector = aa_first(data,profile, 'MultiSelector', context);
	var result = [];

	for(var i=0;i<children.length;i++)
	{	
		var child = children[i];
		var title = aa_text([child],profile, 'ItemText', context);
		var image = aa_jbart_image('/default1616.gif',context);
		if (profile.getAttribute('ItemImage') != null || ajaxart.xml.xpath(profile,'ItemImage').length > 0)
			image = aa_text([child],profile, 'ItemImage', context);
		
		var subItems = ajaxart.run([child],profile, 'NextLevel', context);
		var isLeaf = subItems.length == 0;
		if (isLeaf && selector != null)
		{
			if (selector.IsSelected != undefined && aa_bool([child],selector.IsSelected.script, '', selector.IsSelected.context))
				checkbox = '<input type="checkbox" onclick="ajaxart_tree_checkbox_clicked(this,event)" class="aacheckbox_value" checked="checked"/>';
			else
				checkbox = '<input type="checkbox" onclick="ajaxart_tree_checkbox_clicked(this,event)" class="aacheckbox_value" />';
		}
		var closed = "";
		if (subItems.length > 0 && depth == 1) closed = " closed";
		var node = jQuery('<li class="aa_item treeitem' + closed + '">'
				+ '<image class="treeitem_image" src="' + image + '" align="top" height="16px"/>'
				+ checkbox
				+ '<span style="position:relative;" class="treeitem_text text_item" tabindex="1" onkeyup="ajaxart_tree_event(event);return false;">' + title + ' </span></li>')[0];
		node.selector = selector;
		// binding the span and the li
		var text_node = jQuery(node).find('.text_item')[0];
		ajaxart.databind([text_node],[child],context,profile);
		//ajaxart.databind([node],[child],context,profile);
		if (ajaxart.xml.xpath(profile,'ItemColoring').length > 0)
			ajaxart.run([text_node],profile, 'ItemColoring', context);
		
		parent.appendChild(node);
		result.push(node);
		if (subItems.length > 0)
		{
			var childsParent = jQuery('<ul class="treeul"/>')[0];
			node.appendChild(childsParent);
			if (depth == 1)
				node.Lazy = true;
			else
				ajaxart_tree_addChildren(childsParent,subItems,profile,data,context,depth-1);
		}
	}
	return result;
}

ajaxart_tree_LazyExpand = function(element,data,profile,context)
{
//    ajaxart.log("ajaxart_tree_LazyExpand " + element.tagName);
	var itemdata = ajaxart_treeitem_data(element);
	var li = jQuery(element);
	var ul = jQuery(element).find('ul');
	if (li.hasClass("collapsable")) // opening
	{
		if( element.Lazy ) {	// lazy
			var subItems = ajaxart.run(itemdata,profile, 'NextLevel', context);
			var children = ajaxart_tree_addChildren(ul[0],subItems,profile,data,context,1);
			element.Lazy = false;

			ul.css('display','block'); // fixing strange bug in safari & chrome
			
			var branches = jQuery(children);
			
			li.parents(".tree_top").treeview({
				add: branches, 
				toggle: function() { ajaxart_tree_LazyExpand(this,data,profile,context);}
			});
		}
	}
}
ajaxart_tree_checkbox_clicked = function (elem,event)
{
	var item = elem.parentNode;
	var selector = item.selector;
	if (selector != null)
	{
		var result = ajaxart.run(item.ajaxart.data,selector.Toggle.script, '', selector.Toggle.context);
		ajaxart_runevent(item,'TreeContext','MultiSelect');
	}
}






//AA BeginModule
ajaxart.gcs.xtml_dt = 
{
	ParamsAsFields: function (profile,data,context)
	{
		var ptdef = aa_component_definition(aa_text(data,profile,'Component',context));
		if (ptdef == null) return [];
		var hasAdvanced = false;
		var params = ajaxart_run_commas(data,profile,'Params',context), boolfeature_params = [];
		if (params.length == 0) {
			var params2 = ajaxart.xml.xpath(ptdef,"Param");
			for(var i=0;i<params2.length;i++) {
				ajaxart.run(data,params2[i],'Convert',context); // run convert

				if (params2[i].getAttribute('light') == 'false') continue;
				if (aa_xtmldt_is_advanced_param(data[0],params2[i]))
				  hasAdvanced = true;
				else {
				  if (params2[i].getAttribute('boolfeature') == 'true') 
					  boolfeature_params.push( params2[i].getAttribute('name') );
				  else params.push( params2[i].getAttribute('name') );
				}
			}
		}
		var out = [];
		for (var i=0;i<params.length;i++) {
			var paramXml_a = ajaxart.xml.xpath(ptdef,"Param[@name='" + params[i] + "']");
			if (paramXml_a.length == 0) continue;
			var paramXml = paramXml_a[0]; 
			
			if ( ajaxart.xml.xpath(paramXml,'Field').length > 0) { // custom field
				var paramfield = aa_first(data,paramXml,'Field',context);
				if (paramfield) {
				  paramfield.Param = params[i];
				  paramfield.ParamXml = paramXml;
				  out.push(paramfield);
				}
				continue;
			}
			var title = aa_text_capitalizeToSeperateWords("" + params[i]);
			if (paramXml.getAttribute("Title"))
				title = paramXml.getAttribute("Title");
			var field = { isObject: true , Id: params[i], Title: title , ParamXml: paramXml, Param: params[i], Type: paramXml.getAttribute('type') }
			field.FieldData = function(data) { return data; }
			field.CheckMandatoryValidation = function(field_data,ctx) {
				var param = field.Param;
				if (field_data.nodeType == 1) {
					if (field_data.getAttribute(param)) {
						if (field_data.getAttribute(param) == '') return false;
						return true;
					}
					if (!aa_xpath(field_data,param)[0]) return false;
					return true;
				}
			}
			var setAspects = function(field,ptdef) {
				var newContext = aa_ctx(context, { _Field: [field]});
				
				var type = paramXml.getAttribute('type');
				
				var isArray = (field.Type != null && field.Type.indexOf('[]') > -1);
				var isPrimitive = (type == null || type == "data.Data");
				
				if (!isPrimitive && type == "data.Boolean" && paramXml.getAttribute("script") == "true") isPrimitive = true;
				
				if (isPrimitive) { 
					field.Control = function(data1,ctx) {
					  var pt = aa_text(data,profile,'Component',context);
					  return ajaxart_xtmldt_primitive_control(data1[0],pt,field.Param,ctx);
					}
					return;
				} 
				if (isArray) 
					return ajaxart.runNativeHelper(data,profile,'Array',newContext);
				
				// options
				field.Options = { isObject:true, Options: [] , IsTree: false }
				
				var isTgpType = false,isAttribute = false,isOptions=false;
				
				if (field.ParamXml.getAttribute('multiple') == 'true' && type == "enum") {
					field.AllowValueNotInOptions = field.Multiple = true;
					if (field.ParamXml.getAttribute('Options')) {
						var options = field.ParamXml.getAttribute('Options').split(',');
						for(var i=0;i<options.length;i++) 
						    field.Options.Options.push({ isObject: true, code: ajaxart.totext_item(options[i]) });
					}
					isAttribute = isOptions = true;
				} else if (type == "enum") {
					field.AllowValueNotInOptions = true;
					var options = ajaxart.xml.xpath(field.ParamXml,"value");
					if (field.ParamXml.getAttribute('Options')) 
						ajaxart.concat(options,field.ParamXml.getAttribute('Options').split(','));
					
					for(var i=0;i<options.length;i++) {
						var option = { isObject: true, code: ajaxart.totext_item(options[i]) };
					    field.Options.Options.push(option);
					}
					isAttribute = isOptions = true;
				} else if (type == "dynamic_enum" || type=="dynamic_enum_multi") {
					field.AllowValueNotInOptions = true;
					if ( paramXml.getAttribute('options_pt') ) {
					  field.Options = ajaxart.runComponent(paramXml.getAttribute('options_pt'),data,context); 
					} else
					  field.Options = ajaxart.gcs.picklist.DynamicOptions(field.ParamXml,[],newContext)[0];
					if (paramXml.getAttribute('recalc_options') == 'true')
					{
						field.DelayedOptionCalculation = field.DynamicSuggestions = true;
						field.RecalcOptions = function(data1,ctx)
						{
							var newContext = aa_ctx(aa_merge_ctx(context,ctx),{_Field: [field], _Xtml: ctx.vars._FieldData});
							var options = ajaxart.gcs.picklist.DynamicOptions(field.ParamXml,[],newContext)[0];
							aa_initOptionsObject(options,ctx);
							return options;
						}
					}

					if (type=="dynamic_enum_multi")
						field.Multiple = true;
					isAttribute = isOptions = true;
				}
				else if (type == "data.Boolean") {
					isAttribute = isOptions = true;
					ajaxart.runComponent('field_aspect.Boolean',[],newContext);
					field.Options = null;
					isOptions = false;
					aa_field_handler(field,'OnUpdate',function() {
						ajaxart.runNativeHelper(data,profile,'RefreshPreview',context);
					},'xtml_dt',1000);
				}
				else if ("action_async.Action,data_async.Data,xml.Change,ui.Control,".indexOf(type+',') > -1 ) {
					field.Control = function(data1,ctx) {
					  var newContext = aa_ctx(context, { Xtml: data1 , Param: [field.Param] });
					  return ajaxart.runComponent('xtml_dt.EditBasicTypeControl',data1,newContext);
					}
				}
				else isTgpType = true;

				if (isAttribute) {
					field.FieldData = function(data1,ctx) {
						var val = ajaxart.xml.xpath(data1[0],"@"+field.Param);
						if (val.length > 0) return val;
						var paramXml = ajaxart.xml.xpath(ptdef,"Param[@name='" + field.Param + "']")[0];
						if (paramXml) {
							var ptdefval = paramXml.getAttribute('Default');
						    ptdefval = ptdefval || ajaxart.totext_array(ajaxart.xml.xpath(paramXml,"Default/@value"));
							ptdefval = ptdefval || aa_cdata_value(ajaxart.xml.xpath(paramXml,"Default")[0]);
							ptdefval = ptdefval || '';
						} else {
							var ptdefval = '';
						}
						return ajaxart.xml.xpath(data1[0],"@"+field.Param,true,ptdefval);
					}
				}
				if (isTgpType) 
				{
					field.Options = ajaxart.runNativeHelper(data,profile,'OptionsObjForTgpType',newContext);
					field.RecalcOptions = function() {
						var optionsObj = ajaxart.runNativeHelper(data,profile,'OptionsObjForTgpType',newContext)[0];
						aa_initOptionsObject(optionsObj,newContext);
						return optionsObj;
					} 
					ajaxart.runNativeHelper(data,profile,'AspectsForTgpType',newContext);
					field.FieldData = function(data1,ctx) 
					{
						var out = ajaxart_writabledata();
						
						var val = ajaxart.xml.xpath(data1[0],field.Param+"/@t");
						if (val.length == 0)  // copy default value 
						{
							var ptdefval_a = ajaxart.xml.xpath(ptdef,"Param[@name='" + field.Param + "']/Default");
							if (ptdefval_a.length > 0) {
								// copy the ptdefault value
								var newElem = data1[0].ownerDocument.createElement(field.Param);
								data1[0].appendChild(newElem);
								ajaxart.xml.copyElementContents(newElem,ptdefval_a[0]);
							}
							val = ajaxart.xml.xpath(data1[0],field.Param+"/@t");
						}
						if (val.length > 0) ajaxart.writevalue(out,val);
						return out;
					}
					field.StoreOriginalValue = function(input,ctx) {
						var xtml = ajaxart.xml.xpath(ctx.vars._Item[0],field.Param)[0];
						input.originalXtml = ajaxart.parsexml(ajaxart.xml2text(xtml));
					}
					field.RevertToOriginalValue = function(input,field_data,ctx) {
						if (!input.originalXtml) return;
						var xtml = ajaxart.xml.xpath(ctx.vars._Item[0],field.Param)[0];
						ajaxart.xml.copyElementContents(xtml,input.originalXtml);
						aa_invoke_field_handlers(field.OnUpdate,input,null,field,field_data,{RevertToOriginalValue: true});
					}
					aa_field_handler(field,'OnUpdate',function(field,field_data,input,e,extra){
						if (extra && extra.RevertToOriginalValue) return;
						var xtml = jQuery(input).parents('.aa_item')[0].ItemData[0];
						if (aa_totext(field_data) == "") { // empty - delete the element
							var elem = aa_xpath(xtml,field.Param)[0];
							if (elem) elem.parentNode.removeChild(elem);
						} else {
							var newT = aa_totext(field_data);
							var currT = aa_totext(aa_xpath(xtml,field.Param+'/@t'));
							if (currT != newT) 
								xtmldt_switch_pt(currT,newT,xtml,field.Param,context);
						}
					});
					isOptions = true;
				}
				if (isOptions)
				  ajaxart.runNativeHelper(data,profile,'Options',newContext);
			}
			if (paramXml.getAttribute('autoaspects') != 'false' && paramXml.getAttribute('titleField') != 'true')
			  setAspects(field,ptdef);
			
		    var newContext = aa_ctx(context, { _Field: [field]});
		    ajaxart.runNativeHelper([],profile,'Aspects',newContext);
		    ajaxart.runsubprofiles(data,field.ParamXml,'FieldAspect',newContext);
			
			out.push(field);
		}
		if (boolfeature_params.length > 0) {
			var field = { isObject: true , Title: [ "Light Features" ] , BoolFeature: ["true"],Params: boolfeature_params }
		    ajaxart.runNativeHelper(data,profile,'BoolFeatureAspects',aa_ctx(context,{_Field: [field]}));
			aa_field_handler(field,'OnUpdate', function(field,field_data,input) {
				var checked = "," + aa_totext(field_data)+",";
				var xtml = jQuery(input).parents('.aa_item')[0].ItemData[0];
				for(var i=0;i<field.Params.length;i++) {
					var param = field.Params[i];
					if (checked.indexOf(","+param+",") > -1)
						xtml.setAttribute(param,"true");
					else
						xtml.setAttribute(param,"false");
				}
			},'boolfeature');
			var init = function(field) {
			  field.FieldData = function(xtml,ctx) {
				var out = ajaxart_writabledata(),val="";
				for(var i=0;i<field.Params.length;i++) {
					var param = field.Params[i];
					var scr = ajaxart.fieldscript(xtml[0],param,true);
					if (scr && scr.nodeType == 2 && scr.nodeValue == "true")
						val += param + ",";
					if (scr && scr.tagName == "Default" && scr.getAttribute("value") == "true")
						val += param + ",";
				}
				if (val != "") val = val.substring(0,val.length-1); // remove the last ,
				ajaxart.writevalue(out,[val]);
				return out;
			  }
			}
			init(field);
			out.push(field);
		}
		
		if (hasAdvanced) {
			var advancedField = { isObject: true , ID: ["xtml_morefields"], HideTitle: ["true"] }
			advancedField.Control = function(data1,ctx) {
				var top = document.createElement('div');
				top.className = "xtmldt_advanced_fields";
				top.ShowAdvancedParams = false;
				var pt = aa_text(data,profile,'Component',context);
				xtmldt_refreshMoreFields(top,data1,ctx,pt);
				
				return [top];
			}
			out.push(advancedField);
		}
		return out;
	},
	IsAdvancedParam: function (profile,data,context)
	{
		return aa_frombool(aa_xtmldt_is_advanced_param(aa_first(data,profile,'Xtml',context),aa_first(data,profile,'ParamXml',context)));
	},
	SetContainingPicklistValue: function (profile,data,context)
	{
		var input = aa_first(data,profile,'PicklistInput',context);
		var value = aa_text(data,profile,'Value',context);
		
		if (input && input.set) {
			input.setValue(value);
			input.FixValue(false);
			input.set(value);
		}
	},
	ToCompositeParam: function (profile,data,context)
	{
		if (! ajaxart.isxml(data) ) return [];
		var param = aa_text(data,profile,'Param',context);
		var items = ajaxart.xml.xpath(data[0],param);
		if (items.length == 0) { 
			data[0].appendChild( data[0].ownerDocument.createElement(param) );
			items = ajaxart.xml.xpath(data[0],param);
		}
		var item = items[0];
		var compositePT = aa_text(data,profile,'PTForComposite',context);
		if (item.getAttribute('t') == null || item.getAttribute('t') == "")
			item.setAttribute('t',compositePT);
		if (item.getAttribute('t') != compositePT) return [];
		
		return [item];
	},
	PreviewContext: function (profile,data,context)
	{
		var out = { isObject:true }
		out.Input = aa_first(data,profile,'Input',context);
		out.context = ajaxart.clone_context(context);
		var cvars = ajaxart.subprofiles(profile,'ContextVar');
		for(var i=0;i<cvars.length;i++) {
			var name = cvars[i].getAttribute('name');
			var val = ajaxart.run(data,cvars[i],'',out.context);
			out.context.vars[name] = val;
		}
		return [out];
	},
	XtmlTextSummary: function (profile,data,context)
	{
		var xtml = aa_first(data,profile,'Xtml',context);
		var text = aa_xtmldt_summarytext(xtml,"<br>");
		if (text == "" && xtml.getAttribute('t')) {
			ptdef = aa_component_definition(xtml.getAttribute('t'));
			if (aa_xpath(ptdef,'Param').length > 0)
			  text = '<img src="' + context.vars._Images[0] + '/studio/unsPipeIcon.gif" />';
		}

		return [text];
	},
	ToggleInnerTgpParams: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		var cssClass = aa_attach_global_css(aa_text(data,profile,'Css',context));

		function toComponentDef(field_data) {
			var pt = aa_totext(field_data) || '';
			var ptArr = pt.split('.');
			if (ptArr.length != 2) return null;
			var comp = ajaxart.components[ptArr[0]] && ajaxart.components[ptArr[0]][ptArr[1]];
			return comp;
		}
		function isCustomCss(field_data) {
			return aa_totext(field_data) == 'ui.CustomCss';
		}
		function isCustomizablePT(field_data) {
			var comp = toComponentDef(field_data);
			if (comp && comp.getAttribute('customAAEditor') == 'true') return false;
			var type = comp && comp.getAttribute('type');
			var typeDef = type && ajaxart.types[type.replace('.','_')];
			
//			if (typeDef && typeDef.getAttribute('style') == 'true') {
				// we're a style. now look for ui.CustomStyle or ui.CustomStyleByField
				var t = comp && aa_totext( aa_xpath(comp,'xtml/@t') );
				if (t == 'ui.CustomStyle' || t == 'ui.CustomStyleByField') return true;
//			}
			return false;
		}
		function isCustomPT(field_data) {
			var comp = toComponentDef(field_data);
			if (!comp) return false;
			return comp.getAttribute('customPT') == 'true';
		}
		function isCustomAAEditor(field_data) {
			var comp = toComponentDef(field_data);
			if (!comp) return false;
			return comp.getAttribute('customAAEditor') == 'true';
		}
		function hasParams(field_data) {
			var comp = toComponentDef(field_data);
			if (!comp) return false;
			var params = aa_xpath(comp,'Param');
			for(var i=0;i<params.length;i++) {
				if (params[i].getAttribute('light') == 'false') continue;
				if (params[i].getAttribute('hidden') == 'true') continue;
				return true;
			}
			return false;
		}
		function canConvertToMoreActions(field_data) {
			var comp = toComponentDef(field_data);
			var type = comp && comp.getAttribute('type');
			if (type == 'action.Action' && aa_totext(field_data) != 'operation.RunActions') return true;
			return false;
		}
		
		field.RefreshToggleInnerTgpParams = function(field,cell,field_data,fromUpdate,ctx) {
			jBart.bind(cell,'cleanWrapper',function() {
				cell.jbToggleButton = null;
			},'RefreshToggleInnerTgpParams');
			if (!cell.jbToggleButton) {
				jQuery(cell).addClass('xtml_dt_toggle_cell');
				var table = jQuery('<table class="xtml_dt_toggle_table" cellpadding="0" cellspacing="0"><tr/></table>');
				var tr = table.find('tr');
				var td1 = jQuery('<td style="vertical-align:top" class="xtml_dt_picklist"/>').appendTo(tr);
				var td2 = jQuery('<td style="vertical-align:top" class="xtmldt_toggle_td"/>').appendTo(tr);
				var td3 = jQuery('<td style="vertical-align:top" class="xtml_dt_share_td"/>').appendTo(tr);
				var td4 = jQuery('<td style="vertical-align:top" class="xtml_dt_customize_td"/>').appendTo(tr);

				while (cell.firstChild) td1[0].appendChild( cell.firstChild );
				
				cell.jbToggleButton = jQuery("<div style='cursor:pointer; margin: 6px 0 0 5px' class='aa_field_toolbar_image xtmldt_toggle_left'/>");
				td2.append(cell.jbToggleButton);
				cell.appendChild(table[0]);
				cell.jbEditButton = jQuery("<div style='cursor:pointer; margin: 6px 0 0 5px;display:none;' class='aa_field_toolbar_image xtmldt_edit_style'/>").attr('title',"Edit Style");
				cell.jbEditButton.css("background",'url('+aa_base_images()+'/studio/designer.png) no-repeat');
				
				cell.jbEditButton.click(function(e) {
					var xtml = cell.jbXtml;
					var ctx2 = aa_ctx(context,{_DomEvent: [e], ControlElement: [cell] });
					ajaxart.run([xtml],jBart.parsexml('<xtml t="field_dt.OpenCustomPTDesigner" />'),'',ctx2);
				});
				td2.append(cell.jbEditButton);

				cell.jbOpenAAEditor = jQuery("<div style='cursor:pointer; margin: 6px 0 0 5px;display:none;' class='aa_field_toolbar_image xtmldt_edit_style'/>").attr('title','Edit');
				cell.jbOpenAAEditor.css("background",'url('+aa_base_images()+'/studio/customize1616.gif) no-repeat');
				cell.jbOpenAAEditor.click(function(e) {
					cell.jbXtml = cell.jbXtml || (ctx && ajaxart.xml.xpath(ctx.vars._Item[0],field.Param)[0]);
					var xtml = cell.jbXtml;
					var comp = toComponentDef(field_data);
					var param = aa_totext(aa_xpath(comp,'Param/@name'));
					var ctx2 = aa_ctx(context,{_DomEvent: [e], ControlElement: [cell], _Param: [param] });
					ajaxart.run([xtml],jBart.parsexml('<xtml t="field_dt.OpenCustomAAEditor" />'),'',ctx2);
				});
				td2.append(cell.jbOpenAAEditor);
				
				cell.jbShareButton = jQuery("<div style='cursor:pointer; margin: 6px 0 0 5px;display:none;' class='aa_field_toolbar_image xtmldt_share'/>");
				cell.jbShareButton.css("background",'url('+aa_base_images()+'/studio/block_share.png) no-repeat').attr('title','Share your style (Make Global)');
				
				cell.jbShareButton.click(function(e) {
					var xtml = cell.jbXtml;
					var ctx2 = aa_ctx(context,{ ControlElement: [cell], FieldCellElement: [cell] });
					ajaxart.run([xtml],jBart.parsexml('<xtml t="field_dt.MakeStyleGlobal" />'),'',ctx2);
				});
				td3.append(cell.jbShareButton);
				
				cell.jbCustomize = jQuery("<div style='display:none;' class='aa_field_toolbar_image xtmldt_customize'/>");
				cell.jbCustomize.css("background",'url('+aa_base_images()+'/studio/custom.png) no-repeat');
				cell.jbCustomize.click(function(e) {
					var xtml = cell.jbXtml;
					var ctx2 = aa_ctx(context,{ ControlElement: [cell] , FieldCellElement: [cell] });
					ajaxart.run([xtml],jBart.parsexml('<xtml t="field_dt.DoCustomizeStyle" />'),'',ctx2);
				});
				td4.append(cell.jbCustomize);
				
				cell.jbMoreActions = jQuery("<div style='display:none;' class='aa_field_toolbar_image xtmldt_more_actions'/>");
				cell.jbMoreActions.css("background",'url('+aa_base_images()+'/studio/add_folder.png) no-repeat').attr('title','More Actions');
				cell.jbMoreActions.click(function(e) {
					var xtml = cell.jbXtml;
					var ctx2 = aa_ctx(context,{ ControlElement: [cell] , FieldCellElement: [cell] });
					ajaxart.run([xtml],jBart.parsexml('<xtml t="field_dt.MoreActions" />'),'',ctx2);
				});
				var td5 = jQuery('<td style="vertical-align:top" class="xtml_dt_more_actions"/>').append(cell.jbMoreActions).appendTo(tr);
			}
			var toggle = cell.jbToggleButton;
			cell.jbEditButton.hide();
			cell.jbShareButton.hide();
			cell.jbOpenAAEditor.hide();
			cell.jbCustomize.hide();
			cell.jbMoreActions.hide();
			
			if (isCustomizablePT(field_data) || isCustomCss(field_data)) {
				cell.jbCustomize.show();
				cell.jbCustomize.attr('title',isCustomCss(field_data) ? "Customize html and js" : "Customize Style");
			}
			if (isCustomPT(field_data)) {
				cell.jbEditButton.show();
				cell.jbShareButton.show();
				toggle.hide().css('display','none');
				return;
			}
			if (isCustomAAEditor(field_data)) {
				cell.jbOpenAAEditor.show();
				toggle.hide().css('display','none');
				return;
			}
			if (canConvertToMoreActions(field_data)) {
				cell.jbMoreActions.show();
			}
			if (! hasParams(field_data) ) { 
				toggle.hide();
				return;
			} else toggle.show();
			
		  toggle[0].RefreshExapndButton = function() {
		  	  var imageUrl = aa_base_images() + '/studio/' + (toggle[0].Expanded ? 'minus.gif' : 'plus.gif'); 
		  	  toggle.css('background','url('+imageUrl+') no-repeat');
		  }
		  	
		  	var defaultExpanded = fromUpdate ? true : false;
		  	var componentDef = toComponentDef(field_data);
		  	if (!defaultExpanded && componentDef && componentDef.getAttribute('autoexpand') == 'true') defaultExpanded = true;
		  	
		  	toggle[0].Expanded = defaultExpanded;
		  	toggle[0].RefreshExapndButton();

		  	toggle[0].onclick = function() {
  			  var pageElement = jQuery(cell.jbOptionsPageElement);
			  function endAnimation() {
			  	  toggle[0].RefreshExapndButton();
			  	  aa_htmlContentChanged(cell);		  	  
			  }
		  	  toggle[0].Expanded = !toggle[0].Expanded;
		  	  if (toggle[0].Expanded)
				pageElement.animate({height:'show'},200,endAnimation);
		  	  else 
			    pageElement.animate({height:'hide'},200,endAnimation);
		  	}
		  	if (!defaultExpanded) {
		  		jQuery(cell.jbOptionsPageElement).css('display','none');
		  	};
		}
		
		aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx) {
			cell.jbXtml = ajaxart.xml.xpath(ctx.vars._Item[0],field.Param)[0];
			jQuery(cell).addClass(cssClass);
			field.RefreshToggleInnerTgpParams(field,cell,field_data,false,ctx);
		});
		aa_field_handler(field,'OnUpdate',function(field,field_data,input){
			var cell = jQuery(input).parents('.xtml_dt_toggle_cell')[0];
			field.RefreshToggleInnerTgpParams(field,cell,field_data,true);
		});
	},
	StyleInProperties: function (profile,data,context)
	{
		// Used in jbart properties
		var field = context.vars._Field[0];

		var type = '', fieldData = [];
		
		if (data[0] && data[0].nodeType == 1) {
			var styleParam = aa_component_param_def(data[0].getAttribute('t'),'Style');
			if (!styleParam) {
				var fieldTypeParam = aa_component_param_def(data[0].getAttribute('t'),'FieldType');
				if (fieldTypeParam) {
					var defaultType = aa_totext( aa_xpath(fieldTypeParam,'Default/@t') );
					data = ajaxart.xml.xpath(data[0],'FieldType/@t',true,defaultType);
					styleParam = aa_component_param_def(data[0].getAttribute('t'),'Style');
				}
			}
			if (styleParam) {
				var defaultStyle = aa_totext( aa_xpath(styleParam,'Default/@t') ); 
				fieldData = ajaxart.xml.xpath(data[0],'Style/@t',true,defaultStyle);
				type = styleParam.getAttribute('type');
			}
		}
		
		field.RecalcOptions = function() {
			var out = ajaxart.runNativeHelper([type],profile,'Options',aa_ctx(context,{PT: fieldData }))[0];
			aa_initOptionsObject(out,context);
			return out;
		} 
		field.FieldData = function(data1,ctx) { return fieldData; }
		
		ajaxart.runNativeHelper(data,profile,'Aspects',context);
	},
	CleanXtmlOfParams: function (profile,data,context)
	{
		var prevComp = aa_text(data,profile,'PrevComponent',context);
		var xtml = data[0];
		
		if (prevComp == "" || xtml.getAttribute("t") == null || xtml.getAttribute("t") == "") return [];
		
		xtmldt_cleanXtmlOfParams(xtml,prevComp);
	},
	Object: function (profile,data,context)
	{
		var obj = { isObject: true , Xtml: ajaxart.run(data,profile,'Xtml',context) };
		obj.Preview = ajaxart.run(data,profile,'Preview',context);
		ajaxart_addMethod(obj,'RefreshPreview',profile,'RefreshPreview',context,'');
 	    var newContext = aa_ctx(context,{_XtmlObject: [obj]} );
 	    ajaxart.runsubprofiles(data,profile,'Aspect',newContext);
 	    
 	    return [obj];
	},
	Aspects: function (profile,data,context)
	{
		ajaxart.runsubprofiles(data,profile,'Aspect',context);
		return [];
	},
	OverrideObject: function (profile,data,context)
	{
		var obj = aa_first(data,profile,'Object',context);
		if (obj == null) return [];

		var newContext = aa_ctx(context,{_XtmlObject: [obj]} );
 	    ajaxart.runsubprofiles(data,profile,'Aspect',newContext);
		
		return [obj];
	},
	LightComponentsOfType: function (profile,data,context)
	{
	  if ( ! window.ajaxart_light_compoftype) {
		  ajaxart_light_compoftype = {};
		  for (var i in ajaxart.components) {
			  if (i.lastIndexOf("_dt") == i.length-3 && i.length > 3 || i == "aaeditor") continue;
			  for(var j in ajaxart.components[i]) {
				  var comp = ajaxart.components[i][j];
				  var type = comp.getAttribute('type');
				  if (type == null || type == 'data.Data') continue;
				  if (comp.getAttribute('hidden') == 'true' || comp.getAttribute('light') == 'false') continue;
			      if (ajaxart_light_compoftype[type] == null) {
			    	  ajaxart_light_compoftype[type] = [];
		    	  	  var typeXml = ajaxart.types[ type.replace("\.","_") ];
		    	  	  if (typeXml != null && typeXml.getAttribute('lightPTs') != null) {
 	    	  		    ajaxart_light_compoftype[type] = typeXml.getAttribute('lightPTs').split(',');
		    	  	  }
			      }
			      var fullid = "" + i + "." + j;
			      // do not add twice
			      if (ajaxart_arr_indexof(ajaxart_light_compoftype[type],fullid) == -1)
			    	  ajaxart_light_compoftype[type].push(fullid);
			  }
		  }
	  }
	  
	  var type = aa_text(data,profile,'Type',context);
	  var out = ajaxart_light_compoftype[type];
	  
	  if (out == null) out = [];
	  return out;
	},
	ComponentParams: function (profile,data,context)
	{
	  var full_id = aa_text(data,profile,'ComponentID',context);
	  var ns = full_id.split('.')[0];
	  var id = full_id.split('.')[1];
	  var component = ajaxart.components[ns][id];
	  
	  var result = [];
	  var params = ajaxart.xml.xpath(component,"Param");
	  for(var i=0;i<params.length;i++)
	  {
		  var param = params[i];
		  var paramName = param.getAttribute('name');
	  	  var field = { isObject : true };
		  field.Title = paramName;
		  field.Id = paramName;
		  field.Param = [param];

		  result.push(field);
		  
		  var type = param.getAttribute('type');
		  
		  var isPrimitive = true;
		  if (type != null && type != 'data.Data') isPrimitive = false;
		  
		  if (isPrimitive) {
		    var ControlFunc = function(paramName) { return function(data1,context1) {
		    	if (data1.length == 0) return [];
		    	var pt= aa_text(data,profile,'ComponentID',context);
		    	return ajaxart_xtmldt_primitive_control(data1[0],pt,paramName,context);
		    }};
		    var controlFunc = ControlFunc(paramName);
		  }
		  else 
		    var controlFunc = function(data,context1) { return []; }

		  var newContext = aa_ctx(context,{_Field: [field]} );
		  ajaxart_addScriptParam_js(field,'Control',controlFunc,newContext);

		  ajaxart.runsubprofiles(data,profile,'FieldAspect',newContext);
	  }
      return result;
	},
	ImageOfType: function (profile,data,context)
	{
		var type = aa_text(data,profile,'Type',context);
		if (aa_type_image[type] != null) return [aa_type_image[type]];
		
	    var typeDef = ajaxart.types[type.replace('.','_')]; 
		var obj = { isObject: true }
        ajaxart.runsubprofiles([],typeDef,'ComponentAspect',aa_ctx(context,{_Component: [obj]}));
		var image = aa_totext(obj.Image);
		aa_type_image[type] = image;
		
		return [image];
	},
	ComponentObject: function (profile,data,context)
	{
		var id = aa_text(data,profile,'Component',context);
		var obj = { isObject: true , Component: id}
		
   	    var middlePos = id.indexOf('.');
	    var ns = id.substring(0,middlePos);
	    var compName = id.substr(middlePos+1);

		if (ajaxart.components[ns] == null || ajaxart.components[ns][compName] == null) return [];
		var global = ajaxart.components[ns][compName];
		
	    var newContext = aa_ctx(context,{_Component: [obj]} );

	    var type = global.getAttribute('type');
		if (type != null) {
		  var typeDef = ajaxart.types[type.replace('.','_')]; 
  	      ajaxart.runsubprofiles([],typeDef,'ComponentAspect',newContext);
		}
		
	    ajaxart.runsubprofiles([],global,'Aspect',newContext);
		
		return [obj];
	},
	MakeLocal: function (profile,data,context)
	{
		var xtml = aa_first(data,profile,'Xtml',context);
		var implXtml = aa_first(data,profile,'ImplementationXtml',context);

		var implXtmlAsText = ajaxart.xml2text(implXtml);
		var params = aa_xpath(implXtml,'../Param');
		for(var i=0;i<params.length;i++) {
			var paramXml = jQuery(params[i]);
			var param = paramXml.attr('name');
			if (paramXml.attr('script') == 'true') continue;
			var value = aa_text(data,xtml,param,context);
			implXtmlAsText = implXtmlAsText.split('%$'+param+'%').join(value); // find-replace in js
		}
		return [ jBart.parsexml(implXtmlAsText,implXtml) ];
	},
	CssCustomize: function (profile,data,context)
	{
		var elem = data[0];
		if (elem == null || elem.parentNode == null) return [];
		if (elem == null || elem.tagName == "HTML" || elem.tagName == "BODY") elem = window.getSelection().focusNode;
		
		while (elem.parentNode) {
			if (elem.ajaxart != null) {
				var ctx = elem.ajaxart.params;
				if (ctx.vars._BartDevDtContext == null) return [];
				return ajaxart.runNativeHelper(data,profile,'Open',ctx);
			}
			
			elem = elem.parentNode;
		}
		return [];
	},
	GlobalOpenAAEditor: function (profile,data,context)
	{
		var elem = data[0];
		if (elem.tagName == "HTML" || elem.tagName == "BODY") elem = window.getSelection().focusNode;
		var firstBound = null;
		
		while (elem.parentNode) {
			if (elem.ajaxart && ! firstBound) firstBound=elem;
			
			if ( jQuery(elem).hasClass('aa_container') && elem.Cntr) {
				var cntr = elem.Cntr;
				var isXtmlDt = false;
				for(var i=0;i<cntr.Fields.length;i++)
					if (cntr.Fields[i].ParamXml) isXtmlDt = true;

				if (isXtmlDt) {
					var xtmlObj = { isObject:true, script: aa_items(cntr)[0] , input: [] }
					var ctx = aa_ctx(cntr.Context, { _Cntr: [cntr.Ctrl]} );
					return ajaxart.runNativeHelper([xtmlObj],profile,'OpenAAEditor',ctx);
				}
			}
			elem = elem.parentNode;
		}
		return [];
	    if (firstBound == null) return [];
		var xtmlObj = { isObject:true, script: firstBound.ajaxart.script , input: firstBound.ajaxart.data }
 	    return ajaxart.runNativeHelper([xtmlObj],profile,'OpenAAEditor',firstBound.ajaxart.params);
	},
	GlobalCustomize: function (profile,data,context)
	{
		var elem = data[0];
		if (elem.tagName == "HTML" || elem.tagName == "BODY") elem = window.getSelection().focusNode;
		
		var field = "";

		while (elem.parentNode) {
			if ( jQuery(elem).hasClass('field_control') ||  jQuery(elem).hasClass('aa_container')) 
			{
				var ctx = elem.XtmlSource ? elem.XtmlSource[0].context : elem.ajaxart.params;
				var page = aa_totext( ctx.vars.PageID );
				if (page != "") {
					var classes = elem.className.split(" ");
					for(var i=0;i<classes.length;i++)
						if (classes[i].substring(0,4) == "fld_")
							field = classes[i].substring(4);
					
				    return ajaxart.runNativeHelper([page],profile,'GoToPage',aa_ctx(ctx,{FieldPath: [field]}));
				}
			}
			elem = elem.parentNode;
		}
	},
	ProfileProperty: function (profile,data,context)
	{
		var xtml = aa_first(data,profile,'Profile',context);
		var param = aa_text(data,profile,'Param',context);
		var fieldScript = ajaxart.fieldscript(xtml,param,true);
		if (fieldScript) return [fieldScript];
		return [];
	},
	AggregatorFields: function (profile,data,context)
	{
		var items = ajaxart.run(data,profile,'Items',context);
		var fields = {};
		for (var i=0; i<items.length && i<5; i++) {
			var item = items[i];
			for (field_name in item)
				if (field_name != 'isObject' && field_name != 'XtmlSource' && !fields[field_name]) fields[field_name] = true;
		}
		var out = [];
		for (field_name in fields) {
			var field_obj = { isObject:true, FieldName:field_name, Desc:"" };
			var examples = 0;
			for (var i=0; i<items.length; i++) {
				if (items[i][field_name] != null) {
					if (examples > 0) { field_obj.Desc += ","; }
					if (examples == 4) { field_obj.Desc += '...'; break; }
					field_obj.Desc += items[i][field_name];
					examples++;
				}
			}
			out.push(field_obj);
		}
		return out;
	},
	TrimVariables: function (profile,data,context)
	{
		var text = data[0];
		var inside = false;
		var escape = false;
		var last_var_pos =0;
		for(var i=0;i<text.length-1;i++)
		{
			if(!escape) {
				if (text[i] == '\\') 
					escape = true;
				else if (text[i] == '%')
				{
					inside = !inside;
					last_var_pos = i;
				}
			}
			else
				escape = false;
		}
		if (inside)
			return [text.substring(last_var_pos)];
		return [""];
	}
}
//AA EndModule
var aa_type_image = {};
function ajaxart_xtmldt_primitive_control(xtml,pt,param,context)
{
	var out = document.createElement('div');
	out.className = 'xtml_dt_primitive';
	var text_and_button = jQuery('<table class="xtml_text_and_button" cellpadding="0" cellspacing="0"/>')[0];
	out.appendChild(text_and_button);
	var tr = jQuery('<tr/>')[0];
	text_and_button.appendChild(tr);
	
	var text_wrapper = document.createElement("SPAN");
	text_wrapper.className = 'xtml_text_wrapper';
	var calc_context = function() {
		if (text_wrapper["context"] != null) return;
		var itemToFocus = { ParentXtml: [xtml], Field: [param] };
		var preview_context = aadt_calcPrimitivePreviewContext(xtml,param,context);
		if (!preview_context[0]) {
			preview_context = aa_run_component("xtml_dt.CalcPreviewForXtml", [itemToFocus], context);
		}
		text_wrapper["context"] = preview_context;
	}
	var myFunc = function(text_wrapper,out) { return function() {
		var att_to_edit = xtml.getAttribute(param);
		var input;
		var java_script = ajaxart.totext_array(ajaxart.xml.xpath(xtml,param + "/@t")) == "data.JavaScript";
		if (att_to_edit == null && !java_script) {
			if (ajaxart.xml.xpath(xtml,param).length > 0) {
				input = document.createElement("INPUT");
				input.setAttribute("value", 'computed');
				text_wrapper.isAttr = false;
				input.readOnly=true;
				input.className = "xtml_dt_readonly";
				jQuery(input).click(function() {
					var dtcontext = { isObject:true }
					ajaxart_addScriptParam_js(dtcontext,'Refresh',refreshFunc,context);
					if (text_wrapper.isAttr) var isAttr = ["true"]; else var isAttr = [];
					calc_context();
					var newContext = aa_ctx(context,{_XtmlDtContext : [dtcontext] , 
						IsAttribute: isAttr , Xtml: [xtml] , Field: [param], _PrimitiveControl: [text_wrapper.firstChild], _Context: text_wrapper["context"] } );
					ajaxart.runComponent('xtml_dt.EditScriptOfPrimitive',[xtml],newContext);
				});
			}
			else att_to_edit = "";
		}
		if (java_script) {
			var update_callback = { isObject: true };
			ajaxart_addScriptParam_js(update_callback,'OnUpdate',updateFunc,context);
			ajaxart_addScriptParam_js(update_callback,'Context',calcContextAndAddPreview,context);
			var newcontext = aa_ctx(context,{_XtmlDt: [update_callback]});
			input = ajaxart.runComponent('xtml_dt.JavaScriptInlineEditor',ajaxart.childElems(xtml,param),newcontext)[0];
		}
		if (att_to_edit != null) {
			var updateFunc = function(obj) {
				var value = ajaxart.totext(obj)
				if (text_wrapper.DefaultValue != "" && !text_wrapper.OverridingDefaultValue && text_wrapper.DefaultValue != value)
					text_wrapper.OverridingDefaultValue = true;
				if (ajaxart.totext(obj) != "" || text_wrapper.OverridingDefaultValue) // if overriding default value, empty value is different than nothing
					xtml.setAttribute(param,value);
				else
					xtml.removeAttribute(param);
			};
			var calcContextAndAddPreview = function(data) {
				calc_context();
				if (out["preview_control"] != null)
					out.removeChild(out["preview_control"]);
				var newContext = aa_ctx(context,{ _Context: text_wrapper["context"] } );
				var preview_control = ajaxart.runComponent('aaeditor.PrimitiveTextPreview', data ,newContext)[0];
				out.appendChild(preview_control);
				out["preview_control"] = preview_control;
				
				return text_wrapper["context"];
			}
			var dummy_data = ajaxart.parsexml('<xml value=""/>');
			var current_val = ""
			if (xtml.getAttribute(param) != null ) {
				current_val = xtml.getAttribute(param);
				dummy_data.setAttribute("value",xtml.getAttribute(param));
			}
			var default_value = aa_get_default_value(pt,param);
			if (default_value && typeof(default_value) != "string" && default_value.nodeType) { //not empty none
				var default_val = (default_value.nodeType == 1) ? ajaxart.totext(ajaxart.xml.xpath(default_value,"@value")) : aa_totext([default_value]);
				text_wrapper.DefaultValue = default_val;
				if (xtml.getAttribute(param) == null)	// use default value if no value
					dummy_data.setAttribute("value",default_val);
				else
					text_wrapper.OverridingDefaultValue = true;
				}
			var update_callback = { isObject: true };
			ajaxart_addScriptParam_js(update_callback,'OnUpdate',updateFunc,context);
			ajaxart_addScriptParam_js(update_callback,'Context',calcContextAndAddPreview,context);
			var ptdef = aa_component_definition(pt);
			var paramXml = [];
			if (ptdef)
				paramXml = ajaxart.xml.xpath(ptdef,"Param[@name='" + param + "']");
			var newcontext = aa_ctx(context,{_XtmlDt: [update_callback], _ParamXml: paramXml});
			input = ajaxart.runComponent('aaeditor.EditPrimitiveTextBox',ajaxart.xml.xpath(dummy_data,"@value"),newcontext)[0];
			text_wrapper.isAttr = true;
		}
		while (text_wrapper.firstChild != null)
			text_wrapper.removeChild(text_wrapper.firstChild);
		text_wrapper.appendChild( input );
		aa_element_attached( input );
		ajaxart.runComponent('xtml_dt.RefreshPrimitivePreview',[],ajaxart.ui.contextWithCurrentControl(context,text_wrapper) );
	}}
	var refreshFunc = myFunc(text_wrapper,out);
	refreshFunc();
	var td1 = jQuery('<td/>')[0];
	td1.appendChild(text_wrapper);
	tr.appendChild(td1);
	
	var pop_button = document.createElement('span');
	pop_button.className = "xtml_dt_pop_button";

	pop_button.onclick = function() {
		var dtcontext = { isObject:true }
		if (text_wrapper.OverridingDefaultValue)
			dtcontext.DefaultValue = [text_wrapper.DefaultValue];
		ajaxart_addScriptParam_js(dtcontext,'Refresh',refreshFunc,context);
		
		if (text_wrapper.isAttr) var isAttr = ["true"]; else var isAttr = [];
		calc_context();
		var newContext = aa_ctx(context,{ControlElement : [pop_button] , _XtmlDtContext : [dtcontext] , 
			IsAttribute: isAttr , Xtml: [xtml] , Field: [param], _PrimitiveControl: [text_wrapper.firstChild], _Context: text_wrapper["context"] } );
		ajaxart.runComponent('xtml_dt.OpenPrimitiveControlPopup',[xtml],newContext);
	};
	
	var td2 = jQuery('<td/>')[0];
	td2.appendChild(pop_button);
	tr.appendChild(td2);
	
	return [out];
}
xtmldt_refreshMoreFields = function(top,xtml,context,pt)
{
	aa_empty(top);
  
  if (top.ShowAdvancedParams) {
	  var newContext = aa_ctx(context, { Component: [pt] });
	  var more = ajaxart.runComponent('xtml_dt.MoreFieldsHelper',xtml,newContext)[0]; 
	  top.appendChild(more);
	  
	  var showLess = jQuery('<a class="xtmldt_showless button_hyperlink">less...</a>')[0];
	  showLess.onmousedown = function(e) {
		  e = e || event;
	  	  if( e.button == 2 ) return true;
		  top.ShowAdvancedParams = false;
		  xtmldt_refreshMoreFields(top,xtml,context,pt);
	  }
	  top.appendChild(showLess);
  }
  else {
	  var showMore = jQuery('<a class="xtmldt_showmore button_hyperlink">more...</a>')[0];
	  showMore.onmousedown = function(e) {
		  e = e || event;
	  	  if( e.button == 2 ) return true;
		  top.ShowAdvancedParams = true;
		  xtmldt_refreshMoreFields(top,xtml,context,pt);
		  aa_ensure_visible(top);
	  }
	  var moreWrap = jQuery('<div />')[0];
	  moreWrap.appendChild(showMore);
	  top.appendChild(moreWrap);
  }
  
  aa_element_attached(top);
}
function aa_xtmldt_is_advanced_param(xtml,paramXml)
{
	if (paramXml.getAttribute('advanced') == 'always') return true;
	if (paramXml.getAttribute('advanced') != 'true') return false;
	if (!xtml) return true;
	var name = paramXml.getAttribute('name');
	var ptdef = aa_component_definition(xtml.getAttribute('t'));
	var attr = xtml.getAttribute(name);
	if (attr != null) {
		if (attr == "") return true;
		var ptdefval = ajaxart.totext_array(aa_xpath(ptdef,"Param[@name='" + name + "']/@Default"));
		if (ptdefval == '')
			ptdefval = ajaxart.totext_array(aa_xpath(ptdef,"Param[@name='" + name + "']/Default/@value"));
		return (attr == ptdefval);  // if not default it is not advanced
	}
	// not an attribute but an element
	var val = aa_xpath(xtml,name)[0];
	if (!val) return true;
	var ptdefval = aa_xpath(ptdef,"Param[@name='" + name + "']/Default")[0];
	if (!ptdefval) return false;
	
	// now compare val and ptdefval (except for the tag)
	var tmpVal = val.ownerDocument.createElement('Default');
	ajaxart.xml.copyElementContents(tmpVal,val);
	
	return ajaxart.xml2text(tmpVal) == ajaxart.xml2text(ptdefval);
}
function aa_xtmldt_summarytext(xtml,sep)
{
	var text = "";
	var pt = xtml.getAttribute('t');
	if (!pt) return "";
	var ptdef = aa_component_definition(pt);
	var params = ajaxart.xml.xpath(ptdef,"Param");
	for (var i=0;i<params.length;i++) {
		if (params[i].getAttribute('light') == 'false' || params[i].getAttribute('summary') == 'false') continue;

		var param = params[i].getAttribute('name');
		var type = params[i].getAttribute('type') || 'data.Data';
		var isBasicType = ( aa_textInList(type,["data.Data","data.Boolean","ui.Control"]) );  
		var extra_text = "";
		if (xtml.getAttribute(param) != null) {
			var def = aa_totext(aa_xpath(params[i],'@Default'));
			if (def == '') def = aa_totext(aa_xpath(params[i],'Default/@value'));
			if (xtml.getAttribute(param) == def) continue;
			var val = xtml.getAttribute(param);
			if (val.length < 50)
			  extra_text = param + ": " + xtml.getAttribute(param);
			else
			  extra_text = param + ": ...";
		}
		else {
			var elems = aa_xpath(xtml,param);
			if (elems.length == 1) {
				if (isBasicType) extra_text = param + ": " + "...";
				else {
					var t = elems[0].getAttribute('t');
					var def = aa_totext(aa_xpath(params[i],'Default/@t'));
					if (t && t != "" && t != def) {
					  var innerText = aa_xtmldt_summarytext(elems[0]," , ");
					  extra_text = param + ": " + t.substring(t.indexOf('.')+1);
					  if (innerText != "")
						  if (innerText.length < 10 ) extra_text += " ( " + innerText + " ) ";
						  else extra_text += ' ...';
					}
				}
			}
		}
		if (extra_text == "") continue;
		if (text != "") text += sep;
		text += extra_text;
	}
	return text;
}
function xtmldt_switch_pt(currT,newT,top_xtml,param,context)
{
	var xtml = aa_xpath(top_xtml,'!'+param)[0];
	var new_pt = aa_component_definition(newT);
	var generator = aa_xpath(new_pt,'ParamGenerator')[0];
	
	if (generator) var prev_xtml = xtml.cloneNode(true);
	
	ajaxart.writevalue(aa_xpath(top_xtml,'!'+param+'/@t'),newT);
	xtmldt_cleanXtmlOfParams(xtml,currT);

	if (generator) 
		ajaxart.run([xtml],generator,'',aa_ctx(context,{ PrevXtml: [prev_xtml] }));
}
function xtmldt_cleanXtmlOfParams(xtml,prevComp)
{
	var ptDef = aa_component_definition(xtml.getAttribute("t"));
	var prevPtDef = aa_component_definition(prevComp);
	
	if ( aa_hasAttribute(ptDef,'decorator') && prevComp != '') {
		var param = ptDef.getAttribute('decorator');
		var inner = xtml.ownerDocument.createElement(param);
		ajaxart.xml.copyElementContents(inner,xtml);
		inner.setAttribute('t',prevComp);
		var outer = xtml.ownerDocument.createElement(aa_tag(xtml));
		outer.setAttribute('t',xtml.getAttribute('t'));
		outer.appendChild(inner);
		
		xtml.parentNode.replaceChild(outer, xtml);
		return [];
	}
	for (var i=0; i<xtml.attributes.length; i++) {
		var name = xtml.attributes.item(i).name;
		if (name != "t" && name != "name") {
			var remove = true;
			var paramDef = ajaxart.xml.xpath(ptDef,"Param[@name='"+name+"']");
			if (paramDef.length == 0 || aa_component_param_type(ptDef,name) != aa_component_param_type(prevPtDef,name)) { 
			  xtml.removeAttribute(name);
			  i--;
			}
		}
	}
	var elems = ajaxart.xml.xpath(xtml,"*");
	for(var i=0;i<elems.length;i++) {
		var name = elems[i].tagName;

		var paramDef = ajaxart.xml.xpath(ptDef,"Param[@name='"+name+"']");
		if (paramDef.length == 0 || aa_component_param_type(ptDef,name) != aa_component_param_type(prevPtDef,name)) 
		  elems[i].parentNode.removeChild(elems[i]);
	}
}

// AA BeginModule
ajaxart.gcs.xtml_dt_tree = {
	TreeDataItems : function(profile, data, context) {
		var out = {
			isObject : true,
			Top : true,
			Xtml : aa_first(data, profile, 'TopXtml', context),
			Type : aa_text(data, profile, 'Type', context)
		};
		var topObj = {
			isObject : true,
			ParentXtml : out.Xtml,
			Top : true,
			Type : aa_text(data, profile, 'Type', context)
		};
		topObj.ParamXml = ajaxart.parsexml("<Param type='" + topObj.Type
				+ "' script='true' />", "top param", null, false);
		out.Items = [ topObj ];
		if (aa_tag(topObj.ParentXtml) == 'Component')
			topObj.Component = true;
		aa_xtmldt_setnextlevel(out, context);
		aa_xtmldt_setfunctions(topObj);

		return [ out ];
	},
	SaveManager : function(profile, data, context) {
		return [ aa_save_manager ];
	},
	FindTreeTopInDialog : function(profile, data, context) {
		var dialog = context.vars.ControlElement[0];
		return [ jQuery(dialog).find(".aa_xtml_tree").find(">ul").find(">li")
				.find(">.aa_text")[0] ];
	},
	TreeObject : function(profile, data, context) {
		var top = {
			isObject : true
		};
		// putting properties and methods
	for ( var elem = profile.firstChild; elem != null; elem = elem.nextSibling) {
		if (elem.nodeType == 1) {
			var tag = elem.tagName;
			var name = elem.getAttribute('name');
			if (name == null || name == "")
				continue;
			if (tag == 'Property') {
				top[name] = ajaxart.run(data, elem, '', context);
			} else if (tag == 'Method') {
				ajaxart_addMethod(top, name, elem, '', context);
			}
		}
	}
	top.SetTreeTop = function(item, ctx) {
		var top = this;
		top.TreeTop = jQuery(ctx.vars._Cntr[0].Ctrl).find(".aa_listtop").find(
				">.aa_item")[0];
		// calc path
		top.Path = "";
		for ( var current = top.TopXtml[0]; current != null
				&& current.getAttribute; current = current.parentNode) {
			if (aa_tag(current) == 'Component') {
				top.Path = current.getAttribute("id") + "/" + top.Path;
				break;
			}
			var current_text = aa_tag(current);
			var id = null;
			if (current.getAttribute("ID"))
				id = current.getAttribute("ID");
			if (current.getAttribute("name"))
				id = current.getAttribute("name");
			if (id)
				current_text += "[" + id + "]";
			top.Path = current_text + "/" + top.Path;
		}
		if (top.Path.lastIndexOf("/") == top.Path.length - 1)
			top.Path = top.Path.substring(0, top.Path.length - 1);
		ajaxart.log(top.Path);
	};
	top.KeepCurrentPath = function(item, ctx) {
		var top = this;
		var current_elem = ctx.vars._ElemsOfOperation;
		var path = "";
		while (!current_elem[0].ItemData[0].Top) {
			var text = current_elem[0].ItemData[0].Text(
					current_elem[0].ItemData, ctx)[0].split(" =")[0];
			path = text + ((path == "") ? "" : "/" + path);
			current_elem = jQuery(current_elem[0]).parents('.aa_item');
		}
		ajaxart.cookies.writeCookie("aaeditor_path", path);
	}
	top.GoToPreviousPath = function(item, ctx) {
		var top = this;
		var path = ajaxart.cookies.valueFromCookie("aaeditor_path");
		if (path == null)
			return;
		var current_elem = top.GoToPath(path, ctx);
		if (current_elem)
			ajaxart_uiaspects_select(jQuery(current_elem), jQuery(), "auto",
					ctx, true);
	};
	top.GoToPath = function(path, ctx) {
		var top = this;
		var current_elem = top.TreeTop;
		if (path == "")
			return current_elem;
		var path_items = path.split("/");
		for ( var i = 0; i < path_items.length; i++) {
			if (!current_elem)
				continue;
			// var pt = current_elem.ItemData[0].ParentXtml.getAttribute("t");
			// if (pt && path_items[i] == pt.split(".")[1]) {
			// // goto component
			// current_elem.ItemData[0].ShowGoto = true;
			// current_elem = aa_xtmldt_refresh_elem(ctx,[current_elem])[0];
			// }
			if (current_elem.collapsed)
				ctx.vars._Cntr[0].CollapseElem(jQuery(current_elem), false);
			var sub_elems = jQuery(current_elem).children('.aa_list').children(
					'.aa_item');
			current_elem = null;
			for ( var j = 0; j < sub_elems.length; j++) {
				if (jQuery(sub_elems[j]).children('.aa_text').text()
						.split(" =")[0] == path_items[i]) {
					current_elem = sub_elems[j];
					break;
				}
			}
		}
		// if (current_elem == null) { ajaxart.log("cannot find " +
		// path,"error"); return null; }
		return current_elem;
	};
	top.Undo = function(item, ctx) {
		var top = this;
		var current_elem = null, undo_operation;
		var stack = (!ctx.vars.Redo) ? ctx.vars._UndoData[0].UndoOperations
				: ctx.vars._UndoData[0].RedoOperations;
		if (stack.length == 0)
			return [];
		if (!ctx.vars.GotoLastEdit)
			undo_operation = stack.pop();
		else
			undo_operation = stack[stack.length - 1];
		var current_elem = top.GoToPath(undo_operation.Path, ctx);
		if (!current_elem)
			return;
		if (ctx.vars.GotoLastEdit) {
			ajaxart_uiaspects_select(jQuery(current_elem), jQuery(), "auto",
					ctx, true);
			return [];
		}
		var func = current_elem.ItemData[0][undo_operation.Operation];
		func(current_elem.ItemData, aa_ctx(ctx, {
			Undo : [ ctx.vars.Redo == null ],
			Value : undo_operation.Primitive,
			Xml : undo_operation.Component,
			_ElemsOfOperation : [ current_elem ],
			Direction : undo_operation.Direction
		}));
	};
	return [ top ];
}
}
// AA EndModule
function aa_xtmldt_setfunctions(obj) {
	obj._Type = [ obj.Type ];
	obj._ParamXml = [ obj.ParamXml ];
	if (obj.Param)
		obj._Param = [ obj.Param ];
	obj.Text = function(item, ctx) {
		if (obj.Component)
			return [ obj.ParentXtml.getAttribute("id") ];
		var param = obj.Param, xtml = obj.ParentXtml;
		if (obj.ArrayExtra)
			return [ param + "[+]" ];
		if (aa_is_static_bool(obj) && param)
			return [ param ];
		var out = obj.Top ? "" : param + " = ";
		if (obj.ParamXml != null && obj.ParamXml.getAttribute("title") != null)
			out = obj.ParamXml.getAttribute("title") + " = ";
		if (obj.IsArrayItem) {
			out = param + "[" + (obj.Index + 1) + "] = ";
			elems = ajaxart.xml.xpath(obj.ParentXtml, obj.Param + "["
					+ (1 + obj.Index) + "]");
		} else if (obj.Top) {
			elems = [ obj.ParentXtml ];
		} else {
			var att = obj.ParentXtml.getAttribute(obj.Param);
			if (att != null)
				return [ ajaxart.xmlescape(out + att) ];
			elems = ajaxart.childElems(obj.ParentXtml, obj.Param);
		}
		if (elems.length == 0)
			return [ ajaxart.xmlescape(out) ];
		if (obj.HasName && elems[0].getAttribute("name") != null) // Var,
																	// Param
			out = param + "[" + elems[0].getAttribute("name") + "]" + " = ";
		var value = elems[0].getAttribute("value");
		if (value != null)
			out = out + value;
		else {
			var type = elems[0].getAttribute("t");
			if (type == null) {
				out = out.replace(" = ", "");
				if (ctx.vars.AddTextSummary
						|| (ctx.vars._ItemElement != null && ctx.vars._ItemElement[0].collapsed)) {
					if (elems[0].tagName == 'Case'
							&& elems[0].getAttribute('If'))
						out += ": " + elems[0].getAttribute('If');
					if (elems[0].tagName == 'Case'
							&& elems[0].getAttribute('IfCondition'))
						out += ": " + elems[0].getAttribute('IfCondition');
					if (elems[0].getAttribute('Remark') != null
							&& elems[0].getAttribute('Remark') != "")
						out += " : " + elems[0].getAttribute('Remark');
				}
				return [ ajaxart.xmlescape(out) ];
			}
			out = out + elems[0].getAttribute("t").split("\.")[1];
			// summary
			if (ctx.vars.AddTextSummary
					|| (ctx.vars._ItemElement != null && ctx.vars._ItemElement[0].collapsed)) {
				if (elems[0].getAttribute('Remark') != null
						&& elems[0].getAttribute('Remark') != "")
					out += ": " + elems[0].getAttribute('Remark');
				else {
					var ptdef = aa_component_definition(elems[0]
							.getAttribute("t"));
					var params_to_show = [];
					if (ptdef != null) {
						var params = ajaxart.xml.xpath(ptdef,
								"Param[@essential='true']");
						for ( var i = 0; i < params.length; i++)
							params_to_show.push(params[i].getAttribute("name"));
					}
					var texts_to_add = [];
					for ( var i = 0; i < params_to_show.length; i++) {
						var text = elems[0].getAttribute(params_to_show[i]);
						if (text != null)
							texts_to_add.push(text);
						else {
							var sub_elems = ajaxart.childElems(elems[0],
									params_to_show[i]);
							for ( var j = 0; j < sub_elems.length; j++) {
								if (sub_elems[j].getAttribute("value") != null)
									texts_to_add.push(sub_elems[j]
											.getAttribute("value"));
								else {
									var t = sub_elems[j].getAttribute("t");
									if (t != null && t.indexOf(".") != -1)
										texts_to_add.push(t.split("\.")[1]);
								}
							}
						}
					}
					var items_added = 0;
					for ( var i = 0; i < texts_to_add.length; i++) {
						if (texts_to_add[i] == null || texts_to_add[i] == "")
							break;
						if (items_added == 3) {
							out += ", ...";
							break;
						}
						out += (items_added == 0 ? ": " : ", ")
								+ texts_to_add[i];
						items_added++;
					}
				}
			}
		}
		if (out.length > 50)
			out = out.substring(0, 47) + "...";
		return [ ajaxart.xmlescape(out) ];
	}
	obj.Update = function(item, ctx) {
		aa_xtmldt_writeundodata(ctx.vars._ElemsOfOperation, ctx);
		var cntr = aa_xtmldt_treecntr(ctx);
		var value = ajaxart.totext_array(ctx.vars.Value);
		var primitive = value.match(/^=[a-z_A-Z0-9]+[.][a-z_A-Z0-9]+$/) == null;
		var xml = ajaxart.totext_array(ctx.vars.Xml), xml_elem = null;
		if (xml != "") {
			xml_elem = ajaxart.parsexml(xml, "script update", null, false,
					obj.ParentXtml);
			if (xml_elem == null)
				return [];
			var desired_tag = (obj.Top) ? aa_tag(obj.ParentXtml) : obj.Param;
			if (aa_tag(xml_elem) != desired_tag) {
				var new_elem = aa_createElement(obj.ParentXtml, desired_tag);
				ajaxart.xml.copyElementContents(new_elem, xml_elem);
				xml_elem = new_elem;
			}
		}
		if (obj.ArrayExtra) {
			var elem = aa_createElement(obj.ParentXtml, obj.Param);
			if (primitive)
				elem.setAttribute("value", value);
			else
				elem.setAttribute("t", value.substring(1));
			if (xml_elem != null)
				elem = xml_elem;
			obj.ParentXtml.appendChild(elem);

			obj.ArrayExtra = false;
			var new_item = {
				isObject : true,
				ParentXtml : obj.ParentXtml,
				ParamXml : obj.ParamXml,
				Param : obj.Param,
				Type : obj.Type,
				Index : obj.Index + 1,
				IsArrayItem : true,
				ArrayExtra : true
			};
			aa_xtmldt_setfunctions(new_item);
			var current_elem = jQuery(ctx.vars._ElemsOfOperation);
			if (cntr) {
				var new_elem = ajaxart_uiaspects_addElement( [ new_item ], cntr);
				jQuery(new_elem).insertAfter(current_elem);
			}
		} else if (obj.IsArrayItem) {
			var old_elem = ajaxart.xml.xpath(obj.ParentXtml, obj.Param + "["
					+ (1 + obj.Index) + "]")[0];
			var new_elem = aa_createElement(obj.ParentXtml, obj.Param);
			if (old_elem.getAttribute("name") != null)
				new_elem.setAttribute("name", old_elem.getAttribute("name"));
			var vars = ajaxart.childElems(old_elem, "Var"); // coping old vars
			for (i in vars)
				new_elem.appendChild(aa_importNode(vars[i].cloneNode(true),
						new_elem));
			if (primitive)
				new_elem.setAttribute("value", value);
			else
				obj.SwitchComponent(new_elem,value.substring(1));
			if (xml_elem != null)
				new_elem = xml_elem;
			ajaxart.replaceXmlElement(old_elem, new_elem, false);
		} else if (obj.Param == "name") {
			obj.ParentXtml.setAttribute("name", value.replace(new RegExp(
					"[^a-zA-Z_0-9]", "g"), ""));
			// refresh text of parent
			aa_invoke_cntr_handlers(
					cntr,
					cntr.RefreshItemTextAndImage,
					[ jQuery(ctx.vars._ElemsOfOperation[0]).parents('.aa_item')[0] ],
					ctx);
		} else if (obj.OnlyPrimitive) {
			obj.ParentXtml.setAttribute(obj.Param, value);
		} else if (xml_elem != null) {
			if (obj.Top)
				ajaxart.xml.copyElementContents(obj.ParentXtml, xml_elem);
			else {
				var old_elem = ajaxart.childElem(obj.ParentXtml, obj.Param);
				if (old_elem != null)
					ajaxart.replaceXmlElement(old_elem, xml_elem, false);
				else
					obj.ParentXtml.appendChild(xml_elem);
				obj.ParentXtml.removeAttribute(obj.Param);
			}
		} else if (obj.Top) {
			if (xml_elem != null)
				obj.ParentXtml = xml_elem;
			else if (primitive)
				obj.ParentXtml.setAttribute("value", value);
			else
				// component
				obj.SwitchComponent(obj.ParentXtml,value.substring(1));
		} else if (primitive && obj.OnlyElement) { // only element (line "xtml"
													// of component)
			var elem = ajaxart.childElem(obj.ParentXtml, obj.Param);
			if (elem == null) {
				elem = aa_createElement(obj.ParentXtml, obj.Param);
				obj.ParentXtml.appendChild(elem);
			}
			elem.setAttribute("value", value);
		} else if (primitive) { // single primitive
			obj.ParentXtml.setAttribute(obj.Param, value);
			var elem = ajaxart.childElem(obj.ParentXtml, obj.Param);
			if (elem != null)
				elem.parentNode.removeChild(elem);
		} else { // single component
			var component = value.substring(1);
			obj.ParentXtml.removeAttribute(obj.Param);
			var elem = ajaxart.childElem(obj.ParentXtml, obj.Param);
			if (elem == null) {
				elem = aa_createElement(obj.ParentXtml, obj.Param);
				obj.ParentXtml.appendChild(elem);
			}
			obj.SwitchComponent(elem, component);
		}
		if (ctx.vars._ElemsOfOperation != null) { // refresh
			aa_save_manager.MarkAsModified( [ obj.ParentXtml ], ctx);
			var new_elem = aa_xtmldt_refresh_elem(ctx,
					ctx.vars._ElemsOfOperation);
			cntr.CollapseElem(jQuery(new_elem[new_elem.length - 1]), true);
			aa_after_update(obj, aa_ctx(ctx, {
				_ElemsOfOperation : new_elem,
				_ItemsOfOperation : new_elem[0].ItemData
			}));
			if (ctx.vars._XtmlTreeObj)
				ajaxart_runMethod( [], ctx.vars._XtmlTreeObj[0],
						"RefreshLocalPreview", aa_ctx(ctx, {
							_Item : [ new_elem[0].ItemData ]
						}));
		}
		if (obj.Param == 'type')	// maybe updating type of component, refreshing components cache
			aa_search_comp_of_type_cache = null;
		ajaxart.xml.xml_changed(obj.ParentXtml);
	}
	obj.SwitchComponent = function(xtml, newComponent) {
		var oldComponent = xtml.getAttribute("t");
		xtml.setAttribute("t",newComponent);
		if (oldComponent)
			xtmldt_cleanXtmlOfParams(xtml,oldComponent);
	},
	obj.Delete = function(item, ctx) {
		var new_selected;
		if (obj.Top)
			return;
		if (obj.Param == "name")
			return;
		if (obj.IsArrayItem) {
			if (obj.ArrayExtra)
				return [];
			var parent_item = jQuery(ctx.vars._ElemsOfOperation).parents(
					'.aa_item');
			aa_xtmldt_writeundodata(parent_item, ctx);// write undo data of
														// parent
			aa_save_manager.MarkAsModified( [ obj.ParentXtml ], ctx);
			var xml_elem = ajaxart.xml.xpath(obj.ParentXtml, obj.Param + "["
					+ (1 + obj.Index) + "]")[0];
			xml_elem.parentNode.removeChild(xml_elem);
			new_selected = jQuery(ctx.vars._ElemsOfOperation).next();
			jQuery(ctx.vars._ElemsOfOperation).remove();
			ajaxart_uiaspects_select(new_selected, jQuery(), "auto", ctx, true);
			// refresh the index of siblings
			for ( var sibling = new_selected[0]; sibling != null; sibling = sibling.nextSibling) {
				if (sibling.ItemData[0].Param == obj.Param) {
					sibling.ItemData[0].Index--;
					jQuery(sibling).children('.aa_text').text(
							sibling.ItemData[0].Text(sibling.ItemData, ctx)[0]);
				}
			}
		} else { // not an array
			var parent_item = jQuery(ctx.vars._ElemsOfOperation).parents(
					'.aa_item');
			aa_xtmldt_writeundodata(parent_item, ctx);// write undo data of
														// parent
			obj.ParentXtml.removeAttribute(obj.Param);
			var elem = ajaxart.childElem(obj.ParentXtml, obj.Param);
			if (elem != null)
				elem.parentNode.removeChild(elem);
			aa_save_manager.MarkAsModified( [ obj.ParentXtml ], ctx);
			if ((obj.ParamXml == null || obj.ParamXml.getAttribute("essential") != "true")
					&& ajaxart.totext_array(ctx.vars._HideEmpties) == "true") {
				// remove from tree
				new_selected = jQuery(ctx.vars._ElemsOfOperation).next();
				if (new_selected.length == 0)
					new_selected = jQuery(ctx.vars._ElemsOfOperation).prev();
				if (new_selected.length == 0)
					new_selected = jQuery(ctx.vars._ElemsOfOperation).parent()
							.parent();
				jQuery(ctx.vars._ElemsOfOperation).remove();
				ajaxart_uiaspects_select(new_selected, jQuery(), "auto", ctx,
						true);
			} else { // refresh
				new_selected = ajaxart_uiaspects_refreshElements(
						ctx.vars._ElemsOfOperation, true);
				ajaxart_uiaspects_select(
						jQuery(new_selected[new_selected.length - 1]),
						jQuery(), "auto", ctx, true);
				cntr.CollapseElem(
						jQuery(new_selected[new_selected.length - 1]), true);
			}
		}
		aa_after_update(obj, aa_ctx(ctx, {
			_ElemsOfOperation : [ new_selected[0] ],
			_ItemsOfOperation : new_selected[0].ItemData
		}));
		ajaxart.xml.xml_changed(obj.ParentXtml);
	}
	obj.AsPrimitive = function(item, ctx) {
		var elems;
		if (obj.IsArrayItem) {
			if (obj.ArrayExtra)
				return "";
			elems = ajaxart.xml.xpath(obj.ParentXtml, obj.Param + "["
					+ (1 + obj.Index) + "]");
		} else if (obj.Top) {
			elems = [ obj.ParentXtml ];
		} else {
			var att = obj.ParentXtml.getAttribute(obj.Param);
			if (att != null)
				return [ att ];
			elems = ajaxart.childElems(obj.ParentXtml, obj.Param);
		}
		if (elems.length == 0)
			return [];
		var value = elems[0].getAttribute("value");
		if (value != null)
			return [ value ];
		if (elems[0].getAttribute("t") == null)
			return [ "" ];
		return [ "=" + elems[0].getAttribute("t") ];
	}
	obj.GetXtml = function(item, ctx) {
		if (obj.Top)
			return [ obj.ParentXtml ];
		else if (obj.IsArrayItem) {
			if (obj.ArrayExtra)
				return [];
			return ajaxart.xml.xpath(obj.ParentXtml, obj.Param + "["
					+ (1 + obj.Index) + "]");
		} else {
			if (obj.ParentXtml.getAttribute(obj.Param) != null) { // primitive
				var atts = obj.ParentXtml.attributes;
				for ( var j = 0; j < atts.length; j++)
					if (atts.item(j).nodeName == obj.Param)
						return [ atts.item(j) ];
			} else
				// component
				return ajaxart.childElems(obj.ParentXtml, obj.Param);
		}
	}
	obj.AsXml = function(item, ctx, dont_create_for_null) {
		var elems;
		if (obj.IsArrayItem) {
			if (obj.ArrayExtra)
				return [];
			return ajaxart.xml.xpath(obj.ParentXtml, obj.Param + "["
					+ (1 + obj.Index) + "]");
		}
		if (obj.Top || obj.Component) {
			return [ obj.ParentXtml ];
		} else {
			elems = ajaxart.childElems(obj.ParentXtml, obj.Param);
			if (elems.length > 0)
				return elems;
			else if (dont_create_for_null)
				return [];
			else { // primitive or empty
				var att = obj.ParentXtml.getAttribute(obj.Param);
				if (att == null)
					att = "";
				var xml = aa_createElement(obj.ParentXtml, obj.Param);
				xml.setAttribute("value", att);
				return [ xml ];
			}
		}
	}
	obj.Copy = function(item, ctx) {
		ajaxart.xtml_clipboard = {
			isObject : true
		};
		if (obj.ArrayExtra)
			return [];
		var xml = obj.AsXml(item, ctx)[0].cloneNode(true);
		xml.removeAttribute('name');	// when copying-pasting variables and params, we don't copy the name
		ajaxart.xtml_clipboard.Xml = ajaxart.xml2text(xml);
	}
	obj.Cut = function(item, ctx) {
		obj.Copy(item, ctx);
		obj.Delete(item, ctx);
	}
	obj.Paste = function(item, ctx) {
		if (ajaxart.xtml_clipboard == null)
			return;
		obj.Update(item, aa_ctx(ctx, {
			Xml : [ ajaxart.xtml_clipboard.Xml ]
		}));
	}
	obj.Move = function(item, ctx) {
		var direction = ajaxart.totext_array(ctx.vars.Direction);
		if (!obj.IsArrayItem || obj.ArrayExtra)
			return;
		var xml_elem = ajaxart.xml.xpath(obj.ParentXtml, obj.Param + "["
				+ (1 + obj.Index) + "]")[0];
		var diff = (direction == "down") ? 1 : -1;
		var new_xml_elem = ajaxart.xml.xpath(obj.ParentXtml, obj.Param + "["
				+ (1 + obj.Index + diff) + "]");
		if (new_xml_elem.length == 0)
			return;
		var elem = jQuery(ctx.vars._ElemsOfOperation[0]);
		if (direction == "down") {
			new_xml_elem[0].parentNode.insertBefore(new_xml_elem[0], xml_elem);
			obj.Index++;
			elem.next()[0].ItemData[0].Index--;
			aa_invoke_cntr_handlers(ctx.vars._Cntr[0],
					ctx.vars._Cntr[0].RefreshItemTextAndImage, [ elem[0] ], ctx);
			aa_invoke_cntr_handlers(ctx.vars._Cntr[0],
					ctx.vars._Cntr[0].RefreshItemTextAndImage,
					[ elem.next()[0] ], ctx);
			elem.insertAfter(elem.next());
		} else {
			new_xml_elem[0].parentNode.insertBefore(xml_elem, new_xml_elem[0]);
			obj.Index--;
			elem.prev()[0].ItemData[0].Index++;
			aa_invoke_cntr_handlers(ctx.vars._Cntr[0],
					ctx.vars._Cntr[0].RefreshItemTextAndImage, [ elem[0] ], ctx);
			aa_invoke_cntr_handlers(ctx.vars._Cntr[0],
					ctx.vars._Cntr[0].RefreshItemTextAndImage,
					[ elem.prev()[0] ], ctx);
			elem.prev().insertAfter(elem);
		}
		if (ctx.vars._Cntr)
			ajaxart_uiaspects_select(elem, jQuery(), "auto", ctx, true);
		aa_xtmldt_writeundodata(elem, ctx, {
			isObject : true,
			Operation : "Move",
			Direction : [ (direction == "down" ? "up" : "down") ]
		});
	}
	obj.HasNoContent = function(item, ctx) {
		if (obj.ArrayExtra)
			return [ "true" ];
		if (obj.Top)
			return [];
		if (obj.IsArrayItem)
			return [];
		var elems = ajaxart.childElems(obj.ParentXtml, obj.Param);
		if (elems.length > 0)
			return [];
		if (obj.ParentXtml.getAttribute(obj.Param))
			return [];
		return [ "true" ];
	}
	obj.IsActionDisabled = function(item, ctx) {
		var op = ajaxart.totext_array(ctx.vars.Operation);
		if (op == "Paste" && ajaxart.xtml_clipboard != null)
			return [];
		if (op == "MoveDown"
				&& obj.IsArrayItem
				&& !obj.ArrayExtra
				&& ajaxart.xml.xpath(obj.ParentXtml, obj.Param + "["
						+ (2 + obj.Index) + "]").length > 0)
			return [];
		if (op == "MoveUp" && obj.IsArrayItem && !obj.ArrayExtra
				&& obj.Index > 0)
			return [];
		if (op == "OpenAAEditor" && obj.Top && ctx.vars.AAEditorState)
			return [];
		return [ "true" ];
	}
	obj.ParamsToAdd = function(item, ctx) {
		var as_xml = obj.AsXml(item, ctx, true);
		if (as_xml.length == 0)
			return [];
		var out = [];
		var ptdef = pt_def(as_xml[0], obj);
		if (ptdef != null) {
			var params = ajaxart.xml.xpath(ptdef, "Param");
			for ( var i = 0; i < params.length; i++) {
				var paramXml = params[i];
				var alreadyExists = false;
				if (ctx.vars._ElemsOfOperation) {
					var sub_elems = jQuery(ctx.vars._ElemsOfOperation[0])
							.children('.aa_list').children('.aa_item');
					for (j = 0; j < sub_elems.length; j++)
						if (sub_elems[j].ItemData[0].Param == paramXml
								.getAttribute("name"))
							alreadyExists = true;
				}
				if (!alreadyExists)
					out.push(paramXml);
			}
		}
		out.push(ajaxart.parsexml("<Param name='Var' title='Variable' icon='"
				+ ctx.vars._Images[0] + "/studio/bucket.jpg' />"));
		if (ptdef && ptdef.getAttribute("id") != null) {
			out.push(ajaxart.parsexml("<Param name='"
					+ ptdef.getAttribute("id") + "' goto='true' title='Goto "
					+ ptdef.getAttribute("id") + " ...' icon='"
					+ ctx.vars._Images[0] + "/studio/redo.png' />"));
		}
		return out;
	}
	obj.AddParam = function(item, ctx) {
		aa_xtmldt_writeundodata(ctx.vars._ElemsOfOperation, ctx);
		var param_xml;
		if (ctx.vars.Param && ajaxart.isxml(ctx.vars.Param))
			param_xml = ctx.vars.Param[0];
		else if (ctx.vars.SimpleParam) {
			param_xml = aa_createElement(obj.ParentXtml, "Param");
			param_xml.setAttribute("name", ajaxart
					.totext_array(ctx.vars.SimpleParam));
		}
		var param_name = param_xml.getAttribute("name");
		var as_xml = obj.AsXml(item, ctx, true);
		if (as_xml.length == 0)
			return [];
		if (param_name == "Var") {
			var new_xml_elem = aa_createElement(as_xml[0], param_name);
			if (ctx.vars._ElemsOfOperation && ajaxart.isattached(ctx.vars._ElemsOfOperation[0])) {
				// prmopting for variable name only if not in test
				var var_name = window.prompt("Variable name:");
				if (var_name)
					new_xml_elem.setAttribute("name",var_name.replace(/[^a-zA-Z_0-9]/g,""));
			}
			as_xml[0].appendChild(new_xml_elem);
		} else if (param_xml.getAttribute("goto")) {
			obj.ShowGoto = true;
		} else if ((param_xml.getAttribute("type") == null || param_xml
				.getAttribute("type").indexOf('[]') == -1)
				&& as_xml[0].getAttribute(param_name) == null
				&& ajaxart.childElem(as_xml[0], param_name) == null) {
			// coping default value
			if (param_xml.getAttribute('Default'))
				as_xml[0].setAttribute(param_name, param_xml
						.getAttribute('Default'));
			else {
				var def = ajaxart.childElems(param_xml, "Default");
				if (def.length > 0) {
					if (def[0].getAttribute("value"))
						as_xml[0].setAttribute(param_name, def[0]
								.getAttribute("value"));
					else {// default with component
						var new_xml_elem = aa_createElement(as_xml[0],
								param_name);
						ajaxart.xml.copyElementContents(new_xml_elem, def[0]);
						as_xml[0].appendChild(new_xml_elem);
					}
				} else {
					as_xml[0].setAttribute(param_name, " ");
					as_xml[0].setAttribute(param_name, "");
				}
			}
		} else {
			obj.ShowMoreParams = param_name;
		}
		aa_save_manager.MarkAsModified(as_xml, ctx);
		if (ctx.vars._ElemsOfOperation) {
			var new_elem = aa_xtmldt_refresh_elem(ctx,
					ctx.vars._ElemsOfOperation);
			var sub_elems = jQuery(new_elem).children('.aa_list').children(
					'.aa_item');
			for (j = 0; j < sub_elems.length; j++)
				if (jQuery(sub_elems[j]).children('.aa_text').text().indexOf(
						param_name) == 0) {
					ajaxart_uiaspects_select(jQuery(sub_elems[j]), jQuery(),
							"auto", ctx, true);
					if (param_name != 'Var' && !param_xml.getAttribute("goto")
							&& !aa_is_static_bool(sub_elems[j].ItemData[0]))
						sub_elems[j].ItemData[0].DoubleClick(
								sub_elems[j].ItemData, aa_ctx(ctx, {
									_ElemsOfOperation : [ sub_elems[j] ],
									_ItemsOfOperation : sub_elems[j].ItemData
								}));
				}
		}
	}
	obj.Image = function(item, ctx) {
		var data_image = aa_base_images() + "/studio/paper.jpg";
		var default_image = aa_base_images() + "/studio/boolean.gif";
		var enum_image = aa_base_images() + "/studio/enum.gif";
		if (obj.Param == "name")
			return [ aa_base_images() + "/studio/fonts1616.png" ];
		if (obj.Component)
			return [ aa_base_images() + "/studio/plugin1616.png" ];
		if (obj.Param == "Param")
			return [ aa_base_images() + "/studio/mini-corp-mem.jpg" ];
		if (aa_is_static_bool(obj)) {
			// static boolean
			if (obj.ParentXtml.getAttribute(obj.Param) == "true")
				return [ aa_base_images() + "/studio/true.bmp" ];
			else
				return [ aa_base_images() + "/studio/false.bmp" ];
		}
		if (!obj.Type || obj.Type == "data.Data")
			return [ data_image ];
		var type = obj.Type;
		if (type.indexOf('[]') != -1)
			type = type.substring(0, type.length - 2);
		type = type.replace("\.", "_");
		if (type == "enum" || type == "dynamic_enum"
				|| type == "dynamic_enum_multi")
			return [ enum_image ];
		if (ajaxart.types[type]
				&& ajaxart.types[type].getAttribute("icon") != null)
			return ajaxart.run( [], aa_xpath(ajaxart.types[type], '@icon')[0],
					'', ctx);

		return [ default_image ];
	}
	obj.DoubleClick = function(item, ctx) {
		if (aa_is_static_bool(obj)) {
			var new_val;
			if (obj.ParentXtml.getAttribute(obj.Param) == "true")
				new_val = "false";
			else
				new_val = "true";
			obj.Update(item, aa_ctx(ctx, {
				Value : [ new_val ]
			}));
		} else if (obj.Type == "inline" || obj.Type == "struct") {
			if (obj.ArrayExtra)
				obj.Update(item, aa_ctx(ctx, {
					Xml : [ "<" + obj.Param + "/>" ]
				}));
			return;
		} else if (obj.Component)
			return;
		else {
			var only_primitive = (obj.OnlyPrimitive || obj.Param == "name") ? [ "true" ]
					: [];
			var param_xml = obj.ParamXml;
			if (obj.Type == "parent_type") { // for xtml of Component or
												// default value of param
				param_xml = ajaxart.parsexml("<Param type='"
						+ obj.ParentXtml.getAttribute("type") + "' />");
			}
			aa_run_component("xtml_dt_tree.OpenPrimitivePopup", item, aa_ctx(
					ctx, {
						ParamXml : [ param_xml ],
						OnlyPrimitive : only_primitive
					}));
		}
	}
	obj.ObjectForPreview = function(item, ctx) {
		var out = {
			isObject : true,
			ParentXtml : [ obj.ParentXtml ],
			Field : [ obj.Param ],
			Xtml : obj.AsXml(item, ctx, true)
		};
		if (obj.ArrayExtra)
			out.Field = [ obj.Param + '[+]' ];
		return [ out ];
	}
	obj.More = function(item, ctx) {
		var more_component = ctx.vars.MoreComponent[0];
		var old_xml = obj.AsXml(item, ctx)[0];
		var new_xml = aa_createElement(old_xml, aa_tag(old_xml));
		var inner = aa_createElement(new_xml, more_component
				.getAttribute("itemsParam"));
		ajaxart.xml.copyElementContents(inner, old_xml);
		if (inner.getAttribute("name")) { // moving 'name' upwards
			new_xml.setAttribute("name", inner.getAttribute("name"));
			inner.removeAttribute("name");
		}
		new_xml.setAttribute("t", more_component.getAttribute("id"));
		new_xml.appendChild(inner);
		obj.Update(item, aa_ctx(ctx, {
			Xml : [ ajaxart.xml2text(new_xml) ]
		}));
	},
	obj.IsTop = function(item, ctx) {
		if (obj.Top) return ["true"];
		else return [];
	}
}
function aa_is_static_bool(obj) {
	if (!(obj.Type == "data.Boolean" && obj.ParamXml != null && obj.ParamXml
			.getAttribute("script") == null))
		return false;
	var val = obj.ParentXtml.getAttribute(obj.Param);
	if (val == "" || val == "true" || val == "false")
		return true;
	if (val == null) {
		elems = ajaxart.childElems(obj.ParentXtml, obj.Param);
		if (elems.length > 0) {
			var value = elems[0].getAttribute("value");
			if (value == "true" || value == "false" || value == "")
				return true;
		} else
			return true;
	}
	return false;
}
function aa_after_update(obj, ctx) {
	ctx.vars._XtmlTreeObj[0].AfterUpdate( [ obj.ParentXtml ], ctx);
}
function aa_xtmldt_writeundodata(elem, ctx, undo_op) {
	if (ctx.vars._UndoData == null)
		return;
	var undo_operation = (undo_op) ? undo_op : {
		isObject : true
	};
	undo_operation.Path = "";
	var current_elem = elem;
	while (!current_elem[0].ItemData[0].Top) {
		var text = current_elem[0].ItemData[0].Text(current_elem[0].ItemData,
				ctx)[0].split(" =")[0];
		undo_operation.Path = text
				+ ((undo_operation.Path == "") ? "" : "/" + undo_operation.Path);
		current_elem = jQuery(current_elem[0]).parents('.aa_item');
	}
	if (undo_operation.Operation == null)
		undo_operation.Operation = "Update";
	var obj = elem[0].ItemData[0];
	if (obj.Top)
		undo_operation.Component = [ ajaxart.xml2text(obj.ParentXtml) ];
	else if (obj.IsArrayItem) {
		if (obj.ArrayExtra) {
			undo_operation.Operation = "Delete";
			undo_operation.Path = undo_operation.Path.replace("\+",
					obj.Index + 1);
		} else {
			var old_elem = ajaxart.xml.xpath(obj.ParentXtml, obj.Param + "["
					+ (1 + obj.Index) + "]")[0];
			undo_operation.Component = [ ajaxart.xml2text(old_elem) ];
		}
	} else {
		if (obj.ParentXtml.getAttribute(obj.Param) != null)
			undo_operation.Primitive = [ obj.ParentXtml.getAttribute(obj.Param) ];
		else {
			var elem = ajaxart.childElem(obj.ParentXtml, obj.Param);
			if (elem != null)
				undo_operation.Component = [ ajaxart.xml2text(elem) ];
			else
				undo_operation.Operation = "Delete";
		}
	}
	if (ctx.vars.Undo == null || ctx.vars.Undo[0] == false)
		ctx.vars._UndoData[0].UndoOperations.push(undo_operation);
	else
		ctx.vars._UndoData[0].RedoOperations.push(undo_operation);
}
function aa_xtmldt_refresh_elem(ctx, elem) {
	if (!elem.length)
		return [];
	var item_data = elem[0].ItemData;
	var new_elem = ajaxart_uiaspects_refreshElements(elem, true);
	ajaxart_uiaspects_select(jQuery(new_elem[new_elem.length - 1]), jQuery(),
			"auto", ctx, true);
	// collapse elem and it's sub elements
	var sub_elems = jQuery(new_elem[new_elem.length - 1]).find(".aa_item");
	sub_elems.each(function() {
		var cntr = aa_xtmldt_treecntr(ctx);
		cntr.CollapseElem(jQuery(this), true);
	});
	// finding the real new elem, becuase 'ajaxart_uiaspects_refreshElements'
	// returns all of the new elemens, including the tree descendents
	for ( var i = 0; i < new_elem.length; i++)
		if (new_elem[i].ItemData == item_data)
			return [ new_elem[i] ];
	return [];
}
function aa_xtmldt_treecntr(ctx) {
	if (ctx.vars._Cntr) {
		var cntr = ctx.vars._Cntr[0];
		while (aa_totext(cntr.ID) == "show_field" && cntr.ParentCntr)
			cntr = cntr.ParentCntr;

		return cntr;
	}
	return null;
}
function aa_xtmldt_create_xml_obj(ParentXtml, name, default_tag) {
	var obj = {};
	obj.IsActionDisabled = function(item, ctx) {
		return [ "true" ];
	}
	obj.HasNoContent = function(item, ctx) {
		return [ "true" ];
	}
	obj.ParamsToAdd = function(item, ctx) {
		return [];
	}
	obj.Image = function(item, ctx) {
		return [ aa_base_images() + "/studio/xml1616.gif" ];
	}
	obj.Text = function(item, ctx) {
		var elem = ajaxart.childElem(ParentXtml, "*");
		if (!elem)
			return [ name ];
		else
			return [ aa_tag(elem) + " ..." ];
	};
	obj.DoubleClick = function(item, ctx) {
		var input = {
			isObject : true,
			ParentXtml : [ ParentXtml ],
			DynamicContent : ParentXtml.getAttribute("DynamicContent") == "true"
		};
		var elem = ajaxart.childElems(ParentXtml, "*");
		if (elem.length != 0)
			input.Xml = elem;
		else
			input.Xml = [ aa_createElement(ParentXtml, default_tag) ];
		input.OnOK = function(item, ctx1) {
			var cntr = aa_xtmldt_treecntr(ctx);
			if (ajaxart.totext_array(item[0].DynamicContent) == "true")
				ParentXtml.setAttribute("DynamicContent", "true");
			else
				ParentXtml.removeAttribute("DynamicContent");
			var elem = ajaxart.childElem(ParentXtml, "*");
			if (elem != null)
				ParentXtml.removeChild(elem);
			ParentXtml.appendChild(aa_importNode(item[0].Xml[0], ParentXtml));
			aa_invoke_cntr_handlers(cntr, cntr.RefreshItemTextAndImage,
					ctx.vars._ElemsOfOperation, ctx);
			ajaxart_uiaspects_select(jQuery(ctx.vars._ElemsOfOperation[0]),
					jQuery(), "auto", ctx, true);
		};
		aa_run_component("xtml_dt_tree.OpenXmlDialog", [ input ], ctx);
	};
	obj.GetXtml = function() {
		return [ ParentXtml ];
	};
	return obj;
}
function pt_def(xtml, obj) {
	var ptdef = null
	var pt = xtml.getAttribute('t');
	if (obj.Type == "inline")
		ptdef = obj.ParamXml;
	else if ((xtml.getAttribute('t') || obj.Component)
			&& xtml.getAttribute('value') == null) {
		if (obj.Component)
			pt = "xtml_dt_tree.ComponentDef";
		ptdef = aa_component_definition(pt);
	}
	return ptdef;
}
function aa_xtmldt_setnextlevel(xtmlitems, context) {
	xtmlitems.NextLevel = function(item_, ctx) {
		obj = item_[0];
		var xtml = obj.ParentXtml;
		if (obj.IsArrayItem) {
			if (obj.ArrayExtra)
				return [];
			xtml = ajaxart.xml.xpath(obj.ParentXtml, obj.Param + "["
					+ (1 + obj.Index) + "]")[0];
		} else if (obj.Param) {
			var param = obj.Param;
			if (xtml.getAttribute(param))
				return [];
			var elema = ajaxart.xml.xpath(xtml, param);
			if (elema.length == 0)
				return [];
			xtml = elema[0];
		}
		if (obj.ArrayExtra)
			return [];
		if (!xtml || xtml.nodeType != 1)
			return [];
		// if ( (xtml.getAttribute('t')==null ||
		// xtml.getAttribute('value')!=null) && !obj.HasName) return [];
		var param_items = [];
		var out_item_names = {};
		var out = {
			isObject : true,
			Xtml : xtml,
			Items : []
		};
		var ptdef = pt_def(xtml, obj);
		if (ptdef != null) {
			var params = ajaxart.xml.xpath(ptdef, "Param");
			for ( var i = 0; i < params.length; i++) {
				var paramXml = params[i];
				var param_obj = {
					isObject : true,
					ParentXtml : xtml,
					ParamXml : paramXml,
					Param : paramXml.getAttribute('name'),
					Type : paramXml.getAttribute('type')
				}
				if (ajaxart.totext_array(ctx.vars._HideEmpties) == "true"
						&& xtml.getAttribute(param_obj.Param) == null
						&& ajaxart.childElems(xtml, param_obj.Param).length == 0
						&& param_obj.Param != obj.ShowMoreParams)
					if (!paramXml.getAttribute("essential")
							|| ajaxart.childElem(paramXml, 'Default')
							|| paramXml.getAttribute('Default')) // showing
																	// empty
																	// values
																	// for
																	// essential
																	// with no
																	// default
																	// value
						continue;
				if (paramXml.getAttribute("has_name"))
					param_obj.HasName = true;
				if (paramXml.getAttribute("only_primitive"))
					param_obj.OnlyPrimitive = true;
				if (paramXml.getAttribute("only_element"))
					param_obj.OnlyElement = true;
				out_item_names[param_obj.Param] = true;
				if (!param_obj.Type)
					param_obj.Type = "data.Data";
				if (param_obj.Type.indexOf('[]') == -1) {
					param_items.push(param_obj);
					aa_xtmldt_setfunctions(param_obj);
				} else {
					var subitems = ajaxart.xml.xpath(xtml, param_obj.Param);
					var type = param_obj.Type;
					var type1 = type.substring(0, type.length - 2);
					for ( var j = 0; j <= subitems.length; j++) {
						var obj1 = {
							isObject : true,
							ParentXtml : xtml,
							ParamXml : paramXml,
							Param : param_obj.Param,
							Type : type1,
							Index : j,
							IsArrayItem : true
						}
						if (paramXml.getAttribute("has_name"))
							obj1.HasName = true;
						if (j == subitems.length)
							obj1.ArrayExtra = true;
						param_items.push(obj1);
						aa_xtmldt_setfunctions(obj1);
					}
				}
			}
			if (xtml.getAttribute("t") == "xml.Xml")
				param_items = [ aa_xtmldt_create_xml_obj(xtml, "xml", "xml") ];
			if (xtml.getAttribute("t") == "ui.Html")
				param_items = [ aa_xtmldt_create_xml_obj(xtml, "html", "div") ];
		}
		var extra_params = [];
		var items_after_params = [], items_before_params = [];
		var atts = xtml.attributes; // adding non-param values
		if (obj.HasName && !out_item_names["name"]) { // adding name
			extra_params.push("name");
			out_item_names["name"] = true;
		}
		for ( var i = 0; i < atts.length; i++) {
			var att_name = atts.item(i).nodeName;
			if (out_item_names[att_name] == null && att_name != "t"
					&& att_name != "value" && att_name != 'customxtml') { // not
																			// used
																			// yet
				extra_params.push(att_name);
				out_item_names[att_name] = true;
			}
		}
		var vars_count = 0;
		var childs_length = xtml.childNodes.length;
		for ( var i = 0; i < childs_length; i++) {
			if (xtml.childNodes.item(i).nodeType != 1)
				continue;
			var tag = aa_tag(xtml.childNodes.item(i));
			if (out_item_names[tag] == null) {
				if (tag == 'Var') {
					var param_obj = {
						isObject : true,
						ParentXtml : xtml,
						Param : "Var",
						IsArrayItem : true,
						Index : vars_count,
						Type : "data.Data",
						HasName : true
					};
					vars_count++;
					param_obj.ParamXml = ajaxart
							.parsexml('<Param type="data.Data" name="' + param_obj.Param + '" />');
					aa_xtmldt_setfunctions(param_obj);
					items_before_params.push(param_obj);
				} else if (xtml.getAttribute("t") != "xml.Xml"
						&& xtml.getAttribute("t") != "ui.Html") {
					extra_params.push(tag);
					out_item_names[tag] = true;
				}
			}
		}
		for ( var i = 0; i < extra_params.length; i++) {
			var param_name = extra_params[i];
			var param_obj = {
				isObject : true,
				ParentXtml : xtml,
				Param : param_name
			};
			param_obj.ParamXml = ajaxart
					.parsexml('<Param type="data.Data" name="' + param_obj.Param + '" />');
			if (param_obj.Param == "Condition") {
				param_obj.Type = 'data.Boolean';
				param_obj.ParamXml.setAttribute("type", "data.Boolean");
				param_obj.ParamXml.setAttribute("script", "true");
			}
			if (param_obj.Param == "Trace") {
				param_obj.ParamXml.setAttribute("type", "enum");
				for ( var val = 0; val <= 9; val++)
					param_obj.ParamXml.appendChild(ajaxart.parsexml("<value>"
							+ val + "</value>", "", "", true,
							param_obj.ParamXml));
			}
			out_item_names[param_obj.Param] = true;
			aa_xtmldt_setfunctions(param_obj);
			if (param_obj.Param == "Condition" || param_obj.Param == "Data")
				items_before_params.push(param_obj);
			else
				items_after_params.push(param_obj);
		}
		out.Items = items_before_params.concat(param_items).concat(
				items_after_params);
		aa_xtmldt_setnextlevel(out, context);
		if (obj.ShowGoto) {
			var obj1 = {
				isObject : true,
				Component : true,
				ParentXtml : aa_component_definition(xtml.getAttribute("t"))
			};
			aa_xtmldt_setfunctions(obj1);
			out.Items.push(obj1);
		}
		return [ out ];
	}
}
var aa_save_manager = {
	isObject : true,
	modified : {},
	MarkAsModified : function(item, ctx) {
		var xml = item[0];
		while (xml != null && xml.nodeType != 9 && aa_tag(xml) != "Component") {// 9 -
																				// document
																				// top
		xml = xml.parentNode;
	}
	if (!xml || xml.nodeType == 9 || !xml.parentNode
			|| xml.parentNode.getAttribute("ns") == null)
		return; // not infrastructure
	var id = xml.parentNode.getAttribute("ns") + "." + xml.getAttribute("id");
	if (aa_save_manager.modified[id] == null)
		aa_save_manager.modified[id] = true;
	aa_save_manager.modified.not_empty = true;
},
MarkComponentIdAsModified : function(item, ctx) {
	var id = ajaxart.totext_array(item);
	if (aa_save_manager.modified[id] == null)
		aa_save_manager.modified[id] = true;
},
Save : function(item, ctx) {
	var modified_components = [];
	for (i in aa_save_manager.modified)
		if (i != "not_empty")
			modified_components.push(i);
	aa_run_component("xtml_dt_tree.SaveToServer", item, aa_ctx(ctx, {
		_ModifiedComponents : modified_components
	}));
},
NoModified : function(item, ctx) {
	if (aa_save_manager.modified.not_empty != null)
		return [];
	return [ "true" ];
},
Clean : function(item, ctx) {
	aa_save_manager.modified = {};
	var elem = jQuery(".dialog_box").find(".aa_xtml_tree")[0];
	var cntr = elem && elem.Cntr;
	if (cntr)
		container.ContainerChange[0](item, ctx); // refresh toolbar
}
};






aa_gcs("action_async", {
	RunAsync: function(profile, data, context)
	{
	    var failure = ajaxart.xml.xpath(ajaxart.parsexml('<xml value=""/>'),'@value');
	    var newContext = aa_ctx(context,{ AyncFailure : failure });
	    
		ajaxart_RunAsync(data,ajaxart.fieldscript(profile,'Action'),newContext,function(data1,ctx,success) {
			ajaxart.run(data,profile,success ? 'OnSuccess' : 'OnFailure',context);
		});
		return ["true"];
	},
	RunAsyncActions: function(profile, data, context)
	{
	    var failure = ajaxart.xml.xpath(ajaxart.parsexml('<xml value=""/>'),'@value');
	    var newContext = aa_ctx(context,{ AyncFailure : failure, _AsyncCallback: null });

	    return ajaxart.gcs.action_async.SequentialRun(profile,data,newContext);
	},
	RunAsyncWithSuccessFailure: function(profile, data, context)
	{
		
	},
	SyncAction: function(profile, data, context)
	{
		ajaxart.runsubprofiles(data,profile,'Action',context);
		return ["true"];
	},
	RunActionOnItems: function(profile, data, context)
	{
		var cbObj = ajaxart_async_GetCallbackObj(context);
		cbObj.marked = true;
		cbObj.index = 0;
		cbObj.items = ajaxart.run(data,profile,'Items',context);
		cbObj.actionProf = ajaxart.fieldscript(profile,'Action');
		
		var callBack = function(data1,context1) {
			var cbObj = ajaxart_async_GetCallbackObj(context);
			if (cbObj.index >= cbObj.items.length) {
				ajaxart_async_CallBack(data,context); return;
			}
			cbObj.index++;
			ajaxart_RunAsync([cbObj.items[cbObj.index-1]],cbObj.actionProf,context,cbObj.seqCallBack);
		}
		cbObj.seqCallBack = callBack;
		callBack(data,context);
		return ["true"];
	},
	ActionOnAsyncData: function(profile, data, context)
	{
		var inPreviewMode = ajaxart.inPreviewMode;
		if (ajaxart.inPreviewMode && jBart.vars._previewAsyncs) {
			for(var i=0;i<jBart.vars._previewAsyncs.length;i++)
				if (jBart.vars._previewAsyncs[i].profile == profile)  // result data found - run it in a sync way
					ajaxart.run(jBart.vars._previewAsyncs[i].data,profile,'Action',context);
		}

		ajaxart_async_Mark(context);
		
		var callBack = function(newdata,context1) 
		{
			if (inPreviewMode) { // if it was originated in preview mode
				if (! jBart.vars._previewAsyncs) jBart.vars._previewAsyncs = [];
				var found=false;
				for(var i=0;i<jBart.vars._previewAsyncs.length;i++) {
					if (jBart.vars._previewAsyncs[i].profile == profile) { 
						found=true;
						jBart.vars._previewAsyncs[i].data = newdata;
					}
				}
				if (!found) jBart.vars._previewAsyncs.push({profile: profile, data: newdata})
			}
			ajaxart.run(newdata,profile,'Action',context);
			ajaxart_async_CallBack(data,context);
		}

		aa_RunAsyncQuery(data,ajaxart.fieldscript(profile,'Query'),context,callBack);

		return ["true"];
	},
	AsyncActionOnAsyncData: function(profile, data, context)
	{
		ajaxart_async_Mark(context);
		
		var callBack = function(newdata,context1) {
			var ret = function(data1,context2) { ajaxart_async_CallBack(data,context); };
			ajaxart_RunAsync(newdata,ajaxart.fieldscript(profile,'Action'),context,ret);
		}
		aa_RunAsyncQuery(data,ajaxart.fieldscript(profile,'Query'),context,callBack);
		return ["true"];
	},
	SuccessByHttpCode:function(profile, data, context) {
		// Todo
	},
	Rest: function(profile, data, context)
	{
		return ajaxart.gcs.data_async.Rest(profile,data,context);
	},
	UrlGet: function(profile, data, context)
	{
		return ajaxart.gcs.data_async.UrlGet(profile,data,context);
	},
	UrlPost: function(profile, data, context)
	{
		return ajaxart.gcs.data_async.UrlPost(profile,data,context);
	},
	LoadJsFiles: function(profile, data, context)
	{
		var files = ajaxart_run_commas(data,profile,'JsFiles',context);
		for(var i=0;i<files.length;i++) {
		  var file = files[i],callbackFunc = '';
		  if (file.split(' ').length > 1) {  // with a callback func
			  callbackFunc = file.split(' ')[1];
			  file = file.split(' ')[0];
		  }
		  if (!aa_jsfiles[file]) aa_jsfiles[file] = { file: file , afterLoad: []};
		  if (aa_jsfiles[file].loaded) continue; 
		  
		  var myFunc = function(file,callbackFunc) {
		    ajaxart_async_Mark(context);
		  
		    aa_jsfiles[file].afterLoad.push({data:data,context:context});
		    if (!aa_jsfiles[file].loading) {
		    	aa_jsfiles[file].loading = true;
		    	
		    	if (callbackFunc) { 
			    	window[callbackFunc] = function() {
				    	aa_jsfiles[file].loaded = true;
				    	var calls = aa_jsfiles[file].afterLoad;
				    	for(var i=0;i<calls.length;i++)
				    	  ajaxart_async_CallBack(calls[i].data,calls[i].context);    // TODO: put a counter not to run it more than once
				    }
		    		jQuery.getScript(file);
		    	}
		    	else {
		    		jQuery.ajax({ url: file, dataType: "script",
		    			  success: function() {  // TODO: write in global status bar, and remove it when loaded
					    	aa_jsfiles[file].loaded = true;
					    	var calls = aa_jsfiles[file].afterLoad;
					    	for(var i=0;i<calls.length;i++)
					    	  ajaxart_async_CallBack(calls[i].data,calls[i].context);    // TODO: put a counter not to run it more than once
		    			  },
		    			  error: function() {
		    				  ajaxart.log('could not load script file ' + file,'error');
		    				  var calls = aa_jsfiles[file].afterLoad;
		    				  for(var i=0;i<calls.length;i++)
					    	    ajaxart_async_CallBack(calls[i].data,calls[i].context);    // TODO: put a counter not to run it more than once
		    			  }
			         });	
		    	}
		    }
		  }
		  myFunc(file,callbackFunc);
		}
	},
	LoadCssFiles: function(profile, data, context)
	{
		if (typeof(aa_loaded_css_files) == "undefined") aa_loaded_css_files = ",";

		var files = ajaxart_run_commas(data,profile,'CssFiles',context);
		for(var i=0;i<files.length;i++) {
 	 	    if (aa_loaded_css_files.indexOf(","+files[i]+",") > -1) continue;
		    var fileref=document.createElement("link");
		    fileref.setAttribute("rel", "stylesheet");
		    fileref.setAttribute("type", "text/css");
		    fileref.setAttribute("href", files[i]);
		    document.getElementsByTagName("head")[0].appendChild(fileref);
		    aa_loaded_css_files += files[i]+",";
		}
	},
	LoadXtmlPackage: function(profile, data, context)
	{
		var _package = aa_text(data,profile,'Package',context);
		if (_package == "") return [];
		ajaxart_async_Mark(context);
		
	    var options = { cache: false , type: "GET", httpHeaders : [], url: _package };
        options.success = function(server_content) {
     	  var xtml = ajaxart_server_content2result(server_content)[0];
     	  ajaxart.load_xtml_content(aa_text(data,profile,'Package',context),xtml);
     	  
      	  ajaxart_async_CallBack([],context); 
        }
        options.error = function(e) {
        	aa_handleHttpError(e,this,context);
      	  ajaxart_async_CallBack([],context); 
        }
        jQuery.ajax(options);
	}
});
//AA EndModule
//AA BeginModule
ajaxart.gcs.data_async = 
{
	Rest: function(profile, data, context)
	{
	  ajaxart_async_Mark(context,true);

	  if (aa_tobool(context.vars._NoExternalCalls)) {
		  var results = ajaxart.run([],profile,'SampleResults',context);
      	  ajaxart_async_CallBack(ajaxart.run(results,profile,'ConvertResult',context),context); 
		  return [];
	  }
	  var keyForPreLoading = aa_text(data,profile,"KeyForPreLoading",context);
	  ajaxart.serverData = ajaxart.serverData || {};
	  
	  if (ajaxart.serverData[keyForPreLoading] != null) {
    	  var newdata = ajaxart.serverData[keyForPreLoading];
    	  var result = ajaxart.run(newdata,profile,'ConvertResult',context);
    	  ajaxart.run(result,profile,'ActionOnResult',context);
    	  aa_hideProgressIndicator(context);
      	  ajaxart_async_CallBack(result,context);
      	  return [];
	  }

	  var req_id = aa_text(data,profile,"ID",context);
	  if (req_id != '')
	  {
		  if (ajaxart.Requests == null) ajaxart.Requests = {}
		  if (ajaxart.Requests[req_id])
			  ajaxart.Requests[req_id].abort();
	  }
	  var method = aa_text(data,profile,'Method',context);
	  var contentType = aa_text(data,profile,"ContentType",context);

	  var options = { cache: false , type: method, headers:{'Content-Type': contentType } };
	  options.url = aa_text(data,profile,'Url',context);
      options.data = aa_text(data,profile,'PostData',context);

      var resultType = aa_text(data,profile,'ResultType',context);
      
      options.success = function(server_content) {
    	  var newdata = ajaxart_server_content2result(server_content,resultType);
    	  var result = ajaxart.run(newdata,profile,'ConvertResult',context);
    	  ajaxart.run(result,profile,'ActionOnResult',context);
    	  aa_hideProgressIndicator(context);
    	  ajaxart.run(result,profile,'OnSuccess',context);
      	  ajaxart_async_CallBack(result,context); 
      }
      options.error = function(e) {
    	  aa_handleHttpError(e,this,context);
   		  ajaxart.writevalue(context.vars.AsyncFailure,["true"]);
    	  aa_hideProgressIndicator(context);
    	  ajaxart.run(result,profile,'OnError',context);
      	  ajaxart_async_CallBack([],context); 
      }
      
      if (aa_bool(data,profile,'TunnelRequest',context)) {
    	  if (method == 'GET') {
    		  aa_crossdomain_call({ 
    			  url: '//jbartdb.appspot.com/jbart_db.js?op=proxy&url='+encodeURIComponent(options.url), 
    			  success: options.success,
    			  error: options.error
    		  },true);
    		  options._doNotRunAjax = true;
    	  } else {
	    	  options.type = "POST";
	    	  options.headers = {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'} // needed to escape the tunneling data
	    	  options.data = { 
	    			  'contents' : options.url, 
	    			  'headers': 'Content-Type: ' + contentType,
	    			  '__METHOD': method, 
	    			  '__POSTDATA': options.data
	    	  }
	    	  options.url = "get.php";
    	  }
      }
      
      if (!options._doNotRunAjax) {
		  var req = jQuery.ajax( options );
		  aa_showProgressIndicator(context);
		  if (req_id != '') ajaxart.Requests[req_id] = req;
      }
	},
	CurrentGeoLocation: function(profile, data, context)
	{
	  if (navigator.geolocation) {
		  ajaxart_async_Mark(context,true);
		  navigator.geolocation.getCurrentPosition(function (position) {
			  ajaxart_async_CallBack([position.coords],context);
		  });
	  }
	  return [];
	},
	JBartJsonP: function(profile, data, context)
	{
	  var baseUrl = aa_text(data,profile,'Url',context);
	  if (ajaxart.inPreviewMode) {
		  if (!window.aa_preview_cache) window.aa_preview_cache = {};
		  if (window.aa_preview_cache[baseUrl])
			  return window.aa_preview_cache[baseUrl];
	  }
	  ajaxart_async_Mark(context,true);
	  if (!ajaxart.jSonRequests) ajaxart.jSonRequests = {}
	  if (!ajaxart.jsonReqCounter) ajaxart.jsonReqCounter = 0;
	  if (! window.aa_jsonp_callback) aa_jsonp_callback = function(server_content,id,url)
	  {
	  	 var req = ajaxart && ajaxart.jSonRequests[id];
	  	 if (req)
	  	 {
	  		  ajaxart.jSonRequests[id] = null;
	   		  var newdata = ajaxart_server_content2result(server_content,aa_text(req.data,req.profile,"ResultType",req.context));
	     	  ajaxart.run(newdata,req.profile,'OnSuccess',req.context);
	     	  aa_hideProgressIndicator(context);
	     	  
	     	  if (ajaxart.jbart_studio && window.aa_preview_cache) window.aa_preview_cache[req.baseUrl] = newdata;
	     	  
	      	  ajaxart_async_CallBack(newdata,req.context); 
	  	 }
	  }
	  ajaxart.jsonReqCounter = (ajaxart.jsonReqCounter + 1) % 1000;
	  ajaxart.jSonRequests[ajaxart.jsonReqCounter] = { data: data, profile: profile, context: context, baseUrl: baseUrl }; 
	  var url = baseUrl + '&aa_req_id=' + ajaxart.jsonReqCounter;

	  jQuery.ajax( { 
			  cache: false , 
			  dataType: 'script',
			  httpHeaders : [],
			  url: url,
      		  error: function(e) {
      			 aa_handleHttpError(e,this,context);
      			 ajaxart.writevalue(context.vars.AsyncFailure,["true"]);
      			 aa_hideProgressIndicator(context);
		  		 ajaxart.run(newdata,profile,'OnFailure',context);
		  		 ajaxart_async_CallBack([],context); 
      		 }
	  });
	  aa_showProgressIndicator(context);
	  
	  return [];
	},
	Pipeline: function(profile, data, context)
	{
	  var cbObj = ajaxart_async_GetCallbackObj(context);
	  cbObj.marked = true;
	  cbObj.index = 0;
	  cbObj.profs = ajaxart.subprofiles(profile,'Item');
		
	  var callBack = function(data1,context1) {
		var cbObj = ajaxart_async_GetCallbackObj(context);
		if (cbObj.index >= cbObj.profs.length) {
			ajaxart_async_CallBack(data1,context); return;
		}
		var prof = cbObj.profs[cbObj.index];
		cbObj.index++;
		aa_RunAsyncQuery(data1,prof,context,cbObj.seqCallBack);
	  }
	  cbObj.seqCallBack = callBack;
		
	  callBack(data,context);
	
	  return [];
	},
	Parallel: function(profile, data, context)
	{
		var cbObj = ajaxart_async_GetCallbackObj(context);
		cbObj.marked = true;
		cbObj.index = 0;
		cbObj.mergeInputs = ajaxart.subprofiles(profile,'Input');
		var newContext = ajaxart.clone_context(context);
		newContext.vars._ASyncContextForMerge = [newContext];
		
		var init = function(newContext) {
			var callBack = function(data1,context1) {
				var cbObj = ajaxart_async_GetCallbackObj(context);
				if (cbObj.index >= cbObj.mergeInputs.length) {
					var result = ajaxart.run(data,profile,'Result',newContext);
					ajaxart_async_CallBack(result,context); return;
				}
				cbObj.index++;
				ajaxart_RunAsync(data,cbObj.mergeInputs[cbObj.index-1],newContext,cbObj.pCallBack);
			}
			cbObj.pCallBack = callBack;
			callBack(data,newContext);
		}
		init(newContext);
		
		return [];
	},
	MergeInput: function(profile, data, context)
	{
		ajaxart_async_Mark(context,true);
		var callBack = function(data1,ctx) {
			var name = aa_text(data,profile,'Name',context);
			context.vars._ASyncContextForMerge[0].vars[name] = data1;
			ajaxart_async_CallBack([],context);
		}
		aa_RunAsyncQuery(data,ajaxart.fieldscript(profile,'Query',true),context,callBack);
		return [];
	},
	CurrentGeoLocation: function(profile, data, context)
	{
		if (!navigator.geolocation) return;
 	    ajaxart_async_Mark(context,true);
		navigator.geolocation.getCurrentPosition(function (position) {
			var out = {isObject:true, Latitude: ''+position.coords.latitude , Longitude: ''+position.coords.longitude };
			ajaxart_async_CallBack([out],context);
		});
	},
	UrlPost: function(profile, data, context)
	{
	  ajaxart_async_Mark(context,true);

	  var req_id = aa_text(data,profile,"ID",context);
	  if (req_id != '')
	  {
		  if (ajaxart.Requests == null) ajaxart.Requests = {}
		  if (ajaxart.Requests[req_id])
			  ajaxart.Requests[req_id].abort();
	  }
	  var contentType = aa_text(data,profile,"ContentType",context);
	  if (aa_bool(data,profile,"TunnelRequest",context))
		  return ajaxart.runNativeHelper(data,profile,'TunnelRequest', aa_ctx(context,{Headers: ['Content-Type: ' + contentType] }));

	  var options = { cache: false , type: "POST", headers: {'Content-Type': contentType} };
      options.url = aa_text(data,profile,'Url',context);
      options.data = {};
      var postDatas = ajaxart.runsubprofiles(data,profile,'PostData',context);
	  for(var i=0;i<postDatas.length;i++) {
	    var obj = postDatas[i];
	    if (obj.Name != null)
	    {
	  	    var name = ajaxart.totext(obj.Name);
		    var val = ajaxart.totext(obj.Value);
		    if (val != null)
			  options.data[name] = val;
	    }
	    else
	    	options.data = ajaxart.totext(obj);
	  }

      options.success = function(server_content) {
    	  aa_hideProgressIndicator(context);
   		  var newdata = ajaxart_server_content2result(server_content,aa_text(data,profile,"ResultType",context));
     	  ajaxart.run(newdata,profile,'OnSuccess',context);
      	  ajaxart_async_CallBack(newdata,context); 
      }
	  options.error = function(e) {
		  aa_hideProgressIndicator(context);
		  aa_handleHttpError(e,this,context);
   		  ajaxart.writevalue(context.vars.AsyncFailure,["true"]);
   		  ajaxart_async_Failure(context)
     	  ajaxart.run([],profile,'OnFailure',context);
      	  ajaxart_async_CallBack([],context); 
      }
	  var req = jQuery.ajax( options );
	  aa_showProgressIndicator(context);
	  if (req_id != '')
		  ajaxart.Requests[req_id] = req;
	  return [];
	},
	UrlGet: function(profile, data, context)
	{
	  ajaxart_async_Mark(context,true);
	  var url = aa_text(data,profile,'Url',context);
	  if (!ajaxart.UrlGetResults) ajaxart.UrlGetResults = {};
	  if (aa_bool(data,profile,"CacheResult",context) && ajaxart.UrlGetResults[url])
	  {
		  ajaxart_async_CallBack(ajaxart.UrlGetResults[url],context);
		  return ajaxart.UrlGetResults[url];
	  }
	  if (ajaxart.isBackEnd)
	  {
			  var result = aa_backend_Utils.UrlGet(url,aa_text(data,profile,'TunnelCookies',context),"");
			  if ('' + result.success == 'true')
			  {
				  aa_bool(['' + result.result],profile,'OnSuccess',aa_ctx(context,{_UrlGetResult: [result]}));
				  ajaxart_async_CallBack(['' + result.result],context); 
				  return ['' + result.result];
			  }
			  else
			  {
				  ajaxart.log('url get failure');
				  aa_bool(data,profile,'OnFailure',aa_ctx(context,{_UrlGetResult: [result]}));
				  ajaxart_async_CallBack([],context); 
			  }
		  return [];
	  }
	  if (aa_bool(data,profile,"TunnelRequest",context))
		  return ajaxart.runNativeHelper(data,profile,'TunnelRequest',context);
	  var req_id = aa_text(data,profile,"ID",context);
	  if (req_id != '')
	  {
		  if (ajaxart.Requests == null) ajaxart.Requests = {}
		  if (ajaxart.Requests[req_id])
			  ajaxart.Requests[req_id].abort();
	  }
	  var options = { cache: false , type: "GET", httpHeaders : [] };
      options.url = options.originalUrl = url;

      options.success = function(server_content) {
     	  var fixedData = ajaxart_server_content2result(server_content,aa_text(data,profile,"ResultType",context));
     	  ajaxart.UrlGetResults[this.originalUrl] = fixedData;
		  aa_text(fixedData,profile,'OnSuccess',aa_ctx(context,{_UrlGetResult: [result]}));
      	  ajaxart_async_CallBack(fixedData,context); 
      }
      options.error = function(e) {
    	  aa_handleHttpError(e,this,context);
      	  ajaxart_async_CallBack([],context); 
      }

	  var req = jQuery.ajax( options );
	  if (req_id != '')
		  ajaxart.Requests[req_id] = req;
	  return [];
	},
	Calculate: function(profile, data, context)
	{
  	  ajaxart_async_Mark(context,true);
  	  var newdata = ajaxart.run(data,profile,'Query',context);
  	  ajaxart_async_CallBack(newdata,context); 
	  return [];
	},
	SyncDataOnNextTimer: function(profile, data, context)
	{
	   ajaxart_async_Mark(context,true);
	   setTimeout(function(){
	  	  var newdata = ajaxart.run(data,profile,'Query',context);
	  	  ajaxart_async_CallBack(newdata,context); 
	   },10);
	},
	AsyncDataOnNextTimer: function(profile, data, context)
	{
		ajaxart_async_Mark(context,true);
		setTimeout(function(){
			aa_RunAsyncQuery(data,ajaxart.fieldscript(profile,'Query'),context,function(newdata,ctx) {
				ajaxart_async_CallBack(newdata,context); 
			});
		},10);
	},
	SyncData: function(profile, data, context)
	{
  	  ajaxart_async_Mark(context,true);
  	  var newdata = ajaxart.run(data,profile,'Query',context);
  	  ajaxart_async_CallBack(newdata,context); 
	  return [];
	}
}

aa_gcs("jbart",{
	ApiCall: function(profile, data, context)
	{
	  var url = aa_text(data,profile,'Url',context);
	  var resultType = aa_text(data,profile,'ResultType',context);
	  var previewMode = aa_totext(context.vars._PreviewMode) == 'true';
	  var id = previewMode ? aa_totext(aa_xpath(profile,'../@id')) : '';
	  if (previewMode) {
		  writeToPreviewTextbox('running api call...')
	  }
	  if (!previewMode) {
		  var target = context.vars._Target && context.vars._Target[0];
		  if (!target) target = aa_first(data,profile,'DefaultTarget',context);
		  if (!target) return;
		  if (target.firstChild && aa_bool(data,profile,'SkipCallIfDataPresent',context)) return;
		  while (target.firstChild && !previewMode) target.removeChild(target.firstChild);
	  }
	  
	  var options = {
	    url: url,
	    success: function(result) {
		  if (previewMode) {
			  if (result.trim) result = result.trim(); 
			  writeToPreviewTextbox(result);
			  return ajaxart_async_CallBack([result],context);
		  }
		  
    	  var newdata = ajaxart_server_content2result(result,resultType);
    	  if (newdata[0]) {
			ajaxart.xml.copyElementContents(target,newdata[0]);    	  	
    	  }
    	  
      	  ajaxart_async_CallBack(newdata,context); 
	    },
	    error: function(error) {
	      error = error || {};
		  if (previewMode) {
			  writeToPreviewTextbox('error ' + error.message || '');
			  return ajaxart_async_CallBack([],context);
		  }

		  ajaxart.writevalue(context.vars.AsyncFailure,["true"]);
      	  ajaxart_async_CallBack([],context); 
	    }
	 }
	  
     ajaxart_async_Mark(context);
	 ajaxart.run([options],profile,'CommunicationType',context);
	 
	 function writeToPreviewTextbox(message) {
		 jQuery('.fld_api_preview_result').val(message);
	 }
	},
	MultipleApiCalls: function(profile, data, context)
	{
		aa_async_XtmlSequentialRun(data,profile,'Call',context);
	},
	RestWithJBartDBProxy: function(profile, data, context)
	{
	  aa_crossdomain_call({ 
		  url: '//jbartdb.appspot.com/jbart_db.js?op=proxy&url='+encodeURIComponent(data[0].url), 
		  success: data[0].success,
		  error: data[0].error
	  },true);
	},
	JSONP: function(profile, data, context)
	{
		window.aa_jsonp_cb_counter = window.aa_jsonp_cb_counter || 0;
		var cbName = 'aa_jsonp_cb' + (++aa_jsonp_cb_counter);
		window[cbName] = function(result) {
			if (typeof(result) == 'object' && !result.nodeType)
				result = JSON.stringify(result);

			window[cbName] = null;
			data[0].success(result);
		}
		setTimeout(function() {
			if (window[cbName]) {
				// the callback was not called
				window[cbName] = null;
				data[0].error({ text: 'callback was not called'});
			}
		},aa_int(data,profile,'Timeout',context));
		
		var url = data[0].url;
		url += '&'+aa_text(data,profile,'UrlParameterForCallback',context)+'='+cbName;
		aa_load_js_css(url,'js');
	}
});

function ajaxart_async_IsFailure(context)
{
	var cb = context.vars._AsyncCallback; 
	if ( cb != null && cb.success == false ) return true;
	return false;
}
function ajaxart_async_Failure(context)
{
	if ( context.vars._AsyncCallback != null ) context.vars._AsyncCallback.success = false;
}
function ajaxart_server_content2result(server_content,resultType) 
{
	if (resultType == 'json') return [server_content];
	if (resultType == 'json to xml') 
		return [ aa_JSON2Xml(server_content,'Top') ];
	  try {
		if (resultType == null || resultType == '') resultType = 'xml';
		if (ajaxart.isxml(server_content))
		{
		    var docElem = server_content.firstChild;
		    while(docElem.nodeType != 1 && docElem.nextSibling != null)
		    	docElem = docElem.nextSibling;
			return [docElem];
		}
		if (server_content=="") return [];
	  	var out = null;
		if ( resultType != 'xml' || (server_content.length > 0 && server_content.charAt(0) != "<"))  // not xml
		  return [ server_content ];
	
	  	var server_content_no_ns = ajaxart.ajaxart_clean_ns(server_content);
	  	if (server_content.length > 0 && server_content.charAt(0) == "<")
	  	  out = [ ajaxart.parsexml(server_content_no_ns) ];
	
	  	if (out == null) out = [server_content];
	  	if (out.length == 1 && out[0] == null) out = [server_content];
	  		
	  	if (ajaxart.ishtml(out[0]) || (ajaxart.isxml(out[0]) && ajaxart.xml.xpath(out[0].ownerDocument.documentElement,"Body/Fault").length != 0 ))  { // not xml, probably error
	      ajaxart.log("failed calling server","error");
	  	  if (ajaxart.ishtml(out))
	  		jQuery("<div>error back from server:"+server_content+"</div>").appendTo(jQuery("#ajaxart_log"));
		}
		else if (ajaxart.isxml(out)) {
		  if (out[0].nodeType == 7) out = [ out[0].nextSibling ]; // <?xml
	      if (out[0].tagName.toLowerCase() == 'envelope')  // web service
		  out = [ ajaxart.body_contents_of_soap_envelope(out[0]) ];
		}
	
		return out;
	  }
	  catch(e) {ajaxart.logException(e); return []; }
}
function aa_ulrpost(url,postdata,callback,context)
{
  var options = { cache: false , type: "POST", contentType: "application/x-www-form-urlencoded; charset=UTF-8" , httpHeaders : [] };
  options.url = url;
  options.data = {};
  for(var i=0;i<postdata.length;i++) {
    var obj = postdata[i];
    var name = ajaxart.totext(obj["Name"]);
    var val = ajaxart.totext(obj["Value"]);
    if (val != null)
	  options.data[name] = val; 
  }
  options.success = function(server_content) {
 	  var newdata = ajaxart_server_content2result(server_content);
 	  callback(newdata,context);
  }
  options.error = function() {
	  aa_handleHttpError(e,this);
	  ajaxart.writevalue(context.vars.AsyncFailure,["true"]);
 	  callback([],context);
  }
  jQuery.ajax( options );
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
function aa_hideProgressIndicator(context)
{
	aa_showIndicator = false;
	jQuery(context.vars.ControlElement).removeClass('aa_loading');
	
	jQuery('.aa_progress_indicator').hide();
	aa_fire_async_finished();
}
aa_showIndicator = false;

function aa_remove_async_finished_listener(listener)
{
  for(var i=0;i<aa_async_finished_listeners.length;i++) { 
	  if (aa_async_finished_listeners[i]==listener) {
		  aa_async_finished_listeners.splice(i,1);
		  return;
	  }
  }
}
aa_jsfiles = {};

function aa_async_XtmlSequentialRun(data,profile,actionsField,context)
{
	var cbObj = ajaxart_async_GetCallbackObj(context);
	cbObj.marked = true;
	cbObj.index = 0;
	cbObj.actionProfs = ajaxart.subprofiles(profile,actionsField);
	
	var callBack = function(data1,context1) {
		var cbObj = ajaxart_async_GetCallbackObj(context);
		if (cbObj.index >= cbObj.actionProfs.length) {
			ajaxart_async_CallBack(data,context); return;
		}
		var actionProf = cbObj.actionProfs[cbObj.index];
		cbObj.index++;
		ajaxart_RunAsync(data,actionProf,context,cbObj.seqCallBack);
	}
	cbObj.seqCallBack = callBack;
	
	callBack(data,context);
}




aa_gcs("async", { 
	RunOnNextTimer: function(profile,data,context) {
		var milli = aa_int(data,profile,'Milliseconds',context);
		var result = aa_asyncObject();

		setTimeout(function() {
			var result2 = ajaxart.run(data,profile,'Action',context);
			aa_bindAsync(result2,function() {
				aa_triggerAsync(result);
			},
			function() { 
				aa_triggerAsyncError(result);
			});
		},milli);

		return [result];
	},
	RunAsyncActions: function(profile,data,context) {
		var index = -1;
		var actionXmls = aa_xpath(profile,'Action');
		var result = aa_asyncObject();

		function step() {
			index++;
			if (index >= actionXmls.length)
				return aa_triggerAsync(result);

			var result2 = ajaxart.run(data,actionXmls[index],'',context);
			aa_bindAsync(result2,step,function(error) { aa_triggerAsyncError(result,error); });
		}

		step();
		return [result];
	}
});

function aa_asyncObject() {
	return {
		_asyncObject: true
	};
}

function aa_bindAsync(result,successCallback,errorCallback) {
	if (!result[0] || !result[0]._asyncObject) {
		return successCallback(result);
	}
	if (result[0]._finished) {
		onEnd();
	} else {
		aa_bind(result[0],'end',onEnd);
	}

	function onEnd() {
		if (!result[0]._error) 
			successCallback(result[0]._data);		
		else 
			errorCallback(result[0]._error); 
	}
}

function aa_triggerAsync(result,data) {
	result._finished = true;
	result._data = data || [];
	aa_trigger(result,'end',result._data);
}

function aa_triggerAsyncError(result,error) {
	result._finished = true;
	result._error = true;
	result._errorObject = error || null;
	aa_trigger(result,'end',result._errorObject);
}













//AA BeginModule
aa_gcs("bart", {
    IsBartRuntime: function (profile,data,context)
    {
    	return aa_frombool(aa_isbart_runtime);
    },
    PageIDs: function (profile,data,context)
    {
      var type = aa_text(data,profile,'Type',context);
      var contenttype = aa_text(data,profile,'ContentType',context);
      
      var pages = context.vars._BartContext[0].Pages;
      var out = [];
      for(var i=0;i<pages.length;i++) {
    	  if (type != "" && pages[i].Type && pages[i].Type[0] != type) continue;
    	  if (contenttype != "" && pages[i].ContentType && pages[i].ContentType[0] != contenttype) continue;
    	  out.push(pages[i].ID[0]);
      }
      return out;
    },
    CleanXmlInfos: function (profile,data,context)
    {
    	aa_xmlinfos = [];
    	ajaxart.xmlsToMonitor = [];
    },
    UIPreferences: function (profile,data,context)
    {
 	  var obj = {isObject: true }
	  obj.AlsoInCookie = aa_bool(data,profile,'AlsoInCookie',context); 
 	  
	  var getPropertyFunc = function(obj) { return function(data1,ctx) {
		if (obj.Xml == null || obj.Xml.length == 0)
		  obj.Xml = ajaxart.runNativeHelper(data,profile,'AppXml',context);
		  
		var prefix = ajaxart.totext_array(ctx.vars.Prefix);
		var property = ajaxart.totext_array(ctx.vars.Property);
		if (context.vars._BartDevDtContext != null && context.vars._BartDevDtContext[0].WriteUiPrefs != null && context.vars._BartDevDtContext[0].WriteUiPrefs[0] == "true")
			var value = null;
		else if (obj.AlsoInCookie)
			var value = ajaxart.cookies.valueFromCookie(prefix+'_'+property);
		
		if (value != null) return [value]; 
		else {
			var value = ajaxart.xml.xpath(obj.Xml[0],prefix+'/@'+property);
			if (value.length > 0) return [ value[0].nodeValue ];
			return [""];
		}
		return []
  	  }}
	  var setPropertyFunc = function(obj) { return function(data1,ctx) {
		  var prefix = ajaxart.totext_array(ctx.vars.Prefix);
		  var property = ajaxart.totext_array(ctx.vars.Property);
		  var value = ajaxart.totext_array(ctx.vars.Value);
		  
  		  if (context.vars._BartDevDtContext != null && context.vars._BartDevDtContext[0].WriteUiPrefs != null && context.vars._BartDevDtContext[0].WriteUiPrefs[0] == "true")
 			  ajaxart.runNativeHelper(data,profile,'WritePref',ctx);
 		  else if (obj.AlsoInCookie)
 			  ajaxart.cookies.writeCookie(prefix+'_'+property,value);
 		  
		  return [];
	  }}
	  obj.CleanPrefValues = function(data1,ctx) {
		  var prefix = aa_totext(ctx.vars.Prefix);
  		  if (context.vars._BartDevDtContext != null && context.vars._BartDevDtContext[0].WriteUiPrefs != null && context.vars._BartDevDtContext[0].WriteUiPrefs[0] == "true")
  			ajaxart.runNativeHelper(data,profile,'CleanPref',ctx);
 		  else if (obj.AlsoInCookie)
 			ajaxart.cookies.cleanCookies(prefix);
	  }
	  ajaxart_addMethod_js(obj,'GetProperty',getPropertyFunc(obj),context);
	  ajaxart_addMethod_js(obj,'SetProperty',setPropertyFunc(obj),context);
	  return [obj];
  }
});
//AA EndModule
//AA BeginModule
ajaxart.gcs.bart_screen =
{
	ShowScreen: function (profile,data,context)
	{
	    var lang = ajaxart.totext_array( ajaxart_runMethod([],context.vars._BartContext[0],'Language',context) );
	    var newContext = ajaxart.clone_context(context);
	    newContext.vars._Cntr = newContext.vars.DataHolderCntr = null;
	    
	    if (lang != "") newContext.vars.Language = [ lang ];

		var cssDefinitions = ajaxart.totext_array(context.vars._BartContext[0].CssDefinitions);
	    
	    var out = null;
	    
	    // try by field
	    var pageID = aa_text(data,profile,'PageID',context);
	    var bctx = context.vars._BartContext[0];
	    var pageAsField = null;
	    if (pageID) {
	    	var pageXtml = aa_xpath( bctx.AppXtml[0] , "../../Component[@id='"+pageID+"']/xtml")[0];
	    	if (pageXtml) pageAsField = aa_first([],pageXtml,'',context);
	    }
	    var pageAsField = pageAsField || bctx.MainPage(data,context)[0];
	    if (pageAsField && pageAsField.Id) {
	    	out = jQuery('<div/>')[0];
	    	// settings contains: Field, Item, Wrapper, FieldData (optional)
	    	aa_fieldControl({ Field: pageAsField, Wrapper: out, Item: [], Context: aa_ctx(context,{ Language: [lang] }) });
	    }

	    if (!out) {
		    var outByPage = ajaxart.runNativeHelper(data,profile,'ByPage',newContext);
		    if (outByPage.length > 0) { 
		    	out = outByPage[0];   // new screen - a page
		    	jQuery(out).addClass('bart_top runtime');
		    	out.ajaxart.params = context;
		    	out.ajaxart.script = profile;
		    	if (context.vars._BartContext) {
		    	  context.vars._BartContext[0].ControlHolder = [out];
		    	  aa_defineElemProperties(out,'ParentObject');
		    	  out.ParentObject = context.vars._BartContext;
		    	}
		    }
			if (cssDefinitions != "") {
	  		  var styleElem = jQuery('<style type="text/css">'+cssDefinitions+"</style>")[0];
			  out.appendChild(styleElem);
			}
	    }
		
		if (lang == "hebrew") {
			jQuery(out).addClass('right2left');
			if (context.vars.GalleryNode)	// in gallery
				out.style.width = ajaxart_screen_size().width - 70 + "px";
		}
		
		return [out];
	}
}
//AA EndModule
//AA BeginModule
ajaxart.gcs.bart_field =
{
	ReferenceOptions: function (profile,data,context)
	{
		var out = { isObject: true, Options: [] };
		var resName = aa_text(data,profile,'OptionsResource',context);
		var nodes = ajaxart.getVariable(context,resName);
		out.OptionNodes = nodes;
		if (nodes == null) return out;
		var inplace = aa_bool(data,profile,'ShowInplace',context);
		
		for(var i=0;i<nodes.length;i++) {
			var node = nodes[i];
			var id = node.getAttribute('id');
			if (id == null) continue;
			
			var text = aa_text([node],profile,'ItemTitle',context);
			var image = aa_text([node],profile,'ItemImage',context);
			var option = { isObject: true, code: id, text: text, image: image, Node: node}
			if (inplace) {
				option.ItemForOptionPage = [node];
				option.OptionPage = aa_first(option,profile,'Page',context);
			}
			out.Options.push(option);
		}
		return [out];
	},
	PathOfField: function (profile,data,context)
	{
		var field = ajaxart.runNativeHelper(data,profile,'Fld',context);
		return [field[0].Path];
	}
}
//AA EndModule
//AA BeginModule
aa_gcs("bart_resource", {
	ResourceAspect: function (profile,data,context)
	{
		var obj = ajaxart_dataitem_getItems(context);
		obj.Id = aa_text(data,profile,'ID',context);
		obj.ID = [obj.Id];
		obj.DependsOn = ajaxart.run(data,profile,'DependsOn',context);
		obj.Summary = aa_text(data,profile,'Summary',context);
		obj.ContentType = ajaxart.run(data,profile,'ContentType',context);
		obj.Type = ajaxart.run(data,profile,'Type',context);
		return [];
	},
	WaitForAutoSave: function (profile,data,context)
	{
		if (! window.bart_waiting_for_save || bart_waiting_for_save.length == 0) return;
		ajaxart_async_Mark(context);

		var tryAgain = function() {
			if ( bart_waiting_for_save.length == 0 )
				ajaxart_async_CallBack(data,context);
			else
				setTimeout(tryAgain,200);
		}
		setTimeout(tryAgain,200);
	},
	Node: function (profile,data,context) 
	{
		var id = aa_text(data,profile,'ID',context);
		var ct = aa_text(data,profile,'ContentType',context);
		
		var obj = { Items: [] };
		obj.Id = aa_text(data,profile,'ResourceID',context);
		obj.ID = [obj.Id];

		if (ct && id && context.vars._BartContext) {
			var bctx = context.vars._BartContext[0];
			var baseDB = aa_xpath(bctx.AppXtml[0],'../../../..')[0];
			if (!baseDB && context.vars._TestDB) baseDB = context.vars._TestDB[0];
			if (!baseDB && context.vars._SimDB) baseDB = context.vars._SimDB[0];
			if (baseDB) {
				var nodeXml = aa_xpath(baseDB,ct+'/'+ct+"[@id='"+id+"']")[0];
				if (nodeXml) obj.Items.push(nodeXml.cloneNode(true));
			}
		}
		
		return [obj];
	},
	Query: function (profile,data,context) 
	{
		var ct = aa_text(data,profile,'ContentType',context);
		
		var obj = { Items: [] };
		if (ct && context.vars._BartContext) {
			var bctx = context.vars._BartContext[0];
			var baseDB = aa_xpath(bctx.AppXtml[0],'../../../..')[0];
			if (!baseDB && context.vars._TestDB) baseDB = context.vars._TestDB[0];
			if (!baseDB && context.vars._SimDB) baseDB = context.vars._SimDB[0];
			if (baseDB) {
				var nodesTop = aa_xpath(baseDB,ct)[0];
				if (nodesTop) {
					nodesTop = nodesTop.cloneNode(true);
					obj = ajaxart.runNativeHelper([nodesTop],profile,'SimpleItems',context)[0];
				}
			}
		}

		obj.Id = aa_text(data,profile,'ResourceID',context);
		obj.ID = [obj.Id];
		obj.ContentType = ct;
		obj.ItemTypeName = aa_text(data,profile,'ItemTypeName',context);
		
		return [obj];
	},
	CustomFilter: function (profile,data,context)
	{
		var res = context.vars._Items[0];
		ajaxart_addMethod(res,'CustomFilter',profile,'IncludeIf',context);
	},
	CleanClientCache: function (profile,data,context)
	{
    	aa_xmlinfos = [];
		ajaxart.xmlsToMonitor = [];  // clean memory leaks for listening on the xml (modify flag / autosave )
		if (context.vars._BartContext) {
			var bctx = context.vars._BartContext[0];
			bctx.ClientDB = null;
			bctx.XmlInfos = null;
		}
	},
	PrepareResources: function (profile,data,context)
	{
		var phasesDesc = aa_first(data,profile,'LoadingPhases',context);
		
		var cbObj = ajaxart_async_GetCallbackObj(context);
		cbObj.marked = true;
		cbObj.phases = bart_loading_phases(phasesDesc,context); 
		cbObj.phaseIndex = 0;
		cbObj.resourceVars = {};
		
		cbObj.prepareCurrentPhase = function(data1,ctx1) {
			var cbObj = ajaxart_async_GetCallbackObj(context);
			if (cbObj.phaseIndex >= cbObj.phases.length) {
				ajaxart_async_CallBack(data,context); return;
			}
			// load resources in parrallel
			var phaseContext = aa_ctx(ctx1,cbObj.resourceVars);
			phaseContext.vars._AsyncCallback = null;
			var phObj = ajaxart_async_GetCallbackObj(phaseContext);
			phObj.phase = cbObj.phases[cbObj.phaseIndex];
			phObj.loadedCount = 0;
			
			phObj.afterPrepareResource = function(resource,phObj,cbObj) { return function(data2,ctx2) {
				resource.Loaded = true;
				cbObj.resourceVars[resource.Id] = resource.Items;
				phObj.loadedCount++;
				ajaxart.debugData[resource.Id] = resource.Items;
				if (phObj.loadedCount == phObj.phase.resources.length) { // finished the phase
					cbObj.phaseIndex++;
					cbObj.prepareCurrentPhase(data1,ctx1);
				}
			}};
			phObj.callPrepare = function(phObj,cbObj) { 
				for(var i=0;i<phObj.phase.resources.length;i++) {
					var resource = phObj.phase.resources[i];
					phaseContext.vars._This = [resource];
					ajaxart_RunAsync(data,resource.Prepare,phaseContext,phObj.afterPrepareResource(resource,phObj,cbObj));
				}
			};
			phObj.callPrepare(phObj,cbObj);	// prepare all now
		}
		
		cbObj.prepareCurrentPhase(data,context);
		return ["true"];
	},
	RefreshAfterResourceChanged: function (profile,data,context)
	{
		var resources = context.vars._BartContext[0].Resources;
		var id = aa_text(data,profile,'ResourceID',context);
		// avoid recursion
		if ( ! bart_addto_recursion_list(id) ) return;
		
		var dirtyResources = [];
		var addDependent = function(resources,dirtyResources,id) {
			for(var i=0;i<resources.length;i++) {
				if ( resources[i].DependsOn != null && resources[i].DependsOn[0] == id ) {
					var newid = resources[i].ID[0];
					if (ajaxart_object_byid(dirtyResources,newid) == null) {
					  dirtyResources.push(newid);
					  addDependent(resources,dirtyResources,newid);
					}
				}
			}
		}
		addDependent(resources,dirtyResources,id);
		
		var cbObj = ajaxart_async_GetCallbackObj(context);
		if (cbObj == null) return [];
		cbObj.marked = true;
		cbObj.index = 0;
		cbObj.dirtyResources = dirtyResources;
		cbObj.resources = resources;
		
		var callBack = function(data1,context1) {
			var cbObj = ajaxart_async_GetCallbackObj(context);
			if (cbObj.index >= cbObj.dirtyResources.length) {
				// refresh blocks
				var newContext = ajaxart_context_with_resources(context);
				newContext.vars._NoRefreshFromServer = ["true"];
				
				ajaxart_async_CallBack(data,context);
				// remove from list
				bart_removefrom_recursion_list(id);
				return;
			}
			var resource = ajaxart_object_byid(cbObj.resources,cbObj.dirtyResources[cbObj.index]);
			cbObj.index++;
			var newContext = ajaxart_context_with_resources(context);
			ajaxart_runMethod_async(data,resource,'Refresh',newContext,cbObj.seqCallBack);
		}
		cbObj.seqCallBack = callBack;
		
		callBack(data,context);
		return ["true"];
	}
});
//AA EndModule
//AA BeginModule
ajaxart.gcs.bart_server =
{
	LoadNode: function (profile,data,context)
	{
		var id = aa_text(data,profile,'ID',context);
		var ct = aa_text(data,profile,'ContentType',context);
		
		var node = bart_clientDB_getnode(context,id,ct);
		if (node) return [node];
		ajaxart_async_Mark(context);
		bart_loadNode(context,id,ct,function(newdata,ctx2) {
			var noresult = (newdata.length == 0 || newdata[0].getAttribute('_type') == "error");
			if (!noresult && context.vars._BartContext) bart_clientDB_setnode(context,newdata[0]);
			ajaxart_async_CallBack(newdata,context); 
		});				
	},
	Import: function (profile,data,context)
	{
		jBart.vars.lastImport = new Date().getTime();
		return ajaxart.runNativeHelper(data,profile,'Do',context);
	},
	SignUp: function (profile,data,context)
	{
	  var userData = aa_first(data,profile,'UserData',context);
	  if (! userData) return;
	  
	  ajaxart_async_Mark(context);
	  ajaxart_runMethod_async([userData],context.vars._ServerAdapter[0],'SignUp',context,function(data1,ctx) {
		  if (ajaxart.isxml(data1) && data1[0].getAttribute('type') == "success") {
		    var newUserData = ajaxart.xml.xpath(data1[0],'*');
		    if (newUserData.length > 0) {
		  	  var userData = aa_first(data,profile,'UserData',context);
		  	  ajaxart.xml.copyElementContents(userData,newUserData[0]);
		    }
		    ajaxart.run(data,profile,'OnSuccess',aa_ctx(context,{ User: [userData]}));
		  } else {
			ajaxart.run(data,profile,'OnFailure',aa_ctx(context,{ Result: data1}));
		  }
		  ajaxart_async_CallBack(data,context);				
	  });
	}
}
//AA EndModule
bartdt_resources_cache = null;

ajaxart_bart_getContext = function(context) {
	var out = context.vars._BartContext;
	if (out == null || out.length == 0) return null;
	return out[0];
}
function ajaxart_context_with_resources(context)
{
  var resources = context.vars._BartContext[0].Resources;
  var newContext = ajaxart.clone_context(context);
  for(var i=0;i<resources.length;i++) 
	  newContext.vars[resources[i].ID[0]] = resources[i].Items;
  
  return newContext;
}
function bart_loading_phases(phasesDesc,context)
{
	if (!phasesDesc) phasesDesc = { Phases: [] , LazyResources: "" }
	var resources = context.vars._BartContext[0].Resources;
	var phases = [];
	var usedResources = ",";
	var isDev = aa_tobool(context.vars._InBartDesignTime);
	// put resource objects in the phases
	for(var i=0;i<phasesDesc.Phases.length;i++) {
		var phase = { resources: [] } 
		phases.push(phase);
		var ids = phasesDesc.Phases[i].split(',');
		for(var j=0;j<ids.length;j++) {
			if (usedResources.indexOf(','+ids[j]+',') > -1) continue; // used
			if (!isDev && phasesDesc.LazyResources.indexOf(','+ids[j]+',') > -1) continue; // lazy resource. do not load on startup
			usedResources += ids[j] + ',';
			var res = ajaxart_object_byid(resources,ids[j]);
			if (res != null) phase.resources.push(res);
		}
	}
	// go over the rest of the resources
	for(var i=0;i<resources.length;i++) {
		if (usedResources.indexOf(','+resources[i].Id+',') > -1) continue; // used
		if (!isDev && phasesDesc.LazyResources.indexOf(','+resources[i].Id+',') > -1) continue; // lazy resource. do not load on startup
				
		phases.push( { resources: [resources[i]] } );
	}
	return phases;
}
function ajaxart_direct_path(elem)
{
	var index = 0;
	var iter = elem.parentNode.firstChild;
	while (iter != null) {
		if (iter.tagName && iter.tagName == elem.tagName) index++;
		if (iter == elem) break;
		iter = iter.nextSibling;
	}
	return elem.tagName + '[' + index + ']';
}
function bart_contenttype_fields(context,contentType)
{
	return [];
}
function bart_loadNode(context,id,contentType,returnCallback)
{
	var newContext = aa_ctx(context,{ ContentType: [contentType], ID: [id] });
	ajaxart_runMethod_async([],context.vars._ServerAdapter[0],'LoadNode',newContext,returnCallback);
}
function bart_clientDB_setnode(context,node)
{
	var id = node.getAttribute("id");
	var ct = node.getAttribute("_type");
	
	var bctx = context.vars._BartContext[0];
	if (bctx.ClientDB == null) bctx.ClientDB = { isObject: true};
	if (bctx.ClientDB[ct] == null) bctx.ClientDB[ct] = [];
	var items = bctx.ClientDB[ct];
	
	for(var i=0;i<items.length;i++)
		if (items[i].getAttribute('id') == id) { items[i] = node; return; }
	
	items.push(node);
}
function bart_clientDB_getnode(context,id,contentType)
{
	var nodeInGlobalVar = window['BartNode_'+contentType+'__'+id];
	if (nodeInGlobalVar) return nodeInGlobalVar;

	if (!context.vars._BartContext) return null;
	
	var ct = contentType;
	var property = 'ClientDB' ;
	var bctx = context.vars._BartContext[0];
	if (bctx.ClientDB == null || bctx.ClientDB[ct] == null) return null;
	var items = bctx.ClientDB[ct];
	for(var i=0;i<items.length;i++)
	  if (items[i].getAttribute('id') == id)
		  return items[i];
	
	return null;
}
aa_isbart_runtime = false; 
function bart_galleryitem_tousages(gitem)
{
  var runmore = ajaxart.urlparam('more') == "true";
  
  var out = [];
  // old gallery tests
  var tests = ajaxart.xml.xpath(gitem,'AutoTests/Test');
  for (var i=0;i<tests.length;i++)
  {
	//  continue;
	  var isTest = tests[i].getAttribute('run_in_all_tests') == 'true';
	  if (runmore) isTest = tests[i].getAttribute('run_in_more_tests') == 'true';
	  if (!isTest) continue;
	  
	  var t="ui.ControlUsage";
	  if (tests[i].getAttribute('isasync')=="true") t="ui_async.ControlUsage";
	  
	  var usage = '<Usage t="'+t+'" Of="gallery_' + gitem.getAttribute('id') + '.' + tests[i].getAttribute('name') + '">';
	  usage += '<Control t="bart_usage.GalleryItemToUsageControl"><GalleryItem t="xml.Xml">' + ajaxart.xml2text(gitem) + '</GalleryItem>';
	  usage += '<Test t="xml.Xml">' + ajaxart.xml2text(tests[i]) + "</Test>";
	  usage += '</Control>';
	  
	  var params = ajaxart.xml.xpath(tests[i],'*');
	  for(var j=0;j<params.length;j++)
		  usage += ajaxart.xml2text(params[j]);
	  
	  usage += "</Usage>";
	  out.push(ajaxart.parsexml(usage));
  }
  // new gallery tests
  tests = ajaxart.xml.xpath(gitem,'Tests/Test');
  for (var i=0;i<tests.length;i++)
  {
	  var test = tests[i];
	  var isTest = test.getAttribute('RunInAllTests') == 'true';
	  if (runmore) isTest = test.getAttribute('RunInAllTests') == 'true';
	  if (!isTest) continue;
	  test.setAttribute('Of','gallery_' + gitem.getAttribute('id') + '.' + test.getAttribute('Name'));
	  if (test.getAttribute('t') == 'bart_usage.JBartUsage' || test.getAttribute('t') == 'bart_usage.JBartStudioUsage')
		  var child = ajaxart.parsexml('<Var name="_WidgetXml" value="%../..%" />','','',false,test);
	  else if (test.getAttribute('DoesNotChangeWidgetData') == 'true')
		  var child = ajaxart.parsexml('<Var name="_TestDB" value="%../../bart_dev/db%" />','','',false,test);
	  else
		  var child = ajaxart.parsexml('<Var name="_TestDB" t="data.Duplicate" Data="%../../bart_dev/db%" />','','',false,test);
	  
	  test.appendChild(child);
	  out.push(test);
  }
  return out;
}
bart_recursionlist = ",";
function bart_addto_recursion_list(id)
{
	if (bart_recursionlist.indexOf(","+id+",") == -1) {
		bart_recursionlist = bart_recursionlist + id +",";
		return true;
	}
	return false;
}
function bart_removefrom_recursion_list(id)
{
	var pos = bart_recursionlist.indexOf(","+id+","); 
	if (pos >-1) 
		bart_recursionlist = bart_recursionlist.substring(0,pos) + bart_recursionlist.substring(pos+id.length+1);
}
function bartdt_page_params(page,context) {
	if (page.ResourceID && page.ResourceID != "") return [];	// no need for page params. it contains its own resource within
	var ct = page.ContentType;
	if (context.vars._ServerAdapter[0].DB) {
	  var db = context.vars._ServerAdapter[0].DB[0];
	  var items = aa_xpath(db,aa_totext(ct)+'/*');
	  if (items.length == 0) items = [ ajaxart.parsexml('xml') ];
	  var dataitems = { isObject:true, Items: items }
	  return [ { isObject: true, DataItems: dataitems} ];
	}
	return [];
}
function bart_find_top_circuit_of_page(xtml,context)
{
	var page = null;
	for (var node=xtml; node!=null; node=ajaxart.xml.parentNode(node)) {
		if (node.nodeType == 1 && node.getAttribute("type") == "jbart.MyWidgetPage")
			page = ajaxart.childElem(node,'xtml');
		if (aa_tag(node) == "Page")
			page = node;
		if (page != null) {
			var circuit = {isObject:true };
			var top_circuit_runner = {isObject:true, PageDef: ajaxart.run([],page,'',context)[0] };
			top_circuit_runner.TopCircuit = function() {
				var newContext = aa_ctx(context,{_PageParams: bartdt_page_params(this.PageDef,context)});
				var baseData = [];
				if (this.PageDef.FieldData) baseData = this.PageDef.FieldData([],context); // a page which is a field
				
				if (this.PageDef.Control) this.PageDef.Control(baseData,newContext);
			};
			// Run page once and find inputs for xtml
			var ctx1 = aa_ctx(ajaxart.newContext(), { AAEditorState: [{isObject:true, SelectedInTree: [{isObject:true, Xtml: [xtml]}] }] });
			var inputs = aa_run_component("xtml_dt.CalcPreviewHelper",[top_circuit_runner],ctx1);
			if (inputs.length > 0 && inputs[0].Input.length > 0)
				circuit.Input = inputs[0];
			circuit.RunCircuit = function() {
				var out;
				if (this.Input)
					out = ajaxart.run(this.Input.Input, xtml, '', this.Input.context);
				else // rerun entire page
					top_circuit_runner.TopCircuit();
//					out = ajaxart.run([], xtml, '', context);	// todo: put bart global data sources here
				return out;
			}
			if (aa_tag(xtml) == 'Page') {
				circuit.RunCircuit = function() {
					var page_def = ajaxart.run([],xtml,'',context)[0];
					if (page_def.Control) return page_def.Control([],aa_ctx(context,{_PageParams: bartdt_page_params(page_def,context)}));
				}
			}
			if (aa_tag(xtml) == "Field" && circuit.Input)
				bart_find_top_circuit_handle_field(xtml,circuit);
			if (aa_tag(xtml) == "Operation" || aa_tag(xtml) == "Action") {
				circuit.GlobalPreview = function() {};	// no preview
			}
			else {
				circuit.GlobalPreview = function() {
					var out = this.RunCircuit();
					if (ajaxart.ishtml(out)) 
						return out;
					else 	// text to html
						return [jQuery("<span/>").text(ajaxart.totext_array(out))[0]];
				};
			}
			return circuit;
		}
	}
	return null;
}
function bart_find_top_circuit(xtml,context)
{
	var page_result = bart_find_top_circuit_of_page(xtml,context);
	if (page_result) return page_result;		// First try to run as page
	
	var circuit = {isObject:true };

	var elems = [xtml];
	var parent = aa_xpath(xtml,'..')[0];
	if (parent == null) return null;
	while (parent.getAttribute('t') != 'bart.Application' && parent.tagName != 'Usage') {
		if (parent.tagName == 'Component' && parent.parentNode && parent.parentNode.getAttribute('_type')=='bart_unit') {
			// a component. try to find its usage
			var fullid = parent.parentNode.getAttribute('id') + '.' + parent.getAttribute('id');
			var usage = aa_xpath(parent.parentNode,"Component[@id='App']/xtml/Usage[@Of='"+fullid+"']")[0];		// TODO: move the usages
			if (usage == null)
				usage = aa_xpath(parent.parentNode,"Usage[@Of='"+fullid+"']")[0];
//			if (usage == null)
//				usage = elems[elems.length-1];  // the xtml
			
			if (usage != null) {  // the usage is our main circuit
				var circuit = {isObject:true, Usage: usage, Context: context };
				circuit.RunCircuit = function() { ajaxart.run([],this.Usage,'',this.Context); }
				circuit.GlobalPreview = function() { return ajaxart.run([],this.Usage,'',this.Context,'Result'); } 
				return circuit;
			}
		}
		elems.push(parent);
		parent = parent.parentNode;
		if (parent == null || parent.nodeType == 9) return null; // not bart
	}
	elems = elems.reverse();
	if (elems[0].tagName == 'Usage') {
		var init = function(circuit,usageProf) {
		  circuit.RunCircuit = function() { ajaxart.run([],usageProf,'',context); }
		}
		init(circuit,elems[0]);
		return circuit;
	}
	if (elems[0].tagName != "Pages" || elems.length <= 1) return null;
	var page = elems[1];
}
function bart_find_top_circuit_handle_field(xtml,circuit)
{
	var dummy_container = ajaxart.xml.clone([xtml.parentNode]);
	if (dummy_container.getAttribute("t") == "bart.MultiplePage")
		dummy_container.setAttribute("t","ui.ItemList");
	if (dummy_container.getAttribute("t") == "bart.SinglePage" || dummy_container.getAttribute("t") == "field.XmlGroup" )
		dummy_container.setAttribute("t","ui.Document");
	var to_remove = ajaxart.childElems(dummy_container,"Field");
	to_remove = to_remove.concat(ajaxart.childElems(dummy_container,"Fields"));
	to_remove = to_remove.concat(ajaxart.childElems(dummy_container,"Items"));
	to_remove = to_remove.concat(ajaxart.childElems(dummy_container,"Item"));
	for (var i=to_remove.length-1; i>=0; i--)
		dummy_container.removeChild(to_remove[i]);
	if (dummy_container.getAttribute("t") == "ui.ItemList") {
		dummy_container.appendChild(ajaxart.parsexml('<Items t="data_items.Items" Items="%%" />','','',true,dummy_container));
	}
	dummy_container.appendChild(ajaxart.parsexml('<Fields t="xtml_dt.DummyFieldForPreview" />','','',true,dummy_container));
	circuit.DummyContainer = dummy_container;
	circuit.ContainerInput = ajaxart.dynamicText([],'%$_Cntr/Items/Items%',circuit.Input.context);
	circuit.RunCircuit = function() {
		return ajaxart.run(this.ContainerInput, this.DummyContainer, '', aa_ctx(this.Input.context, {_FieldForPreview: [xtml]}));
	}
}



aa_gcs("chart2", {
	Chart: function (profile,data,context)
	{
		var field = { };
		field.Id = aa_text(data,profile,'ID',context);
		field.ID = [field.Id];
		field.Title = aa_multilang_text(data,profile,'Title',context);
		var ctx = aa_ctx(context,{_Field: [field]} );
		field.Fields = ajaxart.runsubprofiles(data,profile,'Field',ctx);
		
		field.Control = function(fieldData,ctx) {
			var items = ajaxart.run(data,profile,'ChartItems',aa_merge_ctx(context,ctx));
			var chartObject = aa_createChartObject(items,field.Fields,context);
			chartObject.Title = aa_multilang_text(data,profile,'ChartTitle',context);
			
			field.Chart = aa_first(data,profile,'Chart',ctx);
			if (field.Chart && field.Chart.IsTriplet) {
				chartObject.jElem = jQuery(field.Chart.Html);
				chartObject.control = chartObject.jElem[0];
				
				chartObject.jElem.addClass(aa_attach_global_css(field.Chart.Css,null,'chart'));
				aa_apply_style_js(chartObject,field.Chart,ctx);
			}
			jBart.trigger(field,'initChartObject',chartObject);  // allow non triplets to make effect
			return [chartObject.control];
		}
		
		ajaxart.runsubprofiles(data,profile,'FieldAspect',ctx);
		return [field];
	}
});

function aa_createChartObject(items,fields,context)
{
	var chartObject = {
		Items: items,
		Fields: fields,
		Context: context,
		control: jQuery('<div/>')[0],
		DataMatrix: function(includeHeaders) {
			var out = [];
			if (includeHeaders) {
				var headers = [];
				for(var j=0;j<this.Fields.length;j++) {
					var title = this.Fields[j].Title;
					headers.push(title);
				}
				out.push(headers);
			}
			for(var i=0;i<this.Items.length;i++) {
				var item = this.Items[i];
				var row = [];
				for(var j=0;j<this.Fields.length;j++) {
					var field = this.Fields[j];
					var fieldData = field.FieldData ? field.FieldData([item],context) : item;
					var textValue = aa_totext(fieldData);
					if (field.IsNumber) {
						try {
						  textValue = parseFloat(textValue);
						} catch(e) { textValue = 0; }
					}
					row.push(textValue);
				}
				out.push(row);
			}
			return out;
		}
	};
	return chartObject;
}






aa_gcs("control",{
	Label: function (profile,data,context)   // gc of control.Label
	{
		var field = {
		  Id: aa_text(data,profile,'ID',context),
		  Title: aa_multilang_text(data,profile,'Title',context),
		  Style: aa_first(data,profile,'Style',context),
		  TitleAsText: !profile.getAttribute('Text') && !aa_xpath(profile,'Text')[0]
		};
		field.ID = [field.Id];
		
	 var ctx2 = aa_ctx(context,{_Field: [field]} );
		
	 field.Control = function(field_data,ctx) {
			var text = field.TitleAsText ? field.Title : aa_multilang_text(field_data,profile,'Text',aa_merge_ctx(ctx2,ctx));
			text = text.replace(/\n/g,"<br/>");
		
			return [ aa_renderStyleObject(field.Style,{ text: text, data: field_data[0] },ctx) ];
	 };
	 ajaxart.runsubprofiles(data,profile,'FieldAspect',ctx2);
	 return [field];
	},
	Layout: function(profile, data, context)
	{
		var layout_field = {
			Id: aa_text(data,profile,'ID',context),
			Title: aa_multilang_text(data,profile,'Title',context),
			Style: aa_first(data,profile,'Layout',context),
			SectionStyle: aa_first(data,profile,'SectionStyle',context)
		};
		
		layout_field.Control = function(field_data,ctx) {
			var baseCtx = aa_ctx(ctx,{});
			jBart.trigger(layout_field,'ModifyInstanceContext',{ Context: baseCtx, FieldData: field_data });
			var fields = ajaxart.runsubprofiles(field_data,profile,'Field',aa_merge_ctx(context,baseCtx));
			var newFields = [];
			for(var i=0;i<fields.length;i++) { // we do not need the constant hidden fields
	        	if (fields[i].CalculatedOnly) 
	        		fields[i].Calculate(field_data,baseCtx);
	        	if (fields[i].IsHidden) continue;
	        	if (fields[i].IsCellHidden && fields[i].IsCellHidden(field_data,ctx)) continue;
	        	
	        	newFields.push(fields[i]);
	    }
	    fields = newFields;
			jBart.trigger(layout_field,'InnerFields',{ Context: baseCtx, FieldData: field_data, Fields: fields });					
	        
	        var out = aa_renderStyleObject(layout_field.Style,{ 
	        	Fields:fields,
	        	addFields: function(classOrElement,init_field_func) {
					var inner = this.getInnerElement(classOrElement);
					if (!inner || !init_field_func) return;
					var innerParent = inner.parentNode;
					var fields = this.Fields;
					
					for(var i=0;i<fields.length;i++) {
						var field = fields[i];
						var elem = inner.cloneNode(true);
						innerParent.insertBefore(elem,inner);
						aa_element_attached(elem);
						
						var field_obj = aa_api_object(elem,{ 
							Field: field, data : this.data, 
							Title: field.Title, HideTitle: field.HideTitle, 
							setControl: function(classOrElement2) {
								var inner = this.getInnerElement(classOrElement2);
								inner.jbFieldElement = this;
								if (!inner) return;
								var ctx2 = aa_ctx(baseCtx,{_Field: [this.Field]});
	
								aa_fieldControl({ Field: this.Field, Wrapper: inner, Item: field_data, Context: ctx2 });
							}
						});
						init_field_func.call(field_obj,field_obj);
						}
					inner.parentNode.removeChild(inner);
				}
	        },ctx);
	        out.jbContext = baseCtx;
	        
			if (layout_field.SectionStyle) {
				return [ aa_wrapWithSection(out,layout_field,layout_field.SectionStyle,field_data,ctx) ];
			}
			return [out];
		}
		
		ajaxart.runsubprofiles(data,profile,'FieldAspect',aa_ctx(context,{_Field: [layout_field]}));
		return [layout_field];
	},
	CustomControl: function (profile,data,context) {
		var field = context.vars._Field[0];
		field.Style = aa_first(data,profile,'Control',context);
		
		field.Control = function(field_data,ctx) {
			return [aa_renderStyleObject(field.Style,{ Field: field, Data: field_data, Context: context, context: context },context)];
		}
 	},
  Button: function (profile,data,context)
  {
		aa_init_class_Button();
		
		var field = {
		  Id: aa_text(data,profile,'ID',context),
		  Title: aa_multilang_text(data,profile,'Title',context),
		  Image: aa_first(data,profile,'Image',context),
		  Style: aa_first(data,profile,'Style',context)
		};
		field.ID = [field.Id];
		
		field.Control = function(field_data,ctx) {
			var ctx2 = aa_merge_ctx(context,ctx);
			var text = aa_multilang_text(field_data,profile,'ButtonText',ctx2) || field.Title;
			if (field.Image && field.Image.Url)
				field.Image.StaticUrl = aa_totext(field.Image.Url(field_data,ctx2));

			var image = aa_create_static_image_object(field.Image);

			var buttonApiObject = new ajaxart.classes.Button({
				text: text, 
				tooltip: aa_multilang_text(field_data,profile,'Tooltip',ctx2),
				image: image,
				field: field, 
				data: field_data, profile: profile, context: ctx2
			});

			return [aa_renderStyleObject(field.Style,buttonApiObject,ctx2,true)];
		}
		ajaxart.runsubprofiles(data,profile,'FieldAspect',aa_ctx(context,{_Field: [field]}));
		return [field];
   	},
    ImageGallery: function(profile,data,context) {
        var field = aa_create_base_field(data, profile, context);
        field.Control = function(field_data,ctx) {
            var images = ajaxart.run(field_data,profile,'Images',context);
            var ctx2 = aa_merge_ctx(context,ctx);
            return [aa_renderStyleObject(field.Style,{ images: images },ctx2,true)];
        }
        
        return [field];
    }
});

function aa_init_class_Button() {
	ajaxart.classes = ajaxart.classes || {};
	if (ajaxart.classes.Button) return;

	ajaxart.classes.Button = function(settings) {	
		aa_extend(this,settings);
	}
	ajaxart.classes.Button.prototype.action = function(e) {
		if (window.aa_incapture) return;

		var ctx = aa_ctx(this.context,{ControlElement: [this.el] });
		if (this._isAsync) {
			ajaxart_RunAsync(this.data,ajaxart.fieldscript(this.profile,'Action'),ctx,function() {
				jBart.trigger(this,'actionEnd');	
			});
		} else {
			ajaxart.run(this.data,this.profile,'Action',ctx);
		}
	}
	ajaxart.classes.Button.prototype.onActionEnd = function(callback) {
		this._isAsync = true;
		jBart.bind(this,'actionEnd',callback);
	}
}

function aa_create_base_field(data, profile, context)
{
	var field = {
		Id: aa_text(data,profile,'ID',context),
		Title: aa_multilang_text(data,profile,'Title',context),
		Image: aa_first(data,profile,'Image',context),
		Style: aa_first(data,profile,'Style',context)
	};
	field.ID = [field.Id];
	ajaxart.runsubprofiles(data,profile,'FieldAspect',aa_ctx(context,{_Field: [field]}));
	return field;
}

aa_gcs("data",	{
	  Switch: function (profile,data,context)
	  {
		  return aa_switch(profile,data,context);
	  },
	  StringifyJson: function (profile,data,context) {
		  var obj = aa_first(data,profile,'Object',context) || {};
		  var xtmlSource = obj.XtmlSource;
		  var dtsupport = obj.dt_support;
		  delete obj.XtmlSource;
		  delete obj.dt_support;
		  var result = JSON.stringify(obj);
		  if (xtmlSource) obj.XtmlSource = xtmlSource;
		  if (dtsupport) obj.dt_support = dtsupport;
	  	  return [result];
	  },
	  RemoveNullProperties: function (profile,data,context) {
		  var orig = aa_first(data,profile,'Object',context) || {};
		  var out = {};
		  for (i in orig)
			  if (orig[i] != null) out[i] = orig[i];
		  return [out]
	  },
	  ParseJson: function (profile,data,context) {
	  	  return [JSON.parse(aa_text(data,profile,'JSON',context) || '{}')];
	  },
	  Subset: function (profile,data,context)
	  {
	    var from = aa_int(data,profile,'From',context)-1;
	    var count = aa_int(data,profile,'Count',context);
	    if (isNaN(count)) count = data.length;
	    return data.slice(from,from+count);
	  },
	  JustInTimeCalculation: function (profile,data,context)
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
	  JavaScript: function (profile,data,context)
	  {
		var ret = aa_run_js_code(aa_text(data,profile,'Code',context),data,context);
		if (!ret) return [];
		if (typeof(ret) == 'string') return [ret];
		if (typeof(ret) == 'number') return [""+ret];
		if (typeof(ret) == 'boolean') {
			if (ret) return ["true"];
			else 	 return [];
		}
		if (ajaxart.isArray(ret)) return ret;
		return [ret]
	  },
	  AddSeparator: function (profile,data,context)
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
	  Count: function (profile,data,context)
	  {
		  var items = ajaxart.run(data,profile,'Items',context);
	  	  return [items.length];
	  },
	  AssignTemplate: function (profile,data,context)
	  {
		var template = aa_text(data,profile,'Template',context);
		var input = ajaxart.run(data,profile,'Input',context);
		var out = "",part = template;
		
		// expressions e.g. {%@name%}
		while (part.indexOf('{%') > -1) {
			var pos1 = part.indexOf('{%');
			var pos2 = part.indexOf('%}',pos1);
			out += part.substring(0,pos1);
			var inner = part.substring(pos1+1,pos2+1);
			out += aa_totext(ajaxart.dynamicText(input,inner,context,null,false));
			part = part.substring(pos2+2);
		}
		out += part;

		// translations e.g. t(name)
		part = out; out = "";
		while(part.indexOf('t(') > -1) {
			var pos1 = part.indexOf('t(');
			var pos2 = part.indexOf(')',pos1);
			out += part.substring(0,pos1);
			var inner = part.substring(pos1+2,pos2);
			out += ajaxart_multilang_text(inner,context);
			part = part.substring(pos2+1);
		}
		out += part;
		
		return [out]
	  },
	  FirstSucceeding: function (profile,data,context)
	  {
	    var itemProfiles = ajaxart.subprofiles(profile,'Item');

	    for(var i=0;i<itemProfiles.length;i++)
	    {
	    	var subresult = ajaxart.run(data,itemProfiles[i],"",context);
	    	if (subresult.length > 0) return subresult;
	    }
	  	
	  	return [];  	
	  },
	  IfThenElse: function (profile,data,context)
	  { 
		return aa_ifThenElse(profile,data,context);
	  },
	  ItemByID: function (profile,data,context)
	  {
		  var list = ajaxart.run(data,profile,'List',context);
		  var id = aa_text(data,profile,'ID',context);
		  
		  for(var i=0;i<list.length;i++)
			  if (list[i].ID == id) return [ list[i] ];
		  
		  return [];
	  },
	  ItemsByIDs: function (profile,data,context)
	  {
		  var list = ajaxart.run(data,profile,'List',context);
		  var ids = "," + aa_text(data,profile,'IDs',context) + ",";
		  if (ids == ",*,") return list;
		  
		  var out = [];
		  
		  for(var i=0;i<list.length;i++) 
			  if (list[i].Id != "" && ids.indexOf(list[i].Id) != -1) out.push(list[i]);
		  
		  return out;
	  },
	  List: function (profile,data,context)
	  {
	    var items = ajaxart.subprofiles(profile,'Item');
	  	var out = [];
	  	
	  	for(var i=0;i<items.length;i++) {
	  	  var next = ajaxart.run(data,items[i],"",context);
	  	  ajaxart.concat(out,next);
	  	};
	  	
	  	return out;  	
	  },
	  Pipeline: function (profile,data,context)
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
	  RunActionAndKeepInput: function (profile,data,context)
	  {
		  ajaxart.run(data,profile,'Action',context);
		  return data;
	  },
	  Same: function (profile,data,context)
	  {
	  	return data;
	  },
	  CleanNS: function (profile,data,context)
	  {
		  if (data[0] && typeof(data[0]) == 'object' && ! data[0].nodeType ) // json or csv
				return jbart_data(data[0],'single');

		  return jbart_data(ajaxart.totext_array(data),'single');
	  }
});





//AA BeginModule
aa_gcs("data", {
  Zip: function (profile,data,context)
  {
	var lists = [];
  	var itemProfiles = ajaxart.subprofiles(profile,'List');
  	for(var i in itemProfiles) 
  		lists.push({list:ajaxart.run(data,itemProfiles[i],"",context) });
	  
	var i=0;
	var result = [];
	if (lists.length == 0) return result;
	var result_length = 0;
	for(var j in lists)
		result_length = Math.max(result_length,lists[j].list.length);
	
	for(var i=0;i<result_length;i++)
	{
	  var item = { isObject: true};
	  for(var j in lists)
		  item['' + j] = (i < lists[j].list.length) ? lists[j].list[i] : '';
	  result.push(item);
	}
	return result;
  },
  Csv: function (profile,data,context)
  {
	  var content = aa_text(data,profile,'Content',context);
	  var fieldNames = aa_text(data,profile,'FieldNames',context).split(',');
	  var lines = content.split('\n');
	  var result = [];
	  var first_line = 0;
	  if (fieldNames == '') 
	  {
		  fieldNames = lines[0].split(',');
		  first_line = 1;
	  }
	  for(var i=first_line;i<lines.length;i++)
	  {
		  if (lines[i] == '') continue;
		  var fields = lines[i].split(',');
		  var obj = { isObject: true, __index: i};
		  for (var j=0;j<fieldNames.length;j++)
			  obj[fieldNames[j]] = fields[j];
		  result.push(obj);
	  }
	  return result;
  },
  Reduce: function (profile,data,context)
  {
    var result = ajaxart.run(data,profile,'InitialValue',context);
    var items = ajaxart.run(data,profile,'Items',context);

    for(var i=0;i<items.length;i++)
    	result = ajaxart.run(result,profile,'Formula',aa_ctx(context,{ Item : [items[i]] } ) );
  	
  	return [result];  	
  },
  Math: function (profile,data,context)
  {
	  var exp = aa_text(data,profile,'Expression',context);
	  var round = aa_text(data,profile,'RoundResult',context);
	  try
	  {
		  eval('var val = ' + exp);
	      var res = ajaxart.totext(val)
	  	  if (round == "round") 
	  		  return [ Math.round(res) ];
	      if (round == "floor") 
	    	  return [ Math.floor(res) ];
	      if (round == "ceil") 
	    	  return [ Math.floor(res) ];
		  return [ res ];
	  }
	  catch(e)
	  {
		  return [];
	  }
  },
  Percent: function (profile,data,context) {
	  var result = [];
	  var exp = aa_text(data,profile,'Part',context) + '/' + aa_text(data,profile,'Whole',context);
	  try {
		  eval( 'var val = "" + 100*' + exp);
		  result.push(val);
	  }
	  catch(e) { 
		  ajaxart.log("Can not calc percent expression: " + exp,'Error');
	  }
	  return result;
  },
  Parents: function(profile, data, context)
  {
	var max_depth = aa_int(data,profile,'MaxIterations',context);
	var item = data[0],out = [];
	if (aa_bool(data,profile,'IncludeItself',context)) out.push(item);
	
	while (item && max_depth >0) {
	  max_depth--;
	  if (aa_bool([item],profile,'StopWhen',context))
		  return out;
	  item = aa_first([item],profile,'ParentRelation',context);
	  if (item)
		  out.push(item);
	}
	return out;
  },
  RandomPick: function (profile,data,context)
  {
	  if (data.length <= 1) return data;
	  
	  var rnd = Math.random();
	  var num = Math.floor( rnd * data.length );
	  return [ data[num] ];
  },
  RandomNumber: function (profile,data,context)
  {
	  var from = aa_int(data,profile,'From',context);
	  var to = aa_int(data,profile,'To',context);
	  var rnd = Math.random();
	  var num = Math.floor( rnd * (to-from+1) ) + from;
	  return [ num ];
  },
  RandomShuffle: function (profile,data,context)
  {
	  if (data.length <= 1) return data;

	  var o = [];
	  for(var i=0;i<data.length;i++) o[i] = data[i];
	  
	  for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	  
	  return o;
	  
  },
  Last: function (profile,data,context)
  {
	  if (data.length == 0) return [];
	  return [ data[data.length-1] ];
  },
  Slice: function (profile,data,context)
  {
    var from = aa_int(data,profile,'From',context);
    var to = aa_int(data,profile,'To',context);
    if (isNaN(to)) to = data.length;
    if (isNaN(from)) from = 0;
    
	return data.slice(from,to);
  },
  Min: function (profile,data,context)
  {

    var result = null;
    var min = 1E6;
    
    ajaxart.each(data,function(item) {
    	var toCompare = aa_int([item],profile,'ToCompare',context);
    	if (toCompare < min)
    	{
    		min = toCompare;
    		result = item;
    	}
  	});
    if (result == null) return [];
	return [result];
  },

  Max: function (profile,data,context)
  {
    var result = null;
    var max = -1E6;
    
    ajaxart.each(data,function(item) {
    	var toCompare = aa_int([item],profile,'ToCompare',context);
    	if (toCompare > max)
    	{
    		max = toCompare;
    		result = item;
    	}
  	});
    if (result == null) return [];
	return [result];
  },
  Average: function (profile,data,context)
  {
  	var digits = aa_int(data,profile,'Digits',context);
    var count=0,sum=0;
    if (data.length == 0) return [0];
    for(var i=0;i<data.length;i++) {
    	count++;
    	sum += Number(ajaxart.totext_item(data[i]));
    }
    if (isNaN(sum)) return [];
    var base = Math.pow(10,digits);
    var num = Math.round(base * sum / count) / base;
	return [num];
  },
  Sum: function (profile,data,context)
  {
    var sum=0;
    for(var i=0;i<data.length;i++)
    	sum += Number(ajaxart.totext_item(data[i]));
    
    if (isNaN(sum)) return [];
	return [sum];
  },
  InPreviewMode: function (profile,data,context)
  {
	if (typeof(ajaxart) != "undefined" && ajaxart.inPreviewMode) return ["true"];
	return [];
  },
  RecursiveScan: function (profile,data,context)
  {
	  var onlyLeaves = aa_bool(data,profile,"OnlyLeaves",context);
	  var maxItems = aa_text(data,profile,"MaxItemsToAvoidInfinitiveLoop",context);
	  var scanOrder = aa_text(data,profile,"ScanOrder",context);
	  
	  var result = [];
	  var nodes = data;
	  var current_node_index = 0;
	  var total = 0;
	  
	  while (nodes.length > current_node_index) {
	  	var current_node;
	  	if (scanOrder == "Depth first search")
	  		current_node = nodes.pop();
	  	else {
	  		current_node = nodes[current_node_index];
	  		current_node_index++;
	  	}
		  var nextLevel = ajaxart.run([current_node],profile,'ChildNodes',context);
		  if (scanOrder == "Depth first search")
		  	nextLevel = nextLevel.reverse();
		  ajaxart.concat(nodes,nextLevel);
		  if (!onlyLeaves || nextLevel.length ==0)
		  	result.push(current_node);
		  if (total++ > maxItems) {
		  	ajaxart.log("RecursiveScan - exceeded max items, might be infinitive loop, max items:" + total,"error");
		  	break;
		  }
	  }
	  return result;
  },
  UniqueNumber: function (profile,data,context)
  {
	  var prefix = aa_text(data,profile,'Prefix',context);
	  var suffix = aa_text(data,profile,'Suffix',context);
	  var num = prefix + (ajaxart.unique_number++) + suffix;
	  
	  return [num];
  },
  Demote: function (profile,data,context)
  {
	  var demote = "," + aa_text(data,profile,'Items',context) + ",";
	  var i=0;
	  var out = [], last = [];
	  for(var i=0;i<data.length;i++) {
		  var itemText = aa_text([data[i]],profile,'ItemText',context);
		  if (demote.indexOf(","+itemText+",") == -1) out.push(data[i]); else last.push(data[i]);
	  }
	  for(var i=0;i<last.length;i++) out.push(last[i]);
	  return out;
  },
  Single: function (profile,data,context)
  {
	  var items = ajaxart.run(data,profile,"Items",context);
	  return [items];
  },
  Url: function (profile,data,context)
  {
	  var str = "" + window.location.href;
	  return [str];
  },
  IsInSelectedItems: function (profile,data,context)
  {
		var list = "," + ajaxart.totext_item(ajaxart.getVariable(context,'SelectedItems')[0]) + ",";
		var txt = "," + ajaxart.totext_item(data[0]) + ",";
		if (list.indexOf(txt) != -1)
			return ["true"];
		return [];
  },
  IsCodeInSelectedItems: function (profile,data,context)
  {
		var list = "," + ajaxart.totext_item(ajaxart.getVariable(context,'SelectedItems')[0]) + ",";
		var txt = "," + aa_text(data,profile,'Code',context) + ",";
		if (list.indexOf(txt) != -1)
			return ["true"];
		return [];
  },
  ValueFromCookie: function (profile,data,context)
  {
	var name = aa_text(data,profile,'Cookie',context);
	var asXml = aa_bool(data,profile,'AsXml',context);
	var result = ajaxart.cookies.valueFromCookie(name);
	if (result == null) return [];
	if (asXml)
	  if (result == "") return [];
	  else return [ajaxart.parsexml(result,"cookie " + name)];
	return [result];
  },
  Object: function (profile,data,context)
  {
	  var out = { isObject: true };
	  var elem = profile.firstChild;
	  while (elem != null)
	  {
		  if (elem.nodeType == 1) 
		  {
			  var tag = aa_tag(elem);
			  var name = elem.getAttribute('name');
			  if (name == null || name == "") { elem = elem.nextSibling;  continue; }
			  
			  if (tag == 'Property') {
				  out[name] = ajaxart.run(data,elem,'',context);
			  } else if (tag == 'LightMethod') {
				  out[name] = { script: elem , context: context, compiled: ajaxart.compile(elem,'',context,elem.getAttribute("paramVars")) };
			  } else if (tag == 'Method') {
				  out[name] = { script: elem , context: context, objectForMethod: [out], compiled: ajaxart.compile(elem,'',context,elem.getAttribute("paramVars")) };
			  }
		  }
	    elem = elem.nextSibling;
	  }
			
	  return [out];
  },
  MakeUnique: function (profile,data,context)
  {
  	var item_names = {};
  	var out = [];
  	for(var i=0;i<data.length;i++) {
  	 var item = data[i];
      var id = "_" + aa_text([item],profile,'Identifier',context);
      var used = true;
      if (!item_names[id]) {
      	item_names[id] = true;
      	out.push(item);
      }
  	}
  	return out;
  },
  GroupBy: function (profile,data,context)
  {
  	var item_names = {};
  	var groups = [];
  	var group_ids = {};
  	var items = ajaxart.run(data,profile,"Items",context);
  	ajaxart.each(items,function(item) {
      var id = "_" + aa_text([item],profile,'GroupBy',context);
      if (group_ids[id] == null) {
    	group_ids[id] = groups.length;
    	groups.push({isObject: true, ID:id.substring(1), Items:[item]});
      } else
    	  groups[ group_ids[id] ].Items.push(item);
  	});
  	var out = [];
  	ajaxart.each(groups,function(group) {
  		out.push ( aa_first([group] ,profile, 'Group', context) );
  	});
  	return out;
  },
  ExpandWithRelated: function (profile,data,context)
  {
	var max_depth = aa_int(data,profile,'MaxDepth',context);
	var log_relations_to = ajaxart.run(data,profile,'LogRelationsTo',context);
	var log = '';
	var has_log = log_relations_to.length>0;
  	var group = {}, new_items = [];
  	ajaxart.each(data,function(item) {
  		var id = aa_text([item],profile,'Identifier',context);
  		group[id] = { id: id, Item: item, RefCount: 0};
  		new_items.push(id);
  	});
  	
  	function expand(items)
  	{
  		var new_items = [];
  		for(var j=0;j<items.length;j++)
  		{
  			var item = items[j];
  			var related = ajaxart.run([group[item].Item],profile,'Relation',context);
  			for(var i=0;i<related.length;i++)
  			{
  				var related_id = aa_text([related[i]],profile,'Identifier',context);
  				if (!group[related_id]) {
  					group[related_id] = { id: related_id, Item: related[i], RefCount: 0};
  					new_items.push(related_id);
  				}
				if (has_log) log += '<rel from="' + item + '" to="' + related_id + '"/>\n';
  			}
  		}
  		return new_items;
  	};
  	for(var count = 0;new_items.length > 0 && count < max_depth;count++) {
  		new_items = expand(new_items);
  	}
  	if (count >= max_depth) 
  		ajaxart.log("expand error. more than " + max_depth + " levels deep");
  	
  	var out=[];
	for(item in group)
		out.push(group[item]);
	ajaxart.writevalue(log_relations_to,[ajaxart.totext_array(log_relations_to) + log]);
  	return out;
  },
  CountUnique: function(profile,data,context)
  {
	  var out = 0;
	  var uniques = {};
	  for(var i in data)
	  {
		  var key = '' + data[i];
		  if (uniques[key]) continue;
		  uniques[key] = true;
		  out++;
	  }
	  return [out];
  },
  MakeUniqueAndCount: function (profile,data,context)
  {
  	var item_count = {};
  	var out = [];
  	ajaxart.each(data,function(item) {
      var id = ajaxart.totext_item(item);
      var used = true;
      if (item_count[id] == null)
    	  item_count[id] = 0;
      item_count[id]++;
  	});
  	for (x in item_count)
  	{
  	  var it = { isObject: true };
  	  it.text = x;
  	  it.count = item_count[x];
  	  out.push(it);
  	}
  	out.sort(function(a, b) { return a.count - b.count; });
  	return out;
  },
  Struct: function (profile,data,context)
  {
	  return ajaxart.make_array(data,function(item) {
		  var itemProfs = ajaxart.subprofiles(profile,'Item');
		  var out = { isObject: true };
		  ajaxart.each(itemProfs,function(itemProf) {
			  var name = aa_text(data,itemProf,'Name',context);
			  var val = ajaxart.run(data,itemProf,'Value',context);
			  out[name] = val;
		  });
		  return out;
	  },true);
  },
  AddToStruct: function (profile,data,context)
  {
	  var itemProfs = ajaxart.subprofiles(profile,'Item');
	  var out = jQuery.extend({}, data[0]);
	  ajaxart.each(itemProfs,function(itemProf) {
		  var name = aa_text(data,itemProf,'Name',context);
		  var val = ajaxart.run(data,itemProf,'Value',context);
		  out[name] = val;
	  });
	  return [out];
  },
  Aggregate: function (profile,data,context)
  {
   	  var aggProfiles = ajaxart.subprofiles(profile,'Aggregator');
	  
   	  var nextData = data;
   	  ajaxart.each(aggProfiles,function(aggProfile) {
   		  nextData = ajaxart.run(nextData,aggProfile,'',context); 
   	  });
	  return nextData;
  },
  RuntimeObjectType: function (profile,data,context)
  {
	  if (data.length == 0) return ["empty"];
	  if (ajaxart.ishtml_array(data)) return ["html"];
	  if (ajaxart.isxml_array(data)) return ["xml"];
	  if (ajaxart.isObject(data)) return ["struct"];
	  if (data[0].params != null && data[0].vars != null)
		  return ["context"];
	  if (typeof(data[0]) == "function") return ["function"];
	  return ["text"];
  },
  HtmlToCleanText: function (profile,data,context)
  {
	var str = aa_totext(data);
	
	while (str.indexOf('<') > -1) {
		var pos1 = str.indexOf('<');
		var pos2 = str.indexOf('>',pos1);
		if (pos2 > pos1) str = str.substring(0,pos1) + str.substring(pos2+1);
		else return [str];
	}
	return [str];
  },
  ReverseOrder: function (profile,data,context)
  {
  	var out = [];
    ajaxart.each(data,function(item) {
    	out.push(item);
  	});
    out.reverse();
    return out;
  },
  HashPassword: function (profile,data,context)
  {
	  var pwd = ajaxart.totext(data);
	  return [ ajaxart_hashPassword(pwd) ];
  },
  DuplicateNTimes: function (profile,data,context)
  {
  	var times = aa_int(data,profile,'Times',"",context);
  	if (data.length == 0) return [];
  	var out = [];
  	for (var i=0; i<times; i++)
  		out.push( ajaxart.xml.clone( data ) );
  	return out;
  },
  Subtract: function (profile,data,context)
  {
    var list = ajaxart.run(data,profile,'List',context);
    var sub = ajaxart.run(data,profile,'Subtract',context);
    
    var out = [];
    for(var i in list)
    {
    	var item = list[i];
    	var add = true;
    	for(var j in sub)
    	{
    		var subitem = sub[j];
    		if (ajaxart.yesno.itemsEqual(item,subitem))
    		{
    			add = false;
    			break;
    		}
    	}
    	if (add) out.push(item);
    }
    return out;
  },
  Sort: function (profile,data,context)
  {
  	var type = aa_text(data,profile,'Type',context);
  	var order = aa_text(data,profile,'Order',context);
  	var sortPath = aa_text(data,profile,'SortByPath',context);
  	var sortAtSource = aa_bool(data,profile,'SortAtSource',context);
  	var hasSortPath = (sortPath != "");
  	
  	var sort_function = function (item1,item2)
  	{
  		if (item1.sortby < item2.sortby) return -1;
  		if (item2.sortby < item1.sortby) return 1;
  		return 0;
  	};
  	var items = [];
  	for(var i=0;i<data.length;i++) {
  		var value="";
  		if (hasSortPath)
  			value = ajaxart.totext( ajaxart.xml.xpath(data[i],sortPath) );
  		else
  			value = aa_text([data[i]],profile,'SortBy',context);
  		
  		if (type == "number") value = Number(value);
  		if (type == "date") value = aadate_date2int(value);
  		items.push( { data : data[i], sortby : value } );
  	};
  	items.sort(sort_function);
  	if (order == 'Descending')
  		items = items.reverse();
  	var out = [];
  	ajaxart.each(items,function(item) {
  		out.push(item.data);
  	});
  	if (sortAtSource)
  	{
  		// check for same xml parent
  		var parent = null;
  		for (var i=0;i < items.length; i++)
  		{
  			var new_parent = items[i].data.parentNode;
  			if (new_parent != parent && i != 0) return out;
  			parent = new_parent;
  			if (parent == null || parent == undefined) return out;
  		}
  		
  		// remove and add as sorted
  		for (var i=0;i < items.length; i++)
  			parent.removeChild(items[i].data);
  		for (var i=0;i < items.length; i++)
  			parent.appendChild(items[i].data);
  	}	
  	return out;
  },
  VariableValue: function (profile,data,context)
  {
  	var variable = aa_text(data,profile,'Variable',context);
  	return ajaxart.getVariable(context,variable);
  },
  RoundCents: function (profile,data,context)
  {
	  var str = "" + Math.round(data[0] * 100);
	  return [str.substring(0, str.length - 2) + "." + str.substring(str.length - 2, str.length)];
  },

  CreateIfDoesNotExist: function (profile,data,context)
  {
	  var result = ajaxart.run(data,profile,'Query',context);
	  if (result.length > 0) return result;
	  ajaxart.run(data,profile,'Create',context);
	  var result = ajaxart.run(data,profile,'Query',context);
	  if (result.length == 0) ajaxart.log('CreateIfDoesNotExist - Create does not make query ');
	  return result;
  },
  ReplaceItemByIndex: function(profile, data, context) {
	  var index = aa_int(data,profile,'Index',context);
	  var newItem = aa_first(data,profile,'NewItem',context);
	  if (index < 1 || index > data.length || newItem == null) return data;
	  var out = [];
	  for(var i=0;i<data.length;i++)
		  if (i == index-1) out.push(newItem); else out.push(data[i]);
	  
	  return out;
  },
  OccurrenceLimit : function(profile, data, context) {
		var key = aa_text(data, profile, 'Key', context);
		var group = aa_text(data, profile, 'Group', context);
		var timesToAllow = aa_int(data, profile, 'TimesToAllow', context);

		if (typeof (ajaxart.occurrence_cache[group]) == "undefined")
			ajaxart.occurrence_cache[group] = {};
		var gr = ajaxart.occurrence_cache[group];
		if (typeof (gr[key]) == "undefined")
			gr[key] = 0;
		gr[key]++;

		if (gr[key] > timesToAllow)
			return [];
		return [ true ];
	},
	AssignToColumns: function (profile,data,context)
	{
		var cols = aa_int(data,profile,'Columns',context);
		var count = aa_int(data,profile,'Count',context);
		
		var out = [];
		for(var i=0;i<Math.min(cols,count);i++) out.push("");
		
		var curr = 0;
		for(var i=0;i<count;i++) {
			if ( out[curr].length > 0 ) out[curr] = out[curr] + ',';
			out[curr] = out[curr] + i;
			curr = (curr+1)%cols;
		}
		
		return out;
	},
	SpecificIndices: function (profile,data,context)
	{
		var indices = ajaxart.run(data,profile,'Indices',context);
		var out = [];
		for(var i=0;i<indices.length;i++) {
			var index = parseInt( ajaxart.totext(indices[i]) );
			if (index >=0 && index < data.length) out.push(data[index]);
		}
		return out;
	},
  CreateNumbers: function (profile,data,context)
  {
    var from = aa_int(data,profile,'From',context);
    var to = aa_int(data,profile,'To',context);
    
    if (to < from) return [];
    var out = [];
    for(var i=from;i<=to;i++) out.push(i);
    
    return out;
  },
  ByIndexFromList: function(profile, data, context) 
  {
    var items = ajaxart.run(data,profile,'List',context);
    var index = aa_int(data,profile,'Index',context);
    var base = aa_text(data,profile,'Base',context);
    if (base == "0-Based Index" && index < items.length)
    	return [items[index]];
    if (base == "1-Based Index" && index-1 < items.length)
    	return [items[index-1]];
    return [];
  },
  BuildCategories : function(profile, data, context) {
		var categories = ajaxart.run(data,profile,'Categories',context);
		var sep = aa_text(data,profile,'Separator',context);
		
		var result = [];
		for (var i=0;i<categories.length;i++)
		{
			var category = categories[i];
			var items = category.split(sep);
			var inner_result = result;
			for(var j=0;j<items.length;j++)
			{
				var item = items[j];
				if (inner_result[item] == null)
					inner_result[item] = [];
				inner_result = inner_result[item];
			}
		}
		return result;
	},
	  NextLevelCategory : function(profile, data, context) {
		var categories = ajaxart.run(data,profile,'Categories',context);
		var parent = aa_text(data,profile,'Parent',context);
		var sep = aa_text(data,profile,'Separator',context);
		
		var inner_category = categories;
		var items = parent.split(sep);
		for(var j=0;j<items.length;j++)
		{
			var item = items[j];
			if (item.length > 0)
				inner_category = inner_category[item];
		}

		var result = [];
		if (parent.length == 0)
		{
			for (var i in inner_category)
				if (i != null && i != undefined)
					result.push(i);
		}
		else
		{
			for (var i in inner_category)
				result.push(parent + sep + i);
		}

		return result;
	},
   RunNativeHelperTest: function (profile,data,context)
   {
	  var txt = ajaxart.totext(ajaxart.runNativeHelper(data,profile,'FullName',context));
	  return ["name: " + txt];
   },
  Duplicate: function (profile,data,context)
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
  StructEntryNames: function (profile,data,context)
  {
	  if (!ajaxart.isObject(data)) return [];
	  var out = [];
	  for (i in data[0])
		  if (i != 'isObject' && i != 'XtmlSource')
			  out.push(i);
	  return out;
  },
  MeasureCalculationTime: function (profile,data,context)
  {
		var before = new Date().getTime();
		var out = ajaxart.run(data,profile,'Calculation',context);
		var time_passes = new Date().getTime() - before;
		var obj = aa_first(data,profile,'PutTimeInObject',context);
		var property = aa_text(data,profile,'PutTimeInProperty',context);
		if (obj != null && property != "")
			obj[property] = [time_passes];
		return out;
  }
});
//AA EndModule
//AA BeginModule
aa_gcs("data_items", {
	LoadFullItem: function (profile,data,context)
	{
		var item = aa_first(data,profile,'Item',context);
		if (!item) return;
		var dataitems = aa_first(data,profile,'DataItems',context);
		if (dataitems && dataitems.LoadFullItem) 
			dataitems.LoadFullItem([item],context)
		else 
		{
		  var info = aa_getXmlInfo(item,context);
		  if ( info && info.LoadFullItem ) info.LoadFullItem([item],context);
		}
	},
	GroupBy: function (profile,data,context)
	{
		var items = ajaxart.run(data,profile,'Items',context);
		var exclude = aa_text(data,profile,'ExcludeGroups',context);
		
		var groups = [];
		for(var i=0;i<items.length;i++) {
			var item = items[i];
			var group = aa_text([item],profile,'ItemGroup',context);
			if (group == exclude) continue;
			var groupObj = null;
			for (var j=0;j<groups.length;j++) {
				if (groups[j].Option[0] == group) { groupObj = groups[j]; break; } 
			}
			if (groupObj == null) { groupObj = { isObject: true, Name: [group], Items: [] }; groups.push(groupObj); }
			groupObj.Items.push(item);
		}
		var out = { isObject: true, Items: groups };
		
		var nextlevel = function(group,ctx) {
			return group;
		}

		ajaxart_addControlMethod_js(out,'NextLevel',nextlevel,context)
		
		return [out];
	},
	CommaSeparated: function (profile,data,context)
	{
		var out = { isObject: true, Items: [] }
		var items = aa_text(data,profile,'Text',context).split(',');
		var itemFunc = ajaxart.fieldscript(profile,'TextToItem') ? function(item) { return aa_first([item],profile,'TextToItem',context)} : 
			function(item) { return item; };
		for(var i=0;i<items.length;i++)
			if (items[i]) 
				  out.Items.push(itemFunc(items[i]));

		var moveBeforeFunc = function(data1,ctx) {
			if (data1.length == 0) return [];
			var list_var = data;
		    var item = aa_text(data1[0].Item,profile,'ItemToText',ctx) + ',';
		    var beforeItem = ',' + aa_text(data1[0].BeforeItem,profile,'ItemToText',ctx) + ',';
		    var list = ',' + ajaxart.totext_array(list_var) + ',';
		    list = list.replace(item,'');
		    list = list.replace(beforeItem,',' + item + aa_text(data1[0].BeforeItem,profile,'ItemToText',ctx) + ',');
		    list = list.substring(1,list.length-1);
		    ajaxart.writevalue(list_var,[list]);
		    return [];
		}
		var moveToEndFunc = function(data1,ctx) {
			if (data1.length == 0) return [];
			var list_var = data;
		    var item = aa_text(data1,profile,'ItemToText',ctx) + ',';
		    var list = ',' + ajaxart.totext_array(list_var) + ',';
		    list = list.replace(item,'');
		    list = list.substring(1,list.length-1);
		    if (list.length > 0)
		    	list = list + ',' + aa_text(data1,profile,'ItemToText',ctx);
		    else
		    	list = ajaxart.totext_array(data1);
		    ajaxart.writevalue(list_var,[list]);
		    return [];
		}
		var newFunc = function(out) { return function(data1,context1) {
			var new_subset = { isObject: true, Items: ajaxart_writabledata() }
			var saveFunc = function(out,new_subset) { return function(data2,context2) {
				var toAdd = ajaxart.totext_array(new_subset.Items);
				if (toAdd == "") return [];

				var hasItemFunc = ajaxart.fieldscript(profile,'TextToItem') != null;
			    if (!hasItemFunc) out.Items.push(toAdd);
			    else {
			    	new_subset.Items = [ aa_first([toAdd],profile,'TextToItem',context) ];
			    	out.Items.push(new_subset.Items[0]);
			    }
				
			    var newlist = ajaxart.totext_array(data);
			    if (newlist != "") newlist = newlist + ",";
			    newlist = newlist + toAdd;
			    
			    ajaxart.writevalue(data,[newlist]);
			    
				return [];
			}}
			ajaxart_addScriptParam_js(new_subset,'Save',saveFunc(out,new_subset),context1); 
			return [new_subset];
		}}
		var deleteItem = function(data1,ctx1) {
			var item = "," + ajaxart.totext_array(data1) + ",";
			var value = "," + ajaxart.totext_array(data) + ",";
			value = value.replace(item,',');
			value = value.substring(1,value.length-1);
			
			ajaxart.writevalue(data,[value]);
			return [];
		}
		
		ajaxart_addMethod_js(out,'DeleteItem',deleteItem,context);
		ajaxart_addMethod_js(out,'MoveBefore',moveBeforeFunc,context);
		ajaxart_addMethod_js(out,'MoveToEnd',moveToEndFunc,context);
		ajaxart_addScriptParam_js(out,'SubsetForNewItem',newFunc(out),context); 
		
		var newContext = aa_ctx(context,{_Items: [out]} );
		ajaxart.runsubprofiles(data,profile,'Aspect',newContext);
		
		return [out];
	},
	DoSave: function (profile,data,context)
	{
		var data_items = aa_first(data,profile,'DataItems',context);
		var fields = ajaxart.run(data,profile,'Fields',context);
		ajaxart_dataitems_save(data_items,fields,context,function(){
			ajaxart.run(data,profile,'OnSuccess',context);
		});
		
		return [];
	},
	Filter: function (profile,data,context)
	{
		var data_items = ajaxart_dataitem_getItems(context);
		var originalItems = data_items.Items;
		var items = [];
		for(var i=0;i<originalItems.length;i++)
		{
			var item = originalItems[i];
			if (aa_bool([item],profile,'Filter',context))
				items.push(item);
		}
		data_items.Items = items;

		return [];
	},
	Aspects: function (profile,data,context)
	{
		ajaxart.runsubprofiles(data,profile,'Aspect',context);
		return [];
	},
	Writable: function (profile,data,context)
	{
		var obj = ajaxart_dataitem_getItems(context);
		ajaxart_addScriptMethod(obj,'SubsetForNewItem',profile,'SubsetForNewItem',context);
		ajaxart_addScriptMethod(obj,'DeleteItem',profile,'DeleteItem',context);
		ajaxart_addScriptMethod(obj,'CanAcceptExternal',profile,'CanAcceptExternal',context);
		
		// TODO: let Shai look at it and hear his opinion
		var myFunc = function(obj) { return function(data1,context1) {
			ajaxart_async_Mark(context1);
			ajaxart_RunAsync(data1,ajaxart.fieldscript(profile,'DeleteItem'),context1,function (data2,context2) {
				var newValue = [];
				if (obj.Value != null && data1.length > 0 && data1[0].nodeType == 1) {
				  var id = data1[0].getAttribute('id');
				  for(var i=0;i<obj.Value.length;i++) {
					  if (obj.Value[i].getAttribute == null || obj.Value[i].getAttribute('id') != id)
					    newValue.push( obj.Value[i] );
				  }
				  
				  obj.Value = newValue;
				}
				ajaxart_async_CallBack(data2,context2);
			}); 
			return [];
		} };
		ajaxart_addScriptParam_js(obj,'DeleteItem',myFunc(obj),context);
		
		if (ajaxart.fieldscript(profile,'NewValueFromDetached') != null)
			ajaxart_addLightMethod(obj,'NewValueFromDetached',profile,'NewValueFromDetached',context);
		
		return [];
	},
	NextLevel: function (profile,data,context)
	{
		var obj = ajaxart_dataitem_getItems(context);
		ajaxart_addScriptMethod(obj,'NextLevel',profile,'NextLevel',context);
		return [];
	},
	RecursiveNextLevel: function (profile,data,context)
	{
		var obj = ajaxart_dataitem_getItems(context);
		var nextlevel = function(data1,ctx)
		{
			var items = ajaxart.run(data1,profile,'NextLevel',context);
			if (items.length > 0)
			  ajaxart_addControlMethod_js(items[0],'NextLevel',nextlevel,context);
			return items;
		}
		ajaxart_addControlMethod_js(obj,'NextLevel',nextlevel,context)
	},
	OverrideItems: function (profile,data,context)
	{
		var out = ajaxart.run(data,profile,'Items',context);
		var newContext = aa_ctx(context,{_Items: out} );
		ajaxart.runsubprofiles(data,profile,'Aspect',newContext);

		return out;
	},
	Permission: function (profile,data,context)
	{
		var obj = ajaxart_dataitem_getItems(context);
		var perm = aa_text(data,profile,'Permission',context);
		if (perm == "read only") obj.ReadOnly = ["true"];
	}
});
//AA EndModule
ajaxart_dataitem_getItems = function(context) {
	  var field = context.vars['_Items'];
	  if (field == null || field.length == 0) return null;
	  return field[0];
	}

function ajaxart_hashPassword(pwd)
{
  if (pwd == "") return "";
  var num = 0;
  for(var i=0;i<pwd.length;i++)
    num += ( pwd.charCodeAt(i) * i*i );
	  
  return "" + num;
}
function eval_math_formula(formula,digits)
{
	  try
	  {
		  eval('var val = ' + formula);
		  if (typeof(val) != 'number')
			  return Number.NaN;
		  var num = val;
		  if (digits)
		  {
			  var base = Math.pow(10,digits);
			  num = Math.round(base * val) / base;
		  }
		  return num;
	  }
	  catch(e)
	  {
		  return Number.NaN;
	  }
}
function aa_xmlitem_byid(items,id)
{
	for (var i=0;i<items.length;i++)
		if (items[i].getAttribute('id') == id)
			return items[i];
	return null;
}

function aa_aggregate_Sum(cells)
{
	var sum = 0;
	var not_numbers = false;
	for(var i=0;i<cells.length;i++)
	{
		var val = parseInt(ajaxart.totext_item(cells[i]));
		if (! isNaN(val))
			sum += val;
		else
			not_numbers = true;
	}
	return not_numbers ? '' : '' + sum;
}
function aa_aggregate_Average(cells)
{
	var sum = aa_aggregate_Sum(cells);
	if (sum == '') return '';
	return '' + Math.floor(sum * 100/cells.length) / 100;
}
function aa_aggregate_Count(cells)
{
	return '' + cells.length;
}
function aa_aggregate_Concat(cells)
{
	return jQuery(cells).map(function() { return ajaxart.totext_item(this) } ).get().join(", ");
}

function aa_csv_toggle(list,item)
{
	if (list.indexOf(',' + item +',') == -1)
		return list + item + ',';
	return list.replace(',' + item +',',',');
}
//AA BeginModule
aa_gcs("action", {
AddToCommas: function (profile,data,context)
{
	var to = aa_first(data,profile,'To',context);
	var value = ajaxart.run(data,profile,'Value',context);
	var valueText = ajaxart.totext_array(value);
	
	var curr = ajaxart.totext(to);
	if (curr != "") curr = curr + ",";
	curr = curr + valueText;
	
	ajaxart.writevalue([to],[curr]);
	
	return ["true"];
},
Switch: function (profile,data,context)
{
	  return aa_switch(profile,data,context);
},
FirstSucceeding: function (profile,data,context)
{
    var itemProfiles = ajaxart.subprofiles(profile,'Action');

    for(var i=0;i<itemProfiles.length;i++)
    {
    	var subresult = ajaxart.run(data,itemProfiles[i],"",context);
    	if (subresult.length > 0) return subresult;
    }
  	
  	return [];  	
},
IfThenElse : function (profile,data,params)
{
	  return aa_ifThenElse(profile,data,params);
},
WriteToLog : function (profile,data,context)
{
	var message = aa_text(data,profile,'Message',context);
	var title = aa_text(data,profile,'Title',context);
	var level = aa_text(data,profile,'Level',context);
	var title_prefix = "";
	if (title != "")
		title_prefix = title + ":"; 
	ajaxart.log(title_prefix + message,level);
	return data;
},
DelayedRun: function (profile,data,context)
{
	var delay = aa_int(data,profile,'DelayInMilli',context);
	var id = aa_text(data,profile,'UniqueActionID',context);

	if ( id == "" ) // just run it delayed
	    setTimeout(function() { ajaxart.run(data,profile,'Action',context); },delay);
	else
	{
		if (ajaxart.runDelayed == null) ajaxart.runDelayed = [];
		// look for the id in the table
		var newRecord = { id: id , handle: null }
		var getTimerFunc = function(record)
		{
			return function() {
				record.handle = 0;
				ajaxart.run(data,profile,'Action',context);
			}
		}

		for(var i=0;i<ajaxart.runDelayed.length;i++)
		{
			var record = ajaxart.runDelayed[i];
			if (record.id == id) {
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
    return ["true"];
},
	WriteToCookie: function (profile,data,context)
	{
		var cookie = aa_text(data,profile,'Cookie',context);
		var val = aa_text(data,profile,'Value',context);
		
		ajaxart.cookies.writeCookie(cookie,val);
		return ["true"];
	},
	ActionReturningResult: function (profile,data,context)
	{
		ajaxart.run(data,profile,'Action',context);
		return ajaxart.run(data,profile,'Result',context);
	},
	RunOnNextTimer: function (profile,data,context)
	{
		var runNow = aa_bool(data,profile,'RunNow',context);
		var wait = aa_int(data,profile,'WaitInMSec',context);
		if (wait == 0)
			wait = 1;
		var func = function() { 
			ajaxart.run(data,profile,'Action',context) 
		};
		if (runNow)
			func();
		else
			setTimeout(func,wait);
		
		return ["true"];
	},
	RunInTimer: function (profile,data,context)
	{
		var interval = aa_int(data,profile,'IntervalInMilli',context);
		var alsoNow = aa_bool(data,profile,'RunAlsoNow',context);
		var id = aa_text(data,profile,'ID',context);
		if (id != '')
		{
			if (ajaxart.runningTimers[id]) return; // already running
			ajaxart.runningTimers[id] = true;
		}
		
		setInterval(function() { 
			ajaxart.run(data,profile,'Action',context) 
		} ,interval);
		
		if (alsoNow)
		  setTimeout(func,1);
		
		return ["true"];
	}
});
//AA EndModule


aa_gcs("date", {
		Now: function (profile,data,context)
		{
			var format = aa_text(data,profile,'Format',context);
			var date = new Date();
			if (window.aa_serverTimeDiff && aa_serverTimeDiff != 0) {
				date = new Date(date.getTime() + aa_serverTimeDiff);
			}
			
			var timeZone = aa_text(data,profile,'TimeZone',context); 
			if (timeZone.indexOf('GMT') != -1)
			{
				try
				{
					var offset = parseInt(timeZone.substring(3)); // + date.getTimezoneOffset();
					date = new Date(date.getTime() +  offset * 60000);
				}
				catch(e) {}
			}
			if (format == "std")
			{
				var str = "" + ajaxart.pad2digits(date.getDate()) + '/' + ajaxart.pad2digits(date.getMonth()+1) + '/' + date.getFullYear();
				// str += " " + ajaxart.pad2digits(date.getHours()) + ":" + ajaxart.pad2digits(date.getMinutes());
				return [ str ];
			}
			if (format == "with time")
			{
				var str = "" + ajaxart.pad2digits(date.getDate()) + '/' + ajaxart.pad2digits(date.getMonth()+1) + '/' + date.getFullYear();
				str += " " + ajaxart.pad2digits(date.getHours()) + ":" + ajaxart.pad2digits(date.getMinutes());
				return [ str ];
			}
			if (format == "with time and seconds")
			{
				var str = "" + ajaxart.pad2digits(date.getDate()) + '/' + ajaxart.pad2digits(date.getMonth()+1) + '/' + date.getFullYear();
				str += " " + ajaxart.pad2digits(date.getHours()) + ":" + ajaxart.pad2digits(date.getMinutes()) + ":" + ajaxart.pad2digits(date.getSeconds());
				return [ str ];
			}
				         
			return ["" + date.getTime()];
		},
		GreaterThan: function (profile,data,context)
		{
			var date1 = aa_text(data,profile,'Date',context);
			var date2 = aa_text(data,profile,'GreaterThan',context);
			
			return aa_frombool(aadate_date2int(date1) > aadate_date2int(date2)); 
		},
		ExtractDatePart: function (profile,data,context)
		{
			var date_str = aa_text(data,profile,'Date',context);
			if (date_str.indexOf('/') != -1)
				var date_int = aadate_date2int(date_str);
			else
				var date_int = parseInt(date_str);
			var result = aa_extractDatePart(new Date(date_int),aa_text(data,profile,'Part',context));
			var format = aa_text(data,profile,'OutputFormat',context);
			if (format)
				return [aa_format_date(format,result)];
			else
				return [''+result];
		},
		TimeField: function (profile,data,context)
		{
			var field = context.vars._Field[0];
			field.ManualWriteValue = true;
			aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
				var input = aa_find_field_input(cell);
				if (input.length > 0)
				{
					input[0].value = ajaxart.totext_array(field_data).split(' ')[1] || '';
					input[0].setAttribute('value',input[0].value);
				}
				jQuery(input).timeEntry({show24Hours: true });
			});

			aa_field_handler(field,'OnKeyup',function(field,field_data,input,e) {
				var dataAndTime = ajaxart.totext_array(field_data).split(' ');
				if (dataAndTime.length < 2) dataAndTime.push('');
				dataAndTime[1] = '' + input.value;
				ajaxart.writevalue(field_data,dataAndTime[0] + ' ' + dataAndTime[1]);
				aa_invoke_field_handlers(field.OnUpdate,input,e,field,field_data);
			},'TimeField');
			
			return ["true"];
		}
});
aa_serverTimeDiff = 0;

ajaxart.pad2digits = function(num)
{
  if (num < 10) return "0" + num;
  return "" + num;
}

ajaxart.date = {};
function str2Int(str)
{
	if (str == null) return 0;
	str = str.replace(/^0*/,'');
	var result = parseInt(str);
	if (isNaN(result))
		return 0;
	return result;
}
function aadate_currentYear()
{
		var d = new Date();
		var year = d.getYear();
		if (year < 1000)
			year += 1900;
		return year;
}
function aadate_currentMonth()
{
		return (new Date().getMonth())+1;
}

function aadate_date2int(date,endOfPeriod)
{
	if (date == null || date == '' || date == 'any') return endOfPeriod ? 10000000000 : 0;
	var result = new Date();
	result.setMinutes(0,0,0);
	if (date == 'today')
		resolution = 'day';

	var datePlusTime = date.split(" ");
	var date_part = datePlusTime[0];
	var parts = date_part.split("/");
	var resolution = '';
	if (parts.length == 1 && str2Int(parts[0]) < 32 && str2Int(parts[0]) > 0) // day only
	{
		result.setDate(str2Int(parts[0]));
		resolution = 'day';
	}
	else if (parts.length == 1 && str2Int(parts[0]) > 32) // year only
	{
		result.setFullYear(str2Int(parts[0]),endOfPeriod ? 11 : 0, endOfPeriod ? 31 : 1);
		resolution = 'year';
	}
	else if (parts.length == 2 && str2Int(parts[1]) < 13) // day and month
	{
		result.setFullYear(aadate_currentYear(),str2Int(parts[1]) -1, str2Int(parts[0]));
		resolution = 'day';
	}
	else if (parts.length == 2 && str2Int(parts[1]) > 1900) // month and year
	{
		result.setFullYear(str2Int(parts[1]),str2Int(parts[0]) -1, 1);
		if (endOfPeriod)
			result.setTime( result.setFullYear(str2Int(parts[1]),str2Int(parts[0]), 1)-1);
		resolution = 'month';
	}
	else if (parts.length == 3) // day month year
	{
		result.setFullYear(str2Int(parts[2]),str2Int(parts[1]) -1, str2Int(parts[0]));
		resolution = 'day';
	}
	result.setHours(0,0,0,0);
	if (datePlusTime.length > 1)
	{
		var times = datePlusTime[1].split(":");
		if (datePlusTime.length > 2 && datePlusTime[2] == 'PM')
			times[0] = '' + (str2Int(times[0]) + 12);
		result.setHours(str2Int(times[0]),str2Int(times[1]),str2Int(times[2]),0);
		resolution = 'minute';
	}
	var result = result.getTime();
	if (endOfPeriod && resolution == 'day')
		result += 86400000 -1;
	return result;
}
function aa_extractDatePart(date,part)
{
	var year = date.getYear();
	if (year < 1000) year += 1900;
	
	if (part == 'day')
		var result = new Date(year,date.getMonth(),date.getDate(),0,0,0,0);
	if (part == 'week')
		var result = new Date(new Date(year,date.getMonth(),date.getDate(),0,0,0,0).getTime()-86400000*date.getDay());
	if (part == 'month')
		var result = new Date(year,date.getMonth(),1,0,0,0,0);
	if (part == 'year')
		var result = new Date(year,0,1,0,0,0,0);
	return result;
}
function aa_format_date(format,date) 
{ 
	return jQuery.datepicker.formatDate(format,date);
}
function aadate_stdDate2DateObj(date)
{
	var datePlusTime = date.split(" ");
	var date_part = datePlusTime[0];
	var parts = date_part.split("/");
	if (parts.length > 2 && parts[2].length == "2") parts[2] = "20" + parts[2];   // handle 1/1/05 -> 1/1/2005  
	if (datePlusTime.length == 0) return null;
	if (datePlusTime.length == 1)
		var d = new Date(str2Int(parts[2]), str2Int(parts[1],10)-1, str2Int(parts[0],10),0,0,0,0);
	else {
		var times = datePlusTime[1].split(":");
		if (times.length == 3) 
			var d = new Date(str2Int(parts[2]), str2Int(parts[1],10)-1, str2Int(parts[0],10), str2Int(times[0],10), str2Int(times[1],10),str2Int(times[2],10));
		else 
			var d = new Date(str2Int(parts[2]), str2Int(parts[1],10)-1, str2Int(parts[0],10), str2Int(times[0],10), str2Int(times[1],10));
	}
	
	return d;
}
function aadate_dateObj2StdDate(date)
{
	var year = date.getYear();
	if (year < 1000)
		year += 1900;
	var out = date.getDate()+"/"+ (date.getMonth()+1) +"/" + year;
	if (date.getHours() > 0 || date.getMinutes() > 0)
	  out += " " + ajaxart.pad2digits(date.getHours()) + ":" + ajaxart.pad2digits(date.getMinutes());
	return out;
}

function aadate_addToDate(date,amount_to_add,interval)
{
   var multipleBy = 86400000;  // day is default
   if (interval == 'hour') multipleBy = 3600000;
   if (interval == 'minute') multipleBy = 60000;
   if (interval == 'second') multipleBy = 1000;
	
	var d = aadate_stdDate2DateObj(date);
	d.setTime(d.getTime() + (amount_to_add * multipleBy));
	return aadate_dateObj2StdDate(d);
}


/* http://keith-wood.name/timeEntry.html
   Time entry for jQuery v1.4.8.
   Written by Keith Wood (kbwood{at}iinet.com.au) June 2007.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */
 
/* Turn an input field into an entry point for a time value.
   The time can be entered via directly typing the value,
   via the arrow keys, or via spinner buttons.
   It is configurable to show 12 or 24-hour time, to show or hide seconds,
   to enforce a minimum and/or maximum time, to change the spinner image,
   and to constrain the time to steps, e.g. only on the quarter hours.
   Attach it with $('input selector').timeEntry(); for default settings,
   or configure it with options like:
   $('input selector').timeEntry(
      {spinnerImage: 'spinnerSquare.png', spinnerSize: [20, 20, 0]}); */
 
(function($) { // Hide scope, no $ conflict
 
/* TimeEntry manager.
   Use the singleton instance of this class, $.timeEntry, to interact with the time entry
   functionality. Settings for (groups of) fields are maintained in an instance object
   (TimeEntryInstance), allowing multiple different settings on the same page. */
function TimeEntry() {
	this._disabledInputs = []; // List of time entry inputs that have been disabled
	this.regional = []; // Available regional settings, indexed by language code
	this.regional[''] = { // Default regional settings
		show24Hours: false, // True to use 24 hour time, false for 12 hour (AM/PM)
		separator: ':', // The separator between time fields
		ampmPrefix: '', // The separator before the AM/PM text
		ampmNames: ['AM', 'PM'], // Names of morning/evening markers
		spinnerTexts: ['Now', 'Previous field', 'Next field', 'Increment', 'Decrement']
		// The popup texts for the spinner image areas
	};
	this._defaults = {
		appendText: '', // Display text following the input box, e.g. showing the format
		showSeconds: false, // True to show seconds as well, false for hours/minutes only
		timeSteps: [1, 1, 1], // Steps for each of hours/minutes/seconds when incrementing/decrementing
		initialField: 0, // The field to highlight initially, 0 = hours, 1 = minutes, ...
		useMouseWheel: true, // True to use mouse wheel for increment/decrement if possible,
			// false to never use it
		defaultTime: null, // The time to use if none has been set, leave at null for now
		minTime: null, // The earliest selectable time, or null for no limit
		maxTime: null, // The latest selectable time, or null for no limit
		spinnerImage: '',  // not need - images/big/spinnerDefault.png', // The URL of the images to use for the time spinner
			// Seven images packed horizontally for normal, each button pressed, and disabled
		spinnerSize: [20, 20, 8], // The width and height of the spinner image,
			// and size of centre button for current time
		spinnerBigImage: '', // The URL of the images to use for the expanded time spinner
			// Seven images packed horizontally for normal, each button pressed, and disabled
		spinnerBigSize: [40, 40, 16], // The width and height of the expanded spinner image,
			// and size of centre button for current time
		spinnerIncDecOnly: false, // True for increment/decrement buttons only, false for all
		spinnerRepeat: [500, 250], // Initial and subsequent waits in milliseconds
			// for repeats on the spinner buttons
		beforeShow: null, // Function that takes an input field and
			// returns a set of custom settings for the time entry
		beforeSetTime: null // Function that runs before updating the time,
			// takes the old and new times, and minimum and maximum times as parameters,
			// and returns an adjusted time if necessary
	};
	$.extend(this._defaults, this.regional['']);
}
 
var PROP_NAME = 'timeEntry';
 
$.extend(TimeEntry.prototype, {
	/* Class name added to elements to indicate already configured with time entry. */
	markerClassName: 'hasTimeEntry',
 
	/* Override the default settings for all instances of the time entry.
	   @param  options  (object) the new settings to use as defaults (anonymous object)
	   @return  (DateEntry) this object */
	setDefaults: function(options) {
		extendRemove(this._defaults, options || {});
		return this;
	},
 
	/* Attach the time entry handler to an input field.
	   @param  target   (element) the field to attach to
	   @param  options  (object) custom settings for this instance */
	_connectTimeEntry: function(target, options) {
		var input = $(target);
		if (input.hasClass(this.markerClassName)) {
			return;
		}
		var inst = {};
		inst.options = $.extend({}, options);
		inst._selectedHour = 0; // The currently selected hour
		inst._selectedMinute = 0; // The currently selected minute
		inst._selectedSecond = 0; // The currently selected second
		inst._field = 0; // The selected subfield
		inst.input = $(target); // The attached input field
		$.data(target, PROP_NAME, inst);
		var spinnerImage = this._get(inst, 'spinnerImage');
		var spinnerText = this._get(inst, 'spinnerText');
		var spinnerSize = this._get(inst, 'spinnerSize');
		var appendText = this._get(inst, 'appendText');
		var spinner = (!spinnerImage ? null : 
			$('<span class="timeEntry_control" style="display: inline-block; ' +
			'background: url(\'' + spinnerImage + '\') 0 0 no-repeat; ' +
			'width: ' + spinnerSize[0] + 'px; height: ' + spinnerSize[1] + 'px;' +
			($.browser.mozilla && $.browser.version < '1.9' ? // FF 2- (Win)
			' padding-left: ' + spinnerSize[0] + 'px; padding-bottom: ' +
			(spinnerSize[1] - 18) + 'px;' : '') + '"></span>'));
		input.wrap('<span class="timeEntry_wrap"></span>').
			after(appendText ? '<span class="timeEntry_append">' + appendText + '</span>' : '').
			after(spinner || '');
		input.addClass(this.markerClassName).bind('focus.timeEntry', this._doFocus).
			bind('blur.timeEntry', this._doBlur).bind('click.timeEntry', this._doClick).
			bind('keydown.timeEntry', this._doKeyDown).bind('keypress.timeEntry', this._doKeyPress);
		// Check pastes
		if ($.browser.mozilla) {
			input.bind('input.timeEntry', function(event) { $.timeEntry._parseTime(inst); });
		}
		if ($.browser.msie) {
			input.bind('paste.timeEntry', 
				function(event) { setTimeout(function() { $.timeEntry._parseTime(inst); }, 1); });
		}
		// Allow mouse wheel usage
		if (this._get(inst, 'useMouseWheel') && $.fn.mousewheel) {
			input.mousewheel(this._doMouseWheel);
		}
		if (spinner) {
			spinner.mousedown(this._handleSpinner).mouseup(this._endSpinner).
				mouseover(this._expandSpinner).mouseout(this._endSpinner).
				mousemove(this._describeSpinner);
		}
	},
 
	/* Enable a time entry input and any associated spinner.
	   @param  input  (element) single input field */
	_enableTimeEntry: function(input) {
		this._enableDisable(input, false);
	},
 
	/* Disable a time entry input and any associated spinner.
	   @param  input  (element) single input field */
	_disableTimeEntry: function(input) {
		this._enableDisable(input, true);
	},
 
	/* Enable or disable a time entry input and any associated spinner.
	   @param  input    (element) single input field
	   @param  disable  (boolean) true to disable, false to enable */
	_enableDisable: function(input, disable) {
		var inst = $.data(input, PROP_NAME);
		if (!inst) {
			return;
		}
		input.disabled = disable;
		if (input.nextSibling && input.nextSibling.nodeName.toLowerCase() == 'span') {
			$.timeEntry._changeSpinner(inst, input.nextSibling, (disable ? 5 : -1));
		}
		$.timeEntry._disabledInputs = $.map($.timeEntry._disabledInputs,
			function(value) { return (value == input ? null : value); }); // Delete entry
		if (disable) {
			$.timeEntry._disabledInputs.push(input);
		}
	},
 
	/* Check whether an input field has been disabled.
	   @param  input  (element) input field to check
	   @return  (boolean) true if this field has been disabled, false if it is enabled */
	_isDisabledTimeEntry: function(input) {
		return $.inArray(input, this._disabledInputs) > -1;
	},
 
	/* Reconfigure the settings for a time entry field.
	   @param  input    (element) input field to change
	   @param  options  (object) new settings to add or
	                    (string) an individual setting name
	   @param  value    (any) the individual setting's value */
	_changeTimeEntry: function(input, options, value) {
		var inst = $.data(input, PROP_NAME);
		if (inst) {
			if (typeof options == 'string') {
				var name = options;
				options = {};
				options[name] = value;
			}
			var currentTime = this._extractTime(inst);
			extendRemove(inst.options, options || {});
			if (currentTime) {
				this._setTime(inst, new Date(0, 0, 0,
					currentTime[0], currentTime[1], currentTime[2]));
			}
		}
		$.data(input, PROP_NAME, inst);
	},
 
	/* Remove the time entry functionality from an input.
	   @param  input  (element) input field to affect */
	_destroyTimeEntry: function(input) {
		$input = $(input);
		if (!$input.hasClass(this.markerClassName)) {
			return;
		}
		$input.removeClass(this.markerClassName).unbind('.timeEntry');
		if ($.fn.mousewheel) {
			$input.unmousewheel();
		}
		this._disabledInputs = $.map(this._disabledInputs,
			function(value) { return (value == input ? null : value); }); // Delete entry
		$input.parent().replaceWith($input);
		$.removeData(input, PROP_NAME);
	},
 
	/* Initialise the current time for a time entry input field.
	   @param  input  (element) input field to update
	   @param  time   (Date) the new time (year/month/day ignored) or null for now */
	_setTimeTimeEntry: function(input, time) {
		var inst = $.data(input, PROP_NAME);
		if (inst) {
			this._setTime(inst, time ? (typeof time == 'object' ?
				new Date(time.getTime()) : time) : null);
		}
	},
 
	/* Retrieve the current time for a time entry input field.
	   @param  input  (element) input field to examine
	   @return  (Date) current time (year/month/day zero) or null if none */
	_getTimeTimeEntry: function(input) {
		var inst = $.data(input, PROP_NAME);
		var currentTime = (inst ? this._extractTime(inst) : null);
		return (!currentTime ? null :
			new Date(0, 0, 0, currentTime[0], currentTime[1], currentTime[2]));
	},
 
	/* Retrieve the millisecond offset for the current time.
	   @param  input  (element) input field to examine
	   @return  (number) the time as milliseconds offset or zero if none */
	_getOffsetTimeEntry: function(input) {
		var inst = $.data(input, PROP_NAME);
		var currentTime = (inst ? this._extractTime(inst) : null);
		return (!currentTime ? 0 :
			(currentTime[0] * 3600 + currentTime[1] * 60 + currentTime[2]) * 1000);
	},
 
	/* Initialise time entry.
	   @param  target  (element) the input field or
	                   (event) the focus event */
	_doFocus: function(target) {
		var input = (target.nodeName && target.nodeName.toLowerCase() == 'input' ? target : this);
		if ($.timeEntry._lastInput == input || $.timeEntry._isDisabledTimeEntry(input)) {
			$.timeEntry._focussed = false;
			return;
		}
		var inst = $.data(input, PROP_NAME);
		$.timeEntry._focussed = true;
		$.timeEntry._lastInput = input;
		$.timeEntry._blurredInput = null;
		var beforeShow = $.timeEntry._get(inst, 'beforeShow');
		extendRemove(inst.options, (beforeShow ? beforeShow.apply(input, [input]) : {}));
		$.data(input, PROP_NAME, inst);
		$.timeEntry._parseTime(inst);
		setTimeout(function() { $.timeEntry._showField(inst); }, 10);
	},
 
	/* Note that the field has been exited.
	   @param  event  (event) the blur event */
	_doBlur: function(event) {
		$.timeEntry._blurredInput = $.timeEntry._lastInput;
		$.timeEntry._lastInput = null;
	},
 
	/* Select appropriate field portion on click, if already in the field.
	   @param  event  (event) the click event */
	_doClick: function(event) {
		var input = event.target;
		var inst = $.data(input, PROP_NAME);
		if (!$.timeEntry._focussed) {
			var fieldSize = $.timeEntry._get(inst, 'separator').length + 2;
			inst._field = 0;
			if (input.selectionStart != null) { // Use input select range
				for (var field = 0; field <= Math.max(1, inst._secondField, inst._ampmField); field++) {
					var end = (field != inst._ampmField ? (field * fieldSize) + 2 :
						(inst._ampmField * fieldSize) + $.timeEntry._get(inst, 'ampmPrefix').length +
						$.timeEntry._get(inst, 'ampmNames')[0].length);
					inst._field = field;
					if (input.selectionStart < end) {
						break;
					}
				}
			}
			else if (input.createTextRange) { // Check against bounding boxes
				var src = $(event.srcElement);
				var range = input.createTextRange();
				var convert = function(value) {
					return {thin: 2, medium: 4, thick: 6}[value] || value;
				};
				var offsetX = event.clientX + document.documentElement.scrollLeft -
					(src.offset().left + parseInt(convert(src.css('border-left-width')), 10)) -
					range.offsetLeft; // Position - left edge - alignment
				for (var field = 0; field <= Math.max(1, inst._secondField, inst._ampmField); field++) {
					var end = (field != inst._ampmField ? (field * fieldSize) + 2 :
						(inst._ampmField * fieldSize) + $.timeEntry._get(inst, 'ampmPrefix').length +
						$.timeEntry._get(inst, 'ampmNames')[0].length);
					range.collapse();
					range.moveEnd('character', end);
					inst._field = field;
					if (offsetX < range.boundingWidth) { // And compare
						break;
					}
				}
			}
		}
		$.data(input, PROP_NAME, inst);
		$.timeEntry._showField(inst);
		$.timeEntry._focussed = false;
	},
 
	/* Handle keystrokes in the field.
	   @param  event  (event) the keydown event
	   @return  (boolean) true to continue, false to stop processing */
	_doKeyDown: function(event) {
		if (event.keyCode >= 48) { // >= '0'
			return true;
		}
		var inst = $.data(event.target, PROP_NAME);
		switch (event.keyCode) {
			case 9: return (event.shiftKey ?
						// Move to previous time field, or out if at the beginning
						$.timeEntry._changeField(inst, -1, true) :
						// Move to next time field, or out if at the end
						$.timeEntry._changeField(inst, +1, true));
			case 35: if (event.ctrlKey) { // Clear time on ctrl+end
						$.timeEntry._setValue(inst, '');
					}
					else { // Last field on end
						inst._field = Math.max(1, inst._secondField, inst._ampmField);
						$.timeEntry._adjustField(inst, 0);
					}
					break;
			case 36: if (event.ctrlKey) { // Current time on ctrl+home
						$.timeEntry._setTime(inst);
					}
					else { // First field on home
						inst._field = 0;
						$.timeEntry._adjustField(inst, 0);
					}
					break;
			case 37: $.timeEntry._changeField(inst, -1, false); break; // Previous field on left
			case 38: $.timeEntry._adjustField(inst, +1); break; // Increment time field on up
			case 39: $.timeEntry._changeField(inst, +1, false); break; // Next field on right
			case 40: $.timeEntry._adjustField(inst, -1); break; // Decrement time field on down
			case 46: $.timeEntry._setValue(inst, ''); break; // Clear time on delete
		}
		return false;
	},
 
	/* Disallow unwanted characters.
	   @param  event  (event) the keypress event
	   @return  (boolean) true to continue, false to stop processing */
	_doKeyPress: function(event) {
		var chr = String.fromCharCode(event.charCode == undefined ? event.keyCode : event.charCode);
		if (chr < ' ') {
			return true;
		}
		var inst = $.data(event.target, PROP_NAME);
		$.timeEntry._handleKeyPress(inst, chr);
		return false;
	},
 
	/* Increment/decrement on mouse wheel activity.
	   @param  event  (event) the mouse wheel event
	   @param  delta  (number) the amount of change */
	_doMouseWheel: function(event, delta) {
		if ($.timeEntry._isDisabledTimeEntry(event.target)) {
			return;
		}
		delta = ($.browser.opera ? -delta / Math.abs(delta) :
			($.browser.safari ? delta / Math.abs(delta) : delta));
		var inst = $.data(event.target, PROP_NAME);
		inst.input.focus();
		if (!inst.input.val()) {
			$.timeEntry._parseTime(inst);
		}
		$.timeEntry._adjustField(inst, delta);
		event.preventDefault();
	},
 
	/* Expand the spinner, if possible, to make it easier to use.
	   @param  event  (event) the mouse over event */
	_expandSpinner: function(event) {
		var spinner = $.timeEntry._getSpinnerTarget(event);
		var inst = $.data($.timeEntry._getInput(spinner), PROP_NAME);
		var spinnerBigImage = $.timeEntry._get(inst, 'spinnerBigImage');
		if (spinnerBigImage) {
			inst._expanded = true;
			var offset = $(spinner).offset();
			var relative = null;
			$(spinner).parents().each(function() {
				var parent = $(this);
				if (parent.css('position') == 'relative' ||
						parent.css('position') == 'absolute') {
					relative = parent.offset();
				}
				return !relative;
			});
			var spinnerSize = $.timeEntry._get(inst, 'spinnerSize');
			var spinnerBigSize = $.timeEntry._get(inst, 'spinnerBigSize');
			$('<div class="timeEntry_expand" style="position: absolute; left: ' +
				(offset.left - (spinnerBigSize[0] - spinnerSize[0]) / 2 -
				(relative ? relative.left : 0)) + 'px; top: ' + (offset.top -
				(spinnerBigSize[1] - spinnerSize[1]) / 2 - (relative ? relative.top : 0)) +
				'px; width: ' + spinnerBigSize[0] + 'px; height: ' +
				spinnerBigSize[1] + 'px; background: transparent url(' +
				spinnerBigImage + ') no-repeat 0px 0px; z-index: 10;"></div>').
				mousedown($.timeEntry._handleSpinner).mouseup($.timeEntry._endSpinner).
				mouseout($.timeEntry._endExpand).mousemove($.timeEntry._describeSpinner).
				insertAfter(spinner);
		}
	},
 
	/* Locate the actual input field from the spinner.
	   @param  spinner  (element) the current spinner
	   @return  (element) the corresponding input */
	_getInput: function(spinner) {
		return $(spinner).siblings('.' + $.timeEntry.markerClassName)[0];
	},
 
	/* Change the title based on position within the spinner.
	   @param  event  (event) the mouse move event */
	_describeSpinner: function(event) {
		var spinner = $.timeEntry._getSpinnerTarget(event);
		var inst = $.data($.timeEntry._getInput(spinner), PROP_NAME);
		spinner.title = $.timeEntry._get(inst, 'spinnerTexts')
			[$.timeEntry._getSpinnerRegion(inst, event)];
	},
 
	/* Handle a click on the spinner.
	   @param  event  (event) the mouse click event */
	_handleSpinner: function(event) {
		var spinner = $.timeEntry._getSpinnerTarget(event);
		var input = $.timeEntry._getInput(spinner);
		if ($.timeEntry._isDisabledTimeEntry(input)) {
			return;
		}
		if (input == $.timeEntry._blurredInput) {
			$.timeEntry._lastInput = input;
			$.timeEntry._blurredInput = null;
		}
		var inst = $.data(input, PROP_NAME);
		$.timeEntry._doFocus(input);
		var region = $.timeEntry._getSpinnerRegion(inst, event);
		$.timeEntry._changeSpinner(inst, spinner, region);
		$.timeEntry._actionSpinner(inst, region);
		$.timeEntry._timer = null;
		$.timeEntry._handlingSpinner = true;
		var spinnerRepeat = $.timeEntry._get(inst, 'spinnerRepeat');
		if (region >= 3 && spinnerRepeat[0]) { // Repeat increment/decrement
			$.timeEntry._timer = setTimeout(
				function() { $.timeEntry._repeatSpinner(inst, region); },
				spinnerRepeat[0]);
			$(spinner).one('mouseout', $.timeEntry._releaseSpinner).
				one('mouseup', $.timeEntry._releaseSpinner);
		}
	},
 
	/* Action a click on the spinner.
	   @param  inst    (object) the instance settings
	   @param  region  (number) the spinner "button" */
	_actionSpinner: function(inst, region) {
		if (!inst.input.val()) {
			$.timeEntry._parseTime(inst);
		}
		switch (region) {
			case 0: this._setTime(inst); break;
			case 1: this._changeField(inst, -1, false); break;
			case 2: this._changeField(inst, +1, false); break;
			case 3: this._adjustField(inst, +1); break;
			case 4: this._adjustField(inst, -1); break;
		}
	},
 
	/* Repeat a click on the spinner.
	   @param  inst    (object) the instance settings
	   @param  region  (number) the spinner "button" */
	_repeatSpinner: function(inst, region) {
		if (!$.timeEntry._timer) {
			return;
		}
		$.timeEntry._lastInput = $.timeEntry._blurredInput;
		this._actionSpinner(inst, region);
		this._timer = setTimeout(
			function() { $.timeEntry._repeatSpinner(inst, region); },
			this._get(inst, 'spinnerRepeat')[1]);
	},
 
	/* Stop a spinner repeat.
	   @param  event  (event) the mouse event */
	_releaseSpinner: function(event) {
		clearTimeout($.timeEntry._timer);
		$.timeEntry._timer = null;
	},
 
	/* Tidy up after an expanded spinner.
	   @param  event  (event) the mouse event */
	_endExpand: function(event) {
		$.timeEntry._timer = null;
		var spinner = $.timeEntry._getSpinnerTarget(event);
		var input = $.timeEntry._getInput(spinner);
		var inst = $.data(input, PROP_NAME);
		$(spinner).remove();
		inst._expanded = false;
	},
 
	/* Tidy up after a spinner click.
	   @param  event  (event) the mouse event */
	_endSpinner: function(event) {
		$.timeEntry._timer = null;
		var spinner = $.timeEntry._getSpinnerTarget(event);
		var input = $.timeEntry._getInput(spinner);
		var inst = $.data(input, PROP_NAME);
		if (!$.timeEntry._isDisabledTimeEntry(input)) {
			$.timeEntry._changeSpinner(inst, spinner, -1);
		}
		if ($.timeEntry._handlingSpinner) {
			$.timeEntry._lastInput = $.timeEntry._blurredInput;
		}
		if ($.timeEntry._lastInput && $.timeEntry._handlingSpinner) {
			$.timeEntry._showField(inst);
		}
		$.timeEntry._handlingSpinner = false;
	},
 
	/* Retrieve the spinner from the event.
	   @param  event  (event) the mouse click event
	   @return  (element) the target field */
	_getSpinnerTarget: function(event) {
		return event.target || event.srcElement;
	},
 
	/* Determine which "button" within the spinner was clicked.
	   @param  inst   (object) the instance settings
	   @param  event  (event) the mouse event
	   @return  (number) the spinner "button" number */
	_getSpinnerRegion: function(inst, event) {
		var spinner = this._getSpinnerTarget(event);
		var pos = ($.browser.opera || $.browser.safari ?
			$.timeEntry._findPos(spinner) : $(spinner).offset());
		var scrolled = ($.browser.safari ? $.timeEntry._findScroll(spinner) :
			[document.documentElement.scrollLeft || document.body.scrollLeft,
			document.documentElement.scrollTop || document.body.scrollTop]);
		var spinnerIncDecOnly = this._get(inst, 'spinnerIncDecOnly');
		var left = (spinnerIncDecOnly ? 99 : event.clientX + scrolled[0] -
			pos.left - ($.browser.msie ? 2 : 0));
		var top = event.clientY + scrolled[1] - pos.top - ($.browser.msie ? 2 : 0);
		var spinnerSize = this._get(inst, (inst._expanded ? 'spinnerBigSize' : 'spinnerSize'));
		var right = (spinnerIncDecOnly ? 99 : spinnerSize[0] - 1 - left);
		var bottom = spinnerSize[1] - 1 - top;
		if (spinnerSize[2] > 0 && Math.abs(left - right) <= spinnerSize[2] &&
				Math.abs(top - bottom) <= spinnerSize[2]) {
			return 0; // Centre button
		}
		var min = Math.min(left, top, right, bottom);
		return (min == left ? 1 : (min == right ? 2 : (min == top ? 3 : 4))); // Nearest edge
	},
 
	/* Change the spinner image depending on button clicked.
	   @param  inst     (object) the instance settings
	   @param  spinner  (element) the spinner control
	   @param  region   (number) the spinner "button" */
	_changeSpinner: function(inst, spinner, region) {
		$(spinner).css('background-position', '-' + ((region + 1) *
			this._get(inst, (inst._expanded ? 'spinnerBigSize' : 'spinnerSize'))[0]) + 'px 0px');
	},
 
	/* Find an object's position on the screen.
	   @param  obj  (element) the control
	   @return  (object) position as .left and .top */
	_findPos: function(obj) {
		var curLeft = curTop = 0;
		if (obj.offsetParent) {
			curLeft = obj.offsetLeft;
			curTop = obj.offsetTop;
			while (obj = obj.offsetParent) {
				var origCurLeft = curLeft;
				curLeft += obj.offsetLeft;
				if (curLeft < 0) {
					curLeft = origCurLeft;
				}
				curTop += obj.offsetTop;
			}
		}
		return {left: curLeft, top: curTop};
	},
 
	/* Find an object's scroll offset on the screen.
	   @param  obj  (element) the control
	   @return  (number[]) offset as [left, top] */
	_findScroll: function(obj) {
		var isFixed = false;
		$(obj).parents().each(function() {
			isFixed |= $(this).css('position') == 'fixed';
		});
		if (isFixed) {
			return [0, 0];
		}
		var scrollLeft = obj.scrollLeft;
		var scrollTop = obj.scrollTop;
		while (obj = obj.parentNode) {
			scrollLeft += obj.scrollLeft || 0;
			scrollTop += obj.scrollTop || 0;
		}
		return [scrollLeft, scrollTop];
	},
 
	/* Get a setting value, defaulting if necessary.
	   @param  inst  (object) the instance settings
	   @param  name  (string) the setting name
	   @return  (any) the setting value */
	_get: function(inst, name) {
		return (inst.options[name] != null ?
			inst.options[name] : $.timeEntry._defaults[name]);
	},
 
	/* Extract the time value from the input field, or default to now.
	   @param  inst  (object) the instance settings */
	_parseTime: function(inst) {
		var currentTime = this._extractTime(inst);
		var showSeconds = this._get(inst, 'showSeconds');
		if (currentTime) {
			inst._selectedHour = currentTime[0];
			inst._selectedMinute = currentTime[1];
			inst._selectedSecond = currentTime[2];
		}
		else {
			var now = this._constrainTime(inst);
			inst._selectedHour = now[0];
			inst._selectedMinute = now[1];
			inst._selectedSecond = (showSeconds ? now[2] : 0);
		}
		inst._secondField = (showSeconds ? 2 : -1);
		inst._ampmField = (this._get(inst, 'show24Hours') ? -1 : (showSeconds ? 3 : 2));
		inst._lastChr = '';
		inst._field = Math.max(0, Math.min(
			Math.max(1, inst._secondField, inst._ampmField), this._get(inst, 'initialField')));
		if (inst.input.val() != '') {
			this._showTime(inst);
		}
	},
 
	/* Extract the time value from a string as an array of values, or default to null.
	   @param  inst   (object) the instance settings
	   @param  value  (string) the time value to parse
	   @return  (number[3]) the time components (hours, minutes, seconds)
	            or null if no value */
	_extractTime: function(inst, value) {
		value = value || inst.input.val();
		var separator = this._get(inst, 'separator');
		var currentTime = value.split(separator);
		if (separator == '' && value != '') {
			currentTime[0] = value.substring(0, 2);
			currentTime[1] = value.substring(2, 4);
			currentTime[2] = value.substring(4, 6);
		}
		var ampmNames = this._get(inst, 'ampmNames');
		var show24Hours = this._get(inst, 'show24Hours');
		if (currentTime.length >= 2) {
			var isAM = !show24Hours && (value.indexOf(ampmNames[0]) > -1);
			var isPM = !show24Hours && (value.indexOf(ampmNames[1]) > -1);
			var hour = parseInt(currentTime[0], 10);
			hour = (isNaN(hour) ? 0 : hour);
			hour = ((isAM || isPM) && hour == 12 ? 0 : hour) + (isPM ? 12 : 0);
			var minute = parseInt(currentTime[1], 10);
			minute = (isNaN(minute) ? 0 : minute);
			var second = (currentTime.length >= 3 ?
				parseInt(currentTime[2], 10) : 0);
			second = (isNaN(second) || !this._get(inst, 'showSeconds') ? 0 : second);
			return this._constrainTime(inst, [hour, minute, second]);
		} 
		return null;
	},
 
	/* Constrain the given/current time to the time steps.
	   @param  inst    (object) the instance settings
	   @param  fields  (number[3]) the current time components (hours, minutes, seconds)
	   @return  (number[3]) the constrained time components (hours, minutes, seconds) */
	_constrainTime: function(inst, fields) {
		var specified = (fields != null);
		if (!specified) {
			var now = this._determineTime(inst, this._get(inst, 'defaultTime')) || new Date();
			fields = [now.getHours(), now.getMinutes(), now.getSeconds()];
		}
		var reset = false;
		var timeSteps = this._get(inst, 'timeSteps');
		for (var i = 0; i < timeSteps.length; i++) {
			if (reset) {
				fields[i] = 0;
			}
			else if (timeSteps[i] > 1) {
				fields[i] = Math.round(fields[i] / timeSteps[i]) * timeSteps[i];
				reset = true;
			}
		}
		return fields;
	},
 
	/* Set the selected time into the input field.
	   @param  inst  (object) the instance settings */
	_showTime: function(inst) {
		var show24Hours = this._get(inst, 'show24Hours');
		var separator = this._get(inst, 'separator');
		var currentTime = (this._formatNumber(show24Hours ? inst._selectedHour :
			((inst._selectedHour + 11) % 12) + 1) + separator +
			this._formatNumber(inst._selectedMinute) +
			(this._get(inst, 'showSeconds') ? separator +
			this._formatNumber(inst._selectedSecond) : '') +
			(show24Hours ?  '' : this._get(inst, 'ampmPrefix') +
			this._get(inst, 'ampmNames')[(inst._selectedHour < 12 ? 0 : 1)]));
		this._setValue(inst, currentTime);
		this._showField(inst);
	},
 
	/* Highlight the current time field.
	   @param  inst  (object) the instance settings */
	_showField: function(inst) {
		var input = inst.input[0];
		if (inst.input.is(':hidden') || $.timeEntry._lastInput != input) {
			return;
		}
		var separator = this._get(inst, 'separator');
		var fieldSize = separator.length + 2;
		var start = (inst._field != inst._ampmField ? (inst._field * fieldSize) :
			(inst._ampmField * fieldSize) - separator.length + this._get(inst, 'ampmPrefix').length);
		var end = start + (inst._field != inst._ampmField ? 2 : this._get(inst, 'ampmNames')[0].length);
		if (input.setSelectionRange) { // Mozilla
			input.setSelectionRange(start, end);
		}
		else if (input.createTextRange) { // IE
			var range = input.createTextRange();
			range.moveStart('character', start);
			range.moveEnd('character', end - inst.input.val().length);
			range.select();
		}
		if (!input.disabled) {
			input.focus();
		}
	},
 
	/* Ensure displayed single number has a leading zero.
	   @param  value  (number) current value
	   @return  (string) number with at least two digits */
	_formatNumber: function(value) {
		return (value < 10 ? '0' : '') + value;
	},
 
	/* Update the input field and notify listeners.
	   @param  inst   (object) the instance settings
	   @param  value  (string) the new value */
	_setValue: function(inst, value) {
		if (value != inst.input.val()) {
			inst.input.val(value).trigger('change');
		}
	},
 
	/* Move to previous/next field, or out of field altogether if appropriate.
	   @param  inst     (object) the instance settings
	   @param  offset   (number) the direction of change (-1, +1)
	   @param  moveOut  (boolean) true if can move out of the field
	   @return  (boolean) true if exitting the field, false if not */
	_changeField: function(inst, offset, moveOut) {
		var atFirstLast = (inst.input.val() == '' || inst._field ==
			(offset == -1 ? 0 : Math.max(1, inst._secondField, inst._ampmField)));
		if (!atFirstLast) {
			inst._field += offset;
		}
		this._showField(inst);
		inst._lastChr = '';
		$.data(inst.input[0], PROP_NAME, inst);
		return (atFirstLast && moveOut);
	},
 
	/* Update the current field in the direction indicated.
	   @param  inst    (object) the instance settings
	   @param  offset  (number) the amount to change by */
	_adjustField: function(inst, offset) {
		if (inst.input.val() == '') {
			offset = 0;
		}
		var timeSteps = this._get(inst, 'timeSteps');
		this._setTime(inst, new Date(0, 0, 0,
			inst._selectedHour + (inst._field == 0 ? offset * timeSteps[0] : 0) +
			(inst._field == inst._ampmField ? offset * 12 : 0),
			inst._selectedMinute + (inst._field == 1 ? offset * timeSteps[1] : 0),
			inst._selectedSecond + (inst._field == inst._secondField ? offset * timeSteps[2] : 0)));
	},
 
	/* Check against minimum/maximum and display time.
	   @param  inst  (object) the instance settings
	   @param  time  (Date) an actual time or
	                 (number) offset in seconds from now or
					 (string) units and periods of offsets from now */
	_setTime: function(inst, time) {
		time = this._determineTime(inst, time);
		var fields = this._constrainTime(inst, time ?
			[time.getHours(), time.getMinutes(), time.getSeconds()] : null);
		time = new Date(0, 0, 0, fields[0], fields[1], fields[2]);
		// Normalise to base date
		var time = this._normaliseTime(time);
		var minTime = this._normaliseTime(this._determineTime(inst, this._get(inst, 'minTime')));
		var maxTime = this._normaliseTime(this._determineTime(inst, this._get(inst, 'maxTime')));
		// Ensure it is within the bounds set
		time = (minTime && time < minTime ? minTime :
			(maxTime && time > maxTime ? maxTime : time));
		var beforeSetTime = this._get(inst, 'beforeSetTime');
		// Perform further restrictions if required
		if (beforeSetTime) {
			time = beforeSetTime.apply(inst.input[0],
				[this._getTimeTimeEntry(inst.input[0]), time, minTime, maxTime]);
		}
		inst._selectedHour = time.getHours();
		inst._selectedMinute = time.getMinutes();
		inst._selectedSecond = time.getSeconds();
		this._showTime(inst);
		$.data(inst.input[0], PROP_NAME, inst);
	},
 
	/* Normalise time object to a common date.
	   @param  time  (Date) the original time
	   @return  (Date) the normalised time */
	_normaliseTime: function(time) {
		if (!time) {
			return null;
		}
		time.setFullYear(1900);
		time.setMonth(0);
		time.setDate(0);
		return time;
	},
 
	/* A time may be specified as an exact value or a relative one.
	   @param  inst     (object) the instance settings
	   @param  setting  (Date) an actual time or
	                    (number) offset in seconds from now or
	                    (string) units and periods of offsets from now
	   @return  (Date) the calculated time */
	_determineTime: function(inst, setting) {
		var offsetNumeric = function(offset) { // E.g. +300, -2
			var time = new Date();
			time.setTime(time.getTime() + offset * 1000);
			return time;
		};
		var offsetString = function(offset) { // E.g. '+2m', '-4h', '+3h +30m' or '12:34:56PM'
			var fields = $.timeEntry._extractTime(inst, offset); // Actual time?
			var time = new Date();
			var hour = (fields ? fields[0] : time.getHours());
			var minute = (fields ? fields[1] : time.getMinutes());
			var second = (fields ? fields[2] : time.getSeconds());
			if (!fields) {
				var pattern = /([+-]?[0-9]+)\s*(s|S|m|M|h|H)?/g;
				var matches = pattern.exec(offset);
				while (matches) {
					switch (matches[2] || 's') {
						case 's' : case 'S' :
							second += parseInt(matches[1], 10); break;
						case 'm' : case 'M' :
							minute += parseInt(matches[1], 10); break;
						case 'h' : case 'H' :
							hour += parseInt(matches[1], 10); break;
					}
					matches = pattern.exec(offset);
				}
			}
			time = new Date(0, 0, 10, hour, minute, second, 0);
			if (/^!/.test(offset)) { // No wrapping
				if (time.getDate() > 10) {
					time = new Date(0, 0, 10, 23, 59, 59);
				}
				else if (time.getDate() < 10) {
					time = new Date(0, 0, 10, 0, 0, 0);
				}
			}
			return time;
		};
		return (setting ? (typeof setting == 'string' ? offsetString(setting) :
			(typeof setting == 'number' ? offsetNumeric(setting) : setting)) : null);
	},
 
	/* Update time based on keystroke entered.
	   @param  inst  (object) the instance settings
	   @param  chr   (ch) the new character */
	_handleKeyPress: function(inst, chr) {
		if (chr == this._get(inst, 'separator')) {
			this._changeField(inst, +1, false);
		}
		else if (chr >= '0' && chr <= '9') { // Allow direct entry of time
			var key = parseInt(chr, 10);
			var value = parseInt(inst._lastChr + chr, 10);
			var show24Hours = this._get(inst, 'show24Hours');
			var hour = (inst._field != 0 ? inst._selectedHour :
				(show24Hours ? (value < 24 ? value : key) :
				(value >= 1 && value <= 12 ? value :
				(key > 0 ? key : inst._selectedHour)) % 12 +
				(inst._selectedHour >= 12 ? 12 : 0)));
			var minute = (inst._field != 1 ? inst._selectedMinute :
				(value < 60 ? value : key));
			var second = (inst._field != inst._secondField ? inst._selectedSecond :
				(value < 60 ? value : key));
			var fields = this._constrainTime(inst, [hour, minute, second]);
			this._setTime(inst, new Date(0, 0, 0, fields[0], fields[1], fields[2]));
			inst._lastChr = chr;
		}
		else if (!this._get(inst, 'show24Hours')) { // Set am/pm based on first char of names
			chr = chr.toLowerCase();
			var ampmNames = this._get(inst, 'ampmNames');
			if ((chr == ampmNames[0].substring(0, 1).toLowerCase() &&
					inst._selectedHour >= 12) ||
					(chr == ampmNames[1].substring(0, 1).toLowerCase() &&
					inst._selectedHour < 12)) {
				var saveField = inst._field;
				inst._field = inst._ampmField;
				this._adjustField(inst, +1);
				inst._field = saveField;
				this._showField(inst);
			}
		}
	}
});
 
/* jQuery extend now ignores nulls!
   @param  target  (object) the object to update
   @param  props   (object) the new settings 
   @return  (object) the updated object */
function extendRemove(target, props) {
	$.extend(target, props);
	for (var name in props) {
		if (props[name] == null) {
			target[name] = null;
		}
	}
	return target;
}
 
// Commands that don't return a jQuery object
var getters = ['getOffset', 'getTime', 'isDisabled'];
 
/* Attach the time entry functionality to a jQuery selection.
   @param  command  (string) the command to run (optional, default 'attach')
   @param  options  (object) the new settings to use for these countdown instances (optional)
   @return  (jQuery) for chaining further calls */
$.fn.timeEntry = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if (typeof options == 'string' && $.inArray(options, getters) > -1) {
		return $.timeEntry['_' + options + 'TimeEntry'].apply($.timeEntry, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		var nodeName = this.nodeName.toLowerCase();
		if (nodeName == 'input') {
			if (typeof options == 'string') {
				$.timeEntry['_' + options + 'TimeEntry'].apply($.timeEntry, [this].concat(otherArgs));
			}
			else {
				// Check for settings on the control itself
				var inlineSettings = ($.fn.metadata ? $(this).metadata() : {});
				$.timeEntry._connectTimeEntry(this, $.extend(inlineSettings, options));
			}
		} 
	});
};
 
/* Initialise the time entry functionality. */
$.timeEntry = new TimeEntry(); // Singleton instance
 
})(jQuery);






ajaxart_debugui_capture_onselect = null;
ajaxart_debugui_captured_element = jQuery([]);
ajaxart_debugui_capture_box = null;

//AA BeginModule
ajaxart.gcs.debugui = 
{
	SetComponent:function (profile,data,context)
	{
		var component = aa_first(data,profile,'ComponentXml',context);
		var id = aa_text(data,profile,'ComponentId',context).split("\.");
		ajaxart.components[id[0]][id[1]] = component;
		ajaxart.componentsXtmlCache[id[0]+"."+id[1]] = null;
		return [];
	},
	Traces:function (profile,data,context)
	{
		var counter = 1;
		for(var i=0;i<ajaxart.traces.length;i++) 
			ajaxart.traces[i].counter = ''+(counter++);
		return ajaxart.traces;
	},
	DumpObject: function (profile,data,context)
	{
		if (data.length == 0) return [];
		return [ ajaxart.text4trace(data[0]) ];
	},
	ClearTraces: function (profile,data,context)
	{
		ajaxart.traces = [];
	},
	ClearLogs: function (profile,data,context)
	{
		ajaxart.logs = {};
		jQuery("#aa_immediate_log").remove();
		jQuery(".fld_toolbar_errors_sign").addClass("hidden");
	},
	MemoryLeaksData: function (profile,data,context)
	{
		if (!jBart.vars.memoryLeaksData) jBart.vars.memoryLeaksData = ajaxart.parsexml('<xml/>');
		return [jBart.vars.memoryLeaksData];
	},
	RunMemoryLeaksCounter: function (profile,data,context)
	{
    	var objFunc = aa_get_func( aa_text(data,profile,'TopJsObject',context) );
		var object = objFunc();
		if (!object) return;
		var depth = aa_int(data,profile,'Depth',context);
		var output = aa_text(data,profile,'Output',context);
	
		ajaxart.logs = {};
		var results = [];
		function scan(obj,innerDepth,path,alsoLog)
		{
			if (obj == window || obj == window.frames || obj == window.top || obj == window.jQuery || obj == window.tinyMCE || obj == window.tinymce) 
				if (path != '')
				  return 0;
			
			if (innerDepth == 0 || !obj || typeof(obj) != 'object' || obj.nodeType ) return 0;
			var count = 0;
			try {
				for(var i in obj) {
					if (i == 'parent' || i == 'event' || i == 'self') continue;
					count++;
					var part = (i.length > 40) ? i.substring(0,40) + '...' : i;
					part = part.replace(/[\n\r\t ,]/g,'');
					var newpath = (path == '') ? part : path + '.' + part;
					var innerCount = scan(obj[i],innerDepth-1,newpath,alsoLog); 
		 		    count += innerCount;
		 		    if (alsoLog && innerCount > 0)
		 		      results.push(newpath + ',' + innerCount);
				}
			} catch(e) {}
			
			return count;
		}
		var prevCount = jBart.vars.memoryLeaksData.getAttribute('PreviousCount') || '';
		var prevDomSize = jBart.vars.memoryLeaksData.getAttribute('PreviousDomSize') || '';
		var totalCount = scan(object,depth,'',(output == 'detailed'));

		var domSize = '' + document.body.innerHTML.length;

		jBart.vars.memoryLeaksData.setAttribute('PreviousCount',''+totalCount);			
		jBart.vars.memoryLeaksData.setAttribute('PreviousDomSize',''+domSize);			
		if (output == 'detailed') {
			var ctx2 = aa_ctx(context,{TotalCount: [''+totalCount] , Results: results, PrevCount: [prevCount], DomSize: [domSize], PrevDomSize: [prevDomSize] });
			ajaxart.runNativeHelper(data,profile,'ShowResults',ctx2);
		}
		else {
			var str = (prevCount == '') ? '' : 'Last Object Count  = ' + prevCount + '\n\r';
			str += 'Total Object Count = ' + totalCount; 
			alert(str);
		}
	},
    CaptureSelect: function (profile,data,context)
    {
	  ajaxart_debugui_captured_element = jQuery([]);
	  
	  if (window.captureEvents){ // FF
		window.onclick = ajaxart_debugui_capture_click;
		window.onmousemove = ajaxart_debugui_capture_mousemove;
		window.onkeydown = ajaxart_debugui_capture_keydown;
	  }
	  else  // IE
	  {
		document.onclick=ajaxart_debugui_capture_click;
		document.onmousemove=ajaxart_debugui_capture_mousemove;
		document.onkeydown=ajaxart_debugui_capture_keydown;
	  }
	
	  ajaxart_debugui_capture_onselect = function(element)
	  {
  	    ajaxart.run([element],profile,'OnSelect',context);
	  }
	  return [];
  }
}
//AA EndModule
function ajaxart_debugui_capture_mousemove(e)
{
    var el=(typeof event!=='undefined')? event.srcElement : e.target;    
    if (el.id == 'capturebox')
    	el = ajaxart_find_control_at_position(jQuery("body"), e)[0];
	// find el with context
    var stop = false;
    while (el != null && !stop)
    {
    	if ('ajaxart' in el && el.ajaxart.script != null)
    			stop=true;
    	
    	if (!stop)
    	  el = el.parentNode;
    }
	
    if (el==null) return;
//	if ( el==null || ajaxart_debugui_captured_element.length > 0 && ajaxart_debugui_captured_element[0] == el) return;
	ajaxart_debugui_captured_element = jQuery(el);
	
	if (ajaxart_debugui_capture_box == null)
	{
		ajaxart_debugui_capture_box = jQuery('<div class="capturebox" ><div class="top"> <div class="captureboxtext"></div> </div><div class="right"/><div class="bottom"/><div class="left"/></div>');
		ajaxart_debugui_capture_box.appendTo("body");
	}
	if (ajaxart.isxml(el.ajaxart.script))
		jQuery(ajaxart_debugui_capture_box).find(".captureboxtext").html(el.ajaxart.script.getAttribute("t").split('.')[1]);
	
	var elem_pos = { x: aa_absLeft(el), y: aa_absTop(el)};
	var width = jQuery(el).outerWidth();
	var height = jQuery(el).outerHeight();
	jQuery(ajaxart_debugui_capture_box).find(".top").css("left",elem_pos.x-2).css("top",elem_pos.y-2).width(width+4);
	jQuery(ajaxart_debugui_capture_box).find(".bottom").css("left",elem_pos.x-2).css("top",elem_pos.y-2 + height).width(width+4);
	jQuery(ajaxart_debugui_capture_box).find(".left").css("left",elem_pos.x-2).css("top",elem_pos.y-2).height(height+2);
	jQuery(ajaxart_debugui_capture_box).find(".right").css("left",elem_pos.x-2 + width).css("top",elem_pos.y-2).height(height+2);
	ajaxart_debugui_capture_box.height(jQuery(el).outerHeight());
	ajaxart_debugui_capture_box.width(jQuery(el).outerWidth());

	ajaxart_debugui_capture_box.show();
}
function ajaxart_debugui_capture_keydown(e)
{
	if (e.keyCode == 27) {
		ajaxart_debugui_stop_capture();
		ajaxart_debugui_captured_element = jQuery([]);
	    ajaxart_debugui_capture_onselect(null);
	}
}
function ajaxart_debugui_capture_click(e)
{
	if (ajaxart_debugui_captured_element.length == 0) return;
	ajaxart_debugui_stop_capture();
	var param = ajaxart_debugui_captured_element[0];
	ajaxart_debugui_captured_element = jQuery([]);
	if (ajaxart_debugui_capture_box != null)
		ajaxart_debugui_capture_box.hide();
    ajaxart_debugui_capture_onselect(param);
}
function ajaxart_debugui_stop_capture()
{
	if (window.captureEvents){ // FF
		  window.captureEvents(Event.Click);
		  window.onclick=null;
		  window.onmousemove=null;
		  window.onkeydown=null;
	    }
		else  // IE
		{
		  document.onclick=null;
		  document.onmousemove=null;
		  document.onkeydown=null;
		}
}

function ajaxart_debugui_find_control_at_position(parent, e)
{
	var children = parent.children();

	// if position is in one of the children. Go to the child, otherwise it is the parent
	for(var i=0;i<children.length;i++){
		var cur = children[i];
		if (cur.id == "capturebox") continue;
		var pos = { x: aa_absLeft(cur), y: aa_absTop(cur)};

		if (pos.x <= e.pageX && pos.x + cur.offsetWidth >= e.pageX
			&& pos.y <= e.pageY && pos.y + cur.offsetHeight >= e.pageY)
				return ajaxart_debugui_find_control_at_position(jQuery(cur), e);
	};
	return parent;
}
function _xml(xml)	// for debugger
{
	return ajaxart.xml.prettyPrint(xml,"",false).split("\r");
}




//AA BeginModule
aa_gcs("dialog", {
  ContentsOfOpenPopup: function (profile,data,context)
  {
	  return aa_contentsOfOpenPopup();
  },
  TopDialogContent: function (profile,data,context)
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
  CloseDialog: function (profile,data,context)
  {
	  // close old dialogs
	  var closeType = aa_text(data,profile,'CloseType',context);
	  var ignoreAAEditor = aa_bool(data,profile,'IgnoreAAEditor',context);
	  
	  aa_close_dialog_old(closeType,ignoreAAEditor);
  },
  NativeConfirm: function (profile,data,context)
  {
	  var question = aa_text(data,profile,'Question',context);
	  var result = confirm(question);
	  
	  if (result == true)
		  return aa_bool(data,profile,'RunOnOK',context);
	  
	  return ["true"];
  },
  ElementPopupOpensOn:  function (profile,data,context)
  {
	  var popup = ajaxart.dialog.openPopups[ajaxart.dialog.openPopups.length-1]; //ajaxart.dialog.currentPopup(context);
	  if (popup != null)
		  return [popup.onElem];
	  return [];
  },
  FixTopDialogPosition:  function (profile,data,context)
  {
	  return aa_fixTopDialogPosition();
  },
  IsRuntimeDialog: function (profile,data,context)
  {
  	var activating_controls = ajaxart.getVariable(context,"OriginalControlElement");
  	if (jQuery(activating_controls[0]).parents(".runtime").length > 0 ) return ["true"];
  	return [];
  },
  PopUpDialog:  function (profile,data,context)
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
	  },
	  ShowValidationError: function (profile,data,context)
	  {
		var ctrl = jQuery(context.vars.DialogContext[0].Content);
		if (! ctrl.hasClass('aa_container') ) ctrl = ctrl.find('.aa_container');
		if (!ctrl[0]) return;
		aa_validation_showerror(ctrl[0],aa_text(data,profile,'Error',context),null,context);
	  },
	  ShowNotificationMessage: function (profile,data,context)
	  {
		  var title_text = aa_text(data,profile,'Title',context);
		  var control = aa_first(data,profile,'Control',context);
		  var popup = document.createElement('div'); popup.className='aa_modeless_popup aa_notification';
		  var rtl = jQuery("body").find('.right2left').length > 0;
		  if (rtl) jQuery(popup).addClass('right2left');
		  
		  popup.hide = function() {
			  jQuery(popup).animate({height:'hide'},300,function() {jQuery(popup).remove(); });
		  }
		  var title = document.createElement('div'); title.className='title'; popup.appendChild(title);
		  jQuery(title).text(title_text);
		  var content = document.createElement('div'); content.className='content'; popup.appendChild(content);
		  if (control != null) content.appendChild(control);
		  var close_button = document.createElement("IMG");
		  close_button.setAttribute("src","images/close.png");
		  close_button.className = 'close_button';
		  jQuery(close_button).click(function() { popup.hide(); } );
		  jQuery(title).click(function() { popup.hide(); } );
		  popup.appendChild(close_button);
		  popup.style.display = 'none';
		  document.body.appendChild(popup);
		  var scroll_offset = ajaxart_scroll_offset();
		  var screen_size = ajaxart_screen_size();
		  if (rtl)
		  	{ popup.style.left = aa_text(data,profile,'MarginRight',context) + "px"; }//CHANGE FOR STA}
		  else
		  	{ popup.style.right = aa_text(data,profile,'MarginRight',context) + "px";}
		  popup.style.position = 'fixed';
		  popup.style.bottom = scroll_offset.y + aa_int(data,profile,'MarginBottom',context) + "px";
		  if (jQuery(".aa_notification").length > 0) {// has more
			  var other_popus = jQuery(".aa_notification");
			  var highest = 0;
			  for (var i=0; i<other_popus.length; i++) {
				  if (other_popus[i].style.display == 'block') {
					  var top = aa_absTop(other_popus[i]);
					  if (top < highest || highest == 0)
						  highest = top;
				  }
			  }
			  if (highest > 0)
				  popup.style.bottom = screen_size.height + scroll_offset.y - highest + aa_int(data,profile,'MarginBottom',context) + "px";
		  }
		  jQuery(popup).animate({height:'show'},300);
		  setTimeout(function() {
			  popup.hide();
		  }, aa_int(data,profile,'AutoCloseTimeInSeconds',context)*1000);
	  },
	  CloseNotificationMessage: function (profile,data,context)
	  {
		  var popups = jQuery('.aa_notification');
		  if (popups.length == 0) return;
		  if (popups.length == 1) { popups[0].hide(); return; }

		  if (aa_bool(data,profile,'CloseAll',context)) {
			  for(var i=0;i<popups.length;i++) popups[i].hide();
			  return;
		  }

		  if (! context.vars.ControlElement) return;
		  // more than one
		  var item = context.vars.ControlElement[0];
		  while (item) {
			  if (jQuery(item).hasClass('aa_notification') ) { item.hide(); return; }
			  item = item.parentNode;
		  }
	  }
});
//AA EndModule

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




aa_gcs("twitter", {
	TwitterShare: function (profile,data,context)
	{
		context.vars._Field[0].Control = function(field_data,ctx) {
			var out = jQuery('<a href="https://twitter.com/share">Tweet</a>').addClass('twitter-share-button');

			var text = aa_text(field_data,profile,'Text',context);
			var url = aa_text(field_data,profile,'Url',context);
			out.attr('data-url',url).attr('data-text',text);

			if (!aa_bool(field_data,profile,'ShowCount',context)) out.attr('data-count','none');
			if (aa_bool(field_data,profile,'Large',context)) out.attr('data-size','large');

			aa_addOnAttach(out[0],function() {
				jQuery.getScript('//platform.twitter.com/widgets.js');
			});
			//aa_load_js_css('//platform.twitter.com/widgets.js','js');

			return out.get();
		}
	}
});


aa_gcs("facebook", {
	LikeButton: function (profile,data,context)
	{
		var appid = aa_text(data,profile,'AppID',context);

		context.vars._Field[0].Control = function(field_data,ctx) {
			var url = 'https://www.facebook.com/plugins/like.php?href=' + encodeURIComponent(aa_text(data,profile,'Url',context));
			url += '&layout=' + aa_text(data,profile,'LayoutStyle',context);
			var out = jQuery('<iframe scrolling="no" frameborder="0" />').attr('src',url).attr('style','border:none;height:30px').css('width',aa_text(data,profile,'Width',context));

			return out.get();
		}

		context.vars._Field[0].Control1 = function(field_data,ctx) {
			var out = jQuery('<div data-send="true" data-show-faces="false" data-action="like" />').addClass('fb-like');
			out.attr('data-width',aa_text(data,profile,'Width',context));
			out.attr('data-href',aa_text(data,profile,'Url',context));
			out.attr('data-layout',aa_text(data,profile,'LayoutStyle',context));
			out.attr('data-send',aa_bool(data,profile,'SendButton',context) ? 'true' : 'false');

			aa_addOnAttach(out[0],function() {
				aa_init_facebook(appid);
			});

			return out.get();
		}
	}
});


function aa_init_facebook(appid)
{
	if (window.FB) {
		FB.XFBML.parse();
		return;
	}
	aa_load_js_css('//connect.facebook.net/en_US/all.js#xfbml=1&appId='+appid,'js');
}


//AA BeginModule
ajaxart.gcs.group =
{
	DateIntervals: function (profile,data,context)
	{
		var options = { isObject: true, Options: [] };
		if (aa_bool(data,profile,'Today',context))
		{
			var today = aadate_dateObj2StdDate(new Date());
			options.Options.push({ isObject: true, code: ajaxart_multilang_text('Today',context) + ' (' +aadate_dateObj2StdDate(new Date())+ ')', From: today, To: today });
		}
		if (aa_bool(data,profile,'Yesterday',context))
		{
			var yesterday = aadate_addToDate(aadate_dateObj2StdDate(new Date()),-1);
			options.Options.push({ isObject: true, code: ajaxart_multilang_text('Yesterday (',context) + yesterday + ')', From: yesterday, To: yesterday });
		}
		if (aa_bool(data,profile,'Last7days',context))
		{
			var today = aadate_dateObj2StdDate(new Date());
			var seven_days_ago = aadate_addToDate(aadate_dateObj2StdDate(new Date()),-6);
			options.Options.push({ isObject: true, code: ajaxart_multilang_text('Last 7 days',context), From: seven_days_ago, To: today });
		}
		if (aa_bool(data,profile,'ThisMonth',context))
		{
			var this_month = '' + aadate_currentMonth() + '/' + aadate_currentYear();
			options.Options.push({ isObject: true, code: ajaxart_multilang_text('This Month (',context) + this_month + ')', From: this_month, To:this_month });
		}
		if (aa_bool(data,profile,'LastMonth',context))
		{
			var first_of_this_month = '1/' + aadate_currentMonth() + '/' + aadate_currentYear();
			var last_month_split =  aadate_addToDate(first_of_this_month,-1).split('/');
			var last_month = last_month_split[1] + '/' + last_month_split[2];
			options.Options.push({ isObject: true, code: ajaxart_multilang_text('Last Month (',context) + last_month + ')', From: last_month, To: last_month });
		}
		if (aa_bool(data,profile,'ThisYear',context))
		{
			var this_year = '' + aadate_currentYear();
			options.Options.push({ isObject: true, code: ajaxart_multilang_text('This Year (',context) + this_year + ')', From: this_year, To: this_year });
		}
		if (aa_bool(data,profile,'LastYear',context))
		{
			var last_year = '' + (aadate_currentYear() - 1);
			options.Options.push({ isObject: true, code: ajaxart_multilang_text('Last Year (',context) + last_year + ')', From: last_year, To: last_year });
		}
		return [options];
	}
}
//AA EndModule
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

function aa_Sum(wrappers,field_id)
{
	var out = 0;
	for(i in wrappers)
		out += wrappers[i][field_id];
	return out;
}

function aa_Average(wrappers,field_id)
{
	var out = 0;
	for(i in wrappers)
		out += wrappers[i][field_id];
	return out/wrappers.length;
}

function aa_Max(wrappers,field_id)
{
	var out = -2147483648;
	for(i in wrappers)
		out = Math.max(out,wrappers[i][field_id]);
	return out;
}

function aa_Min(wrappers,field_id)
{
	var out = 2147483647;
	for(i in wrappers)
		out = Math.min(out,wrappers[i][field_id]);
	return out;
}
function aa_Count(wrappers,field_id)
{
	return wrappers.length;
}
aa_gcs("image", {
	Image: function (profile,data,context)  // GC of image.Image
	{
		var image = {};
		image.Size = aa_text(data,profile,'Width',context)+','+aa_text(data,profile,'Height',context);
		
		image.KeepImageProportions = aa_bool(data,profile,'KeepImageProportions',context);
		aa_setMethod(image,'Url',profile,'Url',context);
		return [image];
	},
	ImageOld: function (profile,data,context)  // GC of image.ImageOld
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
	},
	ImageInCss: function(profile,data,context)
	{
		return [ { InCssClass: true, CssClass: aa_text(data,profile,'CssClass',context)} ];
	},
	ImageInSprite: function(profile,data,context)
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
	},
	ShowImage: function(profile,data,context)
	{
		var image = aa_first(data,profile,'Image',context);
		if (image && image.Url) image.StaticUrl = aa_totext(image.Url(data,context));
		var out = jQuery('<span/>')[0];
		aa_set_image(out,image,true);
		return [out];
	}
});

aa_gcs("field_type", {
	Image: function (profile,data,context)  // GC of field_type.Image
	{
		var field = context.vars._Field[0];
		field.ImageStyle = aa_first(data,profile,'Style',context); 
		field.Control = function(field_data,ctx) {
			var image = aa_first(field_data,profile,'Image',context);
			if (image && image.Url)
			  image.StaticUrl = aa_totext(image.Url(field_data,context));
			
			var style = field.ImageStyle;
			
			return [aa_renderStyleObject(style,{ Field: field, image: image, data: field_data[0] },context)];
		}
	},
	EditableImage: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.ImageStyle = aa_first(data,profile,'Style',context);
		
		field.Control = function(field_data,ctx) {
			var image = aa_first(field_data,profile,'Image',context);
			if (image && image.Url)
			  image.StaticUrl = aa_totext(image.Url(field_data,context));
			
			var style = field.ImageStyle;
			
			return [aa_renderStyleObject(style,{ 
				Field: field, image: image, data: field_data[0],
				SetValue: function(newurl,ctx2) {
					var content = this.control;
					ajaxart.writevalue( field_data, newurl );
					aa_invoke_field_handlers(field.OnUpdate,content,null,field,field_data,{});
					jBart.trigger(field,'update',{ FieldData: field_data, wrapper: content.parentNode });
				}
			},context)];
		}
	}
});


function aa_create_static_image_object(imageObject)
{
	if (!imageObject) return null;
	if (typeof(imageObject) == 'string') return { url: imageObject};
	
	var width = imageObject.width, height = imageObject.height;
	if (imageObject.Size) {
		var sizeArr = aa_split(imageObject.Size,',',true);
		width = sizeArr[0] ? parseInt(sizeArr[0]) : null;
		height = sizeArr[1] ? parseInt(sizeArr[1]) : null;
	}

	return {
		url: imageObject.StaticUrl,
		width: width,
		height: height,
		inSprite: imageObject.inSprite,
		x: imageObject.x,
		y: imageObject.y
	}
}


aa_gcs("field", {
	PropertySheet1: function (profile, data, context) 
	{
	    var field = {
        	Title: aa_multilang_text(data, profile, 'Title', context),
        	FieldData: function (data) { return data; },
        	SectionStyle: aa_first(data,profile,'SectionStyle',context)
        };
        field.Id = aa_text(data, profile, 'ID', context);
        field.ID = [field.Id];
	
        var ctx = aa_ctx(context, { _Field: [field] });
	    field.Style = aa_first(data, profile, 'Style', ctx);
	    field.HideTitle = aa_bool(data,profile,'HideTitle',context);
	    
	    field.Control = function (field_data, ctx) 
	    {
	        var fields = ajaxart.runsubprofiles(data,profile,'Field',aa_merge_ctx(context,ctx));

            var visibleFields = [];
            for(var i=0;i<fields.length;i++) {
                if (fields[i].IsFieldHidden && fields[i].IsFieldHidden(field_data,ctx) ) continue;
                if (fields[i].IsCellHidden && fields[i].IsCellHidden(field_data,ctx) ) continue;
                if (fields[i].IsHidden) continue; 
                visibleFields.push(fields[i]);
            }
	        
	        var out = aa_renderStyleObject(field.Style,{ 
				data: field_data,
	  	  		Fields: visibleFields,
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
	  	    
			if (field.SectionStyle) {
				return [ aa_wrapWithSection(out,field,field.SectionStyle,field_data,ctx) ];
			}
	  	    
	  	    return [out];
	    }
	    
        ajaxart.runsubprofiles(data, profile, 'FieldAspect', ctx);
	    
	    return [field]
	}
});

// See documentation in js api
function aa_propertysheet(group,settings)
{
	aa_defaults(settings,{
		FieldElement: jQuery(group).find('.field')[0],
		MoreOptionsCssClass: 'field_for_more_options',
		FieldTitle: function(title) { return title ? title+':' : '' },
		SetDescription: function(field,description) {
			jQuery(field).find('.field_contents').append('<div class="field_description"/>');
		    field.setInnerHTML('.field_description',description);  
		}
	});
	
    group.addFields(settings.FieldElement,function(field) {
    	var field_id = field.Field && field.Field.Id;
		field.setPlaceholderForMoreFields(function(fieldForOptions) {
	      jQuery(fieldForOptions).addClass(settings.MoreOptionsCssClass + ' ' + settings.MoreOptionsCssClass + "_" + field_id).find('>.field_title').remove();
	      var jContents = jQuery(fieldForOptions).find('>.field_contents').attr('colspan',2).append('<div class="field_options_page"/>');
	      fieldForOptions.setOptionsPage('.field_options_page');
	    });

		if (field.HideTitle || field.IsSection) {
		    jQuery(field).find('>.field_title').remove();
		    jQuery(field).find('>.field_contents').attr('colspan',2);
		} else {
		    field.setInnerHTML('.field_title',settings.FieldTitle(field.Title));  
		    jQuery(field).find('>.field_title').addClass("field_title_" + field_id);
		}
		
		var jFieldContents = jQuery(field).find('.field_contents');
		jFieldContents.addClass("field_contents_" + field_id);
		field.setControl('.field_contents'); 
		if (field.Field.Description) settings.SetDescription(field,field.Field.Description);
    });
}


aa_gcs("slider", {
	Unit: function (profile,data,context)
	{
		var unit = {
			symbol: aa_text(data,profile,'Symbol',context),
			min: parseFloat(aa_text(data,profile,'Min',context)),
			max: parseFloat(aa_text(data,profile,'Max',context)),
			initialPixelsPerUnit: parseFloat(aa_text(data,profile,'InitialPixelsPerUnit',context)),
			step: aa_float(data,profile,'Step',context),
			sliderText: function(value,field) {
				if (value == '' && field.AllowEmptyValue) 
					return field.TextForEmptyValue;
				return aa_text([value],profile,'SliderText',aa_ctx(context,{Symbol:[this.symbol]}));
			},
			valueToSave: function(numericVal,field) {
				if (numericVal === '' && field.AllowEmptyValue) 
					return '';
				return aa_text([numericVal],profile,'DataFormat',aa_ctx(context,{Symbol:[this.symbol]}));
			},
			numericPart: function(val,field) { 
				var parts = (''+val).match(/([^0-9\.\-]*)([0-9\.\-]+)([^0-9\.\-]*)/);
				var value = parts && parts[2];
				value = value || (field.AllowEmptyValue ? '' : '0');
				var v = parseFloat(value);
				if (!isNaN(v)) 
					value = '' + this.fixValue(v);
				return value;
			},
			fixValue: function(val) {
				var unit = this;
				if (!isNaN(unit.min)) val = Math.max(val,unit.min);
				if (!isNaN(unit.max)) val = Math.min(val,unit.max);
				val = Math.round(val/unit.step)*unit.step; 
				val = parseFloat(val.toFixed(3)+''.replace(/0+$/,''));
				return val;
			}
		}
		return [unit];
	},
	Slider: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.SliderStyle = aa_first(data,profile,'Style',context);
		field.AllowEmptyValue = aa_bool(data,profile,'AllowEmptyValue',context);
		field.TextForEmptyValue = aa_bool(data,profile,'TextForEmptyValue',context);
		aa_field_handler(field,'ModifyControl',function() {},'resizer'); // disable the resizer
		var units = ajaxart.run(data,profile,'Units',context);
		var unit = units[0];
		if (!unit) {
			var min = aa_text(data,profile,'Min',context);
			var xtml = ajaxart.parsexml('<xtml t="slider.Unit" Min="' + min + '" />');
			unit = aa_first(data,xtml,'',context);
		}
		
		field.Control = function(field_data,ctx) {
			var field = this;
			var style = field.SliderStyle;
			var jSlider = jQuery(style.Html);
			var numericValue = unit.numericPart(ajaxart.totext_array(field_data),field);
			
			var slider = aa_api_object(jSlider,{
				initSizes: function() {
					var sliderWidth = parseInt(slider.width.split('px')[0] || '0' );
					slider.scaleWidth = jQuery(slider.jbScaleElem).width() || sliderWidth;
					slider.fromPixel = aa_absLeft(slider.jbScaleElem);
					slider.toPixel = slider.fromPixel + slider.scaleWidth;
					slider.center = Math.round(slider.fromPixel+ slider.scaleWidth/2);
					if (!isNaN(unit.min)) slider.from = unit.min;
					if (!isNaN(unit.max)) slider.to = unit.max;
					if (!isNaN(unit.initialPixelsPerUnit)) slider.ratio = slider.ratio || unit.initialPixelsPerUnit;
					if (!slider.ratio && slider.from != null && slider.to != null)
						slider.ratio = slider.scaleWidth/(slider.to - slider.from);
					if (!slider.ratio)
						slider.ratio = 1/unit.step;
					if (slider.from != null && slider.to != null)
						slider.range = slider.to - slider.from;
					else 
						slider.range = slider.scaleWidth / slider.ratio; 
	
					if (slider.from != null)
						slider.offset = slider.from * slider.ratio;
					slider.thumbWidth = Math.round(jQuery(slider.jbThumbElem).outerWidth()/2);
				},
				setValue: function(val,state) {
					numericValue = unit.numericPart(val,field);
					var value_to_save = unit.valueToSave(numericValue,field);

					if ( aa_totext(field_data) == value_to_save) return slider; // no change - so do not save & fire events
					ajaxart.writevalue(field_data,[value_to_save]);
					if (field.RefreshOn == 'every click' || state != 'slide')
						aa_invoke_field_handlers(field.OnUpdate,slider,{},field,field_data);

					return slider;
				},
				width: aa_text(data,profile,'Width',context),
				adjustScale: function() {
					var val = parseFloat(numericValue);
					var distanceFromSide = Math.min(val - slider.from, slider.to - val) * slider.ratio;
					if (distanceFromSide > 10) return slider; // far from sides, no need to adjust
					if (isNaN(val)) val = unit.fixValue(0);
					// put in the middle
					if (isNaN(unit.min))
						slider.from = (val - slider.range/2).toFixed(2);
					if (isNaN(unit.max))
						slider.to = (val + slider.range/2).toFixed(2);
					if (unit.min == 0 && isNaN(unit.max))
						slider.to = Math.max(slider.to,val+slider.range);
					slider.offset = slider.from * slider.ratio;
					slider.range = slider.to - slider.from;
					slider.ratio = slider.scaleWidth/slider.range;
					return slider;
				},
				pixelToUnits: function(x) { 
					return (x+slider.offset)/slider.ratio;
				},
				setThumbPosition: function() {
					var val = parseFloat(numericValue);
					if (isNaN(val)) val = unit.fixValue(0);
					if (!slider.ratio) return;
					if (val < slider.from || val > slider.to) {
						slider.setThumbPosition();
						return;
					}
				    if (numericValue == '') 
				    	jSlider.addClass('empty_value') 
				    else 
				    	jSlider.removeClass('empty_value'); 
					var xPixels = Math.round(val * slider.ratio - slider.offset);
					xPixels = Math.max(xPixels,0);
					xPixels = Math.min(xPixels,slider.scaleWidth);
		            jQuery(slider.jbThumbElem).css('left', xPixels- slider.thumbWidth);
		            jQuery(slider.jbTextElem).html(unit.sliderText(numericValue,field));
				},
		        keyDown: function(e) {
		    		e = e || event;
		    		var str = String.fromCharCode(e.keyCode);
		    		if (e.keyCode == 189) str = "-";
		    		if (str.match(/[\-0-9]/)) {
		    			aa_first([slider],profile,'PopupEditor',aa_ctx(context,{Value:[str],Slider:[slider],ControlElement: [slider.jbThumbElem]}));
		    			return true;
		    		}
		    		if (e.keyCode == 46 && field.AllowEmptyValue) { // delete
		    			slider.setValue(field,'');
		    			slider.adjustScale(true);
		    		}
		    		if (str == '0') slider.setValue('0');
		    		//jBart.trigger(slider.jbThumbElem,'keydown',{code:e.keyCode, str: str});
		    		var val = parseFloat(numericValue);
		    		if (isNaN(val)) val = 0;
		    		if (e.keyCode == 37 || e.keyCode == 39) { // right/left
		    			if (e.keyCode == 39)
		    				val += unit.step * (e.shiftKey ? 10 : 1);
		    			else
		    				val -= unit.step * (e.shiftKey ? 10 : 1);
			            slider.setValue(val);
			            aa_stop_prop(e);
		    		}
		    		slider.setThumbPosition();
		    		return true;
		    	}
			});
			jQuery(slider).addClass(aa_attach_global_css(style.Css));
			aa_defineElemProperties(slider,'init'); 
			
			slider.init = function(scale,thumb,text) {
				var slider = this;
				slider.jbScaleElem = this.getInnerElement(scale);
				slider.jbTextElem = this.getInnerElement(text);
				jQuery(slider.jbTextElem).mousedown(function(){
					aa_first(data,profile,'PopupEditor',aa_ctx(context,{Value:[numericValue],Slider:[slider],ControlElement: [slider.jbThumbElem]}));
					return false;
				});
				slider.jbThumbElem = this.getInnerElement(thumb);
				slider.jbThumbElem.tabIndex = 1;
				jQuery(slider.jbScaleElem).css('width',aa_text(data,profile,'Width',context));
				jQuery(slider.jbThumbElem).bind('mousedown',dragBegin);
				jQuery(slider.jbThumbElem).bind('keydown',slider.keyDown);
			
				aa_addOnAttach(slider,function () {
					slider.initSizes();
					slider.adjustScale();
					slider.setThumbPosition();
				});

				function dragBegin(e) {            
		        	if (aa_incapture) return true;
		        	slider.initSizes(); 
		        	slider.adjustScale(); 
		        	slider.setThumbPosition();
		        	
		        	slider.jbStartDragTime = new Date().getTime();
		        	slider.jbSuspectClick = true;
		            document.onmousemove = function(e) { drag(e) }
		            document.onmouseup   = function(e) { slider.dragEnd(e) }
		            jQuery(slider.jbThumbElem).focus();
		            drag(e);
		            return false;
		        }
		        function drag(e) {
		        	if (slider.jbSuspectClick) {
		        		if (new Date().getTime() - slider.jbStartDragTime < 100) return;
		        		slider.jbSuspectClick = false;
		        	}
					slider.fromPixel = aa_absLeft(slider.jbScaleElem);
		            var pos = aa_mousePos(e);
		            pos.x = Math.max(pos.x,slider.fromPixel);
		            pos.x = Math.min(pos.x,slider.toPixel);
		            var xPixels = pos.x - slider.fromPixel;
		            slider.setValue(slider.pixelToUnits(xPixels)).setThumbPosition();
		         }
		         slider.dragEnd = function(e) {
		            document.onmouseup = null;
		            document.onmousemove = null;
		        	if (!slider.jbSuspectClick) {
		        		slider.setValue(numericValue);
		        		slider.adjustScale().setThumbPosition();
		        	}
		        	slider.jbSuspectClick = false;
		            jQuery(slider.jbThumbElem).focus();
		         }
			}
			aa_apply_style_js(slider,field.SliderStyle);
			return jSlider.get();
		}
	},
	SliderGroup: function (profile,data,context) {
		  var aspect = { isObject : true };
		  var fromUnits = aa_int(data,profile,'From',context);
		  var toUnits = aa_int(data,profile,'To',context);
		  var step = parseFloat(aa_text(data,profile,'Step',context));
		  var keepThumbsOrder = aa_bool(data,profile,'KeepThumbsOrder',context);
		  
		  aspect.InitializeContainer = function(initData,ctx)
		  {
			  var cntr = ctx.vars._Cntr[0];
			  cntr.createNewElement = function(item_data,item_aggregator,ctx2)
			  {
				  var cntr = this;
				  var ctx3 = aa_merge_ctx(context,ctx2);
				  var style = aa_first(item_data,profile,'Style',ctx3);
				  var jGroup = jQuery(style.Html);

				  var group = aa_api_object(jGroup,{
					  	data: item_data, cntr: cntr,
						from: aa_float(item_data,profile,'From',ctx3),
						to: aa_float(item_data,profile,'To',ctx3),
						step: aa_float(item_data,profile,'Step',ctx3),
						keepThumbsOrder: aa_bool(item_data,profile,'KeepThumbsOrder',ctx3),
						addThumbFields: function() {
							var fields = ajaxart_field_getFields(cntr,"property sheet");
							for (var j=0;j<fields.length;j++) {
								var field = fields[j];
								if (!field.ThumbControl) continue;
								var field_data = ajaxart_field_calc_field_data(field,item_data,ctx3);
								var thumb = field.ThumbControl(field_data,ctx3)[0];
								group.appendChild(thumb);
							 }
				  		}
				  });
				  jQuery(group).addClass(aa_attach_global_css(style.Css)).addClass('aa_thumb_group');
				  var width = aa_text(data,profile,'Width',context);
				  if (width) jQuery(group).css('width',width);
				  
				  aa_addOnAttach(group,function () {
					  group.fromPixel = aa_absLeft(group);
					  group.toPixel = group.fromPixel + jQuery(group).width();
					  group.ratio = (group.toPixel - group.fromPixel)/(group.to - group.from);
				  });
				  aa_apply_style_js(group,style);
				  if (item_aggregator) item_aggregator.push(group);
				  return group;
			  }
		  }
		  return [aspect];
		},
		Thumb: function (profile,data,context)
		{
			var field = context.vars._Field[0];
			aa_field_handler(field,'ModifyControl',function() {},'resizer'); // disable the resizer
			ajaxart.runNativeHelper(data,profile,'Fixes',context);

			field.GetThumbValue = function(field_data) {
				var txt_value = ajaxart.totext_array(ajaxart.run(field_data,profile,'Value',context));
				var units = txt_value.match(/([^0-9\.\-]*)([0-9\.\-]+)([^0-9\.\-]*)/);
				return parseFloat((units && units[2]) || '0');
			}
			field.SetThumbValue = function(value,field_data) {
				var actual_field_data = ajaxart.run(field_data,profile,'Value',context);
				// stripping the affixes and injecting the new value
				var txt_value = ajaxart.totext_array(actual_field_data);
				var units = txt_value.match(/([^0-9\.\-]*)([0-9\.\-]+)([^0-9\.\-]*)/);
				var prefix = (units && units[1]) || aa_text(data,profile,'Prefix',context);
				var suffix = (units && units[3]) || aa_text(data,profile,'Suffix',context);
				ajaxart.writevalue(actual_field_data,[value + units]);
			}
			aa_field_handler(field,'ModifyControl',function() {},'resizer'); // disable resizer
			field.ThumbControl = function(field_data,ctx) {
				var value = field.GetThumbValue(field_data);
				var style = aa_first(field_data,profile,'Style',aa_merge_ctx(context,ctx));
				var jThumb = jQuery(style.Html);
				var thumb = aa_api_object(jThumb,{
					setValue: function(val,state) {
						thumb.value = value = val;
						thumb.setThumbPosition(value);
						field.SetThumbValue(value,field_data);
						if (field.RefreshOn == 'every click' || state != 'slide')
							aa_invoke_field_handlers(field.OnUpdate,thumb,{},field,field_data);
					},
					setThumbPosition: function(val) {
						var group = thumb.group;
						if (!group || !group.ratio) return;
						var xPixels = Math.round(val * group.ratio);
						xPixels = Math.max(xPixels,0);
						xPixels = Math.min(xPixels,jQuery(group).width());
			            jQuery(thumb).css('left', xPixels);
						if (thumb.ctrlElem) {
							aa_empty(thumb.ctrlElem);
							ajaxart_field_createCellControl(group.data,group.cntr,thumb.ctrlElem,"control",field,field_data,ctx);
						}
					},
					pixelToUnits: function(x) { 
						try {
							var val = (x+slider.offset)/slider.ratio;
							return Math.round(val/slider.step) * slider.step;
						} catch(e) {}
						return 0;
					},
					init: function(thumbCls,thumCtrlCls) {
						var thumbElem = this.getInnerElement(thumbCls) || thumb;
						thumb.ctrlElem = this.getInnerElement(thumCtrlCls);
						jQuery(thumbElem).bind('mousedown',dragBegin);
						thumb.tabIndex = 1;

						aa_addOnAttach(thumb,function () {
							thumb.group = jQuery(thumb).parents('.aa_thumb_group')[0];
							if (!thumb.group) {
								ajaxart.log("Can not find thumb group (class aa_thumb_group)");
								return;
							}
							thumb.value = value;
							thumb.setThumbPosition(value);
						});
						function dragBegin(e) {            
				        	if (aa_incapture) return true;
							ajaxart_disableSelection(document.body);
				            document.onmousemove = function(e) { drag(e) }
				            document.onmouseup   = function(e) { dragEnd(e) }
				            thumb.focus();
				            drag(e);
				            return false;
				        }
				        function drag(e) {
				        	var group = thumb.group;
				            var pos = aa_mousePos(e);
							var from = group.fromPixel;
							var to = group.toPixel;
							if (group.keepThumbsOrder && jQuery(thumb).prev()[0])
								from = aa_absLeft(jQuery(thumb).prev()[0]);
							if (group.keepThumbsOrder && jQuery(thumb).next()[0])
								to = aa_absLeft(jQuery(thumb).next()[0]);
							pos.x = Math.max(pos.x,from);
							pos.x = Math.min(pos.x,to);
				            var xPixels = pos.x - group.fromPixel;
				            thumb.setValue(slider.pixelToUnits(xPixels));
				         }
				         function dragEnd(e) {
				            document.onmouseup = null;
				            document.onmousemove = null;
				            thumb.setValue(value);
				            thumb.focus();
				            ajaxart_restoreSelection(document.body);
				         }
				         thumbElem.onkeydown = function(e) {
							var group = thumb.group;
				    		e = e || event;
				    		if (e.keyCode == 37 || e.keyCode == 39) { // right/left
					    		if (e.keyCode == 39)
					    			var new_value = value + group.step;
					    		else
					    			var new_value = value - group.step;
								if (group.keepThumbsOrder) {
									var prev = jQuery(thumb).prev()[0];
									if (prev && prev.value > new_value) return true;
									var next = jQuery(thumb).next()[0];
									if (next && next.value < new_value) return true;
								}
								thumb.setValue(new_value);
				    		}
				    		return true;
				    	}
					}
				});
				jThumb.addClass(aa_attach_global_css(style.Css));
				jThumb.css('position','absolute');
				aa_apply_style_js(thumb,style);
				return jThumb.get();
			}
		}
});

//aa_thumb( { thumb: elem1, scale: elem2});

function aa_thumb(settings) {
	jQuery(settings.thumb).bind('mousedown',dragBegin);
	//jQuery(settings.thumb).bind('keydown',keyDown);
	settings.thumb.onkeydown = keyDown;
	settings.thumb.tabIndex = 1;
	settings.step = settings.step || 1;
	settings.setThumbPosition = function(pos) { this.thumb.style.left = '' + pos + 'px'; }

	function dragBegin(e) {            
    	if (aa_incapture) return true;
    	
    	settings.jbStartDragTime = new Date().getTime();
    	settings.jbSuspectClick = true;
    	jQuery(settings.thumb).addClass('dragged');
        document.onmousemove = function(e) { drag(e) }
        document.onmouseup   = function(e) { dragEnd(e) }
        jQuery(settings.thumb).focus();
        drag(e);
        return false;
    }
    function drag(e) {
    	if (settings.jbSuspectClick) {
    		if (new Date().getTime() - settings.jbStartDragTime < 100) return;
    		settings.jbSuspectClick = false;
    	}
    	var fromPixel = aa_absLeft(settings.scale); // todo - prev elem
    	var toPixel = aa_absLeft(settings.scale) + jQuery(settings.scale).width(); // todo - next elem
        var pos = aa_mousePos(e);
        pos.x = Math.max(pos.x,fromPixel);
        pos.x = Math.min(pos.x,toPixel);
        var val = Math.floor((pos.x - fromPixel)/settings.step) * settings.step;
        settings.setThumbPosition(val);
        settings.onDrag && settings.onDrag(val);
     }
     function keyDown(e) {
 		e = e || event;
 		var val = parseInt(settings.thumb.style.left.match(/[0-9]*/)[0]);
 		if (e.keyCode == 37 || e.keyCode == 39) { // right/left
 			if (e.keyCode == 39)
 				val += (e.shiftKey ? settings.step * 10 : settings.step);
 			else
 				val -= (e.shiftKey ? settings.step * 10 : settings.step);
 	        settings.setThumbPosition(val);
 	        settings.onDrag && settings.onDrag(val);
 	 		ajaxart_stop_event_propogation(e);
 		}
 		return true;
 	}
     function dragEnd(e) {
        document.onmouseup = null;
        document.onmousemove = null;
        settings.jbSuspectClick = false;
    	jQuery(settings.thumb).removeClass('dragged');
        jQuery(settings.thumb).focus();
     }
}



function aa_jbart_slider(editableNumber, settings) {
	var unit = aa_get_first_unit(editableNumber.units);
	unit.field = editableNumber.field; 
	if (!unit) {
		ajaxart.log('slider - no units defined for slider');
		return;
	}

	var numericValue = unit.numericValue([editableNumber.value]);
	var slider = editableNumber.slider = {
		scaleElem: settings.scaleElement,
		textElem: settings.textElement,
		thumbElem: settings.thumbElement,
		inputElem: settings.inputElement,
	    init: function() {
			var slider = this;
			jQuery(slider.textElem).mousedown(function(){
				jQuery(slider.inputElem).show().focus();
				return false;
			});
			slider.thumbElem.tabIndex = 1;
			jQuery(slider.scaleElem).css('width',slider.width);
			jQuery(slider.thumbElem).bind('mousedown',dragBegin);
			jQuery(slider.thumbElem).bind('keydown',slider.keyDown);
			jQuery(slider.inputElem).bind('keydown',slider.inputKeyDown).bind('blur',slider.setInputValue).hide();
		
			aa_addOnAttach(settings.$el[0],function () {
				slider.initSizes();
				slider.adjustScale();
				slider.setThumbPosition();
			});

			function dragBegin(e) {            
	        	if (aa_incapture) return true;
	        	slider.initSizes(); 
	        	slider.adjustScale(); 
	        	slider.setThumbPosition();
	        	
	        	slider.startDragTime = new Date().getTime();
	        	slider.suspectClick = true;
	            document.onmousemove = function(e) { drag(e) }
	            document.onmouseup   = function(e) { slider.dragEnd(e) }
	            jQuery(slider.thumbElem).focus();
	            drag(e);
	            return false;
	        }
	        function drag(e) {
	        	if (slider.suspectClick) {
	        		if (new Date().getTime() - slider.startDragTime < 100) return;
	        		slider.suspectClick = false;
	        	}
				slider.fromPixel = aa_absLeft(slider.scaleElem);
	            var pos = aa_mousePos(e);
	            pos.x = Math.max(pos.x,slider.fromPixel);
	            pos.x = Math.min(pos.x,slider.toPixel);
	            var xPixels = pos.x - slider.fromPixel;
	            slider.setValue(slider.pixelToUnits(xPixels)).setThumbPosition();
	         }
	         slider.dragEnd = function(e) {
	            document.onmouseup = null;
	            document.onmousemove = null;
	        	if (!slider.suspectClick) {
	        		slider.setValue(numericValue);
	        		slider.adjustScale().setThumbPosition();
	        	}
	        	slider.suspectClick = false;
	            jQuery(slider.thumbElem).focus();
	         }
        },
		initSizes: function() {
			slider.scaleWidth = jQuery(slider.scaleElem).width();
			slider.fromPixel = aa_absLeft(slider.scaleElem);
			slider.toPixel = slider.fromPixel + slider.scaleWidth;
			slider.center = Math.round(slider.fromPixel+ slider.scaleWidth/2);
			if (!isNaN(unit.min)) slider.from = unit.min;
			if (!isNaN(unit.max)) slider.to = unit.max;
			if (!isNaN(unit.initialPixelsPerUnit)) slider.ratio = slider.ratio || unit.initialPixelsPerUnit;
			if (!slider.ratio && slider.from != null && slider.to != null)
				slider.ratio = slider.scaleWidth/(slider.to - slider.from);
			if (!slider.ratio)
				slider.ratio = 1/unit.step;
			if (slider.from != null && slider.to != null)
				slider.range = slider.to - slider.from;
			else 
				slider.range = slider.scaleWidth / slider.ratio; 

			if (slider.from != null)
				slider.offset = slider.from * slider.ratio;
			slider.thumbWidth = Math.round(jQuery(slider.thumbElem).outerWidth()/2);
		},
		setValue: function(val,state) {
			numericValue = '' + unit.applyRangeAndResolution(val);
			var value_to_save = unit.dataFormat(numericValue);
			editableNumber.onchange(value_to_save);

			return slider;
		},
		adjustScale: function() {
			var val = parseFloat(numericValue);
			var distanceFromSide = Math.min(val - slider.from, slider.to - val) * slider.ratio;
			if (distanceFromSide > 10) return slider; // far from sides, no need to adjust
			if (isNaN(val)) val = unit.applyRangeAndResolution(0);
			// put in the middle
			if (isNaN(unit.min))
				slider.from = unit.applyRangeAndResolution(val - slider.range/2);
			if (isNaN(unit.max))
				slider.to = unit.applyRangeAndResolution(val + slider.range/2);
			if (unit.min == 0 && isNaN(unit.max))
				slider.to = Math.max(slider.to,val+slider.range);
			slider.offset = slider.from * slider.ratio;
			slider.range = slider.to - slider.from;
			if (slider.range)
				slider.ratio = slider.scaleWidth/slider.range;
			return slider;
		},
		pixelToUnits: function(x) { 
			return (x+slider.offset)/slider.ratio;
		},
		setThumbPosition: function() {
			var val = parseFloat(numericValue);
			if (isNaN(val)) val = unit.applyRangeAndResolution(0);
			if (!slider.ratio) return;
			if (val < slider.from || val > slider.to) {
				slider.setThumbPosition();
				return;
			}
		    if (numericValue == '') 
		    	settings.$el.addClass('empty_value') 
		    else 
		    	settings.$el.removeClass('empty_value'); 
			var xPixels = Math.round(val * slider.ratio - slider.offset);
			xPixels = Math.max(xPixels,0);
			xPixels = Math.min(xPixels,slider.scaleWidth);
            jQuery(slider.thumbElem).css('left', xPixels- slider.thumbWidth);
            jQuery(slider.textElem).html(unit.displayFormat(numericValue));
		},
        keyDown: function(e) {
    		e = e || event;
    		var str = String.fromCharCode(e.keyCode);
    		if (e.keyCode == 189) str = "-";
    		if (str.match(/[\-0-9]/)) {
    			jQuery(slider.inputElem).show().focus();
    			return true;
    		}
    		if (e.keyCode == 46 && editableNumber.allowEmptyValue) { // delete
    			slider.setValue('');
    			slider.adjustScale(true);
    		}
    		if (str == '0') slider.setValue('0');
    		//jBart.trigger(slider.jbThumbElem,'keydown',{code:e.keyCode, str: str});
    		var val = parseFloat(numericValue);
    		if (isNaN(val)) val = 0;
    		if (e.keyCode == 37 || e.keyCode == 39) { // right/left
    			if (e.keyCode == 39)
    				val += unit.step * (e.shiftKey ? 10 : 1);
    			else
    				val -= unit.step * (e.shiftKey ? 10 : 1);
	            slider.setValue(val);
	            aa_stop_prop(e);
    		}
    		slider.setThumbPosition();
    		return true;
    	},
    	setInputValue: function() {
        	slider.setValue(slider.inputElem.value);
        	slider.adjustScale();
   			slider.setThumbPosition();
   			jQuery(slider.inputElem).hide();
    	},
    	inputKeyDown: function(e) {
    		e = e || event;
    		if (e.keyCode == 13) // enter
	        	slider.setInputValue();
    		return true;
    	}

	}
	slider.init();
}

//AA BeginModule
ajaxart.gcs.formula = 
{
  CalcCells: function (profile,data,context) 
  {
	var cells = ajaxart.run(data,profile,'Cells',context);
	
	var out = "<cells>";
	
	var newContext = context; // ajaxart.newContext();
	
	for(var i=0;i<cells.length;i++)
	{
		var cell = cells[i];
		if (! ajaxart.isxml(cell)) continue;
		var id = cell.getAttribute('id');
		if (id == null || id == "") continue;
		var value = "";
		var manVal = cell.getAttribute('manualValue'); 
		if ( manVal != null && manVal.length > 0)
			value = manVal;
		else 
		  value = aa_text([],cell,'formula',newContext);
		
		newContext.vars[id] = [value];
		
		out += '<cell id="'+id+'" value="'+value+'"/>';
	}
	out += "</cells>";
	
	return [ ajaxart.parsexml(out) ];
  }
}
//AA EndModule



aa_gcs("googledocs", {
	GoogleSpreadsheet: function (profile,data,context)
	{
		var out = { isObject:true }
		out.Retrieve = function(data1,ctx) {
			var url = aa_totext( ajaxart.runNativeHelper(data,profile,'Url',context) );
			if (!window.google) window.google = {};
			if (!google.visualization) google.visualization = {};
			if (!google.visualization.Query) google.visualization.Query = {};
			google.visualization.Query.setResponse = function(result) {
				var xml = ajaxart.parsexml('<xml/>');
				if (result.table && result.table.rows) {
					for(var i=0;i<result.table.rows.length;i++) {
						var row = result.table.rows[i];
						var rowXml = xml.ownerDocument.createElement('item');
						if (row.c) {
							for(var j=0;j<row.c.length;j++) {
								if (row.c[j].v)
								  rowXml.setAttribute('c'+(j+1),row.c[j].v);
							}
						}
						xml.appendChild(rowXml);
					}
				}
				ajaxart_async_CallBack([xml],ctx);
			}
			ajaxart_async_Mark(ctx);
    		jQuery.ajax({ cache:false, url: url, dataType: "script"});
		}
		out.Save = function() { alert('Saving to google spreadsheet is not implemented yet')}
		return [out];
	}
});




aa_gcs("inteliChoice", {
	jBartStudioAccumulator: function(profile,data,context) {
	  jBart.bind(jBart,'userChoice',function(pick) {
		  aa_TriggerUserChoice(pick.selection,pick.target,pick.fieldId,pick.fieldXtml,pick.context);
	  	});
	},
	TriggerUserChoice: function(profile,data,context) {
		jBart.trigger(jBart,'userChoice',{ 
			selection: aa_first(data,profile,'Selection',context), 
			target: aa_first(data,profile,'Target',context), 
			fieldId: aa_text(data,profile,'FieldId',context),  
			fieldXtml: aa_first(data,profile,'FieldXtml',context),  
			context: context 
		});
	},
	TrackGoogleAnalyticsEvent: function(profile,data,context) {
		if (!window._gaq) return;

		_gaq.push(['_trackEvent', 
			aa_text(data,profile,'EventCategory',context),
			aa_text(data,profile,'EventAction',context),
			aa_text(data,profile,'EventLabel',context)
		]);
	}
});

if (window.jBartStudio)
	ajaxart.gcs.inteliChoice.jBartStudioAccumulator();

function aa_initjBartStudioGA() {
		if (window._gaq) return;
	   _gaq = window._gaq || [];
	   _gaq.push(['_setAccount', 'UA-37216601-1']);
	   _gaq.push(['_setDomainName', 'none']);//'artwaresoft.appspot.com']);
	   _gaq.push(['_setAllowLinker', true]);
	   _gaq.push(['_trackPageview']);

	   (function() {
	     var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	     ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	     var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	   })();
}
function aa_TriggerUserChoice(selection,target,fieldId,fieldXtml,context) {
	if (window.location.href.indexOf('runtests.html') > -1 ) return;

	function nodeContext(node,atts) {
		  if (!node || !node.nodeType) return '';
		  if (node.nodeType == 2) return nodeContext(node.parentNode)+ '/' + node.nodeName;
		  var withParents = [node].concat($(node).parents().get()); 
		  var ids = $(withParents).map(function() { 
			  var res = '';
			  for (var i=0; i<atts.length;i++) 
				  res += $(this).attr(atts[i]) ? atts[i] + '=' + $(this).attr(atts[i]) + '/' : '';
			  return res;
		  	});
		  var path = $(ids).filter(function() { return this }).get().join('/');
		  return path.replace(/\/+/g,'/');
	 }

	if (!selection) return;
    var path = target ? nodeContext(target,['id','ID','Id','t']): '';
    
    if (!fieldXtml && context.vars._Input) // guess field xtml for studio picklist
    	if (selection.parentNode == null || selection.parentNode.tagName == 'tmp') { // maybe studio temporary holder
		  var input_item = $(context.vars._Input).parents().filter(function() { return this.ItemData && this.ItemData[0] && this.ItemData[0].parentNode })[0];
		  if (input_item && input_item.ItemData && input_item.ItemData[0])
			  fieldXtml = input_item.ItemData[0];
	}		  
    var field_path = fieldXtml ? nodeContext(fieldXtml,['id','ID','Id','t']) : '';

	var time = new Date().getTime();
	var selection = ajaxart.totext(selection);
	var xml = '<userChoice selection="{selection}" field="{field}" data_path="{path}" field_path="{field_path}" time="{time}"/>'
		.replace(/{selection}/,selection).replace(/{path}/,path).replace(/{field}/,fieldId).replace(/{field_path}/,field_path).replace(/{time}/,time);
	  
	aa_initjBartStudioGA();
	_gaq.push(['_setCustomVar',1,'selection',selection]);                  
	_gaq.push(['_setCustomVar',2,'path',path]);                  
	_gaq.push(['_setCustomVar',3,'field',fieldId]);                  
	_gaq.push(['_setCustomVar',4,'field path',field_path]);                  
	_gaq.push(['_trackEvent', 'jBart Choice', fieldId, selection]);
//	if (window.console) console.log(xml);
}
// This file contains utility functions for drag and drop

function aa_dragAndDropTableColumns(table,settings)
{
	settings = aa_extend({
		draggedSpaceCssClass: 'aa1_dragged_space_elem',
		draggedCssClass: 'aa1_dragged_elem',
		onDrop: function() {},
		rtl: false
	},settings);  
	
	var thead = jQuery(table).find('>thead')[0];
	if (!thead || table.jbDragAndDropColsInitialized) return;
	table.jbDragAndDropColsInitialized = true;
	
	aa_registerTableHeaderEvent(thead,'mousedown',suspectDrag,'TableColumnsDragAndDrop','no dominant');
	aa_registerTableHeaderEvent(thead,'mousemove',checkSuspection,'TableColumnsDragAndDrop','suspect');
	aa_registerTableHeaderEvent(thead,'mouseup',unSuspectDrag,'TableColumnsDragAndDrop','suspect');
	aa_registerTableHeaderEvent(thead,'mouseout',unSuspectDrag,'TableColumnsDragAndDrop','suspect');
	aa_registerTableHeaderEvent(thead,'mousemove',_drag,'TableColumnsDragAndDrop','dominant');

	var ltr = !settings.rtl;
	var rtl = !ltr;

	function _drag(e,thead,th) 
	{
		var mousepos = aa_mousePos(e);
		var oElem = thead.draggedElem;
		if (!oElem) return true;
				
		oElem.style.left = (mousepos.x - oElem.mouseX) + 'px'; 

		var spaceLeft = aa_absLeft(thead.spaceElem);
		var nextRight = ltr ? -1 : 5000;
		if (jQuery(thead.spaceElem).next().length > 0)	{
			var next = jQuery(thead.spaceElem).next()[0];
			nextRight = aa_absLeft(next) + ltr * next.offsetWidth;
		}
		var prevLeft = ltr ? -1 : 5000;
		if (jQuery(thead.spaceElem).prev().length > 0)	{
			var prev = jQuery(thead.spaceElem).prev()[0];
			prevLeft = aa_absLeft(prev) + rtl * prev.offsetWidth;
		}
						
		var draggedLeft = aa_absLeft(thead.draggedElem) + rtl * (thead.draggedElem.offsetWidth + thead.draggedElem.mouseX);
		var draggedRight = aa_absLeft(thead.draggedElem) + ltr * (thead.draggedElem.offsetWidth + thead.draggedElem.mouseX);
		var nearRight = nextRight < draggedRight + 5;
		if (rtl) nearRight = !nearRight;
		var nearLeft = prevLeft > draggedLeft - 5;
		if (rtl) nearLeft = !nearLeft;

		var trs = jQuery(table).find('>tbody>tr').get();
		
		if (nearRight) {
			if (thead.spaceElem.nextSibling.nextSibling) {
				var colIndex = calcColumnIndex(thead.spaceElem);
				
				for(var j=0;j<trs.length;j++)
				{
					var tr = trs[j];
					var tds = jQuery(tr).find('>td');
					jQuery(tds[colIndex]).insertAfter(tds[colIndex+1]);
				}
				jQuery(thead.spaceElem).insertAfter(thead.spaceElem.nextSibling);
				thead.jbDropColumnIndex = colIndex+1;
			}
		}
		if (nearLeft) {
			if (thead.spaceElem.previousSibling) {
				var colIndex = calcColumnIndex(thead.spaceElem);
				
				for(var j=0;j<trs.length;j++)
				{
					var tr = trs[j];
					var tds = jQuery(tr).find('>td');
					tr.insertBefore(tds[colIndex],tds[colIndex-1]);
				}
				jQuery(thead.spaceElem).insertBefore(thead.spaceElem.previousSibling);
				thead.jbDropColumnIndex = colIndex-1;
			}
		}
		return aa_stop_prop(e);
	}
		 
	function _dragEnd(e) {
		jQuery(thead.spaceElem).removeClass(settings.draggedSpaceCssClass);
		thead.draggedParent.removeChild(thead.draggedElem);
		document.onmouseup = thead.origDocMouseup;
		thead.draggedElem = null;
		thead.Suspect = null;
		thead.Owner = null;
		
		if (thead.jbDropColumnIndex != -1)
			settings.onDrop(thead.jbDragColumnIndex,thead.jbDropColumnIndex);
		return aa_stop_prop(e);
	}
	 
	function suspectDrag(e,thead,th) {
		thead.Suspect = { owner: "TableColumnsDragAndDrop", mousePos : aa_mousePos(e) };
		return aa_stop_prop(e);
	}

	function checkSuspection(e,thead,th) {
		var mousepos = aa_mousePos(e);
		if (thead.Suspect) {
			var distance = Math.abs(mousepos.x - thead.Suspect.mousePos.x);
			if (distance < 5) return true;
			thead.Suspect = null;
			dragBegin(e,thead,th);
		}
	}

	function unSuspectDrag(e,thead,th) {
		if (thead.Owner == "TableColumnsDragAndDrop") return true;
		thead.Suspect = null;
		return true;
	}

	function dragBegin(e,thead,th) {
		ajaxart_disableSelection(thead);
		thead.Owner = "TableColumnsDragAndDrop";

		var posx = aa_absLeft(th,false) ;
		var posy = aa_absTop(th,false) ;
	  		    
		var oElem = thead.draggedElem = th.cloneNode(true);
		thead.draggedParent = th.parentNode; 
		thead.draggedParent.appendChild(oElem);
		thead.spaceElem = th; 

		jQuery(oElem).addClass(settings.draggedCssClass);
		jQuery(thead.spaceElem).addClass(settings.draggedSpaceCssClass);

		thead.jbDragColumnIndex = calcColumnIndex(th);
		thead.jbDropColumnIndex = -1;
		
		var mousepos = aa_mousePos(e);
		oElem.mouseX = mousepos.x - posx;

		jQuery(oElem).css('position','absolute').css('top',posy+'px').css('left',posx+'px');
		thead.origDocMouseup = document.onmouseup;
		document.onmouseup = _dragEnd;
		if(e.preventDefault) e.preventDefault();
		return aa_stop_prop(e);
	}
	
	function calcColumnIndex(th) {
		var parent = th.parentNode;
		var index = 0;
		for(var iter=parent.firstChild;iter;iter = iter.nextSibling) {
			if (iter == th) return index;
			if (iter.tagName.toLowerCase() == 'th') index++;
		}
	}
}


function aa_registerTableHeaderEvent(thead,eventType,func,ownerId,activation_mode)
{
	if (thead.EventHandler == null)
	{
		aa_defineElemProperties(thead,'handlers,EventHandler');
		thead.handlers = [];
		thead.EventHandler = function(e)
		{
			var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  ); 
		    e = e || event; // IE
		    
		    if (elem[0].tagName.toLowerCase() == 'th')
		    	var th = elem;
		    else
		    	var th = elem.parents('th');
		    if (th.length == 0) return true;
		    
		    if (e.type == 'mousedown')
		    	thead.LastMouseDown = { th: th[0] }; 
		    if (e.type == 'mouseout')
		    	thead.LastMouseDown = null;
		    
			for(var i=0;i<thead.handlers.length;i++)
			{
				var handler = thead.handlers[i];
				if (handler.eventType != e.type) continue;
				if (e.button == 2)
				{
					if (handler.activation_mode == 'right mouse')
						handler.func(e,thead,th[0]);
				}
				else
				{
					var activate = 
						(handler.activation_mode == 'no dominant' && thead.Owner == null) ||  
						(handler.activation_mode == 'suspect' && thead.Suspect != null && thead.Owner == null) ||
						(handler.activation_mode == 'dominant' && thead.Owner == handler.ownerId);
					if (activate)
						handler.func(e,thead,th[0]);
				}
			}
		}
		thead.onmousedown = thead.onmouseout =thead.onmouseup = thead.onmousemove = thead.EventHandler;
	}
	thead.handlers.push({eventType : eventType, func: func, ownerId: ownerId, activation_mode : activation_mode } )
}


// allows drag and drop of items
function aa_dragDropItems(settings)
{
    var list = settings.parent;
    var isTable = list.tagName.toLowerCase() == 'tbody';
    var listTopDiv = list;

	var draggedElem = null,spaceElem = null,DAndDOwner = "",SuspectItemDrag = null,OriginalElem = null;
	var onmousemoveOrig=null,listOriginalPosition=null,onkeydownOrig=null;
	
	ajaxart.ui.bindEvent(list,'mousedown',suspectDrag);
	ajaxart.ui.bindEvent(list,'mouseup',unSuspectDrag);
		
	function inElem(elem,top,left) {
		return (elem.offsetTop < top && elem.offsetLeft < left && 
				elem.offsetTop + elem.offsetHeight > top && 
				elem.offsetLeft + elem.offsetWidth > left); 
	}
	function elemAtPosition(top,left) {
		for(var elem=list.firstChild;elem;elem=elem.nextSibling) {
			if (inElem(elem,top,left) && settings.isItemElement(elem)) 
				return elem;
		}
	}
	function numbersBetween(num,num1,num2) {
		return ((num1 <= num && num <= num2) || (num2 <= num && num <= num1)); 
	}
	function elemsBetween(elem1,elem2) {
		for(var elem=list.firstChild;elem;elem=elem.nextSibling) {
			if (! settings.isItemElement(elem) ) continue;
			
			if (elem == elem1 || elem == elem2) return null;
			if (numbersBetween(elem.offsetTop,elem1.offsetTop,elem2.offsetTop) && numbersBetween(elem.offsetLeft,elem1.offsetLeft,elem2.offsetLeft)) {
				return elem;
			}
		}
	}
	
	function drag(e) {
		var offsetParent = listTopDiv;
		
		var mousepos = aa_mousePos(e,true);
		var mouseTop = mousepos.y - aa_absTop(offsetParent);
		var mouseLeft = mousepos.x - aa_absLeft(offsetParent);
		var posyDelta = aa_absTop(offsetParent);

		if (SuspectItemDrag)
		{
			var distance = Math.abs(mousepos.y - SuspectItemDrag.mousePos.y) + Math.abs(mousepos.x - SuspectItemDrag.mousePos.x);
			if (distance < 5) return aa_stop_prop(e);
			var elemAtMousePos = elemAtPosition(mouseTop,mouseLeft);
			if (! elemAtMousePos)
				unSuspectDrag();
			else
				dragBegin(elemAtMousePos,e);
			SuspectItemDrag = null;
			
			return true;
		}
		if (!draggedElem) return true;
		var elemAtMousePos = elemAtPosition(mouseTop,mouseLeft);

		// move dragged elem
		draggedElem.style.top = (mouseTop - posyDelta - draggedElem.initialMouseOffset.top)  + 'px'; 
		draggedElem.style.left = (mouseLeft - draggedElem.initialMouseOffset.left)  + 'px';
		if (isTable) {
			draggedElem.style.left = aa_absLeft(list) + 'px';
		}
			
		if (elemAtMousePos == spaceElem) return aa_stop_prop(e);

		// element nearest to space elem
		var candidate = elemAtMousePos;
		if (!candidate) return aa_stop_prop(e); // can be fixed so the external elem will be the candidate
		while (true) {
			var closer_element = elemsBetween(candidate,spaceElem);
			if (!closer_element) break;
			candidate = closer_element;
		}

		if (isTable) {
			if (candidate.nextSibling && candidate != list.firstChild)
			  list.insertBefore(spaceElem,candidate.nextSibling);
			else 
			  list.insertBefore(spaceElem,candidate);
		} else {
			var margin = 3;
			if (candidate.offsetLeft <= spaceElem.offsetLeft && candidate.offsetLeft + margin > draggedElem.offsetLeft) // left to us - insert before
				list.insertBefore(spaceElem,candidate);
			else if (candidate.offsetLeft >= spaceElem.offsetLeft && candidate.offsetLeft + candidate.offsetWidth - margin > draggedElem.offsetLeft && candidate.nextSibling) // right to us - insert after
				list.insertBefore(spaceElem,candidate.nextSibling);
		}
		
		return aa_stop_prop(e);
	}
	function dragEnd(e,cancel) {
		list.removeChild(draggedElem);
		if (!cancel)
			jQuery(spaceElem).replaceWith(OriginalElem);
		else
			list.removeChild(spaceElem);
		OriginalElem.style.display = '';
		OriginalElem.display = '';
		

		list.onmousemove = onmousemoveOrig;
		list.style.position = listOriginalPosition;
		document.onkeydown = onkeydownOrig;
		document.onmouseup = null;
		draggedElem = null;
		
		var nextElem = null;
		for(var elem=OriginalElem.nextSibling;elem;elem=elem.nextSibling) {
			if (settings.isItemElement(elem)) {
				nextElem = elem;
				break;
			}
		}
		
		try {
			if (nextElem) 
				settings.moveBefore(OriginalElem,nextElem)
			else 
				settings.moveToEnd(OriginalElem);
		} catch(e) {
			ajaxart.logException(e,'Could not complete drag and drop in the model');
		}
		
	    DAndDOwner = "";
		return aa_stop_prop(e);
	}
	function dragBegin(item_elem,e) {
	    ajaxart_disableSelection(list);
	    DAndDOwner = "DragAndDropItems";
	    var posx = aa_absLeft(item_elem);
		var posy = aa_absTop(item_elem);
		var offsetParent = listTopDiv;
		var posyDelta = aa_absTop(offsetParent);
		
		draggedElem = item_elem.cloneNode(true);
		OriginalElem = item_elem;
		list.appendChild(draggedElem);
		spaceElem = item_elem.cloneNode(true);
		list.insertBefore(spaceElem,OriginalElem);
		
		OriginalElem.style.display = 'none';
		OriginalElem.display = 'none';

		jQuery(draggedElem).addClass(settings.draggedCssClass);
		jQuery(spaceElem).addClass(settings.draggedSpaceCssClass);

		if (isTable) {
			var tds = jQuery(draggedElem).find('>td');
			for(var i=0;i<tds.length;i++)
				jQuery(tds[i]).width(jQuery(tds[i]).width());
		}
		
		draggedElem.style.position = 'absolute';
		
		var mousepos = SuspectItemDrag.mousePos;
//		draggedElem.initialMouseOffset = { top: mousepos.y - posy, left: mousepos.x - posx } ;
		draggedElem.initialMouseOffset = { top: mousepos.y - posy - posyDelta, left: mousepos.x - posx } ;
		draggedElem.style.left = posx + 'px';
		draggedElem.style.top = (posy - posyDelta) + 'px';

		document.onmouseup = dragEnd;
		onkeydownOrig = document.onkeydown; 
		document.onkeydown = function(e)
		{
			if (e.keyCode == 27) 
				dragEnd(e,true);
			return true;
		}
		
		return aa_stop_prop(e);
	}

	function suspectDrag(e) {
		if (DAndDOwner != "") return true;
		if (settings.canStartDrag && !settings.canStartDrag(e.clientX,e.clientY)) return;
		
	    listTopDiv = list.tagName.toLowerCase() == 'div' ? list : jQuery(list).closest('div')[0];

		listOriginalPosition = listTopDiv.style.position;
		listTopDiv.style.position = 'relative';
		
		SuspectItemDrag = { mousePos : aa_mousePos(e,true), time: new Date().getTime()};
		onmousemoveOrig = list.onmousemove;
		list.onmousemove = drag;
		return true;
	}

	function unSuspectDrag(e) {
		if (DAndDOwner != "") return true;
	  	ajaxart_restoreSelection(list);
		if (SuspectItemDrag)
		{
			SuspectItemDrag = null;
			list.onmousemove = onmousemoveOrig;
			listTopDiv.style.position = listOriginalPosition;
		}
		return true;
	}
}

function aa_dragAndDropPane(settings)
{
	var element = settings.element;
	var jElem = jQuery(settings.element);
	
	jElem.css('oveflow','hidden').css('width',settings.baseSize+'px');
	
	element.onmousedown = function(e) {
		makeAbsolutePosition();
		element.jbDragging = true;
		element.jbDragStartX = e.pageX;
		element.jbDragStartWidth = jElem.width(); 
			
		jElem.find('img').bind('dragstart', function(event) { event.preventDefault(); });
//		var newWidth = jElem.jbNewWidth ? settings.baseSize : 800;
//		jElem.jbNewWidth = ! jElem.jbNewWidth;
//		var screenWidth = window.innerWidth || (document.documentElement.clientWidth || document.body.clientWidth);
//		var left = screenWidth - newWidth; 
//		jElem.animate({ left: left+'px', width: newWidth });
	}
	
	element.onmouseup = function(e) {
		element.jbDragging = false;
	}
	
	element.onmousemove = function(e) {
		if (!element.jbDragging) return;
		var x = e.pageX;
		var deltaX = element.jbDragStartX - x;

		var newWidth = element.jbDragStartWidth + deltaX;
		var screenWidth = window.innerWidth || (document.documentElement.clientWidth || document.body.clientWidth);
		jElem.width(newWidth).css('left',screenWidth-newWidth+'px');
	}
	
	function makeAbsolutePosition() {
		if (element.jbMadePositionAsbolute) return;
		element.jbMadePositionAsbolute = true;  
		var left = aa_absLeft(element);
		jElem.css('position','absolute').css('left',left);
	}
}




aa_gcs("itemlist", {
	XmlItems: function (profile, data, context) {
		var parent = aa_first(data,profile,'ParentXml',context);
		if (!parent) return [];
		var tag = aa_text(data,profile,'Tag',context);
		var items = aa_xpath(parent,tag);
		if (aa_paramExists(profile,'Filter')) {
			var newitems = [];
			for(var i=0;i<items.length;i++)
				if ( aa_bool([items[i]],profile,'Filter',context) )
					newitems.push( items[i] );
			
			items = newitems;
		}
		items.onAddItem = function(item) {
			if (item.nodeType == 1) {
				parent.appendChild(item);
			} else {
				ajaxart.log('trying to add non xml item to XmlItems','error');
			}
		}
		items.MoveBefore = function(item,beforeItem) {
			parent.insertBefore(item,beforeItem);
			ajaxart.xml.xml_changed(parent);
		}
		items.MoveToEnd = function(item) {
			parent.appendChild(item);
			ajaxart.xml.xml_changed(parent);
		}
		return items;
	}
});
aa_gcs("field", {
    ItemList: function (profile, data, context) 
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
        	
            var isTriplet = (field.View && field.View.IsTriplet);

            var itemlist = aa_ItemList(field,ctx2,data1);
            itemlist.Fields = ajaxart.runsubprofiles(data, profile, 'Field', aa_merge_ctx(context, ctx2));
            itemlist.VisibleFields = [];
            for(var i=0;i<itemlist.Fields.length;i++) {
	        	if (itemlist.Fields[i].CalculatedOnly) itemlist.Fields[i].Calculate(data1,ctx2);
                if (itemlist.Fields[i].IsFieldHidden && itemlist.Fields[i].IsFieldHidden(data1,ctx) ) continue;
            	itemlist.VisibleFields.push(itemlist.Fields[i]);
            }
			jBart.trigger(field,'InnerFields',{ Context: ctx2, FieldData: data1, Fields: itemlist.VisibleFields });
			
            if (isTriplet) {
                itemlist.SetHtmlTemplate(field.View.Html);
                aa_apply_style_js(itemlist, field.View);
                itemlist.jControl.addClass(aa_attach_global_css(field.View.Css));
            }

            jBart.trigger(field, 'initItemList', itemlist); // allows aspects to alter the itemlist (e.g. incremental build)

            itemlist.Refresh();
            itemlist.jControl[0].jbContext = ctx2;
            
            if (field.SectionStyle) return [ aa_wrapWithSection(itemlist.jControl[0],field,field.SectionStyle,data1,ctx) ];
            return itemlist.jControl.get();
        }
        ajaxart.runsubprofiles(data, profile, 'FieldAspect', ctx);

        return [field];
    },
    DragAndDropItemsHandle: function(profile,data,context) {
        var field = {
          Id: aa_text(data,profile,'ID',context),
          Title: aa_multilang_text(data,profile,'Title',context),
          Style: aa_first(data,profile,'Style',context)
        };
        field.ID = [field.Id];
        field.Control = function(field_data,ctx) {
            if (ctx.vars.ItemList) {
                if (ctx.vars.ItemList && !ctx.vars.ItemList[0].DragAndDropInitiated) {
                    ctx.vars.ItemList[0].DragAndDropInitiated = true;
                    var itemlist = ctx.vars.ItemList[0];
                    var draggedCssClass = aa_attach_global_css( aa_text(data,profile,'CssForDraggedElement',context) , null, 'draggedItem' );
                    var draggedSpaceCssClass = aa_attach_global_css( aa_text(data,profile,'CssForDraggedSpace',context) , null, 'draggedItemSpace' );

                    var items = itemlist.itemlistCntr.Items;
                    if (!items.MoveBefore) {
                        ajaxart.log("DragAndDropItemsHandle : itemlist does not support moving items","error");
                        return [ document.createElement("div") ];
                    }
                    
                    aa_dragDropItems({
                        parent: itemlist.ParentOfItems,
                        isItemElement: function(elem) { return elem.Item != null; },
                        moveBefore: function(elem,beforeElem) {
                            items.MoveBefore(elem.Item[0],beforeElem.Item[0]);
                        },
                        moveToEnd: function(elem) {
                            items.MoveToEnd(elem.Item[0]);
                        },
                        draggedSpaceCssClass: draggedSpaceCssClass,
                        draggedCssClass: draggedCssClass,
                        canStartDrag: function(mouseX,mouseY) {
                            var elem = document.elementFromPoint(mouseX, mouseY);
                            if (jQuery(elem).hasClass('fld_' + field.Id))
                                return true;
                            else if (jQuery(elem).parents(".fld_" + field.Id).length && 
                                jQuery(elem).parents(".fld_" + field.Id).parents().is(itemlist.Ctrl))
                                return true;
                            else 
                                return false;
                        }
                    });
                }
            }
            if (ctx.vars.ItemList[0].itemlistCntr.Items.MoveBefore) {   // support D&D
                var ctx2 = aa_merge_ctx(context,ctx);
                return [aa_renderStyleObject(field.Style,{},ctx2,true)];
            } else return [ document.createElement("div")];
        }
        ajaxart.runsubprofiles(data,profile,'FieldAspect',aa_ctx(context,{_Field: [field]}));
        
        return [field];
    }
});
aa_gcs("field_aspect", {
	ItemListContainer: function (profile, data, context) {
		var field = context.vars._Field[0];
		jBart.bind(field,'ModifyInstanceContext',function(args) {
			var items = ajaxart.run(args.FieldData, profile, 'Items', context);
            args.Context.vars.ItemListCntr = [aa_itemlistContainer(items,field.Id)];
            
            jBart.trigger(field,'initItemlistCntr',args.Context.vars.ItemListCntr[0]);
		});
		field.hasItemlistContainer = true;
    },
    CustomizeTableHeader: function (profile, data, context) {
		var field = context.vars._Field[0];
    	var cssClass = aa_attach_global_css( aa_text(data,profile,'Css',context) , null, field.Id+'_header' );
    	var colspan = aa_int(data,profile,'ColSpan',context);
    	
		jBart.bind(field,'ModifyTableHeader',function(args) {
			jQuery(args.th).addClass(cssClass);
			if (colspan) jQuery(args.th).attr('colspan',colspan);
		},'CustomizeTableHeader');
    },
    ShowOnlyOnItemHover: function (profile, data, context) {
		var field = context.vars._Field[0];
		var css = aa_text(data,profile,'Css',context);
		var thisSelector = '.fld_'+field.Id;
        if (thisSelector.indexOf(' ') > -1) {
            ajaxart.log('field must have a valid id ' + field.Id,'error');
        }
		
		jBart.bind(field,'ModifyControl',function(args) {
			var itemlistId = args.Context.vars.ItemListCntr[0].Id;
			var itemSelector = '.fld_'+ itemlistId + ' .aa_item';

            var finalCss = css.replace(/#item/g,itemSelector).replace(/#this/g,thisSelector);
            if (!window.aa_container_styles) window.aa_container_styles = {};
            if (!aa_container_styles[finalCss]) {
                var styleElem=jQuery("<style>" + finalCss + "</style>")[0];
                document.getElementsByTagName("head")[0].appendChild(styleElem);
                aa_container_styles[finalCss] = { globalcss: finalCss };
            }
		},'ShowOnlyOnItemHover');
    }
});

aa_gcs("itemlist_aspect", {
    ItemSelection: function (profile, data, context) 
    {
		var selectionClass = aa_attach_global_css( aa_text(data,profile,'Css',context) , null, 'selected' ) + ' aa_selected';
		var mouseSupport = aa_text(data,profile,'MouseSupport',context);
		var alwaysOneSelected = aa_bool(data,profile,'AlwaysOneSelected',context);
		var hasSelectedByDefault = aa_paramExists(profile,'SelectedByDefault');
        jBart.bind(context.vars._Field[0], 'initItemList', function (itemlist) 
        {
        	var ItemListCntr = itemlist.itemlistCntr;
        	
        	ItemListCntr.SetNewSelected = function(selectedElement) {
        		var prevSelectedElement = ItemListCntr.SelectedElement; 
        		if (prevSelectedElement == selectedElement) return;
        		ItemListCntr.SelectedElement = selectedElement;

        		var args = { 
        			PrevSelectedElem: prevSelectedElement, 
        			PrevSelectedItem: prevSelectedElement && prevSelectedElement.Item,
        			SelectedElem: ItemListCntr.SelectedElement, 
        			SelectedItem: ItemListCntr.SelectedElement && ItemListCntr.SelectedElement.Item
            	};
        		ItemListCntr.trigger('showSelection',args);
        		ItemListCntr.trigger('selectionChanged',args);
        	}
        	ItemListCntr.bind('showSelection',function(selectionArgs) {
        		if (selectionArgs.PrevSelectedElem)
        			jQuery(selectionArgs.PrevSelectedElem).removeClass(selectionClass);
        		
        		jQuery(selectionArgs.SelectedElem).addClass(selectionClass);
        	},'ItemSelection');

        	ItemListCntr.SelectionKeyDown = function(e) { ItemListCntr.trigger('selectionKeyDown',e); }
        	ItemListCntr.bind('selectionKeyDown',function(e) {
        		var current = ItemListCntr.SelectedElement;
        		var isDown = e.keyCode == 40, isUp = e.keyCode == 38;
        		var elements = itemlist.GetElements();
        		var index = -1;
        		for(var i=0;i<elements.length;i++) {
        			if (elements[i]==current) {
        				index = i;
        				break;
        			}
        		}
        		var newSelected = elements[0];
       			if (isDown && index+1<elements.length) newSelected = elements[index+1];
       			if (isUp && index-1>=0) newSelected = elements[index-1];
       			
       			ItemListCntr.SetNewSelected(newSelected);
        	},'ItemSelection');

        	if (aa_paramExists(profile,'OnSelect',true)) {
        		ItemListCntr.bind('selectionChanged',function(selectionArgs) {
        			var item = selectionArgs.SelectedItem;
        			var ctx = aa_ctx(itemlist.Context,{ ControlElement: selectionArgs.SelectedElem });
	        		ajaxart.run(item,profile,'OnSelect',aa_merge_ctx(context,ctx));
	        	},'ItemSelection');
        	}
        	
        	if (mouseSupport != 'none') {
        		itemlist.bind('itemElement',function(element) {
        			var evt = 'mousedown';
        			if (mouseSupport == 'mouse click') evt = 'click';
        			if (mouseSupport == 'mouse hover') evt = 'mouseover';
        			
        			jQuery(element).bind(evt,function() {
        				ItemListCntr.SetNewSelected(element);
        			});
        		},'ItemSelection');
        	}
        	
        	function ensureOneSelected() {
        		if (ItemListCntr.SelectedElement) return;
				var elements = itemlist.GetElements();
				if (elements[0]) ItemListCntr.SetNewSelected( elements[0] );
        	}
        	function selectByDefault() {
        		var selectedItem = aa_first(ItemListCntr.Items,profile,'SelectedByDefault',context);
        		var elements = itemlist.GetElements();
        		for(var i=0;i<elements.length;i++) {
        			if (elements[i].Item[0] == selectedItem) {
        				ItemListCntr.SetNewSelected( elements[i] );
        				return;
        			}
        		}
        	}
        	
    		itemlist.bind('refresh',function() {
    			ItemListCntr.SelectedElement = null;
    			if (hasSelectedByDefault) selectByDefault();
    			if (alwaysOneSelected) ensureOneSelected();
    		});
        	itemlist.bind('refreshItemElement',function(args) {
        		if (ItemListCntr.SelectedElement == args.PreviousElement) {
        			ItemListCntr.SetNewSelected(args.NewElement);
        		}
        	});
        	
    		if (alwaysOneSelected) {
	        	ItemListCntr.bind('afterItemDeleted',function(args) {
	        		if (args.ItemElement == ItemListCntr.SelectedElement) {
	        			ItemListCntr.SelectedElement = null;
	        			ensureOneSelected();
	        		}
	        	},'ItemSelection');
	        	ItemListCntr.bind('afterItemAdded',function(args) {
	        		if (!ItemListCntr.SelectedElement) ensureOneSelected();
	        	},'ItemSelection');
    		}
    		
        },'ItemSelection');
    },
    UpdateOnAddOrDeleteItem: function (profile, data, context) 
    {
        jBart.bind(context.vars._Field[0], 'initItemList', function (itemlist) 
        {
        	ItemListCntr = itemlist.itemlistCntr;
        	
        	ItemListCntr.bind('itemDeleted',function(args) {
        		itemlist.ParentOfItems.removeChild( args.ItemElement );
        	},'UpdateOnAddOrDeleteItem');
        	
        	ItemListCntr.bind('itemAdded',function(args) {
                var elem = itemlist.ElementOfItem(args.Item);
                args.ItemElement = elem;
                itemlist.AppendItemElement(elem);
                aa_ensure_visible(elem);
        	},'UpdateOnAddOrDeleteItem');
        	
        },'UpdateOnAddOrDeleteItem');
    },
    RefreshOnItemsChange: function (profile, data, context)
    {
    	var field = context.vars._Field[0];
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
			if (!ctx.vars.ItemListCntr) return;
			var ItemListCntr = ctx.vars.ItemListCntr[0];
			ItemListCntr.bind('itemsChanged',function() {
				aa_refresh_cell(cell,ctx);
			},'RefreshOnItemsChange'+field.Id);
			
		},'RefreshOnItemsChange');    	
    },
    CssForItem: function (profile, data, context)
    {
    	var cssClass = aa_attach_global_css( aa_text(data,profile,'Css',context) , null, 'item' );
    	jBart.bind(context.vars._Field[0],'initItemList',function(itemlist) {
    		itemlist.bind('itemElement',function(element) {
    			if (aa_bool(element.Item,profile,'ConditionOnItem',context))
    				jQuery(element).addClass(cssClass);
    		});
    	});    	
    },
    ItemClick: function (profile, data, context)
    {
    	jBart.bind(context.vars._Field[0],'initItemList',function(itemlist) {
    		itemlist.bind('itemElement',function(element) {
    			jQuery(element).click(function() {
    				ajaxart.run(element.Item,profile,'OnClick',aa_ctx(context,{ ControlElement: [element]}));
    			});
    		},'ItemClick');
    	},'ItemClick');    	
    },
    RefreshOnSelectionChange: function (profile, data, context)
    {
    	var field = context.vars._Field[0];
    	var animation = aa_first(data,profile,'Animation',context);
    	var hideWhenNoSelection = aa_bool(data,profile,'HideWhenNoSelection',context);
    	
    	if (aa_bool(data,profile,'SelectedItemAsData',context)) {
    		field.FieldData = function(data1,ctx) {
    			return ctx.vars.SelectedItem || [];
    		}
    	}
    	
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
			if (!ctx.vars.ItemListCntr) return;
			var ItemListCntr = ctx.vars.ItemListCntr[0];
			
			function refresh(firstTime) {
				var selElement = ItemListCntr.SelectedElement ? [ItemListCntr.SelectedElement] : [];
				var selItem = ItemListCntr.SelectedElement ? ItemListCntr.SelectedElement.Item : [];
				
				var ctx2 = aa_ctx(field.XtmlSource[0].context,{ SelectedElement: selElement, SelectedItem: selItem, ItemListCntr: [ItemListCntr] });
				var newField = aa_first(field.XtmlSource[0].input,field.XtmlSource[0].script,'',ctx2);
				cell.Field = newField; 
				var transition = firstTime ? null : animation;
				aa_refresh_cell(cell,ctx2,transition);
				
				if (hideWhenNoSelection && !selElement && cell.firstChild) jQuery(cell.firstChild).css('display','none');
			}
			
			ItemListCntr.bind('selectionChanged',function() {
				refresh();
			},'SelectionContext_'+field.Id);
			
			if (ItemListCntr.SelectedElement) {
				if (!context.vars.SelectedElement || context.vars.SelectedElement[0] != ItemListCntr.SelectedElement ) 
					refresh(true);
			} else {
				if (hideWhenNoSelection && cell.firstChild) jQuery(cell.firstChild).css('display','none');
			}
			
		},'RefreshOnSelectionChange');
    },
    Filter: function(profile,data,context)
    {
        var field = context.vars._Field[0];
        field.FieldData = function(data1,ctx) {
            return aa_xpath(data1[0],'@'+field.Id,true);   // TODO: Talk about it with Shai to understand the limitations
        };
        field.FilterData = function(data1,ctx) {
            return ajaxart.run(data1,profile,'FieldData',context);
        };
        field.InitFilter = function(itemListCntr) {
	    	aa_initContainerFilters(itemListCntr);
	    	if (itemListCntr.Filters[field.Id]) return; // already initialized
	    	
	    	var filterObject = {
	    		Id: field.Id,
	    		FieldData: function(item) {
	    			return ajaxart.run([item],profile,'FieldData',context);
	    		},
	    		FilterType: aa_first(data,profile,'FilterType',context)
	    	}
	    	itemListCntr.AddFilter(filterObject);
    	}
		aa_field_handler(field,'ModifyControl', function(wrapper,field_data,cell_presentation,ctx,item) {
	    	if (!ctx.vars.ItemListCntr) return;
	    	var ItemListCntr = ctx.vars.ItemListCntr[0];
	    	wrapper.jbItemListCntr = ItemListCntr;
	    	wrapper.jbQueryXml = ctx.vars._ItemListQueryXml[0];
	    	
	    	field.InitFilter(ItemListCntr);
		},'Filter');
		
    	if (aa_bool(data,profile,'FilterOnChange',context)) {
			aa_field_handler(field,'OnUpdate',function(field,field_data,input,e,extra){
				var cell = input.parentNode;
                if (aa_intest) { runQuery(cell); }
                else {
                    if (cell.jbItemListCntr.filterTimeoutID) clearTimeout(cell.jbItemListCntr.filterTimeoutID);
                    cell.jbItemListCntr.filterTimeoutID = setTimeout(function() { runQuery(cell); },200);
                }
			},'Filter');    		
    	}
    	
    	if (context.vars.ItemListCntr) {
    		// for dt preview
    		var item = context.vars.ItemListCntr[0].Items[0];
    		if (item) ajaxart.run([item],profile,'FieldData',context);
    	}

        function runQuery(cell) {
            cell.jbItemListCntr.RunQuery(cell.jbQueryXml);
        }
    },
    TableColumnDragAndDrop: function(profile,data,context)
    {
    	var field = context.vars._Field[0];
    	var draggedCssClass = aa_attach_global_css( aa_text(data,profile,'CssForDraggedElement',context) , null, 'draggedColumn' );
    	var draggedSpaceCssClass = aa_attach_global_css( aa_text(data,profile,'CssForDraggedSpace',context) , null, 'draggedColumnSpace' );
    	
    	jBart.bind(field,'initItemList',function(itemlist) {
	    	var table = jQuery(itemlist.Ctrl).find('table')[0];
	    	if (!table && itemlist.Ctrl.tagName.toLowerCase() == 'table') table = itemlist.Ctrl;
	    	if (!table) return;
	    	
	    	var reorderHappened = false;
	    	
	    	var permutation = [];
	    	
	    	aa_dragAndDropTableColumns(table,{
    			draggedSpaceCssClass: draggedSpaceCssClass,
    			draggedCssClass: draggedCssClass,
    			onDrop: function(dragIndex,dropIndex) {
	    			reorderHappened = true; 
	    			var maxIndex = Math.max(dragIndex,dropIndex);
	    			if (permutation.length < maxIndex) {
	    				for(var i=permutation.length;i<=maxIndex;i++)
	    					permutation[i] = i;
	    			}
	    			var x = permutation[dropIndex];
	    			permutation[dropIndex] = permutation[dragIndex];
	    			permutation[dragIndex] = x;
	    		}
    		});
	    	
	    	itemlist.bind('itemElement',function(itemElement) {
	    		if (!reorderHappened) return;
	    		// we need to reorder the tds by the drag and drop order
	    		var tds = jQuery(itemElement).find('>td');
	    		for(var index=0;index<tds.length;index++) {
	    			var nextIndex = (index < permutation.length) ? permutation[index] : index;
	    			var nextTD = tds[nextIndex];
	    			itemElement.appendChild(nextTD);
	    		}
	    	});
    	},'TableColumnDragAndDrop');
    },
    DragAndDropItems: function(profile,data,context)
    {
    	var field = context.vars._Field[0];
    	var draggedCssClass = aa_attach_global_css( aa_text(data,profile,'CssForDraggedElement',context) , null, 'draggedItem' );
    	var draggedSpaceCssClass = aa_attach_global_css( aa_text(data,profile,'CssForDraggedSpace',context) , null, 'draggedItemSpace' );

    	jBart.bind(field,'initItemList',function(itemlist) {
    		var items = itemlist.itemlistCntr.Items;
    		if (!items.MoveBefore) return;
    		
    		aa_dragDropItems({
    			parent: itemlist.ParentOfItems,
    			isItemElement: function(elem) { return elem.Item != null; },
    			moveBefore: function(elem,beforeElem) {
    				items.MoveBefore(elem.Item[0],beforeElem.Item[0]);
    			},
    			moveToEnd: function(elem) {
    				items.MoveToEnd(elem.Item[0]);
    			},
    			draggedSpaceCssClass: draggedSpaceCssClass,
    			draggedCssClass: draggedCssClass
    		});
    	});    	
    },
    LongList: function(profile,data,context)
    {
    	var field = context.vars._Field[0];
    	var style = aa_first(data,profile,'Style',context);
    	var maxTimeToRenderItems = aa_int(data,profile,'MaxTimeToRenderItems',context);
    	var showMoreText = aa_multilang_text(data,profile,'TextForShowMore',context);
    	
    	jBart.bind(field,'initItemList',function(itemlist) {
    	    itemlist.ShowItems = function (fromIndex) {
    	    	if (itemlist.ShowMoreItems) {
    	    		itemlist.ShowMoreItems.detach();
    	    		itemlist.ShowMoreItems = null;
    	    	}
    	    	fromIndex = fromIndex || 0;
    	    	var startTime = new Date().getTime();
    	    	
    	        var items = this.itemlistCntr.Items;
    	        // Incremental build is done by an aspect - this code is simple rendering
    	        for (var i = fromIndex; i < items.length; i++) {
    	            var item = [items[i]];
    	            var elem = itemlist.ElementOfItem(item);
    	            this.AppendItemElement(elem);
    	            
    	            if ( new Date().getTime() - startTime > maxTimeToRenderItems) {
    	            	itemlist.ShowMoreItems = aa_renderStyleObject(style,{ 
    	            		nextIndex: i+1,
    	    				text: showMoreText,
    	    				attachShowMore: function(parent) {
    	            			parent.appendChild( this.control );
    	            		},
    	            		detach: function() {
    	            			aa_remove(this.control);
    	            		},
    	            		showMore: function() {
    	            			itemlist.ShowItems(this.nextIndex);
    	            		}
    	    			},context);
    	            	
    	            	itemlist.ShowMoreItems.attachShowMore(itemlist.ParentOfItems);
    	            	
    	            	return;
    	            }
    	        }
    	    }
    	});    	
    },
    ShowTextWhenNoItems: function(profile,data,context)
    {
    	var field = context.vars._Field[0];
    	var style = aa_first(data,profile,'Style',context);
    	
    	jBart.bind(field,'initItemList',function(itemlist) {
    		var itemListCntr = itemlist.itemlistCntr;
    		var parent = itemlist.ParentOfItems;
    		if (!parent) return;
    		
    		var no_items_text = aa_multilang_text(data,profile,'Text',context);
    		var label = aa_renderStyleObject(style,{ text: no_items_text, data: no_items_text },context);
    		
    		var isTable = parent.tagName.toLowerCase() == 'tbody';
    		var noItemsElement = label;
    		
    		if (isTable) {
        		var cols = itemlist.VisibleFields.length;
        		noItemsElement = jQuery('<tr class="aa_noitems"><td colspan="' + cols + '" class="td_nocontent"/></tr>')[0];
        		jQuery(noItemsElement).find('>td').append( label );
    		} 
    		
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
    },
    SelectedItemByFilter: function(profile,data,context)
    {
    	var items = data;
    	for(var i=0;i<items.length;i++)
    		if (aa_bool([items[i]],profile,'Filter',context))
    			return [items[i]];
    },
    FilterGroup: function(profile,data,context)
    {
		var field = context.vars._Field[0];
		field.IsFilterGroup = true; 
		field.FieldData = function() {
			return [jBart.parsexml('<query />')];
		}
		jBart.bind(field,'ModifyInstanceContext',function(args) {
            args.Context.vars._ItemListQueryXml = args.FieldData; 
		});
		
		jBart.bind(field,'ModifyControl',function(args) {
			var content = args.Wrapper.jbContent || args.Wrapper.firstChild;
			var ctx = content.jbContext;
			var queryXml = ctx.vars._ItemListQueryXml && ctx.vars._ItemListQueryXml[0];
			var itemlistcntr = ctx.vars.ItemListCntr && ctx.vars.ItemListCntr[0];
			
			if (queryXml && aa_notEmptyQuery(queryXml) && itemlistcntr && itemlistcntr.RunQuery) {
				itemlistcntr.RunQuery(queryXml);
			}
		});
    }
});

aa_gcs("itemlist_filter", {
	Text: function (profile, data, context) 
    {
		return [{
			FieldDataToColumnData: function(fieldData) {
				return aa_totext(fieldData).toLowerCase();
			},
			PrepareQueryData: function(expression) {
				return expression.toLowerCase();
			},
			Match: function(queryData,columnData) {
				if (columnData.indexOf(queryData) > - 1) return true;
				return false;
			},
			HighlightSelectedText: function(control,highlightClass,queryData) {
  				var pattern = queryData;
  				
				if (control.innerHTML.toLowerCase().indexOf(pattern) != -1)
				   control.innerHTML = ajaxart_field_highlight_text(control.innerHTML,pattern,highlightClass);
			}
		}];
    },
    ExactMatch: function (profile, data, context) 
    {
    	return [{
    		FieldDataToColumnData: function(fieldData) {
    			return aa_totext(fieldData);
	    	},
	    	PrepareQueryData: function(expression) {
	    		return expression;
	    	},
	    	Match: function(queryData,columnData) {
	    		return (columnData == queryData);
	    	}
    	}];
    },
    ValuesFromItems: function (profile, data, context)
    {
    	var field = context.vars._Field[0]; 
    	field.RecalculateForEachCell = true; // so ItemListCntr will be available 
    	if (!context.vars.ItemListCntr || !field.InitFilter) return;
    	var itemListCntr = context.vars.ItemListCntr[0];
    	var filterId = field.Id;
    	
    	var options = [],uniqueNames = {};
    	// look in filter values
    	field.InitFilter(itemListCntr);
    	var dataCol = itemListCntr.DataColumns[filterId];
    	for(var i=0;i<dataCol.length;i++) {
    		var val = dataCol[i];
    		if (uniqueNames[val]) {
    			uniqueNames[val]++;
    			continue;
    		}
    		uniqueNames[val] = 1;
    		options.push({ code: val });
    	}
    	
    	return [{ Options: options } ];
    },
    Occurrences: function (profile, data, context)
    {
    	var field = context.vars._Field[0]; 
    	field.OccurrencesStyle = aa_first(data,profile,'Style',context);
    	var filteredOccurrences = aa_bool(data,profile,'ShowFilteredOccurrences',context);
		var filterId = field.Id;
    	
    	field.OccurrencesCtrl = function(data1,ctx) {
    		var itemlistCntr = ctx.vars.ItemListCntr[0];
    		
        	aa_calculateFilterOccurrences(itemlistCntr,filterId,filteredOccurrences);
        	var code = data1[0].code;
        	
			var count = itemlistCntr.Occurrences[filterId][code] || 0;
			var filteredCount = filteredOccurrences ? itemlistCntr.FilteredOccurrences[filterId][code] || 0 : count;
			
			var out = aa_renderStyleObject(field.OccurrencesStyle,{ 
				count: count,
				filteredOccurrences: filteredOccurrences,
				filteredCount: filteredCount
			},ctx);
			return out;
		}
    	
    	if (aa_bool(data,profile,'SortByOccurrences',context)) {
        	field.RecalcOccurrences = function(options,ctx) {
        		var itemlistCntr = ctx.vars.ItemListCntr[0];
            	aa_calculateFilterOccurrences(itemlistCntr,filterId,filteredOccurrences);
            	
            	if (filteredOccurrences)
            		if (!itemlistCntr.FilteredOccurrences || !itemlistCntr.FilteredOccurrences[filterId]) 
            			filteredOccurrences = false;
            	
        		// add occ to the options
        		for(var i=0;i<options.Options.length;i++) {
        			var option = options.Options[i];
        			var code = option.code;
        			option.occ = filteredOccurrences ? itemlistCntr.FilteredOccurrences[filterId][code] : itemlistCntr.Occurrences[filterId][code];
        			option.occ = option.occ || 0;
        		}
   				options.Options.sort(function(a,b) { return b.occ - a.occ; });
        	}
    	}
    }
});

aa_gcs("itemsort", {
	SortItems: function (profile, data, context) 
	{
		var sortDirection = aa_text(data,profile,'SortDirection',context);
		var sortType = aa_first(data,profile,'SortType',context);
		var field = context.vars._Field[0];
		
		aa_register_init_itemlistCntr(field,function(itemListCntr) {
			itemListCntr.bind('sortItems',doSort,'SortItems');
			
			function doSort() {
				aa_sort_items(itemListCntr,{
					direction: sortDirection,
					sortType: sortType,
					itemValue: function(item) {
						return ajaxart.run(item,profile,'ItemValueToSort',context);
					},
					context: context
				});
			}

			jBart.bind(field,'InnerFields',function(args) {
				doSort();
			},'SortItems_InnerFields');
						
		},'SortItems');
	},
	Lexical: function (profile, data, context)
	{
		return [{
			compileValue: function(value) {
				return aa_totext(value).toLowerCase();
			},
			sort: function(a,b) {
				if (a.value > b.value) return -1;
				if (a.value == b.value) return 0;
				return 1;
			}
		}];
	},
	Numeric: function (profile, data, context)
	{
		return [{
			compileValue: function(value) {
				return parseInt( aa_totext(value) );
			},
			sort: function(a,b) { return a.value-b.value; }
		}];
	},
	PromoteValues: function (profile, data, context)
	{
		var promoted = aa_split( aa_text(data,profile,'ValuesToPromote',context), ',',true);
		var promotedIndex = {};
		for(var i=0;i<promoted.length;i++)
			promotedIndex[promoted[i]] = i+1;
			
		var maxIndex = promoted.length+1;
		
		return [{
			compileValue: function(value) { return aa_totext(value); },
			sort: function(a,b) {
				var aIndex = promotedIndex[a.value] || maxIndex;
				var bIndex = promotedIndex[b.value] || maxIndex;
				
				return aIndex - bIndex; 
			}
		}];
		
	},
	TableColumnSort: function (profile, data, context)
	{
    	var field = context.vars._Field[0];
    	var defaultSortType = aa_first(data,profile,'DefaultSortType',context);
    		
    	jBart.bind(field,'initItemList',function(itemlist) {
	    	var table = jQuery(itemlist.Ctrl).find('table')[0];
	    	
	    	aa_tableColumnSort(table,{ doSort: clickOnTh});
	    	itemlist.itemlistCntr.bind('sortItems',doSort,'TableColumnSort');
	    	
	    	var sortSettings = {
	    		context: context,
	    		itemValue: function(data1) { return data1; }
	    	}
	    	
	    	function clickOnTh(th,direction) {
	    		if (th) {
		    		var field = th.jbField;
		    		sortSettings.direction = direction;
		    		sortSettings.sortType = field.SortType || defaultSortType;
		    		sortSettings.itemValue = function(item) {
		    			return field.FieldData(item,context);
		    		}
	    		} else {
	    			// clear sort
	    			sortSettings.sortType = null;
	    		}
	    		
	    		doSort();
	    	}
	    	
	    	function doSort() {
	    		if (sortSettings.sortType)
	    			aa_sort_items(itemlist.itemlistCntr,sortSettings);
	    		else
	    			aa_unsort_items(itemlist.itemlistCntr);
	    			
	    		itemlist.Refresh();
	    	}
    	},'TableColumnSort');		
	}
});

aa_gcs("itemlist_item", {
	ItemOfList: function (profile, data, context)
	{
		var elem = aa_first(data,profile,'Item',context);
		if (!elem) return [];
		if (aa_text(data,profile,'Result',context) == 'element') return [elem];
		return elem.Item;
	},
	ItemInContext: function (profile, data, context) 
    {
		var elem = context.vars.ControlElement && context.vars.ControlElement[0];
		for(;elem && elem.nodeType == 1;elem = elem.parentNode) {
			if (elem.jbItemElement) return [elem.jbItemElement];
			if (jQuery(elem).hasClass('aa_item')) return [elem];
		}
    },
	SelectedItem: function (profile, data, context) 
	{
		var itemListCntr = context.vars.ItemListCntr && context.vars.ItemListCntr[0];
		if (!itemListCntr || !itemListCntr.SelectedElement) return [];
		return [itemListCntr.SelectedElement];
	}
});

aa_gcs("itemlist_action", {
	DeleteItem: function (profile, data, context) 
	{
        var itemElement = aa_first(data,profile,'Item',context);
        var ItemListCntr = context.vars.ItemListCntr && context.vars.ItemListCntr[0];
		// var ItemListCntr = context.vars.ItemListCntr && context.vars.ItemListCntr[0];
		// var itemElement = ItemListCntr && ItemListCntr.SelectedElement;
		if (!ItemListCntr || !itemElement || !itemElement.Item || !itemElement.Item[0]) return;
		
		var items = ItemListCntr.Items,item = itemElement.Item[0],found=false;
		for(var i=0;i<items.length;i++) {
		  if (items[i] == item) {
			  items.splice(i,1);
			  found = true;
			  if (item.nodeType == 1 && item.parentNode) item.parentNode.removeChild( item );  
			  if (items.onDeleteItem) items.onDeleteItem(item);
			  
			  break;
		  }
		}	
		if ( found ) {
			ItemListCntr.trigger('itemDeleted',{ Item: itemElement.Item, ItemElement: itemElement });
			ItemListCntr.trigger('afterItemDeleted',{ Item: itemElement.Item, ItemElement: itemElement });
			ItemListCntr.trigger('itemsChanged',{});
		}
    },
    AddItemToItemList: function (profile, data, context)
    {
    	var item = aa_first(data,profile,'Item',context);
    	var itemlistID = aa_text(data,profile,'ItemList',context);
		var ItemListCntr = context.vars.ItemListCntr && context.vars.ItemListCntr[0];
		if (itemlistID) {
			var control = aa_find_field_controls({ fieldID: itemlistID, context: context })[0];
			if (!control || !control.jbContext) return;
			ItemListCntr = control.jbContext.vars.ItemListCntr[0];
			if (!ItemListCntr) return;
		}
		var items = ItemListCntr.Items;
    	items.push(item);
    	if (items.onAddItem) items.onAddItem(item);
    	
    	var addObject = { Item: [item] };
		ItemListCntr.trigger('itemAdded',addObject);
		ItemListCntr.trigger('afterItemAdded',addObject);
		//ItemListCntr.trigger('itemsChanged',{});
    },
    CloseDetailsReplacingAll: function (profile, data, context)
    {
    	var elem = context.vars.ControlElement[0];
    	var itemlistContainer = context.vars.ItemListCntr && context.vars.ItemListCntr[0];
    	if (itemlistContainer && itemlistContainer.BackFromDetails) 
    	  itemlistContainer.BackFromDetails( aa_first(data,profile,'Transition',context) );
    },
    OpenDetailsReplacingAll: function (profile, data, context)
    {
    	var itemElement = aa_first(data,profile,'Item',context);
    	var itemlist = aa_findItemList(itemElement);
    	if (!itemlist) return;
    	var itemlistContainer = itemlist.itemlistCntr;
    	
    	var topControlContent = jQuery(itemElement).parents('.fld_'+itemlistContainer.Id)[0];
    	if (!topControlContent || !topControlContent.parentNode) return;
    	var topControl = topControlContent.parentNode;
    	if (!topControl.jbOriginalCtrl) topControl.jbOriginalCtrl = topControlContent;
    	
		var detailsField = aa_fieldById(aa_text(data,profile,'DetailsField',context),itemlist.Fields);
		var detailsElement = itemlist.CreateItemDetailsWrapper ? itemlist.CreateItemDetailsWrapper(itemElement) : document.createElement('div');
		detailsElement.Item = itemElement.Item;
		detailsElement.jbItemElement = itemElement;
		detailsElement.jbItemlistCntr = itemlistContainer;
		
		if (detailsField) {
			aa_fieldControl({ Field: detailsField, Item: itemElement.Item, Wrapper: detailsElement, Context: itemlist.Context,
                DoAfterShow: function() {
                    detailsElement.style.display = 'block';  // for async usages
                }
            });
			detailsElement.style.display = 'block';	// in case it's hidden
		} else {
		}
		topControl.jbDetailsReplacingAll = detailsElement;
        var replaceTransition = aa_first(data,profile,'Transition',context);
        if (!replaceTransition) {
            topControl.jbOriginalCtrl.style.display = 'none';
            topControl.appendChild(detailsElement);
            aa_element_attached(topControl);
        } else {
            aa_replace_transition({
                transition: replaceTransition,
                elOriginal: topControl.jbOriginalCtrl, 
                elNew: detailsElement,
                removeOriginal: function() { jQuery(topControl.jbOriginalCtrl).css({display: 'none'}); }
              },context);
        }
		
		itemlistContainer.BackFromDetails = function(transition,refresh) {
	    	if (topControl.jbDetailsReplacingAll) {
                if (!transition) {
    	    		aa_remove(topControl.jbDetailsReplacingAll,true);
    	    		topControl.jbOriginalCtrl.style.display = 'block';
    	    		topControl.jbDetailsReplacingAll = null;
    	    		itemlist.RefreshItemElement( itemElement );
                } else {
                    itemlist.RefreshItemElement( itemElement );
                    aa_replace_transition({
                        transition: transition,
                        elOriginal: topControl.jbDetailsReplacingAll, 
                        elNew: topControl.jbOriginalCtrl,
                        onBeforeTransitionBegin: function() { jQuery(topControl.jbOriginalCtrl).css({display: 'block'}); }
                      },context);
                }
	    	} 
		}
    },
    RefreshItem: function (profile, data, context)
    {
    	var itemElement = aa_first(data,profile,'Item',context);
    	var itemlist = aa_findItemList(itemElement);
    	if (!itemlist) return;
		itemlist.RefreshItemElement( itemElement );
    },
    ToggleDetailsInplace: function (profile, data, context)
    {
    	var itemElement = aa_first(data,profile,'Item',context);
    	var itemlist = aa_findItemList(itemElement);
    	if (!itemlist) return;
    	if (itemElement.jbDetailsOpen || ( itemElement.nextSibling && itemElement.nextSibling.jbIsDetailsOpen) ) {
    		// close
    		if (itemlist.CloseInplace) itemlist.CloseInplace(itemElement);
    		itemElement.jbDetailsOpen = false;
    		// now refresh the item
    		itemlist.RefreshItemElement( itemElement );
    	} else {
    		// open
    		var detailsField = aa_fieldById(aa_text(data,profile,'DetailsField',context),itemlist.Fields);
    		var detailsElement = itemlist.CreateItemDetailsWrapper ? itemlist.CreateItemDetailsWrapper(itemElement) : document.createElement('div');
    		detailsElement.Item = itemElement.Item;
    		detailsElement.jbItemElement = itemElement;
    		
    		if (detailsField) {
    			aa_fieldControl({ Field: detailsField, Item: itemElement.Item, Wrapper: detailsElement, Context: itemlist.Context });
    			detailsElement.style.display = 'block';	// in case it's hidden
    		} else {
    		}
    		if (itemlist.OpenInplace) itemlist.OpenInplace(itemElement,detailsElement);
    		itemElement.jbDetailsOpen = true;
    	}
    }
});

function aa_itemlistContainer(items,id) {
    var ItemListCntr = {
    	Id: id,
        Items: items
    };
    // .bind ,.trigger are here to make the using code look a bit nicer
    ItemListCntr.bind = function(evt,callback,id) { jBart.bind(ItemListCntr,evt,callback,id); }
    ItemListCntr.trigger = function(evt,obj) { jBart.trigger(ItemListCntr,evt,obj); }
    
    return ItemListCntr;
}

function aa_ItemList(field,context,inputData) {
    var itemlist = {
    	Id: field.Id, id: field.Id,
        Fields: [],
        InputData: inputData
    };
    itemlist.Context = aa_ctx(context,{ItemList: [itemlist], _Field: [field] });
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
        itemlist.trigger('beforeRefresh');
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
    	var ctx = aa_ctx(this.Context,{ _Field: [field] });
		var fieldData = field.FieldData ? field.FieldData(item, ctx) : item;
		aa_fieldControl({ Field: field, Item: item, Wrapper: wrapper, Context: ctx });
    }
    itemlist.GetElements = function() {
    	var out=[]; // An aspect can change this logic
    	for(var elem=this.ParentOfItems.firstChild;elem;elem=elem.nextSibling)
    		if (elem.Item) out.push(elem);
    	return out;
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

// settings contains: Field, Item, Wrapper, FieldData (optional), Context
function aa_fieldControl(settings,runAfterAsyncAction) {
    try {
    var field = settings.Field;
    var wrapper = settings.Wrapper;
    var ctx = aa_ctx(settings.Context, { _Field: [field], Item: settings.Item })

    if (field.AsyncActionRunner && !runAfterAsyncAction) {
    	return field.AsyncActionRunner(settings);
    }
    
    var field_data = settings.FieldData;
    if (!field_data) field_data = field.FieldData ? field.FieldData(settings.Item, ctx) : settings.Item;

    for (i in ajaxart.xtmls_to_trace)   // Tracing field data to go over gaps
        if (field.XtmlSource[0].script == ajaxart.xtmls_to_trace[i].xtml) {
            ajaxart.xtmls_to_trace[i].fieldData = ajaxart.xtmls_to_trace[i].fieldData || [];
            ajaxart.xtmls_to_trace[i].fieldData = ajaxart.xtmls_to_trace[i].fieldData.concat(field_data);
        }

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
        ajaxart.logException('error rendering field ' + settings.Field.Id,e);
    }   
}

function aa_findItemList(element) {
	for(var iter = element;iter && iter.nodeType == 1;iter=iter.parentNode) {
		if (iter.jbItemList) return iter.jbItemList;
	}
	return null;
}

function aa_initContainerFilters(itemlistCntr)
{
	if (itemlistCntr.RunQuery) return; // already initialized
	
	itemlistCntr.Filters = itemlistCntr.Filters || {};
	itemlistCntr.AllItems = itemlistCntr.Items;
	
	itemlistCntr.RefreshDataColumns = function() {
		itemlistCntr.DataColumns = {};
		for(var i in this.Filters) {
			this.RefreshDataColumn(this.Filters[i]);
		}
	}
	itemlistCntr.RefreshDataColumn = function(filter) {
		var column = this.DataColumns[filter.Id] = [];
		for(var j=0;j<this.AllItems.length;j++) {
			var item = this.AllItems[j];
			var fieldData = filter.FieldData(item);
			column.push( filter.FilterType.FieldDataToColumnData(fieldData) );
		}
	}
	itemlistCntr.AddFilter = function(filter) {
		this.Filters[filter.Id] = filter;
		this.RefreshDataColumn(filter);
	}

	itemlistCntr.RunQuery = function(xmlQuery) {
		var logQueryTime = false;
		var startTime = logQueryTime ? new Date().getTime() : 0;
		
		this.ItemsVersion = this.ItemsVersion ? this.ItemsVersion+1 : 1; // can be used for caches (e.g. filters/group by/occurrences)
		
		this.FilterData = {};
		
		for (var i=0; i<xmlQuery.attributes.length; i++) {
			var id = xmlQuery.attributes.item(i).name;
			if (!xmlQuery.getAttribute(id)) continue; // empty attribute is no filter
			var filter = this.Filters[id]; 
			if (!filter) continue;
			var filterType = filter.FilterType;
			this.FilterData[id] = filterType.PrepareQueryData ? filterType.PrepareQueryData(xmlQuery.getAttribute(id)) : xmlQuery.getAttribute(id);
		}
		
		// now we should run the filters and intersect the results
		var cols = {};
		var prevCol = null,lastCol=null;
		for(var filterId in this.FilterData) {
			var col = [];
			var filter = this.Filters[filterId];
			var filterType = filter.FilterType;
			var filterData = this.FilterData[filterId];
			var dataColumn= this.DataColumns[filterId];
			for(var j=0;j<dataColumn.length;j++) {
				if (prevCol && !prevCol[j]) {
					col[j] = false; // no need to check this value. it has not passed previous filters
				} else {
					col[j] = filterType.Match(filterData,dataColumn[j]);
				}
			}
			lastCol = prevCol = col;
		}
		// here we need to check only lastCol (because it integrated previous columns)
		if (lastCol) {
			var items = [];
			for(var j=0;j<this.AllItems.length;j++) {
				if (lastCol[j]) { // passed the filter
					items.push( this.AllItems[j] );
				}
			}
			this.Items = items;
		} else {
			this.Items = this.AllItems;
		}
		this.FilteredDataColumn = lastCol;
		
		this.trigger('sortItems',{});
		this.trigger('itemsChanged',{});
		
		if (logQueryTime) {
			var time = new Date().getTime() - startTime;
			ajaxart.log('RunQuery Time - ' + time,'timing');
		}
	}
	
	itemlistCntr.GetFilterOfSpecificResult = function(item,field_data) {
		for(var i in this.Filters) {
			var filter = this.Filters[i];
			if (filter.FieldData) {
				var filterFieldData = filter.FieldData(item);
				if (filterFieldData && filterFieldData[0] && field_data[0] && filterFieldData[0] == field_data[0])
					return filter;
			}
		}
		return null;
	}
	itemlistCntr.GetFilterQueryData = function(filter) {
		return this.FilterData && this.FilterData[filter.Id];
	}
	
	itemlistCntr.RefreshDataColumns();
}
function aa_calculateFilterOccurrences(itemlistCntr,filterId,filteredOccurrences)
{
	itemlistCntr.ItemsVersion = itemlistCntr.ItemsVersion || 1;
	
	itemlistCntr.Occurrences = itemlistCntr.Occurrences || {};
	itemlistCntr.FilteredOccurrences = itemlistCntr.FilteredOccurrences || {}; 
	itemlistCntr.OccurrencesVersions = itemlistCntr.OccurrencesVersions || {};
	if (itemlistCntr.OccurrencesVersions[filterId] == itemlistCntr.ItemsVersion) return; // already calculated
	if (filteredOccurrences && !itemlistCntr.FilteredDataColumn) filteredOccurrences= false;
	
	var occ = {},filteredOcc = {};
	var dataCol = itemlistCntr.DataColumns[filterId];
	for(var i=0;i<dataCol.length;i++) {
		var val = dataCol[i];
		occ[val] = occ[val] ? occ[val]+1 : 1; 
		if (filteredOccurrences && itemlistCntr.FilteredDataColumn[i] ) {
			filteredOcc[val] = filteredOcc[val] ? filteredOcc[val]+1 : 1; 
		}
	}
	itemlistCntr.Occurrences[filterId] = occ;
	if (filteredOccurrences) {
		itemlistCntr.FilteredOccurrences[filterId] = filteredOcc; 
	}
	itemlistCntr.OccurrencesVersions[filterId] = itemlistCntr.ItemsVersion;
}

// aa_register_init_itemlistCntr allows a field aspect to init an itemlistCntr (e.g. set default sort or filter)
function aa_register_init_itemlistCntr(field,callback,identifier)
{
	if (field.hasItemlistContainer) {
		// the field itself has ItemListCntr aspect
		jBart.bind(field,'initItemlistCntr',callback,identifier);
	} else {
		// the field in inside the itemlist container
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
			if (!ctx.vars.ItemListCntr) return;
			callback(ctx.vars.ItemListCntr[0]);
		},identifier);
	}
}
function aa_unsort_items(itemlistCntr)
{
	if (itemlistCntr.ItemsBeforeSort)
		itemlistCntr.Items = itemlistCntr.ItemsBeforeSort;
}

// settings include: direction, sortType, itemValue (function), context
function aa_sort_items(itemlistCntr,settings)
{
	var context = settings.context;
	var sortType = settings.sortType;
	
	itemlistCntr.ItemsVersion = itemlistCntr.ItemsVersion || 1;
	if (itemlistCntr.ItemsBeforeSortVersion != itemlistCntr.ItemsVersion) {
		itemlistCntr.ItemsBeforeSort = itemlistCntr.Items;
		itemlistCntr.ItemsBeforeSortVersion = itemlistCntr.ItemsVersion;
	}
	
	var arr = [];
	
	for(var i=0;i<itemlistCntr.Items.length;i++) {
		var item = [itemlistCntr.Items[i]];
		var val = settings.itemValue(item);
		arr[i] = { index: i, value: sortType.compileValue(val) };
	}
	arr.sort(sortType.sort);
	
	// now create the new array
	var newArr = [];
	for(var i=0;i<arr.length;i++) {
		newArr.push( itemlistCntr.Items[arr[i].index] );
	}

	if (settings.direction == 'ascending') newArr = newArr.reverse();
	itemlistCntr.Items = newArr;
}

//aa_itemlist_as_table is used in table styles
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
	  if (headerTemplate) {
		  var headerParent = headerTemplate.parentNode;
		  jQuery(headerTemplate).remove();
		  
		  if (settings.showHeaders) {
			  var fields = itemlist.VisibleFields;
			  for(var i=0;i<fields.length;i++) {
			      var headerCell = headerTemplate.cloneNode(true);
			      headerCell.jbField = fields[i]; // needed for sort and group by
			      var title = aa_fieldTitle(fields[i],itemlist.InputData,itemlist.Context);
			      jQuery(headerCell).find('.title').html( title );
			      jBart.trigger(fields[i],'ModifyTableHeader',{th: headerCell});
			      headerParent.appendChild(headerCell);
			  }
		  }
	  }
	  
	  itemlist.OpenInplace = function(itemElement,inplaceControl) {
	    var inplaceTR = jQuery('<tr class="aa_details_inplace"><td/></tr>');
	    inplaceTR.find('td').attr('colspan',jQuery(itemElement).find('>td').length).append(inplaceControl);
	    inplaceTR.insertAfter(itemElement);
	    itemElement.jbDetailsElement = inplaceTR[0];
	    inplaceTR[0].jbIsDetailsOpen = true;
	  }
	  itemlist.CloseInplace = function(itemElement,inplaceControl) {
		itemElement.jbDetailsElement = itemElement.jbDetailsElement || itemElement.nextSibling;
	    if (itemElement.jbDetailsElement) {
	      jBart.remove(itemElement.jbDetailsElement);
	      itemElement.jbDetailsElement = null;
	    }
	  }
}

// aa_tableColumnSort adds sort capabilities for a table
function aa_tableColumnSort(table,settings)
{
	var thead = jQuery(table).find('>thead')[0];
	aa_registerHeaderEvent(thead,'mouseup',clickHandler,'Sort','no dominant');
	
	function clickHandler(e,thead,th) {
  	    var jth = jQuery(th);
	    if (!thead.LastMouseDown || thead.LastMouseDown.th != th) return;
	    
  		if (jth.hasClass('sort_ascending'))	{
  		    removeCssClasses(thead);
  		    jth.addClass('sort_descending');
  		    settings.doSort(th,'descending');
   		} else if (jth.hasClass('sort_descending')) {
  		    removeCssClasses(thead);
  	  		settings.doSort(null);	// remove the sort
		} else {
	  		removeCssClasses(thead);
	  		jth.addClass('sort_ascending');
  		    settings.doSort(th,'ascending');
  		}
	}

	function removeCssClasses(thead)	{
	   	jQuery(thead).find('th').removeClass('sort_ascending').removeClass('sort_descending');
	}
}

function aa_notEmptyQuery(xmlQuery) 
{
	for (var i=0; i<xmlQuery.attributes.length; i++) {
		var name = xmlQuery.attributes.item(i).name;
		if (xmlQuery.getAttribute(name)) return true;
	}
	return false;
}


aa_gcs("itemlist_aspect", {
    GroupItems: function(profile,data,context)
    {
		// Groups are added between item elements, so the html keeps its structure
	
    	var field = context.vars._Field[0];
    	var style = aa_first(data,profile,'Style',context);
    	
    	jBart.bind(field,'initItemList',function(itemlist) {
    		var itemListCntr = itemlist.itemlistCntr;
        	jBart.bind(itemListCntr,'afterItemDeleted',function() { itemlist.Refresh(); },'GroupItems'+field.Id);
        	jBart.bind(itemListCntr,'afterItemAdded',function() { itemlist.Refresh(); },'GroupItems'+field.Id);
        	itemlist.GroupSorter = aa_first(data,profile,'SortGroups',context);
        	
    		itemlist.RefreshGroups = function() {
    	        var items = this.itemlistCntr.Items;
    			itemlist.Groups = {};
    			itemlist.SortedGroups = [];
    			
    			for(var i=0;i<items.length;i++) {
    				var item = [items[i]];
    				var groupName = aa_text(item,profile,'GroupOfItem',context);
    				if (!itemlist.Groups[groupName]) {
    					var group = { Name: groupName, Items: [] };
    					group.DisplayName = aa_text(ajaxart.run(item,profile,'GroupOfItem',context),profile,'GroupDisplayName',context);
    					itemlist.SortedGroups.push(group);
    					itemlist.Groups[groupName] = group;
    				}
    				itemlist.Groups[groupName].Items.push(items[i]);
    			}
    			
    			itemlist.SortGroups();
    		}
    		itemlist.SortGroups = function() {
    			if (!itemlist.GroupSorter) return;
    			
    			var arr = [];
    			for(var i=0;i<itemlist.SortedGroups.length;i++) {
    				var group = itemlist.SortedGroups[i];
    				arr[i] = { index: i, value: itemlist.GroupSorter.compileValue([group.Name]) };
    			}
    			arr.sort(itemlist.GroupSorter.sort);
    			
    			var newArr = [];
    			for(var i=0;i<arr.length;i++) {
    				newArr.push( itemlist.SortedGroups[arr[i].index] );
    			}
    			
    			itemlist.SortedGroups = newArr;
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
    		
    	    itemlist.ShowItems = function () {
    	    	itemlist.RefreshGroups();
    	        var groups = this.SortedGroups;
    	        
    	        // Incremental build is done by an aspect - this code is simple rendering
    	        for (var i = 0;i<groups.length;i++) {
    	        	var group = groups[i];
    	        	var elemsOfGroup = [];
    	        	for(var j=0;j<group.Items.length;j++) {
    	        		var item = [ group.Items[j] ];
    	        		var elem = itemlist.ElementOfItem(item);
    	        		elemsOfGroup.push(elem);
    	        	}
    	        	var groupElem = aa_renderStyleObject(style,{ 
    	        		text: group.DisplayName, group: group,
    	        		Items: group.Items,
    	        		ItemElements: elemsOfGroup
    	        	},context);
    	        	
    	        	this.ParentOfItems.appendChild(groupElem); 
    	        	
    	        	for(var j=0;j<elemsOfGroup.length;j++)
    	        		this.AppendItemElement(elemsOfGroup[j]);
    	        }
    	    }
    	});    	
    }
});



aa_gcs("itemtree", {
  TreeItems: function(profile, data, context) {
    var items = ajaxart.run(data, profile, 'Items', context);
    items.SubItems = function(item) { 
      return subitemsFunc(item, items); 
    };
    return items;

    function subitemsFunc(item, list) {
      // make sure the item is in the list
      var found = false;
      for (var i = 0; i < list.length; i++) {
       if (list[i] == item) {
        found = true;
        break;
       }
      }

      if (!found) return null;

      var subitems = ajaxart.run([item], profile, 'SubItems', context);
      subitems.SubItems = function(item) {
        return subitemsFunc(item, this);
       };
      return subitems;
     }
   },
  Tree: function(profile, data, context) {
    var field = aa_create_base_field(data, profile, context);
    aa_init_class_Tree();

    field.Control = function(field_data, ctx) {
      var items = ajaxart.run(field_data, profile, 'Items', context);

      var treeObject = new ajaxart.classes.Tree({
        items: items,
        _fieldData: field_data,
        _profile: profile,
        context: context
      });
      var out = aa_renderStyleObject(field.Style, treeObject, context, true);
      return [out];
    };
    
    return [field];  
  }  
});

function aa_init_class_Tree() {
  ajaxart.classes = ajaxart.classes || {};
  if (ajaxart.classes.Tree) return;

  ajaxart.classes.Tree = function(settings) {
    aa_extend(this, settings);
  };
  ajaxart.classes.Tree.prototype.itemText = function(item) {
    return aa_text([item], this._profile, 'ItemText', this.context);
  };
  ajaxart.classes.Tree.prototype.itemImage = function(item) {
    return aa_first([item], this._profile, 'ItemImage', this.context);
  };
}

function aa_build_tree(tree, settings) {
  var baseNodeTemplate = settings.nodeElement;
  renderNodes(tree.items, settings.nodeElement);

  function renderNodes(subitems, nodeTemplate) {
    var nodeParent = jQuery(nodeTemplate).parent();
    jQuery(nodeTemplate).remove();

    for (var i = 0; i < subitems.length; i++) {
      var item = subitems[i];
      var nodeElement = jQuery(baseNodeTemplate).clone().appendTo(nodeParent);

      renderNode({
        item: item,
        items: tree.items,
        el: nodeElement[0],
        $el: nodeElement
      });
    }
  }

  function renderNode(node) {
    var nodeSettings = settings.nodeSettings(node);
    var nodeText = tree.itemText(node.item);
    var nodeImage = tree.itemImage(node.item);

    jQuery(nodeSettings.textElement).text(nodeText);

    var subitems = (node.items.SubItems && node.items.SubItems(node.item)) || [];
    if (!subitems.length) {
      jQuery(nodeSettings.subnodesElement).hide();
    } else {
      renderNodes(subitems, nodeSettings.subnodeElement);
    }
  }
}

//AA BeginModule
ajaxart.gcs.menu = 
{
  ContextMenu: function (profile,data,context)
  {
	var items = [];
	var itemProfiles = ajaxart.subprofiles(profile,'Item');
	for (prof in itemProfiles)
		ajaxart.concat(items,ajaxart.run(data,itemProfiles[prof],'',context));
	var ctx_menu_input = ajaxart.dynamicText(data,"%$_ContextMenuContext/Input%",context);
	var fromMenu = ajaxart.dynamicText(data,"%$_ContextMenuContext/FromMenu%",context);
	
	var footerMessage = aa_text(data,profile,"FooterMessage",context);
	var headerMessage = aa_text(data,profile,"HeaderMessage",context);
	ajaxart.menu.closeCurrentContextMenu();
	var menu = jQuery('<div class="contextmenu" style="z-index: 9000"/>');
	menu.addClass( aa_attach_global_css(aa_text(data,profile,'Css',context),context,'contextmenu') );
	if (headerMessage != "") {
		var header = jQuery('<div class="context_menu_header_message" />'); header.text(headerMessage);	menu.append(header);
	}
	menu.bind('contextmenu', function() { return false; });
	var ul = jQuery('<ul class="contextmenu_ul">'); menu.append(ul);
	for (var i=0; i<items.length; i++) {
		var image = ajaxart.totext(items[i].Image);
		var text = ajaxart.totext(items[i].Text);
		var img = jQuery('<img class="contextmenu_image" />').attr("src",image);
		var span = jQuery('<span class="contextmenu_span" />').text(text);
		var li = jQuery('<li class="contextmenu_li" />').append(img).append(span);
		li.addClass("menu_item_" + ajaxart.totext(items[i].ID));
		ul.append(li);	
		li[0]["menu_item"] = items[i];
		li[0]["input"] = items[i].Input;
		if (i==0) li.addClass("selected");
		li.click(function(e) {
			if (window.aa_incapture) return;
			var newContext = ajaxart.clone_context(this.menu_item.Action.context);
			ajaxart.setVariable(newContext,"MenuItemInfo", [this.menu_item]);
			ajaxart.menu.closeCurrentContextMenu();
			ajaxart.run(this.input, this.menu_item.Action.script, "" ,newContext);
		} );
		li.hover(
				    function() { jQuery(this.parentNode).find('.selected:visible').removeClass('selected'); jQuery(this).addClass('selected'); },
				    function() {}
		);
	}
	if (footerMessage != "") {
		var footer = jQuery('<div class="context_menu_footer_message" />'); footer.text(footerMessage);	menu.append(footer);
	}
	jQuery(document).mouseup( function(e) {
		if (e.which == 3) return;// double-click
		if (ajaxart.menu.currentContextMenu == null) return;
		var element = (typeof(e.target)== 'undefined')? e.srcElement : e.target;
		if (jQuery(element).parents(".contextmenu").length == 0)	// clicking out
			ajaxart.menu.closeCurrentContextMenu();
	});
	jQuery(document).mousemove( function(e) {
		if (ajaxart.menu.currentContextMenu == null) return;
		var x = e.pageX;
		var y = e.pageY;
		var cm_left = aa_absLeft( ajaxart.menu.currentContextMenu[0] );
		var cm_top = aa_absTop( ajaxart.menu.currentContextMenu[0] );
		var cm_right = cm_left + jQuery( ajaxart.menu.currentContextMenu[0] ).width();
		var cm_bottom = cm_top + jQuery( ajaxart.menu.currentContextMenu[0] ).height();
		
		if ( x < cm_left - 80 || x > cm_right + 80 || y < cm_top - 40 || y > cm_bottom + 80) {
			ajaxart.menu.closeCurrentContextMenu();
		}
		return true;
	});
	var focusControl = ajaxart.getVariable(context, "_CurrentFocus");
	if (focusControl.length > 0 && focusControl[0].alreadyBounded != true) {
		focusControl[0]["alreadyBounded"] = true;
		jQuery(focusControl[0]).keyup( function(e) {
			if (ajaxart.menu.currentContextMenu == null) return;
			  if (e.keyCode == 13) { // enter
				  var selected = ajaxart.menu.currentContextMenu.find('.selected')[0];
					var newContext = ajaxart.clone_context(selected.menu_item.Action.context);
					ajaxart.setVariable(newContext,"MenuItemInfo", [selected.menu_item]);
					ajaxart.menu.closeCurrentContextMenu();
					ajaxart.run(selected.input, selected.menu_item.Action.script, "" ,newContext);
			  }
			ajaxart_stop_event_propogation(e);
		});
		jQuery(focusControl[0]).keydown( function(e) {
			if (ajaxart.menu.currentContextMenu == null) return;
			  if (e.keyCode == 27)  // esc
				  ajaxart.menu.closeCurrentContextMenu();
			  if (e.keyCode == 38 || e.keyCode == 40) { // arrows up/down
				  var jSelected = ajaxart.menu.currentContextMenu.find('.selected');
				  var nextItem;
				  if (e.keyCode == 38)  // up
					  nextItem = jSelected[0].previousSibling;
				  if (e.keyCode == 40)  // arrow down
					  nextItem = jSelected[0].nextSibling;;
				  if (nextItem != null) {
					  jSelected.removeClass('selected');
					  jQuery(nextItem).addClass('selected');
				  }
			  }
			  ajaxart_stop_event_propogation(e);
			  return false;
		});
	}
	jQuery(document).keypress( function(e) {
		if(e.keyCode == 27) // esc
				ajaxart.menu.closeCurrentContextMenu();
	});
	menu.appendTo("body");
	ajaxart.menu.currentContextMenu = menu;
	var controlForPosition = ajaxart.getControlElement(context,true);
	if (ajaxart.getVariable(context, "_CurrentFocus").length > 0)
		controlForPosition = ajaxart.getVariable(context, "_CurrentFocus")[0];
	if (fromMenu == 'vmenu') {
		controlForPosition = jQuery(ajaxart.getControlElement(context)).find('>*');
		if (controlForPosition.length > 0)
			controlForPosition = controlForPosition[0];
		else
			controlForPosition = null;
	}
	menu.css('position','absolute');
	ajaxart.dialog.positionPopup(menu, controlForPosition, null, true,context);
	return [];
  },
  ContextMenuContents: function (profile,data,context)
  {
    if (ajaxart.menu.currentContextMenu == null) return [];
    var menu = ajaxart.menu.currentContextMenu[0];
    return [menu];
  },
  CloseContextMenu: function (profile,data,context)
  {
	ajaxart.menu.closeCurrentContextMenu();
	return ["true"];
  }
}
//AA EndModule

ajaxart.menu = { currentContextMenu: null };
ajaxart.menu.closeCurrentContextMenu = function()
{
  if (ajaxart.menu.currentContextMenu == null) return;
  
  jQuery(document).unbind('click').unbind('keypress').unbind('mousemove');
  ajaxart.menu.currentContextMenu.fadeOut(175);
  ajaxart.menu.currentContextMenu[0].parentNode.removeChild(ajaxart.menu.currentContextMenu[0]);
  
  ajaxart.menu.currentContextMenu = null;
};





aa_gcs("parser", {
	RemoveSection: function (profile,data,context) {
		var begin = aa_text(data,profile,'BeginPattern',context);
		var end = aa_text(data,profile,'EndPattern',context);
		
		function removeOneSection(html) {
			var lowerCase = html.toLowerCase();
			var from = lowerCase.indexOf(begin);
			var to = lowerCase.indexOf(end,from);
			if (from == -1 || to == -1) return html;
			return html.substring(0,from) + html.substring(to + end.length);
		}
		
		var result = aa_text(data,profile,'Html',context);
		var next = removeOneSection(result);
		while (next.length < result.length) {
			result = next;
			next = removeOneSection(result);
		}
		return [result];
	},
	ExtractBody: function (profile,data,context) {
		var result = aa_text(data,profile,'Html',context);
		var lowerCase = result.toLowerCase();
		var from = lowerCase.indexOf('<body');
		if (from != -1) from = lowerCase.indexOf('>',from);
		var to = lowerCase.indexOf('</body');
		if (from != -1 && to != -1)
			result = '<div' + result.substring(from,to) + '</div>';
		return [result];
	}
});

//AA BeginModule
ajaxart.gcs.pivot = 
{
		Pivot: function (profile,data,context)
		{
			var pivot = { isObject : true };
			pivot.Id = 'Pivot';
			pivot.takeOver = function(aspects,items,itemListFunc,ctx)
		    {
				var pivot = this;
		    	var newContext = aa_ctx(ctx,{ _Pivot : [pivot]});

		    	var inner_aspects = [];
		    	for (var i=0;i<aspects.length;i++)
		    		if (aspects[i].Id != 'Pivot')
		    			inner_aspects.push(aspects[i]);
		    	pivot.InnerAspects = inner_aspects;
		    	pivot.OriginalItems = items;
		    	pivot.InnerItemListCtrlFunc = itemListFunc;
		    	pivot.InnerContainer = context.vars._Cntr[0]; //  TODO: change to ctx

		    	var aspects = ajaxart.runsubprofiles(data,profile,'PivotAspect',newContext);
				
				var ctrl = ajaxart.runNativeHelper(items,profile,'Control',newContext)[0];
			    pivot.Context = aa_ctx(pivot.Context, { _Cntr: [ctrl.Cntr] });
			    pivot.OuterCntr = ctrl.Cntr;
				
				var ctrl_loc = jQuery(pivot.Ctrl).find('>.aa_ctrl');
				ctrl_loc.empty();
				
				for(var i=0;i<aspects.length;i++)
					if (aspects[i].ExtendOuterCntr)
						aspects[i].ExtendOuterCntr(data,pivot.Context);
				ctrl_loc[0].appendChild(ctrl);

				return [pivot.Ctrl];
		    }
	    	pivot.Group = function(data_items,ctx)
	    	{
		    	var field = aa_first(data,profile,'GroupByField',context);
				if (field == null) return [];
				var groups = {};
				var groupItems = [];
				for(var i=0;i<data_items[0].Items.length;i++)
				{
					var item = data_items[0].Items[i];
					var val = ajaxart.totext_array(ajaxart_field_calc_field_data(field,[item],context));
					if (groups[val] == null) groups[val] = [];
					groups[val].push(item);
				}
				for(groupVal in groups)
				{
					var group = groups[groupVal];
					var group_items = jQuery.extend(false, {}, data_items[0]); // clone
					group_items.Items = groups[groupVal];
					var groupItem = { isObject: true, IsGroup: ["true"], Value: [groupVal], Items : [group_items] };
					groupItems.push(groupItem);
				}
				if (pivot.HasTotalLine)
				{
					groups._Total = [];
					for(var i=0;i<data_items[0].Items.length;i++)
						groups._Total.push(data_items[0].Items[i]);
					var group_items = jQuery.extend(false, {}, data_items[0]); // clone
					group_items.Items = groups._Total;
					var total_label = ajaxart_multilang_text('Total', context);
					groupItems.push({ isObject: true, IsGroup: ["true"], IsTotal:true, Value: [total_label], Items : [group_items] });
				}

				return groupItems;
	    	}
	    	
	    	pivot.ItemsOfGroupField = [{ 
	    			isObject: true, Id: 'ItemsOfGroup', Title: 'Items', CellPresentation: "control",
	    			Control: function(groupItem,ctx) {
	    				var pivot = ctx.vars._Pivot[0];
	    				return pivot.InnerItemListCtrlFunc(groupItem[0].Items,pivot.InnerAspects);
	    			}
	    	}];
		    pivot.Ctrl = jQuery('<div class="pivot"><div class="aa_filters"></div><div class="aa_ctrl"></div></div>')[0]; 
		    pivot.Context = aa_ctx(context,{ _Pivot : [pivot] });
			return [pivot];
		},
		TotalLine: function (profile,data,context)
		{
			var pivot = context.vars._Pivot[0];
			if (pivot == null) return [];
			pivot.HasTotalLine = true;
			
			return {};
		},
		ExposedFilters: function (profile,data,context)
		{
			var aspect = {
				ExtendOuterCntr : function(data1,ctx)
				{
					var pivot = context.vars._Pivot[0];
					if (pivot == null) return [];
					var filters_section = document.createElement("ul");
				    filters_section.className = 'aa_filters';
				    var fields = ajaxart.run(data,profile,'Fields',pivot.Context);
					pivot.Filters = [];
			    	for(var i=0;i<fields.length;i++) // exposed filter controls
				    {
				    	var field = fields[i];
					    if (field.newFilter != null)
					    {
					    	var filter_data = ajaxart_writabledata();
					    	var filter = field.newFilter(filter_data);
					    	filter.field = field;
					    	filter.rawFilterData = filter_data;
					    	filter.nonCompiledData = filter_data;
					    	pivot.Filters.push(filter);
					    }
						if (field.FilterControl == null)
					    	continue;
						var newContext = aa_ctx(ctx,{ FilterData: ajaxart_writabledata()});
					    var ctrl = field.FilterControl(newContext);
		
				    	var filter_li = document.createElement("li");
				    	filter_li.className = "aa_filter";
				    	filter_li.appendChild(ctrl[0]);
				    	filters_section.appendChild(filter_li);
				    }
			    	
			    	var refreshByFilters = function(data1,ctx)
			    	{
			    		var pivot = ctx.vars._Pivot[0];
			    		var filter_field = ctx.vars._FilterField[0];
			    		var cntr = pivot.OuterCntr;
			    		// set filter data
			    		var filter = null;
			    		for(var i=0;i<pivot.Filters.length;i++)
			    			if (pivot.Filters[i].field.Id == filter_field.Id)
			    				filter = pivot.Filters[i];
			    		//filter.nonCompiledData = ctx.vars._FilterData;
			    		
			    		ajaxart_filter_dataitems(pivot.OriginalItems[0],pivot.Filters,ctx);
			    		cntr.Items = [{ isObject: true, Items: pivot.Group(pivot.OriginalItems) }];
			    		aa_recalc_filters_and_refresh(cntr,data,context);
			    	}
					ajaxart_addMethod_js(pivot.OuterCntr,'RefreshByFilters',refreshByFilters,pivot.Context);
			    	
				    var filter_location = jQuery(pivot.Ctrl).find('>.aa_filters');
				    filter_location.empty(); 
				    filter_location[0].appendChild(filters_section);
		
					return [];
			  }
			};
			return [aspect];
		}
}
//AA EndModule





//AA BeginModule
ajaxart.gcs.server = 
{
  CallServer: function (profile,data,context)
  {
	var indication = aa_bool(data,profile,'ProgressIndication',context);
	
	ajaxart.server.RunParallelCalls(profile,data,context,'Call',function() {} );
	return ["true"];
  },
  ParallelCalls: function (profile,data,context)
  {
	ajaxart.server.RunParallelCalls(profile,data,context,'Call',null);
	return ["true"];
  },
  BasicServerCall: function (profile,data,context)
  {
	var varname = aa_text(data,profile,'VarNameForResult',context);
	var reusable = aa_bool(data,profile,'Reusable',context);
	var mySync = ajaxart.getVariable(context,"_CallServerObject");
	if (mySync.length > 0) 
		mySync[0].register(mySync[0],varname);
		
	var onresult = function(result,varname,reusable,isSuccess) {
		if (reusable && isSuccess) ajaxart.serverCache[varname] = result;
    	var mySync = ajaxart.getVariable(context,"_CallServerObject");
    	if (mySync.length > 0) { 
    		if (isSuccess) {
    		  mySync[0].servervars[varname] = result;
    		  ajaxart.run(result,profile,'OnLoad',ajaxart.server.contextWithServerVars(context, mySync[0].servervars));
    		}
    		mySync[0].serverResult(mySync[0],isSuccess,varname);
    	}    	
	}
	
    if ( reusable && ajaxart.serverCache[varname] != null )
    	onresult(ajaxart.serverCache[varname],varname,reusable,true);
    else
    {
    	var options = { cache: false };
    	
	    options.url = aa_text(data,profile,'Url',context);;
	    options.type = ( aa_text(data,profile,'Method',context) == 'get' ) ? "GET" : "POST" ;
	    options.contentType = (options.type == "GET") ? "text/xml;charset=UTF-8" : "application/x-www-form-urlencoded; charset=UTF-8"; 
	    options.httpHeaders = [];
	    options.data = {};
	    
	    options.beforeSend = function(XMLHttpRequest) {
//			XMLHttpRequest.setRequestHeader(callObj.httpHeaders[i].name, callObj.httpHeaders[i].value);
	    };
	    
 	    var postDatas = ajaxart.run(data,profile,'PostData',context);
		for(var i=0;i<postDatas.length;i++) {
		  var obj = postDatas[i];
		  var name = ajaxart.totext(obj["Name"]);
		  var val = ajaxart.totext(obj["Value"]);
		  if (val != null)
			  options.data[name] = val; 
		}
	    
	    ajaxart.server.basicCall(options,onresult,varname,reusable,context);
    }
	    
    return ["true"];
  },
  ImmediateResult: function (profile,data,context)
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
  },
  ExportVirtualFile: function (profile,data,context)
  {
	var fileName = aa_text(data,profile,'FileName',context);
	var content = aa_text(data,profile,'Content',context);
	var contentType = aa_text(data,profile,'ContentType',context);
	if (ajaxart.inPreviewMode) return;
	if (ajaxart.server.counter == null)
		ajaxart.server.counter = 1;
	  ajaxart.server.counter++;
	  // counter : chrome dosent open the same file twice
	  var d = document;
	  
	  form = d.createElement('form');
	  form.setAttribute('accept-charset','utf-8');
	  d.body.appendChild(form);
	  form.method='POST';
	  form.setAttribute('method',form.method);
	  form["Accept-Charset"] = "ISO-8859-1,utf-8;q=0.7,*;q=0.7";
	  form.setAttribute("Accept-Charset","ISO-8859-1,utf-8;q=0.7,*;q=0.7");
	  var url = aa_text(data,profile,'Url',aa_ctx(context,{Counter: [""+ajaxart.server.counter]}));
//	  form.action='main.php?cnt=' + ajaxart.server.counter + '&op=exportFile';
	  form.action=url;
	  form.setAttribute('action',form.action);
	  form.target='_new';
	  form.setAttribute('target',form.target);
	  
	  Filename=d.createElement('input');
	  Filename.name= 'Filename';
	  Filename.type='hidden';
	  Filename.value = fileName;
	  Filename.setAttribute('value',Filename.value);
	  form.appendChild(Filename);
	  FileData=d.createElement('input');
	  FileData.name='FileData';
	  FileData.type='hidden';
	  FileData.value= content;
	  FileData.setAttribute('value',FileData.value);
	  form.appendChild(FileData);
	  ContentType=d.createElement('input');
	  ContentType.name='ContentType';
	  ContentType.type='hidden';
	  ContentType.value = contentType;
	  ContentType.setAttribute('value',ContentType.value);
	  form.appendChild(ContentType);
	  form.submit();
	  
	  return [];
  }
}
//AA EndModule

ajaxart.server = {
  ensureSyncObject: function(profile,data,context,onSuccessFunc)
  {
	var callSync;
	if ( ajaxart.getVariable(context,"_CallServerObject").length > 0 ) 	// composite inside composite
		callSync = ajaxart.getVariable(context,"_CallServerObject")[0];
	else {
		callSync = { countLeft: 0 , servervars:[], success: true, onSuccess:[], onFailure:[] , mode: "parallel" };
		callSync.register = function(callSync,debugInfo) {
			callSync.countLeft++; 
		};
		callSync.serverResult = function(callSync,isSuccess,debugInfo) { 
			callSync.countLeft--; 

			if ( ! isSuccess ) callSync.success = false;
			if (callSync.countLeft <= 0) {
				ajaxart.server.callSuccessOrFailure(callSync);
			}
		}
	    context.vars["_CallServerObject"] = [ callSync ];
	}
	
	if (onSuccessFunc != null) callSync.onSuccess.push( function(callSync) { 
		onSuccessFunc(ajaxart.server.contextWithServerVars(context, callSync.servervars)); } );
	
	return ajaxart.getVariable(context,"_CallServerObject")[0];
  },
  RunParallelCalls: function(profile,data,context,fieldName,onSuccessFunc)
  {
	var newContext = ajaxart.clone_context(context);
	
	var currentSync = null;
	var currentSyncArr = ajaxart.getVariable(context,"_CallServerObject"); 
	if (currentSyncArr.length > 0 && currentSyncArr[0].mode != "parallel") {
		currentSync = currentSyncArr[0];
		currentSync.register(currentSync);
		delete newContext.vars["_CallServerObject"]; 
	}
	
	var callSync = ajaxart.server.ensureSyncObject(profile,data,newContext,onSuccessFunc);
	if (currentSync != null) callSync.servervars = currentSync.servervars;
	callSync.onSuccess.push(function(callSync) {
		ajaxart.run(data,profile,'OnSuccess',ajaxart.server.contextWithServerVars(newContext, callSync.servervars) );
	});
	callSync.onFailure.push(function(callSync) {
		ajaxart.run(data,profile,'OnFailure',ajaxart.server.contextWithServerVars(newContext, callSync.servervars) );
	});

	if (currentSync != null) {
		var fWithVars = function(currentSync) {
			callSync.onSuccess.push(function(callSync) { currentSync.serverResult(currentSync,true); });
		};
		fWithVars(currentSync);
	}
	
	callSync.register(callSync,"parallel_internal");
	var callProfiles = ajaxart.subprofiles(profile,fieldName);
	for (var i=0;i<callProfiles.length;i++)
	  ajaxart.run(data,callProfiles[i],"",newContext);
	callSync.serverResult(callSync,true,"parallel_internal");
  },
  content2result: function(server_content,varname) 
  {
	  try {
	  	var out = null;
		if (ajaxart.isxml(server_content))
			server_content = ajaxart.xml2text(server_content);
		else if ( server_content.length > 0 && server_content.charAt(0) != "<")  // not xml
		  return [ server_content ];
	
	  	var server_content_no_ns = ajaxart.ajaxart_clean_ns(server_content);
	  	if (server_content.length > 0 && server_content.charAt(0) == "<")
	  	  out = [ ajaxart.parsexml(server_content_no_ns, varname) ];
	
	  	if (out == null) out = [server_content];
	  	if (out.length == 1 && out[0] == null) out = [server_content];
	  		
	  	if (ajaxart.ishtml(out[0]) || (ajaxart.isxml(out[0]) && ajaxart.xml.xpath(out[0].ownerDocument.documentElement,"Body/Fault").length != 0 ))  { // not xml, probably error
	      ajaxart.log("failed calling server","error");
	  	  if (ajaxart.ishtml(out))
	  		jQuery("<div>error back from server:"+server_content+"</div>").appendTo(jQuery("#ajaxart_log"));
		}
		else if (ajaxart.isxml(out)) {
		  if (out[0].nodeType == 7) out = [ out[0].nextSibling ]; // <?xml
	      if (out[0].tagName.toLowerCase() == 'envelope')  // web service
		  out = [ ajaxart.body_contents_of_soap_envelope(out[0]) ];
		}
	
		return out;
	  }
	  catch(e) {
		  ajaxart.logException(e);		  
		  return null;
	  }
  },
  basicCall: function(options,onresult,varname,reusable,context)
  {
	  options.inPreviewMode = ajaxart.inPreviewMode;
	  options.success = function(server_content) {
	    	var success = true;
	    	if (server_content && server_content.nodeType == 9) server_content = server_content.documentElement;
	    	
	     	var result = ajaxart.server.content2result(server_content,varname);
	    	if (result == null) { success = false; result = []; }
	    	var currPreviewMode = options.inPreviewMode;
	    	if (options.inPreviewMode == true)
	    		ajaxart.inPreviewMode = true;
	    	
	    	onresult(result,varname,reusable,success);
			ajaxart.inPreviewMode = false;
	  }
	  options.error = function(XMLHttpRequest, textStatus, errorThrown) {
    	  onresult([],varname,reusable,false);
      }

	  jQuery.ajax( options );
  },
  contextWithServerVars: function(context, servervars)
  {
	  var newContext = ajaxart.clone_context(context);
	  for (var i in servervars)
		  newContext.vars[i] = servervars[i];
	  delete newContext.vars["_CallServerObject"];
	  return newContext;
  },
  callSuccessOrFailure: function(callSync)
  {
	if (callSync.success) 
		for(var i=0;i<callSync.onSuccess.length;i++) 	// running backwards, so inner 'OnSuccess" are run first
			callSync.onSuccess[callSync.onSuccess.length - i - 1](callSync);
	else
		for(var i=0;i<callSync.onFailure.length;i++)
			callSync.onFailure[callSync.onFailure.length - i - 1](callSync);
  }
}
ajaxart.serverCache = [];


ajaxart.server_usage = {};
ajaxart.server_usage.actionFinished = null;



aa_gcs("studio_suggest",{
	IsItemlistContainer: function(profile,data,context) {
		var fieldXtml = data[0];
		var topForItems = fieldXtml;
		if (fieldXtml.nodeType != 1) return [];
		var iscontainer = fieldXtml.getAttribute('t') == 'field.ItemListContainer';
		if (!iscontainer) {
			topForItems = aa_xpath(fieldXtml,"FieldAspect[@t='field_aspect.ItemListContainer']")[0] || null;
			iscontainer = topForItems != null;
		}

		if (!iscontainer) return [];
		if (aa_bool(data,profile,'XmlItemsOnly',context)) {
			return aa_frombool( aa_xpath(topForItems,'Items/@t')[0].nodeValue == 'itemlist.XmlItems' );
		}
		return ["true"];
	},
	HasNoInnerFieldWithIDSuffix: function(profile,data,context) {
		var xml = data[0];
		if (!xml || xml.nodeType != 1) return [];
		var suffix = aa_text(data,profile,'Suffix',context);
		var regex = new RegExp(suffix+'$');

		var fields = aa_xpath(xml,'Field');
		for(var i=0;i<fields.length;i++) {
			if (regex.test(fields[i].getAttribute('ID')))
				return [];
		}
		return ['true'];
	}
});

aa_gcs("text", {
  FirstSucceeding: function (profile,data,context)
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
  NormalizeNewLines: function(profile,data,context) {
	  var result = aa_text(data,profile,'Text',context).replace(/\r\n/g,'\n'); 
	  return [result];
  },
  Extract: function (profile,data,context)
  {
	  var startMarkers = ajaxart.runsubprofiles(data,profile,'StartMarker',context);
	  if (startMarkers.length == 0) // backward compatible
		  startMarkers = ajaxart.run(data,profile,'StartMarker',context);
	  var endMarker = aa_text(data,profile,'EndMarker',context);
	  var includingStartMarker = aa_bool(data,profile,'IncludingStartMarker',context);
	  var includingEndMarker = aa_bool(data,profile,'IncludingEndMarker',context);
	  var onlyFirst = aa_bool(data,profile,'OnlyFirstResult',context);
	  var trim = aa_bool(data,profile,'Trim',context);
	  var str = aa_text(data,profile,'From',context);;
	  if (startMarkers.length == 0) return data;

	  var index = 0, out = [];
	  var string_start =0;
	  var position = function(str, marker, startpos) { return { pos: str.indexOf(marker,startpos), length: marker.length } } 
	  if (aa_bool(data,profile,'Regex',context)) 
		  position = function(str, marker, startpos) {
	  		var len = 0;
	    	var pos = -1;
	  		try {
		  		startpos = startpos || 0;
		  		var str = str.substring(startpos);
		  		var marker_regex = new RegExp(marker,'m');
		    	pos = str.search(marker_regex);
		    	if (pos > -1) { // get the length of the regex
		    		pos = (pos >= 0) ? pos + startpos : pos;
		    		var match = str.match(marker_regex)[0];
		    		len = match ? match.length : 0;
		    	}
	  		} catch(e) {} // probably regex exception
		    return { pos: pos , length: len };
	  	  	}
	  while (1) {
		  var cut_previous_index;
		  for(var i=0; i<startMarkers.length; i++)
		  {
			  var marker = startMarkers[i];
			  var markerPos = position(str,marker,index);
			  index = markerPos.pos;
			  if (i==0)
				  cut_previous_index = markerPos.pos - string_start;
			  if (markerPos.pos == -1) return out;
			  string_start = markerPos.pos;
			  if (!includingStartMarker)
				  string_start += markerPos.length;
			  index += markerPos.length;
		  }
		  if (out.length>0 && endMarker == ''){  // cutting previous item
			  out[out.length-1] = out[out.length-1].substring(0,cut_previous_index);
		  }
		  var endPos = position(str,endMarker,index);
		  var out_item;
		  if (endMarker == '')
			  out_item = str.substring(string_start);
		  else if (endPos.pos == -1)
			  return out;
		  else if (includingEndMarker)
			  out_item = str.substring(string_start,endPos.pos+endPos.length);
		  else
			  out_item = str.substring(string_start,endPos.pos);
		  if (trim)
			  out_item = aa_text_trim(out_item);
		  if (out_item)
			  out.push(out_item);
		  if (onlyFirst) 
			  return out;
		  if (endMarker != '') 
		  	index = endPos.pos+endPos.length;
	  }
	  return out;
  },
  MultiLang: function (profile,data,context)
  {
  	return ajaxart_multilang_run(data,profile,'Pattern',context);
  },  
  Split: function (profile,data,context)
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
  Text: function (profile,data,context)
  {
    var pattern = aa_text(data,profile,'Text',context);
    
    var result = ajaxart.dynamicText(data,pattern,context);
    var text_result = ajaxart.totext_array(result);
    if (aa_bool(data,profile,'RemoveEmptyParenthesis',context))
    	test_result = text_result.replace('\(\)','').replace(/^\s*/, '').replace(/\s*$/, '');
    return [ text_result ];
  },
  StartsWith: function (profile,data,context)
  {
	  var text = aa_text(data,profile,'Text',context);
	  var _with = aa_text(data,profile,'With',context);
	  
	  if ( text.indexOf(_with) == 0 ) return ["true"];
	  return [];
  },
  EndsWith: function (profile,data,context)
  {
	  var text = aa_text(data,profile,'Text',context);
	  var _with = aa_text(data,profile,'With',context);
	  
	  if ( text.lastIndexOf(_with) != -1 && text.lastIndexOf(_with) + _with.length == text.length ) return ["true"];
	  return [];
  },
  Length: function (profile,data,context)
  {
	  var str = ajaxart.totext_array(data);
	  var length = str.length;
	  return [length];
  },
  ToChars: function (profile,data,context)
  {
	  var str = ajaxart.totext_array(data);
	  var length = str.length;
	  var result = [];
	  for(var i=0;i<str.length;i++)
		  result.push(str.charAt(i));
	  return result;
  },
  Truncate: function (profile,data,context)
  {
	  var text = aa_text(data,profile,'Text',context);
	  var length = aa_int(data,profile,'Length',context);
	  if (text.length <= length) return [text];
	  var newtext = text.substring(0,length) + aa_text(data,profile,'Suffix',context);
	  return [newtext];
  },
  NumberFormat: function (profile,data,context)
  {
	  var number = ajaxart.totext_array(data);
	  var symbol = aa_text(data,profile,'Symbol',context);
	  var symbolLeft = ! aa_bool(data,profile,'SymbolAtRight',context);
	  var noCommaSeparator = aa_bool(data,profile,'NoCommaSeparator',context);
	  var use_cents = aa_bool(data,profile,'Cents',context);

	  var num = number.split('.')[0];
	  if (!noCommaSeparator)
		  for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
			  num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3)); 
	 
	  if (use_cents)
	  {
		  var cents = '00';
		  if (number.split('.').length > 1)
			  cents = number.split('.')[1];
		  cents = (cents + '00').substring(0,2);
		  num = num + '.' + cents;
	  }
	  if (num[0] == '-' && aa_bool(data,profile,'MinusInParenthesis',context))
		  num = symbolLeft ? '(' + symbol + num.substring(1) + ')' : '(' + num.substring(1) + symbol  + ')';
	  else
		  num = symbolLeft ? symbol + num : num + symbol;

	  return [num];
  },
  Concat: function (profile,data,context)
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
  Capitalize: function (profile,data,context)
  {
	  var str = ajaxart.totext_array(data);
	  var mode = aa_text(data,profile,'Mode',context);
	  if (mode == "capital to separate words")
		  return [aa_text_capitalizeToSeperateWords(str)];
	  if (mode == "upper to separate capital")
	  {
		  var out = "";
		  str = str.toLowerCase();
		  var begin_of_word=true;
		  var counter=0;
		  while (counter < str.length)
		  {
			  var ch = str.charAt(counter);
			  var ch_str = "" +ch;

			  if (ch == '_')
			  {
				  begin_of_word= true;
				  out = out + " ";
				  counter++;
				  continue;
			  }

			  if (begin_of_word)
				  out = out + ch_str.toUpperCase();
			  else 
				  out = out + ch_str;

			  begin_of_word= false;
			  counter++;
		  }
		  return [out];
	  }
	  if (mode == "split and capitalize words")
	  {
		  var out = "";
		  //str = str.toLowerCase();
		  var begin_of_word=true;
		  var counter=0;
		  while (counter < str.length)
		  {
			  var ch = str.charAt(counter);
			  var ch_str = "" +ch;

			  if (ch == '_')
			  {
				  begin_of_word= true;
				  out = out + " ";
				  counter++;
				  continue;
			  }

			  if (ch >= 'A' && ch <= 'Z' && counter != 0)
			  {
				  begin_of_word= true;
				  out = out + " ";
			  }

			  if (begin_of_word)
				  out = out + ch_str.toUpperCase();
			  else 
				  out = out + ch_str;

			  begin_of_word= false;
			  counter++;
		  }
		  return [out];
	  }
	  if (mode == "separate words to capital")
	  {
		  var out = "";
		  var counter=0;
		  while (counter < str.length)
		  {
			  var ch = str.charAt(counter);
			  if (counter == 0) out += str.charAt(counter).toUpperCase();
			  else if (' !@#$%^&*()./'.indexOf(ch) != -1) {
				 if (counter+1 < str.length)  {
					 out += str.charAt(counter+1).toUpperCase();
					 counter++;
				 }
			  }
			  else out += str.charAt(counter);
			  
			  counter++;
		  }
		  str = out;
	  }
	  if (mode == "capital each word")
	  {
		  var out = "";
		  var counter=0;
		  while (counter < str.length)
		  {
			  if (counter == 0) out += str.charAt(counter).toUpperCase();
			  else if (str.charAt(counter) == " ") {
				 if (counter+1 < str.length)  {
					 out += " " + str.charAt(counter+1).toUpperCase();
					 counter++;
				 }
			  }
			  else out += str.charAt(counter);
			  
			  counter++;
		  }
		  str = out;
	  }
	  return [str];
  },
  Replace: function (profile,data,params)
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
  ToIdText: function (profile,data,context)
  {
	return [aa_string2id(aa_totext(data))];
  },
  ToId: function (profile,data,context)
  {
	  var result = aa_string2id(aa_text(data,profile,'Text',context));
	  var usedArr = ajaxart.run(data,profile,'UsedIDs',context),usedIds=",";
	  
	  if (usedArr.length == 0) return [result];
	  for (var i=0;i<usedArr.length;i++) usedIds += aa_totext([usedArr[i]]) + ',';
	  
	  while ( usedIds.indexOf(','+result+',') > -1 ) {
		  var lastDigit = result.charAt(result.length-1);
		  if (lastDigit > '0' && lastDigit < '8')
		    result = result.substring(0,result.length-1) + (parseInt(lastDigit)+1);
		  else if (lastDigit == '9')
		    result = result.substring(0,result.length-1) + '10';
		  else 
			result = result + '1';
	  }
	  return [result];  
  },
  Translate: function (profile,data,context)
  {
	  var text = aa_text(data,profile,'Text',context);
	  var out = ajaxart_multilang_text(text,context);
	  return [out];
  },
  TranslatePattern: function (profile,data,context)
  {
	  return ajaxart_multilang_run(data,profile,'Pattern',context);
  },
  ReplaceWithRegex: function (profile,data,params)
  {
	  var pattern = aa_text(data,profile,'Pattern',params);
	  var replaceWith = aa_text(data,profile,'ReplaceWith',params);
	  var flags = aa_text(data,profile,'Flags',params);
	  var str = aa_text(data,profile,'Text',params);
	  try
	  {
		  return [ str.replace(new RegExp(pattern,flags),replaceWith) ];
	  }
	  catch(e) {}
	  return [];
  },
  ReplaceMulti: function (profile,data,params)
  {
	  var find = ajaxart.run(data,profile,'Find',params);
	  var replaceWith = ajaxart.run(data,profile,'ReplaceWith',params);
	  var replaceAll = aa_bool(data,profile,'ReplaceAll',params);
	  var str = aa_text(data,profile,'Text',params);
	  
	  if (find.length != replaceWith.length) return data;
	  for (var i=0; i<find.length; i++) {
			if (replaceAll)
				var reg = new RegExp(find[i], "g");
			else
				var reg = new RegExp(find[i]);
			str = str.replace(reg, replaceWith[i]);
	  }
	  return [ str ];
  },
  MultiLangSuite: function (profile,data,context)
  {
	 var lang = aa_text(data,profile,'Language',context);

	 aa_mlTable = typeof(aa_mlTable) == 'undefined' ? {} : aa_mlTable;
	 aa_mlTable[lang] = aa_mlTable[lang] || {};
	 var trList = aa_mlTable[lang];
	 
	 var items = ajaxart.xml.xpath(profile,'Pattern');
	 for(var k=0;k<items.length;k++) {
		trList[items[k].getAttribute('Original')] = items[k].getAttribute('T') || items[k].getAttribute('Tranlation');
	 }
	 
	 var items = ajaxart.xml.xpath(profile,'item');
	 for(var i=0;i<items.length;i++) {
		 var v = items[i].getAttribute('v') || '';
		 if (v != '')
		   trList[items[i].getAttribute('k')] = v;
	 }
  },
  Between: function (profile,data,params)
  {
    var from = aa_text(data,profile,'From',params);
    var to = aa_text(data,profile,'To',params);
    var includeFrom = aa_bool(data,profile,'IncludeFrom',params);
    var includeTo = aa_bool(data,profile,'IncludeTo',params);

	var str = ajaxart.totext_array(data);
	var index_from = str.indexOf(from);
	if (index_from != -1)
	{
		if (includeFrom)
			str = str.substring(index_from);
		else
			str = str.substring(index_from+from.length);
	}
		
	var index_to = str.indexOf(to);
	if (index_to != -1)
	{
		if (includeTo)
			str = str.substring(0,index_to+to.length);
		else
			str = str.substring(0,index_to);
	}
    return [str];
  },
  PromoteStartingWith: function (profile,data,context)
  {
	  var with1 = aa_text(data,profile,'StartsWith',context);
	  if (with1 == '') return [];
	  var out = [];
	  var out2 = [];
	  
	  for(var i=0;i<data.length;i++) {
		  var text = ajaxart.totext_item(data[i]);
		  if (text.indexOf(with1) == 0) out.push(data[i]); else out2.push(data[i]);
	  }
	  for (var i=0;i<out2.length;i++)
		  out.push(out2[i]);
	  
	  return out;
  },
  SplitByCommas: function (profile,data,context)
  {
	  var text = aa_text(data,profile,'Text',context);
	  var spl = text.split(',');
	  var out = [];
	  for(var i=0;i<spl.length;i++)
		  if (spl[i].length > 0) out.push(spl[i]);
	  
	  return out;
  },
  Pad: function (profile,data,context)
  {
	    var length = aa_text(data,profile,'Length',context);
	    var filler = aa_int(data,profile,'Filler',context);
	    var str = aa_text(data,profile,'Text',context);
	
	    while (str.length < length)
	        str = filler + str;
	   
	    return [str];
  },
  AddToCommaText: function (profile,data,context)
  {
	var text = ajaxart.run(data,profile,'Text',context);
	var toadd = aa_text(data,profile,'ToAdd',context);
	var text_str = aa_totext(text);
	if ((','+text_str+',').indexOf(','+toadd+',') == -1) {
		var val = (text_str == "") ? toadd : text_str + ',' + toadd;
		ajaxart.writevalue(text,[val]);
	}
  },
  RemoveFromCommaText: function (profile,data,context)
  {
	  var text = ajaxart.run(data,profile,'Text',context);
	  var toremove = aa_text(data,profile,'ToRemove',context);
	  var text_str = aa_totext(text);
	  var pos = (','+text_str+',').indexOf(','+toremove+','); 
	  if (pos > -1) {
		  var val = text_str.substring(0,pos-1) + text_str.substring(pos+toremove.length+1);  
		  ajaxart.writevalue(text,[val]);
	  }
  },
  RemoveSuffix: function (profile,data,context)
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
  ToLowerCase: function (profile,data,context)
  {
	  return [ ajaxart.totext_array(data).toLowerCase() ];
  },
  ToUpperCase: function (profile,data,context)
  {
	  return [ ajaxart.totext_array(data).toUpperCase() ];
  },
  ExtractPrefix: function (profile,data,context)
  {
	 var sep = aa_text(data,profile,'Separator',context);
	 var useRegex = aa_bool(data,profile,'UseRegex',context);
	 var text = ajaxart.totext_array(data);
	 
	 if (useRegex)
		 var index = text.search(sep);
	 else
		 var index = text.indexOf(sep);
	 
	 if (index == -1) return [];
	 var result = '';
	 if (aa_bool(data,profile,'KeepSeparator',context))
		 result = text.substring(0,index+sep.length);
	 else
		 result = text.substring(0,index);
	 if (result.legnth == 0)
		 result = aa_text(data,profile,'Default',context);
	 return [result];
  },
  RemovePrefix: function (profile,data,context)
  {
    var sep = aa_text(data,profile,'Separator',context);
    var prefix = aa_text(data,profile,'Prefix',context);
    var text = ajaxart.totext_array(data);
    if (prefix != "") {
    	if (text.indexOf(prefix) == 0)
    		return [text.substring(prefix.length)];
    }
    if (sep == "") return [text];
    var index = text.indexOf(sep);
    if (index == -1) return [text];
    return [text.substring(index+sep.length)];
  },
  CountOfSubtext: function (profile,data,params)
  {
    var subtext = aa_text(data,profile,'Text',params);
    var text = ajaxart.totext_array(data);
    if (subtext.length == 0) return ["0"];
    
    var arr = text.split(subtext);
    return ["" + (arr.length-1)];
  },
  Encode: function (profile,data,params)
  {
    var text = ajaxart.totext_array(data);
    var result = unescape( encodeURIComponent(text));
    return [result];
  },
  FastFindResults: function (profile,data,context)
  {
    var patternText = aa_text(data,profile,'Pattern',context).toLowerCase();
    var maxItems = aa_int(data,profile,'MaxItems',context);
    var cacheIdentifier = aa_text(data,profile,'CacheIdentifier',context);
    var searchFields = ajaxart.run(data,profile,'ItemSearchFields',context);
    
    var patterns = patternText.split(' ');
    var pattern = patterns[0];
    var pat2 = null;
    if (patterns.length > 0) pat2 = patterns[1];

    var items = null;
    if (cacheIdentifier.length > 0) items = aa_text_cacheFastFind[cacheIdentifier];
    if (items == null)  {
        var control = ajaxart.getControlElement(context);
    	if (control.length > 0)
    		items = control[0]["FastFindControl"];
    }
    
    if (items == null) {
      var control = ajaxart.getControlElement(context);
      items = {};
      items.texts = [];
      var cacheIdentifier = aa_text(data,profile,'CacheIdentifier',context);
      items.values = ajaxart.run(data,profile,'AllItems',context);
      for (var i=0; i<items.values.length; i++) {
      	var item_text = "";
      	if (searchFields.length > 0) {
      		for(var j in searchFields) {
    				var field = ajaxart.xml.xpath(items.values[i],searchFields[j],false);
    				if (field.length > 0 && field[0].nodeValue != null) item_text += field[0].nodeValue + " ";
      		}
      	}
      	else
      		item_text = aa_text([ items.values[i] ],profile,'ItemText',context);
      	
      	items.texts.push( item_text.toLowerCase() );
      }
      
      if (cacheIdentifier.length > 0) 
    	  aa_text_cacheFastFind[cacheIdentifier] = items;
      else if (control.length > 0)
      	control[0]["FastFindControl"] = items;
    }
    
    var out = [];
    var found_indexes = {};
    for (var i=0; i<items.texts.length; i++) {
    	
    	var itemText = items.texts[i];
    	if (itemText.indexOf(pattern) == 0) // starts with
    		if (pat2 == null || itemText.indexOf(pat2) > -1) {
    			out.push(items.values[i]);
    			found_indexes[i] = true;
        	if (maxItems >0 && out.length >= maxItems) break;
    		}
    }
    for (var i=0; i<items.texts.length; i++) {
    	var itemText = items.texts[i];
   		if (itemText.indexOf(pattern) > -1)
   			if (pat2 == null || itemText.indexOf(pat2) > -1)
   				if (found_indexes[i] != true) {
   					out.push(items.values[i]);
   					if (maxItems >0 && out.length >= maxItems) break;
   				}
    }
    return out;
  },
  MatchesRegex: function (profile,data,context)
  {
    var pattern = '^' + aa_text(data,profile,'Expression',context) + '$';
    var text = aa_text(data,profile,'Text',context);
    
    return text.match(pattern) ? ['true'] : [];
  },
  FindInText: function (profile,data,context)
  {
    var pattern = aa_text(data,profile,'Pattern',context);
    var useRegex = aa_bool(data,profile,'UseRegex',context);
    var text = ajaxart.totext_array(data);
    var result = -1;
    if (useRegex)
    	result = text.search(pattern);
    else
    	result = text.indexOf(pattern);
    return [ result != -1 ];
  },
  UrlEncoding: function (profile,data,context)
  {
	  var urlpart = ajaxart.totext_array(data);
	  var type = aa_text(data,profile,'Type',context);
	  if (type == "encode")
		  return [ encodeURIComponent( urlpart ) ];
	  else
		  return [ decodeURIComponent( urlpart )];
  },
  Substring: function (profile,data,context)
  {	
	  var start = aa_int(data,profile,'Start',context);
	  var stop = aa_int(data,profile,'Stop',context);
	  var text = aa_text(data,profile,'Text',context);
	  if (stop != null && stop != "" && !isNaN(stop) )
		  return [ text.substring(start-1,stop-1) ];
	  else
		  return [ text.substring(start-1) ];
  },
  ReplaceNewLines: function (profile,data,context)
  {
  	var text = ajaxart.totext(data);
  	return [text];
  },
  TimeDifferance: function (profile,data,context)
  {
	  var earlierDate = aa_text(data,profile,'EarlierDate',context);
	  var laterDate = aa_text(data,profile,'LaterDate',context);
	  var showDifferenaceIn = aa_text(data,profile,'ShowDifferenaceIn',context);

	  if (earlierDate == "" || laterDate == "") return [];
	  var earlier = aadate_stdDate2DateObj(earlierDate);
	  var later = aadate_stdDate2DateObj(laterDate);
	  var diff = later.getTime() - earlier.getTime();
	  var years = later.getFullYear() - earlier.getFullYear();
	  if (later.getMonth() < earlier.getMonth()) years--;
	  var months = (later.getMonth() - earlier.getMonth() + 12) % 12;
	  if (later.getDate() < earlier.getDate()) months--;
	  var days = (later.getDate() - earlier.getDate() + 31) % 31;	// may be a bug : 10/10 to 12/12
	  if (later.getHours() < earlier.getHours()) days--;
	  var hours = (later.getHours() - earlier.getHours() + 24) % 24;
	  if (later.getMinutes() < earlier.getMinutes()) hours--;
	  var minutes = (later.getMinutes() - earlier.getMinutes() + 60) % 60;
	  var plurals = [ "Years", "Months", "Days", "Hours", "Minutes" ];
	  var singulars = [ "Year", "Month", "Day", "Hour", "Minute" ];
	  
	  for(var i=0;i<plurals.length;i++) plurals[i] = ajaxart_multilang_text(plurals[i],context);
	  for(var i=0;i<singulars.length;i++) singulars[i] = ajaxart_multilang_text(singulars[i],context);
	  
	  var single_pattern = "1 %$Time%";
	  var plural_pattern = "%$Amount% %$Time%";
	  var seperator = ajaxart_multilang_text(' and ',context);
	  var values = [ years, months, days, hours, minutes  ];
	  if (showDifferenaceIn == "free text, two main differances" || showDifferenaceIn == "free text, first main differance only") {
		  for (var i=0; i<values.length; i++) {
			  if (values[i] == 0) continue;
			  var str;
			  if (values[i] == 1)
				  str = "1 " + singulars[i];	
			  else
				  str = values[i] + " " + plurals[i];
			  if (showDifferenaceIn == "free text, two main differances" && i+1<values.length && values[i+1] != 0) {
				  str += seperator;
				  str += (values[i+1] == 1) ? "1 " + singulars[i+1] : values[i+1] + " " + plurals[i+1];
			  }
			  return [str];
		  }
	  }
	  switch (showDifferenaceIn) {
	  case "years" : return [ years ];
	  case "months" : return [ months + years*12 ];
	  case "days" : return [ Math.floor(diff / (1000*60*60*24) ) ];
	  case "hours" : return [ Math.floor(diff / (1000*60*60) ) ];
	  case "minutes" : return [ Math.floor(diff / (1000*60) ) ];
	  }
	  return [""];
  },
  Reverse: function (profile,data,context)
  {
	  var text = aa_text(data,profile,'Text',context);
	  var reverse = "";
	  for (i=0;i<text.length;i++)
		  reverse = reverse + text.charAt(text.length-i-1);
	  return [reverse];
  },
  DecodeMimeType: function (profile,data,context)
  {
	  var win1255Lookup = ['00','01','02','03','04','05','06','07','08','09','0a','0b','0c','0d','0e','0f','10','11','12','13','14','15','16','17','18','19','1a','1b','1c','1d','1e','1f','20','21','22','23','24','25','26','27','28','29','2a','2b','2c','2d','2e','2f','30','31','32','33','34','35','36','37','38','39','3a','3b','3c','3d','3e','3f','40','41','42','43','44','45','46','47','48','49','4a','4b','4c','4d','4e','4f','50','51','52','53','54','55','56','57','58','59','5a','5b','5c','5d','5e','5f','60','61','62','63','64','65','66','67','68','69','6a','6b','6c','6d','6e','6f','70','71','72','73','74','75','76','77','78','79','7a','7b','7c','7d','7e','7f','20ac','81','201a','0192','201e','2026','2020','2021','02c6','2030','8a','2039','8c','8d','8e','8f','90','2018','2019','201c','201d','2022','2013','2014','02dc','2122','9a','203a','9c','9d','9e','9f','a0','a1','a2','a3','20aa','a5','a6','a7','a8','a9','d7','ab','ac','ad','ae','af','b0','b1','b2','b3','b4','b5','b6','b7','b8','b9','f7','bb','bc','bd','be','bf','05b0','05b1','05b2','05b3','05b4','05b5','05b6','05b7','05b8','05b9','05ba','05bb','05bc','05bd','05be','05bf','05c0','05c1','05c2','05c3','05f0','05f1','05f2','05f3','05f4','f88d','f88e','f88f','f890','f891','f892','f893','05d0','05d1','05d2','05d3','05d4','05d5','05d6','05d7','05d8','05d9','05da','05db','05dc','05dd','05de','05df','05e0','05e1','05e2','05e3','05e4','05e5','05e6','05e7','05e8','05e9','05ea','f894','f895','200e','200f','f896' ];
	  function uTF8DecodeOfWin1255(input) {
		  var result = '';
		  for(var i=0;i<input.length;i++)
		  {
			  c = input.charCodeAt(i);
			  if (c < 256)
			  result += String.fromCharCode(parseInt(win1255Lookup[c],16));
		  }
		  return result;
	  }
		function uTF8Decode(input,charset) {
			if (charset=='windows-1255') 
				return uTF8DecodeOfWin1255(input);
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;
			while ( i < input.length ) {
				c = input.charCodeAt(i);
				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				} else if ((c > 191) && (c < 224)) {
					c2 = input.charCodeAt(i+1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				} else {
					c2 = input.charCodeAt(i+1);
					c3 = input.charCodeAt(i+2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
			}
			return string;
		}

//		function uTF8Decode(input,charset) {
//			var string = "";
//			var i = 0;
//			var c = c1 = c2 = 0;
//			while ( i < input.length ) {
//				c = input.charCodeAt(i);
//				if (c >= 32 && c < 128) {
//					string += String.fromCharCode(c);
//					i++;
//				} else if ((c >= 224) && (c < 256) && (charset=='windows-1255')) {
//					string += String.fromCharCode(c+1488-224);
//					i++;
//				} else if (c == 0) { 
//					i++;string += ' ';
//				} else if (c == 10 || c == 13) { 
//					string += '\n'; i++;
//				} else {
//					string += '?' + c + '?';
//					i++;
//				}
//			}
//			return string;
//		}
		var keyString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		function base64Decode(input,charset) {
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
			while (i < input.length) {
				enc1 = keyString.indexOf(input.charAt(i++));
				enc2 = keyString.indexOf(input.charAt(i++));
				enc3 = keyString.indexOf(input.charAt(i++));
				enc4 = keyString.indexOf(input.charAt(i++));
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
				output = output + String.fromCharCode(chr1);
				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
			}
			output = uTF8Decode(output,charset);
			return output;
		}

		function QTDecode(input,charset) {
			var output = "";
			var i = 0;
			while (i < input.length)
			{
				if (input.charAt(i) != '=')
				{
					output += input.charAt(i);
					i++;
				}
				else
				{
					var code = parseInt("0x"+input.charAt(i+1)+input.charAt(i+2));
					i += 3;
					output += String.fromCharCode(code);
				}
			}
			output = uTF8Decode(output,charset);
			return output;
		}


	  var text = aa_text(data,profile,'Text',context);
	  var encoding = aa_text(data,profile,'Encoding',context);
	  var charset = aa_text(data,profile,'Charset',context);
	  var result = [text];
	  if (encoding == "auto" && text.indexOf('=?') == 0)
	  {
		  var parts = text.split('?');
		  var charset = parts[1] || charset;
		  var type = parts[2];
		  var content = parts[3];
		  content = content.replace(/ =[\n\r]+/mg,'')
		  if (type == 'B') 
			  result = [base64Decode(content,charset)];
		  if (type == 'Q')
			  result = [QTDecode(content,charset)];
	  }
	  else if (encoding == "Base64")
		  result = [base64Decode(text,charset)];
	  else if (encoding == "Quoted Printable")
		  result = [QTDecode(text.replace(/ =[\n\r]+/mg,''),charset)];
	  return result;
  },
  SplitLines: function (profile,data,context)
  {
	  var text = aa_text(data,profile,'Text',context);
	  var newLineChars = aa_text(data,profile,'NewLineChars',context);
	  
	  return text.split(newLineChars);
  }
});
function aa_text_trim(str) {
    return str.replace(/^\s*/, "").replace(/\s*$/, "");
}

function aa_text_comma_seperate(text) // ignore \,
{
	var out = [];
	var last_index = 0;
	for (var i=0; i<text.length; i++) {
		if (text[i] == ',') {
			if (i == 0)
				last_index++;
			else if (text[i-1] != '\\') {
				var t = text.substring(last_index,i);
				if (t.indexOf('\\,') != -1)
					t = t.replace('\\,',','); 
				out.push(t);
				last_index = i+1;
			}
		}
	}
	if (last_index < text.length) {
		var t = text.substring(last_index);
		if (t.indexOf('\\,') != -1)
			t = t.replace('\\,',','); 
		out.push(t);
	}
	return out;
}
function aa_strreverse(str)
{
  return str.split('').reverse().join('');
}

function aa_base64ArrayBuffer(arrayBuffer) {
	  var base64    = ''
	  var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

	  var bytes         = new Uint8Array(arrayBuffer)
	  var byteLength    = bytes.byteLength
	  var byteRemainder = byteLength % 3
	  var mainLength    = byteLength - byteRemainder

	  var a, b, c, d
	  var chunk

	  // Main loop deals with bytes in chunks of 3
	  for (var i = 0; i < mainLength; i = i + 3) {
	    // Combine the three bytes into a single integer
	    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

	    // Use bitmasks to extract 6-bit segments from the triplet
	    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
	    b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
	    c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
	    d = chunk & 63               // 63       = 2^6 - 1

	    // Convert the raw binary segments to the appropriate ASCII encoding
	    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
	  }

	  // Deal with the remaining bytes and padding
	  if (byteRemainder == 1) {
	    chunk = bytes[mainLength]

	    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

	    // Set the 4 least significant bits to zero
	    b = (chunk & 3)   << 4 // 3   = 2^2 - 1

	    base64 += encodings[a] + encodings[b] + '=='
	  } else if (byteRemainder == 2) {
	    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

	    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
	    b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

	    // Set the 2 least significant bits to zero
	    c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

	    base64 += encodings[a] + encodings[b] + encodings[c] + '='
	  }

	  return base64
}

function aa_capitalize_each_word(str)
{
	  var out = "";
	  var counter=0;
	  while (counter < str.length)
	  {
		  if (counter == 0) out += str.charAt(counter).toUpperCase();
		  else if (str.charAt(counter) == " ") {
			 if (counter+1 < str.length)  {
				 out += " " + str.charAt(counter+1).toUpperCase();
				 counter++;
			 }
		  }
		  else out += str.charAt(counter);
		  
		  counter++;
	  }
	  return out;
}





ajaxart.gcs.gchart =
{
	GoogleChart: function (profile,data,context)
	{
		var graph = aa_generic_graph(data,profile,context);
		graph.OnClick =  function(selection) 
		{
   			var wrapper  = this.items[selection[0].row];
   			var item = wrapper.__item || wrapper;
   			var ctx = aa_ctx(context,{_ItemsOfOperation: [item]})
   			ajaxart.run([item],profile,'OnClick',ctx);
   		}
		graph.PrepareGraphData= function(gdata) {
		  var cntr = context.vars._Cntr[0];
		  var dataholder_cntr = context.vars.DataHolderCntr && context.vars.DataHolderCntr[0];
		  if (!dataholder_cntr) return [];
		  var fields = dataholder_cntr.DataHolder.Fields;

		  var type = aa_text(data,profile,'Type',context);
		  var requiresNumericLabel = type == 'ScatterChart';
		  var dateAsObject = aa_text(data,profile,'Type',context) == 'AnnotatedTimeLine';
		  //this.dataview = context.vars.DataView ? context.vars.DataView[0] : cntr.DataHolder.UserDataView;
		  var items = this.items = aa_items(cntr);
		  var labelField = aa_fieldById(aa_text(data,profile,'LabelField',context),fields);
		  var amountField = aa_fieldById(aa_text(data,profile,'AmountField',context),fields);
		  var amount2Field = aa_fieldById(aa_text(data,profile,'Amount2Field',context),fields);
		  var amount3Field = aa_fieldById(aa_text(data,profile,'Amount3Field',context),fields);
		  if (labelField == null) // look for label
			  labelField = aa_fieldById('Name',fields) || aa_fieldById('Id',fields) || aa_fieldById('Label',fields);
		  if (labelField == null) // look for first date
			  for(var i in fields)
				  if (fields[i].IsDate)
				  {
					  labelField = fields[i];
					  break;
				  }
		  if (amountField == null) // look for first numeric
			  for(var i in fields)
				  if (fields[i].IsNumber)
				  {
					  amountField = fields[i];
					  break;
				  }
		  if (amountField == null || labelField == null) return;
		  this.Params.hAxis = {title: labelField.Title};
		  if (!amount2Field)
			  this.Params.vAxis = {title: amountField.Title};

		  if (dateAsObject && labelField.IsDate)
			  gdata.addColumn('date', labelField.Title);
		  else if (labelField.IsNumber && requiresNumericLabel)
			  gdata.addColumn('number', labelField.Title);
		  else
			  gdata.addColumn('string', labelField.Title);
		  gdata.addColumn('number', amountField.Title);
		  if (amount2Field) gdata.addColumn('number', amount2Field.Title);
		  if (amount3Field) gdata.addColumn('number', amount3Field.Title);
		  
		  gdata.addRows(items.length);
		  for(var i=0;i<items.length;i++) {
        	var item = items[i];
        	var label = ajaxart.totext_array(ajaxart_field_calc_field_data(labelField,[item],context));
        	var amount = parseFloat(ajaxart.totext_array(ajaxart_field_calc_field_data(amountField,[item],context))) || 0;
			if (dateAsObject && labelField.IsDate)
				gdata.setValue(i, 1, new Date(amount));
			else if (requiresNumericLabel) 
				gdata.setValue(i, 0, parseFloat(label) || 0);
			else
				gdata.setValue(i, 0, label || '');
			gdata.setValue(i, 1, amount);
			if (amount2Field) gdata.setValue(i, 2, parseFloat(ajaxart.totext_array(ajaxart_field_calc_field_data(amount2Field,[item],context))) || 0);
			if (amount3Field) gdata.setValue(i, 3, parseFloat(ajaxart.totext_array(ajaxart_field_calc_field_data(amount3Field,[item],context))) || 0);
		  }
	   }
	   var out = aa_create_graph_div(graph);
	   // for tests
	   var test_string = '';
	   var cntr = context.vars._Cntr[0];
	   var items = aa_items(cntr);
 	   var dataholder_cntr = context.vars.DataHolderCntr && context.vars.DataHolderCntr[0];
	   var fields = dataholder_cntr.DataHolder.Fields;
	   var labelField = aa_fieldById(aa_text(data,profile,'LabelField',context),fields);
	   var amountField = aa_fieldById(aa_text(data,profile,'AmountField',context),fields);
	   for(var i=0;i<items.length;i++)
		   test_string += ajaxart.totext_array(ajaxart_field_calc_field_data(labelField,[items[i]],context)) + ' - ' +  
		                  ajaxart.totext_array(ajaxart_field_calc_field_data(amountField,[items[i]],context));
	   var test_div = document.createElement('div');
	   test_div.className= 'aa_test';
	   test_div.setAttribute('test_string',test_string);
	   out.appendChild(test_div);
	   
	   return [out];
	},
	PieChart: function (profile,data,context) // depricated
	{
		var chartObj = { isObject: true, Items: ajaxart.run(data,profile,'Items',context) }
		chartObj.Title = aa_text(data,profile,'Title',context);
		chartObj.ChartClass = 'google.visualization.PieChart';
		chartObj.FrameWidth = chartObj.FrameHeight = "400px"; 
			
		ajaxart_addMethod(chartObj,'ItemText',profile,'ItemText',context);
		ajaxart_addMethod(chartObj,'ItemAmount',profile,'ItemAmount',context);
		ajaxart_addMethod(chartObj,'OnItemClick',profile,'OnItemClick',context);
		
		return [ aa_piechart(chartObj,context) ];
	},		
	TimelineChart: function (profile,data,context) // depricated
	{
		var chartObj = { isObject: true, Items: ajaxart.run(data,profile,'Items',context).reverse() }
		
		chartObj.Title = aa_text(data,profile,'Title',context);
		chartObj.ChartClass = 'google.visualization.AreaChart';
		chartObj.GoogleParams = aa_text(data,profile,'GoogleParams',context);
		chartObj.FrameWidth = aa_text(data,profile,'FrameWidth',context);
		chartObj.FrameHeight = aa_text(data,profile,'FrameHeight',context);
			
		ajaxart_addMethod(chartObj,'ItemText',profile,'Date',context);
		ajaxart_addMethod(chartObj,'ItemAmount',profile,'ItemAmount',context);
		ajaxart_addMethod(chartObj,'OnItemClick',profile,'OnItemClick',context);
		
		return [ aa_piechart(chartObj,context) ];
	}
}

function aa_piechart(chartObj,context)  // depricated
{
	var out = jQuery('<iframe src="lib/googlechart.html?ver='+ajaxart.build_version+'" style=" border-width:0 " width="'+chartObj.FrameWidth+'" height="'+chartObj.FrameHeight+'" frameborder="0" scrolling="no"/>')[0];
	out.info = { width: 450, height: 300 , chartClass: chartObj.ChartClass, title: chartObj.Title, googleParams: chartObj.GoogleParams};
	//out.info.googleParams = "width: '" + chartObj.Width + "', height: '" + chartObj.Height + "'";
	out.info.googleParams = '';
	if (chartObj.GoogleParams != "") out.info.googleParams = chartObj.GoogleParams;
	
	out.info.data = [];
	for(var i=0;i<chartObj.Items.length;i++) {
		var item = [ chartObj.Items[i] ], obj = {item: item};
		obj.text = aa_totext(ajaxart_runMethod(item,chartObj,'ItemText',context));
		obj.amount = aa_toint(ajaxart_runMethod(item,chartObj,'ItemAmount',context));
		obj.onclick = function(obj) { ajaxart_runMethod(obj.item,chartObj,'OnItemClick',context); }
		out.info.data.push(obj);
	}
	return out;
}
function aa_load_googlegraph() {
	if (window.loading_googlegraphs) return;
	   window.loading_googlegraphs = true;
	   jQuery.ajax({
		   url: (window.location.host1 == 'localhost') ? 'lib/googlechart.js' : 'https://www.google.com/jsapi',  
		   dataType: 'script',
		   success: function(){
		   		jQuery('.aa_waiting_for_ggraph_load').each(function() { this.LoadGraph();});
		 	}
	   });
}
function aa_generic_graph(data,profile,context)
{
	   var graph = {
		   isObject: true,
		   Packages: ["corechart"],
		   Params: {
				width: aa_int(data,profile,'FrameWidth',context), 
				height: aa_int(data,profile,'FrameHeight',context), 
				title: aa_text(data,profile,'Title',context),
				isStacked: aa_bool(data,profile,'Stacked',context),
				legend: aa_text(data,profile,'Legend',context)
				},
		   Class: 'google.visualization.' + aa_text(data,profile,'Type',context),
		   drawChart: function() {
			        var data = new google.visualization.DataTable();
			        this.PrepareGraphData(data);
			        var chart;
			        var out = this.div;
			        var newChart = "new "+this.Class+"(out)"; // should be called without eval
			        try {
			        	chart = eval(newChart);
			        } catch(e) {}
			        chart.draw(data, this.Params);
			        google.visualization.events.addListener(chart, 'select', function(graph) { return function(e) {
			            var selection = this.getSelection();
			            if (!selection) return;
			            if (graph.OnClick)
			            	graph.OnClick(selection);
			        }}(graph));
			}
	   }
	   return graph;
}
function aa_create_graph_div(graph)
{
	   var out = document.createElement('div');
	   out.graph= graph;
	   graph.div = out;
 	   function ChartFactory(div) { return function() 
 	  	   { 
 		   		jQuery(div).removeClass("aa_waiting_for_ggraph_load");
 		   		div.graph.drawChart();
 	  	   }
 	   };

	   if (!window.google)
	   {
		   out.className="aa_waiting_for_ggraph_load";
		   out.LoadGraph = function()
		   {
			   google.load("visualization", "1", {packages:graph.Packages, callback: ChartFactory(this)});
		   }
		   aa_load_googlegraph();
	   }
	   else
	   {
		   google.load("visualization", "1", {packages:graph.Packages, callback: ChartFactory(out)});
	   }
	   return out;
}

// fusion charts
ajaxart.gcs.fusion_chart =
{
	FusionChart: function (profile,data,context)
	{
	   function load(out)
	   {
		   var xml = ajaxart.runNativeHelper(out.Items,profile,'GraphXml',aa_ctx(context,{ChartId: [out.getAttribute('id')], Items: out.Items}));
		   var swf = '/ajaxart/lib/chart/charts_library/FCF_' + (aa_bool(data,profile,'Stacked',context) ? 'Stacked' : 'MS') + aa_text(data,profile,'Type',context) + ".swf";
		   var myChart = new FusionCharts(swf, "myChartId", aa_text(data,profile,'Width',context), aa_text(data,profile,'Height',context)); 
		   var xmlAsText = ajaxart.xml2text(xml);
		   myChart.setDataXML(xmlAsText);
		   myChart.render(out);
	   }

	   if (! window.aa_FusionChartId) aa_FusionChartId =0;
	   aa_FusionChartId++;
	   var out = document.createElement('div');
	   out.setAttribute('id','aa_fusion_chart_' + aa_FusionChartId);
	   var items = out.Items = aa_items(context.vars._Cntr[0]);
	   
	   out.Profile = profile;
	   out.Context = context;
	   
	   // add index to items
	   for(var i=0;i<items.length;i++)
		   items[i].__Index = i;

	   if (!window.infosoftglobal)
	   {
		   out.className="aa_waiting_for_fusion_chart_load";
		   out.LoadGraph = function() 
		   {
			   load(this);
		   }
		   aa_load_fusion_chart();
	   }
	   else
		   load(out);

	   return [out];
	}
}

function aa_fusion_eventHandler(chartId,labelField,amountFieldId,index)
{
	var out = jQuery().find('#' + chartId)[0];
	if (!out) return;
	var item = out.Items[parseInt(index)+1];
	ajaxart.run([item],out.Profile,'OnClick',out.Context);
}
function aa_load_fusion_chart() {
	if (window.loading_fusion_chart) return;
	   window.loading_fusion_chart = true;
	   jQuery.ajax({
		   url: 'lib/chart/charts_library/FusionCharts.js', 
		   dataType: 'script',
		   success: function(){
		   		jQuery('.aa_waiting_for_fusion_chart_load').each(function() { this.LoadGraph();});
		 	}
	   });
}


//AA BeginModule
aa_gcs("operation", {
		RunInOperationContext: function (profile,data,context)
		{
			var jElem = jQuery(context.vars.ControlElement);
			var itemElem = null;
			while (jElem.length > 0) {
				if (jElem.hasClass('aa_item') && !itemElem) itemElem = jElem[0];
				if (jElem.hasClass('aa_layoutgroup') ) itemElem = null; // try the next one
				if (jElem.hasClass('aa_container') && itemElem ) break; // all found
				
				jElem = jElem.parent();
			}
			if (itemElem == null) var ctx = context;
			else var ctx = aa_ctx(context,{_ElemsOfOperation: [itemElem] , _ItemsOfOperation: itemElem.ItemData , _Items: context.vars._Cntr[0].Items });
			
			return ajaxart.run(data,profile,'Action',ctx);
		},
		OpenSecondaryItemDetails: function (profile,data,context)
		{
			var dataitems = context.vars._Cntr[0].Items[0];
			var newContext = aa_ctx(context,{ _Transactional: ajaxart.run(data,profile,'Transactional',context), 
				_InnerItem: context.vars._ItemsOfOperation });
			var subset = newContext.vars._InnerItems = ajaxart_runMethod(data,dataitems,'Subset',newContext);
			if (subset.length == 0) {
			  var subsetObj = { isObject: true , Items: newContext.vars._InnerItem };
			  subsetObj.Save = function(data1,ctx) {
				  var info = aa_getXmlInfo(this.Items[0],context);
				  if (info.Save) return info.Save(data1,ctx);
			  }
			  subset = newContext.vars._InnerItems = [subsetObj];
			}
			if (subset.length == 0) return []; 
			if (aa_bool(data,profile,'ReadOnly',context))
				subset[0].ReadOnly = ["true"];

			var openCtrl_func = function(subset) { return function() 
			{
				var cntr = context.vars._Cntr[0];
				var item = [subset.Items[0]];
				ajaxart.run(item,profile,'ChangeItemBeforeOpen',context);
				var page_params = {isObject:true, DataItems: subset};
				var newContext = aa_ctx(context,{ _InnerItems: [subset], _PageParams: [page_params], _Transactional: ajaxart.run(data,profile,'Transactional',context) });
				var page = aa_first(item,profile,'ItemPage',context);
				var itemDetailsObj = { isObject: true }

				var info = aa_getXmlInfo(subset.Items[0],context);
				if (info && info.PrepareForEdit) info.PrepareForEdit([],newContext);
				
				aa_init_itemdetails_object(itemDetailsObj,item,info,subset,page,context);
				newContext.vars._ItemDetailsObject = [ itemDetailsObj ];
				newContext.vars.DetailsControl = ajaxart_runMethod(item,page,'Control',newContext);
				newContext.vars.ItemPage = [page];
				
				return ajaxart.run(item,profile,'OpenIn',newContext);
			}};
			
			ajaxart_RunAsync(data,subset[0].Prepare,context, openCtrl_func(subset[0]));
			return ["true"];
		},
		RunOperationFromParent: function (profile,data,context)
		{
			var parentCntr = context.vars._ItemDetailsObject[0].ParentCntr;
			var opid = aa_text(data,profile,'Operation',context);
			var ops = ajaxart_runMethod([],parentCntr,'Operations',context)
			var op = ajaxart_object_byid(ops,opid);
			if (op != null) {
				var newContext = aa_ctx(context,{_ElemsOfOperation: context.vars._ItemDetailsObject[0].ElemsOfOperation , _Cntr: [parentCntr]});
				ajaxart_runMethod(data,op,'Action',newContext);
			}
		},
		Refresh: function (profile,data,context)
		{
			var dataitems = context.vars._Cntr[0].Items[0];
			dataitems.Wrappers = null;
			var refreshUI = function() {
				var ctrl = context.vars._Cntr[0].Ctrl;
				return ajaxart.gcs.uiaction.Refresh(profile,[],aa_ctx(context, {ControlElement: [ctrl]}));
			}
			var notFromServer = aa_frombool( ! aa_bool(data,profile,'AlsoFromServer',context) );
			var newContext = aa_ctx(context,{_NoRefreshFromServer:notFromServer});
			
			ajaxart_runMethod_async([],dataitems,'Refresh',newContext,refreshUI);
			
			return [];
		},
		ChangeTab: function (profile,data,context)
		{
			var moveto = aa_text(data,profile,'MoveTo',context);
			var movetotab = aa_text(data,profile,'TabToMoveTo',context);
			var tabcontrol = aa_text(data,profile,'TabControl',context);
			var animation = aa_first(data,profile,'Animation',context);
			
			// new tab control
			var root = ajaxart.xml.root(context.vars.ControlElement[0]);
			var tabcontrols = jQuery(root).find('.aa_tabcontrol').get();
			var closestTab = jQuery(context.vars.ControlElement[0]).closest('.aa_tabcontrol.fld_'+tabcontrol);
			if (closestTab[0]) tabcontrols.unshift(closestTab[0]);
			 
			for(var i=0;i<tabcontrols.length;i++) { 
				var tabID = '';
				if (tabcontrols[i].Field) tabID = tabcontrols[i].Field.Id || aa_totext(tabcontrols[i].Field.ID);
				if (tabcontrols[i].Cntr) tabID = aa_totext(tabcontrols[i].Cntr.ID); 
				if (tabID == tabcontrol) {
					if (tabcontrols[i].jbContext)
					  if (tabcontrols[i].jbContext.vars._BartContext[0] != context.vars._BartContext[0]) continue;
					
					var tabs = tabcontrols[i].TabControl.Tabs;
					if (tabcontrols[i].RefreshTabsHead)
						tabcontrols[i].RefreshTabsHead();
					if (moveto == 'specific tab') {
					  for(var j=0;j<tabs.length;j++)
						  if (tabs[j].Field.Id == movetotab) { 
							  if (tabs[j].Select) tabs[j].Select(null,animation);
							  else if (tabs[j].onmousedown) tabs[j].onmousedown(); 
							  return; 
						  }
					} else {
						var selected = jQuery(tabs).filter('.aa_selected_tab')[0];
						if (moveto == "refresh current tab") selected.Select(null,animation);
						if (moveto == "next tab" && selected.nextSibling) selected.nextSibling.Select(null,animation);
						if (moveto == "previous tab" && selected.previousSibling) selected.previousSibling.Select(null,animation);
					} 
					return;
				}
			}
			return;
		},
		Copy: function (profile,data,context)
		{
			var op = { isObject : true, isOperation : true };
			op.Id = aa_text(data,profile,'Copy',context);
			
			var copy = function(data1,ctx)
			{
				var cntr = ctx.vars._Cntr[0]; 
				var selected = ctx.vars._ItemsOfOperation;
				if (selected.length > 0)
				{
					document.aa_clipboard = selected[0];
					document.aa_cut = false;
				}
				return [];
			}
			ajaxart_addScriptParam_js(op,'Action',copy ,context);

			op.Shortcut = aa_text(data,profile,'Shortcut',context);
			ajaxart_addMethod(op,'Icon',profile,'Icon',context);
			ajaxart_addMethod(op,'Title',profile,'Title',context);
			op.Disabled = function(data1,ctx) { return aa_bool(data1,profile,'Disabled',aa_merge_ctx(context,ctx)) };

			var newContext = aa_ctx(context,{_Operation: [op]} );
			ajaxart.runsubprofiles(data,profile,'Aspect',newContext);

		    return [op];
		},
		Cut: function (profile,data,context)
		{
			var op = { isObject : true, isOperation : true };
			op.Id = aa_text(data,profile,'Cut',context);
			
			var cut = function(data1,ctx)
			{
				var cntr = ctx.vars._Cntr[0]; 
				var selected = ctx.vars._ItemsOfOperation;
				if (selected.length > 0)
				{
					document.aa_clipboard = selected[0];
					document.aa_cut = true;
				}
				return [];
			}
			ajaxart_addScriptParam_js(op,'Action',cut ,context);

			op.Shortcut = aa_text(data,profile,'Shortcut',context);
			ajaxart_addMethod(op,'Icon',profile,'Icon',context);
			ajaxart_addMethod(op,'Title',profile,'Title',context);
			op.Disabled = function(data1,ctx) { return aa_bool(data1,profile,'Disabled',aa_merge_ctx(context,ctx)) };

			var newContext = aa_ctx(context,{_Operation: [op]} );
			ajaxart.runsubprofiles(data,profile,'Aspect',newContext);
			
		    return [op];
		},
		Paste: function (profile,data,context)
		{
			var op = { isObject : true, isOperation : true };
			op.Id = aa_text(data,profile,'Paste',context);
			
			var paste = function(data1,ctx)
			{
				var cntr = ctx.vars._Cntr[0]; 
				var selected = ctx.vars._ItemsOfOperation;
				if (selected.length > 0)
				{
	  		    	var newcontext = aa_ctx(context,{Clipboard: document.aa_clipboard} );
  		    		ajaxart.run(selected,profile,document.aa_cut ? 'CutPasteAction' : 'CopyPasteAction',newcontext);
				}
				return [];
			}
			ajaxart_addScriptParam_js(op,'Action',paste ,context);

			op.Shortcut = aa_text(data,profile,'Shortcut',context);
			ajaxart_addMethod(op,'Icon',profile,'Icon',context);
			ajaxart_addMethod(op,'Title',profile,'Title',context);
			op.Disabled = function(data1,ctx) { return aa_bool(data1,profile,'Disabled',aa_merge_ctx(context,ctx)) };

			var newContext = aa_ctx(context,{_Operation: [op]} );
			ajaxart.runsubprofiles(data,profile,'Aspect',newContext);

		    return [op];
		},
		ContextMenu: function (profile,data,context)
		{
			var menu = { isObject : true,  Items : [], IncludeOperationsFromParent: true };
			menu.Presentation = function(data1, ctx) { return aa_run_component("ui.ButtonAsHyperlink",data1,ctx); };
			var cntr = context.vars._Cntr[0];
			var newContext = aa_ctx(context,{_Menu: [menu], _ElemsOfOperation: cntr.ElemsOfOperation() , _ItemsOfOperation: cntr.ItemsOfOperation() } );
			var aspects = ajaxart.runsubprofiles(data,profile,'MenuAspect',newContext);
			for(var i=0;i<aspects.length;i++)
				if (aspects[i].addOperations) aspects[i].addOperations();
			
			return [menu];
		},
		OperationsUnderSelectedItem: function (profile,data,context)
		{
			return [{ isObject: true, addOperations: function()
			{
			var menu = context.vars._Menu[0];
			var cntr = context.vars._Cntr[0];
			var items = [];
			var target = aa_text(data,profile,'Target',context);
			var selected = jQuery(cntr.Ctrl).find('.aa_selected_item');
			var selected_cntr = selected.parents('.aa_container')[0];
			if (selected_cntr != null && selected_cntr.Cntr != cntr)
				items = ajaxart.runScriptParam(data,selected_cntr.Cntr.Operations,selected_cntr.Cntr.Context);
			for(var i=0;i<items.length;i++)
			{
				var op = items[i];
				if (!op.Target || op.Target[0] == 'item' )
				{
					var child_cntr = jQuery(context.vars._ElemsOfOperation[0]).parents('.aa_container')[0];
					if (child_cntr == null || child_cntr.Cntr == op.Context.vars._Cntr[0]) 
						menu.Items.push(op);
				}
				else if (op.Target && op.Target[0] == 'new' && (target == 'new' || target == 'all'))
					menu.Items.push(op);
				else if (op.Target && op.Target[0] == 'items' && target == 'all')
					menu.Items.push(op);
			}
			return [];
			}}];
		},
		OperationsByIDs: function (profile,data,context)
		{
			return [{ isObject: true, addOperations: function()
				{
			var menu = context.vars._Menu[0];
			var cntr = context.vars._Cntr[0];
			var operations = aa_text(data,profile,'OperationIDs',context).split(',');
			var result = [];
			for(var i=0;i<operations.length;i++)
			{
				op = ajaxart_object_byid(menu.Items,operations[i]); 
				if (op != null)
					result.push(op);
			}

			menu.Items = result;
			return [];
			}}];
		},
		Validate: function (profile,data,context)
		{
			var groupID = aa_text(data,profile,'Group',context);
			var controls = [];
			
		    var top = aa_intest ? aa_intest_topControl : document;
			var controls = groupID ? jQuery(top).find('.fld_'+groupID).get() : [];
			
			for(var i=0;i<controls.length;i++) {
				if (!aa_passing_validations(controls[i])) return;
			}
			
			ajaxart.run(data,profile,'WhenValid',context);
		},
		PrintElement: function (profile,data,context)
		{
			if (ajaxart.inPreviewMode) return;
			
			var jRunOn = jQuery(context.vars.ControlElement);
			var selector = aa_text(data,profile,'Selector',context);
			if (selector != '') {
				jRunOn = jRunOn.find(selector);
				if (! jRunOn[0]) jRunOn = jQuery(selector);
			}
			var elem = jRunOn[0]; 
			if (!elem) return;

			if (! jQuery(elem).printElement ) {
				ajaxart.log('jquyery print plugin must be included in the html (http://projects.erikzaadi.com/jQueryPlugins/jQuery.printElement)');
				return;
			}
			jQuery(elem).printElement();
		},
		IncludeItemOperationsFromParent: function (profile,data,context)
		{
			var menu = context.vars._Menu[0];
			menu.IncludeOperationsFromParent = aa_bool(data,profile,'Include',context);
			return [];
		},
		Presentation: function (profile,data,context)
		{
			var menu = context.vars._Menu[0];
			ajaxart_addMethod(menu,'Presentation',profile,'Style',context);
			return [];
		},
		ExportToExcel: function (profile,data,context)
		{
			var cntr = context.vars._Cntr[0];
			var fields = cntr.Fields;
			var items = aa_items(cntr);
			var content = jQuery("<table/>");

			// headers
			var tr = jQuery('<tr>');
			content.append(tr);
			for(var j=0;j<fields.length;j++) {
				var field = fields[j];
				tr.append(jQuery('<th>'+field.Title+"</th>"));
			}

			// content
			for(var i=0;i<items.length;i++) {
				var item = items[i];
				var tr = jQuery('<tr>');
				content.append(tr);
				for(var j=0;j<fields.length;j++) {
					var field = fields[j];
					var field_data = field.FieldData([item],context);
					var text = ajaxart_field_text(field,field_data,[item],context);
					tr.append(jQuery('<td>'+text+"</td>"));
				}
			}
			
			ajaxart.runNativeHelper(content.get(),profile,'Open',context);
		},
		Search: function(profile,data,context)
		{
			var cntr = (context.vars.HeaderFooterCntr || context.vars._Cntr)[0];
			if (cntr == null) return;
			
			aa_recalc_filters_and_refresh(cntr,context.vars._Item,context);
			var pagesToRefresh = aa_text(data,profile,'MorePagesToRefresh',context).split(',');
			for(var i in pagesToRefresh)
			{
				var page = pagesToRefresh[i];
				var top = aa_intest ? jQuery(cntr.Ctrl).parents().slice(-1) : jQuery();
				var cntr_ctrl = top.find('.aa_container').filter(function() { return this.Cntr.ID[0] == page })[0];
				if (cntr_ctrl)
				{
					var target_cntr = cntr_ctrl.Cntr; 
					target_cntr.FilteredWrappers = cntr.FilteredWrappers;
					aa_refresh_itemlist(target_cntr,context);
				}
			}
			return [];
		},
		RunJavascript :function(profile,data,context)
		{
			aa_run_js_code(aa_text(data,profile,'Code',context),data,context);
			return [];
		}
});
//AA EndModule

ajaxart.suggestbox = {};
ajaxart.contextWithControlToRunOn = function(context,control) {
	  var newContext = ajaxart.clone_context(context);
	  newContext.vars['ControlElement'] = control;
	  return newContext;
	}

ajaxart.suggestbox.attachToTextbox = function(data,profile,context,textbox)
{
  if (data.length == 0) return ;
	  
  ajaxart.suggestbox.setTextBoxValue(data,profile,context,textbox);
  var max = aa_text(data,profile,'MaxItems',context);
  
  jQuery(textbox).addClass('suggestion_box_input');
  
  jQuery(textbox).blur(function(e) {
	  var element = (typeof(e.target)== 'undefined')? e.srcElement : e.target;
	  if (jQuery(element).parents(".suggestionpopup").length > 0 )	// event from the popup
		  return;
//	  ajaxart.suggestbox.setValue(data,profile,context,textbox,false);
	  setTimeout(function() { 
		  ajaxart.suggestbox.setValue(data,profile,context,textbox,false);
	  },300);
  });

  jQuery(textbox).click(function(e) {
	  if (this.value == "")
		  ajaxart.suggestbox.openPopup(data,profile,context,textbox,true);
  });

  jQuery(textbox).focus(function(e) {
	  if (this.value == "") {
		  var options = ajaxart.run(data,profile,'Options',context);
		  if (options.length > 0 && options.length <= max)
			  ajaxart.suggestbox.openPopup(data,profile,context,textbox,true);
	  }
  });
  
  jQuery(textbox).keydown(function(e) {
	  if (e.keyCode == 27) {
		  if ( ajaxart.suggestbox.isPopupOpen()  ) {
			  jQuery(ajaxart.ui.suggestBoxPopup).hide();
			  ajaxart_stop_event_propogation(e);
		  }
	  }
	  if (e.keyCode == 13 && ajaxart.suggestbox.isPopupOpen())
		  ajaxart_stop_event_propogation(e);
  });
  jQuery(textbox).keyup(function(e) {
	  if (e.keyCode == 27) {
		  if ( ajaxart.suggestbox.isPopupOpen()  )
			  ajaxart_stop_event_propogation(e);
		  return;
	  }
	  if (e.keyCode == 9) {
		  ajaxart_stop_event_propogation(e);
		  return;
	  }
	  if (e.keyCode == 13 ) {
		  if (ajaxart.suggestbox.isPopupOpen()) {
			  ajaxart.suggestbox.setValue(data,profile,context,textbox,true);
			  ajaxart_stop_event_propogation(e);
		  }
		  return;
	  }
	  if (e.keyCode == 38 || e.keyCode == 40) { // arrows up/down
		  var jSelected = jQuery(ajaxart.ui.suggestBoxPopup).find('.selected:visible');
		  if (jSelected.length == 0) {
			  if (ajaxart.ui.suggestBoxPopup.allowTextNotInOptions) {
				  var items = jQuery(ajaxart.ui.suggestBoxPopup).find('.suggestion_item');
				  if (items.length > 0) jQuery(items[0]).addClass('selected');
			  }
			  return;
		  }
		  var nextItem = null;
		  if (e.keyCode == 38) {
			  nextItem = jSelected[0].previousSibling;
			  while (nextItem != null && nextItem.style.display == 'none')
				  nextItem = nextItem.previousSibling;
		  }
		  if (e.keyCode == 40) { 
			  nextItem = jSelected[0].nextSibling;
			  while (nextItem != null && nextItem.style.display == 'none')
				  nextItem = nextItem.nextSibling;
		  }
		  if (nextItem != null) {
			  jSelected.removeClass('selected');
			  jQuery(nextItem).addClass('selected');
		  }
		  return;
	  }
	  ajaxart.suggestbox.openPopup(data,profile,context,textbox,false);
  });
}
ajaxart.suggestbox.setValue = function(data,profile,context,textbox,clickOnSelected)
{
	  var allowNotInCombo = aa_bool(data,profile,'AllowTextNotInOptions',context);
	  if (ajaxart.ui.suggestBoxPopupInput != textbox) return;
	  
	  var jPopup = jQuery(ajaxart.ui.suggestBoxPopup);
	  var sel = jPopup.find('.selected:visible');
	  if (sel.length > 0 && sel[0].ajaxart_menu != null && clickOnSelected) {
		  var newContext = ajaxart.clone_context(context);
		  newContext.vars['ControlElement'] = [textbox];
		  newContext.vars['SuggestionBoxText'] = [ textbox.value ];
  	      ajaxart.run_xtml_object(data,sel[0].ajaxart_menu['Action'],newContext);
		  return;
	  }
	  var newval = "";
	  if (allowNotInCombo) newval = textbox.value;
	  if (sel.length > 0 && sel[0].ajaxart_menu == null)
		  var newval = sel[0].ajaxart_value;
	  
	  if (textbox.value == "" && !clickOnSelected)
		  newval = "";
	  
	  if (sel.length == 0 && !allowNotInCombo && !clickOnSelected) {
		  ajaxart.suggestbox.setTextBoxValue(data,profile,context,textbox);
		  return;
	  } else if (allowNotInCombo && !clickOnSelected) 
		  newval = textbox.value;
	  else 
		  ajaxart.suggestbox.setTextBoxValue([newval],profile,context,textbox);
	  
	  ajaxart.writevalue(data,[newval]);
	  ajaxart.run(data,profile,'OnUpdate',ajaxart.contextWithControlToRunOn(context,[textbox]));
	  
	  jPopup.hide();
}
ajaxart.suggestbox.setTextBoxValue = function(value,profile,context,textbox)
{
  jQuery(textbox).removeClass('suggetion_text_for_empty');
  
  var label = aa_text(value,profile,'OptionLabelInTextbox',context);
  if (label == "") label = ajaxart.totext(value);
  if (label == "") { 
	  label = aa_text(value,profile,'TextForEmpty',context);
	  if (label != "")
		  jQuery(textbox).addClass('suggetion_text_for_empty');
  }
  if (label.indexOf('_') == 0)
	  label = label.substring(1);
  textbox.value = label;
}
ajaxart.suggestbox.openPopup = function(data,profile,context,textbox,showAll)
{
	  var max =  aa_text(data,profile,'MaxItems',context);

	  var searchAnywhere = true; //aa_bool(value,profile,'SearchAnywhere',context);
	  if (ajaxart.ui.suggestBoxPopupInput != textbox) {
		  var popup = ajaxart.ui.suggestBoxPopup;
		  if(popup != null && popup.parentNode != null)
			  aa_remove(popup,true);
		  
		  ajaxart.ui.suggestBoxPopup = document.createElement('div');
		  jQuery(ajaxart.ui.suggestBoxPopup).addClass('aapopup suggestionpopup');
		  var hasDescription = true, hasImage = true, hasOptionText = false;
		  if (profile.getAttribute('OptionLabel') != null || ajaxart.xml.xpath(profile,'OptionLabel').length > 0)
			  hasOptionText = true;
		  
		  var optionDivs = [];
		  var options = ajaxart.run(data,profile,'Options',context);
		  var hasMore = false;
		  
		  for(var i=0;i<options.length;i++) {
			  var option = options[i];
			  var optionText = "";
			  if (hasOptionText)
				  optionText = aa_text([option],profile,'OptionLabel',context); 
			    else optionText = ajaxart.totext(option);
			  
			  var optionDescription = "",optionImage="";
			  if (hasDescription) optionDescription = aa_text([option],profile,'OptionDescription',context);
			  if (hasImage) optionImage = aa_text([option],profile,'OptionImage',context);
			  
			  var itemDiv = document.createElement('div');
			  jQuery(itemDiv).addClass('suggestion_item');
			  itemDiv.ajaxart_value = option;
			  itemDiv.ajaxart_text = optionText.toLowerCase();
			  var itemText = document.createElement('div'); itemText.innerHTML = optionText; itemDiv.appendChild(itemText);
			  if (hasImage) {
				  itemText.style.backgroundImage = 'url(' + optionImage + ')';
				  jQuery(itemText).addClass('suggestion_withimage');
			  }
			  if (optionDescription != null) {
				  var itemDescDiv = document.createElement('div'); jQuery(itemDescDiv).addClass('suggestion_description'); itemDescDiv.innerHTML = optionDescription; itemDiv.appendChild(itemDescDiv);
			  }
			  ajaxart.ui.suggestBoxPopup.appendChild(itemDiv);
			  optionDivs.push(itemDiv);
			  if (i >= max) { itemDiv.style.display = 'none'; hasMore = true; }
		  }
		  ajaxart.ui.suggestBoxPopup.aaitems = optionDivs;	  
		  
		  var moreDiv = jQuery('<div class="suggestion_item suggestion_menuitem suggestion_more">more</div>')[0];
		  ajaxart.ui.suggestBoxPopup.appendChild(moreDiv);
		  ajaxart.ui.suggestBoxPopup.aamore = moreDiv;
		  
		  ajaxart.ui.suggestBoxPopup.aamore.style.display = (hasMore) ? 'block' : 'none';
		  
		  var menuItems = ajaxart.runsubprofiles(data,profile,'AdditionalMenuItem',context);
		  for(var i=0;i<menuItems.length;i++) {
			  var itemDiv = document.createElement('div');
			  jQuery(itemDiv).addClass('suggestion_item suggestion_menuitem');
			  itemDiv.ajaxart_menu = menuItems[i];
			  var itemText = document.createElement('div'); itemText.innerHTML = ajaxart.totext(itemDiv.ajaxart_menu['Text']); itemDiv.appendChild(itemText);
			  var itemImage = itemDiv.ajaxart_menu['Image'];
			  if (itemImage != null && itemImage != "") {
				  itemText.style.backgroundImage = 'url(' + itemImage + ')';
				  jQuery(itemText).addClass('suggestion_withimage');
			  }
			  ajaxart.ui.suggestBoxPopup.appendChild(itemDiv);
			  ajaxart.ui.suggestBoxPopup.aaitems.push(itemDiv);
		  }

		  ajaxart.ui.suggestBoxPopup.allowTextNotInOptions = aa_bool(data,profile,'AllowTextNotInOptions',context);
		  
		  jQuery(ajaxart.ui.suggestBoxPopup.aaitems).hover(
				    function() { jQuery(this.parentNode).find('.selected:visible').removeClass('selected'); jQuery(this).addClass('selected'); },
				    function() {}
		  );

		  ajaxart.ui.suggestBoxPopupInput = textbox;
		  
		  jQuery(ajaxart.ui.suggestBoxPopup).click(function(event) {
			  var element = (typeof(event.target)== 'undefined')? event.srcElement : event.target;
			  if (!jQuery(element.parentNode).hasClass("suggestion_item") || jQuery(element.parentNode).hasClass("suggestion_more"))
				  return;
			  var jPopup = jQuery(ajaxart.ui.suggestBoxPopup);
			  jPopup.find('.selected').removeClass('selected');
			  jQuery(element).parent().addClass('selected');
			  ajaxart.suggestbox.setValue(data,profile,context,textbox,true);
		  });
		  
		  jQuery('body').append(jQuery(ajaxart.ui.suggestBoxPopup));
	  }
	  var jPopup = jQuery(ajaxart.ui.suggestBoxPopup);
//	  var left = aa_absLeft(textbox);
//	  var top = aa_absTop(textbox) + jQuery(textbox).height()+5;
	  
	  jQuery(ajaxart.ui.suggestBoxPopup).width(jQuery(textbox).width()-5);
	  ajaxart.ui.suggestBoxPopup.style.display = 'block';
	  ajaxart.dialog.positionPopup(jQuery(ajaxart.ui.suggestBoxPopup), textbox);

//	  var width = jQuery(textbox).width()-5;
//	  jPopup.css("left",left).css('top',top).css('min-width',""+width+"px").find('.selected').removeClass('selected');
	  var text = textbox.value.toLowerCase();
	  var count=0; var items = ajaxart.ui.suggestBoxPopup.aaitems; var hasSelected=false; var hasMore = false;
	  if ( ajaxart.ui.suggestBoxPopup.allowTextNotInOptions ) hasSelected = true;
	  
	  for(var i=0;i<items.length;i++) {
		  if (items[i].ajaxart_menu != null) { if (! hasSelected) { jQuery(items[i]).addClass('selected'); hasSelected=true;} continue;  }
		  if (count >=max) { items[i].style.display = 'none'; hasMore = true; }
		  else {
			  var found_at = items[i].ajaxart_text.indexOf(text);
			  var found = (searchAnywhere && found_at != -1) || (!searchAnywhere && found_at == 0);
			  if (!showAll && !found ) items[i].style.display = 'none';
			  else {
				  items[i].style.display = 'block';
				  count++;
				  if (! hasSelected) { jQuery(items[i]).addClass('selected'); hasSelected=true;}
				  else
					  jQuery(items[i]).removeClass('selected');
			  }
		  }
	  }
	  ajaxart.ui.suggestBoxPopup.aamore.style.display = (hasMore) ? 'block' : 'none';
	  if (count == 0)
		  ajaxart.suggestbox.closePopup();
}
ajaxart.suggestbox.closePopup = function()
{
	jQuery(ajaxart.ui.suggestBoxPopup).hide();
}
ajaxart.suggestbox.isPopupOpen = function()
{
	return (ajaxart.ui.suggestBoxPopup != null && jQuery(ajaxart.ui.suggestBoxPopup).css("display") == 'block');
}
ajaxart.customsuggestbox = {};
ajaxart.customsuggestbox.init = function(field,data,profile,context)
{
	aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
		if (ajaxart_field_is_readOnly(ctx.vars._Cntr[0],cell.Field,ctx)) return; 
		var input = jQuery(cell).find('.field_control')[0];
		  input["profile"] = profile;
		  input["context"] = context;
		  input["data"] = field_data;
		  jQuery(input).keypress(function(e) {
			  if (e.charCode == 32 && e.ctrlKey) { // ctrl + space
				  ajaxart.run(data,profile,'OnCtrlSpace',ajaxart.ui.contextWithCurrentControl(context, this)); 
				  return false;
			  }
			  return true;
		  });
		  // dirty
		  jQuery(input).focus(function(e) {
			  if (ajaxart.getVariable(context,"_Context").length == 0 && input["context_calculated"] == null) {
				  var obj = ajaxart.getVariable(context,"_XtmlDt");
				  if (obj == null || obj.length == 0) return;
				  var scriptParam = obj[0]["Context"];
				  ajaxart.setVariable(context,"_Context", ajaxart.runScriptParam(data,scriptParam,aa_ctx(context,{_FieldData: field_data})) );
				  input["context_calculated"] = true;
			  }
		  });
		  jQuery(input).change(function(e) {
			  var prev_value = ajaxart.totext(data);
			  ajaxart.writevalue(data,this.value);
			  ajaxart.run(data,profile,'OnUpdate',ajaxart.ui.contextWithCurrentControl(context, this));
		  });
	});
	aa_field_handler(field,'OnKeydown',function(field,field_data,input,e) {
		  if (e.keyCode == 27) { //escape
			  if ( ajaxart.suggestbox.isPopupOpen()  ) {
				  jQuery(ajaxart.ui.suggestBoxPopup).hide();
				  ajaxart_stop_event_propogation(e);
			  }
		  }
		  if (e.keyCode == 13 && ajaxart.suggestbox.isPopupOpen())
			  ajaxart_stop_event_propogation(e);
	  });
	aa_field_handler(field,'OnKeyup',function(field,field_data,input,e) {
		  if (e.keyCode == 27) {
			  if ( ajaxart.suggestbox.isPopupOpen()  )
				  ajaxart_stop_event_propogation(e);
			  return;
		  }
		  if (e.keyCode == 13) { //enter
			  if ( ajaxart.suggestbox.isPopupOpen()  ) {
				  var selected = jQuery(ajaxart.ui.suggestBoxPopup).find('.selected:visible');
				  if (selected.length > 0) {
					  jQuery(ajaxart.ui.suggestBoxPopup).hide();
					  var textToAdd = selected[0].ajaxart_text;
					  if (input.openedWithTrigger)
					  	  textToAdd = aa_text( [textToAdd], input.triggerProfile, "TextPatternToAdd", input.triggerContext );
					  input.value = input.value + textToAdd;
					  ajaxart.writevalue(field_data,input.value);
					  ajaxart_runMethod([selected[0].ajaxart_value],ajaxart.ui.suggestBoxPopup,"OnSelect",context);
					  input["openedWithTrigger"] = false;
					  ajaxart.run(field_data,profile,'OnAfterTextAdded',ajaxart.ui.contextWithCurrentControl(context, input) );
					  ajaxart.run(field_data,profile,'OnUpdate',ajaxart.ui.contextWithCurrentControl(context, input) );
					  ajaxart_stop_event_propogation(e);
				  }
			  }
			  return;
		  }
		  var prev_value = ajaxart.totext(field_data);
		  ajaxart.writevalue(field_data,input.value);
		  if (prev_value != input.value)
			  ajaxart.run(field_data,profile,'OnUpdate',ajaxart.ui.contextWithCurrentControl(context, input));
		  var lastChar = "";
		  if (e.keyCode == 9)
			  ajaxart_stop_event_propogation(e);
		  else if (e.keyCode == 38 || e.keyCode == 40) { // arrows up/down
			  var jSelected = jQuery(ajaxart.ui.suggestBoxPopup).find('.selected:visible');
			  var nextItem = null;
			  if (e.keyCode == 38)  // up
				  nextItem = jSelected[0].previousSibling;
			  if (e.keyCode == 40)  // arrow down
				  nextItem = jSelected[0].nextSibling;
			  if (nextItem != null) {
				  jSelected.removeClass('selected');
				  jQuery(nextItem).addClass('selected');
			  }
			  ajaxart_stop_event_propogation(e);
		  }
		  else {
			  if (prev_value != input.value && ajaxart.ui.suggestBoxPopup != null) // not for non-function keys like shift
				  jQuery(ajaxart.ui.suggestBoxPopup).hide();
			  var selEnd = input.selectionEnd;
//			  if ((input.value.length == prev_value.length+1 && prev_value == input.value.substring(0,input.value.length-1)) ||  
//					  (input.value.length == prev_value.length-1 && input.value == prev_value.substring(0,prev_value.length-1)) ) {// todo: fix
			  if ( selEnd == null || selEnd == input.value.length ) {	// at end of text or IE and 
				  if (!(e.keyCode == 32 && e.ctrlKey) && e.keyCode != 17 && e.keyCode != 16)  {// not clicking Ctrl+Space or loosing the Ctrl
					  input["openedWithTrigger"] = false;
					  ajaxart.run(field_data,profile,'OnChangeAtEndOfText',ajaxart.ui.contextWithCurrentControl(context,input) );
				  }
			  }
		  }
	  });
}
ajaxart.customsuggestbox.openSuggestionBoxList = function(profile,data,context)
{
	var textbox = ajaxart.getControlElement(context,true);
	if (textbox == null) return [];
	
	  var popup = document.createElement('table');
	  popup.setAttribute("cellpadding","0");
	  popup.setAttribute("cellspacing","0");
	  var halfWrittenPart = aa_text(data,profile,'HalfWrittenPart',context);
	  var halfWrittenAlwaysOnStart = aa_bool(data,profile,'HalfWrittenAlwaysOnStart',context);
	  var filterItemsDifferantThanHalfWrittern = aa_bool(data,profile,'FilterItemsDifferantThanHalfWrittern',context);
	  var halfWrittenPartLower = halfWrittenPart.toLowerCase();
	  ajaxart_addMethod(popup,"OnSelect",profile,"OnSelect",context);
	  var label_compiled = ajaxart.compile(profile,'OptionLabel',context);
	  
	  var options = ajaxart.run(data,profile,'Options',context);
	  var empty = true;
	  for(var i=0;i<options.length;i++) {
		  var option = options[i];
		  var optionText = ajaxart_runcompiled_text(label_compiled, [option], profile, "OptionLabel" ,context);
		  if (optionText.indexOf('__') == 0) continue;
		  if (halfWrittenPart != "" && optionText.indexOf(halfWrittenPart) != 0 && halfWrittenAlwaysOnStart) continue;
		  if (filterItemsDifferantThanHalfWrittern && halfWrittenPart != "" && optionText.toLowerCase().indexOf(halfWrittenPartLower) == -1) continue;
		  if (filterItemsDifferantThanHalfWrittern && halfWrittenPart != "" && optionText.length == halfWrittenPart.length) continue;
		  var optionDescription = aa_text([option],profile,'OptionDescription',context);
		  var optionImage = aa_text([option],profile,'OptionImage',context);
		  var itemDiv = document.createElement('tr');
		  jQuery(itemDiv).addClass('suggestion_item');
		  if (empty) {
			  empty = false;
			  jQuery(itemDiv).addClass('selected');
		  }
		  itemDiv.ajaxart_value = option;
		  itemDiv["ajaxart_text"] = optionText;
		  var td =  document.createElement('td'); itemDiv.appendChild(td); //itemDiv.className="suggestion_item";
		  var itemText;
		  if (halfWrittenPart != "" && halfWrittenAlwaysOnStart) {
			  var halfWrittenSpan = document.createElement('span'); halfWrittenSpan.className="half_written"; jQuery(halfWrittenSpan).text(halfWrittenPart); td.appendChild(halfWrittenSpan);
			  var restText = optionText.substring(halfWrittenPart.length);
			  var rest = document.createElement('span'); jQuery(rest).text(restText ); td.appendChild(rest);
			  rest.className = "suggestion_text";
			  itemText = halfWrittenSpan;
			  itemDiv["ajaxart_text"] = restText;
		  } else if (halfWrittenPart != "" && !halfWrittenAlwaysOnStart) {
			  var index = optionText.toLowerCase().indexOf(halfWrittenPartLower);
			  if (index == -1) {itemText = document.createElement('span'); jQuery(itemText).text(optionText); td.appendChild(itemText); itemText.className = "suggestion_text"; }
			  else {
				  var start = document.createElement('span'); jQuery(start).text(optionText.substring(0,index)); td.appendChild(start);
				  var highlighted_text = optionText.substring(index, index+halfWrittenPart.length);
				  var halfWrittenSpan = document.createElement('span'); halfWrittenSpan.className="half_written"; jQuery(halfWrittenSpan).text(highlighted_text); td.appendChild(halfWrittenSpan);
				  var restText = optionText.substring(index+halfWrittenPart.length);
				  var rest = document.createElement('span'); jQuery(rest).text(restText ); td.appendChild(rest);
				  rest.className = "suggestion_text";
				  itemText = start;
				  itemDiv["ajaxart_text"] = restText;
			  }
		  }	else {
			  itemText = document.createElement('span'); jQuery(itemText).text(optionText); td.appendChild(itemText); itemText.className = "suggestion_text";
		  }
		  if (optionImage != null) {
			  itemText.style.backgroundImage = 'url(' + optionImage + ')';
			  jQuery(itemText).addClass('suggestion_withimage');
		  }
		  if (optionDescription != null) {
			  var itemDescDiv = document.createElement('span'); jQuery(itemDescDiv).addClass('suggestion_description');
			  if (optionDescription.length > 30) optionDescription = optionDescription.substring(0,30)+"..."; 
			  ajaxart_set_text(itemDescDiv,optionDescription); itemDiv.appendChild(itemDescDiv);
			  var td =  document.createElement('td'); td.style.width="100%"; td.appendChild(itemDescDiv); itemDiv.appendChild(td);
		  }
		  popup.appendChild(itemDiv);
		  jQuery(itemDiv).hover(
				    function() { jQuery(this.parentNode).find('.selected:visible').removeClass('selected'); jQuery(this).addClass('selected'); },
				    function() {}
		  );
		  jQuery(itemDiv).click(function(event) {
			  var element = (typeof(event.target)== 'undefined') ? event.srcElement : event.target;
			  var parent = jQuery(element).parents(".suggestion_item");
			  if (parent.length == 0) return;
			  var jPopup = jQuery(ajaxart.ui.suggestBoxPopup);
			  jQuery(ajaxart.ui.suggestBoxPopup).hide();
			  var textToAdd = parent[0].ajaxart_text;
			  if (textbox.openedWithTrigger)
			    textToAdd = aa_text( [textToAdd], textbox.triggerProfile, "TextPatternToAdd", textbox.triggerContext );
			  textbox.value = textbox.value + textToAdd;
			  ajaxart.writevalue(ajaxart.ui.suggestBoxPopup.textbox.ajaxart.data,textbox.value);
			  ajaxart_runMethod([parent[0].ajaxart_value],ajaxart.ui.suggestBoxPopup,"OnSelect",context);
			  textbox["openedWithTrigger"] = false;
			  ajaxart.run(textbox.data,textbox.profile,'OnAfterTextAdded', ajaxart.ui.contextWithCurrentControl(textbox.context,textbox) );
			  ajaxart.run(textbox.data,textbox.profile,'OnUpdate', ajaxart.ui.contextWithCurrentControl(textbox.context,textbox) );
			  ajaxart.ui.suggestBoxPopup.textbox.focus();
		  });
	  }
	  if (!empty)
		  ajaxart.customsuggestbox.openPopup(popup,textbox);
		else
		  if (ajaxart.ui.suggestBoxPopup) jQuery(ajaxart.ui.suggestBoxPopup).hide();
}
ajaxart.customsuggestbox.openSuggestionBoxPopup = function(profile,data,context)
{
	var textbox = ajaxart.getControlElement(context,true);
	if (textbox == null) return [];
	  var control = aa_first(data,profile,'Control',context);
	  if (control != null)
		  ajaxart.customsuggestbox.openPopup(control,textbox);
	  return [];
}
ajaxart.customsuggestbox.openPopup = function(element, textbox)
{
	  var popup = ajaxart.ui.suggestBoxPopup;
	  if (popup != null && popup.parentNode != null)
		  popup.parentNode.removeChild(popup);
	  
	  ajaxart.ui.suggestBoxPopup = element;
	  ajaxart.ui.suggestBoxPopup.textbox = textbox;
	  jQuery(ajaxart.ui.suggestBoxPopup).addClass('aapopup suggestionpopup customsuggestionpopup');
	  
	  var close_button = jQuery('<IMG src="images/close2.png" class="suggestionpopup_close_button"></IMG>');
	  close_button.click(function(e) {
			ajaxart_stop_event_propogation(e);
			jQuery(ajaxart.ui.suggestBoxPopup).hide();
			textbox.focus();
	  });
	  ajaxart.ui.suggestBoxPopup.appendChild(close_button[0]);

	  jQuery('body').append(jQuery(ajaxart.ui.suggestBoxPopup));
	  var width = jQuery(textbox).width()-5;
	  if (width < 300) width = 300;
	  jQuery(ajaxart.ui.suggestBoxPopup).width(width);
	  ajaxart.ui.suggestBoxPopup.style.display = 'block';
	  ajaxart.dialog.positionPopup(jQuery(ajaxart.ui.suggestBoxPopup), textbox);
//	  var left = aa_absLeft(textbox);
//	  var top = aa_absTop(textbox) + jQuery(textbox).height()+5;
	  
//	  jPopup.css("left",left).css('top',top);//.css('min-width',""+width+"px");
}
ajaxart.customsuggestbox.addTextToSuggestionBox = function(profile, data,context)
{
	var textToAdd = aa_text(data,profile,'Text',context);
	var textbox = ajaxart.getControlElement(context,true);
	if (ajaxart.ui.suggestBoxPopup != null && ajaxart.ui.suggestBoxPopup.textbox != null)
		textbox = ajaxart.ui.suggestBoxPopup.textbox;
    if (textbox.openedWithTrigger)
	  textToAdd = aa_text( [textToAdd], textbox.triggerProfile, "TextPatternToAdd", textbox.triggerContext );
	textbox.value = textbox.value + textToAdd;
	ajaxart.writevalue(textbox.data,textbox.value);
	textbox.focus();
	if (ajaxart.ui.suggestBoxPopup != null)
		jQuery(ajaxart.ui.suggestBoxPopup).hide();
	 textbox["openedWithTrigger"] = false;
	var textboxCtx = textbox.context || textbox.jbContext;
	if ( aa_bool(data,profile,'TriggerOnAfterTextAdded',context) )
		ajaxart.run(textbox.data,textbox.profile,'OnAfterTextAdded', ajaxart.ui.contextWithCurrentControl(textboxCtx,textbox) );
	ajaxart.run(textbox.data,textbox.profile,'OnUpdate', ajaxart.ui.contextWithCurrentControl(textboxCtx,textbox) );
	if ( aa_bool(data,profile,'TriggerPopup',context) )
		ajaxart.run(data,textbox.profile,'OnChangeAtEndOfText', ajaxart.ui.contextWithCurrentControl(textboxCtx,textbox) );
}
ajaxart.customsuggestbox.triggerSuggestionBoxPopup = function(profile, data,context)
{
	var textbox = ajaxart.getControlElement(context,true);
	if (textbox == null) return [];
	var textToSimulate = ajaxart.run(data,profile,'TextToSimulate',context);
	textbox["openedWithTrigger"] = true;
	textbox["triggerProfile"] = profile;
	textbox["triggerContext"] = context;
	ajaxart.run(textToSimulate,textbox.profile,'OnChangeAtEndOfText', ajaxart.ui.contextWithCurrentControl(textbox.context,textbox) );
}






//AA BeginModule
aa_gcs("ui", {
  ControlUsage: function (profile,data,context)
  {
  	window.aa_intest_topControl = null;
	ajaxart.serverData["Usage Data"] = data;
	ajaxart.run(data,profile,'RunBefore',context);
	var control = ajaxart.run(data,profile,'Control',context);
	if (control.length == 0) return ["no control"];	
	window.aa_intest_topControl = control[0];
	
	var newContext = aa_ctx(context,{ControlElement: control, TopControlForTest: control, TopControlElement: control, InTest: ['true']});
	aa_intest = true;
	try
	{
 	    if (context.vars._TestOutput) {
 	    	if (context.vars._TestOutput[0].OutputControl) {
 	    		context.vars._TestOutput[0].OutputControl[0].appendChild(control[0]);
 	    		aa_fixTopDialogPosition();
 	    	}
 	    	else
	 	    	context.vars._TestOutput[0].OutputControl = control[0];
 	    }
			
		ajaxart.run(data,profile,'RunOnControl',newContext);
	
		if (aa_text(data,profile,'ResultType',context) == 'Data')
			var result = data;
		else 
			var result = newContext.vars.TopControlElement;
	
		var passed = aa_bool(result,profile,'ExpectedResult',newContext);
		ajaxart.run(data,profile,'CleanAfter',newContext);
		window.aa_intest_topControl = null;
	
	    if (openDialogs.length > 0) { // close dialogs
	      var dlg = openDialogs[openDialogs.length-1];
	      if ( ! jQuery(dlg.dialogContent).hasClass('aaeditor') )
	        aa_remove(ajaxart.dialog.closeDialog(dlg),true);
	    }
	}
	catch (e) { aa_intest = false; ajaxart.logException(e); }
	aa_intest = false;
	if (passed == false)
		return result;//ajaxart.usage.resultAsText(result);
	return [];
  },
  ControlUsage_Result: function (profile,data,context)
  {
	  ajaxart.run(data,profile,'RunBefore',context);
	  return ajaxart.run(data,profile,'Control',context);
  },  
  ControlData: function (profile,data,context)
  {
	 var type = aa_text(data,profile,'Type',context);
	 var control = ajaxart.run(data,profile,'Control',context);
	 if (! ajaxart.ishtml(control)) return [];
	 
     var context1 = control[0]["ajaxart"];
     if (typeof(context1) == "undefined")
    	 return control[0].ItemData;
     if (type == "data") return context1.data;
     if (type == "original_data") {
    	 if (context1.origData == null) return context1.data;
    	 else return context1.origData;
     }
     if (type == "script") return [context1.script];
     if (type == "context") return [context1.params];
     if (type == "all")
     { 
   	    var out = { isObject: true };
  	    out.input = context1.data;
  	    if (context1.origData != null) out.input = context1.origData;
  	    out.script = context1.script;
  	    out.context = context1.params;
    	 
    	return [out];
     }
     return [];
  },
  ControlInObject: function (profile,data,context)
  {
	  var obj = aa_first(data,profile,'Object',context);
	  obj.ControlHolder = ajaxart.run(data,profile,'Control',context);
	  if (!obj.ControlHolder[0]) obj.ControlHolder = [ document.createElement('div') ];
	  obj.ControlHolder[0].ParentObject = [obj];
	  return obj.ControlHolder;
  },
  FindControlData: function (profile,data,context)
  {
	  var elem = aa_first(data,profile,'StartWith',context);
	  var dir = aa_text(data,profile,'Direction',context);
  	  var type = aa_text(data,profile,'Type',context);
  	  if ( ! ajaxart.ishtml(elem)) return [];
  	  if (dir == 'up')
  	  {
  		  elem = elem.parentNode;
  		  while(elem != null)
  		  {
  			  if ("ajaxart" in elem)
  				  return control_data_of_elem(elem);
  			  elem = elem.parentNode;
  		  }	  
  	  }
  	  if (dir == 'down')
	  {
		var result = search_down(elem);
		if (result != null)	return result;
	  }
  	  return [];

  	  function search_down(elem)
  	  {
		  if ("ajaxart" in elem)
			  return control_data_of_elem(elem);

  		  var child = elem.firstChild;
	  		while (child != null) {
	  			if (child.nodeType == 1)// element
	  			{
	  				var result = search_down(child);
	  				if (result != null)	return result;
	  			}
	  			child = child.nextSibling;
	  		}
	  	  return null;
  	  }

  	  function control_data_of_elem(elem)
  	  {
	     var context1 = elem["ajaxart"];
	     if (typeof(context1) == "undefined") return [];
	     if (type == "data") return context1.data;
	     if (type == "script") return [context1.script];
	     if (type == "all")
	     { 
	   	    var out = { isObject: true };
	  	    out.input = context1.data;
	  	    out.script = context1.script;
	  	    out.context = context1.params;
	    	 
	    	return [out];
	     }
	     return [];
  	  }
  	  
  },
  AttachGlobalCss: function(profile,data,context)
  {
	  return [ aa_attach_global_css(aa_text(data,profile,'Css',context),null,aa_text(data,profile,'Name',context) )];
  },
  UseDataBoundParams: function(profile,data,params)
  {
	  if (! ajaxart.ishtml(data)) return data;
	  for(var i=0;i<data.length;i++) {
		  var dataitem = data[i];
		  if (typeof(dataitem["ajaxart"]) != "undefined")
		  {
			  var controlParams = dataitem["ajaxart"].params;
			  ajaxart.setVariable(controlParams,"InputForChanges",dataitem["ajaxart"].data);
			  ajaxart.run([ dataitem ],profile,'Change',controlParams);
		  }
	  }
	  return data;
  },
  LoadCssFile: function(profile,data,context)
  {
      var url = aa_text(data,profile,'Url',context);
      var media = aa_text(data,profile,'Media',context);
	  
      if (url == "") return [];
      
      var fileref=document.createElement("link");
      fileref.setAttribute("rel", "stylesheet");
      fileref.setAttribute("type", "text/css");
      fileref.setAttribute("href", url);
      if (media)
        fileref.setAttribute("media", media);
      document.getElementsByTagName("head")[0].appendChild(fileref)
      
	  return ["true"];
  },
  SetCssText: function(profile,data,params)
  {
 	 var style = aa_text(data,profile,'Style',params);
 	 if (style == "") return;
 	 ajaxart.each(data, function(item) {
 		 try {
 	 		 item.style.cssText = style;
 		 }
 		 catch (e) { ajaxart.log("failed to change css text: "+ style +" :" +e.message,"error"); }
 	 });
  },
  UrlParameter: function(profile,data,context)
  {
    var strParamName = aa_text(data,profile,'Param',context);
    return [ajaxart.urlparam(strParamName)];
  },
  CurrentUrlWithChangedParam: function(profile,data,context)
  {
	var param = aa_text(data,profile,'Param',context);
	var val = aa_text(data,profile,'Value',context);
	var strHref= aa_text(data,profile,'Url',context);
	
	var params = [];
    if (strHref.indexOf('#') > -1) strHref = strHref.substr(0,strHref.indexOf("#"));
	var baseUrl = strHref;
    if ( strHref.indexOf("?") > -1 ) {
      baseUrl = strHref.substr(0,strHref.indexOf("?"));
      var strQueryString = strHref.substr(strHref.indexOf("?")+1);
      var aQueryString = strQueryString.split("&");
      for ( var iParam = 0; iParam < aQueryString.length; iParam++ ){
        var aParam = aQueryString[iParam].split("=");
        if (aParam[0] != param)
          params.push( {name:aParam[0],value:aParam[1] } );
      }
    }
    params.push( {name:param,value:val } );
    var newUrl = baseUrl + "?";
    for (var i=0;i<params.length;i++)
    {
    	if (i > 0) newUrl += "&";
    	newUrl += params[i].name + "=" + params[i].value; 
    }
	return [newUrl];
  },
  SetCssProperty: function(profile,data,params)
  {
 	 var property = aa_text(data,profile,'Property',params);
 	 var value = aa_text(data,profile,'Value',params);
 	 if (property == "" || !ajaxart.ishtml(data[0]) ) return data;
 	 jQuery(data[0]).css(property,value);
 	 return data;
// 	 data[0].style[property] = value;
  },
  ExecJQuery: function(profile,data,params)
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
  DayOfWeek: function(profile,data,context)
  {
	  var value = ajaxart.totext_array(data);
	  var d = jQuery.datepicker.parseDate("dd/mm/yy",value);
	  var weekday=new Array(7);
	  weekday[0]="Sunday";
	  weekday[1]="Monday";
	  weekday[2]="Tuesday";
	  weekday[3]="Wednesday";
	  weekday[4]="Thursday";
	  weekday[5]="Friday";
	  weekday[6]="Saturday";

	  var out = weekday[d.getDay()];
	  return [out];
  },
  FormatDate: function(profile,data,context)
  {
	  try {
		  var dateFormat = aa_text(data,profile,'DateFormat',context);
		  if (data.length == 0) return [ aa_text(data,profile,'ValueForEmpty',context) ];
		  var txt = ajaxart.totext(data[0]);
		  if (txt.length == 0) return [ aa_text(data,profile,'ValueForEmpty',context) ];
		  var d = jQuery.datepicker.parseDate("dd/mm/yy",txt);
		  var result = jQuery.datepicker.formatDate(dateFormat,d);
		  return [result];
	  }
	  catch(e) { return []; }
  },
  TextboxValue: function(profile,data,context)
  {
	  var out= [];
		var elements = ajaxart.getControlElement(context);
		ajaxart.each(elements, function(element) {
			if (typeof(element.value) != "undefined")
				out.push("" + element.value);
		});
		return out;
  },
  DataFromJavaScript: function(profile,_data,context)
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
  RunJavaScript: function(profile, data, params) {
  	ajaxart.gcs.ui.DataFromJavaScript(profile, data, params);
  	return ["true"];
  },
  TextToHtml : function(profile, data, params) {
		if (ajaxart.ishtml(data[0])) return data[0];
		var text = ajaxart.totext(data[0]);
		if (text == "") return [];
		return [jQuery(text)[0]];
  },
  Switch: function (profile,data,params)
  {
	  return aa_switch(profile,data,params);
  },
  IsHtml: function (profile,data,context)
  {
	  if (ajaxart.ishtml(data)) return ["true"];
	  return [];
  },
  FirstSucceeding: function (profile,data,context)
  {
    var itemProfiles = ajaxart.subprofiles(profile,'Control');

    for(var i=0;i<itemProfiles.length;i++)
    {
    	var subresult = ajaxart.run(data,itemProfiles[i],"",context);
    	if (subresult.length > 0) 
    		return subresult;
    }
  	
  	return [];  	
  },
  ControlPutInStruct: function (profile,data,context)
  {
	  var control = ajaxart.run(data,profile,'Control',context);
  	  var struct = ajaxart.run(data,profile,'Struct',context);
	  var field = aa_text(data,profile,'Field',context);

	  if (control.length == 0) control = [ document.createElement('div') ];
  	  if ( ajaxart.isObject(struct) && field.length > 0)
  		  struct[0][field] = control;
  	  
	  control[0].Context = context;
  	  control[0].ParentObject = struct;
  	  aa_defineElemProperties(control[0],'ParentObject,Context');
  	  
	  return control;
  },
  OnKeyDown: function (profile,data,context)
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
  BindEvent: function (profile,data,context)
  {
  	if (data.length == 0) return;
	var newData = ajaxart.getVariable(context,"InputForChanges");
	var element = data;
	ajaxart.databind(element,newData,context,null);

	  var event = aa_text(data,profile,'Event',context);
	  var action = function(e) {
    	if (typeof(ajaxart_captured_element) != "undefined" && ajaxart_captured_element.length > 0) return [];
        var element = data[0];
    	
        var newContext = ajaxart.clone_context(context);
        
        if (!aa_bool(data,profile,'KeepOriginalRunOnControl',newContext))
          ajaxart.setVariable(newContext,"ControlElement",data);
        
    	ajaxart.ui.applyKeyboardEvent(e,newContext);
        
	  	var input = []; 
	  	if ('ajaxart' in element)
	  	  input = element.ajaxart.data;
	  	
  		ajaxart.run(input,profile,'Action',newContext);
	  };
	  ajaxart.ui.bindEvent(data[0],event,action);
	  return ["true"];
  },
  StandardButton: function (profile,data,context)
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
  SuggestionBox: function (profile,data,context)
  {
	  var out = document.createElement('input');
	  ajaxart.suggestbox.attachToTextbox(data,profile,context,out);
	  return [out]; 
  },
  CustomSuggestionBox: function (profile,data,context)
  {
	  var out = document.createElement('input');
	  ajaxart.customsuggestbox.attachToTextbox(data,profile,context,out);
	  return [out]; 
  },
  AddTextToSuggestionBox: function (profile, data,context)
  {
	  ajaxart.customsuggestbox.addTextToSuggestionBox(profile, data,context);  
	  return [];
  },
  CloseSuggestionBox: function (profile, data,context)
  {
	  ajaxart.suggestbox.closePopup();
	  return [];
  },
  OpenSuggestionBoxPopup: function (profile, data,context)
  {
	  ajaxart.customsuggestbox.openSuggestionBoxPopup(profile, data,context);
	  return [];
  },
  OpenSuggestionBoxList: function (profile, data,context)
  {
	  ajaxart.customsuggestbox.openSuggestionBoxList(profile, data,context);
	  return [];
  },
  TriggerSuggestionBoxPopup: function (profile, data,context)
  {
	  ajaxart.customsuggestbox.triggerSuggestionBoxPopup(profile, data,context);
	  return [];
  },
  UrlFragmentAttribute: function (profile,data,context)
  {
	var url = aa_text(data,profile,'Url',context);
	var attr = aa_text(data,profile,'Attribute',context);
	return [ aa_url_attribute(url,attr) ];
  },  
  RunInControlContext: function (profile,data,context)
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
  ScreenSize: function (profile,data,context)
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
  DisableTextSelection: function(profile, data, context)
  {
	if (! ajaxart.ishtml(data)) return [];
	control = jQuery(data[0]);
	
	if( jQuery.browser.mozilla ) { control.css({ 'MozUserSelect' : 'none' });
	} else if( $.browser.msie ) {
		control.each( function() { jQuery(this).bind('selectstart.disableTextSelect', function() { return false; }); });
	} else {
		control.each(function() { jQuery(this).bind('mousedown.disableTextSelect', function() { return false; }); });
	}
	return ["true"];
  },
  AddMousePressedEffect: function (profile,data,context)
  {
	  if (! ajaxart.ishtml(data) ) return data;
	  
	  var control = data[0];
	  jQuery(control).mousedown( function() {
		  if (jQuery(this).attr('pressed_src') != "")
			  jQuery(this).attr('src',jQuery(this).attr('pressed_src'));
		  jQuery(this).addClass('pressed').addClass('pressing');
	  }).mouseout( function() {
		  jQuery(this).removeClass('pressed');
		  jQuery(this).attr('src',jQuery(this).attr('original_src'));
	  }).mouseover( function() {
		  if (jQuery(this).hasClass('pressing')) {
			  jQuery(this).addClass('pressed').removeClass('pressing');
			  jQuery(this).attr('src',jQuery(this).attr('pressed_src'));
		  }
	  }).mouseup( function() {
		  jQuery(this).attr('src',jQuery(this).attr('original_src'));
		  jQuery(this).removeClass('pressed').removeClass('pressing');
	  });
	  return data;
  },
  InternalRefreshToAddItem: function (profile,data,context)
  {
	  var parent = aa_first(data,profile,'ParentControl',context);
	  var newItems = ajaxart.run(data,profile,'NewItems',context);
	  var controlForContext = aa_first(data,profile,'ControlForNewItemControlContext',context);
	  var jqPath = aa_text(data,profile,'JQPathForItems',context);
	  
	  if (parent == null || controlForContext == null || controlForContext.ajaxart == null) return [];
	  var controlContext = controlForContext.ajaxart.params;
	  
	  var currentControls = jQuery(parent).find(jqPath);
	  for(var i=0;i<newItems.length;i++)
	  {
		if (currentControls.length <=i) // adding at the end
		{
			var newControl = aa_first([newItems[i]],profile,'NewItemControl',controlContext);
			if (newControl != null)
			{
				ajaxart.xml.append(parent,newControl);
				ajaxart.run([newControl],profile,'OnNewItem',context);
			}
		}
	  }
  },  
  CheckboxesList: function (profile,data,context)
  {
	controls = ajaxart.getControlElement(context);
	if (controls.length == 0) return [];
	var elem = controls[0];
    var timeout = 1;
    if (ajaxart.isSafari) timeout = 100;
    
    var try_run_onload = function(count,timeout) {
    	if (count == 0) return;
	    if (jQuery(elem).parents("body").length == 0)  //detached
	    	setTimeout(function() { try_run_onload(count-1,timeout); } ,timeout); 
    else
    	ajaxart.run(data,profile,'OnLoad',context);	
    }
    try_run_onload(5,timeout);
  },  
	IsChrome: function (profile,data,context)
	{
		if (ajaxart.isChrome)
			return [ "true" ];
		else
			return [];
	},
	HtmlUnderElement: function(profile, data, context) {
		if (! ajaxart.isxml(data)) return [];

		var text = "";
		var node = data[0].firstChild;
		while (node != null) {
			if (node.nodeType == 3 || node.nodeType == 4) text += node.nodeValue;
			if (node.nodeType == 1) text += ajaxart.xml2text(node);
			node=node.nextSibling;
		}
		return [text];
	},
	ClassOfElement: function (profile,data,context)
	{
	  var element = ajaxart.run(data,profile,'Element',context);
	  if (element.length == 0 || !ajaxart.ishtml(element[0]))
	  	return [];
	  return element[0].className;
	},
	AddToDate : function(profile, data, context) {
		var date = aa_text(data,profile,'Date',context);
		var amountToAdd = aa_int(data,profile,'AmountToAdd',context);
		var interval = aa_text(data,profile,'Interval',context);
		return [aadate_addToDate(date,amountToAdd,interval)];
	},
 	ValidationList: function (profile,data,context)
 	{
	    var itemProfiles = ajaxart.subprofiles(profile,'Validation');
	    for(var i=0;i<itemProfiles.length;i++)
	    	ajaxart.run(data,itemProfiles[itemProfiles.length - i -1],"",context);
	    return [];
 	},
 	  DatePickerAdapter: function (profile,data,context)
 	  {
 		var date_iframe = aa_DateIframe;
 		
 		if (date_iframe == null || ajaxart.isIE7 )
 		{
 			var src = ajaxart.getVariable(context,"_Lib") + "/datepicker/datepicker.html";
 			date_iframe = aa_DateIframe = jQuery('<iframe style="height:201px; width:193px; border:none;" class="datepickerframe" src="' + src + '" frameborder="0" scrolling="no" />')[0];
 		}
 		date_iframe.Context = context;
 		date_iframe.Locale = aa_text(data,profile,'Locale',context);
 		date_iframe.Date = aa_text(data,profile,'Date',context);
 		ajaxart_addMethod(date_iframe,'OnUpdate',profile,'OnUpdate',context);
 		return [date_iframe];
 	},
	HorizontalSplitter: function (profile,data,context)
	{
		var idForCookie = aa_text(data,profile,'IdForCookie',context);
		var height = aa_text(data,profile,'Height',context);
		var totalWidth = aa_text(data,profile,'TotalWidth',context);
		var sections = ajaxart.dynamicText(data,"%$SectionsContext/Sections%",context);

		var widths = ajaxart.cookies.valueFromCookie(idForCookie + "_splitterwidths");
		var keepTotalWidth = aa_bool(data,profile,'KeepTotalWidth',context);
		if (widths == null || widths == "")
			widths = ajaxart.run(data,profile,'DefaultWidths',context);
		else
			widths = widths.split(",");
		if (totalWidth != "" && widths.length+1 >= sections.length) {	// setting last column width
			var width_sum = 0;
			for (var j=0; j<sections.length-1; j++)
				width_sum += ajaxart.ui.width_as_num(widths[j]) + 15;// 15 is one splitter width
			widths[sections.length-1] = (ajaxart.ui.width_as_num(totalWidth) - width_sum) + "px";
		}
		var middle_splitter_height = ajaxart.ui.width_as_num(height) - 22 - 47 - 43;//22 - title, 47,43 - top & bottom splitters
		var sections_height = ajaxart.ui.width_as_num(height) - 22;
		var table = jQuery('<table cellpading="0" cellspacing="0" />')[0];
		var tr = document.createElement("TR"); table.appendChild(tr);
		for (var i=0; i<sections.length; i++) {
			var section = sections[i];
			var td1 = document.createElement("TD"); tr.appendChild(td1); td1.className="horizontal_section_td";
			var width = (widths.length > i) ? widths[i] : "200px";
			var div1 = jQuery("<div class='horizontal_section' style='width:"+ width+";height:" + sections_height + "px' />")[0]; td1.appendChild(div1);
			var title = ajaxart.totext(ajaxart.dynamicText([section],"%Title%",context));
			if (title != "")
				jQuery(div1).append(jQuery('<div class="horizontal_section_title">').text(title));
			var control = ajaxart.runNativeHelper([section],profile,'Control',context);
			if (control.length > 0)
				div1.appendChild(control[0]);
			
			// splitter
			if (i+1 < sections.length) {	//not last
				var splitter = jQuery('<td class="splitter" > <div class="splitter_top" /><div class="splitter_middle" style="height:' + middle_splitter_height + 'px" /><div class="splitter_bottom" /></td>');
				splitter.mousedown(function(e) {
					var mousepos = aa_mousePos(e);
					var splitter = jQuery( (typeof(event)== 'undefined')? e.target : event.srcElement  ); 
					table["section"] = jQuery(splitter).parents(".splitter").prev().find(".horizontal_section")[0];
					table["diff"] = mousepos.x - jQuery(table["section"]).width();
					table["last_section"] = jQuery(splitter).parents(".splitter").siblings(":last").find(".horizontal_section")[0];
					table["last_section_diff"] = jQuery(table["last_section"]).width() + mousepos.x;
					table["moving"] = true;
				} );
				jQuery(tr).append( splitter );
			}
		}
		jQuery(table).mouseup(function(e) {
			if (table["moving"]) {	// write widths to cookie
				var widths = "";
				var sections = jQuery(table).find(".horizontal_section");
				for (i=0; i<sections.length; i++)
					widths += jQuery(sections[i]).width() + "px,";
				ajaxart.cookies.writeCookie(idForCookie + "_splitterwidths", widths);
			}
			table["moving"] = false;
		} );
		jQuery(table).mousemove(function(e) {
			if (!table["moving"] || table["section"]==null) return;
			var mousepos = aa_mousePos(e);
			jQuery(table["section"]).width(mousepos.x - table["diff"]);
			if (keepTotalWidth)
				jQuery(table["last_section"]).width(table["last_section_diff"] - mousepos.x);
		} );
		return [table];
	},
	CssClassesInControl: function (profile,data,context)
	{
		var control = aa_first(data,profile,'Control',context);
		var classes = {}
		var obj = {};
		obj.find = function(elem) {
			var cls = elem.className.split(' ');
			for(var i=0;i<cls.length;i++) classes[cls[i]] = true;
			var children = jQuery(elem).children();
			for(var i=0;i<children.length;i++) obj.find(children[i]);
		}
		
		if (control != null) obj.find(control);
		var out = [];
		for(var i in classes)
			out.push("."+i);
		return out;
	}
});
//AA EndModule
//AA BeginModule
ajaxart.gcs.richtext =
{
	RichText: function (profile,data,context)
	{
	  var out = ajaxart.runNativeHelper(data,profile,'Textarea',context)[0];

	  var css = aa_text(data,profile,'Css',context);
	  var box_height = aa_text(data,profile,'Height',context);
	  if (box_height == "")
		box_height = "300px";

	  var height_parts = box_height.split("px");
	  if (height_parts.length > 0)
		box_height = height_parts[0] - 25 + "px";
	  
	  out.id = "tinymce" + (ajaxart.unique_number++);
	  out.style.height = box_height;
	  out.style.width = "100%";

	  aa_addOnDetach(out,function() {
		  jQuery('.mceDropDown').remove();
		  try {
		    tinyMCE.editors[out.tinyEditor].remove();	// memory leak fix
		  } catch(e) {
			  ajaxart.log("error closing tinyMCE - " + e.message,"error");
		  }
	  });

	  out.jbSetDialogReady = function() {
		jQuery(out).removeClass('aa_dialog_not_ready');
		aa_fixTopDialogPosition();
	  } 
	  aa_addOnAttach(out,function() {
  		if (typeof(tinyMCE) == "undefined" ) {
  			out.jbSetDialogReady();
  			return;
  		}
  		
  		var init = function(out) {
  			aa_defineElemProperties(out,'jtinyEditor,setTinyMCEText,aa_update,SetFocus'); // for memory leaks
  			
  			out.tinyEditor = out.id;
  			out.setTinyMCEText = function(text) {
  				tinyMCE.editors[out.tinyEditor].setContent(text);
  			}
  			out.SetFocus = function() {
  			  if (tinyMCE) tinyMCE.execInstanceCommand(out.tinyEditor, "mceFocus");
  			}
  			var language = aa_totext(context.vars.Language);   // TODO: if hebrew tell tinymce to show hebrew
  			
	  	    var direction = (aa_text(data,profile,'Direction',context) == "Right to Left") ? "rtl" : "ltr"; 
	    	var buttons = aa_text(data,profile,'Buttons',context).split(",CR,");
	  		out.aa_update = function () {
				var content = tinyMCE.activeEditor.getContent();
				ajaxart_runevent(out,'TextControlContext','UpdateData',content);
	  		}
			tinyMCE.init({
				mode : "exact",
				plugins : "pagebreak,style,layer,table,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,wordcount,advlist,phpimage",
				elements : out.id,
				theme : "advanced",
				init_instance_callback : fixTinyMCETabIssue,
				force_br_newlines : true,
				force_p_newlines : false,
//				content_css : "lib/tiny_mce/richtext_content.css",
				directionality : direction,
				theme_advanced_toolbar_location : "top",
				theme_advanced_buttons1 : (buttons.length > 0) ? buttons[0] : "",
				theme_advanced_buttons2 : (buttons.length > 1) ? buttons[1] : "",
				theme_advanced_buttons3 : (buttons.length > 2) ? buttons[2] : "",
				theme_advanced_buttons4 : (buttons.length > 3) ? buttons[3] : "",
				accessibility_warnings : false, // no warnings
				translate_mode : true,
				language : (language == 'hebrew') ? "he" : "en",
				handle_event_callback : (ajaxart.isIE) ? "aa_tinymce_handleEvent" : aa_tinymce_handleEvent,
			    paste_retain_style_properties: "all",/*This is a MUST, because we need to know the li margin !!!*/
			    paste_remove_styles_if_webkit: false, /*This is a MUST, because we need to know the li margin !!!*/
				setup : function(ed) {
					ed.onInit.add(function(ed) {
						// setting css for design-time
						var css_fixed = css.replace(/#this/g, ".mceContentBody");
						var style_elem=jQuery("<style>" + css_fixed + "</style>")[0];
						ed.contentDocument.getElementsByTagName("head")[0].appendChild(style_elem);

			  			out.jbSetDialogReady();
				      });
					ed.onChange.add(function(ed) {
						out.aa_update();
					 });
					ed.onClick.add(function(ed, evt) {
						aa_closePopup();
					});
			    }
			});
	  		}
  		init(this);
  		setTimeout(out.jbSetDialogReady,4000);
  	  });

	  jQuery(out).addClass('aa_dialog_not_ready');
	  return [out];
	}
}

function fixTinyMCETabIssue(inst) {
    inst.onKeyDown.add(function(inst, e) {
        // Firefox uses the e.which event for keypress
        // While IE and others use e.keyCode, so we look for both
        if (e.keyCode) code = e.keyCode;
        else if (e.which) code = e.which;
        if(code == 9 && !e.altKey && !e.ctrlKey) {
            // toggle between Indent and Outdent command, depending on if SHIFT is pressed
            if (e.shiftKey) inst.execCommand('Outdent');
            else inst.execCommand('Indent');
            // prevent tab key from leaving editor in some browsers
            if(e.preventDefault) {
                e.preventDefault();
            }
            return false;
        }
    });
}
//AA EndModule
//AA BeginModule
//AA EndModule
if (!ajaxart.ui ) ajaxart.ui = {}
ajaxart_condition = function(element,actionContext,actionToRun,controlData)
{
	var result = ajaxart_runevent(element,actionContext,actionToRun,controlData);
	return (typeof(result) != "undefined" && result.length == 1 && (result[0] == true || result[0] == "true") );
}
ajaxart_delay_counter=0;

aa_tinymce_handleEvent = function(e,obj)
{
	if (e.type != 'keyup') return;
   
   var elem = jQuery('#'+obj.id);
   if(elem.length > 0 && elem[0].aa_update)
       elem[0].aa_update();
}
ajaxart_delayrunevent = function(element,actionContext,actionToRun,controlData,_event,delay)
{
  if (! ajaxart.isattached(element)) {
	  ajaxart_runevent(element,actionContext,actionToRun,controlData,_event);
	  return;
  }
  
  if (typeof(delay) == "undefined") delay = 200;
  
  var counter1 = ++ajaxart_delay_counter;
  
  var func = function(counter)
  {
	  setTimeout(function() { 
		  if (ajaxart_delay_counter != counter) return;
		  ajaxart_runevent(element,actionContext,actionToRun,controlData,_event); 
	  } ,delay);
  }
  func(counter1);
}
ajaxart_selectionchanged = function(element)
{
	ajaxart_runevent(element,'MasterDetailContext','SelectionChanged');
}
ajaxart_css_selection = function(element,topElementByCss)
{ 
	var top = jQuery(element).parents("." + topElementByCss);
	var mosttop = top.parents(".ajaxart_single_selection_top");
	if (mosttop.length > 0) top = mosttop;
	top.find(".selected").removeClass("selected");
	
	jQuery(element).addClass('selected');	
}
ajaxart_container_event = function(event,topElementCls,itemCls,actionContext)
{
    var element = (typeof(event.target)== 'undefined')? event.srcElement : event.target;
    if (ajaxart.isSafari && ajaxart_source_elem_in_test != null)
    	element = ajaxart_source_elem_in_test;
    
    if (event.type == 'keydown') {
    	var selectedItems = jQuery(element).parents("."+topElementCls).find('.selected');
    	if (selectedItems.length > 0)
    		element = selectedItems[0];
    }
    	
    var dataElem = ajaxart_container_find_databound_elem(element,itemCls);
    
    if (dataElem != null)
    {
    	if (event.type == 'click') {
    		ajaxart_css_selection(dataElem,topElementCls);
    		ajaxart_selectionchanged(dataElem);
    		ajaxart_runevent(dataElem,actionContext,'OnSelect');
    	}
    	else if (event.type == 'dblclick')
    		ajaxart_runevent(dataElem,actionContext,'OnDoubleClick');
    	else if (event.type == 'keydown')
    	{
    		if (event.keyCode == "13") // enter
        	  ajaxart_runevent(dataElem,actionContext,'OnDoubleClick');
  	        if (event.keyCode == 40)  // down  
			  ajaxart_container_move_cursor(dataElem,1);
	  	    if (event.keyCode == 38)  // up  
  			  ajaxart_container_move_cursor(dataElem,-1);
    	}
    }
    
	if ( jQuery(element).find("#key_sink").focus().length == 0)
		jQuery(element).parents("."+topElementCls).find("#key_sink").focus();
}

ajaxart_container_find_databound_elem = function(element,itemCls)
{
	if ( jQuery(element).hasClass(itemCls) ) return element;
	var result = jQuery(element).parents("."+itemCls);
	if (result.length == 0) return null;
	return result[0];
}

ajaxart_container_move_cursor = function(element,delta)
{
}

ajaxart.ui.lastEvent = null;

function aa_is_fixed_position(elem) 
{
	for (var curr=elem; curr && curr != document.body; curr=curr.parentNode)
	  if ( (curr.currentStyle && curr.currentStyle['position'] == 'fixed') ||
	  	(window.getComputedStyle && window.getComputedStyle(curr, null)['position'] == 'fixed'))
	  		return true;
	return false;
}

function aa_widthToWindowRight(control,delta,applyOn)
{
	if (!ajaxart.isattached(control) ) return;
	if (!applyOn) applyOn="width";

	if (typeof(delta) == "undefined" || isNaN(delta)) delta=0;

	if (jQuery(control).parents('.studio_simulator').length > 0) {	// in studio, use simulator window height
		  var simulator = jQuery(control).parents('.studio_simulator')[0];
		  if (simulator.className.indexOf(' ') > -1) { // only when a view is on
			  screenWidth = simulator.clientWidth;
		  	  var controlLeft = aa_absLeft(control) - aa_absLeft(simulator.firstChild);
		  	  var newWidth = screenWidth-controlLeft- delta; 
			  if (newWidth < 50) newWidth = 0;
			  jQuery(control).css(applyOn,newWidth + 'px');
		  }
	} else {
		var screenWidth = window.innerWidth || (document.documentElement.clientWidth || document.body.clientWidth);
		var controlLeft = aa_absLeft(control);
	  	if (!aa_is_fixed_position(control))
	  	  controlLeft -= window.scrollX;
		jQuery(control).css(applyOn,(screenWidth - controlLeft-delta) + 'px');
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
		
		var dlgBottom = dlg[0].dialogHeight + aa_absTop(dlg[0]);
	  	var controlTop = jQuery(control).position().top;
	  	if (dlgBottom - controlTop - delta > 50) {
	  		newHeight = dlgBottom - controlTop - delta;
	  	}
	}
	else if (aa_has_simulator(control)) {	// in studio, use simulator window height
		  var simulator = jQuery(control).parents('.studio_simulator')[0];
	  	  var controlTop = aa_absTop(control,true) - aa_absTop(simulator.firstChild,true);
	  	  newHeight = simulator.clientHeight -controlTop- delta; 
	} else {// normal mode
	  var screenHeight = window.innerHeight || (document.documentElement.clientHeight || document.body.clientHeight);
  	  var controlTop = aa_absTop(control,true);
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

ajaxart_update = function(element,value,expression)
{
	var dataBoundElem = jQuery(element);
	if (! dataBoundElem.hasClass("aa_custom_control"))
		dataBoundElem = jQuery(element).parents(".aa_custom_control");
	if (dataBoundElem.length == 0) return;
	ajaxart_runevent(dataBoundElem[0], '_CustomControlContext', 'UpdateData', value);
}
ajaxart_data = function(element)
{
	var context = ajaxart_get_context(element);
	if (context == null) return null;
    if (context.data.length > 0)
    	return context.data[0];
}
ajaxart_param = function(element,param_name)
{
	var context = ajaxart_get_context(element);
	if (context == null) return null;
	var param = context.params.componentContext.params[param_name];
	if (param == null) {
		ajaxart.log("Param " + param_name + " does not exist", "warning");
		return null;
	}
	if (param.length == 0) return "";
	var as_text = ajaxart.totext(param);
	if (as_text != "")
		return as_text;
	else
		return param[0];
}
ajaxart_get_context = function(element)
{
	var dataBoundElem = jQuery(element);
	if (! dataBoundElem.hasClass("aa_custom_control"))
		dataBoundElem = jQuery(element).parents(".aa_custom_control");
	if (dataBoundElem.length == 0) return;
    var context = dataBoundElem[0]["ajaxart"];
    if (typeof(context) == "undefined") {
    	ajaxart.log("control does not contain ajaxart data","warning");
    	return null;
    }
    return context;
}

ajaxart.ui.getScriptParamContext = function(scriptObject)
{
	if (typeof(scriptObject.objectForMethod) == undefined) 
		return scriptObject.context;

	var newContext = ajaxart.clone_context(scriptObject.context);
    newContext.vars['_This'] = scriptObject.objectForMethod;
    return newContext;
}

ajaxart_ui_imposeMaxLength = function(event, element, maxLen)
{
	return (element.value.length < maxLen) || ajaxart_ui_isbackwards(event);
}

ajaxart_ui_isbackwards = function(event)
{
	return (event.keyCode == 8 || event.keyCode==46 ||(event.keyCode>=35 && event.keyCode<=40));
}

ajaxart_ui_validate = function(event, element)
{
	var elem_context = element["ajaxart"];
	if (typeof(elem_context) == "undefined") 
		return true;
	
	var params = elem_context.params;
	var actionToRunPack = { script: ajaxart.getVariable(params,'KeyPressValidator')[0] , context: params};
	
	var keyCode = event.charCode;
	if (keyCode == undefined)
		keyCode = event.keyCode;
	var validation = ajaxart.run([String.fromCharCode(keyCode)],actionToRunPack.script,"",elem_context);
	var result = (validation[0] == 'true') || ajaxart_ui_isbackwards(event); 
	return result;
}
ajaxart_capture_onclick = function(f)
{
    if (window.captureEvents)
    	window.onclick = f;
	else  // IE
		document.onclick = f;
}
ajaxart_ui_capture_mousemove = function(f)
{
    if (window.captureEvents)
    	window.onmousemove = f;
	else  // IE
		document.onmousemove = f;
}
function ajaxart_stop_event_propogation(e)
{
	if (!e) return;
	if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
	e.cancelBubble = true;
	return false;
}

ajaxart_set_text = function(element,text)
{
	  text = text.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;");
	  element.innerHTML = text;
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
ajaxart.ui.contextWithCurrentControl = function(context, control)
{
	  var newcontext = ajaxart.clone_context(context);
	  ajaxart.setVariable(newcontext,"ControlElement",[control]);
	  return newcontext;
}
ajaxart.ui.width_as_num = function(width)
{
	var out;
	if (width.indexOf("px") > 0)
		out = Number(width.split("px")[0]);
	else
		out = Number(width);
	if (isNaN(out)) return 0;
	return out;
} 
ajaxart.ui.page_dimensions = function()
{
	var d = {};
	if( window.innerHeight ) {
		d.pageYOffset = window.pageYOffset;
		d.pageXOffset = window.pageXOffset;
		d.innerHeight = window.innerHeight;
		d.innerWidth = window.innerWidth;
	} else if( document.documentElement && document.documentElement.clientHeight ) {
		d.pageYOffset = document.documentElement.scrollTop;
		d.pageXOffset = document.documentElement.scrollLeft;
		d.innerHeight = document.documentElement.clientHeight;
		d.innerWidth = document.documentElement.clientWidth;
	} else if( document.body ) {
		d.pageYOffset = document.body.scrollTop;
		d.pageXOffset = document.body.scrollLeft;
		d.innerHeight = document.body.clientHeight;
		d.innerWidth = document.body.clientWidth;
	}
	return d;
}

function ajaxart_shortcut_matchs_event() 
{
	//Work around for stupid Shift key bug created by using lowercase - as a result the shift+num combination was broken
	var shift_nums = {"`":"~","1":"!","2":"@","3":"#","4":"$","5":"%","6":"^","7":"&","8":"*","9":"(","0":")","-":"_","=":"+",";":":","'":"\"",",":"<",".":">","/":"?","\\":"|"
	}
	//Special Keys - and their codes
	var special_keys = {'esc':27,'escape':27,'tab':9,'space':32,'return':13,'enter':13,'backspace':8,
'scrolllock':145,'scroll_lock':145,'scroll':145,'capslock':20,'caps_lock':20,'caps':20,'numlock':144,'num_lock':144,'num':144,'pause':19,'break':19,'insert':45,'home':36,'delete':46,'end':35,'pageup':33,'page_up':33,'pu':33,
'pagedown':34,'page_down':34,'pd':34,
'left':37,'up':38,'right':39,'down':40,
'f1':112,'f2':113,'f3':114,'f4':115,'f5':116,'f6':117,'f7':118,'f8':119,'f9':120,'f10':121,'f11':122,'f12':123
	}

	return function(shortcut_combination,e) {
		shortcut_combination = shortcut_combination.toLowerCase();
		e = e || window.event;
		
		//Find Which key is pressed
		if (e.keyCode) code = e.keyCode;
		else if (e.which) code = e.which;
		var character = String.fromCharCode(code).toLowerCase();
		
		if(code == 188) character=","; //If the user presses , when the type is onkeydown
		if(code == 190) character="."; //If the user presses , when the type is onkeydown

		var keys = shortcut_combination.split("+");
		//Key Pressed - counts the number of valid keypresses - if it is same as the number of keys, the shortcut function is invoked
		var kp = 0;
		
		var modifiers = { 
			shift: { wanted:false, pressed:false},
			ctrl : { wanted:false, pressed:false},
			alt  : { wanted:false, pressed:false},
			meta : { wanted:false, pressed:false}	//Meta is Mac specific
		};
                    
		if(e.ctrlKey)	modifiers.ctrl.pressed = true;
		if(e.shiftKey)	modifiers.shift.pressed = true;
		if(e.altKey)	modifiers.alt.pressed = true;
		if(e.metaKey)   modifiers.meta.pressed = true;
                    
		for(var i=0; k=keys[i],i<keys.length; i++) {
			//Modifiers
			if(k == 'ctrl' || k == 'control') {
				kp++;
				modifiers.ctrl.wanted = true;

			} else if(k == 'shift') {
				kp++;
				modifiers.shift.wanted = true;

			} else if(k == 'alt') {
				kp++;
				modifiers.alt.wanted = true;
			} else if(k == 'meta') {
				kp++;
				modifiers.meta.wanted = true;
			} else if(k.length > 1) { //If it is a special key
				if(special_keys[k] == code) kp++;
				
			} else { //The special keys did not match
				if(character == k) kp++;
				else {
					if(shift_nums[character] && e.shiftKey) { //Stupid Shift key bug created by using lowercase
						character = shift_nums[character]; 
						if(character == k) kp++;
					}
				}
			}
		}
		
		if(kp == keys.length && 
					modifiers.ctrl.pressed == modifiers.ctrl.wanted &&
					modifiers.shift.pressed == modifiers.shift.wanted &&
					modifiers.alt.pressed == modifiers.alt.wanted &&
					modifiers.meta.pressed == modifiers.meta.wanted) {
			return true;
		}
	}
	return false;
}

jQuery.extend(jQuery.fn, {
	disableTextSelect: function() {
		this.each( function () { ajaxart_disableSelection(this); } );
		return this;
	}
});

function aa_add_virtual_inner_element(elem,inner)
{
	if (!elem.virtual_inner_elements) elem.virtual_inner_elements = [];
	elem.virtual_inner_elements.push(inner);
}
function aa_addClassNoCheck(element,cls)
{
	if (element.className == "") element.className = cls;
	else element.className += " " + cls;
}
function aa_addClass(element,cls)
{
	if (element.className.indexOf(cls) == -1) {
		if (element.className == "") element.className = cls;
		else element.className += " " + cls;
	}
	else jQuery(element).addClass(cls);
}
function aa_hide(elem)
{
  elem.style.display = 'none'; elem.display = 'none';
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
aa_DateIframe = null;
function aa_fixStretchOnElem(elem)
{
	if (elem.fixStretchBottom) elem.fixStretchBottom();
	if (elem.fixStretchRight) elem.fixStretchRight();
}
function aa_fixstretch()
{
	var elems = jQuery('body').find('.aa_stretch');
	for(var i=0;i<elems.length;i++) 
	  aa_fixStretchOnElem(elems[i]);
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
function aa_stretchToRight(elem,margin,doNotAddOverflow)
{
	jQuery(elem).addClass('aa_stretch');
	if (!doNotAddOverflow) jQuery(elem).css('overflow','auto');
	elem.fixStretchRight = function () { aa_widthToWindowRight(this,margin); aa_htmlContentChanged(this); }
	aa_addOnAttach(elem,function() { aa_fixStretchOnElem(this); });
	aa_init_onresize();
}
function aa_stretchToBottom(elem,margin,doNotAddOverflow)
{
	jQuery(elem).addClass('aa_stretch');
	if (!doNotAddOverflow) jQuery(elem).css('overflow','auto');
	elem.fixStretchBottom = function () { ajaxart.ui.HeightToWindowBottom(this,margin); aa_htmlContentChanged(this); }
	aa_addOnAttach(elem,function() { aa_fixStretchOnElem(this); });
	aa_init_onresize();
}
function aa_init_horiz_resizer(elem,resizer)
{
	resizer.onmousedown = function(e) {
		document.onmouseup = function(e1) {
			document.onmouseup = null;
			document.onmousemove = null;
			ajaxart_disableSelection(jQuery('body')[0]);
			return false;
		}
		document.onmousemove = function(e1) {
			var mousepos = aa_mousePos(e1);
			var elemX = aa_absLeft(elem,false);
			if (mousepos.x < elemX+5) return;
			var newWidth = mousepos.x - elemX;
			jQuery(elem).width(newWidth+"px");
			aa_fixstretch();
			aa_stop_prop(e1);
			ajaxart_restoreSelection(jQuery('body')[0]);
			return false;
		}
	}
	return false;
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
function aa_run_when_js_is_loaded(expression_to_check, to_run) {
	var again = function() {
		aa_run_when_js_is_loaded(expression_to_check, to_run);
	};
	if (typeof(eval(expression_to_check)) == "undefined") {
		setTimeout( again , 500 );
		return;
	}
	to_run();
}
function aa_run_when_attahced(elem, to_run)
{
	var again = function() {
		aa_run_when_attahced(elem,to_run);
	}
	if (! ajaxart.isattached(elem)) {
		  setTimeout( again , 100 );
		  return;
	  }
	to_run();
}
function aa_text_val(exp,data,context) {
	return ajaxart.totext_array(ajaxart.dynamicText(data,exp,context));
}







//AA BeginModule
aa_gcs("ui_async", {
  LoadingControl: function (profile,data,context)
  {
	  var id = aa_text(data,profile,'DivID',context);
	  var div = jQuery('#'+id);
	  if (div.length >0) { div[0].IsUsed = true; div.show(); return [div[0]]; }
	  return jQuery('<div>'+ajaxart_multilang_text("loading...",context)+"</div>").get();
  },
  ControlWithTimer: function (profile,data,context)
  {
	var out = jQuery('<div>')[0];
	setTimeout(function() {
		var contents = aa_first(data,profile,'Control',context);
		if (contents) out.appendChild(contents);
		aa_element_attached(contents);
	},20);
	return [out];
  },
  ControlUsage: function (profile,data,context)
  {
	  ajaxart_async_Mark(context);
	  aa_intest = true;
	  var control = aa_first(data,profile,'Control',context);
	  window.aa_intest_topControl = control;
	  if (control == null) { ajaxart_async_CallBack(["no control"],context); return }

      var listener = {};
      var listen = function(listener,control) {
    	  aa_async_finished_listeners.push(listener);
    	  listener.OnAsyncActionFinished = function() {
    		  if (jQuery(control).hasClass('aa_loading') || jQuery(control).find('.aa_loading').length > 0) return; // still have aa_loading. we'll wait for the next time
    		  aa_remove_async_finished_listener(listener);

    		  var newContext = aa_ctx(context,{ControlElement: [control], TopControlForTest: [control], InTest: ['true']});

    		  aa_intest = true;
    		  ajaxart_RunAsync(data,ajaxart.fieldscript(profile, 'RunOnControl',false),newContext,function() {
        		  aa_intest = true;
        		  var newContext = aa_ctx(context,{ControlElement: [control], TopControlForTest: [control], InTest: ['true']});
        		  
        		  if (context.vars._TestOutput) context.vars._TestOutput[0].OutputControl = control;

        		  var passed = aa_bool([control],profile,'ExpectedResult',newContext);
        		  ajaxart.run(data,profile,'CleanAfter',newContext);
        		  window.aa_intest_topControl = null;
        		  if (!ajaxart.inPreviewMode)
        			  ajaxart.runNativeHelper([],profile,'CloseDialogAndPopUp',context);
        		  var out= [];
        		  if (!passed) out = [control];
        		  
        		  aa_intest = false;
        		  ajaxart_async_CallBack(out,context); 
    		  });
    	  }
    	  listener.OnAsyncActionFinished();
      }
      listen(listener,control);
  },
  WaitForAsyncToFinish: function (profile,data,context)
  {
	  var jControl = jQuery(context.vars.TopControlForTest);
	  if (jControl.find('.aa_loading').length == 0) return;
      ajaxart_async_Mark(context);
      var listener = {};
      var listen = function(listener,jControl) {
    	  aa_async_finished_listeners.push(listener);
    	  listener.OnAsyncActionFinished = function() {
    		  if (jControl.find('.aa_loading').length > 0) return;	// still have aa_loading. we'll wait for the next time
    		  aa_remove_async_finished_listener(listener);
    		  ajaxart_async_CallBack(data,context);  
    	  }
      }
      listen(listener,jControl);
  }
});
//AA EndModule











aa_gcs("uiaspect",{
	  DeleteOnHover: function (profile,data,context)
	  {
		var aspect = {isObject:true}
		aspect.InitializeElements = function(data1,ctx) {
			var cntr = ctx.vars._Cntr[0];
			if (cntr.ReadOnly) return;
			var delClass = 'aa_delete_hover';
			var delImage = aa_text(data,profile,'DeleteImage',context);
			cntr.HoverRightMargin = aa_int(data,profile,'RightMargin',context);
			cntr.HoverTopMargin = aa_int(data,profile,'TopMargin',context);
			
			var hoverClass = aa_attach_global_css('#this { position: relative; } #this>.aa_delete_hover { display: none; }');
			var hoverShowClass = aa_attach_global_css('#this:hover .aa_delete_hover { display: inline-block; }');
			
			var elems = ctx.vars._Elems;
			for(var i=0;i<elems.length;i++) {
				var jElem = jQuery(elems[i]);
				var delDiv = jElem[0].jbDeleteDiv = jQuery('<div/>').css('position','absolute')
					.css('right',cntr.HoverRightMargin+'px').css('top',cntr.HoverTopMargin+'px').addClass(delClass)[0];
				
				delDiv.jbElem = jElem[0];
				delDiv.style.background = "url(" + delImage + ') no-repeat';
				delDiv.onclick = function() {
					var itemData = this.jbElem.ItemData;
					var ctx2 = aa_ctx(aa_merge_ctx(context,ctx),{_ElemsOfOperation: [this.jbElem],_ItemsOfOperation: itemData });
					ajaxart.runNativeHelper(itemData,profile,'Delete',ctx2);
				}
				
				if (jElem[0].tagName.toLowerCase() == 'tr') {
				  var tds = jElem.find('>td').get();
				  if (tds.length) tds[tds.length-1].appendChild(delDiv);
				}
				else 
					jElem[0].appendChild(delDiv);
				
				jQuery(delDiv.parentNode).addClass(hoverClass);
				jElem.addClass(hoverShowClass);
			}
		}
		return [aspect];
	  },
	  DeleteOnHover1: function (profile,data,context)
	  {
		var aspect = {isObject:true}
		aspect.InitializeElements = function(data1,ctx) {
			var cntr = ctx.vars._Cntr[0];
			if (cntr.ReadOnly) return;
			
			cntr.HoverRightMargin = aa_int(data,profile,'RightMargin',context);
			cntr.HoverTopMargin = aa_int(data,profile,'TopMargin',context);
			
			if (! cntr.DeleteDiv ) {
				cntr.DeleteDiv = jQuery('<div style="display:none" class="aa_delete_hover" />')[0];
				cntr.DeleteDiv.style.background = "url(" + aa_text(data,profile,'DeleteImage',context) + ') no-repeat';
				cntr.DeleteDiv.onmousedown = function() {
					var ctx2 = aa_ctx(aa_merge_ctx(context,ctx),{_ElemsOfOperation: [this.ItemElement],_ItemsOfOperation: this.ItemData });
					ajaxart.runNativeHelper(this.ItemElement.ItemData,profile,'Delete',ctx2);
				}
				cntr.DeleteDiv.onmouseout = function(e) {
					if (!e) var e = window.event;
					var relTarg = e.relatedTarget || e.toElement;
					if (relTarg == this.ItemElement) return;
					jQuery(this).hide();
				}
				cntr.Ctrl.appendChild(cntr.DeleteDiv);
			}
			var elems = ctx.vars._Elems;
			for(var i=0;i<elems.length;i++) {
				var elem = elems[i];
				elem.onmouseover = function() { 
					var cntr = ctx.vars._Cntr[0];
					cntr.DeleteDiv.ItemElement = this;
					cntr.DeleteDiv.ItemData = this.ItemData;
					var left = (aa_absLeft(this) + jQuery(this).width() - cntr.HoverRightMargin);
					var top = (aa_absTop(this)+cntr.HoverTopMargin);
				    if (aa_is_rtl(cntr.Ctrl)) left = aa_absLeft(this) + cntr.HoverRightMargin;
					if (jQuery(this).parents('.aapopup').length > 0) { 
						left -= aa_absLeft(jQuery(this).parents('.aapopup')[0]);
						top -= aa_absTop(jQuery(this).parents('.aapopup')[0]);
					}
				    if (ajaxart.isChrome) {
					  var dlg = jQuery(this).parents('.dialog_box')[0];
					  if (!dlg) dlg = jQuery(this).parents('.aa_dlg')[0];
					  if (dlg) { left -= aa_absLeft(dlg); top -= aa_absTop(dlg); }
				    }
					
					cntr.DeleteDiv.style.left = left + "px";
					cntr.DeleteDiv.style.top = top + "px";
					//this.appendChild(cntr.DeleteDiv);
					jQuery(cntr.DeleteDiv).show();
				}
				elem.onmouseout = function(e) {
					var cntr = ctx.vars._Cntr[0];
					if (!e) var e = window.event;
					var relTarg = e.relatedTarget || e.toElement;
					if (relTarg == cntr.DeleteDiv) return;
					
					var cntr = ctx.vars._Cntr[0];
					jQuery(cntr.DeleteDiv).hide();
				}
			}
		}

		return [aspect];
	  },
		TableSummaryLine: function (profile,data,context)
		{
			var aspect = { isObject : true };
			aspect.InitializeContainer = function(data1,ctx) {
				var cntr = ctx.vars._Cntr[0];
				if (! cntr.TableSummaryLines) cntr.TableSummaryLines = [];
				cntr.TableSummaryLines.push({ 
						isObject: true,	
						Title: aa_text(data,profile,'Title',context),
						Formula: aa_text(data,profile,'Formula',context),
						IsRelevant: function(group) { 
							if (group)
							{
								var showInGroup = aa_text([],profile,'ShowInGroup',context);
								if (showInGroup == 'never' || (showInGroup == 'auto' && group.Count < 2)) 
									return false;
							}
							return true;
						}
				});
				cntr.InjectSummaryLines = function(cntr,list,group)
				{
					var ths = jQuery(cntr.Ctrl).find('.aatable>thead').find('>tr>th');
					for(var line in cntr.TableSummaryLines)
					{
						if (! cntr.TableSummaryLines[line].IsRelevant(group)) continue;
						var formula = cntr.TableSummaryLines[line].Formula;
				    	var tr = document.createElement('TR');
					    if (group) 
					    	tr.className = "aa_group_summary_line aa_group_summary_line_" + group.Id;
					    else
					    	tr.className = "aa_table_summary_line aa_table_summary_line_" + cntr.TableSummaryLines[line].Id;
					    if (group)
					    	tr.Group = group;
					    for (var i=0;i<ths.length;i++) {
					    	var fld = ths[i].Field;
				    		var td = document.createElement("TD");
				    		td.Field = fld;
						    td.className = "aa_table_summary_line_fld_" + fld.Id + " content";
				    		var txt = '';
				    		if (i == 0) 
				    			txt = cntr.TableSummaryLines[line].Title;
				    		else if (formula != "" && i>0) 
				    		{
					    		if (i > 0 && fld.IsNumber) 
					    		{
					    			var agg_func = window['aa_'+formula];
					    			if (agg_func)
					    				try {
					    					var items = group ? group.Items : cntr.FilteredWrappers;
					    					if (items)
					    						txt = agg_func(items,fld.Id);
					    				} catch(e) {}
					    		}
				    		}
				    		else {
				    			var items = group ? group.Items : cntr.FilteredWrappers;
				    			txt = aa_text(items,profile,'CustomFormula',aa_ctx(context,{_Field: [fld]}))
				    		}
				    		jQuery(td).html(txt);
				    		tr.appendChild(td);
					    }
					    list.appendChild(tr);
					}
				}
				cntr.RegisterForPostAction(this);
			}
			aspect.PostAction = function(data1,ctx) {
				var cntr = ctx.vars._Cntr[0];
				var list = ajaxart_find_aa_list(cntr);
				jQuery(list).find('>.aa_table_summary_line').remove();
				cntr.InjectSummaryLines(cntr,list);
			}
			return [aspect];
		},
		TreeDragAndDrop: function (profile,data,context)
		  {
			var aspect = { isObject : true };
			var initializeContainer = function(initData,ctx)
			{
				var cntr = ctx.vars._Cntr[0];
				var top_cntr = ajaxart_topCntr(jQuery(cntr.Ctrl));
				
				cntr.TreeDrag = function(e) {
					var cntr = ctx.vars._Cntr[0];
		  	    	var top_cntr = ajaxart_topCntr(jQuery(cntr.Ctrl));
		  	    	var top_cntr_list = ajaxart_find_aa_list(top_cntr);
					var mousepos = aa_mousePos(e);
					if (top_cntr.SuspectItemDrag != null)
					{
						var distance = Math.abs(mousepos.y - top_cntr.SuspectItemDrag.mousePos.y);
						if (distance < 5) return aa_stop_prop(e);
						var elem = top_cntr.SuspectItemDrag.elem;
						if (! elem.hasClass('aa_item'))
							elem = elem.parents('.aa_item').slice(0,1);
						var cntr_ctrl = elem.parents('.aa_container')[0];
						if (cntr_ctrl == null) return aa_stop_prop(e);

						cntr.TreeDragBegin(e);
						top_cntr.SuspectItemDrag = null;
					}
			
					if (top_cntr.draggedElem == null) return true;
					var table = top_cntr_list;
					var actualY = mousepos.y ;
					
					// keep drag in container boundaries
					
					var nearest = { distance: 1000};
					if (!top_cntr.SpaceElem.Positioned) // first time only. look for nearest place holder
					{
						// look for place holder near
						var holders = jQuery(top_cntr.Ctrl).find('.aa_move_place_holder').filter(function() {return jQuery(this).parents(':hidden').length == 0} );
						for(var i=0;i<holders.length;i++) {
							var distance = Math.abs(aa_absTop(holders[i]) - actualY);
							if (nearest.distance > distance) nearest = { distance: distance, holder: holders[i]};
						}
						if (nearest.holder) {
							nearest.holder.appendChild(top_cntr.SpaceElem);
							top_cntr.SpaceElem.Positioned = true;
						}
						else {
							ajaxart.log('Can not find nearest place holder');
							cntr.TreeDragEnd({},true);
							return;
						}
					}


					var holder = top_cntr.SpaceElem.parentNode;
					if (!holder) return;
					// calc next up & down
					var pre_holder = holder.PreHolder;
					while (jQuery(pre_holder).parents(':hidden').length > 0)
						pre_holder = pre_holder.PreHolder;
					var next_holder = holder.NextHolder;
					while (jQuery(next_holder).parents(':hidden').length > 0)
						next_holder = next_holder.NextHolder;

					// go up or down or stay in place
					var draggedElemTop = aa_absTop(top_cntr.draggedElem,false); 
					var draggedElemBottom = aa_absTop(top_cntr.draggedElem,false) + jQuery(top_cntr.draggedElem).height();
					
					if (pre_holder && aa_absTop(pre_holder,false) > draggedElemTop )
						pre_holder.appendChild(top_cntr.SpaceElem);
					if (next_holder && aa_absTop(next_holder,false) < draggedElemBottom )
						next_holder.appendChild(top_cntr.SpaceElem);
					
					top_cntr.draggedElem.style.top = actualY - aa_absTop(top_cntr_list,false) + 'px';
					var left = aa_absLeft(top_cntr.SpaceElem,false);
					if ( aa_is_rtl(top_cntr.Ctrl) )
						left = left + jQuery(top_cntr.SpaceElem).width() - jQuery(top_cntr.draggedElem).width();  
					top_cntr.draggedElem.style.left = left - aa_absLeft(top_cntr_list,false) + 'px';
					return aa_stop_prop(e);
				};
			 
				cntr.TreeDragEnd = function(e, cancel) {
					var cntr = ctx.vars._Cntr[0];
		  	    	var top_cntr = ajaxart_topCntr(jQuery(cntr.Ctrl));
		  	    	var top_cntr_list = ajaxart_find_aa_list(top_cntr);
		  	    	
		  	    	if (cancel)
		  	    	{
		  	    		jQuery(top_cntr.OriginalElem).show();
		  	    	}
		  	    	else
		  	    	{
						if (top_cntr.SpaceElem.parentNode)
							top_cntr.SpaceElem.parentNode.dragEnd(top_cntr.OriginalElem);
		  	    		aa_first([],profile, 'OnDrop', context);
		  	    		top_cntr.OriginalElem = null;
		  	    	}

					top_cntr_list.onmousemove = top_cntr.onmousemoveOrig;
					top_cntr_list.onmousedown = top_cntr.onmousedownOrig;
					top_cntr_list.onmouseup = top_cntr.onmouseupOrig;
				    top_cntr_list.style.position = top_cntr_list.PrevPosition;
					document.onmouseup = null;
					document.onkeydown = null;
					top_cntr.draggedElem = null;

					jQuery(document).find('.aa_move_place_holder').remove();
					jQuery(document).find('.aa_dragged_elem').remove();
					
				  	ajaxart_restoreSelection(document.body);
				  	top_cntr.DAndDOwner = "";
				  	aa_invoke_cntr_handlers(cntr,cntr.ContainerChange,[],ctx);
					return aa_stop_prop(e);
				};
		 
				cntr.TreeDragBegin = function(e,simulate) {
					var cntr = ctx.vars._Cntr[0];
		  	    	var top_cntr = ajaxart_topCntr(jQuery(cntr.Ctrl));
		  	    	var top_cntr_list = ajaxart_find_aa_list(top_cntr);

				    var elem = top_cntr.SuspectItemDrag.elem;
		  		    if (elem.hasClass("aa_item"))
		  		    	var item_elem = elem;
		  		    else
		  		    	var item_elem = elem.parents('.aa_item').slice(0,1);
		  		    
		  		    if (item_elem.length == 0) return aa_stop_prop(e);
					var posx = aa_absLeft(item_elem[0],false) - aa_absLeft(top_cntr_list,false);
					var posy = aa_absTop(item_elem[0],false) - aa_absTop(top_cntr_list,false);
					// do not drag root item, if there is one root
					var root = !item_elem.parent().hasClass('aa_treenode');
					if (root && item_elem.parent().children().length == 1)
						return aa_stop_prop(e);
		  		    
		  		    top_cntr.DAndDOwner = "TreeDragAndDrop";
				    ajaxart_disableSelection(document.body);
					var dragged_data_items = [aa_dataitems_of_elem(item_elem)];

					var fixHitArea = function(list,originalList)
					{
						var elem = jQuery(list).parents('.aa_item')[0];
						
						if (jQuery(list).find('>.aa_item').length > 0 && jQuery(elem).find('>.hitarea').length == 0 )
						{
							jQuery(elem).addClass('non_leaf');
							elem.collapsed = false;
							
							var hitarea = document.createElement('div');
							hitarea.className = "hitarea collapsable " + cntr.hitAreaCssClass;
							elem.insertBefore(hitarea,elem.firstChild);
						}
						if (originalList && jQuery(originalList).find('>.aa_item').length == 0)
							jQuery(originalList).parent().find('>.hitarea').remove();
					}

					var addPlaceHolders = function(list,at_elem,last_element)
					{
						var dropped_cntr = jQuery(list).hasClass('aa_container') ? list.Cntr : jQuery(list).parents('.aa_container')[0].Cntr;
						var dropped_items = aa_dataitems_of_elem(at_elem || list);
						var can_paste = ajaxart_runMethod(dragged_data_items,dropped_items,'CanPasteFromDataItems',ctx);
						if (can_paste.length == 0 || can_paste[0] != 'true') return;
						var place_holder = document.createElement('div');
						place_holder.className = 'aa_move_place_holder';

						if (last_element)
							cntr.insertNewElement(place_holder,list);
						else
							jQuery(place_holder).insertBefore(at_elem);

						place_holder.dragEnd = function(original)
						{
							var originalList = jQuery(original).parents('ul').slice(0,1)[0];
							var item_data = top_cntr.draggedElem.ItemData;
							var parentElem = jQuery(this).parents('.aa_item')[0];
							var cntr = jQuery(this).parents('.aa_container')[0].Cntr;
							var dropped_items = aa_dataitems_of_elem(this);
							if (last_element)
							{
								ajaxart_runMethod(item_data,dropped_items,'MoveToEnd',dropped_items.MoveToEnd.context);
							}
							else
							{
				  				var move_params = { isObject: true, Item: item_data, BeforeItem: at_elem.ItemData };
								ajaxart_runMethod([move_params],dropped_items,'MoveBefore',dropped_items.MoveBefore.context);
							}
							// fix UI
							//var new_element = ajaxart_uiaspects_addElement(item_data,cntr,parentElem);
							//if (!last_element)
							//	jQuery(this).replaceWith(new_element);
							jQuery(this).replaceWith(original);
							original.style.display = '';
							original.display = '';
							
							fixHitArea(list,originalList);
						}
					}
					
					var oElem = top_cntr.draggedElem = item_elem[0].cloneNode(true);
				    top_cntr.SpaceElem = item_elem[0].cloneNode(true);
				    top_cntr.OriginalElem = item_elem[0];
				    top_cntr.draggedElem.ItemData = top_cntr.SpaceElem.ItemData = item_elem[0].ItemData;
				    
				    top_cntr.OriginalElem.style.display = 'none';
				    top_cntr.OriginalElem.display = 'none';

					jQuery(top_cntr.draggedElem).addClass('aa_dragged_elem');
					jQuery(top_cntr.SpaceElem).addClass('aa_dragged_space_elem');
				    ajaxart_disableSelection(top_cntr.SpaceElem);
				    ajaxart_disableSelection(top_cntr.draggedElem);

				    var top_cntr_list = aa_find_list(top_cntr);
				    top_cntr_list.appendChild(top_cntr.draggedElem);
				    top_cntr_list.PrevPosition = top_cntr_list.style.position;
				    top_cntr_list.style.position = 'relative';	// locating relative to tree top to solve scrolling issues
					
					var all_items = jQuery(top_cntr.Ctrl).find('.aa_item');
					for(var i=0;i<all_items.length;i++)
					{
						var item = all_items[i];
						var jitem = jQuery(item);
						if (jitem.hasClass('aa_dragged_elem') || jitem.parents('.aa_dragged_elem').length > 0) continue;
						var list = jitem.parents('.aa_list')[0];
						if (list == null) continue;
						addPlaceHolders(list,item,false);
						if (jitem.next().length == 0)
							addPlaceHolders(list,item,true);
					}	
					// add to empty lists!
					var empty_lists = jQuery(top_cntr.Ctrl).find('.aa_list').filter(function() { 
						return jQuery(this).find('.aa_item').length == 0 && ! jQuery(this).hasClass('aa_dragged_space_elem') && jQuery(this).find('.aa_dragged_space_elem').length == 0 ;
					} );
					for(var i=0;i<empty_lists.length;i++)
						addPlaceHolders(empty_lists[i],null,true);
					
					// link place holders
					var holders = jQuery(top_cntr.Ctrl).find('.aa_move_place_holder');
					for(var i=0;i<holders.length;i++)
					{
						holders[i].PreHolder = i > 0 ? holders[i-1] : null;
						holders[i].NextHolder = i < holders.length-1 ? holders[i+1] : null;
					}
					top_cntr.draggedElemToMove = item_elem;
					top_cntr.draggedElemToMove.hide();
					var mousepos = top_cntr.SuspectItemDrag.mousePos;
					
					
					top_cntr.draggedElem.style.position = 'absolute';
					top_cntr.draggedElem.style.left = posx + 'px';
					top_cntr.draggedElem.style.top = posy + 'px';

					if (!simulate) // simulate
					{
						document.onmouseup = ctx.vars._Cntr[0].TreeDragEnd;
						top_cntr.onkeydownOrig = document.onkeydown; 
						document.onkeydown = function(e)
						{
							if (e.keyCode == 27) 
							ctx.vars._Cntr[0].TreeDragEnd(e,true);
							return true;
						}
					}
					
					return aa_stop_prop(e);
				};

				var suspectDrag = function(e) {
					var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  );
					if (elem.hasClass('hitarea')) return true;
					
					var cntr = ctx.vars._Cntr[0];
		  	    	var top_cntr = ajaxart_topCntr(jQuery(cntr.Ctrl));
		  	    	var top_cntr_list = ajaxart_find_aa_list(top_cntr);

		  	    	if (top_cntr.DAndDOwner != "") return true;
					var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  );  
					if (elem.parents('thead').length > 0) return true;
					top_cntr.SuspectItemDrag = { elem: elem, mousePos : aa_mousePos(e)};
					top_cntr.onmousemoveOrig = top_cntr_list.onmousemove;
					top_cntr.onmouseupOrig = top_cntr_list.onmouseup;
					top_cntr.onmousedownOrig = top_cntr_list.onmousedown;
					top_cntr_list.onmousemove = cntr.TreeDrag;
					return false;
				}

				var unSuspectDrag = function(e) {
					var cntr = ctx.vars._Cntr[0];
		  	    	var top_cntr = ajaxart_topCntr(jQuery(cntr.Ctrl));
		  	    	var top_cntr_list = ajaxart_find_aa_list(top_cntr);

					if (top_cntr.DAndDOwner != "") return true;
					if (top_cntr.SuspectItemDrag != null)
					{
						top_cntr.SuspectItemDrag = null;
						top_cntr_list.onmousemove = top_cntr.onmousemoveOrig;
						top_cntr_list.onmouseup = top_cntr.onmouseupOrig;
					}
					return true;
				}

				var cntr = ctx.vars._Cntr[0];
	  	    	var top_cntr = ajaxart_topCntr(jQuery(cntr.Ctrl)) || cntr;
	  	    	var top_cntr_list = ajaxart_find_aa_list(top_cntr);

	  	    	top_cntr.draggedElem = null;
	  	    	top_cntr.DAndDOwner = "";
				//ajaxart.ui.bindEvent(top_cntr_list,'mousedown',suspectDrag);
	  	    	top_cntr_list.onmousedown = suspectDrag;
				ajaxart.ui.bindEvent(top_cntr_list,'mouseup',unSuspectDrag);
			}
			ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
			return [aspect];
		  },
		  DragAndDropItems: function (profile,data,context)
		  {
			var aspect = { isObject : true };
			var initializeContainer = function(initData,ctx)
			{
				var cntr = ctx.vars._Cntr[0];
			    var list = aa_find_list(cntr);
				cntr.draggedElem = null;
				cntr.DAndDOwner = "";
				ajaxart.ui.bindEvent(list,'mousedown',suspectDrag);
				ajaxart.ui.bindEvent(list,'mouseup',unSuspectDrag);
				
				function depthFirstLists(elem) {
					var result = [];
					jQuery(elem).find('>*').each(function() { result = result.concat(depthFirstLists(this)); } );
					if (jQuery(elem).hasClass('aa_list')) result.push(elem);
					return result;
				}
				function allElems() {
					var result = [];
					var lists = depthFirstLists(cntr.Ctrl);
					for(var i=0;i<lists.length;i++) {
						var inner_cntr = jQuery(lists[i]).parents('.aa_container')[0].Cntr;
						if (inner_cntr.Items[0].CanPasteFromDataItems && inner_cntr.Items[0].CanPasteFromDataItems(cntr.Items)[0] == 'true')
							result = result.concat(jQuery(lists[i]).find('>.aa_item').get());
					}
					return result;
				}
				function drag(e) {
				    var list = aa_find_list(cntr);
					var mousepos = aa_mousePos(e);
					var mouseTop = mousepos.y - aa_absTop(list);
					var mouseLeft = mousepos.x - aa_absLeft(list);

					function inElem(elem,top,left) {
						return (elem.offsetTop < top && elem.offsetLeft < left && 
								elem.offsetTop + elem.offsetHeight > top && elem.offsetLeft + elem.offsetWidth > left); 
					}
					function elemAtPosition(top,left) {
						for(var i=0;i<cntr.elems4drag.length;i++)
							if (inElem(cntr.elems4drag[i],top,left)) return cntr.elems4drag[i];
					}
					function numbersBetween(num,num1,num2) {
						return ((num1 <= num && num <= num2) || (num2 <= num && num <= num1)); 
					}
					function elemsBetween(elem1,elem2) {
						for(var i=0;i<cntr.elems4drag.length;i++) {
							var elem = cntr.elems4drag[i];
							if (elem == elem1 || elem == elem2) return null;
							if (numbersBetween(elem.offsetTop,elem1.offsetTop,elem2.offsetTop) && numbersBetween(elem.offsetLeft,elem1.offsetLeft,elem2.offsetLeft)) {
								return elem;
							}
						}
					}
					if (cntr.SuspectItemDrag != null)
					{
						var distance = Math.abs(mousepos.y - cntr.SuspectItemDrag.mousePos.y) + Math.abs(mousepos.x - cntr.SuspectItemDrag.mousePos.x);
						if (distance < 5) return aa_stop_prop(e);
						cntr.elems4drag = cntr.elems4drag || allElems();
						var elemAtMousePos = elemAtPosition(mouseTop,mouseLeft);
						if (! elemAtMousePos)
							unSuspectDrag();
						else
							dragBegin(elemAtMousePos,e);
						cntr.SuspectItemDrag = null;
						return true;
					}
					if (cntr.draggedElem == null) return true;
					var elemAtMousePos = elemAtPosition(mouseTop,mouseLeft);

					// move dragged elem
					var draggedElem = cntr.draggedElem;
					draggedElem.style.top = (mouseTop - draggedElem.initialMouseOffset.top)  + 'px'; 
					draggedElem.style.left = (mouseLeft - draggedElem.initialMouseOffset.left)  + 'px';
					if (elemAtMousePos == cntr.spaceElem) return aa_stop_prop(e);

					// element nearest to space elem
					var candidate = elemAtMousePos;
					if (!candidate) return aa_stop_prop(e); // can be fixed so the external elem will be the candidate
					while (true) {
						var closer_element = elemsBetween(candidate,cntr.spaceElem);
						if (!closer_element) break;
						candidate = closer_element;
					}

					var margin = 3;
					if (candidate.offsetLeft <= cntr.spaceElem.offsetLeft && candidate.offsetLeft + margin > cntr.draggedElem.offsetLeft) // left to us - insert before
						list.insertBefore(cntr.spaceElem,candidate);
					else if (candidate.offsetLeft >= cntr.spaceElem.offsetLeft && candidate.offsetLeft + candidate.offsetWidth - margin > cntr.draggedElem.offsetLeft && candidate.nextSibling) // right to us - insert after 
						list.insertBefore(cntr.spaceElem,candidate.nextSibling);

					return aa_stop_prop(e);
				}
				function dragEnd(e,cancel) {
				    var list = aa_find_list(cntr);
					list.removeChild(cntr.draggedElem);
					if (! cancel)
						jQuery(cntr.spaceElem).replaceWith(cntr.OriginalElem);
					else
						list.removeChild(cntr.spaceElem);
					cntr.OriginalElem.style.display = '';
					cntr.OriginalElem.display = '';
					

					list.onmousemove = cntr.onmousemoveOrig;
					list.style.position = cntr.listOriginalPosition;
					document.onkeydown = cntr.onkeydownOrig;
					document.onmouseup = null;
					cntr.draggedElem = null;
					cntr.elems4drag = null;
					
					if (jQuery(cntr.OriginalElem).nextAll('.aa_item').length == 0)
						ajaxart_runMethod(cntr.OriginalElem.ItemData,cntr.Items[0],'MoveToEnd',cntr.Items[0].MoveToEnd.context);
					else
					{
		  				var move_params = { isObject: true, 
		  						Item: cntr.OriginalElem.ItemData, 
		  						BeforeItem: jQuery(cntr.OriginalElem).nextAll('.aa_item')[0].ItemData 
		  				}
		  				ajaxart_runMethod([move_params],cntr.Items[0],'MoveBefore',cntr.Items[0].MoveBefore.context);
					}
				  	aa_first([cntr],profile, 'OnDrop', ctx);
				  	aa_invoke_cntr_handlers(cntr,cntr.ContainerChange,[],ctx);
				  	
		  		    cntr.DAndDOwner = "";
					return aa_stop_prop(e);
				}
				function dragBegin(item_elem,e) {
				    var list = jQuery(item_elem).parents('.aa_list')[0];
		  		    //if (!cntr.Items[0].MoveBefore) return aa_stop_prop(e);
		  		    cntr.DAndDOwner = "DragAndDropItems";
				    var posx = aa_absLeft(item_elem);
					var posy = aa_absTop(item_elem);

					cntr.draggedElem = item_elem.cloneNode(true);
					cntr.OriginalElem = item_elem;
					list.appendChild(cntr.draggedElem);
					cntr.spaceElem = item_elem.cloneNode(true);
					list.insertBefore(cntr.spaceElem,cntr.OriginalElem);
					
					cntr.draggedElem.ItemData = cntr.spaceElem.ItemData = item_elem.ItemData;
					cntr.OriginalElem.style.display = 'none';
					cntr.OriginalElem.display = 'none';

					jQuery(cntr.draggedElem).addClass('aa_dragged_elem1');
					jQuery(cntr.spaceElem).addClass('aa_dragged_space_elem1');
					
					cntr.draggedElem.style.position = 'absolute';
					
					var mousepos = cntr.SuspectItemDrag.mousePos;
					cntr.draggedElem.initialMouseOffset = { top: mousepos.y - posy, left: mousepos.x - posx } ;
					cntr.draggedElem.style.left = posx + 'px';
					cntr.draggedElem.style.top = posy + 'px';

					document.onmouseup = dragEnd;
					cntr.onkeydownOrig = document.onkeydown; 
					document.onkeydown = function(e)
					{
						if (e.keyCode == 27) 
							dragEnd(e,true);
						return true;
					}
					
					return aa_stop_prop(e);
				}

				function suspectDrag(e) {
				    var list = aa_find_list(cntr);
					if (cntr.DAndDOwner != "") return true;
					cntr.listOriginalPosition = list.style.position;
					list.style.position = 'relative';
				    ajaxart_disableSelection(cntr.Ctrl);
					
					cntr.SuspectItemDrag = { mousePos : aa_mousePos(e), time: new Date().getTime()};
					cntr.onmousemoveOrig = list.onmousemove;
					list.onmousemove = drag;
					return true;
				}

				function unSuspectDrag(e) {
				    var list = aa_find_list(cntr);
					if (cntr.DAndDOwner != "") return true;
				  	ajaxart_restoreSelection(cntr.Ctrl);
					if (cntr.SuspectItemDrag != null)
					{
						cntr.SuspectItemDrag = null;
						list.onmousemove = cntr.onmousemoveOrig;
						list.style.position = cntr.listOriginalPosition;
					}
					return true;
				}
			}
			ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
			return [aspect];
		  },
		  DragAndDropMover: function (profile,data,context)
		  {
			var aspect = { isObject : true };
			var initializeContainer = function(initData,ctx)
			{
				var cntr = ctx.vars._Cntr[0];
				cntr.draggedElem = null;
				cntr.DAndDOwner = "";
				
				var _drag = function(e) {
					var cntr = ctx.vars._Cntr[0];
					var mousepos = aa_mousePos(e);
					if (cntr.SuspectItemDrag != null)
					{
						var distance = Math.abs(mousepos.y - cntr.SuspectItemDrag.mousePos.y);
						if (distance < 5) return aa_stop_prop(e);
						if (new Date().getTime() - cntr.SuspectItemDrag.time > 1000) // if old drag suspension cancel it
							unSuspectDrag();
						else
							_dragBegin(e);
						cntr.SuspectItemDrag = null;
					}
					var oElem = cntr.draggedElem;
			
					if (oElem == null) return true;
					var table = aa_find_list(cntr);
					var actualY = mousepos.y - oElem.mouseY;
					var table_top = aa_absTop(table,false);
					var table_bottom = aa_absTop(table,false) + jQuery(table).height();
					if ( actualY < table_top  || actualY > table_bottom ) 
						return true;
					
					oElem.style.top = actualY + 'px'; 
			 
					var spaceTop = aa_absTop(cntr.spaceElem,false);
					if (mousepos.y - spaceTop  < 3)
						if (cntr.spaceElem.previousSibling != null)
							cntr.draggedParent.insertBefore(cntr.spaceElem,cntr.spaceElem.previousSibling);
					if ((spaceTop + cntr.spaceElem.offsetHeight) - mousepos.y < -5)
						if (cntr.spaceElem.nextSibling.nextSibling != null)
							cntr.draggedParent.insertBefore(cntr.spaceElem,cntr.spaceElem.nextSibling.nextSibling);

					return aa_stop_prop(e);
				};

				var _dragEnd = function(e,cancel) {
					var cntr = ctx.vars._Cntr[0];
					cntr.draggedParent.removeChild(cntr.draggedElem);
					if (! cancel)
						jQuery(cntr.spaceElem).replaceWith(cntr.OriginalElem);
					else
						cntr.draggedParent.removeChild(cntr.spaceElem);
					cntr.OriginalElem.style.display = '';
					cntr.OriginalElem.display = '';

					cntr.Ctrl.onmousemove = cntr.onmousemoveOrig;
					document.onkeydown = cntr.onkeydownOrig;
					document.onmouseup = null;
					cntr.draggedElem = null;
					
					if (jQuery(cntr.OriginalElem).nextAll('.aa_item').length == 0)
						ajaxart_runMethod(cntr.OriginalElem.ItemData,cntr.Items[0],'MoveToEnd',cntr.Items[0].MoveToEnd.context);
					else
					{
		  				var move_params = { isObject : true };
		  				move_params.Item = cntr.OriginalElem.ItemData;
		  				move_params.BeforeItem = jQuery(cntr.OriginalElem).nextAll('.aa_item')[0].ItemData;
		  				
		  				ajaxart_runMethod([move_params],cntr.Items[0],'MoveBefore',cntr.Items[0].MoveBefore.context);
					}
				  	aa_first([cntr],profile, 'OnDrop', ctx);
				  	aa_invoke_cntr_handlers(cntr,cntr.ContainerChange,[],ctx);
				  	
				  	ajaxart_restoreSelection(cntr.Ctrl);
		  		    cntr.DAndDOwner = "";

					return aa_stop_prop(e);
				};
		 
				var _dragBegin = function(e) {
					var cntr = ctx.vars._Cntr[0];
				    var elem = cntr.SuspectItemDrag.elem;
		  		    if (elem.hasClass("aa_item"))
		  		    	var item_elem = elem;
		  		    else
		  		    	var item_elem = elem.parents('.aa_item').slice(0,1);
		  		    if (item_elem.length == 0) return aa_stop_prop(e);
					
		  		    if (cntr.ReadOnly || !cntr.Items[0].MoveBefore) return aa_stop_prop(e);
		  		    
		  		    cntr.DAndDOwner = "DragAndDropMover";

				    ajaxart_disableSelection(cntr.Ctrl);

				    var top_cntr_list = aa_find_list(cntr);
				    var posx = aa_absLeft(item_elem[0],false);
					var posy = aa_absTop(item_elem[0],false);

					cntr.draggedElem = item_elem[0].cloneNode(true);
					cntr.OriginalElem = item_elem[0];
					cntr.draggedParent = item_elem[0].parentNode; 
					cntr.draggedParent.appendChild(cntr.draggedElem);
					cntr.spaceElem = item_elem[0].cloneNode(true);
					cntr.draggedParent.insertBefore(cntr.spaceElem,cntr.OriginalElem);
					
					cntr.draggedElem.ItemData = cntr.spaceElem.ItemData = item_elem[0].ItemData;
					cntr.OriginalElem.style.display = 'none';
					cntr.OriginalElem.display = 'none';

					jQuery(cntr.draggedElem).addClass('aa_dragged_elem');
					jQuery(cntr.spaceElem).addClass('aa_dragged_space_elem');
					
					var mousepos = cntr.SuspectItemDrag.mousePos;
					
					var tds = jQuery(cntr.draggedElem).find('td');
					for(var i=0;i<tds.length;i++)
						jQuery(tds[i]).width(jQuery(tds[i]).width());

					cntr.draggedElem.style.position = 'absolute';
					if (jQuery(cntr.Ctrl).parents('.aa_dlg').length > 0)
						cntr.draggedElem.style.position = 'fixed';
					
					cntr.draggedElem.style.left = posx + 'px';
					cntr.draggedElem.style.top = posy + 'px';
					cntr.draggedElem.mouseY = mousepos.y - posy;

					document.onmouseup = _dragEnd;
					cntr.onkeydownOrig = document.onkeydown; 
					document.onkeydown = function(e)
					{
						if (e.keyCode == 27) 
							_dragEnd(e,true);
						return true;
					}
					
					return aa_stop_prop(e);
				};

				var suspectDrag = function(e) {
					var cntr = ctx.vars._Cntr[0];
					if (cntr.DAndDOwner != "") return true;
					var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  );  
					if (elem.parents('thead').length > 0) return true;
					// ensure (1) it is an elem (2) not elem of inner cntr
					if (elem.hasClass('aa_item')) 
						var inner_cntr = elem.parents('.aa_container')[0];
					else
						var inner_cntr = elem.parents('.aa_item').parents('.aa_container')[0];
					if (inner_cntr == null || inner_cntr.Cntr != cntr) return true;
					var table = aa_find_list(cntr);
					// no inplace item-details allowed
					if ( jQuery(table).find('>.detailsInplace_tr').length > 0) return;
					
					cntr.SuspectItemDrag = { elem: elem, mousePos : aa_mousePos(e), time: new Date().getTime()};
					cntr.onmousemoveOrig = cntr.Ctrl.onmousemove;
					cntr.Ctrl.onmousemove = _drag;
					return true;
				}

				var unSuspectDrag = function(e) {
					var cntr = ctx.vars._Cntr[0];
					if (cntr.DAndDOwner != "") return true;
					if (cntr.SuspectItemDrag != null)
					{
						cntr.SuspectItemDrag = null;
						cntr.Ctrl.onmousemove = cntr.onmousemoveOrig;
					}
					return true;
				}

				cntr.DAndDOwner = "";
				ajaxart.ui.bindEvent(cntr.Ctrl,'mousedown',suspectDrag);
				ajaxart.ui.bindEvent(cntr.Ctrl,'mouseup',unSuspectDrag);
			}
			ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
			return [aspect];
		  }
});
//AA BeginModule
aa_gcs("cntr", {
	SelectedItem: function(profile, data, context)
	{
	  var cntr = aa_first(data,profile,'Cntr',context);
	  if (cntr && cntr.Ctrl) {
		  var item = jQuery(cntr.Ctrl).find('.aa_selected_item')[0];
		  if (item && item.ItemData) return item.ItemData; 
	  }
	},
	ItemDataFromElement: function(profile, data, context)
	{
		var elem = aa_first(data,profile,'Element',context);
		if (elem && elem.ItemData) return elem.ItemData;
	},
	RefreshSelectedTextAndImage: function(profile, data, context)
	{
		var cntr = aa_first(data,profile,'Cntr',context);
		var elem = cntr && jQuery(cntr.Ctrl).find(".aa_selected_item")[0];
		if (cntr && elem)
		  aa_invoke_cntr_handlers(cntr,cntr.RefreshItemTextAndImage,[elem],cntr.Context);
	},
	ParentItemElement: function(profile, data, context) 
	{
		var items = jQuery(context.vars.ControlElement).parents('.aa_item');
		if (items.length > 0) return [items[0]];
	}
});
//AA EndModule

//AA BeginModule
aa_gcs("uiaction", {
	FireEvent: function(profile, data, context) {
		var event = aa_text(data,profile,'Event',context);
		var elements = ajaxart.getControlElement(context);
		for (var i=0;i<elements.length;i++) {
			if (i==1 && aa_bool(data,profile,'ForOnlyOneElement',context)) return ['true'];
			
			var item = elements[i];
			var props = {};
			var propButton = aa_text(data,profile,'MouseButton',context);
			var keyCode = aa_text(data,profile,'KeyCode',context);
			if (propButton == "right") { props.button = 2; };
			if (keyCode != "") { props.keyCode = keyCode; };
			aa_fire_event(item,event,context,props);
		}
		return ["true"];
	},
	ButtonClick: function(profile, data, context) 
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
	SimulateTreeDragBegin: function(profile, data, context) {
		var elem = ajaxart.getControlElement(context)[0];
		if (!elem) return;
		var cntr_ctrl = jQuery(elem).parents('.aa_container')[0];
		if (cntr_ctrl && cntr_ctrl.Cntr.TreeDragBegin)
		{
			var cntr = cntr_ctrl.Cntr;
			cntr.SuspectItemDrag = {elem: jQuery(elem), mousePos: {x:0,y:0}}
			cntr.TreeDragBegin(null,true);
		}
	},
	SimulateTreeDragEnd: function(profile, data, context) {
		var elem = ajaxart.getControlElement(context)[0];
		if (!elem) return;
		var cntr_ctrl = jQuery(elem).parents('.aa_container')[0];
		if (cntr_ctrl && cntr_ctrl.Cntr.TreeDragEnd)
		{
			var cntr = cntr_ctrl.Cntr;
			elem.appendChild( cntr.SpaceElem );
			cntr.TreeDragEnd(null,false,true);
		}
	},
	SimulateTreeDrop: function(profile, data, context) {
		var elements = ajaxart.getControlElement(context);
		return elements;
	},
	ControlElementToRunOn: function(profile, data, context) {
		var elements = ajaxart.getControlElement(context);
		return elements;
	},
	Refresh: function(profile, data, context) 
	{
		var elements = ajaxart.getControlElement(context);
		for(var i=0;i<elements.length;i++)
		{
			var newControl = jBart.utils.refresh(elements[i]);
		
			ajaxart.run(data,profile,'RunOnControl',aa_ctx(context,{ControlElement: [newControl]}));
		}
		return ["true"];
	},
	SortContainer: function(profile, data, context)
	{
		var cntr_field_id = aa_text(data,profile,'Cntr',context),cntr=null;
		var sortBy = aa_text(data,profile,'SortBy',context);
		var sortDirection = aa_text(data,profile,'SortDirection',context);
		
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
		cntr.DataHolder.UserDataView.Sort = [ { SortBy: sortBy, SortDirection: sortDirection} ];
		aa_recalc_filters_and_refresh(cntr,data);
	},
	FilterContainer: function(profile, data, context)
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
	UpdateBrowserTitle: function(profile, data, context)
	{
		var title = aa_text(data,profile,'Title',context);
		document.title = title;
		return ["true"];
	},
	Hide: function(profile, data, context) 
	{
		var elem = ajaxart.getControlElement(context)[0];
		if (ajaxart.ishtml(elem))
		{
			elem.display = 'none';
			elem.style.display = 'none';
		}
		return ["true"];
	},
	SetBrowserIcon: function(profile, data, context)
	{
		var icon = aa_text(data,profile,'Icon',context);
		if (icon == "") return [];
		var link = jQuery('<link rel="shortcut icon" href="'+icon+'" type="image/x-icon">');
		jQuery('head').append( link ) ; 
		
		return [];
	},
	FindFirstInput: function(profile, data, context)
	{
		var elements = ajaxart.getControlElement(context);
		if (elements.length == 0) return [];
		var inp = jQuery(elements[0]).find('input, textarea, .ok_button');
		if (inp.length > 0) return [ inp[0] ];
		return [];
	},
	Show: function(profile, data, context) 
	{
		var elements = ajaxart.getControlElement(context);
		
		for(var i=0;i<elements.length;i++) 
		  elements[i].style.display = 'block';
		return [];
	},
	ReplaceContents: function(profile, data, params)
	{
		var elements = ajaxart.getControlElement(params);
		var newContents = ajaxart.run(data,profile,'NewContents',params);
		if (elements.length == 0) return [];
		if (newContents.length == 0)
			newContents = [ document.createElement('div') ];
		
		var oldControl = elements[0].firstChild;
		ajaxart.xml.setAsOnlyChildElem(elements[0],newContents[0]);
		aa_element_attached(newContents[0]);
		aa_element_detached(oldControl);
		
		return [];
	},
	RunEvent: function(profile, data, context)
	{
		var elements = ajaxart.getControlElement(context);
		var varname = aa_text(data,profile,'VarName',context);
		var action = aa_text(data,profile,'Action',context);
		
		for(i in elements)
			ajaxart_runevent(elements[i],varname,action);
		
		return ["true"];
	},
	SelectedInCombo: function(profile, data, context)
	{
		var elements = ajaxart.getControlElement(context);
		if (elements.length == 0) return [];
		var combo = elements[0];
		if ('value' in combo)
			return [combo.value];
//		if ('selectedIndex' in combo)
//			return [ combo.options[combo.selectedIndex].value ];
		
		return [];
	},
	SetComboOptionValue: function(profile, data, context)
	{
		var inputForChanges = ajaxart.getVariable(context,"InputForChanges");
		var elements = ajaxart.getControlElement(context);
		if (elements.length == 0) return [];
		var value = aa_text(inputForChanges,profile,'Value',context);
		var option = elements[0];
		if ('value' in option)
		{
			option.value = value;
			option.text = value;
		}
		
		return data;
	},
	Alert: function(profile, data, context)
	{
		var text = aa_text(data,profile,'Text',context);
		alert(text);
	},
	SetInnerTextOfData : function(profile, data, context) 
	{
		var txt = ajaxart.getVariable(context,"InputForChanges");
		jQuery(data[0]).find('.aacheckbox_text').text(txt[0]);
	},
	ElementByID: function(profile, data, params)
	{
		var startFrom = ajaxart.run(data,profile,'StartFrom',params);
	    var ID = aa_text(data,profile,'ID',params);
	    
	    var newparams = ajaxart.calcParamsForRunOn(params,ID,startFrom);
	    return ajaxart.getControlElement(newparams);
	},
	ElementByClass: function(profile, data, params)
	{
		var startFrom = aa_first(data,profile,'StartFrom',params);
	    var cls = aa_text(data,profile,'Cls',params);
	    if (startFrom == null || startFrom.length == 0) return [];
	    var jresult = jQuery(startFrom).find('.'+cls);
	    var out = [];
	    for (var i=0; i<jresult.length; i++)
	    	out.push(jresult[i]);
	    return out;
	},
	GoUp: function(profile, data, params)
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
	},
 	RefreshItemElements: function (profile,data,context)
 	{
		var elems = ajaxart.run(data,profile,'ItemElements',context);
		ajaxart_uiaspects_refreshElements(elems);
	    
	    return ["true"];
 	},
 	SelectedItemElement: function (profile,data,context)
 	{
		var elem = ajaxart.getControlElement(context);
		if (elem.length == 0) return [];
		
		var selected = jQuery(elem[0]).find('.aa_selected_item');
		if (selected.length == 0) return [];
	    return [selected[0]];
 	},
	DeleteItemElements: function (profile,data,context)
	{
		var elems = ajaxart.run(data,profile,'ItemElements',context);
		for(var i in elems)
	  	{
			var elem = elems[i];
			if (jQuery(elem).hasClass('aa_selected_item'))
  			{
		  		 var newSel = elem.nextSibling;
		  		 if (newSel == null) newSel = elem.previousSibling; 
		  		 if (newSel == null) {
		  			 var parents = jQuery(elem).parents('.aa_item');
		  			 if (parents.length > 0) newSel = parents[0];
		  		 }
		  		 if (newSel != null)
	  	  	     {
		  			ajaxart_uiaspects_select(jQuery(newSel),jQuery(elem),"auto",context,true);
	  	  	     }
	  		 }
  			 elem.parentNode.removeChild(elem);
	  	}
	  	return ["true"];
	},
	AddItemElement: function (profile,data,context)
	{
		var item_data = ajaxart.run(data,profile,'Item',context);
		var parent_elem = aa_first(data,profile,'ParentElement',context);
		var cntr = ajaxart_uiaspects_container(context);
		var new_elem = ajaxart_uiaspects_addElement(item_data,cntr,parent_elem);
	    
		if (aa_bool(data,profile,'SelectIt',context))
			ajaxart_uiaspects_select(jQuery(new_elem),jQuery([]),"auto",context,true);
		
		ajaxart.run([new_elem],profile,'DoOnAddedElement',aa_ctx(context,{ControlElement: [new_elem]}));
	    return ["true"];
	},
	ExpandText: function (profile,data,context)
	{
		var elem = aa_first(data,profile,'ItemElement',context);
		var tds = jQuery(elem).find('>.aa_cell_element');
		for(var i=0;i<tds.length;i++)
			if (tds[i].expandableText)
				tds[i].expandableText.Build(tds[i].expandableText.States['control']);
	},
	CheckAll: function (profile,data,context)
	{
		var select = aa_bool(data,profile,'Select',context);
		var cntr = ajaxart_uiaspects_container(context);

		var elems = jQuery(cntr.Ctrl).find('.aa_item');
		for(var i=0;i<elems.length;i++)
		{
			var elem = jQuery(elems[i]);
		    var checkbox = elem.find('>.aacheckbox_value');
        	if (checkbox.length > 0 && ! elems[i].hidden && checkbox[0].checked != select )
        	{
        		if (checkbox[0].checked != select)
     			    cntr.ToogleCheckbox(cntr.Context,elem);
        		aa_checked(checkbox[0], select);
        	}
		}

	    return ["true"];
	},
	HasClass: function(profile, data, context)
	{
		var cls = aa_text(data,profile,'Cls',context);
		var elems = ajaxart.getControlElement(context);
		if (elems.length == 0) return [];
		if ( jQuery(elems[0]).hasClass(cls) ) return ["true"];
		return [];
	},	
	ReplaceControl: function(profile, data, params)
	{
		var newControl = ajaxart.run(data,profile,'NewControl',params);
		var origControl = ajaxart.getControlElement(params);
		
		if (origControl.length == 0) return [];
		if (newControl.length == 0)
			newControl = [ document.createElement('div') ];
		
		if (origControl[0].id.length > 0 && newControl[0].id.length == 0)
			newControl[0].id = origControl[0].id; 

		ajaxart.replaceXmlElement(origControl[0],newControl[0],true);
		
		return data;
	},
	Select: function(profile, data, context)
	{
		var jItems = jQuery(context.vars.ControlElement).find('.aa_item');
		for(var i=0;i<jItems.length;i++)
			if (jItems[i].ItemData && aa_bool(jItems[i].ItemData,profile,'FilterOnItem',context)) {
				ajaxart.runNativeHelper(jItems[i].ItemData,profile,'Click',aa_ctx(context,{ControlElement:[jItems[i]]}));
				return [];
			}
		
		return [];
	},
	MobileScrollToElement: function(profile, data, context)
	{
		var elem = aa_first(data,profile,'Element',context);
		var iter = elem;
		while (iter && iter.nodeType == 1)
		{
			if (iter.IScroll) {
				iter.IScroll.scrollToElement(elem,400);
				return;
			}
			iter = iter.parentNode;
		}
	},
	ItemElementByFilter: function(profile, data, context)
	{
		var jItems = jQuery(context.vars.ControlElement).find('.aa_item');
		for(var i=0;i<jItems.length;i++)
			if (aa_bool(jItems[i].ItemData,profile,'FilterOnItem',context)) 
				return [jItems[i]];
	},
	ElementByInnerFilter: function(profile, data, params)
	{
	    var elements = ajaxart.run(data,profile,'TopElement',params);
	    if (! ajaxart.ishtml(elements)) return [];
		var out = [];
		
		function _recursive_iteration(elem)
		{
			if (elem.nodeType != 1) return;
			
			if (elem.ajaxart)
				var itemdata = elem.ajaxart.data;
			else
				var itemdata = elem.ItemData;
			
			if (itemdata != null && aa_bool(itemdata,profile,'Filter',params))
				out.push(elem);
			
			var node = elem.firstChild;
			while (node != null)
			{
				if (node.nodeType == 1)
					_recursive_iteration(node);
				node=node.nextSibling;
			}
		}

		for(var i=0;i<elements.length;i++)
			_recursive_iteration(elements[i]);
		
		return out;
	},
	Focus: function(profile, data, context)
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
   MoveSelection : function(profile, data, params)
   {
  	 var direction = aa_text(data,profile,'Direction',params);
  	 var controls = ajaxart.getControlElement(params);
  	 if (controls.length == 0) return [];
  	 
  	 var selected = jQuery(controls[0]).find(".selected");
  	 var newSelected = [];
  	 switch (direction) {
  	 case 'One Up' 	: newSelected = selected.prev();break;
  	 case 'One Down': newSelected = selected.next();break;
  	 default : ajaxart.log("MoveSelection - no valid direction:" + direction);
  	 }
  	 if (newSelected.length > 0) {
  		 selected.removeClass("selected");
  		 newSelected.addClass("selected");
  		 
  		 ajaxart_selectionchanged(newSelected[0]);
  		 var context = controls[0]["ajaxart"];
  		 ajaxart.run( newSelected[0]["ajaxart"].data, context.script,'OnSelect', context.params );
//  		 ajaxart.run(nextData,aggProfile,'',context)
//  		 ajaxart_runevent( newSelected[0]["ajaxart"].data ,context,'OnSelect');
  	 }
   },
   RefreshAllItemsInItemList: function(profile, data, context)
   {
	   var cntr = context.vars._Cntr[0];
	   aa_recalc_filters_and_refresh(cntr,data,context);  
   },
   DataItemsOfItemInTree: function(profile, data, context)
   {
	  var elem = aa_first(data,profile,'ItemElement',context);
	  if (!elem || !elem.ItemData) return [];
	  elem = jQuery(elem).find('.aa_treenode')[0];
	  if (elem && elem._Items) return [elem._Items];
   },
   RefreshAfterSelectedDeleted: function(profile, data, context)
   {
  	 var controls = ajaxart.getControlElement(context);
  	 var selected = jQuery(controls).find('.selected');
  	 if (selected.length ==1)
  	 {
  		 var elem = selected[0];
  		 var newSel = elem.nextSibling;
  		 if (newSel == null) newSel = elem.previousSibling; 
  		 elem.parentNode.removeChild(elem);
  		 if (newSel != null) {
  			 jQuery(newSel).addClass('selected');
  			 aa_xFireEvent(newSel, 'click', null);
  		 }
  	 }
  	 return ["true"];
   },
   MouseRightClick: function(profile, data, context)
   {
     var elems = ajaxart.getControlElement(context);
     for(var i=0;i<elems.length;i++)
     {
       
     }
   },
   SetEnabling : function(profile, data, context)
   {
  	 var enable = aa_bool(data,profile,'Enable',context);
  	 var control = ajaxart.getControlElement(context);
  	 if (control.length == 0) return [];
  	 if (enable)
  		 control[0].removeAttribute("disabled");
     else
    	 control[0].setAttribute("disabled", "true");
   },
   GoToUrl: function(profile, data, context)
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
   JQueryFind: function(profile, data, context)
   {
	   var exp = aa_text(data,profile,'Expression',context);
	   var all = aa_bool(data,profile,'All',context);
	   var logOnEmptyResult = aa_bool(data,profile,'LogOnEmptyResult',context);
	   var runOnData = aa_bool(data,profile,'RunOnData',context);
	   var runOnScreen = aa_bool(data,profile,'RunOnScreen',context); 
	   var control = null;
	   if (!runOnData)
		   control = ajaxart.getControlElement(context,true);
	   else if (data.length > 0)
	  	 control = data[0];
	   if (control == null)
		   return [];
	   try {
	  	 var result = [];
	  	 if (runOnScreen) eval('result = jQuery("' + exp + '")');
	  	 else if (exp.length > 0 && exp.charAt(0) == '.' && exp.indexOf('(') != -1)
	  		 eval('result = jQuery(control)' + exp);
	  	 else
	  		 result = jQuery(control).find(exp);
		   if (result.length > 0 ) {
			   if (!all) return [ result[0] ];
			   var arr = [];
			   for(i=0;i<result.length;i++) arr.push(result[i]);
			   return arr;
		   }
		   else if (logOnEmptyResult) { ajaxart.log("JQueryFind - found nothing, expression :" + exp,"warning"); }
	   } catch(e) { ajaxart.log("JQueryFind failed, expression :" + exp,"error"); }
	   return [];
   },
   StretchToBottom: function(profile, data, context)
   {
	   if (! ajaxart.ishtml(data)) return [];
	   var element = data[0];
	   jQuery(element).css('overflow','auto');
	   var deltaHeight = aa_int(data,profile,'HeightDelta',context);
	   var deltaWidth = aa_int(data,profile,'WidthDelta',context);
	   var fix = function()
	   {
		   ajaxart.ui.HeightToWindowBottom(element,deltaHeight);
	   }
	   jQuery(window).bind('resize', function() {
	      setTimeout(fix,100);
       });

	   setTimeout(fix,100);
	   
	   return ["true"];
   },
   RegisterOnPageClose: function(profile, data, context)
   {
	   window.onbeforeunload = function() { 
		   if (window.preventOnBeforeUnload) return;   // because of an ugly tinymce bug in a specific IE8 version
		   var cond = aa_bool(data,profile,'ShowMessageIf',context);
		   var message = aa_multilang_text(data,profile,'Message',context); 
		   if (cond) return message; 
	   }
	   return ["true"];
   },
   MakeCssInline : function(profile, data, context)
   {
	   	var control = aa_first(data,profile,'Control',context);
	   	var replacers_xml = aa_first(data,profile,'CssReplacer',context);
	   	var all_replacers = [];
	   	
		var replacers = ajaxart.xml.xpath(replacers_xml,"*",false);
		 
	    for(var i=0; i<replacers.length; i++) {
	    	var cond = replacers[i].getAttribute("Condition");
	    	var style = replacers[i].getAttribute("Css");
	    	var found = jQuery(control).find("" + cond);
	    	for (var j=0; j<found.length; j++)
	    		found[j].style.cssText = style;
	    }
	    return [control];
   },
   HideMessageBarOnUserClick: function(profile, data, context)
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
   RefreshAfterDataItemsChanged: function(profile, data, context)
   {
	   return aa_refreshAfterDataItemsChanged(context);
   },
   DownloadFile: function(profile, data, context)
   {
	   var iframe = document.createElement("IFRAME");
	   iframe.style.width = "0px";
	   iframe.style.height = "0px";
	   iframe.setAttribute("frameborder","0");
	   iframe.src = aa_text(data,profile,'Url',context);
	   jQuery(iframe).appendTo("body");
	   return [];
   },
   BindHashChangeEvent: function(profile, data, context)
   {
	   ajaxart.hash_change_func = function() { ajaxart.run(data,profile,'Action',context); }
	   ajaxart.hash_change_by_js_count = 0;
	   window.onhashchange = function ()
	   {
			// we use counter to make sure that event is not coming from js code
			if (ajaxart.hash_change_by_js_count > 0) {
				ajaxart.hash_change_by_js_count--;
				return;
			}
			if (ajaxart.hash_change_func != null)
				ajaxart.hash_change_func();
		};
	   return [];
   },
   SetTextSelection: function(profile, data, context)
   {
	   var input = ajaxart.getControlElement(context,true);
	   var start = aa_int(data,profile,'SelectionStart',context);
	   var end = aa_int(data,profile,'SelectionEnd',context);
	   if (input == null) return [];

	   aa_defineElemProperties(input,'selectionStart,selectionEnd');
	   input.focus();
	   setTimeout(function() {
	       if (input.selectionStart === undefined) {   // Internet Explorer
	           var inputRange = input.createTextRange ();
	           inputRange.moveStart ("character", start);
	           inputRange.collapse ();
	    	   if (! isNaN(end))
	    		   inputRange.moveEnd ("character", end-start);
	    	   else
	    		   inputRange.moveEnd ("character", input.value.length-start);
	           inputRange.select ();
	       }
	       else {      // Firefox, Opera, Google Chrome and Safari
		    	   if (! isNaN(start))
		    		   input.selectionStart = start;
		    	   if (! isNaN(end))
		    		   input.selectionEnd = end;
	       }
	   },100);
       return [];
   },
   RunActions: function(profile, data, context)
   {
    var failure = ajaxart.xml.xpath(ajaxart.parsexml('<xml value=""/>'),'@value');
    var newContext = aa_ctx(context,{ AyncFailure : failure});

    return ajaxart.gcs.action_async.SequentialRun(profile,data,newContext);
   }
});
//AA EndModule

function aa_fire_event(item,event,context,props)
{
	if (typeof(props) == "undefined") props = {};
	
	if (! ajaxart.isSafari || ajaxart.isattached(item) )
		  aa_xFireEvent(item, event, props,context.vars.InTest != null);
	else {
		ajaxart_source_elem_in_test = item;
		while (item != null)
		{
			aa_xFireEvent(item, event,props,context.vars.InTest != null);
			item = item.parentNode;
		}
		ajaxart_source_elem_in_test = null;
	}
}

function aa_refreshAfterDataItemsChanged(context)
{
   var items = context.vars._Items[0];
   if (items == null) return [];
   if (context.vars._Cntr)
	   aa_invoke_cntr_handlers(context.vars._Cntr[0],context.vars._Cntr[0].DataItemsChange,[],context);

   var candidates = jQuery(document).find('.aa_items_listener');
   if (context.vars.ControlElement && context.vars.ControlElement[0] != null && ! ajaxart.isattached(context.vars.ControlElement[0])) {
	   var root = context.vars.ControlElement[0];
	   while (root.parentNode != null) root = root.parentNode;
	   var candidates2 = jQuery(root).find('.aa_items_listener');
	   if (candidates2.length > 0) candidates = candidates2;
   }
   var jBase = jQuery(context.vars.ControlElement);
   var substract = jBase.parents('.aa_items_listener').get();
   if (jBase.hasClass('aa_items_listener')) substract.push(jBase[0]);
   
   for(var i=0;i<candidates.length;i++) {
	   var item = candidates[i];
	   var found = false;
	   for(var j=0;j<substract.length;j++) if (item == substract[j]) found=true;
	   if (found) continue;
	   if (item._Items == items)
		   item.RefreshAfterItemsChanged.call(item);
	   else if (item._Items.EqualsToDataItems && item._Items.EqualsToDataItems(items) ) {  // used in document tree
		   item._Items.Refresh([],context);
		   item.RefreshAfterItemsChanged.call(item);
	   }
   }
   return [];
}
aa_inuiaction = false;




//AA BeginModule
ajaxart.gcs.usage = 
{
  DataUsage: function (profile,data,params)
  {
  	var user_agent = aa_text(data,profile,'UserAgent',params);
  	if (user_agent)	aa_determine_device(user_agent);
		return ajaxart.trycatch( function ()	{
//			if (ajaxart.getVariable(params, "GPXtml").length > 0) // only in aaeditor global preview
			if (ajaxart.isBackEnd)
				ajaxart.log('Start usage ' + profile.getAttribute('Name') + ' ' +profile.getAttribute('Of'));
			
			ajaxart.serverData["Usage Data"] = data;
			ajaxart.run(data,profile,'RunBefore',params);
			var result = ajaxart.run(data,profile,'Result',params);
			var result = ajaxart.run(result,profile,'ResultTransformer',params);
			var passed = aa_bool(result,profile,'ExpectedResult',params);
//			var name = aa_text(data,profile,'Of',params) + " " + aa_text(data,profile,'Name',params);
			ajaxart.run(data,profile,'CleanAfter',params);

			if (ajaxart.isBackEnd)
			{
				if (passed) 
					ajaxart.log('success');
				else
					ajaxart.log(profile.getAttribute('Name') + ' ' +profile.getAttribute('Of') + ': failure');
			}
	 	    if (params.vars._TestOutput) {
	 	    	var out = jQuery("<span/>").text(ajaxart.usage.resultAsText(result)[0]);
	 	    	out.html(out.html().replace("\n","</br>"));
	 	    	if (params.vars._TestOutput[0].OutputControl) {
	 	    		params.vars._TestOutput[0].OutputControl[0].appendChild(out[0]);
	 	    		aa_fixTopDialogPosition();
	 	    	}
	 	    	else
		 	    	params.vars._TestOutput[0].OutputControl = out[0];
	 	    }
//	 	    if (params.vars._TestOutput) params.vars._TestOutput[0].OutputControl = ajaxart.usage.resultAsText(result);
			if (passed == false) {
				result = ajaxart.usage.resultAsText(result)[0];
				return result ? [result] : ["aa"];	// empty text means success
			}
			return [];
	}, function (e)	{ // catch
		return ["execption: " + e];
	});
  	if (user_agent)	aa_determine_device();	// put back user agent
  },
  
  DataUsage_Result: function (profile,data,context)
  {
	  ajaxart.run(data,profile,'RunBefore',context);
	  return ajaxart.run(data,profile,'Result',context);
  },

  DataUsage_Data: function (profile,data,context)
  {
	  if (data.length == 0) return [""];
	  return data;
  },
  RunSingleTest: function (profile,data,context)
  {
	  IsTest = true;
	  if (!ajaxart.isxml(data)) return [];
	  var usageProf = data[0];
	  
	  ajaxart.runTestLoop([usageProf],0);
	  return [];
  },
  ContainsText: function (profile,data,context)
  {
	  var look_in = aa_text(data,profile,'LookIn',context);
	  var input = data;
	  if (look_in == 'current dialog') {
		  input = [];
		  var topDialogNew = aa_top_dialog();
		  if (topDialogNew && topDialogNew.dialogContent) input = [topDialogNew.dialogContent];
		  if (!input[0] && topDialogNew) input = [topDialogNew];
		  if (!input[0]) {
  		    var dlg = openDialogs[openDialogs.length-1];
			if (dlg) input = [dlg];
		  }
	  } else if (look_in == 'current popup') {
		  input = aa_contentsOfOpenPopup();
	  }
	  
	  if (aa_bool(data,profile,'RemoveHiddenElements',context) && ajaxart.ishtml(input[0]) ) {
		var toRemove = [];
		function clear(node)
		{
			if (node.style && (node.style.display == 'none' || node.display == 'none' ))
				toRemove.push(node);
			else if (node.style && node.style.position.toLowerCase().indexOf('absolute') != -1)
				toRemove.push(node);
			else {
			  for(var i=0;i<node.childNodes.length;i++)
				clear(node.childNodes[node.childNodes.length-i-1]);
			}
		}
		clear(input[0]);
		for(var i in toRemove)
			if (toRemove[i].parentNode)
				toRemove[i].parentNode.removeChild(toRemove[i]);
	  }
		  
	  var ignoreCase = aa_bool(data,profile,'IgnoreCase',context);
	  var ignoreOrder = aa_bool(data,profile,'IgnoreOrder',context);
	  var oneOf = aa_bool(data,profile,'OneOf',context);

	  var data_text = "";
	  if (ajaxart.isxml(input))
	  	data_text = ajaxart.xml2text(input);
	  else
	  	data_text = ajaxart.totext(input);

  	  var text_items = ajaxart.runsubprofiles(data,profile,'Text',context);
  	  var startIndex = 0;
	  if (ignoreCase) data_text = data_text.toLowerCase();
	  var success = (text_items.length == 0);
	  
	  for(var i=0;i<text_items.length;i++) {
			var text = text_items[i];
	  		if (ignoreCase) text = text.toLowerCase();
	  		var new_index = data_text.indexOf(text,startIndex);
	  		if (!oneOf && new_index == -1) return [];
	  		success = true;
	  		startIndex = new_index + text.length;
	  		if (ignoreOrder || oneOf) startIndex=0;
	  };
	  if (!success) return [];

	  var notContainingText = aa_text(data,profile,'AndNotContainingText',context);
	  if (!notContainingText) return ['true'];
	  if (ignoreCase) notContainingText = notContainingText.toLowerCase();
	  
	  if (data_text.indexOf(notContainingText) > -1) return [];
	  
	  return ['true'];
  },
  And: function(profile,data,context) {
  	return ajaxart.gcs.yesno.And(profile,data,context);
  },
  Or: function(profile,data,context) {
  	return ajaxart.gcs.yesno.OR(profile,data,context);
  },
  HasFocus: function(profile,data,context) {
  	var cls = aa_text(data,profile,'CssClass',context);
  	if (jQuery(document.activeElement).hasClass(cls)) return ["true"];
  	if (jQuery(context.vars.TopControlForTest).find('.in_focus').hasClass(cls)) return ["true"];
  	if (jQuery('.in_focus').hasClass(cls)) return ["true"];
  	return [];
  }
}
//AA EndModule
ajaxart.usage = {};
ajaxart.usage.resultAsText = function(result)
{
	if (result.length == 0) 
		return ["false"];

	if (ajaxart.isxml(result))
		return [ ajaxart.xml2text(result) ];
//		return [ ajaxart.xmlescape(ajaxart.xml2text(result)) ];

	if (ajaxart.isObject(result[0]))
		return [ajaxart.text4trace(result)];
	else
		return result;
	
	return result;
}

function aa_setImage(elem,imageObject,settings)
{
	/* aa_setImage is used to add an image to the DOM. 
	   It is a general purpose functions and can be used by any type. 
	   For image sprites the imageObject should have the property inSprite as true and also the following properties: width, height, x, y
	*/

	elem = jQuery(elem)[0]; /* to accept jquery objects as well*/
	if (!elem) return;

	settings = settings || {};
	if (!settings.hasOwnProperty('removeIfNoImage')) settings.removeIfNoImage=true;

	if ((!imageObject || !imageObject.url) && settings.removeIfNoImage) {
		jQuery(elem).remove();
		return;
	}
	if (!imageObject) return;
	
	if (imageObject.inSprite) {
		var $div = jQuery('<div/>').appendTo(elem);
		$div.width(imageObject.width).height(imageObject.height);
		$div.css('display','inline-block');
		$div.css('background-image','url('+imageObject.url+')');
		$div.css('background-position','' + imageObject.x + ' ' + imageObject.y);
	} else {
		var $img = jQuery('<img/>').attr('src',imageObject.url).appendTo(elem);
		if (imageObject.width) $img.attr('width',imageObject.width);
		if (imageObject.height) $img.attr('height',imageObject.height);
	}
}

//AA BeginModule
aa_gcs("xml", {
	XmlToText: function(profile, data, context) {
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
	TextToXml: function(profile, data, context) {
		return ajaxart.make_array(data,function(item) {
			if (ajaxart.isxml(item[0]) && item[0].nodeType == 1) return item[0];
			return ajaxart.parsexml(ajaxart.totext(item),"TextToXml",null,true);	
		});
	},
	JSONToXml: function(profile, data, context)
	{
		var tag = aa_text(data,profile, 'Tag', context);
		if (aa_text(data,profile, 'InputFormat', context) == 'Object')
			var obj = aa_first(data,profile, 'JSON', context);
		else
			var obj = aa_text(data,profile, 'JSON', context);
		var xml = obj && aa_JSON2Xml(obj,tag);
		return xml ? [xml] : [];
	},
	CSVToXml: function(profile, data, context)
	{
		var xml = aa_CSV2Xml(aa_text(data,profile, 'CSV', context));
		if (xml)
			return [xml];
		return [];
	},
	XPath: function(profile, original_data, context) {
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
	XPathFromList: function(profile, data, context) {
		var xpath = aa_text(data,profile,'XPath',context);
		var list = ajaxart.run(data,profile,'List',context);

		if (xpath == "") return list;
		
		var isAttr = (xpath.charAt(0) == '&');
		var attr = "";
		if (isAttr) attr = xpath.substring(1);
		
		var out = [];
		for(var i=0;i<list.length;i++) {
			var item = list[i];
			if (isAttr) {
				var nextItem = item.getAttribute(attr);
				if (aa_hasAttribute(item,attr)) out.push(nextItem);
			}
			else {
				var results = ajaxart.xml.xpath(item,xpath);
				ajaxart.concat(out,results);
			}
		}
		
		return out;
	},
	IsArrayElement: function(profile, data, context) {
		if ( !ajaxart.isxml(data) ) return [];

		var tag = aa_tag(data[0]);
		var next = ajaxart.xml.NextSibling(data[0],tag);
		if (next == null) next = ajaxart.xml.PrevSibling(data[0],tag);
		if (next != null)
			return ["true"];
		return [];
	},

	NextSibling: function(profile, data, context) {
		var result = ajaxart.xml.NextSibling(data[0],null);
		if (result != null)
			return [result];
		return [];
	},

	PreviousSibling: function(profile, data, context) {
		var result = ajaxart.xml.PrevSibling(data[0],null);
		if (result != null)
			return [result];
		return [];
	},
    ChildAtPosition: function(profile,data,context)
    {
        var position = aa_int(data,profile,'Position',context);
        if (ajaxart.isxml(data) && data[0].nodeType == 1 )
        {
            var xml_item = data[0];
            var t=0;
            for (var i=0;i<xml_item.childNodes.length;i++)
            {
                if (xml_item.childNodes.item(i).nodeType == 1) t++;
                if (t == position)
                    return [xml_item.childNodes.item(i)];
            }
        }
        return [];
    },
	ToXmlElement: function(profile, data, context) {
		if (data.length == 0) return [];
		var xml = data[0];
		if (xml.nodeType == 1) return data;
		if (xml.nodeType == 2 || xml.nodeType == 3 || xml.nodeType == 4) 
			return ajaxart.xml.xpath(xml,'..');
		
		return [];
	},
	XPathOfNode: function(profile, data, context) {
		var id = aa_text(data,profile, 'StopAtIDAttribute', context);
		var specific = aa_bool(data,profile, 'Specific', context); 
		var top = aa_first(data,profile,'TopXml',context);
		
		if (data.length == 0) return [];
		return [ ajaxart.xml.xpath_of_node(data[0],id,specific,top) ];
	},
	XPathOfNodeWithTopTags: function(profile, data, context) {
		var tags = ajaxart.run(data,profile, 'TopTags', context);
		var top = aa_first(data,profile,'TopXml',context);
		if (! ajaxart.isxml(data)) return [];

		var tagsStr = "";
		for(var i=0;i<tags.length;i++) tagsStr += "," + ajaxart.totext(tags[i]) + ",";

		var out = "";
		var xml = data[0];
		var tag = "";
		
		while (xml != null && xml.nodeType != 9)
		{
			if (top != null && xml == top) break;
			if (xml.nodeType == 2) // atribute
			{
				out = "@" + xml.nodeName;
			}
			else // element
			{
				var tag = aa_tag(xml);
				if (tagsStr.indexOf(","+tag+",") > -1) {
					out = aa_text([tag],profile,'PrefixByTagToAdd',context)+ out;
					break;
				}
	
				if (out.length > 0) 
					out = xml.nodeName + "/" + out;
				else 
					out = xml.nodeName;
			}
			
			xml = ajaxart.xml.parentNode(xml);
		} 
		
		return [ out ];
	}, 
	ChangeXml : function(profile, data, context) 
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
	ItemByID: function(profile, data, context) {
		var list = ajaxart.run(data,profile,'List',context);
		var id = aa_text(data,profile,'ID',context);
		
		for(var i=0;i<list.length;i++)
			if (typeof(list[i].getAttribute) != "undefined" && list[i].getAttribute('id') == id)
				return [ list[i] ];
		
		return [];
	},
	Delete: function(profile, data, context) {
		var xmls = ajaxart.run(data,profile,"Element",context);
		for(var i=0;i<xmls.length;i++) {
			var item = xmls[i];
			if (item.nodeType == 2) // attribute
			{
				var ownerElement = ajaxart.xml.parentNode(item);
				ownerElement.removeAttribute(item.nodeName);
			}
			var parent = item.parentNode;
			if (parent != null)
			{
				parent.removeChild(item);
				ajaxart.xml.xml_changed(parent);
			}
		}
		return data;
	},
	RemoveMiddleElement: function(profile, data, context) {
		var elems = ajaxart.run(data,profile,'Element',context);
		for(var i in elems) {
			var elem = elems[i];
			if (!elem || elem.nodeType != 1) return;
			var parent = elem.parentNode;
			while (elem.firstChild) parent.appendChild(elem.firstChild);
			parent.removeChild(elem);
		}
	},
	DeleteChildren: function(profile, data, context) {
		var parent = ajaxart.run(data,profile,'ParentElement',context);
		if ( ! ajaxart.isxml(parent) ) return parent;
		var xml = parent[0];
		while (xml.firstChild != null)
			xml.removeChild(xml.firstChild);
		
		return data;
	},
	RecursiveValuesOfAttribute: function(profile, data, context) 
	{
		var attr = aa_text(data,profile,'Attribute',context);
		if (! ajaxart.isxml(data)) return [];
		var out = [];
		var xml = data[0];
		var notags = ',' + aa_text(data,profile,'ExcludeTags',context) + ',';
		var fill = function(out,xml,attr,notags) {
			if (aa_hasAttribute(xml,attr) && notags.indexOf(','+xml.tagName+',') == -1) out.push(xml.getAttribute(attr));
			var child = xml.firstChild;
			while (child != null) {
				if (child.nodeType == 1) fill(out,child,attr,notags);
				child = child.nextSibling;
			}
		}
		fill(out,xml,attr,notags);

		return out;
	},
	FindXmlByAttribute: function(profile, data, context) {
		var xml = aa_first(data,profile,'ParentXml',context);
		var attr = aa_text(data,profile,'Attribute',context);
		var value = aa_text(data,profile,'Value',context);
		var findAll = aa_bool(data,profile,'FindAll',context);
		
		var out = [];
		
		if (xml == null || xml.nodeType != 1 || attr == "") return [];
		var find = function(xml,attr,value,out,findAll) {
			if (xml.getAttribute(attr) == value) {
				out.push(xml);
				if (!findAll) return;
			}
			var child = xml.firstChild;
			while (child != null) {
				if (child.nodeType == 1) {
					find(child,attr,value,out,findAll);
					if (out.length > 0 && ! findAll) return;				
				}
				child = child.nextSibling;
			}
			return [];
		}
		find(xml,attr,value,out,findAll);
		return out;
	},
	DeleteAttributes: function(profile, data, context) {
		var parent = ajaxart.run(data,profile,'ParentElement',context);
		var exclude = ajaxart.run(data,profile,'Exclude',context);
		
		if ( ! ajaxart.isxml(parent) ) return parent;
		var xml = parent[0];
		if (xml.nodeType != 1) return data;
		
		var exclude_atts = {};
		for (var i=0; i<exclude.length; i++) {
			var exclude_att = ajaxart.totext(exclude[i]);
			if (exclude_att != "")
				exclude_atts[exclude_att] = true;
		}
		var names = [];
		for (var i=0; i<xml.attributes.length; i++)
			names.push(xml.attributes.item(i).name);
		for (var i=0; i<names.length; i++) {
			if (exclude_atts[names[i]] == null) 
				xml.removeAttribute(names[i]);
		}
		
		return data;
	},
	Update :function(profile, data, context) {
		var inputForChanges = ajaxart.getVariable(context,"InputForChanges");
		var newValue = ajaxart.run(inputForChanges,profile, 'NewValue', context);
		ajaxart.writevalue(data, newValue);
		return data;
	},
	ReplaceXmlElement: function(profile, data, context)
	{
		var elem = aa_first(data,profile, 'Element', context);
		var newElem = aa_first(data,profile, 'NewElement', context);
		var mode = aa_text(data,profile, 'Mode', context);

		if (!elem || !newElem || elem == newElem || elem.nodeType != 1 || newElem.nodeType != 1) return;

	    if (mode == "keep original tag") {
			ajaxart.xml.copyElementContents(elem,newElem);
		} else if (mode == "replace tag") {
			ajaxart.replaceXmlElement(elem,newElem,false);
			elem = newElem;
		}
		ajaxart.xml.xml_changed(elem);
		ajaxart.run([elem],profile,'RunOnNewElement',context);
	},
	ReplaceElement: function(profile, data, context)
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
	
	MoveElementAfterIndex: function(profile, data, context)
	{
		var elem = data[0];
		var after = aa_int(data,profile, 'Index', context);
	
		if (typeof(elem) == "undefined" || elem.nodeType != 1 ) return []; // Not Element  
				
		var parent = elem.parentNode;
		var tag = aa_tag(elem);

		var dest = ajaxart.xml.FirstChild(parent,tag);
		var last_of_tag = dest; // helper for last
	  	for(var i=0;i<after;i++)
	  	{
	  		last_of_tag = dest;
	  		dest = ajaxart.xml.NextSibling(dest,tag);
	  	}

		if (dest == elem) return data;
		var theElement = parent.removeChild(elem);
		if (dest == null) // last
		{
			if (last_of_tag == null || last_of_tag.nextSibling == null)
				parent.appendChild(theElement);
			else
				parent.insertBefore(theElement,last_of_tag.nextSibling);
		}
		else if (dest != null)
			parent.insertBefore(theElement,dest);
		
		return data;

	},

	MoveElement: function(profile, data, context)
	{
		var elem = data[0];
		var to = aa_text(data,profile, 'To', context);
	
		if (typeof(elem) == "undefined" || elem.nodeType != 1 ) return []; // Not Element  
		var parent = elem.parentNode;
		var tag = aa_tag(elem);

		var dest = null;
		if (to == "next")
		{
			dest = ajaxart.xml.NextSibling(elem,tag); 
			if (dest == null) return [];
			dest = ajaxart.xml.NextSibling(dest,tag); // no method insertAfter... 
			if (dest == null)
				to = "last";
		}
		if (to == "previous")
			dest = ajaxart.xml.PrevSibling(elem,tag); 
		if (to == "first")
			dest = ajaxart.xml.FirstChild(parent,tag); 
		if (to == "last")
		{
			dest = ajaxart.xml.FirstChild(parent,tag);
			var last_of_tag = dest; // helper for last
		  	while (dest != null)
		  	{
		  		last_of_tag = dest;
		  		dest = ajaxart.xml.NextSibling(dest,tag);
		  	}
			var theElement = parent.removeChild(elem);
			if (last_of_tag == null || last_of_tag.nextSibling == null)
				parent.appendChild(theElement);
			else
				parent.insertBefore(theElement,last_of_tag.nextSibling);
			return;
		}

		if (dest == elem) return data;
		if (dest != null)
		{
			var theElement = parent.removeChild(elem);
			parent.insertBefore(theElement,dest);
		}
		if (parent != null) ajaxart.xml.xml_changed(parent);
		
		return data;
		
	},
	ToLogicalRoot: function(profile, data, context)
	{
		if (! ajaxart.isxml(data)) return [];
		var node = data[0];
		if (node.nodeType == 2) // attribute
			node = ajaxart.xml.parentNode(node);
		var prev = node;
		
		while(node != null && node.nodeType == 1)
		{
			if (aa_bool([node],profile,'FilterOnRoot',context)) // found
				return [node];
			
			var newPrev = node;
			node = node.parentNode;
			if (node != null) 
			{
 			  if (aa_bool([node],profile,'FilterOnRootParent',context)) // found
				return [newPrev];
				
			  prev = newPrev;
			}
		}
		return [prev];
	},
	RegisterModifyOnXml: function (profile,data,context)
	{
		var xml = aa_first(data,profile,'Xml',context);
		var autosavedelay = aa_int(data,profile,'DelayAutoSaveInMilli',context);
		var mode = aa_text(data,profile,'Mode',context);
		
		if (xml == null || ! ajaxart.isxml(xml)) return [];
		if (aa_tobool(context.vars._ImmediateAutoSave)) autosavedelay = 0;
		var attachment = { disable: false, modified: false, profile: profile , 
				data: data , context: context, autosavedelay: autosavedelay,  mode: mode };

		for(var i=0;i<ajaxart.xmlsToMonitor.length;i++)
		{
			if ( ajaxart.xmlsToMonitor[i].xml == xml )
			{
				ajaxart.xmlsToMonitor[i].ajaxartOnChange = attachment;
				return ["true"];
			}
		}
		ajaxart.xmlsToMonitor.push( { xml: xml, modifyInfo: attachment} );

		return ["true"]; 
	},
	RemoveAttributes : function(profile, data, context) 
	{
		if (data.length == 0 || !ajaxart.isxml(data) || data[0].nodeType != 1)
			return [];
		var attributes = ajaxart_run_commas(data,profile, 'AttributeNames', context);
		for (i in attributes) 
			data[0].removeAttribute( ajaxart.totext(attributes[i]) );
		return data;
	},
	HasAttribute: function(profile, data, context) {
	  var attr = aa_text(data,profile,'Attribute',context);
	  if ((! ajaxart.isxml(data)) || data[0].nodeType != 1) return [];
	  if (aa_hasAttribute(data[0],attr)) 
		  return ["true"];
	  return [];
	},
	HasParent: function(profile, data, context) {
		if (! ajaxart.isxml(data)) return [];
		if (data[0].parentNode == null) return [];
		return ["true"];
	},
	AddChildInPosition: function(profile, data, context) {
		var inputForChanges = ajaxart.getVariable(context,"InputForChanges");
		var child = aa_first(inputForChanges,profile, 'Child', context);
		var posObj = aa_first(inputForChanges,profile, 'Position', context);
		if (child == null || ! ajaxart.isxml(child) || ! ajaxart.isxml(data)) return data;
		var identicalTags = aa_bool(data,profile,'IdenticalTags',context);
		
		var parent=data[0];
		var tag = aa_tag(child);
		
		var insertBeforeMe = null;
		if (posObj != null) 
		{
			var pos = parseInt(ajaxart.totext(posObj));
			var counter=0;
			var node = data[0].firstChild;
			while (node != null)
			{
				if (node.nodeType == 1 && ( aa_tag(node) == aa_tag(child) || !identicalTags))
				{
					if (++counter == pos) insertBeforeMe = node;
				}
				node = node.nextSibling;
			}
		}
		child = aa_importNode(child, data[0]);
		
		if (insertBeforeMe == null)
		{
			// find last of tag and add after it
			var dest = ajaxart.xml.FirstChild(parent,tag);
			var last_of_tag = dest; // helper for last
		  	while(dest != null)
		  	{
		  		last_of_tag = dest;
		  		dest = ajaxart.xml.NextSibling(dest,tag);
		  	}

			if (last_of_tag == null || last_of_tag.nextSibling == null)
					parent.appendChild(child);
				else
					parent.insertBefore(child,last_of_tag.nextSibling);
		}
		else
			data[0].insertBefore(child,insertBeforeMe);
		
		ajaxart.run([child],profile,'DoOnNewChild',context);
		ajaxart.xml.xml_changed(parent);
		
		return [child];
	},
	AddXmlChildren: function(profile, data, context) {
		var parent = aa_first(data,profile,'Parent',context);
		var children = ajaxart.run(data,profile,'Children',context);
		var clone = aa_bool(data,profile,'CloneChildren',context);
		var asFirst = aa_bool(data,profile,'AddAsFirst',context);
		if (!parent) return;
		
		var adddedChildren = [];
		for(var i=0;i<children.length;i++) {
			var item = (clone) ? children[i].cloneNode(true) : children[i];
			adddedChildren.push( ajaxart.xml.append(parent,item,asFirst) );
		}
		
		if (children.length > 0) ajaxart.xml.xml_changed(parent);
		
		ajaxart.run(adddedChildren,profile,'DoOnAddedChildren',context);
	},
	ReplaceChildren: function(profile, data, context) {
		var inputForChanges = ajaxart.getVariable(context,"InputForChanges");
		var children = ajaxart.run(inputForChanges,profile, 'Children', context);
		var clone = aa_bool(inputForChanges,profile,'CloneChildren',context);
		if (data.length == 0) return [];
		
		while (data[0].firstChild != null)
			data[0].removeChild(data[0].firstChild);
		
		ajaxart.each(children,function(item) {
			if (!clone)
				ajaxart.xml.append(data[0],item);
			else
				ajaxart.xml.append(data[0],ajaxart.xml.clone([item]));
		});
		if (children.length > 0) ajaxart.xml.xml_changed(data[0]);
		return data;
	},
	PerformChanges : function(profile, data, context) {
		var changeProfiles = ajaxart.subprofiles(profile, 'Change');
		for(var i=0;i<changeProfiles.length;i++)
			ajaxart.run(data,changeProfiles[i],'',context);
		return ["true"];
	},
	MultiChange : function(profile, data, context) {
		var changeProfiles = ajaxart.subprofiles(profile, 'Change');
		var inputforChanges = ajaxart.getVariable(context,"InputForChanges");
		var dataForChanges = ajaxart.run(inputforChanges,profile, 'DataForChanges', context);
		var performChangesOn = ajaxart.run(data,profile, 'PerformChangesOn', context);
		var newContext = ajaxart.clone_context(context);

		ajaxart.each(dataForChanges, function(item) {
			ajaxart.setVariable(newContext,"InputForChanges",[item]);
			if (performChangesOn.length == 0) {
				for(var i=0;i<changeProfiles.length;i++)
					ajaxart.run(data,changeProfiles[i],'',newContext);
			} else 
				ajaxart.each(performChangesOn, function(change_item) {
					for(var i=0;i<changeProfiles.length;i++)
						ajaxart.run([change_item],changeProfiles[i],'',newContext);
				});
		});
			
		return data;
	},
	UpTillMatchesFilter: function(profile, data, context)
	{
		if (! ajaxart.isxml(data)) return [];
		var xml = data[0];
		if (aa_bool([xml],profile,'Filter',context))
			return [xml];
		var xml = ajaxart.xml.parentNode(xml);
		while (xml != null && xml.nodeType == 1)
		{
			if (aa_bool([xml],profile,'Filter',context))
				return [xml];
			xml = xml.parentNode;
		}
		return [];
		
	},
	RemoveInnerText: function(profile, data, context)
	{
		if (! ajaxart.isxml(data)) return data;
		var xml = data[0];
		if (xml.nodeType == 1)
		{
			 var node = xml.firstChild;
			 while (node != null)
			 {
				var prev = node;
				node=node.nextSibling;
				if (prev.nodeType == 3 || prev.nodeType == 4) xml.removeChild(prev);
			 }			
			 ajaxart.xml.xml_changed(data[0]);
		}
		return data;
	},
	InnerTextValue: function(profile, data, context) 
	{
		if (!ajaxart.isxml(data)) return [];
		
		var node = data[0].firstChild;
		while (node != null) {
			if (node.nodeType == 3 || node.nodeType == 4) return [node];
			node=node.nextSibling;
		}
		
		return [];
	},
	InnerText: function(profile, data, context) {
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
	IndexOfElement: function(profile,data,context)
	{
		var startIndex = aa_text(data,profile,'IndexOfFirstElement',context);
		if (ajaxart.isxml(data) && data[0].nodeType == 1 && data[0].parentNode != null)
		{
			var xml_item = data[0];
			var count = startIndex;

			for (var i=0;i<xml_item.parentNode.childNodes.length;i++)
			{
				var brother = xml_item.parentNode.childNodes.item(i);
				if (brother.nodeType == 1 && aa_tag(brother) == aa_tag(xml_item))
				{
					if ( brother == xml_item ) return [""+count];
					count++;
				}
			}
		}
		return [];
	},
	IsAttribute: function(profile,data,context)
	{
		if (ajaxart.isxml(data) && data[0].nodeType == 2 ) return ["true"];
		return [];
	},
	AreSiblings: function(profile,data,context)
	{
  		var parent = null;
  		for (var i=0;i < data.length; i++)
  		{
  			var new_parent = data[i].parentNode;
  			if (new_parent != parent && i != 0) 
  				return [];
  			parent = new_parent;
  			if (parent == null || parent == undefined) 
  				return [];
  		}
		return ["true"];
	},
	IsElement: function(profile,data,context)
	{
		if (ajaxart.isxml(data) && data[0].nodeType == 1 ) return ["true"];
		return [];
	},
	ByTag: function(profile,data,context)
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
	ElementOfDynamicTag: function(profile,data,context)
	{
		var tag = aa_text(data,profile, 'Tag', context);
		if (tag.length == 0) return [];
		var elem = aa_createElement(data[0],tag);  
		if (elem == null) return [];
		var newContext = ajaxart.clone_context(context);
		ajaxart.setVariable(newContext,"InputForChanges",data);
		var changes = ajaxart.subprofiles(profile,'Change');
		ajaxart.each(changes,function(changeProfile) {
			ajaxart.run([elem],changeProfile, "", newContext);
		});
		return [elem];
	},
	XmlWithChangedTag: function(profile,data,context)
	{
		var tag = aa_text(data,profile, 'Tag', context);
		var base = aa_first(data,profile, 'BaseXml', context);
		if (tag.length == 0 || (! ajaxart.isxml(base)) ) return [];
		var elem = aa_createElement(base,tag);  
		if (elem == null) return [];
		ajaxart.xml.copyElementContents(elem,base);
		return [elem];
	},
	FindElementByID: function(profile,data,context)
	{
		var id = aa_text(data,profile, 'Id', context);
		if (data.length == 0) return [];
		result = ajaxart.xml.findById(data[0],id);
		if (result == null) return [];
		return [result];
	},
	Clone: function(profile,data,context)
	{
		var xml = aa_first(data,profile,'Xml',context);
		if (xml == null) return [];
		if (!ajaxart.isxml(xml)) return [];

		return [ ajaxart.xml.clone([xml]) ];
	},
	TextRowToXml: function(profile,data,context)
	{
		var tag = aa_text(data,profile,'Tag',context);
		var atts = aa_text(data,profile,'Attributes',context);
		var sep = aa_text(data,profile,'Separator',context);
		
		var src_list = data[0].split(sep);
		var atts_list = atts.split(',');
		var result = aa_createElement(data[0],tag);  

		for(var i=0;i<atts_list.length;i++)
			result.setAttribute(atts_list[i],src_list[i]);
		
		return [ result ];
	},
	CopyAttributes: function(profile,data,context)
	{
		var inputForChanges = ajaxart.getVariable(context,"InputForChanges");
		var source = ajaxart.run(inputForChanges, profile, 'SourceElement', context);
		var overrideExistingAttributes = aa_bool(data,profile, 'OverrideExistingAttributes', context);
		
		if (data.length == 0 || source.length == 0 || source[0].nodeType != 1 || data[0].nodeType != 1) return data;

		var atts = source[0].attributes;
		if (atts != null)
		for (var i = 0; i < atts.length; i++) {
			var attName = atts.item(i).nodeName;
			if (overrideExistingAttributes || aa_hasAttribute(source[0],attName) )
				data[0].setAttribute(attName, source[0].getAttribute(attName) || '' );
		}

		return data;
	},
	OverrideAttributesAndElements: function (profile,data,context)
	{
		var inputForChanges = ajaxart.getVariable(context,"InputForChanges");
		var source = aa_first(inputForChanges, profile, 'SourceXml', context);
		if (data.length == 0 || source == null || source.nodeType != 1 || data[0].nodeType != 1) return data;
		var target = data[0];
		
		var atts = source.attributes;
		for (var i = 0; i < atts.length; i++) {
			var attName = atts.item(i).nodeName;
			  target.setAttribute(attName, source.getAttribute(attName) || '');
		}

		jQuery(target).empty();
		
		var child = source.firstChild; 
		while (child != null)
		{
			if (child.nodeType == 1)
			  target.appendChild(child.cloneNode(true));
			child = child.nextSibling;
		}
		
		return data;
	},
	IfThenElse : function (profile,data,context)
	{
		var passed = aa_bool(data,profile,'If',context);
		if (passed)
			ajaxart.run(data,profile,'Then',context);
		else
			ajaxart.run(data,profile,'Else',context);
		return data;
	},
	  MoveBefore: function (profile,data,context)
	  {
		if (data.length == 0) return [];
	    var item = data[0].Item[0];
	    var to = data[0].BeforeItem[0];
		if (ajaxart.isxml(to) && ajaxart.isxml(item) )
			if (to.parentNode == item.parentNode && item.parentNode != null)
				to.parentNode.insertBefore(item,to);
	    return [];
	  },
	  MoveToEnd: function (profile,data,context)
	  {
		if (data.length == 0) return [];
	    var item = data[0];
		if (ajaxart.isxml(item) && item.parentNode != null)
			item.parentNode.appendChild(item);
				
	    return [];
	  },
	CleanEmptyAttributes: function (profile,data,context)
	{
		var recursive = aa_bool(data,profile,'Recursive',context);
		var ignore = ajaxart.run(data,profile,'IgnoreAttributes',context);
		var ignore_str = "";
		for(var i=0;i<ignore.length;i++) ignore_str += "," + ignore[i] + ",";
		
		if (! ajaxart.isxml(data)) return [];
		
		var cleanElement = function(element,ignore_str,recursive) {
			for (var i=0;i<element.attributes.length;i++) {
				var attr = element.attributes.item(i).name;
				if ((element.getAttribute(attr) == "") && (ignore_str.indexOf(","+attr+",") == -1) )
				{
					element.removeAttribute(attr);
					i--;
				}
			}
			if (recursive) {
				var elem = element.firstChild;
				while (elem != null) {
					if (elem.nodeType == 1) cleanElement(elem,ignore_str,true);
					elem = elem.nextSibling;
				}
			}
		}
		if (data[0].nodeType == 1)
			cleanElement(data[0],ignore_str,recursive);
		
		return ["true"];
	},
	XmlInfo: function (profile,data,context)
	{
		if (! ajaxart.isxml(data)) return;
		var info = aa_getXmlInfo(data[0],context);
		if (info == null) return [];
		return [info];
	},
	UpTillHasXmlInfoWithMethod: function (profile,data,context)
	{
		if (! ajaxart.isxml(data)) return;
		var xml = data[0];
		if (xml.nodeType != "1") xml = aa_xpath(xml,'..')[0];
		
		while (xml.nodeType == 1) {
		  var info = aa_getXmlInfo(xml,context,true);
		  if (info) return [info];
		  xml = xml.parentNode;
		}
	},
	RunMethodOnXml: function (profile,data,context)
	{
		var xml = aa_first(data,profile,'Xml',context);
		var method = aa_text(data,profile,'Method',context);
		var info = aa_getXmlInfo(xml,context);
		if (!info || ! info[method]) return [];
		return info[method](data,context);
	},
	XmlQuery: function (profile,data,context)
	{
		var items = ajaxart.run(data,profile,'Items',context);
		var query = aa_first(data,profile,'Query',context);
		if (query == null) return items;
		
		var subitems = ajaxart.xml.xpath(query,'xmlfilter');
		if (subitems.length == 0) return items;
		var current = items;
		var out = [];
		
		for(var i=0;i<subitems.length;i++) {
			var xmlfilter = subitems[i];
			out = [];
			var xpath = '' + xmlfilter.getAttribute('xpath');
			var op = '' + xmlfilter.getAttribute('op');
			var value = '' + xmlfilter.getAttribute('value') || '';
			if (op == 'contains') var valueLower = value.toLowerCase();
			
			var disabled = '' + xmlfilter.getAttribute('disabled');
			if ("true" == disabled) { out = current; continue; }
			
			if (op == 'date_between') var from = aadate_date2int('' + xmlfilter.getAttribute('from'));
			// to fix: assuming 'to' has no time.
			if (op == 'date_between') var to = aadate_date2int('' + xmlfilter.getAttribute('to')) + 1440;
			if (op == 'date_between' && to == 1440) to = 12949120000;
			var oneOfList = [];
			if (op == 'one of') oneOfList = (''+xmlfilter.getAttribute('value')).split(',');
			
			for(var j=0;j<oneOfList.length;j++)
				oneOfList[j] = ',' + oneOfList[j] + ',';
			
			for (var j=0;j<current.length;j++)
			{
				var item = current[j];
				var inneritem = item;
				if (xpath != null && xpath.length > 0)
				{
					if (xpath[0] == "@")
					{
						var fld = xpath.split("@")[1];
						inneritem = '' + item.getAttribute(fld);
					}
					else if (xpath == "by xtml")
					{
						inneritem = aa_first([item],xmlfilter,'xpath_by_xtml',context);
						if (inneritem == null) continue;
					}
					else {
					  var inneritemslist = ajaxart.xml.xpath(item,xpath);
					  if (inneritemslist.length == 0) continue;
					  inneritem = inneritemslist[0];
					}
				}
				var inneritemValue = ajaxart.totext(inneritem);
				if (op == '=') {
					if ( value == "" || inneritemValue == value ) out.push(item);
				}
				if (op == '!=') {
					if ( inneritemValue != value ) out.push(item);
				}
				if (op == '<' || op == "<=" || op == ">" || op == ">=") {
					try {
					  var valint = parseInt(value);
					  var itemint = parseInt(inneritemValue);
					  if (op == '<' && itemint < valint ) out.push(item);
					  if (op == '<=' && itemint <= valint ) out.push(item);
					  if (op == '>' && itemint > valint ) out.push(item);
					  if (op == '>=' && itemint >= valint ) out.push(item);
					} catch(e) { continue; }
				}
				if (op == 'contains') {
					if (inneritemValue.toLowerCase().indexOf(valueLower) > -1)
						out.push(item);
				}
				else if (op == 'one of' && xmlfilter.getAttribute('value') == "_all") {
					out.push(item);
				}
				else if (op == 'one of' && xmlfilter.getAttribute('value') == "") {
					out.push(item);
				}
				else if (op == 'one of' && xmlfilter.getAttribute('value') == "_blank") {
					if (inneritemValue == '')
						out.push(item);
				}
				else if (op == 'one of') {
					inneritemValue = "," + inneritemValue + ",";
					for(var k=0;k<oneOfList.length;k++) 
						if (inneritemValue.indexOf(oneOfList[k]) != -1) 
							out.push(item);
				}
				else if (op == 'date_between') {
					var intValue = aadate_date2int(inneritemValue);
					if (from <= intValue && intValue <= to)
						out.push(item);
				}
				else if (op == 'xtml') {
					var xtml_list = ajaxart.xml.xpath(xmlfilter,'xtml');
					if (xtml_list.length == 0) continue;
					if ( aa_bool([inneritem],xtml_list[0],'',context) )
					  out.push(item);
				}
			}
			
			current = out;
		}
		return out;
	},
    Switch: function (profile,data,context)
    {
	  return aa_switch(profile,data,context);
    },
    PerformChangeOnElements: function (profile,data,context)
    {
		  var elements = ajaxart.run(data,profile,'Elements',context);
		  for (var i in elements)
			ajaxart.run([elements[i]],profile,'Change',context);
    },
    PerformChangeWithManyInputs: function (profile,data,context)
	{
  	  var inputs = ajaxart.run(data,profile,'Inputs',context);
  	  var local_context = ajaxart.clone_context(context); 
  	  for (var i in inputs) {
  			ajaxart.setVariable(local_context,"InputForChanges",[ inputs[i] ]);
  			ajaxart.run(data,profile,'Change',local_context);
  	  }
  	  return data;
	},
	Filter: function (profile,data,context)
	{
		var items = ajaxart.run(data,profile,'Items',context);
		var filter = aa_text(data,profile,'Filter',context);
		
		var out = [];
		for(var i=0;i<items.length;i++)
		{
			var xpath = "." + filter;
			if (ajaxart.xml.xpath(items[i],xpath).length > 0)
				out.push( items[i] );
		}
		
		return out;
	},
	Siblings: function (profile,data,context)
	{
		var xml_item = aa_first(data,profile,'Element',context);
		var onlyWithSameTag = aa_bool(data,profile,'OnlyWithSameTag',context);
		if (xml_item.nodeType != 1)
			return [];
		
		var out = [];
		for (i=0;i<xml_item.parentNode.childNodes.length;i++)
		{
			var sibling = xml_item.parentNode.childNodes.item(i);
			if (sibling != xml_item && sibling.nodeType == 1)
				if (aa_tag(sibling) == aa_tag(xml_item) || !onlyWithSameTag )
					out.push(sibling);
		}
		return out;		
	},
	XmlParsingError: function (profile,data,context)
	{
		var xmlAsText = aa_text(data,profile,'XmlAsText',context);
		var error = [];
		ajaxart.parsexml(xmlAsText,"",error,true);
		return error;
	},
	XmlItemsSubset: function (profile,data,context)
	{
		var parent_items = aa_first(data,profile,'Parent',context);
		var item = aa_first(data,profile,'Item',context);
		
		var items = { isObject: true, ItemTypeName: parent_items.ItemTypeName };
		var trasnsactional = (context.vars._Transactional != null && ajaxart.totext_array(context.vars._Transactional) == "true");

		if (trasnsactional)
		{
			var original_copy = ajaxart.xml.clone([item]);
			var working_item = ajaxart.xml.clone([item]);
			original_copy.setAttribute('__Remark','Original copy');
			items.Items = [working_item]; items.OriginalCopy = [original_copy]; items.ItemToChange = [item];
	
			var saveFunc = function(_items) { return function(data1,context)
			{
				ajaxart.xml.copyElementContents(_items.ItemToChange[0],_items.Items[0]);
			}}
			ajaxart_addMethod_js(items,'Save',saveFunc(items),context);
		}
		else {
			items.Items = [item];
		}
		return [items];
	},
	XmlFromList: function (profile,data,context)
	{
		var atts = aa_text(data,profile,'AttributeNames',context).split(",");
		var out = aa_createElement(null, aa_text(data,profile,'Tag',context) );
		for (var i=0; i<data.length; i++) {
			if (i >= atts.length) return [out];
			out.setAttribute(atts[i],ajaxart.totext_item(data[i]));
		}
		return [out];
	},
	WriteCData: function (profile,data,context)
	{
		var element = aa_first(data,profile,'Element',context);
		var cdata_text = aa_text(data,profile,'CDataText',context);
		if (!element || cdata == "") return [];
		
		while (element.firstChild) element.removeChild(element.firstChild);  // delete all children first
		 
/*		for (var child = element.firstChild; child!=null; child=child.nextSibling)
			if (child.nodeType == 4 ) {
				var next = child.nextSibling;
				element.removeChild(child);
			}
*/
		var cdata = element.ownerDocument.createCDATASection(cdata_text);
		element.appendChild(cdata);
		return [];
	},
	CDataValue: function (profile,data,context)
	{
		var element = aa_first(data,profile,'Element',context);
		if (!element) return [];
		for (var child = element.firstChild; child!=null; child=child.nextSibling)
			if (child.nodeType == 4 && child.nodeValue)
				return [child.nodeValue];
 	    return [];
	}
});
//AA EndModule

ajaxart.xml.findById = function(node,id)
{
	if (! ajaxart.isxml(node)) return null;
	
	if (node.nodeType != 1)	return null; // not element
	if (node.getAttribute('id') == id) return node;
	var child = node.firstChild;
	while (child != null)
	{
		var result = ajaxart.xml.findById(child,id); 
		if (result != null) return result; 
		child = child.nextSibling;
	}
	return null;
}

ajaxart.xml.xpath_of_node = function(xml,id,specific,top)
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
};

ajaxart.xml.set_tagname = function(old_elem, tagName) 
{
	if (old_elem == null) return null;

	var new_elem = aa_createElement(old_elem, tagName); // ajaxart.parsexml("<" + tagName + "/>"); //old_elem.ownerDocument.createElement(tagName);
	ajaxart.xml.copyElementContents(new_elem,old_elem);

	if (old_elem.parent != null)
		old_elem.parent.replaceChild(new_elem, old_elem);
	return new_elem;
};

ajaxart.xml.copyElementContents = function(target,source)
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

ajaxart.xml.setAsOnlyChildElem = function(parent,newchild)
{
	if ( parent == null || parent.childNodes == null ) return;
	var node = parent.firstChild;
	while (node != null)
	{
		var next_sibling = node.nextSibling;
		if (node.nodeType == 1) { // element
			parent.removeChild(node);
		}
		node = next_sibling;
	}
	ajaxart.xml.append(parent,newchild);
};
ajaxart.xml.innerTextStr = function(element)
{
	var node = element.firstChild;
	while (node != null) {
		if (node.nodeType == 3 || node.nodeType == 4) return node.nodeValue;
		node=node.nextSibling;
	}
	return "";
}
ajaxart.xml.FirstChild = function(parent,tag)
{
	var res = parent.firstChild;
	if (res == null) return null;
	if (res.nodeType != 1 || aa_tag(res) != tag) 
		res = ajaxart.xml.NextSibling(res,tag);

	return res;
};
ajaxart.xml.NextSibling = function(elem,tag)
{
	if (elem == null) return null;
	var res = elem.nextSibling;
	if (res == null) return null;
	if (res.nodeType != 1) return ajaxart.xml.NextSibling(res,tag);
	if (tag != null && aa_tag(res) != tag) return ajaxart.xml.NextSibling(res,tag);
	return res;
}
ajaxart.xml.PrevSibling = function(elem,tag)
{
	if (elem == null) return null;
	var res = elem.previousSibling;
	if (res == null) return null;
	if (res.nodeType != 1) return ajaxart.xml.PrevSibling(res,tag);
	if (tag != null && aa_tag(res) != tag) return ajaxart.xml.PrevSibling(res,tag);
	return res;
}
ajaxart.xml.root = function(node)
{
	if (!node) return null;
	var parent = ajaxart.xml.parentNode(node);
	if (parent == null) return node;
	var prev,next = parent;
	while (next != null && next.nodeType == 1)
	{
		prev = next;
		next = next.parentNode;
	}
	return prev;
}
ajaxart.xml.autosave = function(xml,attachment,saveAction) 
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
function ajaxart_delete_child_elem(xml,tag)
{
	var child= xml.firstChild;
	while (child != null) {
		if (aa_tag(child) == tag) { xml.removeChild(child); return; }
		child = child.nextSibling;
	}
		
}
function aa_xmlbyid(list,id)
{
  for(var i=0;i<list.length;i++)
	  if (id == list[i].getAttribute('id')) return list[i];
  return null;
}

function aa_cdata_value(element) {
	if (!element) return null;
	for (var child = element.firstChild; child!=null; child=child.nextSibling)
		if (child.nodeType == 4 && child.nodeValue)
			return child.nodeValue;
	return null;
}



ajaxart.gcs.xmlui = 
{
	CallUpdateOfCodeMirror: function (profile,data,context)
	{
		var iframe = ajaxart.getControlElement(context,true);
		if (iframe != null && iframe.contentWindow != null)
		{
			var txt = iframe.contentWindow.editor.getCode();
			if (iframe.getAttribute("type") == "css")
				txt = txt.replace(/\n/g,'/*nl*/');
			ajaxart_update(iframe,txt);
		}
	},
	InsertTextToCodeMirror: function (profile,data,context)
	{
		var wrapper = ajaxart.getControlElement(context,true);
		if (!wrapper || !wrapper.jbCodeMirrorEditor) { ajaxart.log("InsertTextToCodeMirror: Cannot find codemirror","error"); return; }
			wrapper.jbCodeMirrorEditor.replaceSelection(aa_text(data,profile,'Text',context));
	},
	CodeMirrorTextareaOld: function (profile,data,context) {
		var wrapper = document.createElement('div');
		wrapper.className = aa_attach_global_css( aa_text(data,profile,'Css',context),null,'codemirror_wrapper');
		var textArea = document.createElement('textarea');
		wrapper.appendChild(textArea);
		var text = ajaxart.run(data,profile,'Text',context);
		textArea.value = aa_totext(text).replace(new RegExp('/[*]nl[*]/', 'g'),'\n'); // clean new line indication
		var base_lib = aa_base_lib() + '/codemirror/';
		var type = aa_text(data,profile,'Type',context); 
		var parserfile,css;
		var height = aa_text(data,profile,'Height',context);
		var width = aa_text(data,profile,'Width',context);
		var useResizing = aa_bool(data,profile,'Resizer',context);
		if (useResizing) {
		  var identifier = aa_text(data,profile,'IdentifierToRecallLastSize',context);
		  jBart.vars.codeMirrorSizes = jBart.vars.codeMirrorSizes || {};
		  var lastSize = jBart.vars.codeMirrorSizes[identifier];
		  if (lastSize) {
			  width = lastSize.width + 'px';
			  height = lastSize.height + 'px';
		  }
		}
		
		textArea.style.width = width;
		textArea.style.height = height;
		
		if (type == "xml") {
			parserfile = "parsexml.js";
			css = "css/xmlcolors.css";
		} else if (type == "js") {
			parserfile = ["tokenizejavascript.js", "parsejavascript.js"];
			css = "css/jscolors.css";
		} else if (type == "css") {
			parserfile = "parsecss.js";
			css = "css/csscolors.css";
		} else if (type == "text") {
				parserfile = "parsedummy.js";
				css = "css/csscolors.css";
		} else {	// default
			parserfile = "parsedummy.js";
			css = "css/csscolors.css";
		}
		css = base_lib + css;

		var settings = {
			    height: height,
			    width: width,
			    parserfile: parserfile,
			    stylesheet: css,
			    path: base_lib + 'js/',
			    continuousScanning: 500,
			    lineNumbers: aa_bool(data,profile,'LineNumbers',context),
			    textWrapping: aa_bool(data,profile,'TextWrapping',context),
			    readOnly: aa_bool(data,profile,'ReadOnly',context),
			    onChange: function() {
					ajaxart.writevalue(text, [wrapper.editor.getCode()]); 
					ajaxart.run(text, profile, 'OnUpdate', aa_ctx( context, {ControlElement:[wrapper]} )); 
				},
			    autoMatchParens: true,
			    initCallback: function(editor) { 
					try {
					wrapper.editor = editor;
				  	if (aa_bool(data,profile,'AutoFocus',context))
				  		textArea.focus();
				  	jQuery(wrapper.editor.win.document.body).keydown(function(e) {
				  		  ajaxart.writevalue(text, [wrapper.editor.getCode()]);
						  if (e.keyCode == 13 && e.ctrlKey)
							  ajaxart.run([wrapper.editor.getCode()], profile, 'OnCtrlEnter', context);
						  if (e.keyCode == 13 && e.shiftKey)
							  ajaxart.run([wrapper.editor.getCode()], profile, 'OnShiftEnter', context);
				  	});
				  	jQuery(wrapper.editor.win.document.body).keyup(function(e) {
						  ajaxart.writevalue(text, [wrapper.editor.getCode()]);
				  	});
				  	wrapper.jbInsertText = function(text) {
					  var pos = editor.cursorPosition();
					  editor.insertIntoLine(pos.line,pos.character,text);
				  	}
				  	
				  	if (aa_bool(data,profile,'Resizer',context)) {
				  		setTimeout(function() {
				  		  jBart.addResizer(editor.frame.parentNode,{
				  			  onResizeEnd: function(width,height) {
				  			  	jBart.vars.codeMirrorSizes[identifier] = jBart.vars.codeMirrorSizes[identifier] || {};
				  			    jBart.vars.codeMirrorSizes[identifier].width = width;
				  			    jBart.vars.codeMirrorSizes[identifier].height = height;
				  		  	  }
				  		  });
				  		},20);
				  	}
				  	wrapper.jbSetDialogReady();
					} catch(e) {
						ajaxart.logException(e,'init callback of codemirror');
					}
				}
		}
		window.OnCodeMirrorLoaded = function(codeMirror) {
			CodeMirror.fromTextArea(textArea, settings);
		}

		aa_addOnAttach(wrapper,function() {
			if (!jBart.vars.codemirror_js_script_elem_exists) {  
				jBart.vars.codemirror_js_script_elem_exists = true;
				aa_load_js_css(base_lib + 'js/codemirror.js','js');
//				aa_load_js_css(base_lib + 'css/docs.css','css');
			}
			else if (window.CodeMirror)
				CodeMirror.fromTextArea(textArea, settings);
		});

		aa_addOnDetach(wrapper,function() {
			if (!window.CodeMirror || !wrapper.editor) return;
			ajaxart.writevalue(data, [wrapper.editor.getCode()]); // Todo replace newlines
			ajaxart.run(data, profile, 'OnUpdate', aa_ctx( context, {ControlElement:[wrapper]} )); 
		});

		jQuery(wrapper).addClass('aa_dialog_not_ready');
		wrapper.jbSetDialogReady = function() {
			jQuery(wrapper).removeClass('aa_dialog_not_ready');
			aa_fixTopDialogPosition();
		}

		return [wrapper];
	},
	CodeMirrorTextarea: function (profile,data,context) {
		// return [ aa_codemirror({}) ];
		var text = ajaxart.run(data,profile,'Text',context);
		var type = aa_text(data,profile,'Type',context); 
		var width = aa_text(data,profile,'Width',context);
		var height = aa_text(data,profile,'Height',context);
		var useResizing = aa_bool(data,profile,'Resizer',context);
		var autoIntent = aa_bool(data,profile,'AutoIndent',context);
		if (useResizing) {
		  var identifier = aa_text(data,profile,'IdentifierToRecallLastSize',context);
		  jBart.vars.codeMirrorSizes = jBart.vars.codeMirrorSizes || {};
		  var lastSize = jBart.vars.codeMirrorSizes[identifier];
		  if (lastSize) {
			  width = lastSize.width + 'px';
			  height = lastSize.height + 'px';
		  }
		}
		var mode = '';
		switch (type) {
			case 'xml': mode = 'xml'; break;
			case 'js': mode = 'javascript'; break;
			case 'css': mode = 'css'; break;
			case 'html': mode = 'htmlmixed'; break;
		}
		var settings = {
			value: aa_totext(text),
			mode: mode,
			lineNumbers: aa_bool(data,profile,'LineNumbers',context),
			lineWrapping : aa_bool(data,profile,'TextWrapping',context),
		    readOnly: aa_bool(data,profile,'ReadOnly',context),
		    autofocus: aa_bool(data,profile,'AutoFocus',context),
		    height: height,
		    width: width,
            extraKeys: {
	        	"Ctrl-Enter": function(editor) {
	        		ajaxart.run([editor.getValue()], profile, 'OnCtrlEnter', context);
	        	},
	        	"Shift-Enter": function(editor) {
	        		ajaxart.run([editor.getValue()], profile, 'OnShiftEnter', context);	
	        	},
	            "Ctrl-I": function(editor) { 
	              var cursorPos = editor.getCursor(true);
	              var range;
	              if (editor.somethingSelected())
	                range = { from: editor.getCursor(true), to: editor.getCursor(false) };
	              else
	                range = { from: {line:0,ch:0}, to: {line:editor.lineCount()-1, ch:editor.getLine(editor.lineCount()-1).length-1} };
	              editor.autoFormatRange(range.from, range.to);
	              editor.setCursor(cursorPos);
	              editor.setSelection(cursorPos);
		        } 
            },
            onchange: function(editor) {
				ajaxart.writevalue(text, editor.getValue()); 
				ajaxart.run(text, profile, 'OnUpdate', aa_ctx( context, {ControlElement:[wrapper]} )); 
			},
			oninit: function(editor) {
				if (autoIntent) {
					editor.autoFormatRange({line:0,ch:0}, {line:editor.lineCount()-1, ch:editor.getLine(editor.lineCount()-1).length-1} );
					editor.setSelection(editor.getCursor(true));
				}
			  	if (aa_bool(data,profile,'Resizer',context)) {
			  		setTimeout(function() {
			  		  jBart.addResizer(wrapper,{
			  			  onResize: function(width,height) {
			  			  	jBart.vars.codeMirrorSizes[identifier] = jBart.vars.codeMirrorSizes[identifier] || {};
			  			    jBart.vars.codeMirrorSizes[identifier].width = width;
			  			    jBart.vars.codeMirrorSizes[identifier].height = height;
			  			    editor.setSize(width,height);
			  		  	  }
			  		  });
			  		},20);
			  	}
			}
		};

		if (aa_bool(data,profile,'ShowJavascriptErrorsOnCtrlSpace',context) && mode == 'javascript')
			aa_showJsErrorsOnCodeMirror(settings);

		if (aa_bool(data,profile,'EnableFullScreen',context))
			aa_enableFullScreenForCodeMirror(settings);

		var wrapper = aa_codemirror(settings);
		jQuery(wrapper).addClass( aa_attach_global_css( aa_text(data,profile,'Css',context),null,'codemirror_wrapper' ) );
		return [wrapper];
	}
}

function aa_codemirror(settings)
{
	if (!window.jBartCodeMirrorLoadingObj) {	// loading phase: only until all js are loaded we can init the code-mirror
		window.jBartCodeMirrorLoadingObj = {
			loaded: false,
			load: function() {
				// aa_load_js_css(aa_base_lib() + '/codemirror-3.02' + '/theme/solarized.css','css');
				// var load_list = ['/lib/codemirror.js', '/mode/css/css.js', '/mode/xml/xml.js', '/mode/javascript/javascript.js', '/mode/htmlmixed/htmlmixed.js', '/addon/hint/simple-hint.js', '/addon/hint/xml-hint.js', '/addon/hint/javascript-hint.js'];
				aa_load_js_css(aa_base_lib() + '/codemirror-3.02/codemirror.css','css');
				aa_load_js_css(aa_base_lib() + '/codemirror-3.02/simple-hint.css','css');
				aa_load_js_css(aa_base_lib() + '/codemirror-3.02/solarized.css','css');
				aa_load_js_css(aa_base_lib() + '/codemirror-3.02/dialog.css','css');

				jQuery.getScript( aa_base_lib() + '/codemirror-3.02/codemirror4jbart.js', function() {
					window.jBartCodeMirrorLoadingObj.onload();
				});
			},
			onload: function() {
				jBart.trigger(this, "OnLoad");
				this.loaded = true;
			},
			runWhenLoaded: function(callBack) {
				if (this.loaded) callBack();
				else jBart.bind(this, "OnLoad", callBack);
			}
		};
		window.jBartCodeMirrorLoadingObj.load();
	}
	var wrapper = document.createElement('div');
	jQuery(wrapper).css( { height: settings.height, width: settings.width });	// to give the right size untill code mirror is loaded
	settings.extraKeys = settings.extraKeys || {};
	settings.extraKeys["Ctrl-Space"] = function(cm) {
    	if (settings.mode == 'javascript')
			CodeMirror.simpleHint(cm, CodeMirror.javascriptHint); 
	};
	settings.extraKeys["Ctrl-H"] = 'replace';
	aa_addOnAttach(wrapper, function() {
		window.jBartCodeMirrorLoadingObj.runWhenLoaded(function() {
			var editor = CodeMirror(wrapper, settings);
			editor.setSize(settings.width, settings.height);
			wrapper.style.height = '';
			wrapper.style.width = '';
			if (settings.onchange)
				editor.on("change", settings.onchange); 
			editor.setOption("theme", "solarized light");
			
			// jQuery(wrapper).removeClass('aa_dialog_not_ready');
			wrapper.jbCodeMirrorEditor = editor;
			aa_fixTopDialogPosition();	// Sometimes the dialog position changes becuase of codemirror size
			editor.refresh();			// When codemirror in open and not visible, it needs a refresh when becomes visible

			if (settings.oninit)
				settings.oninit(editor);
		});
	} );

	// jQuery(wrapper).addClass('aa_dialog_not_ready');	// marking the dialog as not ready to wait for code mirror to load
	return wrapper;	
};

function aa_enableFullScreenForCodeMirror(cmSettings, settings) {
	settings = settings || {};
	jQuery.extend(settings, {
		escText: "<span>Press ESC or F11 to exit full screen</span>",
		escCss: '#this { cursor:default; text-align: center; width: 100%; position:absolute; top:0px; left:0px; font-family: arial; font-size: 11px; color: #a00; padding: 2px 5px 3px; } #this:hover { text-decoration: underline; }',
		escHeight: 20,
		fullScreenBtnHtml: '<div><img title="Full Screen (F11)" src="http://png-1.findicons.com/files/icons/1150/tango/22/view_fullscreen.png"/></div>',
		fullScreenBtnCss: "#this { position:absolute; bottom:5px; right:5px; -webkit-transition: opacity 1s; z-index: 20; } #this.hidden { opacity:0; } ",
		editorCss: "#this { position:relative; }",
		fullScreenEditorCss: "#this { display: block; position: fixed !important; top: 0; left: 0; z-index: 9999; }",
		lineNumbers: true
	});
	var prevOnInit = cmSettings.oninit;
	var prevOverflow = document.documentElement.style.overflow;
	cmSettings.oninit = function(editor) {
		if (prevOnInit) prevOnInit(editor);
		var jEditorElem = jQuery(editor.getWrapperElement()).addClass(aa_attach_global_css(settings.editorCss));
		var prevLineNumbers = editor.getOption("lineNumbers");
		var jFullScreenButton = jQuery(settings.fullScreenBtnHtml).addClass(aa_attach_global_css(settings.fullScreenBtnCss)).appendTo(jEditorElem)
			.addClass('hidden').click( function() { switchMode(); } );
		jEditorElem.
			mouseover( function() { jFullScreenButton.removeClass('hidden'); }).
			mouseout(  function() { jFullScreenButton.addClass('hidden'); });
		var fullScreenClass = aa_attach_global_css(settings.fullScreenEditorCss + "#this { padding-top: " + settings.escHeight + "px; }");
		function onresize() {
			var screen_size = ajaxart_screen_size();
			editor.setSize(screen_size.width,screen_size.height - settings.escHeight);
			// jEditorElem.height( aa_document_height() + 'px' );
		}
		function switchMode(onlyBackToNormal) {
			if (jEditorElem.hasClass(fullScreenClass))	{
				jEditorElem.removeClass(fullScreenClass);
				window.removeEventListener('resize',onresize);
				document.documentElement.style.overflow = prevOverflow;
				editor.setOption("lineNumbers",prevLineNumbers);
				editor.setSize( cmSettings.width, cmSettings.height );
				editor.refresh();
				jEditorElem[0].jEsc.remove();
			} else if (!onlyBackToNormal) {
				jEditorElem.addClass(fullScreenClass);
				window.addEventListener('resize',onresize);
				onresize();
				document.documentElement.style.overflow = "hidden";
				if (settings.lineNumbers) 
					editor.setOption("lineNumbers",true);
				editor.refresh();
				var jEsc = jQuery(settings.escText).addClass(aa_attach_global_css(settings.escCss)).click( function() { switchMode(true) } );
				jEditorElem.append(jEsc);
				jEditorElem[0].jEsc = jEsc;
				editor.focus();
			}
		}
		editor.addKeyMap({
			"F11": function(editor) { switchMode();	},
			"Esc": function(editor) { switchMode(true); } });
	}
}
function aa_showJsErrorsOnCodeMirror(cmSettings, settings) {
	var errorCss = (settings && settings.errorCss) ? settings.errorCss :
			"#this { font-family: arial; font-size: 10px; background: #ffa; color: #a00; padding: 2px 5px 3px; }" +
			"#this .icon { color: white; background-color: red; font-weight: bold; border-radius: 50%; padding: 0 3px; margin-right: 7px;}";

	var prevOnChange = cmSettings.onchange;
	cmSettings.onchange = function(editor) {
		if (prevOnChange) prevOnChange(editor);
		// cleaning error on every change
		editor.jbWidgets = editor.jbWidgets || [];
	    for (var i = 0; i < editor.jbWidgets.length; ++i)
	      editor.removeLineWidget(editor.jbWidgets[i]);	
	}
	cmSettings.extraKeys = cmSettings.extraKeys || {};
	var prevCtrlEnter = cmSettings.extraKeys["Ctrl-Enter"];
	cmSettings.extraKeys["Ctrl-Enter"] = function(editor) {
		editor.jbWidgets = editor.jbWidgets || [];
	    for (var i = 0; i < editor.jbWidgets.length; ++i)
	      editor.removeLineWidget(editor.jbWidgets[i]);	
		jBart.onJsError = function(e, js) {	  
			if (js != editor.getValue()) return;	// not our error
			var stack = e.stack;
			var message = stack.split("\n")[0];
			var line = stack.match(/<anonymous>:([0-9]+)/);
			if (line && line.length>1) line = parseInt(line[1]);
			line = line || 1;

		    var jText = $('<span class="text"></span>').text(message);
		    var jErr = $('<div><span class="icon">!</span></div>').append(jText).addClass( aa_attach_global_css(errorCss) );

		    editor.jbWidgets.push(editor.addLineWidget(line-1, jErr[0], {coverGutter: false, noHScroll: true, above: true}));
		}
		if (prevCtrlEnter) prevCtrlEnter(editor);
		jBart.onJsError = null;
	}
}



//AA BeginModule
aa_gcs("xtml", {
  Profile: function (profile,data,context)
  {
	return [profile.parentNode];
  },

  RunXtmlByComponentId: function (profile,data,context)
  {
	  var id = aa_text(data,profile,'ComponentID',context);
	  if (id == '') return [];
	  var input = ajaxart.run(data,profile,'Input',context);
	  return aa_run_component(id, input, context);
  },
  RunDynamicText: function (profile,data,context)
  {
	  var text = aa_text(data,profile,'Text',context);
	  var relevant_context = aa_first(data,profile,'Context',context);
	  if (relevant_context == null)
		  relevant_context = context;
	  var relevant_data = ajaxart.run(data,profile,'Input',context);
	  if (relevant_data == null)
		  relevant_data = data;
	  if (relevant_context == null) return [];
	  return ajaxart.dynamicText(relevant_data,text,relevant_context);
  },
  RunXtmlAsBoolean: function (profile,data,context)
  {
	  var xtml = ajaxart.run(data,profile,'Xtml',context);
	  var emptyAsTrue = aa_bool(data,profile,'EmptyAsTrue',context);
	  
	  if (xtml.length == 0) return [];
	  
	  var method = "";
	  if (profile.getAttribute('Method') != null) // || ajaxart.childElem(profile,'Method') != null)
		  method = aa_text(data,profile,'Method',context); 
	  
	  var field = "";
	  if (profile.getAttribute('Field') != null) // || ajaxart.childElem(profile,'Field') != null)
		  field = aa_text(data,profile,'Field',context);
	  
	  var input = data;
	  if (profile.getAttribute('Input') != null || ajaxart.childElem(profile,'Input') != null)
		  input = ajaxart.run(data,profile,'Input',context);

//	  if (typeof(xtml[0])=="function") {
//		  var text = aa_totext(xtml[0](input,context));
//		  var bool = aa_text2bool(text);
//		  return (bool) ? ["true"] : [];
//	  }
	  
	  if (xtml[0].script != null) // typeof(xtml[0].script) != "undefined")	// xtml containing script and context
	  {
		  if (emptyAsTrue)
			  if (xtml[0].script.getAttribute(field) == null && ajaxart.xml.xpath(xtml[0].script,field).length == 0)
				  return ["true"];

		  if (typeof(xtml[0].input) != "undefined")
			  if (! aa_bool(data,profile,'ForceInputParam',context) )
				  input = xtml[0].input;
		  
		  var newContext = ajaxart.newContext();
		  
		  if (xtml[0].context != null) { // the xtml object comes with its own context
			  newContext.params = xtml[0].context.params;
			  newContext.componentContext = xtml[0].context.componentContext;
		  } 
		  newContext.vars = context.vars;
		  if (xtml[0].objectForMethod)
			  newContext._This = xtml[0].objectForMethod[0];
		  
		  if (! ajaxart.isxml(xtml[0].script)) {
			  ajaxart.log("RunXtml trying to run script not in xml");
			  return [];
		  }
		  var result = aa_bool(input,xtml[0].script,field,newContext,method);
		  if (result) return ["true"]; else return [];
	  }
	  
	  if (! ajaxart.isxml(xtml[0])) return emptyAsTrue ? ["true"] : [];
	  if (emptyAsTrue)
		  if (xtml[0].getAttribute(field) == null && ajaxart.xml.xpath(xtml[0],field).length == 0)
			  return ["true"];
	  
	  /* var newContext = ajaxart.clone_context(context);	// SLOW. is done because of $InputForChanges - find a way to fix that  
	   */
	  var newContext = {};
	  newContext.vars = context.vars;
	  newContext.componentContext = context.componentContext;
	  newContext.params = [];
	  
	  var result = aa_bool(input,xtml[0],field,newContext,method);
	  if (result) return ["true"]; else return [];
  },
  RunXtmlWithFullContext: function (profile,data,context)
  {
	  var xtml = aa_first(data,profile,'XtmlAndContext',context);
	  if (xtml == null) return [];
	  
	  var preview = aa_bool(data,profile,'InPreviewMode',context);
	  if (preview) ajaxart.inPreviewMode = true;
	  var input = xtml.input;
	  if (input == null || typeof(input) == 'undefined') input = [];
	  var out = ajaxart.run(input,xtml.script,'',xtml.context);
	  if (preview) ajaxart.inPreviewMode = false;
	  
	  return out;
  },
  UseParamAsBoolean: function (profile,data,context)
  {
	  var param = aa_text(data,profile,'Param',context); 
	  var input = ajaxart.run(data,profile,'Input',context);
	  
	  var paramScript = context.params[param];
	  if (ajaxart.isArray(paramScript)) // script='false'
		  return paramScript;
	  
	  if (paramScript == null || paramScript.script == null) return [];
	  if (paramScript.compiled == "same") return input;
	  
	  // if we're here we are in script=true
	  
	  var newContext = {};
	  newContext.vars = context.vars;
	  newContext.params = context.componentContext.params;
	  newContext.componentContext = context.componentContext.componentContext;
	  
	  if (paramScript.compiled == null)
		  return aa_bool(input,paramScript.script,"",newContext);
	  else  
		  return aa_text2bool( aa_totext(paramScript.compiled(input,newContext)) );
  },
  UseParamExcludeVariable: function (profile,data,context)
  {
	  var param = aa_text(data,profile,'Param',context); 
	  var excludeVar = aa_text(data,profile,'ExcludeVariable',context);
	  
	  var paramScript = context.params[param];
	  if (paramScript == null || paramScript.script == null) return [];

  	  var newContext = ajaxart.newContext();
	  for (i in context.vars) {
		  if (i != excludeVar)
		    newContext.vars[i] = context.vars[i];
	  }
	  newContext.params = context.componentContext.params;
	  newContext.componentContext = context.componentContext.componentContext;

	  return ajaxart.run(data,paramScript.script,"",newContext);	  
  },
  ParamEmpty: function (profile,data,context)
  {
	  var paramName = aa_text(data,profile,'Param',context); 
	  var param = ajaxart.getVariable(context,paramName);
	  if (param == null) return ["true"];
	  if (typeof(param.script) != "undefined" || param.length > 0) return [];
	  
	  return ["true"];
  },
  ParamsWithChanges: function (profile,data,context)
  {
	  var orig = aa_first(data,profile,'Params',context);
	  var overrides = ajaxart.gcs.xtml.Params(profile,data,context)[0];
	  var out = { isObject: true };
	  for(var i in orig)
		  out[i] = orig[i];
	  for(var i in overrides)
		  out[i] = overrides[i];
	  
	  return [out]; 
  },
  CopyAllParams: function (profile,data,context)
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
  ScriptParamArrayContents: function (profile,data,context)
  {
	  var param = aa_text(data,profile,'Param',context);
	  var paramValue = context.params[param];
	  if (typeof(paramValue)=="undefined" || ! ajaxart.isArray(paramValue) ) return [];
	  out = [];
	  for(var i=0;i<paramValue.length;i++)
		out.push({ script: paramValue[i] , context: context.componentContext });  

	  return out;
  },
  Xtml: function (profile,data,context)
  {
	  var xtml = ajaxart.run(data,profile,'Xtml',context);
	  var input = ajaxart.run(data,profile,'Input',context);
	  var definedContext = aa_first(data,profile,'Context',context);
	  
	  if (xtml.length==0) return [];
	  var out = {};
	  if (typeof(xtml[0].script) != "undefined") {
		  for(i in xtml[0]) out[i] = xtml[0][i];
	  }
	  else
	    out = { isObject: true, script: xtml[0] , context: context.componentContext };

	  if (definedContext != null ) out.context = definedContext;
	  if (out.context == null) out.context = ajaxart.newContext();

	  // put resources as vars as well
	  if (context.vars._GlobalVars && ! aa_tobool(context.vars._DisableResourcesAsVars) ) {
		  out.context.vars._GlobalVars = context.vars._GlobalVars;
	  }
	  if (input.length>0)
		  out["input"] = input;
	  
	  return [out];
  },
  ToScript: function (profile,data,context)
  {
	  data = ajaxart.run(data,profile,'Xtml',context);
	  if (data.length == 0) return [];
	  if (typeof(data[0].script) == "undefined") return [];
	  return [ data[0].script ];
  },
  ToInput: function (profile,data,context)
  {
	  if (data.length == 0) return [];
	  if (typeof(data[0].input) == "undefined") return [];
	  return data[0].input;
  },
  VariableValue: function (profile,data,context)
  {
	  var varName = aa_text(data,profile,'VarName',context);
	  
	  if (ajaxart.serverData[varName] != null) return ajaxart.serverData[varName]; 
  	  var out = context.vars[varName];
	  if (out == null || typeof(out) == "undefined") return [];
	  return out;
  },
  UsagesOfPlugin: function (profile,data,context)
  {
	  var plugin = aa_text(data,profile,'Plugin',context);
	  
	  var out = [];
		for (_plugin in ajaxart.usages)
			if (plugin == "" || plugin == _plugin) {
				for (usage in ajaxart.usages[_plugin])
					out.push(ajaxart.usages[_plugin][usage]);
			}
	  return out;
  },
  ComponentsOfPlugin: function (profile,data,context)
  {
  	var plugin = aa_text(data,profile,'Plugin',context);
  	var type = aa_text(data,profile,'Type',context);
  	var resultType = aa_text(data,profile,'Result',context);
  	var alsoHidden = aa_bool(data,profile,'AlsoHidden',context);
  	if (plugin.length == 0) return [];
  	
  	var out = [];
  	var plugin_obj = ajaxart.components[plugin];
  	for (i in plugin_obj)
  	{
  		if (type.length > 0 && type != plugin_obj[i].getAttribute('type'))
  			continue;

  		if (! alsoHidden && "true" == plugin_obj[i].getAttribute('hidden'))
  			continue;
  		
  		if (resultType == "full id")
  			out.push(plugin + "." + i);
  		else
  			out.push(plugin_obj[i]);
  	}
  	return out;
  },
  LoadedPlugins: function (profile,data,context)
  {
	var includeUsages = aa_bool(data,profile,'IncludeUsages',context);
	
  	var list = {};
		var out = [];
		for (i in ajaxart.components) {
			if (!includeUsages && i.indexOf("usage",i.length-5) != -1) continue;
			out.push(i);
			list[i] = true;
		}
		if (includeUsages)
		{
			for (i in ajaxart.usages)
				if (list[i] == null) {
					out.push(i);
					list[i] = true;
				}
		}
		return out;
  },
  LoadComponents: function (profile,data,context)
  {
	  var ns = aa_text(data,profile,'Namespace',context);
	  var comps = ajaxart.run(data,profile,'Components',context);
	  
	  if (ajaxart.components[ns] == null || aa_bool(data,profile,'ClearNSBefore',context) ) ajaxart.components[ns] = [];
	  
	  for(var i=0;i<comps.length;i++)
	  {
		  if (! ajaxart.isxml(comps[i])) continue; 
	      ajaxart.components[ns][comps[i].getAttribute("id")] = comps[i];
	      aa_load_inplace_gc(comps[i],ns);
	  }
	  
	  ajaxart.componentsXtmlCache = [];
	  window.aaxtmldt_options_cache = window.ajaxart_light_compoftype = window.ajaxart_comp_of_type_cache = null;
	  
	  return ["true"];
  },
  PluginDescriptor: function (profile,data,context)
  {
  	var plugin_name = aa_text(data,profile,'Plugin',context);
  	var plugin = ajaxart.plugins[plugin_name];
  	if (typeof(plugin) == "undefined")
  		return [];
  	return [plugin];
  },
  AllTypes: function (profile,data,context)
  {
	  var out = [];
	  for(var i in ajaxart.types) {
		  var ns = ajaxart.types[i].parentNode.getAttribute('ns');
		  if (ns == null) ns = ajaxart.types[i].parentNode.getAttribute('id');
		  var id = ajaxart.types[i].getAttribute('id');
		  var text = ns + "." + id;
		  out.push(text);
	  }
	  return out;
  },
  TypeDefinition: function (profile,data,context)
  {
  	var type = aa_text(data,profile,'Type',context);
  	type = type.replace("\.","_");
  	var typeobj = ajaxart.types[ type ];
  	if (typeobj == null)
  		return [];
  	return [typeobj];
  },
  ServerDataVariables: function (profile,data,context)
  {
	  var out = [];
	  for(varName in ajaxart.serverData)
		  out.push(varName);
	  return out;
  },
  GlobalVariables: function (profile,data,context)
  {
  	var out = [];
  	if (context.vars._GlobalVars)
		for(var i in context.vars._GlobalVars[0])
			out.push(i);
	return out;
  },
  DebugVariableValue: function (profile,data,context)
  {
	  var varName = aa_text(data,profile,'Variable',context);
	  if (varName == "") return [];
	  if ( ajaxart.debugData && ajaxart.debugData[varName] != null) return ajaxart.debugData[varName];
	  return [];
  },
  DebugDataVariables: function (profile,data,context)
  {
	  var out = [];
	  for(varName in ajaxart.debugData)
		  out.push(varName);
	  return out;
  },
  VariablesOfContext: function (profile,data,context)
  {
	  var scriptAndContext = aa_first(data,profile,'ScriptAndContext',context);
	  var out = [];
	  var ctx;
	  if (scriptAndContext != null && 'context' in scriptAndContext)
		  ctx = scriptAndContext.context;
	  else
		  return [];
	  for(varName in ctx.params)
		  out.push(varName);
	  for(varName in ctx.vars) {
		  if (varName != '_GlobalVars')
		    out.push(varName);
		  else {
			  var gvars = ctx.vars._GlobalVars[0];
			  for(varName2 in gvars) out.push(varName2);
		  }
	  }
	  for(varName in ajaxart.serverData)
		  out.push(varName);
	  return out;
  },
  VariableValueFromContext: function (profile,data,context)
  {
	  var scriptAndContext = aa_first(data,profile,'ScriptAndContext',context);
	  if (!scriptAndContext) return [];
	  var varName = aa_text(data,profile,'Variable',context);
	  if (scriptAndContext.context)
	  {
		  var val = ajaxart.getVariable(scriptAndContext.context,varName);
		  if (val == null)
			  val = [ scriptAndContext.context.params[varName] ];
		  return val;
	  }
	  return [];
  },
  Logs: function (profile,data,context)
  {
	  var out = [];
	  var errors = ajaxart.logs["error"];
	  if (errors) {
		  for(var i in errors)
			  out.push({ isObject:true, Level: "error" , Log: errors[i] });
	  }
	  for (i in ajaxart.logs)
	    if (i != 'error')
	      for(var j in ajaxart.logs[i])
		    out.push({ isObject:true, Level: i , Log: ajaxart.logs[i][j] });
		    
	  return out;
  },
  LogContent: function (profile,data,context)
  {
	  var level = aa_text(data,profile,'Level',context);
	  var out = ajaxart.logs[level];
	  return (out == null) ? [] : out;
  },
  ActiveLogLevels: function (profile,data,context)
  {
	  var out = [];
	  for (i in ajaxart.logs)
		 if (i == 'error') // insert at beginning
			 out = [i].concat(out);
		 else
		  	 out.push(i);
	  return out;
  },
  LoadXtmlFile: function (profile,data,context)
  {
	  var contents = aa_first(data,profile,'Contents',context);
	  if (ajaxart.isxml(contents))
		  ajaxart.load_xtml_content('',contents);
	  return ["true"];
  },
  RunUsage: function (profile,data,context)
  {
	  if (data.length == 0) return data;

	  var result = ajaxart.run([""],data[0],"",context);
	  if (result.length == 0) // success
		  ajaxart.run(data,profile,'OnSuccess',context);
	  else
		  ajaxart.run(data,profile,'OnFailure',context);
	  ajaxart.run(data,profile,'OnFinish',context);
  },
  CleanLog: function (profile,data,context)
  {
	  var cleanAllLogs = aa_bool(data,profile,'CleanAllLogs',context);
	  var level = aa_text(data,profile,'Level',context);
	  if (cleanAllLogs)
		  logs = {};
	  else if (level != "")
		ajaxart.logs[level] = [];
	  
	  return data;
  },
  AllComponentIds: function (profile,data,context)
  {
	  var out = [];
	  for (plugin in ajaxart.components)
		  for (j in ajaxart.components[plugin])
			  out.push( plugin + "." + ajaxart.components[plugin][j].getAttribute("id") );
	  return out;
  },
  ComponentIdsOfType: function (profile,data,context)
  {
	  var type = aa_text(data,profile,'Type',context);
	  var out = [];
	  for (plugin in ajaxart.components)
		  for (j in ajaxart.components[plugin]) {
			  	if (ajaxart.components[plugin][j].getAttribute("type") == type)
			  		out.push( plugin + "." + ajaxart.components[plugin][j].getAttribute("id") );
		  }
	  return out;
  },
  PartsOfContext: function (profile,data,context)
  {
	  var ctx = aa_first(data,profile,'Context',context);
	  if (ctx == null) return [];
	  var part = aa_text(data,profile,'Part',context);
	  var out = [];
	  if (part == "Global Variable Names") {
		  if (!ctx.vars._GlobalVars) return [];
		  for(var j in ctx.vars._GlobalVars[0]) { if (j!='isObject' && j!='XtmlSource') out.push(j); }
	  }
	  if (part == "Variable Names") {
			for (i in ctx.vars) {
				if (i != "_GlobalVars") out.push(i);
				else for(j in ctx.vars._GlobalVars[0]) { if (j!='isObject' && j!='XtmlSource') out.push(j); }
			}
	  } else if (part == "Param Names") {
			for (i in ctx.params) 
				out.push(i);
	  } else if (part == "Component Context")
		  return [ ctx.componentContext ];
	  return out;
  },
  CurrentContext: function (profile,data,context)
  {
	  return [ context ];
  },
  ManualContext: function (profile,data,context)
  {
	  var vars = ajaxart.run(data,profile,'Variables',context);
	  var out = ajaxart.newContext();
	  for(var i=0;i<vars.length;i++)
		  ajaxart.setVariable(out, vars[i]["Name"], vars[i]["Value"] );
	  return [out];
  },
  BuildVersion: function (profile,data,context)
  {
	  return [ajaxart.build_version];
  },
  XtmlOfParamArray: function (profile,data,context)
  {
	  var param = aa_text(data,profile,'Param',context); 
	  var paramScript = context.params[param];
	  if (ajaxart.isArray(paramScript)) return []; // script='false'

	  return aa_xpath(paramScript.script,param);
  }
});
//AA EndModule

if (!ajaxart.xtml) ajaxart.xtml = {};
ajaxart.run_xtml_object = function(data,xtmlObject,context)
{
	  var newContext = ajaxart.newContext();
	  
	  if (xtmlObject.context != null) { // the xtml object comes with its own context
	  	  newContext.params = xtmlObject.context.params;
	  	  newContext.componentContext = xtmlObject.context.componentContext;
	  } 
      newContext.vars = context.vars;
	  if (xtmlObject.objectForMethod)
		  newContext._This = xtmlObject.objectForMethod[0];
	  
	  return ajaxart.run(data,xtmlObject.script,'',newContext);
}
ajaxart.component_exists = function(id)
{
	  var middlePos = id.indexOf('.');
	  var ns = id.substring(0,middlePos);
	  var compName = id.substr(middlePos+1);
	  if (ajaxart.components[ns] == null) return false;
	  if (ajaxart.components[ns][compName] == null) return false;
	  return true;
}
//ajaxart_runMethod = function(data,object,method,context)
//{
//	return ajaxart.runScriptParam(data,object[method],context);
//}
function aa_component_definition(component)
{
	 if (!component) return null;
	 var middlePos = component.indexOf('.');
	 var ns = component.substring(0,middlePos);
	 var compName = component.substr(middlePos+1);
	
	 return ajaxart.components[ns] && ajaxart.components[ns][compName];
}
function aa_component_param_def(component_id,param)
{
	var comp = aa_component_definition(component_id);
	var param = ajaxart.xml.xpath(comp,"Param[@name='"+param+"']");
	if (param.length > 0) return param[0];
	else return null;
}
function aa_component_param_type(component,param)
{
	var type = aa_totext( ajaxart.xml.xpath(component,"Param[@name='"+param+"']/@type") );
	if (type == "") return "data.Data";
	return type;
}




//AA BeginModule
aa_gcs("yesno", {
  EqualsTo: function (profile,data,context)
  {
   var to = ajaxart.run(data,profile,'To',context);
   
   if (to.length == 0 && data.length == 0) return ["true"];
   if (to.length == 0 || data.length == 0) return [];
   
   var to_comp = to[0];
   var data_comp = data[0];
   
   if ( ajaxart.yesno.itemsEqual(to_comp,data_comp) ) return ["true"];
   return [];
  },
  BooleansEqual: function (profile,data,context)
  {
	  var item1 = aa_bool(data,profile,'Item1',context);
	  var item2 = aa_bool(data,profile,'Item2',context);
	  if (item1 == item2) return ["true"];
	  return [];
  },
  IsOneOf: function (profile,data,context)
  {
	  var val = aa_first(data,profile,'Value',context);
	  var optionProfs = ajaxart.subprofiles(profile,'Option');
	  
	  if (val == null) return [];
	  
	  for(var i in optionProfs)
	  {
		  var options = ajaxart.run(data,optionProfs[i],'',context);
		  for (var j in options)
			  if ( ajaxart.yesno.itemsEqual(val,options[j]) ) return ["true"];
	  }
	  return [];
  },
  EqualsToList: function (profile,data,context)
  {
	  var list = ajaxart.run(data,profile,'To',context);
	  if (list.length != data.length) return [];
	  
	  for(var i=0;i<list.length;i++)
	  {
		  if (! ajaxart.yesno.itemsEqual(list[i],data[i]))
			  return [];
	  }
	  return ["true"];
  },
  GreaterThan: function (profile,data,context)
  {
	  var type = aa_text(data,profile,'Type',context);
	  if (type == 'number')
		  return aa_int(data,profile,'Item',context) > aa_int(data,profile,'Than',context) ? ['true'] : [];
	  if (type == 'text')
		  return aa_text(data,profile,'Item',context) > aa_text(data,profile,'Than',context) ? ['true'] : [];
	  if (type == 'date')
		  return aadate_date2int(aa_text(data,profile,'Item',context)) > aadate_date2int(aa_text(data,profile,'Than',context)) ? ['true'] : [];
	  return [];
  },
  DynamicAnd: function (profile,data,context)
  {
	  var items = ajaxart.run(data,profile,'DynamicItems',context);
	  
	  for(var i=0;i<items.length;i++)
	  {
		  if ( ! aa_bool([items[i]],profile,'ConditionOnItem',context) )
			  return [];
	  }
	  return ["true"];
  },
  ContainsRegex: function (profile,data,context)
  {
	var text = aa_text(data,profile,'Text',context);  
	var regex = aa_text(data,profile,'Regex',context);
	
	if (text.search(regex) > -1) return ["true"];
  },
  Contains: function (profile,data,context)
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
  IsInList: function (profile,data,context)
  {
	 var list = ajaxart.run(data,profile,'List',context);
	 var item = aa_first(data,profile,'Item',context);
	 if (item == null) return [];
	 
	 for(var i=0;i<list.length;i++)
	 {
		 if ( ajaxart.yesno.itemsEqual(item,list[i]) ) return ["true"];
	 }
	 return [];
  },
  IsStruct: function (profile,data,context)
  {
	 return  aa_frombool(ajaxart.isObject(data[0]));
  },
  IsXml: function (profile,data,context)
  {
	 if (data.length == 0 ) return [];
	 if (ajaxart.isxml(data[0])) return ["true"];
	 return [];
  },
  VariableExists: function (profile,data,context)
  {
	var varname = aa_text(data,profile,'VarName',context);
	if (! context.vars[varname]) return [];
	return ["true"];
  },
  NotInLocalHost: function (profile,data,context)
  {
	if (window.location.href.indexOf('localhost') > -1) return [];
	return ["true"];
  },
  ConditionByJavascript: function (profile,data,context)
  {
	var code = aa_text(data,profile,'Javascript',context);
	var result = aa_run_js_code(code,data,context);
	if (result == true) return ['true'];
  },
  IsSingleValue: function (profile,data,context)
  {
	  var val = ajaxart.run(data,profile,'Value',context);
	  if (val.length == 1) return ["true"];
	  return [];
  },
  IsMultipleValue: function (profile,data,context)
  {
	  var value = ajaxart.run(data,profile,'Value',context);
	  if (value.length > 1) return ["true"];
	  return [];
  },
  NumberInRange: function (profile,data,context)
  {
	  var from = aa_float(data,profile,'From',context);
	  var to = aa_float(data,profile,'To',context);
	  var num = parseFloat(data[0].toString());
	  if (num >= from && num <= to ) return ["true"];
	  return [];
  },
  NotAnyOf: function (profile,data,context)
  {
	    var subprofiles = ajaxart.subprofiles(profile,'Item');
	    
		for(var i=0;i<subprofiles.length;i++)
		{
	  		if ( aa_bool(data,subprofiles[i],"",context) )
	  			return [];
	  	};
	  	return ["true"];
  },
  PassesCondition: function (profile,data,context)
	{
	  return aa_bool(data,profile,'Expression',context);
	},
  IsWritableText: function (profile,data,context)
  {
		if (ajaxart.isxml(data)) return ["true"];
		return [];
  },
  IsNumber: function (profile,data,context)
  {
	  var value = aa_text(data,profile,'Value',context);
	  if (value == "") return [];
	  if (! isNaN(Number(value))) return ["true"];
	  return [];
  }
  
});
//AA EndModule

if (!ajaxart.yesno) ajaxart.yesno = {};

function aa_textInList(text,list)
{
  for(var i=0;i<list.length;i++)
	  if (text == list[i]) return true;
  return false;
}
