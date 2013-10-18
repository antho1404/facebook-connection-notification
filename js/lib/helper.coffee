h = 
  isFunction: (obj) ->
    Object.prototype.toString.call(obj) is "[object Function]"
  keys: (obj) ->
    key for key of obj
  collect: (array, iterator) ->
    iterator val for val in array
  compact: (array) ->
    val for val in array when val