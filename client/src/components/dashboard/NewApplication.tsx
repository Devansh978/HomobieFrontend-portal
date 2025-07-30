import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NewApplication() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    loanType: "",
    amount: "",
    detail1: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.loanType || !form.amount) return;

    setSubmitting(true);

    try {
      const payload = {
        loanType: form.loanType,
        amount: parseInt(form.amount),
        detail: form.detail1,
        notes: form.notes,
      };

      await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      // After submission, return to dashboard or show toast
      navigate("/user-dashboard");
    } catch (err) {
      console.error("Failed to submit application", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-900 relative p-4">
      {/* Background Blur Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Modal Form */}
      <div className="relative z-10 w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">
          New Loan Application
        </h2>

        <div className="space-y-4">
          <select
            value={form.loanType}
            onChange={(e) => setForm({ ...form, loanType: e.target.value })}
            className="w-full p-3 rounded bg-white/10 text-white border border-white/20"
          >
            <option value="">Select Loan Type</option>
            <option value="home_loan">Home Loan</option>
            <option value="lap">Loan Against Property</option>
            <option value="balance_transfer">Balance Transfer</option>
          </select>

          <input
            type="number"
            placeholder="Loan Amount (₹)"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full p-3 rounded bg-white/10 text-white border border-white/20"
          />

          <input
            type="text"
            placeholder="Property Location / Type / Bank"
            value={form.detail1}
            onChange={(e) => setForm({ ...form, detail1: e.target.value })}
            className="w-full p-3 rounded bg-white/10 text-white border border-white/20"
          />

          <textarea
            placeholder="Additional Notes (optional)"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full p-3 rounded bg-white/10 text-white border border-white/20"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => navigate("/user-dashboard")}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !form.loanType || !form.amount}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
