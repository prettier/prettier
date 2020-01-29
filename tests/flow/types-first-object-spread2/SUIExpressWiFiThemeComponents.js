// @flow

import type {SUIButtonUniform} from './SUIButtonUniform';
import type {SUIActionMenuUniform} from './SUIActionMenuUniform';

declare var SUIActionMenuUniformValue: SUIActionMenuUniform;
declare var SUIButtonUniformValue: SUIButtonUniform;

const SUIBusinessThemeComponents = {
  SUIActionMenu: SUIActionMenuUniformValue,
  SUIButton: SUIButtonUniformValue,
};

class SUITheme {}

const SUIExpressWiFiThemeComponents = {
  ...SUITheme,
  ...SUIBusinessThemeComponents,
  SUIButton: require('./SUIButtonUniform'),
};

module.exports = SUIExpressWiFiThemeComponents;
