import Lexer from 'lex';

export class AbsynthLexer {
    private lexer: Lexer;
    constructor(table: string[][]) {
        this.lexer = new Lexer();

        for (let rules of table) {
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