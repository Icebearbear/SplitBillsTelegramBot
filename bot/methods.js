let extractedBillChoices = [];
function setExtractedBillChoices(choices) {
  console.log("choices", choices);
  extractedBillChoices = choices;
}
function hideKeyboard() {
  return {
    reply_markup: {
      remove_keyboard: true,
    },
  };
}

function setKeyboard(inputs) {
  console.log("set keyboard input", inputs);
  const keyboardList = [];
  inputs.forEach((inp) => {
    keyboardList.push([inp]);
  });
  // console.log(keyboardList);
  return {
    reply_markup: {
      keyboard: keyboardList,
    },
  };
}

function getGoingMainContent() {
  const text = "Redirecting to web app.... ";
  const opts = hideKeyboard();
  return [text, opts];
}

function getReceiptOrInputManually(msg) {
  console.log("enter ongotNewBill");
  const opts = setKeyboard(["Add receipt", "Input amount"]);
  const text = `${msg}Add receipt --> take picture of your receipt and we will do the rest! \nInput amount --> input the amount manually yourself!`;
  return [text, opts];
}

function getMainContent(txt) {
  const opts = setKeyboard(["New bill", "Bill history"]);
  const text = `${txt} Select a function \nNew bill --> start splitting bill \nBill history --> show current split bill history`;
  return [text, opts];
}

function getReceiptAmountChoices() {
  console.log("onGotSelectedAnotherPrice ");
  console.log("extracted ", extractedBillChoices);
  const text = "Price is extracted. Please select the correct price";
  const opts = setKeyboard(extractedBillChoices);
  return [text, opts];
}

// elements that interract with user to make the transition happen
// e.g waiting for text or button selection from user
const methods = {
  onGotStart: function () {
    console.log("enter ongotstart");
    return getMainContent("Lets begin!");
  },
  onGotNewBill: function () {
    return getReceiptOrInputManually("");
  },
  onGotAddReceipt: function () {
    console.log("enter onGotAddReceipt");
    const opts = hideKeyboard();
    const text =
      "Add receipt is selected. Please upload a picture of your receipt";
    // waiting for pic upload
    return [text, opts];
  },
  onGotPrintedPrice: function () {
    return getReceiptAmountChoices();
  },
  onGotSelectedPrice: function () {
    const text = "Selected price is ----> ";
    const opts = setKeyboard(["Confirm", "Select another amount"]);
    return [text, opts];
  },
  onGotConfirmPrice: function () {
    const text =
      "Price is confirmed. \nWound you like to add more receipt? \n You will close the tab by selecting done and calculate split and won't be able to add to the tab ";
    const opts = setKeyboard(["Add more", "I am done. calculate splits"]);
    return [text, opts];
  },
  onGotSelectAnotherPrice: function () {
    return getReceiptAmountChoices();
  },
  onGotErrorReceiptInput: function () {
    return getReceiptAmountChoices();
  },
  onGotAddMoreReceipt: function () {
    return getReceiptOrInputManually("Add More is selected ");
  },
  onGotCalculateBills: function () {
    const text = "Calculating splits now. Please wait a moment...";
    const opts = hideKeyboard();
    return [text, opts];
  },
  onGotPrintCalculatedBills: function () {
    const text =
      "Done calculating bill splits. Click the button to view in web app. Summary: \n";
    const opts = setKeyboard(["Show in Web app", "Back to Main"]);
    return [text, opts];
  },
  onGotShowWebApp: function () {
    return getGoingMainContent();
  },
  onGotBackToMain: function () {
    return getMainContent("You are back to main!");
  },
  onGotMainFromShowWebApp: function () {
    console.log("enter gotmainfromshowwebapp");
    return getMainContent("You are back to main!");
  },
  ///// Input amount ///////
  onGotInputAmountCmd: function () {
    const text =
      "Input amount is selected. Please input the bill amount manually";
    const opts = hideKeyboard();
    return [text, opts];
  },
  onGotInputAmount: function () {
    const text = "Press confirm to proceed. Received the amount of ";
    const opts = setKeyboard(["Confirm", "Retry"]);
    return [text, opts];
  },
  onGotInputAmountError: function () {
    console.log("enter input amount error");
    const text = "Please input only number or decimal number";
    const opts = hideKeyboard();
    return [text, opts];
  },
  onGotInputAmountErrorToCmd: function () {
    const text =
      "Input amount is selected. Please input the bill amount manually";
    const opts = hideKeyboard();
    return [text, opts];
  },
  onGotInputRetryCmd: function () {
    const text = "Retry new amount is selected. Please input the bill amount";
    const opts = hideKeyboard();
    return [text, opts];
  },
  onGotInputConfirmCmd: function () {
    const text =
      "Bill amount is confirmed. \nWound you like to add another amount? \nThe tab will be closed when Done and Calculate Split is selected and you won't be able to add to the tab ";
    const opts = setKeyboard([
      "Add another amount",
      "I'm done. Calculate splits bill",
    ]);
    return [text, opts];
  },
  onGotCalculateBillsForInputAmount: function () {
    const text = "Calculating splits now. Please wait a moment...";
    const opts = hideKeyboard();
    return [text, opts];
  },
  onGotAnotherAmountForInputAmount: function () {
    return getReceiptOrInputManually("Add more is selected ");
  },
  ////// History ///////
  onGotBillHistory: function () {
    const text = "These are your billing history so far \n";
    const opts = setKeyboard(["Show in Web app", "Back to Main"]);
    return [text, opts];
  },
  onGotShowWebAppForHistory: function () {
    return getGoingMainContent();
  },
  onGotBackToMainForHistory: function () {
    return getMainContent("You are back to main!");
  },
};

export { methods, setExtractedBillChoices };
