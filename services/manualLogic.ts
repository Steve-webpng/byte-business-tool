
import { ManualToolConfig } from "../types";

export const MANUAL_TOOLS: Record<string, ManualToolConfig> = {
  // --- Business Math ---
  'bmath-1': { // Discount Calculator
    inputs: [
      { name: 'price', label: 'Original Price ($)', type: 'number' },
      { name: 'discount', label: 'Discount (%)', type: 'number' }
    ],
    execute: (vals) => {
      const price = parseFloat(vals.price);
      const discount = parseFloat(vals.discount);
      const saved = price * (discount / 100);
      const final = price - saved;
      return `### Discount Calculation\n\n| Item | Value |\n|---|---|\n| Original Price | $${price.toFixed(2)} |\n| Discount | ${discount}% |\n| **Amount Saved** | **$${saved.toFixed(2)}** |\n| **Final Price** | **$${final.toFixed(2)}** |`;
    }
  },
  'bmath-2': { // Sales Tax
    inputs: [
      { name: 'amount', label: 'Subtotal ($)', type: 'number' },
      { name: 'tax', label: 'Tax Rate (%)', type: 'number' }
    ],
    execute: (vals) => {
        const amt = parseFloat(vals.amount);
        const tax = parseFloat(vals.tax);
        const taxAmt = amt * (tax / 100);
        return `### Tax Calculation\n\n- Subtotal: $${amt.toFixed(2)}\n- Tax Rate: ${tax}%\n- Tax Amount: $${taxAmt.toFixed(2)}\n\n**Total: $${(amt + taxAmt).toFixed(2)}**`;
    }
  },
  'bmath-3': { // Commission
    inputs: [
        { name: 'sales', label: 'Total Sales ($)', type: 'number' },
        { name: 'rate', label: 'Commission Rate (%)', type: 'number' }
    ],
    execute: (vals) => {
        const sales = parseFloat(vals.sales);
        const rate = parseFloat(vals.rate);
        const comm = sales * (rate / 100);
        return `### Commission Calculation\n\nFor sales of $${sales.toLocaleString()} at a rate of ${rate}%:\n\n**Commission Earned: $${comm.toLocaleString(undefined, {minimumFractionDigits: 2})}**`;
    }
  },
  'bmath-5': { // ROI
    inputs: [
        { name: 'initial', label: 'Initial Investment ($)', type: 'number' },
        { name: 'final', label: 'Final Value ($)', type: 'number' }
    ],
    execute: (vals) => {
        const init = parseFloat(vals.initial);
        const final = parseFloat(vals.final);
        const roi = ((final - init) / init) * 100;
        return `### ROI Analysis\n\n- Invested: $${init.toLocaleString()}\n- Returned: $${final.toLocaleString()}\n- Profit/Loss: $${(final - init).toLocaleString()}\n\n**ROI: ${roi.toFixed(2)}%**`;
    }
  },
  'bmath-6': { // CAGR
    inputs: [
      { name: 'start_val', label: 'Start Value ($)', type: 'number' },
      { name: 'end_val', label: 'End Value ($)', type: 'number' },
      { name: 'years', label: 'Number of Years', type: 'number' }
    ],
    execute: (vals) => {
      const start = parseFloat(vals.start_val);
      const end = parseFloat(vals.end_val);
      const years = parseFloat(vals.years);
      if (years <= 0) return "Years must be greater than 0";
      const cagr = (Math.pow(end / start, 1 / years) - 1) * 100;
      return `### CAGR Calculation\n\nOver ${years} years growing from $${start} to $${end}:\n\n**CAGR: ${cagr.toFixed(2)}%**`;
    }
  },
  'bmath-7': { // Salary Converter
    inputs: [
        { name: 'amount', label: 'Amount ($)', type: 'number' },
        { name: 'type', label: 'Type (hourly/yearly)', type: 'text', placeholder: 'hourly or yearly' }
    ],
    execute: (vals) => {
        const amount = parseFloat(vals.amount);
        const type = (vals.type || '').toLowerCase();
        const weeks = 52;
        const hours = 40;
        
        if (type.includes('hour')) {
            const yearly = amount * hours * weeks;
            const monthly = yearly / 12;
            return `### Salary Conversion\n\n**Hourly Rate: $${amount.toFixed(2)}**\n\n- Weekly: $${(amount * hours).toLocaleString()}\n- Monthly: $${monthly.toLocaleString(undefined, {maximumFractionDigits: 0})}\n- **Yearly: $${yearly.toLocaleString()}**`;
        } else {
            const hourly = amount / weeks / hours;
            const monthly = amount / 12;
            return `### Salary Conversion\n\n**Yearly Salary: $${amount.toLocaleString()}**\n\n- Monthly: $${monthly.toLocaleString(undefined, {maximumFractionDigits: 0})}\n- Weekly: $${(amount / weeks).toLocaleString(undefined, {maximumFractionDigits: 0})}\n- **Hourly: $${hourly.toFixed(2)}**`;
        }
    }
  },
  'bmath-8': { // Inflation
    inputs: [
        { name: 'amount', label: 'Amount ($)', type: 'number' },
        { name: 'years', label: 'Years', type: 'number' },
        { name: 'rate', label: 'Inflation Rate (%)', type: 'number', placeholder: '3' }
    ],
    execute: (vals) => {
        const amt = parseFloat(vals.amount);
        const years = parseFloat(vals.years);
        const rate = parseFloat(vals.rate || '3');
        const futureVal = amt * Math.pow(1 + (rate/100), years);
        const presentVal = amt / Math.pow(1 + (rate/100), years);
        
        return `### Inflation Adjuster (${rate}%)\n\n**Input: $${amt.toLocaleString()}**\n\n- Future Value (in ${years} years): **$${futureVal.toLocaleString(undefined, {maximumFractionDigits: 2})}**\n  *(What you need to equal today's purchasing power)*\n\n- Present Value (reversed ${years} years): **$${presentVal.toLocaleString(undefined, {maximumFractionDigits: 2})}**\n  *(What today's money was worth back then)*`;
    }
  },

  // --- Calculators ---
  'calc-1': { // Break-Even
      inputs: [
          { name: 'fixed', label: 'Fixed Costs ($)', type: 'number' },
          { name: 'variable', label: 'Variable Cost per Unit ($)', type: 'number' },
          { name: 'price', label: 'Price per Unit ($)', type: 'number' }
      ],
      execute: (vals) => {
          const fixed = parseFloat(vals.fixed);
          const variable = parseFloat(vals.variable);
          const price = parseFloat(vals.price);
          const contribution = price - variable;
          
          if (contribution <= 0) return "Error: Price must be higher than variable cost to ever break even.";
          
          const units = Math.ceil(fixed / contribution);
          const revenue = units * price;
          
          return `### Break-Even Analysis\n\nTo cover fixed costs of $${fixed.toLocaleString()}:\n\n| Metric | Value |\n|---|---|\n| Contribution Margin | $${contribution.toFixed(2)} / unit |\n| **Break-Even Units** | **${units.toLocaleString()} units** |\n| **Break-Even Revenue** | **$${revenue.toLocaleString()}** |`;
      }
  },
  'calc-2': { // Gross Margin
      inputs: [
          { name: 'revenue', label: 'Revenue ($)', type: 'number' },
          { name: 'cogs', label: 'Cost of Goods Sold ($)', type: 'number' }
      ],
      execute: (vals) => {
          const rev = parseFloat(vals.revenue);
          const cogs = parseFloat(vals.cogs);
          const grossProfit = rev - cogs;
          const margin = (grossProfit / rev) * 100;
          return `### Margin Analysis\n\n- Revenue: $${rev.toLocaleString()}\n- COGS: $${cogs.toLocaleString()}\n\n**Gross Profit: $${grossProfit.toLocaleString()}**\n**Gross Margin: ${margin.toFixed(2)}%**`;
      }
  },
  'calc-3': { // CAC / LTV
      inputs: [
          { name: 'spend', label: 'Marketing Spend ($)', type: 'number' },
          { name: 'customers', label: 'New Customers Acquired', type: 'number' },
          { name: 'ltv', label: 'Lifetime Value ($)', type: 'number' }
      ],
      execute: (vals) => {
          const spend = parseFloat(vals.spend);
          const customers = parseFloat(vals.customers);
          const ltv = parseFloat(vals.ltv);
          const cac = spend / customers;
          const ratio = ltv / cac;
          
          let verdict = ratio >= 3 ? "Healthy (Keep growing!)" : ratio >= 1 ? "Okay (Needs optimization)" : "Unhealthy (Losing money)";
          
          return `### Unit Economics\n\n- CAC: $${cac.toFixed(2)}\n- LTV: $${ltv.toFixed(2)}\n\n**LTV:CAC Ratio = ${ratio.toFixed(2)}**\n*Verdict: ${verdict}*`;
      }
  },
  'calc-4': { // Burn Rate
      inputs: [
          { name: 'cash', label: 'Cash Balance ($)', type: 'number' },
          { name: 'expenses', label: 'Monthly Burn ($)', type: 'number' }
      ],
      execute: (vals) => {
          const cash = parseFloat(vals.cash);
          const burn = parseFloat(vals.expenses);
          const months = cash / burn;
          return `### Runway Calculator\n\nWith $${cash.toLocaleString()} in the bank and burning $${burn.toLocaleString()}/mo:\n\n**Runway: ${months.toFixed(1)} Months**`;
      }
  },
  'calc-6': { // Meeting Cost
      inputs: [
          { name: 'attendees', label: 'Number of Attendees', type: 'number' },
          { name: 'rate', label: 'Avg Hourly Rate ($)', type: 'number' },
          { name: 'duration', label: 'Duration (Minutes)', type: 'number' }
      ],
      execute: (vals) => {
          const count = parseFloat(vals.attendees);
          const rate = parseFloat(vals.rate);
          const mins = parseFloat(vals.duration);
          const cost = count * rate * (mins / 60);
          return `### Meeting Cost\n\nThis ${mins}-minute meeting with ${count} people costs:\n\n# $${cost.toFixed(2)}`;
      }
  },
  'calc-8': { // CPM
      inputs: [
          { name: 'spend', label: 'Total Spend ($)', type: 'number' },
          { name: 'impressions', label: 'Total Impressions', type: 'number' }
      ],
      execute: (vals) => {
          const spend = parseFloat(vals.spend);
          const imps = parseFloat(vals.impressions);
          const cpm = (spend / imps) * 1000;
          return `### CPM Calculator\n\nCost Per Mille (1,000 impressions):\n\n**$${cpm.toFixed(2)}**`;
      }
  },

  // --- Finance ---
  'fin-5': { // Loan Amortization (Simple)
      inputs: [
          { name: 'amount', label: 'Loan Amount ($)', type: 'number' },
          { name: 'rate', label: 'Annual Interest Rate (%)', type: 'number' },
          { name: 'years', label: 'Loan Term (Years)', type: 'number' }
      ],
      execute: (vals) => {
          const principal = parseFloat(vals.amount);
          const annualRate = parseFloat(vals.rate) / 100;
          const years = parseFloat(vals.years);
          const monthlyRate = annualRate / 12;
          const numPayments = years * 12;
          
          const monthlyPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments));
          const totalPaid = monthlyPayment * numPayments;
          const totalInterest = totalPaid - principal;
          
          return `### Loan Summary\n\n- Principal: $${principal.toLocaleString()}\n- Term: ${years} Years (${numPayments} months)\n- Rate: ${vals.rate}%\n\n**Monthly Payment: $${monthlyPayment.toFixed(2)}**\n\n**Total Payback: $${totalPaid.toLocaleString(undefined, {maximumFractionDigits: 2})}**\n**Total Interest: $${totalInterest.toLocaleString(undefined, {maximumFractionDigits: 2})}**`;
      }
  },
  'fin-7': { // NPV
      inputs: [
          { name: 'rate', label: 'Discount Rate (%)', type: 'number' },
          { name: 'initial', label: 'Initial Investment ($)', type: 'number', placeholder: 'Negative number e.g. -1000' },
          { name: 'flows', label: 'Cash Flows (comma separated)', type: 'text', placeholder: '200, 300, 400, 500' }
      ],
      execute: (vals) => {
          const r = parseFloat(vals.rate) / 100;
          const init = parseFloat(vals.initial);
          const flows = (vals.flows || '').split(',').map((f: string) => parseFloat(f.trim()));
          
          let npv = init;
          flows.forEach((cf: number, i: number) => {
              npv += cf / Math.pow(1 + r, i + 1);
          });
          
          return `### Net Present Value (NPV)\n\nDiscount Rate: ${vals.rate}%\n\n**NPV: $${npv.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}**\n\n*${npv > 0 ? "Project is likely profitable." : "Project may result in a loss."}*`;
      }
  },

  // --- Utilities ---
  'util-1': { // Case Converter
      inputs: [
          { name: 'text', label: 'Text to Convert', type: 'textarea' }
      ],
      execute: (vals) => {
          const t = vals.text || '';
          return `### Case Conversions\n\n- **UPPERCASE:** ${t.toUpperCase()}\n- **lowercase:** ${t.toLowerCase()}\n- **Title Case:** ${t.replace(/\w\S*/g, (w: string) => (w.replace(/^\w/, (c) => c.toUpperCase())))}\n- **CamelCase:** ${t.replace(/(?:^\w|[A-Z]|\b\w)/g, (w: string, i: number) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '')}\n- **Snake_Case:** ${t.replace(/\s+/g, '_').toLowerCase()}`;
      }
  },
  'util-4': { // Word Counter
      inputs: [
          { name: 'text', label: 'Text to Analyze', type: 'textarea' }
      ],
      execute: (vals) => {
          const t = vals.text || '';
          const words = t.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
          const chars = t.length;
          const charsNoSpace = t.replace(/\s/g, '').length;
          const sentences = t.split(/[.!?]+/).filter((s: string) => s.length > 0).length;
          const readingTime = Math.ceil(words / 200); 
          
          return `### Text Statistics\n\n| Metric | Count |\n|---|---|\n| Words | ${words} |\n| Characters (with spaces) | ${chars} |\n| Characters (no spaces) | ${charsNoSpace} |\n| Sentences | ${sentences} |\n| Est. Reading Time | ~${readingTime} min |`;
      }
  },
  'util-6': { // Slug Gen
      inputs: [ { name: 'text', label: 'Title', type: 'text' } ],
      execute: (vals) => {
          const t = vals.text || '';
          const slug = t.toLowerCase().trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
          return `**Generated Slug:**\n\`${slug}\``;
      }
  },
  'util-7': { // Markdown Table Builder (Manual)
      inputs: [ { name: 'csv', label: 'CSV Data (Comma Separated)', type: 'textarea', placeholder: "Name,Age,Role\nJohn,25,Dev\nJane,30,Designer" } ],
      execute: (vals) => {
          const lines = (vals.csv || '').trim().split('\n');
          if (lines.length === 0) return "No data";
          
          const headers = lines[0].split(',');
          let md = `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |`;
          
          for(let i=1; i<lines.length; i++) {
              md += `\n| ${lines[i].split(',').join(' | ')} |`;
          }
          return md;
      }
  }
};