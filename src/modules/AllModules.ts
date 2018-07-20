import { ModuleExperimental } from "./experimental";
import { Graphql } from "./graphql";
import { ModuleExpressions } from "./ModuleExpressions";
import { ModuleCore } from "./ModuleCore";

export const AllModules = () => [new ModuleExperimental(), new ModuleExpressions(), new ModuleCore(), new Graphql()];