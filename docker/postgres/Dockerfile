# ---------- Build Stage ----------
    FROM postgres:17 AS env-build

    RUN apt-get update && apt-get -y upgrade \
      && apt-get install -y build-essential libpq-dev postgresql-server-dev-all git \
      && rm -rf /var/lib/apt/lists/*
    
    WORKDIR /srv
    
    # Clone and optionally pin to a specific commit/tag for reproducibility
    RUN git clone https://github.com/fboulnois/pg_uuidv7.git . \
      && pg_buildext build-17 17 \
      && cp sql/pg_uuidv7--1.6.sql . \
      && tar -czvf pg_uuidv7.tar.gz $(find * -name pg_uuidv7.so) pg_uuidv7--1.6.sql pg_uuidv7.control \
      && sha256sum pg_uuidv7.tar.gz $(find * -name pg_uuidv7.so) pg_uuidv7--1.6.sql pg_uuidv7.control > SHA256SUMS
    
    # ---------- Deployment Stage ----------
    FROM postgres:17 AS env-deploy
    
    # Copy extension files
    COPY --from=env-build /srv/pg_uuidv7.tar.gz /srv/SHA256SUMS /srv/
    COPY --from=env-build /srv/17/pg_uuidv7.so /usr/lib/postgresql/17/lib/
    COPY --from=env-build /srv/pg_uuidv7.control /usr/share/postgresql/17/extension/
    COPY --from=env-build /srv/pg_uuidv7--1.6.sql /usr/share/postgresql/17/extension/
    
    # Auto-enable the extension and define the SQL wrapper
    RUN echo "CREATE EXTENSION IF NOT EXISTS pg_uuidv7;" > /docker-entrypoint-initdb.d/01-init-extensions.sql \