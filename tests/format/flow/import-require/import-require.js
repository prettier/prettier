// @flow

import Value=require('value-module');
import type TypeValue = require("type-module");
import Alias = Namespace.Value;
export import Exported = require("exported-module");
export import ExportedAlias = Namespace.Value;
import Long = require("a/very/long/module/path/that/stays/together");
export /* after export */ import /* after import */ type /* after kind */ Commented /* after name */ = /* before require */ require("commented-module" /* after source */);
export // after export line
import // after import line
type // after kind line
LineCommented // after name line
= // after equals line
require // after require line
("line-commented-module");

export = /* after equals */ Value;
export = condition ? first : second;
export = () => ({ value: true });
export = decorator("name")((options: {first: string, second: number}) => { return options; });
