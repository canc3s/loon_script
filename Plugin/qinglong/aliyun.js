/*

阿里云盘获取refresh_token脚本
重写地址:^https:\/\/(auth|aliyundrive)\.alipan\.com\/v2\/account\/token
触发类型:$request-body
打开APP
MITM添加:auth.alipan.com,auth.aliyundrive.com

*/

userCookie = $persistentStore.read("aliyun_data");

async function getRespBody(refresh_token) {
    //获取用户名作为标识键
    const options = {
        url: `https://auth.aliyundrive.com/v2/account/token`,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            refresh_token: refresh_token,
            grant_type: 'refresh_token'
        })
    };
    return new Promise(resolve => {
        $httpClient.post(options, async (error, response, data) => {
            try {
                let result = JSON.parse(data);
                resolve(result);
            } catch (error) {
                console.log(error);
                resolve();
            }
        });
    });
}


!(async () => {
    if ($request.method != 'OPTIONS') {
        const body = JSON.parse($request.body);
        let refresh_token = body.refresh_token;
        //不存在token时
        if (!refresh_token) {
            return console.log("❌获取token失败！请稍后再试～")
        }
        //获取响应体
        let { nick_name, avatar, device_id } = await getRespBody(refresh_token) ?? {};
        //是否存在多账号数据
        if ((Array.isArray(userCookie)) && userCookie.length == 0) {
            userCookie.push({ "name": nick_name, "refresh_token": refresh_token, "device_id": device_id });
            $persistentStore.write(userCookie, ckName);
            console.log(`🎉${nick_name}获取token成功!`);
        } else {
            userCookie = eval('(' + userCookie + ')');
            let index = userCookie.findIndex(e => (e.name == nick_name && e.device_id == device_id));
            if (userCookie[index]) {
                userCookie[index].refresh_token = refresh_token;
                $persistentStore.write(userCookie, ckName);
                console.log(`🎉${nick_name}更新token成功!`);
            } else {
                userCookie.push({ "name": nick_name, "refresh_token": refresh_token, "device_id": device_id });
                $persistentStore.write(userCookie, ckName);
                console.log(`🎉${nick_name}获取token成功!`);
            }
        }
    }
})().catch((e) => {
    console.log(`❌失败! 原因: ${e}!`);
}).finally(() => {
    $done({});
})