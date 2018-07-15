declare module 'lex' {
    class Lexer {
        constructor(defaultHandler?: (lexeme: string) => void);
        addRule(regex: RegExp, handler: (this: Lexer, lexeme: string) => string | undefined): Lexer
        setInput(src: string): Lexer;
        lex(): any;
        state: number;
        index: number;
        yytext: string | undefined;
    }
    export = Lexer;
}

declare module 'jison-gho' {

    export interface Grammar {
        lex?: {
            rules: string[][]
        },
        bnf: {
            [key: string]: string[][]
        },
        operators?: string[][]
    }
    export class Parser {
        constructor(grammar: Grammar)

        lexer: any;

        parse(src: string): any
    }
}