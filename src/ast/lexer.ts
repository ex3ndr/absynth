import Lexer from 'lex';

export let lexerTable = [
    ['\\s+', ''],
    ['0x[a-fA-F\\d]+', 'NUMBER_HEX'],
    ['\\d+', 'NUMBER'],
    ['\\\'(\\.|[^\\\'])*\\\'', 'STRING'],
    ['let', 'T_LET'],
    ['return', 'T_RETURN'],
    ['model', 'T_MODEL'],
    ['(private|public|readonly|index)', 'T_MODIFIER'],
    ['\\+', 'T_PLUS'],
    ['\\-', 'T_MINUS'],
    ['\\/', 'T_DIV'],
    ['\\*', 'T_MULT'],
    ['=', 'EQUALS'],
    ['[a-zA-Z_][a-zA-Z_0-9]*', 'IDENTIFIER'],
    [';', 'T_SEMICOLON'],
    ['\\,', 'T_COMMA'],
    ['\\(', 'T_BRACKET_OPEN'],
    ['\\)', 'T_BRACKET_CLOSE'],
    ['{', 'T_BRACE_OPEN'],
    ['}', 'T_BRACE_CLOSE']
];

export class AbsynthLexer {
    private lexer: Lexer;
    constructor() {
        this.lexer = new Lexer();

        for (let rules of lexerTable) {
            this.lexer.addRule(new RegExp(rules[0]), function (lexeme: string) {
                this.yytext = lexeme;
                if (rules[1] === '') {
                    return undefined;
                }
                return rules[1];
            });
        }
        this.lexer.addRule(/$/, function () {
            return 'EOF';
        });
    }

    setInput = (src: string) => {
        this.lexer.setInput(src);
    }

    lexerInstance() {
        return this.lexer;
    }

    lex(source: string) {
        this.lexer.setInput(source);
        let res: string[] = [];
        while (this.lexer.index < source.length) {
            res.push(this.lexer.lex());
        }
        return res;
    }

    lexDiagnostics(source: string): number {
        this.lexer.setInput(source);
        while (this.lexer.index < source.length) {
            try {
                this.lexer.lex();
            } catch (e) {
                console.warn(e);
                return this.lexer.index;
            }
        }
        return -1;
    }
}