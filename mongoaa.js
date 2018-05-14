#!/usr/bin/env node
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const bluebird = require('bluebird');
const MongoClient = require('mongodb').MongoClient;
const watch = require('./watch');
const crypto = require('crypto');

const optionDefs = [
    {name: 'src', alias: 's', type: String, multiple: true, description: "Two data sources your want to replicate from/to. Separate with space."},
    {name: 'database', alias: 'd', type: String, description: "Database that you want to do AA replication."},
    {name: 'collection', alias: 'c', type: String, description: "Collection that you want to do AA replication."},
    {name: 'help', alias: 'h', description: 'Display this guide.'}
];
const sections = [
    {
        header: 'Options',
        optionList: optionDefs
    }
];
const options = commandLineArgs(optionDefs);
const usage = commandLineUsage(sections);
console.debug(JSON.stringify(options));

new Promise((resolve, reject) => {
    if (!(options.src instanceof Array) 
        || options.src.length != 2
        || !options.database
        || !options.collection) {
            console.log(ex.message);
            reject(false);
        } else {
            resolve(true);
        }
}).then(async() => {
    // connect to DB
    let connA = options.src[0],
        connB = options.src[1];
    return Promise.all([
        MongoClient.connect(connA),
        MongoClient.connect(connB)
    ]);
}).then(values => {
    // compute IDs and get collections
    let connA = options.src[0],
        connB = options.src[1];
    let idA = crypto.createHash('md5').update(connA).digest('base64'),
        idB = crypto.createHash('md5').update(connB).digest('base64');
    let clientA = values[0],
        clientB = values[1];
    let collA = clientA.db(options.database).collection(options.collection),
        collB = clientB.db(options.database).collection(options.collection);
    let collections = [
        {
            id: idA,
            coll: collA
        }, {
            id: idB,
            coll: collB
        }
    ];
    watch(collections);
}).catch((ex) => {
    if (ex) {
        console.log(ex.message);
    }
    console.log(usage);
    process.exit(1);
});