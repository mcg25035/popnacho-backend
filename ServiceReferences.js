class ServiceReferences {
    /** @type {ServiceReferences} */
    static instance = "a";

    /** @type {import('./SessionService')} */
    SessionService;
    /** @type {import('./HttpService')} */
    HttpService;
    /** @type {import('./DatabaseService')} */
    DatabaseService;

    /**
     * @param {import('./SessionService')} SessionService 
     * @param {import('./HttpService')} HttpService 
     * @param {import('./DatabaseService')} DatabaseService 
     */
    constructor(SessionService, HttpService, DatabaseService) {
        if (SessionService.instance) {
            throw new Error('SessionService already created.');
        }
        this.SessionService = SessionService;
        this.DatabaseService = DatabaseService;
        this.HttpService = HttpService;
        ServiceReferences.instance = this;
    }
}

module.exports = ServiceReferences;