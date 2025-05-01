import { User } from '../../src/users/userEntity';
import { UsersRepository } from '../../src/users/usersRepository';

export const createMockUserRepo = (users: User[]): UsersRepository => {
  const list = [...users];

  return {
    create: async (user: User) => {
      list.push(user);
    },
    delete: async (id: string) => {
      const index = list.findIndex((user) => user.id === id);
      if (index !== -1) {
        list.splice(index, 1);
      }
    },
    findByEmail: async (email: string) => {
      return list.find((user) => user.email === email) || null;
    },
    findById: async (id: string) => {
      return list.find((user) => user.id === id) || null;
    },
    update: async (user: User) => {
      const index = list.findIndex((u) => u.id === user.id);
      if (index !== -1) {
        list[index] = { ...list[index], ...user };
      }
    },
  };
};
