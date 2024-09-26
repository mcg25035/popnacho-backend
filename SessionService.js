const Redis = require('redis');
const Utils = require('./Utils');
const dotenv = require('dotenv');

class SessionService {
    /** @type {Redis.RedisClientType} */
    client;

    constructor() {
    }

    static async new() {
        var result = new SessionService();
        var redisPwd = dotenv.config().parsed["redis-pwd"];
        var redisConfig = {}
        if (redisPwd) {
            redisConfig.password = redisPwd;
        }
        result.client = Redis.createClient(redisConfig);
        await result.client.connect();
        console.log('[SessionService] Connected to Redis');
        return result;
    }

    async isSesionInit(sessionId) {
        return await this.client.EXISTS(`pn::session:${sessionId}`);
    }

    async isUserInit(uid) {
        return await this.client.EXISTS(`pn::uid:${uid}`);
    }
    
    async initSession(sessionId, uid, count) {
        await this.client.SET(`pn::session:${sessionId}`, uid);
        await this.client.SET(`pn::clicks:${sessionId}`, count);
        await this.client.SET(`pn::uid:${uid}`, sessionId);
    }

    async transferSession(sessionId, newUid, newCount) {
        try{
            var oldSession = await this.client.GET(`pn::uid:${newUid}`);
            await this.client.DEL(`pn::session:${oldSession}`);
            await this.client.DEL(`pn::clicks:${oldSession}`);
        }
        catch(ignored){}
        await this.client.SET(`pn::session:${sessionId}`, newUid);
        await this.client.SET(`pn::clicks:${sessionId}`, newCount);
        await this.client.SET(`pn::uid:${newUid}`, sessionId);
    }

    async getUidSession(uid) {
        if (!await this.isUserInit(uid)) throw new Error('User not initialized.');
        return await this.client.GET(`pn::uid:${uid}`);
    }

    async getUidClicks(uid) {
        if (!await this.isUserInit(uid)) throw new Error('User not initialized.');
        var sessionId = await this.getUidSession(uid);
        return await this.client.GET(`pn::clicks:${sessionId}`);
    }

    async getSessionUid(sessionId) {
        if (!await this.isSesionInit(sessionId)) throw new Error('Session not initialized.');
        return await this.client.GET(`pn::session:${sessionId}`);
    }

    async getSessionClicks(sessionId) {
        if (!await this.isSesionInit(sessionId)) throw new Error('Session not initialized.');
        return await this.client.GET(`pn::clicks:${sessionId}`);
    }

    async addClick(sessionId, count) {
        if (!await this.isSesionInit(sessionId)) throw new Error('Session not initialized.');
        await this.client.INCRBY(`pn::clicks:${sessionId}`, count);
    }

    // async newSession()
}

module.exports = SessionService;