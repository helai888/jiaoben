/**
 * 猫眼接口响应体修改脚本
 * 功能：修改票务状态、库存信息和销售状态
 * GitHub: https://raw.githubusercontent.com/helai888/jiaoben/refs/heads/main/Maoyan.js
 * 基于 Adblock4limbo 结构适配
 */

// 目标接口URL正则匹配
const MAOYAN_PROJECT_DETAIL_REGEX = /maoyan\.com\/my\/odea\/project\/detail/i;
const MAOYAN_VALIDATE_STOCK_REGEX = /maoyan\.com\/my\/odea\/showTickets\/validateStock/i;
const MAOYAN_CHANNEL_STOCK_REGEX = /maoyan\.com\/maoyansh\/myshow\/ajax\/channelPage\/floorPerfs/i;

// 主处理函数
function processMaoyanResponse() {
    const requestUrl = $request.url;
    let responseBody = $response.body;

    // 验证响应体
    if (!responseBody) {
        console.log("猫眼脚本：响应体为空");
        $done({});
        return;
    }

    try {
        // 根据URL匹配执行不同的修改逻辑
        if (requestUrl.match(MAOYAN_PROJECT_DETAIL_REGEX)) {
            console.log("匹配到项目详情接口");
            responseBody = modifyProjectDetail(responseBody);
        } else if (requestUrl.match(MAOYAN_VALIDATE_STOCK_REGEX)) {
            console.log("匹配到库存验证接口");
            responseBody = modifyStockValidation(responseBody);
        } else if (requestUrl.match(MAOYAN_CHANNEL_STOCK_REGEX)) {
            console.log("匹配到频道页面库存接口");
            responseBody = modifyChannelStock(responseBody);
        } else {
            console.log("猫眼脚本：未匹配到目标接口");
            $done({});
            return;
        }

        // 返回修改后的响应
        $done({
            body: responseBody
        });

    } catch (error) {
        console.log(`猫眼脚本处理出错: ${error.message}`);
        $done({});
    }
}

// 修改项目详情接口
function modifyProjectDetail(body) {
    let jsonData;
    try {
        jsonData = JSON.parse(body);
    } catch (e) {
        console.log("解析项目详情JSON失败");
        return body;
    }

    // 递归修改字段
    function traverseAndModify(obj) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                // 修改库存登记状态
                if (key === 'stockOutRegister' && obj[key] === 1) {
                    obj[key] = 0;
                    console.log("修改 stockOutRegister: 1 → 0");
                }
                // 修改票务状态
                if (key === 'ticketStatus' && obj[key] === 2) {
                    obj[key] = 3;
                    console.log("修改 ticketStatus: 2 → 3");
                }
                // 修改销售状态
                if (key === 'saleStatus' && obj[key] === 4) {
                    obj[key] = 3;
                    console.log("修改 saleStatus: 4 → 3");
                }
                // 递归处理嵌套对象
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    traverseAndModify(obj[key]);
                }
            }
        }
    }

    traverseAndModify(jsonData);
    return JSON.stringify(jsonData);
}

// 修改库存验证接口
function modifyStockValidation(body) {
    let jsonData;
    try {
        jsonData = JSON.parse(body);
    } catch (e) {
        console.log("解析库存验证JSON失败");
        return body;
    }

    function traverseAndModify(obj) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                // 修改成功状态
                if (key === 'success' && obj[key] === false) {
                    obj[key] = true;
                    console.log("修改 success: false → true");
                }
                // 修改错误信息
                if (key === 'error' && obj[key] !== null) {
                    obj[key] = null;
                    console.log("修改 error: 非null → null");
                }
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    traverseAndModify(obj[key]);
                }
            }
        }
    }

    traverseAndModify(jsonData);
    return JSON.stringify(jsonData);
}

// 修改频道页面库存接口
function modifyChannelStock(body) {
    let jsonData;
    try {
        jsonData = JSON.parse(body);
    } catch (e) {
        console.log("解析频道库存JSON失败");
        return body;
    }

    function traverseAndModify(obj) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                // 修改剩余库存
                if (key === 'remainingStock' && obj[key] === 0) {
                    obj[key] = 2297;
                    console.log("修改 remainingStock: 0 → 2297");
                }
                // 修改演出状态
                if (key === 'showStatus' && obj[key] === 2) {
                    obj[key] = 0;
                    console.log("修改 showStatus: 2 → 0");
                }
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    traverseAndModify(obj[key]);
                }
            }
        }
    }

    traverseAndModify(jsonData);
    return JSON.stringify(jsonData);
}

// 执行主函数
processMaoyanResponse();
