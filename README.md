# Queue trigger in Typescript to create new nodes in the graph database

This is a Queue trigger function written in Typescript in Visual Studio Code as the editor. When it recieves a item in the queue, creates a node in the Cosmos DB using Gremlin API. It facililates to store the data or nodes along with its relationships 

## Technology stack
* Typescript version 4.0.2 *(npm i typescript)* https://www.npmjs.com/package/typescript 
* Azure functions for typescript version 1.2.2 *(npm i @azure/functions)* https://www.npmjs.com/package/@azure/functions 
* Javascript Gremlin API, *(npm i gremlin)* https://www.npmjs.com/package/gremlin
* Install this package to read settings in the appsettings.json file *(npm i read-appsettings-json)* https://www.npmjs.com/package/read-appsettings-json
