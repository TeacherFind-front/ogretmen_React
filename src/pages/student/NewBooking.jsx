import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Monitor,
  Home as HomeIcon,
  BookOpen,
  Globe,
  Zap,
} from "lucide-react";
import { getTutorById } from "@/services/tutorService";
import { createBooking } from "@/services/bookingService";
import { apiFetch } from "@/services/api";
import { useAuth } from "@/store/AuthContext";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────── */
/* ANIMATIONS                                  */
/* ─────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:translateY(0); }
`;
const spin = keyframes`
  to { transform:rotate(360deg); }
`;
const pulseAnim = keyframes`
  0%,100% { transform:scale(1); }
  50%      { transform:scale(1.06); }
`;

/* ─────────────────────────────────────────── */
/* LAYOUT                                      */
/* ─────────────────────────────────────────── */
const Wrap = styled.div`
  min-height: 100vh;
  background: var(--page-bg);
  padding: 28px 16px 72px;
  box-sizing: border-box;
  @media (max-width: 600px) {
    padding: 16px 10px 60px;
  }
`;

const Inner = styled.div`
  max-width: 1080px;
  width: 100%;
  margin: 0 auto;
  animation: ${fadeUp} 0.45s ease both;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;

  h1 {
    font-size: clamp(18px, 3vw, 24px);
    font-weight: 900;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.2;
  }
  p {
    font-size: 13px;
    color: var(--text-muted);
    margin: 3px 0 0;
  }
`;

const BackBtn = styled.button`
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 12px;
  border: 1.5px solid var(--card-border);
  background: var(--card-bg);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    color: hsl(var(--primary));
    border-color: hsl(var(--primary) / 0.5);
  }
`;

/* Two-column grid – sidebar goes below on mobile */
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const FormCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0; /* prevent overflow */
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;

  @media (max-width: 900px) {
    /* Show sidebar BELOW the form on mobile */
    order: 1;
  }
`;

/* ─────────────────────────────────────────── */
/* STEP CARD                                   */
/* ─────────────────────────────────────────── */
const Card = styled.div`
  background: var(--card-bg);
  border: 1.5px solid var(--card-border);
  border-radius: 20px;
  padding: 22px 20px;
  overflow: hidden;
  @media (max-width: 480px) {
    padding: 16px 14px;
    border-radius: 16px;
  }
`;

const CardHead = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
`;

const Num = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 9px;
  background: ${(p) =>
    p.$ghost ? "hsl(var(--accent))" : "hsl(var(--primary))"};
  color: ${(p) =>
    p.$ghost
      ? "hsl(var(--accent-foreground))"
      : "hsl(var(--primary-foreground))"};
  font-size: 12px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
`;

/* ─────────────────────────────────────────── */
/* LESSON CARDS                                */
/* ─────────────────────────────────────────── */
const LessonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 12px;
  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: 9px;
  }
`;

const LessonCard = styled.button`
  position: relative;
  padding: 16px 14px;
  border-radius: 16px;
  border: 2px solid
    ${(p) => (p.$active ? "hsl(var(--primary))" : "var(--card-border)")};
  background: ${(p) =>
    p.$active ? "hsl(var(--primary)/.09)" : "var(--page-bg)"};
  cursor: pointer;
  text-align: left;
  transition: all 0.22s;
  &:hover {
    border-color: hsl(var(--primary));
    transform: translateY(-2px);
    box-shadow: 0 6px 18px hsl(var(--primary) / 0.1);
  }

  .ic {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: hsl(var(--primary) / 0.13);
    color: hsl(var(--primary));
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
  }
  .chk {
    position: absolute;
    top: 10px;
    right: 10px;
    color: hsl(var(--primary));
  }
  .name {
    font-size: 13px;
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1.3;
    margin-bottom: 3px;
  }
  .meta {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 8px;
  }
  .badges {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
  }
  .bdg {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 5px;
    &.on {
      background: #dbeafe;
      color: #1d4ed8;
    }
    &.ip {
      background: #ffedd5;
      color: #c2410c;
    }
    &.gn {
      background: hsl(var(--secondary));
      color: hsl(var(--secondary-foreground));
    }
    .dark &.on {
      background: hsl(220 70% 25%/0.4);
      color: #93c5fd;
    }
    .dark &.ip {
      background: hsl(25 80% 25%/0.4);
      color: #fdba74;
    }
  }
`;

/* ─────────────────────────────────────────── */
/* WEEKLY CALENDAR                             */
/* ─────────────────────────────────────────── */
const LegendRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin-bottom: 12px;

  .leg {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 9px;
    font-weight: 800;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .dot {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    border: 1.5px solid transparent;
    &.on {
      background: #2563eb;
    }
    &.ip {
      background: #ea580c;
    }
    &.bt {
      background: hsl(var(--primary));
    }
    &.em {
      background: transparent;
      border-color: var(--card-border);
    }
  }
`;

const SchedWrap = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--card-border) transparent;
  border-radius: 12px;
  background: var(--page-bg);
  border: 1px solid var(--card-border);
  padding: 10px;

  table {
    border-collapse: separate;
    border-spacing: 3px;
    min-width: 750px;
    width: 100%;
    table-layout: fixed;
  }
  th {
    font-size: 10px;
    font-weight: 800;
    color: var(--text-muted);
    text-transform: uppercase;
    padding-bottom: 5px;
    text-align: center;
    &.cor {
      text-align: left;
      width: 180px;
    }
  }
  td.lbl {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-muted);
    white-space: nowrap;
    padding: 3px 5px;
  }
  .cell {
    height: 28px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid transparent;
    &.on {
      background: #2563eb;
      color: white;
    }
    &.ip {
      background: #ea580c;
      color: white;
    }
    &.bt {
      background: hsl(var(--primary));
      color: white;
    }
    &.em {
      background: transparent;
      border-color: var(--card-border);
    }
  }
`;

/* ─────────────────────────────────────────── */
/* TYPE SELECTOR                               */
/* ─────────────────────────────────────────── */
const TypeRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const TypeBtn = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 14px;
  border-radius: 16px;
  border: 2px solid
    ${(p) => (p.$active ? "hsl(var(--primary))" : "var(--card-border)")};
  background: ${(p) =>
    p.$active ? "hsl(var(--primary)/.09)" : "var(--card-bg)"};
  cursor: ${(p) => (p.$dis ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$dis ? 0.5 : 1)};
  transition: all 0.2s;
  text-align: left;

  &:hover:not([disabled]) {
    border-color: hsl(var(--primary));
    transform: translateY(-1px);
  }

  .ti {
    width: 38px;
    height: 38px;
    border-radius: 11px;
    flex-shrink: 0;
    background: ${(p) =>
      p.$active ? "hsl(var(--primary))" : "hsl(var(--muted))"};
    color: ${(p) =>
      p.$active ? "hsl(var(--primary-foreground))" : "var(--text-muted)"};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .tl {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-primary);
  }
  .tp {
    font-size: 16px;
    font-weight: 900;
    color: hsl(var(--primary));
    margin-top: 1px;
  }
  .chk {
    position: absolute;
    top: 10px;
    right: 10px;
    color: hsl(var(--primary));
  }
  .dbdg {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 9px;
    font-weight: 800;
    background: hsl(var(--muted));
    color: var(--text-muted);
    padding: 2px 6px;
    border-radius: 5px;
    text-transform: uppercase;
  }
`;

/* ─────────────────────────────────────────── */
/* DATE CAROUSEL                               */
/* ─────────────────────────────────────────── */
const SecLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
`;

const DateScroll = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--card-border) transparent;
  &::-webkit-scrollbar {
    height: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--card-border);
    border-radius: 4px;
  }
`;

const DateChip = styled.button`
  flex: 0 0 66px;
  height: 84px;
  border-radius: 16px;
  border: 2px solid
    ${(p) => (p.$active ? "hsl(var(--primary))" : "var(--card-border)")};
  background: ${(p) => (p.$active ? "hsl(var(--primary))" : "var(--card-bg)")};
  box-shadow: ${(p) =>
    p.$active ? "0 6px 16px hsl(var(--primary)/.22)" : "none"};
  transform: ${(p) => (p.$active ? "translateY(-3px)" : "none")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover:not(:disabled) {
    border-color: hsl(var(--primary));
    background: ${(p) =>
      p.$active ? "hsl(var(--primary))" : "hsl(var(--primary)/.07)"};
    transform: translateY(-2px);
  }

  .dn {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    color: ${(p) => (p.$active ? "rgba(255,255,255,.8)" : "var(--text-muted)")};
  }
  .num {
    font-size: 19px;
    font-weight: 900;
    color: ${(p) => (p.$active ? "#fff" : "var(--text-primary)")};
  }
  .mo {
    font-size: 9px;
    font-weight: 600;
    color: ${(p) =>
      p.$active ? "rgba(255,255,255,.75)" : "var(--text-muted)"};
  }
  .dot {
    position: absolute;
    bottom: 7px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${(p) =>
      p.$active ? "rgba(255,255,255,.6)" : "hsl(var(--primary))"};
  }
`;

/* ─────────────────────────────────────────── */
/* TIME SLOTS                                  */
/* ─────────────────────────────────────────── */
const SlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(62px, 1fr));
  gap: 7px;
`;

const SlotSection = styled.div`
  margin-top: 18px;
  animation: ${fadeUp} 0.3s ease both;
`;

const Slot = styled.button`
  padding: 9px 4px;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  cursor: ${(p) => (p.$dis ? "not-allowed" : "pointer")};
  transition: all 0.18s;

  ${(p) =>
    p.$sel &&
    `
    background:hsl(var(--primary));
    color:hsl(var(--primary-foreground));
    border:2px solid hsl(var(--primary));
    box-shadow:0 4px 12px hsl(var(--primary)/.22);
    transform:scale(1.04);
  `}
  ${(p) =>
    !p.$sel &&
    !p.$dis &&
    `
    background:hsl(var(--secondary));
    color:hsl(var(--secondary-foreground));
    border:1.5px solid var(--card-border);
    &:hover { background:hsl(var(--primary)); color:hsl(var(--primary-foreground)); border-color:hsl(var(--primary)); }
  `}
  ${(p) =>
    p.$dis &&
    `
    background:var(--page-bg);
    color:var(--card-border);
    border:1.5px solid var(--card-border);
    text-decoration:line-through;
    opacity:.55;
  `}
`;

/* ─────────────────────────────────────────── */
/* NOTE / SUBMIT                               */
/* ─────────────────────────────────────────── */
const NoteBox = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  padding: 14px 15px;
  border-radius: 14px;
  border: 1.5px solid var(--card-border);
  background: var(--page-bg);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  resize: none;
  line-height: 1.5;
  transition: all 0.2s;
  &::placeholder {
    color: var(--text-muted);
  }
  &:focus {
    outline: none;
    border-color: hsl(var(--primary));
    background: var(--card-bg);
    box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
  }
`;

const CharCnt = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-align: right;
  margin-top: 5px;
`;

const ErrBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  background: hsl(0 84% 60%/0.09);
  border: 1.5px solid hsl(0 84% 60%/0.2);
  border-radius: 13px;
  font-size: 13px;
  font-weight: 600;
  color: hsl(0 84% 60%);
`;

const SubmitBtn = styled.button`
  width: 100%;
  height: 56px;
  border-radius: 18px;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  font-size: 15px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.22s;
  box-shadow: 0 6px 20px hsl(var(--primary) / 0.22);
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px hsl(var(--primary) / 0.3);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  .sp {
    animation: ${spin} 0.9s linear infinite;
  }
`;

/* ─────────────────────────────────────────── */
/* SIDEBAR CARDS                               */
/* ─────────────────────────────────────────── */
const SCard = styled.div`
  background: var(--card-bg);
  border: 1.5px solid var(--card-border);
  border-radius: 20px;
  padding: 20px 18px;
  overflow: hidden;
  @media (max-width: 480px) {
    padding: 16px 14px;
    border-radius: 16px;
  }
`;

const AvatarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  img {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    object-fit: cover;
    border: 2px solid var(--card-border);
    flex-shrink: 0;
  }
  .lbl {
    font-size: 9px;
    font-weight: 800;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .nm {
    font-size: 14px;
    font-weight: 900;
    color: var(--text-primary);
    margin: 2px 0;
  }
  .ct {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
  }
`;

const Hr = styled.div`
  height: 1px;
  background: var(--card-border);
  margin: 0 0 16px;
`;

const SLabel = styled.div`
  font-size: 9px;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 7px;
`;

const SelBox = styled.div`
  background: hsl(var(--primary) / 0.09);
  border: 1.5px solid hsl(var(--primary) / 0.2);
  border-radius: 12px;
  padding: 11px 13px;
  .sn {
    font-size: 13px;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 3px;
  }
  .sm {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 700;
    color: hsl(var(--primary));
  }
`;

const InfoLine = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 5px;
  svg {
    color: hsl(var(--primary));
    flex-shrink: 0;
  }
`;

const PricePill = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: hsl(var(--primary));
  border-radius: 14px;
  padding: 12px 16px;
  margin-top: 6px;
  .pl {
    font-size: 12px;
    font-weight: 800;
    color: hsl(var(--primary-foreground) / 0.8);
  }
  .pv {
    font-size: 22px;
    font-weight: 900;
    color: hsl(var(--primary-foreground));
    letter-spacing: -0.02em;
  }
`;

const HelpCard = styled.div`
  background: linear-gradient(135deg, hsl(153 50% 12%), hsl(153 45% 17%));
  border: 1.5px solid hsl(var(--primary) / 0.3);
  border-radius: 18px;
  padding: 20px 18px;
  svg {
    color: hsl(var(--primary));
    margin-bottom: 8px;
  }
  h4 {
    font-size: 14px;
    font-weight: 800;
    color: #fff;
    margin: 0 0 7px;
  }
  p {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.55);
    margin: 0 0 13px;
    line-height: 1.5;
  }
  button {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 800;
    color: hsl(var(--primary));
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: gap 0.18s;
    &:hover {
      gap: 8px;
    }
  }
`;

/* ─────────────────────────────────────────── */
/* LOADING / UNAUTHORIZED / SUCCESS            */
/* ─────────────────────────────────────────── */
const Overlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 65vh;
  gap: 18px;
  .ring {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    border: 4px solid hsl(var(--primary) / 0.15);
    border-top-color: hsl(var(--primary));
    animation: ${spin} 0.85s linear infinite;
  }
  p {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
`;

const Center = styled.div`
  max-width: 480px;
  margin: 60px auto 0;
  background: var(--card-bg);
  border: 1.5px solid var(--card-border);
  border-radius: 26px;
  padding: 44px 32px;
  text-align: center;
  animation: ${fadeUp} 0.45s ease both;
  @media (max-width: 540px) {
    padding: 30px 18px;
    margin-top: 30px;
  }

  .ico {
    width: 66px;
    height: 66px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 18px;
    &.err {
      background: hsl(0 84% 60%/0.12);
      color: hsl(0 84% 60%);
    }
    &.ok {
      background: hsl(var(--primary) / 0.12);
      color: hsl(var(--primary));
      animation: ${pulseAnim} 2s ease infinite;
    }
  }
  h1 {
    font-size: clamp(20px, 4vw, 26px);
    font-weight: 900;
    color: var(--text-primary);
    margin: 0 0 10px;
  }
  p {
    font-size: 14px;
    color: var(--text-muted);
    line-height: 1.6;
    margin: 0 0 22px;
    strong {
      color: var(--text-primary);
    }
  }
  .acts {
    display: flex;
    flex-direction: column;
    gap: 10px;
    @media (min-width: 400px) {
      flex-direction: row;
      justify-content: center;
    }
  }
`;

const Pill = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
  .it {
    display: flex;
    align-items: center;
    gap: 5px;
    background: hsl(var(--primary) / 0.11);
    color: hsl(var(--primary));
    padding: 5px 11px;
    border-radius: 9px;
    font-size: 11px;
    font-weight: 700;
  }
`;

const ABtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 20px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  ${(p) =>
    p.$out
      ? `background:transparent; border:2px solid var(--card-border); color:var(--text-primary);
       &:hover { border-color:hsl(var(--primary)); color:hsl(var(--primary)); }`
      : `background:hsl(var(--primary)); border:2px solid hsl(var(--primary));
       color:hsl(var(--primary-foreground));
       box-shadow:0 5px 14px hsl(var(--primary)/.2);
       &:hover { transform:translateY(-1px); box-shadow:0 9px 22px hsl(var(--primary)/.28); }`}
`;

const ErrMsg = styled.span`
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: hsl(0 84% 60%);
  margin-top: 5px;
`;

const Empty = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 15px;
  background: ${(p) => (p.$warn ? "hsl(45 100% 95%)" : "var(--page-bg)")};
  border: 1.5px solid
    ${(p) => (p.$warn ? "hsl(45 100% 82%)" : "var(--card-border)")};
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: ${(p) => (p.$warn ? "hsl(30 80% 38%)" : "var(--text-muted)")};
  .dark & {
    background: ${(p) => (p.$warn ? "hsl(45 40% 18%)" : "var(--page-bg)")};
    border-color: ${(p) =>
      p.$warn ? "hsl(45 40% 28%)" : "var(--card-border)"};
    color: ${(p) => (p.$warn ? "hsl(45 80% 58%)" : "var(--text-muted)")};
  }
`;

/* ═══════════════════════════════════════════ */
/* COMPONENT                                   */
/* ═══════════════════════════════════════════ */
export default function NewBooking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tutorId = searchParams.get("tutorId");
  const { user } = useAuth();

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [lessonRates, setLessonRates] = useState([]);
  const [selectedLessonRate, setSelectedLessonRate] = useState(null);
  const [selectedLessonType, setSelectedLessonType] = useState("online");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedTime, setSelectedTime] = useState("");
  const [studentNote, setStudentNote] = useState("");
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [dateError, setDateError] = useState("");

  const daysEn = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const daysList = (() => {
    const arr = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      arr.push({
        dateString: [
          d.getFullYear(),
          String(d.getMonth() + 1).padStart(2, "0"),
          String(d.getDate()).padStart(2, "0"),
        ].join("-"),
        dayName: d.toLocaleDateString("tr-TR", { weekday: "short" }),
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString("tr-TR", { month: "short" }),
        isToday: i === 0,
      });
    }
    return arr;
  })();

  /* ── Load tutor ── */
  useEffect(() => {
    if (!tutorId) {
      navigate("/tutors");
      return;
    }
    (async () => {
      try {
        const data = await getTutorById(tutorId);
        setTutor(data);
        let rates = [];
        const m = (data.bio || "").match(
          /---LESSON_RATES_JSON---([\s\S]*?)---END_LESSON_RATES_JSON---/,
        );
        if (m) {
          try {
            rates = JSON.parse(m[1].trim());
          } catch {}
        }
        if (!rates.length)
          rates = data.lessonRates?.$values || data.lessonRates || [];

        // Backend'den gelen düz yapıyı ve eski bio JSON yapısını gruplanmış arayüz nesnelerine çevirelim
        const grouped = [];
        rates.forEach(r => {
          const subName = r.subjectName || r.title || "Ders";
          const existing = grouped.find(g => g.subjectName?.toLowerCase() === subName?.toLowerCase());
          
          let onPrice = r.onlinePrice || 0;
          let ipPrice = r.inPersonPrice || 0;
          let onId = r.onlineId || null;
          let ipId = r.inPersonId || null;

          if (r.serviceType === "Online") {
            onPrice = r.price;
            onId = r.id;
          } else if (["facetoface", "face_to_face", "f2f", "yüzyüze", "yüz yüze"].includes(r.serviceType?.toLowerCase())) {
            ipPrice = r.price;
            ipId = r.id;
          } else if (r.price) {
            onPrice = r.price;
            ipPrice = r.price;
          }

          if (existing) {
            if (onPrice) {
              existing.onlinePrice = onPrice;
              existing.onlineId = onId || existing.onlineId;
            }
            if (ipPrice) {
              existing.inPersonPrice = ipPrice;
              existing.inPersonId = ipId || existing.inPersonId;
            }
          } else {
            grouped.push({
              title: subName,
              subjectName: subName,
              duration: r.durationMinutes || r.duration || 60,
              onlinePrice: onPrice,
              inPersonPrice: ipPrice,
              onlineId: onId,
              inPersonId: ipId,
            });
          }
        });

        setLessonRates(grouped);
        if (grouped.length) {
          const r = grouped[0];
          setSelectedLessonRate(r);
          setSelectedLessonType(
            r.onlinePrice
              ? "online"
              : r.inPersonPrice
                ? "inperson"
                : "online"
          );
        }
        if (data.listings?.length) setSelectedListing(data.listings[0]);
      } catch {
        setError("Eğitmen bilgileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    })();
  }, [tutorId]);

  /* ── Occupied slots ── */
  useEffect(() => {
    if (!selectedListing || !selectedDate) return;
    if (isNaN(parseInt(selectedDate.split("-")[0], 10))) return;
    (async () => {
      try {
        const from = `${selectedDate}T00:00:00Z`,
          to = `${selectedDate}T23:59:59Z`;
        const res = await apiFetch(
          `/api/bookings/occupied?teacherListingId=${selectedListing.id}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        );
        if (res?.ok) {
          const d = await res.json();
          setOccupiedSlots(d.$values || d || []);
        }
      } catch {}
    })();
  }, [selectedListing, selectedDate]);

  const getDayAvails = (dateStr) => {
    const dayIdx = new Date(dateStr).getDay();
    const targetDays = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const targetDaysTr = [
      "pazar",
      "pazartesi",
      "salı",
      "çarşamba",
      "perşembe",
      "cuma",
      "cumartesi",
    ];

    const enDay = targetDays[dayIdx];
    const trDay = targetDaysTr[dayIdx];

    const avList =
      tutor?.availability?.$values ||
      tutor?.availability ||
      tutor?.availabilities?.$values ||
      tutor?.availabilities ||
      [];

    return avList.filter((x) => {
      const ad = x.day?.trim().toLowerCase();
      return ad === enDay || ad === trDay;
    });
  };

  const isTypeDis = (type) => {
    if (!selectedDate || !tutor) return false;
    const avs = getDayAvails(selectedDate);
    if (!avs.length) return false;
    if (type === "online")
      return avs.every((x) =>
        ["inperson", "face_to_face", "f2f"].includes(x.type),
      );
    if (type === "inperson") return avs.every((x) => x.type === "online");
    return false;
  };

  const handleDateChange = (v) => {
    setSelectedDate(v);
    setSelectedTime("");
    const today = new Date().toISOString().split("T")[0];
    if (v < today) {
      setDateError("Geçmiş tarih seçemezsiniz.");
      return;
    }
    setDateError("");
    if (tutor) {
      const avs = getDayAvails(v);
      if (avs.length) {
        if (avs.every((x) => x.type === "online"))
          setSelectedLessonType("online");
        else if (
          avs.every((x) => ["inperson", "face_to_face", "f2f"].includes(x.type))
        )
          setSelectedLessonType("inperson");
      }
    }
  };

  const handleRateChange = (r) => {
    setSelectedLessonRate(r);
    setSelectedTime("");
    setSelectedLessonType(
      r.onlinePrice
        ? "online"
        : r.inPersonPrice
          ? "inperson"
          : r.type || "online",
    );
  };

  const timeSlots = (() => {
    if (!selectedDate || !tutor || !selectedLessonRate) return [];
    const avs = getDayAvails(selectedDate);
    if (!avs.length) return [];
    const duration = selectedLessonRate.duration || 60;
    const raw = [];
    avs.forEach((av) => {
      if (!av.start || !av.end) return;
      const [sh, sm] = av.start.split(":").map(Number);
      const [eh, em] = av.end.split(":").map(Number);
      let cur = new Date(selectedDate);
      cur.setHours(sh, sm, 0, 0);
      const lim = new Date(selectedDate);
      lim.setHours(eh, em, 0, 0);
      while (cur.getTime() + duration * 60000 <= lim.getTime()) {
        const t = cur.toTimeString().slice(0, 5);
        const st = new Date(`${selectedDate}T${t}`);
        const en = new Date(st.getTime() + duration * 60000);
        raw.push({
          time: t,
          isPast: st < new Date(),
          isOccupied: occupiedSlots.some(
            (s) => st < new Date(s.endTime) && en > new Date(s.startTime),
          ),
        });
        cur = new Date(cur.getTime() + 30 * 60000);
      }
    });
    return [...new Map(raw.map((x) => [x.time, x])).values()].sort((a, b) =>
      a.time.localeCompare(b.time),
    );
  })();

  const getActualLessonRate = () => {
    if (!selectedLessonRate || !tutor) return null;
    const rates = tutor.lessonRates?.$values || tutor.lessonRates || [];
    
    // subjectName'e göre eşleştir
    const subName = selectedLessonRate.subjectName || selectedLessonRate.title;
    const targetType = selectedLessonType === "online" ? "Online" : "FaceToFace";
    
    return rates.find(
      r => r.subjectName?.toLowerCase() === subName?.toLowerCase() &&
           (r.serviceType === targetType || (targetType === "FaceToFace" && r.serviceType === "Face_to_face"))
    ) || rates.find(r => r.subjectName?.toLowerCase() === subName?.toLowerCase()) || null;
  };

  const getPrice = () => {
    if (!selectedLessonRate) return 0;
    return selectedLessonType === "online"
      ? selectedLessonRate.onlinePrice || selectedLessonRate.price || 0
      : selectedLessonRate.inPersonPrice || selectedLessonRate.price || 0;
  };

  const handleSubmit = async () => {
    if (
      !selectedListing ||
      !selectedDate ||
      !selectedTime ||
      !selectedLessonRate ||
      dateError
    )
      return;
    setSubmitting(true);
    setError(null);
    try {
      const start = new Date(`${selectedDate}T${selectedTime}`);
      const actualRate = getActualLessonRate();
      
      const duration =
        actualRate?.durationMinutes || actualRate?.duration || selectedListing?.lessonDuration || 60;
      const end = new Date(start.getTime() + duration * 60000);
      
      const payload = {
        teacherListingId: selectedListing.id,
        lessonRateId: actualRate?.id || null,
        requestedServiceType: selectedLessonType === "online" ? "Online" : "FaceToFace",
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        studentNote: studentNote.trim(),
        source: "Site",
      };

      await createBooking(payload);
      setSuccess(true);
    } catch (e) {
      setError(e.message || "Rezervasyon oluşturulurken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const isStudent = user?.role?.toLowerCase() === "student";
  const hasBothTypes = true;
  const stepLessonType = 2; // Ders tipi her zaman 2. adım olsun
  const stepNote = 4; // Not adımı da 4. adım olsun (Tarih ve Saat 3. adım)

  /* ── LOADING ── */
  if (loading)
    return (
      <Wrap>
        <Inner>
          <Overlay>
            <div className="ring" />
            <p>Rezervasyon Hazırlanıyor…</p>
          </Overlay>
        </Inner>
      </Wrap>
    );

  /* ── UNAUTHORIZED ── */
  if (!isStudent)
    return (
      <Wrap>
        <Inner>
          <Center>
            <div className="ico err">
              <AlertCircle size={30} />
            </div>
            <h1>Yetkisiz Erişim</h1>
            <p>
              Bu sayfaya yalnızca <strong>öğrenci hesabı</strong> ile
              erişebilirsiniz.
            </p>
            <div className="acts">
              <ABtn onClick={() => navigate("/tutors")}>
                <Zap size={14} /> Eğitmenleri Listele
              </ABtn>
              <ABtn $out onClick={() => navigate("/")}>
                Ana Sayfaya Dön
              </ABtn>
            </div>
          </Center>
        </Inner>
      </Wrap>
    );

  /* ── SUCCESS ── */
  if (success)
    return (
      <Wrap>
        <Inner>
          <Center>
            <div className="ico ok">
              <CheckCircle2 size={30} />
            </div>
            <h1>Talebiniz İletildi 🎉</h1>
            <p>
              Ders talebiniz <strong>{tutor.teacherName}</strong> hocamıza
              başarıyla gönderildi.
            </p>
            <Pill>
              <div className="it">
                <CalendarIcon size={12} />
                {selectedDate}
              </div>
              <div className="it">
                <Clock size={12} />
                {selectedTime}
              </div>
              <div className="it">
                <BookOpen size={12} />
                {selectedLessonRate?.title}
              </div>
            </Pill>
            <div className="acts">
              <ABtn onClick={() => navigate("/student/lessons")}>
                <Zap size={14} />
                Derslerime Git
              </ABtn>
              <ABtn
                $out
                onClick={() => {
                  const id = tutor?.tutorUserId || tutor?.teacherUserId;
                  if (id) navigate(`/student/messages?userId=${id}`);
                  else toast.error("Öğretmen bilgisi bulunamadı.");
                }}
              >
                <MessageSquare size={14} />
                Hocaya Mesaj
              </ABtn>
            </div>
          </Center>
        </Inner>
      </Wrap>
    );

  /* ── MAIN ── */
  return (
    <Wrap>
      <Inner>
        {/* Header */}
        <TopBar>
          <BackBtn onClick={() => navigate(-1)}>
            <ChevronLeft size={20} />
          </BackBtn>
          <div>
            <h1>Ders Rezervasyonu</h1>
            <p>Hocanızla ders saatinizi planlayın</p>
          </div>
        </TopBar>

        <Grid>
          {/* ── FORM ── */}
          <FormCol>
            {/* 1. Ders Seçimi */}
            <Card>
              <CardHead>
                <Num>1</Num>
                <CardTitle>Ders Seçin</CardTitle>
              </CardHead>
              {lessonRates.length === 0 ? (
                <Empty>
                  <AlertCircle size={16} />
                  Bu eğitmen için ders bilgisi bulunamadı.
                </Empty>
              ) : (
                <LessonGrid>
                  {lessonRates.map((r, i) => (
                    <LessonCard
                      key={i}
                      $active={selectedLessonRate?.title === r.title}
                      onClick={() => handleRateChange(r)}
                      type="button"
                    >
                      <div className="ic">
                        <BookOpen size={17} />
                      </div>
                      {selectedLessonRate?.title === r.title && (
                        <div className="chk">
                          <CheckCircle2 size={15} />
                        </div>
                      )}
                      <div className="name">{r.title}</div>
                      <div className="meta">
                        {r.duration} dk
                        {tutor?.category && ` · ${tutor.category}`}
                      </div>
                      <div className="badges">
                        {r.onlinePrice > 0 && (
                          <span className="bdg on">
                            <Monitor size={9} />₺{r.onlinePrice}
                          </span>
                        )}
                        {r.inPersonPrice > 0 && (
                          <span className="bdg ip">
                            <HomeIcon size={9} />₺{r.inPersonPrice}
                          </span>
                        )}
                        {!(r.onlinePrice > 0) && !(r.inPersonPrice > 0) && r.price > 0 && (
                          <span className="bdg gn">₺{r.price}</span>
                        )}
                      </div>
                    </LessonCard>
                  ))}
                </LessonGrid>
              )}
            </Card>

            {/* Haftalık Takvim */}
            <Card>
              <CardHead>
                <Num $ghost>✓</Num>
                <CardTitle>Haftalık Ders Takvimi</CardTitle>
              </CardHead>
              <LegendRow>
                {[
                  ["on", Monitor, "Online"],
                  ["ip", HomeIcon, "Yüz Yüze"],
                  ["bt", Globe, "Her İkisi"],
                  ["em", null, "Müsait Değil"],
                ].map(([cls, Icon, lbl]) => (
                  <div key={cls} className="leg">
                    <div className={`dot ${cls}`}>
                      {Icon && <Icon size={9} />}
                    </div>
                    <span>{lbl}</span>
                  </div>
                ))}
              </LegendRow>
              <SchedWrap>
                <table>
                  <thead>
                    <tr>
                      <th className="cor">Saatler</th>
                      {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(
                        (d) => (
                          <th key={d}>{d}</th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {["Sabah", "Öğle", "Öğleden Sonra", "Akşam"].map((slot) => (
                      <tr key={slot}>
                        <td className="lbl">
                          {slot === "Sabah"
                            ? "Sabah (... - 12.00)"
                            : slot === "Öğle"
                            ? "Öğle (12.00 - 16.00)"
                            : slot === "Öğleden Sonra"
                            ? "Öğleden Sonra (16.00 - 20.00)"
                            : "Akşam (20.00 - ...)"}
                        </td>
                        {[0, 1, 2, 3, 4, 5, 6].map((di) => {
                          const avList =
                            tutor.availability?.$values ||
                            tutor.availability ||
                            tutor.availabilities?.$values ||
                            tutor.availabilities ||
                            [];
                          const en7 = [
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                            "sunday",
                          ];
                          const tr7 = [
                            "pazartesi",
                            "salı",
                            "çarşamba",
                            "perşembe",
                            "cuma",
                            "cumartesi",
                            "pazar",
                          ];
                          const av = avList.find((a) => {
                            const ad = a.day.trim().toLowerCase();
                            if (ad !== en7[di] && ad !== tr7[di]) return false;
                            const h = parseInt(a.start.split(":")[0]);
                            if (slot === "Sabah" && h >= 6 && h < 12)
                              return true;
                            if (slot === "Öğle" && h >= 12 && h < 15)
                              return true;
                            if (slot === "Öğleden Sonra" && h >= 15 && h < 18)
                              return true;
                            if (slot === "Akşam" && h >= 18 && h <= 23)
                              return true;
                            return false;
                          });
                          let cls = "em",
                            Icon = null;
                          if (av) {
                            const t = av.type || tutor.serviceType;
                            if (
                              [
                                "both",
                                "Both",
                                3,
                                "OnlineAndFaceToFace",
                              ].includes(t)
                            ) {
                              cls = "bt";
                              Icon = Globe;
                            } else if (
                              ["online", "Online", 1, "OnlineOnly"].includes(t)
                            ) {
                              cls = "on";
                              Icon = Monitor;
                            } else {
                              cls = "ip";
                              Icon = HomeIcon;
                            }
                          }
                          return (
                            <td key={di}>
                              <div className={`cell ${cls}`}>
                                {Icon && <Icon size={9} />}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </SchedWrap>
            </Card>

            {/* 2. Ders Tipi */}
            {hasBothTypes && (
              <Card>
                <CardHead>
                  <Num>2</Num>
                  <CardTitle>Ders Alma Tipi</CardTitle>
                </CardHead>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    margin: "0 0 14px",
                  }}
                >
                  Online mı yoksa yüz yüze mi almak istersiniz?
                </p>
                <TypeRow>
                  {[
                    {
                      key: "online",
                      Icon: Monitor,
                      lbl: "Uzaktan / Online",
                      price: selectedLessonRate.onlinePrice,
                    },
                    {
                      key: "inperson",
                      Icon: HomeIcon,
                      lbl: "Yüz Yüze",
                      price: selectedLessonRate.inPersonPrice,
                    },
                  ].map(({ key, Icon, lbl, price }) => {
                    const hasPrice = !!price;
                    const dis = isTypeDis(key) || !hasPrice;
                    return (
                      <TypeBtn
                        key={key}
                        type="button"
                        $active={selectedLessonType === key}
                        $dis={dis}
                        disabled={dis}
                        onClick={() => {
                          if (!dis) setSelectedLessonType(key);
                        }}
                      >
                        <div className="ti">
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="tl">{lbl}</div>
                          <div className="tp">{hasPrice ? `₺${price}` : "Seçilemez"}</div>
                        </div>
                        {selectedLessonType === key && !dis && (
                          <CheckCircle2 size={16} className="chk" />
                        )}
                        {dis && (
                          <span className="dbdg">
                            {!hasPrice ? "Seçilemez" : "Bu gün yok"}
                          </span>
                        )}
                      </TypeBtn>
                    );
                  })}
                </TypeRow>
              </Card>
            )}

            {/* 3. Tarih & Saat */}
            <Card>
              <CardHead>
                <Num>3</Num>
                <CardTitle>Tarih ve Saat Seçin</CardTitle>
              </CardHead>

              <SecLabel>
                <CalendarIcon size={12} />
                Önümüzdeki 14 Gün
              </SecLabel>
              <DateScroll>
                {daysList.map((d, i) => (
                  <DateChip
                    key={i}
                    type="button"
                    $active={selectedDate === d.dateString}
                    onClick={() => handleDateChange(d.dateString)}
                  >
                    <span className="dn">{d.dayName}</span>
                    <span className="num">{d.dayNumber}</span>
                    <span className="mo">{d.monthName}</span>
                    {d.isToday && <span className="dot" />}
                  </DateChip>
                ))}
              </DateScroll>
              {dateError && <ErrMsg>{dateError}</ErrMsg>}

              {selectedDate && !dateError && (
                <SlotSection>
                  <SecLabel style={{ marginTop: 0 }}>
                    <Clock size={12} />
                    Müsait Saatler
                  </SecLabel>
                  {timeSlots.length > 0 ? (
                    <SlotGrid>
                      {timeSlots.map((s, i) => (
                        <Slot
                          key={i}
                          type="button"
                          $sel={selectedTime === s.time}
                          $dis={s.isPast || s.isOccupied}
                          disabled={s.isPast || s.isOccupied}
                          onClick={() => {
                            if (!s.isPast && !s.isOccupied)
                              setSelectedTime(s.time);
                          }}
                        >
                          {s.time}
                        </Slot>
                      ))}
                    </SlotGrid>
                  ) : (
                    <Empty $warn>
                      <AlertCircle size={15} />
                      Bu günde müsait saat bulunmamaktadır.
                    </Empty>
                  )}
                </SlotSection>
              )}
            </Card>

            {/* 4. Not */}
            <Card>
              <CardHead>
                <Num>{stepNote}</Num>
                <CardTitle>Hocaya Not (Opsiyonel)</CardTitle>
              </CardHead>
              <NoteBox
                rows={4}
                placeholder="Ders hakkında sormak istediğiniz detayları yazın..."
                value={studentNote}
                onChange={(e) => setStudentNote(e.target.value)}
                maxLength={500}
              />
              <CharCnt>{studentNote.length}/500</CharCnt>
            </Card>

            {error && (
              <ErrBanner>
                <AlertCircle size={17} />
                <span>{error}</span>
              </ErrBanner>
            )}

            <SubmitBtn
              type="button"
              onClick={handleSubmit}
              disabled={
                submitting ||
                !selectedListing ||
                !selectedDate ||
                !selectedTime ||
                !selectedLessonRate
              }
            >
              {submitting ? (
                <Loader2 size={20} className="sp" />
              ) : (
                <>
                  <Zap size={18} />
                  Rezervasyonu Onaya Gönder
                </>
              )}
            </SubmitBtn>
          </FormCol>

          {/* ── SIDEBAR ── */}
          <Sidebar>
            <SCard>
              <AvatarRow>
                <img
                  src={
                    tutor.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.teacherName)}&background=16a34a&color=fff`
                  }
                  alt={tutor.teacherName}
                />
                <div>
                  <div className="lbl">Eğitmen</div>
                  <div className="nm">{tutor.teacherName}</div>
                  {tutor.category && (
                    <div className="ct">
                      <BookOpen size={10} />
                      {tutor.category}
                    </div>
                  )}
                </div>
              </AvatarRow>
              <Hr />

              <SLabel>Seçilen Ders</SLabel>
              {selectedLessonRate ? (
                <SelBox>
                  <div className="sn">{selectedLessonRate.title}</div>
                  <div className="sm">
                    {selectedLessonType === "online" ? (
                      <>
                        <Monitor size={11} />
                        Online
                      </>
                    ) : (
                      <>
                        <HomeIcon size={11} />
                        Yüz Yüze
                      </>
                    )}
                    <span>
                      ·{" "}
                      {selectedListing?.lessonDuration ||
                        selectedLessonRate?.duration ||
                        60}{" "}
                      Dk
                    </span>
                  </div>
                </SelBox>
              ) : (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                  }}
                >
                  Henüz seçilmedi
                </p>
              )}

              <SLabel style={{ marginTop: 16 }}>Tarih & Saat</SLabel>
              <InfoLine>
                <CalendarIcon size={13} />
                {selectedDate || "—"}
              </InfoLine>
              <InfoLine>
                <Clock size={13} />
                {selectedTime || "—"}
              </InfoLine>

              <PricePill>
                <span className="pl">Toplam Ücret</span>
                <span className="pv">₺{getPrice()}</span>
              </PricePill>
            </SCard>

            <HelpCard>
              <MessageSquare size={18} />
              <h4>Yardıma mı ihtiyacınız var?</h4>
              <p>
                Rezervasyon süreci hakkında sorularınız için destek merkezimize
                başvurabilirsiniz.
              </p>
              <button onClick={() => navigate("/student/support")}>
                Yardım merkezine git <ArrowRight size={13} />
              </button>
            </HelpCard>
          </Sidebar>
        </Grid>
      </Inner>
    </Wrap>
  );
}
