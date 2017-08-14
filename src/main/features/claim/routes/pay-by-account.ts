import * as express from 'express'
import { Paths } from 'claim/paths'

import { Form } from 'app/forms/form'
import { FormValidator } from 'app/forms/validation/formValidator'
import { ClaimDraftMiddleware } from 'claim/draft/claimDraftMiddleware'
import ErrorHandling from 'common/errorHandling'
import { FeeAccount } from 'forms/models/feeAccount'
import FeesClient from 'fees/feesClient'

function renderView (form: Form<FeeAccount>, res: express.Response, next: express.NextFunction): void {
  FeesClient.getFeeAmount(res.locals.user.legalClaimDraft.amount)
    .then((feeAmount: number) => {
      res.render(Paths.payByAccountPage.associatedView,
        {
          form: form,
          feeAmount: feeAmount
        })
    })
    .catch(next)
}

export default express.Router()
  .get(Paths.payByAccountPage.uri,
    ErrorHandling.apply(async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
      renderView(new Form(res.locals.user.legalClaimDraft.feeAccount.reference), res, next)
    }))

  .post(Paths.payByAccountPage.uri, FormValidator.requestHandler(FeeAccount, FeeAccount.fromObject),
    ErrorHandling.apply(async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
      const form: Form<FeeAccount> = req.body

      if (form.hasErrors()) {
        renderView(form, res, next)
      } else {
        res.locals.user.legalClaimDraft.feeAccount.reference = form.model
        await ClaimDraftMiddleware.save(res, next)
        res.redirect(Paths.claimSubmittedPage.uri)
      }

    }))