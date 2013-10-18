class User extends Model
  table_name: "Users"
  attributes: 
    id:         Model.Type.Integer | Model.Constraints.PrimaryKey | Model.Constraints.NotNull
    nickname:   Model.Type.String | Model.Constraints.Uniq | Model.Constraints.NotNull
    play_sound: Model.Type.Bool
          

  connexions: (callback) ->
    Connexion.all where: ["user_id = ?", [@get("id")]], callback

  connexionsGrouped: (size, callback) ->
    sql = """
      SELECT ? as minute, COUNT(*) as count
      FROM (
        SELECT  CAST(((CAST(start AS FLOAT) / #{size}) - CAST(start / #{size} AS INTEGER)) * #{size} AS INTEGER) as min_start, 
                CAST(((CAST(end   AS FLOAT) / #{size}) - CAST(end   / #{size} AS INTEGER)) * #{size} AS INTEGER) as min_end
        FROM Connexions
        WHERE user_id = ? AND end IS NOT NULL
      )
      WHERE ? BETWEEN min_start AND min_end
    """

    connexions = new Array size
    count = 0
    for c in connexions
      Connexion.sql sql, [_i, @get("id"), _i], (tx, results) ->
        connexions[results.rows.item(0).minute] = results.rows.item(0).count
        count++
        if count is connexions.length
          callback connexions
    return

User.initialize()