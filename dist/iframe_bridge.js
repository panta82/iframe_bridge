(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const IFrameBridge = require('./lib/IFrameBridge');
const BridgePayload = require('./lib/BridgePayload');

IFrameBridge.Payload = BridgePayload;
IFrameBridge.IFrameBridge = IFrameBridge;

module.exports = IFrameBridge;

if (typeof window !== 'undefined' && !window.IFrameBridge) {
	window.IFrameBridge = IFrameBridge;
}
},{"./lib/BridgePayload":2,"./lib/IFrameBridge":3}],2:[function(require,module,exports){
const {ReservedPayloadNameError} = require('./errors');
const CONSTS = require('./consts');

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
	let payload;
	if (typeof name === 'object') {
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
	const payload = new BridgePayload();
	payload.name = CONSTS.HANDSHAKE_MESSAGE_NAME;
	return payload;
};

module.exports = BridgePayload;
},{"./consts":4,"./errors":5}],3:[function(require,module,exports){
const EventEmitter = require('eventemitter3');
const inherits = require('inherits');

const BridgePayload = require('./BridgePayload');
const CONSTS = require('./consts');
const {enqueue, flushQueue} = require('./util');
const {HandshakeTimeoutError} = require('./errors');

const DEFAULT_OPTIONS = {
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
	queue_limit: 100,
};

/**
 * Very basic wrapper around window.postMessage. Handles handshaking and JSON conversion.
 * Makes sure you don't lose any messages.
 * @param options Overrides for IFrameBridge.DEFAULT_OPTIONS
 * @extends EventEmitter
 */
function IFrameBridge(options = DEFAULT_OPTIONS) {
	options = Object.assign({}, IFrameBridge.DEFAULT_OPTIONS, options);
	
	const _serverMode = !!options.targetWindow;
	let _targetWindow = options.targetWindow;
	const _listenWindow = options.listenWindow || window;
	let _initPromise = null;
	let _handshakeResponseHandler = null;
	let _connected = false;
	const _handshakeQueue = [];
	const _eventEmitter = new EventEmitter();
	
	_listenWindow.addEventListener('message', receiveMessage, false);
	
	Object.assign(this, /** @lends IFrameBridge.prototype */ {
		init,
		postMessage,
		on: _eventEmitter.on.bind(_eventEmitter),
		addListener: _eventEmitter.addListener.bind(_eventEmitter),
		once: _eventEmitter.once.bind(_eventEmitter),
		off: _eventEmitter.off.bind(_eventEmitter),
		removeListener: _eventEmitter.removeListener.bind(_eventEmitter),
		removeAllListeners: _eventEmitter.removeAllListeners.bind(_eventEmitter),
	});
	
	function init() {
		if (_connected) {
			return Promise.resolve();
		}
		
		if (_initPromise) {
			return _initPromise;
		}
		
		_initPromise = new Promise((resolve, reject) => {
			let handshakeInterval;
			let handshakeTimeout;
			
			_handshakeResponseHandler = (messageEvent) => {
				_connected = true;
				_initPromise = null;
				_handshakeResponseHandler = null;
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
				handshakeInterval = setInterval(sendHandshakeMessage, options.handshake_interval)
				sendHandshakeMessage();
			}
			
			if (options.handshake_timeout) {
				handshakeTimeout = setTimeout(() => {
					clearInterval(handshakeInterval);
					_initPromise = null;
					_handshakeResponseHandler = null;
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
		const payload = BridgePayload.createAndValidate(name, data);
		
		if (!_connected) {
			enqueue(_handshakeQueue, payload, options.queue_limit);
			return;
		}
		
		return doPostMessage(payload);
	}
	
	function doPostMessage(payload) {
		const data = JSON.stringify(payload);
		
		_targetWindow.postMessage(data, options.origin);
	}
	
	function receiveMessage(messageEvent) {
		/** @type BridgePayload */
		let payload;
		try {
			payload = new BridgePayload(JSON.parse(messageEvent.data));
		}
		catch (_) {
			return;
		}
		
		if (!payload.__bridge_payload__) {
			return;
		}
		
		if (payload.name === CONSTS.HANDSHAKE_MESSAGE_NAME) {
			if (_handshakeResponseHandler) {
				_handshakeResponseHandler(messageEvent);
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
},{"./BridgePayload":2,"./consts":4,"./errors":5,"./util":6,"eventemitter3":7,"inherits":8}],4:[function(require,module,exports){
module.exports = {
	HANDSHAKE_MESSAGE_NAME: '___handshake___',
	MESSAGE_EVENT_NAME: 'message'
};
},{}],5:[function(require,module,exports){
class IFrameBridgeError extends Error {}

class HandshakeTimeoutError extends IFrameBridgeError {
	constructor(timeout) {
		super(`Handshake has timed out after ${timeout}ms. There was no message received from the other side`);
	}
}

class ReservedPayloadNameError extends IFrameBridgeError {
	constructor(name) {
		super(`Message name "${name}" is reserved for internal use`);
	}
}

module.exports = {
	IFrameBridgeError,
	HandshakeTimeoutError,
	ReservedPayloadNameError
};
},{}],6:[function(require,module,exports){
/**
 * Enqueue item into the queue, observing limit (if provided)
 * @param {Array} queue
 * @param el
 * @param limit
 */
function enqueue(queue, el, limit = null) {
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
	let queueLimit = 0;
	while (queue.length > queueLimit) {
		const msg = queue.splice(0, 1)[0];
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
	enqueue,
	flushQueue
};
},{}],7:[function(require,module,exports){
'use strict';

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
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],8:[function(require,module,exports){
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

},{}]},{},[1]);
