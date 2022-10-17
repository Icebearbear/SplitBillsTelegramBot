import TelegramBotClient from "node-telegram-bot-api";
import StateMachine from "javascript-state-machine";
import * as dotenv from "dotenv";

dotenv.config();

const token = process.env.TELEGRAM_TOKEN;

function createFsm() {
  return StateMachine({
    init: "waitingStart",
    transitions: [
      { name: "gotStart", from: "waitingStart", to: "waitingStart" },

      //// two options from /start
      { name: "gotStartToHistory", from: "waitingStart", to: "waitingHistory" },
      { name: "gotStartToNewBill", from: "waitingStart", to: "waitingNewBill" },

      //// two options from /newbill
      {
        name: "gotNewBillToAddReceipt",
        from: "waitingNewBill",
        to: "waitingAddReceipt",
      },
      {
        name: "gotNewBillToInputAmountCmd",
        from: "waitingNewBill",
        to: "waitingInputAmountCmd",
      },

      /* branch from /newbill */

      //// Add receipt ////
      { name: "gotReceipt", from: "waitingAddReceipt", to: "waitingTakePic" },
      { name: "gotPicture", from: "waitingTakePic", to: "printExtractedPrice" },
      {
        name: "gotPrintExtractedPriceToConfirmPrice",
        form: "printExtractedPrice",
        to: "waitingConfirmPrice",
      },
      {
        name: "gotConfirmPriceToAddReceipt",
        from: "waitingConfirmPrice",
        to: "waitingAddReceipt",
      },
      {
        name: "gotConfirmPriceToCalculatePrice",
        from: "waitingConfirmPrice",
        to: "waitingCalculateBills",
      },
      {
        name: "gotCalculateBills",
        from: "waitingCalculateBills",
        to: "printSplitSummary",
      },
      {
        name: "gotPrintSplitSummaryToShowWebapp",
        from: "printSplitSummary",
        to: "waitingShowWebapp",
      },
      {
        name: "gotPrintSplitSummaryToAddReceipt",
        from: "printSplitSummary",
        to: "waitingAddReceipt",
      },
      ///////// retry other price
      {
        name: "gotPrintExtractedPriceToTryOtherPrice",
        from: "printExtractedPrice",
        to: "waitingTryOtherPrice",
      },
      {
        name: "gotTryOtherPrice",
        from: "waitngTryOtherPrice",
        to: "printExtractedPrice",
      },
      ///////// todo wait for paid button func

      //// Input amount manually ////
      {
        name: "gotInputAmountCmd",
        from: "waitingInputAmountCmd",
        to: "waitingAmount",
      },
      { name: "gotAmount", from: "waitingAmount", to: "printInputPrice" },
      {
        name: "gotPrintInputPrice",
        from: "printInputPrice",
        to: "waitingConfirmPrice",
      },
      {
        name: "gotConfirmPriceToInputAmount",
        from: "waitingConfirmPrice",
        to: "waitingAmount",
      },
      {
        name: "gotConfirmAmount",
        from: "waitingConfirmPrice",
        to: "waitingAddAnotherAmount",
      }, //saved amount to db
      {
        name: "gotDoneInputAmount",
        from: "waitingAddAnotherAmount",
        to: "waitingCalculateBills",
      },
      {
        name: "gotAddAnotherAmount",
        from: "waitingAddAnotherAmount",
        to: "waitingAmount",
      },

      /* branch from /history */
      { name: "gotHistory", from: "waitingHistory", to: "printHistory" },
      {
        name: "gotPrintHistoryToStart",
        from: "printHistory",
        to: "waitingStart",
      },
      {
        name: "gotPrintHistoryToShowWebApp",
        from: "printHistory",
        to: "waitingShowWebapp",
      },

      // todo
      { name: "gotStop", from: "waitingStart", to: "stopped" },
    ],
    methods: {
      onGotStart: function () {
        console.log("enter ongotstart");
        const opts = {
          reply_markup: {
            keyboard: [["New bill"], ["Bill history"]],
          },
        };
        const text =
          "Let's begin! Select a function \n new bill to start splitting bill \n history to show current split bill history";
        return [text, opts];
      },
      onGotStartToNewBill: function () {
        console.log("enter ongotstartToNewBill");
        const opts = {
          reply_markup: {
            remove_keyboard: true,
          },
        };
        const text = "new bil event";
        return [text, opts];
      },
      onGotStartToHistory: function () {
        console.log("enter ongotstartToHistory");
        const opts = {
          reply_markup: {
            remove_keyboard: true,
          },
        };
        const text = "bill history";
        return [text, opts];
      },
      onGotNewBillToAddReceipt: function () {
        return;
      },
      onGotNewBillToInputAmountCmd: function () {
        return;
      },
      onGotReceipt: function () {
        return;
      },
      onGotPicture: function () {
        return;
      },
      onGotPrintExtractedPriceToConfirmPrice: function () {
        return;
      },
      onGotConfirmPriceToAddReceipt: function () {
        return;
      },
      onGotConfirmPriceToCalculatePrice: function () {
        return;
      },
      onGotCalculateBills: function () {
        return;
      },
      onGotPrintSplitSummaryToShowWebapp: function () {
        return;
      },
      onGotPrintSplitSummaryToAddReceipt: function () {
        return;
      },
      onGotPrintExtractedPriceToTryOtherPrice: function () {
        return;
      },
      onGotTryOtherPrice: function () {
        return;
      },
      onGotInputAmountCmd: function () {
        return;
      },
      onGotAmount: function () {
        return;
      },
      onGotPrintInputPrice: function () {
        return;
      },
      onGotConfirmPriceToInputAmount: function () {
        return;
      },
      onGotConfirmAmount: function () {
        return;
      },
      onGotDoneInputAmount: function () {
        return;
      },
      onGotAddAnotherAmount: function () {
        return;
      },
      onGotHistory: function () {
        return;
      },
      onGotPrintHistoryToStart: function () {
        return;
      },
      onGotPrintHistoryToShowWebApp: function () {
        return;
      },
      onGotStop: function () {
        return;
      },
    },
  });
}

function getEventFromStateAndMessage(state, text) {
  // console.log("getEvent", state, text);
  switch (state) {
    case "waitingStart":
      if (text === "New bill") {
        return "gotStartToNewBill";
      }
      if (text === "Bill history") {
        return "gotStartToHistory";
      } else {
        return text === "/start" && "gotStart";
      }
    case "waitingNewBill":
      return text === "Add receipt"
        ? "gotNewBillToAddReceipt"
        : "gotNewBillToInputAmountCmd";
    case "waitingTakePic":
      return "gotPicture";
    case "printExtractedPrice":
      return text === "Confirm"
        ? "gotPrintExtractedPriceToConfirmPrice"
        : "gotConfirmPriceToCalculatePrice";
    case "waitingConfirmPrice":
      return text === "Calculate bills"
        ? "gotConfirmPriceToCalculatePrice"
        : "gotConfirmPriceToAddReceipt";
    case "waitingCalculateBills":
      return "gotCalculateBills";
    case "printSplitSummary":
      return text === "Show on Web App"
        ? "gotPrintSplitSummaryToShowWebapp"
        : "gotPrintSplitSummaryToAddReceipt";
    case "waitingTryOtherPrice":
      return "gotTryOtherPrice";
    case "waitingInputAmountCmd":
      return "gotInputAmountCmd";
    case "waitingAmount":
      return "gotAmount";
    case "printInputPrice":
      return "gotPrintInputPrice";
    case "waitingConfirmPrice":
      return text === "Add another amount"
        ? "waitingAddAnotherAmount"
        : "gotConfirmPriceToInputAmount";
    case "waitingAddAnotherAmount":
      return text === "Done" ? "gotDoneInputAmount" : "gotAddAnotherAmount";
    case "waitingStop":
      return "gotStop";
    // case "waitingNewbill":
  }
}

function makeTransition(fsm, transition) {
  switch (transition) {
    case "gotStart":
      return fsm.gotStart();
    case "gotStartToNewBill":
      return fsm.gotStartToNewBill();
    case "gotStartToHistory":
      return fsm.gotStartToHistory();

    case "gotNewBillToAddReceipt":
      return fsm.onGotNewBillToAddReceipt();
    case "gotNewBillToInputAmountCmd":
      return fsm.onGotNewBillToInputAmountCmd();
    case "gotReceipt":
      return fsm.onGotReceipt();
    case "gotPicture":
      return fsm.onGotPicture();
    case "gotPrintExtractedPriceToConfirmPrice":
      return fsm.onGotPrintExtractedPriceToConfirmPrice();
    case "gotConfirmPriceToAddReceipt":
      return fsm.onGotConfirmPriceToAddReceipt();
    case "gotConfirmPriceToCalculatePrice":
      return fsm.onGotConfirmPriceToCalculatePrice();
    case "gotCalculateBills":
      return fsm.onGotCalculateBills();
    case "gotPrintSplitSummaryToShowWebapp":
      return fsm.onGotPrintSplitSummaryToShowWebapp();
    case "gotPrintSplitSummaryToAddReceipt":
      return fsm.onGotPrintSplitSummaryToAddReceipt();
    case "gotPrintExtractedPriceToTryOtherPrice":
      return fsm.onGotPrintExtractedPriceToTryOtherPrice();
    case "gotTryOtherPrice":
      return fsm.onGotTryOtherPrice();
    case "gotInputAmountCmd":
      return fsm.onGotInputAmountCmd();
    case "gotAmount":
      return fsm.onGotAmount();
    case "gotPrintInputPrice":
      return fsm.onGotPrintInputPrice();
    case "gotConfirmPriceToInputAmount":
      return fsm.onGotConfirmPriceToInputAmount();
    case "gotConfirmAmount":
      return fsm.onGotConfirmAmount();
    case "gotDoneInputAmount":
      return fsm.onGotDoneInputAmount();
    case "gotAddAnotherAmount":
      return fsm.onGotAddAnotherAmount();
    case "gotHistory":
      return fsm.onGotHistory();
    case "gotPrintHistoryToStart":
      return fsm.onGotPrintHistoryToStart();
    case "gotPrintHistoryToShowWebApp":
      return fsm.onGotPrintHistoryToShowWebApp();

    case "gotStop":
      return fsm.gotStop();
  }
}

function getText(data) {
  return data[0];
}
function getContent(data) {
  return data[1];
}

export default class Bot {
  constructor(token) {
    this.client = new TelegramBotClient(token, { polling: true });
  }

  start() {
    this.client.on("message", (message) => {
      if (!message.reply_to_message) {
        this.respondTo(message);
      }
    });
  }

  async respondTo(message) {
    let fsm = createFsm();
    let prevReply = message;
    let returnedVal;

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
      console.log("returned values from transition");

      self.on("polling_error", console.log);

      // send message according to the event's content and text
      let sentMessage = await self.sendMessage(
        message.chat.id,
        getText(returnedVal),
        getContent(returnedVal)
      );

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
