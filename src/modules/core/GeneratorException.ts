import { ASTNode } from "../../parser";

export class GeneratorException extends Error {
    node: ASTNode;
    constructor(message: string, node: ASTNode) {
        super(message);
        this.node = node;
    }
}