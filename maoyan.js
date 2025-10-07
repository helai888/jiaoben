/**
 * maoyan.js
 * 猫眼票务状态修改脚本（纯 JS，供 Loon 的 script-response-body 调用）
 * 保存编码：UTF-8 无 BOM
 */

// 猫眼核心接口定义
const PROJECT_DETAIL_URL = '/my/odea/project/detail';
const VALIDATE_STOCK_URL = '/my/odea/showTickets/validateStock';
const CHANNEL_STOCK_URL = '/maoyansh/myshow/ajax/channelPage/floorPerfs';

// 主处理函数
function modifyMaoyanResponse(url, data) {
    try {
        const jsonData = JSON.parse(data);
        let modified = false;
        
        if (url.indexOf(PROJECT_DETAIL_URL) > -1) {
            modified = modifyProjectDetail(jsonData) || modified;
        } else if (url.indexOf(VALIDATE_STOCK_URL) > -1) {
            modified = modifyStockValidation(jsonData) || modified;
        } else if (url.indexOf(CHANNEL_STOCK_URL) > -1) {
            modified = modifyChannelStock(jsonData) || modified;
        }
        
        return modified ? JSON.stringify(jsonData) : data;
        
    } catch (e) {
        // JSON 解析失败则返回原始 body（保持原样）
        return data;
    }
}

// 项目详情修改
function modifyProjectDetail(data) {
    let modified = false;
    function traverse(obj) {
        if (!obj || typeof obj !== 'object') return;
        for (let key in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

            // 票务状态修改（宽松匹配数值/字符串）
            if (key === 'stockOutRegister' && (obj[key] == 1)) {
                obj[key] = 0; modified = true;
            }
            if (key === 'ticketStatus' && (obj[key] == 2)) {
                obj[key] = 3; modified = true;
            }
            if (key === 'saleStatus' && (obj[key] == 4)) {
                obj[key] = 3; modified = true;
            }

            if (typeof obj[key] === 'object' && obj[key] !== null) traverse(obj[key]);
        }
    }
    traverse(data);
    return modified;
}

// 库存验证修改
function modifyStockValidation(data) {
    let modified = false;
    function traverse(obj) {
        if (!obj || typeof obj !== 'object') return;
        for (let key in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

            if (key === 'success' && (obj[key] == false || obj[key] === 'false')) {
                obj[key] = true; modified = true;
            }
            if (key === 'error' && obj[key] !== null) {
                obj[key] = null; modified = true;
            }

            if (typeof obj[key] === 'object' && obj[key] !== null) traverse(obj[key]);
        }
    }
    traverse(data);
    return modified;
}

// 频道库存修改
function modifyChannelStock(data) {
    let modified = false;
    function traverse(obj) {
        if (!obj || typeof obj !== 'object') return;
        for (let key in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

            if (key === 'remainingStock' && (obj[key] == 0)) {
                obj[key] = 2297; modified = true;
            }
            if (key === 'showStatus' && (obj[key] == 2)) {
                obj[key] = 0; modified = true;
            }

            if (typeof obj[key] === 'object' && obj[key] !== null) traverse(obj[key]);
        }
    }
    traverse(data);
    return modified;
}

// 主执行流程（Loon 执行时可用）
var body = (typeof $response !== 'undefined' && $response.body) ? $response.body : null;
var url = (typeof $request !== 'undefined' && $request.url) ? $request.url : '';

if (body && url) {
    body = modifyMaoyanResponse(url, body);
}
$done({ body: body });
