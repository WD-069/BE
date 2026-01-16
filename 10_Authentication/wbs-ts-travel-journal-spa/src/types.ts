declare global {
  type Post = {
    _id: string;
    title: string;
    image: string;
    content: string;
  };

  type User = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
