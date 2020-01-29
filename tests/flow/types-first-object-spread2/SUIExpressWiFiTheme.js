// @flow

import type {SUIButtonUniform} from './SUIButtonUniform';
import type {SUIActionMenuUniform} from './SUIActionMenuUniform';

const SUIExpressWiFiThemeComponents = require('./SUIExpressWiFiThemeComponents');

export type ComponentUniforms = {
  SUIActionMenu?: SUIActionMenuUniform,
  SUIButton?: SUIButtonUniform,
};

// NOTE: This should error but does not because temporary object spreads use
// object literal reasons. When that becomes the case, this should error because
// the read-write properties will fail to unify.
(SUIExpressWiFiThemeComponents: ComponentUniforms);
