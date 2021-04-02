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
jBartPreloader = function(finished) {
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


window.jBartWidgets = window.jBartWidgets || { vars: {} };
var jBart = { vars: {}, api: {}, utils: {}, dialogs: {}, bart: {}, db: {} }
var ajaxart = { 
	debugmode: false, trace_level: 2, // 0-input output, 1-also variables, 2-nested values
    xtmls_to_trace: [], traces: [], components: [], componentsXtmlCache: [], usages: [], types: [], plugins: [], gcs: {}, 
    log_str: '', loading_objects: 0, logs: {}, default_values: [], inPreviewMode: false, stack_trace: [], build_version: 'ART_NOW', 
    xml: {}, cookies: {}, ui: {}, yesno: {}, dialog: { openPopups: []}, xmlsToMonitor: [], lookup_cache: {}, occurrence_cache: {}, 
    unique_number: 1, action: {}, runningTimers: {}, runDelayed: [],
  	base_lib: '//jbartlib.appspot.com/lib', base_images: '//jbartlib.appspot.com/images',
  	STRING_WITH_EXP: /%[^ ,;\(\)]/,
  	NOT_EXP: /^[ ,;\(\)]/,

run: function(data,script,field,context,method,booleanExpression) 
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
		     out[0].XtmlSource = [{ script: field_script , input: data, context: context }];
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
},
compile_text: function (script, field ,context) {
	var fieldscript = ajaxart.fieldscript(script,field,true);
	if (fieldscript == null) return function() { return ''};
	
	if (fieldscript.nodeType == 2) { 
		var value = fieldscript.nodeValue;
		if (value == "%%" ) return function(data1) { return aa_totext(data1) };
		if (!value.match(ajaxart.STRING_WITH_EXP)) // no vars
		  return function() { return value };
	
		var att = value.match(/^%@([^%]+)%$/);
		if (att) 
			return function(data) { return data[0].getAttribute(att[1]) || ''; };
	}

	return function(data,ctx) { return aa_text(data,script,field,ctx); };  // the default - no compile
},
compile: function (script, field ,context,paramVars,isReadOnly, bool) {
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
},
fieldscript: function (script, field,lookInAttributes) 
{
	if (!field) return script;
	if (lookInAttributes && aa_hasAttribute(script,field))
		return ajaxart.xml.attributeObject(script,field);
	
	var field_script = ajaxart.childElem(script,field);
	if (!field_script) 
		field_script = aa_get_default_value(script.getAttribute("t"),field);
	return field_script;
},
splitCommasForAggregatorParams: function(params_str)
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
},
runNativeHelperNoParams: function(data,script,helpername,context)
{
	var component = script.getAttribute('t');
	var global = aa_componentById(component);
	if (!global) return [];  // should not happen
	
	var helperXml = ajaxart.xml.xpath(global,'NativeHelper[@name="'+helpername+'"]');
	if (helperXml.length > 0)
		return ajaxart.run(data,helperXml[0],"",context);

	ajaxart.log("calling runNativeHelper for none existing helper - " + helpername);
	return [];
},
runNativeHelper: function(data,script,helpername,context)
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
},
dynamicTextWithAggregator: function(item,str,context)
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
},
dynamicText: function(data,str,context,origData,booleanExpression,xmlescape) 
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
                	if (! item_to_add.match(/^([0-9]+|[0-9]*\.[0-9]+)$/) )
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
},
newContext: function() {
	return { vars: {_Images: [aa_base_images()] ,_Lib: [aa_base_lib()]} , params: [] ,componentContext: null};
},
clone_context: function(context)
{
	var new_context = ajaxart.newContext();
	for (i in context.vars) {
		new_context.vars[i] = context.vars[i];
	}
	new_context.params = context.params;
	new_context.componentContext = context.componentContext;
	new_context._This = context._This;
	
	return new_context;
},
setVariable: function(context,varName,varValue)
{
	if (varName == null) return;
	try {
		context.vars[""+varName] = varValue;
	} catch(e) { ajaxart.log("cannot set variable" + varName,"error"); }
},
setParameterVariable: function(context,varName,varValue)
{
	if (varName == null) return;
	try {
		context.params[''+varName] = varValue;
	} catch(e) { ajaxart.log("cannot set param " + varName,"error"); }
},
getVariable: function(context,varName)
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
},
istrue: function(item)
{
	if (!item) return false;
	return (ajaxart.totext(item) == "true");
},
tobool_array: function(arr)
{
	if (arr == null) ;
	return ajaxart.totext_array(arr) == "true";
},
totext_array: function(arr)
{
	if (arr == null || arr.length == 0) return '';
	return ajaxart.totext_item(arr[0]);
},
totext: function(item) 
{
	if (ajaxart.isArray(item)) return ajaxart.totext_array(item);
	return ajaxart.totext_item(item);
},
totext_item: function(item)
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
},
subprofiles: function (profile,field) 
{
  return ajaxart.childElems(profile,field);
},
runsubprofiles: function (data,profile,field,context,trycatch_oneachitem)
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
},
each: function(arr,func)
{
	for(var i=0;i<arr.length;i++)
		func(arr[i],i);
},
load_xtml_content: function(xtml_name,xtml)
{
	if (xtml == null) { 
		alert('could not load xtml ' + xtml_name); 
		if (window.console) console.error('could not load xtml ' + xtml_name); 
		; 
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
},
parsexml: function(contents, filename, errorMsgOut, onlyWarning,baseXml)
{
	if ( ajaxart.isxml(contents) ) {
		if (contents.nodeType == 9) // document
			return contents.firstChild;
		return contents;
	}
	filename = filename || '';
    if ( typeof contents != "string" ) return contents;
    var parsing_error_level = onlyWarning ? 'warning' : 'error';
	if (!contents) { ajaxart.log("cannot parse empty string " + filename,parsing_error_level); return null; }
   	var doc;
 	try {
 	// fix parsing bug that &#xd;-->\r and not \n
 		contents = contents.replace(/&#xa;&#xd;/g, "&#xa;").replace(/&#xd;&#xa;/g, "&#xa;").replace(/&#10;&#13;/g, "&#xa;").replace(/&#13;&#10;/g, "&#xa;");
		if (contents.indexOf('<') > 0)
			contents = contents.substring(contents.indexOf('<'));
		// contents = contents.replace(/&amp;/g, "&#26;");  // fix unescape bug 
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
},
childElem: function(parent,elemName)
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
},

childElems: function(parent,elemName)
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
},

childElemByAttrValue: function(parent,elemName,attrName,attrValue)
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
},
isArray: function(obj) 
{
	return Object.prototype.toString.call( obj ) === '[object Array]';
},
isxml_array: function(arr)
{
	if (arr.length == 0) return false;
	return ajaxart.isxml_item(arr[0]);
},
isxml_item: function(xml)
{
	if (xml == null) return false;
	return (xml.nodeType != null);
},
isxml: function(xml)
{
	if (ajaxart.isArray(xml)) return ajaxart.isxml_array(xml);
	return ajaxart.isxml_item(xml);
},
isObject_array: function(array) {
	return array.length > 0 && ajaxart.isObject(array[0]); 
},
isObject: function(item) {
    if (!item || item.nodeType) return false; 
	var type =  Object.prototype.toString.call(item);
	if (type === '[object Array]' && item.length > 0) 
		return ajaxart.isObject(item[0]);
	return type === '[object Object]';
},
ishtml_array: function(arr)
{
	if (arr.length == 0) return false;
	return ajaxart.ishtml_item(arr[0]);
},
ishtml_item: function(item)
{
	if (!item || !item.ownerDocument || !item.nodeType) return false;
	return (item.body || item.ownerDocument.body) ? true : false;
},
ishtml: function(item)
{
	if (!item) return false;
	if (ajaxart.isArray(item) && item.length > 0) 
		return ajaxart.ishtml_item(item[0]);
	else
		return ajaxart.ishtml_item(item);
},
urlparam: function(strParamName)
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
},
xtmls: null,
xml: {
	append: function(parent,child,asFirst)
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
	},
	attributeObject: function(parent,attrName)
	{
		if ( parent == null || parent.childNodes == null ) return null;
		for(var i=0;i<parent.attributes.length;i++)
		{
			if (parent.attributes.item(i).nodeName == attrName)
				return parent.attributes.item(i);
		}
		return null;
	}
},
trycatch : function(func, whenerror) {
	if (ajaxart.debugmode)
		return func();
	
	try {
		return func();
	} catch(e) {
		if (e == "endless loop") throw e;
		return whenerror(e);
	};
}
};

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
function ajaxart_runcompiled_text(compiledFunc, data, profile, field ,context)
{
	if (compiledFunc == 'same') return ajaxart.totext_array(data);
	if (compiledFunc == null)
		return aa_text(data,profile,field,context);
	else
		return ajaxart.totext_array(compiledFunc(data,context));
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

function aa_totext(data)
{
	if (typeof(data) == "string") return data;
	if (data == null || data.length == 0) return "";
	return ajaxart.totext_item(data[0]);
}
function aa_tobool(data)
{
  if (data == null || data.length == 0) return false;
  if (ajaxart.totext_array(data)=="true") return true;
  return false;
}
function aa_frombool(bool) 
{
  if (bool) return ["true"];
  return [];
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
function aa_first(data,script,field,params,method) {
	var result = ajaxart.run(data,script,field,params,method);
	if (result.length == 0) return null;
	return result[0];
}
function aa_text(data,script,field,params,method,booleanExpression)
{
	if (booleanExpression) 
		return ajaxart.totext(ajaxart.run(data,script,field,params,method,booleanExpression));
	return ajaxart.totext_array(ajaxart.run(data,script,field,params,method,booleanExpression));
}
function aa_int(data,script,field,params,method)
{
	var result = ajaxart.totext_array(ajaxart.run(data,script,field,params,method));
	if (!result) return null;
	return parseInt(result);
}
function aa_float(data,script,field,params,method)
{
	var result = ajaxart.totext_array(ajaxart.run(data,script,field,params,method));
	if (!result) return null;
	return parseFloat(result);
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
function aa_tag(item)
{
	return item.tagName;
}
function aa_hasAttribute(elem,attr)
{
	return elem.getAttribute(attr) != null;
}

function aa_importNode(node, target)
{
	if (target == null) return node;
	if (target.ownerDocument != node.ownerDocument && target.ownerDocument.importNode != undefined)
	  return target.ownerDocument.importNode(node,true);
	return node;
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

function aa_extend(obj,extra) {
	for (var elem in extra)
		obj[elem] = extra[elem];
	return obj;
}
function aa_defaults(obj,extra) {
	for (var elem in extra)
		obj[elem] = obj[elem] || extra[elem];
	return obj;
}

// loading dev
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

aa_extend(ajaxart,{
	load_usage_plugin: function(plugin_name,xtml_name)
	{
	  if ( xtml_name == null)
		  xtml_name = "plugins/"+plugin_name+"/"+plugin_name+"_usage.xtml";
	  
	  
	},
	load_plugin: function(plugin_name,xtml_name)
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
	},
	load_xtml: function(file_name)
	{
	  jQuery.ajax({ url: file_name, cache: false, async: false,
		   success: function (xtml_content) {
		  		var xtml = ajaxart.parsexml(xtml_content, file_name);
		  		ajaxart.load_xtml_content(file_name,xtml);
	  		},
	  		error: function (e){ 
	  			aa_handleHttpError(e,this);
				ajaxart.log("failed loading xtml file " + file_name + "," + e.message,"error"); 
			}
	  }); 
	},
	load_server_data_inner: function(serverDataObj)
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
});

// loading RT
var ajaxart_altPressed = false;
function aa_register_document_events(context) {
	if (jBart.vars.document_events_registered) return;
	jBart.vars.document_events_registered = true;
  	jQuery(document).keydown(function(event) { 
  		if (event.keyCode == 18)
  			ajaxart_altPressed = true;		  		
	  	if (event.keyCode == 192 && event.ctrlKey && !event.shiftKey) { // ctrl+`  (~)
	  		ajaxart.inPreviewMode = false;
	  		if (ajaxart.gcs.debugui)
	  		  aa_run_component("debugui.OpenDebugUi",[],context);
	  	}
	  	if (event.keyCode == 192 && event.ctrlKey && event.shiftKey) { // ctrl+Shift+`  (~)
	  		aa_run_component("debugui.OpenComponent",[],context);
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

aa_extend(ajaxart,{
	start: function(divId,data,script,serverData, scripts,language)
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
			  	aa_register_document_events(context);
//			  	var debugui = ajaxart.run(data,ajaxart.parsexml('<Control t="debugui.HiddenButton" />'),"",context);
			  	
			  	var loading = jQuery("#ajaxart_loading");
			  	if (loading.length > 0 && ! loading[0].IsUsed)
			  		loading.hide();
	    },serverData, scripts);
	  }); 
	},
	ready: function(func, serverDataArray, scripts)
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
	},
	load_server_data:  function(serverDataArray,func)
	{
	  if (serverDataArray.length == 0) 
		  func();
	  else
		  ajaxart.ready(func,serverDataArray);
	},
	object_finished_loading: function()
	{
		var loading_div = jQuery("#ajaxart_loading");
		if (loading_div.length > 0)
			loading_div.html(loading_div.html()+".");
		ajaxart.loading_objects--;
		if (ajaxart.loading_objects == 0 && ajaxart.ready_func != null) 
			  ajaxart.ready_func();
	}
});

// log & trace
function aa_try_probe_test_attribute(script,field,data,out,context,origData)
{
   for (i in ajaxart.xtmls_to_trace)
	   if (ajaxart.xtmls_to_trace[i].xtml.nodeType == 2 && ajaxart.xtmls_to_trace[i].xtml.nodeName == field)
		   if (ajaxart.xml.parentNode(ajaxart.xtmls_to_trace[i].xtml) == script)
			   ajaxart.fill_trace_result(ajaxart.xtmls_to_trace[i].results,data,out,context,origData);
}

function aa_index_of_element(elem)
{
	for (var k=0,e=elem; e = e.previousSibling; ++k);
	return k;
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

aa_extend(ajaxart,{
	logException: function(e,prefix)
	{
		var msg = e.message || e;
		if (e.stack) {
			msg += '\n' + e.stack;
		}
		if (prefix) msg = prefix + ' - ' + msg;
		ajaxart.log(msg,'error');
	},
	log: function(message,type)
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

		if (type=='error' && window.console) console.log('error - ' + log_message);
		if (type == 'error' && ajaxart.jbart_studio) {	// adding error sign
			setTimeout( function() {
				jQuery(".fld_toolbar_errors_sign").removeClass("hidden"),1
			});
		}
	},
	tryShortXmlWithTag: function(xml,attrName)
	{
		if (aa_hasAttribute(xml,attrName))
			return "<" + aa_tag(xml) + " " + attrName + '="' + xml.getAttribute(attrName) + '" .../>';  
	},
	fill_trace_result: function(results, input,output,params,origData)
	{
		var result = { isObject: true, Input: input, Output: output, context:params }
		if (origData != null)
			result.OrigData = origData;
		results.push(result);
	},
	text4trace: function(obj, depth, max_depth)
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
	},
	trace: function(script,input,output,context,trace_param,level) 
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
	},
	write_profiling_at_end: function(start_time,component_id) {
		 var time_passes = new Date().getTime() - start_time;
		 if (ajaxart.profiling_of_globals[component_id] == null)
			 ajaxart.profiling_of_globals[component_id] = { calls:0, total:0 };
		 ajaxart.profiling_of_globals[component_id].calls++;
		 ajaxart.profiling_of_globals[component_id].total += time_passes;
	}
});

// general
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

aa_extend(ajaxart,{
	xmlescape: function(text) 
	{
		if (typeof text === 'string')
			return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/\n/g, "&#xa;").replace(/\r/g, "&#xd;");
		if (ajaxart.isArray(text) && text.length > 0) return ajaxart.xmlescape(text[0]);
		return '';
	},
	xmlunescape: function(text) 
	{
		if (ajaxart.isArray(text))
		{
			if (text.length > 0 ) return ajaxart.xmlescape(text[0]);
			return "";
		}
		if (ajaxart.isObject(text))
			return "struct";
		return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'").replace(/&#xa;/g, "\n");  
	},
	isattached: function(elem)
	{
		if (elem == null) return false;
		if (ajaxart.isIE) return jQuery(elem).parents("body").length > 0;
		return (elem.offsetParent || jQuery(elem).parents("body").length > 0);
	},
	getControlElement: function(params, single)
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
	},

	writevalue: function(data, newValueObj,disableXmlChangeEvent) {
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
},
body_contents_of_soap_envelope: function(envelope)
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
},
ajaxart_clean_ns: function(xmltext)
{
	xmltext = xmltext.replace(new RegExp('<[A-Za-z0-9_]*:', 'g'), '<');
	xmltext = xmltext.replace(new RegExp('</[A-Za-z0-9_]*:', 'g'), '</');
	xmltext = xmltext.replace(new RegExp('xmlns[a-zA-Z0-9_:"\'=/.-]*', 'g'), '');
	xmltext = xmltext.replace(new RegExp('[A-Za-z0-9_]*:([A-Za-z0-9_]*)="', 'g'), '$1="');

	return xmltext;
}

});
// studio 
aa_extend(ajaxart,{
	xtmls: ajaxart.parsexml('<Plugins/>')
});
// deprecated
aa_extend(ajaxart,{
	make_array: function(input_array,func,workWithEmptyInput)
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
	},
	jrootElem: function(elemList)
	{
		var list = elemList.parents();
		if (list.length > 0 ) {
			var rootItem = list[list.length-1];
			return jQuery(rootItem);
		}
		return jQuery([]);
	},
	calcParamsForRunOn: function(params,runOn,startFrom)
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
	},
	databind: function(bindto,data,params,script,origData)
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
});

// tests
aa_testFinished = {};
aa_tests_timeout = 0;

aa_extend(ajaxart,{
	stoptests: false,
	testResults: { summaryId : '' , failuresId: '' , successCounter: 0 , failureCounter: 0},
	serverData: [],
	debugData: [],
	runtests: function(summaryId,failuresId,onlyForPlugin)
	{
		ajaxart.testsStartTime = new Date().getTime();
		ajaxart.testResults.summaryId = summaryId;
		ajaxart.testResults.failuresId = failuresId;
		var runmore = ajaxart.urlparam('more') == "true";
		var allUsages = [];
		// run gallery items
		if (ajaxart.serverData['_GalleryItems']) {
		  var gitems = ajaxart.xml.xpath(ajaxart.serverData['_GalleryItems'][0],'*');
		  for(var i=0;i<gitems.length;i++) 
			  ajaxart.concat(allUsages,bart_galleryitem_tousages(gitems[i]));
		}
		for (plugin in ajaxart.usages)
		{
			if (onlyForPlugin != null && onlyForPlugin != plugin) continue;
			for (usage in ajaxart.usages[plugin]) {
				var isTest = ajaxart.usages[plugin][usage].getAttribute("IsTest") != "false";
				if (runmore) isTest = ajaxart.usages[plugin][usage].getAttribute("IsTest") == "more";
				if (isTest)
					allUsages.push(ajaxart.usages[plugin][usage]);
			}
		}
		jQuery('#tests_count').text('Running ' + allUsages.length + ' tests');
	    ajaxart.runTestLoop(allUsages,0);
	},
	getTestName: function(prof)
	{
		var testName = '';
		if (aa_hasAttribute(prof,"Of") ) testName = prof.getAttribute("Of");
		if (aa_hasAttribute(prof,"Name") ) {
			if (testName.length > 0 ) testName += ' - ';
			testName += prof.getAttribute("Name");
		}
		return testName;
	},
	handleUsageResult: function(result,usagesArray,index,prof) 
	{
	  var testName = "";
	  if(index+1<usagesArray.length)
	  {
		var prof = usagesArray[index+1];
		if (aa_hasAttribute(prof,"Of") ) testName = prof.getAttribute("Of");
		if (aa_hasAttribute(prof,"Name") ) {
			if (testName.length > 0 ) testName += ' - ';
			testName += prof.getAttribute("Name");
		}
	  }
	  var text = "<div style='color:green;font-weight:bold'>so far " + ajaxart.testResults.successCounter + " tests succeeded. working on " + testName + "</div>";
	  document.getElementById('ajaxart_summary').innerHTML = text;
		
	  var prof = usagesArray[index];

	  if (result.length == 0) {
	    ajaxart.testResults.successCounter++;
	    if ( prof.getAttribute('AssignedTo') ) {
	    	var testName = "";
	    	if (aa_hasAttribute(prof,"Of") ) testName = prof.getAttribute("Of"); 
	    	jQuery("#"+ajaxart.testResults.failuresId).append("<div style='color:darkorange'>Test " + testName + " succeeds but assigned to " + prof.getAttribute('AssignedTo') + '</div>');
	    }
	  }
	  else  
	  {
		var testName = "";
		var href = "";
		var hrefBasic = "http://localhost/ajaxart/showsamples.html#?";
		if (aa_hasAttribute(prof,"Of") ) { testName = prof.getAttribute("Of"); href = hrefBasic + "Of=" + testName + ";"; }
		if (aa_hasAttribute(prof,"Name")) {
			if (testName.length > 0 ) testName += ' - ';
			testName += prof.getAttribute("Name");
			href = hrefBasic + "Name=" + prof.getAttribute("Name") + ";";
		}
		if (aa_hasAttribute(prof,'Of') && prof.getAttribute('Of').indexOf('gallery_') == 0) {
			var gitem = prof.getAttribute('Of').split('gallery_')[1].split('.')[0];
			var ct = jQuery(prof).parents('jbart_project').length>0 ? 'jbart_project' : 'bart_sample';
			href = 'http://localhost/ajaxart/jbartstudio.html?contenttype='+ct+'#?mode=tests?project=' + gitem;
//			href = 'http://localhost/ajaxart/bartgallery.html#?smallpage=tests?page=widget?node=bart_sample.' + gitem;
		}
		ajaxart.testResults.failureCounter++;
		var assigned = "";
		if (aa_hasAttribute(prof,"AssignedTo") && prof.getAttribute('AssignedTo') != "")
			assigned = " (" + prof.getAttribute('AssignedTo') + ")";
		var failCssClass = (assigned != "") ? 'failing_test_assigned' : 'failing_test_unassigned';
	    jQuery("#"+ajaxart.testResults.failuresId).append("<a target='_blank' class='failing_test "+failCssClass+"' href='" + href + "'>Failed " + testName + assigned + "</a><br/>");
	  }
	  aa_closePopup();
	  
	  if (ajaxart.lastTestTime) {
		 var now = new Date().getTime();
		 var diff = now - ajaxart.lastTestTime;
		 var cls = (diff > 600) ? 'timing_red' : 'timing_ok'; 
		 jQuery('#tests_timing').append('<div>Running time of test ' + (index+1) + ' ('+ajaxart.getTestName(prof)+') is <span class="'+cls+'">' + diff + '<span></div>');
	  }

	  setTimeout( function() { ajaxart.runTestLoop(usagesArray,index+1) }, 1 );
	},
	runTestLoop: function(usagesArray,index,varsContext)
	{
		ajaxart.lastTestTime = new Date().getTime();
		
		if (usagesArray.length == 0) return;
		if (ajaxart.stoptests || index == usagesArray.length) // the end
		{
			var text="";
			if (ajaxart.stoptests)
				text ="<div>tests stopped</div>";
			else if (ajaxart.testResults.failureCounter == 0)
				text = "<div style='color:green;font-weight:bold'>all tests succeeded (" + ajaxart.testResults.successCounter + " tests)</div>";
			else
				text = "<div style='color:red;font-weight:bold'>" + ajaxart.testResults.failureCounter + " tests failed</div>";
			
			jQuery("#"+ajaxart.testResults.summaryId).html(text);	
			var elapsed = (new Date().getTime() - ajaxart.testsStartTime) / 1000;
			var now = '<div style="font-size:12px; margin-top:10px">Tests finished at ' + new Date().getHours() + ":" + new Date().getMinutes() + '</div>';
			jQuery("#ajaxart_tests_time").html("time (seconds): " + Math.round(elapsed) + now);
			return;
		}

		var prof = usagesArray[index];
//		if (prof.getAttribute('onlyme') != 'true') return ajaxart.runTestLoop(usagesArray,index+1,varsContext);
		var canRunNow = true;
		
		if (ajaxart.xml.xpath(prof,'ServerData').length > 0 && typeof(varsContext) == "undefined") {
			var onSuccess = function(context) {
				ajaxart.runTestLoop(usagesArray,index,context);
			}
			canRunNow = false;
			ajaxart.server.RunParallelCalls(prof,[],ajaxart.newContext(),'ServerData',onSuccess);
		}
		var serverDataProfs = ajaxart.subprofiles(prof,'ServerData');
		var params = ajaxart.newContext();
		if (typeof(varsContext) != "undefined") params = varsContext;
		var dataIsUsage = ( prof.getAttribute("t") == 'bart_usage.JBartUsage' || prof.getAttribute("t") == 'bart_usage.JBartStudioUsage' );
		
		if (canRunNow)
		{
			if (prof.getAttribute("t") == "ui_async.ControlUsage" || prof.getAttribute("t") == "bart_usage.BartControlUsage") {
				canRunNow = false;
				if (aa_tests_timeout != 0) clearTimeout(aa_tests_timeout);
				
				aa_tests_timeout = setTimeout(function() {	// fallback. if no answer in 4 seconds we go on 
					if (aa_testFinished[index]) return;
					aa_testFinished[index] = true;
					aa_tests_timeout = 0;
					ajaxart.handleUsageResult([],usagesArray,index,usagesArray[index]);
				},4000);
				ajaxart_RunAsync([prof],prof,params,function(result) {
					if (aa_testFinished[index]) return;
					aa_testFinished[index] = true;
					ajaxart.handleUsageResult(result,usagesArray,index,usagesArray[index]);
				});
			} 
			if (prof.getAttribute("t") == "bart_usage.BartDataUsage") dataIsUsage = true;
		}

		if (!canRunNow) return;
	    var result = ajaxart.run(dataIsUsage ? [prof] : [],prof,'',params);
	    ajaxart.handleUsageResult(result,usagesArray,index,prof);
	}
});


// touch
ajaxart.isTouchDevice = function() { return ajaxart.isTouch; }
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
aa_determine_device();

// gc utils
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
	  var newContext = {};
	  newContext.vars = context.vars;
	  newContext.componentContext = context.componentContext;

	  if (xtmlElem.execution == 'native') {
	  	  var profile = ajaxart.parsexml('<xtml t=""/>');
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

ajaxart.runComponent = function(component,data,context) {
	context = context || ajaxart.newContext();
	var profile = ajaxart.parsexml('<xtml t="' + component + '" />');
	return ajaxart.run(data,profile,'',context);
}
ajaxart.concat = function(source,toadd) {
	if (toadd == null) return;
	for(var i=0;i<toadd.length;i++)
		source.push(toadd[i]);
}
function ajaxart_addScriptMethod(structItem,structField,profile,field,context,paramVars) 
{
	var fieldscript = (field == "") ? profile : ajaxart.fieldscript(profile,field,true);
	
	structItem[structField] = { 
			script: fieldscript , context: context, objectForMethod: [structItem], 
			compiled: ajaxart.compile(fieldscript,'',context,paramVars) 
	};
}
function ajaxart_addScriptParam_js(structItem,structField,jsFunc,context)
{
	structItem[structField] = {	context: context , compiled: jsFunc };
}
function ajaxart_addMethod_js(structItem,structField,jsFunc,context)
{
	structItem[structField] = {	context: context , compiled: jsFunc, objectForMethod: [structItem] };
}
function aa_ctx(context,vars)
{
  var out = ajaxart.clone_context(context);
  for (var i in vars) out.vars[i] = vars[i];
  return out;
}
function aa_merge_ctx(context,contextVars,moreVars)
{
  var result = { params: context.params , vars: contextVars.vars , componentContext: context.componentContext , _This: contextVars._This};
  if (moreVars)
	  result = aa_ctx(result,moreVars);
  return result;
}

function aa_toint(data)
{
	if (data.length == 0) return 0;
	var txt = aa_totext(data);
	if (txt == '') return 0;
	return parseInt(txt);
}
function ajaxart_toint_array(data)
{
	if (data.length == 0) return 0;
	if (data[0] == '') return 0;
	return parseInt(data[0]);
}
function ajaxart_run_commas(data,script,field,context)
{
  var text = aa_text(data,script,field,context);
  if (text == "") return [];
  return text.split(',');
}
function ajaxart_run_tocommas(data,script,field,context)
{
	var list = ajaxart.run(data,script,field,context);
	var out = ",";
	for(var i=0;i<list.length;i++) {
		out += aa_totext([list[i]]) + ',';
	}
	return out;
}
function ajaxart_arr_indexof(arr,item)
{
  for(var i=0;i<arr.length;i++)
	  if (arr[i] == item) return i;
  return -1;
}
function ajaxart_writabledata()
{
  return ajaxart.xml.xpath(ajaxart.parsexml('<tmp val="" />'),'@val');	
}
function ajaxart_clone_array(array)
{
  var out = [];
  for(var i=0;i<array.length;i++)
	  out.push(array[i]);
  return out;
}

function aa_text2bool(text)
{
    if (text == "" || text == "false") return false;
    if (text == "true") return true;

    if (! isNaN(text)) return true; // a number is true (can allow Condition="%=Count...%")
    
    if (text.indexOf('==') > -1) {
    	var pos = text.indexOf('==');
    	var first = aa_trimQuote(text.substring(0,pos)), second = aa_trimQuote(text.substring(pos+2));
    	return (first == second);
    }
    if (text.indexOf('!=') > -1) {
    	var pos = text.indexOf('!=');
    	var first = aa_trimQuote(text.substring(0,pos)), second = aa_trimQuote(text.substring(pos+2));
    	return (first != second);
    }
    if (text.indexOf('=') > -1) {
    	var pos = text.indexOf('=');
    	var first = text.substring(0,pos), second = text.substring(pos+1);
    	return (first == second);
    }
	var boolean_result = false;
	var text_to_eval = "if (" + text + ") boolean_result=true;";
	try { eval(text_to_eval); }
	catch(e) { 
		ajaxart.log("Failed to evaluate boolean expression: " + text,"warning"); return false;
	}
    return boolean_result ? true : false;
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
function aa_trimQuote(text)
{
  text = text.replace(/^\s*/, "").replace(/\s*$/, "");	// first trim spaces
  if (text.length > 0 && text.charAt(0) == "'" && text.charAt(text.length-1) == "'")
	  return text.substring(1,text.length-1);
  return text;
}
function aa_run(data,profile,field,context) {
	return ajaxart.run(data,profile,field,context);
}
function aa_text_with_percent(data,script,field,params)
{
	var val = script.getAttribute(field);
	if (val) return val;
	return aa_text(data,script,field,params);
}
ajaxart.runScriptParam = function(data,scriptParam,context)
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
}
function aa_JsonByRef(parent,prop) { this.parent = parent; this.prop = prop}
aa_JsonByRef.prototype.GetValue = function() { return this.parent[this.prop] }
aa_JsonByRef.prototype.WriteValue = function(val) { return this.parent[this.prop] = val }
aa_JsonByRef.prototype.ParentNode = function() { return this.parent }

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

function aa_cdata_value(element)
{
	if (!element || element.nodeType != 1 ) return null;

	for (var child = element.firstChild; child!=null; child=child.nextSibling)
		if (child.nodeType == 4 && child.nodeValue)
			return child.nodeValue;

	return null;
}

function aa_split(text,separator,ignoreEmptyValues) {
	var arr = text.split(separator);
	var out = [];
	for(var i=0;i<arr.length;i++)
		if (arr[i] || !ignoreEmptyValues) out.push(arr[i]);
	return out;
}


//AA BeginModule
ajaxart.gcs.object =
{
  IsObject: function (profile,data,context)
  {
	if (data.length == 0) return [];
	return ajaxart.isObject(data[0]) ? ["true"] : [];
  },
  Object: function (profile,data,context)
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
  OverrideObject: function (profile,data,context)
  {
	  var overrides = ajaxart.gcs.object.Object(profile,data,context)[0];
	  var out = aa_first(data,profile,'Object',context);
	  if (out == null) return [];
	  for(var i in overrides)
		  out[i] = overrides[i];
	  
	  var addToProperty = aa_xpath(profile,'AddToProperty');
	  for(var i=0;i<addToProperty.length;i++) {
		  var name = addToProperty[i].getAttribute('name');
		  out[name] = out[name] || [];
		  ajaxart.concat(out[name],ajaxart.run(data,addToProperty[i],'',context));
	  }
	  
	  return [out];
  },
  ObjectFromParams: function (profile,data,context)
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
  },
  Clone: function (profile,data,context)
  {
	  var obj = aa_first(data,profile,'Object',context);
	  if (obj == null) return [];
	  var out = {}
	  for(var i in obj) out[i] = obj[i];
	  return [out];
  },
  HasMethod: function (profile,data,context)
  {
	  var obj = aa_first(data,profile,'Object',context);
	  var method = aa_text(data,profile,'Method',context);
	  if (obj != null && obj[method] != null) return ["true"];
	  return [];
  },
  FastRunMethod: function (profile,data,context)
  {
	  var obj = aa_first(data,profile,'Object',context);
	  var method = aa_text(data,profile,'Method',context);
	  if (obj == null || method == "" || typeof(obj[method]) != 'function') return [];
	  return obj[method](data,context);
  },
  RunMethod: function (profile,data,context)
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
  SetProperty: function (profile,data,context)
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
  ClearProperty: function (profile,data,context)
  {
	  var obj = aa_first(data,profile,'Object',context);
	  var prop = aa_text(data,profile,'Property',context);
	  if (obj && prop) delete obj[prop];
  },
  SetTextProperty: function (profile,data,context)
  {
	  var obj = aa_first(data,profile,'Object',context);
	  var prop = aa_text(data,profile,'Property',context);
	  if (obj == null || prop == "") return [];
	  obj[prop] = aa_text(data,profile,'Value',context);
  },
  SetNumericProperty: function (profile,data,context)
  {
	  var obj = aa_first(data,profile,'Object',context);
	  var prop = aa_text(data,profile,'Property',context);
	  if (obj == null || prop == "") return [];
	  obj[prop] = aa_int(data,profile,'Value',context);
  },
  SetBooleanProperty: function (profile,data,context)
  {
	  var obj = aa_first(data,profile,'Object',context);
	  var prop = aa_text(data,profile,'Property',context);
	  if (obj == null || prop == "") return [];
	  obj[prop] = aa_bool(data,profile,'Value',context);
	  
	  return ["true"];
  },
  SetMethod: function (profile,data,context)
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
  AddToProperty: function (profile,data,context)
  {
	  var obj = aa_first(data,profile,'Object',context);
	  var prop = aa_text(data,profile,'Property',context);
	  var value = ajaxart.run(data,profile,'Value',context);
	  if (obj == null || prop == "") return [];
	  if (obj[prop] == null) obj[prop] = [];
	  ajaxart.concat(obj[prop],value);
	  
	  return ["true"];
  },
  AddOrReplacePropertyItem: function (profile,data,context)
  {
	  var obj = aa_first(data,profile,'Object',context);
	  var prop = aa_text(data,profile,'Property',context);
	  var item = aa_first(data,profile,'Item',context);
	  if (item == null) return;
	  var id = ajaxart.totext_array(item.ID);
	  
	  var list = obj[prop];
	  if (list == null) list = obj[prop] = [];
	  
	  for(var i=0;i<list.length;i++) {
		  if (list[i].ID != null && list[i].ID[0] == id) {
			  list[i] = item;
			  return [];
		  }
	  }
	  obj[prop].push(item);
	  
	  return ["true"];
  } 
}
//AA EndModule

ajaxart_addLightMethod = function(object,method,profile,field,context,paramVars)
{
	var fieldscript = (field == "") ? profile : ajaxart.fieldscript(profile,field,true);
	
    object[method] = { 
      script: fieldscript , context: context, 
      compiled: ajaxart.compile(fieldscript,'',context,paramVars) 
    };
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

function ajaxart_addMethod_js(object,method,jsFunc,context)
{
	object[method] = {	context: context , compiled: jsFunc, objectForMethod: [object] };
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
function ajaxart_runMethod_async(data,object,method,context,callBack)
{
	if (object == null || method == "") return [];
	if (object[method] == null) { callBack(data,context); return; }
	
	var scriptParam = object[method];
	if (typeof(scriptParam) == "function") {
		ajaxart_RunAsync(data,scriptParam,context,callBack,object);
		return [];
	}
	
	var newContext = { params: scriptParam.context.params 
			, vars: context.vars
			, componentContext: scriptParam.context.componentContext} // TODO: avoid this if paramVars == ""
	
    if (typeof(scriptParam.objectForMethod) != 'undefined') {
	  newContext.vars = [];
	  for(var j in context.vars) 
		  newContext.vars[j] = context.vars[j]; 
	  newContext._This = object;
    }
	if (scriptParam.script != null)		// TODO: clean these
	  ajaxart_RunAsync(data,scriptParam.script,newContext,callBack,object);
	else
	  ajaxart_RunAsync(data,scriptParam,newContext,callBack,object);
	
	return [];
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
function ajaxart_object_boolean_value(obj,property)
{
	if (obj[property] == null ) return null;
	if (typeof(obj[property])=="boolean") return obj[property];
	if (obj[property].length == 0 || obj[property] != "true") return false;
	return true;
}
function ajaxart_object_run_boolean_method(object,method,data,context)
{
	if (object[method] == null ) return false;
	var result = ajaxart_runMethod(data,object,method,context);
	if (result.length == 0) return false;
	if (ajaxart.totext_array(result) == "true") return true;
	
	return false;
}
function ajaxart_object_byid(list,id)
{
	if (list == null || typeof(list) == "undefined" ) return null;
	for(var i=0;i<list.length;i++) {
		var item = list[i];
		if (item.Id != null ) {
			if (item.Id == id) return item;
		} else if (item.ID != null && item.ID.length > 0 && item.ID[0] == id) return item;
	}
	return null;
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
function aa_CalculatedFields(fields)
{
	var result = [];
	for(var i in fields)
		if (fields[i].WrapperToValue)
			result.push(fields[i]);
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
function ajaxart_filter_dataitems(data_items,fields,filters,context)
{
	var wrappers = aa_create_wrappers(data_items.Items,fields,filters,context);
	var dataholder = aa_newDataHolder(wrappers,context);
	dataholder.UserDataView.Filters = filters;
	dataholder.UserDataView.CalcFilters();
	var result = dataholder.UserDataView.CalcResults();
	data_items.Items = [];
	var wrappers = result[0].Items;
	for(i in wrappers)
		data_items.Items.push(wrappers[i].__item || wrappers[i]);
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

function aa_cntrSortPrefrences(cntr)
{
	var thead = jQuery(cntr.Ctrl).find('.aatable>thead').slice(0,1);
	var th = thead.find('>tr>th').filter('.sort_ascending,.sort_descending')[0];
	if (th != null)
		return [{ SortBy: th.Field.Id, SortDirection: jQuery(th).hasClass('sort_ascending') ? 'ascending' : 'descending' }]
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

//AA BeginModule
ajaxart.gcs.dataview = {
	DataViewQuery: function(profile,data,context)
	{
		var cntr = context.vars.DataHolderCntr && context.vars.DataHolderCntr[0];
		if (!cntr) return [];
		cntr.DataHolder = cntr.DataHolder || aa_createDataHolderFromCntr(cntr,context);
		var dataholder = cntr.DataHolder;
		if (!dataholder) return [];
		var filters_txt = ajaxart.runsubprofiles(data,profile,'Filter',context).join(' AND ');
		var filters = aa_filters_from_expression(filters_txt,cntr.DataHolder.Fields);
		var sort = ajaxart.runsubprofiles(data,profile,'Sort',context);
		var result = dataholder.newFiltersDataView(filters,sort);
		return result ? [result] : [];
	},
	GroupByDataHolder: function(profile,data,context)
	{
		var cntr = context.vars.DataHolderCntr && context.vars.DataHolderCntr[0];
		if (!cntr) return [];
		cntr.DataHolder = cntr.DataHolder || aa_createDataHolderFromCntr(cntr,context);
		var dataholder = cntr.DataHolder;
		if (!dataholder) return [];
		var filters_txt = ajaxart.runsubprofiles(data,profile,'FilterBefore',context).join(' AND ');
		var filtersBefore = aa_filters_from_expression(filters_txt,cntr.DataHolder.Fields);
		var groupByFields = aa_text(data,profile,'GroupByFields',context);
		function calculatedFieldsGen(groups) // groups is passed to allow DT
		{
			return ajaxart.runsubprofiles(data,profile,'Field',aa_ctx(context,{_FormulaInput:groups}));
		}
		var holder = dataholder.newGroupBy(filtersBefore,groupByFields,calculatedFieldsGen);
		return holder ? [holder] : [];
	},
	JSFormula: function(profile,data,context)
	{
		var field = context.vars._Field[0];
		function aa_expressionToJs(exp,type)
		{
			var funcObj = { f: function(wrapper) {return wrapper} };
			if (!exp || exp == '') return funcObj.f;
			var fixedExp = exp.replace(/%@?([a-zA-Z0-9_]+)%/g,'wrapper.$1'); 		// %@a% or %a% -> wrapper.a
			fixedExp = fixedExp.replace(/%=([^(]+)[(]Items[/]?@?([^)]*)[)]%/g, 'aa_$1(wrapper.Items,"$2")')

			if (type == 'truncated_number')
				var func_str = 'a = { f: function(wrapper) { return Math.floor((' + fixedExp +') * 100) / 100} }';
			else if (type == 'integer')
				var func_str = 'a = { f: function(wrapper) { return Math.floor(' + fixedExp +')} }';
			else
				var func_str = 'a = { f: function(wrapper) { return ' + fixedExp +'} }';
			try {
				funcObj = eval(func_str);
			} catch (e) {}
			return funcObj.f;
		}
		function aa_expressionToJsForDataItem(exp,type)
		{
			var funcObj = { f: function(wrapper) {return wrapper} };
			if (!exp || exp == '') return funcObj.f;
			var fixedExp = exp.replace(/%@?([a-zA-Z0-9_]+)%/g,'item[0].getAttribute("$1")'); // %@a% or %a% -> wrapper.a
			if (type == 'truncated_number')
				var func_str = 'a = { f: function(item) { return [Math.floor((' + fixedExp +') * 100) / 100]} }';
			else if (type == 'integer')
				var func_str = 'a = { f: function(item) { return [Math.floor(' + fixedExp +')];} }';
			else
				var func_str = 'a = { f: function(item) { return [' + fixedExp +']} }';
			try {
				funcObj = eval(func_str);
			} catch (e) {}
			return funcObj.f;
		}
		var formulaInput = context.vars._FormulaInput || data;
		aa_text(formulaInput,profile,'Expression',context);
		field.WrapperToValue = aa_expressionToJs(profile.getAttribute('Expression'),aa_text(data,profile,'ResultType',context));
		field.CalcFormula = aa_expressionToJsForDataItem(profile.getAttribute('Expression'),aa_text(data,profile,'ResultType',context)); 
		field.IsCalculated = true;
		return [];
	},
	DatePartFormula: function(profile,data,context)
	{
		var field = context.vars._Field[0];
		var format = aa_text(data,profile,'Format',context); 
		var part = aa_text(data,profile,'Part',context); 
		var type = aa_text(data,profile,'Type',context); 
		var basedOnField = aa_text(data,profile,'BasedOnField',context);
		
		field.WrapperToValue = function (part,basedOnField) { return function(wrapper) {
				var src = wrapper[basedOnField];
				if (!src) return null;
				var resultDate = aa_extractDatePart(new Date(src),part);
				if (type == 'text')
					return aa_format_date(format,resultDate);
				else
					return resultDate.getTime();
			}}(part,basedOnField);
		field.CalcFormula = function (part,basedOnField) { return function(item) {
				var src_txt = item[0].getAttribute[basedOnField];
				var src = aadate_date2int(src_txt);
				if (!src) return null;
				var resultDate = aa_extractDatePart(new Date(src),part);
				if (type == 'text')
					return aa_format_date(format,resultDate);
				else
					return [resultDate.getTime()];
			}}(part,basedOnField);
		field.IsCalculated = true;
		return [field];
	},
	SequenceFormula: function(profile,data,context)
	{
		var field = context.vars._Field[0];
		function aa_expressionToJs(exp)
		{
			if (!exp) return;
			var fixedExp = exp.replace(/%@?([a-zA-Z0-9_]+)%/g,'wrapper.$1'); 		// %@a% or %a% -> wrapper.a
			fixedExp = fixedExp.replace(/%=([^(]+)[(]Items\/@?([^)]+)[)]%/g, 'aa_$1(wrapper.Wrappers,"$2")'); 
			fixedExp = fixedExp.replace(/%[$]Prev\/@?([^%]*)%/g, 'prev.$1'); 
			// %$Prev/Amount% -> prev.Amount

			var func_str = 'a = { f: function(wrapper,prev) { return ' + fixedExp +'} }';
			var a = eval(func_str);
			return a.f;
		}
		field.CalcSequence = function(wrappers,dataHolder)
		{
			aa_sort_dataview(wrappers,dataHolder.UserDataView.Sort);
			//aa_sort_wrappers(wrappers,aa_text(data,profile,'SortBy',context),aa_text(data,profile,'SortDirection',context));
			var fieldId = this.Id;
			var prev_wrapper = null;
			for(var i in wrappers)
			{
				var wrapper = wrappers[i];
				if (this.RestartCondition && prev_wrapper && this.RestartCondition(wrapper,prev_wrapper))
					prev_wrapper = null;
				if (! prev_wrapper)
					wrapper[fieldId] = this.FirstValue ? this.FirstValue(wrapper) : this.WrapperToValue(wrapper,0);
				else
					wrapper[fieldId] = this.WrapperToValue(wrapper,prev_wrapper);
				if (wrapper.__item && ajaxart.isxml(wrapper.__item))
					wrapper.__item.setAttribute(fieldId,'' + wrapper[fieldId]);
				prev_wrapper = wrapper;
			}
		}
		field.WrapperToValue = aa_expressionToJs(profile.getAttribute('Expression'));
		field.FirstValue = aa_expressionToJs(profile.getAttribute('FirstValue')),
		field.RestartCondition = profile.getAttribute('RestartCondition') != '' ? aa_expressionToJs(profile.getAttribute('RestartCondition')) : null
		// For DT
		var item = context.vars.PageSampleItems;
		if (item)
		{
			var dtCtx = aa_ctx(context,{Prev: item}); // how to bring the real previous??
			aa_text(item,profile,'Expression',dtCtx); 
			aa_text(item,profile,'FirstValue',context); 
			aa_text(item,profile,'RestartCondition',dtCtx);
		}
	},
	RangesFormula: function(profile,data,context)
	{
		function rangeOfValue(ranges,value)
		{
			for(var i=0;i<ranges.length;i++)
				 if (value > ranges[i].min && value <= ranges[i].max)
					 return ranges[i].text;
			if (!ranges || ranges.length == 0) return value;
			return ranges[ranges.length-1].text;
		}
		function RangeOfValueWrapperFunc(ranges,base_field_id) {
			return function(wrapper) {
				return rangeOfValue(ranges,wrapper[base_field_id]);
			}}
		function RangeOfValueItemFunc(ranges,base_field_id) {
			return function(item) {
				return [rangeOfValue(ranges,item[0].getAttribute(base_field_id))];
			}}

		var field = context.vars._Field[0];
		var base_field = aa_first(data,profile,'BasedOnField',context);
		var ranges = field.Ranges = ajaxart.run(data,profile,'Formula',context);
		field.WrapperToValue = RangeOfValueWrapperFunc(ranges,base_field),
		field.CalcFormula = RangeOfValueItemFunc(ranges,base_field)
		field.Options = { isObject: true, Options: [] };
		for(var i in ranges)
			field.Options.Options.push( { isObject: true, code: ranges[i].text, text: ranges[i].text} );
		ajaxart.runNativeHelper(data,profile,'Aspects',context);
		aa_initOptionsObject(field.Options,context);
		aa_initPicklistField(field,data,profile,context)
//		aa_initOptionsObject(field.Options,context);
		return [];
	},
	FixedRanges: function(profile,data,context)
	{
		var txt_values = aa_text(data,profile,'Ranges',context).split(',');
		var values = [];
		for(var i=0;i<txt_values.length;i++) {
			var num = parseFloat(txt_values[i]);
			num = parseFloat(num.toFixed(3)+''.replace(/0+$/,'')); // clean float garbage
			if (!isNaN(num)) values.push(num);
		}
		var ranges = [];
					
		for(var i=0;i<values.length;i++)
		{
			var to = values[i];
			var to_text = aa_text([to],profile,'NumberFormat',context);
			if (i > 0) {
				var from = values[i-1];
				var from_text = aa_text([from],profile,'NumberFormat',context);
				var txt = aa_text(data,profile,'RangeText',aa_ctx(context,{ To: [to] , From: [from] }));
				if (Math.abs(from - to) < 0.00001)	// single value
					txt = aa_text(to_text,profile,'SingleRangeText',context);
				ranges.push({ isObject: true, min: from, max: to, text: txt});
			}
			else { // first item
				txt = aa_text(data,profile,'MinimumRangeText',aa_ctx(context,{ To: [to_text] }));
				if (!aa_bool(data,profile,'IncludeMinimumRange',context)) continue;
				ranges.push({ isObject: true, min: -100000000, max: to, text: txt});
			}
		}
		if (aa_bool(data,profile,'IncludeMaximumRange',context) && values.length>1) {
			var from_text = aa_text([values.pop()],profile,'NumberFormat',context);
			ranges.push({ 
				min: ranges[ranges.length-1].max, 
				max: 10000000000, 
				text: aa_text(data,profile,'MaximumRangeText',aa_ctx(context,{ From: [from_text] })) });
		}
		
		if (aa_text(data,profile,'Sort',context) == 'reverse')
			ranges = ranges.reverse();
		return ranges;
	},
	PivotFields: function(profile,data,context)
	{
		var cntr = context.vars.DataHolderCntr && context.vars.DataHolderCntr[0];
		if (!cntr) return [];
		var fields = cntr.Fields;
		var pivotFieldId = aa_text(data,profile,'BasedOnField',context);
		var pivotField = aa_fieldById(pivotFieldId,fields);
		if (!pivotField) return [];
		var options = pivotField.Ranges || pivotField.Options && pivotField.Options.Options;
		var result = [];
		for(var i in options)
		{
			var option = options[i];
			var field = {
				isObject: true,
				Title: option.text,
				Id: aa_string2id(option.text),
				PivotFieldId: pivotFieldId,
				PivotField: pivotField,
				PivotValue: option.code || option.text,
				SubItems: function(item) 
				{ 
					var result = [];
					for(var j in item.Items)
					{
						var inner_item = item.Items[j];
						if (!pivotField.Multiple) {
						  if (inner_item[this.PivotFieldId] == this.PivotValue)
							result.push(inner_item);
						}
						else {
						  var str = ","+inner_item[this.PivotFieldId]+",";
						  if (str.indexOf(','+this.PivotValue+',') > -1)
							  result.push(inner_item);
						}
					}
					return result;
				},
				FieldData: function(item_data) 
				{ 
					var item = item_data[0];
					var subItems = this.SubItems(item);
					return [{ isObject: true, Name: (item.Name || '') + ' - ' + this.Title + ' ' + this.PivotField.Title , Count: subItems.length, Items: subItems }];
				}
			}
			ajaxart.runsubprofiles(data,profile,'FieldAspect',aa_ctx(context,{_Field: [field]} ));
			result.push(field);
		}
		return result;
	}
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
//AA EndModule

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
		jQuery(td).addClass("aa_text fld_" + field.Id);
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
	var textboxCssClass = aa_attach_global_css( aa_totext(ajaxart.run([],ajaxart.parsexml('<xtml t="jbart.TextboxCss" />'),'',context)) , null, 'textbox',null,true );
	jQuery(input).addClass('aa_simple_cell aatextbox').addClass(textboxCssClass);
	input.jbRemoveTextboxClass = function() {
		jQuery(input).removeClass('aatextbox').removeClass(textboxCssClass);
	}

	if (!readonly && (field.Validations || field.Validation)) 
	  jQuery(input).addClass('aa_hasvalidations');

	return input;
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

function aa_handle_onload_validations(top)
{
  var optionals = jQuery(top).find('.aa_hasvalidations');
  for(var i=0;i<optionals.length;i++) {
    var ctrl = optionals[i];
    if (! ctrl.ajaxart) continue;
    aa_handleValidations(ctrl.ajaxart.params.vars._Field[0],ctrl,ctrl.ajaxart.data,ctrl.ajaxart.params,"on load");
  }
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
function aa_validation_removeNoCloseMessages()
{
	jQuery(document).find('.aa_noclose_message').remove();
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

function aa_clear_jb_classes(elem)
{
    var classes = elem.className.split(' ');
    for(var i=0;i<classes.length;i++)
   	 if (classes[i].indexOf('jb') == 0) 
   		 jQuery(elem).removeClass(classes[i]);
}

/**
 * Finds field instances in the DOM
 *
 * You can look for the dom instances of a field giving its id and search scope
 * @param settings of javascript object with the following properties:
 *   - fieldID
 *   - scope (can be 'screen','parent','siblings'), default is 'screen' 
 *   - result (can be 'content','wrapper'), default is 'content'
 *   - context
 * @return an array of dom elements
 * @example var myButtonElement = aa_find_field_controls({ fieldId: 'my_button', context: context })[0];
 * 
 * @category General
 */
function aa_find_field_controls(settings) 
{
	settings.result = settings.result || 'content';
	settings.scope = settings.scope || 'screen';
	
	var top = aa_intest ? aa_intest_topControl : document;
	var ctrls = jQuery(top).find(".fld_" + settings.fieldID);

	var cls = "fld_" + settings.fieldID;
	var ctrls = (settings.scope == 'parent') ? jQuery(top).parents('.'+cls).get() : jQuery(top).find('.'+cls).get();
	if (jQuery(top).hasClass(cls)) ctrls.push(top);
	
	if (settings.result == 'content') return ctrls;
	if (settings.result == 'wrapper') {
		var out = [];
		for(var i=0;i<ctrls.length;i++) {
			var wrapper = ctrls[i].parentNode || ctrls[i];
			out.push(wrapper);
		}
		return out;
	}
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
     jBart.trigger(td,'cleanWrapper',{});
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

function aa_init_std_input(input,inputObject)
{
	var field = inputObject.Field;
	var field_data = inputObject.FieldData;
	var context = inputObject.Context;
	
	input.jbInput = input;
	var textbox = inputObject;
	var text = textbox.totext();
	
	input.onfocus = function(e) {
	    // select all on next timer
	    ajaxart.controlOfFocus = this;
	    aa_invoke_field_handlers(field.OnFocus,this,e,field,field_data);
		for(var parent=input.parentNode;parent;parent=parent.parentNode) if (parent.onfocus) parent.onfocus(e);  // for HoverOnPopup 
	    return true;
	}
	input.onblur = function(e) {
		for(var parent=input.parentNode;parent;parent=parent.parentNode) if (parent.onblur) parent.onblur(e);  // for HoverOnPopup 
	    ajaxart_field_RefreshDependentFields(field,this,context);
	    aa_invoke_field_handlers(field.OnBlur,this,e,field,field_data);
	    if (field.Validations) aa_handleValidations(field,this,field_data,context,"on blur");
	    return true;
	}

	input.onkeydown = function(e) {
		e = e || event;
		
	    if (field.KeyPressValidator && e.keyCode != 8) // backspace is fine 
	    {
			var ch = String.fromCharCode(e.keyCode);
			if (! field.KeyPressValidator.test(ch)) return aa_stop_prop(e);
	    }
	    aa_invoke_field_handlers(field.OnKeydown,this,e,field,field_data);
	    
		if (aa_intest && e.CharByChar)
			input.value += String.fromCharCode(e.keyCode);

		return true;
	}
	input.onmousedown = function(e) {
		e = e || event;
	    aa_invoke_field_handlers(field.OnMouseDown,this,e,field,field_data);
		return true;
	}
	input.onmouseup = function(e) {
		e = e || event;
	    aa_invoke_field_handlers(field.OnMouseUp,this,e,field,field_data);
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
		aa_invoke_field_handlers(field.OnKeyup,this,e,field,field_data,{isObject: true, KeyCode: ['' + keyCode], CtrlKey: aa_frombool(e.ctrlKey) });
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

function aa_add_field_type_triplet(field,style,data,context)
{
	field.Control = function(field_data,ctx) {
		ctx = aa_ctx(ctx,{_Field: [field]});
		var cntr = ctx.vars._Cntr && ctx.vars._Cntr[0];
		var rawtext = field.Text ? ''+field.Text(field_data,ctx) : aa_totext(field_data,ctx);
		var text = rawtext.replace(/\n/g,'</BR>');
		var properties = {
			text: text,
			Field: field,
			FieldData: field_data,
			Context: context,
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
				this.jbInput = jQuery(this.getInnerElement(classOrElement))[0];
				aa_init_std_input(this.jbInput,this);
			}
		};
		var out = aa_renderStyleObject(style,properties,ctx);
/*		var jElem = jQuery(style.Html);
		var object = aa_api_object(jElem,properties);
		var control = aa_apply_style_js(object,style,ctx);
		if (control) jElem = jQuery(control);
		aa_api_object(jElem,properties);	// re-assigning properties
		jElem.addClass(aa_attach_global_css(style.Css));
		
		return [jElem[0]];
*/
		return [out];
	}
}

function aa_find_field_input(wrapper)
{
	if (wrapper.tagName.toLowerCase() == 'input') return wrapper;
	return jQuery(wrapper).find('input')[0] || jQuery(wrapper).find('.field_control')[0];
}

var aa_navigation_codes = [38,40, 33,34,63277,63276]; // up,down,pageup,pagedown,
aa_gcs("field_aspect", {	
	Picklist: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		field.Multiple = aa_bool(data,profile,'Multiple',context);
		field.RecalculateForEachCell = aa_bool(data,profile,'RecalculateForEachCell',context);
		if (aa_paramExists(profile,'AllowValueNotInOptions'))
			field.AllowValueNotInOptions = aa_bool(data,profile,'AllowValueNotInOptions',context);
		field.AllowEmptyValue = aa_bool(data,profile,'AllowEmptyValue',context)
		if (!field.RecalcOptions)
			field.RecalcOptions = function(data1,ctx)
			{
				var optionsObj = aa_first(data1,profile,'Options',aa_merge_ctx(context,ctx)) || { Options: []} ;
				optionsObj.TreeSeparator = aa_text(data,profile,'PickTreePathSeparator',context);
				if (optionsObj.TreeSeparator == '') optionsObj.TreeSeparator = null;
					
				aa_initOptionsObject(optionsObj,ctx);
				return optionsObj;
			}
		field.ManualWriteValue = true;
	
		field.OptionsObject = field.Options;
		field.Options = field.RecalcOptions(data,context);
		aa_initPicklistField(field,data,profile,context)
		var controlStyle = aa_first(data,profile,'ControlStyle',context);
		if (controlStyle && controlStyle.Triplet) {
			field.Control = function(field_data,ctx) {
				var inputObj = {};
				field.initInput(inputObj,field_data,ctx);
				return [aa_renderStyleObject(controlStyle,inputObj,context)];
			}
		}
			
		//ajaxart.run(data,profile,'Presentation',context); // popup - todo rename
	
		return [];
	}
});

function aa_initOptionsObject(optionsObj,context)
{
	if (optionsObj == null || optionsObj.Initialized) return;

	optionsObj.codeToOption = function(code) { return this.CodeToOptionHash[code]; } // js
	optionsObj.codeToText = function(code) { return this.CodeToTextHash[code] || code; } // js
	optionsObj.textToCode = function(text) { return this.TextToCodeHash[text] || text; } // js
	optionsObj.codeToImage = function(code) 
	{
		if (! this.CodeToOptionHash[code]) return '';
		return this.CodeToOptionHash[code].image || ''; 
	}
	optionsObj.SourceToOption = function(src)
	{
		for(var i in this.Options)
			if (this.Options[i].source == src[0])
				return [this.Options[i]];
		return [];
	}
	optionsObj.CodeToText = function(code,ctx) { return [this.codeToText(code[0])]; } // xtml
	optionsObj.TextToCode = function(text,ctx) { return [this.textToCode(text[0])]; } // xtml
	optionsObj.OptionText = function(option,ctx) { return [option[0].text]; } // xtml
	optionsObj.OptionImage = function(option,ctx) { return [option[0].image || '']; } // xtml

	optionsObj.TextToCodeHash = {};
	optionsObj.CodeToTextHash = {};
	optionsObj.CodeToOptionHash = {};
	optionsObj.HasImages = false;
	function buildOptionsHash(options,prefix)
	{
		if (prefix == null) prefix = '';
		if (options == null) return;
		for(var i=0;i<options.length;i++)
		{
			var option = options[i];
			if (option == null) continue;
			if (option.Categories)
				buildOptionsHash(option.Categories,option.IsCategory && optionsObj.TreeSeparator ? option.text + optionsObj.TreeSeparator  : prefix);
			if (option.Options)
				buildOptionsHash(option.Options,option.IsCategory && optionsObj.TreeSeparator ? option.text + optionsObj.TreeSeparator : prefix);

			option.text = prefix + (option.text || option.code);
			option.code = option.code || option.text;
			if (option.text.constructor.toString().indexOf("Array") != -1)
				option.text = option.text[0];
			option.text = ajaxart_multilang_text(option.text,context);
			if (option.image && option.image != '') 
				optionsObj.HasImages = true;
			optionsObj.TextToCodeHash[option.text] = option.code;
			optionsObj.CodeToTextHash[option.code] = option.text;
			optionsObj.CodeToOptionHash[option.code] = option;
		}
	}
	buildOptionsHash(optionsObj.Options);
	if (optionsObj.IsTree)
		buildOptionsHash(optionsObj.Categories);
	
	optionsObj.IsValidOptionText = function(field,txt)
	{
		return this.TextToCodeHash[txt] != null;
	}
	optionsObj.IsValidOptionCode = function(field,code)
	{
		return this.CodeToTextHash[code] != null || (field.AllowEmptyValue && code == '');
	}
	optionsObj.FixedCodes = function(field,value,old_value)
	{
		var optionsObj = this;
		var result = value;
		if (field.Multiple) // trim ','
			result = result.replace(/[,]+$/, '').replace(/^[,]+/, ''); 
		if (field.AllowValueNotInOptions) return result;
		if (field.Multiple) // remove non-options
		{
			var new_val = '';
			var values = result.split(',');
			
			for(var i=0;i<values.length;i++)
			{
				if (optionsObj.IsValidOptionCode(field,values[i]))
					new_val += values[i];
				if (i != values.length-1) 
					new_val += ',';
			}
			result = new_val;
		}
		else // if not an option, back to old value
			if ( ! optionsObj.IsValidOptionCode(field,result))
				result = old_value;
		return result;
	}
	optionsObj.CodesToText = function(field,options)
	{
		var optionsObj = this;
		if (options == '') return '';
		if (field.Multiple)
		{
			var result = '';
			var values = options.split(',');
			for(var i=0;i<values.length;i++) {
				result += optionsObj.codeToText(values[i]);
				if (i != values.length-1) 
					result += ',';
			}
			return result;
		}
		// single
		return optionsObj.codeToText(options);
	}
	optionsObj.TextToCodes = function(field,options)
	{
		var optionsObj = this;
		if (options == '') return '';
		if (field.Multiple)
		{
			var result = '';
			var values = options.split(',');
			for(var i=0;i<values.length;i++) {
				result += optionsObj.textToCode(values[i]);
				if (i != values.length-1) 
					result += ',';
			}
			return result;
		}
		// single
		return optionsObj.textToCode(options);
	}
	optionsObj.Text = function(field,data1)
	{
		var optionsObj = this;
		var value = ajaxart.totext_array(data1);
		var fixed_value = optionsObj.FixedCodes(field,value,'');
		return optionsObj.CodesToText(field,fixed_value);
	}
	optionsObj.Initialized = true;
}

function aa_initPicklistField(field,data,profile,context)
{
	if (! field.AllowEmptyValue)
		field.DefaultValue= function(data1,ctx) 
		{  
			// first option as default value
			var optionsObj = field.Options;
			if (optionsObj.IsTree && optionsObj.Categories[0] && optionsObj.Categories[0].Options[0]) 
				return [optionsObj.Categories[0].Options[0].code]; // option from first category - can be a bug
			if (optionsObj.Options[0])
				return [optionsObj.Options[0].code];
			return [];
		}

	field.Text = function(data1,ctx) {
		var result = ajaxart.totext_array(data1);
		if (field.Multiple)
		{
			var options = result.split(',');
			result = '';
			for(var i=0;i<options.length;i++)
			{
				result += field.Options.codeToText(options[i]);
				if (i!=options.length-1)
					result += ", ";
			}
		}
		else
		{
			var code = result;
			var result = field.Options.codeToText(code);
			if (field.Options.HasImages) {
				var img = field.Options.codeToImage(code);
				if (img != null && img != "") result = "<img class='aa_imagebeforetext' src='"+img+"'/>"+result; // should be fixed
			}
		}
		return [result];
	}

	field.OptionPage = function(option,field,field_data,item,readonly,picklist_input) 
	{
		var out = document.createElement('span');
		if (option != null && option.OptionPage != null)
		{
			item = option.ItemForOptionPage || item; 
			var pageId = aa_totext(field_data).replace(new RegExp(' ', "g"),'_').replace(new RegExp('/', "g"),'_');
			var page_params = {isObject:true, PageID: pageId , DataItems: {isObject: true, Items: item }}
			if (readonly) page_params.ReadOnly = true; 
			var newContext = aa_ctx(context, { _PageParams: [page_params] , _PicklistOfOptionPage: [ picklist_input ] } ); 
			out = ajaxart_runMethod(item,option.OptionPage,'Control',newContext)[0];
		}
		jQuery(out).addClass('aa_option_page');
		
		return out;
	}
	field.RefreshOptionPage = function(cell,item,isUpdated,prevValue)
	{
		var field_data = cell.FieldData;
		var input = aa_find_field_input(cell);
		if (!input || !input.relevantOptionsObject) return;
		var optionsObj = input.relevantOptionsObject() || input.Options;
		if (optionsObj == null) return;
		
		var option = optionsObj.codeToOption(ajaxart.totext_array(field_data));
		var new_ctrl = this.OptionPage(option,field,field_data,item,false,input);

		if (! cell.jbOptionsPageElement) {
			if (cell.jbFieldElement && cell.jbFieldElement.jbOptionsPage) 
				cell.jbOptionsPageElement = cell.jbFieldElement.jbOptionsPage();
			
			if (!cell.jbOptionsPageElement) {
				cell.jbOptionsPageElement = jQuery('<div/>')[0];
				cell.appendChild(cell.jbOptionsPageElement);
			}
		}
		cell.jbOptionsPageElement = aa_replaceElement(cell.jbOptionsPageElement,new_ctrl,true);
	}

	field.initInput = function(input,field_data,ctx)
	{
		aa_defineElemProperties(input,'FixValue,Refresh,Clear,Save,ContainsValue,UpdateFromPopupAndClose,PopupCntr,relevantField,relevantOptionsObject,setValue,ClosePopup,OpenPopup,TogglePopup');
		
		input.FixValue = function(save)
		{
			var input = this;
			if (!input.getValue) return;
			var optionsObj = input.relevantOptionsObject();
			var field = input.relevantField();
			var oldValue = ajaxart.totext_array(field_data);
			var fixedOldValue = optionsObj.FixedCodes(field,oldValue,''); // if old value is not valid, use '' instead. useful for country/city
			var new_val = optionsObj.TextToCodes(field,input.getValue());
			var fixed_value = optionsObj.FixedCodes(field,new_val,fixedOldValue);
			var option = optionsObj.CodeToOptionHash[new_val];
			if (option) option = [option.source]; else option = [];
			if (oldValue != fixed_value && save)
			{
				ajaxart.writevalue(field_data, fixed_value);
				if (field.EnrichData) field.EnrichData(field,field_data);
				aa_invoke_field_handlers(field.OnUpdate,input,null,field,field_data,{ isObject:true, OldValue: [oldValue] , Option: option});
			}
			input.setValue(optionsObj.CodesToText(field,fixed_value));
		}
		input.SetPicklistValue = function(new_value,ctx1)
		{
			var field = input.relevantField();
			var oldValue = ajaxart.totext_array(field_data);
			var forPreviewOnly = aa_tobool(ctx1.vars.ForPreviewOnly);
			if (!forPreviewOnly) 
				input.LastValue = ajaxart.totext_array(new_value);
			ajaxart.writevalue(field_data, new_value,forPreviewOnly);
			if (field.EnrichData) field.EnrichData(field,field_data);
			aa_invoke_field_handlers(field.OnUpdate,input,null,field,field_data,{ isObject:true, OldValue: [oldValue]});
			input.Refresh();
		}
		input.RecalcOptions = function(new_value,ctx1)
		{
			var field = input.relevantField();
			input.OptionObjects[field.Id || ''] = field.RecalcOptions([],ctx1);
		}
		input.Refresh = function()
		 { 
			var input = this;
			var optionsObj = input.relevantOptionsObject();
			var field = input.relevantField();
			input.setValue(optionsObj.Text(field,field_data));
			if (input.RefreshDescriptionForEmptyText)
				input.RefreshDescriptionForEmptyText();
		 }
		input.Clear = function()
		{
			this.value = "";
			this.FixValue(true);
		}
		input.Save = function()
		{
			this.FixValue(true);
		}
		input.ContainsValue = function(option)
		{
			var current_codes = ajaxart.totext_array(field_data);
			var option_code = option[0].code;
			return ((',' + current_codes + ',').indexOf(',' + option_code + ',') != -1);
		}
		// handle select and keyboard from popup
		input.UpdateFromPopupAndClose = function(selected,ctx1,keyboard) { return input.UpdateFromPopup(selected,ctx1,keyboard,true);} 
		input.UpdateFromPopup = function(selected,ctx1,keyboard,autoClose) 
		{
			var input = this;
			var popup = input.PopupCntr();
			if (popup && popup.PicklistField)
			{
				var optionsObj = input.OptionObjects[popup.PicklistField.Id || ''];
	
				if (!selected || selected.length == 0) selected = ajaxart_itemlist_getSelectedItems(popup);
				
				if (field.SearchBox) {
				  input.ClosePopup();
				  input.value="";
				  if (input.RefreshDescriptionForEmptyText)
			        input.RefreshDescriptionForEmptyText();
				  aa_invoke_field_handlers(field.OnUpdate,input,null,field,selected,{ Option: selected});
				  return;
				}
				
				if (selected.length > 0 && !selected[0].code) { // for pick page and customize operation
					var selected1 = optionsObj.SourceToOption(selected)[0];
					if (!selected1) selected1 = optionsObj.codeToOption(selected);
					if (selected1) selected = [selected1];
				}
				 
				if (autoClose) // unselect
					jQuery(popup.Ctrl).find('.aa_selected_item').removeClass('aa_selected_item');
				
				if (selected.length > 0 && !selected[0].UnSelectable)
				{
					var selected_text = optionsObj.OptionText(selected)[0];
					if (field.Multiple)
					{
						var lastValue = input.getValue().split(',').pop();
						var inList = optionsObj.IsValidOptionText(popup.PicklistField,lastValue);
						if (!inList)
						{
							if (input.getValue().indexOf(',') == -1) // remove last value typed by the user
								input.setValue('');
							else
								input.setValue(input.getValue().replace(/[,][^,]*$/, '')); // remove last value
						}
						
						// if value exists remove it
						if ((',' + input.getValue() + ',').indexOf(',' + selected_text + ',') != -1)
						{
							var value = ',' + input.getValue() + ',';
							value = value.replace(',' + selected_text + ',',','); // remove
							value = value.replace(/[,]+$/, '').replace(/^[,]+/, '');// trim ',' 
							input.setValue(value); 
						}
						else // otherwise add it at the end
						{
							if (input.getValue() == '')
								input.setValue(selected_text);
							else
								input.setValue(input.getValue() + ',' + selected_text);
						}
					}
					else 
						input.setValue(selected_text);
					
					input.Save();
				}
				if (field.Multiple) // do with and without selection
				{
					var elems = jQuery(popup.Ctrl).find('.aa_item').get();
					ajaxart_uiaspects_refreshElements(elems);
					if (keyboard && !field.AllowValueNotInOptions)
						input.setValue(input.getValue() + ',');
				} else if (autoClose) {
					input.ClosePopup();
					jBart.trigger(jBart,'userChoice',{ selection: field_data[0], fieldId: field.Id, fieldXtml: field.XtmlSource && field.XtmlSource[0] && field.XtmlSource[0].script, context: ctx });
				}
				if (selected.length == 0)
				{
					if (autoClose) input.ClosePopup();
					input.Save();
					//jQuery(input).focus().trigger({ type : 'keypress', which : 9 });
				}
			}
			if (field.AllowValueNotInOptions && keyboard) // do with and without popup
				input.Save();
			
			return [];
		}
	    input.PopupCntr = function()
	    {
	    	var popups = ajaxart.dialog.openPopups;
	    	for(var i in popups)
	    		if (popups[i].onElem == input)
	    		{
	    			var popup = popups[i].contents;
					var cntr_ctrl = jQuery(popup).hasClass('aa_container') ? popup : jQuery(popup).find('.aa_container')[0];
					if (!cntr_ctrl) return;
					cntr_ctrl.Cntr.Dlg = popups[i].Dlg; 
					return cntr_ctrl.Cntr;
	    		}
	    }
	    input.relevantField = function()
	    {
	    	return field;
	    }
	    input.relevantOptionsObject = function()
	    {
	    	return this.OptionObjects[this.relevantField().Id || ''];
	    }
	    input.setValue = function(newVal)
	    {
	    	if (input.value != newVal) 
		    	input.value = newVal;
		    input.setAttribute('value',newVal);
	    }
		input.ClosePopup = function() 
		{
			var field = this.relevantField();
			if (input.PopupCntr())
				aa_closePopup();
		}
		input.RevertToLastValue = function() {
			if (input.LastValue != null && input.value != input.LastValue) {
				input.setValue(input.LastValue);
				input.Save();
			}
			if (field.RevertToOriginalValue) field.RevertToOriginalValue(input,field_data,ctx);
		},
		input.OpenPopup = function(keyboard) 
		{
			var input = this;
			if (input.calcOpenPopupField) input.calcOpenPopupField();
			var field = this.relevantField();
			if (field.DynamicSuggestions || field.RecalculateForEachCell)
				input.OptionObjects[field.Id || ''] = field.RecalcOptions([],ctx);
			if (field.RecalcOccurrences)
				field.RecalcOccurrences(input.OptionObjects[field.Id || ''],ctx);
			var popup = input.PopupCntr();
			if (popup && (popup.PicklistField != field || input.relevantOptionsObject().Options.length == 0 ))
			{
				input.ClosePopup();
				popup = input.PopupCntr();
			}
			if (! popup && field.OpenPopup) { 
				input.LastValue = input.value;
				if (field.StoreOriginalValue) field.StoreOriginalValue(input,ctx);
				field.OpenPopup(data,aa_ctx(ctx,{_PicklistInput: [input], _Field:[field], OptionsObj: [input.OptionObjects[field.Id || '']] }));
			}
			// wait for the popup
			var tries = 0;
			function checkPopup() {
				if (tries++ < 10) {
					popup = input.PopupCntr();
					if (popup) { 
						initPopup(); 
						return; 
					} else {
						setTimeout(checkPopup,100);
					} 
				}
			}
			checkPopup();
			function initPopup() {
				if (popup.Dlg && !field.Multiple)
					jBart.bind(popup.Dlg,'cancel',function() {
						input.RevertToLastValue();
					});
				if (popup)
				{
					popup.PicklistPopup = true;
					popup.InputCtrl = input;
					popup.PicklistField = field;
					var searchText = input.getValue();
					if (field.Multiple)
						searchText = input.getValue().split(',').pop();
					if (keyboard && popup.DoFind && !jQuery(input).attr('readonly'))
					{
						popup.DoFind(searchText.toLowerCase());
						if (popup.Ctrl.parentNode && popup.Ctrl.parentNode.RePosition)
							popup.Ctrl.parentNode.RePosition();
					}
					if (!keyboard && popup.SelectByPattern)
						popup.SelectByPattern(searchText.toLowerCase())
				}
			}
		}
		input.TogglePopup = function() 
		{
			if (! input.PopupCntr()) 
				input.OpenPopup();
			else
				input.ClosePopup();
		}
		// API
		input.addOptions = function(classOrElem,initOptionFunc) 
		{
			var picklist = this;
			picklist.optionElems = [];
		    var inner = this.getInnerElement(classOrElem);
			if (!inner || !initOptionFunc ) return;
			var innerParent = inner.parentNode;
			
			for(var i=0;i<field.Options.Options.length;i++) {
				var option = field.Options.Options[i];
				var elem = inner.cloneNode(true);
				innerParent.insertBefore(elem,inner);
				var option_obj = aa_api_object(elem,{ Option: option, Field: field,
					Text: option.text,
					isSelected: function() {
						var val = aa_totext(field_data);
						var optionCode = this.Option.code;
						if (val.indexOf(optionCode) == -1) return false;
						if (field.Multiple) {
							return (','+val+',').indexOf(','+optionCode+',') > -1;
						} else {
							return val == optionCode;
						}
					},
					select: function() {
						if (field.Multiple && aa_totext(field_data)) {
							var val = this.Option.code;
							var vals = aa_totext(field_data).split(',');
							for(var i=0;i<vals.length;i++)
								if (vals[i] == val) return;
							vals.push(val);
							picklist.set(vals.join(','));
						} else {
							picklist.set(this.Option.code);
						}
					},
					toggleSelection: function() {
						if (this.isSelected()) 
						  this.unSelect();
						else 
						  this.select();
					},
					unSelect: function() {
						if (! this.isSelected()) return;
						if (field.Multiple) {
							var val = this.Option.code;
							var vals = aa_totext(field_data).split(',');
							for(var i=0;i<vals.length;i++) {
								if (vals[i] == val) {
									vals.splice(i,1);
									break;
								}
							}
							picklist.set(vals.length > 0 ? vals.join(',') : '');
						} else {
							picklist.set('');
						}
					},
					setSelectedOnClick: function(selectedClass) {
						var option = this;
					    if ( option.isSelected() ) jQuery(option).addClass(selectedClass);
					    jQuery(option).click(function() {
					      var wasSelected = option.isSelected();
					      option.toggleSelection();
					      
					      if (picklist.Multiple) {
					        jQuery(option).toggleClass(selectedClass);
					      } else {
					        jQuery(picklist.optionElems).removeClass(selectedClass);
					        if (!wasSelected)
					          jQuery(option).addClass(selectedClass);
					      }
					    });
					}
				});
			    this.optionElems.push(option_obj);
				initOptionFunc(option_obj,picklist);
			}
			inner.parentNode.removeChild(inner);
		  };
		  input.set = function(value) {
			ajaxart.writevalue(field_data,value);
			field.RefreshOptionPage(this.parentNode,ctx.vars._Item,false);
			jBart.trigger(jBart,'userChoice',{ selection: field_data[0], fieldId: field.Id, fieldXtml: field.XtmlSource && field.XtmlSource[0] && field.XtmlSource[0].script, context: ctx });
			aa_invoke_field_handlers(field.OnUpdate,this,null,field,field_data);	
			jBart.trigger(this,'update');
		  }
		  input.get =  function() {
			  return aa_totext(field_data);
		  }
		  input.clear = function() {
			  this.set('');
		  }
		  input.createClearButton = function(selectedClass,text) {
			var picklist = this; 
		    var jClearBtn = jQuery('<div />').text(text);
		    if (picklist.get() == '') jClearBtn.addClass(selectedClass);
		    jClearBtn.click(function() { 
		      picklist.clear();
		      jQuery(picklist.optionElems).removeClass(selectedClass);
		      jClearBtn.addClass(selectedClass);
		    });
		    picklist.bind('update',function() { 
		      if (picklist.get()) 
		    	  jClearBtn.removeClass(selectedClass);
		      else 
		    	  jClearBtn.addClass('selected');
		    });
		    return jClearBtn[0];
		  }
	};

	aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
		var cntr = ctx.vars._Cntr && ctx.vars._Cntr[0];
		if (ajaxart_field_is_readOnly(cntr,cell.Field,ctx)) {
			if (cell_presentation == "control") {
			  var option = field.Options.CodeToOptionHash[aa_totext(field_data)];
			  if (option && option.OptionPage) 
			    cell.appendChild(field.OptionPage(option,cell.Field,field_data,item,true));
			}
			return;
		}
		var input = aa_find_field_input(cell);
		if (field.DelayedOptionCalculation)
			field.DynamicSuggestions = true;

		if (input != null)
		{
			aa_defineElemProperties(input,'OptionObjects');
			
			input.OptionObjects = {};
			if (field.RecalculateForEachCell)
				input.OptionObjects[field.Id || ''] = field.RecalcOptions(item,ctx);
			else
				input.OptionObjects[field.Id || ''] = field.Options;
			var newContext = aa_ctx(ctx,{_Field: [field], _FieldData: field_data, _Input: [input], _Item: item} );
			field.initInput(input, field_data, aa_merge_ctx(context,newContext));
			input.FixValue();
			if (!field.AllowValueNotInOptions && field.Options && field.Options.Options.length < 3 && ! field.Options.Categories)
				jQuery(input).attr('readonly', 'readonly');
		}

		if (cell_presentation == "control" && field.RefreshOptionPage)
			field.RefreshOptionPage(cell,item,false);
	});

	aa_field_handler(field,'OnUpdate', function(field,field_data,input,e,extra) {
		var cell = jQuery(input).parents('.aa_cell_element')[0];
		if (jQuery(cell).parents('.aa_item')[0])
		{
			var item = jQuery(cell).parents('.aa_item')[0].ItemData;
			field.RefreshOptionPage(cell,item,true, (extra && extra.OldValue) ? extra.OldValue[0] : null);
		}
	});

	aa_field_handler(field,'OnKeydown', function(field,field_data,input,e)
	{
		var navigation = false;
		var keyCode = e.keyCode;
		for(var i=0;i<aa_navigation_codes.length;i++)
			if (keyCode == aa_navigation_codes[i]) navigation = true;
		if (field.Options.IsTree) // left-right for tree navigation
			navigation = navigation || keyCode == 37 || keyCode == 39;

		if (navigation) // up/down
		{
			if (ajaxart.dialog.openPopups.length > 0)
				ajaxart_stop_event_propogation(e);

			var popup = input.PopupCntr();
			if (popup)
			{
				popup.SelectionKeydown(e); // delegate to cntr selection
				if (popup.ToggleByKeyboard)
					popup.ToggleByKeyboard(e);
			}
			return false;
		}
		if (keyCode == 13 ) // enter - UpdateValueAndClose
		{
			if (ajaxart.dialog.openPopups.length > 0) // TODO: fix for nested popups
				ajaxart_stop_event_propogation(e);

			input.UpdateFromPopupAndClose(null,null,true);
		}
		if (keyCode == 9) {// tab - clean and next
			input.FixValue();
			return;
		}
		if (keyCode == 27) // escape
		{
			var popup = input.PopupCntr();
			if (popup) {
			  jBart.trigger(popup.Dlg ,'cancel');
			  input.ClosePopup();
			  
			  ajaxart_stop_event_propogation(e);	// if the picklist is inside a dialog, do not close the dialog
			}
			return false;
		}
	});

	aa_field_handler(field,'OnKeyup',function(field,field_data,input,e)
	{
		var navigation = false;
		var keyCode = e.keyCode;
		if (keyCode == 40 && input.PopupCntr() == null) // arrow down should open the popup
		{
			input.OpenPopup();
			return false;
		}
		for(var i=0;i<aa_navigation_codes.length;i++)
			if (keyCode == aa_navigation_codes[i]) navigation = true;
		if (field.Options.IsTree) // left-right for tree navigation
			navigation = navigation || keyCode == 37 || keyCode == 39;
		if (navigation) return true;

		if (keyCode == 9) {// tab - UpdateValueAndClose and next
			input.UpdateFromPopupAndClose(null,null,true);
			return;
		}
		if (keyCode == 13 || keyCode == 27 || keyCode == 9) return true;
		if (keyCode == 8 && !input.value) // last backspace should close popup
		{
			input.ClosePopup();
			return false;
		}
		
		if (field.Multiple && keyCode == 188) // comma - do not save, to avoid 'fixing' the comma
		{
			if (! aa_bool(data,profile,'DoNotOpenFromInputArea',context))
				input.OpenPopup(true);
			return;
		}
		if (field.AllowValueNotInOptions || (field.AllowEmptyValue && input.getValue() == '') )
			input.Save();
		if (! aa_bool(data,profile,'DoNotOpenFromInputArea',context))
			input.OpenPopup(true);
	});
	aa_field_handler(field,'OnBlur',function(field,field_data,input,e)
	{
		input.FixValue();
		input.Save();
//		input.ClosePopup(); 
		if (ajaxart.controlOfFocus == input)
		  ajaxart.controlOfFocus = null;
		if (input.RefreshDescriptionForEmptyText)
			input.RefreshDescriptionForEmptyText();
		return true;
	});
	aa_field_handler(field,'OnMouseDown',function(field,field_data,input,e)
	{
		if (! aa_bool(data,profile,'DoNotOpenFromInputArea',context))
			input.OpenPopup();
	});

}
//AA BeginModule
ajaxart.gcs.picklist =
{
	SoftPickOnHover: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var timeBeteenPicks = aa_int(data,profile,'TimeBeteenPicks',context) || 500;
		aspect.InitializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var input = ctx.vars._Input && ctx.vars._Input[0];
			if (!input) return;
			input.SoftPickOnHover = true;
			jBart.bind(cntr,'selection', function(evt){
				if (evt.method == 'hover' || evt.method == 'keyboard') {
					input.UpdateFromPopup(evt.selected.ItemData,evt.context,false,false);
				}
			});
		}
		var result = ajaxart.runNativeHelper(data,profile,'RequiresAspects',context);
		result.push(aspect);
		return result;
	},
	CheckBox: function (profile,data,context)
	{
		var aspect = { isObject : true };
	
		aspect.InitializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			function refreshValue(ctx2,new_value)
			{
				var input = ctx2.vars._Input[0];
				var field_data = ctx2.vars._FieldData;
				var field = ctx2.vars._Field[0];
				var oldValue = ajaxart.totext_array(field_data);
				ajaxart.writevalue(field_data, new_value);
				if (field.EnrichData) field.EnrichData(field,field_data);
				aa_invoke_field_handlers(field.OnUpdate,input,null,field,field_data,{ OldValue: [oldValue]});

				input.Refresh();
			}
			cntr.SelectAll = function(data1,ctx2)
			{
				var input = ctx2.vars._Input[0];
				var all_values = '';
				jQuery(this.Ctrl).find('.aacheckbox_value').parent().filter('.aa_item').each(function () {
						all_values += this.ItemData[0].code + ','; 
				});
				all_values = all_values.substring(0,all_values.length-1); // trim last comma
				refreshValue(ctx2,all_values);
				input.ClosePopup();
				input.OpenPopup();
			}
			cntr.ClearAll = function(data1,ctx2)
			{
				var input = ctx2.vars._Input[0];
				refreshValue(ctx2,'');
				input.ClosePopup();
			}
		}
		aspect.InitializeElements = function(initData,ctx)
		{
			var elems = ctx.vars._Elems;
			var input = ctx.vars._Input[0];
			
			for(var i=0;i<elems.length;i++)
			{
				var elem = elems[i];
				if (elem.ItemData[0].UnSelectable) continue;
				var checkbox = document.createElement('input');
				checkbox.className = "aacheckbox_value";
				checkbox.setAttribute("type","checkbox");
				checkbox.onclick = function(e)
				{
	  	  	    	input.focus();
				    return false;
				}
				if (input.ContainsValue(elem.ItemData))
					aa_checked(checkbox,true);
				jQuery(elem).find('>.aacheckbox_value').remove();
				ajaxart_uiaspects_append(elem,checkbox);
			}
		}
		return [aspect];
	},
	ItemTextForPicklist: function (profile,data,context)
	{
	    var textClass = aa_attach_global_css( aa_text(data,profile,'ItemCss',context),null,'picklistitem' ); 
	    var occClass = aa_attach_global_css( aa_text(data,profile,'OccurrencesCss',context),null,'occurrences' ); 
	    
		return [{
			InitializeContainer: function(data1,ctx)
			{
				var cntr = ctx.vars._Cntr[0];
				cntr.ItemText = function(data2,ctx2)
				{
					var item = data2[0];
					return [item.IsOperation ? item.Title() : item.text];
				}
			},
			InitializeElements: function(data1,ctx)
			{
				var elems = ctx.vars._Elems;
				var field = ctx.vars._Field[0];
				for(var i in elems)
				{
					var elem = elems[i];
					if (jQuery(elem).find('>.aa_text').length) continue;
					var text_span = document.createElement('span');
					text_span.className = "aa_text " + textClass;
					text_span.setAttribute("tabindex",1);
					var item = elem.ItemData[0];
					if (item.IsOperation)
						var text = item.Title();
					else
						var text = item.text; // option
					if (field.Options.IsTree && field.Options.TreeSeparator)
						text = item.text.split(field.Options.TreeSeparator).pop();
					
					text_span.innerHTML = text;
					
					jQuery(elem).find('>.aa_text_and_occ').remove();
					
					if (field && field.OccurrencesCtrl)
					{
						var text_and_occurrences = document.createElement('span');
						text_and_occurrences.className = 'aa_text_and_occ';
						text_and_occurrences.appendChild(text_span);
						jQuery(text_span).css('padding','0 3px 0 0');
						var occ_elem = field.OccurrencesCtrl(elem.ItemData,ctx);
						jQuery(occ_elem).addClass('aa_not_selectable aa_occurences').addClass(occClass);
						text_and_occurrences.appendChild(occ_elem);
						if (elem.ItemData[0].Occ && elem.ItemData[0].Occ.length == 0)
							jQuery(elem).addClass('aa_zero_occ');
						ajaxart_uiaspects_append(elem,text_and_occurrences);
					}
					else
						ajaxart_uiaspects_append(elem,text_span);
				}
			}
		}];
	},
	PopupItems: function (profile,data,context)
	{
		var out = [];
		var optionsObj = context.vars._Input[0].relevantOptionsObject();
		var options = optionsObj.Options; 
		if (optionsObj.IsTree) ajaxart.concat(out,optionsObj.Categories);
		
		for(var i=0;i<options.length;i++)
			if (! options[i].Hidden) out.push(options[i]);
		return out;
	},
	SimpleOptions: function (profile,data,context)
	{
	  var out = { isObject: true, Options: [] };
	  var options = ajaxart_run_commas(data,profile,'Options',context);
	  for (var i=0;i<options.length;i++)
		  options[i] = options[i].replace(/^\s+|\s+$/g,"");
	  var default_image = aa_text(data,profile,'DefaultImage',context);
	  default_image = default_image != '' ? default_image : null;
	  for (var i=0;i<options.length;i++)
		  out.Options.push( { isObject: true, code: options[i], image: default_image } );
	  return [out];
	},
	RichOptions: function (profile,data,context)
	{
		var out = { isObject: true, Options: [] };
		var options = ajaxart.runsubprofiles(data,profile,'Option',context);
		out.Options = options;
		return [out];
	},
	OptionsWithOperations: function (profile,data,context)
	{
		var out = aa_first(data,profile,'Options',context);
		out.Operations = function(data1,ctx) {
			return ajaxart.runsubprofiles(data1,profile,'Operation',aa_merge_ctx(context,ctx));
		}
		return [out];
	},
	DynamicOptions: function (profile,data,context)
	{
		var out = { isObject: true, Options: [] };
		// data = context.vars._Item || data;
		var options = ajaxart.run(data,profile,'Options',context);
		var codeScript = ajaxart.fieldscript(profile,'OptionCode',true);
		var openPageScript = ajaxart.fieldscript(profile,'OptionPage',true);
		var textScript = ajaxart.fieldscript(profile,'OptionLabel',true);
		var imageScript = ajaxart.fieldscript(profile,'OptionImage',true);
		var code_compiled = aa_optimized_compile_text_single(profile,'OptionCode',context);
		var label_compiled = aa_optimized_compile_text_single(profile,'OptionLabel',context);
		var image_compiled = aa_optimized_compile_text_single(profile,'OptionImage',context);
		var autoCode = aa_bool(data,profile,'OptionCodeByIndex',context);
		
		for(var i=0;i<options.length;i++) {
			var opt = options[i];
			var code = null;
			var text = null;
			var image = null;
			if (codeScript) 
				code = code_compiled(opt ,context);
			else if (autoCode) code = "" + i;
			else code = ajaxart.totext_item(opt);
			if (textScript) text = label_compiled(opt ,context);
			if (imageScript) image = image_compiled(opt ,context);
			
			var optionObject = { code: code, text: text, image: image, source: opt, Node: opt };
			if (openPageScript)
				optionObject.OptionPage = aa_first([opt],profile,'OptionPage',context);
			out.Options.push(optionObject);
		}
		return [out];
	},
	CalcOccurrencesWithFilters: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		if (field == null) return;
		field.CountOccurences = function(wrappers,baseField,options) {
			for(var i in options.Options) {
				var option = options.Options[i];
				option.filter = baseField.newFilter([option.code]);
			}
			for(i in wrappers)
			{
				var wrapper = wrappers[i];
				for (var j in options.Options) {
					var option = options.Options[j];
					if (option.filter.Match(baseField,wrapper)) {
						if (!option.Total) option.Total = [];
						if (!option.Occ) option.Occ = [];
						option.Total.push(wrapper);
						if (!wrapper.hidden) option.Occ.push(wrapper);
					}
				}
			}
		};
	},
	ShowOccurrences: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		if (field == null) return;
		field.DelayedOptionCalculation = true;
		field.DynamicSuggestions = true;
		
		function cleanOptions(options)
		{
			for(var i in options)
			{
				options[i].Total = []; 
				options[i].Occ = [];
			}
		}
		function cleanCategory(category)
		{
			cleanOptions(category.Options);
			for(var i in category.Categories)
				cleanCategory(category.Categories[i]);
		}
		if (!field.CountOccurences) {
			field.CountOccurences = function(wrappers,baseField,options) {	// every option is a simple value
				var field_id = baseField.Id;
				if (baseField.Options && baseField.Options.FilteredField) field_id = baseField.Options.FilteredField.Id;
				for(var i in wrappers)
				{
					var wrapper = wrappers[i];
					var val = wrapper[field_id];
					if (baseField.Multiple)
						var vals = val.split(',');
					else
						var vals = [val];
					for(var j in vals)
					{
						var val = vals[j];
						var option = options.CodeToOptionHash[val];
						if (!option) continue;
						if (!option.Total) option.Total = [];
						if (!option.Occ) option.Occ = [];
						option.Total.push(wrapper);
						if (!wrapper.hidden) option.Occ.push(wrapper);
					}
				}
			};
		}
		field.RecalcOccurrences = function(options)
		{
			var cntr = context.vars.DataHolderCntr[0];
			var baseField = null;
			if (field.FilterBaseFieldID) {
				baseField = aa_fieldById(field.FilterBaseFieldID,cntr.Fields);
			}
			baseField = baseField || (context.vars._OriginalField || context.vars._Field)[0];
			var field_id = baseField.Id;
			if (field.Options && field.Options.FilteredField) field_id = field.Options.FilteredField.Id;
			
			cntr.DataHolder = cntr.DataHolder || aa_createDataHolderFromCntr(cntr,context);
			var wrappers = cntr.DataHolder.Wrappers;
			var filters = cntr.DataHolder.UserDataView.Filters;
			if (!options) return;
			
			cleanOptions(options.Options);
			for(var i in options.Categories)
				cleanCategory(options.Categories[i]);

			for(var i in wrappers)
			{
				var wrapper = wrappers[i];
				var val = wrapper[field_id];
				var hidden = false;
				for(j in filters)
				{
					var filter = filters[j];
					if (filter.field.Id == field_id) continue; // ignore current field
					filter.SetFilterData(filter.rawFilterData);
					if (filter.Match(filter.field,wrapper) == false)
						hidden = true;
				}
				wrapper.hidden = hidden;
			}
			this.CountOccurences(wrappers,baseField,options);
			var sortBy = aa_text(data,profile,'SortBy',context);
			if (sortBy == 'filtered occurrences')
				options.Options.sort(function(a,b) { return b.Occ.length - a.Occ.length; });
			else if (sortBy == 'original occurrences')
				options.Options.sort(function(a,b) { return b.Total.length - a.Total.length; });
			else if (sortBy == 'ascending')
				options.Options.sort(function(a,b) { return ( a.code < b.code ) ? -1 : 1; });
			else if (sortBy == 'descending')
				options.Options.sort(function(a,b) { return ( b.code < a.code ) ? -1 : 1; });
		}
		field.CalcOccOfCategory = function(category)
		{
			var occ = [];
			var total = [];
			for(var i in category.Options)
			{
				occ = occ.concat(this.Options.CodeToOptionHash[category.Options[i].code].Occ || []);
				total = total.concat(this.Options.CodeToOptionHash[category.Options[i].code].Total || []);
			}
			for(var i in category.Categories)
			{
				var res = this.CalcOccOfCategory(category.Categories[i]);
				occ = occ.concat(res.Occ);
				total = total.concat(res.Total);
			}
			category.Occ = occ;
			category.Total = total;
			return { Occ: occ, Total: total} 
		}

		function buildOccurrencesCtrl(occ,noParanthesis)
		{
			var cntr = context.vars.DataHolderCntr[0];
			var rlm = aa_is_rtl(cntr.Ctrl,context) ? '&rlm;' : '';
			if (noParanthesis)
				var span = jQuery('<span>' + occ.length + '</span>')[0];
			else
				var span = jQuery('<span>' + rlm + ' (' + occ.length + ')</span>')[0];
			span.Occ = occ;
			if (cntr.OccurrencesFollowup)
			{
				jQuery(span).addClass('aa_hyperlink');
				span.onclick = function(e) {
					cntr.OccurrencesFollowup(this.Occ,aa_ctx( cntr.Context, {ControlElement:[span], _ItemsOfOperation: this.Occ} ));
					//aa_stop_prop(e);
				}
			}
			return span;
		}
		
		field.OccurrencesCtrl = null;
		var show = aa_text(data,profile,'Show',context);
		if (show == 'filtered occurrences')
			field.OccurrencesCtrl = function(data1,ctx)
			{
				if (!this.Options) return [''];
				if (!data1[0].Occ) this.CalcOccOfCategory(data1[0]);
				var ctrl = buildOccurrencesCtrl(data1[0].Occ);
				jQuery(ctrl).addClass('aa_filter_occurrences');
				return ctrl;
			}
		else if (show == 'original occurrences')
			field.OccurrencesCtrl = function(data1,ctx)
			{
				if (!this.Options) return [''];
				if (!data1[0].Occ) this.CalcOccOfCategory(data1[0]);
				var ctrl = buildOccurrencesCtrl(data1[0].Total);
				jQuery(ctrl).addClass('aa_filter_occurrences');
				return ctrl;
			}
		else if (show == 'filtered and original')
			field.OccurrencesCtrl = function(data1,ctx)
			{
				if (!this.Options) return [''];
				if (!data1[0].Occ) this.CalcOccOfCategory(data1[0]);
				var result = '';
				var of = ajaxart_multilang_text("Of",context);
				var option = data1[0];
				var occ = option.Occ;
				var total = option.Total;
				var ctrl;
				if (occ.length == total.length)
					ctrl = buildOccurrencesCtrl(data1[0].Occ);
				else 
				{
					ctrl = document.createElement('span');
					ctrl.appendChild(jQuery('<span> (</span>')[0]);
					ctrl.appendChild(buildOccurrencesCtrl(occ,true));
					ctrl.appendChild(jQuery('<span style="padding:3px;">of</span>')[0]);
					ctrl.appendChild(buildOccurrencesCtrl(total,true));
					ctrl.appendChild(jQuery('<span>)</span>')[0]);
				}
				return ctrl;
			}
			
		return [];
	},
	SuggestionsFromData: function (profile,data,context)
	{
		var cntr = context.vars.DataHolderCntr[0];
		var field = context.vars._Field[0];
		cntr.DataHolder = cntr.DataHolder || aa_createDataHolderFromCntr(cntr,context);
		var dataholder = cntr.DataHolder;
		field.DelayedOptionCalculation = true;
		if (!aa_bool(data,profile,'Static',context))
			field.DynamicSuggestions = true;
		var support_multiple = aa_bool(data,profile,'SupportMultiple',context);
		var out = { isObject: true, Options: [] };
		if (!cntr || !field || !cntr || !dataholder.UserDataView || !dataholder.Wrappers) 
				return [out];
		var wrappers = dataholder.Wrappers;
		var values = {};
		var original_field = context.vars._OriginalField[0];
		var field_id = original_field ? original_field.Id : field.Id;
		var as_text = ajaxart.compile_text(profile, "TextPattern",context);
		
		for(var i in wrappers)
		{
			var wrapper = wrappers[i];
			var hidden = false;
			var current_value = wrapper[field_id];
			var vals = [current_value];
			if (support_multiple) {
				vals = current_value.split(",");
				for (j in vals)
					vals[j] = aa_text_trim(vals[j]);
			}
			for(j in dataholder.UserDataView.Filters)
			{
				var filter = dataholder.UserDataView.Filters[j];
				if (filter.field.Id == field_id) continue; // ignore current field
				if (filter.Match(filter.field,wrapper) == false)
					hidden = true;
			}
			for (j in vals) {
				var val = vals[j];
				values[val] = values[val] || {isObject: true, code: val, Total :0, Occ: [], text:as_text([val],context) };
				values[val].Total++;
				if (!hidden) values[val].Occ.push(wrapper);
			}
		}
		if (!aa_bool(data,profile,'IncludeSpace',context) && values[''])
			delete values[''];
		for(var val in values)
			out.Options.push(values[val]);
		out.Options.sort(function(a,b) { return a.Occ.length < b.Occ.length ? 1 : -1; });
		original_field.Options = out;
		if (support_multiple)
			original_field.Multiple = true;
		original_field.Options.CodeToOptionHash = values;
		return [out];
	},
	OptionsTree: function (profile,data,context)
	{
		var out = { isObject: true, Options: [], IsTree: true };
		out.Categories = ajaxart.runsubprofiles(data,profile,'Category',context);
				
		return [out];
	},
	DynamicTree: function (profile,data,context)
	{
		var out = { isObject: true, IsTree: true, Options: [], Categories: [] };
		var recursive = aa_bool(data,profile,'Recursive',context);
		
		var fillCategory = function(category,nextLevelItems,depth)
		{
			for(var i=0;i<nextLevelItems.length;i++) {
				var item = nextLevelItems[i];
				var nextLevel = ajaxart.run([item],profile,'NextLevel',context);
				var opt = { isObject: true }
				opt.code = aa_text([item],profile,'OptionCode',context);
				opt.text = aa_text([item],profile,'OptionLabel',context);
				opt.image = aa_text([item],profile,'OptionImage',context);
				opt.source = item;
				if (nextLevel.length > 0) {
					opt.IsCategory = true;
					opt.Options = []; opt.Categories = [];
					opt.UnSelectable = ! aa_bool([item],profile,'MiddleNodeSelectable',context);
					category.Categories.push(opt);
					if (recursive && depth < 20)
						fillCategory(opt,nextLevel,depth+1);
				}
				else
					category.Options.push(opt);
			}
		}
		
		var firstLevel = ajaxart.run(data,profile,'FirstLevel',context);
		fillCategory(out,firstLevel,0);
		return [out];
	},
	DynamicTreeByCategories: function (profile,data,context)
	{
		var out = { isObject: true, IsTree: true, Options: [], Categories: [] };
		var categories = ajaxart.run(data,profile,'Categories',context);
		category_set = {}
		for(var i=0;i<categories.length;i++)
		{
			var cat = { isObject: true, Options: [], IsCategory: true, UnSelectable: ! aa_bool([categories[i]],profile,'CategorySelectable',context) };
			cat.text = aa_text([categories[i]],profile,'CategoryName',context);
			cat.code = aa_text([categories[i]],profile,'CategoryCode',context);
			cat.image = aa_text([categories[i]],profile,'CategoryImage',context);
			var subTree = aa_first([categories[i]],profile,'SubTree',context);
			cat.Options = subTree ? subTree.Options : [];
			cat.Categories = subTree ? subTree.Categories : [];
			if (!cat.code || !category_set[cat.code])
				out.Categories.push(cat);
				
			category_set[cat.code] = true;
		}
		var options = ajaxart.run(data,profile,'Options',context);
		for(var i=0;i<options.length;i++)
		{
			var option = { isObject: true };
			option.code = aa_text([options[i]],profile,'OptionCode',context);
			option.text = aa_text([options[i]],profile,'OptionName',context);
			option.image = aa_text([options[i]],profile,'OptionImage',context);
			out.Options.push(option);
		}
		return [out];
	},
	OptionCategory: function (profile,data,context)
	{
		var out = ajaxart.gcs.picklist.RichOptions(profile,data,context)[0];
		out.text = aa_text(data,profile,'Name',context);
		out.code = aa_text(data,profile,'Code',context);
		out.image = aa_text(data,profile,'Image',context);
		out.Categories = ajaxart.runsubprofiles(data,profile,'Category',context);
		out.IsCategory = true;
		out.UnSelectable = ! aa_bool(data,profile,'Selectable',context);
		
		return [out];
	},
	Option: function (profile,data,context)
	{
		var option = 
		{
			isObject: true, 
			code: aa_text(data,profile,'Option',context),
			image: aa_text(data,profile,'Image',context),
			text: ajaxart_multilang_text(aa_text(data,profile,'DisplayName',context),context),
			OptionPage: aa_first(data,profile,'OptionPage',context)
		}
		if (option.text == '') option.text = null;
		return [option];
	},
	InlineItems: function (profile,data,context)
	{
		var image = aa_text(data,profile,'Image',context);
		var items = aa_text_comma_seperate(aa_text(data,profile,'Items',context));
		var out = [];
		for (var i=0; i<items.length; i++) {
			out.push({ isObject:true, Label: items[i], Code: items[i], Image: image });
		}
	    var advItems = ajaxart.subprofiles(profile,'AdvancedItem');
	    for(var i=0;i<advItems.length;i++) {
	    	var advItem = aa_first(data,advItems[i],"",context);
	    	var exists = false;
	    	for (var j=0; j<out.length; j++) {
	    		if (out[j].Label == advItem.Label) {
	    			out[j] = advItem;
	    			exists = true;
	    		}
	    	}
	    	if (!exists)
	    		out.push(advItem);
	    }
	    return out;
	},
	OptionsOfFilteredField: function(profile,data,context)
	{
		var fieldId = context.vars._Field[0].FilterBaseFieldID;
		if (!context.vars.DataHolderCntr || !fieldId) return;
		var cntr = context.vars.DataHolderCntr[0];
		var field = aa_fieldById(fieldId,cntr.Fields);
		if (field && field.Options) 
			return [{ isObject:true, Options: field.Options.Options, FilteredField: field, Categories: field.Options.Categories} ];
	},
	DataOfFilteredField: function(profile,data,context)
	{
		var fieldId = context.vars._Field[0].FilterBaseFieldID;
		if (!context.vars.DataHolderCntr || !fieldId) return;
		var cntr = context.vars.DataHolderCntr[0];
		var field = aa_fieldById(fieldId,cntr.Fields);
		if (!field) return;
		
		var out = { isObject: true, Options: [], FilteredField: field } , values = {};
		cntr.DataHolder = cntr.DataHolder || aa_createDataHolderFromCntr(cntr,context);
		var wrappers = cntr.DataHolder.Wrappers;

		for(var i in wrappers)
		{
			var rawValue = wrappers[i][fieldId]; 
			var val = typeof(rawValue) == 'number' ? '' + rawValue : aa_totext(rawValue);
			values[val] = values[val] || {isObject: true, code: val, Total :0, Occ: [], text:val };
			values[val].Total++;
		}
		
		for(var val in values) out.Options.push(values[val]);

		return [out];
	} 
}
//AA EndModule

function ajaxart_field_option_text(field,field_data,context)
{
	var code = ajaxart.totext_array(field_data); 
	if (field.Options && field.Options.codeToText)
		return field.Options.codeToText(code);
	return code;
}

function aa_optimized_compile_text_single(profile,field,context)	// Best for %@xyz%. Assumes no default value
{
	var fieldscript = ajaxart.fieldscript(profile,field,true);
	if (!fieldscript) return null;
	if (fieldscript.nodeType == 2) {
		var script = fieldscript.nodeValue;
		var att = script.match(/^%@([a-zA-Z_0-9]+$)%/);
		if (att && att[1])
			return function (single_item) {
				return single_item.getAttribute(att[1]);
			}
	}
	var compiled = ajaxart.compile(profile,field,context);
	return function(single_data,context) {
		return ajaxart_runcompiled_text(compiled, [single_data], profile, field ,context);
	}
}



aa_gcs("fld",{
	Field: function (profile,data,context)
	{
		var field = {
			Id: aa_text(data,profile,'ID',context),
			Title: aa_multilang_text(data,profile,'Title',context),
			FieldData: function(data1,ctx) {
				var out = ajaxart.run(data1,profile,'FieldData',aa_ctx(context,ctx));
				if (this.ForceCData && out[0] && out[0].nodeType == 1) {
					var currentValue = aa_totext(out);
					for(var iter=out[0].firstChild;iter;iter=iter.nextSibling) {
						if (iter.nodeType == 4) return out; // we already have cdata. nothing to change
					}
					
					while (out[0].firstChild) out[0].removeChild(out[0].firstChild); // empty
					out[0].appendChild(out[0].ownerDocument.createCDATASection(currentValue)); // add cdata
				}
				
				jBart.trigger(field,'FieldData',{ Item: data1, FieldData: out, Context: ctx });

				return out;
			},
			Control: function() { return [document.createElement('div')]; }
		};
		field.ID = [field.Id];  // backward compatibility
		
		var ctx2 = aa_ctx(context,{_Field: [field]});
		ajaxart.run(data,profile,'FieldType',ctx2);
		ajaxart.runsubprofiles(data,profile,'FieldAspect',ctx2);
		
		return [field];
	},
	CalculatedField: function(profile,data,context)
	{
		var hidden = !aa_bool(data,profile,'Visible',context);
		
		var field = {
			Id: aa_text(data,profile,'ID',context),
			Title: aa_multilang_text(data,profile,'Title',context),
			FieldData: function(data1,ctx) {
				return ajaxart.run(data1,profile,'FieldData',aa_ctx(context,ctx));
			},
			WorkOn: aa_text(data,profile,'WorkOn',context),
			Calculate: function(parentData,ctx) {
				if (this.WorkOn == 'items in itemlist') {
					var itemlistCntr = ctx.vars.ItemListCntr && ctx.vars.ItemListCntr[0];
					var items = itemlistCntr && itemlistCntr.Items;
					if (items) {
						for(var i=0;i<items.length;i++) {
							var item = [ items[i] ];
							var to = this.FieldData(item,ctx);
							var value = ajaxart.run(item,profile,'Value',aa_ctx(context,ctx));
							ajaxart.writevalue(to,value);
						}
					}
				} else {
					// single data
					var to = this.FieldData(parentData,ctx);
					var value = ajaxart.run(parentData,profile,'Value',aa_ctx(context,ctx));
					ajaxart.writevalue(to,value);
				}
			},
			Control: function(field_data,ctx) {
				var text = aa_totext(field_data);
				return jQuery('<div/>').text(text).attr('title',text).get();
			},
			CalculatedOnly: true,
			IsFieldHidden: function() { return hidden;},
			IsHidden: hidden
		};
		field.ID = [field.Id];  // backward compatability
		
		var ctx2 = aa_ctx(context,{_Field: [field]});
		ajaxart.runsubprofiles(data,profile,'FieldAspect',ctx2);
		
		return [field];
	}
});

aa_gcs("fld_type",{
	Text: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.Style = aa_first(data,profile,'Style',context);
		
		field.Control = function(field_data,ctx) {
			var text = aa_totext(field_data);
			var out = aa_renderStyleObject(field.Style,{ text: text, data: field_data[0] },ctx);
			jQuery(out).addClass('aa_field_text');
			return [out];
		} 
	},
	EditableText: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.Style = aa_first(data,profile,'Style',context);
		field.HandleDescriptionForEmptyText = function(desctiptionForEmptyText) {
			field.DescriptionForEmptyText = desctiptionForEmptyText;
		}
		aa_init_class_EditableText();

		field.Control = function(field_data,ctx) {			
			var placeholder = field.DescriptionForEmptyText || '';

			var textApiObject = new ajaxart.classes.EditableText({
				value: aa_totext(field_data), 
				placeholder: placeholder,
				field: field, 
				data: field_data, profile: profile, context: context
			});
			return [aa_renderStyleObject(field.Style,textApiObject,context,true)];
		}
	},
	EditableColor: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.Style = aa_first(data,profile,'Style',context);
		field.HandleDescriptionForEmptyText = function(desctiptionForEmptyText) {
			field.DescriptionForEmptyText = desctiptionForEmptyText;
		}
		aa_init_class_EditableText();

		field.Control = function(field_data,ctx) {			
			var placeholder = field.DescriptionForEmptyText || '';

			var textApiObject = new ajaxart.classes.EditableText({
				value: aa_totext(field_data), 
				placeholder: placeholder,
				field: field, 
				data: field_data, profile: profile, context: context
			});
			return [aa_renderStyleObject(field.Style,textApiObject,context,true)];
		}
	},
	Image: function (profile,data,context)  // GC of fld_type.Image
	{
		var field = context.vars._Field[0];
		field.Style = aa_first(data,profile,'Style',context); 
		field.Control = function(field_data,ctx) {
			var image = aa_first(field_data,profile,'Image',context);
			if (image && image.Url)
			  image.StaticUrl = aa_totext(image.Url(field_data,context));
			
			var out = aa_renderStyleObject(field.Style,{ Field: field, image: image, data: field_data[0] },context);
			return [out];
		}
	},
	EditableImage: function (profile,data,context)  
	{
		var field = context.vars._Field[0];
		field.Style = aa_first(data,profile,'Style',context);
		
		field.Control = function(field_data,ctx) {
			var image = aa_first(field_data,profile,'Image',context);
			if (image && image.Url)
			  image.StaticUrl = aa_totext(image.Url(field_data,context));
			
			return [aa_renderStyleObject(field.Style,{ 
				Field: field, image: image, data: field_data[0],
				SetValue: function(newurl,ctx2) {
					var content = this.control;
					ajaxart.writevalue( field_data, newurl );
					aa_invoke_field_handlers(field.OnUpdate,content,null,field,field_data,{});
					jBart.trigger(field,'update',{ FieldData: field_data, wrapper: content.parentNode });
				}
			},context)];
		}
	},
	EditableNumber: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.Style = aa_first(data,profile,'Style',context);
		var units = ajaxart.runsubprofiles(data,profile,'Unit',context);
		field.Units = {};
		for (var i = 0; i < units.length; i++) {
			units[i].field = field;
			field.Units[ units[i].name ] = units[i];   // to make it more readable for outsiders
		};

		aa_init_class_EditableNumber();

		field.Control = function(field_data,ctx) {			
			var numberApiObject = new ajaxart.classes.EditableNumber({
				value: aa_totext(field_data), 
				field: field, 
				units: field.Units,
				allowEmptyValue: field.AllowEmptyValue,
				data: field_data, profile: profile, context: context
			});
			return [aa_renderStyleObject(field.Style,numberApiObject,context,true)];
		}

		if (aa_bool(data,profile,'NumberValidation',context)) {
			ajaxart.runNativeHelper(data,profile,'DefaultValidation',context);
		}
	},
	EditableBoolean: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.Style = aa_first(data,profile,'Style',context);

		if (aa_bool(data,profile,'HidePropertySheetTitle',context)) field.HideTitle = true;
		
		field.Control = function(field_data,ctx) {
			var picklist = {};
			aa_initPicklistObject(picklist,field,field_data,ctx);
			var image = aa_first(field_data,profile,'Image',context);
			if (image && image.Url)
			  image.StaticUrl = aa_totext(image.Url(field_data,context));
			
			return [ aa_renderStyleObject(field.Style,{
				Field: field,
				textForTrue: aa_multilang_text(data,profile,'TextForTrue',context),
				textForFalse: aa_multilang_text(data,profile,'TextForFalse',context),
				getTextValue: function() {
					var text = aa_totext(field_data);
					return this.isChecked() ? this.textForTrue : this.textForFalse;
				},
				image: image,
				data: field_data[0],
				isChecked: function() {
					var text = aa_totext(field_data);
					return text == 'true';
				},
				setValue: function(newval) {
					var newcode = newval ? 'true' : 'false';

					ajaxart.writevalue( field_data, newcode );
					var content = this.control; 
					aa_invoke_field_handlers(field.OnUpdate,content,null,field,field_data,{});
					jBart.trigger(field,'update',{ FieldData: field_data, wrapper: content.parentNode });
				}
			},ctx)];
		}
		
	},
	Lookup: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.Options = ajaxart.run(data,profile,'Options',context);
		field.Style = aa_first(data,profile,'Style',context)		
		field.Control = function(field_data,ctx) {
			var code = aa_totext(field_data);
			var option = aa_picklist_optionByCode(field.Options,code) || { code: code, text: code};
			
			return [aa_renderStyleObject(field.Style,{ 
				Field: field, image: option.image || '', data: field_data[0],
				text: option.text || '',
				isEmpty: option != null 
			},context)];
		}
	},
	Picklist: function (profile,data,context)
	{
		var field = context.vars._Field[0];

		field.RefreshOptions = function(data1,ctx) {
			field.Options = ajaxart.run(data1,profile,'Options',aa_ctx(context,ctx));
		}
		field.Style = aa_first(data,profile,'Style',context);
		field.AllowEmptyValue = aa_bool(data,profile,'AllowEmptyValue',context);
		field.AllowValueNotInOptions = aa_bool(data,profile,'AllowValueNotInOptions',context);
		
		field.Control = function(field_data,ctx) {
			if (!field.Options) { field.RefreshOptions(data,context); }
			var picklist = {};
			aa_initPicklistObject(picklist,field,field_data,ctx);
			
			return jQuery(aa_renderStyleObject(field.Style,picklist,ctx,true)).addClass('aa_picklist').get();
		}
	}
});

aa_gcs("editable_picklist",{
	OptionsTable: function (profile,data,context)
	{
		return ajaxart.runsubprofiles(data,profile,'Option',context);
	},
	Option: function (profile,data,context)
	{
		return [{
		  code: aa_text(data,profile,'Code',context),
		  text: aa_multilang_text(data,profile,'DisplayName',context),
		  image: aa_text(data,profile,'Image',context),
		}];
	},
	OptionsByCommas: function (profile,data,context)
	{
		var options = aa_text(data,profile,'Options',context).split(',');
		var out = [];
		for(var i=0;i<options.length;i++) {
			var code = ajaxart_multilang_text(options[i],context);
			if (!code) continue;
			out.push({ code: code, text: code });
		}
		return out;
	},
	DynamicOptions: function (profile,data,context)
	{
		var options = ajaxart.run(data,profile,'Options',context);
		var out = [];
		for(var i=0;i<options.length;i++) {
			var option = [ options[i] ];
			out.push({ 
				code: aa_text(option,profile,'OptionCode',context), 			
				text: aa_text(option,profile,'OptionDisplayName',context),
				image: aa_text(option,profile,'OptionImage',context) || null,
				base: options[i]
			});
		}
		return out;
	},
	AutoFilterOptions: function (profile,data,context) {
		var options = [];
		var uniqueOptions = {};

		var cntr = context.vars.ItemListCntr[0];
		var filterField = context.vars._Field[0];

		var items = cntr.AllItems || cntr.Items;
		for (var i = 0; i < items.length; i++) {
			var value = aa_totext ( filterField.FilterData( [items[i]] , context ) );
			if (value && !uniqueOptions[value])
				options.push({ code: value, text: value });
			uniqueOptions[value] = true;
		};
		return options;
	},
	SelectedOptionInPopup: function (profile,data,context)
	{
		var picklist = context.vars.ApiObject[0];
		var code = picklist.getValue();
		var items = data;
		for(var i=0;i<items.length;i++)
			if (items[i].code == code) 
				return [items[i]];
	},
	PicklistSelect: function (profile,data,context)
	{
		var option = aa_first(data,profile,'Option',context);
		if (!option) return;
		var picklist = context.vars.ApiObject[0];
		
		var code = option.code;
		picklist.setValue(code,{Option: [option.base]});
		if (picklist.wrapperForStyleByField.jbDialog) picklist.wrapperForStyleByField.jbDialog.Close();
		if (picklist.Refresh) picklist.Refresh();

		aa_refresh_cell(picklist.wrapperForStyleByField,context);	// because the picklist is implemented by StyleByField 
	},
	AddValueNotInOptionsToList: function (profile,data,context)
	{
		var cntr = context.vars.ItemListCntr[0];
		var items = cntr.AllItems || cntr.Items;
		// last option is the one not in options
		var optionNotInOptions = items[items.length-1];
		if (!optionNotInOptions || !optionNotInOptions.isValueNotInOptions) {
			optionNotInOptions = { isValueNotInOptions: true }; 
			items.push(optionNotInOptions);
		}
		optionNotInOptions.text = optionNotInOptions.code = aa_text(data,profile,'OptionText',context);
		cntr.RefreshDataColumns();
	}
});

aa_gcs("fld_aspect",{
	PicklistProperties: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.HideSearchBox = aa_bool(data,profile,'HideSearchBox',context);
		field.AutoRecalcOptions = aa_bool(data,profile,'AutoRecalcOptions',context);

		field.OnOpenPopup = function(field_data,ctx) {
			if (!field.AutoRecalcOptions) return;
			field.RefreshOptions(field_data,ctx);
		}
	}
});

aa_gcs("number",{
	Unit: function (profile,data,context)
	{
		aa_init_class_Unit();

		var unit = new ajaxart.classes.Unit({
			profile: profile, context: context,
			name: aa_text(data,profile,'Name',context),
			symbol: aa_text(data,profile,'Symbol',context),
			min: parseFloat(aa_text(data,profile,'Min',context)), // do not use aa_float to avoid default 0
			max: parseFloat(aa_text(data,profile,'Max',context)),
			resolution: aa_float(data,profile,'Resolution',context) || 1 ,
			step: aa_float(data,profile,'Step',context) || 1,
			initialPixelsPerUnit: aa_float(data,profile,'InitialPixelsPerUnit',context)
		});

		return [unit];
	}
});

function aa_picklist_optionByCode(options,code) {
	if (!options) return;
	for(var i=0;i<options.length;i++) {
		if (options[i].code == code) return options[i];
	}
	return null;
}

function aa_initPicklistObject(picklist,field,field_data,context)
{
	if (!field_data || field_data.length == 0) ajaxart.log("No field data for picklist","error");
	aa_extend(picklist,{
		apiObjectType: 'picklist',
		Field: field, FieldData: field_data, data: field_data[0], Context: context,
		getValue: function() {
			return aa_totext( field_data );
		},
		getImage: function() {
			var code = aa_totext(field_data,context);
			var option = aa_picklist_optionByCode(picklist.Field.Options,code);
			return option && option.image;
		},
		setValue: function(newValue,extra) {
			if (this.getValue() == newValue) return;
			ajaxart.writevalue( field_data, newValue );
			var content = this.control; // TODO: fix this
			aa_invoke_field_handlers(field.OnUpdate,content,null,field,field_data,extra);
			jBart.trigger(field,'update',{ FieldData: field_data, wrapper: content.parentNode, extra: extra });
		},
		totext: function() {
			var code = aa_totext(field_data,context);
			var option = aa_picklist_optionByCode(picklist.Field.Options,code);
			return option ? option.text : code;
		},
		Refresh: function() {}
	});
}

function aa_picklist_radio_buttons(picklist,settings)
{
	aa_global_vars().uniqueRadioCounter = aa_global_vars().uniqueRadioCounter || 0;
	var radioGroup = 'aaradio' + ++aa_global_vars().uniqueRadioCounter;
	var currentValue = picklist.getValue();
	
	var optionTemplate = settings.OptionElement;
	var templateParent = optionTemplate.parentNode;
	
	var options = picklist.Field.Options;
	for(var i=0;i<options.length;i++) {
		var option = options[i];
		var optionElem = optionTemplate.cloneNode(true);
		var optionSettings = settings.OptionInnerElements(optionElem);
		optionElem.jbOption = option;
		optionSettings.TextElement.innerHTML = option.text; 
		optionSettings.RadioElement.setAttribute('name',radioGroup);
		optionSettings.RadioElement.jbOption = optionSettings.TextElement.jbOption = option;
		optionSettings.TextElement.jbRadio = optionSettings.RadioElement; 
		
		optionSettings.TextElement.onclick = function() {
			jQuery(this.jbRadio).click();
		};
		
		optionSettings.RadioElement.onclick = function(){
			picklist.setValue(this.jbOption.code);
		}
		
		if (currentValue == option.code)
			optionSettings.RadioElement.setAttribute('checked','checked');
		
		jQuery(optionTemplate).before(optionElem);
	}	
	templateParent.removeChild(optionTemplate);
}

function aa_picklist_native_combo(picklist,settings)	// used by native combo style
{
	settings.OnOptionElem = settings.OnOptionElem || function() {};
	settings.Element = settings.Element || picklist.control;
	
	var element = settings.Element;
	var currentOption = picklist.getValue();
	
	var field = picklist.Field;
	var options = field.Options;
	for(var i=0;i<options.length;i++) {
		var option = options[i];
		var optionElem = jQuery('<option/>')[0];
		optionElem.value = option.code;
		optionElem.innerHTML = option.text;

		settings.OnOptionElem(optionElem,option);
		element.appendChild(optionElem);
	}
	element.value = currentOption;
	
	element.onchange = function() {
		var field_data = picklist.FieldData;
		var newValue = options[element.selectedIndex].code;
		picklist.setValue(newValue);
	}
}

function aa_native_checkbox(checkbox,settings)
{
	if (settings.TextElement) {
	  settings.TextElement.innerHTML = checkbox.Field.Title;
	}
	settings.InputElement.onchange = function() {
		checkbox.setValue(settings.InputElement.checked);
		refresh();
	}
	refresh();
		  
	function refresh() {
		settings.InputElement.checked = checkbox.isChecked();
	}
}

function aa_native_boolean_radios(checkbox,settings) {
	
}

function aa_init_class_EditableText() {
	ajaxart.classes = ajaxart.classes || {};
	if (ajaxart.classes.EditableText) return;

	ajaxart.classes.EditableText = function(settings) {
		aa_extend(this,settings);
	}
	ajaxart.classes.EditableText.prototype.onchange = function(newvalue) {
		if (aa_totext(this.data) == newvalue) return;		
		ajaxart.writevalue(this.data,[newvalue]);
		var field = this.field;
		aa_invoke_field_handlers(field.OnUpdate,this.el,null,field,this.data,{});
	}
	ajaxart.classes.EditableText.prototype.initInputElement = function(textbox,input) {
		var field = this.field,field_data = this.data,context = this.context,that = this;
		input.jbApiObject = textbox;

		input.onfocus = function(e) {
			e = e || event;
		    // select all on next timer
		    ajaxart.controlOfFocus = this;
		    aa_invoke_field_handlers(field.OnFocus,input,e,field,field_data);
			for(var parent=input.parentNode;parent;parent=parent.parentNode) if (parent.onfocus) parent.onfocus(e);  // for HoverOnPopup 
		    return true;
		}
		input.onblur = function(e) {
			e = e || event;
			for(var parent=input.parentNode;parent;parent=parent.parentNode) if (parent.onblur) parent.onblur(e);  // for HoverOnPopup 
		    ajaxart_field_RefreshDependentFields(field,input,context);
		    aa_invoke_field_handlers(field.OnBlur,input,e,field,field_data);
		    if (field.Validations) aa_handleValidations(field,input,field_data,context,"on blur");
		    return true;
		}

		input.onkeydown = function(e) {
			e = e || event;
			
		    if (field.KeyPressValidator && e.keyCode != 8) // backspace is fine 
		    {
				var ch = String.fromCharCode(e.keyCode);
				if (! field.KeyPressValidator.test(ch)) return aa_stop_prop(e);
		    }
		    aa_invoke_field_handlers(field.OnKeydown,this,e,field,field_data);
		    
			if (aa_intest && e.CharByChar)
				input.value += String.fromCharCode(e.keyCode);

			return true;
		}
		input.onmousedown = function(e) {
			e = e || event;
		    aa_invoke_field_handlers(field.OnMouseDown,this,e,field,field_data);
			return true;
		}
		input.onmouseup = function(e) {
			e = e || event;
		    aa_invoke_field_handlers(field.OnMouseUp,this,e,field,field_data);
			return true;
		}
		input.Blur = function() {
			jQuery(this).blur();
		}
		input.Refresh = function() { 
			if (input.RefreshDescriptionForEmptyText)
				input.RefreshDescriptionForEmptyText();
			if (input.jbApiObject) aa_trigger(input.jbApiObject,'refresh');
		 }
		 input.setAttribute('value',textbox.value); /* for automatic tests on all browsers */
	}
	ajaxart.classes.EditableText.prototype.onkeyup = function(e,input) {
		var field = this.field;
		var keyCode = e.keyCode;
		if (keyCode == undefined && !aa_intest && !aa_inuiaction) return; // a mouse click !!!
		aa_invoke_field_handlers(field.OnKeyup,this,e,field,this.data,{
			KeyCode: ['' + keyCode], 
			CtrlKey: aa_frombool(e.ctrlKey) 
		});
		var codes = [9,13,16,17,18,27, 63277,63276]; // controls and navigation are masked
		for(var i=0;i<codes.length;i++)
			if (keyCode == codes[i]) return true;
		
	    if (field.KeyPressValidator && keyCode != 8) // backspace is masked 
	    {
			var ch = String.fromCharCode(keyCode);
			if (! field.KeyPressValidator.test(ch)) return aa_stop_prop(e);
	    }
	}
}

function aa_init_class_EditableNumber()
{
	aa_init_class_EditableText();
	if (ajaxart.classes.EditableNumber) return;

	ajaxart.classes.EditableNumber = function(settings) {
		aa_extend(this,settings);
	}
	ajaxart.classes.EditableNumber.prototype = new ajaxart.classes.EditableText;
}

function aa_jbart_clickable_text(textbox,settings) {
	var input = jQuery(settings.InputElement), text = jQuery(settings.TextElement);
	
	function refresh() {
		if (textbox.jbMode == 'read only') {
			input.css('display','none');
			text.text(textbox.value || textbox.placeholder).css('display','block');
		}
	}

	text.click(function() {
		textbox.jbMode = 'write';
		refresh();
	});
	input.blur(function() {
		if (textbox.value != input.val()) {
			textbox.value = input.val();
			textbox.onchange(input.val());
		}
		textbox.jbMode = 'read only';
		refresh();
	});

	textbox.jbMode = 'read only';
	refresh();
}
function aa_jbart_textbox(textbox,inputElement)
{
/* 	
	Initializes a textbox (input/textarea) to support change events etc. 
	A textarea can also be passed as inputElement.
*/
	var userAgent = navigator.userAgent.toLowerCase();
	var placeholderNativeSupport = (/chrome/.test(userAgent) || /firefox/.test(userAgent) || /safari/.test(userAgent));
	placeholderNativeSupport = false; // always disable it
	var isIE7orIE8 = /msie 7/.test(userAgent) || /msie 8/.test(userAgent);

	var input = inputElement || textbox.el;

	if (textbox.initInputElement) textbox.initInputElement(textbox,input);	/* Allows custom initialization of the input element (e.g. adding placeholders) */

	function getInputValue() {
		var val = input.value;
		if (!placeholderNativeSupport || !textbox.placeholder || !jQuery(input).hasClass('placeholder')) return val;
		return '';
	}
	function valueChanged() {
		var inputValue = getInputValue();
		if (textbox.value != inputValue) {
			textbox.value = inputValue;
			if (textbox.onchange) textbox.onchange(textbox.value);
		}
	}
	// oninput is for mouse context menu of cut,paste
	input.oninput = function(e) {
		valueChanged();
	}
	// support paste,cut for IE8,IE7
	if (isIE7orIE8) {
		jQuery(input).bind('cut paste',null,function(e) {
			setTimeout(function() {
				valueChanged();
			},50);
		});
	}
	input.onkeyup = function(e) {
		if (textbox.onkeyup) textbox.onkeyup(e || event,input);
	    valueChanged();
		return true;
	}
	if (textbox.placeholder && placeholderNativeSupport)
		jQuery(input).attr('placeholder',textbox.placeholder);
	
	input.value = textbox.value;

	if (!placeholderNativeSupport) {
		input.onfocus = function(e) {
			if (jQuery(input).hasClass('placeholder')) {
				jQuery(input).removeClass('placeholder');
				input.value = '';
			}
		}
		input.onblur = function() {
			if (textbox.placeholder && input.value == '') {
				input.value = textbox.placeholder;
				jQuery(input).addClass('placeholder');
			}
		};
		input.onblur();
	}
}

function aa_init_class_Unit() {
	ajaxart.classes = ajaxart.classes || {};
	if (ajaxart.classes.Unit) return;

	ajaxart.classes.Unit = function(settings) {	
		aa_extend(this,settings);
	}
	ajaxart.classes.Unit.prototype.displayFormat = function(numeric) { // numeric as text, e.g., '3'
		if (this.field && numeric == '' && this.field.AllowEmptyValue) 
			return this.field.TextForEmptyValue;
		var data = [ { Value: numeric, Symbol: this.symbol }];
		return aa_text(data,this.profile,'DisplayFormat',this.context);
	}
	ajaxart.classes.Unit.prototype.dataFormat = function(numeric) {
		if (typeof numeric === 'number') numeric = '' + numeric;
		if (this.field && numeric === '' && this.field.AllowEmptyValue) 
			return '';
		var data = [ { Value: numeric, Symbol: this.symbol }];
		return aa_text(data,this.profile,'DataFormat',this.context);
	}
	ajaxart.classes.Unit.prototype.numericValue = function(data) {
		var parts = (''+aa_totext(data)).match(/([^0-9\.\-]*)([0-9\.\-]+)([^0-9\.\-]*)/);
		var value = parts && parts[2];
		value = value || (this.field && this.field.AllowEmptyValue ? '' : '0');
		var v = parseFloat(value);
		if (!isNaN(v)) 
			value = '' + this.applyRangeAndResolution(v);
		return value;
	}
	ajaxart.classes.Unit.prototype.applyRangeAndResolution = function(floatVal) {
		var val = floatVal;
		if (!isNaN(this.min)) val = Math.max(val,this.min);
		if (!isNaN(this.max)) val = Math.min(val,this.max);
		val = Math.round(val/this.resolution)*this.resolution; 
		val = parseFloat(val.toFixed(3)+''.replace(/0+$/,''));
		return val;
	}
}

function aa_get_first_unit(units) {
	var result = [];
	for (var u in units) result.push(units[u]);
	if (!result[0]) {
		return {
			symbol: '', min: NaN, max: NaN, resolution: 0.01, step: 1,initialPixelsPerUnit: 1,
			displayFormat: function(numeric) { return this.dataFormat(numeric) },
			dataFormat: function(numeric) { return '' + numeric; },
			numericValue: function(data) { 
				return aa_totext(data);
			},
			applyRangeAndResolution: function(floatVal) {
				// TODO: make applyRangeAndResolution a global function (not of the unit)
				var val = floatVal;
				if (!isNaN(this.min)) val = Math.max(val,this.min);
				if (!isNaN(this.max)) val = Math.min(val,this.max);
				val = Math.round(val/this.resolution)*this.resolution; 
				val = parseFloat(val.toFixed(3)+''.replace(/0+$/,''));
				return val;
			}
		}
	}
	return result[0];
}


function aa_init_jscolor(textbox,settings)
{
	/* uses jscolor for editable color (http://jscolor.com) */
	var input = settings.InputElement;
	var baseUrl = settings.BaseUrl || aa_base_lib() + '/jscolor/';
	
	aa_loadRequiresJSFiles({
		jsFiles: [{
			url: baseUrl + 'jscolor.js',
			jsVariable: 'jscolor'
		}],
		onload: function() {
			jscolor.dir = baseUrl;
			var myPicker = new jscolor.color(input, {
				onImmediateChange: function() { 
					var color = '#' + this.toString();
					if (textbox.value != color) {
						textbox.value = color;
						if (textbox.onchange) textbox.onchange(textbox.value);
					}
				}
			});			
		}
	});
}


aa_noOfOpenDialogs = 0;
aa_dialogCounter = 0;
openDialogs = [];
aa_openDialogs = [];

aa_gcs("dlg", {
  OpenDialog: function (profile,data,context) 
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

			aa_invoke_dialog_handlers(dlg.BeforeOpenFunc,dlg,context);  // dialog size etc.
			if (dlg._cancelOpen) return;

			// first close all popups
			if (! ajaxart.inPreviewMode) {
				if (!this.DontCloseOtherPopupsOnOpen) {
					if (! dlg.JBStudio) {
						var stop = false;
						while (ajaxart.dialog.openPopups.length > 0 && !stop) {
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
			  setTimeout( function() { 
//				  aa_capture_for_popup(dlg.Popup); 
				  dlg.Popup.initialized = true; 
			  }, 1 );
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
			
			if (dlg.onElem) dlg.onElem.jbDialog = dlg;
		    
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
			if (dlg.onElem) dlg.onElem.jbDialog = null;
		}
		var newContext = aa_ctx(context,{_Dialog: [dlg]} );
	
		dlg.Style.Features(data,newContext);
		ajaxart.runNativeHelper(data,profile,'MoreFeatures',newContext);
		ajaxart.runsubprofiles(data,profile,'Feature',newContext);
		
		dlg.Open(data,newContext);
	}
	init(dlg);
  },
  AboveLauncher: function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  dlg.FixDialogPosition = function(firstTime) 
	  {
		  var control = this.onElem;
		  if (!firstTime || !control || !this.Frame) return;
		  var jPopup = jQuery(this.Frame);
		  
		  var mode = aa_text(data,profile,'Location',context);
		  var d;
		  if( window.innerHeight ) 
			  d = { pageYOffset: window.pageYOffset,pageXOffset:window.pageXOffset, innerHeight: window.innerHeight ,innerWidth: window.innerWidth }
		  else if( document.documentElement &&document.documentElement.clientHeight )
			  d = { pageYOffset: document.documentElement.scrollTop , pageXOffset : document.documentElement.scrollLeft, innerHeight : document.documentElement.clientHeight, innerWidth : document.documentElement.clientWidth}
		  else if( document.body )
			  d = { pageYOffset :document.body.scrollTop, pageXOffset :document.body.scrollLeft,innerHeight: document.body.clientHeight,innerWidth :document.body.clientWidth};
		  d.innerWidth -= 18;	//dirty, considering vertical scroll's width
		  var fixed_location = false;
		  jQuery(control).parents().each(function() { if (jQuery(this).css("position") == 'fixed') fixed_location=true; } );
		  if (fixed_location) { d.pageYOffset = d.pageXOffset = 0; jPopup[0].style.position = 'fixed'; }
			  
		  jPopup.show();		// shows before moving so offsetHeight,offsetWidth are correct
		  var p_height = this.Frame.offsetHeight;
		  var p_width = this.Frame.offsetWidth;
		  var l_ctrl_height = control.offsetHeight;
		  var l_ctrl_width = control.offsetWidth;
		  
		  var pageX = aa_absLeft(control) + l_ctrl_width/2 - p_width/2;
		  var pageY = aa_absTop(control) + l_ctrl_height/2 - p_height/2;
		  
		  var padding = 4;
		  if (pageX < d.pageXOffset + padding) pageX = d.pageXOffset + padding;
		  if (pageY < d.pageYOffset + padding) pageY = d.pageYOffset + padding;
		  if (pageX + p_width + padding> d.pageXOffset + d.innerWidth)
			  pageX = d.pageXOffset + d.innerWidth - p_width - padding;
		  if (pageY + p_height + padding> d.pageYOffset + d.innerHeight)
			  pageY = d.pageYOffset + d.innerHeight - p_height - padding;
		  jPopup.css("top",pageY).show();
		  jPopup.css("left",pageX);
	  }
  },
  CenteringLauncher: function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  dlg.FixDialogPosition = function(firstTime,forceFixLocation) 
	  {
		  var control = this.onElem;
		  if (!control || !this.Frame) return;

		  var jPopup = jQuery(this.Frame);

		  var centerX = aa_absLeft(control) + (jQuery(control).width()/2);
		  var centerY = aa_absTop(control) + (jQuery(control).height()/2);
			  
		  var width = jPopup.outerWidth();
		  var height = jPopup.outerHeight();
		  
		  var dlgLeft = centerX - (width/2);
		  var dlgTop = centerY - (height/2);;
		  
		  if (dlgLeft<0) dlgLeft=0;
		  if (dlgTop<0) dlgTop=0;

		  jPopup.css("left",dlgLeft).css('top',dlgTop).show();
		  
		  aa_invoke_dialog_handlers(dlg.PositionChanged,dlg,context);
	  };
  },
  NearLauncher: function (profile,data,context)
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
  		  
		  var pageX = aa_absLeft(control), pageY = aa_absTop(control);
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
			  // if (pageX - p_width + l_ctrl_width >= d.pageXOffset) {	// go left
			  pageX = pageX + l_ctrl_width - p_width;
			  goLeft = false; // no need to calc the go left again...
			  // }
			  // else {	// attach center to launching element
//				  pageX = pageX + l_ctrl_width/2 - p_width/2;
//				  if (d.pageXOffset + d.innerWidth < pageX + p_width + padding)	// overflows rightwards
//					 pageX = d.pageXOffset + d.innerWidth - p_width - padding;
//				  else if (d.pageXOffset > pageX )	// overflows leftwards
//						 pageX = d.pageXOffset + padding;
			  // }
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
  TopZIndexWhenTouching: function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  aa_register_handler(dlg,'AfterOpen', function(dlg,ctx) {
		  jQuery(dlg.Frame).find(".aa_dialog_title").mousedown(function() {
//		  jQuery(dlg.Frame).mousedown(function() {
			  dlg.setAsTop();
  		   });
		  dlg.setAsTop();
	  });
	  dlg.setAsTop = function() {
		var other_dialogs = jQuery(".aa_dlg");
		var topZIndex = 0;
		for(var i=0;i<other_dialogs.length;i++) {
			if (other_dialogs[i].Dialog == dlg) continue;
			var zindex = parseInt( jQuery(other_dialogs[i]).css('z-index') || '0') || 0;
			if (zindex > topZIndex) topZIndex = zindex;
		}
		var myzindex = parseInt(jQuery(dlg.Frame).css('z-index') || '0') || 0;
		if (myzindex <= topZIndex) 
			jQuery(dlg.Frame).css('z-index',topZIndex+1);
	  }
  },
  InScreenCenter: function (profile,data,context)
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
	  	if (aa_absLeft(jFrame[0]) < 0 || screenWidth - jFrame.width() - aa_absLeft(jFrame[0]) < 0) fixPos = true;
	  	if (aa_absTop(jFrame[0]) < 0 || screenHeight - jFrame.height() - aa_absTop(jFrame[0]) < 0) fixPos = true; 
	  	
	  	if (firstTime || aa_bool(data,profile,'AlwaysInScreenCenter',context) || fixPos) {
		  jFrame.css('left',Math.max(5,(screenWidth - jFrame.width())/2) + "px");
		  jFrame.css('top',Math.max(5,(screenHeight - jFrame.height())/2) + "px");
		  jFrame[0].style.position = 'fixed';
	  	}
	  	dlg.alreadyShown = true;
	  }
  },
  UseLauncherWidth: function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  aa_register_handler(dlg,'AfterOpen', function(dlg,ctx) {
		  if (dlg.onElem)
			  dlg.Frame.style.width = dlg.onElem.offsetWidth + "px";
	  });
  },
  ArrowToLaunchingElement: function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  
	  var image = aa_first(data,profile,'ArrowImage',context);
	  if (image && image.Url) image.StaticUrl = aa_totext(image.Url(data,context));
	  var arrowElem = jQuery('<div class="aa_dialog_arrow" style="position:absolute"/>')[0];
	  aa_set_image(arrowElem,image,false);
	  
	  var deltaX = aa_int(data,profile,'DeltaX',context);
	  var deltaY = aa_int(data,profile,'DeltaY',context);
	  if (window.fb_params) deltaY -= 9;	// TODO: fix this !!!
	  arrowElem.jbDlg = dlg;
	  jQuery('body').append(arrowElem);
	  
	  aa_register_handler(dlg,'PositionChanged', function(dlg,ctx) {
		  var launcher  = dlg.onElem;
		  if (!launcher) return;
		  
		  var launcher_left = aa_absLeft(launcher);
		  var launcher_bottom = aa_absTop(launcher) + jQuery(launcher).height();
		  jQuery(arrowElem).css('left',launcher_left + (jQuery(launcher).width() / 2) + deltaX);
		  
		  jQuery(arrowElem).css('top',launcher_bottom + deltaY);
		  jQuery(arrowElem).css('z-index',parseInt(dlg.Frame.style.zIndex)+1);

		  if (dlg.DialogClass) jQuery(arrowElem).addClass('aa_dialog_arrow_'+dlg.DialogClass); 
	  });
	  aa_register_handler(dlg,'AfterClose', function(dlg,ctx) {
		  var arrows = jQuery('body>.aa_dialog_arrow');
		  for(var i=0;i<arrows.length;i++)
			  if (arrows[i].jbDlg = dlg) aa_remove(arrows[i],true);
	  });
  },
  UniquePopup: function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
  	  var id = aa_text(data,profile,'Identifier',context);
  	  
//	  aa_register_handler(dlg,'AfterOpen', function(dlg,ctx) {
		if (aa_bool(data,profile,'AutoClose',context)) {
			var popups = jQuery('body').find('.aa_dlg');
			for(var i=0;i<popups.length;i++)
			  if (popups[i].Dialog.Identifier == id) popups[i].Dialog.Close([],context);
		}
		dlg.Identifier = id;
//	  });
	  if (aa_bool(data,profile,'KeepPopupLocation',context)) 
	  {
		  jBart.vars.dialogLocations = jBart.vars.dialogLocations || {};
		  aa_register_handler(dlg,'BeforeClose', function(dlg,ctx) {
			  jBart.vars.dialogLocations[id] = { left: dlg.Frame.style.left , top: dlg.Frame.style.top, position: dlg.Frame.style.position, right:dlg.Frame.style.right }; 
		  });
		  aa_register_handler(dlg,'BeforeOpen', function(dlg,ctx) {
			  if (!jBart.vars.dialogLocations[id]) return;
			  dlg.OrigFixDialogPosition = dlg.FixDialogPosition;
			  dlg.FixDialogPosition = function(firstTime) {
				  if (!firstTime) {
					  if (! dlg.OrigFixDialogPosition) return;
					  return dlg.OrigFixDialogPosition(firstTime);
				  }
				  dlg.Frame.style.left = jBart.vars.dialogLocations[id].left;
				  dlg.Frame.style.top = jBart.vars.dialogLocations[id].top;
				  dlg.Frame.style.position = jBart.vars.dialogLocations[id].position;
				  dlg.Frame.style.right = jBart.vars.dialogLocations[id].right;
				  dlg.OrigFixDialogPosition(false);
			  }
		  });
	  }
  },
  DragDialog: function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  aa_register_handler(dlg,'AfterOpen', function(dlg,ctx) {
		  var titleElem = jQuery(dlg.Frame).find(".aa_dialog_title")[0] || (jQuery(dlg.Frame).hasClass('aa_dialog_title') && dlg.Frame);
		  aa_enable_move_by_dragging(dlg.Frame,titleElem,function() { /*ajaxart_dialog_close_all_popups();*/ });
	  });	  
  },
  DialogFrame: function (profile,data,context) 
  {
	  var dlg = context.vars._Dialog[0];
	  dlg.createFrame = function() {
		  var dlg = this;
		  var allText = '<table cellpadding="0" cellspacing="0"><tbody class="aa_dlg_tbody">'
			  +  '<tr><td class="aa_dialog_title"/></tr>'
			  +  '<tr><td style="vertical-align:top"><div class="aa_dialogcontents"/></td></tr>'
		      +  '<tr><td class="aa_dialogbuttons"/></tr></tbody></table>';
		  var jFrame = jQuery(allText);
		  aa_enable_move_by_dragging(jFrame[0],jFrame.find(".aa_dialog_title")[0],function() { ajaxart_dialog_close_all_popups(); });
		  return jFrame[0];
	  }
  },
  ToggleDialog: function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];

	  aa_register_handler(dlg,'BeforeOpenFunc', function(dlg,ctx) {
		 if (dlg.onElem && dlg.onElem.jbDialog && ajaxart.isattached(dlg.onElem.jbDialog.Frame)) {
			 dlg.onElem.jbDialog.Close();
			 dlg.onElem.jbDialog = null;
			 dlg._cancelOpen = true;
		 } 
	  });
  },
  PopupFrame: function (profile,data,context) 
  {
	  var dlg = context.vars._Dialog[0];
	  dlg.PopupStyle = aa_text(data,profile,'Style',context); 
	  dlg.createFrame = function() {
		  var allText = '<div class="aa_popup aa_dialogcontents" style="'+this.PopupStyle+'"/>';
		  return jQuery(allText)[0];
	  }
  },
  Css: function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  aa_register_handler(dlg,'AfterOpen', function(dlg,ctx) {
		var cls = aa_attach_global_css(aa_text(data,profile,'Css',context));
		jQuery(dlg.Frame).addClass(cls);
	  }); 
  },
  MobileFullScreen: function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  aa_register_handler(dlg,'AfterOpen', function(dlg,ctx) 
	  { 
		  var top = dlg.ContentsPlaceholder();
		  jQuery(top).addClass('aa_mobile_full_screen');
		  var screenWidth = window.innerWidth || (document.documentElement.clientWidth || document.body.clientWidth);
		  var screenHeight = window.innerHeight || (document.documentElement.clientHeight || document.body.clientHeight);
		  aa_set_element_size(top,(screenWidth-150)+'px,'+(screenHeight-150)+'px');
	  });
	  if (! window.aa_MobileFullScreen_orientation) {
		  window.aa_MobileFullScreen_orientation = function(orient) {
			  var popup = jQuery('.aa_mobile_full_screen')[0];
			  if (!popup) return;
			  var screenWidth = window.innerWidth || (document.documentElement.clientWidth || document.body.clientWidth);
			  var screenHeight = window.innerHeight || (document.documentElement.clientHeight || document.body.clientHeight);
			  aa_set_element_size(popup,(screenWidth-150)+'px,'+(screenHeight-150)+'px');
		  }
		  aa_add_onorientationchange(aa_MobileFullScreen_orientation);
	  }
  },
  HoverPopup: function (profile,data,context)
  {
	var dlg = context.vars._Dialog[0];

	aa_register_handler(dlg,'BeforeOpen', function(dlg,ctx) 
	{
		// close all other hover-popus
		var new_popups = [];
		for (var i in ajaxart.dialog.openPopups) {
			var popup = ajaxart.dialog.openPopups[i];
			if (popup.Dlg && popup.Dlg.HoverPopup && popup.Dlg != dlg)
				popup.Dlg.Close();
			else
				new_popups.push(popup)
		}
		ajaxart.dialog.openPopups = new_popups;
	});
	aa_register_handler(dlg,'AfterOpen', function(dlg,ctx) {
		dlg.HoverPopup = true;
		dlg.OrigMouseOut = dlg.onElem.onmouseout;
		dlg.OrigMouseOver = dlg.onElem.onmouseover;
		dlg.StartClosingPopup = function()	{
    		setTimeout(function() { 
    			if (dlg.Frame && ! dlg.Frame.isInside) { dlg.OK(data,context); }
    		},200);
		}
		dlg.onElem.onmouseout = function() {
			if (dlg.Frame) dlg.Frame.isInside = false;
			if (!dlg.Frame.hasFocus) dlg.StartClosingPopup();
			if (dlg.OrigMouseOut) dlg.OrigMouseOut();
		}
		dlg.onElem.onmouseover = function() {
			if (dlg.Frame) dlg.Frame.isInside = true;
		}
    	dlg.Frame.onmouseover = function() { dlg.Frame.isInside = true; }
    	dlg.Frame.onmouseout = function() { 
    		dlg.Frame.isInside = false;
    		if (!dlg.Frame.hasFocus) dlg.StartClosingPopup();
    	}
    	dlg.Frame.onfocus = function() { dlg.Frame.hasFocus = true; }
    	dlg.Frame.onblur = function() { dlg.Frame.hasFocus = false; }
    });
    aa_register_handler(dlg,'AfterClose', function(dlg,ctx) {
    	dlg.onElem.onmouseout = dlg.OrigMouseOut;
    	dlg.onElem.onmouseover = dlg.OrigMouseOver;
    });
  },
  CloseWhenClickingOutside: function (profile,data,context)
  {
	var dlg = context.vars._Dialog[0];
	dlg.Orig_mousedown = (window.captureEvents) ? window.onmousedown : document.onmousedown;
	var ignoreLaunchingElement = aa_bool(data,profile,'IgnoreLaunchingElement',context);
	
	function isChild(child,parent) {
		if (!child) return false;
		if (child == parent) return true;
		return isChild(child.parentNode,parent);  
	}
	function captureClick(e) {
		var dlg = context.vars._Dialog[0];
	    var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  );

	    if (elem.parents('html').length == 0) return; // detached - should not close..?
	    if (dlg.Frame == elem.parents('.aa_dlg')[0] || elem.hasClass('aa_dlg')) return;  // clicking inside us should not close
	    if (ignoreLaunchingElement && isChild(elem[0],dlg.onElem)) return;
	    
	    dlg.OK(data,context);
	}
	
	setTimeout( function() { 	
		if (window.captureEvents) window.onmousedown=captureClick;
		else document.onmousedown=captureClick;
	},1);
	
    aa_register_handler(dlg,'AfterClose', function(dlg,ctx) 
	{
    	if (window.captureEvents) 
    	  window.onmousedown = dlg.Orig_mousedown;
    	else 
    	  document.onmouseclick = dlg.Orig_mousedown;
	});	
  },
  OKOnEnter: function (profile,data,context)
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
  },
  CloseOnEsc: function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  dlg.CloseOnEsc = aa_bool(data,profile,'Enabled',context);
	  aa_register_handler(dlg,'KeyDown', function(e,ctx) 
	  {
		 if(e.keyCode == 27) dlg.Cancel();
	  });
  },
  ButtonsHorizontal: function (profile,data,context)
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
  DialogShadow: function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  aa_register_handler(dlg,'AfterOpen', function(dlg,ctx) 
	  {
		var shade1 = jQuery('<tr class="dialog_right_shadow_tr"><th class="dialog_shadow_extra_th"/>'
					      + '<th rowspan="6" class="dialog_right_shadow_th"><div class="dialog_right_shadow" /></th></tr>');
	
		var shade2 = jQuery('<tr class="dialog_bottom_shadow" ><td><span class="dialog_bottom_outer" ><span class="dialog_bottom_inner" ></span>'
				          + '</span></td></tr>');
		
		if (ajaxart.isIE) { // causes the title to be two lines (we should refactor the dialog not to use table)
			shade1.find('.dialog_right_shadow_th').css('display','none');
			shade2.css('display','none');
		}
		
		var tbody = jQuery(dlg.Frame).find('tbody')[0];
		tbody.insertBefore(shade1[0],tbody.firstChild);
		tbody.appendChild(shade2[0]);
		jQuery(dlg.Frame).css('border','none');
	  });
  },
  Size: function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  aa_register_handler(dlg,'BeforeOpen', function(dlg,ctx) 
	  { 
		  var top = dlg.ContentsPlaceholder();
		  aa_set_element_size(top,aa_text_with_percent(data,profile,'Size',context));
		  aa_set_element_size(top,aa_text_with_percent(data,profile,'MaxSize',context),"max-");
	  });
  },
  Resizer: function (profile,data,context)
  {
	  var dlg = context.vars._Dialog[0];
	  aa_register_handler(dlg,'BeforeOpen', function(dlg,ctx) 
	  { 
		  var top = dlg.ContentsPlaceholder();
		  
		  jBart.addResizer(top,{
		  	onResize: function(width,height) {
			    jQuery(top).width(width).height(height).css('max-width',width+'px').css('max-height',height+'px');

			    var right = jQuery(dlg.Frame).css('right');
			    if (right && right != 'auto') {
				    var dlgLeft = aa_absLeft(dlg.Frame);
				    jQuery(dlg.Frame).css('left',dlgLeft + 'px').css('right','');
			    }
			},
		    insertResizer1: function(element,resizer) {
			  element.appendChild(resizer);
			}
  		  });
	  });
  },
  CloseDialogFrame: function (profile,data,context)
  {
	  var topDialog = aa_top_dialog();
	  if (!topDialog) return;
	  if (topDialog.OldDialog) aa_close_dialog_old('Cancel',true);
	  else topDialog.Dialog.Close([],context);
  },
  CloseContainingDialog: function (profile,data,context)
  {
	  var ctrl = context.vars.ControlElement[0];
	  while (ctrl) {
		  var dialog = ctrl.Dialog;
		  if (dialog) 
			return dialog.Cancel(dialog.Data,dialog.Context);
		  ctrl = ctrl.parentNode;
	  }
  },
  InplaceDialog: function (profile,data,context)
  {
	var previewValue =  ajaxart.inPreviewMode;
	ajaxart.inPreviewMode = true;
    ajaxart.runNativeHelper(data,profile,'OpenDialog',context);
    ajaxart.inPreviewMode = previewValue;
    
    var dialog = aa_openDialogs[aa_openDialogs.length-1];
    if (!dialog || dialog.Title != aa_text(data,profile,'Title',context)) return;
    jQuery(dialog.Frame).addClass('aa_inplace_dialog');
    var out = dialog.Frame;
    dialog.Cancel(dialog.Data,dialog.Context);
    var field = context.vars._Field[0];
    field.Control = function() { 
    	return [out]; 
    }
  },
  CloseDialog: function (profile,data,context)
  {
	  var topDialog = aa_top_dialog();
	  if (!topDialog) return;
	  if (topDialog.OldDialog) {
		  // close by clicking on the OK button (because of async checks etc.)
		  var okButton = jQuery(topDialog.dialogContent).find('.OKButton')[0];
		  if (okButton) {
		    aa_fire_event(okButton,'mousedown',context,{});
		    aa_fire_event(okButton,'mouseup',context,{});
		  }
	  }
	  else {
		  if (aa_text(data,profile,'CloseType',context) == "OK")
			  topDialog.Dialog.OK(topDialog.Dialog.Data,topDialog.Dialog.Context);
		  else
			  topDialog.Dialog.Cancel(topDialog.Dialog.Data,topDialog.Dialog.Context);
	  }
  },
  CloseIconOld: function (profile,data,context)
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
		jQuery(img).addClass( aa_attach_global_css(aa_text(data,profile,'Css',context),null,'close_dialog_old') );
		img.onclick = function() { dlg.Cancel(dlg.Data,ctx); }
		
		jTitle[0].insertBefore(img,jTitle[0].firstChild);
	  });
  },
  CloseIcon: function (profile,data,context)
  {
	  var style = aa_first(data,profile,'Style',context);

	  aa_register_handler(context.vars._Dialog[0],'AfterOpen', function(dlg,ctx) {
		  aa_renderStyleObject(style,{
			 dialog: dlg.Frame,
			 CloseDialog: function() { dlg.Cancel(dlg.Data,ctx); }
		  },ctx)
	  },'CloseIcon');
  },
  AutomaticFocus: function (profile,data,context)
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
  NoCancel: function (profile,data,context)
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
  DisableBodyScroll: function (profile,data,context)
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
  ScreenCover: function (profile,data,context) 
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
  TopDialog: function (profile,data,context)
  {
	  var topDialog = aa_top_dialog();
	  if (!topDialog) return [];
	  if (aa_bool(data,profile,'ReturnContent',context))
		  return [topDialog.Dialog.Contents];
	  else
		  return [topDialog.Dialog];
  },
  CloseAllDialogs: function (profile,data,context)
  {
	  for (var i=0; i<aa_openDialogs.length; i++)
		  aa_openDialogs[i].Close();
	  aa_openDialogs = [];
	  return [];
  },
  CloseDialogByID: function (profile,data,context)
  {
	  var id = aa_text(data,profile,'Identifier',context);
 	  var popups = jQuery('body').find('.aa_dlg');
	  for(var i=0;i<popups.length;i++) {
		  if (id != '' && popups[i].Dialog.Identifier == id) { 
			  popups[i].Dialog.Close();
			  return;
		  }
	  }
  }, 
  ToggleOpenCloseDialog: function (profile,data,context)
  {
	  var id = aa_text(data,profile,'Identifier',context);
		
 	  var popups = jQuery('body').find('.aa_dlg');
	  for(var i=0;i<popups.length;i++) {
		  if (id != '' && popups[i].Dialog.Identifier == id) { 
			  popups[i].Dialog.Close();
			  return;
		  }
	  }
	  ajaxart.run(data,profile,'Open',context);
  }
});
//AA EndModule

function aa_invoke_dialog_handlers(eventFuncs,dlg,context)
{
	if (eventFuncs)
		for(var i=0;i<eventFuncs.length;i++)
			eventFuncs[i](dlg,context);
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

aa_gcs("dialog", {
	  TogglePopup: function (profile,data,context)
	  {
		var onElem = aa_first(data,profile,'OnElement',context);
		var widthOption = aa_text(data,profile,'WidthOption',context);
		if (widthOption == '') widthOption = 'launcher width';
		var width = aa_text(data,profile,'Width',context);
		var height = aa_text(data,profile,'Height',context);
	    var popupdata = ajaxart.run(data,profile,'PopupData',context);
	    var closeOnEnter = aa_bool(data,profile,'CloseOnEnter',context);
	    var closeOnDoubleClick = aa_bool(data,profile,'CloseOnDoubleClick',context);
	    var popupCssClass = aa_text(data,profile,'PopupCssClass',context);
	    var returnFocusTo = aa_first(data,profile,'ReturnFocusTo',context);
	    var style = aa_text(data,profile,'Style',context);
		for(i=0; i<ajaxart.dialog.openPopups.length; i++)
		{
			if (ajaxart.dialog.openPopups[i].onElem == onElem)
			{
				var popupContents = ajaxart.dialog.openPopups[i].contents;
			    var popup = jQuery(popupContents).parents('.aapopup');
			    if (popup.length > 0 && popup[0].parentNode != null) {
			    	aa_remove(popup[0],true);
			    }
				
			    var newArr= [];
			    for(var j in ajaxart.dialog.openPopups)
			    {
			    	if (i != j)
			    		newArr.push( ajaxart.dialog.openPopups[j] );
			    }
			    aa_uncapture_for_popup(ajaxart.dialog.openPopups[i]);
			    ajaxart.dialog.openPopups = newArr;
			    
				return ["true"];
			}
		}
		ajaxart.setVariable(context,"_LaunchingElement",[onElem]);
		var contents = aa_first(popupdata,profile,'Contents',context);
		if (!contents) return;
		var popupObj = {contents: contents , onElem: onElem, profile: profile, returnFocusTo: returnFocusTo };
		contents.PopupObj = popupObj;
		// console.log("TogglePopup " + popupObj.onElem.parentNode.Field.Id);
		if (contents != null)
			ajaxart.dialog.openPopups.push(popupObj);
		if (onElem == null || contents == null ) { ajaxart.log("toggle popup - empty contents or no launching element","warning"); return []; }
		contents.LaunchingElement = onElem;
		if (onElem.offsetParent == null) { ajaxart.log("toggle popup - launching element has no offsetParent","warning");  }
		var jOnElem = jQuery(onElem);
		var popup = jQuery(document.createElement("div")).addClass("aapopup " + popupCssClass);
		popup[0].profile = profile;
		popup[0].context = context;
		popup[0].data = data;
		if (style != "") {
			if (style.indexOf(":") > 0)
				aa_setCssText(popup[0],style);
			else
				popup[0].className = popup[0].className + style;
		}
		if (! aa_intest)
		{
			popup[0].style.display = 'none';
			popup[0].display = 'none';
		}
		jQuery(contents).appendTo(popup);
		if (aa_bool(data,profile,'ShowCloseButton',context))
		{
			var deleteDiv = jQuery('<div style="padding: 0 0 16px 16px; position:absolute; top: 7px; right:4px; cursor:pointer;" />')[0];
			deleteDiv.style.background = "url(" + aa_text(data,profile,'CloseImage',context) + ') no-repeat';
			deleteDiv.popup = popupObj;
			deleteDiv.onmousedown = function() {
				aa_closePopup(this.popup);
			}
			popup[0].insertBefore(deleteDiv,popup[0].firstChild);
		}

		var registerFunc = function(popup,popupdata,popupObj,closeOnEnter) {
			popup[0].onkeyup = function(e) { 
				e = e || event;
				if (typeof(e) == "undefined") e = event;
				if (closeOnEnter && e.keyCode == 13 && this.parentNode != null) // ENTER
				{
			    	var elem = jQuery( (typeof(event)== 'undefined')? e.target : event.srcElement  );
			    	if (elem[0] && elem[0].tagName.toLowerCase() == 'textarea') return;
					
//					this.parentNode.removeChild(this);
//					aa_element_detached( this );
					aa_closePopup(popupObj);
					ajaxart.run(popupdata,profile,'OnSuccess',context);
					ajaxart_stop_event_propogation(e);
				}
				if (e.keyCode == 27) {
					if (ajaxart.menu.currentContextMenu == null || jQuery(ajaxart.menu.currentContextMenu).css("display") != 'block' ) {// ESC
//						this.parentNode.removeChild(this);
//						aa_element_detached(this);
						ajaxart.run(data,profile,"OnCancel",context);
						ajaxart_stop_event_propogation(e);
						aa_closePopup(popupObj);
					}
				}
			};
			if (closeOnDoubleClick)
			  popup[0].ondblclick = function() {
				this.parentNode.removeChild(this);
				aa_element_detached( this );
				ajaxart.run(popupdata,profile,'OnSuccess',context);
			  }
		}
		registerFunc(popup,popupdata,popupObj,closeOnEnter);
		
		window.aa_noOfOpenDialogs = window.aa_noOfOpenDialogs || 0;

		var xydelta = aa_text(data,profile,'XYCorrections',context).split(',');
		
		if (jOnElem.parents('.jbstudio').length > 0) popup.addClass('jbstudio');
		
		if (jOnElem.parents('.right2left').length > 0)
		{
			popup.addClass('right2left');
		}
		else
		{
			popup.css('left',aa_absLeft(onElem)+parseInt(xydelta[0]));
			if (width == "" && widthOption == 'launcher width') 
				jQuery(popup).css('min-width',jOnElem.width() + 100); //width = jOnElem.width()+"px";
			else
				popup[0].style.minWidth = width;
			//popup[0].style.minWidth = width;
		}
		++aa_dialogCounter;
		popup.css('z-index',2000 + aa_dialogCounter+1);
		//popup.css('top',aa_absTop(onElem) + jOnElem[0].clientHeight + 50); // + parseInt(xydelta[1]));
		
		if (height != "") popup.height(height);
		//popup.height('100px');
		//popup.width('60px');
		
		popup.appendTo("body");
		aa_element_attached(popup);

		var newcontext = ajaxart.clone_context(context);
		ajaxart.setVariable(newcontext,"ControlElement",[contents]);
		if (ajaxart.fieldscript(profile,'AutoFocusOn',true) != null && !ajaxart.inPreviewMode)
		{
			var autoFocusParams = ajaxart.calcParamsForRunOn(newcontext,ajaxart.run(data,profile,'AutoFocusOn',newcontext));
			var autoFocusOn = ajaxart.getControlElement(autoFocusParams);
			if (autoFocusOn.length > 0 && 'focus' in autoFocusOn[0])
			{
			    var timeout = 1;
			    if (ajaxart.isSafari || ajaxart.isFireFox) timeout = 100;
		    	var set_focus = function(e) {  setTimeout(function() 
		    	{
		    		e = e || event;
	    	  	  	if (ajaxart.controlOfFocus != null)
	    	  	  		ajaxart.controlOfFocus.IgnoreBlur = true;
		    		if (jQuery(e).parents("body").length > 0) e.focus();  
		    	},timeout) }
		    	set_focus(autoFocusOn[0]);
			}
		}

		var init_popup = function(popup,width,widthOption,popupObj) { return function() {
			ajaxart.dialog.positionPopup(popup[0], onElem, null, false);
			if (width == '' && widthOption == 'launcher width' && jOnElem[0].offsetWidth > 2)
				popup.css('min-width',jOnElem[0].offsetWidth - 2); // potential bug - 2 for the border
			if (popup.hasClass('right2left'))
			{
				var lanchingElementRight = aa_absLeft(onElem) + jOnElem[0].offsetWidth;
				var popupLeft = lanchingElementRight - popup[0].offsetWidth;
				popup.css('left',popupLeft + 'px');
				popup.css('right','');
			}
			aa_capture_for_popup(popupObj);
			popupObj.initialized = true;
			if (aa_bool(data,profile,'AutoCloseOnMouseOut',context)) 
			{
				popup[0].onmouseover = function() { popup[0].isInside = true; }
				popup[0].onmouseout = function() { popup[0].isInside = false; setTimeout(function() {
					if (! popup[0].isInside)
						aa_closePopup(popup[0]);
				},500)}
			}
			if (ajaxart.isIE) // avoid scroll - IE bug?
				popup.height((popup.height() +2) + 'px');
			popup[0].style.display = '';
			popup[0].display = '';
			ajaxart.run(data,profile,'OnPopupOpen',aa_ctx(context, {ControlElement: [popup[0]]}) );
		}}
		setTimeout(init_popup(popup,width,widthOption,popupObj),1);
		
		return ["true"];
	  },
	  ClosePopup: function (profile,data,context)
	  {
		  var counter = 10;
		  if (aa_bool(data,profile,'AllPopups',context))
			  while (ajaxart.dialog.openPopups.length > 0 && counter > 0)
			  {
				  aa_closePopup(ajaxart.dialog.openPopups[ajaxart.dialog.openPopups.length-1]);
				  counter--;
			  }
		  if (ajaxart.dialog.openPopups.length > 0)
			  return aa_closePopup(ajaxart.dialog.openPopups[ajaxart.dialog.openPopups.length-1]);
	  }
});

jBart.disableSelections = function() {
  	ajaxart_disableSelection(document.body);
  	var frames = document.frames;
}
jBart.restoreSelections = function() {
	ajaxart_restoreSelection(document.body);
  	var frames = document.frames;
}

// jBart.addResizer assumes element has a div parent, and that it has no visible siblings 
jBart.addResizer = function(element,resizeProperties)
{
	var defaultProperties = { image: aa_base_images() + '/resizer.gif', width: '16px', height: '16px', minWidth: 20, minHeight: 20,
		zIndex: 10,
	  onResize: function(width,height) {},
	  onResizeEnd: function(width,height) {},
	  insertResizer: function(element,resizer) {
		  element.parentNode.appendChild(resizer);
	  }
	};
	
	resizeProperties = jQuery.extend(defaultProperties,resizeProperties);
	
	if (!element || !element.parentNode) return;
	jQuery(element.parentNode).css('position','relative');
	var jResizer = jQuery('<div style="position:absolute;bottom:0;right:0;background-repeat:no-repeat;" />');
	jResizer.css('background','url('+resizeProperties.image+')').css('width',resizeProperties.width).css('height',resizeProperties.height).css('cursor','se-resize').
		css("z-index",resizeProperties.zIndex);
	resizeProperties.insertResizer(element,jResizer[0]);

	jResizer.mousedown(function(e) {
		  if (! jResizer[0].jbResizingProps) {
		  	var width = jQuery(element).width();
		  	var height = jQuery(element).height();
		  	jResizer[0].jbResizingProps = { mouse_x: (e.clientX || e.pageX), mouse_y: (e.clientY || e.pageY), width: width, height: height };
		  	jBart.disableSelections();

		  	var resizeCover = jQuery('<div id="aa_resize_cover" style="height:100%; width: 100%; background:pink;z-index:10000; opacity:0; filter: alpha(opacity=0);position:fixed;top:0;left:0;top:0;bottom:0"/>');
			jQuery('body').append(resizeCover);
		  }
		  var mouse_move = function(e) {
			  e = e || event;
			  var props = jResizer[0].jbResizingProps;
			  var mouse_x = (e.clientX || e.pageX), mouse_y = (e.clientY || e.pageY);
			  var newWidth = props.width + (mouse_x - props.mouse_x);
			  var newHeight = props.height + (mouse_y - props.mouse_y);
			  if (newWidth > resizeProperties.minWidth) jQuery(element).width(newWidth); 
			  if (newHeight > resizeProperties.minHeight) jQuery(element).height(newHeight);
			  
			  resizeProperties.onResize(newWidth,newHeight);
		  }
		  var mouse_up = function(e) {
			  e = e || event;
			  jResizer[0].jbResizingProps = null;
			  window.onmousemove = null; window.onmouseup =null;  document.onmouseup=null; document.onmousemove=null; 
		  	  jBart.restoreSelections();
		  	  resizeProperties.onResizeEnd(jQuery(element).width(),jQuery(element).height());
		  	  jQuery('#aa_resize_cover').remove();

		  }
		  if (window.captureEvents){ window.onmousemove = mouse_move;window.onmouseup = mouse_up; }
		  else { document.onmouseup=mouse_up; document.onmousemove=mouse_move; }
    });
}














//AA BeginModule
aa_gcs("field", {
	DynamicFields: function (profile,data,context)
	{
		var fieldDefs = ajaxart.run(data,profile,'Fields',context);
		var out = [];

		for(var i=0;i<fieldDefs.length;i++) {
			var fieldDef = fieldDefs[i];
			var field = { 
				Item: fieldDef, 
				Source: fieldDef,
				FieldData: function(data1,ctx) {
						var ctx2 = aa_ctx(ctx,{_FieldDefinition: [this.Source] });
						return ajaxart.run(data1,profile,'FieldData',aa_merge_ctx(context,ctx2));
				},
				Title: aa_multilang_text([fieldDef],profile,'FieldTitle',context) || aa_multilang_text([fieldDef],profile,'Title',context),
				Id: aa_text([fieldDef],profile,'ID',context)
			};

			var newContext = aa_ctx(context,{_FieldDefinition: [fieldDef]} );
			ajaxart_addMethod(field,'Control',profile,'Control',newContext,'FieldDefinition');
			ajaxart.setVariable(newContext,'_Field',[field]);
			ajaxart.runsubprofiles([fieldDef],profile,'FieldAspect',newContext);
			
			out.push(field);
		}
		return out;
	},
	Text: function (profile,data,context)   // gc of field.Text
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
	XtmlControl: function (profile,data,context)
	{
		var field = { isObject : true };
		field.Title = aa_multilang_text(data,profile,'Title',context);
		field.Id = aa_text(data,profile,'ID',context);
		field.ID = [field.Id];
		field.FieldData = function(data1) { return data1; }
		field.CellPresentation = ["control"];
		
		aa_setMethod(field,'Control',profile,'Control',context);
		ajaxart.runsubprofiles(data,profile,'FieldAspect',aa_ctx(context,{_Field: [field]} ));
		
		return [field];
	},
	JavaScriptControl: function(profile,data,context)
	{
		var field = { isObject : true };
		field.Title = aa_multilang_text(data,profile,'Title',context);
		field.Id = aa_text(data,profile,'ID',context);
		field.ID = [field.Id];
		field.FieldData = function(data1) { return data1; }
		field.CellPresentation = ["control"];
		
		var html_compiled = ajaxart.compile(profile,'Html',context);
		var js_func = aa_get_func(aa_text(data,profile,'JavaScript',context));
			
		var get_ctrl = function(data1,ctx) {
			var html = ajaxart_runcompiled_text(html_compiled, data1, profile, "Html" ,context);
			var control = jQuery(html);
			if (control.length > 1) {
				var control2 = jQuery('<div/>').append(control);
				control = control2;
			}
			if (html == "") control = [];
			var ctrl = (control.length > 0) ? control[0] : null;
			var ctrl_after_js;
			if (js_func) {
				var data_item = (data1.length > 0) ? data1[0] : null;
				ctrl_after_js = js_func(data_item,ctrl,ctx);
			}
			var out = (ctrl_after_js) ? ctrl_after_js : ctrl;
			if (!out) return [];
			jQuery(out).addClass(aa_attach_global_css(aa_text(data,profile,'Css',context)));
			return [out];
		}
		var register = function(get_ctrl) {
			ajaxart_addScriptParam_js(field,'Control',get_ctrl,context);
		}
		register(get_ctrl);
		ajaxart.runsubprofiles(data,profile,'FieldAspect',aa_ctx(context,{_Field: [field]} ));
		
		return [field];
	},
	IsGroup: function (profile,data,context)
	{
		if (data.length == 0) return [];
		if (data[0].Fields != null) return ["true"];
		return [];
	},
	SimpleXmlFields: function (profile,data,context)
	{
		var paths = aa_text(data,profile,'Paths',context);
		var paths_arr = paths.split(',');
		var fields = [];
		for(var i=0;i<paths_arr.length;i++) {
			var path = paths_arr[i];
			var field = { isObject : true, Id: path.split('@').pop(), Path: path };
			field.ID = [field.Id];
			ajaxart_field_fix_title(field,path,context);
			
			var myFunc = function(path) { return function(data,context) {
				if (data.length == 0) return [];
				return ajaxart.xml.xpath(data[0],path,true);
			} };
			ajaxart_addScriptParam_js(field,'FieldData',myFunc(path),context );
			fields.push(field);
		}

		return fields;
	},
	Fields: function (profile,data,context)
	{
		return ajaxart.runsubprofiles(data,profile,'Field',context);
	},
	TitleField: function (profile,data,context)
	{
		var field = aa_first(data,profile,'Field',context);
		if (field == null) return [];
		
		field.Id = "#_TitleField";
		var newContext = aa_ctx(context,{_Field: [field]} );
		ajaxart.runsubprofiles(data,profile,'FieldAspect',newContext);
	    return [field];
	},
	InnerReferenceFields: function (profile,data,context)
	{
		var refFields = context.vars._ReferenceFields;
		if (refFields == null || refFields.length ==0) return [];
		var path = aa_text(data,profile,'Path',context);
		var out = refFields[0].FieldById[path.split('@').pop()];
		if (out != null && out.Fields != null) return out.Fields;
		return [];
	},
	SubFields: function (profile,data,context)
	{
		var parent = aa_first(data,profile,'Parent',context);
		var fields = [];
		var fillFields = function(parent) {
			var inner_fields = parent.Fields;
			for(var i=0;i<inner_fields.length;i++) {
				if (! inner_fields[i].IsGroup) fields.push(inner_fields[i]);
				else if (inner_fields[i].IsVirtualGroup ) fillFields(inner_fields[i]);
			}
		}
		if (parent != null)	fillFields(parent);
		return fields;
	},
	RefreshField: function(profile,data,context)
	{
		var fieldID = aa_text(data,profile,'FieldID',context);
		if (!fieldID) return;
		var field_ids = fieldID.split(',');
		var scope = aa_text(data,profile,'Scope',context);
		aa_refresh_field(field_ids,scope,aa_bool(data,profile,'FireOnUpdate',context),aa_first(data,profile,'Transition',context),context);
	},
	RefreshFieldByElement: function(profile,data,context)
	{
		var element = aa_first(data,profile,'Element',context);
		var transition = aa_first(data,profile,'Transition',context);
		if (!element) return;
		
		aa_refresh_cell(element,context,transition,true);
	},
	RefreshDependentFields: function(profile,data,context)
	{
		var input = aa_first(data,profile,'Input',context);
		if (input == null) return [];
		var cell = jQuery(input).parents('.aa_cell_element')[0];
		if (cell == null || cell.Field == null) return [];
		var field = cell.Field;
		var cntr = jQuery(input).parents('.aa_container')[0];
		if (field == null || field.DependentFields == null) return [];
		ajaxart_field_RefreshDependentFields(field,input,cntr.Cntr.Context);	
		return [];
	},
	ShowFieldControl2: function (profile,data,context)
	{
		var item = ajaxart.run(data,profile,'Item',context);
		var field = aa_first(data,profile,'Field',context);
		if (!field) return;
		
		var wrapper = document.createElement('div');
		aa_fieldControl({ Field: field, Item: item, Wrapper: wrapper, Context: context });
		return [wrapper];
	},
	ShowFieldControl: function (profile,data,context)
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
	FieldTitle: function (profile,data,context)
	{
		var field = ajaxart.run(data,profile,'Field',context);
		if (field.length == 0 || field[0].Title == null) return [];
		return [field[0].Title];
	},
	XmlInFilterAttribute: function (profile,data,context)
	{
		var filter_txt = aa_text(data,profile,'FilterData',context);
		
		var xml;
		if (filter_txt.length > 0) xml_txt = filter_txt; else xml_txt="<filter/>"; 
		try {
		  xml = ajaxart.parsexml(xml_txt);
		} catch(e) { xml = ajaxart.parsexml('<filter/>'); }
		ajaxart.runNativeHelper(data,profile,'RegisterXml',aa_ctx(context,{Xml:[xml]}));
		
		return [xml];
	},
	DateFilter: function (profile,data,context)
	{
		function aadate_isInRangeFunc(from,to) { return function(dateInt) { 
			return dateInt >= from && dateInt <= to; }	
		} 

		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];

		field.SelectedList = "";
		field.FilterControl = function(filter_context)
		{
			var newContext = aa_ctx(filter_context,{_Field: [this] } );
			var ctrl = ajaxart.runNativeHelper(filter_context.vars.FilterData,profile,'Control',newContext);
			jQuery(ctrl).find('.aa_filter_input').addClass('aa_filter_' + this.Id);
			return ctrl;
		};
		field.newFilter = function(initialFilterData)
		{
			var CompileFilterData = function(filter_data)
			{
				var result = [];
				var filter_txt = "";
				var allfilter_txt = aa_totext(filter_data);
				if (allfilter_txt.length > 0 && allfilter_txt.indexOf('<filter') == 0) {
					var xml = ajaxart.parsexml(allfilter_txt);
					filter_txt = xml.getAttribute('Expression') || '';
				} else 
					filter_txt = allfilter_txt; // not xml
				
				filter_txt = filter_txt.replace(new RegExp('[ ]*-[ ]*','g'),'-');
				var groups_txt = filter_txt.split(',');
				for(var i=0;i<groups_txt.length;i++)
					if (groups_txt[i] != '')
					{
						var dateFilter = {};
						if (!field.Options || !field.Options.CodeToTextHash || !field.Options.CodeToTextHash[groups_txt[i]])
						{
							var fromTo = groups_txt[i].split('-');
							dateFilter.from = fromTo[0];
							dateFilter.to = fromTo[1];
							if (dateFilter.to == null) dateFilter.to = fromTo[0];
							dateFilter.match =  aadate_isInRangeFunc(aadate_date2int(dateFilter.from),aadate_date2int(dateFilter.to,true));
						}
						result.push(dateFilter);
					}
				return result;
			};
			return	{
				isObject: true,
				filterData: CompileFilterData(initialFilterData),
				SetFilterData: function(filterData) { this.filterData = CompileFilterData(filterData); }, 
				ToSQLText: function(rawData) { 				
					var allfilter_txt = aa_totext(rawData);
					if (allfilter_txt.length > 0 && allfilter_txt.indexOf('<filter') == 0) {
						var xml = ajaxart.parsexml(allfilter_txt);
						return xml.getAttribute('Expression') || '';
					}
					return '';
				},
				Match: function(field,wrapper)
				{
					if (this.filterData.length == 0) return true;
					var date = wrapper[field.Id];
					for(var i in this.filterData)
						if (this.filterData[i].match(date))
							return true;
					return false;
				}
			};
		};
		return [];
	},
	BooleanFilter: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];

		field.BooleanFilterValue = "";
		field.FilterControl = function(filter_context)
		{
			var newContext = aa_ctx(filter_context,{_Field: [this] } );
			var ctrl = ajaxart.runNativeHelper(filter_context.vars.FilterData,profile,'Control',newContext);
			jQuery(ctrl).find('.aa_filter_input').addClass('aa_filter_' + this.Id);
			return ctrl;
		};
		
		field.newFilter = function(initialFilterData)
		{
			var CompileFilterData = function(filter_data)
			{
				var result = ajaxart.totext_array(filter_data);
				if (result == 'true') return true;
				if (result == '') return ''; // any value
				return false;
			};
			return	{
				isObject: true,
				filterData: CompileFilterData(initialFilterData),
				SetFilterData: function(filterData) { this.filterData = CompileFilterData(filterData); }, 
				ToSQLText: function(rawData) { return ajaxart.totext_array(rawData) },
				Match: function(field,wrapper)
				{
					if (typeof(this.filterData) == 'string' && this.filterData == '') return true;
					return this.filterData == (wrapper[field.Id] == 'true');
				}
			};
		};
		return [];
	},
	SortBox: function (profile,data,context)
	{
		var sort = function(data,ctx) {
			var field_cntr = context.vars._Cntr[0];
			var sorter_obj = ctx.vars.Option[0];
//			ajaxart_setUiPref(field_cntr.ID[0],aa_text(data,profile,'ID',context) +'_SortBox',sorter_obj.Label,ctx);
			var cntr = (context.vars.HeaderFooterCntr || context.vars._Cntr)[0];
			cntr.DataHolder = cntr.DataHolder || aa_createDataHolderFromCntr(cntr,context);
			cntr.DataHolder.UserDataView.Sort = [ { SortBy: sorter_obj.SortBy, SortDirection: sorter_obj.SortDirection} ];
  		    aa_recalc_filters_and_refresh(cntr,data);
		}
		var field = ajaxart.runNativeHelper(data,profile,'Field',context);
		field[0].SortOfSortBox = sort;
		return field;
	},
	Layout: function(profile, data, context)
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
		        var fields = ajaxart.runsubprofiles(field_data,profile,'Field',aa_merge_ctx(context,baseCtx));
		        var newFields = [];
		        for(var i=0;i<fields.length;i++) { // we do not need the constant hidden fields
		        	if (fields[i].CalculatedOnly) fields[i].Calculate(field_data,baseCtx);
		        	if (fields[i].IsHidden) continue;
		        	if (fields[i].IsFieldHidden && fields[i].IsFieldHidden(field_data,baseCtx)) continue;
		        	
		        	newFields.push(fields[i]);
		        }
		        fields = newFields;
				jBart.trigger(layout_field,'InnerFields',{ Context: baseCtx, FieldData: field_data, Fields: fields });					
		        
		        var layout = aa_api_object(jQuery(layout_field.Style.Html), { Fields:fields } );
				var setControl = function(classOrElement) {
					var inner = this.getInnerElement(classOrElement);
					inner.jbFieldElement = this;
					if (!inner) return;
					var ctx2 = aa_ctx(baseCtx,{_Field: [this.Field]});
					var field = this.Field;

					if (this.Field.AsyncActionRunner) {
						this.Field.AsyncActionRunner({ CreateCellControl: true, wrapper: inner, context: ctx2, field_data: field_data});
					} else {
						var cell_data = ajaxart_field_calc_field_data(this.Field,field_data,ctx2);
						var cntr = ctx.vars._Cntr && ctx.vars._Cntr[0];
						
						if (field.AsSection && !field.HideTitle) {
							var sectionCtrl = aa_buildSectionControl(cntr,field,field_data,cell_data,ctx2);
							inner.appendChild(sectionCtrl);
						} else {
							ajaxart_field_createCellControl(field_data,cntr,inner,"control",field,cell_data,ctx2);
						}
						if (inner.firstChild)
							aa_element_attached(inner.firstChild);
					}
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
					return [ aa_wrapWithSection(layout,layout_field,layout_field.SectionStyle,field_data,ctx) ];
				}
				layout.jbContext = baseCtx;
				return [layout];
			}
		}
		ajaxart.runsubprofiles(data,profile,'FieldAspect',aa_ctx(context,{_Field: [layout_field]}));
		return [layout_field];
	},
	TabControl: function(profile, data,context)
	{
		var tab_field = { isObject : true };
		tab_field.Id = aa_text(data,profile,'ID',context);
		tab_field.Title= aa_text(data,profile,'Title',context);
		tab_field.ID = [tab_field.Id];
		tab_field.FieldData = function(data1) { return data1; }
		tab_field.CellPresentation = ["control"];
		tab_field.HideTitle = true;
		tab_field.KeepSelectedTabIn = aa_first(data,profile,'KeepSelectedTab',context);
		tab_field.RefreshTabsOnSelect = aa_bool(data,profile,'RefreshTabsOnSelect',context);
		tab_field.Control = function(field_data,ctx) {
			tab_field.Style = aa_first(data,profile,'Style',context);
	        var tabcontrol = aa_api_object(jQuery(tab_field.Style.Html),{data: field_data, Tabs: []});
	        var ctx2 = aa_ctx(ctx, {ControlElement:[tabcontrol]});
	        aa_defineElemProperties(tabcontrol,'Fields,addTabs,cntr,Tabs,data,tabContents,tabsParent');
	        tabcontrol.Fields = ajaxart.runsubprofiles(data,profile,'Field',context);
	        tabcontrol.addTabs = function(classOrElementForTab,classOrElementForTabContents,init_tab_func)
	        {
	        	var tabcontrol = this;
				var inner = this.getInnerElement(classOrElementForTab);
				tabcontrol.tabContents = this.getInnerElement(classOrElementForTabContents);
				if (!inner || !init_tab_func || !tabcontrol.tabContents) return;
				tabcontrol.tabsParent = inner.parentNode;
				tabcontrol.initTabFunc = init_tab_func;
				
				for(var i=0;i<tabcontrol.Fields.length;i++) {
					var field = tabcontrol.Fields[i];
					if (field.IsFieldHidden && field.IsFieldHidden(field_data,ctx)) continue;
					if (field.IsCellHidden && field.IsCellHidden(field_data,ctx)) continue;
					
					switch (field.RefreshTabOnSelect) {
						case 'refresh': field.RefreshTabOnSelect = true; break;
						case 'no refresh': field.RefreshTabOnSelect = false; break;
						default: field.RefreshTabOnSelect = tab_field.RefreshTabsOnSelect;// inherit
					}
					var tab = inner.cloneNode(true);
					tab.Field = field; tab.tabcontrol = tabcontrol;
					if (field.Id) jQuery(tab).addClass("tab_" + field.Id);
					tabcontrol.Tabs.push(tab);
					inner.parentNode.insertBefore(tab,inner);
					var tab_obj = aa_api_object(jQuery(tab),{ Field: field, data : tabcontrol.data, Title: field.Title });
					aa_defineElemProperties(tab,'tab_obj,Select,tabcontrol,Field,Contents');
					tab_obj.Image = aa_init_image_object(field.TabImage,field_data,ctx);
					tab.tab_obj = tab_obj;
					if (field.TabNumericIndication)
						tab_obj.NumberIndication = field.TabNumericIndication(field_data,ctx2);
					var initEvents = function(tab) {
						tab.Select = function() {
							this.tab_obj.Select();
						}
						tab_obj.Select = function (e,animation) {
							jBart.trigger(tab,'OnBeforeSelect',{});
							if (tab.Field.TabOnBeforeSelect) {
								tab.Field.TabOnBeforeSelect(field_data, ctx2);
								tab.tabcontrol.RefreshTabsHead();	// a shortcut for changing the numeric indication with no call to refresh
							}
				    		var jTab = jQuery(tab),field = tab.Field,tabcontrol = tab.tabcontrol;
				    		var cntr = ctx.vars._Cntr ? ctx.vars._Cntr[0] : {};
				    		var current_cntr = jQuery(tabcontrol.tabContents).find('>.aa_container')[0];
//				    		if ( current_cntr && ! aa_passing_validations(current_cntr) )
//				    		  return aa_stop_prop(e);
				    		
				  		    var currentID = tab.Field.Id,prevTabField=[];
				  		    var currrentSelectedTab = jQuery(tabcontrol.tabsParent).find('>.aa_selected_tab')[0];
				  		    var prevTabId = [];
				  		    if (currrentSelectedTab) {
				  		      prevTabField = [currrentSelectedTab.Field];
				  		      prevTabId = [currrentSelectedTab.Field.Id];
				  		      if (cntr.BeforeChangeTab) cntr.BeforeChangeTab(prevTabField,ctx2);
				  		      jQuery(currrentSelectedTab).removeClass('aa_selected_tab');
				  		    }
							ajaxart.run(data,profile,'OnTabChange', aa_ctx(ctx2, { PrevTab: prevTabId, NewTab: [tab.Field.Id] }));
				  		    jTab.addClass('aa_selected_tab');
						    if (tab_field.ID != "" && tab_field.KeepSelectedTabIn && tab_field.KeepSelectedTabIn.set)
						    	tab_field.KeepSelectedTabIn.set(tab_field.Id, currentID);

						    var cleanLeaks = true;
						    if (currrentSelectedTab && currrentSelectedTab.Field.RefreshTabOnSelect == 'no refresh' )
						    	cleanLeaks = false;
						    
				    		if (!tab.Contents || field.RefreshTabOnSelect) {
							    var tab_data = ajaxart_field_calc_field_data(field,field_data,ctx);
							    var control = jQuery('<div/>').get();
							    aa_fieldControl({Field: field, FieldData: tab_data, Item: field_data, Wrapper: control[0], Context: ctx});
								if (control.length > 0) {
									tab.Contents = control[0];
								}
				    		}
						    if (!animation) {
						    	aa_element_detached(tabcontrol.tabContents.firstChild);
							    aa_empty(tabcontrol.tabContents,cleanLeaks);
								tabcontrol.tabContents.appendChild(tab.Contents);
								aa_element_attached(tab.Contents);
							} else {
								// animation
								tabcontrol.tabContents.style.cssText = 'position:relative';
								tab.Contents.style.cssText = 'position:absolute; z-index:100; top:0px; left:0px;';
								var prev_tab = tabcontrol.tabContents.firstChild;
								tabcontrol.tabContents.appendChild(tab.Contents);
								aa_element_attached(tab.Contents);
								animation.animate(tab.Contents, function() {
									aa_element_detached(prev_tab);
									aa_remove(prev_tab,cleanLeaks);
									tabcontrol.tabContents.appendChild(tab.Contents);
									tab.Contents.style.cssText = 'position:none; z-index:none; top:none; left:none;';
								});
							}

						    if (field.DoWhenUserClicksTab) field.DoWhenUserClicksTab([],context);
			  		        if (cntr.AfterTabLoaded) cntr.AfterTabLoaded([tab.Field],aa_ctx(context,{PreviousTab: prevTabField}));
			  		        aa_fixTopDialogPosition();
							jBart.trigger(tab,'OnAfterSelect',{});
							aa_trigger(tab_field,'TabControlSelect',{
								FieldData: field_data,
								TabField: tab.Field
							});
							if (tab.Field.TabOnAfterSelect)
								tab.Field.TabOnAfterSelect(field_data, ctx2);
						}
						tab_obj.ApplyDynamicProperties = function() {
							var field = this.Field;
							if (field.TabNumericIndication)
								this.NumericIndication = ajaxart.totext(field.TabNumericIndication(field_data,ctx2));
							if (field.ShowTabOnCondition && !ajaxart.tobool_array(field.ShowTabOnCondition(field_data,ctx2)))
								this.style.display = 'none';
							else
								jQuery(this).show();
						}
					}
					initEvents(tab);
					tab_obj.ApplyDynamicProperties();
					init_tab_func(tab_obj);
				}
				tabcontrol.RefreshTabsHead = function() {
					for(var i=0;i<tabcontrol.Tabs.length;i++) {
						tabcontrol.Tabs[i].ApplyDynamicProperties();
						tabcontrol.initTabFunc(tabcontrol.Tabs[i],true);
					}
					jBart.trigger(tabcontrol, 'TabsChanged', {});
				}
				inner.parentNode.removeChild(inner);
	        }
			aa_apply_style_js(tabcontrol,tab_field.Style);
			tabcontrol.jElem.addClass( aa_attach_global_css(tab_field.Style.Css) );
	        
 		    // select a tab
 		    var visible_tabs = jQuery(tabcontrol.Tabs).filter(function() { return this.style.display != 'none' });
 		    if (visible_tabs.length > 0) {
 		      var selectedTab = visible_tabs[0];
 		      if (tab_field.KeepSelectedTabIn && tab_field.KeepSelectedTabIn.get) {
			      var currentID = aa_totext( tab_field.KeepSelectedTabIn.get(tab_field.ID) );
	 		      for(var i=0;i<visible_tabs.length;i++) {
	 		    	  if (currentID == visible_tabs[i].Field.Id) 
	 		    	  	selectedTab = visible_tabs[i];
	 		      }
 		      }
 		      selectedTab.Select();
 		    }
 		    tabcontrol.jElem.addClass('aa_tabcontrol'); // for ChangeTab operation
// 		    tabcontrol.jElem[0].Cntr = cntr; // for ChangeTab operation
 		    tabcontrol.jElem[0].TabControl = tabcontrol;
 		    tabcontrol.jElem[0].Field = tab_field;
 		    
		    return [tabcontrol.jElem[0]];
		}
		ajaxart.runsubprofiles(data,profile,'FieldAspect',aa_ctx(context,{_Field: [tab_field]} ));
		return [tab_field];
	},
	IsTabSelected: function(profile,data,context)
	{
		var tab_ctrl_id = aa_text(data,profile,'TabControl',context);
		var tab_id = aa_text(data,profile,'Tab',context);
		var out = [];

		jQuery(aa_find_field(tab_ctrl_id,'aa_tabcontrol')).each(function(index,tab) {
			if (jQuery(tab).find('.tab_' + tab_id).hasClass('aa_selected_tab')) out = ["true"];
		});
		return out;
	},
	RefreshTabsHead: function(profile,data,context)
	{
		var tabs = context.vars.ControlElement[0];
		if (tabs.RefreshTabsHead)
			tabs.RefreshTabsHead();
	}
});
//AA EndModule
//AA BeginModule
aa_gcs('field_aspect',
{
	ReadOnlyControl: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
		ajaxart_addMethod(field,'ReadOnlyControl',profile,'Control',context);
		
		return [];
	},
	Mandatory: function (profile,data,context)
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
	Description: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
		field.Description = aa_multilang_text(data,profile,'Description',context);
//		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
//			  if (field.Description != '')
//			  {
//				  var desc_elem = document.createElement("span");
//				  desc_elem.className = "field_desc";
//				  desc_elem.innerHTML = field.Description;
//				  cell.appendChild(desc_elem);
//			  }
//		},'Description',1000);

		return [];
	},
	LinkInRichTextAsAction: function(profile,data,context)
	{
		var field = context.vars._Field[0];
		var cls = aa_text(data,profile,'LinkClass',context);
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
			var cls = aa_text(data,profile,'LinkClass',context);
			var link = jQuery(cell).find('.'+cls)[0];
			if (!link) return;
			link.href = "#";
			link.onclick = function() {
				if (window.aa_incapture) return;
				var link = jQuery(cell).find('.'+cls)[0];
				ajaxart.run(field_data,profile,'Action',aa_ctx(context,{ControlElement:[link]})); return false;
			}
		},'LinkInRichTextAsAction_'+cls,1000);
	},
	OnAttach: function(profile,data,context)
	{
		var field = context.vars._Field[0];
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
			aa_addOnAttach(cell,function() {
				ajaxart.run(field_data,profile,'Action',aa_merge_ctx(context,ctx,{_ElemsOfOperation: [cell]}));
			});
		},'OnAttach',1000);
	},
	ItemListSelectionWithKeyboard: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
			var input = jQuery(cell).find('input');
			var itemlistCntr = ctx.vars.ItemListCntr && ctx.vars.ItemListCntr[0];

			input.keydown(function(e) {
				if (itemlistCntr) { // new itemlist 
					if (e.keyCode == 40 || e.keyCode == 38) {	// arrow down/up
						if (itemlistCntr.SelectionKeyDown) itemlistCntr.SelectionKeyDown(e); // delegate to cntr selection
						return false;
					} else if (e.keyCode == 13 && itemlistCntr.SelectedElement) {
						var selected = itemlistCntr.SelectedElement;
						ajaxart.run(selected.Item,profile,'DoOnEnter',aa_ctx(context,{ControlElement: [selected] }));
					}
					
				  return true;	
				}
				
				var cntr = ctx.vars.DataHolderCntr[0];
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
	Information: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
			var presnetation = aa_text(data,profile,'Presentation',context);
			if (presnetation == 'before' || presnetation == 'after')
			{
				var info_ctrl = ajaxart.runNativeHelper(data,profile,'Ctrl',aa_merge_ctx(context,ctx))[0];
				if (info_ctrl == null) return;
				jQuery(info_ctrl).addClass('aa_info_control');
				var cell_tr = jQuery(cell).parent();
				if (cell_tr.hasClass('field_row'))
				{
					var info_tr = document.createElement('tr');
					info_tr.className= 'info_tr';
					var td = document.createElement('td');
					td.className= 'info_td';
					td.setAttribute('colSpan','2');
					td.appendChild(info_ctrl);
					info_tr.appendChild(td);
					if (presnetation == 'before')
						jQuery(info_tr).insertBefore(cell_tr);
					else
						jQuery(info_tr).insertAfter(cell_tr);
					
					aa_add_virtual_inner_element(cell,info_tr);
				}
				else // group
				{
					jQuery(info_ctrl).addClass('aa_group_info ' + presnetation);
					if (presnetation == 'before')
						jQuery(info_ctrl).insertBefore(cell);
					else
						jQuery(info_ctrl).insertAfter(cell);
					
					aa_add_virtual_inner_element(cell,info_ctrl);
				}
			}
			else if (presnetation == 'popup')
				  field.AddInfoIcon([cell],context);
		},'Information');
		field.OpenInfoPopup = function(data1,ctx)
		{
			return ajaxart.runNativeHelper(data1,profile,'OpenInfoPopup',aa_merge_ctx(context,ctx));
		}
		field.AddInfoIcon = function(data1,ctx)
		{
			var cell = data1[0];
			var parent = cell;
			if (this.AsSection && ! this.HideTitle) 
				parent = jQuery(cell.previousSibling).find('>.aa_section_title_text')[0];
			
			var info_icon = jQuery('<span class="fieldtitle_info">&nbsp;</span>')[0];
			jQuery(parent).append(info_icon);

			info_icon.onmousedown = function(e) 
	    	{ 
				if (aa_contentsOfOpenPopup().length > 0)
				{
					if (aa_contentsOfOpenPopup()[0].LaunchingElement == this)
						return;
					else
						aa_closePopup();
				}
			    var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  );
  	    		ajaxart.runNativeHelper([],profile,'OpenInfoPopup',aa_merge_ctx(context,ctx,{ _InfoElement : elem.get() }));
	    	}
		}


		return [];
	},
	Multiple: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
		
		field.Multiple = true;
		field.MultipleTitle = ajaxart_multilang_run(data,profile,'MultipleTitle',context);
		if (field.MultipleTitle != "")
			field.Title = field.MultipleTitle;
		if (ajaxart.fieldscript(profile,'Items') != null)
			ajaxart_addMethod(field,'MultipleItems',profile,'Items',context);
		
		var getControl = function(field) { return function(data1,ctx) {
			var newContext = aa_ctx(aa_merge_ctx(context,ctx), { _Field: [field]});
			return ajaxart.runNativeHelper(data1,profile,'Control',newContext); 
		}};
	    ajaxart_addControlMethod_js(field,'MultipleControl',getControl(field),context);
		
		return [];
	},
	JavaScript: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		var runWhen = aa_text(data,profile,'RunWhen',context);
    	var js = profile.getAttribute('Code');
    	if (!js) js = aa_text(data,profile,'Code',context);
		var func = aa_get_func(js);
		if (runWhen == 'init') func(data[0],null,field,context);
		if (runWhen == 'control' ||  runWhen == 'control attached' ) {
			aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
				if (runWhen == 'control') func(field_data[0],cell,field,ctx);
				if (runWhen == 'control attached') aa_addOnAttach(cell,function() { func(field_data[0],cell,field,ctx); });
			});
		}
	},
	PopupOnHover: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
			cell.onmouseover = function() {
				if (cell.isInside) return;
				if (cell.jbTimer) clearTimeout(cell.jbTimer);
				cell.jbTimer = setTimeout(function() {
					if (cell.isInside)
					  ajaxart.runNativeHelper(field_data,profile,'Open',aa_merge_ctx(context,ctx,{ControlElement: [cell], Item:item}));
					cell.jbTimer = null;
				},500);
				cell.isInside = true;
			};
			cell.onmouseout = function() { 
				cell.isInside = false;
			};
			cell.onclick = function() {
				if (cell.jbTimer) { clearTimeout(cell.jbTimer); cell.jbTimer=null; }
				ajaxart.runNativeHelper(field_data,profile,'Open',aa_merge_ctx(context,ctx,{ControlElement: [cell], Item:item}));
			}
		},'PopupOnHover');
	},
	TextSummary: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		if (aa_bool(data,profile,'IgnoreEmptyValues',context)) {
			var compiled = ajaxart.compile_text(profile, "Text",context);
			field.Text = function(data1,ctx) {
				if (aa_totext(data1) == "") return [];
				return [compiled(data1,ctx)];
			}
		}
		else
			ajaxart_addMethod(field,'Text',profile,'Text',context);
		return [];
	},
	NumberFormat: function (profile,data,context)
	{
		var field = context.vars._Field && context.vars._Field[0];
		if (field == null) return [];
		var compiled_format = ajaxart.compile(profile,'Format',context);

		if (compiled_format != 'same')
			ajaxart_addMethod(field,'Text',profile,'Format',context);
		return [];
	},
	Tooltip: function(profile,data,context)
	{
		var field = context.vars._Field[0];

//		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
//			cell.title = aa_multilang_text(field_data,profile,'Tooltip',context);
//		});
		aa_field_handler(field,'ModifyCell', function(cell,field_data) {
			cell.title = aa_multilang_text(field_data,profile,'Tooltip',context);
		});
	},
	GrowingImage: function(profile,data,context)
	{
		var field = context.vars._Field[0];
		var newSize = aa_text(data,profile,'NewSize',context).split(',');
		
		field.newWidth = parseInt( newSize[0] || '0' );
		field.newHeight = parseInt( newSize[1] || '0' );
		var duration = aa_int(data,profile,'Duration',context);
		var steps = aa_int(data,profile,'NumberOfSteps',context);
		
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
			var img = jQuery(cell).find('img')[0];
			if (!img) return;

			var width = img.width, height = img.height; 
			var dx = (field.newWidth - width)/steps, dy = (field.newHeight - height)/steps;
			var step = steps;
			var timoutTime = duration / steps;
			
			var runNextStep = function() {
				step--;
				if (step == 0) {
					width = field.newWidth; 
					height = field.newHeight;
				} else {
					width += dx;
					height += dy;
				}
				jQuery(img).width(width).height(height);
				jQuery(cell).width(width).height(height);
				aa_fixTopDialogPosition();
				if (step > 0) {
					setTimeout(runNextStep,timoutTime);
				}
			}
			setTimeout(runNextStep,timoutTime);
		});
	},
	TextAreaProperties: function(profile,data,context)
	{
		var field = context.vars._Field[0];
		
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
			var textareas = jQuery(cell).find('textarea');
			var readonly = aa_text(field_data,profile,'ReadOnly',context);
			if (readonly == 'readonly') textareas.attr('readonly','readonly');
			if (readonly == 'writable') textareas.removeAttr('readonly');
			
			var disabled = aa_text(field_data,profile,'Disabled',context);
			if (readonly == 'disabled') textareas.attr('disabled','disabled');
			if (readonly == 'enabled') textareas.removeAttr('disabled');
		});
	},
	GenericEventHandler: function(profile,data,context)
	{
		var field = context.vars._Field[0];
		
		var evt = aa_text(data,profile,'Event',context);
		jBart.bind(field,evt,function(eventObject) {
			ajaxart.run(eventObject.data || data,profile,'Action',aa_merge_ctx(context,eventObject.context || context));
		});
	},
	HandleEvent: function(profile,data,context)
	{
		var field = context.vars._Field[0];
		
		var events = aa_split(aa_text(data,profile,'Event',context),',',true);
		
		for(var i=0;i<events.length;i++) {
			var evt = events[i];
			
			if (evt == 'update') {
				aa_field_handler(field,'OnUpdate',function(field,field_data,input,e,extra) {
					var ctx1 = input.ajaxart ? aa_merge_ctx(context,input.ajaxart.params) : context;
					var parent_elem = jQuery(input).parents('.aa_item')[0]; 
					var item = parent_elem && parent_elem.ItemData;
					var newContext = aa_ctx(ctx1,{ _Field: [field], _FieldData: field_data
						, _Input: [input], ControlElement: [input], _Item: item || [] } );
					if (extra) newContext = aa_ctx(newContext,extra);
					if (jQuery(input).parents('.aa_container').length > 0)
						newContext.vars._Cntr = [ jQuery(input).parents('.aa_container')[0].Cntr ];
					
					ajaxart.run(field_data,profile,'Action',newContext);
				});
			};
			if (evt == 'blur' ) {
				aa_field_handler(field,'OnBlur',function(field,field_data,input,e,extra) {
					var newContext = aa_ctx(context,{ _Field: [field], _FieldData: field_data , _Input: [input], ControlElement: [input] } );
					if (jQuery(input).parents('.aa_container').length > 0)
						newContext.vars._Cntr = [ jQuery(input).parents('.aa_container')[0].Cntr ];
					ajaxart.run(field_data,profile,'Action',newContext);
				});
			};
			if (evt == 'keydown' ) {
				aa_field_handler(field,'OnKeydown',function(field,field_data,input,e,extra) {
					var newContext = aa_ctx(context,{ _Field: [field], _FieldData: field_data , _Input: [input], ControlElement: [input] } );
					if (jQuery(input).parents('.aa_container').length > 0)
						newContext.vars._Cntr = [ jQuery(input).parents('.aa_container')[0].Cntr ];
					ajaxart.run(field_data,profile,'Action',newContext);
				});
			};
			if (evt == 'keyup' || evt == 'enter pressed' || evt == 'ctrl enter pressed') {
				aa_field_handler(field,'OnKeyup',function(field,field_data,input,e,extra) {
					if (evt == 'enter pressed' && aa_totext(extra.KeyCode) != 13) return;
					if (evt == 'ctrl enter pressed' && aa_totext(extra.KeyCode) != 13) return;
					if (evt == 'enter pressed' && aa_tobool(extra.CtrlKey)) return;
					if (evt == 'ctrl enter pressed' && ! aa_tobool(extra.CtrlKey)) return;
	
					var newContext = aa_ctx(context,{ _Field: [field], _FieldData: field_data , _Input: [input], ControlElement: [input] } );
					if (jQuery(input).parents('.aa_container').length > 0)
						newContext.vars._Cntr = [ jQuery(input).parents('.aa_container')[0].Cntr ];
					if (extra && extra.KeyCode)	newContext.vars.KeyCode = extra.KeyCode;
					if (extra && extra.CtrlKey)	newContext.vars.CtrlKey = extra.CtrlKey;
					
					ajaxart.run(field_data,profile,'Action',newContext);
				});
			};
			if (evt == 'control attached') {
				aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
					aa_addOnAttach(cell,function() {
						ajaxart.run(field_data,profile,'Action',aa_merge_ctx(context,ctx,{_ElemsOfOperation: [cell]}));
					});
				},1000);
			};
			if (evt == 'load') {
				ajaxart.runNativeHelper(data,profile,'OnLoad',context);
			}
			if (evt == 'focus') {
				aa_field_handler(field,'OnFocus',function(field,field_data,input,e,extra) {
					var newContext = aa_ctx(context,{_Field: [field], _FieldData: field_data, _Input: [input], ControlElement: [input]} );
					ajaxart.run(field_data,profile,'Action',newContext);
				});
			};
			if (evt == 'mouse over') {
				aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
					cell.onmouseover = function() {
						if (!cell.isInside)
							ajaxart.run(field_data,profile,'Action',aa_merge_ctx(context,ctx,{ControlElement: [cell]}));
						cell.isInside = true;
					};
					cell.onmouseout = function() { cell.isInside = false; };
				},'PopupOnHover');
			}
			if (evt == 'mouse click') {
				aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
					cell.onclick = function(e) {
						ajaxart.run(field_data,profile,'Action',aa_merge_ctx(context,ctx,{ControlElement: [cell], _DomEvent: [e] }));
					};
				},'MouseClick');
			}
		}
	},
	RunAction: function(profile,data,context)
	{
		var field = context.vars._Field[0];
		ajaxart.runNativeHelper(data,profile,'SetupAction',context);
		jBart.bind(field,'ModifyControl',function(args) {
			var content = args.Wrapper.jbContent || args.Wrapper.firstChild || args.Wrapper; 
			ajaxart.run(args.FieldData,profile,'AfterControlCreated',aa_ctx(context,{ControlElement: [content]}));
		});
	},
	AsynchAction: function(profile,data,context)
	{
		var field = context.vars._Field[0];
		field.AsyncActionRunner = function(settings) {
			var result = settings.Wrapper || settings.wrapper;
			var style = aa_first(data,profile,'LoadingStyle',context);
			var loading = aa_renderStyleObject(style,{
				text: aa_text(data,profile,'LoadingText',context)
			},context);
			result.appendChild(loading);

		    var newContext = aa_ctx(context,{ });
			ajaxart_RunAsync(data,ajaxart.fieldscript(profile,'Action'),newContext,function(data1,ctx,success) {
				aa_empty(result);
				// there are 2 ways for field control: createCellControl and aa_fieldControl
				if (settings.CreateCellControl) {
					var ctx = settings.context;
					var inner = settings.wrapper;
					var cell_data = ajaxart_field_calc_field_data(field,settings.field_data,ctx);
					var cntr = ctx.vars._Cntr && ctx.vars._Cntr[0];
					
					if (field.AsSection && !field.HideTitle) {
						var sectionCtrl = aa_buildSectionControl(cntr,field,settings.field_data,cell_data,ctx);
						inner.appendChild(sectionCtrl);
					} else {
						ajaxart_field_createCellControl(settings.field_data,cntr,inner,"control",field,cell_data,ctx);
					}
				} else {
					settings.Wrapper = result;
					aa_fieldControl(settings,true);
				}
				aa_element_attached(result.firstChild);
			});
			if (settings.Wrapper) settings.Wrapper
		}
	},
	FilterField1: function(profile,data,context)
	{
		var field = context.vars._Field[0];
		
		function init(field) {
			var aspect = {isObject:true }
			aa_set_initialize_container(aspect,function(aspect,ctx,cntr){
				var headerFooterCntr = ctx.vars.HeaderFooterCntr && ctx.vars.HeaderFooterCntr[0];
				if (!headerFooterCntr) return;
				var basedOn = aa_fieldById(aa_text(data,profile,'BasedOn',context),headerFooterCntr.Fields);
				if (basedOn == null) return [];
				if (!headerFooterCntr.ExposedFilters) headerFooterCntr.ExposedFilters = [];

				var filterData = field.FieldData([cntr.Items[0].Items[0]],ctx);
				var filter = aa_create_filter(basedOn,'');
				filter.rawFilterData = filterData;
				headerFooterCntr.ExposedFilters.push(filter);  
				
				if (!basedOn.FilterControl) return;
				field.Control = function(headerFooterCntr,field,basedOn,filterData) { return function(data1,ctx)
				{
					var newContext = aa_ctx(ctx,{ FilterData: filterData, _Field: [basedOn], HeaderFooterCntr: [headerFooterCntr] });
					var result = basedOn.FilterControl(newContext);
					jQuery(result[0]).find('input').slice(0,1).attr('name',field.Id); // post inside form
					return result;
				}}(headerFooterCntr,field,basedOn,filterData);
			});
			aspect.GetContent = function() { return [this]; }
			field.CntrAspects = [aspect];
		};
		init(field);
		return [];
	},
	Calculated: function (profile,data,context)
	{
		var toggleButtonCss = aa_attach_global_css(aa_text(data,profile,'ToggleButtonCss',context),null,'toggle_button');
		
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
		field.CalcFormula = function(item_data,ctx)
		{
			var result = aa_text(item_data,profile,'Formula',aa_merge_ctx(context,ctx));
			if (aa_bool(data,profile,'MathFormula',context))
				return [eval_math_formula(result) || ''];
			else
				return [result];
		}
		field.WrapperToValue = function(wrapper)
		{
			if (!wrapper.__item || (context.vars.DataHolderCntr && context.vars.DataHolderCntr[0].WrappersAsItems))
				var item = wrapper;
			else
				var item = wrapper.__item;
			return this.CalcFormula([item],context)[0];
		}
		if (! aa_bool(data,profile,'PrimitiveField',context)) {
			field.IsCalculated = true;
			return [];
		}
		field.IsManual = function(field_data,ctx)
		{
			if (ajaxart.isxml(field_data) && field_data[0].nodeType == 2) 
			{
				var att_name = field_data[0].nodeName + "__Manual";
				return ajaxart.xml.xpath(field_data[0],"../@" + att_name,true,'');
			}
 			return [];
		}
//		ajaxart_addMethod_js(field,'IsManual',isManual,context);
		
		field.DependsOnFields = ajaxart_run_commas(data,profile,'DependsOnFields',context);
		field.ManualOverride = aa_bool(data,profile,'ManualOverride',context);

		var CalculatedWithOverride = function(td,field,field_data,ctx)
		{
		var toggleControl = {
				States : {
					"manual" : {
						Control : function() 
						{ 
							var ctrl = ajaxart_field_createSimpleInput(field_data,ctx);
							jQuery(ctrl).addClass("field_control fld_" + field.Id);
							ctrl.Field = field;
							return ctrl;
						},
						ChangeStateLabel : "recalc",
						ChangeToState : "calculated"
					},
					"calculated" : {
						Control : function() 
						{ 
							var txt = aa_text(ctx.vars._Item,profile,'Formula',context);
							if (aa_bool(data,profile,'MathFormula',context))
								txt = eval_math_formula(txt, 2);
							ajaxart.writevalue(field_data,[txt]);
							var ctrl = jQuery('<span>' + txt + '</span>');
							jQuery(ctrl).addClass("field_control fld_" + field.Id);
							return ctrl[0];
						},
						ChangeStateLabel : "override",
						ChangeToState : "manual"
					}
				},
				Detect : function() 
				{ 
					var result = ajaxart_runMethod(field_data,field,'IsManual',context);
					if (ajaxart.tobool_array(result))
						return "manual";
					return "calculated";
				},
				Build : function(state)
				{
					aa_empty(td,true);
					td.appendChild(state.Control());

					var button = jQuery('<span class="aa_toggle_button">' + ajaxart_multilang_text(state.ChangeStateLabel,context) + ' </span>')
					button.addClass(toggleButtonCss);
					td.appendChild(button[0]);
					button[0].onmousedown = function() 
					{
						var new_state = td.toggleControl.States[state.ChangeToState];
						if (state.ChangeToState == "manual")
							ajaxart.writevalue(ajaxart_runMethod(field_data,field,'IsManual',ctx),'true');
						else
						{
							var att_to_delete = ajaxart_runMethod(field_data,field,'IsManual',ctx)[0];
							var parent = ajaxart.xml.parentNode(att_to_delete);
							if (parent != null)
								parent.removeAttribute(att_to_delete.nodeName);
						}
						td.toggleControl.Build(new_state);
					}
//					if (field.ModifyControl)
//						for(var i=0;i<field.ModifyControl.length;i++)
//							field.ModifyControl[i](td,field_data,"control",ctx,[]);
				}
		}
		td.toggleControl = toggleControl;
		toggleControl.Build(toggleControl.States[toggleControl.Detect()]);
		}
		if (field.ManualOverride)
			field.CalculatedControl = CalculatedWithOverride;
		else
		{
			field.IsCalculated = true;
			field.CellPresentation = 'text';
		}
		
		return [];
	},
	RefreshDependentFields: function(profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		field.DependentFields = aa_text(data,profile,'FieldsIds',context);
		field.RefreshOn = aa_text(data,profile,'RefreshOn',context);
		field.RefreshScope = aa_text(data,profile,'RefreshScope',context);
		
		aa_field_handler(field,'OnUpdate', function(field,field_data,input) {
			// using container context, if exists
			var ctx = context;
			var cntr = jQuery(input).parents('.aa_container')[0];
			if (cntr) ctx = cntr.Cntr.Context;
			ajaxart_field_RefreshDependentFields(field,input,ctx);	
		});
		return [];
	},
	PicklistTextSummary: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		field.CssForImage = aa_text(data,profile,'CssForImage',context);
		
		var show = aa_text(data,profile,'Show',context);
		if (field.Options == null) return [];
		
		var getText = function(field,show) { return function(data1,ctx) {
			var code = ajaxart.totext_array(data1);
			var text = field.Options.codeToText(code);
			if (aa_paramExists(profile,'ManipulateText')) 
				text = aa_text([text],profile,'ManipulateText',context);
			
			if (show != 'text only' && field.Options.HasImages) {
				var img = field.Options.codeToImage(code);
				if (img && img != "") {
					img = '<img title="'+text+'" alt="'+text+'" class="aa_imagebeforetext" src="'+img+'" style="'+field.CssForImage+'" />';
					if (show == 'image only') text = img; else text = img + text;
				}
			}
			return [text];
		}}
        ajaxart_addScriptParam_js(field,'Text',getText(field,show),context);
	},
	SortMethodOld: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		if (!field) return [];
		var method = aa_text(data,profile,'Method',context);
		if (method == "numeric")
			field.SortValFunc = function(x) { return parseFloat(x); }
		if (method == "date")
			field.SortValFunc = function(x) { return aadate_date2int(x); }
	},
	Validation: function (profile,data,context)
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
	},	
	Title: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.Title = aa_multilang_text(data,profile,'Title',context);
		
		field.DynamicTitle = function(data1,ctx) {
			return aa_multilang_text(data1,profile,'Title',aa_ctx(context,ctx));
		}
	},
	ChangeFieldID: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		var id = aa_text(data,profile,'ID',context);
		field.Id = id;
		field.ID = [id];
	},
	TextSearchAlgorithm: function (profile,data,context)
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
	FullHeight: function (profile,data,context) {
		aa_field_handler(context.vars._Field[0],'ModifyCell', function(cell,field_data,cell_presentation,ctx,item) {
			cell.style.height = '100%';
			if (cell.firstChild) cell.firstChild.style.height = '100%';
		},'FullHeight');
	},
	ColumnWidth: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.Width = ajaxart.run(data,profile,'Width',context);
	},
	HighlightSubTextOnFilter: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		var idForFilteredResults = 0;
		var highlight_class = aa_attach_global_css( aa_text(data,profile,'HighlightCss',context) , null, 'highlight' );
		
		if (context.vars.ItemListCntr) { // new itemlist
			var itemlistCntr = context.vars.ItemListCntr[0];
			aa_field_handler(field,'ModifyCell', function(cell,field_data,cell_presentation,ctx,item) {
				var filter = itemlistCntr.GetFilterOfSpecificResult && itemlistCntr.GetFilterOfSpecificResult(item[0],field_data);
				if (filter && filter.FilterType && filter.FilterType.HighlightSelectedText) {
					  var content = jQuery(cell).find(">.aa_text,>span>.aa_text")[0];
					  if (!content && cell.firstChild && cell.firstChild.nodeType == 1) content = cell.firstChild;
					  content = content || cell; 
					
					  filter.FilterType.HighlightSelectedText(content,highlight_class + ' aa_highlight',itemlistCntr.GetFilterQueryData(filter));
				}
			});
			return;
		}
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
	Boolean: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.WritableControl = function(field_data,ctx)
		{
			var field = context.vars._Field[0];
			var input = ajaxart_field_createSimpleInput(field_data,context,false,'checkbox');
			jQuery(input).addClass('aa_checkbox');
			if (input.jbRemoveTextboxClass) input.jbRemoveTextboxClass();
			input.getValue = function() {
				return (this.checked) ? "true" : "false";
			}
			input.onclick = function(e) {
				this.updateValue();
			}
			input.onblur = function(e) {} // disable onblur
			aa_checked(input,aa_tobool(field_data));

			return [input];
		}
		ajaxart.runNativeHelper(data,profile,'FieldAspect',context);
		return [];
	},
	BooleanTextSummary: function (profile,data,context)
	{
		var trueText = ajaxart_multilang_run(data,profile,'TextForTrue',context);
		var falseText = ajaxart_multilang_run(data,profile,'TextForTrue',context);
		
		function init(trueResult,falseResult) {
			context.vars._Field[0].Text = function(data1,ctx) {
				return aa_tobool(data1) ? trueResult : falseResult;
			}
		}
		init(trueText,falseText);
	},
	CheckBox: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.HideTitle = true;
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
			  if (ajaxart_field_is_readOnly(ctx.vars._Cntr && ctx.vars._Cntr[0],cell.Field,ctx)) return;
			  var title = document.createElement("span");
			  title.className = "checkbox_title";
			  title.innerHTML = field.Title;
			  cell.appendChild(title);
		},'boolean_checkbox');
		return [];
	},
	Radio: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		if (aa_bool(data,profile,'HideTitle',context))
		  field.HideTitle = true;
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
		  if (ajaxart_field_is_readOnly(ctx.vars._Cntr[0],cell.Field,ctx)) {
			  var text = aa_tobool(field_data) ? aa_multilang_text(data,profile,'TextForYes',context) : aa_multilang_text(data,profile,'TextForNo',context);
			  jQuery(cell).find('.field_control').html(text);
			  return;
		  }
		  var option_yes = jQuery('<input type="radio" class="aa_radio" name="' + field.Id + '"/><span class="aa_radio_label">' 
				  + aa_multilang_text(data,profile,'TextForYes',context) + '</span>');
		  var option_no = jQuery('<input type="radio" class="aa_radio" name="' + field.Id + '"/><span class="aa_radio_label">' 
				  + aa_multilang_text(data,profile,'TextForNo',context) + '</span>');
		  if (aa_tobool(field_data)) option_yes[0].checked = true; else option_no[0].checked = true;
		  option_yes[0].aa_value = "true";
		  option_no[0].aa_value = "false";
		  aa_empty(cell,true);
		  jQuery(cell).append(option_yes);
		  jQuery(cell).append(option_no);
		  cell.onclick = function(e) {
				if (window.aa_incapture) return;
			  	if (ajaxart_field_is_readOnly(ctx.vars._Cntr[0],cell.Field,ctx)) return;
				var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  );
				if (elem.hasClass('aa_radio_label'))
				{
					elem = elem.prev();
					aa_checked(elem[0],true);
				}
				ajaxart.writevalue(field_data, [elem[0].aa_value]);
				aa_invoke_field_handlers(field.OnUpdate,null,null,field,field_data);
		  }
		},'boolean_radio');
		return [];
	},
	Password: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.ManualWriteValue = true;
		field.HashPassword = aa_bool(data,profile,'HashPassword',context);
		
		field.Control = function(field_data,ctx)
		{
			var field = context.vars._Field[0];
			return [ajaxart_field_createSimpleInput(field_data,context,false,'PASSWORD')];
		}
		field.ReadOnlyControl = function(field_data,ctx)
		{
			return jQuery('<div>*****</div>').get(); 
		}
		
		aa_field_handler(field,'OnKeyup',function(field,field_data,input,e) {
			var field = context.vars._Field[0];
			var hash = (field.HashPassword) ? ajaxart_hashPassword(input.value) : input.value;
			ajaxart.writevalue(field_data,hash);
		},'password');
		
		return ["true"];
	},
	DisableCharacters: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.KeyPressValidator = new RegExp(aa_text(data,profile,'CharacterPattern',context));
	},
	DefaultValue: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		// old field
		field.DefaultValue = function(data1,ctx) {
			return ajaxart.run(data1,profile,'Value',aa_merge_ctx(context,ctx));
		}
		// new field
		jBart.bind(field,'FieldData',function(args) {
			if (aa_totext(args.FieldData) == '')
				ajaxart.writevalue(args.FieldData,field.DefaultValue(args.Item,args.Context),true);
		},'DefaultValue');
	},
	DisableByCondition: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.Disabled = function(data1,ctx)
		{
			var item = ctx.vars._Item ? ctx.vars._Item : data1;
			return aa_bool(item,profile,'EnableCondition',context) ? [] : ['true'];
		}
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
				jQuery(cell).find('.field_control').each(
				function() { 
					input = this;
					var enable = aa_bool(item,profile,'EnableCondition',context);
					if (enable)
					{
						input.removeAttribute("disabled");
						jQuery(input).removeClass('aa_disabled');
					}
					else
					{
						input.setAttribute("disabled", "disabled");
						jQuery(input).addClass('aa_disabled');
					}
				});
		},'DisableByCondition');
	},
	HideByCondition: function (profile,data,context)
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
	},
	CheckConditionForEveryItem: function(profile,data,context) {
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
			}
		}];
	},
	CheckConditionOnce: function(profile,data,context) {
		return [{
			apply: function(field,context) {
				field.IsFieldHidden = function(data2,ctx) {
					return !aa_bool(data2,profile,'ShowCondition',aa_merge_ctx(context,ctx));	// todo: compile
				};
			}
		}];
	},
	Hidden: function(profile,data,context) {
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
	ReadOnlyByCondition: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.ReadOnly = function(data1,ctx)
		{
			var item = ctx.vars._Item ? ctx.vars._Item : data1;
			return aa_bool(item,profile,'WritableCondition',context) ? [] : ['true'];
		}
	},
	AddControl: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx) {
			var ctrl = aa_first(field_data,profile,'Control',aa_ctx(aa_merge_ctx(context,ctx),{Cell:[cell]}));
			if (ctrl != null) {
			  ctrl.style.display = "inline-block";
			  cell.appendChild(ctrl);
			}
		});
	},
	CustomSuggestionBox: function(profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		ajaxart.customsuggestbox.init(field,data,profile,context);
		return [];
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
  Hyperlink: function(profile,data,context)
  {
	var field = context.vars._Field[0];
	var cssClass = aa_attach_global_css( aa_text(data,profile,'Css',context) , null, 'hyperlink' );
	
	aa_field_handler(field,'ModifyCell', function(td,field_data,cell_presentation,ctx,item) {
		jQuery(td).addClass("aa_hyperlink").addClass(cssClass);
		td.onclick = function() {
			if (window.aa_incapture) return;
			ajaxart.run(item,profile,'Action',aa_ctx(aa_merge_ctx(context,ctx), {_ItemsOfOperation:item, Item:item, _ElemsOfOperation:[this.parentNode] , ControlElement: [td]}));
		}
	});
  },
  ImageInTextbox: function(profile,data,context)
  {
	var field = context.vars._Field[0];
	aa_field_handler(field,'ModifyCell', function(td,field_data,cell_presentation,ctx,item) {
		var input = jQuery(td).find('.aatextbox')[0];
		var img = jQuery('<img src="'+aa_text(data,profile,'Image',context)+'" />');
		img[0].style.cssText = aa_text(data,profile,'CssForImage',context);
		img.insertAfter(input);
	});
  },
  RunningInputFieldData: function(profile,data,context)
  {
	  if (context.vars._Field && context.vars._Cntr && context.vars._Cntr[0].Items[0])
		  return context.vars._Field[0].FieldData(context.vars._Cntr[0].Items[0].Items);
	  return [];
  }
});

aa_gcs("search_algorithm", {
	SimpleSearch: function (profile,data,context) 
	{
		var matchOnlyTextBeginning = aa_bool(data,profile,'MatchOnlyTextBeginning',context);
		return [ {
			newFilter: aa_create_text_filter(matchOnlyTextBeginning) 
		}];
	},
	SearchWords: function (profile,data,context)
	{
		return [ {
			newFilter: aa_create_search_words_text_filter() 
		}];
	}
});

//AA EndModule
//AA BeginModule
ajaxart.gcs.datefilter =
{
	ExpressionToFromTo: function (profile,data,context)
	{
		if (! ajaxart.isxml(data)) return [];
		var exp = data[0].getAttribute('Expression') || "";
		var vals = exp.split('-');
		if (vals.length != 2) return [];
		data[0].setAttribute('From',vals[0]);
		data[0].setAttribute('To',vals[1]);
	}
}
//AA EndModule
//AA BeginModule
ajaxart.gcs.validation =
{
	ContainsText: function (profile,data,context) 
	{
	  var text = aa_totext(data);
	  if (text == "") return [];
	  var lookFor = aa_text(data,profile,'Text',context);
	  return aa_frombool( text.indexOf(lookFor) == -1 );
	},
	MatchesRegularExpression: function (profile,data,context) 
	{
		var text = aa_totext(data);
  	    if (text == "") return [];
		
		var lookFor = aa_text(data,profile,'Expression',context);
		return aa_frombool( ! aa_text_matchesRegex(text,lookFor) );
	},
	Unique: function (profile,data,context)
	{
		var text = aa_totext(data); 
		if (text == "") return [];
		var options = ajaxart.run(data,profile,'OtherValues',context);
		for(var i=0;i<options.length;i++) {
			if (text == aa_totext([options[i]]) && options[i] != data[0]) return ["true"]; 
		}
	},
	PassingValidations: function (profile,data,context) 
	{
		var ctrl = aa_first(data,profile,'TopControl',context);
		return aa_frombool( aa_passing_validations(ctrl) );
	},
	ShowValidationError: function (profile,data,context) 
	{
		var ctrl = aa_first(data,profile,'TopControl',context);
		var error = aa_multilang_text(data,profile,'Error',context);
		aa_validation_showerror(ctrl,error,null,context);
		return [];
	}
}
//AA EndModule

aa_gcs("notification_box", {
	NotificationBox: function (profile,data,context) 
	{
	  var field = context.vars._Field[0];
	  field.Control = function(data1,ctx) {
		  var out = aa_renderStyleObject(aa_first(data,profile,'Style',context),{
			  notification_id: aa_text(data,profile,'ID',context),
			  setStatusClass: function(status) {
			    var classes = this.className.split(' ');
			    var found = false;
			    for(var i=0;i<classes.length;i++) {
			    	if (classes[i].indexOf('aanotif_status_') == 0) {
			    		classes[i] = 'aanotif_status_' + status;
			    		found = true;
			    	}
			    }
			    if (!found) classes.push('aanotif_status_' + status);
			    this.className = classes.join(' ');
		  	  }
		  },context);
		  jQuery(out).addClass('aa_notification_box_'+out.notification_id);
		  return [out];
	  }
	},
	ShowNotification: function (profile,data,context)
	{
		var top = aa_intest ? aa_intest_topControl : document;
		var id = aa_text(data,profile,'NotificationBox',context);
		var notificationBoxes = jQuery(top).find('.aa_notification_box_'+id);
		for (var i=0;i<notificationBoxes.length;i++) {
			var evt = { text: aa_text(data,profile,'Text',context) , status: aa_text(data,profile,'Status',context)}
			notificationBoxes[i].trigger('notification',evt);
		}
	}
});

//AA BeginModule
ajaxart.gcs.transition =
{
	RightSlide: function (profile,data,context)
	{
	  var obj = { isObject:true }
	  obj.replace = function(oldElem,newElem)
	  {
		  aa_left_right_slide(oldElem,newElem,'RightSlide',aa_int(data,profile,'Duration',context),aa_text(data,profile,'Background',context), aa_bool(data,profile,"CoverLeftMargin",context));
	  }
	  return [obj];
	},
	LeftSlide: function (profile,data,context) 
	{
	  var obj = { isObject:true }
	  obj.replace = function(oldElem,newElem)
	  {
		  aa_left_right_slide(oldElem,newElem,'LeftSlide',aa_int(data,profile,'Duration',context),aa_text(data,profile,'Background',context));
	  }
	  return [obj];
	}
};
function aa_left_right_slide(oldElem,newElem,type,duration,background,use_cover)
{
	  var old_parent_position = newElem.parentNode.style.position;
	  if (!old_parent_position) newElem.parentNode.style.position = 'relative';
	  var new_width = Math.max(oldElem.clientWidth,newElem.clientWidth);
	  var new_height = Math.max(oldElem.clientHeight,newElem.clientHeight);
	  var left_start = (type == 'LeftSlide') ? new_width : -new_width;
	  var width_start = (type == 'LeftSlide') ? 0 : new_width;
	  var new_zindex = (oldElem.style.zIndex) ? newElem.style.zIndex+1 : 1;
	  var background_css = ";background:" + background;
	  if (background == "") background_css = "";
	  var cover;
	  if (type == 'RightSlide' && use_cover) {
		  cover = document.createElement('div');
		  cover.style.cssText = "position:absolute; height: " + new_height + "px; top:0px; left: -"+ new_width + "px; width:" + new_width + "px;" + background_css + ";z-index:" + new_zindex+1;
		  newElem.parentNode.appendChild(cover);
	  }
	  var css = "#this.newpos { left: 0px; width: " + new_width + "px; } " + 
	  			"#this.newpos { -webkit-transition: width " + duration + "ms ease-out, left " + duration + "ms ease-out }" + 
	  			"#this { position:absolute; top:0px; overflow-x:hidden; width:" + width_start + "px; z-index:" + new_zindex + "; left: " + left_start + "px" +
	  			background_css + ";height:" + new_height + "px" +
	  			"} ";
	  var cls = aa_attach_global_css(css);
	  jQuery(newElem).addClass(cls);
	  setTimeout(function() { jQuery(newElem).addClass('newpos'); });
	  
	  setTimeout(function() {
		  if (!newElem || !newElem.parentNode) return;
		  newElem.parentNode.style.position = old_parent_position;
		  jQuery(newElem).removeClass(cls).removeClass('newpos');
		  if (cover) newElem.parentNode.removeChild(cover);
		  aa_remove(oldElem,true);
	  },duration);
}
//AA EndModule
function aa_showblock(block,data,context) 
{
	var ctrl = block.Control(data,context);
	if (ctrl.length == 0) return null;
	
	if (block.ModifyControl)
		for(var i=0;i<block.ModifyControl.length;i++)
			block.ModifyControl[i](ctrl[0],[],'control',context,[]);
	
	return ctrl[0];
}
function ajaxart_fieldaspect_getField(context) {
  var field = context.vars['_Field'];
  if (field == null || field.length == 0) return null;
  return field[0];
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
		
		if (field.IsHidden) continue;
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

function ajaxart_field_is_readOnly(cntr,field,context)
{
	if (field.Writable) return false;
	if (field.ReadOnly == true) return true;
	if (ajaxart_object_run_boolean_method(field,'ReadOnly',[],context)) return true;
	if (!cntr) return false;
	if (cntr.Items == null) return true;
	if (cntr.Items[0].ReadOnly == true) return true;
	if (cntr.ReadOnly) return true;
	return ( cntr.Items[0].ReadOnly != null && ajaxart.tobool_array(cntr.Items[0].ReadOnly) );
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

function ajaxart_field_RefreshDependentFields(field,srcElement,context)
{
	if (!field|| !field.DependentFields) return;
	
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
		if (field.RefreshScope == 'sibling') { 
			aa_refresh_sibling_field(srcElement,fieldID,context);
		} else {
			var ctrls = parent.find(".fld_" + fieldID);
			for(var i=0;i<ctrls.length;i++)
				aa_refresh_cell(ctrls[i],context);
		}
	}
}
function aa_build_th(cntr,field,ctx)
{
	var th = jQuery('<th class="fieldtitle th_' + field.Id + '"><span class="aa_field_menu">&nbsp;</span><span class="fieldtitle_title"/><span class="fieldtitle_sort">&nbsp;</span></th>');
	th[0].Field = field;
	th.find('>.fieldtitle_title').text(field.Title);
	var width = ajaxart_getUiPref(cntr.ID[0],field.Id+'_ColumnWidth',ctx) || ajaxart.totext_array(field.Width);
	if (width != null)
	  jQuery(th).width(width);

	if (field.AddInfoIcon) 
		field.AddInfoIcon(th.get(),ctx);
	var field_menu_elem = jQuery(th).find('>.aa_field_menu')[0];
	if (field_menu_elem && cntr.EnableFieldMenu)
	{
		field_menu_elem.onmousedown = function(e) 
		{ 
	    	var newContext = aa_ctx( ctx, {
	    			MousePos: [ { isObject: true, pageX: e.pageX || e.clientX, pageY: e.pageY || e.clientY} ]
	    	});
	    	if (th.OpenFieldMenu)
	    		th.OpenFieldMenu(newContext);
			return aa_stop_prop(e);
		}
	}
	return th[0];
}

function ajaxart_field_fix_th(cntr,th,field,ctx)
{
	var width = ajaxart_getUiPref(cntr.ID[0],field.Id+'_ColumnWidth',ctx) || ajaxart.totext_array(field.Width);
	if (width != null)
	  jQuery(th).width(width);
}

function ajaxart_subfield_bypath(field,path) {
	if (path == "") return field;
	if (field.Fields == null) return null;
	var path1 = path,rest = "";
	if (path.indexOf('/') > -1) { 
		path1 = path.substring(0,path.indexOf('/')-1); 
		rest = path.substring(path.indexOf('/')+1);
	}
	for(var i=0;i<field.Fields.length;i++) {
		var subfield = field.Fields[i];
		if (subfield.Path != null) {
			if (subfield.Path == path1) return ajaxart_subfield_bypath(subfield,rest);
		} else {  // no path. maybe virtual group
			var result = ajaxart_subfield_bypath(subfield,path);
			if (result != null) return result;
		}
	}
	return null;
}
function aa_field_handler(field,event,handler,id,phase)
{
	aa_register_handler(field,event,handler,id,phase);
}

function aa_invoke_field_handlers(eventFuncs,input,e,field,field_data,extra)
{
	if (aa_incapture) return;
	if (eventFuncs)
		for(var i=0;i<eventFuncs.length;i++)
			eventFuncs[i](field,field_data,input,e,extra);
}

function ajaxart_fields_aftersave(item,data,originalData,fields,context)
{
  if (fields == null) return;
  for(var i=0;i<fields.length;i++) {
	  var field = fields[i];
	  var data1 = data; odata1 = originalData;
	  var path = field.Path;
	  if (path == null) path = "";
	  
	  if (path != "" && data1.length >0) data1 = ajaxart.xml.xpath(data1[0],path);
	  if (path != "" && odata1.length >0) odata1 = ajaxart.xml.xpath(odata1[0],path);
	  
	  if (field.Fields != null) {
		  ajaxart_fields_aftersave(item,data,originalData,field.Fields,context);
	  }
	  if (field.AfterSave) {
		  var newContext = aa_ctx(context,{OriginalValue: odata1, Item: item});
		  ajaxart_runMethod(data1,field,'AfterSave',newContext);
	  }
  }
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

function aa_fieldTitle(field ,item_data, context,ignoreHideTitle)
{
	if (field.HideTitle && !ignoreHideTitle) return ''; 
	if (field.DynamicTitle) return field.DynamicTitle(item_data,context);
	return field.Title;
}

function aa_wrapWithSection(ctrl,field,sectionStyle,item_data,ctx)
{
	var jElem = jQuery(sectionStyle.Html);
	var title = aa_fieldTitle(field ,item_data, ctx,true);
	var section = aa_api_object(jElem,{Title: title ,Image: field.SectionImage});
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

function aa_refresh_sibling_field(srcElement,fieldID,context)
{
	var parent = srcElement.parentNode;
	if (!parent || parent.tagName == 'body') return;
	var ctrls = jQuery(parent).find('.fld_'+fieldID);
	if (ctrls.length > 0) {
		aa_refresh_cell(ctrls[0],context);
	} else {
		aa_refresh_sibling_field(parent,fieldID,context);
	}
}

function aa_replace_transition(params,context)
{	/* params must have: transition, elOriginal, elNew 
	   optional: onTransitionEnd, removeOriginal, onBeforeTransitionBegin
	*/
	aa_defaults(params, {
		$elOriginal: 	jQuery(params.elOriginal),
		$elNew: 		jQuery(params.elNew),
		css: 			params.transition.Css,
		onTransitionEnd:function() {},
		removeOriginal: function(original) { aa_remove(params.elOriginal); },
		onBeforeTransitionBegin: function() {}
	});
	aa_apply_style_js(params,params.transition,context,'animate');
}

function aa_fade_transition(transition, duration) {
	  function onTransitionEnd() {
	    transition.$elOriginal.css( { opacity: 1 } );
	    transition.$elOriginal.removeClass('aa_original');
	    transition.removeOriginal(transition.elOriginal);
	    transition.$elNew.removeClass('aa_new');
	    transition.$elOriginal.parent().removeClass(cssClass);
	    transition.onTransitionEnd();
	  }
	  transition.$elOriginal.addClass('aa_original');
	  transition.$elNew.addClass('aa_new');
	  transition.elOriginal.parentNode.appendChild(transition.elNew);
	  aa_element_attached(transition.elNew);
	  var cssClass = aa_attach_global_css(transition.css);
	  transition.$elOriginal.parent().addClass(cssClass);
	  transition.$elNew.css({opacity:0});
	  transition.onBeforeTransitionBegin();
	  transition.$elOriginal.animate({ opacity:0 },duration, "swing");
	  transition.$elNew.animate({ opacity:1 },duration, "swing", onTransitionEnd);
}

function aa_alert(message) {
	if (jQuery("#aa_immediate_log").length == 0) {
		var log = jQuery('<div id="aa_immediate_log" style="position:absolute; top:0px; background:white; z-index:3000"></div>');
		log[0].Counter = 0;
		jQuery("body").append(log);	
		jQuery('<span class="close">close</span>').click(function() { jQuery("#aa_immediate_log").remove() }).appendTo(log);
	}
	var counter = jQuery("#aa_immediate_log")[0].Counter++;
	jQuery("#aa_immediate_log").prepend("#" + counter + ": " + message + "<br/>");
}


aa_gcs("field_aspect", {	
	CellPresentation: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
		field.CellPresentation = aa_text(data,profile,'Content',context);
		
		return [];
	},
	DisplayUnits: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		var cssClass = aa_cssClass(data,profile,'Css',context,'units');
		var location = aa_first(data,profile,'Location',context);
		var unit = aa_text(data,profile,'Unit',context);
		
		jBart.bind(field,'ModifyControl',function(args) {
			var content = args.Wrapper.firstChild || args.Wrapper; 
			aa_renderStyleObject(location,{fieldContent: content, unitString: unit },context,true);
			/*
			var unitDiv = jQuery('<div/>').text(unit).addClass(cssClass).addClass(location == 'right' ? 'unit_right' : 'unit_left'); 
			var input = jQuery(args.Wrapper).find('input')[0];
			if (input) {
			  if (location == 'right') jQuery(input).after(unitDiv);
			  if (location == 'left') jQuery(input).before(unitDiv);
			}*/
		},'DisplayUnits');
	},
	ClearValueButton: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.ClearValueStyle = aa_first(data,profile,'Style',context);
		
		function refresh(wrapper,field_data) {
			var apiObject = {
				ClearValue: function(e) {
				  var input = jQuery(wrapper).find('input')[0];
				  if (input) {
					  input.value = '';
					  field.ManualWriteValue = false; // Yaniv: I do not understand this line...
					  if (input.updateValue) input.updateValue();
					  if (input.Refresh) input.Refresh();
					  refresh(wrapper,field_data);
				  } else {
					  ajaxart.writevalue(field_data,'');
					  aa_refresh_cell(wrapper,context);
				  }
				  aa_stop_prop(e);
				  return false;
				},
				FieldControlWrapper: wrapper,
				IsValueEmpty: aa_totext(field_data) == "",
				Title: aa_multilang_text(data,profile,'Title',context)
			}
			var clearBtn = aa_renderStyleObject(field.ClearValueStyle,apiObject,context);
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
	QuickExpandPaneByDrag: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		var location = aa_text(data,profile,'Location',context);
		var direction = (location == 'left' || location == 'right') ? 'left-right' : 'top-bottom';  
		var baseSize = aa_text(data,profile,'BaseSize',context);
		
		jBart.bind(field,'ModifyControl',function(args) {
			var property = direction == 'left-right' ? 'width' : 'height'; 
			
			aa_dragAndDropPane({ element: args.Wrapper.firstChild, location: location, baseSize: baseSize });
		});
	},
	Control: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
 	    ajaxart_addControlMethod(field,'WritableControl',data,profile,'Control',context);
},
	GlobalCss: function (profile,data,context)
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
	CssOnCondition: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		var css = aa_text(data,profile,'Css',context);
		var cls = aa_attach_global_css(css,null,field.Id,true);
		var conditionOnItem = aa_text(data,profile,'ConditionInput',context) == 'item';
		var cssClass = aa_text(data,profile,'CssClass',context);
		if (cssClass) cls += ' ' + cssClass;
		
		aa_field_handler(field,'ModifyCell',function(cell,field_data,cell_presentation,ctx,item)
		{
			var content = cell.firstChild || cell;

			if (aa_paramExists(profile,'OnCondition')) {
				var condData = conditionOnItem ? item : field_data;
				if (! aa_bool(condData,profile,'OnCondition',context)) {
					jQuery(content).removeClass(cls);
					jQuery(cell).removeClass(cls+'_wrapper');
					return;
				}
			}
			jQuery(content).addClass(cls);
			jQuery(cell).addClass(cls+'_wrapper');
		},null,200);	
	},
	DynamicCss: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		aa_field_handler(field,'ModifyCell',function(cell,field_data,cell_presentation,ctx,item)
				{
			if (aa_paramExists(profile,'OnCondition') && ! aa_bool(field_data,profile,'OnCondition',context)) return;

			var css = aa_text(field_data,profile,'Css',context);
			var cls = aa_attach_global_css(css,null,field.Id,true);
			
			jQuery(cell).addClass(cls+'_wrapper');
			var content = cell.firstChild || cell;
			jQuery(content).addClass(cls);
				},null,200);	
	},
	Css: function (profile,data,context)
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
	DescriptionForEmptyText: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.DescriptionForEmptyText = ajaxart.totext_array(ajaxart_multilang_run(data,profile,'Description',context));
		field.DescriptionForEmptyTextCss = aa_text(data,profile,'Css',context);
		field.EmptyTextCssClass = aa_attach_global_css(field.DescriptionForEmptyTextCss ,null,'empty_text_description');

		if (field.HandleDescriptionForEmptyText) {
			return field.HandleDescriptionForEmptyText(field.DescriptionForEmptyText);
		}
		
		if (!field.DescriptionForEmptyText) return; // removing DescriptionForEmptyText

		aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx,item)
		{
//			if (ajaxart_field_is_readOnly(ctx.vars._Cntr && ctx.vars._Cntr[0],cell.Field,ctx)) return;
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
	FieldData: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
		ajaxart_addMethod(field,'FieldData',profile,'FieldData',context);
		return [];
	},
	MobileScroll: function(profile,data,context)
	{
		if (!window.iScroll && !window.aa_loading_iscroll) {  // for design time only. the runtime should include iscroll.js statically
			window.aa_loading_iscroll = true;
			jQuery.getScript('lib/iscroll.js',function() {aa_loading_iscroll=false;} );
		}
			
		var field = context.vars._Field[0];
		aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx) {
			cell.style.overflow = 'auto'; 

			aa_addOnAttach(cell,function() {
				var paramsToEval = "var params = " + aa_text(data,profile,'ScrollParams',context) + ';';
				eval(paramsToEval);
				var element = cell;
				if (aa_text(data,profile,'OnElement',context) == 'content') {
					element = cell.firstChild;
					if (!element) return;
				}
				
				ajaxart.run(data,profile,'Height',aa_ctx(context,{ControlElement: [element]}));  // set the height
				ajaxart.run(data,profile,'Width',aa_ctx(context,{ControlElement: [element]})); // set the width
				
				if (window.iScroll && aa_bool(data,profile,'EnableScroll',context)) {
				  cell.IScroll = new iScroll(element,params);
				  setTimeout(function() {cell.IScroll.refresh()},200);
				}
			});
		});
	},
	HoverCssClass: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx) {
			cell.onmouseover = function() { jQuery(cell).addClass('aa_hover'); }
			cell.onmouseout = function() { jQuery(cell).removeClass('aa_hover'); }
		});
		return [];
	},
	ImageReadOnlyImp: function (profile,data,context)
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
		if (field.ReadOnly)
			field.Control = field.ReadOnlyControl;
		
		if (field.KeepImageProportions)
			field.CellPresentation = 'control';
		
		return [];
	},
	ModifyControl: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
			var input = jQuery(cell).find('.field_control') || cell.firstChild;
			ajaxart.run(item,profile,'Action',aa_merge_ctx(context,ctx,{ Cell: [cell], FieldData: field_data, Input: input.get() }));
		});
		return [];
	},
	OnUpdate: function (profile,data,context)
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
		
		if (aa_bool(data,profile,'FireOnUpdateWhenLoaded',context)) {
			jBart.bind(field,'ModifyControl',function(args) {
				aa_invoke_field_handlers(field.OnUpdate,args.Wrapper,null,field,args.FieldData);
			});
		}
		return [];
	},
	PopupImage: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		var id = aa_text(data,profile,'ID',context);
		if (id == '') id = null;
		field.PupupImageCss = aa_attach_global_css( aa_text(data,profile,'Css',context) , null, 'popupimage' );
		
		aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx) {
			if (ajaxart_field_is_readOnly(ctx.vars._Cntr && ctx.vars._Cntr[0],cell.Field,ctx)) return;

			var input = aa_find_field_input(cell);
			if (!input) return;
			var img = document.createElement("span");
			img.className = 'aa_field_image image_fld_' + field.Id + ' '+ field.PupupImageCss;
			img.innerHTML = '&nbsp;';
			//var css = 'background-image:url(' + aa_text(data,profile,'Image',context) + ')';
			//img.style.cssText = css;
			jQuery(img).insertAfter(input);
			img.onmousedown = function(e)
			{
				if (input && input.TogglePopup && !jQuery(input).hasClass('aa_disabled') ) 
					input.TogglePopup();
			}
			img.onmousemove= function(e) 
			{ 
				var input = aa_find_field_input(cell);
				if (input && input.DetectResize) input.DetectResize(e); 
			};
		},id);

		return [];
	},
	Resizer: function (profile,data,context)
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
					var mousepos = aa_mousePos(e);
	
					var new_size = mousepos.x - aa_absLeft(input);
					if (jQuery(input).parents('.right2left').length > 0)
						new_size = aa_absLeft(input) + input.offsetWidth - mousepos.x;
					
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
					var mousepos = aa_mousePos(e);
					
					var in_resize_place = aa_absLeft(input) + input.offsetWidth - mousepos.x < 3;
					if (jQuery(input).parents('.right2left').length > 0)
						in_resize_place = mousepos.x - aa_absLeft(input) < 3;
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
	DefineAction: function (profile,data,context) {
		var field = context.vars._Field[0];
		field.Actions = field.Actions || {};
		var actionName = aa_text(data,profile,'ActionName',context);

		field.Actions[actionName] = function(field_data,ctx) {
			ajaxart.run(field_data,profile,'Action',aa_merge_ctx(context,ctx));
		}
	},
	SimpleInput: function (profile,data,context)
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
	Toolbar: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		var cssClass = aa_attach_global_css(aa_text(data,profile,'Css',context),null,'field_toolbar');
		ajaxart_addMethod(field,'Operations',profile,'Operations',context);
		field.RefreshToolbar = function(field,cell,field_data,ctx) {
			jQuery(cell).addClass(cssClass);
			if (ctx.vars._Cntr && ajaxart_field_is_readOnly(ctx.vars._Cntr[0],field,ctx)) return;

			var toolbar = jQuery('<span class="aa_field_toolbar" />')[0];
			var minWidth = aa_text(data,profile,'MinWidth',context);
			if (minWidth != '') 
			  jQuery(toolbar).css('min-width',minWidth).css('display','inline-block');
			
			var ops = ajaxart_runMethod(field_data,field,'Operations',ctx);
			for(var i=0;i<ops.length;i++)
			{
				var op = ops[i];
				var img = document.createElement("span");
				aa_defineElemProperties(img,'Action,Operation');
				//img.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;";
				img.Operation = op;
				var opCssClass = ajaxart.totext_array(ajaxart_runMethod(field_data,op,'CssClass',ctx));
				img.className = 'aa_field_toolbar_image ' + opCssClass;
				img.title = ajaxart.totext_array(ajaxart_runMethod(field_data,op,'Title',ctx));
				var image = aa_totext(ajaxart_runMethod(field_data,op,'Icon',ctx));
				if (image != "")
					img.style.background = "url("+image+") no-repeat";
				
			    toolbar.appendChild(img);
				
				img.Action = img.onmousedown = function(e)
				{
					var img = (typeof(event)== 'undefined')? e.target : event.srcElement;					
					var op = img.Operation;
					var input = jQuery(cell).find('.field_control')[0];
					if (op != null)
						ajaxart_runMethod(field_data,op,'Action',aa_ctx(ctx,{ _Field: [field], _FieldData: field_data, ControlElement: [input], _Input: [input], _OperationElement: [img]}));
				}
			};
			var oldToolbar = jQuery(cell).find('>.aa_field_toolbar')[0];
			aa_remove(oldToolbar,true);
			if (jQuery(cell).find('>.aa_option_page').length>0)
			  jQuery(toolbar).insertBefore( jQuery(cell).find('>.aa_option_page') );
			else
			  cell.appendChild(toolbar);
		}
		aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx) {
			field.RefreshToolbar(field,cell,field_data,ctx);
		});
		if (aa_bool(data,profile,'RefreshOnUpdate',context)) 
		{
			aa_field_handler(field,'OnUpdate',function(field,field_data,input){
				// recreate the toolbar
				var cell = input.parentNode;
				field.RefreshToolbar(field,cell,field_data,context);
			});
		}
	},
	WritableControl: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
		aa_setMethod(field,'WritableControl',profile,'Control',context);
		
		return [];
	},
	LimitTextLength: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];
		var maxLength = aa_int(data,profile,'MaxLength',context);
		if (maxLength <=0) return;
		var cuttingMark = aa_text(data,profile,'CuttingMark',context);
		var fullTextAsTooltip = aa_bool(data,profile,'FullTextAsTooltip',context);
		var text_func = function(field_data,ctx) {
			var text = ajaxart.totext_array(this.OriginalText(field_data, ctx));
			if (text.length > maxLength)
				return [ text.substring(0,maxLength - cuttingMark.length) + cuttingMark ];
			else
				return [ text ];
		};
		if (field.Text == null)
			field.Text = function(field_data,ctx) { return field_data; }
		field.OriginalText = field.Text;
		field.Text = text_func;
		if (fullTextAsTooltip) {
			aa_field_handler(field,'ModifyCell',function(cell,field_data,cell_presentation,ctx) {
				var original_text = ajaxart.totext_array( field.OriginalText(field_data,ctx) );
				if (original_text.length > maxLength)
					cell.setAttribute("title", original_text);
			});
		}
		return [];
	},
	OnKeyUp: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		aa_field_handler(field,'OnKeyup',function(field,field_data,input,e,extra)
		{
			var newContext = aa_ctx(context,{ _Field: [field], _FieldData: field_data
				, _Input: [input], ControlElement: [input] } );
			if (jQuery(input).parents('.aa_container').length > 0)
				newContext.vars._Cntr = [ jQuery(input).parents('.aa_container')[0].Cntr ];
			if (extra && extra.KeyCode)
				newContext.vars.KeyCode = extra.KeyCode;
			if (extra && extra.CtrlKey)
				newContext.vars.CtrlKey = extra.CtrlKey;
			
			ajaxart.run(field_data,profile,'Action',newContext);
		});
		return [];
	},
	OnClick: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		var func = function(cell,field_data,cell_presentation,ctx) {
			var input = jQuery(cell).find('.field_control')[0];
			var click = function(e) {
				if (window.aa_incapture) return;
				ajaxart.run(field_data,profile,'Action',aa_ctx(ctx,{_Field: [field], _FieldData: field_data, ControlElement: [this] } ));
			}
			if (input)
				input.onclick = click;
			else
				cell.onclick = click;
		}
		aa_field_handler(field,'ModifyCell',func);
		return [];
	},
	OnHover: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
			cell.onmouseover = function() {
				if (!cell.isInside)
					ajaxart.run(field_data,profile,'Action',ctx);
				cell.isInside = true;
			};
			cell.onmouseout = function() { cell.isInside = false; };
		},'OnHover');
		return [];
	},
	CleanGlobalCss: function (profile,data,context) {
		return [aa_clean_global_css(aa_text(data,profile,'Css',context))];
	},
	AdaptCssForBrowser: function (profile,data,context) {
		var css = aa_text(data,profile,'Css',context);
		var forAllBrowsers = aa_bool(data,profile,'GenerateCssForAllBrowsers',context)
		return [aa_adapt_css_for_browser(css, forAllBrowsers)];
	},
	IsCssWellFormed: function (profile,data,context) {
		var css = aa_text(data,profile,'Css',context);
		if (aa_is_css_well_formed(css)) 	return ["true"];
		else								return [];
	},
	Animation: function (profile, data, context) {
		var field = ajaxart_fieldaspect_getField(context);
		var type = aa_first(data,profile,'Type',context);
		if (!type) return [];
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
			var elem = cell.firstChild; // scrolling is done on 'content', and can use parentNode for the cell
			if (!elem) return;
			type.animate(elem, function() {
				ajaxart.run(data,profile,'OnDone',context);
			});
		});
		return [];		
	},
	DynamicSize: function (profile, data, context) {
		var field = ajaxart_fieldaspect_getField(context);
		var width = aa_first(data,profile,'Width',context);
		var height = aa_first(data,profile,'Height',context);
		aa_field_handler(field,'ModifyControl', function(cell,field_data,cell_presentation,ctx,item) {
			var elem = cell.firstChild;
			if (!elem) return;
			if (width) width.apply(elem);
			if (height) height.apply(elem);
		});
	}
});


function aa_runFieldAction(object,actionName,moreParams)
{
	/* aa_runFieldAction runs an action of a field defined in field_aspect.DefineAction.
	   object is an api object (e.g. button)
	   moreParams defines variables to be available in the action. e.g. { Location: 'left' }
	*/
	actinName = actionName || 'action';
	moreParams = moreParams || {};
	var field = object.field || object.Field;
	var fieldData = object.FieldData;
	if (!fieldData && object.data) fieldData = [object.data];
	fieldData = fieldData || [];
	var ctx = object.context || object.Context;

	if (!field || !ctx) return;
	if (!field.Actions || !field.Actions[actionName]) {
		return ajaxart.log('calling a non existing field Action ' + actionName,'error');
	}
	var vars = { };
	for(var i in moreParams) {		
		if (!moreParams.hasOwnProperty(i)) continue;
		var val = moreParams[i];
		if (!ajaxart.isArray(val)) val = [val];
		vars[i] = val;
	}
	field.Actions[actionName](fieldData,aa_ctx(ctx,vars));
}









aa_gcs("action", {
	WriteValue: function (profile,data,context)
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
	WriteValueWithoutAutoSave: function (profile,data,context)
	{
		var to = ajaxart.run(data,profile,'To',context);
		var value = ajaxart.run(data,profile,'Value',context);
		ajaxart.writevalue(to,value,true);
	},
	RunActionOnItems: function (profile,data,context)
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
	RunActions : function (profile,data,context)
	{
	    var actionProfs = ajaxart.subprofiles(profile,'Action');
	  	var result = [];
	  	
	  	for(i in actionProfs)
	  		result = ajaxart.run(data,actionProfs[i],"",context);
	  	
		return ["true"];
	},
	SetWindowTitle: function (profile,data,context) {
		document.title = aa_text(data,profile,'Title',context);
	}
});

aa_gcs("bart_url", {
	NewUrlFragment: function (profile,data,context)
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

aa_gcs("ui", {
	CustomCss: function (profile,data,context) {
		var style = aa_first(data,profile,'Style',context);
		style.Css = aa_text(data,profile,'Css',context);
		return [style];
	},
	CustomStyleByField: function (profile,data,context)
	{
	  return [{
		  Field: function(data1,ctx) { 
		  	return aa_first(data1,profile,'Field',aa_merge_ctx(context,ctx));
	  	  }
	  }];
	}
});

aa_gcs("jbart_jsloader", {
    LoadJavascriptFile: function (profile,data,ctx)
    {
		return [{
			Load:function(data1,context) {
		    	if (! ajaxart.jbart_studio && aa_bool(data,profile,'LoadInDesignTimeOnly',context)) return;
		    	var url = aa_text(data,profile,'Url',context);
		    	jBart.vars.loaded_scripts = jBart.vars.loaded_scripts || {};
		    	if ( jBart.vars.loaded_scripts[url] ) return; // already loaded
	
			    ajaxart_async_Mark(context);
			    jBart.vars.loaded_scripts[url] = true;
			    
		    	ajaxart_RunAsync(data,ajaxart.fieldscript(profile,'EnsureLoaded'),aa_ctx(context,{JsFileUrl: [url]}),function() {
		    		ajaxart_async_CallBack(data,context);
		    	});
			}
		}]
    },
    LoadCssFiles: function (profile,data,ctx)
    {
		return [{
			Load: function(data1,context) {
		    	if (! ajaxart.jbart_studio && aa_bool(data,profile,'LoadInDesignTimeOnly',context)) return;
		    	ajaxart.runNativeHelper(data,profile,'Load',ctx);
			}
		}]
    },
    LoadFilesForPalletes: function (profile,data,context)
    {
		return [{
			Load: function(data1,ctx) {
		    	if (! ajaxart.jbart_studio && aa_bool(data,profile,'LoadInDesignTimeOnly',ctx)) return;
		    	ajaxart.runNativeHelper(data,profile,'Load',aa_merge_ctx(context,ctx));
			}
		}]
    },
    AutoUsingJQuery: function (profile,data,context)
    {
	    ajaxart_async_Mark(context);
	    jQuery.ajax({ url: aa_totext(context.vars.JsFileUrl), dataType: 'script',
	    	success: function() {
	    		ajaxart_async_CallBack(data,context);
	    	},
	    	error: function() {
	    		ajaxart_async_CallBack(data,context);
	    	}
	    });
    },
    PollingOfJsExpression: function (profile,data,context)
    {
	    var jsExpressionFunc = aa_get_func(aa_text(data,profile,'Expression',context));
	    var pollingTime = aa_int(data,profile,'PollingTime',context);

	    if (jsExpressionFunc()) return; // no need to load anything
	    
	    ajaxart_async_Mark(context);
	    var scriptElement = document.createElement('script');
	    scriptElement.setAttribute('src',aa_totext(context.vars.JsFileUrl));
	    document.body.appendChild(scriptElement);
	    
	    ajaxart_async_Mark(context);

	    function checkIfLoaded() {
	    	if (jsExpressionFunc()) {
	    		ajaxart_async_CallBack(data,context);
	    	} else {
	    		setTimeout(checkIfLoaded,pollingTime);
	    	}
	    }
	    checkIfLoaded();
    },
    CallbackFunction: function (profile,data,context)
    {
    	alert('EnsureLoaded of CallbackFunction is not implemented yet');
    }
});
aa_gcs("bart", {
    PageByID: function (profile,data,context)
    {
    	//var pages = (context.vars.jBartPages || context.vars._BartContext)[0];
		if (!context.vars._BartContext) return [];
    	var pages = context.vars._BartContext[0].Pages;
    	if (!pages) return [];
    	var pageID = aa_text(data,profile,'PageID',context);
		var page = ajaxart_object_byid(pages,pageID);
		if (page) return [page];
		return ajaxart.runNativeHelper(data,profile,'NewPage',context);
		return [];
    },
    HtmlPageTitle: function (profile,data,context)
    {
    	return [{
    		Load: function(data1,ctx) {
    			document.title = aa_text(data,profile,'Title',aa_merge_ctx(context,ctx));
    		}
    	}];
    },
    Javascript: function (profile,data,context1)
    {
    	return [{
   		 Load: function(data1,context) {
	    	if (aa_tobool(context.vars.JBart_OnlyShowPage)) return;
	    	
	    	var js = profile.getAttribute('ScriptOnLoad');
	    	if (!js || js == '') return;
			try {
		    	var func = aa_get_func(js,true);
		    	func(context);
			} catch (e) { 
				ajaxart.log("JavaScript: " + e.message, "error"); 
			}
    	}
    	}];
//    	var elem=document.createElement("script");
//    	elem.setAttribute("type", "text/javascript");
//    	elem.innerHTML = js;
//		document.getElementsByTagName("head")[0].appendChild(elem);
    },
    Page: function (profile,data,context) 
    {
	  var obj = { isObject: true };
	  obj.ID = ajaxart.run(data,profile,'ID',context);
	  obj.ResourceIDs = ajaxart.run(data,profile,'ResourceIDs',context);
	  obj.ResourceID = ajaxart.run(data,profile,'ResourceID',context);
	  obj.Type = ajaxart.run(data,profile,'Type',context);
	  var init = function(page) { 
	    page.Control = function(data1,ctx) {
	      var ctx2 = aa_merge_ctx(context,ctx);
	      ajaxart.runNativeHelper(data,profile,'OverrideUiPrefs',ctx2);
	      var out = [];
	      ajaxart.trycatch( function()  {
		    out = ajaxart.run(data1,profile,'Control',aa_ctx(ctx2, {PageID: page.ID}));
	      }, function (e) {	// catch
	    	  out = jQuery('<div>error showing page</div>').get();
	      });
		  return out;
	    }
	  }
	  init(obj);
	  return [obj];
    }
});

aa_gcs("jbart_resource", {
	Data: function (profile,data,context)   // gc of jbart_reource.Data
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
				obj.CacheIn.Save(data,aa_ctx(context,{ DataResource: [obj]}))
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
				aa_runMethodAsyncQuery(obj,obj.DataSource.Retrieve,data,aa_merge_ctx(context,ctx),function(result,ctx2){
					obj.DataLoaded = true;
					obj.LoadFromValue(result[0]);
					ajaxart_async_CallBack(data1,ctx);
				});
			}
		}

		return [obj];
	},
	CacheInCookies: function (profile,data,context)
	{
		return [{
			GetValue: function(data1,ctx) {
				var resource = ctx.vars.DataResource[0];
				var out = ajaxart.cookies.valueFromCookie(resource.FullID);
				return out ? [out] : [];
			},
			Save: function(data1,ctx) {
				var resource = ctx.vars.DataResource[0];
				if (resource.Items[0]) {
				  ajaxart.cookies.writeCookie(resource.FullID,ajaxart.xml2text(resource.Items[0]));
				}
			}
		}];
	},
	CacheInLocalStorage: function (profile,data,context)
	{
		return [{
			GetValue: function(data1,ctx) {
				var resource = ctx.vars.DataResource[0];
				var out = window.localStorage[resource.FullID];
				return out ? [out] : [];
			},
			Save: function(data1,ctx) {
				var resource = ctx.vars.DataResource[0];
				if (resource.Items[0]) {
					window.localStorage[resource.FullID] = ajaxart.xml2text(resource.Items[0]);
				}
			}
		}];
	}
});
aa_gcs("bart_resource", {
	ResourcesToGlobalVars: function (profile,data,context)
	{
		if (! context.vars._GlobalVars) return;
		var globals = context.vars._GlobalVars[0];
		var bc = context.vars._BartContext[0];
		var resources = bc.Resources;
		for(var i=0;i<resources.length;i++) {
			var init = function(globals,resource) {
				var id = aa_totext(resource.ID);
				globals[id] = function() { return resource.Items; }
			}
			init(globals,resources[i]);
		}
	},
	Value: function (profile,data,context)
	{
		var obj = { isObject:true , Type: "value" }
		obj.Id = aa_text(data,profile,'ResourceID',context);
		obj.ID = [obj.Id];
		obj.FullID = jBart.utils.getWidgetIDFromContext(context) + '_' + obj.Id;		
		obj.Items = ajaxart.run(data,profile,'Value',context);
		
		return [obj];
	},
	Xml: function (profile,data,context)
	{
		var obj = { isObject:true , Type: "query" }
		obj.Id = aa_text(data,profile,'ResourceID',context);
		obj.ID = [obj.Id];
		obj.Mode = aa_text(data,profile,'Mode',context);
		obj.Storage = aa_text(data,profile,'Storage',context);
		obj.FullID = jBart.utils.getWidgetIDFromContext(context) + '_' + obj.Id;
		obj.AutoSaveSampleData = aa_bool(data,profile,'AutoSaveSampleData',context); // for the usage of the dt
		
		var nameOfGlobalVar = 'jBartWidget_' + ajaxart.totext(context.vars.WidgetId) + '_' + obj.Id; 
		if ( window[nameOfGlobalVar] )
			obj.Xml = window[nameOfGlobalVar][0] || ajaxart.parsexml('<xml/>');
		else if (obj.Storage == '' || obj.Storage == 'in memory')
		  obj.Xml = aa_first(data,profile,'Xml',context);
		else {
			var textval = '';
			if (obj.Storage == 'cookie') 
			  textval = ajaxart.cookies.valueFromCookie(obj.FullID);
			if (obj.Storage == 'local storage' && window.localStorage) 
				textval = window.localStorage[obj.FullID];
			
			if (textval == null || textval == '') 
				obj.Xml = aa_first(data,profile,'Xml',context);
			else
				obj.Xml = ajaxart.parsexml(textval);
			
			if (!obj.Xml) obj.Xml = ajaxart.parsexml('<xml/>');
			function init(obj) {
				obj.XmlChanged = function() {
					if (obj.Saving) return;
					obj.Saving = true;
					setTimeout(obj.SaveXml,200);
				}
				obj.SaveXml = function() {
					if (obj.Storage == 'cookie')
					  ajaxart.cookies.writeCookie(obj.FullID,ajaxart.xml2text(obj.Xml));
					if (obj.Storage == 'local storage' && window.localStorage) {
						window.localStorage[obj.FullID] = ajaxart.xml2text(obj.Xml);
					}
					obj.Saving = false;
				}
				ajaxart_xml_onchange(obj.Xml,obj.XmlChanged,context);
			}
			init(obj);
		}
		if (!obj.Xml) return [obj];
		obj.Items = ( obj.Mode == 'single' ? [obj.Xml] : aa_xpath(obj.Xml,'*') ); 
		
		obj.DataSource = aa_first(data,profile,'DataSource',context);
		if (obj.DataSource) {
			var info = aa_getXmlInfo(obj.Xml,context,false);
			info.Save = function(data2,ctx) {
				obj.DataSource.Save([obj.Xml],aa_ctx(context,ctx));
			}
			obj.Load = function(data1,ctx) {
				if (this.DataLoaded) return;
				ajaxart_async_Mark(ctx);
				aa_runMethodAsyncQuery(obj,obj.DataSource.Retrieve,data,aa_ctx(context,ctx),function(result,ctx2){
					obj.DataLoaded = true;
					if (result.length > 0) ajaxart.xml.copyElementContents(obj.Xml,result[0]);
					ajaxart_async_CallBack(data1,ctx);
				});
			}
		}
		return [obj];
	},
	Javascript: function (profile,data,context)
	{
		try {
	    	var func = aa_get_func(profile.getAttribute('Code'));
	    	var out = func(context);
	    	return [out];
		} catch (e) { 
			ajaxart.log("JavaScript: " + e.message, "error"); 
		}
	}
});


aa_gcs("data_items", {
	Items: function (profile,data,context)
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
	},
	AddXmlItem: function (profile,data,context)
	{
		var dataitems = context.vars._Items[0];
		var parent = aa_first(data,profile,'Parent',context);
		dataitems.SubsetForNewItem = function(data1,ctx) {
			var newXml = ajaxart.parsexml( aa_text(data,profile,'NewItem',context) ,'', '', false,parent);
			if (!newXml) return;
			var innerItems = { isObject: true, Items: [newXml]};
			if (parent && newXml && parent.appendChild) {
				parent.appendChild(newXml);
			}
			innerItems.Cancel = function() {
				parent.removeChild(newXml);
			}
			return [innerItems];
		}
	}
});
aa_gcs("operation", {
	ContainerOperations: function (profile,data,context)
	{
		return [{ isObject: true, addOperations: function()
		{
		var menu = context.vars._Menu[0];
		var cntr = context.vars._Cntr[0];
		var items = ajaxart.runScriptParam(data,cntr.Operations,cntr.Context);
		var target = aa_text(data,profile,'Target',context);
		if (target == '') 
			target = 'all';
		for(var i=0;i<items.length;i++)
		{
			var op = items[i];
			var elem = context.vars._ElemsOfOperation && context.vars._ElemsOfOperation[0];
			var item_cntr = elem ? jQuery(elem).parents('.aa_container')[0].Cntr : null;
			if (!op.Target || op.Target[0] == 'item' && elem 
						&& (item_cntr == cntr || menu.IncludeOperationsFromParent ))
				menu.Items.push(op);
			else if (op.Target && op.Target[0] == 'new' && (target == 'new' || target == 'all'))
				menu.Items.push(op);
			else if (op.Target && op.Target[0] == 'items' && target == 'all')
				menu.Items.push(op);
		}
		
		return [];
		}}];
	},
	Menu: function (profile,data,context)
	{
		var menu = { isObject : true,  Items : [], IncludeOperationsFromParent: true };
		var cntr = context.vars._Cntr[0];
		menu.Presentation = function(data1, ctx) { return aa_run_component("ui.ButtonAsHyperlink",data1,ctx); };
		ajaxart_addMethod(menu,'Style',profile,'Style',context);
		var newContext = aa_ctx(context,{_Menu: [menu], _ElemsOfOperation: cntr.ElemsOfOperation() , _ItemsOfOperation: cntr.ItemsOfOperation() } );
		menu.Items = ajaxart.run(data,profile,'Operations',context);
		var aspects = ajaxart.runsubprofiles(data,profile,'MenuAspect',newContext);
		for(var i=0;i<aspects.length;i++)
			if (aspects[i].addOperations) aspects[i].addOperations();
		
		menu.Ctrl = ajaxart.runNativeHelper(data,profile,'Control',newContext);

		return [menu]; //.Ctrl;
	},
	ClickOnButton: function(profile, data, context) {
	  	var field_id = aa_text(data,profile,'Button',context);
	  	if (!field_id) return;
		var top = aa_intest ? aa_intest_topControl : document;
	  	var btn = jQuery(top).find('.fld_'+field_id)[0];
	  	if (!btn) return;
	  	if (btn.jbApiObject && btn.jbApiObject.action) btn.jbApiObject.action();
	},
	Operation: function (profile,data,context)
	{
		var titleFunc = function(op)  { return function(data1,ctx)
		{
			if (ctx.vars._Cntr) {
				var cntr = ctx.vars._Cntr[0];
				if (op.Shortcut != '' && cntr.ShortcutsEnabled != null && cntr.ShortcutsEnabled[0] == 'true' )
					return [ajaxart_multilang_text(aa_text(data1,profile,'Title',ctx),ctx) 
						+ ' ('+ aa_text(data1,profile,'Shortcut',ctx) +')'];
				return ajaxart_multilang_run(data1,profile,'Title',ctx);
			} else {
				return ajaxart_multilang_run(data1,profile,'Title',ctx);
			}
		}}
		var actionFunc = function(op)  { return function(data1,ctx)
		{
			if (aa_incapture) return;
			var cntr = ctx.vars._Cntr[0];

			var dataitems = cntr.Items[0] , child_dataitems = [];
			if (ctx.vars._ElemsOfOperation && ctx.vars._ElemsOfOperation.length > 0) {
				var top = jQuery(ctx.vars._ElemsOfOperation[0]).parents('.aa_treenode,.aa_list')[0];
				if (jQuery(top).hasClass('aa_treenode'))
					dataitems = top._Items;
				var childUls = jQuery(ctx.vars._ElemsOfOperation[0]).find('>.aa_treenode');
				for(var i=0;i<childUls.length;i++)
					child_dataitems.push(childUls[i]._Items);
			}
			var newContext = aa_ctx(ctx,{_Items: [dataitems] , ChildDataItems: child_dataitems });
			var items = data1;
			if (op.Target && op.Target[0] == 'items')
			{
				var elems  = ajaxart_container_elems(cntr);
				items = [];
				for(var i=0;i<elems.length;i++)
					ajaxart.concat(items,elems[i].ItemData);
				newContext = aa_ctx(ctx,{_ElemsOfOperation: elems, _ItemsOfOperation: items} );
			}
			
			return ajaxart.run(items,profile,'Action',newContext);
		}}
		var op = { isObject : true, isOperation : true };
		op.Id = aa_text(data,profile,'ID',context);
		op.ID = [ op.Id ];
		op.Shortcut = aa_text(data,profile,'Shortcut',context);
		op.Target = ajaxart.run(data,profile,'Target',context);

		aa_setMethod(op,'Icon',profile,'Icon',context);
		aa_setMethod(op,'CssClass',profile,'CssClass',context);
		aa_setMethod(op,'CleanTitle',profile,'Title',context);
		op.Disabled = function(data1,ctx) { return aa_bool(data1,profile,'Disabled',aa_merge_ctx(context,ctx)) };
		ajaxart_addScriptParam_js(op,'Title',titleFunc(op),context);
		ajaxart_addScriptParam_js(op,'Action',actionFunc(op),context);

		var newContext = aa_ctx(context,{_Operation: [op]} );
		ajaxart.runsubprofiles(data,profile,'Aspect',newContext);
		
		op.Context = newContext;

		if ( aa_bool(data,profile,'WritableOnly',context) && context.vars._Cntr && context.vars._Cntr[0].ReadOnly ) return [];
		
	    return [op];
	},
	OperationFromCntr: function (profile,data,context)
	{
		var cntr = context.vars._Cntr[0];
		var id = aa_text(data,profile,'ID',context);
		var ops = ajaxart.runScriptParam(data,cntr.Operations,cntr.Context);
		for(var i=0;i<ops.length;i++)
			if (ops[i].Id == id)
				return [ops[i]];
		return [];
	},
	Operations: function (profile,data,context)
	{
		return ajaxart.runsubprofiles(data,profile,'Operation',context);
	},
	RemoveDisabled: function (profile,data,context)
	{
		return [{ isObject: true, addOperations: function()
		{
		var menu = context.vars._Menu[0];
		var cntr = context.vars._Cntr[0];
		var result = [];
		for(var i=0;i<menu.Items.length;i++)
		{
			op = menu.Items[i];
			var disabled = op.Disabled(context.vars._ItemsOfOperation,context); 
			if (! disabled)
				result.push(op);
		}
		menu.Items = result;
		return [];
		}}];
	}
});

aa_gcs("text",{
});

aa_gcs("xml",{
	AttributeName: function(profile,data,context)
	{
		if (ajaxart.isxml(data) && data[0].nodeType == 2) 
			return [ data[0].nodeName ];
		return [];
	},
	AddChildren: function(profile, data, context) {
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
	Attributes: function(profile,data,context)
	{
		var alsoEmpty = aa_bool(data,profile,'AlsoEmpty',context);
		
		if (ajaxart.isxml(data) && data[0].nodeType == 1)
		{
			var out = [];
			var atts = data[0].attributes;
			if (atts != null)
				for (var i = 0; i < atts.length; i++) {
					if (alsoEmpty) out.push(atts.item(i));
					else if (atts.item(i).nodeValue != "") out.push(atts.item(i));
				}
			
			return out;
		}
		return [];
	},
	Duplicate : function(profile, data, context) {
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
	Parent: function(profile, data, context) {
		if (! ajaxart.isxml(data)) return [];
		if (data[0].nodeType == 1 && data[0].parentNode != null) 
			return [ data[0].parentNode ];
		return [];
	},
	SetAttribute: function(profile, data, context) 
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
	},
	Tag: function(profile, data, context) {
		var removeNamespace = aa_bool(data,profile, 'RemoveNamespace', context);
		if ( !ajaxart.isxml(data) ) return [];
		
		var xml = data[0];
		if (xml.nodeType == 2 ) {// attribute
			if (xml.parentNode == null) return [];
			xml = ajaxart.xml.xpath(xml,'..')[0];
		}
		
		var tag = aa_tag(xml);
		if ( removeNamespace )
			return [tag.replace(/.*:/,"")];
		else
			return [tag];
		
		return [];
	},
	WithChanges: function(profile, data, context) {
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
	Wrap: function(profile, data, context) {
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
	Xml: function(profile, data, context) {
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
	XmlItems: function (profile,data,context)
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
	}
});

aa_gcs("xtml", {
	  UseAndTranslateParam: function (profile,data,context)
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
		  
		  if (paramScript.script.nodeType == 2) // attribute, we can translate it
			  return ajaxart_multilang_run(input,paramScript.script,'',newContext);
		  
		  if (paramScript.compiled == null)
			  return ajaxart.run(input,paramScript.script,"",newContext);
		  else  
			  return paramScript.compiled(input,newContext);
	  },
	  ComponentDefinition: function (profile,data,context)
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
	  ComponentsOfType: function (profile,data,context)
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
	  Params: function (profile,data,context)
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
	  RunXtml: function (profile,data,context)
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
	  UseParam: function (profile,data,context)
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
	  UseParamArray: function (profile,data,context)
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
	  UseParamArrayAsync: function (profile,data,context)
	  {
		  var param = aa_text(data,profile,'Param',context); 
		  var paramScript = context.params[param];
		  if (ajaxart.isArray(paramScript)) // script='false'
			  return paramScript;
		  
		  var actionProfs = ajaxart.subprofiles(paramScript.script,paramScript.field);
		  if (actionProfs.length == 0) return;
		  
		  var newContext = {};
		  newContext.vars = context.vars;
		  newContext.params = context.componentContext.params;
		  newContext.componentContext = context.componentContext.componentContext;
		  
		  var cbObj = ajaxart_async_GetCallbackObj(newContext);
	      cbObj.marked = true;
		  cbObj.index = 0;
		  cbObj.actionProfs = actionProfs;
			
		  var callBack = function(data1,context1) {
			var cbObj = ajaxart_async_GetCallbackObj(newContext);
			if (cbObj.index >= cbObj.actionProfs.length) {
				ajaxart_async_CallBack(data,newContext); return;
			}
			var actionProf = cbObj.actionProfs[cbObj.index];
			cbObj.index++;
			ajaxart_RunAsync(data,actionProf,newContext,cbObj.seqCallBack);
		  }
		  cbObj.seqCallBack = callBack;
		  callBack(data,newContext);
	  }
});

aa_gcs("yesno", {
	  Expression: function (profile,data,context)
	  {
		return ajaxart.run(data,profile,'Expression',context,'',true);
	  },
	  IsEmpty: function (profile,data,context)
	  {
		  var val = ajaxart.run(data,profile,'Value',context);
		  var checkInner = aa_bool(data,profile,'CheckInnerText',context);
		  return ajaxart.yesno.is_empty(val,checkInner);
	  },
	  PassesFilter: function (profile,data,context)
	  {
	  	return ajaxart.make_array(data,function(item) {
	  		if (! aa_bool(item,profile,'Filter',context))
	  			return null;
			return item;
	  	});
	  },
	  ItemsEqual: function (profile,data,context)
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
	  Not: function (profile,data,context)
	  {
		  var result = aa_bool(data,profile,'Of',context);
		  if (result == false)
			  return ["true"];
		  else
			  return [];
	  },
	  OR: function (profile,data,context)
	  {
	    var subprofiles = ajaxart.subprofiles(profile,'Item');
	    
		for(var i=0;i<subprofiles.length;i++)
		{
	  		if ( aa_bool(data,subprofiles[i],"",context) )
	  			return ["true"];
	  	};
	  	return [];
	  },  
	  And: function (profile,data,context)
	  {
	    var subprofiles = ajaxart.subprofiles(profile,'Item');
	    
		for(var i=0;i<subprofiles.length;i++)
		{
	  		if ( ! aa_bool(data,subprofiles[i],"",context) )
	  			return [];
	  	};
	  	return ["true"];
	  },
	  Empty: function (profile,data,context)
	  {
	  	return ajaxart.yesno.is_empty(data,aa_bool(data,profile,'CheckInnerText',context));
	  },	
	  NotEmpty: function (profile,data,context)
	  {
		  var value = ajaxart.run(data,profile,'Value',context);
		  var check = aa_bool(data,profile,'CheckInnerText',context);
		  var result = ajaxart.yesno.is_empty(value,check);
		  if (result == true || result[0] == 'true') return [];
		  return ['true'];
	  }	
});

aa_gcs("data_items", {
	InnerDataItems: function (profile,data,context)
	{
		var dataitems = context.vars._Items[0];
		dataitems.Parent = aa_first(data,profile,'ParentDataItems',context);
		if (dataitems.Parent == dataitems) { dataitems.Parent = null; return []; }
		var init = function(dataitems) {
			dataitems.SaveParent = function(data1,ctx) {
				if (dataitems.Parent.SaveParent)
				  return dataitems.Parent.SaveParent(data1,ctx);
				else if (dataitems.Parent.Save)
					return dataitems.Parent.Save(data1,ctx);
			}
		}
		init(dataitems);
	}
});

aa_gcs("field", {
	XmlMultipleGroup: function (profile,data,context)
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
	}
});

aa_gcs("operation", {
	RunOperationAction: function (profile,data,context)
	{
		if (!context.vars.ControlElement || !aa_bool(data,profile,'GuessDataFromControl',context)) return ajaxart.run(data,profile,'Action',context);
		var elem = context.vars.ControlElement[0];
		var itemElem = jQuery(elem).parents('.aa_item').get();
		if (itemElem.length > 0) {
			itemElem = [itemElem[0]];
			return ajaxart.run(itemElem[0].ItemData || [],profile,'Action',aa_ctx(context,{_ElemsOfOperation: itemElem, _ItemsOfOperation: itemElem[0].ItemData}));
		}
		return ajaxart.run(data,profile,'Action',context);
	}
});

aa_gcs("ui_async", {
	  Control: function (profile,data,context)
	  {
		var out = document.createElement('div');
		var loadingControl = aa_first(data,profile,'ControlForLoading',context);
		if ( loadingControl != null ) { out.appendChild(loadingControl); jQuery(out).addClass('aa_loading'); }
		
		var ShowControl1 = function(out) { return function(data1,context1) {
			var ShowControl2 = function(data2,ctx2) {
				var control = aa_first(data1,profile,'Control',context);
				aa_empty(out);
				jQuery(out).removeClass('aa_loading');
				if (control != null) {
					out.appendChild(control);
					aa_element_attached(control);
					aa_fixTopDialogPosition();
				}
				aa_fire_async_finished();
			}
			
			ajaxart_RunAsync(data1,ajaxart.fieldscript(profile,'AsyncAction'),context,ShowControl2); 
		} };
		var async_data = ajaxart.fieldscript(profile,'AsyncData');
		if (async_data)
			aa_RunAsyncQuery(data,async_data,context,ShowControl1(out));
		else
			ShowControl1(out)(data,context);
		//ajaxart_RunAsync(data,async_data,context,ShowControl1(out));
		
		return [out];
	  }
});

aa_gcs("action_async", {
	RunActions: function(profile, data, context)
	{
		return ajaxart.gcs.action_async.SequentialRun(profile,data,context);
	},
	SequentialRun: function(profile, data, context)
	{
		aa_async_XtmlSequentialRun(data,profile,'Action',context);
	}
});
aa_gcs("ui", {
	IfThenElse: function (profile,data,params)
	{
		  return aa_ifThenElse(profile,data,params);
	},
	NotInCaptureMode: function (profile,data,context)
	{
		if (window.aa_incapture) return [];
		return ["true"];
	},
	ButtonAsHyperlink: function (profile,data,context)
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
	}
});

aa_gcs("uiaction", {
DoFind: function (profile,data,context)
{
	  var filter_elems = ajaxart.run(data,profile,'FilterElements',context);
	  var cntr = context.vars._Cntr[0];
	  if (cntr == null) return [];
	  cntr.DoFind(ajaxart.totext_array(data),filter_elems);
	  return ["true"];
}
});

aa_gcs("date", {
	DateEntry: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		field.ManualWriteValue = true;
		aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx) {
			if (ajaxart_field_is_readOnly(ctx.vars._Cntr[0],cell.Field,ctx)) return;
			var input = aa_find_field_input(cell);
			if (input)
			{
				input.Refresh = function(data1,ctx2)
				{
					input.value = ajaxart.totext_array(field_data).split(' ')[0];
					input.setAttribute('value',input.value);
				}
				input.SetDate = function(data1,ctx2)
				{
					var dataAndTime = ajaxart.totext_array(field_data).split(' ');
					var time = dataAndTime[1] ? ' ' + dataAndTime[1] : '';
					ajaxart.writevalue(field_data, ajaxart.totext_array(data1) + time);
					this.Refresh(data1,ctx2);
					aa_invoke_field_handlers(field.OnUpdate,input,null,field,field_data);
				}
				
				input.Refresh([],ctx);
				jQuery(input).dateEntry({dateFormat: 'dmy/', spinnerImage: '' });
			}
		});
		aa_field_handler(field,'OnKeyup',function(field,field_data,input,e) {
			var dataAndTime = ajaxart.totext_array(field_data).split(' ');
			var time = dataAndTime[1] ? ' ' + dataAndTime[1] : '';
			ajaxart.writevalue(field_data,'' + input.value + time);
			aa_invoke_field_handlers(field.OnUpdate,input,e,field,field_data);
		},'DateEntry');

		return [];
	}
});

aa_gcs("jbart_api", {
	ShowWidget: function(profile,data,context)
	{
		var controlToShowFunc = null; // for auto-tests
		if (aa_paramExists(profile,'ControlToShowInBartContext')) {
			controlToShowFunc = function(data1,ctx) {
				return aa_first(data1,profile,'ControlToShowInBartContext',aa_merge_ctx(context,ctx));
			}
		}
		
		var out = aa_show_jbart_widget({
			WidgetXml: aa_first(data,profile,'WidgetXml',context),
			Language: aa_text(data,profile,'_Language',context),
			Page: aa_text(data,profile,'Page',context),
			Context: context,
			RunAfter: function(data,ctx) { 
				ajaxart.run(data,profile,'RunAfter',aa_merge_ctx(context,ctx));		
			},
			ControlToShowInBartContext: controlToShowFunc
		});
		return [out];
	}
});

/* jBart js api is a set of functions to be used by javascript inside the widget/application

jBart api objects
-----------------
* Buttons, lists, tab controls etc. create api objects and pass them to the relevant js functions.
  E.g. when creating a button style one needs the implement function(button) { ... }, where 'button' is a button object
* As a convension, an api object will have the following properties:
  - jElem, for its html element (in jQuery object)
  - cntr, for jBart container object
  - sometimes text, title, image (jbart image object), Action 

Methods for api objects
-----------------------
* Most method will get as first parameter classOrElement, which indicates on which html element to function.
* It could be:
*   A string indicating a css class (e.g. '.button_text') in which case we will find the first occurence of this class under the top element
*   An empty string, which means the top element
*   An html element
* 
*  All objects
*  ----------------------
*  setInnerHTML(classOrElement,text)
*    Sets the innerHTML of a given element
*    Example (in button style): button.setInnerHTML('.aa_button_text',button.text); 
*
*  setImageSource(classOrElement,imageObject)
*    Adds an image under the relevant element (a div or span)
*    An image object contains the image url as well as its width and height and other properties 
*    Example (in button style): button.setImageSource('.aa_button_img',button.image); 
* 
*  setOnClick(classOrElement,callback_func,jbart_click_behavior)
*    Sets onclick to the element to run callback_func
*    if jbart_click_behavior is true, we use the jbart click mechanism
*    jbart click mechanism puts a class of 'pressed' for mouse down, and 'pressing' when the mouse is inside of the element. when the mouse is up, the event is fired
*    Example (in button style): button.setOnClick('.aa_button_clickable',button.Action);
*   
*  Group object
*  -----------------
*  addFields(classOrElement,init_field_func)
*    Duplicates the element for each one of the group fields. The function init_field_func is called for each field to initialize it
*    
*    Example usage (in group style):
*    group.addFields('.field',function(field) {
*        field.setInnerHTML('.field_title',field.Title? field.Title+':' : ''); 
*        field.setControl('.field_contents'); 
*    });
*    
*  Field In Group object 
*  ---------------------
*  setControl(classOrElement) - puts the field control under the element
*    Example usage (in group style):
*    field.setControl('.field_contents'); 
* 
*  Tab Control object
*  -----------------
*  addTabs(classOrElementForTab,classOrElementForTabContents,init_tab_func)
*    Duplicates the element for each one of the tabs.
*    classOrElementForTabContents represents a placeholder for the tab contents.
*    The function init_tab_func is called for each tab to initialize it
*    
*    Example usage:
*    tabcontrol.addTabs('.tab','.tab_contents',function(tab) {
*        tab.setInnerHTML('.tab_title',tab.Title); 
*        tab.setImageSource('.tab_image',tab.Image);
*        tab.setOnClick('',tab.Select); 
*    });
*    
*  ItemList object
*  ---------------
*  setItems(classOrElement,init_item_func)
*    Duplicates the element for each one of the items in the list. The function init_item_func is called for each item object to initialize it
*  
*  Example:
*  itemlist.setItemsOld('.item',function(item) {
*   item.setInnerHTML('.itemtext',item.name);
*   item.SetImageSource('.itemimg',item.image);
*   item.setFields('.more_fields');
*  });
*  
*  Item (in itemlist) object
*  -------------------------
*  setFields(classOrElement) - put the fields of the container under the given element
*  Example: item.setFields('.more_fields');
*  
*/

// General purpose functions

/* jBart.exec runs a jBart action component
 * It gets the action name (to be seen under xtml components), the data for the action and a jbart context object 
 *   
 * example usage (in foursquare4Ipad app):
 * jBart.exec('SelectCurrentVenueInList','',context);
 */
jBart.exec = function (action_name,data,context)
{
	var profile = ajaxart.parsexml('<xtml t="sample.'+action_name+'" />');
	ajaxart.run([],profile,[data],context);
};
/* jBart.get evaluates a jbart expression
 * It gets the jbart expression, its data, a context object and result type (text/array/xml) 
 * Note that the expression will contain %. To put % in jbart js you need to write \%, otherwise it will be evaluated before compiling  
 * 
 * example usage (in foursquare4Ipad app):
 * var selected = jBart.get('%$FSState/@item%','',context,'text');
 */
jBart.get = function(expression,data,context,result_type)
{
	data = data || '';
	if (!result_type) result_type = 'text';
	context = context || ajaxart.newContext();
	var value = ajaxart.dynamicText([data],expression,context,null,false);
	if (result_type == 'text') return aa_totext(value);
	if (result_type == 'array')	return value;
	if (result_type == 'xml' || result_type == 'native') return value[0];
	
	return value[0];
};
/* jBart.set( is used to write a value using a jbart expression (usually to a resource)
 * It gets a jbart expression for the 'to' , the value to set and a context object
 * 'data' is the input for the 'to expression'. E.g. it can be used to set values inside an item
 *  
 * Note that the expression will contain %. To put % in jbart js you need to write \%, otherwise it will be evaluated before compiling  
 * 
 * example usage (in foursquare4Ipad app):
 * jBart.set('\%$FSState/@lat\%',position.coords.latitude,'',context);
 */
jBart.set = function(to_as_expression,value,data,context)
{
	context = context || ajaxart.newContext();
	var to = ajaxart.dynamicText([data],to_as_expression,context,null,false);
	ajaxart.writevalue(to,[value]);
};

/* jBart.refresh refreshes a field
 * It gets the field_id , a context object and scope (screen/document)
 *  
 * example usage (in foursquare4Ipad app):
 * jBart.refresh('state',context);
 */
jBart.refresh = function(field_id,context,scope)
{
	if (!scope) scope = 'screen';
	aa_refresh_field([field_id],scope,false,null,context);
};

/* jBart.api.asyncMark is used for async actions.
 * To indicate the action is async, call jBart.api.asyncMark and call jBart.api.asyncCallback when done   
 */
jBart.api.asyncMark = function(context)
{
	ajaxart_async_Mark(context);
};

/* jBart.api.asyncCallback is used for async actions.
 * To indicate an async action is done, call jBart.api.asyncCallback 
 */
jBart.api.asyncCallback = function(data,context)
{
	ajaxart_async_CallBack(data,context);
};

/* jBart.api.setResourceValue is used to programmatically change the value of a resource.
 * Note, it replaces the resource with resourceValue, which means you probably needs to refresh anyone using the resource
 * This function is usually called in a javascript application feature 
 */
jBart.api.setResourceValue = function(resourceName,resourceValue,context)
{
	if (! context.vars._GlobalVars) return;
	var bc = context.vars._BartContext[0];
	var globals = context.vars._GlobalVars[0];
	globals[resourceName] = function() { return [resourceValue] }

	var newResources = [];
	for(var i=0;i<bc.Resources.length;i++) {
		var resource = bc.Resources[i];
		if (aa_totext(resource.ID) == resourceName) 
			newResources.push( { isObject:true, Items: [resourceValue] } );
		else
			newResources.push(resource);
	}
	bc.Resources = newResources;
};
aa_gcs("uiaspect",{
	ItemClass: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var initializeElements = function(initData,ctx)
		{
			var elems = ctx.vars._Elems;
			for(var i=0;i<elems.length;i++)
			{
				var elem = elems[i];
				var cls = aa_text(elem.ItemData,profile,'Class',context).replace(/\s/,'_');
				if (cls != '')
					elem.className += " " + cls;
			}
		}
		ajaxart_addScriptParam_js(aspect,'InitializeElements',initializeElements,context);
		return [aspect];
	},
	PopupOnHover: function (profile,data,context)
	{
		var aspect = {isObject:true}
		aspect.InitializeElements = function(data1,ctx) {
			var cntr = ctx.vars._Cntr[0];
			var elems = ctx.vars._Elems;
			for(var i=0;i<elems.length;i++) {
				var elem = elems[i];
				elem.onmouseover = function() { 
					var cntr = ctx.vars._Cntr[0];
					var elem = this;
					var ctx2 = aa_merge_ctx(context,ctx,{ControlElement: [elem]});
					if (!aa_bool(elem.ItemData,profile,'NoPopupIf',ctx2))
						ajaxart.runNativeHelper(elem.ItemData,profile,'OpenPopup',ctx2);
					else
						ajaxart_dialog_close_all_popups();
				}
			}
		}

		return [aspect];
	},
	FastFindInHtmlTree: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var setSearchVal = function(elem)
		{
			elem.FFSearchVal = "";
			jQuery.each(jQuery(elem).find('>.aa_text,>span>.aa_text'), function(index, value) { 
				elem.FFSearchVal += value.innerHTML.toLowerCase();  // += ensures that the parent nodes will not be removed
			});
		}
		var postAction = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var elems_exp = cntr.Tree ? '.aa_item' : '>.aa_item';
			var elems = jQuery(ajaxart_find_aa_list(cntr)).find(elems_exp);
			for(var i=0;i<elems.length;i++)
				setSearchVal(elems[i]);
		}
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			cntr.RegisterForPostAction(ctx._This);
			var filterData = ajaxart_writabledata();

			cntr.FilterControl = ajaxart.runNativeHelper(filterData,profile,'Control',ctx);
			
			cntr.SelectByPattern = function(pattern)
			{
				var cntr = this;
				var elems_exp = cntr.Tree ? '.aa_item' : '>.aa_item';
				var elems = jQuery(ajaxart_find_aa_list(cntr)).find(elems_exp);
				var new_selected = elems.find('>.aa_text').filter(function() {
					return this.innerHTML.toLowerCase() == pattern;
				}).slice(0,1);
				if (pattern != '' && new_selected.length > 0 )
					ajaxart_uiaspects_select(new_selected.parents('.aa_item').slice(0,1),jQuery(),"keyboard",ctx);
			}
			cntr.DoFind = function(pattern)
			{
				pattern = pattern.toLowerCase();
				var cntr = this;
				if (cntr.SaveAndCloseInplace) cntr.SaveAndCloseInplace([],ctx);
				if (cntr.PartialView && cntr.PartialView.RemoveSummary)
					cntr.PartialView.RemoveSummary(cntr);
				
				var elems_exp = cntr.Tree ? '.aa_item' : '>.aa_item';
				
				if (!cntr.elems)
					cntr.elems = jQuery(ajaxart_find_aa_list(cntr)).find(elems_exp); 
				var elems = cntr.elems;
				var noOfMatches = 0;
				var inFirstItems = 100;
				var firstItem = true;
				for(var i=0;i<elems.length;i++)
				{
					var elem = elems[i];
					if (elem.FFSearchVal == null)
						setSearchVal(elem);
					elem.hidden = false;
					var itemOptionObj = elem.ItemData[0];
					var selectable = !itemOptionObj.UnSelectable;
					var match = selectable && (elem.FFSearchVal.indexOf(pattern) != -1 || pattern == '');
					if (! match)
						elem.hidden = true;
					if (match) {
						if (inFirstItems >0)// highlight first ten
						{
							inFirstItems--; 
							jQuery.each(jQuery(elem).find('>.aa_text,>span>.aa_text'), function(index, value) { 
								if (value.OrigText == null)
									value.OrigText = value.innerHTML;
								if (value.OrigText.toLowerCase().indexOf(pattern) != -1)
									value.innerHTML = ajaxart_field_highlight_text(value.OrigText,pattern);
								else
									value.innerHTML = value.OrigText;
							});
						}
						if (firstItem) { // soft select
							ajaxart_uiaspects_select(jQuery(elem),jQuery(),"keyboard",ctx);
							firstItem = false;
						}
						if (cntr.Tree)
							jQuery(elem).parents('.aa_item').each(function() { this.hidden = false; } ) // unhide parents in tree
						noOfMatches++;
					}
				}
			
				if (elems.length < aa_int(data,profile,'FilterTreshold',context) && aa_bool(data,profile,'DoNotFilterSmallLists',context)) 
					var minItems = elems.length;
				else
					var minItems = 0;
				var noOfUnmatchedToShow = minItems - noOfMatches;
				for(var i=0;i<elems.length;i++)
				{
					var elem = elems[i];
					if (noOfUnmatchedToShow > 0 && elem.hidden)
					{
						elem.hidden = false;
						noOfUnmatchedToShow--;
					}
				    if (elem.hidden)
				    {
				    	elem.style.display = 'none';
					  	elem.display = 'none';
				    }
				    else
				    {
				    	elem.style.display = '';
				    	elem.display = '';
				    }
				}

				// soft select 
				aa_invoke_cntr_handlers(cntr,cntr.ContainerChange,[],ctx);
			}
		}

		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		ajaxart_addScriptParam_js(aspect,'PostAction',postAction,context);
		var result = [aspect];
		if (!aa_bool(data,profile,'HideExposedFilters',context))
			result = result.concat(ajaxart.gcs.uiaspect.ExposedFiltersSection(profile,data,context));
		else
			context.vars._Cntr[0].HideFastFind = true;

		return result;
	 },
	FastFind: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var filterData = ajaxart_writabledata();

			cntr.FilterControl = ajaxart.runNativeHelper(filterData,profile,'Control',ctx);
			cntr.MaxItemsInSearch = aa_int(data,profile,'MaxItemsToShow',context);
			
			cntr.DoFind = function(pattern,showAll)
			{
				pattern = pattern.toLowerCase();
				var pp = pattern.split(' ');
				var p1 = (pp.length > 0 && ' ' + pp[0].toLowerCase());
				var p2=  (pp.length > 1 && pp[1] && ' ' + pp[1].toLowerCase());
				var p3=  (pp.length > 2 && pp[2] && ' ' + pp[2].toLowerCase());
				var _p1 = pp.length == 1 && pp[0].toLowerCase();	// for searching half text (only with one word)
				if (showAll && showAll.length == 0) showAll = null;
				cntr = this;
				if (aa_bool(data,profile,'DoNotLookInAllFields',context))
					var ItemText = function(data1,ctx2) { 
						return [aa_text(data1,profile,'LookIn',context)]; 
					}
				else
					var ItemText = aa_concat_atts;// for compression: aa_concat_atts()
				cntr.DataHolder = cntr.DataHolder || aa_createDataHolderFromCntr(cntr,context);
				if (! cntr.FFInitialized)
				{
					for(var i in cntr.DataHolder.Wrappers)
					{
						var wrapper = cntr.DataHolder.Wrappers[i];
						wrapper.__Search = ' ' + ajaxart.totext_array(ItemText([wrapper.__item || wrapper],ctx)).toLowerCase().replace(/^\s*|\s*$/g, ' ');
					}
					cntr.FFInitialized = true;
				}

				var shownItems = 0,filteredItems = 0;
			    var all_elems = [];
			    var top = ajaxart_find_aa_list(cntr);
			    aa_clear_cntr_items(top,cntr);
			    cntr.FilteredWrappers = [];

			    var firstItem = true;
				function addFound(wrapper)
				{
					filteredItems++;
					shownItems++;
			    	var li = cntr.createNewElement([wrapper.__item || wrapper],all_elems,ctx);
			    	if (li) {
			    		top.appendChild(li);
						if (firstItem) { // soft select
							ajaxart_uiaspects_select(jQuery(li),jQuery(),"keyboard",ctx);
							firstItem = false;
						}
			    	}
					cntr.FilteredWrappers.push(wrapper);
				}
				var candidates = [];
				var worst_rank = 100;
				// look at text beginning
				for(var i in cntr.DataHolder.Wrappers)
				{
					var wrapper = cntr.DataHolder.Wrappers[i];
					var s = wrapper.__Search;
					// two words 
					  // add 1 - first word not covered
					  // add 1 - for sequence
					  // add 1 - not in order
					  // add 4 - word is not there
					var match = (p1 && s.indexOf(p1) != -1) || (p2 && s.indexOf(p2) != -1) || (p3 && s.indexOf(p3) != -1) || pattern == '' || (_p1 && s.indexOf(_p1) != -1);
					if (!match) continue;
					wrapper.__rank = 0;
					if (s.indexOf(p1) > 1) wrapper.__rank++;
					if (s.indexOf(p1) == -1) wrapper.__rank += 2;
					if (p2 && s.indexOf(p2) < s.indexOf(p1)) wrapper.__rank++;
					if (p2 && s.indexOf(pattern) == -1) wrapper.__rank++;
					if (p2 && s.indexOf(p1) == -1) wrapper.__rank+= 4;
					if (p2 && s.indexOf(p2) == -1) wrapper.__rank+= 4;
					if (p3 && s.indexOf(p3) == -1) wrapper.__rank+= 4;
					if (showAll || candidates.length < 20)
					{
						candidates.push(wrapper);
						if (wrapper.__rank < worst_rank) worst_rank = wrapper.__rank;
					}
					else
					{
						if (wrapper.__rank < candidates[19].__rank) candidates[19] = wrapper;
						candidates.sort(function(w1,w2){ return w1.__rank > w2.__rank; });
						worst_rank = candidates[19].__rank;
					}
				}
				candidates.sort(function(w1,w2) { 
					if (w1.__rank != w2.__rank)
						return w1.__rank - w2.__rank;
					else	// keep original index
						return w1.__OriginalIndex - w2.__OriginalIndex;
				});
				for(var i in candidates)
					if (showAll || shownItems < cntr.MaxItemsInSearch || cntr.MaxItemsInSearch == 0)
						addFound(candidates[i]);

				var newcontext = aa_ctx(cntr.Context,{_Elems: all_elems } );
			    for(var i=0;i<cntr.Aspects.length;i++) {
			    	ajaxart.trycatch( function() {
			    		ajaxart_runMethod(data,cntr.Aspects[i],'InitializeElements',newcontext);
			    	}, function(e) { ajaxart.logException(e); });
			    }

			    for(var i=0;i<cntr.PostActors.length;i++) {
			    	ajaxart.trycatch( function() {
				    	  ajaxart.runScriptParam(data,cntr.PostActors[i].aspect.PostAction,newcontext);
			    	}, function(e) { ajaxart.logException(e); });
			    }
			    if (p1) p1 = p1.substring(1); if (p2) p2 = p2.substring(1); if (p3) p3 = p3.substring(1);// remove space prefix
				jQuery.each(jQuery(top).find('.aa_text'), function() { 
					if (p1 && this.innerHTML.toLowerCase().indexOf(p1) != -1)
						this.innerHTML = ajaxart_field_highlight_text(this.innerHTML,p1);
					if (p2 && this.innerHTML.toLowerCase().indexOf(p2) != -1)
						this.innerHTML = ajaxart_field_highlight_text(this.innerHTML,p2);
					if (p3 && this.innerHTML.toLowerCase().indexOf(p3) != -1)
						this.innerHTML = ajaxart_field_highlight_text(this.innerHTML,p3);
				});

				if (cntr.PartialView && cntr.PartialView.RemoveSummary)
					cntr.PartialView.RemoveSummary(cntr);
				if (!aa_bool(data,profile,'DoNotShowPartialStatus',context))
					aa_add_partial_suffix(cntr,shownItems,filteredItems,ctx);
				if (cntr.PartialView) 
					cntr.PartialView.ShowAll = function() {
						cntr.DoFind(pattern,true);
					} 
				
				// soft select 
				aa_invoke_cntr_handlers(cntr,cntr.ContainerChange,[],ctx);
			}
		}

		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		
		var cntr = context.vars._Cntr[0];  // TODO: move to InitializeContainer
		var result = [aspect];
		if (!aa_bool(data,profile,'HideExposedFilters',context))
			result = result.concat(ajaxart.gcs.uiaspect.ExposedFiltersSection(profile,data,context));
		else
			cntr.HideFastFind = true;
		
		return result;
	 },
	 OccurrencesFollowup:function (profile,data,context)
	 {
 		ajaxart_addMethod(context.vars._Cntr[0],'OccurrencesFollowup',profile,'OccurrencesFollowup',context);
	 },
	  ExposedFiltersSection: function (profile,data,context)
	  {
		var aspect = { isObject : true };

		var initializeContainer = function(data1,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
		    var filters = [];
		    var fieldIds = aa_text(data,profile, 'FieldIds', ctx).split(',');
	    	for(var i in fieldIds) 
		    {
		    	var field = aa_fieldById(fieldIds[i],cntr.Fields);
		    	if (field && field.newFilter)
		    		filters.push(aa_create_filter(field,ajaxart_getUiPref(cntr.ID[0],'Filter_Field_' + field.Id,ctx)));
		    }
	    	cntr.ExposedFilters = filters;
	    		
			var aspect = ctx._This;
			cntr.RegisterForPreAction(aspect,aa_int(data,profile,'Phase',context));
		}
		aspect.PreAction = function(data1,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			if (! cntr.HasExposedFiltersSection) // build filter section
			{
				cntr.HasExposedFiltersSection = true;
				
			    var filters_section = document.createElement("ul");
			    filters_section.className = 'aa_filters';
			    
				if (cntr.FilterControl != null && !cntr.HideFastFind) // cntr fast find
				{
			    	var filter_elem = document.createElement("li");
			    	filter_elem.className = "aa_filter";
			    	filter_elem.appendChild(cntr.FilterControl[0]);
			    	filters_section.appendChild(filter_elem);
				}
	
		    	for(var i in cntr.ExposedFilters) // create exposed filter controls
			    {
			    	var filter = cntr.ExposedFilters[i];
			    	var field = filter.field;
					if (field.FilterControl == null)
				    	continue;
	
					var newContext = aa_ctx(ctx,{ FilterData: filter.rawFilterData, HeaderFooterCntr: [cntr], DataHolderCntr: [cntr] });
				    var ctrl = field.FilterControl(newContext);
				    filter.Ctrl = ctrl[0];
	
			    	var filter_elem = document.createElement("li");
			    	filter_elem.className = "aa_filter";
			    	filter_elem.appendChild(ctrl[0]);
			    	filters_section.appendChild(filter_elem);
			    }
		    	cntr.FiltersSection = filters_section;
			}
	    	if (jQuery(aa_find_header(cntr)).find('>.aa_filters').length == 0)
				aa_find_header(cntr).appendChild(cntr.FiltersSection);
	    	
		}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	  },
	  ExpandCollapseSections: function (profile,data,context)
		{
			var aspect = { isObject : true };
			var initializeContainer = function(initData,ctx)
			{
				var cntr = ctx.vars._Cntr[0];
		  		cntr.toggleSectionElem = function (elem)
		  		{
		 			var ctrl = elem.find('.aa_section_ctrl');
		 			if (ctrl.length == 0) return;
		 			ctrl = ctrl[0];
					var hitarea = elem.find('>.aa_title').slice(0,1);
		 			elem[0].collapsed = ! elem[0].collapsed;
					if (elem[0].collapsed)
					{
						ctrl.style.display = 'none';
						ctrl.display = 'none';
						hitarea.addClass("expandable");
						hitarea.removeClass("collapsable");
					}
					else
					{
						ctrl.style.display = 'block';
						ctrl.display = 'block';
						hitarea.addClass("collapsable");
						hitarea.removeClass("expandable");
					}
		  		};
			
				var toggleByClick = function (e)
		  		{
				    var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  );  
		  		    if (! elem.hasClass("aa_title")) return true;
			    	var section_elem = elem.parents('.aa_section').slice(0,1);
			    	if (section_elem.length == 0) return true;
				    cntr.toggleSectionElem(section_elem);
				    return aa_stop_prop(e);
		  		};
				ajaxart.ui.bindEvent(cntr.Ctrl,'click',toggleByClick);
			}
			var initializeElements = function(initData,ctx)
			{
				var cntr = ctx.vars._Cntr[0];
				var elems = ctx.vars._Elems;
				for(var i=0;i<elems.length;i++)
				{
					var elem = jQuery(elems[i]);
					var title = elem.find('>.aa_section>.section_in_list_title'); 
					title.addClass('collapsable');
					title.disableTextSelect();
				};
			};

			ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
			ajaxart_addScriptParam_js(aspect,'InitializeElements',initializeElements,context);
			return [aspect];
		},
	InteractiveGroupBy: function (profile,data,context)
	  {
		var hitAreaCssClass = aa_attach_global_css( aa_text(data,profile,'HitAreaCss',context),null,'hitarea');
		var aspect = { isObject : true, Id: 'GroupBy' };
		aspect.InitializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			
			cntr.THRightClick = function(e,thead,th) {
			    if (e.button != 2) return true;
			 
				var cntr = ctx.vars._Cntr[0];
			    var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  );
  	    		var newContext = aa_ctx( cntr.Context, { _CurrentFocus: [th] });

  	    		ajaxart.runNativeHelper([th.Field],profile,'ContextMenuImp',newContext);
			    return false;
			};
			
			cntr.GroupBy = function(data1,ctx1) // called from menu
			{
	  		    var field = data1[0];
				var cntr = ctx.vars._Cntr[0];
				var ths = jQuery(cntr.Ctrl).find('.aatable>thead').find('>tr>th');
				var jthead = jQuery(cntr.Ctrl).find('.aatable>thead');
				var jth = ths.filter(function() { return this.Field.Id == field.Id} );
	  		    if (jth.hasClass('aa_group_by'))
	    		{
	  		    	cntr.GroupByFields = [];
					ajaxart_setUiPref(cntr.ID[0],'GroupBy_Field','',ctx);
	    		}
		  		else 
		  		{
		  			cntr.GroupByFields = [field];
					ajaxart_setUiPref(cntr.ID[0],'GroupBy_Field',field.Id,ctx);
					var fieldIds = ',' + (ajaxart_getUiPref(cntr.ID[0],'Table_Fields_Order',ctx)|| '')  + ',';
					fieldIds = ',' + field.Id + ',' + fieldIds.replace(',' + field.Id + ',',',');
					fieldIds = fieldIds.replace(/,+/g,',');
					fieldIds = fieldIds.substring(1,fieldIds.length-1);
					ajaxart_setUiPref(cntr.ID[0],'Table_Fields_Order',fieldIds,ctx);
		  		}
				ths.each(function() { jQuery(this).removeClass('aa_group_by') } );
				if (cntr.GroupByFields.length > 0)
					jth.addClass('aa_group_by');
				//aa_recalc_filters_and_refresh(cntr,data1,ctx1);
				ajaxart.runNativeHelper(data1,profile,'RebuildContainer',aa_ctx(ctx1,{ControlElement : [cntr.Ctrl]}));
				//cntr.DoGroupBy();
				return [];
			}

			function toggleGroupByHitArea(hitarea)
		  	{
	  		    if (! hitarea.hasClass("hitarea")) return true;
	  		    // important - otherwise parent cntrs will expand/collapse it again.
			    if (hitarea.parents('.aa_container')[0].Cntr != cntr) 
			    	return true;
			    var elem = hitarea.parents('.aa_group_header').slice(0,1);
			    if (elem.length == 0) return true;
			    
				if (hitarea.hasClass('collapsable'))
				{
					hitarea.addClass("expandable");
					hitarea.removeClass("collapsable");
				}
				else
				{
					hitarea.addClass("collapsable");
					hitarea.removeClass("expandable");
				}

			    var elem_iter = elem[0].nextSibling;
			    while (elem_iter != null && elem_iter.Group != elem[0].Group)
	 			{
					if (hitarea.hasClass('expandable'))
					{			  
						elem_iter.style.display = 'none';
						elem_iter.display = 'none';
					}
					else
					{
						elem_iter.style.display = '';
						elem_iter.display = '';
					}
					elem_iter = elem_iter.nextSibling;
	 			}
			    return false;
	  		};

			cntr.DoGroupBy = function() {
				function addGroupLine(cntr,group,field,list,ths)
				{
				    var opened_groups = ajaxart_getUiPref(cntr.ID[0],'GroupBy_OpenedGroups',ctx);
				    var group_is_open = aa_bool(data,profile,'AutoExpandGroups',context) || opened_groups && opened_groups.indexOf(',' +group.Id+',') != -1;

	  		    	var useImage = aa_bool(data,profile,'UseImage',context);
	  		    	if (field.GroupBy_UseImage != null)
	  		    		useImage = field.GroupBy_UseImage;
	  		    	useImage = useImage && field.Options != null && field.Options.OptionToImage != null;
	  		    	var showEmptyGroups = aa_bool(data,profile,'ShowEmptyGroups',context);
	  		    	if (field.GroupBy_ShowEmptyGroups != null)
	  		    		 showEmptyGroups = field.GroupBy_ShowEmptyGroups;

				    if (!showEmptyGroups && group.Count == 0) return;

				    var tr = document.createElement('TR');
				    tr.Group = group;
				    tr.className = 'aa_group_header group_header_' + group.Id;
				    for (var i=0;i<ths.length;i++) {
				    	var fld = ths[i].Field;
			    		var td = document.createElement("TD");
			    		td.onclick = function toggleGroup(e)
				  		{
							if (window.aa_incapture) return;
						    var hitarea = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  );
						    toggleGroupByHitArea(hitarea);
						    var opened_groups = ajaxart_getUiPref(cntr.ID[0],'GroupBy_OpenedGroups',ctx) || ',';
						    ajaxart_setUiPref(cntr.ID[0],'GroupBy_OpenedGroups',aa_csv_toggle(opened_groups,fld.Id),ctx);
						    if (hitarea.hasClass('collapsable'))
						    	addGroupItems(cntr,group);
						    else
						    	removeGroupItems(cntr,group);
						    // FF bug - refresh table borders with timer...
						    if (ajaxart.isFireFox)
						    {
						    	hitarea.parents('.aatable').slice(0,1).css('border-collapse','separate'); 
						    	//setTimeout( function() { hitarea.parents('.aatable').slice(0,1).css('border-collapse','collapse'); } ,1 );
						    }
				  		}

			    		td.Field = fld;
					    td.className = "aa_groupline_fld_" + fld.Id + " content";
			    		var txt = '';
			    		if (fld.Id == field.Id)
			    		{
			    			var open = group_is_open ? 'collapsable' : 'expandable';
			    			var hitarea = jQuery("<span class='aa_group_hitarea hitarea " + open + "'>&nbsp;</span>");
			    			hitarea.addClass(hitAreaCssClass)
			    			if (group.Count > 0)
			    				jQuery(td).append(hitarea);
			    			jQuery(td).addClass('groupby_fleld');
			    			if (useImage) {
			    				var img = field.OptionImage ? field.OptionImage([group.Id],ctx)[0] : '';
			    				if (img != null && img != "") 
			    					jQuery(td).append(jQuery("<img class='aa_imagebeforetext' src='"+img+"'/>"));
			    			}
			  		    	if (field.GroupBy_GroupText)
			  		    		txt = ajaxart_runMethod([group],field,'GroupBy_GroupText',ctx)[0] || '';
			  		    	else
			  		    		txt = aa_text([group],profile,'GroupText',ctx);
			    		}
			    		else if (fld.GroupAggregator) // TBD: SQL
			    		{
			    			var input = [];
			    			var group_items = group.FetchItems();
			    			for(var t in group_items)
			    				input = input.concat(ajaxart_field_calc_field_data(fld,[group_items[t]],cntr.Context));
			    			txt = ajaxart.totext_array(fld.GroupAggregator(input,cntr.Context));
			    		}
			    		jQuery(td).append(jQuery("<span class='aa_text'>" + txt + "</span>"));
			    		tr.appendChild(td);
				    }
				    list.appendChild(tr);
				    if (group.SubGroups)
			  			for(var i=0;i<group.SubGroups.length;i++)
			  				addGroupLine(cntr,group.SubGroups[i],field,list,ths);
				    if (group_is_open)
				    	addGroupItems(cntr,group);
				    if (cntr.InjectSummaryLines)
				    	cntr.InjectSummaryLines(cntr,list,group);
	  		    	var footer_tr = document.createElement('TR');
	  		    	footer_tr.className = 'aa_group_footer group_footer_' + group.Id; 
	  		    	footer_tr.Group = group;
	  		    	list.appendChild(footer_tr);
				}
				function addGroupItems(cntr,group)
				{
					aa_runMethodAsyncQuery(group,group.FetchItems,[],context,function(group_items,ctx2) {					
				    	var elems = [];
				    	for(var i=0;i<group_items.length;i++)
				    	{
				    		var item = group_items[i].__item || group_items[i];
				    		var elem = cntr.createNewElement([item],elems,null,true);
				    		jQuery(elem).addClass('aa_item_group') ;
				    	}
		  		    	var newcontext = aa_ctx(ctx,{_Elems: elems} );
		  		    	for(var i=0;i<cntr.Aspects.length;i++)
		  		    		ajaxart_runMethod([],cntr.Aspects[i],'InitializeElements',newcontext)
		  		    	jQuery(jQuery(elems).get().reverse()).insertAfter(jQuery(list).find('>.group_header_' + group.Id));
	    			});
				}
				function removeGroupItems(cntr,group)
				{
				    var elem_iter = jQuery(list).find('>.group_header_' + group.Id)[0].nextSibling;
				    while (elem_iter != null && elem_iter.Group != group)
		 			{
				    	var to_remove = elem_iter;
						elem_iter = elem_iter.nextSibling;
						jQuery(to_remove).remove();
		 			}
				}				
				var cntr = this;
				var list = ajaxart_find_aa_list(cntr);
				var ths = jQuery(cntr.Ctrl).find('.aatable>thead>tr>th');
				var th = ths.filter('.aa_group_by')[0];
				if (th == null) return;
				var field = th.Field;

				aa_clear_cntr_items(list,cntr);
	  			list.style.display = 'none'; list.display = 'none';
	  			
	  			var dataholder = cntr.DataHolder;
				var groups = aa_calc_groups(dataholder.UserDataView,dataholder.Wrappers,[field],ctx);
	  			for(var i in groups)
	  				addGroupLine(cntr,groups[i],field,list,ths);
	  			list.style.display = ''; list.display = '';

	  			for(var i=0;i<cntr.PostActors.length;i++) {
			    	ajaxart.trycatch( function() {
				    	  ajaxart.runScriptParam([],cntr.PostActors[i].aspect.PostAction,cntr.Context);
			    	}, function(e) { ajaxart.logException(e); });
			    }
	  			
	  			var autoExpandGroups = aa_bool(data,profile,'AutoExpandGroups',context);
  		    	if (field.GroupBy_AutoExpandGroups != null)
  		    		autoExpandGroups = field.GroupBy_AutoExpandGroups;
				if (autoExpandGroups)
					jQuery(list).find('.aa_group_header>.hitarea').each(function() {toggleGroupByHitArea(jQuery(this))} );
				return [];
			}

			var thead = jQuery(cntr.Ctrl).find('.aatable>thead')[0];
			if (thead != null)
			{
				jQuery(thead).bind('contextmenu', function() { return false; });
				aa_registerHeaderEvent(thead,'mousedown',cntr.THRightClick,'GroupBy','right mouse');
			}
			var GroupByFieldId = ajaxart_getUiPref(cntr.ID[0],'GroupBy_Field',ctx) || '';
			var jth = jQuery(thead).find('>tr>th').filter(function() {return this.Field.Id == GroupByFieldId});
			var fld = aa_fieldById(GroupByFieldId,cntr.Fields);
			if (fld)
				cntr.GroupByFields = [fld];

			jth.addClass('aa_group_by');
		}

		return [aspect];
	  },
	  Sort: function (profile,data,context)
	  {
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var removeCssClasses = function(thead,th)
			{
  		    	var ths = jQuery(thead).find('th');
  		    	ths.removeClass('sort_ascending');
  		    	ths.removeClass('sort_descending');
			}
			var clickHandler = function(e,thead,th) {
	  		    var jth = jQuery(th);
  		    	if (thead.LastMouseDown == null || thead.LastMouseDown.th != th) return;
				var cntr = ctx.vars._Cntr[0];
	  		    if (jth.hasClass('sort_ascending'))
	    		{
	  		    	removeCssClasses(thead,th);
	  		    	jth.addClass('sort_descending');
					ajaxart_setUiPref(cntr.ID[0],'Sort_Field',th.Field.Id,ctx);
					ajaxart_setUiPref(cntr.ID[0],'Sort_Direction','sort_descending',ctx);
	    		}
	  		    else if (jth.hasClass('sort_descending'))
	  		    {
	  		    	removeCssClasses(thead,th);
					ajaxart_setUiPref(cntr.ID[0],'Sort_Field','',ctx);
					ajaxart_setUiPref(cntr.ID[0],'Sort_Direction','',ctx);
	  		    }
		  		else 
		  		{
		  			removeCssClasses(thead,th);
		  			jth.addClass('sort_ascending');
					ajaxart_setUiPref(cntr.ID[0],'Sort_Field',th.Field.Id,ctx);
					ajaxart_setUiPref(cntr.ID[0],'Sort_Direction','sort_ascending',ctx);
		  		}
	  		    aa_recalc_filters_and_refresh(cntr,data);
			}
			var thead = jQuery(cntr.Ctrl).find('.aatable>thead')[0];
			if (thead)
				aa_registerHeaderEvent(thead,'mouseup',clickHandler,'Sort','no dominant');
			// initByUIPref 
			var sort_field = ajaxart_getUiPref(cntr.ID[0],'Sort_Field',ctx);
			var jth = jQuery(thead).find('>tr>th').filter(function() {return this.Field.Id == sort_field});
			jth.addClass(ajaxart_getUiPref(cntr.ID[0],'Sort_Direction',ctx));
		}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	  },
	  TableColumnsDragAndDrop: function (profile,data,context)
	  {
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var initDD = function(dragged_class,horizontal,select_on_drag)
			{
			var cntr = ctx.vars._Cntr[0];

			var _drag = function(e,thead,th) {
				var ltr = 1;
				var rtl = 0;
				if (jQuery(thead).parents('.right2left').length > 0)
				{
					ltr = 0; rtl = 1;
				}
				var mousepos = aa_mousePos(e);
				var oElem = thead.draggedElem;
		
				if (oElem == null) return true;
				
				oElem.style.left = (mousepos.x - oElem.mouseX) + 'px'; 

				var spaceLeft = aa_absLeft(thead.spaceElem);
				var nextRight = ltr ? -1 : 5000;
				if (jQuery(thead.spaceElem).next().length > 0)
				{
					var next = jQuery(thead.spaceElem).next()[0];
					nextRight = aa_absLeft(next) + ltr * next.offsetWidth;
				}
				var prevLeft = ltr ? -1 : 5000;
				if (jQuery(thead.spaceElem).prev().length > 0)
				{
					var prev = jQuery(thead.spaceElem).prev()[0];
					prevLeft = aa_absLeft(prev) + rtl * prev.offsetWidth;
				}
						
				var draggedLeft = aa_absLeft(thead.draggedElem) + rtl * thead.draggedElem.offsetWidth;
				var draggedRight = aa_absLeft(thead.draggedElem) + ltr * thead.draggedElem.offsetWidth;
				var nearRight = nextRight < draggedRight + 5;
				if (rtl) nearRight = !nearRight;
				var nearLeft = prevLeft > draggedLeft - 5;
				if (rtl) nearLeft = !nearLeft;

				var parent_table = jQuery(thead).parents('.aatable').slice(0,1);
				if (parent_table[0].ElementsTable)
					var trs = jQuery(parent_table[0].ElementsTable).slice(0,1).find('.aa_item');
				else
					var trs = jQuery(thead).parents('.aatable').slice(0,1).find('.aa_item');
				if (nearRight)
					if (thead.spaceElem.nextSibling.nextSibling != null)
					{
						var draggedFieldId = thead.spaceElem.Field.Id;
						var droppedFieldId = thead.spaceElem.nextSibling.Field.Id;
						for(var j=0;j<trs.length;j++)
						{
							var tr = trs[j];
							var tds = jQuery(tr).find('>td');
							var dragged_td = tds.filter( function() { return this.Field.Id == draggedFieldId} );
							var dropped_td = tds.filter( function() { return this.Field.Id == droppedFieldId} );
							if (dragged_td.length > 0 && dropped_td.length > 0)
								dragged_td.insertAfter(dropped_td);
						}
						jQuery(thead.spaceElem).insertAfter(jQuery(thead.spaceElem.nextSibling));
						if (parent_table[0].ResizeColumn)
							parent_table[0].ResizeColumn(thead.spaceElem);
					}
				if (nearLeft)
					if (thead.spaceElem.previousSibling != null)
					{
						var draggedFieldId = thead.spaceElem.Field.Id;
						var droppedFieldId = thead.spaceElem.previousSibling.Field.Id;
						for(var j=0;j<trs.length;j++)
						{
							var tr = trs[j];
							var tds = jQuery(tr).find('>td');
							var dragged_td = tds.filter( function() { return this.Field.Id == draggedFieldId} );
							var dropped_td = tds.filter( function() { return this.Field.Id == droppedFieldId} );
							if (dragged_td.length > 0 && dropped_td.length > 0)
								dragged_td.insertBefore(dropped_td);
						}
						jQuery(thead.spaceElem).insertBefore(jQuery(thead.spaceElem.previousSibling));
						if (parent_table[0].ResizeColumn)
							parent_table[0].ResizeColumn(thead.spaceElem);
					}
				return aa_stop_prop(e);
			};
		 
			var _dragEnd = function(e) {
				var cntr = ctx.vars._Cntr[0];
				var thead = jQuery(cntr.Ctrl).find('.aatable>thead')[0];
				var fieldIds = '';
				jQuery(thead).find('th').each(function() { if (this.Field && this.Field.Id) fieldIds = fieldIds + ',' + this.Field.Id});
				ajaxart_setUiPref(cntr.ID[0],'Table_Fields_Order',fieldIds,ctx);
				jQuery(thead.spaceElem).removeClass('aa_dragged_space_elem');
				thead.draggedParent.removeChild(thead.draggedElem);
				document.onmouseup = thead.origDocMouseup;
				thead.draggedElem = null;
				thead.Suspect = null;
			  	ajaxart.run([],profile, 'OnDrop', context);
			  	aa_invoke_cntr_handlers(cntr,cntr.ContainerChange,[],ctx);
				thead.Owner = null;
				return aa_stop_prop(e);
			};
	 
			var suspectDrag = function(e,thead,th) {
				thead.Suspect = { owner: "TableColumnsDragAndDrop", mousePos : aa_mousePos(e)};
				return aa_stop_prop(e);
			}

			var checkSuspection = function(e,thead,th) {
				var mousepos = aa_mousePos(e);
				if (thead.Suspect != null)
				{
					var distance = Math.abs(mousepos.x - thead.Suspect.mousePos.x);
					if (distance < 5) return true;
					thead.Suspect = null;
					dragBegin(e,thead,th);
				}
			}

			var unSuspectDrag = function(e,thead,th) {
				if (thead.Owner == "TableColumnsDragAndDrop") return true;
				thead.Suspect = null;
				return true;
			}

			var dragBegin = function(e,thead,th) {
				ajaxart_disableSelection(thead);
				thead.Owner = "TableColumnsDragAndDrop";

				var posx = aa_absLeft(th,false) ;
				var posy = aa_absTop(th,false) ;
	  		    
				var oElem = thead.draggedElem = th.cloneNode(true);
				thead.draggedParent = th.parentNode; 
				thead.draggedParent.appendChild(oElem);
				thead.spaceElem = th; 

				jQuery(oElem).addClass('aa_dragged_elem');
				jQuery(thead.spaceElem).addClass('aa_dragged_space_elem');
		 
				var mousepos = aa_mousePos(e);
				oElem.mouseX = mousepos.x - posx;

				oElem.style.position = 'absolute';
				oElem.style.top = posy + 'px';
				oElem.style.left = posx + 'px';
		 
				thead.origDocMouseup = document.onmouseup;
				document.onmouseup = _dragEnd;
				if(e.preventDefault)
				  e.preventDefault();

				return aa_stop_prop(e);
			};
			var thead = jQuery(cntr.Ctrl).find('.aatable>thead')[0];
			if (thead)
			{
				aa_registerHeaderEvent(thead,'mousedown',suspectDrag,'TableColumnsDragAndDrop','no dominant');
				aa_registerHeaderEvent(thead,'mousemove',checkSuspection,'TableColumnsDragAndDrop','suspect');
				aa_registerHeaderEvent(thead,'mouseup',unSuspectDrag,'TableColumnsDragAndDrop','suspect');
				aa_registerHeaderEvent(thead,'mouseout',unSuspectDrag,'TableColumnsDragAndDrop','suspect');
				aa_registerHeaderEvent(thead,'mousemove',_drag,'TableColumnsDragAndDrop','dominant');
			}
			};
			initDD('fieldtitle',true);
		}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	  },
	  TableColumnsResizer: function (profile,data,context)
	  {
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];

			var colResizeDetect = function(e,thead,th) {
				var mousepos = aa_mousePos(e);

				var in_resize_place = aa_absLeft(th,false) + th.offsetWidth - mousepos.x < 6;
				if (jQuery(thead).parents('.right2left').length > 0)
					in_resize_place = mousepos.x - aa_absLeft(th,false) < 6;
				if (in_resize_place)
				{
					jQuery(th).addClass('col_resize');
					thead.ResizedCol = th;
					thead.Owner = "TableColumnsResizer";
				}
				else
				{
					jQuery(th).removeClass('col_resize');
					thead.ResizedCol = null;
					thead.Owner = null;
				}
				return aa_stop_prop(e);
			}

			var colResizeStart = function(e,thead,th) {
				thead.ResizedColStart = true;
				ajaxart_disableSelection(thead);
				document.onmouseup = colResizeStop;
				return aa_stop_prop(e);
			}

			var colResizeMove = function(e,thead,th) {
				if (thead.ResizedColStart)
				{
					var mousepos = aa_mousePos(e);
					var new_size = mousepos.x - aa_absLeft(thead.ResizedCol,false);
					if (jQuery(thead).parents('.right2left').length > 0)
						new_size = aa_absLeft(thead.ResizedCol,false) + thead.ResizedCol.offsetWidth - mousepos.x;
					
					jQuery(thead.ResizedCol).width(new_size);

					var cntr = ctx.vars._Cntr[0];
					ajaxart_setUiPref(cntr.ID[0],thead.ResizedCol.Field.Id+'_ColumnWidth','' + new_size + 'px',ctx);

					var parent_table = jQuery(thead.ResizedCol).parents('.aatable').slice(0,1);
					if (parent_table[0].ResizeColumn)
						parent_table[0].ResizeColumn(thead.ResizedCol);

					// if fusion change tds out of the table
					if (jQuery(thead.ResizedCol).parents('table').slice(0,1).hasClass('aa_inner_header'))
					{
						var tds = parent_table.find('td').filter(function() { 
							return this.Field != null && this.Field.Id == thead.ResizedCol.Field.Id } 
						);
						tds.width(new_size + 1);
					}
					return aa_stop_prop(e);
				}
				else
					colResizeDetect(e,thead,th);
			}

			var colResizeStop = function(e) {
				var cntr = ctx.vars._Cntr[0];
				jQuery(cntr.Ctrl).find('th').removeClass('col_resize');
				document.onmouseup = null;
				jQuery(cntr.Ctrl).find('thead').each( function()
						{
							var thead = this;
							thead.ResizedColStart = false;
							thead.ResizedCol = null;
							thead.Owner = null;
						});
				return aa_stop_prop(e);
			}

			var thead = jQuery(cntr.Ctrl).find('.aatable>thead')[0];
			if (thead)
			{
				aa_registerHeaderEvent(thead,'mousemove',colResizeDetect,'TableColumnsResizer','no dominant');
				aa_registerHeaderEvent(thead,'mousedown',colResizeStart,'TableColumnsResizer','dominant');
				aa_registerHeaderEvent(thead,'mousemove',colResizeMove,'TableColumnsResizer','dominant');
				aa_registerHeaderEvent(thead,'mouseup',colResizeStop,'TableColumnsResizer','dominant');
			}
		};
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	  },
	  ScrollItems: function (profile,data,context)
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
	  },
	  TableScroll: function (profile,data,context)
	  {
		var aspect = { isObject : true };

		function addScroll(cntr)
		{
			var table = jQuery(cntr.Ctrl).find('.aatable').slice(0,1);
			var tWidth = table.width();
			var fixedHeight = aa_int(data,profile, 'Height', context);
			if (fixedHeight > table.height()) return;
				
			var headers_table = jQuery('<table class="aa_headers_table aatable"></table>');
			headers_table.append(table.find('thead'));
			headers_table.insertBefore(table);
			var tableWrapper = jQuery('<div class="aa_scroll_wrapper" style="overflow: auto"></div>');
			tableWrapper.insertBefore(table);
			tableWrapper.append(table);
			tableWrapper.height(fixedHeight);
			headers_table[0].ElementsTable = table[0];
			setWidths(headers_table);
			
			function setWidths(headers_table)
			{
				var scrollerWidth = 18;
				var paddingDiff = 10; // diff in padding between header and content

				var tableWrapper = headers_table.parent().find('>.aa_scroll_wrapper');
				var table = tableWrapper.find('>.aatable');

				var tWidth = headers_table.width();
				var fix = 1;
				if (ajaxart.isChrome || ajaxart.isIE)
					fix = 2;
				tableWrapper.width(tWidth+fix);
				//tableWrapper.width(headers_table.width());
	
				// set the columns widths by the header
				var trs = table.find('>tbody>tr');
				var widths = [];
				headers_table.find('>thead>tr>th').each(function() { widths.push(jQuery(this).width() - paddingDiff)} );
				widths[widths.length-1] = widths[widths.length-1] - scrollerWidth + 1; // fix last column width
				if (ajaxart.isIE)
					table[0].setAttribute('width',''+(tWidth - scrollerWidth));
				for(var i=0;i<trs.length;i++)
				{
					var tds = jQuery(trs[i]).find('>td');
					for(var j=0;j<tds.length;j++)
					{
						jQuery(tds[j]).width(widths[j]);
						jQuery(tds[j]).css("min-width",widths[j]);
						jQuery(tds[j]).css("max-width",widths[j]);
					}
				}
			}
			headers_table[0].ResizeColumn = function()
			{
				setWidths(jQuery(this));
			}
		}
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			cntr.RegisterForPostAction(ctx._This);
		}
		aspect.PostAction = function(data1,ctx)
		{
			setTimeout(function() { 
				var cntr = ctx.vars._Cntr[0];
				addScroll(cntr) } ,1);
		}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	  },
	  CustomListPresentation: function (profile,data,context)
	  {
		var aspect = { isObject : true };
		var init = function(aspect) {
			function refresh(data1,ctx)
			{
				var cntr = context.vars._Cntr[0];  
				var newContext = aa_merge_ctx(context,ctx, {Items: aa_items(cntr) });
				var ctrl = aa_first(data,profile,'List',newContext);
				if (ctrl) 
				{
					jQuery(ctrl).addClass('aa_list');
					jQuery(ajaxart_find_aa_list(cntr)).replaceWith(ctrl);
				}
			    for(var i=0;i<cntr.PostActors.length;i++) {
			    	ajaxart.trycatch( function() {
				    	  ajaxart.runScriptParam([],cntr.PostActors[i].aspect.PostAction,cntr.Context);
			    	}, function(e) { ajaxart.logException(e); });
			    }
			}
			aspect.InitializeContainer = function(data1,ctx)
			{
				var cntr = ctx.vars._Cntr[0];
				cntr.createNewElement = null;
				//cntr.RegisterForPostAction(aspect);
				aa_register_handler(cntr,'ContainerChange', refresh);
			}
		}
		init(aspect);
		return [aspect];
	  },
	  Tiles: function (profile,data,context)
	  {
		  var aspect = { isObject : true };
			aspect.CreateContainer = function(initData,ctx)
			{
				var cntr = ctx.vars._Cntr[0];
			    var div = jQuery('<div class="teasers_list_tiles aa_list aa_listtop aa_cntr_body"/>');
				jQuery(cntr.Ctrl).find('>.aa_listtop').replaceWith(div);
				jQuery(cntr.Ctrl).find('>.aa_container_footer').css('clear','both');				
				return [];
			}
			aspect.InitializeContainer = function(data1,ctx) {
				var cntr = ctx.vars._Cntr[0];
				var imageSize = aa_text(data,profile,'ImageSize',context).split(',');
				var tileExtra = aa_text(data,profile,'TileExtraSize',context).split(',');

				cntr.TilesImageWidth = parseInt(imageSize[0].split('px')[0]); 
				cntr.TilesImageHeight = parseInt(imageSize[1].split('px')[0]);
				cntr.TilesWidth = cntr.TilesImageWidth + parseInt(tileExtra[0].split('px')[0]); 
				cntr.TilesHeight = cntr.TilesImageHeight + parseInt(tileExtra[1].split('px')[0]); 
				cntr.TilesMaxTextLength = aa_int(data,profile,'MaxTextLength',context);
				cntr.DefaultTileImage = aa_text(data,profile,'DefaultImage',context);
				cntr.MoreFields = aa_text(data,profile,'MoreFields',context);
				cntr.Tiles = aa_bool(data,profile,'Tiles',context);
				var imageScript = ajaxart.fieldscript(profile,'ImageOrVideo',true);
				cntr.Clickable = aa_text(data,profile,'Clickable',context);
				cntr.TilesHasImage = (imageScript != null && imageScript.nodeValue != "");
				cntr.TilesKeepImageProportion = aa_bool(data,profile,'KeepImageProportion',context);
				
			    cntr.createNewElement = function(item_data,item_aggregator,ctx2)
			    {
					var cntr = ctx.vars._Cntr[0];

					var div = jQuery('<div class="aa_teaser tiles aa_item">'
							+ '<div class="aa_teaserimage"><img class="aa_teaser_image"/></div>'
							+ '<div class="aa_teaser_title aa_text"/><div class="aa_teaser_text aa_text"/>'
							+ '</div>');
					
			    	if (cntr.CustomItemControl)
			    	{
			    		div = jQuery('<div class="aa_teaser tiles aa_item"></div>');
			    		var ctrl = cntr.CustomItemControl(item_data,ctx2 || ctx);
			    		if (ctrl.length > 0)
			    			div[0].appendChild(ctrl[0]);
			    	}
			    	else
			    	{
						var text = aa_text(item_data,profile,'Text',context);
						if (text.length >= cntr.TilesMaxTextLength && cntr.TilesMaxTextLength > 0) 
							text = text.substring(0,cntr.TilesMaxTextLength)+"...";
						
						var img_txt = aa_text(item_data,profile,'ImageOrVideo',context) || cntr.DefaultTileImage;
						if (cntr.TilesHasImage) {
							var isVideo = img_txt.indexOf('<object') != -1;
							if (isVideo)
							{
								img_txt = img_txt.replace(new RegExp('width=.[0-9]*','g'),'width="' + cntr.TilesImageWidth );
								img_txt = img_txt.replace(new RegExp('height=.[0-9]*','g'),'height="' + cntr.TilesImageHeight );
								var video = jQuery(img_txt);
								div.find('.aa_teaserimage_td').empty().append(video);
							}
							else
							{
								if (img_txt != "")
									div.find('.aa_teaser_image')[0].src = img_txt;
								if (cntr.TilesImageWidth)
									div.find('.aa_teaser_image')[0].width = cntr.TilesImageWidth;//setAttribute('width',cntr.TilesImageWidth);
								if (cntr.TilesImageHeight)
									div.find('.aa_teaser_image')[0].height = cntr.TilesImageHeight;// setAttribute('height',cntr.TilesImageHeight);
								if (cntr.TilesWidth)	
									div.find('.aa_teaser_image')[0].style.maxWidth = cntr.TilesWidth+"px";
								if (cntr.TilesHeight)	
									div.find('.aa_teaser_image')[0].style.maxHeight = cntr.TilesHeight+"px";
							}
							div.find('.aa_teaserimage_td').width(cntr.TilesImageWidth);
				    		div.find('.aa_teaserimage').height(cntr.TilesImageHeight+'px');
						}
						function FixImageSize(img) 
						{
							var cntr = ctx.vars._Cntr[0];
							var imgObj = new Image(); imgObj.src = img.getAttribute('src');
							var naturalWidth = imgObj.width,naturalHeight = imgObj.height;
							if (naturalWidth < cntr.TilesImageWidth) img.width = naturalWidth; 
							if (naturalHeight < cntr.TilesImageHeight) img.height = naturalHeight;
							var width = Math.min(naturalWidth,cntr.TilesImageWidth), height = Math.min(naturalHeight,cntr.TilesImageHeight); // IE hates img.width
							
							if (cntr.TilesKeepImageProportion) {
								var ratio = naturalWidth / naturalHeight;
								var currRatio = width / height;
								if (ratio != currRatio) {
									if (naturalWidth >= naturalHeight * currRatio) {
										img.width = cntr.TilesImageWidth;
										img.height = Math.floor(width / ratio);
									} else {
										img.height = cntr.TilesImageHeight;
										img.width = Math.floor(height * ratio);
									}
								}
							}
						}
						if (img_txt) {
						  var img = div.find('.aa_teaser_image')[0]; 
						  var imgObj = new Image(); imgObj.src = img_txt;
						  if (imgObj.complete) FixImageSize(img);
						  else img.onload = function() { FixImageSize(this);}
						}
						
						div.find('.aa_teaser_title')[0].innerHTML = aa_text(item_data,profile,'Title',context);
						div.find('.aa_teaser_text')[0].innerHTML = text;
						if (cntr.TilesWidth != "")	{
							div.find('.aa_teaser_text')[0].style.maxWidth = cntr.TilesWidth+"px";
							div.find('.aa_teaser_text')[0].style.overflow = "hidden" ;
							div.find('.aa_teaser_title')[0].style.maxWidth = cntr.TilesWidth+"px";
							div.find('.aa_teaser_title')[0].style.overflow = "hidden" ;
						}
			    	}
					var clickable = null;
					if (cntr.Clickable == "tile")
						clickable = div;
					else if (cntr.Clickable == "title")
						clickable = div.find('.aa_teaser_title');
					if (clickable != null) {
						clickable.addClass('teasers_clickable');
						clickable.click(function(e)
						{
							if (window.aa_incapture) return;
							var cntr = ctx.vars._Cntr[0];
							var item = this;
							if (!jQuery(this).hasClass('aa_item'))
								item = jQuery(this).parents('.aa_item')[0];
							var newContext = aa_ctx(ctx2 || ctx,{ _InnerItem: item.ItemData, _ItemsOfOperation: item.ItemData, ControlElement: [this]} );
							ajaxart.run(item.ItemData,profile,'Action',newContext);
							return false;
						});
					}
					if (cntr.TilesWidth != "")	div[0].style.width = cntr.TilesWidth+"px";
					if (cntr.TilesHeight != "") div[0].style.height = cntr.TilesHeight+"px";
					var more_fields = cntr.MoreFields.split(",");
					for (var i=0; i<more_fields.length; i++) {
						var field_id = more_fields[i];
				    	if (field_id == "") continue;
				    	var field = null;
					    for(var j=0;j<cntr.Fields.length;j++)
					    	if (cntr.Fields[j].Id == field_id)
					    		field = cntr.Fields[j];
					    if (field == null) { ajaxart.log("Tiles: field " + field_id + " not found");continue; }
				    	var newContext = aa_ctx(ctx2 || ctx,{_Field: [field], FieldTitle: [field.Title], _InnerItem : item_data, _Elem : [div], _Item: item_data });
			    		var cell = document.createElement("div");
			    		cell.className = 'teasers_field';
					    var cell_data = ajaxart_field_calc_field_data(field,item_data,newContext);
				    	ajaxart_field_createCellControl(item_data,cntr,cell,cntr.CellPresentation,field,cell_data,newContext); 
				    	div[0].appendChild(cell);
					}
						
					var out = div[0];
					out.ItemData = item_data;
			    	if (item_aggregator) item_aggregator.push(out);
					return out;
			    }
			}
			return [aspect];	
	  },
	  ElementItemData: function (profile,data,context)
	  {
		var elem = aa_first(data,profile,'Element',context);
		if (elem && elem.ItemData) return elem.ItemData;
		return [];
	  },
	  Css: function (profile,data,context)
	  {
		var aspect = { isObject : true };
		aspect.InitializeContainer = function(data1,ctx) {
			var css_for = aa_text(data,profile,'OnElement',context);
			if (css_for == "") css_for = "container";
			var class_compiled = ajaxart.compile(profile,'Class',context);
			var inline_compiled = ajaxart.compile(profile,'Inline',context);
			var condition_compiled = ajaxart.compile(profile,'OnCondition',context, null, false, true);
			var apply_css = function(elems,data2) {
				for (var i=0; i<elems.length; i++) {
					if (! ajaxart_runcompiled_bool(condition_compiled, data2, profile, "OnCondition", context, true )) return;
					var cls = ajaxart_runcompiled_text(class_compiled, data2, profile, "Class" ,context);
					var inline = ajaxart_runcompiled_text(inline_compiled, data2, profile, "Inline" ,context);
					if (inline != "") aa_setCssText(elems[i],elems[i].style.cssText + ";" + inline);
					jQuery(elems[i]).addClass(cls);
				}
			};
			var register = function(apply_css,css_for) {
				var cntr = ctx.vars._Cntr[0];
				aspect.PostAction = function(data1,ctx) {
					var cntr = ctx.vars._Cntr[0];
					if (css_for == "container")
						apply_css([cntr.Ctrl], data1);
					if (css_for == "container body")
						apply_css(jQuery(cntr.Ctrl).find(">.aa_cntr_body"), data1);
					if (css_for == "table")
						apply_css(jQuery(cntr.Ctrl).find(">.aa_cntr_body>table,>table"), data1);
					if (css_for == "title row")
						apply_css(jQuery(cntr.Ctrl).find(".aatable_header"), data1);
					if (css_for == "title cell (th)")
						apply_css(jQuery(cntr.Ctrl).find(".fieldtitle"), data1);
					if (css_for == "title text")
						apply_css(jQuery(cntr.Ctrl).find(".fieldtitle_title"), data1);
				}
				var initializeElements = function(initData,ctx)
				{
					var elems = ctx.vars._Elems;
					if (css_for == "items") {
						for(var j=0;j<elems.length;j++)
							apply_css([elems[j]], elems[j].ItemData);
					}
					if (css_for == "tree item text") {
						for(var j=0;j<elems.length;j++) {
							var itemtext = jQuery(elems[j]).find('>.item_text')[0];
							if (itemtext)
							  apply_css([itemtext], elems[j].ItemData);
						}
					}
					if (css_for == "cells") {
						for(var j=0;j<elems.length;j++)
							apply_css(jQuery(elems[j]).find(">td"), elems[j].ItemData);
					}
				};
				ajaxart_addScriptParam_js(aspect,'InitializeElements',initializeElements,context);
				cntr.RegisterForPostAction(aspect); 
			}
			register(apply_css,css_for);
		}
			
		return [aspect];
	  },
	  CssClass: function (profile,data,context)
	  {
		  var aspect = { isObject : true };
		  aspect.InitializeContainer = function(data1,ctx) {
			  var cntr = ctx.vars._Cntr[0];
			  var cssClass = aa_text(data,profile,'CssClass',context);
			  jQuery(cntr.Ctrl).addClass(cssClass);
		  }
		  return [aspect];
	  },
	  PathOfElement: function (profile,data,context)
	  {
		var elem = aa_first(data,profile,'Element',context);
		
		var path = "";
		while (elem != null && ! aa_hasClass(elem,'aa_container') ) {
			if (aa_hasClass(elem,'aa_item')) {
			  var subpath = jQuery(elem).find('>.aa_text').text();
			  if (subpath != "") {
				  if (path == "") path = subpath;
				  else	path = subpath + "/" + path;
			  }
			}
			elem = elem.parentNode;
		}
		return [path];
	  },
	  TextWithCommas: function (profile,data,context)
	  {
		var aspect = { isObject : true };
		aspect.InitializeContainer = function(data1,ctx) {
			var cntr = ctx.vars._Cntr[0];
			cntr.MaxItemsToShow = aa_int(data,profile,'MaxItemsToShow',context);
			if (cntr.MaxItemsToShow == 0) cntr.MaxItemsToShow = null;
			cntr.AsHyperlink =  aa_bool(data,profile,'AsHyperlink',context);
			jQuery(ajaxart_find_aa_list(cntr)).addClass('commas').css('margin',0);
		    cntr.createNewElement = function(item_data,item_aggregator,ctx2)
		    {
				var cntr = ctx.vars._Cntr[0];
				
				var out = document.createElement('span');
				out.ItemData = item_data;
		    	out.className = "aa_item aa_textwithcommas";
		    	if (cntr.AsHyperlink) {
		    		out.className += " hyperlink";
		    		out.onmouseup = function() {
		    			if (ajaxart.fieldscript(profile,'OnClick',true))
		    				ajaxart.run(this.ItemData,profile,'OnClick',aa_merge_ctx(context,ctx2));
		    			else {
							var cntr = ctx.vars._Cntr[0];
							var newContext = aa_ctx(ctx2 || ctx,{ _InnerItem: this.ItemData });
							ajaxart.runScriptParam(this.ItemData,cntr.OpenItemDetails,newContext);
		    			}
		    		}
		    	}
		    	out.innerHTML = aa_text(item_data,profile,'ItemText',aa_merge_ctx(context,ctx2)); 
		    	
		    	if (item_aggregator) item_aggregator.push(out);
		    	return out;
		    }
		}
		aspect.InitializeElements = function(data1,ctx) {
			var cntr = ctx.vars._Cntr[0];
			var elems = ctx.vars._Elems;
			for(var i=0;i<elems.length-1;i++) 
				jQuery(elems[i]).removeClass('last');

			if (elems.length > 0) jQuery(elems[elems.length-1]).addClass('last');
		}

		return [aspect];
	  },
	  HiddenFields: function (profile,data,context)
	  {
		var aspect = { isObject : true };
		aspect.CreateContainer = function(initData,ctx) // to run before the table...
		{
			var cntr = ctx.vars._Cntr[0];
			cntr.HiddenFields = aa_text(data,profile,'FieldIds',context);
			return [];
		}
		return [aspect];
	  },
	  Table: function (profile,data,context)
	  {
		var aspect = { isObject : true };
		var createContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
		    var table = jQuery('<table class="aatable aa_listtop aa_cntr_body"><thead><tr class="aatable_header"></tr></thead><tbody class="aatable_tbody aa_list" tabindex="1"></tbody></table>');
		    table.addClass(aa_attach_global_css(aa_text(data,profile,'Css',context),null,'table'));
		    
			jQuery(cntr.Ctrl).find('>.aa_listtop').replaceWith(table);
			return [];
		}
		
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var cols_str = aa_text(data,profile,'Columns',ctx);
			var pref_str = ajaxart_getUiPref(cntr.ID[0],'Table_Fields_Order',ctx);
			var hidden_fields = ',' + ajaxart_getUiPref(cntr.ID[0],'Table_Hidden_Fields',ctx) + ',' + (cntr.HiddenFields || '') + ',';
	    	var fieldsOrig = ajaxart_field_getFields(cntr,"table");
	    	var fields = [];
    		for (var i=0;i<fieldsOrig.length;i++)
    			if (fieldsOrig[i].Id == '' || hidden_fields.indexOf(fieldsOrig[i].Id) == -1)
    				fields.push(fieldsOrig[i]);
			var columns = cols_str.split(',');
			if (pref_str)
			{
				var merged_cols = ',' + pref_str + ',';
				if (cols_str != '')
				{
					var cols = cols_str.split(',')
					for(var i=0;i<cols.length;i++)
					{
						if (cols[i] != '' && merged_cols.indexOf(cols[i]) == -1)
							merged_cols += cols[i] + ',';
					}
				}
				else
				{
					for(var i=0;i<fields.length;i++)
					{
						if (merged_cols.indexOf(fields[i].Id) == -1)
							merged_cols += fields[i].Id + ',';
					}
				}
				columns = merged_cols.split(',');
			}
			if (columns.length == 1 && columns[0] == "") columns = [];
			
			cntr.columns = [];
			if (cntr.CellPresentation == null) cntr.CellPresentation = 'text';

	    	var operations = ajaxart_runMethod([],cntr,'Operations',ctx);
	    	if (columns.length == 0)
	    	{
	    		for (var i=0;i<fields.length;i++)
		    		cntr.columns.push(fields[i]);
	    	}
		    else
		    {
				for(var i=0;i<columns.length;i++)
				{
					if (columns[i] == '') continue;
					var found = false;
		    		for (var j=0;j<fields.length;j++)
		    			if (columns[i] == fields[j].Id)
		    			{
		    				cntr.columns.push(fields[j]);
		    				found = true;
		    			}
		    		for (var j=0;j<operations.length;j++)
		    			if (columns[i] == operations[j].Id)
		    			{
		    				cntr.columns.push(operations[j]);
		    				found = true;
		    			}
		    		if (! found)
		    			ajaxart.log("table column (field or operation) '" + columns[i] + "' was not found");
				}
		    }

		    var table = jQuery(cntr.Ctrl).find('.aatable'); 
	    	var header = jQuery(cntr.Ctrl).find('thead');
	    	if (header.length == 0) return;
			var header_tr = header.find('>tr')[0];
	    	// set headers - should be an aspect
	    	var fields = ajaxart_field_getFields(cntr,"table");
		    for (var j=0;j<cntr.columns.length;j++) {
		    	var field = cntr.columns[j];
		    	var th = jQuery('<th class="fieldtitle th_' + field.Id + '"><span class="fieldtitle_title"/><span class="fieldtitle_sort">&nbsp;</span></th>');
		    	if (field.AddInfoIcon) 
		    		field.AddInfoIcon(th.get(),cntr.Context);
		    	
		    	aa_defineElemProperties(th[0],'fieldId');
		    	th[0].fieldId = field.Id;
		    	th[0].Field = field;
		    	th[0].Cntr = cntr; // As headers may move in the fusion process, it is useful to remember their origin.
		    	var title = field.isOperation ? ajaxart_runMethod(data,field,'Title',cntr.Context)[0] : field.Title;
		    	if (field.HideTitle) title=" ";
	    		th.find('>.fieldtitle_title').html(title);
		    	if (field.Width) 
		    		th.css('width',field.Width);
		    	ajaxart_field_fix_th(cntr,th[0],field,ctx);
		    	header_tr.appendChild(th[0]);
		    	if (cntr.EnableFieldMenu)
		    	{
		    		th.find('>span').slice(0,1).insertBefore('<span class="aa_field_menu">&nbsp;</span>');
		    		th.find('>.aa_field_menu')[0].onmousedown = function(e) 
		    		{ 
	  	  	    		var newContext = aa_ctx( ctx, {
	  	  	    			MousePos: [ { isObject: true, pageX: e.pageX || e.clientX, pageY: e.pageY || e.clientY} ]
	  	  	    		});
		    			ajaxart.runNativeHelper([field],profile,'FieldMenu',newContext); 
		    			return aa_stop_prop(e);
		    		}
		    	}
		    }
		    cntr.createNewElement = function(item_data,item_aggregator,ctx2,forGroup)
		    {
	    		var cntr = this;
		    	var tr = document.createElement("TR");
		    	tr.className = "aa_item tablerow";
				tr.ItemData = item_data;
				ajaxart.databind([tr],item_data,context,profile,data);	// for runtime inspect
		    	
		    	var fields = cntr.columns;
		    	if (cntr.CustomItemControl)
		    	{
		    		var td = document.createElement("TD");
		    		td.colSpan = fields.length;
		    		var ctrl = cntr.CustomItemControl(item_data,ctx);
		    		if (ctrl.length > 0)
		    			td.appendChild(ctrl[0]);
		    		tr.appendChild(td);
		    	}
		    	else if (!cntr.GroupByFields || cntr.GroupByFields.length == 0 || forGroup)
		    	{
				    for (var j=0;j<fields.length;j++) {
				    	var field = fields[j];
				    	var newContext = aa_ctx(ctx2 || ctx,{_Field: [field], FieldTitle: [field.Title], _InnerItem : item_data, _Elem : [tr], _Item: item_data });
			    		var td = document.createElement("TD");
			    		td.Field = field;
				    	if (field.Id == '#_TitleField') {
				    		td.className = "aa_title_td content";
				    		tr.titleTd = td;
				    	}
				    	else
				    	{
				    		if (cntr.WrappersAsItems || (field.IsCalculated && field.WrapperToValue && item_data[0] && item_data[0].__hiddenForView))
				    		{
				    			td.className = "content aa_text fld_" + field.Id;
				    			td.innerHTML = '' + item_data[0][field.Id];
				    			tr.appendChild(td);
				    			continue;
				    		}
				    		if (field.CellPresentation == "text" && !field.isOperation && !field.CalculatedControl && !field.IsCalculated && !field.ModifyCell)
				    		{
				    			td.className = "content aa_text fld_" + field.Id;
				    			if (field.Text) {
				    				var field_data = ajaxart_field_calc_field_data(field,item_data,newContext);
				    				td.innerHTML = ajaxart_field_text(field,field_data,item_data,newContext);
				    				td.Data = field_data;
				    			} else if (field.ItemToText) {
				    				td.innerHTML = field.ItemToText(item_data[0]);
				    				td.Data = item_data;
				    			} else if (item_data[0] && item_data[0].__hiddenForView) // wrapper
				    				td.innerHTML = item_data[0][field.Id];
				    			else
				    			{
				    				var cell_data = ajaxart_field_calc_field_data(field,item_data,newContext);
				    				td.Data = cell_data;
				    				td.innerHTML = ajaxart_field_text(field,cell_data,item_data,newContext);
				    			}
				    			if (field.ModifyCell) {
					    			var field_data = ajaxart_field_calc_field_data(field,item_data,newContext);
				    				for(var i=0;i<field.ModifyCell.length;i++)
				    					field.ModifyCell[i](td,field_data,"text",newContext,item);
				    			}
				    			tr.appendChild(td);
				    			continue;
				    		}
					    	td.className = "content";
					    		  
						    var cell_data = ajaxart_field_calc_field_data(field,item_data,newContext);
					    	ajaxart_field_createCellControl(item_data,cntr,td,cntr.CellPresentation,field,cell_data,newContext);
					    	// fusion - if has inner table
					    	var inner_cntr = jQuery(td).find('.aa_container');
					    	if (inner_cntr.length > 0) // fusion
					    	{
					    		var inner_table_body = ajaxart_find_list_under_element(inner_cntr[0]);
					    		if (jQuery(inner_table_body).parent().hasClass('aatable'))
					    		{
					    			jQuery(td).addClass('td_of_embedded_table');
						    		// merge headers
						    		var parent_header = jQuery(ajaxart_find_aa_list(cntr)).parent().find('>thead');
					    			if (! parent_header[0].HeaderFusionDone)
					    			{
							    		parent_header.find('>tr>th').filter(function() { return this.fieldId != field.Id } ).attr('rowSpan','2');
							    		var new_tr = jQuery('<tr><th class="fieldtitle td_of_embedded_table"><table class="aa_inner_header"></table></th></tr>');
							    		new_tr.find('.fieldtitle')[0].Field = field;
							    		var orig_thead = jQuery(inner_table_body).parent().find('>thead');
							    		// cloning header
							    		var inner_thead = jQuery('<thead><tr></tr></thead>');
							    		var inner_tr = inner_thead.find('tr')[0];
							    		orig_thead.find('th').each(function() { 
							    					var inner_th = this.cloneNode(true);
							    					inner_th.Field = this.Field;
							    					inner_tr.appendChild(inner_th);
							    			} );
							    		inner_thead.find('th').slice(0,1).addClass('first');
							    		new_tr.find('.aa_inner_header')[0].appendChild(inner_thead[0]);
							    		parent_header[0].appendChild(new_tr[0]);
							    		parent_header[0].HeaderFusionDone = true;
					    			}
					    		}
					    	}
				    	}
				    	tr.appendChild(td);
				    }
		    	}
		    	if (item_aggregator) item_aggregator.push(tr);
				return tr;
		    }
		    cntr.wrapElement = function(data1,ctx2)
		    {
		    	var tr = document.createElement("TR");
		    	tr.className = "aa_item tablerow";
				tr.ItemData = item_data;
				tr.setAttribute("ColSpan", cntr.columns.length);
		    }
		}

		ajaxart_addScriptParam_js(aspect,'CreateContainer',createContainer,context);
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);

		return [aspect];
	  },
	  CustomItemControl: function (profile,data,context)
	  {
		  var aspect = { isObject : true };
		  aspect.InitializeContainer = function(initData,ctx)
		  {
			  var cntr = ctx.vars._Cntr[0];
			  cntr.CustomItemControl = function(data2,ctx2)
			  {
				  return ajaxart.run(data2,profile,'Control',aa_merge_ctx(context,ctx2));
			  }
		  }
		  return [aspect];
	  },
	  ShowTextWhenNoItems: function (profile,data,context)
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
	  TableNoItems: function (profile,data,context)
	  {
		var aspect = { isObject : true };
		function refresh(data1,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			if (cntr.GroupByUsingUIPref) return [];
			var body = jQuery(cntr.Ctrl).find('>.aatable>.aatable_tbody');
			if (body.length == 0) return [];
			jQuery(cntr.Ctrl).find('>.aatable').show();
			body.find('>tr.noitems').remove();
			if (body.find('>tr').length == 0)
			{
				if (aa_bool(data,profile,'HideTable',context))
				{
					jQuery(cntr.Ctrl).find('>.aatable').hide();
				}
				else
				{
					var no_items_text = aa_totext(cntr.DescriptionWhenNoItems(data,context));
					var no_items = jQuery('<tr class="noitems"><td colspan="' + cntr.columns.length + '" class="td_nocontent"><span>'+no_items_text+'</span></td></tr>');
					if (body.length > 0)
						body[0].appendChild(no_items[0]);
				}
			} else {
			}
		}
		aspect.PostAction = function(data1,ctx)
		{
			refresh(data1,ctx);
		}
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			cntr.DescriptionWhenNoItems = function() {
				return ajaxart_multilang_run(data,profile,'DescriptionWhenNoItems',context);
			}
			cntr.RegisterForPostAction(ctx._This);
			aa_register_handler(cntr,'ContainerChange',refresh);
		}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	  },
	  TableNoHeader : function (profile,data,context)
	  {
		var aspect = { isObject : true };
		aspect.PostAction = function(data1,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			if (cntr.GroupByUsingUIPref) return [];
			var table = ajaxart_find_aa_list(cntr);
			jQuery(table).parent().find('>thead').slice(0,1).addClass('hidden_header'); //.hide();
		};
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			cntr.RegisterForPostAction(ctx._This);
		}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	  },
	  Horizontal: function (profile,data,context)
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
	  MultipleColumns: function (profile,data,context)
	  {
		  var aspect = { isObject : true };
		  var initializeContainer = function(initData,ctx)
		  {
			  var cntr = ctx.vars._Cntr[0];
			  
			  cntr.createNewElement = function(item_data,item_aggregator,ctx2)
			  {
				  aa_prepare_calculated_fields_for_item(cntr.Fields,item_data,aa_merge_ctx(context,ctx2));
				  var cols = aa_int(data,profile,'Columns',context) + 0.0;
				  var fields = ajaxart_field_getFields(cntr,"property sheet");

				  var space = aa_text(data,profile,'Space',context),header = aa_text(data,profile,'HeaderSpace',context),footer=aa_text(data,profile,'FooterSpace',context);
				  var width = aa_text(data,profile,'PropertiesWidth',context);
				  
				  var colFields = [];
				  var index = -1;
				  var fieldsInCol = Math.ceil(fields.length / cols);
				  for(var i=0;i<fields.length;i++) {
					  if ( i % fieldsInCol == 0) {
						  colFields.push([]);
						  index++;
					  }
					  colFields[index].push(fields[i]);
				  }
				  var table = jQuery('<table class="aacolumns aa_item" cellspacing="0" cellpadding="0"><tbody><tr class="aacolumns_tr"/></tbody></table>')[0];
				  var tr = jQuery(table).find('.aacolumns_tr')[0];
				  tr.ItemData = item_data;

				  for(var i=0;i<colFields.length;i++) {
					  if (i>0)	{// adding gap column
						  var gap = document.createElement('td');
						  gap.className = 'aacolumns_gap';
						  gap.style.width = aa_text(data,profile,'Gap',context);
						  tr.appendChild(gap);
					  }
					  var td = document.createElement('td');
					  td.className = "aacolumns_td";
					  var inner = ajaxart_properties_and_sections(cntr,item_aggregator,item_data,profile,ctx2 || ctx,colFields[i],space,false,width,header,footer);
					  td.appendChild(inner);
					  tr.appendChild(td);
				  }
				  if (item_aggregator) item_aggregator.push(table);
				  return table;
			  }
		  }
		  ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		  return [aspect];
	  },
	  StretchToBottomRight: function (profile,data,context)
	  {
		  var aspect = { isObject : true };
		  aspect.InitializeContainer = function(initData,ctx)
		  {
			  var cntr = ctx.vars._Cntr[0];
			  cntr.RegisterForPostAction(this);
		  }		
		  aspect.PostAction = function(data1,ctx) {
			var cntr = ctx.vars._Cntr[0];
			var elem = cntr.Ctrl;
			var tab = aa_find_just_in_container(cntr,'.aa_tab_page');
			if (tab) { 
				elem = tab;
				if (! aa_bool(data,profile,'StretchToRight',context)) elem.style.paddingRight = "17px";
			}
			if (aa_bool(data,profile,'StretchToBottom',context)) {
				aa_stretchToBottom(elem,aa_int(data,profile,'MarginFromBrowserBottom',context));
			}
			if (aa_bool(data,profile,'StretchToRight',context)) {
				aa_stretchToRight(elem,aa_int(data,profile,'MarginFromBrowserRight',context));
			}
		  }
		  return [aspect];
	  },
	  AspectByXtml: function (profile,data,context)
	  {
		  var aspect = { isObject : true };
		  aspect.InitializeContainer = function(initData,ctx)
		  {
			  ajaxart.run(data,profile,'InitializeContainer',aa_merge_ctx(context,ctx));
		  }
		  return [aspect];
	  },
	  Group: function (profile,data,context)  // GC of uiaspect.Group
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
	  PropertySheet: function (profile,data,context)
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
	  BoxLayout: function (profile,data,context)
	  {
		  var aspect = { isObject : true };
		  aspect.InitializeContainer = function(initData,ctx)
		  {
			  var cntr = ctx.vars._Cntr[0];
			  if (!cntr.IsSingleItem) return; // todo: handle item list
			  
			  cntr.createNewElement = function(item_data,item_aggregator,ctx2)
			  {
				  var cntr = ctx.vars._Cntr[0];
				  var fields = ajaxart_field_getFields(cntr,"property sheet");
				  
				  var orient = aa_text(data,profile,'Orient',context).replace(' ','_');
				  var out = jQuery('<div class="aa_item aa_box_'+orient+'" />')[0]; 

				  for (var j=0;j<fields.length;j++) {
						var field = fields[j];
					    var cell_data = ajaxart_field_calc_field_data(field,item_data,ctx2);
						var field_div = document.createElement('div');
						out.appendChild(field_div);
				    	ajaxart_field_createCellControl(item_data,cntr,field_div,"control",field,cell_data,ctx2);
				  }
				  out.ItemData = item_data;
				  if (item_aggregator) item_aggregator.push(out);
				  return out;
			  }
		  }		 
		  return [aspect];
	  },
	  Vertical: function (profile,data,context)
	  {
		  var aspect = { isObject : true };
		  var initializeContainer = function(initData,ctx)
		  {
			  var cntr = ctx.vars._Cntr[0];
			  cntr.createNewElement = function(item_data,item_aggregator,ctx2)
			  {
				  var cntr = ctx.vars._Cntr[0];
				  var fields = ajaxart_field_getFields(cntr,"property sheet");
				  var space = aa_text(data,profile,'Space',context),header_space = aa_text(data,profile,'HeaderSpace',context),footer_space=aa_text(data,profile,'FooterSpace',context);
				  var align = aa_text(data,profile,'Align',context);
				  var hideTitle = true;
				  
				  var out = jQuery('<div class="aa_item"/>')[0];
				  if (header_space != "")
						jQuery(out).append(jQuery('<div style="height: '+ header_space +'"/>'));
				  for (var j=0;j<fields.length;j++) {
						if (j>0)
							jQuery(out).append(jQuery('<div style="height: '+ space +'"/>'));
						var field = fields[j];
					    var cell_data = ajaxart_field_calc_field_data(field,item_data,ctx2);
						var field_div = document.createElement('div');
						if (align != "")
							field_div.style.textAlign = align;
						out.appendChild(field_div);
				    	ajaxart_field_createCellControl(item_data,cntr,field_div,"control",field,cell_data,ctx2);
				  }
				  if (footer_space != "")
						jQuery(out).append(jQuery('<div style="height: '+ footer_space +'"/>'));
				  out.ItemData = item_data;
				  if (item_aggregator) item_aggregator.push(out);
				  return out;
			  };
		  }
		  ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		  return [aspect];
	  },
	  TitlesAboveFields: function (profile,data,context)
	  {
		  var aspect = { isObject : true };
		  var cssClass = aa_attach_global_css( aa_text(data,profile,'Css',context) , null, 'titles_above_fields' );
		  
		  var initializeContainer = function(initData,ctx)
		  {
			  ctx.vars._Cntr[0].createNewElement = function(item_data,item_aggregator,ctx2)
			  {
				  var cntr = ctx.vars._Cntr[0];
				  var fields = ajaxart_field_getFields(cntr,"property sheet");
				  var space_width = aa_text(data,profile,'SpaceWidth',context);
				  var table = jQuery('<table class="aa_item aa_titles_above_fields propertysheet" cellpadding="0" cellspacing="0"><tbody><tr class="aa_title_row"/><tr class="aa_fields_row"/></tbody></table>')[0];
				  jQuery(table).addClass(cssClass);
				  var titles_tr = jQuery(table).find("tr")[0];
				  var fields_tr = jQuery(table).find("tr")[1];
				  var add_colon =  aa_bool(data,profile,'AddColonForTitles',context);
				  for (var j=0;j<fields.length;j++) {
					  var field = fields[j];
					  aa_buildProperty(cntr,fields_tr,field,item_data,null,ctx2 || ctx,titles_tr,!add_colon);
					  if (j != fields.length-1 && space_width)
					  {
						  jQuery(titles_tr).append(jQuery('<td width="' + space_width + '" />'));
						  jQuery(fields_tr).append(jQuery('<td width="' + space_width + '" />'));
					  }
				  }
				  table.ItemData = item_data;
				  aa_handle_onload_validations(table);
				  
				  return table;
			  };
		  }
		  ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		  return [aspect];
	  },
	  TabControl: function (profile,data,context)
	  {
		  var aspect = { isObject : true };
		  aspect.InitializeContainer = function(initData,ctx) {
 		    var cntr = ctx.vars._Cntr[0];
 		    cntr.KeepSelectedTabIn = aa_first(data,profile,'KeepSelectedTab',context);
 		    
			cntr.createNewElement = function(item_data,item_aggregator,ctx2)
		    {
 		        var cntr = ctx.vars._Cntr[0];
 		        cntr.Style = aa_first(data,profile,'Style',context);
 		        var tabcontrol = aa_api_object(jQuery(cntr.Style.Html),{cntr: cntr, data: item_data, Tabs: []});
 		        aa_defineElemProperties(tabcontrol,'Fields,addTabs,cntr,Tabs,data,tabContents,tabsParent');
 		        tabcontrol.Fields = ajaxart_field_getFields(cntr,"tabs",item_data); 
 		        tabcontrol.addTabs = function(classOrElementForTab,classOrElementForTabContents,init_tab_func)
 		        {
 		        	var tabcontrol = this;
					var inner = this.getInnerElement(classOrElementForTab);
					tabcontrol.tabContents = this.getInnerElement(classOrElementForTabContents);
					if (!inner || !init_tab_func || !tabcontrol.tabContents) return;
					tabcontrol.tabsParent = inner.parentNode;
					
					for(var i=0;i<tabcontrol.Fields.length;i++) {
						var field = tabcontrol.Fields[i];
		 		    	if (!field.RefreshTabOnSelect) field.RefreshTabOnSelect = 'refresh';

						var tab = inner.cloneNode(true);
						tab.Field = field; tab.tabcontrol = tabcontrol;
						if (field.Id) jQuery(tab).addClass("tab_" + field.Id);
						tabcontrol.Tabs.push(tab);
						inner.parentNode.insertBefore(tab,inner);
						var tab_obj = aa_api_object(jQuery(tab),{ Field: field, data : tabcontrol.data, Title: field.Title, cntr: tabcontrol.cntr });
						aa_defineElemProperties(tab,'tab_obj,Select,tabcontrol,Field,Contents');						
						tab.tab_obj = tab_obj;
						tab_obj.Image = aa_init_image_object(field.SectionImage,item_data,context);
						var initEvents = function(tab) {
							tab.Select = function() {
								this.tab_obj.Select();
							}
							tab_obj.Select = function () {
								jBart.trigger(tab,'OnBeforeSelect',{});
					    		var jTab = jQuery(tab),cntr = ctx.vars._Cntr[0],field = tab.Field,tabcontrol = tab.tabcontrol; 
					    		// first run validations
					    		var current_cntr = jQuery(tabcontrol.tabContents).find('>.aa_container')[0];
					    		if ( current_cntr && ! aa_passing_validations(current_cntr) )
					    		  return aa_stop_prop(e);
					    		
					  		    var currentID = tab.Field.Id,prevTabField=[];
					  		    var currrentSelectedTab = jQuery(tabcontrol.tabsParent).find('>.aa_selected_tab')[0];
					  		    if (currrentSelectedTab) {
					  		      prevTabField = [currrentSelectedTab.Field];
					  		      if (cntr.BeforeChangeTab) cntr.BeforeChangeTab(prevTabField,context);
					  		      jQuery(currrentSelectedTab).removeClass('aa_selected_tab');
					  		    }
					  		    jTab.addClass('aa_selected_tab');
							    if (cntr.ID != "" && cntr.KeepSelectedTabIn && cntr.KeepSelectedTabIn.Set)
							    	cntr.KeepSelectedTabIn.Set([{Key: cntr.ID + "_tab" , Value: currentID }],context);
	
							    var cleanLeaks = true;
							    if (currrentSelectedTab && currrentSelectedTab.Field.RefreshTabOnSelect == 'no refresh' )
							    	cleanLeaks = false;
							    
							    aa_empty(tabcontrol.tabContents,cleanLeaks);
							    
					    		if (field.RefreshTabOnSelect == 'no refresh' && tab.Contents) {
					    			tabcontrol.tabContents.appendChild(tab.Contents);
					    		}
							    if (field.DoWhenUserClicksTab) field.DoWhenUserClicksTab([],context);
							    
					    		if (field.RefreshTabOnSelect == 'refresh' || ! tab.Contents) {
								    var field_data = ajaxart_field_calc_field_data(field,item_data,ctx2 || ctx);
							    	var control = ajaxart_runMethod(field_data,field,'Control',ctx2 || ctx);
									if (control.length > 0) {
										tabcontrol.tabContents.appendChild(control[0]);
										tab.Contents = control[0];
										aa_element_attached(control[0]);
									}
					    		}
				  		        if (cntr.AfterTabLoaded) cntr.AfterTabLoaded([tab.Field],aa_ctx(context,{PreviousTab: prevTabField}));
				  		        aa_fixTopDialogPosition();
								jBart.trigger(tab,'OnAfterSelect',{});
							}
						}
						initEvents(tab);
						init_tab_func(tab_obj);
					}
					tabcontrol.RefreshTabsVisibility = function(data2,ctx3) {
						for(var i=0;i<tabcontrol.Tabs.length;i++) {
							var tab = tabcontrol.Tabs[i];
							if (tab.Field.ShowTabOnCondition && !ajaxart.tobool_array(tab.Field.ShowTabOnCondition(data2,ctx3)))
								tab.style.display = 'none';
							else
								jQuery(tab).show();
						}
						jBart.trigger(tabcontrol, 'TabsChanged', {});
					}
					tabcontrol.RefreshTabsVisibility(item_data,ctx2);
					inner.parentNode.removeChild(inner);
 		        }
				aa_apply_style_js(tabcontrol,cntr.Style);
				tabcontrol.jElem.addClass( aa_attach_global_css(cntr.Style.Css) );
 		        
	 		    // select a tab
	 		    var tabs = tabcontrol.Tabs;
	 		    if (tabs.length > 0) {
	 		      var selectedTab = tabs[0];
	 		      if (cntr.KeepSelectedTabIn && cntr.KeepSelectedTabIn.Get) {
				      var currentID = aa_totext( cntr.KeepSelectedTabIn.Get([cntr.ID + "_tab"],context) );
		 		      for(var i=0;i<tabs.length;i++) {
		 		    	  if (currentID == tabs[i].Field.Id) selectedTab = tabs[i];
		 		      }
	 		      }
	 		      selectedTab.Select();
	 		    }
	 		    tabcontrol.jElem.addClass('aa_tabcontrol'); // for ChangeTab operation
	 		    tabcontrol.jElem[0].Cntr = cntr; // for ChangeTab operation
	 		    tabcontrol.jElem[0].TabControl = tabcontrol;
	 		    
		        if (item_aggregator) item_aggregator.push(tabcontrol.jElem[0]);
			    return tabcontrol.jElem[0];
		    }			  
		  }
		  return [aspect];
	  },
	  AlignRight: function (profile,data,context)
	  {
		var aspect = { isObject : true };
		var init = function(aspect) {
			aspect.InitializeContainer = function(data1,ctx) {
				var cntr = ctx.vars._Cntr[0];
				jQuery(cntr.Ctrl).addClass('aa_rightalign');
			}
		}
		init(aspect);
		
		return [aspect];
	  },
	  ItemText: function (profile,data,context)
	  {
		var aspect = { isObject : true };
		var useHtml = aa_bool(data,profile,'UsingHtmlElement',context);
		aspect.InitializeContainer = function(initData,ctx)
		{
			var cntr = context.vars._Cntr[0];  //  TODO: change to ctx
			if (!aa_bool(data,profile,'Secondary',context))
				ajaxart_addMethod(cntr,'ItemText',profile,'ItemText',context);
			var refresh = function(elems,ctx) {
				var elem = elems[0];
				var text = ajaxart.totext_array(ajaxart_runMethod(elem.ItemData,cntr,aa_ctx(ctx,{_ItemElement: [elem]})));
				jQuery(elem).find(">.aa_text").text(text);
			};
			if (useHtml) {
				refresh = function(elems,ctx) {
					var elem = elems[0];
					var text = ajaxart_runMethod(elem.ItemData,cntr,'ItemText',aa_ctx(ctx,{_ItemElement: [elem]}));
					if (useHtml && text[0] && text[0].nodeType && text[0].nodeType == 1) 
	  				  text = text[0]; // html
					else
					  text = aa_totext(text);
					
					jQuery(elem).find(">.aa_text").html(text);
				};
			}
			aa_register_handler(cntr,'RefreshItemTextAndImage', refresh);
		}		
		aspect.InitializeElements = function(initData,ctx)
		{
			var cntr = context.vars._Cntr[0]; // //  TODO: change to ctx
			var id = aa_text(data,profile,"ID",context);
			var cls = aa_text(data,profile,"Class",context);
			if (cls) cls = ' ' + cls;
			var elems = ctx.vars._Elems;
			if ( elems.length == 0 ) return [];
			ajaxart_addMethod(this,'ItemText',profile,'ItemText',context);
			for(var i=0;i<elems.length;i++)
			{
				var elem = elems[i];
				var text = this.ItemText(elem.ItemData,aa_ctx(ctx,{_ItemElement: [elem]}));
				if (useHtml && text[0] && text[0].nodeType && text[0].nodeType == 1) 
  				  text = text[0]; // html
				else
				  text = aa_totext(text);
				
				var span = document.createElement('span');
				span.className = "aa_text " + id + cls;
				span.setAttribute("tabindex",1);
				if (useHtml)
					jQuery(span).html(text);
				else
					jQuery(span).text(text);
				
				ajaxart_uiaspects_append(elem,span);
			}
		}
		return [aspect];
	},
	Indent: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var indentCss = aa_attach_global_css(aa_text(data,profile,'Css',context),null,'indented');
		
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			jQuery(cntr.Ctrl).find('.aa_list').addClass('aa_indented').addClass(indentCss);
			if (aa_bool(data,profile,"Lines",ctx))
				jQuery(cntr.Ctrl).addClass('aa_lined');
		}

		var initializeElements = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var elems = ctx.vars._Elems;
			if (aa_bool(data,profile,"Lines",ctx))
				for(var i=0;i<elems.length;i++)
				{
					var elem = jQuery(elems[i]);
					var hitarea = elem.find('>.hitarea');
					if (elem.nextAll('.aa_item').length == 0)
					{
						elem.addClass("last");
						hitarea.addClass("last");
					}
					else
					{
						elem.removeClass("last");
						hitarea.removeClass("last");
					}
				}
		}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		ajaxart_addScriptParam_js(aspect,'InitializeElements',initializeElements,context);
		return [aspect];
	},
	ExpandAllText: function (profile,data,context)
	{
		var isNewItem = false;
		if (context.vars.IsNewItem && ajaxart.totext_array(context.vars.IsNewItem) == "true")
			isNewItem = true;
		
		ajaxart_saveDetailsAndRefresh(context.vars._InnerItem,context.vars.ItemPage[0].Fields,context,function() {});
		var item = ajaxart.runNativeHelper(data,profile,'Elem',context);

		var tds = jQuery(item).find('>.aa_cell_element');
		for(var i=0;i<tds.length;i++)
			if (tds[i].expandableText)
				tds[i].expandableText.Build(tds[i].expandableText.States['control']);
		
		return [];
	},
	DisableSelection: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			if (aa_bool(data,prfile,'Disable',context))
				jQuery(cntr.Ctrl).addClass('aa_non_selectable');
			else
				jQuery(cntr.Ctrl).removeClass('aa_non_selectable');
		}
		
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	},
	InheritSelection: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			if (aa_bool(data,profile,'Inherit',context))
				jQuery(cntr.Ctrl).addClass('aa_inherit_selection');
			else
				jQuery(cntr.Ctrl).removeClass('aa_inherit_selection');
			return [];
		}
		
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	},
	TreeNode: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var createContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			cntr.Ctrl = jQuery('<ul style="list-style: none; padding:0; white-space: normal;" class="aa_container aa_list aa_inherit_selection"/>')[0];
			cntr.TreeNode = true;
			if (ctx.vars._ParentCntr && ! ctx.vars._ParentCntr.TreeNode)
				ctx.vars._ParentCntr[0].Tree = true;
		}
		
		ajaxart_addScriptParam_js(aspect,'CreateContainer',createContainer,context);
		return [aspect];
	},
	NextLevelsByFields: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			cntr.Tree = true;
		    cntr.createNewElement = function(item_data,item_aggregator,ctx2)
		    {
				var cntr = ctx.vars._Cntr[0];
				var li = document.createElement('li');
				li.className = "aa_item";
				li.ItemData = item_data;
		    	ajaxart_add_foucs_place(li);

				var fieldIds = ajaxart.run(item_data,profile, 'FieldIds', context);
				for(var i=0;i<fieldIds.length;i++)
				{
					var id = fieldIds[i];
					var field = aa_fieldById(id,cntr.Fields);
					if (field == null) {
						ajaxart.log("Can not find field '" + id +"'");
						continue;
					}
					var field_data = ajaxart_field_calc_field_data(field,item_data,ctx2 || ctx);
					ajaxart_field_createCellControl(item_data,cntr,li,'control',field,field_data,ctx2||ctx)
//					var ctrl = ajaxart.runScriptParam(field_data,field.Control,context)[0];
//					li.appendChild(ctrl);
				}
				
		    	if (item_aggregator) item_aggregator.push(li);
				return li;
		    };
		    cntr.next = function(elem,cntr) { return ajaxart_tree_next(elem,cntr) };
		    cntr.prev = function(elem,cntr) { return ajaxart_tree_prev(elem,cntr) };
		}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	},
	NextLevels: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			cntr.Tree = true;
		    cntr.createNewElement = function(item_data,item_aggregator,ctx2)
		    {
				var li = document.createElement('li');
				li.className = "aa_item";
				li.ItemData = item_data;
		    	ajaxart_add_foucs_place(li);

				var newContext = aa_merge_ctx(context,ctx2||ctx); 
				var innerContainer = ajaxart.runNativeHelper(item_data,profile,'InnerContainer',newContext);
				if (innerContainer.length > 0)
					li.appendChild(innerContainer[0]);
				
		    	if (item_aggregator) item_aggregator.push(li);
				return li;
		    };
		    cntr.next = function(elem,cntr) { return ajaxart_tree_next(elem,cntr) };
		    cntr.prev = function(elem,cntr) { return ajaxart_tree_prev(elem,cntr) };
		}
		ajaxart_addMethod_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	},
	
	NextLevelsLight: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			cntr.Tree = true;
			jQuery(cntr.Ctrl).find('.aa_listtop');
		    cntr.createFlatElement = function(item_data)
		    {
				var li = document.createElement('li');
				li.className = "aa_item";
				li.ItemData = item_data;
		    	ajaxart_add_foucs_place(li);
				
				return li;
		    };
		    cntr.createNewElement = function(item_data,item_aggregator,ctx2,depth,data_items)
		    {
		    	if (data_items == null) data_items = cntr.Items[0];
		    	if (depth == undefined) depth = cntr.DefaultDepth;
		    	var li = this.createFlatElement(item_data);
		    	var nextlevelItems = aa_first(item_data,profile,'NextLevel',aa_ctx(context,{_DataItems: [data_items] })); 
//		    	var nextlevelItems = ajaxart_runMethod(item_data,data_items,'NextLevel',context)[0];
		    	if (nextlevelItems)
				  this.buildNodesUnderElement(li,nextlevelItems,depth,item_aggregator,ctx2);
		    	if (item_aggregator) item_aggregator.push(li);
				return li;
		    };
		    cntr.insertNewElement = function(elem,parent)
		    {
		    	var ul = jQuery(ajaxart_find_list_under_element(parent));
		    	if (ul.length == 0)
		    	{
		    		ul = document.createElement('ul');
		    		ul.className = "aa_list";
		    		parent.appendChild(ul);
		    		ul.appendChild(elem);
		    	}
		    	else
		    		ul[0].appendChild(elem);
		    };
		    cntr.buildNodesUnderElement = function(elem,data_items,depth,item_aggregator,ctx2) 
		    {
		    	if (depth == 0) return;
		    	if (data_items != null) // && data_items.Items.length > 0)
		    	{
		    		var ul = document.createElement('ul');
		    		ul.className = "aa_list aa_treenode aa_items_listener";
		    		ul._Items = data_items;
		    		aa_defineElemProperties(ul,'RefreshAfterItemsChanged');
		    		ul.RefreshAfterItemsChanged = function() {
		    			aa_remove(this,true); 
		    			var cntr = ctx.vars._Cntr[0]; 
		    			cntr.buildNodesUnderElement(elem,data_items,depth,item_aggregator,ctx2);
		    			var newcontext = aa_ctx(ctx2 || ctx,{_Elems: jQuery(elem).find('>.aa_list .aa_item').get() });
		    			for(var i=0;i<cntr.Aspects.length;i++)
		    		    	ajaxart_runMethod([],cntr.Aspects[i],'InitializeElements',newcontext)
		    		}
		    		elem.appendChild(ul);
					for(var i=0;i<data_items.Items.length;i++)
					{
						var child = data_items.Items[i];
				    	var li = this.createNewElement([child],item_aggregator,ctx2,depth-1,data_items);
				    	ul.appendChild(li);
					}
		    	}
		    };
		    cntr.next = function(elem,cntr) { return ajaxart_tree_next(elem,cntr) };
		    cntr.prev = function(elem,cntr) { return ajaxart_tree_prev(elem,cntr) };
	  		var expandLevel = aa_text(data,profile, 'ExpandLevel', ctx);

	  		if (!cntr.DefaultDepth) {
		  		cntr.DefaultDepth = 1;
				if (expandLevel == "root level") cntr.DefaultDepth = 1;
				else if (expandLevel == "first level") cntr.DefaultDepth = 2;
				else if (expandLevel == "all") cntr.DefaultDepth = 17;
	  		}
		}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	},
	MaxTreeDepth: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var depth = aa_int(data,profile,'Depth',context);
			if (depth > 0) 
				cntr.DefaultDepth = depth;
		}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	},
	Shortcuts: function (profile,data,context)
    {
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			cntr.ShortcutsEnabled = ["true"];
			var shortcut_matchs_event = ajaxart_shortcut_matchs_event(); // returns a function. used to initializes constants.
			var handleShortcutsFunc = function(cntr) { return function(e)
			{
				// prevent the browser scroll bar from moving. dangerous code for html primitive tags (e.g. input)
				var selection_codes = [32,33,34,35,36,37,38,39,40, 63277,63276];
				for(var i=0;i<selection_codes.length;i++)
					if (e.keyCode == selection_codes[i]) {
						ajaxart_stop_event_propogation(e);
						break;
					}
				
			    var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  ); 
			    if (elem.filter(':input,:radio,:checkbox').length > 0) return true;
	  		    if (elem.hasClass("aa_item"))
	  		    	var item_elem = elem;
	  		    else
	  		    	var item_elem = elem.parents('.aa_item').slice(0,1);
	  		    
		    	var cntrs = elem.parents('.aa_container').filter(function() { return !this.Cntr.TreeNode; } );
		    	if (cntrs.length == 0 || cntrs[0].Cntr != ctx.vars._Cntr[0]) return true;
				var cntr = ctx.vars._Cntr[0];
	
				var ops = ajaxart_runMethod([],cntr,'Operations',cntr.Context);
				for(var i=0;i<ops.length;i++)
				{
					var op = ops[i];
					if (op.Shortcut != null)
					{
						if (shortcut_matchs_event(op.Shortcut,e))
						{
							var item_data = item_elem[0].ItemData;
	  	  	    			var newContext = aa_ctx(ctx, 
  	    					{	_Cntr: [cntr], 
  	    						 ControlElement : [elem[0]],
  	    						_ItemsOfOperation: item_data,
  	    						_ElemsOfOperation: [item_elem[0]] });
							ajaxart_runMethod(item_data,op,'Action',newContext);
						}
					}
		  	    }
		  	    return true; 
			}}
			var cntr = ctx.vars._Cntr[0];
			ajaxart.ui.bindEvent(aa_find_list(cntr),'keydown',handleShortcutsFunc(cntr));
		}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
    },
    OnDoubleClick: function (profile,data,context)
    {
	var aspect = { isObject : true };
	var initializeContainer = function(initData,ctx)
	{
		var cntr = ctx.vars._Cntr[0];
		var runOperation = function(elem)
		{
			if (elem.length == 0) return;
			var item = elem[0].ItemData;
	    	var newContext = aa_ctx (ctx,{ _ItemsOfOperation: item, _ElemsOfOperation: elem.get(), ControlElement: elem.get() });
	    	ajaxart.run(item,profile,'Action',newContext);
		}
  		var keyHit = function (e)
  		{
	  	    if (e.keyCode == 13 && !e.ctrlKey && !e.altKey && !e.shiftKey)
	  	    {
	  	    	var cntr = ctx.vars._Cntr[0];
	  	    	var elem = jQuery(cntr.Ctrl).find('.aa_selected_item').slice(0,1);
	  		    if (elem.length > 0)
	  		    	runOperation(elem);	
	  	    }
  		};
  		var dblClick = function (e)
  		{
		    var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  );
		    var item_elem  = jQuery([]);
		    if (elem.hasClass("aa_item"))
		    	item_elem = elem;
		    else if (elem.parent().hasClass("aa_item"))
		    	item_elem = elem.parent();
	
  		    if (item_elem.length > 0)
  		    	runOperation(item_elem);	
  		};
  		ajaxart.ui.bindEvent(cntr.Ctrl,'keyup',keyHit);
  		ajaxart.ui.bindEvent(cntr.Ctrl,'dblclick',dblClick);
	}
	ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
	return [aspect];
    },
	ExpandCollapse: function (profile,data,context)
	{
		var hitAreaCssClass = aa_attach_global_css( aa_text(data,profile,'HitAreaCss',context),null,'hitarea');
		var aspect = { isObject : true };
		var itemSelectionCssClass = aa_attach_global_css(aa_first(data,profile,'Css',context).Css);
  		
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			cntr.IgnoreItemSelectionCssClass = true;
			cntr.hitAreaCssClass = hitAreaCssClass;
			cntr.CollapseElem = function (elem,collapse)
	  		{
				if (!elem) return;
	 			var uls = elem.find('>.aa_list,>.aa_container');
	 			if (uls.length == 0) return;
  				if (elem.find('>.hitarea').length == 0 && elem.find('>.aa_list>.aa_item').length > 0) {
				  var hitarea = document.createElement('div');
				  hitarea.className = "hitarea expandable " + hitAreaCssClass;
				  elem[0].insertBefore(hitarea,elem[0].firstChild);
		  		}

	 			if (collapse == null)
	  			{
	  				elem[0].collapsed = ! elem[0].collapsed;
	  				collapse = elem[0].collapsed;
	  			}
	  			else
	  				elem[0].collapsed = collapse;

	 			for(var i=0;i<uls.length;i++)
	 			{
		 			var ul = uls[i];
					var hitarea = elem.find('>.hitarea').slice(0,1);
					if (elem[0].collapsed && jQuery(ul).find('.aa_item').length > 0) // a ul fitout items is always expanded (for drag and drop purposes) 
					{
						ul.style.display = 'none';
						ul.display = 'none';
						hitarea.addClass("expandable");
						hitarea.removeClass("collapsable");
					}
					else
					{
						ul.style.display = 'block';
						ul.display = 'block';
						hitarea.addClass("collapsable");
						hitarea.removeClass("expandable");
					}
	 			}
	 			aa_invoke_cntr_handlers(cntr,cntr.RefreshItemTextAndImage,elem,ctx);
	  		}
	  		cntr.CollapseSiblings = function (data1,ctx)
		    {
	  			var elem = jQuery(data1);
		    	var other_elems = elem.parent().find('.aa_item').filter(function(){ return elem[0] != this });
		    	other_elems.each( function() { 
		    		cntr.CollapseElem(jQuery(this),true);
		    	} );
		    }

	  		cntr.ToggleByKeyboard = function (e)
	  		{
		  	    if (e.keyCode == 39 || e.keyCode == 37)  // right - expand
		  	    {
		  		    var cntr = ctx.vars._Cntr[0];
		  		    var item_elem = jQuery(cntr.Ctrl).find('.aa_selected_item').slice(0,1);
		  		    if (item_elem.length == 0) return true; 
		  		    
		  	    	var expand = (e.keyCode == 39);
		  	    	if (item_elem.parents('.right2left').length>0)
		  	    		expand = ! expand;

		  	    	if (expand && item_elem[0].collapsed || (!expand && ! item_elem[0].collapsed) )
		  	    		cntr.CollapseElem(item_elem);
		  	    	return false;
	  	        }
	  	  	    return true;
	  		}
			var toggleByClick = function (e)
	  		{
				var cntr = ctx.vars._Cntr[0];
			    var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  );  

	  		    if (! (elem.hasClass("hitarea") || elem.hasClass("aa_item_image") || aa_bool(data,profile,'TextInHitArea',context) )) return true;
	  		    // important - otherwise parent cntrs will expand/collapse it again.
			    if (elem.parents('.aa_container')[0].Cntr != cntr) 
			    	return true;

		    	var item_elem = elem.parents('.aa_item').slice(0,1);
			    cntr.CollapseElem(item_elem);
			    return false;
	  		};

	  		var collapseLevel = aa_text(data,profile,'CollapseLevel',context);
			var collapseFirstLevels = function(initData,ctx2)
			{
				var cntr = ctx.vars._Cntr[0];
				var elems = jQuery(ajaxart_container_elems(cntr)); //.filter(aa_visible);
				elems.each(function() { 
					cntr.CollapseElem(jQuery(this),true); 
				});
				if (collapseLevel == 'first') // open first level
				{
					var first_level = function() 
					{ 
						var jcntr = jQuery(this).parents('.aa_item').slice(0,1).parents('.aa_container');
						return jcntr.length == 0 || jcntr[0].Cntr != cntr; 
					}
					elems.filter(first_level).each(function() { 
						cntr.CollapseElem(jQuery(this),false); 
					});
				}
			}
			if (collapseLevel != 'expand all')
			{
				ctx.vars._Cntr[0].RegisterForPostAction(ctx._This);
				ajaxart_addScriptParam_js(ctx._This,'PostAction',collapseFirstLevels,ctx);
			}

	  		ajaxart.ui.bindEvent(aa_find_list(cntr),'keyup',cntr.ToggleByKeyboard);
			ajaxart.ui.bindEvent(cntr.Ctrl,'click',toggleByClick);
		}
		var initializeElements = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var elems = ctx.vars._Elems;
			for(var i=0;i<elems.length;i++)
			{
				var elem = elems[i];
				jQuery(elem).addClass(itemSelectionCssClass);
				if (!ajaxart_isLeaf(elem))
				{
					jQuery(elem).addClass('non_leaf');
					elem.collapsed = false;
					
					var hitarea = document.createElement('div');
					hitarea.className = "hitarea collapsable " + hitAreaCssClass;
					elem.insertBefore(hitarea,elem.firstChild);
				}
			};
		};

		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		ajaxart_addScriptParam_js(aspect,'InitializeElements',initializeElements,context);
		return [aspect];
	},
	ItemImage: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var itemImageCss = aa_attach_global_css( aa_text(data,profile,'Css',context) , context, 'item_image');
		
		aspect.InitializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			ajaxart_addMethod(cntr,'ItemImage',profile,'ItemImage',context);
		}
		var initializeElements = function(initData,ctx)
		{
			if (aa_bool(data,profile,'CapabilitiesOnly')) return;
			var cntr = ctx.vars._Cntr[0];
			var elems = ctx.vars._Elems;
			var compiledFunc = ajaxart.compile(profile,'ItemImage',ctx);
			var imageForLeafs = aa_text(data,profile,'ImageForLeafs',ctx);

			for(var i=0;i<elems.length;i++)
			{
				var elem = elems[i];
				if (jQuery(elem).find('>.aa_item_image').length) continue;

				var ctx2 = aa_ctx(ctx,{_ItemElement: [elem]});
				var image = "";
				var isLeaf = ajaxart_isLeaf(elem);
				if (imageForLeafs == 'none' && isLeaf) continue;
				if (imageForLeafs != '' && isLeaf) 
					image = imageForLeafs;
				else if (compiledFunc == "same") 
					image = ajaxart.totext_array(elem.ItemData);
				else if (compiledFunc == null)
					image = aa_text(elem.ItemData,profile,"ItemImage",ctx2);
				else
					image = ajaxart.totext_array(compiledFunc(elem.ItemData,ctx2));
				if (image == "") continue;
				var newElem = document.createElement('img');
				newElem.className = "aa_item_image " + itemImageCss;
				newElem.setAttribute("src",image);
				newElem.setAttribute("height","16px");
				newElem.style.maxWidth = '26px';

				ajaxart_uiaspects_append(elem,newElem);
			}
		}
		ajaxart_addScriptParam_js(aspect,'InitializeElements',initializeElements,context);
		return [aspect];
	},
	  CheckBox: function (profile,data,context)
	  {
		var aspect = { isObject : true };

		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];

			cntr.ToogleCheckbox = function(ctx,item_elem)
	  		{
				var cntr = ctx.vars._Cntr[0];
				var item_data = item_elem[0].ItemData;
	  			var selector = cntr.Selector;
	  			var newContext = aa_ctx(ctx,{ControlElement: [cntr.Ctrl], _Item: item_data, _Elem : item_elem });
	  			if (selector != null)
	  				ajaxart.run(item_data,selector.Toggle.script, '', selector.Toggle.context);
				ajaxart.run(item_data,profile, 'OnSelect', newContext);
	  		};

			var checkboxClicked = function (e)
 	  		{
				var cntr = ctx.vars._Cntr[0];
			    var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  );  
 			    if (! elem.hasClass('aacheckbox_value')) return;

 			    var item_elem = elem.parents('.aa_item').slice(0,1);
 			    if (aa_bool(data,profile, 'SelectOnCheck', context))
 			    	ajaxart_uiaspects_select(item_elem,jQuery(),"mouse",ctx);
 			    cntr.ToogleCheckbox(ctx,item_elem);
 			    if (ajaxart.controlOfFocus != null) // give the focus back
  	  	    		jQuery(ajaxart.controlOfFocus).focus();

 				return true;
 	  		};

 	  		var onkeyup = function(e) { 
				var cntr = ctx.vars._Cntr[0];
  				var selectWithEnter = aa_bool(data,profile, 'SelectWithEnter', ctx);
	  	        if (e.keyCode == 32 || (selectWithEnter && e.keyCode == 13) )  // Spacebar or Enter
	  	        {
				    var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  );  

	  			    if (elem.hasClass('aa_item'))
	  			    	var item_elem = elem;
	  			    else
	  			    	var item_elem = elem.parents('.aa_item').slice(0,1);
	  			    var checkbox = item_elem.find('>.aacheckbox_value');
	  	        	if (checkbox.length > 0)
	  	        	{
	  	        		aa_checked(checkbox[0], ! checkbox[0].checked) ;
	  	 			    cntr.ToogleCheckbox(ctx,item_elem);
	  	        	}
  	        	return false;
	  	        }
	  	  	    return true;
			  }
			
			ajaxart.ui.bindEvent(cntr.Ctrl,'keyup',onkeyup);
			ajaxart.ui.bindEvent(cntr.Ctrl,'click',checkboxClicked);

			var selector = aa_first(data,profile, 'Selector', ctx);
			cntr.Selector = selector;
		}
		var initializeElements = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var elems = ctx.vars._Elems;
			var selector = aa_first(data,profile, 'Selector', ctx);
			var includeIntermediateNodes = aa_bool(data,profile, 'IncludeIntermediateNodes', ctx);
			
			for(var i=0;i<elems.length;i++)
			{
				var elem = elems[i];
				var use_checkbox = ajaxart_isLeaf(elem) || includeIntermediateNodes;
		
				if (use_checkbox && selector != null)
				{
						var input = document.createElement('input');
						input.className = "aacheckbox_value";
						input.setAttribute("type","checkbox");
						if (selector.IsSelected != undefined && aa_bool(elem.ItemData,selector.IsSelected.script, '', selector.IsSelected.context))
							aa_checked(input,true);
						ajaxart_uiaspects_append(elem,input);
				}
			}
		};
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		ajaxart_addScriptParam_js(aspect,'InitializeElements',initializeElements,context);
		return [aspect];
	  },
	ContextMenu: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			  var openContextMenu = function(e) {
				  	e = e || event;
				    if (e.button != 2) return true;
				 
					var cntr = ctx.vars._Cntr[0];
				    var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  );  

					if (! elem.hasClass("aa_item"))
						elem = elem.parents(".aa_item").slice(0,1);
				    if (elem.length == 0) return true;
				    // check that elem is of the same container
				    if (elem.parents('.aa_container')[0].Cntr != cntr) 
				    	return true;
				    var item_data = elem[0].ItemData;
	
				    // select first
//				    var selected = jQuery(cntr.Ctrl).find(".aa_selected_item");
//				    ajaxart_uiaspects_select(elem, selected,"uiaction",ctx);

  	  	    		var newContext = aa_ctx( cntr.Context, {
  	  	    			_CurrentFocus: [elem.find('>.aa_text')[0]], 
  	  	    			_ItemsOfOperation: item_data, 
  	  	    			_ElemsOfOperation: [elem[0]],
  	  	    			MousePos: [ { isObject: true, pageX: e.pageX || e.clientX, pageY: e.pageY || e.clientY} ],
  	  	    			_RefreshAfterOperation : aa_text(data,profile, 'RefreshAfterOperation', ctx)
  	  	    			 });

  	  	    		ajaxart.runNativeHelper(item_data,profile,'ContextMenuImp',newContext);
				    return false;
				  };
		    var top = ajaxart_find_aa_list(cntr);

		    jQuery(top).bind('contextmenu', function() { return false; });
			ajaxart.ui.bindEvent(top,"mouseup",openContextMenu);
		}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	},
	HeaderFooter: function (profile,data,context)
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
	SeparatorControl: function (profile,data,context)
	{
		var aspect = {isObject:true};
		aa_set_initialize_container(aspect,function(aspect,ctx,cntr) {
			cntr.SeparatorControl = function(data1,ctx) {
				return ajaxart.run(data1,profile,'Control',aa_merge_ctx(context,ctx));
			}
		});
		return [aspect];
	},
	ItemSelection: function (profile,data,context)
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
	BindSelectedItem: function (profile,data,context)
	{
		var aspect = { isObject : true };
		aspect.InitializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			cntr.DefaultIdentifier = aa_text(data,profile,'SelectedIdentifier',context);
			if (!cntr.DefaultIdentifier) return;
			cntr.FilterOnFirstSelected = function(data1,ctx) {
				var id = aa_text(data1,profile,'ItemIdentifier',context);
				if (id == cntr.DefaultIdentifier) return ['true'];
			}
		}
		return [aspect];
	},
	TreeSelectedInUrl: function (profile,data,context)
	{
		var aspect = { isObject : true };
		aspect.InitializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var selectionChanged = function(selected_elem,ctx)
			{
				var cntr = ctx.vars._Cntr[0];
				if (aa_totext(cntr.ID)=="") return;
				var url = "?" + aa_totext(cntr.ID) + "_path=";
				var path = "";
				var jElem = jQuery(selected_elem);
				while (! jElem.hasClass('aa_container')) {
					if (jElem.hasClass('aa_item')) {
						var text = jElem.find('.aa_text')[0].innerHTML;
						text = text.replace(new RegExp(' \\([0-9]*\\)', "g"), '');   // turn pages (3) to pages
						if (path != "") path = '/' + path;
						path = text + path;
					}
					jElem = jElem.parent();
				}
				url += path;
				aa_urlChange(context,url);
			}
			aa_register_handler(cntr,'Selection', selectionChanged);
			cntr.RegisterForPostAction(this);
		}
		aspect.PostAction = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			if (aa_totext(cntr.ID)=="") return;
			var path = aa_urlAttribute(context,aa_totext(cntr.ID) + "_path");
			if (path == "") return;
			var parts = path.split('/');
			var jList = jQuery(aa_find_list(cntr));
			var item = null;
			
			for (var i=0;i<parts.length;i++) {
				var part = parts[i];
				var items = jList.find('>.aa_item>.aa_text');
				item = null;
				for(var j=0;j<items.length;j++) {
					var itemtext = items[j].innerHTML;
					itemtext = itemtext.replace(new RegExp(' \\([0-9]*\\)', "g"), '');   // turn pages (3) to pages
					if (itemtext == part) {
						item = items[j].parentNode;
						cntr.CollapseElem(jQuery(item),false); // make sure it is expanded
						break;
					}
				}
				if (!item) return;
				jList = jQuery(item).find('>.aa_list');
			}
			if (!item) return;
			cntr.Select(jQuery(item),jQuery([]),"auto",ctx,true);
		}
		return [aspect];
	},
	SynchSelection: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var selector = aa_first(data,profile,"Selector",ctx);
			if (selector != null)
				cntr.SoftSelector = selector;
			
			if (ajaxart.fieldscript(profile,'ItemID',true) != null)
			{
				cntr.ItemId = function(item,element)
				{
					var newContext = aa_ctx(context,{'ItemElement': [element]});
					return aa_text(item,profile,"ItemID",newContext);
				} 
			}
		}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	},
	SynchSelectionWithItemDetails: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var selectionChanged = function(selected_elem,ctx)
			{
				var cntr = ctx.vars._Cntr[0];
				var newContext = aa_ctx(ctx,{ _InnerItem: selected_elem.ItemData , _ElemsOfOperation: [selected_elem]});

			    ajaxart.runScriptParam(selected_elem.ItemData,cntr.OpenItemDetails,newContext);
			}
			aa_register_handler(cntr,'Selection', selectionChanged);
		}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	},
	DoOnSelection: function (profile,data,context)
	{
		var aspect = { isObject : true };
		aspect.InitializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			cntr.SelectionChangeOnTimer = aa_bool(data,profile,'DoOnNextTimer',context);
			
			var selectionChanged = function(selected_elem,ctx2)
			{
				var cntr = ctx.vars._Cntr[0];
				if (cntr.SelectionChangeOnTimer) {
					setTimeout(function() {
						ajaxart.run(selected_elem.ItemData,profile,'Action',aa_merge_ctx(context,ctx2));
					},200);
					return;
				}
				ajaxart.run(selected_elem.ItemData,profile,'Action',aa_merge_ctx(context,ctx2));
			}
			aa_register_handler(cntr,'Selection', selectionChanged);
		}
		return [aspect];
	},
	SynchSelectionWithAnotherPresentation: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var selectionChanged = function(selected_elem,ctx)
			{
				var cntr = ctx.vars._Cntr[0];
				var newContext = aa_ctx(ctx,{ _InnerItem: selected_elem.ItemData , _ElemsOfOperation: [selected_elem]});
				var cntr_ctrl = jquery('.aa_container.fld_'+aa_text(data,profile,'FieldID',context))[0];
				if (cntr_ctrl)
				{
					var cntr = cntr_ctrl.Cntr;
					if (cntr && cntr.Select)
						cntr.Select(jQuery(item),jQuery([]),"auto",ctx,true);
				}

			    ajaxart.runScriptParam(selected_elem.ItemData,cntr.OpenItemDetails,newContext);
			}
			aa_register_handler(cntr,'Selection', selectionChanged);
		}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	},
	HighlightSelectionOnHover: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			  var onmouseover = function(e) {
					var cntr = ctx.vars._Cntr[0];
					var elem = (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement);
					
					var new_selected = jQuery([]),top_cntr = null;
					for(;elem;elem = elem.parentNode) {
						if (jQuery(elem).hasClass('aa_item')) new_selected = jQuery(elem);
						if (elem.Cntr == cntr) {
							top_cntr = elem.Cntr; 
							break;
						}
					}
		  	  	    if (new_selected.length > 0 && top_cntr && !new_selected.hasClass('aa_selected_item'))
		  	  	    {
			  	    	var top_cntr_list = ajaxart_find_aa_list(top_cntr);

		  	  	    	jQuery(top_cntr_list).find('.aa_selected_item').removeClass("aa_selected_item");
			  	    	jQuery(top_cntr_list).find('.aa_selected_itemtext').removeClass("aa_selected_itemtext");

		  	  	    	new_selected.addClass("aa_selected_item");
		  	  	    	if (! top_cntr.IgnoreItemSelectionCssClass)
		    	  	    	  new_selected.addClass(top_cntr.ItemSelectionCssClass);

		  	  	    	new_selected.find('>.aa_text').addClass("aa_selected_itemtext");
		  	  	    	jBart.trigger(top_cntr,'selection',{selected: new_selected[0], context: ctx, method: 'hover'});
		  	  	    	ajaxart.run(new_selected[0].ItemData,profile,'Action',aa_ctx(ctx,{_ItemsOfOperation: new_selected[0].ItemData, _ElemsOfOperation: new_selected , method: ['hover']}))
		  	  	    }
		  	  	    return true;
			  }
			
			  // aa list may be replaced in cntrs - table should work in container generation
			  var cntr = ctx.vars._Cntr[0];
			  var cntr_list = ajaxart_find_aa_list(cntr);
			  if (! cntr.HighlightSelectionOnHover) { // avoid duplicates
				  ajaxart.ui.bindEvent(cntr_list,'mouseover', onmouseover);
				  cntr.HighlightSelectionOnHover = true;
			  }
		}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	},
	CellPresentation: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			cntr.CellPresentation = aa_text(data,profile,'Content',ctx);
		}
		
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	},
	SaveDetailsAndRefersh: function (profile,data,context)
	{
		var item = ajaxart.run(data,profile,'Item',context);
		ajaxart_saveDetailsAndRefresh(item,context.vars.ItemPage[0].Fields,context);
		return [];
	},
	ItemDetails: function (profile,data,context)
	{
		var aspect = { isObject : true , ItemDetails : true};
		var init = function(aspect) {
		aspect.InitializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var mctx = aa_merge_ctx(context,ctx);
			
			if (aa_paramExists(profile,'ItemPage'))
				cntr.ItemPage = aa_first(data,profile,'ItemPage',mctx);
			else if (! cntr.ItemPage)
				cntr.ItemPage = ajaxart.runNativeHelper(data,profile,'DefaultItemPage',mctx)[0];

			if (aa_paramExists(profile,'OpenIn'))
				cntr.OpenIn = function(data2,ctx2) { return ajaxart.run(data2,profile,'OpenIn',aa_merge_ctx(context,ctx2)); }
			else if (! cntr.OpenIn) {
				cntr.OpenIn = function(data2,ctx2) { return ajaxart.runNativeHelper(data2,profile,'DefaultOpenIn',aa_merge_ctx(context,ctx2)); };
			}
			
			if (aa_paramExists(profile,'NewItemPage'))
				cntr.NewItemPage = aa_first(data,profile,'NewItemPage',mctx);
			else if (! cntr.NewItemPage)
				cntr.NewItemPage = cntr.ItemPage;
			
			if (aa_paramExists(profile,'OpenNewIn'))
				cntr.OpenNewIn = function(data2,ctx2) { return ajaxart.run(data2,profile,'OpenNewIn',aa_merge_ctx(context,ctx2)); }
			else if (! cntr.OpenNewIn) {
				cntr.OpenNewIn = function(data2,ctx2) { return ajaxart.runNativeHelper(data2,profile,'DefaultOpenIn',aa_merge_ctx(context,ctx2)); };
			}

			if (aa_paramExists(profile,'Transactional',true))
			  cntr.EditTransactional = aa_bool(data,profile,'Transactional',mctx);
			else if (cntr.EditTransactional == null) cntr.EditTransactional = ["true"];
			
			cntr.ItemDetailsControl = function(data3,ctx)
			{
				var cntr = ctx.vars._Cntr[0];
				var page_params = {isObject:true, DataItems: ctx.vars._InnerItems , ReadOnly: cntr.ReadOnly }
				var newContext = aa_ctx(ctx,{ _PageParams: [page_params] });
				var page = aa_tobool(ctx.vars.IsNewItem) ? cntr.NewItemPage : cntr.ItemPage; 
			    var control = ajaxart_runMethod(data3,page,'Control',newContext);
			    if (control.length == 0) control = [document.createElement('div')];
				jQuery(control[0]).addClass('DetailsControl');
				control[0].Context = ctx;  // for master-detail...saving when changing selection
				control[0].ItemData = ctx.vars._InnerItem; // for master-detail...saving when changing selection
					
				return control;
			}
			
			cntr.OpenItemDetails = function(data,ctx)
			{
				var originalItems = data;
				var dataitems = ctx.vars._Cntr[0].Items[0];
				var newContext = aa_ctx(ctx,{ _Transactional: aa_frombool(cntr.EditTransactional) });
				if (aa_tobool(ctx.vars.IsNewItem)) {
					var subset = newContext.vars._InnerItems = ajaxart_runMethod(data,dataitems,'SubsetForNewItem',newContext);
					var info = aa_getXmlInfo(subset[0].Items[0],context);

					if (ctx.vars._SaveActions && ctx.vars._SaveActions[0].BeforeEdit)
						ctx.vars._SaveActions[0].BeforeEdit([subset[0].Items[0]],ctx);
				}
				else {
					var subset = newContext.vars._InnerItems = ajaxart_runMethod(data,dataitems,'Subset',newContext);
					if (subset.length == 0) {
					  subset = newContext.vars._InnerItems = [{ isObject: true , Items: newContext.vars._InnerItem }];
					  subset[0].Save = function(data2,ctx2) { 
					    var info = aa_getXmlInfo(this.Items[0],context);
						if (info.Save) return info.Save(data2,ctx2);
					  }
					}
					var info = aa_getXmlInfo(subset[0].Items[0],context);
					if (info && info.PrepareForEdit && ! jQuery(ctx.vars._ElemsOfOperation).hasClass('aa_details_open'))  
						info.PrepareForEdit([],ctx);
				}
				if (subset.length == 0) return []; 

				var openCtrl_func = function(subset,originalItems) { return function() 
				{
					var cntr = ctx.vars._Cntr[0];
					if (cntr.BeforeOpenDetails)
						cntr.BeforeOpenDetails(subset.Items,ctx);

					var newContext = aa_ctx(ctx,{ _InnerItems: [subset] , _Transactional: aa_frombool(cntr.EditTransactional) , OriginalItems: originalItems });
					var itemDetailsObj = { isObject: true }
					var page = aa_tobool(ctx.vars.IsNewItem) ? cntr.NewItemPage : cntr.ItemPage;
					var info = aa_getXmlInfo(subset.Items[0],context);
					aa_init_itemdetails_object(itemDetailsObj,originalItems,info,subset,page,ctx);

					newContext.vars._ItemDetailsObject = [ itemDetailsObj ];
					newContext.vars.DetailsControl = cntr.ItemDetailsControl(subset.Items,newContext);
					
					var innercntr = aa_html_findclass(newContext.vars.DetailsControl,'aa_container');
					if (innercntr.length >0) innercntr[0].Cntr.IsNewItem = aa_tobool(ctx.vars.IsNewItem);
						
					var page = aa_tobool(ctx.vars.IsNewItem) ? cntr.NewItemPage : cntr.ItemPage; 
					newContext.vars.ItemPage = [page];
					
					ajaxart.run(subset.Items,profile,'ChangeItemBeforeOpen',context);
					
					if (aa_tobool(ctx.vars.IsNewItem))
					  return cntr.OpenNewIn(subset.Items,newContext);
					else
					  return cntr.OpenIn(subset.Items,newContext);
				}};

				if (aa_bool(data,profile,'KeepOpenItemInUrl',context) && cntr.ID != "") {
					var id = aa_text(data,profile,'ItemIdentifier',context);
					aa_urlChange(context,"?"+cntr.ID+"_open="+id+";");
				}
				var prepareAndOpen = function(subset,info) {
					aa_runMethodAsync(subset[0],subset[0].Prepare,data,ctx,function() {
						if (aa_bool(data,profile,'FullLoadItem',context) && info && info.LoadFullItem )
							  aa_runMethodAsync(info,info.LoadFullItem,data,ctx,openCtrl_func(subset[0],data));
							else
							  openCtrl_func(subset[0],data)();
					});
				}
				prepareAndOpen(subset,info);
				
				return ["true"];
			}

			cntr.Transactional = aa_bool(data,profile,'Transactional',context);
			ajaxart_addMethod(cntr,'ItemIdentifier',profile,'ItemIdentifier',context);
				
			if (aa_bool(data,profile,'KeepOpenItemInUrl',context) && cntr.ID != "" && ! cntr.OpenDetailsFromUrlRegistered ) 
			{
				cntr.OpenDetailsFromUrlRegistered = true;
				cntr.RegisterForPostAction(aspect);
				aspect.PostAction = function(data2,ctx2) {
					;
					var cntr = ctx.vars._Cntr[0];
					var id = aa_urlAttribute(ctx2,cntr.ID+'_open');
					if (id == "") return;
					
					var items = cntr.Items[0].Items;
					for(var i=0;i<items.length;i++)
					{
						var item = [items[i]];
						if (aa_totext(cntr.ItemIdentifier(item,context)) == id) {
							cntr.OpenItemDetails(item,aa_ctx(ctx2,{IsNewItem: [], _OperationID: ["OpenItemDetails"] , _InnerItem: item }));
						}
					}
				}
			}
		}
		}
		init(aspect);
		
		return [aspect];
	},
	OpenPageFromDetails: function (profile,data,context)
	{
		if (! context.vars._ItemsOfOperation || context.vars._ItemsOfOperation.length == 0) return;
		
		var item = context.vars._ItemsOfOperation[0];
		var page = aa_first(data,profile,'Page',context);
		var page_params = ajaxart.run([item],profile,'PageParams',context);
		var control = page.Control([item],aa_ctx(context,{_PageParams: [page_params]}));
		var obj = { isObject: true };
		ajaxart.run([item],profile,'OpenIn',aa_ctx(context,{ _ItemDetailsObject: [obj] , DetailsControl: control }));
	},
	AutoOpenItemDetails: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			cntr.BeforeOpenDetails = function(item,ctx)
			{
				return ajaxart.run(item,profile,'BeforeOpenDetails',context);
			}
			var OnBackToList = function(item,ctx)
			{
				ajaxart.run(data,profile,'OnBackToList',context);
				var cntr = ctx.vars._Cntr[0];
				aa_invoke_cntr_handlers(cntr,cntr.ContainerChange,[],ctx);
				return [];
			}
			var openItemDetails = function(item,ctx2)
			{
				var cntr = ctx.vars._Cntr[0];
				ajaxart_addScriptParam_js(cntr,'OnBackToList',OnBackToList,ctx);
				if ( aa_bool(data,profile,'IsDetailsShown',context) ) {
					var item = ajaxart.run(data,profile,'DetailToShow',ctx);
					if (item.length == 0) return [];
			    	var newContext = aa_ctx(ctx,{_InnerItem: item });
					ajaxart_runMethod(data,cntr,'OpenItemDetails',newContext);
				}
			}
			ctx.vars._Cntr[0].RegisterForPostAction(ctx._This);
			ajaxart_addScriptParam_js(ctx._This,'PostAction',openItemDetails,ctx);
		}
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	},
	BottomLocation: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var createContainer = function(initData,ctx)
		{
			var bottom = jQuery('<div class="aa_bottom"/>');
			bottom.addClass( aa_text(data,profile,'Css',context) );
			var cntr = ctx.vars._Cntr[0];
			var footer = jQuery(cntr.Ctrl).find('>.aa_container_footer');
			if (footer.length > 0 && footer[0].parentNode != null)
				footer[0].parentNode.insertBefore(bottom[0],footer[0]);
			return [];
		}
		ajaxart_addScriptParam_js(aspect,'CreateContainer',createContainer,context);
		return [aspect];
	},
	RightLocation: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var cssClass = aa_attach_global_css(aa_text(data,profile,'Css',context),null,'right_location');
		
		var createContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var all = jQuery('<table cellpadding="0" cellspacing="0"><tbody><tr><td class="aa_left"/><td class="aa_horiz_resizer"/><td class="aa_right"/></td></tr></tbody></table>');
			all.addClass(cssClass);
			
			if (aa_bool(data,profile,'LeftExpandCollpase',context)) {
				var exp_td = document.createElement('td');
				var expcol = document.createElement('div');
				expcol.className = 'aa_left_expcol collapse';
				expcol.ShowSubject = all.find('.aa_left')[0];
				expcol.onmouseup = function() {
					var left = this.ShowSubject;
					var cntr = ctx.vars._Cntr[0];
					
					if (jQuery(this).hasClass('collapse')) {
						jQuery(this).removeClass('collapse').addClass('expand');
						left.display = left.style.display = 'none';
						ajaxart_setUiPref(cntr.ID[0],'ExpandCollapseState',"collpased",context);
					}
					else {
						jQuery(this).addClass('collapse').removeClass('expand');
						left.display = left.style.display = '';
						ajaxart_setUiPref(cntr.ID[0],'ExpandCollapseState',"expanded",context);
					}					
				}
				all.find('.aa_left').append(jQuery(expcol));
				exp_td.appendChild(expcol);
				jQuery(expcol).insertAfter(all.find('.aa_left'));
				if ( ajaxart_getUiPref(cntr.ID[0],'ExpandCollapseState',context) == "collpased") {
					jQuery(expcol).removeClass('collapse').addClass('expand');
					expcol.ShowSubject.display = expcol.ShowSubject.style.display = 'none';
				}
			}
			aa_init_horiz_resizer(all.find('.aa_left')[0],all.find('.aa_horiz_resizer')[0]);
			var left = all.find('.aa_left'); 
			var subelems = jQuery(cntr.Ctrl).find('>*');
			left.append(subelems);
			jQuery(cntr.Ctrl).append(all);
			return [];
		}
		ajaxart_addScriptParam_js(aspect,'CreateContainer',createContainer,context);
		
		return [aspect];
	},
	SelectedElement: function (profile,data,context)
	{
		var cntr = context.vars._Cntr[0];
		var selected = jQuery(cntr.Ctrl).find(".aa_selected_item").filter(aa_visible);
		if (selected.length > 0)
			return [selected[0]];
		return [];
	},
	SelectedItem: function (profile,data,context)
	{
		var cntr = ajaxart_uiaspects_container(context);
		return ajaxart_itemlist_getSelectedItems(cntr);
	},
	DetailsReplacingAll: function (profile,data,context)
	{
		var cntr = context.vars._Cntr[0]; 
		var control = context.vars.DetailsControl;
		
		if (control == null || control.length == 0) return [];

		cntr.ReplacingControl = document.createElement('div');
		cntr.ReplacingControl.className = "aa_replacingall";

		var itemDetailsObj = context.vars._ItemDetailsObject[0];
				
		itemDetailsObj.HideDetails = function(data2,ctx2) {
			var cntr = context.vars._Cntr[0]; 
			var detailsControl = cntr.Ctrl.DetailsControl;
			aa_replaceElement(cntr.Ctrl,cntr.OriginalCtrl,true,aa_first(data,profile,'TransitionBack',context));
			cntr.Ctrl = cntr.OriginalCtrl;
		}
		var topControl = ajaxart.runNativeHelper(data,profile,'TopControl',context);
		jQuery(topControl).addClass('aa_replacingall_top');
		if (topControl.length > 0) cntr.ReplacingControl.appendChild( topControl[0] );
		cntr.ReplacingControl.appendChild(control[0]);
		cntr.ReplacingControl.DetailsControl = control[0];
		cntr.OriginalCtrl = cntr.Ctrl;

		aa_replaceElement(cntr.Ctrl,cntr.ReplacingControl,true,aa_first(data,profile,'Transition',context));
		cntr.Ctrl = cntr.ReplacingControl;
		if (cntr.AfterDetailsReplacingAll)
			cntr.AfterDetailsReplacingAll();
		
		return [];
	},
	DetailsInFixedLocation: function (profile,data,context)
	{
		var setNewControlFunc = function(holder,cntr) { return function(data1,context1)
		{
			var oldContent = holder[0].firstChild;
			holder.empty();
			holder[0].appendChild(cntr.DetailsControl);
			if (oldContent) aa_element_detached(oldContent);
			aa_element_attached(cntr.DetailsControl);
			return [];
		}}

		var findHolder = function(location,cntrCtrl)
		{
			return jQuery(cntrCtrl).find('.aa_' + location).filter( function() { return jQuery(this).parents('.aa_container')[0] == cntrCtrl });
		}
		var location = aa_text(data,profile,'Location',context);
		var cntr = ajaxart_uiaspects_container(context);
		cntr.DetailsControl = context.vars.DetailsControl[0];
		cntrs = [cntr.Ctrl].concat(jQuery(cntr.Ctrl).parents('.aa_container').get());
		var holder = []; 
		for(var i=0;i<cntrs.length;i++)
		{
			holder = findHolder(location,cntrs[i]); 
			if (holder.length > 0)
				break;
		}

		if (holder.length > 0)
		{
			var existing_ctrl = holder.find('.DetailsControl');
			var cb = setNewControlFunc(holder,cntr);
			cb();
//			if (existing_ctrl.length == 0) 
//				cb();
//			else
//				ajaxart_saveDetailsAndRefresh(existing_ctrl[0].ItemData,context.vars.ItemPage[0].Fields,existing_ctrl[0].Context,setNewControlFunc(holder,cntr));
		}

		
		return [];
	},
	DetailsInExternalLocation: function (profile,data,context)
	{
		var cntr = ajaxart_uiaspects_container(context);
		cntr.DetailsControl = context.vars.DetailsControl[0];
		var holder = aa_find_field( aa_text(data,profile,'FieldID',context) )[0];
		if (holder) { 
			putDetailsInHolder(holder);
		} else {  // maybe we are detached...let's try with timeout
			setTimeout(function() {
				var holder = aa_find_field( aa_text(data,profile,'FieldID',context) )[0];
				if (holder) putDetailsInHolder(holder);
			},500);
		}
		
		function putDetailsInHolder(holder) {
			var saveFormerDetails = null;
			var existing_ctrl = jQuery(holder).find('.DetailsControl');
			if (existing_ctrl.length > 0)
				saveFormerDetails = existing_ctrl[0].SaveDetailsAndRefresh;
			
			ajaxart_RunAsync(data,saveFormerDetails,context,function() {
				aa_empty(holder,true);
				holder.appendChild(cntr.DetailsControl);
				aa_element_attached(cntr.DetailsControl);
				return [];
			});
		}
	},
	DetailsInplace: function(profile,data,context)
	{
		if (aa_tobool(context.vars.IsNewItem)) {
			// in case of a new item, we first add it and then open it
			ajaxart_saveDetailsAndRefresh(context.vars._InnerItems[0].Items,context.vars.ItemPage[0].Fields,context,function(data1,ctx) {
				ajaxart.gcs.uiaspect.DetailsInplace(profile,data,aa_ctx(ctx,{IsNewItem: []}));
			});
			return;
		}

		var cntr = ajaxart_uiaspects_container(context);
		var detailsControl = context.vars.DetailsControl;
		var tr = context.vars._ElemsOfOperation[0];
		
		if (aa_bool(data,profile,'CloseInplaceSiblings',context)) {
			var siblings = jQuery(tr).siblings('.detailsInplace_tr');
			for (var i=0;i<siblings.length;i++) {
				siblings[i].jbHideDetails();
			}
		}
		if (jQuery(cntr.Ctrl).find('>.teasers_list_tiles')[0])
			tr = context.vars.ControlElement[0];
		
		if (tr == null) return; // || context.vars._OperationID == null) return [];
		var opID = context.vars._OperationID && context.vars._OperationID[0];

		var itemDetailsObj = context.vars._ItemDetailsObject[0];
		itemDetailsObj.TR = tr;
		itemDetailsObj.ElemsOfOperation = [tr];
		itemDetailsObj.HideDetails = function(data2,ctx2) {
			aa_remove(this.TR.nextSibling,true);
			ajaxart_uiaspects_refreshElements(this.ElemsOfOperation);
		}
		if (opID != null)
		{
			var opCell = jQuery(tr).find("." + opID).parent();
			if (opCell.length > 0) { // has a button
  			  opCell.empty();
			  var buttons = ajaxart.run(data,profile,'Buttons',context);
			  opCell[0].appendChild(buttons[0]);
			}
		}
		
	    if (tr.nextSibling != null && jQuery(tr.nextSibling).hasClass('detailsInplace_tr')) {  // closing
	    	var innerCntr = jQuery(tr.nextSibling).find('.detailsInplace')[0];
	    	if (innerCntr && ! aa_passing_validations(innerCntr)) return; // not passing validation 
	    	aa_remove(tr.nextSibling,true);
			ajaxart_saveDetailsAndRefresh(tr.ItemData,context.vars.ItemPage[0].Fields,context); 
			return [];
	    }
	    
		if (tr.tagName == 'TR')
		{
		    var tr_details = document.createElement("TR");
		    tr_details.className="detailsInplace_tr aa_item_extended";
		    var td_details = document.createElement("TD");
		    td_details.className="detailsInplace_td";
		    aa_setCssText(td_details,aa_text(data,profile,'CssForDetails',context));
		    td_details.setAttribute("colspan",jQuery(tr).find('>TD').length);
		    
		    tr_details.jbHideDetails = function() {
				aa_remove(this,true);
				ajaxart_uiaspects_refreshElements([tr]);
		    }
		    if (detailsControl.length > 0)
		    {
		    	detailsControl[0].className="detailsInplace";
		    	td_details.appendChild(detailsControl[0]);
		    }
		    // add the toolbar
		    var toolbar = aa_first(data,profile,'InplaceToolbar',context);
		    var location = aa_text(data,profile,'ToolbarLocation',context);
		    if (toolbar) {
		      jQuery(toolbar).addClass('aa_toolbar_inplace_'+location);
		      if (location == 'bottom') td_details.appendChild(toolbar);
		      if (location == 'top') jQuery(toolbar).insertBefore(detailsControl[0]);
		    }
		    
		    tr_details.appendChild(td_details);
		    tr.parentNode.insertBefore( tr_details, tr.nextSibling );
		}
		if (tr.tagName == 'LI')
		{
		    var tr_details = document.createElement("LI");
		    tr_details.className="detailsInplace_tr aa_item_extended";
		    var td_details = document.createElement("DIV");
		    td_details.className="detailsInplace_td";
		    tr_details.jbHideDetails = function() {
				aa_remove(this,true);
				ajaxart_uiaspects_refreshElements([tr]);
		    }
		    if (detailsControl.length > 0)
		    {
		    	detailsControl[0].className="detailsInplace";
		    	td_details.appendChild(detailsControl[0]);
		    }
		    tr_details.appendChild(td_details);
		    tr.parentNode.insertBefore( tr_details, tr.nextSibling );
		}
		jQuery(tr).addClass('aa_details_open');
    	aa_element_attached(tr_details);
    	ajaxart_uiaspects_select(jQuery(tr),jQuery(),"auto",cntr.Context,false);

    	var openButton = jQuery(tr).find('.aa_open_button');
    	if (openButton.length > 0) {
			var newBtn = aa_first([],openButton[0].ajaxart.script,"",aa_ctx(openButton[0].ajaxart.params,{InplaceIsOpen:['true']}));
			if (newBtn) aa_replaceElement(openButton[0],newBtn,true);
    	}
    	
    	var firstInput = jQuery(detailsControl).find('input,textarea')[0];
    	if (firstInput && ajaxart.isattached(firstInput) ) firstInput.focus();
    	
		return [];
	},
	ShowItemInItemList: function (profile,data,context)
	{
		var itemlist = aa_first(data,profile,'ItemList',context);
		if (itemlist == null) return [];
		if ( ! aa_bool(data,profile,'ShowOnlyItem',context) ) return [itemlist];
		
		var innerDataItems = ajaxart.run(data,profile,'InnerItems',context);
		
		var newContext = aa_ctx(context,{ _InnerDataItems: innerDataItems });
		
		return ajaxart.runScriptParam(data,itemlist.EditItemControl,newContext);
	},
	ContainerControl: function (profile,data,context)
	{
		var cntr = aa_first(data,profile,'Container',context);
		if (cntr == null || cntr.Ctrl == null) return [];
		return [cntr.Ctrl];
	},
	ContainerFromControl: function (profile,data,context)
	{
		var control = aa_first(data,profile,'Control',context);
		if (control == null || control.Cntr == null) return [];
		return [control.Cntr];
	},
	ContainerItems: function (profile,data,context)
	{
		var cntr = aa_first(data,profile,'Container',context);
		var elems  = ajaxart_container_elems(cntr);
		var out = [];
		for(var i=0;i<elems.length;i++)
			out.push(elems[i].ItemData[0]);
		
		return out;
	},
	ContainerElementByItemFilter: function (profile,data,context)
	{
		var cntr = aa_first(data,profile,'Container',context);
		var elems = ajaxart_container_elems(cntr);
		for(var i in elems) {
			var item = elems[i].ItemData;
			if (aa_bool(item,profile,'ItemFilter',context)) return [elems[i]];
		}
		return [];
	},
	ContainerElements: function (profile,data,context)
	{
		var cntr = aa_first(data,profile,'Container',context);
		return ajaxart_container_elems(cntr);
		
	},
	FirstSubContainer: function (profile,data,context)
	{
		var elem = aa_first(data,profile,'Element',context);
		if (elem == null) return [];
		var cntrs = jQuery(elem).find('.aa_container');
		if (cntrs.length > 0) return [cntrs[0].Cntr];
		return [];
	},
	ItemHighlight: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var initializeElements = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var elems = ctx.vars._Elems;
			var class_compiled = ajaxart.compile(profile,'CssClass',ctx);
			var bgcolor_compiled = ajaxart.compile(profile,'BackgroundColor',ctx);
			var color_compiled = ajaxart.compile(profile,'FontColor',ctx);
			var weight_compiled = ajaxart.compile(profile,'FontWeight',ctx);
			for(var i=0;i<elems.length;i++)
			{
				var elem = elems[i];
				var css_class = ajaxart_runcompiled_text(class_compiled, elem.ItemData, profile, "CssClass", ctx );
				var bgcolor = ajaxart_runcompiled_text(bgcolor_compiled, elem.ItemData, profile, "BackgroundColor", ctx );
				var color = ajaxart_runcompiled_text(color_compiled, elem.ItemData, profile, "FontColor", ctx );
				var weight = ajaxart_runcompiled_text(weight_compiled, elem.ItemData, profile, "FontWeight", ctx );
				// keep and clean original settings
				if (elem.Highlighted != true) {
					elem.Highlighted = true;
					elem.OrigFontWeight = elem.style.fontWeight;
					elem.OrigColor = elem.style.color;
					elem.OrigBg = elem.style.backgroundColor;
					elem.classAdded = css_class;
				} else {
					elem.style.fontWeight = elem.OrigFontWeight;
					elem.style.color = elem.OrigColor;
					elem.style.backgroundColor = elem.OrigBg;
					if (elem.classAdded != "")	jQuery(elem).removeClass(elem.classAdded);
				}
				if (weight != "") 		elem.style.fontWeight = weight;
				if (color != "") 		elem.style.color = color;
				if (bgcolor != "") 		elem.style.backgroundColor = bgcolor;
				if (css_class != "")	jQuery(elem).addClass(css_class);
			}
		};
		ajaxart_addScriptParam_js(aspect,'InitializeElements',initializeElements,context);
		return [aspect];
	},
	Teasers: function (profile,data,context)
	{
		var aspect = { isObject : true };
		var openOnClick = aa_bool(data,profile,'OpenOnClick',context);
		var initializeContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
		    cntr.createNewElement = function(item_data,item_aggregator,ctx2)
		    {
		    	var open_item = function() {
					var newContext = aa_ctx(ctx,{ _InnerItem: item_data });
				    ajaxart.runScriptParam(item_data,cntr.OpenItemDetails,newContext);
		    	};
		    	var teaser_cxt = { isObject: true };
				ajaxart_addScriptParam_js(teaser_cxt,'OpenItem',open_item,ctx2||ctx);
				var ctx1 = aa_ctx(ctx2||ctx,{ _TeasersContext: [teaser_cxt] });
		    	var ctrl = ajaxart.runNativeHelper(item_data,profile,'Control',ctx1)[0];
		    	ctrl.ItemData = item_data;
		    	jQuery(ctrl).addClass('aa_item');

		    	if (openOnClick) {
			    	jQuery(ctrl).click( open_item );
			    	ctrl.style.cursor = 'pointer';
		    	}
		    	if (item_aggregator) item_aggregator.push(ctrl);
		    	return ctrl;
		    };
		};
		ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);
		return [aspect];
	},
	ControlForNoData: function (profile,data,context)
	{
		var aspect = { isObject : true };
		aspect.InitializeContainer = function(data1,ctx) {
			var cntr = ctx.vars._Cntr[0];
			cntr.ControlForNoData = function(data1,ctx) { return ajaxart.run(data1,profile,'Control',aa_merge_ctx(context,ctx)); }
		}
		return [aspect];
	},
	Permissions: function (profile,data,context)
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
	RunAction: function (profile,data,context)
	{
	  var aspect = { isObject : true };
	  if (aa_paramExists(profile,'RunAsyncBeforeControl')) {
		  aspect.CreateContainer = function(data1,ctx) {
			  var cntr = ctx.vars._Cntr[0];
			  aa_setMethod(cntr,'RunAsyncAction',profile,'RunAsyncBeforeControl',context);
			  cntr.ControlForWaiting = function(data2,ctx2) {
				  var out = jQuery('<div />');
				  out.html( aa_multilang_text(data1,profile,'ShowWhileWaiting',context) );
				  out.addClass('aa_loading');
				  return out.get();
			  }
		  }
	  }
	  aspect.InitializeContainer = function(data1,ctx) {
		  ctx = aa_merge_ctx(context,ctx);
		  var cntr = ctx.vars._Cntr[0];  
		  cntr.RegisterForPostAction(this);
		  ajaxart.run(aa_items(cntr),profile,'RunBeforeControl',context);
		  var onAttachScript = ajaxart.fieldscript(profile, 'OnAttach');
		  if (onAttachScript) 
			  aa_addOnAttach(cntr.Ctrl,function() { 
				  ctx = aa_merge_ctx(context,ctx);
				  var cntr = ctx.vars._Cntr[0]; 
				  ajaxart.run(data,profile,'OnAttach',aa_ctx(ctx,{ControlElement:[cntr.Ctrl]}));
			  });
	  }
	  aspect.PostAction = function(data1,ctx) {
		  ctx = aa_merge_ctx(context,ctx);
		  var cntr = ctx.vars._Cntr[0]; 
		  ajaxart.run(data,profile,'RunAfterControl',aa_ctx(ctx,{ControlElement:[cntr.Ctrl]}));
	  }
	  
	  return [aspect];
	},
	MultiSelect: function(profile,data,context)
	{
		var aspect = { 
			isObject : true,
			InitializeContainer: function(initData,ctx)
			{
				var cntr = ctx.vars._Cntr[0];
				cntr.MultiSelect = true;
				cntr.SelectAll = function(data1,ctx2)
				{
					var cntr = ctx.vars._Cntr[0];
					var elems = ajaxart_container_elems(cntr);
					jQuery(elems).find('>td>.aa_multiselect_checkbox').each(function() { aa_checked(this,true); });
				}
				cntr.ClearAll = function(data1,ctx2)
				{
					var cntr = ctx.vars._Cntr[0];
					var elems = ajaxart_container_elems(cntr);
					jQuery(elems).find('>td>.aa_multiselect_checkbox').each(function() { aa_checked(this,false); });
				}
				cntr.GetMultiSelectedItems = function(data1,ctx2)
				{
					var cntr = ctx.vars._Cntr[0];
					var elems = ajaxart_container_elems(cntr);
					var selected = jQuery(elems).filter(function() { var check_box = jQuery(this).find('>td>.aa_multiselect_checkbox')[0]; return check_box && check_box.checked }).get();
					return selected;
				}
			},
			InitializeElements: function(initData,ctx)
			{
				// add th
				var cntr = ctx.vars._Cntr[0];
				var thead = jQuery(cntr.Ctrl).find('.aatable>thead>tr');
				if (thead.length == 0) return;
				if (thead.find('>.aa_multiselect_th').length == 0)
				{
			    	var th = document.createElement('th');
			    	th.className = "fieldtitle aa_multiselect_th";
					thead[0].insertBefore(th,thead[0].firstChild);
					jQuery(th).text(aa_text(data,profile,'SelectionFieldTitle',context));
				}
				
				var elems = ctx.vars._Elems;
				for(var i=0;i<elems.length;i++)
				{
					var elem = elems[i];
					if (elem.ItemData[0].UnSelectable) continue;
					var checkbox = document.createElement('input');
					checkbox.className = "aacheckbox_value aa_multiselect_checkbox";
					checkbox.setAttribute("type","checkbox");
					var td = document.createElement('td');
					checkbox.onclick = function(e)
					{
						var cntr = ctx.vars.HeaderFooterCntr && ctx.vars.HeaderFooterCntr[0];
						if (cntr)
							aa_invoke_cntr_handlers(cntr,cntr.Selection,cntr.ElemsOfOperation(),ctx);
					    return true;
					}
					td.className = "content";
					td.appendChild(checkbox);
					elem.insertBefore(td,elem.firstChild);
				}
			}
		}
		return [aspect];
	},
	ClickableRows: function(profile,data,context)
	{
		var aspect = { isObject : true };
		var cssClass = aa_attach_global_css(aa_text(data,profile,'Css',context),context,'clickable');
		var initializeElements = function(initData,ctx)
		{
			var elems = ctx.vars._Elems;
			for(var i=0;i<elems.length;i++)
			{
				var elem = elems[i];
				elem.onclick = function(e) {
					if (window.aa_incapture) return;
					ajaxart.run(this.ItemData,profile,'Action',aa_ctx(context, {_ItemsOfOperation:this.ItemData, Item:this.ItemData, _ElemsOfOperation:[this], ControlElement:[this] }));
				};
				jQuery(elem).addClass('aa_clickable').addClass(cssClass);
			}
			if (aa_bool(data,profile,'DisableSelection',context))
				;// todo: disable selection
		}
		ajaxart_addScriptParam_js(aspect,'InitializeElements',initializeElements,context);
		return [aspect];
	},
	HoverCss: function(profile,data,context)
	{
		var aspect = { isObject : true };
		var css = aa_text(data,profile,'Css',context);
		var inline = (css.indexOf(":") >= 0);
		var initializeElements = function(initData,ctx)
		{
			var elems = ctx.vars._Elems;
			for(var i=0;i<elems.length;i++)
			{
				var elem = elems[i];
				if (inline) {
					elem.onmouseover = function() {
						this["original_css"] = this.style.cssText;
						aa_setCssText(this,this.style.cssText + ";" + css);
					};
					elem.onmouseout = function() {
						this.style.cssText = this["original_css"];
					}
				} else {
					elem.onmouseover = function() {
						jQuery(this).addClass(css);
					};
					elem.onmouseout = function() {
						jQuery(this).removeClass(css);
					}
				}
			}
		}
		ajaxart_addScriptParam_js(aspect,'InitializeElements',initializeElements,context);
		return [aspect];
	},
	ItemClickable: function(profile,data,context)
	{
		var aspect = { isObject : true };
		aspect.InitializeContainer = function(data1,ctx) {
			var cntr = ctx.vars._Cntr[0];
			cntr.ItemClickable = true;
			cntr.CursorPointerForItem = aa_bool(data,profile,'PointerCursor',context);
		}
		aspect.InitializeElements = function(data1,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var elems = ctx.vars._Elems;
			if (!cntr.ItemClickable) return;
			for(var i=0;i<elems.length;i++) {
				var elem = elems[i];
				jQuery(elem).addClass('aa_list_clickable');
				if (cntr.CursorPointerForItem) jQuery(elem).css('cursor','pointer');
				
				var clickFunc = function(elem) { return function() {
					if (window.aa_incapture) return;
					var newContext = aa_ctx(ctx,{ _InnerItem: elem.ItemData, _ItemsOfOperation: elem.ItemData, ControlElement: [elem]} );
					newContext = aa_merge_ctx(context,newContext);
					ajaxart.run(elem.ItemData,profile,'ClickAction',newContext);
					return false;
				}};
				elem.onclick = clickFunc(elem);
			}
		}
		return [aspect];
	},
	ItemList: function(profile,data,context)
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
	List: function(profile,data,context)
	{
		var aspect = { isObject : true };
		aspect.CreateContainer = function(initData,ctx)
		{
			var cntr = ctx.vars._Cntr[0];
			var ctrl = jQuery('<div class="aa_list aa_listtop aa_cntr_body aa_cntrlist"/>');
			jQuery(cntr.Ctrl).find('>.aa_listtop').replaceWith(ctrl);
			return [];
		}
		aspect.InitializeContainer = function(data1,ctx) {
			var cntr = ctx.vars._Cntr[0];
				
			var eachItemInLine = aa_bool(data,profile,'EachItemInLine',context);
			cntr.ListItemCss = aa_comma_size_to_css(aa_text(data,profile,'ItemSize',context));
			cntr.ListItemCss += aa_text(data,profile,'ItemCss',context);
			var itemClickable = aa_bool(data,profile,'ItemClickable',context);
			var spacingBetweenFields = aa_text(data,profile,'SpacingBetweenFields',context);
		    cntr.createNewElement = function(item_data,item_aggregator,ctx2)
		    {
				var cntr = ctx.vars._Cntr[0];
				var out = jQuery('<div class="aa_item" tabindex="1">')[0];
		    	if (!eachItemInLine)  
		    		jQuery(out).css('float',aa_is_rtl(cntr.Ctrl,ctx) ? 'right' : 'left');
		    	aa_apply_css(out,cntr.ListItemCss);
				var fields = ajaxart_field_getFields(cntr,"table");
				for (var j=0;j<fields.length;j++) {
					if (j>0)
						jQuery(out).append(jQuery('<div style="height: '+ spacingBetweenFields +'"/>'));
					var field = fields[j];
				    var cell_data = ajaxart_field_calc_field_data(field,item_data,ctx2);
					var field_div = document.createElement('div');
					out.appendChild(field_div);
			    	ajaxart_field_createCellControl(item_data,cntr,field_div,"control",field,cell_data,ctx2);
				}
				out.ItemData = item_data;
				if (itemClickable) {
					jQuery(out).addClass('aa_list_clickable');
					out.onclick = function(e)
					{
						var item = this;
						var newContext = aa_ctx(ctx2 || ctx,{ _InnerItem: item.ItemData, _ItemsOfOperation: item.ItemData, ControlElement: [this]} );
						ajaxart.run(item.ItemData,profile,'ClickAction',newContext);
						return false;
					};
				}
		    	if (item_aggregator) item_aggregator.push(out);
				return out;
		    }
		}
		return [aspect];	
	},
	SearchLayout: function (profile,data,context)
	{
		if (!context.vars._PopupField) return [];
		var popupField = context.vars._PopupField[0];
		var page = ajaxart.runNativeHelper(data,profile,'Page',context)[0];
		var group = page.Fields[0];
		var image = group.Fields[0];
		var right = group.Fields[1];
		var title = right.Fields[0];
		var text = right.Fields[1];
		
		image.FieldData = popupField.ItemImage;
		title.FieldData = popupField.ItemTitle;
		text.FieldData = popupField.ItemExtraText;
		
		// for preview
		
		if (popupField.Options && popupField.Options.Options.length > 0) {
			var option = popupField.Options.Options[0].source;
			popupField.ItemImage([option],context);
			popupField.ItemTitle([option],context);
			popupField.ItemExtraText([option],context);
			popupField.ItemLink([option],context);
		}
		return [page];
	},
	MultiplePressed: function(profile,data,context)
	{
		var aspect = { isObject : true };
		aspect.PressedCssClass = aa_attach_global_css(aa_text(data,profile,'PressedCss',context));
		aspect.InitializeElements = function(initData,ctx)
		{
			var elems = ctx.vars._Elems;
			for(var i=0;i<elems.length;i++)
			{
				var elem = elems[i];
				if ( aa_bool(elem.ItemData,profile,'IsItemPressed',context) ) jQuery(elem).addClass('aa_pressed').addClass(aspect.PressedCssClass);

				var initEvents = function(elem) {
					var toggleByClick = function (e)
			  		{
						jQuery(elem).toggleClass('aa_pressed').toggleClass(aspect.PressedCssClass);
						var cntr = ctx.vars._Cntr[0];
						var pressedElems = jQuery(ajaxart_container_elems(cntr)).filter('.aa_pressed');
						var items = [];
						for(var i=0;i<pressedElems.length;i++) items.push(pressedElems[i].ItemData[0]);
						
						ajaxart.run(items,profile,'OnPressedChange',aa_ctx(context,{ _Elem: [elem] }));
					    return aa_stop_prop(e);
			  		};
					ajaxart.ui.bindEvent(elem,'click',toggleByClick);
				}
				initEvents(elem);
			}
		}
		return [aspect];
	}
});
aa_gcs("uiaspect_config",{
	InUrlFragment: function (profile,data,context)
	{
		return [{
			isObject:true,
			Set: function(data1,ctx) {
				if (data1[0])
				  aa_urlChange(ctx,"?"+data1[0].Key + "="+data1[0].Value+"");
			},
			Get: function(key,ctx) { return [aa_urlAttribute(ctx,aa_totext(key))]; }
		}];
	}
});

aa_gcs("field", {
	CustomControl: function (profile,data,context)
	{
		var field = { isObject : true };
		field.Title = aa_multilang_text(data,profile,'Title',context);
		field.Image = aa_text(data,profile,'Image',context);
		field.Id = aa_text(data,profile,'ID',context);
		field.ID = [field.Id];
		field.FieldData = function(data1) { return data1; }
		field.CellPresentation = ["control"];
		field.HideTitle = (!aa_bool(data,profile,'ShowTitle',context));
		
		aa_setMethod(field,'Control',profile,'Control',context);

		var newContext = aa_ctx(context,{_Field: [field]} );
		ajaxart.runsubprofiles(data,profile,'FieldAspect',newContext);
		
	    return [field];
	},
	Control: function (profile,data,context)
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
	Button: function (profile,data,context)
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
			jElem[0].jbContext = aa_merge_ctx(context,ctx);
			if (field.Image && field.Image.Url)
				  field.Image.StaticUrl = aa_totext(field.Image.Url(field_data,context));
			
			var button = aa_api_object(jElem,{image: field.Image, Field: field, data: field_data});
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
					return ajaxart.run(data,profile,'Action',ctx2);
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
	Field1: function (profile,data,context)
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
	FireOnUpdate: function(profile,data,context)
	{
		var elem = ajaxart.getControlElement(context)[0];
		var td = jQuery(elem).parents('.aa_cell_element')[0];
		if (td == null) return [];
		aa_invoke_field_handlers(td.Field.OnUpdate,elem,null,td.Field,td.FieldData);
		return [];
	},
	OptionsFilter: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		
		if (field == null) return [];

		field.SelectedList = "";
		field.FilterControl = function(filter_context)
		{
			var newContext = aa_ctx(filter_context,{_Field: [this]} );
			var ctrl = ajaxart.runNativeHelper(filter_context.vars.FilterData,profile,'Control',newContext);
			jQuery(ctrl).find('.aa_filter_input').addClass('aa_filter_' + this.Id);
			return ctrl;
		};
		field.newFilter = function(initialFilterData)
		{
			var field = this;
			return {
				isObject: true,
				filterData: ajaxart.totext_array(initialFilterData),
				SetFilterData: function(filterData) { this.filterData = ajaxart.totext_array(filterData); },
				ToSQLText: function(rawData) { return ajaxart.totext_array(rawData) },
				PrepareElemCache: function(field,wrapper)
				{
				  var item_txt = wrapper[field.Id];
				  //if (item_txt == '') item_txt = 'no value';

				  wrapper["__FilterCache_" + field.Id] = "," + item_txt + ",";
				  if (field.OptionCategories)
					  if (field.Multiple)
					  {
						  var items = item_txt.split(',');
						  for(var i=0;i<items.length;i++)
							  wrapper["__FilterCache_" + field.Id] += field.OptionCategories[items[i]];
					  }
					  else
						  wrapper["__FilterCache_" + field.Id] += field.OptionCategories[item_txt];
				},
				Match: function(field,wrapper)
				{
					if (this.filterData == "") return true;
					var cache = wrapper["__FilterCache_" + field.Id];
					if (!cache && this.PrepareElemCache) {
						this.PrepareElemCache(field,wrapper);
						cache = wrapper["__FilterCache_" + field.Id];
					}
					if (!cache) { ajaxart.log("no cache preparation for filter of " + field.Id,"error"); return false; }
					result = false;
					var options= this.filterData.split(',');
					for(var i=0;i<options.length;i++)
						if (cache.indexOf("," + options[i] + ",") != -1)
							result = true;
					return result;
				}
			};
		};
		return [];
	},
	RefreshFilteredItems: function(profile,data,context)
	{
		var cntr = (context.vars.HeaderFooterCntr || context.vars._Cntr)[0];
		if (cntr == null) return;
		if (!cntr.DelayedFiltering)
			aa_recalc_filters_and_refresh(cntr,context.vars._Item,aa_ctx(context, {_Cntr:[cntr]}));
		var field = context.vars._Field[0];
		var filters = cntr.DataHolder && cntr.DataHolder.UserDataView && cntr.DataHolder.UserDataView.Filters;
		for(var i in filters)
			if (filters[i].field.Id == field.Id)
				ajaxart_setUiPref(cntr.ID[0],'Filter_Field_' + field.Id,ajaxart.totext_array(filters[i].rawFilterData),context);
		return [];
	},
	TextFilter: function (profile,data,context)
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
	NumberFilter: function (profile,data,context)
	{
		var field = ajaxart_fieldaspect_getField(context);
		if (field == null) return [];

		field.FilterControl = function(filter_context)
		{
			var newContext = aa_ctx(filter_context,{_Field: [this] } );
			var ctrl = ajaxart.runNativeHelper(filter_context.vars.FilterData,profile,'Control',newContext);
			jQuery(ctrl).find('.aa_filter_input').addClass('aa_filter_' + this.Id);
			return ctrl;
		}
		field.newFilter = function(initialFilterData)
		{
			var CompileFilterData = function(filter_data)
			{
				var result = [];
				var filter_txt = aa_totext(filter_data).replace(/[ ]*-[ ]*/,'-');
				var groups_txt = filter_txt.split(',');
				for(var i in groups_txt)
					if (groups_txt[i] != '')
					{
						var range;
						if (groups_txt[i][0] == '<' && groups_txt[i][1] == '=') 
							range = { 
								from: -2147483648,
								to: parseFloat(groups_txt[i].split('<=').pop()),
								match: function(num) { return this.to >= num }
							}
						else if (groups_txt[i][0] == '<') 
							range = { 
								from: -2147483648,
								to: parseFloat(groups_txt[i].split('<').pop()),
								match: function(num) { return this.to > num }
							}
						else if (groups_txt[i][0] == '>' && groups_txt[i][1] == '=') 
							range = { 
								to: 2147483647,
								from: parseFloat(groups_txt[i].split('>=').pop()),
								match: function(num) { return this.from <= num }
							}
						else if (groups_txt[i][0] == '>') 
							range = { 
								to: 2147483647,
								from: parseFloat(groups_txt[i].split('>').pop()),
								match: function(num) { return this.from < num }
							}
						else
						{
							var fromTo = groups_txt[i].split('-');
							var range = { 
								from: parseFloat(fromTo[0]), 
								match: function(num) { return this.from <= num && this.to >= num }
							}
							if (fromTo[1] == null)
								range.to = range.from;
							else
								range.to = parseFloat(fromTo[1]);
						}
						if (isNaN(range.from))
							range.from = -2147483648;
						if (isNaN(range.to))
							range.to = 2147483647;
						
						result.push(range);
					}
				return result;
			}
			return	{
				filterData: CompileFilterData(initialFilterData),
				SetFilterData: function(filterData) { this.filterData = CompileFilterData(filterData); }, 
				ToSQLText: function(rawData) { return ajaxart.totext_array(rawData) },
				Match: function(field,wrapper)
				{
					if (this.filterData.length == 0) return true;
					for(var i in this.filterData)
					{
						var result = this.filterData[i].match(wrapper[field.Id]);
						if (result) return true;
					}
					return false;
				}
			}
		}
		return [];
	},
	Field: function (profile,data,context) // GC of field.Field
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
			field.FieldData = function(item,ctx) { ctx = ctx || {}; return ajaxart_multilang_run(item,profile,'FieldData',aa_merge_ctx(context,ctx)); }
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
	FilterField: function (profile,data,context) 
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
	XmlField: function (profile,data,context)
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
	XmlGroup: function (profile,data,context)
	{
		var out = ajaxart.gcs.field.XmlField(profile,data,context);
		var field = out[0];
		field.IsGroup = true;
		field.HideTitle = aa_bool(data,profile,'HideTitle',context);
		field.Path = aa_text(data,profile,'Path',context);
		if (aa_text(data,profile,'Path',context) == "") {
			field.IsVirtualGroup = true;
//			var id = aa_text(data,profile,'ID',context);
//			field.Id = id;
//			field.ID = [id];
			field.FieldData = function(data1) { return data1; }
		}
		field.Fields = ajaxart.runsubprofiles(data,profile,'Field',context);
		
		field.Control = function(data1,ctx) {
			var field = this;
			var cntr = ctx.vars._Cntr[0] || {};
			var parentItems = cntr.Items || [];
			var newContext = aa_merge_ctx(context,ctx);
			var id = aa_totext(cntr.ID) + '_' + field.Path;
			var dataitems = [{ isObject: true , Items: data1 }];
			if (field.HeaderFooter && ctx.vars.DataHolderCntr) dataitems = ctx.vars.DataHolderCntr[0].Items; 
			
			var operationsFunc = function(field) { return function(data2,ctx2) { 
				field.Operations = ajaxart.run(data1,profile,'Operations',aa_merge_ctx(context,ctx2));  
				return field.Operations;
			}} 
			var aspectsFunc = function(field) { return function(data2,ctx2) {
				if (field.Aspects) return field.Aspects;	// reuse the apsects (e.g. when using uiaspect.List with group inside)
				
				var newContext = aa_merge_ctx(context,ctx2);
				field.Aspects = ajaxart.run(data,profile,'Presentation',newContext);
				var aspect = {isObject:true}
				aa_set_initialize_container(aspect,function(aspect,ctx2,cntr) {
					if (ctx.vars._Cntr && ctx.vars._Cntr[0].ReadOnly) cntr.ReadOnly = true;
					if (aa_text(data,profile,'Path',context) == "")
					  cntr.IsVirtualGroup = true;
				});
				field.Aspects.push(aspect);
				ajaxart.concat(field.Aspects,ajaxart.runsubprofiles(data,profile,'Aspect',newContext));
				for(var i=0;i<field.Fields.length;i++)
				  if (field.Fields[i].CntrAspects)
					  field.Aspects = field.Aspects.concat(field.Fields[i].CntrAspects);
				
				return field.Aspects;
			}} 
	
			var out = aa_uidocument(data1,id,dataitems,field.Fields,aspectsFunc(field),operationsFunc(field),newContext);
			out.Field = field;
			if (field.IsGroup) jQuery(out).addClass('aa_layoutgroup');
			return [out];
		}
		field.ItemDetailsControl = field.Control; // ???
		
		var newContext = aa_ctx(context,{_Field: [field]} );
		ajaxart.runsubprofiles(data,profile,'FieldAspect',newContext);
		
		multipleItems_func = function(data1,ctx) {
			return ajaxart.runNativeHelper(data1,profile,'MultipleItems',aa_merge_ctx(context,ctx));
		}; 
		ajaxart_addMethod_js(field,'MultipleItems',multipleItems_func,context);
		return out;
	},
	Group: function (profile,data,context)  // GC of field.Group
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

aa_gcs("animation", {
	CssBasedAnimation: function (profile,data,context) {
		return [{
			animate: function(elem,ondone) {
				var screen = ajaxart_screen_size(true);
				var ctx2 = aa_ctx(context, { ScreenWidth: [screen.width + "px"], ScreenHeight: [screen.height +"px"]});
				jQuery(elem).addClass(aa_attach_global_css(aa_text(data,profile,'Css',ctx2)));
				jQuery(elem).addClass('beforeAnimation');
				setTimeout(function() { // use timeout to make sure all other modifiers have finished
					aa_addOnAttach(elem,function() {
						jQuery(elem).removeClass('beforeAnimation');
						var transition_end = function() {
							jQuery(elem).removeClass("afterAnimation"); 
							if (ondone)
								ondone(elem);
							elem.removeEventListener('webkitTransitionEnd', transition_end);
							elem.removeEventListener('transitionend', transition_end);
						};
						elem.addEventListener('webkitTransitionEnd', transition_end);
						elem.addEventListener('transitionend', transition_end);
						jQuery(elem).addClass('afterAnimation');
					});
				},1);
			}
		}];
	},
	JQueryShow: function (profile,data,context) {
		var duration = aa_int(data,profile,'Duration',context);
		return [{
			animate: function(elem,ondone) {
				jQuery(elem).hide();
				if (duration == 0) {
					jQuery(elem).show();
					ondone();
				}
				else {
					jQuery(elem).show(duration, "swing", ondone);
				}				
			}
		}];
	},
	Hide: function (profile,data,context) {
		var field_id = aa_text(data,profile,'FieldId',context);
		var animation = aa_first(data,profile,'AnimationType',context);
		if (!animation || !field_id) return [];
		jQuery(aa_find_field(field_id)).each(function(index,field_control) {
			if (field_control && animation) {
				animation.hide(field_control, function() {
					ajaxart.run(data,profile,'OnDone',context);
				});
			}
		});
		return [];
	},
	CssBasedHideAnimation: function (profile,data,context) {
		return [{
			hide: function(elem,ondone) {
				var screen = ajaxart_screen_size(true);
				var ctx2 = aa_ctx(context, { ScreenWidth: [screen.width + "px"], ScreenHeight: [screen.height +"px"]});
				aa_addOnAttach(elem,function() {
					var transition_end = function() {
						if (ondone)
							ondone(elem);
						elem.removeEventListener('webkitTransitionEnd', transition_end);
						elem.removeEventListener('transitionend', transition_end);
					};
					elem.addEventListener('webkitTransitionEnd', transition_end);
					elem.addEventListener('transitionend', transition_end);
					jQuery(elem).addClass(aa_attach_global_css(aa_text(data,profile,'Css',ctx2)));
				});
			}
		}];
	},
	JQueryHide:function (profile,data,context) {
		var duration = aa_int(data,profile,'Duration',context);
		return [{
			hide: function(elem,ondone) {
				if (duration == 0) {
					jQuery(elem).hide();
					ondone();
				} else {
					jQuery(elem).hide(duration, "swing", ondone);
				}
			}
		}];
	}
});

aa_gcs("scroll", {
	Scroll: function(profile,data,context)
	{
		var field = context.vars._Field[0];
		field.Scroll = aa_first(data,profile,'Scroll',context);
		if (field.Scroll && field.Scroll.Load) field.Scroll.Load([],context);  // load js files etc.
		
		aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx) {
			if (field.Scroll && field.Scroll.OnModifyControl) field.Scroll.OnModifyControl([],aa_ctx(context,{ControlElement: [cell]}));
			aa_addOnAttach(cell,function() {
				var elem = cell.firstChild; // scrolling is done on 'content', and can use parentNode for the cell
				if (!elem) return;
//				if (elem.tagName.toLowerCase() == 'td' && elem.firstChild) // scrolling is done better on 'div' rather on 'td'
//					elem = elem.firstChild;
				var ctx2 = aa_ctx(context,{ControlElement: [elem]});
				elem.jbScroll = field.Scroll;
				if (field.Scroll && field.Scroll.Prepare) field.Scroll.Prepare([],ctx2);
				if (elem.ScrollElement) // allow changing the scroll element
					ctx2 = aa_ctx(context,{ControlElement: [elem.ScrollElement]});  
//				jQuery(ctx2.vars.ControlElement[0]).addClass(aa_attach_global_css(aa_text(data,profile,'Css',context)));

				ajaxart.run(data,profile,'Height',ctx2);  // set the height
				ajaxart.run(data,profile,'Width',ctx2); // set the width
				ctx2.vars.ControlElement[0].jbSizeChanged = function() {	// when device causes size change like resize or orientation change
					if (field.Scroll.SizeChanged)
						field.Scroll.SizeChanged([],ctx2);
				}
				
				if (field.Scroll && field.Scroll.Activate) field.Scroll.Activate([],ctx2);
			});
		});
	},
	BrowserScrollbar: function (profile,data,context)
	{
		return [{ isObject: true,
			Activate: function(data1,ctx) {
				this.Control = ctx.vars.ControlElement[0];
				if (this.Control.parentNode.tagName.toLowerCase() != 'td') this.Control = this.Control.parentNode;
						
				jQuery(ctx.vars.ControlElement).css('overflow','auto');
			},
			ScrollToBottom: function() {
				this.Control.scrollTop = this.Control.scrollHeight;
			}
		}];
	},
	NoScroll: function (profile,data,context)
	{
		var cls = aa_attach_global_css(aa_text(data,profile,'Css',context));
		return [{ 
			isObject: true,
			OnModifyControl : function(data1,ctx) {
				jQuery(ctx.vars.ControlElement).addClass(cls);
			}
		}];
	},
	Scroll2: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		
		field.ScrollStyle = aa_first(data,profile,'Style',context);
		field.ScrollWidth = aa_first(data,profile,'Width',context);
		field.ScrollHeight = aa_first(data,profile,'Height',context);
		var topClass = aa_attach_global_css(field.ScrollStyle.Css,context);
			
		aa_field_handler(field,'ModifyCell',function(cell,field_data,cell_presentation,ctx,item)
		{
			var content = cell.firstChild || cell;
			var topDiv = content;
			while (topDiv && ",table,tbody,tr,td,".indexOf(topDiv.tagName.toLowerCase()) > -1) {
				topDiv = topDiv.parentNode;
			}
			var scroll = field.ScrollObject = aa_renderStyleObject(field.ScrollStyle,{
				ScrollHeight: field.ScrollHeight,
				ScrollWidth: field.ScrollWidth,
				fixSize: function(element) {
				  if (field.ScrollHeight) field.ScrollHeight.apply(element);
				  if (field.ScrollWidth) field.ScrollWidth.apply(element);
				},
				init: function(settings) {
					this.refresh = settings.refresh;
					this.requiresDivWrapper = settings.requiresDivWrapper;
				},
				body: content,
				topDiv: topDiv
			},ctx);
			
			if (field.ScrollHeight) jBart.bind(field.ScrollHeight,'update',function() { field.ScrollObject.refresh(); });
			if (field.ScrollWidth) jBart.bind(field.ScrollWidth,'update',function() { field.ScrollObject.refresh(); });
			
			if (field.ScrollObject.requiresDivWrapper) {
				aa_addOnAttach(content,function() {
					var parent = topDiv.parentNode;
					scroll.divWrapper = jQuery('<div class="aa_scroll_wrapper"/>').addClass(topClass).append(topDiv)[0];
					parent.appendChild(scroll.divWrapper);
					field.ScrollObject.refresh();	
				});
			} else {
				jQuery(topDiv).addClass(topClass);
				field.ScrollObject.refresh();
			}
		});	
	},
	IScroll: function (profile,data,context)
	{
		var out = { isObject: true }
		out.Load = function() {
			if (window.IScroll || window.loading_iscroll4) return;
			window.loading_iscroll4 = true;
			var path = aa_text(data,profile,'JsLocation',context);
			aa_load_js_css(path, 'js');
		}
		out.OnModifyControl = function(data1,ctx) {
			jQuery(ctx.vars.ControlElement).css('overflow','auto'); 
		}
		out.Prepare = function(data1,ctx) {
			var wrapper = document.createElement('DIV');
			var elem = ctx.vars.ControlElement[0];
			elem.ScrollElement = wrapper;
	        elem.parentNode.appendChild(wrapper);
			wrapper.appendChild(elem);
			wrapper.jbScrolledElem = elem;
		}
		out.Activate = function(data1,ctx) {
			var paramsToEval = "var params = " + aa_text(data,profile,'ScrollParams',context) + ';';
			eval(paramsToEval);

			if (window.iScroll) {
				var elem = ctx.vars.ControlElement[0];
				
				elem.IScroll = new iScroll(elem,params);
				if (elem.jbScrolledElem) elem.jbScrolledElem.IScroll = elem.IScroll;
				setTimeout(function() {elem.IScroll.refresh()},200);
				elem.contentChanged = function() { this.IScroll.refresh(); }
				out.elem = elem;
			} else {
				jQuery(ctx.vars.ControlElement).css('overflow','hidden');
				setTimeout(function() { out.Activate(data1,ctx)} ,500 );
			}
		}
		out.Refresh = function(data1,ctx) {
			this.elem.IScroll.refresh();
		}
		out.ScrollToBottom = function(time, onlyIfNeeded) {
			if (!time) time = 200;
			if (!onlyIfNeeded || this.elem.scrollHeight > this.elem.clientHeight)
				this.elem.IScroll.scrollTo(0, this.elem.clientHeight - this.elem.scrollHeight,time,false);
		}
		return [out];
	},
	TinyScroll: function (profile,data,context)
	{
		var out = { isObject: true }
		out.Load = function() {
			if (window.IScroll || window.loading_tinyscroll) return;
			window.loading_tinyscroll = true;
			var path = aa_text(data,profile,'JsLocation',context);
			jQuery('body').append('<script type="text/javascript" src="'+path+'"></script>');
		}
		out.OnModifyControl = function(data1,ctx) {
			jQuery(ctx.vars.ControlElement).css('overflow','auto'); 
		}
		out.Prepare = function(data1,ctx) {
		    var wrapper = jQuery('<div class="tscrollbar">\
	                <div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>\
	                <div class="viewport"><div class="overview"></div></div></div>');

	        var width = aa_text(data,profile,'Width',context);
	        if (width != '') wrapper.width(width);
	        
        	var cls = aa_attach_global_css(aa_text(data,profile,'Css',context));
        	wrapper.addClass(cls);
        	
	        var elem = ctx.vars.ControlElement[0];
	        
	        var scrollElem = elem.ScrollElement = wrapper.find('.viewport')[0];
	        var top = elem.parentNode;
	        top.appendChild(wrapper[0]);
		    wrapper.find('.overview').append(elem);
		    scrollElem.Scroll = wrapper;
		    scrollElem.contentChanged = function() { 
		    	setTimeout(function() {scrollElem.Scroll.tinyscrollbar_update();},10); 
		    }
		}
		out.Activate = function(data1,ctx) {
	    	setTimeout(function() { 
				var scrollElem = ctx.vars.ControlElement[0];
				out.scrollElem = scrollElem; 
	    		if (scrollElem.Scroll.tinyscrollbar) {
	    			scrollElem.Scroll.tinyscrollbar(); 
	    			scrollElem.Scroll.tinyscrollbar_update();
	    		}
	    	},1);
		}
		out.ScrollToBottom = function() {
			this.scrollElem.Scroll.tinyscrollbar_update('bottom');
		}
		
		return [out];
	},
	DeviceBottom: function (profile,data,context)
	{
		if (ajaxart.inPreviewMode) return;
		
		var elem = context.vars.ControlElement[0];
		elem.HeightDelta = aa_int(data,profile,'Delta',context);
		var cls_for_delta = aa_text(data,profile,'HtmlClassForDelta',context);
		if (cls_for_delta && jQuery("." + cls_for_delta).length > 0)
			elem.HeightDelta = jQuery("." + cls_for_delta)[0].offsetHeight + (elem.HeightDelta ? elem.HeightDelta : 0);

	    elem.StretchHeight = function() {
	    	ajaxart.ui.HeightToWindowBottom(this,this.HeightDelta);
	    }
	    setTimeout(function() { elem.StretchHeight();},100);

	    aa_addWindowResizeListener(elem,function() { elem.StretchHeight(); });
		jQuery(elem).addClass('aa_resize_bind');
		jBart.bind(elem,"WindowResize",elem.StretchHeight);
	},
	DeviceRight: function (profile,data,context)
	{
		if (ajaxart.inPreviewMode) return;

		var elem = context.vars.ControlElement[0];
		elem.WidthDelta = aa_int(data,profile,'Delta',context);
		jQuery(elem).addClass('aa_mobile_stretch');
	    elem.StretchWidth = function() {
	    	aa_widthToWindowRight(this,this.WidthDelta);	
	    }
	    setTimeout(function() { elem.StretchWidth();},100);
	    

	    aa_addWindowResizeListener(elem,function() { elem.StretchWidth(); });
	    
		jQuery(elem).addClass('aa_resize_bind');
		jBart.bind(elem,"WindowResize",elem.StretchWidth);
	},
	FixedHeight: function (profile,data,context)
	{
		if (ajaxart.inPreviewMode) return;
		var height = aa_text(data,profile,'Height',context);
		if (!ajaxart.isIDevice) {
			var height2 = aa_text(data,profile,'HeightForNonMobile',context);
			if (height2 != '') height = height2; 
		}
		var cell = context.vars.ControlElement[0];
		if (height != '') 
			cell.style.height = height;
	},
	FixedWidth: function (profile,data,context)
	{
		if (ajaxart.inPreviewMode) return;
		var width = aa_text(data,profile,'Width',context);
		if (!ajaxart.isIDevice) {
			var width2 = aa_text(data,profile,'WidthForNonMobile',context);
			if (width2 != '') width = width2; 
		}
		if (width != '') context.vars.ControlElement[0].style.width = width;
	}
});

aa_gcs("scroll_size", {
	FixedHeight: function (profile,data,context)
	{
	  var height = aa_int(data,profile,'Height',context);
	  var applyOn = aa_text(data,profile,'ApplyOn',context);
	  return [{
		 apply: function(elem,delta) {
		 	if (!delta) delta = 0;
		 	jQuery(elem).css(applyOn,height-delta + "px");
		  }
	  }];
	},
	FixedWidth: function (profile,data,context)
	{
	  var width = aa_int(data,profile,'Width',context);
	  var applyOn = aa_text(data,profile,'ApplyOn',context);
	  return [{
		 apply: function(elem,delta) {
		 	if (!delta) delta = 0;
		 	jQuery(elem).css(applyOn,width-delta + "px");
		  }
	  }];
	},
	DeviceWidth: function(profile,data,context)
	{
		var field_delta = aa_text(data,profile,'ReduceWidthOfOtherField',context);
		var stretch = aa_bool(data,profile,'StretchFromCurrentLocation',context);
		var pixels_delta = aa_int(data,profile,'ReducePixels',context);
		var applyOn = aa_text(data,profile,'ApplyOn',context);
		var percentages = parseInt(aa_text(data,profile,'Percentages',context).replace("%",""));
		
		aa_init_onresize();
		
		return [{
			apply: function(elem,extra_delta) {
				function fix_size() {
					var delta = extra_delta ? extra_delta : 0;
					var width = ajaxart_screen_size(true).width;
					if (percentages && !isNaN(percentages))
						width *= percentages/100;
					if (field_delta && aa_find_field(field_delta)[0])
					 	delta += aa_find_field(field_delta,'',true)[0].offsetWidth;
					if (pixels_delta)
						delta += pixels_delta;
					if (stretch)
						aa_widthToWindowRight(elem,delta,applyOn);
					else
						jQuery(elem).css(applyOn,width-delta + "px");
				}
				if (field_delta)
					aa_addOnAttachMultiple(elem, function() { setTimeout(fix_size,1); } );	// we use time-out so offsetWidth is valid
				else if (stretch)
					aa_addOnAttachMultiple(elem, fix_size );
				else
					fix_size();

				aa_attach_window_resize(fix_size,elem);
			}
		}]
	},
	DeviceHeight: function(profile,data,context)
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
	}
});
aa_gcs("field_control", {
	Image: function (profile,data,context) // GC of field_control.Image
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
   	CustomXtmlControl: function (profile,data,context)
   	{
   		var field = context.vars._Field[0];
   		field.Control = function(field_data,ctx) {
   			return ajaxart.run(field_data,profile,'Control',aa_merge_ctx(context,ctx));
   		}
   	},
   	CustomControlOld: function (profile,data,context)
   	{
		var field = context.vars._Field[0];
		field.Control = function(field_data,ctx) {
			var style = ajaxart.runNativeHelper(field_data,profile,'StyleObject',context)[0];
			
			return [aa_renderStyleObject(style,{ Field: field, Data: field_data },context)];
		}
   	} 
});
aa_gcs("field_feature", {
	Css: function (profile,data,context)
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

function aa_init_onorientchange_MobileDeviceStretchBottomRight()
{
    if (window.aa_onorientchange_MobileDeviceStretchBottomRight) return;
    
    window.aa_MobileDeviceBottomRight_orientation = function(orient) {
	  var elems = jQuery('.aa_mobile_stretch');
	  for(var i=0;i<elems.length;i++) {
		  if (elems[i].StretchHeight) elems[i].StretchHeight();
		  if (elems[i].StretchWidth) elems[i].StretchWidth();

	      if (elems[i].IScroll) elems[i].IScroll.refresh();
	  }
    }
    window.addEventListener("resize", aa_MobileDeviceBottomRight_orientation, false);
//    aa_add_onorientationchange(aa_MobileDeviceBottomRight_orientation);
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

function aa_addWindowResizeListener(element,callback)
{
	window.aavar_resizeListeners = window.aavar_resizeListeners || [];
	aavar_resizeListeners.push( {element: element, callback: callback } );
	
	if (!window.aavar_resizeCallback) {
		window.aavar_resizeCallback = function() 
		{
			var newListeners = [];
			for(var i=0;i<aavar_resizeListeners.length;i++) {
				try {
					if (ajaxart.isattached(aavar_resizeListeners[i].element)) {
						newListeners.push( aavar_resizeListeners[i] );
						aavar_resizeListeners[i].callback();
					}
				} catch(e) {
					ajaxart.logException('exception in window resize',e);
				}
			}
			aavar_resizeListeners = newListeners;
		}
	    window.addEventListener("resize", aavar_resizeCallback );
	}
}
aa_gcs("ui", 
{
  Image: function (profile,data,context)
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
  HtmlControl: function (profile,data,context)
  {
	  var html = aa_text(data,profile,'Html',context);
	  var css = aa_text(data,profile,'Css',context);
	  var div = document.createElement("DIV");
	  if (aa_bool(data,profile,'WordWrap',context))
		  div.style.whiteSpace = "normal";
	  div.innerHTML = html;
	  if (css != "")
		  div.className = aa_attach_global_css(css);
	  return [div];
  },
  Text: function (profile,data,context)  // GC of ui.Text
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
  ControlWithAction: function (profile,data,context)
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
  DataBind: function(profile,data,params)
  {
	var newData = ajaxart.getVariable(params,"InputForChanges");
    var script = aa_first(data,profile,'Script',params);
	var element = data;
	
	ajaxart.databind(element,newData,params,script);
	
	return data;
  },
  ElementOfClass : function(profile, data, params) {
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
	  HasClass: function (profile,data,context)
	  {
		  var cls = aa_text(data,profile,'Cls',context);
		  if ( jQuery(data).hasClass(cls) )
			  return ["true"];
		  return [];
	  },
	  Html: function (profile,data,params)
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
	  },
	  ControlWithCss: function (profile,data,context)
	  {
		var control = ajaxart.run(data,profile,'Control',context);
		var css = aa_text(data,profile,'Css',context);
		jQuery(control).addClass(aa_attach_global_css(css));
		return control;
	  },
	  ItemList: function (profile,data,context,override_items,override_aspects)
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
	 	Document: function (profile,data,context)
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
	 	UseGroupAsPage: function (profile,data,context)
	 	{
	 		return [{
	 			ID: 'inner_page',
	 			Fields: [],
	 			Control: function(data1,ctx) {
			 		var groupID = aa_text(data,profile,'Group',context);
			 		var cntr = ctx.vars._Cntr && ctx.vars._Cntr[0];
			 		if (!cntr)  { ajaxart.log('UseGroupAsPage: Can not find cntr','error'); return []; }
			 		var groupField = aa_fieldById(groupID,cntr.Fields);
			 		if (!groupField) ajaxart.log('Can not find group ' + groupID + ' in container ' + cntr.ID[0],'error');
			 		this.Fields = groupField ? [groupField] : [];

	 				var pageParams = ctx.vars._PageParams[0];
	 				var groupData = pageParams ? pageParams.DataItems[0].Items : data1;
//	 				var aspects = ajaxart.runScriptParam([],pageParams.Aspect,ctx); 
	 				if (groupField)
	 				  return groupField.Control(groupData,ctx);
	 				return [];
	 			}
	 		}];
	 	},
	 	ToggleClassByCondition:function (profile,data,context)
	 	{
	 		var elem = aa_first(data,profile,'Element',context);
	 		if (! ajaxart.ishtml_item(elem)) return [];
	 		var condition = aa_bool(data,profile,'ClassCondition',context);
	 		var cls = aa_text(data,profile,'Class',context);
	 		if (condition)
	 			jQuery(elem).addClass(cls);
	 		else
	 			jQuery(elem).removeClass(cls);
	 		return [];
	 	}
});

aa_gcs("uiaction",{
   GoToPage: function(profile, data, context)
   {
  	 var url = aa_text(data,profile,'Url',context);
  	 if (url == "") return;
  	 var type = aa_text(data,profile,'Type',context);
  	 var target = (type == 'navigate current page') ? "_top" : "_new";
     if (ajaxart.inPreviewMode == true) return [];
     
  	 if (target == "_new") {
		var controls = ajaxart.getControlElement(context);
		if (controls.length > 0 && !ajaxart.isattached(controls[0])) return data;
		target = "_blank";
  	 }
  	 window.open(url,target);
  	 return data;
   },
	AddClass: function(profile, data, context)
	{
		var classes = aa_text(data,profile,'Cls',context);
		var element = ajaxart.getControlElement(context,true);
		jQuery(element).addClass(classes);
		return data;
	},
   RunUiActions : function(profile, data, context)
   {
	    var actions = ajaxart.subprofiles(profile,'Action');
		var newContext = ajaxart.clone_context(context);
	    ajaxart.setVariable(newContext,"ControlElement",data);
	    var inp = ajaxart.getVariable(context,"InputForChanges");
	    for(var i=0;i<actions.length;i++)
	    	var subresult = ajaxart.run(inp,actions[i],"",newContext);
	    
	    return data;
   },
	SetText: function(profile, data, context)
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
	    		aa_xFireEvent(element, 'keydown', {keyCode: text.charCodeAt(i), CharByChar: true}, context.vars.InTest != null);
	    		aa_xFireEvent(element, 'keyup', {keyCode: text.charCodeAt(i), CharByChar: true}, context.vars.InTest != null);
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
			aa_xFireEvent(element, 'keydown');
			aa_xFireEvent(element, 'keyup');
		}

		if (! aa_bool(data,profile,'StayInControl',context))
			aa_xFireEvent(element, 'blur', null);

		aa_inuiaction = false;
		return [];
	}
});

aa_gcs("uipref",{
	InCookies: function (profile,data,context)
	{
		var obj = {
		  GetProperty: function(data1,ctx) {
			var prefix = aa_totext(ctx.vars.Prefix);
			var property = aa_totext(ctx.vars.Property);
			var out = ajaxart.cookies.valueFromCookie(prefix+property);
			if (out == null) return [];
			return [out];
		  },
		  SetProperty: function(data1,ctx) {
			var prefix = aa_totext(ctx.vars.Prefix);
			var property = aa_totext(ctx.vars.Property);
			var value = aa_totext(ctx.vars.Value);

			ajaxart.cookies.writeCookie(prefix+property,value);
		  }
		}
		return [obj];
	},
	PrefValue: function (profile,data,context)
	{
		var prefix = aa_text(data,profile,'Prefix',context);
		var property = aa_text(data,profile,'Property',context);
		var out = ajaxart_getUiPref(prefix,property,context);
		if (out == null)
			return [];
		else
			return [out];
	},
	SetPrefValue: function (profile,data,context)
	{
		var prefix = aa_text(data,profile,'Prefix',context);
		var property = aa_text(data,profile,'Property',context);
		var value = aa_text(data,profile,'Value',context);
		ajaxart_setUiPref(prefix,property,value,context);
		return [];
	}
});

/********* Xtml **********/
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

ajaxart.xtml = ajaxart.xtml || {};
/********** yesno *************/
ajaxart.yesno = ajaxart.yesno || {};
ajaxart.yesno.is_empty = function(data,checkInnerText) {
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
ajaxart.yesno.itemsEqual = function(item1,item2)
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

/*** jBart API ***/
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
function jbart_run_widget_action(componentName,input)
{
	var data = [];
	if (typeof(input) != "undefined") data = [input];
	var profile = ajaxart.parsexml('<xtml t="sample.' + componentName + '" />');
	var widget = jQuery('.jBartWidget')[0];
	var context = ajaxart.newContext();
	if (widget) context = widget.firstChild.ajaxart.params;
	else {  // in jbart studio
		var ctrl = jQuery('.aa_with_bartcontext')[0];
		if (ctrl) context = ctrl.ajaxart.params;
	}
	ajaxart.run(data,profile,'',context);
}

/*
 * params:
 * ** The Widget
 * 		widget_src : the xtml source code of the widget (also called widget)
 *  or
 *  	widget_id: the id of the widget. e.g. shai__myWidget
 *  	widget_repository: default it jbartdb. e.g. //jbartdb.appspot.com/
 *  
 *  *** More params
 *  page: the page to show - default is defined in the widget 
 *  language: i18n. e.g. hebrew
 *  spinner: you can define your own url or leave the null value to use the default spinner.
 *  nospinner: if true, no spinner is used
 *  
 *  *** Callbacks
 *  success: function called after the widget is loaded and attached
 *  error(e): function called on error
 */
jBart.appendWidget = function(place_to_add,params,jbartObject)
{
		function handleError(message) {
			ajaxart.log(message);
			params.error({message: message});
		}
		jBart.settings = params;
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
			addToGoogleAnalytics(widget_id);

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

		function addToGoogleAnalytics(widgetId) {
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
					widgetId,
					''
				]);
			} else {
			     var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
			     ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			     var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			     setTimeout(function() { addToGoogleAnalytics(widgetId); },3000);
			}
		}
}
jBart.dialogs = {};
jBart.bart = {};
jBart.isReady = false;
jBart.ready = function(func) {
	if (jBart.isReady)
		ajaxart.ready(func,[],[]);
	else
		jBart.bind(jBart,'ready',func);
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
jbart_init();
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
/************ text ****************/

if (!aa_text) aa_text = {};
function aa_text_matchesRegex(str,pattern) {
	return str.match('^' + pattern + '$');
}

aa_text_cacheFastFind = {}
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
function ajaxart_language(context)
{
	if (context.vars.Language == null || context.vars.Language.length == 0) return "";
	return ajaxart.totext( context.vars.Language[0] );
}
function aa_multilang_text(data,script,field,context)
{
	return ajaxart_multilang_run(data,script,field,context)[0] || '';
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
jBart.multiLang = function(text,context) { return ajaxart_multilang_text(text,context); }

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

/********** data ***********/
ajaxart.lookup_cache = {};
ajaxart.occurrence_cache = {};
ajaxart.unique_number = 1;
function aa_ifThenElse(profile,data,context)
{
	if (aa_bool(data,profile,'If',context))
		return ajaxart.run(data,profile,'Then',context);
	else
		return ajaxart.run(data,profile,'Else',context);
}
ajaxart.cookies = {
		  valueFromCookie: function(name)
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
		  },
		  writeCookie: function(cookie,value)
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
		  },
		  cleanCookies: function(prefix)
		  {
			var ca = decodeURIComponent(document.cookie).split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(prefix) == 0) ajaxart.cookies.writeCookie(c.split('=')[0],'');
			}
		  }
		}

/******* action async **********/
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
/************* bart **************/
function ajaxart_resourceByID(id,context)
{
	if (!context.vars._BartContext) return null;
	var bc = context.vars._BartContext[0];
	if (!bc.Resources) return null;

	var res = bc.Resources;
	for(var i=0;i<res.length;i++)
		if (aa_totext(res[i].ID) == id)
			return res[i];
	
	return null;
}

/************* dialog **************/
ajaxart.dialog = { openPopups: []};
ajaxart.dialog.currentPopup = function(context)
{
  if (ajaxart.dialog.openPopups.length > 0)
	  return ajaxart.dialog.openPopups[ajaxart.dialog.openPopups.length-1];
}

ajaxart.dialog.closeDialog = function()
{
	var topDialogDiv = openDialogs.pop();
	aa_remove(topDialogDiv.dialogContent,false);
	aa_remove(topDialogDiv,false);
	aa_noOfOpenDialogs--;
	return topDialogDiv;
}
ajaxart.dialog.positionPopup = function(popup, callerControl, __to_del, noPaddingToCallerControl, context, forceUpperPopup)
{
	var jPopup = jQuery(popup);
	var scroll = ajaxart_scroll_offset();
	var screen = ajaxart_screen_size();
	
	var popup_pos = { left:0, top:0 }, caller_control_d = { width:0, height:0 };
	if (callerControl != null) {
		popup_pos = {  left : aa_absLeft(callerControl) 
			  ,top: aa_absTop(callerControl) + callerControl.offsetHeight  };
		caller_control_d = { width: jQuery(callerControl).width(), height:jQuery(callerControl).height()};
	}
	else if (context && context.vars.MousePos)
		popup_pos = { left: context.vars.MousePos[0].pageX, top: context.vars.MousePos[0].pageY };
	
	var padding = (noPaddingToCallerControl) ? 0 : 2;
	if (forceUpperPopup || (screen.height + scroll.y < popup_pos.top + jPopup.height() &&
			scroll.y <= popup_pos.top - jPopup.height() - caller_control_d.height))	// going up
	{
		popup_pos.top  -= jPopup.height() + caller_control_d.height + padding ;
		popup.RePosition = function() {
			ajaxart.dialog.positionPopup(popup, callerControl, null, noPaddingToCallerControl, context, true);
		}
	}
	else
		popup_pos.top += padding;
	
	if ((screen.width + scroll.x < popup_pos.left + jPopup.width() &&
			scroll.x <= popup_pos.left - jPopup.width() - caller_control_d.width))	// going left
	{
		popup_pos.left  = screen.width + scroll.x - jPopup.width() - caller_control_d.width;
		popup.RePosition = function() {
			ajaxart.dialog.positionPopup(popup, callerControl, null, noPaddingToCallerControl, context, true);
		}
	}
	  var fixed_location = false;
	  jQuery(callerControl).parents().each(function() { if (jQuery(this).css("position") == 'fixed') fixed_location=true; } );
	  if (fixed_location) { jPopup[0].style.position = 'fixed'; }
	
	if (jQuery(callerControl).parents('.right2left').length > 0) {
		jPopup.css("right",document.body.clientWidth - caller_control_d.width - popup_pos.left);
		jPopup.addClass('right2left');
	}
	else
		jPopup.css("left",popup_pos.left);
	jPopup.css("top",popup_pos.top).fadeIn(150);
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
function ajaxart_scroll_offset() {
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
	return { x:scrollOffsetX, y:scrollOffsetY };
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
function ajaxart_dialog_close_all_popups()
{
   	aa_closePopup(ajaxart.dialog.openPopups[0]);
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
	popup.capturing = true;
}

function aa_uncapture_for_popup(popup)
{
	// console.log("aa_uncapture_for_popup " + popup.onElem.parentNode.Field.Id);
	if (!popup || !popup.capturing) return;
	var orig_mousedown = popup ? popup.Orig_mousedown : null;
	if (window.captureEvents) // FF
		window.onmousedown = orig_mousedown;
	else  // IE
		document.onmouseclick = orig_mousedown;
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
	if (top_popup != popup) ;
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

function aa_contentsOfOpenPopup()
{
	var popup = ajaxart.dialog.openPopups[ajaxart.dialog.openPopups.length-1];
	if (popup != null)
		  return [popup.contents];
	return [];
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

/*************** action **************/
aa_delayedRun = function(func,id,delay,milliToForce) 
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
};
/******************* xml *******************/

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

ajaxart.xml.xpath = function(xml,xpath,createIfNotExist,defaultValue) 
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
};
ajaxart.xml2text = function(xml) 
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
};
ajaxart.xml.clone = function(xml)
{
	if (xml.length == 0) return null;
	return xml[0].cloneNode(true);
}
ajaxart.xml.prettyPrint = function(xml,indent,compact)
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
ajaxart.isxmlelement = function(xml)
{
	return (ajaxart.isxml(xml) && xml.nodeType == 1);
};
jBart.xpath = function(xml,xpath,createIfDoesNotExist) {
	return aa_xpath(xml,xpath,createIfDoesNotExist);
}
function aa_xpath(xml,xpath,createIfDoesNotExist) {
	return ajaxart.xml.xpath(xml,xpath,createIfDoesNotExist);
}
aa_xmlinfos = [];
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
function aa_removeXmlInfo(xml,context)
{
  for(var i=aa_xmlinfos.length-1;i>=0;i--)   // we'll probably use the last ones defined 
	  if (aa_xmlinfos[i].Xml == xml) { 
		  aa_xmlinfos.splice(i,1); 
		  return;
	  }
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
ajaxart.xml.xml_changed = function(xml)
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
ajaxart.xml.getModifyInfo = function(xml)
{
	for(var i=0;i<ajaxart.xmlsToMonitor.length;i++)
		if ( ajaxart.xmlsToMonitor[i].xml == xml )
			return ajaxart.xmlsToMonitor[i].modifyInfo;
	return null;
}
ajaxart.xml.parentNode = function(node)
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
ajaxart.replaceXmlElement = function(old_elem,new_elem,ishtml,cleanMemoryLeaks)
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
/******************* ui ********************/
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
function aa_addOnDetach(elem,func)
{
	jQuery(elem).addClass('aa_ondetach');
	elem.OnDetach = func;
}
function aa_urlAttribute(context,attr)
{
	var urlProvider = null;
	if (context.vars._BartContext) urlProvider = context.vars._BartContext[0].Url;
		
	if (urlProvider) 
		return aa_totext( ajaxart_runMethod([],urlProvider,'GetValue',aa_ctx(context,{Attribute: [attr]})) );
	
	var url = window.location.href.split('#');
	if (url.length == 1) return "";
	var fragment = url[1];
	if (fragment.indexOf('?'+attr+'=') == -1) return "";
	var out = fragment.split('?'+attr+'=')[1].split('?')[0];
	return out.split(';')[0];
}
function aa_urlChange(context,newurl)
{
	var urlProvider = null;
	if (context.vars._BartContext) urlProvider = context.vars._BartContext[0].Url;
		
	if (urlProvider) 
    	return aa_totext( ajaxart_runMethod([],urlProvider,'Update',aa_ctx(context,{ValuePairs: [newurl]})) );
	
	var url = window.location.href.split('#');
	var frag = url.length == 1 ? "" : url[1];
	var script = ajaxart.parsexml('<xtml t="bart_url.NewUrlFragment" Current="'+frag+'" Proposed="'+newurl+'"/>');
	var newfrag = aa_text([],script,'',context);
	var new_url = url[0] + "#" + newfrag;
	if (window.location.href != new_url)
	{
		  if (window._gaq) // google analytics 
			  _gaq.push(['_trackPageview', '/' + new_url.split('/').pop()]);

		window.location = new_url;
	}
}
/******************* uiaction ********************/
function aa_xFireEvent(element,eventName,properties,inTest){
	window.__DOMEvents = window.__DOMEvents  || {
		  focusin:{eventGroup:"UIEvents",init:function(e,p){e.initUIEvent("focusin",true,false,window,1);}},
		  focusout:{eventGroup:"UIEvents",init:function(e,p){e.initUIEvent("focusout",true,false,window,1);}},
		  activate:{eventGroup:"UIEvents",init:function(e,p){e.initUIEvent("activate",true,true,window,1);}},
		  focus:{eventGroup:"UIEvents",init:function(e,p){e.initUIEvent("focus",false,false,window,1);}},
		  blur:{eventGroup:"UIEvents",init:function(e,p){e.initUIEvent("blur",false,false,window,1);}},
		  click:{eventGroup:"MouseEvents",init:function(e,p){e.initMouseEvent("click",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
		  dblclick:{eventGroup:"MouseEvents",init:function(e,p){e.initMouseEvent("click",true,true,window,2,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
		  mousedown:{eventGroup:"MouseEvents",init:function(e,p){e.initMouseEvent("mousedown",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
		  mouseup:{eventGroup:"MouseEvents",init:function(e,p){e.initMouseEvent("mouseup",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
		  mouseover:{eventGroup:"MouseEvents",init:function(e,p){e.initMouseEvent("mouseover",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
		  mousemove:{eventGroup:"MouseEvents",init:function(e,p){e.initMouseEvent("mousemove",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
		  mouseout:{eventGroup:"MouseEvents",init:function(e,p){e.initMouseEvent("mousemove",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
		  load:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("load",false,false);}},
		  unload:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("unload",false,false);}},
		  select:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("select",true,false);}},
		  change:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("change",true,false);}},
		  submit:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("submit",true,true);}},
		  reset:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("reset",true,false);}},
		  resize:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("resize",true,false);}},
		  keyup:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("keyup",true,false);}},
		  keydown:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("keydown",true,false);}},
		  scroll:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("scroll",true,false);}}
	} 
	  // Attempts to fire a DOM event on an element
	  // param name="element" type="Element" The element or its identifier to fire the event
	  // param name="eventName" type="String" The name of the event to fire (without an 'on' prefix)
	  // param name="properties" type="Object" Properties to add to the event
	  //   e.g. {cancelBubble:false, returnValue:true}
	  // returns type="Boolean" True if the event was successfully fired, otherwise false
	  try{
	    properties=properties||{};
	    if(document.createEvent){
	      // DOM compatible browsers
	      if(element==window && !element.dispatchEvent){
	        // Safari3 doesn't have window.dispatchEvent()
	        element=document;
	      }
	      var def=__DOMEvents[eventName];
	      if(def){
	        var event=document.createEvent(def.eventGroup);
 	      	if (inTest) 
 	      		for(var property in properties)
 	      			try { event[property]=properties[property]; } catch(e) {} // button property throws..
	        def.init(event,properties);
	        event.srcElement = null;
	        if (ajaxart.isChrome && inTest)
	        {
	        	try {
	        	  event.tDebug = ajaxart_source_elem_in_test;
	        	} catch(e) {}
	        }
//	        for(var property in properties)
//	        	event[property] = properties[property];
      	element.dispatchEvent(event);
	        return true;
	      }
	    }else if(document.createEventObject){
	      // IE family
	      if(element==document){
	        // IE6,IE7 thinks window==document and doesn't have window.fireEvent()
	        // IE6,IE7 cannot properly call document.fireEvent()
	        element=document.documentElement;
	      }
	      var event=document.createEventObject();
	      //Object.extend(event,properties);
	      element.fireEvent("on"+eventName,event);
	      return true;
	    }
	  }catch (e){
	  }
	  return false;
	}

// asynch
aa_async_finished_listeners = [];
function ajaxart_async_CallBack(data,context)
{
	if ( context.vars._AsyncCallback != null && context.vars._AsyncCallback.callBack != null) {
		var success = context.vars._AsyncCallback.success;
		if (success == null) success = true;
		context.vars._AsyncCallback.callBack(data,context,success);
	}
}
function ajaxart_async_Mark(context,isQuery)
{
	if ( context.vars._AsyncCallback != null ) context.vars._AsyncCallback.marked = true;
	if (isQuery) context.vars._AsyncIsQuery = true;
}
ajaxart_async_GetCallbackObj = function(context)
{
	var out = context.vars._AsyncCallback;
	if (out == null) out = [ { callBack: function() {}, marked: false, success:true } ];
	context.vars._AsyncCallback = out;
	return out;
}
function aa_fire_async_finished()
{
	// let sync actions finish
	setTimeout(function() {
		for(var i=aa_async_finished_listeners.length-1;i>=0;i--)
			aa_async_finished_listeners[i].OnAsyncActionFinished();
	},1);
}
function aa_is_rtl(elem,ctx)
{
	if ( jQuery(elem).parents('.right2left').length > 0 ) return true;
	if (!elem && jQuery("body").find('.right2left').length > 0) return true;
	if (ctx && aa_totext(ctx.vars.Language) == 'hebrew') return true;
	return false;
}

function aa_createElement(elem, tag)
{
	if (elem == null || !ajaxart.isxml(elem))
		return ajaxart.parsexml("<" + tag + "/>");
	if (ajaxart.isBackEnd)
		return elem.getOwnerDocument().createElement(tag);
	return elem.ownerDocument.createElement(tag);
}
function aa_refresh_field(field_ids,scope,fire_on_update,transition,context)
{
	if (scope == 'parent')
	{
		// look in parents
	}
	var top = window.aa_intest ? aa_intest_topControl : document;
	if (scope == "screen")
	  top = window.aa_intest ? aa_intest_topControl : document;
	else if (scope == "group")
	  top = context.vars._Cntr[0].Ctrl;
	else if (scope == "document" || scope == 'parent')
	  { top = context.vars._Cntr[0].Ctrl; }
	else if (scope == "table row")
	  { top = jQuery(context.vars.ControlElement[0]).parents('.aa_item')[0]; }
	for(var j in field_ids)
	{
		var cls = "fld_" + field_ids[j];
		var ctrls = (scope == 'parent') ? jQuery(top).parents('.'+cls).get() : jQuery(top).find('.'+cls).get();
		if (jQuery(top).hasClass(cls)) ctrls.push(top);
		
		for(var i=0;i<ctrls.length;i++)
		{
			aa_refresh_cell(ctrls[i],context,transition);
//			if (fire_on_update)
//				aa_invoke_field_handlers(td.Field.OnUpdate,td,null,td.Field,td.FieldData);
		}
		if (!ctrls.length) { ajaxart.log("RefreshField: cannot find field " + field_ids,"location"); }
	}
	aa_fixTopDialogPosition();
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
function aa_keepimageprops(img,user_width,user_height)
{
	var imgObj = new Image(); imgObj.src = img.getAttribute('src');
	if (imgObj.complete) aa_fixImageSize(img,user_width,user_height); 
	else {
		img.onload = function() { aa_fixImageSize(img,user_width,user_height); }
	}
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
function aa_set_initialize_container(aspect,func)
{
	aspect.InitializeContainer = function(data1,ctx) {
		var cntr = ctx.vars._Cntr[0];
		func(aspect,ctx,cntr);
	}
}
function aa_add_to_comma_separated(list,item)
{
	if (list == '') return item;
	if ((list+',').indexOf(','+item+',') > -1) return list;  // already inside. no need to add it again
	return list + ',' + item;
}
function aa_comma_size_to_css(size)
{
  size = size.replace(/px/g,"")
  var parts = size.split(',');
  var out = "";
  var width = parts[0];
  if (width != "") {
	  if (width.indexOf('%') == -1) width += "px";
	  out += "width:"+width+";";
  }
  if (parts.length == 1) return out;
  var height = parts[1];
  if (height != "") {
	  if (height.indexOf('%') == -1) height += "px";
	  out += "height:"+height+";";
  }
  return out;
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

function aa_JSON2Xml(obj,tag,result)
{
	return json2Xml(obj || {},result || ajaxart.parsexml('<' + tag + '/>'),0);
	function json2Xml(obj,result,depth)
	{
		if (depth == 20) { ; return '<TooMuchRecursion/>'; }
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
					;
					alert(e);
		}
		return result;
	}
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

function aa_attach_style_css(style)
{
	if (!style.CssClass) 
		style.CssClass = aa_attach_global_css(style.Css);
	return style.CssClass;
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
function aa_adapt_css_for_browser(css, forAllBrowsers)
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
	return css;
}
function aa_cssClass(data,profile,field,context,classSuffixName,moreSettings) {
	moreSettings = moreSettings || {};
	var css = aa_text(data,profile,field,context);
	return aa_attach_global_css(css,null,classSuffixName,moreSettings.supportWrapper,moreSettings.lowPriority,context);
}
function aa_attach_global_css(globalcss,cntr,className,supportWrapper,lowPriority,context,settings)
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
		if (!aa_is_css_well_formed(obj.globalcss)) {
			var error = [];
			aa_is_css_well_formed(obj.globalcss,error);
			ajaxart.log("Css is invalid: " + error[0] + ". Css: " + obj.globalcss,"error");
			return "";
		}
		obj.globalcss = obj.globalcss.replace(/#this/g,'.'+obj.elem_class);
		if (supportWrapper)
		  obj.globalcss = obj.globalcss.replace(/#wrapper/g,'.'+obj.elem_class+'_wrapper');
		if (obj.cntr_class)
			obj.globalcss = obj.globalcss.replace(/#cntr/g,'.'+obj.cntr_class);
		
//		obj.globalcss = aa_expandCuscoVariablesMustacheStyle(obj.globalcss,context);
		obj.globalcss = obj.globalcss.replace(/_jbartImages_/g,aa_base_images());
		 
		if (settings && settings.fixGlobalCss) obj.globalcss = settings.fixGlobalCss(obj.globalcss);

		var styleElem = jBart.styleElem;
		if (!styleElem) {
			jBart.styleElem = jQuery("<style></style>")[0];
			var head = document.getElementsByTagName("head")[0];
			head.appendChild(jBart.styleElem);
		}
		if (lowPriority)
			jBart.styleElem.innerHTML = obj.globalcss + '\n' + jBart.styleElem.innerHTML;
		else
			jBart.styleElem.innerHTML = jBart.styleElem.innerHTML + '\n' + obj.globalcss;
		// obj.styleElem.StyleObject = obj;
	}
	
	if (cntr && aa_container_styles[globalcss].cntr_class)
		jQuery(cntr).addClass(aa_container_styles[globalcss].cntr_class);
	return aa_container_styles[globalcss].elem_class;
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
		if (error) error.push('There are characters aftet the last closing bracket');
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
function aa_setCssText(elem,cssText)
{
  if (ajaxart.isFireFox) cssText = cssText.replace(/-webkit-/g,'-moz-');
  elem.style.cssText = cssText;
}
function aa_in_textlist(list,item)
{
  if (list.indexOf(','+item+',') == -1) return false;
  return true;
}
function aa_add_onorientationchange(func)
{
	if (!window.aav_onorientationchange) window.aav_onorientationchange = [];
	aav_onorientationchange.push(func);
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
function aa_addOnAttachMultiple(elem,func)
{
	jBart.bind(elem,'_OnAttach',func);
	aa_addOnAttach(elem,function() {
		jBart.trigger(elem,'_OnAttach');
	});
}
function aa_addOnAttach(elem,func)
{
	jQuery(elem).addClass('aa_onattach');
	elem.OnAttach = func;
	if (ajaxart.isattached(elem)) elem.OnAttach();
}
function aa_defineElemProperties(elem,properties)
{
	if (!elem.jBartDomProps) elem.jBartDomProps = properties.split(',');
	else ajaxart.concat(elem.jBartDomProps,properties.split(','));
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
jBart.remove = function(elem) { aa_remove(elem,true); }
function aa_remove_from_list(list,item)
{
	for(var i in list)
		if (list[i] == item) {
			list.splice(i,1);
			return;
		}
}
function aa_renderStyleObject(style,objectProperties,context,objectIsNotTheElement,settings)
{
	if (style.Field) {  // style by field
		var object = aa_api_object(jQuery('<div/>')[0],objectProperties,objectIsNotTheElement);
		var item = objectProperties.data ? [objectProperties.data] : [];
		var wrapper = document.createElement('div');
		var ctx = aa_ctx(context,{ ApiObject: [object] });
		var styleField = style.Field(item,ctx); 
		aa_fieldControl({ Field: styleField, Item: item, Wrapper: wrapper, Context: ctx });
		var content = jQuery('<div style="dispaly:inline-block;"/>').append(wrapper);
		object.control = content[0];
		object.wrapperForStyleByField = wrapper;
		content[0].jbApiObject = object;
		return content[0];
	}
	style.Html = style.Html.replace(/>\s+</g,'><');		// allow indentation in html without injecting whitespaces. e.g: <div class="text"/> <div class="separator" /> 
	var jElem = jQuery(style.Html);
	if (!jElem[0]) jElem = jQuery('<div/>');
	var object = aa_api_object(jElem,objectProperties,objectIsNotTheElement);
	var cntr = context.vars._Cntr ? context.vars._Cntr[0] : null;
	jElem.addClass(aa_attach_global_css(style.Css,cntr,null,false,false,context,settings)); 
	aa_apply_style_js(object,style,context);
	
	return jElem[0];
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
					eval('compiledJs.jsFunc = function(obj,context,funcToRun) { ' + style.Javascript + '\n' + funcName + '(obj,context); };');
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
function aa_find_class(jElem,cls)
{
	if (jElem.hasClass(cls)) return jElem;
	return jElem.find('.'+cls);
}
function aa_init_image_object(image,data,context)
{
	if (typeof(image) == 'string') return {StaticUrl: image, Size: ''};
	if (!image || !image.Url) return;
	image.StaticUrl = aa_totext(image.Url(data,context));
	return image;
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
function aa_runActionOnClick(callback_func) {
  return function(e) {
	  var inner = jQuery(this)[0];
	  if (window.aa_incapture) return false;
	  if (inner.jbLastTimeClicked) {
		  if (new Date().getTime() - inner.jbLastTimeClicked < 300) return false; // double click
	  } 
	  inner.jbLastTimeClicked = new Date().getTime();
	  callback_func.call(inner,{event: e}); return false;
  }
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
//whenever an html content changes, one needs to call aa_htmlContentChanged
//It will fix dialog sizes , special scrollbars (iscroll , tuiny scrollbar, etc.)
//To do something when the html content changes, one can define contentChanged method for an html element
function aa_htmlContentChanged(elem)
{
	while (elem != null) {
		if (elem.contentChanged) elem.contentChanged();
		elem = elem.parentNode;
	}
}
function aa_jbart_image(image,context)
{
   var base = (context.vars._Images && context.vars._Images[0]) || '';
   return base + image;
}
if (! window.aa_base_images)
aa_base_images = function()
{
	if (window.location.href.indexOf('http://localhost/') == 0 || window.location.href.indexOf('https://localhost/') == 0)
		return 'images';
	return ajaxart.base_images || '';
};

if (! window.aa_base_lib)
aa_base_lib = function()
{
	if (window.location.href.indexOf('http://localhost/') == 0 || window.location.href.indexOf('https://localhost/') == 0)
		return 'lib';
	return ajaxart.base_lib || '';
};

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
		  url = url + "&aa_postdata" + encodeURIComponent(params.data);
	  jQuery.ajax( { cache: false ,dataType: 'script', httpHeaders : [], url: url });
	}
}
jBart.aa_crossdomain_call = aa_crossdomain_call;	// to be able to access it from outside

jBart.utils.getWidgetIDFromContext = function(context)
{
	if (context.vars.WidgetId) return aa_totext(context.vars.WidgetId);
	
	var elem = context.vars._BartContext[0].AppXtml;
	while (elem && elem.tagName != 'bart_sample' && elem.tagName != 'jbart_project')
		elem = elem.parentNode;
	if (elem) return elem.getAttribute('id') || '';
	return '';
}

jBart.utils.removeFromArray = function(array,object)
{
	for(var i=0;i<array.length;i++)
		if (array[i] == object) {
			array.splice(i,1);
			return;
		}
}
jBart.utils.refresh = function(element)
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
function aa_bind(object,eventType,handler,identifier) {
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

jBart.trigger = aa_trigger;
jBart.bind = aa_bind;

jBart.activator = function(widgetSource) {
	return {
		show: function(div,params) {
			var jbartObject = this;
			jBartPreloader(function () {
				if (!params) params = {};
				if (!params.widget_src)
					params.widget_src = widgetSource;
				jBart.appendWidget(div,params,jbartObject);				
			});
		},
		jBart: jBart
	}
} 
jBart.parsexml = function(contents,baseXml) { return ajaxart.parsexml(contents,'','',false,baseXml); }

// settings include: 
// url 
// variableToFind - look for a variable under window
// isLoaded (optional) - a callback function which returns true when the js is loaded
// loadFunction (optional) - allows a different loading js rather than aa_load_js_css(url)
// success, error - callback functions
jBart.loadJsFile = function(settings) {
	settings.success = settings.success || function() {}
	if (!settings.isLoaded ) {
		settings.isLoaded = function() {
			if (!settings.variableToFind) return true;
			if (window[settings.variableToFind]) return true;
			return false;
		}
	}
	function checkLoaded() {
		try {
			if (settings.isLoaded()) return true;
		} catch(e) {}
		return false;
	}

	var availableTries = 20;
	var firstTime = true;
	checkWithTimeout();
	
	function checkWithTimeout()
	{
		if (checkLoaded()) return settings.success();
		if (firstTime) {
			if (settings.loadFunction) settings.loadFunction(settings.url);
			else aa_load_js_css(settings.url, 'js');
		}
		firstTime = false;
		
		if (--availableTries <=0 ) {
			settings.error = settings.error || function() {}
			return settings.error();
		}
		setTimeout(checkWithTimeout,500);
	}
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
	if (settings.jbartObject) settings.jbartObject._BartContext = bctx;	// to be used from outside

	var ctx = aa_ctx(context, { 
		_GlobalVars: [globalVars], _UIPref: [uiprefObj], Language: [language] , 
		_BartContext: [bctx], _WidgetXml: [widgetXml]
	});
	loadSampleComponents();		
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
	
	if (settings.ControlToShowInBartContext) // for auto tests
		return settings.ControlToShowInBartContext([],ctx);
	
	aa_register_document_events(ctx);
    return out;

    function loadSampleComponents() {
    	var comps = aa_xpath(widgetXml,"bart_dev/db/bart_unit/bart_unit/Component");
    	var ns = 'sample';
    	ajaxart.components[ns] = ajaxart.components[ns] || {};
    	
    	for(var i=0;i<comps.length;i++) {
  	      ajaxart.components[ns][comps[i].getAttribute("id")] = comps[i];
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
function aa_global_vars()
{
	window.jBartWidgets = window.jBartWidgets || { vars: {}};
	return jBartWidgets.vars;
}

function aa_loadRequiresJSFiles(settings) {
	/* Ensures some js files are loaded, and loads them if not loaded */
	var currentLoadIndex = -1;
	var timeOfAddingJsFile;

	settings.onload = settings.onload || function() {};
	settings.onerror = settings.onerror || function() {};
	
	step();

	function step() {
		currentLoadIndex++;
		if (currentLoadIndex >= settings.jsFiles.length) {
			settings.onload();
		} else {
			loadJsFile(settings.jsFiles[currentLoadIndex],step,settings.onerror);
		}
	}

	function loadJsFile(fileProperties,success,error) {
		if (checkJsVariable(fileProperties.jsVariable)) return success();

	    var fileref=document.createElement('script')
	    fileref.setAttribute("type","text/javascript")
	    fileref.setAttribute("src", fileProperties.url);
		document.body.appendChild(fileref);
		timeOfAddingJsFile = new Date().getTime();

		checkIfJsLoaded(fileProperties,success,error);
	}

	function checkIfJsLoaded(fileProperties,success,error) {
		if (checkJsVariable(fileProperties.jsVariable)) return success();
		if (new Date().getTime() - timeOfAddingJsFile > 15000) return error();

		setTimeout(function() { 
			checkIfJsLoaded(fileProperties,success,error);
		},400);
	}

	function checkJsVariable(jsVariable) {
		// support cases like: jQuery.fn.roundabout
		var parts = jsVariable.split(".");
		var current = window;
		for (i in parts) {
			current = current[ parts[i] ];
			if (!current) return false;
		}
		return true;
	}
}


aa_gcs("jbartdb", {
	CreateNewNodeInJBartDB: function (profile,data,context)
	{
		var xml = ajaxart.parsexml( aa_first(data,profile,'NodeXml',context) );
		if (aa_bool(data,profile,'AddTimestampToID',context)) {
			var id = xml.getAttribute('id') || '';
			id += '_' + aadate_dateObj2StdDate(new Date()).replace(/[:/ ]/g,'_');
			xml.setAttribute('id',id);
		}
		if (ajaxart.inPreviewMode) return;
		jBart.db.save({
			data: xml,
			success: function() {
				ajaxart.run([xml],profile,'OnSuccess',context);
			},
			error: function() {
				ajaxart.run(data,profile,'OnError',context);
			}
		});
	},
	CloneNodeInJBartDB: function (profile,data,context)
	{
		jBart.db.cloneNode({
			data: ajaxart.parsexml( aa_first(data,profile,'Node',context) ),
			success: function(newnode) {
				ajaxart.run([newnode],profile,'OnSuccess',context);
			},
			error: function() {
				ajaxart.run([newnode],profile,'OnError',context);
			}
		});
	},
	DeleteNodeInJBartDB: function (profile,data,context)
	{
		var node = aa_first(data,profile,'Node',context);
		if (!node || node.nodeType != 1) return;
		if (ajaxart.inPreviewMode) return;
		
		jBart.db.deleteNode({
			data: node,
			success: function(newnode) {
				ajaxart.run([newnode],profile,'OnSuccess',context);
			},
			error: function() {
				ajaxart.run([newnode],profile,'OnError',context);
			}
		});
	},
	SaveNodeAsync: function (profile,data,context)
	{
		ajaxart_async_Mark(context);
		
		var xml = ajaxart.parsexml( aa_first(data,profile,'Node',context) );
		if (ajaxart.inPreviewMode) return;

		jBart.db.save({
			data: xml,
			success: function() {
				ajaxart_async_CallBack([],context);				
			},
			error: function() {
				context.vars._AsyncCallback.success = false;
				ajaxart_async_CallBack([],context);				
			}
		});
	},
	JBartDBNode: function (profile,data,context)
	{
	    ajaxart_async_Mark(context,true);
	    
	    ajaxart.run(data,profile,'OnLoading',context);
	    
		jBart.db.get({
			id: aa_text(data,profile,'ID',context),
			contentType: aa_text(data,profile,'ContentType',context),
			success: function(node) {
				ajaxart.run([node],profile,'OnLoad',context);
				ajaxart_async_CallBack([node],context); 
			},
			error: function(error) {
				context.vars._AsyncCallback.success = false;
				ajaxart.run(data,profile,'OnError',context);
				ajaxart_async_CallBack([],context); 
			}
		});
	},
	JBartDBQuery: function (profile,data,context)
	{
	    ajaxart_async_Mark(context,true);
	    
	    ajaxart.run(data,profile,'OnLoading',context);
	    
		jBart.db.query({
			contentType: aa_text(data,profile,'ContentType',context),
			headersOnly: aa_bool(data,profile,'HeadersOnly',context),
			success: function(nodes) {
				ajaxart.run([nodes],profile,'OnSuccess',context);
				ajaxart_async_CallBack([nodes],context); 
			},
			error: function(error) {
				context.vars._AsyncCallback.success = false;
				ajaxart.run(data,profile,'OnError',context);
				ajaxart_async_CallBack([],context); 
			}
		});
	},
	LoadFullNodeFromHeader: function (profile,data,context)
	{
		var headerXml = aa_first(data,profile,'HeaderXml',context);
		var childPresent = aa_xpath(headerXml,'*').length > 0;
		if (childPresent && !aa_bool(data,profile,'DoNotLoadIfPresent',context)) return;

		while(headerXml.firstChild) headerXml.removeChild(headerXml.firstChild);

		var result = aa_asyncObject();

		jBart.db.get({
			id: headerXml.getAttribute('id'),
			contentType: headerXml.getAttribute('_type'),
			success: function(node) {
				var children = aa_xpath(node,'*');
				for(var i=0;i<children.length;i++) {
					ajaxart.xml.append(headerXml,children[i]);
				}
				aa_triggerAsync(result);				
			},
			error: function(error) {
				aa_triggerAsyncError(result,error);
			}
		});

		return [result];		
	}
});

jBart.db = jBart.db || {};
function aa_jbartdb_getServer(settings)	{
	return settings.server || (jBart.settings && jBart.settings.jbartdb_server) || ajaxart.urlparam('jbartdb_server') || '//jbartdb.appspot.com';
}
function aa_jbartdb_security_tokens() {
	var result = '';
	var instance = ajaxart.urlparam('instance'); 
	if (instance) result = '&instance=' + instance;

	var appName = ajaxart.urlparam('appName');
	var appNameMatch = window.location.href.match(/WixPage\/([^\/]+)/); // Wix
	if (appNameMatch && appNameMatch[1]) appName = appNameMatch[1];
	if (appName)
		result += '&appName=' + appName;
	return result;
}

jBart.db.get = function(settings)
{
	settings.error = settings.error || function() {};
	settings.server = aa_jbartdb_getServer(settings);
//	settings.server = 'http://localhost:8888';
	settings.cache = settings.cache || true;
	
	var ajaxSettings = { 
		url: settings.server+'/jbart_db.js?op=loadnode&contenttype='+settings.contentType+'&id='+settings.id,
		cache: false, 
		success: function(result) {
			result = ajaxart.parsexml(result);
			if (result && result.getAttribute('_type') == settings.contentType) {
				settings.success(result);
			} else {
				if (settings.defaultValue) {
					settings.defaultValue.setAttribute('_type',settings.contentType);
					settings.defaultValue.setAttribute('id',settings.id);
					settings.success(ajaxart.parsexml(settings.defaultValue));
				}
				else
					settings.error({ message: 'node ' + settings.server + '::' + settings.contentType + ':'+ settings.id + ' not found, and no default value' , code: 'node does not exist'});
			}
		},
		error: function() { settings.error({message: ''}); }
	}
	aa_crossdomain_call(ajaxSettings, true);
}
jBart.db.save = function(settings)
{
	console.log('JBartJs length' + ajaxart.xml2text(aa_xpath(settings.data,'JBartJs')[0]).length);
	settings.error = settings.error || function() {};
	settings.server = aa_jbartdb_getServer(settings);
	// settings.server = 'http://localhost:8888';
	
	if (! settings.data || settings.data.nodeType != 1 || !settings.data.getAttribute('id') || !settings.data.getAttribute('_type') ) {
		return settings.error('settings.data should be an xml of the format: <item id="xx" _type="myType" myatt="..."><myElem>..</myElem></item>');
	}
	
	settings.data.setAttribute('vid','force');

	if (!settings.data.getAttribute('_lastModified'))
		settings.data.setAttribute('_created',currentDate());	

	settings.data.setAttribute('_lastModified',currentDate());

	var id = settings.data.getAttribute('id');
	var _type = settings.data.getAttribute('_type');
	
	aa_crossdomain_call({ 
		type: 'POST',
		url: settings.server+'/bart.php?op=savenode' + aa_jbartdb_security_tokens(),
		data: ajaxart.xml2text(settings.data,false),
		cache: false, 
		success: function(result) {
			result = ajaxart.parsexml(result);
			if (result && result.getAttribute('type')=="success")
			  settings.success();
			else
			  settings.error(result);
		},
		error: function() { settings.error(); }
	},false); // false means: do not use jsonp

	function currentDate() {
		var now = new Date();
		return '' + pad(now.getDate()) + "/" + pad(now.getMonth()) + "/" + now.getFullYear() + " " + pad(now.getHours())+ ':' + pad(now.getMinutes());
	}
	function pad(i) { return i<10?'0'+i:i; }
}
jBart.db.query = function(settings)
{
	settings.error = settings.error || function() {};
	settings.server = aa_jbartdb_getServer(settings);
	if (typeof(settings.headersonly) == 'undefined') settings.headersonly = true;
	
	var headersOnly = settings.headersonly ? 'true' : 'false';
	var ajaxSettings = { 
		url: settings.server+'/jbart_db.js?op=query&contenttype='+settings.contentType+'&headersonly='+headersOnly,
		cache: settings.cache ? true : false, 
		success: function(result) {
			result = ajaxart.parsexml(result);
			settings.success(result);
		},
		error: function() { 
			settings.error({message: ''}); 
		}
	}
	aa_crossdomain_call(ajaxSettings, true);
}
jBart.db.deleteNode = function(settings) {
	settings.error = settings.error || function() {};
	settings.server = aa_jbartdb_getServer(settings);
	if (!settings.data)
		return settings.error('you must supply the node in settings.data when calling jBart.db.deleteNode');
	
	var id = settings.data.getAttribute('id'), type = settings.data.getAttribute('_type');
	if (!id || !type)
		return settings.error('you must supply the node in settings.data when calling jBart.db.deleteNode');

	aa_crossdomain_call({ 
		url: settings.server+'/jbart_db.js?op=deletenode&contenttype='+type+'&id='+id + aa_jbartdb_security_tokens(),
		cache: false, 
		success: function(result) {
			settings.success();
		},
		error: function() { 
			settings.error({message: ''}); 
		}
	}, true);
}

jBart.db.cloneNode = function(settings) {
	var newnode;
	var charsForRandomization = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
	var maxTries = settings.maxTries || 10;

	function tryRandomID(length,tryCount) {
		var str = '';
		tryCount = tryCount || 1;
		if (tryCount > maxTries) 
			return settings.error('could not create clone. Tries ' + maxTries + ' times to create a random id');

		for(var i=0;i<length;i++) {
			var rnd = Math.floor(Math.random() * charsForRandomization.length);
			str += charsForRandomization.charAt(rnd);
		}

		jBart.db.get({
			server: settings.server,
			success: function() {
				tryRandomID(length+1,tryCount+1);
			},
			error: function() {
				saveClone(str);
			}
		});
	}

	function saveClone(newid) {
		newnode.setAttribute('id',newid);
		jBart.db.save({
			server: settings.server,
			data: newnode,
			error: function(e) { 
				settings.error(e);
			},
			success: function() {
				settings.success(newnode);
			}
		});
	}

	settings.error = settings.error || function() {};
	settings.server = aa_jbartdb_getServer(settings);
	settings.cloneMethod = settings.cloneMethod || 'random number';

	if (! settings.data || settings.data.nodeType != 1 || !settings.data.getAttribute('id') || !settings.data.getAttribute('_type') ) {
		return settings.error('settings.data should be an xml of the format: <item id="xx" _type="myType" myatt="..."><myElem>..</myElem></item>');
	}
	newnode = settings.data.cloneNode(true);

	if (settings.useCounter) {
	} else {
		tryRandomID(settings.randomNumberFirstLength || 3);		
	} 
}


aa_gcs("mobile", {
	MobileSearchBoxFilter: function (profile,data,context) 
	{
		var field = { isObject : true };
		field.FieldData = function(data1) { return data1; }
		field.CellPresentation = ["control"];
		field.Style = aa_first(data,profile,'Style',context);
		var TimeBeforeStartingSearch = 0;
		
		field.Control = function(field_data,ctx) {
			var field = this;
			var style = field.Style;
			if (style.Html == "") return [];
			var jElem = jQuery(style.Html);
			var searchbox = aa_api_object(jElem);
			var _SearchBoxContext = { isObject:true };
			var items_cntr = (ctx.vars.HeaderFooterCntr || ctx.vars._Cntr)[0];
			_SearchBoxContext.ResultsPage = ajaxart.run(data,profile,'ResultsPage',context);
			_SearchBoxContext.OnSelect = function(item_data,ctx) { 
				ajaxart_runMethod([item_data],items_cntr,'OpenItemDetails',aa_ctx(ctx,{ _InnerItem: item_data, _Cntr: [items_cntr] } ));
			 };
			aa_setMethod(_SearchBoxContext,'NoResultsField',profile,'NoResults',context);
//			aa_defineElemProperties(button,'Action');
			searchbox.applyCancel = function(classOrElement) {
				var cancelButton = this.getInnerElement(classOrElement);
				cancelButton.onclick = function(e) {
					searchbox.input.Cancel();
					return aa_stop_prop(e);
				}
				searchbox.CancelButton = cancelButton;
			}
			searchbox.applySearchBox = function(classOrElement) {
				var input = this.getInnerElement(classOrElement);
				this.input = input;
				input.OriginalBody = input.PlaceForResults = jQuery(items_cntr.Ctrl).find(">.aa_cntr_body")[0];
				input.Container = ajaxart.runNativeHelper(data,profile,'ResultsContainer',aa_ctx(context,{_Field:[field], _SearchBoxContext: [_SearchBoxContext] }))[0].Cntr;
				input.MaxItemsToShow = aa_int(data,profile,'MaxItemsToShow',context);
				var items = ajaxart.run(data,profile,"Items",context);
				aa_prepare_more_items_to_show(input);
				input.onfocus = function(e) {
//					window.scrollTo(0, 1);	// iPhone fix (ugly): hide the address bar. sometimes the address bar appears when opening the search
					document.ontouchstart = function(evt){ input.blur(); }	// hiding the keyboard. todo: fix in android
					setTimeout(function() {
						if (searchbox.OnFocus)
							searchbox.OnFocus(input);
					},1);
					jQuery(input.Container.Ctrl).find(".aa_item").remove();
					aa_search(field, input, profile, context);
				}
				input.onblur = function(e) { document.ontouchstart = null; }
				input.onkeyup = function(e) {
					for(var i=0;i<aa_navigation_codes.length;i++)
						if (e.keyCode == aa_navigation_codes[i]) return true;

					jQuery(input.Container.Ctrl).find(".aa_item").remove();
					aa_search(field, input, profile, context);
				}
				input.Cancel = function() {
					input.value = "";
					input.blur();
					aa_replaceElement(input.PlaceForResults,input.OriginalBody);
					input.PlaceForResults = input.OriginalBody;
					jQuery(items_cntr.Ctrl).find(">.aa_container_footer").show();
					//jQuery(searchbox.CancelButton).hide();
					setTimeout(function() {
						if (searchbox.OnCancel)
							searchbox.OnCancel(input);
					},1);
				}
				input.ShowResults = function() {
					if (input.ResultsShown) return;
					input.ResultsShown = true;
					aa_replaceElement(input.PlaceForResults,input.Container.Ctrl);
					input.PlaceForResults = input.Container.Ctrl;
					jQuery(items_cntr.Ctrl).find(">.aa_container_footer").hide();
				}
				input.ShowNothingFound = function() {
					var noResultsCtrl = ajaxart.runNativeHelper([input.value],profile,'NoResultsControl',aa_ctx(context,{ _SearchBoxContext: [_SearchBoxContext] }))[0];
					aa_replaceElement(input.PlaceForResults,noResultsCtrl);
					input.PlaceForResults = noResultsCtrl;
					jQuery(items_cntr.Ctrl).find(">.aa_container_footer").hide();
				}
				// preprocess items
				input.PreprocessStep = 0;
				input.PreprocessChunkSize = 500;
				input.MathcedChunkSize = 2;
				input.AllItems = [];
				input.MatchedTextCssClass = aa_attach_global_css(aa_text(data,profile,'MatchedTextCss',context));
				search_in_compiled = ajaxart.compile_text(profile,"SearchIn",context);
				aa_searchbox_preprocess(items, input,field, search_in_compiled, context,0);
				// aa_preprocess_all(items, field, profile, context);	// todo
				items_cntr.AfterDetailsReplacingAll = function() {
					input.Cancel();
				};
			}
			aa_apply_style_js(searchbox,field.Style);
			jElem.addClass(aa_attach_global_css(field.Style.Css));
			return jElem.get();
		}

		var newContext = aa_ctx(context,{_Field: [field]} );
		ajaxart.runsubprofiles(data,profile,'FieldAspect',newContext);
		
	    return [field];
	},
	MobileDefaultFeatures: function (profile,data,context) 
	{
		if (aa_bool(data,profile,'DisableScaling',context)) {
		  var metatag =document.createElement("meta");
		  metatag.setAttribute("name", "viewport");
		  metatag.setAttribute("content", "initial-scale=1,maximum-scale=1,user-scalable=no");
		  document.getElementsByTagName("head")[0].appendChild(metatag);
		}
		if (aa_bool(data,profile,'AutoHideAddressBar',context)) {
			function hide_address_bar() {
				document.body.style.height = "2000px";	// The max height for all devices
				function restore() {
					setTimeout( function() { 	// Use timeout because in some Androids the onscroll is called before the address bar hides
						window.removeEventListener("scroll", restore);
						jQuery("body").find(".aa_window_resize_listener").each(function(i,elem) { jBart.trigger(elem,'WindowResize'); });
						document.body.style.height = "100%";
					},1);
				}
				window.addEventListener("scroll", restore);
				window.scrollTo(0, 1);
			}
			hide_address_bar();

			window.addEventListener("orientationchange", function() {
				if (window.scrollY <= 2)	// new size may be smaller, and address bar will aprear again
					hide_address_bar();
			});
		}
		if (aa_bool(data,profile,'DisableTextAdjustionOnOrientation',context)) {
			jQuery('body').css("-webkit-text-size-adjust","none");
		}
		if (aa_bool(data,profile,'EliminateMarginsFromHtmlBody',context))
			jQuery('body').css('margin','0').css('padding','0');
		return [];
	},
	MobileBottomPosition: function (profile,data,context)
	{
		var field = context.vars._Field[0];
		aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx) {
			var elem = cell.firstChild;
			aa_addOnAttach(elem, function() {
//				if (false) {
				if (ajaxart.isiPhone && !navigator.userAgent.match(/OS 5(_\d)+ like Mac OS X/i)) {	// iphone <5 dosent have position:fixed
					var elem_height = elem.offsetHeight;
					var fix_top = function(height) { elem.style.top = window.innerHeight + window.scrollY - elem_height + "px"; };
					elem.jbFixTop = fix_top;
					fix_top(elem_height);
					jQuery(elem).addClass(aa_attach_global_css(aa_text(data,profile,'PositionAbsoluteCss',context)));
					jQuery(elem).show();
					jQuery(document).bind('scroll', function() { fix_top(elem.offsetHeight) } );
				    window.addEventListener("resize", function() { fix_top(elem.offsetHeight) }, false);
				} else if (jQuery('.studio_simulator').length > 0 && jQuery('.studio_simulator')[0].className.indexOf(' ') > -1) {	// in studio, use simulator window height
					var simulator = jQuery('.studio_simulator')[0];
					var elem_height = elem.offsetHeight;
					jQuery(elem).hide();
					var fix_top = function(height) { elem.style.top = simulator.clientHeight + simulator.scrollTop - elem_height + "px"; };
					fix_top(elem_height);
					jQuery(elem).addClass(aa_attach_global_css(aa_text(data,profile,'PositionAbsoluteCss',context)));
					jQuery(elem).show();
					jQuery('.studio_simulator').bind('scroll', function() { fix_top(elem.offsetHeight) } );
				} else {	// Android and other supporting position fixed browsers
					jQuery(elem).addClass(aa_attach_global_css(aa_text(data,profile,'PositionFixedCss',context)));
				}
				jQuery(cell).append(jQuery("<div class='aa_mobile_bottom_padding'/>").css("height", elem.offsetHeight + "px"));	// keep space in bottom for not hiding anything
			});
		});
	},
	MobileTopPosition:function (profile,data,context)
	{
		var field = context.vars._Field[0];
		aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx) {
			var elem = cell.firstChild;
			aa_addOnAttach(elem, function() {
				if (ajaxart.isiPhone && navigator.userAgent.match(/OS 4(_\d)+/i) || navigator.userAgent.match(/OS 3(_\d)+/i)) {	// iphone <5 dosent have position:fixed
					if (!aa_bool(data,profile,'UseAbsoluteWhenNoPositionFixed')) return;
					var fix_top = function() { elem.style.top = window.scrollY + "px"; };
					elem.jbFixTop = fix_top;
					fix_top();
					jQuery(elem).addClass(aa_attach_global_css(aa_text(data,profile,'PositionAbsoluteCss',context)));
					jQuery(elem).show();
					jQuery(document).bind('scroll', fix_top );
				    window.addEventListener("resize", fix_top, false);
				} else if (jQuery('.studio_simulator').length > 0 && jQuery('.studio_simulator')[0].className.indexOf(' ') > -1) {	// in studio, use simulator window height
					var simulator = jQuery('.studio_simulator')[0];
					jQuery(elem).hide();
					var fix_top = function() { elem.style.top = simulator.scrollTop + "px"; };
					fix_top();
					jQuery(elem).addClass(aa_attach_global_css(aa_text(data,profile,'SimulatorCss',context)));
					jQuery(elem).show();
					jQuery('.studio_simulator').bind('scroll', fix_top );
				} else {	// Devices that sopports position fixed, like Android and iPhone 5 and above
					jQuery(elem).addClass(aa_attach_global_css(aa_text(data,profile,'PositionFixedCss',context)));
					if (ajaxart.isIDevice) {	// iphone 5 BUG, when keyboard is open, it stucks as an absolute position
						setTimeout(function() {
							jQuery("input,textarea").focus(function() { elem.style.position = 'absolute'; })
								.blur(function() { elem.style.position = 'fixed'; }); }
						, 1000);
					}
				}
				jQuery(elem).addClass('aa_mobile_top_position');
				jQuery(cell).find('.aa_mobile_top_padding').remove();	// cleans previous calls
				jQuery(cell).append(jQuery("<div class='aa_mobile_top_padding'/>").css("height", elem.offsetHeight + "px"));	// keep space in bottom for not hiding anything
			});
		});
	},
	SimpleMobileVerticalScroll:function (profile,data,context)
	{
		return [{ 
			isObject: true,
			Prepare: function(data1,ctx) {
				var wrapper = jQuery("<DIV/>").addClass("aa_mobile_scroll_wrapper")[0];
				var elem = ctx.vars.ControlElement[0];
				elem.ScrollElement = wrapper;
		        elem.parentNode.appendChild(wrapper);
				wrapper.appendChild(elem);
				wrapper.jbScrolledElem = elem;
				jQuery(wrapper).css('overflow','hidden'); 
			},
			Activate : function(data1,ctx) {
				var wrapper = ctx.vars.ControlElement[0];
				var elem = wrapper.jbScrolledElem;
				elem.scrollPos = 0;	// starting with no scroll
				elem.maxOffset = 0; // used to fix virtual keyboard issue
				elem.MaxHeight = wrapper.offsetHeight;
				var scrollPosInRange = function(pos) {
					return Math.min(Math.max(pos,elem.MaxHeight-elem.offsetHeight),elem.maxOffset);
				}
				var ondown = function(e) {
					elem.start = {
					  // get touch coordinates for delta calculations in onTouchMove
					  pageX: e.touches ? e.touches[0].pageX : e.pageX,
					  pageY: e.touches ? e.touches[0].pageY : e.pageY,
					  // set initial timestamp of touch sequence
					  time: Number( new Date() )
					};
					elem.isVScrolling = undefined;
					elem.deltaX = elem.deltaY = elem.startScrollPos = elem.scrollPos;
					elem.style.MozTransitionDuration = elem.style.webkitTransitionDuration = 0;
					if (!ajaxart.isTouch)
						ajaxart_disableSelection(elem);
				};
				var onmove = function(e) {
				  var pageX = e.touches ? e.touches[0].pageX : e.pageX;
				  var pageY = e.touches ? e.touches[0].pageY : e.pageY;
				  if (!elem.start) return;
				  elem.deltaX = pageX - elem.start.pageX;
				  elem.deltaY = pageY - elem.start.pageY;
	
				  // determine if scrolling test has run - one time test
				  if ( typeof elem.isVScrolling == 'undefined') {
				 	elem.isVScrolling = !!( elem.isVScrolling || Math.abs(elem.deltaX) < Math.abs(pageY - elem.start.pageY) );
				  }
				  e.preventDefault();
				  // if user is trying to scroll vertically
				  if (elem.isVScrolling) {
						// translate immediately 1-to-1
						elem.scrollPos = scrollPosInRange(elem.startScrollPos + elem.deltaY);
						if (elem.scrollPos != elem.startScrollPos + elem.deltaY) {	// out of rance: resistance
							var not_allowed_diff = elem.startScrollPos + elem.deltaY - elem.scrollPos;
							elem.scrollPos += not_allowed_diff / ( (Math.abs(not_allowed_diff)/elem.MaxHeight) + 1 )
						}
						elem.style.MozTransform = elem.style.webkitTransform = 'translate3d(0,' + elem.scrollPos + 'px,0)';
					}
				};
				var onup = function(e) {
				  if (!elem.start) return;
					// determine if slide attempt triggers next/prev slide
					var duration = Number(new Date()) - elem.start.time;
					if (duration < 300 || elem.scrollPos != scrollPosInRange(elem.scrollPos) ) {	// use speed or go back after resistance
						var deceleration = 0.0006;
						var speed = Math.abs(elem.deltaY) / duration;
						var dist = (speed * speed) / (2 * deceleration);
						var add = dist * ((elem.deltaY > 0) ? 1 : -1);
						elem.scrollPos = scrollPosInRange(elem.scrollPos + add);
						var style = elem.style;
						// set duration speed (0 represents 1-to-1 scrolling)
						style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = 500 + 'ms';
						// translate to given index position
						style.MozTransform = style.webkitTransform = 'translate3d(0,' + elem.scrollPos + 'px,0)';
					}
				  elem.start = null;
				  if (!ajaxart.isTouch)
					  ajaxart_restoreSelection(elem);
				}
				if (ajaxart.isTouchDevice()) {
					wrapper.ontouchmove = onmove;
					wrapper.ontouchend = onup;
					wrapper.ontouchstart = ondown;
				} else {
					jQuery(wrapper).mousemove(onmove).mouseup(onup).mousedown(ondown);
				}
				elem.FixKeyboard = function() {
					if (aa_absTop(wrapper) < window.scrollY) {	// top is not visible, we fix it
						var offset = window.scrollY - aa_absTop(wrapper,true);
						if (elem.maxOffset != offset) {
							elem.maxOffset = offset;
							elem.scrollPos = scrollPosInRange(elem.scrollPos);// + elem.maxOffset);
							elem.style.webkitTransitionDuration = '150ms';
							elem.style.webkitTransform = 'translate3d(0,' + elem.scrollPos + 'px,0)';
						}
					} else if (elem.maxOffset) {	// go back to normal
						var offset = elem.maxOffset;
						elem.maxOffset = 0;
						elem.scrollPos = scrollPosInRange(elem.scrollPos - offset);
						elem.style.webkitTransitionDuration = '150ms';
						elem.style.webkitTransform = 'translate3d(0,' + elem.scrollPos + 'px,0)';
					}
				}
				if (ajaxart.isIDevice)
					jQuery("input,textarea").focus(function() { setTimeout(function() { elem.FixKeyboard(); },1)}).blur(elem.FixKeyboard);
				else
					window.addEventListener("resize", function(){ elem.FixKeyboard(); });
				this.SizeChanged = function() {
					elem.MaxHeight = wrapper.offsetHeight;
					if (elem.scrollPos != scrollPosInRange(elem.scrollPos)) {
						elem.scrollPos = scrollPosInRange(elem.scrollPos);
						elem.style.webkitTransform = 'translate3d(0,' + elem.scrollPos + 'px,0)';
					}
				}
				this.ScrollToTop = function(duration) {
					if (elem.scrollPos != scrollPosInRange(elem.maxOffset)) {
						elem.scrollPos = scrollPosInRange(elem.maxOffset);
						elem.style.webkitTransitionDuration = duration ? duration : '150ms';
						elem.style.webkitTransform = 'translate3d(0,' + elem.scrollPos + 'px,0)';
					}					
				}
				this.ScrollToBottom = function(duration) {
					if (elem.scrollPos != scrollPosInRange(-elem.offsetHeight)) {
						elem.scrollPos = scrollPosInRange(-elem.offsetHeight);
						elem.style.webkitTransitionDuration = duration ? duration : '150ms';
						elem.style.webkitTransform = 'translate3d(0,' + elem.scrollPos + 'px,0)';
					}					
				}
			}
		}];
	},
	HorizontalCurtain: function(profile,data,context) {
		var field = { isObject : true };
		field.Id = aa_text(data,profile,'ID',context);
		field.ID = [field.Id];
		field.FieldData = function(data1) { return data1; }
		field.CellPresentation = ["control"];
		field.HideTitle = true;
		field.Control = function(field_data,ctx) {
			var curtain = jQuery("<DIV class='aa_curtain'/>")[0];
			curtain.style.cssText = 'position:' + (aa_has_simulator() ? 'absolute' : 'fixed') + '; background:transparent; z-index:1; top:0px; left:0px';
			var page = ajaxart.runNativeHelper(field_data,profile,'Page',context)[0];
			jQuery(curtain).append(page)
				.append(aa_renderStyleObject(aa_first(data,profile,'HandlersStyle',context),{},ctx));
			curtain.open = aa_bool(data,profile,'StartAsOpen',context);
			var on_width_change = function() {
				curtain.width = ajaxart_screen_size(true).width;
				curtain.style.webkitTransform = 'translate3d(' + -(curtain.open ? 0 : curtain.width) + 'px,0,0)';
			}
			on_width_change();
			window.addEventListener("resize", on_width_change);
			var ondown = function(e) {
				curtain.start = {
				  // get touch coordinates for delta calculations in onTouchMove
				  pageX: e.touches ? e.touches[0].pageX : e.pageX,
				  pageY: e.touches ? e.touches[0].pageY : e.pageY,
				  // set initial timestamp of touch sequence
				  time: Number( new Date() )
				};
				curtain.isVScrolling = undefined;
				curtain.deltaX = curtain.deltaY = 0;
				curtain.style.MozTransitionDuration = curtain.style.webkitTransitionDuration = 0;
			}
			var onmove = function(e) {
			  if (!curtain.start) return;
			  var pageX = e.touches ? e.touches[0].pageX : e.pageX;
			  var pageY = e.touches ? e.touches[0].pageY : e.pageY;
			  curtain.deltaX = pageX - curtain.start.pageX;
				if ( typeof curtain.isVScrolling == 'undefined') {
				  curtain.isVScrolling = !!( curtain.isVScrolling || Math.abs(curtain.deltaX) < Math.abs(pageY - curtain.start.pageY) );
				}
				if (curtain.isVScrolling) {
					curtain.start = null;
					return;
				}
				  // prevent native scrolling 
				e.preventDefault();

				if (curtain.open && curtain.deltaX > 0)	// cannot slide leftwards to curtain
					curtain.deltaX = 0;
//				if ((curtain.open && curtain.deltaX > 0 || !curtain.open && curtain.deltaX < 0))	// resistance
//			      curtain.deltaX = curtain.deltaX / ( Math.abs(curtain.deltaX) / curtain.width + 1 );

				curtain.style.MozTransform = curtain.style.webkitTransform = 'translate3d(' + (curtain.deltaX - (curtain.open ? 0 :curtain.width)) + 'px,0,0)';
			};
			var onup = function(e) {
			  	if (e.ctrlKey) { // simulate slide with mouse
			  		curtain.Move(true);
			  		return;
			  	}
			  	if (!curtain.start) return;
				// determine if slide attempt triggers next/prev slide
				var isValidSlide = 
					  ((Number(new Date()) - curtain.start.time < 250      // if slide duration is less than 250ms
					  && Math.abs(curtain.deltaX) > 20                   // and if slide amt is greater than 20px
					  || Math.abs(curtain.deltaX) > curtain.width/2)        // or if slide amt is greater than half the width
						&& ((curtain.deltaX > 0 && !curtain.open) || (curtain.deltaX<0  && curtain.open)));

				curtain.Move(isValidSlide);
			}
			curtain.start = null;
			if (ajaxart.isTouch) {
				document.body.ontouchmove = onmove;
				document.body.ontouchend = onup;
				document.body.ontouchstart = ondown;
			} else {	// simulator
				jQuery(aa_body()).unbind("mousemove").unbind("mouseup").unbind("mousedown").mousemove(onmove).mouseup(onup).mousedown(ondown);
			}
			curtain.Move = function(slide) {
				if (slide) {			// openning/closing curtain
					curtain.open = !curtain.open;
					var onTransitionEnd = function() {
						ajaxart.run(data,profile,curtain.open ? 'OnOpen' : 'OnClose',context);
						curtain.removeEventListener('webkitTransitionEnd', onTransitionEnd);
						curtain.removeEventListener('transitionend', onTransitionEnd);
					}
					curtain.addEventListener('webkitTransitionEnd', onTransitionEnd);
					curtain.addEventListener('transitionend', onTransitionEnd);
				}
				var style = curtain.style;
				style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = 300 + 'ms';
				style.MozTransform = style.webkitTransform = style.transform = 'translate3d(' + -(curtain.open ? 0 : curtain.width) + 'px,0,0)';
				curtain.start = null;
			}
/*			if (aa_bool(data,profile,'AutoMoveWithVerticalScroll',context))
				jQuery(aa_has_simulator() ? aa_body() : document).bind('scroll', function() { 
					curtain.style.top = aa_window_scroll().Y + "px"; } );
*/
			return [curtain];
		};
	    return [field];		
	},
	IsMobileCurtainOpen: function(profile,data,context)
	{
		var out = [];
		jQuery(aa_find_field(aa_text(data,profile,'CurtainId',context),'aa_curtain')).each(function(index,curtain) {
			if (curtain.open) out = ["true"];
		});
		return out;
	},
	SlideMobileCurtain: function(profile,data,context)
	{
		var slide_to = aa_text(data,profile,'SlideTo',context);

		jQuery(aa_find_field(aa_text(data,profile,'CurtainId',context),'aa_curtain')).each(function(index,curtain) {
			if (curtain.Move)
				if (slide_to == 'toggle' || curtain.open && slide_to == 'close' || !curtain.open && slide_to == 'open')
						curtain.Move(true);
		});
		return [];
	},
	MobileDetailsReplacingAll: function(profile,data,context)
	{
		var cntr = context.vars._Cntr[0]; 
		var control = context.vars.DetailsControl;
		if (control == null || control.length == 0) return [];

		var details_background = aa_text(data,profile,'DetailsBackground',context);
		var details_control = jQuery(control).appendTo("<DIV/>").parent().appendTo("<DIV/>").parent().appendTo("<DIV class='aa_mobile_replacing_all'/>").parent()[0];
		// DIV1: android fix position:fixed cannot work with transform
		// DIV2: animation and scroll fix may colllide
		// details_control.style.cssText = 'position:' + (aa_has_simulator() ? 'absolute' : 'fixed') + '; z-index:1; top:0px; left:0px;';
		details_control.style.cssText = 'position:absolute; z-index:1; top:0px; left:0px;';
		details_control.firstChild.style.cssText = 'background:' + details_background + ";display: inline-block;";
		details_control.firstChild.style.minWidth = ajaxart_screen_size(true).width + "px";
		details_control.firstChild.style.minHeight = Math.max(ajaxart_screen_size(true).height + 70, aa_document_height()) + "px";	// 50: http://stackoverflow.com/questions/9678194/cross-platform-method-for-removing-the-address-bar-in-a-mobile-web-app
		var original_scroll = aa_window_scroll().Y;
		var animation = aa_first(data,profile,'DetailsAnimation',context);
		var original_control = cntr.Ctrl;
		// cntr.Ctrl.parentNode.style.position = 'relative';
		cntr.Ctrl.parentNode.appendChild(details_control);
		animation.animate(details_control, function() {
			setTimeout(function() {
				if (original_scroll > 1)	// scroll to top
					jQuery(aa_body()).animate({ scrollTop: navigator.userAgent.toLowerCase().match(/android/) ? 1 : 0 }, 200 );
			},1);
//			document.body.style.minHeight = ajaxart_screen_size(true).height + 70 + "px";
//			aa_window_scroll_to(0,1);
//			jQuery(original_control).hide();
			cntr.Ctrl = details_control;
//			details_control.style.cssText = 'position:none; z-index:0; top:0px;';
//			document.body.style.minHeight = "none";
//			if (cntr.AfterDetailsReplacingAll) {
//				cntr.AfterDetailsReplacingAll();
				// document size may have changed (when canceling search)
//				details_control.firstChild.style.minHeight = Math.max(ajaxart_screen_size(true).height + 70, aa_document_height()) + "px";	// 50: http://stackoverflow.com/questions/9678194/cross-platform-method-for-removing-the-address-bar-in-a-mobile-web-app
//			}
		});

		context.vars._ItemDetailsObject[0].HideDetails = function(data2,ctx2) {
			var list_animation = aa_first(data,profile,'ListAnimation',context);
			list_animation.hide(details_control, function() {
				aa_remove(details_control);
//				jQuery(aa_body()).animate({ scrollTop: original_control }, 500 );
				cntr.Ctrl = original_control;
			});
		};
		context.vars._ItemDetailsObject[0].HideDetails1 = function(data2,ctx2) {
			var list_animation = aa_first(data,profile,'ListAnimation',context);
			var list_background = aa_text(data,profile,'ListBackground',context);
			cntr.Ctrl.parentNode.removeChild(original_control);
			var original_control_wrapped = jQuery(original_control).appendTo("<DIV/>").parent().appendTo("<DIV/>").parent().appendTo("<DIV class='aa_mobile_original_control'/>").parent()[0];
			cntr.Ctrl.parentNode.appendChild(original_control_wrapped);
			original_control_wrapped.style.cssText = 'position:' + (aa_has_simulator() ? 'absolute' : 'fixed') +  ';z-index:1; top:0px; left:0px; ';
			original_control_wrapped.firstChild.style.cssText = 'background:' + list_background + ";display: inline-block;";
			original_control_wrapped.firstChild.style.width = ajaxart_screen_size(true).width + "px";
			original_control_wrapped.firstChild.style.minHeight = ajaxart_screen_size(true).height + "px";	// 50: http://stackoverflow.com/questions/9678194/cross-platform-method-for-removing-the-address-bar-in-a-mobile-web-app
			if (aa_has_simulator()) original_control_wrapped.style.top = aa_window_scroll().Y + "px";	//simulator scroll fix
			// scroll fix
			jQuery(original_control_wrapped.firstChild.firstChild).css("-webkit-transform",'translateY(-' + original_scroll + 'px)').css("transform",'translateY(-' + original_scroll + 'px)');
			jQuery(original_control).show();
			list_animation.animate(original_control_wrapped.firstChild,function() {
				aa_window_scroll_to(0,original_scroll);
				jQuery(original_control_wrapped.firstChild.firstChild).css("-webkit-transform",'none').css("transform",'none');
				original_control.style.cssText = 'z-index:1';
				cntr.Ctrl.parentNode.appendChild(original_control);
				cntr.Ctrl.parentNode.removeChild(original_control_wrapped);
				original_control.style.cssText = 'z-index:none';
				aa_remove(details_control);
				cntr.Ctrl = original_control;
			});
		}
		return [];
	}
});
function aa_has_simulator(elem) {
	if (!elem)
		return (ajaxart.jbart_studio && jQuery('.studio_simulator').length > 0 && jQuery('.studio_simulator')[0].className.indexOf(' ') > -1);
	else // studio shuld be parent of elem
		return (ajaxart.jbart_studio && jQuery(elem).parents('.studio_simulator').length > 0 && jQuery(elem).parents('.studio_simulator')[0].className.indexOf(' ') > -1);

}
function aa_body() {
	if (aa_has_simulator())
		return jQuery('.studio_simulator')[0];
	else
		return document.body;
}
function aa_window_scroll() {
	if (aa_has_simulator())
		return { Y:jQuery('.studio_simulator')[0].scrollTop, X:jQuery('.studio_simulator')[0].scrollLeft};
	else
		return { Y:window.scrollY, X:window.scrollX };
}
function aa_window_scroll_to(x,y) {
	if (aa_has_simulator())
		jQuery('.studio_simulator').scrollTop(y).scrollLeft(x);
	else
		window.scrollTo(x,y);
}
function aa_document_height() {
	if (aa_has_simulator())
		return jQuery('.studio_simulator').children().height();
	else return Math.max(
        jQuery(document).height(),
        jQuery(window).height(),
        /* For opera: */
        document.documentElement.clientHeight);
}


aa_gcs("fld_type",{
	MultiplePicklist: function (profile,data,context)
	{
		var field = context.vars._Field[0];
	
		field.RefreshOptions = function(data1,ctx) {
			field.Options = ajaxart.run(data1,profile,'Options',aa_ctx(context,ctx));
		}
		field.RefreshOptions(data,context);
		field.Style = aa_first(data,profile,'Style',context);
		
		field.Control = function(field_data,ctx) {
			var multi_picklist = aa_initMultiPicklistObject(field,field_data,ctx);
			var out = [ aa_renderStyleObject(field.Style,multi_picklist,ctx,true)];
			return out;
		}
	}
});

aa_gcs("multiple_picklist",{
	MultiPicklistBaseArea: function (profile,data,context)
	{
		var field = {
			Id: aa_text(data,profile,'ID',context),
			Title: aa_multilang_text(data,profile,'Title',context),
			Style: aa_first(data,profile,'Style',context),
			MultiPicklistApiObject: aa_first(data,profile,'MultiPicklistApiObject',context)
		};

		field.Control = function(field_data,ctx) {
			var multipicklistBase = aa_initMultiPicklistBaseObject(field,field_data,ctx);
			multipicklistBase.OpenPopup = function() {
				ajaxart.runNativeHelper(data,profile,'OpenPopup',aa_ctx(context,{ _MultiPicklistBase: [multipicklistBase], ControlElement: [this.SearchInput] }));
			}
			multipicklistBase.FilterType = aa_first(data,profile,'SearchFilterType',context);
			
			return [ aa_renderStyleObject(field.Style,multipicklistBase,ctx,true)];
		}
		return [field];
	},
	PicklistSelect: function (profile,data,context)
	{
		var option = aa_first(data,profile,'Option',context);
		var multipicklistBase = context.vars._MultiPicklistBase[0];
		var multiPicklist = multipicklistBase.multiPicklist;
		
		var code = option.code;
		multiPicklist.addValue(code);
		if (multipicklistBase.SearchInput.jbDialog) multipicklistBase.SearchInput.jbDialog.Close();

		aa_refresh_cell(multiPicklist.wrapperForStyleByField,context);
	}
});

function aa_initMultiPicklistObject(field,field_data,context)
{
	var multi_picklist = {
		Multiple: true,
		Field: field, FieldData: field_data, data: field_data[0], Context: context,
		getValues: function() {
			return aa_split( aa_totext( field_data ),',',true);
		},
		addValue: function(code) {
			var val = aa_totext( field_data );
			if (val) val += ',';
			val += code;
			
			ajaxart.writevalue( field_data, val );
			var content = this.control; 
			aa_invoke_field_handlers(field.OnUpdate,content,null,field,field_data,{});
			jBart.trigger(field,'update',{ FieldData: field_data, wrapper: content.parentNode });
		},
		removeValue: function(code,autoupdate) {
			var vals = aa_totext( field_data ).split(',');
			for(var i=0;i<vals.length;i++) {
				if (vals[i] == code) {
					vals.splice(i,1);
					break;
				}
			}
			var newval = vals.join(',');
			ajaxart.writevalue( field_data, newval );
			var content = this.control; 
			aa_invoke_field_handlers(field.OnUpdate,content,null,field,field_data,{});
			jBart.trigger(field,'update',{ FieldData: field_data, wrapper: content.parentNode });
			jBart.trigger(this,'removeItem',{ });

		},
		OptionsLeft: function() {
			var values = this.getValues();
			var options = field.Options;
			var optionsLeft = [];
			for(var i=0;i<options.length;i++) {
				var optionCode = options[i].code;
				var added=false;
				for(var j=0;j<values.length;j++)
					if (values[j]==optionCode) added = true;
				if (!added) optionsLeft.push(options[i]);
			}
			return optionsLeft;
		}
	};
	return multi_picklist;
}

function aa_initMultiPicklistBaseObject(field,field_data,context)
{
	var multipicklistBase = {
		Field: field,
		multiPicklist: field.MultiPicklistApiObject,
		context: context,
		SearchValue: '',
		DialogFeature: function(data1,ctx) {
		  var dlg = ctx.vars._Dialog[0];
		  this.Popup = dlg;
		  var base = this;
		  
		  aa_register_handler(dlg,'AfterOpen', function(dlg,ctx) {
			  var itemlistCntr = base.GetItemListCntr();
			  aa_initContainerFilters(itemlistCntr);
			  itemlistCntr.AddFilter({
			    Id: 'search',
			    FieldData: function(item) {
				  return [item.text]; 
				},
	    		FilterType: base.FilterType
	    	  });
			  
			  itemlistCntr.RunQuery(base.QueryXml());
		  });
		},
		GetItemListCntr: function() {
			var itemlistElem= jQuery(this.Popup.Frame).find('.fld_Picklist_options')[0];
			return itemlistElem.jbContext.vars.ItemListCntr[0];
		},
		SyncPopup: function() {
			if (!this.Popup || !ajaxart.isattached(this.Popup.Frame)) {
				this.OpenPopup();
			} else {
				// just update the filter
				var itemlistCntr = this.GetItemListCntr();
				itemlistCntr.RunQuery(this.QueryXml());
			}
		},
		QueryXml: function() {
			var xml = ajaxart.parsexml('<query/>');
			xml.setAttribute('search',this.SearchValue);
			return xml;
		}
	}
	return multipicklistBase;
}

function aa_multipicklistbase(multipicklistBase,settings)
{
	var itemTemplate = settings.itemElement;
	multipicklistBase.jbItemsParent = itemTemplate.parentNode;
	
	var multiPicklist = multipicklistBase.multiPicklist;
	
	var values = multiPicklist.getValues();
	for(var i=0;i<values.length;i++) {
		 var option = aa_picklist_optionByCode(multiPicklist.Field.Options,values[i]) || { code: values[i], text: values[i] };
		 
		 var itemElement = itemTemplate.cloneNode(true);
		 itemElement.jbOption = option;
		 
		 var innerElements = settings.itemInnerElements(itemElement);
		 innerElements.itemTextElement.innerHTML = option.text;
		 innerElements.itemCloseElement.jbItemElement = itemElement;
		 innerElements.itemCloseElement.onclick = function() {
			 var itemElement = this.jbItemElement;
			 var option = itemElement.jbOption;
			 multiPicklist.removeValue(option.code);
			 
			 aa_remove(itemElement,true);
			 fixInputSize();
		 }	 
		 jQuery(itemTemplate).before(itemElement);
	}
	var jInput = jQuery(settings.searchElement);
	multipicklistBase.SearchInput = jInput[0];
	jInput[0].onkeyup = jInput[0].onclick = function() {
		multipicklistBase.SearchValue = jInput.val();
		multipicklistBase.SyncPopup([],multipicklistBase.context);
	}
	aa_remove(itemTemplate,true);

	function findLastElement() {
		var last = null;
		for(var iter=multipicklistBase.jbItemsParent.firstChild;iter;iter=iter.nextSibling) {
			if (iter.jbOption) last = iter;
		}
		return last;
	}
	function fixInputSize() {
		var totalWidth = multipicklistBase.$el.width();
		var lastElement = findLastElement();
		if (lastElement)
		  var left = aa_absLeft(lastElement) + jQuery(lastElement).width() - aa_absLeft(multipicklistBase.el);
		else 
		  var left = 0;
		  
		var padding = (jInput.outerWidth() - jInput.width())*2; 
		jInput.width(totalWidth - left - padding - 5);
	}
	
	aa_addOnAttach(jInput[0],function() {fixInputSize();});
}


aa_gcs("prefstorage", {
	UrlFragmentKey: function(profile,data,context) {
		var separator = aa_text(data,profile,'Separator',context);
		var keyPrefix = aa_text(data,profile,'KeyPrefix',context);
		var regSeparator = separator == '?' ? '\\?' : separator;
		return [{
			get: function(key) {
				var keyToUse = keyPrefix + key;
				var result = window.location.href.toString().match(new RegExp(regSeparator + keyToUse + '=([^' + separator + ']+)'));
				if (result && result.length>1) return result[1];
				return null;
			},
			set: function(key,value) {
				var keyToUse = keyPrefix + key;
				if (value) {
					var result = window.location.href.toString().match(new RegExp(regSeparator + keyToUse + '=([^' + separator + ']*)'));
					if (result) {
						var location = window.location.href.toString().replace(new RegExp(regSeparator + keyToUse + '=([^' + separator + ']*)'),separator + keyToUse + '=' + value);
						window.location.href = location;
					} else {
						window.location.href = window.location.href.toString() + separator + keyToUse + '=' + value;
					}
				} else {	// cleaning
					window.location.href = window.location.href.toString().replace(new RegExp(regSeparator + keyToUse + '=([^' + separator + ']*)'),'');
				}
			}
		}];
	},
	LocalStorage: function(profile,data,context) {
		var keyPrefix = aa_text(data,profile,'KeyPrefix',context);
		var browserSupport = 'localStorage' in window && window['localStorage'] !== null;
		return [{
			get: function(key) {
				if (!browserSupport) { ajaxart.log("cannot read '" + key + "' from local storage, no browser support","error"); return ""; }
				return localStorage.getItem(keyPrefix + key);
			},
			set: function(key,value) {
				if (!browserSupport) { ajaxart.log("cannot write '" + key + "'='" + value + "' to local storage, no browser support","error"); return; }
				if (value)
					localStorage.setItem(keyPrefix + key, value);
				else
					localStorage.removeItem(keyPrefix + key);
			}
		}];
	},
	Cookie: function(profile,data,context) {
		var keyPrefix = aa_text(data,profile,'KeyPrefix',context);
		return [{
			get: function(key) {
				return ajaxart.cookies.valueFromCookie(keyPrefix + key);
			},
			set: function(key,value) {
				ajaxart.cookies.writeCookie(keyPrefix + key,value);				
			}
		}];
	},
	GetPreferenceValue: function(profile,data,context) {
		var storage = aa_first(data,profile,'Storage',context);
		var key = aa_text(data,profile,'Key',context);
		return [ "" + storage.get(key) ];
	},
	SetPreferenceValue: function(profile,data,context) {
		var storage = aa_first(data,profile,'Storage',context);
		var key = aa_text(data,profile,'Key',context);
		var value = aa_text(data,profile,'Value',context);
		storage.set(key,value);
		return [];
	}
});
aa_gcs("field", {
	SearchBox: function (profile,data,context)
	{
		var field = ajaxart.runNativeHelper(data,profile,'Field',context)[0];
		field.Style = aa_first(data,profile,'Style',context);
		field.StyleCssClass = aa_attach_global_css(field.Style.Css);
		
		ajaxart_addMethod(field,'ItemTitle',profile,'ItemTitle',context);
		ajaxart_addMethod(field,'ItemImage',profile,'ItemImage',context);
		field.DefaultImage = aa_text(data,profile,'DefaultImage',context);
		if (field.DefaultImage != "") {
		  function init(field,default_image) { 
			  field.ItemImage = function(data1,ctx) {
				var img = aa_text(data1,profile,'ItemImage',aa_merge_ctx(context,ctx));  // TODO: use compile_text
				if (img == "") img = default_image;
				return [img];
			  }
		  }
		  init(field,field.DefaultImage);
		}
		ajaxart_addMethod(field,'ItemExtraText',profile,'ItemExtraText',context);
		ajaxart_addMethod(field,'ItemLink',profile,'ItemLink',context);

		aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx,item) {
			var field = cell.Field;
			var input = jQuery(cell).find('.field_control')[0];
			jQuery(input).addClass('aa_withpopup').addClass(field.StyleCssClass);
	  	    field.ResultsPage = field.PopupPage(data,aa_ctx(context,{_Field:[field], _PopupField: [field], _SearchBox:[input] }))[0];
			field.PopupContents = function() {
				var input = jQuery(cell).find('.field_control')[0];			
				var items = []
				for(var i=0;i<input.AllItems.length;i++)
					if (i < 30) // only 30 items for preview
						items.push(input.AllItems[i].item);
				
				return ajaxart.runNativeHelper(data,profile,'PreviewContainer',aa_ctx(context,{_Field:[this], _PopupField: [this], _Items: items }));
			}
			var on_data_arrive = function(items,field) { 
				var input = jQuery(cell).find('.field_control')[0]; 
				aa_preprocess_items_for_search(items,input,field,profile,context); 
			};
			if (profile.getAttribute("Items")) {		// KLUDGE...
				var resource_name = profile.getAttribute("Items").match(/%[$]([a-zA-Z0-9_]*)%/); // returns array or null
				if (resource_name)
					aa_jbart_register_data_arrive(resource_name[1], function(items) { 
						var input = jQuery(cell).find('.field_control')[0]; 
						aa_preprocess_items_for_search(items,input,field,profile,context); 
					}, context);
			}
			if (!input.AllItems || input.AllItems.length==0) // data not coming from external source
				aa_preprocess_items_for_search(ajaxart.run(data,profile,'Items',context),input,field,profile,context);
			
			input.MaxItemsToShow = aa_int(data,profile,'MaxItemsToShow',context);
			input.ShowResults = function() {
				if (input.ResultsShown) return;
				input.ResultsShown = true;
				if (jQuery(input).hasClass('empty_text_description')) input.value='';
				if (input.popup && input.popup.Frame) {
					aa_replaceElement(input.popup.Contents,input.Container.Ctrl);
					input.popup.Contents = input.Container.Ctrl;
					if (input.popup.FixDialogPosition) input.popup.FixDialogPosition(false,true);					
				}
				else {
					if (input.value != '' || input.ShowPopupOnEmptySearch) {
					  ajaxart.runNativeHelper([],profile,'OpenPopup',aa_ctx(context,{_Input: [input], _ResultsContainer: [input.Container.Ctrl],  _Field:[field], _PopupField: [field], ControlElement:[input]}));
					  input.popup = jQuery(input.Container.Ctrl).parents('.aa_popup')[0].Dialog;
					}
				}
			}
			input.HideResults = function() {
				if (input.popup && input.popup.Frame) // popup is not closed
					input.popup.Close();
			}
			input.ShowNothingFound = function() {
				var noResultsCtrl = aa_first([this.value],profile,'NoResults',context);
				jQuery(noResultsCtrl).addClass('search_results');
				noResultsCtrl.jbInput = input;
				if (input.popup && input.popup.Frame) {	// popup is not closed
					aa_replaceElement(input.popup.Contents,noResultsCtrl);
					input.popup.Contents = noResultsCtrl;
					if (input.popup.FixDialogPosition) input.popup.FixDialogPosition(false,true);
				}
				else {
					ajaxart.runNativeHelper([],profile,'OpenPopup',aa_ctx(context,{_Input: [input], _ResultsContainer: [noResultsCtrl],  _Field:[field], _PopupField: [field], ControlElement:[input]}));
					input.popup = jQuery(noResultsCtrl).parents('.aa_popup')[0].Dialog;
				}
			}
			input.OnSelect = function(item,ctx) {
				var link = aa_text(item,profile,'ItemLink',context)
				if (aa_bool(item,profile,'HideResultsOnClick',context))
					this.HideResults();
				ajaxart.run([link],profile,'DoOnSelect',aa_ctx(context,{ControlElement:[input], SelectedItem: item }));
				jBart.trigger(jBart,'userChoice',{ field_data: field_data, field: field, profile: profile, input: input, context: ctx });
				input.value = '';
				if (input.RefreshDescriptionForEmptyText) input.RefreshDescriptionForEmptyText();
			}
			input.AfterItemsAdded = function() {	// refresh popup position
				setTimeout(function() {
					if (input.popup && input.popup.Frame && input.popup.FixDialogPosition) // popup is not closed
						input.popup.FixDialogPosition(false,true);
				});
				
			}
			input.ShowPopupOnEmptySearch = aa_bool(data,profile,'ShowPopupOnEmptySearch',context);
			input.MathcedChunkSize = 50;	// todo: auto calculate by actual time
			input.MatchedTextCssClass = aa_attach_global_css(aa_text(data,profile,'MatchedTextCss',context));
			aa_prepare_more_items_to_show(input,context);
		});
		aa_field_handler(field,'OnKeyup',function(field,field_data,input,e,extra)
		{
			for(var i=0;i<aa_navigation_codes.length;i++)
				if (e.keyCode == aa_navigation_codes[i]) return true;

			input.Container = ajaxart.runNativeHelper(data,profile,'ResultsContainer',aa_ctx(context,{_Field:[field], _PopupField: [field], _Input: [input], _SearchBox:[input]}))[0];
			input.Container.jbInput = input;
			if (!jQuery(input.Container).hasClass('aa_container'))
				input.Container = jQuery(input.Container).find('.aa_container')[0];
			
			if (input.Container && input.Container.Cntr) input.Container = input.Container.Cntr;
			if (e.keyCode != 27 && e.keyCode != 13) {
				jQuery(input).removeClass('empty_text_description').removeClass(input.Field.EmptyTextCssClass);
				aa_search(field, input, profile, aa_ctx(context, {_Cntr: [input.Container.Cntr] }),input.TimeBeforeStartingSearch);
			}
			else
				input.HideResults();
		});
		aa_field_handler(field,'OnKeydown', function(field,field_data,input,e) {
			aa_search_keydown(field,input,e,context);
		});
	    aa_field_handler(field,'OnMouseUp',function(field,field_data,input,e) {
			if (jQuery(".search_results").length > 0) return;
			input.Container = ajaxart.runNativeHelper(data,profile,'ResultsContainer',aa_ctx(context,{_Field:[field], _PopupField: [field], _Input: [input], _SearchBox:[input]}))[0];
			if (!jQuery(input.Container).hasClass('aa_container'))
				input.Container = jQuery(input.Container).find('.aa_container')[0];
			if (input.Container && input.Container.Cntr) input.Container = input.Container.Cntr;
			aa_search(field, input, profile, aa_ctx(context, {_Cntr: [input.Container.Cntr] }),0);
		}); 
		ajaxart.runNativeHelper(data,profile,'FieldAspects',aa_ctx(context,{_Field:[field], _PopupField: [field]}));
		
		field.ResultListAspects = function() {
			return ajaxart.runNativeHelper(data,profile,'ResultListAspects',context);
		}
		return [field];
		
		function findSearchResults(input) {
			var elems = jQuery('.search_results');
			for(var i=0;i<elems.length;i++)
				if (elems[i].jbInput == input) return elems[i];
			return null;
		}
	}
});
function aa_fill_items(input,field, search_id, items, step)
{
	if (input.SearchId != search_id) return;	// someone has started a new search
	aa_show_items(input,field,items.slice(step,step+input.NoFilterChunkSize),"",search_id);
	if (step+input.NoFilterChunkSize < items.length)
		setTimeout(function() { aa_fill_items(input,field, search_id, items, step+input.NoFilterChunkSize); }, 1);
}
function aa_handle_empty_pattern(input,field, profile, context, search_id)
{
	var promoted_items = ajaxart.run([],profile,'PromotedItems',context);
	var show_now = [];
	if (promoted_items.length > 0) {
		aa_show_items(input,field,promoted_items,"",search_id);
		  if (input.AllItems.length > promoted_items.length)	// have more items
			  input.SetHasMoreItemsToShow( function() {
				jQuery(input.Container.Ctrl).find(".aa_item").remove();	// remove promoted items
				aa_fill_items(input,field,search_id, input.AllItems, 0);
			});
	} else {
	  for(var i=0;i<input.MaxItemsToShow;i++)
		if (i<input.AllItems.length) show_now.push(i);
	    if (input.MaxItemsToShow < input.AllItems.length)
		  input.SetHasMoreItemsToShow( function() {	aa_fill_items(input,field,search_id, input.AllItems, input.MaxItemsToShow); });
	}
	aa_show_items(input,field,show_now,"",search_id);
	input.ShowResults();
}
function aa_search_chunk(input,field, profile, context, search_id, pattern, step, ignore_max) {
	if (input.SearchId != search_id) return;	// someone has started a new search
	var show_now = [];
	var matched_in_chunk = 0;
	var end_loop = Math.min(input.AllItems.length, step+input.SearchChunkSize);

	if (pattern.text == "")	return aa_handle_empty_pattern(input,field, profile, context, search_id);
	var p1 = pattern.p1;
	for (var i=step; i<end_loop; i++) {
		var s = input.AllItems[i].text;
		if ((p1 && s.indexOf(p1) != -1) || (pattern.p2 && s.indexOf(pattern.p2) != -1) || (pattern.p3 && s.indexOf(pattern.p3) != -1) || (pattern.p4 && s.indexOf(pattern.p4) != -1)) {
			var show_first = false;
			if (pattern.words > 1) {
				var words_found = 0;
				if (p1 && s.indexOf(p1) != -1) words_found++;
				if (pattern.p2 && s.indexOf(pattern.p2) != -1) words_found++;
				if (pattern.p3 && s.indexOf(pattern.p3) != -1) words_found++;
				if (pattern.p4 && s.indexOf(pattern.p4) != -1) words_found++;
				if (words_found == pattern.words)
					show_first = true;
			} else if (s.indexOf(p1) == 1)	// starts with pattern
				show_first = true;
			if (show_first)
			{
				show_now.push(i);
				if (input.TotalShown == 0 && input.FirstChunkToShow == show_now.length)
					break;
			} else {
				input.ShowAtEnd.push(i);
			}
		}
	}
	if (show_now.length > 0) {
		var max_to_show = input.MaxItemsToShow - input.TotalShown;
		aa_show_items(input,field,show_now.slice(0,max_to_show),pattern,search_id);
		input.ShowResults();
		if (max_to_show < show_now.length)	// has more items
			input.MoreItems = input.MoreItems.concat(show_now.slice(max_to_show));
	}
	if (end_loop < input.AllItems.length)
		setTimeout(function() { aa_search_chunk(input,field, profile, context, search_id, pattern, end_loop, ignore_max) },1);
	else {	// reached the end
		input.Searching = false;
		if (input) jQuery(input).removeClass('aa_loading');
		if (input.ShowAtEnd.length > 0) {
			var max_to_show = input.MaxItemsToShow - input.TotalShown;
			if (max_to_show > 0) 
				aa_search_run_async( function() {
					aa_show_items(input,field,input.ShowAtEnd.slice(0,max_to_show),pattern,search_id);
				},input,search_id,true,true);	// makes sure it runs last
			if (input.ShowAtEnd.length > max_to_show)	// has more items
				input.MoreItems = input.MoreItems.concat( input.ShowAtEnd.slice(max_to_show) );
			input.ShowResults();
		}
		else { 
			if (input.TotalShown == 0)	// found nothing
				input.ShowNothingFound(); //HideResults();
			aa_fire_async_finished();
		}
		
		if (input.MoreItems.length > 0)
			input.SetHasMoreItemsToShow( function() { aa_fill_items(input,field,search_id, input.MoreItems, 0); });
	}
}
function aa_search_run_async(f,input,search_id,run_last,activate_now)
{	// makes sure that all the 'first' jobs are running before the 'last' jobs
	if (!input.Jobs) {
		input.Jobs = {};
		
		input.Jobs.first_jobs = [];
		input.Jobs.first_jobs_index = 0;
		
		input.Jobs.last_jobs = [];
		input.Jobs.last_jobs_index = 0;
	}
	if (run_last) input.Jobs.last_jobs.push(f);
	else		  input.Jobs.first_jobs.push(f);
	var run = function() {
		if (input.SearchId != search_id) return;	// someone has started a new search
		if (input.Jobs.first_jobs_index < input.Jobs.first_jobs.length) {
			input.Jobs.first_jobs_index++;
			input.Jobs.first_jobs[input.Jobs.first_jobs_index-1]();
		} else if (input.Jobs.last_jobs_index < input.Jobs.last_jobs.length) {
			input.Jobs.last_jobs_index++;
			input.Jobs.last_jobs[input.Jobs.last_jobs_index-1]();
		}
		if (input.Jobs.first_jobs_index == input.Jobs.first_jobs.length &&
				input.Jobs.last_jobs_index == input.Jobs.last_jobs.length)
			aa_fire_async_finished()	// all done
	}
	if (activate_now) run();
	else setTimeout( run , 1);
}
function aa_search(field, input, profile, context, time_to_start)
{
	input.ShowAtEnd = [];
	input.SearchChunkSize = 500;
	input.NoFilterChunkSize = 20;
	input.FirstChunkToShow = 5;
	input.ResultsShown = false;
	input.TotalShown = 0;
	input.MoreItems = [];
	input.TimeBeforeStartingSearch = 150;
	input.Jobs = null;
	input.CancelMoreItemsToShow();
	if (!input.CurrentSearchId)
		input.CurrentSearchId = 0;
	input.CurrentSearchId++;
	var search_id = input.CurrentSearchId;
	input.SearchId = search_id;
	input.Searching = true;
	var pattern = {};
	if (jQuery(input).hasClass('empty_text_description')) input.value='';
	pattern.text = input.value;
	
	var pp = pattern.text.split(' ');
	pattern.p1 = (pp.length > 0 && ' ' + pp[0].toLowerCase());
	pattern.p2 = (pp.length > 1 && ' ' + pp[1].toLowerCase());
	pattern.p3 = (pp.length > 2 && ' ' + pp[2].toLowerCase());
	pattern.p4 = (pp.length > 3 && ' ' + pp[3].toLowerCase());
	pattern.words = pp.length;
	input.Pattern = pattern;
	jQuery(input).addClass('aa_loading');

	if (time_to_start >0)
		setTimeout(function() { aa_search_chunk(input,field, profile, context, search_id, pattern, 0) }, time_to_start);
	else
		aa_search_chunk(input,field, profile, context, search_id, pattern, 0);
}
function aa_show_items(input,field,indexes_to_show,pattern,search_id) {
	input.TotalShown += indexes_to_show.length;
	var cntr = input.Container;
	var top = ajaxart_find_list_under_element(input.Container.Ctrl);
	var elems = [];
	for (var i=0; i<Math.min(indexes_to_show.length,input.MathcedChunkSize); i++) {
		if (typeof(indexes_to_show[i]) == 'number')
		  var item = input.AllItems[indexes_to_show[i]].item;
		else if (indexes_to_show[i].item)
		  var item = indexes_to_show[i].item;
		else
		  var item = indexes_to_show[i];
		
		var new_element = cntr.createNewElement([item],elems,cntr.Context);
		cntr.insertNewElement(new_element,top);
	}
	var newcontext = aa_ctx(cntr.Context,{_Elems: elems, _Cntr: [cntr]} );
	for(var i=0;i<cntr.Aspects.length;i++)
		ajaxart_runMethod([],cntr.Aspects[i],'InitializeElements',newcontext);
    for(var i=0;i<cntr.PostActors.length;i++) 
	    ajaxart.runScriptParam([],cntr.PostActors[i].aspect.PostAction,newcontext);
	
    aa_invoke_cntr_handlers(cntr,cntr.ContainerChange,[],cntr.Context);
	
	var p1,p2,p3,p4;  // TODO: for on pattern.words
    if (pattern.p1) p1 = pattern.p1.substring(1); 
    if (pattern.p2) p2 = pattern.p2.substring(1); 
    if (pattern.p3) p3 = pattern.p3.substring(1);// remove space prefix
    if (pattern.p4) p4 = pattern.p4.substring(1);
    for (var i in elems) {
    	jQuery.each(jQuery(elems[i]).find('.aa_text'), function() {  
    		if (p1 && this.innerHTML.toLowerCase().indexOf(p1) != -1)
    			this.innerHTML = ajaxart_field_highlight_text(this.innerHTML,p1,input.MatchedTextCssClass);
    		if (p2 && this.innerHTML.toLowerCase().indexOf(p2) != -1)
    			this.innerHTML = ajaxart_field_highlight_text(this.innerHTML,p2,input.MatchedTextCssClass);
    		if (p3 && this.innerHTML.toLowerCase().indexOf(p3) != -1)
    			this.innerHTML = ajaxart_field_highlight_text(this.innerHTML,p3,input.MatchedTextCssClass);
    		if (p4 && this.innerHTML.toLowerCase().indexOf(p4) != -1)
    			this.innerHTML = ajaxart_field_highlight_text(this.innerHTML,p4,input.MatchedTextCssClass);
    	});
    }
    if (input.AfterItemsAdded)
    	input.AfterItemsAdded();
    
    if (indexes_to_show.length > input.MathcedChunkSize)	// not all items have been shown (list too long)
    	aa_search_run_async(function() {	// makes sure it runs before the last items
    		aa_show_items(input,field,indexes_to_show.slice(input.MathcedChunkSize),pattern,search_id);
    	},input,search_id );
}
function aa_preprocess_items_for_search(items, input,field, profile, context) {
	input.PreprocessStep = 0;
	input.PreprocessChunkSize = 500;
	input.AllItems = [];
	var searchIn = aa_text([],profile,'SearchIn',context),compiled=null; 
	if (searchIn == 'title')
		compiled = ajaxart.compile_text(profile, "ItemTitle",context);
	else if (searchIn == 'title and extra text') {
		var f1 = ajaxart.compile_text(profile, "ItemTitle",context);
		var f2 = ajaxart.compile_text(profile, "ItemExtraText",context);
		var cmpl = function(f1,f2) {
			return function(data1,ctx) { return f1(data1,ctx) + ' ' + f2(data1,ctx); }
		}
		compiled = cmpl(f1,f2);
	}
	aa_searchbox_preprocess(items, input,field, compiled, context,0);
	// aa_preprocess_all(items, field, profile, context);	// todo
}
// TODO: rename this function to  
function aa_searchbox_preprocess(items, input,field, compiled,context, step) {
	var all_items_size = input.AllItems.length;
	var stop_at = input.PreprocessChunkSize + step;
	if (stop_at > items.length)
		stop_at = items.length;
	for (var i=step; i<stop_at; i++) {
		input.AllItems.push ( { item: items[i],
			text: ' ' + compiled([items[i]],context).toLowerCase().replace(/^\s*|\s*$/g, ' ')
			});
	}
	if (!input.Searching && input.SearchId && input.TotalShown < input.MaxItemsToShow)	{
		// user has entered text, search has finished and still have room for more results
		// we continue searching with the new chunk
		var input = null; // TODO: fix
		aa_search_chunk(input,field, profile, context, input.SearchId, input.Pattern, all_items_size-1);
	}
	if (i<items.length)
		setTimeout(function() { aa_searchbox_preprocess(items, input, field, compiled, context,i); },1);
}
function aa_search_keydown(field,input,e,context)
{
	var keyCode = e.keyCode;
	if (keyCode == 38 || keyCode == 40) // up/down
	{
		if (input.popup && input.popup.Frame)
			ajaxart_stop_event_propogation(e);

		var cntr = input.Container;
		if (cntr)
			cntr.SelectionKeydown(e); // delegate to cntr selection
		
		return false;
	}
	if (keyCode == 13 ) // enter 
	{
		var cntr = input.Container;
		var selected = jQuery(cntr.Ctrl).find('.aa_selected_item')[0];
		if (!selected) return;
		
		input.OnSelect(selected.ItemData,context);

		if (ajaxart.dialog.openPopups.length > 0) 
			ajaxart_stop_event_propogation(e);
	}
}
function aa_jbart_register_data_arrive(resource,callback,context,widget_id) {
	if (!widget_id) widget_id = ajaxart.totext_array(context.vars.WidgetId);
	var data_holder = aa_jbart_get_data_holder(widget_id,resource);
	if (!data_holder) return;
	data_holder.on_data_arrive.push(callback);
	if (data_holder.items.length > 0)	// if some data already arrived
		callback(data_holder.items);
}
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
function aa_jbart_get_data_holder(widget_id,resource) {
	var key = 'jBartWidget_' + widget_id;
	if (!window[key]) window[key] = {resource: {items:[], on_data_arrive:[]}};
	return window[key].resource;
}
function aa_prepare_more_items_to_show(input,context) {
	input.DoHaveMoreItemsToShow = function() {
		if (this.HasMoreItemsToShow) return ["true"];
		return [];
	}
	input.CancelMoreItemsToShow = function() {
		input.HasMoreItemsToShow = false;
		// refresh header/footer fields to clean 'show all' button
		for(var i=0;i<input.Container.Fields.length;i++)
			if (input.Container.Fields[i].HeaderFooter)
				aa_refresh_field( [input.Container.Fields[i].Id],"document",false,null,aa_ctx(context, {_Cntr: [input.Container]} ));
	}
	input.SetHasMoreItemsToShow = function( show_all_func, total_count ) {
		input.TotalItemsCount = total_count;
		input.HasMoreItemsToShow = true;
		input.ShowAllItems = function() {
			show_all_func();
			this.CancelMoreItemsToShow();
		}
		// refresh header/footer fields so 'show all' button will be visible
		for(var i=0;i<input.Container.Fields.length;i++)
			if (input.Container.Fields[i].HeaderFooter)
				aa_refresh_field([input.Container.Fields[i].Id],"document",false,null,aa_ctx(context, {_Cntr: [input.Container], _SearchBox: [input]}));
	}
}

function ajaxart_uiaspects_container(context) 
{
	if (context.vars._Cntr)
		return context.vars._Cntr[0];
	return null;
}
function ajaxart_uiaspects_select(new_selected,selected,method,ctx,focus) 
{
	  var top_cntr = ajaxart_topCntr(new_selected);
	  if (top_cntr != null)
		  top_cntr.Select(new_selected,selected,method,ctx,focus);
}
function ajaxart_uiaspects_append(item_elem,to_append) // append text/image inside aaitem. 
{
	    if (item_elem.titleTd != undefined)
	    	var parent = item_elem.titleTd;
	    else
	    	var parent = item_elem;
	    var first_ul = jQuery(parent).children().filter('.aa_list,.aa_container');
	    if (first_ul.length > 0)
	    	parent.insertBefore(to_append,first_ul[0]);
	    else
	    	parent.appendChild(to_append);
}
function ajaxart_uiaspects_refreshElements(elems,focus)
{
	  if (elems.length == 0) return;
	  var cntr = jQuery(elems[0]).parents('.aa_container')[0].Cntr;
	  var new_selected = null;

	    var new_elems = [];
	    for(var i=0;i<elems.length;i++)
		{
	    	var new_elem = cntr.createNewElement(elems[i].ItemData,new_elems,cntr.Context);
	    	jQuery(elems[i]).replaceWith(new_elem);
	    	aa_remove(elems[i],true); // memory leaks
	    	if (jQuery(elems[i]).hasClass('aa_selected_item') ) 
	    		new_selected = new_elem;
		}
		var newcontext = aa_ctx(cntr.Context,{_Elems: new_elems } );
	    for(var i=0;i<cntr.Aspects.length;i++) {
	    	ajaxart.trycatch( function() {
	    		ajaxart_runMethod([],cntr.Aspects[i],'InitializeElements',newcontext);
	    	}, function(e) { ajaxart.logException(e); });
	    }
	    if (new_selected)
	    	ajaxart_uiaspects_select(jQuery(new_selected),jQuery(),"auto",cntr.Context,focus);
	    return new_elems;
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
function aa_wrappers(cntr) 
{ 
	return cntr.FilteredWrappers;
}

function ajaxart_uiaspects_addElement(item_data,cntr,parent_elem,create_only)
  {
	  var context = cntr.Context;
	  var new_element = cntr.createNewElement(item_data,null,context);

	  if (new_element)
	  {
		  if (parent_elem == null)
			  var parent = cntr.Ctrl;
		  else
			  var parent = parent_elem;
		  var top = ajaxart_find_list_under_element(parent);
		  if (!create_only)
		  {
			  if (! ajaxart.isxml(item_data) && item_data[0]) item_data[0].__NewItem = true;
			  
			  cntr.DataHolder = null;
			    aa_RunAsyncQuery([item_data, cntr],aa_FilterAndSort,context,function(dataview) {	// for compression: aa_FilterAndSort()
			    	// compare and add new elem
			    	var item_before;
			    	for(var i=0;i<cntr.FilteredWrappers.length-1;i++) // do not look at the last item
			    	{
			    		if (item_data[0] == cntr.FilteredWrappers[i].__item) {  
			    			item_before = cntr.FilteredWrappers[i+1].__item;
			    			break;
			    		}
			    	}
			    	var elem_before = jQuery(top).find('>.aa_item').filter(function() { return this.ItemData[0] == item_before })[0];
			    	if (cntr.FilteredWrappers.length == 0 || item_before == cntr.FilteredWrappers[cntr.FilteredWrappers.length-1].__item || !elem_before)
			    		cntr.insertNewElement(new_element,top);
			    	else
				    	jQuery(new_element).insertBefore(elem_before);
			    });
			    if (! ajaxart.isxml(item_data)) delete item_data['__NewItem'];
		  }
		  
	      jQuery(top).find('>.noitems').remove();
	  }

	  var newcontext = aa_ctx(context,{_Elems: [new_element], _Cntr: [cntr]} );
	  for(var i=0;i<cntr.Aspects.length;i++)
    		ajaxart_runMethod([],cntr.Aspects[i],'InitializeElements',newcontext)

      if (jQuery(parent).find('>.aa_list').length > 0 && jQuery(parent).find('>.collapsable').length == 0 && cntr.CollapseElem && parent.ItemData)
  	    cntr.CollapseElem(jQuery(parent),false);
    		
      aa_invoke_cntr_handlers(cntr,cntr.ContainerChange,[],cntr.Context);

	  return new_element;
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
function ajaxart_getsection(context) {
	var out = context.vars['_Section'];
	if (out == null || out.length == 0) return null;
	return out[0];
}
function ajaxart_itemlist_getSelectedItems(cntr)
{
	var selected = jQuery(cntr.Ctrl).find(".aa_selected_item").filter(aa_visible);
	var out = [];
	for(var i=0;i<selected.length;i++)
		ajaxart.concat(out,selected[i].ItemData);
	
	return out;
}
function aa_find_header(cntr) { return aa_find_just_in_container(cntr,'.aa_container_header',true); }
function aa_find_footer(cntr) { return aa_find_just_in_container(cntr,'.aa_container_footer',true); }
function aa_find_list(cntr) { return aa_find_just_in_container(cntr,'.aa_list',true); }

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

function ajaxart_find_aa_list(cntr) { 
	return ajaxart_find_list_under_element(cntr.Ctrl); 
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
function ajaxart_isLeaf(elem)
{
	return jQuery(elem).find('>.aa_list,>.aa_container').find('.aa_item').length == 0;
}
function ajaxart_add_foucs_place(li)
{
	jQuery(li).addClass('aa_focus_place');
	li.setAttribute("tabindex","1");
}
function aa_visible() { return this.hidden != true } // && jQuery(this).parents(':hidden').length == 0 TODO: not working in chrome
function aa_visible_selectable() { return this.hidden != true } // && ! jQuery(this).parents('.aa_container').slice(0,1).hasClass('aa_non_selectable') } // && jQuery(this).parents(':hidden').length == 0 

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


function aa_registerHeaderEvent(thead,eventType,func,ownerId,activation_mode)
{
	if (thead.EventHandler == null)
	{
		aa_defineElemProperties(thead,'handlers,EventHandler');
		thead.handlers = [];
		thead.EventHandler = function(e)
		{
			var elem = jQuery( (typeof(event)== 'undefined')? e.target : (event.tDebug || event.srcElement)  ); 
		    e = e || event; // IE
		    if (elem.hasClass('fieldtitle_info')) return false; // a bit ugly. it has its own handler
		    
		    if (elem.hasClass('fieldtitle'))
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
function ajaxart_dataitems_save(data_items,fields,context,callback)
{
  if (data_items==null) return [];
  // TODO: recalc calculated fields before save
  ajaxart_async_Mark(context);
  
  var afterSave = function(originalData) { return function(data1,ctx) {
	  var data = data_items.Items;
	  if (originalData == null) originalData = []; else originalData = [originalData];
	  // call after save for the fields
	  ajaxart_fields_aftersave(data,data,originalData,fields,context);
	  
	  callback(data1,ctx);
	  if (ajaxart_async_IsFailure(ctx)) ajaxart_async_Failure(context);
	  ajaxart_async_CallBack([],context); 
  }}
  var info = aa_getXmlInfo(data_items.Items[0],context);
  aa_runMethodAsync(data_items,data_items.Save,data_items.Items,context,afterSave(info ? info.OriginalCopy : null));
}
function ajaxart_saveDetailsAndRefresh(item,fields,context,returnCallback) 
{
	var subset = context.vars._InnerItems[0];
	
	var callback = function(data1,ctx) {
		var cntr = ctx.vars._Cntr[0];
		var subset = context.vars._InnerItems[0];
		
		if (aa_tobool(context.vars.IsNewItem)) {
		    var parent = null;
		    
		    item = subset.Items;
		    var dataitems = cntr.Items[0];
		    if (dataitems.NewValueFromDetached) item = ajaxart_runMethod(item,dataitems,'NewValueFromDetached',context);
		    var updatedElem = ajaxart_uiaspects_addElement(item,cntr,parent);
		}
		else {
			var all_elems = jQuery(ajaxart_find_aa_list(cntr)).find('>.aa_item');
			var elems = [];
			for(var i=0;i<all_elems.length;i++)
				if (all_elems[i].ItemData && all_elems[i].ItemData[0] == item[0]) 
					elems.push(all_elems[i]);
			
			var updatedElem = ajaxart_uiaspects_refreshElements(elems);
		}
		if (ctx.vars._SaveActions)
			ajaxart_runMethod(item,ctx.vars._SaveActions[0],'AfterSave',context);
		
		aa_refreshAfterDataItemsChanged(context);
		aa_invoke_cntr_handlers(cntr,cntr.ContainerChange,[],ctx);
		if (cntr.Ctrl.PopupObj)
			cntr.Ctrl.PopupObj.contents = cntr.Ctrl;

		if (returnCallback) returnCallback(data1,aa_ctx(ctx,{_ElemsOfOperation: [updatedElem]}));
		return [];
	}
	if (context.vars._SaveActions)
		ajaxart_runMethod(subset.Items,context.vars._SaveActions[0],'BeforeSave',context);
	
	ajaxart_dataitems_save(subset,fields,context,callback);
}
function aa_aspectId(aspect) {
  if (aspect.ID) return aspect.ID;
  return aspect.XtmlSource[0].script.getAttribute('t');
}
function aa_dataitems_of_elem(elem)
{
	if (jQuery(elem).hasClass('aa_container')) return elem.Cntr.Items[0];
	if (jQuery(elem).hasClass('aa_treenode')) return elem._Items;
	
	var top = jQuery(elem).parents('.aa_treenode,.aa_container')[0];
	return top._Items || top.Cntr.Items[0];
}
function aa_hasClass(elem,cls) {
	if (elem.className.indexOf(cls) == -1) return false;
	return jQuery(elem).hasClass(cls);
}
function aa_init_itemdetails_object(object,originalItem,info,subset,page,context)
{
	if (subset.Save) subset.HasSave = true;
	
	object.ParentCntr = context.vars._Cntr[0];
	object.Save = function(data1,ctx2) {
		ajaxart_saveDetailsAndRefresh(originalItem,page.Fields,ctx2);
		object.ClearUrl();
	}
	object.SaveAndClose = function(data1,ctx2) {
		if (! aa_passing_validations(object.ParentCntr.Ctrl) ) return;
		object.HideDetails(data1,ctx2);
		ajaxart_saveDetailsAndRefresh(originalItem,page.Fields,aa_ctx(ctx2,{_Cntr: context.vars._Cntr}));
		object.ClearUrl();
	}
	object.Close = function(data1,ctx2) {
		object.HideDetails(data1,ctx2);
		object.ClearUrl();
	}
	object.Cancel = function(data1,ctx2) {
		var refresh = false;
	    if (info && info.Cancel) info.Cancel(data1,ctx2);
		
		object.HideDetails(data1,ctx2);
		object.ClearUrl();
		if (refresh)
			ajaxart_saveDetailsAndRefresh(originalItem,page.Fields,ctx2);
	}
	object.HideDetails = function() {}
	object.ElemsOfOperation = context.vars._ElemsOfOperation;
	object.RefreshMasterElement = function(data1,ctx) {
		var elem = object.ElemsOfOperation;
		if (!elem || elem.length == 0) return;
		var cntr = object.ParentCntr;
		if (cntr.Tree)
			aa_invoke_cntr_handlers(cntr,cntr.RefreshItemTextAndImage,elem,ctx);
		else {
			var new_elems = [];
	    	var new_elem = cntr.createNewElement(elem[0].ItemData,new_elems);
	    	jQuery(elem).replaceWith(new_elem);
	    	if (jQuery(elem).hasClass('aa_selected_item') ) jQuery(new_elem).addClass('aa_selected_item');
	    	object.ElemsOfOperation = [new_elem];
		}
	}
	object.ClearUrl = function() {
	  aa_urlChange(context,"?"+object.ParentCntr.ID+"_open=;");
	}
	object.DataItems = object.ParentCntr.Items[0];
	var jparent = jQuery(context.vars._ElemsOfOperation).parents('.aa_treenode,.aa_container');
	if (jparent.length > 0 && jparent[0]._Items) object.DataItems = jparent[0]._Items;
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

function aa_concat_atts(data,ctx)
{
	var item = data[0];
	if (!item) return '';
	if (typeof(item) == 'string') return [item];
	var result = '';
	if (ajaxart.isxml(item) && item.nodeType == 1)
	{
		var out = [];
		var atts = item.attributes;
		if (atts != null)
			for (var i = 0; i < atts.length; i++)
				result += atts.item(i).value + ", ";
		var subElem = item.firstChild;
		while (subElem) {
			var subElemTxt = subElem.firstChild;
			if (subElem.nodeType == 1 && subElemTxt && subElemTxt.nodeValue != '')
				if (subElemTxt.nodeType == 3 || subElemTxt.nodeType == 4) 
					result += subElemTxt.nodeValue + ", ";
			subElem = subElem.nextSibling;
		}
	}
	else if (ajaxart.isObject(item))
	{
		for(var i in item)
			if (i != 'isObject' && i.indexOf('__') != 0 && typeof(item[i]) == 'string')
				result += item[i] + ", ";
		if (item.Node)
			result += ", " + aa_concat_atts([item.Node],ctx);
		if (item.__item)
			result += ", " + aa_concat_atts([item.__item],ctx);
	}
	return [result];
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

function aa_recalc_filters_and_refresh(cntr,data,context,show_all)
{
	context = context || cntr.Context;
    var top = ajaxart_find_aa_list(cntr);
    if (!top) return;
    aa_RunAsyncQuery([data, cntr],aa_FilterAndSort,context,function(dataview) { aa_refresh_itemlist(cntr,aa_ctx(context,{DataView:dataview}),show_all) });// for compression: aa_FilterAndSort()
    //ajaxart_RunAsync([data, cntr],aa_FilterAndSort,context,function() { aa_refresh_itemlist(cntr,context,show_all) } );
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
function aa_dummysubet(node) // will be removed after the xml refactor is completed and subsets will be no more
{
  var subset = { isObject: true, Items: [node] }
  subset.Save = function(data1,ctx) {
	  var info = aa_getXmlInfo(node,ctx);
	  if (info.Save) return info.Save([node],ctx);
  }
  return subset;
}
function aa_apply_css(elem,css)
{
	if (!css) return;
	if (typeof(css) != "string")
		css = ajaxart.totext_array(css);
	if (css == "") return;
	if (css.indexOf(":") > 0)	// inline
		elem.style.cssText = elem.style.cssText + ";" + css;
	else	// class
		elem.className = elem.className + " " + css;
}
function ajaxart_getUiPref(prefix,property,context) { 
	if (context.vars._UIPref == null) return null;
	var newContext = aa_ctx(context,{ Prefix: [prefix] , Property: [property]} );
	var result = ajaxart.totext_array( ajaxart_runMethod([],context.vars._UIPref[0],'GetProperty',newContext) );
	if (result == "") return null;
	return result;
}
function ajaxart_setUiPref(prefix,property,value,context) { 
	if (context.vars._UIPref == null) return;
	var newContext = aa_ctx(context,{ Prefix: [prefix] , Property: [property], Value: [value] } );
	ajaxart_runMethod([],context.vars._UIPref[0],'SetProperty',newContext);
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
function aa_empty(elem,clearMemoryLeaks)
{
	var children = [];
	while(elem.firstChild) aa_remove(elem.firstChild,clearMemoryLeaks);	
	aa_clear_virtual_inner_element(elem);
}
function aa_clear_virtual_inner_element(elem) 
{
	if (!elem.virtual_inner_elements) return;
	for(var i=0;i<elem.virtual_inner_elements.length;i++) {
		aa_empty(elem.virtual_inner_elements[i]);
	}
}
function aa_checked(input,checked)
{
	input.checked = checked; input.defaultChecked = checked;
}
var aa_intest;
if (!ajaxart.ui) ajaxart.ui = {};
ajaxart.ui.bindEvent = function(elem,event1,func1)
{
	if (!elem) return;
  if (event1 == "mouserightclick") {
  	  // Disable browser context menu (requires both selectors to work in IE/Safari + FF/Chrome)
	  jQuery(elem).bind('contextmenu', function() { return false; });
	  
	  jQuery(elem).mousedown( function(e) {
		var evt = e;
		if( evt.button == 2 ) { 
			aa_xFireEvent(this, 'click', null);		// right-click is also click (for element selection)
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
function aa_absLeft(elem,ignoreScroll)
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

function aa_absTop(elem,ignoreScroll)
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
function aa_mousePos(e,removeWindowScroll)
{
	var out = {};
	if (typeof(event) != 'undefined')
		var e = window.event;
	
	if (e.pageX || e.pageY) {
		out = { x: e.pageX, y:e.pageY };
	} else if (e.clientX || e.clientY) {
		var posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		var posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		out = { x: posx, y: posy }
	}
	if (removeWindowScroll && out.y) out.y -= (window.pageYOffset || 0);
	if (removeWindowScroll && out.x) out.x -= (window.pageXOffset || 0);

	return out;
}
ajaxart.ui.applyKeyboardEvent = function(_event,context)
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
aa_incapture = false;
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
function aa_html_findclass(elem,className) 
{
  if (jQuery(elem).hasClass(className)) return jQuery(elem);
  return jQuery(elem).find('.'+className);
}
function aa_image_size_obj(size)
{
	var out = {};
	var items = size.split(",");
	if (items.length >= 1)
		out.width = parseInt(items[0].split('px')[0]);
	if (items.length >= 2)
		out.height = parseInt(items[1].split('px')[0]);
	return out;
}
function aa_fix_image_size(img,desired_size) 
{
	if (!desired_size.height && !desired_size.width) return;
	if (!desired_size.height) { img.style.width = desired_size.width + "px"; return; }
	if (!desired_size.width) { img.style.height = desired_size.height + "px"; return; }
		
	var fix = function() {
		var imgObj = new Image(); imgObj.src = img.getAttribute('src');
		var naturalWidth = imgObj.naturalWidth,naturalHeight = imgObj.naturalHeight;
		if (imgObj.naturalWidth == null) {
			naturalWidth = imgObj.width,naturalHeight = imgObj.height;
		}
//		if (naturalWidth < desired_size.width) img.width = naturalWidth; 
//		if (naturalHeight < desired_size.height) img.height = naturalHeight;
		var width = Math.min(naturalWidth,desired_size.width);
		var height = Math.min(naturalHeight,desired_size.height); // IE hates img.width
		
		var ratio = naturalWidth / naturalHeight;
		var currRatio = width / height;
		if (ratio != currRatio) {
			if (naturalWidth >= naturalHeight * currRatio) {
				width = desired_size.width;
				height = Math.floor(width / ratio);
			} else {
				height = desired_size.height;
				width = Math.floor(height * ratio);
			}
		}
		img.width = width;
		img.height = height;
	}
	  var imgObj = new Image(); imgObj.src = img.getAttribute('src');
	  if (imgObj.complete) fix();
	  else img.onload = fix;
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
function aa_set_element_size(element,text,prefix) // prefix can be empty, min-,max-
{
	prefix = prefix || '';
	var arr = text.split(',');
	var width = aa_size_to_pixels(arr[0],"width");	// fix percentages
	var height = aa_size_to_pixels(arr[1] || '',"height");
	if (width) jQuery(element).css(prefix + "width",width);
	if (height) jQuery(element).css(prefix + "height",height);
}
function aa_size_to_pixels(value,type)
{
	if (!value) return null;
	if (value.match(/^[0-9 ]+$/)) return value + "px";
	if (value.indexOf("%") == -1) return value;
	var num = parseInt(value);
	if (isNaN(num)) return null;
	return Math.floor(ajaxart_screen_size()[type] * num / 100) + "px";
}
function aa_ensure_visible(elem, padding) 	// auto scroll parents to ensure elem is visible (only vertical scroll)
{
	return;	// todo: fix this function, sometimes it scrolls with no need.
//	if (jQuery(elem).is(':visible')) return;
	
    var elem_height = elem.offsetHeight;

    var curr = elem;
    var top = 0;
    if (!padding) padding = 10;

    while (true) {
    	var parent = curr.parentNode;
    	if (!parent) return;
    	top += curr.offsetTop;
    	if (parent.offsetParent == curr.offsetParent)
    		 top -= parent.offsetTop;	// offsetTop is relative to offsetParent and not to parent
    	if (top + elem_height + padding > parent.offsetHeight + parent.scrollTop)	// need to scroll down
    		parent.scrollTop = elem_height + top + padding - parent.offsetHeight;
    	if (top - padding < parent.scrollTop)	// need to scroll up
    		parent.scrollTop = Math.max(top - padding,0);
    	top -= parent.scrollTop;

    	curr = parent;
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
jBart.addDescriptionForEmptyText = function(cell,emptyTextDescription,emptyTextClass)
{
	var field = cell.Field;
	var input = jQuery(cell).find('input')[0] || jQuery(cell).find('textarea')[0];
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
	else {
		var textDiv = jQuery(cell).find('.text');
		if (textDiv[0] && textDiv.text() == '') textDiv.text(emptyTextDescription).addClass(emptyTextClass);
	}
}
var aa_delayed_actions = {};
function aa_run_delayed_action(action_id,func,delay)
{
	aa_delayed_actions[action_id] = { func:func };
	aa_delayed_actions[action_id].timeoutid = setTimeout(function() {
		if (aa_delayed_actions[action_id])
			aa_delayed_actions[action_id].func();
	},delay || 1);
}
function aa_cancel_delayed_action(action_id)
{
	if (aa_delayed_actions[action_id]) {
		clearTimeout(aa_delayed_actions[action_id].timeoutid);
		aa_delayed_actions[action_id] = null;
	}
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
		window.addEventListener('resize', onresize,false);
		window.addEventListener('orientationchange', onresize,false);	// sometimes orientationchange is fired and sometimes resize, http://blog.blazingcloud.net/2012/05/08/orientationchange-and-resize-events-on-the-iphone/
	}
	jQuery(elem).addClass('aa_window_resize_listener');
	jBart.bind(elem,'WindowResize',func);
}