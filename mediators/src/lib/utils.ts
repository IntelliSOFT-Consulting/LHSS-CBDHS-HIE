import utils from 'openhim-mediator-utils';
import shrMediatorConfig from '../config/shrMediatorConfig.json';
import mpiMediatorConfig from '../config/mpiMediatorConfig.json';
import { Agent } from 'https';
import * as crypto from 'crypto';

// ✅ Do this if using TYPESCRIPT
import { RequestInfo, RequestInit } from 'node-fetch';

const fetch = (url: RequestInfo, init?: RequestInit) =>
    import('node-fetch').then(({ default: fetch }) => fetch(url, init));

const openhimApiUrl = process.env.OPENHIM_API_URL;
const openhimUsername = process.env.OPENHIM_USERNAME;
const openhimPassword = process.env.OPENHIM_PASSWORD;

const openhimConfig = {
    username: openhimUsername,
    password: openhimPassword,
    apiURL: openhimApiUrl,
    trustSelfSigned: true
}

utils.authenticate(openhimConfig, (e: any) => {
    console.log(e ? e : "✅ OpenHIM authenticated successfully");
})

export const importMediators = () => {
    try {
        utils.registerMediator(openhimConfig, shrMediatorConfig, (e: any) => {
            console.log(e ? e : "");
        });
        utils.registerMediator(openhimConfig, mpiMediatorConfig, (e: any) => {
            console.log(e ? e : "");
        });
    } catch (error) {
        console.log(error);
    }
    return;
}

export const getOpenHIMToken = async () => {
    try {
        // console.log("Auth", auth)
        let token = await utils.genAuthHeaders(openhimConfig);
        return token
    } catch (error) {
        console.log(error);
        return { error, status: "error" }
    }
}

export const installChannels = async () => {

    let headers = await getOpenHIMToken();
    [shrMediatorConfig.urn, mpiMediatorConfig.urn].map(async (urn: string) => {
        let response = await (await fetch(`${openhimApiUrl}/mediators/${urn}/channels`, {
            headers: headers, method: 'POST', body: JSON.stringify({ a: "y" }), agent: new Agent({
                rejectUnauthorized: false
            })
        })).text();
        console.log(response)
    })


}



export const sendRequest = async () => {

    let headers = await getOpenHIMToken();
    [shrMediatorConfig.urn, mpiMediatorConfig.urn].map(async (urn: string) => {
        let response = await (await fetch(`${openhimApiUrl}/patients`, {
            headers: headers, method: 'POST', body: JSON.stringify({ a: "y" }), agent: new Agent({
                rejectUnauthorized: false
            })
        })).text();
        console.log(response)
    })


}


export const createClient = async (name: string, password: string) => {

    let headers = await getOpenHIMToken();
    const clientPassword = password
    const clientPasswordDetails: any = await genClientPassword(clientPassword)
    let response = await (await fetch(`${openhimApiUrl}/clients`, {
        headers: { ...headers, "Content-Type": "application/json" }, method: 'POST',
        body: JSON.stringify({
            passwordAlgorithm: "sha512",
            passwordHash: clientPasswordDetails.passwordHash,
            passwordSalt: clientPasswordDetails.passwordSalt,
            clientID: name, name: name, "roles": [
                "*"
            ],
        }), agent: new Agent({
            rejectUnauthorized: false
        })
    })).text();
    console.log("create client: ", response)
    return response
}


// export let apiHost = process.env.FHIR_BASE_URL


const genClientPassword = async (password: string) => {
    return new Promise((resolve) => {
        const passwordSalt = crypto.randomBytes(16)

        // create passhash
        let shasum = crypto.createHash('sha512')
        shasum.update(password)
        shasum.update(passwordSalt.toString('hex'))
        const passwordHash = shasum.digest('hex')

        resolve({
            "passwordSalt": passwordSalt.toString('hex'),
            "passwordHash": passwordHash
        })
    })
}