import { AbsynthParser } from '../ast/parser';
import { AbsynthGenerator } from './generator';
import { Absynth } from '../Absynth';
import { Basics } from '../modules/Basics';
import { Expressions } from '../modules/Expressions';
import { Experiments } from '../modules/Experiments';
function createParser() {
    return new Absynth([new Basics(), new Expressions(), new Experiments()]).parser;
}
describe('Generator', () => {
    it('should generate simple statements', () => {
        let parser = createParser();
        let generator = new AbsynthGenerator();
        let ast = parser.parse(`
            println('Hello' + ' ' + 'World!')
            println(123 + 6/2)
        `);
        let app = generator.generate(ast);
        expect(app).toMatchSnapshot();
    });
});