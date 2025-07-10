export class Player {
  private name: string;
  private id: number;

  constructor(id: number, name: string) {
    this.name = name;
    this.id = id;
  }

  getName = () => this.name;
  getId = () => this.id;
}
