const Express = require('express');
const ExpressSession = require('express-session');
const Cors = require('cors');
const Utils = require('./Utils');


class HttpService {
    /** @type {Express.Express} */
    app;

    /** @private */
    constructor() {
        this.app = Express();
        this.app.use(Express.json());
        this.app.use(ExpressSession({
            secret: Utils.randomUID(),
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
        var sessionService = ServiceReferences.instance.SessionService;
        var isSessionInit = await sessionService.isSesionInit(req.session.id);
        if (!isSessionInit) {
            res.status(401);
            res.json({error: 'Not logged in.'});
            return res.end();
        }
        res.status(200);
        res.json({});
        return res.end();
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
        res.json({
            uid: user.uid,
            login_token: user.loginToken
        })
        res.status(200);
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
            res.status(401);
            res.json({error: 'Invalid login token.'});
            return res.end();
        }
        await sessionService.initSession(req.session.id, user.uid, user.clickCount);
        res.status(200);
        res.json({})
        res.end();
    }

    /**
     * @private
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @returns 
     */
    static async generate_transfer_id(req, res) {
        var dbService = ServiceReferences.instance.DatabaseService;
        var sessionService = ServiceReferences.instance.SessionService;
        var isSesionInit = await sessionService.isSesionInit(req.session.id);
        if (!isSesionInit) {
            res.status(401);
            res.json({error: 'Not logged in.'});
            return res.end();
        }
        var uid = await sessionService.getSessionUid(req.session.id);

        var transferId;
        try{
            transferId = await dbService.newTransferId(uid);
        }
        catch (e) {
            res.status(500);
            res.json({error: "Invalid user."});
            return res.end();
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
            res.status(400);
            res.json({error: 'No transfer ID provided.'});
            return res.end();
        }

        var uidToChange = req.body.uid;
        if (!uidToChange) {
            res.status(400);
            res.json({error: 'No UID provided.'});
            return res.end();
        }

        var uidCurrent = await sessionService.getSessionUid(req.session.id);
        if (uidCurrent && uidCurrent == uidToChange) {
            res.status(400);
            res.json({error: 'Cannot transfer to self.'});
            return res.end();
        }

        var user;
        try {
            user = await dbService.getUser(uidToChange);
            if (user.transferId != transferId) throw new Error('');
        }
        catch (e) {
            res.status(400);
            res.json({error: 'Invalid user or transfer ID.'});
            return res.end();
        }
        
        if (uidCurrent) await dbService.deleteUser(uidCurrent);
        try{
            await dbService.resetTransferId(uidToChange);
        }
        catch (e) {
            res.status(500);
            res.json({error: 'Could not reset transfer ID.'});
            return res.end();
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

    
        res.json({token: updatedToken});
        res.status(200);
    }

    static async add_click(req, res) {
        var sessionService = ServiceReferences.instance.SessionService;
        var dbService = ServiceReferences.instance.DatabaseService;
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