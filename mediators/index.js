'use strict'

import { registerMediator } from 'openhim-mediator-utils';
import express from 'express';

import * as mediatorConfig from './mediatorConfig.json.js';

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
  apiURL: 'https://127.0.0.1:8080',
  trustSelfSigned: true
}

registerMediator(openhimConfig, mediatorConfig.config, err => {
  if (err) {
    console.error('Failed to register mediator. Check your Config:', err)
    process.exit(1)
  }
})