import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import * as dotenv from "dotenv";

dotenv.config();

const ocrToken = process.env.OCR_TOKEN;
const teleToken = process.env.TELEGRAM_TOKEN;

async function ocrCreate(imageUrl) {
  try {
    const formData = new FormData();
    // formData.append("file", fs.createReadStream(input));
    formData.append("url", imageUrl);
    formData.append("filetype", "jpg");
    formData.append("language", "eng");
    formData.append("detectOrientation", "false");
    formData.append("isCreateSearchablePdf", "false");
    formData.append("isOverlayRequired", "true");
    formData.append("isTable", "true");

    const request = {
      method: "POST",
      url: "https://api.ocr.space/parse/image",
      headers: {
        apiKey: ocrToken,
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

function getTotal(data) {
  if (data["ParsedResults"] == "") {
    return 0;
  }
  let total = [];
  console.log(data);
  const words = data["ParsedResults"][0]["ParsedText"].split("\t\r\n");
  words.forEach((word) => {
    if (
      word.toLowerCase().includes("total") ||
      word.toLowerCase().includes("amount")
    ) {
      const innerWords = word.split("\t");
      innerWords.forEach((innerw) => {
        console.log("matched" + innerWords + " p " + innerWords[1]);
        total.push(innerWords[1]);
      });
    }
  });
  return total;
}

async function callOCR(imageUrl) {
  console.log("IMAGE URL: " + imageUrl);
  const data = await ocrCreate("receipt.jpg");
  // const data = await ocrCreate(imageUrl);
  const totalPrice = getTotal(data);
  console.log("Total price is : " + totalPrice);
  return totalPrice;
}

export default async function uploadToOCR(message) {
  console.log("entered if else for gotNewBillToAddReceipt");
  // const imageId = message.photo[0].file_id;
  // var imageUrl;
  var extractedPrice = ["100", "120"];
  // await axios
  //   .get(`https://api.telegram.org/bot${teleToken}/getFile?file_id=${imageId}`)
  //   .then(async (res) => {
  //     console.log(res.data);
  //     const filePath = res.data.result.file_path;
  //     console.log(filePath);
  //     // image url in Telegram server
  //     imageUrl = `https://api.telegram.org/file/bot${teleToken}/${filePath}`;
  //     // pass to a function of OCR and get the extracted price
  //     //for now hardcode a pic first

  //     extractedPrice = await callOCR(imageUrl); // pass in a base64, url
  //     console.log("end axios :" + extractedPrice);
  //   })
  //   .then(() => {
  //     return extractedPrice;
  //   })
  //   .catch((e) => {
  //     console.log("ERROR IN OCR : " + e);
  //   });
  console.log("return price", extractedPrice);
  return extractedPrice;
}

// await uploadOCR();

// export default callOCR;
