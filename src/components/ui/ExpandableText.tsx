'use client';

import { useState } from 'react';

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  expandLabel?: string;
  collapseLabel?: string;
}

export function ExpandableText({
  text,
  maxLength = 150,
  className = '',
  expandLabel = 'Read more',
  collapseLabel = 'Show less'
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // If text is shorter than maxLength, no need for expansion
  if (!text || text.length <= maxLength) {
    return (
      <div className={className}>
        {text}
      </div>
    );
  }

  // Find word boundary for clean truncation
  const findTruncationPoint = (str: string, maxLen: number): number => {
    if (str.length <= maxLen) return str.length;
    
    // Find the last space before maxLength
    let truncateAt = maxLen;
    while (truncateAt > 0 && str[truncateAt] !== ' ') {
      truncateAt--;
    }
    
    // If no space found in reasonable range, just cut at maxLength
    if (truncateAt < maxLen * 0.8) {
      truncateAt = maxLen;
    }
    
    return truncateAt;
  };

  const truncationPoint = findTruncationPoint(text, maxLength);
  const truncatedText = text.substring(0, truncationPoint);
  const remainingText = text.substring(truncationPoint);

  return (
    <div className={`${className} transition-all duration-300 ease-in-out`}>
      <div className="relative">
        {/* Always show truncated text */}
        <span>{truncatedText}</span>
        
        {/* Show remaining text when expanded */}
        {isExpanded && (
          <span className="transition-opacity duration-300 ease-in-out">
            {remainingText}
          </span>
        )}
        
        {/* Show ellipsis when truncated */}
        {!isExpanded && (
          <span className="text-gray-400">...</span>
        )}
      </div>
      
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-2 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? collapseLabel : expandLabel}
      >
        {isExpanded ? collapseLabel : expandLabel}
      </button>
    </div>
  );
}