import Parse from "parse";
Parse.initialize(
    process.env.REACT_APP_APPID,
    process.env.REACT_APP_JAVASCRIPT_KEY,
    process.env.REACT_APP_MASTER_KEY
);
Parse.serverURL = process.env.REACT_APP_URL;
Parse.masterKey = process.env.REACT_APP_MASTER_KEY;



export const authProvider = {
    login: async (params) => {
        //works
        const { email, password } = params;
        try {
            const user = await Parse.User.logIn(email, password);

            // Query roles for the logged-in user
            const query = new Parse.Query(Parse.Role);
            query.equalTo("users", user);
            const roles = await query.find();

            // Extract role names
            const roleNames = roles.map(role => role.get("name"));

            // Combine user data with roles
            const userData = {
                ...user.toJSON(),
                role: roleNames[0]
            };

            // Save to localStorage
            localStorage.setItem("Parse/novaApp/currentUser", JSON.stringify(userData));
            console.log("User roles stored in localStorage:", userData);

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
        const storedData = localStorage.getItem("Parse/novaApp/currentUser");
        if (!storedData) {
            console.log("No user found in localStorage.");
            return Promise.reject();
        }
        const userObject = JSON.parse(storedData);
        const userRole = userObject.role;
        console.log("Fetched user role from localStorage:", userRole)
        return Promise.resolve(userRole);
    },
    // getPermissions: () => {Promise.resolve()},

    getIdentity: async () => {
        const rawData = localStorage.getItem('Parse/novaApp/currentUser');
        if (!rawData) {
            return Promise.reject();
        }

        const user = JSON.parse(rawData);

        return Promise.resolve({
            objectId: user.objectId,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role
        });
    },

    canAccess: async ({ resource, action }) => {
        const storedData = localStorage.getItem("Parse/novaApp/currentUser");
        if (!storedData) {
            return Promise.reject("No user found");
        }
        const user = JSON.parse(storedData);
        const role = user.role;
        console.log("111", role);




        return Promise.reject("Role not found");
    },
};
