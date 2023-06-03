import { derived, writable, type Subscriber, type Writable, type Unsubscriber } from 'svelte/store';

class PollingWritable<T> implements Writable<T> {
	private state: Writable<T>;
	private interval: number; // in seconds
	private optCount: number;
	private intervalId: number | null;
	private pollCallback: (() => Promise<T>) | null; // called after interval has passed
	private pollErrCallback: ((e: any) => void) | null; // called on fail of poll
	private optimisticCallback: ((state: T) => T) | null; // called <optCount> times in between polls
	private optIndex: number;
	private optUpdateReceived: boolean;

	constructor(value: T, interval: number, optCount = 0) {
		this.state = writable(value);
		this.interval = interval;
		this.optCount = optCount;
		this.intervalId = null;
		this.pollCallback = null;
		this.pollErrCallback = null;
		this.optimisticCallback = null;
		this.optIndex = 0;
		this.optUpdateReceived = false;
	}

	async poll() {
		if (!this.pollCallback) return;
		try {
			const newState = await this.pollCallback();
			this.state.set(newState);
		} catch (error) {
			if (this.pollErrCallback) this.pollErrCallback(error);
			else console.error('Error in pollCallback:', error);
		}
	}

	start() {
		if (this.intervalId !== null) return;

		this.intervalId = setInterval(async () => {
			if (this.optUpdateReceived && this.optIndex == 0) {
				this.optUpdateReceived = false;
			} else if (this.pollCallback && this.optIndex == 0) {
				this.poll();
			} else if (this.optimisticCallback) {
				this.state.update(this.optimisticCallback);
			}
			if (this.optCount > 0) {
				this.optIndex++;
				this.optIndex %= this.optCount;
			}
		}, (this.interval * 1000) / (this.optCount + 1));
	}

	stop() {
		if (this.intervalId !== null) {
			clearInterval(this.intervalId);
			this.intervalId = null;
			this.optIndex = 0;
			this.optUpdateReceived = false;
		}
	}

	set(value: T): void {
		this.state.set(value);
		this.optUpdateReceived = true;
	}

	update(fn: (value: T) => T): void {
		this.state.update(fn);
		this.optUpdateReceived = true;
	}

	subscribe(run: Subscriber<T>, invalidate?: (value?: T) => void | undefined): Unsubscriber {
		return this.state.subscribe(run, invalidate);
	}

	setPollCallback(callback: () => Promise<T>) {
		this.pollCallback = callback;
	}

	setPollErrCallback(callback: (e: any) => void) {
		this.pollErrCallback = callback;
	}

	setOptimisticCallback(callback: (state: T) => T) {
		this.optimisticCallback = callback;
	}

	derive<S>(fn: (values: T) => S) {
		return derived(this.state, fn);
	}
}

export function pollingWritable<T>(value: T, interval: number, optCount = 0) {
	return new PollingWritable<T>(value, interval, optCount);
}
