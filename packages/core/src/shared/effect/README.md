# Shared Effect Helpers

This folder provides local extensions around Effect's schema tooling.

It is not a replacement for Effect itself. Instead, it gives the codebase a
small, opinionated surface that feels like a continuation of the default
Effect namespaces:

- `Schema.ts` extends and composes Effect Schema helpers used across the domain
- `Model.ts` builds on `effect/unstable/schema` variant schemas for shared
  entity contracts
- `index.ts` re-exports these modules under the `Model` and `Schema`
  namespaces

## Intent

These helpers exist to make shared entity definitions easier to read across
server and client code.

The main goal is to encode the stable contract of a field:

- what the server is allowed to do
- what the client is allowed to do
- whether the field is optional
- whether create-time defaults apply

## Model Naming

`Model.ts` follows a contract-first naming scheme:

- start with the authoritative server contract
- add the client contract only if the client participates in writes
- append field-level modifiers last

Grammar:

```ts
Server<Mutability>[Client<Mutability>][FieldModifier][CreateModifier]
```

Examples:

```ts
ServerImmutable
ServerMutableOptional
ServerImmutableClientImmutable
ServerMutableClientMutable
ServerMutableClientMutableOptional
ServerMutableClientMutableOptionalCreateDefault
```

Meaning:

- `Immutable` / `Mutable` describe whether that side can change the field after
  creation
- `Optional` describes the field shape as a whole, typically via Effect
  `Option`
- `CreateDefault` and `CreateOptional` describe create-time behavior only

## When To Use `Field(...)`

Use the named helpers for the common matrix.

Use `Field(...)` directly when a field has asymmetric or unusual behavior, for
example:

- DB and JSON use different schemas
- the field is accepted in JSON input but not returned in JSON output
- create and update semantics do not fit the common helper matrix

In other words: if a helper name would start describing transport quirks more
than the core contract, use `Field(...)` instead.
