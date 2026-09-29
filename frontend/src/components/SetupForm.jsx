function SetupForm() {
    return (
        <form className="setup-form">
            <div className="form-group">
                <label>Stock name</label>

                <input
                    type="text"
                    placeholder="Tata Steel"
                />
            </div>

            <div className="form-group">
                <label>ISIN</label>

                <input
                    type="text"
                    placeholder="TATASTEEL"
                    id="stockISIN"
                />
            </div>

            <div className="form-group">
                <label>Strategy</label>

                <textarea
                    rows="4"
                    placeholder="Write your setup thesis..."
                />
            </div>

            <div className="form-grid">
                <div className="form-group">
                    <label>Entry</label>

                    <div className="input-prefix">
                        <span>₹</span>
                        <input type="number" placeholder="217" />
                    </div>
                </div>

                <div className="form-group">
                    <label>Stop Loss</label>

                    <div className="input-prefix">
                        <span>₹</span>
                        <input type="number" placeholder="205" />
                    </div>
                </div>

                <div className="form-group">
                    <label>Target</label>

                    <div className="input-prefix">
                        <span>₹</span>
                        <input type="number" placeholder="250" />
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label>Status</label>

                <select defaultValue="watching">
                    <option value="watching">Watching</option>
                    <option value="entered">Entered</option>
                    <option value="exited">Exited</option>
                    <option value="invalidated">Invalidated</option>
                </select>
            </div>

            <div className="form-group">
                <label>Notes</label>

                <textarea
                    rows="5"
                    placeholder="Anything else you want to remember..."
                />
            </div>

            <div className="form-actions">
                <button type="button" className="secondary-btn">
                    Cancel
                </button>

                <button type="submit" className="primary-btn">
                    Save Setup
                </button>
            </div>
        </form>
    );
}

export default SetupForm;
