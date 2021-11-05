import DefaultDatapackBuilder from "slimeball/out/datapack";
import { FileData, parseData } from "slimeball/out/util";
import JSZip from 'jszip'
import { MetaData } from "./metadata";
import { asEnumerable } from "linq-es5";
import { TargetSourceRule } from "./rules";

const weldCategories = ['loot_tables','predicates','item_modifiers','dimension','dimension_type','worldgen','recipes']

export class WeldDatapackBuilder extends DefaultDatapackBuilder {
    data: JSZip
    
    constructor(data: JSZip) {
        super();
        this.data = data;
    }

    async mergeViaWeld(fileData: FileData, resolvedData: string[]) {
        // console.log('\n' + fileData.path)
        let baseTable = null
        if(fileData.namespace === 'minecraft') {
            const rawTable = this.data.file(fileData.path)
            if(rawTable != null) {
                const jsonString = await rawTable.async('string');
                baseTable = parseData(jsonString)
            }
        }

        let data: {}[] = [];
        for(let d of resolvedData) {
            const parsedData = parseData(d);
            const meta = MetaData.buildFromRawJson(parsedData)
            if(meta != null) {
                data.push(parsedData)
            }
        }

        data = asEnumerable(data).OrderBy(d => {
            const meta = MetaData.buildFromRawJson(d)

            return meta != null ? meta.priority.default : 0;
        }).ToArray();

        if(baseTable == null) {
            baseTable = data.shift()
        }

        let newTable = this.applyRules(baseTable, data);

        this.finalZip.file(fileData.path, JSON.stringify(newTable, null, 2));
        this.fileMap[fileData.namespace][fileData.category][fileData.path] = [];
    }

    private applyRules(baseTable: any, data: {}[]) {
        let newTable = baseTable;

        let rules: [number, TargetSourceRule][] = []

        for (let i = 0; i < data.length; i++) {
            const d = data[i];
            const meta = MetaData.buildFromRawJson(d);
            if(meta == null) continue;
            
            for (let r of meta.rules) {
                if(r instanceof TargetSourceRule)
                    rules.push([i, r])
            }
        }

        rules = asEnumerable(rules).OrderByDescending(r => r[1].getTypePriorty()).ThenByDescending(r => r[1].target.length).ToArray()

        
        rules.forEach(r => {
            // console.log(`${r[1].type} -> ${r[1].target} [${r[1].target.length}]`)

            newTable = r[1].handle(newTable, data[r[0]])
        })

        return newTable;
    }

    override async handleConflict(fileData: FileData, occurences: number[]) {
        const onSuccess = async (resolvedData: string[]) => {
            if(fileData.category === 'tags') {
                this.mergeTags(fileData, resolvedData);
            } 
            else if (weldCategories.includes(fileData.category)) {
                await this.mergeViaWeld(fileData, resolvedData);
            } else {
                this.finalZip.file(fileData.path, resolvedData[0]);
            }
        }

        const onFailure = (resolvedData: string[]) => {
            this.finalZip.file(fileData.path, resolvedData[0]);
            this.fileMap[fileData.namespace][fileData.category][fileData.path] = [];
        }
        await this.ifAnyDifferent(fileData, occurences, onSuccess, onFailure)
    }
}
