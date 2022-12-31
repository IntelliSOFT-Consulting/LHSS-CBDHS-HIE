"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwt_1 = require("../lib/jwt");
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcrypt = __importStar(require("bcrypt"));
// import { sendPasswordResetEmail, validateEmail, sendWelcomeEmail } from "../lib/email";
const router = express_1.default.Router();
router.use(express_1.default.json());
// Get User Information.
router.get("/me", [jwt_1.requireJWTMiddleware], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token = req.headers.authorization || null;
        if (!token) {
            res.statusCode = 401;
            res.json({ error: "Invalid access token", status: "error" });
            return;
        }
        let decodedSession = jwt_1.decodeSession(process.env['SECRET_KEY'], token.split(' ')[1]);
        if (decodedSession.type == 'valid') {
            let userId = decodedSession.session.userId;
            let user = yield prisma_1.default.user.findFirst({
                where: {
                    id: userId
                }
            });
            let responseData = {
                id: user === null || user === void 0 ? void 0 : user.id, createdAt: user === null || user === void 0 ? void 0 : user.createdAt, updatedAt: user === null || user === void 0 ? void 0 : user.updatedAt, names: user === null || user === void 0 ? void 0 : user.names, email: user === null || user === void 0 ? void 0 : user.email, role: user === null || user === void 0 ? void 0 : user.role, phone: user === null || user === void 0 ? void 0 : user.phone
            };
            res.statusCode = 200;
            res.json({ data: responseData, status: "success" });
            ;
            return;
        }
    }
    catch (error) {
        // console.log(error)
        res.statusCode = 400;
        res.json({ status: "error", error: error });
        return;
    }
}));
// Login
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let newUser = false;
        let { email, password, phone } = req.body;
        // if (!validateEmail(email)) {
        //     res.statusCode = 400
        //     res.json({ status: "error", message: "Invalid email value provided" })
        //     return
        // }
        if (!password || !phone) {
            res.statusCode = 400;
            res.json({ status: "error", message: "Phone number and password are required to login" });
            return;
        }
        let user = yield prisma_1.default.user.findFirst({
            where: Object.assign(Object.assign({}, (email) && { email }), (phone) && { phone })
        });
        if (!user) {
            res.statusCode = 401;
            res.json({ status: "error", message: "Incorrect phone or password provided." });
            return;
        }
        if ((user === null || user === void 0 ? void 0 : user.verified) !== true) {
            // console.log(user)
            res.statusCode = 401;
            res.json({ status: "error", message: "Kindly complete password reset or verify your account to proceed. Check reset instructions in your email." });
            return;
        }
        const validPassword = yield bcrypt.compare(password, user === null || user === void 0 ? void 0 : user.password);
        if (validPassword) {
            let session = jwt_1.encodeSession(process.env['SECRET_KEY'], {
                createdAt: ((new Date().getTime() * 10000) + 621355968000000000),
                userId: user === null || user === void 0 ? void 0 : user.id,
                role: user === null || user === void 0 ? void 0 : user.role
            });
            let userData = user === null || user === void 0 ? void 0 : user.data;
            if (userData.newUser === true) {
                newUser = true;
                yield prisma_1.default.user.update({
                    where: Object.assign(Object.assign({}, (phone) && { phone }), (email) && { email }),
                    data: {
                        data: Object.assign(Object.assign({}, userData), { newUser: false })
                    }
                });
            }
            res.json({ status: "success", token: session.token, issued: session.issued, expires: session.expires, newUser });
            return;
        }
        else {
            res.statusCode = 401;
            res.json({ status: "error", message: "Incorrect username/password or password provided" });
            return;
        }
    }
    catch (error) {
        console.log(error);
        res.statusCode = 401;
        res.json({ error: "incorrect email or password" });
        return;
    }
}));
// Register User
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email, names, role, password, phone } = req.body;
        // if (!validateEmail(email)) {
        //     res.statusCode = 400;
        //     res.json({ status: "error", message: "invalid email value provided" });
        //     return;
        // }
        if (!(phone)) {
            res.statusCode = 400;
            res.json({ status: "error", message: "Phone number is required" });
            return;
        }
        if (!role) {
            role = "USER";
        }
        // if (!(role)) {
        //     res.statusCode = 400;
        //     res.json({ status: "error", message: "Invalid role provided" });
        //     return;
        // }
        if (!names) {
            res.statusCode = 400;
            res.json({ status: "error", message: "Names is required" });
            return;
        }
        if (!password) {
            password = (Math.random()).toString();
        }
        let roles;
        roles = ["ADMINISTRATOR", "SPECIALIST", "USER"];
        if (role && (roles.indexOf(role) < 0)) {
            res.json({ status: "error", message: `Invalid role name *${role}* provided` });
            return;
        }
        let salt = yield bcrypt.genSalt(10);
        let _password = yield bcrypt.hash(password, salt);
        let user = yield prisma_1.default.user.create({
            data: {
                email, names, role: (role), salt: salt, password: _password, phone, verified: true
            }
        });
        // console.log(user);
        let userId = user.id;
        let session = jwt_1.encodeSession(process.env['SECRET_KEY'], {
            createdAt: ((new Date().getTime() * 10000) + 621355968000000000),
            userId: user === null || user === void 0 ? void 0 : user.id,
            role: "RESET_TOKEN"
        });
        user = yield prisma_1.default.user.update({
            where: {
                id: userId
            },
            data: {
                resetToken: session.token,
                resetTokenExpiresAt: new Date(session.expires)
            }
        });
        let resetUrl = `${process.env['WEB_URL']}/new-password?id=${user === null || user === void 0 ? void 0 : user.id}&token=${user === null || user === void 0 ? void 0 : user.resetToken}`;
        // let response = await sendWelcomeEmail(user, resetUrl)
        // console.log("Email API Response: ", response)
        let responseData = { id: user.id, createdAt: user.createdAt, updatedAt: user.updatedAt, names: user.names, email: user.email, role: user.role, phone: user.phone };
        res.statusCode = 201;
        res.json({ user: responseData, status: "success", message: `User registered successfully` });
        return;
    }
    catch (error) {
        res.statusCode = 400;
        console.error(error);
        if (error.code === 'P2002') {
            res.json({ status: "error", error: `User with the provided ${error.meta.target} already exists` });
            return;
        }
        res.json(error);
        return;
    }
}));
// Register
router.post("/reset-password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email, id, phone } = req.body;
        // if (email && !validateEmail(email)) {
        //     res.statusCode = 400
        //     res.json({ status: "error", message: "invalid email value provided" })
        //     return
        // }
        // Initiate password reset.
        let user = yield prisma_1.default.user.findFirst({
            where: Object.assign(Object.assign(Object.assign({}, (email) && { email }), (id) && { id }), (phone) && { phone })
        });
        let session = jwt_1.encodeSession(process.env['SECRET_KEY'], {
            createdAt: ((new Date().getTime() * 10000) + 621355968000000000),
            userId: user === null || user === void 0 ? void 0 : user.id,
            role: "RESET_TOKEN"
        });
        user = yield prisma_1.default.user.update({
            where: Object.assign(Object.assign({}, (email) && { email }), (id) && { id }),
            data: {
                resetToken: session.token,
                resetTokenExpiresAt: new Date(session.expires)
            }
        });
        res.statusCode = 200;
        let resetUrl = `${process.env['WEB_URL']}/new-password?id=${user === null || user === void 0 ? void 0 : user.id}&token=${user === null || user === void 0 ? void 0 : user.resetToken}`;
        console.log(resetUrl);
        // let response = await sendPasswordResetEmail(user, resetUrl)
        // console.log(response)
        res.json({ message: `Password reset instructions have been sent to your email, ${user === null || user === void 0 ? void 0 : user.email}`, status: "success", });
        return;
    }
    catch (error) {
        console.log(error);
        res.statusCode = 401;
        if (error.code === 'P2025') {
            res.json({ error: `Password reset instructions have been sent to your email`, status: "error" });
            return;
        }
        res.json({ error: error, status: "error" });
        return;
    }
}));
// Set New Password
router.post("/new-password", [jwt_1.requireJWTMiddleware], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let { password, id } = req.body;
        let user = yield prisma_1.default.user.findFirst({
            where: {
                id: id
            }
        });
        let token = req.headers.authorization || '';
        let decodedSession = jwt_1.decodeSession(process.env['SECRET_KEY'], token.split(" ")[1]);
        if ((decodedSession.type !== 'valid') || !(user === null || user === void 0 ? void 0 : user.resetToken) || ((user === null || user === void 0 ? void 0 : user.resetTokenExpiresAt) < new Date())
            || (((_a = decodedSession.session) === null || _a === void 0 ? void 0 : _a.role) !== 'RESET_TOKEN')) {
            res.statusCode = 401;
            res.json({ error: `Invalid and/or expired password reset token. Code: ${decodedSession.type}`, status: "error" });
            return;
        }
        let salt = yield bcrypt.genSalt(10);
        let _password = yield bcrypt.hash(password, salt);
        let response = yield prisma_1.default.user.update({
            where: {
                id: id
            },
            data: {
                password: _password, salt: salt, resetToken: null, resetTokenExpiresAt: null, verified: true
            }
        });
        // console.log(response)
        res.statusCode = 200;
        res.json({ message: "Password Reset Successfully", status: "success" });
        return;
    }
    catch (error) {
        console.error(error);
        res.statusCode = 401;
        res.json({ error: error, status: "error" });
        return;
    }
}));
// Delete User
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { id } = req.params;
        let user = yield prisma_1.default.user.delete({
            where: {
                id: id
            }
        });
        let responseData = user;
        res.statusCode = 201;
        res.json({ user: responseData, status: "success" });
        return;
    }
    catch (error) {
        res.statusCode = 400;
        console.error(error);
        if (error.code === 'P2002') {
            res.json({ status: "error", error: `User with the provided ${error.meta.target} already exists` });
            return;
        }
        res.json(error);
        return;
    }
}));
exports.default = router;
