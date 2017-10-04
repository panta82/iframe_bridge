# IFrameBridge

Very basic wrapper around window.postMessage. Handles handshaking and JSON conversion. Makes sure you don't lose any messages.

Install from npm:

```bash
npm install --save iframe_bridge
```

Then in your ES6+ code:

```javascript
const IFrameBridge = require('iframe_bridge');
```

or

```javascript
import IFrameBridge from 'iframe_bridge';
```

### Usage

`iframe_bridge.js` file is the compiled browser-ready version of the library. If you reference it with `<script>` tag, the constructor will become available globally as `window.BrowserBridge`. You can also require it from within an ES6 app with your own build system (see above).

Example usage:

(index.html)

```html
<script src="../dist/iframe_bridge.js"></script>

<iframe id="iframe" src="iframe.html"></iframe>

<script>
	var iFrame = document.getElementById('iframe');

	// Create an instance of bridge. By giving it iFrame's window as targetWindow,
	// you indicate this instance will work in "server mode",
	// and attempt to initiate connection. 
	var bridge = new IFrameBridge({
		targetWindow: iFrame.contentWindow
	});
	
	
	// You then attach your event handlers. You should do this before calling init.
	bridge.on('response_from_iframe', (data) => {
		console.log(data); // "Hello back"
	});

	// Once you call init, we will start trying to connect to the iframe
	// If you want to wait, just attach .then() to this call, it will return a promise.
	bridge.init();
	
	// Any messages you post here, before we are connected, will be queued
	// and flushed once connection is established.
	bridge.postMessage('event_from_parent', {
		message: 'Hello'
	});
</script>
```

(iframe.html)

```html
<script src="../dist/iframe_bridge.js"></script>

<script>
	// Create an instance of the bridge without giving it targetWindow.
	// The parent's window will be determined from the handshake message.
	var bridge = new IFrameBridge();
	
	// You can also listen to the generic "message" event. You will get all received events here.
	bridge.on('message', (payload) => {
		if (payload.name === 'event_from_parent' && payload.data.message === 'Hello') {
			bridge.postMessage('response_from_iframe', 'Hello back');
		}
	});
	
	// Call init to start listening for handshake
	bridge.init();
</script>
```

You can see a working example here: [tester/index.html](./tester/index.html).

### Additional options

Check out `DEFAULT_OPTIONS` inside [IFrameBridge.js](lib/IFrameBridge.js) for the full list with comments.

This object will be available (and mutable) on `IFrameBridge.DEFAULT_OPTIONS`.

### License

MIT

