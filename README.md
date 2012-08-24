    // create parallel coordinates
    pc = parcoords(container)
      .dimensions( d3.keys(data[0] )
      .data( data )
      .autoscale()
      .render();

    // foreground element
    pc.canvas

    pc.data( _.shuffle(data) )
