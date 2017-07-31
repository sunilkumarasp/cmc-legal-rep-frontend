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

describe('Claim issue: defendant type page', () => {
  beforeEach(() => {
    mock.cleanAll()
    draftStoreServiceMock.resolveRetrieve('claim')
  })

  describe('on GET', () => {
    checkAuthorizationGuards(app, 'get', ClaimPaths.defendantTypePage.uri)

    it('should render page when everything is fine', async () => {
      idamServiceMock.resolveRetrieveUserFor(1, 'cmc-private-beta', 'claimant')

      await request(app)
        .get(ClaimPaths.defendantTypePage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .expect(res => expect(res).to.be.successful.withText('Choose defendant type'))
    })
  })

  describe('on POST', () => {
    checkAuthorizationGuards(app, 'post', ClaimPaths.housingDisrepairPage.uri)

    it('should render page when form is invalid and everything is fine', async () => {
      idamServiceMock.resolveRetrieveUserFor(1, 'cmc-private-beta', 'claimant')

      await request(app)
        .post(ClaimPaths.defendantTypePage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .expect(res => expect(res).to.be.successful.withText('Choose defendant type', 'div class="error-summary"'))
    })

    it('should return 500 and render error page when form is valid and cannot save draft', async () => {
      idamServiceMock.resolveRetrieveUserFor(1, 'cmc-private-beta', 'claimant')
      draftStoreServiceMock.rejectSave('claim', 'HTTP error')

      await request(app)
        .post(ClaimPaths.defendantTypePage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .send({
          type: 'INDIVIDUAL',
          title: 'title',
          fullName: 'fullName'
        })
        .expect(res => expect(res).to.be.serverError.withText('Error'))
    })

    it('should redirect to summarise the claim page when form is valid and everything is fine', async () => {
      idamServiceMock.resolveRetrieveUserFor(1, 'cmc-private-beta', 'claimant')
      draftStoreServiceMock.resolveSave('claim')

      await request(app)
        .post(ClaimPaths.defendantTypePage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .send({
          type: 'INDIVIDUAL',
          title: 'title',
          fullName: 'fullName'
        })
        .expect(res => expect(res).to.be.redirect.toLocation(ClaimPaths.defendantAddressPage.uri))
    })
  })
})
