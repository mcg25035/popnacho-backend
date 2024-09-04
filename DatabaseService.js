const Mongoose = require('mongoose');
const Utils = require('./Utils');
const Schema = Mongoose.Schema;


/**
 * @typedef {Object} UserModel
 * @property {string} uid
 * @property {string} username
 * @property {string} transferId
 * @property {string} googleLink
 * @property {string} discordLink
 * @property {string} loginToken
 * @property {number} clickCount
 */

class DatabaseService{
    /** @type {Mongoose.Schema}*/
    userSchema = new Mongoose.Schema({
        uid: String,
        username: String,
        transferId: String,
        googleLink: String,
        discordLink: String,
        loginToken: String,
        clickCount: Number
    });

    /** @type {Mongoose.Model} */
    userModel = Mongoose.model('User', userSchema);

    /** @private */
    constructor(){}

    /** @returns {DatabaseService} */
    static async new() {
        var result = new DatabaseService();
        Mongoose.connect('mongodb://localhost:27017/', {directConnection: true});
        return result;
    }

    /** @returns {UserModel} */
    async newUser() {
        var uid = Utils.randomUID();
        while (await this.userModel.exists({uid: uid})) {
            uid = Utils.randomUID();
        }
        var loginToken = Utils.randomUID() + Utils.randomUID();
        var newUser = new this.userModel({
            uid: uid,
            username: "guest",
            transferId: "",
            googleLink: "",
            discordLink: "",
            loginToken: loginToken,
            clickCount: 0
        });
        await newUser.save();
        return newUser;
    }

    async deleteUser(uid) {
        if (!await this.userModel.exists({uid: uid})) {
            throw new Error("User does not exist");
        }
        await this.userModel.deleteOne({uid: uid});
    }

    /** @returns {string} */
    async newTransferId(uid) {
        var transferId = Utils.randomUID() + Utils.randomUID();
        if (!await this.userModel.exists({uid: uid})) {
            throw new Error("User does not exist");
        }
        this.userModel.findByIdAndUpdate(uid, {transferId: transferId});
        return transferId;
    }

    async resetTransferId(uid) {
        if (!await this.userModel.exists({uid: uid})) {
            throw new Error("User does not exist");
        }
        this.userModel.findByIdAndUpdate(uid, {transferId: ""});
        return;
    }

    /** @returns {void} */
    async addClick(uid, count) {
        if (!await this.userModel.exists({uid: uid})) {
            throw new Error("User does not exist");
        }
        var user = await this.userModel.findOne({uid: uid});
        user.clickCount+=count;
        user.save();
        return;
    }

    /** @returns {void} */
    async linkGoogle(uid, email) {
        if (!await this.userModel.exists({uid: uid})) {
            throw new Error("User does not exist");
        }
        this.userModel.findByIdAndUpdate(uid, {googleLink: email});
        return;
    }

    /** @returns {void} */
    async linkDiscord(uid, discordId) {
        if (!await this.userModel.exists({uid: uid})) {
            throw new Error("User does not exist");
        }
        this.userModel.findByIdAndUpdate(uid, {discordLink: discordId});
        return
    }

    /** @returns {string} */
    async updateToken(uid) {
        if (!await this.userModel.exists({uid: uid})) {
            throw new Error("User does not exist");
        }
        var token = Utils.randomUID() + Utils.randomUID();
        this.userModel.findByIdAndUpdate(uid, {loginToken: token});
        return token;
    }

    /** @returns {UserModel} */
    async getUser(uid) {
        if (!await this.userModel.exists({uid: uid})) {
            throw new Error("User does not exist");
        }
        return await this.userModel.findOne({uid: uid});
    }
    
    /** @returns {Boolean} */
    async auth(uid, token) {
        if (!await this.userModel.exists({uid: uid})) {
            throw new Error("User does not exist");
        }
        return await this.userModel.exists({uid: uid, loginToken: token});
    }
}

module.exports = DatabaseService;