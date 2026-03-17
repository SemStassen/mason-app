export const mapInfraErrors = Effect.catchTags({
  "infra/DatabaseError": () =>
    Effect.fail(new HttpApiError.InternalServerError()),
  RepositoryError: () => Effect.fail(new HttpApiError.InternalServerError()),
});
