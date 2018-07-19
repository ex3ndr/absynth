import { Module, ModuleOverlord, ModuleContext, location } from './_Base';
import { Basics } from './Basics';

export class Graphql extends Module {
    static ID = 'graphql';
    getModuleId() {
        return Graphql.ID;
    }

    prepare(context: ModuleOverlord) {
        (context.getModuleById('basics') as Basics).addRootDeclaration('declaration_type');
    }

    applyContext(context: ModuleContext) {
        context.registerLexeme('type', 'T_TYPE');
        context.registerLexeme('interface', 'T_INTERFACE', 4);
        context.registerRules({
            'declaration_type': [
                ['(T_TYPE | T_INTERFACE)[start] id "{" declaration_type_fields* "}"[end]', '$$ = {type:\'type\', name: $2, ' + location('start', 'end') + '};']
            ],
            'declaration_type_fields': [
                ['id ":" type', '$$ = {type: \'field\', name: $1, type: $3, ' + location(1, 3) + '};']
            ],
            'type': [
                ['T_PRIMITIVE', '$$ = {type:\'type_primitive\', required: false, name: yytext, ' + location(1) + '}'],
                ['T_PRIMITIVE "!"', '$$ = {type:\'type_primitive\', required: true, name: $1, ' + location(1) + '}'],
                ['id', '$$ = {type:\'type_reference\', required: false, id: $1, ' + location(1) + '}'],
                ['id "!"', '$$ = {type:\'type_reference\', required: true, id: $1, ' + location(1) + '}']
            ],
        });
    }
}