# Queue trigger in Typescript to create new nodes in the graph database

This is a Queue trigger function written in Typescript in Visual Studio Code as the editor. When it recieves a item in the queue, creates a node in the Cosmos DB using Gremlin API. It facililates to store the data or nodes along with its relationships 

## Technology stack
* Typescript version 4.0.2 *(npm i typescript)* https://www.npmjs.com/package/typescript 
* Azure functions for typescript version 1.2.2 *(npm i @azure/functions)* https://www.npmjs.com/package/@azure/functions 
* Javascript Gremlin API, *(npm i gremlin)* https://www.npmjs.com/package/gremlin
* Install this package to read settings in the appsettings.json file *(npm i read-appsettings-json)* https://www.npmjs.com/package/read-appsettings-json

## How to run the solution
 * Create a storage account and create a queue inside it, Go to the Access keys section and get the connection string and provide it to the AzureWebJobsStorage setting in local.settings.json file
 * You have to create a Cosmos DB account with Gremlin (Graph) API then go to the Keys section, get the Gremlin endpoint and key to connect to the database
 * Create a database and graph inside the Cosmos DB account, use the same values for the settings database and collection entries
 * Open the solution file in Visual Studio and run the project
 * Insert a new item in the queue and check it is inserted to the graph database
 
  ## Code snippets
  ### Queue trigger to track new items
  ```
import { AzureFunction, Context } from "@azure/functions"

const queueTrigger: AzureFunction = async function (context: Context, myQueueItem: string): Promise<void> {
    
context.log('Queue trigger function processed work item', myQueueItem);

AddPerson(myQueueItem, context);

};
 ```
 ### Initialize the graph client
 ```
 function initializeGraph (context: Context) : any{
    const Gremlin = require('gremlin');
    
    const endpoint  = AppConfiguration.Setting().endpoint;
    const key = AppConfiguration.Setting().primaryKey;
    const database = AppConfiguration.Setting().database;
    const collection = AppConfiguration.Setting().collection;

    const authenticator = new Gremlin.driver.auth.PlainTextSaslAuthenticator(
      `/dbs/${database}/colls/${collection}`, key)

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
 ```
 
 ### Add nodes (vertices and edges) to the graph
 ```
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

 ```
