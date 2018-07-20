// export { AbsynthLexer } from './lexer';
// export { AbsynthParser } from './parser';

// export type ASTNodeType = 'number' | 'string' | 'declaration' | 'assignment' | 'program' | 'operation' | 'statements';

interface ASTBaseNode {
    first_column: number;
    first_line: number;
    last_column: number;
    last_line: number;
}

export interface ASTGraphqlType extends ASTBaseNode {
    type: 'type';
    name: ASTId;
}

export interface ASTNumber extends ASTBaseNode {
    type: 'number';
    value: number;
}

export interface ASTString extends ASTBaseNode {
    type: 'string';
    value: string;
}

export interface ASTBoolean extends ASTBaseNode {
    type: 'boolean';
    value: boolean;
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
    name: ASTId;
    modifiers: ASTModifier[];
    fields: ASTModelField[];
}

export interface ASTId extends ASTBaseNode {
    type: 'id';
    name: string;
}

export interface ASTModelField extends ASTBaseNode {
    type: 'field';
    name: ASTId;
    field_type: ASTType;
    modifiers: ASTModifier[];
}

export interface ASTType extends ASTBaseNode {
    type: 'type_primitive' | 'type_reference';
    name: string;
    id: ASTId;
    required: boolean;
    resolvedType: ASTModel | ASTEnum;
}

export interface ASTModifier extends ASTBaseNode {
    type: 'modifier';
    name: string;
}

export interface ASTEnum extends ASTBaseNode {
    type: 'enum';
    name: ASTId;
    values: ASTString[];
}

export type ASTExpression = ASTOperation | ASTNumber | ASTString | ASTReference | ASTBoolean | ASTCall;

export type ASTNode = ASTNumber | ASTString | ASTDeclaration | ASTAssignment | ASTProgram | ASTOperation | ASTStatements | ASTCall | ASTModel | ASTModifier | ASTType | ASTId | ASTModelField | ASTEnum | ASTBoolean | ASTGraphqlType;