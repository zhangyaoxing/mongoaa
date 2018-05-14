const Timestamp = require('mongodb').Timestamp;

function replicate(sourceID, targetCollection, ops) {
    console.debug(JSON.stringify(ops));
    switch(ops.operationType) {
        case 'insert':
            if(ops.fullDocument.__meta) {
                break;
            }
            var doc = Object.assign(ops.fullDocument, {
                __meta: {
                    source: sourceID,
                    timestamp: new Timestamp(1, new Date().getTime())
                }
            });
            targetCollection.insert(doc)
            break;
        case 'update':
            if (ops.updateDescription.updatedFields.__meta) {
                break;
            }
            var update = Object.assign(ops.updateDescription.updatedFields, {
                __meta: {
                    source: sourceID,
                    timestamp: new Timestamp(1, new Date().getTime())
                }
            });
            update = {
                $set: update
            };
            var unset = {};
            ops.updateDescription.removedFields.forEach(f => {
                unset[f] = 1;
            });
            if (Object.keys(unset).length) {
                update = Object.assign(update, {
                    $unset: unset
                });
            }

            targetCollection.updateOne(ops.documentKey, update);
            break;
        case 'replace':
            var update = {
                $set: Object.assign(ops.fullDocument, {
                    __meta: {
                        source: sourceID,
                        timestamp: new Timestamp(1, new Date().getTime())
                    }
                })
            };
            targetCollection.update(ops.documentKey, update);
            break;
        case 'delete':
            targetCollection.removeOne(ops.documentKey);
            break;
    }
}

module.exports = (colls => {
    let idA = colls[0].id,
        idB = colls[1].id;
    let collA = colls[0].coll,
        collB = colls[1].coll;
    collA.watch([]).on('change', (change) => {
        replicate(idA, collB, change);
    });
    collB.watch([]).on('change', (change) => {
        replicate(idB, collA, change);
    });
});