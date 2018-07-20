import { Parser } from 'jison-gho';
import Lexer from 'lex';
import { ASTProgram } from '.';

interface ParserException {
    hash: {
        recoverable: boolean;
        lexer: Lexer;
        loc?: {
            first_line: number,
            first_column: number,
            last_line: number,
            last_column: number,
            range: number[]
        }
    };
}

export class AbsynthParser {
    private parser: Parser;

    constructor(lexer: string[][], parsing: { [key: string]: string[][] }) {
        this.parser = new Parser({
            lex: {
                rules: lexer.map((v) => [v[0], v[1] !== '' ? 'return \'' + v[1] + '\';' : '']),
            },
            ebnf: {
                ...parsing,
            }
        });
    }

    parse(source: string): ASTProgram {
        return this.parser.parse(source);
    }

    parseDiagnostics(source: string): { loc: number[], msg: string } | undefined {
        try {
            this.parser.parse(source);
        } catch (e) {
            // console.warn(e);
            let ex = e as ParserException;
            if (ex.hash.loc) {
                console.log('Lexer error');
                console.log(ex.hash.loc);
                // console.log(ex.hash);
                return { loc: ex.hash.loc.range, msg: e.message };
            } else {
                // console.log((ex as any).hash);
            }
            // console.warn(ex.hash.lexer.index);
            // console.warn(ex.hash.lexer !== this.lexer.lexerInstance());
            // return ex.hash.lexer.index;
        }
        return undefined;
    }
}