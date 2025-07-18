export const throttle = (fn, delay = 250) => {
	let timeout = null;

	return (...args) => {
		if (timeout === null) {
			// fn.apply(this, args);
			
			timeout = setTimeout(() => {
				fn.apply(this, args);
				timeout = null;
			}, delay)
		}
	}
}