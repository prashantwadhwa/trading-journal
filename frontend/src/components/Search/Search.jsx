import React, { useState } from 'react'
import { searchStocks } from '../../services/marketData';

function Search() {

    const [symbol, setSymbol] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();

        if (!symbol.trim()) return;

        searchStocks(symbol.toUpperCase());
    };
    return (
        <main>
            <form className="search" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search stock e.g. AEROFLEX"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                />

                <button type="submit">
                    Search
                </button>
            </form>

            <section className="stock-card">
                <h2>Search for a stock</h2>
                <p>
                    Enter an NSE stock symbol to view its chart and
                    strategy information.
                </p>
            </section>
        </main>
    )
}

export default Search