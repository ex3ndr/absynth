import { Module, ModuleContext, forward, location, ModuleOverlord } from './_Base';

export class Expressions extends Module {
    static ID = 'expressions';

    private anomicExpressions = new Set<string>();

    getModuleId() {
        return Expressions.ID;
    }

    registerAtomicExpression(expression: string) {
        this.anomicExpressions.add(expression);
    }

    prepare(context: ModuleOverlord) {
        // Do nothing
    }

    applyContext(context: ModuleContext) {
        // Grammar Rules
        context.registerRules({
            'expression': [
                ['expression_additive', forward()],
            ],
            'expression_additive': [
                ['expression_multiple', forward()],
                ['expression_additive "+" expression_multiple', '$$ = {type:\'operation\', op: \'+\', left: $1, right: $3, ' + location(1, 3) + '};'],
                ['expression_additive "-" expression_multiple', '$$ = {type:\'operation\', op: \'-\', left: $1, right: $3, ' + location(1, 3) + '};'],
            ],
            'expression_multiple': [
                ['expression_atomic', forward()],
                ['expression_multiple "*" expression_atomic', '$$ = {type:\'operation\', op: \'*\', left: $1, right: $3, ' + location(1, 3) + '};'],
                ['expression_multiple "/" expression_atomic', '$$ = {type:\'operation\', op: \'/\', left: $1, right: $3, ' + location(1, 3) + '};'],
            ],
            'expression_atomic': [
                ['"(" expression ")"', forward(2)],
                ['id', forward()],
                ['constant_number', forward()],
                ['constant_string', forward()],
                ['constant_boolean', forward()]
            ],
        });
    }
}