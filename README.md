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
