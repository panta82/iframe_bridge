const IFrameBridge = require('./lib/IFrameBridge');
const BridgePayload = require('./lib/BridgePayload');

IFrameBridge.Payload = BridgePayload;
IFrameBridge.IFrameBridge = IFrameBridge;

module.exports = IFrameBridge;
