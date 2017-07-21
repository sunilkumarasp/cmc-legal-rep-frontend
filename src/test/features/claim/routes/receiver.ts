import { expect } from 'chai'
import * as request from 'supertest'
import * as config from 'config'
import * as mock from 'nock'

import '../../../routes/expectations'

import { Paths as ClaimPaths } from 'claim/paths'

import { app } from '../../../../main/app'

import * as idamServiceMock from '../../../http-mocks/idam'
import { checkAuthorizationGuards } from '../../../routes/authorization-check'

const cookieName: string = config.get<string>('session.cookieName')

describe('Claim issue: post login receiver', () => {
  beforeEach(() => {
    mock.cleanAll()
  })

  describe('on GET', () => {
    checkAuthorizationGuards(app, 'get', ClaimPaths.claimantLoginReceiver.uri, new RegExp('http://localhost:8000/login\\?continue-url=http://127.0.0.1:[0-9]{1,5}/claim/receiver'))
    describe('for authorized user', () => {
      beforeEach(() => {
        idamServiceMock.resolveRetrieveUserFor(1, 'cmc-private-beta', 'claimant')
      })

      it.skip('should save JWT token in cookie when JWT token exists in query string', async () => {

        await request(app)
          .get(`${ClaimPaths.claimantLoginReceiver.uri}?jwt=ABC`)
          .expect(res => expect(res).to.have.cookie(cookieName, 'ABC'))
      })

      it('should not remove JWT token saved in cookie when JWT token does not exist in query string', async () => {

        await request(app)
          .get(ClaimPaths.claimantLoginReceiver.uri)
          .set('Cookie', `${cookieName}=ABC`)
          .expect(res => expect(res).to.not.have.cookie(cookieName, ''))
      })

      it('should redirect to start page when draft not saved and everything is fine', async () => {

        await request(app)
          .get(`${ClaimPaths.claimantLoginReceiver.uri}?jwt=ABC`)
          .expect(res => expect(res).to.be.redirect.toLocation(ClaimPaths.startPage.uri))
      })

    })
  })
})
