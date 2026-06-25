import "dotenv/config";
async function test() {
  const address = "11710 E STELLA RD, NORMAN, OK 73026";
  const key = process.env.GOOGLE_CIVICS_API_KEY || "";
  const res = await fetch(`https://www.googleapis.com/civicinfo/v2/voterinfo?address=${encodeURIComponent(address)}&key=${key}&returnAllAvailableData=true`);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
