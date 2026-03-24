import { Result, Schema } from "effect";

import { decodeUnknownToResult } from "./submit";
import type { SubmitProps } from "./submit";

export const createDynamicValidator = <T, E>(schema: Schema.Codec<T, E>) =>
  Schema.toStandardSchemaV1(schema);

export const createSubmitValidator = <T, E>(schema: Schema.Codec<T, E>) =>
  async (props: SubmitProps) => {
    const result = await decodeUnknownToResult(schema)(props.value);

    if (Result.isFailure(result)) {
      return result.failure;
    }

    return undefined;
  };
