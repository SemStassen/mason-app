import type { Effect } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";

export interface ProcessArray {
  // Overload 1: No prepare, no mapItem - execute uses items directly
  <
    Items extends ReadonlyArray<unknown>,
    AExecute,
    EExecute = never,
    RExecute = never,
  >(params: {
    readonly items: Items;
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

  // Overload 2: No prepare, with mapItem
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

  // Overload 3: With prepare, no mapItem
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

  // Overload 4: With prepare and mapItem
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
