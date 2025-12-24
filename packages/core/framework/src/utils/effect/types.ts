import type { Effect, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type * as ParseResult from "effect/ParseResult";

export type WithNonEmptyArray = <
  Value extends Schema.Schema.Any,
  A,
  E = never,
  R = never,
>(params: {
  readonly arr: unknown;
  readonly schema: Value;
  readonly execute: (
    nonEmptyArray: NonEmptyReadonlyArray<Schema.Schema.Type<Value>>
  ) => Effect.Effect<A, E, R>;
  readonly onEmpty: Effect.Effect<A, E, R>;
}) => Effect.Effect<
  A,
  ParseResult.ParseError | E,
  Schema.Schema.Context<Value> | R
>;

export interface ProcessArray {
  // Overload 1: No prepare, no mapItem - execute uses schema type directly
  <
    In extends Schema.Schema.Any,
    AExecute,
    EExecute = never,
    RExecute = never,
  >(params: {
    readonly items: ReadonlyArray<unknown>;
    readonly schema: In;
    readonly prepare?: never;
    readonly mapItem?: never;
    readonly execute: (
      items: NonEmptyReadonlyArray<Schema.Schema.Type<In>>
    ) => Effect.Effect<AExecute, EExecute, RExecute>;
    readonly onEmpty?: Effect.Effect<
      AExecute extends ReadonlyArray<infer Element>
        ? ReadonlyArray<Element>
        : AExecute,
      EExecute,
      RExecute
    >;
  }): Effect.Effect<
    AExecute,
    ParseResult.ParseError | EExecute,
    Schema.Schema.Context<In> | RExecute
  >;
  // Overload 1b: No schema, no prepare, no mapItem - execute uses items as-is
  <
    Items extends ReadonlyArray<unknown>,
    AExecute,
    EExecute = never,
    RExecute = never,
  >(params: {
    readonly items: Items;
    readonly schema?: never;
    readonly prepare?: never;
    readonly mapItem?: never;
    readonly execute: (
      items: NonEmptyReadonlyArray<Items[number]>
    ) => Effect.Effect<AExecute, EExecute, RExecute>;
    readonly onEmpty?: Effect.Effect<
      AExecute extends ReadonlyArray<infer Element>
        ? ReadonlyArray<Element>
        : AExecute,
      EExecute,
      RExecute
    >;
  }): Effect.Effect<AExecute, EExecute, RExecute>;
  // Overload 2: No prepare, with mapItem - mapItem takes only the item
  <
    In extends Schema.Schema.Any,
    OutFinal,
    AExecute,
    EMapItem = never,
    EExecute = never,
    RMapItem = never,
    RExecute = never,
  >(params: {
    readonly items: ReadonlyArray<unknown>;
    readonly schema: In;
    readonly prepare?: never;
    readonly mapItem: (
      item: Schema.Schema.Type<In>
    ) => Effect.Effect<OutFinal, EMapItem, RMapItem>;
    readonly execute: (
      items: NonEmptyReadonlyArray<OutFinal>
    ) => Effect.Effect<AExecute, EExecute, RExecute>;
    readonly onEmpty?: Effect.Effect<
      AExecute extends ReadonlyArray<infer Element>
        ? ReadonlyArray<Element>
        : AExecute,
      EExecute,
      RExecute
    >;
  }): Effect.Effect<
    AExecute,
    ParseResult.ParseError | EMapItem | EExecute,
    Schema.Schema.Context<In> | RMapItem | RExecute
  >;
  // Overload 2b: No schema, no prepare, with mapItem
  <
    Items extends ReadonlyArray<unknown>,
    OutFinal,
    AExecute,
    EMapItem = never,
    EExecute = never,
    RMapItem = never,
    RExecute = never,
  >(params: {
    readonly items: Items;
    readonly schema?: never;
    readonly prepare?: never;
    readonly mapItem: (
      item: Items[number]
    ) => Effect.Effect<OutFinal, EMapItem, RMapItem>;
    readonly execute: (
      items: NonEmptyReadonlyArray<OutFinal>
    ) => Effect.Effect<AExecute, EExecute, RExecute>;
    readonly onEmpty?: Effect.Effect<
      AExecute extends ReadonlyArray<infer Element>
        ? ReadonlyArray<Element>
        : AExecute,
      EExecute,
      RExecute
    >;
  }): Effect.Effect<AExecute, EMapItem | EExecute, RMapItem | RExecute>;
  // Overload 3: With prepare, no mapItem - execute uses schema type directly
  <
    In extends Schema.Schema.Any,
    Context,
    AExecute,
    EPrepare = never,
    EExecute = never,
    RPrepare = never,
    RExecute = never,
  >(params: {
    readonly items: ReadonlyArray<unknown>;
    readonly schema: In;
    readonly prepare: (
      items: NonEmptyReadonlyArray<Schema.Schema.Type<In>>
    ) => Effect.Effect<Context, EPrepare, RPrepare>;
    readonly mapItem?: never;
    readonly execute: (
      items: NonEmptyReadonlyArray<Schema.Schema.Type<In>>
    ) => Effect.Effect<AExecute, EExecute, RExecute>;
    readonly onEmpty?: Effect.Effect<
      AExecute extends ReadonlyArray<infer Element>
        ? ReadonlyArray<Element>
        : AExecute,
      EExecute,
      RExecute
    >;
  }): Effect.Effect<
    AExecute,
    ParseResult.ParseError | EPrepare | EExecute,
    Schema.Schema.Context<In> | RPrepare | RExecute
  >;
  // Overload 3b: No schema, with prepare, no mapItem
  <
    Items extends ReadonlyArray<unknown>,
    Context,
    AExecute,
    EPrepare = never,
    EExecute = never,
    RPrepare = never,
    RExecute = never,
  >(params: {
    readonly items: Items;
    readonly schema?: never;
    readonly prepare: (
      items: NonEmptyReadonlyArray<Items[number]>
    ) => Effect.Effect<Context, EPrepare, RPrepare>;
    readonly mapItem?: never;
    readonly execute: (
      items: NonEmptyReadonlyArray<Items[number]>
    ) => Effect.Effect<AExecute, EExecute, RExecute>;
    readonly onEmpty?: Effect.Effect<
      AExecute extends ReadonlyArray<infer Element>
        ? ReadonlyArray<Element>
        : AExecute,
      EExecute,
      RExecute
    >;
  }): Effect.Effect<AExecute, EPrepare | EExecute, RPrepare | RExecute>;
  // Overload 4: With prepare and mapItem - mapItem takes item and context
  <
    In extends Schema.Schema.Any,
    Context,
    OutFinal,
    AExecute,
    EPrepare = never,
    EMapItem = never,
    EExecute = never,
    RPrepare = never,
    RMapItem = never,
    RExecute = never,
  >(params: {
    readonly items: ReadonlyArray<unknown>;
    readonly schema: In;
    readonly prepare: (
      items: NonEmptyReadonlyArray<Schema.Schema.Type<In>>
    ) => Effect.Effect<Context, EPrepare, RPrepare>;
    readonly mapItem: (
      item: Schema.Schema.Type<In>,
      context: Context
    ) => Effect.Effect<OutFinal, EMapItem, RMapItem>;
    readonly execute: (
      items: NonEmptyReadonlyArray<OutFinal>
    ) => Effect.Effect<AExecute, EExecute, RExecute>;
    readonly onEmpty?: Effect.Effect<
      AExecute extends ReadonlyArray<infer Element>
        ? ReadonlyArray<Element>
        : AExecute,
      EExecute,
      RExecute
    >;
  }): Effect.Effect<
    AExecute,
    ParseResult.ParseError | EPrepare | EMapItem | EExecute,
    Schema.Schema.Context<In> | RPrepare | RMapItem | RExecute
  >;
  // Overload 4b: No schema, with prepare and mapItem
  <
    Items extends ReadonlyArray<unknown>,
    Context,
    OutFinal,
    AExecute,
    EPrepare = never,
    EMapItem = never,
    EExecute = never,
    RPrepare = never,
    RMapItem = never,
    RExecute = never,
  >(params: {
    readonly items: Items;
    readonly schema?: never;
    readonly prepare: (
      items: NonEmptyReadonlyArray<Items[number]>
    ) => Effect.Effect<Context, EPrepare, RPrepare>;
    readonly mapItem: (
      item: Items[number],
      context: Context
    ) => Effect.Effect<OutFinal, EMapItem, RMapItem>;
    readonly execute: (
      items: NonEmptyReadonlyArray<OutFinal>
    ) => Effect.Effect<AExecute, EExecute, RExecute>;
    readonly onEmpty?: Effect.Effect<
      AExecute extends ReadonlyArray<infer Element>
        ? ReadonlyArray<Element>
        : AExecute,
      EExecute,
      RExecute
    >;
  }): Effect.Effect<
    AExecute,
    EPrepare | EMapItem | EExecute,
    RPrepare | RMapItem | RExecute
  >;
}
