import { UsersRepository } from '../../src/users/usersRepository';

export const mockUserRepository: UsersRepository = {
  async create(user) {},

  async delete(id) {},

  async findByEmail(email) {
    return null;
  },

  async findById(id) {
    return null;
  },

  async update() {},
};
