import { ModuleResolver } from "./modules/core/ModuleResolver";
import { Module } from "./modules/core/Module";
import { AbsynthLexer } from "./parser/lexer";
import { AbsynthParser } from "./parser/parser";

export class Absynth {
    readonly lexer: AbsynthLexer;
    readonly parser: AbsynthParser;
    private resolver: ModuleResolver;

    static create(src: string, modules: Module[]) {
        if (!src.startsWith('@@absynth')) {
            throw Error('File is not start with @@absynth keyword');
        }

        let declaration = src.split('\n')[0].trim();
        declaration = declaration.substring('@@absynth'.length + 1);
        declaration = declaration.substring(0, declaration.length - 1);
        let mods = declaration.split(',').map((v) => v.trim());
        for (let m2 of mods) {
            let mod = modules.find((v) => v.getModuleId() === m2);
            if (!mod) {
                throw Error('Unable to find ' + m2);
            }
        }
        let m = modules.filter((v) => mods.indexOf(v.getModuleId()) >= 0);
        return new Absynth(m);
    }

    constructor(modules: Module[]) {
        this.resolver = new ModuleResolver();
        for (let m of modules) {
            this.resolver.addModule(m);
        }
        let config = this.resolver.prepare();
        this.lexer = new AbsynthLexer(config.lex);
        this.parser = new AbsynthParser(config.lex, config.ebnf);
    }

    canGenerate() {
        return !!this.resolver.getGenerator();
    }

    generate(src: string) {
        return this.resolver.getGenerator()!!.generate(this.parser.parse(src));
    }
}