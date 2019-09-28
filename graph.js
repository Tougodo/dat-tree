const TIME = 220;
let d3 = {};
let Graph = {
  svg:{},
  everything:{},
  container:{},
  nodes:{},
  backnodes:{},
  links:{},
  zoom_handler:{},
  zoom_action: () => Graph.everything.attr("transform", d3.event.transform),
  init: function (module) {
    d3 = module;
    this.svg = d3.select("svg");
    this.everything = this.svg.append("g").attr("class", "everything");
    this.container = this.everything.append("g").attr("class", "main_container");
    this.backnodes = this.container.append("g").attr("class", "backnodes");
    this.links = this.container.append("g").attr("class", "links");
    this.nodes = this.container.append("g").attr("class", "nodes");
    this.zoom_handler = d3.zoom().on("zoom", this.zoom_action);
    this.svg.call(this.zoom_handler);
  },
  mergeNode: (n,container) => {
    let merging = n.merge(container)
    merging.select("text").text((d) => d.name);
    merging.select("title").text((d) => d.name);
  },
  removeNode: (n) => {
    n.exit().transition().duration(TIME)
      .style("opacity",0)
      .remove();
  },
  updateNode: (n,overflow_size=0) => {
    n.select("circle").transition().duration(TIME)
      .attr("cy", (d) => d.y )
      .attr("cx", (d) => d.x )
      .attr("r",  (d) => 10+d.size+overflow_size );
  },
  appendNode: function(n,overflow_size=0) {
    n.append("circle")
        .attr("cx", (d) => {
          if (d.pageid == 0) {
            this.svg.transition().duration(TIME*4)
              .call(this.zoom_handler.transform, d3.zoomIdentity
              .scale(1)
              .translate(0,0)
              )
              .attr("style", "background-color:white;\
                              visibility:visible;\
                              display: block;");
            document.querySelector("form")
              .setAttribute("style","display:none;");
          }
          if ((typeof d.parent !== "undefined")
          && (document.getElementById("node"+d.parent) !== "null")) {
            return document.getElementById("node"+d.parent)
              .getElementsByTagName("circle")[0].getAttribute("cx");
          } else {
            return d.x;
          }
          })
        .attr("cy", (d) => {
          if ((typeof d.parent !== "undefined")
          && (document.getElementById("node"+d.parent) !== "null")) {
            return document.getElementById("node"+d.parent)
              .getElementsByTagName("circle")[0].getAttribute("cy");
          } else {
            return d.y;
          }
          })
        .attr("r", (d) => d.size + overflow_size)
        .attr("stroke-width", (d) => (overflow_size == 0) ? 2:0 )
        .attr("class", (d) => (overflow_size == 0) ? "t"+d.type:"bt" )
        .transition().duration(TIME)
          .attr("cx", (d) => d.x )
          .attr("cy", (d) => d.y )
  },
  display: (n) => { console.log(n) },
  graph: function (event) {
    event = event.data;
    let backnode = this.backnodes.selectAll("g")
      .data(event.nodes, (d) => d.name );
    let node = this.nodes.selectAll("g")
      .data(event.nodes, (d) => d.name );
    this.removeNode(node);
    this.removeNode(backnode);
    this.updateNode(node);
    this.updateNode(backnode,4);
    node.select("text")
      .transition().duration(TIME)
      .attr("x", (d) => d.x - d.name.length*7.25 )
      .attr("y", (d) => d.y - d.size-5 );
    let node_container = node.enter().append("g")
      .attr("id",  (d) => "node"+d.pageid )
      .attr("x", (d) => d.x )
      .attr("y", (d) => d.y )
      .on("click", this.display)
      .on("contextmenu", function (d, i) {
        d3.event.preventDefault();
      });
    let backnode_container = backnode.enter().append("g")
      .attr("id",  (d) => "back"+d.pageid )
      .attr("x", (d) => d.x )
      .attr("y", (d) => d.y )
    this.appendNode(backnode_container,4);
    this.appendNode(node_container);
    node_container.append("text")
      .text((d) => d.name )
        .attr("x", (d) => d.x - d.name.length*7.25 )
        .attr("y", (d) => d.y - d.size-5 )
    node_container.append("title")
      .text((d) => d.name );
    backnode_container.append("title")
      .text((d) => d.name );
    this.mergeNode(node,node_container);
    this.mergeNode(node,backnode_container);
//nodes done, let's handle links now !
    let link = this.links.selectAll("line")
      .data(event.links, (d) => d.source.name+"-"+d.target.name )
    link.exit().transition().duration(TIME).style("opacity",0).remove();
    link.enter().append("line")
      .attr("x1", (d) => { 
        if ((typeof d.target.parent !== "undefined")
        && (document.getElementById("node"+d.target.parent) !== "null")) {
          return document.getElementById("node"+d.target.parent)
            .getElementsByTagName("circle")[0].getAttribute("cx");
        } else {
          return d.source.x;
        }
        })
      .attr("y1", (d) => {
        if ((typeof d.target.parent !== "undefined")
        && (document.getElementById("node"+d.target.parent) !== "null")) {
          return document.getElementById("node"+d.target.parent)
            .getElementsByTagName("circle")[0].getAttribute("cy");
        } else {
          return d.source.y;
        }
        })
      .attr("x2", (d) => {
        if ((typeof d.target.parent !== "undefined")
        && (document.getElementById("node"+d.target.parent) !== "null")) {
          return document.getElementById("node"+d.target.parent)
            .getElementsByTagName("circle")[0].getAttribute("cx");
        } else {
          return d.source.x;
        }
        })
      .attr("y2", (d) => {
        if ((typeof d.target.parent !== "undefined")
        && (document.getElementById("node"+d.target.parent) !== "null")) {
          return document.getElementById("node"+d.target.parent)
            .getElementsByTagName("circle")[0].getAttribute("cy");
        } else {
          return d.source.y;
        }
        })
      .attr("id", (d) => "link"+d.source.pageid+"-"+d.target.pageid )
      .attr("stroke", "black")
      .attr("stroke-width", 3)
      .transition().duration(TIME)
        .attr("x1", (d) => d.source.x )
        .attr("x2", (d) => d.target.x )
        .attr("y1", (d) => d.source.y )
        .attr("y2", (d) => d.target.y )
      
    link.transition().duration(TIME)
      .attr("x1", (d) => d.source.x )
      .attr("x2", (d) => d.target.x )
      .attr("y1", (d) => d.source.y )
      .attr("y2", (d) => d.target.y )
      .attr("stroke-width", 3)
  },
};
export { Graph };