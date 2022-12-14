const transitions = [
  { name: "gotStart", from: "waitingStart", to: "waitingStart" },

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
    to: "waitingStart",
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
    name: "gotSelectedPrice",
    from: "waitingPrintExtractedPrice",
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
    to: "waitingStart",
  },
  {
    name: "gotMainFromShowWebApp",
    from: "waitingShowWebApp",
    to: "waitingStart",
  },

  //////////////////////////////////
  /** Input Amount */
  {
    name: "gotInputAmountCmd",
    from: "waitingNewBill",
    to: "waitingInputAmountCmd",
  },
  {
    name: "gotInputAmount",
    from: "waitingInputAmountCmd",
    to: "waitingInputAmount",
  },

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
