import { expect } from 'chai'
import * as request from 'supertest'
import * as config from 'config'
import * as mock from 'nock'

import 'test/routes/expectations'
import { checkAuthorizationGuards } from 'test/features/claim/routes/checks/authorization-check'

import { Paths as ClaimPaths } from 'claim/paths'

import { app } from 'main/app'

import * as idamServiceMock from 'test/http-mocks/idam'
import * as draftStoreServiceMock from 'test/http-mocks/draft-store'

const cookieName: string = config.get<string>('session.cookieName')
const roles: string[] = ['solicitor']

const twoDefendants = {
  defendants: [{
    address: {
      line1: 'Apt 99',
      city: 'London',
      postcode: 'SW1A 1AA'
    },
    representative: {
      organisationName: 'Defendant Organisation Name',
      address: {
        line1: 'Apt 99',
        line2: 'Building A',
        city: 'London',
        postcode: 'SW1A 1AA'
      }
    },
    defendantDetails: {
      type: 'INDIVIDUAL',
      fullName: 'fullName'
    }
  },
    {
      address: {
        line1: 'Apt 99',
        city: 'London',
        postcode: 'SW1A 1AA'
      },
      representative: {
        organisationName: 'Defendant Organisation Name',
        address: {
          line1: 'Apt 99',
          line2: 'Building A',
          city: 'London',
          postcode: 'SW1A 1AA'
        }
      },
      defendantDetails: {
        type: 'INDIVIDUAL',
        fullName: 'fullName'
      }
    }]
}

describe('Claim issue: is defendant removal page, single defendant', () => {
  beforeEach(() => {
    mock.cleanAll()
    draftStoreServiceMock.resolveFind('legalClaim')
    idamServiceMock.resolveRetrieveServiceToken()
    idamServiceMock.resolveRetrieveServiceToken()
    idamServiceMock.resolveRetrieveUserFor('1', ...roles)
  })

  describe('on GET', () => {
    checkAuthorizationGuards(app, 'get', ClaimPaths.defendantRemovePage.uri)

    it('should redirect to defendant type page for one existing defendant when everything is fine', async () => {
      draftStoreServiceMock.resolveUpdate()
      draftStoreServiceMock.resolveUpdate()

      await request(app)
        .get(ClaimPaths.defendantRemovePage.uri + '?index=1')
        .set('Cookie', `${cookieName}=ABC`)
        .expect(res => expect(res).to.be.redirect.toLocation(ClaimPaths.defendantTypePage.uri))
    })

    it('should return 500 and render error page when cannot save draft', async () => {
      draftStoreServiceMock.rejectSave()

      await request(app)
        .get(ClaimPaths.defendantRemovePage.uri + '?index=1')
        .set('Cookie', `${cookieName}=ABC`)
        .expect(res => expect(res).to.be.serverError.withText('Error'))
    })
  })
})
describe('Claim issue: is defendant removal page, multiple defendants', () => {
  beforeEach(() => {
    mock.cleanAll()
    draftStoreServiceMock.resolveFind('legalClaim', twoDefendants)
    idamServiceMock.resolveRetrieveServiceToken()
    idamServiceMock.resolveRetrieveServiceToken()
    idamServiceMock.resolveRetrieveUserFor('1', ...roles)
  })
  describe('on GET', () => {
    checkAuthorizationGuards(app, 'get', ClaimPaths.defendantRemovePage.uri)

    it('should redirect to defendant add page for more than one existing defendants when everything is fine', async () => {
      draftStoreServiceMock.resolveUpdate()
      draftStoreServiceMock.resolveUpdate()

      await request(app)
        .get(ClaimPaths.defendantRemovePage.uri + '?index=1')
        .set('Cookie', `${cookieName}=ABC`)
        .expect(res => expect(res).to.be.redirect.toLocation(ClaimPaths.defendantAdditionPage.uri))
    })
  })
})
