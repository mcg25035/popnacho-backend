const SessionService = require('./SessionService');
const HttpService = require('./HttpService');
const DatabaseService = require('./DatabaseService');


class ServiceReferences {
    /** @type {ServiceReferences} */
    static instance;

    /** @type {SessionService} */
    SessionService;
    /** @type {HttpService} */
    HttpService;
    /** @type {DatabaseService} */
    DatabaseService;

    /**
     * @param {SessionService} SessionService 
     * @param {HttpService} HttpService 
     * @param {DatabaseService} DatabaseService 
     */
    constructor(SessionService, HttpService, DatabaseService) {
        if (SessionService.instance) {
            throw new Error('SessionService already created.');
        }
        this.SessionService = SessionService;
        this.HttpService = HttpService;
        this.DatabaseService = DatabaseService;
        SessionService.instance = this;
    }
}

module.exports = ServiceReferences;