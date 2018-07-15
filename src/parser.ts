import { AbsynthLexer } from './lexer';
import { Parser } from 'jison';

export class AbsynthParser {
    private lexer: AbsynthLexer;
    private parser: Parser;

    constructor() {
        this.lexer = new AbsynthLexer();
        this.parser = new Parser({
            bnf: {
                'program': [['expression EOF', 'return $1;']],
                'declaration': [['T_LET IDENTIFIER', '$$ = {type: \'declaration\', name: yytext};']],
                'assignment': [['declaration EQUALS expression', '$$ = {type: \'assignment\', left: $1, right: $3};']],
                'expression': [['constant_number', '$$ = $1;'], ['assignment', '$$ = $1;']],
                'constant_number': [
                    ['NUMBER_HEX', '$$ = {type: \'number\', value: new Number(yytext)};'],
                    ['NUMBER', '$$ = {type: \'number\', value: new Number(yytext)};']
                ]
            }
        });
        this.parser.lexer = this.lexer.lexerInstance();
    }

    parse(source: string) {
        return this.parser.parse(source);
    }
}