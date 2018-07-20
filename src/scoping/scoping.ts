import { ASTModel, ASTEnum, ASTProgram, ASTType } from '../parser';
import { GeneratorException } from '../modules/core/GeneratorException';

export class AbsynthScope {
    declaredModels = new Map<string, ASTModel | ASTEnum>();

    collectDeclarations(src: ASTProgram) {
        for (let v of src.value) {
            if (v.type === 'model') {
                console.log(v.name);
                if (this.declaredModels.has(v.name.name)) {
                    throw new GeneratorException('Already defined', v);
                }
                this.declaredModels.set(v.name.name, v);
                console.log(v.name.name);
            }
            if (v.type === 'enum') {
                if (this.declaredModels.has(v.name.name)) {
                    throw new GeneratorException('Already defined', v);
                }
                this.declaredModels.set(v.name.name, v);
            }
        }
    }

    resolveReferences(src: ASTProgram) {
        for (let v of src.value) {
            if (v.type === 'model') {
                for (let f of v.fields) {
                    this.resolveReference(f.field_type);
                }
            }
        }
    }

    private resolveReference(src: ASTType) {
        if (src.type === 'type_reference') {
            if (!this.declaredModels.has(src.id.name)) {
                throw new GeneratorException('Unable to find ' + src.id.name, src);
            }
            src.resolvedType = this.declaredModels.get(src.id.name)!!;
        }
    }
}