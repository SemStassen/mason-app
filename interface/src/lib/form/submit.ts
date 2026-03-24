import type { AnyFormOptions } from "@tanstack/react-form";
import { Effect, Result, Schema } from "effect";

export type SubmitProps = Parameters<
  NonNullable<AnyFormOptions["onSubmit"]>
>[0];

export type ParsedSubmitProps<T> = Omit<SubmitProps, "value"> & {
  value: T;
};

export const decodeUnknownToResult =
  <T, E>(schema: Schema.Codec<T, E>) =>
  (value: unknown) =>
    Schema.decodeUnknownEffect(schema)(value).pipe(
      // oxlint-disable-next-line eslint-plugin-promise/prefer-await-to-callbacks
      Effect.mapError((error) => error.message),
      Effect.result,
      Effect.runPromise
    );

export const createParsedSubmitHandler =
  <T, E>(
    schema: Schema.Codec<T, E>,
    handler: (props: ParsedSubmitProps<T>) => Promise<void> | void
  ) =>
  async (props: SubmitProps) => {
    const result = await decodeUnknownToResult(schema)(props.value);

    if (Result.isFailure(result)) {
      return;
    }

    const parsedProps: ParsedSubmitProps<T> = {
      ...props,
      value: result.success,
    };

    await handler(parsedProps);
  };
