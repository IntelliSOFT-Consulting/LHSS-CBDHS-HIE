import express, { Request, Response } from "express";
import { FhirApi } from "../lib/utils";
import { findKeycloakUser, getCurrentUserInfo, getKeycloakUserToken, registerKeycloakUser, updateUserProfile } from './../lib/keycloak'
import { v4 } from "uuid";

const router = express.Router();
router.use(express.json());

router.post("/register", async (req: Request, res: Response) => {
    try {
        // get id number and unique code
        let {firstName, lastName, idNumber, password, role, email, phone, facility } = req.body;
        console.log(req.body);
        if(!password || !idNumber || !firstName || !lastName || !role || !email ) {
            res.statusCode = 400;
            res.json({ status: "error", error: "password, idNumber, firstName, lastName, email and role are required" });
            return;
        }
        let practitionerId = v4();
        let location = await (await FhirApi({url:`/Location/${facility}`})).data;
        console.log(location)
        if(location.resourceType != "Location"){
            res.statusCode = 400;
            res.json({ status: "error", error: "Failed to register client user. Invalid location provided" });
            return;
        }
        console.log(practitionerId);
        let practitionerResource = {
            "resourceType": "Practitioner",
            "id": practitionerId,
            "identifier": [
              {
                "system": "http://hl7.org/fhir/administrative-identifier",
                "value": idNumber
              }
            ],
            "name": [{"use": "official","family": lastName, "given": [firstName]}],
            "extension": [
                {
                  "url": "http://example.org/location",
                  "valueReference": {
                    "reference": `Location/${location.id}`,
                    "display": location.display
                  }
                }
              ]
            // "telecom": [{"system": "phone","value": "123-456-7890"}]
        };
        let keycloakUser = await registerKeycloakUser(idNumber, email, phone, firstName,
                    lastName, password, null, practitionerId, role);
        if(!keycloakUser){
            res.statusCode = 400;
            res.json({ status: "error", error: "Failed to register client user" });
            return;
        }
        if (Object.keys(keycloakUser).indexOf('error') > -1){
            res.statusCode = 400;
            res.json( {...keycloakUser, status:"error"} );
            return;
        }
        let practitioner = (await FhirApi({url:`/Practitioner/${practitionerId}`, method:"PUT", data: JSON.stringify(practitionerResource)})).data;
        console.log(practitioner)
        res.statusCode = 201;
        res.json({ response:keycloakUser.success, status:"success" });
        return;
        }
    catch (error) {
        console.log(error);
        res.statusCode = 401;
        res.json({ error: "incorrect email or password", status:"error" });
        return;
    }
});

router.post("/login", async (req: Request, res: Response) => {
    try {
        let {idNumber, password} = req.body;
        let token = await getKeycloakUserToken(idNumber, password);
        if(!token){
            res.statusCode = 401;
            res.json({ status: "error", error:"Incorrect ID Number or Password provided" });
            return;
        }
        if (Object.keys(token).indexOf('error') > -1){
            res.statusCode = 401;
            res.json({status:"error", error: `${token.error} - ${token.error_description}`})
            return;
        }
        res.statusCode = 200;
        res.json({ ...token, status: "success" });
        return;
    }
    catch (error) {
        console.log(error);
        res.statusCode = 401;
        res.json({ error: "incorrect email or password", status:"error" });
        return;
    }
});

router.get("/me", async (req: Request, res: Response) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1] || null;
        if(!accessToken || req.headers.authorization?.split(' ')[0] != "Bearer"){
            res.statusCode = 401;
            res.json({ status: "error", error:"Bearer token is required but not provided" });
            return;
        }
        let currentUser = await getCurrentUserInfo(accessToken);
        if(!currentUser){
            res.statusCode = 401;
            res.json({ status: "error", error: "Invalid Bearer token provided"  });
            return;
        }
        let userInfo = await findKeycloakUser(currentUser.preferred_username)
        let practitioner = await (await FhirApi({url:`/Practitioner/${userInfo.attributes.fhirPractitionerId[0]}`})).data;
        let facilityId = practitioner.extension[0].valueReference.reference;
        res.statusCode = 200;
        res.json({ status: "success", user:{ firstName: userInfo.firstName,lastName: userInfo.lastName,
            fhirPractitionerId:userInfo.attributes.fhirPractitionerId[0],
            practitionerRole: userInfo.attributes.practitionerRole[0],
            id: userInfo.id, idNumber: userInfo.username, fullNames: currentUser.name,
            phone: (userInfo.attributes?.phone ? userInfo.attributes?.phone[0] : null) , email: userInfo.email ?? null,
            facility: facilityId
        }});
        return;
    }
    catch (error) {
        console.error(error);
        res.statusCode = 401;
        res.json({ error: "Invalid Bearer token provided", status:"error" });
        return;
    }
});

router.post("/me", async (req: Request, res: Response) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1] || null;
        if(!accessToken || req.headers.authorization?.split(' ')[0] != "Bearer"){
            res.statusCode = 401;
            res.json({ status: "error", error:"Bearer token is required but not provided" });
            return;
        }
        // allow phone number & email
        let {phone, email} = req.body;
        let currentUser = await getCurrentUserInfo(accessToken);
        if(!currentUser){
            res.statusCode = 401;
            res.json({ status: "error", error: "Invalid Bearer token provided"  });
            return;
        }
        let response = await updateUserProfile(currentUser.preferred_username, phone, email);
        console.log(response);
        let userInfo = await findKeycloakUser(currentUser.preferred_username);
        let practitioner = await (await FhirApi({url:`/Practitioner/${userInfo.attributes.fhirPractitionerId[0]}`})).data;
        let facilityId = practitioner.extension[0].valueReference.reference ?? null;
        // if(!facilityId && userInfo.attributes.practitionerRole[0]){
        //     res.statusCode = 401;
        //     res.json({ status: "error", error: "Provide must be assigned to a facility first"  });
        //     return;
        // }
        res.statusCode = 200;
        res.json({ status: "success", user:{ firstName: userInfo.firstName,lastName: userInfo.lastName,
            fhirPractitionerId:userInfo.attributes.fhirPractitionerId[0],
            practitionerRole: userInfo.attributes.practitionerRole[0],
            id: userInfo.id, idNumber: userInfo.username, fullNames: currentUser.name,
            phone: (userInfo.attributes?.phone ? userInfo.attributes?.phone[0] : null) , email: userInfo.email ?? null,
            facility: facilityId
        }});
        return;
    }
    catch (error) {
        console.error(error);
        res.statusCode = 401;
        res.json({ error: "Invalid Bearer token provided", status:"error" });
        return;
    }
});

router.post("/register-admin", async (req: Request, res: Response) => {
    try {
        let {firstName, lastName, idNumber, email, phone, password} = req.body;

        if(!firstName || !lastName || !idNumber || !email || !phone || !password){
            res.statusCode = 400;
            res.json({ status: "error", error: "first name, last name, ID number, email, phone and password are required" });
            return;
        }

        let practitionerId = v4()

        let practitionerResource = {
            "resourceType": "Practitioner",
            "id": practitionerId,
            "identifier": [
                {
                    "system": "http://hl7.org/fhir/administrative-identifier",
                    "value": idNumber
                }
            ],
            "name": [{"use": "official", "family": lastName, "given": [firstName]}]
        }

        let keyCloakUser = await registerKeycloakUser(idNumber, email, phone, firstName, lastName, password, null, practitionerId, null)

        if(keyCloakUser){
            res.statusCode = 400;
            res.json({status: "error", error: "Failed to register admin user"});
            return;
        }

        if(Object.keys(keyCloakUser).indexOf('error') > -1){
            res.statusCode = 400;
            res.json({...keyCloakUser, status: "error"})
            return;
        }

     await FhirApi({url:`/Practitioner/${practitionerId}`, method:"PUT", data: JSON.stringify(practitionerResource)})

        res.statusCode = 201;
        res.json({response: keyCloakUser.success, status: "success"})
        return

    } catch (error) {
        res.statusCode = 401;
        res.json({ error: "incorrect email or password", status:"error" });
        return;
    }
})


export default router