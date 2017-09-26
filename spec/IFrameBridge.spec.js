const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const expect = chai.expect;

const EventEmitter = require('eventemitter3');
const inherits = require('inherits');

const IFrameBridge = require('../lib/IFrameBridge');

function FakeWindow(source) {
	EventEmitter.call(this);
	
	this.postMessage = (str) => {
		this.emit('message', {
			data: str,
			source
		});
	};
	
	this.addEventListener = (name, listener) => {
		return this.addListener(name, listener);
	};
}
inherits(FakeWindow, EventEmitter);

describe('IFrameBridge', () => {
	it('can establish connection', (done) => {
		const serverWindow = new FakeWindow();
		const clientWindow = new FakeWindow(serverWindow);
		
		const server = new IFrameBridge({
			targetWindow: clientWindow,
			listenWindow: serverWindow
		});
		
		const client = new IFrameBridge({
			listenWindow: clientWindow
		});
		
		server.postMessage('from server', {
			from: 'server'
		});
		
		client.postMessage('from client', {
			from: 'client'
		});
		
		let count = 0;
		
		server.on('from client', (msg) => {
			expect(msg.from).to.equal('client');
			count++;
		});
		
		server.on('message', (msg) => {
			expect(msg.name).to.equal('from client');
			expect(msg.data.from).to.equal('client');
			count++;
		});
		
		client.on('from server', (msg) => {
			expect(msg.from).to.equal('server');
			count++;
		});
		
		client.on('message', (msg) => {
			expect(msg.name).to.equal('from server');
			expect(msg.data.from).to.equal('server');
			count++;
		});
		
		Promise.all([server.init(), client.init()])
			.then(
				() => {
					setTimeout(() => {
						expect(count).to.equal(4);
						done();
					}, 100);
				}
			);
	});
});