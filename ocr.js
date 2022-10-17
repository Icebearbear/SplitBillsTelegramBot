const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

async function ocrCreate(input) {
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(input));
    formData.append("language", "eng");
    formData.append("detectOrientation", "false");
    formData.append("isCreateSearchablePdf", "false");
    formData.append("isOverlayRequired", "true");
    formData.append("isTable", "true");

    const request = {
      method: "POST",
      url: "https://api.ocr.space/parse/image",
      headers: {
        apiKey: "K82458536388957",
        ...formData.getHeaders(),
      },
      data: formData,
      maxContentLenght: Infinity,
      maxBodyLength: Infinity,
    };
    const { data } = await axios(request);
    return data;
  } catch (error) {
    console.log("ERROR : " + error);
  }
}

getTotal = (data) => {
  let total = 0;
  console.log(data);
  const words = data["ParsedResults"][0]["ParsedText"].split("\t\r\n");
  words.forEach((word) => {
    const innerWords = word.split("\t");
    innerWords.forEach((innerw) => {
      if (
        innerw.toLowerCase().includes("total") ||
        innerw.toLowerCase().includes("amount")
      ) {
        console.log("matched" + innerWords + " p " + innerWords[1]);
        total = innerWords[1];
      }
    });
  });
  return total;
};

async function main() {
  const data = await ocrCreate("receipt.jpg");
  const totalPrice = getTotal(data);
  console.log("Total price is : " + totalPrice);
}

main();
