import { Module } from './Module';
import { ModuleContext } from './ModuleContext';

export class ModuleResolver {
    private modules: Module[] = [];
    private generator: Module | undefined = undefined;

    addModule(module: Module) {
        this.modules.push(module);
    }

    getModuleById(id: string) {
        let res = this.modules.find((v) => v.getModuleId() === id);
        if (!res) {
            throw Error('Unable to find module ' + id);
        }
        return res!!;
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

        this.generator = this.modules.find((v) => v.isGenerator());

        // Return
        return {
            lex: context.buildLexerRules(),
            ebnf: context.buildParsingTable()
        };
    }

    getGenerator(): Module | undefined {
        return this.generator;
    }
}