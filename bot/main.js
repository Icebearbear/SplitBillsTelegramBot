import TelegramBotClient from "node-telegram-bot-api";
import StateMachine from "javascript-state-machine";
import * as dotenv from "dotenv";
import {
  getEventFromStateAndMessageAndDatabaseFunctions,
  makeTransition,
} from "./events.js";
import transitions from "./transitions.js";
import methods from "./methods.js";
import Context from "./model/Context.js";
import uploadToOCR from "../ocr.js";
import * as db from "../db/firebase.js";
dotenv.config();

const token = process.env.TELEGRAM_TOKEN;

function createFsm() {
  return StateMachine({
    init: "waitingStart",
    transitions: transitions,
    methods: methods,
  });
}

// for state that doesnt require inputs to transition
function jumpToNextState(th, stateBefore, message, fsm) {
  const statesList = [
    "waitingCalculateBills",
    "waitingShowWebApp",
    "waitingCalculateBillsFrInputAmount",
    "waitingInputAmountError",
  ];
  console.log(
    "JUMP STATE ,",
    stateBefore,
    statesList.indexOf(stateBefore) != -1
  );
  if (statesList.indexOf(stateBefore) != -1) {
    th.respondTo(message, fsm);
  }
}

async function changeTextIfWrongTypeAndAddToList(th, stateBefore, text) {
  console.log("ENTER changeTextIfWrongTypeAndAddToList " + text);
  if (stateBefore === "waitingInputAmountCmd") {
    th.setManualInput(text);
    if (th.getManualInput() === null) {
      return "wrong type";
    } else {
      return text;
    }
  } else {
    return text;
  }
}

async function saveBillsAndSummaryToDb(th, message, context) {
  const billObj = { bills: th.getBillList(), userId: message.from.id };
  var billId = null;
  await th.db
    .saveBill(billObj)
    .then((id) => {
      billId = id;
    })
    .then(async () => {
      // let noMembers = await self.getChatMemberCount(
      //   message.chat.id,
      //   message.from.id
      // );
      let noMembers = 2;
      console.log("nO OF MEMBERS BILL ID :" + noMembers + billId);
      th.setMembersCount(noMembers);
      // const summary = await calculateSplitbills(
      //   this.getTotalBill(),
      //   this.getMembersCount()
      // );
      // const summary = createSummary();
      const summary = "THESE ARE MOCK SUMMARY";
      context.addText(summary);
      const summaryObj = { summary: summary, billId: billId };
      await th.db.saveSummary(summaryObj);
    });
}

async function stateFunctions(th, stateBefore, message, context) {
  if (stateBefore === "waitingAddReceipt" && message.photo) {
    console.log("before ocr");
    // th.setTotalBill(await uploadToOCR(message));
    th.setReceiptInput("2000");
    context.addText(th.getReceiptInput());
  }
  if (stateBefore === "waitingConfirmPrice") {
    th.setBillList(th.getReceiptInput());
  }
  if (stateBefore === "waitingInputPriceConfirm") {
    th.setBillList(th.getManualInput());
  }
  if (stateBefore === "waitingInputAmountCmd") {
    console.log("enter change input amount message");
    context.addText(message.text);
  }
  if (stateBefore === "waitingCalculateBills") {
    console.log("enter calculate split bills");
    console.log("Final bill list : " + th.getBillList());

    await saveBillsAndSummaryToDb(th, message, context);
  }
}

function calculateSplitbills() {}

function createSummary() {}

export default class Bot {
  constructor(token) {
    this.client = new TelegramBotClient(token, { polling: true });
    this.membersCount = 0;
    this.receiptInput = 0;
    this.manualInput = null;
    this.db = db;
    // store state in telegrambot when add more bill before closing the tab
    this.billList = [];
  }

  getMembersCount() {
    return this.getMembersCount;
  }
  setMembersCount(inp) {
    this.membersCount = inp;
  }
  getReceiptInput() {
    return this.totalBill;
  }
  setReceiptInput(bill) {
    this.totalBill = bill;
  }
  getManualInput() {
    return this.manualInput;
  }
  setManualInput(inp) {
    // check if inp (type string) can be converted to Integer, Double, or value is more than zero
    if (/^\d+$/.test(inp) || !isNaN(parseFloat(inp))) {
      if (inp > 0) {
        this.manualInput = inp;
      }
    } else {
      this.manualInput = null;
      console.log("wrong input type");
    }
  }
  setBillList(bill) {
    this.billList.push(parseFloat(bill));
  }
  getBillList() {
    return this.billList;
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
      // let text = prevReply.text;
      var self = this.client;

      let text = await changeTextIfWrongTypeAndAddToList(
        this,
        fsm.state,
        prevReply.text
      );

      //get the transition event according to current state and input command
      console.log(text);
      let event = getEventFromStateAndMessageAndDatabaseFunctions(
        fsm.state,
        text,
        this.db,
        message
      );
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
