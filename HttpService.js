const Express = require('express');
const ExpressSession = require('express-session');
const Cors = require('cors');
const Utils = require('./Utils');
const dotenv = require('dotenv');

class HttpService {
    /** @type {Express.Express} */
    app;

    /**
     * 
     * @param {Express.Express} app
     * @param {number} port
     * @param {string} address
     * @returns {Promise<void>}
     */
    static async expressListenPromisify(app, port, address) {
        return new Promise((resolve, reject) => {
            app.listen(port, address, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    /** @private */
    constructor() {
        this.app = Express();
        this.app.use(Express.json());
        this.app.use(ExpressSession({
            secret: Utils.randomUID(),
            resave: true,
            saveUninitialized: true,
        }));
        this.app.use(Cors({
                origin: 'https://popnacho.mcloudtw.com',
                credentials: true
        }))
        this.app.post('/user', HttpService.new_user);
        this.app.put('/user', HttpService.transfer_user);
        this.app.put('/session', HttpService.auth_session);
        this.app.get('/session', HttpService.check_session);
        this.app.get('/transfer_id', HttpService.generate_transfer_id);
        this.app.get('/click', HttpService.get_click);
        this.app.put('/click', HttpService.add_click);

    }

    static async new() {
        var address = dotenv.config().parsed.addr || 'localhost';
        var port = dotenv.config().parsed.port || 8080;
        var result = new HttpService();
        await HttpService.expressListenPromisify(result.app, port, address);
        console.log(`[HttpService] Listening on port ${address}:${port}`);
    }

    /**
     * @param {Express.Response} res
     * @param {number} status
     * @param {Object} json
     */
    static endAndSend(res, status, json) {
        res.status(status);
        res.json(json);
        res.end();
    }

    /**
     * @private
     * @param {Express.Request} req
     * @param {Express.Response} res 
     */
    static async check_session(req, res) {
        var sessionService = ServiceReferences.instance.SessionService;
        var isSessionInit = await sessionService.isSesionInit(req.session.id);
        if (!isSessionInit) {
            return HttpService.endAndSend(res, 401, {error: 'Not logged in.'});
        }
        return HttpService.endAndSend(res, 200, {});
    }

    /**
     * @private
     * @param {Express.Request} req
     * @param {Express.Response} res
     */
    static async new_user(req, res) {
        var dbService = ServiceReferences.instance.DatabaseService;
        var sessionService = ServiceReferences.instance.SessionService;
        var user = await dbService.newUser();
        await sessionService.initSession(req.session.id, user.uid, user.clickCount);
        return HttpService.endAndSend(res, 200, {
            uid: user.uid,
            login_token: user.loginToken
        });
    }

    /**
     * @private
     * @param {Express.Request} req
     * @param {Express.Response} res
     */
    static async auth_session(req, res) {
        var dbService = ServiceReferences.instance.DatabaseService
        var sessionService = ServiceReferences.instance.SessionService;
        var uid = req.body.uid;
        var loginToken = req.body.login_token;
        var user;
        try{
            user = await dbService.getUser(uid);
            if (user.loginToken != loginToken) throw new Error('');
        }
        catch (e) {
            return HttpService.endAndSend(res, 401, {error: 'Invalid login token.'});
        }
        await sessionService.initSession(req.session.id, user.uid, user.clickCount);
        return HttpService.endAndSend(res, 200, {});
    }

    /**
     * @private
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     */
    static async generate_transfer_id(req, res) {
        var dbService = ServiceReferences.instance.DatabaseService;
        var sessionService = ServiceReferences.instance.SessionService;
        var isSesionInit = await sessionService.isSesionInit(req.session.id);
        if (!isSesionInit) {
            return HttpService.endAndSend(res, 401, {error: 'Not logged in.'});
        }
        var uid = await sessionService.getSessionUid(req.session.id);

        var transferId;
        try{
            transferId = await dbService.newTransferId(uid);
        }
        catch (e) {
            return HttpService.endAndSend(res, 500, {error: "Invalid user."});
        }
        
        res.json({transfer_id: transferId});
        res.status(200);
    }

    /**
     * @private
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     */
    static async transfer_user(req, res) {
        var dbService = ServiceReferences.instance.DatabaseService;
        var sessionService = ServiceReferences.instance.SessionService;

        var transferId = req.body.transfer_id;
        if (!transferId) {
            return HttpService.endAndSend(res, 400, {error: 'No transfer ID provided.'});
        }

        var uidToChange = req.body.uid;
        if (!uidToChange) {
            return HttpService.endAndSend(res, 400, {error: 'No UID provided.'});
        }

        var uidCurrent = await sessionService.getSessionUid(req.session.id);
        if (uidCurrent && uidCurrent == uidToChange) {
            return HttpService.endAndSend(res, 400, {error: 'Cannot transfer to self.'});
        }

        var user;
        try {
            user = await dbService.getUser(uidToChange);
            if (user.transferId != transferId) throw new Error('');
        }
        catch (e) {
            return HttpService.endAndSend(res, 400, {error: 'Invalid user or transfer ID.'});
        }
        
        if (uidCurrent) await dbService.deleteUser(uidCurrent);
        try{
            await dbService.resetTransferId(uidToChange);
        }
        catch (e) {
            return HttpService.endAndSend(res, 500, {error: 'Could not reset transfer ID.'});
        }

        var clickToInit;
        try{
            clickToInit = await sessionService.getSessionClicks(req.session.id);
        }
        catch (e) {
            clickToInit = user.clickCount;
        }
        
        await sessionService.transferSession(req.session.id, user.uid, clickToInit);
        var updatedToken = await dbService.updateToken(uidToChange);

        return HttpService.endAndSend(res, 200, {token: updatedToken});
    }

    /**
     * @private
     * @param {Express.Request} req
     * @param {Express.Response} res
     */
    static async get_click(req, res) {
        var sessionService = ServiceReferences.instance.SessionService;
        var dbService = ServiceReferences.instance.DatabaseService;
        
        var sessionId = req.session.id;
        if (!await sessionService.isSesionInit(sessionId)) {
            return HttpService.endAndSend(res, 401, {error: 'Not logged in.'});
        }

        var clickCount = await sessionService.getSessionClicks(sessionId);
        return HttpService.endAndSend(res, 200, {clicks: clickCount});
    }

    /**
     * @private
     * @param {Express.Request} req
     * @param {Express.Response} res
     */
    static async add_click(req, res) {
        var sessionService = ServiceReferences.instance.SessionService;
        var dbService = ServiceReferences.instance.DatabaseService;
        var sessionId = req.session.id;
        var countToAdd = req.body.count;
        if (!countToAdd) {
            return HttpService.endAndSend(res, 400, {error: 'No count provided.'});
        }

        if (!await sessionService.isSesionInit(sessionId)) {
            return HttpService.endAndSend(res, 401, {error: 'Not logged in.'});
        }

        await sessionService.addClick(sessionId, countToAdd);
        var uid = await sessionService.getSessionUid(sessionId);
        var clickCount = await sessionService.getSessionClicks(sessionId);
        dbService.setClick(uid, clickCount);

        return HttpService.endAndSend(res, 200, {clicks: clickCount});
    }

    
        
}

module.exports = HttpService;
const ServiceReferences = require('./ServiceReferences');