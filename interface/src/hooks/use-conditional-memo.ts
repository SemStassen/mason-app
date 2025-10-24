import { useRef } from "react";

function useConditionalMemo<T>(factory: () => T, condition: boolean): T {
  const valueRef = useRef<T | undefined>(undefined);
  const prevCondition = useRef<boolean>(condition);

  // Always run hooks; only recompute value based on state transitions
  if (prevCondition.current && !condition) {
    valueRef.current = factory();
  }

  prevCondition.current = condition;

  // If value hasn't been computed yet, compute it once
  if (valueRef.current === undefined) {
    valueRef.current = factory();
  }

  return valueRef.current;
}

export { useConditionalMemo };
