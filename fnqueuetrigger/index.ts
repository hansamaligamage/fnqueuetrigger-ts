import { AzureFunction, Context } from "@azure/functions"
import { Person } from "./person";
import { AppConfiguration } from "read-appsettings-json";

const queueTrigger: AzureFunction = async function (context: Context, myQueueItem: string): Promise<void> {
    
    context.log('Queue trigger function processed work item', myQueueItem);

    AddPerson(myQueueItem, context);

};

export default queueTrigger;

function AddPerson(person : string, context: Context){
  let client = initializeGraph(context);
  addData(client, person, context);
}

function initializeGraph (context: Context) : any{
    const Gremlin = require('gremlin');
    
    const endpoint  = AppConfiguration.Setting().endpoint;
    const key = AppConfiguration.Setting().primaryKey;
    const database = AppConfiguration.Setting().database;
    const collection = AppConfiguration.Setting().collection;

    const authenticator = new Gremlin.driver.auth.PlainTextSaslAuthenticator(`/dbs/${database}/colls/${collection}`, key)

    const client = new Gremlin.driver.Client(
        endpoint, 
        { 
            authenticator,
            traversalsource : "g",
            rejectUnauthorized : true,
            mimeType : "application/vnd.gremlin-v2.0+json"
        });
    client.open();
    return client;
}

function dropGraph(client : any, context: Context)
{
    context.log('Running Drop');
    return client.submit('g.V().drop()', { }).then(function (result) {
        context.log("Result: %s\n", JSON.stringify(result));
    });
}

function addData (client : any, person : any, context: Context){
    context.log('Adding vertices');
    client.submit("g.addV(label).property('id', id).property('name', name).property('city', city)", {
        label:"profile",
        id:person.id,
        name:person.name,
        city:person.city
    }).then(function (result) {
        context.log("Result: %s\n", JSON.stringify(result));
        if(person.connections != null){
            person.connections.forEach(element => {
                context.log('Adding edges');
                return client.submit("g.V(source).addE(relationship).to(g.V(target))", {
                    source:person.id, 
                    relationship:element.relationship, 
                    target:element.relatedperson
                }).then(function (result) {
                    context.log("Result: %s\n", JSON.stringify(result));
                });
            });
        }
    });
    
}
