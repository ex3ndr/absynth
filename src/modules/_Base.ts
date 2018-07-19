export abstract class Module {
    abstract getModuleId(): string;
    abstract prepare(context: ModuleOverlord): void;
    abstract applyContext(context: ModuleContext): void;
}

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

export function forward(index?: number | string) {
    if (index) {
        return '$$ = $' + index + ';';
    }
    return '$$ = $1;';
}

export function location(start?: number | string, end?: number | string) {
    let s = start || 1;
    let e = end || 1;
    return 'first_column: @' + s + '.first_column, ' +
        'first_line: @' + s + '.first_line, ' +
        'last_column: @' + e + '.last_column, ' +
        'last_line: @' + e + '.last_line';
}

export class ModuleOverlord {
    private modules: Module[] = [];

    addModule(module: Module) {
        this.modules.push(module);
    }

    getModuleById(id: string) {
        return this.modules.find((v) => v.getModuleId() === id);
    }

    prepare() {
        // Prepare
        for (let m of this.modules) {
            m.prepare(this);
        }

        // Build
        let context = new ModuleContext();
        for (let m of this.modules) {
            m.applyContext(context);
        }
        return {
            lex: context.buildLexerRules(),
            ebnf: context.buildParsingTable()
        };
    }
}