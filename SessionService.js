const Redis = require('redis');
const Utils = require('./Utils');

class SessionService {
    /** @type {Redis.RedisClientType} */
    client;

    constructor() {
    }

    static async new() {
        var result = new SessionService();
        result.client = Redis.createClient();
        return result;
    }

    async isSesionInit(sessionId) {
        return await this.client.EXISTS(`session:${sessionId}`);
    }
    
    async initSession(sessionId, uid, count) {
        await this.client.SET(`session:${sessionId}`, uid);
        await this.client.SET(`clicks:${sessionId}`, count);
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