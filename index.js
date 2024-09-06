const ServiceReferences = require("./ServiceReferences");
const SessionService = require("./SessionService");
const HttpService = require("./HttpService");
const DatabaseService = require("./DatabaseService");

async function main() {
    var sessionService = await SessionService.new();
    var databaseService = await DatabaseService.new();
    var httpService = await HttpService.new();
    new ServiceReferences(sessionService, httpService, databaseService);
}


main()