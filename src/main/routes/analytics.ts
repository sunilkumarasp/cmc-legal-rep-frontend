import * as express from 'express'
import * as config from 'config'

class Paths {
  static main: string = '/analytics'
}

export default express.Router()
  .get(Paths.main, (req: express.Request, res: express.Response) => {
    const site = config.get('legal_frontend_analytics')

    res.json(site)
  })
