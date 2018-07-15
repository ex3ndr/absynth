import { AbsynthLexer } from './lexer';

describe('Lexer', () => {
    let lexer: AbsynthLexer;
    beforeAll(() => {
        lexer = new AbsynthLexer();
    });
    it('should parse numbers and hex numbers', () => {
        expect(lexer.lex('0xAAA 0xBBB  123')).toEqual(['NUMBER_HEX', 'SPACE', 'NUMBER_HEX', 'SPACE', 'NUMBER']);
    });
    it('should parse strings', () => {
        expect(lexer.lex('\'Some weird string\'')).toEqual(['STRING']);
    });
    it('should parce idenitfiers', () => {
        expect(lexer.lex('println')).toEqual(['IDENTIFIER']);
    });
    it('should parce backets', () => {
        expect(lexer.lex('(println)')).toEqual(['BRACKET_OPEN', 'IDENTIFIER', 'BRACKET_CLOSE']);
    });
});