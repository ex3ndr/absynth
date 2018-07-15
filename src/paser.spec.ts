import { AbsynthParser } from './parser';
describe('Parser', () => {
    it('parse simple assignment expression with strings', () => {
        let parser = new AbsynthParser();
        let res = parser.parse('let i = \'123\'');
        expect(res).toMatchSnapshot();
    });
    it('parse simple assignment expression with calculus', () => {
        let parser = new AbsynthParser();
        let res = parser.parse('let i = 123 + 1/2');
        expect(res).toMatchSnapshot();
    });
    it('should parse statements', () => {
        let parser = new AbsynthParser();
        let res = parser.parse('let i = 123 + 1/2; let j = 0;');
        expect(res).toMatchSnapshot();
    });
    it('should parse calls', () => {
        let parser = new AbsynthParser();
        let res = parser.parse('println()');
        expect(res).toMatchSnapshot();
        res = parser.parse('println(123,3444)');
        expect(res).toMatchSnapshot();
    });
    it('should parse calls multiple lines', () => {
        let parser = new AbsynthParser();
        let res = parser.parse('println()\nprintln()');
        expect(res).toMatchSnapshot();
    });

    it('should handle empty lines', () => {
        let parser = new AbsynthParser();
        let res = parser.parse('\n\nprintln()\nprintln()');
        expect(res).toMatchSnapshot();
    });

    it('should handle braces', () => {
        let parser = new AbsynthParser();
        let res = parser.parse('{ \n\nprintln()\nprintln() }');
        expect(res).toMatchSnapshot();
        res = parser.parse('{println()\nprintln()}');
        expect(res).toMatchSnapshot();
        res = parser.parse('{\nprintln();\n}');
        expect(res).toMatchSnapshot();
    });

    it('should handle modules', () => {
        let parser = new AbsynthParser();
        let res = parser.parse('model \'Module\' { }');
        expect(res).toMatchSnapshot();
    });
});