import { TNode } from "./class.node.js";
const FETCHER = "worker.fetcher.js";
const MAX_WORKERS = 5;
const DEFAULT_LANG = "en";
let Tree = class {
  constructor(output_worker) {
    this.nodes = {};
    this.links = [];
    this.internal_links = [];
    this.workers = [];
    this.base_url = "";
    this.setLang(DEFAULT_LANG);
    for (let i=0;i<MAX_WORKERS;i++) {
      let worker = new Worker(FETCHER);
      this.workers.push(worker);
      worker.onmessage = (e) => { this.handleResponse(e.data) }
    }
    this.output = output_worker;
  }
  handleResponse(response) {
    response.query = Object.values(response.query);
    if (response.type == "categories") {
      response.query.map(e => {
        this.addLink( this.nodes[response.name],
                      this.addNode(e,response.name),
                      true); //category links are always explicit
      });
    } else if (response.type == "pageviews") {
      this.nodes[response.name].setViews(response.query[0].pageviews);
    }
    this.outputTree();
  }
  nodeExists(title) {
    return (typeof this.nodes[title] !== "undefined")
  }
  getLink(source,target) {
    if (this.nodeExists(source)) {
      return this.nodes[source].getLink(target);
    } else if (this.nodeExists(target)) {
      return this.nodes[target].getLink(source);
    } else {
      return false;
    }
  }
  assignWorker(i=0) { return this.workers[i%MAX_WORKERS]; }
  setLang(lang) {
    this.base_url = "https://"+lang+".wikipedia.org/w/api.php?action=query&";
  }
  addNode(response,parent) {
    response = (typeof response === "string")?
      {title:response,ns:0,base_url:this.base_url}:response;
    if (!this.nodeExists(response.title)) { 
      let worker = this.assignWorker(response.pageid);
      parent = (typeof parent !== "undefined") ?
        this.nodes[parent].pageid:parent;
      this.nodes[response.title] = new TNode(response,parent,worker);
    } else {
      console.log("node "+response.title+" already exists");
    }
    return this.nodes[response.title];
  }
  addLink(source,target,explicit=true) {
    let link = this.getLink(source.name,target.name);
    if (!link) {
      this.links.push({source:source.pageid,target:target.pageid});
      source.addLink(target,this.links.length-1,explicit);
      target.addLink(source,this.links.length-1,explicit);
      return this.links[this.links.length-1];
    } else {
      console.log("link "+source.name+"—"+target.name+" already exists");
      return this.links[link.id];
    }
  }
  deleteNode(name) {

  }
  loadNodes(type) {
    for (let i in this.nodes) { this.nodes[i].load(type); }
  }
  outputTree() {
    let svg_box = document.querySelector("svg").getBoundingClientRect()
    this.output.postMessage({
      nodes:JSON.parse(JSON.stringify(Object.values(this.nodes))),
      links:this.links,
      x_center:Number(svg_box.width)/2,
      y_center:Number(svg_box.height)/2
    });
  }
}
export { Tree };