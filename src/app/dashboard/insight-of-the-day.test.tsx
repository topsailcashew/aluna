import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InsightOfTheDay } from './insight-of-the-day';

describe('InsightOfTheDay', () => {
  it('renders the card with a title', () => {
    render(<InsightOfTheDay />);
    
    // Check for the title
    expect(screen.getByText('Insight for Today')).toBeInTheDocument();
  });

  it('renders a blockquote element for the insight', () => {
    render(<InsightOfTheDay />);
    
    // Check that a blockquote exists, which contains the insight
    const blockquote = screen.getByRole('blockquote');
    expect(blockquote).toBeInTheDocument();
    
    // Ensure the blockquote is not empty
    expect(blockquote.textContent).not.toBe('');
  });
});
