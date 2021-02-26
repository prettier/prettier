class Point {
  #x = 1;
  #y = 2;
  static isPoint(obj) {
    return #x in obj && #y in obj;
  }
}
