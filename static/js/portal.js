/*
* Project: Bootstrap Notify = v3.1.3
* Description: Turns standard Bootstrap alerts into "Growl-like" notifications.
* Author: Mouse0270 aka Robert McIntosh
* License: MIT License
* Website: https://github.com/mouse0270/bootstrap-growl
*/
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// Node/CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {
	// Create the defaults once
	var defaults = {
			element: 'body',
			position: null,
			type: "info",
			allow_dismiss: true,
			newest_on_top: false,
			showProgressbar: false,
			placement: {
				from: "top",
				align: "right"
			},
			offset: 20,
			spacing: 10,
			z_index: 1031,
			delay: 5000,
			timer: 1000,
			url_target: '_blank',
			mouse_over: null,
			animate: {
				enter: 'animated fadeInDown',
				exit: 'animated fadeOutUp'
			},
			onShow: null,
			onShown: null,
			onClose: null,
			onClosed: null,
			icon_type: 'class',
			template: '<div data-notify="container" class="col-xs-11 col-sm-4 alert alert-{0}" role="alert"><button type="button" aria-hidden="true" class="close" data-notify="dismiss">&times;</button><span data-notify="icon"></span> <span data-notify="title">{1}</span> <span data-notify="message">{2}</span><div class="progress" data-notify="progressbar"><div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div></div><a href="{3}" target="{4}" data-notify="url"></a></div>'
		};

	String.format = function() {
		var str = arguments[0];
		for (var i = 1; i < arguments.length; i++) {
			str = str.replace(RegExp("\\{" + (i - 1) + "\\}", "gm"), arguments[i]);
		}
		return str;
	};

	function Notify ( element, content, options ) {
		// Setup Content of Notify
		var content = {
			content: {
				message: typeof content == 'object' ? content.message : content,
				title: content.title ? content.title : '',
				icon: content.icon ? content.icon : '',
				url: content.url ? content.url : '#',
				target: content.target ? content.target : '-'
			}
		};

		options = $.extend(true, {}, content, options);
		this.settings = $.extend(true, {}, defaults, options);
		this._defaults = defaults;
		if (this.settings.content.target == "-") {
			this.settings.content.target = this.settings.url_target;
		}
		this.animations = {
			start: 'webkitAnimationStart oanimationstart MSAnimationStart animationstart',
			end: 'webkitAnimationEnd oanimationend MSAnimationEnd animationend'
		}

		if (typeof this.settings.offset == 'number') {
		    this.settings.offset = {
		    	x: this.settings.offset,
		    	y: this.settings.offset
		    };
		}

		this.init();
	};

	/*$.extend(Notify.prototype, {
		init: function () {
			var self = this;

			this.buildNotify();
			if (this.settings.content.icon) {
				this.setIcon();
			}
			if (this.settings.content.url != "#") {
				this.styleURL();
			}
			this.styleDismiss();
			this.placement();
			this.bind();

			this.notify = {
				$ele: this.$ele,
				update: function(command, update) {
					var commands = {};
					if (typeof command == "string") {
						commands[command] = update;
					}else{
						commands = command;
					}
					for (var command in commands) {
						switch (command) {
							case "type":
								this.$ele.removeClass('alert-' + self.settings.type);
								this.$ele.find('[data-notify="progressbar"] > .progress-bar').removeClass('progress-bar-' + self.settings.type);
								self.settings.type = commands[command];
								this.$ele.addClass('alert-' + commands[command]).find('[data-notify="progressbar"] > .progress-bar').addClass('progress-bar-' + commands[command]);
								break;
							case "icon":
								var $icon = this.$ele.find('[data-notify="icon"]');
								if (self.settings.icon_type.toLowerCase() == 'class') {
									$icon.removeClass(self.settings.content.icon).addClass(commands[command]);
								}else{
									if (!$icon.is('img')) {
										$icon.find('img');
									}
									$icon.attr('src', commands[command]);
								}
								break;
							case "progress":
								var newDelay = self.settings.delay - (self.settings.delay * (commands[command] / 100));
								this.$ele.data('notify-delay', newDelay);
								this.$ele.find('[data-notify="progressbar"] > div').attr('aria-valuenow', commands[command]).css('width', commands[command] + '%');
								break;
							case "url":
								this.$ele.find('[data-notify="url"]').attr('href', commands[command]);
								break;
							case "target":
								this.$ele.find('[data-notify="url"]').attr('target', commands[command]);
								break;
							default:
								this.$ele.find('[data-notify="' + command +'"]').html(commands[command]);
						};
					}
					var posX = this.$ele.outerHeight() + parseInt(self.settings.spacing) + parseInt(self.settings.offset.y);
					self.reposition(posX);
				},
				close: function() {
					self.close();
				}
			};
		},
		buildNotify: function () {
			var content = this.settings.content;
			this.$ele = $(String.format(this.settings.template, this.settings.type, content.title, content.message, content.url, content.target));
			this.$ele.attr('data-notify-position', this.settings.placement.from + '-' + this.settings.placement.align);
			if (!this.settings.allow_dismiss) {
				this.$ele.find('[data-notify="dismiss"]').css('display', 'none');
			}
			if ((this.settings.delay <= 0 && !this.settings.showProgressbar) || !this.settings.showProgressbar) {
				this.$ele.find('[data-notify="progressbar"]').remove();
			}
		},
		setIcon: function() {
			if (this.settings.icon_type.toLowerCase() == 'class') {
				this.$ele.find('[data-notify="icon"]').addClass(this.settings.content.icon);
			}else{
				if (this.$ele.find('[data-notify="icon"]').is('img')) {
					this.$ele.find('[data-notify="icon"]').attr('src', this.settings.content.icon);
				}else{
					this.$ele.find('[data-notify="icon"]').append('<img src="'+this.settings.content.icon+'" alt="Notify Icon" />');
				}
			}
		},
		styleDismiss: function() {
			this.$ele.find('[data-notify="dismiss"]').css({
				position: 'absolute',
				right: '10px',
				top: '5px',
				zIndex: this.settings.z_index + 2
			});
		},
		styleURL: function() {
			this.$ele.find('[data-notify="url"]').css({
				backgroundImage: 'url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)',
				height: '100%',
				left: '0px',
				position: 'absolute',
				top: '0px',
				width: '100%',
				zIndex: this.settings.z_index + 1
			});
		},
		placement: function() {
			var self = this,
				offsetAmt = this.settings.offset.y,
				css = {
					display: 'inline-block',
					margin: '0px auto',
					position: this.settings.position ?  this.settings.position : (this.settings.element === 'body' ? 'fixed' : 'absolute'),
					transition: 'all .5s ease-in-out',
					zIndex: this.settings.z_index
				},
				hasAnimation = false,
				settings = this.settings;

			$('[data-notify-position="' + this.settings.placement.from + '-' + this.settings.placement.align + '"]:not([data-closing="true"])').each(function() {
				return offsetAmt = Math.max(offsetAmt, parseInt($(this).css(settings.placement.from)) +  parseInt($(this).outerHeight()) +  parseInt(settings.spacing));
			});
			if (this.settings.newest_on_top == true) {
				offsetAmt = this.settings.offset.y;
			}
			css[this.settings.placement.from] = offsetAmt+'px';

			switch (this.settings.placement.align) {
				case "left":
				case "right":
					css[this.settings.placement.align] = this.settings.offset.x+'px';
					break;
				case "center":
					css.left = 0;
					css.right = 0;
					break;
			}
			this.$ele.css(css).addClass(this.settings.animate.enter);
			$.each(Array('webkit-', 'moz-', 'o-', 'ms-', ''), function(index, prefix) {
				self.$ele[0].style[prefix+'AnimationIterationCount'] = 1;
			});

			$(this.settings.element).append(this.$ele);

			if (this.settings.newest_on_top == true) {
				offsetAmt = (parseInt(offsetAmt)+parseInt(this.settings.spacing)) + this.$ele.outerHeight();
				this.reposition(offsetAmt);
			}

			if ($.isFunction(self.settings.onShow)) {
				self.settings.onShow.call(this.$ele);
			}

			this.$ele.one(this.animations.start, function(event) {
				hasAnimation = true;
			}).one(this.animations.end, function(event) {
				if ($.isFunction(self.settings.onShown)) {
					self.settings.onShown.call(this);
				}
			});

			setTimeout(function() {
				if (!hasAnimation) {
					if ($.isFunction(self.settings.onShown)) {
						self.settings.onShown.call(this);
					}
				}
			}, 600);
		},
		bind: function() {
			var self = this;

			this.$ele.find('[data-notify="dismiss"]').on('click', function() {
				self.close();
			})

			this.$ele.mouseover(function(e) {
				$(this).data('data-hover', "true");
			}).mouseout(function(e) {
				$(this).data('data-hover', "false");
			});
			this.$ele.data('data-hover', "false");

			if (this.settings.delay > 0) {
				self.$ele.data('notify-delay', self.settings.delay);
				var timer = setInterval(function() {
					var delay = parseInt(self.$ele.data('notify-delay')) - self.settings.timer;
					if ((self.$ele.data('data-hover') === 'false' && self.settings.mouse_over == "pause") || self.settings.mouse_over != "pause") {
						var percent = ((self.settings.delay - delay) / self.settings.delay) * 100;
						self.$ele.data('notify-delay', delay);
						self.$ele.find('[data-notify="progressbar"] > div').attr('aria-valuenow', percent).css('width', percent + '%');
					}
					if (delay <= -(self.settings.timer)) {
						clearInterval(timer);
						self.close();
					}
				}, self.settings.timer);
			}
		},
		close: function() {
			var self = this,
				$successors = null,
				posX = parseInt(this.$ele.css(this.settings.placement.from)),
				hasAnimation = false;

			this.$ele.data('closing', 'true').addClass(this.settings.animate.exit);
			self.reposition(posX);

			if ($.isFunction(self.settings.onClose)) {
				self.settings.onClose.call(this.$ele);
			}

			this.$ele.one(this.animations.start, function(event) {
				hasAnimation = true;
			}).one(this.animations.end, function(event) {
				$(this).remove();
				if ($.isFunction(self.settings.onClosed)) {
					self.settings.onClosed.call(this);
				}
			});

			setTimeout(function() {
				if (!hasAnimation) {
					self.$ele.remove();
					if (self.settings.onClosed) {
						self.settings.onClosed(self.$ele);
					}
				}
			}, 600);
		},
		reposition: function(posX) {
			var self = this,
				notifies = '[data-notify-position="' + this.settings.placement.from + '-' + this.settings.placement.align + '"]:not([data-closing="true"])',
				$elements = this.$ele.nextAll(notifies);
			if (this.settings.newest_on_top == true) {
				$elements = this.$ele.prevAll(notifies);
			}
			$elements.each(function() {
				$(this).css(self.settings.placement.from, posX);
				posX = (parseInt(posX)+parseInt(self.settings.spacing)) + $(this).outerHeight();
			});
		}
	}); */

	$.notify = function ( content, options ) {
		var plugin = new Notify( this, content, options );
		return plugin.notify;
	};
	$.notifyDefaults = function( options ) {
		defaults = $.extend(true, {}, defaults, options);
		return defaults;
	};
	$.notifyClose = function( command ) {
		if (typeof command === "undefined" || command == "all") {
			$('[data-notify]').find('[data-notify="dismiss"]').trigger('click');
		}else{
			$('[data-notify-position="'+command+'"]').find('[data-notify="dismiss"]').trigger('click');
		}
	};

}));

/**
 * @author William DURAND <william.durand1@gmail.com>
 * @license MIT Licensed
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('Translator', factory);
    }
    else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    }
    else {
        root.Translator = factory();
    }
}(this, function () {
    "use strict";

    var _messages     = {},
        _fallbackLocale = 'en',
        _domains      = [],
        _sPluralRegex = new RegExp(/^\w+\: +(.+)$/),
        _cPluralRegex = new RegExp(/^\s*((\{\s*(\-?\d+[\s*,\s*\-?\d+]*)\s*\})|([\[\]])\s*(-Inf|\-?\d+)\s*,\s*(\+?Inf|\-?\d+)\s*([\[\]]))\s?(.+?)$/),
        _iPluralRegex = new RegExp(/^\s*(\{\s*(\-?\d+[\s*,\s*\-?\d+]*)\s*\})|([\[\]])\s*(-Inf|\-?\d+)\s*,\s*(\+?Inf|\-?\d+)\s*([\[\]])/);

    var Translator = {
        /**
         * The current locale.
         *
         * @type {String}
         * @api public
         */
        locale: get_current_locale(),

        /**
         * Fallback locale.
         *
         * @type {String}
         * @api public
         */
        fallback: _fallbackLocale,

        /**
         * Placeholder prefix.
         *
         * @type {String}
         * @api public
         */
        placeHolderPrefix: '%',

        /**
         * Placeholder suffix.
         *
         * @type {String}
         * @api public
         */
        placeHolderSuffix: '%',

        /**
         * Default domain.
         *
         * @type {String}
         * @api public
         */
        defaultDomain: 'messages',

        /**
         * Plural separator.
         *
         * @type {String}
         * @api public
         */
        pluralSeparator: '|',

        /**
         * Adds a translation entry.
         *
         * @param {String} id         The message id
         * @param {String} message    The message to register for the given id
         * @param {String} [domain]   The domain for the message or null to use the default
         * @param {String} [locale]   The locale or null to use the default
         * @return {Object}           Translator
         * @api public
         */
        add: function(id, message, domain, locale) {
            var _locale = locale || this.locale || this.fallback,
                _domain = domain || this.defaultDomain;

            if (!_messages[_locale]) {
                _messages[_locale] = {};
            }

            if (!_messages[_locale][_domain]) {
                _messages[_locale][_domain] = {};
            }

            _messages[_locale][_domain][id] = message;

            if (false === exists(_domains, _domain)) {
                _domains.push(_domain);
            }

            return this;
        },


        /**
         * Translates the given message.
         *
         * @param {String} id               The message id
         * @param {Object} [parameters]     An array of parameters for the message
         * @param {String} [domain]         The domain for the message or null to guess it
         * @param {String} [locale]         The locale or null to use the default
         * @return {String}                 The translated string
         * @api public
         */
        trans: function(id, parameters, domain, locale) {
            var _message = get_message(
                id,
                domain,
                locale,
                this.locale,
                this.fallback
            );

            return replace_placeholders(_message, parameters || {});
        },

        /**
         * Translates the given choice message by choosing a translation according to a number.
         *
         * @param {String} id               The message id
         * @param {Number} number           The number to use to find the indice of the message
         * @param {Object} [parameters]     An array of parameters for the message
         * @param {String} [domain]         The domain for the message or null to guess it
         * @param {String} [locale]         The locale or null to use the default
         * @return {String}                 The translated string
         * @api public
         */
        transChoice: function(id, number, parameters, domain, locale) {
            var _message = get_message(
                id,
                domain,
                locale,
                this.locale,
                this.fallback
            );

            var _number  = parseInt(number, 10);
            parameters = parameters || {};

            if (parameters.count === undefined) {
                parameters.count = number;
            }

            if (typeof _message !== 'undefined' && !isNaN(_number)) {
                _message = pluralize(
                    _message,
                    _number,
                    locale || this.locale || this.fallback
                );
            }

            return replace_placeholders(_message, parameters);
        },

        /**
         * Loads translations from JSON.
         *
         * @param {String} data     A JSON string or object literal
         * @return {Object}         Translator
         * @api public
         */
        fromJSON: function(data) {
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }

            if (data.locale) {
                this.locale = data.locale;
            }

            if (data.fallback) {
                this.fallback = data.fallback;
            }

            if (data.defaultDomain) {
                this.defaultDomain = data.defaultDomain;
            }

            if (data.translations) {
                for (var locale in data.translations) {
                    for (var domain in data.translations[locale]) {
                        for (var id in data.translations[locale][domain]) {
                            this.add(id, data.translations[locale][domain][id], domain, locale);
                        }
                    }
                }
            }

            return this;
        },

        /**
         * @api public
         */
        reset: function() {
            _messages   = {};
            _domains    = [];
            this.locale = get_current_locale();
        }
    };

    /**
     * Replace placeholders in given message.
     *
     * **WARNING:** used placeholders are removed.
     *
     * @param {String} message      The translated message
     * @param {Object} placeholders The placeholders to replace
     * @return {String}             A human readable message
     * @api private
     */
    function replace_placeholders(message, placeholders) {
        var _i,
            _prefix = Translator.placeHolderPrefix,
            _suffix = Translator.placeHolderSuffix;

        for (_i in placeholders) {
            var _r = new RegExp(_prefix + _i + _suffix, 'g');

            if (_r.test(message)) {
                var _v = String(placeholders[_i]).replace(new RegExp('\\$', 'g'), '$$$$');
                message = message.replace(_r, _v);
            }
        }

        return message;
    }

    /**
     * Get the message based on its id, its domain, and its locale. If domain or
     * locale are not specified, it will try to find the message using fallbacks.
     *
     * @param {String} id               The message id
     * @param {String} domain           The domain for the message or null to guess it
     * @param {String} locale           The locale or null to use the default
     * @param {String} currentLocale    The current locale or null to use the default
     * @param {String} localeFallback   The fallback (default) locale
     * @return {String}                 The right message if found, `undefined` otherwise
     * @api private
     */
    function get_message(id, domain, locale, currentLocale, localeFallback) {
        var _locale = locale || currentLocale || localeFallback,
            _domain = domain;

        var nationalLocaleFallback = _locale.split('_')[0];

        if (!(_locale in _messages)) {
            if (!(nationalLocaleFallback in _messages)) {
                if (!(localeFallback in _messages)) {
                    return id;
                }
                _locale = localeFallback;
            } else {
                _locale = nationalLocaleFallback;
            }
        }

        if (typeof _domain === 'undefined' || null === _domain) {
            for (var i = 0; i < _domains.length; i++) {
                if (has_message(_locale, _domains[i], id) ||
                    has_message(nationalLocaleFallback, _domains[i], id) ||
                    has_message(localeFallback, _domains[i], id)) {
                    _domain = _domains[i];

                    break;
                }
            }
        }

        if (has_message(_locale, _domain, id)) {
            return _messages[_locale][_domain][id];
        }

        var _length, _parts, _last, _lastLength;

        while (_locale.length > 2) {
            _length     = _locale.length;
            _parts      = _locale.split(/[\s_]+/);
            _last       = _parts[_parts.length - 1];
            _lastLength = _last.length;

            if (1 === _parts.length) {
                break;
            }

            _locale = _locale.substring(0, _length - (_lastLength + 1));

            if (has_message(_locale, _domain, id)) {
                return _messages[_locale][_domain][id];
            }
        }

        if (has_message(localeFallback, _domain, id)) {
            return _messages[localeFallback][_domain][id];
        }

        return id;
    }

    /**
     * Just look for a specific locale / domain / id if the message is available,
     * helpful for message availability validation
     *
     * @param {String} locale           The locale
     * @param {String} domain           The domain for the message
     * @param {String} id               The message id
     * @return {Boolean}                Return `true` if message is available,
     *                      `               false` otherwise
     * @api private
     */
    function has_message(locale, domain, id) {
        if (!(locale in _messages)) {
            return false;
        }

        if (!(domain in _messages[locale])) {
            return false;
        }

        if (!(id in _messages[locale][domain])) {
            return false;
        }

        return true;
    }

    /**
     * The logic comes from the Symfony2 PHP Framework.
     *
     * Given a message with different plural translations separated by a
     * pipe (|), this method returns the correct portion of the message based
     * on the given number, the current locale and the pluralization rules
     * in the message itself.
     *
     * The message supports two different types of pluralization rules:
     *
     * interval: {0} There is no apples|{1} There is one apple|]1,Inf] There is %count% apples
     * indexed:  There is one apple|There is %count% apples
     *
     * The indexed solution can also contain labels (e.g. one: There is one apple).
     * This is purely for making the translations more clear - it does not
     * affect the functionality.
     *
     * The two methods can also be mixed:
     *     {0} There is no apples|one: There is one apple|more: There is %count% apples
     *
     * @param {String} message  The message id
     * @param {Number} number   The number to use to find the indice of the message
     * @param {String} locale   The locale
     * @return {String}         The message part to use for translation
     * @api private
     */
    function pluralize(message, number, locale) {
        var _p,
            _e,
            _explicitRules = [],
            _standardRules = [],
            _parts         = message.split(Translator.pluralSeparator),
            _matches       = [];

        for (_p = 0; _p < _parts.length; _p++) {
            var _part = _parts[_p];

            if (_cPluralRegex.test(_part)) {
                _matches = _part.match(_cPluralRegex);
                _explicitRules[_matches[0]] = _matches[_matches.length - 1];
            } else if (_sPluralRegex.test(_part)) {
                _matches = _part.match(_sPluralRegex);
                _standardRules.push(_matches[1]);
            } else {
                _standardRules.push(_part);
            }
        }

        for (_e in _explicitRules) {
            if (_iPluralRegex.test(_e)) {
                _matches = _e.match(_iPluralRegex);

                if (_matches[1]) {
                    var _ns = _matches[2].split(','),
                        _n;

                    for (_n in _ns) {
                        if (number == _ns[_n]) {
                            return _explicitRules[_e];
                        }
                    }
                } else {
                    var _leftNumber  = convert_number(_matches[4]);
                    var _rightNumber = convert_number(_matches[5]);

                    if (('[' === _matches[3] ? number >= _leftNumber : number > _leftNumber) &&
                        (']' === _matches[6] ? number <= _rightNumber : number < _rightNumber)) {
                        return _explicitRules[_e];
                    }
                }
            }
        }

        return _standardRules[plural_position(number, locale)] || _standardRules[0] || undefined;
    }

    /**
     * The logic comes from the Symfony2 PHP Framework.
     *
     * Convert number as String, "Inf" and "-Inf"
     * values to number values.
     *
     * @param {String} number   A literal number
     * @return {Number}         The int value of the number
     * @api private
     */
    function convert_number(number) {
        if ('-Inf' === number) {
            return Number.NEGATIVE_INFINITY;
        } else if ('+Inf' === number || 'Inf' === number) {
            return Number.POSITIVE_INFINITY;
        }

        return parseInt(number, 10);
    }

    /**
     * The logic comes from the Symfony2 PHP Framework.
     *
     * Returns the plural position to use for the given locale and number.
     *
     * @param {Number} number  The number to use to find the indice of the message
     * @param {String} locale  The locale
     * @return {Number}        The plural position
     * @api private
     */
    function plural_position(number, locale) {
        var _locale = locale;

        if ('pt_BR' === _locale) {
            _locale = 'xbr';
        }

        if (_locale.length > 3) {
            _locale = _locale.split('_')[0];
        }

        switch (_locale) {
            case 'bo':
            case 'dz':
            case 'id':
            case 'ja':
            case 'jv':
            case 'ka':
            case 'km':
            case 'kn':
            case 'ko':
            case 'ms':
            case 'th':
            case 'tr':
            case 'vi':
            case 'zh':
                return 0;
            case 'af':
            case 'az':
            case 'bn':
            case 'bg':
            case 'ca':
            case 'da':
            case 'de':
            case 'el':
            case 'en':
            case 'eo':
            case 'es':
            case 'et':
            case 'eu':
            case 'fa':
            case 'fi':
            case 'fo':
            case 'fur':
            case 'fy':
            case 'gl':
            case 'gu':
            case 'ha':
            case 'he':
            case 'hu':
            case 'is':
            case 'it':
            case 'ku':
            case 'lb':
            case 'ml':
            case 'mn':
            case 'mr':
            case 'nah':
            case 'nb':
            case 'ne':
            case 'nl':
            case 'nn':
            case 'no':
            case 'om':
            case 'or':
            case 'pa':
            case 'pap':
            case 'ps':
            case 'pt':
            case 'so':
            case 'sq':
            case 'sv':
            case 'sw':
            case 'ta':
            case 'te':
            case 'tk':
            case 'ur':
            case 'zu':
                return (number == 1) ? 0 : 1;

            case 'am':
            case 'bh':
            case 'fil':
            case 'fr':
            case 'gun':
            case 'hi':
            case 'ln':
            case 'mg':
            case 'nso':
            case 'xbr':
            case 'ti':
            case 'wa':
                return ((number === 0) || (number == 1)) ? 0 : 1;

            case 'be':
            case 'bs':
            case 'hr':
            case 'ru':
            case 'sr':
            case 'uk':
                return ((number % 10 == 1) && (number % 100 != 11)) ? 0 : (((number % 10 >= 2) && (number % 10 <= 4) && ((number % 100 < 10) || (number % 100 >= 20))) ? 1 : 2);

            case 'cs':
            case 'sk':
                return (number == 1) ? 0 : (((number >= 2) && (number <= 4)) ? 1 : 2);

            case 'ga':
                return (number == 1) ? 0 : ((number == 2) ? 1 : 2);

            case 'lt':
                return ((number % 10 == 1) && (number % 100 != 11)) ? 0 : (((number % 10 >= 2) && ((number % 100 < 10) || (number % 100 >= 20))) ? 1 : 2);

            case 'sl':
                return (number % 100 == 1) ? 0 : ((number % 100 == 2) ? 1 : (((number % 100 == 3) || (number % 100 == 4)) ? 2 : 3));

            case 'mk':
                return (number % 10 == 1) ? 0 : 1;

            case 'mt':
                return (number == 1) ? 0 : (((number === 0) || ((number % 100 > 1) && (number % 100 < 11))) ? 1 : (((number % 100 > 10) && (number % 100 < 20)) ? 2 : 3));

            case 'lv':
                return (number === 0) ? 0 : (((number % 10 == 1) && (number % 100 != 11)) ? 1 : 2);

            case 'pl':
                return (number == 1) ? 0 : (((number % 10 >= 2) && (number % 10 <= 4) && ((number % 100 < 12) || (number % 100 > 14))) ? 1 : 2);

            case 'cy':
                return (number == 1) ? 0 : ((number == 2) ? 1 : (((number == 8) || (number == 11)) ? 2 : 3));

            case 'ro':
                return (number == 1) ? 0 : (((number === 0) || ((number % 100 > 0) && (number % 100 < 20))) ? 1 : 2);

            case 'ar':
                return (number === 0) ? 0 : ((number == 1) ? 1 : ((number == 2) ? 2 : (((number >= 3) && (number <= 10)) ? 3 : (((number >= 11) && (number <= 99)) ? 4 : 5))));

            default:
                return 0;
        }
    }

    /**
     * @type {Array}        An array
     * @type {String}       An element to compare
     * @return {Boolean}    Return `true` if `array` contains `element`,
     *                      `false` otherwise
     * @api private
     */
    function exists(array, element) {
        for (var i = 0; i < array.length; i++) {
            if (element === array[i]) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the current application's locale based on the `lang` attribute
     * on the `html` tag.
     *
     * @return {String}     The current application's locale
     * @api private
     */
    function get_current_locale() {
        if (typeof document !== 'undefined') {
            return document.documentElement.lang.replace('-', '_');
        }
        else {
            return _fallbackLocale;
        }
    }

    return Translator;
}));

/**
 * Created by pmit on 17/2/28.
 */

$(function () {

    function addCls(obj) {
        obj.addClass('active').siblings().removeClass('active');
    }

    /*add user*/
    // $(".article-item").mouseenter(function(event) {
    // 	$(".showmode img").css("height","150px");
    // 	console.log("hi")
    // });
    // $(".article-item").mouseout(function(event) {
    // 	$(".showmode img").css('height',"0px");
    // });

    //导航栏
    $(window).on('scroll resize load', function () {
        if($(window).width()> 1000){
            if ($(document).scrollTop() >= 60 && $(document).scrollTop() <= $('.g-advert').height()) {
                $('.nav-inbox').css({'background': 'rgba(0,0,0,.75)'}, 300);
            } else if($(document).scrollTop() >= $('.g-advert').height()){
                $('.nav-inbox').css({'background': 'rgba(0,0,0,1)'}, 300);
            }else {
                $('.nav-inbox').css({'background': 'rgba(0,0,0,0)'}, 300);
            }
        }
    });
    //手机导航栏
    $('.menu-list .title').click(function () {
        if($(this).hasClass('active')){
            $(this).removeClass('active');
            $(this).parent().removeClass('active');
        }else{
            $('.menu-list .title,.menu-list>li').removeClass('active');

            $(this).addClass('active');
            $(this).parent().addClass('active');
        }
    });
    $('#u-menu-icon').click(function () {
        $('.g-side-menu .u-mask,.g-side-menu').show().animate({'opacity':1},200,function () {
            $('.menu-box').animate({'right':'0'},200);
        });

    });
    $('.g-side-menu .u-mask').click(function (e) {
        $('.menu-box').animate({'right':'-80%'},200,function () {
            $('.g-side-menu .u-mask,.g-side-menu .u-pull').animate({'opacity':0},200,function(){
                $('.g-side-menu,.g-side-menu .u-pull').hide();
            });
        });
        $('.menu-list .title,.menu-list>li').removeClass('active');
        e.preventDefault();
    });


    //header
    $('.u-login-btn').hover(
        function () {
            if ($(this).find('.m-login-menu')) $(this).find('.m-login-menu').stop(true).animate({'height': '204px'}, 300);
        },
        function () {

            if ($(this).find('.m-login-menu')) $(this).find('.m-login-menu').stop(true).height(0);
        }
    );

    $(document).on('click', '.g-menu>li', function () {
        $('.g-menu>li').removeClass('active');
        $(this).addClass('active');
    });
    $('.drop-down-menu').hover(
        function () {
            if ($(this).find('.m-tree-menu')) $(this).find('.m-tree-menu').stop(true).animate({'height': '220px'}, 300);
        },
        function () {
            if ($(this).find('.m-tree-menu')) $(this).find('.m-tree-menu').stop(true).height(0);

        });
    //footer -- 工作区域
    $('.m-workspace li').on({
        'mouseenter': function () {
            $(this).addClass('active');
        },
        'mouseleave': function () {
            $(this).removeClass('active');
        }
    });

    //首页 --- 案例
    // 类目
    $('#display-title>li').on('click mouseenter', function () {
        var _index = $(this).index();
        addCls($(this));
        //tab init
        $('.app-list>.app-item').removeClass('active');
        $('.app-list').eq(_index).find('.app-item').eq(0).addClass('active');
        $('.app-title>li').removeClass('active');
        $('.app-title').eq(_index).find('li').eq(0).addClass('active');
        $('.app-desc>li').removeClass('active');
        $('.app-desc').eq(_index).find('li').eq(0).addClass('active');


        addCls($('.app-list').eq(_index));
        addCls($('.txt-item').eq(_index));
    });

    // app标题
    $('.app-title>li').on('click mouseenter', function () {
        var _index = $(this).index();
        addCls($(this));

        addCls($(this).parents('.txt-item').find('.app-desc').eq($(this).parent().index()).children('li').eq(_index));
        addCls($('.app-list').eq($(this).parents('.txt-item').index() - 1).children('li').eq(_index));

    });

    // app图
    $('.app-list>.app-item').on('mouseenter click', function () {
        var _index = $(this).index();
        addCls($(this));

        addCls($('.app-desc').eq($(this).parent().index()).children('.app-item').eq(_index));
        addCls($('.app-title').eq($(this).parent().index()).children('.app-item').eq(_index));

    });
    $('.my-tap1>li').on('mouseenter click', function () {
        var _index = $(this).index();
        $('.my-tap11>.app-title>li').eq(_index).addClass("active").siblings().removeClass('active');
        $('.my-tap11>.app-desc>li').eq(_index).addClass("active").siblings().removeClass('active');
    });
    $('.my-tap2>li').on('mouseenter click', function () {
        var _index = $(this).index();
        $('.my-tap22>.app-title>li').eq(_index).addClass("active").siblings().removeClass('active');
        $('.my-tap22>.app-desc>li').eq(_index).addClass("active").siblings().removeClass('active');
    });
    $('.my-tap3>li').on('mouseenter click', function () {
        var _index = $(this).index();
        $('.my-tap33>.app-title>li').eq(_index).addClass("active").siblings().removeClass('active');
        $('.my-tap33>.app-desc>li').eq(_index).addClass("active").siblings().removeClass('active');
    });



    //搜索筛选
    $('.search-options .title').on('click', function () {
        var _menu = $(this).next();
        if (_menu.hasClass('hide')) {
            $(this).next().removeClass('hide').show();
        } else {
            $(this).next().addClass('hide').hide();
        }
    });

    //合作品牌
    $('.logo-list li').on('mouseenter', function () {
        var _index = $(this).index()+1;
        $(this).find('img').attr('src','static/picture/u_logo'+_index+''+_index+'.png');
    });
    $('.logo-list li').on('mouseout', function () {
        var _index = $(this).index()+1;
        $(this).find('img').attr('src','static/picture/u_logo'+_index+'.png');
    });

    //tab-----------------------------------------
    //员工风采
    $('.staff-title a').on('click mouseenter', function () {
        addCls($(this));
        addCls($('.staff-gallery .gallery-item').eq($(this).index()));
    });

    //众商--模式
    $('.mode-list li').hover(function () {
        addCls($(this));
        addCls($('.mode-detail-content .detail-item').eq($(this).index()));
    });


    //定制介绍页
    $('.service-title a').on('click mouseenter', function () {
        addCls($(this));
        addCls($('.service-items .item').eq($(this).index()));
    });


    //分享菜单
    $(document).on('click', '.share-menu', function () {
        if($(this).hasClass('active')){
            $(this).removeClass('active');
        }else{
            $(this).addClass('active');
        }
    });

    	window.onresize=function() {
    		let wid=document.body.clientWidth;
    		if(wid<=1024){
    			console.log(wid);
    			$(".mlist").css('left', (wid-200)/2);
    		}else{}
    		
    	};
    //文章块
    $(document).on('mouseenter','.article-item',function () {
        $(this).addClass('active').siblings().removeClass('active');
        $(this).find(".mlist").addClass('listact').siblings().removeClass('listact');
        $(this).find(".showmode").addClass('modeact').siblings().removeClass('modeact');
    });
    $(document).on('mouseleave','.article-item',function () {
        $('.article-item').removeClass('active');
        $(".mlist").removeClass('listact');
        $(".showmode").removeClass('modeact');
    });

    //mask 关闭
    $(document).on('click', '.u-mask>.mask-bg,.u-mask .u-close', function () {
        $(this).parents('.u-mask').fadeOut();
        if ($('.video-box video')[0]) {
            $('.video-box video')[0].pause();
        }
    });

    //视频播放
    videoPlay($('#conference-vedio'));
    videoPlay($('#glory-video'));
    function videoPlay(target) {
        target.click(function () {
            var Vedio = $(this).children('video')[0];

            if (Vedio.paused) {
                Vedio.play();
            }
            else {
                Vedio.pause();
            }
            return false;
        });
    }

    //disc 动画
    var timer, disc_deg = 0;
    $('#culture-audio').click(function () {
        var Vedio = $(this).children('audio')[0];

        if (Vedio.paused) {
            Vedio.play();
            timer = setInterval(function () {
                disc_deg += 10;
                $('.disc-box .disc2').css({'transform': 'rotateZ(' + disc_deg + 'deg)'});
            }, 100);
        }
        else {
            Vedio.pause();
            clearInterval(timer);
        }
        return false;
    });

});
/**
 * Created by pmit on 17/5/16.
 */
$(function () {
    //scrollReveal
    var config = {
        'default':{
            enter: 'bottom',
            move: '20px',
            over: '0.2s',
            init: true,
            reset: true,
            origin: 'bottom'
        },
        'left':{
            duration:700,
            origin: 'left',
            delay: 300
        },
        'right':{
            duration:700,
            origin: 'right',
            delay: 300,
        },
        'bottom':{
            duration:700,
            origin: 'bottom',
            delay: 300,
        },
        'top':{
            duration:700,
            origin: 'top',
            delay: 300,
        },
        'pictures':{
            duration:800,
            origin: 'bottom',
            move: '10px',
            rotate: {x: -15, y: -25, z: 0}
        }
    };


    window.sr = ScrollReveal(config.default);

    // sr.reveal( '.sr-default');
    sr.reveal( '.sr-left', config.left);
    sr.reveal( '.sr-right', config.right);
    sr.reveal( '.sr-bottom', config.bottom);
    sr.reveal('.sr-top', config.top);


    //发展历程
    sr.reveal('.history-content .history-item',{
        duration:500,
        origin: 'bottom',
        delay: 100,
        rotate: {x:0, y:-10, z:-10}
    });
    //文化
    sr.reveal('.culture-content .culture-block');
    sr.reveal('#culture-pics li', config.pictures, 30);
    //荣誉
    sr.reveal('.glory-gallery li', config.pictures, 30);
    //运营
    sr.reveal('.operate-content .pic-list li', config.pictures, 30);
    sr.reveal('.operate-increment li', config.bottom, 30);
    sr.reveal('.team-pictures img', config.pictures, 30);
    //首页
    sr.reveal('.sr-home',{reset: false});


    //定制--module1
    sr.reveal('.customized-items .item1',{
        duration:500,
        origin: 'left',
        delay: 0,
        move: '100px',
        rotate: {x: 80, y: 15, z: 0}
    });
    sr.reveal('.customized-items .item3',{
        duration:500,
        origin: 'right',
        delay: 200,
        move: '100px',
        rotate: {x: 80, y: 15, z: 0}
    });
    sr.reveal('.customized-items .item2',{
        duration:500,
        origin: 'left',
        delay: 400,
        move: '100px',
        rotate: {x: 80, y: 15, z: 0}
    });
    sr.reveal('.customized-items .item4',{
        duration:500,
        origin: 'right',
        delay: 600,
        move: '100px',
        rotate: {x: 80, y: 15, z: 0}
    });
    sr.reveal( '.service-hy-list li', config.bottom);
    sr.reveal('.customized-pictures .pictures-gallery li', config.pictures, 30);

    //船票介绍 -- functions
    sr.reveal('#ship-functions .function-item',config.bottom, 30);
    //船票介绍 -- 优势
    sr.reveal('.ship-advantage .advantage-item',config.bottom, 30);
    //图片
    sr.reveal('.ship-pictures .picture-box', config.pictures, 30);

    sr.reveal('.mode-list li', config.pictures, 30);


    //3d
    sr.reveal( '.scrollrevealbox ',{
        rotate: {x: 80, y: 15, z: 0},
        left: 0,
        right:0,
        duration:500
    });
});
/*!
 * William DURAND <william.durand1@gmail.com>
 * MIT Licensed
 */
;var Translator=(function(i,d){var e={},l=[],h=new RegExp(/^\w+\: +(.+)$/),f=new RegExp(/^\s*((\{\s*(\-?\d+[\s*,\s*\-?\d+]*)\s*\})|([\[\]])\s*(-Inf|\-?\d+)\s*,\s*(\+?Inf|\-?\d+)\s*([\[\]]))\s?(.+?)$/),o=new RegExp(/^\s*(\{\s*(\-?\d+[\s*,\s*\-?\d+]*)\s*\})|([\[\]])\s*(-Inf|\-?\d+)\s*,\s*(\+?Inf|\-?\d+)\s*([\[\]])/);function j(s,r){var t,p=Translator.placeHolderPrefix,q=Translator.placeHolderSuffix;for(t in r){var u=new RegExp(p+t+q,"g");if(u.test(s)){s=s.replace(u,r[t])}}return s}function g(r,t,z,p,v){var s=z||p||v,A=t;if(d==e[s]){if(d==e[v]){return r}s=v}if(d===A||null===A){for(var u=0;u<l.length;u++){if(c(s,l[u],r)||c(v,l[u],r)){A=l[u];break}}}if(c(s,A,r)){return e[s][A][r]}var y,w,x,q;while(s.length>2){y=s.length;w=s.split(/[\s_]+/);x=w[w.length-1];q=x.length;if(1===w.length){break}s=s.substring(0,y-(q+1));if(c(s,A,r)){return e[s][A][r]}}if(c(v,A,r)){return e[v][A][r]}return r}function c(p,q,r){if(d==e[p]){return false}if(d==e[p][q]){return false}if(d==e[p][q][r]){return false}return true}function m(C,s,z){var p,x,v=[],B=[],w=C.split(Translator.pluralSeparator),u=[];for(p=0;p<w.length;p++){var A=w[p];if(f.test(A)){u=A.match(f);v[u[0]]=u[u.length-1]}else{if(h.test(A)){u=A.match(h);B.push(u[1])}else{B.push(A)}}}for(x in v){if(o.test(x)){u=x.match(o);if(u[1]){var t=u[2].split(","),q;for(q in t){if(s==t[q]){return v[x]}}}else{var r=n(u[4]);var y=n(u[5]);if(("["===u[3]?s>=r:s>r)&&("]"===u[6]?s<=y:s<y)){return v[x]}}}}return B[b(s,z)]||B[0]||d}function n(p){if("-Inf"===p){return Number.NEGATIVE_INFINITY}else{if("+Inf"===p||"Inf"===p){return Number.POSITIVE_INFINITY}}return parseInt(p,10)}function b(r,p){var q=p;if("pt_BR"===q){q="xbr"}if(q.length>3){q=q.split("_")[0]}switch(q){case"bo":case"dz":case"id":case"ja":case"jv":case"ka":case"km":case"kn":case"ko":case"ms":case"th":case"tr":case"vi":case"zh":return 0;case"af":case"az":case"bn":case"bg":case"ca":case"da":case"de":case"el":case"en":case"eo":case"es":case"et":case"eu":case"fa":case"fi":case"fo":case"fur":case"fy":case"gl":case"gu":case"ha":case"he":case"hu":case"is":case"it":case"ku":case"lb":case"ml":case"mn":case"mr":case"nah":case"nb":case"ne":case"nl":case"nn":case"no":case"om":case"or":case"pa":case"pap":case"ps":case"pt":case"so":case"sq":case"sv":case"sw":case"ta":case"te":case"tk":case"ur":case"zu":return(r==1)?0:1;case"am":case"bh":case"fil":case"fr":case"gun":case"hi":case"ln":case"mg":case"nso":case"xbr":case"ti":case"wa":return((r===0)||(r==1))?0:1;case"be":case"bs":case"hr":case"ru":case"sr":case"uk":return((r%10==1)&&(r%100!=11))?0:(((r%10>=2)&&(r%10<=4)&&((r%100<10)||(r%100>=20)))?1:2);case"cs":case"sk":return(r==1)?0:(((r>=2)&&(r<=4))?1:2);case"ga":return(r==1)?0:((r==2)?1:2);case"lt":return((r%10==1)&&(r%100!=11))?0:(((r%10>=2)&&((r%100<10)||(r%100>=20)))?1:2);case"sl":return(r%100==1)?0:((r%100==2)?1:(((r%100==3)||(r%100==4))?2:3));case"mk":return(r%10==1)?0:1;case"mt":return(r==1)?0:(((r===0)||((r%100>1)&&(r%100<11)))?1:(((r%100>10)&&(r%100<20))?2:3));case"lv":return(r===0)?0:(((r%10==1)&&(r%100!=11))?1:2);case"pl":return(r==1)?0:(((r%10>=2)&&(r%10<=4)&&((r%100<12)||(r%100>14)))?1:2);case"cy":return(r==1)?0:((r==2)?1:(((r==8)||(r==11))?2:3));case"ro":return(r==1)?0:(((r===0)||((r%100>0)&&(r%100<20)))?1:2);case"ar":return(r===0)?0:((r==1)?1:((r==2)?2:(((r>=3)&&(r<=10))?3:(((r>=11)&&(r<=99))?4:5))));default:return 0}}function k(r,q){for(var p=0;p<r.length;p++){if(q===r[p]){return true}}return false}function a(){return i.documentElement.lang.replace("-","_")}return{locale:a(),fallback:"en",placeHolderPrefix:"%",placeHolderSuffix:"%",defaultDomain:"messages",pluralSeparator:"|",add:function(u,s,t,q){var r=q||this.locale||this.fallback,p=t||this.defaultDomain;if(!e[r]){e[r]={}}if(!e[r][p]){e[r][p]={}}e[r][p][u]=s;if(false===k(l,p)){l.push(p)}return this},trans:function(t,r,s,p){var q=g(t,s,p,this.locale,this.fallback);return j(q,r||{})},transChoice:function(v,s,r,t,p){var q=g(v,t,p,this.locale,this.fallback);var u=parseInt(s,10);if(d!=q&&!isNaN(u)){q=m(q,u,p||this.locale||this.fallback)}return j(q,r||{})},fromJSON:function(r){if(typeof r==="string"){r=JSON.parse(r)}if(r.locale){this.locale=r.locale}if(r.fallback){this.fallback=r.fallback}if(r.defaultDomain){this.defaultDomain=r.defaultDomain}if(r.translations){for(var p in r.translations){for(var q in r.translations[p]){for(var s in r.translations[p][q]){this.add(s,r.translations[p][q][s],q,p)}}}}return this},reset:function(){e={};l=[];this.locale=a()}}})(document,undefined);if(typeof window.define==="function"&&window.define.amd){window.define("Translator",[],function(){return Translator})}if(typeof exports!=="undefined"){if(typeof module!=="undefined"&&module.exports){module.exports=Translator}};
$(function () {
    $(document).on('click.modal.data-api', '[data-toggle="modal"]', function (e) {
        var imgUrl = _deel.config.loading_img_path;
        var $this = $(this),
            href = $this.attr('href'),
            url = $(this).data('url');
        if (url) {
            var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, '')));
            var $loadingImg = "<img src='" + imgUrl + "' class='modal-loading' style='z-index:1041;width:60px;height:60px;position:absolute;top:50%;left:50%;margin-left:-30px;margin-top:-30px;'/>";
            $target.html($loadingImg);
            $target.load(url);
        }
    });

    //同时存在多个modal时，关闭时还有其他modal存在，防止无法上下拖动
    $(document).on("hidden.bs.modal", "#attachment-modal", function () {
        if ($("#modal").attr('aria-hidden')) $(document.body).addClass("modal-open");
        if ($('#material-preview-player').length > 0) $('#material-preview-player').html("");
    });

    $('.modal').on('click', '[data-toggle=form-submit]', function (e) {
        e.preventDefault();
        $($(this).data('target')).submit();
    });

    $(".modal").on('click.modal-pagination', '.pagination a', function (e) {
        e.preventDefault();
        var $modal = $(e.delegateTarget);
        $.get($(this).attr('href'), function (html) {
            $modal.html(html);
        });
    });

});
(function ($, window, undefined) {
    // outside the scope of the jQuery plugin to
    // keep track of all dropdowns
    var $allDropdowns = $();

    // if instantlyCloseOthers is true, then it will instantly
    // shut other nav items when a new one is hovered over
    $.fn.dropdownHover = function (options) {
        // don't do anything if touch is supported
        // (plugin causes some issues on mobile)
        if ('ontouchstart' in document) return this; // don't want to affect chaining

        // the element we really care about
        // is the dropdown-toggle's parent
        $allDropdowns = $allDropdowns.add(this.parent());

        return this.each(function () {
            var $this = $(this),
                $parent = $this.parent(),
                defaults = {
                    delay: 100,
                    instantyCloseOthers: true
                },
                data = {
                    delay: $(this).data('delay'),
                    instantlyCloseOthers: $(this).data('close-others')
                },
                showEvent = 'show.bs.dropdown',
                hideEvent = 'hide.bs.dropdown',
                // shownEvent  = 'shown.bs.dropdown',
                // hiddenEvent = 'hidden.bs.dropdown',
                settings = $.extend(true, {}, defaults, options, data),
                timeout;

            $parent.hover(function (event) {
                // so a neighbor can't open the dropdown
                if (!$parent.hasClass('open') && !$this.is(event.target)) {
                    // stop this event, stop executing any code
                    // in this callback but continue to propagate
                    return true;
                }

                openDropdown(event);
            }, function () {
                timeout = window.setTimeout(function () {
                    $parent.removeClass('open');
                    $this.trigger(hideEvent);
                }, settings.delay);
            });

            // this helps with button groups!
            $this.hover(function (event) {
                // this helps prevent a double event from firing.
                // see https://github.com/CWSpear/bootstrap-hover-dropdown/issues/55
                if (!$parent.hasClass('open') && !$parent.is(event.target)) {
                    // stop this event, stop executing any code
                    // in this callback but continue to propagate
                    return true;
                }

                openDropdown(event);
            });

            // handle submenus
            $parent.find('.dropdown-submenu').each(function () {
                var $this = $(this);
                var subTimeout;
                $this.hover(function () {
                    window.clearTimeout(subTimeout);
                    $this.children('.dropdown-menu').show();
                    // always close submenu siblings instantly
                    $this.siblings().children('.dropdown-menu').hide();
                }, function () {
                    var $submenu = $this.children('.dropdown-menu');
                    subTimeout = window.setTimeout(function () {
                        $submenu.hide();
                    }, settings.delay);
                });
            });

            function openDropdown(event) {
                $allDropdowns.find(':focus').blur();

                if (settings.instantlyCloseOthers === true)
                    $allDropdowns.removeClass('open');

                window.clearTimeout(timeout);
                $parent.addClass('open');
                $this.trigger(showEvent);
            }
        });
    };

    $(document).ready(function () {
        // apply dropdownHover to all elements with the data-hover="dropdown" attribute
        $('[data-hover="dropdown"]').dropdownHover();
    });
})(jQuery, this);
(function (jq) {
    var $ = jq;
    var showMessage = function (type, message, options) {
        var options = $.extend({
            type: type
            , placement: {
                from: "top",
                align: "center"
            }
            , animate: {
                enter: 'animated bounceInDown',
                exit: 'animated bounceOutUp'
            }
            , offset: {
                x: 3,
                y: 3
            }
            , template: '<div data-notify="container" class="alert alert-{0} bootstrap-notify-bar" role="alert">' +
            '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">&times;</button>{2}</div>'
        }, options);
        $.notify(message, options);
    };

    $.notification = {
        primary: function (message, options) {
            showMessage('info', message, options);
        },

        success: function (message, options) {
            showMessage('success', message, options);
        },

        warning: function (message, options) {
            showMessage('warning', message, options);
        },

        danger: function (message, options) {
            showMessage('danger', message, options);
        },

        info: function (message, options) {
            showMessage('info', message, options);
        }
    };


})(jQuery);
/**
 * Ajax 提交表单
 *
 * @param $form
 *              表单元素
 * @param options
 *              表单参数
 * @param validateForm
 *              自定义表单验证方法
 */
var ajaxForm = function ($form, options) {
    if (typeof $form != "object" || $form.length < 1 || !jQuery.isFunction(jQuery.fn.Validform)) {
        layer.msg("请注意正确调用！参数错误。");
        return;
    }

    //表单校验
    $form.Validform({
        btnSubmit: options.btnSubmit || "#btn_submit",
        btnReset: options.btnReset || ".btn_reset",
        postonce: options.postonce || true,
        ajaxPost: options.ajaxPost || true,
        ignoreHidden: options.ignoreHidden || false,
        dragonfly: options.dragonfly || false,
        tipSweep: options.tipSweep || true,
        label: options.label || ".label",
        showAllError: options.showAllError || false,
        tiptype: options.tiptype || function (msg, o, cssctl) {
            if (o.type == 3 && o.curform != o.obj) {
                if (isBank(msg)) return;
                layer.msg(msg, function () {
                    //调用错误的回调方法
                    (options.error && typeof(options.error) === "function") && options.error(rb);
                });
            }
        },
        usePlugin: options.usePlugin,
        beforeCheck: function (curform) {
            //在表单提交执行验证之前执行的函数，curform参数是当前表单对象。
            //这里明确return false的话将不会继续执行验证操作;
            return (typeof(options.beforeCheck) === "function") ? options.beforeCheck(curform) : true;
        },
        beforeSubmit: function (curform) {
            //在验证成功后，表单提交前执行的函数，curform参数是当前表单对象。
            //这里明确return false的话表单将不会提交;
            var result = (typeof(options.beforeSubmit) === "function") ? options.beforeSubmit(curform) : true;

            if (result) {
                //加载中。
                layer.load();
                //禁用表单按钮
                $("button[type=submit]").attr('disabled', 'disabled');
            }

            return result;
        },
        callback: function (data) {
            //返回数据data是json对象，{"info":"demo info","status":"y"}
            //info: 输出提示信息;
            //status: 返回提交数据的状态,是否提交成功。如可以用"y"表示提交成功，"n"表示提交失败，在ajax_post.php文件返回数据里自定字符，主要用在callback函数里根据该值执行相应的回调操作;
            //你也可以在ajax_post.php文件返回更多信息在这里获取，进行相应操作；
            //ajax遇到服务端错误时也会执行回调，这时的data是{ status:**, statusText:**, readyState:**, responseText:** }；

            //这里执行回调操作;
            //注意：如果不是ajax方式提交表单，传入callback，这时data参数是当前表单对象，回调函数会在表单验证全部通过后执行，然后判断是否提交表单，如果callback里明确return false，则表单不会提交，如果return true或没有return，则会提交表单。

            //加载完成。当请求完成之后调用这个函数，无论成功或失败。传入 XMLHttpRequest 对象，以及一个包含成功或错误代码的字符串。

            //关闭加载层
            layer.closeAll('loading');
            //激活表单按钮
            $("button[type=submit]").removeAttr('disabled');
            //获取返回的数据
            var rb = (isNotBank(data.responseJSON) ? data.responseJSON : data.responseText) || data;
            if (rb && typeof(rb) != "object") rb = eval('(' + rb + ')');
            if (rb.result) {
                //表明是调用成功
                (options.success && typeof(options.success) === "function") && options.success(rb);
            } else {
                //错误提示
                var msg = rb.errmsg || (rb.message || "服务器繁忙！");
                if ($.browser.versions.mobile) {
                    $.toptip(msg, 'error');
                    setTimeout(function () {
                        //调用错误的回调方法
                        (options.error && typeof(options.error) === "function") && options.error(rb);
                    }, 3000);
                } else {
                    layer.msg(msg, function () {
                        //调用错误的回调方法
                        (options.error && typeof(options.error) === "function") && options.error(rb);
                    });
                }
            }
        }
    });
};
/**
 * Ajax请求公用函数
 *
 * @param options
 *          参数同比jQuery、Ajax
 */
var ajaxRequest = function (options) {
    if (typeof options != "object" || isBank(options.url)) {
        layer.msg("请注意正确调用！参数错误。");
        return;
    }
    //增加inajax参数。以便后台判断
    options.url = (options.url.indexOf("?") != -1) ? options.url + '&inajax=true' : options.url + '?inajax=true';
    $.ajax({
        url: options.url,
        timeout: 100000,
        data: options.data,
        async: isBank(options.async) ? true : options.async,
        type: isBank(options.type) ? "POST" : options.type,
        dataType: isBank(options.dataType) ? "" : options.dataType,
        cache: isBank(options.cache) ? false : options.cache,
        success: function (rb, textStatus, XMLHttpRequest) {
            //当请求之后调用。传入返回后的数据，以及包含成功代码的字符串。
            if (XMLHttpRequest.status == 200 && rb && isNotBank(rb)) {
                if (!isJson(rb) || rb.result) {
                    //表明是调用成功
                    (options.success && typeof(options.success) === "function") && options.success(rb, textStatus, XMLHttpRequest);
                    //图片延迟加载
                    registerPictureDelayLoad();
                } else {
                    rb.message = (rb.errmsg || rb.message) || "服务器繁忙！";
                    if (options.noDefaultMsg) {
                        //调用错误的回调方法
                        (options.error && jQuery.isFunction(options.error)) && options.error(rb);
                    } else {
                        (options.error && jQuery.isFunction(options.error) ? options.error(rb) : layer.msg(rb.message));
                    }
                }
            } else {
                (options.error && typeof(options.error) === "function") && options.error(rb, textStatus, XMLHttpRequest);
            }
        },
        beforeSend: function (XMLHttpRequest) {
            //默认需要加载层
            if (!options.noUseLoading) {
                //加载中。
                layer.load();
            }
        },
        error: function (xmlHttpRequest, textStatus, errorThrown) {
            //记录错误
            console.error("AJAX调用发生错误: ", options.url, xmlHttpRequest, textStatus, errorThrown);
            //请求出错时调用。传入 XMLHttpRequest 对象，描述错误类型的字符串以及一个异常对象（如果有的话）
            var msg = xmlHttpRequest.responseJSON || xmlHttpRequest.responseText;
            if (msg && typeof(msg) != "object") msg = eval('(' + msg + ')');
            if (options.error && typeof(options.error) === "function") {
                return options.error(msg, textStatus, XMLHttpRequest);
            }
            layer.msg(typeof(msg) == "object" ? (msg.errmsg || msg.message ) : msg);
        },
        complete: function (jqXHR, textStatus) {
            //关闭加载层
            layer.closeAll('loading');
            //加载完成。当请求完成之后调用这个函数，无论成功或失败。传入 XMLHttpRequest 对象，以及一个包含成功或错误代码的字符串。
            (options.complete && typeof(options.complete) === "function") && options.complete(jqXHR, textStatus);
        },
        statusCode: {
            //一组数值的HTTP代码和函数对象，当响应时调用了相应的代码。不同响应状态触发以下警报：
            404: function () {
                layer.msg('404 - Page Not Found');
            },
            503: function () {
                layer.msg('503 - Service Unavailable');
            }
        }
    });
};

/**
 * 通用Ajax请求 - Get方式
 *
 * @param url
 * @param data
 * @param callback
 * @param error
 */
var ajaxGet = function (url, data, callback, error) {
    //可选参数检查
    if (jQuery.isFunction(data)) {
        error = callback;
        callback = data;
        data = {};
    }
    if (isBank(url) || !jQuery.isFunction(callback)) {
        layer.msg("请注意正确调用！参数错误。");
        return;
    }
    ajaxRequest(jQuery.extend({
        url: url,
        type: "GET",
        data: data,
        success: callback,
        error: error
    }, data));
};

/**
 *  通用Ajax请求 - Post方式
 *
 * @param url
 * @param data
 * @param callback
 * @param error
 */
var ajaxPost = function (url, data, callback, error) {
    //可选参数检查
    if (jQuery.isFunction(data)) {
        error = callback;
        callback = data;
        data = {};
    }
    if (isBank(url) || !jQuery.isFunction(callback)) {
        layer.msg("请注意正确调用！参数错误。");
        return;
    }
    ajaxRequest(jQuery.extend({
        url: url,
        type: "POST",
        data: data,
        success: callback,
        error: error
    }, data));
};
/**
 * Cookie 操作公共方法
 * @type {{set: cookie.set, get: cookie.get}}
 */
var cookie = {
    //设置cookie方法
    'set': function (key, val, time) {
        var date = new Date(); //获取当前时间
        var expiresDays = time;  //将date设置为n天以后的时间
        date.setTime(date.getTime() + expiresDays * 24 * 3600 * 1000); //格式化为cookie识别的时间
        document.cookie = key + "=" + val + ";expires=" + date.toGMTString();  //设置cookie
    },
    //获取cookie方法
    'get': function (key) {
        var arr, reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg)) {
            return decodeURIComponent(arr[2]);
        } else {
            return null;
        }
    },
    //删除cookie方法
    'delete': function (key) {
        var date = new Date(); //获取当前时间
        date.setTime(date.getTime() - 10000); //将date设置为过去的时间
        document.cookie = key + "=v;expires=" + date.toGMTString();//设置cookie
    }
};

$(function () {
    /**
     * 提供复制能力
     */
    $(document).on('click', '[data-target="copy"]', function () {
        var client = new ZeroClipboard($("[data-target='copy']").toArray());
        client.on("ready", function (readyEvent) {
            client.on("aftercopy", function (event) {
                $.notify.success("复制成功");
            });
        });
    });
});
$(function () {
    $(document).on('click', '[data-target="delete"]', function () {
        var $trigger = $(this);
        layer.confirm(Translator.trans('真的要%title%吗？', {title: $trigger.attr('title')}), function () {
            ajaxPost($trigger.data('url'), {}, function (html) {
                var $success = $trigger.data("success");
                $.notification.success(Translator.trans('%title%成功！', {title: $trigger.attr('title')}), {
                    onClosed: function () {
                        if (isBank($success) && !isExitsFunction(eval($success))) window.location.reload();
                    }
                });
                if (isNotBank($success) && isExitsFunction(eval($success))) eval($success)($trigger);
            }, function () {
                var $error = $trigger.data("error");
                $.notification.danger(Translator.trans('%title%失败！', {title: $trigger.attr('title')}), {
                    onClosed: function () {
                        if (isBank($error) && !isExitsFunction(eval($error))) return;
                    }
                });
                if (isNotBank($error) && isExitsFunction(eval($error))) eval($error)($trigger);
            });
            layer.closeAll();
        });
    });
});
/**

 @Name : laytpl v1.2 - 精妙的JavaScript模板引擎
 @Author: 贤心
 @Date: 2014-10-27
 @Site：http://sentsin.com/layui/laytpl
 @License：MIT

 */

;!function () {
    "use strict";

    var config = {
        open: '{{',
        close: '}}'
    };

    var tool = {
        exp: function (str) {
            return new RegExp(str, 'g');
        },
        //匹配满足规则内容
        query: function (type, _, __) {
            var types = [
                '#([\\s\\S])+?',   //js语句
                '([^{#}])*?' //普通字段
            ][type || 0];
            return exp((_ || '') + config.open + types + config.close + (__ || ''));
        },
        escape: function (html) {
            return String(html || '').replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
                .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
        },
        error: function (e, tplog) {
            var error = 'Laytpl Error：';
            typeof console === 'object' && console.error(error + e + '\n' + (tplog || ''));
            return error + e;
        }
    };

    var exp = tool.exp, Tpl = function (tpl) {
        this.tpl = tpl;
    };

    Tpl.pt = Tpl.prototype;

    window.errors = 0;

//编译模版
    Tpl.pt.parse = function (tpl, data) {
        var that = this, tplog = tpl;
        var jss = exp('^' + config.open + '#', ''), jsse = exp(config.close + '$', '');

        tpl = tpl.replace(/\s+|\r|\t|\n/g, ' ').replace(exp(config.open + '#'), config.open + '# ')

            .replace(exp(config.close + '}'), '} ' + config.close).replace(/\\/g, '\\\\')

            .replace(/(?="|')/g, '\\').replace(tool.query(), function (str) {
                str = str.replace(jss, '').replace(jsse, '');
                return '";' + str.replace(/\\/g, '') + ';view+="';
            })

            .replace(tool.query(1), function (str) {
                var start = '"+(';
                if (str.replace(/\s/g, '') === config.open + config.close) {
                    return '';
                }
                str = str.replace(exp(config.open + '|' + config.close), '');
                if (/^=/.test(str)) {
                    str = str.replace(/^=/, '');
                    start = '"+_escape_(';
                }
                return start + str.replace(/\\/g, '') + ')+"';
            });

        tpl = '"use strict";var view = "' + tpl + '";return view;';
        //console.log(tpl);

        try {
            that.cache = tpl = new Function('d, _escape_', tpl);
            return tpl(data, tool.escape);
        } catch (e) {
            delete that.cache;
            return tool.error(e, tplog);
        }
    };

    Tpl.pt.render = function (data, callback) {
        var that = this, tpl;
        if (!data) return tool.error('no data');
        tpl = that.cache ? that.cache(data, tool.escape) : that.parse(that.tpl, data);
        console.log()
        if (!callback) return tpl;
        callback(tpl);
    };

    var laytpl = function (tpl) {
        if (typeof tpl !== 'string') return tool.error('Template not found');
        return new Tpl(tpl);
    };

    laytpl.config = function (options) {
        options = options || {};
        for (var i in options) {
            config[i] = options[i];
        }
    };

    laytpl.v = '1.2';

    "function" == typeof define ? define(function () {
            return laytpl
        }) : "undefined" != typeof exports ? module.exports = laytpl : window.laytpl = laytpl

}();
"use strict";

/**
 * 注册通用表单校验
 */
var registerFormValidate = function (options) {
    //加载依赖
    if (isBank(options)) options = {};
    if ($("form.validate").length > 0 && jQuery.isFunction(jQuery.fn.Validform)) {
        $("form.validate").Validform({
            tiptype: options.tiptype || function (msg, o, cssctl) {
                if (o.type == 3 && o.curform != o.obj) {
                    isNotBank(msg) && layer.msg(msg);
                }
            }
        });
    }
};

/**
 * 如果此处存在图片延迟加载。注册图片延迟加载
 *
 * 图片延迟加载指定的Class Name: .pictureDelayLoad
 */
var registerPictureDelayLoad = function () {
    if ($(".pictureDelayLoad,.lazy").length > 0 && jQuery.isFunction(jQuery.fn.lazyload)) {
        var lazyload_options = {
            threshold: 666,
            placeholder: 'data:image/gif;base64,R0lGODlhAQABAIAAAOfn5/v7+yH5BAAHAP8ALAAAAAABAAEAAAICRAEAOw==',
            failure_limit: 5,//失败次数限制
            event: "scroll",//通过何种事件来加载图片
            effect: "show",//通过哪种JQuery的显示方法来显示图片
            container: window,//容器
            data_attribute: "original",//要加载的图片是哪种data-后缀
            skip_invisible: true,//如果设置为true，则隐藏要显示的实际图片不会被加载
            appear: null,//如果设置了的话，将会触发一个只执行一次的方法，参数为self, elements_left, settings
            //如果设置了的话，在图片加载时，将执行该方法，参数为self, elements_left, settings
            load: function () {
                if ($(this).attr("src") == $(this).data("original")) {
                    $(this).removeClass("pictureDelayLoad");
                    $(this).removeClass("lazy");
                }
            }
        };
        $(".pictureDelayLoad,.lazy").lazyload(lazyload_options);
    }
};

/**
 * 一些调用方法注册
 */
$(function () {

    //注册图片延迟加载
    registerPictureDelayLoad();

    //注册通用表单验证
    registerFormValidate();

});
$(function () {
    var picDoms = $('[data-target="preview-picture"]');

    var parseThumbnailElements = function (els) {
        var items = [];

        els.each(function (index) {
            var src = $(this).data("original") || ($(this).data("url") ? $(this).data("url") : $(this).attr("src"));
            if (src) {
                var img = new Image();
                img.src = src;
                var item = {
                    src: img.src,
                    msrc: img.src,
                    w: parseInt((img.width > 0) ? img.width : 200, 10),
                    h: parseInt((img.height > 0) ? img.height : 150, 10)
                };

                item.m = {
                    src: item.src,
                    w: item.w,
                    h: item.h
                };

                item.o = {
                    src: item.src,
                    w: item.w,
                    h: item.h
                };

                item.el = this;
                items.push(item);
            }
        });

        return items;
    };

    var openPhotoSwipe = function (index, galleryElement) {
        var pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;

        items = parseThumbnailElements(galleryElement);

        // define options (if needed)
        options = {

            galleryUID: galleryElement.data('pswp-uid'),

            getThumbBoundsFn: function (index) {
                // See Options->getThumbBoundsFn section of docs for more info
                var thumbnail = items[index].el,
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect();
                return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
            }

        };

        options.index = parseInt(index, 10);
        options.captionEl = false;
        options.fullscreenEl = false;
        options.shareEl = false;
        options.bgOpacity = 0.85;
        options.tapToClose = true;
        options.tapToToggleControls = false;

        // exit if index not found
        if (isNaN(options.index)) {
            return;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);

        gallery.init();
    };

    picDoms.each(function (index) {
        $(this).data("pswp-uid", index + 1);
        $(this).on("click", function () {
            openPhotoSwipe(index, picDoms);
        });
    });

});
/**
 *  - 消除Javascript语法的一些不合理、不严谨之处，减少一些怪异行为;
 *　- 消除代码运行的一些不安全之处，保证代码运行的安全；
 *　- 提高编译器效率，增加运行速度；
 *　- 为未来新版本的Javascript做好铺垫。
 */
"use strict";

/**
 * 兼容老版本jqeury写法
 * @type {boolean}
 */
var userAgent = navigator.userAgent.toLowerCase();
// Figure out what browser is being used
$.browser = {
    version: (userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
    safari: /webkit/.test(userAgent),
    opera: /opera/.test(userAgent),
    msie: /msie/.test(userAgent) && !/opera/.test(userAgent),
    mozilla: /mozilla/.test(userAgent) && !/(compatible|webkit)/.test(userAgent),
    versions: function () {
        var u = navigator.userAgent, app = navigator.appVersion;
        return {         //移动终端浏览器版本信息
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
            iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
        };
    }(),
    language: (navigator.browserLanguage || navigator.language).toLowerCase()
};

/**
 * 跳转url通用方法
 * @param url
 */
var redirectUrl = function (url) {
    if (!url) layer.msg("跳转的链接不存在!");
    layer.load("正在加载...");
    if (!isWeixin() && $.support.pjax && $("#pjax-container").length > 0) {
        $.pjax({url: url, container: '#pjax-container'});
    } else {
        window.location.href = url;
    }
};

/**
 * 是否存在指定函数
 *
 * @param funcName
 * @returns {boolean}
 */
var isExitsFunction = function (funcName) {
    try {
        if (typeof(eval(funcName)) == "function") {
            return true;
        }
    } catch (e) {
    }
    return false;
};

/**
 * 是否存在指定变量
 *
 * @param variableName
 * @returns {boolean}
 */
function isExitsVariable(variableName) {
    //加载依赖
    try {
        if (typeof(variableName) == "undefined") {
            return false;
        }
        return true;
    } catch (e) {
        layer.msg("判断是否存在指定变量 - 出错" + e.message);
    }
    return false;
}

/**
 * 判断值是否为空
 * @param target_val
 * @returns {boolean}
 */
var isBank = function (target_val) {
    if (target_val == null || target_val == "null" || typeof(target_val) == "undefined" || target_val == "undefined" || $.trim(target_val) == "") {
        return true;
    }
    return false;
};

/**
 * 判断值是否为空，为空就回显为指定值
 * @param target_val
 * @param display_val
 * @returns {*}
 */
var nvl = function (target_val, display_val) {
    if (target_val == null || target_val == "null" || target_val == "undefine" || target_val == "undefined" || $.trim(target_val) == "") {
        return display_val;
    }
    return target_val;
};

/**
 * 判断值是否不为空
 * @param target_val
 * @returns {boolean}
 */
var isNotBank = function (target_val) {
    return !isBank(target_val);
};

/**
 * 只能输入数字+小数点
 *
 * @param e 绑定的表单元素
 * @param pnumber 输入值
 * @returns {Boolean}
 */
var validateFloat2 = function (e, pnumber) {
    if (!/^\d+[.]?[0-9]?$/.test(pnumber)) {
        var newValue = /\d+[.]?[0-9]?/.exec(e.value);
        if (newValue != null) {
            e.value = newValue;
        } else {
            e.value = "";
        }
    }
    return false;
};

/**
 * 只能输入数字+小数点后两位
 *
 * @param e 绑定的表单元素
 * @param pnumber 输入值
 * @returns {Boolean}
 */
var validateFloat_2 = function (e, pnumber) {
    if (!/^\d+[.]?[0-9]?[0-9]?$/.test(pnumber)) {
        var newValue = /\d+[.]?[0-9]?[0-9]?/.exec(e.value);
        if (newValue != null) {
            e.value = newValue;
        } else {
            e.value = "";
        }
    }
    return false;
};

/**
 * 只能输入数字
 *
 * @param e 绑定的表单元素
 * @param pnumber 输入值
 * @returns {Boolean}
 */
var validateNumber = function (e, pnumber) {
    if (!/^\d+$/.test(pnumber)) {
        var newValue = /\d+/.exec(e.value);
        if (newValue != null) {
            e.value = newValue;
        } else {
            e.value = "";
        }
    }
    return false;
}

/**
 * 判断一个字符串是否包含一个子串的方法
 * @param str
 * @param substr
 * @returns {*}
 */
var isContains = function (str, substr) {
    return new RegExp(substr).test(str);
};

/**
 * 获取URL中参数的值
 *
 * 例子：http://abc.com?action=update&id=987654321789
 * var action = getUrlParam("action"); //返回action的值为"update"
 *
 * @Param: name: 要获取的参数名字
 * @param: _location：可选参数，页面的URL，在弹出窗口中使用
 * @return：返回参数的值
 */
var getUrlParam = function (name, _location) {
    var _location_url = _location || window.location.search; //window.location.search：URL中问号及其后面的内容
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = _location_url.substr(1).match(reg); //匹配目标参数
    //返回参数值
    if (r != null) return decodeURIComponent(r[2]);
    return null;
};

/**
 *  设置url参数
 *  @param name
 *              参数名称
 *  @param value
 *              参数值
 *  @param _location
 *              可选参数，替换的URL
 *  @returns {XML|*|string|{by}|void}
 */
var changeUrlParam = function (name, value, _location) {
    var url = _location || window.location.href;
    var reg = eval('/(' + name + '=)([^&]*)/gi');
    return url.replace(reg, name + '=' + value);
};

/**
 * 删除url指定名称的参数
 *  @param name
 *              参数名称
 *  @param _location
 *              可选参数，替换的URL
 * @returns {XML|*|string|{by}|void}
 */
var delUrlParam = function (name, _location) {
    var url = _location || window.location.href;
    var reg = eval('/(' + name + '=)([^&]*)/gi');
    return url.replace(reg, "");
};

/**
 * 添加url指定名称的参数
 * @param name
 *      参数名称
 * @param value
 *      参数值
 * @param _location
 *      可选参数，替换的URL
 * @returns {string}
 */
var addUrlParam = function (name, value, _location) {
    var currentUrl = _location || window.location.href;
    if (/\?/g.test(currentUrl)) {
        if (/name=[-\w]{4,25}/g.test(currentUrl)) {
            currentUrl = currentUrl.replace(/name=[-\w]{4,25}/g, name + "=" + value);
        } else {
            currentUrl += "&" + name + "=" + value;
        }
    } else {
        currentUrl += "?" + name + "=" + value;
    }
    return currentUrl;
};

/**
 * 设置histroy状态
 *
 * @param title
 * @param url
 */
var historyPushState = function (title, url) {
    if (history.pushState && isNotBank(title) && isNotBank(url)) {
        document.title = title;
        history.replaceState({title: title}, title, url);
    }
};

/**
 * 获取当前时间（精确到秒）
 *
 * @param hasSecond
 *                 是否精确到秒
 * @returns {string}
 *                 eg: 2015-8-28 / 2015-8-28 14:41:25
 */
var getNowTime = function (hasSecond) {
    //获取当前时间
    var _d = new Date();
    var month = _d.getMonth();
    month = month + 1;
    if (month < 10) {
        month = '0' + month;
    }
    var day = _d.getDate();
    if (day < 10) {
        day = '0' + day;
    }
    var str = _d.getFullYear() + '-' + month + '-' + day;
    if (hasSecond) {
        str += ' ' + _d.getHours() + ':' + _d.getMinutes() + ':' + _d.getSeconds()
    }
    return str;
};

/** 判断是否为json对象
 * @param obj: 对象（可以是jq取到对象）
 * @return isjson: 是否是json对象 true/false
 */
var isJson = function (obj) {
    var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
    return isjson;
};

/**
 * 判断当前浏览器是否为微信浏览器
 *
 * @returns {boolean}
 */
var isWeixin = function () {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
        return true;
    }
    return false;
};

/**
 * 获取GET参数
 * @param url
 * @param name
 * @returns {string}
 */
var getQueryString = function (name, url) {
    url = isBank(url) ? url : window.location.href;
    var reg = new RegExp("(^|\\?|&)" + name + "=([^&]*)(\\s|&|$)", "i");
    if (reg.test(url)) return RegExp.$2.replace(/\+/g, " ");
    return '';
};

/*
    Validform version 5.3.2
	By sean during April 7, 2010 - March 26, 2013
	For more information, please visit http://validform.rjboy.cn
	Validform is available under the terms of the MIT license.
*/

(function(d,f,b){var g=null,j=null,i=true;var e={tit:"提示信息",w:{"*":"不能为空！","*6-16":"请填写6到16位任意字符！","n":"请填写数字！","n6-16":"请填写6到16位数字！","s":"不能输入特殊字符！","s6-18":"请填写6到18位字符！","p":"请填写邮政编码！","m":"请填写手机号码！","e":"邮箱地址格式不对！","url":"请填写网址！"},def:"请填写正确信息！",undef:"datatype未定义！",reck:"两次输入的内容不一致！",r:"通过信息验证！",c:"正在检测信息…",s:"请{填写|选择}{0|信息}！",v:"所填信息没有经过验证，请稍后…",p:"正在提交数据…"};d.Tipmsg=e;var a=function(l,n,k){var n=d.extend({},a.defaults,n);n.datatype&&d.extend(a.util.dataType,n.datatype);var m=this;m.tipmsg={w:{}};m.forms=l;m.objects=[];if(k===true){return false}l.each(function(){if(this.validform_inited=="inited"){return true}this.validform_inited="inited";var p=this;p.settings=d.extend({},n);var o=d(p);p.validform_status="normal";o.data("tipmsg",m.tipmsg);o.delegate("[datatype]","blur",function(){var q=arguments[1];a.util.check.call(this,o,q)});o.delegate(":text","keypress",function(q){if(q.keyCode==13&&o.find(":submit").length==0){o.submit()}});a.util.enhance.call(o,p.settings.tiptype,p.settings.usePlugin,p.settings.tipSweep);p.settings.btnSubmit&&o.find(p.settings.btnSubmit).bind("click",function(){o.trigger("submit");return false});o.submit(function(){var q=a.util.submitForm.call(o,p.settings);q===b&&(q=true);return q});o.find("[type='reset']").add(o.find(p.settings.btnReset)).bind("click",function(){a.util.resetForm.call(o)})});if(n.tiptype==1||(n.tiptype==2||n.tiptype==3)&&n.ajaxPost){c()}};a.defaults={tiptype:1,tipSweep:false,showAllError:false,postonce:false,ajaxPost:false};a.util={dataType:{"*":/[\w\W]+/,"*6-16":/^[\w\W]{6,16}$/,n:/^\d+$/,"n6-16":/^\d{6,16}$/,s:/^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]+$/,"s6-18":/^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]{6,18}$/,p:/^[0-9]{6}$/,m:/^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$/,e:/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,url:/^(\w+:\/\/)?\w+(\.\w+)+.*$/},toString:Object.prototype.toString,isEmpty:function(k){return k===""||k===d.trim(this.attr("tip"))},getValue:function(m){var l,k=this;if(m.is(":radio")){l=k.find(":radio[name='"+m.attr("name")+"']:checked").val();l=l===b?"":l}else{if(m.is(":checkbox")){l="";k.find(":checkbox[name='"+m.attr("name")+"']:checked").each(function(){l+=d(this).val()+","});l=l===b?"":l}else{l=m.val()}}l=d.trim(l);return a.util.isEmpty.call(m,l)?"":l},enhance:function(l,m,n,k){var o=this;o.find("[datatype]").each(function(){if(l==2){if(d(this).parent().next().find(".Validform_checktip").length==0){d(this).parent().next().append("<span class='Validform_checktip' />");d(this).siblings(".Validform_checktip").remove()}}else{if(l==3||l==4){if(d(this).siblings(".Validform_checktip").length==0){d(this).parent().append("<span class='Validform_checktip' />");d(this).parent().next().find(".Validform_checktip").remove()}}}});o.find("input[recheck]").each(function(){if(this.validform_inited=="inited"){return true}this.validform_inited="inited";var q=d(this);var p=o.find("input[name='"+d(this).attr("recheck")+"']");p.bind("keyup",function(){if(p.val()==q.val()&&p.val()!=""){if(p.attr("tip")){if(p.attr("tip")==p.val()){return false}}q.trigger("blur")}}).bind("blur",function(){if(p.val()!=q.val()&&q.val()!=""){if(q.attr("tip")){if(q.attr("tip")==q.val()){return false}}q.trigger("blur")}})});o.find("[tip]").each(function(){if(this.validform_inited=="inited"){return true}this.validform_inited="inited";var q=d(this).attr("tip");var p=d(this).attr("altercss");d(this).focus(function(){if(d(this).val()==q){d(this).val("");if(p){d(this).removeClass(p)}}}).blur(function(){if(d.trim(d(this).val())===""){d(this).val(q);if(p){d(this).addClass(p)}}})});o.find(":checkbox[datatype],:radio[datatype]").each(function(){if(this.validform_inited=="inited"){return true}this.validform_inited="inited";var q=d(this);var p=q.attr("name");o.find("[name='"+p+"']").filter(":checkbox,:radio").bind("click",function(){setTimeout(function(){q.trigger("blur")},0)})});o.find("select[datatype][multiple]").bind("click",function(){var p=d(this);setTimeout(function(){p.trigger("blur")},0)});a.util.usePlugin.call(o,m,l,n,k)},usePlugin:function(o,l,n,r){var s=this,o=o||{};if(s.find("input[plugin='swfupload']").length&&typeof(swfuploadhandler)!="undefined"){var k={custom_settings:{form:s,showmsg:function(v,t,u){a.util.showmsg.call(s,v,l,{obj:s.find("input[plugin='swfupload']"),type:t,sweep:n})}}};k=d.extend(true,{},o.swfupload,k);s.find("input[plugin='swfupload']").each(function(t){if(this.validform_inited=="inited"){return true}this.validform_inited="inited";d(this).val("");swfuploadhandler.init(k,t)})}if(s.find("input[plugin='datepicker']").length&&d.fn.datePicker){o.datepicker=o.datepicker||{};if(o.datepicker.format){Date.format=o.datepicker.format;delete o.datepicker.format}if(o.datepicker.firstDayOfWeek){Date.firstDayOfWeek=o.datepicker.firstDayOfWeek;delete o.datepicker.firstDayOfWeek}s.find("input[plugin='datepicker']").each(function(t){if(this.validform_inited=="inited"){return true}this.validform_inited="inited";o.datepicker.callback&&d(this).bind("dateSelected",function(){var u=new Date(d.event._dpCache[this._dpId].getSelected()[0]).asString(Date.format);o.datepicker.callback(u,this)});d(this).datePicker(o.datepicker)})}if(s.find("input[plugin*='passwordStrength']").length&&d.fn.passwordStrength){o.passwordstrength=o.passwordstrength||{};o.passwordstrength.showmsg=function(u,v,t){a.util.showmsg.call(s,v,l,{obj:u,type:t,sweep:n})};s.find("input[plugin='passwordStrength']").each(function(t){if(this.validform_inited=="inited"){return true}this.validform_inited="inited";d(this).passwordStrength(o.passwordstrength)})}if(r!="addRule"&&o.jqtransform&&d.fn.jqTransSelect){if(s[0].jqTransSelected=="true"){return}s[0].jqTransSelected="true";var m=function(t){var u=d(".jqTransformSelectWrapper ul:visible");u.each(function(){var v=d(this).parents(".jqTransformSelectWrapper:first").find("select").get(0);if(!(t&&v.oLabel&&v.oLabel.get(0)==t.get(0))){d(this).hide()}})};var p=function(t){if(d(t.target).parents(".jqTransformSelectWrapper").length===0){m(d(t.target))}};var q=function(){d(document).mousedown(p)};if(o.jqtransform.selector){s.find(o.jqtransform.selector).filter('input:submit, input:reset, input[type="button"]').jqTransInputButton();s.find(o.jqtransform.selector).filter("input:text, input:password").jqTransInputText();s.find(o.jqtransform.selector).filter("input:checkbox").jqTransCheckBox();s.find(o.jqtransform.selector).filter("input:radio").jqTransRadio();s.find(o.jqtransform.selector).filter("textarea").jqTransTextarea();if(s.find(o.jqtransform.selector).filter("select").length>0){s.find(o.jqtransform.selector).filter("select").jqTransSelect();q()}}else{s.jqTransform()}s.find(".jqTransformSelectWrapper").find("li a").click(function(){d(this).parents(".jqTransformSelectWrapper").find("select").trigger("blur")})}},getNullmsg:function(o){var n=this;var m=/[\u4E00-\u9FA5\uf900-\ufa2da-zA-Z\s]+/g;var k;var l=o[0].settings.label||".Validform_label";l=n.siblings(l).eq(0).text()||n.siblings().find(l).eq(0).text()||n.parent().siblings(l).eq(0).text()||n.parent().siblings().find(l).eq(0).text();l=l.replace(/\s(?![a-zA-Z])/g,"").match(m);l=l?l.join(""):[""];m=/\{(.+)\|(.+)\}/;k=o.data("tipmsg").s||e.s;if(l!=""){k=k.replace(/\{0\|(.+)\}/,l);if(n.attr("recheck")){k=k.replace(/\{(.+)\}/,"");n.attr("nullmsg",k);return k}}else{k=n.is(":checkbox,:radio,select")?k.replace(/\{0\|(.+)\}/,""):k.replace(/\{0\|(.+)\}/,"$1")}k=n.is(":checkbox,:radio,select")?k.replace(m,"$2"):k.replace(m,"$1");n.attr("nullmsg",k);return k},getErrormsg:function(s,n,u){var o=/^(.+?)((\d+)-(\d+))?$/,m=/^(.+?)(\d+)-(\d+)$/,l=/(.*?)\d+(.+?)\d+(.*)/,q=n.match(o),t,r;if(u=="recheck"){r=s.data("tipmsg").reck||e.reck;return r}var p=d.extend({},e.w,s.data("tipmsg").w);if(q[0] in p){return s.data("tipmsg").w[q[0]]||e.w[q[0]]}for(var k in p){if(k.indexOf(q[1])!=-1&&m.test(k)){r=(s.data("tipmsg").w[k]||e.w[k]).replace(l,"$1"+q[3]+"$2"+q[4]+"$3");s.data("tipmsg").w[q[0]]=r;return r}}return s.data("tipmsg").def||e.def},_regcheck:function(t,n,u,A){var A=A,y=null,v=false,o=/\/.+\//g,k=/^(.+?)(\d+)-(\d+)$/,l=3;if(o.test(t)){var s=t.match(o)[0].slice(1,-1);var r=t.replace(o,"");var q=RegExp(s,r);v=q.test(n)}else{if(a.util.toString.call(a.util.dataType[t])=="[object Function]"){v=a.util.dataType[t](n,u,A,a.util.dataType);if(v===true||v===b){v=true}else{y=v;v=false}}else{if(!(t in a.util.dataType)){var m=t.match(k),z;if(!m){v=false;y=A.data("tipmsg").undef||e.undef}else{for(var B in a.util.dataType){z=B.match(k);if(!z){continue}if(m[1]===z[1]){var w=a.util.dataType[B].toString(),r=w.match(/\/[mgi]*/g)[1].replace("/",""),x=new RegExp("\\{"+z[2]+","+z[3]+"\\}","g");w=w.replace(/\/[mgi]*/g,"/").replace(x,"{"+m[2]+","+m[3]+"}").replace(/^\//,"").replace(/\/$/,"");a.util.dataType[t]=new RegExp(w,r);break}}}}if(a.util.toString.call(a.util.dataType[t])=="[object RegExp]"){v=a.util.dataType[t].test(n)}}}if(v){l=2;y=u.attr("sucmsg")||A.data("tipmsg").r||e.r;if(u.attr("recheck")){var p=A.find("input[name='"+u.attr("recheck")+"']:first");if(n!=p.val()){v=false;l=3;y=u.attr("errormsg")||a.util.getErrormsg.call(u,A,t,"recheck")}}}else{y=y||u.attr("errormsg")||a.util.getErrormsg.call(u,A,t);if(a.util.isEmpty.call(u,n)){y=u.attr("nullmsg")||a.util.getNullmsg.call(u,A)}}return{passed:v,type:l,info:y}},regcheck:function(n,s,m){var t=this,k=null,l=false,r=3;if(m.attr("ignore")==="ignore"&&a.util.isEmpty.call(m,s)){if(m.data("cked")){k=""}return{passed:true,type:4,info:k}}m.data("cked","cked");var u=a.util.parseDatatype(n);var q;for(var p=0;p<u.length;p++){for(var o=0;o<u[p].length;o++){q=a.util._regcheck(u[p][o],s,m,t);if(!q.passed){break}}if(q.passed){break}}return q},parseDatatype:function(r){var q=/\/.+?\/[mgi]*(?=(,|$|\||\s))|[\w\*-]+/g,o=r.match(q),p=r.replace(q,"").replace(/\s*/g,"").split(""),l=[],k=0;l[0]=[];l[0].push(o[0]);for(var s=0;s<p.length;s++){if(p[s]=="|"){k++;l[k]=[]}l[k].push(o[s+1])}return l},showmsg:function(n,l,m,k){if(n==b){return}if(k=="bycheck"&&m.sweep&&(m.obj&&!m.obj.is(".Validform_error")||typeof l=="function")){return}d.extend(m,{curform:this});if(typeof l=="function"){l(n,m,a.util.cssctl);return}if(l==1||k=="byajax"&&l!=4){j.find(".Validform_info").html(n)}if(l==1&&k!="bycheck"&&m.type!=2||k=="byajax"&&l!=4){i=false;j.find(".iframe").css("height",j.outerHeight());j.show();h(j,100)}if(l==2&&m.obj){m.obj.parent().next().find(".Validform_checktip").html(n);a.util.cssctl(m.obj.parent().next().find(".Validform_checktip"),m.type)}if((l==3||l==4)&&m.obj){m.obj.siblings(".Validform_checktip").html(n);a.util.cssctl(m.obj.siblings(".Validform_checktip"),m.type)}},cssctl:function(l,k){switch(k){case 1:l.removeClass("Validform_right Validform_wrong").addClass("Validform_checktip Validform_loading");break;case 2:l.removeClass("Validform_wrong Validform_loading").addClass("Validform_checktip Validform_right");break;case 4:l.removeClass("Validform_right Validform_wrong Validform_loading").addClass("Validform_checktip");break;default:l.removeClass("Validform_right Validform_loading").addClass("Validform_checktip Validform_wrong")}},check:function(v,t,n){var o=v[0].settings;var t=t||"";var k=a.util.getValue.call(v,d(this));if(o.ignoreHidden&&d(this).is(":hidden")||d(this).data("dataIgnore")==="dataIgnore"){return true}if(o.dragonfly&&!d(this).data("cked")&&a.util.isEmpty.call(d(this),k)&&d(this).attr("ignore")!="ignore"){return false}var s=a.util.regcheck.call(v,d(this).attr("datatype"),k,d(this));if(k==this.validform_lastval&&!d(this).attr("recheck")&&t==""){return s.passed?true:false}this.validform_lastval=k;var r;g=r=d(this);if(!s.passed){a.util.abort.call(r[0]);if(!n){a.util.showmsg.call(v,s.info,o.tiptype,{obj:d(this),type:s.type,sweep:o.tipSweep},"bycheck");!o.tipSweep&&r.addClass("Validform_error")}return false}var q=d(this).attr("ajaxurl");if(q&&!a.util.isEmpty.call(d(this),k)&&!n){var m=d(this);if(t=="postform"){m[0].validform_subpost="postform"}else{m[0].validform_subpost=""}if(m[0].validform_valid==="posting"&&k==m[0].validform_ckvalue){return"ajax"}m[0].validform_valid="posting";m[0].validform_ckvalue=k;a.util.showmsg.call(v,v.data("tipmsg").c||e.c,o.tiptype,{obj:m,type:1,sweep:o.tipSweep},"bycheck");a.util.abort.call(r[0]);var u=d.extend(true,{},o.ajaxurl||{});var p={type:"POST",cache:false,url:q,data:"param="+encodeURIComponent(k)+"&name="+encodeURIComponent(d(this).attr("name")),success:function(x){if(d.trim(x.status)==="y"){m[0].validform_valid="true";x.info&&m.attr("sucmsg",x.info);a.util.showmsg.call(v,m.attr("sucmsg")||v.data("tipmsg").r||e.r,o.tiptype,{obj:m,type:2,sweep:o.tipSweep},"bycheck");r.removeClass("Validform_error");g=null;if(m[0].validform_subpost=="postform"){v.trigger("submit")}}else{m[0].validform_valid=x.info;a.util.showmsg.call(v,x.info,o.tiptype,{obj:m,type:3,sweep:o.tipSweep});r.addClass("Validform_error")}r[0].validform_ajax=null},error:function(x){if(x.status=="200"){if(x.responseText=="y"){u.success({status:"y"})}else{u.success({status:"n",info:x.responseText})}return false}if(x.statusText!=="abort"){var y="status: "+x.status+"; statusText: "+x.statusText;a.util.showmsg.call(v,y,o.tiptype,{obj:m,type:3,sweep:o.tipSweep});r.addClass("Validform_error")}m[0].validform_valid=x.statusText;r[0].validform_ajax=null;return true}};if(u.success){var w=u.success;u.success=function(x){p.success(x);w(x,m)}}if(u.error){var l=u.error;u.error=function(x){p.error(x)&&l(x,m)}}u=d.extend({},p,u,{dataType:"json"});r[0].validform_ajax=d.ajax(u);return"ajax"}else{if(q&&a.util.isEmpty.call(d(this),k)){a.util.abort.call(r[0]);r[0].validform_valid="true"}}if(!n){a.util.showmsg.call(v,s.info,o.tiptype,{obj:d(this),type:s.type,sweep:o.tipSweep},"bycheck");r.removeClass("Validform_error")}g=null;return true},submitForm:function(o,l,k,r,t){var w=this;if(w[0].validform_status==="posting"){return false}if(o.postonce&&w[0].validform_status==="posted"){return false}var v=o.beforeCheck&&o.beforeCheck(w);if(v===false){return false}var s=true,n;w.find("[datatype]").each(function(){if(l){return false}if(o.ignoreHidden&&d(this).is(":hidden")||d(this).data("dataIgnore")==="dataIgnore"){return true}var z=a.util.getValue.call(w,d(this)),A;g=A=d(this);n=a.util.regcheck.call(w,d(this).attr("datatype"),z,d(this));if(!n.passed){a.util.showmsg.call(w,n.info,o.tiptype,{obj:d(this),type:n.type,sweep:o.tipSweep});A.addClass("Validform_error");if(!o.showAllError){A.focus();s=false;return false}s&&(s=false);return true}if(d(this).attr("ajaxurl")&&!a.util.isEmpty.call(d(this),z)){if(this.validform_valid!=="true"){var y=d(this);a.util.showmsg.call(w,w.data("tipmsg").v||e.v,o.tiptype,{obj:y,type:3,sweep:o.tipSweep});A.addClass("Validform_error");y.trigger("blur",["postform"]);if(!o.showAllError){s=false;return false}s&&(s=false);return true}}else{if(d(this).attr("ajaxurl")&&a.util.isEmpty.call(d(this),z)){a.util.abort.call(this);this.validform_valid="true"}}a.util.showmsg.call(w,n.info,o.tiptype,{obj:d(this),type:n.type,sweep:o.tipSweep});A.removeClass("Validform_error");g=null});if(o.showAllError){w.find(".Validform_error:first").focus()}if(s){var q=o.beforeSubmit&&o.beforeSubmit(w);if(q===false){return false}w[0].validform_status="posting";if(o.ajaxPost||r==="ajaxPost"){var u=d.extend(true,{},o.ajaxpost||{});u.url=k||u.url||o.url||w.attr("action");a.util.showmsg.call(w,w.data("tipmsg").p||e.p,o.tiptype,{obj:w,type:1,sweep:o.tipSweep},"byajax");if(t){u.async=false}else{if(t===false){u.async=true}}if(u.success){var x=u.success;u.success=function(y){o.callback&&o.callback(y);w[0].validform_ajax=null;if(d.trim(y.status)==="y"){w[0].validform_status="posted"}else{w[0].validform_status="normal"}x(y,w)}}if(u.error){var m=u.error;u.error=function(y){o.callback&&o.callback(y);w[0].validform_status="normal";w[0].validform_ajax=null;m(y,w)}}var p={type:"POST",async:true,data:w.serializeArray(),success:function(y){if(d.trim(y.status)==="y"){w[0].validform_status="posted";a.util.showmsg.call(w,y.info,o.tiptype,{obj:w,type:2,sweep:o.tipSweep},"byajax")}else{w[0].validform_status="normal";a.util.showmsg.call(w,y.info,o.tiptype,{obj:w,type:3,sweep:o.tipSweep},"byajax")}o.callback&&o.callback(y);w[0].validform_ajax=null},error:function(y){var z="status: "+y.status+"; statusText: "+y.statusText;a.util.showmsg.call(w,z,o.tiptype,{obj:w,type:3,sweep:o.tipSweep},"byajax");o.callback&&o.callback(y);w[0].validform_status="normal";w[0].validform_ajax=null}};u=d.extend({},p,u,{dataType:"json"});w[0].validform_ajax=d.ajax(u)}else{if(!o.postonce){w[0].validform_status="normal"}var k=k||o.url;if(k){w.attr("action",k)}return o.callback&&o.callback(w)}}return false},resetForm:function(){var k=this;k.each(function(){this.reset&&this.reset();this.validform_status="normal"});k.find(".Validform_right").text("");k.find(".passwordStrength").children().removeClass("bgStrength");k.find(".Validform_checktip").removeClass("Validform_wrong Validform_right Validform_loading");k.find(".Validform_error").removeClass("Validform_error");k.find("[datatype]").removeData("cked").removeData("dataIgnore").each(function(){this.validform_lastval=null});k.eq(0).find("input:first").focus()},abort:function(){if(this.validform_ajax){this.validform_ajax.abort()}}};d.Datatype=a.util.dataType;a.prototype={dataType:a.util.dataType,eq:function(l){var k=this;if(l>=k.forms.length){return null}if(!(l in k.objects)){k.objects[l]=new a(d(k.forms[l]).get(),{},true)}return k.objects[l]},resetStatus:function(){var k=this;d(k.forms).each(function(){this.validform_status="normal"});return this},setStatus:function(k){var l=this;d(l.forms).each(function(){this.validform_status=k||"posting"});return this},getStatus:function(){var l=this;var k=d(l.forms)[0].validform_status;return k},ignore:function(k){var l=this;var k=k||"[datatype]";d(l.forms).find(k).each(function(){d(this).data("dataIgnore","dataIgnore").removeClass("Validform_error")});return this},unignore:function(k){var l=this;var k=k||"[datatype]";d(l.forms).find(k).each(function(){d(this).removeData("dataIgnore")});return this},addRule:function(n){var m=this;var n=n||[];for(var l=0;l<n.length;l++){var p=d(m.forms).find(n[l].ele);for(var k in n[l]){k!=="ele"&&p.attr(k,n[l][k])}}d(m.forms).each(function(){var o=d(this);a.util.enhance.call(o,this.settings.tiptype,this.settings.usePlugin,this.settings.tipSweep,"addRule")});return this},ajaxPost:function(k,m,l){var n=this;d(n.forms).each(function(){if(this.settings.tiptype==1||this.settings.tiptype==2||this.settings.tiptype==3){c()}a.util.submitForm.call(d(n.forms[0]),this.settings,k,l,"ajaxPost",m)});return this},submitForm:function(k,l){var m=this;d(m.forms).each(function(){var n=a.util.submitForm.call(d(this),this.settings,k,l);n===b&&(n=true);if(n===true){this.submit()}});return this},resetForm:function(){var k=this;a.util.resetForm.call(d(k.forms));return this},abort:function(){var k=this;d(k.forms).each(function(){a.util.abort.call(this)});return this},check:function(m,k){var k=k||"[datatype]",o=this,n=d(o.forms),l=true;n.find(k).each(function(){a.util.check.call(this,n,"",m)||(l=false)});return l},config:function(k){var l=this;k=k||{};d(l.forms).each(function(){var m=d(this);this.settings=d.extend(true,this.settings,k);a.util.enhance.call(m,this.settings.tiptype,this.settings.usePlugin,this.settings.tipSweep)});return this}};d.fn.Validform=function(k){return new a(this,k)};function h(n,m){var l=(d(window).width()-n.outerWidth())/2,k=(d(window).height()-n.outerHeight())/2,k=(document.documentElement.scrollTop?document.documentElement.scrollTop:document.body.scrollTop)+(k>0?k:0);n.css({left:l}).animate({top:k},{duration:m,queue:false})}function c(){if(d("#Validform_msg").length!==0){return false}j=d('<div id="Validform_msg"><div class="Validform_title">'+e.tit+'<a class="Validform_close" href="javascript:void(0);">&chi;</a></div><div class="Validform_info"></div><div class="iframe"><iframe frameborder="0" scrolling="no" height="100%" width="100%"></iframe></div></div>').appendTo("body");j.find("a.Validform_close").click(function(){j.hide();i=true;if(g){g.focus().addClass("Validform_error")}return false}).focus(function(){this.blur()});d(window).bind("scroll resize",function(){!i&&h(j,400)})}d.Showmsg=function(k){c();a.util.showmsg.call(f,k,1,{})};d.Hidemsg=function(){j.hide();i=true}})(jQuery,window);

/*
    Validform datatype extension
	By sean during December 8, 2012 - February 20, 2013
	For more information, please visit http://validform.rjboy.cn
	
	扩展以下类型：
	date：匹配日期
	zh：匹配中文字符
	dword：匹配双字节字符
	money：匹配货币类型
	ipv4：匹配ipv4地址
	ipv6：匹配ipv6地址
	num：匹配数值型
	qq：匹配qq号码
	unequal：当前值不能等于被检测的值，如可以用来检测新密码不能与旧密码一样
	notvalued：当前值不能包含指定值，如密码不能包含用户名等的检测
	min：多选框最少选择多少项
	max：多选框最多不能超过多少项
	byterange:判断字符长度，中文算两个字符
	numrange：判断数值范围，如小于100大于10之间的数
	daterange：判断日期范围
	idcard：对身份证号码进行严格验证
*/

(function(){
	if($.Datatype){
		$.extend($.Tipmsg.w,{
			"date":"请填写日期！",
			"zh":"请填写中文！",
			"dword":"请填写双字节字符！",
			"money":"请填写货币值！",
			"ipv4":"请填写ip地址！",
			"ipv6":"请填写IPv6地址！",
			"num":"请填写数值！",
			"qq":"请填写QQ号码！",
			"unequal":"值不能相等！",
			"notvalued":"不能含有特定值！",
			"idcard":"身份证号码不对！"
		});
		
		$.extend($.Datatype,{
			/*
				reference http://blog.csdn.net/lxcnn/article/details/4362500;
				
				日期格式可以是：20120102 / 2012.01.02 / 2012/01/02 / 2012-01-02
				时间格式可以是：10:01:10 / 02:10
				如 2012-01-02 02:10
				   2012-01-02
			*/
			"date":/^(?:(?:1[6-9]|[2-9][0-9])[0-9]{2}([-/.]?)(?:(?:0?[1-9]|1[0-2])\1(?:0?[1-9]|1[0-9]|2[0-8])|(?:0?[13-9]|1[0-2])\1(?:29|30)|(?:0?[13578]|1[02])\1(?:31))|(?:(?:1[6-9]|[2-9][0-9])(?:0[48]|[2468][048]|[13579][26])|(?:16|[2468][048]|[3579][26])00)([-/.]?)0?2\2(?:29))(\s+([01][0-9]:|2[0-3]:)?[0-5][0-9]:[0-5][0-9])?$/,
			
			//匹配中文字符;
			"zh":/^[\u4e00-\u9fa5]+$/,
			
			//匹配双字节字符;
			"dword":/^[^\x00-\xff]+$/,
			
			//货币类型;
			"money":/^([\u0024\u00A2\u00A3\u00A4\u20AC\u00A5\u20B1\20B9\uFFE5]\s*)(\d+,?)+\.?\d*\s*$/,
			
			//匹配ipv4地址;
			"ipv4":/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/,
			
			/*
				匹配ipv6地址;
				reference http://forums.intermapper.com/viewtopic.php?t=452;
			*/
			"ipv6":/^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/,
			
			
			//数值型;
			"num":/^(\d+[\s,]*)+\.?\d*$/,
			
			
			//QQ号码;
			"qq":/^[1-9][0-9]{4,}$/,
			
			
			/*
			  参数gets是获取到的表单元素值，
			  obj为当前表单元素，
			  curform为当前验证的表单，
			  datatype为内置的一些正则表达式的引用。
			*/
			"unequal":function(gets,obj,curform,datatype){
				/*
					当前值不能与指定表单元素的值一样，如新密码不能与旧密码一样，密码不能设置为用户名等
					注意需要通过绑定with属性来指定要比较的表单元素，可以是clas，id或者是name属性值

					eg.  <input type="text" name="name" id="name" class="name" />
					eg1. <input type="text" name="test" datatype="unequal" with="name" />
					eg2. <input type="text" name="test" datatype="unequal" with=".name" />
					eg3. <input type="text" name="test" datatype="unequal" with="#name" />
					
					也可以用来验证不能与with指定的值相等
					当上面根据class，id和name都查找不到对象时，会直接跟with的值比较
					eg4. <input type="text" name="test" datatype="num unequal" with="100" />
					该文本框的值不能等于100
				*/
				var withele=$.trim(obj.attr("with"));
				var val=curform.find(withele+",[name='"+withele+"']").val() || withele;

				if(gets==$.trim(val)){
					return false;
				}
			},
			
			
			"notvalued":function(gets,obj,curform,datatype){
				/*
					当前文本框的值不能含有指定文本框的值，如注册时设置的密码里不能包含用户名
					注意需要给表单元素绑定with属性来指定要比较的表单元素，可以是clas，id或者是name属性值
					<input type="text" name="username" id="name" class="name" />
					eg. <input type="password" name="test" datatype="notvalued" with=".name" />
					
					也可以用来验证不能包含with指定的值
					当上面根据class，id和name都查找不到对象时，会直接跟with的值比较
					eg2. <input type="password" name="test" datatype="notvalued" with="validform" />
					要求不能含有"validform"字符
				*/
				var withele=$.trim(obj.attr("with"));
				var val=curform.find(withele+",[name='"+withele+"']").val() || withele;

				if(gets.indexOf($.trim(val))!=-1){
					return false;
				}
			},
			
			
			"min":function(gets,obj,curform,datatype){
				/*
					checkbox最少选择n项
					注意需要给表单元素绑定min属性来指定是至少需要选择几项，没有绑定的话使用默认值
					eg. <input type="checkbox" name="test" datatype="min" min="3" />
				*/
				
				var minim=~~obj.attr("min") || 2,
					numselected=curform.find("input[name='"+obj.attr("name")+"']:checked").length;
				return  numselected >= minim ? true : "请至少选择"+minim+"项！";
			},
			
			
			"max":function(gets,obj,curform,datatype){
				/*
					checkbox最多选择n项
					注意需要给表单元素绑定max属性来指定是最多需要选择几项，没有绑定的话使用默认值
					eg. <input type="checkbox" name="test" datatype="max" max="3" />
				*/
				
				var atmax=~~obj.attr("max") || 2,
					numselected=curform.find("input[name='"+obj.attr("name")+"']:checked").length;
					
				if(numselected==0){
					return false;
				}else if(numselected>atmax){
					return "最多只能选择"+atmax+"项！";
				}
				return  true;
			},
			
			
			"byterange":function(gets,obj,curform,datatype){
				/*
					判断字符长度，中文算两个字符
					注意需要给表单元素绑定max,min属性来指定最大或最小允许的字符长度，没有绑定的话使用默认值
				*/
				var dregx=/[^\x00-\xff]/g;
				var maxim=~~obj.attr("max") || 100000000,
					minim=~~obj.attr("min") || 0;
					
				var getslen=gets.replace(dregx,"00").length;
				
				if(getslen>maxim){
					return "输入字符不能多于"+maxim+"个，中文算两个字符！";
				}
				
				if(getslen<minim){
					return "输入字符不能少于"+minim+"个，中文算两个字符！";
				}
				
				return true;
			},
			
			
			"numrange":function(gets,obj,curform,datatype){
				/*
					判断数值范围
					注意需要给表单元素绑定max,min属性来指定最大或最小可输入的值，没有绑定的话使用默认值
				*/
				
				var maxim=~~obj.attr("max") || 100000000,
					minim=~~obj.attr("min") || 0;
				
				gets=gets.replace(/\s*/g,"").replace(/,/g,"");
				if(!/^\d+\.?\d*$/.test(gets)){
					return "只能输入数字！";
				}
				
				if(gets<minim){
					return "值不能小于"+minim+"！";
				}else if(gets>maxim){
					return "值不能大于"+maxim+"！";
				}
				return  true;
			},
		
			
			"daterange":function(gets,obj,curform,datatype){
				/*
					判断日期范围
					注意需要给表单元素绑定max或min属性，或两个同时绑定来指定最大或最小可输入的日期
					日期格式：2012/12/29 或 2012-12-29 或 2012.12.29 或 2012,12,29
				*/
				var maxim=new Date(obj.attr("max").replace(/[-\.,]/g,"/")),
					minim=new Date(obj.attr("min").replace(/[-\.,]/g,"/")),
					gets=new Date(gets.replace(/[-\.,]/g,"/"));

				if(!gets.getDate()){
					return "日期格式不对！";
				}
				
				if(gets>maxim){
					return "日期不能大于"+obj.attr("max");	
				}
				
				if(gets<minim){
					return "日期不能小于"+obj.attr("min");
				}
				
				return true;
			},
			
			
			"idcard":function(gets,obj,curform,datatype){
				/*
					该方法由网友提供;
					对身份证进行严格验证;
				*/
			
				var Wi = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1 ];// 加权因子;
				var ValideCode = [ 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ];// 身份证验证位值，10代表X;
			
				if (gets.length == 15) {   
					return isValidityBrithBy15IdCard(gets);   
				}else if (gets.length == 18){   
					var a_idCard = gets.split("");// 得到身份证数组   
					if (isValidityBrithBy18IdCard(gets)&&isTrueValidateCodeBy18IdCard(a_idCard)) {   
						return true;   
					}   
					return false;
				}
				return false;
				
				function isTrueValidateCodeBy18IdCard(a_idCard) {   
					var sum = 0; // 声明加权求和变量   
					if (a_idCard[17].toLowerCase() == 'x') {   
						a_idCard[17] = 10;// 将最后位为x的验证码替换为10方便后续操作   
					}   
					for ( var i = 0; i < 17; i++) {   
						sum += Wi[i] * a_idCard[i];// 加权求和   
					}   
					var valCodePosition = sum % 11;// 得到验证码所位置
					if (a_idCard[17] == ValideCode[valCodePosition]) {   
						return true;   
					}
					return false;   
				}
				
				function isValidityBrithBy18IdCard(idCard18){   
					var year = idCard18.substring(6,10);   
					var month = idCard18.substring(10,12);   
					var day = idCard18.substring(12,14);   
					var temp_date = new Date(year,parseFloat(month)-1,parseFloat(day));   
					// 这里用getFullYear()获取年份，避免千年虫问题   
					if(temp_date.getFullYear()!=parseFloat(year) || temp_date.getMonth()!=parseFloat(month)-1 || temp_date.getDate()!=parseFloat(day)){   
						return false;   
					}
					return true;   
				}
				
				function isValidityBrithBy15IdCard(idCard15){   
					var year =  idCard15.substring(6,8);   
					var month = idCard15.substring(8,10);   
					var day = idCard15.substring(10,12);
					var temp_date = new Date(year,parseFloat(month)-1,parseFloat(day));   
					// 对于老身份证中的你年龄则不需考虑千年虫问题而使用getYear()方法   
					if(temp_date.getYear()!=parseFloat(year) || temp_date.getMonth()!=parseFloat(month)-1 || temp_date.getDate()!=parseFloat(day)){   
						return false;   
					}
					return true;
				}
				
			}
		});
	}else{
		// setTimeout(arguments.callee,10);
	}
})();
(function(a){a.fn.passwordStrength=function(b){b=a.extend({},a.fn.passwordStrength.defaults,b);this.each(function(){var d=a(this),e=0,c=false,f=a(this).parents("form").find(".passwordStrength");d.bind("keyup blur",function(){e=a.fn.passwordStrength.ratepasswd(d.val(),b);e>=0&&c==false&&(c=true);f.find("span").removeClass("bgStrength");if(e<35&&e>=0){f.find("span:first").addClass("bgStrength")}else{if(e<60&&e>=35){f.find("span:lt(2)").addClass("bgStrength")}else{if(e>=60){f.find("span:lt(3)").addClass("bgStrength")}}}if(c&&(d.val().length<b.minLen||d.val().length>b.maxLen)){b.showmsg(d,d.attr("errormsg"),3)}else{if(c){b.showmsg(d,"",2)}}b.trigger(d,!(e>=0))})})};a.fn.passwordStrength.ratepasswd=function(c,d){var b=c.length,e;if(b>=d.minLen&&b<=d.maxLen){e=a.fn.passwordStrength.checkStrong(c)}else{e=-1}return e/4*100};a.fn.passwordStrength.checkStrong=function(d){var e=0,b=d.length;for(var c=0;c<b;c++){e|=a.fn.passwordStrength.charMode(d.charCodeAt(c))}return a.fn.passwordStrength.bitTotal(e)};a.fn.passwordStrength.charMode=function(b){if(b>=48&&b<=57){return 1}else{if(b>=65&&b<=90){return 2}else{if(b>=97&&b<=122){return 4}else{return 8}}}};a.fn.passwordStrength.bitTotal=function(b){var d=0;for(var c=0;c<4;c++){if(b&1){d++}b>>>=1}return d};a.fn.passwordStrength.defaults={minLen:0,maxLen:30,trigger:a.noop}})(jQuery);

(function($){
	$.fn.passwordStrength=function(settings){
		settings=$.extend({},$.fn.passwordStrength.defaults,settings);
		
		this.each(function(){
			var $this=$(this),
				scores = 0,
				checkingerror=false,
				pstrength=$(this).parents("form").find(".passwordStrength");
				
			$this.bind("keyup blur",function(){
				scores = $.fn.passwordStrength.ratepasswd($this.val(),settings);
				scores>=0 && checkingerror==false && (checkingerror=true);
				
				pstrength.find("span").removeClass("bgStrength");
				if(scores < 35 && scores >=0){
					pstrength.find("span:first").addClass("bgStrength");
				}else if(scores < 60 && scores >=35){
					pstrength.find("span:lt(2)").addClass("bgStrength");
				}else if(scores >= 60){
					pstrength.find("span:lt(3)").addClass("bgStrength");
				}
				
				if(checkingerror && ($this.val().length<settings.minLen || $this.val().length>settings.maxLen) ){
					settings.showmsg($this,$this.attr("errormsg"),3);
				}else if(checkingerror){
					settings.showmsg($this,"",2);
				}
				
				settings.trigger($this,!(scores>=0));
			});
		});	
	}
	
	$.fn.passwordStrength.ratepasswd=function(passwd,config){
		//判断密码强度
		var len = passwd.length, scores;
		if(len >= config.minLen && len <= config.maxLen){
			scores = $.fn.passwordStrength.checkStrong(passwd);
		}else{
			scores = -1;
		}
	
		return scores/4*100;
			
	}
	
	//密码强度;
	$.fn.passwordStrength.checkStrong=function(content){
		var modes = 0, len = content.length;
		for(var i = 0;i < len; i++){
			modes |= $.fn.passwordStrength.charMode(content.charCodeAt(i));
		}
		return $.fn.passwordStrength.bitTotal(modes);	
	}
	
	//字符类型;
	$.fn.passwordStrength.charMode=function(content){
		if(content >= 48 && content <= 57){ // 0-9
			return 1;
		}else if(content >= 65 && content <= 90){ // A-Z
			return 2;
		}else if(content >= 97 && content <= 122){ // a-z
			return 4;
		}else{ // 其它
			return 8;
		}
	}
	
	//计算出当前密码当中一共有多少种模式;
	$.fn.passwordStrength.bitTotal=function(num){
		var modes = 0;
		for(var i = 0;i < 4;i++){
			if(num & 1){modes++;}
			num >>>= 1;
		}
		return modes;
	}
	
	$.fn.passwordStrength.defaults={
		minLen:0,
		maxLen:30,
		trigger:$.noop
	}
})(jQuery);