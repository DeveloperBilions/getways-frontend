import Parse from "parse";
// const Parse = require('parse/node');
Parse.initialize(
  process.env.REACT_APP_APPID,
  process.env.REACT_APP_JAVASCRIPT_KEY,
  process.env.REACT_APP_MASTER_KEY
);
Parse.serverURL = process.env.REACT_APP_URL;
Parse.masterKey = process.env.REACT_APP_MASTER_KEY;

export const authProvider = {
  async login(params) {
    Parse.masterKey = process.env.REACT_APP_MASTER_KEY;
    const { email, password } = params;
    try {
      const user = await Parse.User.logIn(email, password);
      const roleQuery = new Parse.Query(Parse.Role);
      roleQuery.equalTo("users", user);
      const role = await roleQuery.first({ useMasterKey: true });
      localStorage.setItem("id", user.id);
      localStorage.setItem("name", user.get("name"));
      localStorage.setItem("role", role.get("name"));
    } catch (error) {
      throw Error("Login failed");
    }
  },
  async checkError({ status }) {
    if (status === 401 || status === 403) {
      Parse.User.current().then(() =>
        Parse.User.logOut().then(() => {
          const currentUser = Parse.User.current();
        })
      );
      throw new Error("Session Expired");
    }
  },
  async checkAuth() {
    const currentUser = Parse.User.current();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
  },
  async logout() {
    localStorage.removeItem("id");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    //works
    try {
      await Parse.User.logOut();
      // return Promise.resolve();
    } catch (error) {
      throw Error(error.toString());
    }
  },
  async getIdentity() {
    const user = Parse.User.current();
    const roleQuery = new Parse.Query(Parse.Role);
    roleQuery.equalTo("users", user);
    const role = await roleQuery.first({ useMasterKey: true });
    return {
      objectId: user.id,
      email: user.get("email"),
      name: user.get("name"),
      username: user.get("username"),
      role: role.get("name"),
    };
  },
  async getPermissions() {
    const user = Parse.User.current();
    const roleQuery = new Parse.Query(Parse.Role);
    roleQuery.equalTo("users", user);
    const role = await roleQuery.first({ useMasterKey: true });
    return role?role.get("name"):"";
  },
};
