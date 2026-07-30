# Unified Storage Guidelines (`pkg/storage/unified/`)

Unified storage/search can run in-process (default), as a standalone gRPC storage server (`unified-grpc`), or as distributed search servers. These components deploy independently from the Grafana API layer.

## Client / Server Split

- **Client side** (runs in Grafana API layer): `apistore/`, `federated/`, `client.go`, `client_retry.go`, callers in `pkg/services/{dashboards,folder,search,stats}/`, `pkg/infra/leaderelection/kvlease/`, `pkg/storage/legacysql/`.
- **Server side** (may deploy separately): `resource/`, `sql/`, `search/`, `migrations/`, `parquet/`.
- **Contract** (shared protobuf definitions): `proto/`, `resourcepb/`.

## Compatibility Rules

Any combination of versions must function seamlessly during rolling deployments (new client ↔ old server and old client ↔ new server).

1. **No simultaneous responsibility shifts**: Do not transfer responsibility between client and server in a single PR. Ship server support first, then update client behavior in a follow-up PR.
2. **Additive contract changes**: Never delete or redefine fields or RPCs in `proto/`/`resourcepb/` that deployed versions still consume.
3. **Client fallbacks**: New client expectations must maintain fallbacks for older server responses until the server change is fully rolled out across all environments.
4. **CI Compatibility Check**: The CI workflow `pr-unified-storage-compatibility.yml` validates cross-side changes. If changes are strictly inseparable, apply the `no-check-unified-storage-compatibility` PR label with justification.
