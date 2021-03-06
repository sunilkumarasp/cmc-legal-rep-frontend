import * as express from 'express'
import { PartyType } from 'common/partyType'
import Claimant from 'drafts/models/claimant'
import { Paths as ClaimPaths } from 'claim/paths'
import { Draft } from '@hmcts/draft-store-client'
import { DraftLegalClaim } from 'drafts/models/draftLegalClaim'

export class Claimants {

  static addClaimant (res: express.Response) {
    let claimants: Claimant[] = []

    const draft: Draft<DraftLegalClaim> = res.locals.legalClaimDraft
    draft.document.claimants.map((claimant) => claimants.push(new Claimant().deserialize(claimant)))
    claimants.push(new Claimant())

    draft.document.claimants = claimants
  }

  static removeClaimant (res: express.Response, id: string) {
    let claimants: Claimant[] = []

    const draft: Draft<DraftLegalClaim> = res.locals.legalClaimDraft
    draft.document.claimants.forEach((claimant, index) => {
      if (Number(index + 1) !== Number(id)) {
        claimants.push(new Claimant().deserialize(claimant))
      }
    })

    draft.document.claimants = claimants
  }

  static getCurrentIndex (res: express.Response): number {
    const draft: Draft<DraftLegalClaim> = res.locals.legalClaimDraft
    return draft.document.claimants.length - 1
  }

  static getCurrentClaimantName (res: express.Response): string {
    const draft: Draft<DraftLegalClaim> = res.locals.legalClaimDraft
    const claimants = draft.document.claimants
    const claimantDetails = claimants[Claimants.getIndex(res)].claimantDetails
    const isIndividual = claimantDetails.type.value === PartyType.INDIVIDUAL.value
    return isIndividual ? claimantDetails.fullName : claimantDetails.organisation
  }

  static getIndex (res: express.Response): number {
    const draft: Draft<DraftLegalClaim> = res.locals.legalClaimDraft
    const changeIndex = draft.document.claimantChangeIndex
    return changeIndex !== undefined ? changeIndex : Claimants.getCurrentIndex(res)
  }

  static getChangeIndex (req: express.Request, res: express.Response): number {
    const index = req.query.index !== undefined ? (req.query.index - 1) : -1
    if (index < 0 || index > Claimants.getCurrentIndex(res)) {
      throw Error('Invalid index for claimant')
    }
    return index
  }

  static getNextPage (req: express.Request): string {
    let pagePath: string
    switch (req.query.page) {
      case 'address':
        pagePath = ClaimPaths.claimantAddressPage.uri
        break
      default:
        pagePath = ClaimPaths.claimantTypePage.uri
    }
    return pagePath
  }

  static getPartyStrip (res: express.Response): string {
    const index = Claimants.getIndex(res)
    return index >= 1 ? `Claimant ${index + 1}` : `Claimant`
  }

}
