import { AbsynthLexer } from './lexer';
import { Parser } from 'jison-gho';
import Lexer from 'lex';

export interface ASTNode {
    type: string;
}

export interface ASTNumber extends ASTNode {
    type: 'number';
    value: number;
}

export interface ASTString extends ASTNode {
    type: 'string';
    value: string;
}

export interface ASTDeclaration extends ASTNode {
    type: 'declaration';
    name: string;
}

export interface ASTAssignment extends ASTNode {
    type: 'assignment';
    left: ASTDeclaration;
    right: ASTNode;
}

export interface ASTProgram extends ASTNode {
    type: 'program';
    value: ASTNode;
}

export interface ASTOperation extends ASTNode {
    type: 'operation';
    op: 'string';
    left: ASTNode;
    right: ASTNode;
}

interface ParserException {
    hash: {
        recoverable: boolean;
        lexer: Lexer;
    };
}
export class AbsynthParser {
    private lexer: AbsynthLexer;
    private parser: Parser;

    constructor() {
        this.lexer = new AbsynthLexer();
        this.parser = new Parser({
            bnf: {
                'program': [['sections EOF', 'return {type: \'program\', value: $1};']],

                'sections': [
                    ['model', '$$=$1'],
                    ['block', '$$=$1'],
                    ['statements', '$$ = $1']
                ],

                'model': [
                    ['T_KEYWORD constant_string block', '$$ = {type:\'model\', name: $2, statements: $3};']
                ],

                'block': [
                    ['T_BRACE_OPEN statements T_BRACE_CLOSE', '$$ = $2'],
                    ['T_BRACE_OPEN T_BRACE_CLOSE', '$$ = {type:\'statements\', statements: []};'],
                    // ['statements', '$$ = $1']
                ],

                'statements': [
                    ['statements statement', '$$ = {type:\'statements\', statements: [...$1.statements, $2]};'],
                    ['statement', '$$ = {type:\'statements\', statements: [$1]};'],
                    // ['', '$$ = {type:\'statements\', statements: []};']
                ],

                'statement': [
                    ['call', '$$ = $1;'],
                    ['call T_SEMICOLON', '$$ = $1;'],
                    ['assignment', '$$ = $1;'],
                    ['assignment T_SEMICOLON', '$$ = $1;']
                ],

                'call': [
                    ['IDENTIFIER T_BRACKET_OPEN arguments T_BRACKET_CLOSE', '$$ = {type:\'call\', name: $1, arguments: $3};'],
                ],

                'arguments': [
                    ['expression T_COMMA arguments', '$$ = [$1, ...$3];'],
                    ['expression', '$$ = [$1];'],
                    ['', '$$ = [];']
                ],

                'assignment': [['declaration EQUALS expression', '$$ = {type: \'assignment\', left: $1, right: $3};']],
                'declaration': [['T_LET IDENTIFIER', '$$ = {type: \'declaration\', name: yytext};']],

                'expression': [
                    ['expression_additive', '$$ = $1;']
                ],
                'expression_additive': [
                    ['expression_multiple T_PLUS expression_additive', '$$ = {type:\'operation\', op: \'+\', left: $1, right: $3};'],
                    ['expression_multiple T_MINUS expression_additive', '$$ = {type:\'operation\', op: \'-\', left: $1, right: $3};'],
                    ['expression_multiple', '$$ = $1;']
                ],
                'expression_multiple': [
                    ['constant T_MULT expression_multiple', '$$ = {type:\'operation\', op: \'*\', left: $1, right: $3};'],
                    ['constant T_DIV expression_multiple', '$$ = {type:\'operation\', op: \'/\', left: $1, right: $3};'],
                    ['constant', '$$ = $1;']
                ],
                'constant': [
                    ['IDENTIFIER', '$$ = {type: \'reference\', name: yytext};'],
                    ['constant_number', '$$ = $1;'],
                    ['constant_string', '$$ = $1;'],
                ],
                'constant_number': [
                    ['NUMBER_HEX', '$$ = {type: \'number\', value: parseInt(yytext)};'],
                    ['NUMBER', '$$ = {type: \'number\', value: parseInt(yytext)};']
                ],
                'constant_string': [
                    ['STRING', '$$ = {type: \'string\', value: yytext};']
                ]
            }
        });
        this.parser.lexer = this.lexer.lexerInstance();
    }

    parse(source: string): ASTProgram {
        return this.parser.parse(source);
    }

    parseDiagnostics(source: string): number {
        try {
            this.parser.parse(source);
        } catch (e) {
            // console.warn(e);
            let ex = e as ParserException;
            // console.warn(ex.hash.lexer.index);
            // console.warn(ex.hash.lexer !== this.lexer.lexerInstance());
            return ex.hash.lexer.index;
        }
        return -1;
    }
}