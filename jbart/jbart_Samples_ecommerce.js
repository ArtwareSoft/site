
var ajaxart={debugmode:false,debug_aaeditor_select:false,log_level:"error",xtmls_to_trace:[],trace_result:null,trace_level:2,trace_stack:true,traces:[],trace_show_all_xml:true,components:[],componentsXtmlCache:[],usages:[],types:[],plugins:[],gcs:{},ready_func:null,log_str:"",loading_objects:0,logs:{},default_values:[],inPreviewMode:false,profiling_of_globals:null,stack_trace:[],build_version:'ART_NOW'};var jBart={};ajaxart.xml={};ajaxart.cookies={};ajaxart.ui={};ajaxart.yesno={};ajaxart.dialog={openPopups:[]};jbart_init();noOfOpenDialogs=0;aa_dialogCounter=0;openDialogs=[];var aa_intest;aa_incapture=false;var aa_navigation_codes=[38,40,33,34,63277,63276];aa_async_finished_listeners=[];var aa_counter=0;ajaxart.xmlsToMonitor=[];aa_xmlinfos=[];ajaxart_mlTable=null;ajaxart.lookup_cache={};ajaxart.occurrence_cache={};ajaxart.unique_number=1;function aa_gcs(plugin,gcs){if(!ajaxart.gcs[plugin])
ajaxart.gcs[plugin]=gcs;else{var plugin=ajaxart.gcs[plugin];for(var gc in gcs)
plugin[gc]=gcs[gc];}}
function aa_bool(data,script,field,params,method,empty_value_is_true)
{var result=aa_text(data,script,field,params,method,true);if(result=="")return(empty_value_is_true)?true:false;if(result=="false")return false;if(result=="true")return true;if(!isNaN(result))return false;var boolean_result=false;text_to_eval="if ("+result+") boolean_result=true;";try{eval(text_to_eval);}
catch(e){ajaxart.log("Failed to evaluate boolean expression: "+result+","+e.message
+"\n script :"+aa_xtml_path(script,"id",true),"warning");}
return boolean_result;}
function aa_text(data,script,field,params,method,booleanExpression)
{if(booleanExpression)
return ajaxart.totext(ajaxart.run(data,script,field,params,method,booleanExpression));return ajaxart.totext_array(ajaxart.run(data,script,field,params,method,booleanExpression));}
function aa_hasAttribute(elem,attr)
{if(ajaxart.isBackEnd)return elem.hasAttribute(attr);else return elem.getAttribute(attr)!=null;}
function aa_totext(data)
{if(typeof(data)=="string")return data;if(data==null||data.length==0)return"";return ajaxart.totext_item(data[0]);}
function aa_xpath(xml,xpath){return ajaxart.xml.xpath(xml,xpath);}
function aa_createElement(elem,tag)
{if(elem==null||!ajaxart.isxml(elem))
return ajaxart.parsexml("<"+tag+"/>");if(ajaxart.isBackEnd)
return elem.getOwnerDocument().createElement(tag);return elem.ownerDocument.createElement(tag);}
function aa_tag(item)
{if(ajaxart.isBackEnd)
return''+item.getTagName();if(!item.tagName)return"";if(item.tagName.indexOf(':')!=-1)
return item.tagName.split(':').pop();return item.tagName;}
function aa_first(data,script,field,params,method){var result=ajaxart.run(data,script,field,params,method);if(result.length==0)return null;return result[0];}
function aa_ctx(context,vars)
{var out=ajaxart.clone_context(context);for(var i in vars)out.vars[i]=vars[i];return out;}
function aa_frombool(bool)
{if(bool)return["true"];return[];}
function aa_passing_validations(topControl)
{if(topControl==null)return true;jQuery(topControl).find('.aa_noclose_message').remove();var optionals=jQuery(topControl).find('.aa_hasvalidations');for(var i=0;i<optionals.length;i++){var input=optionals[i];if(input.ajaxart)
aa_handleValidations(input.ajaxart.params.vars._Field[0],input,input.ajaxart.data,input.ajaxart.params,'on save');}
var errorInput=jQuery(topControl).find('.mandatory_error')[0];if(errorInput){aa_validation_showerror(topControl,errorInput.Error);return false;}
var errors=jQuery(topControl).find('.validation_error');if(errors.length>0){aa_validation_showerror(topControl,errors[0].fieldTitle+'  '+errors[0].innerHTML);errors[0].innerHTML="";return false;}
return true;}
function aa_merge_ctx(context,contextVars,moreVars)
{var result={params:context.params,vars:contextVars.vars,componentContext:context.componentContext,_This:contextVars._This};if(moreVars)
result=aa_ctx(result,moreVars);return result;}
function aa_items(cntr)
{if(cntr.IsSingleItem)
return(cntr.Items==null||cntr.Items.length==0||cntr.Items[0].Items.length==0)?[]:[cntr.Items[0].Items[0]];var source_cntr=cntr;if(cntr.InheritsItems)
{source_cntr=source_cntr.Context.vars._ParentCntr[0];while(source_cntr&&source_cntr.IsVirtualGroup)
source_cntr=source_cntr.Context.vars._ParentCntr[0];}
if(!source_cntr)return[];var result;if(source_cntr.FilteredWrappers&&cntr.WrappersAsItems)
result=source_cntr.FilteredWrappers;else if(source_cntr.FilteredWrappers)
{result=[];var wrappers=source_cntr.FilteredWrappers;for(i in wrappers)
result.push(wrappers[i].__item||wrappers[i]);}
else if(source_cntr.FilteredItems)
return source_cntr.FilteredItems;else
result=source_cntr.Items[0].Items;return result;}
function aa_find_header(cntr){return aa_find_just_in_container(cntr,'.aa_container_header',true);}
function aa_find_footer(cntr){return aa_find_just_in_container(cntr,'.aa_container_footer',true);}
function aa_int(data,script,field,params,method)
{var result=ajaxart.run(data,script,field,params,method);return parseInt(ajaxart.totext_array(result));}
function aa_register_handler(obj,event,handler,id,phase)
{if(obj[event]==null)obj[event]=[];handler.phase=phase||0;var replaced=false;if(id)
{handler.Id=id;for(var i=0;i<obj[event].length;i++)
if(obj[event][i].Id==id)
{obj[event][i]=handler;replaced=true;}}
if(!replaced)
obj[event].push(handler);obj[event].sort(function(a,b){return a.phase>b.phase?1:-1;});}
function aa_comma_size_to_css(size)
{size=size.replace(/px/g,"")
var parts=size.split(',');var out="";var width=parts[0];if(width!=""){if(width.indexOf('%')==-1)width+="px";out+="width:"+width+";";}
if(parts.length==1)return out;var height=parts[1];if(height!=""){if(height.indexOf('%')==-1)height+="px";out+="height:"+height+";";}
return out;}
function aa_is_rtl(elem,ctx)
{if(jQuery(elem).parents('.right2left').length>0)return true;if(!elem&&jQuery("body").find('.right2left').length>0)return true;if(ctx&&aa_totext(ctx.vars.Language)=='hebrew')return true;return false;}
function aa_apply_css(elem,css)
{if(!css)return;if(typeof(css)!="string")
css=ajaxart.totext_array(css);if(css=="")return;if(css.indexOf(":")>0)
elem.style.cssText=elem.style.cssText+";"+css;else
elem.className=elem.className+" "+css;}
undefined
function aa_stop_prop(e)
{if(!e)return;if(e.stopPropagation)
e.stopPropagation();if(e.preventDefault)
e.preventDefault();e.cancelBubble=true;return false;}
function aa_invoke_cntr_handlers(cntr,eventFuncs,data,ctx,extra)
{if(!eventFuncs||eventFuncs.RunningFlag)return;eventFuncs.RunningFlag=true;var newContext=aa_ctx(ctx,{_Cntr:[cntr]});try
{for(var i=0;i<eventFuncs.length;i++)
eventFuncs[i](data,newContext,extra);}
catch(e){}
eventFuncs.RunningFlag=false;}
function aa_paramExists(profile,param)
{var script=ajaxart.fieldscript(profile,param,true);if(script==null)return false;if(script.nodeType==1&&script.getAttribute('t')=="")return false;if(script.nodeType==1&&!aa_hasAttribute(script,'t'))return false;return true;}
function aa_find_list(cntr){return aa_find_just_in_container(cntr,'.aa_list',true);}
function aa_tobool(data)
{if(data==null||data.length==0)return false;if(ajaxart.totext_array(data)=="true")return true;return false;}
function aa_recalc_filters_and_refresh(cntr,data,context,show_all)
{context=context||cntr.Context;var top=ajaxart_find_aa_list(cntr);if(!top)return;aa_RunAsyncQuery([data,cntr],aa_FilterAndSort,context,function(dataview){aa_refresh_itemlist(cntr,aa_ctx(context,{DataView:dataview}),show_all)});}
function aa_fire_event(item,event,context,props)
{if(typeof(props)=="undefined")props={};if(!ajaxart.isSafari||ajaxart.isattached(item))
xFireEvent(item,event,props,context.vars.InTest!=null);else{ajaxart_source_elem_in_test=item;while(item!=null)
{xFireEvent(item,event,props,context.vars.InTest!=null);item=item.parentNode;}
ajaxart_source_elem_in_test=null;}}
function aa_replaceElement(element,newControl)
{if(element.ParentObject!=null){newControl.ParentObject=element.ParentObject;newControl.ParentObject[0].ControlHolder=[newControl];}
if(newControl){ajaxart.replaceXmlElement(element,newControl,true);aa_clear_virtual_inner_element(element);aa_element_attached(newControl);aa_element_detached(element);}}
function aa_string2id(txt)
{if(!ajaxart.hebchars)ajaxart.hebchars=ajaxart.types.text_HebrewText.getAttribute('HebChars');var heb=ajaxart.hebchars;var eng='abgdaozhtiklmnsapzkrstnfhz';var newid="";for(var i=0;i<txt.length;i++){var pos=heb.indexOf(txt.charAt(i));if(pos==-1)newid+=txt.charAt(i);else newid+=eng.charAt(pos);}
txt=newid;txt=txt.replace(/[^0-9a-zA-Z]/g,'_').replace(/(^[0-9]+)/g,'_$1');return txt;}
function aa_uidocument(data,id,dataitems,fields,aspectsFunc,operationsFunc,context,readonly)
{var cntr={ID:[id],IsSingleItem:true,isObject:true,Fields:fields,Items:dataitems,ReadOnly:readonly==true}
var newcontext=aa_ctx(context,{_ParentCntr:context.vars._Cntr,_Cntr:[cntr]});cntr.Context=newcontext;cntr.Ctrl=jQuery('<div class="aa_container aa_non_selectable"><div class="aa_container_header"/><div class="aa_list aasection aa_item aa_cntr_body"/><div class="aa_container_footer"/></div>')[0];cntr.Ctrl.Cntr=cntr;if(id!='')
jQuery(cntr.Ctrl).addClass('Page_'+id);if(aa_tobool(context.vars.IsNewItem))cntr.IsNewItem=true;var aspects=cntr.Aspects=aspectsFunc(data,newcontext);for(var i=0;i<aspects.length;i++)
ajaxart.runScriptParam(data,aspects[i].CreateContainer,newcontext);var fillContainer=function(cntr,aspects){cntr.PostActors=[];cntr.PreActors=[];cntr.RegisterForPostAction=function(aspect,phase){cntr.PostActors.push({phase:phase||0,aspect:aspect});}
cntr.RegisterForPreAction=function(aspect,phase){cntr.PreActors.push({phase:phase||0,aspect:aspect});}
if(cntr.Items.length==0){cntr.Items=[{isObject:true,Items:[]}]}
if(cntr.Items[0].Items.length==0){cntr.NoData=true;cntr.Items[0].Items.push(ajaxart.parsexml('<xml/>'))}
var items_data=(cntr.Items==null||cntr.Items.length==0||cntr.Items[0].Items.length==0)?[]:[cntr.Items[0].Items[0]];cntr.ElemsOfOperation=function(){return jQuery(this.Ctrl).find('.aa_item').slice(0,1).get();}
cntr.ItemsOfOperation=function(){return[this.Items[0].Items[0]];}
cntr.CellPresentation='control';cntr.Operations=operationsFunc;for(var i=0;i<cntr.Aspects.length;i++){ajaxart.trycatch(function(){ajaxart_runMethod(data,cntr.Aspects[i],'InitializeContainer',newcontext);},function(e){ajaxart.log("error in aspect "+cntr.Aspects[i].XtmlSource[0].script.getAttribute('t')+": "+e.message,"error");});}
cntr.PreActors.sort(function(a,b){return a.phase>b.phase?1:-1;});cntr.PostActors.sort(function(a,b){return a.phase>b.phase?1:-1;});for(var i=0;i<cntr.PreActors.length;i++){ajaxart.trycatch(function(){ajaxart.runScriptParam([],cntr.PreActors[i].aspect.PreAction,cntr.Context);},function(e){ajaxart.log(e.message,"error");});}
aa_refresh_itemlist(cntr,newcontext,true);if(cntr.NoData&&cntr.ControlForNoData){var top=ajaxart_find_aa_list(cntr);var ctrl=cntr.ControlForNoData([],context)[0];jQuery(ctrl).addClass('aa_list');aa_replaceElement(top,ctrl);}}
if(cntr.RunAsyncAction&&cntr.ControlForWaiting){var myCallback=function(cntr,aspects){return function(){var loading=cntr.Ctrl;cntr.Ctrl=cntr.OriginalCtrl;fillContainer(cntr,aspects);aa_replaceElement(loading,cntr.Ctrl);aa_fixTopDialogPosition();}}
cntr.OriginalCtrl=cntr.Ctrl;cntr.Ctrl=cntr.ControlForWaiting(data,context)[0];cntr.Ctrl.Cntr=cntr;aa_runMethodAsync(cntr,cntr.RunAsyncAction,data,aa_ctx(context,{}),myCallback(cntr,aspects));return cntr.Ctrl;}
fillContainer(cntr,aspects);return cntr.Ctrl;}
function aa_url_attribute(url,attr)
{if(url.indexOf('#')>-1)url=url.substring(url.indexOf('#'));var pos=url.indexOf('?'+attr+'=');if(pos==-1)return"";var out=url.substring(pos+1);out=out.substring(out.indexOf('=')+1);if(out.indexOf('?')>-1)out=out.substring(0,out.indexOf('?'));if(out!=""&&out.charAt(out.length-1)==';')out=out.substring(0,out.length-1);return out;}
function aa_setMethod(object,method,profile,field,context)
{var compiled=ajaxart.compile(profile,field,context);var init=function(compiled){object[method]=function(data1,ctx){var newContext=ajaxart_mergeContext(context,ctx);newContext._This=object;if(compiled)
return compiled(data1,newContext);else
return ajaxart.run(data1,profile,field,newContext);}}
init(compiled);}
function aa_xml2htmltext(xml)
{if(xml==null)return'';if(xml.nodeType==null)return xml;if(xml.nodeType==2||xml.nodeType==3||xml.nodeType==4){return ajaxart.xmlescape(ajaxart.isBackEnd?''+xml.nodeValue:xml.nodeValue);}
var out=xml.xml;if(xml.nodeType!=null)
{if(out==null)out=xml.outerHTML;if(out==null&&ajaxart.isBackEnd){out=''+com.artwaresoft.XmlUtils.XmlToString(xml);}
else if(out==null){var serializer=new XMLSerializer();out=serializer.serializeToString(xml);}}
return out;}
function aa_setCssText(elem,cssText)
{if(ajaxart.isFireFox)cssText=cssText.replace(/-webkit-/g,'-moz-');elem.style.cssText=cssText;}
function aa_keepimageprops(img,user_width,user_height)
{var imgObj=new Image();imgObj.src=img.getAttribute('src');if(imgObj.complete)aa_fixImageSize(img,user_width,user_height);else{img.onload=function(){aa_fixImageSize(img,user_width,user_height);}}}
function aa_field_handler(field,event,handler,id,phase)
{aa_register_handler(field,event,handler,id,phase);}
function aa_multilang_text(data,script,field,context)
{return ajaxart_multilang_run(data,script,field,context)[0];}
function aa_set_fielddata_method(field,path)
{field.FieldData=function(data,ctx)
{if(data.length==0)return[];if(data[0].isObject)
var out=[data[0][path.split('@').pop()]];else
var out=ajaxart.xml.xpath(data[0],path,false);if(out.length>0)
return out;if(!ctx||aa_tobool(ctx.vars._NoDefaultValue))return out;var out=ajaxart.xml.xpath(data[0],path,true);var defaultValue=ajaxart_runMethod(data,field,'DefaultValue',ctx);ajaxart.writevalue(out,defaultValue,true);return out;};}
function aa_set_initialize_container(aspect,func)
{aspect.InitializeContainer=function(data1,ctx){var cntr=ctx.vars._Cntr[0];func(aspect,ctx,cntr);}}
function aa_get_func(code){if(!ajaxart.functions_cache)
ajaxart.functions_cache={};if(code=="")return function(){}
if(code.indexOf('function')!=0)code='function() {'+code+'}';if(!ajaxart.functions_cache[code])
try{ajaxart.functions_cache[code]=eval('f ='+code);}catch(e){ajaxart.log("RunJavaScript: "+e.message+'   code = '+code,"error");}
return ajaxart.functions_cache[code];}
function aa_preprocess_items_for_search(items,input,field,profile,context){input.PreprocessStep=0;input.PreprocessChunkSize=500;input.AllItems=[];var searchIn=aa_text([],profile,'SearchIn',context),compiled=null;if(searchIn=='title')
compiled=ajaxart.compile_text(profile,"ItemTitle",context);else if(searchIn=='title and extra text'){var f1=ajaxart.compile_text(profile,"ItemTitle",context);var f2=ajaxart.compile_text(profile,"ItemExtraText",context);var cmpl=function(f1,f2){return function(data1,ctx){return f1(data1,ctx)+' '+f2(data1,ctx);}}
compiled=cmpl(f1,f2);}
aa_searchbox_preprocess(items,input,field,compiled,context,0);}
function aa_text_extractRegex(text,pattern,group)
{try
{var ar=text.match(pattern);if(ar==null)return null;var result=null;if(group==0)return ar[0];if(group==1)return RegExp.$1;if(group==2)return RegExp.$2;if(group==3)return RegExp.$3;if(group==4)return RegExp.$4;if(group==5)return RegExp.$5;if(group==6)return RegExp.$6;if(group==7)return RegExp.$7;var result=eval('RegExp.$'+group);if(result==null)
ajaxart.log("failed extracting regex :"+pattern,"warning");return result;}catch(e){ajaxart.log("failed extracting regex :"+pattern,"warning");}
return null;}
function aa_jbart_register_data_arrive(resource,callback,context,widget_id){if(!widget_id)widget_id=ajaxart.totext_array(context.vars.WidgetId);var data_holder=aa_jbart_get_data_holder(widget_id,resource);if(!data_holder)return;data_holder.on_data_arrive.push(callback);if(data_holder.items.length>0)
callback(data_holder.items);}
function aa_closePopup(popup)
{if(window['aa_dont_close_popups'])return;var popups=ajaxart.dialog.openPopups;if(popups.length==0)return;if(!popup)popup=popups[popups.length-1];if(!aa_intest&&!popup.initialized)return;var top_popup=popups[popups.length-1];while(top_popup!=popup)
{if(!top_popup.initialized)
{if(popups.length<=1)return;var new_top=popups[popups.length-2];if(new_top==popup)
{var un_initialize=popups.pop();new_top=popups.pop();popups.push(un_initialize);popups.push(new_top);top_popup=new_top;}
else
return;}
aa_closePopup(top_popup);popups=ajaxart.dialog.openPopups;top_popup=ajaxart.dialog.openPopups[ajaxart.dialog.openPopups.length-1];}
if(top_popup!=popup)debugger;ajaxart.dialog.openPopups.pop();aa_uncapture_for_popup(popup);if(!popup.Dlg){jQuery(popup.contents).parent().remove();aa_element_detached(jQuery(popup.contents).parent()[0]);}
if(popup.returnFocusTo!=null)popup.returnFocusTo.focus();if(ajaxart.suggestbox!=null&&ajaxart.ui.suggestBoxPopup!=null)
ajaxart.suggestbox.closePopup();if(popup.Dlg)popup.Dlg.Close([],ajaxart.newContext(),true);return[];}
function aa_search(field,input,profile,context)
{input.ShowAtEnd=[];input.SearchChunkSize=500;input.FirstChunkToShow=5;input.ResultsShown=false;input.TotalShown=0;input.MaxItemsToShow=20;input.TimeBeforeStartingSearch=150;if(!input.CurrentSearchId)
input.CurrentSearchId=0;input.CurrentSearchId++;var search_id=input.CurrentSearchId;input.SearchId=search_id;input.Searching=true;var pattern={};if(jQuery(input).hasClass('empty_text_description'))input.value='';pattern.text=input.value;var pp=pattern.text.split(' ');pattern.p1=(pp.length>0&&' '+pp[0].toLowerCase());pattern.p2=(pp.length>1&&' '+pp[1].toLowerCase());pattern.p3=(pp.length>2&&' '+pp[2].toLowerCase());pattern.p4=(pp.length>3&&' '+pp[3].toLowerCase());pattern.words=pp.length;input.Pattern=pattern;jQuery(input).addClass('aa_loading');setTimeout(function(){aa_search_chunk(input,field,profile,context,search_id,pattern,0)},input.TimeBeforeStartingSearch);}
function aa_search_keydown(field,input,e,context)
{var keyCode=e.keyCode;if(keyCode==38||keyCode==40)
{if(ajaxart.dialog.openPopups.length>0)
ajaxart_stop_event_propogation(e);var cntr=input.Container;if(cntr)
cntr.SelectionKeydown(e);return false;}
if(keyCode==13)
{var cntr=input.Container;var selected=jQuery(cntr.Ctrl).find('.aa_selected_item')[0];if(!selected)return;input.OnSelect(selected.ItemData,context);if(ajaxart.dialog.openPopups.length>0)
ajaxart_stop_event_propogation(e);}}
function aa_buildSection(cntr,tr,field,item_data,properties_width,ctx)
{var newContext=aa_ctx(ctx,{_Field:[field],FieldTitle:[field.Title],_Item:item_data});var field_data=ajaxart_field_calc_field_data(field,item_data,newContext);var value_td=document.createElement("TD");value_td.colSpan=2;tr.appendChild(value_td);var li=document.createElement("li");li.className="aa_section";value_td.appendChild(li);var title_div=null,title_span;if(!field.HideTitle)
{var title_div=document.createElement('div');title_div.className="aa_title aa_section_title fld_"+field.Id+"_title";var title_span=document.createElement('span');title_span.className="aa_section_title_text";title_div.appendChild(title_span);if(field.Underline)title_div.className+=" aa_section_underline";if(field.SectionStyle)title_div.className+=" "+field.SectionStyle;li.appendChild(title_div);field.SectionImage=aa_init_image_object(field.SectionImage,item_data,ctx);var image=field.SectionImage?field.SectionImage.StaticUrl:'';if(image!=""){var text=document.createElement('span');jQuery(text).text(field.Title);jQuery(title_span).text();var img=document.createElement('img');img.setAttribute('src',image);img.setAttribute('unselectable','on');title_span.appendChild(img);title_span.appendChild(text);}else
jQuery(title_span).text(field.Title);}
var value_div=document.createElement('div');value_div.className="aa_section_ctrl";if(field.SectionStyle)value_div.className+=" section_body_"+field.SectionStyle;if(field.TitleBelowContent=="true")
jQuery(li).prepend(jQuery(value_div));else
li.appendChild(value_div);ajaxart_field_createCellControl(item_data,cntr,value_div,"control",field,field_data,newContext);var collapse=function(elem,auto){if(auto||ajaxart.isIE)
jQuery(elem).siblings().css('display','none');else
jQuery(elem).siblings().hide(300);jQuery(elem).addClass('collapsed');ajaxart_setUiPref(cntr.ID[0],elem.prefId,"false",ctx);var collapsed_text=ajaxart.totext_array(field.TitleWhenCollapsed(item_data,ctx));if(collapsed_text!="")
jQuery(elem).find(">.aa_section_title_text").text(collapsed_text);jQuery(elem).find('>.aa_expand_collapse_button').attr("src",field.ExpandIcon);}
if(ajaxart_object_boolean_value(field,'SectionExpandCollapse')&&title_div!=null){title_div.prefId="section_"+ajaxart.totext_array(field.Id);title_div.prefId=title_div.prefId.replace(" ","_");jQuery(title_div).prepend(jQuery('<IMG class="aa_expand_collapse_button" src="'+field.CollapseIcon+'" ></IMG>'))
jQuery(title_div).addClass('expandable').click(function(){if(jQuery(this).hasClass('collapsed')){jQuery(this).siblings().show();jQuery(this).removeClass('collapsed');ajaxart_setUiPref(cntr.ID[0],this.prefId,"true",ctx);jQuery(this).find(">.aa_section_title_text").text(field.Title);jQuery(this).find('>.aa_expand_collapse_button').attr("src",field.CollapseIcon);}
else
collapse(this);debugger;field.OnAfterExpandCollapse(item_data,aa_ctx(ctx,{_ElemsOfOperation:[this]}));});if(ajaxart_getUiPref(cntr.ID[0],title_div.prefId,ctx)=="false")
collapse(title_div,true);}}
function aa_enable_move_by_dragging(draggable_frame,draggable_area,onstartdrag)
{if(!draggable_area)return;jQuery(draggable_area).mousedown(function(e){e=e||event;if(!draggable_frame.Moving){draggable_frame.Moving={mouse_x:(e.clientX||e.pageX),mouse_y:(e.clientY||e.pageY),frame_x:draggable_frame.offsetLeft,frame_y:draggable_frame.offsetTop};onstartdrag();}
var mouse_move=function(e){e=e||event;draggable_frame.style.left=(e.clientX||e.pageX)-draggable_frame.Moving.mouse_x+draggable_frame.Moving.frame_x+"px";draggable_frame.style.top=(e.clientY||e.pageY)-draggable_frame.Moving.mouse_y+draggable_frame.Moving.frame_y+"px";}
var mouse_up=function(e){e=e||event;draggable_frame.Moving=null;window.onmousemove=null;window.onmouseup=null;document.onmouseup=null;document.onmousemove=null;}
if(window.captureEvents){window.onmousemove=mouse_move;window.onmouseup=mouse_up;}
else{document.onmouseup=mouse_up;document.onmousemove=mouse_move;}});}
function aa_attach_global_css(globalcss)
{if(!window.aa_global_styles)window.aa_global_styles={};if(globalcss=="")return'';if(aa_global_styles[globalcss])return aa_global_styles[globalcss].css_class;var obj={css_class:'jb'+(++aa_counter),globalcss:globalcss}
aa_global_styles[globalcss]=obj;if(ajaxart.isFireFox)obj.globalcss=obj.globalcss.replace(/-webkit-/g,'-moz-');obj.globalcss=obj.globalcss.replace(/#this/g,'.'+obj.css_class);obj.styleElem=jQuery("<style>"+obj.globalcss+"</style>")[0];document.getElementsByTagName("head")[0].appendChild(obj.styleElem);obj.styleElem.StyleObject=obj;return obj.css_class;}
function aa_api_object(jElem,props)
{if(props)var out=props;else{var out={};}
out.jElem=jElem;out.getInnerElement=function(classOrElement)
{if(typeof(classOrElement)=='string'){if(classOrElement=='')return this.jElem[0];if(classOrElement.indexOf('.')==0)
return aa_find_class(this.jElem,classOrElement.substring(1))[0];return null;}
return classOrElement;}
out.setInnerHTML=function(classOrElement,text)
{var inner=this.getInnerElement(classOrElement);if(inner)inner.innerHTML=text;}
out.setImageSource=function(classOrElement,imageObject)
{var inner=this.getInnerElement(classOrElement);if(inner&&imageObject)aa_set_image(inner,imageObject,false);}
out.setOnClick=function(classOrElement,callback_func,jbart_click_behavior)
{var inner=this.getInnerElement(classOrElement);if(!inner||!callback_func)return;if(!jbart_click_behavior)
inner.onclick=function(e){if(!window.aa_incapture)callback_func.call();return false;}
else{var mouseHandlers=function(btn){jQuery(btn).mousedown(function(){var jbtn=jQuery(btn);if(jbtn.attr('pressed_src')!="")
{jbtn.attr('src',jbtn.attr('pressed_src'));jbtn.addClass('pressed').addClass('pressing');}}).mouseout(function(){var jbtn=jQuery(btn);jbtn.removeClass('pressed');jbtn.attr('src',jbtn.attr('original_src'));}).mouseover(function(){var jbtn=jQuery(btn);if(jbtn.hasClass('pressing')){jbtn.addClass('pressed').removeClass('pressing');jbtn.attr('src',jbtn.attr('pressed_src'));}}).keydown(function(e){e=e||event;if(e.keyCode==13)
{ajaxart_stop_event_propogation(e);click(btn);return false;}}).mouseup(function(e){var jbtn=jQuery(btn);if(jbtn.hasClass('pressed')&&!window.aa_incapture)callback_func();});};mouseHandlers(inner);}}
return out;}
function aa_apply_style_js(obj,style,context)
{aa_style_context={jElem:obj.jElem}
if(!style.jsFunc&&style.Javascript){eval('style.jsFunc = '+style.Javascript);}
if(style.jsFunc)style.jsFunc(obj);}
function aa_runMethodAsync(object,methodFunc,data,context,callBack)
{if(object==null||methodFunc==null){callBack(data,context);return;}
var callBackObj={callBack:callBack,marked:false};var newContext=aa_ctx(context,{_AsyncCallback:callBackObj});try{methodFunc.call(object,data,newContext);}catch(e){ajaxart.log(e.message,"error");}
if(!callBackObj.marked&&callBack)
callBack(data,context);}
function aa_invoke_dialog_handlers(eventFuncs,dlg,context)
{if(eventFuncs)
for(var i=0;i<eventFuncs.length;i++)
eventFuncs[i](dlg,context);}
function aa_capture_for_popup(popup)
{if(window.captureEvents)
{popup.Orig_mousedown=window.onmousedown;window.onmousedown=ajaxart_popup_capture_click;}
else
{popup.Orig_mousedown=document.onmousedown;document.onmousedown=ajaxart_popup_capture_click;}}
function aa_element_attached(elem)
{if(!ajaxart.isattached(elem))return;var items=jQuery(elem).find('.aa_onattach').get();if(jQuery(elem).hasClass('aa_onattach'))items.push(elem);for(var i=0;i<items.length;i++){if(jQuery(items[i]).hasClass('aa_onattach_called'))continue;if(items[i].OnAttach)items[i].OnAttach.call(items[i]);jQuery(items[i]).addClass('aa_onattach_called');}}
function aa_remove(elem)
{if(!elem.parentNode)return;elem.parentNode.removeChild(elem);aa_element_detached(elem);}
function aa_top_dialog()
{var dialogs=jQuery('body').find('.aa_dlg');var maxCounter=0,topDialog=null;for(var i=0;i<dialogs.length;i++){if(dialogs[i].counter>maxCounter){topDialog=dialogs[i];maxCounter=topDialog.counter;}}
if(openDialogs.length==0)return topDialog;var topOldDialog=openDialogs[openDialogs.length-1];if(!topDialog||topDialog.noOfOpenDialogs<topOldDialog.noOfOpenDialogs)return topOldDialog;return topDialog;}
function aa_set_element_size(element,text,prefix)
{if(!prefix)prefix="";var arr=text.split(',');var width=arr[0];var height=arr.length>0?arr[1]:'';if(width!="")jQuery(element).css(prefix+"width",width);if(height!="")jQuery(element).css(prefix+"height",height);}
function aa_text_with_percent(data,script,field,params)
{var val=script.getAttribute(field);if(val)return val;return aa_text(data,script,field,params);}
function aa_fixTopDialogPosition()
{var topDialog=aa_top_dialog();if(topDialog&&topDialog.Dialog&&topDialog.Dialog.FixDialogPosition){topDialog.Dialog.FixDialogPosition();return;}
if(openDialogs.length==0)return[];var dlgContent=openDialogs[openDialogs.length-1].dialogContent;var screenWidth=window.innerWidth||(document.documentElement.clientWidth||document.body.clientWidth);var screenHeight=window.innerHeight||(document.documentElement.clientHeight||document.body.clientHeight);var scrollOffsetX=0;var scrollOffsetY=0;if(document.body&&(document.body.scrollLeft||document.body.scrollTop)){scrollOffsetY=document.body.scrollTop;scrollOffsetX=document.body.scrollLeft;}else if(document.documentElement&&(document.documentElement.scrollLeft||document.documentElement.scrollTop)){scrollOffsetY=document.documentElement.scrollTop;scrollOffsetX=document.documentElement.scrollLeft;}
if(jQuery(dlgContent).width()+ajaxart.ui.absoluteLeft(dlgContent)>screenWidth||jQuery(dlgContent).height()+ajaxart.ui.absoluteTop(dlgContent)>screenHeight)
{dlgContent.style.left=(screenWidth-jQuery(dlgContent).width())/2+scrollOffsetX+"px";dlgContent.style.top=(screenHeight-jQuery(dlgContent).height())/2+scrollOffsetY+"px";}
return[];}
function aa_close_dialog_old(closeType,ignoreAAEditor)
{if(openDialogs.length==0)return;jQuery('body').removeClass('body_with_open_dialog');var dlg=openDialogs[openDialogs.length-1];if(closeType=='OK'&&jQuery(dlg.dialogContent).find('.aa_noclose_message').length>0)return;if(ignoreAAEditor&&jQuery(dlg.dialogContent).hasClass('aaeditor'))return["true"];ajaxart_dialog_close_all_popups();ajaxart.dialog.closeDialog(dlg);if(closeType=='OK')
ajaxart_runevent(dlg.dialogContent,'DialogContext','OnOK');else if(closeType=='Cancel')
ajaxart_runevent(dlg.dialogContent,'DialogContext','OnCancel');else if(closeType=='Delete')
ajaxart_runevent(dlg.dialogContent,'DialogContext','OnDelete');}
function aa_run_js_code(code,data,context,elem)
{var func=aa_get_func(code);if(!elem)
if(context.vars._ElemsOfOperation&&context.vars._ElemsOfOperation.length)
elem=context.vars._ElemsOfOperation[0];var data_item=data;if(data.length==1)
data_item=data[0];if(func)
return func(data_item,elem,context);return null;}
function aa_ifThenElse(profile,data,context)
{if(aa_bool(data,profile,'If',context))
return ajaxart.run(data,profile,'Then',context);else
return ajaxart.run(data,profile,'Else',context);}
function aa_switch(profile,data,context)
{var value=aa_text(data,profile,"Value",context);var cases=ajaxart.subprofiles(profile,'Case');for(var i=0;i<cases.length;i++){var pass=(value!="")&&(value==aa_text(data,cases[i],'If',context));if(!pass)
pass=aa_bool(data,cases[i],'IfCondition',context);if(pass)
return ajaxart.run(data,cases[i],'Then',context);}
return ajaxart.run(data,profile,'Default',context);}
function ajaxart_multilang_run(data,script,field,context)
{var fieldscript=ajaxart.fieldscript(script,field,true);if(fieldscript==null)return[""];var result=null;if(fieldscript.nodeType==2){if(fieldscript.nodeValue.indexOf('%')!=-1){result=ajaxart.dynamicText(data,ajaxart_multilang_text(fieldscript.nodeValue,context),context);if(ajaxart.xtmls_to_trace.length>0){if(field==""){field=script.nodeName;script=aa_xpath(script,'..')[0];}
if(script.getAttribute("Trace")==field)ajaxart.trace(script,data,result,context,field);aa_try_probe_test_attribute(script,field,data,result,context,data);}}}
if(result==null)
result=ajaxart.run(data,script,field,context);if(result.length>0)result=[ajaxart_multilang_text(ajaxart.totext_array(result),context)];return result;}
function ajaxart_setUiPref(prefix,property,value,context){if(context.vars._UIPref==null)return;var newContext=aa_ctx(context,{Prefix:[prefix],Property:[property],Value:[value]});ajaxart_runMethod([],context.vars._UIPref[0],'SetProperty',newContext);}
function ajaxart_field_getFields(cntr,mode,item_data)
{if(typeof(item_data)=="undefined")item_data=[];var fields=cntr.Fields;var out=[];var isNew=cntr.IsNewItem;var isReadOnly=(cntr.Items[0].ReadOnly!=null&&ajaxart.tobool_array(cntr.Items[0].ReadOnly));var isEdit=!(isNew||isReadOnly);for(var i=0;i<fields.length;i++){var field=fields[i];if(isNew&&field.HiddenForNew)continue;if(isReadOnly&&field.HiddenForReadOnly)continue;if(isEdit&&field.HiddenForEdit)continue;if(mode=="table"&&field.HiddenForTable)continue;if(mode=="property sheet"&&field.HiddenForProperties)continue;if(mode!="property sheet"&&field.Hidden&&aa_tobool(field.Hidden(item_data,cntr.Context)))continue;out.push(fields[i]);}
return out;}
function ajaxart_field_calc_field_data(field,item_data,context)
{if(field.Multiple&&field.MultipleItems!=null)
return item_data;if(field.FieldData!=null)
{var results=ajaxart_runMethod(item_data,field,'FieldData',context);if(results.length<2)
return results;else
return[results[0]];}
else
return item_data;}
function ajaxart_field_createCellControl(item,cntr,td,cell_presentation,field,field_data,context)
{var newContext=aa_ctx(context,{Item:item,FieldData:field_data});jQuery(td).addClass('aa_cell_element');if(cell_presentation==null)cell_presentation="control";if(field.CellPresentation!=null)
cell_presentation=field.CellPresentation;if(field.Width!=null)
jQuery(td).css("width",field.Width);td.CellPresentation=cell_presentation;td.Field=field;td.FieldData=field_data;td.ItemData=item;if(field.isOperation)
{var newContext=aa_ctx(newContext,{_ItemsOfOperation:item});var opCell=ajaxart.runComponent('operation.OperationCell',[field],newContext);if(opCell.length>0)
td.appendChild(opCell[0]);return;}
if(field.CalculatedControl)
{jQuery(td).addClass("aa_text fld_"+field.Id);field.CalculatedControl(td,field,field_data,newContext);return;}
if(field.IsCalculated)
{var calculated_val=field.CalcFormula(item,newContext);var assigned=ajaxart.writevalue(field_data,calculated_val);if(!assigned)
field_data=calculated_val;}
if(cell_presentation=="text")
{jQuery(td).addClass("aa_text fld_"+field.Id);td.innerHTML=ajaxart_field_text(field,field_data,item,newContext);}
else if(cell_presentation=="expandable text")
ajaxart_field_expandableText(td,cntr,field,field_data,item,newContext);else
{td.ReadOnly=ajaxart_field_is_readOnly(cntr,field,context);var new_control=ajaxart_field_createControl(cntr,field,field_data,newContext)[0];if(new_control!=null)
{td.appendChild(new_control);if(field.Validations)jQuery(new_control).addClass('aa_hasvalidations');}
else
{jQuery(td).addClass("aa_text fld_"+field.Id);td.innerHTML=ajaxart_field_text(field,field_data,item,newContext);}}
if(field.ModifyControl)
for(var i=0;i<field.ModifyControl.length;i++)
field.ModifyControl[i](td,field_data,cell_presentation,newContext,item);if(field.ModifyCell)
for(var i=0;i<field.ModifyCell.length;i++)
field.ModifyCell[i](td,field_data,cell_presentation,newContext,item);return["true"];}
function ajaxart_topCntr(item){var parents=[];if(item.hasClass('aa_container'))
parents=item.get();var parents=parents.concat(item.parents().filter(function()
{return jQuery(this).hasClass('aa_container')||jQuery(this).hasClass('DetailsControl');}).get());if(parents.length==0)return null;if(jQuery(parents[0]).hasClass('DetailsControl'))return parents[0].Cntr;var top_cntr=null;for(var i=0;i<parents.length;i++)
{var parent=parents[i];if(jQuery(parent).hasClass('DetailsControl'))break;if(parent.Cntr.Select)
top_cntr=parent;if(!jQuery(parent).hasClass('aa_inherit_selection'))
break;}
if(top_cntr)
return top_cntr.Cntr;return null;}
function ajaxart_find_aa_list(cntr){return ajaxart_find_list_under_element(cntr.Ctrl);}
function ajaxart_addScriptParam_js(structItem,structField,jsFunc,context)
{structItem[structField]={context:context,compiled:jsFunc};}
function ajaxart_disableSelection(target){if(typeof target.onselectstart!="undefined")
{target.Origonselectstart=target.onselectstart;target.onselectstart=function(){return false}}
else if(typeof target.style.MozUserSelect!="undefined")
{target.OrigMozUserSelect=target.style.MozUserSelect;target.style.MozUserSelect="none"}
else
{target.Origonmousedown=target.onmousedown;}
target.OrigCursor=target.style.cursor;target.style.cursor="default"}
function ajaxart_itemlist_getSelectedItems(cntr)
{var selected=jQuery(cntr.Ctrl).find(".aa_selected_item").filter(aa_visible);var out=[];for(var i=0;i<selected.length;i++)
ajaxart.concat(out,selected[i].ItemData);return out;}
function ajaxart_container_elems(cntr)
{var elems=[];var add_elems_in_cntr=function(node)
{var jnode=jQuery(node);if(node.hidden==true)return;if(jnode.hasClass('aa_item'))
elems.push(node);if(jnode.hasClass('aa_container'))return;jQuery(node).children().each(function(){add_elems_in_cntr(this)});}
var list=ajaxart_find_aa_list(cntr);if(list!=null)
add_elems_in_cntr(list);return elems;}
function ajaxart_uiaspects_select(new_selected,selected,method,ctx,focus)
{var top_cntr=ajaxart_topCntr(new_selected);if(top_cntr!=null)
top_cntr.Select(new_selected,selected,method,ctx,focus);}
function ajaxart_runMethod(data,object,method,context)
{if(object==null||method=="")return[];var scriptParam=object[method];if(scriptParam==null)return[];if(typeof(scriptParam)=="function")return scriptParam.call(object,data,context);if(scriptParam.compiled=="same")return data;var newContext={params:scriptParam.context.params,vars:context.vars,componentContext:scriptParam.context.componentContext}
newContext._This=object;if(scriptParam.compiled!=null)
return scriptParam.compiled(data,newContext);else
return ajaxart.run(data,scriptParam.script,"",newContext);return[];}
function ajaxart_restoreSelection(target)
{setTimeout(function()
{if(typeof target.onselectstart!="undefined")
target.onselectstart=target.Origonselectstart;else if(typeof target.style.MozUserSelect!="undefined")
target.style.MozUserSelect=target.OrigMozUserSelect;else
target.onmousedown=target.Origonmousedown;target.style.cursor=target.OrigCursor;},1000);}
function ajaxart_multilang_text(text,context)
{if(context.vars.Language&&context.vars.Language.length>0&&text!="")
{if(ajaxart_mlTable==null)ajaxart_fill_mlTable();var lang=aa_totext(context.vars.Language);if(ajaxart_mlTable[lang]&&ajaxart_mlTable[lang][text])
return ajaxart_mlTable[lang][text];var text_lc=text.toLowerCase();if(ajaxart_mlTable[lang]&&ajaxart_mlTable[lang][text_lc])
return ajaxart_mlTable[lang][text_lc];}
return text.split('__')[0];}
function ajaxart_properties_and_sections(cntr,item_aggregator,item_data,profile,ctx,fields,space,full_width,properties_width,header,footer)
{if(typeof(properties_width)=="undefined")properties_width="80";properties_width=parseInt(properties_width.split('px')[0]);var table=jQuery('<table class="propertysheet" cellpadding="0" cellspacing="0"><tbody class="propertysheet_tbody"></tbody></table>')[0];if(full_width)jQuery(table).width("100%");var tbody=table.firstChild;for(var j=0;j<fields.length;j++)
if(fields[j].PropertiesWidth)properties_width=Math.max(properties_width,parseInt(fields[j].PropertiesWidth));if(header&&header!=""){tbody.appendChild(jQuery('<tr class="aa_propertysheet_tr_space" style="height:'+header+'"/>')[0]);}
for(var j=0;j<fields.length;j++){var field=fields[j];if(ajaxart_object_boolean_value(field,'IsOperation'))continue;var tr=document.createElement("TR");tbody.appendChild(tr);tr.className="field_row value field_"+field.Id+"_row";var hideTitle=field.HideTitle;if(!hideTitle&&field.RecalcTitle)field.RecalcTitle(item_data,ctx);if(field.AsSection)
aa_buildSection(cntr,tr,field,item_data,properties_width,ctx);else
aa_buildProperty(cntr,tr,field,item_data,properties_width,ctx);if(space==true||space=="true")space="5px";if(space==false||space=="false")space="";if(j!=fields.length-1&&space!="")
{var trSpace=document.createElement('tr');trSpace.className="aa_propertysheet_tr_space";trSpace.style.height=space;tbody.appendChild(trSpace);}}
if(footer&&footer!=""){tbody.appendChild(jQuery('<tr class="aa_propertysheet_tr_space" style="height:'+footer+'"/>')[0]);}
table.ItemData=item_data;if(!cntr.ReadOnly)aa_handle_onload_validations(table);return table;}
function ajaxart_run_commas(data,script,field,context)
{var text=aa_text(data,script,field,context);if(text=="")return[];return text.split(',');}
function ajaxart_getUiPref(prefix,property,context){if(context.vars._UIPref==null)return null;var newContext=aa_ctx(context,{Prefix:[prefix],Property:[property]});var result=ajaxart.totext_array(ajaxart_runMethod([],context.vars._UIPref[0],'GetProperty',newContext));if(result=="")return null;return result;}
function ajaxart_field_fix_th(cntr,th,field,ctx)
{var width=ajaxart_getUiPref(cntr.ID[0],field.Id+'_ColumnWidth',ctx)||ajaxart.totext_array(field.Width);if(width!=null)
jQuery(th).width(width);}
function ajaxart_field_text(field,field_data,item,context)
{if(field.Text)
var result=ajaxart.totext_array(ajaxart_runMethod(field_data,field,'Text',context));else if(item[0].__item)
var result=item[0][field.Id];else
var result=ajaxart.totext_array(field_data);if(field.Highlight)
result=ajaxart_field_highlight_text(result,field.Highlight);return result;}
function ajaxart_find_list_under_element(elem)
{if(jQuery(elem).hasClass('aa_list'))return elem;var lists=jQuery(elem).find('.aa_list');if(lists.length==1)return lists[0];var top_ctrl=jQuery(elem).hasClass('aa_container')?elem:jQuery(elem).parents('.aa_container')[0];for(var i=0;i<lists.length;i++)
if(jQuery(lists[i]).parents('.aa_container')[0]==top_ctrl)
return lists[i];return null;}
function ajaxart_capture_onclick(f)
{if(window.captureEvents)
window.onclick=f;else
document.onclick=f;}
function ajaxart_stop_event_propogation(e)
{if(!e)return;if(e.stopPropagation)
e.stopPropagation();if(e.preventDefault)
e.preventDefault();e.cancelBubble=true;return false;}
function ajaxart_add_foucs_place(li)
{jQuery(li).addClass('aa_focus_place');li.setAttribute("tabindex","1");}
function ajaxart_addMethod(object,method,profile,field,context)
{var compiled=ajaxart.compile(profile,field,context);if(compiled=="same"){object[method]=function(data1){return data1;};return;}
var init=function(compiled){object[method]=function(data1,ctx){var newContext=ajaxart_mergeContext(context,ctx);newContext._This=object;if(compiled)
return compiled(data1,newContext);else
return ajaxart.run(data1,profile,field,newContext);}}
init(compiled);}
function ajaxart_mergeContext(context,contextVars)
{var newContext={params:context.params,vars:contextVars.vars,componentContext:context.componentContext,_This:contextVars._This};return newContext;}
function ajaxart_fieldaspect_getField(context){var field=context.vars['_Field'];if(field==null||field.length==0)return null;return field[0];}
function ajaxart_runcompiled_text(compiledFunc,data,profile,field,context)
{if(compiledFunc=='same')return ajaxart.totext_array(data);if(compiledFunc==null)
return aa_text(data,profile,field,context);else
return ajaxart.totext_array(compiledFunc(data,context));}
function ajaxart_addControlMethod(object,method,data,profile,field,context)
{var getControl=function(data1,context1){var out=ajaxart.run(data1,profile,field,context1);if(out.length>0)
out[0].XtmlSource=object.XtmlSource;return out;};ajaxart_addMethod_js(object,method,getControl,context);}
function ajaxart_field_is_readOnly(cntr,field,context)
{if(field.Writable)return false;if(field.ReadOnly==true)return true;if(ajaxart_object_run_boolean_method(field,'ReadOnly',[],context))return true;if(cntr==null)return false;if(cntr.Items==null)return true;if(cntr.Items.length==0)debugger;if(cntr.Items[0].ReadOnly==true)return true;if(cntr.ReadOnly)return true;return(cntr.Items[0].ReadOnly!=null&&ajaxart.tobool_array(cntr.Items[0].ReadOnly));}
function ajaxart_runcompiled_bool(compiledFunc,data,profile,field,context,empty_value_is_true)
{var text_val;if(compiledFunc=='same')text_val=ajaxart.totext_array(data);if(compiledFunc==null)
return aa_bool(data,profile,field,context,empty_value_is_true);else
text_val=ajaxart.totext_array(compiledFunc(data,context));if(text_val=="")return(empty_value_is_true)?true:false;if(text_val=="false")return false;if(text_val=="true")return true;if(!isNaN(text_val))return false;var boolean_result=false;text_to_eval="if ("+text_val+") boolean_result=true;";try{eval(text_to_eval);}
catch(e){ajaxart.log("Failed to evaluate boolean expression: "+text_val+","+e.message
+"\n script :"+aa_xtml_path(script,"id",true),"warning");}
return boolean_result;}
function ajaxart_field_createSimpleInput(data,context,readonly,input_type)
{var field=context.vars._Field[0];var text=ajaxart_field_option_text(field,data,context);if(readonly){if(field.Text)text=aa_totext(field.Text(data,context));return jQuery("<span/>").text(text).addClass('readonly')[0];}
var input=document.createElement(field.MultiLineText?'textarea':'input');if(!input_type)input_type='text';input.setAttribute('type',input_type);if(field.MultiLineText)
{input.setAttribute('wrap',field.NoWrap?'off':'hard');input.setAttribute('rows',field.Rows);input.className='textcontrol_area';}
ajaxart.databind([input],data,context,field.XtmlSource);input.onfocus=function(e){aa_validation_removeNoCloseMessages();var field=context.vars._Field[0];if(!field.DoNotSelectAllOnFocus)
{var selectAllText=function(input){setTimeout(function(){if(input.setSelectionRange){try{input.setSelectionRange(0,input.value.length);}catch(e){}}
else if(input.createTextRange)
{try{var range=input.createTextRange();range.moveStart('character',0);range.moveEnd('character',input.value.length);range.select();}catch(e){}}})};if(ajaxart.controlOfFocus!=this)
selectAllText(this);}
ajaxart.controlOfFocus=this;var field=context.vars._Field[0];aa_invoke_field_handlers(field.OnFocus,this,e,field,data);return true;}
input.onblur=function(e){if(this.IgnoreBlur)
{this.IgnoreBlur=false;return false;}
var field=context.vars._Field[0];ajaxart_field_RefreshDependentFields(field,this,context);aa_invoke_field_handlers(field.OnBlur,this,e,field,data);if(field.Validations)aa_handleValidations(field,this,data,context,"on blur");return true;}
input.onkeydown=function(e){var field=context.vars._Field[0];e=e||event;if(field.KeyPressValidator&&e.keyCode!=8)
{var ch=String.fromCharCode(e.keyCode);if(!field.KeyPressValidator.test(ch))return aa_stop_prop(e);}
var had_popups=ajaxart.dialog.openPopups.length>0;aa_invoke_field_handlers(field.OnKeydown,this,e,field,data);if(e.keyCode==13&&had_popups)
return aa_stop_prop(e);if(aa_intest&&e.CharByChar)
input.value+=String.fromCharCode(e.keyCode);return true;}
input.onmousedown=function(e){var field=context.vars._Field[0];e=e||event;this.DelayedAction="";aa_invoke_field_handlers(field.OnMouseDown,this,e,field,data);return true;}
input.onmouseup=function(e){var field=context.vars._Field[0];e=e||event;aa_invoke_field_handlers(field.OnMouseUp,this,e,field,data);return true;}
input.onkeyup=function(e){var input=this;var field=context.vars._Field[0];e=e||event;var keyCode=e.keyCode;if(keyCode==undefined&&!aa_intest&&!aa_inuiaction)return;aa_invoke_field_handlers(field.OnKeyup,this,e,field,data,{isObject:true,KeyCode:[''+keyCode],CtrlKey:aa_frombool(e.ctrlKey)});var codes=[9,13,16,17,18,27,63277,63276];for(var i=0;i<codes.length;i++)
if(keyCode==codes[i])return true;if(field.KeyPressValidator&&keyCode!=8)
{var ch=String.fromCharCode(keyCode);if(!field.KeyPressValidator.test(ch))return aa_stop_prop(e);}
if(e.keyCode)
input.KeyUp=true;input.updateValue(e);input.KeyUp=null;return true;}
input.Blur=function()
{jQuery(this).blur();}
input.Refresh=function()
{var input=this;if(input.RefreshDescriptionForEmptyText)
input.RefreshDescriptionForEmptyText();}
input.getValue=function(){return this.value;}
input.updateValue=function(e)
{var field=context.vars._Field[0];if(!field.ManualWriteValue)
{var value=this.getValue();ajaxart.writevalue(data,value);if(field.RefreshOn!='exit field')
aa_invoke_field_handlers(field.OnUpdate,this,e,field,data);}
if(field.Validations)aa_handleValidations(field,this,data,context,"on change");}
input.value=text;input.setAttribute('value',text);jQuery(input).addClass('aa_simple_cell aatextbox');if(!readonly&&field.Validations)
jQuery(input).addClass('aa_withvalidations');return input;}
function ajaxart_addControlMethod_js(object,method,jsFunc,context)
{var getControl=function(data1,context1){var out=jsFunc(data1,context1);if(out.length>0)
out[0].XtmlSource=object.XtmlSource;return out;};ajaxart_addMethod_js(object,method,getControl,context);}
function ajaxart_field_fix_title(field,path,context)
{if(field.Title==null||field.Title.length==0)
{var title=path.split('/').pop().split('@').pop();title=title.substr(0,1).toUpperCase()+title.substr(1,title.length);title=aa_text_capitalizeToSeperateWords(title);field.Title=ajaxart_multilang_text(title,context);}}
function ajaxart_addMethod_js(object,method,jsFunc,context)
{object[method]={context:context,compiled:jsFunc,objectForMethod:[object]};}
function ajaxart_dialog_close_all_popups()
{aa_closePopup(ajaxart.dialog.openPopups[0]);}
function ajaxart_screen_size()
{var screenWidth=window.innerWidth||(document.documentElement.clientWidth||document.body.clientWidth);var screenHeight=window.innerHeight||(document.documentElement.clientHeight||document.body.clientHeight);return{width:screenWidth,height:screenHeight};}
function ajaxart_xml_onchange(xml,func,context)
{var attachment={disable:false,modified:false,compiled:func,context:context,autosavedelay:0,mode:'manual save'};for(var i=0;i<ajaxart.xmlsToMonitor.length;i++)
{if(ajaxart.xmlsToMonitor[i].xml==xml)
{ajaxart.xmlsToMonitor[i].ajaxartOnChange=attachment;ajaxart.xmlsToMonitor[i].modifyInfo=attachment;return["true"];}}
ajaxart.xmlsToMonitor.push({xml:xml,modifyInfo:attachment});}
function ajaxart_object_byid(list,id)
{if(list==null||typeof(list)=="undefined")return null;for(var i=0;i<list.length;i++){var item=list[i];if(item.Id!=null){if(item.Id==id)return item;}else if(item.ID!=null&&item.ID.length>0&&item.ID[0]==id)return item;}
return null;}
function ajaxart_RunAsync(data,fieldscript,context,callBack,object_for_method)
{if(fieldscript==null){callBack(data,context,false);return;}
var callBackObj={callBack:callBack,marked:false,success:true};var newContext=aa_ctx(context,{_AsyncCallback:callBackObj});if(ajaxart.debugmode){if(typeof(fieldscript)=="function"){if(object_for_method)fieldscript.call(object_for_method,data,newContext);else fieldscript(data,newContext);}
else if(fieldscript.compiled!=null)
fieldscript.compiled(data,newContext);else
ajaxart.run(data,fieldscript,'',newContext);}else{try{if(typeof(fieldscript)=="function"){if(object_for_method)fieldscript.call(object_for_method,data,newContext);else fieldscript(data,newContext);}
else if(fieldscript.compiled!=null)
fieldscript.compiled(data,newContext);else
ajaxart.run(data,fieldscript,'',newContext);}catch(e){ajaxart.log(e.message,"error");}}
if(!callBackObj.marked&&callBack)
callBack(data,context,true);}
ajaxart.run=function(data,script,field,context,method,booleanExpression)
{return ajaxart.trycatch(function()
{var origData=data;if(ajaxart.debugmode&&!ajaxart.isArray(data))
{ajaxart.log("run called with input not an array","error");return[];}
if(script==null){return[];}
if(script.nodeType!=null&&script.nodeType==2){field=script.nodeName;script=ajaxart.xml.xpath(script,"..")[0];}
if(field!=""&&aa_hasAttribute(script,field)){if(script.getAttribute("Break")==field)
debugger;var out=ajaxart.dynamicText(data,script.getAttribute(field),context,null,booleanExpression);if(script.getAttribute("Trace")==field)ajaxart.trace(script,data,out,context,field);aa_try_probe_test_attribute(script,field,data,out,context,origData);return out;}
var field_script=ajaxart.fieldscript(script,field,false);if(field_script==null)return[];var childElems=[];var node=field_script.firstChild;while(node!=null)
{if(node.nodeType==1)childElems.push(node);node=node.nextSibling;}
ajaxart.stack_trace.push(field_script);var classDecorator="";var cssStyleDecorator="";var atts=field_script.attributes;for(var i=0;i<atts.length;i++)
{var aname=atts.item(i).nodeName;if(aname=="t"){}
else if(aname=="Condition"&&!aa_bool(data,atts.item(i),"",context))
{ajaxart.stack_trace.pop();return[];}
else if(aname=="Data")
{data=[aa_first(data,atts.item(i),'',context)];if(data[0]==null)data=[];}
else if(aname=="RunOn")
context=ajaxart.calcParamsForRunOn(context,ajaxart.run(data,atts.item(i),"",context));else if(aname=="Class")
classDecorator=aa_text(data,atts.item(i),"",context);else if(aname=="CssStyle")
cssStyleDecorator=aa_text(data,atts.item(i),"",context);else if(aname=="NameForTrace")
ajaxart.log(atts.item(i),"actions trace");}
var firstVar=true;for(var childElem in childElems)
{var item=childElems[childElem];var tag=item.tagName;if(tag=="Condition"&&!aa_bool(data,item,"",context))
{ajaxart.stack_trace.pop();return[];}
else if(tag=="Data")
{data=[aa_first(data,item,"",context)];if(data[0]==null)data=[];}
else if(tag=="RunOn")
context=ajaxart.calcParamsForRunOn(context,ajaxart.run(data,item,"",context));else if(tag=="Class")
classDecorator=aa_text(data,item,"",context);else if(tag=="CssStyle")
cssStyleDecorator=aa_text(data,item,"",context);else if(tag=="Var")
{if(firstVar){context=ajaxart.clone_context(context);firstVar=false;}
var varname=item.getAttribute("name");if(varname=="ControlElement"){var elementPointer={};ajaxart.setVariable(context,varname,elementPointer);}
var var_value=null;if(!aa_hasAttribute(item,"t")&&!aa_hasAttribute(item,"value"))
var_value=data;else
var_value=ajaxart.run(data,item,"",context);if(varname=="ControlElement"){elementPointer.controlElement=var_value;}
ajaxart.setVariable(context,varname,var_value);}}
var component=field_script.getAttribute("t")||"";if(component=="")
{if(aa_hasAttribute(field_script,"value")){if(field_script.getAttribute("Break")=="true")
debugger;var out=ajaxart.dynamicText(data,field_script.getAttribute("value"),context,null,booleanExpression);if(aa_hasAttribute(field_script,"Trace"))
ajaxart.trace(script,data,out,context,field,field_script.getAttribute("Trace"));for(i in ajaxart.xtmls_to_trace)
if(field_script==ajaxart.xtmls_to_trace[i].xtml)
ajaxart.fill_trace_result(ajaxart.xtmls_to_trace[i].results,data,out,context,origData);ajaxart.stack_trace.pop();return out;}
ajaxart.stack_trace.pop();return[];}
var middlePos=component.indexOf('.');var ns=component.substring(0,middlePos);var compName=component.substr(middlePos+1);if(typeof(ajaxart.components[ns])=="undefined")
{if(ns!=""&&component!="")
ajaxart.log("plugin "+ns+" is not defined. trying to use component "+component,"error");ajaxart.stack_trace.pop();return[];}
var global=ajaxart.components[ns][compName];if(typeof(global)=="undefined"){ajaxart.log("cannot find component "+component,"error");ajaxart.stack_trace.pop();return[];}
if(global.getAttribute("execution")=="native")
{if(method!=undefined&&method.length>0)
compName+="_"+method;if(ajaxart.gcs[ns]==undefined){ajaxart.log("cannot find native execution for "+component,"error");ajaxart.stack_trace.pop();return[];}
var func=ajaxart.gcs[ns][compName];if(func==undefined){ajaxart.log("cannot find native execution for "+component,"error");ajaxart.stack_trace.pop();return[];}
if(field_script.getAttribute("Break")=="true")
debugger;if(ajaxart.profiling_of_globals==null)
out=func(field_script,data,context);else{var before=new Date().getTime();out=func(field_script,data,context);ajaxart.write_profiling_at_end(before,component);}}
else
{var global_xtml=ajaxart.componentsXtmlCache[component];if(global_xtml==null){global_xtml=ajaxart.childElem(global,'xtml');ajaxart.componentsXtmlCache[component]=global_xtml;}
if(global_xtml==null)
ajaxart.log("missing implementation for component "+component,"error");var paramDefinitions=ajaxart.childElems(global,"Param");var contextForXtml=ajaxart.newContext();contextForXtml.vars=context.vars;contextForXtml.componentContext=context;contextForXtml.counter=(context.counter!=null)?context.counter+1:1;if(contextForXtml.counter>100){ajaxart.log("endless loop");return[];}
for(var i=0;i<paramDefinitions.length;i++)
{var paramDef=paramDefinitions[i];var param_name=paramDef.getAttribute("name");var param_value;if(aa_hasAttribute(paramDef,"type")&&(''+paramDef.getAttribute("type")).indexOf("[]")>0)
{var param_value=[];var subprofiles=ajaxart.childElems(field_script,param_name);if(paramDef.getAttribute("script")!="true"){for(var j=0;j<subprofiles.length;j++)
ajaxart.concat(param_value,ajaxart.run(data,subprofiles[j],"",context));}else{param_value={isArrayParamScript:true,script:field_script,field:param_name,context:context};}}
else if(paramDef.getAttribute("script")!="true")
param_value=ajaxart.run(data,field_script,param_name,context);else{param_value={isParamScript:true};param_value.script=ajaxart.fieldscript(field_script,param_name,true,contextForXtml);param_value.compiled=ajaxart.compile(param_value.script,'',context,paramDef.getAttribute("paramVars"));}
ajaxart.setParameterVariable(contextForXtml,param_name,param_value);}
if(global.getAttribute("useCallerScript")=="true")
ajaxart.setVariable(contextForXtml,"_CallerScript",[field_script]);if(ajaxart.profiling_of_globals==null)
out=ajaxart.run(data,global_xtml,"",contextForXtml,method);else{var before=new Date().getTime();out=ajaxart.run(data,global_xtml,"",contextForXtml,method);ajaxart.write_profiling_at_end(before,component);}}
if(out==null)out=[];if(classDecorator!=""){if(ajaxart.ishtml(out))
for(var item in out)
jQuery(out[item]).addClass(classDecorator);}
if(cssStyleDecorator!=""){for(var item in out)
if(ajaxart.ishtml(out[item]))
aa_setCssText(out[item],cssStyleDecorator);}
if(global.getAttribute('databind')=="true"){ajaxart.databind(out,data,context,field_script,origData);}
try{if(field_script.nodeType==1&&out.length>0&&out[0].isObject==true)
if(global.getAttribute('dtsupport')!="false")
out[0].XtmlSource=[{isObject:true,script:field_script,input:data,context:context}];}catch(e){}
if(aa_hasAttribute(field_script,"Trace"))
ajaxart.trace(field_script,data,out,context,null,field_script.getAttribute("Trace"));if(aa_hasAttribute(field_script,"Name"))
{var id=(''+field_script.getAttribute("Name")).replace(/ /g,"_");for(var item in out)
if(ajaxart.ishtml(out[item]))
out[item].setAttribute("id",id);}
for(i in ajaxart.xtmls_to_trace)
if(field_script==ajaxart.xtmls_to_trace[i].xtml)
ajaxart.fill_trace_result(ajaxart.xtmls_to_trace[i].results,data,out,context,origData);ajaxart.stack_trace.pop();return out;},function(e){ajaxart.log(e.message,"error");return[];});}
ajaxart.make_array=function(input_array,func,workWithEmptyInput)
{var result=[];ajaxart.each(input_array,function(item){var myitem=func([item]);if(ajaxart.isArray(myitem))
ajaxart.concat(result,myitem);else if(myitem!=null)
result.push(myitem);});if(input_array.length==0&&(typeof workWithEmptyInput=="undefined"||workWithEmptyInput==true))
{var myitem=func([]);if(myitem!=null)
result.push(myitem);}
return result;}
ajaxart.isxml=function(xml)
{if(ajaxart.isArray(xml))return ajaxart.isxml_array(xml);return ajaxart.isxml_item(xml);}
ajaxart.xml2text=function(xml)
{if(xml==null)return'';if(!ajaxart.ishtml(xml))
return ajaxart.xml.prettyPrint(xml,"",true);if(ajaxart.isArray(xml))
{if(xml.length>0)return ajaxart.xml2text(xml[0]);return'';}
return aa_xml2htmltext(xml);}
ajaxart.totext=function(item)
{if(ajaxart.isArray(item))return ajaxart.totext_array(item);return ajaxart.totext_item(item);}
ajaxart.runsubprofiles=function(data,profile,field,context,trycatch_oneachitem)
{var subProfs=ajaxart.childElems(profile,field);var out=[];for(var i=0;i<subProfs.length;i++){if(ajaxart.debugmode)
ajaxart.concat(out,ajaxart.run(data,subProfs[i],'',context));else{try{ajaxart.concat(out,ajaxart.run(data,subProfs[i],'',context));}
catch(e){if(trycatch_oneachitem!=true)throw(e);ajaxart.log(e.message);}}}
return out;}
ajaxart.subprofiles=function(profile,field)
{return ajaxart.childElems(profile,field);}
ajaxart.isArray=function(obj)
{if(obj==null)return false;if(obj.nodeType!=null)return false;if(typeof(obj)=="string")return false;if(obj.constructor==null)return false;if(obj.constructor.toString().indexOf("Array")==-1)
return false;else
return true;}
ajaxart.compile=function(script,field,context,paramVars,isReadOnly){if(ajaxart.xtmls_to_trace.length>0||script==null)return null;var fieldscript=ajaxart.fieldscript(script,field,true);if(fieldscript==null)return function(context){return[];};var value=null;if(fieldscript.nodeType==1){var extraAttrs=0;if(aa_hasAttribute(fieldscript,'name'))extraAttrs=1;if(aa_hasAttribute(fieldscript,'paramVars'))extraAttrs=1;if(fieldscript.attributes.length==2+extraAttrs&&fieldscript.getAttribute("t")=="xtml.UseParam"&&fieldscript.firstChild==null){var param=fieldscript.getAttribute("Param");if(aa_hasAttribute(fieldscript,'Param')){var paramScript=context.params[param];if(ajaxart.isArray(paramScript))return null;if(paramScript==null||paramScript.script==null)return null;if(paramScript.compiled=="same")return"same";var myFunc=function(paramScript){return function(data,context1){var newContext={};newContext.vars=context1.vars;newContext.params=context.componentContext.params;newContext.componentContext=context.componentContext.componentContext;if(paramScript.compiled==null)
return ajaxart.run(data,paramScript.script,"",newContext);else
return paramScript.compiled(data,newContext);}};return myFunc(paramScript);};return null;}
if(fieldscript.attributes.length<=3+extraAttrs&&fieldscript.getAttribute("t")=="xtml.RunXtml"&&fieldscript.firstChild==null){return aa_compile(fieldscript,context);}
if(fieldscript.getAttribute("t")=="uiaspect.JavaScriptControl"){var func_name=aa_text([],fieldscript,'FunctionName',context);if(func_name!=""&&window[func_name]==null){ajaxart.log("function "+func_name+" does not exist","error");return[];}
return function(data,context){var control=jQuery(aa_text(data,fieldscript,'Html',context));if(window[func_name]==null)return control;else return[window[func_name](data,context,control)]};}
if(fieldscript.attributes.length>1+extraAttrs||fieldscript.firstChild!=null)return null;if(fieldscript.getAttribute("t")=="data.Same")return"same";value=aa_hasAttribute(fieldscript,'value')?fieldscript.getAttribute("value"):null;}
else if(fieldscript.nodeType==2)value=fieldscript.nodeValue;if(value==null)return null;if(value=="%%")return"same";if(value.indexOf('%')==-1){var myFunc=function(value){return function(data,context){return[value];}}
return myFunc(value);}
var items=value.split("%");if(items.length==3&&value.charAt(0)=='%'&&value.charAt(value.length-1)=='%'){if(value.charAt(1)=='@'){if(value.indexOf('{')!=-1)return;var attr=value.substring(2,value.length-1);if(isReadOnly){var myFunc=function(attr){return function(data,context){var out=[];for(var i=0;i<data.length;i++){var item=data[0];if(typeof(item.nodeType)=="undefined"||item.nodeType!=1)continue;if(aa_hasAttribute(item,attr))out.push(value);}
return out;}};return myFunc(attr);}
var myFunc=function(attr){return function(data,context){var out=[];for(var i=0;i<data.length;i++){var item=data[0];if(typeof(item.nodeType)=="undefined"||item.nodeType!=1)continue;var atts=item.attributes;for(var j=0;j<atts.length;j++)
if(atts.item(j).nodeName==attr)
out.push(atts.item(j));}
return out;}};return myFunc(attr);}
return null;}
if(items.length==3){var prefix=items[0];var suffix=items[2];var xpath=items[1];if(xpath.length==0){var myFunc=function(prefix,suffix){return function(data,context){return[prefix+ajaxart.totext_array(data)+suffix];}}
return myFunc(prefix,suffix);}}
return null;}
ajaxart.log=function(message,type)
{if(type==null)type="";var log_message=type+" - "+message;ajaxart.log_str+=log_message+"\n\r";if(type=="")type="general";if(ajaxart.logs[type]==null)
ajaxart.logs[type]=[];ajaxart.logs[type].push(message);if(type=="error"&&ajaxart.debugmode)
debugger;if(type=="error"&&window.bart_error_log)bart_error_log(message);if(ajaxart.log_level=="error")
jQuery("#ajaxart_log").append(jQuery("<div>"+ajaxart.xmlescape(log_message)+"</div>"));}
ajaxart.childElem=function(parent,elemName)
{if(parent==null||parent.childNodes==null)return null;var node=parent.firstChild;while(node!=null)
{if(node.nodeType==1){if(elemName=="*")return node;if(node.tagName==elemName)return node;}
node=node.nextSibling;}
return null;}
ajaxart.newContext=function(){return{vars:[],params:[],componentContext:null};}
ajaxart.dynamicText=function(data,str,params,origData,booleanExpression,xmlescape)
{if(ajaxart.isBackEnd)
str=''+str;if(str.indexOf('%')==-1)return[str];if(str=="%%")return data;var out=[];if(data.length==0||str.length==0)
data=[""];str=str.replace(/\\%/g,"__*__");var arr=str.split("%");var onlyCalculated=(arr.length==3&&str.charAt(0)=='%'&&str.charAt(str.length-1)=='%'&&str.length>=2);var createIfNotExist=false;if(onlyCalculated&&str.length>0&&str.charAt(1)=="!"){createIfNotExist=true;str="%"+str.substring(2,str.length-1)+"%";}
if(onlyCalculated&&str.charAt(1)=="$"){var varStr=str.substring(2,str.length-1);var result=[];if(varStr.indexOf('/')==-1)
{var fixedVarStr=ajaxart.fixCodingInsidePercentage(varStr,data,params,origData);result=ajaxart.getVariableAndFilter(data,params,fixedVarStr);}
else{var fixedVarStr=ajaxart.fixCodingInsidePercentage(varStr,data,params,origData);if(fixedVarStr.indexOf('/')==-1){result=ajaxart.getVariableAndFilter(data,params,fixedVarStr);}else{var varAndFilter=fixedVarStr.substring(0,fixedVarStr.indexOf('/'));var varObj=ajaxart.getVariableAndFilter(data,params,varAndFilter);var restOfCommand=fixedVarStr.substring(fixedVarStr.indexOf('/')+1);result=ajaxart.dynamicText(varObj,"%"+restOfCommand+"%",params,data);}}
if(result.nodeType!=null)
return[result];return result;}
if(arr.length==2)
return[str];for(var j=0;j<data.length;j++)
{var data_item=data[j];var str_item="";if(onlyCalculated)
{var varItem=[];var item=str.substring(1,str.length-1);if(item.length>0&&item.charAt(0)=="="){var result=ajaxart.dynamicTextWithAggregator(data_item,item,params);if(result!="")
out.push(result);}
else{item=ajaxart.fixCodingInsidePercentage(item,data,params,origData);if(item=="")
out.push(data_item);else if(ajaxart.isxml(data_item))
ajaxart.concat(out,ajaxart.xml.xpath(data_item,item,createIfNotExist));else if(ajaxart.isObject(data_item))
{var structItem=ajaxart.structitem(data_item,item,params);if(structItem!=null)
ajaxart.concat(out,structItem);}}}
else
{for(var i=0;i<arr.length;i++)
{var item=arr[i];if((i%2)==0)
str_item+=item;else
{var item_to_add="";if(item.length==0)
item_to_add=ajaxart.totext_item(data_item);else
{if(item.charAt(0)=="$")
{item=ajaxart.fixCodingInsidePercentage(item,data,params,origData);if(item.indexOf('/')==-1)
item_to_add=ajaxart.totext(ajaxart.getVariableAndFilter(data,params,item.substr(1)));else{var varObj=ajaxart.getVariableAndFilter(data,params,item.substring(1,item.indexOf('/')));var restOfCommand=item.substring(item.indexOf('/')+1);var result=ajaxart.dynamicText(varObj,"%"+restOfCommand+"%",params,data);item_to_add=ajaxart.totext_array(result);}}
else if(item.charAt(0)=="=")
item_to_add=ajaxart.dynamicTextWithAggregator(data_item,item,params);else{item=ajaxart.fixCodingInsidePercentage(item,data,params,origData);if(ajaxart.isObject(data_item))
item=ajaxart.structitem(data_item,item,params);else
item=ajaxart.xml.xpath(data_item,item,createIfNotExist);item_to_add=ajaxart.totext_array(item);}}
if(booleanExpression){if(isNaN(item_to_add)||item_to_add=="")
item_to_add="'"+item_to_add.replace(/'/g,"\\'")+"'";}
if(xmlescape==true)
item_to_add=ajaxart.xmlescape(item_to_add);str_item+=item_to_add;}}
out.push(str_item);}}
if(arr.length<3&&out.length>0)
{out=[out[0]];}
if(!ajaxart.isxml(out))
for(i in out)
{if(typeof(out[i])=="string")
{var txt=''+out[i];if(txt.indexOf("__*__")>-1)
out[i]=txt.replace(/__\*__/g,'%');}}
return out;}
ajaxart.clone_context=function(context)
{var new_context=ajaxart.newContext();for(i in context.vars){new_context.vars[i]=context.vars[i];}
new_context.params=context.params;new_context.componentContext=context.componentContext;new_context._This=context._This;return new_context;}
ajaxart.concat=function(source,toadd){if(toadd==null)return;for(var i=0;i<toadd.length;i++)
source.push(toadd[i]);}
ajaxart.getVariable=function(context,varName)
{varName=""+varName;var out;if(varName=="")
return[];if(context.params!=null)
out=context.params[varName];if(out!=null&&out.isParamScript==true){if(out.script==null)return[];return[out.script];}
if(out!=null)return out;if(varName=="_This"&&context._This)return[context._This];if(context.vars!=null)
out=context.vars[varName];if(out!=null)return out;if(ajaxart.serverData)
out=ajaxart.serverData[varName];if(out!=null)return out;if(context.vars._GlobalVars){var func=context.vars._GlobalVars[0][varName];if(func&&'function'==typeof(func))out=func(varName,context);}
if(out!=null)return out;return[];}
ajaxart.writevalue=function(data,newValueObj,disableXmlChangeEvent){var assigned=false;if(data==null||data.length==0||data[0]==null)return assigned;if(data.WriteValue)return data.WriteValue(newValueObj);var xml=data[0];if(ajaxart.isxml(newValueObj))
{var newNode=newValueObj;if(ajaxart.isArray(newValueObj))
newNode=newValueObj[0];if(newNode.nodeType==1&&xml.nodeType==1)
{if(newNode==xml)return;if(aa_tag(newNode)==aa_tag(xml))
ajaxart.xml.copyElementContents(xml,newNode);else
ajaxart.replaceXmlElement(xml,newNode);assigned=true;}}
if(!assigned)
{var newValue=ajaxart.totext(newValueObj);if(ajaxart.isxml(xml)){if(xml.nodeType==2||xml.nodeType==3||xml.nodeType==4){if(newValue==xml.nodeValue)return true;xml.nodeValue=newValue;}
else{var text_node=xml.firstChild;if(text_node&&(text_node.nodeType==3||xml.nodeType==4))
text_node.nodeValue=newValue;else
xml.appendChild(xml.ownerDocument.createTextNode(newValue));}
assigned=true;}else if(typeof(xml)=="string"){data[0]=ajaxart.totext(newValueObj);assigned=true;}}
if(!disableXmlChangeEvent&&ajaxart.isxml(xml))
ajaxart.xml.xml_changed(xml);return assigned;}
ajaxart.parsexml=function(contents,filename,errorMsgOut,onlyWarning,baseXml)
{if(ajaxart.isxml(contents)){if(contents.nodeType==9)
return contents.firstChild;return contents;}
if(typeof(filename)=="undefined")filename="";if(typeof contents!="string")return contents;var parsing_error_level="error";if(onlyWarning)
parsing_error_level="warning";var doc;try{contents=contents.replace(/&#xa;&#xd;/g,"&#xa;");contents=contents.replace(/&#xd;&#xa;/g,"&#xa;");contents=contents.replace(/&#10;&#13;/g,"&#xa;");contents=contents.replace(/&#13;&#10;/g,"&#xa;");if(contents.indexOf('<')>0)
contents=contents.substring(contents.indexOf('<'));if(ajaxart.isBackEnd){return com.artwaresoft.XmlUtils.ParseXml(contents);}
if(window.ActiveXObject)
{doc=new ActiveXObject("MSXML2.DOMDocument");var loaded=doc.loadXML(contents);if(!loaded){var message=doc.parseError.reason+doc.parseError.srcText;if(errorMsgOut!=null)
errorMsgOut.push(message);ajaxart.log('Error parsing xml file '+filename+' : '+message+",xml:"+ajaxart.xmlescape(contents.substring(0)+"..."),parsing_error_level);return null;}}
else if(document.implementation&&document.implementation.createDocument)
{var domParser=new DOMParser();doc=domParser.parseFromString(contents,"text/xml");var errorMsg=null;var parseerrors=doc.getElementsByTagName("parsererror");if(parseerrors.length>0){errorMsg="Error parsing xml";try{errorMsg=parseerrors[0].childNodes.item(1).innerHTML;}catch(e){errorMsg="Error parsing xml";}}
if(doc.documentElement.nodeName=='parsererror'){errorMsg=doc.documentElement.childNodes.item(0).nodeValue;if(errorMsg.indexOf("Location")>0)
errorMsg=errorMsg.substring(0,errorMsg.indexOf("Location"))+errorMsg.substring(errorMsg.lastIndexOf("\n"));}
if(errorMsg!=null){ajaxart.log('Error parsing xml file '+filename+' : '+errorMsg+",xml:"+ajaxart.xmlescape(contents.substring(0)+"..."),parsing_error_level);if(errorMsgOut!=null)
errorMsgOut.push(errorMsg);return null;}}}
catch(e){ajaxart.log('Error parsing xml file: '+e+ajaxart.xmlescape(contents.substring(0,50)+"..."),parsing_error_level);return null;}
var out=doc.firstChild;while(out.nodeType!=1&&out.nextSibling!=null)
out=out.nextSibling;out=aa_importNode(out,baseXml);return out;}
ajaxart.each=function(arr,func)
{for(var i=0;i<arr.length;i++)
func(arr[i],i);}
ajaxart.ishtml=function(item)
{if(item==null)return false;if(ajaxart.isArray(item)&&item.length>0)
return ajaxart.ishtml_item(item[0]);else
return ajaxart.ishtml_item(item);}
ajaxart.setVariable=function(context,varName,varValue)
{if(varName==null)return;try{context.vars[""+varName]=varValue;}catch(e){ajaxart.log("cannot set variable"+varName,"error");}}
ajaxart.runScriptParam=function(data,scriptParam,context)
{if(scriptParam==null)return[];if(typeof(scriptParam)=="function")return scriptParam(data,context);if(scriptParam.compiled=="same")return data;if(scriptParam.context==null)debugger;var newContext={params:scriptParam.context.params,vars:context.vars,componentContext:scriptParam.context.componentContext}
if(scriptParam.objectForMethod)
newContext._This=scriptParam.objectForMethod[0];if(scriptParam.compiled!=null)
return scriptParam.compiled(data,newContext);else
return ajaxart.run(data,scriptParam.script,"",newContext);return[];}
ajaxart.runNativeHelper=function(helpername,data,script,context)
{var new_context=ajaxart.clone_context(context);new_context.params=[];for(i in context.params)
new_context.params[i]=context.params[i];var field_script=script;var component=script.getAttribute("t")||"";if(component=="")return[];var middlePos=component.indexOf('.');var ns=component.substring(0,middlePos);var compName=component.substr(middlePos+1);var global=ajaxart.components[ns][compName];var paramDefinitions=ajaxart.childElems(global,"Param");new_context.componentContext=context;for(var i=0;i<paramDefinitions.length;i++)
{var paramDef=paramDefinitions[i];var param_name=aa_hasAttribute(paramDef,'name')?paramDef.getAttribute("name"):null;var param_value;if(aa_hasAttribute(paramDef,"type")&&(''+paramDef.getAttribute("type")).indexOf("[]")>0)
{var param_value=[];var subprofiles=ajaxart.childElems(field_script,param_name);if(paramDef.getAttribute("script")!="true"){for(var j=0;j<subprofiles.length;j++)
ajaxart.concat(param_value,ajaxart.run(data,subprofiles[j],"",new_context));}else{param_value={isArrayParamScript:true,script:script,field:param_name,context:new_context};}}
else if(paramDef.getAttribute("script")!="true")
param_value=ajaxart.run(data,field_script,param_name,new_context);else{param_value={isParamScript:true};param_value.script=ajaxart.fieldscript(field_script,param_name,true,new_context);param_value.compiled=ajaxart.compile(param_value.script,'',new_context,paramDef.getAttribute("paramVars"));}
ajaxart.setParameterVariable(new_context,param_name,param_value);}
var helperXml=ajaxart.xml.xpath(global,'NativeHelper[@name="'+helpername+'"]');if(helperXml.length>0)
return ajaxart.run(data,helperXml[0],"",new_context);ajaxart.log("calling runNativeHelper for none existing helper - "+helpername);return[];}
ajaxart.totext_array=function(arr)
{if(arr==null||arr.length==0)return"";return ajaxart.totext_item(arr[0]);}
ajaxart.getControlElement=function(params,single)
{var elem=ajaxart.getVariable(params,"ControlElement");if(typeof(elem.controlElement)!="undefined")
elem=elem.controlElement;if(single!=null&&single==true){if(elem==null||elem.length==0)
return null;return elem[0];}
if(elem==null)return[];return elem;}
ajaxart.isattached=function(elem)
{if(elem==null)return false;try{if(!elem.offsetParent)return false;}catch(e){return false;}
return true;}
ajaxart.databind=function(bindto,data,params,script,origData)
{ajaxart.each(bindto,function(item){if(!ajaxart.ishtml(item))return;var context={};context.data=data;context.params=params;context.script=script;context.origData=origData;if(typeof(item["ajaxart"])=="undefined")
item["ajaxart"]=context;else
{if(script!=null)
item["ajaxart"].script=script;if(origData!=null)
item["ajaxart"].origData=origData;}});}
ajaxart.trycatch=function(func,whenerror){if(ajaxart.debugmode)
return func();try{return func();}catch(e){if(e=="endless loop")throw e;return whenerror(e);};}
ajaxart.totext_item=function(item)
{if(ajaxart.ishtml_item(item))
return ajaxart.xml2text(item);if(ajaxart.isxml_item(item))
{if(item.nodeValue!=null)return ajaxart.isBackEnd?''+item.nodeValue:item.nodeValue;var childs_length=item.childNodes.length;for(var i=0;i<childs_length;i++)
if(item.childNodes.item(i).nodeType==1)
return"";if(item.text!=null)return ajaxart.isBackEnd?''+item.text:item.text;return ajaxart.isBackEnd?''+item.textContent:item.textContent;}
return''+item;}
ajaxart.runComponent=function(component,data,context){var profile=ajaxart.parsexml('<xtml t="'+component+'" />');return ajaxart.run(data,profile,'',context);}
ajaxart.fieldscript=function(script,field,lookInAttributes)
{var field_script=script;if(field!="")
{if(lookInAttributes)
{if(aa_hasAttribute(script,field))
return ajaxart.xml.attributeObject(script,field);}
field_script=ajaxart.childElem(script,field);if(field_script==null)
{var parent_comp=script.getAttribute("t")||"";if(parent_comp==""){return null;}
var middlePos=parent_comp.indexOf('.');var ns=parent_comp.substring(0,middlePos);var compName=parent_comp.substr(middlePos+1);var global=ajaxart.components[ns][compName];var default_value=ajaxart.default_values[parent_comp+"__"+field];if(typeof(default_value)==="undefined"){var param=ajaxart.childElemByAttrValue(global,"Param","name",field);var defaultVal=ajaxart.childElem(param,"Default");if(defaultVal!=null)
{field_script=defaultVal;ajaxart.default_values[parent_comp+"__"+field]=field_script;}
else
ajaxart.default_values[parent_comp+"__"+field]="none";}else if(typeof(default_value)=="string")
field_script=null;else
field_script=default_value;}}
return field_script;}
ajaxart.isxml_item=function(xml)
{if(xml==null)return false;return(xml.nodeType!=null);}
ajaxart.isObject_array=function(array){if(array.length==0||typeof(array[0].isObject)=="undefined")return false;return true;}
ajaxart.xml.clone=function(xml)
{if(xml.length==0)return null;return xml[0].cloneNode(true);}
ajaxart.xml.xpath=function(xml,xpath,createIfNotExist,defaultValue)
{if(xpath.length>0&&xpath.charAt(0)=="!")
return ajaxart.xml.xpath(xml,xpath.substring(1,xpath.length),true);if(xml==null||!ajaxart.isxml(xml))return[];var result=[];try{if(jQuery.browser.msie&&typeof(xml.selectNodes)!="undefined")
{xml.ownerDocument.setProperty("SelectionLanguage","XPath");var nodes=xml.selectNodes(""+xpath);for(var i=0;i<nodes.length;i++)
result.push(nodes[i]);}
else if(ajaxart.isBackEnd)
{var list=com.artwaresoft.XmlUtils.XPath(xml,xpath);for(var i=0;i<list.getLength();i++)
result.push(list.item(i));}
else
{var iter=xml.ownerDocument.evaluate(xpath,xml,aa_ns_resolver,XPathResult.ANY_TYPE,null);if(iter)
{var node=iter.iterateNext();while(node){result.push(node);node=iter.iterateNext();}}}}
catch(e){ajaxart.log('error calculating xpath: '+xpath+", xml:"+ajaxart.xmlescape(ajaxart.xml2text(xml).substring(0,50)),"warning");}
if(result.length>0&&result[0].nodeType==9)
return[];if(result.length==0&&createIfNotExist)
{try{var subpath=xpath;var item=xml;while(subpath.indexOf('/')>-1)
{var pos=subpath.indexOf('/');var tag=subpath.substring(0,pos);var item=ajaxart.xml.xpath(item,tag,true)[0];subpath=subpath.substring(pos+1);}
if(subpath.charAt(0)=="@"){var attrName=subpath.substring(1);if(typeof(defaultValue)=="undefined")defaultValue="";if(attrName.indexOf('/')==-1)
item.setAttribute(attrName,defaultValue);}
else{var newelem=aa_createElement(item,subpath);if(typeof(defaultValue)!='undefined'&&defaultValue!="")
newelem.appendChild(newelem.ownerDocument.createTextNode(defaultValue));item.appendChild(newelem);}
result=ajaxart.xml.xpath(xml,xpath,false);}catch(e){ajaxart.log("failed create xpath item :"+xpath+","+e.message);return[];}}
return result;}
ajaxart.xml.append=function(parent,child)
{try{if(!ajaxart.isxml(parent)){ajaxart.log("cannot append to non-xml parent","error");return;}
if(child!=null&&child.nodeType==1&&parent!=null)
{child=aa_importNode(child,parent);parent.appendChild(child);}}catch(e){ajaxart.log(e.message,"error");}}
ajaxart.xml.xml_changed=function(xml)
{if(ajaxart.ishtml(xml))return;while(xml!=null&&xml.nodeType!=4){var attachment=ajaxart.xml.getModifyInfo(xml);if(attachment!=null){if(attachment.disable)return;attachment.modified=true;if(attachment.mode=="auto save draft")
ajaxart.xml.autosave(xml,attachment,'SaveDraftAction');else if(attachment.mode=="auto save")
ajaxart.xml.autosave(xml,attachment,'SaveAction');else if(attachment.mode=="manual save"){if(attachment.compiled!=null)attachment.compiled([xml],attachment.context);}}
xml=ajaxart.xml.parentNode(xml);}}
ajaxart.xml.xpath_of_node=function(xml,id,specific,top)
{if(!ajaxart.isxml(xml))return"";var result="";var xml_item=xml;if(top==xml)return"";while(xml_item!=null)
{var slash="/";if(result=="")slash="";var xpath_elem="";if(xml_item.nodeType==9){xml_item=null;continue;}
if(xml_item.nodeType==1)
{if(xml_item.parentNode==null||xml_item.parentNode.nodeType==9)
{xml_item=null;continue;}
xpath_elem=''+aa_tag(xml_item);if(specific)
{if(id.length>0&&aa_hasAttribute(xml_item,id))
xpath_elem+='[@'+id+"='"+xml_item.getAttribute(id)+"']";else{if(typeof(xml_item.parentNode)!="undefined")
{var my_count=0;var count=0;var i=0;for(i=0;i<xml_item.parentNode.childNodes.length;i++)
{var brother=xml_item.parentNode.childNodes.item(i);if(brother.nodeType==1&&aa_tag(brother)==aa_tag(xml_item))
{count++;if(brother==xml_item)my_count=count;}}
if(my_count>0&&count>1){var id_empty=!aa_hasAttribute(xml_item,"id")||xml_item.getAttribute("id")=="";var name_empty=!aa_hasAttribute(xml_item,"name")||xml_item.getAttribute("name")=="";if(!id_empty||!name_empty){if(!id_empty)
xpath_elem+="[@id='"+xml_item.getAttribute("id")+"']";else
xpath_elem+="[@name='"+xml_item.getAttribute("name")+"']";}
else
xpath_elem+="["+my_count+"]";}}}}}
if(xml_item.nodeType==2)
xpath_elem="@"+xml_item.name;if(xpath_elem!="")
result=xpath_elem+slash+result;if(id.length>0&&xml_item.nodeType==1&&aa_hasAttribute(xml_item,id))
return result;var orig_item=xml_item;xml_item=xml_item.parentNode;if(xml_item==null)
{var parents=ajaxart.xml.xpath(orig_item,"..");if(parents.length>0)
xml_item=parents[0];}
if(xml_item==top)xml_item=null;}
return result;}
ajaxart.cookies.valueFromCookie=function(name)
{if(name=="")return null;if(ajaxart.isBackEnd)
{var result=''+aa_backend_Utils.GetCookie(name);return decodeURIComponent(result);}
var nameEQ=name+"=";var ca=document.cookie.split(';');for(var i=0;i<ca.length;i++){var c=ca[i];while(c.charAt(0)==' ')c=c.substring(1,c.length);if(c.indexOf(nameEQ)==0)return decodeURIComponent(c.substring(nameEQ.length,c.length));}
return null;}
ajaxart.cookies.writeCookie=function(cookie,value)
{var val=encodeURIComponent(value);cookie=encodeURIComponent(cookie);if(cookie=="")return;if(ajaxart.isBackEnd)
{aa_backend_Utils.AddCookie(cookie,val);return;}
var date=new Date();date.setMonth(date.getMonth()+1);if(cookie!="")
document.cookie=cookie+"="+val+";"+" expires="+date.toUTCString();}
ajaxart.ui.bindEvent=function(elem,event1,func1)
{if(event1=="mouserightclick"){jQuery(elem).bind('contextmenu',function(){return false;});jQuery(elem).mousedown(function(e){var evt=e;if(evt.button==2){xFireEvent(this,'click',null);ajaxart.ui.lastEvent=(e)?e:window.event;func1(e);ajaxart.ui.lastEvent=null;return false;}
return true;});return;}
if(elem.addEventListener)
elem.addEventListener(event1,func1,false);else if(elem.attachEvent)
elem.attachEvent("on"+event1,func1);}
ajaxart.ui.mousePos=function(e)
{if(typeof(event)!='undefined')
var e=window.event;if(e.pageX||e.pageY)
return{x:e.pageX,y:e.pageY}
else if(e.clientX||e.clientY)
{var posx=e.clientX+document.body.scrollLeft+document.documentElement.scrollLeft;var posy=e.clientY+document.body.scrollTop+document.documentElement.scrollTop;return{x:posx,y:posy}}
return{};}
ajaxart.ui.absoluteLeft=function(elem,ignoreScroll)
{if(elem==null)return 0;var orig=elem,left=0,curr=elem;if(!ignoreScroll)
{while(curr.offsetParent){left-=curr.scrollLeft;curr=curr.parentNode;}}
while(elem){left+=elem.offsetLeft;elem=elem.offsetParent;}
return left;}
ajaxart.ui.absoluteTop=function(elem,ignoreScroll)
{var top=0,orig=elem,curr=elem;if(typeof(ignoreScroll)=="undefined")ignoreScroll=false;if(!ignoreScroll)
{while(curr.offsetParent){top-=curr.scrollTop;curr=curr.parentNode;}}
while(elem){top+=elem.offsetTop;elem=elem.offsetParent;}
return top;}
ajaxart.ui.applyKeyboardEvent=function(_event,context)
{if(_event!=null&&_event.keyCode!=null){var codeAsString="";switch(_event.keyCode){case 40:codeAsString="down arrow";break;case 38:codeAsString="up arrow";break;case 13:codeAsString="enter";break;case 32:codeAsString=" ";break;}
if(_event.keyCode>=48&&_event.keyCode<=126)
codeAsString=String.fromCharCode(_event.keyCode).toUpperCase();if(_event.ctrlKey==true&&codeAsString!=null)
codeAsString='Ctrl+'+codeAsString;if(_event.altKey==true&&codeAsString!=null)
codeAsString='Alt+'+codeAsString;ajaxart.setVariable(context,"KeyPressed",[codeAsString]);}}
ajaxart.dialog.positionPopup=function(popup,callerControl,__to_del,noPaddingToCallerControl,context,forceUpperPopup)
{var jPopup=jQuery(popup);var scroll=ajaxart_scroll_offset();var screen=ajaxart_screen_size();var popup_pos={left:0,top:0},caller_control_d={width:0,height:0};if(callerControl!=null){popup_pos={left:ajaxart.ui.absoluteLeft(callerControl),top:ajaxart.ui.absoluteTop(callerControl)+callerControl.offsetHeight};caller_control_d={width:jQuery(callerControl).width(),height:jQuery(callerControl).height()};}
else if(context&&context.vars.MousePos)
popup_pos={left:context.vars.MousePos[0].pageX,top:context.vars.MousePos[0].pageY};var padding=(noPaddingToCallerControl)?0:2;if(forceUpperPopup||(screen.height+scroll.y<popup_pos.top+jPopup.height()&&scroll.y<=popup_pos.top-jPopup.height()-caller_control_d.height))
{popup_pos.top-=jPopup.height()+caller_control_d.height+padding;popup.RePosition=function(){ajaxart.dialog.positionPopup(popup,callerControl,null,noPaddingToCallerControl,context,true);}}
else
popup_pos.top+=padding;if((screen.width+scroll.x<popup_pos.left+jPopup.width()&&scroll.x<=popup_pos.left-jPopup.width()-caller_control_d.width))
{popup_pos.left=screen.width+scroll.x-jPopup.width()-caller_control_d.width;popup.RePosition=function(){ajaxart.dialog.positionPopup(popup,callerControl,null,noPaddingToCallerControl,context,true);}}
if(jQuery(callerControl).parents('.right2left').length>0){jPopup.css("right",document.body.clientWidth-caller_control_d.width-popup_pos.left);jPopup.addClass('right2left');}
else
jPopup.css("left",popup_pos.left);jPopup.css("top",popup_pos.top).fadeIn(150);}
ajaxart.yesno.itemsEqual=function(item1,item2)
{var item1Comp=item1;var item2Comp=item2;if(ajaxart.isxml(item1))
{if(item1.nodeType==2)
item1Comp=''+item1.nodeValue;else
item1Comp=ajaxart.xml2text(item1).replace(/\n/g,"").replace(/\r/g,"").replace(/\t/g,"").replace(/>[ ]*</g,"><");if(ajaxart.ishtml(item1))
item1Comp=item1Comp.replace(/class=(\w+)/g,'class="$1"');}
if(ajaxart.isxml(item2))
{if(item2.nodeType==2)
item2Comp=''+item2.nodeValue;else
item2Comp=ajaxart.xml2text(item2).replace(/\n/g,"").replace(/\r/g,"").replace(/\t/g,"").replace(/>[ ]*</g,"><");if(ajaxart.ishtml(item2))
item2Comp=item2Comp.replace(/class=(\w+)/g,'class="$1"');}
if(ajaxart.isxml(item1)&&!ajaxart.isxmlelement(item2)&&item1.nodeType==1)
item1Comp=ajaxart.xml.innerTextStr(item1);if(ajaxart.isxml(item2)&&!ajaxart.isxmlelement(item1)&&item2.nodeType==1)
item2Comp=ajaxart.xml.innerTextStr(item2);if(ajaxart.isObject(item1)||ajaxart.isObject(item2))
{if(ajaxart.isObject(item1)&&ajaxart.isObject(item2)){for(i in item1){if(i!="isObject")
{var item1val=item1[i];var item2val=item2[i];if(typeof(item2val)!=typeof(item1val))return false;if(typeof(item1val)=="undefined"&&typeof(item2val)=="undefined")continue;if(ajaxart.isArray(item1val)&&item1val.length>0)item1val=item1val[0];if(ajaxart.isArray(item2val)&&item2val.length>0)item2val=item2val[0];if(ajaxart.isArray(item1val)&&item1val.length==0&&ajaxart.isArray(item2val)&&item2val.length==0)
continue;if(!ajaxart.yesno.itemsEqual(item1val,item2val))
return false;}}
return true;}
return false;}
if(item1Comp==item2Comp)return true;return false;}
ajaxart.yesno.is_empty=function(data,checkInnerText){if(data.length==0)return["true"];if(typeof(data[0])=="string"&&data[0]=="")return["true"];if(ajaxart.isxml(data[0])){if(data[0].nodeType==3||data[0].nodeType==4)
return data[0].nodeValue=="";if(data[0].nodeType==2)
return data[0].nodeValue=="";if(data[0].nodeType==1&&checkInnerText)
{if(data[0].attributes.length>0)return[];var children=data[0].childNodes;if(children.length==0)return["true"];if(children.length==1&&(children[0].nodeType==3||children[0].nodeType==4)&&children[0].nodeValue=="")return["true"];}}
return[];}
ajaxart.load_plugin=function(plugin_name,xtml_name)
{if(xtml_name==null)
xtml_name="plugins/"+plugin_name+"/"+plugin_name+".xtml";ajaxart.loading_objects++;jQuery.ajax({type:"GET",url:xtml_name,success:function(xtml_content){var xtml=ajaxart.parsexml(xtml_content,xtml_name);ajaxart.load_xtml_content(xtml_name,xtml);ajaxart.object_finished_loading();},error:function(e){aa_handleHttpError(e,this);ajaxart.log("failed loading plugin "+xtml_name+","+e.message,"error");ajaxart.object_finished_loading();}});}
ajaxart.ready=function(func,serverDataArray,scripts)
{ajaxart.ready_func=func;if((typeof(serverDataArray)=="undefined"||serverDataArray==null||serverDataArray.length==0)&&(scripts==null||scripts.length==0)&&ajaxart.loading_objects==0){func();return;}
if(serverDataArray!=null){for(var i=0;i<serverDataArray.length;i++)
ajaxart.load_server_data_inner(serverDataArray[i]);}
if(scripts!=null){for(var i=0;i<scripts.length;i++)
ajaxart.load_plugin('',scripts[i]);}}
ajaxart.start=function(divId,data,script,serverData,scripts,language)
{jQuery(document).ready(function(){ajaxart.ready(function(){if(ajaxart.urlparam('debugmode')=="true")ajaxart.debugmode=true;if(ajaxart.isChrome)jQuery("body").addClass('chrome');var scriptXml=ajaxart.parsexml(script);if(data==null)data=[""];var context=ajaxart.newContext();if(language!=null)
ajaxart.setVariable(context,"Language",language);var result=ajaxart.run(data,scriptXml,"",context);var div=jQuery(divId).addClass("ajaxart ajaxart_topmost");ajaxart.databind([div[0]],data,context,scriptXml,data);if(div.length>0&&result.length>0)
div[0].appendChild(result[0]);aa_element_attached(result[0]);aa_register_document_events();var loading=jQuery("#ajaxart_loading");if(loading.length>0&&!loading[0].IsUsed)
loading.hide();},serverData,scripts);});}
function jbart_init(){(function(jQuery){jQuery.fn.jBart=function(params)
{return this.each(function(){jQuery(this).append(jBart.show_page(params));jQuery(this).addClass('jBartWidget');aa_element_attached(this);});};})(jQuery);jQuery().ready(function(){ajaxart.ready(function(){jQuery().find('.jBartWidget').each(function(){var params={}
var widgetId=(this.className+' ').split('jBartWidget ')[1].split('jBartWidget_')[1].split(' ')[0];var WidgetVarName='jBartWidget_'+widgetId;params.widget=window[WidgetVarName];if(this.className.indexOf('jBartWidgetPage_')>-1)
params.page=(this.className+' ').split('jBartWidgetPage_')[1].split(' ')[0];if(params.widget)
jQuery(this).jBart(params);else
ajaxart.log('can not find widget '+widgetId);jQuery("#ajaxart_loading").hide();});},[]);})}
function aa_ns_resolver(token)
{if(!aa_ns_table)
aa_ns_table={access:"http://www.bloglines.com/about/specs/fac-1.0",admin:"http://webns.net/mvcb/",ag:"http://purl.org/rss/1.0/modules/aggregation/",annotate:"http://purl.org/rss/1.0/modules/annotate/",app:"http://www.w3.org/2007/app",atom:"http://www.w3.org/2005/Atom",audio:"http://media.tangent.org/rss/1.0/",blogChannel:"http://backend.userland.com/blogChannelModule",cc:"http://web.resource.org/cc/",cf:"http://www.microsoft.com/schemas/rss/core/2005",company:"http://purl.org/rss/1.0/modules/company",content:"http://purl.org/rss/1.0/modules/content/",conversationsNetwork:"http://conversationsnetwork.org/rssNamespace-1.0/",cp:"http://my.theinfo.org/changed/1.0/rss/",creativeCommons:"http://backend.userland.com/creativeCommonsRssModule",dc:"http://purl.org/dc/elements/1.1/",dcterms:"http://purl.org/dc/terms/",email:"http://purl.org/rss/1.0/modules/email/",ev:"http://purl.org/rss/1.0/modules/event/",feedburner:"http://rssnamespace.org/feedburner/ext/1.0",fh:"http://purl.org/syndication/history/1.0",foaf:"http://xmlns.com/foaf/0.1/",foaf:"http://xmlns.com/foaf/0.1",geo:"http://www.w3.org/2003/01/geo/wgs84_pos#",georss:"http://www.georss.org/georss",geourl:"http://geourl.org/rss/module/",g:"http://base.google.com/ns/1.0",gml:"http://www.opengis.net/gml",icbm:"http://postneo.com/icbm",image:"http://purl.org/rss/1.0/modules/image/",indexing:"urn:atom-extension:indexing",itunes:"http://www.itunes.com/dtds/podcast-1.0.dtd",kml20:"http://earth.google.com/kml/2.0",kml21:"http://earth.google.com/kml/2.1",kml22:"http://www.opengis.net/kml/2.2",l:"http://purl.org/rss/1.0/modules/link/",mathml:"http://www.w3.org/1998/Math/MathML",media:"http://search.yahoo.com/mrss/",openid:"http://openid.net/xmlns/1.0",opensearch10:"http://a9.com/-/spec/opensearchrss/1.0/",opensearch:"http://a9.com/-/spec/opensearch/1.1/",opml:"http://www.opml.org/spec2",rdf:"http://www.w3.org/1999/02/22-rdf-syntax-ns#",rdfs:"http://www.w3.org/2000/01/rdf-schema#",ref:"http://purl.org/rss/1.0/modules/reference/",reqv:"http://purl.org/rss/1.0/modules/richequiv/",rss090:"http://my.netscape.com/rdf/simple/0.9/",rss091:"http://purl.org/rss/1.0/modules/rss091#",rss1:"http://purl.org/rss/1.0/",rss11:"http://purl.org/net/rss1.1#",search:"http://purl.org/rss/1.0/modules/search/",slash:"http://purl.org/rss/1.0/modules/slash/",ss:"http://purl.org/rss/1.0/modules/servicestatus/",str:"http://hacks.benhammersley.com/rss/streaming/",sub:"http://purl.org/rss/1.0/modules/subscription/",svg:"http://www.w3.org/2000/svg",sx:"http://feedsync.org/2007/feedsync",sy:"http://purl.org/rss/1.0/modules/syndication/",taxo:"http://purl.org/rss/1.0/modules/taxonomy/",thr:"http://purl.org/rss/1.0/modules/threading/",thr:"http://purl.org/syndication/thread/1.0",trackback:"http://madskills.com/public/xml/rss/module/trackback/",wfw:"http://wellformedweb.org/CommentAPI/",wiki:"http://purl.org/rss/1.0/modules/wiki/",xhtml:"http://www.w3.org/1999/xhtml",xlink:"http://www.w3.org/1999/xlink",xrd:"xri://$xrd*($v*2.0)",xrds:"xri://$xrds"};return aa_ns_table[token];}
function ajaxart_tree_prev(elem,cntr)
{var prev=elem.prev();if(!cntr.Tree)return prev;if(prev.length>0)
{if(!prev[0].collapsed)
{var last_child=prev.find('.aa_item').filter(aa_visible_selectable).slice(-1);if(last_child.length>0)return last_child;}
return prev;}
var parent=elem.parent();while(parent.length>0)
{if(parent.hasClass("aa_item"))
return parent;if(parent.hasClass("aa_list"))
{var last_child=parent.prev().find('.aa_item').filter(aa_visible_selectable).slice(-1);if(last_child.length>0)
return last_child;}
parent=parent.parent();}
return parent;}
function ajaxart_tree_next(elem,cntr)
{if(!cntr.Tree)return elem.next();if(!elem[0].collapsed)
{var next=elem.find('.aa_item').filter(aa_visible_selectable).slice(0,1);if(next.length>0)return next;}
next=elem.next();if(next.length>0)return next;var parent=elem.parent();while(parent.length>0)
{if(parent.next().hasClass("aa_item"))
return parent.next();if(parent.next().hasClass("aa_list"))
{var next=ajaxart_tree_next(parent.next());if(next.length>0)return next;}
parent=parent.parent();}
return[];}
function aa_init_ipad(options)
{if(!options)options={orientationClasses:true};var setOrientationClass=function(){var orientation=(window.orientation==0||window.orientation==180)?"portrait":"landscape";document.body.parentNode.setAttribute('class',orientation);if(ajaxart.jbart_studio){orientation=aa_url_attribute(window.location.href,"ipad_orient");if(orientation!="portrait")orientation="landscape";jQuery('body').removeClass('portrait').removeClass('landscape').addClass(orientation);}
if(window.aav_onorientationchange){for(var i in window.aav_onorientationchange)window.aav_onorientationchange[i](orientation);}}
if(options.orientationClasses){window.onorientationchange=setOrientationClass;setOrientationClass();}}
function aa_visible(){return this.hidden!=true}
function aa_visible_selectable(){return this.hidden!=true}
function jbart_data_arrived(widget_id,resource,data_as_string){var data_as_xml=ajaxart.parsexml(data_as_string);if(!data_as_xml)return;var data_holder=aa_jbart_get_data_holder(widget_id,resource);var new_items=[];for(var node=data_as_xml.firstChild;node!=null;node=node.nextSibling){if(node.nodeType==1){new_items.push(node);data_holder.items.push(node);}}
for(i in data_holder.on_data_arrive){var f=data_holder.on_data_arrive[i];f(new_items,data_holder.items);}}
function aa_xtml_path(elem)
{var path=[];while(elem&&elem.nodeType!=9&&elem.tagName!='Component')
{if(elem.nodeType==1)
{var id=elem.getAttribute('id')||elem.getAttribute('ns')||elem.getAttribute('Name')||elem.getAttribute('Of')||(''+aa_index_of_element(elem));path.push(aa_tag(elem)+'['+id+']');}
else if(elem.nodeType==2)
path.push("@"+elem.name);elem=elem.parentNode;}
if(elem&&elem.nodeType==1)
path.push(elem.getAttribute('id')||elem.getAttribute('ns')+':/');return path.reverse().join('/');}
function aa_handleValidations(field,input,data,context,evt)
{if(!field.Validations)return;if(input.ValidationErrorElement)jQuery(input.ValidationErrorElement).remove();jQuery(input).removeClass('input_with_error');jQuery(input).removeClass('mandatory_error');if(jQuery(input).parents('.aa_hidden_field').length>0)
return;for(var i=0;i<field.Validations.length;i++){var vObj=field.Validations[i];if(evt!="on save"){if(evt!=vObj.CheckValidation&&evt!="on load")continue;if(evt=="on load"&&vObj.CheckValidation=="on save")continue;}
var pass=!aa_tobool(vObj.Validation(data,context));if(!pass){input.Error=ajaxart_multilang_text(aa_totext(vObj.ErrorMessage(data,context)),context);jQuery(input).addClass('input_with_error');if(vObj.Mandatory){jQuery(input).addClass('mandatory_error');continue;}
var div=document.createElement('div');div.className="validation_error";div.fieldTitle=field.Title;div.innerHTML=ajaxart_multilang_text(aa_totext(vObj.ErrorMessage(data,context)),context);if(vObj.HideErrorMessage)aa_hide(div);input.ValidationErrorElement=div;var insertFuncGenerator=function(div,input){return function(){jQuery(div).insertAfter(jQuery(input).parent().children().slice(-1));}}
var insertFunc=insertFuncGenerator(div,input);if(input.parentNode!=null)
insertFunc();else
aa_addOnAttach(input,insertFunc);}}}
function aa_validation_showerror(topControl,error)
{if(!topControl)return;jQuery(topControl).find('.aa_noclose_message').remove();var noCloseMsg=jQuery('<div class="aa_noclose_message" tabindex="1000"/>')[0];noCloseMsg.innerHTML=error;topControl.appendChild(noCloseMsg);noCloseMsg.focus();aa_fixTopDialogPosition();}
function aa_find_just_in_container(cntr,cls,mustBeInContainer)
{var ctrl=cntr.Ctrl;var elems=jQuery(ctrl).find(cls);if(mustBeInContainer&&elems.length==1)return elems[0];for(var i=0;i<elems.length;i++)
if(jQuery(elems[i]).parents('.aa_container')[0]==ctrl)
return elems[i];return null;}
function aa_RunAsyncQuery(data,fieldscript,context,callBack)
{if(fieldscript==null){callBack([],context,false);return;}
var callBackObj={callBack:callBack,marked:false,success:true};var newContext=aa_ctx(context,{_AsyncCallback:callBackObj});var result=[];try{if(typeof(fieldscript)=="function")
result=fieldscript(data,newContext);else if(fieldscript.compiled!=null)
result=fieldscript.compiled(data,newContext);else
result=ajaxart.run(data,fieldscript,'',newContext);}catch(e){ajaxart.log(e.message,"error");}
if(!callBackObj.marked&&callBack)
callBack(result,context,true);}
function aa_refresh_itemlist(cntr,context,show_all)
{context=context||cntr.Context;show_all=show_all||cntr.DoNotUseIncrementalBuilder;if(show_all)cntr.ShowAll=true;var top=ajaxart_find_aa_list(cntr);var items_data=aa_items(cntr);if(items_data==null)return;if(items_data.length==0&&cntr.ControlForNoData){var ctrl=cntr.ControlForNoData([],context)[0];jQuery(ctrl).addClass('aa_list');aa_replaceElement(top,ctrl);}
if(cntr.createNewElement)
{if(cntr.IsSingleItem&&items_data.length>0){aa_clear_cntr_items(top);var elem=cntr.createNewElement([items_data[0]],[],context);top.appendChild(elem);var newcontext=aa_ctx(cntr.Context,{_Elems:[elem]})
for(var i=0;i<cntr.Aspects.length;i++)
ajaxart_runMethod([],cntr.Aspects[i],'InitializeElements',newcontext);for(var i=0;i<cntr.PostActors.length;i++)
ajaxart.runScriptParam([],cntr.PostActors[i].aspect.PostAction,context);}
else
{var all_elems=[];var chunkTimeLimit=cntr.ChunkLimitMSec||200;var timeLimit=cntr.PageLimitMSec||2000;var show_incremental=cntr.ShowIncrementalBuild==null?true:cntr.ShowIncrementalBuild;if(show_all){timeLimit=60000;cntr.ShowAll=true;}
else
cntr.ShowAll=null;ajaxart_uiaspects_incrementalBuild(cntr,context,items_data,all_elems,chunkTimeLimit,timeLimit,show_incremental);}}
aa_invoke_cntr_handlers(cntr,cntr.ContainerChange,[],context);}
function aa_FilterAndSort(data1,context)
{var data=data1[0];var cntr=data1[1];var data_items=cntr.Items[0];if(data_items.LargeDataItems&&data_items.ServerQuery){var query=aa_calcCntrQuery(cntr,context);ajaxart_async_Mark(context);jQuery(cntr.Ctrl).addClass('aa_loading');aa_runMethodAsync(data_items,data_items.ServerQuery,[cntr.Query],context,function(result,ctx){if(!cntr.Query.GroupByField)
cntr.FilteredItems=result;else
cntr.Groups=result;jQuery(cntr.Ctrl).removeClass('aa_loading');ajaxart_async_CallBack([],context);});return;}
cntr.DataHolder=cntr.DataHolder||aa_createDataHolderFromCntr(cntr,context);var exp=aa_FilterExpression(cntr,cntr.ExposedFilters,data,context);var dataview;var sort=cntr.DataHolder.UserDataView.Sort=aa_cntrSortPrefrences(cntr)||cntr.DataHolder.UserDataView.Sort;if(exp)
var filters=aa_filters_from_expression(exp,cntr.Fields);else
var filters=[];var dataview=cntr.DataHolder.newFiltersDataView(filters,sort,'user');dataview.CalcFilters();var result=dataview.CalcResults();cntr.FilteredWrappers=result[0].Items;return result;}
function aa_clear_virtual_inner_element(elem)
{if(!elem.virtual_inner_elements)return;for(var i=0;i<elem.virtual_inner_elements.length;i++){aa_empty(elem.virtual_inner_elements[i]);}}
function aa_element_detached(elem)
{if(!elem||ajaxart.isattached(elem))return;var items=jQuery(elem).find('.aa_ondetach').get();if(jQuery(elem).hasClass('aa_ondetach'))items.push(elem);for(var i=0;i<items.length;i++){if(items[i].OnDetach)items[i].OnDetach();jQuery(items[i]).removeClass('aa_onattach_called');}}
ajaxart.replaceXmlElement=function(old_elem,new_elem,ishtml)
{if(old_elem==null||new_elem==null)return;if(old_elem.nodeType!=1)return;if(old_elem.parentNode==null)return;if(ishtml==true||ajaxart.isChrome)
{if(new_elem.ownerDocument!=old_elem.ownerDocument)
new_elem=old_elem.ownerDocument.importNode(new_elem,true);}
if(ishtml&&old_elem.ParentObject!=null){old_elem.ParentObject[0].ControlHolder=[new_elem];new_elem.ParentObject=old_elem.ParentObject;}
old_elem.parentNode.replaceChild(new_elem,old_elem);if(ishtml){aa_element_attached(new_elem);aa_element_detached(old_elem);}}
ajaxart.xmlescape=function(text)
{if(ajaxart.isArray(text))
{if(text.length>0)return ajaxart.xmlescape(text[0]);return"";}
if(ajaxart.isObject(text))
return"struct";var str=text;str=str.replace(/&/g,"&amp;");str=str.replace(/</g,"&lt;");str=str.replace(/>/g,"&gt;");str=str.replace(/"/g,"&quot;");str=str.replace(/'/g,"&apos;");str=str.replace(/\n/g,"&#xa;");str=str.replace(/\r/g,"&#xd;");return str;}
function aa_fixImageSize(img,user_width,user_height)
{var imgObj=new Image();imgObj.src=img.getAttribute('src');var naturalWidth=imgObj.width;var naturalHeight=imgObj.height;if(naturalWidth*naturalHeight==0){img.width=user_width;img.height=user_height;return;}
if(naturalWidth<img.width)img.width=naturalWidth;if(naturalHeight<img.height)img.height=naturalHeight;var width=Math.min(naturalWidth,user_width),height=Math.min(naturalHeight,user_height);var ratio=naturalWidth/naturalHeight;var currRatio=width/height;if(ratio!=currRatio){if(naturalWidth>=naturalHeight*currRatio){img.width=user_width;img.height=Math.floor(width/ratio);}else{img.height=user_height;img.width=Math.floor(height*ratio);}}else{img.width=user_width;img.height=user_height;}}
function aa_searchbox_preprocess(items,input,field,compiled,context,step){var all_items_size=input.AllItems.length;var stop_at=input.PreprocessChunkSize+step;if(stop_at>items.length)
stop_at=items.length;for(var i=step;i<stop_at;i++){input.AllItems.push({item:items[i],text:' '+compiled([items[i]],context).toLowerCase().replace(/^\s*|\s*$/g,' ')});}
if(!input.Searching&&input.SearchId&&input.TotalShown<input.MaxItemsToShow){var input=null;aa_search_chunk(input,field,profile,context,input.SearchId,input.Pattern,all_items_size-1);}
if(i<items.length)
setTimeout(function(){aa_searchbox_preprocess(items,input,field,compiled,context,i);},1);}
undefined
ajaxart.compile_text=function(script,field,context){var out=function(data,ctx){return aa_text(data,script,field,ctx);}
var fieldscript=ajaxart.fieldscript(script,field,true);if(fieldscript==null)return function(){return"";};if(fieldscript.nodeType==2){var value=fieldscript.nodeValue;if(value=="%%")return function(data1){return aa_totext(data1);};if(value.indexOf('%')==-1){var toEval="out = function() { return '"+value+"'}";if(value.indexOf("'")>-1)return out;eval(toEval);return out;}
else{if(value.split('%').length==3&&value.indexOf('%@')==0&&value.charAt(value.length-1)=='%'){var attr=value.substring(2,value.length-1);var toEval="out = function(data1) { return data1[0].getAttribute('"+attr+"') || '';}";eval(toEval);return out;}}}
return out;}
function aa_jbart_get_data_holder(widget_id,resource){var div=document.getElementById('jBartWidget_'+widget_id);if(!div){ajaxart.log("cannot find widget "+'jBartWidget_'+widget_id);return;}
if(!div["jbart_data"])div["jbart_data"]={};if(!div["jbart_data"][resource])
div["jbart_data"][resource]={items:[],on_data_arrive:[]};return div.jbart_data[resource];}
function aa_uncapture_for_popup(popup)
{var orig_mousedown=popup?popup.Orig_mousedown:null;if(window.captureEvents)
window.onmousedown=orig_mousedown;else
document.onmouseclick=orig_mousedown;}
function aa_search_chunk(input,field,profile,context,search_id,pattern,step){if(input.SearchId!=search_id)return;var show_now=[];var end_loop=(input.AllItems.length>step+input.SearchChunkSize)?step+input.SearchChunkSize:input.AllItems.length;if(pattern.text==""){var promoted_items=ajaxart.run([],profile,'PromotedItems',context);if(promoted_items.length>1){for(var i=0;i<input.MaxItemsToShow;i++)
if(i<promoted_items.length)show_now.push(promoted_items[i]);}else{for(var i=0;i<input.MaxItemsToShow;i++)
if(i<input.AllItems.length)show_now.push(i);}
end_loop=input.AllItems.length;}
else{var p1=pattern.p1;for(var i=step;i<end_loop;i++){var s=input.AllItems[i].text;if((p1&&s.indexOf(p1)!=-1)||(pattern.p2&&s.indexOf(pattern.p2)!=-1)||(pattern.p3&&s.indexOf(pattern.p3)!=-1)||(pattern.p4&&s.indexOf(pattern.p4)!=-1)){var show_first=false;if(pattern.words>1){var words_found=0;if(p1&&s.indexOf(p1)!=-1)words_found++;if(pattern.p2&&s.indexOf(pattern.p2)!=-1)words_found++;if(pattern.p3&&s.indexOf(pattern.p3)!=-1)words_found++;if(pattern.p4&&s.indexOf(pattern.p4)!=-1)words_found++;if(words_found==pattern.words)
show_first=true;}else if(s.indexOf(p1)==1)
show_first=true;if(show_first)
{show_now.push(i);if(input.TotalShown==0&&input.FirstChunkToShow==show_now.length)
break;}else{input.ShowAtEnd.push(i);}}}}
if(show_now.length>0){var max_to_show=input.MaxItemsToShow-input.TotalShown;aa_show_items(input,field,show_now.slice(0,max_to_show),pattern);if(!input.ResultsShown){input.ShowResults();input.ResultsShown=true;}}
if(end_loop<input.AllItems.length)
setTimeout(function(){aa_search_chunk(input,field,profile,context,search_id,pattern,end_loop)},1);else{input.Searching=false;if(input.ShowAtEnd.length>0){var max_to_show=input.MaxItemsToShow-input.TotalShown;if(max_to_show>0)
aa_show_items(input,field,input.ShowAtEnd.slice(0,max_to_show),pattern);if(!input.ResultsShown)
input.ShowResults();}
else if(input.TotalShown==0)
input.ShowNothingFound();if(input)jQuery(input).removeClass('aa_loading');aa_fire_async_finished();}}
function aa_init_image_object(image,data,context)
{if(typeof(image)=='string')return{StaticUrl:image,Size:''};if(!image||!image.Url)return;image.StaticUrl=aa_totext(image.Url(data,context));return image;}
function ajaxart_object_boolean_value(obj,property)
{if(obj[property]==null)return null;if(typeof(obj[property])=="boolean")return obj[property];if(obj[property].length==0||obj[property]!="true")return false;return true;}
function aa_find_class(jElem,cls)
{if(jElem.hasClass(cls))return jElem;return jElem.find('.'+cls);}
function aa_set_image(elem,image,deleteWhenEmpty)
{if(elem&&elem.tagName.toLowerCase()!='img'){var imgElem=document.createElement('img');elem.appendChild(imgElem);if(image.Size!=""){var imageSize=image.Size.split(',');if(imageSize.length==1)imageSize.push('0');for(var i in imageSize)if(imageSize[i]=='')imageSize[i]='0';if(imageSize[0]!='0')elem.style.width=imageSize[0]+'px';if(imageSize[1]!='0')elem.style.height=imageSize[1]+'px';}
return aa_set_image(imgElem,image,true);}
if(!image){if(deleteWhenEmpty)aa_remove(elem);return;}
if(typeof(image)=='string')image={StaticUrl:image,Size:''};var src=image.StaticUrl||'';if(src=="")src=image.SecondUrl;if(src==""){if(deleteWhenEmpty)aa_remove(elem);return;}
elem.setAttribute('src',src);if(image.Size=="")return;var imageSize=image.Size.split(',');if(imageSize.length==1)imageSize.push('0');for(var i in imageSize)if(imageSize[i]=='')imageSize[i]='0';elem.ImageWidth=parseInt(imageSize[0].split('px')[0]);elem.ImageHeight=parseInt(imageSize[1].split('px')[0]);if(elem.ImageWidth>0)elem.width=elem.ImageWidth;if(elem.ImageHeight>0)elem.height=elem.ImageHeight;if(elem.ImageWidth*elem.ImageHeight==0)return;function FixImageSize()
{var imgObj=new Image();imgObj.src=elem.getAttribute('src');var naturalWidth=imgObj.width,naturalHeight=imgObj.height;if(naturalWidth<elem.ImageWidth)elem.width=naturalWidth;if(naturalHeight<elem.ImageHeight)elem.height=naturalHeight;var width=Math.min(naturalWidth,elem.ImageWidth),height=Math.min(naturalHeight,elem.ImageHeight);if(image.KeepImageProportions){var ratio=naturalWidth/naturalHeight;var currRatio=width/height;if(ratio!=currRatio){if(naturalWidth>=naturalHeight*currRatio){elem.width=elem.ImageWidth;elem.height=Math.floor(width/ratio);}else{elem.height=elem.ImageHeight;elem.width=Math.floor(height*ratio);}}}}
var imgObj=new Image();imgObj.src=src;if(imgObj.complete)
FixImageSize();else
elem.onload=function(){FixImageSize();}}
function ajaxart_popup_capture_click(e)
{var elem=jQuery((typeof(event)=='undefined')?e.target:(event.tDebug||event.srcElement));if(elem.parents('.customsuggestionpopup').length>0)return;if(elem.parents('.contextmenu').length>0)return;if(elem.parents('html').length==0&&elem[0].tagName.toLowerCase()!='html')return;var popups=ajaxart.dialog.openPopups;for(var i=0;i<popups.length;i++)
{var popup=popups[popups.length-i-1];var popup_frame=(popup.Dlg)?popup.Dlg.Frame:popup.contents.parentNode;if(elem[0]!=popup_frame&&elem.parents().filter(function(){return this==popup_frame}).length==0)
{if(!popup.initialized)continue;jQuery("#log").append("click outside popup");aa_closePopup(popup);ajaxart_popup_capture_click(e);return;}
else
{if(ajaxart.controlOfFocus)
ajaxart.controlOfFocus.IgnoreBlur=true;return;}}}
function ajaxart_runevent(element,actionContext,actionToRun,controlData,_event)
{if(typeof(ajaxart_captured_element)!="undefined"&&ajaxart_captured_element.length>0)return[];var elem_context=element["ajaxart"];if(typeof(elem_context)=="undefined")
return[];var params=elem_context.params;if(actionContext.length>0)
{var actionContextPack=params.vars[actionContext];if(actionContextPack==null||actionContextPack.length==0)return[];var actionToRunPack=actionContextPack[0][actionToRun];if(actionToRunPack==null||typeof(actionToRunPack)=="undefined")return[];}
else{var actionToRunPack={script:ajaxart.getVariable(params,actionToRun),context:params};}
var newContext=ajaxart.clone_context(actionToRunPack.context);for(var i in elem_context.params.vars)
newContext.vars[i]=elem_context.params.vars[i];if(typeof(controlData)!="undefined")
ajaxart.setVariable(newContext,"ControlData",[controlData]);ajaxart.setVariable(newContext,"ControlElement",[element]);ajaxart.ui.applyKeyboardEvent(_event,newContext);if(ajaxart.isArray(actionToRunPack.script))return[];return ajaxart.run(elem_context.data,actionToRunPack.script,"",newContext);}
ajaxart.dialog.closeDialog=function()
{var topDialogDiv=openDialogs.pop();document.body.removeChild(topDialogDiv);document.body.removeChild(topDialogDiv.dialogContent);noOfOpenDialogs--;aa_element_detached(topDialogDiv.dialogContent);}
function aa_try_probe_test_attribute(script,field,data,out,context,origData)
{for(i in ajaxart.xtmls_to_trace)
if(ajaxart.xtmls_to_trace[i].xtml.nodeType==2&&ajaxart.xtmls_to_trace[i].xtml.nodeName==field)
if(ajaxart.xml.xpath(ajaxart.xtmls_to_trace[i].xtml,"..")[0]==script)
ajaxart.fill_trace_result(ajaxart.xtmls_to_trace[i].results,data,out,context,origData);}
ajaxart.trace=function(script,input,output,context,trace_param,level)
{if(ajaxart.xtmls_to_trace.length>0)return;var level_int=2;if(level!=null&&!isNaN(parseInt(level)))
level_int=parseInt(level);var trace_item={isObject:true};message="<b>id:</b> "+aa_xtml_path(script,"id",true);if(typeof(trace_param)!="undefined")
message+="/"+trace_param;trace_item.id=aa_xtml_path(script,"id",true);if(trace_param!=null)
trace_item.id+="/"+trace_param;trace_item.stack=aa_st();trace_item.input=ajaxart.text4trace(input,-1,level_int);trace_item.output=ajaxart.text4trace(output,-1,level_int);trace_item.params=[];trace_item.context=[];if(ajaxart.trace_stack&&level_int>0)
{message+="<b>params:</b> <ul>";for(varname in context.params){message+="<li>"+varname+": "+ajaxart.text4trace(ajaxart.getVariable(context,varname),0,0)+"</li>";trace_item["params"].push({isObject:true,name:varname,value:ajaxart.text4trace(ajaxart.getVariable(context,varname),0,level_int)});}
message+="</ul>";message+="<br> <b>stack:</b> <ul>";for(varname in context.vars){var txt=ajaxart.text4trace(ajaxart.getVariable(context,varname),0,level_int);message+="<li>"+varname+": "+txt+"</li>";trace_item["context"].push({isObject:true,name:varname,value:[txt]});}
message+="</ul>";message+="<b>server data: </b>";for(varname in ajaxart.serverData)
message+=varname+",";}
trace_item["context"]=trace_item["context"].reverse();ajaxart.traces.push(trace_item);if(ajaxart.isBackEnd)
{ajaxart.log("trace: "+trace_item.id)
ajaxart.log(">trace input: "+trace_item.input);ajaxart.log(">trace output: "+trace_item.output);ajaxart.log("end trace");}
jQuery("#trace_bugs").html("There are traces which can cause performence problems");}
ajaxart.tobool_array=function(arr)
{if(arr==null)debugger;return ajaxart.totext_array(arr)=="true";}
function ajaxart_field_expandableText(td,cntr,field,field_data,item,context)
{td.expandableText={States:{"control":{Control:function()
{td.State='control';jQuery(td).removeClass('aa_toggle_button');var ctrl=ajaxart_field_createControl(cntr,field,field_data,context)[0];if(!cntr)return jQuery('<div></div>')[0];td.appendChild(ctrl);if(field.ModifyControl)
for(var i=0;i<field.ModifyControl.length;i++)
field.ModifyControl[i](td,field_data,'control',context,item);return ctrl;},ChangeStateLabel:"close",ChangeToState:"text"},"text":{Control:function()
{var txt=ajaxart_field_text(field,field_data,item,context);if(txt==""&&field.DescriptionForEmptyText)
txt=field.DescriptionForEmptyText;if(td.firstChild)aa_detach(td.firstChild);td.innerHTML=txt;jQuery(td).addClass("aa_text fld_"+field.Id);td.setAttribute("tabindex","1");td.State='text';if(field.ModifyCell)
for(var i=0;i<field.ModifyCell.length;i++)
field.ModifyCell[i](td,field_data,'text',context,item);td.onkeydown=function(e){if(jQuery(td).find('.field_control').length>0)return;field.ToggleExpandable(field,field_data,td,e);if(e.keyCode==13)
return aa_stop_prop(e);return true;}
return td;},ChangeStateLabel:"",ChangeToState:"control"}},Build:function(state)
{aa_empty(td);td.onclick=null;jQuery(td).removeClass('aa_text');var ctrl=state.Control();if(ctrl==null)return td.expandableText.Build(td.expandableText.States['text']);var button=jQuery(ctrl);if(state.ChangeStateLabel!='')
{button=jQuery('<div>'+state.ChangeStateLabel+' </div>')
td.appendChild(button[0]);aa_element_attached(td);}
button.addClass('aa_toggle_button');button[0].onclick=function(e)
{var elem=jQuery((typeof(event)=='undefined')?e.target:event.srcElement);if(elem[0].parentNode==null)return true;var new_state=td.expandableText.States[state.ChangeToState];td.expandableText.Build(new_state);jQuery(td).find('>input').slice(0,1).focus();if(state.ChangeToState=="control")
aa_fixTopDialogPosition();}}};td.expandableText.Build(td.expandableText.States['text']);field.ToggleExpandable=function(field,field_data,input,e)
{if(e.keyCode==27)
{var td=input;if(!jQuery(td).hasClass('aa_cell_element'))
td=jQuery(input).parents('.aa_cell_element')[0];if(td==null)return;var current_state=td.expandableText.States[td.State];var new_state=td.expandableText.States[current_state.ChangeToState];td.expandableText.Build(new_state);if(jQuery(td).find('.field_control').length>0)
jQuery(td).find('.field_control').focus();else
jQuery(td).focus();}}}
function ajaxart_field_createControl(cntr,field,field_data,context)
{return ajaxart.trycatch(function(){var ctrl=null;if(field.Multiple==true&&field.MultipleControl!=null)
ctrl=ajaxart_runMethod(field_data,field,'MultipleControl',context);else if(ajaxart_field_is_readOnly(cntr,field,context))
{if(field.ReadOnlyControl)
ctrl=ajaxart_runMethod(field_data,field,'ReadOnlyControl',context);else if(field.Control)
ctrl=ajaxart_runMethod(field_data,field,'Control',context);else return[];}
else if(field.WritableControl)
ctrl=ajaxart.runScriptParam(field_data,field.WritableControl,context);else if(field.Control)
ctrl=ajaxart_runMethod(field_data,field,'Control',context);if(ctrl==null)
ctrl=[ajaxart_field_createSimpleInput(field_data,context,ajaxart_field_is_readOnly(cntr,field,context))];if(ctrl.length==0)
return[];jQuery(ctrl[0]).addClass("field_control fld_"+field.Id);if(field.Css){var newContext=aa_ctx(context,{_FieldCtrl:ctrl});ajaxart.runScriptParam(field_data,field.Css,newContext);}
return ctrl;},function(e){ajaxart.log(e.message,"error");return[];});}
function ajaxart_fill_mlTable()
{ajaxart_mlTable={};for(ns in ajaxart.components)
{var list=ajaxart.components[ns];for(var j in list){var comp=list[j];if(comp.getAttribute('type')!="text.MultiLangSuite")continue;var xtml=ajaxart.xml.xpath(comp,'xtml')[0];var lang=xtml.getAttribute('Language');var trList=ajaxart_mlTable[lang];if(trList==null)trList={};var items=ajaxart.xml.xpath(xtml,'Pattern');for(var k=0;k<items.length;k++){var key=items[k].getAttribute('Original');val=items[k].getAttribute('T')||items[k].getAttribute('Tranlation');trList[key]=val;}
ajaxart_mlTable[lang]=trList;}}}
function aa_buildProperty(cntr,tr,field,item_data,properties_width,ctx,title_tr,dont_add_colon)
{var newContext=aa_ctx(ctx,{_Field:[field],FieldTitle:[field.Title],_Item:item_data});var field_data=ajaxart_field_calc_field_data(field,item_data,newContext);var value_td=document.createElement("TD");if(field.HideTitle){value_td.colSpan=2;}
tr.appendChild(value_td);if(!field.HideTitle){var title_td=document.createElement("TD");title_td.className="field propertysheet_title_td fld_"+field.Id+"_title";if(properties_width)
jQuery(title_td).width(properties_width+'px');var txt=field.Title;if(txt!=""&&!dont_add_colon)txt+=":";title_td.innerHTML=txt;if(!title_tr)title_tr=tr;title_tr.appendChild(title_td);tr.appendChild(value_td);}
value_td.className="propertysheet_value_td";ajaxart_field_createCellControl(item_data,cntr,value_td,cntr.CellPresentation,field,field_data,newContext);if(field.Mandatory)
{var jControl=jQuery(value_td).find(".field_control");if(jControl.length>0)
{jQuery(title_td).addClass("aa_mandatory");jControl.addClass("aa_mandatory");}}}
function aa_handle_onload_validations(top)
{var optionals=jQuery(top).find('.aa_hasvalidations');for(var i=0;i<optionals.length;i++){var ctrl=optionals[i];if(!ctrl.ajaxart)continue;aa_handleValidations(ctrl.ajaxart.params.vars._Field[0],ctrl,ctrl.ajaxart.data,ctrl.ajaxart.params,"on load");}}
function ajaxart_field_highlight_text(text,highlight)
{if(text==null||text=='')return'';var result=text;var lCaseTxt=text.toLowerCase();var found_at=lCaseTxt.indexOf(highlight);var endTag=lCaseTxt.indexOf('>');if(found_at!=-1&&found_at>endTag)
{var to_replace=text.substring(found_at,found_at+highlight.length);result=text.replace(to_replace,'####'+to_replace+'~~~~');}
result=result.replace(/####/g,'<span class="aa_highlight">');result=result.replace(/~~~~/g,'</span>');return result;}
function ajaxart_object_run_boolean_method(object,method,data,context)
{if(object[method]==null)return false;var result=ajaxart_runMethod(data,object,method,context);if(result.length==0)return false;if(ajaxart.totext_array(result)=="true")return true;return false;}
function aa_validation_removeNoCloseMessages()
{jQuery(document).find('.aa_noclose_message').remove();}
function aa_invoke_field_handlers(eventFuncs,input,e,field,field_data,extra)
{if(aa_incapture)return;if(eventFuncs)
for(var i=0;i<eventFuncs.length;i++)
eventFuncs[i](field,field_data,input,e,extra);}
function ajaxart_field_option_text(field,field_data,context)
{var code=ajaxart.totext_array(field_data);if(field.Options&&field.Options.codeToText)
return field.Options.codeToText(code);return code;}
function ajaxart_field_RefreshDependentFields(field,srcElement,context)
{if(field==null||field.DependentFields==null)return;if(field.RefreshScope=='document')
var parent=jQuery(document);else if(field.RefreshScope=='container'||field.RefreshScope=='screen')
var parent=jQuery(srcElement).parents('.aa_container').slice(-1);else if(field.RefreshScope=='group')
var parent=jQuery(srcElement).parents('.aa_container').slice(0,1);else if(field.RefreshScope=='item')
var parent=jQuery(srcElement).parents('.aa_item').slice(0,1);else if(field.RefreshScope=='table line')
{var listIndex=jQuery(srcElement).parents().index(jQuery(srcElement).parents('.aa_list'));var parents_up_to_list=jQuery(srcElement).parents().slice(0,listIndex);var parent=parents_up_to_list.filter('.aa_item').slice(-1);}
var dependent=field.DependentFields.split(',');for(var f=0;f<dependent.length;f++)
{var fieldID=dependent[f];var ctrls=parent.find(".fld_"+fieldID);for(var i=0;i<ctrls.length;i++)
aa_refresh_cell(ctrls[i],context);}}
function aa_text_capitalizeToSeperateWords(str)
{var out="";var start=0;var counter=1;while(counter<str.length)
{if(str.charAt(counter)>='A'&&str.charAt(counter)<='Z')
{if(counter+1<str.length&&(str.charAt(counter-1)<'A'||str.charAt(counter-1)>'Z'))
{out=out+str.substring(start,counter)+" "+str.charAt(counter);start=counter+1;}}
counter++;}
out=out+str.substring(start);return out;}
undefined
ajaxart.calcParamsForRunOn=function(params,runOn,startFrom)
{var result=jQuery([]);if(ajaxart.ishtml(runOn))
result=jQuery(runOn);else
{runOn=ajaxart.totext(runOn);runOn=runOn.replace(/ /g,"_");if(runOn==""){ajaxart.setVariable(params,"ControlElement",[]);return params;}
var old_elem=[];if(typeof(startFrom)!="undefined")
old_elem=startFrom;else
old_elem=ajaxart.getControlElement(params);if(old_elem.length>0)
var baseElem=jQuery(old_elem);else
var baseElem=jQuery("body");var jexp="#"+runOn;if(runOn.charAt(0)==".")jexp=runOn;var result=baseElem.find(jexp);if(runOn.substr(0,3)=="up("){jexp=runOn.substring(3,runOn.length-1);if(baseElem.filter(jexp).length!=0)
result=baseElem;else
result=baseElem.parents(jexp).slice(0,1);}
if(runOn.substr(0,2)=="$."){var str="result = baseElem"+runOn.substr(1);try{eval(str);}catch(e){}}
if(runOn.substr(0,7)=="updown("){items=runOn.substring(7,runOn.length-1).split(",");if(items.length==2){var parent=baseElem.filter(items[0]);if(parent.length==0)
parent=baseElem.parents(items[0]);result=parent.find(items[1]);}}
if(runOn.substr(0,5)=="down("){jexp=runOn.substring(5,runOn.length-1);result=baseElem.find(jexp);}
if(result.length==0&&old_elem.length>0)
{baseElem.each(function(){if(this.getAttribute("id")==runOn)
result=$([this]);});}
if(result.length==0)result=ajaxart.jrootElem(baseElem).find(jexp);if(result.length==0)result=jQuery().find(jexp);if(result.length==0)
ajaxart.log("cannot locate "+jexp,"location");}
var out=[];result.each(function(){out.push(this)});params=ajaxart.clone_context(params);ajaxart.setVariable(params,"ControlElement",out);return params;}
ajaxart.fill_trace_result=function(results,input,output,params,origData)
{var result={isObject:true,Input:input,Output:output,context:params}
if(origData!=null)
result.OrigData=origData;results.push(result);}
ajaxart.write_profiling_at_end=function(start_time,component_id){var time_passes=new Date().getTime()-start_time;if(ajaxart.profiling_of_globals[component_id]==null)
ajaxart.profiling_of_globals[component_id]={calls:0,total:0};ajaxart.profiling_of_globals[component_id].calls++;ajaxart.profiling_of_globals[component_id].total+=time_passes;}
ajaxart.childElems=function(parent,elemName)
{var out=[];if(parent==null||parent.childNodes==null)return out;var node=parent.firstChild;while(node!=null)
{if(node.nodeType==1){if(elemName=="*")out.push(node);if(node.tagName==elemName)out.push(node);}
node=node.nextSibling;}
return out;}
ajaxart.setParameterVariable=function(context,varName,varValue)
{if(varName==null)return;try{context.params[""+varName]=varValue;}catch(e){ajaxart.log("cannot set param "+varName,"error");}}
ajaxart.isxml_array=function(arr)
{if(arr.length==0)return false;return ajaxart.isxml_item(arr[0]);}
ajaxart.xml.prettyPrint=function(xml,indent,compact)
{if(compact)indent="";var newline=compact?"":"\r";if(xml==null)return"";if(ajaxart.isArray(xml))
{if(xml.length>0)return ajaxart.xml.prettyPrint(xml[0],indent,compact);return"";}
if(ajaxart.isBackEnd){return''+com.artwaresoft.XmlUtils.XmlToString(xml);}
if(typeof(indent)=="undefined")indent="";if(!ajaxart.isxml(xml))return xml;if(xml.nodeType==2||xml.nodeType==3||xml.nodeType==4)return ajaxart.xmlescape(xml.nodeValue);if(xml.nodeType==8)return'';var out=indent+"<"+aa_tag(xml);var atts=xml.attributes;if(atts!=null){for(var i=0;i<atts.length;i++)
{var val=ajaxart.xmlescape(atts.item(i).value).replace(/&apos;/g,"'");var name=atts.item(i).localName||atts.item(i).name;if(name=='xmlns')continue;out+=" "+name+'="'+val+'"';}}
if(xml.childNodes.length==0)out+="/>"
else out+=">";var childs_length=xml.childNodes.length;if(childs_length==1&&(xml.childNodes.item(0).nodeType==3||xml.childNodes.item(0).nodeType==4))
out+=ajaxart.xmlescape(xml.childNodes.item(0).nodeValue);else
{for(var i=0;i<childs_length;i++)
{var child=xml.childNodes.item(i);if(child.nodeType!=3)
out+=newline+ajaxart.xml.prettyPrint(child,indent+"  ",compact);}
if(childs_length>0&&!compact)out+=newline+indent;}
if(xml.childNodes.length>0)out+="</"+aa_tag(xml)+">";return out;}
function aa_compile(script,context1)
{var xtml=script.getAttribute('Xtml');if(script.getAttribute('Field')!=null)return null;if(xtml==null||xtml.length<4)return null;if(xtml.charAt(0)=='%'&&xtml.charAt(1)=='$'){var slashPos=xtml.indexOf('/');if(slashPos==-1)return null;if(xtml.split('/').length!=2)return null;var varName=xtml.substring(2,slashPos);var funcName=xtml.substring(slashPos+1,xtml.length-1);var myFunc=function(varName,funcName){return function(data,context){if(script.getAttribute('Input')!=null)
data=ajaxart.dynamicText(data,script.getAttribute('Input'),context);var struct=ajaxart.getVariable(context,varName);if(struct==null||!ajaxart.isObject_array(struct)){return ajaxart.run(data,script,'',context);}
var xtml=struct[0][funcName];if(xtml==null)return[];if(xtml.compiled=="same")return data;var newContext=ajaxart.newContext();if(xtml.context!=null){newContext.params=xtml.context.params;newContext.componentContext=xtml.context.componentContext;}
newContext.vars=context.vars;if(xtml.objectForMethod)
newContext._This=xtml.objectForMethod[0];if(xtml.compiled==null)
return ajaxart.run(data,xtml.script,'',newContext);else
return xtml.compiled(data,newContext);}}
return myFunc(varName,funcName);}
return null;}
ajaxart.fixCodingInsidePercentage=function(str,data,params,origData)
{if(origData!=null)
data=origData;var startIndex=str.indexOf("{");while(startIndex>-1)
{var endIndex=str.indexOf('}',startIndex);if(endIndex==-1)startIndex=-1;else{var inside=str.substring(startIndex+1,endIndex);var newVal=ajaxart.totext_array(ajaxart.dynamicText(data,"%"+inside+"%",params));str=str.substring(0,startIndex)+newVal+str.substring(endIndex+1);startIndex=str.indexOf('}',endIndex+newVal.length-inside.length);}}
return str;}
ajaxart.getVariableAndFilter=function(data,context,varName)
{var pos=varName.indexOf('[');if(pos==-1)return ajaxart.getVariable(context,varName);var name=varName.substring(0,pos);var out=ajaxart.getVariable(context,name);var rawWhere=varName.substring(pos).replace('{','%').replace('}','%');var where=ajaxart.dynamicText(data,rawWhere,context);if(ajaxart.isxml(out)){var out2=[];for(var i=0;i<out.length;i++)
ajaxart.concat(out2,ajaxart.xml.xpath(out[i],'self::*'+where));return out2;}
return out;}
ajaxart.dynamicTextWithAggregator=function(data_item,str,context)
{if(!aa_text_matchesRegex(str,"=[a-zA-Z]+\(.*\)"))return"";var funcName=aa_text_extractRegex(str,"=([a-zA-Z]+)[(]([^)]*)[)]",1);var params=aa_text_extractRegex(str,"=([a-zA-Z]+)[(]([^)]*)[)]",2);var params_arr=ajaxart.splitCommasForAggregatorParams(params);if(params_arr.length==0)return"";var data_items=ajaxart.dynamicText([data_item],"%"+params_arr[0]+"%",context,[data_item]);var ns="data";if(ajaxart.components[ns][funcName]==null)ns="text";if(ajaxart.components[ns][funcName]==null)return"";var extraParams="";for(var i=1;i<params_arr.length;i++){var shortParams=ajaxart.xml.xpath(ajaxart.components[ns][funcName],"Param[@short='true']/@name");if(shortParams.length<=i-1)break;var paramText=params_arr[i].replace('{','%').replace('}','%');extraParams+=' '+ajaxart.totext_item(shortParams[i-1])+'="'+paramText+'" ';}
var script='<Script t="'+ns+'.'+funcName+'"'+extraParams+' />';return aa_text(data_items,ajaxart.parsexml(script,'aggregator'),"",context);}
ajaxart.isObject=function(item){if(item==null)return false;if(ajaxart.isArray(item)&&item.length>0)
return ajaxart.isObject(item[0]);return typeof(item.isObject)!="undefined";}
ajaxart.structitem=function(data,itemName,context)
{var afterSlash="";if(itemName.indexOf('/')>-1)
{var orig=itemName;itemName=orig.substring(0,orig.indexOf('/'));afterSlash=orig.substring(orig.indexOf('/')+1);}
if(ajaxart.isArray(data)&&data.length>0)
return ajaxart.structitem(data[0],itemName,context);var out=[];if(itemName.indexOf('@')>-1||itemName.indexOf(' ')>-1)
return[];var filter="";if(itemName.indexOf('[')>-1){var filter=itemName.substring(itemName.indexOf('[')+1,itemName.indexOf(']'));var itemName=itemName.substring(0,itemName.indexOf('['));}
if(typeof(data[itemName])=='undefined')return[];out=data[itemName];if(filter!="")
out=ajaxart_filter_array(out,filter,context);if(out==null)out=[];if(!ajaxart.isArray(out))out=[out];if(afterSlash.length>0)
out=ajaxart.dynamicText(out,"%"+afterSlash+"%",context);if(typeof(out)=="boolean")
out=(out)?["true"]:[];return out;}
ajaxart.xml.copyElementContents=function(target,source)
{if(source.nodeType!=1||target.nodeType!=1)return;while(target.childNodes.length>0)
target.removeChild(target.childNodes.item(0));while(target.attributes.length>0)
target.removeAttribute(target.attributes.item(0).name);var atts=source.attributes;if(atts!=null)
for(var i=0;i<atts.length;i++)
target.setAttribute(atts.item(i).name,atts.item(i).value);source=aa_importNode(source,target);var childNode=source.firstChild;var ownerDoc=ajaxart.isBackEnd?target.getOwnerDocument():target.ownerDocument;while(childNode!=null)
{var item=childNode;if(typeof(childNode.cloneNode)!="undefined")
target.appendChild(childNode.cloneNode(true));else if(childNode.nodeType==3||childNode.nodeType==4)
target.appendChild(ownerDoc.createTextNode(childNode.nodeValue));childNode=childNode.nextSibling;}}
function aa_importNode(node,target)
{if(target==null)return node;if(ajaxart.isBackEnd)
return com.artwaresoft.XmlUtils.ImportNode(target,node);if(ajaxart.isChrome&&target.ownerDocument!=node.ownerDocument&&target.ownerDocument.importNode!=undefined)
return target.ownerDocument.importNode(node,true);return node;}
ajaxart.ishtml_item=function(item)
{if(!item||!item.ownerDocument)return false;return((item.nodeType!=undefined)&&(item.body||item.ownerDocument.body));}
ajaxart.childElemByAttrValue=function(parent,elemName,attrName,attrValue)
{if(parent==null||parent.childNodes==null)return null;for(var i=0;i<parent.childNodes.length;i++)
{var node=parent.childNodes.item(i);if(node.nodeType!=1)continue;if(elemName=="*"||node.tagName==elemName)
if(node.getAttribute(attrName)==attrValue)
return node;}
return null;}
ajaxart.xml.attributeObject=function(parent,attrName)
{if(parent==null||parent.childNodes==null)return null;for(var i=0;i<parent.attributes.length;i++)
{if(parent.attributes.item(i).nodeName==attrName)
return parent.attributes.item(i);}
return null;}
ajaxart.xml.getModifyInfo=function(xml)
{for(var i=0;i<ajaxart.xmlsToMonitor.length;i++)
if(ajaxart.xmlsToMonitor[i].xml==xml)
return ajaxart.xmlsToMonitor[i].modifyInfo;return null;}
ajaxart.xml.autosave=function(xml,attachment,saveAction)
{var savefunc=function(force){if(attachment.saving==true&&!force)return false;attachment.saving=true;var success=aa_bool([xml],attachment.profile,'SaveAction',attachment.context);if(success)attachment.modified=false;attachment.saving=false;return true;}
if(attachment.autosavedelay==0)savefunc();else
ajaxart.action.delayedRun(savefunc,xml,2500,6000);}
ajaxart.xml.parentNode=function(node)
{if(node.nodeType==9)
return null;if(node.parentNode&&node.parentNode.nodeType==1)
return node.parentNode;if(node.parentNode&&node.parentNode.nodeType==9)
return null;if(node.ownerElement!=null)
return node.ownerElement;var xpath_result=ajaxart.xml.xpath(node,"..");if(xpath_result.length==1)return xpath_result[0];return null;}
function ajaxart_scroll_offset(){var scrollOffsetX=0;var scrollOffsetY=0;if(document.body&&(document.body.scrollLeft||document.body.scrollTop)){scrollOffsetY=document.body.scrollTop;scrollOffsetX=document.body.scrollLeft;}else if(document.documentElement&&(document.documentElement.scrollLeft||document.documentElement.scrollTop)){scrollOffsetY=document.documentElement.scrollTop;scrollOffsetX=document.documentElement.scrollLeft;}
return{x:scrollOffsetX,y:scrollOffsetY};}
ajaxart.isxmlelement=function(xml)
{return(ajaxart.isxml(xml)&&xml.nodeType==1);}
ajaxart.xml.innerTextStr=function(element)
{var node=element.firstChild;while(node!=null){if(node.nodeType==3||node.nodeType==4)return node.nodeValue;node=node.nextSibling;}
return"";}
function aa_handleHttpError(e,options,context)
{var text="HTTP error. url: "+options.url+" status: "+e.statusText;ajaxart.log(text,'error');if(context&&context.vars._BartContext&&context.vars._BartContext[0].ContentLogSupport){bart_write_server_not_found_to_server_log(e,options,context);}}
ajaxart.load_xtml_content=function(xtml_name,xtml)
{if(xtml==null){alert('could not parse xtml file '+xtml_name);debugger;}
if(xtml.getAttribute("package")=="true"){var plugins=ajaxart.childElems(xtml,"*");ajaxart.each(plugins,function(plugin_xml){ajaxart.load_xtml_content(xtml_name,plugin_xml);});return;}
plugin_name=xtml.getAttribute("ns");if(!plugin_name||plugin_name=='')
plugin_name=xtml.getAttribute("id");if(!plugin_name||plugin_name==''){ajaxart.log("xtml file does not have ns or id attribute in the main xtml element. Tag: "+aa_tag(xtml),"error");ajaxart.log();return;}
xtml.setAttribute("file",xtml_name);var globalsInFile=ajaxart.childElems(xtml,"*");ajaxart.each(globalsInFile,function(item){switch(item.tagName){case"Component":var id=item.getAttribute("id");if(ajaxart.components[plugin_name]==null)
ajaxart.components[plugin_name]=[];ajaxart.components[plugin_name][id]=item;break;case"C":var id=item.getAttribute("id");if(ajaxart.components[plugin_name]==null)
ajaxart.components[plugin_name]=[];ajaxart.components[plugin_name][id]=item;break;case"Usage":if(ajaxart.usages[plugin_name]==null)
ajaxart.usages[plugin_name]=[];ajaxart.usages[plugin_name].push(item);break;case"Plugin":if(ajaxart.plugins[plugin_name]==null)
ajaxart.plugins[plugin_name]=[];ajaxart.plugins[plugin_name]=item;break;case"Type":var id=item.getAttribute("id");ajaxart.types[plugin_name+"_"+id]=item;break;}});}
ajaxart.object_finished_loading=function()
{var loading_div=jQuery("#ajaxart_loading");if(loading_div.length>0)
loading_div.html(loading_div.html()+".");ajaxart.loading_objects--;if(ajaxart.loading_objects==0&&ajaxart.ready_func!=null)
ajaxart.ready_func();}
ajaxart.load_server_data_inner=function(serverDataObj)
{var varname=serverDataObj.varname;ajaxart.loading_objects++;var retFunc=function(server_data_content){if(server_data_content&&!ajaxart.isxml(server_data_content))
server_data_content=ajaxart.ajaxart_clean_ns(server_data_content);var serverData=ajaxart.parsexml(server_data_content,varname);if(serverData!=null)
{while(serverData!=null&&serverData.nodeType!=1)
serverData=serverData.nextSibling;if(serverData==null)
ajaxart.serverData[varname]=[];else
{if(aa_tag(serverData).toLowerCase()=='envelope')
serverData=ajaxart.body_contents_of_soap_envelope(serverData);ajaxart.serverData[varname]=[serverData];}}
ajaxart.object_finished_loading();};var errorFunc=function(XMLHttpRequest,textStatus,errorThrown){ajaxart.log("failed loading server data "+varname+","+errorThrown);var statusItem=ajaxart.childElemByAttrValue(ajaxart.xtmls,"serverData","varName",varname);if(statusItem!=null)
statusItem.setAttribute("status","loaded");};options={url:serverDataObj.url,type:"GET",success:retFunc,error:errorFunc,cache:false};if(serverDataObj.dataType)
options.dataType=serverDataObj.dataType;if(typeof(serverDataObj.postData)!="undefined")
{options.type="POST";options.data=serverDataObj.postData;}
if(typeof(serverDataObj.contentType)!="undefined")
options.contentType=serverDataObj.contentType;try{var request=jQuery.ajax(options);}catch(e){jQuery("#loading_log").append("cannot load data of "+serverDataObj.url);}}
function aa_register_document_events(){if(window.ajaxart.document_events_registered)return;window.ajaxart.document_events_registered=true;jQuery(document).keydown(function(event){if(event.keyCode==18)
ajaxart_altPressed=true;if(event.keyCode==192&&event.ctrlKey&&!event.shiftKey){ajaxart.inPreviewMode=false;aa_run_component("debugui.OpenDebugUi",[],ajaxart.newContext());}
if(event.keyCode==192&&event.ctrlKey&&event.shiftKey){aa_run_component("debugui.OpenComponent",[],ajaxart.newContext());}
if(event.keyCode==8){var element=(typeof(event.target)=='undefined')?event.srcElement:event.target;if(element.tagName.toLowerCase()!='input'&&element.tagName.toLowerCase()!='textarea'){ajaxart_stop_event_propogation(event);return false;}}
if(event.keyCode==67&&ajaxart_altPressed&&ajaxart_devmode==true){ajaxart.quickrun('bart_dt.Inspect',element);}
if(event.keyCode==78&&ajaxart_altPressed&&ajaxart_devmode==true){ajaxart.quickrun('bart_dt.InspectInfra',element);}
if(event.keyCode==88&&ajaxart_altPressed&&ajaxart_devmode==true){var element=(typeof(event.target)=='undefined')?event.srcElement:event.target;ajaxart.quickrun('xtml_dt.GlobalOpenAAEditor',element);}
if(event.keyCode==48&&event.ctrlKey&&ajaxart_devmode==true){var element=(typeof(event.target)=='undefined')?event.srcElement:event.target;ajaxart.quickrun('xtml_dt.CssCustomize',element);}});jQuery(document).keyup(function(event){ajaxart_altPressed=false;});}
ajaxart.urlparam=function(strParamName)
{var strHref=window.location.href;if(strHref.indexOf('#')>-1)strHref=strHref.substr(0,strHref.indexOf("#"));if(strHref.indexOf("?")>-1){var strQueryString=strHref.substr(strHref.indexOf("?")+1);var aQueryString=strQueryString.split("&");for(var iParam=0;iParam<aQueryString.length;iParam++){var aParam=aQueryString[iParam].split("=");if(aParam[0]==strParamName)
return unescape(aParam[1]);}}
return"";}
jBart.show_page=function(params)
{if(!params)return jQuery("<SPAN/>").text("business art - missing params")[0];var error_control=[];var widget_as_xml=aa_ensure_xml(params.widget,"widget xml",error_control);var language=params.language?params.language:"";if(error_control.length)return error_control;var page=params.page?[params.page]:[];ajaxart.load_xtml_content('widget',aa_xpath(widget_as_xml,'bart_dev/db/bart_unit/bart_unit')[0]);var out=aa_run_component("jbart_api.ShowWidget",[],aa_ctx(ajaxart.newContext(),{Language:[language]}),{WidgetXml:[widget_as_xml],Page:page});aa_register_document_events();if(out.length==0)return null;jQuery(out[0]).addClass('ajaxart');if(language=="hebrew")
jQuery(out[0]).addClass('right2left');return out[0];}
function aa_index_of_element(elem)
{var parent=elem.parentNode;var count=0;for(var i=0;i<parent.childNodes.length;i++)
{var brother=parent.childNodes.item(i);if(brother.nodeType==1&&brother.tagName==elem.tagName)
{count++;if(brother==elem)return count;}}
return 0;}
function aa_hide(elem)
{elem.style.display='none';elem.display='none';}
function aa_addOnAttach(elem,func)
{jQuery(elem).addClass('aa_onattach');elem.OnAttach=func;}
function aa_clear_cntr_items(list_top)
{var prev=null,iter=list_top.firstChild;while(prev!=null||iter!=null){if(prev&&prev.className&&prev.className.indexOf('aa_item')>-1)
prev.parentNode.removeChild(prev);prev=iter;if(iter)iter=iter.nextSibling;}}
function ajaxart_uiaspects_incrementalBuild(cntr,context,items_data,all_elems,chunkTimeLimit,timeLimit,show_incremental)
{var incrementalBuilder={start:function(){if(cntr.ItemText)
{timeLimit=Math.floor(timeLimit/15);chunkTimeLimit=Math.floor(chunkTimeLimit/3);}
var top=ajaxart_find_aa_list(cntr);if(!top)return;this.startTime=new Date().getTime();if(show_incremental)
aa_clear_cntr_items(top);if(cntr.Tree)
{aa_clear_cntr_items(top);for(var i=0;i<items_data.length;i++)
top.appendChild(cntr.createNewElement([items_data[i]],all_elems,context));this.build(items_data.length);return;}
if(cntr.GroupByFields&&cntr.GroupByFields.length>0)
{cntr.DoGroupBy();return;}
this.build(0);},build:function(index){aa_loading(cntr,context);var top=ajaxart_find_aa_list(cntr);if(!top)return;var start=new Date().getTime();var start_index=index;var elems=[];if(!cntr.ShowAll&&cntr.MaxItemsToShow)
var max_length=Math.min(items_data.length,cntr.MaxItemsToShow);else
var max_length=items_data.length;while(new Date().getTime()-start<chunkTimeLimit&&index<max_length&&index-start_index<300)
{var elem=cntr.createNewElement([items_data[index]],all_elems,context);if(elem&&show_incremental)elems.push(elem);index++;}
var newcontext=aa_ctx(cntr.Context,{_Elems:all_elems})
for(var i=0;i<cntr.Aspects.length;i++){ajaxart.trycatch(function(){ajaxart_runMethod([],cntr.Aspects[i],'InitializeElements',newcontext);},function(e){ajaxart.log(e.message,"error");});}
for(var i in elems)top.appendChild(elems[i]);if(index>=max_length||(new Date().getTime()-this.startTime)>timeLimit)
{if(!cntr.Tree&&!show_incremental)
{aa_clear_cntr_items(top);for(var i=0;i<all_elems.length;i++)
top.appendChild(all_elems[i]);}
for(var i=0;i<cntr.PostActors.length;i++){ajaxart.trycatch(function(){ajaxart.runScriptParam([],cntr.PostActors[i].aspect.PostAction,cntr.Context);},function(e){ajaxart.log(e.message,"error");});}
aa_add_partial_suffix(cntr,index,max_length,context);return;}
else
{var nextTimer=function(builder){setTimeout(function(){if(!ajaxart.isattached(cntr.Ctrl))return;if(cntr.IncrementalBuilder===builder)
cntr.IncrementalBuilder.build(index);},1)};}
nextTimer(this);}}
cntr.IncrementalBuilder=incrementalBuilder;cntr.IncrementalBuilder.start();}
function aa_calcCntrQuery(cntr,context)
{var queryKey='';var thead=jQuery(cntr.Ctrl).find('.aatable>thead').slice(0,1);cntr.Query={isObject:true,Filters:[],Aggregators:cntr.Aggregators,SortField:''}
for(var flt in cntr.ExposedFilters)
if(flt!='isObject'){cntr.Query.Filters.push(cntr.ExposedFilters[flt]);queryKey+=flt+',';}
var th=thead.find('>tr>th').filter('.sort_ascending,.sort_descending')[0];if(th!=null){cntr.Query.SortField=th.Field.Id;cntr.Query.SortDirection=jQuery(th).hasClass('sort_ascending')?'ascending':'descending';queryKey+='sort:'+cntr.Query.SortField+":"+cntr.Query.SortDirection;}
var groupby_th=thead.find('>tr>th').filter('.aa_group_by')[0];if(groupby_th!=null){cntr.Query.GroupByFields=[groupby_th.Field];}
cntr.Query.key=queryKey;return cntr.Query;}
function aa_createDataHolderFromCntr(cntr,context)
{var fields=aa_DataviewFields(cntr.Fields);var items=cntr.Items[0].Items||[];var exp=cntr.Dataview_PreFilter?cntr.Dataview_PreFilter.join(' AND '):'';if(cntr.Dataview_PreTextQuery)
exp+=cntr.Dataview_PreTextQuery;var pre_filters=exp?aa_filters_from_expression(exp,fields):[];var filters=[].concat(pre_filters).concat(cntr.ExposedFilters||[]);var wrappers=aa_create_wrappers(items,fields,filters,context);var calculatedFields=aa_CalculatedFields(fields);var dataholder=aa_newDataHolder(wrappers,context);dataholder.UserDataView.Sort=cntr.Dataview_PreSort||[];dataholder.UserDataView.Filters=cntr.ExposedFilters||[];dataholder.Fields=fields;aa_calcFields(dataholder.Wrappers,calculatedFields,dataholder,filters);if(pre_filters[0])
dataholder.newFiltersDataView(pre_filters,[],'pre').CalcFilters();return dataholder;}
function aa_FilterExpression(cntr,filters,data,context)
{var out='';var filters=filters||(cntr.DataHolder&&cntr.DataHolder.UserDataView.Filters);var first=true;for(var i in filters)
{var filter=filters[i];var sqlValue=filter.ToSQLText(filter.rawFilterData);if(sqlValue=='')continue;if(!first)
out+=' AND ';out+=filter.field.Id+" "+filter.op+" '"+sqlValue+"'";first=false;}
if(cntr.ExtraQueryExpression)
out=cntr.ExtraQueryExpression(data,aa_ctx(context,{Exp:[out]}))[0];if(out.indexOf(' AND ')==0)
out=out.substring(5);return out;}
function aa_cntrSortPrefrences(cntr)
{var thead=jQuery(cntr.Ctrl).find('.aatable>thead').slice(0,1);var th=thead.find('>tr>th').filter('.sort_ascending,.sort_descending')[0];if(th!=null)
return[{SortBy:th.Field.Id,SortDirection:jQuery(th).hasClass('sort_ascending')?'ascending':'descending'}]}
function aa_filters_from_expression(exp,fields)
{var filters=[];exp=exp.replace(/^\s*/,"").replace(/\s*$/,"");var filters_txt=exp.split(' AND ');for(var i in filters_txt)
{var txt=filters_txt[i];txt=txt.replace(/^\s*/,"").replace(/\s*$/,"");var fieldId=txt.match(/^[^ ]*/)[0];if(!fieldId)continue;var txt=txt.substring(fieldId.length);var op_parse=txt.match(/^\s*([^\s]*)\s*/);var op=(op_parse&&op_parse[1])||'=';var txt=txt.substring(op_parse[0].length);value=txt.replace(/^\s*/,"").replace(/\s*$/,"");if(value.charAt(0)=='"'||value.charAt(0)=="'")
value=value.substring(1,value.length-1);var field=aa_fieldById(fieldId,fields);if(field)
{filter=aa_create_filter(field,value,op);ajaxart.writevalue(filter.rawFilterData,[value]);if(op.charAt(0)=='<'||op.charAt(0)=='>')
value=op+value;filter.SetFilterData([value]);filters.push(filter);}}
return filters;}
function ajaxart_async_Mark(context,isQuery)
{if(context.vars._AsyncCallback!=null)context.vars._AsyncCallback.marked=true;if(isQuery)context.vars._AsyncIsQuery=true;}
function ajaxart_async_CallBack(data,context)
{if(context.vars._AsyncCallback!=null&&context.vars._AsyncCallback.callBack!=null){var success=context.vars._AsyncCallback.success;if(success==null)success=true;context.vars._AsyncCallback.callBack(data,context,success);}}
function aa_empty(elem)
{var children=[];for(var i=0;i<elem.childNodes.length;i++)children.push(elem.childNodes.item(i));jQuery(elem).empty();for(var i=0;i<children.length;i++)
aa_element_detached(children[i]);aa_clear_virtual_inner_element(elem);}
function aa_show_items(input,field,indexes_to_show,pattern){input.TotalShown+=indexes_to_show.length;var cntr=input.Container;var top=ajaxart_find_list_under_element(input.Container.Ctrl);var elems=[];for(i in indexes_to_show){if(typeof(indexes_to_show[i])=='number')
var item=input.AllItems[indexes_to_show[i]].item;else
var item=indexes_to_show[i];var new_element=cntr.createNewElement([item],elems,cntr.Context);cntr.insertNewElement(new_element,top);}
var newcontext=aa_ctx(cntr.Context,{_Elems:elems,_Cntr:[cntr]});for(var i=0;i<cntr.Aspects.length;i++)
ajaxart_runMethod([],cntr.Aspects[i],'InitializeElements',newcontext);for(var i=0;i<cntr.PostActors.length;i++)
ajaxart.runScriptParam([],cntr.PostActors[i].aspect.PostAction,newcontext);aa_invoke_cntr_handlers(cntr,cntr.ContainerChange,[],cntr.Context);var p1,p2,p3,p4;if(pattern.p1)p1=pattern.p1.substring(1);if(pattern.p2)p2=pattern.p2.substring(1);if(pattern.p3)p3=pattern.p3.substring(1);if(pattern.p4)p4=pattern.p4.substring(1);for(var i in elems){jQuery.each(jQuery(elems[i]).find('.aa_text'),function(){if(p1&&this.innerHTML.toLowerCase().indexOf(p1)!=-1)
this.innerHTML=ajaxart_field_highlight_text(this.innerHTML,p1);if(p2&&this.innerHTML.toLowerCase().indexOf(p2)!=-1)
this.innerHTML=ajaxart_field_highlight_text(this.innerHTML,p2);if(p3&&this.innerHTML.toLowerCase().indexOf(p3)!=-1)
this.innerHTML=ajaxart_field_highlight_text(this.innerHTML,p3);if(p4&&this.innerHTML.toLowerCase().indexOf(p4)!=-1)
this.innerHTML=ajaxart_field_highlight_text(this.innerHTML,p4);});}}
function aa_fire_async_finished()
{setTimeout(function(){for(var i=aa_async_finished_listeners.length-1;i>=0;i--)
aa_async_finished_listeners[i].OnAsyncActionFinished();},1);}
function aa_st()
{var result="";var last_component="";for(var i=0;i<ajaxart.stack_trace.length;i++)
{var comp_node=aa_xtml_path(ajaxart.stack_trace[i],"id",true).split("@id='");if(comp_node.length>1)
comp=comp_node[1].split("'")[0];else
comp=comp_node[0];if(last_component==comp)continue;result+=comp+",";last_component=comp;}
return result;}
ajaxart.text4trace=function(obj,depth,max_depth)
{if(depth==null)depth=0;if(depth>=max_depth)return"...";if(typeof(obj)=="undefined")return"";if(!ajaxart.isArray(obj))obj=[obj];if(typeof(obj)==undefined||obj==null)return"";var out="";if(obj.length>1)out=obj.length+" items : \r\n";ajaxart.each(obj,function(item){if(item==null){return;}
if(typeof(item)=="function")return;if(ajaxart.isxml(item))
{var xml_val="";if(depth+1==max_depth&&item.nodeType==1)
{xml_val=ajaxart.tryShortXmlWithTag(item,"name");if(xml_val==null)xml_val=ajaxart.tryShortXmlWithTag(item,"id")
if(xml_val==null)xml_val=ajaxart.tryShortXmlWithTag(item,"Name")
if(xml_val==null)xml_val="<"+aa_tag(item)+" .../>";xml_val=ajaxart.xmlescape(xml_val);}
else if(item.nodeType==2)
xml_val="@"+item.nodeName+'="'+ajaxart.xmlescape(ajaxart.xml2text(item))+'"';else
xml_val=ajaxart.xmlescape(ajaxart.xml2text(item));if(ajaxart.ishtml(item))
out+="html: "+xml_val;else
out+="xml: "+xml_val;}
else if(ajaxart.isObject(item)){if(depth+1==max_depth){out+="object (";for(i in item)
if(i!="isObject")
out+=i+", ";out=out.substring(0,out.length-2)+")";}
else{out={isObject:true};for(i in item){if(i!="isObject"&&i!="XtmlSource"){var item_trace=ajaxart.text4trace(item[i],depth+1,max_depth);if(item_trace.length>max_depth&&item_trace.substring(0,3)=="xml")
item_trace={isObject:true,xml:item_trace};out[i]=item_trace;}}
return out;}}
else if(typeof(item.script)!="undefined"){out+="script:"+ajaxart.text4trace(item.script,depth+1,max_depth);}
else{out+="text:"+ajaxart.totext(item);}
out+="\r\n";});return out;}
function aa_detach(elem)
{if(elem==null||elem.parentNode==null)return;elem.parentNode.removeChild(elem);aa_element_detached(elem);}
function aa_refresh_cell(cell,context,transition)
{var td=jQuery(cell).hasClass('aa_cell_element')?cell:jQuery(cell).parents('.aa_cell_element')[0];if(td==null)return;var field=td.Field;if(field==null)return;if(field.Refresh)field.Refresh([],context);var field_data=td.FieldData;var item_data=td.ItemData;var cntr=jQuery(td).parents('.aa_container')[0].Cntr;newContext=aa_ctx(context,{_Field:[field],FieldTitle:[field.Title],_Item:item_data,_Cntr:[cntr]});field_data=ajaxart_field_calc_field_data(field,item_data,newContext);if(transition&&td.childNodes.length==1){var oldElem=td.firstChild;while(td.firstChild)td.removeChild(td.firstChild);ajaxart_field_createCellControl(item_data,cntr,td,td.CellPresentation,field,field_data,newContext);var newElem=td.firstChild;td.insertBefore(oldElem,td.firstChild);transition.replace(oldElem,newElem,context);}
else{aa_empty(td);ajaxart_field_createCellControl(item_data,cntr,td,td.CellPresentation,field,field_data,newContext);}
aa_element_attached(td)}
ajaxart.jrootElem=function(elemList)
{var list=elemList.parents();if(list.length>0){var rootItem=list[list.length-1];return jQuery(rootItem);}
return jQuery([]);}
function aa_text_matchesRegex(str,pattern){return str.search("^("+pattern+")$")!=-1;}
ajaxart.splitCommasForAggregatorParams=function(params_str)
{if(!params_str)return[];var out=[];var single_quot=false;var double_quot=false;var last_index=0;for(var i=0;i<params_str.length;i++){if(params_str.charAt(i)=='"')
double_quot=!double_quot;else if(params_str.charAt(i)=="'")
single_quot=!single_quot;else if(params_str.charAt(i)==","&&!single_quot&&!double_quot){var param=params_str.substring(last_index,i);out.push(param);last_index=i+1;}}
out.push(params_str.substring(last_index));for(var j=0;j<out.length;j++){if(out[j].length>=2&&out[j].charAt(0)=="'"&&out[j].charAt(out[j].length-1)=="'")
out[j]=out[j].substring(1,out[j].length-1);if(out[j].length>=2&&out[j].charAt(0)=='"'&&out[j].charAt(out[j].length-1)=='"')
out[j]=out[j].substring(1,out[j].length-1);}
return out;}
function ajaxart_filter_array(array,filter,context)
{var out=[];var arg1P=filter.substring(0,filter.indexOf('='));var arg2P=filter.substring(filter.indexOf('=')+1);var argFunc=function(arg){if(arg.charAt(0)=="'"){var val=arg.substring(1,arg.length-1);var valFunc=function(val){return function(item){return val;}};return valFunc(val);}
return function(item){if(item[arg]==null)return"";return ajaxart.totext(item[arg]);}}
var arg1F=argFunc(arg1P);var arg2F=argFunc(arg2P);for(var i=0;i<array.length;i++){var item=array[i];if(arg1F(item)==arg2F(item))
out.push(item);}
return out;}
function aa_showProgressIndicator(context,autoHide)
{if(context.vars._BartContext&&aa_tobool(context.vars._BartContext.HideServerProgress))return;aa_showIndicator=true;jQuery(context.vars.ControlElement).addClass('aa_loading');setTimeout(function(){if(!aa_showIndicator)return;var newtext=ajaxart_multilang_text(aa_totext(context.vars.ProgressIndicationText),context);if(newtext=="")newtext="loading...";var jIndicator=jQuery('.aa_progress_indicator');if(!jIndicator.hasClass('right2left')&&ajaxart_language(context)=='hebrew')
jIndicator.addClass('right2left')
jIndicator.find('.aa_progress_indicator_text').html(newtext);jIndicator.show();if(autoHide)
{setTimeout(function(){aa_hideProgressIndicator(context);},3000);}},300);}
ajaxart.ready_func=function(){if(ajaxart.urlparam('debugmode')=="true")ajaxart.debugmode=true;if(ajaxart.isChrome)jQuery("body").addClass('chrome');var scriptXml=ajaxart.parsexml(script);if(data==null)data=[""];var context=ajaxart.newContext();if(language!=null)
ajaxart.setVariable(context,"Language",language);var result=ajaxart.run(data,scriptXml,"",context);var div=jQuery(divId).addClass("ajaxart ajaxart_topmost");ajaxart.databind([div[0]],data,context,scriptXml,data);if(div.length>0&&result.length>0)
div[0].appendChild(result[0]);aa_element_attached(result[0]);aa_register_document_events();var loading=jQuery("#ajaxart_loading");if(loading.length>0&&!loading[0].IsUsed)
loading.hide();}
undefined
ajaxart.ajaxart_clean_ns=function(xmltext)
{xmltext=xmltext.replace(new RegExp('<[A-Za-z0-9_]*:','g'),'<');xmltext=xmltext.replace(new RegExp('</[A-Za-z0-9_]*:','g'),'</');xmltext=xmltext.replace(new RegExp('xmlns[a-zA-Z0-9_:"\'=/.-]*','g'),'');xmltext=xmltext.replace(new RegExp('[A-Za-z0-9_]*:([A-Za-z0-9_]*)="','g'),'$1="');return xmltext;}
ajaxart.body_contents_of_soap_envelope=function(envelope)
{for(var i=0;i<envelope.childNodes.length;i++)
{var node=envelope.childNodes.item(i);if(node.nodeType==1&&aa_tag(tagName).toLowerCase()=='body'){for(var j=0;j<node.childNodes.length;j++)
{var innernode=node.childNodes.item(i);if(innernode.nodeType==1)return innernode;}}}
return envelope;}
function aa_run_component(id,input,context,params)
{var xtmlElem=ajaxart.componentsXtmlCache[id];if(xtmlElem==null)
{try
{var middlePos=id.indexOf('.');var ns=id.substring(0,middlePos);var compName=id.substr(middlePos+1);if(ajaxart.components[ns]==null){ajaxart.log("cannot find component "+id,"error");return[];}
var global=ajaxart.components[ns][compName];if(!global)
{ajaxart.log("cannot find component "+id,"error");return[];}
if(global.getAttribute('execution')=='native'){xtmlElem=ajaxart.componentsXtmlCache[id]={execution:'native'}
xtmlElem.profile=ajaxart.parsexml('<xtml t=""/>');xtmlElem.gc=ajaxart.gcs[ns][compName];}
else
xtmlElem=ajaxart.componentsXtmlCache[id]=ajaxart.childElem(global,"xtml");}
catch(e){return[];}}
if(xtmlElem==null)return[];if(xtmlElem.execution=='native'){return xtmlElem.gc(xtmlElem.profile,input,context);}
var newContext={};newContext.vars=context.vars;newContext.componentContext=context.componentContext;newContext.params=[];var defaultProfs=ajaxart.xml.xpath(xtmlElem.parentNode,'Param/Default');for(var i=0;i<defaultProfs.length;i++){var val=ajaxart.run(input,defaultProfs[i],'',context);var name=defaultProfs[i].parentNode.getAttribute('name');if(name!=null&&name!="")
newContext.params[name]=val;}
for(var j in params)newContext.params[j]=params[j];return ajaxart.run(input,xtmlElem,'',newContext);}
ajaxart.quickrun=function(component,input){var data=[];if(typeof(input)!="undefined")data=[input];var profile=ajaxart.parsexml('<xtml t="'+component+'" />');return aa_first(data,profile,'',ajaxart.newContext());}
function aa_ensure_xml(item,name,error_control){if(item.nodeType==9)return item.documentElement;if(ajaxart.isxml_item(item))return item;var errors=[];if(typeof(item)=='object')
item=aa_JSON2Xml(item,'Top');else if(!item.match(/\W*</))
item=aa_JSON2Xml(eval('aa_dummy = '+item),'Top');var xml=ajaxart.parsexml(item,"",errors);if(item!=""&&item&&xml==null){error_control.push(jQuery("<SPAN/>").text("business art - error parsing "+name+", "+item.substring(0,10)+"... :"+((errors.length)?errors[0]:""))[0]);return null;}
return xml;}
function aa_loading(cntr,context)
{cntr.PartialView={isObject:true,Loading:true,RemoveSummary:function(cntr)
{var header_footer=jQuery(cntr.Ctrl).find('>.aa_container_footer');var summary=header_footer.find('.PartialViewSummary');summary.remove();aa_fire_async_finished();}}
var header_footer=jQuery(cntr.Ctrl).find('>.aa_container_footer');var summary=header_footer.find('.PartialViewSummary');if(summary.find('.aa_show_all_items').length>0)
{summary.remove();summary=header_footer.find('.PartialViewSummary');}
if(summary.length==0)
{summary=jQuery('<div class="PartialViewSummary"></div>');header_footer.append(summary);}
var loading=summary.find('>.aa_loading');if(loading.length==0)
{loading=jQuery('<span class="aa_loading">'+ajaxart_multilang_text('loading ',cntr.Context)+'</span>');summary.append(loading);}
loading.text(loading.text()+'.');}
function aa_add_partial_suffix(cntr,shownItems,totalItems,context)
{if(cntr.PartialView&&cntr.PartialView.RemoveSummary)
cntr.PartialView.RemoveSummary(cntr);if(shownItems==totalItems)return;cntr.PartialView={isObject:true,From:0,ShownItems:shownItems,TotalItems:totalItems}
var header_footer=jQuery(cntr.Ctrl).find('>.aa_container_footer');var summary=header_footer.find('.PartialViewSummary');if(summary.length==0)
{summary=jQuery('<div></div>');summary.addClass('PartialViewSummary');header_footer.append(summary);}
cntr.PartialView.ShowAll=function(){cntr.PartialView.RemoveSummary(cntr);aa_recalc_filters_and_refresh(cntr,[],context,true);}
var show_all_items=jQuery('<span class="aa_show_all_items">'+ajaxart_multilang_text('show all items',cntr.Context)+'</span>');show_all_items.click(function(){cntr.PartialView.ShowAll()});summary.text(cntr.PartialView.ShownItems+' '+ajaxart_multilang_text('of',cntr.Context)+' '+cntr.PartialView.TotalItems);summary.append(show_all_items);cntr.PartialView.RemoveSummary=function(cntr)
{var header_footer=jQuery(cntr.Ctrl).find('>.aa_container_footer');var summary=header_footer.find('.PartialViewSummary');summary.remove();}}
function aa_DataviewFields(fields)
{var result=[];for(var i in fields)
if(!fields[i].HeaderFooter&&!fields[i].IsGroup)
result.push(fields[i]);return result;}
function aa_create_wrappers(items,fields,filters,context)
{var result=[];if(items.length>0&&items[0].__hiddenForView)
return items;for(var i in items)
{var item=items[i];var wrapper={isObject:true,__item:item,__hidden:false,__FilterResults:{},__hiddenForView:{},__OriginalIndex:i};for(var j in fields)
{var field=fields[j];var txt=field.ItemToText?field.ItemToText(item):ajaxart.totext_array(ajaxart_field_calc_field_data(field,[item],context));wrapper[field.Id]=field.SortValFunc?field.SortValFunc(txt):txt;if(field.Options&&field.Options.codeToText)
wrapper['__text_'+field.Id]=field.Options.codeToText(wrapper[field.Id]);}
for(var j in filters)
{var filter=filters[j];if(filter&&filter.PrepareElemCache)
filter.PrepareElemCache(filter.field,wrapper);}
result.push(wrapper);}
return result;}
function aa_CalculatedFields(fields)
{var result=[];for(var i in fields)
if(fields[i].WrapperToValue)
result.push(fields[i]);return result;}
function aa_newDataHolder(wrappers,context)
{var dataHolder={isObject:true,idGen:0,groupIdGen:0,Context:context,UserDataView:{isObject:true,Id:'user',Filters:[],CalcFilters:function(){return aa_calcFilters(this)},CalcResults:function(){return aa_calcResults(this)}},Wrappers:wrappers,newFiltersDataView:function(filters,sort,id)
{var dataview={isObject:true,dataholder:this,Id:id||this.idGen++,Filters:filters,Sort:sort,CalcFilters:function(){return aa_calcFilters(this)},CalcResults:function(){return aa_calcResults(this)}}
return dataview;},newGroupBy:function(filtersBefore,groupByFieldIds,otherFieldsGen)
{var dataview={isObject:true,dataholder:this,Id:'group_'+this.groupIdGen++,Filters:filtersBefore,Sort:[],CalcFilters:function(){return aa_calcFilters(this)},CalcResults:function(){return aa_calcResults(this)}}
aa_calcFilters(dataview);var groupByFields=[];var ids=groupByFieldIds.split(',');for(var i in ids)
{var field=aa_fieldById(ids[i],this.Fields);if(field)
groupByFields.push(field);}
var groups=aa_calc_groups(dataview,this.Wrappers,groupByFields,this.Context);var groups_dataholder=aa_newDataHolder(groups,dataview.dataholder.Context);var otherFields=otherFieldsGen(groups);groups_dataholder.Fields=groupByFields.concat(otherFields);var calculatedFields=[];for(var i in otherFields)
if(!otherFields[i].IsVirtualGroup)
calculatedFields.push(otherFields[i]);aa_calcFields(groups_dataholder.Wrappers,calculatedFields,groups_dataholder,[]);return groups_dataholder;}}
dataHolder.UserDataView.dataholder=dataHolder;return dataHolder;}
function aa_calcFields(wrappers,calculatedFields,dataHolder,filters)
{if(calculatedFields.length==0)return;var prev_wrapper=null;for(var i in wrappers)
{var wrapper=wrappers[i];for(var j in calculatedFields)
{var fld=calculatedFields[j];if(fld.Id==''||fld.CalcSequence)continue;var item=wrapper.__item;wrapper[fld.Id]=aa_CalcValueFromWrapper(wrapper,fld,prev_wrapper);if(ajaxart.isxml(item)&&wrapper[fld.Id])
item.setAttribute(fld.Id,wrapper[fld.Id]);else if(item&&item.isObject&&wrapper[fld.Id])
item[fld.Id]=wrapper[fld.Id];}
prev_wrapper=wrapper;}
var relevant_filters=[];for(var j in calculatedFields)
{var fld=calculatedFields[j];if(fld.Id!=''&&fld.CalcSequence)
fld.CalcSequence(wrappers,dataHolder);for(var k in filters)
if(filters[k].field.Id==fld.Id)relevant_filters.push(filters[k]);}
for(var i in relevant_filters)
for(var j in wrappers)
relevant_filters[i].PrepareElemCache(relevant_filters[i].field,wrappers[j]);}
function aa_fieldById(id,fields)
{if(fields)
for(var i=0;i<fields.length;i++)
if(fields[i].Id==id)return fields[i];}
function aa_create_filter(field,filterValue,op)
{var op=op||'=';if(!field.newFilter)return;var filterData=ajaxart_writabledata();if(filterValue)
ajaxart.writevalue(filterData,[filterValue]);var filter=field.newFilter(filterData);filter.rawFilterData=filterData;filter.field=field;filter.Id=field.Id+'_'+op;filter.op=op;return filter;}
ajaxart.tryShortXmlWithTag=function(xml,attrName)
{if(aa_hasAttribute(xml,attrName))
return"<"+aa_tag(xml)+" "+attrName+'="'+xml.getAttribute(attrName)+'" .../>';}
function aa_hideProgressIndicator(context)
{aa_showIndicator=false;jQuery(context.vars.ControlElement).removeClass('aa_loading');jQuery('.aa_progress_indicator').hide();aa_fire_async_finished();}
function ajaxart_language(context)
{if(context.vars.Language==null||context.vars.Language.length==0)return"";return ajaxart.totext(context.vars.Language[0]);}
function aa_JSON2Xml(obj,tag)
{var result='<'+tag;var inner_tag;var isArray=obj[0]&&(!(typeof(obj)=='string'));if(isArray)
{inner_tag=tag.substring(0,tag.length-1);if(tag.match(/ies$/))
inner_tag=tag.substring(0,tag.length-3)+'y';var array_of_strings=true;for(var att in obj)
if(!(typeof(obj[att])=='string'||typeof(obj[att])=='number'||typeof(obj[att])=='boolean'))
array_of_strings=false;if(array_of_strings)
{result+='>';for(var i in obj)
result+='<'+inner_tag+'>'+ajaxart.xmlescape(''+obj[i])+'</'+inner_tag+'>';result+='</'+tag+'>';return result;}}
for(var att in obj)
if(typeof(obj[att])=='string'||typeof(obj[att])=='number'||typeof(obj[att])=='boolean')
result+=' '+att+"='"+ajaxart.xmlescape(''+obj[att])+"'";result+='>';for(var i in obj)
if(typeof(obj[i])!='string'&&typeof(obj[i])!='number'&&typeof(obj[i])!='boolean')
result+=aa_JSON2Xml(obj[i],inner_tag||i);result+='</'+tag+'>';return result;}
function aa_calcFilters(dataview)
{var id=dataview.Id;var wrappers=dataview.dataholder.Wrappers;for(var i in wrappers)
{var wrapper=wrappers[i];wrapper.__hiddenForView[id]=false;for(var j in dataview.Filters)
{var filter=dataview.Filters[j];var res=filter.Match(filter.field,wrapper);if(res==false)
wrapper.__hiddenForView[id]=true;}}}
function aa_calcResults(dataview)
{var id=dataview.Id;var result={isObject:true,Items:[],query:dataview}
var items=result.Items;var wrappers=dataview.dataholder.Wrappers;for(var i in wrappers)
{var wrapper=wrappers[i];if(!wrapper.__hiddenForView[id]&&!wrapper.__hiddenForView.user&&!wrapper.__hiddenForView.pre)
items.push(wrapper);}
if(dataview.Sort)
aa_sort_dataview(items,dataview.Sort);return[result];}
function aa_calc_groups(dataview,wrappers,groupByFields,context)
{var field=groupByFields[0];if(!field)return[];if(groupByFields.length>1)
{var id='';for(var i in groupByFields)
id+='__'+groupByFields[i].Id;for(var i in wrappers)
{var wrapper=wrappers[i];var val='';for(var j in groupByFields)
val+='__'+wrapper[groupByFields[j].Id];wrapper[id]=val;}
field={Id:id};}
var groupby_table=aa_groupItems(field,wrappers,dataview);var group_items=[];if(field.Options||field.Ranges)
{function SubOptions(category)
{if(!category)return null;return category.Categories?category.Categories.concat(category.Options):category.Options;}
function OptionsToGroups(options)
{var result=[]
for(var i in options)
{var option=options[i];var groupName=option.code||option.text;var groupWrappers=groupby_table[groupName]?groupby_table[groupName]:[];var group={isObject:true,Name:groupName,Id:aa_string2id(groupName),Title:field.OptionLabel?field.OptionLabel([groupName])[0]:groupName,Items:aa_sort_dataview(groupWrappers,dataview.Sort),Count:groupWrappers.length,FetchItems:function(){var result=[];var subGroups=this.SubGroups;for(var g in subGroups)
result=result.concat(subGroups[g].FetchItems());result=result.concat(this.Items);return result;},__hiddenForView:{},SubGroups:option.IsCategory?OptionsToGroups(SubOptions(option)):null}
if(group.Items.length>0)
for(var j in groupByFields){if(!groupByFields[j].Multiple)
group[groupByFields[j].Id]=group.Items[0][groupByFields[j].Id];else
group[groupByFields[j].Id]=groupName;}
result.push(group);}
return result;}
group_items=OptionsToGroups(SubOptions(field.Options)||field.Ranges);}
if(!field.Options&&!field.Ranges)
for(var groupName in groupby_table)
if(groupName!='isObject'&&groupName!='__Size')
{var group={isObject:true,Name:groupName,Id:aa_string2id(groupName),__hiddenForView:{},Title:field.OptionLabel?field.OptionLabel([groupName])[0]:groupName,Items:aa_sort_dataview(groupby_table[groupName],dataview.Sort),Count:groupby_table[groupName].length,FetchItems:function(){return this.Items}}
if(group.Items.length>0)
for(var j in groupByFields)
group[groupByFields[j].Id]=group.Items[0][groupByFields[j].Id];group_items.push(group);}
return group_items;}
function aa_CalcValueFromWrapper(wrapper,field,prev_wrapper)
{try
{if(field.WrapperToValue)
return field.WrapperToValue(wrapper,prev_wrapper);if(field.ItemToText&&wrapper.__item)
return field.ItemToText(wrapper.__item);if(field.FieldData&&wrapper.__item)
{var item=wrapper.__item;var txt=field.ItemToText?field.ItemToText(item):ajaxart.totext_array(ajaxart_field_calc_field_data(field,[item],context));return field.SortValFunc?field.SortValFunc(txt):txt;}}catch(e){}
return[];}
function ajaxart_writabledata()
{return ajaxart.xml.xpath(ajaxart.parsexml('<xml val="" />'),'@val');}
function aa_sort_dataview(wrappers,sort)
{if(!sort||sort.length==0)return wrappers;if(sort.length==1)
{var fieldId=sort[0].SortBy;for(var i in wrappers)
wrappers[i].__Val=wrappers[i]['__text_'+fieldId]||wrappers[i][fieldId];if(sort[0].SortDirection=='ascending')
wrappers.sort(function(a,b){return a.__Val>b.__Val?1:-1;});else
wrappers.sort(function(a,b){return a.__Val<b.__Val?1:-1;});}
else
{function compare(wrapperA,wrapperB)
{for(var i in sort)
{var sortElem=sort[i];var fld=sortElem.SortBy;if(wrapperA[fld]==wrapperB[fld])continue;if(sortElem.SortDirection=='ascending')
return wrapperA[fld]>wrapperB[fld]?1:-1;else
return wrapperA[fld]<wrapperB[fld]?1:-1;}}
wrappers.sort(compare);}
return wrappers;}
function aa_groupItems(field,wrappers,dataview)
{var table={isObject:true}
var OccOfCategory=function(table,category)
{var code=category.code;if(table[code])return table[code];var occ=[];for(var i=0;i<category.Options.length;i++)
occ=occ.concat(table[category.Options[i].code]||[]);for(var i=0;i<category.Categories.length;i++)
occ=occ.concat(OccOfCategory(table,category.Categories[i]));table[code]=occ;return occ;}
table.__Size=0;var dataviewId=dataview?dataview.Id:null;for(var i in wrappers)
{var wrapper=wrappers[i];if((dataviewId&&wrapper.__hiddenForView[dataviewId])||wrapper.__hiddenForView.user)
continue;table.__Size++;var val=wrapper[field.Id];if(field.Multiple){var vals=val.split(',');for(j=0;j<vals.length;j++){var val2=vals[j];if(table[val2]==null)table[val2]=[wrapper];else table[val2].push(wrapper);}}else{if(table[val]==null)table[val]=[wrapper];else table[val].push(wrapper);}}
if(field.Options&&field.Options.Categories)
for(var i=0;i<field.Options.Categories.length;i++)
OccOfCategory(table,field.Options.Categories[i]);return table;}
aa_gcs("yesno",{Not:function(profile,data,context)
{var result=aa_bool(data,profile,'Of',context);if(result==false)
return["true"];else
return[];},EqualsTo:function(profile,data,context)
{var to=ajaxart.run(data,profile,'To',context);if(to.length==0&&data.length==0)return["true"];if(to.length==0||data.length==0)return[];var to_comp=to[0];var data_comp=data[0];if(ajaxart.yesno.itemsEqual(to_comp,data_comp))return["true"];return[];},Empty:function(profile,data,context)
{return ajaxart.yesno.is_empty(data,aa_bool(data,profile,'CheckInnerText',context));},ItemsEqual:function(profile,data,context)
{var item1=ajaxart.run(data,profile,'Item1',context);var item2=ajaxart.run(data,profile,'Item2',context);if(item1.length==0&&item2.length==0)return["true"];if(item1.length==0||item2.length==0){var item=(item1.length>0)?item1:item2;if(ajaxart.yesno.itemsEqual(item[0],""))return["true"];else return[];}
if(ajaxart.yesno.itemsEqual(item1[0],item2[0]))return["true"];return[];},IsEmpty:function(profile,data,context)
{var val=ajaxart.run(data,profile,'Value',context);var checkInner=aa_bool(data,profile,'CheckInnerText',context);return ajaxart.yesno.is_empty(val,checkInner);},PassesFilter:function(profile,data,context)
{return ajaxart.make_array(data,function(item){if(!aa_bool(item,profile,'Filter',context))
return null;return item;});},Contains:function(profile,data,context)
{var ignoreCase=aa_bool(data,profile,'IgnoreCase',context);var ignoreOrder=aa_bool(data,profile,'IgnoreOrder',context);var oneOf=aa_bool(data,profile,'OneOf',context);var allText=ajaxart.run(data,profile,'AllText',context);var data_text="";if(ajaxart.isxml(allText))
data_text=ajaxart.xml2text(allText);else
data_text=ajaxart.totext(allText);var text_items=ajaxart.runsubprofiles(data,profile,'Text',context);var startIndex=0;if(data_text==null||text_items.length==0)return[];if(ignoreCase)data_text=data_text.toLowerCase();for(var i=0;i<text_items.length;i++)
{var text=text_items[i];if(ignoreCase)text=text.toLowerCase();var new_index=data_text.indexOf(text,startIndex);if(!oneOf&&new_index==-1)return[];if(oneOf&&new_index!=-1)return['true'];startIndex=new_index+text.length;if(ignoreOrder||oneOf)startIndex=0;};if(oneOf)return[];return['true'];},OR:function(profile,data,context)
{var subprofiles=ajaxart.subprofiles(profile,'Item');for(var i=0;i<subprofiles.length;i++)
{if(aa_bool(data,subprofiles[i],"",context))
return["true"];};return[];},And:function(profile,data,context)
{var subprofiles=ajaxart.subprofiles(profile,'Item');for(var i=0;i<subprofiles.length;i++)
{if(!aa_bool(data,subprofiles[i],"",context))
return[];};return["true"];},NotEmpty:function(profile,data,context)
{var value=ajaxart.run(data,profile,'Value',context);var check=aa_bool(data,profile,'CheckInnerText',context);var result=ajaxart.yesno.is_empty(value,check);if(result==true||result[0]=='true')return[];return['true'];}});aa_gcs("xtml",{UseAndTranslateParam:function(profile,data,context)
{var param=aa_text(data,profile,'Param',context);var input=ajaxart.run(data,profile,'Input',context);var paramScript=context.params[param];if(ajaxart.isArray(paramScript))
return paramScript;if(paramScript==null||paramScript.script==null)return[];if(paramScript.compiled=="same")return input;var newContext={};newContext.vars=context.vars;newContext.params=context.componentContext.params;newContext.componentContext=context.componentContext.componentContext;if(paramScript.script.nodeType==2)
return ajaxart_multilang_run(input,paramScript.script,'',newContext);if(paramScript.compiled==null)
return ajaxart.run(input,paramScript.script,"",newContext);else
return paramScript.compiled(input,newContext);},Params:function(profile,data,context)
{var out={isObject:true};var elem=profile.firstChild;while(elem!=null)
{if(elem.nodeType==1)
{var tag=elem.tagName;var name=elem.getAttribute('name');if(name==null||name==""){elem=elem.nextSibling;continue;}
if(tag=='Param'){out[name]=ajaxart.run(data,elem,'',context);}else if(tag=='ScriptParam'){out[name]={script:elem,context:context,compiled:ajaxart.compile(elem,'',context,elem.getAttribute("paramVars"))};}else if(tag=='Method'){out[name]={script:elem,context:context,objectForMethod:[out],compiled:ajaxart.compile(elem,'',context,elem.getAttribute("paramVars"))};}else if(tag=='ScriptParamArray'){var scriptArr=ajaxart.run(data,elem,'',context);var value=[];for(var j=0;j<scriptArr.length;j++)
value.push({script:scriptArr[j],context:context.componentContext});out[name]=value;}}
elem=elem.nextSibling;}
return[out];},UseParamArray:function(profile,data,context)
{var param=aa_text(data,profile,'Param',context);var paramScript=context.params[param];if(ajaxart.isArray(paramScript))
return paramScript;var newContext={};newContext.vars=context.vars;newContext.params=context.componentContext.params;newContext.componentContext=context.componentContext.componentContext;return ajaxart.runsubprofiles(data,paramScript.script,paramScript.field,newContext);},ComponentDefinition:function(profile,data,context)
{return ajaxart.make_array(data,function(item){var id=aa_text(item,profile,'ID',context);if(id=="")
return null;var toXtml=aa_bool(item,profile,'ToXtml',context);try{var middlePos=id.indexOf('.');var ns=id.substring(0,middlePos);var compName=id.substr(middlePos+1);if(ajaxart.components[ns]==null)return[];var global=ajaxart.components[ns][compName];}catch(e){ajaxart.log("ComponentDefinition: cannot find component "+id);return[];}
if(toXtml)
return ajaxart.childElem(global,"xtml");else
return global;},true);},UseParam:function(profile,data,context)
{var param=aa_text(data,profile,'Param',context);var input=ajaxart.run(data,profile,'Input',context);var paramScript=context.params[param];if(ajaxart.isArray(paramScript))
return paramScript;if(paramScript==null||paramScript.script==null)
return[];if(paramScript.compiled=="same")return input;var newContext={params:[]};newContext.vars=context.vars;if(context.componentContext){newContext.params=context.componentContext.params;newContext.componentContext=context.componentContext.componentContext;}
if(paramScript.compiled==null)
return ajaxart.run(input,paramScript.script,"",newContext);else
return paramScript.compiled(input,newContext);},RunXtml:function(profile,data,context)
{var xtml=ajaxart.run(data,profile,'Xtml',context);if(xtml.length==0)return[];var method="";if(aa_hasAttribute(profile,'Method')||ajaxart.childElem(profile,'Method')!=null)
method=aa_text(data,profile,'Method',context);var field="";if(aa_hasAttribute(profile,'Field'))
field=aa_text(data,profile,'Field',context);var input=data;if(aa_hasAttribute(profile,'Input')||ajaxart.childElem(profile,'Input')!=null)
input=ajaxart.run(data,profile,'Input',context);if(typeof(xtml[0].script)!="undefined"||xtml[0].compiled!=null)
{if(typeof(xtml[0].input)!="undefined")
if(!aa_bool(data,profile,'ForceInputParam',context))
input=xtml[0].input;if(xtml[0].compiled=="same")return input;var newContext=ajaxart.newContext();if(xtml[0].context!=null){newContext.params=xtml[0].context.params;newContext.componentContext=xtml[0].context.componentContext;}
newContext.vars=context.vars;if(typeof(xtml[0].objectForMethod)!='undefined')
newContext._This=xtml[0].objectForMethod[0];if(xtml[0].compiled==null){if(xtml[0].script==null)return null;return ajaxart.run(input,xtml[0].script,field,newContext,method);}
else
return xtml[0].compiled(input,newContext);}
if(!ajaxart.isxml(xtml[0])){var result=ajaxart.dynamicText(input,aa_totext(xtml),context,null,false);return[result];}
var newContext={};newContext.vars=context.vars;newContext.componentContext=context.componentContext;newContext.params=[];return ajaxart.run(input,xtml[0],field,newContext,method);},XtmlOfParamArray:function(profile,data,context)
{var param=aa_text(data,profile,'Param',context);var paramScript=context.params[param];if(ajaxart.isArray(paramScript))return[];return aa_xpath(paramScript.script,param);},ComponentsOfType:function(profile,data,context)
{if(!window.ajaxart_comp_of_type_cache){ajaxart_comp_of_type_cache={};ajaxart_comp_of_type_advanced_cache={};for(var i in ajaxart.components){var advanced=false;if(i.lastIndexOf("_dt")==i.length-3&&i.length>3||i=="aaeditor")advanced=true;for(var j in ajaxart.components[i]){var comp=ajaxart.components[i][j];if(comp.getAttribute('hidden')=='true')continue;var types=(comp.getAttribute('type')||'').split(',');var category=comp.getAttribute('category');if(category)types.push(types[0]+'.'+category);for(var t in types)
{var type=types[t];if(!advanced){if(ajaxart_comp_of_type_cache[type]==null)ajaxart_comp_of_type_cache[type]=[];ajaxart_comp_of_type_cache[type].push(""+i+"."+j);}
else{if(ajaxart_comp_of_type_advanced_cache[type]==null)ajaxart_comp_of_type_advanced_cache[type]=[];ajaxart_comp_of_type_advanced_cache[type].push(""+i+"."+j);}}}}}
var type=aa_text(data,profile,'Type',context);var out=ajaxart_comp_of_type_cache[type];if(aa_bool(data,profile,'ForAllTypes',context)){ajaxart.concat(out,ajaxart_comp_of_type_advanced_cache[type]);ajaxart.concat(out,ajaxart_comp_of_type_cache["*"]);}
if(out==null)out=[];return out;}});aa_gcs("xml",{Update:function(profile,data,context){var inputForChanges=ajaxart.getVariable(context,"InputForChanges");var newValue=ajaxart.run(inputForChanges,profile,'NewValue',context);ajaxart.writevalue(data,newValue);return data;},Xml:function(profile,data,context){var dynamicContent=aa_bool(data,profile,'DynamicContent',context);var child=ajaxart.childElem(profile,"*");if(child==null)
return[aa_createElement(data[0],'xml')];if(!dynamicContent)
{return[ajaxart.xml.clone([child])];}
else{var text=ajaxart.xml2text(child);var newxml_text=ajaxart.dynamicText(data,text,context,data,false,true)[0];var out=ajaxart.parsexml(newxml_text);if(out!=null)return[out];return[];}},InnerText:function(profile,data,context){var out=[];ajaxart.each(data,function(item){if(!ajaxart.isxml(item)){return[];}
if(item.nodeType==2)return[item];var text_node=item.firstChild;if(text_node==null){text_node=item.ownerDocument.createTextNode("");item.appendChild(text_node);}
out.push(text_node);});return out;},Tag:function(profile,data,context){var removeNamespace=aa_bool(data,profile,'RemoveNamespace',context);if(!ajaxart.isxml(data))return[];var xml=data[0];if(xml.nodeType==2){if(xml.parentNode==null)return[];xml=ajaxart.xml.xpath(xml,'..')[0];}
var tag=aa_tag(xml);if(removeNamespace)
return[tag.replace(/.*:/,"")];else
return[tag];return[];},Wrap:function(profile,data,context){if((!ajaxart.isxml(data))||data[0].nodeType==9){return[];}
var headtag=aa_text(data,profile,'HeadTag',context);var head=aa_first(data,profile,'Head',context);if(head==null){if(headtag=="")return[];head=aa_createElement(data[0],headtag);}
if(!ajaxart.ishtml(data))
{for(var i=0;i<data.length;i++)
ajaxart.xml.append(head,data[i].cloneNode(true));}
else
{for(var i in data)
ajaxart.xml.append(head,data[i]);}
return[head];},AttributeName:function(profile,data,context)
{if(ajaxart.isxml(data)&&data[0].nodeType==2)
return[data[0].nodeName];return[];},SetAttribute:function(profile,data,context)
{var inputForChanges=ajaxart.getVariable(context,"InputForChanges");var newValue=aa_text(inputForChanges,profile,'Value',aa_ctx(context,{_XmlNode:data}));var attrName=aa_text(inputForChanges,profile,'AttributeName',context);if(attrName==""){return;}
var removeEmptyAttribute=aa_bool(data,profile,'RemoveEmptyAttribute',context);var changed=false;for(var i=0;i<data.length;i++){var xml=data[i];if(!ajaxart.isxml(xml)||xml.nodeType!=1)
return;if(newValue!=""&&xml.getAttribute(attrName)==newValue)continue;if(newValue!="")
xml.setAttribute(attrName,newValue);else{if(aa_bool(data,profile,'RemoveEmptyAttribute',context))
xml.removeAttribute(attrName);else
xml.setAttribute(attrName,"");}
changed=true;}
if(changed)ajaxart.xml.xml_changed(data[0]);return[newValue];},Duplicate:function(profile,data,context){var element=ajaxart.run(data,profile,'Element',context);var inputforChanges=ajaxart.getVariable(context,"InputForChanges");var items=ajaxart.run(inputforChanges,profile,'Items',context);var Separator=ajaxart.run(data,profile,'Separator',context);var SeparatorAround=aa_bool(data,profile,'SeparatorAround',context);var bindToSeparator=ajaxart.run(data,profile,'BindToSeparator',context);if(element.length==0||element[0].nodeType!=1)return[];var parent=element[0].parentNode;if(Separator[0]!=null&&SeparatorAround)
{var toAdd=ajaxart.xml.clone(Separator);if(Separator[0].ajaxart!=null)toAdd.ajaxart=Separator[0].ajaxart;parent.appendChild(toAdd);}
var local_context=ajaxart.clone_context(context);for(var i=0;i<items.length;i++){var item=items[i];var new_item=ajaxart.xml.clone(element);ajaxart.setVariable(local_context,"InputForChanges",[item]);ajaxart.setVariable(local_context,"DuplicateIndex",[""+(i+1)]);var changes=ajaxart.subprofiles(profile,'ChangeOnElement');ajaxart.each(changes,function(changeProfile){ajaxart.run([new_item],changeProfile,"",local_context);});if(i==0){var changes=ajaxart.subprofiles(profile,'ChangeOnFirstElement');ajaxart.each(changes,function(changeProfile){ajaxart.run([new_item],changeProfile,"",local_context);});}
parent.appendChild(new_item);if(Separator[0]!=null)
if(i+1<items.length||SeparatorAround)
{var toAdd=ajaxart.xml.clone(Separator);if(Separator[0].ajaxart!=null)toAdd.ajaxart=Separator[0].ajaxart;parent.appendChild(toAdd);}}
parent.removeChild(element[0]);return["true"];},WithChanges:function(profile,data,context){var xml_src=ajaxart.run(data,profile,'Xml',context);var newContext=ajaxart.clone_context(context);ajaxart.setVariable(newContext,"InputForChanges",data);var out=[];ajaxart.each(xml_src,function(item){var xml=item;if(!ajaxart.ishtml(item)&&aa_bool(data,profile,'CloneXml',context))
xml=ajaxart.xml.clone([item]);var changes=ajaxart.subprofiles(profile,'Change');ajaxart.each(changes,function(changeProfile){ajaxart.run([xml],changeProfile,"",newContext);});out.push(xml);});return out;},Attributes:function(profile,data,context)
{var alsoEmpty=aa_bool(data,profile,'AlsoEmpty',context);if(ajaxart.isxml(data)&&data[0].nodeType==1)
{var out=[];var atts=data[0].attributes;if(atts!=null)
for(var i=0;i<atts.length;i++){if(alsoEmpty)out.push(atts.item(i));else if(atts.item(i).nodeValue!="")out.push(atts.item(i));}
return out;}
return[];},AddChildren:function(profile,data,context){var inputForChanges=ajaxart.getVariable(context,"InputForChanges");var children=ajaxart.run(inputForChanges,profile,'Children',context);var clone=aa_bool(inputForChanges,profile,'CloneChildren',context);if(data.length==0)return[];for(var i=0;i<children.length;i++){var item=children[i];if(!clone)
ajaxart.xml.append(data[0],item);else
ajaxart.xml.append(data[0],ajaxart.xml.clone([item]));}
if(children.length>0)ajaxart.xml.xml_changed(data[0]);return data;}});aa_gcs("validation",{PassingValidations:function(profile,data,context)
{var ctrl=aa_first(data,profile,'TopControl',context);return aa_frombool(aa_passing_validations(ctrl));}});aa_gcs("uipref",{SetPrefValue:function(profile,data,context)
{var prefix=aa_text(data,profile,'Prefix',context);var property=aa_text(data,profile,'Property',context);var value=aa_text(data,profile,'Value',context);ajaxart_setUiPref(prefix,property,value,context);return[];},InCookies:function(profile,data,context)
{var obj={isObject:true}
obj.GetProperty=function(data1,ctx){var prefix=aa_totext(ctx.vars.Prefix);var property=aa_totext(ctx.vars.Property);var out=ajaxart.cookies.valueFromCookie(prefix+property);if(out==null)return[];return[out];}
obj.SetProperty=function(data1,ctx){var prefix=aa_totext(ctx.vars.Prefix);var property=aa_totext(ctx.vars.Property);var value=aa_totext(ctx.vars.Value);ajaxart.cookies.writeCookie(prefix+property,value);}
return[obj];}});aa_gcs("uiaspect",{HeaderFooter:function(profile,data,context)
{var aspect={isObject:true};var init=function(aspect){aspect.HeaderFooterID=aa_text(data,profile,'Identifier',context);aspect.ID="headerfooter_"+aa_text(data,profile,'Identifier',context);aspect.refresh=function(data1,ctx)
{var cntr=ctx.vars._Cntr[0];var items=cntr.Items[0].Items||[];var newContext=aa_merge_ctx(context,ctx,{HeaderFooterCntr:cntr,TotalItemsCount:[items.length],FilteredItemsCount:[cntr.FilteredWrappers?cntr.FilteredWrappers.length:items.length]});newContext.vars.HeaderFooterCntr=ctx.vars._Cntr;newContext.vars.DataHolderCntr=ctx.vars.DataHolderCntr||ctx.vars._Cntr;newContext.vars.Items=aa_items(cntr);var id=aspect.HeaderFooterID;var location=aa_text(data,profile,'Location',newContext);var ctrl=ajaxart.run(data,profile,'Control',newContext);var cls='HeaderFooter_'+id;var header=jQuery(aa_find_header(cntr));if(header.length==0)return;if(aa_text(data,profile,'RefreshStrategy',context)=='none'&&header.find('>.'+cls).length>0)
return;if(ctrl.length>0)
{jQuery(ctrl[0]).addClass(cls);if(location.indexOf('header')!=-1)
{var existing=header.find('>.'+cls);if(existing.length>0)
existing.replaceWith(ctrl[0]);else
{var placeToAdd=header;if(placeToAdd.length>0)
placeToAdd[0].appendChild(ctrl[0]);}}
if(location.indexOf('footer')!=-1)
{var ctrl=ajaxart.run(data,profile,"Control",newContext);jQuery(ctrl[0]).addClass('HeaderFooter_'+id);var existing=jQuery(aa_find_footer(cntr)).find('>.'+cls);if(existing.length>0)
existing.replaceWith(ctrl[0]);else
{var placeToAdd=jQuery(cntr.Ctrl).find('>.aa_container_footer');if(placeToAdd.length>0)
placeToAdd[0].appendChild(ctrl[0]);}}}
return[];}
aspect.PreAction=aspect.PostAction=function(data1,ctx){return aspect.refresh(data1,ctx);}
aspect.InitializeContainer=function(data1,ctx)
{var cntr=ctx.vars._Cntr[0];var phase=aa_int(data,profile,'Phase',context);if(aa_bool(data,profile,'RunAfterPresentation',context))
cntr.RegisterForPostAction(aspect,phase);else
cntr.RegisterForPreAction(aspect,phase);if(aa_text(data,profile,"RefreshStrategy",context)=="item selection")
{function refreshHeaderFooter(selected_elem,ctx2)
{var newContext=aa_ctx(ctx2,{_ItemsOfOperation:selected_elem.ItemData,_ElemsOfOperation:[selected_elem]});aspect.refresh(data,newContext);}
aa_register_handler(cntr,'Selection',refreshHeaderFooter);}
if(aa_text(data,profile,"RefreshStrategy",context)!="none")
{aa_register_handler(cntr,'ContainerChange',aspect.refresh);}
return[];}}
init(aspect);return[aspect];},List:function(profile,data,context)
{var aspect={isObject:true};aspect.CreateContainer=function(initData,ctx)
{var cntr=ctx.vars._Cntr[0];var ctrl=jQuery('<div class="aa_list aa_listtop aa_cntr_body aa_cntrlist"/>');jQuery(cntr.Ctrl).find('>.aa_listtop').replaceWith(ctrl);return[];}
aspect.InitializeContainer=function(data1,ctx){var cntr=ctx.vars._Cntr[0];var eachItemInLine=aa_bool(data,profile,'EachItemInLine',context);cntr.ListItemCss=aa_comma_size_to_css(aa_text(data,profile,'ItemSize',context));cntr.ListItemCss+=aa_text(data,profile,'ItemCss',context);var itemClickable=aa_bool(data,profile,'ItemClickable',context);var spacingBetweenFields=aa_text(data,profile,'SpacingBetweenFields',context);cntr.createNewElement=function(item_data,item_aggregator,ctx2)
{var cntr=ctx.vars._Cntr[0];var out=jQuery('<div class="aa_item" tabindex="1">')[0];if(!eachItemInLine)
jQuery(out).css('float',aa_is_rtl(cntr.Ctrl,ctx)?'right':'left');aa_apply_css(out,cntr.ListItemCss);var fields=ajaxart_field_getFields(cntr,"table");for(var j=0;j<fields.length;j++){if(j>0)
jQuery(out).append(jQuery('<div style="height: '+spacingBetweenFields+'"/>'));var field=fields[j];var cell_data=ajaxart_field_calc_field_data(field,item_data,ctx2);var field_div=document.createElement('div');out.appendChild(field_div);ajaxart_field_createCellControl(item_data,cntr,field_div,"control",field,cell_data,ctx2);}
out.ItemData=item_data;if(itemClickable){jQuery(out).addClass('aa_list_clickable');out.onclick=function(e)
{var item=this;var newContext=aa_ctx(ctx2||ctx,{_InnerItem:item.ItemData,_ItemsOfOperation:item.ItemData,ControlElement:[this]});ajaxart.run(item.ItemData,profile,'ClickAction',newContext);return false;};}
if(item_aggregator)item_aggregator.push(out);return out;}}
return[aspect];},ItemClickable:function(profile,data,context)
{var aspect={isObject:true};aspect.InitializeContainer=function(data1,ctx){var cntr=ctx.vars._Cntr[0];cntr.ItemClickable=true;}
aspect.InitializeElements=function(data1,ctx)
{var cntr=ctx.vars._Cntr[0];var elems=ctx.vars._Elems;if(!cntr.ItemClickable)return;for(var i=0;i<elems.length;i++){var elem=elems[i];jQuery(elem).addClass('aa_list_clickable');var clickFunc=function(elem){return function(){var newContext=aa_ctx(ctx,{_InnerItem:elem.ItemData,_ItemsOfOperation:elem.ItemData,ControlElement:[elem]});newContext=aa_merge_ctx(context,newContext);ajaxart.run(elem.ItemData,profile,'ClickAction',newContext);return false;}};elem.onclick=clickFunc(elem);}}
return[aspect];},HighlightSelectionOnHover:function(profile,data,context)
{var aspect={isObject:true};var initializeContainer=function(initData,ctx)
{var onmouseover=function(e){var cntr=ctx.vars._Cntr[0];var elem=jQuery((typeof(event)=='undefined')?e.target:(event.tDebug||event.srcElement));if(elem.hasClass('aa_item'))
var new_selected=elem;else
var new_selected=elem.parents(".aa_item").slice(0,1);if(new_selected.length>0)
{if(new_selected.hasClass('aa_selected_item'))return;var top_cntr=ajaxart_topCntr(new_selected);if(!top_cntr)return true;var top_cntr_list=ajaxart_find_aa_list(top_cntr);jQuery(top_cntr_list).find('.aa_selected_item').removeClass("aa_selected_item");jQuery(top_cntr_list).find('.aa_selected_itemtext').removeClass("aa_selected_itemtext");new_selected.addClass("aa_selected_item");new_selected.find('>.aa_text').addClass("aa_selected_itemtext");}
return true;}
var cntr=ctx.vars._Cntr[0];var cntr_list=ajaxart_find_aa_list(cntr);ajaxart.ui.bindEvent(cntr_list,'mouseover',onmouseover);}
ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);return[aspect];},TableColumnsResizer:function(profile,data,context)
{var aspect={isObject:true};var initializeContainer=function(initData,ctx)
{var cntr=ctx.vars._Cntr[0];var colResizeDetect=function(e,thead,th){var mousepos=ajaxart.ui.mousePos(e);var in_resize_place=ajaxart.ui.absoluteLeft(th,false)+th.offsetWidth-mousepos.x<6;if(jQuery(thead).parents('.right2left').length>0)
in_resize_place=mousepos.x-ajaxart.ui.absoluteLeft(th,false)<6;if(in_resize_place)
{jQuery(th).addClass('col_resize');thead.ResizedCol=th;thead.Owner="TableColumnsResizer";}
else
{jQuery(th).removeClass('col_resize');thead.ResizedCol=null;thead.Owner=null;}
return aa_stop_prop(e);}
var colResizeStart=function(e,thead,th){thead.ResizedColStart=true;ajaxart_disableSelection(thead);document.onmouseup=colResizeStop;return aa_stop_prop(e);}
var colResizeMove=function(e,thead,th){if(thead.ResizedColStart)
{var mousepos=ajaxart.ui.mousePos(e);var new_size=mousepos.x-ajaxart.ui.absoluteLeft(thead.ResizedCol,false);if(jQuery(thead).parents('.right2left').length>0)
new_size=ajaxart.ui.absoluteLeft(thead.ResizedCol,false)+thead.ResizedCol.offsetWidth-mousepos.x;jQuery(thead.ResizedCol).width(new_size);var cntr=ctx.vars._Cntr[0];ajaxart_setUiPref(cntr.ID[0],thead.ResizedCol.Field.Id+'_ColumnWidth',''+new_size+'px',ctx);var parent_table=jQuery(thead.ResizedCol).parents('.aatable').slice(0,1);if(parent_table[0].ResizeColumn)
parent_table[0].ResizeColumn(thead.ResizedCol);if(jQuery(thead.ResizedCol).parents('table').slice(0,1).hasClass('aa_inner_header'))
{var tds=parent_table.find('td').filter(function(){return this.Field!=null&&this.Field.Id==thead.ResizedCol.Field.Id});tds.width(new_size+1);}
return aa_stop_prop(e);}
else
colResizeDetect(e,thead,th);}
var colResizeStop=function(e){var cntr=ctx.vars._Cntr[0];jQuery(cntr.Ctrl).find('th').removeClass('col_resize');document.onmouseup=null;jQuery(cntr.Ctrl).find('thead').each(function()
{var thead=this;thead.ResizedColStart=false;thead.ResizedCol=null;thead.Owner=null;});return aa_stop_prop(e);}
var thead=jQuery(cntr.Ctrl).find('.aatable>thead')[0];if(thead)
{registerHeaderEvent(thead,'mousemove',colResizeDetect,'TableColumnsResizer','no dominant');registerHeaderEvent(thead,'mousedown',colResizeStart,'TableColumnsResizer','dominant');registerHeaderEvent(thead,'mousemove',colResizeMove,'TableColumnsResizer','dominant');registerHeaderEvent(thead,'mouseup',colResizeStop,'TableColumnsResizer','dominant');}};ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);return[aspect];},ItemSelection:function(profile,data,context)
{var aspect={isObject:true};var select=function(new_selected,selected,method,ctx,focus)
{if(new_selected.length>0&&(selected.length==0||new_selected[0]!=selected[0]))
{var inner_cntr=new_selected.parents('.aa_container')[0].Cntr;var top_cntr=ajaxart_topCntr(new_selected);var top_cntr_list=ajaxart_find_aa_list(top_cntr);jQuery(top_cntr_list).find('.aa_selected_item').removeClass("aa_selected_item");jQuery(top_cntr_list).find('.aa_selected_itemtext').removeClass("aa_selected_itemtext");new_selected.addClass("aa_selected_item");new_selected.find('>.aa_text').addClass("aa_selected_itemtext");if(inner_cntr.SoftSelector)
{var id=inner_cntr.ItemId(new_selected[0].ItemData,new_selected[0]);ajaxart.runScriptParam([id],inner_cntr.SoftSelector.WriteValue,ctx);}
var selectionAction=function()
{var top_cntr=ctx.vars._Cntr[0];if(new_selected.parents('.aa_container')[0])
var inner_cntr=new_selected.parents('.aa_container')[0].Cntr;else
var inner_cntr=top_cntr;var newContext=aa_ctx(ctx,{_Cntr:[inner_cntr],_SelectionMethod:[method],_Item:new_selected[0].ItemData,_SelectedItem:new_selected[0].ItemData,_Elem:[new_selected[0]],ControlElement:[new_selected[0]]});ajaxart.run(new_selected[0].ItemData,profile,'OnSelect',newContext);aa_invoke_cntr_handlers(inner_cntr,inner_cntr.Selection,new_selected[0],newContext);if(top_cntr!=inner_cntr)
{var newContext=aa_ctx(ctx,{_InnerCntr:[inner_cntr],_SelectionMethod:[method],_Item:new_selected[0].ItemData,_SelectedItem:new_selected[0].ItemData,_Elem:[new_selected[0]],ControlElement:[new_selected[0]]});aa_invoke_cntr_handlers(top_cntr,top_cntr.Selection,new_selected[0],newContext);}
var focuson=new_selected;if(method=="keyboard"||(method=="mouse"&&top_cntr.Ctrl.LaunchingElement))
{if(ajaxart.controlOfFocus)
ajaxart.controlOfFocus.IgnoreBlur=true;focuson.focus();if(ajaxart.controlOfFocus!=null)
jQuery(ajaxart.controlOfFocus).focus();}
else if(method=="mouse"||focus){focuson.focus();}
return true;};if(method=="keyboard")
ajaxart.action.delayedRun(selectionAction,ctx,300,0);else
selectionAction();}}
var initializeContainer=function(initData,ctx)
{var cntr=ctx.vars._Cntr[0];cntr.Select=select;cntr.DAndDOwner="";var auto_select=aa_text(data,profile,"AutoSelectFirstItem",ctx);if(auto_select=='true'||auto_select=='select and focus')
{var postAction=function(initData,ctx2)
{var cntr=ctx.vars._Cntr[0];if(ajaxart_itemlist_getSelectedItems(cntr).length>0)return;if(cntr.SoftSelector)return[];if(aa_bool(data,profile,"KeyboardSupport",ctx))
{var filters=jQuery(aa_find_header(cntr)).find('>.aa_filters');if(filters.length>0)
ajaxart.ui.bindEvent(filters[0],'keydown',onkeydown);}
var elems=jQuery(ajaxart_container_elems(cntr));if(elems.length>0){ajaxart_uiaspects_select(elems.slice(0,1),jQuery([]),"auto",ctx2);if(auto_select=='select and focus')
setTimeout(function(){elems.slice(0,1).focus();},100);}
return[];}
ctx.vars._Cntr[0].RegisterForPostAction(ctx._This);ajaxart_addScriptParam_js(ctx._This,'PostAction',postAction,ctx);}
else if(aa_paramExists(profile,'FilterOnFirstSelected'))
{ctx._This.PostAction=function(initData,ctx2)
{var cntr=ctx.vars._Cntr[0];if(ajaxart_itemlist_getSelectedItems(cntr).length>0)return;var elems=jQuery(ajaxart_container_elems(cntr));if(elems.length==0)return;var newContext=aa_merge_ctx(context,ctx2);for(var i=0;i<elems.length;i++){if(aa_bool(elems[i].ItemData,profile,'FilterOnFirstSelected',newContext)){ajaxart_uiaspects_select(jQuery(elems[i]),jQuery([]),"auto",ctx2);return;}}
ajaxart_uiaspects_select(elems.slice(0,1),jQuery([]),"auto",ctx2);}
ctx.vars._Cntr[0].RegisterForPostAction(ctx._This);}
var onkeydown=function(e){e=e||event;var elem=(typeof(event)=='undefined')?e.target:(event.tDebug||event.srcElement);var isinput=elem.tagName.toLowerCase()=='input';var cntr=ctx.vars._Cntr[0];if(aa_bool(data,profile,'IncludeSubContainers',context))
var cntr_elems=jQuery(cntr.Ctrl).find('.aa_list').slice(0,1).find('.aa_item').filter(aa_visible);else
var cntr_elems=jQuery(ajaxart_container_elems(cntr)).filter(aa_visible);var selected=cntr_elems.filter(".aa_selected_item").slice(0,1);var new_selected=[];if(e.ctrlKey)return true;if(e.keyCode==40){if(selected.length==0)
new_selected=jQuery(ajaxart_container_elems(cntr)[0]);else
new_selected=cntr.next(selected,cntr);while(new_selected.length>0&&new_selected[0].hidden)
new_selected=cntr.next(new_selected,cntr);}
else if(e.keyCode==38){new_selected=cntr.prev(selected,cntr);while(new_selected.length>0&&new_selected[0].hidden)
new_selected=cntr.prev(new_selected,cntr);}
else if(e.keyCode==36&&!isinput){new_selected=cntr_elems.filter('.aa_item').filter(aa_visible).slice(0,1);while(new_selected.length>0&&new_selected[0].hidden)
new_selected=cntr.next(new_selected,cntr);}
else if(e.keyCode==35&&!isinput){new_selected=cntr_elems.filter('.aa_item').filter(aa_visible).slice(-1);while(new_selected.length>0&&new_selected[0].hidden)
new_selected=cntr.prev(new_selected,cntr);}
else if(e.keyCode==34||e.keyCode==63277)
{var last_valid_selection=selected;new_selected=selected;var times=0;while(cntr.next(new_selected,cntr).length>0&&(new_selected[0].hidden||times<3))
{if(!new_selected[0].hidden)
{times++;last_valid_selection=new_selected;}
new_selected=cntr.next(new_selected,cntr);}
if(new_selected.length==0)
new_selected=last_valid_selection;}
else if(e.keyCode==33||e.keyCode==63276)
{var last_valid_selection=selected;new_selected=selected;var times=0;while(cntr.prev(new_selected,cntr).length>0&&(new_selected[0].hidden||times<3))
{if(!new_selected[0].hidden)
{times++;last_valid_selection=new_selected;}
new_selected=cntr.prev(new_selected,cntr);}
if(new_selected.length==0)
new_selected=last_valid_selection;}
else
return true;if(new_selected.length>0&&(selected.length==0||new_selected[0]!=selected[0])){ajaxart_uiaspects_select(new_selected,selected,"keyboard",ctx);return aa_stop_prop(e);}}
var mouse_select=function(e){var elem=jQuery((typeof(event)=='undefined')?e.target:(event.tDebug||event.srcElement));if(!aa_intest&&(elem.parents('body').length==0||elem.filter(aa_visible).length==0||elem.hasClass('aa_not_selectable')||elem.parents('.aa_not_selectable').length>0))return;if(elem.hasClass('hitarea'))return true;var cntr=ctx.vars._Cntr[0];if(cntr.DAndDOwner!="")return true;if(!cntr.Ctrl.LaunchingElement)
ajaxart.controlOfFocus=null;if(e.button==2)return true;if(elem.hasClass('aa_item'))
var new_selected=elem;else{var optionItems=elem.parents(".aa_item").get();for(var i=0;i<optionItems.length;i++){var item=optionItems[i];var itemCntr=jQuery(item).parents('.aa_container')[0].Cntr;if(itemCntr==cntr){var new_selected=jQuery(item);break;}}}
var current_time=new Date().getTime();if(new_selected&&new_selected.length>0)
{ajaxart_uiaspects_select(new_selected,jQuery(),"mouse",ctx);}
return true;}
var cntr_list=ajaxart_find_aa_list(cntr);if(!cntr.SelectionEnabled)
{var mouseSupport=aa_text(data,profile,'MouseSupport',context);if(mouseSupport=='mouse click'){ajaxart.ui.bindEvent(cntr_list,'click',mouse_select);}
else{ajaxart.ui.bindEvent(cntr_list,'mousedown',mouse_select);ajaxart.ui.bindEvent(cntr_list,'touchstart',mouse_select);}
cntr.SelectionKeydown=onkeydown;if(aa_bool(data,profile,"KeyboardSupport",ctx))
ajaxart.ui.bindEvent(cntr_list,'keydown',onkeydown);}
cntr.SelectionEnabled=true;var selector=aa_first(data,profile,"Selector",ctx);if(selector!=null)
{cntr.SoftSelector=selector;}}
var make_selected_visible=function(cntr){}
ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);return[aspect];},SearchLayout:function(profile,data,context)
{if(!context.vars._PopupField)return[];var popupField=context.vars._PopupField[0];var page=ajaxart.runNativeHelper('Page',data,profile,context)[0];var group=page.Fields[0];var image=group.Fields[0];var right=group.Fields[1];var title=right.Fields[0];var text=right.Fields[1];image.FieldData=popupField.ItemImage;title.FieldData=popupField.ItemTitle;text.FieldData=popupField.ItemExtraText;if(popupField.Options&&popupField.Options.Options.length>0){var option=popupField.Options.Options[0].source;popupField.ItemImage([option],context);popupField.ItemTitle([option],context);popupField.ItemExtraText([option],context);popupField.ItemLink([option],context);}
return[page];},DragAndDropMover:function(profile,data,context)
{var aspect={isObject:true};var initializeContainer=function(initData,ctx)
{var cntr=ctx.vars._Cntr[0];cntr.draggedElem=null;cntr.DAndDOwner="";var _drag=function(e){var cntr=ctx.vars._Cntr[0];var mousepos=ajaxart.ui.mousePos(e);if(cntr.SuspectItemDrag!=null)
{var distance=Math.abs(mousepos.y-cntr.SuspectItemDrag.mousePos.y);if(distance<5)return aa_stop_prop(e);if(new Date().getTime()-cntr.SuspectItemDrag.time>1000)
unSuspectDrag();else
_dragBegin(e);cntr.SuspectItemDrag=null;}
var oElem=cntr.draggedElem;if(oElem==null)return true;var table=aa_find_list(cntr);var actualY=mousepos.y-oElem.mouseY;var table_top=ajaxart.ui.absoluteTop(table,false);var table_bottom=ajaxart.ui.absoluteTop(table,false)+jQuery(table).height();if(actualY<table_top||actualY>table_bottom)
return true;oElem.style.top=actualY+'px';var spaceTop=ajaxart.ui.absoluteTop(cntr.spaceElem,false);if(mousepos.y-spaceTop<3)
if(cntr.spaceElem.previousSibling!=null)
cntr.draggedParent.insertBefore(cntr.spaceElem,cntr.spaceElem.previousSibling);if((spaceTop+cntr.spaceElem.offsetHeight)-mousepos.y<-5)
if(cntr.spaceElem.nextSibling.nextSibling!=null)
cntr.draggedParent.insertBefore(cntr.spaceElem,cntr.spaceElem.nextSibling.nextSibling);return aa_stop_prop(e);};var _dragEnd=function(e,cancel){var cntr=ctx.vars._Cntr[0];cntr.draggedParent.removeChild(cntr.draggedElem);if(!cancel)
jQuery(cntr.spaceElem).replaceWith(cntr.OriginalElem);else
cntr.draggedParent.removeChild(cntr.spaceElem);cntr.OriginalElem.style.display='';cntr.OriginalElem.display='';cntr.Ctrl.onmousemove=cntr.onmousemoveOrig;document.onkeydown=cntr.onkeydownOrig;document.onmouseup=null;cntr.draggedElem=null;if(jQuery(cntr.OriginalElem).nextAll('.aa_item').length==0)
ajaxart_runMethod(cntr.OriginalElem.ItemData,cntr.Items[0],'MoveToEnd',cntr.Items[0].MoveToEnd.context);else
{var move_params={isObject:true};move_params.Item=cntr.OriginalElem.ItemData;move_params.BeforeItem=jQuery(cntr.OriginalElem).nextAll('.aa_item')[0].ItemData;ajaxart_runMethod([move_params],cntr.Items[0],'MoveBefore',cntr.Items[0].MoveBefore.context);}
aa_first([cntr],profile,'OnDrop',ctx);aa_invoke_cntr_handlers(cntr,cntr.ContainerChange,[],ctx);ajaxart_restoreSelection(cntr.Ctrl);cntr.DAndDOwner="";return aa_stop_prop(e);};var _dragBegin=function(e){var cntr=ctx.vars._Cntr[0];var elem=cntr.SuspectItemDrag.elem;if(elem.hasClass("aa_item"))
var item_elem=elem;else
var item_elem=elem.parents('.aa_item').slice(0,1);if(item_elem.length==0)return aa_stop_prop(e);if(cntr.Items[0].MoveBefore==null)return aa_stop_prop(e);cntr.DAndDOwner="DragAndDropMover";ajaxart_disableSelection(cntr.Ctrl);var posx=ajaxart.ui.absoluteLeft(item_elem[0],false);var posy=ajaxart.ui.absoluteTop(item_elem[0],false);cntr.draggedElem=item_elem[0].cloneNode(true);cntr.OriginalElem=item_elem[0];cntr.draggedParent=item_elem[0].parentNode;cntr.draggedParent.appendChild(cntr.draggedElem);cntr.spaceElem=item_elem[0].cloneNode(true);cntr.draggedParent.insertBefore(cntr.spaceElem,cntr.OriginalElem);cntr.draggedElem.ItemData=cntr.spaceElem.ItemData=item_elem[0].ItemData;cntr.OriginalElem.style.display='none';cntr.OriginalElem.display='none';jQuery(cntr.draggedElem).addClass('aa_dragged_elem');jQuery(cntr.spaceElem).addClass('aa_dragged_space_elem');var mousepos=cntr.SuspectItemDrag.mousePos;var tds=jQuery(cntr.draggedElem).find('td');for(var i=0;i<tds.length;i++)
jQuery(tds[i]).width(jQuery(tds[i]).width());cntr.draggedElem.style.position='absolute';cntr.draggedElem.style.left=posx+'px';cntr.draggedElem.style.top=posy+'px';cntr.draggedElem.mouseY=mousepos.y-posy;document.onmouseup=_dragEnd;cntr.onkeydownOrig=document.onkeydown;document.onkeydown=function(e)
{if(e.keyCode==27)
_dragEnd(e,true);return true;}
return aa_stop_prop(e);};var suspectDrag=function(e){var cntr=ctx.vars._Cntr[0];if(cntr.DAndDOwner!="")return true;var elem=jQuery((typeof(event)=='undefined')?e.target:(event.tDebug||event.srcElement));if(elem.parents('thead').length>0)return true;if(elem.hasClass('aa_item'))
var inner_cntr=elem.parents('.aa_container')[0];else
var inner_cntr=elem.parents('.aa_item').parents('.aa_container')[0];if(inner_cntr==null||inner_cntr.Cntr!=cntr)return true;var table=aa_find_list(cntr);if(jQuery(table).find('>.detailsInplace_tr').length>0)return;cntr.SuspectItemDrag={elem:elem,mousePos:ajaxart.ui.mousePos(e),time:new Date().getTime()};cntr.onmousemoveOrig=cntr.Ctrl.onmousemove;cntr.Ctrl.onmousemove=_drag;return true;}
var unSuspectDrag=function(e){var cntr=ctx.vars._Cntr[0];if(cntr.DAndDOwner!="")return true;if(cntr.SuspectItemDrag!=null)
{cntr.SuspectItemDrag=null;cntr.Ctrl.onmousemove=cntr.onmousemoveOrig;}
return true;}
cntr.DAndDOwner="";ajaxart.ui.bindEvent(cntr.Ctrl,'mousedown',suspectDrag);ajaxart.ui.bindEvent(cntr.Ctrl,'mouseup',unSuspectDrag);}
ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);return[aspect];},TableNoItems:function(profile,data,context)
{var aspect={isObject:true};function refresh(data1,ctx)
{var cntr=ctx.vars._Cntr[0];if(cntr.GroupByUsingUIPref)return[];var body=jQuery(cntr.Ctrl).find('>.aatable>.aatable_tbody');if(body.length==0)return[];jQuery(cntr.Ctrl).find('>.aatable').show();body.find('>tr.noitems').remove();if(body.find('>tr').length==0)
{if(aa_bool(data,profile,'HideTable',context))
{jQuery(cntr.Ctrl).find('>.aatable').hide();}
else
{var no_items_text=ajaxart_multilang_text('no items available',context);var no_items=jQuery('<tr class="noitems"><td colspan="'+cntr.columns.length+'" class="td_nocontent"><span>'+no_items_text+'</span></td></tr>');if(body.length>0)
body[0].appendChild(no_items[0]);}}else{}}
aspect.PostAction=function(data1,ctx)
{refresh(data1,ctx);}
var initializeContainer=function(initData,ctx)
{var cntr=ctx.vars._Cntr[0];cntr.RegisterForPostAction(ctx._This);aa_register_handler(cntr,'ContainerChange',refresh);}
ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);return[aspect];},PropertySheet:function(profile,data,context)
{var aspect={isObject:true};var initializeContainer=function(initData,ctx)
{var cntr=ctx.vars._Cntr[0];cntr.createNewElement=function(item_data,item_aggregator,ctx2)
{var cntr=ctx.vars._Cntr[0];var fields=ajaxart_field_getFields(cntr,"property sheet");var space=aa_text(data,profile,'Space',context),header=aa_text(data,profile,'HeaderSpace',context),footer=aa_text(data,profile,'FooterSpace',context);var full_width=aa_bool(data,profile,'FullWidth',context);var width=aa_text(data,profile,'PropertiesWidth',context);var result=ajaxart_properties_and_sections(cntr,item_aggregator,item_data,profile,ctx2||ctx,fields,space,full_width,width,header,footer);jQuery(result).addClass('aa_item');if(item_aggregator)item_aggregator.push(result);return result;};}
ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);return[aspect];},Horizontal:function(profile,data,context)
{var aspect={isObject:true};aspect.InitializeContainer=function(initData,ctx)
{var cntr=ctx.vars._Cntr[0];cntr.createNewElement=function(item_data,item_aggregator,ctx2)
{ctx=aa_merge_ctx(context,ctx);var cntr=ctx.vars._Cntr[0];var noInnerTitles=aa_bool(data,profile,'HideInnerTitles',context);var fields=ajaxart_field_getFields(cntr,"property sheet",item_data);var table=jQuery('<table class="aahoriz" cellspacing="0" cellpadding="0"><tbody><tr class="aahoriz_tr"/></tbody></table>')[0];if(aa_bool(data,profile,'FullWidth',context))jQuery(table).width('100%');var tr=jQuery(table).find('.aahoriz_tr')[0];tr.ItemData=item_data;var spacingStr=aa_text(data,profile,'Spacing',context).replace(/ /g,'');var hasSpacing=spacingStr!=""&&spacingStr!="0";var spacing=spacingStr.split(',');var enfore_spacing=aa_bool(data,profile,'EnforceSpacing',context);var minWidths=ajaxart_run_commas(data,profile,'MinWidths',context);var maxWidths=ajaxart_run_commas(data,profile,'MaxWidths',context);var widths=ajaxart_run_commas(data,profile,'Widths',context);if(aa_bool(data,profile,'AlighLastToRight',context))
{var out=jQuery('<div style="aa_item" />')[0];out.ItemData=item_data;for(var i=0;i<fields.length;i++){var field=fields[i];var inner=ajaxart_properties_and_sections(cntr,item_aggregator,item_data,profile,ctx2||ctx,[fields[i]],true);var wrap=jQuery('<div class="aa_float_left"/>')[0];if(i==fields.length-1)wrap=jQuery('<div class="aa_float_right"/>')[0];wrap.appendChild(inner);out.appendChild(wrap);}
if(item_aggregator)item_aggregator.push(out);return out;}
for(var i=fields.length-1;i>=0;i--)
if(typeof(fields[i].Hidden)=="function"&&aa_tobool(fields[i].Hidden(item_data,ctx)))
fields.splice(i,1);for(var i=0;i<fields.length;i++){if(i>0&&hasSpacing){var space=spacingStr;if(spacing.length>1&&i<=spacing.length)space=spacing[i-1];if(space!=""){var gap=document.createElement('td');gap.className='aahoriz_space';if(enfore_spacing)
gap.style.minWidth=space;else
gap.style.width=space;if(cntr.SeparatorControl){var spaceCntr=cntr.SeparatorControl(item_data,ctx)[0];if(spaceCntr)gap.appendChild(spaceCntr);}
tr.appendChild(gap);}}
var td=document.createElement('td');td.className="aahoriz_td";if(noInnerTitles){var cell_data=ajaxart_field_calc_field_data(fields[i],item_data,ctx2||ctx);ajaxart_field_createCellControl(item_data,cntr,td,"control",fields[i],cell_data,ctx2||ctx);}else{var inner=ajaxart_properties_and_sections(cntr,item_aggregator,item_data,profile,ctx2||ctx,[fields[i]],true);td.appendChild(inner);}
tr.appendChild(td);if(i<minWidths.length)inner.style.minWidth=minWidths[i];if(i<maxWidths.length)inner.style.minWidth=maxWidths[i];if(i<widths.length)td.style.width=inner.style.width=widths[i];}
if(item_aggregator)item_aggregator.push(table);return table;}}
return[aspect];},ClickableRows:function(profile,data,context)
{var aspect={isObject:true};var initializeElements=function(initData,ctx)
{var elems=ctx.vars._Elems;for(var i=0;i<elems.length;i++)
{var elem=elems[i];elem.onclick=function(e){ajaxart.run(this.ItemData,profile,'Action',aa_ctx(context,{_ItemsOfOperation:this.ItemData,Item:this.ItemData,_ElemsOfOperation:[this],ControlElement:[this]}));};jQuery(elem).addClass('aa_clickable');}
if(aa_bool(data,profile,'DisableSelection',context));}
ajaxart_addScriptParam_js(aspect,'InitializeElements',initializeElements,context);return[aspect];},AspectByXtml:function(profile,data,context)
{var aspect={isObject:true};aspect.InitializeContainer=function(initData,ctx)
{ajaxart.run(data,profile,'InitializeContainer',aa_merge_ctx(context,ctx));}
return[aspect];},Permissions:function(profile,data,context)
{var aspect={isObject:true};var init=function(aspect){aspect.InitializeContainer=function(data1,ctx){ctx=aa_merge_ctx(context,ctx);var cntr=ctx.vars._Cntr[0];cntr.RegisterForPostAction(aspect);if(!aa_bool(cntr.Items[0].Items,profile,'WritableIf',ctx)){cntr.ReadOnly=true;}}
aspect.PostAction=function(data1,ctx){ctx=aa_merge_ctx(context,ctx);var cntr=ctx.vars._Cntr[0];if(!aa_bool(data,profile,'VisibleIf',ctx))
cntr.Ctrl=aa_first(data,profile,'ControlIfNotVisible',ctx)||document.createElement('div');}}
init(aspect);return[aspect];},Table:function(profile,data,context)
{var aspect={isObject:true};var createContainer=function(initData,ctx)
{var cntr=ctx.vars._Cntr[0];var table=jQuery('<table class="aatable aa_listtop aa_cntr_body"><thead><tr class="aatable_header"></tr></thead><tbody class="aatable_tbody aa_list" tabindex="1"></tbody></table>');jQuery(cntr.Ctrl).find('>.aa_listtop').replaceWith(table);return[];}
var initializeContainer=function(initData,ctx)
{var cntr=ctx.vars._Cntr[0];var cols_str=aa_text(data,profile,'Columns',ctx);var pref_str=ajaxart_getUiPref(cntr.ID[0],'Table_Fields_Order',ctx);var hidden_fields=','+ajaxart_getUiPref(cntr.ID[0],'Table_Hidden_Fields',ctx)+','+(cntr.HiddenFields||'')+',';var fieldsOrig=ajaxart_field_getFields(cntr,"table");var fields=[];for(var i=0;i<fieldsOrig.length;i++)
if(fieldsOrig[i].Id==''||hidden_fields.indexOf(fieldsOrig[i].Id)==-1)
fields.push(fieldsOrig[i]);var columns=cols_str.split(',');if(pref_str)
{var merged_cols=','+pref_str+',';if(cols_str!='')
{var cols=cols_str.split(',')
for(var i=0;i<cols.length;i++)
{if(cols[i]!=''&&merged_cols.indexOf(cols[i])==-1)
merged_cols+=cols[i]+',';}}
else
{for(var i=0;i<fields.length;i++)
{if(merged_cols.indexOf(fields[i].Id)==-1)
merged_cols+=fields[i].Id+',';}}
columns=merged_cols.split(',');}
if(columns.length==1&&columns[0]=="")columns=[];cntr.columns=[];if(cntr.CellPresentation==null)cntr.CellPresentation='text';var operations=ajaxart_runMethod([],cntr,'Operations',ctx);if(columns.length==0)
{for(var i=0;i<fields.length;i++)
cntr.columns.push(fields[i]);}
else
{for(var i=0;i<columns.length;i++)
{if(columns[i]=='')continue;var found=false;for(var j=0;j<fields.length;j++)
if(columns[i]==fields[j].Id)
{cntr.columns.push(fields[j]);found=true;}
for(var j=0;j<operations.length;j++)
if(columns[i]==operations[j].Id)
{cntr.columns.push(operations[j]);found=true;}
if(!found)
ajaxart.log("table column (field or operation) '"+columns[i]+"' was not found");}}
var table=jQuery(cntr.Ctrl).find('.aatable');var header=jQuery(cntr.Ctrl).find('thead');if(header.length==0)return;var header_tr=header.find('>tr')[0];var fields=ajaxart_field_getFields(cntr,"table");for(var j=0;j<cntr.columns.length;j++){var field=cntr.columns[j];var th=jQuery('<th class="fieldtitle th_'+field.Id+'"><span class="fieldtitle_title"/><span class="fieldtitle_sort">&nbsp;</span></th>');if(field.AddInfoIcon)
field.AddInfoIcon(th.get(),cntr.Context);th[0].fieldId=field.Id;th[0].Field=field;th[0].Cntr=cntr;var title=field.isOperation?ajaxart_runMethod(data,field,'Title',cntr.Context)[0]:field.Title;if(field.HideTitle)title=" ";th.find('>.fieldtitle_title').html(title);if(field.Width)
th.css('width',field.Width);ajaxart_field_fix_th(cntr,th[0],field,ctx);header_tr.appendChild(th[0]);if(cntr.EnableFieldMenu)
{th.find('>span').slice(0,1).insertBefore('<span class="aa_field_menu">&nbsp;</span>');th.find('>.aa_field_menu')[0].onmousedown=function(e)
{var newContext=aa_ctx(ctx,{MousePos:[{isObject:true,pageX:e.pageX||e.clientX,pageY:e.pageY||e.clientY}]});ajaxart.runNativeHelper('FieldMenu',[field],profile,newContext);return aa_stop_prop(e);}}}
cntr.createNewElement=function(item_data,item_aggregator,ctx2,forGroup)
{var cntr=this;var tr=document.createElement("TR");tr.className="aa_item tablerow";tr.ItemData=item_data;var fields=cntr.columns;if(cntr.CustomItemControl)
{var td=document.createElement("TD");td.colSpan=fields.length;var ctrl=cntr.CustomItemControl(item_data,ctx);if(ctrl.length>0)
td.appendChild(ctrl[0]);tr.appendChild(td);}
else if(!cntr.GroupByFields||cntr.GroupByFields.length==0||forGroup)
{for(var j=0;j<fields.length;j++){var field=fields[j];var newContext=aa_ctx(ctx2||ctx,{_Field:[field],FieldTitle:[field.Title],_InnerItem:item_data,_Elem:[tr],_Item:item_data});var td=document.createElement("TD");td.Field=field;if(field.Id=='#_TitleField'){td.className="aa_title_td content";tr.titleTd=td;}
else
{if(cntr.WrappersAsItems||(field.IsCalculated&&field.WrapperToValue&&item_data[0]&&item_data[0].__hiddenForView))
{td.className="content aa_text fld_"+field.Id;td.innerHTML=''+item_data[0][field.Id];tr.appendChild(td);continue;}
if((field.CellPresentation||cntr.CellPresentation)=="text"&&!field.isOperation&&!field.CalculatedControl&&!field.IsCalculated&&!field.ModifyCell)
{td.className="content aa_text fld_"+field.Id;if(field.Text)
td.innerHTML=ajaxart_field_text(field,ajaxart_field_calc_field_data(field,item_data,newContext),item_data,newContext);else if(field.ItemToText)
td.innerHTML=field.ItemToText(item_data[0]);else if(item_data[0]&&item_data[0].__hiddenForView)
td.innerHTML=item_data[0][field.Id];else
{var cell_data=ajaxart_field_calc_field_data(field,item_data,newContext);td["Data"]=cell_data;td.innerHTML=ajaxart_field_text(field,cell_data,item_data,newContext);}
if(field.ModifyCell){var field_data=ajaxart_field_calc_field_data(field,item_data,newContext);for(var i=0;i<field.ModifyCell.length;i++)
field.ModifyCell[i](td,field_data,"text",newContext,item);}
tr.appendChild(td);continue;}
td.className="content";if(field.Direction!=null){var dir=ajaxart.totext_array(field.Direction);if(dir=="Right to Left")
td.style.direction="rtl";else if(dir=="Left to Right")
td.style.direction="ltr";}
var cell_data=ajaxart_field_calc_field_data(field,item_data,newContext);ajaxart_field_createCellControl(item_data,cntr,td,cntr.CellPresentation,field,cell_data,newContext);var inner_cntr=jQuery(td).find('.aa_container');if(inner_cntr.length>0)
{var inner_table_body=ajaxart_find_list_under_element(inner_cntr[0]);if(jQuery(inner_table_body).parent().hasClass('aatable'))
{jQuery(td).addClass('td_of_embedded_table');var parent_header=jQuery(ajaxart_find_aa_list(cntr)).parent().find('>thead');if(!parent_header[0].HeaderFusionDone)
{parent_header.find('>tr>th').filter(function(){return this.fieldId!=field.Id}).attr('rowSpan','2');var new_tr=jQuery('<tr><th class="fieldtitle td_of_embedded_table"><table class="aa_inner_header"></table></th></tr>');new_tr.find('.fieldtitle')[0].Field=field;var orig_thead=jQuery(inner_table_body).parent().find('>thead');var inner_thead=jQuery('<thead><tr></tr></thead>');var inner_tr=inner_thead.find('tr')[0];orig_thead.find('th').each(function(){var inner_th=this.cloneNode(true);inner_th.Field=this.Field;inner_tr.appendChild(inner_th);});inner_thead.find('th').slice(0,1).addClass('first');new_tr.find('.aa_inner_header')[0].appendChild(inner_thead[0]);parent_header[0].appendChild(new_tr[0]);parent_header[0].HeaderFusionDone=true;}}}}
tr.appendChild(td);}}
if(item_aggregator)item_aggregator.push(tr);return tr;}
cntr.wrapElement=function(data1,ctx2)
{var tr=document.createElement("TR");tr.className="aa_item tablerow";tr.ItemData=item_data;tr.setAttribute("ColSpan",cntr.columns.length);}}
ajaxart_addScriptParam_js(aspect,'CreateContainer',createContainer,context);ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);return[aspect];},Sort:function(profile,data,context)
{var aspect={isObject:true};var initializeContainer=function(initData,ctx)
{var cntr=ctx.vars._Cntr[0];var removeCssClasses=function(thead,th)
{var ths=jQuery(thead).find('th');ths.removeClass('sort_ascending');ths.removeClass('sort_descending');}
var clickHandler=function(e,thead,th){var jth=jQuery(th);if(thead.LastMouseDown==null||thead.LastMouseDown.th!=th)return;var cntr=ctx.vars._Cntr[0];if(jth.hasClass('sort_ascending'))
{removeCssClasses(thead,th);jth.addClass('sort_descending');ajaxart_setUiPref(cntr.ID[0],'Sort_Field',th.Field.Id,ctx);ajaxart_setUiPref(cntr.ID[0],'Sort_Direction','sort_descending',ctx);}
else if(jth.hasClass('sort_descending'))
{removeCssClasses(thead,th);ajaxart_setUiPref(cntr.ID[0],'Sort_Field','',ctx);ajaxart_setUiPref(cntr.ID[0],'Sort_Direction','',ctx);}
else
{removeCssClasses(thead,th);jth.addClass('sort_ascending');ajaxart_setUiPref(cntr.ID[0],'Sort_Field',th.Field.Id,ctx);ajaxart_setUiPref(cntr.ID[0],'Sort_Direction','sort_ascending',ctx);}
aa_recalc_filters_and_refresh(cntr,data);}
var thead=jQuery(cntr.Ctrl).find('.aatable>thead')[0];if(thead)
registerHeaderEvent(thead,'mouseup',clickHandler,'Sort','no dominant');var sort_field=ajaxart_getUiPref(cntr.ID[0],'Sort_Field',ctx);var jth=jQuery(thead).find('>tr>th').filter(function(){return this.Field.Id==sort_field});jth.addClass(ajaxart_getUiPref(cntr.ID[0],'Sort_Direction',ctx));}
ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);return[aspect];},TableColumnsDragAndDrop:function(profile,data,context)
{var aspect={isObject:true};var initializeContainer=function(initData,ctx)
{var cntr=ctx.vars._Cntr[0];var initDD=function(dragged_class,horizontal,select_on_drag)
{var cntr=ctx.vars._Cntr[0];var _drag=function(e,thead,th){var ltr=1;var rtl=0;if(jQuery(thead).parents('.right2left').length>0)
{ltr=0;rtl=1;}
var mousepos=ajaxart.ui.mousePos(e);var oElem=thead.draggedElem;if(oElem==null)return true;oElem.style.left=(mousepos.x-oElem.mouseX)+'px';var spaceLeft=ajaxart.ui.absoluteLeft(thead.spaceElem,false);var nextRight=ltr?-1:5000;if(jQuery(thead.spaceElem).next().length>0)
{var next=jQuery(thead.spaceElem).next()[0];nextRight=ajaxart.ui.absoluteLeft(next,false)+ltr*next.offsetWidth;}
var prevLeft=ltr?-1:5000;if(jQuery(thead.spaceElem).prev().length>0)
{var prev=jQuery(thead.spaceElem).prev()[0];prevLeft=ajaxart.ui.absoluteLeft(prev,false)+rtl*prev.offsetWidth;}
var draggedLeft=ajaxart.ui.absoluteLeft(thead.draggedElem,false)+rtl*thead.draggedElem.offsetWidth;var draggedRight=ajaxart.ui.absoluteLeft(thead.draggedElem,false)+ltr*thead.draggedElem.offsetWidth;var nearRight=nextRight<draggedRight+5;if(rtl)nearRight=!nearRight;var nearLeft=prevLeft>draggedLeft-5;if(rtl)nearLeft=!nearLeft;var parent_table=jQuery(thead).parents('.aatable').slice(0,1);if(parent_table[0].ElementsTable)
var trs=jQuery(parent_table[0].ElementsTable).slice(0,1).find('.aa_item');else
var trs=jQuery(thead).parents('.aatable').slice(0,1).find('.aa_item');if(nearRight)
if(thead.spaceElem.nextSibling.nextSibling!=null)
{var draggedFieldId=thead.spaceElem.Field.Id;var droppedFieldId=thead.spaceElem.nextSibling.Field.Id;for(var j=0;j<trs.length;j++)
{var tr=trs[j];var tds=jQuery(tr).find('>td');var dragged_td=tds.filter(function(){return this.Field.Id==draggedFieldId});var dropped_td=tds.filter(function(){return this.Field.Id==droppedFieldId});if(dragged_td.length>0&&dropped_td.length>0)
dragged_td.insertAfter(dropped_td);}
jQuery(thead.spaceElem).insertAfter(jQuery(thead.spaceElem.nextSibling));if(parent_table[0].ResizeColumn)
parent_table[0].ResizeColumn(thead.spaceElem);}
if(nearLeft)
if(thead.spaceElem.previousSibling!=null)
{var draggedFieldId=thead.spaceElem.Field.Id;var droppedFieldId=thead.spaceElem.previousSibling.Field.Id;for(var j=0;j<trs.length;j++)
{var tr=trs[j];var tds=jQuery(tr).find('>td');var dragged_td=tds.filter(function(){return this.Field.Id==draggedFieldId});var dropped_td=tds.filter(function(){return this.Field.Id==droppedFieldId});if(dragged_td.length>0&&dropped_td.length>0)
dragged_td.insertBefore(dropped_td);}
jQuery(thead.spaceElem).insertBefore(jQuery(thead.spaceElem.previousSibling));if(parent_table[0].ResizeColumn)
parent_table[0].ResizeColumn(thead.spaceElem);}
return aa_stop_prop(e);};var _dragEnd=function(e){var cntr=ctx.vars._Cntr[0];var thead=jQuery(cntr.Ctrl).find('.aatable>thead')[0];var fieldIds='';jQuery(thead).find('th').each(function(){if(this.Field&&this.Field.Id)fieldIds=fieldIds+','+this.Field.Id});ajaxart_setUiPref(cntr.ID[0],'Table_Fields_Order',fieldIds,ctx);jQuery(thead.spaceElem).removeClass('aa_dragged_space_elem');thead.draggedParent.removeChild(thead.draggedElem);document.onmouseup=thead.origDocMouseup;thead.draggedElem=null;thead.Suspect=null;ajaxart.run([],profile,'OnDrop',context);aa_invoke_cntr_handlers(cntr,cntr.ContainerChange,[],ctx);thead.Owner=null;return aa_stop_prop(e);};var suspectDrag=function(e,thead,th){thead.Suspect={owner:"TableColumnsDragAndDrop",mousePos:ajaxart.ui.mousePos(e)};return aa_stop_prop(e);}
var checkSuspection=function(e,thead,th){var mousepos=ajaxart.ui.mousePos(e);if(thead.Suspect!=null)
{var distance=Math.abs(mousepos.x-thead.Suspect.mousePos.x);if(distance<5)return true;thead.Suspect=null;dragBegin(e,thead,th);}}
var unSuspectDrag=function(e,thead,th){if(thead.Owner=="TableColumnsDragAndDrop")return true;thead.Suspect=null;return true;}
var dragBegin=function(e,thead,th){ajaxart_disableSelection(thead);thead.Owner="TableColumnsDragAndDrop";var posx=ajaxart.ui.absoluteLeft(th,false);var posy=ajaxart.ui.absoluteTop(th,false);var oElem=thead.draggedElem=th.cloneNode(true);thead.draggedParent=th.parentNode;thead.draggedParent.appendChild(oElem);thead.spaceElem=th;jQuery(oElem).addClass('aa_dragged_elem');jQuery(thead.spaceElem).addClass('aa_dragged_space_elem');var mousepos=ajaxart.ui.mousePos(e);oElem.mouseX=mousepos.x-posx;oElem.style.position='absolute';oElem.style.top=posy+'px';oElem.style.left=posx+'px';thead.origDocMouseup=document.onmouseup;document.onmouseup=_dragEnd;if(e.preventDefault)
e.preventDefault();return aa_stop_prop(e);};var thead=jQuery(cntr.Ctrl).find('.aatable>thead')[0];if(thead)
{registerHeaderEvent(thead,'mousedown',suspectDrag,'TableColumnsDragAndDrop','no dominant');registerHeaderEvent(thead,'mousemove',checkSuspection,'TableColumnsDragAndDrop','suspect');registerHeaderEvent(thead,'mouseup',unSuspectDrag,'TableColumnsDragAndDrop','suspect');registerHeaderEvent(thead,'mouseout',unSuspectDrag,'TableColumnsDragAndDrop','suspect');registerHeaderEvent(thead,'mousemove',_drag,'TableColumnsDragAndDrop','dominant');}};initDD('fieldtitle',true);}
ajaxart_addScriptParam_js(aspect,'InitializeContainer',initializeContainer,context);return[aspect];}});aa_gcs("uiaction",{ButtonClick:function(profile,data,context)
{var runOn=context.vars.ControlElement[0];if(!runOn)return;if(jQuery(runOn).hasClass('aa_clickable'))aa_fire_event(runOn,'click',context,{});else{aa_fire_event(runOn,'mousedown',context,{});aa_fire_event(runOn,'mouseup',context,{});}},FindFirstInput:function(profile,data,context)
{var elements=ajaxart.getControlElement(context);if(elements.length==0)return[];var inp=jQuery(elements[0]).find('input, textarea, .ok_button');if(inp.length>0)return[inp[0]];return[];},Focus:function(profile,data,params)
{var elems=ajaxart.getControlElement(params);if(elems.length==0)return[];var elem=elems[0];var timeout=1;if(ajaxart.isSafari)timeout=100;if(jQuery(elem).parents("body").length==0){var set_focus=function(e){setTimeout(function(){if(!ajaxart.isattached(e))return;if(e.SetFocus)e.SetFocus();else e.focus();},timeout);}
set_focus(elem);}
else{if(!elem.tabIndex||elem.tabIndex==-1)elem.tabIndex=1;if(elem.SetFocus)elem.SetFocus();else elem.focus();}
return[];},GoToPage:function(profile,data,context)
{var url=aa_text(data,profile,'Url',context);if(url=="")return;var type=aa_text(data,profile,'Type',context);var target=(type=='navigate current page')?"_top":"_new";if(ajaxart.inPreviewMode==true)return[];if(target=="_new"){var controls=ajaxart.getControlElement(context);if(controls.length>0&&!ajaxart.isattached(controls[0]))return data;target="_new"+window.name+(ajaxart.unique_number++);}
window.open(url,target);return data;},Show:function(profile,data,context)
{var elements=ajaxart.getControlElement(context);for(var i=0;i<elements.length;i++)
elements[i].style.display='block';return[];},Hide:function(profile,data,context)
{var elem=ajaxart.getControlElement(context)[0];if(ajaxart.ishtml(elem))
{elem.display='none';elem.style.display='none';}
return["true"];},HideMessageBarOnUserClick:function(profile,data,context)
{var clean_message_bars=function(){var messageBars=ajaxart.getControlElement(context);for(i in messageBars)
jQuery(messageBars[i]).hide();ajaxart_capture_onclick(null);}
setTimeout(function(){ajaxart_capture_onclick(clean_message_bars)},1);return["true"];},Refresh:function(profile,data,context)
{var elements=ajaxart.getControlElement(context);for(var i=0;i<elements.length;i++)
{var element=elements[i];while(element.ReplacedBy)element=element.ReplacedBy;var ctx=element.ajaxart;if(typeof(ctx)=="undefined"||ctx==null)return;var newData=ctx.data;if(ctx.origData!=null)newData=ctx.origData;var newControl=aa_first(newData,ctx.script,"",ctx.params);if(newControl=="")newControl=document.createElement('div');element.ReplacedBy=newControl;aa_replaceElement(element,newControl)
var newContext=ajaxart.clone_context(context);ajaxart.setVariable(newContext,"ControlElement",[newControl]);ajaxart.run(data,profile,'RunOnControl',newContext);}
return["true"];},GoToUrl:function(profile,data,context)
{var url=aa_text(data,profile,'Url',context);if(window._gaq)
_gaq.push(['_trackPageview','/'+url.split('/').pop()]);if(ajaxart.inPreviewMode==true)return[];var prev_loc=window.location+"_";if(url.length>0&&window.location!=url)window.location=url;if(ajaxart.hash_change_by_js_count!=null&&prev_loc!=window.location+"_")
ajaxart.hash_change_by_js_count++;return["true"];},GoUp:function(profile,data,params)
{var topHtmlTag=aa_text(data,profile,'TopHtmlTag',params).toLowerCase();var topId=aa_text(data,profile,'TopId',params);topId=topId.replace(/ /g,"_");var topClass=aa_text(data,profile,'TopClass',params);var elems=ajaxart.getControlElement(params);if(!ajaxart.ishtml(elems))return[];var elem=elems[0];while(elem!=null&&elem.nodeType!=4){if(topClass!=""&&jQuery(elem).hasClass(topClass))return[elem];if(topId!=""&&elem.id==topId)return[elem];if(typeof(elem.tagName)!="undefined"&&elem.tagName.toLowerCase()==topHtmlTag)return[elem];elem=elem.parentNode;}
return[];},SetText:function(profile,data,context)
{var text=aa_text(data,profile,'Text',context);var mode=aa_text(data,profile,'Mode',context);var elements=ajaxart.getControlElement(context);if(elements.length==0)return[];var element=elements[0];if(jQuery(element).hasClass('aa_text')){element.innerHTML=text;return;}
if(mode=="CharByChar")
{element.value='';element.setAttribute('value','');for(var i=0;i<text.length;i++)
{xFireEvent(element,'keydown',{keyCode:text.charCodeAt(i),CharByChar:true},context.vars.InTest!=null);xFireEvent(element,'keyup',{keyCode:text.charCodeAt(i),CharByChar:true},context.vars.InTest!=null);}
return;}
var tag=element.tagName.toLowerCase();if(element.setTinyMCEText)element.setTinyMCEText(text);if(tag=="textarea")
element.value=text;else if(tag=="input")
{if(mode=="ReplaceAll")
{element.setAttribute("value",text);element.value=text;}
else if(mode=="InsertAtCaret")
{if('selectionStart'in element)
element.value=element.value.substr(0,element.selectionStart)+text+element.value.substr(element.selectionEnd,element.value.length);else if(document.selection){element.focus();document.selection.createRange().text=text;}}
else if(mode=="InsertAtEnd")
{element.value=element.value+text;element.setAttribute("value",element.value);}}else if(jQuery(element).hasClass("button_hyperlink_image"))
{ajaxart.each(jQuery(element).find(">a"),function(a){jQuery(a).text(text);});}
else if(tag=="div"||tag=="span"||tag=="button"||tag=="a")
element.innerHTML=text;aa_inuiaction=true;if(!aa_bool(data,profile,'DoNotFireEvents',context))
{xFireEvent(element,'keydown');xFireEvent(element,'keyup');}
if(!aa_bool(data,profile,'StayInControl',context))
xFireEvent(element,'blur',null);aa_inuiaction=false;return[];},AddClass:function(profile,data,context)
{var classes=aa_text(data,profile,'Cls',context);var element=ajaxart.getControlElement(context,true);jQuery(element).addClass(classes);return data;},RunUiActions:function(profile,data,context)
{var actions=ajaxart.subprofiles(profile,'Action');var newContext=ajaxart.clone_context(context);ajaxart.setVariable(newContext,"ControlElement",data);var inp=ajaxart.getVariable(context,"InputForChanges");for(var i=0;i<actions.length;i++)
var subresult=ajaxart.run(inp,actions[i],"",newContext);return data;},HasClass:function(profile,data,context)
{var cls=aa_text(data,profile,'Cls',context);var elems=ajaxart.getControlElement(context);if(elems.length==0)return[];if(jQuery(elems[0]).hasClass(cls))return["true"];return[];}});aa_gcs("ui",{OnKeyDown:function(profile,data,context)
{var control=context.vars.ControlElement[0];control.onkeydown=function(e){e=e||event;var newContext=ajaxart.clone_context(context);ajaxart.ui.applyKeyboardEvent(e,newContext);var elem=jQuery((typeof(event)=='undefined')?e.target:event.srcElement);if(elem[0]&&elem[0].tagName.toLowerCase()=='textarea')
newContext.vars.EventTargetIsTextArea=["true"];else
newContext.vars.EventTargetIsTextArea=[];ajaxart.run(data,profile,'Action',newContext);return true;}
return["true"];},ElementOfClass:function(profile,data,params){var cls=aa_text(data,profile,'Cls',params);var onlyFirst=aa_bool(data,profile,'OnlyFirst',params);var down=(aa_text(data,profile,'Direction',params)=='down');var child;if(!ajaxart.ishtml(data)){ajaxart.log("ElementOfClass - input is not html","error");return[];}
var index=0;var elements_queue=[];if(down)
elements_queue.push(data[0]);else{if(data[0].parentNode!=null)
elements_queue.push(data[0].parentNode);}
var out=[];while(index<elements_queue.length){var element=elements_queue[index];index++;if(jQuery.inArray(cls,element.className.split(/\s+/))>-1)
if(onlyFirst)
return[element];else
out.push(element);if(down)
{child=element.firstChild;while(child!=null){if(child.nodeType==1)
elements_queue.push(child);child=child.nextSibling;}}
else{if(element.parentNode!=null&&element.parentNode.nodeType==1)
elements_queue.push(element.parentNode);}}
return out;},Document:function(profile,data,context)
{var id=aa_string2id(aa_text(data,profile,'ID',context));var fields=ajaxart.run(data,profile,'Fields',context);var dataitems=ajaxart.run(data,profile,'Item',context);var operationsFunc=function(data1,ctx){return ajaxart.run(data1,profile,'Operations',aa_merge_ctx(context,ctx));}
var aspectsFunc=function(data1,ctx){var newContext=aa_merge_ctx(context,ctx);var cntr=ctx.vars._Cntr[0];var fields=cntr.Fields;var aspects=ajaxart.run(data,profile,'Presentation',newContext);ajaxart.concat(aspects,ajaxart.runsubprofiles(data,profile,'Aspect',newContext));for(var i=0;i<fields.length;i++)
if(fields[i].CntrAspects)
aspects=aspects.concat(fields[i].CntrAspects);return aspects;}
var out=aa_uidocument(data,id,dataitems,fields,aspectsFunc,operationsFunc,context);ajaxart.databind([out],data,context,profile);out.Cntr.XtmlSource=[{isObject:true,script:profile,input:data,context:context}];return[out];},ButtonAsHyperlink:function(profile,data,context)
{var btnContext=context.vars.ButtonContext[0];var out=null;;var image=aa_totext(btnContext.Image);var text=aa_totext(btnContext.Text);var tooltip=aa_totext(btnContext.Tooltip);var textInlineCss=aa_text(data,profile,'TextInlineCss',context);var imageInlineCss=aa_text(data,profile,'ImageInlineCss',context);if(image==""){out=jQuery('<a class="button_hyperlink" style="'+textInlineCss+'" title="'+tooltip+'" href="#"/>')[0];out.innerHTML=text;}
else{out=jQuery('<span class="button_hyperlink_image"/>')[0];var img=jQuery('<img src="'+image+'" style="'+imageInlineCss+'" />')[0];var alink=jQuery('<a href="#" style="'+textInlineCss+'" onclick="return false;" class="button_hyperlink" title="'+tooltip+'"/>')[0];alink.innerHTML=text;out.appendChild(img);out.appendChild(alink);}
var initEvents=function(out){out.onclick=function(e){e=e||event;if(aa_incapture)return false;ajaxart_runMethod(data,context.vars.ButtonContext[0],'OnClick',aa_ctx(context,{ControlElement:[out]}));ajaxart_stop_event_propogation(e);return false;}
jQuery(out).hover(function(){ajaxart_runMethod(data,context.vars.ButtonContext[0],'OnHover',context);},function(){});}
initEvents(out);return[out];},ExecJQuery:function(profile,data,params)
{var expression=aa_text(data,profile,'Expression',params);var controls=data;if(controls.length==0||!ajaxart.ishtml(controls[0]))
controls=ajaxart.getControlElement(params);ajaxart.each(controls,function(item){if(!ajaxart.ishtml(item))return;var exp="jQuery(item)"+expression+";";try{var $=jQuery;eval(exp);}
catch(e){ajaxart.log("failed to run jQuery exp: "+exp+" :"+e.message,"error");}});return["true"];},RunJavaScript:function(profile,data,params){ajaxart.gcs.ui.DataFromJavaScript(profile,data,params);return["true"];},StandardButton:function(profile,data,context)
{var buttonContext=context.vars.ButtonContext[0];var text=ajaxart.totext_array(buttonContext.Text);var str='<span class="button_wrapper" tabindex="1"><span class="button_outer">'
+'<span class="button_inner" >'+text+'</span></span><br/></span>';var btn=jQuery(str)[0];ajaxart_disableSelection(btn);ajaxart.databind([btn],data,context,profile);var click=function(btn)
{var jbtn=jQuery(btn);try{if(ajaxart.isattached(btn))
btn.focus();}catch(e){}
var buttonContext=context.vars.ButtonContext[0];var newContext=aa_ctx(context,{ControlElement:[btn]});ajaxart.runScriptParam(data,buttonContext.OnClick,newContext);jbtn.removeClass('pressed').removeClass('pressing');}
var mouseHandlers=function(btn){jQuery(btn).mousedown(function(){var jbtn=jQuery(btn);if(jbtn.attr('pressed_src')!="")
{jbtn.attr('src',jbtn.attr('pressed_src'));jbtn.addClass('pressed').addClass('pressing');}}).mouseout(function(){var jbtn=jQuery(btn);jbtn.removeClass('pressed');jbtn.attr('src',jbtn.attr('original_src'));}).mouseover(function(){var jbtn=jQuery(btn);if(jbtn.hasClass('pressing')){jbtn.addClass('pressed').removeClass('pressing');jbtn.attr('src',jbtn.attr('pressed_src'));}}).keydown(function(e){e=e||event;if(e.keyCode==13)
{ajaxart_stop_event_propogation(e);click(btn);return false;}}).mouseup(function(){var jbtn=jQuery(btn);if(jbtn.hasClass('pressed'))
click(btn);});};mouseHandlers(btn);return[btn];},HasClass:function(profile,data,context)
{var cls=aa_text(data,profile,'Cls',context);if(jQuery(data).hasClass(cls))
return["true"];return[];},ControlWithAction:function(profile,data,context)
{ajaxart.run(data,profile,'RunBeforeControl',context);var out=ajaxart.run(data,profile,'Control',context);var newcontext=aa_ctx(context,{ControlElement:out,_ElemsOfOperation:out});if(aa_bool(data,profile,'RunAfterControlWithTimer',context)){var timeout=1;if(ajaxart.isSafari)timeout=100;setTimeout(function(){ajaxart.run(data,profile,'RunAfterControl',newcontext);},timeout);}
else
ajaxart.run(data,profile,'RunAfterControl',newcontext);return out;},NotInCaptureMode:function(profile,data,context)
{if(window.aa_incapture)return[];return["true"];},UrlFragmentAttribute:function(profile,data,context)
{var url=aa_text(data,profile,'Url',context);var attr=aa_text(data,profile,'Attribute',context);return[aa_url_attribute(url,attr)];},DataFromJavaScript:function(profile,_data,context)
{if(_data.length==0)_data=[null];var expression=aa_text(_data,profile,'Expression',context);var _element=ajaxart.getControlElement(context);var element=null;if(_element.length>0)element=_element[0];var control=element;var data=_data[0];var result=null;try{var $=jQuery;result=eval(expression);}
catch(e){ajaxart.log("Failed to run JS expression:"+expression+", "+e.message,"error");}
if(typeof(result)=="number")
return[""+result];if(typeof(result)=="object"&&!(ajaxart.isxml))
return[""+result];if(result==null||typeof(result)=="undefined")
return[];if(result["jquery"]!=null){return result.get();}
return[result];},ItemList:function(profile,data,context,override_items,override_aspects)
{var id=aa_string2id(aa_text(data,profile,'ID',context));var cntr={ID:[id],isObject:true}
var view_page=ajaxart_getUiPref(id,'view',context);if(view_page){var out=jbart_switchpage(id,view_page,data,profile,context);if(out)return[out];}
var newcontext=aa_ctx(context,{_ParentCntr:context.vars._Cntr,_Cntr:[cntr]});if(aa_bool(data,profile,'DataHolderCntr',context))
newcontext=aa_ctx(newcontext,{DataHolderCntr:[cntr]});var data_items;if(aa_paramExists(profile,'DataHolder')&&!override_items)
{cntr.DataHolder=dataholder=aa_first(data,profile,'DataHolder',newcontext);cntr.Fields=dataholder.Fields;cntr.Items=data_items=[{isObject:true,Items:dataholder.Wrappers}];newcontext=aa_ctx(newcontext,{DataHolderCntr:[cntr],_Items:data_items});}
else
{data_items=override_items||ajaxart.run(data,profile,'Items',newcontext);if(!data_items[0])data_items=[{Items:[]}];cntr.Items=data_items;ajaxart.setVariable(newcontext,"_Items",data_items);cntr.Fields=ajaxart.run(data,profile,'Fields',aa_ctx(newcontext,{_FormulaInput:data_items[0].Items}));}
if(override_aspects)
var aspects=override_aspects;else{var aspects=ajaxart.run(data,profile,'Presentation',newcontext);aspects=aspects.concat(ajaxart.runsubprofiles(data,profile,'Aspect',newcontext));}
for(var i=0;i<cntr.Fields.length;i++)
if(cntr.Fields[i].CntrAspects)
{var fld_aspects=cntr.Fields[i].CntrAspects;for(var j=0;j<fld_aspects.length;j++)
aspects.push(fld_aspects[j].GetContent(data,newcontext)[0]);}
var orignalItemListFunc=function(newcontext){return function(override_items,override_aspects){return ajaxart.gcs.ui.ItemList(profile,data,newcontext,override_items,override_aspects);}}
for(var i=0;i<aspects.length;i++)
if(aspects[i].takeOver!=null)
return aspects[i].takeOver(aspects,data_items,orignalItemListFunc(newcontext),newcontext);cntr.Ctrl=jQuery('<div class="aa_container aa_inherit_selection"><div class="aa_container_header"/><ul class="aa_list aa_listtop aa_cntr_body"/><div class="aa_container_footer"/></div>')[0];if(id!='')
jQuery(cntr.Ctrl).addClass('Page_'+id);for(var i=0;i<aspects.length;i++)
ajaxart.runScriptParam(data,aspects[i].CreateContainer,newcontext);cntr.Ctrl.Cntr=cntr;ajaxart.databind([cntr.Ctrl],data,context,profile);cntr.Items=data_items;cntr.PostActors=[];cntr.PreActors=[];cntr.RegisterForPostAction=function(aspect,phase){cntr.PostActors.push({phase:phase||0,aspect:aspect});}
cntr.RegisterForPreAction=function(aspect,phase){cntr.PreActors.push({phase:phase||0,aspect:aspect});}
cntr.Aspects=aspects;cntr.XtmlSource=[{isObject:true,script:profile,input:data,context:context}];cntr.createNewElement=function(item_data,item_aggregator)
{var li=document.createElement('li');li.className="aa_item";li.ItemData=item_data;ajaxart_add_foucs_place(li);if(item_aggregator)
item_aggregator.push(li);return li;};cntr.insertNewElement=function(elem,parent)
{var list=ajaxart_find_list_under_element(parent);if(list!=null)
list.appendChild(elem);};cntr.next=ajaxart_tree_next;cntr.prev=ajaxart_tree_prev;cntr.ElemsOfOperation=function()
{if(this.GetMultiSelectedItems)
return this.GetMultiSelectedItems();return jQuery(this.Ctrl).find('.aa_selected_item').slice(0,1).get();}
cntr.ItemsOfOperation=function()
{var elems=this.ElemsOfOperation();var itemsData=[];for(var i in elems)
itemsData=itemsData.concat(elems[i].ItemData);return itemsData;}
cntr.Context=newcontext;aa_setMethod(cntr,'Operations',profile,'Operations',context);for(var i=0;i<cntr.Aspects.length;i++){try{ajaxart_runMethod(data,cntr.Aspects[i],'InitializeContainer',newcontext);}catch(e){ajaxart.log("error in aspect "+cntr.Aspects[i].XtmlSource[0].script.getAttribute('t')+": "+e.message,"error");}}
cntr.PreActors.sort(function(a,b){return a.phase>b.phase?1:-1;});cntr.PostActors.sort(function(a,b){return a.phase>b.phase?1:-1;});for(var i=0;i<cntr.PreActors.length;i++){ajaxart.trycatch(function(){ajaxart_runMethod(data,cntr.PreActors[i].aspect,'PreAction',newcontext);},function(e){ajaxart.log(e.message,"error");});}
if(cntr.DataHolder)
cntr.DataHolder.UserDataView.Sort=cntr.Dataview_PreSort||[];aa_recalc_filters_and_refresh(cntr,data,newcontext,false);if(cntr.SoftSelector)
{var top_cntr_list=ajaxart_find_aa_list(cntr);var all_elems=jQuery(top_cntr_list).find('.aa_item').get();var key_to_select=ajaxart.totext_array(ajaxart.runScriptParam(data,cntr.SoftSelector.GetValue,cntr.Context));for(var i=0;i<all_elems.length;i++)
if(cntr.ItemId&&key_to_select!=""&&cntr.ItemId(all_elems[i].ItemData,all_elems[i])==key_to_select)
ajaxart_uiaspects_select(jQuery(all_elems[i]),jQuery([]),"auto",cntr.Context);}
return[cntr.Ctrl];},Html:function(profile,data,params)
{var html=aa_text(data,profile,'Html',params);var tag=aa_text(data,profile,'Tag',params);var dynamicContent=aa_bool(data,profile,'DynamicContent',params);if(html==""){html=aa_xml2htmltext(ajaxart.childElem(profile,"*"));if(dynamicContent)
html=ajaxart.dynamicText(data,html,params,data,false,true)[0];}
if(tag!=""){var out=document.createElement(tag);out.innerHTML=html;return[out];}
else{if(html==null)return[];return[jQuery(html)[0]];}},RunInControlContext:function(profile,data,context)
{var elements=ajaxart.getVariable(context,"ControlElement");var mode=aa_text(data,profile,'Mode',context);var out=[];ajaxart.each(elements,function(element){var elem_context=element["ajaxart"];if(elem_context==null){ajaxart.log("RunInControlContext - control has no databind","warning")
return[];}
var newContext=elem_context.params;if(mode=='copy control variables')
{newContext=ajaxart.clone_context(context);for(i in elem_context.params.vars)
newContext.vars[i]=elem_context.params.vars[i];}
ajaxart.setVariable(newContext,"ControlElement",[element]);ajaxart.concat(out,ajaxart.run(elem_context.data,profile,'Item',newContext));});return out;},Image:function(profile,data,context)
{var src=aa_text(data,profile,'Source',context);var title=ajaxart_multilang_text(aa_text(data,profile,'Title',context),context);var width=aa_text(data,profile,'Width',context);var height=aa_text(data,profile,'Height',context);var out=jQuery('<img />')[0];out.setAttribute("src",src);out.setAttribute("title",title);if(height!="")
out.setAttribute('height',height);if(width!="")
out.setAttribute('width',width);if(ajaxart.subprofiles(profile,'OnClick')!=null)
out.className='clickable';jQuery(out).click(function(){ajaxart.run(data,profile,"OnClick",aa_ctx(context,{ControlElement:[this]}));});return[out];},Text:function(profile,data,context)
{var text=aa_text(data,profile,'Text',context);var style=aa_text(data,profile,'Style',context);var multiLang=aa_bool(data,profile,'MultiLang',context);if(multiLang)
text=aa_text([text],ajaxart.parsexml('<s t="text.MultiLang" Pattern="%%" Dynamic="true"/>'),'',context);if(!aa_bool(data,profile,'HtmlContents',context))
text=text.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br/>");var span=document.createElement("span");if(style!="")
aa_setCssText(span,style);span.className="ajaxart_text";span.innerHTML=text;var hint=aa_text(data,profile,'Hint',context);if(hint!="")span.setAttribute('title',hint);return[span];},SetCssProperty:function(profile,data,params)
{var property=aa_text(data,profile,'Property',params);var value=aa_text(data,profile,'Value',params);if(property==""||!ajaxart.ishtml(data[0]))return data;jQuery(data[0]).css(property,value);return data;},ScreenSize:function(profile,data,context)
{var axis=aa_text(data,profile,'Axis',context);var margin=aa_int(data,profile,'Margin',context);var num=0;if(axis=='height')
num=window.innerHeight||(document.documentElement.clientHeight||document.body.clientHeight);else
num=window.innerWidth||(document.documentElement.clientWidth||document.body.clientWidth);num-=margin;if(aa_bool(data,profile,'AsHtmlString',context))
return[""+num+"px"];return[num];}});aa_gcs("text",{Text:function(profile,data,context)
{var pattern=aa_text(data,profile,'Text',context);var result=ajaxart.dynamicText(data,pattern,context);var text_result=ajaxart.totext_array(result);if(aa_bool(data,profile,'RemoveEmptyParenthesis',context))
test_result=text_result.replace('\(\)','').replace(/^\s*/,'').replace(/\s*$/,'');return[text_result];},Split:function(profile,data,context)
{var sep=aa_text(data,profile,'Separator',context);var part=aa_text(data,profile,'Part',context);var index=aa_text(data,profile,'Index',context);var str=aa_text(data,profile,'Text',context);var result='';if(str=='')return[];var items=str.split(sep);if(aa_bool(data,profile,'NoEmptyValues',context)){for(var i=items.length-1;i>=0;i--)
if(items[i]=="")items.splice(i,1);}
switch(part)
{case"All":return items;case"ButFirst":if(items.length>=1)return items.slice(1);break;case"First":if(items.length>=1)result=items[0];break;case"Second":if(items.length>=2)result=items[1];break;case"All but Last":var out=[];for(var i=0;i<items.length-1;i++)
out.push(items[i]);return out;case"All but First":var out=[];for(var i=1;i<items.length;i++)
out.push(items[i]);return out;case"All but First and Last":var out=[];for(var i=1;i<items.length-1;i++)
out.push(items[i]);return out;case"Second":if(items.length>=2)result=items[1];break;case"By index":try{var index_num=eval(index);if(items.length>=index_num)result=items[index_num-1];break;}catch(e){ajaxart.log("No index: "+index+","+e.message,"error");}
break;case"Last":if(items.length>0)result=items[items.length-1];break;};if(result=='')
result=aa_text(data,profile,'Default',context);return[result];},UrlEncoding:function(profile,data,context)
{var urlpart=ajaxart.totext_array(data);var type=aa_text(data,profile,'Type',context);if(type=="encode")
return[encodeURIComponent(urlpart)];else
return[decodeURIComponent(urlpart)];},Translate:function(profile,data,context)
{var text=aa_text(data,profile,'Text',context);var out=ajaxart_multilang_text(text,context);return[out];},Replace:function(profile,data,params)
{var find=aa_text(data,profile,'Find',params);var replaceWith=aa_text(data,profile,'ReplaceWith',params);var useRegex=aa_bool(data,profile,'UseRegex',params);var replaceAll=aa_bool(data,profile,'ReplaceAll',params);var str=aa_text(data,profile,'Text',params);var result="";if(replaceAll)
var reg=new RegExp(find,"g");else
var reg=new RegExp(find);result=str.replace(reg,replaceWith);return[result];},Concat:function(profile,data,context)
{var prefix=aa_text(data,profile,'Prefix',context);var suffix=aa_text(data,profile,'Suffix',context);var sep=aa_text(data,profile,'Separator',context);var items=ajaxart.run(data,profile,'Items',context);var lastSeparator=aa_text(data,profile,'LastSeparator',context);var maxLength=aa_int(data,profile,'MaxLength',context);if(lastSeparator=="")
lastSeparator=sep;var out=prefix;var compiledItemText=ajaxart.compile(profile,'ItemText',context);for(var i=0;i<items.length;i++){var item=items[i];var current="";if(compiledItemText=="same")current=ajaxart.totext_item(item);else if(compiledItemText==null)current=aa_text([item],profile,'ItemText',context);else current=ajaxart.totext_array(compiledItemText([item],context));if(current!=""){if(i!=0&&i+1<items.length)out+=sep;if(i!=0&&i+1==items.length)out+=lastSeparator;out+=current;}
if(out.length>maxLength&&maxLength>0){var overmaxtext=aa_text(data,profile,'SuffixForMax',context);out=out.substring(0,maxLength)+overmaxtext;return[out+suffix];}}
var items_array=ajaxart.subprofiles(profile,'Item');for(var i=0;i<items_array.length;i++){var current=aa_text(data,items_array[i],"",context);if(current!=""){if(i!=0&&i+1<items_array.length)out+=sep;if(i!=0&&i+1==items_array.length)out+=lastSeparator;out+=current;}}
out+=suffix;return[out];},FirstSucceeding:function(profile,data,context)
{var itemProfiles=ajaxart.subprofiles(profile,'Item');for(var i=0;i<itemProfiles.length;i++)
{var subresult=ajaxart.run(data,itemProfiles[i],"",context);for(var j=0;j<subresult.length;j++)
{if(ajaxart.totext_item(subresult[j]).length>0)
return subresult;}}
return[];}});aa_gcs("server",{ImmediateResult:function(profile,data,context)
{var mySync=ajaxart.getVariable(context,"_CallServerObject");if(mySync.length>0){var varname=aa_text(data,profile,'VarNameForResult',context);var result=ajaxart.run(data,profile,'Result',context);mySync[0].servervars[varname]=result;ajaxart.run(result,profile,'OnLoad',context);mySync[0].register(mySync[0],varname);mySync[0].serverResult(mySync[0],true,varname);}
return["true"];},CallServer:function(profile,data,context)
{var indication=aa_bool(data,profile,'ProgressIndication',context);if(indication)
ajaxart.runNativeHelper('StartCallingServer',[],profile,context);ajaxart.server.RunParallelCalls(profile,data,context,'Call',function(){ajaxart.runComponent('server.OnEndCallingServer',[],context);});return["true"];}});aa_gcs("operation",{Operations:function(profile,data,context)
{return ajaxart.runsubprofiles(data,profile,'Operation',context);}});aa_gcs("object",{SetTextProperty:function(profile,data,context)
{var obj=aa_first(data,profile,'Object',context);var prop=aa_text(data,profile,'Property',context);if(obj==null||prop=="")return[];obj[prop]=aa_text(data,profile,'Value',context);},ObjectFromParams:function(profile,data,context)
{var out={isObject:true};for(var i in context.params){var name=i;var val=context.params[i];if(val.isParamScript==true){out[name]=val;out[name].context=context.componentContext;}
else
out[name]=val;}
var elem=profile.firstChild;while(elem!=null)
{if(elem.nodeType==1)
{var tag=elem.tagName;var name=elem.getAttribute('name');if(name==null||name==""){elem=elem.nextSibling;continue;}
if(tag=='Property'){out[name]=ajaxart.run(data,elem,'',context);}else if(tag=='Method'){out[name]={script:elem,context:context,objectForMethod:[out],compiled:ajaxart.compile(elem,'',context,elem.getAttribute("paramVars"))};}}
elem=elem.nextSibling;}
return[out];},Object:function(profile,data,context)
{var out={isObject:true};var elem=profile.firstChild;while(elem!=null)
{if(elem.nodeType==1)
{var tag=elem.tagName;var name=elem.getAttribute('name');if(name==null||name==""){elem=elem.nextSibling;continue;}
if(tag=='Property'){out[name]=ajaxart.run(data,elem,'',context);}else if(tag=='SingleProperty'){out[name]=aa_first(data,elem,'',context);}else if(tag=='TextProperty'){out[name]=aa_text(data,elem,'',context);}else if(tag=='Method'){ajaxart_addMethod(out,name,elem,'',context);}}
elem=elem.nextSibling;}
var atts=profile.attributes;for(var i=0;i<atts.length;i++){var att_name=atts.item(i).nodeName;if(att_name!="t"&&att_name!="value"&&att_name!='Data'&&att_name!="name"&&att_name!="Trace")
out[att_name]=ajaxart.totext_array(ajaxart.dynamicText(data,atts.item(i).nodeValue,context));}
return[out];},SetProperty:function(profile,data,context)
{var obj=aa_first(data,profile,'Object',context);var prop=aa_text(data,profile,'Property',context);if(obj==null||prop=="")return[];if(aa_bool(data,profile,'IsSingleProperty',context))
obj[prop]=aa_first(data,profile,'Value',context);else
obj[prop]=ajaxart.run(data,profile,'Value',context);return["true"];},AddToProperty:function(profile,data,context)
{var obj=aa_first(data,profile,'Object',context);var prop=aa_text(data,profile,'Property',context);var value=ajaxart.run(data,profile,'Value',context);if(obj==null||prop=="")return[];if(obj[prop]==null)obj[prop]=[];ajaxart.concat(obj[prop],value);return["true"];},SetMethod:function(profile,data,context)
{var obj=aa_first(data,profile,'Object',context);var method=aa_text(data,profile,'Method',context);if(obj==null||method=="")return[];var cmpl=ajaxart.compile(profile,'Xtml',context,'');if(cmpl=="same"){obj[method]=function(data1){return data1;}}
else if(cmpl!=null){var methodFunc=function(obj,cmpl){return function(data1,ctx){var newContext=ajaxart_mergeContext(context,ctx);newContext._This=obj;return cmpl(data1,newContext);}}
obj[method]=methodFunc(obj,cmpl);}
else{var methodFunc=function(obj){return function(data1,ctx){var newContext=ajaxart_mergeContext(context,ctx);newContext._This=obj;return ajaxart.run(data1,profile,'Xtml',newContext);}}
obj[method]=methodFunc(obj);}
return["true"];},SetBooleanProperty:function(profile,data,context)
{var obj=aa_first(data,profile,'Object',context);var prop=aa_text(data,profile,'Property',context);if(obj==null||prop=="")return[];obj[prop]=aa_bool(data,profile,'Value',context);return["true"];},OverrideObject:function(profile,data,context)
{var overrides=ajaxart.gcs.object.Object(profile,data,context)[0];var out=aa_first(data,profile,'Object',context);if(out==null)return[];for(var i in overrides)
out[i]=overrides[i];return[out];},IsObject:function(profile,data,context)
{if(data.length==0)return[];return data[0].isObject?["true"]:[];},RunMethod:function(profile,data,context)
{var obj=aa_first(data,profile,'Object',context);var method=aa_text(data,profile,'Method',context);var input=data;if(profile.getAttribute("Input")!=null||ajaxart.xml.xpath(profile,'Input').length>0)
input=ajaxart.run(data,profile,'Input',context);if(obj==null)return[];var scriptParam=obj[method];if(scriptParam==null)return[];var newContext=context;var params=ajaxart.xml.xpath(profile,'Param');if(params.length>0)newContext=ajaxart.clone_context(context);for(var i=0;i<params.length;i++)
newContext.vars[params[i].getAttribute('name')]=ajaxart.run(data,params[i],'',newContext);if(typeof(scriptParam)=="function")return scriptParam.call(obj,input,newContext);return ajaxart.runScriptParam(input,scriptParam,newContext);}});aa_gcs("menu",{ContextMenu:function(profile,data,context)
{var items=[];var itemProfiles=ajaxart.subprofiles(profile,'Item');for(prof in itemProfiles)
ajaxart.concat(items,ajaxart.run(data,itemProfiles[prof],'',context));var ctx_menu_input=ajaxart.dynamicText(data,"%$_ContextMenuContext/Input%",context);var fromMenu=ajaxart.dynamicText(data,"%$_ContextMenuContext/FromMenu%",context);var footerMessage=aa_text(data,profile,"FooterMessage",context);var headerMessage=aa_text(data,profile,"HeaderMessage",context);ajaxart.menu.closeCurrentContextMenu();var menu=jQuery('<div class="contextmenu"/>');if(headerMessage!=""){var header=jQuery('<div class="context_menu_header_message" />');header.text(headerMessage);menu.append(header);}
menu.bind('contextmenu',function(){return false;});var ul=jQuery('<ul class="contextmenu_ul">');menu.append(ul);for(var i=0;i<items.length;i++){var image=ajaxart.totext(items[i].Image);var text=ajaxart.totext(items[i].Text);var img=jQuery('<img class="contextmenu_image" />').attr("src",image);var span=jQuery('<span class="contextmenu_span" />').text(text);var li=jQuery('<li class="contextmenu_li" />').append(img).append(span);li.addClass("menu_item_"+ajaxart.totext(items[i].ID));ul.append(li);li[0]["menu_item"]=items[i];li[0]["input"]=items[i].Input;if(i==0)li.addClass("selected");li.click(function(e){var newContext=ajaxart.clone_context(this.menu_item.Action.context);ajaxart.setVariable(newContext,"MenuItemInfo",[this.menu_item]);ajaxart.menu.closeCurrentContextMenu();ajaxart.run(this.input,this.menu_item.Action.script,"",newContext);});li.hover(function(){jQuery(this.parentNode).find('.selected:visible').removeClass('selected');jQuery(this).addClass('selected');},function(){});}
if(footerMessage!=""){var footer=jQuery('<div class="context_menu_footer_message" />');footer.text(footerMessage);menu.append(footer);}
jQuery(document).mouseup(function(e){if(e.which==3)return;if(ajaxart.menu.currentContextMenu==null)return;var element=(typeof(e.target)=='undefined')?e.srcElement:e.target;if(jQuery(element).parents(".contextmenu").length==0)
ajaxart.menu.closeCurrentContextMenu();});jQuery(document).mousemove(function(e){if(ajaxart.menu.currentContextMenu==null)return;var x=e.pageX;var y=e.pageY;var cm_left=ajaxart.ui.absoluteLeft(ajaxart.menu.currentContextMenu[0]);var cm_top=ajaxart.ui.absoluteTop(ajaxart.menu.currentContextMenu[0]);var cm_right=cm_left+jQuery(ajaxart.menu.currentContextMenu[0]).width();var cm_bottom=cm_top+jQuery(ajaxart.menu.currentContextMenu[0]).height();if(x<cm_left-80||x>cm_right+80||y<cm_top-40||y>cm_bottom+80){ajaxart.menu.closeCurrentContextMenu();}
return true;});var focusControl=ajaxart.getVariable(context,"_CurrentFocus");if(focusControl.length>0&&focusControl[0].alreadyBounded!=true){focusControl[0]["alreadyBounded"]=true;jQuery(focusControl[0]).keyup(function(e){if(ajaxart.menu.currentContextMenu==null)return;if(e.keyCode==13){var selected=ajaxart.menu.currentContextMenu.find('.selected')[0];var newContext=ajaxart.clone_context(selected.menu_item.Action.context);ajaxart.setVariable(newContext,"MenuItemInfo",[selected.menu_item]);ajaxart.menu.closeCurrentContextMenu();ajaxart.run(selected.input,selected.menu_item.Action.script,"",newContext);}
ajaxart_stop_event_propogation(e);});jQuery(focusControl[0]).keydown(function(e){if(ajaxart.menu.currentContextMenu==null)return;if(e.keyCode==27)
ajaxart.menu.closeCurrentContextMenu();if(e.keyCode==38||e.keyCode==40){var jSelected=ajaxart.menu.currentContextMenu.find('.selected');var nextItem;if(e.keyCode==38)
nextItem=jSelected[0].previousSibling;if(e.keyCode==40)
nextItem=jSelected[0].nextSibling;;if(nextItem!=null){jSelected.removeClass('selected');jQuery(nextItem).addClass('selected');}}
ajaxart_stop_event_propogation(e);return false;});}
jQuery(document).keypress(function(e){if(e.keyCode==27)
ajaxart.menu.closeCurrentContextMenu();});menu.appendTo("body");ajaxart.menu.currentContextMenu=menu;var controlForPosition=ajaxart.getControlElement(context,true);if(ajaxart.getVariable(context,"_CurrentFocus").length>0)
controlForPosition=ajaxart.getVariable(context,"_CurrentFocus")[0];if(fromMenu=='vmenu'){controlForPosition=jQuery(ajaxart.getControlElement(context)).find('>*');if(controlForPosition.length>0)
controlForPosition=controlForPosition[0];else
controlForPosition=null;}
ajaxart.dialog.positionPopup(menu,controlForPosition,null,true,context);return[];}});aa_gcs("jbart",{});aa_gcs("group",{});aa_gcs("field_aspect",{WritableControl:function(profile,data,context)
{var field=ajaxart_fieldaspect_getField(context);if(field==null)return[];aa_setMethod(field,'WritableControl',profile,'Control',context);return[];},CellPresentation:function(profile,data,context)
{var field=ajaxart_fieldaspect_getField(context);if(field==null)return[];field.CellPresentation=aa_text(data,profile,'Content',context);return[];},ImageReadOnlyImp:function(profile,data,context)
{var field=ajaxart_fieldaspect_getField(context);if(field==null)return[];field.ImageHeight=aa_text(data,profile,'Height',context);field.ImageWidth=aa_text(data,profile,'Width',context);field.KeepImageProportions=aa_bool(data,profile,'KeepImageProportions',context)&&field.ImageHeight!=""&&field.ImageWidth!="";field.HideEmptyImage=aa_bool(data,profile,'HideEmptyImage',context);field.ImageWidth=field.ImageWidth.split('px')[0];field.ImageHeight=field.ImageHeight.split('px')[0];if(!field.KeepImageProportions){if(field.ImageWidth!="")field.ImageWidth+='px';if(field.ImageHeight!="")field.ImageHeight+='px';}
var urlForMissingImage=aa_text(data,profile,'UrlForMissingImage',context);var textForMissingImage=aa_text(data,profile,'TextForMissingImage',context);var src_compiled=ajaxart.compile(profile,'Src',context);field.Text=function(data1,ctx)
{var field=this;var src=ajaxart_runcompiled_text(src_compiled,data1,profile,"Src",ctx);if(field.HideEmptyImage&&ajaxart.totext_array(data1)=="")
src="";if(src==""){if(textForMissingImage!="")
return[jQuery("<span class='aa_missing_image'></span>").text(textForMissingImage)[0]];else if(urlForMissingImage!="")
src=urlForMissingImage;else return["<span/>"];}
var out="<img src='"+src+"'";var style=" style='";if(field.ImageHeight!=""){style=style+"height:"+field.ImageHeight+"; ";out+=' height="'+field.ImageHeight+'"';}
if(field.ImageWidth!=""){style=style+"width:"+field.ImageWidth+"; ";out+=' width="'+field.ImageWidth+'"';}
out=out+style+"' ";out+="/>";return[out]}
field.ReadOnlyControl=function(data1,ctx){var field=this;var image=jQuery(this.Text(data1,ctx)[0])[0];if(aa_paramExists(profile,'OnClick'))
{image.onclick=function(){ajaxart.run(data1,profile,'OnClick',aa_merge_ctx(context,ctx));}
jQuery(image).css('cursor','pointer');}
if(field.KeepImageProportions){aa_keepimageprops(image,field.ImageWidth,field.ImageHeight);var wrapper=jQuery('<div style="overflow:hidden; width:'+field.ImageWidth+"px; height:"+field.ImageHeight+'px"/>')[0];wrapper.appendChild(image);return[wrapper];}
return[image];}
if(field.KeepImageProportions)
field.CellPresentation='control';return[];},Control:function(profile,data,context)
{var field=ajaxart_fieldaspect_getField(context);if(field==null)return[];ajaxart_addControlMethod(field,'WritableControl',data,profile,'Control',context);return[];},OnUpdate:function(profile,data,context)
{var field=ajaxart_fieldaspect_getField(context);var onUpdate=function(field,field_data,input,e,extra)
{var ctx1=input.ajaxart?aa_merge_ctx(context,input.ajaxart.params):context;var parent_elem=jQuery(input).parents('.aa_item')[0];var item=parent_elem&&parent_elem.ItemData;var newContext=aa_ctx(ctx1,{_Field:[field],_FieldData:field_data,_Input:[input],ControlElement:[input],_Item:item||[]});if(extra)newContext=aa_ctx(newContext,extra);if(jQuery(input).parents('.aa_container').length>0)
newContext.vars._Cntr=[jQuery(input).parents('.aa_container')[0].Cntr];ajaxart.run(field_data,profile,'Action',newContext);}
aa_field_handler(field,'OnUpdate',onUpdate);return[];},Resizer:function(profile,data,context)
{var field=context.vars._Field[0];if(aa_bool(data,profile,'Disable',context))
{aa_field_handler(field,'ModifyControl',function(){},'resizer');return[];}
var resizer=function(cell,field_data,cell_presentation,ctx){function init(input,field){function cellResizeStart(e){document.onmouseup=cellResizeStop;input.onmousemove=null;document.onmousemove=cellResizeMove;return aa_stop_prop(e);}
function cellResizeMove(e){var mousepos=ajaxart.ui.mousePos(e);var new_size=mousepos.x-ajaxart.ui.absoluteLeft(input,true);if(jQuery(input).parents('.right2left').length>0)
new_size=ajaxart.ui.absoluteLeft(input,true)+input.offsetWidth-mousepos.x;jQuery(input).width(new_size);if(ctx.vars._Cntr)
ajaxart_setUiPref(aa_totext(ctx.vars._Cntr[0].ID),field.Id+'_Width',''+new_size+'px',ctx);return aa_stop_prop(e);}
function cellResizeStop(e){jQuery(input).removeClass('col_resize');document.onmouseup=null;document.onmousemove=null;input.onmousemove=input.DetectResize;input.onmousedown=input.onmousedownOrig;return aa_stop_prop(e);}
input.onmousemove=input.DetectResize=function(e){var mousepos=ajaxart.ui.mousePos(e);var in_resize_place=ajaxart.ui.absoluteLeft(input,true)+input.offsetWidth-mousepos.x<3;if(jQuery(input).parents('.right2left').length>0)
in_resize_place=mousepos.x-ajaxart.ui.absoluteLeft(input,true)<3;if(in_resize_place)
{jQuery(input).addClass('col_resize');input.onmousedown=cellResizeStart;}
else
{jQuery(input).removeClass('col_resize');input.onmousedown=input.onmousedownOrig;}}}
if(cell.ReadOnly)return;var input=jQuery(cell).find('>.field_control')[0];if(input!=null)
{input.onmousedownOrig=input.onmousedown;init(input,field);if(ctx.vars._Cntr)
{var cntr=ctx.vars._Cntr[0];var field_width=ajaxart_getUiPref(aa_totext(cntr.ID),field.Id+'_Width',ctx);if(field_width!=null)
jQuery(input).css('width',field_width);}}}
aa_field_handler(field,'ModifyControl',resizer,'resizer');return[];},DescriptionForEmptyText:function(profile,data,context)
{var field=ajaxart_fieldaspect_getField(context);field.DescriptionForEmptyText=ajaxart.totext_array(ajaxart_multilang_run(data,profile,'Description',context));aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx,item)
{if(ajaxart_field_is_readOnly(ctx.vars._Cntr[0],cell.Field,ctx))return;var field=cell.Field;var input=jQuery(cell).find('.field_control')[0];if(input)
{input.getValue=function(){var input=this;if(jQuery(input).hasClass('empty_text_description')&&input.value==field.DescriptionForEmptyText)return'';return input.value;}
input.RefreshDescriptionForEmptyText=function(){var input=this;if(input.value=='')
{jQuery(input).addClass('empty_text_description');input.value=field.DescriptionForEmptyText;input.setAttribute('value',field.DescriptionForEmptyText);}}
input.RefreshDescriptionForEmptyText();}},'DescriptionForEmptyText',10);aa_field_handler(field,'OnFocus',function(field,field_data,input)
{if(jQuery(input).hasClass('empty_text_description'))
{if(input.value==field.DescriptionForEmptyText)
input.value="";jQuery(input).removeClass('empty_text_description');}},'DescriptionForEmptyText',10);aa_field_handler(field,'OnBlur',function(field,field_data,input)
{if(input.value=='')
{jQuery(input).addClass('empty_text_description');input.value=field.DescriptionForEmptyText;}},'DescriptieonForEmptyText',10);return[];},Hyperlink:function(profile,data,context)
{var field=context.vars._Field[0];aa_field_handler(field,'ModifyCell',function(td,field_data,cell_presentation,ctx,item){jQuery(td).addClass("aa_hyperlink");jQuery(td).click(function(){ajaxart.run(item,profile,'Action',aa_ctx(aa_merge_ctx(context,ctx),{_ItemsOfOperation:item,Item:item,_ElemsOfOperation:[this.parentNode],ControlElement:[td]}));});});},Mandatory:function(profile,data,context)
{var field=context.vars._Field[0];field.Mandatory=true;if(!field.Validations)field.Validations=[];var obj={isObject:true,CheckValidation:'on save',Mandatory:true}
var init=function(field,obj){obj.Validation=function(data1,ctx){var txt=aa_totext(data1);return aa_frombool(txt=="");}
obj.ErrorMessage=function(data1,ctx){if(field.MandatoryMessage)
return field.MandatoryMessage(data1,ctx);return ajaxart.runComponent('ui.MandatoryMessage',[],aa_ctx(ctx,{FieldTitle:[field.Title]}));}
if(ajaxart.fieldscript(profile,'ErrorMessage',true))
field.MandatoryMessage=function(data1,ctx){ctx=aa_merge_ctx(context,ctx);return ajaxart.run(data1,profile,'ErrorMessage',ctx);}}
init(field,obj);field.Validations.push(obj);return[];},Css:function(profile,data,context)
{var css_for=aa_text(data,profile,'OnElement',context);var class_compiled=ajaxart.compile(profile,'Class',context);var inline_compiled=ajaxart.compile(profile,'Inline',context);var condition_compiled=ajaxart.compile(profile,'OnCondition',context);var apply_css=function(elems,data2){for(var i=0;i<elems.length;i++){if(!ajaxart_runcompiled_bool(condition_compiled,data2,profile,"OnCondition",context,true))return;var cls=ajaxart_runcompiled_text(class_compiled,data2,profile,"Class",context);var inline=ajaxart_runcompiled_text(inline_compiled,data2,profile,"Inline",context);if(inline!="")aa_setCssText(elems[i],elems[i].style.cssText+";"+inline);if(cls!="")elems[i].className=elems[i].className+" "+cls;}};var register=function(apply_css,css_for){var css=function(cell,field_data,cell_presentation,ctx){if(css_for=="cell")
var work_on=cell;else if(css_for=="content")
var work_on=jQuery(cell).find('.field_control')[0];else if(css_for=="title")
var work_on=jQuery(cell.parentNode).find('>.propertysheet_title_td')[0];else
var work_on=cell;if(!work_on)
work_on=cell;apply_css([work_on],field_data);}
var field=ajaxart_fieldaspect_getField(context);aa_field_handler(field,'ModifyCell',css);}
register(apply_css,css_for);return[];},LimitTextLength:function(profile,data,context)
{var field=ajaxart_fieldaspect_getField(context);if(field==null)return[];var maxLength=aa_int(data,profile,'MaxLength',context);if(maxLength<=0)return;var cuttingMark=aa_text(data,profile,'CuttingMark',context);var fullTextAsTooltip=aa_bool(data,profile,'FullTextAsTooltip',context);var text_func=function(field_data,ctx){var text=ajaxart.totext_array(this.OriginalText(field_data,ctx));if(text.length>maxLength)
return[text.substring(0,maxLength-cuttingMark.length)+cuttingMark];else
return[text];};if(field.Text==null)
field.Text=function(field_data,ctx){return field_data;}
field.OriginalText=field.Text;field.Text=text_func;if(fullTextAsTooltip)
aa_field_handler(field,'ModifyCell',function(cell,field_data,cell_presentation,ctx){var original_text=ajaxart.totext_array(field.OriginalText(field_data,ctx));if(original_text.length>maxLength)
cell.setAttribute("title",original_text);});return[];},PopupImage:function(profile,data,context)
{var field=context.vars._Field[0];var id=aa_text(data,profile,'ID',context);if(id=='')id=null;field.PupupImageCss=aa_text(data,profile,'CssClass',context);aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx){if(ajaxart_field_is_readOnly(ctx.vars._Cntr[0],cell.Field,ctx))return;var input=jQuery(cell).find('.field_control')[0];if(input==null)return;var img=document.createElement("span");img.className='aa_field_image image_fld_'+field.Id+' '+field.PupupImageCss;img.innerHTML='&nbsp;';jQuery(img).insertAfter(input);img.onmousedown=function(e)
{var field=ctx.vars._Field[0];var input=jQuery(cell).find('.field_control')[0];if(input&&input.TogglePopup&&!jQuery(input).hasClass('aa_disabled'))
input.TogglePopup();}
img.onmousemove=function(e)
{var input=jQuery(cell).find('.field_control')[0];if(input&&input.DetectResize)input.DetectResize(e);};},id);return[];},SimpleInput:function(profile,data,context)
{var field=ajaxart_fieldaspect_getField(context);if(field==null)return[];field.Control=function(field_data,ctx)
{var field=ajaxart_fieldaspect_getField(ctx);var cntr=ctx.vars._Cntr&&ctx.vars._Cntr[0];if(ajaxart_field_is_readOnly(cntr,field,ctx))return[];return[ajaxart_field_createSimpleInput(field_data,ctx,ajaxart_field_is_readOnly(cntr,field,ctx))];}
return[];}});aa_gcs("field",{XmlField:function(profile,data,context)
{var field={isObject:true};var path=aa_text(data,profile,'Path',context);field.Id=aa_text(data,profile,'ID',context);if(field.Id=='')
field.Id=path.split('@').pop();field.ID=[field.Id];field.Title=aa_multilang_text(data,profile,'Title',context);if(aa_paramExists(profile,'Title')){field.RecalcTitle=function(item,ctx){this.Title=aa_multilang_text(item,profile,'Title',context);}}
field.Path=path;ajaxart_field_fix_title(field,path,context);var isAttribute=/^@[\w]*$/.test(path);if(path=="")
field.FieldData=function(data1){return data1;}
else
aa_set_fielddata_method(field,path);var newContext=aa_ctx(context,{_Field:[field]});ajaxart.run(data,profile,'Type',newContext);ajaxart.runsubprofiles(data,profile,'FieldAspect',newContext);ajaxart.run(data,profile,'Multiple',newContext);if(isAttribute)
field.ItemToText=function(att){return function(item){if(item.isObject)return item[att]||'';return item.getAttribute(att)||'';}}(path.substring(1));return[field];},XmlGroup:function(profile,data,context)
{var out=ajaxart.gcs.field.XmlField(profile,data,context);var field=out[0];field.IsGroup=true;field.HideTitle=aa_bool(data,profile,'HideTitle',context);field.Path=aa_text(data,profile,'Path',context);if(aa_text(data,profile,'Path',context)==""){field.IsVirtualGroup=true;field.FieldData=function(data1){return data1;}}
field.Fields=ajaxart.runsubprofiles(data,profile,'Field',context);field.Control=function(data1,ctx){var field=this;var cntr=ctx.vars._Cntr[0]||{};var parentItems=cntr.Items||[];var newContext=aa_merge_ctx(context,ctx);var id=aa_totext(cntr.ID)+'_'+field.Path;var dataitems=[{isObject:true,Items:data1}];if(field.HeaderFooter&&ctx.vars.DataHolderCntr)dataitems=ctx.vars.DataHolderCntr[0].Items;var operationsFunc=function(field){return function(data2,ctx2){field.Operations=ajaxart.run(data1,profile,'Operations',aa_merge_ctx(context,ctx2));return field.Operations;}}
var aspectsFunc=function(field){return function(data2,ctx2){if(field.Aspects)return field.Aspects;var newContext=aa_merge_ctx(context,ctx2);field.Aspects=ajaxart.run(data,profile,'Presentation',newContext);var aspect={isObject:true}
aa_set_initialize_container(aspect,function(aspect,ctx2,cntr){if(ctx.vars._Cntr&&ctx.vars._Cntr[0].ReadOnly)cntr.ReadOnly=true;if(aa_text(data,profile,'Path',context)=="")
cntr.IsVirtualGroup=true;});field.Aspects.push(aspect);ajaxart.concat(field.Aspects,ajaxart.runsubprofiles(data,profile,'Aspect',newContext));for(var i=0;i<field.Fields.length;i++)
if(field.Fields[i].CntrAspects)
field.Aspects=field.Aspects.concat(field.Fields[i].CntrAspects);return field.Aspects;}}
var out=aa_uidocument(data1,id,dataitems,field.Fields,aspectsFunc(field),operationsFunc(field),newContext);ajaxart.databind([out],data,newContext,null,data);out.Field=field;if(field.IsGroup)jQuery(out).addClass('aa_layoutgroup');return[out];}
field.ItemDetailsControl=field.Control;var newContext=aa_ctx(context,{_Field:[field]});ajaxart.runsubprofiles(data,profile,'FieldAspect',newContext);multipleItems_func=function(data1,ctx){return ajaxart.runNativeHelper('MultipleItems',data1,profile,ajaxart_mergeContext(context,ctx));};ajaxart_addMethod_js(field,'MultipleItems',multipleItems_func,context);return out;},TextFilter:function(profile,data,context)
{var field=ajaxart_fieldaspect_getField(context);if(field==null)return[];field.FilterControl=function(filter_context)
{var newContext=aa_ctx(filter_context,{_Field:[this]});var ctrl=ajaxart.runNativeHelper('Control',filter_context.vars.FilterData,profile,newContext);jQuery(ctrl).find('.aa_filter_input').addClass('aa_filter_'+this.Id);return ctrl;};field.newFilter=function(initialFilterData)
{var text_beginning=aa_bool(data,profile,'MatchOnlyTextBeginning',context);var CompileFilterData=function(filter_data)
{var txt=aa_totext(filter_data);if(txt=='')return[];return txt.toLowerCase().split(',');}
return{isObject:true,TextFilter:true,filterData:CompileFilterData(initialFilterData),SetFilterData:function(filterData){this.filterData=CompileFilterData(filterData);},ToSQLText:function(rawData){return ajaxart.totext_array(rawData)},Match:function(field,wrapper)
{if(this.filterData.length==0)return true;for(var i in this.filterData)
{var index=(''+wrapper[field.Id]).toLowerCase().indexOf(this.filterData[i]);var result=text_beginning?index==0:index>-1;if(result)return true;}
return false;}}};return[];},Group:function(profile,data,context)
{var out=ajaxart.gcs.field.XmlField(profile,data,context);var field=out[0];field.IsGroup=true;field.HideTitle=aa_bool(data,profile,'HideTitle',context);field.Fields=ajaxart.runsubprofiles(data,profile,'Field',context);field.GroupData=aa_first(data,profile,'GroupData',context);if(field.GroupData){field.FieldData=function(data1,ctx){return this.GroupData.FieldData(data1,ctx)}}
field.Control=function(data1,ctx){var field=this;var cntr=ctx.vars._Cntr[0]||{};var parentItems=cntr.Items||[];var newContext=aa_merge_ctx(context,ctx);var id=aa_totext(cntr.ID)+'_'+field.Id;var dataitems=null;if(field.GroupData)dataitems=field.GroupData.DataItems(data1,newContext)[0];if(!dataitems)dataitems=cntr.Items[0];var operationsFunc=function(){return[];}
var aspectsFunc=function(field){return function(data2,ctx2){if(field.Aspects)return field.Aspects;var newContext=aa_merge_ctx(context,ctx2);field.Aspects=ajaxart.run(data,profile,'Layout',newContext);var aspect={isObject:true}
aa_set_initialize_container(aspect,function(aspect,ctx2,cntr){if(ctx.vars._Cntr&&ctx.vars._Cntr[0].ReadOnly)cntr.ReadOnly=true;});field.Aspects.push(aspect);ajaxart.concat(field.Aspects,ajaxart.runsubprofiles(data,profile,'Aspect',newContext));for(var i=0;i<field.Fields.length;i++)
if(field.Fields[i].CntrAspects)
field.Aspects=field.Aspects.concat(field.Fields[i].CntrAspects);return field.Aspects;}}
var out=aa_uidocument(data1,id,[dataitems],field.Fields,aspectsFunc(field),operationsFunc,newContext);ajaxart.databind([out],data,newContext,null,data);out.Field=field;if(field.IsGroup)jQuery(out).addClass('aa_layoutgroup');return[out];}
field.ItemDetailsControl=field.Control;var newContext=aa_ctx(context,{_Field:[field]});ajaxart.runsubprofiles(data,profile,'FieldAspect',newContext);return out;},JavaScriptControl:function(profile,data,context)
{var field={isObject:true};field.Title=aa_multilang_text(data,profile,'Title',context);field.Id=aa_text(data,profile,'ID',context);field.ID=[field.Id];field.FieldData=function(data1){return data1;}
field.CellPresentation=["control"];var html_compiled=ajaxart.compile(profile,'Html',context);var js_func=aa_get_func(aa_text(data,profile,'JavaScript',context));var get_ctrl=function(data1,ctx){var html=ajaxart_runcompiled_text(html_compiled,data1,profile,"Html",context);var control=jQuery(html);if(html=="")control=[];var ctrl=(control.length>0)?control[0]:null;var ctrl_after_js;if(js_func){var data_item=(data1.length>1)?data1[0]:null;ctrl_after_js=js_func(data_item,ctrl,ctx);}
if(ctrl_after_js!=null)return[ctrl_after_js];if(ctrl!=null)return[ctrl];return[];}
var register=function(get_ctrl){ajaxart_addScriptParam_js(field,'Control',get_ctrl,context);}
register(get_ctrl);ajaxart.runsubprofiles(data,profile,'FieldAspect',aa_ctx(context,{_Field:[field]}));return[field];},SearchBox:function(profile,data,context)
{var field=ajaxart.runNativeHelper('Field',data,profile,context)[0];ajaxart_addMethod(field,'ItemTitle',profile,'ItemTitle',context);ajaxart_addMethod(field,'ItemImage',profile,'ItemImage',context);field.DefaultImage=aa_text(data,profile,'DefaultImage',context);if(field.DefaultImage!=""){function init(field,default_image){field.ItemImage=function(data1,ctx){var img=aa_text(data1,profile,'ItemImage',aa_merge_ctx(context,ctx));if(img=="")img=default_image;return[img];}}
init(field,field.DefaultImage);}
ajaxart_addMethod(field,'ItemExtraText',profile,'ItemExtraText',context);ajaxart_addMethod(field,'ItemLink',profile,'ItemLink',context);aa_field_handler(field,'ModifyControl',function(cell,field_data,cell_presentation,ctx,item){var field=cell.Field;var input=jQuery(cell).find('.field_control')[0];jQuery(input).addClass('aa_withpopup');field.PopupContents=function(){var input=jQuery(cell).find('.field_control')[0];var items=[]
for(var i=0;i<input.AllItems.length;i++)
if(i<30)
items.push(input.AllItems[i].item);return ajaxart.runNativeHelper('PreviewContainer',data,profile,aa_ctx(context,{_Field:[this],_PopupField:[this],_Items:items}));}
var on_data_arrive=function(items,field){var input=jQuery(cell).find('.field_control')[0];aa_preprocess_items_for_search(items,input,field,profile,context);};var resource_name=aa_text_extractRegex(profile.getAttribute("Items"),"%[$]([a-zA-Z0-9_]*)%",1);if(resource_name)
aa_jbart_register_data_arrive(resource_name,function(items){var input=jQuery(cell).find('.field_control')[0];aa_preprocess_items_for_search(items,input,field,profile,context);},context);if(!input.AllItems||input.AllItems.length==0)
aa_preprocess_items_for_search(ajaxart.run(data,profile,'Items',context),input,field,profile,context);input.ShowResults=function(){if(jQuery(input).hasClass('empty_text_description'))input.value='';if(jQuery(".search_results").length)
aa_replaceElement(jQuery(".search_results")[0],input.Container.Ctrl);else{if(input.value!=''||input.ShowPopupOnEmptySearch)
ajaxart.runNativeHelper('OpenPopup',[],profile,aa_ctx(context,{_Input:[input],_ResultsContainer:[input.Container.Ctrl],_Field:[field],_PopupField:[field],ControlElement:[input]}));}}
input.HideResults=function(){aa_closePopup(ajaxart.dialog.openPopups[ajaxart.dialog.openPopups.length-1]);}
input.ShowNothingFound=function(){var noResultsCtrl=aa_first([this.value],profile,'NoResults',context);jQuery(noResultsCtrl).addClass('search_results');if(jQuery(".search_results").length)
aa_replaceElement(jQuery(".search_results")[0],noResultsCtrl);else
ajaxart.runNativeHelper('OpenPopup',[],profile,aa_ctx(context,{_Input:[input],_ResultsContainer:[noResultsCtrl],_Field:[field],_PopupField:[field],ControlElement:[input]}));}
input.OnSelect=function(item,ctx){var link=aa_text(item,profile,'ItemLink',context)
if(aa_bool(item,profile,'HideResultsOnClick',context))
this.HideResults();ajaxart.run([link],profile,'DoOnSelect',aa_ctx(context,{ControlElement:[input],SelectedItem:item}));}
input.ShowPopupOnEmptySearch=aa_bool(data,profile,'ShowPopupOnEmptySearch',context);});aa_field_handler(field,'OnKeyup',function(field,field_data,input,e,extra)
{for(var i=0;i<aa_navigation_codes.length;i++)
if(e.keyCode==aa_navigation_codes[i])return true;input.Container=ajaxart.runNativeHelper('ResultsContainer',data,profile,aa_ctx(context,{_Field:[field],_PopupField:[field],_Input:[input]}))[0];if(input.Container&&input.Container.Cntr)input.Container=input.Container.Cntr;if(e.keyCode!=27&&e.keyCode!=13){jQuery(input).removeClass('empty_text_description');aa_search(field,input,profile,aa_ctx(context,{_Cntr:[input.Container.Cntr]}));}
else
input.HideResults();});aa_field_handler(field,'OnKeydown',function(field,field_data,input,e){aa_search_keydown(field,input,e,context);});aa_field_handler(field,'OnMouseDown',function(field,field_data,input,e){if(jQuery(".search_results").length>0)return;input.Container=ajaxart.runNativeHelper('ResultsContainer',data,profile,aa_ctx(context,{_Field:[field],_PopupField:[field],_Input:[input]}))[0];if(input.Container&&input.Container.Cntr)input.Container=input.Container.Cntr;aa_search(field,input,profile,aa_ctx(context,{_Cntr:[input.Container.Cntr]}));});ajaxart.runNativeHelper('FieldAspects',data,profile,aa_ctx(context,{_Field:[field],_PopupField:[field]}));field.ResultsPage=field.PopupPage(data,aa_ctx(context,{_Field:[field],_PopupField:[field]}))[0];return[field];},Field1:function(profile,data,context)
{var field={isObject:true};field.Title=aa_multilang_text(data,profile,'Title',context);field.Id=aa_text(data,profile,'ID',context);field.ID=[field.Id];ajaxart_addMethod(field,'FieldData',profile,'FieldData',context);ajaxart_addMethod(field,'Control',profile,'Control',context);var newContext=aa_ctx(context,{_Field:[field]});ajaxart.runsubprofiles(data,profile,'FieldAspect',newContext);ajaxart.run(data,profile,'Multiple',newContext);return[field];},ShowFieldControl:function(profile,data,context)
{var item=ajaxart.run(data,profile,'Item',context);var cntr={isObject:true,ID:["show_field"],Items:[{isObject:true,ReadOnly:false,Items:[]}]};if(context.vars._Cntr)cntr.ParentCntr=context.vars._Cntr[0];var newContext=aa_ctx(context,{_Cntr:[cntr]});var field=aa_first(data,profile,'Field',newContext);if(field==null)return[];var field_data=ajaxart_field_calc_field_data(field,item,newContext);var out=document.createElement(aa_text(data,profile,'CellTag',context));newContext=aa_ctx(newContext,{_Field:[field],FieldTitle:[field.Title],_Item:item,Items:aa_items(cntr)});if(field.Hidden&&aa_tobool(field.Hidden(item,newContext)))return[];if(field.AsSection)
aa_buildSection(cntr,out,field,item,null,context);else
ajaxart_field_createCellControl(item,cntr,out,'control',field,field_data,newContext);return[out];}});aa_gcs("dlg",{ButtonsHorizontal:function(profile,data,context)
{var dlg=context.vars._Dialog[0];dlg.ButtonsControl=function(data1,ctx){var out=jQuery('<table cellpadding="4"><tr/></table>')[0];jQuery(out).css('float',dlg.Rtl?'left':'right');var tr=jQuery(out).find('tr')[0];for(var i=0;i<this.Buttons.length;i++){var btn=this.Buttons[i].Control(data1,ctx)[0];var td=jQuery('<td/>')[0];td.appendChild(btn);tr.appendChild(td);}
return out;}},DialogShadow:function(profile,data,context)
{var dlg=context.vars._Dialog[0];aa_register_handler(dlg,'AfterOpen',function(dlg,ctx)
{var shade1=jQuery('<tr class="dialog_right_shadow_tr"><th class="dialog_shadow_extra_th"/>'
+'<th rowspan="6" class="dialog_right_shadow_th"><div class="dialog_right_shadow" /></th></tr>');var shade2=jQuery('<tr class="dialog_bottom_shadow" ><td><span class="dialog_bottom_outer" ><span class="dialog_bottom_inner" ></span>'
+'</span></td></tr>');var tbody=jQuery(dlg.Frame).find('tbody')[0];tbody.insertBefore(shade1[0],tbody.firstChild);tbody.appendChild(shade2[0]);jQuery(dlg.Frame).css('border','none');});},DisableBodyScroll:function(profile,data,context)
{var dlg=context.vars._Dialog[0];dlg.DisableBodyScroll=aa_bool(data,profile,'Enabled',context);aa_register_handler(dlg,'BeforeOpen',function(dlg,ctx)
{if(!dlg.DisableBodyScroll)return;if(!jBart.dialogs.DisableBodyScroll_counter)jBart.dialogs.DisableBodyScroll_counter=0;jBart.dialogs.DisableBodyScroll_counter++;jQuery('body').css('overflow','hidden');});aa_register_handler(dlg,'AfterClose',function(dlg,ctx)
{if(!dlg.DisableBodyScroll)return;if(--jBart.dialogs.DisableBodyScroll_counter==0)
jQuery('body').css('overflow','auto');});},DragDialog:function(profile,data,context)
{var dlg=context.vars._Dialog[0];aa_register_handler(dlg,'AfterOpen',function(dlg,ctx){aa_enable_move_by_dragging(dlg.Frame,jQuery(dlg.Frame).find(".aa_dialog_title")[0],function(){ajaxart_dialog_close_all_popups();});});},OpenDialog:function(profile,data,context)
{var dlg={isObject:true}
dlg.Title=aa_multilang_text(data,profile,'Title',context);dlg.Data=ajaxart.run(data,profile,'DialogData',context);dlg.Contents=aa_first(dlg.Data,profile,'Contents',context);dlg.noOfOpenDialogs=noOfOpenDialogs;dlg.Style=aa_first(data,profile,'Style',context);dlg.Mode=dlg.Style.Mode;if(context.vars.ControlElement)dlg.origControlElement=context.vars.ControlElement[0];function init(dlg){dlg.createFrame=function(){this.StyleClass=aa_attach_global_css(this.Style.Css);var jElem=jQuery(this.Style.Html);jElem.addClass(this.StyleClass);var dialogObject=aa_api_object(jElem);aa_apply_style_js(dialogObject,this.Style);return jElem[0];}
dlg.ContentsPlaceholder=function(){var out=this.Frame;if(jQuery(out).hasClass('aa_dialogcontents'))return out;return jQuery(out).find('.aa_dialogcontents')[0];}
dlg.RunOnOK=function(){ajaxart.run(this.Data,profile,'RunOnOK',context);}
dlg.OK=function(data1,ctx){if(!dlg.Frame)return;aa_runMethodAsync(this,this.RunBeforeOK,this.Data,ctx,function(){var contents=dlg.ContentsPlaceholder();if(!aa_passing_validations(contents))return;dlg.Close(data1,ctx);var ctx2=aa_ctx(context,{DialogOriginalData:data});if(dlg.OrigControlElement)ctx2.ControlElement=[dlg.OrigControlElement];ajaxart.run(dlg.Data,profile,'RunOnOK',ctx2);});}
dlg.Apply=function(data1,ctx){var ctx2=aa_ctx(context,{DialogOriginalData:data});ajaxart.run(this.Data,profile,'RunOnOK',ctx2);}
dlg.Cancel=function(data1,ctx){this.Close(data1,ctx);if(this.RunOnCancel)this.RunOnCancel(data,context);}
dlg.Open=function(data1,ctx){if(this.Mode=='dialog')noOfOpenDialogs++;var dlg=this;aa_invoke_dialog_handlers(dlg.BeforeOpen,dlg,context);dlg.Frame=dlg.createFrame();if(this.Mode=='popup'){dlg.Popup={Dlg:dlg,contents:dlg.Frame};ajaxart.dialog.openPopups.push(dlg.Popup);aa_capture_for_popup(dlg.Popup);dlg.Popup.initialized=true;}
dlg.Frame.Dialog=dlg;var jFrame=jQuery(dlg.Frame);dlg.Frame.counter=++aa_dialogCounter;jFrame.css('zIndex',2001+noOfOpenDialogs);jFrame.addClass('aa_dlg aa_dlg_'+dlg.DialogClass);dlg.Rtl=aa_is_rtl(dlg.origControlElement)&&!dlg.AlwaysLTR;if(dlg.Rtl)jFrame.addClass('right2left');if(!ajaxart.inPreviewMode)jFrame.addClass('aa_dlg').css('position','absolute');if(dlg.Title&&jFrame.find('.aa_dialog_title').length>0){var titleDiv=jQuery('<div class="aa_dialog_title_text"/>')[0];titleDiv.innerHTML=dlg.Title;jFrame.find('.aa_dialog_title')[0].appendChild(titleDiv);}
if(dlg.Contents){dlg.ContentsPlaceholder().appendChild(dlg.Contents);dlg.Contents.tabIndex=0;}
if(dlg.Buttons&&dlg.Buttons.length>0&&dlg.ButtonsControl){jQuery(dlg.Frame).find('.aa_dialogbuttons')[0].appendChild(dlg.ButtonsControl(data1,ctx));}
if(!ajaxart.inPreviewMode){document.body.appendChild(dlg.Frame);if(dlg.FixDialogPosition){jFrame.hide();setTimeout(function(){dlg.FixDialogPosition(true);aa_element_attached(dlg.Frame);},1);}
else
aa_element_attached(dlg.Frame);}
aa_invoke_dialog_handlers(dlg.AfterOpen,dlg,context);}
dlg.Close=function(data1,ctx,fromClosePopup){if(!this.Frame)return;aa_remove(this.Frame);this.Frame=null;if(this.mode=='dialog')noOfOpenDialogs--;else if(!fromClosePopup)aa_closePopup(this.Popup);aa_invoke_dialog_handlers(this.AfterClose,this);if(this.RunOnClose)this.RunOnClose(data1,ctx);}
var newContext=aa_ctx(context,{_Dialog:[dlg]});dlg.Style.Features(data,newContext);ajaxart.runNativeHelper('MoreFeatures',data,profile,newContext);ajaxart.runsubprofiles(data,profile,'Feature',newContext);dlg.Open(data,newContext);}
init(dlg);},NearLauncher:function(profile,data,context)
{var dlg=context.vars._Dialog[0];dlg.FixDialogPosition=function(firstTime)
{var control=this.origControlElement;if(!firstTime||!control)return;var jPopup=jQuery(this.Frame);var mode=aa_text(data,profile,'Location',context);var d;if(window.innerHeight)
d={pageYOffset:window.pageYOffset,pageXOffset:window.pageXOffset,innerHeight:window.innerHeight,innerWidth:window.innerWidth}
else if(document.documentElement&&document.documentElement.clientHeight)
d={pageYOffset:document.documentElement.scrollTop,pageXOffset:document.documentElement.scrollLeft,innerHeight:document.documentElement.clientHeight,innerWidth:document.documentElement.clientWidth}
else if(document.body)
d={pageYOffset:document.body.scrollTop,pageXOffset:document.body.scrollLeft,innerHeight:document.body.clientHeight,innerWidth:document.body.clientWidth};debugger;var fixed_location=false;jQuery(control).parents().each(function(){if(jQuery(this).css("position")=='fixed')fixed_location=true;});if(fixed_location){d.pageYOffset=d.pageXOffset=0;jPopup[0].style.position='fixed';}
debugger;jPopup.show();var p_height=this.Frame.offsetHeight;var p_width=this.Frame.offsetWidth;var l_ctrl_height=control.offsetHeight;var l_ctrl_width=control.offsetWidth;if(p_width>d.innerWidth){jPopup.css("max-width",d.innerWidth+"px");p_width=this.Frame.offsetWidth;}
if(p_height>d.innerHeight){jPopup.css("max-height",d.innerHeight+"px");p_height=this.Frame.offsetHeight;}
var pageX=ajaxart.ui.absoluteLeft(control),pageY=ajaxart.ui.absoluteTop(control);if(!aa_bool(data,profile,'HidingLauncher',context))
pageY+=l_ctrl_height+2;var padding=2;if(mode!='below launcher'&&d.innerHeight+d.pageYOffset<pageY+p_height&&d.pageYOffset<=pageY-p_height-l_ctrl_height-padding)
pageY-=p_height+l_ctrl_height+padding+2;else if(mode=='below,above or aside of launcher'&&d.innerHeight+d.pageYOffset<pageY+p_height&&d.pageYOffset>pageY-p_height-l_ctrl_height-padding*2){pageY=d.innerHeight/2-p_height/2+d.pageYOffset;if(pageX+l_ctrl_width+p_width+padding<=d.pageXOffset+d.innerWidth)
pageX=pageX+l_ctrl_width+padding;else if(pageX-p_width>=d.pageXOffset)
pageX=pageX-p_width-padding;else
pageX=d.innerWidth/2-p_width/2+d.pageXOffset;}
if(d.innerHeight+d.pageYOffset<pageY+p_height){var height_diff=p_height-jPopup.height();jPopup.css("max-height",d.innerHeight+d.pageYOffset-pageY-height_diff-padding+"px");if(d.innerHeight+d.pageYOffset-pageY-height_diff-padding<=0)
dlg.Close();}
if(d.pageXOffset+d.innerWidth<pageX+p_width){if(pageX-p_width+l_ctrl_width>=d.pageXOffset)
pageX=pageX+l_ctrl_width-p_width;else{pageX=pageX+l_ctrl_width/2-p_width/2;if(d.pageXOffset+d.innerWidth<pageX+p_width+padding)
pageX=d.pageXOffset+d.innerWidth-p_width-padding;else if(d.pageXOffset>pageX)
pageX=d.pageXOffset+padding;}}
jPopup.css("top",pageY).show();jPopup.css("left",pageX);jPopup.css('min-width',l_ctrl_width+'px');}},CloseDialog:function(profile,data,context)
{var topDialog=aa_top_dialog();if(!topDialog)return;if(topDialog.OldDialog){var okButton=jQuery(topDialog.dialogContent).find('.OKButton')[0];if(okButton){aa_fire_event(okButton,'mousedown',context,{});aa_fire_event(okButton,'mouseup',context,{});}}
else{if(aa_text(data,profile,'CloseType',context)=="OK")
topDialog.Dialog.OK([],context);else
topDialog.Dialog.Cancel([],context);}},OKOnEnter:function(profile,data,context)
{var dlg=context.vars._Dialog[0];dlg.OKOnEnter=aa_bool(data,profile,'Enabled',context);aa_register_handler(dlg,'AfterOpen',function(dlg,ctx)
{if(!dlg.OKOnEnter)return;jQuery(dlg.Frame).keydown(function(e){e=e||event;var elem=(typeof(event)=='undefined')?e.target:event.srcElement;if(e.keyCode==27)dlg.Cancel();else if(e.keyCode==13&&dlg.OKOnEnter)
if(!elem||elem.tagName.toLowerCase()!='textarea')
dlg.OK(data,context);});});},CloseWhenClickingOutside:function(profile,data,context)
{var dlg=context.vars._Dialog[0];dlg.Orig_mousedown=(window.captureEvents)?window.onmousedown:document.onmousedown;function captureClick(e){var dlg=context.vars._Dialog[0];var elem=jQuery((typeof(event)=='undefined')?e.target:(event.tDebug||event.srcElement));if(elem.parents('html').length==0)return;if(dlg.Frame==elem.parents('.aa_dlg')[0])return;dlg.OK(data,context);}
if(window.captureEvents)window.onmousedown=captureClick;else document.onmousedown=captureClick;aa_register_handler(dlg,'AfterClose',function(dlg,ctx)
{if(window.captureEvents)
window.onmousedown=dlg.Orig_mousedown;else
document.onmouseclick=dlg.Orig_mousedown;});},ScreenCover:function(profile,data,context)
{var dlg=context.vars._Dialog[0];var alreadyExists=dlg.CoverColor!=null;dlg.CoverColor=aa_text(data,profile,'Color',context);dlg.CoverOpacity=aa_text(data,profile,'Opacity',context);if(alreadyExists)return;aa_register_handler(dlg,'BeforeOpen',function(dlg,ctx)
{var wrappingDiv=jQuery('<div class="dialog_cover" style="position:absolute;top:0px;left:0px;" />')[0];wrappingDiv.style.backgroundColor=dlg.CoverColor;wrappingDiv.onmousedown=function(e){e=e||event;if(e==null)return;if(typeof(Event)!='undefined'&&Event.resolve)Event.cancelBubble(Event.resolve(e));}
wrappingDiv.Dlg=dlg;var scree_size=ajaxart_screen_size();wrappingDiv.style.width=Math.max(document.documentElement.scrollWidth,scree_size.width)-18+"px";wrappingDiv.style.height=Math.max(document.documentElement.scrollHeight,scree_size.height)-18+"px";wrappingDiv.style.zIndex=2000+noOfOpenDialogs;wrappingDiv.style.opacity=dlg.CoverOpacity;wrappingDiv.style.filter="alpha(opacity="+dlg.CoverOpacity*100+")";wrappingDiv.tabIndex=0;jQuery(wrappingDiv).keydown(function(event){if(event.keyCode==27)wrappingDiv.Dlg.Cancel();});if(!ajaxart.inPreviewMode)document.body.appendChild(wrappingDiv);});aa_register_handler(dlg,'AfterClose',function(dlg,ctx)
{var covers=jQuery('body').find('.dialog_cover');for(var i=0;i<covers.length;i++)
if(covers[i].Dlg==dlg){aa_remove(covers[i]);return;}});},AutomaticFocus:function(profile,data,context)
{var dlg=context.vars._Dialog[0];var focus_on=aa_text(data,profile,'FocusOn',context);aa_register_handler(dlg,'AfterOpen',function(dlg,ctx){if(focus_on=="first input"){setTimeout(function(){if(dlg.Disabled)return;var inp=jQuery(dlg.Contents).find('input');if(inp.length>0)inp[0].focus();},1);}},"AutomaticFocus");},NoCancel:function(profile,data,context)
{var dlg=context.vars._Dialog[0];dlg.NoCancel=true;if(!dlg.Buttons)return;for(var i=0;i<dlg.Buttons.length;i++){if(dlg.Buttons[i].ID=='OK'){var okbtn=ajaxart.runNativeHelper('OKButton',data,profile,context)[0];if(okbtn)dlg.Buttons[i]=okbtn;}
if(dlg.Buttons[i].ID=='Cancel'){dlg.Buttons.splice(i,1);}}},Size:function(profile,data,context)
{var dlg=context.vars._Dialog[0];aa_register_handler(dlg,'AfterOpen',function(dlg,ctx)
{var top=dlg.ContentsPlaceholder();aa_set_element_size(top,aa_text_with_percent(data,profile,'Size',context));aa_set_element_size(top,aa_text_with_percent(data,profile,'MaxSize',context),"max-");});},InScreenCenter:function(profile,data,context)
{var dlg=context.vars._Dialog[0];dlg.FixDialogPosition=function(firstTime)
{var screenWidth=window.innerWidth||(document.documentElement.clientWidth||document.body.clientWidth);var screenHeight=window.innerHeight||(document.documentElement.clientHeight||document.body.clientHeight);var scrollOffsetX=document.body.scrollLeft||document.documentElement.scrollLeft;var scrollOffsetY=document.body.scrollTop||document.documentElement.scrollTop;var jFrame=jQuery(this.Frame);jFrame.show();var jDlgBody=jQuery(this.ContentsPlaceholder());if(jDlgBody.height()>jDlgBody[0].scrollHeight)jDlgBody.height(jDlgBody[0].scrollHeight);if(jDlgBody.width()>jDlgBody[0].scrollWidth)jDlgBody.width(jDlgBody[0].scrollWidth);var yCaption=jFrame.height()-jDlgBody.height();var xCaption=jFrame.width()-jDlgBody.width();if(jFrame.height()>screenHeight)jDlgBody.height(screenHeight-yCaption-50);if(jFrame.width()>screenWidth)jDlgBody.width(screenWidth-xCaption-50);if(firstTime||aa_bool(data,profile,'AlwaysInScreenCenter',context)){jFrame.css('left',Math.max(5,(screenWidth-jFrame.width())/2)+"px");jFrame.css('top',Math.max(5,(screenHeight-jFrame.height())/2)+"px");jFrame[0].style.position='fixed';}}},CloseIcon:function(profile,data,context)
{var dlg=context.vars._Dialog[0];aa_register_handler(dlg,'AfterOpen',function(dlg,ctx)
{var jTitle=jQuery(dlg.Frame).find('.aa_dialog_title');if(jTitle.length==0)
jTitle=jQuery(dlg.Frame);var src=aa_text(data,profile,'Image',context);var img=jQuery('<img class="aa_dialog_caption_close" src="'+src+'"/>')[0];aa_setCssText(img,aa_text(data,profile,'CssStyle',context));img.onclick=function(){dlg.Cancel(dlg.Data,ctx);}
jTitle[0].insertBefore(img,jTitle[0].firstChild);});},Css:function(profile,data,context)
{var dlg=context.vars._Dialog[0];aa_register_handler(dlg,'AfterOpen',function(dlg,ctx){var cls=aa_attach_global_css(aa_text(data,profile,'Css',context));jQuery(dlg.Frame).addClass(cls);});}});aa_gcs("dialog_style",{});aa_gcs("dialog",{IsRuntimeDialog:function(profile,data,context)
{var activating_controls=ajaxart.getVariable(context,"OriginalControlElement");if(jQuery(activating_controls[0]).parents(".runtime").length>0)return["true"];return[];},FixTopDialogPosition:function(profile,data,context)
{return aa_fixTopDialogPosition();},TopDialogContent:function(profile,data,context)
{var part=aa_text(data,profile,'Part',context);var find_class=".dialog_content";var topDialogNew=aa_top_dialog();if(openDialogs.length==0&&!topDialogNew)return[];var dlg=openDialogs[openDialogs.length-1];if(part=="Content"){if(!dlg)return topDialogNew;}
if(part=="Data"){if(dlg==null||dlg.dialogContent==null||dlg.dialogContent.ajaxart==null)return[];return ajaxart.getVariable(dlg.dialogContent.ajaxart.params,"DialogWorkingData");}
if(part=="Title")
find_class=".dialog_title_text";var result=jQuery(dlg.dialogContent).find(find_class);if(part=="All")
result=jQuery(dlg.dialogContent);if(result.length==0)return[];return[result[0]];},CloseDialog:function(profile,data,context)
{var closeType=aa_text(data,profile,'CloseType',context);var ignoreAAEditor=aa_bool(data,profile,'IgnoreAAEditor',context);aa_close_dialog_old(closeType,ignoreAAEditor);},PopUpDialog:function(profile,data,context)
{var content=aa_first(data,profile,'Dialog',context);var screenColor=aa_text(data,profile,'ScreenColor',context);var screenOpacity=aa_first(data,profile,'ScreenOpacity',context);var previewMode=ajaxart.inPreviewMode==true;if(previewMode)return[];jQuery('body').addClass('body_with_open_dialog');var activating_controls=ajaxart.getVariable(context,"OriginalControlElement");if(jQuery(activating_controls[0]).parents(".runtime").length>0)
jQuery(content).addClass('runtime');var isRtl=false;if(!aa_bool(data,profile,'AlwaysLTR',context)){if(jQuery(activating_controls[0]).parents(".right2left").length>0)isRtl=true;else{if(activating_controls.length==0||!ajaxart.isattached(activating_controls[0])){isRtl=jQuery("body").find('.right2left').length>0;}}}
if(isRtl)
jQuery(content).addClass("right2left");if(!previewMode)content.style.position="absolute";jQuery(content).addClass("ajaxart");if(!previewMode)
document.body.appendChild(content);var screenWidth=window.innerWidth||(document.documentElement.clientWidth||document.body.clientWidth);var screenHeight=window.innerHeight||(document.documentElement.clientHeight||document.body.clientHeight);var fix_height_width=function(){content.style.visibility='visible';var scrollOffsetX=0;var scrollOffsetY=0;if(document.body&&(document.body.scrollLeft||document.body.scrollTop)){scrollOffsetY=document.body.scrollTop;scrollOffsetX=document.body.scrollLeft;}else if(document.documentElement&&(document.documentElement.scrollLeft||document.documentElement.scrollTop)){scrollOffsetY=document.documentElement.scrollTop;scrollOffsetX=document.documentElement.scrollLeft;}
content.style.left=Math.max(5,(screenWidth-jQuery(content).width())/2)+scrollOffsetX+"px";content.style.top=Math.max(5,(screenHeight-jQuery(content).height())/2)+scrollOffsetY+"px";ajaxart.setVariable(context,"ControlElement",[content]);content.focus();ajaxart.run(data,profile,'RunAfterPopup',context);}
aa_enable_move_by_dragging(content,jQuery(content).find(".dialog_title")[0],function(){ajaxart_dialog_close_all_popups();});var doc=document;if(typeof(noOfOpenDialogs)=="undefined")
noOfOpenDialogs=0;if(!previewMode)noOfOpenDialogs++;var docHeight=Math.max(doc.body.scrollHeight,doc.body.clientHeight);var docWidth=Math.max(doc.body.clientWidth,doc.body.scrollWidth);wrappingDiv=doc.createElement("DIV");wrappingDiv.noOfOpenDialogs=noOfOpenDialogs;wrappingDiv.OldDialog=true;wrappingDiv.className="dialog_cover";wrappingDiv.style.position="absolute";if(!previewMode)
doc.body.appendChild(wrappingDiv);wrappingDiv.style.backgroundColor=screenColor;wrappingDiv.onmousedown=function(e){e=e||event;if(e==null)return;if(typeof(Event)!='undefined'&&Event.resolve)
Event.cancelBubble(Event.resolve(e));}
wrappingDiv.dialogContent=content;var scree_size=ajaxart_screen_size();wrappingDiv.style.width=Math.max(document.documentElement.scrollWidth,scree_size.width)+"px";wrappingDiv.style.height=Math.max(document.documentElement.scrollHeight,scree_size.height)+"px";wrappingDiv.style.zIndex=2000+noOfOpenDialogs;wrappingDiv.style.top="0px";wrappingDiv.style.left="0px";wrappingDiv.style.opacity=screenOpacity;if(typeof(wrappingDiv.style.filter)!="undefined"){wrappingDiv.style.filter="alpha(opacity="+screenOpacity*100+")";}
content.style.zIndex=2001+noOfOpenDialogs;content.tabIndex=0;if(!previewMode)openDialogs.push(wrappingDiv);if(!previewMode){content.style.visibility='hidden';setTimeout(function(){fix_height_width();},1);}
aa_element_attached(content);return[content];},ClosePopup:function(profile,data,context)
{var counter=10;if(aa_bool(data,profile,'AllPopups',context))
while(ajaxart.dialog.openPopups.length>0&&counter>0)
{aa_closePopup(ajaxart.dialog.openPopups[ajaxart.dialog.openPopups.length-1]);counter--;}
if(ajaxart.dialog.openPopups.length>0)
return aa_closePopup(ajaxart.dialog.openPopups[ajaxart.dialog.openPopups.length-1]);}});aa_gcs("date",{});aa_gcs("data_items",{Items:function(profile,data,context)
{var out={isObject:true};out.ItemTypeName=ajaxart.run(data,profile,'ItemTypeName',context);out.Items=ajaxart.run(data,profile,'Items',context);var refreshFunc=function(out){this.run=function(){out.Items=ajaxart.run(data,profile,'Items',context);return["true"];}};ajaxart_addScriptParam_js(out,'Refresh',new refreshFunc(out).run,context);var newContext=aa_ctx(context,{_Items:[out]});ajaxart.runsubprofiles(data,profile,'Aspect',newContext);if(!out.Subset){out.Subset=function(data1,ctx){var subset={isObject:true,Items:ctx.vars._InnerItem};return[subset];}}
return[out];}});aa_gcs("data",{Pipeline:function(profile,data,context)
{if(data.length>1)data=[data[0]];var itemProfiles=ajaxart.subprofiles(profile,'Item');var nextData=data;for(var i=0;i<itemProfiles.length;i++)
{var itemProfile=itemProfiles[i];var arr=[];if(nextData.length==0&&i!=0)return[];if(data.length<=1&&i==0)
arr=ajaxart.run(nextData,itemProfile,"",context);else
{var compiledFunc=ajaxart.compile(itemProfile,'',context);if(compiledFunc=="same")continue;if(compiledFunc==null)
for(var j=0;j<nextData.length;j++)
ajaxart.concat(arr,ajaxart.run([nextData[j]],itemProfile,"",context));else
for(var j=0;j<nextData.length;j++)
ajaxart.concat(arr,compiledFunc([nextData[j]],context));}
nextData=arr;}
var aggProfiles=ajaxart.subprofiles(profile,'Aggregator');for(var i=0;i<aggProfiles.length;i++)
nextData=ajaxart.run(nextData,aggProfiles[i],'',context);return nextData;},FirstSucceeding:function(profile,data,context)
{var itemProfiles=ajaxart.subprofiles(profile,'Item');for(var i=0;i<itemProfiles.length;i++)
{var subresult=ajaxart.run(data,itemProfiles[i],"",context);if(subresult.length>0)return subresult;}
return[];},JavaScript:function(profile,data,context)
{var ret=aa_run_js_code(aa_text(data,profile,'Code',context),data,context);if(!ret)return[];if(typeof(ret)=='string')return[ret];if(typeof(ret)=='number')return[""+ret];if(typeof(ret)=='boolean'){if(ret)return["true"];else return[];}
if(ajaxart.isArray(ret))return ret;return[ret]},Lookup:function(profile,data,context)
{var lookupname=aa_text(data,profile,'LookupName',context);var version=ajaxart.run(data,profile,'Version',context);var refresh=false;if(typeof(ajaxart.lookup_cache[lookupname])=="undefined")
refresh=true;else
{var cur_version=ajaxart.lookup_cache[lookupname].Version;if(version>cur_version)
refresh=true;}
if(refresh)
{var cache={};var allItems=ajaxart.run(data,profile,'AllItems',context);for(var i=0;i<allItems.length;i++)
{var item=allItems[i];var code=aa_text([item],profile,'ItemCode',context);var value=ajaxart.run([item],profile,'ItemValue',context);if(code=="")continue;if(cache[code]==null)
cache[code]=[];for(var j=0;j<value.length;j++)
cache[code].push(value[j]);}
ajaxart.lookup_cache[lookupname]=cache;ajaxart.lookup_cache[lookupname].Version=version;}
var cache=ajaxart.lookup_cache[lookupname];var code=aa_text(data,profile,'LookFor',context);var result=cache[code];if(typeof(result)=="undefined")return[];return result;},ItemsByIDs:function(profile,data,context)
{var list=ajaxart.run(data,profile,'List',context);var ids=","+aa_text(data,profile,'IDs',context)+",";if(ids==",*,")return list;var out=[];for(var i=0;i<list.length;i++)
if(list[i].Id!=""&&ids.indexOf(list[i].Id)!=-1)out.push(list[i]);return out;},ItemByID:function(profile,data,context)
{var list=ajaxart.run(data,profile,'List',context);var id=aa_text(data,profile,'ID',context);for(var i=0;i<list.length;i++)
if(list[i].ID==id)return[list[i]];return[];},AddSeparator:function(profile,data,context)
{var addBefore=aa_first(data,profile,'AddBefore',context);var addAfter=aa_first(data,profile,'AddAfter',context);var out=[];if(addBefore!=null)
out.push(addBefore);ajaxart.each(data,function(item,i){var Separator=aa_first(data,profile,'Separator',context);out.push(item);if(i+1<data.length&&Separator!=null)
out.push(Separator);});if(addAfter!=null)
out.push(addAfter);return out;},Url:function(profile,data,context)
{var str=""+window.location.href;return[str];},JustInTimeCalculation:function(profile,data,context)
{var out={isObject:true,Content:null};out.GetContent=function(data1,ctx){if(out.Content==null){out.Content=ajaxart.run(data1||data,profile,'Content',ajaxart_mergeContext(context,ctx));}
return out.Content;}
return[out];},IfThenElse:function(profile,data,context)
{return aa_ifThenElse(profile,data,context);},Duplicate:function(profile,data,context)
{if(data.length==0)return[];var item=data[0];if(typeof(item)=='string'||typeof(item)=='number')
return[""+item];if(ajaxart.isxml_item(item)&&item.nodeType==1)
return[ajaxart.parsexml(ajaxart.xml2text(item))];if(ajaxart.isxml_item(item)&&item.nodeType==2)
return[ajaxart.xml.clone(data)];return data;},Same:function(profile,data,context)
{return data;},List:function(profile,data,context)
{var items=ajaxart.subprofiles(profile,'Item');var out=[];for(var i=0;i<items.length;i++){var next=ajaxart.run(data,items[i],"",context);ajaxart.concat(out,next);};return out;}});aa_gcs("bart_url",{NewUrlFragment:function(profile,data,context)
{var current=aa_text(data,profile,'Current',context);var proposed=aa_text(data,profile,'Proposed',context);var curr=current.split('?');var prop=proposed.split('?');var prop_index="";for(var i=1;i<prop.length;i++){if(prop[i].length>0&&prop[i].charAt(prop[i].length-1)==';')prop[i]=prop[i].substring(0,prop[i].length-1);var item=prop[i].substring(0,prop[i].indexOf('='));if(item=='')continue;if(i==1)prop_index+=",";prop_index=prop_index+item+",";}
var out="";for(var i=1;i<prop.length;i++){var pos=prop[i].indexOf('=');if(pos==-1||pos==prop[i].length-1)continue;out+="?"+prop[i];}
for(var i=1;i<curr.length;i++){var attr=curr[i].substring(0,curr[i].indexOf('='));if(attr.length==0)continue;if(prop_index.indexOf(','+attr+',')>-1)continue;out+="?"+curr[i];}
return[out];}});aa_gcs("bart_resource",{Xml:function(profile,data,context)
{var obj={isObject:true,Type:"query"}
obj.Id=aa_text(data,profile,'ResourceID',context);obj.ID=[obj.Id];obj.Mode=aa_text(data,profile,'Mode',context);obj.Storage=aa_text(data,profile,'Storage',context);var nameOfGlobalVar='jBartWidget_'+ajaxart.totext(context.vars.WidgetId)+'_'+obj.Id;if(window[nameOfGlobalVar])
obj.Xml=window[nameOfGlobalVar][0]||ajaxart.parsexml('<xml/>');else if(obj.Storage==''||obj.Storage=='in memory')
obj.Xml=aa_first(data,profile,'Xml',context);else{var textval='';if(obj.Storage=='cookie')
textval=ajaxart.cookies.valueFromCookie(obj.Id);if(obj.Storage=='local storage'&&window.localStorage)
textval=window.localStorage[obj.Id];if(textval==null||textval=='')
obj.Xml=aa_first(data,profile,'Xml',context);else
obj.Xml=ajaxart.parsexml(textval);if(!obj.Xml)obj.Xml=ajaxart.parsexml('<xml/>');function init(obj){obj.XmlChanged=function(){if(obj.Saving)return;obj.Saving=true;setTimeout(obj.SaveXml,200);}
obj.SaveXml=function(){if(obj.Storage=='cookie')
ajaxart.cookies.writeCookie(obj.Id,ajaxart.xml2text(obj.Xml));if(obj.Storage=='local storage'&&window.localStorage){window.localStorage[obj.Id]=ajaxart.xml2text(obj.Xml);}
obj.Saving=false;}
ajaxart_xml_onchange(obj.Xml,obj.XmlChanged,context);}
init(obj);}
if(!obj.Xml)return[obj];obj.Items=(obj.Mode=='single'?[obj.Xml]:aa_xpath(obj.Xml,'*'));return[obj];},ResourcesToGlobalVars:function(profile,data,context)
{if(!context.vars._GlobalVars)return;var globals=context.vars._GlobalVars[0];var bc=context.vars._BartContext[0];var resources=bc.Resources;for(var i=0;i<resources.length;i++){var init=function(globals,resource){var id=aa_totext(resource.ID);globals[id]=function(){return resource.Items;}}
init(globals,resources[i]);}}});aa_gcs("bart_field",{});aa_gcs("bart",{Page:function(profile,data,context)
{var obj={isObject:true};obj.ID=ajaxart.run(data,profile,'ID',context);obj.ResourceIDs=ajaxart.run(data,profile,'ResourceIDs',context);obj.ResourceID=ajaxart.run(data,profile,'ResourceID',context);obj.Type=ajaxart.run(data,profile,'Type',context);var init=function(page){page.Control=function(data1,ctx){var ctx2=ajaxart_mergeContext(context,ctx);ajaxart.runNativeHelper('OverrideUiPrefs',data,profile,ctx2);var out=[];try{out=ajaxart.run(data1,profile,'Control',aa_ctx(ctx2,{PageID:page.ID}));}catch(e){out=jQuery('<div>error showing page</div>').get();}
return out;}}
init(obj);return[obj];},PageByID:function(profile,data,context)
{if(!context.vars._BartContext)return[];var pages=context.vars._BartContext[0].Pages;if(!pages)return[];var pageID=aa_text(data,profile,'PageID',context);var page=ajaxart_object_byid(pages,pageID);if(page)return[page];return[];}});aa_gcs("action_async",{RunAsync:function(profile,data,context)
{var failure=ajaxart.xml.xpath(ajaxart.parsexml('<xml value=""/>'),'@value');var newContext=aa_ctx(context,{AyncFailure:failure});ajaxart_RunAsync(data,ajaxart.fieldscript(profile,'Action'),newContext,function(data1,ctx,success){ajaxart.run(data,profile,success?'OnSuccess':'OnFailure',context);});return["true"];}});aa_gcs("action",{Switch:function(profile,data,context)
{return aa_switch(profile,data,context);},RunActions:function(profile,data,context)
{var actionProfs=ajaxart.subprofiles(profile,'Action');var result=[];for(i in actionProfs)
result=ajaxart.run(data,actionProfs[i],"",context);return["true"];},WriteValue:function(profile,data,context)
{var into=ajaxart.run(data,profile,'To',context);var value=ajaxart.run(data,profile,'Value',context);if(ajaxart.isObject_array(into)&&into[0]["WriteValue"]!=null){ajaxart.runScriptParam(value,into[0]["WriteValue"],context);}
else{ajaxart.writevalue(into,value);}
return["true"];},IfThenElse:function(profile,data,params)
{return aa_ifThenElse(profile,data,params);},RunActionOnItems:function(profile,data,context)
{var items=ajaxart.run(data,profile,'Items',context);var indicateLast=aa_bool(data,profile,'IndicateLastItem',context);var indicateIndex=aa_bool(data,profile,'IndicateItemIndex',context);for(var i=0;i<items.length;i++)
{var ctx=context;if(indicateIndex)ctx=aa_ctx(ctx,{_ItemIndex:[''+i]});if(i==items.length-1&&indicateLast)ctx=aa_ctx(ctx,{_IsLastItem:["true"]});ajaxart.run([items[i]],profile,'Action',ctx);}}});aa_gcs("jbart_api",{});ajaxart.load_xtml_content('',ajaxart.parsexml('<xtml package="true"><xtml ns="yesno"><Component id="Not" type="data.Boolean" execution="native"><Param name="Of" type="data.Boolean" essential="true" script="true"/></Component><Component id="ItemsNotEqual" type="data.Boolean"><Param name="Item1" essential="true"/><Param name="Item2" essential="true"/><xtml t="yesno.Not"><Of t="yesno.ItemsEqual" Item1="\%$Item1\%" Item2="\%$Item2\%"/></xtml></Component><Component id="EqualsTo" type="data.Boolean" execution="native"><Param name="Data" Title="Value" essential="false"/><Param name="To" essential="true"/></Component><Component id="Empty" type="data.Boolean" execution="native"><Param name="CheckInnerText" type="data.Boolean"/></Component><Component id="ItemsEqual" type="data.Boolean" execution="native"><Param name="Item1" essential="true"/><Param name="Item2" essential="true"/></Component><Component id="IsEmpty" type="data.Boolean" execution="native"><Param name="Value"><Default value="\%\%"/></Param><Param name="CheckInnerText" type="data.Boolean"/></Component><Component id="PassesFilter" type="data.Data" execution="native" dtsupport="false"><Param name="Filter" type="data.Boolean" essential="true" script="true"><Default value="true"/></Param></Component><Component id="Contains" type="data.Boolean" execution="native"><Param name="AllText"><Default t="data.Same"/></Param><Param name="Text" type="data.Data[]" essential="true"/><Param name="IgnoreCase" type="data.Boolean"><Default value="false"/></Param><Param name="IgnoreOrder" type="data.Boolean"><Default value="false"/></Param><Param name="OneOf" type="data.Boolean"/></Component><Component id="OR" type="data.Boolean" execution="native"><Param name="Item" type="data.Boolean[]" essential="true" script="true"/></Component><Component id="And" type="data.Boolean" execution="native"><Param name="Item" type="data.Boolean[]" script="true" essential="true"/></Component><Component id="NotEmpty" type="data.Boolean" execution="native"><Param name="Value" essential="true"><Default value="\%\%"/></Param><Param name="CheckInnerText" type="data.Boolean"/></Component></xtml><xtml ns="xtml"><Component id="UseAndTranslateParam" type="*" execution="native" dtsupport="false"><Param name="Param" essential="true"/><Param name="Input"><Default t="data.Same"/></Param></Component><Component id="Params" type="data.Data" execution="native" dtsupport="false"><Param name="Param" type="data.Data[]"/><Param name="ScriptParam" type="data.Data[]"/><Param name="Method" type="data.Data[]"/><Param name="ScriptParamArray" type="data.Data[]"/></Component><Component id="UseParamArray" type="*" execution="native" dtsupport="false"><Param name="Param" essential="true"/></Component><Component id="ComponentDefinition" type="data.Data" execution="native"><Param name="ID" essential="true"/><Param name="ToXtml" type="data.Boolean"><Default value="false"/></Param></Component><Component id="UseParam" type="*" execution="native" dtsupport="false"><Param name="Param" essential="true"/><Param name="Input"><Default t="data.Same"/></Param></Component><Component id="RunXtml" type="*" execution="native" dtsupport="false"><Param name="Xtml" essential="true" remark="no default (in js)"/><Param name="Input" remark="default \%\% in js"/><Param name="ForceInputParam" type="data.Boolean"/><Param name="Field"/><Param name="Method"/></Component><Component id="XtmlOfParamArray" type="data.Data" execution="native" description="Retrieves the xtml of a param array"/><Component id="ComponentsOfType" type="data.Data" execution="native"><Param name="Type" essential="true"/><Param name="ForAllTypes" type="data.Boolean"/></Component></xtml><xtml ns="xml"><Component id="Update" type="xml.Change" execution="native"><Param name="NewValue"/></Component><Component id="UpdateInnerText" type="xml.Change" execution="xtml"><Param name="Element"><Default value="\%\%"/></Param><Param name="NewValue" script="true"/><xtml t="xml.Update"><Data t="data.Pipeline"><Item value="\%$Element\%"/><Item t="xml.InnerText"/></Data><NewValue t="xtml.UseParam" Param="NewValue"/></xtml></Component><Component id="Xml" type="data.Data" execution="native"><Param name="*" type="xml"/><Param name="DynamicContent" type="data.Boolean"><Default value="false"/></Param></Component><Component id="InnerText" type="data.Data" execution="native"/><Component id="Tag" type="data.Data" execution="native"><Param name="Data" Title="Xml"/><Param name="RemoveNamespace"><Default value="false"/></Param></Component><Component id="Wrap" type="data.Aggregator" execution="native"><Param name="HeadTag"/><Param name="Head"/></Component><Component id="AttributeName" type="data.Data" execution="native"/><Component id="SetAttribute" type="xml.Change" execution="native"><Param name="AttributeName" essential="true"/><Param name="Value" essential="true"/><Param name="RemoveEmptyAttribute" type="data.Boolean"><Default value="false"/></Param></Component><Component id="Duplicate" type="xml.Change" execution="native"><Param name="Element"/><Param name="Items"/><Param name="ChangeOnElement" type="xml.Change[]"/><Param name="Separator"/><Param name="SeparatorAround" type="yeson.YesNo"><Default value="false"/></Param><Param name="ChangeOnFirstElement" type="xml.Change[]"/></Component><Component id="WithChanges" type="data.Data" execution="native"><Param name="Xml"><Default value="\%\%"/></Param><Param name="Change" type="xml.Change[]" essential="true"/><Param name="CloneXml" type="data.Boolean"><Default value="true"/></Param></Component><Component id="Attributes" type="data.Data" execution="native"><Param name="AlsoEmpty" type="data.Boolean"><Default value="true"/></Param></Component><Component id="AddChildren" type="xml.Change" execution="native"><Param name="Children" essential="true"/><Param name="CloneChildren" type="data.Boolean"><Default value="false"/></Param></Component></xtml><xtml ns="validation"><Component id="PassingValidations" type="data.Boolean" execution="native"><Param name="TopControl"><Default value="\%$ControlElement\%"/></Param></Component></xtml><xtml ns="uipref"><Component id="OverrideUIPrefs" type="action.Action"><Param name="UIPrefs"/><Param name="Prefix"/><xtml t="action.RunActionOnItems"><Items t="xml.Attributes" AlsoEmpty="false" Data="\%$UIPrefs\%"/><Action t="uipref.SetPrefValue" Prefix="\%$Prefix\%" Value="\%\%"><Property t="xml.AttributeName"/></Action></xtml></Component><Component id="SetPrefValue" type="action.Action" execution="native"><Param name="Prefix"/><Param name="Property"/><Param name="Value"/></Component><Component id="InCookies" type="uipref.UIPreferences" execution="native"/></xtml><xtml ns="uiaspect"><Component id="ReadOnly" type="uiaspect.Aspect"><xtml t="uiaspect.AspectByXtml"><InitializeContainer t="object.SetBooleanProperty" Object="\%$_Cntr\%" Property="ReadOnly" Value="true"/></xtml></Component><Component id="HeaderFooter" type="uiaspect.Aspect" execution="native" light="false"><Param name="Control" type="headerfooter.HeaderFooterControl" script="true" essential="true"/><Param name="Identifier" type="data.Data"><Default value="0"/></Param><Param name="Location" type="enum"><Default value="header"/><value>header</value><value>footer</value><value>header and footer</value><value>footer, header only for many items</value></Param><Param name="RefreshStrategy" type="enum" Options="none,container change,item selection"><Default value="none"/></Param><Param name="Phase"><Default value="0"/></Param></Component><Component id="RichTable" type="uiaspect.ItemListPresentation"><Param name="Sort" type="data.Boolean" advanced="true"><Default value="true"/></Param><Param name="ColumnsResizer" type="data.Boolean" advanced="true"><Default value="true"/></Param><Param name="DragAndDropColumns" type="data.Boolean" advanced="true"><Default value="true"/></Param><Param name="DragAndDropRows" type="data.Boolean" advanced="true"><Default value="true"/></Param><Param name="HideEmptyTable" type="data.Boolean" advanced="true"/><Param name="Columns" type="dynamic_enum_multi" light="false"><Options t="uiaspect_dt.ColumnsOptions"/></Param><xtml t="uiaspect.Aspects"><Condition t="yesno.Not" Of="\%$_Cntr/HasRichTable\%"/><Aspect t="uiaspect.AspectByXtml"><InitializeContainer t="object.SetBooleanProperty" Object="\%$_Cntr\%" Property="HasRichTable" Value="true" Comment="should be removed. only to support twice putting RichTable"/></Aspect><Aspect t="uiaspect.Table" Columns="\%$Columns\%"/><Aspect t="uiaspect.Sort" Condition="\%$Sort\%"/><Aspect t="uiaspect.TableColumnsDragAndDrop" Condition="\%$DragAndDropColumns\%"/><Aspect t="uiaspect.TableColumnsResizer" Condition="\%$ColumnsResizer\%"/><Aspect t="uiaspect.DragAndDropMover" Condition="\%$DragAndDropRows\%"/><Aspect t="uiaspect.TableNoItems" HideTable="\%$HideEmptyTable\%"/></xtml></Component><Component id="List" type="uiaspect.ItemListPresentation" execution="native" gallery="List"><Param name="EachItemInLine" type="data.Boolean"/><Param name="ItemSize" description="width,height"><Default value="200,150"/></Param><Param name="ItemCss"><Default value="overflow:hidden; padding:10px;"/><FieldAspect t="field_dt.CodeMirrorFieldEditor" CompId="uiaspect.List" ParamName="ItemCss"/></Param><Param1 name="FieldsLayout" type="uiaspect.DocumentPresentation" script="true" advanced="true"><Default t="uiaspect.Vertical"/></Param1><Param name="ItemClickable" type="data.Boolean"><Default value="true"/></Param><Param name="ClickAction" type="operation.OperationAction" script="true" advanced="true"><Default t="operation.Open"/></Param><Param name="SpacingBetweenFields" advanced="true"><Default value="5px"/></Param></Component><Component id="ItemClickable" type="uiaspect.Aspect" execution="native"><Param name="ClickAction" type="operation.OperationAction" script="true"><Default t="operation.Open"/></Param></Component><Component id="Aspects" type="uiaspect.Aspect" dtsupport="false" light="false"><Param name="Aspect" type="uiaspect.Aspect[]" script="true" essential="true"/><xtml t="xtml.UseParamArray" Param="Aspect"/></Component><Component id="HighlightSelectionOnHover" type="uiaspect.Aspect" execution="native" category="selection" jbart="false"/><Component id="TableColumnsResizer" type="uiaspect.Aspect" execution="native" category="table" light="false"/><Component id="ItemSelection" type="uiaspect.Aspect" execution="native" category="selection,master details" light="false"><Param name="KeyboardSupport" type="data.Boolean"><Default value="true"/></Param><Param name="AutoSelectFirstItem" type="enum"><Default value="true"/><value>false</value><value>true</value><value>select and focus</value></Param><Param name="MouseSupport" type="enum" Options="mouse down,mouse click"><Default value="mouse down"/></Param><Param name="IncludeSubContainers" type="data.Boolean"><Default value="true"/></Param><Param name="PropagateSelection" type="data.Boolean"/><Param name="OnSelect" type="action.Action" script="true"/><Param name="FilterOnFirstSelected" type="data.Boolean" script="true"/></Component><Component id="SearchLayout" type="field.PopupPage" execution="native"><Param name="ImageSize" description="width,height"><Default value="70,70"/></Param><Param name="ItemSize" description="width,height"><Default value="300,50"/></Param><Param name="ItemCss"><Default value="overflow:hidden; padding:10px;"/></Param><Param name="TitleCss"><Default value="font-weight:bold"/></Param><Param name="ExtraTextCss"><Default value=""/></Param><Param name="TextMaxLength"><Default value="35"/></Param><NativeHelper name="Page" t="ui.MultiplePage"><Presentation t="uiaspect.List" EachItemInLine="true" ItemCss="\%$ItemCss\%" ItemSize="\%$ItemSize\%"/><Aspect t="uiaspect.ReadOnly"/><Field t="field.XmlGroup" Title="Item" ID="item" Path="" HideTitle="true"><FieldAspect t="field_aspect.Section"/><Presentation t="uiaspect.Horizontal" Spacing="25px"/><Operations t="operation.Operations"/><Field t="field.XmlField" ID="image" Title="image"><Type t="field_aspect.Image" KeepImageProportions="true"><Width t="text.Split" Text="\%$ImageSize\%" Part="First"/><Height t="text.Split" Text="\%$ImageSize\%" Part="Second"/></Type><FieldAspect t="field_aspect.HideTitle"/></Field><Field t="field.XmlGroup" Title="right" ID="Right" Path="" HideTitle="true"><FieldAspect t="field_aspect.Section"/><Presentation t="uiaspect.PropertySheet"/><Operations t="operation.Operations"/><Field t="field.XmlField" ID="Title" Title="Title"><Type t="field_aspect.Text"/><FieldAspect t="field_aspect.HideTitle"/><FieldAspect t="field_aspect.Css" OnElement="content" Inline="\%$TitleCss\%"/></Field><Field t="field.Text" Title="text" ID="Text" ShowTitle="" HtmlContents="false" Text="\%\%"><FieldAspect t="field_aspect.LimitTextLength" FullTextAsTooltip="false" MaxLength="\%$TextMaxLength\%"/><FieldAspect t="field_aspect.Css" OnElement="content" Inline="\%$ExtraTextCss\%"/></Field></Field></Field></NativeHelper></Component><Component id="DragAndDropMover" type="uiaspect.Aspect" execution="native" category="table,tree"><Param name="OnDrop" type="action.Action" script="true"/></Component><Component id="TableNoItems" type="uiaspect.Aspect" execution="native" category="table" description="Table with no items shows a \'no items\' indication"><Param name="HideTable" type="data.Boolean" description=""/></Component><Component id="PropertySheet" type="uiaspect.DocumentPresentation" execution="native"><Param name="PropertiesWidth" advanced="true"><Default value="80"/></Param><Param name="Space" advanced="true"><Default value="5px"/></Param><Param name="HeaderSpace" advanced="true"><Default value="0"/></Param><Param name="FooterSpace" advanced="true"><Default value="0"/></Param></Component><Component id="Horizontal" type="uiaspect.DocumentPresentation" execution="native"><Param name="Spacing" description="e.g. 5px or 5px,20px,3px for different spacings"><Default value="5px"/></Param><Param name="HideInnerTitles" type="data.Boolean"/><Param name="EnforceSpacing" type="data.Boolean" advanced="true"><Default value="true"/></Param><Param name="Widths" description="e.g. 50px,100px,30px" advanced="true"/><Param name="MinWidths" description="e.g. 30px,80px,30px" advanced="true"/><Param name="MaxWidths" description="e.g. 50px,100px,30px" advanced="true"/><Param name="AlighLastToRight" type="data.Boolean" advanced="true"/><Param name="FullWidth" type="data.Boolean" advanced="true"><Default value="false"/></Param></Component><Component id="ClickableRows" type="uiaspect.Aspect" execution="native" jbart="true" gallery="ClickableRows" description="Assign action on row click"><Param name="Action" type="operation.OperationAction" script="true" RunningInput="\%$_Items/Items\%" description=""><Default t="operation.Open"/></Param><Param name="DisableSelection" advanced="true" type="data.Boolean"><Default value="true"/></Param></Component><Component id="CustomLayout" type="field.PopupPage"><Param name="Page" type="dynamic_enum" options_pt="bart_dt.BartPages"/><Param name="DesignTime"><Field t="bart_dt.CustomLayoutCreatePage"/></Param><xtml t="bart.PageByID" PageID="\%$Page\%"/></Component><Component id="AspectByXtml" type="uiaspect.Aspect" light="false" execution="native"><Param name="InitializeContainer" type="action.Action" script="true"/></Component><Component id="Permissions" type="uiaspect.Aspect" execution="native" category="model" jbart="false"><Param name="VisibleIf" type="data.Boolean" script="true"><Default value="true"/></Param><Param name="WritableIf" type="data.Boolean" script="true"/><Param name="ControlIfNotVisible" type="ui.Control" script="true"><Default t="ui.Text" Text="Access denied" Class="aa_access_denied"/></Param></Component><Component id="Table" type="uiaspect.ItemListPresentation" execution="native" light="false"><Param name="Columns" type="dynamic_enum_multi" light="false"><Options t="uiaspect_dt.ColumnsOptions"/><Options t="data.List"><Item t="data.Pipeline"><Item value="\%$PreviewCntr/Fields\%"/><Item value="\%ID\%"/></Item><Item1 t="data.Pipeline"><Item value="\%$PreviewCntr/_Operations\%"/><Item value="\%ID\%"/></Item1></Options></Param><NativeHelper name="FieldMenu" t="menu.OpenContextMenu" FromMenu="hmenu"><Menu t="menu.ContextMenu"><Item t="menu.MenuItem" Image="images/butterfly1616.png" Text="Hide"><Action t="object.RunMethod" Object="\%$_Cntr\%" Method="GroupBy" Input="\%\%"/></Item><Item t="menu.MenuItem" Image="images/groupby.gif"><Text t="data.IfThenElse" If="\%$_Cntr/IsGrouped\%"><Then t="text.Translate" Text="Ungroup"/><Else t="text.MultiLang" Pattern="Group by \%Title\%"/></Text><Action t="object.RunMethod" Object="\%$_Cntr\%" Method="GroupBy" Input="\%\%"/></Item></Menu></NativeHelper></Component><Component id="Sort" type="uiaspect.Aspect" execution="native" category="table" light="false"/><Component id="TableColumnsDragAndDrop" type="uiaspect.Aspect" execution="native" category="table" light="false"/></xtml><xtml ns="uiaction"><Component id="SetCssProperty" type="action.Action"><Param name="Property" essential="true"/><Param name="Value" essential="true"/><xtml t="ui.RunJavaScript" type="action.Action" Expression="if(element != null) jQuery(element).css(\'\%$Property\%\',\'\%$Value\%\');"><Condition t="yesno.NotEmpty" Data="\%$Property\%"/></xtml></Component><Component id="ButtonClick" type="action.Action,uiaction.UsageAction" execution="native"><Param name="RunOn"><Field t="bart_dt.RunOnDT"/></Param></Component><Component id="Validate" type="action.Action"><Param name="Input"><Default t="data.Same"/></Param><Param name="OnSuccess" type="action.Action" script="true"/><Param name="OnFailure" type="action.Action" script="true"/><Param name="MandatoryMessage" script="true"><Default t="ui.MandatoryMessage"/></Param><Param name="ExtraValidation" type="ui.Validation" script="true"/><Param name="TopItem"><Default t="uiaction.GoUp" TopClass="ajaxart"/></Param><xtml t="action.RunActions"><Var name="OriginalControlElement" value="\%$ControlElement\%"/><Action t="action.RunActions" RunOn="\%$TopItem\%"><Var name="MandatoryErrors" t="data.WritableText"/><Var name="ValidationError" t="data.WritableText"/><Action t="uiaction.Show" RunOn=".field_desc"/><Action t="uiaction.Hide" RunOn=".validation_message"/><Action t="ui.RunInControlContext" RunOn="down(.field_control)" Remark="mandatory" Mode="copy control variables"><Item t="action.RunActions"><Condition t="yesno.And"><Item t="uiaction.HasClass" Cls="mandatory"/><Item t="yesno.IsEmpty"/></Condition><Action t="uiaction.AddClass" Cls="error mandatory_error"/><Action t="action.WriteValue" To="\%$MandatoryErrors\%"><Value t="data.AddToCommaSeparated" List="\%$MandatoryErrors\%" ToAdd="\%$FieldTitle\%"/></Action></Item></Action><Action t="server.CallServer" Remark="valiadtions"><Call t="ui.RunInControlContext" RunOn="down(.field_control)" Mode="copy control variables"><Item t="xtml.RunXtml" Xtml="\%$_Field/Validation\%"><Condition t="yesno.NotEmpty"/></Item></Call><Call t="xtml.UseParam" Param="ExtraValidation" Remark="extra validations"><Var name="_ValidationContext" t="xtml.Params"><ScriptParam name="OnError" t="action.WriteValue" To="\%$ValidationError\%" Value="\%\%"/></Var></Call><Call t="server.ImmediateResult" Remark="avoid empty calls"/><OnSuccess t="action.Switch"><Case><IfCondition t="yesno.NotEmpty" Value="\%$MandatoryErrors\%"/><Then t="action.RunActions"><Action t="uiaction.SetMessageBarText" MessageBarType="validation" RunOn="\%$TopItem\%"><Text t="xtml.UseParam" Param="MandatoryMessage"><Var name="FieldTitle" t="text.Concat" Separator=", "><Items t="data.ListByCommas" List="\%$MandatoryErrors\%"/><LastSeparator t="text.MultiLang" Pattern=" and "/></Var></Text></Action><Action t="xtml.UseParam" Param="OnFailure" RunOn="\%$OriginalControlElement\%"/></Then></Case><Case><IfCondition t="yesno.NotEmpty" Value="\%$ValidationError\%"/><Then t="action.RunActions"><Action t="uiaction.SetMessageBarText" RunOn="\%$TopItem\%" MessageBarType="validation" Text="\%$ValidationError\%"/><Action t="xtml.UseParam" Param="OnFailure" RunOn="\%$OriginalControlElement\%"/></Then></Case><Default t="xtml.UseParam" Param="OnSuccess" RunOn="\%$OriginalControlElement\%"/></OnSuccess><OnFailure t="uiaction.SetMessageBarText" RunOn="\%$TopItem\%" MessageBarType="validation" Text="error on validation"/></Action></Action></xtml></Component><Component id="SetUrlFragment" type="action.Action"><Param name="Fragment"/><Param name="Attribute"/><Param name="Value"/><xtml t="uiaction.GoToUrl"><Var name="FragmentEncoded" t="text.UrlEncoding" Data="\%$Fragment\%"/><Var name="ValueEncoded" t="text.UrlEncoding" Data="\%$Value\%"/><Url t="data.Pipeline"><Item t="data.Url"/><Item t="text.Replace" Find="#.*" ReplaceWith="" UseRegex="true"/><Item t="text.Concat" Suffix="#\%$NewFragment\%"><Var name="NewFragment" t="data.IfThenElse" Then="\%$Fragment\%"><If t="yesno.IsEmpty" Value="\%$Attribute\%"/><Else t="data.Pipeline"><Item t="data.FirstSucceeding"><Item t="ui.UrlFragment"/><Item value=""/></Item><Item t="text.Replace" Find="[?]\%$Attribute\%=[^;?]*[;?]" ReplaceWith="" UseRegex="true"/><Item t="data.IfThenElse"><If t="yesno.IsEmpty" Value="\%$Value\%"/><Then value="\%\%"/><Else value="\%\%?\%$Attribute\%=\%$ValueEncoded\%"/></Item></Else></Var></Item></Url></xtml></Component><Component id="FindFirstInput" execution="native"/><Component id="Focus" type="action.Action" execution="native"/><Component id="GoToPage" type="action.Action" execution="native"><Param name="Url" essential="true"/><Param name="Type" type="enum"><Default value="open in a new tab"/><value>navigate current page</value><value>open in a new tab</value></Param></Component><Component id="Show" type="action.Action" execution="native"/><Component id="Hide" type="action.Action" execution="native"/><Component id="HideMessageBarOnUserClick" execution="native">&#xa; </Component><Component id="Refresh" type="action.Action" execution="native"><Param name="RunOn" essential="true"/><Param name="RunOnControl" type="action.Action" advanced="true"/></Component><Component id="SetMessageBarText" type="action.Action"><Param name="Hide" type="data.Boolean"><Default value="false"/></Param><Param name="Text"/><Param name="MessageBarType"><Default value="notification"/></Param><Param name="Type" type="enum"><value>Error</value><value>Warning</value><value>Info</value><value>Success</value><Default value="Error"/></Param><xtml t="action.RunActions" RunOn=".\%$MessageBarType\%" RunOn1="updown(.ajaxart,.\%$MessageBarType\%)"><Action t="action.RunActionOnItems" Items="\%$ControlElement\%"><Action t="action.IfThenElse" If="\%$Hide\%" RunOn="\%\%"><Then t="uiaction.Hide"/><Else t="action.RunActions"><Action t="uiaction.SetText" RunOn=".message_bar_text"><Text t="text.MultiLang" Pattern="\%$Text\%" Dynamic="true"/></Action><Action t="uiaction.RemoveClass" Cls="Error Warning Success Info"/><Action t="uiaction.AddClass" Cls="\%$Type\%"/><Action t="uiaction.Show"/></Else></Action></Action><Action t="uiaction.HideMessageBarOnUserClick"><Condition t="yesno.ItemsEqual" Item1="\%$MessageBarType\%" Item2="notification"/></Action><Action t="dialog.FixTopDialogPosition"/></xtml></Component><Component id="GoToUrl" type="action.Action" execution="native" hidden="true"><Param name="Url" essential="true"/></Component><Component id="GoUp" type="data.Data" execution="native"><Param name="TopClass"/><Param name="TopId"/><Param name="TopHtmlTag"/></Component><Component id="SetText" type="action.Action,uiaction.UsageAction" execution="native"><Param name="RunOn"><Field t="bart_dt.RunOnDT"/></Param><Param name="Text" essential="true"/><Param name="StayInControl" type="data.Boolean" Description="do not fire blur event"/><Param name="Mode" type="enum"><value>InsertAtCaret</value><value>ReplaceAll</value><value>InsertAtEnd</value><value>InsertAtBegining</value><value>CharByChar</value><Default value="ReplaceAll"/></Param><Param name="DoNotFireEvents" type="data.Boolean"/></Component><Component id="RemoveClass" type="action.Action"><Param name="Cls" essential="true"/><xtml t="ui.RunJavaScript" Expression="jQuery(element).removeClass(ajaxart.getVariable(context, \'Cls\')[0]);"><Var name="Cls" value="\%$Cls\%"/></xtml></Component><Component id="AddClass" type="action.Action" execution="native"><Param name="Cls" essential="true"/></Component><Component id="RunUiActions" type="xml.Change" execution="native"><Param name="Action" type="action.Action[]" essential="true"/></Component><Component id="HasClass" type="data.Boolean" execution="native"><Param name="Cls" essential="true"/></Component></xtml><xtml ns="ui"><Component id="OnKeyDown" type="action.Action" execution="native"><Param name="Action" type="action.Action" script="true" essential="true"/></Component><Component id="ElementOfClass" type="data.Data" execution="native"><Param name="Cls" essential="true"/><Param name="OnlyFirst" type="data.Boolean"><Default value="true"/></Param><Param name="Direction" type="enum"><Default value="down"/><value>up</value><value>down</value></Param></Component><Component id="Document" type="ui.Control" databind="true" execution="native"><Param name="ID"><Default value="Document"/></Param><Param name="Item" type="data_items.Items"><Default t="data_items.Items" Items="\%\%"/></Param><Param name="Fields" type="field.Fields" essential="true"/><Param name="Operations" type="operation.Operations"/><Param name="Aspect" type="uiaspect.Aspect[]" script="true"/><Param name="SectionAspect" type="uiaspect.SectionAspect[]" script="true"/><Param name="Presentation" type="uiaspect.DocumentPresentation" script="true"><Default t="uiaspect.PropertySheet"/></Param></Component><Component id="ButtonAsHyperlink" type="ui.ButtonStyle" image="images/styles/button_hyperlink.png" execution="native"><Param name="TextInlineCss" advanced="true"/><Param name="ImageInlineCss" advanced="true"/></Component><Component id="ExecJQuery" type="xml.Change" execution="native"><Param name="Expression" essential="true"/></Component><Component id="RunJavaScript" type="action.Action" execution="native" hidden="true" depricated="true"><Param name="Expression" essential="true"/><NativeHelper t="ui.DataFromJavaScript"/></Component><Component id="StandardButton" type="ui.ButtonStyle" image="images/styles/standard_button.png" execution="native"/><Component id="HasClass" type="data.Boolean" execution="native"><Param name="Cls"/></Component><Component id="ControlWithAction" type="ui.Control" execution="native" databind="true"><Param name="RunBeforeControl" type="action.Action" script="true"/><Param name="Control" type="ui.Control" script="true" essential="true"/><Param name="RunAfterControl" type="action.Action" script="true"/><Param name="RunAfterControlWithTimer" type="data.Boolean"/></Component><Component id="UrlFragment" type="data.Data"><Param name="Attribute"/><xtml t="data.Pipeline"><Item t="data.Url"/><Item t="text.Split" Separator="#" Part="Second"/><Item t="data.IfThenElse" Then="\%\%"><If t="yesno.IsEmpty" Value="\%$Attribute\%"/><Else t="ui.UrlFragmentAttribute" Url="\%\%" Attribute="\%$Attribute\%"><Url t="data.Url"/></Else></Item><Item t="text.UrlEncoding" Type="decode"/></xtml></Component><Component id="DefaultMessageBar" type="ui.MessageBarStyle" databind="true"><xtml t="data.Pipeline" Class="message_bar"><Item t="ui.Text" Class="message_bar_text"/><Item t="xml.Wrap"><Head t="ui.Html"><div/></Head></Item><Item1 t="xml.WithChanges" Xml="\%\%"><Change t="uiaction.Hide" RunOn="\%\%"/></Item1></xtml></Component><Component id="PlaceholderToAddControl" type="ui.Control" visibility="hidden"><xtml t="ui.Html"><div class="placeholder_toadd_control" ajaxart_type="ui.Control"/></xtml></Component><Component id="MandatoryMessage"><xtml t="text.MultiLang" Pattern="Please enter value for \%$FieldTitle\%"/></Component><Component id="NotInCaptureMode" type="data.Boolean" execution="native"/><Component id="UrlFragmentAttribute" type="data.Data" execution="native"><Param name="Url"/><Param name="Attribute"/></Component><Component id="DataFromJavaScript" type="data.Data" execution="native"><Description>retrieves data from a javascript expression. The expression can access the data and variables as js variables named : data,var1,...</Description><Param name="Expression" essential="true"/></Component><Component id="MultiplePage" type="ui.MultiplePage,ui.Page"><Param name="FieldsFromList"/><Param name="Field" type="field.Fields[]" script="true"/><Param name="Operations" type="operation.Operations" script="true"/><Param name="Presentation" type="uiaspect.ItemListPresentation" script="true"><Default t="uiaspect.RichTable"/></Param><Param name="Aspect" type="uiaspect.Aspect[]" script="true"/><Param name="ID"/><xtml t="object.Object"><Property name="Fields" t="data.List"><Item t="data.ItemsByIDs" List="\%$_Cntr/Fields\%" IDs="\%$FieldsFromList\%"/><Item t="xtml.UseParamArray" Param="Field"/></Property><Method name="Control" t="ui.ItemList" Items="\%$_PageParams/DataItems\%" ID="\%$ID\%" DataHolderCntr="true"><Fields value="\%$_This/Fields\%"/><Operations t="xtml.UseParam" Param="Operations"/><Presentation t="xtml.UseParam" Param="Presentation"/><Aspect t="uiaspect.Permissions" WritableIf="false" Condition="\%$_PageParams/ReadOnly\%"/><Aspect t="xtml.UseParamArray" Param="Aspect"/><Aspect t="object.RunMethod" Object="\%$_PageParams\%" Method="Aspect"/></Method></xtml></Component><Component id="ItemList" type="ui.Control" databind="true" execution="native"><Param name="ID"><Default value="ItemList"/></Param><Param name="Items" type="data_items.Items" essential="true"/><Param name="Fields" type="field.Fields"/><Param name="Presentation" type="uiaspect.ItemListPresentation" script="true" essential="true"/><Param name="Operations" type="operation.Operations"/><Param name="Aspect" type="uiaspect.Aspect[]" script="true"/><Param name="DataHolder" type="dataview.DataHolder"/><param name="DataHolderCntr" type="data.Boolean"/></Component><Component id="LineBreak" type="ui.ListLayout"><Param name="Separator" type="ui.Control"/><Param name="IncludeSpacing" type="data.Boolean"><Default value="true"/></Param><xtml t="data.Pipeline"><Var name="Controls"/><Item t="data.Pipeline"><Item value="\%$Controls\%"/><Aggregator t="data.AddSeparator" Separator="\%$Separator\%"/></Item><Item t="xml.Wrap"><Head t="ui.Html"><DIV class="aa_linebreak"/></Head></Item><Aggregator t="data.AddSeparator"><Separator t="ui.PlaceholderToAddControl"><Class t="text.Text" Text="spacing" Condition="\%$IncludeSpacing\%"/></Separator></Aggregator><Aggregator t="xml.Wrap"><Head t="ui.Html"><DIV/></Head></Aggregator></xtml></Component><Component id="Html" type="ui.Control" visibility="hidden" execution="native"><Param name="Html"/><Param name="Tag"/><Param name="DynamicContent" type="data.Boolean"><Default value="false"/></Param></Component><Component id="Horizontal" type="ui.ListLayout" execution="xtml"><Param name="Padding"><Default value="10px"/></Param><Param name="ColumnCssClass"/><Param name="VerticalAlign" type="enum"><Default value="none"/><value>top</value><value>middle</value><value>bottom</value><value>none</value></Param><xtml t="xml.WithChanges"><Var name="Controls"/><Xml t="ui.Html" DynamicContent="true"><table class="horizontal_layout" cellspacing="0" cellpadding="0"><tr><td class="horizontal_td \%$ColumnCssClass\%"/></tr></table></Xml><Change t="xml.Duplicate" Items="\%$Controls\%"><Element t="ui.ElementOfClass" Cls="horizontal_td"/><ChangeOnElement t="xml.AddChildren" CloneChildren="false"><Children t="data.Same"/></ChangeOnElement><ChangeOnElement t="uiaction.RunUiActions"><Action t="uiaction.SetCssProperty" Property="vertical-align" Value="\%$VerticalAlign\%"/><Condition t="yesno.ItemsNotEqual" Item1="\%$VerticalAlign\%" Item2="none"/></ChangeOnElement><ChangeOnElement t="uiaction.AddClass" RunOn="\%\%" Cls="item_\%$DuplicateIndex\%"/><Separator t="data.Pipeline"><Var name="Width" t="text.Text" Text="width:\%$Padding\%;"><Condition t="yesno.NotEmpty" Data="\%$Padding\%"/></Var><Item t="ui.Html" DynamicContent="true"><td style="\%$Width\%" class="horizontal_Separator"><div/></td></Item></Separator></Change></xtml></Component><Component id="OKButton" type="ui.Control"><Param name="Text"/><Param name="OnClick" type="action.Action" script="true"/><Param name="Style" type="ui.ButtonStyle" script="true" paramVars="ButtonContext"><Default t="ui.StandardButton"/></Param><Param name="Image"/><Param name="Tooltip"/><Param name="ExtraValidations" type="ui.Validation" script="true"/><xtml Class="OKButton" t="xtml.UseParam" Param="Style"><Var name="ButtonContext" t="xtml.Params"><Param name="Text" t="text.MultiLang" Pattern="\%$Text\%" Dynamic="true"/><Param name="Image" value="\%$Image\%"/><Param name="Tooltip" value="\%$Tooltip\%"/><ScriptParam name="OnClick" t="uiaction.Validate"><Condition t="yesno.Not"><Of t="ui.HasClass" Cls="aa_loading" Data="\%$ControlElement\%"/></Condition><OnSuccess t="xtml.UseParam" Param="OnClick"/><ExtraValidation t="xtml.UseParam" Param="ExtraValidations"/></ScriptParam></Var></xtml></Component><Component id="RunInControlContext" execution="native"><Param name="Item"/><Param name="Mode"><Default value="full context"/><value>full context</value><value>copy control variables</value></Param></Component><Component id="List" type="ui.Control" execution="xtml" databind="true"><Param name="Control" type="ui.Control[]" essential="true"/><Param name="Layout" type="ui.ListLayout" script="true"><Default t="ui.LineBreak"/></Param><xtml t="data.FirstSucceeding"><Item t="xtml.UseParam" Param="Layout" Input="\%$Control\%"/><Item t="ui.Html"><div/></Item></xtml></Component><Component id="Image" type="ui.Control" databind="true" execution="native"><Param name="Source" essential="true"/><Param name="OnClick" type="action.Action" script="true"/><Param name="Title"/><Param name="Width"/><Param name="Height"/></Component><Component id="MessageBar" type="ui.Control"><Param name="Style" type="ui.MessageBarStyle"><Default t="ui.DefaultMessageBar"/></Param><Param name="Type" type="enum"><Default value="notification"/><value>validation</value><value>notification</value></Param><xtml t="data.Pipeline" Class="\%$Type\%"><Item value="\%$Style\%"/></xtml></Component><Component id="Text" type="ui.Control" databind="true" execution="native"><Param name="Text" essential="true"/><Param name="Style"/><Param name="FixNewLines" type="data.Boolean"/><Param name="MultiLang" type="data.Boolean"/><Param name="HtmlContents" type="data.Boolean"/><Param name="Hint"/></Component><Component id="Button" type="ui.Control" databind="true"><Description>A button can be a simple html button, an hyperlink or an image</Description><Default value="false"/><Param name="Text" essential="true"/><Param name="OnClick" essential="true" type="action.Action" script="true" paramVars="ControlElement"/><Param name="Style" type="ui.ButtonStyle" script="true"><Default t="ui.StandardButton"/></Param><Param name="Image"/><Param name="Tooltip"/><Param name="OnHover" type="action.Action" script="true"/><Param name="IsSelected" type="data.Boolean" script="true" advanced="true"/><xtml t="xtml.UseParam" Param="Style"><Var name="ButtonContext" t="xtml.Params"><Param name="Text" t="text.MultiLang" Pattern="\%$Text\%" Dynamic="true"/><Param name="Image" value="\%$Image\%"/><Param name="Tooltip" value="\%$Tooltip\%"/><ScriptParam name="OnClick" t="xtml.UseParam" Param="OnClick" paramVars="ControlElement"><Condition t="yesno.And"><Item t="ui.NotInCaptureMode"/><Item t="yesno.Not"><Of t="ui.HasClass" Cls="aa_loading" Data="\%$ControlElement\%"/></Item></Condition></ScriptParam><ScriptParam name="OnHover" t="xtml.UseParam" Param="OnHover"/></Var><Class value="aa_selected_btn"><Condition t="xtml.UseParam" Param="IsSelected"/></Class></xtml></Component><Component id="SetCssProperty" type="xml.Change" execution="native"><Param name="Property"/><Param name="Value"/></Component><Component id="ShowPage" type="ui.Control" category="page"><Param name="Page" type="ui.Page"/><Param name="PageParams" type="ui.PageParams"/><xtml t="object.RunMethod" Object="\%$Page\%" Method="Control"><Var name="_PageParams" value="\%$PageParams\%"/></xtml></Component><Component id="PageParams" type="ui.PageParams"><Param name="DataItems" type="data_items.Items"/><Param name="ReadOnly" type="enum" Options="false,true,inherit"><Default value="inherit"/></Param><Param name="UiPrefs" advanced="true" description="can set default filters, sorts, etc."/><Param name="PageID"/><Param name="Aspect" type="uiaspect.Aspect[]" advanced="true" script="true"/><xtml t="object.ObjectFromParams"><Property name="ReadOnly" t="data.IfThenElse" If="\%$ReadOnly\%==\'inherit\'" Then="\%$_Cntr/ReadOnly\%" Else="\%$ReadOnly\%"/><Method name="Aspect" t="xtml.UseParamArray" Param="Aspect"/></xtml></Component><Component id="ScreenSize" type="data.Data" execution="native"><Param name="Axis" type="enum.Enum"><Default value="height"/><value>height</value><value>width</value></Param><Param name="Margin"/><Param name="AsHtmlString" type="data.Boolean"/></Component></xtml><xtml ns="text"><Component id="Text" type="data.Data" execution="native"><Param name="Text" essential="true"/><Param name="RemoveEmptyParenthesis" type="data.Boolean"/></Component><Component id="Split" type="data.Data" execution="native"><Param name="Separator"><Default value=","/></Param><Param name="Text"><Default value="\%\%"/></Param><Param name="Part" type="enum"><Default value="All"/><value>All</value><value>First</value><value>ButFirst</value><value>Second</value><value>By index</value><value>Last</value><value>All but Last</value><value>All but First</value><value>All but First and Last</value></Param><Param name="Index" type="data.Data"/><Param name="Default"/><Param name="NoEmptyValues" type="data.Boolean"/></Component><Component id="UrlEncoding" type="data.Data" execution="native"><Param name="Data" title="Text"/><Param name="Type" type="enum"><Default value="encode"/><value>encode</value><value>decode</value></Param></Component><Component id="Translate" type="data.Data" execution="native"><Param name="Text" essential="true"/></Component><Component id="Replace" type="data.Data" execution="native"><Param name="Find" essential="true"/><Param name="ReplaceWith" essential="true"/><Param name="UseRegex" type="data.Boolean"><Default value="false"/></Param><Param name="ReplaceAll" type="data.Boolean"><Default value="true"/></Param><Param name="Text"><Default value="\%\%"/></Param></Component><Component id="MultiLang" type="data.Data"><Param name="Data" title="Text"/><Param name="Pattern" script="true" essential="true"/><Param name="Dynamic" type="data.Boolean"/><xtml t="data.IfThenElse"><Var name="PatternToUse" t="data.IfThenElse" If="\%$Dynamic\%" Else="\%$Pattern\%"><Then t="xtml.UseParam" Param="Pattern"/></Var><If t="yesno.Empty" Data="\%$Language\%"/><Then t="xtml.UseParam" Param="Pattern"/><Else t="text.FirstSucceeding"><Item t="xtml.RunXtml"><Xtml t="data.Lookup" LookupName="multi lang suites" LookFor="\%$Language\% / \%$PatternToUse\%"><AllItems t="data.Pipeline"><Item t="xtml.ComponentsOfType" Type="text.MultiLangSuite"/><Item t="xtml.ComponentDefinition" ID="\%\%"/><Item value="\%xtml/Pattern\%"/></AllItems><ItemCode value="\%../@Language\% / \%@Original\%"/><ItemValue t="text.FirstSucceeding"><Item value="\%@Tranlation\%"/><Item value="\%@T\%"/></ItemValue></Xtml></Item><Item t="data.Pipeline"><Item t="xtml.UseParam" Param="Pattern"/><Item t="text.Split" Separator="__" Part="First"/></Item></Else></xtml></Component><Component id="Concat" type="data.Aggregator" execution="native"><Param name="Items" light="false"><Default t="data.Same"/></Param><Param name="Item" light="false" type="data.Data[]"/><Param name="Separator" short="true" essential="true"/><Param name="LastSeparator" advanced="true" short="true"/><Param name="ItemText" short="true"><Default t="data.Same"/></Param><Param name="Prefix" advanced="true"/><Param name="Suffix" advanced="true"/><Param name="MaxLength" advanced="true"/><Param name="SuffixForMax" advanced="true"><Default value="..."/></Param></Component><Component id="FirstSucceeding" type="data.Data" execution="native"><Param name="Item" type="data.Data[]" essential="true"/></Component></xtml><xtml ns="server"><Component id="ImmediateResult" type="server.ServerCall" execution="native"><Param name="VarNameForResult"/><Param name="Reusable" type="data.Boolean"><Default value="false"/></Param><Param name="Result" type="data.Data"/><Param name="OnLoad" type="action.Action" script="true"/></Component><Component id="CallServer" type="action.Action" execution="native"><Param name="Call" type="server.ServerCall[]"/><Param name="OnSuccess" type="action.Action" script="true"/><Param name="OnFailure" type="action.Action" script="true"/><Param name="ProgressIndication" type="data.Data"><Default value="true"/></Param><NativeHelper name="StartCallingServer" t="server.OnStartCallingServer"/></Component><Component id="OnStartCallingServer" type="action.Action"><xtml t="xtml.RunXtml" Xtml="\%$_ProgressContext/StartCallingServer\%"/></Component></xtml><xtml ns="operation"><Component id="Open" type="operation.OperationAction"><Aspect t="operation.GenerateOperationFullXtml"><OperationXtml t="xml.Xml"><Operation t="operation.Operation" ID="edit" Icon="images/edit1616.gif" Target="item"><Title t="operation.TextOfOpen"/><Action t="operation.Open"/></Operation></OperationXtml></Aspect><Param name="Item" advanced="true"><Default value="\%$_ItemsOfOperation\%"/></Param><xtml t="object.RunMethod" Object="\%$_Cntr\%" Method="OpenItemDetails"><Var name="IsNewItem" value="false"/><Var name="_OperationID" value="OpenItemDetails"/><Var name="_InnerItem" value="\%$Item\%"/></xtml></Component><Component id="Link" type="operation.OperationAction"><Param name="Link"/><Param name="OpenInANewTab" type="data.Boolean"><Default value="true"/><FieldAspect t="field_aspect.Title" Title="Open in a new tab"/></Param><xtml t="uiaction.GoToPage" Url="\%$Link\%"><Type t="data.IfThenElse" If="\%$OpenInANewTab\%" Then="open in a new tab" Else="navigate current page"/></xtml></Component><Component id="Operations" type="operation.Operations" execution="native" light="false" dtsupport="false"><Param name="Operation" type="operation.Operations[]" script="true" essential="true"/></Component></xtml><xtml ns="object"><Component id="SetTextProperty" type="action.Action" execution="native"><Param name="Object"><Default value="\%\%"/></Param><Param name="Property" essential="true"/><Param name="Value" essential="true"/></Component><Component id="ObjectFromParams" type="object.Object" execution="native"><Param name="Property" type="data.Data[]"/><Param name="Method" type="data.Data[]"/></Component><Component id="Object" type="object.Object" execution="native"><Param name="Property" type="data.Data[]" has_name="true"/><Param name="Method" type="action.Action[]" has_name="true"/></Component><Component id="SetProperty" type="action.Action" execution="native"><Param name="Object"><Default value="\%\%"/></Param><Param name="Property" essential="true"/><Param name="Value" essential="true"/><Param name="IsSingleProperty" type="data.Boolean"/></Component><Component id="AddToProperty" type="action.Action" execution="native"><Param name="Object"><Default value="\%\%"/></Param><Param name="Property" essential="true"/><Param name="Value" essential="true"/></Component><Component id="SetMethod" type="action.Action" execution="native"><Param name="Object"><Default value="\%\%"/></Param><Param name="Method" essential="true"/><Param name="Xtml" essential="true"/></Component><Component id="SetBooleanProperty" type="action.Action" execution="native"><Param name="Object"><Default value="\%\%"/></Param><Param name="Property" essential="true"/><Param name="Value" essential="true"/></Component><Component id="OverrideObject" type="object.Object" execution="native"><Param name="Object"/><Param name="Property" type="data.Data[]"/><Param name="TextProperty" type="data.Data[]"/><Param name="Method" type="data.Data[]"/><NativeHelper t="object.Object"/></Component><Component id="IsObject" type="data.Boolean" execution="native"/><Component id="RunMethod" type="*" execution="native" dtsupport="false"><Param name="Object"><Default value="\%\%"/></Param><Param name="Method" essential="true"/><Param name="Input"><Default value="\%\%"/></Param><Param name="Param" type="data.Data[]"><ParamAspect t="xtml_dt_aspect.RequiresName"/></Param></Component></xtml><xtml ns="menu"><Component id="MenuItem" type="menu.MenuItem"><Param name="Text" essential="true"/><Param name="Action" type="action.Action" script="true" essential="true"/><Param name="Image"><Default value="images/studio/bullet1616.gif"/></Param><Param name="Selectable" type="data.Boolean"/><Param name="IsSelected" type="data.Boolean" script="true"/><Param name="SubItem" type="menu.TreeMenuItem[]"/><Param name="ExtraData"/><Param name="ID"/><xtml t="xtml.Params"><Param name="Text" t="text.MultiLang" Pattern="\%$Text\%" Dynamic="true"/><Param name="Image" value="\%$Image\%"/><Param name="ExtraData" value="\%$ExtraData\%"/><Param name="Selectable" value="\%$Selectable\%"/><Param name="SubItems" value="\%$SubItem\%"/><Param name="Input" value="\%\%"/><ScriptParam name="IsSelected" t="xtml.UseParam" Param="IsSelected"/><ScriptParam name="Action" t="xtml.UseParam" Param="Action"><Var name="MenuItemExtraData" value="\%$ExtraData\%"/></ScriptParam><Param value="\%$ID\%" name="ID"/></xtml></Component><Component id="ContextMenu" type="menu.ContextMenu" execution="native"><Param name="Item" type="menu.MenuItem[]" essential="true"/><Param name="FooterMessage"/><Param name="HeaderMessage"/></Component><Component id="OpenContextMenu" type="action.Action"><Param name="Menu" type="menu.ContextMenu" script="true" essential="true"/><Param name="FromMenu" type="enum"><value>vmenu</value><value>hmenu</value></Param><xtml t="xtml.UseParam" Param="Menu"><Var name="ContextMenuInput" t="data.FirstSucceeding"><Item value="\%$ContextMenuInput\%"/><Item value="\%\%"/></Var><Var name="_ContextMenuContext" t="xtml.Params"><Param name="FromMenu" value="\%$FromMenu\%"/><Param name="Input" value="\%$ContextMenuInput\%"/></Var></xtml></Component></xtml><xtml ns="jbart"><Component id="PoweredByJBartControl" type="ui.Control"><xtml t="ui.Html"><a class="aa_powered_by" href="http://www.artwaresoft.com" target="_new1"><span>Powered by</span><span class="aa_powered_by_jbart">jBart</span></a></xtml></Component></xtml><xtml ns="group"><Component id="DataFlow" type="group.GroupData"><Param name="FlowData" script="true"/><xtml t="object.Object"><Method name="FieldData" t="xtml.UseParam" Param="FlowData"/><Method name="DataItems" t="data_items.Items" Items="\%\%"/></xtml></Component></xtml><xtml ns="field_aspect"><Component id="Aspects" type="field.FieldAspect" light="false"><Param name="Aspect" type="field.FieldAspect[]" script="true" essential="true"/><xtml t="xtml.UseParamArray" Param="Aspect"/></Component><Component id="WritableControl" type="field.FieldAspect" execution="native" category="control"><Param name="Control" type="ui.Control" essential="true"/></Component><Component id="CellPresentation" type="field.FieldAspect" execution="native" category="ui"><Param name="Content" type="enum" essential="true"><Default value="text"/><value>text</value><value>expandable text</value><value>control</value></Param></Component><Component id="ImageReadOnlyImp" type="field.FieldAspect" execution="native" hidden="true"><Param name="Width" advanced="true"/><Param name="Height" advanced="true"/><Param name="KeepImageProportions" type="data.Boolean"/><Param name="UrlForMissingImage" advanced="true"/><Param name="TextForMissingImage" advanced="true"/><Param name="Src"/><Param name="HideEmptyImage" type="data.Boolean"/><Param name="OnClick" type="operation.OperationAction" script="true"/></Component><Component id="Control" type="field.FieldAspect" execution="native" category="control"><Param name="Control" type="ui.Control" essential="true"/></Component><Component id="OnUpdate" type="field.FieldAspect" category="advanced" execution="native"><Param name="Action" type="operation.OperationAction" script="true" essential="true"/></Component><Component id="Resizer" type="field.FieldAspect" category="ui" execution="native"><Param name="Disable" type="data.Boolean"/></Component><Component id="Text" type="field_aspect.FieldType"><Param name="Mandatory" type="data.Boolean" boolfeature="true"/><Param name="HideTitle" type="data.Boolean" boolfeature="true"/><Param name="ReadOnly" type="data.Boolean" boolfeature="true"/><xtml t="field_aspect.Aspects"><Aspect t="field_aspect.Mandatory" Condition="\%$Mandatory\%"/><Aspect t="field_aspect.HideTitle" Condition="\%$HideTitle\%"/><Aspect t="field_aspect.ReadOnly" Condition="\%$ReadOnly\%"/><Aspect t="field_aspect.SimpleInput"/><Aspect t="field.TextFilter"/><Aspect t="field_aspect.Resizer"/></xtml></Component><Component id="HideTitle" type="field.FieldAspect" category="ui"><xtml t="object.SetBooleanProperty" Object="\%$_Field\%" Property="HideTitle" Value="true"/></Component><Component id="PopupFeatures" type="field.FieldAspect" category="searchbox"><Param name="Feature" type="dlg.DialogFeature[]" script="true"/><xtml t="object.SetMethod" Object="\%$_Field\%" Method="PopupFeatures"><Xtml t="xtml.UseParamArray" Param="Feature"/></xtml></Component><Component id="DescriptionForEmptyText" type="field.FieldAspect" execution="native"><Param name="Description" essential="true"/></Component><Component id="Hyperlink" type="field.FieldAspect" execution="native" gallery="Hyperlink"><Param name="Action" type="operation.OperationAction" script="true"><Default t="operation.Open"/><RunningInput t="field_aspect.RunningInputFieldData"/></Param></Component><Component id="Mandatory" type="field.FieldAspect" execution="native" category="general" jbart="false"><Param name="ErrorMessage" script="true"/></Component><Component id="ReadOnly" type="field.FieldAspect" category="model"><xtml t="object.SetMethod" Object="\%$_Field\%" Method="ReadOnly" Xtml="true"/></Component><Component id="Css" type="field.FieldAspect" execution="native" gallery="Css"><Param name="OnElement" type="enum" Options="cell,content,title"><Default value="content"/></Param><Param name="Inline" script="true" essential="true"><FieldAspect t="field_dt.CodeMirrorFieldEditor" CompId="field_aspect.Css" ParamName="Inline"/></Param><Param name="Class" script="true" essential="true"/><Param name="OnCondition" script="true" type="data.Boolean" description="e.g. \%\% &gt; 20"/></Component><Component id="TextSummary" type="field.FieldAspect" gallery="TextSummary"><Param name="Text" script="true" essential="true"/><xtml t="object.SetMethod" Object="\%$_Field\%" Method="Text"><Xtml t="xtml.UseParam" Param="Text"/></xtml></Component><Component id="Image" type="field_aspect.FieldType" gallery="Image"><Param name="Width"/><Param name="Height"/><Param name="Src" script="true" advanced="true"><Default value="\%\%"/><RunningInput t="field_aspect.RunningInputFieldData"/></Param><Param name="HideEmptyImage" type="data.Boolean" advanced="true"><Default value="true"/></Param><Param name="KeepImageProportions" type="data.Boolean" advanced="true"><Default value="true"/></Param><Param name="PreviewHeight" advanced="true"><Default value="30px"/></Param><Param name="EditDirectly" type="data.Boolean" advanced="true"/><Param name="TextForMissingImageInEdit" advanced="true"><Default value="edit ..."/></Param><Param name="UrlForMissingImage" advanced="true"/><Param name="TextForMissingImage" advanced="true"/><Param name="TextForEmptyImageEditing" advanced="true"><Default value="enter image url"/></Param><Param name="OnClick" type="operation.OperationAction" script="true"/><xtml t="field_aspect.Aspects"><Aspect t="field_aspect.WritableControl"><Control t="field.ShowFieldControl" Item="\%\%"><Field t="field.Field1" ID="Image"><FieldAspect t="field_aspect.CellPresentation" Content="expandable text"><Condition t="yesno.Not" Of="\%$EditDirectly\%"/></FieldAspect><FieldAspect t="field_aspect.ImageReadOnlyImp" Height="\%$Height\%" Width="\%$Width\%" UrlForMissingImage="\%$UrlForMissingImage\%" KeepImageProportions="\%$KeepImageProportions\%" TextForMissingImage="\%$TextForMissingImageInEdit\%"><Src t="xtml.UseParam" Param="Src"/></FieldAspect><FieldAspect t="field_aspect.Control"><Control t="ui.List" Class="img_ctrl"><Control t="field.ShowFieldControl" Item="\%\%"><Field t="field.Field1" ID="Image"><FieldAspect t="field_aspect.SimpleInput"/><FieldAspect t="field_aspect.DescriptionForEmptyText" Description="\%$TextForEmptyImageEditing\%"/><FieldAspect t="field_aspect.OnUpdate"><Action t="uiaction.Refresh" RunOn="updown(.img_ctrl,.img)"/></FieldAspect><FieldAspect t="field_aspect.Resizer"/></Field></Control><Control t="ui.List" Class="img"><Control t="ui.Image" Source="\%\%" Height="\%$PreviewHeight\%"><Condition t="yesno.NotEmpty" Value="\%\%"/><OnClick t="dialog.OpenDialog"><Dialog t="dialog.Dialog" Buttons="Close"><Content t="ui.Image" Source="\%\%"/></Dialog></OnClick></Control></Control><Layout t="ui.Horizontal" VerticalAlign="middle"/></Control></FieldAspect></Field></Control></Aspect><Aspect t="field_aspect.ImageReadOnlyImp" Height="\%$Height\%" KeepImageProportions="\%$KeepImageProportions\%" Width="\%$Width\%" UrlForMissingImage="\%$UrlForMissingImage\%" TextForMissingImage="\%$TextForMissingImage\%" HideEmptyImage="\%$HideEmptyImage\%"><Src t="xtml.UseParam" Param="Src"/><OnClick t="xtml.UseParam" Param="OnClick"/></Aspect></xtml></Component><Component id="HeaderFooterField" type="field.FieldAspect" gallery="HeaderFooterField"><Param name="Location" type="enum" essential="true"><Default value="header"/><value>header</value><value>footer</value></Param><Param name="RefreshStrategy" type="enum" Options="none,container change,item selection"><Default value="none"/></Param><Param name="Phase"><Default value="0"/></Param><Param name="HeaderFooterField" type="field.Fields" advanced="true" hidden="true"><Default value="\%$_Field\%"/></Param><xtml t="action.RunActions"><Action t="object.SetBooleanProperty" Object="\%$_Field\%" Property="HeaderFooter" Value="true"/><Action t="object.SetProperty" Object="\%$_Field\%" Property="CntrAspects"><Value t="data.JustInTimeCalculation"><Content t="uiaspect.HeaderFooter" Identifier="\%$HeaderFooterField/ID\%" Location="\%$Location\%" RefreshStrategy="\%$RefreshStrategy\%" Phase="\%$Phase\%"><Control t="field.ShowFieldControl" Field="\%$HeaderFooterField\%" Cntr="\%$HeaderFooterCntr\%"><Item t="xml.Xml"><headerfooterdata/></Item></Control></Content></Value></Action><Action t="field_aspect.HideInTable"/></xtml></Component><Component id="LimitTextLength" type="field.FieldAspect" execution="native" category="advanced" gallery="LimitTextLength"><Param name="MaxLength"><Default value="50"/></Param><Param name="CuttingMark"><Default value="..."/></Param><Param name="FullTextAsTooltip" type="data.Boolean"><Default value="true"/></Param></Component><Component id="PopupPage" type="field.FieldAspect" category="searchbox"><Param name="Page" type="field.PopupPage" script="true"><Default t="uiaspect.SearchLayout"/></Param><xtml t="object.SetMethod" Object="\%$_Field\%" Method="PopupPage"><Xtml t="xtml.UseParam" Param="Page"/></xtml></Component><Component id="PopupImage" type="field.FieldAspect" category="picklist,ui" execution="native"><Param name="CssClass"><Default value="aa_popupimage"/></Param></Component><Component id="SimpleInput" type="field.FieldAspect" execution="native" light="false"/><Component id="FieldAspects" type="field.FieldAspect" light="false"><Param name="FieldAspect" type="field.FieldAspect[]" script="true" essential="true"/><xtml t="xtml.UseParamArray" Param="FieldAspect"/></Component><Component id="Section" type="field.FieldAspect" category="ui"><Param name="Image" type="image.Image"/><Param name="Style" type="style.SectionStyle"/><Param name="ExpandCollapse" type="field_aspect.ExpandCollapse" script="true"/><Param name="HideTitle" type="data.Boolean"/><Param name="Underline" type="data.Boolean"><Default value="true"/></Param><xtml t="action.RunActions"><Action t="object.SetBooleanProperty" Object="\%$_Field\%" Property="AsSection" Value="true"/><Action t="object.SetProperty" Object="\%$_Field\%" Property="SectionImage" Value="\%$Image\%" IsSingleProperty="true"/><Action t="object.SetProperty" Object="\%$_Field\%" Property="SectionExpandedByDefault" Value="\%$ExpandedByDefault\%"/><Action t="object.SetTextProperty" Object="\%$_Field\%" Property="SectionStyle" Value="\%$Style\%"/><Action t="object.SetBooleanProperty" Object="\%$_Field\%" Property="Underline" Value="\%$Underline\%"/><Action t="object.SetBooleanProperty" Object="\%$_Field\%" Property="HideTitle" Value="true" Condition="\%$HideTitle\%"/><Action t="action.RunActions" Remark="backward compatible"><Condition t="yesno.ItemsEqual" Item1="\%$ExpandCollapse\%" Item2="true"/><Action t="object.SetProperty" Object="\%$_Field\%" Property="SectionExpandCollapse" Value="true"/><Action t="object.SetProperty" Object="\%$_Field\%" Property="ExpandIcon" Value="images/plus.gif"/><Action t="object.SetProperty" Object="\%$_Field\%" Property="CollapseIcon" Value="images/minus.gif"/></Action><Action t="xtml.UseParam" Param="ExpandCollapse"/></xtml></Component><Component id="HideInTable" type="field.FieldAspect" category="ui"><xtml t="object.SetBooleanProperty" Object="\%$_Field\%" Property="HiddenForTable" Value="true"/></Component></xtml><xtml ns="field"><Component id="XmlField" type="field.Fields" execution="native"><Aspect t="component_aspect.Image" Image="images/studio/bullet1616.gif"/><Param name="Title" essential="true" autoaspects="false"><FieldAspect t="field_aspect.FieldData" FieldData="\%!@Title\%"/><FieldAspect t="field_aspect.AutoUpdateMasterItem"/></Param><Param name="Path" essential="true" advanced="true"><FieldAspect t="field_dt.FieldXPathEditor"/></Param><Param name="ID" light="false" essential="true"/><Param name="Type" essential="true" type="field_aspect.FieldType" script="true"><Default t="field_aspect.Text"/></Param><Param name="FieldAspect" essential="true" type="field.FieldAspect[]" light="false" script="true"/></Component><Component id="Text" type="field.Fields" advanceddt="true"><Aspect t="component_aspect.Image" Image="images/studio/text.png"/><Param name="Text" script="true"><ContextMenu t="xtml_dt.EditAsRichText"/></Param><Param name="CssStyle"/><Param name="ID" light="false" essential="true"/><Param name="Title" essential="true"/><Param name="ShowTitle" type="data.Boolean"/><Param name="FieldAspect" type="field.FieldAspect[]" light="false" script="true"/><xtml t="field.Field1" ID="\%$ID\%" Title="\%$Title\%"><FieldAspect t="field_aspect.HideTitle"><Condition t="yesno.Not" Of="\%$ShowTitle\%"/></FieldAspect><FieldAspect t="field_aspect.TextSummary"><Text t="xtml.UseAndTranslateParam" Param="Text"/></FieldAspect><FieldAspect t="field_aspect.Css" OnElement="content" Inline="\%$CssStyle\%"/><FieldAspect t="xtml.UseParamArray" Param="FieldAspect"/></xtml></Component><Component id="XmlGroup" type="field.Fields" execution="native"><Param name="Title" essential="true"/><Param name="Presentation" type="uiaspect.DocumentPresentation" script="true"><Default t="uiaspect.PropertySheet"/></Param><Param name="Path" essential="false"><FieldAspect t="field_dt.FieldXPathEditor"/></Param><Param name="ID" light="false" essential="true"/><Param name="Field" type="field.Fields[]" light="false" script="true" essential="true"/><Param name="Operations" type="operation.Operations" script="true" light="false"/><Param name="Aspect" type="uiaspect.Aspect[]" script="true" light="false"/><Param name="FieldAspect" type="field.FieldAspect[]" script="true" light="false"/><Param name="HideTitle" type="data.Boolean" boolfeature="true"/><NativeHelper1 name="Aspects" t="uiaspect.Aspects"><Aspect t="xtml.UseParam" Param="Presentation"/><Aspect t="uiaspect.Permissions"><WritableIf t="yesno.Not" Of="\%$_ParentCntr/ReadOnly\%"/></Aspect><Aspect t="xtml.UseParamArray" Param="Aspect"/><Aspect t="object.SetBooleanProperty" Object="\%$_Cntr\%" Property="IsVirtualGroup" Value="true" Condition="\%$Path\% == \'\'"/></NativeHelper1><NativeHelper1 name="Control" t="ui.Document" ID="\%$_Cntr/ID\%_\%$Path\%"><Var name="_ParentCntr" value="\%$_Cntr/Items\%"/><Var name="_ParentItems" value="\%$_Cntr/Items\%"/><Class value="aa_layoutgroup"><Condition t="yesno.IsEmpty" Value="\%$Path\%"/></Class><Item t="data_items.Items" Items="\%\%"><Aspect t="data_items.InnerDataItems" ParentDataItems="\%$_ParentItems\%"/></Item><Fields t="xtml.UseParamArray" Param="Field"/><Operations t="xtml.UseParam" Param="Operations"/></NativeHelper1></Component><Component id="TextFilter" type="field.FieldAspect" execution="native" category="filter" light="false"><NativeHelper name="Control" t="field.TextFilterControl"/></Component><Component id="Group" type="field.Fields" execution="native" image="images/studio/cube1616.gif"><Param name="ID" light="false" essential="true"/><Param name="Title" essential="true"/><Param name="GroupData" type="group.GroupData" script="true" essential="false"/><Param name="Layout" type="uiaspect.DocumentPresentation" script="true"><Default t="uiaspect.PropertySheet"/></Param><Param name="Field" type="field.Fields[]" light="false" script="true" essential="true"/><Param name="Aspect" type="uiaspect.Aspect[]" script="true" light="false"/><Param name="FieldAspect" type="field.FieldAspect[]" script="true" light="false"/><Param name="HideTitle" type="data.Boolean" boolfeature="true"/></Component><Component id="JavaScriptControl" type="field.Fields" execution="native" advanceddt="true"><Param name="ID" light="false" essential="true"/><Param name="Title"/><Param name="Html" essential="false"><FieldAspect t="field_dt.CodeMirrorFieldEditor" CompId="field.JavaScriptControl" ParamName="Html" Type="xml" Width="400px" Height="150px"/></Param><Param name="JavaScript" essential="true"><Default value="function(data,html_elem,context) {&#xa;  &#xa;}"/><FieldAspect t="field_dt.CodeMirrorFieldEditor" CompId="field.JavaScriptControl" ParamName="JavaScript" Type="js" Width="400px" Height="150px"/></Param><Param name="FieldAspect" type="field.FieldAspect[]" light="false" script="true"/></Component><Component id="SearchBox" type="field.Fields" execution="native" advanceddt="true"><Aspect t="component_aspect.Image" Image="images/search.gif"/><Param name="ID" light="false"/><Param name="Title"/><Param name="Items"/><Param name="ItemImage" script="true"/><Param name="ItemTitle" script="true"/><Param name="ItemExtraText" script="true"/><Param name="ItemLink" script="true"/><Param name="DoOnSelect" type="field.DoOnSearchSelect" script="true"/><Param name="SearchIn" type="enum"><Default value="title"/><value>title</value><value>title and extra text</value></Param><Param name="ShowPopupOnEmptySearch" type="data.Boolean" advanced="true"><Default value="true"/></Param><Param name="PromotedItems" advanced="true" description="shown in empty search"/><Param name="DefaultImage" advanced="true"/><Param name="PoweredByJBart" type="data.Boolean" advanced="true"><Default value="true"/></Param><Param name="HideResultsOnClick" type="data.Boolean" advanced="true"><Default value="true"/></Param><Param name="NoResults" type="ui.Control" script="true" advanced="true"><Default t="ui.Text" Style="padding: 4px 3px;display:block" Text="No Results for \%\%"/></Param><Param name="FieldAspect" type="field.FieldAspect[]" light="false" script="true"/><NativeHelper name="Field" t="field.Field1" ID="\%$ID\%" Title="\%$Title\%"><FieldData t="data.WritableText"/></NativeHelper><NativeHelper name="FieldAspects" t="field_aspect.FieldAspects"><FieldAspect t="object.SetBooleanProperty" Object="\%$_Field\%" Property="SearchBox" Value="true"/><FieldAspect t="field_aspect.DescriptionForEmptyText" Description="\%$Title\%"/><FieldAspect t="field_aspect.PopupPage"/><FieldAspect t="field_aspect.HideTitle"/><FieldAspect t="field_aspect.SimpleInput"/><FieldAspect t="xtml.UseParamArray" Param="FieldAspect"/><FieldAspect t="field_aspect.PopupImage" CssClass=""/></NativeHelper><NativeHelper name="ResultsContainer" t="ui.ShowPage" Class="search_results"><Page1 t="object.RunMethod" Object="\%$_Field\%" Method="PopupPage"/><Page value="\%$_Field/ResultsPage\%"/><PageParams t="ui.PageParams" ReadOnly="true"><DataItems t="data_items.Items"/><Aspect t="uiaspect.ItemClickable"><ClickAction t="object.RunMethod" Object="\%$_Input\%" Method="OnSelect"/></Aspect><Aspect t="uiaspect.HighlightSelectionOnHover"/><Aspect t="uiaspect.ItemSelection" AutoSelectFirstItem="true" IncludeSubContainers="false"/><Aspect t="uiaspect.HeaderFooter" Condition="\%$PoweredByJBart\%" Location="footer"><Control t="jbart.PoweredByJBartControl"/></Aspect></PageParams></NativeHelper><NativeHelper name="PreviewContainer" t="ui.ShowPage" Page="\%$_Field/ResultsPage\%"><PageParams t="ui.PageParams" ReadOnly="true"><DataItems t="data_items.Items" Items="\%$_Items\%"/><Aspect t="uiaspect.ClickableRows"><Action t="xtml.UseParam" Param="DoOnSelect"><Input t="xtml.UseParam" Param="ItemLink"/></Action></Aspect></PageParams></NativeHelper><NativeHelper name="ClosePopup1" t="dialog.ClosePopup"/><NativeHelper name="ClosePopup" t="dlg.CloseDialog"/><NativeHelper name="OpenPopup" t="dlg.OpenDialog"><Style t="dialog_style.DefaultPopup"/><Contents t="ui.List"><Control value="\%$_ResultsContainer\%"/></Contents><Feature t="dlg.NearLauncher" HidingLauncher="false"/><Feature t="dlg.PopupStyle"><Style t="dlg.LightPopup"/></Feature><Feature t="dlg.AutomaticFocus" FocusOn="no focus"/><Feature t="dlg.Size" MaxSize=",350px"/><Feature t="object.RunMethod" Object="\%$_Field\%" Method="PopupFeatures"/></NativeHelper></Component><Component id="Field1" type="field.Fields" execution="native"><Param name="ID" essential="true"/><Param name="Title" essential="true"/><Param name="FieldData" script="true"><Default value="\%\%"/></Param><Param name="Control" type="ui.Control" script="true"/><Param name="FieldAspect" type="field.FieldAspect[]" script="true" essential="true"/><Param name="Multiple" type="field_aspect.Multiple" script="true"/></Component><Component id="ShowFieldControl" type="ui.Control" execution="native"><Param name="Item" essential="true"><Default value="\%\%"/></Param><Param name="Field" type="field.Fields" essential="true"/><Param name="CellTag"><Default value="div"/></Param></Component></xtml><xtml ns="dlg"><Component id="Button" type="dlg.DialogButton"><Param name="Text"/><Param name="Image"/><Param name="OnClick" type="operation.OperationAction" script="true"/><Param name="ID"/><xtml t="object.Object" ID="\%$ID\%"><Method name="Control" t="ui.Button" Text="\%$Text\%" Image="\%$Image\%" Class="\%$ID\%Button"><OnClick t="xtml.UseParam" Param="OnClick"/><Style t="data.FirstSucceeding"><Item t="object.RunMethod" Object="\%$_Dialog\%" Method="ButtonStyle"/><Item t="ui.StandardButton"/></Style></Method></xtml></Component><Component id="ButtonsHorizontal" type="dlg.DialogFeature" execution="native" light="false"/><Component id="DialogShadow" type="dlg.DialogFeature" execution="native" light="false">&#xa;    </Component><Component id="DialogButton" type="dlg.DialogFeature" light="false"><Param name="Button" type="dlg.DialogButton[]"/><xtml t="object.AddToProperty" Object="\%$_Dialog\%" Property="Buttons" Value="\%$Button\%"/></Component><Component id="CancelButton" type="dlg.DialogButton" light="false"><Param name="Text"><Default value="Cancel"/></Param><xtml t="dlg.Button" Text="\%$Text\%" ID="Cancel"><OnClick t="object.RunMethod" Object="\%$_Dialog\%" Method="Cancel"/></xtml></Component><Component id="DisableBodyScroll" type="dlg.DialogFeature" execution="native"><Param name="Enabled" type="data.Boolean"><Default value="true"/></Param></Component><Component id="FullBlackShadow" type="dlg.PopupStyle" image="images/styles/FullBlackShadowPopup.png"><Param name="Css"><Default value="padding:15px; ​-moz-border-radius: 3px;&#xa; border-radius: 3px; &#xa; -moz-box-shadow: 0 0 5px 5px #888;-webkit-box-shadow: 0 0 5px 5px#888;&#xa;box-shadow: 0 0 5px 5px #888;&#xa; background:#EEEEFC; border:none; &#xa; margin-right:20px;​"/><FieldAspect t="field_dt.CodeMirrorFieldEditor" CompId="dlg.FullBlackShadow" ParamName="Css"/></Param><xtml value="\%$Css\%"/></Component><Component id="DialogClass" type="dlg.DialogFeature"><Param name="CssClass"/><xtml t="object.SetTextProperty" Object="\%$_Dialog\%" Property="DialogClass" Value="\%$CssClass\%"/></Component><Component id="DragDialog" type="dlg.DialogFeature" execution="native">&#xa;    </Component><Component id="OKButton" type="dlg.DialogButton" light="false"><Param name="Text"><Default value="OK"/></Param><xtml t="dlg.Button" Text="\%$Text\%" ID="OK"><OnClick t="object.RunMethod" Object="\%$_Dialog\%" Method="OK"/></xtml></Component><Component id="OpenDialog" type="action.Action" jbart="false" execution="native"><Param name="Title" essential="true"/><Param name="Contents" type="ui.Control" script="true" essential="true"/><Param name="Style" type="dialog_style.Style"><Default t="dialog_style.DefaultDialog"/></Param><Param name="RunOnOK" type="action.Action" script="true" essential="true"/><Param name="Feature" type="dlg.DialogFeature[]" script="true"/><Param name="DialogData" advanced="true"><Default value="\%\%"/></Param><Param name="NoCancel" type="data.Boolean"/><NativeHelper name="MoreFeatures" t="dlg.Features"><Feature t="dlg.NoCancel" OKLabel1="Close" Condition="\%$NoCancel\%"/></NativeHelper></Component><Component id="NearLauncher" type="dlg.DialogLocation" execution="native" gallery="Location"><Param name="Location" type="enum"><Default value="below or above launcher"/><value>below launcher</value><value>below or above launcher</value><value>below,above or aside of launcher</value></Param><Param name="HidingLauncher" type="data.Boolean"><Default value="false"/></Param></Component><Component id="CloseDialog" type="action.Action" execution="native"><Param name="CloseType" type="enum"><Default value="Cancel"/><value>OK</value><value>Cancel</value></Param></Component><Component id="OKOnEnter" type="dlg.DialogFeature" execution="native"><Param name="Enabled" type="data.Boolean"><Default value="true"/></Param></Component><Component id="CloseWhenClickingOutside" type="dlg.DialogFeature" execution="native"/><Component id="ScreenCover" type="dlg.DialogFeature" execution="native"><Param name="Color"><Default value="gray"/></Param><Param name="Opacity"><Default value="0.8"/></Param></Component><Component id="AutomaticFocus" type="dlg.DialogFeature" execution="native" gallery="AutomaticFocus"><Param name="FocusOn" type="enum"><Default value="first input"/><value>no focus</value><value>first input</value></Param></Component><Component id="NoCancel" type="dlg.DialogFeature" execution="native" light="false"><Param name="OKLabel"><Default value="Close"/></Param><NativeHelper name="OKButton" t="dlg.OKButton" Text="\%$OKLabel\%"><Condition t="yesno.NotEmpty" Value="\%$OKLabel\%"/></NativeHelper></Component><Component id="Features" type="dlg.DialogFeature" light="false"><Param name="Feature" type="dlg.DialogFeature[]"/><xtml t="xtml.UseParamArray" Param="Feature"/></Component><Component id="PopupStyle" type="dlg.DialogFeature"><Param name="Style" type="dlg.PopupStyle"><Default t="dlg.FullBlackShadow"/></Param><xtml t="object.SetTextProperty" Object="\%$_Dialog\%" Property="PopupStyle" Value="\%$Style\%"/></Component><Component id="Size" type="dlg.DialogFeature" execution="native"><Param name="Size" description="width,height"/><Param name="MaxSize" description="width,height"/></Component><Component id="LightPopup" type="dlg.PopupStyle"><Param name="Css"><Default value="border: 1px groove lightgrey; background:#F8F9FF; padding: 0;"/><FieldAspect t="field_dt.CodeMirrorFieldEditor" CompId="dlg.LightPopup" ParamName="Css"/></Param><xtml value="\%$Css\%"/></Component><Component id="InScreenCenter" type="dlg.DialogLocation" execution="native" gallery="Location"><Param name="AlwaysInScreenCenter" type="data.Boolean"/></Component><Component id="Location" type="dlg.DialogFeature" gallery="Location"><Param name="Location" script="true" type="dlg.DialogLocation"/><xtml t="xtml.UseParam" Param="Location"/></Component><Component id="CloseIcon" type="dlg.DialogFeature" execution="native"><Param name="Image"><Default value="images/close.png"/></Param><Param name="CssStyle"><Default value="top:5px;right:12px"/></Param></Component><Component id="Css" type="dlg.DialogFeature" execution="native"><Param name="Css"><Default value="#this {}"/><FieldAspect t="field_dt.CodeMirrorFieldEditor" CompId="dlg.Css" ParamName="Css"/></Param></Component></xtml><xtml ns="dialog_style"><Component id="CustomStyle" type="dialog_style.Style"><Param name="Html"><Field t="xtml_dt.HtmlParam" ParamName="Html"/></Param><Param name="Css"><FieldAspect t="field_dt.CodeMirrorFieldEditor" CompId="dialog_style.CustomStyle" ParamName="Css"/></Param><Param name="Javascript"><FieldAspect t="field_dt.CodeMirrorFieldEditor" CompId="dialog_style.CustomStyle" ParamName="Javascript"/></Param><Param name="Feature" type="dlg.DialogFeature[]" script="true"/><Param name="Mode" type="enum" Options="dialog,popup"><Default value="dialog"/></Param><Param name="DesignTime_Save"><Field t="bart_dt.DialogStyleSave" Type="dialog_style.Style" StylePT="dialog_style.CustomStyle"/></Param><ParamGenerator t="bart_dt.DialogStyleGenerator"/><xtml t="object.Object"><TextProperty name="Html" value="\%$Html\%"/><TextProperty name="Css" value="\%$Css\%"/><TextProperty name="Javascript" value="\%$Javascript\%"/><TextProperty name="Mode" value="\%$Mode\%"/><Method name="Features" t="xtml.UseParamArray" Param="Feature"/><Property name="FeatureXtml" t="xtml.XtmlOfParamArray" Param="Feature"/></xtml></Component><Component id="DefaultDialog" type="dialog_style.Style"><xtml t="dialog_style.CustomStyle" Html="&lt;table cellpadding=\'0\' cellspacing=\'0\' &gt;&lt;tbody class=\'aa_dlg_tbody\'&gt;&lt;tr&gt;&lt;td class=\'aa_dialog_title\'/&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td style=\'vertical-align:top\'&gt;&lt;div class=\'aa_dialogcontents\'/&gt;&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td class=\'aa_dialogbuttons\'/&gt;&lt;/tr&gt;&lt;/tbody&gt;&lt;/table&gt;" Css="#this { border:1px solid rgb(204,204,204);  background:rgb(166,198,255);  position:fixed; left:10px;  top:10px; }&#xa; #this .aa_dlg_tbody { background: white }&#xa; #this .aa_dialog_title {  color:rgb(33,43,56);  background: url(images/css/dialog_caption.png);  font-weight:bold;  height:42px;  cursor: move;  text-align: center;  vertical-align:top;  font-family: Arial;  margin-top: 8px; }&#xa; #this .aa_dialog_title_text { padding-top:8px }&#xa; #this .aa_dialogcontents { overflow: auto; padding:5px 20px; }" Javascript="" Mode="dialog"><Feature t="dlg.DragDialog"/><Feature t="dlg.InScreenCenter"/><Feature1 t="dlg.DialogClass" CssClass="std"/><Feature t="dlg.DialogShadow"/><Feature t="dlg.CloseIcon"/><Feature t="dlg.ScreenCover"/><Feature t="dlg.ButtonsHorizontal"/><Feature t="dlg.OKOnEnter"/><Feature t="dlg.DialogButton"><Button t="dlg.OKButton"/><Button t="dlg.CancelButton"/></Feature><Feature t="dlg.AutomaticFocus" FocusOn="first input"/><Feature1 t="dlg.DisableBodyScroll"/></xtml></Component><Component id="DefaultPopup" type="dialog_style.Style"><xtml t="dialog_style.CustomStyle" Html="&lt;div class=\'aa_popup aa_dialogcontents\' /&gt;" Css="#this { padding:15px; ​-moz-border-radius: 3px;&#xa; border-radius: 3px; &#xa; -moz-box-shadow: 0 0 5px 5px #888;-webkit-box-shadow: 0 0 5px 5px#888;&#xa;box-shadow: 0 0 5px 5px #888;&#xa; background:#EEEEFC; border:none; &#xa; margin-right:20px;​ overflow-y: auto; overflow-x: hidden; }" Javascript="" Mode="popup"><Feature t="dlg.NearLauncher"/><Feature t="dlg.CloseWhenClickingOutside"/><Feature t="dlg.OKOnEnter"/></xtml></Component></xtml><xtml ns="dialog"><Component id="Dialog" type="dialog.Dialog" execution="xtml"><Param name="Title" essential="true"/><Param name="DialogData" script="true"><Default value="\%\%"/></Param><Param name="Content" essential="true" type="ui.Control" script="true"/><Param name="AutoFocus" script="true"/><Param name="RunOnOK" essential="true" type="action.Action" script="true"/><Param name="RunOnClose" type="action.Action" script="true"/><Param name="RunOnDelete" type="action.Action" script="true"/><Param name="CloseOnEnter" type="data.Boolean"><Default value="true"/></Param><Param name="CloseOnEsc" type="data.Boolean"><Default value="true"/></Param><Param name="Style" type="dialog.DialogStyle" script="true" paramVars="DialogContext"><Default t="dialog.JQueryDialog"/></Param><Param name="Buttons" type="enum"><Default value="OK,Cancel"/><value>OK,Cancel</value><value>Close</value><value>OK,Cancel,Delete</value><value>OK,Cancel,Apply</value><value>None</value></Param><Param name="Height"/><Param name="Width"/><Param name="OKLabel"><Default value="OK"/></Param><Param name="CancelLabel"><Default value="Cancel"/></Param><Param name="Direction" type="ui.Direction"><Default value="Left to Right"/></Param><Param name="FullScreen" type="data.Boolean"/><Param name="LimitHeightToScreenSize" type="data.Boolean"><Default value="true"/></Param><Param name="NoTransaction" type="data.Boolean"><Default value="true"/></Param><Param name="AlwaysLTR" type="data.Boolean"/><Param name="RunOnCancel" type="action.Action" script="true"/><Param name="Validations" type="ui.Validation" script="true"/><Param name="BeforeClose" type="action.Action" script="true"/><Param name="DialogButton" type="dialog.DialogButton[]"/><Param name="ScreenOpacity" description="greyness of the cover behind the dialog"><Default value="0.8"/></Param><xtml t="xtml.UseParam" Param="Style"><Var name="DialogOriginalData"/><Var name="DialogTransactionData" t="xtml.UseParam" Param="DialogData"/><Var name="DialogWorkingData" t="data.IfThenElse" If="\%$NoTransaction\%"><Then value="\%$DialogTransactionData\%"/><Else t="data.Duplicate" Data="\%$DialogTransactionData\%"/></Var><Var name="OriginalControlElement" value="\%$ControlElement\%"/><Var name="DialogContext" t="xtml.Params"><Param name="Height" value="\%$Height\%"/><Param name="Width" value="\%$Width\%"/><Param name="Title" t="text.MultiLang" Pattern="\%$Title\%" Dynamic="true"/><Param name="Buttons" value="\%$Buttons\%"/><Param name="OpenDialog" value="\%$OpenDialog\%"/><Param name="OKLabel" t="text.MultiLang" Dyanmic="true" Pattern="\%$OKLabel\%"/><Param name="CancelLabel" t="text.MultiLang" Dyanmic="true" Pattern="\%$CancelLabel\%"/><Param name="CloseOnEnter" value="\%$CloseOnEnter\%"/><Param name="CloseOnEsc" value="\%$CloseOnEsc\%"/><Param name="Direction" value="\%$Direction\%"/><Param name="FullScreen" value="\%$FullScreen\%"/><Param name="AlwaysLTR" value="\%$AlwaysLTR\%"/><Param name="Content" t="xtml.UseParam" Param="Content" Input="\%$DialogWorkingData\%"><Var name="AAControlMode" value="readwrite"/><Var name="_InDialog" value="true"/></Param><Param name="ScreenOpacity" value="\%$ScreenOpacity\%"/><Param name="LimitHeightToScreenSize" value="\%$LimitHeightToScreenSize\%"/><Param name="DialogButtons" value="\%$DialogButton\%"/><ScriptParam name="OnOK" t="action.RunActions"><Var name="ControlElement" value="\%$OriginalControlElement\%"/><Action t="action.WriteValue" To="\%$DialogTransactionData\%" Value="\%$DialogWorkingData\%"><Condition t="yesno.Not" Of="\%$NoTransaction\%"/></Action><Action t="xtml.UseParam" Param="RunOnOK" Data="\%$DialogWorkingData\%"><Var name="OriginalInput" value="\%$DialogOriginalData\%"/><Var name="_DialogContent" value="\%$DialogContext/Content\%"/><Var1 name="DialogContext" t="data.Empty"/></Action><Action t="xtml.UseParam" Param="RunOnClose" Data="\%$DialogOriginalData\%"/></ScriptParam><ScriptParam name="OnCancel" t="action.RunActions"><Var name="ControlElement" value="\%$OriginalControlElement\%"/><Action t="xtml.UseParam" Param="RunOnClose" Data="\%$DialogOriginalData\%"/><Action t="xtml.UseParam" Param="RunOnCancel" Data="\%$DialogOriginalData\%"/></ScriptParam><ScriptParam name="OnDelete" t="xtml.UseParam" Param="RunOnDelete" Input="\%$DialogOriginalData\%"><Var name="ControlElement" value="\%$OriginalControlElement\%"/></ScriptParam><ScriptParam name="AutoFocus" t="xtml.UseParam" Param="AutoFocus"/><ScriptParam name="Validations" t="xtml.UseParam" Param="Validations" Input="\%$DialogWorkingData\%"/><ScriptParam name="BeforeClose" t="xtml.UseParam" Param="BeforeClose" Input="\%$DialogWorkingData\%"/><ScriptParam name="DisableClose" t="yesno.Not"><Of t="validation.PassingValidations"/></ScriptParam></Var></xtml></Component><Component id="OpenDialog" type="action.Action" execution="xtml"><Param name="Dialog" type="dialog.Dialog" script="true" essential="true"><Default t="dialog.Dialog"/></Param><xtml t="xtml.UseParam" Param="Dialog"><Var name="OpenDialog" value="true"/></xtml></Component><Component id="IsRuntimeDialog" type="data.Boolean" hidden="true" execution="native"/><Component id="DialogButtonStyle" type="ui.ButtonStyle" light="false"><xtml t="data.FirstSucceeding"><Item t="object.RunMethod" Object="\%$_GeneralStyling\%" Method="DialogButtonStyle"><Condition t="dialog.IsRuntimeDialog"/></Item><Item t="ui.StandardButton"/></xtml></Component><Component id="FixTopDialogPosition" type="action.Action" execution="native"/><Component id="TopDialogContent" type="data.Data" execution="native"><Param name="Part" type="enum"><Default value="Content"/><value>Content</value><value>Title</value><value>Data</value><value>All</value></Param></Component><Component id="CloseDialog" type="action.Action" execution="native"><Param name="CloseType" type="enum"><Default value="Cancel"/><value>OK</value><value>Cancel</value><value>Delete</value></Param><Param name="IgnoreAAEditor" type="data.Boolean"><Default value="true"/></Param></Component><Component id="PopUpDialog" type="action.Action" execution="native" hidden="true"><Param name="Dialog"/><Param name="ScreenColor"/><Param name="ScreenOpacity"/><Param name="RunAfterPopup" type="action.Action" script="true"/><Param name="AlwaysLTR" type="data.Boolean"><Default value="\%$DialogContext/AlwaysLTR\%"/></Param></Component><Component id="JQueryDialog" type="dialog.DialogStyle" execution="xtml" databind="true"><xtml t="ui.ControlWithAction"><Control value="\%$Dialog\%"/><RunBeforeControl Condition="\%$DialogContext/OpenDialog\%" t="dialog.PopUpDialog" Dialog="\%$Dialog\%" ScreenColor="gray" ScreenOpacity="\%$DialogContext/ScreenOpacity\%"><RunAfterPopup t="uiaction.Focus"><RunOn t="data.FirstSucceeding"><Item t="xtml.RunXtml" Xtml="\%$DialogContext/AutoFocus\%"/><Item t="uiaction.FindFirstInput"/></RunOn></RunAfterPopup></RunBeforeControl><Var name="Dialog" t="xml.WithChanges"><Xml t="ui.Html" DynamicContent="true"><table class="dialog_box ajaxart dialog_content_table" style="border: none" cellspacing="0" cellpadding="0"><tr class="dialog_right_shadow_tr"><th class="dialog_shadow_extra_th"/><th rowspan="6" class="dialog_right_shadow_th"><div class="dialog_right_shadow"/></th></tr><tr><td class="dialog_title"><div class="dialog_title_close"/><div class="dialog_title_text">Title</div></td></tr><tr class="dialog_body"><td><div class="dialog_inner_body"><div class="dialog_content"/><div class="message_bar_placeholder"/></div></td></tr><tr><td class="dialog_footer"><table cellspacing="0" cellpading="0"><tr class="aa_dialog_buttons_top"><td><span class="okbutton_placeholder"/></td><td><span class="buttons_seperator"/></td><td><span class="cancelbutton_placeholder"/></td><td><span class="buttons_seperator"/></td><td><span class="delbutton_placeholder"/></td><td><span class="applybutton_placeholder"/></td></tr></table></td></tr><tr class="dialog_bottom_shadow"><td><span class="dialog_bottom_outer"><span class="dialog_bottom_inner"/></span></td></tr></table></Xml><Var name="OKButton" t="ui.OKButton" Text="\%$DialogContext/OKLabel\%" Name="dialog_ok_button" Class="dialog_button ok_button"><Style t="dialog.DialogButtonStyle"/><ExtraValidations t="xtml.RunXtml" Xtml="\%$DialogContext/Validations\%"/><OnClick t="action_async.RunAsync"><Condition t="yesno.Not"><Of t="object.RunMethod" Object="\%$DialogContext\%" Method="DisableClose"/><RunOn t="dialog.TopDialogContent"/></Condition><Action t="xtml.RunXtml" Xtml="\%$DialogContext/BeforeClose\%"><RunOn1 t="dialog.TopDialogContent"/></Action><OnSuccess t="dialog.CloseDialog" CloseType="OK" IgnoreAAEditor="false"/></OnClick></Var><Change t="xml.AddChildren" CloneChildren="false"><Data t="ui.ElementOfClass" Cls="message_bar_placeholder"/><Children t="ui.MessageBar" Type="validation"/></Change><Change t="xml.AddChildren"><Data t="ui.ElementOfClass" Cls="aa_dialog_buttons_top"/><Children t="data.Pipeline"><Item value="\%$DialogContext/DialogButtons\%"/><Item t="xml.WithChanges"><Xml t="ui.Html"><td/></Xml><Change t="xml.AddChildren"><Children t="object.RunMethod" Method="Control"/></Change></Item></Children></Change><Change t="xml.AddChildren" CloneChildren="false" Children="\%$OKButton\%"><Condition t="yesno.Contains" Data="\%$DialogContext/Buttons\%"><Text value="OK"/></Condition><Data t="ui.ElementOfClass" Cls="okbutton_placeholder"/></Change><Change t="xml.AddChildren" CloneChildren="false"><Condition t="yesno.Contains" Data="\%$DialogContext/Buttons\%"><Text value="Cancel"/></Condition><Data t="ui.ElementOfClass" Cls="cancelbutton_placeholder"/><Children t="ui.Button" Text="\%$DialogContext/CancelLabel\%" Class="CloseButton dialog_button "><OnClick t="dialog.CloseDialog" CloseType="Cancel" IgnoreAAEditor="false"/><Style t="dialog.DialogButtonStyle"/></Children></Change><Change t="xml.AddChildren" CloneChildren="false"><Condition t="yesno.Contains" Data="\%$DialogContext/Buttons\%"><Text value="Close"/></Condition><Data t="ui.ElementOfClass" Cls="cancelbutton_placeholder"/><Children t="ui.Button" Text="Close" Class="dialog_button CloseButton"><Style t="dialog.DialogButtonStyle"/><OnClick t="action.RunActions"><Condition t="yesno.Not"><Of t="object.RunMethod" Object="\%$DialogContext\%" Method="DisableClose"/><RunOn t="dialog.TopDialogContent"/></Condition><Action t="xtml.RunXtml" Xtml="\%$DialogContext/BeforeClose\%"><RunOn t="dialog.TopDialogContent"/></Action><Action t="dialog.CloseDialog" CloseType="OK" IgnoreAAEditor="false"/></OnClick></Children></Change><Change t="xml.AddChildren" CloneChildren="false"><Condition t="yesno.Contains" AllText="\%$DialogContext/Buttons\%"><Text value="Delete"/></Condition><Data t="ui.ElementOfClass" Cls="delbutton_placeholder"/><Children t="ui.Button" Text="Delete" Class="dialog_button"><Style t="dialog.DialogButtonStyle"/><OnClick t="action.RunActions"><Action t="dialog.CloseDialog" CloseType="Delete" IgnoreAAEditor="false"/></OnClick></Children></Change><Change t="xml.AddChildren" CloneChildren="false"><Condition t="yesno.Contains" AllText="\%$DialogContext/Buttons\%"><Text value="Apply"/></Condition><Data t="ui.ElementOfClass" Cls="applybutton_placeholder"/><Children t="ui.Button" Text="Apply" Class="dialog_button"><Style t="dialog.DialogButtonStyle"/><OnClick t="action.RunActions"><Action t="xtml.RunXtml" Xtml="\%$DialogContext/OnOK\%"/></OnClick></Children></Change><Change t="ui.SetCssProperty" Property="height"><Data t="ui.ElementOfClass" Cls="dialog_box"/><Value t="data.IfThenElse" If="\%$DialogContext/FullScreen\%" Else="\%$DialogContext/Height\%" Then="95\%"/></Change><Change t="ui.SetCssProperty" Property="width"><Data t="ui.ElementOfClass" Cls="dialog_box"/><Value t="data.IfThenElse" If="\%$DialogContext/FullScreen\%" Else="\%$DialogContext/Width\%" Then="95\%"/></Change><Change t="ui.SetCssProperty" Property="max-height" Condition="\%$DialogContext/LimitHeightToScreenSize\%"><Data t="ui.ElementOfClass" Cls="dialog_inner_body"/><Value t="ui.ScreenSize" Axis="height" Margin="120" AsHtmlString="true"/></Change><Change t="ui.SetCssProperty" Property="max-width"><Data t="ui.ElementOfClass" Cls="dialog_inner_body"/><Value t="ui.ScreenSize" Axis="width" Margin="50" AsHtmlString="true"/></Change><Change t="xml.UpdateInnerText" NewValue="\%$DialogContext/Title\%"><Data t="ui.ElementOfClass" Cls="dialog_title_text"/></Change><Change t="xml.AddChildren" CloneChildren="false" Children="\%$DialogContext/Content\%"><Data t="ui.ElementOfClass" Cls="dialog_content"/></Change><Change t="uiaction.AddClass" RunOn="\%\%" Cls="right2left"><Condition t="yesno.EqualsTo" Data="\%$DialogContext/Direction\%" To="Right to Left"/></Change><Change t="ui.OnKeyDown" RunOn="\%\%"><Condition t="yesno.EqualsTo" Data="\%$DialogContext/CloseOnEnter\%" To="true"/><Action t="uiaction.ButtonClick"><RunOn value="\%$OKButton\%"/><Condition t="yesno.And"><Item t="yesno.EqualsTo" Data="\%$KeyPressed\%" To="enter"/><Item t="yesno.Not" Of="\%$EventTargetIsTextArea\%"/></Condition></Action></Change><Change t="xml.AddChildren" CloneChildren="false"><Data t="ui.ElementOfClass" Cls="dialog_title_close"/><Children t="ui.Button" Image="images/close.png" Class="dialog_close_image"><OnClick t="dialog.CloseDialog" CloseType="Cancel" IgnoreAAEditor="false"/><Style t="ui.ButtonAsHyperlink"/></Children></Change><Change1 t="ui.ExecJQuery" Expression=".keydown(function(event){         if(event.keyCode == 13) {          var ok_button = jQuery(this).find(\'#dialog_ok_button\');          if (ok_button.length &gt; 0)           ajaxart_runevent(ok_button[0],\'ButtonContext\',\'OnClick\')         }        });"><Condition t="yesno.EqualsTo" Data="\%$DialogContext/CloseOnEnter\%" To="true"/></Change1><Change t="ui.ExecJQuery" Expression=".keydown(function(event){         if(event.keyCode == 27) {          ajaxart_runevent(this,\'DialogContext\',\'OnCancel\');          ajaxart.dialog.closeDialog(this);         }        });"><Condition t="yesno.EqualsTo" Data="\%$DialogContext/CloseOnEsc\%" To="true"/></Change></Var></xtml></Component><Component id="ClosePopup" type="action.Action" execution="native"><Param name="AllPopups" type="data.Boolean"/></Component></xtml><xtml ns="date"><Component id="HideTime" type="field.FieldAspect"><xtml t="field_aspect.TextSummary"><Text t="text.Split" Separator=" " Part="First"/></xtml></Component></xtml><xtml ns="data_items"><Component id="Items" type="data_items.Items" execution="native"><Param name="Items" essential="true"/><Param name="ItemTypeName"/><Param name="Aspect" type="data_items.Aspect[]" script="true"/></Component></xtml><xtml ns="data"><Component id="Pipeline" type="data.Data" execution="native" dtsupport="false"><Param name="Item" type="data.Data[]" essential="true"/><Param name="Aggregator" type="data.Aggregator[]"/></Component><Component id="FirstSucceeding" type="data.Data" execution="native" dtsupport="false"><Param name="Item" type="data.Data[]" essential="true"/></Component><Component id="JavaScript" type="data.Data,action.Action" execution="native"><Param name="Code" essential="true"><Default value="function(data,html_elem,context) {&#xa;  &#xa;}"/><FieldAspect t="field_aspect.FieldData"><FieldData t="xml.XPath" XPath="@Code" CreateIfDoesNotExist="true"><DefaultValue t="data.Pipeline"><Item t="xtml.ComponentDefinition" ID="data.JavaScript"/><Item value="\%Param[@name=\'Code\']/Default/@value\%"/></DefaultValue></FieldData></FieldAspect><FieldAspect t="field_aspect.Control"><Control t="xmlui.CodeMirrorTextarea" Type="js" UpdateOnClick="true" Width="400px" Height="300px"/></FieldAspect></Param></Component><Component id="ListByCommas" type="data.Data"><Param name="List" essential="true"/><xtml t="text.Split" Separator="," Data="\%$List\%"/></Component><Component id="AddToCommaSeparated" type="data.Data"><Param name="Separator"><Default value=","/></Param><Param name="List"><Default value="\%\%"/></Param><Param name="ToAdd"/><xtml t="data.IfThenElse" Then="\%$ToAdd\%" Else="\%$List\%\%$Separator\%\%$ToAdd\%"><If t="yesno.IsEmpty" Data="\%$List\%"/></xtml></Component><Component id="Lookup" type="data.Data" execution="native"><Param name="LookupName" essential="true"/><Param name="LookFor"><Default value="\%\%"/></Param><Param name="AllItems"/><Param name="ItemCode"/><Param name="ItemValue"><Default value="\%\%"/></Param><Param name="Version"><Default value="0"/></Param></Component><Component id="ItemsByIDs" type="data.Data" execution="native" dtsupport="false"><Param name="List"/><Param name="IDs"/></Component><Component id="ItemByID" type="data.Data" execution="native" dtsupport="false"><Param name="List"/><Param name="ID"/></Component><Component id="AddSeparator" type="data.Aggregator" execution="native"><Param name="Separator"/><Param name="AddBefore"/><Param name="AddAfter"/></Component><Component id="Url" type="data.Data" execution="native"/><Component id="Empty" type="data.Data" execution="xtml"><xtml t="data.List"/></Component><Component id="JustInTimeCalculation" type="data.Data" execution="native"><Description>use method &apos;GetContent&apos; to fetch results</Description><Param name="Content" script="true" essential="true"/></Component><Component id="WritableText" type="data.Data"><Param name="DefaultValue"/><xtml t="data.Pipeline"><Item t="xml.WithChanges"><Xml t="xml.Xml"><xml value=""/></Xml><Change t="xml.SetAttribute" AttributeName="value" Value="\%$DefaultValue\%"/></Item><Item value="\%@value\%"/></xtml></Component><Component id="IfThenElse" type="data.Data" execution="native" dtsupport="false"><Param name="If" type="data.Boolean" script="true" essential="true"/><Param name="Then" essential="true"/><Param name="Else" essential="true"/></Component><Component id="Duplicate" type="data.Data" execution="native"/><Component id="Same" type="data.Data" execution="native" dtsupport="false"/><Component id="List" type="data.Data" execution="native" synonyms="Unite" dtsupport="false"><Param name="Item" type="data.Data[]" essential="true"/></Component></xtml><xtml ns="bart_url"><Component id="BrowserUrl" type="bart_url.UrlProvider"><Param name="OnUpdate" type="action.Action" script="true"/><xtml t="xtml.Params"><ScriptParam name="GetValue" paramVars="Attribute" t="ui.UrlFragment" Attribute="\%$Attribute\%"/><ScriptParam name="Clean" t="uiaction.SetUrlFragment" Fragment=""/><ScriptParam name="Update" paramVars="ValuePairs" t="action.RunActions"><Action t="uiaction.SetUrlFragment"><Fragment t="bart_url.NewUrlFragment" Proposed="\%$ValuePairs\%"><Current t="ui.UrlFragment"/></Fragment></Action><Action t="xtml.UseParam" Param="OnUpdate"/></ScriptParam></xtml></Component><Component id="NewUrlFragment" type="data.Data" execution="native"><Param name="Current"/><Param name="Proposed"/></Component></xtml><xtml ns="bart_resource"><Component id="Xml" type="bart_resource.Resources" execution="native"><Param name="ResourceID"/><Param name="Mode" type="enum" Options="plural,single"><Default value="plural"/></Param><Param name="Xml"><Field t="bart_dt.XmlResource" Param="Xml"/></Param><Param name="Storage" type="enum" Options="in memory,cookie,local storage"><Default value="in memory"/></Param></Component><Component id="ResourceByID" type="data_items.Items" dtsupport="false"><Param name="ResourceID" type="dynamic_enum" Options="\%$_BartContext/Resources/ID\%" essential="true"/><xtml t="data.ItemByID" List="\%$_BartContext/Resources\%" ID="\%$ResourceID\%"/></Component><Component id="ResourcesToGlobalVars" type="action.Action" execution="native"/></xtml><xtml ns="bart_field"><Component id="UseSinglePage" type="ui.SinglePage,ui.Page" dtsupport="false"><Param name="Page" type="dynamic_enum" options_pt="bart_dt.BartPages"/><xtml t="bart.PageByID" PageID="\%$Page\%"/></Component></xtml><xtml ns="bart"><Component id="MultiplePage" type="bart.Pages"><Param name="ID" essential="true"/><Param name="ContentType" type="dynamic_enum" Options="\%$_BartContext/ContentTypes/ID\%"/><Param name="Field" type="field.Fields[]" light="false" script="true" paramVars="_ReferenceFields"/><Param name="Presentation" type="uiaspect.ItemListPresentation" script="true"><Default t="uiaspect.RichTable"/></Param><Param name="DefaultResource" type="bart.DataItemsProvider" script="true" description="The data associated with the page"><Convert t="bart_dt.ConvertDefaultResource"/></Param><Param name="Aspect" type="uiaspect.Aspect[]" script="true" light="false"/><Param name="Operations" type="operation.Operations" script="true" light="false"><FieldAspect t="field_aspect.Hide" ReadOnly="false" Edit="false"/></Param><Param name="ResourceID" type="dynamic_enum" light="false" Options="\%$_BartContext/Resources/ID\%"/><Param name="PreviewData" type="data_items.Items" script="true" light="false"/><xtml t="object.OverrideObject"><Object t="bart.Page" ID="\%$ID\%" ResourceIDs="\%$DefaultResource\%"><Control t="ui.ItemList" DataHolderCntr="true"><Items t="data.FirstSucceeding"><Item value="\%$_PageParams/DataItems\%"/><Item t="data.Pipeline"><Item t="xtml.UseParam" Param="DefaultResource"/><Item t="yesno.PassesFilter"><Filter t="object.IsObject"/></Item></Item><Item1 t="xtml.UseParam" Param="PreviewData"><Condition t="yesno.NotEmpty" Data="\%$XtmlDtContext\%"/></Item1><Item t="bart_resource.ResourceByID" ResourceID="\%$DefaultResource\%"/><Item t="bart_resource.ResourceByID" ResourceID="\%$ResourceID\%"/><Item t="data_items.Items"/></Items><ID t="text.FirstSucceeding"><Item value="\%$_PageParams/PageID\%"/><Item value="\%$ID\%"/></ID><Operations t="xtml.UseParam" Param="Operations"/><Fields t="xtml.UseParamArray" Param="Field"/><Presentation t="xtml.UseParam" Param="Presentation"/><Aspect t="uiaspect.Aspects"><Aspect t="uiaspect.Permissions" WritableIf="false" Condition="\%$_PageParams/ReadOnly\%"/><Aspect t="xtml.UseParamArray" Param="Aspect"/><Aspect t="object.RunMethod" Object="\%$_PageParams\%" Method="Aspect"/></Aspect></Control></Object><Property name="ContentType" value="\%$ContentType\%"/><Property name="ResourceID" t="data.Pipeline"><Item t="xtml.UseParam" Param="DefaultResource"/><Item value="\%ID\%"/></Property><Property name="Fields" t="xtml.UseParamArray" Param="Field"/><Property1 name="_Operations" t="xtml.UseParam" Param="Operations"/><Property name="Type" value="multiple"/><Property name="IsMultiple" value="true"/><Method name="Items" t="xtml.UseParam" Param="DefaultResource"/></xtml></Component><Component id="Resource" type="bart.DataItemsProvider"><Param name="Name" type="dynamic_enum" options_pt="bart_dt.BartResources"/><xtml t="bart_resource.ResourceByID" ResourceID="\%$Name\%"/></Component><Component id="Page" type="bart.Pages" execution="native" light="false"><Param name="ID"/><Param name="ResourceIDs"/><Param name="ResourceID"/><Param name="Control" type="ui.Control" script="true"/><Param name="Type"/><NativeHelper name="OverrideUiPrefs" t="uipref.OverrideUIPrefs" UIPrefs="\%$_PageParams/UiPrefs\%" Prefix="\%$ID\%"/></Component><Component id="PageByID" type="data.Data" execution="native" dtsupport="false"><Param name="PageID"/></Component><Component id="SinglePage" type="bart.Pages"><Param name="ID" essential="true"><FieldAspect t="field_aspect.Mandatory"/></Param><Param name="ContentType" type="dynamic_enum" Options="\%$_BartContext/ContentTypes/ID\%"/><Param name="Presentation" type="uiaspect.DocumentPresentation" script="true"><Default t="uiaspect.PropertySheet"/><FieldAspect t="field_aspect.Hide" ReadOnly="false" Edit="false"/></Param><Param name="DefaultResource" type="bart.DataItemsProvider" script="true" description="The data associated with the page"><Convert t="bart_dt.ConvertDefaultResource"/></Param><Param name="Field" type="field.Fields[]" light="false" script="true" paramVars="_ReferenceFields"/><Param name="Aspect" type="uiaspect.Aspect[]" script="true" light="false"/><Param name="Operations" type="operation.Operations" script="true" light="false"><FieldAspect t="field_aspect.Hide" ReadOnly="false" Edit="false"/></Param><Param name="Resource" type="dynamic_enum" Options="\%$_BartContext/Resources/ID\%" light="false" deprecated="true"/><xtml t="object.OverrideObject"><Object t="bart.Page" ID="\%$ID\%" Type="single" ResourceIDs="CurrentNodeID,CurrentNode"><Control t="ui.Document" ID="\%$ID\%"><Item t="data.FirstSucceeding"><Item value="\%$_PageParams/DataItems\%"/><Item t="data.Pipeline"><Item t="xtml.UseParam" Param="DefaultResource"/><Item t="yesno.PassesFilter"><Filter t="object.IsObject"/></Item></Item><Item t="bart_resource.ResourceByID" ResourceID="\%$DefaultResource\%"/><Item t="bart_resource.ResourceByID" ResourceID="\%$Resource\%"/></Item><Presentation t="xtml.UseParam" Param="Presentation"/><Operations t="xtml.UseParam" Param="Operations"/><Fields1 value="\%$_This/Fields\%"/><Fields t="xtml.UseParamArray" Param="Field"/><Aspect t="uiaspect.Permissions" WritableIf="false" Condition="\%$_PageParams/ReadOnly\%"/><Aspect t="xtml.UseParamArray" Param="Aspect"/></Control></Object><Property name="ContentType" value="\%$ContentType\%"/><Property name="Fields" t="xtml.UseParamArray" Param="Field"><Var name="InSinglePageOverrideObject" value="true"/></Property><Property1 name="_Operations" t="xtml.UseParam" Param="Operations"/><Property name="Type" value="single"/><Property name="Resource" value="Resource"/><Method name="Items" t="data.Pipeline"><Item t="xtml.UseParam" Param="DefaultResource"/><Item t="yesno.PassesFilter"><Filter t="object.IsObject"/></Item></Method><Property name="ResourceID" t="data.Pipeline"><Item t="xtml.UseParam" Param="DefaultResource"/><Item value="\%ID\%"/></Property></xtml></Component></xtml><xtml ns="action_async"><Component id="RunAsync" type="action.Action" execution="native"><Param name="Action" type="action_async.Action" script="true" essential="true"/><Param name="OnSuccess" type="action.Action" script="true"/><Param name="OnFailure" type="action.Action" script="true"/></Component></xtml><xtml ns="action"><Component id="Switch" type="action.Action" execution="native"><Param name="Value"><Default t="data.Same"/></Param><Param name="Case" type="inline[]" essential="true"><Param name="If" essential="true"/><Param name="IfCondition" type="data.Boolean" script="true" essential="true"/><Param name="Then" type="action.Action" script="true" essential="true"/></Param><Param name="Default" type="action.Action"/></Component><Component id="RunActions" type="action.Action" execution="native"><Param name="Action" type="action.Action[]" essential="true"/></Component><Component id="WriteValue" type="action.Action" execution="native"><Param name="To" essential="true"><Default value="\%\%"/></Param><Param name="Value" essential="true"/></Component><Component id="IfThenElse" type="action.Action" execution="native"><Param name="If" type="data.Boolean" essential="true" script="true"/><Param name="Then" type="action.Action" script="true" essential="true"/><Param name="Else" type="action.Action" script="true" essential="true"/></Component><Component id="RunActionOnItems" type="action.Action" synonyms="RunOnMultipleData" execution="native"><Param name="Items" essential="true"/><Param name="Action" type="action.Action" script="true" essential="true"/><Param name="IndicateLastItem" type="data.Boolean" description="available in _IsLastItem variable"/><Param name="IndicateItemIndex" type="data.Boolean" description="available in _ItemIndex variable"/><xtml t="data.Pipeline"><Item value="\%$Items\%"/><Item t="xtml.UseParam" Param="Action"/></xtml></Component></xtml><xtml ns="jbart_api"><Component id="ShowWidget" type="ui.Control"><Param name="WidgetXml"/><Param name="Page"/><xtml t="ui.ControlWithAction"><Var name="_GlobalVars" t="object.Object"/><Var name="_UIPref" t="uipref.InCookies"/><Var name="WidgetId" value="\%$WidgetXml/@id\%"/><Var name="Language" value="\%$WidgetXml/bart_dev/db/bart_unit/bart_unit/Component/xtml/Language/@Language\%"/><Var name="App" value="\%$WidgetXml/bart_dev/db/bart_unit/bart_unit/Component[@id=\'App\']/xtml\%"/><Var name="PageID" t="text.FirstSucceeding"><Item value="\%$Page\%"/><Item value="\%$App/@MainPage\%"/><Item value="main"/></Var><Var name="_BartContext" t="object.Object"><Property name="Resources" t="data.Pipeline"><Item value="\%$App/Resources/Resource\%"/><Item t="data.IfThenElse"><If t="yesno.OR"><Item value="\%@t\%==\'bart_resource.DataInCookie\'"/><Item value="\%@t\%==\'bart_resource.Xml\'"/></If><Then t="xtml.RunXtml" Xtml="\%\%"/><Else t="object.Object" ID="\%@ResourceID\%" ContentType="\%@ContentType\%"><Var name="Resource"/><Var name="ContentType" value="\%@ContentType\%"/><Var name="ResourceID" value="\%@ResourceID\%"/><Var name="CT" value="\%$WidgetXml/bart_dev/db/{$ContentType}\%"/><Property name="Items" t="data.FirstSucceeding"><Item t="data.JavaScript" Code="function(data,html_elem,context) { var name = \'jBartWidget_\' + ajaxart.totext(context.vars.WidgetId) + \'_\' + ajaxart.totext(context.vars.ResourceID); return window[name]; }"/><Item value="\%$CT/{$ContentType}\%" Condition="\%@t\%==\'bart_resource.Query\'"/><Item value="\%$CT/*[@id=\'{@ID}\']\%" Condition="\%@t\%==\'bart_resource.Node\'"/></Property></Else></Item></Property><SingleProperty name="Url" t="bart_url.BrowserUrl"/></Var><Control t="object.RunMethod" Method="Control"><Object t="xtml.RunXtml" Xtml="\%$App/Pages/Page[@ID=\'{$PageID}\']\%"/></Control><RunBeforeControl t="action.RunActions"><Action t="bart_resource.ResourcesToGlobalVars"/><Action t="object.SetProperty" Object="\%$_BartContext\%" Property="Pages"><Value t="data.Pipeline"><Item value="\%$App/Pages/Page\%"/><Item t="xtml.RunXtml" Xtml="\%\%"/></Value></Action><Action t="action.RunActionOnItems" Items="\%$App/ApplicationFeature\%"><Action t="xtml.RunXtml" Xtml="\%\%"/></Action><Action t="action.RunActionOnItems" Items="\%$WidgetXml/bart_dev/db/bart_unit/bart_unit/UIPref/*\%"><Action t="uipref.OverrideUIPrefs" UIPrefs="\%\%"><Prefix t="xml.Tag"/></Action></Action></RunBeforeControl></xtml></Component></xtml><xtml ns="text"><Type id="HebrewText" HebChars="אבגדהוזחטיכלמנסעפצקרשתןףךץ"/></xtml></xtml>'));var aa_xtml_total=104998;