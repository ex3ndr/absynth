import { AbsynthLexer } from './lexer';

describe('Lexer', () => {
    let lexer: AbsynthLexer;
    beforeAll(() => {
        lexer = new AbsynthLexer();
    });
    it('should parse numbers and hex numbers', () => {
        expect(lexer.lex('0xAAA 0xBBB  123')).toEqual(['NUMBER_HEX', 'NUMBER_HEX', 'NUMBER']);
    });
    it('should parse strings', () => {
        expect(lexer.lex('\'Some weird string\'')).toEqual(['STRING']);
    });
    it('should parse idenitfiers', () => {
        expect(lexer.lex('println')).toEqual(['IDENTIFIER']);
    });
    it('should parse backets', () => {
        expect(lexer.lex('(println)')).toEqual(['T_BRACKET_OPEN', 'IDENTIFIER', 'T_BRACKET_CLOSE']);
    });
    it('should parse keywords', () => {
        expect(lexer.lex('model \'Module\'')).toEqual(['T_KEYWORD', 'STRING']);
    });
});