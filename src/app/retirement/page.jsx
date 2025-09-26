"use client";

import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";

function formatCurrencyIndian(number) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
      Number.isFinite(number) ? number : 0
    );
  } catch {
    return `₹${Math.round(number || 0).toLocaleString("en-IN")}`;
  }
}

function projectRetirement({
  currentAge,
  retirementAge,
  lifeExpectancy,
  currentCorpus,
  monthlyContribution,
  expectedReturnPre,
  expectedReturnPost,
  inflationRate,
  currentMonthlyExpense,
}) {
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const yearsInRetirement = Math.max(0, lifeExpectancy - retirementAge);

  const rPre = expectedReturnPre / 100;
  const rPost = expectedReturnPost / 100;
  const infl = inflationRate / 100;

  // Accumulation phase
  let corpus = currentCorpus;
  const history = [];
  for (let y = 0; y <= yearsToRetirement; y++) {
    if (y > 0) {
      corpus = corpus * (1 + rPre) + monthlyContribution * 12; // yearly compounding
    }
    history.push({
      year: new Date().getFullYear() + y,
      age: currentAge + y,
      corpus: Math.max(0, Math.round(corpus)),
      phase: "pre",
    });
  }

  // Required expense at retirement adjusted for inflation
  const expenseAtRetirement = currentMonthlyExpense * Math.pow(1 + infl, yearsToRetirement);

  // Drawdown phase
  let corpusAtRetirement = corpus;
  let corpusSeries = [];
  let shortfallYear = null;
  for (let y = 1; y <= yearsInRetirement; y++) {
    // grow for the year, then withdraw inflated expenses
    corpusAtRetirement = corpusAtRetirement * (1 + rPost) - expenseAtRetirement * Math.pow(1 + infl, y - 1) * 12;
    if (corpusAtRetirement <= 0 && shortfallYear === null) {
      shortfallYear = y;
      corpusAtRetirement = 0;
    }
    history.push({
      year: new Date().getFullYear() + yearsToRetirement + y,
      age: retirementAge + y,
      corpus: Math.max(0, Math.round(corpusAtRetirement)),
      phase: "post",
    });
    corpusSeries.push(corpusAtRetirement);
  }

  return {
    history,
    yearsToRetirement,
    yearsInRetirement,
    expenseAtRetirement,
    shortfallYear,
    finalCorpus: corpusAtRetirement,
  };
}

export default function RetirementPage() {
  const [inputs, setInputs] = useState({
    currentAge: 30,
    retirementAge: 60,
    lifeExpectancy: 85,
    currentCorpus: 300000,
    monthlyContribution: 15000,
    expectedReturnPre: 10,
    expectedReturnPost: 6,
    inflationRate: 5,
    currentMonthlyExpense: 40000,
  });

  const result = useMemo(() => projectRetirement(inputs), [inputs]);

  const accumulationData = useMemo(
    () => result.history.filter((d) => d.phase === "pre").map((d) => ({ year: d.year, corpus: d.corpus })),
    [result.history]
  );
  const drawdownData = useMemo(
    () => result.history.filter((d) => d.phase === "post").map((d) => ({ year: d.year, corpus: d.corpus })),
    [result.history]
  );

  const insights = useMemo(() => {
    const needPerYearAtRet = inputs.currentMonthlyExpense * Math.pow(1 + inputs.inflationRate / 100, result.yearsToRetirement) * 12;
    const swr = inputs.expectedReturnPost / 100 - inputs.inflationRate / 100;
    const suggestedCorpus = swr > 0 ? needPerYearAtRet / swr : Infinity;
    const gap = Math.max(0, Math.round(suggestedCorpus - (accumulationData.at(-1)?.corpus || 0)));

    return [
      {
        title: "Inflation-adjusted expenses at retirement",
        value: formatCurrencyIndian(Math.round(result.expenseAtRetirement)),
        hint: "Your current monthly spending grown by inflation until retirement",
      },
      {
        title: "Corpus at retirement",
        value: formatCurrencyIndian(accumulationData.at(-1)?.corpus /10|| 0),
        hint: "Projected savings at your retirement age",
      },
      {
        title: "Safe withdrawal need (per year)",
        value: formatCurrencyIndian(Math.round(needPerYearAtRet)),
        hint: "Estimated annual expenses in first year of retirement",
      },
      {
        title: "Suggested corpus (rule-of-thumb)",
        value: Number.isFinite(suggestedCorpus)/10 ? formatCurrencyIndian(Math.round(suggestedCorpus)/10) : "N/A",
        hint: "Using real return ≈ post-return − inflation",
      },
      {
        title: "Shortfall year",
        value: result.shortfallYear ? `Age ${inputs.retirementAge + result.shortfallYear}` : "No shortfall",
        hint: "When corpus could run out during retirement",
      },
      {
        title: "Gap to suggested corpus",
        value: gap > 0 ? formatCurrencyIndian(gap/10) : "On track",
        hint: "How much more you may need to accumulate",
      },
    ];
  }, [inputs, result, accumulationData]);

  function handleChange(e) {
    const { name, value } = e.target;
    const numeric = Number(value);
    setInputs((prev) => ({ ...prev, [name]: Number.isFinite(numeric) ? numeric : prev[name] }));
  }

  return (
    <div className="p-12">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Retirement Security</h1>
        <a href="/dashboard" className="group flex items-center gap-2 border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 hover:shadow-md">
    <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
    Back to Dashboard
</a>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">Plan your retirement with inflation-aware projections, drawdown modeling, and clear insights.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white border border-gray-200 rounded-xl p-4 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Inputs</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Current Age</label>
              <input className="form-input" type="number" name="currentAge" value={inputs.currentAge} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Retirement Age</label>
              <input className="form-input" type="number" name="retirementAge" value={inputs.retirementAge} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Life Expectancy</label>
              <input className="form-input" type="number" name="lifeExpectancy" value={inputs.lifeExpectancy} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Current Corpus (₹)</label>
              <input className="form-input" type="number" name="currentCorpus" value={inputs.currentCorpus} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Monthly Contribution (₹)</label>
              <input className="form-input" type="number" name="monthlyContribution" value={inputs.monthlyContribution} onChange={handleChange} />
            </div>
            
              <div>
                <label className="text-sm text-gray-700">Return pre-retirement (%)</label>
                <input className="form-input" type="number" name="expectedReturnPre" value={inputs.expectedReturnPre} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Return post-retirement (%)</label>
                <input className="form-input" type="number" name="expectedReturnPost" value={inputs.expectedReturnPost} onChange={handleChange} />
              </div>
          
            
              <div>
                <label className="text-sm text-gray-700">Inflation rate (%)</label>
                <input className="form-input" type="number" name="inflationRate" value={inputs.inflationRate} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Current Monthly Expense</label>
                <input className="form-input" type="number" name="currentMonthlyExpense" value={inputs.currentMonthlyExpense} onChange={handleChange} />
              </div>
            </div>
      
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-4 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Projected Corpus</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...accumulationData, ...drawdownData]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v) => formatCurrencyIndian(v/10)} tick={{ fontSize: 10 }} width={80} />
                <Tooltip formatter={(v) => formatCurrencyIndian(v/10)} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="corpus" name="Corpus" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...accumulationData, ...drawdownData]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v) => formatCurrencyIndian(v/10)} tick={{ fontSize: 10 }} width={80} />
                <Tooltip formatter={(v) => formatCurrencyIndian(v/10)} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="corpus" name="Corpus" stroke="#2563eb" strokeWidth={2} dot={false} />
                {(() => {
                  const needPerYearAtRet = inputs.currentMonthlyExpense * Math.pow(1 + inputs.inflationRate / 100, result.yearsToRetirement) * 12;
                  const swr = inputs.expectedReturnPost / 100 - inputs.inflationRate / 100;
                  const suggestedCorpus = swr > 0 ? needPerYearAtRet / swr : null;
                  if (!suggestedCorpus) return null;
                  const refSeries = [...accumulationData, ...drawdownData].map((d) => ({ ...d, suggested: suggestedCorpus }));
                  return (
                    <Line type="monotone" dataKey="suggested" name="Suggested Corpus" stroke="#ef4444" strokeDasharray="6 6" dot={false} data={refSeries} />
                  );
                })()}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-3">Accumulation vs Drawdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...accumulationData.map((d) => ({ ...d, pre: d.corpus })), ...drawdownData.map((d) => ({ ...d, post: d.corpus }))]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v) => formatCurrencyIndian(v)} tick={{ fontSize: 10 }} width={100} />
                <Tooltip formatter={(v) => formatCurrencyIndian(v)} />
                <Legend />
                <Area type="monotone" dataKey="pre" name="Pre-retirement" stackId="1" stroke="#0ea5e9" fill="#0ea5e922" />
                <Area type="monotone" dataKey="post" name="Post-retirement" stackId="1" stroke="#22c55e" fill="#22c55e22" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((it) => (
          <div key={it.title} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-sm text-gray-600">{it.title}</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">{it.value}</div>
            <div className="text-xs text-gray-500 mt-1">{it.hint}</div>
          </div>
        ))}
      </section>
    </div>
  );
}


