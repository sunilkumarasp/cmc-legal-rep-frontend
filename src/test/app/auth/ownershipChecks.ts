import { expect } from 'chai'

import OwnershipChecks from 'app/auth/ownershipChecks'
import User from 'app/idam/user'
import Claim from 'app/claims/models/claim'

function userWithId (id: number): User {
  return { id: id } as User
}

function claimWithSubmitterId (submitterId: number): Claim {
  return { submitterId: submitterId } as Claim
}

describe('OwnershipChecks', () => {
  describe('checkClaimOwner', () => {
    it('should throw error when the user is not an owner of the claim', () => {
      expect(() => OwnershipChecks.checkClaimOwner(userWithId(1), claimWithSubmitterId(2))).to.throw(Error, 'You are not allowed to access this resource')
    })

    it('should not throw error when the user is owner the claim', () => {
      expect(() => OwnershipChecks.checkClaimOwner(userWithId(1), claimWithSubmitterId(1))).not.to.throw()
    })
  })
})