export default function web3OverideMew (web3, wallet, eventHub) {
  if (!wallet) return web3

  const methodOverides = {
    signTransaction (tx, privateKey) {
      return new Promise((resolve, reject) => {
        console.log(tx, privateKey, '-- HOW COULD I TRIGGER THE CONFIRMATION MODAL IN HERE---')
        eventHub.$emit('showConfirmModal', tx, wallet.signTransaction.bind(this), (res) => {
          console.log('eventHub response', res) // todo remove dev item
          resolve(res)
        })
      })
    },
    sign (data) {
      return new Promise((resolve, reject) => {
        console.log(data, '-- HOW COULD I TRIGGER THE CONFIRMATION MODAL IN HERE---')
        wallet.sign(data)
          .then(_result => {
            resolve(_result)
          })
          .catch(_error => {
            reject(_error)
          })
        // res()
      })
    }
  }
  web3.defaultAccount = wallet.getAddressString().toLowerCase()
  web3.eth.defaultAccount = wallet.getAddressString().toLowerCase()
  web3.eth.sendTransaction.method.accounts = {
    wallet: {
      length: 1,
      [wallet.getAddressString().toLowerCase()]: {
        privateKey: true
      }
    },
    ...methodOverides
  }

  web3.eth.signTransaction = methodOverides.signTransaction
  web3.eth.sign = methodOverides.sign
}
