import { useNavigate } from "react-router-dom";

function SetupCard({ setup }) {
    const risk = setup.entry - setup.stopLoss;
    const reward = setup.target - setup.entry;
    const rr = reward / risk;

    return (
        <article className="setup-card">
            <div className="setup-top">
                <div>
                    <div className="stock-title">
                        {setup.stockName}
                    </div>

                    <div className="stock-symbol">
                        {setup.symbol}
                    </div>
                </div>

                <span className={`status status-${setup.status}`}>
                    <span className="status-dot" />
                    {setup.status}
                </span>
            </div>

            <div className="strategy-section">
                <div className="label">Strategy</div>

                <p className="strategy-text">
                    {setup.strategy}
                </p>
            </div>

            <div className="price-grid">
                <div>
                    <span className="label">Entry (Decided)</span>
                    <strong>₹{setup.entry.toFixed(2)}</strong>
                </div>

                <div>
                    <span className="label">Stop Loss (Decided)</span>
                    <strong className="loss">
                        ₹{setup.stopLoss.toFixed(2)}
                    </strong>
                </div>

                <div>
                    <span className="label">Target (Decided)</span>
                    <strong className="profit">
                        ₹{setup.target.toFixed(2)}
                    </strong>
                </div>
            </div>

            <div className="price-grid">
                <div>
                    <span className="label">Entry (Taken)</span>
                    <strong>₹{setup.entry.toFixed(2)}</strong>
                </div>

                <div>
                    <span className="label">Stop Loss (Taken)</span>
                    <strong className="loss">
                        ₹{setup.stopLoss.toFixed(2)}
                    </strong>
                </div>

                <div>
                    <span className="label">Target (Taken)</span>
                    <strong className="profit">
                        ₹{setup.target.toFixed(2)}
                    </strong>
                </div>
            </div>

            <div className="setup-stats">
                <div>
                    <span>R:R</span>
                    <strong>{rr.toFixed(2)}</strong>
                </div>

                <div>
                    <span>Risk</span>
                    <strong>₹{risk.toFixed(2)}</strong>
                </div>

                <div>
                    <span>Reward</span>
                    <strong>₹{reward.toFixed(2)}</strong>
                </div>
            </div>

            <div className="card-actions">
                <button className="text-btn">Edit</button>
                <button className="text-btn danger">Delete</button>

                <a
                    href={`https://bananapatterns.com/#s=${setup.isin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="open-btn"
                >
                    Open <span>→</span>
                </a>
            </div>
        </article>
    );
}

export default SetupCard;
