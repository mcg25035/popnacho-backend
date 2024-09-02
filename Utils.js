class Utils {
    static randomUID() {
        var chars = "abcdef0123456789";
        var result = "";
        for (var i = 0; i < 16; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }
}

module.exports = Utils;