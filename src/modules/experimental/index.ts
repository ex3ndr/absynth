import { Module } from "../core/Module";
import { ASTProgram } from "../../parser";
import { ModuleResolver } from "../core/ModuleResolver";
import { ModuleCore } from "../ModuleCore";
import { ModuleContext } from "../core/ModuleContext";
import { location } from "../core/utils";

export class ModuleExperimental extends Module {
    static ID = 'experiments';

    getModuleId() {
        return ModuleExperimental.ID;
    }

    isGenerator() {
        return false;
    }

    generate(src: ASTProgram): string {
        throw Error('Not supported');
    }

    prepare(context: ModuleResolver) {
        let basicModule = context.getModuleById(ModuleCore.ID) as ModuleCore;
        basicModule.addRootDeclaration('model');
        basicModule.addRootDeclaration('repo');
        basicModule.addRootDeclaration('statements_block');
        basicModule.addRootDeclaration('statement');
        basicModule.addRootDeclaration('declaration_type');
    }

    applyContext(context: ModuleContext) {
        context.registerLexeme('let', 'T_LET');
        context.registerLexeme('return', 'T_RETURN');
        context.registerLexeme('model', 'T_MODEL');
        context.registerLexeme('field', 'T_FIELD');
        context.registerLexeme('enum', 'T_ENUM');
        context.registerLexeme('repository', 'T_REPO');
        context.registerLexeme('query', 'T_QUERY');
        context.registerLexeme('from', 'T_FROM');
        context.registerLexeme('where', 'T_WHERE');
        context.registerLexeme('(private|public|readonly|index|primary)', 'T_MODIFIER');

        context.registerRules({

            //
            // Repositories
            //

            'repo': [
                ['T_REPO id repo_block', '$$ = { type: \'repository\', name: $2, contents: $3, ' + location(1, 3) + '};']
            ],
            'repo_block': [
                ['"{" (repo_declaration)* "}"', '$$ = $2'],
            ],
            'repo_declaration': [
                ['T_QUERY id "(" arguments ")" statements_block', '$$ = { type: \'query\', name: $2 };']
            ],

            //
            // Models
            //

            'model': [
                ['modifiers T_MODEL id model_fields_block', '$$ = {type:\'model\', modifiers: $1, name: $3, fields: $4, ' + location(2, 4) + '};']
            ],

            'model_fields_block': [
                ['"{" model_fields "}"', '$$ = $2;'],
                ['"{" "}"', '$$ = [];'],
                //   ['model_block model_field'],
                //   ['model_field']
            ],

            'model_fields': [
                ['model_fields model_field', '$$ = [...$1, $2];'],
                ['model_field', '$$ = [$1];']
            ],

            'model_field': [
                ['modifiers T_FIELD id ":" type', '$$ = {type:\'field\', modifiers: $1, name: $3, field_type: $5, ' + location(2, 5) + '}']
            ],

            'modifiers': [
                ['modifiers modifier', '$$ = [...$1, $2]'],
                // ['T_MODIFIER', '$$ = {type:\'modifiers\', keywords: yytext' + location(1) + '}'],
                ['', '$$ = []']
            ],

            'modifier': [
                ['T_MODIFIER', '$$ = {type:\'modifier\', name: yytext, ' + location(1) + '}']
            ],

            'type': [
                ['T_PRIMITIVE', '$$ = {type:\'type_primitive\', required: false, name: yytext, ' + location(1) + '}'],
                ['T_PRIMITIVE "!"', '$$ = {type:\'type_primitive\', required: true, name: $1, ' + location(1) + '}'],
                ['id', '$$ = {type:\'type_reference\', required: false, id: $1, ' + location(1) + '}'],
                ['id "!"', '$$ = {type:\'type_reference\', required: true, id: $1, ' + location(1) + '}']
            ],

            //
            // Type declaration (GraphQL)
            //

            // 'declaration_type': [
            //     ['(T_TYPE | T_INTERFACE)[start] id T_BRACE_OPEN declaration_type_fields* T_BRACE_CLOSE[end]', '$$ = {type:\'type\', name: $2, ' + location('start', 'end') + '};']
            // ],
            // 'declaration_type_fields': [
            //     ['id T_COLON type', '$$ = {type: \'field\', name: $1, type: $3, ' + location(1, 3) + '};']
            // ],

            //
            // Statements
            //

            'statements_block': [
                ['"{" statements "}"', '$$ = $2'],
                ['"{" "}"', '$$ = {type:\'statements\', statements: [], ' + location(1, 2) + '};'],
            ],

            'statements': [
                ['statements statement', '$$ = {type:\'statements\', statements: [...$1.statements, $2], ' + location(1, 2) + '};'],
                ['statement', '$$ = {type:\'statements\', statements: [$1], ' + location(1) + '};'],
            ],

            'statement': [
                ['call ";"?', '$$ = $1;'],
                ['assignment ";"?', '$$ = $1;'],
                ['T_RETURN expression ";"?', '$$ = {type:\'return\', expression: $2, ' + location(1, 2) + ' }'],
                ['declaration_enum ";"?', '$$ = $1;']
            ],

            //
            // Variable declaration
            //

            'declaration_variable': [['T_LET IDENTIFIER', '$$ = {type: \'declaration\', name: yytext, ' + location(1) + '};']],
            'assignment': [['declaration_variable "=" expression', '$$ = {type: \'assignment\', left: $1, right: $3, ' + location(1, 3) + '};']],

            //
            // Enum
            //

            'declaration_enum': [['T_ENUM id "=" (constant_string[v] ("|" constant_string[v])*)[values]', '$$ = {type: \'enum\', name: $2, values: [$values[0], ...$values[1].map((v)=>v[1])], ' + location(1, 'values') + '};']],

            //
            // Global function call
            //

            'call': [
                ['IDENTIFIER "(" arguments ")"', '$$ = {type:\'call\', name: $1, arguments: $3, ' + location(1, 4) + '};'],
            ],
            'arguments': [
                ['expression "," arguments', '$$ = [$1, ...$3];'],
                ['expression', '$$ = [$1];'],
                ['', '$$ = [];']
            ],
        });
    }
}