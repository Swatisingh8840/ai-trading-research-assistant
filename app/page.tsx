"use client";

import { useState } from "react";

type Experiment = {
  instrument: string;
  timeframe: string;
  entry: string;
  exit: string;
  holdingPeriod: string;
  filter: string;
  question: string;
};

export default function Home() {
  const [question, setQuestion] = useState("");
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [showClarification, setShowClarification] = useState(false);
  const [holdingPeriod, setHoldingPeriod] = useState("3 days");
  const [showResults, setShowResults] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // AI ANALYSIS
  const analyzeQuestion = async () => {
    if (!question.trim()) {
      alert("Please enter a research question first.");
      return;
    }

    setIsAnalyzing(true);
    setShowResults(false);
    setExperiment(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
        }),
      });

      // Read the response as text first so an empty/non-JSON response
      // does not cause "Unexpected end of JSON input".
      const text = await response.text();

      console.log("API response:", text);

      if (!text.trim()) {
        throw new Error(
          "The API returned an empty response. Please check the terminal for the API error."
        );
      }

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `The API returned an invalid response: ${text}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to analyze question."
        );
      }

      const newExperiment: Experiment = {
        instrument: data.instrument || "Not specified",
        timeframe: data.timeframe || "Daily",
        entry: data.entry || "Not specified",
        exit: data.exit || "Not specified",
        holdingPeriod: data.holdingPeriod || "Not specified",
        filter: data.filter || "Not specified",
        question:
          data.question ||
          `Does ${data.instrument || "the strategy"} have a positive edge?`,
      };

      setExperiment(newExperiment);

      // Ask for clarification when the AI identifies missing information.
      if (
        Array.isArray(data.missingInformation) &&
        data.missingInformation.length > 0
      ) {
        setShowClarification(true);

        // Use the default selection only for the UI.
        // The user can change it before creating the final experiment.
        if (
          data.missingInformation.some(
            (item: string) =>
              item.toLowerCase().includes("holding")
          )
        ) {
          setHoldingPeriod("3 days");
        }
      } else {
        setShowClarification(false);
      }
    } catch (error) {
      console.error("Analysis error:", error);

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      alert(`Could not analyze the question.\n\n${message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // CREATE FINAL EXPERIMENT AFTER CLARIFICATION
  const createExperiment = () => {
    if (!experiment) return;

    setExperiment({
      ...experiment,
      holdingPeriod: holdingPeriod,
      exit: `Close position after ${holdingPeriod}`,
    });

    setShowClarification(false);
    setShowResults(false);
  };

  // RUN SIMULATED EXPERIMENT
  const runExperiment = () => {
    setIsRunning(true);
    setShowResults(false);

    setTimeout(() => {
      setIsRunning(false);
      setShowResults(true);
    }, 1200);
  };

  // START AGAIN
  const startNewResearch = () => {
    setQuestion("");
    setExperiment(null);
    setShowClarification(false);
    setHoldingPeriod("3 days");
    setShowResults(false);
    setIsRunning(false);
    setIsAnalyzing(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* HEADER */}
        <header className="mb-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold shadow-lg shadow-blue-600/20">
              AI
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Trading Research Assistant
              </h1>

              <p className="text-sm text-slate-400">
                Turn market questions into structured experiments
              </p>
            </div>
          </div>
        </header>

        {/* ASK */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="mb-5">
            <p className="mb-2 text-sm font-semibold tracking-wide text-blue-400">
              01 · ASK
            </p>

            <h2 className="text-2xl font-semibold">
              What do you want to research?
            </h2>

            <p className="mt-2 text-slate-400">
              Ask a market question in natural language.
            </p>
          </div>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: Does buying NIFTY after a 1% fall work better during high-volatility periods?"
            className="min-h-36 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />

          <div className="mt-4 flex justify-end">
            <button
              onClick={analyzeQuestion}
              disabled={isAnalyzing}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAnalyzing
                ? "Analyzing with AI..."
                : "Analyze Question →"}
            </button>
          </div>
        </section>

        {/* UNDERSTAND */}
        {experiment && (
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6">
              <p className="mb-2 text-sm font-semibold tracking-wide text-blue-400">
                02 · UNDERSTAND
              </p>

              <h2 className="text-2xl font-semibold">
                Here's how I understand your question
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                The question has been converted into research parameters.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard
                title="Instrument"
                value={experiment.instrument}
              />

              <InfoCard
                title="Timeframe"
                value={experiment.timeframe}
              />

              <InfoCard
                title="Entry Condition"
                value={experiment.entry}
              />

              <InfoCard
                title="Filter"
                value={experiment.filter}
              />

              <InfoCard
                title="Exit Condition"
                value={experiment.exit}
              />

              <InfoCard
                title="Holding Period"
                value={experiment.holdingPeriod}
              />
            </div>

            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Research Question
              </p>

              <p className="mt-2 text-slate-200">
                {experiment.question}
              </p>
            </div>
          </section>
        )}

        {/* CLARIFY */}
        {showClarification && (
          <section className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
            <p className="mb-2 text-sm font-semibold tracking-wide text-amber-400">
              03 · CLARIFY
            </p>

            <h2 className="text-xl font-semibold">
              One important detail is missing
            </h2>

            <p className="mt-2 text-slate-400">
              How long should the position be held before evaluating
              the result?
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {["1 day", "3 days", "5 days", "10 days"].map(
                (period) => (
                  <button
                    key={period}
                    onClick={() => setHoldingPeriod(period)}
                    className={`rounded-lg border px-5 py-2.5 font-medium transition ${
                      holdingPeriod === period
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {period}
                  </button>
                )
              )}
            </div>

            <button
              onClick={createExperiment}
              className="mt-5 rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-95"
            >
              Create Experiment
            </button>
          </section>
        )}

        {/* DEFINE */}
        {experiment && !showClarification && (
          <section className="mt-8 rounded-2xl border border-emerald-500/30 bg-slate-900 p-6">
            <p className="mb-2 text-sm font-semibold tracking-wide text-emerald-400">
              04 · DEFINE
            </p>

            <h2 className="text-2xl font-semibold">
              Final Experiment
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              This is the experiment that will be tested.
            </p>

            <div className="mt-6 space-y-3">
              <Row
                label="Market"
                value={experiment.instrument}
              />

              <Row
                label="Timeframe"
                value={experiment.timeframe}
              />

              <Row
                label="Entry"
                value={experiment.entry}
              />

              <Row
                label="Filter"
                value={experiment.filter}
              />

              <Row
                label="Exit"
                value={experiment.exit}
              />

              <Row
                label="Holding Period"
                value={experiment.holdingPeriod}
              />
            </div>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Hypothesis
              </p>

              <p className="mt-2 leading-6 text-slate-200">
                {experiment.question}
              </p>
            </div>

            <button
              onClick={runExperiment}
              disabled={isRunning}
              className="mt-6 w-full rounded-xl bg-emerald-600 py-3 font-semibold transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRunning
                ? "Running Experiment..."
                : "Run Experiment →"}
            </button>
          </section>
        )}

        {/* TEST + LEARN */}
        {showResults && (
          <section className="mt-8 rounded-2xl border border-blue-500/30 bg-slate-900 p-6">

            <p className="mb-2 text-sm font-semibold tracking-wide text-blue-400">
              05 · TEST
            </p>

            <h2 className="text-2xl font-semibold">
              Experiment Results
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Results from a simulated research dataset.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Trades Tested"
                value="126"
              />

              <MetricCard
                label="Winning Trades"
                value="71"
              />

              <MetricCard
                label="Win Rate"
                value="56.3%"
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <MetricCard
                label="Average Return"
                value="+0.42%"
              />

              <MetricCard
                label="Test Type"
                value="Simulated"
              />
            </div>

            {/* LEARN */}
            <div className="mt-10">
              <p className="mb-2 text-sm font-semibold tracking-wide text-emerald-400">
                06 · LEARN
              </p>

              <h2 className="text-2xl font-semibold">
                What did we learn?
              </h2>

              <div className="mt-6 space-y-4">

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                  <h3 className="font-semibold">
                    What the data shows
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    In the simulated dataset, the strategy produced
                    a positive average return of 0.42% across
                    126 tested trades, with a 56.3% win rate.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                  <h3 className="font-semibold">
                    What we can reasonably conclude
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    The sample suggests a possible positive edge,
                    but this evidence is not sufficient to conclude
                    that the strategy will consistently work in
                    live markets.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                  <h3 className="font-semibold">
                    What should we investigate next?
                  </h3>

                  <ul className="mt-3 space-y-2 text-sm text-slate-400">
                    <li>
                      → Test different holding periods
                    </li>

                    <li>
                      → Compare high vs low volatility
                    </li>

                    <li>
                      → Include transaction costs and slippage
                    </li>

                    <li>
                      → Test another market period
                    </li>
                  </ul>
                </div>

              </div>
            </div>

            <button
              onClick={startNewResearch}
              className="mt-8 w-full rounded-xl border border-slate-700 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Start New Research
            </button>
          </section>
        )}

        <footer className="mt-10 pb-5 text-center text-sm text-slate-500">
          AI-assisted research prototype • Not financial advice
        </footer>

      </div>
    </main>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p className="mt-2 font-medium text-slate-200">
        {value}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="font-medium text-slate-200">
        {value}
      </span>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}