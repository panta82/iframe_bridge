/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _require = __webpack_require__(1),
    ReservedPayloadNameError = _require.ReservedPayloadNameError;

var CONSTS = __webpack_require__(2);

function BridgePayload(source) {
	this.__bridge_payload__ = true;
	this.timestamp = new Date();

	if (!source) {
		return;
	}

	this.name = source.name;
	this.data = source.data;
}

BridgePayload.createAndValidate = function (name, data) {
	var payload = void 0;
	if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
		payload = new BridgePayload(name);
	} else {
		payload = new BridgePayload();
		payload.name = name;
		payload.data = data;
	}

	if (payload.name === CONSTS.MESSAGE_EVENT_NAME || payload.name === CONSTS.HANDSHAKE_MESSAGE_NAME) {
		throw new ReservedPayloadNameError(payload.name);
	}

	return payload;
};

BridgePayload.createHandshake = function () {
	var payload = new BridgePayload();
	payload.name = CONSTS.HANDSHAKE_MESSAGE_NAME;
	return payload;
};

module.exports = BridgePayload;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IFrameBridgeError = function (_Error) {
	_inherits(IFrameBridgeError, _Error);

	function IFrameBridgeError() {
		_classCallCheck(this, IFrameBridgeError);

		return _possibleConstructorReturn(this, (IFrameBridgeError.__proto__ || Object.getPrototypeOf(IFrameBridgeError)).apply(this, arguments));
	}

	return IFrameBridgeError;
}(Error);

var HandshakeTimeoutError = function (_IFrameBridgeError) {
	_inherits(HandshakeTimeoutError, _IFrameBridgeError);

	function HandshakeTimeoutError(timeout) {
		_classCallCheck(this, HandshakeTimeoutError);

		return _possibleConstructorReturn(this, (HandshakeTimeoutError.__proto__ || Object.getPrototypeOf(HandshakeTimeoutError)).call(this, "Handshake has timed out after " + timeout + "ms. There was no message received from the other side"));
	}

	return HandshakeTimeoutError;
}(IFrameBridgeError);

var ReservedPayloadNameError = function (_IFrameBridgeError2) {
	_inherits(ReservedPayloadNameError, _IFrameBridgeError2);

	function ReservedPayloadNameError(name) {
		_classCallCheck(this, ReservedPayloadNameError);

		return _possibleConstructorReturn(this, (ReservedPayloadNameError.__proto__ || Object.getPrototypeOf(ReservedPayloadNameError)).call(this, "Message name \"" + name + "\" is reserved for internal use"));
	}

	return ReservedPayloadNameError;
}(IFrameBridgeError);

module.exports = {
	IFrameBridgeError: IFrameBridgeError,
	HandshakeTimeoutError: HandshakeTimeoutError,
	ReservedPayloadNameError: ReservedPayloadNameError
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
	HANDSHAKE_MESSAGE_NAME: '___handshake___',
	MESSAGE_EVENT_NAME: 'message'
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var IFrameBridge = __webpack_require__(4);
var BridgePayload = __webpack_require__(0);

IFrameBridge.Payload = BridgePayload;
IFrameBridge.IFrameBridge = IFrameBridge;

module.exports = IFrameBridge;

if (typeof window !== 'undefined' && !window.IFrameBridge) {
	window.IFrameBridge = IFrameBridge;
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var EventEmitter = __webpack_require__(5);
var inherits = __webpack_require__(6);

var BridgePayload = __webpack_require__(0);
var CONSTS = __webpack_require__(2);

var _require = __webpack_require__(7),
    enqueue = _require.enqueue,
    flushQueue = _require.flushQueue;

var _require2 = __webpack_require__(1),
    HandshakeTimeoutError = _require2.HandshakeTimeoutError;

var DEFAULT_OPTIONS = {
	/**
  * The window to communicate with (inside an iFrame). If given, the bridge will work in server mode and initiate
  * the connection. Otherwise, it will listen for incoming handshake and assign source of that message as targetWindow.
  */
	targetWindow: null,

	/**
  * Origin to use when connecting to other window (only in server mode)
  */
	origin: '*',

	/**
  * How often do we attempt to reach the iFrame (only in server mode)
  */
	handshake_interval: 200,

	/**
  * How long do we attempt to reach the other iFrame before we error out
  */
	handshake_timeout: 5000,

	/**
  * Max number of messages to queue
  */
	queue_limit: 100
};

/**
 * Very basic wrapper around window.postMessage. Handles handshaking and JSON conversion.
 * Makes sure you don't lose any messages.
 * @param options Overrides for IFrameBridge.DEFAULT_OPTIONS
 * @extends EventEmitter
 */
function IFrameBridge() {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_OPTIONS;

	options = Object.assign({}, IFrameBridge.DEFAULT_OPTIONS, options);

	var _serverMode = !!options.targetWindow;
	var _targetWindow = options.targetWindow;
	var _listenWindow = options.listenWindow || window;
	var _initPromise = null;
	var _handshakeResponseHandler2 = null;
	var _connected = false;
	var _handshakeQueue = [];
	var _eventEmitter = new EventEmitter();

	_listenWindow.addEventListener('message', receiveMessage, false);

	Object.assign(this, /** @lends IFrameBridge.prototype */{
		init: init,
		postMessage: postMessage,
		on: _eventEmitter.on.bind(_eventEmitter),
		addListener: _eventEmitter.addListener.bind(_eventEmitter),
		once: _eventEmitter.once.bind(_eventEmitter),
		off: _eventEmitter.off.bind(_eventEmitter),
		removeListener: _eventEmitter.removeListener.bind(_eventEmitter),
		removeAllListeners: _eventEmitter.removeAllListeners.bind(_eventEmitter)
	});

	function init() {
		if (_connected) {
			return Promise.resolve();
		}

		if (_initPromise) {
			return _initPromise;
		}

		_initPromise = new Promise(function (resolve, reject) {
			var handshakeInterval = void 0;
			var handshakeTimeout = void 0;

			_handshakeResponseHandler2 = function _handshakeResponseHandler(messageEvent) {
				_connected = true;
				_initPromise = null;
				_handshakeResponseHandler2 = null;
				clearInterval(handshakeInterval);
				clearTimeout(handshakeTimeout);
				resolve();

				if (!_serverMode) {
					_targetWindow = messageEvent.source;
					doPostMessage(BridgePayload.createHandshake());
				}
				flushQueue(_handshakeQueue, doPostMessage);
			};

			if (_serverMode) {
				handshakeInterval = setInterval(sendHandshakeMessage, options.handshake_interval);
				sendHandshakeMessage();
			}

			if (options.handshake_timeout) {
				handshakeTimeout = setTimeout(function () {
					clearInterval(handshakeInterval);
					_initPromise = null;
					_handshakeResponseHandler2 = null;
					reject(new HandshakeTimeoutError(options.handshake_timeout));
				}, options.handshake_timeout);
			}

			function sendHandshakeMessage() {
				doPostMessage(BridgePayload.createHandshake());
			}
		});
		return _initPromise;
	}

	function postMessage(name, data) {
		var payload = BridgePayload.createAndValidate(name, data);

		if (!_connected) {
			enqueue(_handshakeQueue, payload, options.queue_limit);
			return;
		}

		return doPostMessage(payload);
	}

	function doPostMessage(payload) {
		var data = JSON.stringify(payload);

		_targetWindow.postMessage(data, options.origin);
	}

	function receiveMessage(messageEvent) {
		/** @type BridgePayload */
		var payload = void 0;
		try {
			payload = new BridgePayload(JSON.parse(messageEvent.data));
		} catch (_) {
			return;
		}

		if (!payload.__bridge_payload__) {
			return;
		}

		if (payload.name === CONSTS.HANDSHAKE_MESSAGE_NAME) {
			if (_handshakeResponseHandler2) {
				_handshakeResponseHandler2(messageEvent);
			}
			return;
		}

		if (payload.name) {
			_eventEmitter.emit(payload.name, payload.data);
		}
		_eventEmitter.emit(CONSTS.MESSAGE_EVENT_NAME, payload);
	}
}

inherits(IFrameBridge, EventEmitter);

IFrameBridge.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

module.exports = IFrameBridge;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @api private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {Mixed} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Boolean} exists Only check if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn The listener function.
 * @param {Mixed} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
  else if (!this._events[evt].fn) this._events[evt].push(listener);
  else this._events[evt] = [this._events[evt], listener];

  return this;
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn The listener function.
 * @param {Mixed} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
  else if (!this._events[evt].fn) this._events[evt].push(listener);
  else this._events[evt] = [this._events[evt], listener];

  return this;
};

/**
 * Remove the listeners of a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {Mixed} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    if (--this._eventsCount === 0) this._events = new Events();
    else delete this._events[evt];
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
         listeners.fn === fn
      && (!once || listeners.once)
      && (!context || listeners.context === context)
    ) {
      if (--this._eventsCount === 0) this._events = new Events();
      else delete this._events[evt];
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
           listeners[i].fn !== fn
        || (once && !listeners[i].once)
        || (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else if (--this._eventsCount === 0) this._events = new Events();
    else delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {String|Symbol} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) {
      if (--this._eventsCount === 0) this._events = new Events();
      else delete this._events[evt];
    }
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
if (true) {
  module.exports = EventEmitter;
}


/***/ }),
/* 6 */
/***/ (function(module, exports) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Enqueue item into the queue, observing limit (if provided)
 * @param {Array} queue
 * @param el
 * @param limit
 */
function enqueue(queue, el) {
	var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

	queue.push(el);
	if (limit && queue.length > limit) {
		queue.splice(0, 1);
	}
}

/**
 * Empty queue using consumer fn, one by one. If consumer returns false, item is re-enqueued.
 * @param {Array} queue
 * @param {Function} consumer
 */
function flushQueue(queue, consumer) {
	var queueLimit = 0;
	while (queue.length > queueLimit) {
		var msg = queue.splice(0, 1)[0];
		if (msg) {
			if (consumer(msg) === false) {
				queue.push(msg);
				queueLimit++;
			}
		}
	}

	return queueLimit;
}

module.exports = {
	enqueue: enqueue,
	flushQueue: flushQueue
};

/***/ })
/******/ ]);
//# sourceMappingURL=iframe_bridge.js.map