import {
  quicktype,
  InputData,
  JSONSchemaInput,
  FetchingJSONSchemaStore,
} from 'quicktype-core';

async function quicktypeJSONSchema(typeName, jsonSchemaString) {
  const schemaInput = new JSONSchemaInput(new FetchingJSONSchemaStore());

  // We could add multiple schemas for multiple types,
  // but here we're just making one type from JSON schema.
  await schemaInput.addSource({
    name: typeName,
    schema: jsonSchemaString
  });

  const inputData = new InputData();
  inputData.addInput(schemaInput);

  return await quicktype({
    inputData,
    lang: 'typescript',
    rendererOptions: {
      'just-types': 'true'
    }
  });
}

function getRightSchema(resBody) {
  const jsonSchema = JSON.parse(resBody);
  const dataSchema = ((jsonSchema || {}).properties || {}).data;
  // 如果同时有names和reportdata则认为jsonschema错误，人工处理
  if (dataSchema && ['names', 'reportdata'].every((e) => ((dataSchema || {}).required || []).includes((e)))) {
    jsonSchema.properties.data.properties.names = {
      items: {
        type: 'array',
        properties: {
          key: {
            type: 'string'
          },
          name: {
            type: 'string'
          },
          show: {
            type: 'boolean'
          },
        },
        required: ['key', 'name', 'show'],
        type: 'object'
      },
      type: 'array'
    };
  }
  return JSON.stringify(jsonSchema);
}

function getInterface(name, res, dataKey, sessionKey) {
  sessionStorage.removeItem(sessionKey);
  const bodyData = JSON.parse(res).data[dataKey];
  const isReq = sessionKey.includes('req');

  // Todo: req 如果没读到数据，继续读取req_query字段

  const jsonSchema = sessionKey.includes('req') ? bodyData : getRightSchema(bodyData);
  quicktypeJSONSchema(name, jsonSchema).then(({
    lines
  }) => {
    const rs = JSON.stringify(lines.join('\n'));
    sessionStorage[sessionKey] = rs;
  });
}

export default class CustomXhr {
  constructor() {
    if (CustomXhr.instance) {
      return CustomXhr.instance;
    }

    this.XHR = window.XMLHttpRequest;

    this.hooks = {
      onreadystatechange: function () {
        if (this.status == 200 && this.readyState === 4 && location.origin === 'yourURL') {
          const REG = /youURL/g;
          if (REG.test(this.responseURL)) {
            const res = JSON.parse(this.responseText);
            const reg = /[^\/][a-zA-Z|\d]*$/g;
            let name = (res.data.path.match(reg) || [])[0];
            console.log(name);
            name = name.replace(name[0], name[0].toUpperCase());
            getInterface(name ? `${name}Res` : 'Res', this.responseText, 'res_body', 'yapi2ts-res');
            getInterface(name ? `${name}Req` : 'Req', this.responseText, 'req_body_other', 'yapi2ts-req');
          }
        }
      }
    };
    this.init();

    CustomXhr.instance = this;
  }

  init() {
    const _this = this;

    window.XMLHttpRequest = function () {
      this._xhr = new _this.XHR();

      _this.overwrite(this);
    }

  }


  /**
   * 覆盖原本的xhr
   * @param {*} xhr 
   */
  overwrite(proxyXHR) {
    for (let key in proxyXHR._xhr) {

      if (typeof proxyXHR._xhr[key] === 'function') {
        this.overwriteMethod(key, proxyXHR);
        continue;
      }

      this.overwriteAttributes(key, proxyXHR);
    }
  }

  overwriteMethod(key, proxyXHR) {

    proxyXHR[key] = (...args) => {
      // 拦截
      if (this.hooks[key] && (this.hooks[key].call(proxyXHR, args) === false)) {
        return;
      }
      const res = proxyXHR._xhr[key].apply(proxyXHR._xhr, args);

      return res;
    };
  }

  overwriteAttributes(key, proxyXHR) {
    Object.defineProperty(proxyXHR, key, this.setProperyDescriptor(key, proxyXHR));
  }

  setProperyDescriptor(key, proxyXHR) {
    let obj = Object.create(null);
    let _this = this;

    obj.set = function (val) {

      if (_this.hooks[key]) {

        this._xhr[key] = function (...args) {
          (_this.hooks[key].call(proxyXHR), val.apply(proxyXHR, args));
        }

        return;
      }

      this._xhr[key] = val;
    }

    obj.get = function () {
      return proxyXHR['__' + key] || this._xhr[key];
    }

    return obj;
  }

  unset() {
    window.XMLHttpRequest = this.XHR;
  }

  reset() {
    CustomXhr.instance = null;
    CustomXhr.instance = new CustomXhr(this.hooks, this.execedHooks);
  }
}