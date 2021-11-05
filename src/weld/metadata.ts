import { Rule } from "./rules";

export class Priority {
    default: number = 0;
    after: string[] = [];
    before: string[] = [];

    constructor(data: any) {
        if(data["default"] != null)
            this.default = data["default"]
        if(data["after"] != null)
            this.after = data["after"]
        if(data["before"] != null)
            this.before = data["before"]
    }
}


export class MetaData {
    rules: Rule[] = []
    priority: Priority
    constructor(data: any) {
        if(data["rules"] != null) {
            this.rules = []
            for(let r of data["rules"]) {
                const rule = Rule.build(r)
                if(rule != null) {
                    this.rules.push(rule);
                }
            }
        }
        if(data["priority"] != null) {
            this.priority = new Priority(data["priority"])
        } else {
            this.priority = new Priority({default: 0, after: [], before: []})
        }
    }

    static buildFromRawJson(data: any): MetaData|null {
        if(data["__smithed__"] != null) {
            return new MetaData(data["__smithed__"]);
        }
        return null;
    }
}