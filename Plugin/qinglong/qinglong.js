const QL_URL = $persistentStore.read("QL_URL");
const CLIENT_ID = $persistentStore.read("CLIENT_ID");
const CLIENT_SECRET = $persistentStore.read("CLIENT_SECRET");

/**
 * 获取青龙token
 */
function getQLToken(callback) {
  $httpClient.get({
    url: `${QL_URL}/open/auth/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json'
    }
  }, (error, response, data) => {
    if (error) {
      console.log(`获取token失败: ${error}`);
      callback(error, null);
    } else {
      const resData = JSON.parse(data);
      if (resData.code === 200) {
        callback(null, resData.data.token);
      } else {
        console.log(`获取token失败: ${resData.message}`);
        callback(resData.message, null);
      }
    }
  });
}

/**
 * 获取青龙环境变量
 * @param {*} searchValue 搜索关键字，默认为'JD_COOKIE'
 * @param {*} callback 回调函数，用于处理获取到的环境变量列表
 */
function getQLEnvs(searchValue = 'JD_COOKIE', callback) {
  getQLToken((err, token) => {
    if (err || !token) {
      console.log('获取token失败');
      callback('获取token失败', null);
      return;
    }
    const headers = {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json;charset=UTF-8',
    };
    $httpClient.get({
      url: `${QL_URL}/open/envs?searchValue=${encodeURIComponent(searchValue)}&t=${+new Date()}`,
      headers: headers,
    }, (error, response, data) => {
      if (error) {
        callback(error, null);
      } else {
        try {
          const resData = JSON.parse(data);
          if (resData.code === 200 && resData.data) {
            callback(null, resData.data);
          } else {
            callback(resData.message, null);
          }
        } catch (parseError) {
          callback(parseError, null);
        }
      }
    });
  });
}

/**
 * 更新青龙环境变量
 * @param {*} ck 需要更新的环境变量，包含name和value
 */
function updateCkEnv(ck = {}) {
  getQLEnvs(ck.name, (envsError, envs) => {
    if (envsError || !envs) {
      console.log('获取环境变量失败');
      return;
    }
    const env = envs.find(env => env.name === ck.name);
    if (!env) {
      console.log(`未找到环境变量: ${ck.name}`);
      return;
    }
    getQLToken((err, token) => {
      if (err || !token) {
        console.log('获取token失败');
        return;
      }
      const headers = {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json;charset=UTF-8',
      };
      const updateData = { id: env.id, value: ck.value, name: ck.name };
      $httpClient.put({
        url: `${QL_URL}/open/envs?t=${+new Date()}`,
        headers: headers,
        body: JSON.stringify(updateData)
      }, (error, response, data) => {
        if (error) {
          console.log('更新失败');
        } else {
          console.log('更新成功');
        }
      });
    });
  });
}

/*
更新环境变量
*/
let elecookie = $persistentStore.read("elecookie");
updateCkEnv({
    name: "elmck",
    value: elecookie,
});
let ddgytoken = $persistentStore.read("ddgytoken");
updateCkEnv({
    name: "ddgyToken",
    value: ddgytoken,
});
let ddlqticket = $persistentStore.read("ddlqticket");
updateCkEnv({
    name: "DD_TOKEN",
    value: ddlqticket,
});
let aliyun_data = $persistentStore.read("aliyun_data");
updateCkEnv({
    name: "aliyun_data",
    value: aliyun_data,
});
let ddgyck = $persistentStore.read("ddgyck");
updateCkEnv({
    name: "ddgyck",
    value: ddgyck,
});
let GD_Val = $persistentStore.read("GD_Val");
updateCkEnv({
    name: "GD_Val",
    value: GD_Val,
});
