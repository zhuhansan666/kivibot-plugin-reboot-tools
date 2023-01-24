const about_string = `〓 关于systool 〓
本插件由"爱喝牛奶の涛哥"制作, 使用commonjs标准
本插件完全免费, bug反馈可发送邮件至public.zhuhansan666@outlook.com 备注 systool:bug
本插件采用GNU3.0协议, 请自觉遵循

〓 源码 〓
Github: https://github.com/zhuhansan666/kivibot-plugin-systool
Gitee: https://gitee.com/zhu-hansan/kivibot-plugin-systool

〓 联系我 〓
爱喝牛奶の涛哥@Bilibili: https://space.bilibili.com/687039517
爱喝牛奶の涛哥@Github: https://github.com/zhuhansan666
爱喝牛奶の涛哥@Gitee: https://gitee.com/zhu-hansan
爱喝牛奶の涛哥@outlook: public.zhuhansan666@outlook.com

感谢您对本插件的支持, 有什么建议和bug可以在Github提出或发送邮件并备注(备注内容详见README文件)
`

const first_time = `〓 systool警告 〓
由于本插件会对系统进行操作(开关机), 使用前请仔细阅读README_md帮助文档, 获取Github链接请输入"/关于" 或 "/sys" 或 "/systool"
否则任何因使用不当造成的后果本人概不负责
\t\t\t\t\t\t\t\t\t\t\t\t开发者: 爱喝牛奶の涛哥 20230109
*该信息将在下次启动pupbot框架时不再提示`

// const Math = require("node:Math")
const process = require("node:process")
const os = require("node:os")
const exec = require('child_process').exec;
const { PupPlugin, http } = require('@pupbot/core')
const iconv = require('iconv-lite');
const encoding = 'cp936';
const binaryEncoding = 'binary';

const config = {
    "start-time": true,
    "latest-start-time": undefined,
    "latest-exit-time": undefined,
    "commands": {
        "cmd": ["/cmd", "/c"],
        "reboot": ["/reboot", "/r"],
        "alias": ["/alias", "/a", "/unalias", "/ua"],
        "ip": ["/ip"],
        "about": ["/关于", "/sys", "/systool"]
    }
}

const defaultConfig = JSON.parse(JSON.stringify(config)) //  deepCopy, 避免config读取复写影响defaultConfig

const { version } = require('./package.json')
    // const { url } = require("node:inspector")
const plugin = new PupPlugin('systool', version)

const npmRoot = "https://registry.npmjs.org/"
    // var isLatestVersion = true;
    // var latestCheckUpdateTime = -1;
var latestVersion = "0.0.0"
var checkVersionEnable = true

// function getRndInteger(min, max) {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

function sleep(ms) {
    const start = new Date().getTime()
    while (true) {
        if (new Date().getTime() - start > ms) {
            return
        }
    }
}

async function reloadConfig() {
    plugin.saveConfig(Object.assign(config, plugin.loadConfig()))
    if (config["start-time"] != false && config["start-time"] != true) {
        config["start-time"] = true
        plugin.saveConfig(config)
    }
    config["latest-start-time"] = new Date().getTime()
    for (let key of Object.keys(defaultConfig["commands"])) {
        if (config["commands"][key] == undefined) {
            config["commands"][key] = defaultConfig["commands"][key]
        }
    }
    plugin.saveConfig(config)
}

function isAdmin(event, mainOnly = false) {
    if (mainOnly) {
        return plugin.admins[0] === event.sender.user_id;
    } else {
        return plugin.admins.includes(event.sender.user_id);
    }
}

async function hooker(event, params, plugin, func) {
    /**
     * 本函数用于hook错误, 在发生错误时发送错误信息到qq
     */
    // config["using-count"][new Date().getHours()] += 1 // 使用计数
    checkStartAtFirstTime(event, plugin)
    try {
        func(event, params, plugin)
    } catch (error) {
        try {
            var funcname = func.name
        } catch (err) {
            var funcname = undefined
        }
        const msg = `〓 糟糕！systool运行"${funcname}"发生错误, 请您坐和放宽, 下面是详细错误信息(好东西就要莱纳~) 〓\n${error.stack}\n(如有需要请发送邮件至开发者 public.zhuhansan666@outlook.com 备注 systool:bug)`
        event.reply(msg)
    }
}

function reboot(event, params, plugin) {
    // 是否是主管理员
    const isMainAdmin = isAdmin(event, true);

    secondCmd = params[0]
    if (secondCmd == "help") {
        event.reply(`〓 systool./reboot 帮助 〓\n/reboot sys/system  ->  重启系统\n/reboot bot/pup  ->  重启框架(注意：受框架回调策略影响, 执行此命令不会受到机器人回复)`)
    } else {
        if (isMainAdmin) {
            if (secondCmd == "sys" || secondCmd == "system") {
                if (os.type() == "Linux" || os.type() == "Darwin") {
                    event.reply(`〓 开始运行 "reboot" 〓`)
                    const startTime = new Date().getTime()
                    exec("reboot", function(error, stdout, stderr) {
                                event.reply(`〓 运行 "reboot" 〓\n${stdout.length > 0 ? `指令输出: ${stdout}` : ""} ${stderr.length > 0 ? `指令输出: ${stderr}` : ""}共耗时${(new Date().getTime() - startTime) / 1000}秒`)
                    });
                } else {
                    event.reply(`〓 开始运行 "shutdown /f /r /t 3" 〓`)
                    const startTime = new Date().getTime()
                    exec("shutdown /f /r /t 3", function(error, stdout, stderr) {
                        event.reply(`〓 运行 "shutdown /f /r /t 3" 〓\n${stdout.length > 0 ? `指令输出: ${stdout}` : ""} ${stderr.length > 0 ? `指令输出: ${stderr}` : ""}共耗时${(new Date().getTime() - startTime) / 1000}秒`)
                    });
                }
            } else {
                if (secondCmd == "bot" || secondCmd == "pup") {
                    // event.reply(`暂不支持`)
                    event.reply(`〓 开始运行 "pup stop && pup deploy" 〓`)
                    async function _tmp () {                        
                        // sleep(3000)
                        const startTime = new Date().getTime()
                        exec("pup stop && pup deploy", function(error, stdout, stderr) {
                            event.reply(`〓 运行 "pup stop && pup deploy" 〓\n${stdout.length > 0 ? `指令输出: ${stdout}` : ""} ${stderr.length > 0 ? `指令输出: ${stderr}` : ""}共耗时${(new Date().getTime() - startTime) / 1000}秒`)
                        });
                        process.exit()
                    }
                    _tmp()
                } else {
                    event.reply(`未知的参数: "${secondCmd === undefined? '[空字符]' : secondCmd}", 输入 "/reboot help" 以获取帮助`)
                }
            }
        } else {
            event.reply(`〓 Permission Error: 非主管理员 〓`)
        }
    }
}

function runCmd(event, params, plugin) {
    secondCmd = params[0]
    if (secondCmd == undefined) {
        event.reply(`〓 systool./cmd帮助 〓\n使用/cmd <system-command>执行系统命令`)
    } else {
        command = event.raw_message.split(" ", 1)[0]
        cmdString = event.raw_message.slice(command.length + 1, event.raw_message.length)
        if (isAdmin(event, true)) {
            event.reply(`〓 开始执行 ${cmdString} 〓`)
            const startTime = new Date().getTime()
            if (os.type() == "Linux" || os.type() == "Darwin") {
                exec(cmdString, function(error, stdout, stderr) {
                    event.reply(`〓 运行 "${cmdString}" 〓\n${stdout.length > 0 ? `指令输出: ${stdout}` : ""} ${stderr.length > 0 ? `指令输出(错误信息): ${stderr}` : ""}共耗时${(new Date().getTime() - startTime) / 1000}秒`)
                });
                
            } else {
                exec(cmdString, { encoding: binaryEncoding }, function(error, stdout, stderr) {
                    stdout = iconv.decode(new Buffer.from(stdout, binaryEncoding), encoding)
                    stderr = iconv.decode(new Buffer.from(stderr, binaryEncoding), encoding)
                    event.reply(`〓 运行 "${cmdString}" 〓\n${stdout.length > 0 ? `指令输出: ${stdout}` : ""} ${stderr.length > 0 ? `指令输出(错误信息): ${stderr}` : ""}共耗时${(new Date().getTime() - startTime) / 1000}秒`)
                });
            }
        } else {
            event.reply(`Permission Error: 非主管理员`)
        }
    }
}

function getElement(arr, item) {
       for(var i=0; i<arr.length; i++){
       if(arr[i]==item){
           return i;
       }
   }
   return -1;
}

function isAliasCmd(item) {
    if (config["alias"].includes(item)) {
        return true;
    } else {
        return false;
    }
}

function alias_add(event, params, plugin) {
    secondCmd = params[0]
    thirdCmd = params[1]
    fouthCmd = params[2]
    if (secondCmd != undefined && thirdCmd == "=" && fouthCmd != undefined) {
        const arr = config[fouthCmd.slice(1, fouthCmd.length)]
        if (arr != undefined) {
            if (isAliasCmd(fouthCmd)) {
                event.reply("〓 ${secondCmd}=>${fouthCmd} 设置失败 〓\n[WARN]本命令不得指向")
                return
            }
            if (secondCmd.indexOf("/") == 0) {
                if (!arr.includes(secondCmd)) {
                    arr.push(secondCmd)
                    event.reply(`〓 ${secondCmd}=>${fouthCmd} 设置成功 〓`)
                    plugin.saveConfig(config)
                } else {
                    event.reply(`〓 ${secondCmd}=>${fouthCmd} 设置成功 〓\n[WARN]${secondCmd} 已指向 ${fouthCmd}`)
                }
            } else {
                event.reply(`〓 ${secondCmd}=>${fouthCmd} 设置失败 〓\n<command-a>(${secondCmd})必须以"/"开头`)
            }
        } else {
            event.reply(`〓 ${secondCmd}=>${fouthCmd} 设置失败 〓\n<command-b>(${fouthCmd})不存在`)
        }
    } else {
        event.reply(`〓 systool./alias帮助 〓\n使用/alias <command-a> = <command-b>定义指令a指向b\n使用/unalias <command-a> <command-b>取消a指向b\n*(注意: 空格不能省略, 指令b必须存在, a必须以"/"开头)`)
    }
}

function alias_rm(event, params, plugin) {
    secondCmd = params[0]
    thirdCmd = params[1]
    if (secondCmd != undefined && thirdCmd != undefined) {
        let arr = config[thirdCmd.slice(1, thirdCmd.length)]
        if (arr != undefined) {
            if (isAliasCmd(thirdCmd)) {
                event.reply(`〓 ${secondCmd}=>${fouthCmd} 设置失败 〓\n[WARN]本命令不得指向`)
                return
            }
            if (secondCmd.indexOf("/") == 0) {
                if (arr.includes(secondCmd)) {
                    itemIndex = getElement(arr, secondCmd)
                    arr.splice(itemIndex, 1)
                    event.reply(`〓 ${secondCmd}=>${thirdCmd} 删除成功 〓`)
                    plugin.saveConfig(config)
                } else {
                    event.reply(`〓 ${secondCmd}=>${thirdCmd} 删除成功 〓\n[WARN]${secondCmd} 未指向 ${thirdCmd}`)
                }
            } else {
                event.reply(`〓 ${secondCmd}=>${thirdCmd} 删除失败 〓\n<command-a>(${secondCmd})必须以"/"开头`)
            }
        } else {
            event.reply(`〓 ${secondCmd}=>${thirdCmd} 删除失败 〓\n<command-b>(${thirdCmd})不存在`)
        }
    } else {
        event.reply(`〓 systool./ualias帮助 〓\n使用/alias <command-a> = <command-b>定义指令a指向b(注意: 空格不能省略, 指令b必须存在, a必须以"/"开头)\n使用/unalias <command-a> <command-b>取消a指向b`)
    }
}

function alias(event, params, plugin) {
    if (event.raw_message.indexOf("/u") == -1) {
        console.log("alias_add")
        alias_add(event, params, plugin)
    } else {
        if (event.raw_message.indexOf("/u") == 0) {
            alias_rm(event, params, plugin)
        } else {
            event.reply(`〓 systool./alias帮助 〓\n使用/alias <command-a> = <command-b>定义指令a指向b(注意: 空格不能省略, 指令b必须存在, a必须以"/"开头)\n使用/unalias <command-a> <command-b>取消a指向b`)
        }
    }
}

function about(event, params, plugin) {
    event.reply(about_string)
}

function checkStartAtFirstTime(event, plugin) {
    if (config["start-time"] != false) {
        event.reply(first_time)
        sleep(500)
    }
}

function min(arr) {
    _result = undefined
    for (item of arr) {
        if (_result == undefined || _result > item) {
            _result = item
        }
    }
    return _result
}

function max(arr) {
    _result = undefined
    for (item of arr) {
        if (_result == undefined || _result < item) {
            _result = item
        }
    }
    return _result
}


function getLatestUsing(maxNum = false) {
    /**
     * 获取最少使用的时间(段)
     * @param maxNum 视为使用较少最大值 (number -> <= 此时间 / false -> 忽略)
     */
    result = []
    usingJson = config["using-count"]
    for (key of Object.keys(usingJson)) {
        key = Number(key)
        if (result.length <= 0 || usingJson[key] < result[0]) {
            result = []
            result.push(key)
        } else if (result.length > 0 && usingJson[key] == result[0]) {
            result.push(key)
        }
    }
    if (maxNum === false || usingJson[result[0]] <= maxNum) {
        return [min(result), max(result)]
    } else {
        return [-1, -1]  // 超过可接受最大值
    }
}

async function checkUpdate(bot, admins) {
    npmUrl = `${npmRoot}pupbot-plugin-${plugin.name}/latest`
    // plugin.logger.info(`Check Update from ${npmUrl}`)
    // plugin.bot.sendPrivateMsg(plugin.mainAdmin, `正在从 ${npmUrl} 检查更新 (当前时间: ${new Date().getTime()}, 上次检查更新在: ${latestCheckUpdateTime > -1 ? latestCheckUpdateTime : "本次为打开框架首次检测"})`)
    latestCheckUpdateTime = new Date().getTime()

    if (checkVersionEnable) {
        try {
            const { data } = await http.get(npmUrl)
            latestVersion = data.version
            _latestVersion = latestVersion
            // plugin.bot.sendPrivateMsg(plugin.mainAdmin, `检查更新成功, 最新版本: ${latestVersion}, 当前版本: ${plugin.version}`)
        } catch(err) {
            _latestVersion = "0.0.0"
            // plugin.bot.sendPrivateMsg(plugin.mainAdmin, `检查更新失败: ${err.stack}`)
            plugin.throwPluginError(err.stack)
        }

        if (!checkVersion(plugin.version, _latestVersion)) {
            isLatestVersion = false
            // config["using-count"]["period"] = getLatestUsing()
            // timePeriod = config["using-count"]["period"]
            // hour = d.getHours()
            // if (timePeriod[0] >= hour && timePeriod[1] <= hour) {
            if (true) {
                d = new Date()
                plugin.bot.sendPrivateMsg(plugin.mainAdmin, `〓 systool提示 〓\n尝试更新: (${plugin.version} => ${latestVersion})`)
                exec(`npm install pupbot-plugin-${plugin.name}@${latestVersion} --save`, function(error, stdout, stderr) {
                    if (stdout) {
                        plugin.logger.debug(stdout)
                    }
                    if (error) {
                        plugin.logger.error(error)
                        plugin.bot.sendPrivateMsg(plugin.mainAdmin, `〓 systool提示 〓\n尝试更新 (${plugin.version} => ${latestVersion}) 时出错:\n${error.stack}`)
                    }
                    if (stderr ) {
                        plugin.logger.warn(stderr)
                        plugin.bot.sendPrivateMsg(plugin.mainAdmin, `〓 systool提示 〓\n尝试更新 (${plugin.version} => ${latestVersion}) 时出错:\n${stderr}`)
                    } else {
                        update_msg = `〓 systool提示 〓
已为您自动更新
systool已更新至最新版本  (${plugin.version} => ${latestVersion})
输入/plugin reload systool 以应用更新 
请不要关闭计算机,好东西就要来啦~ (bushi`
                    // update_msg = `〓 systool提示 〓
                    // systool有新版本拉~
                    // 输入/plugin update systool 以更新至最新版本 (${plugin.version} => ${latestVersion})
                    // 请不要关闭计算机,好东西就要来啦~ (bushi`
                    // getAllGroups(bot, (key, value) => {
                    //     // plugin.bot.sendPrivateMsg(plugin.mainAdmin, `尝试向 ${key} 发送消息, 最新版本: ${latestVersion}`)
                    //     plugin.bot.sendGroupMsg(key, update_msg)
                    //     sleep(3000)
                    // })
                    // checkVersionEnable = false
                        plugin.bot.sendPrivateMsg(plugin.mainAdmin, update_msg)
               
                    }
                })
             }
        } else {
            isLatestVersion = true
        }
    // } else if (new Date().getTime() - latestCheckUpdateTime >= 21600) {
    //     checkVersionEnable = true
    }
}

function checkVersion(now, latest) {
    /**
     * @param now -> 当前版本字符串
     * @param latest -> 最新版本字符串
     * @returns bool (false -> 当前不是最新版)
     */
    nowVersionArr = now.split(".")
    latestVersionArr = latest.split(".")
    for (i=0; i < nowVersionArr.length; i++) {
        if (nowVersionArr[i] < latestVersionArr[i]) {
            return false
        }
    }
    return true
}

// function getAllGroups(bot, callback) {
//     groups = plugin.bot.gl
//     for (let key of groups) {
//         callback(key[0], key[1])
//     }
// }

async function ip(event, params, plugin) {
    if (isAdmin(event, false)) {
        event.reply(`〓 systool提示 〓
正在获取ip, 请稍后...`)
        startTime = new Date().getTime()
        const { data } = await http.get("http://ip.tool.lu")
        if (event.raw_message.search("-p") != -1) {
            ipMsg = `${data.split("\n")[0]}\n${data.split("\n")[1]}`
        } else {
            ipMsg = data.split("\n")[0]
        }
        event.reply(`〓 systool返回 〓
${ipMsg}
请求耗时${(new Date().getTime() - startTime) / 1000}秒`)
    } else {
        event.reply(`Permission Error: 非管理员`)
    }
}

plugin.onMounted((bot, admins) => {
    reloadConfig()
    plugin.onCmd(config["commands"]["reboot"], (event, params) => hooker(event, params, plugin, reboot))
    plugin.onCmd(config["commands"]["cmd"], (event, params) => hooker(event, params, plugin, runCmd))
    plugin.onCmd(config["commands"]["alias"], (event, params) => hooker(event, params, plugin, alias))
    plugin.onCmd(config["commands"]["about"], (event, params) => hooker(event, params, plugin, about))
    plugin.onCmd(config["commands"]["ip"], (event, params) => hooker(event, params, plugin, ip))
    plugin.onCmd('/test', (event, params) => hooker(event, params, plugin, (event, params, plugin) => {
        throw Error("错误测试")
    })) //  用于错误信息测试;
    updateChecker = plugin.cron('*/1 * * * *', (bot, admins) => checkUpdate(bot, admins))
    process.on('exit', (exitcode) => { 
        config["start-time"] = false
        config["latest-exit-time"] = new Date().getTime()
        plugin.saveConfig(config)
    })
})

plugin.onUnmounted(() => {
    plugin.saveConfig(Object.assign(config, plugin.loadConfig()))
})

module.exports = { plugin }