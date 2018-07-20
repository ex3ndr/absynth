import { Absynth } from '../../Absynth';
import { ModuleCore } from '../ModuleCore';
import { ModuleExpressions } from '../ModuleExpressions';
import { ModuleExperimental } from '.';
import { experimentalGenerator } from './generator';

function createParser() {
    return new Absynth([new ModuleCore(), new ModuleExpressions(), new ModuleExperimental()]).parser;
}

describe('Generator', () => {
    it('should generate simple statements', () => {
        let parser = createParser();
        let ast = parser.parse(`
            println('Hello' + ' ' + 'World!')
            println(123 + 6/2)
        `);
        let app = experimentalGenerator(ast);
        expect(app).toMatchSnapshot();
    });
});