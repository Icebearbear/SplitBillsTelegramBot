function getText(data) {
  return data[0];
}
function getContent(data) {
  return data[1];
}

class Context {
  constructor(returnedVal) {
    this.text = getText(returnedVal);
    this.content = getContent(returnedVal);
  }

  getText() {
    return this.text;
  }
  setText(text) {
    this.text = text;
  }
  changeText(additionalText) {
    this.text = additionalText;
  }
  addText(additionalText) {
    this.text += additionalText;
  }

  getContent() {
    return this.content;
  }
  setContent(content) {
    this.content = content;
  }
}

export default Context;
