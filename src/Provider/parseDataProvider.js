import { Parse } from "parse";
// import { parseConfig } from "../parseConfig";
// const Parse = require('parse/node');

Parse.initialize(
  process.env.REACT_APP_APPID,
  process.env.REACT_APP_JAVASCRIPT_KEY,
  process.env.REACT_APP_MASTER_KEY
);
Parse.serverURL = process.env.REACT_APP_URL;
Parse.masterKey = process.env.REACT_APP_MASTER_KEY;


// Parse.initialize(parseConfig.APP_ID, null, parseConfig.MASTER_KEY);
// // Parse.initialize(parseConfig.APP_ID);
// Parse.masterKey = parseConfig.MASTER_KEY;
// Parse.serverURL = parseConfig.URL;

export const dataProvider = {
  // ...userProvider,
  create: async (resource, params) => {
    try {
      if (resource === "users") {
        const data = (({ username, name, email, password, balance }) => ({
          username,
          name,
          email,
          password,
          balance,
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
      return error;
    }
  },
  getOne: async (resource, params) => { //works
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
      console.log("GETONE CALLED");
      console.log(params);
      console.log(result, result.attributes);
      return { data: { id: result.id, ...result.attributes } };
    }
    catch (error) {
      return error;
    };
  },
  getList: async (resource, params) => {
    //works
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    var { filter } = params.filter;

    var query = null;
    var count = null;
    Parse.masterKey = Parse.masterKey || process.env.REACT_APP_MASTER_KEY;

    try {
      if (resource === "users") {
        const role = localStorage.getItem("role");
        const userid = localStorage.getItem("id");
        query = new Parse.Query(Parse.User);
        role === 'Agent'?query.equalTo("userParentId", userid):null;
        count = await query.count({ useMasterKey: true });
        // console.log(count);
      } 
      else if (resource === 'redeemRecords'){
        const Resource = Parse.Object.extend('TransactionRecords');
        query = new Parse.Query(Resource);
        query.equalTo('type', 'redeem');
        count = await query.count();
        filter = {type: 'redeem', ...filter};
      }
      else if (resource === 'rechargeRecords'){
        const Resource = Parse.Object.extend('TransactionRecords');
        query = new Parse.Query(Resource);
        query.equalTo('type', 'recharge');
        count = await query.count();
        filter = {type: 'recharge', ...filter};
      }
      else {
        const Resource = Parse.Object.extend(resource);
        query = new Parse.Query(Resource);
        count = await query.count();
      }

      query.limit(perPage);
      query.skip((page - 1) * perPage);
      if (order === "DESC") query.descending(field);
      else if (order === "ASC") query.ascending(field);

      filter && Object.keys(filter).map((f) => query.equalTo(f, filter[f], "i"));

      const results =
        resource === "users"? await query.find({ useMasterKey: true }): await query.find();
      const res = {
        data: results.map((o) => ({ id: o.id, ...o.attributes })),
        total: count,
      };
      return res;
    } catch (error) {
      console.log(error);
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
    console.log(order);

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
        obj = await query.get(params.id, {useMasterKey: true});
        r = await obj.save(data, {useMasterKey: true});
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
    console.log("DELETE CALLED")
    console.log(params);
    try{
        if (resource==="users"){
            query = new Parse.Query(Parse.User);
            result = await query.get(params.id, {useMasterKey: true});
            data = {data: {id: result.id, ...result.attributes}}
            await result.destroy({useMasterKey: true});
        }
        else {
            const Resource = Parse.Object.extend(resource);
            query = new Parse.Query(Resource);
            result = await query.get(params.id);
            data = {data: {id: result.id, ...result.attributes}}
            await result.destroy();
        }
        return data;            
    } catch(error) {
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

