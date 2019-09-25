import { TNode } from "./class.node.js";
const FETCHER = "worker.fetcher.js";
const MAX_WORKERS = 5;
const DEFAULT_LANG = "en";
let Tree = class {
  constructor() {
    this.nodes = {};
    this.links = [];
    this.internal_links = [];
    this.workers = [];
    this.base_url = "";
    this.changeLang(DEFAULT_LANG);
    for (let i=0;i<MAX_WORKERS;i++) {
      let worker = new Worker(FETCHER);
      this.workers.push(worker);
      worker.onmessage = (e) => { this.handleResponse(e.data) }
    }
  }
  handleResponse(response) {
    response.query = Object.values(response.query);
    if (response.type == "categories") {
      response.query.map(e => {
        this.addNode(e,response.name);
        this.addLink(response.name,e.title,true); //category links are always explicit
      });
    } else if (response.type == "pageviews") {
      if (typeof this.nodes[response.name].pageid === "undefined") {
        this.nodes[response.name].pageid = response.query[0].pageid;
      }
      this.nodes[response.name].setViews(response.query[0].pageviews);
    }
    console.log(Object.values(this.nodes).map(e => [e.name,e.views]),response.type,response.name);
  }
  nodeExists(title) {
    return (typeof this.nodes[title] !== "undefined")
  }
  linkExists(source,target) {
    if (nodeExists(source)) {
      return (typeof this.nodes[source].links[target] !== "undefined")
    } else if (nodeExists(target)) {
      return (typeof this.nodes[target].links[source] !== "undefined")
    } else {
      return false;
    }
  }
  assignWorker(i=0) { return this.workers[i%MAX_WORKERS]; }
  changeLang(lang) {
    this.base_url = "https://"+lang+".wikipedia.org/w/api.php?action=query&";
  }
  addNode(response,parent) {
    response = (typeof response === "string")?
      {title:response,ns:0,base_url:this.base_url}:response;
    if (!this.nodeExists(response.title)) { 
      let worker = this.assignWorker(response.pageid);
      this.nodes[response.title] = new TNode(response,parent,worker);
    } else {
      console.log("node "+response.title+" already exists");
    }
  }
  addLink(source,target,explicit=true) {
    this.nodes[source].addLink(target,explicit);
  }
  deleteNode(name) {

  }
  loadNodes(type) {

  }
  outputTree() {

  }
}
export { Tree };