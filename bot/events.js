export function getEventFromStateAndMessage(state, text) {
  console.log("getEvent", state, text);
  switch (state) {
    case "waitingStart":
      if (text === "New bill") {
        return "gotNewBill";
      }
      if (text === "Bill history") {
        return "gotBillHistory";
      } else {
        return text === "/start" && "gotStart";
      }
    case "waitingNewBill":
      if (text === "Add receipt") {
        return "gotAddReceipt";
      }
      if (text === "Input amount") {
        return "gotInputAmountCmd";
      }
    /////////////////////////////////////////////////
    /** History */
    case "waitingHistory":
      if (text === "Show in Web app") {
        return "gotShowWebAppForHistory";
      }
      if (text === "Back to Main") {
        return "gotBackToMainForHistory";
      }
    ///////////////////////////////////////////////////
    /** Add Receipt */
    case "waitingAddReceipt":
      return "gotPrintedPrice";
    case "waitingPrintExtractedPrice":
      if (text === "Confirm") {
        return "gotConfirmPrice";
      }
      if (text === "Retry extracting price") {
        return "gotRetryPrice";
      }
    case "waitingConfirmPrice":
      if (text === "Add more") {
        return "gotAddMoreReceipt";
      }
      if (text === "I am done. calculate splits") {
        return "gotCalculateBills";
      }
    case "waitingCalculateBills":
      return "gotPrintCalculatedBills";

    case "waitingPrintCalculateBills" || "waitingHistory":
      if (text === "Show in Web app") {
        return "gotShowWebApp";
      }
      if (text === "Back to Main") {
        return "gotBackToMain";
      }
    case "waitingShowWebApp":
      return "gotMainFromShowWebApp";

    ///////////////////////////////////////////
    /** Input Amount */
    case "waitingInputAmountCmd":
      if (text === "wrong type") {
        return "gotInputAmountError"; // error when data type is wrong
      } else {
        return "gotInputAmount";
      }

    case "waitingInputAmount":
      if (text === "Confirm") {
        return "gotInputConfirmCmd";
      }
      if (text === "Retry") {
        return "gotInputRetryCmd";
      }

    case "waitingInputAmountError":
      return "gotInputAmountErrorToCmd";

    case "waitingInputPriceConfirm":
      if (text === "Add another amount") {
        return "gotAnotherAmountForInputAmount";
      }
      if (text === "I'm done. Calculate splits bill") {
        return "gotCalculateBillsForInputAmount";
      }
    case "waitingInputRetryCmd":
      return "gotInputRetry";
  }
}

export function makeTransition(fsm, transition) {
  console.log("makeTransisiton : ", transition);
  switch (transition) {
    case "gotStart":
      return fsm.gotStart();
    case "gotNewBill":
      return fsm.gotNewBill();

    ///////////////////////////////////////////
    /** Add Receipt */
    case "gotAddReceipt":
      return fsm.gotAddReceipt();
    case "gotPrintedPrice":
      return fsm.gotPrintedPrice();

    case "gotConfirmPrice":
      return fsm.gotConfirmPrice();
    case "gotRetryPrice":
      return fsm.gotRetryPrice();

    case "gotAddMoreReceipt":
      return fsm.gotAddMoreReceipt();
    case "gotCalculateBills":
      return fsm.gotCalculateBills();

    case "gotPrintCalculatedBills":
      return fsm.gotPrintCalculatedBills();

    case "gotShowWebApp":
      return fsm.gotShowWebApp();
    case "gotBackToMain":
      return fsm.gotBackToMain();

    case "gotMainFromShowWebApp":
      return fsm.gotMainFromShowWebApp();

    ///////////////////////////////////////////
    /** Input Amount */
    case "gotInputAmountCmd":
      return fsm.gotInputAmountCmd();
    case "gotInputAmount":
      return fsm.gotInputAmount();
    case "gotInputAmountError":
      return fsm.gotInputAmountError();
    case "gotInputAmountErrorToCmd":
      return fsm.gotInputAmountErrorToCmd();
    case "gotInputRetryCmd":
      return fsm.gotInputRetryCmd();
    case "gotInputRetry":
      return fsm.gotInputRetry();
    case "gotInputConfirmCmd":
      return fsm.gotInputConfirmCmd();
    case "gotCalculateBillsForInputAmount":
      return fsm.gotCalculateBillsForInputAmount();
    case "gotAnotherAmountForInputAmount":
      return fsm.gotAnotherAmountForInputAmount();

    ///////////////////////////////////////////
    /** History */
    case "gotBillHistory":
      return fsm.gotBillHistory();
    case "gotShowWebAppForHistory":
      return fsm.gotShowWebAppForHistory();
    case "gotBackToMainForHistory":
      return fsm.gotBackToMainForHistory();
  }
}
