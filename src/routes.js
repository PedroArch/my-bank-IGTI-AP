import {Router} from 'express';
import fs from 'fs';
import promisify from 'promisify-node';


const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile)


const routes = Router();

routes.get('/accounts', async (req, res) => {
  const response = JSON.parse(await readFile('accounts.json', 'utf-8'));
  delete response.nextId;
  res.status(200).send(response);
})

routes.post('/client', async (req, res)=> {
  const {name, balance} = req.body

  const data = JSON.parse(await readFile('accounts.json', 'utf-8'));
  const id = data.nextId;
  const newClient = {
    id,
    name,
    balance,
  }

  data.accounts.push(newClient);
  data.nextId++;
  await writeFile('accounts.json', JSON.stringify(data));

  res.status(201).send(newClient);
})


routes.put('/client/deposit/:id', async (req, res) => {
  const { deposit } = req.body
  const { id } = req.params

  const data = JSON.parse(await readFile('accounts.json', 'utf-8'));

  const accountIndex = data.accounts.findIndex(account => account.id == id);



  if (accountIndex >= 0) {
    data.accounts[accountIndex].balance += deposit;
    res.status(200).send(data.accounts[accountIndex]);
    await writeFile('accounts.json', JSON.stringify(data));
  } else {
    res.status(404).send("Conta não existente");
  }
})

routes.put('/client/withdraw/:id', async (req, res) => {
  const { withdraw } = req.body
  const { id } = req.params

  const data = JSON.parse(await readFile('accounts.json', 'utf-8'));

  const accountIndex = data.accounts.findIndex(account => account.id == id);

  if (data.accounts[accountIndex].balance < withdraw) {
    res.status(401).send("Valor excede o saldo em conta");
  }

  if (accountIndex >= 0) {
    data.accounts[accountIndex].balance -= withdraw;
    res.status(200).send(data.accounts[accountIndex]);
    await writeFile('accounts.json', JSON.stringify(data));
  } else {
    res.status(404).send("Conta não existente");
  }
})


routes.get('/client/balance/:id', async (req, res) => {
  const { id } = req.params

  const data = JSON.parse(await readFile('accounts.json', 'utf-8'));

  const accountIndex = data.accounts.findIndex(account => account.id == id);



  if (accountIndex >= 0) {
    res.status(200).send(`O saldo na conta é de $${data.accounts[accountIndex].balance}`);
  } else {
    res.status(404).send("Conta não existente");
  }
})

routes.delete('/client/delete/:id', async (req, res) => {
  const { id } = req.params

  const data = JSON.parse(await readFile('accounts.json', 'utf-8'));

  const accountIndex = data.accounts.findIndex(account => account.id == id);

  if (accountIndex >= 0) {
    data.accounts.splice([accountIndex], 1)
    await writeFile('accounts.json', JSON.stringify(data));
    res.status(204).send("Conta fechada com sucesso");
  } else {
    res.status(404).send("Conta não existente");
  }
})

export default routes