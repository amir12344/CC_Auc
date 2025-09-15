import { User } from "../lib/interfaces/auth";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    userType: "buyer",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    userType: "seller",
  },
];
