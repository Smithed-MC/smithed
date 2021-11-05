export interface ConditionData {type: string, [key:string]: any}
export class Condition {
    type: string = ''
    constructor(data: Condition) {
        this.type = data["type"]
    }

    static build(data: ConditionData): Condition|null {
        switch(data.type) {
            case 'smithed:pack_check':
                return new PackCheckCondition(data);
            case 'smithed:inverted':
                return new InvertedCondition(data);
            default:
                return null;
        }
    }
}

export class PackCheckCondition extends Condition {
    pack: string;
    constructor(data: ConditionData) {
        super(data)
        this.pack = data["pack"];
    }
}

export class InvertedCondition extends Condition {
    condition: Condition|null;
    constructor(data: ConditionData) {
        super(data)
        this.condition = Condition.build(data["condition"])
    }
}