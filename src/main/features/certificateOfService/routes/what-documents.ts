import * as express from 'express'
import { Paths } from 'certificateOfService/paths'

import { Form } from 'forms/form'
import { FormValidator } from 'forms/validation/formValidator'
import { WhatDocuments } from 'forms/models/whatDocuments'
import ErrorHandling from 'shared/errorHandling'
import { DraftService } from 'services/draftService'
import { Draft } from '@hmcts/draft-store-client'
import { DraftCertificateOfService } from 'drafts/models/draftCertificateOfService'

function renderView (form: Form<WhatDocuments>, res: express.Response): void {
  res.render(Paths.whatDocumentsPage.associatedView, { form: form })
}

export default express.Router()
  .get(Paths.whatDocumentsPage.uri, (req: express.Request, res: express.Response) => {
    const draft: Draft<DraftCertificateOfService> = res.locals.legalCertificateOfServiceDraft
    renderView(new Form(draft.document.whatDocuments), res)
  })
  .post(Paths.whatDocumentsPage.uri, FormValidator.requestHandler(WhatDocuments, WhatDocuments.fromObject),
    ErrorHandling.apply(async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
      const draft: Draft<DraftCertificateOfService> = res.locals.legalCertificateOfServiceDraft
      const form: Form<WhatDocuments> = req.body
      if (form.hasErrors()) {
        renderView(form, res)
      } else {
        draft.document.whatDocuments = form.model
        draft.document.fileToUpload = undefined

        await new DraftService().save(draft, res.locals.user.bearerToken)

        res.redirect(Paths.documentUploadPage.uri)
      }

    })
  )
