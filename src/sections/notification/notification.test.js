/*global describe,beforeEach,it,inject,chai*/
/*jshint expr:true*/

'use strict';
var expect = chai.expect;

describe('mobile notifications', function () {
  beforeEach(module('koast.mobile.notifications'));

  it('get an instance of the dummy service', function () {
    inject(function (dummyService) {


      expect(dummyService).to.not.be.undefined;

    });
  });

});
