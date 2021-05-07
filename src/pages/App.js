import { useMemo, useState } from "react";
import "./App.scss";

const CurrencyList = ["USD", "AUD", "CAD", "PLN", "MXN"];

function App() {
  const [receipts, setReceipts] = useState([]);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState(CurrencyList[0]);
  const [description, setDescription] = useState("");

  const total = useMemo(() => {
    let totalValue = 0;
    receipts.forEach((receipt) => {
      totalValue += parseFloat(receipt.eur);
    });

    return totalValue.toFixed(2);
  }, [receipts]);

  const isSubmitAvailable = total <= 1000;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("receipts=", receipts);
    console.log(`total amount= ${total} EUR`)
  };

  const handleAddReceipt = async (e) => {
    e.preventDefault();
    const newReceipts = [...receipts];
    const rate = await getEURRate(currency);
    const eur = parseFloat(amount) / rate;
    newReceipts.push({
      description: description,
      amount: parseFloat(amount).toFixed(2),
      currency: currency,
      eur: eur.toFixed(2),
    });
    setReceipts(newReceipts);

    setAmount(0);
    setCurrency(CurrencyList[0]);
    setDescription("");
  };

  const handleRemoveReceipt = (index) => {
    const newReceipts = [...receipts];
    newReceipts.splice(index, 1);
    setReceipts(newReceipts);
  };

  const getEURRate = (currency) => {
    return fetch(
      `http://api.exchangeratesapi.io/v1/latest?access_key=ae5f72420c50e889992a0e5b6d18e6e9&symbols=${currency}&format=1`
    )
      .then((res) => res.json())
      .then((result) => {
        return parseFloat(result.rates[currency]);
      })
      .catch(() => 1.0);
  };

  return (
    <div className="App">
      {!isSubmitAvailable && (
        <h2 className="error">The expense report limit has been exceeded.</h2>
      )}

      <form onSubmit={handleAddReceipt} hidden={receipts.length >= 5}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {CurrencyList.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input type="submit" value="Add" />
      </form>

      <form onSubmit={handleSubmit}>
        {receipts.map((receipt, index) => (
          <div className="receipt" key={`${index}_${receipt.description}`}>
            <button
              className="btn-remove"
              onClick={() => handleRemoveReceipt(index)}
            >
              x
            </button>
            <div className="amount">{`${receipt.amount} ${receipt.currency} (${receipt.eur} EUR) -`}</div>
            <div className="description">{receipt.description}</div>
          </div>
        ))}
        <h2 className="total">{total} EUR</h2>
        <input type="submit" disabled={!isSubmitAvailable} />
      </form>
    </div>
  );
}

export default App;
