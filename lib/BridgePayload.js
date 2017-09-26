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