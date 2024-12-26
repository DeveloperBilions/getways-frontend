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
      const { sessionToken, user } = await Parse.Cloud.run(
        "caseInsensitiveLogin",
        { email, password }
      );
      // Set the current user session using the session token
      const currentUser = await Parse.User.become(sessionToken);

      const roleQuery = new Parse.Query(Parse.Role);
      roleQuery.equalTo("users", user);
      const role = await roleQuery.first({ useMasterKey: true });
      localStorage.setItem("id", user.id);
      localStorage.setItem("name", user.get("name"));
      localStorage.setItem("username", user.get("username"));
      localStorage.setItem("role", role.get("name"));

      return {
        role: role.get("name"),
      };
    } catch (error) {
      throw Error(error.message);
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
      //works
      try {
        await Parse.User.logOut();
        // return Promise.resolve();
      } catch (error) {
        throw Error(error.toString());
      }
      //throw new Error("User not authenticated");
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
      redeemService: user.get("redeemService"),
      userParentName: user.get("userParentName"),
      userParentId: user.get("userParentId"),
      role: role.get("name"),
    };
  },
  async getPermissions() {
    const currentUserData = localStorage.getItem(
      `Parse/${process.env.REACT_APP_APPID}/currentUser`
    );
    const roleName = JSON.parse(currentUserData).roleName;
    return roleName;
  },
};
