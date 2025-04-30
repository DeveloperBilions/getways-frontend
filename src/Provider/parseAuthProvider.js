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
      await Parse.User.become(sessionToken);
      localStorage.setItem("role", user.get("roleName"));
      localStorage.setItem("id", user.id);
      localStorage.setItem("name", user.get("name"));
      localStorage.setItem("username", user.get("username"));
      localStorage.setItem(
        `Parse/${process.env.REACT_APP_APPID}/currentUser`,
        JSON.stringify({ roleName: user.get("roleName") })
      );
      localStorage.setItem(
        `Parse/${process.env.REACT_APP_APPID}/sessionToken`,
        sessionToken
      );
      return {
        role: user.get("roleName"),
      };
    } catch (error) {
      throw Error(error.message);
    }
  },
  async checkError({ status }) {
    if (status === 401 || status === 403) {
      Parse.User.current().then(() =>
        Parse.User.logOut().then(() => {
          Parse.User.current();
        })
      );
      throw new Error("Session Expired");
    }
  },
  async checkAuth() {
    localStorage.getItem("role");
    try{
      let user = Parse.User.current();
      await user.fetch();
    }
    catch (error) {
      if(error?.message === "Invalid session token"){
        await authProvider.logout();
      }
      return null;
    }
    // if (!roleName) {
    //   const error = new Error();
    //   error.redirectTo = "/login";
    //   throw new Error("login.required");
    // }

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
    try {
      let user = Parse.User.current();
      // Restore session if user is null
      if (!user) {
        const sessionToken = localStorage.getItem(
          `Parse/${process.env.REACT_APP_APPID}/sessionToken`
        );
  
        if (sessionToken) {
          try {
            user = await Parse.User.become(sessionToken);
          } catch (err) {
            console.error("Session restoration failed:", err);
          await authProvider.logout(); // Log out if session restoration fails
          throw new Error("Session expired. Please log in again.");
       }
        } else {
          throw new Error("No active session found.");
        }
      }
      // Ensure the user is fully fetched
      user = await user.fetch();
      if (user.get("isDeleted") === true) {
        console.warn("User is marked as deleted. Logging out...");
        await authProvider.logout();
        throw new Error("Your account has been deactivated.");
      }

      let totalPotBalanceOfChildren = 0;
if (user.get("roleName") === "Master-Agent") {
  const pipeline = [
    { $match: { userParentId: user.id, isDeleted: { $ne: true } } },
    {
      $group: {
        _id: null,
        totalPotBalance: { $sum: { $ifNull: ["$potBalance", 0] } },
      },
    },
  ];

  const result = await new Parse.Query(Parse.User)
    .aggregate(pipeline, { useMasterKey: true });

  totalPotBalanceOfChildren = result[0]?.totalPotBalance || 0;
}
      return {
        objectId: user.id,
        email: user.get("email"),
        name: user.get("name"),
        username: user.get("username"),
        redeemService: user.get("redeemService"),
        userParentName: user.get("userParentName"),
        userParentId: user.get("userParentId"),
        role: user.get("roleName"),
        rechargeLimit: user.get("rechargeLimit"),
        isPasswordPermission: user.get("isPasswordPermission"),
        isReedeemZeroAllowed: user.get("isReedeemZeroAllowed"),
        redeemServiceEnabled: user.get("redeemServiceEnabled"),
        isDeleted: user.get("isDeleted"),
        isBlackListed:user.get("isBlackListed"),
        balance:user.get("potBalance"),
        totalPotBalanceOfChildren,
        rechargeDisabled:user.get("rechargeDisabled") || false,
        walletAddr:user.get("walletAddr"),
        allowUserCreation:user.get("allowUserCreation")
      };
    } catch (error) {
      console.error("Error getting user identity:", error?.message);
      if(error?.message === "Invalid session token"){
        await authProvider.logout();
      }
      return null;
    }
  },
  async getPermissions() {
    const currentUserData = localStorage.getItem('role');
    const roleName = currentUserData;
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
