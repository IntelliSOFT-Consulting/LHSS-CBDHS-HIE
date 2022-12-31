"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importMediators = void 0;
const openhim_mediator_utils_1 = __importDefault(require("openhim-mediator-utils"));
const shrMediatorConfig_json_1 = __importDefault(require("../config/shrMediatorConfig.json"));
const mpiMediatorConfig_json_1 = __importDefault(require("../config/mpiMediatorConfig.json"));
const openhimApiUrl = process.env.OPENHIM_API_URL;
const openhimUsername = process.env.OPENHIM_USERNAME;
const openhimPassword = process.env.OPENHIM_PASSWORD;
const openhimConfig = {
    username: openhimUsername,
    password: openhimPassword,
    apiURL: openhimApiUrl,
    trustSelfSigned: true
};
const importMediators = () => {
    try {
        openhim_mediator_utils_1.default.registerMediator(openhimConfig, shrMediatorConfig_json_1.default, (e) => {
            console.log(e);
        });
        openhim_mediator_utils_1.default.registerMediator(openhimConfig, mpiMediatorConfig_json_1.default, (e) => {
            console.log(e);
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.importMediators = importMediators;
openhim_mediator_utils_1.default.authenticate(openhimConfig, (e) => {
    console.log(e);
    return;
});
// export let apiHost = process.env.FHIR_BASE_URL
