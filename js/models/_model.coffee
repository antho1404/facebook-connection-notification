class Model

  @db = openDatabase "FacebookConnect", "1.0", "Log all connexions from the Facebook chat", 5 * 1024 * 1024

  @Type =
    Integer:  1
    Float:    2
    String:   4
    Date:     8
    Bool:     16
  @Constraints =
    NotNull:    32
    PrimaryKey: 64
    Uniq:       128

  @initialize: ->
    (new @()).check_table_exsist()

  @sql = (sql, values, callback) ->
    Model.db.transaction (tx) => tx.executeSql sql, values, callback, @database_error

  @all = (args={}, callback) ->
    if h.isFunction(args)
      callback   = args
      conditions = {}

    instance = new @()
    sql = "SELECT "
    if args.select
      sql += args.select.join ", "
    else
      sql +='*'
    sql      += " FROM #{instance.table_name}"
    values   = []
    if args.where
      sql   += " WHERE #{args.where[0]}" 
      values = args.where[1]
    if args.order
      sql += " ORDER BY #{args.order.join(',')}"
    if args.limit
      sql += " LIMIT #{args.limit}"
    Model.sql sql, values, (tx, result) =>
      collection = []
      for model in result.rows
        collection.push new @(result.rows.item(_i))
      if args.limit is 1
        collection = if collection.length > 0 then collection[0] else null
      callback collection, result if callback

  @Collection = (values) ->
    save_item = (collection, i, callback) ->
      return if i >= collection.length
      collection[i].save ->
        if i < collection.length - 1
          save_item collection, i + 1, callback
        else
          callback() if callback

    collection = []
    collection.save = (callback) -> save_item collection, 0, callback

    for value in values
      collection.push new @(value)
    collection

  constructor: (data={}) ->
    @_attributes = {}
    @set data

  validate_flag:  (attribute, value)      -> (@attributes[attribute] & value) is value
  is_type_of:     (attribute, type)       -> @validate_flag attribute, type
  has_constraint: (attribute, constraint) -> @validate_flag attribute, constraint

  get: (attribute) ->
    if @is_type_of attribute, Model.Type.Bool
      @_attributes[attribute] is 1
    else if @is_type_of attribute, Model.Type.INTEGER
      parseInt @_attributes[attribute], 10
    else if @is_type_of attribute, Model.Type.FLOAT
      parseFloat @_attributes[attribute]
    else
      @_attributes[attribute]

  set: (data) -> 
    for attribute of @attributes when data[attribute]
      if @is_type_of attribute, Model.Type.Integer
        @_attributes[attribute] = parseInt data[attribute]
      else if @is_type_of attribute, Model.Type.Float
        @_attributes[attribute] = parseFloat data[attribute]
      else if @is_type_of attribute, Model.Type.Bool
        @_attributes[attribute] = if data[attribute] then 1 else 0
      else if @is_type_of attribute, Model.Type.Date
        if "#{parseInt(data[attribute])}" is data[attribute] or parseInt(data[attribute]) is data[attribute]
          int_date = parseInt data[attribute]
          while int_date < 1000000000000
            int_date *= 10
          @_attributes[attribute] = new Date(int_date)
        else
          @_attributes[attribute] = new Date(Date.parse data[attribute])
      else
        @_attributes[attribute] = data[attribute]
    return

  fetch: (callback) ->
    Model.db.transaction (tx) =>
      tx.executeSql "SELECT * FROM #{@table_name} WHERE id = ? LIMIT 1", [@get("id")], (tx, result) =>
        @set result.rows.item(0)
        callback @ if callback

  save: (callback) ->
    Model.db.transaction (tx) =>
      tx.executeSql "SELECT * FROM #{@table_name} WHERE id = ? LIMIT 1", [@get("id")], (tx, result) =>
        attrs = @attributes
        if result.rows.length > 0 # already exsist, update needed
          old_object = result.rows.item 0
          to_update  = h.collect h.keys(attrs), (elem) => "#{elem}=?" if old_object[elem] isnt @value_to_s(elem) and @value_to_s(elem)
          values     = h.collect h.keys(attrs), (elem) => @value_to_s(elem) if old_object[elem] isnt @value_to_s(elem) and @value_to_s(elem)
          to_update  = h.compact to_update
          if to_update.length is 0
            callback tx if callback
            return
          values     = h.compact values
          values.push @get('id')
          tx.executeSql "UPDATE #{@table_name} SET #{to_update.join(',')} WHERE id = ?", values, callback, @database_error
        else
          keys   = h.collect h.keys(attrs), (elem) => elem if @_attributes[elem]
          marks  = h.collect h.keys(attrs), (elem) => '?' if @_attributes[elem]
          values = h.collect h.keys(@attributes), (elem) => @value_to_s(elem)
          keys   = h.compact keys
          marks  = h.compact marks
          values = h.compact values
          tx.executeSql "INSERT INTO #{@table_name} (#{keys.join(',')}) VALUES (#{marks.join(',')})", values, callback, @database_error

  check_table_exsist: (callback) ->
    Model.db.transaction (tx) =>
      attributes = h.collect h.keys(@attributes), (attr) =>
        values = [attr]
        if @is_type_of attr, Model.Type.Integer
          values.push "INTEGER"
        else if @is_type_of attr, Model.Type.Float
          values.push "FLOAT"
        else if @is_type_of attr, Model.Type.Bool
          values.push "INTEGER"
        else if @is_type_of attr, Model.Type.Date
          values.push "TIMESTAMP"
        else 
          values.push "TEXT"
        values.push("PRIMARY KEY") if @has_constraint attr, Model.Constraints.PrimaryKey
        values.push("UNIQ")        if @has_constraint attr, Model.Constraints.Uniq
        values.push("NOT NULL")    if @has_constraint attr, Model.Constraints.NotNull
        values.join " "
      tx.executeSql "CREATE TABLE IF NOT EXISTS #{@table_name} (#{attributes.join(',')})", [], callback

  value_to_s: (attribute) ->
    if @is_type_of attribute, Model.Type.Date
      @_attributes[attribute].getTime() if @_attributes[attribute]
    else
      @_attributes[attribute]

  database_error: (tx, error) -> console.error error