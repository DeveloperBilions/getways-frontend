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
      console.log("LOGGED IN");
      // Set the current user session using the session token
      const currentUser = await Parse.User.become(sessionToken);

      const roleQuery = new Parse.Query(Parse.Role);
      roleQuery.equalTo("users", user);
      const role = await roleQuery.first({ useMasterKey: true });
      localStorage.setItem("id", user.id);
      localStorage.setItem("name", user.get("name"));
      localStorage.setItem("username", user.get("username"));
      localStorage.setItem("role", role.get("name"));
      localStorage.setItem(
        `Parse/${process.env.REACT_APP_APPID}/currentUser`,
        JSON.stringify({ roleName: role.get("name") })
      );
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
    const currentUserData = localStorage.getItem(
      `Parse/${process.env.REACT_APP_APPID}/currentUser`
    );
    const roleName = JSON.parse(currentUserData).roleName;
    if (!roleName) {
      const error = new Error();
      error.redirectTo = "/login";
      throw new Error("login.required");
    }

    // const currentUser = Parse.User.current();
    // if (!currentUser) {
    //   //works
    //   try {
    //     await Parse.User.logOut();
    //     // return Promise.resolve();
    //   } catch (error) {
    //     throw Error(error.toString());
    //   }
    //   //throw new Error("User not authenticated");
    // }
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
      rechargeLimit: user.get("rechargeLimit")
    };
  },
  async getPermissions() {
    const currentUserData = localStorage.getItem(
      `Parse/${process.env.REACT_APP_APPID}/currentUser`
    );
    console.log("ewlkewlewew",currentUserData)
    const roleName = JSON.parse(currentUserData).roleName;
    return roleName;
  },
};
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    // Ensure the new password and confirm password match
    if (newPassword !== confirmPassword) {
      throw new Error("New password and confirm password do not match.");
    }

    // Validate password length
    if (newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    // Get the current user
    const currentUser = Parse.User.current();
    if (!currentUser) {
      throw new Error("User not authenticated.");
    }

    // Validate current password using Parse's login function
    const email = currentUser.get("email");
    try {
      await Parse.Cloud.run("caseInsensitiveLogin", { email, password: currentPassword });
    } catch (error) {
      throw new Error("Current password is incorrect.");
    }
    await Parse.User.logOut();
    // Update password
    currentUser.setPassword(newPassword);
    await currentUser.save(null, { useMasterKey: true });
    return "Password changed successfully. Please log in again.";
  } catch (error) {
    throw new Error(error.message);
  }
};
export const updateRechargeLimit = async (userId, newLimit) => {
  try {
    if (newLimit <= 0) {
      throw new Error("Recharge limit must be greater than zero.");
    }

    // Fetch the user by ID
    const userQuery = new Parse.Query(Parse.User);
    const user = await userQuery.get(userId, { useMasterKey: true });

    if (!user) {
      throw new Error("User not found.");
    }

    // Update the recharge limit
    user.set("rechargeLimit", newLimit);
    await user.save(null, { useMasterKey: true });

    return "Recharge limit updated successfully.";
  } catch (error) {
    throw new Error(error.message);
  }
};
