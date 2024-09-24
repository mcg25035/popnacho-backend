const ServiceReferences = require("./ServiceReferences");


class HttpUtils {
    static end(res, status, json) {
        res.status(status);
        res.json(json);
        res.end();
    }

    /**
     * @param {Express.Request} req
     * @param {Express.Response} res
     * @returns {string | false}
     */
    static requireBodyTransferId(req, res) {
        if (req.body.transfer_id) return req.body.transfer_id;
        HttpUtils.end(res, 400, {error: 'No transfer ID provided.'});
        return false;        
    }

    /**
     * @param {Express.Request} req
     * @param {Express.Response} res
     * @returns {string | false}
     */
    static requireBodyUidToChange(req, res) {
        if (req.body.uid) return req.body.uid;
        HttpUtils.end(res, 400, {error: 'No UID provided.'});
        return false;
    }
    

    /**
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @returns {Promise<boolean>}
     */
    static async checkLoginOrRejectSession(req, res) {
        var serviceService = ServiceReferences.instance.SessionService;
        var isSesionInit = await serviceService.isSesionInit(req.session.id);
        if (isSesionInit) return true;

        HttpUtils.end(res, 401, {error: 'Not logged in.'});
        return false;
    }

    /**
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @returns {import("./DatabaseService").UserModel | false}
     */
    static async getUserOrRejectDB(req, res) {
        var dbService = ServiceReferences.instance.DatabaseService;
        try{
            return await dbService.getUser(req.body.uid);
        }
        catch (e) {
            HttpUtils.end(res, 401, {error: 'Invalid login token.'});
            return false;
        }
    }

    /**
     * @param {Express.Request} req
     * @param {Express.Response} res
     * @param {string} tokenProvide
     * @returns {Promise<boolean>}
     */
    static async authUserOrRejectDB(req, res, tokenProvide) {
        var user = await HttpUtils.getUserOrRejectDB(req, res);
        if (!user) return false;

        if (user.loginToken == tokenProvide) return true;

        HttpUtils.end(res, 401, {error: 'Invalid login token.'});
        return false;        
    }

    /**
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @returns {Promise<boolean | string>}
     */
    static async generateTransferIdOrRejectDB(req, res) {
        var dbService = ServiceReferences.instance.DatabaseService;
        var sessionService = ServiceReferences.instance.SessionService;

        try{
            var uid = await sessionService.getSessionUid(req.session.id);
            var transferId = await dbService.newTransferId(uid);
            return transferId;
        }
        catch (e) {
            HttpUtils.end(res, 500, {error: 'Invalid user.'});
            return false;
        }
    }
}

module.exports = HttpUtils;