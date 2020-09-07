export class Person {
    Id : number;
    Name : string;
    City : string;
    Connections : Connection[];
}

export class Connection {
    RelatedPerson : string;
    Relationship : string;
}