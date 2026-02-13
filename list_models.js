const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: "" });
async function main() {
  try {
    const models = await ai.models.list();
    console.log(JSON.stringify(models, null, 2));
  } catch (e) {
    console.error(e);
  }
}
main();
