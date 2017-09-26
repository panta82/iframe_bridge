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