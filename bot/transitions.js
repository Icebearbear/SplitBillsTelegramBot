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

  // on hold //
  {
    name: "gotRetryPrice",
    from: "waitingPrintExtractedPrice",
    to: "waitingRetryPrice",
  },
  // /////////////
  {
    name: "gotConfirmPrice",
    from: "waitingPrintExtractedPrice",
    to: "waitingConfirmPrice",
  },

  /////////////////////////////
  {
    name: "gotAddMoreReceipt",
    from: "waitingConfirmPrice",
    to: "waitingAddReceipt",
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
    to: "waitingInputAmountCmd",
  },
];

export default transitions;
