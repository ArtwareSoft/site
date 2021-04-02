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

