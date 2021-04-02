var _lpDebugMode = false;
var _lpDropboxBase = _lpDebugMode ? '//dl.dropbox.com/u/24056024/lpdemo_debug' : '//jbartapps.appspot.com/lp';

liveperson.collaboration = liveperson.collaboration || {};
liveperson.collaboration.locations = liveperson.collaboration.locations || {};
liveperson.collaboration.locations.media = liveperson.collaboration.locations.media || 'media';

liveperson.utils.addLanguage("en",{
	"jbartform_in_chat_line": "Click here to open form",
	"product_inchat_template": "The agent has sent you a link to: {{event.args.title}}"
});

window.artwaresoft = window.artwaresoft || {};
artwaresoft.widgets = artwaresoft.widgets || {};
artwaresoft.agentwidgets = artwaresoft.agentwidgets || {};

artwaresoft.widgets.JBartForm = function (profile) {
    return {
        init: function (lps) { },
        getChannelType: function () { return 'jbartRichForm'; },
        handleCollaborationEvent: function (lps, eventObject, widgetSession) {
            var widget = this;
            widgetSession.widget = this;
            widgetSession.lps = lps;
            if (eventObject.command == 'start') {
            	var templateData = liveperson.utils.getTemplateData();
            	templateData.event = eventObject;

                var jbartProject = 'LP_Forms_Widget'; 
                var jbartPage = liveperson.utils.escapeHTML( eventObject.args.page );
                var jbartProjectJsUrl = _lpDropboxBase + '/jbart_LP_Forms_Widget.js'; 
                var formData = _escapeHTML(eventObject.args.formData);
            	
                var chatLineText = jQuery('<span class="text"/>').text(liveperson.utils.getTranslatedText('jbartform_in_chat_line'));
                var pageTitle = liveperson.utils.escapeHTML(Mustache.to_html("{{event.args.title}}", templateData));
                var pageLink = jQuery('<span class="link" > ' + pageTitle + '</span>');
                var chatHtml = jQuery('<div class="in_chatline"><div class="icon"/></div>').append(chatLineText.append(pageLink));
                pageLink.click(function() {
                	_showJBartWidgetInMediaArea(widget,widgetSession,eventObject.args.title,jbartProject,jbartProjectJsUrl,jbartPage);                	
                	widgetSession.showLocation(liveperson.collaboration.locations.media);
                });
                widgetSession.setChatLine(chatHtml);
                
                widget._ensureFormData(jbartPage,formData);
                _showJBartWidgetInMediaArea(widget,widgetSession,eventObject.args.title,jbartProject,jbartProjectJsUrl,jbartPage,{
            		rawData: { WidgetSession: widgetSession, FormsData: widget.FormsData },
            		base_images_dir: '',
            		page: jbartPage
                });
            } else {
              this.jBartTrigger(eventObject);
            }
        },
        _ensureFormData: function(jbartPage,formData) {
        	this.FormsData = this.FormsData || parseXml('<formsdata/>');
        	var formDataXml = parseXml(formData,this.FormsData);
        	if (!formDataXml || formDataXml.tagName != jbartPage) {
        		return;
        		alert('wrong formData');
        	}
        	
        	var existing = jQuery(this.FormsData).find('>'+jbartPage)[0];
        	if (existing) this.FormsData.removeChild(existing);
        	this.FormsData.appendChild(formDataXml);
        },
        jBartTrigger: function(eventObject) {
        	this.trigger('collaborationEvent',eventObject);
        }
    }
}

artwaresoft.agentwidgets.JBartForm = function (params) {
	return {
		getChannelType: function () { return 'jbartRichForm'; },
		init: function (agentApi,widgetContext) { 
			var context = this.context;
			var widget = this;
			var imagesDir = '';
			widgetContext.setLocationContent(liveperson.location.widgetMenu,{
				icon: _lpDropboxBase +'/agent-form-tab.png',
				title: 'Forms'
			});

			var control = jQuery('<div><div class="form_loading" style="font: 12px times;">Loading Forms...</div></div>')[0];
			var data = {};

			var jbartProject = 'LP_Forms_Widget'; //liveperson.utils.escapeHTML( eventObject.args.jbartProject );
			var jbartProjectJsUrl = params.JBartWidgetUrl; 

			var loading_js_file = false;

			widget.initFormList();
			
			function checkForWidgetLoaded() {
				if (window.jBartWidgets && jBartWidgets[jbartProject]) {  // loaded
					jBart.lpacAgent = agentApi;
					jQuery(control).find('>.form_loading').remove();
					jBartWidgets[jbartProject].show(control,{
						rawData: { LPImages: '/hcp/chatWindowSkins/collab', List: widget.list },
						page: 'catalog'
					});
				} else {
					if (! loading_js_file) {
						loading_js_file = true;
						jQuery.getScript(jbartProjectJsUrl);
					}
					setTimeout(checkForWidgetLoaded,200);
				}
			}
			checkForWidgetLoaded();

			widgetContext.setLocationContent(liveperson.location.widgetArea,{ control: control });
			
			agentApi.bind('agentCollaborationEvent',function(evt) {
			  evt = evt.agentEvent;
			  if (evt.channelType != 'jbartRichForm' || evt.command != 'start') return;
			  
			  var cannedEvents = widget.list;
			  var page = liveperson.utils.escapeHTML(evt.args.page);
			  var eventXml = aa_xpath(cannedEvents,"*[@page='"+page+"']")[0];
			  if (eventXml) {
				  eventXml.setAttribute('sentToVisitor','true');
				  agentApi.trigger('agentCollabEventCannedUpdated', { agentEvent: evt, eventXml: eventXml });
			  } 
			});
		},
		initFormList: function() {
			this.list = parseXml('<items>'
					+ '<item title="Create Account" page="createAccount"/>'
					+ '<item title="Support Showcase" page="supportShowcase"/>'
					+ '<item title="Credit Card (pci)" page="pci"/>'
					+ '</items>' );
		}
	}
}

artwaresoft.widgets.Products = function (profile) {
    return {
        init: function (lps) { },
        getChannelType: function () { return 'jbartProduct'; },
        handleCollaborationEvent: function (lps, eventObject, widgetSession) {
            var widget = this;
            widgetSession.widget = this;
            widgetSession.lps = lps;
            if (eventObject.command == 'start') {
            	var templateData = liveperson.utils.getTemplateData();
            	templateData.event = eventObject;

                var jbartProject = 'O2Products'; 
                var jbartPage = 'product'; 
                var jbartProjectJsUrl = _lpDropboxBase + '/jbart_O2Products.js'; 
                var productData = jbartWidget_unescape_argument(eventObject.args.productData) || '<product />';
            	
                var chatLineText = jQuery('<span class="text"/>').text(liveperson.utils.getTranslatedText('jbartproduct_in_chat_line'));
                var titleTemplate = liveperson.utils.getTranslatedText('product_inchat_template') || "{{event.args.title}}";

                var pageTitle = liveperson.utils.escapeHTML(Mustache.to_html(titleTemplate, templateData));
                var pageLink = jQuery('<span class="link" > ' + pageTitle + '</span>');
                var chatHtml = jQuery('<div class="in_chatline"><img class="icon"/></div>').append(chatLineText.append(pageLink));
                
                var icon = liveperson.utils.escapeHTML(eventObject.args.icon);
                chatHtml.find('.icon').attr('src',icon);
                
                pageLink.click(function() {
                	_showJBartWidgetInMediaArea(widget,widgetSession,eventObject.args.title,jbartProject,jbartProjectJsUrl,eventObject.args.title);                	
                	widgetSession.showLocation(liveperson.collaboration.locations.media);
                });
                widgetSession.setChatLine(chatHtml);
                                
                _showJBartWidgetInMediaArea(widget,widgetSession,eventObject.args.title,jbartProject,jbartProjectJsUrl,eventObject.args.title,{
            		rawData: { WidgetSession: widgetSession },
            		data: { Product: parseXml(productData) },
            		base_images_dir: '',
            		page: jbartPage
                });
            } else {
//              this.jBartTrigger(eventObject);
            }
        }
    }
}

artwaresoft.agentwidgets.Products = function (params) {
	return {
	    getChannelType: function () { return 'jbartProduct'; },
	    init: function (agentApi,widgetContext) { 
			  var widget = this;
			  var imagesDir = _lpDropboxBase;
			  widgetContext.setLocationContent(liveperson.location.widgetMenu,{
				  icon: imagesDir+'/agent-products-tab.png',
				  title: 'Products'
			  });
	
			  var control = jQuery('<div><div style="font: 12px times;">Loading Product Catalog...</div></div>')[0];
			  widgetContext.setLocationContent(liveperson.location.widgetArea,{ control: control });

			  var data = {};
	
			  var jbartProject = params.JBartWidgetName;
			  var jbartProjectJsUrl = params.JBartWidgetUrl;
			  
			  jQuery.getScript(jbartProjectJsUrl);
			  if (!window.JBLPProductCatalog)
				  jQuery.getScript(params.CatalogUrl);
			  
	          function checkForWidgetLoaded() {
	            	if (window.jBartWidgets && jBartWidgets[jbartProject] && window.JBLPProductCatalog) {  // loaded
	            		jBartWidgets[jbartProject].jBart.lpacAgent = agentApi;

	            		jQuery(control).empty();
	            		widget.list = parseXml(JBLPProductCatalog);
	            		
	                	jBartWidgets[jbartProject].show(control,{
	                		data: {
	                			List: widget.list,
	                			Product: '<item/>'
							},
							rawData: {
	                			LPImages: '/hcp/chatWindowSkins/collab'
							},
	                		page: 'catalog'
	                	});
	            	} else {
	            		setTimeout(checkForWidgetLoaded,200);
	            	}
	          }
	          checkForWidgetLoaded();
	          
			  agentApi.bind('agentCollaborationEvent',function(evt) {
				  evt = evt.agentEvent;
				  if (evt.channelType != 'jbartProduct' || evt.command != 'start' || !window.JBLPProductCatalog) return;
				  
				  var cannedEvents = widget.list;
				  var title = liveperson.utils.escapeHTML(evt.args.title);
				  var eventXml = aa_xpath(cannedEvents,"*[@title='"+title+"']")[0];
				  if (eventXml) {
					  eventXml.setAttribute('sentToVisitor','true');
					  agentApi.trigger('agentCollabEventCannedUpdated', { agentEvent: evt, eventXml: eventXml });
				  } 
			  });
	    }
	}
}

function jbartWidget_unescape_argument(str)
{
	str = str.replace(/&amp;/g,'&').replace(/&#60;/g,'<').replace(/&#62;/g,'>').replace(/&#32;/g,' ').replace(/&#61;/g,'=').replace(/&#34;/g,'"').replace(/&#47;/g,'/');
	return str;
/*	
	var arr = str.split('&#');
    for(var i=1;i<arr.length;i++) {
		  var pos = arr[i].indexOf(';') 
		  if (pos >-1) {
			  var num = arr[i].substring(0,pos);
			  arr[i] = String.fromCharCode(num) + arr[i].substring(pos+1);
		  }
	}
    return arr.join('');
*/
}

function jbartWidget_fix_xml_string_after_escaping(str)
{
  var arr = str.split('"');
  for(var i=1;i<arr.length;i+=2) {
	  // only odd values
	  arr[i] = arr[i].replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  }
  return arr.join('"');
}

function _escapeHTML(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText;
}

function _showJBartWidgetInMediaArea(widget,widgetSession,title,jbartProject,widgetURL,uniqueSuffix,jbartSettings)
{
	var unique = jbartProject + '_' + uniqueSuffix;
	
	window.__jbLoadingFiles = window.__jbLoadingFiles || [];
	
	widget.mediaArea = widget.mediaArea || jQuery('<div/>').css('position','relative').css('padding','15px').css('background','white').css('height','95%');
	widget._jbartWidgets = widget._jbartWidgets || {};
	if (! widget._jbartWidgets[unique]) { 
		var div = widget._jbartWidgets[unique] = jQuery('<div/><div class="loading_in_media">Loading...</div></div>')[0];
		
		function doCheck() {
			if (window.jBartWidgets && jBartWidgets[jbartProject]) {
				jBartWidgets[jbartProject].show(div,jbartSettings);
				return;
			}
			if (!window.__jbLoadingFiles[widgetURL]) {
				jQuery.getScript(widgetURL);	
				window.__jbLoadingFiles[widgetURL] = true;
			}
			setTimeout(doCheck,200);
		}
		
		doCheck();
	}
	widget.mediaArea.empty();
	widget.mediaArea.append(widget._jbartWidgets[unique]);
	
	widgetSession.setLocationContent(liveperson.collaboration.locations.media, { 
    	titleContent: title,
    	mediaContent: widget.mediaArea[0]
    });
}

function parseXml(contents)
{
    if (contents.nodeType == 9) return contents.documentElement;
    if (contents.nodeType) return contents;
    var doc;
    try {
        if (window.ActiveXObject) {
            doc = new ActiveXObject("MSXML2.DOMDocument");
            if (doc) {
                var loaded = doc.loadXML(contents);
                if (!loaded) {
                    var message = doc.parseError.reason + doc.parseError.srcText;
                    if (errorMsgOut != null)
                        errorMsgOut.push(message);
                    return null;
                }
            }
            else {
                doc = _parseXMLDoc(contents);
            }
        }
        else {
            doc = _parseXMLDoc(contents);
        }
    }
    catch (e) {
        return null;
    }
    return doc.firstChild;
}

function _parseXMLDoc(contents) {
    if (document.implementation && document.implementation.createDocument) {
        var domParser = new DOMParser();
        doc = domParser.parseFromString(contents, "text/xml");
        var errorMsg = null;

        var parseerrors = doc.getElementsByTagName("parsererror"); //chrome & safari
        if (parseerrors.length > 0) {
            errorMsg = "Error parsing xml"; //for empty error;
            try {
                errorMsg = parseerrors[0].childNodes.item(1).innerHTML;
            } catch (e) { errorMsg = "Error parsing xml"; }
        }
        if (doc.documentElement.nodeName == 'parsererror') {	// firefox
            errorMsg = doc.documentElement.childNodes.item(0).nodeValue;
            if (errorMsg.indexOf("Location") > 0)
                errorMsg = errorMsg.substring(0, errorMsg.indexOf("Location")) + errorMsg.substring(errorMsg.lastIndexOf("\n"));
        }
        if (errorMsg != null) {
            return null;
        }
        return doc;
    }
    return null;
}

var formsWidgetInfo = 
{
  "name": "jbart forms",
  "enabled": true,
  "channelType": "jbartRichForm",
  "agent": {
    "widgetClass": "artwaresoft.agentwidgets.JBartForm",
    "jsFiles": ["//dl.dropbox.com/u/24056024/LPWidgets/JBartWidgets.js"],
	"params": {
	}
  }
}

var productsWidgetInfo = 
{
	"name": "jBart Products",
	"enabled": true,
	"channelType": "jbartProduct",
	"agent": {
		"widgetClass": "artwaresoft.agentwidgets.Products",
		"jsFiles": ["//dl.dropbox.com/u/24056024/LPWidgets/JBartWidgets.js"],
		"cssFiles": ["//dl.dropbox.com/u/24056024/LPWidgets/JBartWidgets.css"],
		"params": {
			"CatalogUrl": "//dl.dropbox.com/u/24056024/lpProducts/O2Catalog.js",
			"JBartWidgetUrl": "//dl.dropbox.com/u/24056024/lpProducts/jbart_O2Products.js",
			"JBartWidgetName": "O2Products"
		}
	}
}

