export class Square {
  private number: number;

  constructor(id: number) {
    this.number = id;
  }

  getNumber = () => this.number;
}
