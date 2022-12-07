'use strict'

import { registerMediator } from 'openhim-mediator-utils';
import mediatorConfig from './mediatorConfig.json';
import express from 'express';

const app = express()

app.get('/ping', (req, res) => {
  res.send('pong!');
})

app.listen(3000, () => {
  console.log('Server listening on port 3000...')
})

const openhimConfig = {
  username: 'root@openhim.org',
  password: 'password',
  apiURL: 'https://openhim-core:8080',
  trustSelfSigned: true
}

registerMediator(openhimConfig, mediatorConfig, err => {
  if (err) {
    console.error('Failed to register mediator. Check your Config:', err)
    process.exit(1)
  }
})