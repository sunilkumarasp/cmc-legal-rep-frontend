import * as express from 'express'
import * as config from 'config'
import * as healthcheck from '@hmcts/nodejs-healthcheck'
import * as fs from 'fs'
import * as path from 'path'
import * as toBoolean from 'to-boolean'

/* tslint:disable:no-default-export */

let healthCheckRouter = express.Router()

let healthCheckConfig = {
  checks: {
    'claimstore': basicHealthCheck('claim-store'),
    'draft-store': basicHealthCheck('draft-store'),
    'fees': basicHealthCheck('fees'),
    'pay': basicHealthCheck('pay'),
    'idam-service-2-service-auth': basicHealthCheck('idam.service-2-service-auth'),
    'idam-api': basicHealthCheck('idam.api')
  }
}

if (toBoolean(config.get('featureToggles.certificateOfService'))) {
  healthCheckConfig.checks['document-management-web'] = basicHealthCheck('documentManagement')
}

export default express.Router().use(healthCheckRouter)
healthcheck.addTo(healthCheckRouter, healthCheckConfig)

function basicHealthCheck (serviceName) {
  const options = {
    timeout: 5000,
    deadline: 15000
  }
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dockertests' || !process.env.NODE_ENV) {
    const sslDirectory = path.join(__dirname, '..', 'resources', 'localhost-ssl')
    options['ca'] = fs.readFileSync(path.join(sslDirectory, 'localhost-ca.crt'))
  }
  return healthcheck.web(url(serviceName), options)
}

function url (serviceName: string): string {
  const healthCheckUrlLocation = `${serviceName}.healthCheckUrl`

  if (config.has(healthCheckUrlLocation)) {
    return config.get<string>(healthCheckUrlLocation)
  } else {
    return config.get<string>(`${serviceName}.url`) + '/health'
  }
}
