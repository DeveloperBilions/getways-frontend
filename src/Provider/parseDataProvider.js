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
    console.log("CREATE CALLED");
    try {
      if (resource === "users") {
        const data = (({ username, name, email, password, balance, signedUp, userParentId, userParentName, userReferralCode }) => ({
          username,
          name,
          email,
          password,
          balance,
          signedUp,
          userParentId,
          userParentName,
          userReferralCode
        }))(params.data);
        const user = new Parse.User();
        const result = await user.signUp(data);

        return { data: { id: result.id, ...result.attributes } };
      } else {
        const Resource = Parse.Object.extend(resource);
        const query = new Resource();
        const result = await query.save(params.data);

        return { data: { id: result.id, ...result.attributes } };
      }
    } catch (error) {
      console.log(params);
      throw error;
    }
  },
  getOne: async (resource, params) => {
    //works
    var query = null;
    var result = null;
    try {
      if (resource === 'users') {
        query = new Parse.Query(Parse.User);
        result = await query.get(params.id, { useMasterKey: true });
      }
      else {
        const Resource = Parse.Object.extend(resource);
        query = new Parse.Query(Resource);
        result = await query.get(params.id);
      }
      return { data: { id: result.id, ...result.attributes } };
    }
    catch (error) {
      return error;
    };
  },
  getList: async (resource, params) => {
    //works
    // console.log("GETLIST");
    // console.log(params);
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    var filter  = params.filter;
    var query = new Parse.Query(Parse.Object);
    var count = null;

    Parse.masterKey = Parse.masterKey || process.env.REACT_APP_MASTER_KEY;
    const role = localStorage.getItem("role");
    const userid = localStorage.getItem("id");

    const fetchUsers = async () => {
      // console.log(userid) 
      var usrQuery = new Parse.Query(Parse.User);
      usrQuery.equalTo("userParentId", userid);
      usrQuery.select("objectId");
      var result = await usrQuery.find({ useMasterKey: true });
      var ids = result.map(r => r.id);
      ids.push(userid);
      console.log({ ids: ids })
      return { ids: ids };
    };
    try {
      if (resource === "users") {
        query = new Parse.Query(Parse.User);
        if (role === 'Agent') {
          query.equalTo("userParentId", userid);
        }
        count = await query.count({ useMasterKey: true });
      }
      else if (resource === 'redeemRecords') {
        const Resource = Parse.Object.extend('TransactionRecords');
        query = new Parse.Query(Resource);
        // query.equalTo('type', 'redeem');
        filter = { type: 'redeem', ...filter };
        if (role === 'Player') {
          filter = { userId: userid, ...filter };
          filter && Object.keys(filter).map((f) => query.equalTo(f, filter[f], "i"));
        }
        else if (role === 'Agent') {
          filter && Object.keys(filter).map((f) => query.equalTo(f, filter[f], "i"));
          var { ids } = await fetchUsers();
          query.containedIn("userId", ids);
          count = await query.count();
        }
      }
      else if (resource === 'rechargeRecords') {
        const Resource = Parse.Object.extend('TransactionRecords');
        query = new Parse.Query(Resource);
        // query.equalTo('type', 'recharge');
        filter = { type: 'recharge', ...filter };
        if (role === 'Player') {
          filter = { userId: userid, ...filter };
          filter && Object.keys(filter).map((f) => query.equalTo(f, filter[f], "i"));
        }
        else if (role === 'Agent') {
          filter && Object.keys(filter).map((f) => query.equalTo(f, filter[f], "i"));
          var { ids } = await fetchUsers();
          query.containedIn("userId", ids);
          count = await query.count();
        }
      }
      else {
        const Resource = Parse.Object.extend(resource);
        query = new Parse.Query(Resource);
        filter && Object.keys(filter).map((f) => query.equalTo(f, filter[f], "i"));
        var { ids } = await fetchUsers();
        query.containedIn("userId", ids);
        count = await query.count();
      }

      query.limit(perPage);
      query.skip((page - 1) * perPage);
      if (order === "DESC") query.descending(field);
      else if (order === "ASC") query.ascending(field);

      filter && Object.keys(filter).map((f) => query.equalTo(f, filter[f], "i"));

      const results =
        resource === "users" ? await query.find({ useMasterKey: true }) : await query.find();
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
      results = params.ids.map((id) => (new Parse.Query(Parse.User)).get(id, { useMasterKey: true }));
    } else {
      const Resource = Parse.Object.extend(resource);
      query = new Parse.Query(Resource);
      results = params.ids.map((id) => (new Parse.Query(Resource)).get(id));
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
        data = { data: { id: result.id, ...result.attributes } }
        await result.destroy({ useMasterKey: true });
      }
      else {
        const Resource = Parse.Object.extend(resource);
        query = new Parse.Query(Resource);
        result = await query.get(params.id);
        data = { data: { id: result.id, ...result.attributes } }
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