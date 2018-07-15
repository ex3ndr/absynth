import Lexer from 'lex';

export class AbsynthLexer {
    private lexer: Lexer;
    constructor() {
        this.lexer = new Lexer();
        this.lexer.addRule(/\s+/, function () { return undefined; });
        this.lexer.addRule(/0x[a-f\d]+/i, function (lexeme: string) {
            this.yytext = lexeme;
            return 'NUMBER_HEX';
        });
        this.lexer.addRule(/\d+/i, function (lexeme: string) {
            this.yytext = lexeme;
            return 'NUMBER';
        });
        this.lexer.addRule(/\s+/, function (lexeme: string) {
            this.yytext = lexeme;
            return 'SPACE';
        });
        this.lexer.addRule(/\'(\\.|[^'])*\'/, function (lexeme: string) {
            this.yytext = lexeme;
            return 'STRING';
        });
        this.lexer.addRule(/let/, function (lexeme: string) {
            this.yytext = lexeme;
            return 'T_LET';
        });
        this.lexer.addRule(/=/, function (lexeme: string) {
            this.yytext = lexeme;
            return 'EQUALS';
        });
        this.lexer.addRule(/[a-zA-Z_][a-zA-Z_0-9]*/, function (lexeme: string) {
            this.yytext = lexeme;
            return 'IDENTIFIER';
        });
        this.lexer.addRule(/\(/, function (lexeme: string) {
            this.yytext = lexeme;
            return 'BRACKET_OPEN';
        });
        this.lexer.addRule(/\)/, function (lexeme: string) {
            this.yytext = lexeme;
            return 'BRACKET_CLOSE';
        });
        this.lexer.addRule(/$/, function () {
            return 'EOF';
        });
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
                console.log(e);
                return this.lexer.index;
            }
        }
        return -1;
    }
}