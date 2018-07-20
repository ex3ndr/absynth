import { ModuleResolver } from "./ModuleResolver";
import { ModuleContext } from "./ModuleContext";
import { ASTProgram } from "../../parser";

export abstract class Module {
    abstract getModuleId(): string;
    abstract isGenerator(): boolean;
    abstract prepare(context: ModuleResolver): void;
    abstract applyContext(context: ModuleContext): void;
    abstract generate(ast: ASTProgram): string;
}