import utils from 'openhim-mediator-utils';
import shrMediatorConfig from '../config/shrMediatorConfig.json'
import mpiMediatorConfig from '../config/mpiMediatorConfig.json'


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
            console.log(e)
        });
        utils.registerMediator(openhimConfig, mpiMediatorConfig, (e: any) => {
            console.log(e)
        });
    } catch (error) {
        console.log(error)
    }


}

utils.authenticate(openhimConfig, (e: any) => {
    console.log(e);
    return;
})

// export let apiHost = process.env.FHIR_BASE_URL