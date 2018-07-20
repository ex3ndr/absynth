import { Module } from "../core/Module";
import { ASTProgram } from "../../parser";
import { ModuleResolver } from "../core/ModuleResolver";
import { ModuleContext } from "../core/ModuleContext";
import { location } from "../core/utils";
import { ModuleCore } from "../ModuleCore";
import { generateProgram } from "./generator";

export class Graphql extends Module {
    static ID = 'graphql';
    getModuleId() {
        return Graphql.ID;
    }

    isGenerator() {
        return true;
    }

    generate(src: ASTProgram): string {
        return generateProgram(src);
    }

    prepare(context: ModuleResolver) {
        (context.getModuleById(ModuleCore.ID) as ModuleCore).addRootDeclaration('declaration_type');
    }

    applyContext(context: ModuleContext) {
        context.registerLexeme('extends', 'T_EXTENDS', 4);
        context.registerLexeme('enum', 'T_ENUM', 4);
        context.registerLexeme('type', 'T_TYPE', 4);
        context.registerLexeme('interface', 'T_INTERFACE', 4);
        context.registerLexeme('input', 'T_INPUT', 4);
        context.registerLexeme('\\@', '@');

        context.registerRules({
            'declaration_type': [
                ['(T_TYPE | T_INTERFACE | T_INPUT | T_ENUM)[start] id (T_EXTENDS id)? "{" declaration_type_fields[fields] "}"[end]', '$$ = {type:\'type\', src: $start, name: $2, fields: $fields, ' + location('start', 'end') + '};']
            ],
            'declaration_type_fields': [
                ['declaration_type_fields declaration_type_field', '$$ = [...$1, $2]'],
                ['declaration_type_field', '$$ = [$1]']
            ],
            'declaration_type_field': [
                [ 'annotation*[annotations] id ":" type', '$$ = {type: \'field\', annotations: $annotations, name: $1, type: $3, ' + location('id', 3) + '};']
            ],
            'type': [
                ['T_PRIMITIVE', '$$ = {type:\'type_primitive\', required: false, name: yytext, ' + location(1) + '}'],
                ['T_PRIMITIVE "!"', '$$ = {type:\'type_primitive\', required: true, name: $1, ' + location(1) + '}'],
                ['id', '$$ = {type:\'type_reference\', required: false, id: $1, ' + location(1) + '}'],
                ['id "!"', '$$ = {type:\'type_reference\', required: true, id: $1, ' + location(1) + '}'],
                ['"[" type "]"', '$$ = {type:\'type_array\', required: false, inner: $2, ' + location(1, 3) + ' }'],
                ['"[" type "]" "!"', '$$ = {type:\'type_array\', required: true, inner: $2, ' + location(1, 4) + ' }']
            ],
            'annotation': [
                ['"@" id', '$$ = {type:\'annotation\', name: $2, ' + location(1, 2) + '};']
            ]
        });
    }
}