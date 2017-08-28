import angular from 'angular';
import * as lodash from 'lodash';

export default angular
  .module('ngLodash', [])
  .constant('lodash', lodash)
  .name;
