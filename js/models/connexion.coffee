class Connexion extends Model
  table_name: "Connexions"
  attributes: 
    id:       Model.Type.Integer | Model.Constraints.PrimaryKey | Model.Constraints.NotNull
    user_id:  Model.Type.Integer | Model.Constraints.NotNull
    start:    Model.Type.Date | Model.Constraints.NotNull
    end:      Model.Type.Date
          

  sound_url: "http://www.ibiblio.org/pub/multimedia/pc-sounds/connect.wav"

  @last = (user_id, callback) ->
    time_shift = (new Date()).getTime() - 15 * 1000 # 15 s ago
    Connexion.all where: ["user_id = ? AND (end IS NULL OR end > ?)", [user_id, time_shift]], limit: 1, order: ["start DESC"], callback


  @updateAllMissingEnd = ->
    Connexion.sql "UPDATE #{Connexion.prototype.table_name} SET end = ? WHERE end IS NULL", [(new Date()).getTime()]

  save: (callback) ->
    User.all where: ["id = ?", [@get("user_id")]], limit: 1, (user) =>
      unless user
        callback() if callback
      else
        super(callback)
        if user.get("play_sound") and not @get("end")
          audio = new Audio @sound_url
          audio.play() 

  timeSpend: ->
    end   = @get("end") or new Date()
    delta = end.getTime() - @get("start").getTime()
    (delta / 1000 / 60).toFixed 2

  date_to_s: (date) ->
    hours   = prefixZero date.getHours()
    minutes = prefixZero date.getMinutes()
    seconds = prefixZero date.getSeconds()

    """#{date.timeAgo()} #{[hours, minutes, seconds].join(":")}"""

  toString: ->
    """#{@date_to_s @get("start")} <span style="float:right;">(#{minutes_to_s @timeSpend()})<span>"""


Connexion.initialize()