/* Visitor Side */
liveperson.widgets = liveperson.widgets || {};

liveperson.widgets.HtmlIFrame = function (profile) {
    return {
        init: function (lps) {},
        getChannelType: function () { return 'htmlIframe'; },
        handleCollaborationEvent: function (lps, eventObject, widgetSession) {
            var widget = this;
            if (eventObject.command == 'start') {
            	var templateData = liveperson.utils.getTemplateData();
            	templateData.event = eventObject;
            	
                var chatLineText = jQuery('<span class="text"/>').text(liveperson.utils.getTranslatedText('iframe_in_chat_line'));
                var pageTitle = liveperson.utils.escapeHTML(Mustache.to_html("{{event.args.title}}", templateData));
                var pageLink = jQuery('<span class="link" > ' + pageTitle + '</span>');
                var chatHtml = jQuery('<div class="in_chatline"><div class="icon"/></div>').append(chatLineText.append(pageLink));
                pageLink.click(function() {
                    widgetSession.setLocationContent(liveperson.collaboration.locations.media, { 
                    	mediaContent: this.mediaArea,
                    	titleContent: eventObject.args.title
                    });
                	widget.showIFrame(eventObject);
                	widgetSession.showLocation(liveperson.collaboration.locations.media);
                });
                widgetSession.setChatLine(chatHtml);
                
                this.mediaArea = this.mediaArea || jQuery('<div style="height:100%" />')[0];  // Create it if it hasn't been created before
                this.showIFrame(eventObject);
                
                widgetSession.setLocationContent(liveperson.collaboration.locations.media, { 
                	mediaContent: this.mediaArea,
                	titleContent: eventObject.args.title
                });
                widgetSession.sendCollaborationEvent({ command: 'shown', args: { title: eventObject.args.title }} );
            }
        },
        showIFrame: function(eventObject) {
            var url = liveperson.utils.escapeHTML(eventObject.args.url);
            jQuery(this.mediaArea).empty();
            jQuery(this.mediaArea).append(jQuery("<iframe frameborder='0' />").attr("src",url).css('height','100%').css('width','100%'));
        }
    }
}

/* Agent Side */
liveperson.agentwidgets = liveperson.agentwidgets || {};
liveperson.agentwidgets.HTMLPage = function(params)
{
	return {
	    getChannelType: function () { return 'htmlIframe'; },
		init: function(agentApi,widgetContext) {
		  var widget = this;
		  
		  this.list = parseXml('<list/>');
		  
		  agentApi.bind('agentCollaborationEvent',function(evt) {
			  evt = evt.agentEvent;
			  if (evt.channelType != 'htmlIframe') return;
			  
			  var cannedEvents = widget.list;
			  var url = liveperson.utils.escapeHTML(evt.args.url);
			  var eventXml = aa_xpath(cannedEvents,"*[@url='"+url+"']")[0];
			  if (eventXml) {
				  eventXml.setAttribute('sentToVisitor','true');
				  agentApi.trigger('agentCollabEventCannedUpdated', { agentEvent: evt, eventXml: eventXml });
			  } 
		  });

		  this.imagesDir = '/hcp/chatWindowSkins/collab';
		  
		  widgetContext.setLocationContent(liveperson.location.widgetMenu,{
			  icon: '//jbartapps.appspot.com/lp/agent-html-tab.png',
			  title: liveperson.utils.getTranslatedText('html_tab_title')
		  });

		  widgetContext.setLocationContent(liveperson.location.widgetArea,{
			  control: this.getWidgetArea(agentApi)
		  });
		  
		  widgetContext.setLocationContent(liveperson.location.activityLog,{
			  icon: 'http://jbartapps.appspot.com/lp/html-small-icon.png',
			  title: function(collabEvent) { return liveperson.utils.escapeHTML(collabEvent.args.title) }, 
			  status: function(collabEvent) { return liveperson.utils.getTranslatedText('html_log_shown'); }
		  });
		  
		},
		getWidgetArea: function(agentApi)
		{
			var control = jQuery('<div/>');
			var widget = this;
			
			this._loadList(function() {
				var jbartProject = 'LPHtmlWidget';
				jBartWidgets[jbartProject].jBart.lpacAgent = agentApi;
            	jBartWidgets[jbartProject].show(control[0],{
            		rawData: { List: widget.list , LPImages: widget.imagesDir },
            		base_images_dir: widget.imagesDir,
            		page: 'main'
            	});
			});
			return control[0];
		},
		_loadList: function(callback) {
			var context = this.context;
			var widget = this;
			var path = params.cannedResponsesPath || 'LP Connect.HTMLPage';
			path = escape(path);
			if (jBart.lpacAgent._getCannedResponses && !jBart._lpacSimulator) {
				jBart.lpacAgent._getCannedResponses({ 
					path: path,
					success: function(contentElements) {
					    if (contentElements) {
					    	var videoListXml = widget.list;
					    	for(var i in contentElements) {
					    		var item = contentElements[i];
					    		var elem = widget.list.ownerDocument.createElement('item')
					    		elem.setAttribute('title',item['@name']);
					    		elem.setAttribute('url',item['$']);
					    		
					    		widget.list.appendChild(elem);
					    	}
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

if (!liveperson.utils.getTranslatedText ) {
	liveperson.utils.getTranslatedText = function (code) {
	    if (!code || code == '') return ''; // to make the calling functions smaller
	
	    if ((!liveperson.language || !liveperson.language[code]) && liveperson.defaultLanguage) {
	        if (liveperson.languages[liveperson.defaultLanguage] && liveperson.languages[liveperson.defaultLanguage][code]) {
	            return liveperson.languages[liveperson.defaultLanguage][code];
	        }
	    }
	    if (!liveperson.language) {
	        return '';
	    }
	    if (!liveperson.language[code]) {
	        return '';
	    }
	    return liveperson.language[code];
	};
}

var htmlPageInfo = 
{
	"name": "HTML Page",
	"enabled": true,
	"channelType": "htmlIframe",
	"agent": {
		"widgetClass": "liveperson.agentwidgets.HTMLPage",
		"jsFiles": [ 
		             "https://dl.dropbox.com/u/24056024/aspire/HtmlWidget.js", 
		             "https://dl.dropbox.com/u/24056024/aspire/HtmlWidget_lang.js", 
		             "https://dl.dropbox.com/u/24056024/aspire/jbart_LPHtmlWidget.js"	
		],
		"cssFiles": [],
		"params": { }
	}
}
	