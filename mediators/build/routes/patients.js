'use strict';
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
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const fhir_1 = require("../lib/fhir");
exports.router = express_1.default.Router();
exports.router.use(express_1.default.json());
// get patient information
exports.router.get('/patients/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { id } = req.params;
        let patient = (yield fhir_1.FhirApi({ url: `/Patient?id=${id}` })).data;
        res.json({ status: "success", results: patient, crossBorderId: patient.id });
        return;
    }
    catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return;
    }
}));
// modify patient details
exports.router.post('/patients/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let data = req.body;
        let patient = (yield fhir_1.FhirApi({ url: '/Patient', data, method: 'PUT' })).data;
        res.json({ status: "success", results: patient, crossBorderId: patient.id });
        return;
    }
    catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return;
    }
}));
// create/register a new patient
exports.router.post('/patients', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let data = req.body;
        let patients = ((_a = (yield fhir_1.FhirApi({
            url: `/Patient$${(data === null || data === void 0 ? void 0 : data.id) && `?_id=${data === null || data === void 0 ? void 0 : data.id}`}
        ${((data === null || data === void 0 ? void 0 : data.nationalId) || (data === null || data === void 0 ? void 0 : data.passportNo)) && `?identifier=${((data === null || data === void 0 ? void 0 : data.nationalId) || (data === null || data === void 0 ? void 0 : data.passportNo))}`}`
        })).data) === null || _a === void 0 ? void 0 : _a.entry) || [];
        if (patients.length > 0) {
            res.statusCode = 400;
            res.json({ status: "error", error: "patient is already registered" });
            return;
        }
        let patient = (yield fhir_1.FhirApi({ url: '/Patient', data, method: 'POST' })).data;
        res.json({ status: "success", results: patient, crossBorderId: patient.id });
        return;
    }
    catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return;
    }
}));
// patient search
exports.router.get('/patients', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        let params = req.params;
        let patients = ((_b = (yield fhir_1.FhirApi({
            url: `/Patient${(params === null || params === void 0 ? void 0 : params.name) && `?name=${params === null || params === void 0 ? void 0 : params.name}`}
        ${(params === null || params === void 0 ? void 0 : params.id) && `?_id=${params === null || params === void 0 ? void 0 : params.id}`}
        ${((params === null || params === void 0 ? void 0 : params.nationalId) || (params === null || params === void 0 ? void 0 : params.passportNo)) && `?identifier=${((params === null || params === void 0 ? void 0 : params.nationalId) || (params === null || params === void 0 ? void 0 : params.passportNo))}`}`
        })).data) === null || _b === void 0 ? void 0 : _b.entry) || [];
        res.json({ status: "success", results: patients.data });
        return;
    }
    catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return;
    }
}));
exports.default = exports.router;
