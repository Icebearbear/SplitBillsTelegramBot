import TelegramBotClient from "node-telegram-bot-api";
import StateMachine from "javascript-state-machine";
import * as dotenv from "dotenv";
import {
  getEventFromStateAndMessageAndDatabaseFunctions,
  makeTransition,
} from "./events.js";
import transitions from "./transitions.js";
import * as methods from "./methods.js";
import Context from "./model/Context.js";
import uploadToOCR from "../ocr.js";
import * as db from "../db/firebase.js";
dotenv.config();

const token = process.env.TELEGRAM_TOKEN;

function createFsm() {
  return StateMachine({
    init: "waitingStart",
    transitions: transitions,
    methods: methods.methods,
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
  }
  if (stateBefore === "waitingPrintExtractedPrice") {
    th.setReceiptInput(text);
    if (th.getReceiptInput() === null) {
      return "wrong input";
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
      // get all members name
      // const members = []
      const self = th.client;
      const noMembers = await self.getChatMemberCount(message.chat.id);
      th.setMembersCount(noMembers);
      console.log("nO OF MEMBERS BILL ID :" + th.getMembersCount() + billId);

      console.log("lists ", th.getBillList());
      const summary = createSummary(th.getBillList(), th.getMembersCount());
      context.addText(summary);
      await th.db.saveSummary({ summary: summary, billId: billId });
    });
}

async function stateFunctions(th, stateBefore, message, context, evnt) {
  console.log("inside statefunction :", message.text, stateBefore);
  if (stateBefore === "waitingAddReceipt" && message.photo) {
  }
  if (stateBefore === "waitingConfirmPrice") {
    console.log("enter waiting confirm price");
    th.setBillList({ amount: th.getReceiptInput(), from: message.from.id });
  }
  if (stateBefore === "waitingInputPriceConfirm") {
    console.log("enter waiting confirm input price");
    th.setBillList({ amount: th.getManualInput(), from: message.from.id });
  }
  if (
    stateBefore === "waitingInputAmount" ||
    stateBefore === "waitingGotSelectedPrice"
  ) {
    console.log("enter change input amount message");
    context.addText(message.text);
  }
  if (stateBefore === "waitingPrintCalculateBills") {
    console.log("enter calculate split bills");
    console.log("Final bill list : " + th.getBillList());

    await saveBillsAndSummaryToDb(th, message, context);
  }
}

function calculateSplitbills(billList, noMembers) {
  let total = 0;
  console.log("calculateSPlitbill,", billList);
  billList.forEach((bill) => {
    total += bill.amount;
  });
  return (total / noMembers).toFixed(2);
}

function createSummary(billList, noMembers) {
  const splitAmount = calculateSplitbills(billList, noMembers);
  const summaryText = `Everyone pays ${splitAmount} to ______`;
  return summaryText;
}

export default class Bot {
  constructor(token) {
    this.client = new TelegramBotClient(token, { polling: true });
    this.membersCount = 0;
    this.receiptInput = 0;
    this.manualInput = null;
    this.db = db;
    this.extractedBillAmount = [];
    // store state in telegrambot when add more bill before closing the tab
    this.billList = [];
  }

  getMembersCount() {
    return this.membersCount;
  }
  setMembersCount(inp) {
    console.log("members count ", inp, " ", typeof inp);
    if (typeof inp != "number" && !isNaN(parseFloat(inp))) {
      this.membersCount = parseFloat(inp);
    }
    if (typeof inp === "number") {
      this.membersCount = inp - 1;
    } else {
      this.membersCount = 1;
    }
  }
  getReceiptInput() {
    return this.receiptInput;
  }
  setReceiptInput(inp) {
    if (this.getExtractedBillAmount().indexOf(inp) != -1) {
      // exist in the list
      this.receiptInput = parseFloat(inp);
    } else {
      this.receiptInput = null;
    }
  }

  getManualInput() {
    return this.manualInput;
  }
  setManualInput(inp) {
    // check if inp (type string) can be converted to Integer, Double, or value is more than zero
    if (/^\d+$/.test(inp) || !isNaN(parseFloat(inp))) {
      if (inp > 0) {
        console.log("entered, ", parseFloat(inp));
        this.manualInput = parseFloat(inp);
      }
    } else {
      this.manualInput = null;
      console.log("wrong input type");
    }
  }
  setBillList(bill) {
    this.billList.push(bill);
  }
  getBillList() {
    return this.billList;
  }
  setExtractedBillAmount(amounts) {
    this.extractedBillAmount = amounts;
  }
  getExtractedBillAmount() {
    return this.extractedBillAmount;
  }

  start() {
    let fsm = createFsm();
    this.client.on("message", (message) => {
      if (!message.reply_to_message) {
        this.respondTo(message, fsm);
      }
    });
  }

  reset() {
    this.membersCount = 0;
    this.receiptInput = 0;
    this.manualInput = null;
    this.db = db;
    this.extractedBillAmount = [];
    // store state in telegrambot when add more bill before closing the tab
    this.billList = [];
  }

  async respondTo(message, fsm) {
    let prevReply = message;
    let returnedVal;

    while (!fsm.is("stop")) {
      console.log("current state : " + fsm.state);
      console.log(message);
      var self = this.client;

      let text = await changeTextIfWrongTypeAndAddToList(
        this,
        fsm.state,
        prevReply.text
      );

      //get the transition event according to current state and input command
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
      console.log("stateBefore : ", fsm.state);
      if (fsm.state === "waitingAddReceipt") {
        this.setExtractedBillAmount(await uploadToOCR(message));
        await methods.setExtractedBillChoices(this.getExtractedBillAmount());
      }
      if (fsm.state === "waitingStart") {
        this.reset();
      }
      // additional functions on certain states

      console.log("extracted amount ", this.getExtractedBillAmount());
      // do transition and get the contents to be sent as message
      returnedVal = makeTransition(fsm, event);
      console.log("returned values from transition : ", returnedVal);

      // class to keep the values
      const context = new Context(returnedVal);
      await stateFunctions(this, fsm.state, message, context, event);

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
