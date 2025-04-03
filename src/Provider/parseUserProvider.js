import { Parse } from "parse";

Parse.initialize(
    process.env.REACT_APP_APPID,
    process.env.REACT_APP_JAVASCRIPT_KEY,
    process.env.REACT_APP_MASTER_KEY
);
Parse.serverURL = process.env.REACT_APP_URL;
Parse.masterKey = process.env.REACT_APP_MASTER_KEY;

export const userProvider = {
    getListUsers: async (params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const { filter } = params.filter;

        const query = new Parse.Query(Parse.User);

        const count = await query.count();

        query.limit(perPage);
        query.skip((page - 1) * perPage);
        if (order === "DESC") query.descending(field);
        else if (order === "ASC") query.ascending(field);
        filter && Object.keys(filter).map((f) => query.matches(f, filter[f], "i"));

        try {
            const results = await query.find({ useMasterKey: true });
            return {
                total: count,
                data: results.map((o) => ({ id: o.id, ...o.attributes })),
            };
        } catch (error) {
            return error;
        }
    },
    getOneUser: (params) => { },
    getManyUsers: (params) => { },
    getManyUsersReference: (params) => { },
    createUser: (params) => { },
    updateUser: (params) => { },
    updateManyUser: (params) => { },
    deleteUser: (params) => { },
    deleteManyUsers: (params) => { },
};
