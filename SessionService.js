const Redis = require('redis');
const StringUtils = require('./StringUtils');

class SessionService {
    /** @type {Redis.RedisClientType} */
    client;

    constructor() {
    }

    static async new() {
        var result = new SessionService();
        result.client = Redis.createClient();
        await result.client.connect();
        console.log('[SessionService] Connected to Redis');
        return result;
    }

    async isSesionInit(sessionId) {
        return await this.client.EXISTS(`session:${sessionId}`);
    }

    async isUserInit(uid) {
        return await this.client.EXISTS(`uid:${uid}`);
    }
    
    async initSession(sessionId, uid, count) {
        await this.client.SET(`session:${sessionId}`, uid);
        await this.client.SET(`clicks:${sessionId}`, count);
        await this.client.SET(`uid:${uid}`, sessionId);
    }

    async transferSession(sessionId, newUid, newCount) {
        try{
            var oldSession = await this.client.GET(`uid:${newUid}`);
            await this.client.DEL(`session:${oldSession}`);
            await this.client.DEL(`clicks:${oldSession}`);
        }
        catch(ignored){}
        await this.client.SET(`session:${sessionId}`, newUid);
        await this.client.SET(`clicks:${sessionId}`, newCount);
        await this.client.SET(`uid:${newUid}`, sessionId);
    }

    async getUidSession(uid) {
        if (!await this.isUserInit(uid)) throw new Error('User not initialized.');
        return await this.client.GET(`uid:${uid}`);
    }

    async getUidClicks(uid) {
        if (!await this.isUserInit(uid)) throw new Error('User not initialized.');
        var sessionId = await this.getUidSession(uid);
        return await this.client.GET(`clicks:${sessionId}`);
    }

    async getSessionUid(sessionId) {
        if (!await this.isSesionInit(sessionId)) throw new Error('Session not initialized.');
        return await this.client.GET(`session:${sessionId}`);
    }

    async getSessionClicks(sessionId) {
        if (!await this.isSesionInit(sessionId)) throw new Error('Session not initialized.');
        return await this.client.GET(`clicks:${sessionId}`);
    }

    async addClick(sessionId, count) {
        if (!await this.isSesionInit(sessionId)) throw new Error('Session not initialized.');
        await this.client.INCRBY(`clicks:${sessionId}`, count);
    }

    // async newSession()
}

module.exports = SessionService;