import {
    close_api,
    delay,
    send,
    startService
} from "./utils/utils.js";

async function main() {
    const t = process.env.TOKEN
    const uid = process.env.USERID

    if (!t || !uid) {
        throw new Error("参数错误！请检查")
    }
    const api = startService()
    await delay(2000)

    const today = new Date();
    today.setTime(today.getTime() + 8 * 60 * 60 * 1000)
    const DD = String(today.getDate()).padStart(2, '0'); // 获取日
    const MM = String(today.getMonth() + 1).padStart(2, '0'); //获取月份，1 月为 0
    const yyyy = today.getFullYear(); // 获取年份
    const date = yyyy + '-' + MM + '-' + DD

    const headers = {
        'cookie': 'token=' + t + '; userid=' + uid
    }
    try {
        const res = await send("/login/token", "GET", headers)
        if (res.status == 1) {
            console.log("token刷新成功")
        } else {
            console.log("响应内容")
            console.dir(res, {
                depth: null
            })
            throw new Error("token刷新失败")
        }
        console.log(`开始签到`)
        for (let i = 0; i <= 10; i++) {
            const cr = await send("/youth/vip", "GET", headers)
            if (cr.status === 1 || cr.error_code === 20028) {
                console.log("签到成功")
                break
            }
            console.log("签到失败：" + (cr.error_msg || "未知错误"))
            await delay(10000)
        }
        const vip_details = await send("/user/vip/detail", "GET", headers)
        if (vip_details.status === 1) {
            console.log(`今天是：${date}`)
            console.log(`VIP到期时间：${vip_details.data.busi_vip[0].vip_end_time}`)
        } else {
            console.log("响应内容")
            console.dir(vip_details, {
                depth: null
            })
            throw new Error("获取失败")
        }
    } finally {
        close_api(api)
    }

    if (api.killed) {
        process.exit(0)
    }
}

main()