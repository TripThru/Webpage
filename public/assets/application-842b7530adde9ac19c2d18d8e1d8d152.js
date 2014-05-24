(function($, undefined) {

/**
 * Unobtrusive scripting adapter for jQuery
 * https://github.com/rails/jquery-ujs
 *
 * Requires jQuery 1.7.0 or later.
 *
 * Released under the MIT license
 *
 */

  // Cut down on the number of issues from people inadvertently including jquery_ujs twice
  // by detecting and raising an error when it happens.
  if ( $.rails !== undefined ) {
    $.error('jquery-ujs has already been loaded!');
  }

  // Shorthand to make it a little easier to call public rails functions from within rails.js
  var rails;
  var $document = $(document);

  $.rails = rails = {
    // Link elements bound by jquery-ujs
    linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote], a[data-disable-with]',

    // Button elements bound by jquery-ujs
    buttonClickSelector: 'button[data-remote]',

    // Select elements bound by jquery-ujs
    inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',

    // Form elements bound by jquery-ujs
    formSubmitSelector: 'form',

    // Form input elements bound by jquery-ujs
    formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type])',

    // Form input elements disabled during form submission
    disableSelector: 'input[data-disable-with], button[data-disable-with], textarea[data-disable-with]',

    // Form input elements re-enabled after form submission
    enableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled',

    // Form required input elements
    requiredInputSelector: 'input[name][required]:not([disabled]),textarea[name][required]:not([disabled])',

    // Form file input elements
    fileInputSelector: 'input[type=file]',

    // Link onClick disable selector with possible reenable after remote submission
    linkDisableSelector: 'a[data-disable-with]',

    // Make sure that every Ajax request sends the CSRF token
    CSRFProtection: function(xhr) {
      var token = $('meta[name="csrf-token"]').attr('content');
      if (token) xhr.setRequestHeader('X-CSRF-Token', token);
    },

    // making sure that all forms have actual up-to-date token(cached forms contain old one)
    refreshCSRFTokens: function(){
      var csrfToken = $('meta[name=csrf-token]').attr('content');
      var csrfParam = $('meta[name=csrf-param]').attr('content');
      $('form input[name="' + csrfParam + '"]').val(csrfToken);
    },

    // Triggers an event on an element and returns false if the event result is false
    fire: function(obj, name, data) {
      var event = $.Event(name);
      obj.trigger(event, data);
      return event.result !== false;
    },

    // Default confirm dialog, may be overridden with custom confirm dialog in $.rails.confirm
    confirm: function(message) {
      return confirm(message);
    },

    // Default ajax function, may be overridden with custom function in $.rails.ajax
    ajax: function(options) {
      return $.ajax(options);
    },

    // Default way to get an element's href. May be overridden at $.rails.href.
    href: function(element) {
      return element.attr('href');
    },

    // Submits "remote" forms and links with ajax
    handleRemote: function(element) {
      var method, url, data, elCrossDomain, crossDomain, withCredentials, dataType, options;

      if (rails.fire(element, 'ajax:before')) {
        elCrossDomain = element.data('cross-domain');
        crossDomain = elCrossDomain === undefined ? null : elCrossDomain;
        withCredentials = element.data('with-credentials') || null;
        dataType = element.data('type') || ($.ajaxSettings && $.ajaxSettings.dataType);

        if (element.is('form')) {
          method = element.attr('method');
          url = element.attr('action');
          data = element.serializeArray();
          // memoized value from clicked submit button
          var button = element.data('ujs:submit-button');
          if (button) {
            data.push(button);
            element.data('ujs:submit-button', null);
          }
        } else if (element.is(rails.inputChangeSelector)) {
          method = element.data('method');
          url = element.data('url');
          data = element.serialize();
          if (element.data('params')) data = data + "&" + element.data('params');
        } else if (element.is(rails.buttonClickSelector)) {
          method = element.data('method') || 'get';
          url = element.data('url');
          data = element.serialize();
          if (element.data('params')) data = data + "&" + element.data('params');
        } else {
          method = element.data('method');
          url = rails.href(element);
          data = element.data('params') || null;
        }

        options = {
          type: method || 'GET', data: data, dataType: dataType,
          // stopping the "ajax:beforeSend" event will cancel the ajax request
          beforeSend: function(xhr, settings) {
            if (settings.dataType === undefined) {
              xhr.setRequestHeader('accept', '*/*;q=0.5, ' + settings.accepts.script);
            }
            return rails.fire(element, 'ajax:beforeSend', [xhr, settings]);
          },
          success: function(data, status, xhr) {
            element.trigger('ajax:success', [data, status, xhr]);
          },
          complete: function(xhr, status) {
            element.trigger('ajax:complete', [xhr, status]);
          },
          error: function(xhr, status, error) {
            element.trigger('ajax:error', [xhr, status, error]);
          },
          crossDomain: crossDomain
        };

        // There is no withCredentials for IE6-8 when
        // "Enable native XMLHTTP support" is disabled
        if (withCredentials) {
          options.xhrFields = {
            withCredentials: withCredentials
          };
        }

        // Only pass url to `ajax` options if not blank
        if (url) { options.url = url; }

        var jqxhr = rails.ajax(options);
        element.trigger('ajax:send', jqxhr);
        return jqxhr;
      } else {
        return false;
      }
    },

    // Handles "data-method" on links such as:
    // <a href="/settings/5" data-method="delete" rel="nofollow" data-confirm="Are you sure?">Delete</a>
    handleMethod: function(link) {
      var href = rails.href(link),
        method = link.data('method'),
        target = link.attr('target'),
        csrfToken = $('meta[name=csrf-token]').attr('content'),
        csrfParam = $('meta[name=csrf-param]').attr('content'),
        form = $('<form method="post" action="' + href + '"></form>'),
        metadataInput = '<input name="_method" value="' + method + '" type="hidden" />';

      if (csrfParam !== undefined && csrfToken !== undefined) {
        metadataInput += '<input name="' + csrfParam + '" value="' + csrfToken + '" type="hidden" />';
      }

      if (target) { form.attr('target', target); }

      form.hide().append(metadataInput).appendTo('body');
      form.submit();
    },

    /* Disables form elements:
      - Caches element value in 'ujs:enable-with' data store
      - Replaces element text with value of 'data-disable-with' attribute
      - Sets disabled property to true
    */
    disableFormElements: function(form) {
      form.find(rails.disableSelector).each(function() {
        var element = $(this), method = element.is('button') ? 'html' : 'val';
        element.data('ujs:enable-with', element[method]());
        element[method](element.data('disable-with'));
        element.prop('disabled', true);
      });
    },

    /* Re-enables disabled form elements:
      - Replaces element text with cached value from 'ujs:enable-with' data store (created in `disableFormElements`)
      - Sets disabled property to false
    */
    enableFormElements: function(form) {
      form.find(rails.enableSelector).each(function() {
        var element = $(this), method = element.is('button') ? 'html' : 'val';
        if (element.data('ujs:enable-with')) element[method](element.data('ujs:enable-with'));
        element.prop('disabled', false);
      });
    },

   /* For 'data-confirm' attribute:
      - Fires `confirm` event
      - Shows the confirmation dialog
      - Fires the `confirm:complete` event

      Returns `true` if no function stops the chain and user chose yes; `false` otherwise.
      Attaching a handler to the element's `confirm` event that returns a `falsy` value cancels the confirmation dialog.
      Attaching a handler to the element's `confirm:complete` event that returns a `falsy` value makes this function
      return false. The `confirm:complete` event is fired whether or not the user answered true or false to the dialog.
   */
    allowAction: function(element) {
      var message = element.data('confirm'),
          answer = false, callback;
      if (!message) { return true; }

      if (rails.fire(element, 'confirm')) {
        answer = rails.confirm(message);
        callback = rails.fire(element, 'confirm:complete', [answer]);
      }
      return answer && callback;
    },

    // Helper function which checks for blank inputs in a form that match the specified CSS selector
    blankInputs: function(form, specifiedSelector, nonBlank) {
      var inputs = $(), input, valueToCheck,
          selector = specifiedSelector || 'input,textarea',
          allInputs = form.find(selector);

      allInputs.each(function() {
        input = $(this);
        valueToCheck = input.is('input[type=checkbox],input[type=radio]') ? input.is(':checked') : input.val();
        // If nonBlank and valueToCheck are both truthy, or nonBlank and valueToCheck are both falsey
        if (!valueToCheck === !nonBlank) {

          // Don't count unchecked required radio if other radio with same name is checked
          if (input.is('input[type=radio]') && allInputs.filter('input[type=radio]:checked[name="' + input.attr('name') + '"]').length) {
            return true; // Skip to next input
          }

          inputs = inputs.add(input);
        }
      });
      return inputs.length ? inputs : false;
    },

    // Helper function which checks for non-blank inputs in a form that match the specified CSS selector
    nonBlankInputs: function(form, specifiedSelector) {
      return rails.blankInputs(form, specifiedSelector, true); // true specifies nonBlank
    },

    // Helper function, needed to provide consistent behavior in IE
    stopEverything: function(e) {
      $(e.target).trigger('ujs:everythingStopped');
      e.stopImmediatePropagation();
      return false;
    },

    //  replace element's html with the 'data-disable-with' after storing original html
    //  and prevent clicking on it
    disableElement: function(element) {
      element.data('ujs:enable-with', element.html()); // store enabled state
      element.html(element.data('disable-with')); // set to disabled state
      element.bind('click.railsDisable', function(e) { // prevent further clicking
        return rails.stopEverything(e);
      });
    },

    // restore element to its original state which was disabled by 'disableElement' above
    enableElement: function(element) {
      if (element.data('ujs:enable-with') !== undefined) {
        element.html(element.data('ujs:enable-with')); // set to old enabled state
        element.removeData('ujs:enable-with'); // clean up cache
      }
      element.unbind('click.railsDisable'); // enable element
    }

  };

  if (rails.fire($document, 'rails:attachBindings')) {

    $.ajaxPrefilter(function(options, originalOptions, xhr){ if ( !options.crossDomain ) { rails.CSRFProtection(xhr); }});

    $document.delegate(rails.linkDisableSelector, 'ajax:complete', function() {
        rails.enableElement($(this));
    });

    $document.delegate(rails.linkClickSelector, 'click.rails', function(e) {
      var link = $(this), method = link.data('method'), data = link.data('params'), metaClick = e.metaKey || e.ctrlKey;
      if (!rails.allowAction(link)) return rails.stopEverything(e);

      if (!metaClick && link.is(rails.linkDisableSelector)) rails.disableElement(link);

      if (link.data('remote') !== undefined) {
        if (metaClick && (!method || method === 'GET') && !data) { return true; }

        var handleRemote = rails.handleRemote(link);
        // response from rails.handleRemote() will either be false or a deferred object promise.
        if (handleRemote === false) {
          rails.enableElement(link);
        } else {
          handleRemote.error( function() { rails.enableElement(link); } );
        }
        return false;

      } else if (link.data('method')) {
        rails.handleMethod(link);
        return false;
      }
    });

    $document.delegate(rails.buttonClickSelector, 'click.rails', function(e) {
      var button = $(this);
      if (!rails.allowAction(button)) return rails.stopEverything(e);

      rails.handleRemote(button);
      return false;
    });

    $document.delegate(rails.inputChangeSelector, 'change.rails', function(e) {
      var link = $(this);
      if (!rails.allowAction(link)) return rails.stopEverything(e);

      rails.handleRemote(link);
      return false;
    });

    $document.delegate(rails.formSubmitSelector, 'submit.rails', function(e) {
      var form = $(this),
        remote = form.data('remote') !== undefined,
        blankRequiredInputs = rails.blankInputs(form, rails.requiredInputSelector),
        nonBlankFileInputs = rails.nonBlankInputs(form, rails.fileInputSelector);

      if (!rails.allowAction(form)) return rails.stopEverything(e);

      // skip other logic when required values are missing or file upload is present
      if (blankRequiredInputs && form.attr("novalidate") == undefined && rails.fire(form, 'ajax:aborted:required', [blankRequiredInputs])) {
        return rails.stopEverything(e);
      }

      if (remote) {
        if (nonBlankFileInputs) {
          // slight timeout so that the submit button gets properly serialized
          // (make it easy for event handler to serialize form without disabled values)
          setTimeout(function(){ rails.disableFormElements(form); }, 13);
          var aborted = rails.fire(form, 'ajax:aborted:file', [nonBlankFileInputs]);

          // re-enable form elements if event bindings return false (canceling normal form submission)
          if (!aborted) { setTimeout(function(){ rails.enableFormElements(form); }, 13); }

          return aborted;
        }

        rails.handleRemote(form);
        return false;

      } else {
        // slight timeout so that the submit button gets properly serialized
        setTimeout(function(){ rails.disableFormElements(form); }, 13);
      }
    });

    $document.delegate(rails.formInputClickSelector, 'click.rails', function(event) {
      var button = $(this);

      if (!rails.allowAction(button)) return rails.stopEverything(event);

      // register the pressed submit button
      var name = button.attr('name'),
        data = name ? {name:name, value:button.val()} : null;

      button.closest('form').data('ujs:submit-button', data);
    });

    $document.delegate(rails.formSubmitSelector, 'ajax:beforeSend.rails', function(event) {
      if (this == event.target) rails.disableFormElements($(this));
    });

    $document.delegate(rails.formSubmitSelector, 'ajax:complete.rails', function(event) {
      if (this == event.target) rails.enableFormElements($(this));
    });

    $(function(){
      rails.refreshCSRFTokens();
    });
  }

})( jQuery );
(function() {
  var CSRFToken, Click, ComponentUrl, Link, browserCompatibleDocumentParser, browserIsntBuggy, browserSupportsCustomEvents, browserSupportsPushState, browserSupportsTurbolinks, bypassOnLoadPopstate, cacheCurrentPage, cacheSize, changePage, constrainPageCacheTo, createDocument, currentState, enableTransitionCache, executeScriptTags, extractTitleAndBody, fetch, fetchHistory, fetchReplacement, historyStateIsDefined, initializeTurbolinks, installDocumentReadyPageEventTriggers, installHistoryChangeHandler, installJqueryAjaxSuccessPageUpdateTrigger, loadedAssets, pageCache, pageChangePrevented, pagesCached, popCookie, processResponse, recallScrollPosition, referer, reflectNewUrl, reflectRedirectedUrl, rememberCurrentState, rememberCurrentUrl, rememberReferer, removeNoscriptTags, requestMethodIsSafe, resetScrollPosition, transitionCacheEnabled, transitionCacheFor, triggerEvent, visit, xhr, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  pageCache = {};

  cacheSize = 10;

  transitionCacheEnabled = false;

  currentState = null;

  loadedAssets = null;

  referer = null;

  createDocument = null;

  xhr = null;

  fetch = function(url) {
    var cachedPage;
    url = new ComponentUrl(url);
    rememberReferer();
    cacheCurrentPage();
    reflectNewUrl(url);
    if (transitionCacheEnabled && (cachedPage = transitionCacheFor(url.absolute))) {
      fetchHistory(cachedPage);
      return fetchReplacement(url);
    } else {
      return fetchReplacement(url, resetScrollPosition);
    }
  };

  transitionCacheFor = function(url) {
    var cachedPage;
    cachedPage = pageCache[url];
    if (cachedPage && !cachedPage.transitionCacheDisabled) {
      return cachedPage;
    }
  };

  enableTransitionCache = function(enable) {
    if (enable == null) {
      enable = true;
    }
    return transitionCacheEnabled = enable;
  };

  fetchReplacement = function(url, onLoadFunction) {
    if (onLoadFunction == null) {
      onLoadFunction = (function(_this) {
        return function() {};
      })(this);
    }
    triggerEvent('page:fetch', {
      url: url.absolute
    });
    if (xhr != null) {
      xhr.abort();
    }
    xhr = new XMLHttpRequest;
    xhr.open('GET', url.withoutHashForIE10compatibility(), true);
    xhr.setRequestHeader('Accept', 'text/html, application/xhtml+xml, application/xml');
    xhr.setRequestHeader('X-XHR-Referer', referer);
    xhr.onload = function() {
      var doc;
      triggerEvent('page:receive');
      if (doc = processResponse()) {
        changePage.apply(null, extractTitleAndBody(doc));
        reflectRedirectedUrl();
        onLoadFunction();
        return triggerEvent('page:load');
      } else {
        return document.location.href = url.absolute;
      }
    };
    xhr.onloadend = function() {
      return xhr = null;
    };
    xhr.onerror = function() {
      return document.location.href = url.absolute;
    };
    return xhr.send();
  };

  fetchHistory = function(cachedPage) {
    if (xhr != null) {
      xhr.abort();
    }
    changePage(cachedPage.title, cachedPage.body);
    recallScrollPosition(cachedPage);
    return triggerEvent('page:restore');
  };

  cacheCurrentPage = function() {
    var currentStateUrl;
    currentStateUrl = new ComponentUrl(currentState.url);
    pageCache[currentStateUrl.absolute] = {
      url: currentStateUrl.relative,
      body: document.body,
      title: document.title,
      positionY: window.pageYOffset,
      positionX: window.pageXOffset,
      cachedAt: new Date().getTime(),
      transitionCacheDisabled: document.querySelector('[data-no-transition-cache]') != null
    };
    return constrainPageCacheTo(cacheSize);
  };

  pagesCached = function(size) {
    if (size == null) {
      size = cacheSize;
    }
    if (/^[\d]+$/.test(size)) {
      return cacheSize = parseInt(size);
    }
  };

  constrainPageCacheTo = function(limit) {
    var cacheTimesRecentFirst, key, pageCacheKeys, _i, _len, _results;
    pageCacheKeys = Object.keys(pageCache);
    cacheTimesRecentFirst = pageCacheKeys.map(function(url) {
      return pageCache[url].cachedAt;
    }).sort(function(a, b) {
      return b - a;
    });
    _results = [];
    for (_i = 0, _len = pageCacheKeys.length; _i < _len; _i++) {
      key = pageCacheKeys[_i];
      if (!(pageCache[key].cachedAt <= cacheTimesRecentFirst[limit])) {
        continue;
      }
      triggerEvent('page:expire', pageCache[key]);
      _results.push(delete pageCache[key]);
    }
    return _results;
  };

  changePage = function(title, body, csrfToken, runScripts) {
    document.title = title;
    document.documentElement.replaceChild(body, document.body);
    if (csrfToken != null) {
      CSRFToken.update(csrfToken);
    }
    if (runScripts) {
      executeScriptTags();
    }
    currentState = window.history.state;
    triggerEvent('page:change');
    return triggerEvent('page:update');
  };

  executeScriptTags = function() {
    var attr, copy, nextSibling, parentNode, script, scripts, _i, _j, _len, _len1, _ref, _ref1;
    scripts = Array.prototype.slice.call(document.body.querySelectorAll('script:not([data-turbolinks-eval="false"])'));
    for (_i = 0, _len = scripts.length; _i < _len; _i++) {
      script = scripts[_i];
      if (!((_ref = script.type) === '' || _ref === 'text/javascript')) {
        continue;
      }
      copy = document.createElement('script');
      _ref1 = script.attributes;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        attr = _ref1[_j];
        copy.setAttribute(attr.name, attr.value);
      }
      copy.appendChild(document.createTextNode(script.innerHTML));
      parentNode = script.parentNode, nextSibling = script.nextSibling;
      parentNode.removeChild(script);
      parentNode.insertBefore(copy, nextSibling);
    }
  };

  removeNoscriptTags = function(node) {
    node.innerHTML = node.innerHTML.replace(/<noscript[\S\s]*?<\/noscript>/ig, '');
    return node;
  };

  reflectNewUrl = function(url) {
    if ((url = new ComponentUrl(url)).absolute !== referer) {
      return window.history.pushState({
        turbolinks: true,
        url: url.absolute
      }, '', url.absolute);
    }
  };

  reflectRedirectedUrl = function() {
    var location, preservedHash;
    if (location = xhr.getResponseHeader('X-XHR-Redirected-To')) {
      location = new ComponentUrl(location);
      preservedHash = location.hasNoHash() ? document.location.hash : '';
      return window.history.replaceState(currentState, '', location.href + preservedHash);
    }
  };

  rememberReferer = function() {
    return referer = document.location.href;
  };

  rememberCurrentUrl = function() {
    return window.history.replaceState({
      turbolinks: true,
      url: document.location.href
    }, '', document.location.href);
  };

  rememberCurrentState = function() {
    return currentState = window.history.state;
  };

  recallScrollPosition = function(page) {
    return window.scrollTo(page.positionX, page.positionY);
  };

  resetScrollPosition = function() {
    if (document.location.hash) {
      return document.location.href = document.location.href;
    } else {
      return window.scrollTo(0, 0);
    }
  };

  popCookie = function(name) {
    var value, _ref;
    value = ((_ref = document.cookie.match(new RegExp(name + "=(\\w+)"))) != null ? _ref[1].toUpperCase() : void 0) || '';
    document.cookie = name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT; path=/';
    return value;
  };

  triggerEvent = function(name, data) {
    var event;
    event = document.createEvent('Events');
    if (data) {
      event.data = data;
    }
    event.initEvent(name, true, true);
    return document.dispatchEvent(event);
  };

  pageChangePrevented = function() {
    return !triggerEvent('page:before-change');
  };

  processResponse = function() {
    var assetsChanged, clientOrServerError, doc, extractTrackAssets, intersection, validContent;
    clientOrServerError = function() {
      var _ref;
      return (400 <= (_ref = xhr.status) && _ref < 600);
    };
    validContent = function() {
      return xhr.getResponseHeader('Content-Type').match(/^(?:text\/html|application\/xhtml\+xml|application\/xml)(?:;|$)/);
    };
    extractTrackAssets = function(doc) {
      var node, _i, _len, _ref, _results;
      _ref = doc.head.childNodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        if ((typeof node.getAttribute === "function" ? node.getAttribute('data-turbolinks-track') : void 0) != null) {
          _results.push(node.getAttribute('src') || node.getAttribute('href'));
        }
      }
      return _results;
    };
    assetsChanged = function(doc) {
      var fetchedAssets;
      loadedAssets || (loadedAssets = extractTrackAssets(document));
      fetchedAssets = extractTrackAssets(doc);
      return fetchedAssets.length !== loadedAssets.length || intersection(fetchedAssets, loadedAssets).length !== loadedAssets.length;
    };
    intersection = function(a, b) {
      var value, _i, _len, _ref, _results;
      if (a.length > b.length) {
        _ref = [b, a], a = _ref[0], b = _ref[1];
      }
      _results = [];
      for (_i = 0, _len = a.length; _i < _len; _i++) {
        value = a[_i];
        if (__indexOf.call(b, value) >= 0) {
          _results.push(value);
        }
      }
      return _results;
    };
    if (!clientOrServerError() && validContent()) {
      doc = createDocument(xhr.responseText);
      if (doc && !assetsChanged(doc)) {
        return doc;
      }
    }
  };

  extractTitleAndBody = function(doc) {
    var title;
    title = doc.querySelector('title');
    return [title != null ? title.textContent : void 0, removeNoscriptTags(doc.body), CSRFToken.get(doc).token, 'runScripts'];
  };

  CSRFToken = {
    get: function(doc) {
      var tag;
      if (doc == null) {
        doc = document;
      }
      return {
        node: tag = doc.querySelector('meta[name="csrf-token"]'),
        token: tag != null ? typeof tag.getAttribute === "function" ? tag.getAttribute('content') : void 0 : void 0
      };
    },
    update: function(latest) {
      var current;
      current = this.get();
      if ((current.token != null) && (latest != null) && current.token !== latest) {
        return current.node.setAttribute('content', latest);
      }
    }
  };

  browserCompatibleDocumentParser = function() {
    var createDocumentUsingDOM, createDocumentUsingParser, createDocumentUsingWrite, e, testDoc, _ref;
    createDocumentUsingParser = function(html) {
      return (new DOMParser).parseFromString(html, 'text/html');
    };
    createDocumentUsingDOM = function(html) {
      var doc;
      doc = document.implementation.createHTMLDocument('');
      doc.documentElement.innerHTML = html;
      return doc;
    };
    createDocumentUsingWrite = function(html) {
      var doc;
      doc = document.implementation.createHTMLDocument('');
      doc.open('replace');
      doc.write(html);
      doc.close();
      return doc;
    };
    try {
      if (window.DOMParser) {
        testDoc = createDocumentUsingParser('<html><body><p>test');
        return createDocumentUsingParser;
      }
    } catch (_error) {
      e = _error;
      testDoc = createDocumentUsingDOM('<html><body><p>test');
      return createDocumentUsingDOM;
    } finally {
      if ((testDoc != null ? (_ref = testDoc.body) != null ? _ref.childNodes.length : void 0 : void 0) !== 1) {
        return createDocumentUsingWrite;
      }
    }
  };

  ComponentUrl = (function() {
    function ComponentUrl(original) {
      this.original = original != null ? original : document.location.href;
      if (this.original.constructor === ComponentUrl) {
        return this.original;
      }
      this._parse();
    }

    ComponentUrl.prototype.withoutHash = function() {
      return this.href.replace(this.hash, '');
    };

    ComponentUrl.prototype.withoutHashForIE10compatibility = function() {
      return this.withoutHash();
    };

    ComponentUrl.prototype.hasNoHash = function() {
      return this.hash.length === 0;
    };

    ComponentUrl.prototype._parse = function() {
      var _ref;
      (this.link != null ? this.link : this.link = document.createElement('a')).href = this.original;
      _ref = this.link, this.href = _ref.href, this.protocol = _ref.protocol, this.host = _ref.host, this.hostname = _ref.hostname, this.port = _ref.port, this.pathname = _ref.pathname, this.search = _ref.search, this.hash = _ref.hash;
      this.origin = [this.protocol, '//', this.hostname].join('');
      if (this.port.length !== 0) {
        this.origin += ":" + this.port;
      }
      this.relative = [this.pathname, this.search, this.hash].join('');
      return this.absolute = this.href;
    };

    return ComponentUrl;

  })();

  Link = (function(_super) {
    __extends(Link, _super);

    Link.HTML_EXTENSIONS = ['html'];

    Link.allowExtensions = function() {
      var extension, extensions, _i, _len;
      extensions = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = extensions.length; _i < _len; _i++) {
        extension = extensions[_i];
        Link.HTML_EXTENSIONS.push(extension);
      }
      return Link.HTML_EXTENSIONS;
    };

    function Link(link) {
      this.link = link;
      if (this.link.constructor === Link) {
        return this.link;
      }
      this.original = this.link.href;
      Link.__super__.constructor.apply(this, arguments);
    }

    Link.prototype.shouldIgnore = function() {
      return this._crossOrigin() || this._anchored() || this._nonHtml() || this._optOut() || this._target();
    };

    Link.prototype._crossOrigin = function() {
      return this.origin !== (new ComponentUrl).origin;
    };

    Link.prototype._anchored = function() {
      var current;
      return ((this.hash && this.withoutHash()) === (current = new ComponentUrl).withoutHash()) || (this.href === current.href + '#');
    };

    Link.prototype._nonHtml = function() {
      return this.pathname.match(/\.[a-z]+$/g) && !this.pathname.match(new RegExp("\\.(?:" + (Link.HTML_EXTENSIONS.join('|')) + ")?$", 'g'));
    };

    Link.prototype._optOut = function() {
      var ignore, link;
      link = this.link;
      while (!(ignore || link === document)) {
        ignore = link.getAttribute('data-no-turbolink') != null;
        link = link.parentNode;
      }
      return ignore;
    };

    Link.prototype._target = function() {
      return this.link.target.length !== 0;
    };

    return Link;

  })(ComponentUrl);

  Click = (function() {
    Click.installHandlerLast = function(event) {
      if (!event.defaultPrevented) {
        document.removeEventListener('click', Click.handle, false);
        return document.addEventListener('click', Click.handle, false);
      }
    };

    Click.handle = function(event) {
      return new Click(event);
    };

    function Click(event) {
      this.event = event;
      if (this.event.defaultPrevented) {
        return;
      }
      this._extractLink();
      if (this._validForTurbolinks()) {
        if (!pageChangePrevented()) {
          visit(this.link.href);
        }
        this.event.preventDefault();
      }
    }

    Click.prototype._extractLink = function() {
      var link;
      link = this.event.target;
      while (!(!link.parentNode || link.nodeName === 'A')) {
        link = link.parentNode;
      }
      if (link.nodeName === 'A' && link.href.length !== 0) {
        return this.link = new Link(link);
      }
    };

    Click.prototype._validForTurbolinks = function() {
      return (this.link != null) && !(this.link.shouldIgnore() || this._nonStandardClick());
    };

    Click.prototype._nonStandardClick = function() {
      return this.event.which > 1 || this.event.metaKey || this.event.ctrlKey || this.event.shiftKey || this.event.altKey;
    };

    return Click;

  })();

  bypassOnLoadPopstate = function(fn) {
    return setTimeout(fn, 500);
  };

  installDocumentReadyPageEventTriggers = function() {
    return document.addEventListener('DOMContentLoaded', (function() {
      triggerEvent('page:change');
      return triggerEvent('page:update');
    }), true);
  };

  installJqueryAjaxSuccessPageUpdateTrigger = function() {
    if (typeof jQuery !== 'undefined') {
      return jQuery(document).on('ajaxSuccess', function(event, xhr, settings) {
        if (!jQuery.trim(xhr.responseText)) {
          return;
        }
        return triggerEvent('page:update');
      });
    }
  };

  installHistoryChangeHandler = function(event) {
    var cachedPage, _ref;
    if ((_ref = event.state) != null ? _ref.turbolinks : void 0) {
      if (cachedPage = pageCache[(new ComponentUrl(event.state.url)).absolute]) {
        cacheCurrentPage();
        return fetchHistory(cachedPage);
      } else {
        return visit(event.target.location.href);
      }
    }
  };

  initializeTurbolinks = function() {
    rememberCurrentUrl();
    rememberCurrentState();
    createDocument = browserCompatibleDocumentParser();
    document.addEventListener('click', Click.installHandlerLast, true);
    return bypassOnLoadPopstate(function() {
      return window.addEventListener('popstate', installHistoryChangeHandler, false);
    });
  };

  historyStateIsDefined = window.history.state !== void 0 || navigator.userAgent.match(/Firefox\/2[6|7]/);

  browserSupportsPushState = window.history && window.history.pushState && window.history.replaceState && historyStateIsDefined;

  browserIsntBuggy = !navigator.userAgent.match(/CriOS\//);

  requestMethodIsSafe = (_ref = popCookie('request_method')) === 'GET' || _ref === '';

  browserSupportsTurbolinks = browserSupportsPushState && browserIsntBuggy && requestMethodIsSafe;

  browserSupportsCustomEvents = document.addEventListener && document.createEvent;

  if (browserSupportsCustomEvents) {
    installDocumentReadyPageEventTriggers();
    installJqueryAjaxSuccessPageUpdateTrigger();
  }

  if (browserSupportsTurbolinks) {
    visit = fetch;
    initializeTurbolinks();
  } else {
    visit = function(url) {
      return document.location.href = url;
    };
  }

  this.Turbolinks = {
    visit: visit,
    pagesCached: pagesCached,
    enableTransitionCache: enableTransitionCache,
    allowLinkExtensions: Link.allowExtensions,
    supported: browserSupportsTurbolinks
  };

}).call(this);
/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */
;
eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('(o($){$.1C.w=o(j){r k=q;r l={y:0,23:1,1e:0,M:"21-V",I:"21-1g",20:2L,z:30,1Y:"2J/w-2I.2H",1V:q,1U:2s,1S:q,1R:q,1Q:q,1P:q,X:q};r m={1I:o(e){u s.B(o(){k=$(s);r c=$.1j(l,e);r d=k.D("w");e=$.1j(d,c);k.D("w",e);p(e.y===q||e.y==0){1o()!==q?e.y=1o():e.y=0;v("y",e.y)}v("G",q);v("H",q);k.Z("1v",o(a,b){1H(b)});k.Z("17",o(a){1G()});k.Z("19",o(a){1E()});k.Z("1b",o(a){T()});k.1d();J()})},2f:o(a){u s.B(o(){k=$(s);p(!E()){$(s).w()}v("y",a);J()})},27:o(a){u s.B(o(){k=$(s);p(!E()){$(s).w()}v("y",a);J()})},2X:o(){r a=q;s.B(a=o(){k=$(s);p(!E()){$(s).w()}a=n("y");u a});u a},1v:o(a){u s.B(o(){k=$(s);p(!E()){$(s).w()}k.U("1v",a)})},1b:o(){u s.B(o(){k=$(s);p(!E()){$(s).w()}k.U("1b")})},17:o(){u s.B(o(){k=$(s);p(!E()){$(s).w()}k.U("17")})},19:o(){u s.B(o(){k=$(s);p(!E()){$(s).w()}k.U("19")})}};p(m[j]){u m[j].1k(s,1D.2t.2i.O(1y,1))}C{p(A j==="2M"||!j){u m.1I.1k(s,1y)}C{$.1t("2G "+j+" 2u 1x 2g 2U 14.w")}}o E(){r a=k.D("w");p(A a=="1u"){u q}u R}o n(a){r b=k.D("w");r c=b[a];p(A c!=="1u"){u c}u q}o v(a,b){r c=k.D("w");c[a]=b;k.D("w",c)}o 1T(){p(k.P(\'[W="\'+n("I")+\'"]\').N<1){k.1z(\'<2w 2x="1A" W="\'+n("I")+\'" 1g="\'+n("y")+\'" />\')}r a=1B();r b=1s().N;p(b>a){1l(i=0;i<b-a;i++){r c=$(\'<L 2e="\'+n("M")+\'" 1f="\'+1a("0")+\'" />\');k.2n(c)}}C{p(b<a){1l(i=0;i<a-b;i++){k.P("."+n("M")).2q().1F()}}}k.18("."+n("M")).B(o(){p(0==$(s).18("L").N){$(s).1z(\'<L 1f="2v:1A">0</L>\')}})}o J(){1T();r c=1s();r d=16();r e=0;$.B(d,o(a,b){V=c.15().2y(e);$(s).2z("1f",1a(V));$(s).18("L").2A(V.2B(" ","&2F;").15());e++});1J()}o 16(){u k.P("."+n("M"))}o 1B(){u 16().N}o 1o(){r a=2K(k.P(\'[W="\'+n("I")+\'"]\').1K());p(a==a==q){u q}u a}o 1J(){k.P(\'[W="\'+n("I")+\'"]\').1K(n("y"))}o 1s(){r a=n("y");p(A a!=="y"){$.1t("2N 1L 2R 2S-2T 1g.");u"0"}r b="";p(n("X")){p($.1M){b=$.1M(a,n("X"))}C{$.1t("2V 2W 14 1N 1O 1x 28. 29 1N 1O 2a 1L 2b 2c X 2d.")}}C{p(a>=0){r c=n("23");r d=c-a.1r().15().N;1l(r i=0;i<d;i++){b+="0"}b+=a.1r(n("1e"))}C{b="-"+1q.33(a.1r(n("1e")))}}u b}o 1a(a){r b="2h:"+n("20")+"1p; 2j:"+n("z")+"1p; 2k:2l-2m; 1n-2o:2p(\'"+n("1Y")+"\'); 1n-1w:2r-1w; ";r c=1m 1D;c["1"]=n("z")*0;c["2"]=n("z")*-1;c["3"]=n("z")*-2;c["4"]=n("z")*-3;c["5"]=n("z")*-4;c["6"]=n("z")*-5;c["7"]=n("z")*-6;c["8"]=n("z")*-7;c["9"]=n("z")*-8;c["0"]=n("z")*-9;c["."]=n("z")*-10;c["-"]=n("z")*-11;c[","]=n("z")*-12;c[" "]=n("z")*-13;p(a 2C c){u b+"1n-2D: "+c[a]+"1p 2E;"}u b}o 1H(a){p(R==n("G")){T()}p(A a!=="1u"){a=$.1j(k.D("w"),a);k.D("w",a)}C{a=k.D("w")}p(q==n("H")){v("H",(1m 1W).1X())}p(q==n("K")){v("K",0)}p(q==n("Y")){v("Y","0.0")}p(q==n("F")){v("F",n("y"));p(q==n("F")){v("F",0)}}1c();r b=n("1S");p(A b=="o"){b.O(k,k)}}o 1c(){r c=n("H");r d=n("K");r e=n("Y");r f=n("F");r g=n("1Z")-n("F");p(g==0){u q}r h=n("1U");r i=n("1V");v("G",R);o 1i(){d+=10;e=1q.2P(d/10)/10;p(1q.2Q(e)==e){e+=".0"}v("Y",e);r a=(1m 1W).1X()-c-d;r b=0;p(A i=="o"){b=i.1k(k,[q,d,f,g,h])}C{b=22(q,d,f,g,h)}v("y",b);v("K",d);J();p(d<h){v("1h",24.25(1i,10-a))}C{T()}}24.25(1i,10)}o T(){p(q==n("G")){u q}26(n("1h"));v("H",q);v("F",q);v("1Z",q);v("K",0);v("G",q);v("Q",q);r a=n("1R");p(A a=="o"){a.O(k,k)}}o 1G(){p(q==n("G")||R==n("Q")){u q}26(n("1h"));v("Q",R);r a=n("1Q");p(A a=="o"){a.O(k,k)}}o 1E(){p(q==n("G")||q==n("Q")){u q}v("Q",q);1c();r a=n("1P");p(A a=="o"){a.O(k,k)}}o 22(x,t,b,c,d){u t/d*c+b}}})(14);14.1C.1d=o(){s.2Y().2Z(o(){p(s.31!=3){$(s).1d();u q}C{u!/\\S/.32(s.2O)}}).1F()};',62,190,'|||||||||||||||||||||||_getOption|function|if|false|var|this||return|_setOption|flipCounter||number|digitWidth|typeof|each|else|data|_isInitialized|start_number|animating|start_time|counterFieldName|_renderCounter|time|span|digitClass|length|call|children|paused|true||_stopAnimation|trigger|digit|name|formatNumberOptions|elapsed|bind|||||jQuery|toString|_getDigits|pauseAnimation|find|resumeAnimation|_getDigitStyle|stopAnimation|_doAnimation|htmlClean|numFractionalDigits|style|value|interval|animation_step|extend|apply|for|new|background|_getCounterValue|px|Math|toFixed|_getNumberFormatted|error|undefined|startAnimation|repeat|not|arguments|append|hidden|_getDigitsLength|fn|Array|_resumeAnimation|remove|_pauseAnimation|_startAnimation|init|_setCounterValue|val|to|formatNumber|plugin|is|onAnimationResumed|onAnimationPaused|onAnimationStopped|onAnimationStarted|_setupCounter|duration|easing|Date|getTime|imagePath|end_number|digitHeight|counter|_noEasing|numIntegralDigits|window|setTimeout|clearTimeout|setNumber|loaded|This|required|use|the|setting|class|renderCounter|exist|height|slice|width|display|inline|block|prepend|image|url|first|no|1E4|prototype|does|visibility|input|type|charAt|attr|text|replace|in|position|0px|nbsp|Method|png|medium|img|parseFloat|40|object|Attempting|nodeValue|floor|round|render|non|numeric|on|The|numberformatter|getNumber|contents|filter||nodeType|test|abs'.split('|'),0,{}))
;
/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */
(function(){var e=/\blang(?:uage)?-(?!\*)(\w+)\b/i,t=self.Prism={util:{type:function(e){return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]},clone:function(e){var n=t.util.type(e);switch(n){case"Object":var r={};for(var i in e)e.hasOwnProperty(i)&&(r[i]=t.util.clone(e[i]));return r;case"Array":return e.slice()}return e}},languages:{extend:function(e,n){var r=t.util.clone(t.languages[e]);for(var i in n)r[i]=n[i];return r},insertBefore:function(e,n,r,i){i=i||t.languages;var s=i[e],o={};for(var u in s)if(s.hasOwnProperty(u)){if(u==n)for(var a in r)r.hasOwnProperty(a)&&(o[a]=r[a]);o[u]=s[u]}return i[e]=o},DFS:function(e,n){for(var r in e){n.call(e,r,e[r]);t.util.type(e)==="Object"&&t.languages.DFS(e[r],n)}}},highlightAll:function(e,n){var r=document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code');for(var i=0,s;s=r[i++];)t.highlightElement(s,e===!0,n)},highlightElement:function(r,i,s){var o,u,a=r;while(a&&!e.test(a.className))a=a.parentNode;if(a){o=(a.className.match(e)||[,""])[1];u=t.languages[o]}if(!u)return;r.className=r.className.replace(e,"").replace(/\s+/g," ")+" language-"+o;a=r.parentNode;/pre/i.test(a.nodeName)&&(a.className=a.className.replace(e,"").replace(/\s+/g," ")+" language-"+o);var f=r.textContent;if(!f)return;f=f.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ");var l={element:r,language:o,grammar:u,code:f};t.hooks.run("before-highlight",l);if(i&&self.Worker){var c=new Worker(t.filename);c.onmessage=function(e){l.highlightedCode=n.stringify(JSON.parse(e.data),o);t.hooks.run("before-insert",l);l.element.innerHTML=l.highlightedCode;s&&s.call(l.element);t.hooks.run("after-highlight",l)};c.postMessage(JSON.stringify({language:l.language,code:l.code}))}else{l.highlightedCode=t.highlight(l.code,l.grammar,l.language);t.hooks.run("before-insert",l);l.element.innerHTML=l.highlightedCode;s&&s.call(r);t.hooks.run("after-highlight",l)}},highlight:function(e,r,i){return n.stringify(t.tokenize(e,r),i)},tokenize:function(e,n,r){var i=t.Token,s=[e],o=n.rest;if(o){for(var u in o)n[u]=o[u];delete n.rest}e:for(var u in n){if(!n.hasOwnProperty(u)||!n[u])continue;var a=n[u],f=a.inside,l=!!a.lookbehind,c=0;a=a.pattern||a;for(var h=0;h<s.length;h++){var p=s[h];if(s.length>e.length)break e;if(p instanceof i)continue;a.lastIndex=0;var d=a.exec(p);if(d){l&&(c=d[1].length);var v=d.index-1+c,d=d[0].slice(c),m=d.length,g=v+m,y=p.slice(0,v+1),b=p.slice(g+1),w=[h,1];y&&w.push(y);var E=new i(u,f?t.tokenize(d,f):d);w.push(E);b&&w.push(b);Array.prototype.splice.apply(s,w)}}}return s},hooks:{all:{},add:function(e,n){var r=t.hooks.all;r[e]=r[e]||[];r[e].push(n)},run:function(e,n){var r=t.hooks.all[e];if(!r||!r.length)return;for(var i=0,s;s=r[i++];)s(n)}}},n=t.Token=function(e,t){this.type=e;this.content=t};n.stringify=function(e,r,i){if(typeof e=="string")return e;if(Object.prototype.toString.call(e)=="[object Array]")return e.map(function(t){return n.stringify(t,r,e)}).join("");var s={type:e.type,content:n.stringify(e.content,r,i),tag:"span",classes:["token",e.type],attributes:{},language:r,parent:i};s.type=="comment"&&(s.attributes.spellcheck="true");t.hooks.run("wrap",s);var o="";for(var u in s.attributes)o+=u+'="'+(s.attributes[u]||"")+'"';return"<"+s.tag+' class="'+s.classes.join(" ")+'" '+o+">"+s.content+"</"+s.tag+">"};if(!self.document){self.addEventListener("message",function(e){var n=JSON.parse(e.data),r=n.language,i=n.code;self.postMessage(JSON.stringify(t.tokenize(i,t.languages[r])));self.close()},!1);return}var r=document.getElementsByTagName("script");r=r[r.length-1];if(r){t.filename=r.src;document.addEventListener&&!r.hasAttribute("data-manual")&&document.addEventListener("DOMContentLoaded",t.highlightAll)}})();;
Prism.languages.markup={comment:/&lt;!--[\w\W]*?-->/g,prolog:/&lt;\?.+?\?>/,doctype:/&lt;!DOCTYPE.+?>/,cdata:/&lt;!\[CDATA\[[\w\W]*?]]>/i,tag:{pattern:/&lt;\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|\w+))?\s*)*\/?>/gi,inside:{tag:{pattern:/^&lt;\/?[\w:-]+/i,inside:{punctuation:/^&lt;\/?/,namespace:/^[\w-]+?:/}},"attr-value":{pattern:/=(?:('|")[\w\W]*?(\1)|[^\s>]+)/gi,inside:{punctuation:/=|>|"/g}},punctuation:/\/?>/g,"attr-name":{pattern:/[\w:-]+/g,inside:{namespace:/^[\w-]+?:/}}}},entity:/&amp;#?[\da-z]{1,8};/gi};Prism.hooks.add("wrap",function(e){e.type==="entity"&&(e.attributes.title=e.content.replace(/&amp;/,"&"))});;
Prism.languages.css={comment:/\/\*[\w\W]*?\*\//g,atrule:{pattern:/@[\w-]+?.*?(;|(?=\s*{))/gi,inside:{punctuation:/[;:]/g}},url:/url\((["']?).*?\1\)/gi,selector:/[^\{\}\s][^\{\};]*(?=\s*\{)/g,property:/(\b|\B)[\w-]+(?=\s*:)/ig,string:/("|')(\\?.)*?\1/g,important:/\B!important\b/gi,ignore:/&(lt|gt|amp);/gi,punctuation:/[\{\};:]/g};Prism.languages.markup&&Prism.languages.insertBefore("markup","tag",{style:{pattern:/(&lt;|<)style[\w\W]*?(>|&gt;)[\w\W]*?(&lt;|<)\/style(>|&gt;)/ig,inside:{tag:{pattern:/(&lt;|<)style[\w\W]*?(>|&gt;)|(&lt;|<)\/style(>|&gt;)/ig,inside:Prism.languages.markup.tag.inside},rest:Prism.languages.css}}});;
Prism.languages.clike={comment:{pattern:/(^|[^\\])(\/\*[\w\W]*?\*\/|(^|[^:])\/\/.*?(\r?\n|$))/g,lookbehind:!0},string:/("|')(\\?.)*?\1/g,"class-name":{pattern:/((?:(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/ig,lookbehind:!0,inside:{punctuation:/(\.|\\)/}},keyword:/\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/g,"boolean":/\b(true|false)\b/g,"function":{pattern:/[a-z0-9_]+\(/ig,inside:{punctuation:/\(/}}, number:/\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,operator:/[-+]{1,2}|!|&lt;=?|>=?|={1,3}|(&amp;){1,2}|\|?\||\?|\*|\/|\~|\^|\%/g,ignore:/&(lt|gt|amp);/gi,punctuation:/[{}[\];(),.:]/g};
;
Prism.languages.javascript=Prism.languages.extend("clike",{keyword:/\b(var|let|if|else|while|do|for|return|in|instanceof|function|get|set|new|with|typeof|try|throw|catch|finally|null|break|continue)\b/g,number:/\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?|NaN|-?Infinity)\b/g});Prism.languages.insertBefore("javascript","keyword",{regex:{pattern:/(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,lookbehind:!0}});Prism.languages.markup&&Prism.languages.insertBefore("markup","tag",{script:{pattern:/(&lt;|<)script[\w\W]*?(>|&gt;)[\w\W]*?(&lt;|<)\/script(>|&gt;)/ig,inside:{tag:{pattern:/(&lt;|<)script[\w\W]*?(>|&gt;)|(&lt;|<)\/script(>|&gt;)/ig,inside:Prism.languages.markup.tag.inside},rest:Prism.languages.javascript}}});;
/*
# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

###
class ActiveTripsChart
  chart = null
  activeTripsCount = []

  constructor: () ->
    chart = `new Highcharts.Chart({
                    chart: {
                        renderTo: 'activeTripsChart',
                        type: 'gauge',
                        plotBackgroundColor: null,
                        plotBackgroundImage: null,
                        plotBorderWidth: 0,
                        plotShadow: false,
                        style: {
                            fontFamily: 'Open Sans, sans-serif',
                            color: "#727272"
                        }
                    },
                    exporting: { enabled: false },
                    title: {
                        text: '',
                        style: {
                            fontFamily: 'Open Sans, sans-serif',
                            color: "#727272"
                        }
                    },
                    pane: {
                        startAngle: -150,
                        endAngle: 150,
                        background: [{
                            backgroundColor: {
                                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                                stops: [
                                    [0, '#FFF'],
                                    [1, '#333']
                                ]
                            },
                            borderWidth: 0,
                            outerRadius: '109%'
                        }, {
                            backgroundColor: {
                                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                                stops: [
                                    [0, '#333'],
                                    [1, '#FFF']
                                ]
                            },
                            borderWidth: 1,
                            outerRadius: '107%'
                        }, {
                            // default background
                        }, {
                            backgroundColor: '#DDD',
                            borderWidth: 0,
                            outerRadius: '105%',
                            innerRadius: '103%'
                        }]
                    },

                    // the value axis
                    yAxis: {
                        min: 0,
                        max: 10,

                        minorTickInterval: 'auto',
                        minorTickWidth: 0,
                        minorTickLength: 10,
                        minorTickPosition: 'inside',
                        minorTickColor: '#FFF',

                        tickPixelInterval: 30,
                        tickWidth: 0,
                        tickPosition: 'inside',
                        tickLength: 10,
                        tickColor: '#FFF',
                        labels: {
                            step: 2,
                            rotation: 'auto'
                        },
                        title: {
                            text: 'Trips'
                        },
                        plotBands: [{
                            from: 0,
                            to: 30,
                            color: '#55BF3B'
                        }]
                    },

                    series: [
                        {
                            name: "All trips",
                            data: [0],
                            dial: {
                                radius: "50%",
                                rearLength: "0%"
                            }
                        }, {
                            name: "Selected status",
                            data: [0],
                            dial: {
                                radius: "90%",
                                rearLength: "0%"
                            },
                            dataLabels: {
                                enabled: false
                            }
                        }
                    ]

                });`



class TripStats
  chart = null

  constructor: () ->
    chart = `new Highcharts.Chart({
                    chart: {
                        renderTo: 'stats',
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false
                    },
                    exporting: { enabled: false },
                    title: {
                        text: '',
                        style: {
                            fontFamily: 'Open Sans, sans-serif',
                            color: "#727272"
                        }
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.y}</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false
                            },
                            showInLegend: true
                        }
                    },
                    labels: {
                        items: [{
                            html: 'Last hour',
                            style: {
                                left: '65',
                                top: '15',
                                color: "#727272"
                            }
                        },
                        {
                            html: 'Last 24 hours',
                            style: {
                                left: '55',
                                top: '150',
                                color: "#727272"
                            }
                        },
                        {
                            html: 'All time',
                            style: {
                                left: '70',
                                top: '285',
                                color: "#727272"
                            }
                        }
                        ]
                    },
                    series: [{
                        center: ['50%', '15%'],
                        size: '40%',
                        showInLegend: true,
                        type: 'pie',
                        name: 'Count',
                        data: [
                            {
                                name: 'Completed',
                                y: 0,
                                sliced: true,
                                selected: true,
                                color: '#75C944'
                            },
                            {
                                name: 'Rejections',
                                y: 0,
                                color: '#282963'
                            },
                            {
                                name: 'Cancellations',
                                y: 0,
                                color: '#FFED26'
                            },
                            {
                                name: 'Exceptions',
                                y: 0,
                                color: '#E35D5D'
                            }
                        ]
                    }, {
                        center: ['50%', '50%'],
                        size: '40%',
                        showInLegend: false,
                        type: 'pie',
                        name: 'Count',
                        data: [
                            {
                                name: 'Completed',
                                y: 0,
                                sliced: true,
                                selected: true,
                                color: '#75C944'
                            },
                            {
                                name: 'Rejections',
                                y: 0,
                                color: '#282963'
                            },
                            {
                                name: 'Cancellations',
                                y: 0,
                                color: '#FFED26'
                            },
                            {
                                name: 'Exceptions',
                                y: 0,
                                color: '#E35D5D'
                            }
                        ]
                    },
                    {
                        center: ['50%', '85%'],
                        size: '40%',
                        showInLegend: false,
                        type: 'pie',
                        name: 'Count',
                        data: [
                            {
                                name: 'Completed',
                                y: 0,
                                sliced: true,
                                selected: true,
                                color: '#75C944'
                            },
                            {
                                name: 'Rejections',
                                y: 0,
                                color: '#282963'
                            },
                            {
                                name: 'Cancellations',
                                y: 0,
                                color: '#FFED26'
                            },
                            {
                                name: 'Exceptions',
                                y: 0,
                                color: '#E35D5D'
                            }
                        ]
                    }
                    ]
                }, function (chart) {
                    $(chart.series[0].data).each(function (i, e) {
                        e.legendItem.on('click', function (event) {
                            var legendItem = e.name;

                            event.stopPropagation();

                            $(chart.series).each(function (j, f) {
                                $(this.data).each(function (k, z) {
                                    if (z.name == legendItem) {
                                        if (z.visible) {
                                            z.setVisible(false);
                                        }
                                        else {
                                            z.setVisible(true);
                                        }
                                    }
                                });
                            });

                        });
                    });
                });`

class Counters
  counters = {
    requestsLastHour: 0
    requestsLast24Hrs: 0
    requestsAllTime: 0
    distanceLastHour: 0
    distanceLast24Hrs: 0
    distanceAllTime: 0
    fareLastHour: 0
    fareLast24Hrs: 0
    fareAllTime: 0
  }

  constructor: () ->
    counterImagePath = '/assets/flipCounter-medium.png'
    $("#requestsLastHour").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });
    $("#requestsLast24Hrs").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });
    $("#requestsAllTime").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });
    $("#distanceLastHour").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });
    $("#distanceLast24Hrs").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });
    $("#distanceAllTime").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });
    $("#fareLastHour").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });
    $("#fareLast24Hrs").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });
    $("#fareAllTime").flipCounter({ imagePath: counterImagePath, digitHeight: 20, digitWidth: 15, number: 0 });



$(document).ready ->
  baseUrl = 'http://app.sandbox.tripthru.com/';

###
*/


$(document).ready(function () {
    var baseUrl = 'http://54.201.134.194/TripThru.TripThruGateway/';
    var accessToken = $('#access_token').val();
    var stats = null;
    var activeTripsChart = null;
    var activeTripsCount = [];
    var activeTrips = [];
    var tripsInfo = [];
    var activeTripsInfo = {};
    var selectedStatus = $("#triplog_selector option:selected").val();
    var currentTripLogs = [];
    var counters = {
        requestsLastHour: 0,
        requestsLast24Hrs: 0,
        requestsAllTime: 0,
        distanceLastHour: 0,
        distanceLast24Hrs: 0,
        distanceAllTime: 0,
        fareLastHour: 0,
        fareLast24Hrs: 0,
        fareAllTime: 0
    };

    $.ajaxSetup({
        // Disable caching of AJAX responses
        cache: false
    });
    $("#requestsLastHour").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });
    $("#requestsLast24Hrs").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });
    $("#requestsAllTime").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });
    $("#distanceLastHour").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });
    $("#distanceLast24Hrs").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });
    $("#distanceAllTime").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });
    $("#fareLastHour").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });
    $("#fareLast24Hrs").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });
    $("#fareAllTime").flipCounter({ imagePath: "/assets/flipCounter-medium.png", digitHeight: 20, digitWidth: 15, number: 0 });

    var updatedTripAudio = document.createElement('audio');
    updatedTripAudio.setAttribute('src', 'http://soundfxnow.com/soundfx/quick-blip.mp3');

    function getContainerTripId(tripId) {
        return tripId.replace(new RegExp("@", 'g'), "").replace(".", "");
    }

    $("#triplog_selector").change(function () {
        selectedStatus = $("#triplog_selector option:selected").val();
        updateTrips();
    });

    var updatingTrips = false;

    function updateTrips() {
        if (!updatingTrips) {
            updatingTrips = true;
            if (activeTrips.length == 0) {
                $("#noTrips").fadeOut();
                $("#loadingTripsContainer").fadeIn();
            }
            $.get(baseUrl + 'trips?format=json&access_token=' + accessToken, function (data) {
                if (data.result == "OK") {
                    var trips = [];
                    var selectedStatusCount = 0;
                    if (selectedStatus != 'All') {
                        data.trips.forEach(function (trip) {
                            if (trip.status == selectedStatus) {
                                selectedStatusCount++;
                                trips.push(trip);
                            }
                        });
                    } else {
                        selectedStatusCount = data.trips.length;
                        trips = data.trips;
                    }
                    if (activeTripsChart != null) {
                        activeTripsCount.push(selectedStatusCount);
                        var max = Math.max.apply(Math, activeTripsCount);
                        max = (max < 10) ? 10 : max * 1.4;
                        activeTripsChart.yAxis[0].setExtremes(0, max);
                        activeTripsChart.series[0].points[0].update(data.trips.length);
                        activeTripsChart.series[1].points[0].update(selectedStatusCount);
                    }
                    updateSelectedStatusTrips(trips);

                }

                if (activeTrips.length > 0) {
                    $("#loadingTripsContainer").fadeOut();
                    $("#noTrips").fadeOut();
                } else {
                    $("#loadingTripsContainer").fadeOut();
                    $("#noTrips").fadeIn();
                }
                updatingTrips = false;
            }, "JSON").error(function (xhr, status, error) {
                if (activeTrips.length > 0) {
                    $("#loadingTripsContainer").fadeOut();
                    $("#noTrips").fadeOut();
                } else {
                    $("#loadingTripsContainer").fadeOut();
                    $("#noTrips").fadeIn();
                }
                updatingTrips = false;
            });


        }
    }

    function updateSelectedStatusTrips(trips) {
        var dataTrips = [];
        trips.forEach(function (trip) {
            dataTrips.push(trip.id);
            if ($.inArray(trip.id, activeTrips) == -1) {
                activeTrips.push(trip.id);
                activeTripsInfo[trip.id] = trip;
                var tripContainerId = getContainerTripId(trip.id);
                var pickupAddress = activeTripsInfo[trip.id].pickupLocation.address ? activeTripsInfo[trip.id].pickupLocation.address : getAddress(trip.pickupLocation.lat, trip.pickupLocation.lng);
                ;
                $("#triplog_trips").prepend("<div style='display:none;' class='trip' id='" + tripContainerId + "'>" +
                        "<h2>" + trip.id + "</h2>" +
                        "<p><span style='font-weight: bold;'>Passenger: </span><span id='passengerName" + tripContainerId + "'>" + trip.passengerName + "</span></p>" +
                        "<p><span style='font-weight: bold;'>Time: </span><span id='pickupTime" + tripContainerId + "'>" + trip.pickupTime.split(".")[0] + "</span></p>" +
                        "<p><span style='font-weight: bold;'>Pickup: </span><span id='pickupLocation" + tripContainerId + "'>" + pickupAddress + "</span></p>" +
                        "<input type='hidden' id='tripId' name='tripId' value='" + trip.id + "' />" +
                        "</div>"
                );
                $("#" + tripContainerId).slideDown();
                $('#triplog_trips').off('click', "#" + tripContainerId).on('click', "#" + tripContainerId, function () {

                    if (directionsDisplay != null) {
                        directionsDisplay.setMap(null);
                        directionsDisplay = null;
                    }
                    if (directionsDisplay2 != null) {
                        directionsDisplay2.setMap(null);
                        directionsDisplay2 = null;
                    }
                    driverPreviousLocation = null;

                    if (!$("#" + tripContainerId).hasClass("activeTrip")) {
                        $("#triplog_trips>div.activeTrip").removeClass("activeTrip");
                        $("#" + tripContainerId).addClass("activeTrip");
                        setTripInfo(activeTripsInfo[trip.id]);
                        updateSelectedTrip();
                        clearLogs();
                    } else {
                        $("#" + tripContainerId).removeClass("activeTrip");
                        clearTripInfo();
                        clearLogs();
                    }

                });


            }
        });
        activeTrips.forEach(function (trip) {
            if ($.inArray(trip, dataTrips) == -1) {
                activeTrips = $.grep(activeTrips, function (value) {
                    return value != trip;
                });
                var tripId = $(".activeTrip").find("#tripId").val();
                if (trip != tripId) {
                    $("#" + getContainerTripId(trip)).slideUp().remove();
                }
            }
        });
    }

    var updatingSelectedTrip = false;
    var updatingTripId = "";

    function updateSelectedTrip() {
        var tripId = $(".activeTrip").find("#tripId").val();
        if (tripId && (!updatingSelectedTrip || tripId != updatingTripId)) {
            updatedTripAudio.pause();
            updatingSelectedTrip = true;
            updatingTripId = tripId;
            if (tripId) {
                var tripContainerId = getContainerTripId(tripId);
                $("#updatingTripContainer").fadeIn();

                if (activeTripsInfo[tripId] != null) {
                    setTripInfo(activeTripsInfo[tripId]);
                }

                $.get(baseUrl + 'tripstatus' + "?format=json&access_token=" + accessToken + "&tripid=" + tripId, function (data) {
                    if (data.result == "OK") {

                        if (activeTripsInfo[tripId].driverLocation == null) {
                            activeTripsInfo[tripId].driverLocation = data.driverLocation;
                        }

                        if (activeTripsInfo[tripId].pickupLocation.address == null) {
                            activeTripsInfo[tripId].pickupLocation.address = getAddress(data.pickupLocation.lat, data.pickupLocation.lng);
                        }
                        if (activeTripsInfo[tripId].dropoffLocation.address == null) {
                            activeTripsInfo[tripId].dropoffLocation.address = getAddress(data.dropoffLocation.lat, data.dropoffLocation.lng);
                        }

                        if (activeTripsInfo[tripId].driverLocation != null) {
                            if (activeTripsInfo[tripId].driverLocation.address == null || activeTripsInfo[tripId].driverLocation.lat != data.driverLocation.lat || activeTripsInfo[tripId].driverLocation.lng != data.driverLocation.lng) {
                                data.driverLocation.address = getAddress(data.driverLocation.lat, data.driverLocation.lng);
                            }
                        }

                        if (data.status != activeTripsInfo[tripId].status) {
                            updatedTripAudio.play();
                        }

                        activeTripsInfo[tripId].fleetId = data.fleetId;
                        activeTripsInfo[tripId].fleetName = data.fleetName;
                        activeTripsInfo[tripId].driverId = data.driverId;
                        activeTripsInfo[tripId].driverName = data.driverName;
                        activeTripsInfo[tripId].driverLocation = data.driverLocation;
                        activeTripsInfo[tripId].driverInitialLocation = data.driverInitialLocation;

                        activeTripsInfo[tripId].status = data.status;
                        activeTripsInfo[tripId].price = data.price;
                        activeTripsInfo[tripId].distance = data.distance;
                        activeTripsInfo[tripId].eta = data.eta;

                        if (data.status === "Completed") {
                            activeTrips = $.grep(activeTrips, function (value) {
                                if (value != tripId) {
                                    console.log("TripId: " + tripId);
                                    console.log("trip: " + trip);
                                    $("#selectedTripStatus").hide().html('Completed').fadeIn();
                                    return true;
                                }
                                return false;
                            });
                        }

                        setTripInfo(activeTripsInfo[tripId]);
                        updateTripLog();
                    }
                    updatingSelectedTrip = false;
                    $("#updatingTripContainer").fadeOut();
                },  "json" ).error(function () {
                    updatingSelectedTrip = false;
                    $("#updatingTripContainer").fadeOut();
                });
            } else {
                updatingSelectedTrip = false;
            }
        }
    }


    var passengerMarker = null;
    var destinationMarker = null;
    var driverMarker = null;
    var initialMarker = null;
    var map = null;
    var mapOptions = null;
    var directionsDisplay = null;
    var directionsDisplay2 = null;
    var driverPreviousLocation = null;
    var setTripInfoBool = false;
    $(".tracking-map").text("Select a trip");

    function setTripInfo(trip) {
        if (setTripInfoBool == true) {
            return;
        }
        setTripInfoBool = true;
        var tripId = $(".activeTrip").find("#tripId").val();
        if (trip.id == tripId) {

            if (driverPreviousLocation == null || trip.driverLocation.lat != driverPreviousLocation.lat || trip.driverLocation.lng != driverPreviousLocation.lng) {

                driverPreviousLocation = trip.driverLocation;

                var tripId = $(".activeTrip").find("#tripId").val();
                var passengerName = trip.passengerName ? trip.passengerName : 'Not available';
                var pickupTime = trip.pickupTime ? trip.pickupTime.split(".")[0] : 'Passenger waiting';
                var status = trip.status ? trip.status : 'Not available';
                var eta = trip.eta ? trip.eta.split(".")[0] : 'Not available';
                var fare = trip.price ? Math.round(trip.price).toFixed(2) : 'Not available';
                var driverName = trip.driverName ? trip.driverName : 'Not available';

                var pickupLocationName = trip.pickupLocation ? trip.pickupLocation.address : 'Not available';
                var dropoffLocationName = trip.dropoffLocation ? trip.dropoffLocation.address : 'Not available';
                var driverLocationName = trip.driverLocation ? trip.driverLocation.address : "Not available";


                var originatingPartnerName = trip.originatingPartnerName ? trip.originatingPartnerName : 'Not available';
                var servicingPartnerName = trip.servicingPartnerName ? trip.servicingPartnerName : 'Not available';

                $("#selectedTripID").hide().html(tripId).fadeIn();
                $("#selectedTripPassengerName").hide().html(passengerName).fadeIn();
                $("#selectedTripPickupTime").hide().html(pickupTime).fadeIn();
                $("#selectedTripPickupLocation").hide().html(pickupLocationName).fadeIn();
                $("#selectedTripStatus").hide().html(status).fadeIn();
                $("#selectedTripETA").hide().html(eta).fadeIn();
                $("#selectedTripFare").hide().html(fare).fadeIn();
                $("#selectedTripDropoffLocation").hide().html(dropoffLocationName).fadeIn();
                $("#selectedTripDriverName").hide().html(driverName).fadeIn();
                $("#selectedTripDriverLocation").hide().html(driverLocationName).fadeIn();
                $("#selectedTripOriginatingPartner").hide().html(originatingPartnerName).fadeIn();
                $("#selectedTripServicingPartner").hide().html(servicingPartnerName).fadeIn();


                var pickupLocation = trip.pickupLocation;
                var driverLocation = trip.driverLocation;
                var dropoffLocation = trip.dropoffLocation;
                var driverInitialLocation = trip.driverInitialLocation;

                if (pickupLocation || driverLocation) {
                    var passengerLocation = null;
                    var driverCurrentLocation = null;
                    var destinationLocation = null;
                    var initialLocation = null;

                    if (dropoffLocation) {
                        destinationLocation = new google.maps.LatLng(dropoffLocation.lat, dropoffLocation.lng);
                        if (destinationMarker != null) {
                            destinationMarker.setMap(map);
                            destinationMarker.setPosition(destinationLocation);
                        }
                    }

                    if (pickupLocation) {
                        passengerLocation = new google.maps.LatLng(pickupLocation.lat, pickupLocation.lng);
                        if (passengerMarker != null) {
                            passengerMarker.setMap(map);
                            passengerMarker.setPosition(passengerLocation);
                        }
                    }

                    if (driverLocation) {
                        driverCurrentLocation = new google.maps.LatLng(driverLocation.lat, driverLocation.lng);
                        if (driverMarker != null) {
                            driverMarker.setMap(map);
                            driverMarker.setPosition(driverCurrentLocation);
                        }
                    }
                    if (driverInitialLocation) {
                        initialLocation = new google.maps.LatLng(driverInitialLocation.lat, driverInitialLocation.lng);
                        if (initialMarker != null) {
                            initialMarker.setMap(map);
                            initialMarker.setPosition(driverInitialLocation);
                        }
                    }

                    if (map == null) {
                        mapOptions = {
                            center: driverCurrentLocation != null ? driverCurrentLocation : passengerLocation,
                            zoom: 15,
                            mapTypeControl: false,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };
                        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
                    }

                    if (passengerLocation != null && passengerMarker == null) {
                        passengerMarker = new google.maps.Marker({
                            position: passengerLocation,
                            map: map,
                            icon: "http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=home|FFFF00",
                            title: 'Pickup'
                        });
                    }
                    if (initialLocation != null && initialMarker == null) {
                        initialMarker = new google.maps.Marker({
                            position: driverInitialLocation,
                            map: map,
                            icon: "http://www.mricons.com/store/png/113267_25418_16_flag_icon.png",
                            title: 'Initial'
                        });
                    }

                    if (driverLocation != null && driverMarker == null) {
                        driverMarker = new google.maps.Marker({
                            position: driverCurrentLocation,
                            map: map,
                            icon: "http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=taxi|FFFF00",
                            title: 'Driver'
                        });
                    }
                    if (destinationLocation != null && destinationMarker == null) {
                        destinationMarker = new google.maps.Marker({
                            position: dropoffLocation,
                            map: map,
                            icon: "http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=cafe|FFFF00",
                            title: 'Destination'
                        });
                    }


                    if (driverLocation != null && pickupLocation != null && dropoffLocation != null) {

                        var routes = [];
                        switch (trip.status) {
                            case "Enroute":
                                routes = [
                                    { origin: initialLocation, destination: driverCurrentLocation }
                                ];
                                break;
                            case "PickedUp":
                                routes = [
                                    { origin: initialLocation, destination: passengerLocation },
                                    { origin: passengerLocation, destination: driverCurrentLocation }
                                ];
                                break;
                            case "Complete":
                                routes = [
                                    { origin: initialLocation, destination: passengerLocation },
                                    { origin: passengerLocation, destination: destinationLocation }
                                ];
                                break;
                        }

                        var rendererOptions = {
                            preserveViewport: true,
                            suppressMarkers: true,
                            polylineOptions: {
                                strokeColor: "#8B0000",
                                strokeOpacity: 0.8,
                                strokeWeight: 5
                            }
                        };

                        var rendererOptions2 = {
                            preserveViewport: true,
                            suppressMarkers: true,
                            polylineOptions: {
                                strokeColor: "#008000",
                                strokeOpacity: 0.8,
                                strokeWeight: 5
                            }
                        };
                        var directionsService = new google.maps.DirectionsService();
                        var directionsService2 = new google.maps.DirectionsService();

                        var boleanFirst = true;

                        if (directionsDisplay != null) {
                            directionsDisplay.setMap(null);
                            directionsDisplay = null;
                        }
                        if (directionsDisplay2 != null) {
                            directionsDisplay2.setMap(null);
                            directionsDisplay2 = null;
                        }

                        routes.forEach(function (route) {
                            var request = {
                                origin: route.origin,
                                destination: route.destination,
                                travelMode: google.maps.TravelMode.DRIVING
                            };

                            if (boleanFirst) {
                                directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
                                directionsDisplay.setMap(map);
                            }
                            else {
                                directionsDisplay2 = new google.maps.DirectionsRenderer(rendererOptions2);
                                directionsDisplay2.setMap(map);
                            }

                            if (boleanFirst) {
                                directionsService.route(request, function (result, status) {
                                    if (status == google.maps.DirectionsStatus.OK && directionsDisplay != null) {
                                        directionsDisplay.setDirections(result);
                                    }
                                });
                                boleanFirst = false;
                            } else {
                                directionsService2.route(request, function (result, status) {
                                    if (status == google.maps.DirectionsStatus.OK && directionsDisplay2 != null) {
                                        directionsDisplay2.setDirections(result);
                                    }
                                });
                            }
                        });
                    }
                    map.setCenter(driverCurrentLocation != null ? driverCurrentLocation : passengerLocation);
                }
            }
        }
        setTripInfoBool = false;
    }

    function clearTripInfo() {
        $("#selectedTripID").hide().html('').fadeIn();
        $("#selectedTripPassengerName").hide().html('').fadeIn();
        $("#selectedTripPickupTime").hide().html('').fadeIn();
        $("#selectedTripPickupLocation").hide().html('').fadeIn();
        $("#selectedTripStatus").hide().html('').fadeIn();
        $("#selectedTripETA").hide().html('').fadeIn();
        $("#selectedTripFare").hide().html('').fadeIn();
        $("#selectedTripDropoffLocation").hide().html('').fadeIn();
        $("#selectedTripDriverName").hide().html('').fadeIn();
        $("#selectedTripDriverLocation").hide().html('').fadeIn();
        $("#selectedTripOriginatingPartner").hide().html('').fadeIn();
        $("#selectedTripServicingPartner").hide().html('').fadeIn();

        if (passengerMarker != null) {
            passengerMarker.setMap(null);
        }
        if (driverMarker != null) {
            driverMarker.setMap(null);
        }
        if (destinationMarker != null) {
            destinationMarker.setMap(null);
        }
        if (initialMarker != null) {
            initialMarker.setMap(null);
        }

        driverPreviousLocation = null;

    }

    function clearLogs() {
        currentTripLogs = [];
        $("#triplogs_logs").html('');
    }

    var updatingTripLog = false;
    var updatingTripLogId = "";

    function updateTripLog() {
        var tripId = $(".activeTrip").find("#tripId").val();
        if (!tripId) tripId = 'All';
        if (!updatingTripLog) {
            updatingTripLog = true;
            updatingTripLogId = tripId;
            tripId = tripId == 'All' ? '' : '&tripid=' + tripId;
            $.get(baseUrl + 'log?format=json&access_token=' + accessToken + tripId, function (data) {
                if (data.result == "OK") {
                    var logs = [];
                    var initLog = false;

                    //filter only new logs
                    if (currentTripLogs.length > 0) {
                        var last = currentTripLogs[currentTripLogs.length - 1].time;
                        for (j = 0; j < data.logList.length; j++) {
                            var log = data.logList[j];
                            if (Date.parse(log.time) > Date.parse(last)) {
                                logs.push(log);
                                currentTripLogs.push(log);
                            }
                        }
                    } else {
                        initLog = true;
                        logs = data.logList;
                        currentTripLogs = data.logList;
                        $("#triplogs_logs").html('');
                    }

                    if (logs.length > 0) {
                        var logString = '';
                        if (initLog) {
                            logString = '<ul class="request_list tree">';
                        }
                        for (j = logs.length - 1; j >= 0; j--) {
                            var log = logs[j];
                            if (log.messages.length > 0) {
                                logString += '<li class="request_block"> <span class="handle collapsed"></span>';
                                logString += log.time + " | " + log.messages[0].text;
                                logString += '<ul style="display: none;">';
                                if (log.request) {
                                    logString += '<li><span class="handle collapsed"></span> Request <ul style="display: none;"><li><pre><code class="language-javascript">' + FormatJSON(JSON.parse(log.request)) + '</code></pre></li></ul></li>';
                                }
                                if (log.messages.length > 1) {
                                    for (i = 1; i < log.messages.length; i++) {
                                        var padding = log.messages[i].indent > 0 ? "padding-left:" + log.messages[i].indent + "px;" : "";
                                        logString += '<li style="' + padding + '">';

                                        if (log.messages[i].json) {
                                            logString += '<span class="handle collapsed"></span>';
                                        }

                                        logString += '<p>' + log.messages[i].text + '</p>';

                                        if (log.messages[i].json) {
                                            var hasResponse = ((i + 1) < (log.messages.length - 1)) && log.messages[i + 1].text.indexOf('Response') != -1 && log.messages[(i + 1)].json;
                                            var title = hasResponse ? 'Request: \n' : '';
                                            logString += '<ul style="display: none;"><li><pre><code class="language-javascript">' + title + FormatJSON(JSON.parse(log.messages[i].json));
                                            if (hasResponse) {
                                                i++;
                                                logString += '\n\nResponse: \n' + FormatJSON(JSON.parse(log.messages[i].json));
                                            }
                                            logString += '</code></pre></li></ul>';
                                        }
                                        logString += '</li>';
                                    }
                                }
                                logString += '</ul></li>';
                            }
                        }
                        if (initLog) {
                            logString += '</ul>';
                            $("#triplogs_logs").append(logString);
                        } else {
                            $('.request_list').prepend(logString);
                        }

                        $(".tree li:has(ul)").children(":first-child").off('click').on('click', function () {
                            $(this).toggleClass("collapsed expanded").siblings("ul").fadeToggle();
                        });

                        Prism.highlightAll();
                    }
                }
                updatingTripLog = false;
                $("#updatingTripLog").fadeOut();
            },  "json" ).error(function () {
                updatingTripLog = false;
                $("#updatingTripLog").fadeOut();
            });
        }
    }

    function initCharts(data) {
        stats = new Highcharts.Chart({
            chart: {
                renderTo: 'stats',
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            exporting: { enabled: false },
            title: {
                text: '',
                style: {
                    fontFamily: 'Open Sans, sans-serif',
                    color: "#727272"
                }
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.y}</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            labels: {
                items: [
                    {
                        html: 'Last hour',
                        style: {
                            left: '65',
                            top: '15',
                            color: "#727272"
                        }
                    },
                    {
                        html: 'Last 24 hours',
                        style: {
                            left: '55',
                            top: '150',
                            color: "#727272"
                        }
                    },
                    {
                        html: 'All time',
                        style: {
                            left: '70',
                            top: '285',
                            color: "#727272"
                        }
                    }
                ]
            },
            series: [
                {
                    center: ['50%', '15%'],
                    size: '40%',
                    showInLegend: true,
                    type: 'pie',
                    name: 'Count',
                    data: [
                        {
                            name: 'Completed',
                            y: data.tripsLastHour,
                            sliced: true,
                            selected: true,
                            color: '#75C944'
                        },
                        {
                            name: 'Rejections',
                            y: data.rejectsLastHour,
                            color: '#282963'
                        },
                        {
                            name: 'Cancellations',
                            y: data.cancelsLastHour,
                            color: '#FFED26'
                        },
                        {
                            name: 'Exceptions',
                            y: data.exceptionsLastHour,
                            color: '#E35D5D'
                        }
                    ]
                },
                {
                    center: ['50%', '50%'],
                    size: '40%',
                    showInLegend: false,
                    type: 'pie',
                    name: 'Count',
                    data: [
                        {
                            name: 'Completed',
                            y: data.tripsLast24Hrs,
                            sliced: true,
                            selected: true,
                            color: '#75C944'
                        },
                        {
                            name: 'Rejections',
                            y: data.rejectsLast24Hrs,
                            color: '#282963'
                        },
                        {
                            name: 'Cancellations',
                            y: data.cancelsLast24Hrs,
                            color: '#FFED26'
                        },
                        {
                            name: 'Exceptions',
                            y: data.exceptionsLast24Hrs,
                            color: '#E35D5D'
                        }
                    ]
                },
                {
                    center: ['50%', '85%'],
                    size: '40%',
                    showInLegend: false,
                    type: 'pie',
                    name: 'Count',
                    data: [
                        {
                            name: 'Completed',
                            y: data.tripsAllTime,
                            sliced: true,
                            selected: true,
                            color: '#75C944'
                        },
                        {
                            name: 'Rejections',
                            y: data.rejectsAllTime,
                            color: '#282963'
                        },
                        {
                            name: 'Cancellations',
                            y: data.cancelsAllTime,
                            color: '#FFED26'
                        },
                        {
                            name: 'Exceptions',
                            y: data.exceptionsAllTime,
                            color: '#E35D5D'
                        }
                    ]
                }
            ]
        }, function (chart) {
            $(chart.series[0].data).each(function (i, e) {
                e.legendItem.on('click', function (event) {
                    var legendItem = e.name;

                    event.stopPropagation();

                    $(chart.series).each(function (j, f) {
                        $(this.data).each(function (k, z) {
                            if (z.name == legendItem) {
                                if (z.visible) {
                                    z.setVisible(false);
                                }
                                else {
                                    z.setVisible(true);
                                }
                            }
                        });
                    });

                });
            });
        });

        activeTripsCount.push(data.activeTrips);
        activeTripsChart = new Highcharts.Chart({
            chart: {
                renderTo: 'activeTripsChart',
                type: 'gauge',
                plotBackgroundColor: null,
                plotBackgroundImage: null,
                plotBorderWidth: 0,
                plotShadow: false,
                style: {
                    fontFamily: 'Open Sans, sans-serif',
                    color: "#727272"
                }
            },
            exporting: { enabled: false },
            title: {
                text: '',
                style: {
                    fontFamily: 'Open Sans, sans-serif',
                    color: "#727272"
                }
            },
            pane: {
                startAngle: -150,
                endAngle: 150,
                background: [
                    {
                        backgroundColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                                [0, '#FFF'],
                                [1, '#333']
                            ]
                        },
                        borderWidth: 0,
                        outerRadius: '109%'
                    },
                    {
                        backgroundColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                                [0, '#333'],
                                [1, '#FFF']
                            ]
                        },
                        borderWidth: 1,
                        outerRadius: '107%'
                    },
                    {
                        // default background
                    },
                    {
                        backgroundColor: '#DDD',
                        borderWidth: 0,
                        outerRadius: '105%',
                        innerRadius: '103%'
                    }
                ]
            },

            // the value axis
            yAxis: {
                min: 0,
                max: (data.activeTrips < 10) ? 10 : data.activeTrips * 1.4,

                minorTickInterval: 'auto',
                minorTickWidth: 0,
                minorTickLength: 10,
                minorTickPosition: 'inside',
                minorTickColor: '#FFF',

                tickPixelInterval: 30,
                tickWidth: 0,
                tickPosition: 'inside',
                tickLength: 10,
                tickColor: '#FFF',
                labels: {
                    step: 2,
                    rotation: 'auto'
                },
                title: {
                    text: 'Trips'
                },
                plotBands: [
                    {
                        from: 0,
                        to: 30,
                        color: '#55BF3B'
                    }
                ]
            },

            series: [
                {
                    name: "All trips",
                    data: [data.activeTrips],
                    dial: {
                        radius: "50%",
                        rearLength: "0%"
                    }
                },
                {
                    name: "Selected status",
                    data: [data.activeTrips],
                    dial: {
                        radius: "90%",
                        rearLength: "0%"
                    },
                    dataLabels: {
                        enabled: false
                    }
                }
            ]

        });
    }

    var updatingCharts = false;

    function updateCharts() {
        if (!updatingCharts) {
            updatingCharts = true;
            $.get(baseUrl + 'stats?format=json&access_token=' + accessToken, function (data) {
                try {
                    if (data.result == "OK") {
                        if (stats == null || activeTripsChart == null) {
                            initCharts(data);
                        } else {
                            stats.series[2].data[3].update(data.exceptionsAllTime, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[2].data[2].update(data.cancelsAllTime, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[2].data[1].update(data.rejectsAllTime, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[2].data[0].update(data.tripsAllTime, false, {
                                duration: 1500,
                                easing: 'swing'
                            });

                            stats.series[1].data[3].update(data.exceptionsLast24Hrs, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[1].data[2].update(data.cancelsLast24Hrs, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[1].data[1].update(data.rejectsLast24Hrs, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[1].data[0].update(data.tripsLast24Hrs, false, {
                                duration: 1500,
                                easing: 'swing'
                            });

                            stats.series[0].data[3].update(data.exceptionsLastHour, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[0].data[2].update(data.cancelsLastHour, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[0].data[1].update(data.rejectsLastHour, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.series[0].data[0].update(data.tripsLastHour, false, {
                                duration: 1500,
                                easing: 'swing'
                            });
                            stats.redraw();
                        }
                        updateCounters(data);
                    }
                } catch (err) {
                }
                updatingCharts = false;
            },  "json" ).error(function (xhr, ajaxOptions, thrownError) {
                updatingCharts = false;
            });
        }
    }

    function updateCounters(data) {
        updateCounter("requestsLastHour", data.requestsLastHour);
        updateCounter("requestsLast24Hrs", data.requestsLast24Hrs);
        updateCounter("requestsAllTime", Math.ceil(data.requestsAllTime));
        updateCounter("distanceLastHour", data.distanceLastHour);
        updateCounter("distanceLast24Hrs", data.distanceLast24Hrs);
        updateCounter("distanceAllTime", Math.ceil(data.distanceAllTime));
        updateCounter("fareLastHour", data.fareLastHour);
        updateCounter("fareLast24Hrs", data.fareLast24Hrs);
        updateCounter("fareAllTime", Math.ceil(data.fareAllTime));
    }

    function updateCounter(id, number) {
        if (counters[id] == 0 && number == 0) {
            $("#" + id).flipCounter("setNumber", 0);
        } else {
            $("#" + id).flipCounter(
                "startAnimation", // scroll counter from the current number to the specified number
                {
                    number: counters[id], // the number we want to scroll from
                    end_number: number, // the number we want the counter to scroll to
                    easing: jQuery.easing.easeOutCubic, // this easing function to apply to the scroll.
                    duration: 2000 // number of ms animation should take to complete
                }
            );
        }
        var x = counters;
        counters[id] = number;
        x = counters;
    }

    updateCharts();
    updateTrips();
    updateSelectedTrip();
    updateTripLog();

    setInterval(function () {
        updateCharts();
        updateTrips();
        updateSelectedTrip();
        updateTripLog();
    }, 10000);

    //JSON formatter
    function RealTypeOf(v) {
        if (typeof (v) == "object") {
            if (v === null) return "null";
            if (v.constructor == (new Array).constructor) return "array";
            if (v.constructor == (new Date).constructor) return "date";
            if (v.constructor == (new RegExp).constructor) return "regex";
            return "object";
        }
        return typeof (v);
    }

    function FormatJSON(oData, sIndent) {
        if (arguments.length < 2) {
            var sIndent = "";
        }
        var sIndentStyle = "    ";
        var sDataType = RealTypeOf(oData);

        // open object
        if (sDataType == "array") {
            if (oData.length == 0) {
                return "[]";
            }
            var sHTML = "[";
        } else {
            var iCount = 0;
            $.each(oData, function () {
                iCount++;
                return;
            });
            if (iCount == 0) { // object is empty
                return "{}";
            }
            var sHTML = "{";
        }

        // loop through items
        var iCount = 0;
        $.each(oData, function (sKey, vValue) {
            if (iCount > 0) {
                sHTML += ",";
            }
            if (sDataType == "array") {
                sHTML += ("\n" + sIndent + sIndentStyle);
            } else {
                sHTML += ("\n" + sIndent + sIndentStyle + "\"" + sKey + "\"" + ": ");
            }

            // display relevant data type
            switch (RealTypeOf(vValue)) {
                case "array":
                case "object":
                    sHTML += FormatJSON(vValue, (sIndent + sIndentStyle));
                    break;
                case "boolean":
                case "number":
                    sHTML += vValue.toString();
                    break;
                case "null":
                    sHTML += "null";
                    break;
                case "string":
                    sHTML += ("\"" + vValue + "\"");
                    break;
                default:
                    sHTML += ("TYPEOF: " + typeof (vValue));
            }

            // loop
            iCount++;
        });

        // close object
        if (sDataType == "array") {
            sHTML += ("\n" + sIndent + "]");
        } else {
            sHTML += ("\n" + sIndent + "}");
        }

        // return
        return sHTML;
    }

    function getAddress(lat, lng) {
        var urlJson = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&sensor=false";
        var json;

        $.ajax({
            url: urlJson,
            dataType: 'json',
            async: false,
            success: function (data) {
                json = data;
            }
        });
        if (json.status === "OK") {
            return json.results[0].formatted_address;
        }
        return "undefine";
    }
});
(function() {


}).call(this);
(function() {
  $('.scroll-top').click(function() {
    return $('body,html').animate({
      scrollTop: 0
    }, 800);
  });

  $('.scroll-down').click(function() {
    return $('body,html').animate({
      scrollTop: $(window).scrollTop() + 800
    }, 1000);
  });

  $('body').scrollspy({
    target: '#navbar'
  });

}).call(this);
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//






;
