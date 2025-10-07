/*************************************
  项目：猫眼票务状态修改（合并版）
  说明：rewrite + mitm + 脚本内容在同一文件中，脚本主体保持你原始代码未改动
  时间：2025-10-07
**************************************

[rewrite_local]
^https?:\/\/maoyan\.com\/my\/odea\/project\/detail url script-response-body https://raw.githubusercontent.com/helai888/scripts/main/maoyan.js
^https?:\/\/maoyan\.com\/my\/odea\/showTickets\/validateStock url script-response-body https://raw.githubusercontent.com/helai888/scripts/main/maoyan.js
^https?:\/\/maoyan\.com\/maoyansh\/myshow\/ajax\/channelPage\/floorPerfs url script-response-body https://raw.githubusercontent.com/helai888/scripts/main/maoyan.js

[mitm]
hostname = maoyan.com

*************************************/

/**
 * 猫眼票务状态修改脚本 - 基于微博广告脚本架构优化
 * 参考 @yichahucha 的模块化设计
 */

// 猫眼核心接口定义
const PROJECT_DETAIL_URL = '/my/odea/project/detail';
const VALIDATE_STOCK_URL = '/my/odea/showTickets/validateStock';
const CHANNEL_STOCK_URL = '/maoyansh/myshow/ajax/channelPage/floorPerfs';

// 主处理函数
function modifyMaoyanResponse(url, data) {
    try {
        // 解析JSON数据
        const jsonData = JSON.parse(data);
        let modified = false;
        
        if (url.indexOf(PROJECT_DETAIL_URL) > -1) {
            modified = modifyProjectDetail(jsonData);
        } else if (url.indexOf(VALIDATE_STOCK_URL) > -1) {
            modified = modifyStockValidation(jsonData);
        } else if (url.indexOf(CHANNEL_STOCK_URL) > -1) {
            modified = modifyChannelStock(jsonData);
        }
        
        return modified ? JSON.stringify(jsonData) : data;
        
    } catch (e) {
        console.log(`JSON解析失败: ${e.message}`);
        return data;
    }
}

// 项目详情修改
function modifyProjectDetail(data) {
    let modified = false;
    
    // 使用递归函数遍历修改
    function traverse(obj) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                // 票务状态修改
                if (key === 'stockOutRegister' && obj[key] === 1) {
                    obj[key] = 0;
                    modified = true;
                    console.log("修改 stockOutRegister: 1 → 0");
                }
                if (key === 'ticketStatus' && obj[key] === 2) {
                    obj[key] = 3;
                    modified = true;
                    console.log("修改 ticketStatus: 2 → 3");
                }
                if (key === 'saleStatus' && obj[key] === 4) {
                    obj[key] = 3;
                    modified = true;
                    console.log("修改 saleStatus: 4 → 3");
                }
                
                // 递归处理嵌套对象
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    traverse(obj[key]);
                }
            }
        }
    }
    
    traverse(data);
    return modified;
}

// 库存验证修改
function modifyStockValidation(data) {
    let modified = false;
    
    function traverse(obj) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (key === 'success' && obj[key] === false) {
                    obj[key] = true;
                    modified = true;
                    console.log("修改 success: false → true");
                }
                if (key === 'error' && obj[key] !== null) {
                    obj[key] = null;
                    modified = true;
                    console.log("修改 error: 非null → null");
                }
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    traverse(obj[key]);
                }
            }
        }
    }
    
    traverse(data);
    return modified;
}

// 频道库存修改
function modifyChannelStock(data) {
    let modified = false;
    
    function traverse(obj) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (key === 'remainingStock' && obj[key] === 0) {
                    obj[key] = 2297;
                    modified = true;
                    console.log("修改 remainingStock: 0 → 2297");
                }
                if (key === 'showStatus' && obj[key] === 2) {
                    obj[key] = 0;
                    modified = true;
                    console.log("修改 showStatus: 2 → 0");
                }
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    traverse(obj[key]);
                }
            }
        }
    }
    
    traverse(data);
    return modified;
}

// 主执行流程
var body = $response.body;
var url = $request.url;

// 记录请求信息用于调试
console.log(`处理猫眼请求: ${url}`);
console.log(`原始响应长度: ${body.length}`);

// 修改响应体
body = modifyMaoyanResponse(url, body);

console.log(`修改完成，最终响应长度: ${body.length}`);
$done({ body });
