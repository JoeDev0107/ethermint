const Counter = artifacts.require("Counter")

contract('Counter', ([one, two, three]) => {
  console.log(one, two, three)
  let counter

  beforeEach(async() => {
    counter = await Counter.new()
    console.log('Counter:', counter.address)

    console.log('Current eth:')
    console.log('  - ', await web3.eth.getBalance(one))
    console.log('  - ', await web3.eth.getBalance(two))
    console.log('  - ', await web3.eth.getBalance(three))
    console.log('')
  })

  it('should add', async() => {
    const balanceOne = await web3.eth.getBalance(one)
    const balanceTwo = await web3.eth.getBalance(two)
    const balanceThree = await web3.eth.getBalance(three)

    let count

    await counter.add({ from: one })
    count = await counter.getCounter()
    console.log(count.toString())
    assert.equal(count, '1', 'Counter should be 1')
    assert.notEqual(balanceOne, await web3.eth.getBalance(one), `${one}'s balance should be different`)

    await counter.add({ from: two })
    count = await counter.getCounter()
    console.log(count.toString())
    assert.equal(count, '2', 'Counter should be 2')
    assert.notEqual(balanceTwo, await web3.eth.getBalance(two), `${two}'s balance should be different`)

    await counter.add({ from: three })
    count = await counter.getCounter()
    console.log(count.toString())
    assert.equal(count, '3', 'Counter should be 3')
    assert.notEqual(balanceThree, await web3.eth.getBalance(three), `${three}'s balance should be different`)
  })

  it('should subtract', async() => {
    let count

    await counter.add()
    count = await counter.getCounter()
    console.log(count.toString())
    assert.equal(count, '1', 'Counter should be 1')

    // Use receipt to ensure logs are emitted
    const receipt = await counter.subtract()
    count = await counter.getCounter()
    console.log(count.toString())
    console.log()
    console.log('Subtract tx receipt:', receipt)
    assert.equal(count, '0', 'Counter should be 0')
    assert.equal(receipt.logs[0].event, 'Changed', "Should have emitted 'Changed' event")
    assert.equal(receipt.logs[0].args.counter, '0', "Should have emitted 'Changed' event with counter being 0")

    // Check lifecycle of events
    const contract = new web3.eth.Contract(counter.abi, counter.address)
    const allEvents = await contract.getPastEvents("allEvents", { fromBlock: 0, toBlock: 'latest' })
    const changedEvents = await contract.getPastEvents("Changed", { fromBlock: 0, toBlock: 'latest' })
    console.log('allEvents', allEvents)
    console.log('changedEvents', changedEvents)
    assert.equal(allEvents.length, 3)
    assert.equal(changedEvents.length, 2)

    try {
      await counter.subtract()
      assert.fail('Subtracting past 0 should have reverted')
    } catch (err) {
      console.log()
      console.log('Passed -- was expecting error')
      console.log('Error:', err)
    }
  })
})
