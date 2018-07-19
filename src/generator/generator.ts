import { ASTProgram, ASTNode, ASTExpression, ASTModel, ASTType } from '../ast';
import { AbsynthScope } from './scoping';

function generateExpression(src: ASTExpression): string {
    if (src.type === 'string') {
        return '\'' + src.value + '\'';
    } else if (src.type === 'number') {
        return '' + src.value;
    } else if (src.type === 'reference') {
        return src.name;
    } else if (src.type === 'boolean') {
        return '' + src.value + '';
    } else if (src.type === 'operation') {
        if (src.op === '+') {
            return '(' + generateExpression(src.left) + ' + ' + generateExpression(src.right) + ')';
        } else if (src.op === '-') {
            return '(' + generateExpression(src.left) + ' - ' + generateExpression(src.right) + ')';
        } else if (src.op === '/') {
            return '(' + generateExpression(src.left) + ' / ' + generateExpression(src.right) + ')';
        } else if (src.op === '*') {
            return '(' + generateExpression(src.left) + ' * ' + generateExpression(src.right) + ')';
        } else {
            throw new GeneratorException('Unknown optration: ' + src.op, src);
        }
    } else if (src.type === 'call') {
        let actualName: string | undefined;
        if (src.name === 'println') {
            actualName = 'console.log';
        }
        if (!actualName) {
            throw new GeneratorException('Unable to resolve ' + src.name, src);
        }
        return actualName + '(' + src.arguments.map(generateExpression).join(', ') + ')';
    } else {
        throw new GeneratorException('Unknown expression' + src, src);
    }
}

function resolveModelKeyType(src: ASTModel): string {
    let idField = src.fields.find((v) => !!v.modifiers.find((v2) => v2.name === 'primary'));
    if (!idField) {
        throw new GeneratorException('Unable to find type', src);
    }
    return generateReferencedType(idField.field_type);
}

function resolveModelKeyName(src: ASTModel): string {
    let idField = src.fields.find((v) => !!v.modifiers.find((v2) => v2.name === 'primary'));
    if (!idField) {
        throw new GeneratorException('Unable to find type', src);
    }
    return idField.name.name;
}

function generateReferencedType(src: ASTType): string {
    if (src.type === 'type_primitive') {
        if (src.name === 'int') {
            return 'number';
        }
        if (src.name === 'string') {
            return 'string';
        }
    } else if (src.type === 'type_reference') {
        if (src.resolvedType!!.type === 'model') {
            return resolveModelKeyType(src.resolvedType!! as ASTModel);
        } else if (src.resolvedType.type === 'enum') {
            return src.resolvedType.name.name;
        }
    }
    throw new GeneratorException('Unable to resolve type', src);
}

function capitalize(src: string): string {
    return src.charAt(0).toUpperCase() + src.substring(1);
}

function generateModel(src: ASTModel): string {
    let pr = src.modifiers.find((v) => v.name === 'private');
    if (pr) {
        throw new GeneratorException('Model can\'t be private!', pr);
    }

    //
    // Attributes
    //

    let res = 'export interface ' + src.name.name + 'Attributes {';
    let ex = new Set<string>();
    for (let f of src.fields) {
        if (ex.has(f.name.name)) {
            throw new GeneratorException('Duplicate field declaration', f.name);
        }
        ex.add(f.name.name);

        let type = generateReferencedType(f.field_type);
        if (!f.field_type.required) {
            type += ' | null';
        }
        let name = f.name.name;
        if (f.field_type.type === 'type_reference') {
            if (f.field_type.resolvedType!!.type === 'model') {
                name = f.name.name + capitalize(resolveModelKeyName(f.field_type.resolvedType!! as ASTModel));
            }
        }
        res += '\n    ' + name + ': ' + type + ';';
    }
    res += '\n}\n\n';

    //
    // Instante
    //

    res += 'export interface ' + src.name.name + ' extends sequelize.Instance<Partial<' + src.name.name + 'Attributes>>, ' + src.name.name + 'Attributes {';
    for (let f of src.fields) {
        if (f.field_type.type === 'type_reference') {
            if (f.field_type.resolvedType!!.type === 'model') {
                let type = f.field_type.resolvedType!!.name.name;
                let name = f.name.name;
                if (!f.field_type.required) {
                    type += ' | null';
                }
                res += '\n    ' + name + ': ' + type + ' | undefined;';
            }
            // res += '\n    get' + capitalize(name) + '(options?: any): Promise<' + type + '>;';
        }
    }
    res += '\n    readonly createdAt: Date;';
    res += '\n    readonly updatedAt: Date;';
    for (let f of src.fields) {
        if (f.field_type.type === 'type_reference') {
            if (f.field_type.resolvedType!!.type === 'model') {
                let type = f.field_type.resolvedType!!.name.name;
                let name = f.name.name;
                if (!f.field_type.required) {
                    type += ' | null';
                }
                // res += '\n    ' + name + ': ' + type + ' | undefined;';
                res += '\n    get' + capitalize(name) + '(options?: any): Promise<' + type + '>;';
            }
        }
    }
    res += '\n}\n';

    //
    // Table
    //

    res += 'export const ' + src.name.name + 'Table = connection.define<' + src.name.name + ', Partial<' + src.name.name + 'Attributes>>(\'' + src.name.name + '\', {';

    for (let f of src.fields) {
        let attrs = 'allowNull: ' + !f.field_type.required;
        if (f.modifiers.find((v) => v.name === 'primary')) {
            attrs += ', primaryKey: true, autoIncrement: true';
        }
        if (f.field_type.type === 'type_primitive') {
            if (f.field_type.name === 'string') {
                attrs += ', type: sequelize.STRING';
            } else if (f.field_type.name === 'int') {
                attrs += ', type: sequelize.INTEGER';
            } else {
                throw new GeneratorException('Unknown type', f.field_type);
            }
            // let type = f.field_type.resolvedType!!.name.name;
            // let name = f.name.name;
            // if (!f.field_type.required) {
            //     type += ' | null';
            // }
            // // res += '\n    ' + name + ': ' + type + ' | undefined;';
            // res += '\n    get' + capitalize(name) + '(options?: any): Promise<' + type + '>;';
            res += '\n    ' + f.name.name + ': { ' + attrs + ' },';
        } else if (f.field_type.type === 'type_reference') {
            // Ignore
            // res += '\n    ' + f.name.name + ': { ' + attrs + ', },';
        } else {
            throw new GeneratorException('Unknown type', f.field_type);
        }
    }

    res += '\n});\n';

    for (let f of src.fields) {
        if (f.field_type.type === 'type_reference') {
            res += '\n' + src.name.name + 'Table.belongsTo(' + f.field_type.resolvedType!!.name.name + 'Table, { as: \'' + f.name.name + '\' });';
            //
        }
    }

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
    } else if (src.type === 'enum') {
        return 'type ' + src.name.name + ' = ' + src.values.map((v) => '\'' + v.value + '\'').join(' | ') + ';';
    } else {
        console.log(JSON.stringify(src));
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
        let scope = new AbsynthScope();
        scope.collectDeclarations(src);
        scope.resolveReferences(src);
        return generateProgram(src);
    }
}