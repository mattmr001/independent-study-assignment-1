// ABOUTME: Tests for result card display component
// ABOUTME: Verifies matched cards shown as checklist, unmatched flagged

import { render } from '@testing-library/react-native';
import { ResultCard } from './index';

describe('ResultCard', () => {
  it('renders matched cards as a checklist', () => {
    const matched = [
      { referenceText: 'To be free from pain', extractedText: 'To be free from pain' },
      { referenceText: 'Wild Card', extractedText: 'wild card' },
    ];
    const { getByText } = render(<ResultCard matched={matched} unmatched={[]} />);

    expect(getByText('To be free from pain')).toBeTruthy();
    expect(getByText('Wild Card')).toBeTruthy();
  });

  it('flags unmatched extractions for review', () => {
    const { getByText } = render(
      <ResultCard matched={[]} unmatched={['garbled text from OCR']} />,
    );
    expect(getByText('[!] garbled text from OCR')).toBeTruthy();
    expect(getByText(/Needs Review/i)).toBeTruthy();
  });

  it('shows match count', () => {
    const matched = [
      { referenceText: 'To pray', extractedText: 'To pray' },
    ];
    const { getByText } = render(<ResultCard matched={matched} unmatched={['junk']} />);
    expect(getByText(/1 matched/i)).toBeTruthy();
    expect(getByText(/1 unmatched/i)).toBeTruthy();
  });
});
