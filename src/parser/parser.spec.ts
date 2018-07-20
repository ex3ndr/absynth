import { AbsynthParser } from './parser';
import { Absynth } from '../Absynth';
import { ModuleCore } from '../modules/ModuleCore';
import { ModuleExpressions } from '../modules/ModuleExpressions';
import { ModuleExperimental } from '../modules/experimental';

function createParser() {
    return new Absynth([new ModuleCore(), new ModuleExpressions(), new ModuleExperimental()]).parser;
}

describe('Parser', () => {
    it('parse simple assignment expression with strings', () => {
        let parser = createParser();
        let res = parser.parse('let i = \'123\'');
        expect(res).toMatchSnapshot();
    });
    it('parse simple assignment expression with calculus', () => {
        let parser = createParser();
        let res = parser.parse('let i = 123 + 1/2');
        expect(res).toMatchSnapshot();
    });
    it('should parse statements', () => {
        let parser = createParser();
        let res = parser.parse('let i = 123 + 1/2; let j = 0;');
        expect(res).toMatchSnapshot();
    });
    it('should parse calls', () => {
        let parser = createParser();
        let res = parser.parse('println()');
        expect(res).toMatchSnapshot();
        res = parser.parse('println(123,3444)');
        expect(res).toMatchSnapshot();
    });
    it('should parse calls multiple lines', () => {
        let parser = createParser();
        let res = parser.parse('println()\nprintln()');
        expect(res).toMatchSnapshot();
    });

    it('should handle empty lines', () => {
        let parser = createParser();
        let res = parser.parse('\n\nprintln()\nprintln()');
        expect(res).toMatchSnapshot();
    });

    it('should handle braces', () => {
        let parser = createParser();
        let res = parser.parse('{ \n\nprintln()\nprintln() }');
        expect(res).toMatchSnapshot();
        res = parser.parse('{println()\nprintln()}');
        expect(res).toMatchSnapshot();
        res = parser.parse('{\nprintln();\n}');
        expect(res).toMatchSnapshot();
    });

    it('should handle modules', () => {
        let parser = createParser();
        let res = parser.parse(`model Module { field name: string }`);
        expect(res).toMatchSnapshot();
    });
});