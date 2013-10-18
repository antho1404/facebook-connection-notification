class Graph

  options: 
    width: 204
    height: 160
    marges: 20
    textshift: 14
    separatorSize: 3
    max:
      x: 24

  constructor: (@elem) ->
    width  = @options.width  + 2 * @options.marges
    height = @options.height + 2 * @options.marges
    @elem.setAttribute "width",  width
    @elem.setAttribute "height", height
    @elem.innerHTML = """<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="#{width}" height="#{height}"><g><path stroke-width="1" stroke="#aaa" fill="#bbb"></path></g></svg>"""
    @path_elem = @elem.querySelector "path"

  max: ->
    return unless @data
    max = 0
    max = d for d in @data when d > max
    max

  step: ->
    return unless @data
    step = parseInt @data.length / @options.width, 10
    step = 1 if step is 0
    step

  display: (@data) ->
    i = 0
    x = @options.marges
    path = ["M#{@options.marges} #{@options.height + @options.marges}"];
    while i < @data.length
      end = i + @step()
      sum = 0
      number = 0
      while i < end and i < @data.length
        sum += @data[i]
        number++
        i++
      
      avg = sum / number
      avgNormalized = parseInt (@options.height + @options.marges) - avg * @options.height / @max(), 10
      path.push "L#{x} #{avgNormalized}"
      x += parseInt(@options.width / @data.length) || 1
    x -= parseInt(@options.width / @data.length) || 1
    path.push "L#{x} #{@options.height + @options.marges}"

    @path_elem.setAttribute "d", path.join " "