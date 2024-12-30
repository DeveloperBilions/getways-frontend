import { Parse } from "parse";

Parse.initialize(
  process.env.REACT_APP_APPID,
  process.env.REACT_APP_JAVASCRIPT_KEY,
  process.env.REACT_APP_MASTER_KEY
);
Parse.serverURL = process.env.REACT_APP_URL;
Parse.masterKey = process.env.REACT_APP_MASTER_KEY;

export const dataProvider = {
  create: async (resource, params) => {
    // console.log("CREATE CALLED");
    try {
      if (resource === "users") {
        const data = (({
          username,
          name,
          email,
          password,
          balance,
          signedUp,
          userParentId,
          userParentName,
          roleName,
          userReferralCode,
        }) => ({
          username,
          name,
          email,
          password,
          balance,
          signedUp,
          userParentId,
          userParentName,
          roleName,
          userReferralCode,
        }))(params.data);
        const user = new Parse.User();
        const result = await user.signUp(data);

        // Query the Role class to find the desired role
        const query = new Parse.Query(Parse.Role);
        query.equalTo("name", data.roleName);
        const role = await query.first({ useMasterKey: true });

        if (!role) {
          throw new Parse.Error(404, "Role not found");
        }

        // Add the user to the role
        const relation = role.relation("users");
        relation.add(user);
        await role.save(null, { useMasterKey: true });

        return { data: { id: result.id, ...result.attributes } };
      } else {
        const Resource = Parse.Object.extend(resource);
        const query = new Resource();
        const result = await query.save(params.data);

        return { data: { id: result.id, ...result.attributes } };
      }
    } catch (error) {
      // console.log(params);
      throw error;
    }
  },
  getOne: async (resource, params) => {
    //works
    var query = null;
    var result = null;
    try {
      if (resource === "users") {
        query = new Parse.Query(Parse.User);
        result = await query.get(params.id, { useMasterKey: true });
      } else {
        const Resource = Parse.Object.extend(resource);
        query = new Parse.Query(Resource);
        result = await query.get(params.id);
      }
      return { data: { id: result.id, ...result.attributes } };
    } catch (error) {
      return error;
    }
  },
  getList: async (resource, params) => {
    //works
    console.log("GETLIST");
    // console.log("*****", params);
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    var filter = params.filter;
    var q = filter.q;
    delete filter.q;
    console.log("==== =", filter);
    var query = new Parse.Query(Parse.Object);
    var count = null;

    Parse.masterKey = Parse.masterKey || process.env.REACT_APP_MASTER_KEY;
    const role = localStorage.getItem("role");
    const userid = localStorage.getItem("id");
    const username = localStorage.getItem("username");

    const fetchUsers = async (selectedUser) => {
      const user = selectedUser ? selectedUser : await Parse.User.current();
      
      const usrQuery = new Parse.Query(Parse.User);
      usrQuery.equalTo("userParentId", user.id);
      usrQuery.limit(10000);
      usrQuery.select("objectId", "userParentId", "userParentName", "roleName", "userType", "name", "username", "userReferralCode", "email");
      var results = await usrQuery.find({ useMasterKey: true });
      results.push(user);
      console.log(results);
      var ids = results.map((r) => r.id);
      ids.push(user.id);
      const data = results.map((o) => ({ id: o.id, ...o.attributes }));

      return { ids: ids, data: data };
    };
    try {
      if (resource === "users") {
        query = new Parse.Query(Parse.User);
        if (role === "Agent") {
          query.equalTo("userParentId", userid);
        }
        filter &&
          Object.keys(filter).map((f) => {
            if (f === "username") query.matches(f, filter[f], "i");
            else query.equalTo(f, filter[f]);
          });
        count = await query.count({ useMasterKey: true });
      } else if (resource === "redeemRecords") {
        const Resource = Parse.Object.extend("TransactionRecords");
        query = new Parse.Query(Resource);
        filter = { type: "redeem", ...filter };
        if (role === "Player") {
          filter = { userId: userid, ...filter };
          filter &&
            Object.keys(filter).map((f) => {
              if (f === "username") query.matches(f, filter[f], "i");
              else query.equalTo(f, filter[f]);
            });
        } else if (role === "Agent") {
          filter &&
            Object.keys(filter).map((f) => {
              if (f === "username") query.matches(f, filter[f], "i");
              else query.equalTo(f, filter[f]);
            });
          var { ids } = await fetchUsers();
          query.containedIn("userId", ids);
        }
        filter &&
          Object.keys(filter).map((f) => {
            if (f === "username") query.matches(f, filter[f], "i");
            else query.equalTo(f, filter[f]);
          });
        count = await query.count();
      } else if (resource === "rechargeRecords") {
        const Resource = Parse.Object.extend("TransactionRecords");
        query = new Parse.Query(Resource);
        filter = { type: "recharge", ...filter };
        if (role === "Player") {
          filter = { userId: userid, ...filter };
          filter &&
            Object.keys(filter).map((f) => {
              if (f === "username") query.matches(f, filter[f], "i");
              else query.equalTo(f, filter[f]);
            });
        } else if (role === "Agent") {
          filter &&
            Object.keys(filter).map((f) => {
              if (f === "username") query.matches(f, filter[f], "i");
              else query.equalTo(f, filter[f]);
            });
          var { ids } = await fetchUsers();
          query.containedIn("userId", ids);
        }

        filter &&
          Object.keys(filter).map((f) => {
            if (f === "username") query.matches(f, filter[f], "i");
            else query.equalTo(f, filter[f]);
          });
        count = await query.count();

      } else if (resource === "summary") {
        var result = null;
        console.log("Summary");
        if (role === "Super-User") {
          //users
          console.log("SU", filter);

          if (filter?.username) {
            // console.log("IN IF");
            var userQuery = new Parse.Query(Parse.User);
            var selectedUser = await userQuery.get(filter.username, {
              useMasterKey: true,
            });
            var { ids, data } = await fetchUsers(selectedUser);

            const transactionQuery = new Parse.Query("TransactionRecords");
            transactionQuery.select(
              "userId",
              "status",
              "transactionAmount",
              "type"
            );
            transactionQuery.containedIn("userId", ids);
            filter.startdate && transactionQuery.greaterThanOrEqualTo("transactionDate", new Date(filter.startdate + " 00:00:00"));
            filter.enddate && transactionQuery.lessThanOrEqualTo("transactionDate", new Date(filter.enddate + " 23:59:59"))
            transactionQuery.limit(10000);
            var results = await transactionQuery.find();
          } 
          else {
            var userQuery = new Parse.Query(Parse.User);
            userQuery.limit(10000);
            var results = await userQuery.find({ useMasterKey: true });
            var data = results.map((o) => ({ id: o.id, ...o.attributes }));
            const currentUser = await Parse.User.current();
            data.push({ id: userid, ...currentUser.attributes });

            //transaction
            const transactionQuery = new Parse.Query("TransactionRecords");
            transactionQuery.select(
              "userId",
              "status",
              "transactionAmount",
              "type"
            );
            filter.startdate && transactionQuery.greaterThanOrEqualTo("transactionDate", new Date(filter.startdate + " 00:00:00"));
            filter.enddate && transactionQuery.lessThanOrEqualTo("transactionDate", new Date(filter.enddate + " 23:59:59"))
            transactionQuery.limit(10000);
            var results = await transactionQuery.find();
          }
          result = {
            data: [
              {
                id: 0,
                users: data,
                transactions: results.map((o) => ({
                  id: o.id,
                  ...o.attributes,
                })),
              },
            ],
            total: null,
          };
          console.log(
            "count ",
            result.data[0].users.length,
            result.data[0].transactions.length
          );
        }
        if (role === "Agent") {
          console.log("Agent");
          //users
          const selectedUser =
            filter && filter.username
              ? await new Parse.Query(Parse.User).get(filter.username, {
                  useMasterKey: true,
                })
              : null;
          console.log("selected user:", selectedUser);
          const { ids, data } = await fetchUsers(selectedUser);
          // const filteredData = filter?data.filter(obj => obj.id===filter.username):data;
          console.log("fetchUsers", data);
          //transactions
          const transactionQuery = new Parse.Query("TransactionRecords");
          transactionQuery.select(
            "userId",
            "status",
            "transactionAmount",
            "type"
          );
          transactionQuery.containedIn("userId", ids);
          filter.startdate && transactionQuery.greaterThanOrEqualTo("transactionDate", new Date(filter.startdate + " 00:00:00"));
          filter.enddate && transactionQuery.lessThanOrEqualTo("transactionDate", new Date(filter.enddate + " 23:59:59"))
          /*filter && Object.keys(filter).map((f) => {
              if(f === "username") transactionQuery.equalTo("objectId", filter[f], "i"); 
              else transactionQuery.equalTo(f, filter[f]);
          });*/
          results = await transactionQuery.find();

          result = {
            data: [
              {
                id: 0,
                users: data,
                transactions: results.map((o) => ({
                  id: o.id,
                  ...o.attributes,
                })),
              },
            ],
            total: null,
          };
          console.log("Summary List ", result);
        }
        return result;
      } else if (resource === "playerDashboard") {
        const Resource = Parse.Object.extend("TransactionRecords");
        query = new Parse.Query(Resource);
        filter = { username: username };

        filter &&
          Object.keys(filter).map((f) => {
            if (f === "username") query.matches(f, filter[f], "i");
            else query.equalTo(f, filter[f]);
          });

        const response = await query.find();
        const res = {
          data: response.map((o) => ({ id: o.id, ...o.attributes })),
          total: count,
        };
        return res;
      } else if (resource === "rechargeRecordsExport") {
        const Resource = Parse.Object.extend("TransactionRecords");
        query = new Parse.Query(Resource);
        filter = { type: "recharge", ...filter };
        if (role === "Player") {
          filter = { userId: userid, ...filter };
        } else if (role === "Agent") {
          var { ids } = await fetchUsers();
          query.containedIn("userId", ids);
        }

        query.descending(field);

        filter &&
          Object.keys(filter).map((f) => {
            if (f === "username") query.matches(f, filter[f], "i");
            else query.equalTo(f, filter[f]);
          });

        const response = await query.find();
        const res = {
          data: response.map((o) => ({ id: o.id, ...o.attributes })),
          total: count,
        };

        return res;
      } else if (resource === "redeemRecordsExport") {
        const Resource = Parse.Object.extend("TransactionRecords");
        query = new Parse.Query(Resource);
        filter = { type: "redeem", ...filter };
        if (role === "Player") {
          filter = { userId: userid, ...filter };
        } else if (role === "Agent") {
          var { ids } = await fetchUsers();
          query.containedIn("userId", ids);
        }

        query.descending(field);

        filter &&
          Object.keys(filter).map((f) => {
            if (f === "username") query.matches(f, filter[f], "i");
            else query.equalTo(f, filter[f]);
          });

        const response = await query.find();
        const res = {
          data: response.map((o) => ({ id: o.id, ...o.attributes })),
          total: count,
        };
        return res;
      } else {
        const Resource = Parse.Object.extend(resource);
        query = new Parse.Query(Resource);
        filter &&
          Object.keys(filter).map((f) => query.equalTo(f, filter[f], "i"));
        var { ids } = await fetchUsers();
        query.containedIn("userId", ids);
        count = await query.count();
      }

      query.limit(perPage);
      query.skip((page - 1) * perPage);
      if (order === "DESC") query.descending(field);
      else if (order === "ASC") query.ascending(field);

      filter &&
        Object.keys(filter).map((f) => {
          if (f === "username") query.matches(f, filter[f], "i");
          else query.equalTo(f, filter[f]);
        });

      results =
        resource === "users"
          ? await query.find({ useMasterKey: true })
          : await query.find();
      const res = {
        data: results.map((o) => ({ id: o.id, ...o.attributes })),
        // data: [],
        total: count,
      };
      return res;
    } catch (error) {
      throw error;
    }
  },
  getMany: async (resource, params) => {
    var query = null;
    var results = null;
    if (resource === "users") {
      results = params.ids.map((id) =>
        new Parse.Query(Parse.User).get(id, { useMasterKey: true })
      );
    } else {
      const Resource = Parse.Object.extend(resource);
      query = new Parse.Query(Resource);
      results = params.ids.map((id) => new Parse.Query(Resource).get(id));
    }
    try {
      const data = await Promise.all(results);
      return {
        // total: data.length,
        data: data.map((o) => ({ id: o.id, ...o.attributes })),
      };
    } catch (error) {
      return error;
    }
  },
  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;

    const Resource = Parse.Object.extend(resource);
    var query = null;

    if (resource === "users") {
      query = new Parse.Query(Parse.User);
    } else {
      const Resource = Parse.Object.extend(resource);
      query = new Parse.Query(Resource);
    }

    query.equalTo(params.target, params.id);
    const count = await query.count();
    if (perPage) query.limit(perPage);
    if (page) query.skip((page - 1) * perPage);
    if (order === "DESC") query.descending(field);
    else if (order === "ASC") query.ascending(field);

    try {
      const results = await query.find();
      return {
        total: count,
        data: results.map((o) => ({ id: o.id, ...o.attributes })),
      };
    } catch (error) {
      return error;
    }
  },
  update: async (resource, params) => {
    //works
    var query = null;
    var obj = null;
    var r = null;
    const keys = Object.keys(params.data).filter((o) =>
      o === "id" || o === "createdAt" || o === "updatedAt" ? false : true
    );
    const data = keys.reduce((r, f, i) => {
      r[f] = params.data[f];
      return r;
    }, {});
    try {
      if (resource === "users") {
        query = new Parse.Query(Parse.User);
        obj = await query.get(params.id, { useMasterKey: true });
        r = await obj.save(data, { useMasterKey: true });
      } else {
        const Resource = Parse.Object.extend(resource);
        query = new Parse.Query(resource);
        obj = await query.get(params.id);
        r = await obj.save(data);
      }
      return { data: { id: r.id, ...r.attributes } };
    } catch (error) {
      throw Error(error.toString());
    }
  },
  updateMany: async (resource, params) => {
    //need to filter out id, createdAt, updatedAt

    const Resource = Parse.Object.extend(resource);
    try {
      const qs = await Promise.all(
        params.ids.map((id) => new Parse.Query(Resource).get(id))
      );
      qs.map((q) => q.save(params.data));
      return { data: params.ids };
    } catch {
      throw Error("Failed to update all");
    }
  },
  delete: async (resource, params) => {
    var query = null;
    var result = null;
    var data = null;
    try {
      if (resource === "users") {
        query = new Parse.Query(Parse.User);
        result = await query.get(params.id, { useMasterKey: true });
        data = { data: { id: result.id, ...result.attributes } };
        await result.destroy({ useMasterKey: true });
      } else {
        const Resource = Parse.Object.extend(resource);
        query = new Parse.Query(Resource);
        result = await query.get(params.id);
        data = { data: { id: result.id, ...result.attributes } };
        await result.destroy();
      }
      return data;
    } catch (error) {
      throw Error("Unable to delete");
    }
  },
  deleteMany: async (resource, params) => {
    const Resource = Parse.Object.extend(resource);
    try {
      const qs = await Promise.all(
        params.ids.map((id) => new Parse.Query(Resource).get(id))
      );
      await Promise.all(qs.map((obj) => obj.destroy()));
      return { data: params.ids };
    } catch (error) {
      throw Error("Unable to delete all");
    }
  },
};
