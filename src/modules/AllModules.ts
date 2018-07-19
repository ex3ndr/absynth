import { Experiments } from "./Experiments";
import { Expressions } from "./Expressions";
import { Basics } from "./Basics";
import { Graphql } from "./Graphql";

export const AllModules = () => [new Experiments(), new Expressions(), new Basics(), new Graphql()];