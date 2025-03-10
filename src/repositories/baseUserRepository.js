class BaseUserRepository {
  async create(data) {
    throw new Error('Not implemented');
  }

  async update(id, data) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }

  async findById(id) {
    throw new Error('Not implemented');
  }

  async findByEmail(email) {
    throw new Error('Not implemented');
  }

  async findByResetToken(token) {
    throw new Error('Not implemented');
  }

  async findAll() {
    throw new Error('Not implemented');
  }
}

export default BaseUserRepository;
