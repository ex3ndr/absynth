import { ModuleOverlord } from './_Base';
import { Basics } from './Basics';
import { Expressions } from './Expressions';
import { Experiments } from './Experiments';

describe('ModuleOverlord', () => {
    it('should work well', () => {
        let overlord = new ModuleOverlord();
        overlord.addModule(new Basics());
        overlord.addModule(new Expressions());
        overlord.addModule(new Experiments());
        overlord.prepare();
    });
});