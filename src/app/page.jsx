"use client";

import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 rounded bg-blue-600" />
            <span className="text-xl font-bold text-gray-900">Planora</span>
          </div>
          <div className="space-x-4">
            <a href="#features" className="text-gray-700 hover:text-gray-900">Features</a>
            <a href="#how" className="text-gray-700 hover:text-gray-900">How it works</a>
            <a href="#faq" className="text-gray-700 hover:text-gray-900">FAQ</a>
            <a href="/auth" className="ml-4 inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Get Started</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Plan, Save and Achieve your Child's College Goals
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Personalized projections, smart recommendations, and a clear path to fund education.
          </p>
          <div className="mt-8 flex items-center space-x-4">
            <a href="/auth" className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Get Started</a>
            <a href="#features" className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Learn more</a>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <div className="text-2xl font-bold text-blue-700">529</div>
              <div className="text-sm text-gray-600">Plan Insights</div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <div className="text-2xl font-bold text-blue-700">+7%</div>
              <div className="text-sm text-gray-600">Projected Return</div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <div className="text-2xl font-bold text-blue-700">$25k</div>
              <div className="text-sm text-gray-600">Goal Coverage</div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <div className="text-2xl font-bold text-blue-700">4 yrs</div>
              <div className="text-sm text-gray-600">Cost Projection</div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 pb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Smart Recommendations","Clear Projections","Actionable Strategies"].map((title, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="text-lg font-semibold text-gray-900">{title}</div>
            <div className="mt-2 text-sm text-gray-600">Built-in analytics tailor your plan to your family's needs.</div>
          </div>
        ))}
      </section>
    </div>
  );
}
