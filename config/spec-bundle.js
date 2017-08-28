require('core-js/es6');
require('angular');
require('angular-mocks/angular-mocks');

Error.stackTraceLimit = Infinity;

/*
 * get all the files, for each file, call the context function
 * that will require the file and load it up here. Context will
 * loop and require those spec files here
 */
function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}

// requires and returns all modules that match
requireAll(require.context('../src', true, /\.spec\.js/));
