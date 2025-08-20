import AdminLogs from "../../schema/AdminLogs.js"

export default async function addLog (req, response, module) {
    try{
        let params = {
            method: req.method,
            url: req.originalUrl,
            status: response.code,
            admin_id: req?.authData?.admin_id || req?.authData?._id || response?.data?._id,
            vendor_id: req?.authData?.admin_id ? req?.authData?._id : null,
            module: module,
            message: response?.message
        }
        await AdminLogs.create(params)
    } catch(err){
        console.log(err.message,'err')
    }
} 