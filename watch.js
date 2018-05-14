const Timestamp = require('mongodb').Timestamp;

function replicate(sourceID, targetCollection, ops) {
    console.debug(JSON.stringify(ops));
    switch(ops.operationType) {
        case 'insert':
            if(ops.fullDocument.__meta) {
                break;
            }
            let doc = Object.assign(ops.fullDocument, {
                __meta: {
                    source: sourceID,
                    timestamp: new Timestamp(1, new Date().getTime())
                }
            });
            targetCollection.insert(doc)
            break;
        case 'update':
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