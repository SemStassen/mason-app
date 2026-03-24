/* oxlint-disable promise/avoid-new */

const REGISTRY_DATABASE_NAME = "mason_databases";
const REGISTRY_STORE_NAME = "mason_databases";
const INDEX_BY_WORKSPACE_MEMBER_AND_SCHEMA = "by_workspace_member_and_schema";
const INDEX_BY_WORKSPACE_MEMBER = "by_workspace_member";

export interface DatabaseEntry {
  name: string;
  workspaceMemberId: string;
  schemaHash: string;
  createdAt: number;
}

type RegistryObjectStore = IDBObjectStore;

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

async function withStore<T>(params: {
  mode: IDBTransactionMode;
  run: (store: RegistryObjectStore) => Promise<T>;
}): Promise<T> {
  const database = await openRegistryDatabase();

  try {
    const transaction = database.transaction(REGISTRY_STORE_NAME, params.mode);
    const store = transaction.objectStore(REGISTRY_STORE_NAME);
    const result = await params.run(store);
    await transactionToPromise(transaction);

    return result;
  } finally {
    database.close();
  }
}

function openRegistryDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(REGISTRY_DATABASE_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      const store = database.objectStoreNames.contains(REGISTRY_STORE_NAME)
        ? request.transaction?.objectStore(REGISTRY_STORE_NAME)
        : database.createObjectStore(REGISTRY_STORE_NAME, {
            keyPath: "name",
          });

      if (!store) {
        return;
      }

      if (!store.indexNames.contains(INDEX_BY_WORKSPACE_MEMBER_AND_SCHEMA)) {
        store.createIndex(INDEX_BY_WORKSPACE_MEMBER_AND_SCHEMA, [
          "workspaceMemberId",
          "schemaHash",
        ]);
      }

      if (!store.indexNames.contains(INDEX_BY_WORKSPACE_MEMBER)) {
        store.createIndex(INDEX_BY_WORKSPACE_MEMBER, "workspaceMemberId");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function findDatabaseEntry(params: {
  workspaceMemberId: string;
  schemaHash: string;
}): Promise<DatabaseEntry | null> {
  return withStore({
    mode: "readonly",
    run: async (store) => {
      const index = store.index(INDEX_BY_WORKSPACE_MEMBER_AND_SCHEMA);
      const request = index.get([params.workspaceMemberId, params.schemaHash]);
      const entry = await requestToPromise(request);

      return (entry as DatabaseEntry | undefined) ?? null;
    },
  });
}

export function putDatabaseEntry(entry: DatabaseEntry): Promise<void> {
  return withStore({
    mode: "readwrite",
    run: async (store) => {
      await requestToPromise(store.put(entry));
    },
  });
}

export function listStaleDatabaseEntries(params: {
  workspaceMemberId: string;
  schemaHash: string;
}): Promise<Array<DatabaseEntry>> {
  return withStore({
    mode: "readonly",
    run: async (store) => {
      const index = store.index(INDEX_BY_WORKSPACE_MEMBER);
      const request = index.getAll(params.workspaceMemberId);
      const entries = (await requestToPromise(request)) as Array<DatabaseEntry>;

      return entries.filter((entry) => entry.schemaHash !== params.schemaHash);
    },
  });
}

export function deleteDatabaseEntry(name: string): Promise<void> {
  return withStore({
    mode: "readwrite",
    run: async (store) => {
      await requestToPromise(store.delete(name));
    },
  });
}

export function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error(`Unable to delete indexed database "${name}"`));
  });
}
