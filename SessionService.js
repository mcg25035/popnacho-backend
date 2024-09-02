const Redis = require('redis');
const Utils = require('./Utils');

class SessionService {
    /** @type {Redis.RedisClient} */
    client;

    constructor() {
    }

    static async new() {
        var result = new SessionService();
        result.client = Redis.createClient();
        return result;
    }

    // async newSession()
}
