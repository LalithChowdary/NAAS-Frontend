const fs = require('fs');

const file = 'app/staff/dp/profile/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the calculation line
content = content.replace(
  "const monthEarnings = (currentMonthHistory.length * 2.5).toFixed(2);",
  `const monthEarnings = currentMonthHistory.reduce((sum: number, d: any) => sum + (d.payout || 0), 0).toFixed(2);`
);

// Replace the display in the commission label section
content = content.replace(
  "<p className=\"text-sm font-medium text-slate-900\">₹2.50 / unit</p>",
  "<p className=\"text-sm font-medium text-slate-900\">2.5% of value</p>"
);

fs.writeFileSync(file, content, 'utf8');
