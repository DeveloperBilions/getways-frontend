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
    async login (params) {
        console.log("LOGIN");
        const { email, password } = params;
        try {
            const user = await Parse.User.logIn(email, password);

        } catch (error) {
            console.log(error);
            throw Error("Login failed");
            // return Promise.reject();
        }
    },
    async checkError ({ status }) {
        console.log("CHECKERROR");
        if (status === 401 || status === 403) {
            Parse.User.current().then(() =>
                Parse.User.logOut().then(() => {
                    const currentUser = Parse.User.current();
                })
            );
            // return Promise.reject();
            throw new Error("Session Expired");
        }
        // return Promise.resolve();
    },
    async checkAuth () {
        console.log("CHECKAUTH");
        const currentUser = await Parse.User.current()
        if (! currentUser){
            throw new Error('User not authenticated');
        } //? Promise.resolve() : Promise.reject();
    },
    async logout () {
        console.log("LOGOUT");
        //works
        try {
            await Parse.User.logOut();
            // return Promise.resolve();
        } catch (error) {
            throw Error(error.toString());
        }
    },
    async getIdentity () {
        console.log("GETIDENTITY");
        const user = await Parse.User.current();
        const roleQuery = new Parse.Query(Parse.Role);
        roleQuery.equalTo("users", user);
        const role = await roleQuery.first({useMasterKey: true});
        // console.log(role.get("name"));
        localStorage.setItem("id", user.id);
        localStorage.setItem("name", user.get("name"));
        localStorage.setItem("role", role.get("name"));
        return role.get("name");return {id: user.id, fullName: user.get("name"), role: role.get("name")};
    },
    // async getPermissions () {
    //     console.log("GETPERMISSIONS");
    //     const user = await Parse.User.current();
    //     const roleQuery = new Parse.Query(Parse.Role);
    //     roleQuery.equalTo("users", user);
    //     const role = await roleQuery.first({useMasterKey: true});
    //     // console.log(role.get("name"));
    //     return role.get("name");
    // },
    // async canAccess({resource, actions}) {
    //     console.log("CANACCESS")
    //     return false;
    // },
};
