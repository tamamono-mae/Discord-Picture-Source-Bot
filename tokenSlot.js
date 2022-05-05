class TokenSlot {
  constructor(tokenArray) {
    this.tokenArray = tokenArray;
    this.inuseAddress = 0;
  }

  renew() {
    this.inuseAddress++;
    if (this.inuseAddress+1 > this.tokenArray.length) this.inuseAddress = 0;
    return this.tokenArray[this.inuseAddress];
  }

  get() {
    return this.tokenArray[this.inuseAddress];
  }

  getIndex() {
    return this.inuseAddress;
  }
}

module.exports = TokenSlot;