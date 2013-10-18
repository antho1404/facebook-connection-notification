prefixZero = (value) ->
  if value < 10
    "0#{value}"
  else
    "#{value}"

minutes_to_s = (minutes) ->
  string  = ""
  if minutes > 60
    string += "#{parseInt(minutes / 60, 10)}h"
    minutes /= 60
  if minutes > 1
    string += "#{parseInt(minutes, 10)}m"
    minutes -= parseInt(minutes, 10)
  if minutes > 0
    string += "#{parseInt(minutes * 60, 10)}s"
  string
