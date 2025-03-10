class DBError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DBError';
  }
}

export default DBError;
