import {
	writable,
	type Subscriber,
	type Writable,
	type Unsubscriber,
	get,
} from "svelte/store";

const subStore = <S, T>(mainStore: Writable<T>, path: string): Writable<S> => {
	const subStore = writable<S>(getNestedValue(get(mainStore)));
	const unsubscribeMain = mainStore.subscribe((value) => {
		const newValue = getNestedValue(value);
		if (newValue != get(subStore)) {
			subStore.set(newValue);
		}
	});

	function getNestedValue(obj: any): S {
		return path.split(".").reduce((value, key) => value?.[key], obj);
	}

	// https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
	const isObject = (obj: any) => obj && typeof obj === "object";
	function deepMerge(...objects: any[]) {
		return objects.reduce((acc, obj) => {
			Object.keys(obj).forEach((key) => {
				if (isObject(acc[key]) && isObject(obj[key]))
					acc[key] = deepMerge(acc[key], obj[key]);
				else acc[key] = obj[key];
			});
			return acc;
		}, {});
	}

	function updateMainStore(value: any) {
		const keys = path.split(".").reverse();
		const newObj = keys.reduce((accObj, key) => {
			return { [key]: accObj };
		}, value);
		mainStore.update((obj) => deepMerge(isObject(obj) ? obj : {}, newObj));
	}

	return {
		subscribe: (
			run: Subscriber<S>,
			invalidate?: (value?: S) => void
		): Unsubscriber => {
			const unSubscribeSub = subStore.subscribe(run, invalidate);
			return () => {
				unsubscribeMain();
				unSubscribeSub();
			};
		},
		set: (value: S) => {
			updateMainStore(value);
		},
		update: (updater: (value: S) => S) => {
			subStore.update((currentValue) => {
				const newValue = updater(currentValue);
				updateMainStore(newValue);
				return currentValue;
			});
		},
	};
};

export default subStore;
