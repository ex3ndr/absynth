import { AbsynthParser } from './parser';
describe('Parser', () => {
    it('parse simple expression', () => {
        let parser = new AbsynthParser();
        let res = parser.parse('let i = 123');
        console.log(res);
        // expect(lexer.lex('0xAAA 0xBBB  123')).toEqual(['NUMBER_HEX', 'SPACE', 'NUMBER_HEX', 'SPACE', 'NUMBER']);
    });
});