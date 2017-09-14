import { expect } from 'chai'
import * as request from 'supertest'
import * as config from 'config'
import * as mock from 'nock'

import '../../../routes/expectations'
import { checkAuthorizationGuards } from './checks/authorization-check'

import { Paths as ClaimPaths } from 'claim/paths'

import { app } from '../../../../main/app'

import * as idamServiceMock from '../../../http-mocks/idam'
import * as draftStoreServiceMock from '../../../http-mocks/draft-store'

const cookieName: string = config.get<string>('session.cookieName')
const roles: string[] = ['solicitor']

describe("Claim issue: Defendant's service address page", () => {
  beforeEach(() => {
    mock.cleanAll()
    draftStoreServiceMock.resolveRetrieve('legalClaim')
  })

  describe('on GET', () => {
    checkAuthorizationGuards(app, 'get', ClaimPaths.defendantServiceAddressPage.uri)

    it('should render page when everything is fine', async () => {
      idamServiceMock.resolveRetrieveUserFor(1, ...roles)
      await request(app)
        .get(ClaimPaths.defendantServiceAddressPage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .expect(res => expect(res).to.be.successful.withText('Address for service'))
    })
  })

  describe('on POST', () => {
    checkAuthorizationGuards(app, 'post', ClaimPaths.defendantServiceAddressPage.uri)

    it('should render page when form is invalid', async () => {
      idamServiceMock.resolveRetrieveUserFor(1, ...roles)
      await request(app)
        .post(ClaimPaths.defendantServiceAddressPage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .expect(res => expect(res).to.be.successful.withText('Address for service', 'div class="error-summary"'))
    })

    it('should return 500 and render error page when form is valid and cannot save draft', async () => {
      idamServiceMock.resolveRetrieveUserFor(1, ...roles)
      draftStoreServiceMock.rejectSave('legalClaim', 'HTTP error')

      await request(app)
        .post(ClaimPaths.defendantServiceAddressPage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .send({ defendantsAddress: 'NO', line1: 'Apt 99', line2: '', city: 'London', postcode: 'E1' })
        .expect(res => expect(res).to.be.serverError.withText('Error'))
    })

    it('should redirect to defendant addition page when user selects to use the defendants address option', async () => {
      idamServiceMock.resolveRetrieveUserFor(1, ...roles)
      draftStoreServiceMock.resolveSave('legalClaim')

      await request(app)
        .post(ClaimPaths.defendantServiceAddressPage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .send({ defendantsAddress: 'YES' })
        .expect(res => expect(res).to.be.redirect.toLocation(ClaimPaths.defendantAdditionPage.uri))
    })

    it('should redirect to defendant addition page when form is valid and address filled in', async () => {
      idamServiceMock.resolveRetrieveUserFor(1, ...roles)
      draftStoreServiceMock.resolveSave('legalClaim')

      await request(app)
        .post(ClaimPaths.defendantServiceAddressPage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .send({ defendantsAddress: 'NO', line1: 'Apt 99', line2: '', city: 'London', postcode: 'E1' })
        .expect(res => expect(res).to.be.redirect.toLocation(ClaimPaths.defendantAdditionPage.uri))
    })
  })
})