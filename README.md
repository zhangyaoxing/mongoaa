# MongoDB AA
This is a PoC of MongoDB AA replication based on change stream

## Usage
./mongoaa [options]
- `--src`/`-s`: Data sources including source and target MongoDB cluster.
- `--database`/`-d`: Database that you want to do AA replication.
- `--collection`/`-c`: Collection that you want to do AA replication.

## Example
This will replicate all changes between `127.0.0.1:27017` and `127.0.0.1:27018`.
```
./mongoaa -s 'mongodb://127.0.0.1:27017/?replicaSet=rs0' 'mongodb://127.0.0.1:27018/?replicaSet=rs0' -d foo -c bar
```
## Known issues
### `__meta`
A sub document `__meta` is added in order to record information necessary to do replication. This extra field may cause document to exceed 16MB if your document is already approaching this limit.

### Conflict
This script doesn't detect nor try to avoid conflict. Conflict needs to be handled by your own.

### `remove` behaviour 
The only thing given by change stream is document key. This gives us no chance to stop the `remove` from triggering again in the target collection. However, as this document is already removed in source collection, the extra `remove` will not do anything besides causing an extra `remove` operation.
