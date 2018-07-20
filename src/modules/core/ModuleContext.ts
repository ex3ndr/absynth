export class ModuleContext {

    private lexTable = new Map<number, string[][]>();
    private existingLexemes = new Set<string>();
    private parsingTable: { [key: string]: string[][] } = {};

    registerLexeme(regex: string, type: string, priority?: number) {
        if (this.existingLexemes.has(regex)) {
            throw Error('\'' + regex + '\' regex already registered!');
        }
        this.existingLexemes.add(regex);
        let p = priority || 5;
        if (!this.lexTable.has(p)) {
            this.lexTable.set(p, []);
        }
        this.lexTable.get(p)!!.push([regex, type]);
    }

    registerRules(rules: { [key: string]: string[][] }) {
        this.parsingTable = { ...this.parsingTable, ...rules };
    }

    buildLexerRules() {
        let keys = Array.from(this.lexTable.keys());
        keys.sort((a, b) => a - b);
        let lexRules: string[][] = [];
        for (let k of keys) {
            let rules = this.lexTable.get(k)!!;
            for (let r of rules) {
                lexRules.push(r);
            }
        }
        return lexRules;
    }

    buildParsingTable() {
        return this.parsingTable;
    }
}
