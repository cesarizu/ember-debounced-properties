import Ember from 'ember';

const { on, observer } = Ember;
const { debounce } = Ember.run;
const { capitalize } = Ember.String;

function handleDescriptor(target, key, descriptor) {
  const originalParams = descriptor.__originalParams || [];
  const defaultWait = originalParams[0] || 1000;
  const defaultImmediate = originalParams[1] || false;

  const debouncedPropertyName = `debounced${capitalize(key)}`;
  const updateFunctionName = `__setDebounced${capitalize(key)}`;

  target[updateFunctionName] = function() {
    if (!this.isDestroying || !this.isDestroyed) {
      this.set(debouncedPropertyName, this.get(key));
    }
  };

  target[`__init${capitalize(debouncedPropertyName)}`] = on('init', function() {
    this[updateFunctionName]();
  });

  target[`__${debouncedPropertyName}DidChange`] = observer(key, function() {
    const wait = this.getWithDefault(`${key}Delay`, defaultWait);
    const immediate = this.getWithDefault(`${key}Immediate`, defaultImmediate);

    if (wait > 0) {
      debounce(this, this[updateFunctionName], wait, immediate);
    } else {
      this[updateFunctionName]();
    }
  });

  return descriptor;
}

function isDescriptor(item) {
  return item && typeof item === 'object';
}

export default function debouncedDecorator(...params) {
  // determine if user called as @debounced(500, 'name') or @debounced
  if (isDescriptor(params[params.length - 1])) {
    return handleDescriptor(...arguments);
  } else {
    return function(target, key, descriptor) {
      descriptor.__originalParams = params;

      return handleDescriptor(...arguments);
    };
  }
}
