import { ModuleOverlord, Module } from "./modules/_Base";
import { AbsynthLexer, AbsynthParser } from "./ast";

export class Absynth {
    readonly lexer: AbsynthLexer;
    readonly parser: AbsynthParser;
    private overlord: ModuleOverlord;

    static create(src: string, modules: Module[]) {
        if (!src.startsWith('@@absynth')) {
            throw Error('File is not start with @@absynth keyword');
        }

        let declaration = src.split('\n')[0].trim();
        declaration = declaration.substring('@@absynth'.length + 1);
        declaration = declaration.substring(0, declaration.length - 1);
        let mods = declaration.split(',').map((v) => v.trim());
        let m = modules.filter((v) => mods.indexOf(v.getModuleId()) >= 0);
        return new Absynth(m);
    }

    constructor(modules: Module[]) {
        this.overlord = new ModuleOverlord();
        for (let m of modules) {
            this.overlord.addModule(m);
        }
        let config = this.overlord.prepare();
        this.lexer = new AbsynthLexer(config.lex);
        this.parser = new AbsynthParser(config.lex, config.ebnf);
    }
}