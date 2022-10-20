import TelegramBotClient from "node-telegram-bot-api";
import StateMachine from "javascript-state-machine";
import * as dotenv from "dotenv";
import axios from "axios";
import ocrCreate from "../ocr.js";
import { getEventFromStateAndMessage, makeTransition } from "./events.js";
import transitions from "./transitions.js";
import methods from "./methods.js";
import Context from "./model/Context.js";
import callOCR from "../ocr.js";
dotenv.config();

const token = process.env.TELEGRAM_TOKEN;

function createFsm() {
  return StateMachine({
    init: "waitingStart",
    transitions: transitions,
    methods: methods,
  });
}

async function uploadToOCR(message) {
  console.log("entered if else for gotNewBillToAddReceipt");
  const imageId = message.photo[0].file_id;
  var imageUrl;
  var extractedPrice = 100;
  await axios
    .get(`https://api.telegram.org/bot${token}/getFile?file_id=${imageId}`)
    .then(async (res) => {
      console.log(res.data);
      const filePath = res.data.result.file_path;
      console.log(filePath);
      // image url in Telegram server
      imageUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
      // pass to a function of OCR and get the extracted price
      //for now hardcode a pic first

      extractedPrice = await callOCR(imageUrl); // pass in a base64, url
      console.log("end axios :" + extractedPrice);
    })
    .then(() => {
      return extractedPrice;
    })
    .catch((e) => {
      console.log("ERROR IN OCR : " + e);
    });
  console.log("return price", extractedPrice);
  return extractedPrice;
}

// for state that doesnt require inputs to transition
function jumpToNextState(th, stateBefore, message, fsm) {
  const statesList = [
    "waitingCalculateBills",
    "waitingShowWebApp",
    "onGotCalculateBillsFrInputAmount",
  ];
  console.log(
    "JUMP STATE ,",
    stateBefore,
    statesList.indexOf(stateBefore) != -1
  );
  // if (stateBefore === "waitingShowWebApp") {
  //   message.text = "";
  // }
  if (statesList.indexOf(stateBefore) != -1) {
    th.respondTo(message, fsm);
  }
}

async function stateFunctions(th, stateBefore, message, context) {
  if (stateBefore === "waitingAddReceipt" && message.photo) {
    console.log("before ocr");
    // th.setTotalBill(await uploadToOCR(message));
    th.setTotalBill(2000);
    context.changeText(th.getTotalBill());
  }
  if (stateBefore === "waitingInputAmountCmd") {
    console.log("enter change input amount message");
    context.changeText(message.text);
  }
  if (stateBefore === "waitingCalculateBills") {
    console.log("enter calculate split bills");
    // let noMembers = await self.getChatMemberCount(
    //   message.chat.id,
    //   message.from.id
    // );
    let noMembers = 2;
    console.log("nO OF MEMBERS :" + noMembers);
    th.setMembersCount(noMembers);
    // const summary = await calculateSplitbills(
    //   this.getTotalBill(),
    //   this.getMembersCount()
    // );
    const summary = "THESE ARE MOCK SUMMARY";
    console.log("SUMMARY BILLS :" + summary);
    context.changeText(summary);
  }
}

function calculateSplitbills() {}

export default class Bot {
  constructor(token) {
    this.client = new TelegramBotClient(token, { polling: true });
    this.membersCount = 0;
    this.totalBill = 0;
  }

  getMembersCount() {
    return this.getMembersCount;
  }
  setMembersCount(inp) {
    this.membersCount = inp;
  }
  getTotalBill() {
    return this.totalBill;
  }
  setTotalBill(bill) {
    this.totalBill = bill;
  }

  start() {
    let fsm = createFsm();
    this.client.on("message", (message) => {
      if (!message.reply_to_message) {
        this.respondTo(message, fsm);
      }
    });
  }

  async respondTo(message, fsm) {
    let prevReply = message;
    let returnedVal;
    let stateBefore = fsm.state;

    console.log("enter respondTo with message : ", message);

    while (!fsm.is("stop")) {
      console.log("current state : " + fsm.state);
      let text = prevReply.text;
      var self = this.client;

      //get the transition event according to current state and input command
      let event = getEventFromStateAndMessage(fsm.state, text);
      console.log("received event : " + event);

      // check if the event is in fsm, if no enter the if statement
      if (!event || fsm.cannot(event)) {
        this.client.sendMessage(
          message.chat.id,
          "I dont get what the shit you are saying \n Please select the correct command"
        );
        break;
      }
      // do transition and get the contents to be sent as message
      returnedVal = makeTransition(fsm, event);
      console.log("returned values from transition : ", returnedVal);

      // class to keep the values
      const context = new Context(returnedVal);

      // additional functions on certain states
      await stateFunctions(this, stateBefore, message, context);

      console.log("next state : " + fsm.state);
      // self.on("polling_error", console.log);

      // send message according to the event's content and text
      let sentMessage = await self.sendMessage(
        message.chat.id,
        context.getText(),
        context.getContent()
      );

      await jumpToNextState(this, fsm.state, message, fsm);

      console.log("done");

      // resolve the message sent earlier by replying to it and passing resolve to reply callback func
      prevReply = await new Promise((resolve) =>
        self.onReplyToMessage(
          sentMessage.chat.id,
          sentMessage.message_id,
          resolve
        )
      );
    }
  }
}

const bot = new Bot(token);
bot.start();

// self.on("callback_query", function onCallbackQuery(callbackQuery) {
//   console.log("inside callback query");
//   const msg = callbackQuery.message;
//   let text;
//   const opts = {
//     chat_id: msg.chat.id,
//     message_id: msg.message_id,
//   };
//   switch (callbackQuery.data) {
//     case "newBillCallback":
//       text = "newbill";
//     case "billHistoryCallback":
//       text = "billhistory";
//   }
//   console.log("edit", text);
//   self.editMessageText(text, opts);
// });

// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   bot.sendMessage(
//     chatId,
//     "Hello welcome! Let's split those bills! \n /newbill --> add new bills \n /history --> view current bills history"
//   );
// });

// bot.onText(/\/history/, (msg) => {
//   const chatId = msg.chat.id;

//   // retrieve bills from db

//   const opts = {
//     reply_markup: {
//       inline_keyboard: [
//         [{ text: "View Web App", callback_data: "webappView" }],
//       ],
//     },
//   };
//   // display all bills history
//   bot.sendMessage(
//     msg.from.id,
//     "This is your bills history \n click the button to see  the web app version",
//     opts
//   );
// });
// bot.onText(/\/newbill/, (msg) => {
//   const chatId = msg.chat.id;
//   const opts = {
//     reply_markup: {
//       inline_keyboard: [
//         [{ text: "Add receipt", callback_data: "addReceipt" }],
//         [{ text: "Input Amount", callback_data: "inputAmount" }],
//       ],
//     },
//   };
//   bot.sendMessage(msg.from.id, "NewBill text", opts);
// });
// // handle callback queries
