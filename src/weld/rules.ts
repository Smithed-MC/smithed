import { Condition } from "./conditions";
import PathFetcher from "./pathFetcher";
import { Source } from "./sources";

export interface RuleData {type: string, [key:string]: any}
export class Rule {
    type: string = "";
    conditions: Condition[] = [];
    constructor(data: RuleData) {
        this.type = data["type"]
        if(data["conditions"] != null && data["conditions"].length != null) {
            this.conditions = []
            for(let cData of data["conditions"]) {
                const c = Condition.build(cData);
                if(c != null)
                    this.conditions.push(c)
            }
        }
    }

    static build(data: RuleData): Rule|null {
        switch(data.type) {
            case 'smithed:prepend':
                return new Prepend(data);
            case 'smithed:append':
                return new Append(data);
            case 'smithed:merge':
                return new Merge(data);
            case 'smithed:insert':
                return new Insert(data);
            default:
                return null;
        }
    }

    getTypePriorty(): number {
        switch(this.type) {
            case 'smithed:prepend':
                return 0;
            case 'smithed:append':
                return 1;
            case 'smithed:merge':
                return -1;
            case 'smithed:insert':
                return -1;
            default:
                return 0;
        }
    }

    attempt(path: string): boolean {
        throw new Error('Not Implemented')
    }   

    handle(newTable: {}, sourceTable: {}): {} {
        throw new Error('Not Implemented')
    }
}

export class TargetSourceRule extends Rule {
    source: Source | any = {}
    target: string

    constructor(data: RuleData) {
        super(data);
        this.target = data["target"];
        this.source = Source.build(data["source"]);
    }

    override attempt(path: string): boolean {
        return path === this.target
    }

    getFromSource(sourceTable: {}): {} {
        if(this.source instanceof Source)
            return this.source.handle(sourceTable)
        else
            return this.source;
    }
}

export class Merge extends TargetSourceRule {

    handle(newTable: {}, sourceTable: {}): {} {
        const sourceData = this.getFromSource(sourceTable);


        PathFetcher.atDataFromPath(newTable, this.target, (data) => {
            
            data = sourceData;
            
        })

        return newTable;
    }
}

export class Append extends TargetSourceRule {


    handle(newTable: {}, sourceTable: {}): {} {
        const sourceData = this.getFromSource(sourceTable);

        PathFetcher.atDataFromPath(newTable, this.target, (data) => {
            
            if(data instanceof Array) {
                
                data.push(sourceData);
            }
            
        })

        return newTable;
    }
}

export class Prepend extends TargetSourceRule {

    handle(newTable: {}, sourceTable: {}): {} {
        const sourceData = this.getFromSource(sourceTable);

        PathFetcher.atDataFromPath(newTable, this.target, (data) => {
            
            if(data instanceof Array) {
                
                data.unshift(sourceData);
            }
            
        })

        return newTable;
    }
}

export class Insert extends TargetSourceRule {
    index: number = 0;
    constructor(data: RuleData) {
        super(data);
        this.index = data["index"];
    }


    handle(newTable: {}, sourceTable: {}): {} {
        const sourceData = this.getFromSource(sourceTable);

        PathFetcher.atDataFromPath(newTable, this.target, (data) => {
            if(data instanceof Array) {
                
                data.splice(this.index, 0, sourceData);
            }
        })

        return newTable;
    }
}


