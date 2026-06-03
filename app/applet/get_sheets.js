async function main() {
  const url = 'https://docs.google.com/spreadsheets/d/1MCXPxNuU67Bn_MNB0ye3fh3Mlx5HwMIJdh52V9rgSBk/edit';
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
    }
  });
  const html = await response.text();
  
  console.log("Searching for bootstrapData...");
  
  // Look for bootstrap data sheet list
  const bootstrapMatches = html.match(/bootstrapData\s*=\s*([^;]+)/);
  if (bootstrapMatches) {
    const text = bootstrapMatches[1];
    
    // Google Sheets bootstrapData contains sheet names and GIDs in specific structures.
    // Let's use several RegExp patterns to catch tab information.
    const regex1 = /"([^"]+)"\s*,\s*(\d+)\s*,\s*0\s*,\s*null\s*,\s*null\s*,\s*0/g;
    let m;
    while ((m = regex1.exec(text)) !== null) {
      console.log(`Matched tab formulation A: Name = "${m[1]}" - GID = ${m[2]}`);
    }

    const regex2 = /"([^"]+)"\s*,\s*(\d+)\s*,\s*\d\s*,\s*null\s*,\s*null/g;
    while ((m = regex2.exec(text)) !== null) {
      console.log(`Matched tab formulation B: Name = "${m[1]}" - GID = ${m[2]}`);
    }

    const regexGeneric = /"([^"]+)"\s*,\s*(\d{7,10})/g;
    while ((m = regexGeneric.exec(text)) !== null) {
      console.log(`Matched GID sequence: "${m[1]}" -> ${m[2]}`);
    }
  } else {
    console.log("bootstrapData variable not found in sheets HTML!");
    // backup search for gid matches
    const generalGidRegex = /"([^"]+)"\s*,\s*(\d+)\s*,\s*0/g;
    let m;
    while ((m = generalGidRegex.exec(html)) !== null) {
      if (m[1].length < 100 && m[2].length < 12) {
        console.log(`Possible General tab: Name = "${m[1]}" GID = ${m[2]}`);
      }
    }
  }
}

main().catch(console.error);
