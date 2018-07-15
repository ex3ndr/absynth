import { AbsynthLexer } from './lexer';
import { Parser } from 'jison-gho';

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

export class AbsynthParser {
    private lexer: AbsynthLexer;
    private parser: Parser;

    constructor() {
        this.lexer = new AbsynthLexer();
        this.parser = new Parser({
            bnf: {
                'program': [['statements EOF', 'return {type: \'program\', value: $1};']],

                'statements': [
                    ['statements T_SEMICOLON statement', '$$ = {type:\'statements\', statements: [...$1.statements, $3]};'],
                    ['statements T_SEMICOLON', '$$ = $1;'],
                    ['statement', '$$ = {type:\'statements\', statements: [$1]};']
                ],

                'statement': [
                    ['call', '$$ = $1;'],
                    ['assignment', '$$ = $1;']
                ],

                'call': [
                    ['IDENTIFIER T_BRACKET_OPEN arguments T_BRACKET_CLOSE', '$$ = {type:\'call\', name: $1, arguments: $3};']
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
            return this.lexer.lexerInstance().index;
        }
        return -1;
    }
}