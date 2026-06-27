const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  // Tailwind colors
  ['bg-blue-', 'bg-green-'],
  ['text-blue-', 'text-green-'],
  ['border-blue-', 'border-green-'],
  ['ring-blue-', 'ring-green-'],
  ['shadow-blue-', 'shadow-green-'],
  ['fill-blue-', 'fill-green-'],
  ['from-blue-', 'from-green-'],
  ['to-blue-', 'to-green-'],
  ['via-blue-', 'via-green-'],
  ['bg-blue-50/50', 'bg-green-50/50'],
  ['bg-blue-50/30', 'bg-green-50/30'],
  ['bg-blue-500/20', 'bg-green-500/20'],
  ['bg-blue-900/30', 'bg-green-900/30'],

  // Tailwind Arbitrary
  ['dark:bg-[#1e293b]', 'dark:bg-[var(--card-bg)]'],
  ['dark:bg-[#0f172a]', 'dark:bg-[var(--page-bg)]'],
  ['dark:border-[#334155]', 'dark:border-[var(--card-border)]'],
  ['dark:border-[#475569]', 'dark:border-[var(--card-border)]'],
  ['dark:text-slate-400', 'dark:text-[var(--text-muted)]'],
  ['dark:text-slate-300', 'dark:text-[var(--text-primary)]'],
  ['dark:text-white', 'dark:text-[var(--text-primary)]'],
  ['dark:text-slate-200', 'dark:text-[var(--text-primary)]'],
  ['dark:border-slate-800', 'dark:border-[var(--card-border)]'],
  ['dark:border-slate-700', 'dark:border-[var(--card-border)]'],
  ['dark:bg-slate-800/30', 'dark:bg-[var(--card-bg)]'],
  ['dark:bg-slate-800', 'dark:bg-[var(--card-bg)]'],
  ['dark:bg-slate-700/50', 'dark:bg-[var(--card-bg)]'],
  ['dark:bg-slate-700', 'dark:bg-[var(--card-bg)]'],
  ['dark:bg-slate-900', 'dark:bg-[var(--page-bg)]'],

  // Hex codes (Blue to Green)
  ['#3b82f6', '#16a34a'],
  ['#2563eb', '#15803d'],
  ['#1d4ed8', '#14532d'],
  ['#2d79f3', '#16a34a'],
  ['#1e3a8a', '#14532d'],
  ['#eff6ff', '#f0fdf4'],

  // Styled Components / CSS hardcodes
  ['background: #1e293b', 'background: var(--card-bg)'],
  ['background: #0f172a', 'background: var(--page-bg)'],
  ['background-color: #1e293b', 'background-color: var(--card-bg)'],
  ['background-color: #0f172a', 'background-color: var(--page-bg)'],
  ['border-color: #334155', 'border-color: var(--card-border)'],
  ['border-color: #475569', 'border-color: var(--card-border)'],
  ['color: #cbd5e1', 'color: var(--text-primary)'],
  ['color: #94a3b8', 'color: var(--text-muted)'],
  ['color: #e2e8f0', 'color: var(--text-primary)'],
  ['color: #1e293b', 'color: var(--text-primary)'],
  ['color: #0f172a', 'color: var(--text-primary)']
];

const targetDirs = [
  'c:/Users/alp_t/Desktop/ozel_hoca/src/layouts',
  'c:/Users/alp_t/Desktop/ozel_hoca/src/pages/student',
  'c:/Users/alp_t/Desktop/ozel_hoca/src/pages/tutor',
  'c:/Users/alp_t/Desktop/ozel_hoca/src/pages/admin'
];

targetDirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  walkDir(dir, function(filePath) {
    if (filePath.endsWith('.jsx') && !filePath.includes('PublicLayout.jsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log('Updated: ' + filePath);
      }
    }
  });
});
