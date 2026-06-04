import React from 'react';

const ShareSocialButtons = ({ url, title }) => {
  const shareLinks = [
    {
      name: 'X',
      icon: (
        <svg height="1.2em" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: 'hover:bg-black hover:text-white',
      darkColor: 'dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-white dark:hover:text-black',
      link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      bgColor: 'bg-slate-100'
    },
    {
      name: 'Facebook',
      icon: (
        <svg viewBox="0 0 320 512" height="1.2em" fill="currentColor">
          <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
        </svg>
      ),
      color: 'hover:bg-[#1877f2] hover:text-white',
      darkColor: 'dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#1877f2] dark:hover:text-white',
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      bgColor: 'bg-[#eff6ff]'
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg viewBox="0 0 448 512" height="1.2em" fill="currentColor">
          <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
        </svg>
      ),
      color: 'hover:bg-[#0a66c2] hover:text-white',
      darkColor: 'dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#0a66c2] dark:hover:text-white',
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      bgColor: 'bg-[#f0f9ff]'
    },
    {
      name: 'WhatsApp',
      icon: (
        <svg viewBox="0 0 448 512" height="1.2em" fill="currentColor">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-23.1-115-65.1-157zM223.9 414.8c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 334.3l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-104.2 84.8-189 189.2-189 50.5 0 98 19.7 133.7 55.4s55.4 83.2 55.4 133.7c0 104.3-84.8 189-189 189zm103.6-141.6c-5.7-2.8-33.8-16.7-39-18.6-5.3-1.9-9.1-2.8-12.8 2.8-3.8 5.6-14.7 18.6-18 22.4-3.3 3.8-6.6 4.3-12.3 1.4-5.7-2.8-24.1-8.9-45.9-28.4-17-15.2-28.5-34-31.8-39.7-3.3-5.7-.4-8.8 2.5-11.6 2.5-2.5 5.7-6.6 8.5-9.9 2.8-3.3 3.8-5.7 5.7-9.5 1.9-3.8.9-7.1-.5-9.9-1.4-2.8-12.8-31-17.5-42.5-4.6-11.2-9.3-9.7-12.8-9.9-3.3-.2-7.1-.2-10.9-.2-3.8 0-10 1.4-15.2 7.1-5.2 5.7-19.9 19.5-19.9 47.4 0 28 20.4 55.1 23.2 58.9 2.8 3.8 40.2 61.4 97.4 86 13.6 5.9 24.2 9.4 32.5 12.1 13.7 4.3 26.2 3.7 36 2.3 11-1.6 33.8-13.8 38.6-27.1 4.7-13.3 4.7-24.7 3.3-27.1-1.4-2.4-5.2-3.8-10.9-6.6z" />
        </svg>
      ),
      color: 'hover:bg-[#25D366] hover:text-white',
      darkColor: 'dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#25D366] dark:hover:text-white',
      link: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
      bgColor: 'bg-[#f0fdf4]'
    }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 py-4">
      {shareLinks.map((social) => (
        <a
          key={social.name}
          href={social.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 group transition-all duration-300"
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${social.bgColor} ${social.color} ${social.darkColor} shadow-sm border border-transparent dark:border-slate-700`}>
            {social.icon}
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors uppercase tracking-tight">
            {social.name}
          </span>
        </a>
      ))}
    </div>
  );
};

export default ShareSocialButtons;
