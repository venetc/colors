export class LinkedListNode<T> {
  public next: LinkedListNode<T> | null = null;
  public prev: LinkedListNode<T> | null = null;

  constructor(public data: T) {
  }
}

interface LinkedListInterface<T> {
  insertInBegin(data: T): LinkedListNode<T>

  insertAtEnd(data: T): LinkedListNode<T>

  deleteNode(node: LinkedListNode<T>): void

  traverse(): T[]

  size(): number

  search(comparator: (data: T) => boolean): LinkedListNode<T> | null
}

export class LinkedList<T> implements LinkedListInterface<T> {
  private head: LinkedListNode<T> | null = null;

  public insertAtEnd(data: T): LinkedListNode<T> {
    const node = new LinkedListNode(data);
    if (!this.head) {
      this.head = node;
    }
    else {
      const getLast = (node: LinkedListNode<T>): LinkedListNode<T> => (node.next ? getLast(node.next) : node);

      const lastNode = getLast(this.head);
      node.prev = lastNode;
      lastNode.next = node;
    }
    return node;
  }

  public insertInBegin(data: T): LinkedListNode<T> {
    const node = new LinkedListNode(data);
    if (!this.head) {
      this.head = node;
    }
    else {
      this.head.prev = node;
      node.next = this.head;
      this.head = node;
    }
    return node;
  }

  public deleteNode(node: LinkedListNode<T>): void {
    if (!node.prev) {
      this.head = node.next;
    }
    else {
      const prevNode = node.prev;
      prevNode.next = node.next;
    }
  }

  public search(comparator: (data: T) => boolean): LinkedListNode<T> | null {
    const checkNext = (node: LinkedListNode<T>): LinkedListNode<T> | null => {
      if (comparator(node.data))
        return node;
      return node.next ? checkNext(node.next) : null;
    };
    return this.head ? checkNext(this.head) : null;
  }

  public traverse(): T[] {
    const array: T[] = [];

    if (!this.head)
      return array;

    const addToArray = (node: LinkedListNode<T>): T[] => {
      array.push(node.data);
      return node.next ? addToArray(node.next) : array;
    };
    return addToArray(this.head);
  }

  public size(): number {
    return this.traverse().length;
  }
}
