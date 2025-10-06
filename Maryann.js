// ==LoonScript==
// @script-name: 猫眼接口数据修改（远程版）
// @script-author: Your Name
// @script-description: Loon 远程脚本，拦截猫眼指定接口并修改响应字段
// @script-version: 1.0
// @script-url: https://github.com/你的用户名/你的仓库名/raw/main/maoyan-loon-script.js  // 替换为你的 GitHub Raw 链接
// ==/LoonScript==

// 接口修改规则配置（URL正则 + 字段修改逻辑）
const MODIFY_RULES = [
    // 规则1：/my/odea/project/detail 接口（3字段修改）
    {
        urlRegex: /^https?:\/\/maoyan\.com\/my\/odea\/project\/detail/,
        handler: (data) => {
            data.stockOutRegister = 0;    // 1 → 0
            data.ticketStatus = 3;       // 2 → 3
            data.saleStatus = 3;         // 4 → 3
            return data;
        }
    },
    // 规则2：/my/odea/showTickets/validateStock 接口（2字段修改）
    {
        urlRegex: /^https?:\/\/maoyan\.com\/my\/odea\/showTickets\/validateStock/,
        handler: (data) => {
            data.success = true;         // false → true
            data.error = null;           // 任意值 → null
            return data;
        }
    },
    // 规则3：/maoyansh/myshow/ajax/channelPage/floorPerfs 接口（2字段修改）
    {
        urlRegex: /^https?:\/\/maoyan\.com\/maoyansh\/myshow\/ajax\/channelPage\/floorPerfs/,
        handler: (data) => {
            // 兼容数组/单个对象格式
            const updateItem = (item) => {
                item.remainingStock = 2297; // 0 → 2297
                item.showStatus = 0;        // 2 → 0
            };
            Array.isArray(data) ? data.forEach(updateItem) : updateItem(data);
            return data;
        }
    }
];

// Loon 核心响应拦截逻辑（固定语法，不可修改结构）
if (typeof $response !== "undefined" && $response.body) {
    try {
        // 1. 解析原始响应JSON
        let responseData = JSON.parse($response.body);
        // 2. 匹配当前请求对应的修改规则
        const matchedRule = MODIFY_RULES.find(rule => rule.urlRegex.test($request.url));
        // 3. 执行字段修改（规则匹配时才处理）
        if (matchedRule) {
            responseData = matchedRule.handler(responseData);
            console.log(`[猫眼脚本] 已修改接口：${$request.url}`);
        }
        // 4. 返回修改后的响应
        $done({ body: JSON.stringify(responseData) });
    } catch (error) {
        // 异常捕获（避免脚本崩溃）
        console.error(`[猫眼脚本] 修改失败：${error.message}`);
        $done($response); // 失败时返回原始响应
    }
} else {
    // 非目标响应，直接放行
    $done($response);
}
