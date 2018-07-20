import { ASTProgram, ASTNode } from "../../parser";
import { GeneratorException } from "../core/GeneratorException";

interface GraphqlType {
    type: 'interface' | 'input' | 'type';
    name: string;
    fields: { name: string, type: GraphqlTypeReference }[];
}

interface GraphqlTypeReference {
    type: 'array' | 'reference';
    name: string;
    required: boolean;
}

class ASTResolver {
    types = new Map<String, GraphqlType>();
}

function buildAstNode(src: ASTNode, resolver: ASTResolver) {
    if (src.type === 'type') {
        let name = src.name.name;
        console.log(name);
        if (resolver.types.has(name)) {
            throw new GeneratorException('Double declaration', src);
        }
        resolver.types.set(name, {
            type: 'type',
            name: name,
            fields: []
        });
        // src.name.name;
        // return 'type ' + src.name.name;
    } else {
        throw new GeneratorException('Unsupported mode', src);
    }
}

function buildAst(src: ASTProgram) {
    let resolver = new ASTResolver();
    for (let s of src.value) {
        // console.log(s);
        buildAstNode(s, resolver);
    }
    return resolver;
}

// function generateNode(src: ASTNode): string {
//     if (src.type === 'type') {
//         src.name.name;
//         return 'type ' + src.name.name;
//     } else {
//         throw new GeneratorException('Unsupported mode', src);
//     }
// }

export function generateProgram(src: ASTProgram): string {
    return JSON.stringify(buildAst(src).types);
    // return src.value.map((v) => generateNode(v)).join('\n');
}