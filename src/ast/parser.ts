import { AbsynthLexer, lexerTable } from './lexer';
import { Parser } from 'jison-gho';
import Lexer from 'lex';
import { ASTProgram } from '.';

interface ParserException {
    hash: {
        recoverable: boolean;
        lexer: Lexer;
        loc?: {
            first_line: number,
            first_column: number,
            last_line: number,
            last_column: number,
            range: number[]
        }
    };
}

function location(start?: number, end?: number) {
    let s = start || 1;
    let e = end || 1;
    return ', ' +
        'first_column: @' + s + '.first_column, ' +
        'first_line: @' + s + '.first_line, ' +
        'last_column: @' + e + '.last_column, ' +
        'last_line: @' + e + '.last_line';
}

export class AbsynthParser {
    private lexer: AbsynthLexer;
    private parser: Parser;

    constructor() {
        this.lexer = new AbsynthLexer();
        this.parser = new Parser({
            lex: {
                rules: lexerTable.map((v) => [v[0], v[1] !== '' ? 'return \'' + v[1] + '\';' : '']),
            },
            bnf: {

                //
                // Program Root
                //

                'program': [['root_declarations EOF', 'return {type: \'program\', value: $1' + location() + '};']],

                //
                // Root Sections
                //

                'root_declarations': [
                    ['root_declarations root_declaration', '$$ = [...$1, $2]'],
                    ['root_declaration', '$$ = [$1]']
                ],

                'root_declaration': [
                    ['model', '$$ = $1'],
                    ['statements_block', '$$ = $1'],
                    ['statement', '$$ = $1'],
                ],

                //
                // Model Definitions
                //

                'model': [
                    ['modifiers T_MODEL constant_string statements_block', '$$ = {type:\'model\', modifiers: $1, name: $3, statements: $4' + location(2, 4) + '};']
                ],

                'modifiers': [
                    ['modifiers modifier', '$$ = [...$1, $2]'],
                    // ['T_MODIFIER', '$$ = {type:\'modifiers\', keywords: yytext' + location(1) + '}'],
                    ['', '$$ = []']
                ],

                'modifier': [
                    ['T_MODIFIER', '$$ = {type:\'modifier\', name: yytext' + location(1) + '}']
                ],

                //
                // Statements
                //

                'statements_block': [
                    ['T_BRACE_OPEN statements T_BRACE_CLOSE', '$$ = $2'],
                    ['T_BRACE_OPEN T_BRACE_CLOSE', '$$ = {type:\'statements\', statements: []' + location(1, 2) + '};'],
                ],

                'statements': [
                    ['statements statement', '$$ = {type:\'statements\', statements: [...$1.statements, $2]' + location(1, 2) + '};'],
                    ['statement', '$$ = {type:\'statements\', statements: [$1]' + location(1) + '};'],
                ],

                'statement': [
                    ['call', '$$ = $1;'],
                    ['call T_SEMICOLON', '$$ = $1;'],
                    ['assignment', '$$ = $1;'],
                    ['assignment T_SEMICOLON', '$$ = $1;'],
                    ['T_RETURN expression', '$$ = {type:\'return\', expression: $2' + location(1, 2) + ' }'],
                    ['T_RETURN expression T_SEMICOLON', '$$ = {type:\'return\', expression: $2' + location(1, 3) + '}']
                ],

                //
                // Variable declaration
                //

                'declaration_variable': [['T_LET IDENTIFIER', '$$ = {type: \'declaration\', name: yytext ' + location(1) + '};']],
                'assignment': [['declaration_variable EQUALS expression', '$$ = {type: \'assignment\', left: $1, right: $3' + location(1, 3) + '};']],

                //
                // Global function call
                //

                'call': [
                    ['IDENTIFIER T_BRACKET_OPEN arguments T_BRACKET_CLOSE', '$$ = {type:\'call\', name: $1, arguments: $3' + location(1, 4) + '};'],
                ],
                'arguments': [
                    ['expression T_COMMA arguments', '$$ = [$1, ...$3];'],
                    ['expression', '$$ = [$1];'],
                    ['', '$$ = [];']
                ],

                //
                // Expressions of all kind. Anything that eventually resolved to a value.
                //

                'expression': [
                    ['expression_additive', '$$ = $1;'],
                ],
                'expression_additive': [
                    ['expression_multiple T_PLUS expression_additive', '$$ = {type:\'operation\', op: \'+\', left: $1, right: $3' + location(1, 3) + '};'],
                    ['expression_multiple T_MINUS expression_additive', '$$ = {type:\'operation\', op: \'-\', left: $1, right: $3' + location(1, 3) + '};'],
                    ['expression_multiple', '$$ = $1;']
                ],
                'expression_multiple': [
                    ['constant T_MULT expression_multiple', '$$ = {type:\'operation\', op: \'*\', left: $1, right: $3' + location(1, 3) + '};'],
                    ['constant T_DIV expression_multiple', '$$ = {type:\'operation\', op: \'/\', left: $1, right: $3' + location(1, 3) + '};'],
                    ['expression_terminal', '$$ = $1;']
                ],
                'expression_terminal': [
                    ['call', '$$=$1'],
                    ['constant', '$$ = $1']
                ],
                'constant': [
                    ['IDENTIFIER', '$$ = {type: \'reference\', name: yytext' + location(1) + '};'],
                    ['constant_number', '$$ = $1;'],
                    ['constant_string', '$$ = $1;'],
                ],
                'constant_number': [
                    ['NUMBER_HEX', '$$ = {type: \'number\', value: parseInt(yytext)' + location(1) + '};'],
                    ['NUMBER', '$$ = {type: \'number\', value: parseInt(yytext)' + location(1) + '};']
                ],
                'constant_string': [
                    ['STRING', '$$ = {type: \'string\', value: yytext.substring(1, yytext.length-1)' + location(1) + '};']
                ]
            }
        });
        // this.parser.lexer = this.lexer.lexerInstance();
    }

    parse(source: string): ASTProgram {
        return this.parser.parse(source);
    }

    parseDiagnostics(source: string): number[] | undefined {
        try {
            this.parser.parse(source);
        } catch (e) {
            // console.warn(e);
            let ex = e as ParserException;
            if (ex.hash.loc) {
                console.log('Lexer error');
                console.log(ex.hash.loc);
                console.log(ex.hash);
                return ex.hash.loc.range;
            } else {
                console.log((ex as any).hash);
            }
            // console.warn(ex.hash.lexer.index);
            // console.warn(ex.hash.lexer !== this.lexer.lexerInstance());
            // return ex.hash.lexer.index;
        }
        return undefined;
    }
}