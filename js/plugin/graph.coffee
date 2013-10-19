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
    template = """
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="#{width}" height="#{height}">
        <g>
          <path id="graph-data" stroke-width="1" stroke="#aaa" fill="#bbb"></path>
          <line x1="#{@options.marges}" x2="#{@options.marges}" y1="#{@options.marges}" y2="#{@options.marges + @options.height}" stroke="black" stroke-width="q"/>
          <line x1="#{@options.marges}" x2="#{@options.marges + @options.width}" y1="#{@options.marges + @options.height}" y2="#{@options.marges + @options.height}" stroke="black" stroke-width="1"/>
          <text id="ymax" x="#{@options.marges - @options.textshift}" y="#{@options.marges}"></text>
          <text id="half-ymax" x="#{@options.marges - @options.textshift}" y="#{(@options.marges + @options.marges + @options.height) / 2}"></text>
          <text x="#{@options.marges - @options.textshift}" y="#{@options.marges + @options.height + @options.textshift}">0</text>
          <text x="#{(@options.marges + @options.marges + @options.width) / 2}" y="#{@options.marges + @options.height + @options.textshift}">#{@options.max.x / 2}</text>
          <text x="#{@options.marges + @options.width}" y="#{@options.marges + @options.height + @options.textshift}">#{@options.max.x}</text>
        </g>
      </svg>
    """
    @elem.setAttribute "width",  width
    @elem.setAttribute "height", height
    @elem.innerHTML = template
    @path_elem = @elem.querySelector "#graph-data"

  updateScale: ->
    max = @max()
    @elem.querySelector("#half-ymax").textContent = max / 2
    @elem.querySelector("#ymax").textContent = max

  max: ->
    return unless @data
    return @_max if @_max
    @_max = 0
    @_max = d for d in @data when d > @_max
    @_max

  step: ->
    return unless @data
    step = parseInt @data.length / @options.width, 10
    step = 1 if step is 0
    step

  display: (@data) ->
    @updateScale()
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
      x += parseInt(@options.width / (@data.length - 1)) || 1
    x -= parseInt(@options.width / (@data.length - 1)) || 1
    path.push "L#{x} #{@options.height + @options.marges}"

    @path_elem.setAttribute "d", path.join " "