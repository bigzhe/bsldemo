const aliceblue = '#f0f8ff'
const corner = {
  x: 50,
  y: 50
}

var app = new Vue({
  el: '#app',
  data: {
    nodes: nodes_data,
    selected_node: nodes_data[0],
    corner_node: undefined,
    current_level: 1,
    search_message: '',
    circles: true,
    rectangles: true,
    // svg_nodes: svg_nodess,
  },
  computed: {
    filtered_list: function () {
      return this.nodes
        .filter(node => {
          if (!this.circles && node.shape === 'circle') {
            return false
          }
          if (!this.rectangles && node.shape === 'rect') {
            return false
          }
          return true
        })
        .filter(node => node.name.includes(this.search_message))
    },
    remaining_list: function() {
      return this.nodes.filter(node => !this.filtered_list.includes(node))
    }
  },
  watch: {
    filtered_list: function() {
      this.updateColors()
    }
  },
  methods: {
    test: function() {
      console.log(this.svg_nodes)
      // this.svg_nodes[0].show()
      this.svg_nodes[0].attr({fill: aliceblue}).show().animate(500, '>', 10).attr({ fill: '#f03' })
    },
    resetPosition: function(ids) {
      ids.forEach(id => {
        this.svg_nodes[id].move(this.nodes[id].x, this.nodes[id].y)
      })
    },
    show: function(ids) {
      ids.forEach(id => {
        this.svg_nodes[id].attr({fill: aliceblue})
        // .show().animate(500, '>', 0).attr({ fill: this.nodes[id].color });
        .show().attr({ fill: this.nodes[id].color });
      })
      
      // this.selectNode(this.selected_node.id)
    },
    hide: function(ids) {
      ids.forEach(id => {
        this.svg_nodes[id]
        // .animate(500, '>', 10).attr({ fill: aliceblue });
        .attr({ fill: aliceblue });
        this.svg_nodes[id].hide()
      })
    },
    updateColors: function() {
      console.log('update')
      this.nodes.forEach(node => {
        if (!this.filtered_list.includes(node)) {
          this.svg_nodes[node.id].attr({fill: '#aeb4b9'})
        } else {
          this.svg_nodes[node.id].attr({fill:node.color})
        }
      })
      this.svg_nodes[this.selected_node.id].attr({fill: '#f06'})
    },
    moveCorner: function(id) {
      this.svg_nodes[id].animate(80).move(corner.x, corner.y);
    },
    moveBack: function(id) {
      this.svg_nodes[id].animate(80).move(this.nodes[id].x, this.nodes[id].y);
    },
    onClick: function(id) {
      return function() {
        // console.log('clicked '+id)
        const clickedNode = app.nodes[id]
        
        // whether it is the zoom out node
        if (clickedNode.scale_level < app.current_level) {
          app.zoomOut(id);
          return
        }

        // whether it is selected
        if (app.selected_node.id === clickedNode.id) {
          console.log('already selected')
          app.zoomIn(id) // zoom in
        } else {
          app.selectNode(clickedNode.id)
          app.selected_node = clickedNode // select it!
        }
      }
    },
    selectNode: function(id) {
      console.log('select '+id)
      // jump to the scale
      if (this.nodes[id].scale_level > this.current_level) {
        this.zoomIn(this.nodes[id].parent)
      } else if (this.nodes[id].scale_level < this.current_level) {
        this.zoomOut(this.corner_node.id)
      } else {
        if (this.corner_node && this.nodes[id].shape !== this.corner_node.shape) {
          this.zoomOut(this.corner_node.id)
          setTimeout(this.zoomIn(this.nodes[id].parent), 100)
        }
      }

      this.svg_nodes[this.selected_node.id].attr({fill: this.selected_node.color})
      this.svg_nodes[id].attr({fill: '#f06'})
      this.selected_node = this.nodes[id]
    },
    zoomIn: function(id) {
      console.log('zoom in to ' + id)
      if (this.current_level === 2)
        return;
      this.moveCorner(id)
      this.hide(this.nodes
        .filter(node => node.id !== id && node.scale_level === this.current_level)
        .map(node => node.id))
        
      this.show(this.nodes[id].children)
      this.corner_node = this.nodes[id]
      this.current_level += 1
    },
    zoomOut: function(id) {
      console.log('zoom out from ' + id)
      if (this.current_level === 1)
        return;
      this.moveBack(id)
      this.hide(this.nodes
        .filter(node => node.id !== id && node.scale_level === this.current_level)
        .map(node => node.id))
      this.current_level -= 1
      this.show(this.nodes
        .filter(node => node.id !== id && node.scale_level === this.current_level)
        .map(node => node.id))
      this.corner_node = undefined
      this.selectNode(id)
    },

  }
})

var draw = SVG('map').size(1000, 300)
app.svg_nodes = nodes_data.map(node => {
  var n = undefined;
  // circle
  if (node.shape === 'circle') {
    n = draw.circle(node.r).move(node.x, node.y).fill(node.color)
  } else { // rect
    n = draw.rect(node.r,node.r).move(node.x, node.y).fill(node.color)
  }
  n.hide()
  n.click(app.onClick(node.id))
  return n
})

app.show([0,1])
app.selectNode(0)


// {
//   id: 1,
//   name: "big circle",
//   color: "#CD5C5C",
//   shape: "circle",
//   scale_level: 1,
//   x: 100,
//   y: 100,
//   r: 50,
//   children: [3,4,5],
// },