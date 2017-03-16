import {observable} from "mobx";

@observer class OrderLine {
  @observable price:number = 0;
  @observable amount:number = 1;

  constructor(price) {
    this.price = price;
  }

  @computed get total() {
    return this.price * this.amount;
  }

  @action.bound setPrice(price) {
    this.price = price;
  }
}
