/* global sinon */

import Ember from 'ember';
import { module } from 'qunit';
import { test } from 'ember-qunit';
/* jshint ignore:start */
import debounced from 'ember-debounced-properties/decorator';
/* jshint ignore:end */

const { run } = Ember;
let obj, clock;


module('Decorator', {
  setup: function() {
    clock = sinon.useFakeTimers();
  },

  teardown: function() {
    run(obj, 'destroy');
    clock.restore();
  }
});

test('default delay', function(assert) {
  assert.expect(3);

  obj = Ember.Object.extend({
    /* jshint ignore:start */
    @debounced
    /* jshint ignore:end */
    email: 'initial value'
  }).create();


  obj.set('email', 'hello@example.com');

  assert.equal(obj.get('debouncedEmail'), 'initial value', "`debouncedEmail` isn't updated immediately.");

  clock.tick(900);
  assert.equal(obj.get('debouncedEmail'), 'initial value', "`debouncedEmail` isn't updated before 1000ms passed.");

  clock.tick(100);
  assert.equal(obj.get('debouncedEmail'), 'hello@example.com', "`debouncedEmail` is updated after 1000ms passed.");
});

test('custom delay as a decorator argument', function(assert) {
  assert.expect(3);

  obj = Ember.Object.extend({
    /* jshint ignore:start */
    @debounced(1500)
    /* jshint ignore:end */
    email: 'initial value'
  }).create();


  obj.set('email', 'hello@example.com');
  assert.equal(obj.get('debouncedEmail'), 'initial value', "`debouncedEmail` isn't updated before 1500ms passed.");

  clock.tick(1400);
  assert.equal(obj.get('debouncedEmail'), 'initial value', "`debouncedEmail` isn't updated before 1500ms passed.");

  clock.tick(100);
  assert.equal(obj.get('debouncedEmail'), 'hello@example.com', "`debouncedEmail` is updated after 1500ms passed.");
});

test('custom delay using the `emailDelay` property works and takes precedence over the delay argument of `@debounced`', function(assert) {
  assert.expect(3);

  obj = Ember.Object.extend({
    /* jshint ignore:start */
    @debounced(200)
    /* jshint ignore:end */
    email: 'initial value',
    emailDelay: 1500
  }).create();


  obj.set('email', 'hello@example.com');
  assert.equal(obj.get('debouncedEmail'), 'initial value', "`debouncedEmail` isn't updated before 1500ms passed.");

  clock.tick(1400);
  assert.equal(obj.get('debouncedEmail'), 'initial value', "`debouncedEmail` isn't updated before 1500ms passed.");

  clock.tick(100);
  assert.equal(obj.get('debouncedEmail'), 'hello@example.com', "`debouncedEmail` is updated after 1500ms passed.");
});

test('custom immediate as a decorator argument', function(assert) {
  assert.expect(5);

  obj = Ember.Object.extend({
    /* jshint ignore:start */
    @debounced(1000, true)
    /* jshint ignore:end */
    email: 'initial value'
  }).create();


  obj.set('email', 'hello1@example.com');
  assert.equal(obj.get('debouncedEmail'), 'hello1@example.com', "`debouncedEmail` is updated immediately.");

  obj.set('email', 'hello2@example.com');
  assert.equal(obj.get('debouncedEmail'), 'hello1@example.com', "`debouncedEmail` isn't updated before 1000ms passed.");

  clock.tick(900);
  assert.equal(obj.get('debouncedEmail'), 'hello1@example.com', "`debouncedEmail` isn't updated before 1000ms passed.");

  clock.tick(100);
  assert.equal(obj.get('debouncedEmail'), 'hello1@example.com', "`debouncedEmail` isn't updated before 1000ms passed.");

  obj.set('email', 'hello3@example.com');
  assert.equal(obj.get('debouncedEmail'), 'hello3@example.com', "`debouncedEmail` is updated after 1000ms passed.");
});

test('custom immediate using the `emailImmediate` property works and takes precedence over the immediate argument of `@debounced`', function(assert) {
  assert.expect(2);

  obj = Ember.Object.extend({
    /* jshint ignore:start */
    @debounced(1000, false)
    /* jshint ignore:end */
    email: 'initial value',
    emailImmediate: true
  }).create();


  obj.set('email', 'hello1@example.com');
  assert.equal(obj.get('debouncedEmail'), 'hello1@example.com', "`debouncedEmail` is updated immediately.");

  obj.set('email', 'hello2@example.com');
  assert.equal(obj.get('debouncedEmail'), 'hello1@example.com', "`debouncedEmail` isn't updated.");
});
