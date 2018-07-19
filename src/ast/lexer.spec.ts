import { Absynth } from '../Absynth';
import { Basics } from '../modules/Basics';
import { Expressions } from '../modules/Expressions';
import { Experiments } from '../modules/Experiments';

describe('Lexer', () => {
    let absynth: Absynth;
    beforeAll(() => {
        absynth = new Absynth([new Basics(), new Expressions(), new Experiments()]);
    });
    it('should parse numbers and hex numbers', () => {
        expect(absynth.lexer.lex('0xAAA 0xBBB  123')).toEqual(['NUMBER_HEX', 'NUMBER_HEX', 'NUMBER']);
    });
    it('should parse strings', () => {
        expect(absynth.lexer.lex('\'Some weird string\'')).toEqual(['STRING']);
    });
    it('should parse idenitfiers', () => {
        expect(absynth.lexer.lex('println')).toEqual(['IDENTIFIER']);
    });
    it('should parse backets', () => {
        expect(absynth.lexer.lex('(println)')).toEqual(['(', 'IDENTIFIER', ')']);
    });
    it('should parse keywords', () => {
        expect(absynth.lexer.lex('model \'Module\'')).toEqual(['T_MODEL', 'STRING']);
    });
});