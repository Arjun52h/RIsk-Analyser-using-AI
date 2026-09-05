import { useState } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import RiskBadge from "../components/RiskBadge";
import RiskFactor from "../components/RiskFactor";
import { investigate } from "../utils/investigationEngine";

export default function Investigation({ t, onBack }) {

  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  if (!t) {
    return (
      <div className="content">
        <div className="empty">
          Select a transaction from the Transactions page to investigate it.
        </div>
      </div>
    );
  }

  const r = t.risk;
  const x = investigate(t);

    const analyzeWithGemini = async () => {
    try {
      setAiLoading(true);
      setAiError("");
      setAiAnalysis("");

      const response = await fetch(
        "http://localhost:5000/api/analyze-risk",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...t,

            riskScore: r.score,
            riskLevel: r.level,
            decision: r.decision,
            riskFactors: r.factors,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gemini analysis failed"
        );
      }

      setAiAnalysis(data.analysis);

    } catch (error) {
      console.error("Gemini error:", error);

      setAiError(
        error.message ||
        "Unable to connect to Gemini AI."
      );

    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="content">
      {/* Back Button */}
      <button className="back" onClick={onBack}>
        <ArrowLeft size={15} />
        Back
      </button>

      {/* Page Header */}
      <div className="pageTitle">
        <div className="eyebrow">RISK INVESTIGATION</div>
        <h2>{t.id}</h2>
        <p>Explainable transaction-level risk assessment.</p>
      </div>

      {/* Risk Overview & Risk Factors */}
      <div className="investGrid">
        {/* Risk Score */}
        <section className="panel pad">
          <div className="eyebrow">RISK SCORE</div>

          <div className="bigScore">
            {r.score}
            <small>/100</small>
          </div>

          <div className="track">
            <i style={{ width: r.score + "%" }} />
          </div>

          <div className="decision">
            <RiskBadge decision={r.decision} />
            <span>{r.level} RISK</span>
          </div>

          <div className="details">
            {[
              ["Amount", "₹" + t.amount.toLocaleString("en-IN")],
              ["Customer", t.customerId],
              ["Payment", t.paymentMethod],
              ["Location", t.location],
            ].map(([label, value]) => (
              <div key={label}>
                <small>{label}</small>
                <b>{value}</b>
              </div>
            ))}
          </div>
        </section>

        {/* Risk Factors */}
        <section className="panel pad">
          <div className="eyebrow">WHY IS THIS RISKY?</div>

          <h2>Risk factors</h2>

          {r.factors.length ? (
            r.factors.map((f, i) => (
              <RiskFactor f={f} key={i} />
            ))
          ) : (
            <p className="muted">No significant risk factors.</p>
          )}
        </section>
      </div>

      {/* Risk Intelligence & Decision Rationale */}
      <div className="investGrid lower">
        {/* Risk Intelligence */}
        <section className="panel pad">
          <div className="aiTitle">
            <ShieldCheck size={19} />
            Risk Intelligence
          </div>

          <p className="explain">{x.summary}</p>

          <div className="recommend">
            <div className="eyebrow">RECOMMENDED ACTION</div>
            <h2>{x.action}</h2>
            </div>

            <button
            className="ai-button"
            onClick={analyzeWithGemini}
            disabled={aiLoading}
            >
            {aiLoading
                ? "Gemini is analyzing..."
                : "✦ Analyze with Gemini AI"}
            </button>
            {aiError && (
    <div className="ai-error">
        {aiError}
    </div>
    )}

    {aiAnalysis && (
    <div className="ai-analysis-card">

        <div className="ai-header">
        <div>
            <div className="ai-label">
            GEMINI AI
            </div>

            <h2>AI Risk Investigation</h2>
        </div>
        </div>

        <div className="ai-response">
        {aiAnalysis}
        </div>

    </div>
    )}
        </section>

        {/* Decision Rationale */}
        <section className="panel pad">
          <div className="eyebrow">DECISION RATIONALE</div>

          <h2>Why this action?</h2>

          <p className="explain">{x.why}</p>

          <div className="note">
            this is generated with the Gemini ai to investigate the Risk Score. let's enjoy the process.
          </div>
        </section>
      </div>
    </div>
  );
}