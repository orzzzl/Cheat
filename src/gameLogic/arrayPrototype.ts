module gameLogic {
  /**
* Concat two array by appending the later one to the former one...
*/
Array.prototype.selfConcat = function(append) {
check(append.constructor === Array);
for (var i = 0; i < append.length; i++) {
  this.push(append[i]);
}
};

/**
* Subtract elements from original arrays
*/
Array.prototype.selfSubtract = function(elementsToRemove) {
var originalLength = this.length;
this.removeAll(elementsToRemove);
check(originalLength === this.length + elementsToRemove.length, "The elements are not proper removed...", this, elementsToRemove);
};

/**
* Check if the array contains all the elements.
*/
Array.prototype.containsAll = function(elementsToCheck) {
check(elementsToCheck.constructor === Array, "The argument is not an array!");
for (var i = 0; i < elementsToCheck.length; i++) {
  if (this.indexOf(elementsToCheck[i]) == -1) {
    return false;
  }
}
return true;
};

/**
* Remove all elements from the array
*/
Array.prototype.removeAll = function(elementsToRemove) {
check(elementsToRemove.constructor === Array, "The argument is not an array!");
check(this.containsAll(elementsToRemove), "The array does not contain all the elements.", this, elementsToRemove);
for (var i = 0; i < elementsToRemove.length; i++) {
  var index = this.indexOf(elementsToRemove[i]);
  this.splice(index, 1);
}
};

/**
* Return a clone array
*/
Array.prototype.clone = function() {
return this.slice(0);
};
}
