import { Absynth } from '../Absynth';
import { ModuleCore } from '../modules/ModuleCore';
import { ModuleExpressions } from '../modules/ModuleExpressions';
import { ModuleExperimental } from '../modules/experimental';

describe('Lexer', () => {
    let absynth: Absynth;
    beforeAll(() => {
        absynth = new Absynth([new ModuleCore(), new ModuleExpressions(), new ModuleExperimental()]);
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