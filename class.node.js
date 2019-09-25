let BASE_URL = false;
let TNode = class {
  constructor(node,parent,worker) {
    if (!BASE_URL) {
      if (typeof node.base_url !== "undefined") {
        BASE_URL = node.base_url;
      }
    }
    this.name = node.title;
    this.pageid = node.pageid;
    this.worker = worker;
    this.parent = parent;
    this.type = node.ns;
    this.size = 1;
    this.views = 0;
    this.loaded = {};
    this.links = {};
    if (this.type == 0) {
      this.load("links");
      this.load("linkshere");
    }
    if (typeof node.pageviews === "undefined") {
      this.load("pageviews");
    } else {
      this.setViews(node.pageviews);
    }
  }
  addLink(target,type) { //links can be true (explicitely graphed) or false, ie stored for future match
  }
  load(type) {
    if (typeof this.loaded[type] === "undefined") {
      let url = ((type == "abstract") && (this.type == 6)) ? "abstract-6":type;
      url = this.build_url(url);
      this.worker.postMessage({name:this.name,type,url});
    } else {
      //utiliser le worker pour renvoyer l'info souhaitée au Tree
    }
  }
  build_url(type) {
    let url = {
      "categories":"generator=categories&titles="+this.name
        +"&prop=info|pageviews&gcllimit=500&gclshow=!hidden",
      "abstract":"prop=extracts&titles="+this.name
        +"&exintro=true&exlimit=1",
      "abstract-6":"titles="+this.name
        +"&prop=imageinfo&iiprop=url|mime",
      "categorymembers":"generator=categorymembers&gcmtitle="+this.name
        +"&prop=info|pageviews&gcmlimit=500&gcmnamespace=0|14|6",
      "links":"generator=links&titles="+this.name
        +"&prop=info|pageviews&gpllimit=500&gplnamespace=0|6",
      "linkshere":"generator=linkshere&titles="+this.name
        +"&prop=info|pageviews&glhlimit=500&glhnamespace=0|6",
      "pageviews":"titles="+this.name+"&prop=pageviews"
    };
    return BASE_URL+url[type]+"&format=json&redirects&origin=*&utf8";
  }
  setViews(pageviews) {
    pageviews = Object.values(pageviews);
    this.views = pageviews.reduce((a,c) => a+c);
  }
}
export { TNode };