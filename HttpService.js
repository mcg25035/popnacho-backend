const Express = require('express');
const ExpressSession = require('express-session');
const Cors = require('cors');
const StringUtils = require('./StringUtils');


class HttpService {
    /** @type {Express.Express} */
    app;

    /** @private */
    constructor() {
        this.app = Express();
        this.app.use(Express.json());
        this.app.use(ExpressSession({
            secret: StringUtils.randomUID(),
            resave: true,
            saveUninitialized: true
        }));
        this.app.use(Cors({
                origin: 'http://localhost:3000',
                credentials: true
        }))
        this.app.post('/user', HttpService.new_user);
        this.app.put('/user', HttpService.transfer_user);
        this.app.put('/session', HttpService.auth_session);
        this.app.get('/session', HttpService.check_session);
        this.app.get('/transfer_id', HttpService.generate_transfer_id);

        this.app.listen(8080);
        console.log('[HttpService] Listening on port 8080');
    }

    static async new() {
        return new HttpService();
    }

    /**
     * @private
     * @param {Express.Request} req
     * @param {Express.Response} res 
     */
    static async check_session(req, res) {
        var loginCheckPassed = await HttpUtils.checkLoginOrRejectSession(req, res);
        if (!loginCheckPassed) return;

        HttpUtils.end(res, 200, {});
    }

    /**
     * @private
     * @param {Express.Request} req
     * @param {Express.Response} res
     */
    static async new_user(req, res) {
        var dbService = ServiceReferences.instance.DatabaseService;
        var user = await dbService.newUser();

        var sessionService = ServiceReferences.instance.SessionService;
        await sessionService.initSession(req.session.id, user.uid, user.clickCount);
        
        HttpUtils.end(res, 200, {
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
        var user = await HttpUtils.authUserOrRejectDB(req, res, req.body.login_token);
        if (!user) return;

        var sessionService = ServiceReferences.instance.SessionService;
        await sessionService.initSession(req.session.id, user.uid, user.clickCount);

        HttpUtils.end(res, 200, {});
    }

    /**
     * @private
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @returns 
     */
    static async generate_transfer_id(req, res) {
    
        var loginCheckPassed = await HttpUtils.checkLoginOrRejectSession(req, res);
        if (!loginCheckPassed) return;

        var transferId = await HttpUtils.generateTransferIdOrRejectDB(req, res);
        if (!transferId) return;
        
        HttpUtils.end(res, 200, {transfer_id: transferId});
    }

    /**
     * @private
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     */
    static async transfer_user(req, res) {
        var dbService = ServiceReferences.instance.DatabaseService;
        var sessionService = ServiceReferences.instance.SessionService;

        var transferId = HttpUtils.requireBodyTransferId(req, res);
        if (!transferId) return;

        var uidToChange = HttpUtils.requireBodyUidToChange(req, res);
        if (!uidToChange) return;

        var uidCurrent = await sessionService.getSessionUid(req.session.id);
        if (uidCurrent && uidCurrent == uidToChange) {
            return HttpUtils.end(res, 400, {error: 'Cannot transfer to self.'});
        }

        var user = HttpUtils.getUserOrRejectDB(req, res);
        if (!user) return;
        
        if (uidCurrent) await dbService.deleteUser(uidCurrent);
        try{
            await dbService.resetTransferId(uidToChange);
        }
        catch (e) {
            res.status(500);
            res.json({error: 'Could not reset transfer ID.'});
            return res.end();
        }
        
        await sessionService.transferSession(req.session.id, user.uid, user.clickCount);
        var updatedToken = await dbService.updateToken(uidToChange);

    
        res.json({token: updatedToken});
        res.status(200);
    }

    static async add_click(req, res) {
        var sessionService = ServiceReferences.instance.SessionService;
        // var dbService = ServiceReferences.instance.DatabaseService;
        var sessionId = req.session.id;
        var countToAdd = req.body.count;
        if (!countToAdd) {
            res.status(400);
            res.json({error: 'No count provided.'});
            return res.end();
        }

        if (!await sessionService.isSesionInit(sessionId)) {
            res.status(401);
            res.json({error: 'Not logged in.'});
            return res.end();
        }

        await sessionService.addClick(sessionId, countToAdd);

        res.status(200);
    }

    
        
}

module.exports = HttpService;
const ServiceReferences = require('./ServiceReferences');
const HttpUtils = require('./HttpUtils');
