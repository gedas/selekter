export type Observer<T> = (value: T, added: boolean) => void;

export class ObservableSet<T> extends Set<T> {
  constructor(values: Iterable<T>, private observer: Observer<T>) {
    super();
  }

  add(value: T) {
    let had = super.has(value);
    super.add(value);
    if (!had) {
      this.observer(value, true);
    }
    return this;
  }

  delete(value: T) {
    return super.delete(value) && (this.observer(value, false), true);
  }

  clear() {
    let values = Array.from(this.values());
    super.clear();
    values.forEach(value => this.observer(value, false));
  }

}