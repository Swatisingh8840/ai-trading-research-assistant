# AI Trading Research Assistant

An AI-powered mini prototype that converts natural-language trading questions into structured research experiments.

## Overview

The AI Trading Research Assistant helps users turn a simple trading idea into a structured experiment.

For example, a user can ask:

> Does buying BANK NIFTY after a 2% fall work for 5 days?

The system uses AI to understand the question and extracts:

- Instrument
- Timeframe
- Entry condition
- Exit condition
- Holding period
- Filters
- Research question

The prototype also handles missing or unclear information by asking the user for clarification instead of making important assumptions.

## Features

- Natural-language trading question input
- AI-powered question understanding
- Structured experiment generation
- Missing-information detection
- Clarification handling
- Entry and exit condition extraction
- Holding-period identification
- Simulated research results
- Research interpretation
- Clean and responsive UI
- Live deployment on Vercel

## Example

### User Question

"Does buying BANK NIFTY after a 2% fall work for 5 days?"

### Structured Experiment

| Field | Result |
|---|---|
| Instrument | BANK NIFTY |
| Timeframe | Daily |
| Entry | BANK NIFTY falls >= 2% |
| Exit | Close position after 5 days |
| Holding Period | 5 days |
| Filter | Not specified |
| Research Question | Does buying BANK NIFTY after a 2% fall have a positive edge? |

## Architecture

```text
User
  |
  v
Next.js Frontend
  |
  v
/api/analyze
  |
  v
OpenAI Responses API
  |
  v
Structured JSON Experiment
  |
  v
Frontend
  |
  +--> Experiment Definition
  |
  +--> Simulated Test Results
  |
  +--> Research Insights