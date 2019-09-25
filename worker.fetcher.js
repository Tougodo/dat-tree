onmessage = async (e) => {
  e.data.query = await fetch(e.data.url);
  e.data.query = (await e.data.query.json()).query.pages;
  postMessage(e.data);
  while (typeof e.data.query.continue !== "undefined") {
    let continuation = e.data.query.continue.continue.replace(/\|/g,"");
    e.data.query = await fetch(e.data.url+"&"
      +continuation+"="
      +e.data.query.continue[continuation]);
    e.data.query = (await e.data.query.json()).query.pages;
    postMessage(e.data);
  }
}