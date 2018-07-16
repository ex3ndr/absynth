export { AbsynthLexer } from './lexer';
export { AbsynthParser } from './parser';

// export type ASTNodeType = 'number' | 'string' | 'declaration' | 'assignment' | 'program' | 'operation' | 'statements';

interface ASTBaseNode {
    first_column: number;
    first_line: number;
    last_column: number;
    last_line: number;
}

export interface ASTNumber extends ASTBaseNode {
    type: 'number';
    value: number;
}

export interface ASTString extends ASTBaseNode {
    type: 'string';
    value: string;
}

export interface ASTDeclaration extends ASTBaseNode {
    type: 'declaration';
    name: string;
}

export interface ASTReference extends ASTBaseNode {
    type: 'reference';
    name: string;
}

export interface ASTAssignment extends ASTBaseNode {
    type: 'assignment';
    left: ASTDeclaration;
    right: ASTExpression;
}

export interface ASTProgram extends ASTBaseNode {
    type: 'program';
    value: ASTNode[];
}

export interface ASTOperation extends ASTBaseNode {
    type: 'operation';
    op: string;
    left: ASTExpression;
    right: ASTExpression;
}

export interface ASTStatements extends ASTBaseNode {
    type: 'statements';
    statements: ASTNode[];
}

export interface ASTCall extends ASTBaseNode {
    type: 'call';
    name: string;
    arguments: ASTExpression[];
}

export interface ASTModel extends ASTBaseNode {
    type: 'model';
    name: ASTString;
    modifiers: ASTModifier[];
    statements: ASTStatements;
}

export interface ASTModifier extends ASTBaseNode {
    type: 'modifier';
    name: string;
}

export type ASTExpression = ASTOperation | ASTNumber | ASTString | ASTReference;

export type ASTNode = ASTNumber | ASTString | ASTDeclaration | ASTAssignment | ASTProgram | ASTOperation | ASTStatements | ASTCall | ASTModel | ASTModifier;