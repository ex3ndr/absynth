import { Module, ModuleContext, location, ModuleOverlord, forward } from './_Base';

export class Basics extends Module {
    static ID = 'basics';

    private rootDeclarations = new Set<string>();

    getModuleId() {
        return Basics.ID;
    }

    addRootDeclaration(rule: string) {
        this.rootDeclarations.add(rule);
    }

    prepare(context: ModuleOverlord) {
        // Do nothing
    }

    applyContext(context: ModuleContext) {

        // Spaces And Comments
        context.registerLexeme('\\s+', '', 1); // Ignore spaces
        context.registerLexeme('\\/\\/[^\\n]+', '', 1); // Ignore single line comments
        context.registerLexeme('\\#[^\\n]+', '', 1); // Ignore single line comments
        context.registerLexeme('\\\\*.+\\*\\/', '', 1); // Ignore multiline comments
        context.registerLexeme('@@absynth[^\\n]+', '', 1); // Ignore special

        // Numeric constants
        context.registerLexeme('0x[a-fA-F\\d]+', 'NUMBER_HEX');
        context.registerLexeme('\\d+', 'NUMBER');
        context.registerLexeme('\\\'(\\.|[^\\\'])*\\\'', 'STRING');
        context.registerLexeme('true', 'TRUE');
        context.registerLexeme('false', 'FALSE');

        // Primitive types keywords
        context.registerLexeme('(string|int|float|bool)', 'T_PRIMITIVE');

        // Basic Punctuation
        context.registerLexeme(';', ';');
        context.registerLexeme(':', ':');
        context.registerLexeme('\\,', ',');
        context.registerLexeme('\\(', '(');
        context.registerLexeme('\\)', ')');
        context.registerLexeme('{', '{');
        context.registerLexeme('}', '}');
        context.registerLexeme('\\!', '!');
        context.registerLexeme('\\?', '?');
        context.registerLexeme('\\|', '|');

        // Arithmetic Operations
        context.registerLexeme('\\+', '+');
        context.registerLexeme('\\-', '-');
        context.registerLexeme('\\/', '/');
        context.registerLexeme('\\*', '*');
        context.registerLexeme('==', '==');
        context.registerLexeme('=', '=');

        // Identifier matcher
        context.registerLexeme('[a-zA-Z_][a-zA-Z_0-9]*', 'IDENTIFIER', 10); // Lowest priority to avoid matching before keywords

        // Default rules
        context.registerRules({
            'program': [['root_declarations EOF', 'return {type: \'program\', value: $1, ' + location() + '};']],
            'root_declarations': [
                ['root_declarations root_declaration', '$$ = [...$1, $2]'],
                ['root_declaration', '$$ = [$1]'],
            ],
            'root_declaration': [
                ...Array.from(this.rootDeclarations).map((v) => [v, forward()])
            ],
            'id': [
                ['IDENTIFIER', '$$ = {type: \'id\', name: yytext, ' + location(1) + '};'],
            ],
            'constant_number': [
                ['NUMBER_HEX', '$$ = {type: \'number\', value: parseInt(yytext), ' + location(1) + '};'],
                ['NUMBER', '$$ = {type: \'number\', value: parseInt(yytext), ' + location(1) + '};']
            ],
            'constant_string': [
                ['STRING', '$$ = {type: \'string\', value: yytext.substring(1, yytext.length-1), ' + location(1) + '};']
            ],
            'constant_boolean': [
                ['TRUE', '$$ = {type: \'boolean\', value: true, ' + location() + '}'],
                ['FALSE', '$$ = {type: \'boolean\', value: false, ' + location() + '}']
            ],
        });
    }
}