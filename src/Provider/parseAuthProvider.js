import Parse from "parse";
Parse.initialize(
    process.env.REACT_APP_APPID,
    process.env.REACT_APP_JAVASCRIPT_KEY,
    process.env.REACT_APP_MASTER_KEY
);
Parse.serverURL = process.env.REACT_APP_URL;
Parse.masterKey = process.env.REACT_APP_MASTER_KEY;

console.log("111", process.env.REACT_APP_APPID);
console.log("222", process.env.REACT_APP_JAVASCRIPT_KEY);
console.log("333", process.env.REACT_APP_MASTER_KEY);

export const authProvider = {
    login: async (params) => {
        //works
        const { email, password } = params;
        try {
            const user = await Parse.User.logIn(email, password);
            return Promise.resolve();
        } catch (error) {
            console.log("===", error);

            // throw Error("Wrong username / password");
            return Promise.reject();
        }
    },
    checkError: async ({ status }) => {
        if (status === 401 || status === 403) {
            Parse.User.current().then(() =>
                Parse.User.logOut().then(() => {
                    const currentUser = Parse.User.current();
                })
            );
            return Promise.reject();
        }
        return Promise.resolve();
    },
    checkAuth: async (params) => {
        return Parse.User.current() ? Promise.resolve() : Promise.reject();
    },
    logout: async () => {
        //works
        try {
            await Parse.User.logOut();
            return Promise.resolve();
        } catch (error) {
            throw Error(error.toString());
        }
    },
    // getIdentity: () => {},
    getPermissions: () => {
        const storedData = localStorage.getItem("Parse/myAppId/currentUser");
        const userObject = JSON.parse(storedData);
        const userRole = userObject.role;
        return Promise.resolve(userRole);
    },
    // getPermissions: () => {Promise.resolve()},
};
