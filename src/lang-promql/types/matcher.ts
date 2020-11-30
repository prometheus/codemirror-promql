import { EqlSingle, Neq } from 'lezer-promql';

export class Matcher {
  type: number;
  name: string;
  value: string;

  constructor(type: number, name: string, value: string) {
    this.type = type;
    this.name = name;
    this.value = value;
  }

  matchesEmpty(): boolean {
    switch (this.type) {
      case EqlSingle:
        return this.value === '';
      case Neq:
        return this.value !== '';
      default:
        return false;
    }
  }
}
