const fs = require('fs');
const https = require('https');

https.get('https://hosting.okelections.gov/earlyvote.html', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    const results = {};
    const countyRegex = /<A NAME=\d+>(.*?)<\/A><\/U><\/B><\/font>([\s\S]*?)(?=<A NAME=|<p id="goback"|<\/BODY>)/gi;
    let match;
    while ((match = countyRegex.exec(data)) !== null) {
      let countyName = match[1].trim().toLowerCase();
      let content = match[2];
      
      const tables = content.match(/<TABLE[^>]*>.*?<\/TABLE>/gi) || [];
      const lines = tables.map(t => t.replace(/<[^>]+>/g, '').trim()).filter(l => l);
      
      let locations = [];
      let currentLoc = { locationName: '', addressLines: [], dates: [] };
      let state = 'name';
      
      for (let line of lines) {
        if (line === 'Early Voting Dates/Times:') {
          state = 'dates';
        } else if (line === '') {
          continue;
        } else {
          if (state === 'name') {
             if (!currentLoc.locationName) {
               currentLoc.locationName = line;
             } else {
               currentLoc.addressLines.push(line);
             }
          } else if (state === 'dates') {
             if (line.includes('Return to top')) continue;
             if (line.match(/^[A-Z]/) && !line.includes('am -')) {
               // New location started, likely
               locations.push(currentLoc);
               currentLoc = { locationName: line, addressLines: [], dates: [] };
               state = 'name';
             } else {
               currentLoc.dates.push(line);
             }
          }
        }
      }
      if (currentLoc.locationName) {
         locations.push(currentLoc);
      }
      results[countyName] = locations;
    }
    fs.writeFileSync('src/data/early_voting.json', JSON.stringify(results, null, 2));
    console.log('Saved to src/data/early_voting.json');
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
