// ABOUTME: Storybook stories for ResultCard
// ABOUTME: Shows matched/unmatched card states

import type { Meta, StoryObj } from '@storybook/react-native';
import { ResultCard } from './index';

const meta: Meta<typeof ResultCard> = {
  title: 'ResultCard',
  component: ResultCard,
};

export default meta;

type Story = StoryObj<typeof ResultCard>;

export const AllMatched: Story = {
  args: {
    matched: [
      { referenceText: 'To be free from pain', extractedText: 'To be free from pain' },
      { referenceText: 'Wild Card', extractedText: 'wild card' },
      { referenceText: 'To pray', extractedText: 'To pray' },
      { referenceText: 'To maintain my dignity', extractedText: 'to maintain my dignity' },
    ],
    unmatched: [],
  },
};

export const WithUnmatched: Story = {
  args: {
    matched: [
      { referenceText: 'To pray', extractedText: 'To pray' },
      { referenceText: 'To be mentally aware', extractedText: 'to be mentally aware' },
    ],
    unmatched: ['garbled text from OCR', 'another extraction that did not match'],
  },
};

export const AllUnmatched: Story = {
  args: {
    matched: [],
    unmatched: ['unrecognized text 1', 'unrecognized text 2', 'unrecognized text 3'],
  },
};

export const Empty: Story = {
  args: {
    matched: [],
    unmatched: [],
  },
};
