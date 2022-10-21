import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import * as dotenv from "dotenv";
dotenv.config();

const ocrToken = process.env.OCR_TOKEN;

export async function ocrCreate(imageUrl) {
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
}

export default async function callOCR(imageUrl) {
  console.log("IMAGE URL: " + imageUrl);
  // const data = await ocrCreate("receipt.jpg");
  const data = await ocrCreate(imageUrl);
  const totalPrice = getTotal(data);
  console.log("Total price is : " + totalPrice);
  return totalPrice;
}

// callOCR();

// export default callOCR;
