let rules = require('@puzzleitc/frontend-guides/eslint/config/ng');

rules.globals = rules.globals || {};
rules.env = rules.env || {};
rules.rules = rules.rules || {};

rules.env.browser = true;

rules.globals.beforeEach = false;
rules.globals.afterEach = false;
rules.globals.beforeAll = false;
rules.globals.afterAll = false;
rules.globals.jasmine = false;
rules.globals.describe = false;
rules.globals.expect = false;
rules.globals.it = false;
rules.globals.spyOn = false;

rules.rules['angular/file-name'] = 'off';
rules.rules['angular/function-type'] = 'off';
rules.rules['angular/no-run-logic'] = 'off';
rules.rules['no-underscore-dangle'] = 'off';
rules.rules['no-return-assign'] = ['error', 'except-parens'];
rules.rules['no-use-before-define'] = ['warn', { variables: true, functions: false, classes: true }];
rules.rules['one-var'] = 'off';
rules.rules['max-len'] = ['warn', 140];
rules.rules['no-param-reassign'] = ['error', { props: false }];
rules.rules['no-plusplus'] = ['error', { allowForLoopAfterthoughts: true }];
rules.rules['indent'] = ['error', 2, {
  FunctionDeclaration: { parameters: 'first' },
  SwitchCase: 1
}];

rules.overrides = [{
  'files': ['src/**/*.js']
}];

module.exports = rules;
