const fetch = require('node-fetch');
const {getMetadata} = require('./parser');
const {stringToDom} = require('./tests/test-utils');

const embedlyUrl = 'https://api.embedly.com/1/extract?key=845a9dc31d904b1dbbda69a37854c316&urls=';

fetch('https://www.reddit.com/r/news/new.json').then(function(res) {
  return res.json();
}).then(function(redditData) {
  redditData.data.children.map((linkData) => {
    const linkUrl = linkData.data.url;

    const embedlyLinkUrl = embedlyUrl + linkUrl;
    const embedlyPromise = fetch(embedlyUrl+linkUrl).then(function(res) {
      return res.json();
    });

    const parserPromise = fetch(linkUrl).then(function(res) {
      return res.text();
    }).then(function(body) {
      const linkDom = stringToDom(body);
      return getMetadata(linkDom);
    });

    Promise.all([embedlyPromise, parserPromise]).then(([[embedlyData], parserData]) => {
      console.log(linkUrl);

      const merged = {};
      embedlyData.image_url = embedlyData.images[0].url;

      ['title', 'description', 'type'].map((field) => {
        merged[field] = {
          parser_: parserData[field],
          embedly: embedlyData[field],
        };
      });

      console.log(merged);
      console.log('\n\n\n\n');
    });
  });
});
