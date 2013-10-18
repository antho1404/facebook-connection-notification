template = """
  <li class="notifNegativeBase navItem" id="friends_connexions">
    <div class="uiToggle flyoutMenu" id="navAccount">
      <a class="navLink" href="#" rel="toggle" role="button" id="navAccountLink">
        <div class="menuPulldown">Account Settings</div>
      </a>
      <div class="jewelFlyout fbJewelFlyout uiToggleFlyout" id="accountSettingsFlyout" tabindex="0" style="width: auto;">
        <div class="jewelBeeperHeader"><div class="beeperNubWrapper"><div class="beeperNub"></div></div></div>
        <ul class="navigation" style="max-height:300px; overflow: auto; width: auto;"></ul>
      </div>
    </div>
  </li>
"""

navigation = null

friendSelected = (e) ->
  displayConnexions e.target.dataset.id
  e.preventDefault()
  e.stopPropagation()
  false

graphClicked = (e) ->
  displayGraph e.target.dataset.id
  e.preventDefault()
  e.stopPropagation()
  false

displayConnexions = (id) ->
  User.all where: ["id = ?", [id]], limit: 1, (user) ->
    throw "error with user id..." unless user
    navigation.innerHTML = """<li><div class="pagesNavMenuTitle fsm fwn fcg">#{user.get("nickname")}:</div></li>"""
    
    Connexion.all where: ["user_id = ?", [user.get("id")]], order: ["start DESC"], (connexions) ->
      navigation.innerHTML += """<li><a class="navSubmenu displayGraph" href="#graph" data-id="#{user.get("id")}">show graph</a></li>"""
      for connexion in connexions
        navigation.innerHTML += """<li><time style="margin:0 5px;display: block;">#{connexion.toString()}</time></li>"""
      document.querySelector(".navSubmenu.displayGraph").addEventListener "click", graphClicked

displayGraph = (id) ->
  User.all where: ["id = ?", [id]], limit: 1, (user) ->
    throw "error with user id..." unless user
    navigation.innerHTML = """<li><div class="pagesNavMenuTitle fsm fwn fcg">Graph #{user.get("nickname")}:</div></li>"""
    navigation.innerHTML += """<li class="graph"></li>"""

    user.connexionsGrouped 24, (connexions) ->
      graph = new Graph navigation.querySelector(".graph")
      graph.display connexions

displayFriends = ->
  navigation.innerHTML = """<li><div class="pagesNavMenuTitle fsm fwn fcg">Friends:</div></li>"""

  User.all order: ["nickname ASC"], (users) ->
    for user in users
      navigation.innerHTML += """<li><a class="navSubmenu friend" href="##{user.get("id")}" data-id="#{user.get("id")}">#{user.get("nickname")}</a></li>"""
    for friend in navigation.querySelectorAll(".friend")
      friend.addEventListener "click", friendSelected
    return


initializeDisplay = ->
  document.querySelector("#pageNav").innerHTML += template
  navigation = document.querySelector("#friends_connexions .navigation")
  document.querySelector("#friends_connexions .navLink").addEventListener "click", displayFriends
