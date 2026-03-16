import { Equal } from "effect";

export const computeChanges = <T extends object>(
	original: T,
	patch: Partial<T>,
): Partial<T> =>
	Object.fromEntries(
		Object.entries(patch).filter(
			([k, v]) => !Equal.equals(v, original[k as keyof T]),
		),
	) as Partial<T>;
