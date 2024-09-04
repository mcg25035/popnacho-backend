const Express = require('express');
const ExpressSession = require('express-session');
const ServiceReferences = require('./ServiceReferences');
const Utils = require('./Utils');



class HttpService {
    /** @type {Express.Express} */
    app;

    constructor() {
        this.app = Express();
        this.app.use(ExpressSession({
            secret: Utils.randomUID(),
            resave: false,
            saveUninitialized: true,
            cookie: {
                secure: true
            }
        }));
        this.app.use(Express.json());
    }



    /**
     * @param {Express.Request} req
     * @param {Express.Response} res 
     */
    static async check_session(req, res) {
        if (!req.session.uid) res.status(401);
        res.status(200);
        res.write({});
        return res.end();
    }

    /**
     * @param {Express.Request} req
     * @param {Express.Response} res
     */
    async new_user(req, res) {
        var dbService = ServiceReferences.instance.DatabaseService;
        var user = await dbService.newUser();
        req.session.uid = user.uid;
        res.write({
            uid: user.uid,
            loginToken: user.loginToken
        })
        res.status(200);
    }

    /**
     * @param {Express.Request} req
     * @param {Express.Response} res
     */
    async auth_session(req, res) {
        var dbService = ServiceReferences.instance.DatabaseService
        var uid = req.body.uid;
        var loginToken = req.body.login_token;
        var user;
        try{
            user = await dbService.getUser(uid);
        }
        catch (e) {
            res.status(401);
            res.write({error: 'Invalid login token.'});
            return res.end();
        }
        req.session.uid = user.uid;
        res.status(200);
        res.write({})
        res.end();
    }

    async generate_transfer_id(req, res) {
        var dbService = ServiceReferences.instance.DatabaseService;
        if (!req.session.uid) {
            res.status(401);
            res.write({error: 'Not logged in.'});
            return res.end();
        }
        var transferId;
        try{
            transferId = await dbService.newTransferId(req.session.uid);
        }
        catch (e) {
            res.status(500);
            res.write({error: "Invalid user."});
            return res.end();
        }
        
        res.write({transferId: transferId});
        res.status(200);
    }

    /**
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     */
    async transfer_user(req, res) {
        var dbService = ServiceReferences.instance.DatabaseService;
        var transferIdProvide = req.body.transferId;
        if (!transferIdProvide) {
            res.status(400);
            res.write({error: 'No transfer ID provided.'});
            return res.end();
        }
        var uidProvide = req.body.uid;
        if (!uidProvide) {
            res.status(400);
            res.write({error: 'No UID provided.'});
            return res.end();
        }

        var uidNow = req.session.uid;
        if (uidNow && uidNow == uidProvide) {
            res.status(400);
            res.write({error: 'Cannot transfer to self.'});
            return res.end();
        }

        var user;
        try {
            user = await dbService.getUser(uidProvide);
            if (user.transferId != transferIdProvide) throw new Error('');
        }
        catch (e) {
            res.status(400);
            res.write({error: 'Invalid user or transfer ID.'});
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
            res.write({error: 'Could not reset transfer ID.'});
            return res.end();
        }
        
        req.session.uid = uidProvide;
        res.write({token: user.loginToken});
        res.status(200);
    }

    
        
}