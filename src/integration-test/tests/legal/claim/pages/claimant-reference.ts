import { verifyPageData } from 'integration-test/data/legal-test-data'

import I = CodeceptJS.I

const I: I = actor()

const fields = {
  referenceNumber: 'input[id=reference]'
}

const buttons = {
  saveAndContinue: 'input.button'
}

export class ClaimantReferencePage {
  open (): void {
    I.amOnLegalAppPage('/claim/your-reference')
  }

  enterYourReferenceForClaim (): void {
    I.fillField(fields.referenceNumber, verifyPageData.organizationRefNumber)
    I.click(buttons.saveAndContinue)
  }

  submitOnlyMandatoryData (): void {
    I.click(buttons.saveAndContinue)
  }
}
