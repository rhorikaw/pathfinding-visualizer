export class MinHeap {
  constructor(finish = null, heuristic = null) {
    this.heap = [];
    this.length = 0;
    this.finish = finish;
    this.heuristic = heuristic;
  }

  getMin() {
    return this.heap[0];
  }

  getParent(index) {
    var parent = Math.floor((index - 1) / 2);
    if (parent < 0) {
      return -1;
    }
    return parent;
  }

  getLeftChild(index) {
    var leftChild = 2 * index + 1;
    if (leftChild > this.length) {
      return -1;
    }
    return leftChild;
  }

  getRightChild(index) {
    var rightChild = 2 * index + 2;
    if (rightChild > this.length) {
      return -1;
    }
    return rightChild;
  }

  siftUp(index) {
    var parent = this.getParent(index);
    if (parent < 0) {
      return;
    }
    var parentVal, indexVal, temp;
    if (this.heuristic === null) {
      parentVal = this.heap[parent].distance + this.heap[parent].tieBreak;
      indexVal = this.heap[index].distance + this.heap[index].tieBreak;
    } else {
      parentVal = this.heap[parent].heuristicVal + this.heap[parent].tieBreak;
      indexVal = this.heap[index].heuristicVal + this.heap[index].tieBreak;
    }

    if (index > 0 && parentVal === indexVal) {
      if (this.heap[parent].distance > this.heap[index].distance) {
        temp = this.heap[index];
        this.heap[index] = this.heap[parent];
        this.heap[parent] = temp;
        this.siftUp(parent);
      }
    } else if (index > 0 && parentVal > indexVal) {
      temp = this.heap[index];
      this.heap[index] = this.heap[parent];
      this.heap[parent] = temp;
      this.siftUp(parent);
    }
  }

  siftDown(index) {
    var n = this.length;
    var left = this.getLeftChild(index);
    var right = this.getRightChild(index);

    if (left <= 0 || left >= n || right <= 0 || right >= n) {
      return;
    }
    var leftVal, rightVal, indexVal, smallerChild, smallerVal, temp;

    if (this.heuristic === null) {
      leftVal = this.heap[left].distance + this.heap[left].tieBreak;
      rightVal = this.heap[right].distance + this.heap[right].tieBreak;
      indexVal = this.heap[index].distance + this.heap[index].tieBreak;
    } else {
      leftVal = this.heap[left].heuristicVal + this.heap[left].tieBreak;
      rightVal = this.heap[right].heuristicVal + this.heap[right].tieBreak;
      indexVal = this.heap[index].heuristicVal + this.heap[index].tieBreak;
    }
    if (this.heuristic !== null && rightVal === leftVal) {
      if (this.heap[left].distance > this.heap[right].distance) {
        smallerChild = left;
        smallerVal = leftVal;
      } else {
        smallerChild = right;
        smallerVal = rightVal;
      }
    } else if (right < n && rightVal < leftVal) {
      smallerChild = right;
      smallerVal = rightVal;
    } else {
      smallerChild = left;
      smallerVal = leftVal;
    }

    if (smallerChild < n && indexVal === smallerVal) {
      if (this.heap[index].distance < this.heap[smallerChild].distance) {
        temp = this.heap[index];
        this.heap[index] = this.heap[smallerChild];
        this.heap[smallerChild] = temp;
        this.siftDown(smallerChild);
      }
    } else if (smallerChild < n && indexVal > smallerVal) {
      temp = this.heap[index];
      this.heap[index] = this.heap[smallerChild];
      this.heap[smallerChild] = temp;
      this.siftDown(smallerChild);
    }
  }

  insert(element) {
    var last = this.length;
    this.length += 1;
    this.heap.push(element);
    this.siftUp(last);
  }

  deleteNode(index) {
    var last = this.length - 1;
    this.heap[index] = this.heap[last];
    this.heap.splice(last, 1);
    this.length -= 1;
    this.siftUp(index);
    this.siftDown(index);
  }

  extractMin() {
    var min = this.heap[0];
    this.deleteNode(0);
    return min;
  }

  heapify() {
    for (let i = this.length - 1; i >= 0; i--) {
      this.siftDown(i);
    }
  }
}
