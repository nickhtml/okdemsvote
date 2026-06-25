import "dotenv/config";
async function test() {
  const address = "468739 E 878 RD, STILWELL, OK 74960";
  const key = process.env.GOOGLE_CIVICS_API_KEY || "";
  const res = await fetch(`https://www.googleapis.com/civicinfo/v2/divisionsByAddress?address=${encodeURIComponent(address)}&key=${key}`);
  const data = await res.json();
  console.log(JSON.stringify(data.divisions, null, 2));
}
test();
