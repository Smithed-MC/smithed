import PathFetcher from "./pathFetcher";

export interface SourceData {type: string, [key:string]: any}
export class Source {
    type: string = ''
    static builds: ((data: SourceData) => Source)[];

    constructor(data: SourceData) {
        this.type = data.type; 
    }

    static build(data: any): (Source | any) {
        if(data["type"] != null) {
            switch(data["type"]) {
                case 'smithed:reference':
                    return new ReferenceSource(data as SourceData);
                case 'smithed:value':
                    return new ValueSource(data as SourceData);
                default:
                    return data;
            }
        } else {
            return data;
        }
    }

    handle(sourceTable: {}): {} {
        throw new Error('Not Implemented')
    }
}

export class ReferenceSource extends Source {
    path: string;
    constructor(data: SourceData) {
        super(data)
        this.path = data["path"]
    }

    
    handle(sourceTable: {}): {} {
        const data = PathFetcher.getDataFromPath(sourceTable, this.path);
    
        return data != null ? data : {} 
    }
}

export class ValueSource extends Source {
    data: any;
    constructor(data: SourceData) {
        super(data)
        this.data = data["data"]
    }

    
    handle(sourceTable: {}): {} {
        return this.data;
    }
}