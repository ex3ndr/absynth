import Lexer from 'lex';

export class AbsynthLexer {
    private lexer: Lexer;
    constructor() {
        this.lexer = new Lexer();
        this.lexer.addRule(/0x[a-f\d]+/i, function () {
            return 'NUMBER_HEX';
        });
        this.lexer.addRule(/\d+/i, function () {
            return 'NUMBER';
        });
        this.lexer.addRule(/\s+/, function () {
            return 'SPACE';
        });
        this.lexer.addRule(/\'(\\.|[^'])*\'/, function () {
            return 'STRING';
        });
        this.lexer.addRule(/[a-zA-Z_][a-zA-Z_0-9]*/, function () {
            return 'IDENTIFIER';
        });
        this.lexer.addRule(/\(/, function() {
            return 'BRACKET_OPEN';
        });
        this.lexer.addRule(/\)/, function() {
            return 'BRACKET_CLOSE';
        });
    }

    lex(source: string) {
        this.lexer.setInput(source);
        let res: string[] = [];
        while (this.lexer.index < source.length) {
            res.push(this.lexer.lex());
        }
        return res;
    }
}