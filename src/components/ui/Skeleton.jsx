import React from "react";
import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const SkeletonWrapper = styled.div`
  display: inline-block;
  height: ${(props) => props.$height || "1em"};
  width: ${(props) => props.$width || "100%"};
  border-radius: ${(props) => props.$borderRadius || "8px"};
  background: #f1f5f9;
  background-image: linear-gradient(
    90deg,
    #f1f5f9 0px,
    #f8fafc 40px,
    #f1f5f9 80px
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite linear;
`;

export function Skeleton({ className, width, height, borderRadius, style }) {
  return (
    <SkeletonWrapper
      className={className}
      $width={width}
      $height={height}
      $borderRadius={borderRadius}
      style={style}
    />
  );
}
