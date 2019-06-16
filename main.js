// D3 JS INIT
function zoom_actions(){
	var transform = d3.event.transform;
	g.attr("transform", transform)
}
var svg = d3.select("svg")
var g = svg.append("g").attr("class", "everything");
var h = g.append("g");
var svg_nodes2 = h.append("g").attr("class", "backnodes")
var svg_links = h.append("g").attr("class", "links")
var svg_nodes = h.append("g").attr("class", "nodes")
var f_x = 0;
var f_y = 0;
var force_graph = new Worker('worker.force.js');
var zoom_handler = d3.zoom().on("zoom", zoom_actions);
//zoom_handler(svg);
svg.call(zoom_handler)

force_graph.onmessage = function (event) {
// HERE IS WHERE ACTUAL GRAPH IS DRAWN
	var duration = 220;
	/*if (document.querySelector("#id"+tree.focal_point+" circle") !== null)
	{
		f_x = document.querySelector("#id"+tree.focal_point+" circle").getAttribute("cx");
		f_y = document.querySelector("#id"+tree.focal_point+" circle").getAttribute("cy");
		x=Number(document.querySelector("svg").getBoundingClientRect().width)/2
		y=Number(document.querySelector("svg").getBoundingClientRect().height)/2
		console.log(x,f_x,f_x-x)
		h.transition().duration(duration)
			.attr("transform", function () { return "translate("+(x-f_x)+","+(y-f_y)+")"; })
	}*/
	var node2 = svg_nodes2.selectAll("g").data(event.data.nodes, function(d) { return d.name });
	var node = svg_nodes.selectAll("g").data(event.data.nodes, function(d) { return d.name });

	node.exit().transition().duration(duration)
		.style("opacity",0)
		.remove();

	node.select("circle").transition().duration(duration)
		.attr("cy", function(d) { return d.y })
		.attr("cx", function(d) { return d.x })
		.attr("r",  function(d) { return d.size })
		
	node2.exit().transition().duration(duration)
		.style("opacity",0)
		.remove();

	node2.select("circle").transition().duration(duration)
		.attr("cy", function(d) { return d.y })
		.attr("cx", function(d) { return d.x })
		.attr("r",  function(d) { return d.size+4 })

	node.select("text")
		.transition().duration(duration)
		.attr("x", function(d) { return d.x - this.getComputedTextLength() / 2} )
		.attr("y", function(d) { return d.y - d.size-5})

	nu = node.enter().append("g")
		.attr("id",  function(d) { return "id"+d.id })
		.attr("x", function(d) { return d.x })
		.attr("y", function(d) { return d.y })
		.on("click", function(d) {
			console.log(d.name);
			tree.nodes[d.name].load((d.type == '14')?"categorymembers":"categories");
			links = tree.focus(d.name);
			//g.attr("style", function() { return "transform-origin: "+document.querySelector("#id"+tree.focal_point+" circle").getAttribute("cx")+" "+document.querySelector("#id"+tree.focal_point+" circle").getAttribute("cy")+" 0;";});
			svg_nodes.selectAll("g").attr("class","")
			svg_links.selectAll("line").attr("class","")
			for (i in links)
			{
				try
				{
					document.getElementById("id"+i).classList.add("highlight"+links[i]);
				}
				catch
				{
					console.log("id"+i)
				}
			}
			})
	nu2 = node2.enter().append("g")
		.attr("id",  function(d) { return "id2"+d.id })
		.attr("x", function(d) { return d.x })
		.attr("y", function(d) { return d.y })


	nu.append("text")
		.text(function(d) {	return d.name; })
			.attr("x", function(d) { return d.x - this.getComputedTextLength() / 2} )
			.attr("y", function(d) { return d.y +10})
	
	nu.append("circle")
		.attr("cx", function(d) {
			if ((typeof d.parent !== 'undefined') && (document.getElementById("id"+d.parent) !== 'null'))
			{
				return document.getElementById("id"+d.parent).getElementsByTagName("circle")[0].getAttribute("cx");
			}
			else
			{
				return d.x;
			}
			})
		.attr("cy", function(d) {
			if ((typeof d.parent !== 'undefined') && (document.getElementById("id"+d.parent) !== 'null'))
			{
				return document.getElementById("id"+d.parent).getElementsByTagName("circle")[0].getAttribute("cy");
			}
			else
			{
				return d.y;
			}
			})
		.attr("r",  function(d) { return d.size })
		.attr("stroke-width", 2)
		.attr("class", function(d) { return "t"+d.type; })

	nu.append("title")
		.text(function(d) { return d.name; })
		
	nu2.append("circle")
		.attr("cx", function(d) {
			if ((typeof d.parent !== 'undefined') && (document.getElementById("id"+d.parent) !== 'null'))
			{
				return document.getElementById("id"+d.parent).getElementsByTagName("circle")[0].getAttribute("cx");
			}
			else
			{
				return d.x;
			}
			})
		.attr("cy", function(d) {
			if ((typeof d.parent !== 'undefined') && (document.getElementById("id"+d.parent) !== 'null'))
			{
				return document.getElementById("id"+d.parent).getElementsByTagName("circle")[0].getAttribute("cy");
			}
			else
			{
				return d.y;
			}
			})
		.attr("r",  function(d) { return d.size + 4 })
		.attr("stroke-width", 0)
		.attr("class", "bt")

	nu2.append("title")
		.text(function(d) { return d.name; })
			
	bi = node.merge(nu)
	bi.select("text")
		.text(function(d) {	return d.name})
	bi.select("title")
		.text(function(d) {	return d.name})
	
	bi2 = node.merge(nu2)
	bi2.select("text")
		.text(function(d) {	return d.name})
	bi2.select("title")
		.text(function(d) {	return d.name})
	
	link = svg_links.selectAll("line").data(event.data.links, function(d) { return d.source.name+"-"+d.target.name; })
	link.exit().transition().duration(duration).style("opacity",0).remove();
	link.enter().append("line")
		.attr("x1", function(d) { 
			if ((typeof d.target.parent !== 'undefined') && (document.getElementById("id"+d.target.parent) !== 'null'))
			{
				return document.getElementById("id"+d.target.parent).getElementsByTagName("circle")[0].getAttribute("cx");
			}
			else
			{
				return d.source.x;
			}
			})
			.attr("y1", function(d) {
			if ((typeof d.target.parent !== 'undefined') && (document.getElementById("id"+d.target.parent) !== 'null'))
			{
				return document.getElementById("id"+d.target.parent).getElementsByTagName("circle")[0].getAttribute("cy");
			}
			else
			{
				return d.source.y;
			}
			})
		.attr("x2", function(d) {
			if ((typeof d.target.parent !== 'undefined') && (document.getElementById("id"+d.target.parent) !== 'null'))
			{
				return document.getElementById("id"+d.target.parent).getElementsByTagName("circle")[0].getAttribute("cx");
			}
			else
			{
				return d.source.x;
			}
			})
		.attr("y2", function(d) {
			if ((typeof d.target.parent !== 'undefined') && (document.getElementById("id"+d.target.parent) !== 'null'))
			{
				return document.getElementById("id"+d.target.parent).getElementsByTagName("circle")[0].getAttribute("cy");
			}
			else
			{
				return d.source.y;
			}
			})
		.attr("id", function(d) { return "id"+d.id })	
		.attr("stroke", "black")
		.attr("stroke-width", 3)
	link.transition().duration(duration)
		.attr("x1", function(d) { return d.source.x })
		.attr("x2", function(d) { return d.target.x })
		.attr("y1", function(d) { return d.source.y })
		.attr("y2", function(d) { return d.target.y })
		.attr("stroke-width", 3)
		
};
// CONSTRUCT NEW TREE
tree = new Tree();

// BELOW TREE IS FED WITH USER INPUT
document.getElementById("submit").addEventListener("click", function(e){
	//console.log(document.getElementById("str_search").value)
	document.querySelector("form").setAttribute("style","display: none;");
	document.querySelector("svg").setAttribute("style","display: block;");
	tree.new_node(capital_letter(document.getElementById("str_search").value))
	tree.load_nodes("categories");
})

function capital_letter(str) 
{
	str = str.split(" ");
	for (var i=0,x=str.length;i<x;i++) {str[i]=str[i][0].toUpperCase()+str[i].substr(1);}
	return str.join(" ");
}
function incr_wait(i,t,rand=false)
{
	t = (rand) ? Math.floor(t+2*t*Math.random()):t;
	return new Promise(function(resolve,reject){
		setTimeout(function(){
			resolve(i+1);
		},t)
	})
}
