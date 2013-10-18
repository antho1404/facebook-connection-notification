Date.prototype.timeAgo = ->
  now   = new Date()
  end   = new Date now.getFullYear(), now.getMonth(), now.getDate()
  begin = new Date this.getFullYear(), this.getMonth(), this.getDate()
  day_number = parseInt((end - begin) / (1000 * 60 * 60 * 24), 10)
  if day_number is 0
    "Today"
  else
    if day_number is 1
      "Yesturday" 
    else
      day_number + " days ago"
