class BaseFeed {
  async fetch() {
    throw new Error("fetch() not implemented");
  }

  normalize(data) {
    throw new Error("normalize() not implemented");
  }
}

export default BaseFeed;