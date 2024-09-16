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
        if (!req.session.uid) {
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
        var user = await dbService.newUser();
        req.session.uid = user.uid;
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
        req.session.uid = user.uid;
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
        if (!req.session.uid) {
            res.status(401);
            res.json({error: 'Not logged in.'});
            return res.end();
        }
        var transferId;
        try{
            transferId = await dbService.newTransferId(req.session.uid);
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
        var transferIdProvide = req.body.transfer_id;
        if (!transferIdProvide) {
            res.status(400);
            res.json({error: 'No transfer ID provided.'});
            return res.end();
        }
        var uidProvide = req.body.uid;
        if (!uidProvide) {
            res.status(400);
            res.json({error: 'No UID provided.'});
            return res.end();
        }

        var uidNow = req.session.uid;
        if (uidNow && uidNow == uidProvide) {
            res.status(400);
            res.json({error: 'Cannot transfer to self.'});
            return res.end();
        }

        try {
            var user = await dbService.getUser(uidProvide);
            if (user.transferId != transferIdProvide) throw new Error('');
        }
        catch (e) {
            res.status(400);
            res.json({error: 'Invalid user or transfer ID.'});
            return res.end();
        }
        
        if (uidNow) {
            await dbService.deleteUser(uidNow);
        }
        
        try{
            dbService.resetTransferId(uidProvide);
        }
        catch (e) {
            res.status(500);
            res.json({error: 'Could not reset transfer ID.'});
            return res.end();
        }
        
        req.session.uid = uidProvide;
        var updatedToken = await dbService.updateToken(uidProvide);

        

        res.json({token: updatedToken});
        res.status(200);
    }

    static async add_click(req, res) {
        var ssService = ServiceReferences.instance.SessionService;
        var dbService = ServiceReferences.instance.DatabaseService;
        var sessionId = req.session.id;
        var countToAdd = req.body.count;
        if (!countToAdd) {
            res.status(400);
            res.json({error: 'No count provided.'});
            return res.end();
        }

        if (!ssService.isSesionInit(sessionId)) {
            var userCountTotal = await dbService.getUserClicks(req.session.uid);
            await ssService.initSession(sessionId, req.session.uid, userCountTotal);
        }

        await ssService.addClick(sessionId, countToAdd);

        res.status(200);
    }

    
        
}

module.exports = HttpService;
const ServiceReferences = require('./ServiceReferences');