# LHSS CBDHS HIE

This repository contains the code and artefacts for the LHSS CBDHS Health Information Exchange based on the OpenHIE architecture.


1. LHSS - Local Health Systems Strengthening
2. CBDHS - CrossBorder Digital Health System

### Components

1. HAPI FHIR - This project utilizes HAPI FHIR with the following modification.
   - The IPS Implementation Guide Preloaded
   - MDM Module enabled with MDM Rules.
2. OpenHIM
3. Custom OpenHIM Mediators


## Mediators


1. MPI - Faciliate data exchange between client systems and HAPI FHIR (patient demographics and information)
2. SHR - Facilitate data exchange of clinical records between client systems and the SHR (HAPI FHIR)


## Setting up and Running the HIE.

1. Install the latest version of Docker.

2. Pull the source code from GitHub

    ```git clone https://github.com/IntelliSOFT-Consulting/LHSS-CBDHS-HIE.git```

3. Navigate to the project directory
   
   ```cd LHSS-CBDHS-HIE```

4. Copy the `.env.example` file to create a .env file on the same directory.
   
   ```cp .env.example .env```


5. Start the services using the 
 
   ```docker compose up -d```

   Alternatively, run the quick setup script

   ```./run-hie.sh ```

You should now have the services at the ports as numbered below.

### Port Numbering

- 8080 - OpenHIM Core.
- 8081 - HAPI FHIR Server.
- 8090 - DHIS2 Web Instance.
- 8082 - Custom administration APIs


5. To access OpenHIM for the first time, Use the following default credentials for the initial login.

- Username: `root@openhim.org`
- Password `openhim-password`


6. OpenHIM requires one to update the password upon first login.
   
    Update the `OPENHIM-PASSWORD` variable in the `.env` file with the password you have chosen.


7. Restart the mediator service by running.
    
    ```docker compose restart```