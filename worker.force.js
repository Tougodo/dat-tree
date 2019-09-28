importScripts("https://d3js.org/d3-collection.v1.min.js");
importScripts("https://d3js.org/d3-dispatch.v1.min.js");
importScripts("https://d3js.org/d3-quadtree.v1.min.js");
importScripts("https://d3js.org/d3-timer.v1.min.js");
importScripts("https://d3js.org/d3-force.v1.min.js");
const distance = 60;
const strength = -175;
let k = 1;
onmessage = function(event) {
  if (typeof event.data.parameters !== "undefined") {
    k = event.data.parameters;
  } else {
    let simulation = d3.forceSimulation(event.data.nodes)
      .force("link", d3
        .forceLink(event.data.links)
          .id(function(d) { return d.pageid; })
            .distance(60*k))
      .force("charge", d3.forceManyBody().strength(-175*k))
      .force("center",  d3
        .forceCenter(event.data.x_center,event.data.y_center))
      .stop();
    
    for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) /
      Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
      simulation.tick();
    }
    postMessage({
      nodes: event.data.nodes,
      links: event.data.links
    });
  }
}
