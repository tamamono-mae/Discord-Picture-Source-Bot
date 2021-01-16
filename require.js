const fetch = require("node-fetch");
const cheerio = require("cheerio");
const formData = require("form-data");

async function search_request(url){
  var formdata = mkfd(url);
  let body = await fetch('https://saucenao.com/search.php',
  {
    method: 'POST',
    headers: formdata.getHeaders(),
    body: formdata,
    redirect: 'follow'
  })
  .then(res => res.text());

  let $ = cheerio.load(body);
  return $("div[class='result']").length == 1 ?
    null : $(".result .resultcontentcolumn .linkify").eq(0).attr("href");

}

function mkfd(url) {
  let formdata = new formData();
  formdata.append("Content-Type", "application/octect-stream");
  formdata.append("url", url);
  formdata.append("frame", "1");
  formdata.append("hide", "0");
  formdata.append("database", "999");
  return formdata;
}

module.exports = { search_request, mkfd };
