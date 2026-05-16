import React from 'react';
import styled from 'styled-components';

const ShareSocialButtons = () => {
  return (
    <StyledWrapper>
      <ul className="wrapper">
        <li className="social-item twitter">
          <div className="icon">
            <span className="tooltip">X</span>
            <svg height="1.4em" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
          <span className="label">X</span>
        </li>
        <li className="social-item facebook">
          <div className="icon">
            <span className="tooltip">Facebook</span>
            <svg viewBox="0 0 320 512" height="1.2em" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
            </svg>
          </div>
          <span className="label">Facebook</span>
        </li>
        <li className="social-item linkedin">
          <div className="icon">
            <span className="tooltip">LinkedIn</span>
            <svg viewBox="0 0 448 512" height="1.2em" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
            </svg>
          </div>
          <span className="label">LinkedIn</span>
        </li>
        <li className="social-item whatsapp">
          <div className="icon">
            <span className="tooltip">WhatsApp</span>
            <svg viewBox="0 0 448 512" height="1.4em" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-23.1-115-65.1-157zM223.9 414.8c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 334.3l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-104.2 84.8-189 189.2-189 50.5 0 98 19.7 133.7 55.4s55.4 83.2 55.4 133.7c0 104.3-84.8 189-189 189zm103.6-141.6c-5.7-2.8-33.8-16.7-39-18.6-5.3-1.9-9.1-2.8-12.8 2.8-3.8 5.6-14.7 18.6-18 22.4-3.3 3.8-6.6 4.3-12.3 1.4-5.7-2.8-24.1-8.9-45.9-28.4-17-15.2-28.5-34-31.8-39.7-3.3-5.7-.4-8.8 2.5-11.6 2.5-2.5 5.7-6.6 8.5-9.9 2.8-3.3 3.8-5.7 5.7-9.5 1.9-3.8.9-7.1-.5-9.9-1.4-2.8-12.8-31-17.5-42.5-4.6-11.2-9.3-9.7-12.8-9.9-3.3-.2-7.1-.2-10.9-.2-3.8 0-10 1.4-15.2 7.1-5.2 5.7-19.9 19.5-19.9 47.4 0 28 20.4 55.1 23.2 58.9 2.8 3.8 40.2 61.4 97.4 86 13.6 5.9 24.2 9.4 32.5 12.1 13.7 4.3 26.2 3.7 36 2.3 11-1.6 33.8-13.8 38.6-27.1 4.7-13.3 4.7-24.7 3.3-27.1-1.4-2.4-5.2-3.8-10.9-6.6z" />
            </svg>
          </div>
          <span className="label">WhatsApp</span>
        </li>
      </ul>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .wrapper {
    display: inline-flex;
    list-style: none;
    width: 100%;
    padding-top: 15px;
    padding-bottom: 25px;
    font-family: "Poppins", sans-serif;
    justify-content: center;
    gap: 20px;
  }

  .social-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 70px;
    cursor: pointer;
  }

  .label {
    font-size: 13px;
    color: #64748b;
    font-weight: 600;
    transition: color 0.3s ease;
  }

  .wrapper .icon {
    position: relative;
    border-radius: 18px; /* Tam yuvarlak değil, şık bir squircle (kare-yuvarlak) */
    width: 64px;
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 2px solid transparent;
  }

  .wrapper .tooltip {
    position: absolute;
    top: 0;
    font-size: 13px;
    font-weight: 600;
    background: #1e293b;
    color: #fff;
    padding: 6px 12px;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    white-space: nowrap;
    z-index: 10;
  }

  .wrapper .tooltip::before {
    position: absolute;
    content: "";
    height: 8px;
    width: 8px;
    background: #1e293b;
    bottom: -3px;
    left: 50%;
    transform: translate(-50%) rotate(45deg);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  /* Hover Animations */
  .social-item:hover .icon {
    transform: translateY(-6px) scale(1.05);
    box-shadow: 0 15px 25px -5px rgba(0, 0, 0, 0.15);
  }

  .social-item:hover .icon .tooltip {
    top: -48px;
    opacity: 1;
    visibility: visible;
  }

  /* X (Twitter) Theme */
  .wrapper .twitter .icon {
    color: #0f1419;
    background: #f1f5f9;
  }
  .wrapper .twitter:hover .icon {
    background: #0f1419;
    color: #ffffff;
    border-color: #0f1419;
    box-shadow: 0 10px 20px -5px rgba(15, 20, 25, 0.4);
  }
  .wrapper .twitter:hover .label { color: #0f1419; }

  /* Facebook Theme */
  .wrapper .facebook .icon {
    color: #1877f2;
    background: #eff6ff; /* Hafif mavi arka plan */
  }
  .wrapper .facebook:hover .icon {
    background: #1877f2;
    color: #ffffff;
    border-color: #1877f2;
    box-shadow: 0 10px 20px -5px rgba(24, 119, 242, 0.4);
  }
  .wrapper .facebook:hover .label { color: #1877f2; }

  /* LinkedIn Theme */
  .wrapper .linkedin .icon {
    color: #0a66c2;
    background: #f0f9ff;
  }
  .wrapper .linkedin:hover .icon {
    background: #0a66c2;
    color: #ffffff;
    border-color: #0a66c2;
    box-shadow: 0 10px 20px -5px rgba(10, 102, 194, 0.4);
  }
  .wrapper .linkedin:hover .label { color: #0a66c2; }

  /* WhatsApp Theme */
  .wrapper .whatsapp .icon {
    color: #25D366;
    background: #f0fdf4;
  }
  .wrapper .whatsapp:hover .icon {
    background: #25D366;
    color: #ffffff;
    border-color: #25D366;
    box-shadow: 0 10px 20px -5px rgba(37, 211, 102, 0.4);
  }
  .wrapper .whatsapp:hover .label { color: #25D366; }
`;

export default ShareSocialButtons;
