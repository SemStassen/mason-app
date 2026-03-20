import { PgClient } from "@effect/sql-pg";
import { Config } from "effect";
import { types as pgTypes } from "pg";

export const PgClientLayer = PgClient.layerConfig({
  url: Config.redacted("DATABASE_URL"),
  types: Config.succeed({
    getTypeParser: (typeId, format) => {
      if (
        [1184, 1114, 1082, 1186, 1231, 1115, 1185, 1187, 1182].includes(typeId)
      ) {
        return (value: string) => value;
      }

      return pgTypes.getTypeParser(typeId, format);
    },
  }),
} satisfies Config.Wrap<PgClient.PgClientConfig>);
