import TelegramBotClient from "node-telegram-bot-api";
import StateMachine from "javascript-state-machine";
import * as dotenv from "dotenv";
import { getEventFromStateAndMessage, makeTransition } from "./events.js";
import transitions from "./transitions.js";
import * as methods from "./methods.js";
import Context from "./model/Context.js";
import uploadToOCR from "../ocr.js";
import * as db from "../db/firebase.js";
dotenv.config();

const token = process.env.TELEGRAM_TOKEN;

function createFsm() {
  return StateMachine({
    init: "waitingInit",
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
    "waitingErrorSelectReceiptOwnerInput",
  ];
  if (statesList.indexOf(stateBefore) != -1) {
    th.respondTo(message, fsm);
  }
}

async function changeTextIfWrongTypeAndAddToList(th, stateBefore, message) {
  const text = message.text;
  console.log("ENTER changeTextIfWrongTypeAndAddToList " + message);
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
  }
  if (stateBefore === "waitingInit") {
    if (text === "/join") {
      th.db.checkUser(message.from);
      th.setMembersList({
        id: message.from.id,
        username: message.from.username,
      });
    }
    if (text === "/ready") {
      console.log("chat group member : ", th.getMembersList());
      const chatData = {
        chat: message.chat,
        member: th.getMembersList(),
        date: message.date,
      };
      th.db.checkChatGroup(chatData);
    }
    return text;
  }
  if (stateBefore === "waitingSelectReceiptOwner") {
    console.log("check waitingSelectReceiptOwner input", text);
    th.setInputOwner(text);
    if (th.getInputOwner() === null) {
      return "wrong input";
    } else {
      return text;
    }
  } else {
    return text;
  }
}

async function saveBillsAndSummaryToDb(th, message, context) {
  const self = th.client;
  const noMembers = await self.getChatMemberCount(message.chat.id);
  th.setMembersCount(noMembers);
  // console.log("nO OF MEMBERS BILL ID :" + th.getMembersCount() + billId);

  console.log("lists ", th.getBillList());
  const summary = createSummary(th.getBillList(), th.getMembersCount(), th.getInputOwner());
  context.addText(summary);
  await th.db.saveSummary({
    summary: summary,
    bills: th.getBillList(),
    chatId: message.chat.id,
  });
}

async function stateFunctions(th, stateBefore, message, context, evnt) {
  console.log("inside statefunction :", message.text, stateBefore);
  if (stateBefore === "waitingConfirmPrice") {
    console.log("enter waiting confirm price");
    th.setBillList({
      amount: th.getReceiptInput(),
      from: th.getInputOwner(),
      // from: { id: message.from.id, username: message.from.username },
    });
  }
  if (stateBefore === "waitingInputPriceConfirm") {
    console.log("enter waiting confirm input price");
    th.setBillList({
      amount: th.getManualInput(),
      from: th.getInputOwner(),
      // from: { uid: message.from.id, username: message.from.username },
    });
  }
  if (stateBefore === "waitingInputAmount") {
    console.log("enter change input amount message");
    context.addText(
      `$${th.getManualInput()} from ${th.getInputOwner().username}`
    );
  }

  if (stateBefore === "waitingGotSelectedPrice") {
    console.log("enter change receipt amount message");
    context.addText(
      `$${th.getReceiptInput()} from ${th.getInputOwner().username}`
    );
  }
  if (stateBefore === "waitingPrintCalculateBills") {
    console.log("enter calculate split bills");
    console.log("Final bill list : " + th.getBillList());

    await saveBillsAndSummaryToDb(th, message, context);
  }
  if (stateBefore === "waitingHistory") {
    console.log("entered waiting history");
    const datas = await th.db.getSummary(message.chat.id);
    var history = "";
    datas.forEach((data) => {
      history += `\n\nSummary : ${data.summary}\nBills:\n`;
      data.bills.forEach((bill) => {
        history += `$${bill.amount} from ${bill.from.username}\n`;
      });
    });
    context.addText(history);
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
  const summaryText = `Everyone pays ${splitAmount} to ${this.}`;
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
    this.membersList = [];
    this.inputOwner = null;
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
  setMembersList(incomingMember) {
    const add = true;
    const members = this.membersList;
    for (var idx in members) {
      if (members[idx].id === incomingMember.id) {
        add = false;
      }
    }
    if (add) {
      this.membersList.push(incomingMember);
    }
  }
  getMembersList() {
    return this.membersList;
  }
  setInputOwner(owner) {
    const members = this.membersList;
    console.log(members, owner);
    for (var idx in members) {
      console.log(members[idx]);
      if (members[idx].username === owner) {
        console.log("set Input", members[idx].username, owner);
        this.inputOwner = members[idx];
        return;
      }
    }
    this.inputOwner = null;
  }
  getInputOwner() {
    return this.inputOwner;
  }

  start() {
    let fsm = createFsm();
    this.client.on("message", (message) => {
      if (!message.reply_to_message) {
        // console.log("OUTSIDE ", message);
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
    // console.log("OUTSIDE 2", prevReply);
    while (!fsm.is("stop")) {
      console.log("current state : " + fsm.state);
      // console.log("INSIDE ", prevReply);
      var self = this.client;

      let text = await changeTextIfWrongTypeAndAddToList(
        this,
        fsm.state,
        prevReply
      );

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
      console.log("stateBefore : ", fsm.state);
      if (fsm.state === "waitingAddReceipt") {
        this.setExtractedBillAmount(await uploadToOCR(prevReply));
        await methods.setExtractedBillChoices(this.getExtractedBillAmount());
      }
      if (fsm.state === "waitingStart") {
        this.reset();
        const ownerChoice = [];
        console.log("setting keyboard", this.getMembersList());
        const members = this.getMembersList();
        for (var idx in members) {
          console.log(idx, members[idx].username);
          ownerChoice.push(members[idx].username);
        }
        await methods.setExtractedOwnerChoices(ownerChoice);
      }
      // additional functions on certain states

      // do transition and get the contents to be sent as message
      returnedVal = makeTransition(fsm, event);
      console.log("returned values from transition : ", returnedVal);

      // class to keep the values
      const context = new Context(returnedVal);
      await stateFunctions(this, fsm.state, prevReply, context, event);

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
