# --- BEGIN EFFECTPATTERNS RULES ---

### Provide Configuration to Your App via a Layer
**ID:** provide-configuration-to-your-app-via-a-layer
**Use Case:** N/A | **Skill Level:** N/A

description: Provide configuration to your app via a Layer.
globs: "**/*.ts"
alwaysApply: true

# Provide Configuration to Your App via a Layer
**Rule:** Provide configuration to your app via a Layer.

### Example
````typescript
import { Effect, Layer } from "effect";

class ServerConfig extends Effect.Service<ServerConfig>()(
  "ServerConfig",
  {
    sync: () => ({
      port: process.env.PORT ? parseInt(process.env.PORT) : 8080
    })
  }
) {}

const program = Effect.gen(function* () {
  const config = yield* ServerConfig;
  yield* Effect.log(`Starting application on port ${config.port}...`);
});

const programWithErrorHandling = Effect.provide(program, ServerConfig.Default).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logError(`Program error: ${error}`);
      return null;
    })
  )
);

Effect.runPromise(programWithErrorHandling);
````

**Explanation:**  
This approach makes configuration available contextually, supporting better testing and modularity.

**Explanation:**  
Integrating configuration as a `Layer` plugs it directly into Effect's dependency injection system. This makes your configuration available anywhere in the program and dramatically simplifies testing by allowing you to substitute mock configuration.


---

### Control Repetition with Schedule
**ID:** control-repetition-with-schedule
**Use Case:** N/A | **Skill Level:** N/A

description: Use Schedule to create composable policies for controlling the repetition and retrying of effects.
globs: "**/*.ts"
alwaysApply: true

# Control Repetition with Schedule
**Rule:** Use Schedule to create composable policies for controlling the repetition and retrying of effects.

### Example
This example demonstrates composition by creating a common, robust retry policy: exponential backoff with jitter, limited to 5 attempts.

```typescript
import { Effect, Schedule, Duration } from "effect"

// A simple effect that can fail
const flakyEffect = Effect.try({
  try: () => {
    if (Math.random() > 0.2) {
      throw new Error("Transient error")
    }
    return "Operation succeeded!"
  },
  catch: (error: unknown) => {
    Effect.logInfo("Operation failed, retrying...")
    return error
  }
})

// --- Building a Composable Schedule ---

// 1. Start with a base exponential backoff (100ms, 200ms, 400ms...)
const exponentialBackoff = Schedule.exponential("100 millis")

// 2. Add random jitter to avoid thundering herd problems
const withJitter = Schedule.jittered(exponentialBackoff)

// 3. Limit the schedule to a maximum of 5 repetitions
const limitedWithJitter = Schedule.compose(
  withJitter,
  Schedule.recurs(5)
)

// --- Using the Schedule ---
const program = Effect.gen(function* () {
  yield* Effect.logInfo("Starting operation...")
  const result = yield* Effect.retry(flakyEffect, limitedWithJitter)
  yield* Effect.logInfo(`Final result: ${result}`)
})

// Run the program
Effect.runPromise(program)
```

---

**Explanation:**  
While you could write manual loops or recursive functions, `Schedule` provides a much more powerful, declarative, and composable way to manage repetition. The key benefits are:

-   **Declarative:** You separate the *what* (the effect to run) from the *how* and *when* (the schedule it runs on).
-   **Composable:** You can build complex schedules from simple, primitive ones. For example, you can create a schedule that runs "up to 5 times, with an exponential backoff, plus some random jitter" by composing `Schedule.recurs`, `Schedule.exponential`, and `Schedule.jittered`.
-   **Stateful:** A `Schedule` keeps track of its own state (like the number of repetitions), making it easy to create policies that depend on the execution history.

---


---

### Validate Request Body
**ID:** validate-request-body
**Use Case:** N/A | **Skill Level:** N/A

description: Use Http.request.schemaBodyJson with a Schema to automatically parse and validate request bodies.
globs: "**/*.ts"
alwaysApply: true

# Validate Request Body
**Rule:** Use Http.request.schemaBodyJson with a Schema to automatically parse and validate request bodies.

### Example
This example defines a `POST` route to create a user. It uses a `CreateUser` schema to validate the request body. If validation passes, it returns a success message with the typed data. If it fails, the platform automatically sends a descriptive 400 error.

```typescript
import { Duration, Effect } from "effect";
import * as S from "effect/Schema";
import { createServer, IncomingMessage, ServerResponse } from "http";

// Define user schema
const UserSchema = S.Struct({
  name: S.String,
  email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
});
type User = S.Schema.Type<typeof UserSchema>;

// Define user service interface
interface UserServiceInterface {
  readonly validateUser: (data: unknown) => Effect.Effect<User, Error, never>;
}

// Define user service
class UserService extends Effect.Service<UserService>()("UserService", {
  sync: () => ({
    validateUser: (data: unknown) => S.decodeUnknown(UserSchema)(data),
  }),
}) { }

// Define HTTP server service interface
interface HttpServerInterface {
  readonly handleRequest: (
    request: IncomingMessage,
    response: ServerResponse
  ) => Effect.Effect<void, Error, never>;
  readonly start: () => Effect.Effect<void, Error, never>;
}

// Define HTTP server service
class HttpServer extends Effect.Service<HttpServer>()("HttpServer", {
  // Define effect-based implementation that uses dependencies
  effect: Effect.gen(function* () {
    const userService = yield* UserService;

    return {
      handleRequest: (request: IncomingMessage, response: ServerResponse) =>
        Effect.gen(function* () {
          // Only handle POST /users
          if (request.method !== "POST" || request.url !== "/users") {
            response.writeHead(404, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Not Found" }));
            return;
          }

          try {
            // Read request body
            const body = yield* Effect.async<unknown, Error>((resume) => {
              let data = "";
              request.on("data", (chunk) => {
                data += chunk;
              });
              request.on("end", () => {
                try {
                  resume(Effect.succeed(JSON.parse(data)));
                } catch (e) {
                  resume(
                    Effect.fail(e instanceof Error ? e : new Error(String(e)))
                  );
                }
              });
              request.on("error", (e) =>
                resume(
                  Effect.fail(e instanceof Error ? e : new Error(String(e)))
                )
              );
            });

            // Validate body against schema
            const user = yield* userService.validateUser(body);

            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(
              JSON.stringify({
                message: `Successfully created user: ${user.name}`,
              })
            );
          } catch (error) {
            response.writeHead(400, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: String(error) }));
          }
        }),

      start: function (this: HttpServer) {
        const self = this;
        return Effect.gen(function* () {
          // Create HTTP server
          const server = createServer((req, res) =>
            Effect.runFork(self.handleRequest(req, res))
          );

          // Add cleanup finalizer
          yield* Effect.addFinalizer(() =>
            Effect.gen(function* () {
              yield* Effect.sync(() => server.close());
              yield* Effect.logInfo("Server shut down");
            })
          );

          // Start server
          yield* Effect.async<void, Error>((resume) => {
            server.on("error", (error) => resume(Effect.fail(error)));
            server.listen(3456, () => {
              Effect.runFork(
                Effect.logInfo("Server running at http://localhost:3456/")
              );
              resume(Effect.succeed(void 0));
            });
          });

          // Run for demonstration period
          yield* Effect.sleep(Duration.seconds(3));
          yield* Effect.logInfo("Demo completed - shutting down server");
        });
      },
    };
  }),
  // Specify dependencies
  dependencies: [UserService.Default],
}) { }

// Create program with proper error handling
const program = Effect.gen(function* () {
  const server = yield* HttpServer;

  yield* Effect.logInfo("Starting HTTP server...");

  yield* server.start().pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Server error: ${error}`);
        return yield* Effect.fail(error);
      })
    )
  );
}).pipe(
  Effect.scoped // Ensure server is cleaned up
);

// Run the server
Effect.runFork(Effect.provide(program, HttpServer.Default));

/*
To test:
- POST http://localhost:3456/users with body {"name": "Paul", "email": "paul@effect.com"}
  -> Returns 200 OK with message "Successfully created user: Paul"

- POST http://localhost:3456/users with body {"name": "Paul"}
  -> Returns 400 Bad Request with error message about missing email field
*/

```

**Explanation:**  
Accepting user-provided data is one of the most critical and sensitive parts of an API. You must never trust incoming data. The `Http` module's integration with `Schema` provides a robust, declarative solution for this.

Using `Http.request.schemaBodyJson` offers several major advantages:

1.  **Automatic Validation and Error Handling**: If the incoming body does not match the schema, the server automatically rejects the request with a `400 Bad Request` status and a detailed JSON response explaining the validation errors. You don't have to write any of this boilerplate logic.
2.  **Type Safety**: If the validation succeeds, the value produced by the `Effect` is fully typed according to your `Schema`. This eliminates `any` types and brings static analysis benefits to your request handlers.
3.  **Declarative and Clean**: The validation rules are defined once in the `Schema` and then simply applied. This separates the validation logic from your business logic, keeping handlers clean and focused on their core task.
4.  **Security**: It acts as a security gateway, ensuring that malformed or unexpected data structures never reach your application's core logic.

---


---

### Create a Stream from a List
**ID:** create-a-stream-from-a-list
**Use Case:** N/A | **Skill Level:** N/A

description: Use Stream.fromIterable to begin a pipeline from an in-memory collection.
globs: "**/*.ts"
alwaysApply: true

# Create a Stream from a List
**Rule:** Use Stream.fromIterable to begin a pipeline from an in-memory collection.

### Example
This example takes a simple array of numbers, creates a stream from it, performs a transformation on each number, and then runs the stream to collect the results.

```typescript
import { Effect, Stream, Chunk } from 'effect';

const numbers = [1, 2, 3, 4, 5];

// Create a stream from the array of numbers.
const program = Stream.fromIterable(numbers).pipe(
  // Perform a simple, synchronous transformation on each item.
  Stream.map((n) => `Item: ${n}`),
  // Run the stream and collect all the transformed items into a Chunk.
  Stream.runCollect
);

const programWithLogging = Effect.gen(function* () {
  const processedItems = yield* program;
  yield* Effect.log(`Processed items: ${JSON.stringify(Chunk.toArray(processedItems))}`);
  return processedItems;
});

Effect.runPromise(programWithLogging);
/*
Output:
[ 'Item: 1', 'Item: 2', 'Item: 3', 'Item: 4', 'Item: 5' ]
*/
```

**Explanation:**  
Every data pipeline needs a source. The simplest and most common source is a pre-existing list of items in memory. `Stream.fromIterable` is the bridge from standard JavaScript data structures to the powerful, composable world of Effect's `Stream`.

This pattern is fundamental for several reasons:

1.  **Entry Point**: It's the "Hello, World!" of data pipelines, providing the easiest way to start experimenting with stream transformations.
2.  **Testing**: In tests, you frequently need to simulate a data source (like a database query or API call). Creating a stream from a mock array of data is the standard way to do this, allowing you to test your pipeline's logic in isolation.
3.  **Composability**: It transforms a static, eager data structure (an array) into a lazy, pull-based stream. This allows you to pipe it into the rest of the Effect ecosystem, enabling asynchronous operations, concurrency, and resource management in subsequent steps.

---


---

### Organize Layers into Composable Modules
**ID:** organize-layers-into-composable-modules
**Use Case:** N/A | **Skill Level:** N/A

description: Organize services into modular Layers that are composed hierarchically to manage complexity in large applications.
globs: "**/*.ts"
alwaysApply: true

# Organize Layers into Composable Modules
**Rule:** Organize services into modular Layers that are composed hierarchically to manage complexity in large applications.

### Example
This example shows a `BaseLayer` with a `Logger`, a `UserModule` that uses the `Logger`, and a final `AppLayer` that wires them together.

### 1. The Base Infrastructure Layer

```typescript
// src/core/Logger.ts
import { Effect } from "effect";

export class Logger extends Effect.Service<Logger>()(
  "App/Core/Logger",
  {
    sync: () => ({
      log: (msg: string) => Effect.log(`[LOG] ${msg}`)
    })
  }
) {}

// src/features/User/UserRepository.ts
export class UserRepository extends Effect.Service<UserRepository>()(
  "App/User/UserRepository",
  {
    // Define implementation that uses Logger
    effect: Effect.gen(function* () {
      const logger = yield* Logger;
      return {
        findById: (id: number) =>
          Effect.gen(function* () {
            yield* logger.log(`Finding user ${id}`);
            return { id, name: `User ${id}` };
          })
      };
    }),
    // Declare Logger dependency
    dependencies: [Logger.Default]
  }
) {}

// Example usage
const program = Effect.gen(function* () {
  const repo = yield* UserRepository;
  const user = yield* repo.findById(1);
  return user;
});

// Run with default implementations
Effect.runPromise(
  Effect.provide(
    program,
    UserRepository.Default
  )
);

const programWithLogging = Effect.gen(function* () {
  const result = yield* program;
  yield* Effect.log(`Program result: ${JSON.stringify(result)}`);
  return result;
});

Effect.runPromise(Effect.provide(programWithLogging, UserRepository.Default));
```

### 2. The Feature Module Layer

```typescript
// src/core/Logger.ts
import { Effect } from "effect";

export class Logger extends Effect.Service<Logger>()(
  "App/Core/Logger",
  {
    sync: () => ({
      log: (msg: string) => Effect.sync(() => console.log(`[LOG] ${msg}`))
    })
  }
) {}

// src/features/User/UserRepository.ts
export class UserRepository extends Effect.Service<UserRepository>()(
  "App/User/UserRepository",
  {
    // Define implementation that uses Logger
    effect: Effect.gen(function* () {
      const logger = yield* Logger;
      return {
        findById: (id: number) =>
          Effect.gen(function* () {
            yield* logger.log(`Finding user ${id}`);
            return { id, name: `User ${id}` };
          })
      };
    }),
    // Declare Logger dependency
    dependencies: [Logger.Default]
  }
) {}

// Example usage
const program = Effect.gen(function* () {
  const repo = yield* UserRepository;
  const user = yield* repo.findById(1);
  return user;
});

// Run with default implementations
Effect.runPromise(
  Effect.provide(
    program,
    UserRepository.Default
  )
).then(console.log);
```

### 3. The Final Application Composition

```typescript
// src/layers.ts
import { Layer } from "effect";
import { BaseLayer } from "./core";
import { UserModuleLive } from "./features/User";
// import { ProductModuleLive } from "./features/Product";

const AllModules = Layer.mergeAll(UserModuleLive /*, ProductModuleLive */);

// Provide the BaseLayer to all modules at once, creating a self-contained AppLayer.
export const AppLayer = Layer.provide(AllModules, BaseLayer);
```

---

**Explanation:**  
As an application grows, a flat composition strategy where all services are merged into one giant layer becomes unwieldy and hard to reason about. The Composable Modules pattern solves this by introducing structure.

This approach creates a clean, scalable, and highly testable architecture where complexity is contained within each module. The top-level composition becomes a clear, high-level diagram of your application's architecture, and feature modules can be tested in isolation by providing them with a mocked `BaseLayer`.

---


---

### Make an Outgoing HTTP Client Request
**ID:** make-an-outgoing-http-client-request
**Use Case:** N/A | **Skill Level:** N/A

description: Use the Http.client module to make outgoing requests to keep the entire operation within the Effect ecosystem.
globs: "**/*.ts"
alwaysApply: true

# Make an Outgoing HTTP Client Request
**Rule:** Use the Http.client module to make outgoing requests to keep the entire operation within the Effect ecosystem.

### Example
This example creates a proxy endpoint. A request to `/proxy/posts/1` on our server will trigger an outgoing request to the JSONPlaceholder API. The response is then parsed and relayed back to the original client.

```typescript
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import * as HttpRouter from "@effect/platform/HttpRouter";
import * as HttpServer from "@effect/platform/HttpServer";
import * as HttpResponse from "@effect/platform/HttpServerResponse";
import { Console, Data, Duration, Effect, Fiber, Layer } from "effect";

class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
  id: string;
}> { }

export class Database extends Effect.Service<Database>()("Database", {
  sync: () => ({
    getUser: (id: string) =>
      id === "123"
        ? Effect.succeed({ name: "Paul" })
        : Effect.fail(new UserNotFoundError({ id })),
  }),
}) { }

const userHandler = Effect.flatMap(HttpRouter.params, (p) =>
  Effect.flatMap(Database, (db) => db.getUser(p["userId"] ?? "")).pipe(
    Effect.flatMap(HttpResponse.json)
  )
);

const app = HttpRouter.empty.pipe(
  HttpRouter.get("/users/:userId", userHandler)
);

const server = NodeHttpServer.layer(() => require("node:http").createServer(), {
  port: 3457,
});

const serverLayer = HttpServer.serve(app);

const mainLayer = Layer.merge(Database.Default, server);

const program = Effect.gen(function* () {
  yield* Effect.log("Server started on http://localhost:3457");
  const layer = Layer.provide(serverLayer, mainLayer);

  // Launch server and run for a short duration to demonstrate
  const serverFiber = yield* Layer.launch(layer).pipe(Effect.fork);

  // Wait a moment for server to start
  yield* Effect.sleep(Duration.seconds(1));

  // Simulate some server activity
  yield* Effect.log("Server is running and ready to handle requests");
  yield* Effect.sleep(Duration.seconds(2));

  // Shutdown gracefully
  yield* Fiber.interrupt(serverFiber);
  yield* Effect.log("Server shutdown complete");
});

NodeRuntime.runMain(
  Effect.provide(program, Layer.provide(serverLayer, Layer.merge(Database.Default, server))) as Effect.Effect<void, unknown, never>
);

```

**Explanation:**  
An API server often needs to communicate with other services. While you could use the native `fetch` API, this breaks out of the Effect ecosystem and forfeits its most powerful features. Using the built-in `Http.client` is superior for several critical reasons:

1.  **Full Integration**: An `Http.client` request is a first-class `Effect`. This means it seamlessly composes with all other effects. You can add timeouts, retry logic (`Schedule`), or race it with other operations using the standard Effect operators you already know.
2.  **Structured Concurrency**: This is a key benefit. If the original incoming request to your server is cancelled or times out, Effect will automatically interrupt the outgoing `Http.client` request. A raw `fetch` call would continue running in the background, wasting resources.
3.  **Typed Errors**: The client provides a rich set of typed errors (e.g., `Http.error.RequestError`, `Http.error.ResponseError`). This allows you to write precise error handling logic to distinguish between a network failure and a non-2xx response from the external API.
4.  **Testability**: The `Http.client` can be provided via a `Layer`, making it trivial to mock in tests. You can test your route's logic without making actual network calls, leading to faster and more reliable tests.

---


---

### Integrate Effect Tracing with OpenTelemetry
**ID:** integrate-effect-tracing-with-opentelemetry
**Use Case:** N/A | **Skill Level:** N/A

description: Integrate Effect.withSpan with OpenTelemetry to export traces and visualize request flows across services.
globs: "**/*.ts"
alwaysApply: true

# Integrate Effect Tracing with OpenTelemetry
**Rule:** Integrate Effect.withSpan with OpenTelemetry to export traces and visualize request flows across services.

### Example
```typescript
import { Effect } from "effect";
// Pseudocode: Replace with actual OpenTelemetry integration for your stack
import { trace, context, SpanStatusCode } from "@opentelemetry/api";

// Wrap an Effect.withSpan to export to OpenTelemetry
function withOtelSpan<T>(name: string, effect: Effect.Effect<unknown, T, unknown>) {
  return Effect.gen(function* () {
    const otelSpan = trace.getTracer("default").startSpan(name);
    try {
      const result = yield* effect;
      otelSpan.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err) {
      otelSpan.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
      throw err;
    } finally {
      otelSpan.end();
    }
  });
}

// Usage
const program = withOtelSpan("fetchUser", Effect.sync(() => {
  // ...fetch user logic
  return { id: 1, name: "Alice" };
}));
```

**Explanation:**  
- Start an OpenTelemetry span when entering an Effectful operation.
- Set status and attributes as needed.
- End the span when the operation completes or fails.
- This enables full distributed tracing and visualization in your observability platform.

**Explanation:**  
OpenTelemetry is the industry standard for distributed tracing.  
By integrating Effect's spans with OpenTelemetry, you gain deep visibility into request flows, performance bottlenecks, and dependencies—across all your services and infrastructure.


---

### Supercharge Your Editor with the Effect LSP
**ID:** supercharge-your-editor-with-the-effect-lsp
**Use Case:** N/A | **Skill Level:** N/A

description: Install and use the Effect LSP extension for enhanced type information and error checking in your editor.
globs: "**/*.ts"
alwaysApply: true

# Supercharge Your Editor with the Effect LSP
**Rule:** Install and use the Effect LSP extension for enhanced type information and error checking in your editor.

### Example
Imagine you have the following code. Without the LSP, hovering over `program` might show a complex, hard-to-read inferred type.

```typescript
import { Effect } from "effect";

// Define Logger service using Effect.Service pattern
class Logger extends Effect.Service<Logger>()(
  "Logger",
  {
    sync: () => ({
      log: (msg: string) => Effect.log(`LOG: ${msg}`)
    })
  }
) {}

const program = Effect.succeed(42).pipe(
  Effect.map((n) => n.toString()),
  Effect.flatMap((s) => Effect.log(s)),
  Effect.provide(Logger.Default)
);

// Run the program
Effect.runPromise(program);
```

With the Effect LSP installed, your editor would display a clear, readable overlay right above the `program` variable, looking something like this:

```
// (LSP Inlay Hint)
// program: Effect<void, never, never>
```

This immediately tells you that the final program returns nothing (`void`), has no expected failures (`never`), and has no remaining requirements (`never`), so it's ready to be run.

---

**Explanation:**  
Effect's type system is incredibly powerful, but TypeScript's default language server doesn't always display the rich information contained within the `A`, `E`, and `R` channels in the most intuitive way.

The Effect LSP is a specialized tool that understands the semantics of Effect. It hooks into your editor to provide a superior experience:
-   **Rich Inline Types:** It displays the full `Effect<A, E, R>` signature directly in your code as you work, so you always know exactly what an effect produces, how it can fail, and what it requires.
-   **Clear Error Messages:** It provides more specific and helpful error messages tailored to Effect's APIs.
-   **Enhanced Autocompletion:** It can offer more context-aware suggestions.

This tool essentially makes the compiler's knowledge visible at a glance, reducing the mental overhead of tracking complex types and allowing you to catch errors before you even save the file.

---


---

### Conditional Branching with if, when, and cond
**ID:** conditional-branching-with-if-when-and-cond
**Use Case:** N/A | **Skill Level:** N/A

description: Use combinators such as if, when, and cond to branch computations based on runtime conditions, without imperative if statements.
globs: "**/*.ts"
alwaysApply: true

# Conditional Branching with if, when, and cond
**Rule:** Use combinators such as if, when, and cond to branch computations based on runtime conditions, without imperative if statements.

### Example
```typescript
import { Effect, Stream, Option, Either } from "effect";

// Effect: Branch based on a condition
const effect = Effect.if(true, {
  onTrue: () => Effect.succeed("yes"),
  onFalse: () => Effect.succeed("no")
}); // Effect<string>

// Option: Conditionally create an Option
const option = true ? Option.some("yes") : Option.none(); // Option<string> (Some("yes"))

// Either: Conditionally create an Either
const either = true
  ? Either.right("yes")
  : Either.left("error"); // Either<string, string> (Right("yes"))

// Stream: Conditionally emit a stream
const stream = false
  ? Stream.fromIterable([1, 2])
  : Stream.empty; // Stream<number> (empty)
```

**Explanation:**  
These combinators let you branch your computation based on a boolean or predicate, without leaving the world of composable, type-safe code.  
You can also use `when` to run an effect only if a condition is true, or `unless` to run it only if a condition is false.

**Explanation:**  
Declarative branching keeps your code composable, testable, and easy to reason about.  
It also ensures that error handling and context propagation are preserved, and that your code remains consistent across different Effect types.


---

### Mapping Errors to Fit Your Domain
**ID:** mapping-errors-to-fit-your-domain
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect.mapError to transform errors and create clean architectural boundaries between layers.
globs: "**/*.ts"
alwaysApply: true

# Mapping Errors to Fit Your Domain
**Rule:** Use Effect.mapError to transform errors and create clean architectural boundaries between layers.

### Example
A `UserRepository` uses a `Database` service. The `Database` can fail with specific errors, but the `UserRepository` maps them to a single, generic `RepositoryError` before they are exposed to the rest of the application.

```typescript
import { Effect, Data } from "effect";

// Low-level, specific errors from the database layer
class ConnectionError extends Data.TaggedError("ConnectionError") {}
class QueryError extends Data.TaggedError("QueryError") {}

// A generic error for the repository layer
class RepositoryError extends Data.TaggedError("RepositoryError")<{
  readonly cause: unknown;
}> {}

// The inner service
const dbQuery = (): Effect.Effect<
  { name: string },
  ConnectionError | QueryError
> => Effect.fail(new ConnectionError());

// The outer service uses `mapError` to create a clean boundary.
// Its public signature only exposes `RepositoryError`.
const findUser = (): Effect.Effect<{ name: string }, RepositoryError> =>
  dbQuery().pipe(
    Effect.mapError((error) => new RepositoryError({ cause: error }))
  );

// Demonstrate the error mapping
const program = Effect.gen(function* () {
  yield* Effect.logInfo("Attempting to find user...");

  try {
    const user = yield* findUser();
    yield* Effect.logInfo(`Found user: ${user.name}`);
  } catch (error) {
    yield* Effect.logInfo("This won't be reached due to Effect error handling");
  }
}).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      if (error instanceof RepositoryError) {
        yield* Effect.logInfo(`Repository error occurred: ${error._tag}`);
        if (error.cause instanceof ConnectionError || error.cause instanceof QueryError) {
          yield* Effect.logInfo(`Original cause: ${error.cause._tag}`);
        }
      } else {
        yield* Effect.logInfo(`Unexpected error: ${error}`);
      }
    })
  )
);

Effect.runPromise(program);

```

---

**Explanation:**  
This pattern is essential for creating clean architectural boundaries and preventing "leaky abstractions." An outer layer of your application (e.g., a `UserService`) should not expose the internal failure details of the layers it depends on (e.g., a `Database` that can fail with `ConnectionError` or `QueryError`).

By using `Effect.mapError`, the outer layer can define its own, more abstract error type (like `RepositoryError`) and map all the specific, low-level errors into it. This decouples the layers. If you later swap your database implementation, you only need to update the mapping logic within the repository layer; none of the code that *uses* the repository needs to change.

---


---

### Send a JSON Response
**ID:** send-a-json-response
**Use Case:** N/A | **Skill Level:** N/A

description: Use Http.response.json to automatically serialize data structures into a JSON response.
globs: "**/*.ts"
alwaysApply: true

# Send a JSON Response
**Rule:** Use Http.response.json to automatically serialize data structures into a JSON response.

### Example
This example defines a route that fetches a user object and returns it as a JSON response. The `Http.response.json` function handles all the necessary serialization and header configuration.

```typescript
import { Effect, Context, Duration, Layer } from "effect";
import { NodeContext, NodeHttpServer } from "@effect/platform-node";
import { createServer } from "node:http";

const PORT = 3459; // Changed port to avoid conflicts

// Define HTTP Server service
class JsonServer extends Effect.Service<JsonServer>()("JsonServer", {
  sync: () => ({
    handleRequest: () =>
      Effect.succeed({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Hello, JSON!",
          timestamp: new Date().toISOString(),
        }),
      }),
  }),
}) {}

// Create and run the server
const program = Effect.gen(function* () {
  const jsonServer = yield* JsonServer;

  // Create and start HTTP server
  const server = createServer((req, res) => {
    const requestHandler = Effect.gen(function* () {
      try {
        const response = yield* jsonServer.handleRequest();
        res.writeHead(response.status, response.headers);
        res.end(response.body);
        // Log the response for demonstration
        yield* Effect.logInfo(`Sent JSON response: ${response.body}`);
      } catch (error: any) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
        yield* Effect.logError(`Request error: ${error.message}`);
      }
    });
    
    Effect.runPromise(requestHandler);
  });

  // Start server with error handling
  yield* Effect.async<void, Error>((resume) => {
    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        resume(Effect.fail(new Error(`Port ${PORT} is already in use`)));
      } else {
        resume(Effect.fail(error));
      }
    });

    server.listen(PORT, () => {
      resume(Effect.succeed(void 0));
    });
  });

  yield* Effect.logInfo(`Server running at http://localhost:${PORT}`);
  yield* Effect.logInfo("Try: curl http://localhost:3459");

  // Run for a short time to demonstrate
  yield* Effect.sleep(Duration.seconds(3));

  // Shutdown gracefully
  yield* Effect.sync(() => server.close());
  yield* Effect.logInfo("Server shutdown complete");
}).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logError(`Server error: ${error.message}`);
      return error;
    })
  ),
  // Merge layers and provide them in a single call to ensure proper lifecycle management
  Effect.provide(Layer.merge(
    JsonServer.Default,
    NodeContext.layer
  ))
);

// Run the program
// Use Effect.runFork for server applications that shouldn't resolve the promise
Effect.runPromise(program.pipe(
  // Ensure the Effect has no remaining context requirements for runPromise
  Effect.map(() => undefined)
));

```

**Explanation:**  
APIs predominantly communicate using JSON. The `Http` module provides a dedicated `Http.response.json` helper to make this as simple and robust as possible. Manually constructing a JSON response involves serializing the data and setting the correct HTTP headers, which is tedious and error-prone.

Using `Http.response.json` is superior because:

1.  **Automatic Serialization**: It safely handles the `JSON.stringify` operation for you, including handling potential circular references or other serialization errors.
2.  **Correct Headers**: It automatically sets the `Content-Type: application/json; charset=utf-8` header. This is critical for clients to correctly interpret the response body. Forgetting this header is a common source of bugs in manually constructed APIs.
3.  **Simplicity and Readability**: Your intent is made clear with a single, declarative function call. The code is cleaner and focuses on the data being sent, not the mechanics of HTTP.
4.  **Composability**: It creates a standard `Http.response` object that works seamlessly with all other parts of the Effect `Http` module.

---


---

### Define a Type-Safe Configuration Schema
**ID:** define-a-type-safe-configuration-schema
**Use Case:** N/A | **Skill Level:** N/A

description: Define a type-safe configuration schema.
globs: "**/*.ts"
alwaysApply: true

# Define a Type-Safe Configuration Schema
**Rule:** Define a type-safe configuration schema.

### Example
```typescript
import { Config, Effect, ConfigProvider, Layer } from "effect"

const ServerConfig = Config.nested("SERVER")(
  Config.all({
    host: Config.string("HOST"),
    port: Config.number("PORT"),
  })
)

// Example program that uses the config
const program = Effect.gen(function* () {
  const config = yield* ServerConfig
  yield* Effect.logInfo(`Server config loaded: ${JSON.stringify(config)}`)
})

// Create a config provider with test values
const TestConfig = ConfigProvider.fromMap(
  new Map([
    ["SERVER.HOST", "localhost"],
    ["SERVER.PORT", "3000"]
  ])
)

// Run with test config
Effect.runPromise(
  Effect.provide(
    program,
    Layer.setConfigProvider(TestConfig)
  )
)
```

**Explanation:**  
This schema ensures that both `host` and `port` are present and properly typed, and that their source is clearly defined.

**Explanation:**  
This creates a single, type-safe source of truth for your configuration, eliminating runtime errors from missing or malformed environment variables and making the required configuration explicit.


---

### Add Caching by Wrapping a Layer
**ID:** add-caching-by-wrapping-a-layer
**Use Case:** N/A | **Skill Level:** N/A

description: Use a wrapping Layer to add cross-cutting concerns like caching to a service without altering its original implementation.
globs: "**/*.ts"
alwaysApply: true

# Add Caching by Wrapping a Layer
**Rule:** Use a wrapping Layer to add cross-cutting concerns like caching to a service without altering its original implementation.

### Example
We have a `WeatherService` that makes slow API calls. We create a `WeatherService.cached` wrapper layer that adds an in-memory cache using a `Ref` and a `Map`.

```typescript
import { Effect, Layer, Ref } from "effect";

// 1. Define the service interface
class WeatherService extends Effect.Service<WeatherService>()(
  "WeatherService",
  {
    sync: () => ({
      getForecast: (city: string) => Effect.succeed(`Sunny in ${city}`),
    }),
  }
) {}

// 2. The "Live" implementation that is slow
const WeatherServiceLive = Layer.succeed(
  WeatherService,
  WeatherService.of({
    _tag: "WeatherService",
    getForecast: (city) =>
      Effect.succeed(`Sunny in ${city}`).pipe(
        Effect.delay("2 seconds"),
        Effect.tap(() => Effect.log(`Fetched live forecast for ${city}`))
      ),
  })
);

// 3. The Caching Wrapper Layer
const WeatherServiceCached = Layer.effect(
  WeatherService,
  Effect.gen(function* () {
    // It REQUIRES the original WeatherService
    const underlyingService = yield* WeatherService;
    const cache = yield* Ref.make(new Map<string, string>());

    return WeatherService.of({
      _tag: "WeatherService",
      getForecast: (city) =>
        Ref.get(cache).pipe(
          Effect.flatMap((map) =>
            map.has(city)
              ? Effect.log(`Cache HIT for ${city}`).pipe(
                  Effect.as(map.get(city)!)
                )
              : Effect.log(`Cache MISS for ${city}`).pipe(
                  Effect.flatMap(() => underlyingService.getForecast(city)),
                  Effect.tap((forecast) =>
                    Ref.update(cache, (map) => map.set(city, forecast))
                  )
                )
          )
        ),
    });
  })
);

// 4. Compose the final layer. The wrapper is provided with the live implementation.
const AppLayer = Layer.provide(WeatherServiceCached, WeatherServiceLive);

// 5. The application logic
const program = Effect.gen(function* () {
  const weather = yield* WeatherService;
  yield* weather.getForecast("London"); // First call is slow (MISS)
  yield* weather.getForecast("London"); // Second call is instant (HIT)
});

Effect.runPromise(Effect.provide(program, AppLayer));

```

---

**Explanation:**  
You often want to add functionality like caching, logging, or metrics to a service without polluting its core business logic. The wrapper layer pattern is a clean way to achieve this.

By creating a layer that *requires* the original service, you can get an instance of it from the context, and then provide a *new* implementation of that same service that calls the original.

This approach is powerful because:
-   **It's Non-Invasive:** The original service (`DatabaseLive`) remains completely unchanged.
-   **It's Composable:** You can apply multiple wrappers. You could wrap a database layer with a caching layer, then wrap that with a metrics layer.
-   **It's Explicit:** The composition is clearly defined at the application's top level where you build your final `AppLayer`.

---


---

### Leverage Effect's Built-in Structured Logging
**ID:** leverage-effects-built-in-structured-logging
**Use Case:** N/A | **Skill Level:** N/A

description: Leverage Effect's built-in structured logging.
globs: "**/*.ts"
alwaysApply: true

# Leverage Effect's Built-in Structured Logging
**Rule:** Leverage Effect's built-in structured logging.

### Example
```typescript
import { Effect } from "effect";

const program = Effect.logDebug("Processing user", { userId: 123 });

// Run the program with debug logging enabled
Effect.runSync(
  program.pipe(
    Effect.tap(() => Effect.log("Debug logging enabled"))
  )
);
```

**Explanation:**  
Using Effect's logging system ensures your logs are structured, filterable,
and context-aware.

**Explanation:**  
Effect's logger is structured, context-aware (with trace IDs), configurable
via `Layer`, and testable. It's a first-class citizen, not an unmanaged
side-effect.


---

### Lifting Values with succeed, some, and right
**ID:** lifting-values-with-succeed-some-and-right
**Use Case:** N/A | **Skill Level:** N/A

description: Use succeed, some, and right to create Effect, Option, or Either from plain values.
globs: "**/*.ts"
alwaysApply: true

# Lifting Values with succeed, some, and right
**Rule:** Use succeed, some, and right to create Effect, Option, or Either from plain values.

### Example
```typescript
import { Effect, Option, Either } from "effect";

// Effect: Lift a value into an Effect that always succeeds
const effect = Effect.succeed(42); // Effect<never, number, never>

// Option: Lift a value into an Option that is always Some
const option = Option.some("hello"); // Option<string>

// Either: Lift a value into an Either that is always Right
const either = Either.right({ id: 1 }); // Either<never, { id: number }>
```

**Explanation:**  
- `Effect.succeed(value)` creates an effect that always succeeds with `value`.
- `Option.some(value)` creates an option that is always present.
- `Either.right(value)` creates an either that always represents success.

**Explanation:**  
Lifting values into these structures allows you to compose them with other effects, options, or eithers, and to take advantage of all the combinators and error handling that Effect provides.


---

### Run Independent Effects in Parallel with Effect.all
**ID:** run-independent-effects-in-parallel-with-effect-all
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect.all to execute a collection of independent effects concurrently.
globs: "**/*.ts"
alwaysApply: true

# Run Independent Effects in Parallel with Effect.all
**Rule:** Use Effect.all to execute a collection of independent effects concurrently.

### Example
Imagine fetching a user's profile and their latest posts from two different API endpoints. These are independent operations and can be run in parallel to save time.

```typescript
import { Effect } from "effect";

// Simulate fetching a user, takes 1 second
const fetchUser = Effect.succeed({ id: 1, name: "Paul" }).pipe(
  Effect.delay("1 second"),
);

// Simulate fetching posts, takes 1.5 seconds
const fetchPosts = Effect.succeed([{ title: "Effect is great" }]).pipe(
  Effect.delay("1.5 seconds"),
);

// Run both effects concurrently
const program = Effect.all([fetchUser, fetchPosts]);

// The resulting effect will succeed with a tuple: [{id, name}, [{title}]]
// Total execution time will be ~1.5 seconds (the duration of the longest task).
Effect.runPromise(program).then(console.log);
```

---

---

### Comparing Data by Value with Structural Equality
**ID:** comparing-data-by-value-with-structural-equality
**Use Case:** N/A | **Skill Level:** N/A

description: Use Data.struct or implement the Equal interface for value-based comparison of objects and classes.
globs: "**/*.ts"
alwaysApply: true

# Comparing Data by Value with Structural Equality
**Rule:** Use Data.struct or implement the Equal interface for value-based comparison of objects and classes.

### Example
We define two points using `Data.struct`. Even though `p1` and `p2` are different instances in memory, `Equal.equals` correctly reports them as equal because their contents match.

```typescript
import { Data, Equal, Effect } from "effect";

// Define a Point type with structural equality
interface Point {
  readonly _tag: "Point";
  readonly x: number;
  readonly y: number;
}

const Point = Data.tagged<Point>("Point");

// Create a program to demonstrate structural equality
const program = Effect.gen(function* () {
  const p1 = Point({ x: 1, y: 2 });
  const p2 = Point({ x: 1, y: 2 });
  const p3 = Point({ x: 3, y: 4 });

  // Standard reference equality fails
  yield* Effect.log("Comparing points with reference equality (===):");
  yield* Effect.log(`p1 === p2: ${p1 === p2}`);

  // Structural equality works as expected
  yield* Effect.log("\nComparing points with structural equality:");
  yield* Effect.log(`p1 equals p2: ${Equal.equals(p1, p2)}`);
  yield* Effect.log(`p1 equals p3: ${Equal.equals(p1, p3)}`);

  // Show the actual points
  yield* Effect.log("\nPoint values:");
  yield* Effect.log(`p1: ${JSON.stringify(p1)}`);
  yield* Effect.log(`p2: ${JSON.stringify(p2)}`);
  yield* Effect.log(`p3: ${JSON.stringify(p3)}`);
});

// Run the program
Effect.runPromise(program);
```

---

**Explanation:**  
In JavaScript, comparing two non-primitive values with `===` checks for *referential equality*. It only returns `true` if they are the exact same instance in memory. This means two objects with identical contents are not considered equal, which is a common source of bugs.

```typescript
{ a: 1 } === { a: 1 } // false!
```

Effect solves this with **structural equality**. All of Effect's built-in data structures (`Option`, `Either`, `Chunk`, etc.) can be compared by their structure and values. By using helpers like `Data.struct`, you can easily give your own data structures this same powerful and predictable behavior.

---


---

### Creating from Collections
**ID:** creating-from-collections
**Use Case:** N/A | **Skill Level:** N/A

description: Use fromIterable and fromArray to lift collections into Streams or Effects for batch or streaming processing.
globs: "**/*.ts"
alwaysApply: true

# Creating from Collections
**Rule:** Use fromIterable and fromArray to lift collections into Streams or Effects for batch or streaming processing.

### Example
```typescript
import { Stream, Effect } from "effect";

// Stream: Create a stream from an array
const numbers = [1, 2, 3, 4];
const numberStream = Stream.fromIterable(numbers); // Stream<number>

// Stream: Create a stream from any iterable
function* gen() {
  yield "a";
  yield "b";
}
const letterStream = Stream.fromIterable(gen()); // Stream<string>

// Effect: Create an effect from an array of effects (batch)
const effects = [Effect.succeed(1), Effect.succeed(2)];
const batchEffect = Effect.all(effects); // Effect<[1, 2]>
```

**Explanation:**  
- `Stream.fromIterable` creates a stream from any array or iterable, enabling streaming and batch operations.
- `Effect.all` (covered elsewhere) can be used to process arrays of effects in batch.

**Explanation:**  
Lifting collections into Streams or Effects allows you to process data in a composable, resource-safe, and potentially concurrent way.  
It also enables you to use all of Effect's combinators for transformation, filtering, and error handling.


---

### Handle a GET Request
**ID:** handle-a-get-request
**Use Case:** N/A | **Skill Level:** N/A

description: Use Http.router.get to associate a URL path with a specific response Effect.
globs: "**/*.ts"
alwaysApply: true

# Handle a GET Request
**Rule:** Use Http.router.get to associate a URL path with a specific response Effect.

### Example
This example defines two separate GET routes, one for the root path (`/`) and one for `/hello`. We create an empty router and add each route to it. The resulting `app` is then served. The router automatically handles sending a `404 Not Found` response for any path that doesn't match.

```typescript
import { Data, Effect } from 'effect'

// Define response types
interface RouteResponse {
  readonly status: number;
  readonly body: string;
}

// Define error types
class RouteNotFoundError extends Data.TaggedError("RouteNotFoundError")<{
  readonly path: string;
}> {}

class RouteHandlerError extends Data.TaggedError("RouteHandlerError")<{
  readonly path: string;
  readonly error: string;
}> {}

// Define route service
class RouteService extends Effect.Service<RouteService>()(
  "RouteService",
  {
    sync: () => {
      // Create instance methods
      const handleRoute = (path: string): Effect.Effect<RouteResponse, RouteNotFoundError | RouteHandlerError> =>
        Effect.gen(function* () {
          yield* Effect.logInfo(`Processing request for path: ${path}`);
          
          try {
            switch (path) {
              case '/':
                const home = 'Welcome to the home page!';
                yield* Effect.logInfo(`Serving home page`);
                return { status: 200, body: home };

              case '/hello':
                const hello = 'Hello, Effect!';
                yield* Effect.logInfo(`Serving hello page`);
                return { status: 200, body: hello };

              default:
                yield* Effect.logWarning(`Route not found: ${path}`);
                return yield* Effect.fail(new RouteNotFoundError({ path }));
            }
          } catch (e) {
            const error = e instanceof Error ? e.message : String(e);
            yield* Effect.logError(`Error handling route ${path}: ${error}`);
            return yield* Effect.fail(new RouteHandlerError({ path, error }));
          }
        });

      // Return service implementation
      return {
        handleRoute,
        // Simulate GET request
        simulateGet: (path: string): Effect.Effect<RouteResponse, RouteNotFoundError | RouteHandlerError> =>
          Effect.gen(function* () {
            yield* Effect.logInfo(`GET ${path}`);
            const response = yield* handleRoute(path);
            yield* Effect.logInfo(`Response: ${JSON.stringify(response)}`);
            return response;
          })
      };
    }
  }
) {}

// Create program with proper error handling
const program = Effect.gen(function* () {
  const router = yield* RouteService;
  
  yield* Effect.logInfo("=== Starting Route Tests ===");
  
  // Test different routes
  for (const path of ['/', '/hello', '/other', '/error']) {
    yield* Effect.logInfo(`\n--- Testing ${path} ---`);
    
    const result = yield* router.simulateGet(path).pipe(
      Effect.catchTags({
        RouteNotFoundError: (error) =>
          Effect.gen(function* () {
            const response = { status: 404, body: `Not Found: ${error.path}` };
            yield* Effect.logWarning(`${response.status} ${response.body}`);
            return response;
          }),
        RouteHandlerError: (error) =>
          Effect.gen(function* () {
            const response = { status: 500, body: `Internal Error: ${error.error}` };
            yield* Effect.logError(`${response.status} ${response.body}`);
            return response;
          })
      })
    );
    
    yield* Effect.logInfo(`Final Response: ${JSON.stringify(result)}`);
  }
  
  yield* Effect.logInfo("\n=== Route Tests Complete ===");
});

// Run the program
Effect.runPromise(
  Effect.provide(program, RouteService.Default)
);
```

**Explanation:**  
A real application needs to respond differently to different URLs. The `Http.router` provides a declarative, type-safe, and composable way to manage this routing logic. Instead of a single handler with complex conditional logic, you define many small, focused handlers and assign them to specific paths and HTTP methods.

This approach has several advantages:

1.  **Declarative and Readable**: Your code clearly expresses the mapping between a URL path and its behavior, making the application's structure easy to understand.
2.  **Composability**: Routers are just values that can be created, combined, and passed around. This makes it easy to organize routes into logical groups (e.g., a `userRoutes` router and a `productRoutes` router) and merge them.
3.  **Type Safety**: The router ensures that the handler for a route is only ever called for a matching request, simplifying the logic within the handler itself.
4.  **Integration**: Each route handler is an `Effect`, meaning it has full access to dependency injection, structured concurrency, and integrated error handling, just like any other part of an Effect application.

---


---

### Turn a Paginated API into a Single Stream
**ID:** turn-a-paginated-api-into-a-single-stream
**Use Case:** N/A | **Skill Level:** N/A

description: Use Stream.paginateEffect to model a paginated data source as a single, continuous stream.
globs: "**/*.ts"
alwaysApply: true

# Turn a Paginated API into a Single Stream
**Rule:** Use Stream.paginateEffect to model a paginated data source as a single, continuous stream.

### Example
This example simulates fetching users from a paginated API. The `fetchUsersPage` function gets one page of data and returns the next page number. `Stream.paginateEffect` uses this function to create a single stream of all users across all pages.

```typescript
import { Effect, Stream, Chunk, Option } from 'effect';

// --- Mock Paginated API ---
interface User {
  id: number;
  name: string;
}

// Define FetchError as a class with a literal type tag
class FetchError {
  readonly _tag = 'FetchError' as const;
  constructor(readonly message: string) {}
}

// Helper to create FetchError instances
const fetchError = (message: string): FetchError => new FetchError(message);

const allUsers: User[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
}));

// This function simulates fetching a page of users from an API.
const fetchUsersPage = (
  page: number
): Effect.Effect<[Chunk.Chunk<User>, Option.Option<number>], FetchError> =>
  Effect.gen(function* () {
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    // Simulate potential API errors
    if (page < 1) {
      return yield* Effect.fail(fetchError('Invalid page number'));
    }

    const users = Chunk.fromIterable(allUsers.slice(offset, offset + pageSize));

    const nextPage =
      Chunk.isNonEmpty(users) && allUsers.length > offset + pageSize
        ? Option.some(page + 1)
        : Option.none();

    yield* Effect.log(`Fetched page ${page}`);
    return [users, nextPage];
  });

// --- The Pattern ---
// Use paginateEffect, providing an initial state (page 1) and the fetch function.
const userStream = Stream.paginateEffect(1, fetchUsersPage);

const program = userStream.pipe(
  Stream.runCollect,
  Effect.map((users) => users.length),
  Effect.tap((totalUsers) => 
    Effect.log(`Total users fetched: ${totalUsers}`)
  ),
  Effect.catchTag('FetchError', (error) => 
    Effect.succeed(`Error fetching users: ${error.message}`)
  )
);

// Run the program
const programWithLogging = Effect.gen(function* () {
  const result = yield* program;
  yield* Effect.log(`Program result: ${result}`);
  return result;
});

Effect.runPromise(programWithLogging);

/*
Output:
... level=INFO msg="Fetched page 1"
... level=INFO msg="Fetched page 2"
... level=INFO msg="Fetched page 3"
... level=INFO msg="Total users fetched: 25"
25
*/
```

**Explanation:**  
Calling paginated APIs is a classic programming challenge. It often involves writing complex, stateful, and imperative code with manual loops to fetch one page, check if there's a next page, fetch that page, and so on, all while accumulating the results. This logic is tedious to write and easy to get wrong.

`Stream.paginateEffect` elegantly solves this by declaratively modeling the pagination process:

1.  **Declarative and Stateless**: You provide a function that knows how to fetch a single page, and the `Stream` handles the looping, state management (the current page token/number), and termination logic for you. Your business logic remains clean and stateless.
2.  **Lazy and Efficient**: The stream fetches pages on demand as they are consumed. If a downstream consumer only needs the first 20 items, the stream will only make enough API calls to satisfy that need, rather than wastefully fetching all pages upfront.
3.  **Fully Composable**: The result is a standard `Stream`. This means you can pipe the continuous flow of items directly into other powerful operators like `mapEffect` for concurrent processing or `grouped` for batching, without ever thinking about page boundaries again.

---


---

### Parse and Validate Data with Schema.decode
**ID:** parse-and-validate-data-with-schema-decode
**Use Case:** N/A | **Skill Level:** N/A

description: Parse and validate data with Schema.decode.
globs: "**/*.ts"
alwaysApply: true

# Parse and Validate Data with Schema.decode
**Rule:** Parse and validate data with Schema.decode.

### Example
```typescript
import { Effect, Schema } from "effect";

interface User {
  name: string;
}

const UserSchema = Schema.Struct({
  name: Schema.String,
}) as Schema.Schema<User>;

const processUserInput = (input: unknown) =>
  Effect.gen(function* () {
    const user = yield* Schema.decodeUnknown(UserSchema)(input);
    return `Welcome, ${user.name}!`;
  }).pipe(
    Effect.catchTag("ParseError", () => Effect.succeed("Invalid user data."))
  );

// Demonstrate the schema parsing
const program = Effect.gen(function* () {
  // Test with valid input
  const validInput = { name: "Paul" };
  const validResult = yield* processUserInput(validInput);
  yield* Effect.logInfo(`Valid input result: ${validResult}`);

  // Test with invalid input
  const invalidInput = { age: 25 }; // Missing 'name' field
  const invalidResult = yield* processUserInput(invalidInput);
  yield* Effect.logInfo(`Invalid input result: ${invalidResult}`);

  // Test with completely invalid input
  const badInput = "not an object";
  const badResult = yield* processUserInput(badInput);
  yield* Effect.logInfo(`Bad input result: ${badResult}`);
});

Effect.runPromise(program);

```

**Explanation:**  
`Schema.decode` integrates parsing and validation into the Effect workflow,
making error handling composable and type-safe.

---

### Wrapping Synchronous and Asynchronous Computations
**ID:** wrapping-synchronous-and-asynchronous-computations
**Use Case:** N/A | **Skill Level:** N/A

description: Use try and tryPromise to lift code that may throw or reject into Effect, capturing errors in the failure channel.
globs: "**/*.ts"
alwaysApply: true

# Wrapping Synchronous and Asynchronous Computations
**Rule:** Use try and tryPromise to lift code that may throw or reject into Effect, capturing errors in the failure channel.

### Example
```typescript
import { Effect } from "effect";

// Synchronous: Wrap code that may throw
const effectSync = Effect.try({
  try: () => JSON.parse("{ invalid json }"),
  catch: (error) => `Parse error: ${String(error)}`
}); // Effect<string, never, never>

// Asynchronous: Wrap a promise that may reject
const effectAsync = Effect.tryPromise({
  try: () => fetch("https://api.example.com/data").then(res => res.json()),
  catch: (error) => `Network error: ${String(error)}`
}); // Effect<string, any, never>
```

**Explanation:**  
- `Effect.try` wraps a synchronous computation that may throw, capturing the error in the failure channel.
- `Effect.tryPromise` wraps an async computation (Promise) that may reject, capturing the rejection as a failure.

**Explanation:**  
Wrapping potentially unsafe code in `try` or `tryPromise` ensures that all errors are handled in a uniform, declarative way.  
This eliminates the need for try/catch blocks and makes error handling explicit and type-safe.


---

### Manage Resource Lifecycles with Scope
**ID:** manage-resource-lifecycles-with-scope
**Use Case:** N/A | **Skill Level:** N/A

description: Use Scope for fine-grained, manual control over resource lifecycles and cleanup guarantees.
globs: "**/*.ts"
alwaysApply: true

# Manage Resource Lifecycles with Scope
**Rule:** Use Scope for fine-grained, manual control over resource lifecycles and cleanup guarantees.

### Example
This example shows how to acquire a resource (like a file handle), use it, and have `Scope` guarantee its release.

```typescript
import { Effect, Scope } from "effect";

// Simulate acquiring and releasing a resource
const acquireFile = Effect.log("File opened").pipe(
  Effect.as({ write: (data: string) => Effect.log(`Wrote: ${data}`) }),
);
const releaseFile = Effect.log("File closed.");

// Create a "scoped" effect. This effect, when used, will acquire the
// resource and register its release action with the current scope.
const scopedFile = Effect.acquireRelease(acquireFile, () => releaseFile);

// The main program that uses the scoped resource
const program = Effect.gen(function* () {
  // Effect.scoped "uses" the resource. It runs the acquire effect,
  // provides the resource to the inner effect, and ensures the
  // release effect is run when this block completes.
  const file = yield* Effect.scoped(scopedFile);

  yield* file.write("hello");
  yield* file.write("world");

  // The file will be automatically closed here.
});

Effect.runPromise(program);
/*
Output:
File opened
Wrote: hello
Wrote: world
File closed
*/
```

---

**Explanation:**  
`Scope` is the fundamental building block for all resource management in Effect. While higher-level APIs like `Layer.scoped` and `Stream` are often sufficient, understanding `Scope` is key to advanced use cases.

A `Scope` guarantees that any finalizers added to it will be executed when the scope is closed, regardless of whether the associated computation succeeds, fails, or is interrupted. This provides a rock-solid guarantee against resource leaks.

This is especially critical in concurrent applications. When a parent fiber is interrupted, it closes its scope, which in turn automatically interrupts all its child fibers and runs all their finalizers in a structured, predictable order.

---


---

### Decouple Fibers with Queues and PubSub
**ID:** decouple-fibers-with-queues-and-pubsub
**Use Case:** N/A | **Skill Level:** N/A

description: Use Queue for point-to-point work distribution and PubSub for broadcast messaging between fibers.
globs: "**/*.ts"
alwaysApply: true

# Decouple Fibers with Queues and PubSub
**Rule:** Use Queue for point-to-point work distribution and PubSub for broadcast messaging between fibers.

### Example
A producer fiber adds jobs to a `Queue`, and a worker fiber takes jobs off the queue to process them.

```typescript
import { Effect, Queue, Fiber } from "effect";

const program = Effect.gen(function* () {
  yield* Effect.logInfo("Starting queue demo...");

  // Create a bounded queue that can hold a maximum of 10 items.
  // This prevents memory issues by applying backpressure when the queue is full.
  // If a producer tries to add to a full queue, it will suspend until space is available.
  const queue = yield* Queue.bounded<string>(10);
  yield* Effect.logInfo("Created bounded queue");

  // Producer Fiber: Add a job to the queue every second.
  // This fiber runs independently and continuously produces work items.
  // The producer-consumer pattern decouples work generation from work processing.
  const producer = yield* Effect.gen(function* () {
    let i = 0;
    while (true) {
      const job = `job-${i++}`;
      yield* Effect.logInfo(`Producing ${job}...`);

      // Queue.offer adds an item to the queue. If the queue is full,
      // this operation will suspend the fiber until space becomes available.
      // This provides natural backpressure control.
      yield* Queue.offer(queue, job);

      // Sleep for 500ms between job creation. This controls the production rate.
      // Producer is faster than consumer (500ms vs 1000ms) to demonstrate queue buffering.
      yield* Effect.sleep("500 millis");
    }
  }).pipe(Effect.fork); // Fork creates a new fiber that runs concurrently

  yield* Effect.logInfo("Started producer fiber");

  // Worker Fiber: Take a job from the queue and process it.
  // This fiber runs independently and processes work items as they become available.
  // Multiple workers could be created to scale processing capacity.
  const worker = yield* Effect.gen(function* () {
    while (true) {
      // Queue.take removes and returns an item from the queue.
      // If the queue is empty, this operation will suspend the fiber
      // until an item becomes available. This prevents busy-waiting.
      const job = yield* Queue.take(queue);
      yield* Effect.logInfo(`Processing ${job}...`);

      // Simulate work by sleeping for 1 second.
      // This makes the worker slower than the producer, causing queue buildup.
      yield* Effect.sleep("1 second");
      yield* Effect.logInfo(`Completed ${job}`);
    }
  }).pipe(Effect.fork); // Fork creates another independent fiber

  yield* Effect.logInfo("Started worker fiber");

  // Let them run for a while...
  // The main fiber sleeps while the producer and worker fibers run concurrently.
  // During this time, you'll see the queue acting as a buffer between
  // the fast producer and slow worker.
  yield* Effect.logInfo("Running for 10 seconds...");
  yield* Effect.sleep("10 seconds");
  yield* Effect.logInfo("Done!");

  // Interrupt both fibers to clean up resources.
  // Fiber.interrupt sends an interruption signal to the fiber,
  // allowing it to perform cleanup operations before terminating.
  // This is safer than forcefully killing fibers.
  yield* Fiber.interrupt(producer);
  yield* Fiber.interrupt(worker);

  // Note: In a real application, you might want to:
  // 1. Drain the queue before interrupting workers
  // 2. Use Fiber.join to wait for graceful shutdown
  // 3. Handle interruption signals in the fiber loops
});

// Run the program
// This demonstrates the producer-consumer pattern with Effect fibers:
// - Fibers are lightweight threads that can be created in large numbers
// - Queues provide safe communication between fibers
// - Backpressure prevents resource exhaustion
// - Interruption allows for graceful shutdown
Effect.runPromise(program);

```


A publisher sends an event, and multiple subscribers react to it independently.

```typescript
import { Effect, PubSub } from "effect";

const program = Effect.gen(function* () {
  const pubsub = yield* PubSub.bounded<string>(10);

  // Subscriber 1: The "Audit" service
  const auditSub = PubSub.subscribe(pubsub).pipe(
    Effect.flatMap((subscription) =>
      Effect.gen(function* () {
        while (true) {
          const event = yield* Queue.take(subscription);
          yield* Effect.log(`AUDIT: Received event: ${event}`);
        }
      }),
    ),
    Effect.fork,
  );

  // Subscriber 2: The "Notifier" service
  const notifierSub = PubSub.subscribe(pubsub).pipe(
    Effect.flatMap((subscription) =>
      Effect.gen(function* () {
        while (true) {
          const event = yield* Queue.take(subscription);
          yield* Effect.log(`NOTIFIER: Sending notification for: ${event}`);
        }
      }),
    ),
    Effect.fork,
  );

  // Give subscribers time to start
  yield* Effect.sleep("1 second");

  // Publisher: Publish an event that both subscribers will receive.
  yield* PubSub.publish(pubsub, "user_logged_in");
});
```

---

**Explanation:**  
Directly calling functions between different logical parts of a concurrent application creates tight coupling, making the system brittle and hard to scale. `Queue` and `PubSub` solve this by acting as asynchronous, fiber-safe message brokers.

This decouples the **producer** of a message from its **consumer(s)**. The producer doesn't need to know who is listening, or how many listeners there are. This allows you to build resilient, scalable systems where you can add or remove workers/listeners without changing the producer's code.

Furthermore, bounded `Queue`s and `PubSub`s provide automatic **back-pressure**. If consumers can't keep up, the producer will automatically pause before adding new items, preventing your system from becoming overloaded.

---


---

### Beyond the Date Type - Real World Dates, Times, and Timezones
**ID:** beyond-the-date-type-real-world-dates-times-and-timezones
**Use Case:** N/A | **Skill Level:** N/A

description: Use the Clock service for testable time-based logic and immutable primitives for timestamps.
globs: "**/*.ts"
alwaysApply: true

# Beyond the Date Type - Real World Dates, Times, and Timezones
**Rule:** Use the Clock service for testable time-based logic and immutable primitives for timestamps.

### Example
This example shows a function that creates a timestamped event. It depends on the `Clock` service, making it fully testable.

```typescript
import { Effect, Clock } from "effect";
import type * as Types from "effect/Clock";

interface Event {
  readonly message: string;
  readonly timestamp: number; // Store as a primitive number (UTC millis)
}

// This function is pure and testable because it depends on Clock
const createEvent = (message: string): Effect.Effect<Event, never, Types.Clock> =>
  Effect.gen(function* () {
    const timestamp = yield* Clock.currentTimeMillis;
    return { message, timestamp };
  });

// Create and log some events
const program = Effect.gen(function* () {
  const loginEvent = yield* createEvent("User logged in");
  console.log("Login event:", loginEvent);

  const logoutEvent = yield* createEvent("User logged out");
  console.log("Logout event:", logoutEvent);
});

// Run the program
Effect.runPromise(program.pipe(Effect.provideService(Clock.Clock, Clock.make()))).catch(console.error);
```

---

---

### Parse and Validate Data with Schema.decode
**ID:** parse-and-validate-data-with-schemadecode
**Use Case:** N/A | **Skill Level:** N/A

description: Parse and validate data with Schema.decode.
globs: "**/*.ts"
alwaysApply: true

# Parse and Validate Data with Schema.decode
**Rule:** Parse and validate data with Schema.decode.

### Example
```typescript
import { Effect, Schema } from "effect";

interface User {
  name: string;
}

const UserSchema = Schema.Struct({
  name: Schema.String,
}) as Schema.Schema<User>;

const processUserInput = (input: unknown) =>
  Effect.gen(function* () {
    const user = yield* Schema.decodeUnknown(UserSchema)(input);
    return `Welcome, ${user.name}!`;
  }).pipe(
    Effect.catchTag("ParseError", () => Effect.succeed("Invalid user data."))
  );

// Demonstrate the schema parsing
const program = Effect.gen(function* () {
  // Test with valid input
  const validInput = { name: "Paul" };
  const validResult = yield* processUserInput(validInput);
  yield* Effect.logInfo(`Valid input result: ${validResult}`);

  // Test with invalid input
  const invalidInput = { age: 25 }; // Missing 'name' field
  const invalidResult = yield* processUserInput(invalidInput);
  yield* Effect.logInfo(`Invalid input result: ${invalidResult}`);

  // Test with completely invalid input
  const badInput = "not an object";
  const badResult = yield* processUserInput(badInput);
  yield* Effect.logInfo(`Bad input result: ${badResult}`);
});

Effect.runPromise(program);

```

**Explanation:**  
`Schema.decode` integrates parsing and validation into the Effect workflow,
making error handling composable and type-safe.

**Explanation:**  
Unlike the older `Schema.parse` which throws, `Schema.decode` is fully
integrated into the Effect ecosystem, allowing you to handle validation
failures gracefully with operators like `Effect.catchTag`.


---

### Compose Resource Lifecycles with `Layer.merge`
**ID:** compose-resource-lifecycles-with-layer-merge
**Use Case:** N/A | **Skill Level:** N/A

description: Compose multiple scoped layers using `Layer.merge` or by providing one layer to another.
globs: "**/*.ts"
alwaysApply: true

# Compose Resource Lifecycles with `Layer.merge`
**Rule:** Compose multiple scoped layers using `Layer.merge` or by providing one layer to another.

### Example
```typescript
import { Effect, Layer, Console } from "effect";

// --- Service 1: Database ---
interface DatabaseOps {
  query: (sql: string) => Effect.Effect<string, never, never>;
}

class Database extends Effect.Service<DatabaseOps>()(
  "Database",
  {
    sync: () => ({
      query: (sql: string): Effect.Effect<string, never, never> =>
        Effect.sync(() => `db says: ${sql}`)
    })
  }
) {}

// --- Service 2: API Client ---
interface ApiClientOps {
  fetch: (path: string) => Effect.Effect<string, never, never>;
}

class ApiClient extends Effect.Service<ApiClientOps>()(
  "ApiClient",
  {
    sync: () => ({
      fetch: (path: string): Effect.Effect<string, never, never> =>
        Effect.sync(() => `api says: ${path}`)
    })
  }
) {}

// --- Application Layer ---
// We merge the two independent layers into one.
const AppLayer = Layer.merge(Database.Default, ApiClient.Default);

// This program uses both services, unaware of their implementation details.
const program = Effect.gen(function* () {
  const db = yield* Database;
  const api = yield* ApiClient;

  const dbResult = yield* db.query("SELECT *");
  const apiResult = yield* api.fetch("/users");

  yield* Console.log(dbResult);
  yield* Console.log(apiResult);
});

// Provide the combined layer to the program.
Effect.runPromise(Effect.provide(program, AppLayer));

/*
Output (note the LIFO release order):
Database pool opened
API client session started
db says: SELECT *
api says: /users
API client session ended
Database pool closed
*/
```

**Explanation:**
We define two completely independent services, `Database` and `ApiClient`, each with its own resource lifecycle. By combining them with `Layer.merge`, we create a single `AppLayer`. When `program` runs, Effect acquires the resources for both layers. When `program` finishes, Effect closes the application's scope, releasing the resources in the reverse order they were acquired (`ApiClient` then `Database`), ensuring a clean and predictable shutdown.

---

### Comparing Data by Value with Data.struct
**ID:** comparing-data-by-value-with-datastruct
**Use Case:** N/A | **Skill Level:** N/A

description: Use Data.struct to define objects whose equality is based on their contents, enabling safe and predictable comparisons.
globs: "**/*.ts"
alwaysApply: true

# Comparing Data by Value with Data.struct
**Rule:** Use Data.struct to define objects whose equality is based on their contents, enabling safe and predictable comparisons.

### Example
```typescript
import { Data, Equal } from "effect";

// Create two structurally equal objects
const user1 = Data.struct({ id: 1, name: "Alice" });
const user2 = Data.struct({ id: 1, name: "Alice" });

// Compare by value, not reference
const areEqual = Equal.equals(user1, user2); // true

// Use in a HashSet or as keys in a Map
import { HashSet } from "effect";
const set = HashSet.make(user1);
console.log(HashSet.has(set, user2)); // true
```

**Explanation:**  
- `Data.struct` creates immutable objects with value-based equality.
- Use for domain entities, value objects, and when storing objects in sets or as map keys.
- Avoids bugs from reference-based comparison.

**Explanation:**  
JavaScript objects are compared by reference, which can lead to subtle bugs when modeling value objects.  
`Data.struct` ensures that two objects with the same contents are considered equal, supporting value-based logic and collections.


---

### Access Configuration from the Context
**ID:** access-configuration-from-the-context
**Use Case:** N/A | **Skill Level:** N/A

description: Access configuration from the Effect context.
globs: "**/*.ts"
alwaysApply: true

# Access Configuration from the Context
**Rule:** Access configuration from the Effect context.

### Example
```typescript
import { Config, Effect, Layer } from "effect";

// Define config service
class AppConfig extends Effect.Service<AppConfig>()(
  "AppConfig",
  {
    sync: () => ({
      host: "localhost",
      port: 3000
    })
  }
) {}

// Create program that uses config
const program = Effect.gen(function* () {
  const config = yield* AppConfig;
  yield* Effect.log(`Starting server on http://${config.host}:${config.port}`);
});

// Run the program with default config
Effect.runPromise(
  Effect.provide(program, AppConfig.Default)
);
```

**Explanation:**  
By yielding the config object, you make your dependency explicit and leverage Effect's context system for testability and modularity.

**Explanation:**  
This allows your business logic to declaratively state its dependency on a piece of configuration. The logic is clean, type-safe, and completely decoupled from *how* the configuration is provided.


---

### Execute Asynchronous Effects with Effect.runPromise
**ID:** execute-asynchronous-effects-with-effectrunpromise
**Use Case:** N/A | **Skill Level:** N/A

description: Execute asynchronous effects with Effect.runPromise.
globs: "**/*.ts"
alwaysApply: true

# Execute Asynchronous Effects with Effect.runPromise
**Rule:** Execute asynchronous effects with Effect.runPromise.

### Example
```typescript
import { Effect } from "effect";

const program = Effect.succeed("Hello, World!").pipe(
  Effect.delay("1 second"),
);

const promise = Effect.runPromise(program);

const programWithLogging = Effect.gen(function* () {
  const result = yield* program;
  yield* Effect.log(result); // Logs "Hello, World!" after 1 second.
  return result;
});

Effect.runPromise(programWithLogging);
```

**Explanation:**  
`Effect.runPromise` executes your effect and returns a Promise, making it
easy to integrate with existing JavaScript async workflows.

**Explanation:**  
`Effect.runPromise` is the bridge from the Effect world to the Promise-based
world of Node.js and browsers. If the Effect succeeds, the Promise resolves;
if it fails, the Promise rejects.


---

### Create a Basic HTTP Server
**ID:** create-a-basic-http-server
**Use Case:** N/A | **Skill Level:** N/A

description: Use Http.server.serve with a platform-specific layer to run an HTTP application.
globs: "**/*.ts"
alwaysApply: true

# Create a Basic HTTP Server
**Rule:** Use Http.server.serve with a platform-specific layer to run an HTTP application.

### Example
This example creates a minimal server that responds to all requests with "Hello, World!". The application logic is a simple `Effect` that returns an `Http.response`. We use `NodeRuntime.runMain` to execute the server effect, which is the standard way to launch a long-running application.

```typescript
import { Effect, Duration } from "effect";
import * as http from "http";

// Create HTTP server service
class HttpServer extends Effect.Service<HttpServer>()("HttpServer", {
  sync: () => ({
    start: () =>
      Effect.gen(function* () {
        const server = http.createServer(
          (req: http.IncomingMessage, res: http.ServerResponse) => {
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("Hello, World!");
          }
        );

        // Add cleanup finalizer
        yield* Effect.addFinalizer(() =>
          Effect.gen(function* () {
            yield* Effect.sync(() => server.close());
            yield* Effect.logInfo("Server shut down");
          })
        );

        // Start server with timeout
        yield* Effect.async<void, Error>((resume) => {
          server.on("error", (error) => resume(Effect.fail(error)));
          server.listen(3456, "localhost", () => {
            resume(Effect.succeed(void 0));
          });
        }).pipe(
          Effect.timeout(Duration.seconds(5)),
          Effect.catchAll((error) =>
            Effect.gen(function* () {
              yield* Effect.logError(`Failed to start server: ${error}`);
              return yield* Effect.fail(error);
            })
          )
        );

        yield* Effect.logInfo("Server running at http://localhost:3456/");

        // Run for a short duration to demonstrate the server is working
        yield* Effect.sleep(Duration.seconds(3));
        yield* Effect.logInfo("Server demonstration complete");
      }),
  }),
}) {}

// Create program with proper error handling
const program = Effect.gen(function* () {
  const server = yield* HttpServer;

  yield* Effect.logInfo("Starting HTTP server...");

  yield* server.start();
}).pipe(
  Effect.scoped // Ensure server is cleaned up properly
);

// Run the server with proper error handling
const programWithErrorHandling = Effect.provide(program, HttpServer.Default).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logError(`Program failed: ${error}`);
      return yield* Effect.fail(error);
    })
  )
);

Effect.runPromise(programWithErrorHandling).catch(() => {
  process.exit(1);
});

/*
To test:
1. Server will timeout after 5 seconds if it can't start
2. Server runs on port 3456 to avoid conflicts
3. Proper cleanup on shutdown
4. Demonstrates server lifecycle: start -> run -> shutdown
*/

```

**Explanation:**  
In Effect, an HTTP server is not just a side effect; it's a managed, effectful process. The `@effect/platform` package provides a platform-agnostic API for defining HTTP applications, while packages like `@effect/platform-node` provide the concrete implementation.

The core function `Http.server.serve(app)` takes your application logic and returns an `Effect` that, when run, starts the server. This `Effect` is designed to run indefinitely, only terminating if the server crashes or is gracefully shut down.

This approach provides several key benefits:

1.  **Lifecycle Management**: The server's lifecycle is managed by the Effect runtime. This means structured concurrency applies, ensuring graceful shutdowns and proper resource handling automatically.
2.  **Integration**: The server is a first-class citizen in the Effect ecosystem. It can seamlessly access dependencies provided by `Layer`, use `Config` for configuration, and integrate with `Logger`.
3.  **Platform Agnosticism**: By coding to the `Http.App` interface, your application logic remains portable across different JavaScript runtimes (Node.js, Bun, Deno) by simply swapping out the platform layer.

---


---

### Create a Reusable Runtime from Layers
**ID:** create-a-reusable-runtime-from-layers
**Use Case:** N/A | **Skill Level:** N/A

description: Create a reusable runtime from layers.
globs: "**/*.ts"
alwaysApply: true

# Create a Reusable Runtime from Layers
**Rule:** Create a reusable runtime from layers.

### Example
```typescript
import { Effect, Layer, Runtime } from "effect";

class GreeterService extends Effect.Service<GreeterService>()(
  "Greeter",
  {
    sync: () => ({
      greet: (name: string) => Effect.sync(() => `Hello ${name}`)
    })
  }
) {}

const runtime = Effect.runSync(
  Layer.toRuntime(GreeterService.Default).pipe(
    Effect.scoped
  )
);

// In a server, you would reuse `run` for every request.
Runtime.runPromise(runtime)(Effect.log("Hello"));
```

**Explanation:**  
By compiling your layers into a Runtime once, you avoid rebuilding the
dependency graph for every effect execution.

**Explanation:**  
Building the dependency graph from layers has a one-time cost. Creating a
`Runtime` once when your application starts is highly efficient for
long-running applications.


---

### Retry Operations Based on Specific Errors
**ID:** retry-operations-based-on-specific-errors
**Use Case:** N/A | **Skill Level:** N/A

description: Use predicate-based retry policies to retry an operation only for specific, recoverable errors.
globs: "**/*.ts"
alwaysApply: true

# Retry Operations Based on Specific Errors
**Rule:** Use predicate-based retry policies to retry an operation only for specific, recoverable errors.

### Example
This example simulates an API client that can fail with different, specific error types. The retry policy is configured to *only* retry on `ServerBusyError` and give up immediately on `NotFoundError`.

```typescript
import { Data, Effect, Schedule } from "effect";

// Define specific, tagged errors for our API client
class ServerBusyError extends Data.TaggedError("ServerBusyError") {}
class NotFoundError extends Data.TaggedError("NotFoundError") {}

let attemptCount = 0;

// A flaky API call that can fail in different ways
const flakyApiCall = Effect.try({
  try: () => {
    attemptCount++;
    const random = Math.random();

    if (attemptCount <= 2) {
      // First two attempts fail with ServerBusyError (retryable)
      console.log(
        `Attempt ${attemptCount}: API call failed - Server is busy. Retrying...`
      );
      throw new ServerBusyError();
    }

    // Third attempt succeeds
    console.log(`Attempt ${attemptCount}: API call succeeded!`);
    return { data: "success", attempt: attemptCount };
  },
  catch: (e) => e as ServerBusyError | NotFoundError,
});

// A predicate that returns true only for the error we want to retry
const isRetryableError = (e: ServerBusyError | NotFoundError) =>
  e._tag === "ServerBusyError";

// A policy that retries 3 times, but only if the error is retryable
const selectiveRetryPolicy = Schedule.recurs(3).pipe(
  Schedule.whileInput(isRetryableError),
  Schedule.addDelay(() => "100 millis")
);

const program = Effect.gen(function* () {
  yield* Effect.logInfo("=== Retry Based on Specific Errors Demo ===");

  try {
    const result = yield* flakyApiCall.pipe(Effect.retry(selectiveRetryPolicy));
    yield* Effect.logInfo(`Success: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    yield* Effect.logInfo("This won't be reached due to Effect error handling");
    return null;
  }
}).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      if (error instanceof NotFoundError) {
        yield* Effect.logInfo("Failed with NotFoundError - not retrying");
      } else if (error instanceof ServerBusyError) {
        yield* Effect.logInfo("Failed with ServerBusyError after all retries");
      } else {
        yield* Effect.logInfo(`Failed with unexpected error: ${error}`);
      }
      return null;
    })
  )
);

// Also demonstrate a case where NotFoundError is not retried
const demonstrateNotFound = Effect.gen(function* () {
  yield* Effect.logInfo("\n=== Demonstrating Non-Retryable Error ===");

  const alwaysNotFound = Effect.fail(new NotFoundError());

  const result = yield* alwaysNotFound.pipe(
    Effect.retry(selectiveRetryPolicy),
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logInfo(`NotFoundError was not retried: ${error._tag}`);
        return null;
      })
    )
  );

  return result;
});

Effect.runPromise(program.pipe(Effect.flatMap(() => demonstrateNotFound)));

```

---

**Explanation:**  
Not all errors are created equal. Retrying on a permanent error like "permission denied" or "not found" is pointless and can hide underlying issues. You only want to retry on *transient*, recoverable errors, such as network timeouts or "server busy" responses.

By adding a predicate to your retry schedule, you gain fine-grained control over the retry logic. This allows you to build much more intelligent and efficient error handling systems that react appropriately to different failure modes. This is a common requirement for building robust clients for external APIs.

---


---

### Effectful Pattern Matching with matchEffect
**ID:** effectful-pattern-matching-with-matcheffect
**Use Case:** N/A | **Skill Level:** N/A

description: Use matchEffect to pattern match on the result of an Effect, running effectful logic for both success and failure cases.
globs: "**/*.ts"
alwaysApply: true

# Effectful Pattern Matching with matchEffect
**Rule:** Use matchEffect to pattern match on the result of an Effect, running effectful logic for both success and failure cases.

### Example
```typescript
import { Effect } from "effect";

// Effect: Run different Effects on success or failure
const effect = Effect.fail("Oops!").pipe(
  Effect.matchEffect({
    onFailure: (err) => Effect.logError(`Error: ${err}`),
    onSuccess: (value) => Effect.log(`Success: ${value}`),
  })
); // Effect<void>
```

**Explanation:**  
- `matchEffect` allows you to run an Effect for both the success and failure cases.
- This is useful for logging, cleanup, retries, or any effectful side effect that depends on the outcome.

**Explanation:**  
Sometimes, handling a success or failure requires running additional Effects (e.g., logging, retries, cleanup).  
`matchEffect` lets you do this declaratively, keeping your code composable and type-safe.


---

### Use the Auto-Generated .Default Layer in Tests
**ID:** use-the-auto-generated-default-layer-in-tests
**Use Case:** N/A | **Skill Level:** N/A

description: Use the auto-generated .Default layer in tests.
globs: "**/*.ts"
alwaysApply: true

# Use the Auto-Generated .Default Layer in Tests
**Rule:** Use the auto-generated .Default layer in tests.

### Example
```typescript
import { Effect } from "effect";

// Define MyService using Effect.Service pattern
class MyService extends Effect.Service<MyService>()(
  "MyService",
  {
    sync: () => ({
      doSomething: () => 
        Effect.succeed("done").pipe(
          Effect.tap(() => Effect.log("MyService did something!"))
        )
    })
  }
) {}

// Create a program that uses MyService
const program = Effect.gen(function* () {
  yield* Effect.log("Getting MyService...");
  const service = yield* MyService;
  
  yield* Effect.log("Calling doSomething()...");
  const result = yield* service.doSomething();
  
  yield* Effect.log(`Result: ${result}`);
});

// Run the program with default service implementation
Effect.runPromise(
  Effect.provide(program, MyService.Default)
);
```

**Explanation:**  
This approach ensures your tests are idiomatic, maintainable, and take full advantage of Effect's dependency injection system.

**Explanation:**  
The `.Default` layer is the canonical way to provide a service in a test environment. It's automatically created, correctly scoped, and handles resolving any transitive dependencies, making tests cleaner and more robust.


---

### Manage Shared State Safely with Ref
**ID:** manage-shared-state-safely-with-ref
**Use Case:** N/A | **Skill Level:** N/A

description: Use Ref to safely manage shared, mutable state in concurrent and effectful programs.
globs: "**/*.ts"
alwaysApply: true

# Manage Shared State Safely with Ref
**Rule:** Use Ref to safely manage shared, mutable state in concurrent and effectful programs.

### Example
```typescript
import { Effect, Ref } from "effect";

// Create a Ref with an initial value
const makeCounter = Ref.make(0);

// Increment the counter atomically
const increment = makeCounter.pipe(
  Effect.flatMap((counter) =>
    Ref.update(counter, (n) => n + 1)
  )
);

// Read the current value
const getValue = makeCounter.pipe(
  Effect.flatMap((counter) => Ref.get(counter))
);

// Use Ref in a workflow
const program = Effect.gen(function* () {
  const counter = yield* Ref.make(0);
  yield* Ref.update(counter, (n) => n + 1);
  const value = yield* Ref.get(counter);
  yield* Effect.log(`Counter value: ${value}`);
});
```

**Explanation:**  
- `Ref` is an atomic, mutable reference for effectful and concurrent code.
- All operations are safe, composable, and free of race conditions.
- Use `Ref` for counters, caches, or any shared mutable state.

**Explanation:**  
Managing shared state with plain variables or objects is unsafe in concurrent or asynchronous code.  
`Ref` ensures all updates are atomic and free of race conditions, making your code robust and predictable.


---

### Process collections of data asynchronously
**ID:** process-collections-of-data-asynchronously
**Use Case:** N/A | **Skill Level:** N/A

description: Leverage Stream to process collections effectfully with built-in concurrency control and resource safety.
globs: "**/*.ts"
alwaysApply: true

# Process collections of data asynchronously
**Rule:** Leverage Stream to process collections effectfully with built-in concurrency control and resource safety.

### Example
This example processes a list of IDs by fetching user data for each one. `Stream.mapEffect` is used to apply an effectful function (`getUserById`) to each element, with concurrency limited to 2 simultaneous requests.

```typescript
import { Effect, Stream, Chunk } from 'effect';

// A mock function that simulates fetching a user from a database
const getUserById = (id: number): Effect.Effect<{ id: number; name: string }, Error> =>
  Effect.succeed({ id, name: `User ${id}` }).pipe(
    Effect.delay('100 millis'),
    Effect.tap(() => Effect.log(`Fetched user ${id}`))
  );

// The stream-based program
const program = Stream.fromIterable([1, 2, 3, 4, 5]).pipe(
  // Process each item with an Effect, limiting concurrency to 2
  Stream.mapEffect(getUserById, { concurrency: 2 }),
  // Run the stream and collect all results into a Chunk
  Stream.runCollect
);

const programWithLogging = Effect.gen(function* () {
  const users = yield* program;
  yield* Effect.log(`All users fetched: ${JSON.stringify(Chunk.toArray(users))}`);
  return users;
});

Effect.runPromise(programWithLogging);
```

**Explanation:**  
`Stream` is a fundamental data type in Effect for handling collections of data, especially in asynchronous contexts. Unlike a simple array, a `Stream` is lazy and pull-based, meaning it only computes or fetches elements as they are needed, making it highly efficient for large or infinite datasets.

The primary benefits of using `Stream` are:

1.  **Concurrency Control**: `Stream` provides powerful and simple operators like `mapEffect` that have built-in concurrency management. This prevents overwhelming downstream services with too many parallel requests.
2.  **Resource Safety**: `Stream` is built on `Scope`, ensuring that any resources opened during the stream's operation (like file handles or network connections) are safely and reliably closed, even in the case of errors or interruption.
3.  **Composability**: Streams are highly composable. They can be filtered, mapped, transformed, and combined with other Effect data types seamlessly, allowing you to build complex data processing pipelines that remain readable and type-safe.
4.  **Resilience**: `Stream` integrates with `Schedule` to provide sophisticated retry and repeat logic, and with Effect's structured concurrency to ensure that failures in one part of a pipeline lead to a clean and predictable shutdown of the entire process.

---


---

### Validating and Parsing Branded Types
**ID:** validating-and-parsing-branded-types
**Use Case:** N/A | **Skill Level:** N/A

description: Combine Schema and Brand to validate and parse branded types, guaranteeing only valid domain values are created at runtime.
globs: "**/*.ts"
alwaysApply: true

# Validating and Parsing Branded Types
**Rule:** Combine Schema and Brand to validate and parse branded types, guaranteeing only valid domain values are created at runtime.

### Example
```typescript
import { Brand, Effect, Schema } from "effect";

// Define a branded type for Email
type Email = string & Brand.Brand<"Email">;

// Create a Schema for Email validation
const EmailSchema = Schema.String.pipe(
  Schema.pattern(/^[^@]+@[^@]+\.[^@]+$/), // Simple email regex
  Schema.brand("Email" as const) // Attach the brand
);

// Parse and validate an email at runtime
const parseEmail = (input: string) =>
  Effect.try({
    try: () => Schema.decodeSync(EmailSchema)(input),
    catch: (err) => `Invalid email: ${String(err)}`,
  });

// Usage
parseEmail("user@example.com").pipe(
  Effect.match({
    onSuccess: (email) => console.log("Valid email:", email),
    onFailure: (err) => console.error(err),
  })
);

```

**Explanation:**  
- `Schema` is used to define validation logic for the branded type.
- `Brand.schema<Email>()` attaches the brand to the schema, so only validated values can be constructed as `Email`.
- This pattern ensures both compile-time and runtime safety.

**Explanation:**  
While branding types at the type level prevents accidental misuse, runtime validation is needed to ensure only valid values are constructed from user input, APIs, or external sources.


---

### Run Background Tasks with Effect.fork
**ID:** run-background-tasks-with-effectfork
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect.fork to start a non-blocking background process and manage its lifecycle via its Fiber.
globs: "**/*.ts"
alwaysApply: true

# Run Background Tasks with Effect.fork
**Rule:** Use Effect.fork to start a non-blocking background process and manage its lifecycle via its Fiber.

### Example
This program forks a background process that logs a "tick" every second. The main process does its own work for 5 seconds and then explicitly interrupts the background logger before exiting.

```typescript
import { Effect, Fiber } from "effect";

// A long-running effect that logs a message every second, forever
// Effect.forever creates an infinite loop that repeats the effect
// This simulates a background service like a health check or monitoring task
const tickingClock = Effect.log("tick").pipe(
  Effect.delay("1 second"), // Wait 1 second between ticks
  Effect.forever, // Repeat indefinitely - this creates an infinite effect
);

const program = Effect.gen(function* () {
  yield* Effect.log("Forking the ticking clock into the background.");
  
  // Start the clock, but don't wait for it.
  // Effect.fork creates a new fiber that runs concurrently with the main program
  // The main fiber continues immediately without waiting for the background task
  // This is essential for non-blocking background operations
  const clockFiber = yield* Effect.fork(tickingClock);
  
  // At this point, we have two fibers running:
  // 1. The main fiber (this program)
  // 2. The background clock fiber (ticking every second)

  yield* Effect.log("Main process is now doing other work for 5 seconds...");
  
  // Simulate the main application doing work
  // While this sleep happens, the background clock continues ticking
  // This demonstrates true concurrency - both fibers run simultaneously
  yield* Effect.sleep("5 seconds");

  yield* Effect.log("Main process is done. Interrupting the clock fiber.");
  
  // Stop the background process.
  // Fiber.interrupt sends an interruption signal to the fiber
  // This allows the fiber to perform cleanup operations before terminating
  // Without this, the background task would continue running indefinitely
  yield* Fiber.interrupt(clockFiber);
  
  // Important: Always clean up background fibers to prevent resource leaks
  // In a real application, you might want to:
  // 1. Use Fiber.join instead of interrupt to wait for graceful completion
  // 2. Handle interruption signals within the background task
  // 3. Implement proper shutdown procedures

  yield* Effect.log("Program finished.");
  
  // Key concepts demonstrated:
  // 1. Fork creates concurrent fibers without blocking
  // 2. Background tasks run independently of the main program
  // 3. Fiber interruption provides controlled shutdown
  // 4. Multiple fibers can run simultaneously on the same thread pool
});

// This example shows how to:
// - Run background tasks that don't block the main program
// - Manage fiber lifecycles (create, run, interrupt)
// - Coordinate between multiple concurrent operations
// - Properly clean up resources when shutting down
Effect.runPromise(program);
```

---

**Explanation:**  
Unlike `Effect.all` or a direct `yield*`, which wait for the computation to complete, `Effect.fork` is a "fire and forget" operation. It starts the effect on a new, concurrent fiber and immediately returns control to the parent fiber.

This is essential for managing long-running background tasks like:
-   A web server listener.
-   A message queue consumer.
-   A periodic cache cleanup job.

The returned `Fiber` object is your remote control for the background task. You can use `Fiber.interrupt` to safely stop it (ensuring all its finalizers are run) or `Fiber.join` to wait for it to complete at some later point.

---


---

### Transform Effect Values with map and flatMap
**ID:** transform-effect-values-with-map-and-flatmap
**Use Case:** N/A | **Skill Level:** N/A

description: Transform Effect values with map and flatMap.
globs: "**/*.ts"
alwaysApply: true

# Transform Effect Values with map and flatMap
**Rule:** Transform Effect values with map and flatMap.

### Example
```typescript
import { Effect } from "effect";

const getUser = (id: number): Effect.Effect<{ id: number; name: string }> =>
  Effect.succeed({ id, name: "Paul" });

const getPosts = (userId: number): Effect.Effect<{ title: string }[]> =>
  Effect.succeed([{ title: "My First Post" }, { title: "Second Post" }]);

const userPosts = getUser(123).pipe(
  Effect.flatMap((user) => getPosts(user.id))
);

// Demonstrate transforming Effect values
const program = Effect.gen(function* () {
  yield* Effect.log("=== Transform Effect Values Demo ===");

  // 1. Basic transformation with map
  yield* Effect.log("\n1. Transform with map:");
  const userWithUpperName = yield* getUser(123).pipe(
    Effect.map((user) => ({ ...user, name: user.name.toUpperCase() }))
  );
  yield* Effect.log("Transformed user:", userWithUpperName);

  // 2. Chain effects with flatMap
  yield* Effect.log("\n2. Chain effects with flatMap:");
  const posts = yield* userPosts;
  yield* Effect.log("User posts:", posts);

  // 3. Transform and combine multiple effects
  yield* Effect.log("\n3. Transform and combine multiple effects:");
  const userWithPosts = yield* getUser(456).pipe(
    Effect.flatMap((user) =>
      getPosts(user.id).pipe(
        Effect.map((posts) => ({
          user: user.name,
          postCount: posts.length,
          titles: posts.map((p) => p.title),
        }))
      )
    )
  );
  yield* Effect.log("User with posts:", userWithPosts);

  // 4. Transform with tap for side effects
  yield* Effect.log("\n4. Transform with tap for side effects:");
  const result = yield* getUser(789).pipe(
    Effect.tap((user) => Effect.log(`Processing user: ${user.name}`)),
    Effect.map((user) => `Hello, ${user.name}!`)
  );
  yield* Effect.log("Final result:", result);

  yield* Effect.log("\n✅ All transformations completed successfully!");
});

Effect.runPromise(program);

```

**Explanation:**  
Use `flatMap` to chain effects that depend on each other, and `map` for
simple value transformations.

**Explanation:**  
`Effect.map` is like `Array.prototype.map`. `Effect.flatMap` is like
`Promise.prototype.then` and is used when your transformation function itself
returns an `Effect`.


---

### Process a Large File with Constant Memory
**ID:** process-a-large-file-with-constant-memory
**Use Case:** N/A | **Skill Level:** N/A

description: Use Stream.fromReadable with a Node.js Readable stream to process files efficiently.
globs: "**/*.ts"
alwaysApply: true

# Process a Large File with Constant Memory
**Rule:** Use Stream.fromReadable with a Node.js Readable stream to process files efficiently.

### Example
This example demonstrates reading a text file, splitting it into individual lines, and processing each line. The combination of `Stream.fromReadable`, `Stream.decodeText`, and `Stream.splitLines` is a powerful and common pattern for handling text-based files.

```typescript
import { FileSystem } from '@effect/platform';
import { NodeFileSystem } from '@effect/platform-node';
import type { PlatformError } from '@effect/platform/Error';
import { Effect, Stream } from 'effect';
import * as path from 'node:path';

const processFile = (
  filePath: string,
  content: string
): Effect.Effect<void, PlatformError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    // Write content to file
    yield* fs.writeFileString(filePath, content);

    // Create a STREAMING pipeline - reads file in chunks, not all at once
    const fileStream = fs.readFile(filePath)
      .pipe(
        // Decode bytes to text
        Stream.decodeText('utf-8'),
        // Split into lines
        Stream.splitLines,
        // Process each line
        Stream.tap((line) => Effect.log(`Processing: ${line}`))
      );

    // Run the stream to completion
    yield* Stream.runDrain(fileStream);

    // Clean up file
    yield* fs.remove(filePath);
  });

const program = Effect.gen(function* () {
  const filePath = path.join(__dirname, 'large-file.txt');

  yield* processFile(
    filePath,
    'line 1\nline 2\nline 3'
  ).pipe(
    Effect.catchAll((error: PlatformError) =>
      Effect.logError(`Error processing file: ${error.message}`)
    )
  );
});

Effect.runPromise(
  program.pipe(
    Effect.provide(NodeFileSystem.layer)
  ))

  /*
Output:
... level=INFO msg="Processing: line 1"
... level=INFO msg="Processing: line 2"
... level=INFO msg="Processing: line 3"
*/
```

**Explanation:**  
The most significant advantage of a streaming architecture is its ability to handle datasets far larger than available RAM. When you need to process a multi-gigabyte log file or CSV, loading it all into memory is not an option—it will crash your application.

The `Stream.fromReadable` constructor provides a bridge from Node.js's built-in file streaming capabilities to the Effect ecosystem. This approach is superior because:

1.  **Constant Memory Usage**: The file is read in small, manageable chunks. Your application's memory usage remains low and constant, regardless of whether the file is 1 megabyte or 100 gigabytes.
2.  **Composability**: Once the file is represented as an Effect `Stream`, you can apply the full suite of powerful operators to it: `mapEffect` for concurrent processing, `filter` for selectively choosing lines, `grouped` for batching, and `retry` for resilience.
3.  **Resource Safety**: Effect's `Stream` is built on `Scope`, which guarantees that the underlying file handle will be closed automatically when the stream finishes, fails, or is interrupted. This prevents resource leaks, a common problem in manual file handling.

---


---

### Checking Option and Either Cases
**ID:** checking-option-and-either-cases
**Use Case:** N/A | **Skill Level:** N/A

description: Use isSome, isNone, isLeft, and isRight to check Option and Either cases for simple, type-safe conditional logic.
globs: "**/*.ts"
alwaysApply: true

# Checking Option and Either Cases
**Rule:** Use isSome, isNone, isLeft, and isRight to check Option and Either cases for simple, type-safe conditional logic.

### Example
```typescript
import { Option, Either } from "effect";

// Option: Check if value is Some or None
const option = Option.some(42);

if (Option.isSome(option)) {
  // option.value is available here
  console.log("We have a value:", option.value);
} else if (Option.isNone(option)) {
  console.log("No value present");
}

// Either: Check if value is Right or Left
const either = Either.left("error");

if (Either.isRight(either)) {
  // either.right is available here
  console.log("Success:", either.right);
} else if (Either.isLeft(either)) {
  // either.left is available here
  console.log("Failure:", either.left);
}

// Filtering a collection of Options
const options = [Option.some(1), Option.none(), Option.some(3)];
const presentValues = options.filter(Option.isSome).map((o) => o.value); // [1, 3]
```

**Explanation:**  
- `Option.isSome` and `Option.isNone` let you check for presence or absence.
- `Either.isRight` and `Either.isLeft` let you check for success or failure.
- These are especially useful for filtering or quick conditional logic.

**Explanation:**  
These predicates provide a concise, type-safe way to check which case you have, without resorting to manual property checks or unsafe type assertions.


---

### Teach your AI Agents Effect with the MCP Server
**ID:** teach-your-ai-agents-effect-with-the-mcp-server
**Use Case:** N/A | **Skill Level:** N/A

description: Use the MCP server to provide live application context to AI coding agents, enabling more accurate assistance.
globs: "**/*.ts"
alwaysApply: true

# Teach your AI Agents Effect with the MCP Server
**Rule:** Use the MCP server to provide live application context to AI coding agents, enabling more accurate assistance.

### Example
The "Good Example" is the workflow this pattern enables.

1.  **You run the MCP server** in your terminal, pointing it at your main `AppLayer`.
    ```bash
    npx @effect/mcp-server --layer src/layers.ts:AppLayer
    ```

2.  **You configure your AI agent** (e.g., Cursor) to use the MCP server's endpoint (`http://localhost:3333`).

3.  **You ask the AI a question** that requires deep context about your app:
    > "Refactor this code to use the `UserService` to fetch a user by ID and log the result with the `Logger`."

4.  **The AI, in the background, queries the MCP server:**
    -   It discovers that `UserService` and `Logger` are available in the `AppLayer`.
    -   It retrieves the exact method signature for `UserService.getUser` and `Logger.log`.

5.  **The AI generates correct, context-aware code** because it's not guessing; it's using the live architectural information provided by the MCP server.

```typescript
// The AI generates this correct code:
import { Effect } from "effect";
import { UserService } from "./features/User/UserService.js";
const program = Effect.gen(function* () {
  const userService = yield* UserService;

  const user = yield* userService.getUser("123");
  yield* Effect.log(`Found user: ${user.name}`);
});

```

---

**Explanation:**  
AI coding agents are powerful, but they often lack the deep, structural understanding of a complex Effect application. They might not know which services are available in the context, what a specific `Layer` provides, or how your feature modules are composed.

The MCP server solves this problem. It's a specialized server that runs alongside your application during development. It inspects your `AppLayer` and creates a real-time, queryable model of your entire application architecture.

An AI agent can then connect to this MCP server to ask specific questions before generating code, such as:
-   "What services are available in the current context?"
-   "What is the full API of the `UserService`?"
-   "What errors can `UserRepository.findById` fail with?"

By providing this live, ground-truth context, you transform your AI from a generic coding assistant into a specialized expert on *your* specific codebase, resulting in far more accurate and useful code generation and refactoring.

---


---

### Model Optional Values Safely with Option
**ID:** model-optional-values-safely-with-option
**Use Case:** N/A | **Skill Level:** N/A

description: Use Option<A> to explicitly model values that may be absent, avoiding null or undefined.
globs: "**/*.ts"
alwaysApply: true

# Model Optional Values Safely with Option
**Rule:** Use Option<A> to explicitly model values that may be absent, avoiding null or undefined.

### Example
A function that looks for a user in a database is a classic use case. It might find a user, or it might not. Returning an `Option<User>` makes this contract explicit and safe.

```typescript
import { Effect, Option } from "effect";

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: "Paul" },
  { id: 2, name: "Alex" },
];

// This function safely returns an Option, not a User or null.
const findUserById = (id: number): Option.Option<User> => {
  const user = users.find((u) => u.id === id);
  return Option.fromNullable(user); // A useful helper for existing APIs
};

// The caller MUST handle both cases.
const greeting = (id: number): string =>
  findUserById(id).pipe(
    Option.match({
      onNone: () => "User not found.",
      onSome: (user) => `Welcome, ${user.name}!`,
    }),
  );

const program = Effect.gen(function* () {
  yield* Effect.log(greeting(1)); // "Welcome, Paul!"
  yield* Effect.log(greeting(3)); // "User not found."
});

Effect.runPromise(program);
```

**Explanation:**  
Functions that can return a value or `null`/`undefined` are a primary source of runtime errors in TypeScript (`Cannot read properties of null`).

The `Option` type solves this by making the possibility of an absent value explicit in the type system. A function that returns `Option<User>` cannot be mistaken for a function that returns `User`. The compiler forces you to handle the `None` case before you can access the value inside a `Some`, eliminating an entire class of bugs.

---


---

### Lifting Errors and Absence with fail, none, and left
**ID:** lifting-errors-and-absence-with-fail-none-and-left
**Use Case:** N/A | **Skill Level:** N/A

description: Use fail, none, and left to create Effect, Option, or Either that represent failure or absence.
globs: "**/*.ts"
alwaysApply: true

# Lifting Errors and Absence with fail, none, and left
**Rule:** Use fail, none, and left to create Effect, Option, or Either that represent failure or absence.

### Example
```typescript
import { Effect, Option, Either } from "effect";

// Effect: Represent a failure with an error value
const effect = Effect.fail("Something went wrong"); // Effect<string, never, never>

// Option: Represent absence of a value
const option = Option.none(); // Option<never>

// Either: Represent a failure with a left value
const either = Either.left("Invalid input"); // Either<string, never>
```

**Explanation:**  
- `Effect.fail(error)` creates an effect that always fails with `error`.
- `Option.none()` creates an option that is always absent.
- `Either.left(error)` creates an either that always represents failure.

**Explanation:**  
By lifting errors and absence into these structures, you can handle them declaratively with combinators, rather than relying on exceptions, `null`, or `undefined`.  
This leads to more robust and maintainable code.


---

### Provide Dependencies to Routes
**ID:** provide-dependencies-to-routes
**Use Case:** N/A | **Skill Level:** N/A

description: Define dependencies with Effect.Service and provide them to your HTTP server using a Layer.
globs: "**/*.ts"
alwaysApply: true

# Provide Dependencies to Routes
**Rule:** Define dependencies with Effect.Service and provide them to your HTTP server using a Layer.

### Example
This example defines a `Database` service. The route handler for `/users/:userId` requires this service to fetch a user. We then provide a "live" implementation of the `Database` to the entire server using a `Layer`.

```typescript
import * as HttpRouter from "@effect/platform/HttpRouter";
import * as HttpResponse from "@effect/platform/HttpServerResponse";
import * as HttpServer from "@effect/platform/HttpServer";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Effect, Duration, Fiber } from "effect/index";
import { Data } from "effect";

// 1. Define the service interface using Effect.Service
export class Database extends Effect.Service<Database>()("Database", {
  sync: () => ({
    getUser: (id: string) =>
      id === "123"
        ? Effect.succeed({ name: "Paul" })
        : Effect.fail(new UserNotFoundError({ id })),
  }),
}) {}

class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
  id: string;
}> {}

// handler producing a `HttpServerResponse`
const userHandler = Effect.flatMap(HttpRouter.params, (p) =>
  Effect.flatMap(Database, (db) => db.getUser(p["userId"] ?? "")).pipe(
    Effect.flatMap(HttpResponse.json)
  )
);

// assemble router & server
const app = HttpRouter.empty.pipe(
  HttpRouter.get("/users/:userId", userHandler)
);

// Create the server effect with all dependencies
const serverEffect = HttpServer.serveEffect(app).pipe(
  Effect.provide(Database.Default),
  Effect.provide(
    NodeHttpServer.layer(
      () => require("node:http").createServer(),
      { port: 3458 }
    )
  )
);

// Create program that manages server lifecycle
const program = Effect.gen(function* () {
  yield* Effect.logInfo("Starting server on port 3458...");

  const serverFiber = yield* Effect.scoped(serverEffect).pipe(Effect.fork);

  yield* Effect.logInfo("Server started successfully on http://localhost:3458");
  yield* Effect.logInfo("Try: curl http://localhost:3458/users/123");
  yield* Effect.logInfo("Try: curl http://localhost:3458/users/456");

  // Run for a short time to demonstrate
  yield* Effect.sleep(Duration.seconds(3));

  yield* Effect.logInfo("Shutting down server...");
  yield* Fiber.interrupt(serverFiber);
  yield* Effect.logInfo("Server shutdown complete");
});

// Run the program
NodeRuntime.runMain(program);

```

**Explanation:**  
As applications grow, route handlers need to perform complex tasks like accessing a database, calling other APIs, or logging. Hard-coding this logic or manually passing dependencies leads to tightly coupled, untestable code.

Effect's dependency injection system (`Service` and `Layer`) solves this by decoupling a service's interface from its implementation. This is the cornerstone of building scalable, maintainable applications in Effect.

1.  **Modern and Simple**: `Effect.Service` is the modern, idiomatic way to define services. It combines the service's definition and its access tag into a single, clean class structure, reducing boilerplate.
2.  **Testability**: By depending on a service interface, you can easily provide a mock implementation in your tests (e.g., `Database.Test`) instead of the real one (`Database.Live`), allowing for fast, isolated unit tests of your route logic.
3.  **Decoupling**: Route handlers don't know or care *how* the database connection is created or managed. They simply ask for the `Database` service from the context, and the runtime provides the configured implementation.
4.  **Composability**: `Layer`s are composable. You can build complex dependency graphs (e.g., a `Database` layer that itself requires a `Config` layer) that Effect will automatically construct and wire up for you.

---


---

### Work with Immutable Sets using HashSet
**ID:** work-with-immutable-sets-using-hashset
**Use Case:** N/A | **Skill Level:** N/A

description: Use HashSet to represent sets of unique values with efficient, immutable operations for membership, union, intersection, and difference.
globs: "**/*.ts"
alwaysApply: true

# Work with Immutable Sets using HashSet
**Rule:** Use HashSet to represent sets of unique values with efficient, immutable operations for membership, union, intersection, and difference.

### Example
```typescript
import { HashSet } from "effect";

// Create a HashSet from an array
const setA = HashSet.fromIterable([1, 2, 3]);
const setB = HashSet.fromIterable([3, 4, 5]);

// Membership check
const hasTwo = HashSet.has(setA, 2); // true

// Union, intersection, difference
const union = HashSet.union(setA, setB);         // HashSet {1, 2, 3, 4, 5}
const intersection = HashSet.intersection(setA, setB); // HashSet {3}
const difference = HashSet.difference(setA, setB);     // HashSet {1, 2}

// Add and remove elements
const withSix = HashSet.add(setA, 6);    // HashSet {1, 2, 3, 6}
const withoutOne = HashSet.remove(setA, 1); // HashSet {2, 3}
```

**Explanation:**  
- `HashSet` is immutable and supports efficient set operations.
- Use it for membership checks, set algebra, and modeling unique collections.
- Safe for concurrent and functional workflows.

**Explanation:**  
`HashSet` provides high-performance, immutable set operations that are safe for concurrent and functional programming.  
It avoids the pitfalls of mutable JavaScript `Set` and is optimized for use in Effect workflows.


---

### Manually Manage Lifecycles with `Scope`
**ID:** manually-manage-lifecycles-with-scope
**Use Case:** N/A | **Skill Level:** N/A

description: Use `Effect.scope` and `Scope.addFinalizer` for fine-grained control over resource cleanup.
globs: "**/*.ts"
alwaysApply: true

# Manually Manage Lifecycles with `Scope`
**Rule:** Use `Effect.scope` and `Scope.addFinalizer` for fine-grained control over resource cleanup.

### Example
```typescript
import { Effect, Console } from "effect";

// Mocking a complex file operation
const openFile = (path: string) =>
  Effect.succeed({ path, handle: Math.random() }).pipe(
    Effect.tap((f) => Effect.log(`Opened ${f.path}`)),
  );
const createTempFile = (path: string) =>
  Effect.succeed({ path: `${path}.tmp`, handle: Math.random() }).pipe(
    Effect.tap((f) => Effect.log(`Created temp file ${f.path}`)),
  );
const closeFile = (file: { path: string }) =>
  Effect.sync(() => Effect.log(`Closed ${file.path}`));
const deleteFile = (file: { path: string }) =>
  Effect.sync(() => Effect.log(`Deleted ${file.path}`));

// This program acquires two resources (a file and a temp file)
// and ensures both are cleaned up correctly using acquireRelease.
const program = Effect.gen(function* () {
  const file = yield* Effect.acquireRelease(
    openFile("data.csv"),
    (f) => closeFile(f)
  );

  const tempFile = yield* Effect.acquireRelease(
    createTempFile("data.csv"),
    (f) => deleteFile(f)
  );

  yield* Effect.log("...writing data from temp file to main file...");
});

// Run the program with a scope
Effect.runPromise(Effect.scoped(program));

/*
Output (note the LIFO cleanup order):
Opened data.csv
Created temp file data.csv.tmp
...writing data from temp file to main file...
Deleted data.csv.tmp
Closed data.csv
*/
```

**Explanation:**
`Effect.scope` creates a new `Scope` and provides it to the `program`. Inside `program`, we access this `Scope` and use `addFinalizer` to register cleanup actions immediately after acquiring each resource. When `Effect.scope` finishes executing `program`, it closes the scope, which in turn executes all registered finalizers in the reverse order of their addition.

**Explanation:**  
While `Effect.acquireRelease` and `Layer.scoped` are sufficient for most use cases, sometimes you need more control. This pattern is essential when:
1.  A single logical operation acquires multiple resources that need independent cleanup.
2.  You are building a custom, complex `Layer` that orchestrates several dependent resources.
3.  You need to understand the fundamental mechanism that powers all of Effect's resource management.

By interacting with `Scope` directly, you gain precise, imperative-style control over resource cleanup within Effect's declarative, functional framework. Finalizers added to a scope are guaranteed to run in Last-In-First-Out (LIFO) order when the scope is closed.


---

### Poll for Status Until a Task Completes
**ID:** poll-for-status-until-a-task-completes
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect.race to run a repeating polling task that is automatically interrupted when a main task completes.
globs: "**/*.ts"
alwaysApply: true

# Poll for Status Until a Task Completes
**Rule:** Use Effect.race to run a repeating polling task that is automatically interrupted when a main task completes.

### Example
This program simulates a long-running data processing job. While it's running, a separate effect polls for its status every 2 seconds. When the main job finishes after 10 seconds, the polling automatically stops.

```typescript
import { Effect, Schedule, Duration } from "effect";

// The main task that takes a long time to complete
const longRunningJob = Effect.log("Data processing complete!").pipe(
  Effect.delay(Duration.seconds(10)),
);

// The polling task that checks the status
const pollStatus = Effect.log("Polling for job status: In Progress...");

// A schedule that repeats the polling task every 2 seconds, forever
const pollingSchedule = Schedule.fixed(Duration.seconds(2));

// The complete polling effect that will run indefinitely until interrupted
const repeatingPoller = pollStatus.pipe(Effect.repeat(pollingSchedule));

// Race the main job against the poller.
// The longRunningJob will win after 10 seconds, interrupting the poller.
const program = Effect.race(longRunningJob, repeatingPoller);

Effect.runPromise(program);
/*
Output:
Polling for job status: In Progress...
Polling for job status: In Progress...
Polling for job status: In Progress...
Polling for job status: In Progress...
Polling for job status: In Progress...
Data processing complete!
*/
```

---

**Explanation:**  
This pattern elegantly solves the problem of coordinating a long-running job with a status-checking mechanism. Instead of manually managing fibers with `fork` and `interrupt`, you can declare this relationship with `Effect.race`.

The key is that the polling effect is set up to repeat on a schedule that runs indefinitely (or for a very long time). Because it never completes on its own, it can never "win" the race. The main task is the only one that can complete successfully. When it does, it wins the race, and Effect's structured concurrency guarantees that the losing effect (the poller) is safely interrupted.

This creates a self-contained, declarative, and leak-free unit of work.

---


---

### Trace Operations Across Services with Spans
**ID:** trace-operations-across-services-with-spans
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect.withSpan to create custom tracing spans for important operations.
globs: "**/*.ts"
alwaysApply: true

# Trace Operations Across Services with Spans
**Rule:** Use Effect.withSpan to create custom tracing spans for important operations.

### Example
This example shows a multi-step operation. Each step, and the overall operation, is wrapped in a span. This creates a parent-child hierarchy in the trace that is easy to visualize.

```typescript
import { Effect, Duration } from "effect";

const validateInput = (input: unknown) =>
  Effect.gen(function* () {
    yield* Effect.logInfo("Starting input validation...");
    yield* Effect.sleep(Duration.millis(10));
    const result = { email: "paul@example.com" };
    yield* Effect.logInfo(`✅ Input validated: ${result.email}`);
    return result;
  }).pipe(
    // This creates a child span
    Effect.withSpan("validateInput")
  );

const saveToDatabase = (user: { email: string }) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Saving user to database: ${user.email}`);
    yield* Effect.sleep(Duration.millis(50));
    const result = { id: 123, ...user };
    yield* Effect.logInfo(`✅ User saved with ID: ${result.id}`);
    return result;
  }).pipe(
    // This span includes useful attributes
    Effect.withSpan("saveToDatabase", {
      attributes: { "db.system": "postgresql", "db.user.email": user.email },
    })
  );

const createUser = (input: unknown) =>
  Effect.gen(function* () {
    yield* Effect.logInfo("=== Creating User with Tracing ===");
    yield* Effect.logInfo(
      "This demonstrates how spans trace operations through the call stack"
    );

    const validated = yield* validateInput(input);
    const user = yield* saveToDatabase(validated);

    yield* Effect.logInfo(
      `✅ User creation completed: ${JSON.stringify(user)}`
    );
    yield* Effect.logInfo(
      "Note: In production, spans would be sent to a tracing system like Jaeger or Zipkin"
    );

    return user;
  }).pipe(
    // This is the parent span for the entire operation
    Effect.withSpan("createUserOperation")
  );

// Demonstrate the tracing functionality
const program = Effect.gen(function* () {
  yield* Effect.logInfo("=== Trace Operations with Spans Demo ===");

  // Create multiple users to show tracing in action
  const user1 = yield* createUser({ email: "user1@example.com" });

  yield* Effect.logInfo("\n--- Creating second user ---");
  const user2 = yield* createUser({ email: "user2@example.com" });

  yield* Effect.logInfo("\n=== Summary ===");
  yield* Effect.logInfo("Created users with tracing spans:");
  yield* Effect.logInfo(`User 1: ID ${user1.id}, Email: ${user1.email}`);
  yield* Effect.logInfo(`User 2: ID ${user2.id}, Email: ${user2.email}`);
});

// When run with a tracing SDK, this will produce traces with root spans
// "createUserOperation" and child spans: "validateInput" and "saveToDatabase".
Effect.runPromise(program);

```

---

**Explanation:**  
While logs tell you *what* happened, traces tell you *why it was slow*. In a complex application, a single user request might trigger calls to multiple services (authentication, database, external APIs). Tracing allows you to visualize this entire chain of events as a single, hierarchical "trace."

Each piece of work in that trace is a `span`. `Effect.withSpan` allows you to create your own custom spans. This is invaluable for answering questions like:
-   "For this API request, did we spend most of our time in the database or calling the external payment gateway?"
-   "Which part of our user creation logic is the bottleneck?"

Effect's tracing is built on OpenTelemetry, the industry standard, so it integrates seamlessly with tools like Jaeger, Zipkin, and Datadog.

---


---

### Filtering Results with filter
**ID:** filtering-results-with-filter
**Use Case:** N/A | **Skill Level:** N/A

description: Use filter to declaratively express conditional logic, keeping only values that satisfy a predicate.
globs: "**/*.ts"
alwaysApply: true

# Filtering Results with filter
**Rule:** Use filter to declaratively express conditional logic, keeping only values that satisfy a predicate.

### Example
```typescript
import { Effect, Stream, Option, Either } from "effect";

// Effect: Only succeed if the value is even, fail otherwise
const effect = Effect.succeed(4).pipe(
  Effect.filterOrFail(
    (n): n is number => n % 2 === 0,
    () => "Number is not even"
  )
); // Effect<number, string>

// Option: Only keep the value if it is even
const option = Option.some(4).pipe(
  Option.filter((n): n is number => n % 2 === 0)
); // Option<number>

// Either: Use map and flatMap to filter
const either = Either.right(4).pipe(
  Either.flatMap((n) => 
    n % 2 === 0
      ? Either.right(n)
      : Either.left("Number is not even")
  )
); // Either<string, number>

// Stream: Only emit even numbers
const stream = Stream.fromIterable([1, 2, 3, 4]).pipe(
  Stream.filter((n): n is number => n % 2 === 0)
); // Stream<number>
```

**Explanation:**  
`filter` applies a predicate to the value(s) inside the structure. If the predicate fails, the result is a failure (`Effect.fail`, `Either.left`), `Option.none`, or an empty stream.

**Explanation:**  
`filter` lets you express "only continue if..." logic without resorting to manual checks or imperative branching.  
It keeps your code composable and type-safe, and ensures that failures or empty results are handled consistently.


---

### Safely Bracket Resource Usage with `acquireRelease`
**ID:** safely-bracket-resource-usage-with-acquirerelease
**Use Case:** N/A | **Skill Level:** N/A

description: Bracket the use of a resource between an `acquire` and a `release` effect.
globs: "**/*.ts"
alwaysApply: true

# Safely Bracket Resource Usage with `acquireRelease`
**Rule:** Bracket the use of a resource between an `acquire` and a `release` effect.

### Example
```typescript
import { Effect, Console } from "effect";

// A mock resource that needs to be managed
const getDbConnection = Effect.sync(() => ({ id: Math.random() })).pipe(
  Effect.tap(() => Effect.log("Connection Acquired")),
);

const closeDbConnection = (conn: { id: number }): Effect.Effect<void, never, never> =>
  Effect.log(`Connection ${conn.id} Released`);

// The program that uses the resource
const program = Effect.acquireRelease(
  getDbConnection, // 1. acquire
  (connection) => closeDbConnection(connection) // 2. cleanup
).pipe(
  Effect.tap((connection) =>
    Effect.log(`Using connection ${connection.id} to run query...`)
  )
);

Effect.runPromise(Effect.scoped(program));

/*
Output:
Connection Acquired
Using connection 0.12345... to run query...
Connection 0.12345... Released
*/
```

**Explanation:**
By using `Effect.acquireRelease`, the `closeDbConnection` logic is guaranteed to run after the main logic completes. This creates a self-contained, leak-proof unit of work that can be safely composed into larger programs.

**Explanation:**  
This pattern is the foundation of resource safety in Effect. It provides a composable and interruption-safe alternative to a standard `try...finally` block. The `release` effect is guaranteed to execute, preventing resource leaks which are common in complex asynchronous applications, especially those involving concurrency where tasks can be cancelled.


---

### Transform Data During Validation with Schema
**ID:** transform-data-during-validation-with-schema
**Use Case:** N/A | **Skill Level:** N/A

description: Use Schema.transform to safely convert data types during the validation and parsing process.
globs: "**/*.ts"
alwaysApply: true

# Transform Data During Validation with Schema
**Rule:** Use Schema.transform to safely convert data types during the validation and parsing process.

### Example
This schema parses a string but produces a `Date` object, making the final data structure much more useful.

```typescript
import { Schema, Effect } from "effect";

// Define types for better type safety
type RawEvent = {
  name: string;
  timestamp: string;
};

type ParsedEvent = {
  name: string;
  timestamp: Date;
};

// Define the schema for our event
const ApiEventSchema = Schema.Struct({
  name: Schema.String,
  timestamp: Schema.String
});

// Example input
const rawInput: RawEvent = {
  name: "User Login",
  timestamp: "2025-06-22T20:08:42.000Z"
};

// Parse and transform
const program = Effect.gen(function* () {
  const parsed = yield* Schema.decode(ApiEventSchema)(rawInput);
  return {
    name: parsed.name,
    timestamp: new Date(parsed.timestamp)
  } as ParsedEvent;
});

const programWithLogging = Effect.gen(function* () {
  try {
    const event = yield* program;
    yield* Effect.log(`Event year: ${event.timestamp.getFullYear()}`);
    yield* Effect.log(`Full event: ${JSON.stringify(event, null, 2)}`);
    return event;
  } catch (error) {
    yield* Effect.logError(`Failed to parse event: ${error}`);
    throw error;
  }
}).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logError(`Program error: ${error}`);
      return null;
    })
  )
);

Effect.runPromise(programWithLogging);
```


`transformOrFail` is perfect for creating branded types, as the validation can fail.

```typescript
import { Schema, Effect, Brand, Either } from "effect";

type Email = string & Brand.Brand<"Email">;
const Email = Schema.string.pipe(
  Schema.transformOrFail(
    Schema.brand<Email>("Email"),
    (s, _, ast) =>
      s.includes("@")
        ? Either.right(s as Email)
        : Either.left(Schema.ParseError.create(ast, "Invalid email format")),
    (email) => Either.right(email),
  ),
);

const result = Schema.decode(Email)("paul@example.com"); // Succeeds
const errorResult = Schema.decode(Email)("invalid-email"); // Fails
```

---

**Explanation:**  
Often, the data you receive from external sources (like an API) isn't in the ideal format for your application's domain model. For example, dates are sent as ISO strings, but you want to work with `Date` objects.

`Schema.transform` integrates this conversion directly into the parsing step. It takes two functions: one to `decode` the input type into the domain type, and one to `encode` it back. This makes your schema the single source of truth for both the shape and the type transformation of your data.

For transformations that can fail (like creating a branded type), you can use `Schema.transformOrFail`, which allows the decoding step to return an `Either`.

---


---

### Handling Specific Errors with catchTag and catchTags
**ID:** handling-specific-errors-with-catchtag-and-catchtags
**Use Case:** N/A | **Skill Level:** N/A

description: Use catchTag and catchTags to handle specific tagged error types in the Effect failure channel, providing targeted recovery logic.
globs: "**/*.ts"
alwaysApply: true

# Handling Specific Errors with catchTag and catchTags
**Rule:** Use catchTag and catchTags to handle specific tagged error types in the Effect failure channel, providing targeted recovery logic.

### Example
```typescript
import { Effect, Data } from "effect";

// Define tagged error types
class NotFoundError extends Data.TaggedError("NotFoundError")<{}> {}
class ValidationError extends Data.TaggedError("ValidationError")<{ message: string }> {}

type MyError = NotFoundError | ValidationError;

// Effect: Handle only ValidationError, let others propagate
const effect = Effect.fail(new ValidationError({ message: "Invalid input" }) as MyError).pipe(
  Effect.catchTag("ValidationError", (err) =>
    Effect.succeed(`Recovered from validation error: ${err.message}`)
  )
); // Effect<string>

// Effect: Handle multiple error tags
const effect2 = Effect.fail(new NotFoundError() as MyError).pipe(
  Effect.catchTags({
    NotFoundError: () => Effect.succeed("Handled not found!"),
    ValidationError: (err) => Effect.succeed(`Handled validation: ${err.message}`),
  })
); // Effect<string>
```

**Explanation:**  
- `catchTag` lets you recover from a specific tagged error type.
- `catchTags` lets you handle multiple tagged error types in one place.
- Unhandled errors continue to propagate, preserving error safety.

**Explanation:**  
Not all errors should be handled the same way.  
By matching on specific error tags, you can provide targeted recovery logic for each error type, while letting unhandled errors propagate as needed.


---

### Control Flow with Conditional Combinators
**ID:** control-flow-with-conditional-combinators
**Use Case:** N/A | **Skill Level:** N/A

description: Use conditional combinators for control flow.
globs: "**/*.ts"
alwaysApply: true

# Control Flow with Conditional Combinators
**Rule:** Use conditional combinators for control flow.

### Example
```typescript
import { Effect } from "effect"

const attemptAdminAction = (user: { isAdmin: boolean }) =>
  Effect.if(user.isAdmin, {
    onTrue: () => Effect.succeed("Admin action completed."),
    onFalse: () => Effect.fail("Permission denied.")
  })

const program = Effect.gen(function* () {
  // Try with admin user
  yield* Effect.logInfo("\nTrying with admin user...")
  const adminResult = yield* Effect.either(attemptAdminAction({ isAdmin: true }))
  yield* Effect.logInfo(`Admin result: ${adminResult._tag === 'Right' ? adminResult.right : adminResult.left}`)

  // Try with non-admin user
  yield* Effect.logInfo("\nTrying with non-admin user...")
  const userResult = yield* Effect.either(attemptAdminAction({ isAdmin: false }))
  yield* Effect.logInfo(`User result: ${userResult._tag === 'Right' ? userResult.right : userResult.left}`)
})

Effect.runPromise(program)
```

**Explanation:**  
`Effect.if` and related combinators allow you to branch logic without leaving
the Effect world or breaking the flow of composition.

**Explanation:**  
These combinators allow you to embed conditional logic directly into your
`.pipe()` compositions, maintaining a declarative style for simple branching.


---

### Conditionally Branching Workflows
**ID:** conditionally-branching-workflows
**Use Case:** N/A | **Skill Level:** N/A

description: Use predicate-based operators like Effect.filter and Effect.if to declaratively control workflow branching.
globs: "**/*.ts"
alwaysApply: true

# Conditionally Branching Workflows
**Rule:** Use predicate-based operators like Effect.filter and Effect.if to declaratively control workflow branching.

### Example
Here, we use `Effect.filterOrFail` with named predicates to validate a user before proceeding. The intent is crystal clear, and the business rules (`isActive`, `isAdmin`) are reusable.

```typescript
import { Effect } from "effect";

interface User {
  id: number;
  status: "active" | "inactive";
  roles: string[];
}

type UserError = "DbError" | "UserIsInactive" | "UserIsNotAdmin";

const findUser = (id: number): Effect.Effect<User, "DbError"> =>
  Effect.succeed({ id, status: "active", roles: ["admin"] });

// Reusable, testable predicates that document business rules.
const isActive = (user: User): boolean =>
  user.status === "active";

const isAdmin = (user: User): boolean =>
  user.roles.includes("admin");

const program = (id: number): Effect.Effect<string, UserError> =>
  findUser(id).pipe(
    // Validate user is active using Effect.filterOrFail
    Effect.filterOrFail(
      isActive,
      () => "UserIsInactive" as const
    ),
    // Validate user is admin using Effect.filterOrFail
    Effect.filterOrFail(
      isAdmin,
      () => "UserIsNotAdmin" as const
    ),
    // Success case
    Effect.map((user) => `Welcome, admin user #${user.id}!`)
  );

// We can then handle the specific failures in a type-safe way.
const handled = program(123).pipe(
  Effect.match({
    onFailure: (error) => {
      switch (error) {
        case "UserIsNotAdmin":
          return "Access denied: requires admin role.";
        case "UserIsInactive":
          return "Access denied: user is not active.";
        case "DbError":
          return "Error: could not find user.";
        default:
          return `Unknown error: ${error}`;
      }
    },
    onSuccess: (result) => result
  })
);

// Run the program
const programWithLogging = Effect.gen(function* () {
  const result = yield* handled;
  yield* Effect.log(result);
  return result;
});

Effect.runPromise(programWithLogging);
```

---

**Explanation:**  
This pattern allows you to embed decision-making logic directly into your composition pipelines, making your code more declarative and readable. It solves two key problems:

1.  **Separation of Concerns:** It cleanly separates the logic of producing a value from the logic of validating or making decisions about that value.
2.  **Reusable Business Logic:** A predicate function (e.g., `const isAdmin = (user: User) => ...`) becomes a named, reusable, and testable piece of business logic, far superior to scattering inline `if` statements throughout your code.

Using these operators turns conditional logic into a composable part of your `Effect`, rather than an imperative statement that breaks the flow.

---


---

### Wrap Synchronous Computations with sync and try
**ID:** wrap-synchronous-computations-with-sync-and-try
**Use Case:** N/A | **Skill Level:** N/A

description: Wrap synchronous computations with sync and try.
globs: "**/*.ts"
alwaysApply: true

# Wrap Synchronous Computations with sync and try
**Rule:** Wrap synchronous computations with sync and try.

### Example
```typescript
import { Effect } from "effect";

const randomNumber = Effect.sync(() => Math.random());

const parseJson = (input: string) =>
  Effect.try({
    try: () => JSON.parse(input),
    catch: (error) => new Error(`JSON parsing failed: ${error}`),
  });

// More examples of wrapping synchronous computations
const divide = (a: number, b: number) =>
  Effect.try({
    try: () => {
      if (b === 0) throw new Error("Division by zero");
      return a / b;
    },
    catch: (error) => new Error(`Division failed: ${error}`),
  });

const processString = (str: string) =>
  Effect.gen(function* () {
    yield* Effect.log(`Processing string: "${str}"`);
    return str.toUpperCase().split("").reverse().join("");
  });

// Demonstrate wrapping synchronous computations
const program = Effect.gen(function* () {
  yield* Effect.log("=== Wrapping Synchronous Computations Demo ===");

  // Example 1: Basic sync computation
  yield* Effect.log("\n1. Basic sync computation (random number):");
  const random1 = yield* randomNumber;
  const random2 = yield* randomNumber;
  yield* Effect.log(`Random numbers: ${random1.toFixed(4)}, ${random2.toFixed(4)}`);

  // Example 2: Successful JSON parsing
  yield* Effect.log("\n2. Successful JSON parsing:");
  const validJson = '{"name": "Paul", "age": 30}';
  const parsed = yield* parseJson(validJson);
  yield* Effect.log("Parsed JSON:" + JSON.stringify(parsed));

  // Example 3: Failed JSON parsing with error logging
  yield* Effect.log("\n3. Failed JSON parsing with error logging:");
  const invalidJson = '{"name": "Paul", "age":}';
  yield* parseJson(invalidJson).pipe(
    Effect.tapError((error) => Effect.log(`Parsing failed: ${error.message}`)),
    Effect.catchAll(() => Effect.succeed({ name: "default", age: 0 }))
  );
  yield* Effect.log("Continued after error (with recovery)");

  // Example 4: Division with error logging and recovery
  yield* Effect.log("\n4. Division with error logging and recovery:");
  const division1 = yield* divide(10, 2);
  yield* Effect.log(`10 / 2 = ${division1}`);

  // Use tapError to log, then catchAll to recover
  const division2 = yield* divide(10, 0).pipe(
    Effect.tapError((error) => Effect.log(`Division error: ${error.message}`)),
    Effect.catchAll(() => Effect.succeed(-1))
  );
  yield* Effect.log(`10 / 0 = ${division2} (error handled)`);

  // Example 5: String processing
  yield* Effect.log("\n5. String processing:");
  const processed = yield* processString("Hello Effect");
  yield* Effect.log(`Processed result: "${processed}"`);

  // Example 6: Combining multiple sync operations
  yield* Effect.log("\n6. Combining multiple sync operations:");
  const combined = yield* Effect.gen(function* () {
    const num = yield* randomNumber;
    const multiplied = yield* Effect.sync(() => num * 100);
    const rounded = yield* Effect.sync(() => Math.round(multiplied));
    return rounded;
  });
  yield* Effect.log(`Combined operations result: ${combined}`);

  yield* Effect.log("\n✅ Synchronous computations demonstration completed!");
});

Effect.runPromise(program);

```

**Explanation:**  
Use `Effect.sync` for safe synchronous code, and `Effect.try` to safely
handle exceptions from potentially unsafe code.

**Explanation:**  
This is the primary way to safely integrate with synchronous libraries like
`JSON.parse`. `Effect.try` captures any thrown exception and moves it into
the Effect's error channel.


---

### Run Background Tasks with Effect.fork
**ID:** run-background-tasks-with-effect-fork
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect.fork to start a non-blocking background process and manage its lifecycle via its Fiber.
globs: "**/*.ts"
alwaysApply: true

# Run Background Tasks with Effect.fork
**Rule:** Use Effect.fork to start a non-blocking background process and manage its lifecycle via its Fiber.

### Example
This program forks a background process that logs a "tick" every second. The main process does its own work for 5 seconds and then explicitly interrupts the background logger before exiting.

```typescript
import { Effect, Fiber } from "effect";

// A long-running effect that logs a message every second, forever
// Effect.forever creates an infinite loop that repeats the effect
// This simulates a background service like a health check or monitoring task
const tickingClock = Effect.log("tick").pipe(
  Effect.delay("1 second"), // Wait 1 second between ticks
  Effect.forever, // Repeat indefinitely - this creates an infinite effect
);

const program = Effect.gen(function* () {
  yield* Effect.log("Forking the ticking clock into the background.");
  
  // Start the clock, but don't wait for it.
  // Effect.fork creates a new fiber that runs concurrently with the main program
  // The main fiber continues immediately without waiting for the background task
  // This is essential for non-blocking background operations
  const clockFiber = yield* Effect.fork(tickingClock);
  
  // At this point, we have two fibers running:
  // 1. The main fiber (this program)
  // 2. The background clock fiber (ticking every second)

  yield* Effect.log("Main process is now doing other work for 5 seconds...");
  
  // Simulate the main application doing work
  // While this sleep happens, the background clock continues ticking
  // This demonstrates true concurrency - both fibers run simultaneously
  yield* Effect.sleep("5 seconds");

  yield* Effect.log("Main process is done. Interrupting the clock fiber.");
  
  // Stop the background process.
  // Fiber.interrupt sends an interruption signal to the fiber
  // This allows the fiber to perform cleanup operations before terminating
  // Without this, the background task would continue running indefinitely
  yield* Fiber.interrupt(clockFiber);
  
  // Important: Always clean up background fibers to prevent resource leaks
  // In a real application, you might want to:
  // 1. Use Fiber.join instead of interrupt to wait for graceful completion
  // 2. Handle interruption signals within the background task
  // 3. Implement proper shutdown procedures

  yield* Effect.log("Program finished.");
  
  // Key concepts demonstrated:
  // 1. Fork creates concurrent fibers without blocking
  // 2. Background tasks run independently of the main program
  // 3. Fiber interruption provides controlled shutdown
  // 4. Multiple fibers can run simultaneously on the same thread pool
});

// This example shows how to:
// - Run background tasks that don't block the main program
// - Manage fiber lifecycles (create, run, interrupt)
// - Coordinate between multiple concurrent operations
// - Properly clean up resources when shutting down
Effect.runPromise(program);
```

---

---

### Understand the Three Effect Channels (A, E, R)
**ID:** understand-the-three-effect-channels-a-e-r
**Use Case:** N/A | **Skill Level:** N/A

description: Understand that an Effect&lt;A, E, R&gt; describes a computation with a success type (A), an error type (E), and a requirements type (R).
globs: "**/*.ts"
alwaysApply: true

# Understand the Three Effect Channels (A, E, R)
**Rule:** Understand that an Effect&lt;A, E, R&gt; describes a computation with a success type (A), an error type (E), and a requirements type (R).

### Example
This function signature is a self-documenting contract. It clearly states that to get a `User`, you must provide a `Database` service, and the operation might fail with a `UserNotFoundError`.

```typescript
import { Effect, Data } from "effect";

// Define the types for our channels
interface User { readonly name: string; } // The 'A' type
class UserNotFoundError extends Data.TaggedError("UserNotFoundError") {} // The 'E' type

// Define the Database service using Effect.Service
export class Database extends Effect.Service<Database>()(
  "Database",
  {
    // Provide a default implementation
    sync: () => ({
      findUser: (id: number) =>
        id === 1
          ? Effect.succeed({ name: "Paul" })
          : Effect.fail(new UserNotFoundError())
    })
  }
) {}

// This function's signature shows all three channels
const getUser = (id: number): Effect.Effect<User, UserNotFoundError, Database> =>
  Effect.gen(function* () {
    const db = yield* Database;
    return yield* db.findUser(id);
  });

// The program will use the default implementation
const program = getUser(1);

// Run the program with the default implementation
const programWithLogging = Effect.gen(function* () {
  const result = yield* Effect.provide(program, Database.Default);
  yield* Effect.log(`Result: ${JSON.stringify(result)}`); // { name: 'Paul' }
  return result;
});

Effect.runPromise(programWithLogging);
```

---

**Explanation:**  
This three-channel signature is what makes Effect so expressive and safe. Unlike a ``Promise<A>`` which can only describe its success type, an ``Effect``'s signature tells you everything you need to know about a computation before you run it:
1.  **What it produces (`A`):** The data you get on the "happy path."
2.  **How it can fail (`E`):** The specific, known errors you need to handle. This makes error handling type-safe and explicit, unlike throwing generic `Error`s.
3.  **What it needs (`R`):** The "ingredients" or dependencies required to run the effect. This is the foundation of Effect's powerful dependency injection system. An `Effect` can only be executed when its `R` channel is `never`, meaning all its dependencies have been provided.

This turns the TypeScript compiler into a powerful assistant that ensures you've handled all possible outcomes and provided all necessary dependencies.

---


---

### Leverage Effect's Built-in Structured Logging
**ID:** leverage-effect-s-built-in-structured-logging
**Use Case:** N/A | **Skill Level:** N/A

description: Leverage Effect's built-in structured logging.
globs: "**/*.ts"
alwaysApply: true

# Leverage Effect's Built-in Structured Logging
**Rule:** Leverage Effect's built-in structured logging.

### Example
```typescript
import { Effect } from "effect";

const program = Effect.logDebug("Processing user", { userId: 123 });

// Run the program with debug logging enabled
Effect.runSync(
  program.pipe(
    Effect.tap(() => Effect.log("Debug logging enabled"))
  )
);
```

**Explanation:**  
Using Effect's logging system ensures your logs are structured, filterable,
and context-aware.

---

### Set Up a New Effect Project
**ID:** set-up-a-new-effect-project
**Use Case:** N/A | **Skill Level:** N/A

description: Set up a new Effect project.
globs: "**/*.ts"
alwaysApply: true

# Set Up a New Effect Project
**Rule:** Set up a new Effect project.

### Example
```typescript
// 1. Init project (e.g., `npm init -y`)
// 2. Install deps (e.g., `npm install effect`, `npm install -D typescript tsx`)
// 3. Create tsconfig.json with `"strict": true`
// 4. Create src/index.ts
import { Effect } from "effect";

const program = Effect.log("Hello, World!");

Effect.runSync(program);

// 5. Run the program (e.g., `npx tsx src/index.ts`)
```

**Explanation:**  
This setup ensures you have TypeScript and Effect ready to go, with strict
type-checking for maximum safety and correctness.

**Explanation:**  
A proper setup is crucial for leveraging Effect's powerful type-safety
features. Using TypeScript's `strict` mode is non-negotiable.


---

### Write Sequential Code with Effect.gen
**ID:** write-sequential-code-with-effect-gen
**Use Case:** N/A | **Skill Level:** N/A

description: Express sequential workflows ergonomically with Effect.gen
globs: "**/*.ts"
alwaysApply: false

# Write Sequential Code with Effect.gen
**Rule:** Write sequential code with Effect.gen.

### Example
```typescript
import { Effect } from "effect";

// Mock API functions for demonstration
const fetchUser = (id: number) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Fetching user ${id}...`);
    // Simulate API call
    yield* Effect.sleep("100 millis");
    return { id, name: `User ${id}`, email: `user${id}@example.com` };
  });

const fetchUserPosts = (userId: number) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Fetching posts for user ${userId}...`);
    // Simulate API call
    yield* Effect.sleep("150 millis");
    return [
      { id: 1, title: "First Post", userId },
      { id: 2, title: "Second Post", userId },
    ];
  });

const fetchPostComments = (postId: number) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Fetching comments for post ${postId}...`);
    // Simulate API call
    yield* Effect.sleep("75 millis");
    return [
      { id: 1, text: "Great post!", postId },
      { id: 2, text: "Thanks for sharing", postId },
    ];
  });

// Example of sequential code with Effect.gen
const getUserDataWithGen = (userId: number) =>
  Effect.gen(function* () {
    // Step 1: Fetch user
    const user = yield* fetchUser(userId);
    yield* Effect.logInfo(`✅ Got user: ${user.name}`);

    // Step 2: Fetch user's posts (depends on user data)
    const posts = yield* fetchUserPosts(user.id);
    yield* Effect.logInfo(`✅ Got ${posts.length} posts`);

    // Step 3: Fetch comments for first post (depends on posts data)
    const firstPost = posts[0];
    const comments = yield* fetchPostComments(firstPost.id);
    yield* Effect.logInfo(
      `✅ Got ${comments.length} comments for "${firstPost.title}"`
    );

    // Step 4: Combine all data
    const result = {
      user,
      posts,
      featuredPost: {
        ...firstPost,
        comments,
      },
    };

    yield* Effect.logInfo("✅ Successfully combined all user data");
    return result;
  });

// Example without Effect.gen (more complex)
const getUserDataWithoutGen = (userId: number) =>
  fetchUser(userId).pipe(
    Effect.flatMap((user) =>
      fetchUserPosts(user.id).pipe(
        Effect.flatMap((posts) =>
          fetchPostComments(posts[0].id).pipe(
            Effect.map((comments) => ({
              user,
              posts,
              featuredPost: {
                ...posts[0],
                comments,
              },
            }))
          )
        )
      )
    )
  );

// Demonstrate writing sequential code with gen
const program = Effect.gen(function* () {
  yield* Effect.logInfo("=== Writing Sequential Code with Effect.gen Demo ===");

  // Example 1: Sequential operations with Effect.gen
  yield* Effect.logInfo("\n1. Sequential operations with Effect.gen:");
  const userData = yield* getUserDataWithGen(123).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Failed to get user data: ${error}`);
        return null;
      })
    )
  );

  if (userData) {
    yield* Effect.logInfo(
      `Final result: User "${userData.user.name}" has ${userData.posts.length} posts`
    );
    yield* Effect.logInfo(
      `Featured post: "${userData.featuredPost.title}" with ${userData.featuredPost.comments.length} comments`
    );
  }

  // Example 2: Compare with traditional promise-like chaining
  yield* Effect.logInfo("\n2. Same logic without Effect.gen (for comparison):");
  const userData2 = yield* getUserDataWithoutGen(456).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Failed to get user data: ${error}`);
        return null;
      })
    )
  );

  if (userData2) {
    yield* Effect.logInfo(
      `Result from traditional approach: User "${userData2.user.name}"`
    );
  }

  // Example 3: Error handling in sequential code
  yield* Effect.logInfo("\n3. Error handling in sequential operations:");
  const errorHandling = yield* Effect.gen(function* () {
    try {
      const user = yield* fetchUser(999);
      const posts = yield* fetchUserPosts(user.id);
      return { user, posts };
    } catch (error) {
      yield* Effect.logError(`Error in sequential operations: ${error}`);
      return null;
    }
  }).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Caught error: ${error}`);
        return { user: null, posts: [] };
      })
    )
  );

  yield* Effect.logInfo(
    `Error handling result: ${errorHandling ? "Success" : "Handled error"}`
  );

  yield* Effect.logInfo("\n✅ Sequential code demonstration completed!");
  yield* Effect.logInfo(
    "Effect.gen makes sequential async code look like synchronous code!"
  );
});

Effect.runPromise(program);

```

**Explanation:**  
`Effect.gen` allows you to write top-to-bottom code that is easy to read and maintain, even when chaining many asynchronous steps.


---

### Representing Time Spans with Duration
**ID:** representing-time-spans-with-duration
**Use Case:** N/A | **Skill Level:** N/A

description: Use the Duration data type to represent time intervals instead of raw numbers.
globs: "**/*.ts"
alwaysApply: true

# Representing Time Spans with Duration
**Rule:** Use the Duration data type to represent time intervals instead of raw numbers.

### Example
This example shows how to create and use `Duration` to make time-based operations clear and unambiguous.

```typescript
import { Effect, Duration } from "effect";

// Create durations with clear, explicit units
const fiveSeconds = Duration.seconds(5);
const oneHundredMillis = Duration.millis(100);

// Use them in Effect operators
const program = Effect.log("Starting...").pipe(
  Effect.delay(oneHundredMillis),
  Effect.flatMap(() => Effect.log("Running after 100ms")),
  Effect.timeout(fiveSeconds) // This whole operation must complete within 5 seconds
);

// Durations can also be compared
const isLonger = Duration.greaterThan(fiveSeconds, oneHundredMillis); // true

// Demonstrate the duration functionality
const demonstration = Effect.gen(function* () {
  yield* Effect.logInfo("=== Duration Demonstration ===");

  // Show duration values
  yield* Effect.logInfo(`Five seconds: ${Duration.toMillis(fiveSeconds)}ms`);
  yield* Effect.logInfo(
    `One hundred millis: ${Duration.toMillis(oneHundredMillis)}ms`
  );

  // Show comparison
  yield* Effect.logInfo(`Is 5 seconds longer than 100ms? ${isLonger}`);

  // Run the timed program
  yield* Effect.logInfo("Running timed program...");
  yield* program;

  // Show more duration operations
  const combined = Duration.sum(fiveSeconds, oneHundredMillis);
  yield* Effect.logInfo(`Combined duration: ${Duration.toMillis(combined)}ms`);

  // Show different duration units
  const oneMinute = Duration.minutes(1);
  yield* Effect.logInfo(`One minute: ${Duration.toMillis(oneMinute)}ms`);

  const isMinuteLonger = Duration.greaterThan(oneMinute, fiveSeconds);
  yield* Effect.logInfo(`Is 1 minute longer than 5 seconds? ${isMinuteLonger}`);
});

Effect.runPromise(demonstration);

```

---

**Explanation:**  
Using raw numbers to represent time is a common source of bugs and confusion. When you see `setTimeout(fn, 5000)`, it's not immediately clear if the unit is seconds or milliseconds without prior knowledge of the API.

`Duration` solves this by making the unit explicit in the code. It provides a type-safe, immutable, and human-readable way to work with time intervals. This eliminates ambiguity and makes your code easier to read and maintain. Durations are used throughout Effect's time-based operators, such as `Effect.sleep`, `Effect.timeout`, and `Schedule`.

---


---

### Handle API Errors
**ID:** handle-api-errors
**Use Case:** N/A | **Skill Level:** N/A

description: Model application errors as typed classes and use Http.server.serveOptions to map them to specific HTTP responses.
globs: "**/*.ts"
alwaysApply: true

# Handle API Errors
**Rule:** Model application errors as typed classes and use Http.server.serveOptions to map them to specific HTTP responses.

### Example
This example defines two custom error types, `UserNotFoundError` and `InvalidIdError`. The route logic can fail with either. The `unhandledErrorResponse` function inspects the error and returns a `404` or `400` response accordingly, with a generic `500` for any other unexpected errors.

```typescript
import { Cause, Data, Effect } from 'effect';

// Define our domain types
export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'admin' | 'user';
}

// Define specific, typed errors for our domain
export class UserNotFoundError extends Data.TaggedError('UserNotFoundError')<{
  readonly id: string;
}> { }

export class InvalidIdError extends Data.TaggedError('InvalidIdError')<{
  readonly id: string;
  readonly reason: string;
}> { }

export class UnauthorizedError extends Data.TaggedError('UnauthorizedError')<{
  readonly action: string;
  readonly role: string;
}> { }

// Define error handler service
export class ErrorHandlerService extends Effect.Service<ErrorHandlerService>()(
  'ErrorHandlerService',
  {
    sync: () => ({
      // Handle API errors with proper logging
      handleApiError: <E>(error: E): Effect.Effect<ApiResponse, never, never> =>
        Effect.gen(function* () {
          yield* Effect.logError(`API Error: ${JSON.stringify(error)}`);

          if (error instanceof UserNotFoundError) {
            return { error: 'Not Found', message: `User ${error.id} not found` };
          }
          if (error instanceof InvalidIdError) {
            return { error: 'Bad Request', message: error.reason };
          }
          if (error instanceof UnauthorizedError) {
            return { error: 'Unauthorized', message: `${error.role} cannot ${error.action}` };
          }

          return { error: 'Internal Server Error', message: 'An unexpected error occurred' };
        }),

      // Handle unexpected errors
      handleUnexpectedError: (cause: Cause.Cause<unknown>): Effect.Effect<void, never, never> =>
        Effect.gen(function* () {
          yield* Effect.logError('Unexpected error occurred');

          if (Cause.isDie(cause)) {
            const defect = Cause.failureOption(cause);
            if (defect._tag === 'Some') {
              const error = defect.value as Error;
              yield* Effect.logError(`Defect: ${error.message}`);
              yield* Effect.logError(`Stack: ${error.stack?.split('\n')[1]?.trim() ?? 'N/A'}`);
            }
          }

          return Effect.succeed(void 0);
        })
    })
  }
) { }

// Define UserRepository service
export class UserRepository extends Effect.Service<UserRepository>()(
  'UserRepository',
  {
    sync: () => {
      const users = new Map<string, User>([
        ['user_123', { id: 'user_123', name: 'Paul', email: 'paul@example.com', role: 'admin' }],
        ['user_456', { id: 'user_456', name: 'Alice', email: 'alice@example.com', role: 'user' }]
      ]);

      return {
        // Get user by ID with proper error handling
        getUser: (id: string): Effect.Effect<User, UserNotFoundError | InvalidIdError> =>
          Effect.gen(function* () {
            yield* Effect.logInfo(`Attempting to get user with id: ${id}`);

            // Validate ID format
            if (!id.match(/^user_\d+$/)) {
              yield* Effect.logWarning(`Invalid user ID format: ${id}`);
              return yield* Effect.fail(new InvalidIdError({
                id,
                reason: 'ID must be in format user_<number>'
              }));
            }

            const user = users.get(id);
            if (user === undefined) {
              yield* Effect.logWarning(`User not found with id: ${id}`);
              return yield* Effect.fail(new UserNotFoundError({ id }));
            }

            yield* Effect.logInfo(`Found user: ${JSON.stringify(user)}`);
            return user;
          }),

        // Check if user has required role
        checkRole: (user: User, requiredRole: 'admin' | 'user'): Effect.Effect<void, UnauthorizedError> =>
          Effect.gen(function* () {
            yield* Effect.logInfo(`Checking if user ${user.id} has role: ${requiredRole}`);

            if (user.role !== requiredRole && user.role !== 'admin') {
              yield* Effect.logWarning(`User ${user.id} with role ${user.role} cannot access ${requiredRole} resources`);
              return yield* Effect.fail(new UnauthorizedError({
                action: 'access_user',
                role: user.role
              }));
            }

            yield* Effect.logInfo(`User ${user.id} has required role: ${user.role}`);
            return Effect.succeed(void 0);
          })
      };
    }
  }
) { }

interface ApiResponse {
  readonly error?: string;
  readonly message?: string;
  readonly data?: User;
}

// Create routes with proper error handling
const createRoutes = () => Effect.gen(function* () {
  const repo = yield* UserRepository;
  const errorHandler = yield* ErrorHandlerService;

  yield* Effect.logInfo('=== Processing API request ===');

  // Test different scenarios
  for (const userId of ['user_123', 'user_456', 'invalid_id', 'user_789']) {
    yield* Effect.logInfo(`\n--- Testing user ID: ${userId} ---`);

    const response = yield* repo.getUser(userId).pipe(
      Effect.map(user => ({
        data: {
          ...user,
          email: user.role === 'admin' ? user.email : '[hidden]'
        }
      })),
      Effect.catchAll(error => errorHandler.handleApiError(error))
    );

    yield* Effect.logInfo(`Response: ${JSON.stringify(response)}`);
  }

  // Test role checking
  const adminUser = yield* repo.getUser('user_123');
  const regularUser = yield* repo.getUser('user_456');

  yield* Effect.logInfo('\n=== Testing role checks ===');

  yield* repo.checkRole(adminUser, 'admin').pipe(
    Effect.tap(() => Effect.logInfo('Admin access successful')),
    Effect.catchAll(error => errorHandler.handleApiError(error))
  );

  yield* repo.checkRole(regularUser, 'admin').pipe(
    Effect.tap(() => Effect.logInfo('User admin access successful')),
    Effect.catchAll(error => errorHandler.handleApiError(error))
  );

  return { message: 'Tests completed successfully' };
});

// Run the program with all services
Effect.runPromise(
  Effect.provide(
    Effect.provide(
      createRoutes(),
      ErrorHandlerService.Default
    ),
    UserRepository.Default
  )
);
```

**Explanation:**  
By default, any unhandled failure in an Effect route handler results in a generic `500 Internal Server Error`. This is a safe default, but it's not helpful for API clients who need to know *why* their request failed. Was it a client-side error (like a non-existent resource, `404`) or a true server-side problem (`500`)?

Centralizing error handling at the server level provides a clean separation of concerns:

1.  **Domain-Focused Logic**: Your business logic can fail with specific, descriptive errors (e.g., `UserNotFoundError`) without needing any knowledge of HTTP status codes.
2.  **Centralized Mapping**: You define the mapping from application errors to HTTP responses in a single location. This makes your API's error handling consistent and easy to maintain. If you need to change how an error is reported, you only change it in one place.
3.  **Type Safety**: Using `Data.TaggedClass` for your errors allows you to use `Match` to exhaustively handle all known error cases, preventing you from forgetting to map a specific error type.
4.  **Clear Client Communication**: It produces a predictable and useful API, allowing clients to programmatically react to different failure scenarios.

---


---

### Avoid Long Chains of .andThen; Use Generators Instead
**ID:** avoid-long-chains-of-andthen-use-generators-instead
**Use Case:** N/A | **Skill Level:** N/A

description: Prefer generators over long chains of .andThen.
globs: "**/*.ts"
alwaysApply: true

# Avoid Long Chains of .andThen; Use Generators Instead
**Rule:** Prefer generators over long chains of .andThen.

### Example
```typescript
import { Effect } from "effect";

// Define our steps with logging
const step1 = (): Effect.Effect<number> =>
  Effect.succeed(42).pipe(
    Effect.tap(n => Effect.log(`Step 1: ${n}`))
  );

const step2 = (a: number): Effect.Effect<string> =>
  Effect.succeed(`Result: ${a * 2}`).pipe(
    Effect.tap(s => Effect.log(`Step 2: ${s}`))
  );

// Using Effect.gen for better readability
const program = Effect.gen(function* () {
  const a = yield* step1();
  const b = yield* step2(a);
  return b;
});

// Run the program
const programWithLogging = Effect.gen(function* () {
  const result = yield* program;
  yield* Effect.log(`Final result: ${result}`);
  return result;
});

Effect.runPromise(programWithLogging);
```

**Explanation:**  
Generators keep sequential logic readable and easy to maintain.

**Explanation:**  
`Effect.gen` provides a flat, linear code structure that is easier to read and
debug than deeply nested functional chains.


---

### Working with Tuples using Data.tuple
**ID:** working-with-tuples-using-datatuple
**Use Case:** N/A | **Skill Level:** N/A

description: Use Data.tuple to define tuples whose equality is based on their contents, enabling safe and predictable comparisons and pattern matching.
globs: "**/*.ts"
alwaysApply: true

# Working with Tuples using Data.tuple
**Rule:** Use Data.tuple to define tuples whose equality is based on their contents, enabling safe and predictable comparisons and pattern matching.

### Example
```typescript
import { Data, Equal } from "effect";

// Create two structurally equal tuples
const t1 = Data.tuple(1, "Alice");
const t2 = Data.tuple(1, "Alice");

// Compare by value, not reference
const areEqual = Equal.equals(t1, t2); // true

// Use tuples as keys in a HashSet or Map
import { HashSet } from "effect";
const set = HashSet.make(t1);
console.log(HashSet.has(set, t2)); // true

// Pattern matching on tuples
const [id, name] = t1; // id: number, name: string
```

**Explanation:**  
- `Data.tuple` creates immutable tuples with value-based equality.
- Useful for modeling pairs, coordinates, or any fixed-size, heterogeneous data.
- Supports safe pattern matching and collection operations.

**Explanation:**  
JavaScript arrays are mutable and compared by reference, which can lead to bugs in value-based logic.  
`Data.tuple` provides immutable tuples with structural equality, making them ideal for domain modeling and functional programming patterns.


---

### Manage Resources Safely in a Pipeline
**ID:** manage-resources-safely-in-a-pipeline
**Use Case:** N/A | **Skill Level:** N/A

description: Use Stream.acquireRelease to safely manage the lifecycle of a resource within a pipeline.
globs: "**/*.ts"
alwaysApply: true

# Manage Resources Safely in a Pipeline
**Rule:** Use Stream.acquireRelease to safely manage the lifecycle of a resource within a pipeline.

### Example
This example creates and writes to a temporary file. `Stream.acquireRelease` is used to acquire a readable stream from that file. The pipeline then processes the file but is designed to fail partway through. The logs demonstrate that the `release` effect (which deletes the file) is still executed, preventing any resource leaks.

```typescript
import { Effect, Layer } from "effect";
import { FileSystem } from "@effect/platform/FileSystem";
import { NodeFileSystem } from "@effect/platform-node";
import * as path from "node:path";

interface ProcessError {
  readonly _tag: "ProcessError";
  readonly message: string;
}

const ProcessError = (message: string): ProcessError => ({
  _tag: "ProcessError",
  message,
});

interface FileServiceType {
  readonly createTempFile: () => Effect.Effect<{ filePath: string }, never>;
  readonly cleanup: (filePath: string) => Effect.Effect<void, never>;
  readonly readFile: (filePath: string) => Effect.Effect<string, never>;
}

export class FileService extends Effect.Service<FileService>()("FileService", {
  sync: () => {
    const filePath = path.join(__dirname, "temp-resource.txt");
    return {
      createTempFile: () => Effect.succeed({ filePath }),
      cleanup: (filePath: string) =>
        Effect.log("✅ Resource cleaned up successfully"),
      readFile: (filePath: string) =>
        Effect.succeed("data 1\ndata 2\nFAIL\ndata 4"),
    };
  },
}) {}

// Process a single line
const processLine = (line: string): Effect.Effect<void, ProcessError> =>
  line === "FAIL"
    ? Effect.fail(ProcessError("Failed to process line"))
    : Effect.log(`Processed: ${line}`);

// Create and process the file with proper resource management
const program = Effect.gen(function* () {
  yield* Effect.log("=== Stream Resource Management Demo ===");
  yield* Effect.log(
    "This demonstrates proper resource cleanup even when errors occur"
  );

  const fileService = yield* FileService;
  const { filePath } = yield* fileService.createTempFile();

  // Use scoped to ensure cleanup happens even on failure
  yield* Effect.scoped(
    Effect.gen(function* () {
      yield* Effect.addFinalizer(() => fileService.cleanup(filePath));

      const content = yield* fileService.readFile(filePath);
      const lines = content.split("\n");

      // Process each line, continuing even if some fail
      for (const line of lines) {
        yield* processLine(line).pipe(
          Effect.catchAll((error) =>
            Effect.log(`⚠️  Skipped line due to error: ${error.message}`)
          )
        );
      }

      yield* Effect.log("✅ Processing completed with proper resource management");
    })
  );
});

// Run the program with FileService layer
Effect.runPromise(Effect.provide(program, FileService.Default)).catch(
  (error) => {
    Effect.runSync(Effect.logError("Unexpected error: " + error));
  }
);

```

**Explanation:**  
What happens if a pipeline processing a file fails halfway through? In a naive implementation, the file handle might be left open, leading to a resource leak. Over time, these leaks can exhaust system resources and crash your application.

`Stream.acquireRelease` is Effect's robust solution to this problem. It's built on `Scope`, Effect's fundamental resource-management tool.

1.  **Guaranteed Cleanup**: You provide an `acquire` effect to open the resource and a `release` effect to close it. Effect guarantees that the `release` effect will be called when the stream terminates, for *any* reason: successful completion, a processing failure, or even external interruption.
2.  **Declarative and Co-located**: The logic for a resource's entire lifecycle—acquisition, usage (the stream itself), and release—is defined in one place. This makes the code easier to understand and reason about compared to manual `try/finally` blocks.
3.  **Prevents Resource Leaks**: It is the idiomatic way to build truly resilient pipelines that do not leak resources, which is essential for long-running, production-grade applications.
4.  **Composability**: The resulting stream is just a normal `Stream`, which can be composed with any other stream operators.

---


---

### Work with Arbitrary-Precision Numbers using BigDecimal
**ID:** work-with-arbitrary-precision-numbers-using-bigdecimal
**Use Case:** N/A | **Skill Level:** N/A

description: Use BigDecimal to represent and compute with decimal numbers that require arbitrary precision, such as in finance or scientific domains.
globs: "**/*.ts"
alwaysApply: true

# Work with Arbitrary-Precision Numbers using BigDecimal
**Rule:** Use BigDecimal to represent and compute with decimal numbers that require arbitrary precision, such as in finance or scientific domains.

### Example
```typescript
import { BigDecimal } from "effect";

// Create BigDecimal values
const a = BigDecimal.fromNumber(0.1);
const b = BigDecimal.fromNumber(0.2);

// Add, subtract, multiply, divide
const sum = BigDecimal.sum(a, b); // BigDecimal(0.3)
const product = BigDecimal.multiply(a, b); // BigDecimal(0.02)

// Compare values
const isEqual = BigDecimal.equals(sum, BigDecimal.fromNumber(0.3)); // true

// Convert to string or number
const asString = BigDecimal.format(BigDecimal.normalize(sum)); // "0.3"
const asNumber = BigDecimal.unsafeToNumber(sum); // 0.3
```

**Explanation:**  
- `BigDecimal` is immutable and supports precise decimal arithmetic.
- Use it for domains where rounding errors are unacceptable (e.g., finance, billing, scientific data).
- Avoids the pitfalls of floating-point math in JavaScript.

**Explanation:**  
JavaScript's `number` type is a floating-point double, which can introduce subtle bugs in calculations that require exact decimal representation.  
`BigDecimal` provides precise, immutable arithmetic for critical domains.


---

### Automatically Retry Failed Operations
**ID:** automatically-retry-failed-operations
**Use Case:** N/A | **Skill Level:** N/A

description: Compose a Stream with the .retry(Schedule) operator to automatically recover from transient failures.
globs: "**/*.ts"
alwaysApply: true

# Automatically Retry Failed Operations
**Rule:** Compose a Stream with the .retry(Schedule) operator to automatically recover from transient failures.

### Example
This example simulates an API that fails the first two times it's called. The stream processes a list of IDs, and the `retry` operator ensures that the failing operation for `id: 2` is automatically retried until it succeeds.

````typescript
import { Effect, Stream, Schedule } from "effect";

// A mock function that simulates a flaky API call
const processItem = (id: number): Effect.Effect<string, Error> =>
  Effect.gen(function* () {
    yield* Effect.log(`Attempting to process item ${id}...`);

    // Item 2 fails on first attempt but succeeds on retry
    if (id === 2) {
      const random = Math.random();
      if (random < 0.5) {
        // 50% chance of failure for demonstration
        yield* Effect.log(`Item ${id} failed, will retry...`);
        return yield* Effect.fail(new Error("API is temporarily down"));
      }
    }

    yield* Effect.log(`✅ Successfully processed item ${id}`);
    return `Processed item ${id}`;
  });

const ids = [1, 2, 3];

// Define a retry policy: 3 attempts with a fixed 100ms delay
const retryPolicy = Schedule.recurs(3).pipe(
  Schedule.addDelay(() => "100 millis")
);

const program = Effect.gen(function* () {
  yield* Effect.log("=== Stream Retry on Failure Demo ===");
  yield* Effect.log(
    "Processing items with retry policy (3 attempts, 100ms delay)"
  );

  // Process each item individually with retry
  const results = yield* Effect.forEach(
    ids,
    (id) =>
      processItem(id).pipe(
        Effect.retry(retryPolicy),
        Effect.catchAll((error) =>
          Effect.gen(function* () {
            yield* Effect.log(
              `❌ Item ${id} failed after all retries: ${error.message}`
            );
            return `Failed: item ${id}`;
          })
        )
      ),
    { concurrency: 1 }
  );

  yield* Effect.log("=== Results ===");
  for (let index = 0; index < results.length; index++) {
  yield* Effect.log(`Item ${ids[index]}: ${results[index]}`);
}

  yield* Effect.log("✅ Stream processing completed");
});

Effect.runPromise(program).catch((error) => {
  Effect.runSync(Effect.logError("Unexpected error: " + error));
});
/*
Output:
... level=INFO msg="Attempting to process item 1..."
... level=INFO msg="Attempting to process item 2..."
... level=INFO msg="Item 2 failed, attempt 1."
... level=INFO msg="Attempting to process item 2..."
... level=INFO msg="Item 2 failed, attempt 2."
... level=INFO msg="Attempting to process item 2..."
... level=INFO msg="Attempting to process item 3..."
*/

````

**Explanation:**  
Real-world systems are unreliable. Network connections drop, APIs return temporary `503` errors, and databases can experience deadlocks. A naive pipeline will fail completely on the first sign of trouble. A resilient pipeline, however, can absorb these transient errors and heal itself.

The `retry` operator, combined with the `Schedule` module, provides a powerful and declarative way to build this resilience:

1.  **Declarative Resilience**: Instead of writing complex `try/catch` loops with manual delay logic, you declaratively state *how* the pipeline should retry. For example, "retry 3 times, with an exponential backoff starting at 100ms."
2.  **Separation of Concerns**: Your core pipeline logic remains focused on the "happy path." The retry strategy is a separate, composable concern that you apply to the entire stream.
3.  **Rich Scheduling Policies**: `Schedule` is incredibly powerful. You can create schedules based on a fixed number of retries, exponential backoff, jitter (to avoid thundering herd problems), or even combinations of these.
4.  **Prevents Cascading Failures**: By handling temporary issues at the source, you prevent a small, transient glitch from causing a complete failure of your entire application.

---


---

### Process Streaming Data with Stream
**ID:** process-streaming-data-with-stream
**Use Case:** N/A | **Skill Level:** N/A

description: Use Stream to model and process data that arrives over time in a composable, efficient way.
globs: "**/*.ts"
alwaysApply: true

# Process Streaming Data with Stream
**Rule:** Use Stream to model and process data that arrives over time in a composable, efficient way.

### Example
This example demonstrates creating a `Stream` from a paginated API. The `Stream` will make API calls as needed, processing one page of users at a time without ever holding the entire user list in memory.

```typescript
import { Effect, Stream, Option } from "effect";

interface User {
  id: number;
  name: string;
}
interface PaginatedResponse {
  users: User[];
  nextPage: number | null;
}

// A mock API call that returns a page of users
const fetchUserPage = (
  page: number,
): Effect.Effect<PaginatedResponse, "ApiError"> =>
  Effect.succeed(
    page < 3
      ? {
          users: [
            { id: page * 2 + 1, name: `User ${page * 2 + 1}` },
            { id: page * 2 + 2, name: `User ${page * 2 + 2}` },
          ],
          nextPage: page + 1,
        }
      : { users: [], nextPage: null },
  ).pipe(Effect.delay("50 millis"));

// Stream.paginateEffect creates a stream from a paginated source
const userStream: Stream.Stream<User, "ApiError"> = Stream.paginateEffect(0, (page) =>
  fetchUserPage(page).pipe(
    Effect.map((response) => [
      response.users,
      Option.fromNullable(response.nextPage)
    ] as const),
  ),
).pipe(
  // Flatten the stream of user arrays into a stream of individual users
  Stream.flatMap((users) => Stream.fromIterable(users)),
);

// We can now process the stream of users.
// Stream.runForEach will pull from the stream until it's exhausted.
const program = Stream.runForEach(userStream, (user: User) =>
  Effect.log(`Processing user: ${user.name}`),
);

const programWithErrorHandling = program.pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logError(`Stream processing error: ${error}`);
      return null;
    })
  )
);

Effect.runPromise(programWithErrorHandling);
```

---

**Explanation:**  
Some data sources don't fit the one-shot request/response model of `Effect`. For example:
-   Reading a multi-gigabyte file from disk.
-   Receiving messages from a WebSocket.
-   Fetching results from a paginated API.

Loading all this data into memory at once would be inefficient or impossible. `Stream` solves this by allowing you to process the data in chunks as it arrives. It provides a rich API of composable operators (`map`, `filter`, `run`, etc.) that mirror those on `Effect` and `Array`, but are designed for streaming data. This allows you to build efficient, constant-memory data processing pipelines.

---


---

### Beyond the Date Type - Real World Dates, Times, and Timezones
**ID:** beyond-the-date-type---real-world-dates-times-and-timezones
**Use Case:** N/A | **Skill Level:** N/A

description: Use the Clock service for testable time-based logic and immutable primitives for timestamps.
globs: "**/*.ts"
alwaysApply: true

# Beyond the Date Type - Real World Dates, Times, and Timezones
**Rule:** Use the Clock service for testable time-based logic and immutable primitives for timestamps.

### Example
This example shows a function that creates a timestamped event. It depends on the `Clock` service, making it fully testable.

```typescript
import { Effect, Clock } from "effect";
import type * as Types from "effect/Clock";

interface Event {
  readonly message: string;
  readonly timestamp: number; // Store as a primitive number (UTC millis)
}

// This function is pure and testable because it depends on Clock
const createEvent = (message: string): Effect.Effect<Event, never, Types.Clock> =>
  Effect.gen(function* () {
    const timestamp = yield* Clock.currentTimeMillis;
    return { message, timestamp };
  });

// Create and log some events
const program = Effect.gen(function* () {
  const loginEvent = yield* createEvent("User logged in");
  yield* Effect.log("Login event:", loginEvent);

  const logoutEvent = yield* createEvent("User logged out");
  yield* Effect.log("Logout event:", logoutEvent);
});

// Run the program
const programWithErrorHandling = program.pipe(
  Effect.provideService(Clock.Clock, Clock.make()),
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logError(`Program error: ${error}`);
      return null;
    })
  )
);

Effect.runPromise(programWithErrorHandling);
```

---

**Explanation:**  
JavaScript's native `Date` object is a common source of bugs. It is mutable, its behavior can be inconsistent across different JavaScript environments (especially with timezones), and its reliance on the system clock makes time-dependent logic difficult to test.

Effect's approach solves these problems:
-   The **`Clock` service** abstracts away the concept of "now." In production, the `Live` clock uses the system time. In tests, you can provide a `TestClock` that gives you complete, deterministic control over the passage of time.
-   Using **primitive `number` or `string`** for timestamps ensures immutability and makes your data easy to serialize, store, and transfer.

This makes your time-based logic pure, predictable, and easy to test.

---


---

### Process a Collection in Parallel with Effect.forEach
**ID:** process-a-collection-in-parallel-with-effect-foreach
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect.forEach with the `concurrency` option to process a collection in parallel with a fixed limit.
globs: "**/*.ts"
alwaysApply: true

# Process a Collection in Parallel with Effect.forEach
**Rule:** Use Effect.forEach with the `concurrency` option to process a collection in parallel with a fixed limit.

### Example
Imagine you have a list of 100 user IDs and you need to fetch the data for each one. `Effect.forEach` with a concurrency of 10 will process them in controlled parallel batches.

```typescript
import { Effect } from "effect";

// Mock function to simulate fetching a user by ID
const fetchUserById = (id: number) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Fetching user ${id}...`);
    yield* Effect.sleep("1 second"); // Simulate network delay
    return { id, name: `User ${id}`, email: `user${id}@example.com` };
  });

const userIds = Array.from({ length: 10 }, (_, i) => i + 1);

// Process the entire array, but only run 5 fetches at a time.
const program = Effect.gen(function* () {
  yield* Effect.logInfo("Starting parallel processing...");

  const startTime = Date.now();
  const users = yield* Effect.forEach(userIds, fetchUserById, {
    concurrency: 5, // Limit to 5 concurrent operations
  });
  const endTime = Date.now();

  yield* Effect.logInfo(
    `Processed ${users.length} users in ${endTime - startTime}ms`
  );
  yield* Effect.logInfo(
    `First few users: ${JSON.stringify(users.slice(0, 3), null, 2)}`
  );

  return users;
});

// The result will be an array of all user objects.
// The total time will be much less than running them sequentially.
Effect.runPromise(program);

```

---

---

### Process a Collection in Parallel with Effect.forEach
**ID:** process-a-collection-in-parallel-with-effectforeach
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect.forEach with the `concurrency` option to process a collection in parallel with a fixed limit.
globs: "**/*.ts"
alwaysApply: true

# Process a Collection in Parallel with Effect.forEach
**Rule:** Use Effect.forEach with the `concurrency` option to process a collection in parallel with a fixed limit.

### Example
Imagine you have a list of 100 user IDs and you need to fetch the data for each one. `Effect.forEach` with a concurrency of 10 will process them in controlled parallel batches.

```typescript
import { Clock, Effect } from "effect";

// Mock function to simulate fetching a user by ID
const fetchUserById = (id: number) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Fetching user ${id}...`);
    yield* Effect.sleep("1 second"); // Simulate network delay
    return { id, name: `User ${id}`, email: `user${id}@example.com` };
  });

const userIds = Array.from({ length: 10 }, (_, i) => i + 1);

// Process the entire array, but only run 5 fetches at a time.
const program = Effect.gen(function* () {
  yield* Effect.logInfo("Starting parallel processing...");

  const startTime = yield* Clock.currentTimeMillis;
  const users = yield* Effect.forEach(userIds, fetchUserById, {
    concurrency: 5, // Limit to 5 concurrent operations
  });
  const endTime = yield* Clock.currentTimeMillis;

  yield* Effect.logInfo(
    `Processed ${users.length} users in ${endTime - startTime}ms`
  );
  yield* Effect.logInfo(
    `First few users: ${JSON.stringify(users.slice(0, 3), null, 2)}`
  );

  return users;
});

// The result will be an array of all user objects.
// The total time will be much less than running them sequentially.
Effect.runPromise(program);

```

---

**Explanation:**  
Running `Effect.all` on a large array of tasks is dangerous. If you have 1,000 items, it will try to start 1,000 concurrent fibers at once, which can exhaust memory, overwhelm your CPU, or hit API rate limits.

`Effect.forEach` with a concurrency limit solves this problem elegantly. It acts as a concurrent processing pool. It will start processing items up to your specified limit (e.g., 10 at a time). As soon as one task finishes, it will pick up the next available item from the list, ensuring that no more than 10 tasks are ever running simultaneously. This provides massive performance gains over sequential processing while maintaining stability and control.

---


---

### Converting from Nullable, Option, or Either
**ID:** converting-from-nullable-option-or-either
**Use Case:** N/A | **Skill Level:** N/A

description: Use fromNullable, fromOption, and fromEither to lift nullable values, Option, or Either into Effects or Streams for safe, typeful interop.
globs: "**/*.ts"
alwaysApply: true

# Converting from Nullable, Option, or Either
**Rule:** Use fromNullable, fromOption, and fromEither to lift nullable values, Option, or Either into Effects or Streams for safe, typeful interop.

### Example
```typescript
import { Effect, Option, Either } from "effect";

// Option: Convert a nullable value to an Option
const nullableValue: string | null = Math.random() > 0.5 ? "hello" : null;
const option = Option.fromNullable(nullableValue); // Option<string>

// Effect: Convert an Option to an Effect that may fail
const someValue = Option.some(42);
const effectFromOption = Option.match(someValue, {
  onNone: () => Effect.fail("No value"),
  onSome: (value) => Effect.succeed(value)
}); // Effect<number, string, never>

// Effect: Convert an Either to an Effect
const either = Either.right("success");
const effectFromEither = Either.match(either, {
  onLeft: (error) => Effect.fail(error),
  onRight: (value) => Effect.succeed(value)
}); // Effect<string, never, never>
```

**Explanation:**  
- `Effect.fromNullable` lifts a nullable value into an Effect, failing if the value is `null` or `undefined`.
- `Effect.fromOption` lifts an Option into an Effect, failing if the Option is `none`.
- `Effect.fromEither` lifts an Either into an Effect, failing if the Either is `left`.

**Explanation:**  
Converting to Effect, Stream, Option, or Either lets you use all the combinators, error handling, and resource safety of the Effect ecosystem, while avoiding the pitfalls of `null` and `undefined`.


---

### Execute Synchronous Effects with Effect.runSync
**ID:** execute-synchronous-effects-with-effectrunsync
**Use Case:** N/A | **Skill Level:** N/A

description: Execute synchronous effects with Effect.runSync.
globs: "**/*.ts"
alwaysApply: true

# Execute Synchronous Effects with Effect.runSync
**Rule:** Execute synchronous effects with Effect.runSync.

### Example
```typescript
import { Effect } from "effect"

// Simple synchronous program
const program1 = Effect.gen(function* () {
  const n = 10
  const result = n * 2
  yield* Effect.log(`Simple program result: ${result}`)
  return result
})

// Run simple program
Effect.runSync(program1)

// Program with logging
const program2 = Effect.gen(function* () {
  yield* Effect.logInfo("Starting calculation...")
  const n = yield* Effect.sync(() => 10)
  yield* Effect.logInfo(`Got number: ${n}`)
  const result = yield* Effect.sync(() => n * 2)
  yield* Effect.logInfo(`Result: ${result}`)
  return result
})

// Run with logging
Effect.runSync(program2)

// Program with error handling
const program3 = Effect.gen(function* () {
  yield* Effect.logInfo("Starting division...")
  const n = yield* Effect.sync(() => 10)
  const divisor = yield* Effect.sync(() => 0)
  
  yield* Effect.logInfo(`Attempting to divide ${n} by ${divisor}...`)
  return yield* Effect.try({
    try: () => {
      if (divisor === 0) throw new Error("Cannot divide by zero")
      return n / divisor
    },
    catch: (error) => {
      if (error instanceof Error) {
        return error
      }
      return new Error("Unknown error occurred")
    }
  })
}).pipe(
  Effect.catchAll((error) =>
    Effect.logInfo(`Error occurred: ${error.message}`)
  )
)

// Run with error handling
Effect.runSync(program3)
```

**Explanation:**  
Use `runSync` only for Effects that are fully synchronous. If the Effect
contains async code, use `runPromise` instead.

**Explanation:**  
`Effect.runSync` is an optimized runner for Effects that don't involve any
asynchronous operations. If the Effect contains any async operations,
`runSync` will throw an error.


---

### Sequencing with andThen, tap, and flatten
**ID:** sequencing-with-andthen-tap-and-flatten
**Use Case:** N/A | **Skill Level:** N/A

description: Use sequencing combinators to run computations in order, perform side effects, or flatten nested structures, while preserving error and context handling.
globs: "**/*.ts"
alwaysApply: true

# Sequencing with andThen, tap, and flatten
**Rule:** Use sequencing combinators to run computations in order, perform side effects, or flatten nested structures, while preserving error and context handling.

### Example
```typescript
import { Effect, Stream, Option, Either } from "effect";

// andThen: Run one effect, then another, ignore the first result
const logThenCompute = Effect.log("Starting...").pipe(
  Effect.andThen(Effect.succeed(42))
); // Effect<number>

// tap: Log the result of an effect, but keep the value
const computeAndLog = Effect.succeed(42).pipe(
  Effect.tap((n) => Effect.log(`Result is ${n}`))
); // Effect<number>

// flatten: Remove one level of nesting
const nestedOption = Option.some(Option.some(1));
const flatOption = Option.flatten(nestedOption); // Option<number>

const nestedEffect = Effect.succeed(Effect.succeed(1));
const flatEffect = Effect.flatten(nestedEffect); // Effect<number>

// tapError: Log errors without handling them
const mightFail = Effect.fail("fail!").pipe(
  Effect.tapError((err) => Effect.logError(`Error: ${err}`))
); // Effect<never>

// Stream: tap for side effects on each element
const stream = Stream.fromIterable([1, 2, 3]).pipe(
  Stream.tap((n) => Effect.log(`Saw: ${n}`))
); // Stream<number>
```

**Explanation:**  
- `andThen` is for sequencing when you don’t care about the first result.
- `tap` is for running side effects (like logging) without changing the value.
- `flatten` is for removing unnecessary nesting (e.g., `Option<Option<A>>` → `Option<A>`).

**Explanation:**  
Sequencing is fundamental for expressing workflows.  
These combinators let you:
- Run computations in order (`andThen`)
- Attach logging, metrics, or other side effects (`tap`)
- Simplify nested structures (`flatten`)

All while preserving composability, error handling, and type safety.


---

### Matching Tagged Unions with matchTag and matchTags
**ID:** matching-tagged-unions-with-matchtag-and-matchtags
**Use Case:** N/A | **Skill Level:** N/A

description: Use matchTag and matchTags to handle specific cases of tagged unions or custom error types in a declarative, type-safe way.
globs: "**/*.ts"
alwaysApply: true

# Matching Tagged Unions with matchTag and matchTags
**Rule:** Use matchTag and matchTags to handle specific cases of tagged unions or custom error types in a declarative, type-safe way.

### Example
```typescript
import { Data, Effect } from "effect";

// Define a tagged error type
class NotFoundError extends Data.TaggedError("NotFoundError")<{}> {}
class ValidationError extends Data.TaggedError("ValidationError")<{
  message: string;
}> {}

type MyError = NotFoundError | ValidationError;

// Effect: Match on specific error tags
const effect: Effect.Effect<string, never, never> = Effect.fail(
  new ValidationError({ message: "Invalid input" }) as MyError
).pipe(
  Effect.catchTags({
    NotFoundError: () => Effect.succeed("Not found!"),
    ValidationError: (err) =>
      Effect.succeed(`Validation failed: ${err.message}`),
  })
); // Effect<string>

```

**Explanation:**  
- `matchTag` lets you branch on the specific tag of a tagged union or custom error type.
- This is safer and more maintainable than using `instanceof` or manual property checks.

**Explanation:**  
Tagged unions (a.k.a. algebraic data types or ADTs) are a powerful way to model domain logic.  
Pattern matching on tags lets you handle each case explicitly, making your code robust, maintainable, and exhaustive.


---

### Use Effect.gen for Business Logic
**ID:** use-effect-gen-for-business-logic
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect.gen for business logic.
globs: "**/*.ts"
alwaysApply: true

# Use Effect.gen for Business Logic
**Rule:** Use Effect.gen for business logic.

### Example
```typescript
import { Effect } from "effect";

// Concrete implementations for demonstration
const validateUser = (
  data: any
): Effect.Effect<{ email: string; password: string }, Error, never> =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Validating user data: ${JSON.stringify(data)}`);

    if (!data.email || !data.password) {
      return yield* Effect.fail(new Error("Email and password are required"));
    }

    if (data.password.length < 6) {
      return yield* Effect.fail(
        new Error("Password must be at least 6 characters")
      );
    }

    yield* Effect.logInfo("✅ User data validated successfully");
    return { email: data.email, password: data.password };
  });

const hashPassword = (pw: string): Effect.Effect<string, never, never> =>
  Effect.gen(function* () {
    yield* Effect.logInfo("Hashing password...");
    // Simulate password hashing
    const hashed = `hashed_${pw}_${Date.now()}`;
    yield* Effect.logInfo("✅ Password hashed successfully");
    return hashed;
  });

const dbCreateUser = (data: {
  email: string;
  password: string;
}): Effect.Effect<{ id: number; email: string }, never, never> =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Creating user in database: ${data.email}`);
    // Simulate database operation
    const user = { id: Math.floor(Math.random() * 1000), email: data.email };
    yield* Effect.logInfo(`✅ User created with ID: ${user.id}`);
    return user;
  });

const createUser = (userData: any): Effect.Effect<{ id: number; email: string }, Error, never> =>
  Effect.gen(function* () {
    const validated = yield* validateUser(userData);
    const hashed = yield* hashPassword(validated.password);
    return yield* dbCreateUser({ ...validated, password: hashed });
  });

// Demonstrate using Effect.gen for business logic
const program = Effect.gen(function* () {
  yield* Effect.logInfo("=== Using Effect.gen for Business Logic Demo ===");

  // Example 1: Successful user creation
  yield* Effect.logInfo("\n1. Creating a valid user:");
  const validUser = yield* createUser({
    email: "paul@example.com",
    password: "securepassword123",
  }).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Failed to create user: ${error.message}`);
        return { id: -1, email: "error" };
      })
    )
  );
  yield* Effect.logInfo(`Created user: ${JSON.stringify(validUser)}`);

  // Example 2: Invalid user data
  yield* Effect.logInfo("\n2. Attempting to create user with invalid data:");
  const invalidUser = yield* createUser({
    email: "invalid@example.com",
    password: "123", // Too short
  }).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Failed to create user: ${error.message}`);
        return { id: -1, email: "error" };
      })
    )
  );
  yield* Effect.logInfo(`Result: ${JSON.stringify(invalidUser)}`);

  yield* Effect.logInfo("\n✅ Business logic demonstration completed!");
});

Effect.runPromise(program);

```

**Explanation:**  
`Effect.gen` allows you to express business logic in a clear, sequential style,
improving maintainability.

---

### Modeling Tagged Unions with Data.case
**ID:** modeling-tagged-unions-with-datacase
**Use Case:** N/A | **Skill Level:** N/A

description: Use Data.case to define tagged unions (ADTs) for modeling domain-specific states and enabling exhaustive pattern matching.
globs: "**/*.ts"
alwaysApply: true

# Modeling Tagged Unions with Data.case
**Rule:** Use Data.case to define tagged unions (ADTs) for modeling domain-specific states and enabling exhaustive pattern matching.

### Example
```typescript
import { Data } from "effect";

// Define a tagged union for a simple state machine
type State = Data.TaggedEnum<{
  Loading: {}
  Success: { data: string }
  Failure: { error: string }
}>
const { Loading, Success, Failure } = Data.taggedEnum<State>()

// Create instances
const state1: State = Loading()
const state2: State = Success({ data: "Hello" })
const state3: State = Failure({ error: "Oops" })

// Pattern match on the state
function handleState(state: State): string {
  switch (state._tag) {
    case "Loading":
      return "Loading...";
    case "Success":
      return `Data: ${state.data}`;
    case "Failure":
      return `Error: ${state.error}`;
  }
}
```

**Explanation:**  
- `Data.case` creates tagged constructors for each state.
- The `_tag` property enables exhaustive pattern matching.
- Use for domain modeling, state machines, and error types.

**Explanation:**  
Modeling domain logic with tagged unions ensures that all cases are handled, prevents illegal states, and enables safe, exhaustive pattern matching.  
`Data.case` provides a concise, type-safe way to define and use ADTs in your application.


---

### Write Tests That Adapt to Application Code
**ID:** write-tests-that-adapt-to-application-code
**Use Case:** N/A | **Skill Level:** N/A

description: Write tests that adapt to application code.
globs: "**/*.ts"
alwaysApply: true

# Write Tests That Adapt to Application Code
**Rule:** Write tests that adapt to application code.

### Example
```typescript
import { Effect } from "effect";

// Define our types
interface User {
  id: number;
  name: string;
}

class NotFoundError extends Error {
  readonly _tag = "NotFoundError";
  constructor(readonly id: number) {
    super(`User ${id} not found`);
  }
}

// Define database service interface
interface DatabaseServiceApi {
  getUserById: (id: number) => Effect.Effect<User, NotFoundError>;
}

// Implement the service with mock data
class DatabaseService extends Effect.Service<DatabaseService>()(
  "DatabaseService",
  {
    sync: () => ({
      getUserById: (id: number) => {
        // Simulate database lookup
        if (id === 404) {
          return Effect.fail(new NotFoundError(id));
        }
        return Effect.succeed({ id, name: `User ${id}` });
      },
    }),
  }
) {}

// Test service implementation for testing
class TestDatabaseService extends Effect.Service<TestDatabaseService>()(
  "TestDatabaseService",
  {
    sync: () => ({
      getUserById: (id: number) => {
        // Test data with predictable responses
        const testUsers = [
          { id: 1, name: "Test User 1" },
          { id: 2, name: "Test User 2" },
          { id: 123, name: "User 123" },
        ];

        const user = testUsers.find((u) => u.id === id);
        if (user) {
          return Effect.succeed(user);
        }
        return Effect.fail(new NotFoundError(id));
      },
    }),
  }
) {}

// Business logic that uses the database service
const getUserWithFallback = (id: number) =>
  Effect.gen(function* () {
    const db = yield* DatabaseService;
    return yield* Effect.gen(function* () {
      const user = yield* db.getUserById(id);
      return user;
    }).pipe(
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          if (error instanceof NotFoundError) {
            yield* Effect.logInfo(`User ${id} not found, using fallback`);
            return { id, name: `Fallback User ${id}` };
          }
          return yield* Effect.fail(error);
        })
      )
    );
  });

// Create a program that demonstrates the service
const program = Effect.gen(function* () {
  yield* Effect.logInfo(
    "=== Writing Tests that Adapt to Application Code Demo ==="
  );

  const db = yield* DatabaseService;

  // Example 1: Successful user lookup
  yield* Effect.logInfo("\n1. Looking up existing user 123...");
  const user = yield* Effect.gen(function* () {
    try {
      return yield* db.getUserById(123);
    } catch (error) {
      yield* Effect.logError(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { id: -1, name: "Error" };
    }
  });
  yield* Effect.logInfo(`Found user: ${JSON.stringify(user)}`);

  // Example 2: Handle non-existent user with proper error handling
  yield* Effect.logInfo("\n2. Looking up non-existent user 404...");
  const notFoundUser = yield* Effect.gen(function* () {
    try {
      return yield* db.getUserById(404);
    } catch (error) {
      if (error instanceof NotFoundError) {
        yield* Effect.logInfo(
          `✅ Properly handled NotFoundError: ${error.message}`
        );
        return { id: 404, name: "Not Found" };
      }
      yield* Effect.logError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { id: -1, name: "Error" };
    }
  });
  yield* Effect.logInfo(`Result: ${JSON.stringify(notFoundUser)}`);

  // Example 3: Business logic with fallback
  yield* Effect.logInfo("\n3. Business logic with fallback for missing user:");
  const userWithFallback = yield* getUserWithFallback(999);
  yield* Effect.logInfo(
    `User with fallback: ${JSON.stringify(userWithFallback)}`
  );

  // Example 4: Testing with different service implementation
  yield* Effect.logInfo("\n4. Testing with test service implementation:");
  yield* Effect.provide(
    Effect.gen(function* () {
      const testDb = yield* TestDatabaseService;

      // Test existing user
      const testUser1 = yield* Effect.gen(function* () {
        try {
          return yield* testDb.getUserById(1);
        } catch (error) {
          yield* Effect.logError(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return { id: -1, name: "Test Error" };
        }
      });
      yield* Effect.logInfo(`Test user 1: ${JSON.stringify(testUser1)}`);

      // Test non-existing user
      const testUser404 = yield* Effect.gen(function* () {
        try {
          return yield* testDb.getUserById(404);
        } catch (error) {
          yield* Effect.logInfo(
            `✅ Test service properly threw NotFoundError: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
          return { id: 404, name: "Test Not Found" };
        }
      });
      yield* Effect.logInfo(`Test result: ${JSON.stringify(testUser404)}`);
    }),
    TestDatabaseService.Default
  );

  yield* Effect.logInfo(
    "\n✅ Tests that adapt to application code demonstration completed!"
  );
  yield* Effect.logInfo(
    "The same business logic works with different service implementations!"
  );
});

// Run the program with the default database service
Effect.runPromise(
  Effect.provide(program, DatabaseService.Default) as Effect.Effect<void, never, never>
);

```

**Explanation:**  
Tests should reflect the real interface and behavior of your code, not force changes to it.

**Explanation:**  
Treating application code as immutable during testing prevents the introduction of bugs and false test confidence. The goal of a test is to verify real-world behavior; changing that behavior to suit the test invalidates its purpose.


---

### Compose Resource Lifecycles with `Layer.merge`
**ID:** compose-resource-lifecycles-with-layermerge
**Use Case:** N/A | **Skill Level:** N/A

description: Compose multiple scoped layers using `Layer.merge` or by providing one layer to another.
globs: "**/*.ts"
alwaysApply: true

# Compose Resource Lifecycles with `Layer.merge`
**Rule:** Compose multiple scoped layers using `Layer.merge` or by providing one layer to another.

### Example
```typescript
import { Effect, Layer, Console } from "effect";

// --- Service 1: Database ---
interface DatabaseOps {
  query: (sql: string) => Effect.Effect<string, never, never>;
}

class Database extends Effect.Service<DatabaseOps>()(
  "Database",
  {
    sync: () => ({
      query: (sql: string): Effect.Effect<string, never, never> =>
        Effect.sync(() => `db says: ${sql}`)
    })
  }
) {}

// --- Service 2: API Client ---
interface ApiClientOps {
  fetch: (path: string) => Effect.Effect<string, never, never>;
}

class ApiClient extends Effect.Service<ApiClientOps>()(
  "ApiClient",
  {
    sync: () => ({
      fetch: (path: string): Effect.Effect<string, never, never> =>
        Effect.sync(() => `api says: ${path}`)
    })
  }
) {}

// --- Application Layer ---
// We merge the two independent layers into one.
const AppLayer = Layer.merge(Database.Default, ApiClient.Default);

// This program uses both services, unaware of their implementation details.
const program = Effect.gen(function* () {
  const db = yield* Database;
  const api = yield* ApiClient;

  const dbResult = yield* db.query("SELECT *");
  const apiResult = yield* api.fetch("/users");

  yield* Effect.log(dbResult);
  yield* Effect.log(apiResult);
});

// Provide the combined layer to the program.
Effect.runPromise(Effect.provide(program, AppLayer));

/*
Output (note the LIFO release order):
Database pool opened
API client session started
db says: SELECT *
api says: /users
API client session ended
Database pool closed
*/
```

**Explanation:**
We define two completely independent services, `Database` and `ApiClient`, each with its own resource lifecycle. By combining them with `Layer.merge`, we create a single `AppLayer`. When `program` runs, Effect acquires the resources for both layers. When `program` finishes, Effect closes the application's scope, releasing the resources in the reverse order they were acquired (`ApiClient` then `Database`), ensuring a clean and predictable shutdown.

**Explanation:**  
This pattern is the ultimate payoff for defining services with `Layer`. It allows for true modularity. Each service can be defined in its own file, declaring its own resource requirements in its `Live` layer, completely unaware of other services.

When you assemble the final application layer, Effect analyzes the dependencies:
1.  **Acquisition Order:** It ensures resources are acquired in the correct order. For example, a `Logger` layer might be initialized before a `Database` layer that uses it for logging.
2.  **Release Order:** It guarantees that resources are released in the **exact reverse order** of their acquisition. This is critical for preventing shutdown errors, such as a `UserRepository` trying to log a final message after the `Logger` has already been shut down.

This automates one of the most complex and error-prone parts of application architecture.


---

### Working with Immutable Arrays using Data.array
**ID:** working-with-immutable-arrays-using-dataarray
**Use Case:** N/A | **Skill Level:** N/A

description: Use Data.array to define arrays whose equality is based on their contents, enabling safe, predictable comparisons and functional operations.
globs: "**/*.ts"
alwaysApply: true

# Working with Immutable Arrays using Data.array
**Rule:** Use Data.array to define arrays whose equality is based on their contents, enabling safe, predictable comparisons and functional operations.

### Example
```typescript
import { Data, Equal } from "effect";

// Create two structurally equal arrays
const arr1 = Data.array([1, 2, 3]);
const arr2 = Data.array([1, 2, 3]);

// Compare by value, not reference
const areEqual = Equal.equals(arr1, arr2); // true

// Use arrays as keys in a HashSet or Map
import { HashSet } from "effect";
const set = HashSet.make(arr1);
console.log(HashSet.has(set, arr2)); // true

// Functional operations (map, filter, etc.)
const doubled = arr1.map((n) => n * 2); // Data.array([2, 4, 6])
```

**Explanation:**  
- `Data.array` creates immutable arrays with value-based equality.
- Useful for modeling ordered collections in a safe, functional way.
- Supports all standard array operations, but with immutability and structural equality.

**Explanation:**  
JavaScript arrays are mutable and compared by reference, which can lead to bugs in value-based logic and concurrent code.  
`Data.array` provides immutable arrays with structural equality, making them ideal for functional programming and safe domain modeling.


---

### Transforming Values with map
**ID:** transforming-values-with-map
**Use Case:** N/A | **Skill Level:** N/A

description: Use map to apply a pure function to the value inside an Effect, Stream, Option, or Either.
globs: "**/*.ts"
alwaysApply: true

# Transforming Values with map
**Rule:** Use map to apply a pure function to the value inside an Effect, Stream, Option, or Either.

### Example
```typescript
import { Effect, Stream, Option, Either } from "effect";

// Effect: Transform the result of an effect
const effect = Effect.succeed(2).pipe(
  Effect.map((n) => n * 10)
); // Effect<number>

// Option: Transform an optional value
const option = Option.some(2).pipe(
  Option.map((n) => n * 10)
); // Option<number>

// Either: Transform a value that may be an error
const either = Either.right(2).pipe(
  Either.map((n) => n * 10)
); // Either<never, number>

// Stream: Transform every value in a stream
const stream = Stream.fromIterable([1, 2, 3]).pipe(
  Stream.map((n) => n * 10)
); // Stream<number>
```

**Explanation:**  
No matter which type you use, `map` lets you apply a function to the value inside, without changing the error or context.

**Explanation:**  
`map` is the most fundamental combinator in functional programming.  
It allows you to focus on *what* you want to do with a value, not *how* to extract it.  
The same mental model applies across all major Effect types.


---

### Mapping and Chaining over Collections with forEach and all
**ID:** mapping-and-chaining-over-collections-with-foreach-and-all
**Use Case:** N/A | **Skill Level:** N/A

description: Use forEach and all to process collections of values with effectful functions, collecting results in a type-safe and composable way.
globs: "**/*.ts"
alwaysApply: true

# Mapping and Chaining over Collections with forEach and all
**Rule:** Use forEach and all to process collections of values with effectful functions, collecting results in a type-safe and composable way.

### Example
```typescript
import { Effect, Either, Option, Stream } from "effect";

// Effect: Apply an effectful function to each item in an array
const numbers = [1, 2, 3];
const effect = Effect.forEach(numbers, (n) => Effect.succeed(n * 2));
// Effect<number[]>

// Effect: Run multiple effects in parallel and collect results
const effects = [Effect.succeed(1), Effect.succeed(2)];
const allEffect = Effect.all(effects, { concurrency: "unbounded" }); // Effect<[1, 2]>

// Option: Map over a collection of options and collect only the Some values
const options = [Option.some(1), Option.none(), Option.some(3)];
const filtered = options.filter(Option.isSome).map((o) => o.value); // [1, 3]

// Either: Collect all Right values from a collection of Eithers
const eithers = [Either.right(1), Either.left("fail"), Either.right(3)];
const rights = eithers.filter(Either.isRight); // [Either.Right(1), Either.Right(3)]

// Stream: Map and flatten a stream of arrays
const stream = Stream.fromIterable([
  [1, 2],
  [3, 4],
]).pipe(Stream.flatMap((arr) => Stream.fromIterable(arr))); // Stream<number>

```

**Explanation:**  
`forEach` and `all` let you process collections in a way that is composable, type-safe, and often parallel.  
They handle errors and context automatically, and can be used for batch jobs, parallel requests, or data transformations.

**Explanation:**  
Batch and parallel processing are common in real-world applications.  
These combinators let you express "do this for every item" declaratively, without manual loops or imperative control flow, and they preserve error handling and context propagation.


---

### Execute Asynchronous Effects with Effect.runPromise
**ID:** execute-asynchronous-effects-with-effect-runpromise
**Use Case:** N/A | **Skill Level:** N/A

description: Bridge effects to promises with Effect.runPromise
globs: "**/*.ts"
alwaysApply: false

# Execute Asynchronous Effects with Effect.runPromise
**Rule:** Execute asynchronous effects with Effect.runPromise.

### Example
```typescript
import { Effect } from "effect";

const program = Effect.succeed("Hello, World!").pipe(
  Effect.delay("1 second"),
);

const promise = Effect.runPromise(program);

promise.then(console.log); // Logs "Hello, World!" after 1 second.
```

**Explanation:**  
`Effect.runPromise` executes your effect and returns a Promise, making it easy to integrate with existing JavaScript async workflows.


---

### Creating from Synchronous and Callback Code
**ID:** creating-from-synchronous-and-callback-code
**Use Case:** N/A | **Skill Level:** N/A

description: Use sync and async to create Effects from synchronous or callback-based computations, making them composable and type-safe.
globs: "**/*.ts"
alwaysApply: true

# Creating from Synchronous and Callback Code
**Rule:** Use sync and async to create Effects from synchronous or callback-based computations, making them composable and type-safe.

### Example
```typescript
import { Effect } from "effect";

// Synchronous: Wrap a computation that is guaranteed not to throw
const effectSync = Effect.sync(() => Math.random()); // Effect<never, number, never>

// Callback-based: Wrap a Node.js-style callback API
function legacyReadFile(
  path: string,
  cb: (err: Error | null, data?: string) => void
) {
  setTimeout(() => cb(null, "file contents"), 10);
}

const effectAsync = Effect.async<string, Error>((resume) => {
  legacyReadFile("file.txt", (err, data) => {
    if (err) resume(Effect.fail(err));
    else if (data) resume(Effect.succeed(data));
  });
}); // Effect<string, Error, never>

```

**Explanation:**  
- `Effect.sync` is for synchronous computations that are guaranteed not to throw.
- `Effect.async` is for integrating callback-based APIs, converting them into Effects.

**Explanation:**  
Many APIs are synchronous or use callbacks instead of Promises.  
By lifting them into Effects, you gain access to all of Effect's combinators, error handling, and resource safety.


---

### Define Type-Safe Errors with Data.TaggedError
**ID:** define-type-safe-errors-with-datataggederror
**Use Case:** N/A | **Skill Level:** N/A

description: Define type-safe errors with Data.TaggedError.
globs: "**/*.ts"
alwaysApply: true

# Define Type-Safe Errors with Data.TaggedError
**Rule:** Define type-safe errors with Data.TaggedError.

### Example
```typescript
import { Data, Effect } from "effect"

// Define our tagged error type
class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly cause: unknown
}> {}

// Function that simulates a database error
const findUser = (id: number): Effect.Effect<{ id: number; name: string }, DatabaseError> =>
  Effect.gen(function* () {
    if (id < 0) {
      return yield* Effect.fail(new DatabaseError({ cause: "Invalid ID" }))
    }
    return { id, name: `User ${id}` }
  })

// Create a program that demonstrates error handling
const program = Effect.gen(function* () {
  // Try to find a valid user
  yield* Effect.logInfo("Looking up user 1...")
  yield* Effect.gen(function* () {
    const user = yield* findUser(1)
    yield* Effect.logInfo(`Found user: ${JSON.stringify(user)}`)
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logInfo(`Error finding user: ${error._tag} - ${error.cause}`)
    )
  )

  // Try to find an invalid user
  yield* Effect.logInfo("\nLooking up user -1...")
  yield* Effect.gen(function* () {
    const user = yield* findUser(-1)
    yield* Effect.logInfo(`Found user: ${JSON.stringify(user)}`)
  }).pipe(
    Effect.catchTag("DatabaseError", (error) =>
      Effect.logInfo(`Database error: ${error._tag} - ${error.cause}`)
    )
  )
})

// Run the program
Effect.runPromise(program)
```

**Explanation:**  
Tagged errors allow you to handle errors in a type-safe, self-documenting way.

**Explanation:**  
This gives each error a unique, literal `_tag` that Effect can use for type
discrimination with `Effect.catchTag`, making your error handling fully
type-safe.


---

### Execute Long-Running Apps with Effect.runFork
**ID:** execute-long-running-apps-with-effectrunfork
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect.runFork to launch a long-running application as a manageable, detached fiber.
globs: "**/*.ts"
alwaysApply: true

# Execute Long-Running Apps with Effect.runFork
**Rule:** Use Effect.runFork to launch a long-running application as a manageable, detached fiber.

### Example
This example starts a simple "server" that runs forever. We use `runFork` to launch it and then use the returned `Fiber` to shut it down gracefully after 5 seconds.

```typescript
import { Effect, Fiber } from "effect";

// A server that listens for requests forever
const server = Effect.log("Server received a request.").pipe(
  Effect.delay("1 second"),
  Effect.forever,
);

Effect.runSync(Effect.log("Starting server..."));

// Launch the server as a detached, top-level fiber
const appFiber = Effect.runFork(server);

// In a real app, you would listen for OS signals.
// Here, we simulate a shutdown signal after 5 seconds.
setTimeout(() => {
  const shutdownProgram = Effect.gen(function* () {
    yield* Effect.log("Shutdown signal received. Interrupting server fiber...");
    // This ensures all cleanup logic within the server effect would run.
    yield* Fiber.interrupt(appFiber);
  });
  Effect.runPromise(shutdownProgram);
}, 5000);
```

---

**Explanation:**  
Unlike `Effect.runPromise`, which waits for the effect to complete, `Effect.runFork` starts the effect and immediately returns a `Fiber`. This is the ideal way to run an application that is meant to run forever, because it gives you a handle to the process.

The most critical use case for this is enabling graceful shutdown. You can start your application with `runFork`, and then set up listeners for OS signals (like `SIGINT` for Ctrl+C). When a shutdown signal is received, you call `Fiber.interrupt` on the application fiber, which guarantees that all finalizers (like closing database connections) are run before the process exits.

---


---

### Understand Layers for Dependency Injection
**ID:** understand-layers-for-dependency-injection
**Use Case:** N/A | **Skill Level:** N/A

description: Understand that a Layer is a blueprint describing how to construct a service and its dependencies.
globs: "**/*.ts"
alwaysApply: true

# Understand Layers for Dependency Injection
**Rule:** Understand that a Layer is a blueprint describing how to construct a service and its dependencies.

### Example
Here, we define a `Notifier` service that requires a `Logger` to be built. The `NotifierLive` layer's type signature, `Layer<Logger, never, Notifier>`, clearly documents this dependency.

```typescript
import { Effect } from "effect";

// Define the Logger service with a default implementation
export class Logger extends Effect.Service<Logger>()(
  "Logger",
  {
    // Provide a synchronous implementation
    sync: () => ({
      log: (msg: string) => Effect.log(`LOG: ${msg}`)
    })
  }
) {}

// Define the Notifier service that depends on Logger
export class Notifier extends Effect.Service<Notifier>()(
  "Notifier",
  {
    // Provide an implementation that requires Logger
    effect: Effect.gen(function* () {
      const logger = yield* Logger;
      return {
        notify: (msg: string) => logger.log(`Notifying: ${msg}`)
      };
    }),
    // Specify dependencies
    dependencies: [Logger.Default]
  }
) {}

// Create a program that uses both services
const program = Effect.gen(function* () {
  const notifier = yield* Notifier;
  yield* notifier.notify("Hello, World!");
});

// Run the program with the default implementations
Effect.runPromise(
  Effect.provide(
    program,
    Notifier.Default
  )
);
```

---

**Explanation:**  
In Effect, you don't create service instances directly. Instead, you define `Layer`s that describe *how* to create them. This separation of declaration from implementation is the core of Effect's powerful dependency injection (DI) system.

This approach has several key benefits:
-   **Composability:** You can combine small, focused layers into a complete application layer (`Layer.merge`, `Layer.provide`).
-   **Declarative Dependencies:** A layer's type signature explicitly documents its own dependencies, making your application's architecture clear and self-documenting.
-   **Testability:** For testing, you can easily swap a "live" layer (e.g., one that connects to a real database) with a "test" layer (one that provides mock data) without changing any of your business logic.

---


---

### Process Items Concurrently
**ID:** process-items-concurrently
**Use Case:** N/A | **Skill Level:** N/A

description: Use Stream.mapEffect with the `concurrency` option to process stream items in parallel.
globs: "**/*.ts"
alwaysApply: true

# Process Items Concurrently
**Rule:** Use Stream.mapEffect with the `concurrency` option to process stream items in parallel.

### Example
This example processes four items, each taking one second. By setting `concurrency: 2`, the total runtime is approximately two seconds instead of four, because items are processed in parallel pairs.

```typescript
import { Effect, Stream } from 'effect';

// A mock function that simulates a slow I/O operation
const processItem = (id: number): Effect.Effect<string, Error> =>
  Effect.log(`Starting item ${id}...`).pipe(
    Effect.delay('1 second'),
    Effect.map(() => `Finished item ${id}`),
    Effect.tap(Effect.log)
  );

const ids = [1, 2, 3, 4];

const program = Stream.fromIterable(ids).pipe(
  // Process up to 2 items concurrently
  Stream.mapEffect(processItem, { concurrency: 2 }),
  Stream.runDrain
);

// Measure the total time taken
const timedProgram = Effect.timed(program);

const programWithLogging = Effect.gen(function* () {
  const [duration, _] = yield* timedProgram;
  const durationMs = Number(duration);
  yield* Effect.log(`\nTotal time: ${Math.round(durationMs / 1000)} seconds`);
  return duration;
}).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logError(`Program error: ${error}`);
      return null;
    })
  )
);

Effect.runPromise(programWithLogging);
/*
Output:
... level=INFO msg="Starting item 1..."
... level=INFO msg="Starting item 2..."
... level=INFO msg="Finished item 1"
... level=INFO msg="Starting item 3..."
... level=INFO msg="Finished item 2"
... level=INFO msg="Starting item 4..."
... level=INFO msg="Finished item 3"
... level=INFO msg="Finished item 4"

Total time: 2 seconds
*/
```

**Explanation:**  
For many data pipelines, the most time-consuming step is performing an I/O-bound operation for each item, such as calling an API or querying a database. Processing these items one by one (sequentially) is safe but slow, as the entire pipeline waits for each operation to complete before starting the next.

`Stream.mapEffect`'s `concurrency` option is the solution. It provides a simple, declarative way to introduce controlled parallelism into your pipeline.

1.  **Performance Boost**: It allows the stream to work on multiple items at once, drastically reducing the total execution time for I/O-bound tasks.
2.  **Controlled Parallelism**: Unlike `Promise.all` which runs everything at once, you specify the *exact* number of concurrent operations. This is crucial for stability, as it prevents your application from overwhelming downstream services or exhausting its own resources (like file handles or network sockets).
3.  **Automatic Backpressure**: The stream will not pull new items from the source faster than the concurrent slots can process them. This backpressure is handled automatically, preventing memory issues.
4.  **Structured Concurrency**: It's fully integrated with Effect's runtime. If any concurrent operation fails, all other in-flight operations for that stream are immediately and reliably interrupted, preventing wasted work and ensuring clean shutdowns.

---


---

### Understand that Effects are Lazy Blueprints
**ID:** understand-that-effects-are-lazy-blueprints
**Use Case:** N/A | **Skill Level:** N/A

description: Understand that effects are lazy blueprints.
globs: "**/*.ts"
alwaysApply: true

# Understand that Effects are Lazy Blueprints
**Rule:** Understand that effects are lazy blueprints.

### Example
```typescript
import { Effect } from "effect";

Effect.runSync(Effect.log("1. Defining the Effect blueprint..."));

const program = Effect.gen(function* () {
  yield* Effect.log("3. The blueprint is now being executed!");
  return 42;
});

const demonstrationProgram = Effect.gen(function* () {
  yield* Effect.log("2. The blueprint has been defined. No work has been done yet.");
  yield* program;
});

Effect.runSync(demonstrationProgram);
```

**Explanation:**  
Defining an `Effect` does not execute any code inside it. Only when you call
`Effect.runSync(program)` does the computation actually happen.

**Explanation:**  
This laziness is a superpower because it makes your code composable,
predictable, and testable. Unlike a `Promise` which executes immediately,
an `Effect` is just a description of work, like a recipe waiting for a chef.


---

### Matching on Success and Failure with match
**ID:** matching-on-success-and-failure-with-match
**Use Case:** N/A | **Skill Level:** N/A

description: Use match to pattern match on the result of an Effect, Option, or Either, handling both success and failure cases declaratively.
globs: "**/*.ts"
alwaysApply: true

# Matching on Success and Failure with match
**Rule:** Use match to pattern match on the result of an Effect, Option, or Either, handling both success and failure cases declaratively.

### Example
```typescript
import { Effect, Option, Either } from "effect";

// Effect: Handle both success and failure
const effect = Effect.fail("Oops!").pipe(
  Effect.match({
    onFailure: (err) => `Error: ${err}`,
    onSuccess: (value) => `Success: ${value}`,
  })
); // Effect<string>

// Option: Handle Some and None cases
const option = Option.some(42).pipe(
  Option.match({
    onNone: () => "No value",
    onSome: (n) => `Value: ${n}`,
  })
); // string

// Either: Handle Left and Right cases
const either = Either.left("fail").pipe(
  Either.match({
    onLeft: (err) => `Error: ${err}`,
    onRight: (value) => `Value: ${value}`,
  })
); // string
```

**Explanation:**  
- `Effect.match` lets you handle both the error and success channels in one place.
- `Option.match` and `Either.match` let you handle all possible cases for these types, making your code exhaustive and safe.

**Explanation:**  
Pattern matching with `match` keeps your code clear and type-safe, ensuring you handle all possible outcomes.  
It avoids scattered if/else or switch statements and makes your intent explicit.


---

### Process Items in Batches
**ID:** process-items-in-batches
**Use Case:** N/A | **Skill Level:** N/A

description: Use Stream.grouped(n) to transform a stream of items into a stream of batched chunks.
globs: "**/*.ts"
alwaysApply: true

# Process Items in Batches
**Rule:** Use Stream.grouped(n) to transform a stream of items into a stream of batched chunks.

### Example
This example processes 10 users. By using `Stream.grouped(5)`, it transforms the stream of 10 individual users into a stream of two chunks (each a batch of 5). The `saveUsersInBulk` function is then called only twice, once for each batch.

```typescript
import { Effect, Stream, Chunk } from 'effect';

// A mock function that simulates a bulk database insert
const saveUsersInBulk = (
  userBatch: Chunk.Chunk<{ id: number }>
): Effect.Effect<void, Error> =>
  Effect.log(
    `Saving batch of ${userBatch.length} users: ${Chunk.toArray(userBatch)
      .map((u) => u.id)
      .join(', ')}`
  );

const userIds = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));

const program = Stream.fromIterable(userIds).pipe(
  // Group the stream of users into batches of 5
  Stream.grouped(5),
  // Process each batch with our bulk save function
  Stream.mapEffect(saveUsersInBulk, { concurrency: 1 }),
  Stream.runDrain
);

Effect.runPromise(program);
/*
Output:
... level=INFO msg="Saving batch of 5 users: 1, 2, 3, 4, 5"
... level=INFO msg="Saving batch of 5 users: 6, 7, 8, 9, 10"
*/
```

**Explanation:**  
When interacting with external systems like databases or APIs, making one request per item is often incredibly inefficient. The network latency and overhead of each individual call can dominate the total processing time. Most high-performance systems offer bulk or batch endpoints to mitigate this.

`Stream.grouped(n)` provides a simple, declarative way to prepare your data for these bulk operations:

1.  **Performance Optimization**: It dramatically reduces the number of network roundtrips. A single API call with 100 items is far faster than 100 individual API calls.
2.  **Declarative Batching**: It abstracts away the tedious and error-prone manual logic of counting items, managing temporary buffers, and deciding when to send a batch.
3.  **Seamless Composition**: It transforms a `Stream<A>` into a `Stream<Chunk<A>>`. This new stream of chunks can be piped directly into `Stream.mapEffect`, allowing you to process each batch concurrently.
4.  **Handles Leftovers**: The operator automatically handles the final, smaller batch if the total number of items is not perfectly divisible by the batch size.

---


---

### Model Validated Domain Types with Brand
**ID:** model-validated-domain-types-with-brand
**Use Case:** N/A | **Skill Level:** N/A

description: Model validated domain types with Brand.
globs: "**/*.ts"
alwaysApply: true

# Model Validated Domain Types with Brand
**Rule:** Model validated domain types with Brand.

### Example
```typescript
import { Brand, Option } from "effect";

type Email = string & Brand.Brand<"Email">;

const makeEmail = (s: string): Option.Option<Email> =>
  s.includes("@") ? Option.some(s as Email) : Option.none();

// A function can now trust that its input is a valid email.
const sendEmail = (email: Email, body: string) => { /* ... */ };
```

**Explanation:**  
Branding ensures that only validated values are used, reducing bugs and
repetitive checks.

**Explanation:**  
This pattern moves validation to the boundaries of your system. Once a value
has been branded, the rest of your application can trust that it is valid,
eliminating repetitive checks.


---

### Wrap Asynchronous Computations with tryPromise
**ID:** wrap-asynchronous-computations-with-trypromise
**Use Case:** N/A | **Skill Level:** N/A

description: Wrap asynchronous computations with tryPromise.
globs: "**/*.ts"
alwaysApply: true

# Wrap Asynchronous Computations with tryPromise
**Rule:** Wrap asynchronous computations with tryPromise.

### Example
```typescript
import { Effect, Data } from "effect";

// Define error type using Data.TaggedError
class HttpError extends Data.TaggedError("HttpError")<{
  readonly message: string;
}> {}

// Define HTTP client service
export class HttpClient extends Effect.Service<HttpClient>()("HttpClient", {
  // Provide default implementation
  sync: () => ({
    getUrl: (url: string) =>
      Effect.tryPromise({
        try: () => fetch(url),
        catch: (error) =>
          new HttpError({ message: `Failed to fetch ${url}: ${error}` }),
      }),
  }),
}) {}

// Mock HTTP client for demonstration
export class MockHttpClient extends Effect.Service<MockHttpClient>()(
  "MockHttpClient",
  {
    sync: () => ({
      getUrl: (url: string) =>
        Effect.gen(function* () {
          yield* Effect.logInfo(`Fetching URL: ${url}`);

          // Simulate different responses based on URL
          if (url.includes("success")) {
            yield* Effect.logInfo("✅ Request successful");
            return new Response(JSON.stringify({ data: "success" }), {
              status: 200,
            });
          } else if (url.includes("error")) {
            yield* Effect.logInfo("❌ Request failed");
            return yield* Effect.fail(
              new HttpError({ message: "Server returned 500" })
            );
          } else {
            yield* Effect.logInfo("✅ Request completed");
            return new Response(JSON.stringify({ data: "mock response" }), {
              status: 200,
            });
          }
        }),
    }),
  }
) {}

// Demonstrate wrapping asynchronous computations
const program = Effect.gen(function* () {
  yield* Effect.logInfo("=== Wrapping Asynchronous Computations Demo ===");

  const client = yield* MockHttpClient;

  // Example 1: Successful request
  yield* Effect.logInfo("\n1. Successful request:");
  const response1 = yield* client
    .getUrl("https://api.example.com/success")
    .pipe(
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          yield* Effect.logError(`Request failed: ${error.message}`);
          return new Response("Error response", { status: 500 });
        })
      )
    );
  yield* Effect.logInfo(`Response status: ${response1.status}`);

  // Example 2: Failed request with error handling
  yield* Effect.logInfo("\n2. Failed request with error handling:");
  const response2 = yield* client.getUrl("https://api.example.com/error").pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Request failed: ${error.message}`);
        return new Response("Fallback response", { status: 200 });
      })
    )
  );
  yield* Effect.logInfo(`Fallback response status: ${response2.status}`);

  // Example 3: Multiple async operations
  yield* Effect.logInfo("\n3. Multiple async operations:");
  const results = yield* Effect.all(
    [
      client.getUrl("https://api.example.com/endpoint1"),
      client.getUrl("https://api.example.com/endpoint2"),
      client.getUrl("https://api.example.com/endpoint3"),
    ],
    { concurrency: 2 }
  ).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError(`One or more requests failed: ${error.message}`);
        return [];
      })
    )
  );
  yield* Effect.logInfo(`Completed ${results.length} requests`);

  yield* Effect.logInfo(
    "\n✅ Asynchronous computations demonstration completed!"
  );
});

// Run with mock implementation
Effect.runPromise(Effect.provide(program, MockHttpClient.Default));

```

**Explanation:**  
`Effect.tryPromise` wraps a `Promise`-returning function and safely handles
rejections, moving errors into the Effect's error channel.

**Explanation:**  
This is the standard bridge from the Promise-based world to Effect, allowing
you to leverage the massive `async/await` ecosystem safely.


---

### Chaining Computations with flatMap
**ID:** chaining-computations-with-flatmap
**Use Case:** N/A | **Skill Level:** N/A

description: Use flatMap to sequence computations, flattening nested structures and preserving error and context handling.
globs: "**/*.ts"
alwaysApply: true

# Chaining Computations with flatMap
**Rule:** Use flatMap to sequence computations, flattening nested structures and preserving error and context handling.

### Example
```typescript
import { Effect, Stream, Option, Either } from "effect";

// Effect: Chain two effectful computations
const effect = Effect.succeed(2).pipe(
  Effect.flatMap((n) => Effect.succeed(n * 10))
); // Effect<number>

// Option: Chain two optional computations
const option = Option.some(2).pipe(
  Option.flatMap((n) => Option.some(n * 10))
); // Option<number>

// Either: Chain two computations that may fail
const either = Either.right(2).pipe(
  Either.flatMap((n) => Either.right(n * 10))
); // Either<never, number>

// Stream: Chain streams (flattening)
const stream = Stream.fromIterable([1, 2]).pipe(
  Stream.flatMap((n) => Stream.fromIterable([n, n * 10]))
); // Stream<number>
```

**Explanation:**  
`flatMap` lets you build pipelines where each step can depend on the result of the previous one, and the structure is always flattened—no `Option<Option<A>>` or `Effect<Effect<A>>`.

**Explanation:**  
`flatMap` is the key to sequencing dependent steps in functional programming.  
It allows you to express workflows where each step may fail, be optional, or produce multiple results, and ensures that errors and context are handled automatically.


---

### Handle Unexpected Errors by Inspecting the Cause
**ID:** handle-unexpected-errors-by-inspecting-the-cause
**Use Case:** N/A | **Skill Level:** N/A

description: Use Cause to inspect, analyze, and handle all possible failure modes of an Effect, including expected errors, defects, and interruptions.
globs: "**/*.ts"
alwaysApply: true

# Handle Unexpected Errors by Inspecting the Cause
**Rule:** Use Cause to inspect, analyze, and handle all possible failure modes of an Effect, including expected errors, defects, and interruptions.

### Example
```typescript
import { Cause, Effect } from "effect";

// An Effect that may fail with an error or defect
const program = Effect.try({
  try: () => {
    throw new Error("Unexpected failure!");
  },
  catch: (err) => err,
});

// Catch all causes and inspect them
const handled = program.pipe(
  Effect.catchAllCause((cause) =>
    Effect.sync(() => {
      if (Cause.isDie(cause)) {
        console.error("Defect (die):", Cause.pretty(cause));
      } else if (Cause.isFailure(cause)) {
        console.error("Expected error:", Cause.pretty(cause));
      } else if (Cause.isInterrupted(cause)) {
        console.error("Interrupted:", Cause.pretty(cause));
      }
      // Handle or rethrow as needed
    })
  )
);

```

**Explanation:**  
- `Cause` distinguishes between expected errors (`fail`), defects (`die`), and interruptions.
- Use `Cause.pretty` for human-readable error traces.
- Enables advanced error handling and debugging.

**Explanation:**  
Traditional error handling often loses information about *why* a failure occurred.  
`Cause` preserves the full error context, enabling advanced debugging, error reporting, and robust recovery strategies.


---

### Add Custom Metrics to Your Application
**ID:** add-custom-metrics-to-your-application
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect's Metric module to define and update custom metrics for business and performance monitoring.
globs: "**/*.ts"
alwaysApply: true

# Add Custom Metrics to Your Application
**Rule:** Use Effect's Metric module to define and update custom metrics for business and performance monitoring.

### Example
```typescript
import { Effect, Metric, MetricBoundaries } from "effect";

// Define a counter metric for processed jobs
const jobsProcessed = Metric.counter("jobs_processed");

// Increment the counter when a job is processed
const processJob = Effect.gen(function* () {
  // ... process the job
  yield* Effect.log("Job processed");
  yield* Metric.increment(jobsProcessed);
});

// Define a gauge for current active users
const activeUsers = Metric.gauge("active_users");

// Update the gauge when users sign in or out
const userSignedIn = Metric.set(activeUsers, 1);
const userSignedOut = Metric.set(activeUsers, -1);

// Define a histogram for request durations
const requestDuration = Metric.histogram(
  "request_duration",
  MetricBoundaries.linear({ start: 0, width: 1, count: 6 })
);

// Record a request duration
const recordDuration = (duration: number) =>
  Metric.update(requestDuration, duration);

```

**Explanation:**  
- `Metric.counter` tracks counts of events.
- `Metric.gauge` tracks a value that can go up or down (e.g., active users).
- `Metric.histogram` tracks distributions (e.g., request durations).
- `Effect.updateMetric` updates the metric in your workflow.

**Explanation:**  
Metrics provide quantitative insight into your application's behavior and performance.  
By instrumenting your code with metrics, you can monitor key events, detect anomalies, and drive business decisions.


---

### Create a Managed Runtime for Scoped Resources
**ID:** create-a-managed-runtime-for-scoped-resources
**Use Case:** N/A | **Skill Level:** N/A

description: Create a managed runtime for scoped resources.
globs: "**/*.ts"
alwaysApply: true

# Create a Managed Runtime for Scoped Resources
**Rule:** Create a managed runtime for scoped resources.

### Example
```typescript
import { Effect, Layer } from "effect";

class DatabasePool extends Effect.Service<DatabasePool>()(
  "DbPool",
  {
    effect: Effect.gen(function* () {
      yield* Effect.log("Acquiring pool");
      return {
        query: () => Effect.succeed("result")
      };
    })
  }
) {}

// Create a program that uses the DatabasePool service
const program = Effect.gen(function* () {
  const db = yield* DatabasePool;
  yield* Effect.log("Using DB");
  yield* db.query();
});

// Run the program with the service implementation
Effect.runPromise(
  program.pipe(
    Effect.provide(DatabasePool.Default),
    Effect.scoped
  )
);
```

**Explanation:**  
`Layer.launch` ensures that resources are acquired and released safely, even
in the event of errors or interruptions.

**Explanation:**  
`Layer.launch` is designed for resource safety. It acquires all resources,
provides them to your effect, and—crucially—guarantees that all registered
finalizers are executed upon completion or interruption.


---

### Distinguish 'Not Found' from Errors
**ID:** distinguish-not-found-from-errors
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect<Option<A>> to distinguish between recoverable 'not found' cases and actual failures.
globs: "**/*.ts"
alwaysApply: true

# Distinguish 'Not Found' from Errors
**Rule:** Use Effect<Option<A>> to distinguish between recoverable 'not found' cases and actual failures.

### Example
This function to find a user can fail if the database is down, or it can succeed but find no user. The return type ``Effect.Effect<Option.Option<User>, DatabaseError>`` makes this contract perfectly clear.

````typescript
import { Effect, Option, Data } from "effect"

interface User {
  id: number
  name: string
}
class DatabaseError extends Data.TaggedError("DatabaseError") {}

// This signature is extremely honest about its possible outcomes.
const findUserInDb = (
  id: number
): Effect.Effect<Option.Option<User>, DatabaseError> =>
  Effect.gen(function* () {
    // This could fail with a DatabaseError
    const dbResult = yield* Effect.try({
      try: () => (id === 1 ? { id: 1, name: "Paul" } : null),
      catch: () => new DatabaseError()
    })

    // We wrap the potentially null result in an Option
    return Option.fromNullable(dbResult)
  })

// The caller can now handle all three cases explicitly.
const program = (id: number) =>
  findUserInDb(id).pipe(
    Effect.flatMap((maybeUser) =>
      Option.match(maybeUser, {
        onNone: () =>
          Effect.logInfo(`Result: User with ID ${id} was not found.`),
        onSome: (user) =>
          Effect.logInfo(`Result: Found user ${user.name}.`)
      })
    ),
    Effect.catchAll((error) =>
      Effect.logInfo("Error: Could not connect to the database.")
    )
  )

// Run the program with different IDs
Effect.runPromise(
  Effect.gen(function* () {
    // Try with existing user
    yield* Effect.logInfo("Looking for user with ID 1...")
    yield* program(1)

    // Try with non-existent user
    yield* Effect.logInfo("\nLooking for user with ID 2...")
    yield* program(2)
  })
)
````

**Explanation:**  
This pattern provides a precise way to handle three distinct outcomes of an operation:

1.  **Success with a value:** `Effect.succeed(Option.some(value))`
2.  **Success with no value:** `Effect.succeed(Option.none())` (e.g., user not found)
3.  **Failure:** `Effect.fail(new DatabaseError())` (e.g., database connection lost)

By using `Option` inside the success channel of an `Effect`, you keep the error channel clean for true, unexpected, or unrecoverable errors. The "not found" case is often an expected and recoverable part of your business logic, and `Option.none()` models this perfectly.

---


---

### Type Classes for Equality, Ordering, and Hashing with Data.Class
**ID:** type-classes-for-equality-ordering-and-hashing-with-dataclass
**Use Case:** N/A | **Skill Level:** N/A

description: Use Data.Class to define and derive type classes for your data types, supporting composable equality, ordering, and hashing.
globs: "**/*.ts"
alwaysApply: true

# Type Classes for Equality, Ordering, and Hashing with Data.Class
**Rule:** Use Data.Class to define and derive type classes for your data types, supporting composable equality, ordering, and hashing.

### Example
```typescript
import { Data, Equal, HashSet } from "effect";

// Define custom data types with structural equality
const user1 = Data.struct({ id: 1, name: "Alice" });
const user2 = Data.struct({ id: 1, name: "Alice" });
const user3 = Data.struct({ id: 2, name: "Bob" });

// Data.struct provides automatic structural equality
console.log(Equal.equals(user1, user2)); // true (same structure)
console.log(Equal.equals(user1, user3)); // false (different values)

// Use in a HashSet (works because Data.struct implements Equal)
const set = HashSet.make(user1);
console.log(HashSet.has(set, user2)); // true (structural equality)

// Create an array and use structural equality
const users = [user1, user3];
console.log(users.some((u) => Equal.equals(u, user2))); // true

```

**Explanation:**  
- `Data.Class.getEqual` derives an equality type class for your data type.
- `Data.Class.getOrder` derives an ordering type class, useful for sorting.
- `Data.Class.getHash` derives a hash function for use in sets and maps.
- These type classes make your types fully compatible with Effect’s collections and algorithms.

**Explanation:**  
Type classes like `Equal`, `Order`, and `Hash` provide a principled way to define how your types are compared, ordered, and hashed.  
This is essential for using your types in sets, maps, and for sorting or deduplication.


---

### Define Contracts Upfront with Schema
**ID:** define-contracts-upfront-with-schema
**Use Case:** N/A | **Skill Level:** N/A

description: Define contracts upfront with schema.
globs: "**/*.ts"
alwaysApply: true

# Define Contracts Upfront with Schema
**Rule:** Define contracts upfront with schema.

### Example
```typescript
import { Schema, Effect, Data } from "effect"

// Define User schema and type
const UserSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String
})

type User = Schema.Schema.Type<typeof UserSchema>

// Define error type
class UserNotFound extends Data.TaggedError("UserNotFound")<{
  readonly id: number
}> {}

// Create database service implementation
export class Database extends Effect.Service<Database>()(
  "Database",
  {
    sync: () => ({
      getUser: (id: number) =>
        id === 1
          ? Effect.succeed({ id: 1, name: "John" })
          : Effect.fail(new UserNotFound({ id }))
    })
  }
) {}

// Create a program that demonstrates schema and error handling
const program = Effect.gen(function* () {
  const db = yield* Database
  
  // Try to get an existing user
  yield* Effect.logInfo("Looking up user 1...")
  const user1 = yield* db.getUser(1)
  yield* Effect.logInfo(`Found user: ${JSON.stringify(user1)}`)
  
  // Try to get a non-existent user
  yield* Effect.logInfo("\nLooking up user 999...")
  yield* Effect.logInfo("Attempting to get user 999...")
  yield* Effect.gen(function* () {
    const user = yield* db.getUser(999)
    yield* Effect.logInfo(`Found user: ${JSON.stringify(user)}`)
  }).pipe(
    Effect.catchAll((error) => {
      if (error instanceof UserNotFound) {
        return Effect.logInfo(`Error: User with id ${error.id} not found`)
      }
      return Effect.logInfo(`Unexpected error: ${error}`)
    })
  )

  // Try to decode invalid data
  yield* Effect.logInfo("\nTrying to decode invalid user data...")
  const invalidUser = { id: "not-a-number", name: 123 } as any
  yield* Effect.gen(function* () {
    const user = yield* Schema.decode(UserSchema)(invalidUser)
    yield* Effect.logInfo(`Decoded user: ${JSON.stringify(user)}`)
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logInfo(`Validation failed:\n${JSON.stringify(error, null, 2)}`)
    )
  )
})

// Run the program
Effect.runPromise(
  Effect.provide(program, Database.Default)
)
```

**Explanation:**  
Defining schemas upfront clarifies your contracts and ensures both type safety
and runtime validation.

**Explanation:**  
This "schema-first" approach separates the "what" (the data shape) from the
"how" (the implementation). It provides a single source of truth for both
compile-time static types and runtime validation.


---

### Handle Errors with catchTag, catchTags, and catchAll
**ID:** handle-errors-with-catchtag-catchtags-and-catchall
**Use Case:** N/A | **Skill Level:** N/A

description: Handle errors with catchTag, catchTags, and catchAll.
globs: "**/*.ts"
alwaysApply: true

# Handle Errors with catchTag, catchTags, and catchAll
**Rule:** Handle errors with catchTag, catchTags, and catchAll.

### Example
```typescript
import { Data, Effect } from "effect";

// Define domain types
interface User {
  readonly id: string;
  readonly name: string;
}

// Define specific error types
class NetworkError extends Data.TaggedError("NetworkError")<{
  readonly url: string;
  readonly code: number;
}> { }

class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly field: string;
  readonly message: string;
}> { }

class NotFoundError extends Data.TaggedError("NotFoundError")<{
  readonly id: string;
}> { }

// Define UserService
class UserService extends Effect.Service<UserService>()("UserService", {
  sync: () => ({
    // Fetch user data
    fetchUser: (
      id: string
    ): Effect.Effect<User, NetworkError | NotFoundError> =>
      Effect.gen(function* () {
        yield* Effect.logInfo(`Fetching user with id: ${id}`);

        if (id === "invalid") {
          const url = "/api/users/" + id;
          yield* Effect.logWarning(`Network error accessing: ${url}`);
          return yield* Effect.fail(new NetworkError({ url, code: 500 }));
        }

        if (id === "missing") {
          yield* Effect.logWarning(`User not found: ${id}`);
          return yield* Effect.fail(new NotFoundError({ id }));
        }

        const user = { id, name: "John Doe" };
        yield* Effect.logInfo(`Found user: ${JSON.stringify(user)}`);
        return user;
      }),

    // Validate user data
    validateUser: (user: User): Effect.Effect<string, ValidationError> =>
      Effect.gen(function* () {
        yield* Effect.logInfo(`Validating user: ${JSON.stringify(user)}`);

        if (user.name.length < 3) {
          yield* Effect.logWarning(
            `Validation failed: name too short for user ${user.id}`
          );
          return yield* Effect.fail(
            new ValidationError({ field: "name", message: "Name too short" })
          );
        }

        const message = `User ${user.name} is valid`;
        yield* Effect.logInfo(message);
        return message;
      }),
  }),
}) { }

// Compose operations with error handling using catchTags
const processUser = (
  userId: string
): Effect.Effect<string, never, UserService> =>
  Effect.gen(function* () {
    const userService = yield* UserService;

    yield* Effect.logInfo(`=== Processing user ID: ${userId} ===`);

    const result = yield* userService.fetchUser(userId).pipe(
      Effect.flatMap(userService.validateUser),
      // Handle different error types with specific recovery logic
      Effect.catchTags({
        NetworkError: (e) =>
          Effect.gen(function* () {
            const message = `Network error: ${e.code} for ${e.url}`;
            yield* Effect.logError(message);
            return message;
          }),
        NotFoundError: (e) =>
          Effect.gen(function* () {
            const message = `User ${e.id} not found`;
            yield* Effect.logWarning(message);
            return message;
          }),
        ValidationError: (e) =>
          Effect.gen(function* () {
            const message = `Invalid ${e.field}: ${e.message}`;
            yield* Effect.logWarning(message);
            return message;
          }),
      })
    );

    yield* Effect.logInfo(`Result: ${result}`);
    return result;
  });

// Test with different scenarios
const runTests = Effect.gen(function* () {
  yield* Effect.logInfo("=== Starting User Processing Tests ===");

  const testCases = ["valid", "invalid", "missing"];
  const results = yield* Effect.forEach(testCases, (id) => processUser(id));

  yield* Effect.logInfo("=== User Processing Tests Complete ===");
  return results;
});

// Run the program
Effect.runPromise(Effect.provide(runTests, UserService.Default));

```

**Explanation:**  
Use `catchTag` to handle specific error types in a type-safe, composable way.

**Explanation:**  
Effect's structured error handling allows you to build resilient applications.
By using tagged errors and `catchTag`, you can handle different failure
scenarios with different logic in a type-safe way.


---

### Build a Basic HTTP Server
**ID:** build-a-basic-http-server
**Use Case:** N/A | **Skill Level:** N/A

description: Use a managed Runtime created from a Layer to handle requests in a Node.js HTTP server.
globs: "**/*.ts"
alwaysApply: true

# Build a Basic HTTP Server
**Rule:** Use a managed Runtime created from a Layer to handle requests in a Node.js HTTP server.

### Example
This example creates a simple server with a `Greeter` service. The server starts, creates a runtime containing the `Greeter`, and then uses that runtime to handle requests.

```typescript
import { HttpServer, HttpServerResponse } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { Duration, Effect, Fiber, Layer } from "effect"
import { createServer } from "node:http"

// Create a server layer using Node's built-in HTTP server
const ServerLive = NodeHttpServer.layer(() => createServer(), { port: 3001 })

// Define your HTTP app (here responding "Hello World" to every request)
const app = Effect.gen(function* () {
  yield* Effect.logInfo("Received HTTP request")
  return yield* HttpServerResponse.text("Hello World")
})

const serverLayer = HttpServer.serve(app).pipe(Layer.provide(ServerLive));

const program = Effect.gen(function* () {
  yield* Effect.logInfo("Server starting on http://localhost:3001")
  const fiber = yield* Layer.launch(serverLayer).pipe(Effect.fork)
  yield* Effect.sleep(Duration.seconds(2))
  yield* Fiber.interrupt(fiber)
  yield* Effect.logInfo("Server shutdown complete")
})

Effect.runPromise(program as unknown as Effect.Effect<void, unknown, never>);
```

---

**Explanation:**  
This pattern demonstrates the complete lifecycle of a long-running Effect application.
1.  **Setup Phase:** You define all your application's dependencies (database connections, clients, config) in `Layer`s and compose them into a single `AppLayer`.
2.  **Runtime Creation:** You use `Layer.toRuntime(AppLayer)` to create a highly-optimized `Runtime` object. This is done *once* when the server starts.
3.  **Request Handling:** For each incoming request, you create an `Effect` that describes the work to be done (e.g., parse request, call services, create response).
4.  **Execution:** You use the `Runtime` you created in the setup phase to execute the request-handling `Effect` using `Runtime.runPromise`.

This architecture ensures that your request handling logic is fully testable, benefits from structured concurrency, and is completely decoupled from the server's setup and infrastructure.

---


---

### Solve Promise Problems with Effect
**ID:** solve-promise-problems-with-effect
**Use Case:** N/A | **Skill Level:** N/A

description: Recognize that Effect solves the core limitations of Promises: untyped errors, no dependency injection, and no cancellation.
globs: "**/*.ts"
alwaysApply: true

# Solve Promise Problems with Effect
**Rule:** Recognize that Effect solves the core limitations of Promises: untyped errors, no dependency injection, and no cancellation.

### Example
This code is type-safe, testable, and cancellable. The signature `Effect.Effect<User, DbError, HttpClient>` tells us everything we need to know.

```typescript
import { Effect, Data } from "effect";

interface DbErrorType {
  readonly _tag: "DbError";
  readonly message: string;
}

const DbError = Data.tagged<DbErrorType>("DbError");

interface User {
  name: string;
}

class HttpClient extends Effect.Service<HttpClient>()("HttpClient", {
  sync: () => ({
    findById: (id: number): Effect.Effect<User, DbErrorType> =>
      Effect.try({
        try: () => ({ name: `User ${id}` }),
        catch: () => DbError({ message: "Failed to find user" }),
      }),
  }),
}) {}

const findUser = (id: number) =>
  Effect.gen(function* () {
    const client = yield* HttpClient;
    return yield* client.findById(id);
  });

// Demonstrate how Effect solves promise problems
const program = Effect.gen(function* () {
  yield* Effect.logInfo("=== Solving Promise Problems with Effect ===");

  // Problem 1: Proper error handling (no more try/catch hell)
  yield* Effect.logInfo("1. Demonstrating type-safe error handling:");

  const result1 = yield* findUser(123).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logInfo(`Handled error: ${error.message}`);
        return { name: "Default User" };
      })
    )
  );
  yield* Effect.logInfo(`Found user: ${result1.name}`);

  // Problem 2: Easy composition and chaining
  yield* Effect.logInfo("\n2. Demonstrating easy composition:");

  const composedOperation = Effect.gen(function* () {
    const user1 = yield* findUser(1);
    const user2 = yield* findUser(2);
    yield* Effect.logInfo(`Composed result: ${user1.name} and ${user2.name}`);
    return [user1, user2];
  });

  yield* composedOperation;

  // Problem 3: Resource management and cleanup
  yield* Effect.logInfo("\n3. Demonstrating resource management:");

  const resourceOperation = Effect.gen(function* () {
    yield* Effect.logInfo("Acquiring resource...");
    const resource = "database-connection";

    yield* Effect.addFinalizer(() => Effect.logInfo("Cleaning up resource..."));

    const user = yield* findUser(456);
    yield* Effect.logInfo(`Used resource to get: ${user.name}`);

    return user;
  }).pipe(Effect.scoped);

  yield* resourceOperation;

  yield* Effect.logInfo("\n✅ All operations completed successfully!");
});

Effect.runPromise(Effect.provide(program, HttpClient.Default));

```

---

**Explanation:**  
While `async/await` is great for simple cases, building large, robust applications with `Promise`s reveals these critical gaps. Effect addresses each one directly:

-   **Typed Errors:** The `E` channel in `Effect<A, E, R>` forces you to handle specific, known error types, eliminating an entire class of runtime bugs.
-   **Dependency Injection:** The `R` channel provides a powerful, built-in system for declaring and providing dependencies (`Layer`s), making your code modular and testable.
-   **Cancellation (Interruption):** Effect's structured concurrency and `Fiber` model provide robust, built-in cancellation. When an effect is interrupted, Effect guarantees that its cleanup logic (finalizers) will be run.

Understanding that Effect was built specifically to solve these problems is key to appreciating its design and power.

---


---

### Execute Long-Running Apps with Effect.runFork
**ID:** execute-long-running-apps-with-effect-runfork
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect.runFork to launch a long-running application as a manageable, detached fiber.
globs: "**/*.ts"
alwaysApply: true

# Execute Long-Running Apps with Effect.runFork
**Rule:** Use Effect.runFork to launch a long-running application as a manageable, detached fiber.

### Example
This example starts a simple "server" that runs forever. We use `runFork` to launch it and then use the returned `Fiber` to shut it down gracefully after 5 seconds.

```typescript
import { Effect, Fiber } from "effect";

// A server that listens for requests forever
const server = Effect.log("Server received a request.").pipe(
  Effect.delay("1 second"),
  Effect.forever,
);

console.log("Starting server...");

// Launch the server as a detached, top-level fiber
const appFiber = Effect.runFork(server);

// In a real app, you would listen for OS signals.
// Here, we simulate a shutdown signal after 5 seconds.
setTimeout(() => {
  console.log("Shutdown signal received. Interrupting server fiber...");
  // This ensures all cleanup logic within the server effect would run.
  Effect.runPromise(Fiber.interrupt(appFiber));
}, 5000);
```

---

---

### Work with Dates and Times using DateTime
**ID:** work-with-dates-and-times-using-datetime
**Use Case:** N/A | **Skill Level:** N/A

description: Use DateTime to represent and manipulate dates and times in a type-safe, immutable, and time-zone-aware way.
globs: "**/*.ts"
alwaysApply: true

# Work with Dates and Times using DateTime
**Rule:** Use DateTime to represent and manipulate dates and times in a type-safe, immutable, and time-zone-aware way.

### Example
```typescript
import { DateTime } from "effect";

// Create a DateTime for the current instant (returns an Effect)
import { Effect } from "effect";

const program = Effect.gen(function* () {
  const now = yield* DateTime.now; // DateTime.Utc

  // Parse from ISO string
  const parsed = DateTime.unsafeMakeZoned("2024-07-19T12:34:56Z"); // DateTime.Zoned

  // Add or subtract durations
  const inOneHour = DateTime.add(now, { hours: 1 });
  const oneHourAgo = DateTime.subtract(now, { hours: 1 });

  // Format as ISO string
  const iso = DateTime.formatIso(now); // e.g., "2024-07-19T23:33:19.000Z"

  // Compare DateTimes
  const isBefore = DateTime.lessThan(oneHourAgo, now); // true

  return { now, inOneHour, oneHourAgo, iso, isBefore };
});

```

**Explanation:**  
- `DateTime` is immutable and time-zone-aware.
- Supports parsing, formatting, arithmetic, and comparison.
- Use for all date/time logic to avoid bugs with native `Date`.

**Explanation:**  
JavaScript's native `Date` is mutable, not time-zone-aware, and can be error-prone.  
`DateTime` provides an immutable, functional alternative with explicit time zone handling and robust APIs for time arithmetic.


---

### Accessing the Current Time with Clock
**ID:** accessing-the-current-time-with-clock
**Use Case:** N/A | **Skill Level:** N/A

description: Use the Clock service to get the current time, enabling deterministic testing with TestClock.
globs: "**/*.ts"
alwaysApply: true

# Accessing the Current Time with Clock
**Rule:** Use the Clock service to get the current time, enabling deterministic testing with TestClock.

### Example
This example shows a function that checks if a token is expired. Its logic depends on `Clock`, making it fully testable.

```typescript
import { Effect, Clock, Duration } from "effect";

interface Token {
  readonly value: string;
  readonly expiresAt: number; // UTC milliseconds
}

// This function is pure and testable because it depends on Clock
const isTokenExpired = (token: Token): Effect.Effect<boolean, never, Clock.Clock> =>
  Clock.currentTimeMillis.pipe(
    Effect.map((now) => now > token.expiresAt),
    Effect.tap((expired) => 
      Clock.currentTimeMillis.pipe(
        Effect.flatMap((currentTime) => 
          Effect.log(`Token expired? ${expired} (current time: ${new Date(currentTime).toISOString()})`)
        )
      )
    )
  );

// Create a test clock service that advances time
const makeTestClock = (timeMs: number): Clock.Clock => ({
  currentTimeMillis: Effect.succeed(timeMs),
  currentTimeNanos: Effect.succeed(BigInt(timeMs * 1_000_000)),
  sleep: (duration: Duration.Duration) => Effect.succeed(void 0),
  unsafeCurrentTimeMillis: () => timeMs,
  unsafeCurrentTimeNanos: () => BigInt(timeMs * 1_000_000),
  [Clock.ClockTypeId]: Clock.ClockTypeId,
});

// Create a token that expires in 1 second
const token = { value: "abc", expiresAt: Date.now() + 1000 };

// Check token expiry with different clocks
const program = Effect.gen(function* () {
  // Check with current time
  yield* Effect.log("Checking with current time...");
  yield* isTokenExpired(token);

  // Check with past time
  yield* Effect.log("\nChecking with past time (1 minute ago)...");
  const pastClock = makeTestClock(Date.now() - 60_000);
  yield* isTokenExpired(token).pipe(
    Effect.provideService(Clock.Clock, pastClock)
  );

  // Check with future time
  yield* Effect.log("\nChecking with future time (1 hour ahead)...");
  const futureClock = makeTestClock(Date.now() + 3600_000);
  yield* isTokenExpired(token).pipe(
    Effect.provideService(Clock.Clock, futureClock)
  );
});

// Run the program with default clock
Effect.runPromise(
  program.pipe(
    Effect.provideService(Clock.Clock, makeTestClock(Date.now()))
  )
);
```

---

**Explanation:**  
Directly calling `Date.now()` makes your code impure and tightly coupled to the system clock. This makes testing difficult and unreliable, as the output of your function will change every time it's run.

The `Clock` service is Effect's solution to this problem. It's an abstraction for "the current time."
-   In **production**, the default `Live` `Clock` implementation uses the real system time.
-   In **tests**, you can provide the `TestClock` layer. This gives you a virtual clock that you can manually control, allowing you to set the time to a specific value or advance it by a specific duration.

This makes any time-dependent logic pure, deterministic, and easy to test with perfect precision.

---


---

### Mocking Dependencies in Tests
**ID:** mocking-dependencies-in-tests
**Use Case:** N/A | **Skill Level:** N/A

description: Provide mock service implementations via a test-specific Layer to isolate the unit under test.
globs: "**/*.ts"
alwaysApply: true

# Mocking Dependencies in Tests
**Rule:** Provide mock service implementations via a test-specific Layer to isolate the unit under test.

### Example
We want to test a `Notifier` service that uses an `EmailClient` to send emails. In our test, we provide a mock `EmailClient` that doesn't actually send emails but just returns a success value.

```typescript
import { Effect, Layer } from "effect";

// --- The Services ---
interface EmailClientService {
  send: (address: string, body: string) => Effect.Effect<void>
}

class EmailClient extends Effect.Service<EmailClientService>()(
  "EmailClient",
  {
    sync: () => ({
      send: (address: string, body: string) => 
        Effect.sync(() => Effect.log(`Sending email to ${address}: ${body}`))
    })
  }
) {}

interface NotifierService {
  notifyUser: (userId: number, message: string) => Effect.Effect<void>
}

class Notifier extends Effect.Service<NotifierService>()(
  "Notifier",
  {
    effect: Effect.gen(function* () {
      const emailClient = yield* EmailClient;
      return {
        notifyUser: (userId: number, message: string) =>
          emailClient.send(`user-${userId}@example.com`, message)
      };
    }),
    dependencies: [EmailClient.Default]
  }
) {}

// Create a program that uses the Notifier service
const program = Effect.gen(function* () {
  yield* Effect.log("Using default EmailClient implementation...");
  const notifier = yield* Notifier;
  yield* notifier.notifyUser(123, "Your invoice is ready.");

  // Create mock EmailClient that logs differently
  yield* Effect.log("\nUsing mock EmailClient implementation...");
  const mockEmailClient = Layer.succeed(
    EmailClient,
    {
      send: (address: string, body: string) =>
        // Directly return the Effect.log without nesting it in Effect.sync
        Effect.log(`MOCK: Would send to ${address} with body: ${body}`)
    } as EmailClientService
  );

  // Run the same notification with mock client
  yield* Effect.gen(function* () {
    const notifier = yield* Notifier;
    yield* notifier.notifyUser(123, "Your invoice is ready.");
  }).pipe(
    Effect.provide(mockEmailClient)
  );
});

// Run the program
Effect.runPromise(
  Effect.provide(program, Notifier.Default)
);
```

---

**Explanation:**  
The primary goal of a unit test is to verify the logic of a single unit of code, independent of its external dependencies. Effect's dependency injection system is designed to make this easy and type-safe.

By providing a mock `Layer` in your test, you replace a real dependency (like an `HttpClient` that makes network calls) with a fake one that returns predictable data. This provides several key benefits:
-   **Determinism:** Your tests always produce the same result, free from the flakiness of network or database connections.
-   **Speed:** Tests run instantly without waiting for slow I/O operations.
-   **Type Safety:** The TypeScript compiler ensures your mock implementation perfectly matches the real service's interface, preventing your tests from becoming outdated.
-   **Explicitness:** The test setup clearly documents all the dependencies required for the code to run.

---


---

### Create a Service Layer from a Managed Resource
**ID:** create-a-service-layer-from-a-managed-resource
**Use Case:** N/A | **Skill Level:** N/A

description: Provide a managed resource to the application context using `Layer.scoped`.
globs: "**/*.ts"
alwaysApply: true

# Create a Service Layer from a Managed Resource
**Rule:** Provide a managed resource to the application context using `Layer.scoped`.

### Example
```typescript
import { Effect, Console } from "effect";

// 1. Define the service interface
interface DatabaseService {
  readonly query: (sql: string) => Effect.Effect<string[], never, never>
}

// 2. Define the service implementation with scoped resource management
class Database extends Effect.Service<DatabaseService>()(
  "Database",
  {
    // The scoped property manages the resource lifecycle
    scoped: Effect.gen(function* () {
      const id = Math.floor(Math.random() * 1000);
      
      // Acquire the connection
      yield* Effect.log(`[Pool ${id}] Acquired`);
      
      // Setup cleanup to run when scope closes
      yield* Effect.addFinalizer(() => Effect.log(`[Pool ${id}] Released`));
      
      // Return the service implementation
      return {
        query: (sql: string) => Effect.sync(() => 
          [`Result for '${sql}' from pool ${id}`]
        )
      };
    })
  }
) {}

// 3. Use the service in your program
const program = Effect.gen(function* () {
  const db = yield* Database;
  const users = yield* db.query("SELECT * FROM users");
  yield* Effect.log(`Query successful: ${users[0]}`);
});

// 4. Run the program with scoped resource management
Effect.runPromise(
  Effect.scoped(program).pipe(
    Effect.provide(Database.Default)
  )
);

/*
Output:
[Pool 458] Acquired
Query successful: Result for 'SELECT * FROM users' from pool 458
[Pool 458] Released
*/
```

**Explanation:**
The `Effect.Service` helper creates the `Database` class, which acts as both the service definition and its context key (Tag). The `Database.Live` layer connects this service to a concrete, lifecycle-managed implementation. When `program` asks for the `Database` service, the Effect runtime uses the `Live` layer to run the `acquire` effect once, caches the resulting `DbPool`, and injects it. The `release` effect is automatically run when the program completes.

**Explanation:**  
This pattern is the key to building robust, testable, and leak-proof applications in Effect. It elevates a managed resource into a first-class service that can be used anywhere in your application. The `Effect.Service` helper simplifies defining the service's interface and context key. This approach decouples your business logic from the concrete implementation, as the logic only depends on the abstract service. The `Layer` declaratively handles the resource's entire lifecycle, ensuring it is acquired lazily, shared safely, and released automatically.


---

### Modeling Effect Results with Exit
**ID:** modeling-effect-results-with-exit
**Use Case:** N/A | **Skill Level:** N/A

description: Use Exit to capture the outcome of an Effect, including success, failure, and defects, for robust error handling and coordination.
globs: "**/*.ts"
alwaysApply: true

# Modeling Effect Results with Exit
**Rule:** Use Exit to capture the outcome of an Effect, including success, failure, and defects, for robust error handling and coordination.

### Example
```typescript
import { Effect, Exit } from "effect";

// Run an Effect and capture its Exit value
const program = Effect.succeed(42);

const runAndCapture = Effect.runPromiseExit(program); // Promise<Exit<never, number>>

// Pattern match on Exit
runAndCapture.then((exit) => {
  if (Exit.isSuccess(exit)) {
    console.log("Success:", exit.value);
  } else if (Exit.isFailure(exit)) {
    console.error("Failure:", exit.cause);
  }
});
```

**Explanation:**  
- `Exit` captures both success (`Exit.success(value)`) and failure (`Exit.failure(cause)`).
- Use `Exit` for robust error handling, supervision, and coordination of concurrent effects.
- Pattern matching on `Exit` lets you handle all possible outcomes.

**Explanation:**  
When running or supervising effects, you often need to know not just if they succeeded or failed, but *how* they failed (e.g., error vs. defect).  
`Exit` provides a complete, type-safe summary of an effect's outcome.


---

### Instrument and Observe Function Calls with Effect.fn
**ID:** instrument-and-observe-function-calls-with-effectfn
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect.fn to wrap functions with effectful instrumentation, such as logging, metrics, or tracing, in a composable and type-safe way.
globs: "**/*.ts"
alwaysApply: true

# Instrument and Observe Function Calls with Effect.fn
**Rule:** Use Effect.fn to wrap functions with effectful instrumentation, such as logging, metrics, or tracing, in a composable and type-safe way.

### Example
```typescript
import { Effect } from "effect";

// A simple function to instrument
function add(a: number, b: number): number {
  return a + b;
}

// Wrap the function with Effect.fn to add logging and tracking
const addWithLogging = (a: number, b: number) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Calling add with ${a} and ${b}`);
    const result = add(a, b);
    yield* Effect.logInfo(`Result: ${result}`);
    return result;
  });

// Use the instrumented function in an Effect workflow
const program = addWithLogging(2, 3).pipe(
  Effect.tap((sum) => Effect.logInfo(`Sum is ${sum}`))
);

// Run the program (commented to avoid runtime issues)
// Effect.runPromise(program);

```

**Explanation:**  
- `Effect.fn` wraps a function, returning a new function that produces an Effect.
- You can add logging, metrics, tracing, or any effectful logic before/after the call.
- Keeps instrumentation separate from business logic and fully composable.

**Explanation:**  
Instrumenting function calls is essential for observability, especially in complex or critical code paths.  
`Effect.fn` lets you add effectful logic (logging, metrics, tracing, etc.) before, after, or around any function call, without changing the function’s core logic.


---

### Implement Graceful Shutdown for Your Application
**ID:** implement-graceful-shutdown-for-your-application
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect.runFork and OS signal listeners to implement graceful shutdown for long-running applications.
globs: "**/*.ts"
alwaysApply: true

# Implement Graceful Shutdown for Your Application
**Rule:** Use Effect.runFork and OS signal listeners to implement graceful shutdown for long-running applications.

### Example
This example creates a server with a "scoped" database connection. It uses `runFork` to start the server and sets up a `SIGINT` handler to interrupt the server fiber, which in turn guarantees the database finalizer is called.

```typescript
import { Effect, Layer, Fiber, Context, Scope } from "effect";
import * as http from "http";

// 1. A service with a finalizer for cleanup
class Database extends Effect.Service<Database>()("Database", {
  effect: Effect.gen(function* () {
    yield* Effect.log("Acquiring DB connection");
    return {
      query: () => Effect.succeed("data"),
    };
  }),
}) {}

// 2. The main server logic
const server = Effect.gen(function* () {
  const db = yield* Database;

  // Create server with proper error handling
  const httpServer = yield* Effect.sync(() => {
    const server = http.createServer((_req, res) => {
      Effect.runFork(
        Effect.provide(
          db.query().pipe(Effect.map((data) => res.end(data))),
          Database.Default
        )
      );
    });
    return server;
  });

  // Add a finalizer to close the server
  yield* Effect.addFinalizer(() =>
    Effect.gen(function* () {
      httpServer.close();
      yield* Effect.log("Server closed");
    })
  );

  // Start server with error handling
  yield* Effect.async<void, Error>((resume) => {
    httpServer.once('error', (err: Error) => {
      resume(Effect.fail(new Error(`Failed to start server: ${err.message}`)));
    });

    httpServer.listen(3456, () => {
      resume(Effect.succeed(void 0));
    });
  });

  yield* Effect.log("Server started on port 3456. Press Ctrl+C to exit.");

  // For testing purposes, we'll run for a short time instead of forever
  yield* Effect.sleep("2 seconds");
  yield* Effect.log("Shutting down gracefully...");
});

// 3. Provide the layer and launch with runFork
const app = Effect.provide(server.pipe(Effect.scoped), Database.Default);

// 4. Run the app and handle shutdown
Effect.runPromise(app).catch((error) => {
  Effect.runSync(Effect.logError("Application error: " + error));
  process.exit(1);
});

```

---

**Explanation:**  
When a server process is terminated, you need to ensure that it cleans up properly. This includes closing database connections, finishing in-flight requests, and releasing file handles. Failing to do so can lead to resource leaks or data corruption.

Effect's structured concurrency makes this robust and easy. When a fiber is interrupted, Effect guarantees that it will run all finalizers registered within that fiber's scope, in the reverse order they were acquired.

By launching your app with `runFork`, you get a `Fiber` that represents the entire application. Triggering `Fiber.interrupt` on this top-level fiber initiates a clean, orderly shutdown sequence for all its resources.

---


---

### Create Pre-resolved Effects with succeed and fail
**ID:** create-pre-resolved-effects-with-succeed-and-fail
**Use Case:** N/A | **Skill Level:** N/A

description: Create pre-resolved effects with succeed and fail.
globs: "**/*.ts"
alwaysApply: true

# Create Pre-resolved Effects with succeed and fail
**Rule:** Create pre-resolved effects with succeed and fail.

### Example
```typescript
import { Effect, Data } from "effect"

// Create a custom error type
class MyError extends Data.TaggedError("MyError") {}

// Create a program that demonstrates pre-resolved effects
const program = Effect.gen(function* () {
  // Success effect
  yield* Effect.logInfo("Running success effect...")
  yield* Effect.gen(function* () {
    const value = yield* Effect.succeed(42)
    yield* Effect.logInfo(`Success value: ${value}`)
  })

  // Failure effect
  yield* Effect.logInfo("\nRunning failure effect...")
  yield* Effect.gen(function* () {
    // Use return yield* for effects that never succeed
    return yield* Effect.fail(new MyError())
  }).pipe(
    Effect.catchTag("MyError", (error) =>
      Effect.logInfo(`Error occurred: ${error._tag}`)
    )
  )
})

// Run the program
Effect.runPromise(program)
```

**Explanation:**  
Use `Effect.succeed` for values you already have, and `Effect.fail` for
immediate, known errors.

**Explanation:**  
These are the simplest effect constructors, essential for returning static
values within functions that must return an `Effect`.


---

### Extract Path Parameters
**ID:** extract-path-parameters
**Use Case:** N/A | **Skill Level:** N/A

description: Define routes with colon-prefixed parameters (e.g., /users/:id) and access their values within the handler.
globs: "**/*.ts"
alwaysApply: true

# Extract Path Parameters
**Rule:** Define routes with colon-prefixed parameters (e.g., /users/:id) and access their values within the handler.

### Example
This example defines a route that captures a `userId`. The handler for this route accesses the parsed parameters and uses the `userId` to construct a personalized greeting. The router automatically makes the parameters available to the handler.

```typescript
import { Data, Effect } from 'effect'

// Define tagged error for invalid paths
interface InvalidPathErrorSchema {
  readonly _tag: "InvalidPathError"
  readonly path: string
}

const makeInvalidPathError = (path: string): InvalidPathErrorSchema => ({
  _tag: "InvalidPathError",
  path
})

// Define service interface
interface PathOps {
  readonly extractUserId: (path: string) => Effect.Effect<string, InvalidPathErrorSchema>
  readonly greetUser: (userId: string) => Effect.Effect<string>
}

// Create service
class PathService extends Effect.Service<PathService>()(
  "PathService",
  {
    sync: () => ({
      extractUserId: (path: string) =>
        Effect.gen(function* () {
          yield* Effect.logInfo(`Attempting to extract user ID from path: ${path}`)
          
          const match = path.match(/\/users\/([^/]+)/);
          if (!match) {
            yield* Effect.logInfo(`No user ID found in path: ${path}`)
            return yield* Effect.fail(makeInvalidPathError(path))
          }
          
          const userId = match[1];
          yield* Effect.logInfo(`Successfully extracted user ID: ${userId}`)
          return userId
        }),

      greetUser: (userId: string) =>
        Effect.gen(function* () {
          const greeting = `Hello, user ${userId}!`
          yield* Effect.logInfo(greeting)
          return greeting
        })
    })
  }
) {}

// Compose the functions with proper error handling
const processPath = (path: string): Effect.Effect<string, InvalidPathErrorSchema, PathService> =>
  Effect.gen(function* () {
    const pathService = yield* PathService
    yield* Effect.logInfo(`Processing path: ${path}`)
    const userId = yield* pathService.extractUserId(path)
    return yield* pathService.greetUser(userId)
  })

// Run examples with proper error handling
const program = Effect.gen(function* () {
  // Test valid paths
  yield* Effect.logInfo("=== Testing valid paths ===")
  const result1 = yield* processPath('/users/123')
  yield* Effect.logInfo(`Result 1: ${result1}`)
  
  const result2 = yield* processPath('/users/abc')
  yield* Effect.logInfo(`Result 2: ${result2}`)
  
  // Test invalid path
  yield* Effect.logInfo("\n=== Testing invalid path ===")
  const result3 = yield* processPath('/invalid/path').pipe(
    Effect.catchTag("InvalidPathError", (error) =>
      Effect.succeed(`Error: Invalid path ${error.path}`)
    )
  )
  yield* Effect.logInfo(result3)
})

Effect.runPromise(
  Effect.provide(program, PathService.Default)
)
```

**Explanation:**  
APIs often need to operate on specific resources identified by a unique key in the URL, such as `/products/123` or `/orders/abc`. The `Http.router` provides a clean, declarative way to handle these dynamic paths without resorting to manual string parsing.

By defining parameters directly in the path string, you gain several benefits:

1.  **Declarative**: The route's structure is immediately obvious from its definition. The code clearly states, "this route expects a dynamic segment here."
2.  **Safe and Robust**: The router handles the logic of extracting the parameter. This is less error-prone and more robust than manually splitting or using regular expressions on the URL string.
3.  **Clean Handler Logic**: The business logic inside your handler is separated from the concern of URL parsing. The handler simply receives the parameters it needs to do its job.
4.  **Composability**: This pattern composes perfectly with the rest of the `Http` module, allowing you to build complex and well-structured APIs.

---


---

### Execute Synchronous Effects with Effect.runSync
**ID:** execute-synchronous-effects-with-effect-runsync
**Use Case:** N/A | **Skill Level:** N/A

description: Run fully synchronous computations with Effect.runSync
globs: "**/*.ts"
alwaysApply: false

# Execute Synchronous Effects with Effect.runSync
**Rule:** Execute synchronous effects with Effect.runSync.

### Example
```typescript
import { Effect } from "effect"

// Simple synchronous program
const program1 = Effect.sync(() => {
  const n = 10
  const result = n * 2
  console.log(`Simple program result: ${result}`)
  return result
})

// Run simple program
Effect.runSync(program1)

// Program with logging
const program2 = Effect.gen(function* () {
  yield* Effect.logInfo("Starting calculation...")
  const n = yield* Effect.sync(() => 10)
  yield* Effect.logInfo(`Got number: ${n}`)
  const result = yield* Effect.sync(() => n * 2)
  yield* Effect.logInfo(`Result: ${result}`)
  return result
})

// Run with logging
Effect.runSync(program2)

// Program with error handling
const program3 = Effect.gen(function* () {
  yield* Effect.logInfo("Starting division...")
  const n = yield* Effect.sync(() => 10)
  const divisor = yield* Effect.sync(() => 0)
  
  yield* Effect.logInfo(`Attempting to divide ${n} by ${divisor}...`)
  return yield* Effect.try({
    try: () => {
      if (divisor === 0) throw new Error("Cannot divide by zero")
      return n / divisor
    },
    catch: (error) => {
      if (error instanceof Error) {
        return error
      }
      return new Error("Unknown error occurred")
    }
  })
}).pipe(
  Effect.catchAll((error) =>
    Effect.logInfo(`Error occurred: ${error.message}`)
  )
)

// Run with error handling
Effect.runSync(program3)
```

**Explanation:**  
Use `runSync` only for Effects that are fully synchronous. If the Effect contains async code, use `runPromise` instead.


---

### Handling Errors with catchAll, orElse, and match
**ID:** handling-errors-with-catchall-orelse-and-match
**Use Case:** N/A | **Skill Level:** N/A

description: Use error handling combinators to recover from failures, provide fallback values, or transform errors in a composable way.
globs: "**/*.ts"
alwaysApply: true

# Handling Errors with catchAll, orElse, and match
**Rule:** Use error handling combinators to recover from failures, provide fallback values, or transform errors in a composable way.

### Example
```typescript
import { Effect, Option, Either } from "effect";

// Effect: Recover from any error
const effect = Effect.fail("fail!").pipe(
  Effect.catchAll((err) => Effect.succeed(`Recovered from: ${err}`))
); // Effect<string>

// Option: Provide a fallback if value is None
const option = Option.none().pipe(
  Option.orElse(() => Option.some("default"))
); // Option<string>

// Either: Provide a fallback if value is Left
const either = Either.left("error").pipe(
  Either.orElse(() => Either.right("fallback"))
); // Either<never, string>

// Effect: Pattern match on success or failure
const matchEffect = Effect.fail("fail!").pipe(
  Effect.match({
    onFailure: (err) => `Error: ${err}`,
    onSuccess: (value) => `Success: ${value}`,
  })
); // Effect<string>
```

**Explanation:**  
These combinators let you handle errors, provide defaults, or transform error values in a way that is composable and type-safe.  
You can recover from errors, provide alternative computations, or pattern match on success/failure.

**Explanation:**  
Error handling is a first-class concern in functional programming.  
By using combinators, you keep error recovery logic close to where errors may occur, and avoid scattering try/catch or null checks throughout your code.


---

### Model Dependencies as Services
**ID:** model-dependencies-as-services
**Use Case:** N/A | **Skill Level:** N/A

description: Model dependencies as services.
globs: "**/*.ts"
alwaysApply: true

# Model Dependencies as Services
**Rule:** Model dependencies as services.

### Example
```typescript
import { Effect } from "effect";

// Define Random service with production implementation as default
export class Random extends Effect.Service<Random>()(
  "Random",
  {
    // Default production implementation
    sync: () => ({
      next: Effect.sync(() => Math.random())
    })
  }
) {}

// Example usage
const program = Effect.gen(function* () {
  const random = yield* Random;
  const value = yield* random.next;
  return value;
});

// Run with default implementation
const programWithLogging = Effect.gen(function* () {
  const value = yield* Effect.provide(program, Random.Default);
  yield* Effect.log(`Random value: ${value}`);
  return value;
});

Effect.runPromise(programWithLogging);
```

**Explanation:**  
By modeling dependencies as services, you can easily substitute mocked or deterministic implementations for testing, leading to more reliable and predictable tests.

**Explanation:**  
This pattern is the key to testability. It allows you to provide a `Live` implementation in production and a `Test` implementation (returning mock data) in your tests, making your code decoupled and reliable.


---

### Use Chunk for High-Performance Collections
**ID:** use-chunk-for-high-performance-collections
**Use Case:** N/A | **Skill Level:** N/A

description: Prefer Chunk over Array for immutable collection operations within data processing pipelines for better performance.
globs: "**/*.ts"
alwaysApply: true

# Use Chunk for High-Performance Collections
**Rule:** Prefer Chunk over Array for immutable collection operations within data processing pipelines for better performance.

### Example
This example shows how to create and manipulate a `Chunk`. The API is very similar to `Array`, but the underlying performance characteristics for these immutable operations are superior.

```typescript
import { Chunk, Effect } from "effect";

// Create a Chunk from an array
let numbers = Chunk.fromIterable([1, 2, 3, 4, 5]);

// Append a new element. This is much faster than [...arr, 6] on large collections.
numbers = Chunk.append(numbers, 6);

// Prepend an element.
numbers = Chunk.prepend(numbers, 0);

// Take the first 3 elements
const firstThree = Chunk.take(numbers, 3);

// Convert back to an array when you need to interface with other libraries
const finalArray = Chunk.toReadonlyArray(firstThree);

Effect.runSync(Effect.log(finalArray)); // [0, 1, 2]
```

---

**Explanation:**  
JavaScript's `Array` is a mutable data structure. Every time you perform an "immutable" operation like `[...arr, newItem]` or `arr.map(...)`, you are creating a brand new array and copying all the elements from the old one. For small arrays, this is fine. For large arrays or in hot code paths, this constant allocation and copying can become a performance bottleneck.

`Chunk` is designed to solve this. It's an immutable data structure that uses structural sharing internally. When you append an item to a `Chunk`, it doesn't re-copy the entire collection. Instead, it creates a new `Chunk` that reuses most of the internal structure of the original, only allocating memory for the new data. This makes immutable appends and updates significantly faster.

---


---

### Use .pipe for Composition
**ID:** use-pipe-for-composition
**Use Case:** N/A | **Skill Level:** N/A

description: Use .pipe for composition.
globs: "**/*.ts"
alwaysApply: true

# Use .pipe for Composition
**Rule:** Use .pipe for composition.

### Example
```typescript
import { Effect } from "effect";

const program = Effect.succeed(5).pipe(
  Effect.map((n) => n * 2),
  Effect.map((n) => `The result is ${n}`),
  Effect.tap(Effect.log)
);

// Demonstrate various pipe composition patterns
const demo = Effect.gen(function* () {
  yield* Effect.log("=== Using Pipe for Composition Demo ===");

  // 1. Basic pipe composition
  yield* Effect.log("\n1. Basic pipe composition:");
  yield* program;

  // 2. Complex pipe composition with multiple transformations
  yield* Effect.log("\n2. Complex pipe composition:");
  const complexResult = yield* Effect.succeed(10).pipe(
    Effect.map((n) => n + 5),
    Effect.map((n) => n * 2),
    Effect.tap((n) => Effect.log(`Intermediate result: ${n}`)),
    Effect.map((n) => n.toString()),
    Effect.map((s) => `Final: ${s}`)
  );
  yield* Effect.log("Complex result: " + complexResult);

  // 3. Pipe with flatMap for chaining effects
  yield* Effect.log("\n3. Pipe with flatMap for chaining effects:");
  const chainedResult = yield* Effect.succeed("hello").pipe(
    Effect.map((s) => s.toUpperCase()),
    Effect.flatMap((s) => Effect.succeed(`${s} WORLD`)),
    Effect.flatMap((s) => Effect.succeed(`${s}!`)),
    Effect.tap((s) => Effect.log(`Chained: ${s}`))
  );
  yield* Effect.log("Chained result: " + chainedResult);

  // 4. Pipe with error handling
  yield* Effect.log("\n4. Pipe with error handling:");
  const errorHandledResult = yield* Effect.succeed(-1).pipe(
    Effect.flatMap((n) =>
      n > 0 ? Effect.succeed(n) : Effect.fail(new Error("Negative number"))
    ),
    Effect.catchAll((error) =>
      Effect.succeed("Handled error: " + error.message)
    ),
    Effect.tap((result) => Effect.log(`Error handled: ${result}`))
  );
  yield* Effect.log("Error handled result: " + errorHandledResult);

  // 5. Pipe with multiple operations
  yield* Effect.log("\n5. Pipe with multiple operations:");
  const multiOpResult = yield* Effect.succeed([1, 2, 3, 4, 5]).pipe(
    Effect.map((arr) => arr.filter((n) => n % 2 === 0)),
    Effect.map((arr) => arr.map((n) => n * 2)),
    Effect.map((arr) => arr.reduce((sum, n) => sum + n, 0)),
    Effect.tap((sum) => Effect.log(`Sum of even numbers doubled: ${sum}`))
  );
  yield* Effect.log("Multi-operation result: " + multiOpResult);

  yield* Effect.log("\n✅ Pipe composition demonstration completed!");
});

Effect.runPromise(demo);

```

**Explanation:**  
Using `.pipe()` allows you to compose operations in a top-to-bottom style,
improving readability and maintainability.

**Explanation:**  
Piping makes code readable and avoids deeply nested function calls. It allows
you to see the flow of data transformations in a clear, linear fashion.


---

### Combining Values with zip
**ID:** combining-values-with-zip
**Use Case:** N/A | **Skill Level:** N/A

description: Use zip to run two computations and combine their results into a tuple, preserving error and context handling.
globs: "**/*.ts"
alwaysApply: true

# Combining Values with zip
**Rule:** Use zip to run two computations and combine their results into a tuple, preserving error and context handling.

### Example
```typescript
import { Effect, Stream, Option, Either } from "effect";

// Effect: Combine two effects and get both results
const effectA = Effect.succeed(1);
const effectB = Effect.succeed("hello");
const zippedEffect = effectA.pipe(
  Effect.zip(effectB)
); // Effect<[number, string]>

// Option: Combine two options, only Some if both are Some
const optionA = Option.some(1);
const optionB = Option.some("hello");
const zippedOption = Option.all([optionA, optionB]); // Option<[number, string]>

// Either: Combine two eithers, only Right if both are Right
const eitherA = Either.right(1);
const eitherB = Either.right("hello");
const zippedEither = Either.all([eitherA, eitherB]); // Either<never, [number, string]>

// Stream: Pair up values from two streams
const streamA = Stream.fromIterable([1, 2, 3]);
const streamB = Stream.fromIterable(["a", "b", "c"]);
const zippedStream = streamA.pipe(
  Stream.zip(streamB)
); // Stream<[number, string]>
```

**Explanation:**  
`zip` runs both computations and pairs their results.  
If either computation fails (or is None/Left/empty), the result is a failure (or None/Left/empty).

**Explanation:**  
`zip` lets you compose computations that are independent but whose results you want to use together.  
It preserves error handling and context, and keeps your code declarative and type-safe.


---

### Run a Pipeline for its Side Effects
**ID:** run-a-pipeline-for-its-side-effects
**Use Case:** N/A | **Skill Level:** N/A

description: Use Stream.runDrain to execute a stream for its side effects when you don't need the final values.
globs: "**/*.ts"
alwaysApply: true

# Run a Pipeline for its Side Effects
**Rule:** Use Stream.runDrain to execute a stream for its side effects when you don't need the final values.

### Example
This example creates a stream of tasks. For each task, it performs a side effect (logging it as "complete"). `Stream.runDrain` executes the pipeline, ensuring all logs are written, but without collecting the `void` results of each logging operation.

```typescript
import { Effect, Stream } from 'effect';

const tasks = ['task 1', 'task 2', 'task 3'];

// A function that performs a side effect for a task
const completeTask = (task: string): Effect.Effect<void, never> =>
  Effect.log(`Completing ${task}`);

const program = Stream.fromIterable(tasks).pipe(
  // For each task, run the side-effectful operation
  Stream.mapEffect(completeTask, { concurrency: 1 }),
  // Run the stream for its effects, discarding the `void` results
  Stream.runDrain
);

const programWithLogging = Effect.gen(function* () {
  yield* program;
  yield* Effect.log('\nAll tasks have been processed.');
});

Effect.runPromise(programWithLogging);
/*
Output:
... level=INFO msg="Completing task 1"
... level=INFO msg="Completing task 2"
... level=INFO msg="Completing task 3"

All tasks have been processed.
*/
```

**Explanation:**  
Not all pipelines are designed to produce a final list of values. Often, the goal is to perform an action for each item—write it to a database, send it to a message queue, or log it to a file. In these "fire and forget" scenarios, collecting the results is not just unnecessary; it's a performance anti-pattern.

`Stream.runDrain` is the perfect tool for this job:

1.  **Memory Efficiency**: This is its primary advantage. `runDrain` processes each item and then immediately discards it, resulting in constant, minimal memory usage. This makes it the only safe choice for processing extremely large or infinite streams.
2.  **Clarity of Intent**: Using `runDrain` clearly communicates that you are interested in the successful execution of the stream's effects, not in its output values. The final `Effect` it produces resolves to `void`, reinforcing that no value is returned.
3.  **Performance**: By avoiding the overhead of allocating and managing a growing list in memory, `runDrain` can be faster for pipelines with a very large number of small items.

---


---

### Redact and Handle Sensitive Data
**ID:** redact-and-handle-sensitive-data
**Use Case:** N/A | **Skill Level:** N/A

description: Use Redacted to wrap sensitive values, preventing accidental exposure in logs or error messages.
globs: "**/*.ts"
alwaysApply: true

# Redact and Handle Sensitive Data
**Rule:** Use Redacted to wrap sensitive values, preventing accidental exposure in logs or error messages.

### Example
```typescript
import { Redacted } from "effect";

// Wrap a sensitive value
const secret = Redacted.make("super-secret-password");

// Use the secret in your application logic
function authenticate(user: string, password: Redacted.Redacted<string>) {
  // ... authentication logic
}

// Logging or stringifying a Redacted value
console.log(`Password: ${secret}`); // Output: Password: <redacted>
console.log(String(secret)); // Output: <redacted>

```

**Explanation:**  
- `Redacted.make(value)` wraps a sensitive value.
- When logged or stringified, the value is replaced with `<redacted>`.
- Prevents accidental exposure of secrets in logs or error messages.

**Explanation:**  
Sensitive data should never appear in logs, traces, or error messages.  
`Redacted` provides a type-safe way to mark and protect secrets throughout your application.


---

### Handle Flaky Operations with Retries and Timeouts
**ID:** handle-flaky-operations-with-retries-and-timeouts
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect.retry and Effect.timeout to build resilience against slow or intermittently failing effects.
globs: "**/*.ts"
alwaysApply: true

# Handle Flaky Operations with Retries and Timeouts
**Rule:** Use Effect.retry and Effect.timeout to build resilience against slow or intermittently failing effects.

### Example
This program attempts to fetch data from a flaky API. It will retry the request up to 3 times with increasing delays if it fails. It will also give up entirely if any single attempt takes longer than 2 seconds.

```typescript
import { Data, Duration, Effect, Schedule } from "effect";

// Define domain types
interface ApiResponse {
  readonly data: string;
}

// Define error types
class ApiError extends Data.TaggedError("ApiError")<{
  readonly message: string;
  readonly attempt: number;
}> { }

class TimeoutError extends Data.TaggedError("TimeoutError")<{
  readonly duration: string;
  readonly attempt: number;
}> { }

// Define API service
class ApiService extends Effect.Service<ApiService>()(
  "ApiService",
  {
    sync: () => ({
      // Flaky API call that might fail or be slow
      fetchData: (): Effect.Effect<ApiResponse, ApiError | TimeoutError> =>
        Effect.gen(function* () {
          const attempt = Math.floor(Math.random() * 5) + 1;
          yield* Effect.logInfo(`Attempt ${attempt}: Making API call...`);

          if (Math.random() > 0.3) {
            yield* Effect.logWarning(`Attempt ${attempt}: API call failed`);
            return yield* Effect.fail(new ApiError({
              message: "API Error",
              attempt
            }));
          }

          const delay = Math.random() * 3000;
          yield* Effect.logInfo(`Attempt ${attempt}: API call will take ${delay.toFixed(0)}ms`);

          yield* Effect.sleep(Duration.millis(delay));

          const response = { data: "some important data" };
          yield* Effect.logInfo(`Attempt ${attempt}: API call succeeded with data: ${JSON.stringify(response)}`);
          return response;
        })
    })
  }
) { }

// Define retry policy: exponential backoff, up to 3 retries
const retryPolicy = Schedule.exponential(Duration.millis(100)).pipe(
  Schedule.compose(Schedule.recurs(3)),
  Schedule.tapInput((error: ApiError | TimeoutError) =>
    Effect.logWarning(`Retrying after error: ${error._tag} (Attempt ${error.attempt})`)
  )
);

// Create program with proper error handling
const program = Effect.gen(function* () {
  const api = yield* ApiService;

  yield* Effect.logInfo("=== Starting API calls with retry and timeout ===");

  // Make multiple test calls
  for (let i = 1; i <= 3; i++) {
    yield* Effect.logInfo(`\n--- Test Call ${i} ---`);

    const result = yield* api.fetchData().pipe(
      Effect.timeout(Duration.seconds(2)),
      Effect.catchTag("TimeoutException", () =>
        Effect.fail(new TimeoutError({ duration: "2 seconds", attempt: i }))
      ),
      Effect.retry(retryPolicy),
      Effect.catchTags({
        ApiError: (error) =>
          Effect.gen(function* () {
            yield* Effect.logError(`All retries failed: ${error.message} (Last attempt: ${error.attempt})`);
            return { data: "fallback data due to API error" } as ApiResponse;
          }),
        TimeoutError: (error) =>
          Effect.gen(function* () {
            yield* Effect.logError(`All retries timed out after ${error.duration} (Last attempt: ${error.attempt})`);
            return { data: "fallback data due to timeout" } as ApiResponse;
          })
      })
    );

    yield* Effect.logInfo(`Result: ${JSON.stringify(result)}`);
  }

  yield* Effect.logInfo("\n=== API calls complete ===");
});

// Run the program
Effect.runPromise(
  Effect.provide(program, ApiService.Default)
);
```

---

**Explanation:**  
In distributed systems, failure is normal. APIs can fail intermittently, and network latency can spike. Hard-coding your application to try an operation only once makes it brittle.

-   **Retries:** The `Effect.retry` operator, combined with a `Schedule` policy, provides a powerful, declarative way to handle transient failures. Instead of writing complex `try/catch` loops, you can simply define a policy like "retry 3 times, with an exponential backoff delay between attempts."

-   **Timeouts:** An operation might not fail, but instead hang indefinitely. `Effect.timeout` prevents this by racing your effect against a timer. If your effect doesn't complete within the specified duration, it is automatically interrupted, preventing your application from getting stuck.

Combining these two patterns is a best practice for any interaction with an external service.

---


---

### Accumulate Multiple Errors with Either
**ID:** accumulate-multiple-errors-with-either
**Use Case:** N/A | **Skill Level:** N/A

description: Use Either to accumulate multiple validation errors instead of failing on the first one.
globs: "**/*.ts"
alwaysApply: true

# Accumulate Multiple Errors with Either
**Rule:** Use Either to accumulate multiple validation errors instead of failing on the first one.

### Example
Using `Schema.decode` with the `allErrors: true` option demonstrates this pattern perfectly. The underlying mechanism uses `Either` to collect all parsing errors into an array instead of stopping at the first one.

````typescript
import { Effect, Schema, Data, Either } from "effect";

// Define validation error type
class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly field: string;
  readonly message: string;
}> {}

// Define user type
type User = {
  name: string;
  email: string;
};

// Define schema with custom validation
const UserSchema = Schema.Struct({
  name: Schema.String.pipe(
    Schema.minLength(3),
    Schema.filter((name) => /^[A-Za-z\s]+$/.test(name), {
      message: () => "name must contain only letters and spaces"
    })
  ),
  email: Schema.String.pipe(
    Schema.pattern(/@/),
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: () => "email must be a valid email address"
    })
  ),
});

// Example inputs
const invalidInputs: User[] = [
  {
    name: "Al", // Too short
    email: "bob-no-at-sign.com", // Invalid pattern
  },
  {
    name: "John123", // Contains numbers
    email: "john@incomplete", // Invalid email
  },
  {
    name: "Alice Smith", // Valid
    email: "alice@example.com", // Valid
  }
];

// Validate a single user
const validateUser = (input: User) =>
  Effect.gen(function* () {
    const result = yield* Schema.decode(UserSchema)(input, { errors: "all" });
    return result;
  });

// Process multiple users and accumulate all errors
const program = Effect.gen(function* () {
  yield* Effect.log("Validating users...\n");
  
  for (const input of invalidInputs) {
    const result = yield* Effect.either(validateUser(input));
    
    yield* Effect.log(`Validating user: ${input.name} <${input.email}>`);
    
    // Handle success and failure cases separately for clarity
    // Using Either.match which is the idiomatic way to handle Either values
    yield* Either.match(result, {
      onLeft: (error) => Effect.gen(function* () {
        yield* Effect.log("❌ Validation failed:");
        yield* Effect.log(error.message);
        yield* Effect.log(""); // Empty line for readability
      }),
      onRight: (user) => Effect.gen(function* () {
        yield* Effect.log(`✅ User is valid: ${JSON.stringify(user)}`);
        yield* Effect.log(""); // Empty line for readability
      })
    })
  }
});

// Run the program
Effect.runSync(program);
````

---

**Explanation:**  
The `Effect` error channel is designed to short-circuit. The moment an `Effect` fails, the entire computation stops and the error is propagated. This is perfect for handling unrecoverable errors like a lost database connection.

However, for tasks like validating a user's input, this is poor user experience. You want to show the user all of their mistakes at once.

`Either` is the solution. Since it's a pure data structure, you can run multiple checks that each return an `Either`, and then combine the results to accumulate all the `Left` (error) values. The `Effect/Schema` module uses this pattern internally to provide powerful error accumulation.

---


---

### Understand Fibers as Lightweight Threads
**ID:** understand-fibers-as-lightweight-threads
**Use Case:** N/A | **Skill Level:** N/A

description: Understand that a Fiber is a lightweight, virtual thread managed by the Effect runtime for massive concurrency.
globs: "**/*.ts"
alwaysApply: true

# Understand Fibers as Lightweight Threads
**Rule:** Understand that a Fiber is a lightweight, virtual thread managed by the Effect runtime for massive concurrency.

### Example
This program demonstrates the efficiency of fibers by forking 100,000 of them. Each fiber does a small amount of work (sleeping for 1 second). Trying to do this with 100,000 OS threads would instantly crash any system.

```typescript
import { Effect, Fiber } from "effect";

const program = Effect.gen(function* () {
  // Demonstrate the lightweight nature of fibers by creating 100,000 of them
  // This would be impossible with OS threads due to memory and context switching overhead
  const fiberCount = 100_000;
  yield* Effect.log(`Forking ${fiberCount} fibers...`);

  // Create an array of 100,000 simple effects
  // Each effect sleeps for 1 second and then returns its index
  // This simulates lightweight concurrent tasks
  const tasks = Array.from({ length: fiberCount }, (_, i) =>
    Effect.sleep("1 second").pipe(Effect.as(i))
  );

  // Fork all of them into background fibers
  // Effect.fork creates a new fiber for each task without blocking
  // This demonstrates fiber creation scalability - 100k fibers created almost instantly
  // Each fiber is much lighter than an OS thread (typically ~1KB vs ~8MB per thread)
  const fibers = yield* Effect.forEach(tasks, Effect.fork);

  yield* Effect.log(
    "All fibers have been forked. Now waiting for them to complete..."
  );

  // Wait for all fibers to finish their work
  // Fiber.joinAll waits for all fibers to complete and collects their results
  // This demonstrates fiber coordination - managing thousands of concurrent operations
  // The runtime efficiently schedules these fibers using a work-stealing thread pool
  const results = yield* Fiber.joinAll(fibers);

  yield* Effect.log(`All ${results.length} fibers have completed.`);

  // Key insights from this example:
  // 1. Fibers are extremely lightweight - 100k fibers use minimal memory
  // 2. Fiber creation is fast - no expensive OS thread allocation
  // 3. The Effect runtime efficiently schedules fibers across available CPU cores
  // 4. Fibers can be suspended and resumed without blocking OS threads
  // 5. This enables massive concurrency for I/O-bound operations
});

// This program runs successfully, demonstrating the low overhead of fibers.
// Try running this with OS threads - you'd likely hit system limits around 1000-10000 threads
// With fibers, 100k+ concurrent operations are easily achievable
Effect.runPromise(program);

```

---

**Explanation:**  
In traditional multi-threaded programming, each thread is managed by the operating system, consumes significant memory (for its stack), and involves expensive context switching. This limits the number of concurrent threads you can realistically create.

Effect's `Fiber`s are different. They are managed entirely by the Effect runtime, not the OS. They are incredibly lightweight data structures that don't have their own OS thread stack. The Effect runtime uses a cooperative scheduling mechanism to run many fibers on a small pool of OS threads (often just one in Node.js).

This model, known as M:N threading (M fibers on N OS threads), allows for a massive level of concurrency that is impossible with traditional threads. It's what makes Effect so powerful for building highly concurrent applications like servers, data pipelines, and real-time systems.

When you use operators like `Effect.fork` or `Effect.all`, you are creating new fibers.

---


---

### Use Effect.gen for Business Logic
**ID:** use-effectgen-for-business-logic
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect.gen for business logic.
globs: "**/*.ts"
alwaysApply: true

# Use Effect.gen for Business Logic
**Rule:** Use Effect.gen for business logic.

### Example
```typescript
import { Effect } from "effect";

// Concrete implementations for demonstration
const validateUser = (
  data: any
): Effect.Effect<{ email: string; password: string }, Error, never> =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Validating user data: ${JSON.stringify(data)}`);

    if (!data.email || !data.password) {
      return yield* Effect.fail(new Error("Email and password are required"));
    }

    if (data.password.length < 6) {
      return yield* Effect.fail(
        new Error("Password must be at least 6 characters")
      );
    }

    yield* Effect.logInfo("✅ User data validated successfully");
    return { email: data.email, password: data.password };
  });

const hashPassword = (pw: string): Effect.Effect<string, never, never> =>
  Effect.gen(function* () {
    yield* Effect.logInfo("Hashing password...");
    // Simulate password hashing
    const timestamp = yield* Effect.sync(() => Date.now());
    const hashed = `hashed_${pw}_${timestamp}`;
    yield* Effect.logInfo("✅ Password hashed successfully");
    return hashed;
  });

const dbCreateUser = (data: {
  email: string;
  password: string;
}): Effect.Effect<{ id: number; email: string }, never, never> =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Creating user in database: ${data.email}`);
    // Simulate database operation
    const user = { id: Math.floor(Math.random() * 1000), email: data.email };
    yield* Effect.logInfo(`✅ User created with ID: ${user.id}`);
    return user;
  });

const createUser = (
  userData: any
): Effect.Effect<{ id: number; email: string }, Error, never> =>
  Effect.gen(function* () {
    const validated = yield* validateUser(userData);
    const hashed = yield* hashPassword(validated.password);
    return yield* dbCreateUser({ ...validated, password: hashed });
  });

// Demonstrate using Effect.gen for business logic
const program = Effect.gen(function* () {
  yield* Effect.logInfo("=== Using Effect.gen for Business Logic Demo ===");

  // Example 1: Successful user creation
  yield* Effect.logInfo("\n1. Creating a valid user:");
  const validUser = yield* createUser({
    email: "paul@example.com",
    password: "securepassword123",
  }).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Failed to create user: ${error.message}`);
        return { id: -1, email: "error" };
      })
    )
  );
  yield* Effect.logInfo(`Created user: ${JSON.stringify(validUser)}`);

  // Example 2: Invalid user data
  yield* Effect.logInfo("\n2. Attempting to create user with invalid data:");
  const invalidUser = yield* createUser({
    email: "invalid@example.com",
    password: "123", // Too short
  }).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Failed to create user: ${error.message}`);
        return { id: -1, email: "error" };
      })
    )
  );
  yield* Effect.logInfo(`Result: ${JSON.stringify(invalidUser)}`);

  yield* Effect.logInfo("\n✅ Business logic demonstration completed!");
});

Effect.runPromise(program);

```

**Explanation:**  
`Effect.gen` allows you to express business logic in a clear, sequential style,
improving maintainability.

**Explanation:**  
Generators provide a syntax that closely resembles standard synchronous code
(`async/await`), making complex workflows significantly easier to read, write,
and debug.


---

### Run Independent Effects in Parallel with Effect.all
**ID:** run-independent-effects-in-parallel-with-effectall
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect.all to execute a collection of independent effects concurrently.
globs: "**/*.ts"
alwaysApply: true

# Run Independent Effects in Parallel with Effect.all
**Rule:** Use Effect.all to execute a collection of independent effects concurrently.

### Example
Imagine fetching a user's profile and their latest posts from two different API endpoints. These are independent operations and can be run in parallel to save time.

```typescript
import { Effect } from "effect";

// Simulate fetching a user, takes 1 second
const fetchUser = Effect.succeed({ id: 1, name: "Paul" }).pipe(
  Effect.delay("1 second"),
);

// Simulate fetching posts, takes 1.5 seconds
const fetchPosts = Effect.succeed([{ title: "Effect is great" }]).pipe(
  Effect.delay("1.5 seconds"),
);

// Run both effects concurrently - must specify concurrency option!
const program = Effect.all([fetchUser, fetchPosts], { concurrency: "unbounded" });

// The resulting effect will succeed with a tuple: [{id, name}, [{title}]]
// Total execution time will be ~1.5 seconds (the duration of the longest task).
const programWithLogging = Effect.gen(function* () {
  const results = yield* program;
  yield* Effect.log(`Results: ${JSON.stringify(results)}`);
  return results;
});

Effect.runPromise(programWithLogging);
```

---

**Explanation:**  
Running tasks sequentially when they could be done in parallel is a common source of performance bottlenecks. `Effect.all` is the solution. It's the direct equivalent of `Promise.all` in the Effect ecosystem.

Instead of waiting for Task A to finish before starting Task B, `Effect.all` starts all tasks simultaneously. The total time to complete is determined by the duration of the *longest* running effect, not the sum of all durations. If any single effect in the collection fails, the entire `Effect.all` will fail immediately.

---


---

### Create a Testable HTTP Client Service
**ID:** create-a-testable-http-client-service
**Use Case:** N/A | **Skill Level:** N/A

description: Define an HttpClient service with distinct Live and Test layers to enable testable API interactions.
globs: "**/*.ts"
alwaysApply: true

# Create a Testable HTTP Client Service
**Rule:** Define an HttpClient service with distinct Live and Test layers to enable testable API interactions.

### Example
### 1. Define the Service

```typescript
import { Effect, Data, Layer } from "effect";

interface HttpErrorType {
  readonly _tag: "HttpError";
  readonly error: unknown;
}

const HttpError = Data.tagged<HttpErrorType>("HttpError");

interface HttpClientType {
  readonly get: <T>(url: string) => Effect.Effect<T, HttpErrorType>;
}

class HttpClient extends Effect.Service<HttpClientType>()("HttpClient", {
  sync: () => ({
    get: <T>(url: string): Effect.Effect<T, HttpErrorType> =>
      Effect.tryPromise<T>(() =>
        fetch(url).then((res) => res.json() as T)
      ).pipe(
        Effect.catchAll((error) => Effect.fail(HttpError({ error })))
      ),
  }),
}) {}

// Test implementation
const TestLayer = Layer.succeed(
  HttpClient,
  HttpClient.of({
    get: <T>(_url: string) => Effect.succeed({ title: "Mock Data" } as T),
  })
);

// Example usage
const program = Effect.gen(function* () {
  const client = yield* HttpClient;
  yield* Effect.logInfo("Fetching data...");
  const data = yield* client.get<{ title: string }>(
    "https://api.example.com/data"
  );
  yield* Effect.logInfo(`Received data: ${JSON.stringify(data)}`);
});

// Run with test implementation
Effect.runPromise(Effect.provide(program, TestLayer));

```

### 2. Create the Live Implementation

```typescript
import { Effect, Data, Layer } from "effect"

interface HttpErrorType {
  readonly _tag: "HttpError"
  readonly error: unknown
}

const HttpError = Data.tagged<HttpErrorType>("HttpError")

interface HttpClientType {
  readonly get: <T>(url: string) => Effect.Effect<T, HttpErrorType>
}

class HttpClient extends Effect.Service<HttpClientType>()(
  "HttpClient",
  {
    sync: () => ({
      get: <T>(url: string): Effect.Effect<T, HttpErrorType> =>
        Effect.tryPromise({
          try: () => fetch(url).then((res) => res.json()),
          catch: (error) => HttpError({ error })
        })
    })
  }
) {}

// Test implementation
const TestLayer = Layer.succeed(
  HttpClient,
  HttpClient.of({
    get: <T>(_url: string) => Effect.succeed({ title: "Mock Data" } as T)
  })
)

// Example usage
const program = Effect.gen(function* () {
  const client = yield* HttpClient
  yield* Effect.logInfo("Fetching data...")
  const data = yield* client.get<{ title: string }>("https://api.example.com/data")
  yield* Effect.logInfo(`Received data: ${JSON.stringify(data)}`)
})

// Run with test implementation
Effect.runPromise(
  Effect.provide(program, TestLayer)
)
```

### 3. Create the Test Implementation

```typescript
// src/services/HttpClientTest.ts
import { Effect, Layer } from "effect";
import { HttpClient } from "./HttpClient";

export const HttpClientTest = Layer.succeed(
  HttpClient,
  HttpClient.of({
    get: (url) => Effect.succeed({ mock: "data", url }),
  }),
);
```

### 4. Usage in Business Logic

Your business logic is now clean and only depends on the abstract `HttpClient`.

```typescript
// src/features/User/UserService.ts
import { Effect } from "effect";
import { HttpClient } from "../../services/HttpClient";

export const getUserFromApi = (id: number) =>
  Effect.gen(function* () {
    const client = yield* HttpClient;
    const data = yield* client.get(`https://api.example.com/users/${id}`);
    // ... logic to parse and return user
    return data;
  });
```

---

**Explanation:**  
Directly using `fetch` in your business logic makes it nearly impossible to test. Your tests would become slow, flaky (dependent on network conditions), and could have unintended side effects.

By abstracting the HTTP client into a service, you decouple your application's logic from the specific implementation of how HTTP requests are made. Your business logic depends only on the abstract `HttpClient` interface. In production, you provide the `Live` layer. In tests, you provide the `Test` layer. This makes your tests fast, deterministic, and reliable.

---


---

### Collect All Results into a List
**ID:** collect-all-results-into-a-list
**Use Case:** N/A | **Skill Level:** N/A

description: Use Stream.runCollect to execute a stream and collect all its emitted values into a Chunk.
globs: "**/*.ts"
alwaysApply: true

# Collect All Results into a List
**Rule:** Use Stream.runCollect to execute a stream and collect all its emitted values into a Chunk.

### Example
This example creates a stream of numbers, filters for only the even ones, transforms them into strings, and then uses `runCollect` to gather the final results into a `Chunk`.

```typescript
import { Effect, Stream, Chunk } from 'effect';

const program = Stream.range(1, 10).pipe(
  // Find all the even numbers
  Stream.filter((n) => n % 2 === 0),
  // Transform them into strings
  Stream.map((n) => `Even number: ${n}`),
  // Run the stream and collect the results
  Stream.runCollect
);

const programWithLogging = Effect.gen(function* () {
  const results = yield* program;
  yield* Effect.log(`Collected results: ${JSON.stringify(Chunk.toArray(results))}`);
  return results;
});

Effect.runPromise(programWithLogging);
/*
Output:
Collected results: [
  'Even number: 2',
  'Even number: 4',
  'Even number: 6',
  'Even number: 8',
  'Even number: 10'
]
*/
```

**Explanation:**  
A "sink" is a terminal operator that consumes a stream and produces a final `Effect`. `Stream.runCollect` is the most fundamental sink. It provides the bridge from the lazy, pull-based world of `Stream` back to the familiar world of a single `Effect` that resolves with a standard data structure.

Using `Stream.runCollect` is essential when:

1.  **You Need the Final Result**: The goal of your pipeline is to produce a complete list of transformed items that you need to use in a subsequent step (e.g., to return as a single JSON array from an API).
2.  **Simplicity is Key**: It's the most straightforward way to "run" a stream and see its output. It declaratively states your intent: "execute this entire pipeline and give me all the results."
3.  **The Dataset is Bounded**: It's designed for streams where the total number of items is known to be finite and small enough to fit comfortably in memory.

The result of `Stream.runCollect` is an `Effect` that, when executed, yields a `Chunk` containing all the items emitted by the stream.

---


---

### Race Concurrent Effects for the Fastest Result
**ID:** race-concurrent-effects-for-the-fastest-result
**Use Case:** N/A | **Skill Level:** N/A

description: Use Effect.race to get the result from the first of several effects to succeed, automatically interrupting the losers.
globs: "**/*.ts"
alwaysApply: true

# Race Concurrent Effects for the Fastest Result
**Rule:** Use Effect.race to get the result from the first of several effects to succeed, automatically interrupting the losers.

### Example
A classic use case is checking a fast cache before falling back to a slower database. We can race the cache lookup against the database query.

```typescript
import { Effect, Option } from "effect";

type User = { id: number; name: string };

// Simulate a slower cache lookup that might find nothing (None)
const checkCache: Effect.Effect<Option.Option<User>> = Effect.succeed(
  Option.none()
).pipe(
  Effect.delay("200 millis") // Made slower so database wins
);

// Simulate a faster database query that will always find the data
const queryDatabase: Effect.Effect<Option.Option<User>> = Effect.succeed(
  Option.some({ id: 1, name: "Paul" })
).pipe(
  Effect.delay("50 millis") // Made faster so it wins the race
);

// Race them. The database should win and return the user data.
const program = Effect.race(checkCache, queryDatabase).pipe(
  // The result of the race is an Option, so we can handle it.
  Effect.flatMap((result: Option.Option<User>) =>
    Option.match(result, {
      onNone: () => Effect.fail("User not found anywhere."),
      onSome: (user) => Effect.succeed(user),
    })
  )
);

// In this case, the database wins the race.
const programWithResults = Effect.gen(function* () {
  try {
    const user = yield* program;
    yield* Effect.log(`User found: ${JSON.stringify(user)}`);
    return user;
  } catch (error) {
    yield* Effect.logError(`Error: ${error}`);
    throw error;
  }
}).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logError(`Handled error: ${error}`);
      return null;
    })
  )
);

Effect.runPromise(programWithResults);

// Also demonstrate with logging
const programWithLogging = Effect.gen(function* () {
  yield* Effect.logInfo("Starting race between cache and database...");

  try {
    const user = yield* program;
    yield* Effect.logInfo(
      `Success: Found user ${user.name} with ID ${user.id}`
    );
    return user;
  } catch (error) {
    yield* Effect.logInfo("This won't be reached due to Effect error handling");
    return null;
  }
}).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logInfo(`Handled error: ${error}`);
      return null;
    })
  )
);

Effect.runPromise(programWithLogging);

```

---

**Explanation:**  
`Effect.race` is a powerful concurrency primitive for performance and resilience. It starts all provided effects in parallel. The moment one of them succeeds, `Effect.race` immediately interrupts all the other "losing" effects and returns the winning result. If one of the effects fails before any have succeeded, the race is not over; the remaining effects continue to run. The entire race only fails if *all* participating effects fail.

This is commonly used for:
-   **Performance:** Querying multiple redundant data sources (e.g., two API replicas) and taking the response from whichever is faster.
-   **Implementing Timeouts:** Racing a primary effect against a delayed `Effect.fail`, effectively creating a timeout mechanism.

---


---

### Write Sequential Code with Effect.gen
**ID:** write-sequential-code-with-effectgen
**Use Case:** N/A | **Skill Level:** N/A

description: Write sequential code with Effect.gen.
globs: "**/*.ts"
alwaysApply: true

# Write Sequential Code with Effect.gen
**Rule:** Write sequential code with Effect.gen.

### Example
```typescript
import { Effect } from "effect";

// Mock API functions for demonstration
const fetchUser = (id: number) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Fetching user ${id}...`);
    // Simulate API call
    yield* Effect.sleep("100 millis");
    return { id, name: `User ${id}`, email: `user${id}@example.com` };
  });

const fetchUserPosts = (userId: number) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Fetching posts for user ${userId}...`);
    // Simulate API call
    yield* Effect.sleep("150 millis");
    return [
      { id: 1, title: "First Post", userId },
      { id: 2, title: "Second Post", userId },
    ];
  });

const fetchPostComments = (postId: number) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Fetching comments for post ${postId}...`);
    // Simulate API call
    yield* Effect.sleep("75 millis");
    return [
      { id: 1, text: "Great post!", postId },
      { id: 2, text: "Thanks for sharing", postId },
    ];
  });

// Example of sequential code with Effect.gen
const getUserDataWithGen = (userId: number) =>
  Effect.gen(function* () {
    // Step 1: Fetch user
    const user = yield* fetchUser(userId);
    yield* Effect.logInfo(`✅ Got user: ${user.name}`);

    // Step 2: Fetch user's posts (depends on user data)
    const posts = yield* fetchUserPosts(user.id);
    yield* Effect.logInfo(`✅ Got ${posts.length} posts`);

    // Step 3: Fetch comments for first post (depends on posts data)
    const firstPost = posts[0];
    const comments = yield* fetchPostComments(firstPost.id);
    yield* Effect.logInfo(
      `✅ Got ${comments.length} comments for "${firstPost.title}"`
    );

    // Step 4: Combine all data
    const result = {
      user,
      posts,
      featuredPost: {
        ...firstPost,
        comments,
      },
    };

    yield* Effect.logInfo("✅ Successfully combined all user data");
    return result;
  });

// Example without Effect.gen (more complex)
const getUserDataWithoutGen = (userId: number) =>
  fetchUser(userId).pipe(
    Effect.flatMap((user) =>
      fetchUserPosts(user.id).pipe(
        Effect.flatMap((posts) =>
          fetchPostComments(posts[0].id).pipe(
            Effect.map((comments) => ({
              user,
              posts,
              featuredPost: {
                ...posts[0],
                comments,
              },
            }))
          )
        )
      )
    )
  );

// Demonstrate writing sequential code with gen
const program = Effect.gen(function* () {
  yield* Effect.logInfo("=== Writing Sequential Code with Effect.gen Demo ===");

  // Example 1: Sequential operations with Effect.gen
  yield* Effect.logInfo("\n1. Sequential operations with Effect.gen:");
  const userData = yield* getUserDataWithGen(123).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Failed to get user data: ${error}`);
        return null;
      })
    )
  );

  if (userData) {
    yield* Effect.logInfo(
      `Final result: User "${userData.user.name}" has ${userData.posts.length} posts`
    );
    yield* Effect.logInfo(
      `Featured post: "${userData.featuredPost.title}" with ${userData.featuredPost.comments.length} comments`
    );
  }

  // Example 2: Compare with traditional promise-like chaining
  yield* Effect.logInfo("\n2. Same logic without Effect.gen (for comparison):");
  const userData2 = yield* getUserDataWithoutGen(456).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Failed to get user data: ${error}`);
        return null;
      })
    )
  );

  if (userData2) {
    yield* Effect.logInfo(
      `Result from traditional approach: User "${userData2.user.name}"`
    );
  }

  // Example 3: Error handling in sequential code
  yield* Effect.logInfo("\n3. Error handling in sequential operations:");
  const errorHandling = yield* Effect.gen(function* () {
    try {
      const user = yield* fetchUser(999);
      const posts = yield* fetchUserPosts(user.id);
      return { user, posts };
    } catch (error) {
      yield* Effect.logError(`Error in sequential operations: ${error}`);
      return null;
    }
  }).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Caught error: ${error}`);
        return { user: null, posts: [] };
      })
    )
  );

  yield* Effect.logInfo(
    `Error handling result: ${errorHandling ? "Success" : "Handled error"}`
  );

  yield* Effect.logInfo("\n✅ Sequential code demonstration completed!");
  yield* Effect.logInfo(
    "Effect.gen makes sequential async code look like synchronous code!"
  );
});

Effect.runPromise(program);

```

**Explanation:**  
`Effect.gen` allows you to write top-to-bottom code that is easy to read and
maintain, even when chaining many asynchronous steps.

**Explanation:**  
`Effect.gen` uses generator functions to create a flat, linear, and highly
readable sequence of operations, avoiding the nested "callback hell" of
`flatMap`.


---

### Modeling Validated Domain Types with Brand
**ID:** modeling-validated-domain-types-with-brand
**Use Case:** N/A | **Skill Level:** N/A

description: Use Brand to define types like Email, UserId, or PositiveInt, ensuring only valid values can be constructed and used.
globs: "**/*.ts"
alwaysApply: true

# Modeling Validated Domain Types with Brand
**Rule:** Use Brand to define types like Email, UserId, or PositiveInt, ensuring only valid values can be constructed and used.

### Example
```typescript
import { Brand } from "effect";

// Define a branded type for Email
type Email = string & Brand.Brand<"Email">;

// Function that only accepts Email, not any string
function sendWelcome(email: Email) {
  // ...
}

// Constructing an Email value (unsafe, see next pattern for validation)
const email = "user@example.com" as Email;

sendWelcome(email); // OK
// sendWelcome("not-an-email"); // Type error! (commented to allow compilation)

```

**Explanation:**  
- `Brand.Branded<T, Name>` creates a new type that is distinct from its base type.
- Only values explicitly branded as `Email` can be used where an `Email` is required.
- This prevents accidental mixing of domain types.

**Explanation:**  
Branded types add a layer of type safety, ensuring that values like `Email`, `UserId`, or `PositiveInt` are not confused with plain strings or numbers.  
They help you catch bugs at compile time and make your code more self-documenting.


---

### Define Type-Safe Errors with Data.TaggedError
**ID:** define-type-safe-errors-with-data-taggederror
**Use Case:** N/A | **Skill Level:** N/A

description: Define type-safe errors with Data.TaggedError.
globs: "**/*.ts"
alwaysApply: true

# Define Type-Safe Errors with Data.TaggedError
**Rule:** Define type-safe errors with Data.TaggedError.

### Example
```typescript
import { Data, Effect } from "effect"

// Define our tagged error type
class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly cause: unknown
}> {}

// Function that simulates a database error
const findUser = (id: number): Effect.Effect<{ id: number; name: string }, DatabaseError> =>
  Effect.gen(function* () {
    if (id < 0) {
      return yield* Effect.fail(new DatabaseError({ cause: "Invalid ID" }))
    }
    return { id, name: `User ${id}` }
  })

// Create a program that demonstrates error handling
const program = Effect.gen(function* () {
  // Try to find a valid user
  yield* Effect.logInfo("Looking up user 1...")
  yield* Effect.gen(function* () {
    const user = yield* findUser(1)
    yield* Effect.logInfo(`Found user: ${JSON.stringify(user)}`)
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logInfo(`Error finding user: ${error._tag} - ${error.cause}`)
    )
  )

  // Try to find an invalid user
  yield* Effect.logInfo("\nLooking up user -1...")
  yield* Effect.gen(function* () {
    const user = yield* findUser(-1)
    yield* Effect.logInfo(`Found user: ${JSON.stringify(user)}`)
  }).pipe(
    Effect.catchTag("DatabaseError", (error) =>
      Effect.logInfo(`Database error: ${error._tag} - ${error.cause}`)
    )
  )
})

// Run the program
Effect.runPromise(program)
```

**Explanation:**  
Tagged errors allow you to handle errors in a type-safe, self-documenting way.

# --- END EFFECTPATTERNS RULES ---
