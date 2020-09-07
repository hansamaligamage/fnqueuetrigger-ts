"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const read_appsettings_json_1 = require("read-appsettings-json");
const queueTrigger = function (context, myQueueItem) {
    return __awaiter(this, void 0, void 0, function* () {
        context.log('Queue trigger function processed work item', myQueueItem);
        AddPerson(myQueueItem, context);
    });
};
exports.default = queueTrigger;
function AddPerson(person, context) {
    let client = initializeGraph(context);
    addData(client, person, context);
}
function initializeGraph(context) {
    const Gremlin = require('gremlin');
    const endpoint = read_appsettings_json_1.AppConfiguration.Setting().endpoint;
    const key = read_appsettings_json_1.AppConfiguration.Setting().primaryKey;
    const database = read_appsettings_json_1.AppConfiguration.Setting().database;
    const collection = read_appsettings_json_1.AppConfiguration.Setting().collection;
    const authenticator = new Gremlin.driver.auth.PlainTextSaslAuthenticator(`/dbs/${database}/colls/${collection}`, key);
    const client = new Gremlin.driver.Client(endpoint, {
        authenticator,
        traversalsource: "g",
        rejectUnauthorized: true,
        mimeType: "application/vnd.gremlin-v2.0+json"
    });
    client.open();
    return client;
}
function dropGraph(client, context) {
    context.log('Running Drop');
    return client.submit('g.V().drop()', {}).then(function (result) {
        context.log("Result: %s\n", JSON.stringify(result));
    });
}
function addData(client, person, context) {
    context.log('Adding vertices');
    client.submit("g.addV(label).property('id', id).property('name', name).property('city', city)", {
        label: "profile",
        id: person.id,
        name: person.name,
        city: person.city
    }).then(function (result) {
        context.log("Result: %s\n", JSON.stringify(result));
        if (person.connections != null) {
            person.connections.forEach(element => {
                context.log('Adding edges');
                return client.submit("g.V(source).addE(relationship).to(g.V(target))", {
                    source: person.id,
                    relationship: element.relationship,
                    target: element.relatedperson
                }).then(function (result) {
                    context.log("Result: %s\n", JSON.stringify(result));
                });
            });
        }
    });
}
//# sourceMappingURL=index.js.map