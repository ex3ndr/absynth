import { ASTProgram, ASTNode, ASTExpression, ASTModel } from '../ast';

function generateExpression(src: ASTExpression): string {
    if (src.type === 'string') {
        return '\'' + src.value + '\'';
    } else if (src.type === 'number') {
        return '' + src.value;
    } else if (src.type === 'reference') {
        return src.name;
    } else if (src.op === '+') {
        return generateExpression(src.left) + ' + ' + generateExpression(src.right);
    } else if (src.op === '-') {
        return generateExpression(src.left) + ' - ' + generateExpression(src.right);
    } else if (src.op === '/') {
        return generateExpression(src.left) + ' / ' + generateExpression(src.right);
    } else if (src.op === '*') {
        return generateExpression(src.left) + ' * ' + generateExpression(src.right);
    } else {
        throw new GeneratorException('Unknown expression: ' + src.type, src);
    }
}

function generateModel(src: ASTModel): string {
    let pr = src.modifiers.find((v) => v.name === 'private');
    if (pr) {
        throw new GeneratorException('Model can\'t be private!', pr);
    }
    let res = 'export interface ' + src.name.value + 'Attributes {';

    res += '}';
    return res;
}

function generateStatement(src: ASTNode): string {
    if (src.type === 'call') {
        let actualName: string | undefined;
        if (src.name === 'println') {
            actualName = 'console.log';
        }
        if (!actualName) {
            throw new GeneratorException('Unable to resolve ' + src.name, src);
        }
        return actualName + '(' + src.arguments.map(generateExpression).join(', ') + ');';
    } else if (src.type === 'assignment') {
        return 'let ' + src.left.name + ' = ' + generateExpression(src.right) + ';';
    } else if (src.type === 'statements') {
        let res = '';
        for (let s of src.statements) {
            if (res.length > 0) {
                res += '\n';
            }
            res += generateStatement(s);
        }
        return '{\n' + res + '\n}';
    } else if (src.type === 'model') {
        return generateModel(src);
    } else {
        throw new GeneratorException('Unsupported mode', src);
    }
}

function generateProgram(src: ASTProgram): string {
    let res = '';
    for (let s of src.value) {
        if (res.length > 0) {
            res += '\n';
        }
        res += generateStatement(s);
    }
    return res;
}

export class GeneratorException extends Error {
    node: ASTNode;
    constructor(message: string, node: ASTNode) {
        super(message);
        this.node = node;
    }
}

export class AbsynthGenerator {

    generate(src: ASTProgram): string {
        return generateProgram(src);
    }
}