import { useNavigate } from "react-router-dom";
import SetupForm from "../components/SetupForm";

function CreateSetup() {
    const navigate = useNavigate();

    return (
        <div className="app-shell">
            <main className="form-container">
                <button
                    className="back-btn"
                    onClick={() => navigate("/")}
                >
                    ← Back
                </button>

                <div className="page-header form-header">
                    <h1>New Setup</h1>
                    <p>Add a stock and define your trade plan.</p>
                </div>

                <SetupForm />
            </main>
        </div>
    );
}

export default CreateSetup;
