declare module 'lex' {
    class Lexer {
        addRule(regex: RegExp, handler: (this: any, lexeme: string) => string | undefined): Lexer
        setInput(src: string): Lexer;
        lex(): any;
        state: number;
        index: number;
    }
    export = Lexer;
}