import utils from 'openhim-mediator-utils';
import shrMediatorConfig from '../config/shrMediatorConfig.json';
import mpiMediatorConfig from '../config/mpiMediatorConfig.json';
import { Agent } from 'https';

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

export const importMediators = () => {
    try {
        utils.registerMediator(openhimConfig, shrMediatorConfig, (e: any) => {
            console.log(e);
        });
        utils.registerMediator(openhimConfig, mpiMediatorConfig, (e: any) => {
            console.log(e);
        });
    } catch (error) {
        console.log(error);
    }
    return;
}

export const getOpenHIMToken = async () => {
    try {
        await utils.authenticate(openhimConfig, (e: any) => {
            console.log("authentication error" && e);
        })
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


// export let apiHost = process.env.FHIR_BASE_URL