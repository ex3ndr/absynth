import { AbsynthParser } from '../ast/parser';
import { AbsynthGenerator } from './generator';
describe('Generator', () => {
    it('should generate simple statements', () => {
        let parser = new AbsynthParser();
        let generator = new AbsynthGenerator();
        let ast = parser.parse(`
            println('Hello' + ' ' + 'World!')
            println(123 + 6/2)
        `);
        let app = generator.generate(ast);
        expect(app).toMatchSnapshot();
    });
});