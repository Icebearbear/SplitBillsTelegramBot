const transitions = [
  { name: "gotInit", from: "waitingInit", to: "waitingInit" },

  { name: "gotStart", from: "waitingInit", to: "waitingStart" },

  { name: "gotJoin", from: "waitingInit", to: "waitingInit" },

  // { name: "gotStart", from: "waitingStart", to: "waitingStart" },

  //// two options from /start
  {
    name: "gotBillHistory",
    from: "waitingStart",
    to: "waitingHistory",
  },
  {
    name: "gotNewBill",
    from: "waitingStart",
    to: "waitingNewBill",
  },
  /////////////////////////////////////////
  //** History */
  {
    name: "gotShowWebAppForHistory",
    from: "waitingHistory",
    to: "waitingShowWebApp",
  },
  {
    name: "gotBackToMainForHistory",
    from: "waitingHistory",
    to: "waitingInit",
  },
  /////////////////////////////////////////////

  //// two options from /newbill

  /* branch from /newbill */

  ///////////////////////////////////////////
  /** Add receipt */
  { name: "gotAddReceipt", from: "waitingNewBill", to: "waitingAddReceipt" },

  {
    name: "gotPrintedPrice",
    from: "waitingAddReceipt",
    to: "waitingPrintExtractedPrice",
  },
  {
    name: "gotSelectReceiptOwner",
    from: "waitingPrintExtractedPrice",
    to: "waitingSelectReceiptOwner",
    // to: "waitingGotSelectedPrice",
  },
  {
    name: "gotSelectedPrice",
    from: "waitingSelectReceiptOwner",
    // from: "waitingPrintExtractedPrice",
    to: "waitingGotSelectedPrice",
  },

  // on hold //
  {
    name: "gotSelectAnotherPrice",
    from: "waitingGotSelectedPrice",
    to: "waitingPrintExtractedPrice",
  },
  {
    name: "gotErrorReceiptInput",
    from: "waitingPrintExtractedPrice",
    to: "waitingPrintExtractedPrice",
  },

  // owner choice error ////
  {
    name: "gotErrorSelectReceiptOwnerInput",
    from: "waitingSelectReceiptOwner",
    to: "waitingErrorSelectReceiptOwnerInput",
  },
  {
    name: "gotErrorSelectReceiptOwnerToSelectReceiptOwner",
    from: "waitingErrorSelectReceiptOwnerInput",
    to: "waitingSelectReceiptOwner",
  },
  //////////////////////////

  // /////////////
  {
    name: "gotConfirmPrice",
    from: "waitingGotSelectedPrice",
    to: "waitingConfirmPrice",
  },

  /////////////////////////////
  {
    name: "gotAddMoreReceipt",
    from: "waitingConfirmPrice",
    to: "waitingNewBill",
  },
  {
    name: "gotCalculateBills",
    from: "waitingConfirmPrice",
    to: "waitingCalculateBills",
  },
  /////////////////////////////////

  {
    name: "gotPrintCalculatedBills",
    from: "waitingCalculateBills",
    to: "waitingPrintCalculateBills",
  },

  ////////////////////////////////
  {
    name: "gotShowWebApp",
    from: "waitingPrintCalculateBills",
    to: "waitingShowWebApp",
  },
  {
    name: "gotBackToMain",
    from: "waitingPrintCalculateBills",
    to: "waitingInit",
  },
  {
    name: "gotMainFromShowWebApp",
    from: "waitingShowWebApp",
    to: "waitingInit",
  },

  //////////////////////////////////
  /** Input Amount */
  {
    name: "gotInputAmountCmd",
    from: "waitingNewBill",
    to: "waitingInputAmountCmd",
  },
  {
    name: "gotSelectInputAmountOwner",
    from: "waitingInputAmountCmd",
    to: "waitingSelectInputAmountOwner",
  },
  {
    name: "gotInputAmount",
    from: "waitingSelectInputAmountOwner",
    to: "waitingInputAmount",
  },
  // input owner choice error ////
  {
    name: "gotErrorSelectAmountOwnerInput",
    from: "waitingSelectInputAmountOwner",
    to: "waitingErrorSelectAmountOwnerInput",
  },
  {
    name: "gotErrorSelectAmountInputOwnerToSelectAmountInputOwner",
    from: "waitingErrorSelectAmountOwnerInput",
    to: "waitingSelectInputAmountOwner",
  },
  //////////////////////////

  // data type error ////
  {
    name: "gotInputAmountError",
    from: "waitingInputAmountCmd",
    to: "waitingInputAmountError",
  },
  {
    name: "gotInputAmountErrorToCmd",
    from: "waitingInputAmountError",
    to: "waitingInputAmountCmd",
  },
  //////////////////////////
  {
    name: "gotInputRetryCmd",
    from: "waitingInputAmount",
    to: "waitingInputAmountCmd",
  },
  {
    name: "gotInputConfirmCmd",
    from: "waitingInputAmount",
    to: "waitingInputPriceConfirm",
  },
  {
    name: "gotCalculateBillsForInputAmount",
    from: "waitingInputPriceConfirm",
    to: "waitingCalculateBills",
  },
  {
    name: "gotAnotherAmountForInputAmount",
    from: "waitingInputPriceConfirm",
    to: "waitingNewBill",
  },
];

export default transitions;
