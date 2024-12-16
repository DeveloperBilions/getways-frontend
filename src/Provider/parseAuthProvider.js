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
    console.log("LOGIN CALLED");
    Parse.masterKey = process.env.REACT_APP_MASTER_KEY;
    const { email, password } = params;
    try {
      console.log("User logging in");
      //const user = await Parse.User.logIn(email, password);
      const { sessionToken, user } = await Parse.Cloud.run("caseInsensitiveLogin", { email, password });
      // Set the current user session using the session token
      const currentUser = await Parse.User.become(sessionToken);

      //console.log("User logged in successfully:", currentUser);
      const roleQuery = new Parse.Query(Parse.Role);
      roleQuery.equalTo("users", user);
      const role = await roleQuery.first({ useMasterKey: true });
      localStorage.setItem("id", user.id);
      localStorage.setItem("name", user.get("name"));
      localStorage.setItem("role", role.get("name"));
    } catch (error) {
      //console.log(error);
      throw Error(error.message);
    }
  },
  async checkError({ status }) {
    console.log("CHECKERROR CALLED");
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
    console.log("CHECKAUTH CALLED");
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
    console.log("LOGOUT CALLED");
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
    console.log("GETIDENTITY CALLED");
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
      role: role.get("name"),
    };
  },
  async getPermissions() {
    console.log("GETPERMISSIONS CALLED");
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    sleep(10000).then(() => { console.log('GETPERMISSIONS called'); });
    const user = Parse.User.current();
    const roleQuery = new Parse.Query(Parse.Role);
    roleQuery.equalTo("users", user);
    const role = await roleQuery.first({ useMasterKey: true });
    return role?role.get("name"):null;
  },
};
