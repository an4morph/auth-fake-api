const express = require('express')
const app = express()
const port = 5432
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const defaultData = require('./defaultData')
const shortid = require('shortid')
const cors = require('cors')

const adapter = new FileSync('db.json')
const db = low(adapter)
const error = (res, status, text) => res.status(status).json(text).end()

app.use(cors())
db.defaults(defaultData).write()

app.use(express.json()) 

app.get('/data', (req, res) => {
  const token = req.get('X-Auth')
  console.log('data', token)
  const isAuth = db.get('users').find({ token }).value()
  if (!isAuth) return error(res, 403, 'Access is denied')

  res.send({ text: 'Such a perfect authorization!' })
})


app.post('/login', (req, res) => {
  const { username, password } = req.body
  if (!username) return error(res, 400, 'username attribute is required')
  if (!password) return error(res, 400, 'password attribute is required')

  const user = db.get('users').find({ data: { username, password } }).value()
  if (!user) return error(res, 403, 'incorrect login data')
  res.send({ user })
})

app.post('/signin', (req, res) => {
  const { firstname, lastname, username, password } = req.body
  if (!firstname) return error(res, 400, 'firstname attribute is required')
  if (!lastname) return error(res, 400, 'lastname attribute is required')
  if (!username) return error(res, 400, 'username attribute is required')
  if (!password) return error(res, 400, 'password attribute is required')

  const existed = db.get('users').find({ data: { username } }).value()
  if (existed) return error(res, 400, 'user with this username already exists')

  if (!password) return error(res, 400, 'password attribute is required')
  const data = { firstname, lastname, username, password }

  db.get('users').push({ data, token: `token_${shortid.generate()}` }).write()
  const user = db.get('users').find({ data: { username, password } }).value()
  res.send({ user })
})


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))