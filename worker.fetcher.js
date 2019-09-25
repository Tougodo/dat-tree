onmessage = async (e) => {
  e.data.query = await fetch(e.data.url);
  e.data.query = await e.data.query.json();
  let continuation = e.data.query.continue;
  e.data.query = e.data.query.query.pages;
  postMessage(e.data);
  while (typeof continuation !== "undefined") {
    let c_k = continuation.continue.replace(/\|/g,"");
    e.data.query = await fetch(e.data.url+"&"
      +c_k+"="
      +continuation[c_k]);
    e.data.query = await e.data.query.json();
    continuation = e.data.query.continue;
    e.data.query = e.data.query.query.pages;
    postMessage(e.data);
  }
}