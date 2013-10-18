attrModified = (mutations) ->
  for mutation in mutations
    name     = mutation.attributeName
    newValue = mutation.target.getAttribute name
    if name is "class"
      connected = newValue.indexOf("connected") isnt -1
      split = mutation.target.querySelector("a").href.split "/"
      id    = parseInt(split[split.length - 1], 10)
      
      if newValue.indexOf("active") isnt -1 and not connected
        Connexion.last id, (connexion) ->
          mutation.target.classList.add "connected"
          unless connexion
            connexion = new Connexion user_id: id, start: new Date()
            connexion.save()
      
      if newValue.indexOf("active") is -1 and connected
        Connexion.last id, (connexion) ->
          mutation.target.classList.remove "connected"
          if connexion
            connexion.set end: new Date()
            connexion.save()
  return


initializePlugin = ->
  User.all (users) ->
    for user in users
      elem = document.querySelectorAll("[href='/messages/#{user.get("id")}']")[0].parentNode
      if elem
        observer = new WebKitMutationObserver attrModified
        observer.observe elem, attributes: true
        user.set nickname: elem.querySelector(".accessible_elem").innerText
        user.save()
        if elem.classList.contains "active"
          # simulate new connexion with fake mutation
          attrModified [attributeName: "class", target: elem]
    return


# TODO
window.onbeforeunload = ->
  Connexion.updateAllMissingEnd()